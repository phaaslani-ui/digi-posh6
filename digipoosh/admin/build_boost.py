# -*- coding: utf-8 -*-
"""سازنده‌ی دو صفحه‌ی تازه‌ی پنل مدیریت:
   ۱. بازبینی پروفایل   — تأیید یا رد تغییرهای فروشندگان
   ۲. نردبان و ارتقا    — تأیید پرداخت، هدیه، توقف
"""
import pathlib, re, types

D = pathlib.Path(__file__).parent

# تعریف‌های build.py بدون اجرای ساخت صفحه‌ها
_src = (D / 'build.py').read_text(encoding='utf-8')
_cut = _src.index('# ============================================================\n# ۱. ورود')
BA = types.ModuleType('ba')
BA.__dict__['__file__'] = str(D / 'build.py')
exec(compile(_src[:_cut], 'admin_defs', 'exec'), BA.__dict__)

ico = BA.ico

BA.ICONS.update({
    'rocket': '<path d="M13.5 3.5c3 0 6 3 6 6 0 4.5-5 8-5 8l-4-4s3.5-5 8-5"/><path d="M9.5 14.5 6 18l-1.5-1.5L8 13"/><path d="M5 19l-1.5 1.5"/>',
    'edit':   '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m14 6 4 4"/>',
    'gift':   '<rect x="3.5" y="8.5" width="17" height="12" rx="1.6"/><path d="M3.5 12.5h17M12 8.5v12"/><path d="M12 8.5S10.5 4 8 4a2 2 0 0 0 0 4.5zM12 8.5S13.5 4 16 4a2 2 0 0 1 0 4.5z"/>',
    'pause':  '<rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
    'play':   '<path d="M7.5 5.5 18 12 7.5 18.5z"/>',
    'stop':   '<rect x="6" y="6" width="12" height="12" rx="2"/>',
})


# ============================================================
# صفحه‌ی بازبینی پروفایل
# ============================================================
mod_body = f'''    <div class="notice-soft">
      {ico('alert', 'ico ico-sm')}
      <span>هر تغییری که فروشنده در پروفایل فروشگاهش می‌دهد، اینجا می‌آید.
      تا وقتی تأیید نکنید، <b>نسخه‌ی قدیمی</b> روی سایت می‌ماند.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ico('clock')}</span>
          <span class="stat-label">در انتظار بررسی</span></div>
        <span class="stat-number num" id="mPend">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ico('check')}</span>
          <span class="stat-label">تأییدشده</span></div>
        <span class="stat-number num" id="mOk">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-red">{ico('x')}</span>
          <span class="stat-label">ردشده</span></div>
        <span class="stat-number num" id="mNo">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-silver">{ico('edit')}</span>
          <span class="stat-label">کل درخواست‌ها</span></div>
        <span class="stat-number num" id="mAll">۰</span>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>درخواست‌های تغییر پروفایل</h2>
        <div class="seg spacer" id="mFilter" role="tablist">
          <button class="seg-btn on" type="button" data-f="pending">در انتظار</button>
          <button class="seg-btn" type="button" data-f="approved">تأییدشده</button>
          <button class="seg-btn" type="button" data-f="rejected">ردشده</button>
          <button class="seg-btn" type="button" data-f="">همه</button>
        </div>
      </div>
      <div id="modBox"></div>
    </div>'''


