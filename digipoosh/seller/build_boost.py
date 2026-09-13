# -*- coding: utf-8 -*-
"""سازنده‌ی صفحه‌ی «نردبان و برجسته‌سازی» پنل فروشنده"""
import pathlib, ast, types

D = pathlib.Path(__file__).parent

# فقط بخش تعریف‌ها از build_promo برداشته می‌شود (نه اجرای ساخت صفحه‌ها)
_src = (D / 'build_promo.py').read_text(encoding='utf-8')
_cut = _src.index('# ============================================================\n# صفحه‌ی سیاست فروش')
BP = types.ModuleType('bp')
BP.__dict__['__file__'] = str(D / 'build_promo.py')
exec(compile(_src[:_cut], 'build_promo_defs', 'exec'), BP.__dict__)

ic = BP.ic

# آیکون‌های تازه‌ی این صفحه
BP.ICO.update({
    'rocket':  '<path d="M13.5 3.5c3 0 6 3 6 6 0 4.5-5 8-5 8l-4-4s3.5-5 8-5"/><path d="M9.5 14.5 6 18l-1.5-1.5L8 13"/><path d="M5 19l-1.5 1.5"/>',
    'ladder':  '<path d="M7 3v18M17 3v18"/><path d="M7 7.5h10M7 12h10M7 16.5h10"/>',
    'crown':   '<path d="m4 17 1.5-9 4 4L12 5l2.5 7 4-4L20 17z"/><path d="M4.5 20h15"/>',
    'trend':   '<path d="m4 16 5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/>',
    'target':  '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    'chart':   '<path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/>',
    'queue':   '<path d="M4 7h16M4 12h16M4 17h9"/>',
    'renew':   '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.6h-4.6"/>',
    'gift':    '<rect x="3.5" y="8.5" width="17" height="12" rx="1.6"/><path d="M3.5 12.5h17M12 8.5v12"/><path d="M12 8.5S10.5 4 8 4a2 2 0 0 0 0 4.5zM12 8.5S13.5 4 16 4a2 2 0 0 1 0 4.5z"/>',
})


