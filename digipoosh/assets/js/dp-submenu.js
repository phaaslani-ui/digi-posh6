/* ============================================================
   دیجی‌پوش — جایگذاری زیرمنوی «فروشندگان»
   ------------------------------------------------------------
   زیرمنو با موقعیت fixed روی صفحه می‌نشیند تا نوار ناوبری
   (که backdrop-filter دارد) آن را نبُرد.

   این فایل فقط جای دقیق زیرمنو را حساب می‌کند:
     • درست زیر دکمه، وسط‌چین
     • اگر به لبه‌ی صفحه برسد، به داخل هل داده می‌شود
     • با پیمایش و تغییر اندازه دوباره حساب می‌شود

   باز و بسته شدن اینجا مدیریت می‌شود — نه با hover خالصِ CSS.
   چرا؟ چون hover خالص لحظه‌ای که موشواره از دکمه بیرون برود
   منو را می‌بندد؛ کاربر مهلت ندارد موشواره را داخل منو ببرد و
   ناچار می‌شود کلیک کند. اینجا مهلت کوتاهی می‌گذاریم.
   ============================================================ */
'use strict';

(function () {
  var GAP = 10;    /* فاصله‌ی زیرمنو تا دکمه */
  var EDGE = 12;   /* کمترین فاصله تا لبه‌ی پنجره */

  /* مهلت بسته شدن پس از بیرون رفتن موشواره (میلی‌ثانیه).
     کوتاه‌تر از این، کاربر فرصت رسیدن به منو را ندارد. */
  var CLOSE_DELAY = 260;

  var items = [];
  var closeTimer = null;
  var openItem = null;

  /* پس از Escape، تمرکز به دکمه برمی‌گردد و همان تمرکز منو را
     دوباره باز می‌کرد. این نشانه جلوی آن باز شدن را می‌گیرد. */
  var suppressFocus = false;

  /* آیا دستگاه اصلاً موشواره دارد؟ روی لمسی رفتار فرق می‌کند. */
  function hasHover() {
    try { return window.matchMedia('(hover: hover)').matches; }
    catch (e) { return true; }
  }

  /*
   * کلاس باز/بسته باید روی **هر دو** بنشیند:
   *   • روی `li`  → برای چرخاندن فلش و پل نامرئی
   *   • روی منو   → چون منو دیگر فرزند `li` نیست
   */
  function markOpen(it) {
    it.li.classList.add('is-open');
    it.menu.classList.add('is-open');
  }

  function markClosed(it) {
    it.li.classList.remove('is-open');
    it.menu.classList.remove('is-open');
  }

  function collect() {
    items = [];
    document.querySelectorAll('.has-sub').forEach(function (li) {
      var link = li.querySelector(':scope > a');
      /* منو ممکن است قبلاً به body منتقل شده باشد */
      var menu = li.querySelector(':scope > .submenu') || li._dpMenu;
      if (!link || !menu) return;

      /* ============================================================
         منو باید از نوار ناوبری بیرون بیاید
         ------------------------------------------------------------
         نوار ناوبری `backdrop-filter` دارد و طبق استاندارد CSS
         این ویژگی یک «بلوک دربرگیرنده»ی تازه می‌سازد. یعنی
         `position: fixed` فرزندان، به‌جای پنجره، نسبت به خودِ
         نوار جای‌گذاری می‌شود — و منو داخل نوار کوتاه حبس و
         بریده می‌شد.

         با انتقال به `body` این حبس برداشته می‌شود.
         پیوند دوطرفه نگه داشته می‌شود تا رویدادها کار کنند.
         ============================================================ */
      if (menu.parentElement !== document.body) {
        document.body.appendChild(menu);
      }
      li._dpMenu = menu;
      menu._dpLi = li;

      items.push({ li: li, link: link, menu: menu });
    });
  }

  /* ============================================================
     حساب کردن جای زیرمنو
     ============================================================ */
  function place(it) {
    var r = it.link.getBoundingClientRect();

    /* اندازه‌ی واقعی زیرمنو — حتی وقتی پنهان است */
    var w = it.menu.offsetWidth || 210;
    var h = it.menu.offsetHeight || 240;

    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;

    /* ---------- افقی: وسط دکمه، ولی همیشه داخل صفحه ---------- */
    var x = r.left + r.width / 2 - w / 2;
    var maxX = vw - w - EDGE;
    if (x > maxX) x = maxX;
    if (x < EDGE) x = EDGE;

    /* ---------- عمودی ----------
       پیش‌تر همیشه زیر دکمه می‌نشست. اگر گزینه‌ها زیاد بودند
       یا صفحه کوتاه بود، نیمه‌ی پایینی از پنجره می‌زد بیرون و
       دیده نمی‌شد. حالا اگر پایین جا نبود، بالای دکمه می‌آید؛
       و در هر حال داخل پنجره نگه داشته می‌شود. */
    var y = r.bottom + GAP;

    if (y + h > vh - EDGE) {
      var above = r.top - GAP - h;
      if (above >= EDGE) {
        y = above;                       /* بالای دکمه جا هست */
      } else {
        y = Math.max(EDGE, vh - h - EDGE);   /* هل به داخل */
      }
    }

    it.menu.style.setProperty('--dps-x', Math.round(x) + 'px');
    it.menu.style.setProperty('--dps-y', Math.round(y) + 'px');
  }

  function placeAll() {
    for (var i = 0; i < items.length; i++) place(items[i]);
  }

  /* ============================================================
     باز و بسته کردن
     ============================================================ */
  function closeAll() {
    clearTimeout(closeTimer);
    closeTimer = null;
    openItem = null;
    items.forEach(markClosed);
  }

  function open(it) {
    clearTimeout(closeTimer);
    closeTimer = null;

    /* اگر منوی دیگری باز است، بی‌درنگ بسته شود */
    if (openItem && openItem !== it) markClosed(openItem);

    place(it);
    /* منوی حساب اگر باز است بسته شود — دو منوی هم‌زمان گیج‌کننده است */
    document.querySelectorAll('body > .dp-pop.open').forEach(function (x) {
      x.classList.remove('open');
      var c = document.querySelector('.dp-chip[aria-expanded="true"]');
      if (c) c.setAttribute('aria-expanded', 'false');
    });

    markOpen(it);
    openItem = it;
  }

  /* بستن با مهلت — تا حرکت موشواره از دکمه به منو نشکند */
  function scheduleClose(it) {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      /* اگر در این فاصله موشواره برگشته، بسته نشود */
      if (it.li.matches(':hover') || it.menu.matches(':hover')) return;
      /* اگر تمرکز صفحه‌کلید داخل دکمه یا منوست، بسته نشود.
         منو جدا شده، پس هر دو باید بررسی شوند. */
      if (it.li.contains(document.activeElement)) return;
      if (it.menu.contains(document.activeElement)) return;
      markClosed(it);
      if (openItem === it) openItem = null;
    }, CLOSE_DELAY);
  }

  /* ============================================================
     رویدادها
     ============================================================ */
  function wire() {
    collect();
    if (!items.length) return;

    items.forEach(function (it) {

      /* ---------- موشواره روی دکمه ---------- */
      it.li.addEventListener('mouseenter', function () {
        if (hasHover()) open(it);
      });

      it.li.addEventListener('mouseleave', function () {
        if (hasHover()) scheduleClose(it);
      });

      /*
       * خودِ زیرمنو هم شنونده دارد.
       * چون زیرمنو `position: fixed` است، از نظر مرورگر ممکن
       * است بیرون از `li` حساب شود و رویدادهای بالا به آن
       * نرسند. این دو خط تضمین می‌کند تا وقتی موشواره داخل
       * منوست، منو باز بماند.
       */
      it.menu.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        closeTimer = null;
      });

      it.menu.addEventListener('mouseleave', function () {
        if (hasHover()) scheduleClose(it);
      });

      /* ---------- صفحه‌کلید ---------- */
      it.link.addEventListener('focus', function () {
        if (suppressFocus) return;
        open(it);
      });

      it.li.addEventListener('focusout', function () {
        setTimeout(function () {
          if (!it.li.contains(document.activeElement) &&
              !it.menu.contains(document.activeElement) &&
              !it.li.matches(':hover') && !it.menu.matches(':hover')) {
            markClosed(it);
            if (openItem === it) openItem = null;
          }
        }, 0);
      });

      /* ---------- کلیک / لمس ---------- */
      it.link.addEventListener('click', function (e) {
        /*
         * دستگاه لمسی: نخستین لمس فقط باز می‌کند.
         * دستگاه با موشواره: منو از قبل با hover باز است، پس
         * کلیک روی «فروشندگان» باید کار همیشگی‌اش را بکند
         * (رفتن به بخش فروشندگان) — جلویش را نمی‌گیریم.
         */
        if (hasHover()) return;
        if (!it.li.classList.contains('is-open')) {
          e.preventDefault();
          closeAll();
          open(it);
        }
      });
    });

    /* بستن با کلیک بیرون یا کلید Escape */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.has-sub') && !e.target.closest('.submenu')) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var focused = openItem;
      closeAll();
      if (focused && focused.link.focus) {
        suppressFocus = true;
        focused.link.focus();
        setTimeout(function () { suppressFocus = false; }, 0);
      }
    });

    /* نوار ناوبری هنگام پیمایش کوتاه می‌شود — جا باید به‌روز شود */
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { placeAll(); tick = false; });
    }, { passive: true });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(placeAll, 120);
    }, { passive: true });

    /* یک بار در آغاز */
    placeAll();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', wire, { once: true })
    : wire();

  window.DPSubmenu = { refresh: placeAll, closeAll: closeAll };
})();