mod_script = r'''
requireAdmin(async function () {
  var M = window.DPModeration;
  var $ = function (s) { return document.querySelector(s); };
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var filter = 'pending';

  function isImg(v) { return /^(data:image|https?:\/\/)/.test(String(v || '')); }

  function cell(v, key) {
    var w = M.WATCHED[key] || {};
    if (w.img && isImg(v)) {
      return '<img class="diff-img" src="' + esc(v) + '" alt="" loading="lazy" />';
    }
    return esc(M.brief(v, w.img)) || '—';
  }

  function paint() {
    var all = M.all();
    $('#mPend').textContent = fa(all.filter(function (r) { return r.status === 'pending'; }).length);
    $('#mOk').textContent   = fa(all.filter(function (r) { return r.status === 'approved'; }).length);
    $('#mNo').textContent   = fa(all.filter(function (r) { return r.status === 'rejected'; }).length);
    $('#mAll').textContent  = fa(all.length);

    var list = filter ? all.filter(function (r) { return r.status === filter; }) : all;

    if (!list.length) {
      $('#modBox').innerHTML =
        '<div class="empty-inline">درخواستی در این بخش نیست.</div>';
      return;
    }

    var CLS = { pending: 'b-warn', approved: 'b-ok', rejected: 'b-bad' };
    var LBL = { pending: 'در انتظار بررسی', approved: 'تأیید شد', rejected: 'رد شد' };

    $('#modBox').innerHTML = list.map(function (r) {
      var keys = Object.keys(r.fields);
      var rows = keys.map(function (k) {
        var w = M.WATCHED[k] || { fa: k };
        return '' +
          '<div class="diff-row">' +
            '<span class="diff-key">' +
              (r.status === 'pending'
                ? '<label class="diff-pick"><input type="checkbox" data-k="' + esc(k) +
                  '" checked /> ' + esc(w.fa) + '</label>'
                : esc(w.fa)) +
            '</span>' +
            '<div class="diff-old">' + cell(r.fields[k].from, k) + '</div>' +
            '<span class="diff-arrow">←</span>' +
            '<div class="diff-new">' + cell(r.fields[k].to, k) + '</div>' +
          '</div>';
      }).join('');

      return '' +
        '<div class="mod-req" data-id="' + esc(r.id) + '">' +
          '<div class="card-head" style="padding-bottom:10px">' +
            '<h3 style="font-size:15px;margin:0">' + esc(r.storeName) + '</h3>' +
            '<span class="badge ' + (CLS[r.status] || '') + '">' +
              (LBL[r.status] || r.status) + '</span>' +
            '<span class="sub spacer num">' + esc(r.date) + ' · ' +
              fa(keys.length) + ' تغییر</span>' +
          '</div>' +
          rows +
          (r.reason
            ? '<div class="tiny-note" style="margin-top:10px;color:#b06a6a">دلیل رد: ' +
              esc(r.reason) + '</div>' : '') +
          (r.applied && r.applied.length
            ? '<div class="tiny-note" style="margin-top:10px;color:#4a8f6b">اعمال شد: ' +
              esc(r.applied.join('، ')) + '</div>' : '') +
          (r.status === 'pending'
            ? '<div class="row-actions" style="margin-top:14px">' +
                '<button class="btn btn-primary btn-sm" data-ok="' + esc(r.id) + '">تأیید انتخاب‌شده‌ها</button>' +
                '<button class="btn btn-ghost btn-sm" data-no="' + esc(r.id) + '">رد کردن</button>' +
              '</div>' : '') +
        '</div>';
    }).join('');
  }

  /* ---------- صافی ---------- */
  $('#mFilter').addEventListener('click', function (e) {
    var b = e.target.closest('.seg-btn');
    if (!b) return;
    filter = b.dataset.f;
    $('#mFilter').querySelectorAll('.seg-btn').forEach(function (x) {
      x.classList.toggle('on', x === b);
    });
    paint();
  });

  /* ---------- تأیید و رد ---------- */
  document.addEventListener('click', function (e) {
    var ok = e.target.closest('[data-ok]');
    if (ok) {
      var box = ok.closest('.mod-req');
      var picked = [].slice.call(box.querySelectorAll('input[data-k]:checked'))
                     .map(function (i) { return i.dataset.k; });
      if (!picked.length) { toast('دست‌کم یک مورد را انتخاب کنید.', 'error'); return; }
      try {
        var done = M.approve(ok.dataset.ok, picked);
        toast('تأیید شد: ' + done.join('، '), 'success');
        paint();
      } catch (err) { toast(err.message, 'error'); }
      return;
    }

    var no = e.target.closest('[data-no]');
    if (no) {
      var why = prompt('دلیل رد را بنویسید:\n(فروشنده این متن را می‌بیند)');
      if (why === null) return;
      try {
        M.reject(no.dataset.no, why);
        toast('درخواست رد شد.', 'success');
        paint();
      } catch (err) { toast(err.message, 'error'); }
    }
  });

  document.addEventListener('dp:moderation', paint);
  paint();
});
'''


