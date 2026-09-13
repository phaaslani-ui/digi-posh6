/* ============================================================
   دیجی‌پوش — بازار عمده‌فروشان
   ------------------------------------------------------------
   جاوااسکریپت خالص، بدون هیچ کتابخانه‌ای.
   داده‌ها نمونه‌اند و برای اتصال به بک‌اند آماده.
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ابزارهای پایه
     ============================================================ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) {
    return String(n).replace(/\d/g, function (d) { return FA[+d]; });
  };
  var money = function (n) {
    return fa(Math.round(Number(n) || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var toEn = function (s) {
    /*
     * ارقام فارسی/عربی → انگلیسی، و حذف جداکننده‌ی هزارگان.
     * قیمت به شکل «۵۰۰٬۰۰۰» نمایش داده می‌شود، پس کاربر
     * همان را کپی می‌کند و در فرم می‌گذارد.
     */
    return String(s == null ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); })
      .replace(/[٬,\u066C\u2009\u202F]/g, '')
      .replace(/٫/g, '.')
      .trim();
  };

  /* ---------- آیکون‌های خطی ---------- */
  var SW = 'fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
    cart:   '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>' +
            '<path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
    user:   '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-4 3.4-6.4 7.5-6.4s7.5 2.4 7.5 6.4"/>',
    eye:    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/>' +
            '<circle cx="12" cy="12" r="3"/>',
    check:  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    bookmark: '<path d="M6.5 4.5h11v16l-5.5-3.6-5.5 3.6z"/>',
    lock:   '<rect x="4.5" y="10.5" width="15" height="9.5" rx="1.6"/>' +
            '<path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    truck:  '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h4l3 3.2v3.3h-7z"/>' +
            '<circle cx="6.5" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/>',
    phone:  '<path d="M6 3.5h3l1.6 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.6v3a1.6 1.6 0 0 1-1.8 1.6C10.4 18 6 13.6 4.4 5.3A1.6 1.6 0 0 1 6 3.5Z"/>',
    gem:    '<path d="m12 20.5-8-11L7 4h10l3 5.5z"/><path d="M4 9.5h16M9 4l-2 5.5 5 11 5-11L15 4"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/>' +
            '<path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
    x:      '<path d="M18 6 6 18M6 6l12 12"/>',
    doc:    '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/>' +
            '<path d="M14 3.5V8h4.5"/><path d="M9 13h6M9 16.5h6"/>',
    upload: '<path d="M12 15.5V4.5"/><path d="m8 8.5 4-4 4 4"/>' +
            '<path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    bolt:   '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/>',
    box:    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    quote:  '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    scale:  '<path d="M12 4v16M7 8H3l2-4 2 4H3M21 8h-4l2-4 2 4h-4"/><path d="M5 8v3a2 2 0 0 0 4 0V8M15 8v3a2 2 0 0 0 4 0V8"/>',
    tg:     '<path d="M21 4 3 11l5 2 2 6 3-4 5 4z"/><path d="m8 13 9-6-6 8"/>',
    ig:     '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="1"/>',
    wa:     '<path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.2-4.3A8.5 8.5 0 1 1 20.5 12Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>',
    star:   'm12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z',
    money:  '<rect x="3" y="6" width="18" height="12" rx="2"/>' +
            '<circle cx="12" cy="12" r="2.6"/>',
    clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
    store:  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/>' +
            '<path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/>' +
            '<path d="M6 12v7.5h12V12"/>',
  };
  var svg = function (d, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" ' + SW + '>' + d + '</svg>';
  };

  /* ============================================================
     دسته‌بندی‌ها
     ------------------------------------------------------------
     همان فهرستی که در پنل عمده‌فروش هنگام ثبت کالا دیده می‌شود.
     ============================================================ */
  var CATS = ['پوشاک زنانه', 'پوشاک مردانه', 'پوشاک بچگانه',
              'اکسسوری', 'پارچه', 'لوازم جانبی'];

  /* ============================================================
     کالاهای واقعی فروشندگان عمده
     ------------------------------------------------------------
     کالاهایی که عمده‌فروشان از پنل خودشان ثبت کرده‌اند، اینجا
     کنار داده‌ی نمونه نشان داده می‌شوند. فروشگاه تأییدنشده
     نمایش داده نمی‌شود.
     ============================================================ */
  function realProducts() {
    var users, prods;
    var RATE = {};
    try { if (window.DPReviews) RATE = DPReviews.storeRatingsMap() || {}; } catch (e) { RATE = {}; }
    try { users = JSON.parse(localStorage.getItem('dp_users')) || []; } catch (e) { return []; }
    try { prods = JSON.parse(localStorage.getItem('dpw_products')) || []; } catch (e) { return []; }
    if (!Array.isArray(users) || !Array.isArray(prods)) return [];

    var byId = {};
    users.forEach(function (u) {
      if (u && u.id && u.sellerType === 'wholesale' && (u.status || '') === 'approved') {
        byId[u.id] = u;
      }
    });

    return prods
      .filter(function (p) {
        return p && typeof p === 'object' &&
               p.status === 'active' && byId[p.sellerId];
      })
      .map(function (p) {
        var u = byId[p.sellerId];
        var tiers = (p.tiers && p.tiers.length ? p.tiers : null);
        var low = tiers
          ? Math.min.apply(null, tiers.map(function (t) { return Number(t.price) || p.price; }))
          : p.price;
        return {
          id: 'real:' + p.id,
          realId: p.id,
          isReal: true,
          code: String(p.code || ''),
          createdAt: Number(p.createdAt) || 0,
          name: p.name,
          brand: p.brand || u.storeName || '',
          category: p.category || p.item || '',
          section: p.section || '',
          group: p.group || '',
          /* مسیر کامل برای نمایش: «پوشاک مردانه › رسمی › پیراهن» */
          trail: (window.DPTaxonomy && p.section)
            ? DPTaxonomy.trail(p.section, p.group, p.item || p.category)
            : (p.category || ''),
          price: Number(p.price) || 0,
          oldPrice: null,
          moq: Number(p.moq) || 1,
          stock: Number(p.stock) || 0,
          sellerId: p.sellerId,
          seller: u.storeName || u.companyName || 'فروشگاه',
          verified: (u.status || '') === 'approved',
          rating: (RATE[p.sellerId] && RATE[p.sellerId].avg) || 0,
          rateCount: (RATE[p.sellerId] && RATE[p.sellerId].count) || 0,
          img: (p.images || [])[0] || '',
          tiers: tiers,
          lowest: low,
          description: p.description ||
            'این کالا برای فروش عمده عرضه می‌شود. برای تعداد بالاتر، استعلام قیمت بفرستید.',
          spec: {
            'جنس': p.material || '—',
            'رنگ‌بندی': p.colors || '—',
            'سایزبندی': p.sizes || '—',
            'بسته‌بندی': p.packing || '—',
            'زمان آماده‌سازی': p.leadTime ? fa(p.leadTime) + ' روز کاری' : '—',
          },
        };
      });
  }

  /** همه‌ی کالاهای بازار — فقط کالاهای واقعی تأمین‌کننده‌ها */
  function allProducts() {
    return realProducts();
  }

  /* پلکان قیمت: هرچه بیشتر، ارزان‌تر */
  function tiersOf(p) {
    /* اگر کالای واقعی پله‌های خودش را دارد، همان‌ها —
       ولی پله‌ی نامعتبر یا زیر حداقل سفارش کنار گذاشته می‌شود */
    if (p.tiers && p.tiers.length) {
      var minQ = Math.max(1, Number(p.moq) || 1);
      var clean = p.tiers.filter(function (t) {
        var f = Math.floor(Number(t && t.from));
        var pr = Number(t && t.price);
        return isFinite(f) && isFinite(pr) && f >= minQ && pr > 0;
      });
      if (clean.length) {
        return clean.slice().sort(function (a, b) { return a.from - b.from; })
          .map(function (t) {
            return { from: t.from, price: t.price, label: 'از ' + fa(t.from) + ' عدد' };
          });
      }
      /* اگر همه نامعتبر بودند، به پله‌های پیش‌فرض برمی‌گردیم */
    }
    return [
      { from: p.moq, price: p.price, label: 'از ' + fa(p.moq) + ' عدد' },
      { from: p.moq * 5, price: Math.round(p.price * 0.94), label: 'از ' + fa(p.moq * 5) + ' عدد' },
      { from: p.moq * 10, price: Math.round(p.price * 0.88), label: 'از ' + fa(p.moq * 10) + ' عدد' },
      { from: p.moq * 25, price: Math.round(p.price * 0.8), label: 'از ' + fa(p.moq * 25) + ' عدد' },
    ];
  }

  /* ============================================================
     جدول کامل پلکان قیمت
     ------------------------------------------------------------
     خریدار عمده باید در یک نگاه ببیند «اگر به‌جای ۱۰ عدد، ۱۰۰ عدد
     بگیرم چقدر برنده‌ام». پس علاوه بر قیمت واحد، درصد تخفیف و
     مبلغ صرفه‌جویی در هر عدد و در کل سفارش هم حساب می‌شود.
     ============================================================ */
  function tierTable(p, tiers) {
    var base = Number(tiers[0] && tiers[0].price) || Number(p.price) || 0;

    var rows = tiers.map(function (t, i) {
      var unit = Number(t.price) || base;
      var offPc = base > 0 ? Math.round((base - unit) / base * 100) : 0;
      var perUnit = Math.max(0, base - unit);
      /* صرفه‌جویی کل، اگر دقیقاً همان پله را سفارش دهد */
      var whole = perUnit * (Number(t.from) || 0);
      var best = i === tiers.length - 1 && tiers.length > 1;

      return '<tr' + (best ? ' class="best"' : '') + '>' +
        '<th scope="row">' + esc(t.label) + '</th>' +
        '<td><b>' + money(unit) + '</b></td>' +
        '<td>' + (offPc > 0
          ? '<span class="w-tier-off">٪' + fa(offPc) + '</span>'
          : '<span class="w-tier-zero">—</span>') + '</td>' +
        '<td>' + (whole > 0
          ? '<span class="w-tier-save">' + money(whole) + '</span>'
          : '<span class="w-tier-zero">—</span>') + '</td>' +
      '</tr>';
    }).join('');

    /* ارسال رایگان از پله‌ی دوم به بعد — همان قاعده‌ی بازار عمده */
    var freeFrom = tiers.length > 1 ? tiers[1].from : null;

    return '<div class="w-tiertbl-wrap">' +
      '<table class="w-tiertbl">' +
        '<caption class="w-sr">پلکان قیمت عمده بر پایه‌ی تعداد سفارش</caption>' +
        '<thead><tr>' +
          '<th scope="col">تعداد</th>' +
          '<th scope="col">قیمت هر عدد</th>' +
          '<th scope="col">تخفیف</th>' +
          '<th scope="col">صرفه‌جویی کل</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<ul class="w-tiernotes">' +
        '<li>' + svg(I.box, 'w-i-xs') + 'حداقل سفارش: <b>' + fa(p.moq) + '</b> عدد</li>' +
        (freeFrom
          ? '<li>' + svg(I.truck, 'w-i-xs') +
            'ارسال رایگان از <b>' + fa(freeFrom) + '</b> عدد به بالا</li>'
          : '') +
        '<li>' + svg(I.quote, 'w-i-xs') +
          'برای تعداد بیشتر از جدول، استعلام قیمت بفرستید.</li>' +
      '</ul>' +
    '</div>';
  }

  function stockInfo(n) {
    if (n <= 0) return { cls: 'out', fa: 'ناموجود' };
    if (n < 40) return { cls: 'low', fa: fa(n) + ' عدد — رو به اتمام' };
    return { cls: 'in', fa: fa(n) + ' عدد موجود' };
  }

  function stars(v) {
    if (!v) return '<span class="w-rate-n" style="opacity:.6">بدون امتیاز</span>';
    var out = '<span class="w-stars" role="img" aria-label="امتیاز ' + fa(v) + ' از ۵">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="w-star' + (v >= i - 0.4 ? ' on' : '') + '" viewBox="0 0 24 24" ' +
             'aria-hidden="true"><path d="' + I.star + '"/></svg>';
    }
    return out + '</span>';
  }

  /* ============================================================
     حالت برنامه
     ============================================================ */
  var state = {
    q: '',
    cat: '',
    brands: [],
    min: null,
    max: null,
    moq: '',
    stock: '',
    rating: '',
    seller: null,
    sort: 'pop',
    cart: [],
    compare: [],
    recent: [],
    saved: [],
  };

  var LS = {
    cart: 'dpw_cart',
    recent: 'dpw_recent',
    saved: 'dpw_saved_filters',
    theme: 'dpw_theme',
  };

  function load() {
    try {
      var c = JSON.parse(localStorage.getItem(LS.cart));
      if (Array.isArray(c)) state.cart = c.filter(function (x) { return x && typeof x === 'object'; });
      var r = JSON.parse(localStorage.getItem(LS.recent));
      if (Array.isArray(r)) state.recent = r.filter(function (x) { return x != null; }).map(String);
      var sv = JSON.parse(localStorage.getItem(LS.saved));
      if (Array.isArray(sv)) {
        state.saved = sv.filter(function (x) {
          return x && typeof x === 'object' && typeof x.name === 'string';
        }).slice(0, 8);
      }
    } catch (e) { /* حافظه در دسترس نیست */ }
  }

  function save() {
    try {
      localStorage.setItem(LS.cart, JSON.stringify(state.cart));
      localStorage.setItem(LS.recent, JSON.stringify(state.recent.slice(0, 12)));
      localStorage.setItem(LS.saved, JSON.stringify(state.saved.slice(0, 8)));
    } catch (e) { /* بی‌اهمیت */ }
  }

  /* ============================================================
     پیام‌ها
     ============================================================ */
  function toast(msg, kind) {
    var box = $('#wToasts');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'w-toast ' + (kind || '');
    el.setAttribute('role', 'status');
    el.innerHTML = svg(kind === 'err' ? I.x : I.check) + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  /* ============================================================
     فیلتر و مرتب‌سازی
     ============================================================ */
  function filtered() {
    var list = allProducts();

    if (state.q) {
      var q = state.q.trim().toLowerCase();
      list = list.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.seller + ' ' + p.category + ' ' + (p.trail || ''))
          .toLowerCase().indexOf(q) > -1;
      });
    }
    if (state.cat) {
      list = list.filter(function (p) {
        return p.section === state.cat || p.category === state.cat;
      });
    }
    if (state.brands.length) {
      list = list.filter(function (p) { return state.brands.indexOf(p.brand) > -1; });
    }
    if (state.min != null) list = list.filter(function (p) { return p.price >= state.min; });
    if (state.max != null) list = list.filter(function (p) { return p.price <= state.max; });
    if (state.moq) list = list.filter(function (p) { return p.moq <= Number(state.moq); });
    if (state.stock === 'in') list = list.filter(function (p) { return p.stock > 0; });
    if (state.stock === 'out') list = list.filter(function (p) { return p.stock <= 0; });
    if (state.rating) list = list.filter(function (p) { return p.rating >= Number(state.rating); });
    if (state.seller) {
      list = list.filter(function (p) { return String(p.sellerId) === String(state.seller); });
    }

    /* ---------- نردبان ----------
       کالاهای تأمین‌کننده‌ای که بسته‌ی نردبان دارد، بالاتر
       می‌آیند. این فقط در همین بازار اثر دارد. */
    var BW = {};
    if (window.DPWBoost) { try { BW = DPWBoost.weightMap(); } catch (e) { BW = {}; } }
    var boostOf = function (p) { return (p.isReal && BW[p.sellerId]) || 0; };

    var S = {
      pop:   function (a, b) { return (b.rating || 0) - (a.rating || 0) || (b.stock || 0) - (a.stock || 0); },
      cheap: function (a, b) { return a.price - b.price; },
      exp:   function (a, b) { return b.price - a.price; },
      newest:function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); },
      off:   function (a, b) { return offOf(b) - offOf(a); },
      moq:   function (a, b) { return a.moq - b.moq; },
    };
    /* وزن نردبان بر هر مرتب‌سازی مقدم است */
    var by = S[state.sort] || S.pop;
    return list.sort(function (a, b) {
      var d = boostOf(b) - boostOf(a);
      return d !== 0 ? d : by(a, b);
    });
  }

  function offOf(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round((p.oldPrice - p.price) / p.oldPrice * 100);
  }

  /**
   * بیشترین صرفه‌جویی پلکانی — «تا ٪X ارزان‌تر».
   * این عددی است که خریدار عمده واقعاً دنبالش می‌گردد:
   * چقدر با خرید بیشتر برنده می‌شود.
   */
  function saveOf(p) {
    var base = Number(p.price) || 0;
    if (!base) return 0;
    var t = tiersOf(p);
    var low = base;
    t.forEach(function (x) {
      var v = Number(x.price) || base;
      if (v < low) low = v;
    });
    if (low >= base) return 0;
    return Math.round((base - low) / base * 100);
  }

  /** زمان آماده‌سازی، اگر فروشنده نوشته باشد */
  function leadOf(p) {
    var v = (p.spec && p.spec['زمان آماده‌سازی']) || '';
    return v && v !== '—' ? v : '';
  }

  /* ============================================================
     کارت کالا
     ============================================================ */
  function card(p) {
    var st = stockInfo(p.stock);
    var off = offOf(p);
    var inCmp = state.compare.indexOf(String(p.id)) > -1;
    var save = saveOf(p);
    var lead = leadOf(p);

    /* نردبان — فقط برای تأمین‌کننده‌های واقعی این بازار */
    var badged = false;
    if (p.isReal && window.DPWBoost) {
      try { badged = DPWBoost.isBadged(p.sellerId); } catch (e) {}
    }

    return '' +
      '<article class="w-card' + (badged ? ' is-boost' : '') +
        '" data-id="' + esc(p.id) + '">' +
      (badged ? '<span class="w-boost-tag">' + svg(I.shield, 'w-i-xs') +
        'تأمین‌کننده‌ی ویژه</span>' : '') +
        '<div class="w-thumb">' +
          (p.img
            ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
            : '<span class="w-thumb-letter">' + esc(p.name.trim()[0] || '؟') + '</span>') +
          (off ? '<em class="w-off">٪' + fa(off) + '</em>' : '') +
          '<button class="w-eye" type="button" data-view="' + esc(p.id) + '" ' +
            'aria-label="نمای سریع ' + esc(p.name) + '">' + svg(I.eye) + '</button>' +
        '</div>' +

        '<h3 class="w-name">' + esc(p.name) + '</h3>' +
        '<div class="w-brandname">' + esc(p.brand) +
          (p.trail ? ' · ' + esc(p.trail) : '') + '</div>' +

        '<div class="w-price">' +
          (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') +
          money(p.price) + '<small> تومان / عدد</small>' +
        '</div>' +

        /* بیشترین صرفه‌جویی پلکانی — مهم‌ترین عدد برای خریدار عمده */
        (save
          ? '<div class="w-save">' + svg(I.bolt, 'w-i-xs') +
            'تا <b>٪' + fa(save) + '</b> ارزان‌تر در تعداد بالا</div>'
          : '') +

        '<div class="w-meta">' +
          '<span>حداقل سفارش <b>' + fa(p.moq) + '</b></span>' +
          '<span class="w-stock ' + st.cls + '">' + st.fa + '</span>' +
        '</div>' +

        /* ارزش کمینه‌ی سفارش و زمان آماده‌سازی */
        '<div class="w-meta w-meta-2">' +
          '<span title="ارزش کمینه‌ی سفارش">' + svg(I.money, 'w-i-xs') +
            'سفارش از ' + money(p.moq * (p.price || 0)) + '</span>' +
          (lead ? '<span>' + svg(I.clock, 'w-i-xs') + lead + '</span>' : '') +
        '</div>' +

        '<div class="w-seller">' +
          (p.verified ? '<span class="w-verified" title="فروشنده‌ی تأییدشده">' +
            svg(I.shield) + '</span>' : '') +
          '<span class="w-seller-name">' + esc(p.seller) + '</span>' +
          stars(p.rating) +
          (p.rating ? '<b class="w-rate-n">' + fa(p.rating) + '</b>' : '') +
        '</div>' +

        '<label class="w-cmp">' +
          '<input type="checkbox" data-cmp="' + esc(p.id) + '"' + (inCmp ? ' checked' : '') + ' />' +
          'مقایسه' +
        '</label>' +

        '<div class="w-actions">' +
          '<button class="w-btn-rfq" type="button" data-rfq="' + esc(p.id) + '">استعلام قیمت</button>' +
          '<button class="w-btn-cart" type="button" data-add="' + esc(p.id) + '"' +
            (p.stock <= 0 ? ' disabled' : '') + '>' +
            (p.stock <= 0 ? 'ناموجود' : 'افزودن') + '</button>' +
        '</div>' +
      '</article>';
  }

  /** آمار واقعی سربرگ */
  function paintStats() {
    var box = document.getElementById('wStats');
    if (!box) return;
    var prods = allProducts();
    var sellers = sellerList();
    var rfq = 0;
    try { rfq = (JSON.parse(localStorage.getItem('dpw_rfq')) || []).length; } catch (e) {}

    /* کمترین قیمت هر عدد در کل بازار — عدد گویایی برای خریدار */
    var low = 0;
    prods.forEach(function (p) {
      var v = p.lowest || p.price;
      if (v && (!low || v < low)) low = v;
    });

    /* مجموع موجودی آماده‌ی ارسال */
    var units = prods.reduce(function (a, p) { return a + (Number(p.stock) || 0); }, 0);

    var rows = [
      { i: I.box,   v: prods.length,   t: 'کالای عمده' },
      { i: I.store, v: sellers.length, t: 'تأمین‌کننده' },
      { i: I.bolt,  v: units,          t: 'عدد آماده‌ی ارسال' },
      { i: I.quote, v: rfq,            t: 'استعلام ثبت‌شده' },
    ];

    box.innerHTML = rows.map(function (r) {
      return '<div class="w-stat">' +
        '<span class="w-stat-i">' + svg(r.i) + '</span>' +
        '<b data-n="' + r.v + '">' + fa(r.v) + '</b>' +
        '<span>' + r.t + '</span></div>';
    }).join('');

    /* عددها هنگام دیده‌شدن از صفر بالا می‌روند */
    statsCounted = false;
    box.querySelectorAll('b[data-n]').forEach(function (b) { b.textContent = fa(0); });
    watchStats();
  }

  function paintGrid() {
    var list = filtered();

    /* شمارش بازدید برای تأمین‌کننده‌های دارای نردبان */
    if (window.DPWBoost) {
      var seen = {};
      list.slice(0, 24).forEach(function (p) {
        if (p.isReal && p.sellerId && !seen[p.sellerId]) {
          seen[p.sellerId] = 1;
          try { DPWBoost.countView(p.sellerId); } catch (e) {}
        }
      });
    }

    var box = $('#wGrid');
    var count = $('#wCount');
    if (count) count.textContent = fa(list.length) + ' کالا';

    if (!list.length) {
      var noneAtAll = allProducts().length === 0;
      box.innerHTML = noneAtAll
        ? '<div class="w-empty">' + svg(I.box) +
          '<b>هنوز کالایی در بازار عمده نیست</b>' +
          '<span>تأمین‌کننده‌ها پس از تأیید مدیر، کالاهایشان را اینجا عرضه می‌کنند. ' +
          'اگر تولیدکننده یا عمده‌فروش هستید، ثبت‌نام کنید.</span>' +
          '<a class="w-btn w-btn-gold" href="../seller/seller-signup.html" ' +
          'style="margin-top:14px">ثبت‌نام تأمین‌کننده</a></div>'
        : '<div class="w-empty">' + svg(I.box) +
          '<b>کالایی با این مشخصات پیدا نشد</b>' +
          '<span>فیلترها را ساده‌تر کنید یا واژه‌ی دیگری بجویید.</span></div>';
      return;
    }
    box.innerHTML = list.map(card).join('');
  }

  /** برندهای موجود در بازار — از کالاهای واقعی */
  function paintBrands() {
    var box = $('#fBrands');
    if (!box) return;
    var seen = {};
    allProducts().forEach(function (p) {
      var b = String(p.brand || '').trim();
      if (b) seen[b] = 1;
    });
    var list = Object.keys(seen).sort(function (a, b) {
      return a.localeCompare(b, 'fa');
    });

    if (!list.length) { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = list.map(function (b) {
      return '<button class="w-brand' + (state.brands.indexOf(b) > -1 ? ' on' : '') +
        '" type="button" data-brand="' + esc(b) + '">' + esc(b) + '</button>';
    }).join('');
  }

  /* ============================================================
     بنر صدر بازار — بسته‌ی انحصاری «hero»
     ------------------------------------------------------------
     در هر لحظه فقط یک تأمین‌کننده این جایگاه را دارد.
     بالای فهرست کالاها می‌نشیند.
     ============================================================ */
  function paintHero() {
    var host = document.getElementById('wHero');
    if (!host) return;

    var rec = null;
    if (window.DPWBoost) { try { rec = DPWBoost.heroSeller(); } catch (e) {} }
    if (!rec) { host.hidden = true; host.innerHTML = ''; return; }

    var users = [];
    try { users = JSON.parse(localStorage.getItem('dp_users')) || []; } catch (e) {}
    var u = users.find(function (x) { return x && x.id === rec.sellerId; });
    if (!u || u.status !== 'approved') { host.hidden = true; host.innerHTML = ''; return; }

    var items = allProducts()
      .filter(function (p) { return p.isReal && p.sellerId === rec.sellerId && p.stock > 0; })
      .slice(0, 5);

    var left = 0;
    try { left = DPWBoost.daysLeft(rec); } catch (e) {}
    var name = u.storeName || u.companyName || 'تأمین‌کننده';

    host.hidden = false;
    host.innerHTML =
      '<div class="w-hero-band gs-border">' +
        '<div class="w-hb-side">' +
          '<span class="w-hb-ribbon">' + svg(I.bolt, 'w-i-xs') + 'صدر بازار عمده</span>' +
          '<div class="w-hb-id">' +
            '<span class="w-hb-logo">' + esc(String(name).trim()[0] || '؟') + '</span>' +
            '<div class="w-hb-txt">' +
              '<h3>' + esc(name) + '</h3>' +
              '<p>' + esc(u.description || 'تأمین‌کننده‌ی برگزیده‌ی این هفته') + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="w-hb-meta">' +
            (u.city ? '<span>' + svg(I.pin, 'w-i-xs') + esc(u.city) + '</span>' : '') +
            '<span>' + svg(I.box, 'w-i-xs') + '<b>' + fa(items.length) + '</b> کالای آماده</span>' +
            (u.leadTime ? '<span>' + svg(I.clock, 'w-i-xs') + 'آماده‌سازی ' +
              fa(u.leadTime) + ' روز</span>' : '') +
            (u.minOrderValue ? '<span>' + svg(I.tag, 'w-i-xs') + 'حداقل ' +
              money(u.minOrderValue) + '</span>' : '') +
          '</div>' +
          '<button class="w-btn w-btn-gold" type="button" data-seller="' +
            esc(rec.sellerId) + '">دیدن همه‌ی کالاها</button>' +
        '</div>' +

        (items.length
          ? '<div class="w-hb-shelf">' +
              items.map(function (p) {
                var t = tiersOf(p);
                var best = t[t.length - 1];
                return '<button class="w-hb-item" type="button" data-view="' + esc(p.id) + '">' +
                  '<span class="w-hb-thumb">' +
                    (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy" />'
                           : '<span>' + esc(p.name.trim()[0]) + '</span>') + '</span>' +
                  '<span class="w-hb-name">' + esc(p.name) + '</span>' +
                  '<span class="w-hb-price">' + money(best.price) +
                    '<small> از ' + fa(best.from) + ' عدد</small></span>' +
                '</button>';
              }).join('') +
            '</div>'
          : '') +

        (left ? '<div class="w-hb-foot">' + svg(I.clock, 'w-i-xs') +
          '<span>این جایگاه <b>' + fa(left) + ' روز</b> دیگر آزاد می‌شود</span></div>' : '') +
      '</div>';
  }

  /* ============================================================
     فروشندگان
     ============================================================ */
  /** تأمین‌کننده‌های واقعی بازار */
  function sellerList() {
    var users = [];
    try { users = JSON.parse(localStorage.getItem('dp_users')) || []; } catch (e) { return []; }
    if (!Array.isArray(users)) return [];

    var prods = allProducts();
    var W = {};
    if (window.DPWBoost) { try { W = DPWBoost.weightMap(); } catch (e) { W = {}; } }

    return users
      .filter(function (u) {
        return u && u.sellerType === 'wholesale' && (u.status || '') === 'approved';
      })
      .map(function (u) {
        var mine = prods.filter(function (p) { return p.sellerId === u.id; });
        var featured = false;
        if (window.DPWBoost) { try { featured = DPWBoost.isFeatured(u.id); } catch (e) {} }

        /* کمترین قیمت و مجموع موجودی این تأمین‌کننده */
        var low = 0, units = 0;
        mine.forEach(function (p) {
          var v = p.lowest || p.price;
          if (v && (!low || v < low)) low = v;
          units += Number(p.stock) || 0;
        });

        /* دسته‌هایی که در آن‌ها کالا دارد */
        var secs = {};
        mine.forEach(function (p) {
          if (p.section && window.DPTaxonomy) {
            secs[DPTaxonomy.sectionLabel(p.section)] = 1;
          }
        });

        return {
          id: u.id,
          name: u.storeName || u.companyName || 'تأمین‌کننده',
          cat: Object.keys(secs).slice(0, 2).join(' · ') || (u.city || 'عمده‌فروش'),
          city: u.city || '',
          low: low,
          units: units,
          count: mine.length,
          verified: true,
          featured: featured,
          weight: W[u.id] || 0,
          since: u.joinDate ? String(u.joinDate).split('/')[0] : '',
          minOrder: Number(u.minOrderValue) || 0,
          lead: Number(u.leadTime) || 0,
        };
      })
      /* دارندگان نردبان اول، بعد پرکالاترها */
      .sort(function (a, b) {
        return b.weight - a.weight || b.count - a.count;
      });
  }

  function paintSellers() {
    var list = sellerList();
    var sec = document.getElementById('sellers');

    if (!list.length) {
      if (sec) sec.hidden = true;
      $('#wSellers').innerHTML = '';
      return;
    }
    if (sec) sec.hidden = false;

    $('#wSellers').innerHTML = list.map(function (s) {
      return '' +
        '<article class="w-scard gs-border' + (s.featured ? ' is-featured' : '') +
          '" data-seller="' + esc(s.id) + '">' +
          (s.featured ? '<span class="w-sc-flag">برگزیده</span>' : '') +
          '<div class="w-slogo">' + esc(String(s.name).trim()[0] || '؟') + '</div>' +
          '<h3>' + esc(s.name) +
            (s.verified ? '<span class="w-verified">' + svg(I.shield) + '</span>' : '') +
          '</h3>' +
          '<div class="cat">' + esc(s.cat) + '</div>' +
          '<div class="w-srow">' +
            '<span><b>' + fa(s.count) + '</b>کالا</span>' +
            (s.units ? '<span><b>' + fa(s.units) + '</b>عدد موجود</span>' : '') +
            (s.lead ? '<span><b>' + fa(s.lead) + '</b>روز آماده‌سازی</span>' : '') +
          '</div>' +

          /* شروع قیمت — نخستین چیزی که خریدار عمده می‌پرسد */
          (s.low
            ? '<div class="w-sprice">شروع از <b>' + money(s.low) + '</b> تومان / عدد</div>'
            : '') +

          (s.city ? '<div class="w-scity">' + svg(I.store, 'w-i-xs') + esc(s.city) + '</div>' : '') +
          '<button class="w-btn w-btn-silver" type="button" style="width:100%;justify-content:center">' +
            'مشاهده کالاها</button>' +
        '</article>';
    }).join('');
  }

  /* ============================================================
     بازدیدهای اخیر
     ============================================================ */
  function noteRecent(id) {
    state.recent = [String(id)].concat(state.recent.filter(function (x) { return String(x) !== String(id); }));
    save();
    paintRecent();
  }

  function paintRecent() {
    var sec = $('#wRecentSec');
    var box = $('#wRecent');
    var list = state.recent
      .map(function (id) { return allProducts().find(function (p) { return p.id === id; }); })
      .filter(Boolean);

    if (!list.length) { sec.hidden = true; return; }
    sec.hidden = false;

    box.innerHTML = list.map(function (p) {
      return '<div class="w-rcard" data-view="' + esc(p.id) + '">' +
        '<div class="w-thumb"><span class="w-thumb-letter">' +
          esc(p.name.trim()[0]) + '</span></div>' +
        '<div class="nm">' + esc(p.name) + '</div>' +
        '<div class="pr">' + money(p.price) + '</div>' +
      '</div>';
    }).join('');
  }

  /* ============================================================
     سبد
     ============================================================ */
  function addToCart(id, qty) {
    var p = allProducts().find(function (x) { return String(x.id) === String(id); });
    if (!p) return;
    if (p.stock <= 0) { toast('این کالا موجود نیست.', 'err'); return; }

    var n = Math.max(p.moq, Number(qty) || p.moq);
    if (n > p.stock) {
      toast('موجودی فقط ' + fa(p.stock) + ' عدد است.', 'err');
      n = p.stock;
    }

    var row = state.cart.find(function (x) { return String(x.id) === String(id); });
    if (row) row.qty = Math.min(p.stock, row.qty + n);
    else state.cart.push({ id: String(id), qty: n });

    save();
    paintCart();
    toast(fa(n) + ' عدد «' + p.name.slice(0, 24) + '» به سبد افزوده شد.', 'ok');
  }

  function paintCart() {
    var n = state.cart.reduce(function (a, x) { return a + x.qty; }, 0);
    var b = $('#wCartN');
    if (b) { b.textContent = fa(n); b.hidden = n === 0; }
    if ($('#wCart') && $('#wCart').classList.contains('open')) paintCartBody();
  }

  /* ---------- قیمت هر عدد بر پایه‌ی پلکان ---------- */
  function unitFor(p, qty) {
    var base = Math.max(0, Number(p.price) || 0);
    var t = tiersOf(p).slice().sort(function (a, b) { return a.from - b.from; });

    /*
     * اگر تعداد به هیچ پله‌ای نرسیده، قیمت پایه حساب می‌شود.
     * پیش‌تر `t[0]` بی‌قیدوشرط انتخاب می‌شد؛ اگر پله‌ها از ۱۰
     * شروع می‌شدند و خریدار ۳ عدد می‌خواست، تخفیف تعداد بالا
     * را می‌گرفت بدون اینکه تعداد بالا خریده باشد.
     */
    var pick = null;
    for (var i = 0; i < t.length; i++) if (qty >= t[i].from) pick = t[i];

    return pick ? Math.max(0, Number(pick.price) || base) : base;
  }

  /* ---------- بدنه‌ی سبد ---------- */
  function paintCartBody() {
    var box = $('#wCartBody');
    if (!box) return;
    var all = allProducts();
    var rows = state.cart.map(function (x) {
      var p = all.find(function (y) { return String(y.id) === String(x.id); });
      return p ? { p: p, qty: x.qty } : null;
    }).filter(Boolean);

    /* ردیف‌هایی که کالایشان حذف شده، از سبد پاک شوند */
    if (rows.length !== state.cart.length) {
      state.cart = rows.map(function (r) { return { id: r.p.id, qty: r.qty }; });
      save();
    }

    if (!rows.length) {
      box.innerHTML = '<div style="text-align:center;padding:34px 10px;color:var(--w-gray)">' +
        svg(I.cart, 'w-i-lg') +
        '<p style="margin:12px 0 0">سبد سفارش خالی است.</p></div>';
      return;
    }

    /* گروه‌بندی بر پایه‌ی تأمین‌کننده */
    var groups = {};
    rows.forEach(function (r) {
      var k = r.p.sellerId;
      (groups[k] = groups[k] || { seller: r.p.seller, id: k, rows: [] }).rows.push(r);
    });

    var grand = 0;
    var html = Object.keys(groups).map(function (k) {
      var g = groups[k];
      var sub = 0;
      var body = g.rows.map(function (r) {
        var u = unitFor(r.p, r.qty);
        var tot = u * r.qty;
        sub += tot;
        return '<tr>' +
          '<td>' + esc(r.p.name) +
            '<span class="w-tiny" style="display:block;color:var(--w-gray);font-size:11.5px">' +
              'حداقل ' + fa(r.p.moq) + ' عدد · موجودی ' + fa(r.p.stock) + '</span></td>' +
          '<td><div style="display:flex;gap:4px;align-items:center">' +
            '<button class="w-chip-btn" type="button" data-qm="' + esc(r.p.id) + '" aria-label="کم کردن">−</button>' +
            '<b style="min-width:44px;text-align:center;display:inline-block">' + fa(r.qty) + '</b>' +
            '<button class="w-chip-btn" type="button" data-qp="' + esc(r.p.id) + '" aria-label="زیاد کردن">+</button>' +
          '</div></td>' +
          '<td>' + money(u) + '</td>' +
          '<td><b>' + money(tot) + '</b></td>' +
          '<td><button class="w-chip-btn" type="button" data-rm="' + esc(r.p.id) + '" aria-label="حذف">حذف</button></td>' +
        '</tr>';
      }).join('');
      grand += sub;

      return '<div class="gs-border" style="padding:14px;border-radius:12px;margin-bottom:14px">' +
        '<h3 style="margin:0 0 10px;font-size:14px">' + esc(g.seller) + '</h3>' +
        '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">' +
          '<thead><tr style="color:var(--w-gray);font-size:12px;text-align:right">' +
          '<th style="padding:6px 4px">کالا</th><th style="padding:6px 4px">تعداد</th>' +
          '<th style="padding:6px 4px">هر عدد</th><th style="padding:6px 4px">جمع</th><th></th>' +
          '</tr></thead><tbody>' + body + '</tbody></table></div>' +
        '<div style="text-align:left;margin-top:10px;font-size:13px">جمع این تأمین‌کننده: <b>' +
          money(sub) + '</b> تومان</div>' +
        '<button class="w-btn w-btn-gold" type="button" data-order="' + esc(g.id) +
          '" style="width:100%;justify-content:center;margin-top:10px">ثبت سفارش نزد این تأمین‌کننده</button>' +
      '</div>';
    }).join('');

    box.innerHTML = html +
      '<div style="display:flex;justify-content:space-between;align-items:center;' +
        'padding:12px 4px;font-size:15px">' +
        '<span>جمع کل سبد</span><b>' + money(grand) + ' تومان</b></div>' +
      '<button class="w-chip-btn" type="button" id="wCartClear">خالی کردن سبد</button>';
  }

  /* ---------- ثبت سفارش برای یک تأمین‌کننده ---------- */
  function placeOrder(sellerId) {
    if (!window.DPWStore) { toast('ثبت سفارش در دسترس نیست.', 'err'); return; }
    var all = allProducts();
    var lines = state.cart.map(function (x) {
      var p = all.find(function (y) { return String(y.id) === String(x.id); });
      if (!p || p.sellerId !== sellerId) return null;
      var u = unitFor(p, x.qty);
      return { productId: p.realId, name: p.name, qty: x.qty, unit: u };
    }).filter(Boolean);

    if (!lines.length) { toast('کالایی از این تأمین‌کننده در سبد نیست.', 'err'); return; }

    var nm = prompt('نام شما برای ثبت سفارش:', buyerName() === 'خریدار مهمان' ? '' : buyerName());
    if (nm === null) return;
    nm = String(nm).trim();
    if (nm.length < 2) { toast('نام معتبر بنویسید.', 'err'); return; }

    var ph = prompt('شماره تماس (۰۹…):', '');
    if (ph === null) return;
    ph = toEn(String(ph)).replace(/\D/g, '');
    if (!/^09\d{9}$/.test(ph)) { toast('شماره تماس معتبر نیست.', 'err'); return; }

    try {
      var rec = DPWStore.orders.createFor(sellerId, {
        buyerName: nm, buyerPhone: ph, lines: lines,
        note: 'سفارش از بازار عمده‌فروشان',
      });
      state.cart = state.cart.filter(function (x) {
        var p = all.find(function (y) { return String(y.id) === String(x.id); });
        return !p || p.sellerId !== sellerId;
      });
      save();
      paintCart();
      paintCartBody();
      toast('سفارش ' + esc(rec.id) + ' ثبت شد. تأمین‌کننده تماس می‌گیرد.', 'ok');
    } catch (err) {
      toast(err.message || 'ثبت سفارش ناموفق بود.', 'err');
    }
  }

  /* ============================================================
     پنجره‌ی جزئیات
     ============================================================ */
  var galIdx = 0;

  function openDetail(id) {
    var p = allProducts().find(function (x) { return String(x.id) === String(id); });
    if (!p) return;
    noteRecent(id);
    if (p.isReal && window.DPWBoost) {
      try { DPWBoost.countClick(p.sellerId); } catch (e) {}
    }
    galIdx = 0;

    var st = stockInfo(p.stock);
    var tiers = tiersOf(p);
    var off = offOf(p);

    $('#wDetailBody').innerHTML = '' +
      '<div class="w-detail">' +
        '<div class="w-gallery">' +
          '<div class="w-thumb" id="wGalMain">' +
            '<span class="w-thumb-letter">' + esc(p.name.trim()[0]) + '</span>' +
            (off ? '<em class="w-off">٪' + fa(off) + ' تخفیف</em>' : '') +
          '</div>' +
          '<div class="w-gal-dots">' +
            [0, 1, 2].map(function (i) {
              return '<button type="button" data-gal="' + i + '"' +
                (i === 0 ? ' class="on"' : '') + ' aria-label="تصویر ' + fa(i + 1) + '"></button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div>' +
          '<h2>' + esc(p.name) + '</h2>' +
          '<div class="sub">' +
            esc(p.brand) + (p.trail ? ' · ' + esc(p.trail) : '') + ' · ' +
            '<span class="w-stock ' + st.cls + '">' + st.fa + '</span>' +
          '</div>' +

          '<div class="w-seller" style="margin-bottom:14px">' +
            (p.verified ? '<span class="w-verified">' + svg(I.shield) + '</span>' : '') +
            '<span>' + esc(p.seller) + '</span>' + stars(p.rating) +
            (p.rating ? '<b class="w-rate-n">' + fa(p.rating) + '</b>' : '') +
          '</div>' +

          '<h3 style="font-size:13.5px;margin:0 0 8px">پلکان قیمت عمده</h3>' +
          tierTable(p, tiers) +

          '<p style="font-size:13px;color:var(--w-gray);margin:0 0 12px">' +
            esc(p.description) + '</p>' +

          '<table class="w-specs"><tbody>' +
            Object.keys(p.spec).map(function (k) {
              return '<tr><th>' + esc(k) + '</th><td>' + esc(p.spec[k]) + '</td></tr>';
            }).join('') +
            '<tr><th>حداقل سفارش</th><td><b style="color:var(--w-gold-l)">' +
              fa(p.moq) + ' عدد</b></td></tr>' +
          '</tbody></table>' +

          '<div class="w-buy-row">' +
            '<div class="w-qty">' +
              '<button type="button" data-q="-" aria-label="کم کردن">−</button>' +
              '<input id="wQty" value="' + fa(p.moq) + '" inputmode="numeric" ' +
                'aria-label="تعداد" />' +
              '<button type="button" data-q="+" aria-label="افزودن">+</button>' +
            '</div>' +
            '<button class="w-btn w-btn-gold" type="button" data-add="' + esc(p.id) + '"' +
              (p.stock <= 0 ? ' disabled' : '') + '>' +
              svg(I.cart) + (p.stock <= 0 ? 'ناموجود' : 'افزودن به سبد') + '</button>' +
            '<button class="w-btn w-btn-silver" type="button" data-rfq="' + esc(p.id) + '">' +
              svg(I.quote) + 'استعلام قیمت</button>' +
          '</div>' +

          '<div class="w-note">' +
            'سفارش کمتر از <b>' + fa(p.moq) + '</b> عدد پذیرفته نمی‌شود. ' +
            'برای تعداد بالاتر از ' + fa(p.moq * 25) + ' عدد، با استعلام قیمت ' +
            'می‌توانید تخفیف بیشتری بگیرید.' +
          '</div>' +
        '</div>' +
      '</div>';

    openModal('#wDetail');
  }

  /* ============================================================
     پنجره‌ی استعلام
     ============================================================ */
  function openRfq(id) {
    var p = allProducts().find(function (x) { return String(x.id) === String(id); });
    if (!p) return;
    $('#rfqProduct').value = p.name;
    $('#rfqQty').value = fa(p.moq * 5);
    $('#rfqTarget').value = '';
    $('#rfqDate').value = '';
    $('#rfqNote').value = '';
    if ($('#rfqName') && !$('#rfqName').value) {
      var bn = buyerName();
      if (bn && bn !== 'خریدار مهمان') $('#rfqName').value = bn;
    }
    $('#wRfq').dataset.pid = String(id);
    openModal('#wRfq');
  }

  /* ============================================================
     مقایسه
     ============================================================ */
  function toggleCompare(id, on) {
    var i = state.compare.indexOf(String(id));
    if (on && i < 0) {
      if (state.compare.length >= 4) {
        toast('حداکثر ۴ کالا را می‌توان مقایسه کرد.', 'err');
        var cb = document.querySelector('[data-cmp="' + String(id).replace(/"/g,'') + '"]');
        if (cb) cb.checked = false;
        return;
      }
      state.compare.push(String(id));
    } else if (!on && i > -1) {
      state.compare.splice(i, 1);
    }
    paintCmpBar();
  }

  function paintCmpBar() {
    var bar = $('#wCmpBar');
    bar.classList.toggle('on', state.compare.length > 0);
    $('#wCmpItems').innerHTML = state.compare.map(function (id) {
      var p = allProducts().find(function (x) { return String(x.id) === String(id); });
      if (!p) return '';
      return '<span class="w-cmp-tag"><span>' + esc(p.name) + '</span>' +
        '<button type="button" data-uncmp="' + esc(id) + '" aria-label="حذف">' +
        svg(I.x) + '</button></span>';
    }).join('');
    $('#wCmpGo').disabled = state.compare.length < 2;
  }

  function openCompare() {
    var list = state.compare
      .map(function (id) { return allProducts().find(function (p) { return p.id === id; }); })
      .filter(Boolean);
    if (list.length < 2) return;

    var minPrice = Math.min.apply(null, list.map(function (p) { return p.price; }));
    var minMoq = Math.min.apply(null, list.map(function (p) { return p.moq; }));
    var maxStock = Math.max.apply(null, list.map(function (p) { return p.stock; }));
    var maxRate = Math.max.apply(null, list.map(function (p) { return p.rating; }));

    var rows = [
      ['برند', function (p) { return esc(p.brand); }],
      ['دسته', function (p) { return esc(p.trail || p.category); }],
      ['قیمت هر عدد', function (p) {
        return '<span class="' + (p.price === minPrice ? 'best-cell' : '') + '">' +
          money(p.price) + '</span>'; }],
      ['حداقل سفارش', function (p) {
        return '<span class="' + (p.moq === minMoq ? 'best-cell' : '') + '">' +
          fa(p.moq) + ' عدد</span>'; }],
      ['موجودی', function (p) {
        return '<span class="' + (p.stock === maxStock ? 'best-cell' : '') + '">' +
          (p.stock ? fa(p.stock) + ' عدد' : 'ناموجود') + '</span>'; }],
      ['بهترین قیمت پله‌ای', function (p) {
        var t = tiersOf(p); return money(t[t.length - 1].price); }],
      ['فروشنده', function (p) { return esc(p.seller); }],
      ['امتیاز', function (p) {
        return '<span class="' + (p.rating === maxRate ? 'best-cell' : '') + '">' +
          fa(p.rating) + '</span>'; }],
      ['تأییدشده', function (p) { return p.verified ? 'بله' : 'خیر'; }],
    ];

    $('#wCmpBody').innerHTML =
      '<h2 style="margin:0 0 14px;font-size:18px">مقایسه‌ی کالاها</h2>' +
      '<div style="overflow-x:auto"><table class="w-cmp-table">' +
        '<thead><tr><th>ویژگی</th>' +
          list.map(function (p) { return '<th>' + esc(p.name) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><th>' + r[0] + '</th>' +
            list.map(function (p) { return '<td>' + r[1](p) + '</td>'; }).join('') + '</tr>';
        }).join('') +
      '</tbody></table></div>';

    openModal('#wCmp');
  }

  /* ============================================================
     پنجره‌ها — باز و بسته
     ============================================================ */
  var lastFocus = null;

  function openModal(sel) {
    var m = $(sel);
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('open');
    document.body.classList.add('w-lock');
    var f = m.querySelector('button, input, select, textarea');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }

  function closeModal(m) {
    (m ? [m] : $$('.w-modal.open')).forEach(function (x) { x.classList.remove('open'); });
    document.body.classList.remove('w-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }


  /* ============================================================
     احترام به تنظیم «کاهش حرکت» سیستم
     ============================================================ */
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* بی‌اهمیت */ }

  /* ============================================================
     تعویض تم روشن و تیره
     ------------------------------------------------------------
     تم پیش از رسم صفحه در <head> اعمال شده؛ اینجا فقط کلیدش را
     می‌بندیم و انتخاب کاربر را به یاد می‌سپاریم.
     ============================================================ */
  function currentTheme() {
    return document.documentElement.getAttribute('data-w-theme') === 'light'
      ? 'light' : 'dark';
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-w-theme', t);
    try { localStorage.setItem(LS.theme, t); } catch (e) { /* بی‌اهمیت */ }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f5f0e8' : '#0b1220');

    var btn = document.getElementById('wThemeBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      btn.setAttribute('title', t === 'light' ? 'رفتن به حالت تیره' : 'رفتن به حالت روشن');
      btn.setAttribute('aria-label', btn.getAttribute('title'));
    }
  }

  function wireTheme() {
    var btn = document.getElementById('wThemeBtn');
    if (!btn) return;
    applyTheme(currentTheme());
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
      toast(next === 'light' ? 'حالت روشن روشن شد.' : 'حالت تیره روشن شد.', 'ok');
    });
  }

  /* ============================================================
     شمارش بالارونده‌ی اعداد آمار
     ------------------------------------------------------------
     عددها از صفر تا مقدار واقعی بالا می‌روند. اگر کاربر «کاهش
     حرکت» را روشن کرده باشد، عدد نهایی مستقیم نوشته می‌شود.
     ============================================================ */
  function countUp(el, target) {
    if (REDUCED || target <= 0 || target > 1e9) { el.textContent = fa(target); return; }

    var dur = 900;
    var t0 = 0;

    function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      /* منحنی نرم — تندِ اول، آرامِ آخر */
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = fa(Math.round(target * e));
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /** وقتی نوار آمار به دید آمد، اعداد را بشمار */
  var statsCounted = false;
  function watchStats() {
    var box = document.getElementById('wStats');
    if (!box || statsCounted || !window.IntersectionObserver) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || statsCounted) return;
        statsCounted = true;
        io.disconnect();
        box.querySelectorAll('b[data-n]').forEach(function (b) {
          countUp(b, Number(b.dataset.n) || 0);
        });
      });
    }, { threshold: 0.35 });

    io.observe(box);
  }

  /* ============================================================
     فیلترهای ذخیره‌شده
     ------------------------------------------------------------
     خریدار عمده معمولاً هر بار دنبال یک ترکیب مشخص است
     («پوشاک زنانه، موجود، حداقل سفارش زیر ۲۰»). حالا می‌تواند
     آن ترکیب را نام‌گذاری کند و دفعه‌ی بعد با یک کلیک برگردد.
     ============================================================ */
  var FILTER_KEYS = ['q', 'cat', 'brands', 'min', 'max', 'moq', 'stock', 'rating', 'sort'];

  function snapshotFilters() {
    var o = {};
    FILTER_KEYS.forEach(function (k) {
      o[k] = Array.isArray(state[k]) ? state[k].slice() : state[k];
    });
    return o;
  }

  /** آیا فیلتری فعال است؟ — برای جلوگیری از ذخیره‌ی حالت خالی */
  function anyFilterOn() {
    return !!(state.q || state.cat || state.min || state.max ||
              state.moq || state.stock || state.rating ||
              (state.brands && state.brands.length));
  }

  /** خلاصه‌ی خوانا از یک فیلتر ذخیره‌شده — برای نمایش زیر نامش */
  function describeFilter(f) {
    var bits = [];
    if (f.q) bits.push('«' + f.q + '»');
    if (f.cat) {
      bits.push(window.DPTaxonomy ? DPTaxonomy.sectionLabel(f.cat) : f.cat);
    }
    if (f.brands && f.brands.length) bits.push(fa(f.brands.length) + ' برند');
    if (f.min || f.max) {
      bits.push((f.min ? money(f.min) : '۰') + ' تا ' + (f.max ? money(f.max) : 'بی‌نهایت'));
    }
    if (f.moq) bits.push('حداقل سفارش ' + fa(f.moq));
    if (f.stock === 'in') bits.push('فقط موجود');
    if (f.stock === 'out') bits.push('فقط ناموجود');
    if (f.rating) bits.push('امتیاز ' + fa(f.rating) + '+');
    return bits.join(' · ') || 'بدون فیلتر';
  }

  function applyFilter(f) {
    FILTER_KEYS.forEach(function (k) {
      state[k] = Array.isArray(f[k]) ? f[k].slice() : f[k];
    });

    /* فرم را با حالت تازه هماهنگ می‌کنیم */
    $('#fQ').value = state.q || '';
    $('#wTopSearch').value = state.q || '';
    $('#fCat').value = state.cat || '';
    $('#fMin').value = state.min ? fa(state.min) : '';
    $('#fMax').value = state.max ? fa(state.max) : '';
    $('#fMoq').value = state.moq || '';
    $('#fStock').value = state.stock || '';
    $('#fRate').value = state.rating || '';
    $('#fSort').value = state.sort || 'pop';

    paintBrands();
    paintGrid();
  }

  function paintSaved() {
    var box = document.getElementById('wSaved');
    if (!box) return;

    if (!state.saved.length) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }

    box.hidden = false;
    box.innerHTML =
      '<span class="w-saved-lbl">' + svg(I.bookmark) + ' فیلترهای من</span>' +
      state.saved.map(function (f, i) {
        return '<span class="w-saved-chip" title="' + esc(describeFilter(f)) + '">' +
          '<button type="button" data-saved-go="' + i + '">' + esc(f.name) + '</button>' +
          '<button type="button" class="w-saved-x" data-saved-del="' + i + '" ' +
          'aria-label="حذف فیلتر ' + esc(f.name) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button></span>';
      }).join('');
  }

  function wireSaved() {
    var addBtn = document.getElementById('fSave');
    if (addBtn) addBtn.addEventListener('click', function () {
      if (!anyFilterOn()) {
        toast('اول چند فیلتر انتخاب کنید، بعد ذخیره‌اش کنید.', 'err');
        return;
      }
      if (state.saved.length >= 8) {
        toast('بیشتر از هشت فیلتر نمی‌شود ذخیره کرد. یکی را حذف کنید.', 'err');
        return;
      }

      var name = window.prompt('یک نام کوتاه برای این فیلتر بنویسید:', describeFilter(snapshotFilters()).slice(0, 28));
      if (name === null) return;
      name = String(name).trim().slice(0, 32);
      if (!name) { toast('نام نمی‌تواند خالی باشد.', 'err'); return; }

      var f = snapshotFilters();
      f.name = name;
      state.saved.unshift(f);
      save();
      paintSaved();
      toast('فیلتر «' + name + '» ذخیره شد.', 'ok');
    });

    var box = document.getElementById('wSaved');
    if (box) box.addEventListener('click', function (e) {
      var go = e.target.closest('[data-saved-go]');
      if (go) {
        var f = state.saved[Number(go.dataset.savedGo)];
        if (f) { applyFilter(f); toast('فیلتر «' + f.name + '» اعمال شد.', 'ok'); }
        return;
      }
      var del = e.target.closest('[data-saved-del]');
      if (del) {
        var i = Number(del.dataset.savedDel);
        var nm = state.saved[i] && state.saved[i].name;
        if (!nm) return;
        if (!window.confirm('فیلتر «' + nm + '» حذف شود؟')) return;
        state.saved.splice(i, 1);
        save();
        paintSaved();
        toast('فیلتر حذف شد.', 'ok');
      }
    });
  }

  /* ============================================================
     تیلت سه‌بعدی ملایم روی کارت‌ها
     ------------------------------------------------------------
     یک شنونده روی خودِ شبکه — نه روی تک‌تک کارت‌ها — تا با
     بازسازی شبکه شنونده‌ی یتیم به‌جا نماند.
     ============================================================ */
  function wireTilt() {
    var grid = document.getElementById('wGrid');
    if (!grid || REDUCED) return;

    /* روی صفحه‌های لمسی تیلت معنا ندارد */
    var fine = true;
    try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
    if (!fine) return;

    var raf = 0;
    var pending = null;

    grid.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.w-card');
      if (!c) return;
      pending = { c: c, x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (!pending) return;
        var r = pending.c.getBoundingClientRect();
        var px = (pending.x - r.left) / r.width - 0.5;
        var py = (pending.y - r.top) / r.height - 0.5;
        /* حداکثر ۴ درجه — بیش از این روی متن فارسی آزاردهنده است */
        pending.c.style.setProperty('--tx', (-py * 4).toFixed(2) + 'deg');
        pending.c.style.setProperty('--ty', (px * 4).toFixed(2) + 'deg');
        pending.c.classList.add('is-tilt');
      });
    });

    grid.addEventListener('pointerleave', reset, true);
    grid.addEventListener('pointerout', function (e) {
      var c = e.target.closest('.w-card');
      if (c && !c.contains(e.relatedTarget)) clear(c);
    });

    function clear(c) {
      c.classList.remove('is-tilt');
      c.style.removeProperty('--tx');
      c.style.removeProperty('--ty');
    }
    function reset() {
      pending = null;
      grid.querySelectorAll('.w-card.is-tilt').forEach(clear);
    }
  }

  /* ============================================================
     رویدادها
     ============================================================ */
  function wire() {
    /* --- جست‌وجوی بالا و فیلتر --- */
    var debounce = null;
    var onSearch = function (v) {
      clearTimeout(debounce);
      debounce = setTimeout(function () { state.q = v; paintGrid(); }, 220);
    };
    $('#wTopSearch').addEventListener('input', function (e) {
      $('#fQ').value = e.target.value;
      onSearch(e.target.value);
    });
    $('#fQ').addEventListener('input', function (e) {
      $('#wTopSearch').value = e.target.value;
      onSearch(e.target.value);
    });

    $('#fCat').addEventListener('change', function (e) { state.cat = e.target.value; paintGrid(); });
    $('#fMoq').addEventListener('change', function (e) { state.moq = e.target.value; paintGrid(); });
    $('#fStock').addEventListener('change', function (e) { state.stock = e.target.value; paintGrid(); });
    $('#fRate').addEventListener('change', function (e) { state.rating = e.target.value; paintGrid(); });
    $('#fSort').addEventListener('change', function (e) { state.sort = e.target.value; paintGrid(); });

    var priceIn = function () {
      var mn = toEn($('#fMin').value).replace(/\D/g, '');
      var mx = toEn($('#fMax').value).replace(/\D/g, '');
      state.min = mn ? Number(mn) : null;
      state.max = mx ? Number(mx) : null;
      paintGrid();
    };
    $('#fMin').addEventListener('input', priceIn);
    $('#fMax').addEventListener('input', priceIn);

    /* --- برندها ----------
       از کالاهای واقعی خوانده می‌شوند، نه فهرست ثابت. */
    paintBrands();

    $('#fBrands').addEventListener('click', function (e) {
      var b = e.target.closest('[data-brand]');
      if (!b) return;
      var name = b.dataset.brand;
      var i = state.brands.indexOf(name);
      if (i > -1) state.brands.splice(i, 1); else state.brands.push(name);
      b.classList.toggle('on', i < 0);
      paintGrid();
    });

    /* --- پاک کردن فیلترها --- */
    $('#fReset').addEventListener('click', function () {
      state.q = ''; state.cat = ''; state.brands = []; state.min = null; state.max = null;
      state.moq = ''; state.stock = ''; state.rating = ''; state.seller = null; state.sort = 'pop';
      ['#fQ', '#fMin', '#fMax', '#wTopSearch'].forEach(function (s) { $(s).value = ''; });
      ['#fCat', '#fMoq', '#fStock', '#fRate'].forEach(function (s) { $(s).value = ''; });
      $('#fSort').value = 'pop';
      $$('#fBrands .w-brand').forEach(function (x) { x.classList.remove('on'); });
      $('#wSellerNote').hidden = true;
      paintGrid();
      toast('فیلترها پاک شد.', 'ok');
    });

    /* --- سبد سفارش --- */
    var cartBtn = $('#wCartBtn');
    if (cartBtn) cartBtn.addEventListener('click', function () {
      paintCartBody();
      openModal('#wCart');
    });

    /* --- کلیک‌های سراسری --- */
    document.addEventListener('click', function (e) {
      var t = e.target;

      /* دکمه‌های داخل سبد */
      var qp = t.closest('[data-qp]'), qm = t.closest('[data-qm]'),
          rm = t.closest('[data-rm]'), od = t.closest('[data-order]');
      if (qp || qm || rm) {
        var cid = (qp || qm || rm).dataset.qp || (qm ? qm.dataset.qm : '') || (rm ? rm.dataset.rm : '');
        var pr = allProducts().find(function (x) { return String(x.id) === String(cid); });
        var row = state.cart.find(function (x) { return String(x.id) === String(cid); });
        if (!pr || !row) return;
        if (rm) {
          state.cart = state.cart.filter(function (x) { return String(x.id) !== String(cid); });
        } else if (qp) {
          row.qty = Math.min(pr.stock, row.qty + Math.max(1, Math.round(pr.moq / 2)));
        } else {
          row.qty = row.qty - Math.max(1, Math.round(pr.moq / 2));
          if (row.qty < pr.moq) {
            state.cart = state.cart.filter(function (x) { return String(x.id) !== String(cid); });
          }
        }
        save(); paintCart(); paintCartBody();
        return;
      }
      if (od) { placeOrder(od.dataset.order); return; }
      if (t.closest('#wCartClear')) {
        state.cart = []; save(); paintCart(); paintCartBody();
        toast('سبد خالی شد.', 'ok');
        return;
      }

      var view = t.closest('[data-view]');
      if (view) { openDetail(view.dataset.view); return; }

      var rfq = t.closest('[data-rfq]');
      if (rfq) { openRfq(rfq.dataset.rfq); return; }

      var add = t.closest('[data-add]');
      if (add && !add.disabled) {
        var q = $('#wQty');
        var inModal = !!t.closest('.w-modal');
        addToCart(add.dataset.add, inModal && q ? Number(toEn(q.value)) : 0);
        return;
      }

      var un = t.closest('[data-uncmp]');
      if (un) {
        var uid = un.dataset.uncmp;
        toggleCompare(uid, false);
        var box = document.querySelector('[data-cmp="' + String(uid).replace(/"/g,'') + '"]');
        if (box) box.checked = false;
        return;
      }

      var sc = t.closest('[data-seller]');
      if (sc) {
        var sid = sc.dataset.seller;
        state.seller = state.seller === sid ? null : sid;
        var s = sellerList().find(function (x) { return String(x.id) === String(sid); });
        var note = $('#wSellerNote');
        note.hidden = !state.seller;
        note.textContent = (state.seller && s) ? 'فقط کالاهای «' + s.name + '»' : '';
        paintGrid();
        $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      var gal = t.closest('[data-gal]');
      if (gal) {
        galIdx = Number(gal.dataset.gal);
        $$('.w-gal-dots button').forEach(function (b, i) {
          b.classList.toggle('on', i === galIdx);
        });
        return;
      }

      var qb = t.closest('[data-q]');
      if (qb) {
        var inp = $('#wQty');
        if (!inp) return;
        var cur = Number(toEn(inp.value)) || 0;
        inp.value = fa(Math.max(1, cur + (qb.dataset.q === '+' ? 1 : -1)));
        return;
      }

      if (t.closest('[data-close]') || t.classList.contains('w-modal')) {
        closeModal(t.closest('.w-modal'));
      }
    });

    /* --- تیک مقایسه --- */
    document.addEventListener('change', function (e) {
      var c = e.target.closest('[data-cmp]');
      if (c) toggleCompare(c.dataset.cmp, c.checked);
    });

    $('#wCmpGo').addEventListener('click', openCompare);
    $('#wCmpClear').addEventListener('click', function () {
      state.compare = [];
      $$('[data-cmp]').forEach(function (x) { x.checked = false; });
      paintCmpBar();
    });

    /* --- کلید Escape --- */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    /* --- فرم استعلام --- */
    $('#rfqForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var qty = Number(toEn($('#rfqQty').value).replace(/\D/g, ''));
      if (!qty || qty < 1) { toast('تعداد مورد نیاز را بنویسید.', 'err'); return; }

      var nm = ($('#rfqName') ? $('#rfqName').value : '').trim();
      var ph = toEn(($('#rfqPhone') ? $('#rfqPhone').value : '')).replace(/\D/g, '');
      if (nm.length < 2) { toast('نام خود را بنویسید تا فروشنده بتواند پاسخ دهد.', 'err'); return; }
      if (!/^09\d{9}$/.test(ph)) { toast('شماره تماس یازده‌رقمی و با ۰۹ شروع شود.', 'err'); return; }

      var pid = $('#wRfq').dataset.pid;
      var p = allProducts().find(function (x) { return String(x.id) === String(pid); });
      if (!p) { toast('کالا دیگر در دسترس نیست.', 'err'); return; }

      if (!window.DPWStore) {
        toast('ارسال استعلام در دسترس نیست. صفحه را تازه کنید.', 'err');
        return;
      }

      try {
        DPWStore.rfq.create({
          sellerId: p.sellerId,
          productId: p.realId,
          productName: p.name,
          buyerName: nm,
          buyerPhone: ph,
          buyerCompany: ($('#rfqCompany') ? $('#rfqCompany').value : '').trim(),
          qty: qty,
          targetPrice: toEn($('#rfqTarget').value).replace(/\D/g, ''),
          deadline: $('#rfqDate').value,
          note: $('#rfqNote').value,
        });
        try { if (window.DPWBoost) DPWBoost.countRfq(p.sellerId); } catch (e2) {}
        closeModal($('#wRfq'));
        $('#rfqForm').reset();
        toast('استعلام شما برای «' + p.seller + '» فرستاده شد.', 'ok');
      } catch (err) {
        toast(err.message || 'ارسال استعلام ناموفق بود.', 'err');
      }
    });

    /* --- سفارش سریع --- */
    $('#quickForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var code = toEn($('#qCode').value).trim();
      var qty = Number(toEn($('#qQty').value).replace(/\D/g, ''));
      var raw = toEn($('#qCode').value).trim();
      var p = allProducts().find(function (x) {
        return String(x.code) === raw || String(x.realId) === raw ||
               String(x.id) === raw || String(x.code) === String(code);
      });
      if (!p) { toast('کالایی با کد ' + fa(code || '—') + ' پیدا نشد.', 'err'); return; }
      addToCart(p.id, qty || p.moq);
      $('#qCode').value = ''; $('#qQty').value = '';
    });

    /* --- بارگذاری CSV --- */
    var drop = $('#csvDrop');
    var file = $('#csvFile');

    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('dragover', function (e) {
      e.preventDefault(); drop.classList.add('over');
    });
    drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault(); drop.classList.remove('over');
      if (e.dataTransfer.files[0]) readCsv(e.dataTransfer.files[0]);
    });
    file.addEventListener('change', function () {
      if (file.files[0]) readCsv(file.files[0]);
    });

    $('#csvTpl').addEventListener('click', function (e) {
      e.stopPropagation();
      var rows = ['کد کالا,تعداد', '1,20', '5,50', '12,100'].join('\n');
      var blob = new Blob(['\uFEFF' + rows], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'digipoosh-bulk-template.csv';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      toast('قالب CSV دانلود شد.', 'ok');
    });

    /* --- خبرنامه --- */
    $('#newsForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#newsMail').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        toast('نشانی ایمیل معتبر نیست.', 'err'); return;
      }
      $('#newsMail').value = '';
      toast('در خبرنامه ثبت شدید.', 'ok');
    });

    /* --- منوی موبایل --- */
    $('#wBurger').addEventListener('click', function () {
      var nav = $('#wNav');
      var open = nav.style.display === 'flex';
      nav.style.display = open ? '' : 'flex';
      nav.style.position = 'fixed';
      nav.style.insetInline = '12px';
      nav.style.top = '72px';
      nav.style.flexDirection = 'column';
      nav.style.padding = '10px';
      nav.style.borderRadius = '12px';
      nav.style.background = 'rgba(15,26,44,0.98)';
      nav.style.border = '1px solid rgba(201,168,76,0.3)';
      nav.style.zIndex = '250';
      if (open) nav.style.display = '';
    });
  }

  function readCsv(f) {
    var reader = new FileReader();
    reader.onload = function () {
      var lines = String(reader.result).split(/\r?\n/).filter(Boolean);
      var added = 0, bad = 0;
      lines.forEach(function (ln, i) {
        if (i === 0 && /[^\d,،\s]/.test(ln)) return;      /* سرستون */
        var parts = ln.split(/[,،;]/);
        var id = toEn(parts[0] || '').trim();
        var qty = Number(toEn(parts[1] || '').replace(/\D/g, ''));
        var p = allProducts().find(function (x) {
          return String(x.code) === id || String(x.realId) === id || String(x.id) === id;
        });
        if (!p || p.stock <= 0) { bad++; return; }
        var row = state.cart.find(function (x) { return String(x.id) === String(p.id); });
        var n = Math.min(p.stock, Math.max(p.moq, qty || p.moq));
        if (row) row.qty = Math.min(p.stock, row.qty + n);
        else state.cart.push({ id: String(p.id), qty: n });
        added++;
      });
      save();
      paintCart();
      toast(added ? fa(added) + ' ردیف افزوده شد' + (bad ? ' — ' + fa(bad) + ' ردیف نامعتبر بود' : '.')
                  : 'هیچ ردیف معتبری پیدا نشد.', added ? 'ok' : 'err');
    };
    reader.readAsText(f, 'utf-8');
  }

  /** نام خریدار از نشست — اگر وارد نشده، «خریدار» */
  function buyerName() {
    try {
      var u = JSON.parse(localStorage.getItem('dp_customer_session'));
      if (u && u.fullName) return u.fullName;
    } catch (e) { /* بی‌اهمیت */ }
    try {
      var s2 = JSON.parse(localStorage.getItem('dp_session'));
      if (s2 && s2.email) return String(s2.email).split('@')[0];
    } catch (e) { /* بی‌اهمیت */ }
    return 'خریدار مهمان';
  }

  /* ============================================================
     ورود تأمین‌کننده
     ------------------------------------------------------------
     چرا اینجا؟ تا حالا تأمین‌کننده باید از بازار بیرون می‌رفت،
     صفحه‌ی ورود فروشندگان را پیدا می‌کرد و از آنجا وارد پنل
     می‌شد. حالا از همین صفحه وارد می‌شود و مستقیم به پنل خودش
     می‌رود.
     ============================================================ */
  function authMsg(text, bad) {
    var box = $('#wLogMsg');
    if (!box) return;
    box.textContent = text || '';
    box.hidden = !text;
    box.className = 'w-auth-msg' + (bad ? ' is-bad' : '');
  }

  /** چه کسی وارد شده؟ — فقط عمده‌فروش‌ها اینجا پنل دارند */
  function currentSeller() {
    var s;
    try { s = JSON.parse(localStorage.getItem('dp_session')); } catch (e) { return null; }
    if (!s || !s.user_id) return null;

    var users = [];
    try { users = JSON.parse(localStorage.getItem('dp_users')) || []; } catch (e) { return null; }
    if (!Array.isArray(users)) return null;

    var u = users.find(function (x) { return x && x.id === s.user_id; });
    return u || null;
  }

  function paintAuth() {
    var u = currentSeller();
    var mePanel = $('#wMePanel');
    var authBox = $('#wAuthBox');
    var panelBtn = $('#wPanelBtn');
    var loginBtn = $('#wLoginBtn');
    if (!mePanel || !authBox) return;

    /* کسی وارد نشده — فرم ورود */
    if (!u) {
      mePanel.hidden = true;
      authBox.hidden = false;
      if (panelBtn) panelBtn.hidden = true;
      if (loginBtn) loginBtn.hidden = false;
      return;
    }

    var isW = u.sellerType === 'wholesale';
    /* نام نمایشی — هر کدام که پر بود، به همین ترتیب */
    var name = u.storeName || u.companyName || u.fullName || u.name ||
               (u.email ? String(u.email).split('@')[0] : '') || 'تأمین‌کننده';

    mePanel.hidden = false;
    authBox.hidden = true;
    if (loginBtn) loginBtn.hidden = true;
    if (panelBtn) panelBtn.hidden = false;

    $('#wMeLetter').textContent = String(name).trim()[0] || '؟';
    $('#wMeTitle').textContent = name;

    var go = $('#wMeGo');

    if (isW) {
      var st = u.status || (u.isVerified ? 'approved' : 'pending');
      var note = 'شما تأمین‌کننده‌ی این بازار هستید.';
      if (st === 'pending') {
        note = 'فروشگاه شما در انتظار تأیید مدیر است. ' +
               'می‌توانید کالا ثبت کنید — پس از تأیید منتشر می‌شود.';
      } else if (st === 'rejected' || st === 'suspended') {
        note = 'دسترسی فروشگاه شما فعلاً بسته است. از پنل، درخواست بررسی دوباره بدهید.';
      }
      $('#wMeNote').textContent = note;
      go.href = './panel/wholesale-dashboard.html';
      go.textContent = 'ورود به پنل من';
      if (panelBtn) panelBtn.href = './panel/wholesale-dashboard.html';
    } else {
      /* فروشنده‌ی تک‌فروشی است — پنل او جای دیگری است */
      $('#wMeNote').textContent =
        'حساب شما «خرده‌فروشی» است، نه عمده‌فروشی. پنل شما جای دیگری است.';
      go.href = '../seller/seller-dashboard.html';
      go.textContent = 'رفتن به پنل خرده‌فروشی';
      if (panelBtn) panelBtn.href = '../seller/seller-dashboard.html';
    }
  }

  function wireAuth() {
    var form = $('#wLoginForm');
    if (!form) return;

    /* چشمک رمز */
    var eye = $('#wLogEye');
    if (eye) eye.addEventListener('click', function () {
      var inp = $('#wLogPass');
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', show ? 'true' : 'false');
      eye.setAttribute('aria-label', show ? 'پنهان کردن رمز' : 'نمایش رمز');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = String($('#wLogMail').value || '').trim().toLowerCase();
      var pass = String($('#wLogPass').value || '');
      var btn = $('#wLogBtn');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        authMsg('نشانی ایمیل معتبر نیست.', true); return;
      }
      if (!pass) { authMsg('رمز عبور را بنویسید.', true); return; }
      if (!window.DPStore) {
        authMsg('سامانه‌ی ورود بارگذاری نشد. صفحه را تازه کنید.', true); return;
      }

      authMsg('در حال بررسی…', false);
      btn.disabled = true;

      DPStore.auth.login(mail, pass).then(function () {
        var u = currentSeller();

        /*
         * اگر حساب عمده‌فروشی نباشد، نباید او را به پنل عمده
         * بفرستیم — گیج می‌شود. به پنل خودش می‌رود.
         */
        if (u && u.sellerType !== 'wholesale') {
          authMsg('این حساب خرده‌فروشی است. به پنل خودتان می‌رویم…', false);
          setTimeout(function () {
            location.href = '../seller/seller-dashboard.html';
          }, 900);
          return;
        }

        authMsg('خوش آمدید. در حال رفتن به پنل…', false);
        setTimeout(function () {
          location.href = './panel/wholesale-dashboard.html';
        }, 600);

      }).catch(function (err) {
        btn.disabled = false;
        authMsg((err && err.message) || 'ورود ناموفق بود.', true);
      });
    });

    var out = $('#wMeOut');
    if (out) out.addEventListener('click', function () {
      try { DPStore.auth.logout(); } catch (e) {}
      paintAuth();
      toast('از حساب خود خارج شدید.', 'ok');
    });
  }

  /* ============================================================
     آغاز
     ============================================================ */
  function boot() {
    load();

    /* پر کردن گزینه‌های دسته */
    /* گزینه‌های دسته از همان درختی می‌آید که فروشنده در پنلش دید */
    var catOpts = window.DPTaxonomy
      ? DPTaxonomy.sections().map(function (x) {
          return '<option value="' + esc(x.key) + '">' + esc(x.label) + '</option>';
        })
      : CATS.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; });

    $('#fCat').innerHTML = '<option value="">همه‌ی دسته‌ها</option>' + catOpts.join('');

    paintStats();
    paintHero();
    paintGrid();
    paintSellers();
    paintRecent();
    paintCart();
    paintCmpBar();
    paintAuth();
    wire();
    wireAuth();
    wireTheme();
    wireSaved();
    wireTilt();
    paintSaved();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* برای اتصال بعدی به بک‌اند */
  function refreshAll() { paintStats(); paintHero(); paintGrid(); paintSellers(); paintBrands(); }
  document.addEventListener('dpw:boost', refreshAll);
  document.addEventListener('dpw:change', refreshAll);
  window.addEventListener('storage', function (e) {
    if (e.key === 'dpw_products' || e.key === 'dp_users' || e.key === 'dpw_boosts') refreshAll();
  });

  window.DPWholesale = {
    all: allProducts,
    real: realProducts,
    sellers: sellerList,
    state: state,
    refresh: paintGrid,
  };
})();
