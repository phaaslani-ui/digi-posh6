/* ============================================================
   دیجی‌پوش — لایه‌ی صیقل
   ------------------------------------------------------------
   جزئیات کوچکی که سایت را روان‌تر و حرفه‌ای‌تر می‌کنند.
   هیچ‌کدام ظاهر را عوض نمی‌کنند؛ فقط حس کار کردن با سایت
   را بهتر می‌کنند.

     ۱. بازخورد فوری روی هر دکمه (موج لمس)
     ۲. تأیید پیش از کارهای برگشت‌ناپذیر
     ۳. هشدار پیش از بستن صفحه با فرم نیمه‌کاره
     ۴. پیمایش نرم به لنگرها با در نظر گرفتن نوار چسبان
     ۵. بازگشت به بالا پس از پیمایش طولانی
     ۶. تصویر شکسته → جایگزین آبرومند
     ۷. نمایش «برخط / برون‌خط» بودن
     ۸. جلوگیری از ارسال دوباره‌ی فرم با دوبار کلیک
   ============================================================ */
'use strict';

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     ۱. موج لمس روی دکمه‌ها
     ------------------------------------------------------------
     بازخورد دیداری فوری. کاربر می‌فهمد کلیکش ثبت شده،
     حتی اگر پاسخ چند صد میلی‌ثانیه طول بکشد.
     ============================================================ */
  if (!reduced) {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest(
        'button:not([disabled]), .btn, .dpp-add, .dcd-cta, .sp-cta, ' +
        '.btn-store, .btn-arena, .acc-tab, .seg-btn'
      );
      if (!b) return;
      if (b.querySelector('.dp-ripple')) return;

      /* دکمه‌هایی که نشان بیرون‌زده دارند (مثل تیک گوشه‌ی سایز)
         نباید بریده شوند — موج روی آن‌ها اجرا نمی‌شود. */
      if (b.closest('.sz-pick, .dp-color-pick, .plan-grid, .sp-shots-dots')) return;
      if (b.classList.contains('dp-switch')) return;

      var r = b.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 1.6;

      var s = document.createElement('span');
      s.className = 'dp-ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';

      /* دکمه باید ظرف موج باشد */
      var cs = getComputedStyle(b);
      if (cs.position === 'static') b.style.position = 'relative';
      if (cs.overflow === 'visible') b.style.overflow = 'hidden';

      b.appendChild(s);
      s.addEventListener('animationend', function () { s.remove(); }, { once: true });
    }, { passive: true });
  }

  /* ============================================================
     ۲. جلوگیری از ارسال دوباره‌ی فرم
     ------------------------------------------------------------
     دوبار کلیک سریع روی «ثبت» نباید دو سفارش بسازد.
     ============================================================ */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!(f instanceof HTMLFormElement)) return;
    if (f.dataset.dpBusy === '1') { e.preventDefault(); e.stopImmediatePropagation(); return; }

    f.dataset.dpBusy = '1';
    setTimeout(function () { delete f.dataset.dpBusy; }, 1200);
  }, true);   /* در مرحله‌ی capture تا پیش از بقیه اجرا شود */

  /* ============================================================
     ۳. هشدار پیش از بستن صفحه با فرم نیمه‌کاره
     ------------------------------------------------------------
     فقط برای فرم‌های مهم — نه جست‌وجو و خبرنامه.
     ============================================================ */
  var GUARD = '#storeForm, #userForm, #productForm, #signupForm, #boostForm, #saleForm';
  var dirty = false;

  document.addEventListener('input', function (e) {
    if (e.target.closest && e.target.closest(GUARD)) dirty = true;
  }, { passive: true });

  document.addEventListener('submit', function () { dirty = false; }, true);

  window.addEventListener('beforeunload', function (e) {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  /* ============================================================
     ۴. پیمایش نرم با در نظر گرفتن نوار چسبان
     ------------------------------------------------------------
     بدون این، عنوان بخش زیر نوار بالا پنهان می‌شد.
     ============================================================ */
  function navHeight() {
    var bar = document.querySelector('.navbar, .navbar-m, .sh-bar');
    if (!bar) return 20;
    var r = bar.getBoundingClientRect();
    return r.height + 24;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;

    var id = a.getAttribute('href').slice(1);
    if (!id) return;

    var t = document.getElementById(id);
    if (!t) return;

    e.preventDefault();
    var y = t.getBoundingClientRect().top + window.scrollY - navHeight();
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });

    /* نشانی به‌روز شود ولی پرش نکند */
    history.replaceState(null, '', '#' + id);

    /* تمرکز برای صفحه‌خوان */
    t.setAttribute('tabindex', '-1');
    setTimeout(function () { t.focus({ preventScroll: true }); }, 400);
  });

  /* ============================================================
     ۵. دکمه‌ی بازگشت به بالا
     ============================================================ */
  var up = null;

  function makeUp() {
    if (up) return;
    up = document.createElement('button');
    up.className = 'dp-up';
    up.type = 'button';
    up.setAttribute('aria-label', 'بازگشت به بالای صفحه');
    up.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m6 14 6-6 6 6"/></svg>';
    up.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    document.body.appendChild(up);
  }

  var upTick = false;
  window.addEventListener('scroll', function () {
    if (upTick) return;
    upTick = true;
    requestAnimationFrame(function () {
      var show = window.scrollY > 900;
      if (show) { makeUp(); up.classList.add('is-on'); }
      else if (up) up.classList.remove('is-on');
      upTick = false;
    });
  }, { passive: true });

  /* ============================================================
     ۶. تصویر شکسته → جایگزین آبرومند
     ------------------------------------------------------------
     اگر تصویری بارگذاری نشد، به‌جای آیکون شکسته‌ی مرورگر،
     یک پس‌زمینه‌ی طلایی ملایم نشان داده می‌شود.
     ============================================================ */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.dpFallback) return;
    img.dataset.dpFallback = '1';
    img.classList.add('dp-img-fail');
    img.removeAttribute('src');
  }, true);

  /* ============================================================
     ۷. برخط / برون‌خط
     ------------------------------------------------------------
     اگر اینترنت قطع شد، کاربر باید بداند — نه اینکه فکر کند
     سایت خراب است.
     ============================================================ */
  var netBar = null;

  function net(online) {
    if (online) {
      if (netBar) { netBar.classList.remove('is-on'); }
      return;
    }
    if (!netBar) {
      netBar = document.createElement('div');
      netBar.className = 'dp-net';
      netBar.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" aria-hidden="true">' +
        '<path d="M12 18h.01"/><path d="M8.5 14.5a5 5 0 0 1 7 0"/>' +
        '<path d="M5 11a10 10 0 0 1 14 0"/><path d="m3 3 18 18"/></svg>' +
        '<span>اینترنت قطع است — تغییرها ذخیره می‌شوند و پس از وصل شدن ارسال می‌شوند.</span>';
      document.body.appendChild(netBar);
    }
    requestAnimationFrame(function () { netBar.classList.add('is-on'); });
  }

  window.addEventListener('online', function () { net(true); });
  window.addEventListener('offline', function () { net(false); });
  if (navigator.onLine === false) net(false);

  /* ============================================================
     ۸. تأیید کارهای برگشت‌ناپذیر
     ------------------------------------------------------------
     هر دکمه‌ای با `data-confirm` پیش از اجرا می‌پرسد.
     ============================================================ */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-confirm]');
    if (!b) return;
    if (b.dataset.dpOk === '1') { delete b.dataset.dpOk; return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (window.confirm(b.dataset.confirm)) {
      b.dataset.dpOk = '1';
      b.click();
    }
  }, true);

  /* ============================================================
     ۹. کلید میان‌بر — بازگشت با Backspace خطرناک است، ولی
        Alt+ArrowRight برای رفتن به صفحه‌ی پیش مفید است
     ============================================================ */
  window.DPPolish = { net: net };
})();
