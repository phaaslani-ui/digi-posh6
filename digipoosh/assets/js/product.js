/* ============================================================
   دیجی‌پوش — صفحه‌ی اختصاصی هر کالا
   ------------------------------------------------------------
   نشانی: product.html?id=…

   تا پیش از این هر کالا فقط یک پنجره‌ی کوچک بود. حالا صفحه‌ی
   کامل خودش را دارد:

     · نگارخانه‌ی عکس با بزرگ‌نمایی
     · انتخاب رنگ و سایز با موجودی زنده
     · جدول کامل مشخصات (از ویژگی‌های ثبت‌شده)
     · شمارنده‌ی تخفیف، هشدار کمبود موجودی
     · نظرها با امکان ثبت نظر تازه
     · کالاهای مرتبط (سه دسته)
     · کالاهای همین فروشگاه
     · اشتراک‌گذاری، علاقه‌مندی، مقایسه

   همه‌چیز از داده‌ی واقعی خوانده می‌شود — هیچ نمونه‌ای نیست.
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ابزارهای پایه
     ============================================================ */
  var FA = function (n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  };
  var money = function (n) {
    return FA(Math.round(Number(n) || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (s, sc) { return (sc || document).querySelector(s); };

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.6" '
         + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var svg = function (p, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" ' + SW + '>' + p + '</svg>';
  };

  var I = {
    cart:   '<path d="M3.5 4.5h2l2.2 10.5h9.6l2.2-8H6.2"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    heart:  '<path d="M12 20s-7.5-4.7-7.5-9.7A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7C19.5 15.3 12 20 12 20z"/>',
    share:  '<circle cx="17.5" cy="6" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="m8.8 10.8 6.4-3.6M8.8 13.2l6.4 3.6"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
    truck:  '<path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    back:   '<path d="M9 5.5 15.5 12 9 18.5"/>',
    box:    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    shop:   '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    star:   '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    clock:  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    zoom:   '<circle cx="11" cy="11" r="6.5"/><path d="m15.8 15.8 4 4M11 8.5v5M8.5 11h5"/>',
    tag:    '<path d="M20 12.5 12.5 20 4 11.5V4h7.5z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    check:  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    ruler:  '<path d="M4 9h16v6H4z"/><path d="M8 9v3M12 9v4M16 9v3"/>',
    plus:   '<path d="M12 5.5v13M5.5 12h13"/>',
    minus:  '<path d="M5.5 12h13"/>',
    eye:    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    chart:  '<path d="M4 19.5V4"/><path d="M4 19.5h16"/><path d="M8 16V11"/><path d="M12.5 16V7.5"/><path d="M17 16v-6"/>',
    hanger: '<path d="M12 6.5a1.8 1.8 0 1 1 1.8 1.8c-1 0-1.8.8-1.8 1.8"/><path d="M12 10.1 3.8 16a1.2 1.2 0 0 0 .7 2.2h15a1.2 1.2 0 0 0 .7-2.2z"/>',
    spark:  '<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9z"/><path d="M18.5 15.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>',
    trash:  '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7.5 7.5 20h9l1-12.5"/>',
    gift:   '<rect x="3.5" y="8.5" width="17" height="12" rx="1.6"/><path d="M3.5 12.5h17M12 8.5v12"/><path d="M12 8.5S10.5 4 8 4a2 2 0 0 0 0 4.5zM12 8.5S13.5 4 16 4a2 2 0 0 1 0 4.5z"/>',
  };

  /* ============================================================
     حالت صفحه
     ============================================================ */
  var P = null;          /* کالای جاری */
  var SELLER = null;
  var ALL = [];          /* همه‌ی کالاهای فعال بازار */
  var pickColor = '';
  var pickSize = '';
  var qty = 1;
  var shot = 0;          /* عکس فعال در نگارخانه */

  var OUTFIT = null;         /* ست پیشنهادی جاری */
  var SIZE_HINT = null;      /* سایز پیشنهادی بر پایه‌ی اندازه‌های مشتری */

  /* کلید جدا از `dp_wishlist` — آن یکی برای «فروشگاه‌های
     دلخواه» است و ساختارش شیء است، نه رشته. قاطی کردنشان
     هر دو را خراب می‌کرد. */
  var WISH_KEY = 'dp_wish_products';

  /* ============================================================
     خواندن داده
     ============================================================ */
  function loadAll() {
    var ps = [], users = [];
    try { ps = window.DPSafe ? DPSafe.products() : []; } catch (e) { ps = []; }
    try { users = window.DPSafe ? DPSafe.sellers() : []; } catch (e) { users = []; }

    var ok = {};
    users.forEach(function (u) {
      var st = u.status || (u.isVerified ? 'approved' : 'pending');
      if (st === 'approved' || st === 'pending') ok[u.id] = u;
    });

    var T = window.DPTaxonomy;

    return ps
      .filter(function (p) { return p.status === 'active' && ok[p.sellerId]; })
      .map(function (p) {
        var found = T ? T.findByItem(p.category) : null;
        return Object.assign({}, p, {
          sec: p.section || (found && found.section) || '',
          grp: p.group || (found && found.group) || '',
          sellerName: ok[p.sellerId].storeName || 'فروشگاه',
          sellerLogo: ok[p.sellerId].logo || '',
          sellerCity: ok[p.sellerId].city || '',
          sellerObj: ok[p.sellerId],
        });
      });
  }

  function priceOf(p) {
    if (window.DPPromo) {
      try {
        var s = DPPromo.sales.priceOf(p);
        if (s && Number.isFinite(Number(s.price))) return s;
      } catch (e) { /* بی‌اهمیت */ }
    }
    return { price: Number(p.price) || 0, old: null, percent: 0, title: '' };
  }

  function arr(v) {
    return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string' && x; }) : [];
  }

  /* ============================================================
     سازگاری بخش — زنانه با زنانه
     ------------------------------------------------------------
     ⚠️ ایراد گزارش‌شده: در ست لباس زنانه، کت چرم مردانه
     پیشنهاد می‌شد. قاعده‌اش در `dp-stylist.js` است؛ اینجا
     فقط صدایش می‌زنیم تا نوارهای «مشابه» هم رعایتش کنند.
     ============================================================ */
  function secFits(a, b) {
    /* نگهبان مرکزی — همه‌ی قاعده‌ها یک‌جا */
    if (window.DPRules) {
      try { return DPRules.allows(a, b, { allowOutOfStock: true }); }
      catch (e) { /* به روش قدیمی برگرد */ }
    }
    if (window.DPStylist && DPStylist.sectionFits) {
      try { return DPStylist.sectionFits(a, b); } catch (e) { return true; }
    }
    return true;
  }

  /* ============================================================
     شروع
     ============================================================ */
  function run() {
    var Q = new URLSearchParams(location.search);
    var id = Q.get('id') || '';
    ALL = loadAll();
    P = ALL.find(function (x) { return String(x.id) === String(id); }) || null;

    if (!P) {
      $('#pdLoading').hidden = true;
      $('#pdMissing').hidden = false;
      /* حتی وقتی کالا نیست، چند پیشنهاد نشان می‌دهیم تا
         مشتری دست‌خالی برنگردد */
      paintFallback();
      return;
    }

    SELLER = P.sellerObj;
    pickColor = arr(P.colors)[0] || '';

    /* اگر از پنل دیجی AI روی یک سایز مشخص کلیک شده، همان
       سایز از پیش انتخاب می‌شود — مشتری دوباره نگردد. */
    pickSize = '';
    var want = Q.get('size') || '';
    if (want && arr(P.sizes).indexOf(want) > -1) pickSize = want;

    document.title = P.name + ' | دیجی‌پوش';
    setMeta();

    $('#pdLoading').hidden = true;
    $('#pdMain').hidden = false;

    /* ---------- سایز پیشنهادی ----------
       اگر مشتری اندازه‌هایش را ذخیره کرده و فروشنده جدول
       سایز داده باشد، بهترین سایز از قبل حساب می‌شود. */
    SIZE_HINT = null;
    if (window.DPFit) {
      try {
        var prof = DPFit.activeProfile();
        if (prof && prof.body) {
          var fitRes = DPFit.bestSizeFor(P, prof.body, prof.fit);
          if (fitRes && fitRes.best.percent >= 70) SIZE_HINT = fitRes.best;
        }
      } catch (e) { SIZE_HINT = null; }
    }

    /* ---------- آموزش مغز: بازدید ----------
       ضعیف‌ترین سیگنال، ولی حجمش زیاد است و الگو می‌سازد. */
    if (window.DPBrain) {
      try { DPBrain.track('view', { product: P }); } catch (e) { /* بی‌اهمیت */ }
    }

    paintCrumbs();
    paintGallery();
    paintBuy();
    paintSpecs();
    paintSeller();
    paintReviews();
    paintRelated();
    paintBar();
    wire();
  }

  /* ============================================================
     نشانه‌های صفحه برای موتور جست‌وجو و اشتراک‌گذاری
     ============================================================ */
  function setMeta() {
    var s = priceOf(P);
    var img = arr(P.images)[0] || '';
    var desc = (P.description || (P.name + ' از ' + P.sellerName + ' — خرید امن در دیجی‌پوش'))
      .slice(0, 155);

    var set = function (sel, attr, val) {
      var el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', P.name + ' | دیجی‌پوش');
    set('meta[property="og:description"]', 'content', desc);
    set('meta[property="og:url"]', 'content', location.href);
    if (img) set('meta[property="og:image"]', 'content', img);
    set('meta[name="twitter:title"]', 'content', P.name);
    set('meta[name="twitter:description"]', 'content', desc);
    set('link[rel="canonical"]', 'href', location.href);

    /* داده‌ی ساختاریافته — گوگل قیمت و موجودی را نشان می‌دهد */
    var R = window.DPReviews;
    var rate = null;
    try { rate = R ? (R.summary('product', P.id) || null) : null; } catch (e) { /* بی‌اهمیت */ }

    var ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: P.name,
      description: desc,
      sku: String(P.id),
      brand: { '@type': 'Brand', name: P.brand || P.sellerName },
      offers: {
        '@type': 'Offer',
        price: String(s.price),
        priceCurrency: 'IRR',
        availability: Number(P.stock) > 0
          ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: location.href,
        seller: { '@type': 'Organization', name: P.sellerName },
      },
    };
    if (img) ld.image = [img];
    if (rate && rate.count > 0) {
      ld.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(rate.avg),
        reviewCount: String(rate.count),
      };
    }

    var tag = document.getElementById('pdLd');
    if (tag) tag.textContent = JSON.stringify(ld);
  }

  /* ============================================================
     مسیر بالای صفحه
     ============================================================ */
  function paintCrumbs() {
    var T = window.DPTaxonomy;
    var SEC_FA = { women: 'زنانه', men: 'مردانه', kids: 'بچگانه', teen: 'تینیجر' };
    var SEC_DIR = { women: 'woman', men: 'man', kids: 'kids', teen: 'teen' };

    var bits = ['<a href="./index.html">خانه</a>'];
    if (P.sec && SEC_DIR[P.sec]) {
      bits.push('<a href="./' + SEC_DIR[P.sec] + '/index.html">' + SEC_FA[P.sec] + '</a>');
    }
    bits.push('<a href="./store.html?id=' + encodeURIComponent(P.sellerId)
      + (P.sec ? '&from=' + P.sec : '') + '">' + esc(P.sellerName) + '</a>');
    bits.push('<strong>' + esc(P.name) + '</strong>');

    $('#pdCrumbs').innerHTML = bits.join('<span aria-hidden="true">›</span>');
  }

  /* ============================================================
     نگارخانه‌ی عکس
     ============================================================ */
  function paintGallery() {
    var imgs = arr(P.images);
    var s = priceOf(P);
    var box = $('#pdGallery');

    var badges = '';
    if (s.percent) badges += '<em class="pd-off">' + FA(s.percent) + '٪ تخفیف</em>';

    /* عدد دقیق موجودی هرگز نشان داده نمی‌شود — فقط حالت */
    if (window.DPStock) {
      var sk = DPStock.status(P.stock);
      if (sk.level === 'out') badges += '<em class="pd-out">ناموجود</em>';
      else if (sk.urgent) badges += '<em class="pd-low">' + sk.label + '</em>';
    }

    box.innerHTML =
      '<div class="pd-stage" id="pdStage">'
      + (imgs.length
          ? '<img id="pdBig" src="' + esc(imgs[shot]) + '" alt="' + esc(P.name) + '" />'
            + '<button class="pd-zoom" type="button" data-zoom'
            +   ' aria-label="دیدن عکس در اندازه‌ی بزرگ">'
            +   svg(I.zoom) + '<span>بزرگ‌نمایی</span></button>'
          : '<span class="pd-letter">' + esc((P.name || '؟').trim()[0]) + '</span>')
      + badges
      + '</div>'
      + (imgs.length > 1
          ? '<div class="pd-thumbs" role="group" aria-label="عکس‌های کالا">'
            + imgs.map(function (src, i) {
                return '<button class="pd-thumb' + (i === shot ? ' on' : '') + '" type="button"'
                  + ' data-shot="' + i + '" data-n="' + FA(i + 1) + '"'
                  + ' aria-label="عکس شماره ' + FA(i + 1) + '"'
                  + ' aria-pressed="' + (i === shot) + '">'
                  + '<img src="' + esc(src) + '" alt="" loading="lazy" /></button>';
              }).join('')
            + '</div>'
          : '');

    /* ذره‌بین پس از هر بار بازکشیدن دوباره وصل می‌شود */
    wireLens();
  }

  /* ============================================================
     ستون خرید
     ============================================================ */
  function paintBuy() {
    var C = window.DPColors;
    var R = window.DPReviews;
    var s = priceOf(P);
    var stock = Number(P.stock) || 0;

    var rate = null;
    try { rate = R ? R.summary('product', P.id) : null; } catch (e) { /* بی‌اهمیت */ }

    var shopRate = null;
    try { shopRate = R ? (R.storeRatingsMap()[P.sellerId] || null) : null; } catch (e) { /* */ }

    var cols = arr(P.colors).map(function (k) {
      return C ? C.find(k) : null;
    }).filter(Boolean);

    var sizes = arr(P.sizes);
    var wished = isWished(P.id);

    var html = '';

    /* ---------- نام و امتیاز ---------- */
    html += '<h1 class="pd-name">' + esc(P.name) + '</h1>';

    html += '<div class="pd-topline">';
    if (rate && rate.count) {
      html += '<a class="pd-rate" href="#pdReviews">'
        + starRow(rate.avg)
        + '<b>' + FA(rate.avg) + '</b>'
        + '<span>(' + FA(rate.count) + ' نظر)</span></a>';
    } else {
      html += '<span class="pd-rate none">' + starRow(0) + '<span>هنوز نظری ثبت نشده</span></span>';
    }
    if (P.brand) html += '<span class="pd-brand">' + svg(I.tag, 'ico ico-s') + esc(P.brand) + '</span>';
    if (Number(P.sales) > 0) {
      html += '<span class="pd-sold">' + svg(I.check, 'ico ico-s')
        + FA(P.sales) + ' بار فروخته شده</span>';
    }
    html += '</div>';

    /* ---------- قیمت ---------- */
    html += '<div class="pd-pricebox">';
    if (s.percent) {
      html += '<div class="pd-priceline">'
        + '<span class="pd-old">' + money(s.old) + '</span>'
        + '<span class="pd-badge">' + FA(s.percent) + '٪ تخفیف</span>'
        + '</div>';
    }
    html += '<div class="pd-price">' + money(s.price) + '<small>تومان</small></div>';
    if (s.percent) {
      html += '<div class="pd-saved">' + svg(I.gift, 'ico ico-s')
        + '<span>' + money(s.old - s.price) + ' تومان سود می‌کنید'
        + (s.title ? ' — ' + esc(s.title) : '') + '</span></div>';
    }
    html += '</div>';

    /* ---------- وضعیت موجودی ---------- */
    /* ---------- وضعیت موجودی ----------
       عدد دقیق به مشتری گفته نمی‌شود. فقط وقتی کم
       است، حس فوریت ساخته می‌شود — ولی صادقانه. */
    if (window.DPStock) {
      html += DPStock.bar(stock, DPStock.demand(P));
    }

    /* ---------- رنگ ---------- */
    if (cols.length) {
      html += '<div class="pd-pick"><h3>رنگ'
        + '<em id="pdColorName">' + esc((cols.find(function (c) {
            return c.id === pickColor;
          }) || cols[0]).name) + '</em></h3>'
        + '<div class="pd-dots">'
        + cols.map(function (c) {
            var on = c.id === pickColor;
            return '<button class="pd-dot' + (on ? ' on' : '') + '" type="button"'
              + ' data-color="' + esc(c.id) + '" title="' + esc(c.name) + '"'
              + ' aria-pressed="' + on + '" aria-label="رنگ ' + esc(c.name) + '">'
              /* `background()` رنگ‌های ترکیبی (طیف، راه‌راه، خال‌دار)
                 را کامل می‌سازد؛ `c.hex` تنها یک لکه‌ی تخت می‌داد. */
              + '<i style="background:'
              + esc((C && C.background ? C.background(c) : c.hex) || '#ccc')
              + '"></i></button>';
          }).join('')
        + '</div></div>';
    }

    /* ---------- سایز ---------- */
    if (sizes.length) {
      html += '<div class="pd-pick"><h3>سایز'
        + '<button class="pd-guide" type="button" data-guide>'
        + svg(I.ruler, 'ico ico-s') + ' راهنمای سایز</button></h3>'
        + '<div class="pd-sizes">'
        + sizes.map(function (z) {
            var on = z === pickSize;
            /* اگر مشتری اندازه‌هایش را داده، سایز پیشنهادی
               نشان می‌گیرد — تصمیم را خیلی آسان می‌کند */
            var mark = (SIZE_HINT && SIZE_HINT.label === z)
              ? '<i class="fit-badge">' + FA(SIZE_HINT.percent) + '٪</i>' : '';
            return '<button class="pd-size' + (on ? ' on' : '')
              + (mark ? ' is-fit' : '') + '" type="button"'
              + ' data-size="' + esc(z) + '" aria-pressed="' + on + '">'
              + esc(z) + mark + '</button>';
          }).join('')
        + '</div>'

        /* ---------- ابزارک یافتن سایز ---------- */
        + '<button class="fit-trigger" type="button" data-fit-btn="'
        +   esc(P.id) + '">'
        +   svg(I.ruler, 'ico ico-s')
        +   '<span>' + (SIZE_HINT
              ? 'سایز پیشنهادی شما: ' + esc(SIZE_HINT.label)
              : 'سایز من را پیدا کن') + '</span></button>'
        + '<p class="pd-warn" id="pdSizeWarn" hidden>' + svg(I.alert, 'ico ico-s')
        + ' لطفاً سایز را انتخاب کنید.</p>'
        + '</div>';
    }

    /* ---------- تعداد و افزودن ---------- */
    html += '<div class="pd-buyrow">'
      + '<div class="pd-qty" role="group" aria-label="تعداد">'
      +   '<button type="button" data-q="-1" aria-label="کم کردن">' + svg(I.minus, 'ico ico-s') + '</button>'
      +   '<b id="pdQty">' + FA(qty) + '</b>'
      +   '<button type="button" data-q="1" aria-label="زیاد کردن">' + svg(I.plus, 'ico ico-s') + '</button>'
      + '</div>'
      + '<button class="pd-add" type="button" data-add' + (stock === 0 ? ' disabled' : '') + '>'
      +   svg(I.cart) + '<span>' + (stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید') + '</span>'
      + '</button>'
      + '</div>';

    /* ---------- کارهای جانبی ---------- */
    html += '<div class="pd-side">'
      + '<button class="pd-sbtn' + (wished ? ' on' : '') + '" type="button" data-wish'
      +   ' aria-pressed="' + wished + '">' + svg(I.heart, 'ico ico-s')
      +   '<span>' + (wished ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی') + '</span></button>'
      + '<button class="pd-sbtn" type="button" data-share>' + svg(I.share, 'ico ico-s')
      +   '<span>اشتراک‌گذاری</span></button>'
      + '</div>';

    /* ---------- ضمانت‌ها ---------- */
    html += '<ul class="pd-trust">'
      + '<li>' + svg(I.shield) + '<div><b>ضمانت اصالت</b>'
      +   '<span>کالای تقلبی؟ کل مبلغ برمی‌گردد.</span></div></li>'
      + '<li>' + svg(I.back) + '<div><b>هفت روز مهلت بازگشت</b>'
      +   '<span>نپسندیدید؟ بی‌دلیل پس بفرستید.</span></div></li>'
      + '<li>' + svg(I.truck) + '<div><b>ارسال از ' + esc(P.sellerCity || 'انبار فروشنده') + '</b>'
      +   '<span>پس از تأیید سفارش بسته‌بندی می‌شود.</span></div></li>'
      + '</ul>';

    $('#pdBuy').innerHTML = html;

    /* شمارنده‌ی پایان تخفیف، اگر تخفیف زمان‌دار باشد */
    paintCountdown();
  }

  /* ============================================================
     نوار خرید چسبان روی موبایل
     ------------------------------------------------------------
     روی گوشی، دکمه‌ی خرید بالای صفحه می‌ماند و مشتری برای
     خریدن باید تا بالا برگردد. این نوار وقتی دکمه‌ی اصلی از
     دید بیرون رفت، از پایین بالا می‌آید.
     ============================================================ */
  function paintBar() {
    var s = priceOf(P);
    var stock = Number(P.stock) || 0;

    var bar = document.createElement('div');
    bar.className = 'pd-bar';
    bar.innerHTML =
      '<span class="b-price">'
      +   (s.percent ? '<s>' + money(s.old) + '</s>' : '')
      +   '<b>' + money(s.price) + ' <small>تومان</small></b>'
      + '</span>'
      + '<button class="pd-add" type="button" data-add' + (stock === 0 ? ' disabled' : '') + '>'
      +   svg(I.cart) + '<span>' + (stock === 0 ? 'ناموجود' : 'افزودن به سبد') + '</span></button>';
    document.body.appendChild(bar);

    var anchor = $('.pd-buyrow');
    if (!anchor || !window.IntersectionObserver) { bar.classList.add('on'); return; }

    /* وقتی دکمه‌ی اصلی دیده می‌شود، نوار پنهان است */
    new IntersectionObserver(function (rows) {
      rows.forEach(function (r) { bar.classList.toggle('on', !r.isIntersecting); });
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(anchor);
  }

  function starRow(avg) {
    var n = Math.round(Number(avg) || 0);
    var out = '<span class="pd-stars" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg viewBox="0 0 24 24" class="' + (i <= n ? 'f' : '')
        + '" fill="currentColor" stroke="none">' + I.star + '</svg>';
    }
    return out + '</span>';
  }

  /* ---------- شمارنده‌ی پایان تخفیف ----------
     اگر فروشنده تخفیفی با تاریخ پایان گذاشته، مشتری
     می‌بیند چقدر وقت دارد. */
  function paintCountdown() {
    if (!window.DPPromo) return;
    var d = null;
    try { d = DPPromo.sales.forProduct(P.id, P.sellerId); } catch (e) { return; }
    if (!d || !d.to) return;

    var end = Date.parse(d.to + 'T23:59:59');
    if (!Number.isFinite(end) || end <= Date.now()) return;

    var box = document.createElement('div');
    box.className = 'pd-timer';
    var priceBox = $('.pd-pricebox');
    if (priceBox) priceBox.appendChild(box);

    var tick = function () {
      var ms = end - Date.now();
      if (ms <= 0) { box.remove(); clearInterval(t); return; }
      var day = Math.floor(ms / 864e5);
      var hr = Math.floor(ms / 36e5) % 24;
      var mi = Math.floor(ms / 6e4) % 60;
      box.innerHTML = svg(I.clock, 'ico ico-s')
        + '<span>پایان تخفیف تا '
        + (day ? '<b>' + FA(day) + '</b> روز و ' : '')
        + '<b>' + FA(hr) + '</b> ساعت و <b>' + FA(mi) + '</b> دقیقه</span>';
    };
    tick();
    var t = setInterval(tick, 30000);
  }

  /* ============================================================
     جدول مشخصات — از ویژگی‌های واقعی ثبت‌شده
     ============================================================ */
  function paintSpecs() {
    var A = window.DPAttributes;
    var T = window.DPTaxonomy;
    var rows = [];

    if (A && A.GROUPS) {
      A.GROUPS.forEach(function (g) {
        var v = P[g.key];
        if (!v) return;
        var label = (A.LABELS && A.LABELS[g.key] && A.LABELS[g.key][v]) || null;
        if (!label && window.DPColors && g.key === 'color') {
          var c = DPColors.find(v);
          if (c) label = c.name;
        }
        if (!label) {
          var o = (A.OPTIONS[g.key] || []).find(function (x) { return x.name === v; });
          label = o ? o.label : v;
        }
        rows.push([g.label, label]);
      });
    }

    if (P.category) {
      /* درخت دسته‌بندی نام‌های فارسی دارد. اگر کالایی با نام
         انگلیسی ثبت شده باشد (داده‌ی قدیمی یا وارداتی)، همان
         را نشان می‌دهیم ولی مسیر کاملش را هم می‌سازیم. */
      var f = T ? T.findByItem(P.category) : null;
      var label = P.category;
      if (f && T.trail) {
        var full = T.trail(f.section, f.group, f.item);
        if (full) label = full;
      }
      rows.unshift(['نوع کالا', label]);
    }
    if (P.brand) rows.push(['برند', P.brand]);
    if (arr(P.sizes).length) rows.push(['سایزهای موجود', arr(P.sizes).join('، ')]);

    var C = window.DPColors;
    var cols = arr(P.colors).map(function (k) { return C ? C.find(k) : null; }).filter(Boolean);
    if (cols.length) {
      rows.push(['رنگ‌های موجود', cols.map(function (c) { return c.name; }).join('، ')]);
    }
    rows.push(['کد کالا', String(P.id)]);
    rows.push(['فروشنده', P.sellerName]);

    var box = $('#pdSpecs');
    var desc = String(P.description || '').trim();

    box.innerHTML =
      (desc
        ? '<div class="pd-panel"><h2>' + svg(I.box) + ' درباره‌ی این کالا</h2>'
          + '<p class="pd-desc">' + esc(desc).replace(/\n/g, '<br />') + '</p></div>'
        : '')
      + '<div class="pd-panel"><h2>' + svg(I.ruler) + ' مشخصات کامل</h2>'
      + '<table class="pd-spectable"><tbody>'
      + rows.map(function (r) {
          return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
        }).join('')
      + '</tbody></table></div>'

      /* پنل مقایسه‌ی قیمت — زیر مشخصات،
         جایی که مشتری دارد تصمیم می‌گیرد */
      + pricePanel();
  }

  /* ============================================================
     کارت فروشنده
     ============================================================ */
  function paintSeller() {
    var R = window.DPReviews;
    var rate = null;
    try { rate = R ? (R.storeRatingsMap()[P.sellerId] || null) : null; } catch (e) { /* */ }

    var mine = ALL.filter(function (x) { return x.sellerId === P.sellerId; });
    var url = './store.html?id=' + encodeURIComponent(P.sellerId)
      + (P.sec ? '&from=' + P.sec : '');

    $('#pdSeller').innerHTML =
      '<div class="pd-panel pd-shopcard">'
      + '<span class="pd-shopava">'
      +   (P.sellerLogo
            ? '<img src="' + esc(P.sellerLogo) + '" alt="" loading="lazy" />'
            : esc((P.sellerName || '؟')[0]))
      + '</span>'
      + '<div class="pd-shopinfo">'
      +   '<span class="pd-shoplabel">فروشنده‌ی این کالا</span>'
      +   '<h3>' + esc(P.sellerName) + '</h3>'
      +   '<div class="pd-shopmeta">'
      +     (rate ? '<span>' + svg(I.star, 'ico ico-s') + FA(rate.avg) + ' از ۵'
              + (rate.count ? ' (' + FA(rate.count) + ' نظر)' : '') + '</span>' : '')
      +     '<span>' + svg(I.box, 'ico ico-s') + FA(mine.length) + ' کالا</span>'
      +     (P.sellerCity ? '<span>' + svg(I.truck, 'ico ico-s') + esc(P.sellerCity) + '</span>' : '')
      +   '</div>'
      + '</div>'
      + '<a class="pd-shopgo" href="' + url + '">' + svg(I.shop, 'ico ico-s')
      +   ' دیدن فروشگاه</a>'
      + '</div>';
  }

  /* ============================================================
     نظرها
     ============================================================ */
  function paintReviews() {
    var host = $('#pdReviewBox');
    host.setAttribute('data-reviews', '');
    host.dataset.kind = 'product';
    host.dataset.target = String(P.id);
    host.dataset.seller = String(P.sellerId);
    host.dataset.title = 'نظر خریداران درباره‌ی این کالا';

    /* موتور نظرها همان است که در صفحه‌ی فروشگاه کار می‌کند؛
       فقط `kind` را «product» می‌گذاریم تا نظرها به همین
       کالا بچسبند، نه به کل فروشگاه. */
    if (window.dpReviewsInit) {
      try { window.dpReviewsInit(document); } catch (e) { /* بی‌اهمیت */ }
    }
  }

  /* ============================================================
     پیشنهادها — سه دسته‌ی جداگانه
     ------------------------------------------------------------
     ۱. کالاهای مشابه   → همان دسته، فروشندگان مختلف
     ۲. از همین فروشگاه → کالاهای دیگر همین فروشنده
     ============================================================ */
  function paintRelated() {
    var out = '';

    /* ---------- پنل «این تیپ را کامل کنید» ----------
       بالاتر از همه، چون مهم‌ترین چیزی است که مشتری
       پس از دیدن کالا می‌خواهد: «با این چه بپوشم؟» */
    OUTFIT = null;
    if (window.DPStylist) {
      try {
        OUTFIT = DPStylist.buildOutfit(P, ALL);
        if (OUTFIT) out += outfitPanel(OUTFIT);
      } catch (e) { OUTFIT = null; }
    }


    /* ---------- ۱. مشابه، با امتیازدهی هوشمند ----------
       هرچه ویژگی‌های مشترک بیشتر، بالاتر. قیمت نزدیک هم
       امتیاز می‌گیرد چون مشتری در همان بودجه می‌گردد. */
    var myPrice = priceOf(P).price;
    var A = window.DPAttributes;
    var keys = A ? A.GROUPS.map(function (g) { return g.key; }) : ['fabric', 'color', 'style'];

    var sim = ALL
      .filter(function (x) {
        if (String(x.id) === String(P.id)) return false;
        return secFits(P, x);      /* کالای بخش دیگر، مشابه نیست */
      })
      .map(function (x) {
        var sc = 0;
        if (x.category && x.category === P.category) sc += 6;
        if (x.grp && x.grp === P.grp) sc += 3;
        if (x.sec && x.sec === P.sec) sc += 2;

        keys.forEach(function (k) { if (x[k] && x[k] === P[k]) sc += 2; });

        /* سایز مشترک — یعنی احتمالاً به درد همین مشتری می‌خورد */
        var ms = arr(P.sizes), xs = arr(x.sizes);
        if (ms.length && xs.some(function (z) { return ms.indexOf(z) > -1; })) sc += 1;

        /* نزدیکی قیمت */
        var xp = priceOf(x).price;
        if (myPrice > 0 && xp > 0) {
          var gap = Math.abs(xp - myPrice) / myPrice;
          if (gap < 0.2) sc += 3;
          else if (gap < 0.45) sc += 1;
        }

        if (Number(x.stock) > 0) sc += 1;
        return { p: x, sc: sc };
      })
      .filter(function (r) { return r.sc >= 5; })
      .sort(function (a, b) { return b.sc - a.sc; })
      .slice(0, 8)
      .map(function (r) { return r.p; });

    /* ============================================================
       نوار صفر: ست کردن با این کالا
       ------------------------------------------------------------
       مهم‌ترین نوار و بالاتر از همه.
       مشتری که پیراهن کرم می‌خرد، پیراهن کرم دوم
       نمی‌خواهد — دنبال شلواری است که به آن بیاید.
       ============================================================ */
    var styleRows = null;
    if (window.DPStylist) {
      styleRows = DPStylist.suggest(P, ALL, { limit: 8, minScore: 62, perSlot: 3 });
      if (styleRows.length) {
        out += stylistStrip(DPStylist.titleFor(P), styleRows);
      }
    }

    if (sim.length) {
      out += strip('کالاهای مشابه', 'شاید این‌ها را هم بپسندید', sim);
    }

    /* ---------- ۲. از همین فروشگاه ---------- */
    var same = ALL.filter(function (x) {
      if (x.sellerId !== P.sellerId) return false;
      if (String(x.id) === String(P.id)) return false;
      /* حتی کالای «همین فروشگاه» هم اگر برای بخش دیگری
         باشد، به درد این مشتری نمی‌خورد. یک فروشگاه
         می‌تواند هم زنانه بفروشد هم مردانه. */
      return secFits(P, x);
    });
    /* آنهایی که در «مشابه» آمده‌اند تکرار نشوند */
    var seen = {};
    sim.forEach(function (x) { seen[x.id] = 1; });
    same = same.filter(function (x) { return !seen[x.id]; }).slice(0, 8);

    if (same.length) {
      /* اگر خود نام فروشگاه با «فروشگاه» شروع شود، دوباره
         نمی‌نویسیم — وگرنه «از فروشگاه فروشگاه ماه‌رخ» می‌شود */
      var nm = String(P.sellerName || '').trim();
      var head = /^(فروشگاه|بوتیک|گالری)\s/.test(nm) ? nm : 'فروشگاه ' + nm;
      out += strip('کالاهای دیگر ' + head, 'با یک بسته ارسال می‌شوند', same, true);
    }

    /* ============================================================
       بخش‌های کمک‌تصمیم
       ------------------------------------------------------------
       به‌جای «اخیراً دیده‌اید» که فقط تکرار گذشته بود،
       چیزهایی که واقعاً به خرید کمک می‌کنند.
       ============================================================ */
    var skip = {};
    sim.forEach(function (x) { skip[x.id] = 1; });
    same.forEach(function (x) { skip[x.id] = 1; });

    /* پیشنهادهای استایلیست و ست هم تکرار نشوند */
    if (styleRows) styleRows.forEach(function (r) { skip[r.p.id] = 1; });
    if (OUTFIT) OUTFIT.items.forEach(function (r) { skip[r.p.id] = 1; });

    /* «ارزان‌تر» عمداً تکرار را قبول می‌کند — صرفه‌جویی
       مهم‌تر از تکراری نبودن است */
    var cheap = cheaperStrip();
    out += cheap;

    /* ولی «محبوب» باید چیز تازه‌ای نشان دهد */
    out += lovedStrip(skip);

    $('#pdRelated').innerHTML = out;

    /* پس از کشیده شدن، بسنجیم کدام نوار به پیمایش نیاز دارد */
    requestAnimationFrame(measureStrips);
  }

  /* ============================================================
     پنل «مقایسه‌ی قیمت»
     ------------------------------------------------------------
     کاربردی‌ترین چیزی که پیش از خرید می‌خواهید بدانید:
     آیا این قیمت منصفانه است؟ در بازار واقعی مشتری چند جا
     را می‌گردد تا بفهمد گران نخریده.

     این پنل همان کار را در یک نگاه انجام می‌دهد: قیمت این
     کالا را کنار میانگین، ارزان‌ترین و گران‌ترین کالای هم‌دسته
     می‌گذارد — با داده‌ی واقعی همین بازارگاه، نه حدس.
     ============================================================ */
  function pricePanel() {
    /* کالاهای هم‌دسته — مقایسه‌ی معنادار */
    var peers = ALL.filter(function (x) {
      if (String(x.id) === String(P.id)) return false;
      if (Number(x.stock) <= 0) return false;
      if (!secFits(P, x)) return false;
      return x.category === P.category
        || (x.grp && x.grp === P.grp && x.sec === P.sec);
    });

    /* کمتر از سه کالا، میانگین بی‌معناست */
    if (peers.length < 3) return '';

    var prices = peers.map(function (x) { return priceOf(x).price; })
      .filter(function (n) { return n > 0; }).sort(function (a, b) { return a - b; });
    if (prices.length < 3) return '';

    var mine = priceOf(P).price;
    var lo = prices[0];
    var hi = prices[prices.length - 1];
    var mid = prices[Math.floor(prices.length / 2)];

    /* جایگاه این کالا در بازار — چند درصد گران‌ترند؟ */
    var cheaper = prices.filter(function (n) { return n < mine; }).length;
    var pct = Math.round(cheaper / prices.length * 100);

    var verdict, tone;
    if (pct <= 25) { verdict = 'از ارزان‌ترین‌های این دسته'; tone = 'good'; }
    else if (pct <= 55) { verdict = 'قیمتی متعادل و منطقی'; tone = 'ok'; }
    else if (pct <= 80) { verdict = 'کمی بالاتر از میانگین'; tone = 'warn'; }
    else { verdict = 'از گران‌ترین‌های این دسته'; tone = 'high'; }

    /* جای نشانگر روی نوار */
    var span = hi - lo || 1;
    var at = Math.max(2, Math.min(98, Math.round((mine - lo) / span * 100)));

    return '<section class="pd-price-panel">'
      + '<div class="pd-pp-head">'
      +   '<h2>' + svg(I.chart) + ' این قیمت منصفانه است؟</h2>'
      +   '<span class="pd-pp-verdict ' + tone + '">' + verdict + '</span>'
      + '</div>'
      + '<p class="pd-pp-note">مقایسه با <b>' + FA(prices.length)
      +   '</b> کالای هم‌دسته در بازارگاه — '
      +   'از <b>' + FA(pct) + '٪</b> آنها گران‌تر است.</p>'
      + '<div class="pd-pp-bar">'
      +   '<span class="pd-pp-track"></span>'
      +   '<span class="pd-pp-mark" style="inset-inline-start:' + at + '%">'
      +     '<b>' + money(mine) + '</b></span>'
      + '</div>'
      + '<div class="pd-pp-scale">'
      +   '<span><em>ارزان‌ترین</em>' + money(lo) + '</span>'
      +   '<span class="mid"><em>میانه</em>' + money(mid) + '</span>'
      +   '<span><em>گران‌ترین</em>' + money(hi) + '</span>'
      + '</div></section>';
  }

  /* ============================================================
     نوار «ارزان‌تر از این»
     ------------------------------------------------------------
     اگر کالای مشابهی ارزان‌تر هست، نشانش می‌دهیم.

     چرا فروشگاه باید کالای ارزان‌تر را نشان دهد؟ چون
     مشتری به‌هرحال می‌گردد — اگر اینجا پیدا نکند، جای
     دیگر می‌خرد. اعتماد از یک فروش ارزشمندتر است.
     ============================================================ */
  function cheaperStrip() {
    var mine = priceOf(P).price;
    if (mine <= 0) return '';

    var rows = ALL.filter(function (x) {
      if (String(x.id) === String(P.id)) return false;
      if (Number(x.stock) <= 0) return false;
      if (!secFits(P, x)) return false;
      if (x.category !== P.category) return false;
      var pr = priceOf(x).price;
      /* دست‌کم ۵٪ ارزان‌تر — اختلاف ناچیز ارزش نشان دادن ندارد */
      return pr > 0 && pr < mine * 0.95;
    }).sort(function (a, b) { return priceOf(a).price - priceOf(b).price; })
      .slice(0, 6);

    if (!rows.length) return '';

    var best = priceOf(rows[0]).price;
    var save = mine - best;

    return strip('مشابه این، ارزان‌تر',
      'تا ' + money(save) + ' تومان کمتر — همین نوع کالا', rows);
  }

  /* ============================================================
     نوار «محبوب خریداران»
     ------------------------------------------------------------
     کالاهایی که هم فروش بالا دارند و هم امتیاز خوب —
     نه فقط پرفروش. کالایی که زیاد فروخته ولی امتیازش
     پایین است، پیشنهاد دادنش به مشتری خیانت است.
     ============================================================ */
  function lovedStrip(skip) {
    var R = window.DPReviews;
    var rates = {};
    try { if (R) rates = R.storeRatingsMap() || {}; } catch (e) { rates = {}; }

    var rows = ALL.filter(function (x) {
      if (String(x.id) === String(P.id) || skip[x.id]) return false;
      if (Number(x.stock) <= 0) return false;
      /* `x.sec && P.sec` کافی نبود: کالایی که میدان بخشش
         خالی است ولی نامش «مردانه» دارد، از این فیلتر رد
         می‌شد. `secFits` نام را هم می‌خواند. */
      if (!secFits(P, x)) return false;
      return Number(x.sales) > 0;
    }).map(function (x) {
      var r = rates[x.sellerId];
      var star = r ? Number(r.avg) || 0 : 0;
      /* فروش و رضایت، هر دو با هم */
      return { p: x, sc: Number(x.sales) * (1 + star / 2.5) };
    }).sort(function (a, b) { return b.sc - a.sc; })
      .slice(0, 8).map(function (r) { return r.p; });

    /* کمتر از دو کالا، نوار نمی‌ارزد */
    if (rows.length < 2) return '';
    return strip('محبوب خریداران',
      'هم زیاد فروخته شده، هم راضی بوده‌اند', rows);
  }

  /** وقتی کالا پیدا نشد — دست‌کم چیزی نشان بدهیم */
  function paintFallback() {
    ALL = ALL.length ? ALL : loadAll();
    var pop = ALL.slice()
      .sort(function (a, b) { return (Number(b.sales) || 0) - (Number(a.sales) || 0); })
      .slice(0, 8);

    var box = $('#pdRelated');
    if (box && pop.length) {
      box.innerHTML = strip('پرفروش‌ترین‌های بازار', '', pop);
    }
  }

  /** نوار افقی کالا — با قابلیت کشیدن */
  function strip(title, sub, list, oneShop, extra) {
    var head = '<h2>' + esc(title)
      + '<span class="pd-strip-n">' + FA(list.length) + '</span></h2>';

    var nav = '<div class="pd-strip-nav">'
      + (extra || '')
      + '<button type="button" data-slide="-1" aria-label="\u0642\u0628\u0644\u06cc">'
      +   svg('<path d="M15 5.5 8.5 12 15 18.5"/>', 'ico ico-s') + '</button>'
      + '<button type="button" data-slide="1" aria-label="\u0628\u0639\u062f\u06cc">'
      +   svg(I.back, 'ico ico-s') + '</button>'
      + '</div>';

    return '<section class="pd-strip">'
      + '<div class="pd-strip-head">'
      +   '<div class="pd-strip-title">' + head
      +     (sub ? '<p>' + esc(sub) + '</p>' : '')
      +   '</div>'
      +   nav
      + '</div>'
      + '<div class="pd-rail">'
      + list.map(function (x) { return miniCard(x, oneShop); }).join('')
      + '</div></section>';
  }

  /* ============================================================
     نوار استایلیست — با توضیح زیر هر کارت
     ------------------------------------------------------------
     فرقش با نوار معمولی: زیر هر کالا می‌نویسد
     چرا با این کالا ست می‌شود — مثل حرف یک فروشنده‌ی
     باتجربه. این جمله اعتماد می‌سازد.
     ============================================================ */
  function stylistStrip(title, rows) {
    var SL = window.DPStylist ? DPStylist.SLOT : {};

    var head = '<h2>' + svg(I.spark, 'ico') + esc(title)
      + '<span class="pd-strip-n">' + FA(rows.length) + '</span></h2>';

    var nav = '<div class="pd-strip-nav">'
      + '<button type="button" data-slide="-1" aria-label="قبلی">'
      +   svg('<path d="M15 5.5 8.5 12 15 18.5"/>', 'ico ico-s') + '</button>'
      + '<button type="button" data-slide="1" aria-label="بعدی">'
      +   svg(I.back, 'ico ico-s') + '</button>'
      + '</div>';

    return '<section class="pd-strip pd-strip--style">'
      + '<div class="pd-strip-head">'
      +   '<div class="pd-strip-title">' + head
      +     '<p>انتخاب دیجی AI — بر پایه‌ی هماهنگی رنگ، '
      +     'تعادل فرم، وزن پارچه و سطح رسمیت</p>'
      +   '</div>' + nav
      + '</div>'
      + '<div class="pd-rail">'
      + rows.map(function (r) {
          return '<div class="pd-styled">'
            + miniCard(r.p, false)
            + '<div class="pd-why">'
            +   '<span class="pd-why-slot">' + esc(SL[r.slot] || '') + '</span>'
            +   '<span class="pd-why-txt">' + esc(r.why) + '</span>'
            + '</div></div>';
        }).join('')
      + '</div></section>';
  }

  /* ============================================================
     پنل «این تیپ را کامل کنید»
     ------------------------------------------------------------
     یک ست کامل با قیمت کل و دکمه‌ی افزودن یک‌جا.
     ============================================================ */
  function outfitPanel(fit) {
    var SL = window.DPStylist ? DPStylist.SLOT : {};
    var F = window.DPFashion;

    var pieces = [{ p: P, slot: DPStylist.slotOf(P), self: true }]
      .concat(fit.items);

    /* ---------- تحلیل حرفه‌ای ست ----------
       اینها حرف‌های واقعی دنیای مد است، نه تزیین:
       نسبت رنگ ۶۰-۳۰-۱۰، قاعده‌ی یک کانون، و حکم نهایی. */
    var slots = pieces.map(function (x) { return x.slot; });
    var loudList = pieces.map(function (x) {
      var hue = window.DPStylist ? DPStylist.baseColor(x.p) : '';
      return { loud: F ? F.loudnessOf(x.p, hue) : 0 };
    });

    var bal = F ? F.balanceReport(slots) : null;
    var foc = F ? F.focusReport(loudList) : null;
    var ver = F ? F.verdictOf(fit.score) : null;

    /* مناسبت ست = میانگین رسمیت قطعه‌ها */
    var occ = null;
    if (F && window.DPStylist) {
      var fm = pieces.reduce(function (a, x) {
        return a + DPStylist.formalOf(x.p);
      }, 0) / pieces.length;
      occ = F.occasionOf(fm);
    }

    /* نشان‌های تحلیلی بالای پنل */
    var chips = '';
    if (occ) {
      chips += '<span class="pdai-chip"><i></i>' + esc(occ.name) + '</span>';
    }
    if (foc) {
      chips += '<span class="pdai-chip is-' + foc.level + '"><i></i>'
        + (foc.level === 'ideal' ? 'یک کانون توجه'
          : foc.level === 'calm' ? 'تیپ آرام' : 'کمی شلوغ') + '</span>';
    }
    if (bal) {
      chips += '<span class="pdai-chip' + (bal.ok ? ' is-ok' : '') + '"><i></i>'
        + (bal.ok ? 'نسبت ۶۰-۳۰-۱۰' : 'نیازمند تعادل') + '</span>';
    }

    return '<section class="pd-outfit pd-ai">'

      /* ---------- سربرگ ---------- */
      + '<div class="ai-head">'
      +   '<div class="ai-brand">'
      +     '<span class="ai-badge">' + svg(I.spark, 'ico ico-s') + ' دیجی AI</span>'
      +     '<h2>پیشنهاد دیجی AI</h2>'
      +     '<p>' + FA(pieces.length) + ' قطعه‌ای که با هم یک تیپ کامل می‌سازند'
      +       (occ ? ' — مناسب ' + esc(occ.name) : '') + '</p>'
      +   '</div>'
      +   '<div class="ai-verdict">'
      +     '<span class="ai-score"><b>' + FA(fit.score) + '</b><small>از ۱۰۰</small></span>'
      +     (ver ? '<span class="ai-vtxt is-' + ver.key + '">'
              + '<b>' + esc(ver.name) + '</b><small>' + esc(ver.text) + '</small></span>' : '')
      +   '</div>'
      + '</div>'

      + (chips ? '<div class="pdai-chips">' + chips + '</div>' : '')

      /* ---------- کارت‌های بزرگ قطعه‌ها ---------- */
      + '<div class="pdai-grid">'
      + pieces.map(function (x) { return aiPiece(x, SL, F); }).join('')
      + '</div>'

      /* ---------- نکته‌ی استایلیست ---------- */
      + (bal || foc
          ? '<div class="ai-note">' + svg(I.hanger, 'ico ico-s')
            + '<span>' + esc((foc && foc.text) || (bal && bal.text) || '') + '</span></div>'
          : '')

      /* ---------- پای پنل ---------- */
      + '<div class="ai-foot">'
      +   '<div class="pdai-sum">'
      +     '<span>قیمت کل این تیپ</span>'
      +     '<b>' + money(fit.total) + '<small>تومان</small></b>'
      +   '</div>'
      +   '<div class="ai-foot-acts">'
      +     '<a class="pd-outfit-more" href="./digiai.html?id='
      +       encodeURIComponent(P.id) + '">'
      +       svg(I.spark, 'ico ico-s') + '<span>تیپ‌های بیشتر در دیجی AI</span></a>'
      +     '<button class="pd-outfit-add" type="button" data-outfit>'
      +       svg(I.cart) + '<span>افزودن همه‌ی تیپ به سبد</span></button>'
      +   '</div>'
      + '</div></section>';
  }

  /* ============================================================
     کارت بزرگ یک قطعه در پنل دیجی AI
     ------------------------------------------------------------
     خواسته‌ی کاربر: عکس بزرگ‌تر، سایزها همان‌جا دیده شوند،
     و اطلاعات بیشتر و کاربردی‌تر باشد. پس هر کارت دارد:
       عکس بزرگ · نقش در تیپ · نام · قیمت · سایزهای موجود
       · جنس پارچه · فرم · ارزش کپسولی · دلیل انتخاب
     ============================================================ */
  function aiPiece(x, SL, F) {
    var p = x.p;
    var pr = priceOf(p);
    var img = arr(p.images)[0];
    var url = './product.html?id=' + encodeURIComponent(p.id);
    var hue = window.DPStylist ? DPStylist.baseColor(p) : '';

    /* --- سایزهای موجود، مستقیم روی کارت --- */
    var sizes = arr(p.sizes).slice(0, 6);
    var sizeRow = '';
    if (sizes.length) {
      sizeRow = '<div class="ai-sizes" role="group" aria-label="سایزهای موجود">'
        + sizes.map(function (sz) {
            var info = F ? F.sizeInfo(sz) : null;
            var tip = info
              ? sz + ' — اروپا ' + info.eu + ' · دور سینه ' + info.chest + ' سانت'
              : 'سایز ' + sz;
            return '<a class="ai-sz" href="' + url + '&size=' + encodeURIComponent(sz)
              + '" title="' + esc(tip) + '">' + esc(sz) + '</a>';
          }).join('')
        + '</div>';
    } else {
      sizeRow = '<div class="ai-sizes"><span class="ai-sz is-free">تک‌سایز</span></div>';
    }

    /* --- ریزنشان‌های اطلاعاتی --- */
    var facts = [];
    var fab = F ? F.fabricInfo(p.fabric) : null;
    if (fab) facts.push({ t: fab.name, tip: fab.care + ' · ' + fab.season });

    var fit = F ? F.fitInfo(p.fit) : null;
    if (fit) facts.push({ t: fit.name, tip: fit.tip });

    var vers = F ? F.versatility(p, hue, x.slot) : null;
    if (vers) {
      facts.push({
        t: vers.label,
        tip: 'با حدود ' + FA(vers.count) + ' قطعه‌ی دیگر ست می‌شود',
      });
    }

    /* --- رنگ‌ها: نقطه‌های واقعی + نام دقیق --- */
    var swatch = '';
    if (window.DPPalette) {
      var cl = DPPalette.colorsOf(p).slice(0, 4);
      if (cl.length) {
        swatch = '<span class="ai-swatch" title="'
          + esc(cl.map(function (k) {
              var d = DPPalette.describe(k);
              return d ? d.name : k;
            }).join(' و ')) + '">'
          + cl.map(function (k) {
              var H = DPPalette.HUE[k];
              return '<i style="background:' + (H ? H.hex : '#ccc') + '"></i>';
            }).join('')
          + '</span>';

        /* طرح پارچه، اگر ساده نباشد */
        var pt = DPPalette.patternOf(p.pattern);
        if (pt.busy > 0) {
          facts.push({
            t: pt.name,
            tip: pt.busy >= 3 ? 'طرح پرجلوه — بقیه‌ی تیپ را ساده بگیرید'
               : 'طرح ملایم — با ساده‌ها خوب ست می‌شود',
          });
        }

        /* فصل رنگ */
        var sea = DPPalette.seasonOf(cl[0]);
        if (sea) facts.push({ t: sea.name, tip: 'پالت ' + sea.hint });
      }
    }

    var factRow = facts.length
      ? '<div class="ai-facts">' + facts.map(function (f) {
          return '<span class="ai-fact" title="' + esc(f.tip) + '">' + esc(f.t) + '</span>';
        }).join('') + '</div>'
      : '';

    /* --- موجودی، بدون گفتن عدد --- */
    var stockTag = '';
    if (window.DPStock) {
      try {
        var st = DPStock.status(Number(p.stock) || 0);
        if (st && st.level !== 'ok') {
          stockTag = '<span class="ai-stock is-' + st.tone + '">'
            + esc(st.short) + '</span>';
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    /* --- نکته‌ی حرفه‌ای زیر کارت --- */
    var tip = F ? F.tipFor(x.slot, p.id) : '';

    return '<article class="pdai-card' + (x.self ? ' is-self' : '') + '">'
      + '<a class="ai-shot" href="' + url + '" aria-label="دیدن ' + esc(p.name) + '">'
      +   (img
            ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
            : '<span class="ai-noimg">' + esc((p.name || '؟').trim()[0]) + '</span>')
      +   '<span class="ai-slot">' + esc(SL[x.slot] || '') + '</span>'
      +   (x.self ? '<span class="ai-self">این کالا</span>' : '')
      +   stockTag
      + '</a>'

      + '<div class="ai-body">'
      +   '<a class="ai-name" href="' + url + '">' + esc(p.name) + '</a>'
      +   '<div class="ai-price">' + money(pr.price != null ? pr.price : pr)
      +     '<small>تومان</small>'
      +     (pr.percent ? '<em class="ai-off">٪' + FA(pr.percent) + '−</em>' : '')
      +   '</div>'
      +   swatch
      +   sizeRow
      +   factRow
      +   (x.why ? '<p class="ai-why">' + svg(I.check, 'ico ico-s') + esc(x.why) + '</p>' : '')
      +   (tip ? '<p class="pdai-tip">' + esc(tip) + '</p>' : '')
      + '</div></article>';
  }

  function miniCard(x, hideShop) {
    var s = priceOf(x);
    var img = arr(x.images)[0];
    var stock = Number(x.stock) || 0;
    var low = stock > 0 && stock <= 3;
    var out = stock === 0;
    var url = './product.html?id=' + encodeURIComponent(x.id);

    /* امتیاز فروشگاه — یک نشان کوچک روی عکس.
       اعتماد می‌سازد بدون اینکه جا بگیرد. */
    var rate = null;
    try {
      if (window.DPReviews) rate = DPReviews.storeRatingsMap()[x.sellerId] || null;
    } catch (e) { /* بی‌اهمیت */ }

    /* کالای بدون سایز یا رنگ را می‌شود یک‌ضرب به سبد افزود.
       بقیه باید صفحه‌ی کالا را باز کنند تا انتخاب کنند. */
    var simple = !arr(x.sizes).length && !out;

    return '<article class="pd-mini' + (out ? ' dim' : '') + '">'
      + '<a class="pd-mini-thumb" href="' + url + '" aria-label="دیدن ' + esc(x.name) + '">'
      +   (img
            ? '<img src="' + esc(img) + '" alt="' + esc(x.name) + '" loading="lazy" />'
            : '<span>' + esc((x.name || '؟').trim()[0]) + '</span>')
      +   (s.percent ? '<em class="pd-mini-off">' + FA(s.percent) + '٪</em>' : '')
      +   (out ? '<em class="pd-mini-out">ناموجود</em>' : '')
      +   (rate && rate.count
            ? '<span class="pd-mini-rate">' + svg(I.star, '') + FA(rate.avg) + '</span>'
            : '')
      + '</a>'
      + '<div class="pd-mini-body">'
      +   (hideShop ? '' : '<span class="pd-mini-shop">' + esc(x.sellerName) + '</span>')
      +   '<a class="pd-mini-name" href="' + url + '">' + esc(x.name) + '</a>'
      +   '<div class="pd-mini-foot">'
      +     '<span class="pd-mini-price">'
      +       (s.percent ? '<s>' + money(s.old) + '</s>' : '')
      +       money(s.price) + '<small>تومان</small></span>'
      +     (simple
              ? '<button class="pd-mini-add" type="button" data-quick="' + esc(x.id) + '"'
                + ' aria-label="افزودن ' + esc(x.name) + ' به سبد">'
                + svg(I.plus, '') + '</button>'
              : '')
      +   '</div>'
      +   (low && window.DPStock
              ? '<span class="pd-mini-low">' + DPStock.status(stock).short + '</span>' : '')
      + '</div></article>';
  }

  /* ============================================================
     علاقه‌مندی
     ============================================================ */
  function wishList() {
    try {
      var v = JSON.parse(localStorage.getItem(WISH_KEY));
      return Array.isArray(v) ? v.map(String) : [];
    } catch (e) { return []; }
  }
  function isWished(id) { return wishList().indexOf(String(id)) > -1; }
  function toggleWish(id) {
    var l = wishList();
    var i = l.indexOf(String(id));
    if (i > -1) l.splice(i, 1); else l.push(String(id));
    try { localStorage.setItem(WISH_KEY, JSON.stringify(l)); } catch (e) { /* */ }
    document.dispatchEvent(new CustomEvent('dp:wishlist'));
    return i < 0;
  }

  /* ============================================================
     پیام کوتاه
     ============================================================ */
  var tEl = null, tTimer = null;
  function toast(text, kind) {
    if (!tEl) {
      tEl = document.createElement('div');
      tEl.className = 'pd-toast';
      tEl.setAttribute('role', 'status');
      tEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(tEl);
    }
    tEl.textContent = text;
    tEl.className = 'pd-toast on' + (kind ? ' ' + kind : '');
    clearTimeout(tTimer);
    tTimer = setTimeout(function () { tEl.classList.remove('on'); }, 2800);
  }

  /* ============================================================
     رویدادها
     ============================================================ */
  function wire() {
    document.addEventListener('click', function (e) {

      /* ---------- نگارخانه ---------- */
      var th = e.target.closest('[data-shot]');
      if (th) {
        shot = Number(th.dataset.shot) || 0;
        paintGallery();
        return;
      }

      if (e.target.closest('[data-zoom]')) { openLightbox(); return; }
      if (e.target.closest('[data-lbx]')) { closeLightbox(); return; }

      /* بزرگ‌نمایی درون نمای کامل */
      if (e.target.closest('[data-lbzoom]')) { toggleLbZoom(); return; }

      /* پریدن به یک عکس از نوار بندانگشتی */
      var lbg = e.target.closest('[data-lbgo]');
      if (lbg) { jumpShot(Number(lbg.dataset.lbgo)); return; }
      var lbn = e.target.closest('[data-lbnav]');
      if (lbn) { stepShot(Number(lbn.dataset.lbnav)); return; }

      /* ---------- کلیک روی خود عکس ----------
         مشتری انتظار دارد با کلیک روی عکس، گالری باز شود —
         همان کاری که در دیجی‌کالا می‌کند. */
      if (e.target.closest('#pdStage') && !document.querySelector('.pd-lightbox')) {
        openLightbox();
        return;
      }

      /* ---------- رنگ ---------- */
      var dot = e.target.closest('[data-color]');
      if (dot) {
        pickColor = dot.dataset.color;
        paintBuy();
        return;
      }

      /* ---------- سایز ---------- */
      var sz = e.target.closest('[data-size]');
      if (sz) {
        pickSize = pickSize === sz.dataset.size ? '' : sz.dataset.size;
        paintBuy();
        return;
      }

      /* ---------- راهنمای سایز ---------- */
      if (e.target.closest('[data-guide]')) { openGuide(); return; }
      if (e.target.closest('[data-gclose]')) { closeGuide(); return; }

      /* ---------- تعداد ---------- */
      var q = e.target.closest('[data-q]');
      if (q) {
        var max = Math.max(1, Number(P.stock) || 1);
        qty = Math.min(max, Math.max(1, qty + Number(q.dataset.q)));
        var el = $('#pdQty');
        if (el) el.textContent = FA(qty);
        /* اینجا گفتن عدد اشکالی ندارد — مشتری خودش تا همینجا
           شمرده و باید بداند چرا بیشتر نمی‌شود */
        if (qty === max && max > 1) toast('بیشتر از این موجود نیست');
        return;
      }

      /* ---------- افزودن به سبد ---------- */
      if (e.target.closest('[data-add]')) { addToCart(); return; }

      /* ---------- علاقه‌مندی ---------- */
      if (e.target.closest('[data-wish]')) {
        var on = toggleWish(P.id);
        paintBuy();
        toast(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها برداشته شد');
        return;
      }

      /* ---------- اشتراک‌گذاری ---------- */
      if (e.target.closest('[data-share]')) { share(); return; }

      /* ---------- افزودن کل ست به سبد ---------- */
      if (e.target.closest('[data-outfit]')) { addOutfit(); return; }

      /* ---------- افزودن سریع از کارت پیشنهاد ---------- */
      var qa = e.target.closest('[data-quick]');
      if (qa) {
        e.preventDefault();
        quickAdd(qa);
        return;
      }

      /* ---------- نوار افقی پیشنهادها ---------- */
      var sl = e.target.closest('[data-slide]');
      if (sl) {
        var rail = sl.closest('.pd-strip').querySelector('.pd-rail');
        if (rail) {
          /* در صفحه‌ی راست‌به‌چپ، جهت پیمایش وارونه است */
          rail.scrollBy({ left: Number(sl.dataset.slide) * -260, behavior: 'smooth' });
        }
        return;
      }
    });

    /* ---------- صفحه‌کلید در نمای بزرگ ---------- */
    document.addEventListener('keydown', function (e) {
      if (!document.querySelector('.pd-lightbox')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') stepShot(-1);
      if (e.key === 'ArrowLeft') stepShot(1);
    });

    /* با تغییر اندازه‌ی پنجره، دوباره بسنجیم */
    var rz = null;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(measureStrips, 160);
    }, { passive: true });

    /* عکس‌ها که بارگذاری شدند، عرض‌ها عوض می‌شود */
    window.addEventListener('load', measureStrips);

    /* نظر تازه که ثبت شد، امتیاز بالای صفحه هم تازه شود */
    document.addEventListener('dp:review', function () {
      paintBuy();
      setMeta();
    });
  }

  /* ============================================================
     افزودن همه‌ی ست به سبد
     ------------------------------------------------------------
     کالایی که سایز دارد را نمی‌شود کورکورانه افزود —
     مشتری باید خودش انتخاب کند وگرنه مرجوعی می‌شود.
     پس فقط قطعه‌های بدون سایز یک‌جا افزوده می‌شوند و
     بقیه به مشتری گفته می‌شود.
     ============================================================ */
  function addOutfit() {
    if (!OUTFIT || !window.DPCart) return;

    /* ---------- آموزش مغز: پیشنهاد پذیرفته شد ----------
       این طلایی‌ترین سیگنال برای موتور ست است: مشتری دید
       که ما چه پیشنهاد دادیم و **قبول کرد**. یعنی قاعده‌ی
       ما درست بوده. مغز باید همین را تقویت کند. */
    if (window.DPBrain) {
      try {
        DPBrain.track('outfit', {
          items: [P].concat(OUTFIT.items.map(function (x) { return x.p; })),
        });
      } catch (e) { /* بی‌اهمیت */ }
    }

    var added = 0;
    var needSize = [];

    OUTFIT.items.forEach(function (x) {
      if (arr(x.p.sizes).length) { needSize.push(x.p.name); return; }
      try {
        DPCart.add(x.p.id, { qty: 1, color: arr(x.p.colors)[0] || '', size: '' });
        added++;
      } catch (err) { /* موجودی تمام شده */ }
    });

    if (!added && needSize.length) {
      toast('قطعه‌های این ست سایز دارند — '
        + 'روی هرکدام بزنید و سایزش را انتخاب کنید', 'bad');
      return;
    }

    var msg = FA(added) + ' قطعه از ست به سبد اضافه شد';
    if (needSize.length) {
      msg += ' — ' + FA(needSize.length) + ' قطعه سایز می‌خواهد';
    }
    toast(msg, 'good');

    var btn = $('.pd-outfit-add');
    if (btn) {
      btn.classList.add('done');
      setTimeout(function () { btn.classList.remove('done'); }, 1600);
    }
  }

  /* ============================================================
     افزودن سریع از نوار پیشنهاد
     ------------------------------------------------------------
     فقط برای کالایی که سایز ندارد — بقیه باید صفحه‌شان باز شود
     تا مشتری سایز را انتخاب کند و بعداً مرجوعی نداشته باشیم.
     ============================================================ */
  function quickAdd(btn) {
    var id = btn.dataset.quick;
    var p = ALL.find(function (x) { return String(x.id) === String(id); });
    if (!p || !window.DPCart) return;

    try {
      DPCart.add(p.id, { qty: 1, color: arr(p.colors)[0] || '', size: '' });
      btn.classList.add('done');
      btn.innerHTML = svg(I.check, '');
      toast('«' + p.name + '» به سبد اضافه شد', 'good');

      setTimeout(function () {
        btn.classList.remove('done');
        btn.innerHTML = svg(I.plus, '');
      }, 1600);
    } catch (err) {
      toast(err && err.message ? err.message : 'افزودن انجام نشد', 'bad');
    }
  }

  /* ============================================================
     آیا نوار پیشنهاد نیاز به پیمایش دارد؟
     ------------------------------------------------------------
     اگر همه‌ی کارت‌ها در یک نگاه جا می‌شوند، دکمه‌های چپ و راست
     بی‌معنا هستند و فقط شلوغی می‌کنند. محو شدن لبه هم نباید
     باشد چون چیزی پشتش پنهان نیست.
     ============================================================ */
  function measureStrips() {
    document.querySelectorAll('.pd-strip').forEach(function (st) {
      var rail = st.querySelector('.pd-rail');
      if (!rail) return;
      var fits = rail.scrollWidth <= rail.clientWidth + 4;
      st.classList.toggle('no-scroll', fits);
    });
  }

  /* ============================================================
     افزودن به سبد
     ============================================================ */
  function addToCart() {
    if (Number(P.stock) === 0) { toast('این کالا موجود نیست', 'bad'); return; }

    var sizes = arr(P.sizes);
    if (sizes.length && !pickSize) {
      var w = $('#pdSizeWarn');
      if (w) { w.hidden = false; w.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      toast('اول سایز را انتخاب کنید', 'bad');
      return;
    }

    if (!window.DPCart) { toast('سبد خرید در دسترس نیست', 'bad'); return; }

    try {
      DPCart.add(P.id, { qty: qty, color: pickColor, size: pickSize });
      toast(FA(qty) + ' عدد به سبد خرید اضافه شد', 'good');

      var btn = $('.pd-add');
      if (btn) {
        btn.classList.add('done');
        setTimeout(function () { btn.classList.remove('done'); }, 1400);
      }
    } catch (err) {
      toast(err && err.message ? err.message : 'افزودن انجام نشد', 'bad');
    }
  }

  /* ============================================================
     اشتراک‌گذاری
     ============================================================ */
  function share() {
    var data = {
      title: P.name,
      text: P.name + ' — ' + money(priceOf(P).price) + ' تومان در دیجی‌پوش',
      url: location.href,
    };
    if (navigator.share) {
      navigator.share(data).catch(function () { copyLink(); });
    } else copyLink();
  }

  function copyLink() {
    var url = location.href;
    var ok = function () { toast('نشانی کالا کپی شد'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok, function () { legacyCopy(url, ok); });
    } else legacyCopy(url, ok);
  }

  function legacyCopy(text, done) {
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
    } catch (e) { toast('کپی نشد — نشانی را از نوار مرورگر بردارید', 'bad'); }
  }

  /* ============================================================
     ذره‌بین روی هاور
     ------------------------------------------------------------
     هر فروشگاه مد حرفه‌ای این را دارد: موشواره را روی
     عکس می‌برید و همان نقطه بزرگ می‌شود. مشتری
     می‌تواند دوخت، بافت پارچه و جزئیات را ببیند — همان
     چیزی که در مغازه‌ی واقعی با دست لمس می‌کرد.

     روی صفحه‌ی لمسی خاموش است — آنجا هاوری وجود
     ندارد و دکمه‌ی بزرگ‌نمایی کارش را می‌کند.
     ============================================================ */
  var ZOOM = 2.2;

  function wireLens() {
    var stage = $('#pdStage');
    var img = $('#pdBig');
    if (!stage || !img) return;

    /* روی لمسی یا صفحه‌ی کوچک، ذره‌بین معنا ندارد */
    var fine = false;
    try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; }
    catch (e) { fine = window.innerWidth > 1020; }
    if (!fine) return;

    var on = false;

    stage.addEventListener('mouseenter', function () {
      on = true;
      stage.classList.add('is-lens');
      img.style.transform = 'scale(' + ZOOM + ')';
    });

    stage.addEventListener('mouseleave', function () {
      on = false;
      stage.classList.remove('is-lens');
      img.style.transform = '';
      img.style.transformOrigin = '';
    });

    stage.addEventListener('mousemove', function (e) {
      if (!on) return;
      var r = stage.getBoundingClientRect();
      /* موقعیت موشواره به درصد — همان نقطه می‌ماند
         محور بزرگ‌نمایی */
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      img.style.transformOrigin =
        Math.max(0, Math.min(100, x)) + '% ' + Math.max(0, Math.min(100, y)) + '%';
    });
  }

  /* ============================================================
     نمای بزرگ عکس
     ============================================================ */
  function openLightbox() {
    var imgs = arr(P.images);
    if (!imgs.length) return;
    if (document.querySelector('.pd-lightbox')) return;

    var box = document.createElement('div');
    box.className = 'pd-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '\u06af\u0627\u0644\u0631\u06cc \u0639\u06a9\u0633\u200c\u0647\u0627\u06cc ' + P.name);

    box.innerHTML =
      /* ---------- \u0646\u0648\u0627\u0631 \u0628\u0627\u0644\u0627 ---------- */
      '<div class="pd-lb-top">'
      +   '<span class="pd-lb-name">' + esc(P.name) + '</span>'
      +   '<div class="pd-lb-tools">'
      +     (imgs.length > 1
            ? '<span class="pd-lbcount"><b>' + FA(shot + 1) + '</b> \u0627\u0632 '
              + FA(imgs.length) + '</span>' : '')
      +     '<button class="pd-lb-btn" type="button" data-lbzoom'
      +       ' aria-label="\u0628\u0632\u0631\u06af\u200c\u0646\u0645\u0627\u06cc\u06cc \u0628\u06cc\u0634\u062a\u0631">'
      +       svg(I.zoom) + '</button>'
      +     '<button class="pd-lb-btn pd-lbx" type="button" data-lbx'
      +       ' aria-label="\u0628\u0633\u062a\u0646">'
      +       svg('<path d="M18 6 6 18M6 6l12 12"/>') + '</button>'
      +   '</div>'
      + '</div>'

      /* ---------- \u0635\u062d\u0646\u0647 ---------- */
      + '<div class="pd-lb-stage" data-lbstage>'
      +   (imgs.length > 1
          ? '<button class="pd-lbnav prev" type="button" data-lbnav="-1"'
            + ' aria-label="\u0639\u06a9\u0633 \u0642\u0628\u0644\u06cc">'
            + svg('<path d="M15 5.5 8.5 12 15 18.5"/>') + '</button>'
            + '<button class="pd-lbnav next" type="button" data-lbnav="1"'
            + ' aria-label="\u0639\u06a9\u0633 \u0628\u0639\u062f\u06cc">'
            + svg(I.back) + '</button>'
          : '')
      +   '<img id="pdLbImg" src="' + esc(imgs[shot]) + '"'
      +     ' alt="' + esc(P.name) + '" />'
      + '</div>'

      /* ---------- \u0646\u0648\u0627\u0631 \u0628\u0646\u062f\u0627\u0646\u06af\u0634\u062a\u06cc ---------- */
      + (imgs.length > 1
        ? '<div class="pd-lb-strip" role="group"'
          + ' aria-label="\u0647\u0645\u0647\u200c\u06cc \u0639\u06a9\u0633\u200c\u0647\u0627">'
          + imgs.map(function (src, i) {
              return '<button class="pd-lb-thumb' + (i === shot ? ' on' : '') + '"'
                + ' type="button" data-lbgo="' + i + '"'
                + ' aria-label="\u0639\u06a9\u0633 \u0634\u0645\u0627\u0631\u0647 ' + FA(i + 1) + '"'
                + ' aria-pressed="' + (i === shot) + '">'
                + '<img src="' + esc(src) + '" alt="" loading="lazy" /></button>';
            }).join('')
          + '</div>'
        : '');

    /* \u06a9\u0644\u06cc\u06a9 \u0631\u0648\u06cc \u0632\u0645\u06cc\u0646\u0647 \u0645\u06cc\u200c\u0628\u0646\u062f\u062f */
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.hasAttribute('data-lbstage')) closeLightbox();
    });

    /* ---------- \u06a9\u0634\u06cc\u062f\u0646 \u0631\u0648\u06cc \u0644\u0645\u0633\u06cc ----------
       \u0645\u0634\u062a\u0631\u06cc \u0631\u0648\u06cc \u06af\u0648\u0634\u06cc \u0627\u0646\u062a\u0638\u0627\u0631 \u062f\u0627\u0631\u062f \u0639\u06a9\u0633\u200c\u0647\u0627 \u0631\u0627 \u0628\u0627 \u0627\u0646\u06af\u0634\u062a
       \u0639\u0648\u0636 \u06a9\u0646\u062f \u2014 \u0647\u0645\u0627\u0646 \u06a9\u0627\u0631\u06cc \u06a9\u0647 \u062f\u0631 \u062f\u06cc\u062c\u06cc\u200c\u06a9\u0627\u0644\u0627 \u0645\u06cc\u200c\u06a9\u0646\u062f. */
    var sx = 0, sy = 0, moved = false;
    box.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = false;
    }, { passive: true });

    box.addEventListener('touchmove', function () { moved = true; }, { passive: true });

    box.addEventListener('touchend', function (e) {
      if (!moved || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      /* \u0641\u0642\u0637 \u06a9\u0634\u06cc\u062f\u0646 \u0627\u0641\u0642\u06cc \u0648 \u0628\u0647 \u0627\u0646\u062f\u0627\u0632\u0647\u200c\u06cc \u06a9\u0627\u0641\u06cc */
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      /* \u062f\u0631 \u0635\u0641\u062d\u0647\u200c\u06cc \u0631\u0627\u0633\u062a\u200c\u0628\u0647\u200c\u0686\u067e\u060c \u06a9\u0634\u06cc\u062f\u0646 \u0628\u0647 \u0631\u0627\u0633\u062a = \u0639\u06a9\u0633 \u0628\u0639\u062f\u06cc */
      stepShot(dx > 0 ? 1 : -1);
    }, { passive: true });

    document.body.appendChild(box);
    document.body.classList.add('pd-lock');

    var x = box.querySelector('[data-lbx]');
    if (x) x.focus();
  }

  /* ============================================================
     \u0628\u0632\u0631\u06af\u200c\u0646\u0645\u0627\u06cc\u06cc \u062f\u0631\u0648\u0646 \u0646\u0645\u0627\u06cc \u06a9\u0627\u0645\u0644
     ------------------------------------------------------------
     \u062f\u06a9\u0645\u0647\u200c\u06cc \u0630\u0631\u0647\u200c\u0628\u06cc\u0646 \u0639\u06a9\u0633 \u0631\u0627 \u062f\u0648 \u0628\u0631\u0627\u0628\u0631 \u0645\u06cc\u200c\u06a9\u0646\u062f \u0648 \u0628\u0627 \u0645\u0648\u0634\u0648\u0627\u0631\u0647
     \u06cc\u0627 \u0627\u0646\u06af\u0634\u062a \u0645\u06cc\u200c\u0634\u0648\u062f \u062f\u0631 \u0622\u0646 \u06af\u0634\u062a.
     ============================================================ */
  function toggleLbZoom() {
    var img = document.getElementById('pdLbImg');
    var stage = document.querySelector('[data-lbstage]');
    if (!img || !stage) return;

    var on = stage.classList.toggle('is-zoom');
    img.style.transform = on ? 'scale(2)' : '';
    img.style.transformOrigin = '50% 50%';

    if (!on) return;

    /* \u062d\u0631\u06a9\u062a \u0645\u0648\u0634\u0648\u0627\u0631\u0647 = \u06af\u0634\u062a\u0646 \u062f\u0631 \u0639\u06a9\u0633 */
    var move = function (e) {
      var pt = e.touches && e.touches[0] ? e.touches[0] : e;
      var r = stage.getBoundingClientRect();
      var px = ((pt.clientX - r.left) / r.width) * 100;
      var py = ((pt.clientY - r.top) / r.height) * 100;
      img.style.transformOrigin =
        Math.max(0, Math.min(100, px)) + '% ' + Math.max(0, Math.min(100, py)) + '%';
    };
    stage.addEventListener('mousemove', move);
    stage.addEventListener('touchmove', move, { passive: true });
  }

  function closeLightbox() {
    var b = document.querySelector('.pd-lightbox');
    if (b) b.remove();
    document.body.classList.remove('pd-lock');
  }

  /** \u067e\u0631\u06cc\u062f\u0646 \u0645\u0633\u062a\u0642\u06cc\u0645 \u0628\u0647 \u06cc\u06a9 \u0639\u06a9\u0633 */
  function jumpShot(i) {
    var imgs = arr(P.images);
    if (!imgs.length) return;
    shot = Math.max(0, Math.min(imgs.length - 1, Number(i) || 0));
    syncShot();
  }

  /** \u0647\u0645\u0627\u0647\u0646\u06af\u200c\u06a9\u0631\u062f\u0646 \u0647\u0645\u0647\u200c\u06cc \u062c\u0627\u0647\u0627\u06cc\u06cc \u06a9\u0647 \u0639\u06a9\u0633 \u062f\u06cc\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f */
  function syncShot() {
    var imgs = arr(P.images);

    var big = document.getElementById('pdLbImg');
    if (big) {
      big.src = imgs[shot];
      /* \u0628\u0627 \u0639\u0648\u0636 \u0634\u062f\u0646 \u0639\u06a9\u0633\u060c \u0628\u0632\u0631\u06af\u200c\u0646\u0645\u0627\u06cc\u06cc \u0635\u0641\u0631 \u0645\u06cc\u200c\u0634\u0648\u062f */
      big.style.transform = '';
      var stg = document.querySelector('[data-lbstage]');
      if (stg) stg.classList.remove('is-zoom');
    }

    var c = document.querySelector('.pd-lbcount b');
    if (c) c.textContent = FA(shot + 1);

    document.querySelectorAll('.pd-lb-thumb').forEach(function (t, i) {
      var on = i === shot;
      t.classList.toggle('on', on);
      t.setAttribute('aria-pressed', String(on));
      /* \u0639\u06a9\u0633 \u0641\u0639\u0627\u0644 \u0647\u0645\u06cc\u0634\u0647 \u062f\u0631 \u062f\u06cc\u062f \u0628\u0645\u0627\u0646\u062f */
      if (on && t.scrollIntoView) {
        try { t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        catch (e) { /* */ }
      }
    });

    paintGallery();
  }

  function stepShot(d) {
    var imgs = arr(P.images);
    if (imgs.length < 2) return;
    shot = (shot + d + imgs.length) % imgs.length;
    syncShot();
  }

  /* ============================================================
     راهنمای سایز
     ------------------------------------------------------------
     جدول عمومی پوشاک ایرانی. عمداً ساده نگه داشته شده چون
     فروشنده‌ها جدول اختصاصی ثبت نمی‌کنند.
     ============================================================ */
  var GUIDE = [
    ['XS', '۳۶', '۸۲ تا ۸۶', '۶۲ تا ۶۶', '۸۸ تا ۹۲'],
    ['S',  '۳۸', '۸۷ تا ۹۱', '۶۷ تا ۷۱', '۹۳ تا ۹۷'],
    ['M',  '۴۰', '۹۲ تا ۹۶', '۷۲ تا ۷۶', '۹۸ تا ۱۰۲'],
    ['L',  '۴۲', '۹۷ تا ۱۰۲', '۷۷ تا ۸۲', '۱۰۳ تا ۱۰۸'],
    ['XL', '۴۴', '۱۰۳ تا ۱۰۸', '۸۳ تا ۸۸', '۱۰۹ تا ۱۱۴'],
    ['2XL', '۴۶', '۱۰۹ تا ۱۱۵', '۸۹ تا ۹۵', '۱۱۵ تا ۱۲۱'],
  ];

  function openGuide() {
    if (document.querySelector('.pd-guidebox')) return;

    var box = document.createElement('div');
    box.className = 'pd-guidebox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'راهنمای انتخاب سایز');
    box.innerHTML =
      '<div class="pd-guide-card">'
      + '<div class="pd-guide-head"><h3>' + svg(I.ruler) + ' راهنمای انتخاب سایز</h3>'
      +   '<button type="button" data-gclose aria-label="بستن">'
      +     svg('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>'
      + '<p class="pd-guide-tip">اندازه‌ها به سانتی‌متر است. با متر نواری روی '
      +   'بدن اندازه بگیرید، نه روی لباس.</p>'
      + '<div class="pd-guide-scroll"><table class="pd-spectable"><thead><tr>'
      +   '<th>سایز</th><th>شماره</th><th>دور سینه</th><th>دور کمر</th><th>دور باسن</th>'
      + '</tr></thead><tbody>'
      + GUIDE.map(function (r) {
          var on = r[0] === pickSize;
          return '<tr' + (on ? ' class="on"' : '') + '><th scope="row">' + r[0] + '</th>'
            + r.slice(1).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('')
      + '</tbody></table></div>'
      + '<p class="pd-guide-tip">بین دو سایز مانده‌اید؟ سایز بزرگ‌تر را بگیرید — '
      +   'تنگ بودن آزاردهنده‌تر از گشاد بودن است.</p>'
      + '</div>';

    box.addEventListener('click', function (e) { if (e.target === box) closeGuide(); });
    document.body.appendChild(box);
    document.body.classList.add('pd-lock');
  }

  function closeGuide() {
    var b = document.querySelector('.pd-guidebox');
    if (b) b.remove();
    document.body.classList.remove('pd-lock');
  }

  /* ============================================================
     راه‌اندازی
     ============================================================ */
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', run, { once: true })
    : run();

  window.DPProductPage = { reload: run };
})();
