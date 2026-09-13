/* ============================================================
   دیجی‌پوش — اتصال نظارت مدیر به فرم پروفایل
   ------------------------------------------------------------
   این فایل تابع `DPStore.auth.updateProfile` را می‌پوشاند.
   به‌جای اینکه تغییر مستقیم روی فروشگاه بنشیند، به کارتابل
   مدیر می‌رود.

   چرا اینجا؟ چون همه‌ی فرم‌های پروفایل — نام، لوگو، سربرگ،
   نشانی — از همین یک تابع رد می‌شوند. یک نقطه، همه‌جا.

   فروشنده بی‌درنگ می‌بیند که «در انتظار تأیید» است و
   می‌تواند درخواستش را پس بگیرد.
   ============================================================ */
'use strict';

(function () {
  if (!window.DPStore || !window.DPModeration) return;
  if (DPStore.__modHooked) return;
  DPStore.__modHooked = true;

  var M = window.DPModeration;
  var original = DPStore.auth.updateProfile.bind(DPStore.auth);

  /* ============================================================
     پوشاندن updateProfile
     ============================================================ */
  DPStore.auth.updateProfile = async function (patch) {
    var me = await DPStore.auth.me();
    if (!me) throw new Error('ابتدا وارد شوید.');

    /* فروشگاه هنوز تأیید نشده؟ تغییرها آزادانه ثبت می‌شوند،
       چون کل پرونده در حال بررسی است. */
    if ((me.status || 'pending') !== 'approved') {
      return original(patch);
    }

    var res = M.submit(me.id, patch);

    /* چیزی برای بررسی نبود — همه بی‌درنگ ثبت شد */
    if (!res.queued.length) return true;

    render();

    /* پیام به فروشنده */
    var msg = 'تغییر «' + res.queued.join('، ') + '» برای تأیید مدیر فرستاده شد.';
    if (window.dpToast) dpToast(msg, 'success');

    /* استثنا نمی‌اندازیم تا فرم عادی رفتار کند */
    return true;
  };

  /* ============================================================
     نوار وضعیت بالای صفحه‌ی پروفایل
     ============================================================ */
  var SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  var I = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',
    x:     '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    ok:    '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4L15.5 10"/>',
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  async function render() {
    var host = document.getElementById('storeForm');
    if (!host) return;                       // این صفحه پروفایل نیست

    var me = await DPStore.auth.me();
    if (!me) return;

    /* نوار قبلی برداشته می‌شود */
    document.querySelectorAll('.mod-banner').forEach(function (n) { n.remove(); });

    var box = host.closest('.card') || host.parentElement;
    var list = M.mine(me.id);
    var open = list.find(function (r) { return r.status === 'pending'; });

    /* ---------- در انتظار بررسی ---------- */
    if (open) {
      var names = Object.keys(open.fields).map(function (k) {
        return (M.WATCHED[k] || { fa: k }).fa;
      });
      var b = document.createElement('div');
      b.className = 'mod-banner';
      b.innerHTML =
        '<svg ' + SVG + '>' + I.clock + '</svg>' +
        '<span><b>در انتظار تأیید مدیر</b>' +
          '<div class="mod-list">' + esc(names.join('، ')) +
          ' — تا زمان تأیید، نسخه‌ی قبلی روی سایت می‌ماند.</div></span>' +
        '<button type="button" data-mod-undo="' + esc(open.id) + '">پس گرفتن</button>';
      box.insertBefore(b, box.firstChild);
      return;
    }

    /* ---------- تازه‌ترین پاسخ مدیر ---------- */
    var last = list[0];
    if (!last || last.seen) return;

    var el = document.createElement('div');

    if (last.status === 'rejected') {
      el.className = 'mod-banner is-bad';
      el.innerHTML =
        '<svg ' + SVG + '>' + I.x + '</svg>' +
        '<span><b>تغییر شما پذیرفته نشد</b>' +
          '<div class="mod-list">' + esc(last.reason) + '</div></span>' +
        '<button type="button" data-mod-seen="' + esc(last.id) + '">متوجه شدم</button>';
    } else if (last.status === 'approved') {
      el.className = 'mod-banner is-ok';
      el.innerHTML =
        '<svg ' + SVG + '>' + I.ok + '</svg>' +
        '<span><b>تغییر شما تأیید شد</b>' +
          '<div class="mod-list">' + esc((last.applied || []).join('، ')) +
          ' — روی فروشگاه نشست.</div></span>' +
        '<button type="button" data-mod-seen="' + esc(last.id) + '">بستن</button>';
    } else {
      return;
    }

    box.insertBefore(el, box.firstChild);
  }

  /* ============================================================
     دکمه‌ها
     ============================================================ */
  document.addEventListener('click', async function (e) {
    var undo = e.target.closest('[data-mod-undo]');
    if (undo) {
      var me = await DPStore.auth.me();
      try {
        M.withdraw(undo.dataset.modUndo, me.id);
        if (window.dpToast) dpToast('درخواست پس گرفته شد.', 'success');
        if (window.dpRefresh) await dpRefresh();
        render();
      } catch (err) {
        if (window.dpToast) dpToast(err.message, 'error');
      }
      return;
    }

    var seen = e.target.closest('[data-mod-seen]');
    if (seen) {
      /* نشان می‌زنیم که دیده شده تا دوباره نیاید */
      try {
        var all = (function(){var _v;try{_v=JSON.parse(localStorage.getItem('dp_profile_requests'));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})();
        var r = all.find(function (x) { return x.id === seen.dataset.modSeen; });
        if (r) { r.seen = true; localStorage.setItem('dp_profile_requests', JSON.stringify(all)); }
      } catch (err) { /* بی‌اهمیت */ }
      seen.closest('.mod-banner').remove();
    }
  });

  document.addEventListener('dp:moderation', render);

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', render, { once: true })
    : render();

  window.DPModHook = { render: render };
})();
