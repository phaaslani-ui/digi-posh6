/* ============================================================
   دیجی‌پوش — نوار فیلتر مشتری (نسل دوم)
   ------------------------------------------------------------
   بازنویسی کامل. سه ایرادی که کاربر گفته بود:

     ۱. «به‌هم‌ریخته است»
        → چیدمان یک‌دست شد، همه‌ی گروه‌ها یک شکل، ترتیب
          منطقی: پرکاربردترین بالا.

     ۲. «چیزهای نامربوط دارد»
        → گروهی که کمتر از دو گزینه‌ی واقعی دارد اصلاً
          ساخته نمی‌شود. فیلتر با یک گزینه بی‌معناست چون
          همه‌ی کالاها همان را دارند.

     ۳. «چسبان نیست؛ باید تا وقتی کالا هست بچسبد و بعد رها شود»
        → چسبندگی هوشمند: نوار تا انتهای شبکه‌ی کالا همراه
          می‌آید و درست همان‌جا می‌ایستد.

   افزوده‌های تازه:
     · نوار «فیلترهای فعال» با امکان برداشتن تک‌تک
     · لغزنده‌ی دوسر برای قیمت
     · مرتب‌سازی (ارزان‌ترین، گران‌ترین، تازه‌ترین، محبوب‌ترین)
     · حافظه‌ی آخرین فیلتر
     · جست‌وجوی داخل گروه‌های شلوغ
     · پیشنهاد هوشمند وقتی نتیجه خالی است
     · شمارنده‌ی زنده روی دکمه‌ی «نمایش نتیجه» در موبایل
   ============================================================ */
'use strict';

