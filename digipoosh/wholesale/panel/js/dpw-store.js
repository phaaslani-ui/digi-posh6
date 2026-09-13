/* ============================================================
   دیجی‌پوش — موتور داده‌ی عمده‌فروشی
   ------------------------------------------------------------
   روی `DPStore` سوار می‌شود و آنچه را عمده‌فروشی لازم دارد
   اضافه می‌کند:

     • کالای عمده با قیمت پلکانی و حداقل سفارش (MOQ)
     • استعلام قیمت (RFQ) — دریافت، پاسخ، رد
     • سفارش‌های عمده با وضعیت‌های ویژه
     • مدیریت انبار و هشدار کمبود
     • مشتریان عمده و اعتبار خرید
     • گزارش درآمد و کارنامه

   بارگذاری: پس از `seller/js/dp-store.js`
   ============================================================ */
'use strict';

(function () {

  if (typeof window === 'undefined') return;

  /* ============================================================
     پایه
     ============================================================ */
  var K = {
    products: 'dpw_products',
    rfq:      'dpw_rfq',
    orders:   'dpw_orders',
    buyers:   'dpw_buyers',
    stock:    'dpw_stock_log',
  };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) {
    return String(n == null ? '' : n).replace(/\d/g, function (d) { return FA[+d]; });
  };
  var money = function (n) {
    return fa(Math.round(Number(n) || 0).toLocaleString('en-US')).replace(/,/g, '٬');
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
  var nowFa = function () {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date()); }
    catch (e) { return ''; }
  };
  var uid = function (p) {
    return (p || 'w') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  /** خواندن امن — داده‌ی خراب سامانه را نمی‌شکند */
  function read(key, def) {
    var v;
    try { v = JSON.parse(localStorage.getItem(key)); } catch (e) { return def; }
    if (v == null) return def;
    if (Array.isArray(def)) {
      if (!Array.isArray(v)) return def;
      return v.filter(function (x) { return x && typeof x === 'object'; });
    }
    return v;
  }

  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return false; }
    try { document.dispatchEvent(new CustomEvent('dpw:change', { detail: { key: key } })); }
    catch (e) { /* بی‌اهمیت */ }
    return true;
  }

  /** شناسه‌ی فروشنده‌ی وارد‌شده */
  function me() {
    try {
      var s = JSON.parse(localStorage.getItem('dp_session'));
      return s && s.user_id ? s.user_id : null;
    } catch (e) { return null; }
  }

  /** پروفایل کامل فروشنده */
  function profile() {
    var id = me();
    if (!id) return null;
    var all = read('dp_users', []);
    return all.find(function (u) { return u.id === id; }) || null;
  }

  /* ============================================================
     قواعد دسترسی — بسته به وضعیت تأیید فروشگاه
     ------------------------------------------------------------
     دقیقاً همان قاعده‌ی فروشنده‌ی معمولی:

       approved  → کالا مستقیم در بازار عمده دیده می‌شود
       pending   → کالا ساخته می‌شود ولی پیش‌نویس می‌ماند
       rejected  → قفل
       suspended → قفل

     نکته‌ی مهم: خواسته‌ی فروشنده در `wanted` نگه داشته می‌شود.
     وقتی مدیر فروشگاه را تأیید کرد، همان خواسته اجرا می‌شود —
     نه اینکه همه‌چیز کورکورانه فعال شود.
     ============================================================ */
  var RULES = {
    approved:  { canAdd: true,  canPublish: true,  locked: false },
    pending:   { canAdd: true,  canPublish: false, locked: false },
    rejected:  { canAdd: false, canPublish: false, locked: true  },
    suspended: { canAdd: false, canPublish: false, locked: true  },
  };

  /** وضعیت تأیید فروشگاهی که الان وارد شده */
  function myStatus() {
    var u = profile();
    if (!u) return 'pending';
    return u.status || (u.isVerified ? 'approved' : 'pending');
  }

  function can() { return RULES[myStatus()] || RULES.pending; }

  /** پیام فارسی وضعیت — برای نمایش در پنل */
  var STATUS_FA = {
    approved:  'تأییدشده',
    pending:   'در انتظار تأیید مدیر',
    rejected:  'ردشده',
    suspended: 'معلق',
  };

  /* ============================================================
     قیمت پلکانی
     ------------------------------------------------------------
     ستون فقرات عمده‌فروشی: هرچه بیشتر بخری، ارزان‌تر.
     هر پله یک «از این تعداد به بالا» و یک قیمت دارد.
     ============================================================ */

  /** کد یکتا برای کالا — تکراری نمی‌شود حتی پس از حذف کالاها */
  function uniqueCode(all, wanted) {
    var taken = {};
    all.forEach(function (p) { if (p && p.code) taken[String(p.code)] = 1; });
    var c = String(wanted == null ? '' : wanted).trim();
    if (c && !taken[c]) return c;
    var n = all.length + 1001;
    while (taken[String(n)]) n++;
    return String(n);
  }

  /**
   * پله‌ها را تمیز می‌کند.
   *
   * چرا پله‌ی زیر «حداقل سفارش» حذف می‌شود؟
   * پیش‌تر `Math.max(1, ...)` روی تعداد اعمال می‌شد؛ یعنی
   * پله‌ی نامعتبرِ «از ۰ عدد» به «از ۱ عدد» تبدیل می‌شد و
   * حداقل سفارش را دور می‌زد — خریدار می‌توانست یک عدد را
   * با قیمت عمده بگیرد. حالا چنین پله‌ای کنار گذاشته می‌شود.
   */
  function cleanTiers(raw, base, moq) {
    if (!Array.isArray(raw) || !raw.length) return defaultTiers(base, moq);

    var minQty = Math.max(1, Math.floor(Number(moq) || 1));

    var out = raw.map(function (t) {
      return {
        from: Math.floor(Number(t && t.from)),
        price: Math.round(Number(t && t.price)),
      };
    }).filter(function (t) {
      return isFinite(t.from) && isFinite(t.price) &&
             t.from >= minQty && t.price > 0;
    }).sort(function (a, b) { return a.from - b.from; });

    if (!out.length) return defaultTiers(base, moq);

    /* پله‌ی تکراری — آخری برنده است */
    var seen = {};
    out.forEach(function (t) { seen[t.from] = t.price; });

    return Object.keys(seen).map(function (k) {
      return { from: Number(k), price: seen[k] };
    }).sort(function (a, b) { return a.from - b.from; });
  }

  /** پله‌های پیش‌فرض بر پایه‌ی قیمت پایه و MOQ */
  function defaultTiers(base, moq) {
    var b = Math.max(0, Number(base) || 0);
    var m = Math.max(1, Number(moq) || 1);
    return [
      { from: m,      price: b },
      { from: m * 5,  price: Math.round(b * 0.94) },
      { from: m * 10, price: Math.round(b * 0.88) },
      { from: m * 25, price: Math.round(b * 0.80) },
    ];
  }

  /** قیمت هر عدد برای یک تعداد مشخص */
  function priceFor(p, qty) {
    var n = Math.max(1, Number(qty) || 1);
    var tiers = cleanTiers(p.tiers, p.price, p.moq);
    var base = Math.max(0, Number(p.price) || 0);

    /*
     * اگر تعداد به هیچ پله‌ای نرسیده، قیمت پایه حساب می‌شود —
     * نه ارزان‌ترین پله. پیش‌تر `tiers[0]` بی‌قیدوشرط انتخاب
     * می‌شد و خریدار تخفیف تعداد بالا را بدون خرید تعداد بالا
     * می‌گرفت.
     */
    var picked = null;
    for (var i = 0; i < tiers.length; i++) {
      if (n >= tiers[i].from) picked = tiers[i];
    }

    var unit = picked ? Math.max(0, Number(picked.price) || base) : base;

    return {
      unit: unit,
      total: unit * n,
      tier: picked,
      saved: Math.max(0, base - unit) * n,
    };
  }

  /** بیشترین تخفیف ممکن — برای نمایش «تا ٪X ارزان‌تر» */
  function maxDiscount(p) {
    var tiers = p.tiers && p.tiers.length ? p.tiers : defaultTiers(p.price, p.moq);
    var base = Number(p.price) || 0;
    if (!base) return 0;
    var low = Math.min.apply(null, tiers.map(function (t) { return Number(t.price) || base; }));
    return Math.max(0, Math.round((base - low) / base * 100));
  }

  /* ============================================================
     کالاها
     ============================================================ */
  var products = {
    /** همه‌ی کالاهای این فروشنده */
    list: function () {
      var id = me();
      if (!id) return [];
      return read(K.products, [])
        .filter(function (p) { return p.sellerId === id; })
        .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    },

    /** یک کالا */
    get: function (pid) {
      return read(K.products, []).find(function (p) { return p.id === pid; }) || null;
    },

    /** افزودن */
    add: function (data) {
      var id = me();
      if (!id) throw new Error('ابتدا وارد شوید.');

      var rule = can();
      if (rule.locked) {
        throw new Error('دسترسی فروشگاه شما بسته است. با پشتیبانی تماس بگیرید.');
      }

      if (!data.name || !String(data.name).trim()) throw new Error('نام کالا الزامی است.');

      var price = Number(toEn(data.price));
      if (!Number.isFinite(price) || price <= 0) throw new Error('قیمت باید عددی مثبت باشد.');

      var moq = Number(toEn(data.moq));
      if (!Number.isFinite(moq) || moq < 1) throw new Error('حداقل سفارش باید دست‌کم ۱ باشد.');

      var stock = Number(toEn(data.stock));
      if (!Number.isFinite(stock) || stock < 0) throw new Error('موجودی نمی‌تواند منفی باشد.');

      var all = read(K.products, []);
      var rec = {
        id: uid('wp'),
        sellerId: id,
        name: String(data.name).trim(),
        code: uniqueCode(all, data.code),
        /* دسته‌بندی سه‌سطحی — مثل فروشنده‌ی معمولی */
        section: String(data.section || '').trim(),
        group: String(data.group || '').trim(),
        item: String(data.item || '').trim(),
        category: data.category || data.item || '',
        brand: String(data.brand || '').trim(),
        price: Math.round(price),
        moq: Math.floor(moq),
        stock: Math.floor(stock),
        lowAt: Math.max(0, Number(toEn(data.lowAt)) || Math.floor(moq * 3)),
        tiers: cleanTiers(data.tiers, price, moq),
        description: String(data.description || '').trim(),
        material: String(data.material || '').trim(),
        colors: String(data.colors || '').trim(),
        sizes: String(data.sizes || '').trim(),
        packing: String(data.packing || '').trim(),
        leadTime: Math.max(0, Number(toEn(data.leadTime)) || 0),
        images: Array.isArray(data.images) ? data.images.slice(0, 6) : [],

        /*
         * تا وقتی فروشگاه تأیید نشده، هر کالایی پیش‌نویس می‌ماند
         * و در بازار عمده دیده نمی‌شود.
         */
        status: rule.canPublish
          ? (data.status === 'draft' ? 'draft' : 'active')
          : 'draft',

        /* خواسته‌ی فروشنده — پس از تأیید مدیر همین اجرا می‌شود */
        wanted: data.status === 'draft' ? 'draft' : 'active',
        views: 0,
        sold: 0,
        createdAt: Date.now(),
        date: nowFa(),
      };
      all.push(rec);
      write(K.products, all);
      return rec;
    },

    /** ویرایش */
    update: function (pid, patch) {
      var id = me();

      var rule = can();
      if (rule.locked) {
        throw new Error('دسترسی فروشگاه شما بسته است. با پشتیبانی تماس بگیرید.');
      }

      var all = read(K.products, []);
      var i = all.findIndex(function (p) { return p.id === pid && p.sellerId === id; });
      if (i < 0) throw new Error('کالا پیدا نشد.');

      /* تا تأیید نشده، انتشار ممکن نیست — خواسته ثبت می‌شود */
      if (!rule.canPublish && patch.status && patch.status !== 'draft') {
        patch.wanted = patch.status;
        patch.status = 'draft';
      }

      if (patch.price !== undefined) {
        var pr = Number(toEn(patch.price));
        if (!Number.isFinite(pr) || pr <= 0) throw new Error('قیمت باید عددی مثبت باشد.');
        patch.price = Math.round(pr);
      }
      if (patch.moq !== undefined) {
        var mq = Number(toEn(patch.moq));
        if (!Number.isFinite(mq) || mq < 1) throw new Error('حداقل سفارش نامعتبر است.');
        patch.moq = Math.floor(mq);
      }
      if (patch.stock !== undefined) {
        var st = Number(toEn(patch.stock));
        if (!Number.isFinite(st) || st < 0) throw new Error('موجودی نمی‌تواند منفی باشد.');
        patch.stock = Math.floor(st);
      }
      if (patch.images !== undefined) {
        patch.images = Array.isArray(patch.images) ? patch.images.slice(0, 6) : [];
      }
      if (patch.tiers !== undefined) {
        var pv = patch.price !== undefined ? patch.price : all[i].price;
        var mv = patch.moq !== undefined ? patch.moq : all[i].moq;
        patch.tiers = cleanTiers(patch.tiers, pv, mv);
      }

      all[i] = Object.assign({}, all[i], patch, { updatedAt: Date.now() });
      write(K.products, all);
      return all[i];
    },

    /**
     * پس از تأیید فروشگاه، پیش‌نویس‌ها خودکار منتشر می‌شوند.
     * مدیر این را صدا می‌زند — نه خود فروشنده.
     */
    publishDrafts: function (sellerId) {
      if (!sellerId) return 0;
      var all = read(K.products, []);
      var n = 0;
      all.forEach(function (p) {
        if (p.sellerId !== sellerId || p.status !== 'draft') return;
        /* اگر فروشنده خودش خواسته پیش‌نویس بماند، دست نمی‌زنیم */
        if ((p.wanted || 'active') === 'draft') return;
        p.status = 'active';
        n++;
      });
      if (n) write(K.products, all);
      return n;
    },

    /** با رد یا تعلیق، کالاها از بازار برداشته می‌شوند */
    hideAll: function (sellerId) {
      if (!sellerId) return 0;
      var all = read(K.products, []);
      var n = 0;
      all.forEach(function (p) {
        if (p.sellerId !== sellerId || p.status === 'draft') return;
        p.wanted = p.wanted || p.status;
        p.status = 'draft';
        n++;
      });
      if (n) write(K.products, all);
      return n;
    },

    /** حذف */
    remove: function (pid) {
      var id = me();
      write(K.products, read(K.products, []).filter(function (p) {
        return !(p.id === pid && p.sellerId === id);
      }));
      return true;
    },

    /** تغییر موجودی با ثبت در دفتر انبار */
    adjustStock: function (pid, delta, reason) {
      var p = products.get(pid);
      if (!p) throw new Error('کالا پیدا نشد.');
      var d = Number(toEn(delta)) || 0;
      var next = Math.max(0, (Number(p.stock) || 0) + d);

      products.update(pid, { stock: next });

      var log = read(K.stock, []);
      log.push({
        id: uid('sl'),
        sellerId: me(),
        productId: pid,
        productName: p.name,
        delta: d,
        after: next,
        reason: String(reason || '').trim() || (d > 0 ? 'افزودن به انبار' : 'برداشت از انبار'),
        at: Date.now(),
        date: nowFa(),
      });
      write(K.stock, log.slice(-500));
      return next;
    },

    /** دفتر انبار */
    stockLog: function (limit) {
      var id = me();
      return read(K.stock, [])
        .filter(function (r) { return r.sellerId === id; })
        .sort(function (a, b) { return b.at - a.at; })
        .slice(0, limit || 50);
    },

    /** کالاهای رو به اتمام */
    lowStock: function () {
      return products.list().filter(function (p) {
        return p.status === 'active' && p.stock > 0 && p.stock <= (p.lowAt || p.moq * 3);
      });
    },

    /** کالاهای تمام‌شده */
    outOfStock: function () {
      return products.list().filter(function (p) { return p.stock <= 0; });
    },
  };

  /* ============================================================
     استعلام قیمت (RFQ)
     ------------------------------------------------------------
     ستون دوم عمده‌فروشی: خریدار تعداد و قیمت هدفش را می‌گوید،
     فروشنده پیشنهاد می‌دهد.
     ============================================================ */
  var RFQ_FA = {
    open:     'در انتظار پاسخ',
    answered: 'پاسخ داده شد',
    accepted: 'پذیرفته شد',
    rejected: 'رد شد',
    expired:  'منقضی شد',
  };

  var rfq = {
    STATUS_FA: RFQ_FA,

    /** استعلام‌های این فروشنده */
    list: function (status) {
      var id = me();
      var all = read(K.rfq, [])
        .filter(function (r) { return r.sellerId === id; })
        .sort(function (a, b) { return b.at - a.at; });
      return status ? all.filter(function (r) { return r.status === status; }) : all;
    },

    /** یک استعلام */
    get: function (rid) {
      return read(K.rfq, []).find(function (r) { return r.id === rid; }) || null;
    },

    /** شماره‌ی استعلام‌های بی‌پاسخ */
    unread: function () {
      return rfq.list('open').length;
    },

    /**
     * ثبت استعلام تازه — از سمت خریدار.
     * در بازار عمده هم همین صدا زده می‌شود.
     */
    create: function (data) {
      if (!data.sellerId) throw new Error('فروشنده مشخص نیست.');
      var qty = Number(toEn(data.qty));
      if (!Number.isFinite(qty) || qty < 1) throw new Error('تعداد مورد نیاز را بنویسید.');

      var all = read(K.rfq, []);
      var rec = {
        id: uid('rq'),
        sellerId: data.sellerId,
        productId: data.productId || '',
        productName: String(data.productName || 'کالای نامشخص').trim(),
        buyerName: String(data.buyerName || 'خریدار').trim(),
        buyerPhone: String(data.buyerPhone || '').trim(),
        buyerEmail: String(data.buyerEmail || '').trim(),
        buyerCompany: String(data.buyerCompany || '').trim(),
        qty: Math.floor(qty),
        targetPrice: Math.max(0, Number(toEn(data.targetPrice)) || 0),
        deadline: String(data.deadline || '').trim(),
        note: String(data.note || '').trim(),
        status: 'open',
        offer: null,
        at: Date.now(),
        date: nowFa(),
      };
      all.push(rec);
      write(K.rfq, all);
      return rec;
    },

    /** پاسخ فروشنده */
    answer: function (rid, offer) {
      var all = read(K.rfq, []);
      var r = all.find(function (x) { return x.id === rid && x.sellerId === me(); });
      if (!r) throw new Error('استعلام پیدا نشد.');
      if (r.status !== 'open') throw new Error('به این استعلام قبلاً پاسخ داده‌اید.');

      var unit = Number(toEn(offer.unitPrice));
      if (!Number.isFinite(unit) || unit <= 0) throw new Error('قیمت پیشنهادی نامعتبر است.');

      r.status = 'answered';
      r.offer = {
        unitPrice: Math.round(unit),
        total: Math.round(unit) * r.qty,
        leadTime: Math.max(0, Number(toEn(offer.leadTime)) || 0),
        validDays: Math.max(1, Number(toEn(offer.validDays)) || 7),
        note: String(offer.note || '').trim(),
        at: Date.now(),
        date: nowFa(),
      };
      write(K.rfq, all);
      return r;
    },

    /** رد استعلام با دلیل */
    reject: function (rid, reason) {
      var txt = String(reason || '').trim();
      if (txt.length < 4) throw new Error('دلیل رد را بنویسید.');
      var all = read(K.rfq, []);
      var r = all.find(function (x) { return x.id === rid && x.sellerId === me(); });
      if (!r) throw new Error('استعلام پیدا نشد.');
      r.status = 'rejected';
      r.reason = txt;
      write(K.rfq, all);
      return r;
    },

    /** تبدیل استعلام پذیرفته‌شده به سفارش */
    toOrder: function (rid) {
      var r = rfq.get(rid);
      if (!r) throw new Error('استعلام پیدا نشد.');
      if (!r.offer) throw new Error('هنوز پیشنهادی ثبت نشده است.');

      var o = orders.create({
        buyerName: r.buyerName,
        buyerPhone: r.buyerPhone,
        buyerCompany: r.buyerCompany,
        lines: [{
          productId: r.productId,
          name: r.productName,
          qty: r.qty,
          unit: r.offer.unitPrice,
        }],
        note: 'از استعلام ' + r.id,
        fromRfq: r.id,
      });

      var all = read(K.rfq, []);
      var x = all.find(function (y) { return y.id === rid; });
      if (x) { x.status = 'accepted'; x.orderId = o.id; write(K.rfq, all); }
      return o;
    },
  };

  /* ============================================================
     سفارش‌های عمده
     ============================================================ */
  var ORDER_FA = {
    pending:   'در انتظار تأیید',
    confirmed: 'تأییدشده',
    preparing: 'در حال آماده‌سازی',
    shipped:   'ارسال‌شده',
    delivered: 'تحویل‌شده',
    canceled:  'لغو شد',
  };

  var FLOW = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

  var orders = {
    STATUS_FA: ORDER_FA,
    FLOW: FLOW,

    list: function (status) {
      var id = me();
      var all = read(K.orders, [])
        .filter(function (o) { return o.sellerId === id; })
        .sort(function (a, b) { return b.at - a.at; });
      return status ? all.filter(function (o) { return o.status === status; }) : all;
    },

    get: function (oid) {
      return read(K.orders, []).find(function (o) { return o.id === oid; }) || null;
    },

    /** ساخت سفارش تازه (از پنل فروشنده) */
    create: function (data) {
      return orders.createFor(me(), data);
    },

    /**
     * ساخت سفارش برای یک تأمین‌کننده‌ی مشخص.
     * بازار عمده (سمت خریدار) این را صدا می‌زند — آنجا کسی
     * وارد پنل نشده، پس شناسه‌ی فروشنده باید صریح بیاید.
     */
    createFor: function (sellerId, data) {
      var id = sellerId;
      if (!id) throw new Error('تأمین‌کننده مشخص نیست.');
      var lines = (data.lines || []).filter(function (l) { return l && l.qty > 0; });
      if (!lines.length) throw new Error('سفارش بدون کالا نمی‌شود.');

      var total = 0;
      lines.forEach(function (l) {
        l.unit = Math.max(0, Number(l.unit) || 0);
        l.qty = Math.max(1, Math.floor(Number(l.qty) || 1));
        l.total = l.unit * l.qty;
        total += l.total;
      });

      var all = read(K.orders, []);
      var rec = {
        id: 'WO-' + Date.now().toString(36).toUpperCase() +
            Math.random().toString(36).slice(2, 4).toUpperCase(),
        sellerId: id,
        buyerName: String(data.buyerName || 'خریدار').trim(),
        buyerPhone: String(data.buyerPhone || '').trim(),
        buyerCompany: String(data.buyerCompany || '').trim(),
        address: String(data.address || '').trim(),
        lines: lines,
        count: lines.reduce(function (a, l) { return a + l.qty; }, 0),
        total: total,
        paid: 0,
        status: 'pending',
        note: String(data.note || '').trim(),
        fromRfq: data.fromRfq || '',
        at: Date.now(),
        date: nowFa(),
        history: [{ status: 'pending', at: Date.now(), date: nowFa() }],
      };
      all.push(rec);
      write(K.orders, all);
      return rec;
    },

    /** بردن سفارش به مرحله‌ی بعد */
    setStatus: function (oid, status) {
      if (!ORDER_FA[status]) throw new Error('وضعیت نامعتبر.');
      var all = read(K.orders, []);
      var o = all.find(function (x) { return x.id === oid && x.sellerId === me(); });
      if (!o) throw new Error('سفارش پیدا نشد.');
      if (o.status === 'delivered') throw new Error('سفارش تحویل‌شده تغییر نمی‌کند.');
      if (o.status === status) return o;

      /* هنگام آماده‌سازی، موجودی کم می‌شود */
      if (status === 'preparing' && o.status !== 'preparing') {
        o.lines.forEach(function (l) {
          if (!l.productId) return;
          try { products.adjustStock(l.productId, -l.qty, 'سفارش ' + o.id); } catch (e) {}
        });
      }

      /* اگر لغو شد و قبلاً کم شده بود، برمی‌گردد */
      if (status === 'canceled' && FLOW.indexOf(o.status) >= 2) {
        o.lines.forEach(function (l) {
          if (!l.productId) return;
          try { products.adjustStock(l.productId, l.qty, 'لغو سفارش ' + o.id); } catch (e) {}
        });
      }

      /* هنگام تحویل، شمارش فروش بالا می‌رود */
      if (status === 'delivered') {
        o.lines.forEach(function (l) {
          if (!l.productId) return;
          var p = products.get(l.productId);
          if (p) { try { products.update(l.productId, { sold: (p.sold || 0) + l.qty }); } catch (e) {} }
        });
      }

      o.status = status;
      o.history = o.history || [];
      o.history.push({ status: status, at: Date.now(), date: nowFa() });
      write(K.orders, all);
      return o;
    },

    /** ثبت پرداخت جزئی یا کامل */
    pay: function (oid, amount) {
      var all = read(K.orders, []);
      var o = all.find(function (x) { return x.id === oid && x.sellerId === me(); });
      if (!o) throw new Error('سفارش پیدا نشد.');
      var a = Number(toEn(amount));
      if (!Number.isFinite(a) || a <= 0) throw new Error('مبلغ نامعتبر است.');
      o.paid = Math.max(0, Math.min(Number(o.total) || 0, (Number(o.paid) || 0) + Math.round(a)));
      write(K.orders, all);
      return o;
    },
  };

  /* ============================================================
     مشتریان عمده
     ============================================================ */
  var buyers = {
    list: function () {
      var id = me();
      var os = orders.list();
      var map = {};

      os.forEach(function (o) {
        var key = (o.buyerPhone || o.buyerName || 'x').trim();
        if (!map[key]) {
          map[key] = {
            key: key,
            name: o.buyerName,
            phone: o.buyerPhone,
            company: o.buyerCompany,
            orders: 0,
            total: 0,
            paid: 0,
            last: 0,
            lastDate: '',
          };
        }
        var b = map[key];
        b.orders++;
        b.total += Number(o.total) || 0;
        b.paid += Number(o.paid) || 0;
        if (o.at > b.last) { b.last = o.at; b.lastDate = o.date; }
        if (o.buyerCompany && !b.company) b.company = o.buyerCompany;
      });

      /* یادداشت‌های دستی فروشنده */
      var notes = read(K.buyers, []).filter(function (n) { return n.sellerId === id; });
      notes.forEach(function (n) {
        if (map[n.key]) {
          map[n.key].note = n.note;
          map[n.key].credit = Number(n.credit) || 0;
          map[n.key].tag = n.tag || '';
        }
      });

      return Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return b.total - a.total; });
    },

    /** ثبت یادداشت و اعتبار برای یک مشتری */
    setNote: function (key, data) {
      var id = me();
      var all = read(K.buyers, []);
      var i = all.findIndex(function (n) { return n.sellerId === id && n.key === key; });
      var rec = {
        sellerId: id,
        key: key,
        note: String(data.note || '').trim(),
        credit: Math.max(0, Number(toEn(data.credit)) || 0),
        tag: data.tag || '',
      };
      if (i < 0) all.push(rec); else all[i] = rec;
      write(K.buyers, all);
      return rec;
    },
  };

  /* ============================================================
     آمار و گزارش
     ============================================================ */
  function stats() {
    var ps = products.list();
    var os = orders.list();
    var rs = rfq.list();

    var revenue = 0, paid = 0, pending = 0, delivered = 0, units = 0;
    os.forEach(function (o) {
      if (o.status === 'canceled') return;
      revenue += Number(o.total) || 0;
      paid += Number(o.paid) || 0;
      units += Number(o.count) || 0;
      if (o.status === 'delivered') delivered++;
      if (o.status === 'pending') pending++;
    });

    var stockValue = 0;
    ps.forEach(function (p) { stockValue += (Number(p.price) || 0) * (Number(p.stock) || 0); });

    var answered = rs.filter(function (r) { return r.status !== 'open'; }).length;
    var accepted = rs.filter(function (r) { return r.status === 'accepted'; }).length;

    return {
      products: ps.length,
      active: ps.filter(function (p) { return p.status === 'active'; }).length,
      lowStock: products.lowStock().length,
      outOfStock: products.outOfStock().length,
      stockValue: stockValue,

      orders: os.length,
      pendingOrders: pending,
      deliveredOrders: delivered,
      revenue: revenue,
      paid: paid,
      unpaid: Math.max(0, revenue - paid),
      units: units,
      avgOrder: os.length ? Math.round(revenue / os.length) : 0,

      rfq: rs.length,
      rfqOpen: rfq.unread(),
      rfqRate: rs.length ? Math.round(answered / rs.length * 100) : 0,
      rfqWin: answered ? Math.round(accepted / answered * 100) : 0,

      buyers: buyers.list().length,
    };
  }

  /** درآمد ۱۲ ماه — برای نمودار */
  function chart() {
    var os = orders.list();
    var out = [];
    var now = new Date();

    for (var i = 11; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      var sum = 0, n = 0;
      os.forEach(function (o) {
        if (o.status === 'canceled') return;
        if (o.at >= d.getTime() && o.at < next.getTime()) {
          sum += Number(o.total) || 0;
          n++;
        }
      });
      var label = '';
      try { label = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(d); }
      catch (e) { label = String(d.getMonth() + 1); }
      out.push({ label: label, value: sum, count: n });
    }
    return out;
  }

  /** پرفروش‌ترین کالاها */
  function topProducts(limit) {
    return products.list()
      .slice()
      .sort(function (a, b) { return (b.sold || 0) - (a.sold || 0); })
      .slice(0, limit || 5);
  }

  /* ============================================================
     در دسترس گذاشتن
     ============================================================ */
  window.DPWStore = {
    K: K,
    fa: fa,
    money: money,
    toEn: toEn,
    nowFa: nowFa,
    me: me,
    profile: profile,

    products: products,
    rfq: rfq,

    /* وضعیت تأیید — پنل از این برای نمایش هشدار استفاده می‌کند */
    myStatus: myStatus,
    can: can,
    STATUS_FA: STATUS_FA,
    orders: orders,
    buyers: buyers,

    stats: stats,
    chart: chart,
    topProducts: topProducts,

    defaultTiers: defaultTiers,
    priceFor: priceFor,
    maxDiscount: maxDiscount,

    read: read,
    write: write,
  };
})();