# ============================================================
# صفحه‌ی نردبان — مدیر
# ============================================================
boost_body = f'''    <div class="notice-soft" id="trialNote" hidden>
      {ico('gift', 'ico ico-sm')}
      <span><b>دوره‌ی آزمایشی رایگان فعال است</b> — بسته‌ها بدون پرداخت و
      بی‌درنگ فعال می‌شوند. برای پولی‌کردن، در فایل
      <code>assets/js/dp-boost.js</code> مقدار <code>FREE_TRIAL</code> را
      به <code>false</code> تغییر دهید. قیمت‌ها دست‌نخورده باقی مانده‌اند.</span>
    </div>

    <div class="notice-soft" id="paidNote" hidden>
      {ico('alert', 'ico ico-sm')}
      <span>سفارش نردبان فروشندگان اینجا می‌آید. پس از دریافت وجه، <b>تأیید پرداخت</b> را بزنید
      تا بسته فعال شود. می‌توانید بدون پرداخت هم بسته هدیه بدهید.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ico('clock')}</span>
          <span class="stat-label" id="waitLbl">در انتظار پرداخت</span></div>
        <span class="stat-number num" id="kWait">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ico('rocket')}</span>
          <span class="stat-label">بسته‌ی فعال</span></div>
        <span class="stat-number num" id="kLive">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-blue">{ico('wallet')}</span>
          <span class="stat-label" id="revLbl">درآمد از نردبان</span></div>
        <span class="stat-number num" id="kRev">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-silver">{ico('gift')}</span>
          <span class="stat-label">هدیه‌ی داده‌شده</span></div>
        <span class="stat-number num" id="kGift">۰</span>
      </div>
    </div>

    <div class="notice-soft" id="kInsight" style="margin-bottom:18px">—</div>

    <!-- صدرنشین کنونی -->
    <div class="card mb-18" id="spotCard">
      <div class="card-head">
        <h2>جایگاه صدرنشین</h2>
        <span class="sub spacer">در هر لحظه فقط یک فروشگاه</span>
      </div>
      <div id="spotBox"></div>
      <div id="spotQueue"></div>
    </div>

    <!-- هدیه دادن -->
    <div class="card mb-18">
      <div class="card-head">
        <h2>هدیه‌ی نردبان</h2>
        <span class="sub spacer">بدون پرداخت، بی‌درنگ فعال می‌شود</span>
      </div>
      <form id="giftForm" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="gSeller">فروشگاه</label>
            <select class="input" id="gSeller"></select>
          </div>
          <div class="field">
            <label for="gPlan">بسته</label>
            <select class="input" id="gPlan"></select>
          </div>
          <div class="field">
            <label for="gDays">مدت (روز)</label>
            <input class="input num" id="gDays" value="۷" />
          </div>
          <div class="field">
            <label for="gNote">علت هدیه</label>
            <input class="input" id="gNote" placeholder="مثلاً: فروشگاه تازه" />
          </div>
        </div>
        <button class="btn btn-primary mt-18" type="submit">
          {ico('gift', 'ico ico-sm')} فعال‌سازی هدیه
        </button>
      </form>
    </div>

    <!-- فهرست -->
    <div class="card">
      <div class="card-head">
        <h2>سفارش‌های نردبان</h2>
        <div class="seg spacer" id="kFilter" role="tablist">
          <button class="seg-btn on" type="button" data-f="awaiting">در انتظار</button>
          <button class="seg-btn" type="button" data-f="active">فعال</button>
          <button class="seg-btn" type="button" data-f="expired">پایان‌یافته</button>
          <button class="seg-btn" type="button" data-f="">همه</button>
        </div>
      </div>
      <div id="boostBox"></div>
    </div>'''


