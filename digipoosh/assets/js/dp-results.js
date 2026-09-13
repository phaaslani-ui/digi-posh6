/* ============================================================
   dp-results.js — صفحه‌ی نتایج جست‌وجو
   ------------------------------------------------------------
   کاربر عبارتی را در جعبه‌ی جست‌وجو انتخاب می‌کند و اینجا
   می‌رسد. این صفحه باید:

     · نتیجه‌های مرتبط را با کارت کامل نشان دهد
     · فیلترهای هوشمند بسازد (فقط آنچه در نتیجه هست)
     · غلط تایپی را اصلاح کند
     · وقتی چیزی نبود، دست‌خالی نفرستد
     · به مغز یاد بدهد کاربر چه انتخاب کرد
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var FAD = '۰۱۲۳۴۵۶۷۸۹';

  function FA(n) { return String(n).replace(/\d/g, function (d) { return FAD[+d]; }); }
  function money(n) { return FA(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬'); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.6" '
         + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  function svg(p, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" ' + SW + '>' + p + '</svg>';
  }

  var I = {
    cart:  '<path d="M3.5 4.5h2l2.2 10.5h9.6l2.2-8H6.2"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    plus:  '<path d="M12 5.5v13M5.5 12h13"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    empty: '<circle cx="11" cy="11" r="6.5"/><path d="m15.8 15.8 4.2 4.2"/><path d="M8.5 11h5"/>',
    spark: '<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9z"/>',
    star:  '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
  };

  /* ============================================================
     وضعیت صفحه
     ============================================================ */
  var Q = '';            /* عبارت جاری */
  var HITS = [];         /* نتیجه‌های خام */
  var VIEW = [];         /* پس از فیلتر و مرتب‌سازی */
  var F = {};            /* فیلترهای فعال */
  var SORT = 'best';

  /* ============================================================
     شروع
     ============================================================ */
  function run() {
    var p = new URLSearchParams(location.search);
    Q = p.get('q') || '';
    SORT = p.get('sort') || 'best';

    var input = $('#srInput');
    if (input) input.value = Q;

    var sel = $('#srSort');
    if (sel) sel.value = SORT;

    wire();
    go();
  }

  function go() {
    if (!window.DPSuggest) return;

    HITS = Q ? DPSuggest.search(Q) : [];

    document.title = Q
      ? Q + ' | جست‌وجو در دیجی‌پوش'
      : 'جست‌وجو | دیجی‌پوش';

    $('#srTitle').textContent = Q ? '«' + Q + '»' : 'جست‌وجو';

    /* ---------- آموزش مغز ---------- */
    if (Q && window.DPBrain) {
      try { DPBrain.track('search', { term: Q }); } catch (e) { /* بی‌اهمیت */ }
    }

    F = {};
    buildFilters();
    apply();
    fixHint();
  }

  /* ============================================================
     اصلاح غلط تایپی
     ------------------------------------------------------------
     «آیا منظورتان … بود؟» — فقط وقتی نتیجه کم است و
     پیشنهاد بهتری وجود دارد.
     ============================================================ */
  function fixHint() {
    var box = $('#srFix');
    box.hidden = true;
    if (!Q || HITS.length >= 4) return;

    var alt = DPSuggest.suggest(Q, 5)
      .filter(function (s) {
        return s.count > HITS.length && DPSuggest.norm(s.text) !== DPSuggest.norm(Q);
      });

    if (!alt.length) return;

    box.hidden = false;
    box.innerHTML = 'شاید منظورتان این بود: '
      + alt.slice(0, 3).map(function (s) {
          return '<a href="./search.html?q=' + encodeURIComponent(s.text) + '">'
            + esc(s.text) + '<small>' + FA(s.count) + ' کالا</small></a>';
        }).join('');
  }

  /* ============================================================
     فیلترهای هوشمند
     ------------------------------------------------------------
     مهم: فقط فیلترهایی ساخته می‌شوند که **در همین نتیجه‌ها**
     وجود دارند. فیلتری که به صفحه‌ی خالی برسد، بی‌فایده است.
     ============================================================ */
  function buildFilters() {
    var tools = $('#srTools');
    var wrap = $('#srChips');

    if (HITS.length < 3) { tools.hidden = true; return; }
    tools.hidden = false;

    var cats = {}, colors = {}, shops = {}, secs = {};

    var SEC = { women:'زنانه', men:'مردانه', kids:'بچگانه',
                teen:'نوجوان', girls:'دخترانه', boys:'پسرانه' };

    HITS.forEach(function (p) {
      if (p.category) cats[p.category] = (cats[p.category] || 0) + 1;
      if (p.shop) shops[p.shop] = (shops[p.shop] || 0) + 1;

      var sc = SEC[p.section] || SEC[p.sec];
      if (sc) secs[sc] = (secs[sc] || 0) + 1;

      if (window.DPPalette) {
        try {
          DPPalette.colorsOf(p).slice(0, 2).forEach(function (c) {
            var H = DPPalette.HUE[c];
            if (H) colors[c] = (colors[c] || 0) + 1;
          });
        } catch (e) { /* بی‌اهمیت */ }
      }
    });

    var html = '';

    function group(label, obj, kind, render) {
      var keys = Object.keys(obj)
        .filter(function (k) { return obj[k] >= 1; })
        .sort(function (a, b) { return obj[b] - obj[a]; })
        .slice(0, 7);

      /* اگر همه‌ی نتیجه‌ها یک مقدار دارند، فیلتر بی‌معناست */
      if (keys.length < 2) return;

      html += '<div class="sr-grp"><span class="sr-glabel">' + esc(label) + '</span>';
      keys.forEach(function (k) {
        html += render(k, obj[k]);
      });
      html += '</div>';
    }

    group('دسته', cats, 'cat', function (k, n) {
      return '<button class="sr-chip" type="button" data-f="cat" data-v="' + esc(k) + '">'
        + esc(k) + '<i>' + FA(n) + '</i></button>';
    });

    group('برای', secs, 'sec', function (k, n) {
      return '<button class="sr-chip" type="button" data-f="sec" data-v="' + esc(k) + '">'
        + esc(k) + '<i>' + FA(n) + '</i></button>';
    });

    group('رنگ', colors, 'color', function (k, n) {
      var H = window.DPPalette ? DPPalette.HUE[k] : null;
      return '<button class="sr-chip sr-cchip" type="button" data-f="color" data-v="' + esc(k) + '">'
        + '<span class="sr-dot" style="background:' + (H ? H.hex : '#ccc') + '"></span>'
        + esc(H ? H.name : k) + '<i>' + FA(n) + '</i></button>';
    });

    group('فروشگاه', shops, 'shop', function (k, n) {
      return '<button class="sr-chip" type="button" data-f="shop" data-v="' + esc(k) + '">'
        + esc(k) + '<i>' + FA(n) + '</i></button>';
    });

    /* فیلترهای وضعیتی */
    var hasSale = HITS.some(function (p) {
      try { return window.DPPromo && DPPromo.sales.priceOf(p).percent > 0; }
      catch (e) { return false; }
    });
    var hasStock = HITS.some(function (p) { return Number(p.stock) > 0; });

    if (hasSale || hasStock) {
      html += '<div class="sr-grp"><span class="sr-glabel">ویژه</span>';
      if (hasSale) {
        html += '<button class="sr-chip" type="button" data-f="sale" data-v="1">تخفیف‌دار</button>';
      }
      if (hasStock) {
        html += '<button class="sr-chip" type="button" data-f="stock" data-v="1">فقط موجود</button>';
      }
      html += '</div>';
    }

    wrap.innerHTML = html;
  }

  /* ============================================================
     اعمال فیلتر و مرتب‌سازی
     ============================================================ */
  function apply() {
    var SEC = { women:'زنانه', men:'مردانه', kids:'بچگانه',
                teen:'نوجوان', girls:'دخترانه', boys:'پسرانه' };

    VIEW = HITS.filter(function (p) {
      if (F.cat && p.category !== F.cat) return false;
      if (F.shop && p.shop !== F.shop) return false;

      if (F.sec) {
        var sc = SEC[p.section] || SEC[p.sec];
        if (sc !== F.sec) return false;
      }

      if (F.color) {
        if (!window.DPPalette) return false;
        try {
          if (DPPalette.colorsOf(p).indexOf(F.color) < 0) return false;
        } catch (e) { return false; }
      }

      if (F.stock && !(Number(p.stock) > 0)) return false;

      if (F.sale) {
        try {
          if (!(window.DPPromo && DPPromo.sales.priceOf(p).percent > 0)) return false;
        } catch (e) { return false; }
      }

      return true;
    });

    sortView();
    paint();
  }

  function priceOf(p) {
    try {
      if (window.DPPromo) {
        var s = DPPromo.sales.priceOf(p);
        if (s && isFinite(Number(s.price))) return s;
      }
    } catch (e) { /* بی‌اهمیت */ }
    return { price: Number(p.price) || 0, old: null, percent: 0 };
  }

  function sortView() {
    if (SORT === 'best') return;    /* ترتیب موتور جست‌وجو */

    VIEW.sort(function (a, b) {
      var pa = priceOf(a), pb = priceOf(b);
      switch (SORT) {
        case 'cheap': return pa.price - pb.price;
        case 'rich':  return pb.price - pa.price;
        case 'sale':  return (pb.percent || 0) - (pa.percent || 0);
        case 'hot':   return (Number(b.sales) || 0) - (Number(a.sales) || 0);
        case 'new':   return String(b.id).localeCompare(String(a.id));
        default: return 0;
      }
    });
  }

  /* ============================================================
     رسم
     ============================================================ */
  function paint() {
    var grid = $('#srGrid');
    var empty = $('#srEmpty');
    var count = $('#srCount');

    count.textContent = HITS.length
      ? FA(VIEW.length) + ' کالا' + (VIEW.length !== HITS.length
          ? ' از ' + FA(HITS.length) : '')
      : '';

    if (!VIEW.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      empty.innerHTML = emptyBox();
      elseBox();
      return;
    }

    empty.hidden = true;
    $('#srElse').hidden = true;
    grid.innerHTML = VIEW.map(card).join('');
  }

  function card(p) {
    var s = priceOf(p);
    var img = (Array.isArray(p.images) ? p.images : [])[0];
    var url = './product.html?id=' + encodeURIComponent(p.id);
    var stock = Number(p.stock) || 0;

    /* نشان موجودی — بدون گفتن عدد */
    var tag = '';
    if (window.DPStock) {
      try {
        var st = DPStock.status(stock);
        if (st.level !== 'ok') {
          tag = '<span class="sr-tag is-' + st.tone + '">' + esc(st.short) + '</span>';
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    /* امتیاز فروشگاه */
    var rate = null;
    try {
      if (window.DPReviews) rate = DPReviews.storeRatingsMap()[p.sellerId] || null;
    } catch (e) { /* بی‌اهمیت */ }

    /* نقطه‌های رنگ */
    var dots = '';
    if (window.DPPalette) {
      try {
        var cs = DPPalette.colorsOf(p).slice(0, 4);
        if (cs.length) {
          dots = '<span class="sr-dots">' + cs.map(function (c) {
            var H = DPPalette.HUE[c];
            return '<i title="' + esc(H ? H.name : c) + '" style="background:'
              + (H ? H.hex : '#ccc') + '"></i>';
          }).join('') + '</span>';
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    var sizes = (Array.isArray(p.sizes) ? p.sizes : []).slice(0, 5);

    return '<article class="sr-card' + (stock === 0 ? ' is-out' : '') + '">'
      + '<a class="sr-shot" href="' + url + '" data-pick="' + esc(p.id) + '">'
      +   (img
            ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
            : '<span class="sr-noimg">' + esc((p.name || '؟').trim()[0]) + '</span>')
      +   tag
      +   (s.percent ? '<span class="sr-off">٪' + FA(s.percent) + '−</span>' : '')
      + '</a>'

      + '<div class="sr-body">'
      +   '<a class="sr-name" href="' + url + '" data-pick="' + esc(p.id) + '">'
      +     esc(p.name) + '</a>'

      +   '<div class="sr-meta">'
      +     '<span class="sr-shop">' + esc(p.shop || 'فروشگاه') + '</span>'
      +     (rate ? '<span class="sr-rate">' + svg(I.star, 'ico ico-s')
                  + FA(rate.avg) + '</span>' : '')
      +   '</div>'

      +   dots
      +   (sizes.length
            ? '<div class="sr-sizes">' + sizes.map(function (z) {
                return '<span>' + esc(z) + '</span>';
              }).join('') + '</div>'
            : '')

      +   '<div class="sr-foot">'
      +     '<div class="sr-price">'
      +       (s.old ? '<del>' + money(s.old) + '</del>' : '')
      +       '<b>' + money(s.price) + '</b><small>تومان</small>'
      +     '</div>'
      +     (stock > 0
            ? '<a class="sr-add" href="' + url + '" data-pick="' + esc(p.id)
              + '" aria-label="دیدن ' + esc(p.name) + '">' + svg(I.plus, 'ico ico-s') + '</a>'
            : '')
      +   '</div>'
      + '</div></article>';
  }

  /* ============================================================
     وقتی چیزی پیدا نشد
     ------------------------------------------------------------
     مشتری نباید دست‌خالی برگردد. سه راه پیشنهاد می‌دهیم.
     ============================================================ */
  function emptyBox() {
    var why = '';

    if (HITS.length && VIEW.length === 0) {
      why = 'با این فیلترها چیزی نماند — یکی را بردارید';
      return '<div class="sr-nobox">' + svg(I.empty, 'sr-bigico')
        + '<strong>' + esc(why) + '</strong>'
        + '<button class="sr-clear" type="button" data-clear>پاک کردن فیلترها</button></div>';
    }

    return '<div class="sr-nobox">' + svg(I.empty, 'sr-bigico')
      + '<strong>چیزی برای «' + esc(Q) + '» پیدا نشد</strong>'
      + '<span>شاید املای دیگری داشته باشد، یا هنوز در سایت نیست</span></div>';
  }

  function elseBox() {
    var box = $('#srElse');
    if (HITS.length) { box.hidden = true; return; }

    var prods = [];
    try {
      prods = window.DPSuggest ? DPSuggest.vocabulary().prods : [];
    } catch (e) { prods = []; }

    if (!prods.length) { box.hidden = true; return; }

    var html = '';

    /* ---------- ۱. عبارت‌های نزدیک ---------- */
    var near = DPSuggest.suggest(Q, 6).filter(function (s) { return s.count > 0; });
    if (near.length) {
      html += '<div class="sr-else-grp"><h2>این‌ها را امتحان کنید</h2><div class="sr-terms">'
        + near.map(function (s) {
            return '<a href="./search.html?q=' + encodeURIComponent(s.text) + '">'
              + esc(s.text) + '<i>' + FA(s.count) + '</i></a>';
          }).join('')
        + '</div></div>';
    }

    /* ---------- ۲. محبوب‌ترین‌های فصل ---------- */
    var hot = prods
      .filter(function (p) { return Number(p.stock) > 0; })
      .sort(function (a, b) { return (Number(b.sales) || 0) - (Number(a.sales) || 0); })
      .slice(0, 8);

    if (hot.length) {
      html += '<div class="sr-else-grp"><h2>' + svg(I.spark, 'ico')
        + ' پرفروش‌های این روزها</h2>'
        + '<div class="sr-grid">' + hot.map(card).join('') + '</div></div>';
    }

    box.hidden = false;
    box.innerHTML = html;
  }

  /* ============================================================
     رفتار
     ============================================================ */
  function wire() {
    /* ---------- فیلترها ---------- */
    $('#srChips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]');
      if (!b) return;

      var k = b.dataset.f, v = b.dataset.v;

      if (F[k] === v || (k === 'sale' && F.sale) || (k === 'stock' && F.stock)) {
        delete F[k];
        b.classList.remove('is-on');
      } else {
        /* فیلتر هم‌گروه قبلی برداشته شود */
        $('#srChips').querySelectorAll('[data-f="' + k + '"]').forEach(function (x) {
          x.classList.remove('is-on');
        });
        F[k] = v;
        b.classList.add('is-on');
      }
      apply();
    });

    /* ---------- مرتب‌سازی ---------- */
    $('#srSort').addEventListener('change', function (e) {
      SORT = e.target.value;
      var u = new URL(location.href);
      u.searchParams.set('sort', SORT);
      history.replaceState(null, '', u);
      apply();
    });

    /* ---------- پاک کردن فیلتر ---------- */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear]')) {
        F = {};
        $('#srChips').querySelectorAll('.is-on').forEach(function (x) {
          x.classList.remove('is-on');
        });
        apply();
      }

      /* ---------- آموزش مغز: کدام نتیجه انتخاب شد ---------- */
      var pick = e.target.closest('[data-pick]');
      if (pick && window.DPBrain && Q) {
        var id = pick.dataset.pick;
        var p = HITS.find(function (x) { return String(x.id) === String(id); });
        if (p) {
          try { DPBrain.track('search', { term: Q, picked: p, product: p }); }
          catch (err) { /* بی‌اهمیت */ }
        }
      }
    });

    /* ---------- نوار جست‌وجوی درون‌صفحه ---------- */
    var form = $('#srForm');
    var input = $('#srInput');
    var auto = $('#srAuto');
    var cur = -1;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (v) location.href = './search.html?q=' + encodeURIComponent(v);
    });

    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(drawAuto, 110);
    });

    input.addEventListener('keydown', function (e) {
      var rows = auto.querySelectorAll('.sr-arow');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!rows.length) return;
        e.preventDefault();
        cur += e.key === 'ArrowDown' ? 1 : -1;
        if (cur < 0) cur = rows.length - 1;
        if (cur >= rows.length) cur = 0;
        rows.forEach(function (r, i) { r.classList.toggle('is-cur', i === cur); });
        rows[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && cur > -1 && rows[cur]) {
        e.preventDefault();
        rows[cur].click();
      } else if (e.key === 'Escape') {
        auto.hidden = true;
        cur = -1;
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(function () { auto.hidden = true; cur = -1; }, 160);
    });
    input.addEventListener('focus', function () {
      if (input.value.trim()) drawAuto();
    });

    function drawAuto() {
      if (!window.DPSuggest) return;
      var v = input.value.trim();
      cur = -1;

      if (v.length < 2) { auto.hidden = true; return; }

      var list = DPSuggest.suggest(v, 8).filter(function (s) { return s.count > 0; });
      if (!list.length) { auto.hidden = true; return; }

      auto.hidden = false;
      auto.innerHTML = list.map(function (s) {
        return '<a class="sr-arow" role="option" href="./search.html?q='
          + encodeURIComponent(s.text) + '">'
          + '<span>' + mark(s.text, v) + '</span>'
          + '<i>' + FA(s.count) + '</i></a>';
      }).join('');
    }
  }

  /** بخش تایپ‌شده را پررنگ می‌کند */
  function mark(text, q) {
    var n = DPSuggest.norm(text);
    var m = DPSuggest.norm(q);
    var i = n.indexOf(m);
    if (i < 0 || !m) return esc(text);
    /* چون طول متن نرمال‌شده و اصلی ممکن است فرق کند،
       محتاطانه فقط وقتی برش می‌زنیم که طول یکی باشد */
    if (n.length !== text.length) return esc(text);
    return esc(text.slice(0, i))
      + '<b>' + esc(text.slice(i, i + m.length)) + '</b>'
      + esc(text.slice(i + m.length));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
