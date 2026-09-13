/* ============================================================
   digiai-ui.js — رابط کاربری دیجی AI
   ------------------------------------------------------------
   چهار بخش:
     ۱. ساخت تیپ   — انتخاب کالا، تنظیم سلیقه، سه نسخه
     ۲. آزمون سبک  — پنج پرسش، ساخت پروفایل
     ۳. کمد من     — ست‌های ذخیره‌شده
     ۴. مشاوره     — پرسش و پاسخ سبک‌شناسی

   همه‌ی رویدادها به مغز گزارش می‌شوند تا سیستم یاد بگیرد.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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
    save:  '<path d="M6 4.5h12v15l-6-4-6 4z"/>',
    swap:  '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    star:  '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    spark: '<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9z"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7.5 7.5 20h9l1-12.5"/>',
    back:  '<path d="M9 5.5 15.5 12 9 18.5"/>',
    fwd:   '<path d="M15 5.5 8.5 12 15 18.5"/>',
    bot:   '<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>',
    user:  '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  };

  /* ============================================================
     وضعیت
     ============================================================ */
  var ALL = [];        /* همه‌ی کالاهای فعال */
  var HERO = null;     /* کالای پایه */
  var PREF = {};       /* تنظیمات کاربر */
  var RESULT = null;   /* خروجی مولد */
  var SHOWN = {};      /* ست‌هایی که دیده شده‌اند */

  var PKEY = 'dp_style_profile';

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
          shop: ok[p.sellerId].storeName || 'فروشگاه',
        });
      });
  }

  function profile() {
    try {
      var v = JSON.parse(localStorage.getItem(PKEY));
      return (v && typeof v === 'object') ? v : null;
    } catch (e) { return null; }
  }

  function saveProfile(p) {
    try { localStorage.setItem(PKEY, JSON.stringify(p)); return true; }
    catch (e) { return false; }
  }

  function toast(msg, kind) {
    var el = $('#aiToast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'ai-toast is-on' + (kind ? ' is-' + kind : '');
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('is-on');
      setTimeout(function () { el.hidden = true; }, 300);
    }, 3200);
  }

  /* ============================================================
     بخش یک: انتخاب کالای اصلی
     ============================================================ */
  function paintHeroes(q) {
    var host = $('#aiHeroes');
    var list;

    if (q && q.trim().length >= 2 && window.DPSuggest) {
      list = DPSuggest.search(q, { limit: 12 });
    } else {
      /* پیشنهاد اولیه: کالاهایی که تیپ می‌سازند و موجودند */
      list = ALL
        .filter(function (p) {
          if (Number(p.stock) <= 0) return false;
          return window.DPStylist ? DPStylist.isStylable(p) : true;
        })
        .sort(function (a, b) {
          return (Number(b.sales) || 0) - (Number(a.sales) || 0);
        })
        .slice(0, 12);
    }

    if (!list.length) {
      host.innerHTML = '<p class="ai-none">کالایی پیدا نشد</p>';
      return;
    }

    host.innerHTML = list.map(function (p) {
      var img = (Array.isArray(p.images) ? p.images : [])[0];
      var slot = window.DPStylist ? DPStylist.SLOT[DPStylist.slotOf(p)] : '';
      return '<button class="ai-hcard" type="button" data-hero="' + esc(p.id) + '">'
        + '<span class="ai-hshot">'
        +   (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" />'
                 : '<i>' + esc((p.name || '؟').trim()[0]) + '</i>')
        + '</span>'
        + '<span class="ai-hname">' + esc(p.name) + '</span>'
        + (slot ? '<span class="ai-hslot">' + esc(slot) + '</span>' : '')
        + '</button>';
    }).join('');
  }

  function chooseHero(id) {
    var p = ALL.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!p) return;

    HERO = p;

    var img = (Array.isArray(p.images) ? p.images : [])[0];
    var slot = window.DPStylist ? DPStylist.SLOT[DPStylist.slotOf(p)] : '';
    var pr = window.DPDigiAI ? DPDigiAI.priceOf(p) : (p.price || 0);

    var box = $('#aiChosen');
    box.hidden = false;
    box.innerHTML =
      '<div class="ai-chosen-in">'
      + '<span class="ai-hshot">'
      +   (img ? '<img src="' + esc(img) + '" alt="" />'
               : '<i>' + esc((p.name || '؟').trim()[0]) + '</i>')
      + '</span>'
      + '<div class="ai-chosen-txt">'
      +   '<b>' + esc(p.name) + '</b>'
      +   '<span>' + (slot ? esc(slot) + ' · ' : '') + money(pr) + ' تومان</span>'
      + '</div>'
      + '<button class="ai-chosen-x" type="button" data-unhero '
      +   'aria-label="انتخاب دیگر">' + svg(I.close, 'ico ico-s') + '</button>'
      + '</div>';

    $('#aiPick').hidden = true;
    $('#aiStep2').hidden = false;

    /* پیش‌فرض‌ها از پروفایل سبک، اگر آزمون داده باشد */
    var prof = profile();
    if (prof) {
      if (prof.style) PREF.style = prof.style;
      if (prof.palette) PREF.palette = prof.palette;
      if (prof.budget) PREF.budget = prof.budget;
      if (prof.occasion) PREF.occasion = prof.occasion;
    }
    paintPrefs();

    $('#aiStep2').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ============================================================
     تنظیمات سلیقه
     ============================================================ */
  function paintPrefs() {
    var D = window.DPDigiAI;
    if (!D) return;

    function group(key, label, obj, extra) {
      var html = '<div class="ai-pgroup"><span class="ai-plabel">' + esc(label) + '</span>'
        + '<div class="ai-popts">';

      if (extra) {
        html += '<button class="ai-popt' + (!PREF[key] ? ' is-on' : '') + '" type="button"'
          + ' data-pref="' + key + '" data-val="">' + esc(extra) + '</button>';
      }

      Object.keys(obj).forEach(function (k) {
        if (k === 'any') return;
        html += '<button class="ai-popt' + (PREF[key] === k ? ' is-on' : '') + '" type="button"'
          + ' data-pref="' + key + '" data-val="' + k + '">'
          + esc(obj[k].name) + '</button>';
      });

      return html + '</div></div>';
    }

    var SEASON = {
      spring: { name: 'بهار' }, summer: { name: 'تابستان' },
      autumn: { name: 'پاییز' }, winter: { name: 'زمستان' },
    };

    var COUNT = {
      3: { name: '۳ قطعه' }, 4: { name: '۴ قطعه' }, 5: { name: '۵ قطعه' },
    };

    $('#aiPrefs').innerHTML =
        group('occasion', 'مناسبت', D.OCCASION, 'مهم نیست')
      + group('style', 'سبک', D.STYLE, 'مهم نیست')
      + group('palette', 'پالت رنگ', D.PALETTE, 'مهم نیست')
      + group('budget', 'بودجه', D.BUDGET, 'مهم نیست')
      + group('season', 'فصل', SEASON, 'همه‌فصل')
      + group('count', 'تعداد قطعه', COUNT, null);
  }

  /* ============================================================
     تولید و نمایش ست‌ها
     ============================================================ */
  function build() {
    if (!HERO || !window.DPDigiAI) return;

    var out = $('#aiOut');
    $('#aiStep3').hidden = false;
    out.innerHTML = '<div class="ai-load"><span class="ai-spin"></span>'
      + '<p>در حال ساخت تیپ‌ها…</p></div>';

    $('#aiStep3').scrollIntoView({ behavior: 'smooth', block: 'start' });

    /* کمی مکث تا انیمیشن دیده شود و مرورگر فرصت رسم پیدا کند */
    setTimeout(function () {
      var pref = Object.assign({}, PREF);
      if (pref.count) pref.count = Number(pref.count);

      RESULT = DPDigiAI.generate(HERO, ALL, pref);

      if (!RESULT || !RESULT.outfits.length) {
        out.innerHTML = '<div class="ai-none-box">'
          + svg(I.spark, 'ai-bigico')
          + '<strong>با این تنظیمات تیپی ساخته نشد</strong>'
          + '<span>شاید کالاهای مکمل کافی در سایت نیست. '
          + 'یکی از فیلترها را بردارید یا کالای دیگری انتخاب کنید.</span>'
          + '</div>';
        return;
      }

      paintOutfits();

      /* هر ست که دیده شد، به مغز گزارش شود */
      RESULT.outfits.forEach(function (o) {
        if (SHOWN[o.id]) return;
        SHOWN[o.id] = 1;
        if (window.DPBrain) {
          try {
            DPBrain.feedback({
              action: 'shown', hero: HERO,
              items: o.items.map(function (x) { return x.p; }),
              breakdown: o.breakdown,
            });
          } catch (e) { /* بی‌اهمیت */ }
        }
      });

      paintBrainBar();
    }, 380);
  }

  function paintOutfits() {
    $('#aiOut').innerHTML = RESULT.outfits.map(card).join('');
  }

  function card(fit) {
    var pieces = [{ p: fit.hero, slot: DPDigiAI.slotOf(fit.hero), self: true }]
      .concat(fit.items);

    var chips = '';
    if (fit.report) {
      if (fit.report.verdict) {
        chips += '<span class="ai-chip is-' + fit.report.verdict.key + '">'
          + esc(fit.report.verdict.name) + '</span>';
      }
      if (fit.report.focus) {
        chips += '<span class="ai-chip">'
          + (fit.report.focus.level === 'ideal' ? 'یک کانون توجه'
            : fit.report.focus.level === 'calm' ? 'تیپ آرام' : 'کمی شلوغ')
          + '</span>';
      }
      if (fit.report.balance && fit.report.balance.ok) {
        chips += '<span class="ai-chip is-ok">نسبت رنگ درست</span>';
      }
    }

    return '<article class="ai-fit" data-fit="' + esc(fit.id) + '">'

      + '<header class="ai-fit-head">'
      +   '<div class="ai-fit-title">'
      +     '<span class="ai-fit-tag">' + esc(fit.variant) + '</span>'
      +     '<p>' + esc(fit.hint) + '</p>'
      +   '</div>'
      +   '<span class="ai-fit-score" title="امتیاز هماهنگی">'
      +     '<b>' + FA(fit.score) + '</b><small>از ۱۰۰</small></span>'
      + '</header>'

      + (chips ? '<div class="ai-chips">' + chips + '</div>' : '')

      /* ---------- نوار معیارها ---------- */
      + '<div class="ai-bars">' + bars(fit.breakdown) + '</div>'

      /* ---------- قطعه‌ها ---------- */
      + '<div class="ai-grid">'
      + pieces.map(function (x) { return piece(x, fit); }).join('')
      + '</div>'

      /* ---------- پا ---------- */
      + '<footer class="ai-fit-foot">'
      +   '<div class="ai-sum">'
      +     '<span>قیمت کل تیپ</span>'
      +     '<b>' + money(fit.payable) + '<small>تومان</small></b>'
      +     (fit.save > 0
            ? '<em>با تخفیف ست ٪' + FA(fit.discount) + ' — '
              + money(fit.save) + ' تومان کمتر</em>' : '')
      +   '</div>'
      +   '<div class="ai-acts">'
      +     '<button class="ai-btn ghost" type="button" data-save="' + esc(fit.id) + '">'
      +       svg(I.save, 'ico ico-s') + '<span>ذخیره در کمد</span></button>'
      +     '<button class="ai-btn gold" type="button" data-cart="' + esc(fit.id) + '">'
      +       svg(I.cart, 'ico ico-s') + '<span>افزودن همه به سبد</span></button>'
      +   '</div>'
      + '</footer></article>';
  }

  var BAR_LBL = {
    color: 'رنگ', style: 'سبک', occasion: 'مناسبت',
    taste: 'سلیقه', budget: 'قیمت',
  };

  function bars(bd) {
    return Object.keys(BAR_LBL).map(function (k) {
      var v = Math.max(0, Math.min(100, Number(bd[k]) || 0));
      return '<div class="ai-bar" title="' + esc(BAR_LBL[k]) + ': ' + FA(v) + ' از ۱۰۰">'
        + '<span class="ai-bar-l">' + esc(BAR_LBL[k]) + '</span>'
        + '<span class="ai-bar-t"><i style="width:' + v + '%"></i></span>'
        + '<span class="ai-bar-n">' + FA(v) + '</span></div>';
    }).join('');
  }

  function piece(x, fit) {
    var p = x.p;
    var img = (Array.isArray(p.images) ? p.images : [])[0];
    var url = './product.html?id=' + encodeURIComponent(p.id);
    var slot = window.DPStylist ? (DPStylist.SLOT[x.slot] || '') : '';
    var pr = DPDigiAI.priceOf(p);

    /* رنگ‌ها */
    var dots = '';
    if (window.DPPalette) {
      try {
        var cs = DPPalette.colorsOf(p).slice(0, 3);
        if (cs.length) {
          dots = '<span class="ai-dots">' + cs.map(function (c) {
            var H = DPPalette.HUE[c];
            return '<i title="' + esc(H ? H.name : c) + '" style="background:'
              + (H ? H.hex : '#ccc') + '"></i>';
          }).join('') + '</span>';
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    /* سایزها */
    var sizes = (Array.isArray(p.sizes) ? p.sizes : []).slice(0, 5);

    return '<div class="ai-piece' + (x.self ? ' is-self' : '') + '">'
      + '<a class="ai-pshot" href="' + url + '">'
      +   (img ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
               : '<i>' + esc((p.name || '؟').trim()[0]) + '</i>')
      +   (slot ? '<span class="ai-pslot">' + esc(slot) + '</span>' : '')
      +   (x.self ? '<span class="ai-pself">کالای شما</span>' : '')
      + '</a>'

      + '<div class="ai-pbody">'
      +   '<a class="ai-pname" href="' + url + '">' + esc(p.name) + '</a>'
      +   '<span class="ai-pprice">' + money(pr) + '<small>تومان</small></span>'
      +   dots
      +   (sizes.length
          ? '<span class="ai-psizes">' + sizes.map(function (z) {
              /* سایز پیشنهادی برجسته می‌شود */
              var on = x.fit && x.fit.label === z;
              return '<i' + (on ? ' class="is-fit" title="سایز پیشنهادی شما"' : '')
                + '>' + esc(z) + '</i>';
            }).join('') + '</span>' : '')
    +   (x.fit
          ? '<span class="ai-pfit">سایز ' + esc(x.fit.label)
            + ' — ' + FA(x.fit.percent) + '٪ تناسب</span>' : '')
      +   (x.why ? '<p class="ai-pwhy">' + svg(I.check, 'ico ico-s')
                 + esc(x.why) + '</p>' : '')
      +   (!x.self && x.alts && x.alts.length
          ? '<button class="ai-pswap" type="button" data-swap="' + esc(fit.id) + '"'
            + ' data-slot="' + esc(x.slot) + '">'
            + svg(I.swap, 'ico ico-s') + ' جایگزین (' + FA(x.alts.length) + ')</button>'
          : '')
      + '</div></div>';
  }

  /* ============================================================
     پنجره‌ی جایگزین
     ============================================================ */
  function openSwap(fitId, slot) {
    if (!RESULT) return;
    var fit = RESULT.outfits.filter(function (o) { return o.id === fitId; })[0];
    if (!fit) return;

    var item = fit.items.filter(function (x) { return x.slot === slot; })[0];
    if (!item || !item.alts.length) return;

    var box = document.createElement('div');
    box.className = 'ai-modal';
    box.innerHTML =
      '<div class="ai-modal-veil" data-mclose></div>'
      + '<div class="ai-modal-in" role="dialog" aria-modal="true" aria-label="گزینه‌های جایگزین">'
      +   '<header class="ai-modal-head">'
      +     '<h3>گزینه‌های دیگر برای ' + esc(DPStylist.SLOT[slot] || 'این قطعه') + '</h3>'
      +     '<button type="button" data-mclose aria-label="بستن">'
      +       svg(I.close, 'ico') + '</button>'
      +   '</header>'
      +   '<div class="ai-alts">'
      +   item.alts.map(function (a) {
            var img = (Array.isArray(a.p.images) ? a.p.images : [])[0];
            return '<button class="ai-alt" type="button" data-pick="' + esc(a.p.id) + '"'
              + ' data-fit="' + esc(fitId) + '" data-slot="' + esc(slot) + '">'
              + '<span class="ai-ashot">'
              +   (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" />'
                       : '<i>' + esc((a.p.name || '؟').trim()[0]) + '</i>')
              + '</span>'
              + '<span class="ai-atxt">'
              +   '<b>' + esc(a.p.name) + '</b>'
              +   '<em>' + esc(a.why) + '</em>'
              +   '<span>' + money(DPDigiAI.priceOf(a.p)) + ' تومان</span>'
              + '</span>'
              + '<span class="ai-ascore">' + FA(Math.round(a.score)) + '</span>'
              + '</button>';
          }).join('')
      +   '</div>'
      + '</div>';

    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-on'); });
  }

  function closeSwap() {
    var m = $('.ai-modal');
    if (!m) return;
    m.classList.remove('is-on');
    setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 260);
  }

  /* ============================================================
     نوار وضعیت مغز
     ============================================================ */
  function paintBrainBar() {
    if (!window.DPBrain) return;
    var el = $('#aiBrainBar');
    var st = DPBrain.stats();

    if (!st.signals) { el.hidden = true; return; }

    var W = DPBrain.weights();
    var top = Object.keys(W).sort(function (a, b) { return W[b] - W[a]; })[0];
    var LBL = { color: 'رنگ', style: 'سبک', occasion: 'مناسبت',
                taste: 'سلیقه', budget: 'قیمت' };

    el.hidden = false;
    el.innerHTML =
      '<span class="ai-bb-dot"></span>'
      + '<span>از <b>' + FA(st.signals) + '</b> رفتار مشتری‌ها یاد گرفته'
      + (st.tuned ? ' — الان <b>' + esc(LBL[top] || top) + '</b> را مهم‌تر می‌داند' : '')
      + '</span>';
  }

  /* ============================================================
     بخش دو: آزمون سبک
     ============================================================ */
  var QUIZ = [
    {
      id: 'occasion',
      q: 'بیشتر برای چه موقعیتی لباس می‌خرید؟',
      opts: [
        { v: 'daily',    t: 'روزمره و بیرون رفتن' },
        { v: 'business', t: 'محل کار و جلسه' },
        { v: 'party',    t: 'مهمانی و مراسم' },
        { v: 'casual',   t: 'دورهمی با دوستان' },
      ],
    },
    {
      id: 'style',
      q: 'کدام توصیف به سبک شما نزدیک‌تر است؟',
      opts: [
        { v: 'classic',  t: 'ساده و کلاسیک — چیزی که هیچ‌وقت از مد نمی‌افتد' },
        { v: 'modern',   t: 'مدرن و مینیمال — خطوط تمیز، بدون شلوغی' },
        { v: 'elegant',  t: 'شیک و پرجزئیات — دوست دارم خاص باشم' },
        { v: 'casual',   t: 'راحت و بی‌تکلف — راحتی مهم‌تر از همه' },
      ],
    },
    {
      id: 'palette',
      q: 'معمولاً به چه رنگ‌هایی کشیده می‌شوید؟',
      opts: [
        { v: 'neutral', t: 'خنثی — مشکی، سفید، بژ، سرمه‌ای' },
        { v: 'warm',    t: 'گرم — قهوه‌ای، شتری، زرشکی، خردلی' },
        { v: 'cool',    t: 'سرد — آبی، سبز، طوسی، بنفش' },
        { v: 'bold',    t: 'پرشدت — رنگ‌های زنده و چشمگیر' },
      ],
    },
    {
      id: 'fabric',
      q: 'کدام جنس را بیشتر می‌پسندید؟',
      opts: [
        { v: 'cotton',  t: 'نخ و کتان — سبک و راحت' },
        { v: 'wool',    t: 'پشم و بافت — گرم و باکیفیت' },
        { v: 'silk',    t: 'ابریشم و ساتن — نرم و مجلسی' },
        { v: 'denim',   t: 'جین — بادوام و همیشگی' },
      ],
    },
    {
      id: 'budget',
      q: 'معمولاً برای یک قطعه چقدر هزینه می‌کنید؟',
      opts: [
        { v: 'low',    t: 'تا ۱٫۵ میلیون — به‌صرفه' },
        { v: 'medium', t: 'تا ۵ میلیون — متعادل' },
        { v: 'high',   t: 'تا ۱۵ میلیون — کیفیت مهم است' },
        { v: 'luxury', t: 'محدودیتی ندارم — بهترین را می‌خواهم' },
      ],
    },
  ];

  var qStep = 0;
  var qAns = {};

  function paintQuiz() {
    var host = $('#aiQuiz');
    var prof = profile();

    /* اگر قبلاً آزمون داده و در حال بازآزمون نیست */
    if (prof && qStep === 0 && !qAns._retake) {
      host.innerHTML = quizResult(prof, true);
      return;
    }

    if (qStep >= QUIZ.length) {
      var p = {
        occasion: qAns.occasion || '',
        style: qAns.style || '',
        palette: qAns.palette || '',
        fabric: qAns.fabric || '',
        budget: qAns.budget || '',
        at: Date.now(),
      };
      saveProfile(p);

      /* پروفایل روی تنظیمات ساخت تیپ هم بنشیند */
      if (p.style) PREF.style = p.style;
      if (p.palette) PREF.palette = p.palette;
      if (p.budget) PREF.budget = p.budget;
      if (p.occasion) PREF.occasion = p.occasion;
      if (HERO) paintPrefs();

      host.innerHTML = quizResult(p, false);
      return;
    }

    var Q = QUIZ[qStep];
    var pct = Math.round((qStep / QUIZ.length) * 100);

    host.innerHTML =
      '<div class="ai-q">'
      + '<div class="ai-qbar"><i style="width:' + pct + '%"></i></div>'
      + '<span class="ai-qn">پرسش ' + FA(qStep + 1) + ' از ' + FA(QUIZ.length) + '</span>'
      + '<h2>' + esc(Q.q) + '</h2>'
      + '<div class="ai-qopts">'
      + Q.opts.map(function (o) {
          return '<button class="ai-qopt' + (qAns[Q.id] === o.v ? ' is-on' : '') + '"'
            + ' type="button" data-q="' + esc(Q.id) + '" data-v="' + esc(o.v) + '">'
            + esc(o.t) + '</button>';
        }).join('')
      + '</div>'
      + '<div class="ai-qnav">'
      +   (qStep > 0
          ? '<button class="ai-btn ghost" type="button" data-qback>'
            + svg(I.back, 'ico ico-s') + ' قبلی</button>' : '<span></span>')
      +   '<button class="ai-btn gold" type="button" data-qnext'
      +     (qAns[Q.id] ? '' : ' disabled') + '>'
      +     (qStep === QUIZ.length - 1 ? 'پایان' : 'بعدی')
      +     svg(I.fwd, 'ico ico-s') + '</button>'
      + '</div></div>';
  }

  function quizResult(p, existing) {
    var D = window.DPDigiAI;
    function nm(map, k) { return (map && map[k]) ? map[k].name : ''; }

    var rows = [
      ['مناسبت اصلی', nm(D.OCCASION, p.occasion)],
      ['سبک', nm(D.STYLE, p.style)],
      ['پالت رنگ', nm(D.PALETTE, p.palette)],
      ['بودجه', nm(D.BUDGET, p.budget)],
    ].filter(function (r) { return r[1]; });

    var fab = '';
    if (p.fabric && window.DPFashion) {
      var f = DPFashion.fabricInfo(p.fabric);
      if (f) fab = f.name;
    }
    if (fab) rows.push(['جنس دلخواه', fab]);

    return '<div class="ai-qdone">'
      + svg(I.spark, 'ai-bigico')
      + '<h2>' + (existing ? 'پروفایل سبک شما' : 'پروفایل سبک شما ساخته شد') + '</h2>'
      + '<p>از این پس پیشنهادهای دیجی AI با سلیقه‌ی شما تنظیم می‌شود.</p>'
      + '<dl class="ai-qlist">'
      + rows.map(function (r) {
          return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        }).join('')
      + '</dl>'
      + '<div class="ai-qacts">'
      +   '<button class="ai-btn ghost" type="button" data-qretake>آزمون دوباره</button>'
      +   '<button class="ai-btn gold" type="button" data-goto="make">'
      +     'ساخت تیپ با این سلیقه</button>'
      + '</div></div>';
  }

  /* ============================================================
     بخش سه: کمد من
     ============================================================ */
  function paintCloset() {
    var host = $('#aiCloset');
    var list = window.DPDigiAI ? DPDigiAI.readWardrobe() : [];

    var n = $('#aiClosetN');
    if (list.length) { n.hidden = false; n.textContent = FA(list.length); }
    else n.hidden = true;

    if (!list.length) {
      host.innerHTML = '<div class="ai-none-box">'
        + svg(I.save, 'ai-bigico')
        + '<strong>کمدتان هنوز خالی است</strong>'
        + '<span>تیپی بسازید و با دکمه‌ی «ذخیره در کمد» اینجا نگهش دارید.</span>'
        + '<button class="ai-btn gold" type="button" data-goto="make">ساخت تیپ</button>'
        + '</div>';
      return;
    }

    var byId = {};
    ALL.forEach(function (p) { byId[String(p.id)] = p; });

    host.innerHTML = '<div class="ai-closet-grid">' + list.map(function (rec) {
      var hero = byId[rec.heroId];
      var items = rec.itemIds.map(function (i) { return byId[i]; }).filter(Boolean);
      var all = (hero ? [hero] : []).concat(items);

      if (!all.length) {
        return '<article class="ai-saved is-gone">'
          + '<div class="ai-saved-head"><b>' + esc(rec.name) + '</b></div>'
          + '<p class="ai-gone">کالاهای این تیپ دیگر موجود نیستند</p>'
          + '<button class="ai-btn ghost small" type="button" data-del="' + esc(rec.id) + '">'
          + svg(I.trash, 'ico ico-s') + ' حذف</button></article>';
      }

      var total = all.reduce(function (a, p) { return a + DPDigiAI.priceOf(p); }, 0);

      return '<article class="ai-saved' + (rec.fav ? ' is-fav' : '') + '">'
        + '<div class="ai-saved-head">'
        +   '<b>' + esc(rec.name) + '</b>'
        +   '<button class="ai-fav" type="button" data-fav="' + esc(rec.id) + '"'
        +     ' aria-label="نشان کردن" aria-pressed="' + (rec.fav ? 'true' : 'false') + '">'
        +     svg(I.star, 'ico ico-s') + '</button>'
        + '</div>'

        + '<div class="ai-saved-row">'
        + all.slice(0, 5).map(function (p) {
            var img = (Array.isArray(p.images) ? p.images : [])[0];
            return '<a class="ai-sthumb" href="./product.html?id='
              + encodeURIComponent(p.id) + '" title="' + esc(p.name) + '">'
              + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" />'
                     : '<i>' + esc((p.name || '؟').trim()[0]) + '</i>')
              + '</a>';
          }).join('')
        + '</div>'

        + '<div class="ai-saved-foot">'
        +   '<span>' + FA(all.length) + ' قطعه · ' + money(total) + ' تومان</span>'
        +   '<div>'
        +     '<button class="ai-btn ghost small" type="button" data-del="' + esc(rec.id) + '">'
        +       svg(I.trash, 'ico ico-s') + '</button>'
        +     '<button class="ai-btn gold small" type="button" data-scart="' + esc(rec.id) + '">'
        +       svg(I.cart, 'ico ico-s') + ' سبد</button>'
        +   '</div>'
        + '</div></article>';
    }).join('') + '</div>';
  }

  /* ============================================================
     بخش چهار: مشاوره
     ------------------------------------------------------------
     این یک مدل زبانی نیست — یک سیستم پرسش‌فهم است که از
     همان دانشنامه‌ی رنگ و موتور ست استفاده می‌کند. صادقانه
     هم همین را به کاربر می‌گوید.
     ============================================================ */
  var CHAT_KEY = 'dp_ai_chat';

  function chatLog() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAT_KEY));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function chatSave(list) {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(list.slice(-40))); }
    catch (e) { /* بی‌اهمیت */ }
  }

  var WELCOME = {
    me: false,
    t: 'سلام! من دیجی AI هستم. درباره‌ی رنگ، ست کردن، جنس پارچه '
     + 'یا انتخاب سایز بپرسید. جواب‌هایم بر پایه‌ی دانشنامه‌ی رنگ '
     + 'و کالاهای واقعی همین سایت است.',
  };

  function paintChat() {
    var log = chatLog();
    var host = $('#aiChatLog');

    /* ⚠️ پیام خوش‌آمد باید **ذخیره** شود، نه فقط نمایش داده شود.
       پیش‌تر فقط موقع رسم ساخته می‌شد؛ پس با اولین پرسش ناپدید
       می‌شد و کاربر متن راهنما را از دست می‌داد. */
    if (!log.length) {
      log = [WELCOME];
      chatSave(log);
    }

    host.innerHTML = log.map(function (m) {
      return '<div class="ai-msg' + (m.me ? ' is-me' : '') + '">'
        + '<span class="ai-avat">' + svg(m.me ? I.user : I.bot, 'ico ico-s') + '</span>'
        + '<div class="ai-bub">' + (m.html ? m.t : esc(m.t)) + '</div></div>';
    }).join('');

    host.scrollTop = host.scrollHeight;

    /* پرسش‌های آماده */
    var tips = [
      'با پیراهن کرم چه شلواری بپوشم؟',
      'رنگ سرمه‌ای با چه رنگ‌هایی می‌رود؟',
      'برای عروسی چه بپوشم؟',
      'سایز M یعنی چند؟',
    ];
    $('#aiChatTips').innerHTML = tips.map(function (t) {
      return '<button class="ai-tip" type="button" data-tip="' + esc(t) + '">'
        + esc(t) + '</button>';
    }).join('');
  }

  function ask(text) {
    var log = chatLog();
    log.push({ me: true, t: text });
    var ans = answer(text);
    log.push({ me: false, t: ans.text, html: ans.html });
    chatSave(log);
    paintChat();
  }

  /** موتور پاسخ — بر پایه‌ی دانشنامه، نه حدس */
  function answer(q) {
    var s = String(q || '').trim();
    var P = window.DPPalette;

    /* ---------- پرسش درباره‌ی رنگ ---------- */
    if (P) {
      var found = [];
      Object.keys(P.HUE).forEach(function (k) {
        var nm = P.HUE[k].name;
        if (nm && s.indexOf(nm) > -1) found.push(k);
      });
      Object.keys(P.ALIAS || {}).forEach(function (a) {
        if (s.indexOf(a) > -1 && found.indexOf(P.ALIAS[a]) < 0) found.push(P.ALIAS[a]);
      });

      if (found.length) {
        var key = found[0];
        var H = P.HUE[key];
        var d = P.describe(key);
        var comp = P.companions(key, 6);

        var html = '<b>' + esc(H.name) + '</b>'
          + (d && d.traits.length ? ' — ' + esc(d.traits.join('، ')) : '')
          + (d && d.season ? ' · پالت ' + esc(d.season.name) : '')
          + '<br><br>بهترین همراهانش:'
          + '<span class="ai-cwrap">'
          + comp.map(function (c) {
              return '<span class="ai-cpair"><i style="background:' + c.hex + '"></i>'
                + esc(c.name) + '<em>' + FA(c.score) + '</em></span>';
            }).join('')
          + '</span>';

        /* کالاهای واقعی با این رنگ */
        var real = ALL.filter(function (p) {
          if (Number(p.stock) <= 0) return false;
          try { return P.colorsOf(p).indexOf(key) > -1; } catch (e) { return false; }
        }).slice(0, 4);

        if (real.length) {
          html += '<br><br>در سایت موجود است:<span class="ai-plist">'
            + real.map(function (p) {
                return '<a href="./product.html?id=' + encodeURIComponent(p.id) + '">'
                  + esc(p.name) + '</a>';
              }).join('')
            + '</span>';
        }

        return { text: html, html: true };
      }
    }

    /* ---------- پرسش درباره‌ی سایز ---------- */
    var mSize = s.match(/\b(XS|S|M|L|XL|XXL)\b/i);
    if (mSize && window.DPFashion) {
      var info = DPFashion.sizeInfo(mSize[1]);
      if (info) {
        return {
          text: '<b>سایز ' + esc(mSize[1].toUpperCase()) + '</b><br>'
            + 'معادل اروپا: ' + esc(info.eu) + '<br>'
            + 'دور سینه: ' + esc(info.chest) + ' سانت<br>'
            + 'دور کمر: ' + esc(info.waist) + ' سانت<br><br>'
            + '<small>هر برند کمی فرق دارد — جدول سایز همان فروشگاه را هم ببینید.</small>',
          html: true,
        };
      }
    }

    /* ---------- پرسش درباره‌ی مناسبت ---------- */
    var D = window.DPDigiAI;
    if (D) {
      var occ = null;
      Object.keys(D.OCCASION).forEach(function (k) {
        if (s.indexOf(D.OCCASION[k].name) > -1) occ = k;
      });
      if (!occ && /عروسی|دامادی/.test(s)) occ = 'wedding';
      if (!occ && /مهمانی|مجلس|شب/.test(s)) occ = 'party';
      if (!occ && /اداری|کار|شرکت|جلسه/.test(s)) occ = 'business';
      if (!occ && /ورزش|باشگاه/.test(s)) occ = 'sporty';

      if (occ) {
        var O = D.OCCASION[occ];
        var lvl = O.formal;
        var pick = ALL.filter(function (p) {
          if (Number(p.stock) <= 0) return false;
          if (!window.DPStylist) return false;
          return Math.abs(DPStylist.formalOf(p) - lvl) <= 1;
        }).slice(0, 5);

        var h = 'برای <b>' + esc(O.name) + '</b> سطح رسمیت حدود '
          + FA(lvl) + ' از ۵ مناسب است.';

        if (pick.length) {
          h += '<br><br>این‌ها به کارتان می‌آید:<span class="ai-plist">'
            + pick.map(function (p) {
                return '<a href="./product.html?id=' + encodeURIComponent(p.id) + '">'
                  + esc(p.name) + '</a>';
              }).join('') + '</span>';
          h += '<br><br><a class="ai-inline" href="./digiai.html">'
            + 'یکی را انتخاب کنید تا تیپ کاملش را بسازم</a>';
        }
        return { text: h, html: true };
      }
    }

    /* ---------- پرسش درباره‌ی جنس ---------- */
    if (window.DPFashion) {
      var fabs = ['cotton','linen','silk','wool','cashmere','denim',
                  'leather','polyester','viscose','velvet','knit'];
      for (var i = 0; i < fabs.length; i++) {
        var fi = DPFashion.fabricInfo(fabs[i]);
        if (fi && s.indexOf(fi.name) > -1) {
          return {
            text: '<b>' + esc(fi.name) + '</b><br>'
              + 'فصل مناسب: ' + esc(fi.season) + '<br>'
              + 'نکته: ' + esc(fi.care),
            html: true,
          };
        }
      }
    }

    /* ---------- «با این چه بپوشم» ---------- */
    if (/چه بپوشم|چی بپوشم|ست کنم|ست چی|با چی/.test(s)) {
      return {
        text: 'برای اینکه دقیق راهنمایی کنم، کالا را انتخاب کنید:<br><br>'
          + '<a class="ai-inline" href="#" data-goto="make">'
          + 'رفتن به بخش ساخت تیپ</a><br><br>'
          + 'آنجا سه تیپ کامل با دلیل هر انتخاب می‌سازم.',
        html: true,
      };
    }

    /* ---------- پاسخ پیش‌فرض، صادقانه ---------- */
    return {
      text: 'این را نفهمیدم. من درباره‌ی این‌ها می‌توانم کمک کنم:<br><br>'
        + '· <b>رنگ</b> — «سرمه‌ای با چه می‌رود؟»<br>'
        + '· <b>سایز</b> — «سایز L یعنی چند؟»<br>'
        + '· <b>مناسبت</b> — «برای عروسی چه بپوشم؟»<br>'
        + '· <b>جنس</b> — «کتان چطور است؟»<br><br>'
        + '<small>راستش را بخواهید من یک مدل زبانی نیستم؛ '
        + 'یک موتور قاعده‌محورم که از دانشنامه‌ی رنگ و کالاهای '
        + 'همین سایت جواب می‌دهد.</small>',
      html: true,
    };
  }


  /* ============================================================
     بخش پنج: رنگ‌یاب عکس
     ------------------------------------------------------------
     رنگ‌های غالب عکس را واقعاً استخراج می‌کند و کالاهای
     هم‌رنگ را پیدا می‌کند. تشخیص نوع کالا نمی‌دهد — و همین
     را هم صریح به کاربر می‌گوید.
     ============================================================ */
  var LENS_WIRED = false;

  function wireLens() {
    if (LENS_WIRED) return;
    var drop = $('#aiDrop');
    var file = $('#aiFile');
    if (!drop || !file) return;
    LENS_WIRED = true;

    file.addEventListener('change', function () {
      if (file.files && file.files[0]) readImage(file.files[0]);
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add('is-over');
      });
    });

    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('is-over');
      });
    });

    drop.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) readImage(f);
    });
  }

  function readImage(f) {
    var out = $('#aiLensOut');
    out.hidden = false;
    out.innerHTML = '<div class="ai-load"><span class="ai-spin"></span>'
      + '<p>در حال خواندن رنگ‌های عکس…</p></div>';

    if (!window.DPVision) {
      out.innerHTML = '<div class="ai-none-box">'
        + '<strong>موتور رنگ‌یاب بارگذاری نشد</strong></div>';
      return;
    }

    DPVision.fromFile(f, function (err, res) {
      if (err) {
        out.innerHTML = '<div class="ai-none-box">' + svg(I.close, 'ai-bigico')
          + '<strong>' + esc(err) + '</strong></div>';
        return;
      }
      paintLens(res);
    });
  }

  function paintLens(res) {
    var out = $('#aiLensOut');
    var colors = res.colors;

    var similar = [];
    try {
      similar = DPVision.findSimilar(colors, ALL, { limit: 12 });
    } catch (e) { similar = []; }

    var html =
      '<div class="ai-lens-head">'
      + '<img class="ai-lens-img" src="' + esc(res.src) + '" alt="عکس شما" />'
      + '<div class="ai-lens-info">'
      +   '<h3>رنگ‌های این عکس</h3>'
      +   '<div class="ai-swatches">'
      +   colors.map(function (c) {
            return '<div class="ai-sw" title="' + esc(c.hex) + '">'
              + '<span class="ai-sw-box" style="background:' + esc(c.hex) + '"></span>'
              + '<b>' + esc(c.name) + '</b>'
              + '<small>' + FA(c.percent) + '٪</small></div>';
          }).join('')
      +   '</div>'
      + '</div></div>';

    /* ---------- کالاهای هم‌رنگ ---------- */
    if (similar.length) {
      html += '<div class="ai-lens-grp">'
        + '<h3>' + FA(similar.length) + ' کالای هم‌رنگ در سایت</h3>'
        + '<div class="ai-heroes">'
        + similar.map(function (r) {
            var p = r.p;
            var img = (Array.isArray(p.images) ? p.images : [])[0];
            var pr = window.DPDigiAI ? DPDigiAI.priceOf(p) : (p.price || 0);
            return '<div class="ai-hcard is-static">'
              + '<a class="ai-hshot" href="./product.html?id='
              +   encodeURIComponent(p.id) + '">'
              +   (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" />'
                       : '<i>' + esc((p.name || '؟').trim()[0]) + '</i>')
              + '</a>'
              + '<span class="ai-hname">' + esc(p.name) + '</span>'
              + '<span class="ai-hslot">' + money(pr) + ' تومان</span>'
              + '<button class="ai-hpick" type="button" data-hero="' + esc(p.id) + '">'
              +   'ساخت تیپ با این</button>'
              + '</div>';
          }).join('')
        + '</div></div>';
    } else {
      html += '<div class="ai-none-box">'
        + '<strong>کالای هم‌رنگی پیدا نشد</strong>'
        + '<span>شاید این رنگ‌ها هنوز در سایت نیستند. '
        + 'عکس دیگری امتحان کنید.</span></div>';
    }

    /* ---------- پیشنهاد رنگ همراه ---------- */
    if (window.DPPalette && colors.length && colors[0].key) {
      var comp = DPPalette.companions(colors[0].key, 6);
      if (comp.length) {
        html += '<div class="ai-lens-grp">'
          + '<h3>با ' + esc(colors[0].name) + ' این رنگ‌ها می‌روند</h3>'
          + '<div class="ai-cwrap">'
          + comp.map(function (c) {
              return '<span class="ai-cpair"><i style="background:' + c.hex + '"></i>'
                + esc(c.name) + '<em>' + FA(c.score) + '</em></span>';
            }).join('')
          + '</div></div>';
      }
    }

    out.innerHTML = html;
  }

  /* ============================================================
     زبانه‌ها
     ============================================================ */
  function tab(name) {
    $$('.ai-tab').forEach(function (b) {
      var on = b.dataset.tab === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    var map = { make: 'panelMake', quiz: 'panelQuiz', closet: 'panelCloset',
                lens: 'panelLens', chat: 'panelChat' };
    Object.keys(map).forEach(function (k) {
      var el = document.getElementById(map[k]);
      if (!el) return;
      el.hidden = k !== name;
      el.classList.toggle('is-on', k === name);
    });

    if (name === 'quiz') paintQuiz();
    if (name === 'closet') paintCloset();
    if (name === 'chat') paintChat();
    if (name === 'lens') wireLens();

    try {
      var u = new URL(location.href);
      u.searchParams.set('tab', name);
      history.replaceState(null, '', u);
    } catch (e) { /* بی‌اهمیت */ }
  }

  /* ============================================================
     رویدادها
     ============================================================ */
  function wire() {
    /* ---------- زبانه ---------- */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.ai-tab');
      if (t) { tab(t.dataset.tab); return; }

      var g = e.target.closest('[data-goto]');
      if (g) { e.preventDefault(); tab(g.dataset.goto); return; }

      /* ---------- انتخاب کالای اصلی ---------- */
      var h = e.target.closest('[data-hero]');
      if (h) {
        /* اگر از رنگ‌یاب آمده، اول به زبانه‌ی ساخت برو */
        if (h.closest('#panelLens')) tab('make');
        chooseHero(h.dataset.hero);
        return;
      }

      if (e.target.closest('[data-unhero]')) {
        HERO = null; RESULT = null; SHOWN = {};
        $('#aiChosen').hidden = true;
        $('#aiPick').hidden = false;
        $('#aiStep2').hidden = true;
        $('#aiStep3').hidden = true;
        return;
      }

      /* ---------- تنظیمات ---------- */
      var pr = e.target.closest('[data-pref]');
      if (pr) {
        var k = pr.dataset.pref, v = pr.dataset.val;
        if (v) PREF[k] = v; else delete PREF[k];
        paintPrefs();
        return;
      }

      /* ---------- ساخت ---------- */
      if (e.target.closest('#aiGo')) { build(); return; }

      /* ---------- جایگزین ---------- */
      var sw = e.target.closest('[data-swap]');
      if (sw) { openSwap(sw.dataset.swap, sw.dataset.slot); return; }

      if (e.target.closest('[data-mclose]')) { closeSwap(); return; }

      var pk = e.target.closest('[data-pick]');
      if (pk) {
        var fit = DPDigiAI.swap(RESULT, pk.dataset.fit, pk.dataset.slot, pk.dataset.pick);
        closeSwap();
        if (fit) {
          paintOutfits();
          paintBrainBar();
          toast('قطعه عوض شد — یاد گرفتم که آن یکی را نپسندیدید');
        }
        return;
      }

      /* ---------- ذخیره ---------- */
      var sv = e.target.closest('[data-save]');
      if (sv) {
        var f2 = RESULT.outfits.filter(function (o) { return o.id === sv.dataset.save; })[0];
        if (!f2) return;
        var rec = DPDigiAI.saveOutfit(f2, '');
        if (rec) {
          toast('در کمد ذخیره شد');
          paintCloset();
        } else {
          toast('ذخیره نشد — حافظه‌ی مرورگر در دسترس نیست', 'bad');
        }
        return;
      }

      /* ---------- افزودن به سبد ---------- */
      var ct = e.target.closest('[data-cart]');
      if (ct) {
        var f3 = RESULT.outfits.filter(function (o) { return o.id === ct.dataset.cart; })[0];
        if (!f3) return;
        var r = DPDigiAI.addToCart(f3);

        if (!r.ok && r.needSize && r.needSize.length) {
          toast('قطعه‌های این تیپ سایز دارند — روی هرکدام بزنید و سایزش را انتخاب کنید', 'bad');
          return;
        }
        var msg = FA(r.added) + ' قطعه به سبد اضافه شد';
        if (r.needSize && r.needSize.length) {
          msg += ' — ' + FA(r.needSize.length) + ' قطعه سایز می‌خواهد';
        }
        toast(msg, 'good');
        paintBrainBar();
        return;
      }

      /* ---------- کمد ---------- */
      var dl = e.target.closest('[data-del]');
      if (dl) { DPDigiAI.removeOutfit(dl.dataset.del); paintCloset(); return; }

      var fv = e.target.closest('[data-fav]');
      if (fv) { DPDigiAI.favOutfit(fv.dataset.fav); paintCloset(); return; }

      var sc = e.target.closest('[data-scart]');
      if (sc) {
        var list = DPDigiAI.readWardrobe();
        var rec2 = list.filter(function (x) { return x.id === sc.dataset.scart; })[0];
        if (!rec2 || !window.DPCart) return;

        var byId = {};
        ALL.forEach(function (p) { byId[String(p.id)] = p; });

        var added = 0, need = 0;
        [rec2.heroId].concat(rec2.itemIds).forEach(function (id) {
          var p = byId[id];
          if (!p) return;
          if (Array.isArray(p.sizes) && p.sizes.length) { need++; return; }
          try {
            DPCart.add(p.id, { qty: 1, color: (p.colors || [])[0] || '', size: '' });
            added++;
          } catch (err) { /* موجودی */ }
        });

        toast(added
          ? FA(added) + ' قطعه به سبد اضافه شد' + (need ? ' — ' + FA(need) + ' قطعه سایز می‌خواهد' : '')
          : 'قطعه‌های این تیپ سایز دارند — روی هرکدام بزنید', added ? 'good' : 'bad');
        return;
      }

      /* ---------- آزمون ---------- */
      var qo = e.target.closest('[data-q]');
      if (qo) { qAns[qo.dataset.q] = qo.dataset.v; paintQuiz(); return; }

      if (e.target.closest('[data-qnext]')) { qStep++; paintQuiz(); return; }
      if (e.target.closest('[data-qback]')) { qStep = Math.max(0, qStep - 1); paintQuiz(); return; }
      if (e.target.closest('[data-qretake]')) {
        qStep = 0; qAns = { _retake: 1 }; paintQuiz(); return;
      }

      /* ---------- پرسش آماده ---------- */
      var tp = e.target.closest('[data-tip]');
      if (tp) { ask(tp.dataset.tip); return; }
    });

    /* ---------- جست‌وجوی کالای اصلی ---------- */
    var hs = $('#aiHeroSearch');
    if (hs) {
      var timer = null;
      hs.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { paintHeroes(hs.value); }, 140);
      });
    }

    /* ---------- گفت‌وگو ---------- */
    var cf = $('#aiChatForm');
    if (cf) {
      cf.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = $('#aiChatInput').value.trim();
        if (!v) return;
        $('#aiChatInput').value = '';
        ask(v);
      });
    }

    /* ---------- Esc پنجره را ببندد ---------- */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSwap();
    });

    document.addEventListener('dp:wardrobe', function () { paintCloset(); });
    document.addEventListener('dp:brain', paintBrainBar);
    document.addEventListener('dp:brain-tune', paintBrainBar);
  }

  /* ============================================================
     شروع
     ============================================================ */
  function run() {
    ALL = loadAll();
    paintHeroes('');
    paintBrainBar();
    wire();

    /* شمار کمد روی زبانه */
    var n = $('#aiClosetN');
    var wl = window.DPDigiAI ? DPDigiAI.readWardrobe() : [];
    if (wl.length) { n.hidden = false; n.textContent = FA(wl.length); }

    /* اگر با ?id= آمده، همان کالا را بگذار */
    var qs = new URLSearchParams(location.search);
    var id = qs.get('id');
    if (id) chooseHero(id);

    var t = qs.get('tab');
    if (t && ['make','quiz','closet','lens','chat'].indexOf(t) > -1) tab(t);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
