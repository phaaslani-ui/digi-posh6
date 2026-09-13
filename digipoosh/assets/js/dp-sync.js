/* ============================================================
   دیجی‌پوش — انتقال داده بین مرورگرها
   ------------------------------------------------------------
   مشکلی که کاربر گفت: «اگر کد را در مرورگر دیگری باز کنی،
   کل اطلاعات می‌پرد.»

   چرا این اتفاق می‌افتد؟

     تا وقتی Supabase وصل نشده، همه‌چیز در `localStorage`
     همان مرورگر ذخیره می‌شود. `localStorage` عمداً به
     مرورگر و دامنه گره خورده است — کروم داده‌ی فایرفاکس
     را نمی‌بیند، و بالعکس. این یک ایراد نیست، طراحی
     مرورگر است.

   دو راه‌حل، هر دو ساخته شد:

     ۱. **راه اصلی (رایگان و همیشگی):** اتصال Supabase.
        وقتی وصل شد، داده روی سرور می‌رود و از هر دستگاهی
        دیده می‌شود. راهنمایش در `راهنمای-بک‌اند.md` است.

     ۲. **راه فوری (بدون سرور):** پشتیبان‌گیری با فایل.
        یک فایل کوچک می‌گیرید و در مرورگر دیگر بازش
        می‌کنید. همه‌چیز برمی‌گردد.

   این فایل راه دوم را می‌سازد، و اگر Supabase وصل نباشد
   به مدیر هشدار می‌دهد که داده‌اش موقتی است.
   ============================================================ */
'use strict';

