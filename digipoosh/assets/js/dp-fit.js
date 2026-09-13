/* ============================================================
   dp-fit.js — موتور تطبیق سایز
   ------------------------------------------------------------
   مشتری اندازه‌های بدنش را یک بار وارد می‌کند، فروشنده جدول
   اندازه‌ی هر سایز را می‌دهد، و این موتور بهترین سایز را
   پیدا می‌کند.

   چرا مهم است؟ بیشترین دلیل مرجوعی در فروش آنلاین لباس،
   «سایز نخورد» است. هر مرجوعی هم برای فروشنده هزینه دارد
   هم اعتماد مشتری را کم می‌کند.

   ⚠️ نکته‌ای که در فرمول اولیه غلط بود:
   فرمول ساده‌ی |تفاوت| فرق «تنگ» و «گشاد» را نمی‌فهمد.
   اگر دور سینه‌ی شما ۹۵ و لباس ۹۰ باشد، لباس **تنگ** است و
   اصلاً پوشیده نمی‌شود. ولی اگر لباس ۱۰۰ باشد، فقط کمی
   گشاد است — که خیلی‌ها ترجیح می‌دهند.

   پس این موتور جهت تفاوت را هم می‌سنجد، نه فقط اندازه‌اش.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ۱. اندازه‌های بدن — تعریف کامل
     ============================================================ */
  var FIELDS = [
    { key: 'shoulder', name: 'عرض شانه',   min: 25, max: 70,  hint: 'از نوک یک شانه تا نوک شانه‌ی دیگر، از پشت' },
    { key: 'chest',    name: 'دور سینه',   min: 60, max: 160, hint: 'پرترین جای سینه، متر افقی و راحت' },
    { key: 'waist',    name: 'دور کمر',    min: 50, max: 160, hint: 'باریک‌ترین جای کمر، بالای ناف' },
    { key: 'hip',      name: 'دور باسن',   min: 60, max: 170, hint: 'پرترین جای باسن' },
    { key: 'height',   name: 'قد',         min: 120, max: 220, hint: 'بدون کفش، پشت به دیوار' },
    { key: 'arm',      name: 'طول آستین',  min: 40, max: 80,  hint: 'از نوک شانه تا مچ، آرنج کمی خم' },
    { key: 'inseam',   name: 'قد داخل پا', min: 50, max: 110, hint: 'از فاق تا قوزک پا' },
    { key: 'neck',     name: 'دور گردن',   min: 25, max: 55,  hint: 'پایین گردن، جایی که یقه می‌نشیند' },
    { key: 'thigh',    name: 'دور ران',    min: 35, max: 90,  hint: 'پرترین جای ران' },
  ];

  var BY_KEY = {};
  FIELDS.forEach(function (f) { BY_KEY[f.key] = f; });

  /* ============================================================
     ۲. سلیقه‌ی تناسب
     ------------------------------------------------------------
     دو نفر با اندازه‌ی یکسان، سایز متفاوت می‌خواهند. یکی
     چسبان دوست دارد، یکی گشاد.

     `ease` یعنی «چقدر لباس باید از بدن بزرگ‌تر باشد» —
     در دوخت به این «آزادی» می‌گویند و عدد واقعی صنعت است.
     ============================================================ */
  var FIT_PREF = {
    tight:    { name: 'چسبان',      ease: -1, tol: 3,  hint: 'لباس به بدن بچسبد' },
    tailored: { name: 'اندازه',     ease: 3,  tol: 4,  hint: 'نه تنگ نه گشاد — دوخت مرتب' },
    relaxed:  { name: 'راحت',       ease: 7,  tol: 6,  hint: 'کمی آزاد، راحت‌تر' },
    oversized:{ name: 'گشاد',       ease: 14, tol: 9,  hint: 'خیلی آزاد، سبک اورسایز' },
  };

  /* ============================================================
     ۳. وزن هر اندازه بر پایه‌ی نوع کالا
     ------------------------------------------------------------
     برای پیراهن، شانه و سینه مهم‌اند. برای شلوار، کمر و
     باسن. وزن یکسان برای همه، نتیجه‌ی بی‌معنی می‌دهد.
     ============================================================ */
  var WEIGHTS = {
    top: { shoulder: 0.26, chest: 0.30, waist: 0.16, hip: 0.04,
           arm: 0.14, neck: 0.06, height: 0.04 },

    bottom: { waist: 0.34, hip: 0.30, thigh: 0.16,
              inseam: 0.16, height: 0.04 },

    full: { shoulder: 0.18, chest: 0.22, waist: 0.20, hip: 0.20,
            height: 0.12, arm: 0.08 },

    outer: { shoulder: 0.30, chest: 0.30, waist: 0.12,
             arm: 0.18, height: 0.06, neck: 0.04 },

    /* پیش‌فرض — وقتی نوع کالا معلوم نیست */
    any: { shoulder: 0.20, chest: 0.20, waist: 0.20, hip: 0.15,
           height: 0.15, arm: 0.10 },
  };

  /* کدام جایگاه از کدام جدول وزن استفاده کند */
  var SLOT_GROUP = {
    top: 'top', bottom: 'bottom', full: 'full',
    outer: 'outer', modest: 'top', shoes: 'any',
    bag: 'any', accessory: 'any', under: 'top', home: 'any',
  };

  function groupOf(product) {
    if (!product) return 'any';
    if (window.DPStylist && DPStylist.slotOf) {
      try {
        var s = DPStylist.slotOf(product);
        return SLOT_GROUP[s] || 'any';
      } catch (e) { /* بی‌اهمیت */ }
    }
    return 'any';
  }

  /* ============================================================
     ۴. نمره‌ی یک اندازه
     ------------------------------------------------------------
     خروجی ۰ تا ۱. جهت تفاوت مهم است:

       لباس کوچک‌تر از بدن  → جریمه‌ی سنگین (اصلاً نمی‌رود)
       لباس بزرگ‌تر از بدن  → جریمه‌ی سبک (فقط گشاد است)

     مقدار «آزادی» از سلیقه‌ی مشتری می‌آید.
     ============================================================ */
  function axisScore(bodyCm, garmentCm, ease, tol, circumference) {
    var b = Number(bodyCm), g = Number(garmentCm);
    if (!isFinite(b) || !isFinite(g) || b <= 0 || g <= 0) return null;

    /* اندازه‌ی آرمانی لباس = بدن + آزادی */
    var ideal = circumference ? b + ease : b;
    var diff = g - ideal;          /* مثبت = گشادتر از دلخواه */

    if (Math.abs(diff) <= tol) {
      /* داخل بازه‌ی قابل قبول — نمره‌ی نزدیک کامل */
      return 1 - (Math.abs(diff) / tol) * 0.08;
    }

    var over = Math.abs(diff) - tol;

    if (diff < 0) {
      /* ---------- لباس تنگ است ----------
         هر سانتی‌متر کمبود خیلی گران است. لباس تنگ
         نه پوشیده می‌شود نه پس‌دادنی نیست. */
      return Math.max(0, 0.92 - over * 0.13);
    }

    /* ---------- لباس گشاد است ----------
       قابل تحمل‌تر. خیلی‌ها گشاد را ترجیح می‌دهند. */
    return Math.max(0, 0.92 - over * 0.055);
  }

  /* اندازه‌های «دور» — آزادی برایشان معنا دارد */
  var CIRCUM = { chest: 1, waist: 1, hip: 1, thigh: 1, neck: 1 };

  /* ============================================================
     ۵. نمره‌ی یک سایز کامل
     ============================================================ */
  function scoreSize(body, size, opt) {
    opt = opt || {};
    var pref = FIT_PREF[opt.fit] || FIT_PREF.tailored;
    var W = WEIGHTS[opt.group || 'any'] || WEIGHTS.any;

    var total = 0, used = 0;
    var detail = {};

    Object.keys(W).forEach(function (k) {
      var b = body[k];
      var g = size[k];
      if (b == null || g == null) return;

      var ease = CIRCUM[k] ? pref.ease : Math.max(0, pref.ease * 0.4);
      var tol = CIRCUM[k] ? pref.tol : pref.tol * 0.8;

      var sc = axisScore(b, g, ease, tol, !!CIRCUM[k]);
      if (sc == null) return;

      detail[k] = {
        body: b,
        garment: g,
        score: Math.round(sc * 100),
        diff: Math.round((g - b) * 10) / 10,
        name: BY_KEY[k] ? BY_KEY[k].name : k,
        /* حکم کوتاه برای نمایش */
        verdict: sc >= 0.92 ? 'ok' : (g < b ? 'tight' : 'loose'),
      };

      total += sc * W[k];
      used += W[k];
    });

    /* هیچ اندازه‌ی مشترکی نبود */
    if (used <= 0) return null;

    var score = total / used;

    return {
      label: size.label || size.size_label || '?',
      score: Math.max(0, Math.min(1, score)),
      percent: Math.round(Math.max(0, Math.min(1, score)) * 100),
      detail: detail,
      /* چند اندازه واقعاً سنجیده شد — برای اعتماد */
      axes: Object.keys(detail).length,
      coverage: Math.round((used / sumW(W)) * 100),
    };
  }

  function sumW(W) {
    var s = 0;
    Object.keys(W).forEach(function (k) { s += W[k]; });
    return s || 1;
  }

  /* ============================================================
     ۶. حکم تناسب
     ============================================================ */
  function verdictOf(percent) {
    if (percent >= 90) return { key: 'perfect', name: 'اندازه‌ی کامل', dots: 3,
      text: 'این سایز دقیقاً روی اندازه‌های شما می‌نشیند' };
    if (percent >= 80) return { key: 'great', name: 'تناسب خوب', dots: 2,
      text: 'با اطمینان می‌توانید این سایز را بگیرید' };
    if (percent >= 70) return { key: 'good', name: 'قابل قبول', dots: 1,
      text: 'می‌پوشید، ولی کاملاً اندازه نیست' };
    return { key: 'poor', name: 'مناسب نیست', dots: 0,
      text: 'این سایز را پیشنهاد نمی‌کنیم' };
  }

  /* ============================================================
     ۷. پیشنهاد سایز — تابع اصلی
     ------------------------------------------------------------
     ورودی:
       body   { shoulder, chest, waist, … }
       sizes  [{ label:'M', shoulder:44, chest:96, … }, …]
       opt    { fit:'tailored', product: {…} }
     ============================================================ */
  function recommend(body, sizes, opt) {
    opt = opt || {};
    if (!body || typeof body !== 'object') return null;
    if (!Array.isArray(sizes) || !sizes.length) return null;

    var group = opt.group || groupOf(opt.product);
    var fit = opt.fit || 'tailored';

    var scored = [];
    sizes.forEach(function (s) {
      var r = scoreSize(body, s, { fit: fit, group: group });
      if (r) scored.push(r);
    });

    if (!scored.length) return null;

    scored.sort(function (a, b) { return b.score - a.score; });

    scored.forEach(function (r) { r.verdict = verdictOf(r.percent); });

    var best = scored[0];

    return {
      best: best,
      alternatives: scored.slice(1, 3),
      all: scored,
      fit: fit,
      fitName: (FIT_PREF[fit] || FIT_PREF.tailored).name,
      group: group,
      message: messageFor(best, scored, fit),
      /* اگر پوشش کم است، به کاربر بگو نتیجه قطعی نیست */
      confident: best.axes >= 3 && best.coverage >= 55,
    };
  }

  /* ============================================================
     ۸. پیام انسانی
     ------------------------------------------------------------
     فقط عدد کافی نیست. مشتری باید بفهمد **چرا**.
     ============================================================ */
  function messageFor(best, all, fit) {
    var FA = function (n) {
      return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
    };

    var v = best.verdict;

    if (v.key === 'perfect') {
      return 'سایز ' + best.label + ' با ' + FA(best.percent)
        + '٪ روی اندازه‌های شما می‌نشیند. مثل لباس دوخته‌شده.';
    }

    /* کدام اندازه مشکل دارد؟ */
    var worst = null;
    Object.keys(best.detail).forEach(function (k) {
      var d = best.detail[k];
      if (!worst || d.score < worst.score) worst = d;
    });

    if (v.key === 'great') {
      var extra = '';
      if (worst && worst.score < 85) {
        extra = ' فقط ' + worst.name + 'ش '
          + (worst.verdict === 'tight' ? 'کمی تنگ' : 'کمی گشاد') + ' است.';
      }
      return 'سایز ' + best.label + ' با ' + FA(best.percent)
        + '٪ خوب می‌نشیند.' + extra;
    }

    if (v.key === 'good') {
      var why = '';
      if (worst) {
        why = ' ' + worst.name + ' '
          + (worst.verdict === 'tight'
              ? FA(Math.abs(worst.diff)) + ' سانت کم دارد'
              : FA(Math.abs(worst.diff)) + ' سانت زیاد است') + '.';
      }
      return 'سایز ' + best.label + ' با ' + FA(best.percent)
        + '٪ قابل قبول است، ولی کامل نیست.' + why;
    }

    return 'هیچ‌کدام از سایزهای موجود با اندازه‌های شما نمی‌خواند. '
      + 'بهترینشان سایز ' + best.label + ' با ' + FA(best.percent) + '٪ است.';
  }

  /* ============================================================
     ۹. اعتبارسنجی اندازه‌های بدن
     ============================================================ */
  function validateBody(raw) {
    var out = {}, errors = [], warnings = [];

    FIELDS.forEach(function (f) {
      var v = raw ? raw[f.key] : null;
      if (v == null || v === '') return;

      var n = Number(String(v).replace(/[۰-۹]/g, function (d) {
        return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
      }));

      if (!isFinite(n)) {
        errors.push(f.name + ' عدد نیست');
        return;
      }
      if (n < f.min || n > f.max) {
        errors.push(f.name + ' باید بین ' + f.min + ' تا ' + f.max + ' سانت باشد');
        return;
      }
      out[f.key] = Math.round(n * 10) / 10;
    });

    /* ---------- بررسی منطقی ----------
       اینها خطا نیستند، هشدارند — بدن‌ها متفاوت‌اند. */
    if (out.chest && out.waist && out.waist > out.chest + 25) {
      warnings.push('دور کمر خیلی بیشتر از دور سینه است — دوباره اندازه بگیرید');
    }
    if (out.hip && out.waist && out.waist > out.hip + 30) {
      warnings.push('دور کمر خیلی بیشتر از دور باسن است');
    }
    if (out.height && out.inseam && out.inseam > out.height * 0.62) {
      warnings.push('قد داخل پا نسبت به قد زیاد است');
    }
    if (out.shoulder && out.chest && out.shoulder > out.chest * 0.62) {
      warnings.push('عرض شانه نسبت به دور سینه زیاد است');
    }

    return {
      ok: errors.length === 0 && Object.keys(out).length > 0,
      body: out,
      errors: errors,
      warnings: warnings,
      filled: Object.keys(out).length,
      total: FIELDS.length,
    };
  }

  /* ============================================================
     ۱۰. اعتبارسنجی جدول سایز فروشنده
     ============================================================ */
  function validateSize(raw) {
    var out = { label: String(raw.label || raw.size_label || '').trim().toUpperCase() };
    var errors = [], warnings = [];

    if (!out.label) errors.push('نام سایز خالی است');

    FIELDS.forEach(function (f) {
      var v = raw[f.key];
      if (v == null || v === '') return;
      var n = Number(String(v).replace(/[۰-۹]/g, function (d) {
        return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
      }));
      if (!isFinite(n) || n <= 0) { errors.push(f.name + ' نامعتبر'); return; }
      /* جدول لباس بازه‌ی بازتری از بدن دارد */
      if (n < f.min * 0.7 || n > f.max * 1.3) {
        errors.push(f.name + ' غیرمنطقی است (' + n + ')');
        return;
      }
      out[f.key] = Math.round(n * 10) / 10;
    });

    var filled = Object.keys(out).length - 1;
    if (filled < 2) errors.push('دست‌کم دو اندازه لازم است');

    if (out.chest && out.waist && out.waist > out.chest + 20) {
      warnings.push('کمر بیشتر از سینه — برای بیشتر لباس‌ها غیرعادی است');
    }

    return { ok: errors.length === 0, size: out,
             errors: errors, warnings: warnings, filled: filled };
  }

  /* ============================================================
     ۱۱. تولید خودکار سایزهای دیگر
     ------------------------------------------------------------
     فروشنده یک سایز را وارد می‌کند، بقیه پیشنهاد می‌شود.
     پله‌ها از استاندارد الگوسازی صنعت پوشاک آمده‌اند.
     ============================================================ */
  var LADDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  /* هر سایز چقدر از قبلی بزرگ‌تر است (سانتی‌متر) */
  var STEP = {
    shoulder: 1.2, chest: 4, waist: 4, hip: 4,
    arm: 1, inseam: 1, neck: 1, thigh: 2, height: 2,
  };

  function fillLadder(known, fromLabel) {
    var idx = LADDER.indexOf(String(fromLabel || known.label || '').toUpperCase());
    if (idx < 0) return [];

    var out = [];
    LADDER.forEach(function (lbl, i) {
      if (i === idx) { out.push(Object.assign({}, known, { label: lbl })); return; }

      var d = i - idx;
      var row = { label: lbl, generated: true };
      Object.keys(STEP).forEach(function (k) {
        if (known[k] == null) return;
        row[k] = Math.round((known[k] + STEP[k] * d) * 10) / 10;
      });
      out.push(row);
    });
    return out;
  }

  /* ============================================================
     ۱۲. ذخیره‌ی اندازه‌های مشتری
     ============================================================ */
  var BKEY = 'dp_body';

  function readBody() {
    try {
      var v = JSON.parse(localStorage.getItem(BKEY));
      if (!v || typeof v !== 'object') return null;
      /* شکل قدیمی (بدون پروفایل) را هم بپذیر */
      if (!v.profiles) {
        return { profiles: [{ id: 'p1', name: 'اندازه‌های من',
                              body: v.body || v, fit: v.fit || 'tailored' }],
                 active: 'p1' };
      }
      return v;
    } catch (e) { return null; }
  }

  function activeProfile() {
    var d = readBody();
    if (!d || !d.profiles || !d.profiles.length) return null;
    var p = d.profiles.filter(function (x) { return x.id === d.active; })[0];
    return p || d.profiles[0];
  }

  function saveProfile(name, body, fit, id) {
    var d = readBody() || { profiles: [], active: '' };

    var rec = {
      id: id || ('p' + Date.now().toString(36)),
      name: String(name || '').trim() || 'اندازه‌های من',
      body: body,
      fit: FIT_PREF[fit] ? fit : 'tailored',
      at: Date.now(),
    };

    var i = -1;
    for (var j = 0; j < d.profiles.length; j++) {
      if (d.profiles[j].id === rec.id) { i = j; break; }
    }
    if (i >= 0) d.profiles[i] = rec; else d.profiles.push(rec);

    if (d.profiles.length > 5) d.profiles = d.profiles.slice(-5);
    d.active = rec.id;

    try { localStorage.setItem(BKEY, JSON.stringify(d)); }
    catch (e) { return null; }

    document.dispatchEvent(new CustomEvent('dp:body', { detail: { saved: rec } }));
    return rec;
  }

  function setActive(id) {
    var d = readBody();
    if (!d) return false;
    if (!d.profiles.some(function (p) { return p.id === id; })) return false;
    d.active = id;
    try { localStorage.setItem(BKEY, JSON.stringify(d)); } catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:body', { detail: { active: id } }));
    return true;
  }

  function removeProfile(id) {
    var d = readBody();
    if (!d) return false;
    d.profiles = d.profiles.filter(function (p) { return p.id !== id; });
    if (d.active === id) d.active = d.profiles.length ? d.profiles[0].id : '';
    try { localStorage.setItem(BKEY, JSON.stringify(d)); } catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:body', { detail: { removed: id } }));
    return true;
  }

  /* ============================================================
     ۱۳. جدول سایز کالا
     ------------------------------------------------------------
     فروشنده وارد می‌کند، در حافظه‌ی محلی می‌ماند تا بک‌اند
     وصل شود.
     ============================================================ */
  var SKEY = 'dp_size_tables';

  function readTables() {
    try {
      var v = JSON.parse(localStorage.getItem(SKEY));
      return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
    } catch (e) { return {}; }
  }

  function sizeTable(productId) {
    var t = readTables()[String(productId)];
    return Array.isArray(t) ? t : [];
  }

  function saveTable(productId, rows) {
    if (!productId || !Array.isArray(rows)) return false;
    var all = readTables();
    all[String(productId)] = rows;
    try { localStorage.setItem(SKEY, JSON.stringify(all)); }
    catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:sizes',
      { detail: { productId: productId, rows: rows } }));
    return true;
  }

  /* ============================================================
     ۱۴. آیا این کالا برای این مشتری سایز دارد؟
     ------------------------------------------------------------
     مولد ست از این استفاده می‌کند تا فقط کالاهایی را
     پیشنهاد دهد که سایز مناسب دارند.
     ============================================================ */
  function bestSizeFor(product, body, fit) {
    if (!product || !body) return null;
    var rows = sizeTable(product.id);
    if (!rows.length) return null;

    /* فقط سایزهایی که واقعاً موجودند */
    var avail = Array.isArray(product.sizes) ? product.sizes : [];
    if (avail.length) {
      rows = rows.filter(function (r) {
        return avail.indexOf(r.label) > -1;
      });
    }
    if (!rows.length) return null;

    return recommend(body, rows, { fit: fit, product: product });
  }

  /* ============================================================
     ۱۵. بازخورد — یادگیری از نتیجه
     ============================================================ */
  function feedback(productId, recommended, chosen, fitted) {
    if (!window.DPBrain) return false;
    try {
      /* اگر مشتری همان سایز پیشنهادی را گرفت و خوب بود،
         یعنی موتور درست کار کرده */
      var ok = recommended === chosen && fitted !== false;
      DPBrain.track(ok ? 'cart' : 'reject', {
        product: { id: productId },
      });
      return true;
    } catch (e) { return false; }
  }

  window.DPFit = {
    FIELDS: FIELDS,
    BY_KEY: BY_KEY,
    FIT_PREF: FIT_PREF,
    WEIGHTS: WEIGHTS,
    LADDER: LADDER,

    recommend: recommend,
    scoreSize: scoreSize,
    verdictOf: verdictOf,
    axisScore: axisScore,
    groupOf: groupOf,

    validateBody: validateBody,
    validateSize: validateSize,
    fillLadder: fillLadder,

    readBody: readBody,
    activeProfile: activeProfile,
    saveProfile: saveProfile,
    setActive: setActive,
    removeProfile: removeProfile,

    sizeTable: sizeTable,
    saveTable: saveTable,
    bestSizeFor: bestSizeFor,
    feedback: feedback,
  };
})();