(function () {

  var A = window.DPAttributes;
  if (!A) return;                       // بدون فهرست ویژگی، فیلتری نیست

  var FA = function (n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  };
  var money = function (n) {
    return FA(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ============================================================
     ترتیب گروه‌ها — پرکاربردترین اول
     ------------------------------------------------------------
     مشتری معمولاً اول رنگ و سایز را می‌خواهد، بعد جنس پارچه،
     بعد مدل. «فصل» و «طرح» ته فهرست‌اند چون کمتر جست‌وجو
     می‌شوند.
     ============================================================ */
  var ORDER = ['fabric', 'style', 'fit', 'sleeve', 'collar', 'length', 'pattern', 'season'];

  /** گروه‌هایی که باز می‌مانند — بقیه تاشو */
  var OPEN_BY_DEFAULT = ['fabric', 'style'];

  /** اگر گزینه‌های یک گروه از این بیشتر شد، کادر جست‌وجو می‌گیرد */
  var SEARCH_AFTER = 9;

  /** حداقل گزینه برای اینکه گروه اصلاً ساخته شود */
  var MIN_OPTIONS = 2;

  var MEM_KEY  = 'dp_last_filter';
  var SAVE_KEY = 'dp_saved_filters';   /* جست‌وجوهای ذخیره‌شده */
  var SEEN_KEY = 'dp_filter_seen';     /* شمارش استفاده — برای «پرکاربردترین» */

  var SORTS = [
    ['relevant', 'پیشنهاد ما'],
    ['cheap',    'ارزان‌ترین'],
    ['expensive','گران‌ترین'],
    ['new',      'تازه‌ترین'],
    ['popular',  'پرفروش‌ترین'],
    ['rating',   'بهترین امتیاز'],
  ];

  /* ============================================================
     ۱. حالت فیلتر
     ============================================================ */
  function emptyState() {
    var st = {
      sizes: [], minPrice: null, maxPrice: null, rating: 0,
      inStock: false, onSale: false, q: '', sort: 'relevant',
    };
    A.GROUPS.forEach(function (g) { st[g.key] = []; });
    return st;
  }

  /* ============================================================
     ۲. نشانی صفحه — تا مشتری بتواند نتیجه را بفرستد
     ============================================================ */
  var FLAT = ['sizes', 'minPrice', 'maxPrice', 'rating', 'inStock', 'onSale', 'q', 'sort'];

  function readUrl() {
    var st = emptyState();
    var p = new URLSearchParams(location.search);

    A.GROUPS.forEach(function (g) {
      var v = p.get(g.key);
      if (v) st[g.key] = v.split(',').filter(Boolean);
    });

    var sz = p.get('sizes');
    if (sz) st.sizes = sz.split(',').filter(Boolean);

    var mn = Number(p.get('minPrice'));
    var mx = Number(p.get('maxPrice'));
    if (Number.isFinite(mn) && mn > 0) st.minPrice = mn;
    if (Number.isFinite(mx) && mx > 0) st.maxPrice = mx;

    var r = Number(p.get('rating'));
    if (r >= 1 && r <= 5) st.rating = r;

    if (p.get('inStock') === '1') st.inStock = true;
    if (p.get('onSale') === '1') st.onSale = true;

    st.q = (p.get('q') || '').slice(0, 80);

    var s = p.get('sort');
    if (s && SORTS.some(function (x) { return x[0] === s; })) st.sort = s;

    return st;
  }

  function writeUrl(st) {
    var p = new URLSearchParams(location.search);

    A.GROUPS.forEach(function (g) { p.delete(g.key); });
    FLAT.forEach(function (k) { p.delete(k); });

    A.GROUPS.forEach(function (g) {
      if (st[g.key] && st[g.key].length) p.set(g.key, st[g.key].join(','));
    });
    if (st.sizes.length) p.set('sizes', st.sizes.join(','));
    if (st.minPrice) p.set('minPrice', st.minPrice);
    if (st.maxPrice) p.set('maxPrice', st.maxPrice);
    if (st.rating) p.set('rating', st.rating);
    if (st.inStock) p.set('inStock', '1');
    if (st.onSale) p.set('onSale', '1');
    if (st.q) p.set('q', st.q);
    if (st.sort && st.sort !== 'relevant') p.set('sort', st.sort);

    var qs = p.toString();
    try {
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } catch (e) { /* در بعضی محیط‌ها اجازه ندارد — بی‌اهمیت */ }
  }

  /* ---------- حافظه‌ی آخرین فیلتر ----------
     اگر مشتری صفحه را ببندد و برگردد، انتخاب‌هایش هدر نرود.
     فقط وقتی نشانی خالی است از حافظه می‌خوانیم، وگرنه
     لینکی که برایش فرستاده‌اند نادیده می‌ماند. */
  function remember(st) {
    try {
      localStorage.setItem(MEM_KEY, JSON.stringify({
        at: Date.now(), page: document.body.dataset.dpPage || '', st: st,
      }));
    } catch (e) { /* حافظه پر است — بی‌اهمیت */ }
  }

  function recall() {
    try {
      var raw = JSON.parse(localStorage.getItem(MEM_KEY));
      if (!raw || typeof raw !== 'object' || !raw.st) return null;
      /* یادآوری فقط تا یک ساعت معنا دارد */
      if (Date.now() - Number(raw.at) > 3600000) return null;
      if (raw.page !== (document.body.dataset.dpPage || '')) return null;

      var st = emptyState();
      Object.keys(st).forEach(function (k) {
        var v = raw.st[k];
        if (Array.isArray(st[k])) { if (Array.isArray(v)) st[k] = v.map(String); }
        else if (v != null) st[k] = v;
      });
      return st;
    } catch (e) { return null; }
  }

  /* ============================================================
     جست‌وجوهای ذخیره‌شده
     ------------------------------------------------------------
     مشتری ترکیبی از فیلترها را که دوست دارد ذخیره می‌کند و
     دفعه‌ی بعد با یک کلیک برمی‌گردد. مثل «مانتوی ابریشمی
     مشکی زیر ۵۰۰ هزار».
     ============================================================ */
  function savedList() {
    try {
      var v = JSON.parse(localStorage.getItem(SAVE_KEY));
      return Array.isArray(v) ? v.filter(function (x) { return x && x.st && x.name; }) : [];
    } catch (e) { return []; }
  }

  function saveCurrent(name, st) {
    var all = savedList();
    var page = document.body.dataset.dpPage || '';
    var clean = String(name).replace(/[<>&"']/g, '').trim().slice(0, 40);
    if (clean.length < 2) throw new Error('نام کوتاه است');

    /* هم‌نام قبلی جایگزین می‌شود، نه اینکه دو تا بماند */
    all = all.filter(function (x) { return !(x.page === page && x.name === clean); });
    all.unshift({ id: 'sf' + Date.now().toString(36), name: clean, page: page, st: st });

    try { localStorage.setItem(SAVE_KEY, JSON.stringify(all.slice(0, 12))); }
    catch (e) { /* حافظه پر است */ }
    return all;
  }

  function dropSaved(id) {
    try {
      localStorage.setItem(SAVE_KEY,
        JSON.stringify(savedList().filter(function (x) { return x.id !== id; })));
    } catch (e) { /* بی‌اهمیت */ }
  }

  /* ---------- شمارش استفاده ----------
     هر گزینه‌ای که مشتری‌ها بیشتر می‌زنند، نشان «پرطرفدار»
     می‌گیرد تا تازه‌واردها بدانند از کجا شروع کنند. */
  function bumpSeen(g, v) {
    try {
      var m = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      if (typeof m !== 'object' || Array.isArray(m)) m = {};
      var k = g + ':' + v;
      m[k] = (Number(m[k]) || 0) + 1;
      localStorage.setItem(SEEN_KEY, JSON.stringify(m));
    } catch (e) { /* بی‌اهمیت */ }
  }

  function seenMap() {
    try {
      var m = JSON.parse(localStorage.getItem(SEEN_KEY));
      return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {};
    } catch (e) { return {}; }
  }

  /* ============================================================
     ۳. آیا کالا با فیلتر جور است؟
     ============================================================ */
  function matches(p, st, skipKey) {
    var i;

    for (i = 0; i < A.GROUPS.length; i++) {
      var g = A.GROUPS[i];
      if (g.key === skipKey) continue;          // برای شمارش، خود گروه کنار می‌رود
      var want = st[g.key];
      if (!want || !want.length) continue;
      var have = p[g.key] || p[g.key + '_key'] || '';
      if (want.indexOf(have) < 0) return false;
    }

    if (skipKey !== 'size' && st.sizes.length) {
      var mine = safeArr(p.sizes);
      var hit = st.sizes.some(function (s) { return mine.indexOf(s) > -1; });
      if (!hit) return false;
    }

    if (skipKey !== 'price') {
      var price = priceOf(p);
      if (st.minPrice != null && price < st.minPrice) return false;
      if (st.maxPrice != null && price > st.maxPrice) return false;
    }

    if (skipKey !== 'rating' && st.rating) {
      if (rateOf(p) < st.rating) return false;
    }

    if (skipKey !== 'inStock' && st.inStock && Number(p.stock) <= 0) return false;
    if (skipKey !== 'onSale' && st.onSale && !isOnSale(p)) return false;

    if (st.q) {
      /* ارقام هم یکسان می‌شوند: مشتری «شماره ۷» می‌نویسد ولی
         نام کالا شاید «شماره 7» باشد — یا برعکس. بدون این،
         جست‌وجو بی‌دلیل خالی برمی‌گشت. */
      var hay = digits(A.normalizeFa(
        [p.name, p.autoName, p.category, p.brand, p.sellerName, p.description].join(' ')
      )).toLowerCase();
      /* هر واژه باید جایی پیدا شود — «مانتو مشکی» یعنی هر دو */
      var words = digits(A.normalizeFa(st.q)).toLowerCase().split(/\s+/).filter(Boolean);
      for (i = 0; i < words.length; i++) {
        if (hay.indexOf(words[i]) < 0) return false;
      }
    }

    return true;
  }

  /** ارقام فارسی و عربی را به انگلیسی برمی‌گرداند */
  function digits(v) {
    return String(v == null ? '' : v)
      .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }

  /**
   * فهرست را همیشه به آرایه‌ی رشته تبدیل می‌کند.
   * داده‌ی خراب (رشته به‌جای فهرست) پیش‌تر صفحه را سفید می‌کرد.
   */
  function safeArr(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return typeof x === 'string'; });
    return [];
  }

  /** قیمت مؤثر — با احتساب تخفیف فعال فروشنده */
  function priceOf(p) {
    if (window.DPPromo) {
      try {
        var n = Number(DPPromo.sales.priceOf(p).price);
        if (Number.isFinite(n) && n >= 0) return n;
      } catch (e) { /* بی‌اهمیت */ }
    }
    return Number(p.price) || 0;
  }

  function isOnSale(p) {
    if (!window.DPPromo) return false;
    try { return DPPromo.sales.priceOf(p).percent > 0; } catch (e) { return false; }
  }

  var _rates = null;
  function rateOf(p) {
    if (!_rates) {
      try { _rates = window.DPReviews ? (DPReviews.storeRatingsMap() || {}) : {}; }
      catch (e) { _rates = {}; }
    }
    var r = _rates[p.sellerId];
    return r ? Number(r.avg) || 0 : 0;
  }

  /* ============================================================
     ۴. مرتب‌سازی
     ============================================================ */
  function sortList(list, mode) {
    var out = list.slice();
    if (mode === 'cheap')      out.sort(function (a, b) { return priceOf(a) - priceOf(b); });
    else if (mode === 'expensive') out.sort(function (a, b) { return priceOf(b) - priceOf(a); });
    else if (mode === 'new')   out.sort(function (a, b) { return stamp(b) - stamp(a); });
    else if (mode === 'popular') out.sort(function (a, b) {
      return (Number(b.sales) || 0) - (Number(a.sales) || 0);
    });
    else if (mode === 'rating') out.sort(function (a, b) { return rateOf(b) - rateOf(a); });
    else {
      /* «پیشنهاد ما»: موجود بالاتر، بعد تخفیف‌دار، بعد پرفروش */
      out.sort(function (a, b) {
        var s = (Number(b.stock) > 0) - (Number(a.stock) > 0);
        if (s) return s;
        var d = isOnSale(b) - isOnSale(a);
        if (d) return d;
        return (Number(b.sales) || 0) - (Number(a.sales) || 0);
      });
    }
    return out;
  }

  function stamp(p) {
    var n = Number(p.createdAt || p.at || 0);
    if (Number.isFinite(n) && n > 0) return n;
    var d = Date.parse(p.date || '');
    return Number.isFinite(d) ? d : 0;
  }

  /* ============================================================
     ۵. برچسب خوانای هر فیلتر فعال — برای نوار بالای نتیجه
     ============================================================ */
  function labelOf(groupKey, value) {
    if (groupKey === 'size') {
      var s = (A.OPTIONS.size || []).find(function (o) { return o.name === value; });
      return s ? s.label : value;
    }
    if (A.LABELS && A.LABELS[groupKey] && A.LABELS[groupKey][value]) {
      return A.LABELS[groupKey][value];
    }
    if (groupKey === 'color' && window.DPColors && DPColors.customList) {
      var c = DPColors.customList().find(function (x) { return x.id === value; });
      if (c) return c.name;
    }
    var o = (A.OPTIONS[groupKey] || []).find(function (x) { return x.name === value; });
    return o ? o.label : value;
  }

  function activeChips(st) {
    var out = [];

    A.GROUPS.forEach(function (g) {
      (st[g.key] || []).forEach(function (v) {
        out.push({ g: g.key, v: v, text: g.label + ': ' + labelOf(g.key, v) });
      });
    });

    st.sizes.forEach(function (v) {
      out.push({ g: 'size', v: v, text: 'سایز ' + labelOf('size', v) });
    });

    if (st.minPrice != null || st.maxPrice != null) {
      var t = st.minPrice != null && st.maxPrice != null
        ? money(st.minPrice) + ' تا ' + money(st.maxPrice) + ' تومان'
        : st.minPrice != null
          ? 'بالای ' + money(st.minPrice) + ' تومان'
          : 'زیر ' + money(st.maxPrice) + ' تومان';
      out.push({ g: 'price', v: '', text: t });
    }

    if (st.rating) out.push({ g: 'rating', v: '', text: 'امتیاز ' + FA(st.rating) + ' و بالاتر' });
    if (st.inStock) out.push({ g: 'inStock', v: '', text: 'فقط موجود' });
    if (st.onSale) out.push({ g: 'onSale', v: '', text: 'فقط تخفیف‌دار' });
    if (st.q) out.push({ g: 'q', v: '', text: 'جست‌وجو: ' + st.q });

    return out;
  }

  function countActive(st) { return activeChips(st).length; }

  /* ============================================================
     ۶. ساخت نوار فیلتر
     ============================================================ */
  function build(host, all, onChange, opts) {
    opts = opts || {};

    var fromUrl = readUrl();
    var st = countActive(fromUrl) ? fromUrl : (recall() || fromUrl);
    _rates = null;

    /* جست‌وجوی داخلی هر گروه — بیرون از render نگه داشته
       می‌شود تا با بازکشیدن پاک نشود */
    var groupQ = {};

    /* بازه‌ی قیمت واقعی بازار */
    var prices = all.map(priceOf).filter(function (n) { return n > 0; });
    var lo = prices.length ? Math.min.apply(null, prices) : 0;
    var hi = prices.length ? Math.max.apply(null, prices) : 0;

    /* ---------- شمارش هر گزینه با فیلترهای دیگر ---------- */
    function countFor(groupKey, name) {
      var n = 0;
      for (var i = 0; i < all.length; i++) {
        var p = all[i];
        var have = groupKey === 'size'
          ? safeArr(p.sizes)
          : [p[groupKey] || p[groupKey + '_key'] || ''];
        if (have.indexOf(name) < 0) continue;
        if (matches(p, st, groupKey)) n++;
      }
      return n;
    }

    function countIf(patch) {
      var probe = Object.assign({}, st, patch);
      var n = 0;
      for (var i = 0; i < all.length; i++) if (matches(all[i], probe)) n++;
      return n;
    }

    /* ============================================================
       ساخت HTML
       ============================================================ */
    function render(resultCount) {
      var html = '';
      var active = countActive(st);

      /* ---------- سرصفحه ---------- */
      html += '<div class="dpf-head">'
        + '<h3>' + ICON.filter + ' فیلتر'
        + (active ? '<b class="dpf-badge">' + FA(active) + '</b>' : '')
        + '</h3>'
        + (active
            ? '<button class="dpf-clear" type="button" data-clear>'
              + ICON.x + ' پاک کردن همه</button>'
            : '')
        + '</div>';

      /* ---------- شمارنده‌ی نتیجه + آمار زنده ----------
         مشتری در یک نگاه می‌فهمد نتیجه‌اش چه شکلی است:
         چند کالا، از چند فروشگاه، چندتا تخفیف‌دار، و
         ارزان‌ترین قیمت چقدر است. همه با فیلترهای فعلی. */
      var live = [];
      for (var li = 0; li < all.length; li++) {
        if (matches(all[li], st)) live.push(all[li]);
      }
      var shopN = {};
      var saleN = 0, stockN = 0, cheapest = Infinity, dearest = 0;
      live.forEach(function (p) {
        shopN[p.sellerId] = 1;
        if (isOnSale(p)) saleN++;
        if (Number(p.stock) > 0) stockN++;
        var pr = priceOf(p);
        if (pr > 0 && pr < cheapest) cheapest = pr;
        if (pr > dearest) dearest = pr;
      });
      var shops = Object.keys(shopN).length;

      html += '<div class="dpf-result' + (resultCount === 0 ? ' zero' : '') + '">'
        + '<b>' + FA(resultCount) + '</b>'
        + '<span>' + (resultCount === 0 ? 'کالایی پیدا نشد' : 'کالا پیدا شد') + '</span>'
        + (resultCount ? '<i class="dpf-pulse" aria-hidden="true"></i>' : '')
        + '</div>';

      if (resultCount) {
        html += '<div class="dpf-stats">'
          + '<span title="تعداد فروشگاه‌هایی که این کالاها را دارند">'
          +   ICON.shop + FA(shops) + ' فروشگاه</span>'
          + (saleN ? '<span title="کالاهای تخفیف‌دار">'
              + ICON.tag + FA(saleN) + ' تخفیف‌دار</span>' : '')
          + (stockN < resultCount ? '<span title="کالاهای آماده‌ی ارسال">'
              + ICON.box + FA(stockN) + ' موجود</span>' : '')
          + (cheapest < Infinity
              ? '<span title="ارزان‌ترین و گران‌ترین کالای این نتیجه">'
                + ICON.coin + money(cheapest)
                + (dearest > cheapest ? ' تا ' + money(dearest) : '') + '</span>'
              : '')
          + '</div>';
      }

      /* ---------- فیلترهای فعال، هرکدام با ضربدر ---------- */
      var chips = activeChips(st);
      if (chips.length) {
        html += '<div class="dpf-active" aria-label="فیلترهای فعال">'
          + chips.map(function (c) {
              return '<button class="dpf-atag" type="button" data-off-g="' + esc(c.g) + '"'
                + ' data-off-v="' + esc(c.v) + '"'
                + ' aria-label="برداشتن ' + esc(c.text) + '">'
                + esc(c.text) + ICON.x + '</button>';
            }).join('')
          + '</div>';
      }

      /* ---------- جست‌وجوهای ذخیره‌شده ----------
         ترکیب فیلترهایی که مشتری دوست دارد، با یک کلیک
         برمی‌گردد. مثل «مانتوی ابریشمی مشکی زیر ۵۰۰ هزار». */
      var page = document.body.dataset.dpPage || '';
      var saved = savedList().filter(function (x) { return x.page === page; });

      if (saved.length || active) {
        html += '<div class="dpf-grp dpf-saved">'
          + '<h4>' + ICON.bookmark + ' جست‌وجوهای من'
          + (saved.length ? '<em class="dpf-cnt">' + FA(saved.length) + '</em>' : '')
          + '</h4>'
          + (saved.length
              ? '<div class="dpf-savedlist">'
                + saved.map(function (x) {
                    return '<span class="dpf-savedrow">'
                      + '<button class="dpf-savedgo" type="button" data-load="' + esc(x.id) + '">'
                      +   ICON.play + esc(x.name) + '</button>'
                      + '<button class="dpf-saveddel" type="button" data-drop="' + esc(x.id) + '"'
                      +   ' aria-label="حذف «' + esc(x.name) + '»">' + ICON.trash + '</button>'
                      + '</span>';
                  }).join('')
                + '</div>'
              : '')
          + (active
              ? '<div class="dpf-saverow">'
                + '<input type="text" data-savename maxlength="40"'
                +   ' placeholder="نامی برای این جست‌وجو…"'
                +   ' aria-label="نام جست‌وجوی ذخیره‌شده" />'
                + '<button class="dpf-savebtn" type="button" data-save>'
                +   ICON.bookmark + ' ذخیره</button>'
                + '</div>'
                + '<button class="dpf-share" type="button" data-share>'
                +   ICON.link + ' کپی نشانی این نتیجه</button>'
              : '')
          + '</div>';
      }

      /* ---------- جست‌وجو ---------- */
      html += '<div class="dpf-grp">'
        + '<label class="dpf-search">' + ICON.search
        + '<input type="search" data-q value="' + esc(st.q) + '" '
        + 'placeholder="نام کالا، برند یا فروشگاه…" aria-label="جست‌وجو در نتایج" />'
        + (st.q ? '<button class="dpf-xin" type="button" data-off-g="q" data-off-v=""'
            + ' aria-label="پاک کردن جست‌وجو">' + ICON.x + '</button>' : '')
        + '</label></div>';

      /* ---------- مرتب‌سازی ---------- */
      html += '<div class="dpf-grp"><h4>ترتیب نمایش</h4>'
        + '<div class="dpf-sorts">'
        + SORTS.map(function (s) {
            var on = st.sort === s[0];
            return '<button class="dpf-chip' + (on ? ' on' : '') + '" type="button"'
              + ' data-sort="' + s[0] + '" aria-pressed="' + on + '">'
              + esc(s[1]) + '</button>';
          }).join('')
        + '</div></div>';

      /* ---------- کلیدهای سریع ----------
         شمارنده‌ی زنده: مشتری پیش از کلیک می‌داند چند
         کالا باقی می‌ماند. اگر صفر باشد، کلید خاکستری است. */
      var nStock = countIf({ inStock: true });
      var nSale  = countIf({ onSale: true });

      html += '<div class="dpf-grp dpf-toggles">'
        + toggle('inStock', 'فقط کالاهای موجود', st.inStock, nStock)
        + toggle('onSale', 'فقط کالاهای تخفیف‌دار', st.onSale, nSale)
        + '</div>';

      /* ---------- رنگ ---------- */
      var colorList = (A.OPTIONS.color || []).slice();
      if (window.DPColors && DPColors.customList) {
        try {
          DPColors.customList().forEach(function (c) {
            /* رنگ ترکیبی فروشنده (طیف، راه‌راه، خال‌دار…) باید
               همان‌طور که هست دیده شود، نه یک لکه‌ی تخت.
               `background()` طرح کامل را می‌سازد. */
            colorList.push({
              name: c.id,
              label: c.name,
              swatch: DPColors.background(c),
              flat: c.hex,
            });
          });
        } catch (e) { /* بی‌اهمیت */ }
      }

      var colorOpts = colorList
        .map(function (o) { return { o: o, n: countFor('color', o.name) }; })
        .filter(function (x) { return x.n > 0 || st.color.indexOf(x.o.name) > -1; });

      if (colorOpts.length >= MIN_OPTIONS) {
        html += '<div class="dpf-grp"><h4>رنگ'
          + '<em class="dpf-cnt">' + FA(colorOpts.length) + '</em></h4>'
          + '<div class="dpf-swatches">'
          + colorOpts.map(function (x) {
              var on = st.color.indexOf(x.o.name) > -1;
              return '<button class="dpf-sw' + (on ? ' on' : '')
                + (isLight(x.o.flat || x.o.swatch) ? ' light' : '') + '" type="button" '
                + 'data-g="color" data-v="' + esc(x.o.name) + '" '
                + 'aria-pressed="' + on + '" '
                + 'title="' + esc(x.o.label) + ' — ' + FA(x.n) + ' کالا" '
                + 'aria-label="' + esc(x.o.label) + '، ' + FA(x.n) + ' کالا">'
                + '<i style="background:' + esc(x.o.swatch || '#ccc') + '"></i>'
                + '<u>' + FA(x.n) + '</u></button>';
            }).join('')
          + '</div></div>';
      }

      /* ---------- سایز ---------- */
      var sizeSeen = {};
      all.forEach(function (p) { safeArr(p.sizes).forEach(function (s) { sizeSeen[s] = 1; }); });
      var sizeOpts = (A.OPTIONS.size || [])
        .filter(function (o) { return sizeSeen[o.name]; })
        .map(function (o) { return { o: o, n: countFor('size', o.name) }; })
        .filter(function (x) { return x.n > 0 || st.sizes.indexOf(x.o.name) > -1; });

      if (sizeOpts.length >= MIN_OPTIONS) {
        html += '<div class="dpf-grp"><h4>سایز'
          + '<em class="dpf-cnt">' + FA(sizeOpts.length) + '</em></h4>'
          + '<div class="dpf-chips dpf-sizes">'
          + sizeOpts.map(function (x) {
              var on = st.sizes.indexOf(x.o.name) > -1;
              return '<button class="dpf-chip' + (on ? ' on' : '')
                + (x.n === 0 ? ' none' : '') + '" type="button" '
                + 'data-g="size" data-v="' + esc(x.o.name) + '" aria-pressed="' + on + '">'
                + esc(x.o.label) + '<em>' + FA(x.n) + '</em></button>';
            }).join('')
          + '</div></div>';
      }

      /* ---------- قیمت با لغزنده‌ی دوسر ---------- */
      if (hi > lo) {
        var vMin = st.minPrice != null ? st.minPrice : lo;
        var vMax = st.maxPrice != null ? st.maxPrice : hi;
        var span = hi - lo || 1;
        var pL = Math.max(0, Math.min(100, (vMin - lo) / span * 100));
        var pR = Math.max(0, Math.min(100, (vMax - lo) / span * 100));

        html += '<div class="dpf-grp"><h4>محدوده‌ی قیمت</h4>'
          + '<div class="dpf-slider">'
          +   '<span class="dpf-rail"></span>'
          +   '<span class="dpf-fill" style="inset-inline-start:' + pL.toFixed(2) + '%;'
          +     'inset-inline-end:' + (100 - pR).toFixed(2) + '%"></span>'
          +   '<input type="range" data-range="min" min="' + lo + '" max="' + hi + '"'
          +     ' step="' + step(span) + '" value="' + vMin + '"'
          +     ' aria-label="کمترین قیمت" />'
          +   '<input type="range" data-range="max" min="' + lo + '" max="' + hi + '"'
          +     ' step="' + step(span) + '" value="' + vMax + '"'
          +     ' aria-label="بیشترین قیمت" />'
          + '</div>'
          + '<div class="dpf-price">'
          +   '<input type="text" inputmode="numeric" data-price="min" '
          +     'value="' + (st.minPrice ? money(st.minPrice) : '') + '" '
          +     'placeholder="' + money(lo) + '" aria-label="کمترین قیمت" />'
          +   '<span class="dpf-dash">تا</span>'
          +   '<input type="text" inputmode="numeric" data-price="max" '
          +     'value="' + (st.maxPrice ? money(st.maxPrice) : '') + '" '
          +     'placeholder="' + money(hi) + '" aria-label="بیشترین قیمت" />'
          + '</div>'
          + '<div class="dpf-quick">'
          +   quickPrice('زیر ' + money(round1(hi * 0.25)), null, round1(hi * 0.25), st)
          +   quickPrice('متوسط', round1(hi * 0.25), round1(hi * 0.6), st)
          +   quickPrice('بالای ' + money(round1(hi * 0.6)), round1(hi * 0.6), null, st)
          + '</div></div>';
      }

      /* ---------- بقیه‌ی ویژگی‌ها ---------- */
      var groups = A.GROUPS.slice().sort(function (a, b) {
        var ia = ORDER.indexOf(a.key), ib = ORDER.indexOf(b.key);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

      /* پرکاربردترین گزینه‌ها — بر پایه‌ی رفتار خود کاربر */
      var seen = seenMap();
      var hotLine = 0;
      var seenVals = Object.keys(seen).map(function (k) { return Number(seen[k]) || 0; });
      if (seenVals.length > 3) {
        seenVals.sort(function (a, b) { return b - a; });
        hotLine = Math.max(2, seenVals[Math.min(2, seenVals.length - 1)]);
      }
      var isHot = function (g, v) {
        return hotLine > 0 && (Number(seen[g + ':' + v]) || 0) >= hotLine;
      };

      groups.forEach(function (g) {
        if (g.key === 'color') return;                 // بالاتر ساخته شد

        var opts = (A.OPTIONS[g.key] || [])
          .map(function (o) { return { o: o, n: countFor(g.key, o.name) }; })
          .filter(function (x) { return x.n > 0 || st[g.key].indexOf(x.o.name) > -1; });

        /* گروهی با یک گزینه، فیلتر نیست — همه‌ی کالاها همان
           را دارند. این همان «چیزهای نامربوط» بود. */
        if (opts.length < MIN_OPTIONS) return;

        var picked = (st[g.key] || []).length;
        var open = OPEN_BY_DEFAULT.indexOf(g.key) > -1 || picked > 0;

        /* جست‌وجوی داخل گروه‌های شلوغ */
        var gq = (groupQ[g.key] || '').trim();
        var shown = opts;
        if (gq) {
          var nq = A.normalizeFa(gq).toLowerCase();
          shown = opts.filter(function (x) {
            return A.normalizeFa(x.o.label).toLowerCase().indexOf(nq) > -1;
          });
        }

        html += '<details class="dpf-grp dpf-fold"' + (open ? ' open' : '')
          + ' data-grpkey="' + esc(g.key) + '">'
          + '<summary><span>' + esc(g.label) + '</span>'
          + (picked
              ? '<b class="dpf-n">' + FA(picked) + '</b>'
              : '<em class="dpf-cnt">' + FA(opts.length) + '</em>')
          + ICON.caret + '</summary>'
          + '<div class="dpf-foldbody">'
          + (opts.length > SEARCH_AFTER
              ? '<label class="dpf-gsearch">' + ICON.search
                + '<input type="search" data-gq="' + esc(g.key) + '"'
                + ' value="' + esc(gq) + '"'
                + ' placeholder="جست‌وجو در ' + esc(g.label) + '…"'
                + ' aria-label="جست‌وجو در ' + esc(g.label) + '" /></label>'
              : '')
          + '<div class="dpf-chips">'
          + (shown.length
              ? shown.map(function (x) {
                  var on = st[g.key].indexOf(x.o.name) > -1;
                  var hot = !on && isHot(g.key, x.o.name);
                  return '<button class="dpf-chip' + (on ? ' on' : '')
                    + (hot ? ' hot' : '')
                    + (x.n === 0 ? ' none' : '') + '" type="button" '
                    + 'data-g="' + esc(g.key) + '" data-v="' + esc(x.o.name) + '" '
                    + (hot ? 'title="از پرکاربردترین انتخاب‌های شما" ' : '')
                    + 'aria-pressed="' + on + '">'
                    + esc(x.o.label) + '<em>' + FA(x.n) + '</em></button>';
                }).join('')
              : '<p class="dpf-nores">چیزی با این نام نیست.</p>')
          + '</div></div></details>';
      });

      /* ---------- امتیاز فروشنده ---------- */
      var rOpts = [5, 4, 3].map(function (r) {
        return { r: r, n: countIf({ rating: r }) };
      }).filter(function (x) { return x.n > 0 || st.rating === x.r; });

      if (rOpts.length) {
        html += '<div class="dpf-grp"><h4>امتیاز فروشنده</h4><div class="dpf-chips">'
          + rOpts.map(function (x) {
              var on = st.rating === x.r;
              return '<button class="dpf-chip dpf-star' + (on ? ' on' : '') + '" type="button" '
                + 'data-rating="' + x.r + '" aria-pressed="' + on + '">'
                + ICON.star + FA(x.r) + '+<em>' + FA(x.n) + '</em></button>';
            }).join('')
          + '</div></div>';
      }

      /* ---------- وقتی نتیجه خالی است: پیشنهاد هوشمند ----------
         به‌جای «چیزی پیدا نشد»، می‌گوییم کدام فیلتر را
         برداری چند کالا برمی‌گردد. */
      if (resultCount === 0 && chips.length) {
        var tips = chips.map(function (c) {
          var probe = removeFrom(clone(st), c.g, c.v);
          var n = 0;
          for (var i = 0; i < all.length; i++) if (matches(all[i], probe)) n++;
          return { c: c, n: n };
        }).filter(function (x) { return x.n > 0; })
          .sort(function (a, b) { return b.n - a.n; })
          .slice(0, 3);

        if (tips.length) {
          html += '<div class="dpf-tips"><h4>' + ICON.bulb + ' این‌ها را امتحان کنید</h4>'
            + tips.map(function (t) {
                return '<button class="dpf-tip" type="button"'
                  + ' data-off-g="' + esc(t.c.g) + '" data-off-v="' + esc(t.c.v) + '">'
                  + '<span>بدون «' + esc(t.c.text) + '»</span>'
                  + '<b>' + FA(t.n) + ' کالا</b></button>';
              }).join('')
            + '</div>';
        }
      }

      host.innerHTML = html;
      host.dataset.count = String(resultCount);
    }

    /* ============================================================
       اعمال
       ============================================================ */
    var lastFocus = null;

    function apply(keepFocus) {
      if (keepFocus) lastFocus = captureFocus();

      writeUrl(st);
      remember(st);

      var list = [];
      for (var i = 0; i < all.length; i++) {
        if (matches(all[i], st)) list.push(all[i]);
      }
      list = sortList(list, st.sort);

      render(list.length);
      restoreFocus(lastFocus);
      lastFocus = null;

      onChange(list, st);

      /* به بیرون خبر می‌دهیم تا دکمه‌ی موبایل و چسبندگی
         خودشان را به‌روز کنند */
      host.dispatchEvent(new CustomEvent('dpf:change', {
        bubbles: true,
        detail: { count: list.length, active: countActive(st) },
      }));
    }

    /** جای مکان‌نما را نگه می‌دارد تا تایپ قطع نشود */
    function captureFocus() {
      var el = document.activeElement;
      if (!el || !host.contains(el)) return null;
      var sel = null;
      if (el.hasAttribute('data-q')) sel = '[data-q]';
      else if (el.hasAttribute('data-price')) sel = '[data-price="' + el.dataset.price + '"]';
      else if (el.hasAttribute('data-gq')) sel = '[data-gq="' + el.dataset.gq + '"]';
      else if (el.hasAttribute('data-range')) sel = '[data-range="' + el.dataset.range + '"]';
      if (!sel) return null;
      var pos = null;
      try { pos = el.selectionStart; } catch (e) { /* range انتخاب ندارد */ }
      return { sel: sel, pos: pos };
    }

    function restoreFocus(f) {
      if (!f) return;
      var el = host.querySelector(f.sel);
      if (!el) return;
      el.focus();
      if (f.pos != null) {
        try { el.setSelectionRange(f.pos, f.pos); } catch (e) { /* بی‌اهمیت */ }
      }
    }

    /* ============================================================
       رویدادها
       ============================================================ */
    host.addEventListener('click', function (e) {

      if (e.target.closest('[data-clear]')) {
        st = emptyState();
        groupQ = {};
        apply();
        return;
      }

      /* برداشتن یک فیلتر از نوار بالا یا از پیشنهادها */
      var off = e.target.closest('[data-off-g]');
      if (off) {
        st = removeFrom(st, off.dataset.offG, off.dataset.offV);
        apply();
        return;
      }

      /* ---------- بارگذاری جست‌وجوی ذخیره‌شده ---------- */
      var ld = e.target.closest('[data-load]');
      if (ld) {
        var rec = savedList().find(function (x) { return x.id === ld.dataset.load; });
        if (rec) {
          var fresh = emptyState();
          Object.keys(fresh).forEach(function (k) {
            var v = rec.st[k];
            if (Array.isArray(fresh[k])) { if (Array.isArray(v)) fresh[k] = v.map(String); }
            else if (v != null) fresh[k] = v;
          });
          st = fresh;
          apply();
          toast('جست‌وجوی «' + rec.name + '» بازیابی شد');
        }
        return;
      }

      var dp = e.target.closest('[data-drop]');
      if (dp) { dropSaved(dp.dataset.drop); apply(); return; }

      /* ---------- ذخیره‌ی جست‌وجوی جاری ---------- */
      if (e.target.closest('[data-save]')) {
        var inp = host.querySelector('[data-savename]');
        var nm = inp ? inp.value.trim() : '';
        if (!nm) nm = autoName(st);
        try { saveCurrent(nm, st); toast('ذخیره شد: ' + nm); apply(); }
        catch (err) { toast('نامی بنویسید — دست‌کم دو حرف'); }
        return;
      }

      /* ---------- کپی نشانی نتیجه ---------- */
      if (e.target.closest('[data-share]')) {
        var url = location.href;
        var done = function () { toast('نشانی کپی شد — می‌توانید بفرستید'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url, done); });
        } else fallbackCopy(url, done);
        return;
      }

      var b = e.target.closest('[data-g]');
      if (b) {
        var g = b.dataset.g;
        var v = b.dataset.v;
        var arr = g === 'size' ? st.sizes : st[g];
        if (!Array.isArray(arr)) return;
        var i = arr.indexOf(v);
        if (i > -1) arr.splice(i, 1);
        else { arr.push(v); bumpSeen(g, v); }
        apply();
        return;
      }

      var s = e.target.closest('[data-sort]');
      if (s) { st.sort = s.dataset.sort; apply(); return; }

      var r = e.target.closest('[data-rating]');
      if (r) {
        var val = Number(r.dataset.rating);
        st.rating = st.rating === val ? 0 : val;
        apply();
        return;
      }

      var t = e.target.closest('[data-toggle]');
      if (t) { st[t.dataset.toggle] = !st[t.dataset.toggle]; apply(); return; }

      var qp = e.target.closest('[data-qmin],[data-qmax]');
      if (qp) {
        var mn = qp.dataset.qmin ? Number(qp.dataset.qmin) : null;
        var mx = qp.dataset.qmax ? Number(qp.dataset.qmax) : null;
        if (st.minPrice === mn && st.maxPrice === mx) { mn = null; mx = null; }
        st.minPrice = mn; st.maxPrice = mx;
        apply();
      }
    });

    /* ---------- لغزنده‌ی قیمت ----------
       بی‌درنگ روی نوار طلایی اثر می‌گذارد؛ فیلتر واقعی پس از
       رها کردن اجرا می‌شود تا صفحه هنگام کشیدن نلرزد. */
    host.addEventListener('input', function (e) {
      var rg = e.target.closest('[data-range]');
      if (!rg) return;

      var mn = host.querySelector('[data-range="min"]');
      var mx = host.querySelector('[data-range="max"]');
      if (!mn || !mx) return;

      var a = Number(mn.value), z = Number(mx.value);
      /* دو دسته از هم رد نشوند */
      if (a > z) {
        if (rg.dataset.range === 'min') { a = z; mn.value = z; }
        else { z = a; mx.value = a; }
      }

      var span = hi - lo || 1;
      var fill = host.querySelector('.dpf-fill');
      if (fill) {
        fill.style.insetInlineStart = ((a - lo) / span * 100).toFixed(2) + '%';
        fill.style.insetInlineEnd = (100 - (z - lo) / span * 100).toFixed(2) + '%';
      }

      var iMin = host.querySelector('[data-price="min"]');
      var iMax = host.querySelector('[data-price="max"]');
      if (iMin) iMin.value = a > lo ? money(a) : '';
      if (iMax) iMax.value = z < hi ? money(z) : '';
    });

    host.addEventListener('change', function (e) {
      var rg = e.target.closest('[data-range]');
      if (!rg) return;
      var mn = host.querySelector('[data-range="min"]');
      var mx = host.querySelector('[data-range="max"]');
      var a = Number(mn.value), z = Number(mx.value);
      st.minPrice = a > lo ? a : null;
      st.maxPrice = z < hi ? z : null;
      apply();
    });

    /* ---------- کادرهای متنی ---------- */
    var timer = null;
    host.addEventListener('input', function (e) {
      var pi = e.target.closest('[data-price]');
      var qi = e.target.closest('[data-q]');
      var gi = e.target.closest('[data-gq]');
      if (!pi && !qi && !gi) return;

      clearTimeout(timer);

      /* جست‌وجوی داخل گروه فوری است و نیازی به تأخیر ندارد */
      if (gi) {
        groupQ[gi.dataset.gq] = gi.value;
        timer = setTimeout(function () { apply(true); }, 220);
        return;
      }

      timer = setTimeout(function () {
        if (pi) {
          var raw = toEn(pi.value).replace(/\D/g, '');
          var n = raw ? Number(raw) : null;
          if (pi.dataset.price === 'min') st.minPrice = n; else st.maxPrice = n;
        } else {
          st.q = qi.value.slice(0, 80);
        }
        apply(true);
      }, 380);
    });

    apply();

    return {
      reset: function () { st = emptyState(); groupQ = {}; apply(); },
      state: function () { return clone(st); },
      count: function () { return Number(host.dataset.count) || 0; },
      active: function () { return countActive(st); },
    };
  }

  /* ============================================================
     ۷. چسبندگی هوشمند
     ------------------------------------------------------------
     خواسته‌ی صریح کاربر: «تا جایی که محصول هست چسبان باشد،
     وقتی محصولات تمام شد دیگر چسبان نباشد.»

     `position: sticky` تنها داخل والدِ خودش می‌چسبد. اگر
     والد بلندتر از شبکه‌ی کالا باشد (مثلاً دکمه‌ی «بیشتر» و
     فاصله‌ها هم داخلش باشند)، نوار از کالاها جلو می‌زند.

     راه‌حل: ارتفاع ستون فیلتر را به ارتفاع دقیق شبکه‌ی کالا
     گره می‌زنیم. وقتی شبکه تمام شد، نوار هم می‌ایستد.
     ============================================================ */
  function stick(box, grid) {
    if (!box || !grid) return function () {};

    var raf = 0;

    function measure() {
      raf = 0;

      /* روی موبایل نوار کشویی است، نه چسبان */
      if (window.innerWidth < 981) {
        box.classList.remove('dpf-no-stick');
        return;
      }

      /* ---------- آیا چسباندن به درد می‌خورد؟ ----------
         چسبندگی خودِ کار را CSS انجام می‌دهد؛ اینجا فقط
         یک تصمیم می‌گیریم: اگر شبکه‌ی کالا کوتاه‌تر از
         خود نوار است، چسباندن هیچ سودی ندارد.

         پیش از آنکه مرورگر چیدمان را بکشد همه‌ی ارتفاع‌ها
         صفرند؛ در آن حالت دست نمی‌زنیم تا چسبندگی برای
         همیشه خاموش نماند. */
      var track = grid.offsetHeight;
      var self = box.offsetHeight;
      if (!track || !self) return;

      box.classList.toggle('dpf-no-stick', track < self + 80);
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    }

    schedule();

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(schedule);
      ro.observe(grid);
      ro.observe(box);
    } else {
      setInterval(schedule, 900);
    }

    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(grid, { childList: true });
    }

    return schedule;
  }

  /* ============================================================
     ابزارهای کوچک
     ============================================================ */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function removeFrom(st, g, v) {
    if (g === 'price') { st.minPrice = null; st.maxPrice = null; return st; }
    if (g === 'rating') { st.rating = 0; return st; }
    if (g === 'inStock') { st.inStock = false; return st; }
    if (g === 'onSale') { st.onSale = false; return st; }
    if (g === 'q') { st.q = ''; return st; }

    var arr = g === 'size' ? st.sizes : st[g];
    if (Array.isArray(arr)) {
      var i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1);
    }
    return st;
  }

  function step(span) {
    var s = Math.pow(10, Math.max(3, String(Math.round(span)).length - 2));
    return Math.max(1000, s);
  }

  function toEn(s) {
    return String(s == null ? '' : s)
      .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/[\u066C,\u2009\u202F]/g, '');
  }

  function round1(n) {
    var p = Math.pow(10, Math.max(0, String(Math.round(n)).length - 2));
    return Math.max(p, Math.round(n / p) * p);
  }

  function quickPrice(label, mn, mx, st) {
    var on = st.minPrice === mn && st.maxPrice === mx;
    return '<button class="dpf-chip' + (on ? ' on' : '') + '" type="button"'
      + (mn ? ' data-qmin="' + mn + '"' : ' data-qmin=""')
      + (mx ? ' data-qmax="' + mx + '"' : ' data-qmax=""')
      + ' aria-pressed="' + on + '">' + label + '</button>';
  }

  function toggle(key, label, on, n) {
    return '<button class="dpf-toggle' + (on ? ' on' : '')
      + (n === 0 && !on ? ' none' : '') + '" type="button" '
      + 'data-toggle="' + key + '" role="switch" aria-checked="' + on + '">'
      + '<span class="dpf-knob"></span>'
      + '<span class="dpf-tl">' + esc(label) + '</span>'
      + '<em>' + FA(n) + '</em></button>';
  }

  function isLight(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) return false;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 175;
  }

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.7" '
         + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var ICON = {
    filter: '<svg viewBox="0 0 24 24" ' + SW + '><path d="M3.5 5.5h17M6.5 12h11M10 18.5h4"/></svg>',
    search: '<svg viewBox="0 0 24 24" ' + SW + '><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>',
    x:      '<svg viewBox="0 0 24 24" ' + SW + '><path d="M18 6 6 18M6 6l12 12"/></svg>',
    caret:  '<svg class="dpf-caret" viewBox="0 0 24 24" ' + SW + '><path d="m6 9.5 6 6 6-6"/></svg>',
    bulb:   '<svg viewBox="0 0 24 24" ' + SW + '><path d="M9.5 18h5M10 21h4"/>'
            + '<path d="M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z"/></svg>',
    star:   '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">'
            + '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/></svg>',
    shop:   '<svg viewBox="0 0 24 24" ' + SW + '><path d="M4.5 9.5 6 4.5h12l1.5 5"/>'
            + '<path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/>'
            + '<path d="M6 12v7.5h12V12"/></svg>',
    tag:    '<svg viewBox="0 0 24 24" ' + SW + '><path d="M20 12.5 12.5 20 4 11.5V4h7.5z"/>'
            + '<circle cx="8.5" cy="8.5" r="1.4"/></svg>',
    box:    '<svg viewBox="0 0 24 24" ' + SW + '><path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/>'
            + '<path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/></svg>',
    coin:   '<svg viewBox="0 0 24 24" ' + SW + '><circle cx="12" cy="12" r="8"/>'
            + '<path d="M14.5 9.5A2.6 2.6 0 0 0 12 8c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2'
            + '-1.1 2-2.5 2a2.6 2.6 0 0 1-2.5-1.5"/><path d="M12 6.5v11"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" ' + SW + '><path d="M6.5 4.5h11v16l-5.5-4-5.5 4z"/></svg>',
    link:   '<svg viewBox="0 0 24 24" ' + SW + '><path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8'
            + 'a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8'
            + 'a4 4 0 1 0 5.7 5.7l1.4-1.4"/></svg>',
    play:   '<svg viewBox="0 0 24 24" ' + SW + '><path d="M8 5.5 18 12 8 18.5z"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" ' + SW + '><path d="M4.5 7h15"/>'
            + '<path d="M9.5 7V4.8h5V7"/><path d="M6.5 7.5 7.5 20h9l1-12.5"/></svg>',
    fire:   '<svg viewBox="0 0 24 24" ' + SW + '><path d="M12 3s4.5 4 4.5 8a4.5 4.5 0 0 1-9 0'
            + 'c0-1.5.8-2.8.8-2.8S6 11 6 14a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>',
  };

  /* ============================================================
     پیام کوتاه — بدون وابستگی به هیچ کتابخانه‌ای
     ============================================================ */
  var toastEl = null, toastTimer = null;

  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dpf-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }

  /** کپی برای مرورگرهایی که clipboard ندارند (مثلاً http) */
  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      done();
    } catch (e) { toast('کپی نشد — نشانی را از نوار مرورگر بردارید'); }
  }

  /** اگر مشتری نامی ننوشت، خودمان از فیلترها یکی می‌سازیم */
  function autoName(st) {
    var parts = activeChips(st).slice(0, 3).map(function (c) {
      return c.text.replace(/^[^:]+:\s*/, '');
    });
    return parts.length ? parts.join(' + ').slice(0, 40) : 'جست‌وجوی من';
  }

  window.DPFilters = {
    build: build,
    stick: stick,
    matches: matches,
    sortList: sortList,
    readUrl: readUrl,
    emptyState: emptyState,
    SORTS: SORTS,
  };
})();
