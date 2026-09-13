/* ============================================================
   دیجی‌پوش — سیاست‌گذاری فروش
   ------------------------------------------------------------
   دو نوع سیاست، هر دو زمان‌دار:

   ۱. تخفیف فروشنده  — روی محصول‌های انتخابی، در بازه‌ی زمانی
   ۲. کمیسیون ادمین  — کاهش نرخ کمیسیون برای فروشگاه یا محصول

   هر دو خودکار در بازه‌ی زمانی فعال و پس از آن بی‌اثر می‌شوند.
   ============================================================ */
'use strict';

(function () {
  var K_SALE = 'dp_sales';        // تخفیف‌های فروشنده
  var K_COMM = 'dp_commissions';  // سیاست‌های کمیسیون ادمین

  var read = function (k) { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(k));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; } };
  var write = function (k, v) {
    localStorage.setItem(k, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:promo'));
  };

  var uid = function (p) {
    return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };

  /* عدد با جداکننده‌ی هزارگان — «۱٬۲۵۰٬۰۰۰» به‌جای «۱۲۵۰۰۰۰».
     خواندن قیمت بدون این جداکننده تقریباً ناممکن است. */
  var money = function (n) {
    return fa(Math.round(Number(n) || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  /*
   * ارقام فارسی/عربی → انگلیسی، و حذف جداکننده‌ی هزارگان.
   *
   * سایت قیمت را «۵۰۰٬۰۰۰» نشان می‌دهد، پس کاربر همان را کپی
   * می‌کند و در فرم می‌گذارد. اگر نپذیریم، پیام «عدد نامعتبر»
   * می‌گیرد در حالی که دقیقاً همان چیزی را نوشته که نمایش
   * داده‌ایم. صفحه‌کلید ایرانی گاهی ارقام عربی هم می‌فرستد.
   */
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var toEn = function (s) {
    return String(s == null ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); })
      .replace(/[٬,\u066C\u2009\u202F]/g, '')
      .replace(/٫/g, '.')
      .trim();
  };

  /* ============================================================
     تاریخ — ورودی <input type="date"> میلادی است،
     ولی برای نمایش به شمسی تبدیل می‌شود.
     ============================================================ */
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  function faDate(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('fa-IR').format(new Date(iso + 'T00:00:00'));
    } catch (e) { return iso; }
  }

  /** آیا امروز داخل بازه است؟ */
  function inRange(from, to) {
    var t = todayISO();
    if (from && t < from) return false;
    if (to && t > to) return false;
    return true;
  }

  /** وضعیت یک سیاست: در انتظار / فعال / پایان‌یافته */
  function statusOf(r) {
    if (r.off) return 'paused';
    var t = todayISO();
    if (r.from && t < r.from) return 'soon';
    if (r.to && t > r.to) return 'ended';
    return 'live';
  }

  var STATUS_FA = {
    live:   { label: 'فعال',        cls: 'b-success' },
    soon:   { label: 'در انتظار شروع', cls: 'b-info' },
    ended:  { label: 'پایان‌یافته',  cls: 'b-gray' },
    paused: { label: 'متوقف',       cls: 'b-warning' },
  };

  /* ============================================================
     تخفیف فروشنده
     ============================================================ */
  var sales = {
    /** همه‌ی تخفیف‌های یک فروشنده */
    list: function (sellerId) {
      return read(K_SALE)
        .filter(function (r) { return r.sellerId === sellerId; })
        .reverse();
    },

    add: function (sellerId, data) {
      var pct = Number(toEn(data.percent));
      if (!(pct > 0 && pct <= 90)) throw new Error('درصد تخفیف باید بین ۱ تا ۹۰ باشد.');

      /* سقفی که مدیر گذاشته */
      var LIM = adminLimits(sellerId);
      if (LIM.maxDiscount && pct > LIM.maxDiscount) {
        throw new Error('مدیر سایت برای فروشگاه شما سقف تخفیف '
          + fa(LIM.maxDiscount) + ' درصد گذاشته است.');
      }
      if (!data.from || !data.to) throw new Error('تاریخ شروع و پایان را مشخص کنید.');
      if (data.to < data.from) throw new Error('تاریخ پایان نمی‌تواند پیش از شروع باشد.');

      var scope = data.scope === 'all' ? 'all' : 'some';
      if (scope === 'some' && (!data.products || !data.products.length)) {
        throw new Error('حداقل یک محصول انتخاب کنید.');
      }

      var all = read(K_SALE);
      all.push({
        id: uid('sale'),
        sellerId: sellerId,
        title: (data.title || '').trim() || 'تخفیف ویژه',
        percent: pct,
        scope: scope,
        products: scope === 'all' ? [] : data.products.map(String),
        from: data.from,
        to: data.to,
        off: false,
        created: todayISO(),
      });
      write(K_SALE, all);
      return true;
    },

    toggle: function (id) {
      var all = read(K_SALE);
      var r = all.find(function (x) { return x.id === id; });
      if (r) { r.off = !r.off; write(K_SALE, all); }
      return r ? !r.off : false;
    },

    remove: function (id) {
      write(K_SALE, read(K_SALE).filter(function (r) { return r.id !== id; }));
    },

    /** تخفیف فعال یک محصول — بیشترین درصد برنده است */
    forProduct: function (productId, sellerId) {
      var best = null;
      read(K_SALE).forEach(function (r) {
        if (r.sellerId !== sellerId || r.off) return;
        if (!inRange(r.from, r.to)) return;
        if (r.scope === 'some' && r.products.indexOf(String(productId)) < 0) return;
        if (!best || r.percent > best.percent) best = r;
      });
      return best;
    },

    /** قیمت پس از تخفیف */
    priceOf: function (product) {
      var d = this.forProduct(product.id, product.sellerId);
      var base = Number(product.price) || 0;
      if (!d) return { price: base, old: null, percent: 0, title: '' };
      var off = Math.round(base * d.percent / 100);
      return {
        price: base - off, old: base, percent: d.percent,
        title: d.title, saved: off,
      };
    },
  };



  /* ============================================================
     سقف اختیاری که مدیر برای فروشنده گذاشته
     ------------------------------------------------------------
     مدیر در پرونده‌ی هر فروشگاه می‌تواند بگوید «این فروشنده
     حق ندارد بیش از فلان درصد تخفیف بدهد» یا «اصلاً حق ساخت
     کد تخفیف ندارد». اینجا آن قانون اجرا می‌شود — نه فقط در
     ظاهر پنل، بلکه در نقطه‌ای که داده واقعاً نوشته می‌شود.
     ============================================================ */
  function adminLimits(sellerId) {
    var u = null;
    try {
      var users = JSON.parse(localStorage.getItem('dp_users'));
      if (Array.isArray(users)) {
        u = users.find(function (x) {
          return x && String(x.id) === String(sellerId);
        });
      }
    } catch (e) { /* داده‌ی خراب = بدون محدودیت */ }
    return {
      maxDiscount: Number(u && u.maxDiscount) || 0,
      noCoupons: !!(u && u.noCoupons),
    };
  }

  /* ============================================================
     کد تخفیف فروشنده
     ------------------------------------------------------------
     تفاوتش با «تخفیف فروشنده» بالا:

       تخفیف     → خودکار روی قیمت می‌نشیند، مشتری کاری نمی‌کند
       کد تخفیف  → مشتری باید کد را در سبد بنویسد تا اعمال شود

     هر کد چند شرط دارد و همه باید برقرار باشند:
       • بازه‌ی زمانی
       • حداقل مبلغ خرید از آن فروشنده
       • حداقل تعداد کالا
       • سقف تخفیف (برای کد درصدی)
       • سقف تعداد استفاده — کل، و برای هر مشتری
       • دامنه: همه‌ی کالاها یا فقط چند کالا
       • فقط برای اولین خرید مشتری

     دو نوع کد:
       percent → درصدی، با امکان سقف مبلغ
       amount  → مبلغ ثابت
       ship    → ارسال رایگان
     ============================================================ */

  /** نویسه‌های مجاز کد — حرف‌های گنگ (I,O,0,1) عمداً نیستند */
  var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  /** ساخت کد تصادفی خوانا */
  function randomCode(len) {
    var out = '';
    for (var i = 0; i < (len || 8); i++) {
      out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return out;
  }

  /**
   * یکسان‌سازی کد نوشته‌شده.
   * مشتری ممکن است با حروف کوچک، فاصله، خط تیره یا حتی ارقام
   * فارسی بنویسد. همه به یک شکل درمی‌آیند.
   */
  function normCode(v) {
    return toEn(String(v == null ? '' : v))
      .toUpperCase()
      .replace(/[\s\-_.]/g, '')
      .slice(0, 24);
  }

  var K_CODE = 'dp_coupons';       // کدهای تخفیف
  var K_USED = 'dp_coupon_uses';   // تاریخچه‌ی استفاده

  var coupons = {

    /** همه‌ی کدهای یک فروشنده */
    list: function (sellerId) {
      return read(K_CODE)
        .filter(function (r) { return r.sellerId === sellerId; })
        .reverse();
    },

    /** پیشنهاد یک کد یکتا */
    suggest: function () {
      var all = read(K_CODE);
      for (var i = 0; i < 40; i++) {
        var c = randomCode(8);
        var taken = all.some(function (r) { return r.code === c; });
        if (!taken) return c;
      }
      return randomCode(10);
    },

    /* ---------- ساخت کد ---------- */
    add: function (sellerId, data) {
      if (!sellerId) throw new Error('ابتدا وارد حساب فروشندگی شوید.');

      /* اجازه‌ای که مدیر داده یا نداده */
      var LIM = adminLimits(sellerId);
      if (LIM.noCoupons) {
        throw new Error('مدیر سایت فعلاً امکان ساخت کد تخفیف را '
          + 'برای فروشگاه شما بسته است. با پشتیبانی تماس بگیرید.');
      }

      var code = normCode(data.code);
      if (code.length < 4) throw new Error('کد باید دست‌کم چهار نویسه باشد.');
      if (code.length > 24) throw new Error('کد نباید بیشتر از ۲۴ نویسه باشد.');
      if (!/^[A-Z0-9]+$/.test(code)) {
        throw new Error('کد فقط می‌تواند حرف انگلیسی و رقم داشته باشد.');
      }

      var all = read(K_CODE);
      if (all.some(function (r) { return r.code === code; })) {
        throw new Error('کد «' + code + '» قبلاً ساخته شده. کد دیگری بنویسید.');
      }

      var kind = ['percent', 'amount', 'ship', 'gift'].indexOf(data.kind) > -1
        ? data.kind : 'percent';

      var value = Number(toEn(data.value)) || 0;

      /* مزیت دلخواه — وقتی هیچ‌کدام از گزینه‌ها آن چیزی نیست
         که فروشنده می‌خواهد. مثلاً «یک جفت جوراب هدیه» یا
         «بسته‌بندی کادویی رایگان». */
      var perk = '';
      if (kind === 'gift') {
        perk = String(data.perk || '').replace(/[<>&"']/g, '').trim().slice(0, 60);
        if (perk.length < 3) {
          throw new Error('توضیح مزیت را بنویسید — دست‌کم سه حرف.');
        }
        /* مزیت دلخواه می‌تواند تخفیف مبلغی هم داشته باشد یا نداشته باشد */
        if (value < 0) value = 0;
      } else if (kind === 'percent') {
        if (!(value > 0 && value <= 90)) {
          throw new Error('درصد تخفیف باید بین ۱ تا ۹۰ باشد.');
        }
        if (LIM.maxDiscount && value > LIM.maxDiscount) {
          throw new Error('مدیر سایت برای فروشگاه شما سقف تخفیف '
            + fa(LIM.maxDiscount) + ' درصد گذاشته است.');
        }
      } else if (kind === 'amount') {
        if (!(value > 0)) throw new Error('مبلغ تخفیف را بنویسید.');
      } else {
        value = 0;   /* ارسال رایگان مقدار ندارد */
      }

      if (!data.from || !data.to) throw new Error('تاریخ شروع و پایان را مشخص کنید.');
      if (data.to < data.from) throw new Error('تاریخ پایان نمی‌تواند پیش از شروع باشد.');

      var scope = data.scope === 'some' ? 'some' : 'all';
      if (scope === 'some' && (!data.products || !data.products.length)) {
        throw new Error('دست‌کم یک کالا برای این کد انتخاب کنید.');
      }

      var minAmount = Math.max(0, Number(toEn(data.minAmount)) || 0);
      var minQty    = Math.max(0, Math.floor(Number(toEn(data.minQty)) || 0));
      var maxOff    = Math.max(0, Number(toEn(data.maxOff)) || 0);
      var maxUses   = Math.max(0, Math.floor(Number(toEn(data.maxUses)) || 0));
      var perUser   = Math.max(0, Math.floor(Number(toEn(data.perUser)) || 0));

      /* سقف تخفیف فقط برای کد درصدی معنا دارد */
      if (kind !== 'percent') maxOff = 0;

      var rec = {
        id: uid('cpn'),
        sellerId: sellerId,
        code: code,
        title: (data.title || '').trim().slice(0, 60) || 'کد تخفیف',
        kind: kind,
        value: value,
        perk: perk,
        scope: scope,
        products: scope === 'all' ? [] : data.products.map(String),
        from: data.from,
        to: data.to,
        minAmount: minAmount,
        minQty: minQty,
        maxOff: maxOff,
        maxUses: maxUses,          /* ۰ = بی‌نهایت */
        perUser: perUser || 1,     /* پیش‌فرض: هر مشتری یک بار */
        firstOnly: !!data.firstOnly,
        note: (data.note || '').trim().slice(0, 200),
        off: false,
        used: 0,
        created: todayISO(),
      };

      all.push(rec);
      write(K_CODE, all);
      return rec;
    },

    /* ---------- ویرایش سبک ---------- */
    toggle: function (id) {
      var all = read(K_CODE);
      var r = all.find(function (x) { return x.id === id; });
      if (r) { r.off = !r.off; write(K_CODE, all); }
      return r ? !r.off : false;
    },

    remove: function (id) {
      write(K_CODE, read(K_CODE).filter(function (r) { return r.id !== id; }));
    },

    /** پیدا کردن کد با متن نوشته‌شده */
    byCode: function (raw) {
      var c = normCode(raw);
      if (!c) return null;
      return read(K_CODE).find(function (r) { return r.code === c; }) || null;
    },

    /** چند بار این مشتری از این کد استفاده کرده؟ */
    usesBy: function (couponId, userKey) {
      if (!userKey) return 0;
      return read(K_USED).filter(function (u) {
        return u.couponId === couponId && u.user === userKey;
      }).length;
    },

    /** تاریخچه‌ی استفاده‌ی یک کد — برای پنل فروشنده */
    history: function (couponId) {
      return read(K_USED)
        .filter(function (u) { return u.couponId === couponId; })
        .reverse();
    },

    /* ============================================================
       بررسی کد روی سبد
       ------------------------------------------------------------
       ورودی: کد نوشته‌شده + وضعیت سبد
       خروجی: { ok, error, coupon, off, freeShip, … }

       تمام شرط‌ها اینجا یک‌جا بررسی می‌شوند تا هیچ مسیری
       نتواند دورشان بزند.
       ============================================================ */
    check: function (raw, ctx) {
      ctx = ctx || {};
      var rows = ctx.rows || [];
      var userKey = ctx.user || '';

      var c = this.byCode(raw);
      if (!c) return { ok: false, error: 'چنین کدی وجود ندارد.' };

      if (c.off) {
        return { ok: false, error: 'این کد فعلاً غیرفعال است.' };
      }

      /* ---------- بازه‌ی زمانی ---------- */
      var st = statusOf(c.from, c.to, c.off);
      if (st === 'soon') {
        return { ok: false, error: 'این کد از ' + faDate(c.from) + ' فعال می‌شود.' };
      }
      if (st === 'ended') {
        return { ok: false, error: 'مهلت این کد در ' + faDate(c.to) + ' تمام شده.' };
      }

      /* ---------- کالاهای همان فروشنده ---------- */
      var mine = rows.filter(function (r) {
        return String(r.sellerId) === String(c.sellerId);
      });

      if (!mine.length) {
        return {
          ok: false,
          error: 'این کد برای فروشگاه دیگری است و روی کالاهای سبد شما اثر ندارد.',
        };
      }

      /* اگر کد فقط چند کالا را پوشش می‌دهد */
      if (c.scope === 'some') {
        mine = mine.filter(function (r) {
          return c.products.indexOf(String(r.productId)) > -1;
        });
        if (!mine.length) {
          return {
            ok: false,
            error: 'این کد فقط روی چند کالای مشخص کار می‌کند که در سبد شما نیست.',
          };
        }
      }

      var base = mine.reduce(function (a, r) { return a + (Number(r.total) || 0); }, 0);
      var qty  = mine.reduce(function (a, r) { return a + (Number(r.qty) || 0); }, 0);

      /* ---------- حداقل مبلغ ---------- */
      if (c.minAmount && base < c.minAmount) {
        var gap = c.minAmount - base;
        return {
          ok: false,
          error: 'برای این کد باید دست‌کم ' + money(c.minAmount) +
                 ' تومان از این فروشگاه بخرید — ' + money(gap) + ' تومان مانده.',
          shortBy: gap,
        };
      }

      /* ---------- حداقل تعداد ---------- */
      if (c.minQty && qty < c.minQty) {
        return {
          ok: false,
          error: 'این کد از ' + fa(c.minQty) + ' عدد به بالا کار می‌کند — ' +
                 'الان ' + fa(qty) + ' عدد در سبد دارید.',
          shortQty: c.minQty - qty,
        };
      }

      /* ---------- سقف استفاده‌ی کلی ---------- */
      if (c.maxUses && (c.used || 0) >= c.maxUses) {
        return { ok: false, error: 'ظرفیت این کد پر شده است.' };
      }

      /* ---------- سقف استفاده‌ی هر مشتری ---------- */
      if (userKey && c.perUser) {
        var mineUses = this.usesBy(c.id, userKey);
        if (mineUses >= c.perUser) {
          return {
            ok: false,
            error: c.perUser === 1
              ? 'شما یک بار از این کد استفاده کرده‌اید.'
              : 'شما ' + fa(c.perUser) + ' بار از این کد استفاده کرده‌اید.',
          };
        }
      }

      /* ---------- فقط اولین خرید ---------- */
      if (c.firstOnly && ctx.hasOrders) {
        return { ok: false, error: 'این کد فقط برای نخستین خرید است.' };
      }

      /* ---------- محاسبه‌ی تخفیف ---------- */
      var off = 0;
      var freeShip = false;

      var perk = '';

      if (c.kind === 'percent') {
        off = Math.round(base * c.value / 100);
        if (c.maxOff && off > c.maxOff) off = c.maxOff;
      } else if (c.kind === 'amount') {
        off = c.value;
      } else if (c.kind === 'gift') {
        /* مزیت دلخواه — ممکن است تخفیف مبلغی هم داشته باشد */
        perk = c.perk || '';
        off = Number(c.value) || 0;
      } else {
        freeShip = true;
      }

      /* تخفیف هرگز از مبلغ خرید بیشتر نمی‌شود، وگرنه جمع سبد
         منفی می‌شد و سایت به مشتری بدهکار می‌شد */
      if (off > base) off = base;
      if (off < 0) off = 0;

      return {
        ok: true,
        coupon: c,
        off: off,
        freeShip: freeShip,
        perk: perk,
        base: base,
        qty: qty,
        sellerId: c.sellerId,
        label: coupons.describe(c),
      };
    },

    /** توضیح خوانا از یک کد — برای نمایش به مشتری و فروشنده */
    describe: function (c) {
      if (!c) return '';
      if (c.kind === 'ship') return 'ارسال رایگان';
      if (c.kind === 'gift') {
        var g = c.perk || 'مزیت ویژه';
        return c.value > 0 ? g + ' + ' + money(c.value) + ' تومان تخفیف' : g;
      }
      if (c.kind === 'amount') return money(c.value) + ' تومان تخفیف';
      var t = fa(c.value) + '٪ تخفیف';
      if (c.maxOff) t += ' تا سقف ' + money(c.maxOff) + ' تومان';
      return t;
    },

    /** شرط‌های یک کد، به زبان ساده */
    terms: function (c) {
      var out = [];
      if (!c) return out;
      if (c.minAmount) out.push('حداقل خرید ' + money(c.minAmount) + ' تومان');
      if (c.minQty) out.push('حداقل ' + fa(c.minQty) + ' عدد');
      if (c.scope === 'some') out.push('فقط روی ' + fa(c.products.length) + ' کالای مشخص');
      if (c.firstOnly) out.push('فقط نخستین خرید');
      if (c.maxUses) out.push('ظرفیت ' + fa(c.maxUses) + ' بار');
      if (c.perUser > 1) out.push('هر مشتری تا ' + fa(c.perUser) + ' بار');
      return out;
    },

    /* ---------- ثبت استفاده، هنگام نهایی‌شدن سفارش ---------- */
    redeem: function (couponId, info) {
      var all = read(K_CODE);
      var c = all.find(function (x) { return x.id === couponId; });
      if (!c) return false;

      c.used = (c.used || 0) + 1;
      write(K_CODE, all);

      var uses = read(K_USED);
      uses.push({
        id: uid('use'),
        couponId: couponId,
        code: c.code,
        sellerId: c.sellerId,
        user: (info && info.user) || '',
        orderId: (info && info.orderId) || '',
        off: (info && info.off) || 0,
        date: todayISO(),
        at: Date.now(),
      });
      write(K_USED, uses);
      return true;
    },

    /** آمار یک کد — برای پنل فروشنده */
    stats: function (couponId) {
      var uses = read(K_USED).filter(function (u) { return u.couponId === couponId; });
      return {
        count: uses.length,
        totalOff: uses.reduce(function (a, u) { return a + (Number(u.off) || 0); }, 0),
        buyers: new Set(uses.map(function (u) { return u.user; })).size,
      };
    },

    normCode: normCode,
    randomCode: randomCode,
  };

  /* ============================================================
     سیاست کمیسیون ادمین
     ============================================================ */
  var commissions = {
    list: function () { return read(K_COMM).slice().reverse(); },

    add: function (data) {
      var rate = Number(toEn(data.rate));
      if (!(rate >= 0 && rate <= 100)) throw new Error('نرخ کمیسیون باید بین ۰ تا ۱۰۰ باشد.');
      if (!data.from || !data.to) throw new Error('تاریخ شروع و پایان را مشخص کنید.');
      if (data.to < data.from) throw new Error('تاریخ پایان نمی‌تواند پیش از شروع باشد.');
      if (!data.sellerId) throw new Error('فروشگاه را انتخاب کنید.');

      var all = read(K_COMM);
      all.push({
        id: uid('comm'),
        title: (data.title || '').trim() || 'کمیسیون ویژه',
        sellerId: data.sellerId,
        productId: data.productId || '',      // خالی = همه‌ی محصولات آن فروشگاه
        rate: rate,
        from: data.from,
        to: data.to,
        off: false,
        created: todayISO(),
      });
      write(K_COMM, all);
      return true;
    },

    toggle: function (id) {
      var all = read(K_COMM);
      var r = all.find(function (x) { return x.id === id; });
      if (r) { r.off = !r.off; write(K_COMM, all); }
      return r ? !r.off : false;
    },

    remove: function (id) {
      write(K_COMM, read(K_COMM).filter(function (r) { return r.id !== id; }));
    },

    /** نرخ مؤثر کمیسیون — کمترین نرخ به سود فروشنده برنده است */
    rateFor: function (sellerId, productId, fallback) {
      var base = Number(fallback);
      if (isNaN(base)) base = 10;
      var best = base;

      read(K_COMM).forEach(function (r) {
        if (r.sellerId !== sellerId || r.off) return;
        if (!inRange(r.from, r.to)) return;
        if (r.productId && String(r.productId) !== String(productId)) return;
        if (r.rate < best) best = r.rate;
      });

      return best;
    },
  };

  window.DPPromo = {
    sales: sales,
    coupons: coupons,
    commissions: commissions,
    statusOf: statusOf,
    STATUS_FA: STATUS_FA,
    inRange: inRange,
    todayISO: todayISO,
    faDate: faDate,
    fa: fa,
    money: money,
    toEn: toEn,
  };
})();
