/* ============================================================
   دیجی‌پوش — پاک‌سازی یک‌باره‌ی داده‌ها
   ------------------------------------------------------------
   این فایل هنگام نخستین بازدید، داده‌های آزمایشی را پاک
   می‌کند و سایت را صفر می‌کند. پس از یک بار اجرا، نشانه‌ای
   می‌گذارد و دیگر هرگز داده‌های تازه را پاک نمی‌کند.

   ⚠️ اگر روزی خواستید دوباره همه‌چیز صفر شود:
      شماره‌ی VERSION را یک واحد بالا ببرید.

   ------------------------------------------------------------
   محافظ‌های ایمنی (افزوده‌شده پس از بازرسی):

     ۱. پیش از پاک کردن، یک نسخه‌ی پشتیبان کامل در
        `dp_backup_before_reset` نگه داشته می‌شود.
        با `DPReset.undo()` همه‌چیز برمی‌گردد.

     ۲. اگر داده‌ی «واقعی» پیدا شود (فروشگاه تأییدشده،
        سفارش ثبت‌شده یا مشتری عضو)، پاک‌سازی خودکار
        انجام نمی‌شود و فقط هشدار داده می‌شود. برای
        اجبار باید `DPReset.force()` صدا زده شود.

   چرا؟ چون یک بار بالا بردن اشتباهی VERSION روی سایت
   زنده، یعنی از دست رفتن همه‌ی فروشگاه‌ها و سفارش‌ها
   بدون هیچ راه بازگشتی.
   ============================================================ */
'use strict';

(function () {
  var VERSION = 1;                       // برای صفر کردن دوباره، این را زیاد کنید
  var FLAG = 'dp_reset_v';
  var BACKUP = 'dp_backup_before_reset';

  /** همه‌ی کلیدهای dp_ به‌جز نشانه و پشتیبان */
  function dpKeys() {
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('dp_') === 0 && k !== FLAG && k !== BACKUP) keys.push(k);
      }
    } catch (e) { /* حافظه در دسترس نیست */ }
    return keys;
  }

  var readJson = function (k) {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(k));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };

  /**
   * آیا داده‌ی واقعی وجود دارد؟
   * فروشگاه تأییدشده، سفارش ثبت‌شده، یا مشتری عضو =
   * یعنی این سایت دیگر آزمایشی نیست.
   */
  function hasRealData() {
    var sellers = readJson('dp_users');
    var approved = sellers.filter(function (u) {
      return (u.status || '') === 'approved';
    }).length;

    return {
      any: approved > 0 || readJson('dp_orders').length > 0 ||
           readJson('dp_customers').length > 0,
      sellers: approved,
      orders: readJson('dp_orders').length,
      customers: readJson('dp_customers').length,
      products: readJson('dp_products').length,
    };
  }

  /** پشتیبان کامل پیش از پاک کردن */
  function backup(keys) {
    var box = { at: Date.now(), version: VERSION, data: {} };
    keys.forEach(function (k) {
      try { box.data[k] = localStorage.getItem(k); } catch (e) {}
    });
    try {
      localStorage.setItem(BACKUP, JSON.stringify(box));
      return true;
    } catch (e) {
      /* حافظه پر است — بدون پشتیبان پاک نمی‌کنیم */
      return false;
    }
  }

  /** بازگرداندن آخرین پشتیبان */
  function undo() {
    var box;
    try { box = JSON.parse(localStorage.getItem(BACKUP)); } catch (e) { box = null; }
    if (!box || !box.data) {
      console.warn('دیجی‌پوش: پشتیبانی برای بازگرداندن نیست.');
      return false;
    }
    Object.keys(box.data).forEach(function (k) {
      if (box.data[k] != null) localStorage.setItem(k, box.data[k]);
    });
    console.info('دیجی‌پوش: داده‌ها بازگردانده شد — صفحه را تازه کنید.');
    return true;
  }

  /** پاک‌سازی واقعی */
  function wipe(silent) {
    var keys = dpKeys();
    if (!keys.length) return 0;

    if (!backup(keys)) {
      console.warn('دیجی‌پوش: پشتیبان‌گیری نشد — پاک‌سازی انجام نشد.');
      return -1;
    }

    keys.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    if (!silent) {
      console.info('دیجی‌پوش: سایت صفر شد — ' + keys.length + ' مورد پاک شد. ' +
                   'برای بازگرداندن: DPReset.undo()');
    }
    return keys.length;
  }

  /* ---------- اجرای خودکار ---------- */
  try {
    if (Number(localStorage.getItem(FLAG)) < VERSION) {
      var real = hasRealData();

      if (real.any) {
        /* داده‌ی واقعی هست — دست نمی‌زنیم */
        console.warn(
          'دیجی‌پوش: پاک‌سازی خودکار انجام نشد چون داده‌ی واقعی پیدا شد ' +
          '(' + real.sellers + ' فروشگاه تأییدشده، ' + real.orders + ' سفارش، ' +
          real.customers + ' مشتری). اگر واقعاً می‌خواهید همه‌چیز صفر شود: ' +
          'DPReset.force()'
        );
        /* نشانه گذاشته می‌شود تا این هشدار هر بار تکرار نشود */
        localStorage.setItem(FLAG, String(VERSION));
      } else {
        wipe(false);
        localStorage.setItem(FLAG, String(VERSION));
      }
    }
  } catch (e) {
    /* اگر مرورگر اجازه‌ی ذخیره‌سازی ندهد، بی‌صدا رد می‌شویم */
  }

  /* ---------- ابزار دستی ---------- */
  if (typeof window !== 'undefined') {
    window.DPReset = {
      /** پاک کردن اجباری — با پشتیبان */
      force: function () {
        var n = wipe(false);
        try { localStorage.setItem(FLAG, String(VERSION)); } catch (e) {}
        return n;
      },
      /** بازگرداندن آخرین پشتیبان */
      undo: undo,
      /** گزارش وضعیت */
      status: function () {
        var r = hasRealData();
        var hasBackup = false;
        try { hasBackup = !!localStorage.getItem(BACKUP); } catch (e) {}
        return {
          version: VERSION,
          done: Number(localStorage.getItem(FLAG)) >= VERSION,
          keys: dpKeys().length,
          hasBackup: hasBackup,
          real: r,
        };
      },
    };
  }
})();
