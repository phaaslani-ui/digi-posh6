/* ============================================================
   dp-suggest.js — موتور تکمیل عبارت جست‌وجو
   ------------------------------------------------------------
   سبک دیجی‌کالا: هنگام تایپ، **کالا نشان نمی‌دهد**؛ عبارت‌های
   کامل پیشنهاد می‌دهد. مشتری یکی را انتخاب می‌کند و آن‌وقت
   وارد صفحه‌ی نتایج می‌شود.

   چرا این بهتر است؟
     مشتری وقتی «پیر» تایپ می‌کند، هنوز نمی‌داند دقیقاً چه
     می‌خواهد. نشان دادن شش کالای تصادفی کمکش نمی‌کند. ولی
     دیدن «پیراهن مردانه»، «پیراهن مجلسی زنانه»، «پیراهن
     کتان» به او کمک می‌کند فکرش را جمع کند.

   عبارت‌ها از کجا می‌آیند؟
     ۱. دسته‌بندی‌های واقعی سایت
     ۲. نام کالاهای موجود
     ۳. ترکیب دسته + رنگ / جنس / بخش
     ۴. نام فروشگاه‌ها
     ۵. **آنچه مشتری‌های قبلی جست‌وجو کرده‌اند** (از مغز)

   همه‌ی عبارت‌های پیشنهادی **نتیجه دارند** — هرگز عبارتی
   پیشنهاد نمی‌شود که به صفحه‌ی خالی برسد.
   ============================================================ */
