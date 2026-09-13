/* ============================================================
   dp-rules.js — نگهبان قواعد پیشنهاد
   ------------------------------------------------------------
   چرا این فایل ساخته شد؟

   تا امروز هر قاعده‌ای که لازم می‌شد، جداگانه و در همان
   جایی که ایراد دیده می‌شد اضافه می‌کردیم:

     · «کالای مردانه در ست زنانه نیاید»  → در dp-stylist
     · «کالای ناموجود نیاید»              → در dp-digiai
     · «لباس خواب ست نمی‌سازد»            → در PAIR
     · «همان کالا دوبار نیاید»            → در حلقه‌ها

   نتیجه‌اش این شد که وقتی ایراد «کت مردانه در ست زنانه»
   گزارش شد، مجبور شدیم **پنج فایل** را جدا اصلاح کنیم و
   باز هم یکی جا ماند.

   این فایل همه‌ی آن قواعد را در یک جا جمع می‌کند:

     ۱. هر قاعده یک شیء داده است، نه کد پراکنده
     ۲. هر رد یک **دلیل خوانا** دارد — نه `return null` خشک
     ۳. قاعده‌ها اولویت دارند: سخت‌گیرترین اول
     ۴. می‌شود قاعده‌ای را موقتاً خاموش کرد
     ۵. گزارش می‌دهد چه چیزی چرا رد شد — برای عیب‌یابی

   هیچ وابستگی اجباری ندارد: اگر dp-palette یا dp-stylist
   نبود، همان قاعده رد می‌شود نه کل سیستم.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ۱. سازگاری بخش — زنانه با زنانه
     ============================================================ */
  var SEC_OK = {
    women:  { women: 1, girls: 1, unisex: 1, '': 1 },
    men:    { men: 1, boys: 1, unisex: 1, '': 1 },
    girls:  { girls: 1, women: 1, kids: 1, teen: 1, unisex: 1, '': 1 },
    boys:   { boys: 1, men: 1, kids: 1, teen: 1, unisex: 1, '': 1 },
    kids:   { kids: 1, girls: 1, boys: 1, teen: 1, unisex: 1, '': 1 },
    teen:   { teen: 1, kids: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
    unisex: { women: 1, men: 1, kids: 1, teen: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
    '':     { women: 1, men: 1, kids: 1, teen: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
  };

  var SEC_FA = {
    women: 'زنانه', men: 'مردانه', girls: 'دخترانه',
    boys: 'پسرانه', kids: 'بچگانه', teen: 'نوجوان',
    unisex: 'همگانی', '': 'بدون بخش',
  };

  /* واژه‌هایی که بخش را لو می‌دهند، حتی وقتی میدان خالی است */
  var SEC_WORDS = [
    [/زنانه|زنونه|بانوان|خانم/, 'women'],
    [/مردانه|مردونه|آقایان|مردان/, 'men'],
    [/دخترانه|دخترونه/, 'girls'],
    [/پسرانه|پسرونه/, 'boys'],
    [/بچگانه|بچه‌گانه|کودک|نوزاد|سیسمونی/, 'kids'],
    [/نوجوان|تینیجر/, 'teen'],
  ];

  function sectionOf(p) {
    if (!p) return '';
    var direct = String(p.section || p.sec || '').toLowerCase().trim();
    if (direct && SEC_OK[direct]) return direct;

    var txt = String((p.name || '') + ' ' + (p.category || ''));
    for (var i = 0; i < SEC_WORDS.length; i++) {
      if (SEC_WORDS[i][0].test(txt)) return SEC_WORDS[i][1];
    }
    return '';
  }

  /* ============================================================
     ۲. سن — بزرگسال با کودک ست نمی‌شود
     ------------------------------------------------------------
     این جدا از «بخش» است: «دخترانه» می‌تواند هم بچگانه باشد
     هم بزرگسال. ولی لباس نوزاد با کفش زنانه هرگز.
     ============================================================ */
  var AGE_ADULT = { women: 1, men: 1, unisex: 1, '': 1 };
  var AGE_CHILD = { kids: 1, teen: 1 };

  function ageBand(p) {
    var s = sectionOf(p);
    if (AGE_CHILD[s]) return 'child';
    if (AGE_ADULT[s]) return 'adult';
    return 'any';   /* دخترانه و پسرانه هر دو می‌توانند باشند */
  }

  /* ============================================================
     ۳. جایگاه‌های ناسازگار
     ============================================================ */
  var NO_STYLE = { under: 1, home: 1 };   /* تیپ نمی‌سازند */

  /* ============================================================
     ۴. تعریف قاعده‌ها
     ------------------------------------------------------------
     هر قاعده:
       id       شناسه‌ی یکتا
       name     نام فارسی برای گزارش
       level    'block' یعنی رد قطعی · 'warn' یعنی فقط هشدار
       test     تابعی که true برمی‌گرداند اگر **مشکلی هست**
       why      پیام خوانا برای گزارش

     ترتیب مهم است: ارزان‌ترین و قطعی‌ترین بررسی‌ها اول
     می‌آیند تا زودتر خارج شویم.
     ============================================================ */
  var RULES = [
    {
      id: 'self',
      name: 'کالای تکراری',
      level: 'block',
      test: function (a, b) {
        return String(a.id) === String(b.id);
      },
      why: function () { return 'همان کالای اصلی است'; },
    },

    {
      id: 'inactive',
      name: 'کالای غیرفعال',
      level: 'block',
      test: function (a, b) {
        return !!(b.status && b.status !== 'active');
      },
      why: function () { return 'این کالا فعال نیست'; },
    },

    {
      id: 'stock',
      name: 'ناموجود',
      level: 'block',
      test: function (a, b, ctx) {
        if (ctx && ctx.allowOutOfStock) return false;
        return Number(b.stock) <= 0;
      },
      why: function () { return 'موجودی ندارد'; },
    },

    {
      id: 'section',
      name: 'سازگاری بخش',
      level: 'block',
      test: function (a, b) {
        var row = SEC_OK[sectionOf(a)] || SEC_OK[''];
        return !row[sectionOf(b)];
      },
      why: function (a, b) {
        return 'کالای ' + (SEC_FA[sectionOf(b)] || '؟')
          + ' با کالای ' + (SEC_FA[sectionOf(a)] || '؟') + ' ست نمی‌شود';
      },
    },

    {
      id: 'age',
      name: 'گروه سنی',
      level: 'block',
      test: function (a, b) {
        var x = ageBand(a), y = ageBand(b);
        if (x === 'any' || y === 'any') return false;
        return x !== y;
      },
      why: function (a, b) {
        return ageBand(b) === 'child'
          ? 'کالای کودک با کالای بزرگسال ست نمی‌شود'
          : 'کالای بزرگسال با کالای کودک ست نمی‌شود';
      },
    },

    {
      id: 'private',
      name: 'پوشاک خصوصی',
      level: 'block',
      test: function (a, b) {
        var sa = slotOf(a), sb = slotOf(b);
        /* لباس زیر و خانگی نه ست می‌سازند نه در ست می‌آیند */
        return !!(NO_STYLE[sa] || NO_STYLE[sb]);
      },
      why: function (a, b) {
        var S = window.DPStylist ? DPStylist.SLOT : {};
        if (NO_STYLE[slotOf(b)]) {
          return (S[slotOf(b)] || 'این نوع کالا') + ' در تیپ بیرون نمی‌آید';
        }
        return 'برای ' + (S[slotOf(a)] || 'این کالا') + ' تیپ بیرون ساخته نمی‌شود';
      },
    },

    {
      id: 'slot',
      name: 'جایگاه ناسازگار',
      level: 'block',
      test: function (a, b) {
        if (!window.DPStylist) return false;
        var sa = slotOf(a), sb = slotOf(b);
        var PAIR = DPStylist.PAIR;
        if (!PAIR) return false;
        var row = PAIR[sa];
        if (!row) return true;
        return !row[sb];
      },
      why: function (a, b) {
        /* ⚠️ پیام قبلی همیشه «دو فلان» می‌گفت — حتی وقتی دو
           جایگاه فرق داشتند. مثلاً برای «کت» و «لباس شب»
           می‌نوشت «دو بالاتنه»، که غلط بود.

           حالا فقط وقتی «دو» می‌گوید که واقعاً یکی باشند. */
        var S = window.DPStylist ? DPStylist.SLOT : {};
        var na = S[slotOf(a)] || 'این قطعه';
        var nb = S[slotOf(b)] || 'آن قطعه';

        if (slotOf(a) === slotOf(b)) {
          return 'دو ' + nb + ' با هم ست نمی‌شوند';
        }
        return nb + ' با ' + na + ' ست نمی‌شود';
      },
    },

    {
      id: 'formality',
      name: 'فاصله‌ی رسمیت',
      level: 'block',
      test: function (a, b) {
        if (!window.DPStylist) return false;
        var fa = DPStylist.formalOf(a);
        var fb = DPStylist.formalOf(b);
        if (Math.abs(fa - fb) < 3) return false;

        /* استثنا: زیورآلات و کیف بی‌طرف‌اند */
        var sb = slotOf(b);
        if (sb === 'accessory' || sb === 'bag') {
          var txt = String(b.category || b.name || '');
          if (!/ورزشی|اسپرت|خانگی|مجلسی|عروس/.test(txt)) return false;
        }
        return true;
      },
      why: function () {
        return 'سطح رسمیتشان خیلی فرق دارد — مثل کتانی با لباس شب';
      },
    },

    {
      id: 'season',
      name: 'فصل ناسازگار',
      level: 'warn',
      test: function (a, b) {
        var x = a.season, y = b.season;
        if (!x || !y || x === 'all' || y === 'all') return false;
        var OPP = { summer: 'winter', winter: 'summer' };
        return OPP[x] === y;
      },
      why: function () { return 'یکی تابستانی است و دیگری زمستانی'; },
    },

    {
      id: 'pattern',
      name: 'دو طرح پرجلوه',
      level: 'warn',
      test: function (a, b) {
        if (!window.DPPalette) return false;
        var pa = DPPalette.patternOf(a.pattern);
        var pb = DPPalette.patternOf(b.pattern);
        return pa.busy >= 3 && pb.busy >= 3;
      },
      why: function () { return 'هر دو طرح پرجلوه دارند — چشم گیج می‌شود'; },
    },
  ];

  /* شناسه‌ی قاعده‌هایی که خاموش شده‌اند */
  var OFF = {};

  function slotOf(p) {
    if (window.DPStylist && DPStylist.slotOf) {
      try { return DPStylist.slotOf(p); } catch (e) { return ''; }
    }
    return '';
  }

  /* ============================================================
     ۵. بررسی — تابع اصلی
     ------------------------------------------------------------
     خروجی:
       {
         ok:       آیا این جفت مجاز است؟
         blocked:  [{ id, name, why }]  — قاعده‌های شکسته
         warnings: [{ id, name, why }]  — هشدارها
       }
     ============================================================ */
  function check(base, cand, ctx) {
    var out = { ok: true, blocked: [], warnings: [] };

    if (!base || !cand || !base.id || !cand.id) {
      out.ok = false;
      out.blocked.push({ id: 'invalid', name: 'داده‌ی ناقص',
        why: 'یکی از دو کالا معتبر نیست' });
      return out;
    }

    for (var i = 0; i < RULES.length; i++) {
      var R = RULES[i];
      if (OFF[R.id]) continue;

      var hit;
      try {
        hit = R.test(base, cand, ctx || {});
      } catch (e) {
        continue;   /* قاعده‌ی خراب نباید کل سیستم را بشکند */
      }
      if (!hit) continue;

      var rec = { id: R.id, name: R.name, why: '' };
      try { rec.why = R.why(base, cand); } catch (e) { rec.why = R.name; }

      if (R.level === 'block') {
        out.ok = false;
        out.blocked.push(rec);
        /* رد قطعی — ادامه بی‌فایده است */
        if (!(ctx && ctx.collectAll)) return out;
      } else {
        out.warnings.push(rec);
      }
    }

    return out;
  }

  /** میان‌بر: فقط بله یا خیر */
  function allows(base, cand, ctx) {
    return check(base, cand, ctx).ok;
  }

  /** پالایش یک فهرست — با گزارش اینکه چه چیزی چرا رد شد */
  function filter(base, pool, ctx) {
    var kept = [];
    var rejected = [];
    var stats = {};

    (pool || []).forEach(function (c) {
      var r = check(base, c, ctx);
      if (r.ok) {
        kept.push(c);
        return;
      }
      var first = r.blocked[0] || { id: '?', name: '?', why: '' };
      stats[first.id] = (stats[first.id] || 0) + 1;
      rejected.push({ p: c, rule: first.id, why: first.why });
    });

    return { kept: kept, rejected: rejected, stats: stats };
  }

  /* ============================================================
     ۶. عیب‌یابی — «چرا این پیشنهاد نشد؟»
     ------------------------------------------------------------
     برای وقتی که فروشنده یا مدیر می‌پرسد چرا فلان کالا
     پیشنهاد نمی‌شود.
     ============================================================ */
  function explain(base, cand) {
    var r = check(base, cand, { collectAll: true });

    if (r.ok && !r.warnings.length) {
      return { ok: true, text: 'این دو با هم ست می‌شوند.' };
    }
    if (r.ok) {
      return {
        ok: true,
        text: 'ست می‌شوند، ولی: '
          + r.warnings.map(function (w) { return w.why; }).join(' · '),
      };
    }
    return {
      ok: false,
      text: 'ست نمی‌شوند چون: '
        + r.blocked.map(function (b) { return b.why; }).join(' · '),
      blocked: r.blocked,
    };
  }

  /* ============================================================
     ۷. مدیریت قاعده‌ها
     ============================================================ */
  function disable(id) { OFF[id] = 1; return true; }
  function enable(id) { delete OFF[id]; return true; }

  /* همه‌ی قاعده‌ها را دوباره روشن کن.
     در آزمون‌ها حیاتی است: اگر آزمونی قاعده‌ای را خاموش کند
     و روشنش نکند، آزمون‌های بعدی نتیجه‌ی غلط می‌دهند. */
  function resetRules() {
    Object.keys(OFF).forEach(function (k) { delete OFF[k]; });
    return true;
  }

  /* قاعده‌های افزوده‌شده را هم پاک کن — برای آزمون */
  var BUILTIN = RULES.length;
  function resetAll() {
    RULES.length = BUILTIN;
    return resetRules();
  }

  function list() {
    return RULES.map(function (R) {
      return { id: R.id, name: R.name, level: R.level, on: !OFF[R.id] };
    });
  }

  /** افزودن قاعده‌ی تازه بدون دست زدن به این فایل */
  function add(rule) {
    if (!rule || !rule.id || typeof rule.test !== 'function') return false;
    if (RULES.some(function (R) { return R.id === rule.id; })) return false;

    RULES.push({
      id: rule.id,
      name: rule.name || rule.id,
      level: rule.level === 'warn' ? 'warn' : 'block',
      test: rule.test,
      why: rule.why || function () { return rule.name || rule.id; },
    });
    return true;
  }

  /* ============================================================
     ۸. خودآزمایی — سلامت قاعده‌ها
     ------------------------------------------------------------
     یک کالای ساختگی می‌سازد و بررسی می‌کند هر قاعده واقعاً
     کار می‌کند. اگر روزی کسی قاعده‌ای را خراب کرد، اینجا
     معلوم می‌شود.

     در کنسول: DPRules.selfTest()
     ============================================================ */
  function selfTest() {
    var W = { id: 'w', name: 'پیراهن زنانه', category: 'پیراهن',
              section: 'women', stock: 5, status: 'active' };
    var M = { id: 'm', name: 'کت مردانه', category: 'کت',
              section: 'men', stock: 5, status: 'active' };
    var K = { id: 'k', name: 'شلوار بچگانه', category: 'شلوار',
              section: 'kids', stock: 5, status: 'active' };
    var U = { id: 'u', name: 'گردنبند', category: 'گردنبند',
              stock: 5, status: 'active' };
    var Z = { id: 'z', name: 'لباس زیر', category: 'لباس زیر',
              section: 'women', stock: 5, status: 'active' };
    var O = { id: 'o', name: 'کفش زنانه', category: 'کفش',
              section: 'women', stock: 0, status: 'active' };
    var Sh = { id: 'sh', name: 'کفش زنانه موجود', category: 'کفش',
               section: 'women', stock: 4, status: 'active' };

    var cases = [
      ['کالا با خودش',            W, W, false, 'self'],
      ['زنانه با مردانه',         W, M, false, 'section'],
      ['بزرگسال با بچگانه',       W, K, false, null],
      ['زنانه با بی‌بخش',          W, U, true,  null],
      ['لباس زیر در تیپ',         W, Z, false, 'private'],
      ['کالای ناموجود',           W, O, false, 'stock'],
      ['زنانه با کفش زنانه',      W, Sh, true, null],
      ['مردانه با زنانه',         M, W, false, 'section'],
      ['داده‌ی ناقص',             W, {}, false, 'invalid'],
    ];

    var pass = 0, fail = 0;
    var log = [];

    cases.forEach(function (c) {
      var r = check(c[1], c[2]);
      var okMatch = r.ok === c[3];
      var ruleMatch = !c[4] || (r.blocked[0] && r.blocked[0].id === c[4]);

      if (okMatch && ruleMatch) {
        pass++;
      } else {
        fail++;
        log.push(c[0] + ' → انتظار: ' + (c[3] ? 'مجاز' : 'رد')
          + (c[4] ? ' (' + c[4] + ')' : '')
          + ' · نتیجه: ' + (r.ok ? 'مجاز' : 'رد ' + (r.blocked[0] || {}).id));
      }
    });

    return { pass: pass, fail: fail, total: cases.length, problems: log };
  }

  window.DPRules = {
    SEC_OK: SEC_OK,
    SEC_FA: SEC_FA,
    sectionOf: sectionOf,
    ageBand: ageBand,
    check: check,
    allows: allows,
    filter: filter,
    explain: explain,
    disable: disable,
    enable: enable,
    resetRules: resetRules,
    resetAll: resetAll,
    list: list,
    add: add,
    selfTest: selfTest,
  };
})();
