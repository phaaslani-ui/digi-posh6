/* ============================================================
   دیجی‌پوش — قاب «صدرنشین»
   ------------------------------------------------------------
   فروشگاهی که بسته‌ی «صدرنشین دیجی‌پوش» را گرفته، در
   حساب کاربری همه‌ی مشتری‌ها در یک قاب اختصاصی دیده می‌شود.

   در هر لحظه فقط یک فروشگاه می‌تواند صدرنشین باشد؛
   همین کمیاب بودن، ارزش این بسته را می‌سازد.

   قاب در سه جا نشان داده می‌شود:
     • حساب کاربری  — بالای تب‌ها، پررنگ‌ترین حالت
     • سبد خرید     — نوار باریک بالای سبد
     • صفحه‌ی اصلی  — پیش از ویترین فروشندگان

   شمارش معکوس زنده دارد تا حس «فرصت محدود» بدهد.
   ============================================================ */
'use strict';

(function () {
  if (!window.DPBoost) return;

  var B = window.DPBoost;
  var PAGE = (document.body && document.body.dataset.dpPage) || 'home';
  var deep = ['woman', 'man', 'kids', 'teen'].indexOf(PAGE) > -1;
  var UP = deep ? '../' : './';

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };
  var pad = function (n) { return fa(String(n).padStart(2, '0')); };
  var money = function (n) {
    return fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var users = function () {
    try { return (window.DPSafe ? DPSafe.sellers() : []); } catch (e) { return []; }
  };

  var products = function () {
    try { return (window.DPSafe ? DPSafe.products() : []); } catch (e) { return []; }
  };

  var reviews = function () {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem('dp_reviews'));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };

  /* ============================================================
     آیا بیننده، صاحب همین فروشگاه است؟
     ------------------------------------------------------------
     شمارش معکوس «۲ روز مانده» برای مشتری استرس‌آور است و
     حس می‌دهد فروشگاه موقتی است. پس فقط خودِ فروشنده
     (یا مدیر سایت) آن را می‌بیند.
     ============================================================ */
  function isOwner(sellerId) {
    if (!sellerId) return false;

    /* مدیر سایت همه چیز را می‌بیند */
    try {
      if (localStorage.getItem('dp_admin_session')) return true;
    } catch (e) { /* حافظه در دسترس نیست */ }

    /* نشست فروشنده */
    try {
      var s = JSON.parse(localStorage.getItem('dp_session'));
      if (s && String(s.user_id) === String(sellerId)) return true;
    } catch (e) { /* نشستی نیست */ }

    /*
     * داخل پنل فروشنده هم که باشد، خودش است.
     *
     * پیش‌تر اینجا `DPStore.session()` صدا زده می‌شد که اصلاً
     * وجود ندارد. چون داخل `if` با `&&` محافظت شده بود، خطایی
     * نمی‌داد — فقط بی‌صدا رد می‌شد و این تشخیص هرگز کار
     * نمی‌کرد. تابع درست `auth.isLoggedIn` و کلید نشست است.
     */
    try {
      if (window.DPStore && DPStore.auth && DPStore.auth.isLoggedIn()) {
        var raw = localStorage.getItem('dp_session');
        var cur = raw ? JSON.parse(raw) : null;
        if (cur && String(cur.user_id) === String(sellerId)) return true;
      }
    } catch (e) { /* بی‌اهمیت */ }

    return false;
  }

  /* ============================================================
     داده‌ی فروشگاه صدرنشین
     ============================================================ */
  function data() {
    var rec = B.spotlight();
    if (!rec) return null;

    var s = users().find(function (u) { return u.id === rec.sellerId; });
    if (!s) return null;

    /* فروشگاه معلق یا ردشده نباید صدرنشین بماند */
    var st = s.status || (s.isVerified ? 'approved' : 'pending');
    if (st === 'rejected' || st === 'suspended') return null;

    var ps = products().filter(function (p) {
      return p.sellerId === s.id && p.status === 'active';
    });

    /* امتیاز واقعی */
    var rate = null;
    if (window.DPReviews && DPReviews.storeRatingsMap) {
      rate = DPReviews.storeRatingsMap()[s.id] || null;
    }

    /* ---------- نظرها ----------
       هم خلاصه‌ی امتیاز، هم چند نظر واقعی برای نمایش.
       نظرهای مربوط به خود فروشگاه و کالاهایش با هم. */
    var myProd = {};
    ps.forEach(function (p) { myProd[String(p.id)] = p.name || 'کالا'; });

    var revs = reviews().filter(function (r) {
      if (r.hidden) return false;
      if (r.kind === 'store') return String(r.targetId) === String(s.id);
      if (r.kind === 'product') {
        return myProd[String(r.targetId)] ||
               (r.sellerId && String(r.sellerId) === String(s.id));
      }
      return false;
    });

    /* پراکندگی ستاره‌ها و درصد رضایت */
    var spread = [0, 0, 0, 0, 0], rsum = 0, happy = 0, buyers = {};
    revs.forEach(function (r) {
      var n = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      spread[n - 1]++;
      rsum += Number(r.rating) || 0;
      if (n >= 4) happy++;
      if (r.userId) buyers[r.userId] = 1;
    });

    /* اگر امتیاز از DPReviews نیامد، خودمان حساب می‌کنیم */
    if (!rate && revs.length) {
      rate = { avg: Math.round(rsum / revs.length * 10) / 10, count: revs.length };
    }

    /* سه نظر تازه و مثبت — برای نمایش زیر نام */
    var quotes = revs
      .filter(function (r) { return String(r.text || '').trim().length > 8; })
      .sort(function (a, b) {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0) ||
               (b.createdAt || 0) - (a.createdAt || 0);
      })
      .slice(0, 3)
      .map(function (r) {
        return {
          name: r.userName || 'خریدار دیجی‌پوش',
          rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0))),
          text: String(r.text || '').trim(),
          about: r.kind === 'store' ? 'درباره‌ی فروشگاه'
                                    : (myProd[String(r.targetId)] || 'کالا'),
          date: r.date || '',
        };
      });

    var reviewInfo = revs.length ? {
      count: revs.length,
      buyers: Object.keys(buyers).length || revs.length,
      spread: spread,
      happy: Math.round(happy / revs.length * 100),
      quotes: quotes,
    } : null;

    /* ارزان‌ترین کالای فروشگاه — قلاب خوبی برای کلیک است */
    var low = null;
    for (var i = 0; i < ps.length; i++) {
      var pr = Number(ps[i].price) || 0;
      if (pr > 0 && (low === null || pr < low)) low = pr;
    }

    /* آیا تخفیف فعالی دارد؟ */
    var offMax = 0;
    if (window.DPPromo && DPPromo.sales && DPPromo.sales.priceOf) {
      for (var j = 0; j < ps.length; j++) {
        try {
          var sale = DPPromo.sales.priceOf(ps[j]);
          if (sale && sale.percent > offMax) offMax = sale.percent;
        } catch (e) { /* بی‌اهمیت */ }
      }
    }

    /* ---------- کالاها با قیمت و تخفیف واقعی ----------
       تخفیف‌دارها اول می‌آیند؛ چون همان‌ها کلیک می‌گیرند. */
    var cards = ps.map(function (pr) {
      var sale = { price: Number(pr.price) || 0, old: null, percent: 0 };
      if (window.DPPromo && DPPromo.sales && DPPromo.sales.priceOf) {
        try { sale = DPPromo.sales.priceOf(pr); } catch (e) {}
      }

      /* اگر جشنواره‌ای در کار نیست ولی خود کالا قیمت قبلی دارد،
         همان را تخفیف حساب می‌کنیم — وگرنه نوار تخفیف خالی می‌ماند. */
      if (!sale.percent) {
        var oldP = Number(pr.oldPrice || pr.old_price || pr.compareAt) || 0;
        var newP = Number(pr.price) || 0;
        if (oldP > newP && newP > 0) {
          sale = {
            price: newP,
            old: oldP,
            percent: Math.round((oldP - newP) / oldP * 100),
          };
        }
      }

      return {
        id: pr.id,
        name: pr.name || 'کالا',
        img: (pr.images || [])[0] || pr.image || pr.cover || '',
        price: sale.price,
        oldPrice: sale.percent ? sale.old : null,
        off: sale.percent || 0,
        stock: Number(pr.stock) || 0,
        cat: pr.category || '',
      };
    }).sort(function (a, b) {
      if (b.off !== a.off) return b.off - a.off;      /* تخفیف‌دار اول */
      return a.price - b.price;                        /* بعد ارزان‌تر */
    });

    /* بیشترین تخفیف — از کالاها هم خوانده می‌شود، نه فقط جشنواره */
    cards.forEach(function (c) { if (c.off > offMax) offMax = c.off; });

    /* چند کالا کم‌موجود است؟ حس فوریت می‌سازد */
    var lowStock = cards.filter(function (c) {
      return c.stock > 0 && c.stock <= 3;
    }).length;

    return {
      rec: rec,
      id: s.id,
      name: s.storeName || 'فروشگاه',
      city: s.city || '',
      desc: s.description || '',
      logo: s.logo || '',
      cover: s.cover || '',
      count: ps.length,
      rate: rate,
      reviews: reviewInfo,
      low: low,
      off: offMax,
      verified: st === 'approved',
      lowStock: lowStock,
      /* شش کالای برگزیده — تخفیف‌دارها جلوتر */
      cards: cards.slice(0, 6),
      items: ps.slice(-3).reverse(),
    };
  }

  /* ============================================================
     شمارش معکوس
     ============================================================ */
  function remain(endsAt) {
    var ms = endsAt - Date.now();
    if (ms <= 0) return null;
    return {
      d: Math.floor(ms / 86400000),
      h: Math.floor(ms / 3600000) % 24,
      m: Math.floor(ms / 60000) % 60,
      s: Math.floor(ms / 1000) % 60,
    };
  }

  function clockText(t) {
    if (!t) return '';
    if (t.d > 0) return fa(t.d) + ' روز و ' + pad(t.h) + ':' + pad(t.m);
    return pad(t.h) + ':' + pad(t.m) + ':' + pad(t.s);
  }

  /* ============================================================
     آیکون‌ها
     ============================================================ */
  var SW = 'fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  var I = {
    crown: '<path d="m4 17 1.5-9 4 4L12 5l2.5 7 4-4L20 17z"/><path d="M4.5 20h15"/>',
    star:  '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    box:   '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    pin:   '<path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
    go:    '<path d="m14 7-5 5 5 5"/>',
    cart:  '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
    truck: '<path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    shield:'<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
    bolt:  '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/>',
    check: '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/>',
    tag:   '<path d="M4 12.5V5a1 1 0 0 1 1-1h7.5L20 11.5 12.5 19z"/><circle cx="8.2" cy="8.2" r="1.3"/>',
    fire:  '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4.4-5.4-3.6-10.4-2.6 1-4.6 3.4-4.6 6 0 1-.6 1.8-1.4 1.8-.8 0-1.3-.7-1.4-1.7C5.6 12.5 6 13.9 6 15.4 6 18.6 8.4 21 12 21Z"/>',
    x:     '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };

  var svg = function (d, cls) {
    return '<svg class="' + (cls || 'sp-i') + '" viewBox="0 0 24 24" ' + SW + '>' + d + '</svg>';
  };

  /* ============================================================
     ساخت قاب
     ============================================================ */
  function build(d, mode) {
    var t = remain(d.rec.endsAt);
    var url = UP + 'store.html?id=' + encodeURIComponent(d.id);

    /* ---------- نوار باریک — سبد خرید ---------- */
    if (mode === 'slim') {
      return '' +
        '<a class="sp-slim" href="' + url + '" data-sp-go="' + esc(d.id) + '">' +
          '<span class="sp-slim-crown">' + svg(I.crown, 'sp-i') + '</span>' +
          '<span class="sp-slim-txt">' +
            '<b>صدرنشین این هفته:</b> ' + esc(d.name) +
          '</span>' +
          (t && isOwner(d.id)
            ? '<span class="sp-slim-time num">' + clockText(t) + '</span>' : '') +
          svg(I.go, 'sp-i sp-i-sm') +
        '</a>';
    }

    /* ============================================================
       بنر کامل — بزرگ، هیجان‌انگیز، حرفه‌ای
       ------------------------------------------------------------
       سه بخش روشن:
         ۱. سر بنر  — شعار، نام فروشگاه، نشان تخفیف، دکمه
         ۲. نوار اعتماد — امتیاز، تعداد کالا، ضمانت
         ۳. شبکه‌ی کالاها — با قیمت و تخفیف هر کدام
       ============================================================ */
    var logo = d.logo
      ? '<img src="' + esc(d.logo) + '" alt="" loading="lazy" />'
      : '<span>' + esc((d.name || '؟').trim()[0]) + '</span>';

    /* ---------- شعار ----------
       اگر فروشگاه توضیح دارد، همان؛ وگرنه یک شعار مناسب. */
    var slogan = d.desc
      || (d.off ? 'فرصت محدود برای خرید با بهترین قیمت'
                : 'برگزیده‌ی این هفته‌ی دیجی‌پوش');

    /* ---------- ستاره‌ها ----------
       پنج ستاره‌ی SVG که به اندازه‌ی امتیاز پر می‌شوند. */
    function starRow(v, cls) {
      var out = '<span class="' + (cls || 'sp-stars') + '" role="img" ' +
                'aria-label="امتیاز ' + fa(v) + ' از ۵">';
      for (var i = 1; i <= 5; i++) {
        var k = v >= i ? 'full' : (v >= i - 0.5 ? 'half' : 'empty');
        out += '<svg class="sp-star ' + k + '" viewBox="0 0 24 24" aria-hidden="true">' +
               '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>' +
               '</svg>';
      }
      return out + '</span>';
    }

    /* ---------- ردیف امتیاز — درست زیر نام فروشگاه ----------
       ستاره‌ها + عدد + تعداد نظر + درصد رضایت.
       چشم بعد از خواندن نام، بی‌درنگ اعتبار را می‌بیند. */
    var rv = d.reviews;
    var rateRow = d.rate
      ? '<div class="sp-rate" data-seller="' + esc(d.id) + '" data-sat>' +
          starRow(d.rate.avg) +
          '<b class="sp-rate-avg num">' + fa(d.rate.avg) + '</b>' +
          '<span class="sp-rate-sep">·</span>' +
          '<a class="sp-rate-count" href="' + url + '#reviews" ' +
            'data-sp-go="' + esc(d.id) + '">' +
            '<b class="num">' + fa(d.rate.count) + '</b> نظر' +
          '</a>' +
          (rv && rv.happy >= 60
            ? '<span class="sp-rate-happy">' + svg(I.check, 'sp-i sp-i-xs') +
              '<b class="num">٪' + fa(rv.happy) + '</b> رضایت</span>'
            : '') +
        '</div>'
      : '<div class="sp-rate sp-rate--new">' +
          starRow(0) +
          '<span class="sp-rate-none">هنوز نظری ثبت نشده — شما اولین باشید</span>' +
        '</div>';

    /* ---------- نوار نظرها ----------
       تا سه نظر واقعی خریداران، کنار هم. */
    var quoteStrip = (rv && rv.quotes.length)
      ? '<div class="sp-quotes">' +
          rv.quotes.map(function (q) {
            return '<figure class="sp-quote">' +
              '<div class="sp-quote-top">' +
                starRow(q.rating, 'sp-stars sp-stars--xs') +
                '<span class="sp-quote-who">' + esc(q.name) + '</span>' +
              '</div>' +
              '<blockquote>' + esc(q.text) + '</blockquote>' +
              '<figcaption>' + esc(q.about) + '</figcaption>' +
            '</figure>';
          }).join('') +
          '<a class="sp-quotes-all" href="' + url + '#reviews" ' +
            'data-sp-go="' + esc(d.id) + '">' +
            '<b class="num">' + fa(rv.count) + '</b>' +
            '<span>نظر خریداران</span>' +
            svg(I.go, 'sp-i sp-i-sm') +
          '</a>' +
        '</div>'
      : '';

    /* ---------- نوار تخفیف ----------
       پیش‌تر یک دایره‌ی کوچک گوشه‌ی سر بنر بود و گم می‌شد.
       حالا یک نوار تمام‌عرض جداگانه است: عدد غول‌پیکر سمت راست،
       پیام وسط، دکمه سمت چپ. یک نوار = یک پیام. */
    var offerBand = d.off
      ? '<div class="sp-offer">' +
          '<div class="sp-offer-num">' +
            '<span class="sp-offer-up">تا</span>' +
            '<b class="sp-offer-big num">' + fa(d.off) + '</b>' +
            '<span class="sp-offer-pc">٪</span>' +
          '</div>' +
          '<div class="sp-offer-txt">' +
            '<strong>تخفیف روی کالاهای این فروشگاه</strong>' +
            '<p>فرصت محدود — تا پایان صدرنشینی' +
              (d.lowStock
                ? ' · <b class="num">' + fa(d.lowStock) + '</b> کالا رو به اتمام است'
                : '') +
            '</p>' +
          '</div>' +
          '<a class="sp-offer-cta" href="' + url + '" data-sp-go="' + esc(d.id) + '">' +
            svg(I.bolt, 'sp-i sp-i-sm') +
            '<span>دیدن تخفیف‌ها</span>' +
          '</a>' +
        '</div>'
      : '<div class="sp-offer sp-offer--plain">' +
          '<div class="sp-offer-num">' + svg(I.crown, 'sp-i sp-i-lg') + '</div>' +
          '<div class="sp-offer-txt">' +
            '<strong>فروشگاه برگزیده‌ی این هفته</strong>' +
            '<p>از میان همه‌ی فروشگاه‌های دیجی‌پوش انتخاب شده است</p>' +
          '</div>' +
          '<a class="sp-offer-cta" href="' + url + '" data-sp-go="' + esc(d.id) + '">' +
            svg(I.cart, 'sp-i sp-i-sm') +
            '<span>دیدن کالاها</span>' +
          '</a>' +
        '</div>';

    /* ---------- اسلایدشو ----------
       تصویرهای کالاهای همین فروشگاه، هر ۳ ثانیه یکی.
       کنار سر بنر می‌نشیند تا جای دایره‌ی قبلی را پر کند
       ولی این بار بزرگ و گویا. */
    var pics = [];
    if (d.cover) pics.push({ img: d.cover, name: d.name, cover: true });
    d.cards.forEach(function (c) { if (c.img) pics.push(c); });
    if (!pics.length && d.logo) pics.push({ img: d.logo, name: d.name, cover: true });

    var shots = pics.length
      ? '<div class="sp-shots" data-sp-shots="' + fa(pics.length) + '">' +
          '<div class="sp-shots-stage">' +
            pics.slice(0, 6).map(function (p, i) {
              return '<figure class="sp-shot' + (i === 0 ? ' on' : '') + '">' +
                '<img src="' + esc(p.img) + '" alt="" ' +
                  (i === 0 ? '' : 'loading="lazy" ') + '/>' +
                (p.cover ? '' :
                  '<figcaption>' +
                    (p.off ? '<em class="sp-shot-off num">٪' + fa(p.off) + '</em>' : '') +
                    '<span class="sp-shot-name">' + esc(p.name) + '</span>' +
                    '<span class="sp-shot-price num">' + money(p.price) + ' تومان</span>' +
                  '</figcaption>') +
              '</figure>';
            }).join('') +
          '</div>' +
          (pics.length > 1
            ? '<div class="sp-shots-dots" role="tablist" aria-label="تصویرها">' +
                pics.slice(0, 6).map(function (p, i) {
                  return '<button class="sp-shot-dot' + (i === 0 ? ' on' : '') + '" ' +
                    'type="button" data-sp-dot="' + i + '" ' +
                    'aria-label="تصویر ' + fa(i + 1) + '"></button>';
                }).join('') +
              '</div>'
            : '') +
        '</div>'
      : '';

    /* ---------- شبکه‌ی کالاها ---------- */
    var grid = d.cards.length
      ? '<div class="sp-grid">' + d.cards.map(function (c) {
          return '<a class="sp-prod" href="' + url + '" ' +
                    'title="' + esc(c.name) + '" data-sp-go="' + esc(d.id) + '">' +
            '<span class="sp-prod-img">' +
              (c.img ? '<img src="' + esc(c.img) + '" alt="" loading="lazy" />'
                     : svg(I.box, 'sp-i')) +
              (c.off ? '<em class="sp-prod-off num">٪' + fa(c.off) + '</em>' : '') +
              (c.stock > 0 && c.stock <= 3
                ? '<em class="sp-prod-few">' + (window.DPStock
                    ? DPStock.status(c.stock).short : 'محدود') + '</em>' : '') +
            '</span>' +
            '<span class="sp-prod-name">' + esc(c.name) + '</span>' +
            '<span class="sp-prod-price num">' +
              (c.oldPrice ? '<s>' + money(c.oldPrice) + '</s>' : '') +
              money(c.price) + '<small> تومان</small>' +
            '</span>' +
          '</a>';
        }).join('') + '</div>'
      : '';

    return '' +
      '<div class="sp-banner' + (d.cover ? ' has-cover' : '') +
        (d.off ? ' has-off' : '') + '"' +
        (d.cover ? ' style="--sp-cover:url(' + JSON.stringify(d.cover) + ')"' : '') + '>' +

        /* ---------- ۱. سر بنر ---------- */
        '<div class="sp-hero">' +
          '<div class="sp-hero-in">' +

            '<span class="sp-ribbon">' + svg(I.crown, 'sp-i sp-i-sm') +
              'صدرنشین دیجی‌پوش</span>' +

            '<div class="sp-idn">' +
              '<span class="sp-logo">' + logo + '</span>' +
              '<div class="sp-idn-txt">' +
                '<h3>' + esc(d.name) + '</h3>' +
                rateRow +
                '<p class="sp-slogan">' + esc(slogan) + '</p>' +
              '</div>' +
            '</div>' +

            quoteStrip +

            '<a class="sp-cta" href="' + url + '" data-sp-go="' + esc(d.id) + '">' +
              svg(I.cart, 'sp-i sp-i-sm') +
              '<span>ورود به فروشگاه</span>' +
              svg(I.go, 'sp-i sp-i-sm') +
            '</a>' +

          '</div>' +
          shots +
        '</div>' +

        /* ---------- ۲. نوار تخفیف — تمام‌عرض، جدا و پیدا ---------- */
        offerBand +

        /* ---------- ۳. نوار اعتماد ---------- */
        '<div class="sp-trust">' +
          (rv
            ? '<span>' + svg(I.check, 'sp-i sp-i-sm') +
              '<b class="num">' + fa(rv.buyers) + '</b> خریدار نظر داده‌اند</span>'
            : '') +
          '<span>' + svg(I.box, 'sp-i sp-i-sm') +
            '<b class="num">' + fa(d.count) + '</b> کالای موجود</span>' +
          (d.low
            ? '<span>' + svg(I.tag, 'sp-i sp-i-sm') + 'از <b class="num">' +
              money(d.low) + '</b> تومان</span>' : '') +
          (d.city ? '<span>' + svg(I.pin, 'sp-i sp-i-sm') + esc(d.city) + '</span>' : '') +
          (d.verified
            ? '<span class="sp-ok">' + svg(I.shield, 'sp-i sp-i-sm') +
              'فروشنده‌ی تأییدشده</span>' : '') +
          (d.lowStock
            ? '<span class="sp-hot">' + svg(I.bolt, 'sp-i sp-i-sm') +
              '<b class="num">' + fa(d.lowStock) + '</b> کالا رو به اتمام</span>' : '') +
        '</div>' +

        /* ---------- ۳. کالاها ---------- */
        (grid
          ? '<div class="sp-shelf">' +
              '<div class="sp-shelf-head">' +
                '<strong>' + (d.off ? 'پیشنهادهای ویژه' : 'از این فروشگاه') + '</strong>' +
                '<a href="' + url + '" data-sp-go="' + esc(d.id) + '">' +
                  'دیدن همه' + svg(I.go, 'sp-i sp-i-sm') + '</a>' +
              '</div>' +
              grid +
            '</div>'
          : '') +

        /* ---------- ۴. پاورقی ----------
           شمارش معکوس فقط برای خودِ فروشنده.
           مشتری نباید ببیند «۲ روز مانده» — این حس می‌دهد که
           فروشگاه موقتی است و اعتماد را کم می‌کند. به‌جایش
           یک پیام مثبت و بی‌تاریخ می‌بیند. */
        (t
          ? (isOwner(d.id)
              ? '<div class="sp-foot sp-foot--owner">' +
                  svg(I.clock, 'sp-i sp-i-sm') +
                  '<span>تا پایان صدرنشینی <em>(فقط شما این را می‌بینید)</em></span>' +
                  '<b class="sp-clock num" data-sp-clock="' + d.rec.endsAt + '">' +
                    clockText(t) + '</b>' +
                '</div>'
              : '<div class="sp-foot">' +
                  svg(I.check, 'sp-i sp-i-sm') +
                  '<span>برگزیده‌ی دیجی‌پوش — بررسی‌شده و تأییدشده</span>' +
                  '<b class="sp-foot-note">خرید امن با ضمانت بازگشت</b>' +
                '</div>')
          : '') +
      '</div>';
  }

  /* ============================================================
     جایگذاری
     ============================================================ */
  function place() {
    /* قاب‌های قبلی برداشته می‌شوند */
    document.querySelectorAll('.sp-wrap').forEach(function (n) { n.remove(); });

    var d = data();
    if (!d) return;

    var host = null, mode = 'full', after = false;

    /* ---------- حساب کاربری — مهم‌ترین جا ---------- */
    var tabs = document.getElementById('accTabs');
    if (tabs) {
      host = tabs;
      mode = 'full';
    }

    /* ---------- سبد خرید — نوار باریک ---------- */
    if (!host && /cart\.html$/i.test(location.pathname)) {
      host = document.querySelector('#main .wrap');
      mode = 'slim';
    }

    /* ---------- صفحه‌ی اصلی و دسته‌بندی‌ها ----------
       بالای صفحه، بلافاصله پس از اسلایدر بزرگ.
       پیش‌تر پایین صفحه کنار «فروشندگان برگزیده» بود و
       کسی تا آنجا پایین نمی‌آمد. حالا نخستین چیزی است
       که بعد از اسلایدر دیده می‌شود. */
    var isCat = ['woman', 'man', 'kids', 'teen'].indexOf(PAGE) > -1;
    if (!host && (PAGE === 'home' || isCat)) {
      var hero = document.getElementById('heroSlider');
      if (hero) {
        host = hero;
        mode = 'full';
        after = true;          /* پس از اسلایدر، نه پیش از آن */
      } else {
        host = document.getElementById('featured-sellers') ||
               document.getElementById('stores') ||
               document.getElementById('store-showcase');
        mode = 'full';
      }
    }

    /* ---------- صفحه‌ی یک فروشگاه ----------
       نوار باریک — نباید با خود فروشگاه رقابت کند.
       و اگر همین فروشگاه صدرنشین است، تکرارش بی‌معنی است. */
    if (!host && /store\.html$/i.test(location.pathname)) {
      var seen = new URLSearchParams(location.search).get('id');
      if (seen && seen === d.id) return;
      host = document.querySelector('#main .wrap, main .wrap');
      mode = 'slim';
    }

    if (!host) return;

    var box = document.createElement('div');
    box.className = 'sp-wrap' + (mode === 'slim' ? ' sp-wrap--slim' : '') +
                    (after ? ' sp-wrap--hero' : '');
    box.innerHTML = build(d, mode);

    if (mode === 'slim') {
      host.insertBefore(box, host.firstChild);
    } else if (after) {
      /* درست پس از اسلایدر بزرگ */
      host.parentNode.insertBefore(box, host.nextSibling);
    } else {
      host.parentNode.insertBefore(box, host);
    }

    tick();
    shotLoop();
    armEnd();
  }

  /* ============================================================
     اسلایدشو — هر ۳ ثانیه یک تصویر
     ------------------------------------------------------------
     وقتی برگه پنهان است یا کاربر «کاهش حرکت» را روشن کرده،
     خودکار می‌ایستد. با موش روی تصویر هم می‌ایستد تا
     کاربر فرصت نگاه کردن داشته باشد.
     ============================================================ */
  var shotTimer = null;
  var shotPaused = false;

  function shotLoop() {
    /* ساعت‌شمار پیشین همیشه بسته می‌شود — وگرنه با هر بازسازی
       بنر یک ساعت‌شمار تازه روی قبلی سوار می‌شد و تصویرها
       تندتر و تندتر عوض می‌شدند. */
    if (shotTimer) { clearInterval(shotTimer); shotTimer = null; }

    /* حالت «ایست» مال بنر قبلی بود؛ برای بنر تازه صفر می‌شود */
    shotPaused = false;

    var stage = document.querySelector('.sp-shots-stage');
    if (!stage) return;

    var shots = stage.querySelectorAll('.sp-shot');
    if (shots.length < 2) return;

    var wrap = document.querySelector('.sp-shots');
    if (!wrap) return;

    /* اگر پیش‌تر به همین عنصر شنونده بسته‌ایم، دوباره نبندیم */
    if (wrap.dataset.spBound === '1') {
      /* فقط ساعت‌شمار را از نو راه می‌اندازیم */
    }

    var dots = wrap.querySelectorAll('.sp-shot-dot');
    var i = 0;

    var show = function (n) {
      i = (n + shots.length) % shots.length;
      shots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      dots.forEach(function (b, k) {
        b.classList.toggle('on', k === i);
        b.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
    };

    /* حرکت کم — فقط با نقطه‌ها جابه‌جا می‌شود */
    var reduce = window.matchMedia &&
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduce) {
      shotTimer = setInterval(function () {
        /* اگر بنر از صفحه رفته، ساعت‌شمار خودش را جمع می‌کند */
        if (!wrap.isConnected) { clearInterval(shotTimer); shotTimer = null; return; }
        if (document.hidden || shotPaused) return;
        show(i + 1);
      }, 3000);
    }

    if (wrap.dataset.spBound !== '1') {
      wrap.dataset.spBound = '1';
      wrap.addEventListener('pointerenter', function () { shotPaused = true; });
      wrap.addEventListener('pointerleave', function () { shotPaused = false; });
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('[data-sp-dot]');
        if (!b) return;
        show(Number(b.dataset.spDot));
      });
    }
  }

  /* وقتی برگه بسته می‌شود، همه‌ی ساعت‌شمارها آزاد می‌شوند */
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', function () {
      if (shotTimer) { clearInterval(shotTimer); shotTimer = null; }
      if (timer) { clearInterval(timer); timer = null; }
      if (endTimer) { clearTimeout(endTimer); endTimer = null; }
    });
  }

  /* ============================================================
     شمارش معکوس زنده — هر ثانیه
     ============================================================ */
  var timer = null;

  function tick() {
    if (timer) clearInterval(timer);
    var el = document.querySelector('[data-sp-clock]');
    if (!el) return;

    var end = Number(el.dataset.spClock);

    timer = setInterval(function () {
      /* وقتی برگه پنهان است، کار نکن */
      if (document.hidden) return;

      var t = remain(end);
      if (!t) {
        clearInterval(timer);
        timer = null;
        /* موتور نردبان بسته را رسماً می‌بندد و صف را پیش می‌برد،
           سپس قاب خودش برداشته می‌شود */
        try { B.all(); } catch (e) {}
        place();
        return;
      }
      el.textContent = clockText(t);
    }, 1000);
  }

  /* ============================================================
     پایان صدرنشینی — نمایش برای مشتری بی‌سروصدا تمام می‌شود
     ------------------------------------------------------------
     وقتی بسته منقضی شد، قاب باید همان لحظه برداشته شود،
     نه اینکه تا بارگذاری بعدی روی صفحه بماند.
     ============================================================ */
  var endTimer = null;

  function armEnd() {
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
    var d = data();
    if (!d || !d.rec || !d.rec.endsAt) return;

    var wait = d.rec.endsAt - Date.now();
    if (wait <= 0) { place(); return; }
    if (wait > 21600000) wait = 21600000;   /* سقف ۶ ساعت */

    endTimer = setTimeout(function () {
      try { B.all(); } catch (e) {}         /* بستن رسمی + پیشبرد صف */
      place();                              /* قاب صدرنشین تازه یا هیچ */
      armEnd();
    }, wait + 80);
  }

  /* ============================================================
     شمارش کلیک — برای گزارش به فروشنده
     ============================================================ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sp-go]');
    if (a && window.DPBoost) DPBoost.countClick(a.dataset.spGo);
  });

  /* شمارش بازدید — یک بار در هر بارگذاری */
  function seen() {
    var d = data();
    if (d && window.DPBoost) DPBoost.countView(d.id);
  }

  document.addEventListener('dp:boost', place);
  window.addEventListener('storage', function (e) {
    if (e.key === 'dp_boosts') place();
  });

  function boot() { place(); seen(); }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();

  window.DPSpotlight = { refresh: place, data: data };
})();
