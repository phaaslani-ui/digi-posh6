/* ============================================================
   dp-vision.js — استخراج رنگ از عکس
   ------------------------------------------------------------
   صادقانه بگویم این چه می‌کند و چه نمی‌کند:

   ✅ می‌کند:
      · رنگ‌های غالب عکس را **واقعاً** استخراج می‌کند
      · حاشیه و پس‌زمینه را کنار می‌گذارد
      · رنگ‌ها را به دانشنامه‌ی ۱۱۶ رنگی نگاشت می‌کند
      · کالاهای هم‌رنگ را در سایت پیدا می‌کند

   ❌ نمی‌کند:
      · نمی‌فهمد این «پیراهن» است یا «کیف»
      · طرح پارچه را تشخیص نمی‌دهد
      · برند را نمی‌شناسد

   برای آن سه مورد، مدل بینایی لازم است که هزینه‌ی ماهانه
   دارد. ولی همین رنگ‌شناسی به‌تنهایی کاربردی است: مشتری
   عکس یک لباس را می‌فرستد و کالاهای هم‌رنگ را می‌بیند.

   روش: کوانتیزه کردن رنگ + شمارش هیستوگرام. همان کاری که
   ابزارهای «color picker» می‌کنند، فقط دقیق‌تر چون
   پیکسل‌های بی‌اهمیت را حذف می‌کند.
   ============================================================ */