# ============================================================
# صفحه‌ی نردبان — فروشنده
# ============================================================
boost_body = f'''    <div class="notice-soft" id="trialNote" hidden>
      {ic('gift', 'ico ico-sm')}
      <span><b>دوره‌ی آزمایشی رایگان</b> — همه‌ی بسته‌ها در این دوره
      <b>بدون هزینه</b> هستند و بی‌درنگ فعال می‌شوند. آزادانه امتحان کنید
      و ببینید کدام بسته برای فروشگاهتان بهتر جواب می‌دهد.</span>
    </div>

    <div class="notice-soft" id="paidNote" hidden>
      {ic('alert', 'ico ico-sm')}
      <span>با <b>نردبان</b> فروشگاه شما به بالای فهرست می‌پرد و بیشتر دیده می‌شود.
      پس از سفارش، مدیر پرداخت را بررسی می‌کند و بسته فعال می‌شود.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ic('rocket')}</span>
          <span class="stat-label">بسته‌ی فعال</span></div>
        <span class="stat-number num" id="bActive">۰</span>
        <span class="stat-foot" id="bActiveSub">—</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ic('eye')}</span>
          <span class="stat-label">بازدید کل</span></div>
        <span class="stat-number num" id="bViews">۰</span>
        <span class="stat-foot" id="bViewsSub">—</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-blue">{ic('target')}</span>
          <span class="stat-label">نرخ کلیک</span></div>
        <span class="stat-number num" id="bCtr">۰٪</span>
        <span class="stat-foot" id="bCtrSub">—</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-silver">{ic('wallet')}</span>
          <span class="stat-label" id="spentLbl">هزینه‌ی پرداختی</span></div>
        <span class="stat-number num" id="bSpent">۰</span>
        <span class="stat-foot" id="bSpentSub">—</span>
      </div>
    </div>

    <!-- ============ کارایی ============ -->
    <div class="card mb-18" id="perfCard" hidden>
      <div class="card-head">
        <h2>کارایی بسته‌ها</h2>
        <span class="sub spacer">بازدید روزانه‌ی ۱۴ روز گذشته</span>
      </div>
      <div id="perfBox"></div>
    </div>

    <!-- ============ وضعیت کنونی ============ -->
    <div class="card mb-18" id="liveCard" hidden>
      <div class="card-head">
        <h2>بسته‌های فعال شما</h2>
        <span class="sub spacer">هم‌اکنون روی فروشگاه شماست</span>
      </div>
      <div id="liveBox"></div>
    </div>

    <!-- ============ انتخاب بسته ============ -->
    <div class="card mb-18">
      <div class="card-head">
        <h2>انتخاب بسته</h2>
        <span class="sub spacer">هرچه بلندمدت‌تر، ارزان‌تر</span>
      </div>

      <div class="plan-grid" id="planGrid"></div>

      <form id="boostForm" novalidate style="margin-top:20px">
        <div class="form-grid">
          <div class="field">
            <label for="bPlan">بسته</label>
            <select class="input" id="bPlan"></select>
          </div>
          <div class="field">
            <label for="bDays">مدت</label>
            <select class="input" id="bDays"></select>
          </div>
          <div class="field">
            <label for="bStart">زمان شروع</label>
            <select class="input" id="bStart">
              <option value="0">همین حالا</option>
              <option value="1">فردا</option>
              <option value="3">۳ روز دیگر</option>
              <option value="7">یک هفته دیگر</option>
              <option value="14">دو هفته دیگر</option>
            </select>
          </div>
          <div class="field field-full">
            <label for="bNote">یادداشت برای مدیر <span class="opt">(اختیاری)</span></label>
            <input class="input" id="bNote" placeholder="مثلاً: شماره پیگیری واریز" />
          </div>
        </div>

        <div class="plan-hint" id="planHint" hidden></div>

        <!-- ماشین‌حساب زنده -->
        <div class="calc-box" id="calcBox">
          <div class="calc-row" id="cGrossRow">
            <span>هزینه‌ی پایه</span><b class="num" id="cGross">۰</b>
          </div>
          <div class="calc-row" id="cOffRow" hidden>
            <span>تخفیف بلندمدت <em class="calc-tag num" id="cOffTag">۰٪</em></span>
            <b class="num minus" id="cOff">۰</b>
          </div>
          <div class="calc-row" id="cPerRow">
            <span>هزینه‌ی هر روز</span><b class="num" id="cPer">۰</b>
          </div>
          <div class="calc-row" id="cListRow" hidden>
            <span>ارزش این بسته</span><b class="num strike" id="cList">۰</b>
          </div>
          <div class="calc-row calc-total">
            <span id="cTotalLbl">مبلغ پرداختی</span><b class="num" id="cTotal">۰</b>
          </div>
        </div>

        <button class="btn btn-primary mt-18" type="submit" id="bBtn">
          {ic('rocket', 'ico ico-sm')} <span id="bBtnTxt">ثبت سفارش نردبان</span>
        </button>
      </form>
    </div>

    <!-- ============ صف نوبت ============ -->
    <div class="card mb-18" id="queueCard" hidden>
      <div class="card-head">
        <h2>صف جایگاه صدرنشین</h2>
        <span class="sub spacer" id="qSub">—</span>
      </div>
      <div id="queueBox"></div>
    </div>

    <!-- ============ تاریخچه ============ -->
    <div class="card">
      <div class="card-head">
        <h2>سفارش‌های من</h2>
        <span class="sub spacer" id="hCount">—</span>
      </div>
      <div id="histBox"></div>
    </div>'''