boost_script = r'''
requireAdmin(async function () {
  var B = window.DPBoost;
  var $ = function (s) { return document.querySelector(s); };
  var fa = B.fa, money = B.money;
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var toEn = function (s) {
    return String(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
  };

  var filter = 'awaiting';
  var names = {};

  /* ---------- نام فروشگاه‌ها ---------- */
  async function loadSellers() {
    var list = await DPAdmin.sellers.list();
    names = {};
    var sel = $('#gSeller');
    sel.innerHTML = '';
    list.forEach(function (s) {
      names[s.id] = s.storeName || '—';
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.storeName || s.id;
      sel.appendChild(o);
    });
    if (!list.length) {
      var o = document.createElement('option');
      o.textContent = 'هنوز فروشگاهی نیست';
      o.disabled = true;
      sel.appendChild(o);
    }
  }

  function fillPlans() {
    var sel = $('#gPlan');
    sel.innerHTML = '';
    Object.keys(B.PLANS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = B.PLANS[k].fa;
      sel.appendChild(o);
    });
  }

  /* ---------- صف نوبت ---------- */
  function paintQueue() {
    var line = B.queueOf('spotlight');
    if (!line.length) { $('#spotQueue').innerHTML = ''; return; }

    $('#spotQueue').innerHTML =
      '<div class="q-admin">' +
        '<div class="q-admin-head">' + fa(line.length) +
          ' فروشگاه در صف این جایگاه</div>' +
        '<ol class="q-list">' +
        line.map(function (x, i) {
          var p = B.PLANS[x.plan] || {};
          return '<li>' +
            '<span class="q-num num">' + fa(i + 1) + '</span>' +
            '<span class="q-name">' + esc(names[x.sellerId] || x.sellerId) + '</span>' +
            '<span class="q-days num">' + fa(x.days) + ' روز</span>' +
            '<span class="q-date num">' + esc(x.date) + '</span>' +
            '<button class="btn btn-ghost btn-sm" data-qdel="' + esc(x.sellerId) + '">حذف</button>' +
          '</li>';
        }).join('') +
        '</ol>' +
      '</div>';
  }

  /* ---------- جایگاه صدرنشین ---------- */
  function paintSpot() {
    var r = B.spotlight();
    if (!r) {
      var waiting = B.queueOf('spotlight').length;
      $('#spotBox').innerHTML =
        '<div class="empty-inline">جایگاه صدرنشین <b>آزاد</b> است. ' +
        (waiting
          ? fa(waiting) + ' فروشگاه در صف‌اند و نوبت اول به‌زودی خودکار فعال می‌شود.'
          : 'هر فروشگاهی می‌تواند آن را بگیرد.') + '</div>';
      return;
    }
    var p = B.PLANS[r.plan] || {};
    var left = B.daysLeft(r);
    var pct = Math.max(0, Math.min(100, Math.round(left / r.days * 100)));

    $('#spotBox').innerHTML =
      '<div class="boost-live" style="--pc:' + (p.color || '#f5a0a0') + '">' +
        '<div class="bl-head">' +
          '<strong>' + esc(names[r.sellerId] || r.sellerId) + '</strong>' +
          (r.gift ? '<em class="bl-gift">هدیه</em>' : '') +
          (r.trial ? '<em class="free-tag">آزمایشی</em>' : '') +
          '<span class="bl-left num">' + fa(left) + ' روز مانده</span>' +
        '</div>' +
        '<div class="bl-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="bl-foot">' +
          '<span>' + (r.paused ? 'موقتاً متوقف' : 'در حال نمایش به همه‌ی مشتری‌ها') + '</span>' +
          '<span class="num">' + fa(r.views || 0) + ' بازدید · ' +
            fa(r.clicks || 0) + ' کلیک</span>' +
        '</div>' +
        '<div class="row-actions" style="margin-top:12px">' +
          '<button class="btn btn-ghost btn-sm" data-pause="' + esc(r.id) + '">' +
            (r.paused ? 'ادامه' : 'توقف موقت') + '</button>' +
          '<button class="btn btn-ghost btn-sm" data-stop="' + esc(r.id) + '">' +
            'آزادسازی جایگاه</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- رسم ---------- */
  function paint() {
    paintSpot();
    paintQueue();
    var all = B.all();
    var rev = B.revenue();

    $('#kWait').textContent = fa(all.filter(function (r) { return r.status === 'awaiting'; }).length);
    $('#kLive').textContent = fa(all.filter(B.live).length);
    $('#kGift').textContent = fa(rev.gifts);

    /* میانگین کارایی همه‌ی بسته‌ها — برای قیمت‌گذاری بهتر */
    var tv = 0, tc = 0;
    all.forEach(function (r) { tv += r.views || 0; tc += r.clicks || 0; });
    var box = $('#kInsight');
    if (box) {
      box.innerHTML = tv
        ? 'مجموع <b class="num">' + fa(tv) + '</b> بازدید و <b class="num">' +
          fa(tc) + '</b> کلیک — نرخ کلیک کل <b class="num">٪' +
          fa(tv ? Math.round(tc / tv * 1000) / 10 : 0) + '</b>'
        : 'هنوز آماری ثبت نشده است.';
    }

    if (B.FREE_TRIAL) {
      /* درآمدی نیست — به‌جایش برآورد درآمد آینده نشان داده می‌شود */
      $('#revLbl').textContent = 'درآمد بالقوه (اگر پولی بود)';
      $('#kRev').textContent = money(rev.wouldBe || 0);
      $('#waitLbl').textContent = 'بسته‌ی آزمایشی';
      $('#kWait').textContent = fa(rev.trials || 0);
    } else {
      $('#revLbl').textContent = 'درآمد از نردبان';
      $('#kRev').textContent = money(rev.total);
      $('#waitLbl').textContent = 'در انتظار پرداخت';
    }

    var list = filter === 'active' ? all.filter(B.live)
             : filter ? all.filter(function (r) { return r.status === filter && !B.live(r); })
             : all;
    if (filter === 'awaiting') list = all.filter(function (r) { return r.status === 'awaiting'; });

    if (!list.length) {
      $('#boostBox').innerHTML = '<div class="empty-inline">سفارشی در این بخش نیست.</div>';
      return;
    }

    var CLS = { awaiting: 'b-warn', active: 'b-ok', expired: 'b-mute', rejected: 'b-bad' };

    $('#boostBox').innerHTML =
      '<div class="table-wrap"><table class="table"><thead><tr>' +
        '<th>فروشگاه</th><th>بسته</th><th>مدت</th><th>مبلغ</th>' +
        '<th>وضعیت</th><th>آمار</th><th>عملیات</th>' +
      '</tr></thead><tbody>' +
      list.map(function (r) {
        var p = B.PLANS[r.plan] || {};
        var st = B.live(r) ? 'active' : r.status;
        var left = B.daysLeft(r);
        var acts = '';

        if (r.status === 'awaiting') {
          acts = '<button class="btn btn-primary btn-sm" data-go="' + esc(r.id) + '">تأیید پرداخت</button>' +
                 '<button class="btn btn-ghost btn-sm" data-no="' + esc(r.id) + '">رد</button>';
        } else if (B.live(r)) {
          acts = '<button class="btn btn-ghost btn-sm" data-pause="' + esc(r.id) + '">' +
                   (r.paused ? 'ادامه' : 'توقف موقت') + '</button>' +
                 '<button class="btn btn-ghost btn-sm" data-stop="' + esc(r.id) + '">پایان</button>';
        }

        return '<tr>' +
          '<td><b>' + esc(names[r.sellerId] || r.sellerId) + '</b>' +
            (r.note ? '<div class="tiny-note">' + esc(r.note) + '</div>' : '') + '</td>' +
          '<td>' + esc(p.fa || r.plan) +
            (r.gift ? ' <em class="bl-gift">هدیه</em>' : '') + '</td>' +
          '<td class="num">' + fa(r.days) + ' روز' +
            (B.live(r) ? '<div class="tiny-note num">' + fa(left) + ' روز مانده</div>' : '') + '</td>' +
          '<td class="num">' + (r.price ? money(r.price)
            : (r.trial ? '<span class="free-tag">آزمایشی</span>'
                       : (r.gift ? 'هدیه' : 'رایگان'))) + '</td>' +
          '<td><span class="badge ' + (CLS[st] || 'b-mute') + '">' +
            (r.paused && st === 'active' ? 'موقتاً متوقف' : (B.STATUS_FA[st] || st)) + '</span>' +
            (r.reason ? '<div class="tiny-note">' + esc(r.reason) + '</div>' : '') + '</td>' +
          (function () {
            var ins = B.insight(r);
            return '<td class="num">' + fa(ins.views) + ' بازدید' +
              '<div class="tiny-note num">' + fa(ins.clicks) + ' کلیک · ٪' +
              fa(ins.ctr) + ' نرخ</div>' +
              (ins.perDay ? '<div class="tiny-note num">روزی ' + fa(ins.perDay) + '</div>' : '') +
            '</td>';
          })() +
          '<td><div class="row-actions">' + acts + '</div></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- رویدادها ---------- */
  $('#kFilter').addEventListener('click', function (e) {
    var b = e.target.closest('.seg-btn');
    if (!b) return;
    filter = b.dataset.f;
    $('#kFilter').querySelectorAll('.seg-btn').forEach(function (x) {
      x.classList.toggle('on', x === b);
    });
    paint();
  });

  $('#giftForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      B.gift($('#gSeller').value, $('#gPlan').value, toEn($('#gDays').value), $('#gNote').value);
      toast('بسته‌ی هدیه فعال شد.', 'success');
      $('#gNote').value = '';
      paint();
    } catch (err) { toast(err.message, 'error'); }
  });

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      if (!confirm('پرداخت دریافت شد و بسته فعال شود؟')) return;
      try { B.activate(go.dataset.go); toast('بسته فعال شد.', 'success'); paint(); }
      catch (err) { toast(err.message, 'error'); }
      return;
    }
    var no = e.target.closest('[data-no]');
    if (no) {
      var why = prompt('دلیل رد را بنویسید:');
      if (why === null) return;
      try { B.reject(no.dataset.no, why); toast('سفارش رد شد.', 'success'); paint(); }
      catch (err) { toast(err.message, 'error'); }
      return;
    }
    var pz = e.target.closest('[data-pause]');
    if (pz) {
      try {
        var now = B.togglePause(pz.dataset.pause);
        toast(now ? 'موقتاً متوقف شد. روزها نمی‌سوزند.' : 'دوباره فعال شد.', 'success');
        paint();
      } catch (err) { toast(err.message, 'error'); }
      return;
    }
    var qd = e.target.closest('[data-qdel]');
    if (qd) {
      if (!confirm('این فروشگاه از صف حذف شود؟')) return;
      B.dequeue(qd.dataset.qdel, 'spotlight');
      toast('از صف حذف شد.', 'success');
      paint();
      return;
    }

    var sp = e.target.closest('[data-stop]');
    if (sp) {
      if (!confirm('این بسته همین حالا پایان یابد؟')) return;
      try { B.stop(sp.dataset.stop); toast('بسته پایان یافت.', 'success'); paint(); }
      catch (err) { toast(err.message, 'error'); }
    }
  });

  document.addEventListener('dp:boost', paint);

  await (async function () {
    $('#trialNote').hidden = !B.FREE_TRIAL;
    $('#paidNote').hidden = !!B.FREE_TRIAL;

    /* در دوره‌ی آزمایشی چیزی «در انتظار پرداخت» نمی‌ماند،
       پس نمای پیش‌فرض روی «فعال» می‌رود */
    if (B.FREE_TRIAL) {
      filter = 'active';
      $('#kFilter').querySelectorAll('.seg-btn').forEach(function (x) {
        x.classList.toggle('on', x.dataset.f === 'active');
      });
    }

    await loadSellers();
    fillPlans();
    paint();
  })();
});
'''