(function () {
  'use strict';

  /* اندازه‌ی نمونه‌برداری — بزرگ‌تر یعنی دقیق‌تر ولی کندتر.
     ۱۲۰ پیکسل برای تشخیص رنگ کاملاً کافی است. */
  var SAMPLE = 120;

  /* چند رنگ برگردانده شود */
  var TOP_N = 5;

  /* ============================================================
     خواندن عکس در بوم
     ============================================================ */
  function toCanvas(img) {
    /* محافظ: عکس ممکن است null یا شیء ناقص باشد.
       بدون این، کل صفحه با TypeError می‌شکند. */
    if (!img || typeof img !== 'object') return null;

    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    if (!w || !h) return null;

    /* نسبت را نگه دار، بزرگ‌ترین ضلع را به SAMPLE برسان */
    var scale = Math.min(SAMPLE / w, SAMPLE / h, 1);
    var cw = Math.max(1, Math.round(w * scale));
    var ch = Math.max(1, Math.round(h * scale));

    var cv = document.createElement('canvas');
    cv.width = cw;
    cv.height = ch;

    var ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, cw, ch);
    return { ctx: ctx, w: cw, h: ch };
  }

  /* ============================================================
     آیا این پیکسل ارزش شمردن دارد؟
     ------------------------------------------------------------
     سه دسته پیکسل حذف می‌شوند:
       ۱. شفاف — بخشی از عکس نیست
       ۲. سفید یا مشکی مطلق — معمولاً پس‌زمینه یا سایه
       ۳. خاکستری بی‌رنگ روشن — کاغذ عکاسی
     ============================================================ */
  function useful(r, g, b, a) {
    if (a < 120) return false;

    var mx = Math.max(r, g, b);
    var mn = Math.min(r, g, b);
    var light = (mx + mn) / 2;
    var sat = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255));

    /* سفید کاغذی */
    if (light > 244 && sat < 0.08) return false;
    /* سیاه مطلق */
    if (light < 12) return false;

    return true;
  }

  /* ============================================================
     استخراج رنگ‌های غالب
     ------------------------------------------------------------
     خروجی: [{ hex, key, name, share }] از پرتکرار به کم‌تکرار
     ============================================================ */
  function extract(img) {
    if (!img) return [];
    var c = toCanvas(img);
    if (!c) return [];

    var data;
    try {
      data = c.ctx.getImageData(0, 0, c.w, c.h).data;
    } catch (e) {
      /* عکس از دامنه‌ی دیگر — بوم «آلوده» می‌شود و خواندنش
         ممنوع است. عکس آپلودی این مشکل را ندارد. */
      return [];
    }

    /* ---------- وزن مرکز ----------
       در عکس لباس، سوژه معمولاً وسط است و حاشیه پس‌زمینه.
       پس پیکسل‌های مرکزی وزن بیشتری می‌گیرند. */
    var cx = c.w / 2, cy = c.h / 2;
    var maxD = Math.sqrt(cx * cx + cy * cy);

    /* سطل‌بندی: هر کانال به ۱۶ پله تقسیم می‌شود
       → ۴۰۹۶ سطل ممکن، که برای رنگ کافی است */
    var bins = {};
    var total = 0;

    for (var y = 0; y < c.h; y++) {
      for (var x = 0; x < c.w; x++) {
        var i = (y * c.w + x) * 4;
        var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

        if (!useful(r, g, b, a)) continue;

        var dx = x - cx, dy = y - cy;
        var d = Math.sqrt(dx * dx + dy * dy) / maxD;
        var w = 1.35 - d * 0.7;          /* مرکز ۱٫۳۵ · گوشه ۰٫۶۵ */

        var key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
        if (!bins[key]) bins[key] = { n: 0, r: 0, g: 0, b: 0 };

        bins[key].n += w;
        bins[key].r += r * w;
        bins[key].g += g * w;
        bins[key].b += b * w;
        total += w;
      }
    }

    if (!total) return [];

    /* ---------- میانگین هر سطل ---------- */
    var list = Object.keys(bins).map(function (k) {
      var q = bins[k];
      return {
        r: Math.round(q.r / q.n),
        g: Math.round(q.g / q.n),
        b: Math.round(q.b / q.n),
        n: q.n,
      };
    });

    list.sort(function (a, b) { return b.n - a.n; });

    /* ---------- ادغام رنگ‌های نزدیک ----------
       دو سطل کنار هم عملاً یک رنگ‌اند. بدون ادغام،
       پنج «آبی» تقریباً یکسان برمی‌گردد. */
    var merged = [];
    list.forEach(function (q) {
      for (var i = 0; i < merged.length; i++) {
        var m = merged[i];
        var dr = m.r - q.r, dg = m.g - q.g, db = m.b - q.b;
        /* فاصله‌ی وزن‌دار چشم انسان */
        var dist = Math.sqrt(dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11);
        if (dist < 34) {
          /* ادغام: میانگین وزن‌دار */
          var tn = m.n + q.n;
          m.r = Math.round((m.r * m.n + q.r * q.n) / tn);
          m.g = Math.round((m.g * m.n + q.g * q.n) / tn);
          m.b = Math.round((m.b * m.n + q.b * q.n) / tn);
          m.n = tn;
          return;
        }
      }
      merged.push(q);
    });

    merged.sort(function (a, b) { return b.n - a.n; });

    /* ---------- نگاشت به دانشنامه ---------- */
    var out = [];
    var seen = {};

    for (var j = 0; j < merged.length && out.length < TOP_N; j++) {
      var q = merged[j];
      var share = q.n / total;
      if (share < 0.035) break;          /* کمتر از ۳٫۵٪ — نویز */

      var hex = '#' + [q.r, q.g, q.b].map(function (v) {
        return ('0' + v.toString(16)).slice(-2);
      }).join('');

      var key = '', name = '';
      if (window.DPPalette) {
        try {
          key = DPPalette.nearest(hex);
          if (key && DPPalette.HUE[key]) name = DPPalette.HUE[key].name;
        } catch (e) { /* بی‌اهمیت */ }
      }

      /* اگر دو سطل به یک رنگ دانشنامه نگاشت شدند، سهمشان
         جمع می‌شود — نه اینکه دوبار بیاید */
      if (key && seen[key] !== undefined) {
        out[seen[key]].share += share;
        continue;
      }
      if (key) seen[key] = out.length;

      out.push({
        hex: hex,
        key: key,
        name: name || 'نامشخص',
        share: share,
      });
    }

    /* درصدها گرد شوند */
    out.forEach(function (o) { o.percent = Math.round(o.share * 100); });
    return out;
  }

  /* ============================================================
     خواندن فایل کاربر
     ============================================================ */
  var MAX_BYTES = 8 * 1024 * 1024;      /* ۸ مگابایت */
  var OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

  function fromFile(file, cb) {
    if (!file) return cb('فایلی انتخاب نشد.');

    if (OK_TYPES.indexOf(file.type) < 0) {
      return cb('فقط عکس می‌شود فرستاد (JPG، PNG، WebP).');
    }
    if (file.size > MAX_BYTES) {
      return cb('عکس بزرگ‌تر از ۸ مگابایت است.');
    }

    var reader = new FileReader();

    reader.onerror = function () { cb('خواندن فایل انجام نشد.'); };

    reader.onload = function (e) {
      var img = new Image();

      img.onerror = function () { cb('این فایل عکس معتبری نیست.'); };

      img.onload = function () {
        var colors;
        try {
          colors = extract(img);
        } catch (err) {
          return cb('پردازش عکس انجام نشد.');
        }
        if (!colors.length) {
          return cb('رنگی از این عکس پیدا نشد. عکس روشن‌تری بفرستید.');
        }
        cb(null, { colors: colors, src: e.target.result });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  /* ============================================================
     یافتن کالاهای هم‌رنگ
     ------------------------------------------------------------
     امتیاز بر پایه‌ی دو چیز:
       ۱. چند رنگ مشترک دارند
       ۲. آن رنگ چقدر سهم عکس را داشت
     ============================================================ */
  function findSimilar(colors, pool, opt) {
    opt = opt || {};
    if (!colors || !colors.length || !window.DPPalette) return [];

    var wanted = {};
    colors.forEach(function (c) {
      if (c.key) wanted[c.key] = c.share;
    });

    var keys = Object.keys(wanted);
    if (!keys.length) return [];

    var out = [];

    pool.forEach(function (p) {
      if (!p || Number(p.stock) <= 0) return;

      var pc;
      try { pc = DPPalette.colorsOf(p); } catch (e) { return; }
      if (!pc.length) return;

      var score = 0;
      var hits = [];

      pc.forEach(function (k) {
        /* تطابق دقیق */
        if (wanted[k] !== undefined) {
          score += 100 * wanted[k];
          hits.push(k);
          return;
        }
        /* رنگ نزدیک — از موتور هماهنگی */
        var best = 0;
        keys.forEach(function (wk) {
          var s = DPPalette.pairScore(k, wk);
          /* فقط هم‌خانواده‌ها، نه «هماهنگ» */
          var A = DPPalette.HUE[k], B = DPPalette.HUE[wk];
          if (!A || !B) return;
          if (A.h != null && B.h != null) {
            var d = Math.abs(A.h - B.h);
            if (d > 180) d = 360 - d;
            if (d <= 22 && Math.abs(A.light - B.light) < 30) {
              best = Math.max(best, 62 * wanted[wk]);
            }
          } else if (A.h == null && B.h == null
            && Math.abs(A.light - B.light) < 22) {
            best = Math.max(best, 58 * wanted[wk]);
          }
        });
        score += best;
      });

      if (score < 12) return;

      /* کالای موجود و پرفروش کمی بالاتر */
      score += Math.min(8, (Number(p.sales) || 0) * 1.5);

      out.push({ p: p, score: Math.round(score), matched: hits });
    });

    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, opt.limit || 12);
  }

  window.DPVision = {
    SAMPLE: SAMPLE,
    extract: extract,
    fromFile: fromFile,
    findSimilar: findSimilar,
  };
})();