boost_script = r'''
(function () {
  if (!DPStore.requireLogin()) return;

  var B = window.DPBoost;
  var me = null;

  var $ = function (s) { return document.querySelector(s); };
  var fa = B.fa, money = B.money;
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- کارت‌های معرفی بسته ---------- */
  function paintPlans() {
    var g = $('#planGrid');
    var sel = $('#bPlan');
    g.innerHTML = '';
    sel.innerHTML = '';

    Object.keys(B.PLANS).forEach(function (k) {
      var p = B.PLANS[k];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'plan-card';
      card.dataset.plan = k;
      card.style.setProperty('--pc', p.color);
      var busy = p.exclusive && !B.slotFree(k, me.id);
      if (busy) card.classList.add('is-busy');

      card.innerHTML =
        '<span class="plan-dot"></span>' +
        (p.exclusive ? '<span class="plan-only">فقط یک فروشگاه</span>' : '') +
        '<strong>' + esc(p.fa) + '</strong>' +
        '<p>' + esc(p.desc) + '</p>' +
        (busy
          ? '<span class="plan-busy">در اختیار فروشگاه دیگری — ' +
              fa(B.slotFreeIn(k, me.id)) + ' روز دیگر آزاد می‌شود</span>'
          : (B.FREE_TRIAL
              ? '<span class="plan-price plan-free">رایگان' +
                  '<small class="strike num"> ' + money(p.price) + ' / روز</small></span>'
              : '<span class="plan-price num">از ' + money(p.price) +
                  ' تومان<small> / روز</small></span>'));
      g.appendChild(card);

      var o = document.createElement('option');
      o.value = k;
      o.textContent = p.fa;
      sel.appendChild(o);
    });

    g.addEventListener('click', function (e) {
      var c = e.target.closest('.plan-card');
      if (!c) return;
      sel.value = c.dataset.plan;
      sel.dispatchEvent(new Event('change'));
    });
  }

  function markPlan() {
    var v = $('#bPlan').value;
    document.querySelectorAll('.plan-card').forEach(function (c) {
      c.classList.toggle('on', c.dataset.plan === v);
    });

    /* توضیح ویژه‌ی بسته‌ی صدرنشین */
    var p = B.PLANS[v];
    var hint = $('#planHint');
    if (p && p.spotlight) {
      var free = B.slotFree(v, me.id);
      var left = B.slotFreeIn(v, me.id);
      hint.hidden = false;
      hint.className = 'plan-hint' + (free ? '' : ' is-busy');
      hint.innerHTML = free
        ? '<b>این جایگاه هم‌اکنون آزاد است.</b> فروشگاه شما در ' +
          '«حساب کاربری» همه‌ی مشتری‌ها، بالای صفحه، در یک قاب اختصاصی ' +
          'با شمارش معکوس دیده می‌شود. در سبد خرید و صفحه‌ی اصلی هم نمایان می‌شوید. ' +
          'در هر لحظه تنها یک فروشگاه می‌تواند صدرنشین باشد.'
        : '<b>این جایگاه اکنون در اختیار فروشگاه دیگری است.</b> ' +
          fa(left) + ' روز دیگر آزاد می‌شود. می‌توانید بعداً دوباره سر بزنید.';
    } else {
      hint.hidden = true;
    }
  }

  /* ---------- گزینه‌های مدت ---------- */
  function paintDays() {
    var p = B.PLANS[$('#bPlan').value];
    var sel = $('#bDays');
    sel.innerHTML = '';
    (p ? p.days : [7]).forEach(function (d) {
      var o = document.createElement('option');
      o.value = d;
      o.textContent = fa(d) + ' روز';
      sel.appendChild(o);
    });
  }

  /* ---------- ماشین‌حساب زنده ---------- */
  function calc() {
    try {
      var q = B.quote($('#bPlan').value, $('#bDays').value);

      if (q.free) {
        /* دوره‌ی آزمایشی — فقط ارزش بسته نشان داده می‌شود */
        $('#cGrossRow').hidden = true;
        $('#cPerRow').hidden = true;
        $('#cOffRow').hidden = true;
        $('#cListRow').hidden = false;
        $('#cList').textContent = money(q.listGross) + ' تومان';
        $('#cTotalLbl').textContent = 'مبلغ پرداختی شما';
        $('#cTotal').textContent = 'رایگان';
        $('#cTotal').classList.add('is-free');
        return;
      }

      $('#cGrossRow').hidden = false;
      $('#cPerRow').hidden = false;
      $('#cListRow').hidden = true;
      $('#cTotalLbl').textContent = 'مبلغ پرداختی';
      $('#cTotal').classList.remove('is-free');
      $('#cGross').textContent = money(q.gross);
      $('#cPer').textContent = money(q.perDay);
      $('#cTotal').textContent = money(q.total);
      $('#cOffRow').hidden = !q.offPercent;
      $('#cOffTag').textContent = '٪' + fa(q.offPercent);
      $('#cOff').textContent = '−' + money(q.discount);
    } catch (err) { /* در حال بارگذاری */ }
  }

  /* ---------- بسته‌های فعال ---------- */
  function paintLive() {
    var list = B.activeOf(me.id);
    $('#liveCard').hidden = !list.length;
    if (!list.length) return;

    $('#liveBox').innerHTML = list.map(function (r) {
      var p = B.PLANS[r.plan] || {};
      var left = B.daysLeft(r);
      var pct = Math.max(0, Math.min(100, Math.round(left / r.days * 100)));
      return '' +
        '<div class="boost-live" style="--pc:' + (p.color || '#c9a84c') + '">' +
          '<div class="bl-head">' +
            '<strong>' + esc(p.fa || r.plan) + '</strong>' +
            (r.gift ? '<em class="bl-gift">هدیه‌ی مدیر</em>' : '') +
            '<span class="bl-left num">' + fa(left) + ' روز مانده</span>' +
          '</div>' +
          '<div class="bl-bar"><i style="width:' + pct + '%"></i></div>' +
          '<div class="bl-foot">' +
            '<span>' + (r.paused ? 'موقتاً متوقف شده' : 'در حال نمایش') + '</span>' +
            '<span class="num">' + fa(r.views || 0) + ' بازدید · ' +
              fa(r.clicks || 0) + ' کلیک</span>' +
          '</div>' +
          (left <= 3
            ? '<div class="bl-warn">' +
                'کمتر از ' + fa(left + 1) + ' روز مانده — برای قطع نشدن، تمدید کنید.' +
              '</div>' : '') +
          '<div class="row-actions" style="margin-top:10px">' +
            '<button class="btn btn-ghost btn-sm" data-renew="' + esc(r.id) + '" ' +
              'data-plan="' + esc(r.plan) + '">تمدید</button>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------- صف نوبت ---------- */
  function paintQueue() {
    var pos = B.queuePos(me.id, 'spotlight');
    var free = B.slotFree('spotlight', me.id);
    var mineSpot = B.isSpotlight(me.id);
    var line = B.queueOf('spotlight');

    /* اگر خودش صدرنشین است یا جایگاه آزاد است و در صف نیست، پنهان */
    if (mineSpot || (free && !pos)) { $('#queueCard').hidden = true; return; }
    if (!pos && free) { $('#queueCard').hidden = true; return; }

    $('#queueCard').hidden = false;
    $('#qSub').textContent = fa(line.length) + ' فروشگاه در صف';

    if (pos) {
      var ahead = pos - 1;
      var wait = B.slotFreeIn('spotlight', me.id);
      $('#queueBox').innerHTML =
        '<div class="q-mine">' +
          '<div class="q-pos"><b class="num">' + fa(pos) + '</b><small>نوبت شما</small></div>' +
          '<div class="q-txt">' +
            '<strong>' + (ahead === 0
              ? 'شما نفر بعدی هستید'
              : fa(ahead) + ' فروشگاه پیش از شما') + '</strong>' +
            '<p>جایگاه حدود ' + fa(wait) + ' روز دیگر آزاد می‌شود و بسته‌ی شما ' +
              '<b>خودکار</b> فعال خواهد شد.</p>' +
          '</div>' +
          '<button class="btn btn-ghost btn-sm" data-leave="1">خروج از صف</button>' +
        '</div>';
    } else {
      $('#queueBox').innerHTML =
        '<div class="q-join">' +
          '<p>جایگاه صدرنشین اکنون در اختیار فروشگاه دیگری است — ' +
            '<b>' + fa(B.slotFreeIn('spotlight', me.id)) + ' روز</b> دیگر آزاد می‌شود.</p>' +
          '<p class="q-hint">می‌توانید نوبت بگیرید تا به‌محض آزاد شدن، ' +
            'بسته‌ی شما خودکار فعال شود.</p>' +
          '<div class="q-form">' +
            '<select class="input" id="qDays">' +
              '<option value="1">۱ روز</option>' +
              '<option value="3" selected>۳ روز</option>' +
              '<option value="7">۷ روز</option>' +
            '</select>' +
            '<button class="btn btn-primary btn-sm" data-join="1">گرفتن نوبت</button>' +
          '</div>' +
        '</div>';
    }
  }

  /* ---------- تاریخچه ---------- */
  function paintHist() {
    var list = B.mine(me.id);
    $('#hCount').textContent = list.length ? fa(list.length) + ' سفارش' : '—';

    if (!list.length) {
      $('#histBox').innerHTML =
        '<div class="empty-inline">هنوز سفارشی ثبت نکرده‌اید.</div>';
      return;
    }

    var CLS = { awaiting: 'b-warn', active: 'b-ok', expired: 'b-mute',
                rejected: 'b-bad', paused: 'b-warn', scheduled: 'b-info' };

    $('#histBox').innerHTML =
      '<div class="table-wrap"><table class="table"><thead><tr>' +
        '<th>بسته</th><th>مدت</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th></th>' +
      '</tr></thead><tbody>' +
      list.map(function (r) {
        var p = B.PLANS[r.plan] || {};
        var st = B.live(r) ? 'active' : r.status;
        var label = r.paused && st === 'active' ? 'موقتاً متوقف' : (B.STATUS_FA[st] || st);
        return '<tr>' +
          '<td><b>' + esc(p.fa || r.plan) + '</b>' +
            (r.gift ? ' <em class="bl-gift">هدیه</em>' : '') + '</td>' +
          '<td class="num">' + fa(r.days) + ' روز' +
            (r.renewals ? '<div class="tiny-note">' + fa(r.renewals) + ' بار تمدید</div>' : '') +
            (r.status === 'scheduled' && r.startDate
              ? '<div class="tiny-note">از ' + esc(r.startDate) + '</div>' : '') + '</td>' +
          '<td class="num">' + (r.price ? money(r.price) + ' تومان'
            : (r.trial ? '<span class="free-tag">آزمایشی رایگان</span>' : 'رایگان')) + '</td>' +
          '<td><span class="badge ' + (CLS[st] || 'b-mute') + '">' + label + '</span>' +
            (r.reason ? '<div class="tiny-note">' + esc(r.reason) + '</div>' : '') + '</td>' +
          '<td class="num">' + esc(r.date) +
            ((r.views || r.clicks)
              ? '<div class="tiny-note num">' + fa(r.views || 0) + ' بازدید · ' +
                fa(r.clicks || 0) + ' کلیک</div>' : '') + '</td>' +
          '<td>' + (r.status === 'awaiting'
            ? '<button class="btn btn-ghost btn-sm" data-cancel="' + esc(r.id) + '">لغو</button>'
            : '') + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- آمار بالا ---------- */
  function paintStats() {
    var list = B.mine(me.id);
    var v = 0, spent = 0;
    list.forEach(function (r) {
      v += r.views || 0;
      if (!r.gift && (r.status === 'active' || r.status === 'expired')) spent += r.price || 0;
    });
    var sum = B.summaryOf(me.id);
    var act = B.activeOf(me.id);

    $('#bActive').textContent = fa(act.length);
    $('#bActiveSub').textContent = act.length
      ? fa(Math.max.apply(null, act.map(B.daysLeft))) + ' روز مانده'
      : (list.filter(function (r) { return r.status === 'scheduled'; }).length
          ? 'زمان‌بندی‌شده دارید' : 'بسته‌ای فعال نیست');

    $('#bViews').textContent = fa(sum.views);
    var live1 = act[0] ? B.insight(act[0]) : null;
    $('#bViewsSub').textContent = live1 && live1.perDay
      ? 'روزی ' + fa(live1.perDay) + ' بازدید' : '—';

    $('#bCtr').textContent = '٪' + fa(sum.ctr);
    $('#bCtrSub').textContent = sum.clicks
      ? fa(sum.clicks) + ' کلیک از ' + fa(sum.views) + ' بازدید' : 'هنوز کلیکی نبوده';

    if (B.FREE_TRIAL) {
      $('#spentLbl').textContent = 'صرفه‌جویی شما';
      $('#bSpent').textContent = money(sum.saved);
      $('#bSpentSub').textContent = 'در دوره‌ی آزمایشی';
    } else {
      $('#bSpent').textContent = money(sum.spent);
      $('#bSpentSub').textContent = sum.costPerClick
        ? money(sum.costPerClick) + ' تومان هر کلیک' : '—';
    }
  }

  /* ---------- نمودار کارایی ---------- */
  function paintPerf() {
    var act = B.activeOf(me.id);
    var done = B.mine(me.id).filter(function (r) {
      return r.status === 'expired' && (r.views || 0) > 0;
    });
    var show = act.concat(done).slice(0, 3);

    $('#perfCard').hidden = !show.length;
    if (!show.length) return;

    $('#perfBox').innerHTML = show.map(function (r) {
      var p = B.PLANS[r.plan] || {};
      var ins = B.insight(r);

      /* ۱۴ روز آخر */
      var series = ins.series.slice(-14);
      var max = 1;
      series.forEach(function (d) { if (d.v > max) max = d.v; });

      var bars = series.length
        ? series.map(function (d) {
            var h = Math.max(4, Math.round(d.v / max * 100));
            return '<span class="pf-bar" style="--h:' + h + '%" ' +
                   'title="' + esc(d.day) + ' — ' + fa(d.v) + ' بازدید"></span>';
          }).join('')
        : '<span class="pf-none">هنوز داده‌ای نیست</span>';

      var arrow = ins.trend > 5 ? '↑' : ins.trend < -5 ? '↓' : '→';
      var tcls  = ins.trend > 5 ? 'up' : ins.trend < -5 ? 'down' : 'flat';

      return '' +
        '<div class="pf-row" style="--pc:' + (p.color || '#c9a84c') + '">' +
          '<div class="pf-head">' +
            '<strong>' + esc(p.fa || r.plan) + '</strong>' +
            (B.live(r) ? '<em class="pf-live">در حال نمایش</em>'
                       : '<em class="pf-done">پایان‌یافته</em>') +
            '<span class="pf-trend ' + tcls + '">' + arrow + ' ٪' +
              fa(Math.abs(ins.trend)) + '</span>' +
          '</div>' +
          '<div class="pf-chart">' + bars + '</div>' +
          '<div class="pf-nums">' +
            '<span><b class="num">' + fa(ins.views) + '</b> بازدید</span>' +
            '<span><b class="num">' + fa(ins.clicks) + '</b> کلیک</span>' +
            '<span><b class="num">٪' + fa(ins.ctr) + '</b> نرخ کلیک</span>' +
            '<span><b class="num">' + fa(ins.perDay) + '</b> روزانه</span>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function paintAll() { paintStats(); paintPerf(); paintLive(); paintQueue(); paintHist(); }

  /* ---------- رویدادها ---------- */
  $('#bPlan').addEventListener('change', function () { markPlan(); paintDays(); calc(); });
  $('#bDays').addEventListener('change', calc);

  $('#boostForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var delay = Number($('#bStart').value) || 0;
    try {
      if (delay > 0) {
        var at = Date.now() + delay * 86400000;
        var r = B.schedule(me.id, $('#bPlan').value, $('#bDays').value, at, $('#bNote').value);
        dpToast('بسته برای ' + r.startDate + ' زمان‌بندی شد.', 'success');
      } else {
        B.order(me.id, $('#bPlan').value, $('#bDays').value, $('#bNote').value);
        dpToast(B.FREE_TRIAL
          ? 'بسته فعال شد. از همین حالا فروشگاه شما بالاتر دیده می‌شود.'
          : 'سفارش ثبت شد. پس از تأیید مدیر فعال می‌شود.', 'success');
      }
      $('#bNote').value = '';
      paintAll();
    } catch (err) { dpToast(err.message, 'error'); }
  });

  document.addEventListener('click', function (e) {
    /* لغو سفارش */
    var b = e.target.closest('[data-cancel]');
    if (b) {
      if (!confirm('این سفارش لغو شود؟')) return;
      try {
        B.cancel(b.dataset.cancel, me.id);
        dpToast('سفارش لغو شد.', 'success');
        paintAll();
      } catch (err) { dpToast(err.message, 'error'); }
      return;
    }

    /* تمدید */
    var rn = e.target.closest('[data-renew]');
    if (rn) {
      var plan = B.PLANS[rn.dataset.plan] || { days: [7] };
      var opts = plan.days.join(' یا ');
      var ans = prompt('چند روز تمدید شود؟ (' + opts + ')', String(plan.days[0]));
      if (ans === null) return;
      var d = Number(String(ans).replace(/[۰-۹]/g, function (x) {
        return '۰۱۲۳۴۵۶۷۸۹'.indexOf(x);
      }));
      try {
        B.renew(rn.dataset.renew, me.id, d);
        dpToast('بسته ' + fa(d) + ' روز تمدید شد.', 'success');
        paintAll();
      } catch (err) { dpToast(err.message, 'error'); }
      return;
    }

    /* گرفتن نوبت */
    if (e.target.closest('[data-join]')) {
      try {
        var pos = B.enqueue(me.id, 'spotlight', $('#qDays').value);
        dpToast('نوبت شما ثبت شد — جایگاه ' + fa(pos) + ' در صف.', 'success');
        paintAll();
      } catch (err) { dpToast(err.message, 'error'); }
      return;
    }

    /* خروج از صف */
    if (e.target.closest('[data-leave]')) {
      if (!confirm('از صف خارج می‌شوید؟')) return;
      B.dequeue(me.id, 'spotlight');
      dpToast('از صف خارج شدید.', 'success');
      paintAll();
    }
  });

  document.addEventListener('dp:boost', paintAll);

  /* ---------- آغاز ---------- */
  (async function () {
    me = await DPStore.auth.me();
    if (!me) return;
    $('#trialNote').hidden = !B.FREE_TRIAL;
    $('#paidNote').hidden = !!B.FREE_TRIAL;
    $('#bBtnTxt').textContent = B.FREE_TRIAL
      ? 'فعال‌سازی رایگان بسته' : 'ثبت سفارش نردبان';

    paintPlans();
    markPlan();
    paintDays();
    document.addEventListener('dp:boost', function () { paintPlans(); markPlan(); });
    calc();
    paintAll();
  })();
})();
'''


