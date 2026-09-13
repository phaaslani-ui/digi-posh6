/* ============================================================
   دیجی‌پوش — پاک‌سازی داده در نقطه‌ی ورود
   ------------------------------------------------------------
   چرا این فایل لازم شد؟

   در بازرسی، داده‌ی خراب به حافظه‌ی مرورگر ریخته شد — همان
   چیزی که با یک افزونه‌ی مرورگر، یک اسکریپت قدیمی، یا یک
   نسخه‌ی نیمه‌کاره‌ی سایت واقعاً ممکن است رخ دهد:

       { sizes: 'notarray', colors: null, price: -500000 }

   نتیجه: صفحه‌ی فروشگاه با خطای
   «(p.sizes || []).slice(...).map is not a function»
   کاملاً سفید می‌شد.

   ریشه‌ی مشکل الگوی `p.sizes || []` بود که در ۲۲ نقطه تکرار
   شده. آن الگو فقط جلوی `undefined` را می‌گیرد، نه جلوی رشته
   یا عدد. به‌جای وصله زدن به ۲۲ نقطه، داده یک بار در نقطه‌ی
   ورود تمیز می‌شود.

   قاعده: هیچ صفحه‌ای نباید به شکل داده‌ی حافظه اعتماد کند.
   ============================================================ */
'use strict';

(function () {

  /** هر چیزی → آرایه‌ی رشته‌های تمیز */
  function strList(v, max) {
    max = max || 40;
    if (typeof v === 'string') {
      /* «S,M,L» یا «S، M، L» هم پذیرفته می‌شود */
      v = v.split(/[,،|]/);
    }
    if (!Array.isArray(v)) return [];
    var out = [];
    for (var i = 0; i < v.length && out.length < max; i++) {
      var s = v[i];
      if (s == null) continue;
      if (typeof s === 'object') continue;      /* شیء داخل آرایه‌ی سایز بی‌معناست */
      s = String(s).trim();
      if (s && out.indexOf(s) < 0) out.push(s);
    }
    return out;
  }

  /** عدد امن — منفی، NaN و بی‌نهایت به کف می‌افتند */
  function num(v, min, max, dflt) {
    min = min == null ? 0 : min;
    max = max == null ? 1e12 : max;
    var n = Number(
      String(v == null ? '' : v)
        .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
        .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
        .replace(/[\u066C,\s]/g, '')
    );
    if (!isFinite(n)) return dflt == null ? min : dflt;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /** متن امن با سقف طول */
  function text(v, max) {
    if (v == null) return '';
    if (typeof v === 'object') return '';
    return String(v).slice(0, max || 300);
  }

  /**
   * نشانی تصویر امن.
   * `javascript:` و `data:text/html` می‌توانند کد اجرا کنند.
   * فقط http(s)، مسیر نسبی و data:image پذیرفته می‌شوند.
   */
  function imageSrc(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return '';
    if (/^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml);/i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\.{0,2}\//.test(s) && !/^\/\//.test(s)) return s;   /* مسیر نسبی */
    return '';                                                /* هر چیز دیگر رد */
  }

  function imageList(v, max) {
    return strList(v, max || 10).map(imageSrc).filter(Boolean);
  }

  /* ============================================================
     پاک‌سازی یک کالای خرده‌فروشی
     ============================================================ */
  function product(p) {
    if (!p || typeof p !== 'object') return null;
    var id = text(p.id, 64);
    if (!id) return null;

    var price = num(p.price, 0, 1e12, 0);
    var out = {
      id: id,
      sellerId: text(p.sellerId, 64),
      name: text(p.name, 200) || 'کالای بدون نام',
      autoName: text(p.autoName, 200),
      description: text(p.description, 1000),
      brand: text(p.brand, 100),
      category: text(p.category, 120),
      section: text(p.section, 20),
      group: text(p.group, 40),
      status: text(p.status, 20) || 'draft',
      price: price,
      stock: Math.floor(num(p.stock, 0, 1e7, 0)),
      sales: Math.floor(num(p.sales, 0, 1e9, 0)),
      sizes: strList(p.sizes, 20),
      colors: strList(p.colors, 20),
      images: imageList(p.images, 10),
      date: text(p.date, 40),
      createdAt: num(p.createdAt, 0, 1e15, 0),
    };

    /* ویژگی‌های تازه — هر کدام که بود */
    ['fabric', 'color', 'style', 'sleeve', 'collar',
     'length', 'fit', 'pattern', 'season'].forEach(function (k) {
      if (p[k]) out[k] = text(p[k], 40);
    });

    if (p.colorLabel) out.colorLabel = text(p.colorLabel, 40);
    if (p.wanted) out.wanted = text(p.wanted, 20);

    return out;
  }

  /* ============================================================
     پاک‌سازی یک فروشگاه
     ============================================================ */
  function seller(u) {
    if (!u || typeof u !== 'object') return null;
    var id = text(u.id, 64);
    if (!id) return null;

    return Object.assign({}, u, {
      id: id,
      storeName: text(u.storeName, 120),
      description: text(u.description, 600),
      city: text(u.city, 60),
      category: text(u.category, 30),
      status: text(u.status, 20),
      sellerType: text(u.sellerType, 20),
      logo: imageSrc(u.logo),
      cover: imageSrc(u.cover),
    });
  }

  /* ============================================================
     خواندن امن از حافظه
     ------------------------------------------------------------
     یک تابع، جای الگوی طولانی که ۳۰ بار در پروژه کپی شده بود.
     ============================================================ */
  function readList(key, clean) {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(key)); } catch (e) { return []; }
    if (!Array.isArray(raw)) return [];

    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      if (clean) {
        var c = clean(row);
        if (c) out.push(c);
      } else {
        out.push(row);
      }
    }
    return out;
  }

  /** کالاهای خرده‌فروشی، تمیزشده */
  function products() { return readList('dp_products', product); }

  /** فروشگاه‌ها، تمیزشده */
  function sellers() { return readList('dp_users', seller); }

  window.DPSafe = {
    strList: strList,
    num: num,
    text: text,
    imageSrc: imageSrc,
    imageList: imageList,
    product: product,
    seller: seller,
    readList: readList,
    products: products,
    sellers: sellers,
  };
})();
