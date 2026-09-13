/* ============================================================
   دیجی‌پوش — جست‌وجوی واقعی
   ------------------------------------------------------------
   در محصولات و فروشگاه‌های واقعی می‌گردد و نتیجه را
   همان لحظه زیر کادر نشان می‌دهد.

   • باز شدن با کلیک روی ذره‌بین یا کلید «/»
   • حرکت با کلیدهای بالا/پایین، انتخاب با Enter
   • اعداد فارسی و لاتین هر دو کار می‌کنند
   ============================================================ */
'use strict';

(function () {
  var PAGE = document.body.dataset.dpPage || 'home';
  var deep = ['woman', 'man', 'kids', 'teen'].indexOf(PAGE) > -1;
  var UP = deep ? '../' : './';

  var SW = 'fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round"';

  var I = {
    search: '<circle cx="11" cy="11" r="6.4"/><path d="m15.7 15.7 4 4"/>',
    close:  '<path d="M18 6 6 18M6 6l12 12"/>',
    store:  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    tag:    '<path d="M3.5 12.5V5.5a2 2 0 0 1 2-2h7l8 8-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
    arrow:  '<path d="M14 6.5 8 12l6 5.5"/>',
  };

  var svg = function (p, cls) {
    return '<svg class="' + (cls || 'dsr-i') + '" viewBox="0 0 24 24" ' + SW +
           ' aria-hidden="true">' + p + '</svg>';
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };
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
  var money = function (n) { return fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬'); };

  /* حرف‌های عربی و فارسی را یکسان می‌کند تا جست‌وجو گیر نکند */
  function norm(s) {
    return toEn(String(s || ''))
      .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
      .replace(/\u200c/g, ' ')          // نیم‌فاصله
      .replace(/\s+/g, ' ')
      .trim().toLowerCase();
  }

  var read = function (k) {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(k));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };

  /* ============================================================
     جست‌وجو در داده‌ی واقعی
     ============================================================ */
  function query(q) {
    var n = norm(q);
    if (n.length < 2) return { stores: [], products: [] };

    var users = read('dp_users');
    var prods = read('dp_products');

    /* فقط فروشگاه‌های تأییدشده یا در انتظار */
    var okIds = {};
    var byId = {};
    users.forEach(function (u) {
      var st = u.status || (u.isVerified ? 'approved' : 'pending');
      byId[u.id] = u;
      if (st === 'approved' || st === 'pending') okIds[u.id] = true;
    });

    var stores = users.filter(function (u) {
      if (!okIds[u.id] || !u.storeName) return false;
      return norm(u.storeName + ' ' + (u.city || '') + ' ' + (u.description || '')).indexOf(n) > -1;
    }).slice(0, 4);

    var T = window.DPTaxonomy;

    var products = prods.filter(function (p) {
      if (p.status !== 'active' || !okIds[p.sellerId]) return false;
      var shop = byId[p.sellerId] ? byId[p.sellerId].storeName : '';
      return norm([p.name, p.category, p.brand, p.description, shop].join(' ')).indexOf(n) > -1;
    }).slice(0, 6).map(function (p) {
      var u = byId[p.sellerId] || {};
      return {
        id: p.id, name: p.name, price: p.price, category: p.category,
        image: (p.images || [])[0] || '',
        sellerId: p.sellerId, shop: u.storeName || 'فروشگاه',
        section: p.section || (T && T.findByItem(p.category) ? T.findByItem(p.category).section : ''),
      };
    });

    return { stores: stores, products: products };
  }

  /* ============================================================
     ساخت
     ============================================================ */
  function build() {
    var bar = document.querySelector('.navbar, .navbar-m, .sh-bar, header nav');
    if (!bar || document.getElementById('dsrBtn')) return;

    /* جعبه‌ی آیکون‌های نوار بالا؛ اگر نبود ساخته می‌شود */
    var slot = document.querySelector('.nav-icons, .icons-m, .dp-navbox');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'dp-navbox';
      bar.appendChild(slot);
    }
    slot.classList.add('dp-navbox');

    /* ---------- دکمه‌ی ذره‌بین ---------- */
    var btn = document.createElement('button');
    btn.id = 'dsrBtn';
    btn.className = 'dsr-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'جست‌وجو در دیجی‌پوش');
    btn.innerHTML = svg(I.search, 'dsr-i');

    /* پیش از دکمه‌ی همبرگری، داخل جعبه‌ی آیکون‌ها بنشیند */
    var nav = document.getElementById('dnvBtn');
    (nav && nav.parentNode === slot) ? slot.insertBefore(btn, nav) : slot.appendChild(btn);

    /* ---------- پنجره‌ی جست‌وجو ---------- */
    var box = document.createElement('div');
    box.className = 'dsr-wrap';
    box.id = 'dsrWrap';
    box.hidden = true;
    box.innerHTML =
      '<div class="dsr-veil"></div>' +
      '<div class="dsr-modal" role="dialog" aria-modal="true" aria-label="جست‌وجو">' +
        '<div class="dsr-field">' +
          svg(I.search, 'dsr-i dsr-lead') +
          '<input id="dsrInput" type="search" autocomplete="off" ' +
            'placeholder="نام کالا، دسته‌بندی یا فروشگاه…" aria-label="عبارت جست‌وجو" />' +
          '<button class="dsr-x" type="button" aria-label="بستن">' + svg(I.close, 'dsr-i') + '</button>' +
        '</div>' +
        '<div class="dsr-out" id="dsrOut" role="listbox" aria-label="نتیجه‌ها"></div>' +
        '<div class="dsr-foot">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> جابه‌جایی</span>' +
          '<span><kbd>Enter</kbd> باز کردن</span>' +
          '<span><kbd>Esc</kbd> بستن</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(box);
    wire(btn, box);
  }

  /* ============================================================
     رفتار
     ============================================================ */
  function wire(btn, box) {
    var input = box.querySelector('#dsrInput');
    var out   = box.querySelector('#dsrOut');
    var open  = false;
    var items = [];       // نتیجه‌های قابل انتخاب
    var cur   = -1;       // نتیجه‌ی زیر انگشت

    function setOpen(v) {
      open = v;
      if (v) {
        box.hidden = false;
        requestAnimationFrame(function () { box.classList.add('is-on'); });
        document.body.classList.add('dsr-lock');
        setTimeout(function () { input.focus(); }, 70);
        if (!input.value) empty();
      } else {
        box.classList.remove('is-on');
        document.body.classList.remove('dsr-lock');
        setTimeout(function () { if (!open) box.hidden = true; }, 260);
      }
    }

    function empty() {
      var n = read('dp_products').filter(function (p) { return p.status === 'active'; }).length;
      out.innerHTML =
        '<div class="dsr-hint">' + svg(I.search, 'dsr-big') +
        '<strong>چه چیزی می‌خواهید؟</strong>' +
        '<span>' + (n ? 'در میان ' + fa(n) + ' کالای موجود بگردید' :
                        'هنوز کالایی در سایت ثبت نشده است') + '</span></div>';
      items = []; cur = -1;
    }

    /* ============================================================
       رسم نتیجه‌ها — سبک دیجی‌کالا
       ------------------------------------------------------------
       اینجا **کالا نشان داده نمی‌شود**. فقط عبارت‌های کامل
       پیشنهاد می‌شود، مثل دیجی‌کالا و گوگل.

       چرا؟ کاربری که «پیر» تایپ کرده هنوز نمی‌داند چه
       می‌خواهد. شش کالای تصادفی کمکش نمی‌کند؛ ولی دیدن
       «پیراهن مردانه»، «پیراهن مجلسی»، «پیراهن کتان» کمک
       می‌کند فکرش را جمع کند.

       با انتخاب هر عبارت، به صفحه‌ی نتایج می‌رود.
       ============================================================ */
    function draw(q) {
      items = [];

      /* اگر موتور پیشنهاد نبود، به روش قدیمی برگرد */
      if (!window.DPSuggest) { drawLegacy(q); return; }

      var list = DPSuggest.suggest(q, 9)
        .filter(function (s) { return s.count > 0; });

      if (!list.length) {
        out.innerHTML =
          '<div class="dsr-hint">' + svg(I.search, 'dsr-big') +
          '<strong>چیزی پیدا نشد</strong>' +
          '<span>املای دیگری را امتحان کنید</span></div>';
        cur = -1;
        return;
      }

      var LBL = {
        trend: 'پرجست‌وجو',
        cat:   'دسته‌بندی',
        combo: '',
        store: 'فروشگاه',
        name:  '',
      };

      var html = '<span class="dsr-label">پیشنهاد جست‌وجو</span>';

      list.forEach(function (s) {
        /* فروشگاه مستقیم به صفحه‌ی خودش می‌رود */
        var href = (s.kind === 'store' && s.meta && s.meta.storeId)
          ? UP + 'store.html?id=' + encodeURIComponent(s.meta.storeId)
          : UP + 'search.html?q=' + encodeURIComponent(s.text);

        items.push(href);

        var tag = LBL[s.kind] || '';

        html +=
          '<a class="dsr-row dsr-term" href="' + href + '" role="option"' +
              ' data-term="' + esc(s.text) + '">' +
            svg(s.kind === 'store' ? I.store : I.search, 'dsr-i dsr-lead') +
            '<span class="dsr-txt"><strong>' + hilite(s.text, q) + '</strong>' +
              (tag ? '<small>' + tag + '</small>' : '') +
            '</span>' +
            '<b class="dsr-n">' + fa(s.count) + '</b>' +
          '</a>';
      });

      /* ---------- دیدن همه ---------- */
      var all = UP + 'search.html?q=' + encodeURIComponent(q.trim());
      items.push(all);
      html +=
        '<a class="dsr-row dsr-all" href="' + all + '" role="option">' +
          '<span class="dsr-txt"><strong>جست‌وجوی «' + esc(q.trim()) + '» در همه‌ی کالاها</strong></span>' +
          svg(I.arrow, 'dsr-i dsr-go') +
        '</a>';

      out.innerHTML = html;
      cur = -1;
    }

    /** بخش تایپ‌شده را پررنگ می‌کند */
    function hilite(text, q) {
      if (!window.DPSuggest) return esc(text);
      var n = DPSuggest.norm(text);
      var m = DPSuggest.norm(q);
      if (!m) return esc(text);

      var i = n.indexOf(m);
      /* اگر نرمال‌سازی طول را عوض کرده، برش نزن — وگرنه
         حرف‌ها جابه‌جا می‌شوند */
      if (i < 0 || n.length !== text.length) return esc(text);

      return esc(text.slice(0, i)) +
        '<b>' + esc(text.slice(i, i + m.length)) + '</b>' +
        esc(text.slice(i + m.length));
    }

    /* روش قدیمی — فقط اگر موتور پیشنهاد در دسترس نبود */
    function drawLegacy(q) {
      var r = query(q);
      items = [];

      if (!r.stores.length && !r.products.length) {
        out.innerHTML =
          '<div class="dsr-hint"><strong>چیزی پیدا نشد</strong>' +
          '<span>عبارت دیگری را امتحان کنید</span></div>';
        cur = -1;
        return;
      }

      var html = '';

      if (r.stores.length) {
        html += '<span class="dsr-label">فروشگاه‌ها</span>';
        r.stores.forEach(function (s) {
          var href = UP + 'store.html?id=' + encodeURIComponent(s.id);
          items.push(href);
          html +=
            '<a class="dsr-row" href="' + href + '" role="option">' +
              '<span class="dsr-ava">' + (s.logo
                ? '<img src="' + esc(s.logo) + '" alt="" />'
                : esc((s.storeName || '؟').charAt(0))) + '</span>' +
              '<span class="dsr-txt"><strong>' + esc(s.storeName) + '</strong>' +
                '<small>' + esc(s.city || 'فروشگاه') + '</small></span>' +
              svg(I.arrow, 'dsr-i dsr-go') +
            '</a>';
        });
      }

      if (r.products.length) {
        html += '<span class="dsr-label">کالاها</span>';
        r.products.forEach(function (p) {
          var href = UP + 'product.html?id=' + encodeURIComponent(p.id);
          items.push(href);
          html +=
            '<a class="dsr-row" href="' + href + '" role="option">' +
              '<span class="dsr-thumb">' + (p.image
                ? '<img src="' + esc(p.image) + '" alt="" />'
                : svg(I.tag, 'dsr-i')) + '</span>' +
              '<span class="dsr-txt"><strong>' + esc(p.name) + '</strong>' +
                '<small>' + esc(p.category || '') + ' · ' + esc(p.shop) + '</small></span>' +
              '<b class="dsr-price">' + money(p.price) + '</b>' +
            '</a>';
        });
      }

      out.innerHTML = html;
      cur = -1;
    }

    /* ---------- حرکت با کیبورد ---------- */
    function move(step) {
      var rows = out.querySelectorAll('.dsr-row');
      if (!rows.length) return;
      if (cur > -1) rows[cur].classList.remove('is-cur');
      cur = (cur + step + rows.length) % rows.length;
      rows[cur].classList.add('is-cur');
      rows[cur].scrollIntoView({ block: 'nearest' });
    }

    /* ---------- رویدادها ---------- */
    btn.addEventListener('click', function () { setOpen(true); });

    box.querySelector('.dsr-veil').addEventListener('click', function () { setOpen(false); });
    box.querySelector('.dsr-x').addEventListener('click', function () { setOpen(false); });

    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      var v = input.value;
      t = setTimeout(function () { v.trim().length < 2 ? empty() : draw(v); }, 180);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && cur > -1 && items[cur]) {
        e.preventDefault(); location.href = items[cur];
      }
    });

    document.addEventListener('keydown', function (e) {
      if (open && e.key === 'Escape') { setOpen(false); return; }

      /* کلید «/» پنجره را باز می‌کند — مگر داخل یک کادر متنی باشیم */
      if (e.key === '/' && !open) {
        var tag = (document.activeElement || {}).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setOpen(true);
      }
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', build, { once: true })
    : build();
})();
