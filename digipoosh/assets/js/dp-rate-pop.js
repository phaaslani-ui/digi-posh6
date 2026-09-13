/* ============================================================
   دیجی‌پوش — پنجره‌ی کوچک رضایت روی ستاره‌ها
   ------------------------------------------------------------
   وقتی موش روی ستاره‌های یک فروشگاه می‌رود (یا روی موبایل
   انگشت می‌زند)، یک قاب کوچک باز می‌شود و می‌گوید:
   «از ۴ خریدار و ۸ کالا، ٪۹۲ رضایت داشته‌اند» به‌همراه
   نوار پراکندگی ستاره‌ها و نشان کیفی فروشنده.

   نیازی به تغییر کارت‌ها نیست — خودش ستاره‌ها را پیدا می‌کند.
   ============================================================ */
(function () {
  'use strict';

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }).replace('.', '٫'); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var pop = null, hideTimer = null, current = null;

  function build() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'dp-satpop';
    pop.setAttribute('role', 'tooltip');
    pop.hidden = true;
    document.body.appendChild(pop);

    pop.addEventListener('pointerenter', function () { clearTimeout(hideTimer); });
    pop.addEventListener('pointerleave', hideSoon);
    return pop;
  }

  /* کدام فروشگاه؟ از نزدیک‌ترین عنصری که شناسه دارد */
  function sellerFrom(el) {
    var n = el.closest('[data-seller],[data-store],[data-id]');
    while (n) {
      var id = n.dataset.seller || n.dataset.store || n.dataset.id;
      if (id) return id;
      n = n.parentElement && n.parentElement.closest('[data-seller],[data-store],[data-id]');
    }
    /* اگر کارت لینک «فروشگاه» دارد، شناسه را از نشانی بیرون می‌کشیم */
    var card = el.closest('.seller-card, .store-card, .dp-store-card, .sp-card, article, li, .card');
    if (card) {
      var a = card.querySelector('a[href*="store.html?"], a[href*="id="]');
      if (a) {
        var m = a.getAttribute('href').match(/[?&](?:id|seller|store)=([^&]+)/);
        if (m) return decodeURIComponent(m[1]);
      }
    }
    return null;
  }

  function bar(spread, i, total) {
    var n = spread[i] || 0;
    var w = total ? Math.round(n / total * 100) : 0;
    return '<div class="sp-brow">' +
      '<span class="sp-bn num">' + fa(i + 1) + '</span>' +
      '<svg class="sp-bstar" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/></svg>' +
      '<span class="sp-btrack"><i style="width:' + w + '%"></i></span>' +
      '<span class="sp-bc num">' + fa(n) + '</span>' +
    '</div>';
  }

  function render(s) {
    var total = s.count;
    var rows = '';
    for (var i = 4; i >= 0; i--) rows += bar(s.spread, i, total);

    return '' +
      '<div class="sp-top">' +
        '<b class="sp-avg num">' + fa(s.avg) + '</b>' +
        '<div class="sp-topx">' +
          '<span class="sp-line">' +
            'از <b class="num">' + fa(s.buyers) + '</b> خریدار' +
            (s.products ? ' و <b class="num">' + fa(s.products) + '</b> کالا' : '') +
          '</span>' +
          '<span class="sp-happy num">٪' + fa(s.happyPercent) + ' رضایت داشته‌اند</span>' +
        '</div>' +
      '</div>' +
      '<div class="sp-bars">' + rows + '</div>' +
      (s.tier
        ? '<div class="sp-tier" style="--tc:' + s.tier.color + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
              'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 3.5 14.2 8l5 .7-3.6 3.5.9 5-4.5-2.4L7.5 17l.9-5L4.8 8.7l5-.7z"/></svg>' +
            '<span>' + esc(s.tier.fa) + '</span>' +
            '<em class="num">امتیاز ' + fa(s.tier.score) + ' از ۱۰۰</em>' +
          '</div>'
        : '') +
      '<div class="sp-foot">امتیازها فقط از خریداران واقعی ثبت می‌شود.</div>';
  }

  function place(anchor) {
    var r = anchor.getBoundingClientRect();
    var w = pop.offsetWidth || 250;
    var h = pop.offsetHeight || 160;
    var gap = 10;

    var top = r.top - h - gap;
    var below = false;
    if (top < 8) { top = r.bottom + gap; below = true; }

    var left = r.left + r.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));

    pop.style.top = Math.round(top) + 'px';
    pop.style.left = Math.round(left) + 'px';
    pop.classList.toggle('is-below', below);
  }

  function show(anchor) {
    var id = sellerFrom(anchor);
    if (!id || !window.DPBoostPro) return;

    var s = null;
    try { s = DPBoostPro.satisfaction(id); } catch (e) { return; }
    if (!s) return;

    clearTimeout(hideTimer);
    build();
    if (current !== id) { pop.innerHTML = render(s); current = id; }
    pop.hidden = false;
    /* یک فریم صبر تا اندازه‌اش مشخص شود */
    requestAnimationFrame(function () {
      place(anchor);
      pop.classList.add('on');
    });
  }

  function hideSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (!pop) return;
      pop.classList.remove('on');
      setTimeout(function () { if (pop && !pop.classList.contains('on')) pop.hidden = true; }, 180);
    }, 140);
  }

  /* ---------- شنونده‌ها ---------- */
  var SEL = '.dp-stars, .dp-rate-row, .dp-rate, .sp-stars, [data-sat]';

  document.addEventListener('pointerover', function (e) {
    if (!e.target.closest) return;
    var a = e.target.closest(SEL);
    if (!a) return;
    if (e.pointerType === 'touch') return;      /* لمس با کلیک کار می‌کند */
    show(a);
  });

  document.addEventListener('pointerout', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(SEL)) hideSoon();
  });

  /* لمس: یک بار زدن، باز؛ بار دوم یا جای دیگر، بسته */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(SEL);
    if (a) {
      if (pop && pop.classList.contains('on')) { hideSoon(); return; }
      show(a);
      return;
    }
    if (pop && !e.target.closest('.dp-satpop')) hideSoon();
  });

  /* دسترس‌پذیری با صفحه‌کلید */
  document.addEventListener('focusin', function (e) {
    var a = e.target.closest && e.target.closest(SEL);
    if (a) show(a);
  });
  document.addEventListener('focusout', function (e) {
    if (e.target.closest && e.target.closest(SEL)) hideSoon();
  });

  window.addEventListener('scroll', function () { if (pop && !pop.hidden) hideSoon(); },
    { passive: true });
  window.addEventListener('resize', function () { if (pop && !pop.hidden) hideSoon(); });

  window.DPRatePop = { show: show, hide: hideSoon };
})();
