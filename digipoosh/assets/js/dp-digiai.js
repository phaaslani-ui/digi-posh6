/* ============================================================
   dp-digiai.js — موتور مولد ست دیجی AI
   ------------------------------------------------------------
   این فایل روی سه لایه‌ی زیرین سوار است:

     dp-palette.js   دانشنامه‌ی رنگ و طرح (۱۱۶ رنگ، ۵۲ طرح)
     dp-stylist.js   قاعده‌های تیپ‌زنی
     dp-brain.js     مغز یادگیرنده + وزن‌های خودتنظیم

   و چیزی می‌سازد که هیچ‌کدام تنهایی نمی‌توانند:

     · سه ست کامل و **متفاوت** از یک کالای پایه
     · نمره‌ی جداگانه‌ی هر معیار (برای حلقه‌ی تقویتی)
     · توضیح انسانی برای هر انتخاب
     · جایگزین برای هر قطعه
     · محاسبه‌ی تخفیف ست

   نکته‌ی مهم: وزن معیارها **ثابت نیست**. از مغز خوانده می‌شود
   و مغز آن را از رفتار مشتری‌ها یاد می‌گیرد.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ۱. مناسبت‌ها — با نگاشت به نردبان رسمیت
     ============================================================ */
  var OCCASION = {
    daily:   { name: 'روزمره',        formal: 2, icon: 'sun'   },
    casual:  { name: 'دورهمی خودمانی', formal: 2, icon: 'sun'   },
    business:{ name: 'اداری و کاری',   formal: 4, icon: 'case'  },
    formal:  { name: 'رسمی',           formal: 4, icon: 'case'  },
    party:   { name: 'مهمانی و شب',    formal: 5, icon: 'spark' },
    wedding: { name: 'عروسی',          formal: 5, icon: 'spark' },
    date:    { name: 'قرار و بیرون',   formal: 3, icon: 'heart' },
    sporty:  { name: 'ورزش و تحرک',    formal: 1, icon: 'run'   },
  };

  /* ============================================================
     ۲. سبک‌ها — با نگاشت به کلیدهای واقعی کالا
     ============================================================ */
  var STYLE = {
    classic:  { name: 'کلاسیک',   keys: ['classic', 'traditional'],   formal: 4 },
    elegant:  { name: 'شیک',      keys: ['elegant'],                  formal: 5 },
    modern:   { name: 'مدرن',     keys: ['modern', 'minimal'],        formal: 3 },
    minimal:  { name: 'مینیمال',  keys: ['minimal', 'modern'],        formal: 3 },
    casual:   { name: 'راحت',     keys: ['casual', 'street'],         formal: 2 },
    bohemian: { name: 'بوهو',     keys: ['bohemian', 'vintage'],      formal: 2 },
    vintage:  { name: 'کلاسیک قدیمی', keys: ['vintage', 'classic'],   formal: 3 },
    sporty:   { name: 'اسپرت',    keys: ['sporty'],                   formal: 1 },
  };

  /* ============================================================
     ۳. پالت رنگ — روی دانشنامه سوار است
     ============================================================ */
  var PALETTE = {
    warm:    { name: 'گرم',     test: function (H) { return H.warm === true; } },
    cool:    { name: 'سرد',     test: function (H) { return H.warm === false; } },
    neutral: { name: 'خنثی',    test: function (H) { return H.neutral === true; } },
    bold:    { name: 'پرشدت',   test: function (H) { return H.sat > 60; } },
    pastel:  { name: 'ملایم',   test: function (H) { return H.light > 72 && H.sat < 55; } },
    dark:    { name: 'تیره',    test: function (H) { return H.light < 35; } },
    any:     { name: 'مهم نیست', test: function () { return true; } },
  };

  /* ============================================================
     ۴. باند بودجه
     ============================================================ */
  var BUDGET = {
    low:    { name: 'اقتصادی', max: 1500000 },
    medium: { name: 'متوسط',   max: 5000000 },
    high:   { name: 'بالا',    max: 15000000 },
    luxury: { name: 'لوکس',    max: Infinity },
    any:    { name: 'مهم نیست', max: Infinity },
  };

  /* ============================================================
     ۵. الگوی ست — کدام جایگاه‌ها لازم است؟
     ------------------------------------------------------------
     بسته به اینکه کالای پایه چیست، ست از چه اجزایی ساخته شود.
     ترتیب مهم است: اولی‌ها ضروری‌ترند.
     ============================================================ */
  var BLUEPRINT = {
    top:    ['bottom', 'shoes', 'outer', 'bag', 'accessory', 'modest'],
    bottom: ['top', 'shoes', 'outer', 'bag', 'accessory', 'modest'],
    full:   ['shoes', 'outer', 'bag', 'accessory', 'modest'],
    outer:  ['top', 'bottom', 'shoes', 'bag', 'accessory'],
    shoes:  ['bottom', 'top', 'outer', 'bag', 'accessory'],
    bag:    ['full', 'top', 'bottom', 'shoes', 'accessory'],
    accessory: ['full', 'top', 'bottom', 'shoes', 'bag'],
    modest: ['full', 'top', 'bottom', 'shoes', 'bag'],
  };

  /* ============================================================
     سازگاری بخش
     ------------------------------------------------------------
     منطقش در `dp-stylist.js` است تا صفحه‌ی کالا هم — که فقط
     آن را بارگذاری می‌کند — از همین قاعده بهره ببرد.
     دو نسخه از یک منطق، همیشه واگرا می‌شوند.
     ============================================================ */
  function sectionFits(a, b) {
    if (window.DPStylist && DPStylist.sectionFits) {
      return DPStylist.sectionFits(a, b);
    }
    return true;
  }

  function sectionOf(p) {
    if (window.DPStylist && DPStylist.sectionOf) return DPStylist.sectionOf(p);
    return '';
  }

  /* ============================================================
     ابزار
     ============================================================ */
  function arr(v) { return Array.isArray(v) ? v : []; }

  function priceOf(p) {
    if (window.DPPromo) {
      try {
        var s = DPPromo.sales.priceOf(p);
        if (s && isFinite(Number(s.price))) return Number(s.price);
      } catch (e) { /* بی‌اهمیت */ }
    }
    return Number(p.price) || 0;
  }

  function slotOf(p) {
    return window.DPStylist ? DPStylist.slotOf(p) : 'top';
  }

  function formalOf(p) {
    return window.DPStylist ? DPStylist.formalOf(p) : 2;
  }

  function colorsOf(p) {
    if (window.DPPalette) {
      try { return DPPalette.colorsOf(p); } catch (e) { /* بی‌اهمیت */ }
    }
    var c = p.color || arr(p.colors)[0];
    return c ? [String(c)] : [];
  }

  /* ============================================================
     ۶. نمره‌ی هر معیار — جداگانه، برای حلقه‌ی تقویتی
     ------------------------------------------------------------
     برخلاف یک نمره‌ی کلی، اینجا هر معیار **جدا** حساب می‌شود.
     چرا؟ چون مغز باید بفهمد وقتی کاربر ستی را پذیرفت یا رد
     کرد، **کدام معیار** درست گفته بود.

     بدون این تفکیک، یادگیری تقویتی ممکن نیست.
     ============================================================ */
  function scoreItem(hero, cand, pref) {
    var out = { color: 50, style: 50, occasion: 50, taste: 50, budget: 50 };

    /* ---------- رنگ ---------- */
    if (window.DPPalette) {
      var cr = DPPalette.garmentColorScore(hero, cand);
      out.color = cr.score;
      out._echo = cr.echo;
      out._colorA = cr.a;
      out._colorB = cr.b;

      /* پالت خواسته‌شده */
      if (pref.palette && pref.palette !== 'any' && PALETTE[pref.palette]) {
        var test = PALETTE[pref.palette].test;
        var cs = colorsOf(cand);
        var fit = cs.some(function (k) {
          var H = DPPalette.HUE[k];
          return H && test(H);
        });
        out.color = fit
          ? Math.min(100, out.color + 12)
          : Math.max(0, out.color - 22);
      }

      /* تجربه‌ی واقعی مشتری‌ها */
      if (window.DPBrain && cr.a && cr.b) {
        var aff = DPBrain.colorAffinity(cr.a, cr.b);
        if (aff.n) out.color = DPBrain.blend(out.color, aff, 0.4);
      }
    }

    /* ---------- سبک و هم‌سطحی ---------- */
    var fh = formalOf(hero), fc = formalOf(cand);
    var gap = Math.abs(fh - fc);
    out.style = gap === 0 ? 100 : gap === 1 ? 82 : gap === 2 ? 48 : 18;

    if (pref.style && STYLE[pref.style]) {
      var keys = STYLE[pref.style].keys;
      if (cand.style && keys.indexOf(cand.style) > -1) {
        out.style = Math.min(100, out.style + 15);
      }
      /* رسمیت خواسته‌شده */
      var want = STYLE[pref.style].formal;
      var d2 = Math.abs(fc - want);
      if (d2 >= 3) out.style = Math.max(0, out.style - 25);
    }

    /* طرح — بخشی از سبک */
    if (window.DPPalette) {
      var pp = DPPalette.patternPairScore(hero.pattern, cand.pattern);
      out.style = Math.round(out.style * 0.6 + pp * 0.4);
    }

    /* ---------- مناسبت ---------- */
    if (pref.occasion && OCCASION[pref.occasion]) {
      var want2 = OCCASION[pref.occasion].formal;
      var d3 = Math.abs(fc - want2);
      out.occasion = d3 === 0 ? 100 : d3 === 1 ? 78 : d3 === 2 ? 42 : 12;
    } else {
      out.occasion = 100 - Math.abs(fh - fc) * 18;
    }

    /* فصل */
    if (pref.season && pref.season !== 'all' && cand.season) {
      if (cand.season !== 'all' && cand.season !== pref.season) {
        out.occasion = Math.max(0, out.occasion - 18);
      }
    }

    /* ---------- سلیقه‌ی شخصی ---------- */
    var t = null;
    if (window.DPBrain) {
      try { t = DPBrain.taste(pref.userId); } catch (e) { t = null; }
    }
    if (t) {
      var hit = 0;
      colorsOf(cand).forEach(function (c) {
        if (t.colors.indexOf(c) > -1) hit += 30;
      });
      if (cand.category && t.categories.indexOf(cand.category) > -1) hit += 25;
      out.taste = Math.min(100, 45 + hit * t.strength);
    } else if (pref.colors && pref.colors.length) {
      /* اگر مغز سلیقه ندارد، از پاسخ آزمون سبک استفاده کن */
      var hit2 = colorsOf(cand).some(function (c) {
        return pref.colors.indexOf(c) > -1;
      });
      out.taste = hit2 ? 88 : 45;
    }

    /* ---------- بودجه ---------- */
    var pr = priceOf(cand);
    var cap = (BUDGET[pref.budget] || BUDGET.any).max;
    if (pr > cap) {
      out.budget = Math.max(0, 60 - ((pr - cap) / cap) * 100);
    } else {
      /* هم‌ردیفی با کالای پایه: ست باید یکدست باشد */
      var hp = priceOf(hero);
      if (hp > 0 && pr > 0) {
        var ratio = pr / hp;
        out.budget = (ratio > 0.25 && ratio < 4) ? 92 : 58;
      } else {
        out.budget = 75;
      }
    }

    return out;
  }

  /** نمره‌ی نهایی با وزن‌های یادگرفته‌شده */
  function combine(breakdown, W) {
    var s = 0;
    Object.keys(W).forEach(function (k) {
      var v = Number(breakdown[k]);
      if (isFinite(v)) s += v * W[k];
    });
    return Math.round(Math.max(0, Math.min(100, s)));
  }

  /* ============================================================
     ۷. توضیح انسانی
     ============================================================ */
  function explain(hero, cand, bd) {
    /* دلیل موتور استایلیست، اگر خوب بود */
    if (window.DPStylist) {
      try {
        var r = DPStylist.reasonFor(hero, cand);
        if (r && r.length > 8) return r;
      } catch (e) { /* بی‌اهمیت */ }
    }

    if (bd._echo) return 'تکرار رنگ — تیپ یکدست می‌شود';
    if (bd.color >= 88) return 'رنگ‌ها به‌خوبی کنار هم می‌نشینند';
    if (bd.style >= 88) return 'هم‌سطح با کالای اصلی';
    if (bd.occasion >= 88) return 'دقیقاً برای همین مناسبت';
    return 'انتخاب هماهنگ';
  }

  /* ============================================================
     ۸. مولد اصلی — سه ست متفاوت
     ------------------------------------------------------------
     چالش: سه ست باید **واقعاً فرق داشته باشند**، نه اینکه
     نفر اول و دوم و سوم هر جایگاه را بگذاریم.

     راه‌حل: سه «شخصیت» متفاوت
       ۱. مطمئن   → بالاترین نمره، انتخاب امن
       ۲. هماهنگ  → رنگ حرف اول را می‌زند
       ۳. جسورانه → کنتراست و تنوع بیشتر
     ============================================================ */
  var VARIANT = [
    {
      key: 'safe',
      name: 'انتخاب مطمئن',
      hint: 'بالاترین هماهنگی کلی — اگر شک دارید، همین',
      tweak: function (bd, W) { return combine(bd, W); },
    },
    {
      key: 'harmony',
      name: 'هم‌رنگ و آرام',
      hint: 'رنگ‌ها در یک خانواده‌اند — تیپ یکدست و شیک',
      tweak: function (bd, W) {
        var w2 = Object.assign({}, W);
        /* رنگ تقریباً همه‌کاره می‌شود */
        w2.color = 0.55;
        w2.style = W.style * 0.5;
        w2.occasion = W.occasion * 0.5;
        w2.taste = W.taste * 0.5;
        w2.budget = W.budget * 0.5;
        var s = combine(bd, w2);
        /* تکرار رنگ اینجا برگ برنده است */
        if (bd._echo) s += 18;
        if (bd._contrast) s -= 12;
        return s;
      },
    },
    {
      key: 'bold',
      name: 'جسورانه',
      hint: 'کنتراست بیشتر — برای وقتی که می‌خواهید دیده شوید',
      tweak: function (bd, W) {
        var base = combine(bd, W);
        /* اینجا دقیقاً برعکس نسخه‌ی دوم */
        if (bd._contrast) base += 22;
        if (bd._echo) base -= 16;
        return base;
      },
    },
  ];

  /**
   * تولید ست
   *
   * @param {object} hero  کالای پایه
   * @param {array}  pool  همه‌ی کالاهای موجود
   * @param {object} pref  { occasion, style, palette, budget, season, count, userId }
   * @returns {object} { hero, outfits: [...], weights }
   */
  function generate(hero, pool, pref) {
    pref = pref || {};
    if (!hero || !hero.id) return null;

    var W = window.DPBrain ? DPBrain.weights() : {
      color: 0.30, style: 0.25, occasion: 0.20, taste: 0.15, budget: 0.10,
    };

    var heroSlot = slotOf(hero);
    var need = BLUEPRINT[heroSlot];
    if (!need) return null;

    var count = Math.max(3, Math.min(6, Number(pref.count) || 4));

    /* ---------- امتیازدهی همه‌ی نامزدها ---------- */
    var bySlot = {};
    var heroColors = colorsOf(hero);

    pool.forEach(function (c) {
      if (!c || !c.id) return;
      if (String(c.id) === String(hero.id)) return;
      if (c.status && c.status !== 'active') return;
      if (Number(c.stock) <= 0) return;

      var sl = slotOf(c);
      if (need.indexOf(sl) < 0) return;

      /* ---------- دروازه‌ی نگهبان ----------
         پیش از هر امتیازدهی. کالای مردانه در ست زنانه،
         هرچقدر هم رنگش قشنگ باشد، وارد رقابت نمی‌شود.
         قاعده‌ها در `dp-rules.js` جمع شده‌اند. */
      if (window.DPRules) {
        if (!DPRules.allows(hero, c)) return;
      } else if (!sectionFits(hero, c)) {
        return;
      }

      /* ---------- سایز مناسب دارد؟ ----------
         اگر مشتری اندازه‌هایش را داده، کالایی که سایز
         مناسبش را ندارد پیشنهاد نمی‌شود — وگرنه تیپ کامل
         می‌سازیم که نصفش قابل خرید نیست. */
      var fitInfo = null;
      if (window.DPFit && pref.useFit !== false) {
        try {
          var prof = DPFit.activeProfile();
          if (prof && prof.body) {
            var fr = DPFit.bestSizeFor(c, prof.body, prof.fit);
            if (fr) {
              /* زیر ۶۵٪ یعنی هیچ سایزی نمی‌خورد */
              if (fr.best.percent < 65) return;
              fitInfo = { label: fr.best.label, percent: fr.best.percent };
            }
          }
        } catch (e) { fitInfo = null; }
      }

      var bd = scoreItem(hero, c, pref);

      /* نشان کنتراست — برای نسخه‌ی جسورانه */
      if (window.DPPalette && bd._colorA && bd._colorB) {
        var A = DPPalette.HUE[bd._colorA], Bc = DPPalette.HUE[bd._colorB];
        if (A && Bc) {
          bd._contrast = Math.abs(A.light - Bc.light) > 45
            || (!A.neutral && !Bc.neutral);
        }
      }

      var base = combine(bd, W);
      if (base < 35) return;     /* خیلی بد، اصلاً نیاور */

      /* هم‌خریدی واقعی */
      if (window.DPBrain) {
        try {
          var bw = DPBrain.boughtWith(hero.id, [c], 1);
          if (bw.length) base = Math.min(100, base + Math.min(10, 3 + bw[0].w * 0.4));
        } catch (e) { /* بی‌اهمیت */ }
      }

      if (!bySlot[sl]) bySlot[sl] = [];
      bySlot[sl].push({ p: c, bd: bd, base: base, fit: fitInfo });
    });

    /* ---------- ساخت سه نسخه ---------- */
    var outfits = [];
    var usedSig = {};

    /* ---------- شمار استفاده از هر کالا در نسخه‌های قبلی ----------
       بدون این، هر سه نسخه بهترین کالای هر جایگاه را برمی‌دارند
       و عملاً یکی می‌شوند. جریمه‌ی تکرار باعث می‌شود نسخه‌های
       بعدی سراغ گزینه‌های دیگر بروند — ولی فقط اگر گزینه‌ی
       دیگری در کار باشد. */
    var usedCount = {};

    VARIANT.forEach(function (V, vi) {
      var picked = [];
      var taken = {};

      for (var i = 0; i < need.length && picked.length < count - 1; i++) {
        var sl = need[i];
        var list = bySlot[sl];
        if (!list || !list.length) continue;

        /* مرتب‌سازی بر پایه‌ی شخصیت این نسخه */
        var ranked = list
          .map(function (r) {
            var sc = V.tweak(r.bd, W);

            /* ---------- جریمه‌ی تکرار ----------
               نسخه‌ی اول آزاد است بهترین را بردارد. نسخه‌های
               بعدی برای هر کالایی که قبلاً استفاده شده جریمه
               می‌شوند، تا سراغ گزینه‌های دیگر بروند.

               جریمه ملایم است (۱۸) نه قاطع: اگر گزینه‌ی دومِ
               یک جایگاه خیلی بد باشد، باز هم همان اولی انتخاب
               می‌شود — بهتر از پیشنهاد بی‌ربط. */
            if (vi > 0) {
              var u = usedCount[r.p.id] || 0;
              sc -= u * 18;
            }
            return { r: r, s: sc };
          })
          .filter(function (x) { return !taken[x.r.p.id]; })
          .sort(function (a, b) { return b.s - a.s; });

        if (!ranked.length) continue;

        var pick = ranked[0];

        /* ---------- تضمین تنوع ----------
           اگر این نسخه تا اینجا دقیقاً مثل نسخه‌ی قبلی پیش
           رفته و گزینه‌ی دیگری هم هست که نمره‌اش خیلی پایین‌تر
           نیست، آن را بردار. بدون این، دو نسخه یکی می‌شوند و
           کاربر عملاً یک گزینه می‌بیند. */
        if (vi > 0 && ranked.length > 1 && (usedCount[pick.r.p.id] || 0) > 0) {
          var second = ranked[1];
          if (second.s >= pick.s - 22) pick = second;
        }

        taken[pick.r.p.id] = 1;
        usedCount[pick.r.p.id] = (usedCount[pick.r.p.id] || 0) + 1;

        picked.push({
          p: pick.r.p,
          slot: sl,
          score: pick.s,
          breakdown: pick.r.bd,
          fit: pick.r.fit,
          why: explain(hero, pick.r.p, pick.r.bd),
          /* سه جایگزین برای دکمه‌ی «عوض کن» */
          alts: ranked.slice(1, 5).map(function (x) {
            return { p: x.r.p, score: x.s, why: explain(hero, x.r.p, x.r.bd) };
          }),
        });
      }

      /* ست کمتر از دو قطعه، ست نیست */
      if (picked.length < 2) return;

      /* ---------- ست تکراری نساز ----------
         ⚠️ نکته‌ای که در آزمون معلوم شد: مقایسه‌ی امضای کامل
         خیلی سخت‌گیر بود. وقتی یک جایگاه فقط **یک** نامزد
         دارد (مثلاً تنها یک پالتو در انبار)، هر سه نسخه
         مجبورند همان را بردارند و امضایشان یکی می‌شود — پس
         دو نسخه دور ریخته می‌شد و کاربر فقط یک گزینه می‌دید.

         حالا معیار «تفاوت معنادار» است: اگر دست‌کم یک قطعه
         فرق داشته باشد، نسخه‌ی جداگانه‌ای شمرده می‌شود. */
      var ids = picked.map(function (x) { return String(x.p.id); }).sort();
      var sig = ids.join(',');
      if (usedSig[sig]) return;

      var tooSimilar = false;
      Object.keys(usedSig).forEach(function (prev) {
        if (tooSimilar) return;
        var prevIds = prev.split(',');
        var same = ids.filter(function (x) { return prevIds.indexOf(x) > -1; }).length;
        /* اگر همه‌ی قطعه‌ها یکی است، نسخه‌ی تازه‌ای نیست */
        if (same === ids.length && same === prevIds.length) tooSimilar = true;
      });
      if (tooSimilar) return;

      usedSig[sig] = 1;

      /* ---------- جمع نمره‌ها ---------- */
      var agg = { color: 0, style: 0, occasion: 0, taste: 0, budget: 0 };
      picked.forEach(function (x) {
        Object.keys(agg).forEach(function (k) { agg[k] += x.breakdown[k] || 0; });
      });
      Object.keys(agg).forEach(function (k) {
        agg[k] = Math.round(agg[k] / picked.length);
      });

      var total = priceOf(hero) + picked.reduce(function (a, x) {
        return a + priceOf(x.p);
      }, 0);

      var score = Math.round(
        picked.reduce(function (a, x) { return a + x.score; }, 0) / picked.length);

      /* ---------- تخفیف ست ----------
         هرچه ست کامل‌تر، تخفیف بیشتر. این هم مشتری را تشویق
         می‌کند و هم ارزش سبد را بالا می‌برد. */
      var pct = picked.length >= 4 ? 8 : picked.length === 3 ? 5 : 3;
      var save = Math.round(total * pct / 100);

      /* ---------- تحلیل مد ---------- */
      var report = null;
      if (window.DPFashion) {
        try {
          var slots = [heroSlot].concat(picked.map(function (x) { return x.slot; }));
          var lo = [{ p: hero }].concat(picked).map(function (x) {
            var pr = x.p || hero;
            var hue = colorsOf(pr)[0] || '';
            return { loud: DPFashion.loudnessOf(pr, hue) };
          });
          report = {
            balance: DPFashion.balanceReport(slots),
            focus: DPFashion.focusReport(lo),
            verdict: DPFashion.verdictOf(score),
          };
        } catch (e) { report = null; }
      }

      outfits.push({
        id: V.key,
        variant: V.name,
        hint: V.hint,
        hero: hero,
        items: picked,
        score: score,
        breakdown: agg,
        total: total,
        discount: pct,
        save: save,
        payable: total - save,
        report: report,
        occasion: pref.occasion || '',
      });
    });

    outfits.sort(function (a, b) { return b.score - a.score; });

    return {
      hero: hero,
      outfits: outfits,
      weights: W,
      pool: bySlot,
    };
  }

  /* ============================================================
     ۹. تعویض یک قطعه
     ============================================================ */
  function swap(result, outfitId, slot, newProductId) {
    if (!result) return null;
    var fit = result.outfits.filter(function (o) { return o.id === outfitId; })[0];
    if (!fit) return null;

    var idx = -1;
    for (var i = 0; i < fit.items.length; i++) {
      if (fit.items[i].slot === slot) { idx = i; break; }
    }
    if (idx < 0) return null;

    var list = result.pool[slot] || [];
    var found = null;
    for (var j = 0; j < list.length; j++) {
      if (String(list[j].p.id) === String(newProductId)) { found = list[j]; break; }
    }
    if (!found) return null;

    var old = fit.items[idx];

    /* ---------- آموزش مغز: این قطعه پسندیده نشد ---------- */
    if (window.DPBrain) {
      try {
        DPBrain.feedback({
          action: 'swapped',
          hero: result.hero,
          items: fit.items.map(function (x) { return x.p; }),
          breakdown: fit.breakdown,
          swappedOut: old.p,
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    fit.items[idx] = {
      p: found.p,
      slot: slot,
      score: found.base,
      breakdown: found.bd,
      why: explain(result.hero, found.p, found.bd),
      alts: old.alts.filter(function (a) {
        return String(a.p.id) !== String(found.p.id);
      }).concat([{ p: old.p, score: old.score, why: old.why }]),
    };

    /* بازمحاسبه */
    recalc(fit);
    return fit;
  }

  function recalc(fit) {
    var agg = { color: 0, style: 0, occasion: 0, taste: 0, budget: 0 };
    fit.items.forEach(function (x) {
      Object.keys(agg).forEach(function (k) { agg[k] += x.breakdown[k] || 0; });
    });
    Object.keys(agg).forEach(function (k) {
      agg[k] = Math.round(agg[k] / fit.items.length);
    });
    fit.breakdown = agg;

    fit.total = priceOf(fit.hero) + fit.items.reduce(function (a, x) {
      return a + priceOf(x.p);
    }, 0);
    fit.score = Math.round(
      fit.items.reduce(function (a, x) { return a + x.score; }, 0) / fit.items.length);
    fit.save = Math.round(fit.total * fit.discount / 100);
    fit.payable = fit.total - fit.save;

    if (window.DPFashion) {
      try { fit.report.verdict = DPFashion.verdictOf(fit.score); }
      catch (e) { /* بی‌اهمیت */ }
    }
  }

  /* ============================================================
     ۱۰. کمد مجازی
     ============================================================ */
  var WKEY = 'dp_wardrobe';

  function readWardrobe() {
    try {
      var v = JSON.parse(localStorage.getItem(WKEY));
      return Array.isArray(v) ? v.filter(function (x) { return x && x.id; }) : [];
    } catch (e) { return []; }
  }

  function saveOutfit(fit, name) {
    if (!fit) return null;
    var list = readWardrobe();

    var rec = {
      id: 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: String(name || '').trim() || autoName(fit),
      heroId: String(fit.hero.id),
      itemIds: fit.items.map(function (x) { return String(x.p.id); }),
      slots: fit.items.map(function (x) { return x.slot; }),
      score: fit.score,
      total: fit.total,
      occasion: fit.occasion,
      variant: fit.variant,
      at: Date.now(),
      fav: false,
    };

    list.unshift(rec);
    if (list.length > 60) list = list.slice(0, 60);

    try { localStorage.setItem(WKEY, JSON.stringify(list)); }
    catch (e) { return null; }

    if (window.DPBrain) {
      try {
        DPBrain.feedback({
          action: 'saved',
          hero: fit.hero,
          items: fit.items.map(function (x) { return x.p; }),
          breakdown: fit.breakdown,
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    document.dispatchEvent(new CustomEvent('dp:wardrobe', { detail: { added: rec } }));
    return rec;
  }

  function autoName(fit) {
    var occ = fit.occasion && OCCASION[fit.occasion]
      ? OCCASION[fit.occasion].name : '';
    var base = (fit.hero.name || 'ست').split(' ').slice(0, 3).join(' ');
    return occ ? base + ' — ' + occ : base;
  }

  function removeOutfit(id) {
    var list = readWardrobe().filter(function (x) { return x.id !== id; });
    try { localStorage.setItem(WKEY, JSON.stringify(list)); } catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:wardrobe', { detail: { removed: id } }));
    return true;
  }

  function favOutfit(id) {
    var list = readWardrobe();
    var hit = list.filter(function (x) { return x.id === id; })[0];
    if (!hit) return false;
    hit.fav = !hit.fav;
    try { localStorage.setItem(WKEY, JSON.stringify(list)); } catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:wardrobe', { detail: { fav: id } }));
    return hit.fav;
  }

  /* ============================================================
     ۱۱. افزودن ست به سبد
     ------------------------------------------------------------
     کالایی که سایز دارد را نمی‌شود کورکورانه افزود — مشتری
     باید خودش انتخاب کند وگرنه مرجوعی می‌شود.
     ============================================================ */
  function addToCart(fit) {
    if (!fit || !window.DPCart) return { ok: false, error: 'سبد در دسترس نیست' };

    var added = 0;
    var needSize = [];
    var all = [fit.hero].concat(fit.items.map(function (x) { return x.p; }));

    all.forEach(function (p) {
      if (arr(p.sizes).length) { needSize.push(p); return; }
      try {
        DPCart.add(p.id, { qty: 1, color: arr(p.colors)[0] || '', size: '' });
        added++;
      } catch (e) { /* موجودی تمام شده */ }
    });

    if (added && window.DPBrain) {
      try {
        DPBrain.feedback({
          action: 'accepted',
          hero: fit.hero,
          items: fit.items.map(function (x) { return x.p; }),
          breakdown: fit.breakdown,
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    return { ok: added > 0, added: added, needSize: needSize };
  }

  window.DPDigiAI = {
    OCCASION: OCCASION,
    STYLE: STYLE,
    PALETTE: PALETTE,
    BUDGET: BUDGET,
    VARIANT: VARIANT,
    sectionOf: sectionOf,
    sectionFits: sectionFits,
    generate: generate,
    swap: swap,
    scoreItem: scoreItem,
    explain: explain,
    readWardrobe: readWardrobe,
    saveOutfit: saveOutfit,
    removeOutfit: removeOutfit,
    favOutfit: favOutfit,
    addToCart: addToCart,
    priceOf: priceOf,
    slotOf: slotOf,
  };
})();