if __name__ == '__main__':
    BP.NAV.insert(6, ('seller-boost.html', 'rocket', 'نردبان و برجسته‌سازی', 'b5'))

    extra = ('\n  <link rel="stylesheet" href="../assets/css/dp-boost.css" />')

    # صفحه ساخته می‌شود
    old_page = BP.page

    def page_with_boost(fname, title, sub, body, script, extra_css=''):
        old_page(fname, title, sub, body, script, extra_css)
        # افزودن dp-boost.js پس از dp-promo.js
        f = D / fname
        s = f.read_text(encoding='utf-8')
        if 'dp-boost.js' not in s:
            s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
                          '<script src="../assets/js/dp-promo.js"></script>\n'
                          '<script src="../assets/js/dp-boost.js"></script>\n'
                          '<script src="../assets/js/dp-moderation.js"></script>', 1)
            f.write_text(s, encoding='utf-8')

    page_with_boost('seller-boost.html', 'نردبان و برجسته‌سازی',
                    'فروشگاهتان را بالاتر بیاورید و بیشتر دیده شوید',
                    boost_body, boost_script, extra)

    # سایدبار بقیه‌ی صفحه‌ها هم به‌روز شود
    import re
    new_link = ('\n      <a class="sb-link" href="seller-boost.html">' + ic('rocket') +
                '<span>نردبان و برجسته‌سازی</span><span class="sb-badge" hidden></span></a>')

    for f in sorted(D.glob('seller-*.html')):
        s = f.read_text(encoding='utf-8')
        if 'seller-boost.html' in s:
            continue
        anchor = '<a class="sb-link" href="seller-earnings.html">'
        i = s.find(anchor)
        if i < 0:
            print('  — سایدبار یافت نشد:', f.name)
            continue
        s = s[:i] + new_link.strip() + '\n      ' + s[i:]
        # فایل‌های جانبی
        if 'dp-boost.js' not in s:
            s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
                          '<script src="../assets/js/dp-promo.js"></script>\n'
                          '<script src="../assets/js/dp-boost.js"></script>\n'
                          '<script src="../assets/js/dp-moderation.js"></script>', 1)
        if 'css/dp-boost.css" />' not in s:
            s = s.replace('<link rel="stylesheet" href="../assets/css/dp-colors.css" />',
                          '<link rel="stylesheet" href="../assets/css/dp-colors.css" />\n'
                          '  <link rel="stylesheet" href="../assets/css/dp-boost.css" />', 1)
        f.write_text(s, encoding='utf-8')
        print('  ↻ سایدبار:', f.name)

    print('پایان')
