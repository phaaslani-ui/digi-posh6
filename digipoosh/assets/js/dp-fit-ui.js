/* ============================================================
   dp-fit-ui.js — ابزارک «سایز من را پیدا کن»
   ------------------------------------------------------------
   یک پنجره که هر جای سایت می‌شود بازش کرد:

     DPFitUI.open({ product: p, onPick: function (size) {…} })

   سه گام دارد:
     ۱. اندازه‌های بدن  (با راهنمای تصویری)
     ۲. سلیقه‌ی تناسب   (چسبان تا گشاد)
     ۳. نتیجه           (سایز + درصد + نمودار مقایسه)

   اگر مشتری قبلاً اندازه داده باشد، مستقیم به گام سه می‌رود.
   ============================================================ */
(function () {
  'use strict';

  var FAD = '۰۱۲۳۴۵۶۷۸۹';
  function FA(n) { return String(n).replace(/\d/g, function (d) { return FAD[+d]; }); }
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
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    ruler: '<path d="M4 9h16v6H4z"/><path d="M8 9v3M12 9v4M16 9v3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    back:  '<path d="M9 5.5 15.5 12 9 18.5"/>',
    fwd:   '<path d="M15 5.5 8.5 12 15 18.5"/>',
    info:  '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };

  /* وضعیت پنجره */
  var STATE = null;

  /* ============================================================
     پیکره‌ی راهنما — SVG درون‌خطی
     ------------------------------------------------------------
     نقطه‌ها با کلاس مشخص می‌شوند تا هنگام تمرکز روی هر
     ورودی، همان نقطه روشن شود.
     ============================================================ */
  function bodyDiagram() {
    return '<svg class="fitd" viewBox="0 0 160 260" aria-hidden="true">'
      /* بدن */
      + '<g class="fitd-body" fill="none" stroke="currentColor" stroke-width="1.6"'
      +   ' stroke-linecap="round" stroke-linejoin="round">'
      +   '<circle cx="80" cy="28" r="17"/>'
      +   '<path d="M80 45v14"/>'
      +   '<path d="M46 74c0-8 15-15 34-15s34 7 34 15"/>'
      +   '<path d="M46 74v40l-8 46"/>'
      +   '<path d="M114 74v40l8 46"/>'
      +   '<path d="M52 100h56"/>'
      +   '<path d="M55 130h50"/>'
      +   '<path d="M52 158h56"/>'
      +   '<path d="M60 158l-4 92M100 158l4 92"/>'
      + '</g>'

      /* خط‌های اندازه‌گیری */
      + '<g class="fitd-marks" stroke-width="2.4" fill="none" stroke-linecap="round">'
      +   '<line class="m-shoulder" x1="46" y1="74" x2="114" y2="74"/>'
      +   '<line class="m-chest"    x1="50" y1="100" x2="110" y2="100"/>'
      +   '<line class="m-waist"    x1="54" y1="130" x2="106" y2="130"/>'
      +   '<line class="m-hip"      x1="50" y1="158" x2="110" y2="158"/>'
      +   '<line class="m-arm"      x1="118" y1="78" x2="126" y2="158"/>'
      +   '<line class="m-height"   x1="14" y1="12" x2="14" y2="250"/>'
      +   '<line class="m-inseam"   x1="80" y1="160" x2="80" y2="250"/>'
      +   '<line class="m-neck"     x1="68" y1="52" x2="92" y2="52"/>'
      +   '<line class="m-thigh"    x1="58" y1="186" x2="78" y2="186"/>'
      + '</g></svg>';
  }

  /* ============================================================
     ساخت پنجره
     ============================================================ */
  function open(opt) {
    opt = opt || {};
    close();

    if (!window.DPFit) return;

    var prof = DPFit.activeProfile();
    var hasBody = prof && prof.body && Object.keys(prof.body).length >= 3;

    STATE = {
      product: opt.product || null,
      onPick: typeof opt.onPick === 'function' ? opt.onPick : null,
      step: hasBody ? 3 : 1,
      body: prof ? Object.assign({}, prof.body) : {},
      fit: prof ? prof.fit : 'tailored',
      name: prof ? prof.name : '',
      editId: prof ? prof.id : null,
    };

    var box = document.createElement('div');
    box.className = 'fit-modal';
    box.id = 'fitModal';
    box.innerHTML =
      '<div class="fit-veil" data-fclose></div>'
      + '<div class="fit-in" role="dialog" aria-modal="true" aria-label="یافتن سایز">'
      +   '<header class="fit-head">'
      +     '<h3>' + svg(I.ruler, 'ico') + ' سایز من را پیدا کن</h3>'
      +     '<button type="button" data-fclose aria-label="بستن">'
      +       svg(I.close, 'ico') + '</button>'
      +   '</header>'
      +   '<div class="fit-body" id="fitBody"></div>'
      + '</div>';

    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-on'); });

    wire(box);
    render();
  }

  function close() {
    var m = document.getElementById('fitModal');
    if (!m) return;
    m.classList.remove('is-on');
    setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 240);
    STATE = null;
  }

  /* ============================================================
     رسم گام جاری
     ============================================================ */
  function render() {
    var host = document.getElementById('fitBody');
    if (!host || !STATE) return;

    if (STATE.step === 1) host.innerHTML = stepMeasure();
    else if (STATE.step === 2) host.innerHTML = stepFit();
    else host.innerHTML = stepResult();
  }

  /* ---------- گام یک: اندازه‌ها ---------- */
  function stepMeasure() {
    var F = DPFit.FIELDS;

    /* کدام اندازه‌ها برای این کالا لازم‌اند؟ */
    var group = STATE.product ? DPFit.groupOf(STATE.product) : 'any';
    var W = DPFit.WEIGHTS[group] || DPFit.WEIGHTS.any;
    var needed = Object.keys(W);

    var main = F.filter(function (f) { return needed.indexOf(f.key) > -1; });
    var rest = F.filter(function (f) { return needed.indexOf(f.key) < 0; });

    function row(f, important) {
      var v = STATE.body[f.key];
      return '<label class="fit-row' + (important ? ' is-key' : '') + '"'
        + ' data-mark="' + f.key + '">'
        + '<span class="fit-lbl">' + esc(f.name)
        +   (important ? '<i class="fit-star" title="برای این کالا مهم است"></i>' : '')
        + '</span>'
        + '<span class="fit-inwrap">'
        +   '<input type="number" inputmode="decimal" step="0.5"'
        +     ' min="' + f.min + '" max="' + f.max + '"'
        +     ' data-body="' + f.key + '"'
        +     ' value="' + (v != null ? v : '') + '"'
        +     ' placeholder="—" aria-label="' + esc(f.name) + ' بر حسب سانتی‌متر" />'
        +   '<em>سانت</em>'
        + '</span>'
        + '<small class="fit-hint">' + esc(f.hint) + '</small>'
        + '</label>';
    }

    return '<div class="fit-step">'
      + '<div class="fit-steps"><i class="on"></i><i></i><i></i></div>'
      + '<p class="fit-intro">'
      +   'با یک متر نواری اندازه بگیرید. لازم نیست همه را پر کنید — '
      +   'هرچه بیشتر، دقیق‌تر.'
      + '</p>'

      + '<div class="fit-grid">'
      +   '<div class="fit-diagram">' + bodyDiagram()
      +     '<span class="fit-dtip" id="fitTip">روی هر خانه بروید</span></div>'
      +   '<div class="fit-fields">'
      +     '<span class="fit-sec">برای این کالا مهم است</span>'
      +     main.map(function (f) { return row(f, true); }).join('')
      +     (rest.length
              ? '<details class="fit-more"><summary>اندازه‌های دیگر</summary>'
                + rest.map(function (f) { return row(f, false); }).join('')
                + '</details>'
              : '')
      +   '</div>'
      + '</div>'

      + '<div class="fit-msg" id="fitMsg" hidden></div>'

      + '<div class="fit-nav">'
      +   '<span></span>'
      +   '<button class="fit-btn gold" type="button" data-next>'
      +     'ادامه' + svg(I.fwd, 'ico ico-s') + '</button>'
      + '</div></div>';
  }

  /* ---------- گام دو: سلیقه ---------- */
  function stepFit() {
    var P = DPFit.FIT_PREF;
    return '<div class="fit-step">'
      + '<div class="fit-steps"><i class="done"></i><i class="on"></i><i></i></div>'
      + '<p class="fit-intro">لباس را چطور دوست دارید بپوشید؟</p>'
      + '<div class="fit-prefs">'
      + Object.keys(P).map(function (k) {
          var f = P[k];
          return '<button class="fit-pref' + (STATE.fit === k ? ' is-on' : '') + '"'
            + ' type="button" data-fit="' + k + '">'
            + '<b>' + esc(f.name) + '</b>'
            + '<small>' + esc(f.hint) + '</small>'
            + '</button>';
        }).join('')
      + '</div>'
      + '<label class="fit-name">'
      +   '<span>نام این پروفایل</span>'
      +   '<input type="text" id="fitName" maxlength="30"'
      +     ' value="' + esc(STATE.name || 'اندازه‌های من') + '" />'
      + '</label>'
      + '<div class="fit-nav">'
      +   '<button class="fit-btn ghost" type="button" data-back>'
      +     svg(I.back, 'ico ico-s') + 'قبلی</button>'
      +   '<button class="fit-btn gold" type="button" data-save>'
      +     'ذخیره و محاسبه' + svg(I.fwd, 'ico ico-s') + '</button>'
      + '</div></div>';
  }

  /* ---------- گام سه: نتیجه ---------- */
  function stepResult() {
    var p = STATE.product;

    /* بدون کالا فقط پروفایل را نشان بده */
    if (!p) return profileOnly();

    var rows = DPFit.sizeTable(p.id);
    if (!rows.length) return noTable(p);

    var res = DPFit.bestSizeFor(p, STATE.body, STATE.fit);
    if (!res) return noTable(p);

    var b = res.best;
    var v = b.verdict;

    return '<div class="fit-step">'
      + '<div class="fit-steps"><i class="done"></i><i class="done"></i><i class="on"></i></div>'

      /* ---------- نتیجه‌ی اصلی ---------- */
      + '<div class="fit-result is-' + v.key + '">'
      +   '<div class="fit-big">'
      +     '<b>' + esc(b.label) + '</b>'
      +     '<span class="fit-dots">'
      +       [0,1,2].map(function (i) {
              return '<i' + (i < v.dots ? ' class="on"' : '') + '></i>';
            }).join('')
      +     '</span>'
      +   '</div>'
      +   '<div class="fit-verdict">'
      +     '<strong>' + esc(v.name) + '</strong>'
      +     '<span class="fit-pct">' + FA(b.percent) + '٪ تناسب</span>'
      +     '<p>' + esc(res.message) + '</p>'
      +   '</div>'
      + '</div>'

      + (res.confident ? ''
          : '<div class="fit-warn">' + svg(I.info, 'ico ico-s')
            + 'چند اندازه کم است — نتیجه تقریبی است.</div>')

      /* ---------- نمودار مقایسه ---------- */
      + '<div class="fit-compare">'
      +   '<span class="fit-sec">بدن شما در برابر این سایز</span>'
      +   Object.keys(b.detail).map(function (k) {
            var d = b.detail[k];
            var max = Math.max(d.body, d.garment) * 1.12;
            return '<div class="fit-cmp is-' + d.verdict + '">'
              + '<span class="fit-cmp-name">' + esc(d.name) + '</span>'
              + '<span class="fit-cmp-bars">'
              +   '<i class="b1" style="width:' + (d.body / max * 100) + '%">'
              +     '<em>' + FA(d.body) + '</em></i>'
              +   '<i class="b2" style="width:' + (d.garment / max * 100) + '%">'
              +     '<em>' + FA(d.garment) + '</em></i>'
              + '</span>'
              + '<span class="fit-cmp-tag">'
              +   (d.verdict === 'ok' ? 'خوب'
                  : d.verdict === 'tight' ? FA(Math.abs(d.diff)) + ' تنگ'
                  : FA(Math.abs(d.diff)) + ' گشاد')
              + '</span></div>';
          }).join('')
      +   '<div class="fit-legend">'
      +     '<span><i class="b1"></i>بدن شما</span>'
      +     '<span><i class="b2"></i>اندازه‌ی لباس</span>'
      +   '</div>'
      + '</div>'

      /* ---------- جایگزین‌ها ---------- */
      + (res.alternatives.length
          ? '<div class="fit-alts">'
            + '<span class="fit-sec">سایزهای دیگر</span>'
            + res.alternatives.map(function (a) {
                return '<button class="fit-alt" type="button" data-pick="'
                  + esc(a.label) + '">'
                  + '<b>' + esc(a.label) + '</b>'
                  + '<span>' + FA(a.percent) + '٪ — ' + esc(a.verdict.name) + '</span>'
                  + '</button>';
              }).join('')
            + '</div>'
          : '')

      /* ---------- ضمانت ---------- */
      + '<div class="fit-guarantee">' + svg(I.check, 'ico ico-s')
      +   '<span>اگر سایز پیشنهادی نخورد، تعویض رایگان است.</span></div>'

      + '<div class="fit-nav">'
      +   '<button class="fit-btn ghost" type="button" data-edit>ویرایش اندازه‌ها</button>'
      +   '<button class="fit-btn gold" type="button" data-pick="' + esc(b.label) + '">'
      +     'انتخاب سایز ' + esc(b.label) + '</button>'
      + '</div></div>';
  }

  function profileOnly() {
    var n = Object.keys(STATE.body).length;
    return '<div class="fit-step">'
      + '<div class="fit-done">' + svg(I.check, 'fit-bigico')
      +   '<strong>اندازه‌های شما ذخیره شد</strong>'
      +   '<span>' + FA(n) + ' اندازه ثبت شد. از این پس در صفحه‌ی هر کالا '
      +     'سایز مناسبتان را نشان می‌دهیم.</span>'
      + '</div>'
      + '<div class="fit-nav">'
      +   '<button class="fit-btn ghost" type="button" data-edit>ویرایش</button>'
      +   '<button class="fit-btn gold" type="button" data-fclose>بستن</button>'
      + '</div></div>';
  }

  function noTable(p) {
    return '<div class="fit-step">'
      + '<div class="fit-done">' + svg(I.info, 'fit-bigico')
      +   '<strong>این کالا جدول اندازه ندارد</strong>'
      +   '<span>فروشنده هنوز اندازه‌های دقیق این کالا را وارد نکرده. '
      +     'می‌توانید از راهنمای سایز عمومی استفاده کنید.</span>'
      + '</div>'
      + '<div class="fit-nav">'
      +   '<button class="fit-btn ghost" type="button" data-edit>ویرایش اندازه‌ها</button>'
      +   '<button class="fit-btn gold" type="button" data-fclose>بستن</button>'
      + '</div></div>';
  }

  /* ============================================================
     رفتار
     ============================================================ */
  function wire(box) {
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-fclose]')) { close(); return; }

      if (e.target.closest('[data-next]')) { collect(); return; }
      if (e.target.closest('[data-back]')) { STATE.step = 1; render(); return; }
      if (e.target.closest('[data-edit]')) { STATE.step = 1; render(); return; }

      var f = e.target.closest('[data-fit]');
      if (f) {
        STATE.fit = f.dataset.fit;
        render();
        return;
      }

      if (e.target.closest('[data-save]')) { saveAndGo(); return; }

      var pk = e.target.closest('[data-pick]');
      if (pk) {
        var label = pk.dataset.pick;
        if (STATE.onPick) { try { STATE.onPick(label); } catch (err) { /* بی‌اهمیت */ } }
        if (STATE.product && window.DPFit) {
          DPFit.feedback(STATE.product.id, label, label, null);
        }
        close();
        return;
      }
    });

    /* راهنمای تصویری — روشن شدن خط مربوطه */
    box.addEventListener('focusin', highlight);
    box.addEventListener('mouseover', highlight);

    function highlight(e) {
      var row = e.target.closest('[data-mark]');
      if (!row) return;
      var key = row.dataset.mark;
      var d = box.querySelector('.fitd');
      if (!d) return;
      d.querySelectorAll('.fitd-marks line').forEach(function (l) {
        l.classList.toggle('on', l.classList.contains('m-' + key));
      });
      var tip = box.querySelector('#fitTip');
      var fld = DPFit.BY_KEY[key];
      if (tip && fld) tip.textContent = fld.hint;
    }

    document.addEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
  }

  /* ---------- جمع‌آوری ورودی‌ها ---------- */
  function collect() {
    var box = document.getElementById('fitModal');
    if (!box) return;

    var raw = {};
    box.querySelectorAll('[data-body]').forEach(function (i) {
      if (i.value !== '') raw[i.dataset.body] = i.value;
    });

    var v = DPFit.validateBody(raw);
    var msg = box.querySelector('#fitMsg');

    if (!v.ok) {
      msg.hidden = false;
      msg.className = 'fit-msg is-bad';
      msg.innerHTML = v.errors.length
        ? v.errors.map(esc).join('<br>')
        : 'دست‌کم چند اندازه وارد کنید.';
      return;
    }

    if (v.warnings.length) {
      msg.hidden = false;
      msg.className = 'fit-msg is-warn';
      msg.innerHTML = v.warnings.map(esc).join('<br>');
    }

    STATE.body = v.body;
    STATE.step = 2;
    render();
  }

  function saveAndGo() {
    var box = document.getElementById('fitModal');
    var nm = box.querySelector('#fitName');
    STATE.name = nm ? nm.value : 'اندازه‌های من';

    DPFit.saveProfile(STATE.name, STATE.body, STATE.fit, STATE.editId);
    STATE.step = 3;
    render();
  }

  /* ============================================================
     دکمه‌ی خودکار در صفحه‌ی کالا
     ------------------------------------------------------------
     هر جا `[data-fit-btn]` باشد، به این پنجره وصل می‌شود.
     ============================================================ */
  function autoWire() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fit-btn]');
      if (!b) return;
      e.preventDefault();

      var id = b.dataset.fitBtn;
      var prod = null;

      if (id && window.DPSafe) {
        try {
          prod = DPSafe.products().filter(function (p) {
            return String(p.id) === String(id);
          })[0] || null;
        } catch (err) { prod = null; }
      }

      open({
        product: prod,
        onPick: function (label) {
          /* اگر صفحه‌ی کالا دکمه‌ی سایز دارد، همان را بزن */
          var sz = document.querySelector('[data-size="' + label + '"]');
          if (sz) sz.click();
          document.dispatchEvent(new CustomEvent('dp:size-picked',
            { detail: { size: label, productId: id } }));
        },
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoWire);
  } else {
    autoWire();
  }

  window.DPFitUI = { open: open, close: close, diagram: bodyDiagram };
})();
