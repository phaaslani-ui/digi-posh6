/* ============================================================
   دیجی‌پوش — منوی موبایل مشترک
   ------------------------------------------------------------
   یک منوی همبرگری واحد برای همه‌ی صفحه‌های سایت.
   خودش دکمه و کشو را می‌سازد؛ هیچ تغییری در HTML لازم نیست.

   • زیر ۹۰۰ پیکسل: منوی افقی پنهان، دکمه‌ی سه‌خط پیدا
   • کشو از سمت راست باز می‌شود (چون صفحه راست‌به‌چپ است)
   • بستن با: دکمه، پرده، کلید Escape، کلیک روی لینک، کشیدن انگشت
   • تله‌ی فوکوس برای دسترس‌پذیری با کیبورد
   ============================================================ */
'use strict';

(function () {
  var PAGE = document.body.dataset.dpPage || 'home';

  /* مسیر ریشه، نسبت به محل صفحه‌ی فعلی */
  var deep = ['woman', 'man', 'kids', 'teen'].indexOf(PAGE) > -1;
  var UP = deep ? '../' : './';

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round"';

  var I = {
    burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:  '<path d="M18 6 6 18M6 6l12 12"/>',
    home:   '<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20z"/><path d="M9.5 21.5v-7h5v7"/>',
    woman:  '<path d="M9 3.5h6l-1.2 3.2 3.7 4.1-1.5 2.2v7.5H8v-7.5L6.5 10.8l3.7-4.1z"/>',
    man:    '<path d="M8 3.5 12 7l4-3.5 4 2.2v14.8H4V5.7z"/><path d="M12 7v13.5"/>',
    kids:   '<circle cx="12" cy="6.5" r="2.8"/><path d="M12 9.3v6M8 12h8M9.5 20.5 12 15.3l2.5 5.2"/>',
    teen:   '<path d="M7.6 8h8.8a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.3l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.6 8Z"/>',
    store:  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    cart:   '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
    user:   '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    login:  '<path d="M9 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H9"/><path d="m14 8.5 4 3.5-4 3.5M18 12H9"/>',
    out:    '<path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/>',
    spark:  '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/>',
  };

  var svg = function (p, cls) {
    return '<svg class="' + (cls || 'dnv-i') + '" viewBox="0 0 24 24" ' + SW +
           ' aria-hidden="true">' + p + '</svg>';
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var fa = function (n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  };

  /* ---------- بخش‌های اصلی سایت ---------- */
  var SECTIONS = [
    { key: 'home',  icon: I.home,  label: 'صفحه اصلی',  href: UP + 'index.html' },
    { key: 'woman', icon: I.woman, label: 'لباس زنانه',  href: UP + 'woman/index.html' },
    { key: 'man',   icon: I.man,   label: 'لباس مردانه', href: UP + 'man/index.html' },
    { key: 'kids',  icon: I.kids,  label: 'لباس بچگانه', href: UP + 'kids/index.html' },
    { key: 'teen',  icon: I.teen,  label: 'تینیجر',      href: UP + 'teen/index.html' }
  ];

  /* ============================================================
     پیدا کردن نوار ناوبری — هر صفحه نام کلاس خودش را دارد
     ============================================================ */
  function findBar() {
    return document.querySelector(
      '.navbar, .navbar-m, .sh-bar, header nav'
    );
  }

  function findMenu() {
    return document.querySelector('.nav-menu, .menu, .menu-m, .sh-menu');
  }

  /* ============================================================
     ساخت
     ============================================================ */
  function build() {
    var bar = findBar();
    if (!bar || document.getElementById('dnvBtn')) return;

    /* جعبه‌ی آیکون‌های نوار بالا؛ اگر نبود ساخته می‌شود */
    var slot = document.querySelector('.nav-icons, .icons-m, .dp-navbox');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'dp-navbox';
      bar.appendChild(slot);
    }
    slot.classList.add('dp-navbox');

    /* ---------- دکمه‌ی سه‌خط ---------- */
    var btn = document.createElement('button');
    btn.id = 'dnvBtn';
    btn.className = 'dnv-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'باز کردن منو');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'dnvPanel');
    btn.innerHTML = svg(I.burger, 'dnv-i dnv-i-lg');
    slot.appendChild(btn);

    /* ---------- پرده ---------- */
    var veil = document.createElement('div');
    veil.className = 'dnv-veil';
    veil.id = 'dnvVeil';
    document.body.appendChild(veil);

    /* ---------- کشو ---------- */
    var links = SECTIONS.map(function (s) {
      var on = s.key === PAGE ? ' is-on' : '';
      return '<a class="dnv-link' + on + '" href="' + s.href + '">' +
             svg(s.icon) + '<span>' + s.label + '</span>' +
             (on ? '<em class="dnv-dot"></em>' : '') + '</a>';
    }).join('');

    var panel = document.createElement('aside');
    panel.className = 'dnv-panel';
    panel.id = 'dnvPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'منوی اصلی');
    panel.hidden = true;

    panel.innerHTML =
      '<div class="dnv-head">' +
        '<a class="dnv-brand" href="' + UP + 'index.html">' +
          '<span class="dnv-mark">د</span>' +
          '<span><strong>دیجی‌پوش</strong><small>بازارگاه ممتاز مد</small></span>' +
        '</a>' +
        '<button class="dnv-x" type="button" aria-label="بستن منو">' +
          svg(I.close, 'dnv-i') + '</button>' +
      '</div>' +

      '<nav class="dnv-body" aria-label="ناوبری اصلی">' +
        '<span class="dnv-label">بخش‌ها</span>' +
        links +

        '<span class="dnv-label">حساب من</span>' +
        '<div id="dnvUser"></div>' +

        '<a class="dnv-link" href="' + UP + 'cart.html">' +
          svg(I.cart) + '<span>سبد خرید</span><em class="dnv-n" id="dnvCart" hidden></em></a>' +

        '<span class="dnv-label">فروشندگان</span>' +
        '<a class="dnv-link" href="' + UP + 'seller/seller-signup.html">' +
          svg(I.store) + '<span>ثبت‌نام فروشنده</span></a>' +
        '<a class="dnv-link" href="' + UP + 'seller/seller-login.html">' +
          svg(I.login) + '<span>ورود فروشندگان</span></a>' +
      '</nav>' +

      '<div class="dnv-foot">' +
        '<a class="dnv-cta" href="' + UP + 'account.html?mode=signup">' +
          svg(I.spark) + 'عضویت در دیجی‌پوش</a>' +
        '<small>© ۱۴۰۴ دیجی‌پوش</small>' +
      '</div>';

    document.body.appendChild(panel);

    wire(btn, veil, panel);
    paintUser();
    paintCart();
  }

  /* ============================================================
     بخش حساب کاربری داخل کشو
     ============================================================ */
  function paintUser() {
    var box = document.getElementById('dnvUser');
    if (!box) return;

    var u = window.DPUser && DPUser.me ? DPUser.me() : null;

    if (!u) {
      box.innerHTML =
        '<a class="dnv-link" href="' + UP + 'account.html?mode=login">' +
        svg(I.login) + '<span>ورود / ثبت‌نام</span></a>';
      return;
    }

    var name = (u.fullName || String(u.email || '').split('@')[0] || 'کاربر').trim();

    box.innerHTML =
      '<div class="dnv-me">' +
        '<span class="dnv-ava">' + esc(name.charAt(0) || '؟') + '</span>' +
        '<div><strong>' + esc(name) + '</strong><small>' + esc(u.email) + '</small></div>' +
      '</div>' +
      '<a class="dnv-link" href="' + UP + 'account.html">' +
        svg(I.user) + '<span>حساب من</span></a>' +
      '<button class="dnv-link dnv-out" type="button">' +
        svg(I.out) + '<span>خروج از حساب</span></button>';

    var out = box.querySelector('.dnv-out');
    if (out) {
      out.addEventListener('click', function () {
        DPUser.logout();
        paintUser();
        if (window.dpRenderAccount) dpRenderAccount();
        if (window.dpToast) dpToast('خارج شدید.');
      });
    }
  }

  /* ---------- شمارنده‌ی سبد ---------- */
  function paintCart() {
    var el = document.getElementById('dnvCart');
    if (!el) return;
    var n = window.DPCart && DPCart.count ? DPCart.count() : 0;
    if (n > 0) { el.textContent = fa(n); el.hidden = false; }
    else el.hidden = true;
  }

  /* ============================================================
     رفتار
     ============================================================ */
  function wire(btn, veil, panel) {
    var open = false;
    var lastFocus = null;

    function setOpen(v) {
      open = v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      btn.setAttribute('aria-label', v ? 'بستن منو' : 'باز کردن منو');

      if (v) {
        lastFocus = document.activeElement;
        panel.hidden = false;
        /* یک فریم صبر تا مرورگر حالت اولیه را ثبت کند، بعد انیمیشن */
        requestAnimationFrame(function () {
          panel.classList.add('is-open');
          veil.classList.add('is-on');
        });
        document.body.classList.add('dnv-lock');
        paintUser();
        paintCart();
        setTimeout(function () {
          var f = panel.querySelector('.dnv-x');
          if (f) f.focus();
        }, 60);
      } else {
        panel.classList.remove('is-open');
        veil.classList.remove('is-on');
        document.body.classList.remove('dnv-lock');
        /* پس از پایان انیمیشن، از دید صفحه‌خوان‌ها پنهان شود */
        setTimeout(function () { if (!open) panel.hidden = true; }, 340);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
    }

    btn.addEventListener('click', function () { setOpen(!open); });
    veil.addEventListener('click', function () { setOpen(false); });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('.dnv-x')) { setOpen(false); return; }
      /* با کلیک روی هر لینک، کشو بسته شود */
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!open) return;

      if (e.key === 'Escape') { setOpen(false); return; }

      /* تله‌ی فوکوس — Tab از کشو بیرون نرود */
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* کشیدن انگشت به راست = بستن */
    var x0 = null;
    panel.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX;
    }, { passive: true });

    panel.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      if (e.changedTouches[0].clientX - x0 > 60) setOpen(false);
      x0 = null;
    }, { passive: true });

    /* اگر پنجره بزرگ شد، کشو خودکار بسته شود */
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (open && window.innerWidth > 900) setOpen(false);
      }, 140);
    }, { passive: true });

    /* هماهنگی با بقیه‌ی بخش‌های سایت */
    document.addEventListener('dp:cart', paintCart);
    document.addEventListener('dp:user', paintUser);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', build, { once: true })
    : build();

  window.dpNavRefresh = function () { paintUser(); paintCart(); };
})();
