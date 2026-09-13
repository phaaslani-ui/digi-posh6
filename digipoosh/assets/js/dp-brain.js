/* ============================================================
   dp-brain.js — مغز یادگیرنده‌ی دیجی‌پوش
   ------------------------------------------------------------
   این فایل با `dp-palette.js` و `dp-stylist.js` فرق بنیادی
   دارد. آن دو **قاعده‌های ثابت** دارند که من نوشتم. این یکی
   **از رفتار واقعی مشتری‌های شما یاد می‌گیرد** و قاعده‌های
   خودش را می‌سازد.

   چه چیزی یاد می‌گیرد؟

     ۱. کدام رنگ‌ها واقعاً با هم خریده می‌شوند
     ۲. کدام کالاها در یک سبد کنار هم می‌نشینند
     ۳. مشتری‌ها دنبال چه می‌گردند و چه چیزی را کلیک می‌کنند
     ۴. کدام پیشنهاد دیجی AI پذیرفته شد و کدام رد
     ۵. کدام رنگ در چه فصلی بیشتر فروش دارد
     ۶. سلیقه‌ی شخصی هر مشتری

   چطور کار می‌کند؟

     هر رویداد (خرید، کلیک، جست‌وجو) یک «سیگنال» است.
     سیگنال‌ها وزن دارند: خرید ۱۰ برابر یک کلیک می‌ارزد.
     مغز از این سیگنال‌ها یک ماتریس هم‌رخدادی می‌سازد و
     با آن پیش‌بینی می‌کند.

     این همان روشی است که موتورهای پیشنهاد واقعی
     (آمازون، نتفلیکس) به کار می‌برند — به آن
     «فیلترینگ مشارکتی» می‌گویند.

   مهم: این هوش مصنوعی به معنای شبکه‌ی عصبی نیست، ولی
   **واقعاً یاد می‌گیرد** — یعنی رفتارش با گذشت زمان و
   بیشتر شدن داده تغییر می‌کند، بدون اینکه کسی کد را
   دست بزند.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'dp_brain';           /* دانش انباشته */
  var LOG = 'dp_brain_log';       /* رویدادهای خام */
  var VER = 4;                    /* نسخه‌ی ساختار داده */

  var MAX_LOG = 4000;             /* سقف رویداد خام */
  var MAX_PAIR = 6000;            /* سقف جفت‌های یادگرفته‌شده */

  /* ============================================================
     وزن سیگنال‌ها
     ------------------------------------------------------------
     خرید مهم‌ترین سیگنال است چون مشتری پول داده. دیدن
     ضعیف‌ترین است چون ممکن است تصادفی باشد.
     ============================================================ */
  var W = {
    purchase:   10,    /* خرید — قوی‌ترین */
    cart:        4,    /* افزودن به سبد */
    outfit:      6,    /* پذیرش پیشنهاد ست دیجی AI */
    wish:        3,    /* افزودن به علاقه‌مندی */
    click:       1,    /* کلیک روی کالا */
    view:      0.4,    /* باز کردن صفحه‌ی کالا */
    search:      2,    /* جست‌وجو و انتخاب نتیجه */
    reject:     -3,    /* پیشنهاد دیده شد ولی رد شد */
    return:     -8,    /* مرجوعی — سیگنال منفی قوی */
  };

  /* ============================================================
     ذخیره‌سازی امن
     ------------------------------------------------------------
     روی `file://` حافظه قفل است؛ آنجا در حافظه‌ی موقت
     کار می‌کنیم تا صفحه نشکند.
     ============================================================ */
  var mem = {};

  function rd(k, fallback) {
    try {
      var raw = localStorage.getItem(k);
      if (raw == null) return fallback;
      var v = JSON.parse(raw);
      return (v && typeof v === 'object') ? v : fallback;
    } catch (e) {
      return mem[k] !== undefined ? mem[k] : fallback;
    }
  }

  function wr(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { mem[k] = v; }
  }

  /* ============================================================
     ساختار دانش
     ============================================================ */
  function blank() {
    return {
      v: VER,
      born: Date.now(),
      n: 0,                 /* شمار کل سیگنال‌ها */

      colorPair: {},        /* «navy|cream» → وزن */
      colorSolo: {},        /* «navy» → وزن (محبوبیت رنگ) */
      slotPair: {},         /* «top|bottom» → وزن */
      itemPair: {},         /* «p1|p2» → وزن (هم‌خریدی) */
      catPair: {},          /* «پیراهن|شلوار» → وزن */
      patternPair: {},      /* «stripe|plain» → وزن */
      fabricSeason: {},     /* «wool|winter» → وزن */

      colorSeason: {},      /* «navy|winter» → وزن */
      priceBand: {},        /* «2|3» → وزن (هم‌ردیفی قیمت) */

      terms: {},            /* واژه‌های جست‌وجو → شمار */
      termHit: {},          /* واژه → کالاهایی که انتخاب شد */

      user: {},             /* شناسه‌ی مشتری → سلیقه */

      /* ============================================================
         حلقه‌ی تقویتی — وزن‌های خودتنظیم
         ------------------------------------------------------------
         تا اینجا مغز «چه چیزی با چه چیزی» را یاد می‌گرفت. حالا
         یک پله بالاتر می‌رود: یاد می‌گیرد **کدام معیار مهم‌تر
         است**.

         مثال واقعی: اگر مشتری‌های شما مدام ست‌هایی را می‌پذیرند
         که رنگشان هماهنگ است ولی سطح رسمیتشان فرق دارد، یعنی
         برای آن‌ها رنگ مهم‌تر از رسمیت است. مغز خودش وزن رنگ را
         بالا و وزن رسمیت را پایین می‌آورد.

         این همان کاری است که یادگیری تقویتی می‌کند: از پاداش و
         تنبیه، سیاست خودش را اصلاح می‌کند.
         ============================================================ */
      weights: null,        /* وزن‌های جاری — null یعنی پیش‌فرض */
      credit: {},           /* «معیار» → {win, loss} سابقه‌ی موفقیت */
      episodes: 0,          /* چند بار بازخورد گرفته‌ایم */
      lastTune: 0,          /* آخرین تنظیم وزن */

      outfitLog: {},        /* «hash ست» → {shown, taken, swapped} */
      slotSwap: {},         /* «shoes» → چند بار عوض شد */

      updated: 0,
    };
  }

  var B = null;

  function load() {
    if (B) return B;
    var d = rd(KEY, null);
    if (!d || d.v !== VER) d = blank();

    /* محافظ شکل داده — اگر چیزی خراب بود، بازسازی شود */
    var need = ['colorPair','colorSolo','slotPair','itemPair','catPair',
                'patternPair','fabricSeason','colorSeason','priceBand',
                'terms','termHit','user','credit','outfitLog','slotSwap'];
    need.forEach(function (k) {
      if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {};
    });
    if (typeof d.n !== 'number' || !isFinite(d.n)) d.n = 0;
    if (typeof d.episodes !== 'number' || !isFinite(d.episodes)) d.episodes = 0;
    if (d.weights && typeof d.weights !== 'object') d.weights = null;

    B = d;
    return B;
  }

  function save() {
    if (!B) return;
    B.updated = Date.now();
    prune();
    wr(KEY, B);
  }

  /* ============================================================
     هرس — جلوگیری از پر شدن حافظه
     ------------------------------------------------------------
     وقتی جدول از حد گذشت، ضعیف‌ترین‌ها حذف می‌شوند. این
     همان کاری است که مغز واقعی می‌کند: چیزهای کم‌اهمیت
     فراموش می‌شوند.
     ============================================================ */
  function prune() {
    ['colorPair','itemPair','catPair','slotPair','patternPair',
     'colorSeason','fabricSeason','priceBand'].forEach(function (t) {
      var o = B[t];
      var keys = Object.keys(o);
      if (keys.length <= MAX_PAIR) return;
      keys.sort(function (a, b) { return (o[a] || 0) - (o[b] || 0); });
      var cut = keys.length - Math.floor(MAX_PAIR * 0.8);
      for (var i = 0; i < cut; i++) delete o[keys[i]];
    });

    /* واژه‌های جست‌وجوی یک‌باره هم پاک شوند */
    var tk = Object.keys(B.terms);
    if (tk.length > 1200) {
      tk.sort(function (a, b) { return B.terms[a] - B.terms[b]; });
      for (var j = 0; j < tk.length - 900; j++) {
        delete B.terms[tk[j]];
        delete B.termHit[tk[j]];
      }
    }
  }

  /* ============================================================
     پوسیدگی زمانی
     ------------------------------------------------------------
     سلیقه‌ی مد عوض می‌شود. چیزی که پارسال محبوب بود شاید
     امسال نباشد. پس وزن‌ها آرام‌آرام کم می‌شوند تا داده‌ی
     تازه غالب بماند.

     هر ۳۰ روز، همه‌ی وزن‌ها در ۰٫۹ ضرب می‌شوند.
     ============================================================ */
  var DECAY_DAYS = 30;
  var DECAY_RATE = 0.9;

  function decay() {
    var last = B.decayed || B.born || Date.now();
    var days = (Date.now() - last) / 86400000;
    if (days < DECAY_DAYS) return;

    var times = Math.floor(days / DECAY_DAYS);
    var factor = Math.pow(DECAY_RATE, times);

    ['colorPair','colorSolo','itemPair','catPair','slotPair',
     'patternPair','colorSeason','fabricSeason','priceBand'].forEach(function (t) {
      var o = B[t];
      Object.keys(o).forEach(function (k) {
        o[k] = Math.round(o[k] * factor * 100) / 100;
        if (Math.abs(o[k]) < 0.15) delete o[k];   /* خیلی ضعیف = فراموش */
      });
    });

    B.decayed = Date.now();
  }

  /* ============================================================
     ابزار
     ============================================================ */
  function pairKey(a, b) {
    if (!a || !b || a === b) return '';
    return a < b ? a + '|' + b : b + '|' + a;   /* بی‌ترتیب */
  }

  function bump(table, key, w) {
    if (!key) return;
    var o = B[table];
    o[key] = Math.round(((o[key] || 0) + w) * 100) / 100;
  }

  /** رنگ‌های یک کالا از دانشنامه */
  function colorsOf(p) {
    if (window.DPPalette) {
      try { return DPPalette.colorsOf(p); } catch (e) { /* بی‌اهمیت */ }
    }
    var c = p.color || (Array.isArray(p.colors) ? p.colors[0] : '');
    return c ? [String(c)] : [];
  }

  function slotOf(p) {
    if (window.DPStylist) {
      try { return DPStylist.slotOf(p); } catch (e) { /* بی‌اهمیت */ }
    }
    return '';
  }

  /** فصل جاری — برای یادگیری فصلی */
  function season() {
    var m = new Date().getMonth();      /* ۰ تا ۱۱ میلادی */
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
    return 'winter';
  }

  /** باند قیمت — کالاهای هم‌ردیف با هم خریده می‌شوند */
  function bandOf(price) {
    var n = Number(price) || 0;
    if (n <= 0) return '0';
    if (n < 300000) return '1';
    if (n < 800000) return '2';
    if (n < 2000000) return '3';
    if (n < 5000000) return '4';
    if (n < 15000000) return '5';
    return '6';
  }

  /* ============================================================
     یادگیری از یک جفت کالا
     ------------------------------------------------------------
     قلب سیستم. وقتی دو کالا با هم خریده می‌شوند، همه‌ی
     ویژگی‌هایشان هم‌رخداد می‌شوند: رنگ‌ها، دسته‌ها، طرح‌ها،
     جایگاه‌ها. مغز همه را یاد می‌گیرد.
     ============================================================ */
  function learnPair(a, b, weight) {
    if (!a || !b) return;
    var w = Number(weight) || 1;

    /* ---------- کالا با کالا ---------- */
    bump('itemPair', pairKey(String(a.id), String(b.id)), w);

    /* ---------- رنگ با رنگ ----------
       این همان «یادگیری رنگ» است که خواستید. اگر مشتری‌ها
       مدام سرمه‌ای را با کرم بخرند، مغز یاد می‌گیرد این دو
       با هم می‌روند — حتی اگر قاعده‌های من چیز دیگری بگویند. */
    var ca = colorsOf(a), cb = colorsOf(b);
    ca.forEach(function (x) {
      cb.forEach(function (y) {
        bump('colorPair', pairKey(x, y), w);
      });
    });

    /* ---------- دسته با دسته ---------- */
    if (a.category && b.category) {
      bump('catPair', pairKey(a.category, b.category), w);
    }

    /* ---------- جایگاه با جایگاه ---------- */
    var sa = slotOf(a), sb = slotOf(b);
    if (sa && sb) bump('slotPair', pairKey(sa, sb), w);

    /* ---------- طرح با طرح ---------- */
    if (a.pattern && b.pattern) {
      bump('patternPair', pairKey(String(a.pattern), String(b.pattern)), w);
    }

    /* ---------- باند قیمت ---------- */
    bump('priceBand', pairKey(bandOf(a.price), bandOf(b.price)), w);
  }

  /** یادگیری از یک کالای تنها */
  function learnSolo(p, weight) {
    if (!p) return;
    var w = Number(weight) || 1;
    var s = season();

    colorsOf(p).forEach(function (c) {
      bump('colorSolo', c, w);
      bump('colorSeason', c + '|' + s, w);
    });

    if (p.fabric) bump('fabricSeason', String(p.fabric) + '|' + s, w);
  }

  /* ============================================================
     ثبت رویداد — درگاه اصلی
     ------------------------------------------------------------
     همه‌ی بخش‌های سایت این تابع را صدا می‌زنند.

       DPBrain.track('purchase', { items: [...] })
       DPBrain.track('view',     { product: p })
       DPBrain.track('search',   { term: 'پیراهن', picked: p })
     ============================================================ */
  function track(kind, data) {
    try {
      load();
      decay();

      var w = W[kind];
      if (w === undefined) return false;

      data = data || {};
      B.n++;

      /* ---------- فهرست کالا: همه با همه یاد گرفته می‌شوند ---------- */
      var list = data.items || (data.product ? [data.product] : []);
      list = list.filter(function (x) { return x && x.id; });

      list.forEach(function (p) { learnSolo(p, w); });

      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          learnPair(list[i], list[j], w);
        }
      }

      /* ---------- جفت صریح (پیشنهاد ست) ---------- */
      if (data.base && data.with) {
        learnPair(data.base, data.with, w);
      }

      /* ---------- جست‌وجو ---------- */
      if (data.term) {
        var t = normTerm(data.term);
        if (t.length >= 2) {
          B.terms[t] = (B.terms[t] || 0) + 1;

          if (data.picked && data.picked.id) {
            if (!B.termHit[t]) B.termHit[t] = {};
            var id = String(data.picked.id);
            B.termHit[t][id] = (B.termHit[t][id] || 0) + 1;
          }
        }
      }

      /* ---------- سلیقه‌ی شخصی ---------- */
      var uid = data.userId || currentUser();
      if (uid && list.length) {
        if (!B.user[uid]) B.user[uid] = { colors: {}, cats: {}, n: 0 };
        var U = B.user[uid];
        U.n++;
        list.forEach(function (p) {
          colorsOf(p).forEach(function (c) {
            U.colors[c] = Math.round(((U.colors[c] || 0) + w) * 100) / 100;
          });
          if (p.category) {
            U.cats[p.category] = Math.round(((U.cats[p.category] || 0) + w) * 100) / 100;
          }
        });
        /* سلیقه‌ی شخصی هم هرس شود */
        trimObj(U.colors, 40);
        trimObj(U.cats, 40);
      }

      /* ---------- رویداد خام، برای بازسازی و گزارش ---------- */
      logRaw(kind, list.map(function (p) { return String(p.id); }), data.term || '');

      save();
      return true;
    } catch (e) {
      return false;   /* مغز هرگز نباید صفحه را بشکند */
    }
  }

  function trimObj(o, max) {
    var k = Object.keys(o);
    if (k.length <= max) return;
    k.sort(function (a, b) { return o[a] - o[b]; });
    for (var i = 0; i < k.length - max; i++) delete o[k[i]];
  }

  function logRaw(kind, ids, term) {
    var L = rd(LOG, []);
    if (!Array.isArray(L)) L = [];
    L.push({ k: kind, i: ids, q: term, t: Date.now() });
    if (L.length > MAX_LOG) L = L.slice(-Math.floor(MAX_LOG * 0.75));
    wr(LOG, L);
  }

  function currentUser() {
    try {
      var s = JSON.parse(localStorage.getItem('dp_customer_session') || 'null');
      return (s && s.user_id) ? String(s.user_id) : '';
    } catch (e) { return ''; }
  }

  function normTerm(s) {
    return String(s || '')
      .replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
      .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
      .replace(/\u200c/g, ' ')
      .replace(/\s+/g, ' ')
      .trim().toLowerCase();
  }

  /* ============================================================
     یادگیری گذشته‌نگر از سفارش‌های موجود
     ------------------------------------------------------------
     سایت شما از قبل سفارش دارد. حیف است استفاده نشود.
     این تابع یک بار همه را می‌خواند و یاد می‌گیرد.
     ============================================================ */
  function learnFromHistory() {
    load();

    var done = B.historyDone || 0;
    var orders = [];
    try {
      var raw = JSON.parse(localStorage.getItem('dp_orders') || '[]');
      if (Array.isArray(raw)) orders = raw;
    } catch (e) { return 0; }

    if (orders.length <= done) return 0;

    var prods = [];
    try {
      if (window.DPSafe) prods = DPSafe.products();
      else prods = JSON.parse(localStorage.getItem('dp_products') || '[]');
    } catch (e) { prods = []; }

    var byId = {};
    prods.forEach(function (p) { if (p && p.id) byId[String(p.id)] = p; });

    var learned = 0;

    orders.slice(done).forEach(function (o) {
      if (!o || !Array.isArray(o.lines)) return;

      var items = o.lines
        .map(function (l) { return byId[String(l.productId)]; })
        .filter(Boolean);

      if (!items.length) return;

      /* سفارش مرجوعی سیگنال منفی است */
      var kind = (o.status === 'returned' || o.status === 'canceled')
        ? 'return' : 'purchase';

      track(kind, { items: items, userId: o.userId || '' });
      learned++;
    });

    B.historyDone = orders.length;
    save();

    /* ---------- اعلام یادگیری ----------
       یادگیری از تاریخچه با تأخیر انجام می‌شود تا صفحه کند
       نشود. ولی هرکس که آمار مغز را نشان می‌دهد (مثل کارت
       پنل مدیریت) باید بداند کِی داده آماده شد، وگرنه
       «هنوز چیزی یاد نگرفته» نشان می‌دهد در حالی که
       سفارش‌ها موجودند. */
    if (learned) {
      try {
        document.dispatchEvent(new CustomEvent('dp:brain', {
          detail: { learned: learned, stats: stats() },
        }));
      } catch (e) { /* بی‌اهمیت */ }
    }

    return learned;
  }

  /* ============================================================
     پرسش از مغز — هماهنگی دو رنگ بر پایه‌ی تجربه
     ------------------------------------------------------------
     خروجی:
       { score: 0..100, n: تعداد مشاهده, confident: bool }

     «اطمینان» مهم است: اگر فقط دو بار دیده شده، نباید
     قاعده‌ی دانشنامه را کنار بزند. اعتماد با تعداد می‌آید.
     ============================================================ */
  var CONFIDENT_AT = 12;   /* از این وزن به بالا، مغز جدی گرفته می‌شود */

  function colorAffinity(a, b) {
    load();
    var k = pairKey(a, b);
    if (!k) return { score: 50, n: 0, confident: false };

    var raw = B.colorPair[k] || 0;

    /* میانگین وزن همه‌ی جفت‌ها، برای نرمال‌سازی */
    var avg = avgOf('colorPair');

    /* نسبت به میانگین: بالاتر از میانگین یعنی محبوب */
    var ratio = avg > 0 ? raw / avg : 0;

    /* تبدیل به ۰..۱۰۰ با منحنی ملایم */
    var score = 50 + 50 * (Math.atan(ratio - 1) / (Math.PI / 2));
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score: score,
      n: Math.round(raw * 10) / 10,
      confident: Math.abs(raw) >= CONFIDENT_AT,
    };
  }

  var _avgCache = {};
  function avgOf(table) {
    var stamp = B.updated || 0;
    var c = _avgCache[table];
    if (c && c.stamp === stamp) return c.v;

    var o = B[table];
    var keys = Object.keys(o);
    if (!keys.length) {
      _avgCache[table] = { stamp: stamp, v: 0 };
      return 0;
    }
    var sum = 0;
    keys.forEach(function (k) { sum += o[k]; });
    var v = sum / keys.length;
    _avgCache[table] = { stamp: stamp, v: v };
    return v;
  }

  /* ============================================================
     ترکیب دانش با تجربه — مهم‌ترین تابع
     ------------------------------------------------------------
     امتیاز نهایی = آمیزه‌ی قاعده‌ی ثابت و تجربه‌ی واقعی.

     وزن تجربه با تعداد مشاهده بالا می‌رود:
       تجربه‌ی کم  → قاعده حرف اول را می‌زند
       تجربه‌ی زیاد → تجربه غالب می‌شود

     این دقیقاً کاری است که یک فروشنده‌ی باتجربه می‌کند:
     اول کتاب را می‌خواند، بعد از مشتری‌هایش یاد می‌گیرد.
     ============================================================ */
  function blend(ruleScore, brainResult, maxShift) {
    var r = Number(ruleScore) || 0;
    if (!brainResult || !brainResult.n) return r;

    var n = Math.abs(brainResult.n);
    /* سهم تجربه: از صفر شروع می‌شود و تا سقف بالا می‌رود */
    var trust = n / (n + CONFIDENT_AT);          /* ۰ تا ~۱ */
    var cap = maxShift == null ? 0.45 : maxShift;
    trust = Math.min(cap, trust);

    return Math.round(r * (1 - trust) + brainResult.score * trust);
  }

  /* ============================================================
     کالاهایی که با این کالا خریده شده‌اند
     ------------------------------------------------------------
     «مشتری‌هایی که این را خریدند، این‌ها را هم خریدند»
     ============================================================ */
  function boughtWith(productId, pool, limit) {
    load();
    var id = String(productId);
    var out = [];

    (pool || []).forEach(function (p) {
      if (!p || String(p.id) === id) return;
      var w = B.itemPair[pairKey(id, String(p.id))] || 0;
      if (w > 0) out.push({ p: p, w: w });
    });

    out.sort(function (a, b) { return b.w - a.w; });
    return out.slice(0, limit || 6);
  }

  /* ============================================================
     محبوبیت رنگ در فصل جاری
     ============================================================ */
  function trendingColors(limit) {
    load();
    var s = season();
    var out = [];

    Object.keys(B.colorSeason).forEach(function (k) {
      var parts = k.split('|');
      if (parts[1] !== s) return;
      out.push({ color: parts[0], w: B.colorSeason[k] });
    });

    out.sort(function (a, b) { return b.w - a.w; });
    return out.slice(0, limit || 8).map(function (x) {
      var nm = x.color;
      if (window.DPPalette && DPPalette.HUE[x.color]) {
        nm = DPPalette.HUE[x.color].name;
      }
      return { key: x.color, name: nm, weight: Math.round(x.w * 10) / 10 };
    });
  }

  /* ============================================================
     سلیقه‌ی شخصی مشتری
     ============================================================ */
  function taste(userId) {
    load();
    var uid = userId || currentUser();
    var U = uid ? B.user[uid] : null;
    if (!U || U.n < 3) return null;      /* داده‌ی کم = حدس نزن */

    function top(o, n) {
      return Object.keys(o)
        .sort(function (a, b) { return o[b] - o[a]; })
        .slice(0, n || 4);
    }

    return {
      colors: top(U.colors, 5),
      categories: top(U.cats, 5),
      strength: Math.min(1, U.n / 20),
      n: U.n,
    };
  }

  /* ============================================================
     پیشنهاد تکمیل جست‌وجو از آنچه یاد گرفته
     ============================================================ */
  function popularTerms(prefix, limit) {
    load();
    var q = normTerm(prefix);
    var out = [];

    Object.keys(B.terms).forEach(function (t) {
      if (q && t.indexOf(q) !== 0) return;
      out.push({ term: t, n: B.terms[t] });
    });

    out.sort(function (a, b) { return b.n - a.n; });
    return out.slice(0, limit || 6);
  }

  /** کالاهایی که مردم پس از این جست‌وجو انتخاب کردند
   *
   *  ⚠️ نکته‌ای که در آزمون معلوم شد: تطابق دقیق کافی نیست.
   *  اگر مردم «پیراهن مجلسی» را جست‌وجو کرده و کالایی را
   *  انتخاب کرده باشند، کسی که «پیراهن» می‌جوید هم باید از
   *  آن دانش بهره ببرد — چون جست‌وجویش زیرمجموعه‌ی آن است.
   *
   *  پس عبارت‌های مرتبط هم شمرده می‌شوند، با وزن کمتر.
   */
  function termWinners(term, pool, limit) {
    load();
    var t = normTerm(term);
    if (!t) return [];

    var score = {};

    function collect(key, factor) {
      var hits = B.termHit[key];
      if (!hits) return;
      Object.keys(hits).forEach(function (id) {
        score[id] = (score[id] || 0) + hits[id] * factor;
      });
    }

    /* تطابق دقیق — کامل‌ترین وزن */
    collect(t, 1);

    /* عبارت‌های مرتبط: آن‌هایی که این عبارت را در خود دارند
       («پیراهن» ⊂ «پیراهن مجلسی») یا برعکس */
    Object.keys(B.termHit).forEach(function (k) {
      if (k === t) return;
      if (k.indexOf(t) > -1) collect(k, 0.6);        /* عبارت جزئی‌تر */
      else if (t.indexOf(k) > -1) collect(k, 0.45);  /* عبارت کلی‌تر */
    });

    var out = [];
    (pool || []).forEach(function (p) {
      var n = score[String(p.id)];
      if (n) out.push({ p: p, n: n });
    });
    out.sort(function (a, b) { return b.n - a.n; });
    return out.slice(0, limit || 5);
  }

  /* ============================================================
     ۱. وزن‌های معیار — پیش‌فرض و خودتنظیم
     ------------------------------------------------------------
     اینها همان درصدهایی است که در مشخصات آمده بود. ولی برخلاف
     یک سیستم ثابت، **عددها قفل نیستند**. مغز از نتیجه‌ی واقعی
     یاد می‌گیرد کدام معیار بیشتر به پذیرش ست منجر می‌شود و
     وزن‌ها را جابه‌جا می‌کند.
     ============================================================ */
  var DEFAULT_W = {
    color:   0.30,   /* هماهنگی رنگ */
    style:   0.25,   /* هم‌سطحی سبک و رسمیت */
    occasion:0.20,   /* تناسب با مناسبت */
    taste:   0.15,   /* سلیقه‌ی شخصی مشتری */
    budget:  0.10,   /* هم‌ردیفی قیمت */
  };

  /* هیچ معیاری نباید کاملاً حذف یا تک‌تاز شود */
  var W_MIN = 0.05;
  var W_MAX = 0.45;

  /** وزن‌های جاری — یادگرفته یا پیش‌فرض */
  function weights() {
    load();
    if (!B.weights) return Object.assign({}, DEFAULT_W);

    var out = {};
    var sum = 0;
    Object.keys(DEFAULT_W).forEach(function (k) {
      var v = Number(B.weights[k]);
      if (!isFinite(v) || v < 0) v = DEFAULT_W[k];
      out[k] = Math.min(W_MAX, Math.max(W_MIN, v));
      sum += out[k];
    });

    /* همیشه جمعشان یک باشد */
    if (sum > 0) {
      Object.keys(out).forEach(function (k) { out[k] = out[k] / sum; });
    }
    return out;
  }

  /* ============================================================
     ۲. اعتباردهی — کدام معیار حق داشت؟
     ------------------------------------------------------------
     وقتی کاربر یک ست را می‌پذیرد، باید بفهمیم **چرا** خوب بود.
     اگر رنگ‌هایش خیلی هماهنگ بود و پذیرفته شد، معیار رنگ یک
     امتیاز می‌گیرد. اگر رنگ ضعیف بود ولی باز پذیرفته شد، رنگ
     امتیازی نمی‌گیرد — چیز دیگری کار کرده.

     در یادگیری تقویتی به این «انتساب اعتبار» می‌گویند.
     ============================================================ */
  function credit(breakdown, reward) {
    if (!breakdown || typeof breakdown !== 'object') return;
    load();

    Object.keys(DEFAULT_W).forEach(function (k) {
      var v = Number(breakdown[k]);
      if (!isFinite(v)) return;

      /* معیار وقتی «حرف داشته» که نمره‌اش از میانه دور باشد.
         نمره‌ی ۵۰ یعنی بی‌طرف؛ نه تأیید نه رد. */
      var strength = (v - 50) / 50;          /* −۱ تا +۱ */
      if (Math.abs(strength) < 0.15) return; /* بی‌طرف بود، رها کن */

      if (!B.credit[k]) B.credit[k] = { win: 0, loss: 0 };

      /* پاداش مثبت + معیار قوی  → آن معیار درست گفته
         پاداش منفی + معیار قوی  → آن معیار اشتباه گفته */
      var agree = strength * reward;

      if (agree > 0) B.credit[k].win += Math.abs(agree);
      else B.credit[k].loss += Math.abs(agree);
    });
  }

  /* ============================================================
     ۳. تنظیم وزن‌ها — گام یادگیری
     ------------------------------------------------------------
     هر ۱۲ بازخورد یک بار، وزن‌ها بازبینی می‌شوند. نرخ یادگیری
     کوچک است تا سیستم با چند مورد استثنایی زیر و رو نشود.
     ============================================================ */
  var TUNE_EVERY = 12;
  var LEARN_RATE = 0.06;

  function tune(force) {
    load();
    if (!force && B.episodes - (B.lastTune || 0) < TUNE_EVERY) return false;

    var cur = weights();
    var next = {};
    var sum = 0;

    /* گام یک: نرخ موفقیت هر معیار را جمع کن */
    var rates = {}, pending = {}, rateSum = 0, rateN = 0;

    Object.keys(DEFAULT_W).forEach(function (k) {
      var c = B.credit[k] || { win: 0, loss: 0 };
      var total = c.win + c.loss;

      /* داده‌ی کم = دست نزن */
      if (total < 2) return;

      /* نرخ موفقیت این معیار: ۰ تا ۱ */
      var rate = c.win / total;
      rates[k] = rate;
      rateSum += rate;
      rateN++;
      pending[k] = { c: c, total: total, rate: rate };
      return;
    });

    /* ---------- سنجش نسبی، نه مطلق ----------
       اگر همه‌ی معیارها نرخ ۹۰٪ داشته باشند، هیچ‌کدام برتر
       نیست — وزن‌ها نباید تکان بخورند. آنچه اهمیت دارد این
       است که یک معیار **نسبت به بقیه** بهتر عمل کند.

       پیش‌تر مبنا عدد ثابت ۰٫۵ بود؛ برای همین وقتی همه‌ی
       نرخ‌ها بالای ۵۰٪ بودند، همه‌ی وزن‌ها با هم بالا
       می‌رفتند و نرمال‌سازی نتیجه را بی‌معنا می‌کرد. */
    /* اگر فقط یک معیار داده دارد، مقایسه‌ی نسبی بی‌معناست
       (خودش با خودش برابر می‌شود). آنجا مبنای بی‌طرف ۰٫۵ را
       می‌گذاریم تا یادگیری متوقف نشود. */
    var mean = rateN >= 2 ? rateSum / rateN : 0.5;

    /* حتی وقتی چند معیار داده دارند، مبنا را کمی به سمت ۰٫۵
       می‌کشیم. اگر همه‌ی معیارها ضعیف عمل کنند، نباید فقط
       چون یکی «کمتر بد» است وزنش بالا برود. */
    if (rateN >= 2) mean = mean * 0.7 + 0.5 * 0.3;

    Object.keys(DEFAULT_W).forEach(function (k) {
      var q = pending[k];
      if (!q) { next[k] = cur[k]; sum += next[k]; return; }

      var trust = Math.min(1, q.total / 20);
      var delta = (q.rate - mean) * 2 * LEARN_RATE * trust;

      var v = cur[k] + delta;
      v = Math.min(W_MAX, Math.max(W_MIN, v));
      next[k] = v;
      sum += v;
    });

    /* نرمال‌سازی تا جمعشان دقیقاً یک شود */
    if (sum > 0) {
      Object.keys(next).forEach(function (k) {
        next[k] = Math.round((next[k] / sum) * 1000) / 1000;
      });
    }

    B.weights = next;
    B.lastTune = B.episodes;

    /* ---------- پوسیدگی ملایم سابقه ----------
       ⚠️ درسی که از آزمون گرفته شد: پوسیدگی ۲۵ درصدی خیلی
       تند بود. وقتی ۲۰ بازخورد مثبت و بعد ۲۵ بازخورد منفی
       می‌آمد، سابقه‌ی منفی پیش از آنکه جمع شود پاک می‌شد و
       وزن همچنان بالا می‌رفت — یعنی سیستم از اشتباهش یاد
       نمی‌گرفت.

       حالا ۸ درصد: آن‌قدر کم که سابقه بماند، آن‌قدر هست که
       داده‌ی خیلی قدیمی برای همیشه سنگینی نکند. */
    Object.keys(B.credit).forEach(function (k) {
      B.credit[k].win *= 0.92;
      B.credit[k].loss *= 0.92;
    });

    save();

    try {
      document.dispatchEvent(new CustomEvent('dp:brain-tune', {
        detail: { weights: next, episodes: B.episodes },
      }));
    } catch (e) { /* بی‌اهمیت */ }

    return true;
  }

  /* ============================================================
     ۴. بازخورد ست — درگاه اصلی حلقه‌ی تقویتی
     ------------------------------------------------------------
     صفحه‌ی DigiAI این را صدا می‌زند:

       DPBrain.feedback({
         action: 'accepted' | 'bought' | 'saved' | 'swapped' | 'ignored',
         hero: heroProduct,
         items: [product, …],
         breakdown: { color: 88, style: 72, … },   ← نمره‌ی هر معیار
         swappedOut: product,                       ← اگر عوض شد
       })
     ============================================================ */
  var REWARD = {
    bought:   1.0,    /* خرید کامل ست — بهترین */
    accepted: 0.7,    /* افزودن به سبد */
    saved:    0.5,    /* ذخیره در کمد */
    shown:    0.0,    /* فقط دیده شد — بی‌طرف */
    swapped: -0.5,    /* قطعه‌ای را عوض کرد */
    ignored: -0.3,    /* رد کرد */
  };

  function feedback(data) {
    try {
      load();
      decay();

      data = data || {};
      var reward = REWARD[data.action];
      if (reward === undefined) return false;

      var hero = data.hero || null;
      var items = (data.items || []).filter(function (x) { return x && x.id; });

      B.episodes++;

      /* ⚠️ `B.n` شمار کل سیگنال‌هاست و `stats().signals` از آن
         می‌خواند. اگر فقط `episodes` بالا برود، هر نمایشگری که
         به `signals` نگاه می‌کند فکر می‌کند مغز هیچ ندیده —
         حتی وقتی ده‌ها بازخورد گرفته. هر دو باید بشمارند. */
      B.n++;

      /* ---------- ۱. تقویت جفت‌ها ----------
         وزن سیگنال متناسب با پاداش است. پاداش منفی یعنی
         جفت‌ها تضعیف می‌شوند. */
      var w = reward * 6;
      if (w !== 0 && hero) {
        items.forEach(function (p) {
          if (String(p.id) !== String(hero.id)) learnPair(hero, p, w);
        });
      }

      /* بین خود قطعه‌ها هم — ولی ضعیف‌تر، چون رابطه‌شان
         غیرمستقیم است */
      if (w > 0) {
        for (var i = 0; i < items.length; i++) {
          for (var j = i + 1; j < items.length; j++) {
            learnPair(items[i], items[j], w * 0.4);
          }
        }
      }

      /* ---------- ۲. انتساب اعتبار به معیارها ---------- */
      credit(data.breakdown, reward);

      /* ---------- ۳. قطعه‌ای که عوض شد ----------
         این گران‌بهاترین سیگنال منفی است: کاربر دقیقاً گفت
         «این یکی نه». هم جفتش تضعیف می‌شود، هم یاد می‌گیریم
         کدام جایگاه بیشتر مشکل‌ساز است. */
      if (data.swappedOut && data.swappedOut.id && hero) {
        learnPair(hero, data.swappedOut, -4);
        var sl = slotOf(data.swappedOut);
        if (sl) B.slotSwap[sl] = (B.slotSwap[sl] || 0) + 1;
      }

      /* ---------- ۴. سابقه‌ی این ترکیب ---------- */
      if (items.length) {
        var key = items.map(function (p) { return String(p.id); }).sort().join(',');
        if (!B.outfitLog[key]) B.outfitLog[key] = { shown: 0, taken: 0, swapped: 0 };
        var rec = B.outfitLog[key];
        rec.shown++;
        if (reward > 0) rec.taken++;
        if (data.action === 'swapped') rec.swapped++;
      }

      /* ---------- ۵. سلیقه‌ی شخصی ---------- */
      var uid = data.userId || currentUser();
      if (uid && items.length && reward > 0) {
        track('cart', { items: items, userId: uid });
      }

      logRaw('fb:' + data.action, items.map(function (p) { return String(p.id); }), '');
      save();

      /* ---------- ۶. گام یادگیری ---------- */
      tune(false);

      return true;
    } catch (e) {
      return false;   /* بازخورد هرگز نباید صفحه را بشکند */
    }
  }

  /** آیا این ترکیب قبلاً رد شده؟ */
  function outfitHistory(items) {
    load();
    var key = (items || []).map(function (p) { return String(p.id); }).sort().join(',');
    return B.outfitLog[key] || null;
  }

  /** کدام جایگاه بیشتر عوض می‌شود؟ — برای بهبود انتخاب */
  function weakSlots() {
    load();
    return Object.keys(B.slotSwap)
      .map(function (k) { return { slot: k, n: B.slotSwap[k] }; })
      .sort(function (a, b) { return b.n - a.n; });
  }

  /** گزارش وزن‌ها برای نمایش به مدیر */
  function weightReport() {
    load();
    var cur = weights();
    var FA_LBL = {
      color: 'هماهنگی رنگ', style: 'هم‌سطحی سبک',
      occasion: 'تناسب مناسبت', taste: 'سلیقه‌ی شخصی',
      budget: 'هم‌ردیفی قیمت',
    };

    return Object.keys(cur).map(function (k) {
      var c = B.credit[k] || { win: 0, loss: 0 };
      var tot = c.win + c.loss;
      return {
        key: k,
        name: FA_LBL[k] || k,
        weight: cur[k],
        percent: Math.round(cur[k] * 100),
        base: Math.round(DEFAULT_W[k] * 100),
        shift: Math.round((cur[k] - DEFAULT_W[k]) * 100),
        samples: Math.round(tot * 10) / 10,
        rate: tot > 1 ? Math.round((c.win / tot) * 100) : null,
      };
    }).sort(function (a, b) { return b.weight - a.weight; });
  }

  /** بازگرداندن وزن‌ها به پیش‌فرض */
  function resetWeights() {
    load();
    B.weights = null;
    B.credit = {};
    B.lastTune = B.episodes;
    save();
    return true;
  }

  /* ============================================================
     گزارش وضعیت — برای پنل مدیریت
     ============================================================ */
  function stats() {
    load();
    var days = Math.max(1, (Date.now() - (B.born || Date.now())) / 86400000);

    return {
      signals: B.n,
      days: Math.round(days),
      colorPairs: Object.keys(B.colorPair).length,
      itemPairs: Object.keys(B.itemPair).length,
      catPairs: Object.keys(B.catPair).length,
      terms: Object.keys(B.terms).length,
      users: Object.keys(B.user).length,
      season: season(),
      /* بلوغ: چقدر می‌شود به مغز اعتماد کرد */
      maturity: Math.min(100, Math.round(B.n / 5)),
      episodes: B.episodes || 0,
      tuned: !!B.weights,
      born: B.born,
      updated: B.updated,
    };
  }

  /** بهترین جفت‌های رنگی که یاد گرفته — برای نمایش به مدیر */
  function topColorPairs(limit) {
    load();
    var out = [];
    Object.keys(B.colorPair).forEach(function (k) {
      var w = B.colorPair[k];
      if (w <= 0) return;
      var p = k.split('|');
      var n1 = p[0], n2 = p[1];
      if (window.DPPalette) {
        if (DPPalette.HUE[p[0]]) n1 = DPPalette.HUE[p[0]].name;
        if (DPPalette.HUE[p[1]]) n2 = DPPalette.HUE[p[1]].name;
      }
      out.push({ a: p[0], b: p[1], nameA: n1, nameB: n2, w: w });
    });
    out.sort(function (a, b) { return b.w - a.w; });
    return out.slice(0, limit || 10);
  }

  /* ============================================================
     پاک کردن — برای مدیر
     ============================================================ */
  function reset() {
    B = blank();
    _avgCache = {};
    wr(KEY, B);
    wr(LOG, []);
    return true;
  }

  /** خروجی دانش برای پشتیبان‌گیری */
  function exportKnowledge() {
    load();
    return JSON.stringify({ brain: B, log: rd(LOG, []) });
  }

  function importKnowledge(json) {
    try {
      var d = JSON.parse(json);
      if (!d || !d.brain || d.brain.v !== VER) return false;
      B = d.brain;
      wr(KEY, B);
      if (Array.isArray(d.log)) wr(LOG, d.log);
      _avgCache = {};
      return true;
    } catch (e) { return false; }
  }

  /* ============================================================
     خودکار: از تاریخچه یاد بگیر
     ------------------------------------------------------------
     یک بار هنگام بارگذاری، بدون معطل کردن صفحه.
     ============================================================ */
  function autoLearn() {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(function () { learnFromHistory(); }, { timeout: 3000 });
    } else {
      setTimeout(learnFromHistory, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLearn);
  } else {
    autoLearn();
  }

  window.DPBrain = {
    W: W,
    track: track,
    colorAffinity: colorAffinity,
    blend: blend,
    boughtWith: boughtWith,
    trendingColors: trendingColors,
    taste: taste,
    popularTerms: popularTerms,
    termWinners: termWinners,
    learnFromHistory: learnFromHistory,
    stats: stats,
    topColorPairs: topColorPairs,
    season: season,
    reset: reset,
    exportKnowledge: exportKnowledge,
    importKnowledge: importKnowledge,

    /* ---------- حلقه‌ی تقویتی ---------- */
    DEFAULT_W: DEFAULT_W,
    REWARD: REWARD,
    weights: weights,
    feedback: feedback,
    tune: tune,
    weightReport: weightReport,
    resetWeights: resetWeights,
    outfitHistory: outfitHistory,
    weakSlots: weakSlots,
  };
})();
