/* ============================================================
   دیجی‌پوش — پوسته‌ی پنل عمده‌فروشی
   ------------------------------------------------------------
   منوی کناری، نشان‌ها، پیام‌ها و محافظ صفحه.
   هر صفحه‌ی پنل با `requireWholesale(fn)` شروع می‌شود.
   ============================================================ */
'use strict';

(function () {

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.6" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  /* ============================================================
     منوی کناری — راست‌چین، مثل بقیه‌ی پنل‌ها
     ============================================================ */
  var MENU = [
    { href: 'wholesale-dashboard.html', fa: 'میزکار',
      icon: '<path d="M4 12.5 12 5l8 7.5"/><path d="M6.5 11v8.5h11V11"/>' },
    { href: 'wholesale-products.html', fa: 'کالاهای عمده', badge: 'low',
      icon: '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>' },
    { href: 'wholesale-rfq.html', fa: 'استعلام‌ها', badge: 'rfq',
      icon: '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>' },
    { href: 'wholesale-orders.html', fa: 'سفارش‌ها', badge: 'orders',
      icon: '<path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>' },
    { href: 'wholesale-inventory.html', fa: 'انبار',
      icon: '<path d="M3.5 9.5 12 4.5l8.5 5v10h-17z"/><path d="M8.5 19.5V13h7v6.5"/>' },
    { href: 'wholesale-buyers.html', fa: 'مشتریان',
      icon: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c0-3.3 2.5-5.4 5.5-5.4s5.5 2.1 5.5 5.4"/><path d="M16 6.5a3 3 0 0 1 0 6M17.5 19.5c0-2-.6-3.6-1.7-4.7"/>' },
    { href: 'wholesale-boost.html', fa: 'نردبان بازار', badge: 'boost',
      icon: '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/>' },
    { href: 'wholesale-reviews.html', fa: 'نظرها', badge: 'rev',
      icon: '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>' },
    { href: 'wholesale-reports.html', fa: 'گزارش‌ها',
      icon: '<path d="M4 19.5V15M9 19.5V9M14 19.5v-7M19 19.5V5"/>' },
    { href: 'wholesale-profile.html', fa: 'پروفایل کسب‌وکار', badge: 'mod',
      icon: '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>' },
  ];

  function buildShell() {
    var here = (location.pathname.split('/').pop() || 'wholesale-dashboard.html');

    var links = MENU.map(function (m) {
      var on = m.href === here ? ' is-on' : '';
      return '<a class="wp-link' + on + '" href="' + m.href + '">' +
        '<svg class="wp-i" viewBox="0 0 24 24" ' + SW + '>' + m.icon + '</svg>' +
        '<span>' + m.fa + '</span>' +
        (m.badge ? '<em class="wp-badge" data-badge="' + m.badge + '" hidden></em>' : '') +
        '</a>';
    }).join('');

    var side = $('#wpSide');
    if (side) {
      side.innerHTML =
        '<div class="wp-brand">' +
          '<span class="wp-mark">د</span>' +
          '<span class="wp-brand-txt">' +
            '<strong>دیجی‌پوش</strong>' +
            '<small>پنل عمده‌فروشی</small>' +
          '</span>' +
        '</div>' +

        '<div class="wp-who" id="wpWho"></div>' +

        '<nav class="wp-menu" aria-label="منوی پنل">' + links + '</nav>' +

        '<div class="wp-side-foot">' +
          '<a class="wp-link" href="../index.html">' +
            '<svg class="wp-i" viewBox="0 0 24 24" ' + SW + '>' +
            '<path d="M3 12.5 12 5l9 7.5"/><path d="M6 11v8.5h12V11"/></svg>' +
            '<span>بازار عمده</span></a>' +
          '<button class="wp-link wp-out" type="button" data-logout>' +
            '<svg class="wp-i" viewBox="0 0 24 24" ' + SW + '>' +
            '<path d="M14.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h7a1.5 1.5 0 0 0 1.5-1.5v-2.5"/>' +
            '<path d="M9.5 12h11M17 8.5l3.5 3.5-3.5 3.5"/></svg>' +
            '<span>خروج</span></button>' +
        '</div>';
    }

    /* پرده‌ی موبایل */
    if (!$('#wpVeil')) {
      var v = document.createElement('div');
      v.className = 'wp-veil';
      v.id = 'wpVeil';
      document.body.appendChild(v);
    }

    /* جعبه‌ی پیام */
    if (!$('#wpToasts')) {
      var t = document.createElement('div');
      t.className = 'wp-toasts';
      t.id = 'wpToasts';
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
  }

  /* ============================================================
     نام و وضعیت فروشنده
     ============================================================ */
  function paintWho() {
    var box = $('#wpWho');
    if (!box || !window.DPWStore) return;
    var p = DPWStore.profile();
    if (!p) return;

    var ST = {
      approved: { fa: 'تأییدشده', cls: 'ok' },
      pending:  { fa: 'در انتظار تأیید', cls: 'wait' },
      rejected: { fa: 'رد شده', cls: 'bad' },
      suspended:{ fa: 'معلق', cls: 'bad' },
    };
    var st = ST[p.status || 'pending'] || ST.pending;
    var name = p.storeName || p.companyName || 'کسب‌وکار شما';

    box.innerHTML =
      '<span class="wp-who-logo">' + esc(String(name).trim()[0] || '؟') + '</span>' +
      '<span class="wp-who-txt">' +
        '<strong>' + esc(name) + '</strong>' +
        '<em class="wp-st ' + st.cls + '">' + st.fa + '</em>' +
      '</span>';
  }

  /* ============================================================
     نشان‌های کنار منو
     ============================================================ */
  function paintBadges() {
    if (!window.DPWStore) return;
    var s;
    try { s = DPWStore.stats(); } catch (e) { return; }

    var set = function (key, n) {
      var el = document.querySelector('[data-badge="' + key + '"]');
      if (!el) return;
      el.textContent = DPWStore.fa(n);
      el.hidden = !n;
    };
    set('rfq', s.rfqOpen);
    set('orders', s.pendingOrders);
    set('low', s.lowStock + s.outOfStock);
    try {
      if (window.DPWBoost) set('boost', DPWBoost.activeOf().length);
    } catch (e) { /* موتور نردبان هنوز نیامده */ }

    /* نظرهای دیده‌نشده */
    try {
      if (window.DPReviews && window.DPWStore) {
        set('rev', DPReviews.unseenFor(DPWStore.me()));
      }
    } catch (e) { /* بی‌اهمیت */ }

    /* درخواست پروفایل در انتظار تأیید مدیر */
    try {
      if (window.DPModeration && window.DPWStore) {
        var p = DPModeration.pendingOf(DPWStore.me());
        set('mod', p ? Object.keys(p.fields).length : 0);
      }
    } catch (e) { /* بی‌اهمیت */ }
  }

  /* ============================================================
     پیام
     ============================================================ */
  function toast(msg, kind) {
    var box = $('#wpToasts');
    if (!box) { return; }
    var el = document.createElement('div');
    el.className = 'wp-toast ' + (kind || '');
    el.setAttribute('role', 'status');
    var ic = kind === 'error'
      ? '<path d="M18 6 6 18M6 6l12 12"/>'
      : (kind === 'warn'
          ? '<path d="M12 4.5 21 19H3z"/><path d="M12 10v4M12 16.5h.01"/>'
          : '<path d="m5 12.5 4.5 4.5L19 7.5"/>');
    el.innerHTML = '<svg viewBox="0 0 24 24" ' + SW + '>' + ic + '</svg>' +
                   '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, kind === 'warn' ? 5200 : 3400);
  }

  /* ============================================================
     منوی موبایل
     ============================================================ */
  function wireShell() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('#wpBurger')) {
        document.body.classList.toggle('wp-open');
        return;
      }
      if (e.target.closest('#wpVeil')) {
        document.body.classList.remove('wp-open');
        return;
      }
      var out = e.target.closest('[data-logout]');
      if (out) {
        e.preventDefault();
        if (window.DPStore && DPStore.auth) DPStore.auth.logout();
        toast('خارج شدید.', 'success');
        setTimeout(function () {
          location.href = '../../seller/seller-login.html';
        }, 500);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('wp-open');
    });

    document.addEventListener('dpw:change', function () {
      paintBadges();
    });
  }

  /* ============================================================
     محافظ صفحه
     ------------------------------------------------------------
     هر صفحه‌ی پنل با این شروع می‌شود. سه چیز را بررسی می‌کند:
       ۱. آیا وارد شده؟
       ۲. آیا واقعاً عمده‌فروش است؟ (تک‌فروش به پنل خودش می‌رود)
       ۳. آیا موتور داده بارگذاری شده؟
     ============================================================ */
  function requireWholesale(fn) {
    var start = function () {
      if (!window.DPStore || !window.DPWStore) {
        console.error('موتور پنل بارگذاری نشد — ترتیب اسکریپت‌ها را بررسی کنید.');
        var box = document.querySelector('.wp-content') || document.body;
        var p = document.createElement('div');
        p.className = 'wp-note bad';
        p.textContent = 'بارگذاری پنل ناقص بود. صفحه را با Ctrl + Shift + R تازه کنید.';
        box.insertBefore(p, box.firstChild);
        return;
      }

      if (!DPStore.auth.isLoggedIn()) {
        location.replace('../../seller/seller-login.html');
        return;
      }

      /* تک‌فروش نباید اینجا باشد */
      var t = DPStore.myType ? DPStore.myType() : 'retail';
      if (t && t !== 'wholesale') {
        location.replace('../../seller/seller-dashboard.html');
        return;
      }

      try { buildShell(); } catch (e) { console.error(e); }
      try { paintWho(); } catch (e) { console.error(e); }
      try { paintBadges(); } catch (e) { console.error(e); }
      try { wireShell(); } catch (e) { console.error(e); }

      try {
        var r = fn();
        if (r && typeof r.catch === 'function') {
          r.catch(function (err) { console.error(err); toast(err.message || 'خطایی رخ داد.', 'error'); });
        }
      } catch (err) {
        console.error(err);
        toast(err.message || 'خطایی رخ داد.', 'error');
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }

  /* ============================================================
     ابزارهای مشترک صفحه‌ها
     ============================================================ */

  /** جدول خالی */
  function emptyBox(title, hint) {
    return '<div class="wp-empty">' +
      '<svg viewBox="0 0 24 24" ' + SW + '>' +
        '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/>' +
        '<path d="M12 11.5v9"/></svg>' +
      '<b>' + esc(title) + '</b>' +
      (hint ? '<span>' + esc(hint) + '</span>' : '') +
      '</div>';
  }

  /** پنجره */
  function openModal(sel) {
    var m = typeof sel === 'string' ? $(sel) : sel;
    if (!m) return;
    m.classList.add('open');
    document.body.classList.add('wp-lock');
    var f = m.querySelector('input, select, textarea, button');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }

  function closeModal(m) {
    ($$(m ? [] : '.wp-modal.open').concat(m ? [m] : []))
      .forEach(function (x) { x.classList.remove('open'); });
    if (!m) $$('.wp-modal.open').forEach(function (x) { x.classList.remove('open'); });
    document.body.classList.remove('wp-lock');
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-wp-close]')) closeModal(e.target.closest('.wp-modal'));
    else if (e.target.classList && e.target.classList.contains('wp-modal')) closeModal(e.target);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  window.DPWUi = {
    requireWholesale: requireWholesale,
    toast: toast,
    esc: esc,
    emptyBox: emptyBox,
    openModal: openModal,
    closeModal: closeModal,
    paintBadges: paintBadges,
    SW: SW,
  };

  /* میان‌بر */
  window.requireWholesale = requireWholesale;
  window.wpToast = toast;
})();
