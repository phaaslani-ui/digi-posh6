/* ============================================================
   دیجی‌پوش — دکمه‌ی حساب کاربری در نوار بالای هر صفحه
   ------------------------------------------------------------
   • مهمان  → دکمه‌ی دعوت با نامی متناسب با همان صفحه
   • واردشده → نام کاربر + منوی کشویی (به‌جای دکمه)
   ============================================================ */
'use strict';

(function () {
  const page = document.body.dataset.dpPage || 'home';
  const UP = page === 'home' ? './' : '../';

  /* ---------- متن دکمه، متناسب با حال‌وهوای هر صفحه ---------- */
  const LABEL = {
    home:  { cta: 'عضویت در دیجی‌پوش', sub: 'به جمع ما بپیوندید' },
    woman: { cta: 'عضویت در باشگاه بانوان', sub: 'ویترین اختصاصی شما' },
    man:   { cta: 'عضویت در باشگاه آقایان', sub: 'استایل شخصی شما' },
    kids:  { cta: 'عضویت در باشگاه کوچولوها', sub: 'دنیای رنگی بچه‌ها' },
    teen:  { cta: 'پیوستن به کلوب تینیجرها', sub: 'استایل نسل تازه' },
  };

  const T = LABEL[page] || LABEL.home;

  const SW = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const I = {
    spark: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18l-1.8-5.4L4.5 10.8 10.2 9z"/></svg>`,
    user:  `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 20s-7-4.3-7-9.2A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg>`,
    bag:   `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/></svg>`,
    out:   `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/></svg>`,
    cart2: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/></svg>`,
    down:  `<svg class="dp-caret" viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg>`,
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* پیام شناور مشترک — همه‌ی صفحه‌ها از آن استفاده می‌کنند */
  window.dpToast = function (msg, type = 'success') {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast t-${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
      el.classList.remove('show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 3000);
  };

  /* ---------- جای گذاشتن دکمه ----------
     هر صفحه نام کلاس متفاوتی برای جعبه‌ی آیکون‌ها دارد. */
  function slot() {
    let box = document.querySelector('.nav-icons, .icons-m, .dp-navbox');
    if (!box) {
      const bar = document.querySelector('.navbar, .navbar-m, .sh-bar, header nav');
      if (!bar) return null;
      box = document.createElement('div');
      box.className = 'dp-navbox';
      bar.appendChild(box);
    }
    box.classList.add('dp-navbox');
    return box;
  }

  /* ============================================================
     رسم
     ============================================================ */
  function render() {
    const host = slot();
    if (!host || !window.DPUser) return;

    /*
     * منو حالا فرزند `body` است، نه `.dp-acc`.
     * پس با پاک کردن دکمه، خودش پاک نمی‌شود و با هر بار
     * رسم دوباره (مثلاً تغییر سبد) یک منوی یتیم در صفحه
     * باقی می‌ماند. هر دو با هم برداشته می‌شوند.
     */
    document.querySelector('.dp-acc')?.remove();
    document.querySelectorAll('body > .dp-pop').forEach((el) => el.remove());

    /* منوی قبلی از صفحه رفت — اشاره‌گر هم باید پاک شود،
       وگرنه شنونده‌های سراسری روی عنصر مرده کار می‌کنند */
    current = null;

    const box = document.createElement('div');
    box.className = 'dp-acc';

    /* ---------- سبد خرید ---------- */
    const n = window.DPCart ? DPCart.count() : 0;
    const cartBtn = `
      <a class="dp-cart" href="${UP}cart.html" title="سبد خرید" aria-label="سبد خرید">
        ${I.cart2}
        ${n ? `<em class="dp-cart-n">${fa(n)}</em>` : ''}
      </a>`;

    const user = DPUser.me();

    if (!user) {
      /* ---------- مهمان ---------- */
      box.innerHTML = cartBtn + `
        <a class="dp-join" href="${UP}account.html?mode=signup" title="${esc(T.sub)}">
          ${I.spark}<span>${esc(T.cta)}</span>
        </a>
        <a class="dp-signin" href="${UP}account.html?mode=login">ورود</a>`;
    } else {
      /* ---------- واردشده ---------- */
      const name = (user.fullName || String(user.email || '').split('@')[0] || 'کاربر').trim();
      const first = name.split(' ')[0];
      const count = DPUser.wishlist.all().length;

      box.innerHTML = cartBtn + `
        <div class="dp-menu">
          <button class="dp-chip" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="dp-ava">${esc(name[0] || '؟')}</span>
            <span class="dp-hi">${esc(first)}</span>
            ${I.down}
          </button>

          <div class="dp-pop" role="menu">
            <div class="dp-pop-head">
              <span class="dp-ava dp-ava-lg">${esc(name[0] || '؟')}</span>
              <div>
                <strong>${esc(name)}</strong>
                <small>${esc(user.email)}</small>
              </div>
            </div>

            <a role="menuitem" href="${UP}account.html">${I.user}<span>حساب من</span></a>
            <a role="menuitem" href="${UP}account.html#wishlist">${I.heart}<span>فروشگاه‌های دلخواه</span>${
              count ? `<em class="dp-count">${fa(count)}</em>` : ''}</a>
            <a role="menuitem" href="${UP}account.html#orders">${I.bag}<span>سفارش‌های من</span></a>
            <button role="menuitem" type="button" class="dp-out">${I.out}<span>خروج از حساب</span></button>
          </div>
        </div>`;
    }

    host.prepend(box);
    wire(box);
  }

  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  /* ============================================================
     شنونده‌های سراسری — فقط یک بار برای همیشه
     ------------------------------------------------------------
     `current` همیشه به منوی زنده‌ی فعلی اشاره می‌کند، پس
     نیازی نیست با هر رسم دوباره شنونده‌ی تازه ببندیم.
     ============================================================ */
  let current = null;
  let globalBound = false;

  function bindGlobal() {
    if (globalBound) return;
    globalBound = true;

    document.addEventListener('click', (e) => {
      if (!current) return;
      if (!current.box.contains(e.target) && !current.pop.contains(e.target)) {
        current.setOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) current.setOpen(false);
    });

    /* با پیمایش یا تغییر اندازه، منو دنبال دکمه می‌ماند */
    const follow = () => {
      if (current && current.pop.classList.contains('open')) current.place();
    };
    window.addEventListener('scroll', follow, { passive: true });
    window.addEventListener('resize', follow);
  }

  /* ============================================================
     رفتار منو
     ============================================================ */
  function wire(box) {
    const chip = box.querySelector('.dp-chip');
    const pop = box.querySelector('.dp-pop');

    if (chip && pop) {
      /* ============================================================
         منو باید از نوار ناوبری بیرون بیاید
         ------------------------------------------------------------
         نوار ناوبری همه‌ی صفحه‌ها `backdrop-filter` دارد.

         طبق استاندارد CSS، این ویژگی یک «بلوک دربرگیرنده»ی تازه
         می‌سازد. یعنی هر فرزندی که `position: fixed` باشد، دیگر
         نسبت به **پنجره** جای‌گذاری نمی‌شود بلکه نسبت به **همان
         نوار** — و چون نوار کوتاه است، منو بریده یا نامرئی می‌شد.

         تنها راه‌حل قطعی: منو را از نوار بیرون ببریم و مستقیم
         فرزند `body` کنیم. آن‌وقت `fixed` واقعاً نسبت به پنجره
         کار می‌کند و جای‌گذاری دستی درست می‌نشیند.
         ============================================================ */
      if (pop.parentElement !== document.body) {
        document.body.appendChild(pop);
      }

      /* ---------- جای منو ---------- */
      const place = () => {
        const r = chip.getBoundingClientRect();
        const gap = 10;
        const w = pop.offsetWidth || 244;
        const h = pop.offsetHeight || 300;
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;

        /* عمودی: زیر دکمه؛ اگر جا نبود، بالای دکمه */
        let y = r.bottom + gap;
        if (y + h > vh - 8 && r.top - gap - h > 8) y = r.top - gap - h;
        y = Math.max(8, Math.min(y, vh - h - 8));

        /* افقی: هم‌تراز دکمه، ولی همیشه داخل صفحه */
        let x = r.left;
        if (document.dir === 'rtl' || document.documentElement.dir === 'rtl') {
          x = r.right - w;                 /* راست‌چین: از لبه‌ی راست دکمه */
        }
        x = Math.max(8, Math.min(x, vw - w - 8));

        pop.style.setProperty('--dpa-x', Math.round(x) + 'px');
        pop.style.setProperty('--dpa-y', Math.round(y) + 'px');
      };

      const setOpen = (v) => {
        if (v) {
          /* دو منوی باز هم‌زمان کاربر را گیج می‌کند */
          try { window.DPSubmenu && DPSubmenu.closeAll(); } catch (e) {}
          /* پیش از اندازه‌گیری باید دیده شود، ولی هنوز شفاف است */
          pop.classList.add('open');
          place();
          requestAnimationFrame(place);    /* یک بار دیگر، پس از چیدمان */
        } else {
          pop.classList.remove('open');
        }
        chip.setAttribute('aria-expanded', v ? 'true' : 'false');
      };

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(!pop.classList.contains('open'));
      });

      /*
       * ============================================================
       * چرا شنونده‌های سراسری اینجا ثبت نمی‌شوند؟
       * ------------------------------------------------------------
       * `render()` با هر تغییر سبد، ورود و خروج دوباره اجرا می‌شود
       * و `wire()` را صدا می‌زند. اگر شنونده‌ی `document` و `window`
       * اینجا بسته شود، هر بار چهار شنونده‌ی تازه اضافه می‌شد و
       * قبلی‌ها هرگز برداشته نمی‌شدند.
       *
       * اندازه‌گیری: پس از ۵ بار تغییر سبد، ۲۰ شنونده‌ی یتیم —
       * و همه‌شان روی هر پیمایش و هر کلیک اجرا می‌شدند.
       *
       * حالا یک بار در `bindGlobal()` ثبت می‌شوند و منوی فعلی را
       * هنگام اجرا پیدا می‌کنند.
       * ============================================================
       */
      current = { box: box, pop: pop, setOpen: setOpen, place: place };
      bindGlobal();
    }

    box.querySelector('.dp-out')?.addEventListener('click', () => {
      DPUser.logout();
      render();                       // دکمه‌ها دوباره به حالت مهمان برمی‌گردند
      document.dispatchEvent(new CustomEvent('dp:user'));
    });
  }

  document.addEventListener('dp:cart', render);

  /* پس از ورود یا خروج، نوار بالا بی‌درنگ نام کاربر را نشان دهد */
  document.addEventListener('dp:user', render);

  /* اگر در تب دیگری وارد یا خارج شد، اینجا هم به‌روز شود */
  window.addEventListener('storage', (e) => {
    if (e.key === 'dp_customer_session' || e.key === 'dp_cart') render();
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', render, { once: true })
    : render();

  window.dpRenderAccount = render;
})();
