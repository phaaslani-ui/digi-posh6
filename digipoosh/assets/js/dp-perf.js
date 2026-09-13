/* ============================================================
   دیجی‌پوش — لایه‌ی بهینه‌سازی کارایی (جاوااسکریپت)
   ------------------------------------------------------------
   این فایل رفتار سایت را عوض نمی‌کند؛ فقط کارهای سنگین را
   هوشمندتر انجام می‌دهد:

     ۱. انیمیشن‌ها را وقتی برگه پنهان است متوقف می‌کند
     ۲. پس از پایان حرکت، حافظه‌ی کارت گرافیک را آزاد می‌کند
     ۳. تصویرهای جامانده را تنبل می‌کند
     ۴. روی دستگاه ضعیف، تزئینات را کم می‌کند
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ۱. تشخیص توان دستگاه
     ------------------------------------------------------------
     اگر دستگاه ضعیف بود، کلاس `dp-low` روی صفحه می‌نشیند و
     CSS خودش تزئینات را کم می‌کند.
     ============================================================ */
  function weakDevice() {
    var cores = navigator.hardwareConcurrency || 4;
    var ram   = navigator.deviceMemory || 4;
    var net   = navigator.connection && navigator.connection.effectiveType;
    var slow  = net === 'slow-2g' || net === '2g' || net === '3g';
    var save  = navigator.connection && navigator.connection.saveData;

    return cores <= 4 || ram <= 4 || slow || save === true;
  }

  if (weakDevice()) document.documentElement.classList.add('dp-low');

  /* ============================================================
     ۲. آزادسازی لایه‌ی گرافیکی پس از پایان انیمیشن ورود
     ------------------------------------------------------------
     `will-change` اگر روشن بماند برای هر عنصر یک لایه‌ی جدا
     روی کارت گرافیک می‌سازد. با ۴۰ کارت، یعنی ۴۰ لایه‌ی
     بی‌مصرف. اینجا پس از پایان حرکت آزاد می‌شود.
     ============================================================ */
  document.addEventListener('transitionend', function (e) {
    var el = e.target;
    if (!el.classList) return;
    if (el.classList.contains('visible') || el.classList.contains('is-visible')) {
      el.classList.add('done');
    }
  }, { passive: true });

  document.addEventListener('animationend', function (e) {
    var el = e.target;
    if (el.classList && el.classList.contains('reveal')) el.classList.add('done');
  }, { passive: true });

  /* ============================================================
     ۳. توقف انیمیشن وقتی برگه پنهان است
     ------------------------------------------------------------
     اگر کاربر به برگه‌ی دیگری رفت، دلیلی ندارد ذره‌ها بچرخند
     و باتری بخورند.
     ============================================================ */
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('dp-paused', document.hidden);
  });

  /* ============================================================
     ۴. تصویرهای جامانده — تنبل و غیرهمگام
     ------------------------------------------------------------
     هر تصویری که `loading="lazy"` ندارد و در دید اول نیست،
     خودکار تنبل می‌شود. تصویر نخست دست‌نخورده می‌ماند تا
     بزرگ‌ترین عنصر صفحه زود بیاید.
     ============================================================ */
  function tuneImages() {
    var imgs = document.querySelectorAll('img');
    var first = true;

    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];

      /* رمزگشایی غیرهمگام — رشته‌ی اصلی را قفل نمی‌کند */
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

      /* اسلاید نخست باید فوری بیاید — بزرگ‌ترین عنصر صفحه است */
      if (first && img.closest('.slide, .slide-m, .hero, .hero-slider')) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
        first = false;
        continue;
      }

      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    }
  }

  /* ============================================================
     ۵. iframe و ویدیو هم تنبل شوند
     ============================================================ */
  function tuneFrames() {
    var fr = document.querySelectorAll('iframe:not([loading])');
    for (var i = 0; i < fr.length; i++) fr[i].setAttribute('loading', 'lazy');
  }

  /* ============================================================
     ۶. ابزار مشترک — برای استفاده‌ی بقیه‌ی فایل‌ها
     ============================================================ */

  /** تأخیر انداختن اجرا تا وقتی کاربر دست بردارد */
  function debounce(fn, wait) {
    var t;
    wait = wait || 200;
    return function () {
      var self = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  /** حداکثر یک بار در هر فریم اجرا شود */
  function raf(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      var self = this, args = arguments;
      requestAnimationFrame(function () {
        fn.apply(self, args);
        queued = false;
      });
    };
  }

  /** ناظر ورود به دید — یک نمونه برای همه */
  var revealObserver = null;

  function observeReveal(selector) {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add('visible', 'done');
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries, obs) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('visible');
            obs.unobserve(entries[i].target);   /* دیگر رصد نمی‌شود */
          }
        }
      }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
    }

    document.querySelectorAll(selector).forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ============================================================
     ۷. کارهای کم‌اولویت را به وقت بیکاری موکول کن
     ============================================================ */
  var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1); };

  /* ============================================================
     ۸. خواباندن لایه‌ی تزئینی وقتی دیده نمی‌شود
     ------------------------------------------------------------
     لایه‌ی تزئینی `position: fixed` است، پس مرورگر هیچ‌وقت
     آن را «بیرون از دید» نمی‌شمارد و انیمیشنش تا ابد کار
     می‌کند — حتی وقتی کاربر ته صفحه است.

     اینجا وقتی کاربر بیش از یک صفحه پایین رفت، انیمیشن‌ها
     خوابانده می‌شوند و با برگشت به بالا دوباره بیدار می‌شوند.
     پیمایش هم throttle شده تا خودش هزینه نسازد.
     ============================================================ */
  function watchAmbient() {
    var layer = document.querySelector('.ambient, .page-ambient, .page-ambient-m');
    if (!layer) return;

    var idleNow = false;
    var ticking = false;

    var check = function () {
      ticking = false;
      var far = window.scrollY > window.innerHeight;
      if (far === idleNow) return;
      idleNow = far;
      document.body.classList.toggle('dp-idle', far);
    };

    /*
     * `raf()` بالا یک «سازنده»ی تابع است، نه زمان‌بند.
     * پس اینجا مستقیم از requestAnimationFrame استفاده می‌کنیم
     * تا بررسی دقیقاً یک بار در هر فریم انجام شود.
     */
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }, { passive: true });

    /* وقتی زبانه پنهان است، هیچ انیمیشنی نباید بچرخد */
    document.addEventListener('visibilitychange', function () {
      document.body.classList.toggle('dp-idle', document.hidden || idleNow);
    });

    check();
  }

  function boot() {
    tuneImages();
    watchAmbient();
    idle(tuneFrames);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();

  /* در دسترس بقیه‌ی فایل‌ها */
  window.DPPerf = {
    debounce: debounce,
    raf: raf,
    observeReveal: observeReveal,
    idle: idle,
    isWeak: weakDevice,
  };
})();