(function () {
  'use strict';

  var FA = '۰۱۲۳۴۵۶۷۸۹';

  /* ============================================================
     یکسان‌سازی متن
     ------------------------------------------------------------
     فارسی چند جور نوشته می‌شود: «ی» عربی و فارسی، «ک» عربی،
     نیم‌فاصله، ارقام فارسی و عربی. بدون یکسان‌سازی، جست‌وجو
     نتیجه نمی‌دهد.

     ⚠️ «آ» را به «ا» تبدیل نمی‌کنیم — این کار قبلاً واژه‌ها
     را خراب می‌کرد («آستین» می‌شد «استین»).
     ============================================================ */
  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
      .replace(/[يى]/g, 'ی')
      .replace(/[كک]/g, 'ک')
      .replace(/[ۀة]/g, 'ه')
      .replace(/[\u064B-\u0652]/g, '')       /* اعراب */
      .replace(/\u200c/g, ' ')               /* نیم‌فاصله */
      .replace(/[‌\s]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* ============================================================
     فاصله‌ی ویرایشی — تحمل غلط تایپی
     ------------------------------------------------------------
     کاربر «پیرهن» می‌نویسد ولی کالا «پیراهن» است. یا
     «مصحول» به جای «محصول». بدون این، هیچ نتیجه‌ای نمی‌گیرد.

     نسخه‌ی بهینه: فقط دو ردیف نگه می‌دارد، نه کل ماتریس.
     ============================================================ */
  function editDistance(a, b, max) {
    if (a === b) return 0;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    if (!la) return lb;
    if (!lb) return la;

    var prev = new Array(lb + 1);
    var cur = new Array(lb + 1);
    for (var j = 0; j <= lb; j++) prev[j] = j;

    for (var i = 1; i <= la; i++) {
      cur[0] = i;
      var best = cur[0];
      var ca = a.charCodeAt(i - 1);

      for (var k = 1; k <= lb; k++) {
        var cost = ca === b.charCodeAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(cur[k - 1] + 1, prev[k] + 1, prev[k - 1] + cost);
        if (cur[k] < best) best = cur[k];
      }
      if (best > max) return max + 1;      /* زودتر قطع کن */

      var t = prev; prev = cur; cur = t;
    }
    return prev[lb];
  }

  /** آیا این دو واژه با تحمل غلط، یکی‌اند؟ */
  function fuzzyEq(a, b) {
    if (a === b) return true;
    var len = Math.min(a.length, b.length);
    if (len < 3) return false;
    var tol = len <= 4 ? 1 : len <= 7 ? 1 : 2;
    return editDistance(a, b, tol) <= tol;
  }

  /* ============================================================
     خواندن داده
     ============================================================ */
  function read(k) {
    try {
      var v = JSON.parse(localStorage.getItem(k));
      return Array.isArray(v) ? v.filter(function (x) { return x && typeof x === 'object'; }) : [];
    } catch (e) { return []; }
  }

  function activeProducts() {
    var prods = [];
    try {
      prods = window.DPSafe ? DPSafe.products() : read('dp_products');
    } catch (e) { prods = read('dp_products'); }

    var users = read('dp_users');
    var ok = {}, byId = {};
    users.forEach(function (u) {
      var st = u.status || (u.isVerified ? 'approved' : 'pending');
      byId[u.id] = u;
      if (st === 'approved' || st === 'pending') ok[u.id] = 1;
    });

    return prods
      .filter(function (p) { return p && p.status === 'active' && ok[p.sellerId]; })
      .map(function (p) {
        var u = byId[p.sellerId] || {};
        return Object.assign({}, p, {
          shop: u.storeName || '',
          shopCity: u.city || '',
        });
      });
  }

  /* ============================================================
     ساخت فرهنگ عبارت‌ها
     ------------------------------------------------------------
     یک بار ساخته و تا تغییر داده نگه داشته می‌شود.

     هر عبارت این‌ها را دارد:
       text   متن نمایشی
       n      چند کالا با آن پیدا می‌شود
       kind   نوع (دسته، رنگ، فروشگاه، ترند…)
       w      وزن رتبه‌بندی
     ============================================================ */
  var CACHE = null;
  var CACHE_SIG = '';

  function signature() {
    try {
      return (localStorage.getItem('dp_products') || '').length + ':'
           + (localStorage.getItem('dp_users') || '').length;
    } catch (e) { return String(Date.now()); }
  }

  function vocabulary() {
    var sig = signature();
    if (CACHE && CACHE_SIG === sig) return CACHE;

    var prods = activeProducts();
    var map = {};      /* متن نرمال‌شده → رکورد */

    function add(text, kind, weight, meta) {
      var t = String(text || '').trim();
      if (t.length < 2) return;
      var k = norm(t);
      if (!k || k.length < 2) return;

      if (!map[k]) {
        map[k] = { text: t, key: k, n: 0, kind: kind, w: 0, meta: meta || null };
      }
      map[k].n++;
      map[k].w += weight;

      /* نوع قوی‌تر جایگزین ضعیف‌تر شود */
      var rank = { store: 5, trend: 4, cat: 3, combo: 2, name: 1 };
      if ((rank[kind] || 0) > (rank[map[k].kind] || 0)) {
        map[k].kind = kind;
        if (meta) map[k].meta = meta;
      }
    }

    /* ---------- ۱. دسته‌بندی‌ها ---------- */
    var catCount = {};
    prods.forEach(function (p) {
      if (p.category) catCount[p.category] = (catCount[p.category] || 0) + 1;
    });
    Object.keys(catCount).forEach(function (c) {
      add(c, 'cat', 12 + catCount[c] * 2);
    });

    /* ---------- ۲. بخش‌ها (زنانه، مردانه…) ---------- */
    var SEC = {
      women: 'زنانه', men: 'مردانه', kids: 'بچگانه',
      teen: 'نوجوان', girls: 'دخترانه', boys: 'پسرانه',
    };

    /* ---------- ۳. ترکیب‌های واقعی ----------
       فقط ترکیبی ساخته می‌شود که **کالای واقعی** دارد. */
    var combo = {};

    prods.forEach(function (p) {
      var cat = p.category;
      if (!cat) return;

      /* دسته + بخش  →  «پیراهن مردانه» */
      var sec = SEC[p.section] || SEC[p.sec] || '';
      if (sec) {
        var t1 = cat + ' ' + sec;
        combo[t1] = (combo[t1] || 0) + 1;
      }

      /* دسته + رنگ  →  «پیراهن سرمه‌ای» */
      if (window.DPPalette) {
        try {
          var cs = DPPalette.colorsOf(p);
          if (cs.length) {
            var H = DPPalette.HUE[cs[0]];
            if (H && H.name) {
              var t2 = cat + ' ' + H.name;
              combo[t2] = (combo[t2] || 0) + 1;
            }
          }
        } catch (e) { /* بی‌اهمیت */ }
      }

      /* دسته + جنس  →  «پیراهن نخی» */
      if (window.DPFashion && p.fabric) {
        try {
          var f = DPFashion.fabricInfo(p.fabric);
          if (f) {
            var t3 = cat + ' ' + f.name;
            combo[t3] = (combo[t3] || 0) + 1;
          }
        } catch (e) { /* بی‌اهمیت */ }
      }

      /* دسته + طرح  →  «پیراهن راه‌راه» */
      if (window.DPPalette && p.pattern) {
        try {
          var pt = DPPalette.patternOf(p.pattern);
          if (pt && pt.busy > 0 && pt.name !== 'ساده') {
            var t4 = cat + ' ' + pt.name;
            combo[t4] = (combo[t4] || 0) + 1;
          }
        } catch (e) { /* بی‌اهمیت */ }
      }
    });

    Object.keys(combo).forEach(function (t) {
      /* ترکیبی که فقط یک کالا دارد، ارزش پیشنهاد ندارد */
      if (combo[t] < 1) return;
      add(t, 'combo', 6 + combo[t] * 3);
    });

    /* ---------- ۴. نام کالاها ---------- */
    prods.forEach(function (p) {
      if (p.name) add(p.name, 'name', 2 + (Number(p.sales) || 0) * 0.5);
    });

    /* ---------- ۵. فروشگاه‌ها ---------- */
    var users = read('dp_users');
    users.forEach(function (u) {
      var st = u.status || (u.isVerified ? 'approved' : 'pending');
      if ((st === 'approved' || st === 'pending') && u.storeName) {
        add(u.storeName, 'store', 10, { storeId: u.id, city: u.city || '' });
      }
    });

    /* ---------- ۶. جست‌وجوهای محبوب واقعی ----------
       این بخش «یاد گرفته» است، نه ساخته‌ی من. */
    if (window.DPBrain) {
      try {
        DPBrain.popularTerms('', 40).forEach(function (t) {
          if (t.n >= 2) add(t.term, 'trend', 8 + t.n * 4);
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.sort(function (a, b) { return b.w - a.w; });

    CACHE = { list: list, prods: prods, at: Date.now() };
    CACHE_SIG = sig;
    return CACHE;
  }

  /* ============================================================
     پیشنهاد عبارت — تابع اصلی
     ============================================================ */
  function suggest(q, limit) {
    var V = vocabulary();
    var n = norm(q);
    var max = limit || 8;

    /* ---------- ورودی خالی: محبوب‌ترین‌ها ---------- */
    if (!n) {
      return V.list
        .filter(function (x) { return x.kind === 'trend' || x.kind === 'cat'; })
        .slice(0, max)
        .map(function (x) { return decorate(x, ''); });
    }

    var words = n.split(' ').filter(Boolean);
    var scored = [];

    for (var i = 0; i < V.list.length; i++) {
      var it = V.list[i];
      var k = it.key;
      var sc = 0;

      /* دقیقاً همان */
      if (k === n) sc = 1000;
      /* از ابتدا می‌خواند — بهترین حالت تکمیل */
      else if (k.indexOf(n) === 0) sc = 700 - k.length;
      /* یک واژه‌اش از ابتدا می‌خواند */
      else if ((' ' + k).indexOf(' ' + n) > -1) sc = 520 - k.length;
      /* جایی داخلش هست */
      else if (k.indexOf(n) > -1) sc = 360 - k.length;
      else {
        /* همه‌ی واژه‌های ورودی جایی هست؟ (ترتیب مهم نیست) */
        var all = true;
        for (var w = 0; w < words.length; w++) {
          if (k.indexOf(words[w]) < 0) { all = false; break; }
        }
        if (all && words.length > 1) sc = 300 - k.length;
        else {
          /* آخرین راه: غلط تایپی */
          var kw = k.split(' ');
          var hit = 0;
          for (var a = 0; a < words.length; a++) {
            for (var b = 0; b < kw.length; b++) {
              if (fuzzyEq(words[a], kw[b])) { hit++; break; }
            }
          }
          if (hit === words.length) sc = 180 - k.length;
          else if (hit > 0 && words.length > 1) sc = 90;
        }
      }

      if (sc <= 0) continue;

      /* وزن ذاتی عبارت (چند کالا دارد، چقدر محبوب است) */
      sc += Math.min(120, it.w);

      /* ترند و دسته را کمی بالاتر بیاور */
      if (it.kind === 'trend') sc += 40;
      else if (it.kind === 'cat') sc += 25;
      else if (it.kind === 'combo') sc += 15;

      scored.push({ it: it, sc: sc });
    }

    scored.sort(function (a, b) { return b.sc - a.sc; });

    /* ---------- حذف عبارت‌های زیادی شبیه ----------
       اگر «پیراهن مردانه» آمده، «پیراهن مردانه نخی» هم
       بیاید مفید است؛ ولی دو نام کالای تقریباً یکسان، نه. */
    var out = [];
    var seen = [];
    for (var s = 0; s < scored.length && out.length < max; s++) {
      var cand = scored[s].it;
      var dup = false;
      for (var d = 0; d < seen.length; d++) {
        if (cand.kind === 'name' && seen[d].kind === 'name'
          && fuzzyEq(cand.key, seen[d].key)) { dup = true; break; }
      }
      if (dup) continue;
      seen.push(cand);
      out.push(decorate(cand, n));
    }

    return out;
  }

  /** شمارش واقعی نتیجه‌ها + برجسته کردن بخش تایپ‌شده */
  function decorate(it, q) {
    var count = countFor(it);
    return {
      text: it.text,
      key: it.key,
      kind: it.kind,
      count: count,
      meta: it.meta,
      /* بخش تایپ‌شده برای پررنگ کردن در نمایش */
      match: q || '',
    };
  }

  /* ============================================================
     شمارش نتیجه — تضمین «عبارت خالی پیشنهاد نشود»
     ============================================================ */
  var COUNT_CACHE = {};

  function countFor(it) {
    if (COUNT_CACHE[it.key] !== undefined) return COUNT_CACHE[it.key];
    var r = search(it.text).length;
    COUNT_CACHE[it.key] = r;
    return r;
  }

  /* ============================================================
     جست‌وجوی واقعی — برای صفحه‌ی نتایج
     ------------------------------------------------------------
     خروجی: آرایه‌ی کالاها، مرتب بر پایه‌ی میزان تطابق.
     ============================================================ */
  function search(q, opt) {
    opt = opt || {};
    var V = vocabulary();
    var n = norm(q);
    if (!n) return [];

    var words = n.split(' ').filter(function (w) { return w.length >= 2; });
    if (!words.length) words = [n];

    var out = [];

    V.prods.forEach(function (p) {
      /* متن قابل جست‌وجوی کالا */
      var bag = fieldsOf(p);
      var sc = 0;
      var hits = 0;

      /* عبارت کامل */
      if (bag.all.indexOf(n) > -1) {
        sc += 200;
        if (bag.name.indexOf(n) === 0) sc += 120;
        else if (bag.name.indexOf(n) > -1) sc += 60;
        if (bag.cat === n) sc += 100;
        hits = words.length;
      } else {
        /* واژه‌به‌واژه */
        words.forEach(function (w) {
          if (bag.all.indexOf(w) > -1) {
            hits++;
            sc += 40;
            if (bag.name.indexOf(w) > -1) sc += 25;
            if (bag.cat.indexOf(w) > -1) sc += 30;
            if (bag.color.indexOf(w) > -1) sc += 20;
          } else {
            /* غلط تایپی */
            var parts = bag.all.split(' ');
            for (var i = 0; i < parts.length; i++) {
              if (fuzzyEq(w, parts[i])) { hits++; sc += 18; break; }
            }
          }
        });
      }

      /* همه‌ی واژه‌ها باید پیدا شوند، وگرنه نتیجه بی‌ربط است */
      if (!hits || hits < Math.ceil(words.length * 0.7)) return;

      /* ---------- تقویت‌ها ---------- */
      if (Number(p.stock) > 0) sc += 15;
      sc += Math.min(30, (Number(p.sales) || 0) * 2);

      /* کالای تخفیف‌دار جذاب‌تر است */
      try {
        if (window.DPPromo && DPPromo.sales.priceOf(p).percent > 0) sc += 10;
      } catch (e) { /* بی‌اهمیت */ }

      /* ---------- سلیقه‌ی شخصی از مغز ----------
         اگر مشتری قبلاً سرمه‌ای خریده، سرمه‌ای‌ها بالاتر. */
      if (window.DPBrain) {
        try {
          var T = DPBrain.taste();
          if (T && window.DPPalette) {
            var cs = DPPalette.colorsOf(p);
            if (cs.some(function (c) { return T.colors.indexOf(c) > -1; })) {
              sc += 22 * T.strength;
            }
            if (T.categories.indexOf(p.category) > -1) sc += 18 * T.strength;
          }
        } catch (e) { /* بی‌اهمیت */ }
      }

      out.push({ p: p, score: sc });
    });

    /* ---------- کالاهایی که مردم پس از این جست‌وجو انتخاب کردند ---------- */
    if (window.DPBrain) {
      try {
        var win = DPBrain.termWinners(n, V.prods, 5);
        var boost = {};
        win.forEach(function (x, i) { boost[String(x.p.id)] = (5 - i) * 25; });
        out.forEach(function (r) {
          var b = boost[String(r.p.id)];
          if (b) r.score += b;
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    out.sort(function (a, b) { return b.score - a.score; });

    var list = out.map(function (r) { return r.p; });
    return opt.limit ? list.slice(0, opt.limit) : list;
  }

  /** متن‌های قابل جست‌وجوی یک کالا */
  var FIELD_CACHE = {};

  function fieldsOf(p) {
    var id = String(p.id);
    var c = FIELD_CACHE[id];
    if (c && c.sig === (p.name || '') + (p.category || '')) return c;

    var name = norm(p.name);
    var cat = norm(p.category);

    /* رنگ‌ها با نام فارسی */
    var colorTxt = '';
    if (window.DPPalette) {
      try {
        var keys = DPPalette.colorsOf(p);
        var words = [];

        keys.forEach(function (k) {
          var H = DPPalette.HUE[k];
          if (H && H.name) words.push(H.name);

          /* ⚠️ نام‌های عامیانه هم باید در نمایه بیایند.
             فروشنده «نسکافه‌ای» نوشته، دانشنامه آن را به
             «کاراملی» تبدیل می‌کند. اگر فقط نام رسمی را
             نمایه کنیم، مشتری که «نسکافه‌ای» می‌جوید هیچ
             نتیجه‌ای نمی‌گیرد — همان چیزی که نوشته شده! */
          var A = DPPalette.ALIAS || {};
          Object.keys(A).forEach(function (alias) {
            if (A[alias] === k) words.push(alias);
          });
        });

        colorTxt = words.join(' ');
      } catch (e) { colorTxt = ''; }
    }

    /* آنچه فروشنده عیناً نوشته هم نگه داشته شود */
    if (Array.isArray(p.colors) && p.colors.length) {
      colorTxt += ' ' + p.colors.join(' ');
    }
    if (p.color) colorTxt += ' ' + p.color;

    /* جنس و طرح با نام فارسی */
    var extra = [];
    if (window.DPFashion && p.fabric) {
      try {
        var f = DPFashion.fabricInfo(p.fabric);
        if (f) extra.push(f.name);
      } catch (e) { /* بی‌اهمیت */ }
    }
    if (window.DPPalette && p.pattern) {
      try {
        var pt = DPPalette.patternOf(p.pattern);
        if (pt) extra.push(pt.name);
      } catch (e) { /* بی‌اهمیت */ }
    }

    var SEC = { women:'زنانه', men:'مردانه', kids:'بچگانه', teen:'نوجوان',
                girls:'دخترانه', boys:'پسرانه' };
    if (SEC[p.section]) extra.push(SEC[p.section]);
    if (SEC[p.sec]) extra.push(SEC[p.sec]);

    var color = norm(colorTxt);
    var all = norm([p.name, p.category, p.brand, p.description,
                    p.shop, colorTxt, extra.join(' '),
                    (p.sizes || []).join(' ')].join(' '));

    var rec = {
      sig: (p.name || '') + (p.category || ''),
      name: name, cat: cat, color: color, all: all,
    };
    FIELD_CACHE[id] = rec;
    return rec;
  }

  /* ============================================================
     پاک کردن حافظه‌ی موقت — وقتی کالایی اضافه شد
     ============================================================ */
  function invalidate() {
    CACHE = null;
    CACHE_SIG = '';
    COUNT_CACHE = {};
    FIELD_CACHE = {};
  }

  document.addEventListener('dp:products', invalidate);
  document.addEventListener('dp:colors', invalidate);

  window.DPSuggest = {
    norm: norm,
    suggest: suggest,
    search: search,
    vocabulary: vocabulary,
    invalidate: invalidate,
    fuzzyEq: fuzzyEq,
    editDistance: editDistance,
  };
})();
