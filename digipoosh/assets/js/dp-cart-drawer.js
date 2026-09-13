/* ============================================================
   دیجی‌پوش — کشوی سبد خرید
   ------------------------------------------------------------
   با کلیک روی آیکون سبد، به‌جای رفتن به صفحه‌ی دیگر،
   یک کشو از سمت راست باز می‌شود و محتوای سبد را نشان می‌دهد.

   • تغییر تعداد و حذف، بی‌درنگ داخل همان کشو
   • بستن با: دکمه، پرده، کلید Escape، کشیدن انگشت
   • دکمه‌ی «ادامه و تسویه» به صفحه‌ی سبد می‌برد
   ============================================================ */
'use strict';

(function () {
  var PAGE = (document.body && document.body.dataset.dpPage) || 'home';
  var deep = ['woman', 'man', 'kids', 'teen'].indexOf(PAGE) > -1;
  var UP = deep ? '../' : './';

  /* در خود صفحه‌ی سبد لازم نیست */
  if (PAGE === 'cart' || /cart\.html$/i.test(location.pathname)) return;

  /* ---------- ابزار ---------- */
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; }); };
  var money = function (n) { return fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬'); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ---------- آیکون‌های خطی ---------- */
  var I = {
    bag:   '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus:  '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9.5 7V4.5h5V7"/>',
    go:    '<path d="m14 7-5 5 5 5"/>',
    shop:  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
  };

  function svg(d, cls) {
    return '<svg class="' + (cls || 'dcd-i') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ============================================================
     ساخت کشو
     ============================================================ */
  var veil, panel, body, foot, lastFocus = null;

  function build() {
    if (document.getElementById('dcdPanel')) return;

    veil = document.createElement('div');
    veil.className = 'dcd-veil';
    veil.id = 'dcdVeil';
    document.body.appendChild(veil);

    panel = document.createElement('aside');
    panel.className = 'dcd-panel';
    panel.id = 'dcdPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'سبد خرید');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="dcd-head">' +
        '<span class="dcd-title">' + svg(I.bag, 'dcd-i dcd-i-lg') +
          '<strong>سبد خرید</strong><em class="dcd-n" id="dcdN"></em></span>' +
        '<button class="dcd-x" type="button" aria-label="بستن سبد خرید">' + svg(I.close) + '</button>' +
      '</div>' +
      '<div class="dcd-body" id="dcdBody"></div>' +
      '<div class="dcd-foot" id="dcdFoot"></div>';
    document.body.appendChild(panel);

    body = panel.querySelector('#dcdBody');
    foot = panel.querySelector('#dcdFoot');

    veil.addEventListener('click', function () { close(); });
    panel.querySelector('.dcd-x').addEventListener('click', function () { close(); });
    wireBody();
    wireSwipe();
  }

  /* ============================================================
     رسم محتوا
     ============================================================ */
  function paint() {
    if (!body) return;

    var cart = window.DPCart ? DPCart.detailed() : { rows: [], groups: [], count: 0, sum: 0, payable: 0 };
    var nEl = document.getElementById('dcdN');
    if (nEl) {
      nEl.textContent = cart.count ? fa(cart.count) + ' کالا' : '';
      nEl.hidden = !cart.count;
    }

    /* ---------- سبد خالی ---------- */
    if (!cart.rows.length) {
      body.innerHTML =
        '<div class="dcd-empty">' +
          svg(I.bag, 'dcd-big') +
          '<strong>سبد خرید شما خالی است</strong>' +
          '<span>کالاهایی که می‌پسندید اینجا جمع می‌شوند.</span>' +
          '<a class="dcd-cta dcd-ghost" href="' + UP + 'index.html#featured-sellers">' +
            svg(I.shop) + '<span>دیدن فروشگاه‌ها</span></a>' +
        '</div>';
      foot.innerHTML = '';
      foot.hidden = true;
      return;
    }

    foot.hidden = false;

    /* ---------- گروه‌بندی بر پایه‌ی فروشنده ---------- */
    var html = '';
    cart.groups.forEach(function (g) {
      html +=
        '<div class="dcd-group">' +
          '<div class="dcd-seller">' +
            '<span class="dcd-slogo">' + (g.sellerLogo
              ? '<img src="' + esc(g.sellerLogo) + '" alt="" />'
              : esc((g.sellerName || '؟').trim()[0])) + '</span>' +
            '<strong>' + esc(g.sellerName) + '</strong>' +
            '<em>' + money(g.sum) + ' تومان</em>' +
          '</div>';

      g.items.forEach(function (r) {
        var opts = [];
        if (r.color) opts.push(esc(r.color));
        if (r.size)  opts.push('سایز ' + esc(r.size));

        html +=
          '<div class="dcd-row" data-key="' + esc(r.key) + '">' +
            '<span class="dcd-thumb">' + (r.image
              ? '<img src="' + esc(r.image) + '" alt="" loading="lazy" />'
              : svg(I.bag, 'dcd-i')) + '</span>' +
            '<div class="dcd-txt">' +
              '<strong>' + esc(r.name) + '</strong>' +
              (opts.length ? '<small>' + opts.join(' · ') + '</small>' : '') +
              '<span class="dcd-price">' + money(r.price) + ' تومان' +
                (r.oldPrice ? ' <s>' + money(r.oldPrice) + '</s>' +
                  '<em class="dcd-off">٪' + fa(r.discount) + '</em>' : '') +
              '</span>' +
            '</div>' +
            '<div class="dcd-qty">' +
              '<button class="dcd-q" type="button" data-act="inc" aria-label="افزودن یکی">' + svg(I.plus) + '</button>' +
              '<b>' + fa(r.qty) + '</b>' +
              '<button class="dcd-q" type="button" data-act="dec" aria-label="کم کردن یکی">' + svg(I.minus) + '</button>' +
              '<button class="dcd-q dcd-del" type="button" data-act="del" aria-label="حذف از سبد">' + svg(I.trash) + '</button>' +
            '</div>' +
          '</div>';
      });

      html += '</div>';
    });

    body.innerHTML = html;

    /* ---------- پاورقی ---------- */
    /* کد تخفیف در کشو فقط نشان داده می‌شود؛ نوشتنش در صفحه‌ی
       سبد است چون آنجا جا برای پیام خطا هست */
    var cpn = cart.coupon && !cart.coupon.invalid ? cart.coupon : null;

    foot.innerHTML =
      '<div class="dcd-sum">' +
        '<span>مبلغ کالاها (' + fa(cart.count) + ' عدد)</span>' +
        '<b>' + money(cart.sum) + ' تومان</b>' +
      '</div>' +
      (cpn
        ? '<div class="dcd-sum dcd-off">' +
            '<span>تخفیف کد ' + esc(cpn.code) + '</span>' +
            '<b>\u200E−' + money(cpn.off) + ' تومان</b>' +
          '</div>' +
          '<div class="dcd-sum dcd-pay">' +
            '<span>قابل پرداخت</span>' +
            '<b>' + money(cart.payable) + ' تومان</b>' +
          '</div>'
        : '') +
      (cart.sellerCount > 1
        ? '<p class="dcd-note">خرید از ' + fa(cart.sellerCount) +
          ' فروشگاه — برای هرکدام سفارش جداگانه ثبت می‌شود.</p>' : '') +
      '<a class="dcd-cta" href="' + UP + 'cart.html">' +
        '<span>ادامه و تسویه حساب</span>' + svg(I.go) + '</a>';
  }

  /* ============================================================
     رفتار دکمه‌های داخل کشو
     ============================================================ */
  function wireBody() {
    body.addEventListener('click', function (e) {
      var b = e.target.closest('.dcd-q');
      if (!b || !window.DPCart) return;

      var row = b.closest('.dcd-row');
      var key = row && row.dataset.key;
      if (!key) return;

      var cur = (DPCart.detailed().rows.find(function (r) { return r.key === key; }) || {}).qty || 0;
      var act = b.dataset.act;

      try {
        if (act === 'inc') DPCart.setQty(key, cur + 1);
        else if (act === 'dec') DPCart.setQty(key, cur - 1);
        else if (act === 'del') DPCart.remove(key);
      } catch (err) {
        if (window.toast) toast(err.message, 'error');
      }
      paint();
    });
  }

  /* ---------- کشیدن انگشت به راست برای بستن ---------- */
  function wireSwipe() {
    var x0 = null;
    panel.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    panel.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (dx > 70) close();
    }, { passive: true });
  }

  /* ============================================================
     باز و بسته کردن
     ============================================================ */
  function open() {
    build();
    paint();
    lastFocus = document.activeElement;
    veil.classList.add('is-on');
    panel.classList.add('is-on');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dcd-lock');
    setTimeout(function () {
      var f = panel.querySelector('.dcd-x');
      if (f) f.focus();
    }, 60);
  }

  function close() {
    if (!panel) return;
    veil.classList.remove('is-on');
    panel.classList.remove('is-on');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dcd-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var isOpen = function () { return !!panel && panel.classList.contains('is-on'); };

  /* ---------- کلید Escape و تله‌ی فوکوس ---------- */
  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); return; }

    if (e.key === 'Tab') {
      var f = panel.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ============================================================
     گرفتن کلیک روی آیکون سبد در نوار بالا
     ============================================================ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.dp-cart, [data-dp-cart-open]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // باز کردن در تب تازه محترم است
    e.preventDefault();
    open();
  });

  /* هر تغییر سبد، اگر کشو باز است تازه می‌شود */
  document.addEventListener('dp:cart', function () { if (isOpen()) paint(); });
  window.addEventListener('storage', function (e) {
    if (e.key === 'dp_cart' && isOpen()) paint();
  });

  window.DPCartDrawer = { open: open, close: close, refresh: paint };
})();