def page(fname, title, sub, body, script):
    """مثل build.page ولی با فایل‌های تازه"""
    BA.page(fname, title, sub, body, script)
    f = D / fname
    s = f.read_text(encoding='utf-8')
    if 'js/dp-boost.js"></script>' not in s:
        s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
                      '<script src="../assets/js/dp-promo.js"></script>\n'
                      '<script src="../assets/js/dp-boost.js"></script>\n'
                      '<script src="../assets/js/dp-moderation.js"></script>', 1)
        if 'css/dp-boost.css" />' not in s:
            s = s.replace('<link rel="stylesheet" href="css/admin.css" />',
                          '<link rel="stylesheet" href="css/admin.css" />\n'
                          '  <link rel="stylesheet" href="../assets/css/dp-boost.css" />', 1)
    f.write_text(s, encoding='utf-8')


if __name__ == '__main__':
    page('admin-moderation.html', 'بازبینی پروفایل',
         'تأیید یا رد تغییرهای فروشگاه‌ها', mod_body, mod_script)

    page('admin-boost.html', 'نردبان و ارتقا',
         'مدیریت بسته‌های برجسته‌سازی فروشگاه‌ها', boost_body, boost_script)

    # سایدبار همه‌ی صفحه‌ها
    L1 = ('<a class="sb-link" href="admin-moderation.html">' + ico('edit') +
          '<span>بازبینی پروفایل</span><span class="sb-badge" id="badgeMod" hidden></span></a>')
    L2 = ('<a class="sb-link" href="admin-boost.html">' + ico('rocket') +
          '<span>نردبان و ارتقا</span><span class="sb-badge" id="badgeBoost" hidden></span></a>')

    for f in sorted(D.glob('admin-*.html')):
        s = f.read_text(encoding='utf-8')
        changed = False

        # فایل‌های جانبی — حتی اگر سایدبار از قبل درست باشد
        if 'js/dp-boost.js"></script>' not in s:
            s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
                          '<script src="../assets/js/dp-promo.js"></script>\n'
                          '<script src="../assets/js/dp-boost.js"></script>\n'
                          '<script src="../assets/js/dp-moderation.js"></script>', 1)
            changed = True
        if 'css/dp-boost.css" />' not in s:
            s = s.replace('<link rel="stylesheet" href="css/admin.css" />',
                          '<link rel="stylesheet" href="css/admin.css" />\n'
                          '  <link rel="stylesheet" href="../assets/css/dp-boost.css" />', 1)
            changed = True

        if 'admin-moderation.html' in s and 'admin-boost.html' in s:
            if changed:
                f.write_text(s, encoding='utf-8')
                print('  ↻ فایل‌های جانبی:', f.name)
            continue
        m = re.search(r'<a class="sb-link(?: active)?" href="admin-catalog\.html">', s)
        if not m:
            print('  — سایدبار یافت نشد:', f.name)
            continue
        add = ''
        if 'admin-moderation.html' not in s: add += L1 + '\n      '
        if 'admin-boost.html' not in s: add += L2 + '\n      '
        s = s[:m.start()] + add + s[m.start():]

        if 'js/dp-boost.js"></script>' not in s:
            s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
                          '<script src="../assets/js/dp-promo.js"></script>\n'
                          '<script src="../assets/js/dp-boost.js"></script>\n'
                          '<script src="../assets/js/dp-moderation.js"></script>', 1)
        if 'css/dp-boost.css" />' not in s:
            s = s.replace('<link rel="stylesheet" href="css/admin.css" />',
                          '<link rel="stylesheet" href="css/admin.css" />\n'
                          '  <link rel="stylesheet" href="../assets/css/dp-boost.css" />', 1)
        f.write_text(s, encoding='utf-8')
        print('  ↻ سایدبار:', f.name)

    print('پایان')