(function () {

  var FILE_TAG = 'digipoosh-backup';
  var FORMAT = 2;

  /* کلیدهایی که نباید منتقل شوند — نشست و موقتی‌ها */
  var SKIP = {
    dp_session: 1,
    dp_customer_session: 1,
    dp_admin_session: 1,
    dp_token: 1,
    dp_backup_before_reset: 1,
    dp_last_filter: 1,
    /* پشتیبانِ «برگرداندن» نباید در فایل بیاید و نباید هنگام
       جایگزینی کامل پاک شود — وگرنه راه برگشت از بین می‌رود */
    dp_undo_restore: 1,
  };

  /* ============================================================
     گرفتن پشتیبان
     ============================================================ */
  function collect() {
    var data = {};
    var n = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (k.indexOf('dp_') !== 0 && k.indexOf('dpw_') !== 0) continue;
        if (SKIP[k]) continue;
        data[k] = localStorage.getItem(k);
        n++;
      }
    } catch (e) { /* حافظه در دسترس نیست */ }
    return { data: data, count: n };
  }

  /** خلاصه‌ی خوانا از محتوای پشتیبان */
  function summarize(data) {
    var num = function (k) {
      try {
        var v = JSON.parse(data[k]);
        return Array.isArray(v) ? v.length : 0;
      } catch (e) { return 0; }
    };
    return {
      sellers:   num('dp_users'),
      products:  num('dp_products') + num('dpw_products'),
      orders:    num('dp_orders') + num('dpw_orders'),
      customers: num('dp_customers'),
      reviews:   num('dp_reviews'),
      coupons:   num('dp_coupons'),
    };
  }

  function makeFile() {
    var c = collect();
    var box = {
      tag: FILE_TAG,
      format: FORMAT,
      at: new Date().toISOString(),
      origin: location.origin,
      keys: c.count,
      summary: summarize(c.data),
      data: c.data,
    };
    return JSON.stringify(box, null, 1);
  }

  /** نام فایل با تاریخ شمسی — تا چند پشتیبان قاطی نشوند */
  function fileName() {
    var d = new Date();
    var fa;
    try {
      fa = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(d).replace(/\//g, '-');
    } catch (e) {
      fa = d.toISOString().slice(0, 10);
    }
    var t = String(d.getHours()).padStart(2, '0')
          + String(d.getMinutes()).padStart(2, '0');
    return 'digipoosh-' + fa + '-' + t + '.json';
  }

  function download() {
    var text = makeFile();
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    return summarize(collect().data);
  }

  /* ============================================================
     بازگرداندن پشتیبان
     ------------------------------------------------------------
     دو حالت:
       merge   → داده‌ی تازه روی قدیمی می‌نشیند ولی چیزی
                 که در فایل نیست، پاک نمی‌شود
       replace → همه‌چیز پاک و از فایل ساخته می‌شود
     ============================================================ */
  function restore(text, mode) {
    var box;
    try { box = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'فایل خوانده نشد — شاید خراب شده باشد.' }; }

    if (!box || box.tag !== FILE_TAG || !box.data || typeof box.data !== 'object') {
      return { ok: false, error: 'این فایل پشتیبان دیجی‌پوش نیست.' };
    }
    if (Number(box.format) > FORMAT) {
      return { ok: false, error: 'این فایل از نسخه‌ی تازه‌تری است. اول سایت را به‌روز کنید.' };
    }

    /* پیش از هر کاری، از وضعیت فعلی پشتیبان بگیر —
       اگر فایل اشتباهی بازگردانده شد، راه برگشت باشد.

       ⚠ این پشتیبان باید *پیش از* هر تغییری ساخته شود، نه
       بعدش — وگرنه «برگرداندن» همان وضعیت خرابِ بعد از
       بازگردانی را برمی‌گرداند و بی‌فایده است. */
    var safety = makeFile();
    try { localStorage.setItem('dp_undo_restore', safety); } catch (e) { /* جا نبود */ }

    try {
      if (mode === 'replace') {
        var kill = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && (k.indexOf('dp_') === 0 || k.indexOf('dpw_') === 0) && !SKIP[k]) {
            kill.push(k);
          }
        }
        kill.forEach(function (x) { localStorage.removeItem(x); });
      }

      var n = 0;
      Object.keys(box.data).forEach(function (k) {
        if (k.indexOf('dp_') !== 0 && k.indexOf('dpw_') !== 0) return;
        if (SKIP[k]) return;
        var v = box.data[k];
        if (typeof v !== 'string') return;
        localStorage.setItem(k, v);
        n++;
      });

      /* نشانه‌ی پاک‌سازی را بالا نگه دار تا dp-reset.js
         داده‌ی تازه‌بازگردانده را پاک نکند */
      localStorage.setItem('dp_reset_v', '99');

      return { ok: true, keys: n, summary: box.summary || summarize(box.data), at: box.at };
    } catch (e) {
      return { ok: false, error: 'نوشتن در حافظه ممکن نشد — شاید حافظه پر است.' };
    }
  }

  /** برگرداندن آخرین بازگردانی */
  function undoRestore() {
    var t = null;
    try { t = localStorage.getItem('dp_undo_restore'); } catch (e) { /* */ }
    if (!t) return { ok: false, error: 'چیزی برای برگرداندن نیست.' };
    var r = restore(t, 'replace');
    try { localStorage.removeItem('dp_undo_restore'); } catch (e) { /* */ }
    return r;
  }

  /* ============================================================
     خواندن فایل انتخاب‌شده
     ============================================================ */
  function readFile(file) {
    return new Promise(function (done, fail) {
      if (!file) { fail(new Error('فایلی انتخاب نشد.')); return; }
      if (file.size > 12 * 1024 * 1024) {
        fail(new Error('فایل بیش از حد بزرگ است.')); return;
      }
      var fr = new FileReader();
      fr.onload = function () { done(String(fr.result || '')); };
      fr.onerror = function () { fail(new Error('فایل خوانده نشد.')); };
      fr.readAsText(file, 'utf-8');
    });
  }

  /* ============================================================
     آیا داده روی سرور است یا فقط همین مرورگر؟
     ============================================================ */
  function isRemote() {
    var C = window.DP_CONFIG || {};
    return !!(C.supabaseUrl && C.supabaseAnonKey);
  }

  function health() {
    var c = collect();
    return {
      remote: isRemote(),
      keys: c.count,
      summary: summarize(c.data),
      /* حافظه‌ی مرورگر چقدر پر شده؟ سقف معمولاً ۵ مگابایت */
      bytes: (function () {
        var t = 0;
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            t += (k || '').length + (localStorage.getItem(k) || '').length;
          }
        } catch (e) { /* */ }
        return t * 2;         /* هر نویسه دو بایت */
      })(),
    };
  }

  window.DPSync = {
    collect: collect,
    summarize: summarize,
    makeFile: makeFile,
    fileName: fileName,
    download: download,
    restore: restore,
    undoRestore: undoRestore,
    readFile: readFile,
    isRemote: isRemote,
    health: health,
  };
})();
