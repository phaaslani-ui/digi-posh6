#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محتوای هشت صفحه‌ی پنل عمده‌فروشی.
هر صفحه یک تابع دارد که بدنه و اسکریپتش را برمی‌گرداند.
"""

SW = ('fill="none" stroke="currentColor" stroke-width="1.6" '
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"')


def ico(d, cls=''):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW}>{d}</svg>'


I = {
    'box':    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    'money':  '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
    'quote':  '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    'truck':  '<path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    'users':  '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c0-3.3 2.5-5.4 5.5-5.4s5.5 2.1 5.5 5.4"/><path d="M16 6.5a3 3 0 0 1 0 6"/>',
    'chart':  '<path d="M4 19.5V15M9 19.5V9M14 19.5v-7M19 19.5V5"/>',
    'warn':   '<path d="M12 4.5 21 19H3z"/><path d="M12 10v4M12 16.5h.01"/>',
    'plus':   '<path d="M12 5v14M5 12h14"/>',
    'check':  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'x':      '<path d="M18 6 6 18M6 6l12 12"/>',
    'edit':   '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m14 6 4 4"/>',
    'trash':  '<path d="M4.5 7h15"/><path d="M9 7V5h6v2"/><path d="M6.5 7 7.5 20h9L17.5 7"/>',
    'info':   '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'store':  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    'clock':  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
    'bolt':   '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/>',
    'save':   '<path d="M5.5 4.5h10l3.5 3.5v11a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M8 4.5v5h7M8 20v-6h8v6"/>',
}

CLOSE_X = ('<button class="wp-x" type="button" data-wp-close aria-label="بستن">'
           + ico(I['x']) + '</button>')


# ════════════════════════════════════════════════════════════
#  ۱. میزکار
# ════════════════════════════════════════════════════════════
def dashboard():
    body = '''    <div id="alerts"></div>

    <div class="wp-kpis" id="kpis"></div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>درآمد ۱۲ ماه گذشته</h2>
        <span class="sub spacer" id="chartSum">—</span>
      </div>
      <div class="wp-chart" id="chart"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>استعلام‌های تازه</h2>
        <a class="wp-btn wp-btn-ghost wp-btn-sm spacer" href="wholesale-rfq.html">همه‌ی استعلام‌ها</a>
      </div>
      <div id="rfqBox"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>سفارش‌های اخیر</h2>
        <a class="wp-btn wp-btn-ghost wp-btn-sm spacer" href="wholesale-orders.html">همه‌ی سفارش‌ها</a>
      </div>
      <div id="ordBox"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>پرفروش‌ترین کالاها</h2>
        <span class="sub spacer">بر پایه‌ی سفارش‌های تحویل‌شده</span>
      </div>
      <div id="topBox"></div>
    </div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money;
  var $ = function (s) { return document.querySelector(s); };

  var IC = ''' + _js_icons() + ''';

  function paintKpis() {
    var s = S.stats();
    var rows = [
      { c: '#c9a84c', i: IC.money, t: 'درآمد کل',
        v: money(s.revenue), s: fa(s.orders) + ' سفارش' },
      { c: '#4caf50', i: IC.check, t: 'دریافت‌شده',
        v: money(s.paid), s: s.unpaid ? money(s.unpaid) + ' مانده' : 'تسویه کامل' },
      { c: '#7a96c8', i: IC.quote, t: 'استعلام باز',
        v: fa(s.rfqOpen), s: 'نرخ پاسخ ٪' + fa(s.rfqRate) },
      { c: '#c0c0c0', i: IC.truck, t: 'در انتظار تأیید',
        v: fa(s.pendingOrders), s: fa(s.deliveredOrders) + ' تحویل‌شده' },
      { c: '#d4b85a', i: IC.box, t: 'کالاهای فعال',
        v: fa(s.active), s: 'ارزش انبار ' + money(s.stockValue) },
      { c: '#e8b552', i: IC.warn, t: 'نیازمند توجه',
        v: fa(s.lowStock + s.outOfStock), s: fa(s.lowStock) + ' کم · ' + fa(s.outOfStock) + ' تمام' },
    ];
    $('#kpis').innerHTML = rows.map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');
  }

  function paintAlerts() {
    var s = S.stats();
    var out = [];
    if (s.rfqOpen) {
      out.push('<div class="wp-note warn">' + IC.quote +
        '<div><b>' + fa(s.rfqOpen) + ' استعلام بی‌پاسخ دارید.</b> ' +
        'خریداران عمده معمولاً سراغ کسی می‌روند که زودتر پاسخ می‌دهد. ' +
        '<a href="wholesale-rfq.html" style="color:var(--wp-gold-l)">پاسخ بدهید</a></div></div>');
    }
    if (s.outOfStock) {
      out.push('<div class="wp-note bad">' + IC.warn +
        '<div><b>' + fa(s.outOfStock) + ' کالا تمام شده است.</b> ' +
        'کالای ناموجود در بازار عمده نمایش داده نمی‌شود. ' +
        '<a href="wholesale-inventory.html" style="color:var(--wp-gold-l)">پر کردن انبار</a></div></div>');
    }
    if (!s.products) {
      out.push('<div class="wp-note">' + IC.info +
        '<div><b>هنوز کالایی ثبت نکرده‌اید.</b> ' +
        'با افزودن نخستین کالا، فروشگاهتان در بازار عمده دیده می‌شود. ' +
        '<a href="wholesale-products.html" style="color:var(--wp-gold-l)">افزودن کالا</a></div></div>');
    }
    $('#alerts').innerHTML = out.join('');
  }

  function paintChart() {
    var data = S.chart();
    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);
    $('#chartSum').textContent = total ? 'جمع ' + money(total) + ' تومان' : 'هنوز فروشی نبوده';
    $('#chart').innerHTML = data.map(function (d) {
      var h = Math.max(4, Math.round(d.value / max * 100));
      return '<div class="wp-bar-col">' +
        '<div class="wp-bar' + (d.value === max && max > 1 ? ' peak' : '') +
        '" style="--h:' + h + '%" title="' + esc(d.label) + ' — ' + money(d.value) + '"></div>' +
        '<span class="wp-bar-lbl">' + esc(d.label) + '</span></div>';
    }).join('');
  }

  function paintRfq() {
    var list = S.rfq.list().slice(0, 5);
    if (!list.length) { $('#rfqBox').innerHTML = U.emptyBox('استعلامی نرسیده', 'وقتی خریداری استعلام بفرستد، اینجا می‌بینید.'); return; }
    $('#rfqBox').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>کالا</th><th>خریدار</th><th>تعداد</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>' +
      list.map(function (r) {
        var C = { open: 'warn', answered: 'info', accepted: 'ok', rejected: 'bad', expired: 'mute' };
        return '<tr><td><b>' + esc(r.productName) + '</b></td>' +
          '<td>' + esc(r.buyerName) + (r.buyerCompany ? '<span class="wp-tiny">' + esc(r.buyerCompany) + '</span>' : '') + '</td>' +
          '<td class="num">' + fa(r.qty) + '</td>' +
          '<td><span class="wp-tag ' + (C[r.status] || 'mute') + '">' + S.rfq.STATUS_FA[r.status] + '</span></td>' +
          '<td class="muted">' + esc(r.date) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function paintOrders() {
    var list = S.orders.list().slice(0, 5);
    if (!list.length) { $('#ordBox').innerHTML = U.emptyBox('سفارشی ثبت نشده', 'سفارش‌های عمده اینجا می‌آیند.'); return; }
    $('#ordBox').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>شماره</th><th>خریدار</th><th>تعداد</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>' +
      list.map(function (o) {
        var C = { pending: 'warn', confirmed: 'info', preparing: 'info', shipped: 'gold', delivered: 'ok', canceled: 'bad' };
        return '<tr><td><b>' + esc(o.id) + '</b><span class="wp-tiny">' + esc(o.date) + '</span></td>' +
          '<td>' + esc(o.buyerName) + '</td>' +
          '<td class="num">' + fa(o.count) + '</td>' +
          '<td class="num">' + money(o.total) + '</td>' +
          '<td><span class="wp-tag ' + (C[o.status] || 'mute') + '">' + S.orders.STATUS_FA[o.status] + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function paintTop() {
    var list = S.topProducts(5).filter(function (p) { return (p.sold || 0) > 0; });
    if (!list.length) { $('#topBox').innerHTML = U.emptyBox('هنوز فروشی ثبت نشده', 'پس از نخستین تحویل، پرفروش‌ها اینجا می‌آیند.'); return; }
    var max = list[0].sold || 1;
    $('#topBox').innerHTML = list.map(function (p) {
      var w = Math.round((p.sold || 0) / max * 100);
      return '<div style="margin-bottom:12px">' +
        '<div style="display:flex;gap:10px;font-size:13px;margin-bottom:5px">' +
          '<b>' + esc(p.name) + '</b>' +
          '<span style="margin-inline-start:auto;color:var(--wp-gold-l);font-weight:700">' +
            fa(p.sold) + ' عدد</span></div>' +
        '<div style="height:7px;border-radius:99px;background:rgba(138,126,114,.16);overflow:hidden">' +
          '<i style="display:block;height:100%;width:' + w + '%;border-radius:99px;' +
          'background:linear-gradient(90deg,#d4b85a,#b8943c)"></i></div></div>';
    }).join('');
  }

  function all() { paintKpis(); paintAlerts(); paintChart(); paintRfq(); paintOrders(); paintTop(); }
  document.addEventListener('dpw:change', all);
  all();
});'''
    return body, script, ''


# ════════════════════════════════════════════════════════════
#  ۲. کالاهای عمده
# ════════════════════════════════════════════════════════════
def products():
    body = '''    <div id="gateNote"></div>

    <div class="wp-toolbar">
      <input class="wp-input" id="q" type="search" placeholder="جست‌وجوی نام یا کد…" aria-label="جست‌وجو" />
      <div class="wp-seg" id="filter" role="tablist">
        <button class="on" type="button" data-f="">همه</button>
        <button type="button" data-f="active">فعال</button>
        <button type="button" data-f="draft">پیش‌نویس</button>
        <button type="button" data-f="low">رو به اتمام</button>
        <button type="button" data-f="out">ناموجود</button>
      </div>
      <button class="wp-btn wp-btn-gold spacer" type="button" id="addBtn">
        ''' + ico(I['plus']) + ''' افزودن کالای عمده
      </button>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>فهرست کالاها</h2>
        <span class="sub spacer" id="count">—</span>
      </div>
      <div id="box"></div>
    </div>'''

    modals = '''<div class="wp-modal" id="pModal" role="dialog" aria-modal="true" aria-label="کالای عمده">
  <div class="wp-modal-card">
    ''' + CLOSE_X + '''
    <h2 id="pTitle">افزودن کالای عمده</h2>
    <p>قیمت پلکانی مهم‌ترین بخش است — هرچه خریدار بیشتر بگیرد، ارزان‌تر.</p>

    <form id="pForm" novalidate>
      <input type="hidden" id="pId" />

      <div class="wp-grid">
        <div class="wp-field full">
          <label for="pName">نام کالا <span class="req">*</span></label>
          <input class="wp-input" id="pName" placeholder="مثلاً: مانتو کتان جلوبسته" />
        </div>

        <div class="wp-field">
          <label for="pCode">کد کالا</label>
          <input class="wp-input" id="pCode" placeholder="خودکار" />
        </div>

        <div class="wp-field">
          <label for="pBrand">برند</label>
          <input class="wp-input" id="pBrand" placeholder="نام برند" />
        </div>

        <div class="wp-field">
          <label for="pSection">بخش <span class="req">*</span></label>
          <select class="wp-input" id="pSection"></select>
        </div>

        <div class="wp-field">
          <label for="pGroup">سبک <span class="req">*</span></label>
          <select class="wp-input" id="pGroup"></select>
          <span class="wp-hint">رسمی، اسپرت، ورزشی و…</span>
        </div>

        <div class="wp-field">
          <label for="pItem">نوع کالا <span class="req">*</span></label>
          <select class="wp-input" id="pItem"></select>
        </div>

        <div class="wp-field full">
          <div class="wp-trail" id="pTrail" hidden></div>
        </div>

        <div class="wp-field">
          <label for="pPrice">قیمت پایه هر عدد (تومان) <span class="req">*</span></label>
          <input class="wp-input" id="pPrice" inputmode="numeric" placeholder="مثلاً ۴۵۰۰۰۰" />
        </div>

        <div class="wp-field">
          <label for="pMoq">حداقل سفارش (عدد) <span class="req">*</span></label>
          <input class="wp-input" id="pMoq" inputmode="numeric" value="۱۲" />
        </div>

        <div class="wp-field">
          <label for="pStock">موجودی انبار <span class="req">*</span></label>
          <input class="wp-input" id="pStock" inputmode="numeric" value="۰" />
        </div>

        <div class="wp-field">
          <label for="pLowAt">هشدار کمبود در</label>
          <input class="wp-input" id="pLowAt" inputmode="numeric" placeholder="خودکار" />
          <span class="wp-hint">وقتی موجودی به این عدد رسید، هشدار می‌گیرید.</span>
        </div>

        <div class="wp-field">
          <label for="pLead">زمان آماده‌سازی (روز)</label>
          <input class="wp-input" id="pLead" inputmode="numeric" value="۳" />
        </div>

        <div class="wp-field">
          <label for="pStatus">وضعیت</label>
          <select class="wp-input" id="pStatus">
            <option value="active">فعال — در بازار دیده شود</option>
            <option value="draft">پیش‌نویس — فعلاً پنهان</option>
          </select>
        </div>
      </div>

      <div class="wp-card-head" style="margin:18px 0 10px">
        <h2 style="font-size:14px">پله‌های قیمت</h2>
        <button class="wp-btn wp-btn-ghost wp-btn-sm spacer" type="button" id="autoTiers">
          ساخت خودکار
        </button>
      </div>
      <div class="wp-tiers" id="tiers"></div>
      <button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" id="addTier" style="margin-top:8px">
        ''' + ico(I['plus']) + ''' پله‌ی تازه
      </button>

      <div class="wp-grid" style="margin-top:18px">
        <div class="wp-field">
          <label for="pMaterial">جنس</label>
          <input class="wp-input" id="pMaterial" placeholder="مثلاً: کتان" />
        </div>
        <div class="wp-field">
          <label for="pColors">رنگ‌بندی</label>
          <input class="wp-input" id="pColors" placeholder="مشکی، کرم، سرمه‌ای" />
        </div>
        <div class="wp-field">
          <label for="pSizes">سایزبندی</label>
          <input class="wp-input" id="pSizes" placeholder="S تا XL" />
        </div>
        <div class="wp-field">
          <label for="pPacking">بسته‌بندی</label>
          <input class="wp-input" id="pPacking" placeholder="کارتن ۲۴ عددی" />
        </div>
        <div class="wp-field full">
          <label for="pDesc">توضیح</label>
          <textarea class="wp-input" id="pDesc" rows="3"
            placeholder="جزئیاتی که خریدار عمده باید بداند…"></textarea>
        </div>
      </div>

      <div class="wp-card-head" style="margin:18px 0 10px">
        <h2 style="font-size:14px">عکس کالا</h2>
        <span class="sub spacer">تا ۶ عکس — نخستین عکس، عکس اصلی است</span>
      </div>

      <div class="wp-drop" id="pDrop" tabindex="0" role="button"
           aria-label="افزودن عکس کالا">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 15.5V4.5"/><path d="m8 8.5 4-4 4 4"/>
          <path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/>
        </svg>
        <b>عکس را بکشید یا کلیک کنید</b>
        <span>JPG، PNG یا WebP — هر عکس تا ۵ مگابایت</span>
      </div>
      <input aria-label="انتخاب تصاویر کالا" type="file" id="pFiles" accept="image/jpeg,image/png,image/webp" multiple hidden />
      <div class="wp-shots" id="pShots"></div>

      <div class="wp-modal-foot">
        <button class="wp-btn wp-btn-gold" type="submit">''' + ico(I['save']) + ''' ذخیره</button>
        <button class="wp-btn wp-btn-ghost" type="button" data-wp-close>انصراف</button>
      </div>
    </form>
  </div>
</div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money, toEn = S.toEn;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';

  var filter = '', q = '';

  /* ---------- پله‌های قیمت ---------- */
  function tierRow(t) {
    return '<div class="wp-tier-row">' +
      '<input class="wp-input tier-from" inputmode="numeric" placeholder="از تعداد" value="' +
        (t ? fa(t.from) : '') + '" aria-label="از تعداد" />' +
      '<input class="wp-input tier-price" inputmode="numeric" placeholder="قیمت هر عدد" value="' +
        (t ? fa(t.price) : '') + '" aria-label="قیمت" />' +
      '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-deltier aria-label="حذف پله">' +
        IC.x + '</button></div>';
  }

  function readTiers() {
    return [].slice.call(document.querySelectorAll('.wp-tier-row')).map(function (r) {
      return {
        from: Number(toEn(r.querySelector('.tier-from').value)) || 0,
        price: Number(toEn(r.querySelector('.tier-price').value)) || 0,
      };
    }).filter(function (t) { return t.from > 0 && t.price > 0; });
  }

  $('#addTier').addEventListener('click', function () {
    $('#tiers').insertAdjacentHTML('beforeend', tierRow(null));
  });

  $('#autoTiers').addEventListener('click', function () {
    var base = Number(toEn($('#pPrice').value));
    var moq = Number(toEn($('#pMoq').value));
    if (!base || !moq) { U.toast('اول قیمت پایه و حداقل سفارش را بنویسید.', 'error'); return; }
    $('#tiers').innerHTML = S.defaultTiers(base, moq).map(tierRow).join('');
    U.toast('چهار پله ساخته شد — می‌توانید دستی تغییرشان دهید.', 'success');
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-deltier]')) e.target.closest('.wp-tier-row').remove();
  });

  /* ---------- فهرست ---------- */
  function match(p) {
    if (filter === 'active' && p.status !== 'active') return false;
    if (filter === 'draft' && p.status !== 'draft') return false;
    if (filter === 'low' && !(p.stock > 0 && p.stock <= (p.lowAt || p.moq * 3))) return false;
    if (filter === 'out' && p.stock > 0) return false;
    if (q) {
      var s = (p.name + ' ' + p.code + ' ' + p.brand).toLowerCase();
      if (s.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  }

  function paint() {
    paintGate();
    var list = S.products.list().filter(match);
    $('#count').textContent = fa(list.length) + ' کالا';

    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('کالایی نیست',
        'با دکمه‌ی «افزودن کالای عمده» نخستین کالایتان را ثبت کنید.');
      return;
    }

    $('#box').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>کالا</th><th>قیمت پایه</th><th>کمترین پله</th><th>حداقل سفارش</th>' +
      '<th>موجودی</th><th>فروش</th><th>وضعیت</th><th></th></tr></thead><tbody>' +
      list.map(function (p) {
        var low = p.stock > 0 && p.stock <= (p.lowAt || p.moq * 3);
        var out = p.stock <= 0;
        var off = S.maxDiscount(p);
        var best = S.priceFor(p, (p.moq || 1) * 25);
        return '<tr>' +
          '<td><b>' + esc(p.name) + '</b>' +
            '<span class="wp-tiny">کد ' + esc(p.code) +
            (p.brand ? ' · ' + esc(p.brand) : '') + '</span></td>' +
          '<td class="num">' + money(p.price) + '</td>' +
          '<td class="num">' + money(best.unit) +
            (off ? '<span class="wp-tiny">تا ٪' + fa(off) + ' ارزان‌تر</span>' : '') + '</td>' +
          '<td class="num">' + fa(p.moq) + '</td>' +
          '<td class="num">' + (out
            ? '<span class="wp-tag bad">ناموجود</span>'
            : (low ? '<span class="wp-tag warn">' + fa(p.stock) + '</span>' : fa(p.stock))) + '</td>' +
          '<td class="num">' + fa(p.sold || 0) + '</td>' +
          '<td>' + statusTag(p) + '</td>' +
          '<td><div class="wp-row-acts">' +
            '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-edit="' + esc(p.id) + '">ویرایش</button>' +
            '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-del="' + esc(p.id) + '">حذف</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ============================================================
     دروازه‌ی تأیید مدیر
     ------------------------------------------------------------
     تا وقتی مدیر فروشگاه را تأیید نکرده، هر کالایی که ثبت شود
     پیش‌نویس می‌ماند و در بازار عمده دیده نمی‌شود. اینجا این
     را روشن و بی‌ابهام به فروشنده می‌گوییم — نه اینکه بی‌صدا
     پیش‌نویس کنیم و او سردرگم بماند.
     ============================================================ */
  function paintGate() {
    var box = $('#gateNote');
    if (!box) return;
    var st = S.myStatus();
    var rule = S.can();

    if (st === 'approved') { box.innerHTML = ''; return; }

    var drafts = S.products.list().filter(function (p) {
      return p.status === 'draft' && (p.wanted || 'active') !== 'draft';
    }).length;

    if (st === 'pending') {
      box.innerHTML =
        '<div class="wp-note warn" style="margin-bottom:14px"><div>' +
          '<b>فروشگاه شما هنوز تأیید نشده است.</b><br>' +
          'می‌توانید کالا ثبت کنید، ولی تا تأیید مدیر <b>پیش‌نویس</b> می‌ماند ' +
          'و خریداران آن را در بازار عمده نمی‌بینند. ' +
          'به‌محض تأیید، همه‌ی پیش‌نویس‌ها یک‌جا منتشر می‌شوند — ' +
          'لازم نیست دوباره کاری بکنید.' +
          (drafts ? '<br><span style="color:var(--wp-gold-l)">' +
            fa(drafts) + ' کالا در صف انتشار است.</span>' : '') +
        '</div></div>';
      return;
    }

    if (rule.locked) {
      box.innerHTML =
        '<div class="wp-note bad" style="margin-bottom:14px"><div>' +
          '<b>دسترسی فروشگاه شما ' +
          (st === 'rejected' ? 'رد شده' : 'معلق شده') + ' است.</b><br>' +
          'فعلاً نمی‌توانید کالا ثبت یا ویرایش کنید. ' +
          'برای پیگیری، از بخش «پروفایل» درخواست بررسی دوباره بدهید.' +
        '</div></div>';
    }
  }

  /** برچسب وضعیت هر کالا — پیش‌نویس دو معنی دارد، جدا می‌کنیم */
  function statusTag(p) {
    if (p.status === 'active') return '<span class="wp-tag ok">در بازار</span>';
    /* پیش‌نویسی که خود فروشنده خواسته */
    if ((p.wanted || 'active') === 'draft') {
      return '<span class="wp-tag mute">پیش‌نویس</span>';
    }
    /* پیش‌نویسی که به‌خاطر نبود تأیید مانده */
    return '<span class="wp-tag warn">در انتظار تأیید</span>';
  }

  /* ============================================================
     دسته‌بندی سه‌سطحی
     ------------------------------------------------------------
     همان درختی که فروشنده‌ی معمولی می‌بیند: بخش ← سبک ← کالا.
     پیش‌تر اینجا فقط شش گزینه‌ی کلی بود؛ خریدار نمی‌توانست
     «پیراهن رسمی مردانه» را از «تی‌شرت اسپرت» جدا کند.
     ============================================================ */
  var T = window.DPTaxonomy;

  function fillSections() {
    if (!T) return;
    $('#pSection').innerHTML = T.sections().map(function (x) {
      return '<option value="' + x.key + '">' + esc(x.label) + '</option>';
    }).join('');
  }

  function fillGroups(sec, want) {
    if (!T) return;
    var gs = T.groups(sec);
    $('#pGroup').innerHTML = gs.map(function (g) {
      return '<option value="' + g.key + '">' + esc(g.label) + '</option>';
    }).join('');
    if (want && gs.some(function (g) { return g.key === want; })) $('#pGroup').value = want;
  }

  function fillItems(sec, grp, want) {
    if (!T) return;
    var its = T.items(sec, grp);
    $('#pItem').innerHTML = its.map(function (i) {
      return '<option value="' + esc(i) + '">' + esc(i) + '</option>';
    }).join('');
    if (want && its.indexOf(want) > -1) $('#pItem').value = want;
  }

  function paintTrail() {
    if (!T) return;
    var el = $('#pTrail');
    var t = T.trail($('#pSection').value, $('#pGroup').value, $('#pItem').value);
    el.textContent = t;
    el.hidden = !t;
  }

  if (T) {
    fillSections();
    $('#pSection').addEventListener('change', function () {
      fillGroups(this.value);
      fillItems(this.value, $('#pGroup').value);
      paintTrail();
    });
    $('#pGroup').addEventListener('change', function () {
      fillItems($('#pSection').value, this.value);
      paintTrail();
    });
    $('#pItem').addEventListener('change', paintTrail);
  }

  /* ============================================================
     عکس کالا
     ------------------------------------------------------------
     عکس‌ها به شکل متن (data URL) در حافظه‌ی مرورگر می‌نشینند —
     همان روشی که فروشنده‌ی معمولی دارد.
     ============================================================ */
  var shots = [];
  var MAX_SHOTS = 6;
  var MAX_BYTES = 5 * 1024 * 1024;
  var OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function paintShots() {
    $('#pShots').innerHTML = shots.map(function (src, i) {
      return '<div class="wp-shot' + (i === 0 ? ' is-main' : '') + '">' +
        '<img src="' + esc(src) + '" alt="عکس ' + fa(i + 1) + '" />' +
        (i === 0 ? '<em class="wp-shot-main">اصلی</em>' : '') +
        '<button class="wp-shot-x" type="button" data-shot="' + i +
          '" aria-label="حذف عکس ' + fa(i + 1) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button></div>';
    }).join('');
  }

  function addFiles(list) {
    var files = [].slice.call(list || []);
    if (!files.length) return;
    var added = 0;

    files.forEach(function (f) {
      if (shots.length + added >= MAX_SHOTS) return;
      if (OK_TYPES.indexOf(f.type) < 0) {
        U.toast('«' + f.name + '» عکس معتبری نیست.', 'error');
        return;
      }
      if (f.size > MAX_BYTES) {
        U.toast('«' + f.name + '» بیش از ۵ مگابایت است.', 'error');
        return;
      }
      added++;
      var fr = new FileReader();
      fr.onload = function () { shots.push(fr.result); paintShots(); };
      fr.onerror = function () { U.toast('خواندن عکس ناموفق بود.', 'error'); };
      fr.readAsDataURL(f);
    });

    if (shots.length + added > MAX_SHOTS) {
      U.toast('بیشتر از ' + fa(MAX_SHOTS) + ' عکس نمی‌شود.', 'warn');
    }
  }

  $('#pDrop').addEventListener('click', function () { $('#pFiles').click(); });
  $('#pDrop').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#pFiles').click(); }
  });
  $('#pFiles').addEventListener('change', function (e) {
    addFiles(e.target.files);
    e.target.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (ev) {
    $('#pDrop').addEventListener(ev, function (e) {
      e.preventDefault(); $('#pDrop').classList.add('over');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    $('#pDrop').addEventListener(ev, function (e) {
      e.preventDefault(); $('#pDrop').classList.remove('over');
    });
  });
  $('#pDrop').addEventListener('drop', function (e) {
    addFiles(e.dataTransfer && e.dataTransfer.files);
  });

  $('#pShots').addEventListener('click', function (e) {
    var b = e.target.closest('[data-shot]');
    if (!b) return;
    shots.splice(Number(b.dataset.shot), 1);
    paintShots();
  });

  /* ---------- فرم ---------- */
  function openForm(p) {
    $('#pTitle').textContent = p ? 'ویرایش کالا' : 'افزودن کالای عمده';
    $('#pId').value = p ? p.id : '';
    $('#pName').value = p ? p.name : '';
    $('#pCode').value = p ? p.code : '';
    $('#pBrand').value = p ? p.brand : '';
    /* دسته‌بندی — برای کالاهای قدیمی از روی نام کالا حدس می‌زنیم */
    if (T) {
      var sec = (p && p.section) || 'women';
      var grp = (p && p.group) || '';
      var itm = (p && p.item) || '';
      if (p && !p.section && p.category) {
        var found = T.findByItem(p.category);
        if (found) { sec = found.section; grp = found.group; itm = found.item; }
      }
      $('#pSection').value = sec;
      fillGroups(sec, grp);
      fillItems(sec, $('#pGroup').value, itm);
      paintTrail();
    }
    $('#pPrice').value = p ? fa(p.price) : '';
    $('#pMoq').value = p ? fa(p.moq) : '۱۲';
    $('#pStock').value = p ? fa(p.stock) : '۰';
    $('#pLowAt').value = p && p.lowAt ? fa(p.lowAt) : '';
    $('#pLead').value = p ? fa(p.leadTime || 3) : '۳';
    $('#pStatus').value = p ? p.status : 'active';
    $('#pMaterial').value = p ? (p.material || '') : '';
    $('#pColors').value = p ? (p.colors || '') : '';
    $('#pSizes').value = p ? (p.sizes || '') : '';
    $('#pPacking').value = p ? (p.packing || '') : '';
    $('#pDesc').value = p ? (p.description || '') : '';
    $('#tiers').innerHTML = (p && p.tiers && p.tiers.length ? p.tiers : []).map(tierRow).join('');

    shots = (p && Array.isArray(p.images) ? p.images.slice(0, MAX_SHOTS) : []);
    paintShots();

    U.openModal('#pModal');
  }

  $('#addBtn').addEventListener('click', function () { openForm(null); });

  $('#pForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: $('#pName').value, code: $('#pCode').value, brand: $('#pBrand').value,
      section: T ? $('#pSection').value : '',
      group: T ? $('#pGroup').value : '',
      item: T ? $('#pItem').value : '',
      category: T ? $('#pItem').value : '',
      images: shots.slice(),
      price: $('#pPrice').value, moq: $('#pMoq').value,
      stock: $('#pStock').value, lowAt: $('#pLowAt').value, leadTime: $('#pLead').value,
      status: $('#pStatus').value, material: $('#pMaterial').value,
      colors: $('#pColors').value, sizes: $('#pSizes').value,
      packing: $('#pPacking').value, description: $('#pDesc').value,
      tiers: readTiers(),
    };
    try {
      var id = $('#pId').value;
      var okPub = S.can().canPublish;

      if (id) {
        S.products.update(id, data);
        U.toast(okPub ? 'کالا به‌روز شد.'
                      : 'کالا به‌روز شد — تا تأیید مدیر پیش‌نویس می‌ماند.',
                okPub ? 'success' : 'warn');
      } else {
        S.products.add(data);
        U.toast(okPub ? 'کالا افزوده شد و در بازار عمده دیده می‌شود.'
                      : 'کالا ثبت شد — پس از تأیید مدیر در بازار منتشر می‌شود.',
                okPub ? 'success' : 'warn');
      }
      U.closeModal($('#pModal'));
      paint();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  document.addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]');
    if (ed) { openForm(S.products.get(ed.dataset.edit)); return; }
    var dl = e.target.closest('[data-del]');
    if (dl) {
      if (!confirm('این کالا حذف شود؟')) return;
      S.products.remove(dl.dataset.del);
      U.toast('کالا حذف شد.', 'success');
      paint();
    }
  });

  $('#q').addEventListener('input', function (e) { q = e.target.value.trim(); paint(); });

  $('#filter').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (!b) return;
    [].slice.call(this.children).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    filter = b.dataset.f;
    paint();
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, modals


# ════════════════════════════════════════════════════════════
#  ۳. استعلام‌ها
# ════════════════════════════════════════════════════════════
def rfq():
    body = '''    <div class="wp-note">
      ''' + ico(I['info']) + '''
      <div><b>استعلام قیمت قلب عمده‌فروشی است.</b>
        خریدار تعداد و قیمت هدفش را می‌گوید، شما بهترین پیشنهادتان را می‌دهید.
        هرچه زودتر پاسخ دهید، شانس بستن معامله بیشتر است.</div>
    </div>

    <div class="wp-toolbar">
      <div class="wp-seg" id="filter" role="tablist">
        <button class="on" type="button" data-f="">همه</button>
        <button type="button" data-f="open">بی‌پاسخ</button>
        <button type="button" data-f="answered">پاسخ داده‌شده</button>
        <button type="button" data-f="accepted">پذیرفته‌شده</button>
        <button type="button" data-f="rejected">ردشده</button>
      </div>
      <span class="sub spacer" id="count" style="color:var(--wp-gray);font-size:13px">—</span>
    </div>

    <div class="wp-card">
      <div id="box"></div>
    </div>'''

    modals = '''<div class="wp-modal" id="aModal" role="dialog" aria-modal="true" aria-label="پاسخ به استعلام">
  <div class="wp-modal-card" style="width:min(560px,100%)">
    ''' + CLOSE_X + '''
    <h2>پاسخ به استعلام</h2>
    <div id="aInfo"></div>

    <form id="aForm" novalidate>
      <input type="hidden" id="aId" />
      <div class="wp-grid">
        <div class="wp-field">
          <label for="aPrice">قیمت پیشنهادی هر عدد (تومان) <span class="req">*</span></label>
          <input class="wp-input" id="aPrice" inputmode="numeric" />
        </div>
        <div class="wp-field">
          <label for="aLead">زمان آماده‌سازی (روز)</label>
          <input class="wp-input" id="aLead" inputmode="numeric" value="۷" />
        </div>
        <div class="wp-field">
          <label for="aValid">اعتبار پیشنهاد (روز)</label>
          <input class="wp-input" id="aValid" inputmode="numeric" value="۷" />
        </div>
        <div class="wp-field full">
          <label for="aNote">توضیح</label>
          <textarea class="wp-input" id="aNote" rows="3"
            placeholder="شرایط پرداخت، بسته‌بندی، هزینه‌ی ارسال…"></textarea>
        </div>
      </div>
      <div class="wp-note ok" id="aCalc" style="margin-top:14px" hidden></div>
      <div class="wp-modal-foot">
        <button class="wp-btn wp-btn-gold" type="submit">ارسال پیشنهاد</button>
        <button class="wp-btn wp-btn-ghost" type="button" data-wp-close>انصراف</button>
      </div>
    </form>
  </div>
</div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money, toEn = S.toEn;
  var $ = function (s) { return document.querySelector(s); };
  var filter = '';

  var C = { open: 'warn', answered: 'info', accepted: 'ok', rejected: 'bad', expired: 'mute' };

  function paint() {
    var list = S.rfq.list(filter);
    $('#count').textContent = fa(list.length) + ' استعلام';

    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('استعلامی نیست',
        'وقتی خریداری از بازار عمده استعلام بفرستد، اینجا می‌بینید.');
      return;
    }

    $('#box').innerHTML = list.map(function (r) {
      var isOpen = r.status === 'open';
      return '<div style="padding:15px;border-radius:13px;margin-bottom:11px;' +
          'background:rgba(26,42,74,.42);border:1px solid var(--wp-line)' +
          (isOpen ? ';border-inline-start:3px solid var(--wp-warn)' : '') + '">' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:baseline;margin-bottom:9px">' +
          '<b style="font-size:14.5px">' + esc(r.productName) + '</b>' +
          '<span class="wp-tag ' + (C[r.status] || 'mute') + '">' + S.rfq.STATUS_FA[r.status] + '</span>' +
          '<span style="margin-inline-start:auto;font-size:12px;color:var(--wp-gray)">' + esc(r.date) + '</span>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:9px;' +
            'font-size:12.5px;margin-bottom:10px">' +
          '<span style="color:var(--wp-gray)">خریدار<b style="display:block;color:var(--wp-ink)">' +
            esc(r.buyerName) + '</b></span>' +
          (r.buyerCompany ? '<span style="color:var(--wp-gray)">شرکت<b style="display:block;color:var(--wp-ink)">' +
            esc(r.buyerCompany) + '</b></span>' : '') +
          '<span style="color:var(--wp-gray)">تعداد<b style="display:block;color:var(--wp-gold-l)">' +
            fa(r.qty) + ' عدد</b></span>' +
          (r.targetPrice ? '<span style="color:var(--wp-gray)">قیمت هدف<b style="display:block;color:var(--wp-ink)">' +
            money(r.targetPrice) + '</b></span>' : '') +
          (r.deadline ? '<span style="color:var(--wp-gray)">مهلت<b style="display:block;color:var(--wp-ink)">' +
            esc(r.deadline) + '</b></span>' : '') +
          (r.buyerPhone ? '<span style="color:var(--wp-gray)">تماس<b style="display:block;color:var(--wp-ink)">' +
            esc(r.buyerPhone) + '</b></span>' : '') +
        '</div>' +

        (r.note ? '<div style="font-size:12.5px;color:var(--wp-gray);padding:9px 12px;' +
          'border-radius:9px;background:rgba(10,10,10,.4);margin-bottom:10px">' +
          esc(r.note) + '</div>' : '') +

        (r.offer ? '<div class="wp-note ok" style="margin:0 0 10px">' +
          '<div><b>پیشنهاد شما:</b> ' + money(r.offer.unitPrice) + ' تومان هر عدد — ' +
          'جمع ' + money(r.offer.total) + ' تومان' +
          (r.offer.leadTime ? ' · آماده‌سازی ' + fa(r.offer.leadTime) + ' روز' : '') +
          (r.offer.note ? '<br>' + esc(r.offer.note) : '') + '</div></div>' : '') +

        (r.reason ? '<div class="wp-note bad" style="margin:0 0 10px"><div>' +
          esc(r.reason) + '</div></div>' : '') +

        '<div class="wp-row-acts">' +
          (isOpen
            ? '<button class="wp-btn wp-btn-gold wp-btn-sm" type="button" data-ans="' + esc(r.id) + '">پاسخ بدهید</button>' +
              '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-rej="' + esc(r.id) + '">رد کنید</button>'
            : '') +
          (r.status === 'answered'
            ? '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-toord="' + esc(r.id) + '">' +
              'تبدیل به سفارش</button>' : '') +
          (r.orderId ? '<span class="wp-tag gold">سفارش ' + esc(r.orderId) + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ---------- پاسخ ---------- */
  function calc() {
    var r = S.rfq.get($('#aId').value);
    if (!r) return;
    var u = Number(toEn($('#aPrice').value));
    var box = $('#aCalc');
    if (!u) { box.hidden = true; return; }
    box.hidden = false;
    var total = u * r.qty;
    var vs = r.targetPrice
      ? (u <= r.targetPrice
          ? ' — <b style="color:var(--wp-ok)">زیر قیمت هدف خریدار</b>'
          : ' — <b style="color:var(--wp-warn)">بالاتر از قیمت هدف (' + money(r.targetPrice) + ')</b>')
      : '';
    box.innerHTML = '<div>جمع کل: <b>' + money(total) + '</b> تومان برای ' +
      fa(r.qty) + ' عدد' + vs + '</div>';
  }

  $('#aPrice').addEventListener('input', calc);

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ans]');
    if (a) {
      var r = S.rfq.get(a.dataset.ans);
      if (!r) return;
      $('#aId').value = r.id;
      $('#aPrice').value = '';
      $('#aCalc').hidden = true;
      $('#aInfo').innerHTML = '<div class="wp-note" style="margin-bottom:14px"><div>' +
        '<b>' + esc(r.productName) + '</b><br>' +
        esc(r.buyerName) + ' — ' + fa(r.qty) + ' عدد' +
        (r.targetPrice ? ' · قیمت هدف ' + money(r.targetPrice) : '') + '</div></div>';
      U.openModal('#aModal');
      return;
    }

    var rj = e.target.closest('[data-rej]');
    if (rj) {
      var why = prompt('چرا این استعلام را رد می‌کنید؟');
      if (why === null) return;
      try { S.rfq.reject(rj.dataset.rej, why); U.toast('استعلام رد شد.', 'success'); paint(); }
      catch (err) { U.toast(err.message, 'error'); }
      return;
    }

    var to = e.target.closest('[data-toord]');
    if (to) {
      if (!confirm('این استعلام به سفارش تبدیل شود؟')) return;
      try {
        var o = S.rfq.toOrder(to.dataset.toord);
        U.toast('سفارش ' + o.id + ' ساخته شد.', 'success');
        paint();
      } catch (err) { U.toast(err.message, 'error'); }
    }
  });

  $('#aForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      S.rfq.answer($('#aId').value, {
        unitPrice: $('#aPrice').value,
        leadTime: $('#aLead').value,
        validDays: $('#aValid').value,
        note: $('#aNote').value,
      });
      U.closeModal($('#aModal'));
      U.toast('پیشنهاد شما ارسال شد.', 'success');
      paint();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  $('#filter').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (!b) return;
    [].slice.call(this.children).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    filter = b.dataset.f;
    paint();
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, modals


# ════════════════════════════════════════════════════════════
#  ۴. سفارش‌ها
# ════════════════════════════════════════════════════════════
def orders():
    body = '''    <div class="wp-toolbar">
      <div class="wp-seg" id="filter" role="tablist">
        <button class="on" type="button" data-f="">همه</button>
        <button type="button" data-f="pending">در انتظار</button>
        <button type="button" data-f="confirmed">تأییدشده</button>
        <button type="button" data-f="preparing">آماده‌سازی</button>
        <button type="button" data-f="shipped">ارسال‌شده</button>
        <button type="button" data-f="delivered">تحویل‌شده</button>
      </div>
      <button class="wp-btn wp-btn-gold spacer" type="button" id="newBtn">
        ''' + ico(I['plus']) + ''' سفارش دستی
      </button>
    </div>

    <div class="wp-kpis" id="kpis"></div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>سفارش‌های عمده</h2>
        <span class="sub spacer" id="count">—</span>
      </div>
      <div id="box"></div>
    </div>'''

    modals = '''<div class="wp-modal" id="oModal" role="dialog" aria-modal="true" aria-label="جزئیات سفارش">
  <div class="wp-modal-card">
    ''' + CLOSE_X + '''
    <div id="oBody"></div>
  </div>
</div>

<div class="wp-modal" id="nModal" role="dialog" aria-modal="true" aria-label="سفارش دستی">
  <div class="wp-modal-card" style="width:min(600px,100%)">
    ''' + CLOSE_X + '''
    <h2>ثبت سفارش دستی</h2>
    <p>برای سفارش‌هایی که تلفنی یا حضوری گرفته‌اید.</p>

    <form id="nForm" novalidate>
      <div class="wp-grid">
        <div class="wp-field">
          <label for="nName">نام خریدار <span class="req">*</span></label>
          <input class="wp-input" id="nName" />
        </div>
        <div class="wp-field">
          <label for="nPhone">تلفن</label>
          <input class="wp-input" id="nPhone" inputmode="tel" />
        </div>
        <div class="wp-field">
          <label for="nCompany">شرکت / فروشگاه</label>
          <input class="wp-input" id="nCompany" />
        </div>
        <div class="wp-field">
          <label for="nProduct">کالا <span class="req">*</span></label>
          <select class="wp-input" id="nProduct"></select>
        </div>
        <div class="wp-field">
          <label for="nQty">تعداد <span class="req">*</span></label>
          <input class="wp-input" id="nQty" inputmode="numeric" />
        </div>
        <div class="wp-field">
          <label for="nUnit">قیمت هر عدد</label>
          <input class="wp-input" id="nUnit" inputmode="numeric" placeholder="خودکار از پله‌ها" />
        </div>
        <div class="wp-field full">
          <label for="nAddress">نشانی تحویل</label>
          <input class="wp-input" id="nAddress" />
        </div>
      </div>
      <div class="wp-note ok" id="nCalc" style="margin-top:14px" hidden></div>
      <div class="wp-modal-foot">
        <button class="wp-btn wp-btn-gold" type="submit">ثبت سفارش</button>
        <button class="wp-btn wp-btn-ghost" type="button" data-wp-close>انصراف</button>
      </div>
    </form>
  </div>
</div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money, toEn = S.toEn;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';
  var filter = '';

  var C = { pending: 'warn', confirmed: 'info', preparing: 'info',
            shipped: 'gold', delivered: 'ok', canceled: 'bad' };

  function paintKpis() {
    var s = S.stats();
    var rows = [
      { c: '#c9a84c', i: IC.money, t: 'درآمد', v: money(s.revenue), s: fa(s.orders) + ' سفارش' },
      { c: '#4caf50', i: IC.check, t: 'دریافت‌شده', v: money(s.paid), s: 'تسویه‌شده' },
      { c: '#e57373', i: IC.warn, t: 'مانده', v: money(s.unpaid), s: 'دریافت‌نشده' },
      { c: '#c0c0c0', i: IC.box, t: 'میانگین سفارش', v: money(s.avgOrder), s: fa(s.units) + ' عدد کل' },
    ];
    $('#kpis').innerHTML = rows.map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');
  }

  function paint() {
    paintKpis();
    var list = S.orders.list(filter);
    $('#count').textContent = fa(list.length) + ' سفارش';

    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('سفارشی نیست',
        'سفارش‌های بازار عمده و استعلام‌های پذیرفته‌شده اینجا می‌آیند.');
      return;
    }

    $('#box').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>شماره</th><th>خریدار</th><th>اقلام</th><th>مبلغ</th>' +
      '<th>پرداخت</th><th>وضعیت</th><th></th></tr></thead><tbody>' +
      list.map(function (o) {
        var payPct = o.total ? Math.round((o.paid || 0) / o.total * 100) : 0;
        return '<tr>' +
          '<td><b>' + esc(o.id) + '</b><span class="wp-tiny">' + esc(o.date) + '</span></td>' +
          '<td>' + esc(o.buyerName) +
            (o.buyerCompany ? '<span class="wp-tiny">' + esc(o.buyerCompany) + '</span>' : '') + '</td>' +
          '<td class="num">' + fa((o.lines || []).length) + ' قلم<span class="wp-tiny">' +
            fa(o.count || 0) + ' عدد</span></td>' +
          '<td class="num">' + money(o.total) + '</td>' +
          '<td class="num">' + (payPct >= 100
            ? '<span class="wp-tag ok">کامل</span>'
            : (payPct > 0 ? '<span class="wp-tag warn">٪' + fa(payPct) + '</span>'
                          : '<span class="wp-tag bad">صفر</span>')) + '</td>' +
          '<td><span class="wp-tag ' + (C[o.status] || 'mute') + '">' +
            S.orders.STATUS_FA[o.status] + '</span></td>' +
          '<td><button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-open="' +
            esc(o.id) + '">جزئیات</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- جزئیات ---------- */
  function openOrder(oid) {
    var o = S.orders.get(oid);
    if (!o) return;
    var idx = S.orders.FLOW.indexOf(o.status);
    var next = idx >= 0 && idx < S.orders.FLOW.length - 1 ? S.orders.FLOW[idx + 1] : null;

    $('#oBody').innerHTML =
      '<h2>سفارش ' + esc(o.id) + '</h2>' +
      '<p>' + esc(o.date) + ' · <span class="wp-tag ' + (C[o.status] || 'mute') + '">' +
        S.orders.STATUS_FA[o.status] + '</span></p>' +

      '<div class="wp-grid" style="margin-bottom:16px">' +
        '<div class="wp-field"><label>خریدار</label><b>' + esc(o.buyerName) + '</b></div>' +
        (o.buyerCompany ? '<div class="wp-field"><label>شرکت</label><b>' + esc(o.buyerCompany) + '</b></div>' : '') +
        (o.buyerPhone ? '<div class="wp-field"><label>تلفن</label><b>' + esc(o.buyerPhone) + '</b></div>' : '') +
        (o.address ? '<div class="wp-field full"><label>نشانی</label><b>' + esc(o.address) + '</b></div>' : '') +
      '</div>' +

      '<div class="wp-table-wrap"><table class="wp-table" style="min-width:auto"><thead><tr>' +
        '<th>کالا</th><th>تعداد</th><th>هر عدد</th><th>جمع</th></tr></thead><tbody>' +
        (o.lines || []).map(function (l) {
          return '<tr><td>' + esc(l.name) + '</td>' +
            '<td class="num">' + fa(l.qty) + '</td>' +
            '<td class="num">' + money(l.unit) + '</td>' +
            '<td class="num">' + money(l.total) + '</td></tr>';
        }).join('') +
        '<tr><th colspan="3">جمع کل</th><th class="num">' + money(o.total) + '</th></tr>' +
        '<tr><th colspan="3">پرداخت‌شده</th><th class="num">' + money(o.paid || 0) + '</th></tr>' +
        (o.total > (o.paid || 0)
          ? '<tr><th colspan="3" style="color:var(--wp-bad)">مانده</th>' +
            '<th class="num" style="color:var(--wp-bad)">' + money(o.total - (o.paid || 0)) + '</th></tr>'
          : '') +
      '</tbody></table></div>' +

      (o.note ? '<div class="wp-note" style="margin-top:14px"><div>' + esc(o.note) + '</div></div>' : '') +

      '<div class="wp-card-head" style="margin:18px 0 8px"><h2 style="font-size:14px">گردش کار</h2></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px">' +
        (o.history || []).map(function (h) {
          return '<span class="wp-tag mute">' + S.orders.STATUS_FA[h.status] +
            ' · ' + esc(h.date) + '</span>';
        }).join('') +
      '</div>' +

      '<div class="wp-modal-foot">' +
        (next && o.status !== 'canceled'
          ? '<button class="wp-btn wp-btn-gold" type="button" data-next="' + esc(o.id) +
            '" data-to="' + next + '">' + S.orders.STATUS_FA[next] + '</button>' : '') +
        (o.total > (o.paid || 0)
          ? '<button class="wp-btn wp-btn-ghost" type="button" data-pay="' + esc(o.id) + '">ثبت پرداخت</button>' : '') +
        (o.status !== 'delivered' && o.status !== 'canceled'
          ? '<button class="wp-btn wp-btn-bad" type="button" data-cancel="' + esc(o.id) + '">لغو سفارش</button>' : '') +
      '</div>';

    U.openModal('#oModal');
  }

  /* ---------- سفارش دستی ---------- */
  function fillProducts() {
    var ps = S.products.list().filter(function (p) { return p.status === 'active'; });
    $('#nProduct').innerHTML = ps.length
      ? ps.map(function (p) {
          return '<option value="' + esc(p.id) + '" data-moq="' + p.moq + '">' +
            esc(p.name) + ' — حداقل ' + fa(p.moq) + '</option>';
        }).join('')
      : '<option value="">اول کالا اضافه کنید</option>';
  }

  function nCalc() {
    var pid = $('#nProduct').value;
    var qty = Number(toEn($('#nQty').value));
    var box = $('#nCalc');
    if (!pid || !qty) { box.hidden = true; return; }
    var p = S.products.get(pid);
    if (!p) { box.hidden = true; return; }
    var manual = Number(toEn($('#nUnit').value));
    var pr = manual ? { unit: manual, total: manual * qty } : S.priceFor(p, qty);
    box.hidden = false;
    box.innerHTML = '<div>' + fa(qty) + ' عدد × ' + money(pr.unit) + ' = <b>' +
      money(pr.total) + '</b> تومان' +
      (qty < p.moq ? ' — <b style="color:var(--wp-warn)">زیر حداقل سفارش (' + fa(p.moq) + ')</b>' : '') +
      (qty > p.stock ? ' — <b style="color:var(--wp-bad)">بیش از موجودی (' + fa(p.stock) + ')</b>' : '') +
      '</div>';
  }

  ['#nProduct', '#nQty', '#nUnit'].forEach(function (s) {
    $(s).addEventListener('input', nCalc);
    $(s).addEventListener('change', nCalc);
  });

  $('#newBtn').addEventListener('click', function () {
    fillProducts();
    ['#nName', '#nPhone', '#nCompany', '#nQty', '#nUnit', '#nAddress'].forEach(function (s) { $(s).value = ''; });
    $('#nCalc').hidden = true;
    U.openModal('#nModal');
  });

  $('#nForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pid = $('#nProduct').value;
    var p = S.products.get(pid);
    if (!p) { U.toast('کالا را انتخاب کنید.', 'error'); return; }
    var qty = Number(toEn($('#nQty').value));
    if (!qty || qty < 1) { U.toast('تعداد را بنویسید.', 'error'); return; }
    var manual = Number(toEn($('#nUnit').value));
    var unit = manual || S.priceFor(p, qty).unit;
    try {
      var o = S.orders.create({
        buyerName: $('#nName').value || 'خریدار',
        buyerPhone: $('#nPhone').value,
        buyerCompany: $('#nCompany').value,
        address: $('#nAddress').value,
        lines: [{ productId: p.id, name: p.name, qty: qty, unit: unit }],
      });
      U.closeModal($('#nModal'));
      U.toast('سفارش ' + o.id + ' ثبت شد.', 'success');
      paint();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  document.addEventListener('click', function (e) {
    var op = e.target.closest('[data-open]');
    if (op) { openOrder(op.dataset.open); return; }

    var nx = e.target.closest('[data-next]');
    if (nx) {
      try {
        S.orders.setStatus(nx.dataset.next, nx.dataset.to);
        U.toast('وضعیت به‌روز شد.', 'success');
        U.closeModal($('#oModal'));
        paint();
      } catch (err) { U.toast(err.message, 'error'); }
      return;
    }

    var py = e.target.closest('[data-pay]');
    if (py) {
      var o = S.orders.get(py.dataset.pay);
      var rest = o.total - (o.paid || 0);
      var a = prompt('چه مبلغی دریافت شد؟ (مانده: ' + money(rest) + ')', String(rest));
      if (a === null) return;
      try { S.orders.pay(py.dataset.pay, a); U.toast('پرداخت ثبت شد.', 'success');
            U.closeModal($('#oModal')); paint(); }
      catch (err) { U.toast(err.message, 'error'); }
      return;
    }

    var cn = e.target.closest('[data-cancel]');
    if (cn) {
      if (!confirm('این سفارش لغو شود؟ موجودی برمی‌گردد.')) return;
      try { S.orders.setStatus(cn.dataset.cancel, 'canceled');
            U.toast('سفارش لغو شد.', 'success'); U.closeModal($('#oModal')); paint(); }
      catch (err) { U.toast(err.message, 'error'); }
    }
  });

  $('#filter').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (!b) return;
    [].slice.call(this.children).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    filter = b.dataset.f;
    paint();
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, modals


# ════════════════════════════════════════════════════════════
#  ۵. انبار
# ════════════════════════════════════════════════════════════
def inventory():
    body = '''    <div class="wp-kpis" id="kpis"></div>

    <div id="alerts"></div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>موجودی کالاها</h2>
        <span class="sub spacer">برای تغییر موجودی، عدد را بنویسید و ثبت کنید</span>
      </div>
      <div id="box"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>دفتر انبار</h2>
        <span class="sub spacer">۵۰ تغییر اخیر</span>
      </div>
      <div id="logBox"></div>
    </div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money, toEn = S.toEn;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';

  function paintKpis() {
    var s = S.stats();
    var ps = S.products.list();
    var units = ps.reduce(function (a, p) { return a + (Number(p.stock) || 0); }, 0);
    var rows = [
      { c: '#c9a84c', i: IC.box, t: 'کل موجودی', v: fa(units), s: 'عدد در انبار' },
      { c: '#4caf50', i: IC.money, t: 'ارزش انبار', v: money(s.stockValue), s: 'به قیمت پایه' },
      { c: '#e8b552', i: IC.warn, t: 'رو به اتمام', v: fa(s.lowStock), s: 'نیاز به پر کردن' },
      { c: '#e57373', i: IC.x, t: 'تمام‌شده', v: fa(s.outOfStock), s: 'در بازار دیده نمی‌شوند' },
    ];
    $('#kpis').innerHTML = rows.map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');
  }

  function paintAlerts() {
    var low = S.products.lowStock();
    var out = S.products.outOfStock();
    var html = '';
    if (out.length) {
      html += '<div class="wp-note bad">' + IC.warn + '<div><b>' + fa(out.length) +
        ' کالا تمام شده:</b> ' + out.slice(0, 4).map(function (p) { return esc(p.name); }).join('، ') +
        (out.length > 4 ? ' و ' + fa(out.length - 4) + ' مورد دیگر' : '') + '</div></div>';
    }
    if (low.length) {
      html += '<div class="wp-note warn">' + IC.warn + '<div><b>' + fa(low.length) +
        ' کالا رو به اتمام است.</b> پیش از آنکه سفارشی از دست برود، انبار را پر کنید.</div></div>';
    }
    $('#alerts').innerHTML = html;
  }

  function paint() {
    paintKpis();
    paintAlerts();

    var list = S.products.list();
    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('کالایی نیست', 'اول از بخش «کالاهای عمده» کالا اضافه کنید.');
      $('#logBox').innerHTML = U.emptyBox('دفتر خالی است', '');
      return;
    }

    $('#box').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>کالا</th><th>موجودی</th><th>هشدار در</th><th>ارزش</th>' +
      '<th>تغییر</th><th></th></tr></thead><tbody>' +
      list.map(function (p) {
        var low = p.stock > 0 && p.stock <= (p.lowAt || p.moq * 3);
        var out = p.stock <= 0;
        return '<tr>' +
          '<td><b>' + esc(p.name) + '</b><span class="wp-tiny">کد ' + esc(p.code) + '</span></td>' +
          '<td class="num">' + (out
            ? '<span class="wp-tag bad">ناموجود</span>'
            : (low ? '<span class="wp-tag warn">' + fa(p.stock) + '</span>'
                   : '<span class="wp-tag ok">' + fa(p.stock) + '</span>')) + '</td>' +
          '<td class="num muted">' + fa(p.lowAt || p.moq * 3) + '</td>' +
          '<td class="num">' + money((Number(p.price) || 0) * (Number(p.stock) || 0)) + '</td>' +
          '<td><input class="wp-input adj" style="max-width:96px" inputmode="numeric" ' +
            'placeholder="±عدد" data-for="' + esc(p.id) + '" aria-label="تغییر موجودی" /></td>' +
          '<td><div class="wp-row-acts">' +
            '<button class="wp-btn wp-btn-gold wp-btn-sm" type="button" data-adj="' + esc(p.id) + '">ثبت</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table></div>';

    var log = S.products.stockLog(50);
    $('#logBox').innerHTML = log.length
      ? '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
        '<th>تاریخ</th><th>کالا</th><th>تغییر</th><th>پس از آن</th><th>علت</th>' +
        '</tr></thead><tbody>' +
        log.map(function (r) {
          return '<tr><td class="muted">' + esc(r.date) + '</td>' +
            '<td>' + esc(r.productName) + '</td>' +
            '<td class="num" style="color:' + (r.delta > 0 ? 'var(--wp-ok)' : 'var(--wp-bad)') + '">' +
              (r.delta > 0 ? '+' : '−') + fa(Math.abs(r.delta)) + '</td>' +
            '<td class="num">' + fa(r.after) + '</td>' +
            '<td class="muted">' + esc(r.reason) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : U.emptyBox('هنوز تغییری ثبت نشده', 'هر بار موجودی را کم یا زیاد کنید، اینجا ثبت می‌شود.');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-adj]');
    if (!b) return;
    var inp = document.querySelector('.adj[data-for="' + b.dataset.adj + '"]');
    if (!inp) return;
    var raw = toEn(inp.value).trim();
    if (!raw) { U.toast('عدد تغییر را بنویسید (مثلاً ۵۰ یا ‎-۱۰).', 'error'); return; }
    var d = Number(raw);
    if (!Number.isFinite(d) || d === 0) { U.toast('عدد نامعتبر است.', 'error'); return; }
    var why = prompt('علت تغییر؟', d > 0 ? 'ورود کالای تازه' : 'برداشت از انبار');
    if (why === null) return;
    try {
      var after = S.products.adjustStock(b.dataset.adj, d, why);
      U.toast('موجودی به ' + fa(after) + ' رسید.', 'success');
      inp.value = '';
      paint();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, ''


# ════════════════════════════════════════════════════════════
#  ۶. مشتریان
# ════════════════════════════════════════════════════════════
def buyers():
    body = '''    <div class="wp-note">
      ''' + ico(I['info']) + '''
      <div><b>مشتریان عمده خودکار از سفارش‌ها ساخته می‌شوند.</b>
        می‌توانید برای هرکدام یادداشت و سقف اعتبار بگذارید تا در معامله‌های بعدی
        یادتان بماند با چه کسی طرف‌اید.</div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>مشتریان عمده</h2>
        <span class="sub spacer" id="count">—</span>
      </div>
      <div id="box"></div>
    </div>'''

    modals = '''<div class="wp-modal" id="bModal" role="dialog" aria-modal="true" aria-label="یادداشت مشتری">
  <div class="wp-modal-card" style="width:min(520px,100%)">
    ''' + CLOSE_X + '''
    <h2 id="bTitle">یادداشت مشتری</h2>
    <form id="bForm" novalidate>
      <input type="hidden" id="bKey" />
      <div class="wp-grid">
        <div class="wp-field">
          <label for="bTag">برچسب</label>
          <select class="wp-input" id="bTag">
            <option value="">بدون برچسب</option>
            <option value="vip">مشتری ویژه</option>
            <option value="regular">مشتری دائمی</option>
            <option value="new">تازه‌وارد</option>
            <option value="risk">نیازمند احتیاط</option>
          </select>
        </div>
        <div class="wp-field">
          <label for="bCredit">سقف اعتبار (تومان)</label>
          <input class="wp-input" id="bCredit" inputmode="numeric" placeholder="۰ یعنی بدون اعتبار" />
        </div>
        <div class="wp-field full">
          <label for="bNote">یادداشت</label>
          <textarea class="wp-input" id="bNote" rows="4"
            placeholder="شرایط پرداخت، ترجیح‌ها، نکته‌های مهم…"></textarea>
        </div>
      </div>
      <div class="wp-modal-foot">
        <button class="wp-btn wp-btn-gold" type="submit">ذخیره</button>
        <button class="wp-btn wp-btn-ghost" type="button" data-wp-close>انصراف</button>
      </div>
    </form>
  </div>
</div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money;
  var $ = function (s) { return document.querySelector(s); };

  var TAG = {
    vip:     { fa: 'مشتری ویژه', cls: 'gold' },
    regular: { fa: 'دائمی', cls: 'ok' },
    new:     { fa: 'تازه‌وارد', cls: 'info' },
    risk:    { fa: 'احتیاط', cls: 'bad' },
  };

  function paint() {
    var list = S.buyers.list();
    $('#count').textContent = fa(list.length) + ' مشتری';

    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('هنوز مشتری‌ای نیست',
        'با نخستین سفارش، مشتری خودکار اینجا ثبت می‌شود.');
      return;
    }

    $('#box').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>مشتری</th><th>سفارش</th><th>خرید کل</th><th>پرداختی</th>' +
      '<th>مانده</th><th>آخرین خرید</th><th></th></tr></thead><tbody>' +
      list.map(function (b) {
        var due = Math.max(0, b.total - b.paid);
        var t = TAG[b.tag];
        return '<tr>' +
          '<td><b>' + esc(b.name) + '</b>' +
            (t ? ' <span class="wp-tag ' + t.cls + '">' + t.fa + '</span>' : '') +
            '<span class="wp-tiny">' +
              (b.company ? esc(b.company) + ' · ' : '') + esc(b.phone || '—') + '</span>' +
            (b.note ? '<span class="wp-tiny" style="color:var(--wp-gold-l)">' +
              esc(b.note.slice(0, 60)) + '</span>' : '') + '</td>' +
          '<td class="num">' + fa(b.orders) + '</td>' +
          '<td class="num">' + money(b.total) + '</td>' +
          '<td class="num">' + money(b.paid) + '</td>' +
          '<td class="num">' + (due
            ? '<span style="color:var(--wp-bad)">' + money(due) + '</span>' +
              (b.credit ? '<span class="wp-tiny">سقف ' + money(b.credit) + '</span>' : '')
            : '<span class="wp-tag ok">تسویه</span>') + '</td>' +
          '<td class="muted">' + esc(b.lastDate || '—') + '</td>' +
          '<td><button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-note="' +
            esc(b.key) + '">یادداشت</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-note]');
    if (!b) return;
    var key = b.dataset.note;
    var rec = S.buyers.list().find(function (x) { return x.key === key; });
    if (!rec) return;
    $('#bTitle').textContent = 'یادداشت — ' + rec.name;
    $('#bKey').value = key;
    $('#bTag').value = rec.tag || '';
    $('#bCredit').value = rec.credit ? fa(rec.credit) : '';
    $('#bNote').value = rec.note || '';
    U.openModal('#bModal');
  });

  $('#bForm').addEventListener('submit', function (e) {
    e.preventDefault();
    S.buyers.setNote($('#bKey').value, {
      tag: $('#bTag').value,
      credit: $('#bCredit').value,
      note: $('#bNote').value,
    });
    U.closeModal($('#bModal'));
    U.toast('یادداشت ذخیره شد.', 'success');
    paint();
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, modals


# ════════════════════════════════════════════════════════════
#  ۷. گزارش‌ها
# ════════════════════════════════════════════════════════════
def reports():
    body = '''    <div class="wp-kpis" id="kpis"></div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>درآمد ماهانه</h2>
        <span class="sub spacer" id="chartSum">—</span>
      </div>
      <div class="wp-chart" id="chart"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>کارنامه‌ی استعلام‌ها</h2>
        <span class="sub spacer">سرعت و کیفیت پاسخ شما</span>
      </div>
      <div id="rfqStats"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>کالاها بر پایه‌ی فروش</h2>
        <button class="wp-btn wp-btn-ghost wp-btn-sm spacer" type="button" id="csvBtn">
          دریافت CSV
        </button>
      </div>
      <div id="prodBox"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>بهترین مشتریان</h2>
        <span class="sub spacer">بر پایه‌ی مبلغ خرید</span>
      </div>
      <div id="buyerBox"></div>
    </div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, money = S.money;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';

  function paint() {
    var s = S.stats();

    $('#kpis').innerHTML = [
      { c: '#c9a84c', i: IC.money, t: 'درآمد کل', v: money(s.revenue), s: fa(s.orders) + ' سفارش' },
      { c: '#4caf50', i: IC.check, t: 'نرخ تبدیل استعلام', v: '٪' + fa(s.rfqWin), s: 'از پاسخ به سفارش' },
      { c: '#7a96c8', i: IC.quote, t: 'نرخ پاسخ‌گویی', v: '٪' + fa(s.rfqRate), s: fa(s.rfq) + ' استعلام' },
      { c: '#c0c0c0', i: IC.users, t: 'مشتریان', v: fa(s.buyers), s: 'میانگین ' + money(s.avgOrder) },
    ].map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');

    /* نمودار */
    var data = S.chart();
    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);
    $('#chartSum').textContent = total ? 'جمع ' + money(total) + ' تومان' : 'هنوز فروشی نبوده';
    $('#chart').innerHTML = data.map(function (d) {
      var h = Math.max(4, Math.round(d.value / max * 100));
      return '<div class="wp-bar-col"><div class="wp-bar' +
        (d.value === max && max > 1 ? ' peak' : '') + '" style="--h:' + h + '%" title="' +
        esc(d.label) + ' — ' + money(d.value) + ' (' + fa(d.count) + ' سفارش)"></div>' +
        '<span class="wp-bar-lbl">' + esc(d.label) + '</span></div>';
    }).join('');

    /* استعلام‌ها */
    var rs = S.rfq.list();
    if (!rs.length) {
      $('#rfqStats').innerHTML = U.emptyBox('استعلامی نبوده', '');
    } else {
      var byStatus = {};
      rs.forEach(function (r) { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
      $('#rfqStats').innerHTML = '<div class="wp-tier-view">' +
        Object.keys(S.rfq.STATUS_FA).map(function (k) {
          var n = byStatus[k] || 0;
          return '<div class="wp-tier-cell' + (k === 'accepted' && n ? ' best' : '') + '">' +
            '<span>' + S.rfq.STATUS_FA[k] + '</span><b>' + fa(n) + '</b>' +
            '<small>٪' + fa(rs.length ? Math.round(n / rs.length * 100) : 0) + '</small></div>';
        }).join('') + '</div>';
    }

    /* کالاها */
    var ps = S.products.list().slice().sort(function (a, b) { return (b.sold || 0) - (a.sold || 0); });
    $('#prodBox').innerHTML = ps.length
      ? '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
        '<th>کالا</th><th>فروش</th><th>موجودی</th><th>قیمت پایه</th>' +
        '<th>درآمد تخمینی</th></tr></thead><tbody>' +
        ps.map(function (p) {
          return '<tr><td><b>' + esc(p.name) + '</b><span class="wp-tiny">کد ' +
              esc(p.code) + '</span></td>' +
            '<td class="num">' + fa(p.sold || 0) + '</td>' +
            '<td class="num">' + fa(p.stock) + '</td>' +
            '<td class="num">' + money(p.price) + '</td>' +
            '<td class="num">' + money((p.sold || 0) * (p.price || 0)) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : U.emptyBox('کالایی نیست', '');

    /* مشتریان */
    var bs = S.buyers.list().slice(0, 10);
    $('#buyerBox').innerHTML = bs.length
      ? '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
        '<th>مشتری</th><th>سفارش</th><th>خرید کل</th><th>سهم</th></tr></thead><tbody>' +
        bs.map(function (b) {
          var share = s.revenue ? Math.round(b.total / s.revenue * 100) : 0;
          return '<tr><td><b>' + esc(b.name) + '</b>' +
              (b.company ? '<span class="wp-tiny">' + esc(b.company) + '</span>' : '') + '</td>' +
            '<td class="num">' + fa(b.orders) + '</td>' +
            '<td class="num">' + money(b.total) + '</td>' +
            '<td class="num">٪' + fa(share) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : U.emptyBox('مشتری‌ای نیست', '');
  }

  $('#csvBtn').addEventListener('click', function () {
    var ps = S.products.list();
    if (!ps.length) { U.toast('کالایی برای دریافت نیست.', 'error'); return; }
    var rows = [['کد', 'نام', 'قیمت پایه', 'حداقل سفارش', 'موجودی', 'فروش'].join(',')];
    ps.forEach(function (p) {
      rows.push([p.code, '"' + String(p.name).replace(/"/g, '""') + '"',
                 p.price, p.moq, p.stock, p.sold || 0].join(','));
    });
    var blob = new Blob(['\\uFEFF' + rows.join('\\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'digipoosh-wholesale-products.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    U.toast('فایل CSV دریافت شد.', 'success');
  });

  document.addEventListener('dpw:change', paint);
  paint();
});'''
    return body, script, ''


# ════════════════════════════════════════════════════════════
#  ۸. پروفایل کسب‌وکار
# ════════════════════════════════════════════════════════════
def profile():
    body = '''    <div id="statusNote"></div>
    <div id="modBox"></div>

    <form id="pForm" novalidate>

      <div class="wp-card">
        <div class="wp-card-head">
          <h2>هویت کسب‌وکار</h2>
          <span class="sub spacer">این اطلاعات به خریداران عمده نشان داده می‌شود</span>
        </div>
        <div class="wp-grid">
          <div class="wp-field">
            <label for="storeName">نام تجاری / برند <span class="req">*</span></label>
            <input class="wp-input" id="storeName" />
          </div>
          <div class="wp-field">
            <label for="companyName">نام شرکت / کارگاه</label>
            <input class="wp-input" id="companyName" />
          </div>
          <div class="wp-field">
            <label for="city">شهر</label>
            <input class="wp-input" id="city" />
          </div>
          <div class="wp-field">
            <label for="warehouse">شهر انبار</label>
            <input class="wp-input" id="warehouse" placeholder="اگر با دفتر فرق دارد" />
          </div>
          <div class="wp-field full">
            <label for="address">نشانی</label>
            <input class="wp-input" id="address" />
          </div>
          <div class="wp-field full">
            <label for="description">معرفی کسب‌وکار</label>
            <textarea class="wp-input" id="description" rows="4"
              placeholder="چه می‌سازید، چه ظرفیتی دارید، چه چیزی شما را متمایز می‌کند…"></textarea>
          </div>
        </div>
      </div>

      <div class="wp-card">
        <div class="wp-card-head">
          <h2>اطلاعات حقوقی</h2>
          <span class="sub spacer">برای اعتماد خریداران و صدور فاکتور رسمی</span>
        </div>
        <div class="wp-grid">
          <div class="wp-field">
            <label for="economicCode">کد اقتصادی</label>
            <input class="wp-input" id="economicCode" inputmode="numeric" />
          </div>
          <div class="wp-field">
            <label for="regNumber">شماره‌ی ثبت</label>
            <input class="wp-input" id="regNumber" inputmode="numeric" />
          </div>
          <div class="wp-field">
            <label for="nationalId">کد ملی مدیر</label>
            <input class="wp-input" id="nationalId" inputmode="numeric" />
          </div>
          <div class="wp-field">
            <label for="phone">تلفن تماس</label>
            <input class="wp-input" id="phone" inputmode="tel" />
          </div>
        </div>
      </div>

      <div class="wp-card">
        <div class="wp-card-head">
          <h2>قواعد فروش عمده</h2>
          <span class="sub spacer">پیش‌فرض‌هایی که به خریدار نشان داده می‌شود</span>
        </div>
        <div class="wp-grid">
          <div class="wp-field">
            <label for="minOrderValue">حداقل مبلغ سفارش (تومان)</label>
            <input class="wp-input" id="minOrderValue" inputmode="numeric" />
            <span class="wp-hint">صفر یعنی محدودیتی نیست.</span>
          </div>
          <div class="wp-field">
            <label for="leadTime">زمان آماده‌سازی پیش‌فرض (روز)</label>
            <input class="wp-input" id="leadTime" inputmode="numeric" />
          </div>
          <div class="wp-field full">
            <label class="wp-field" style="flex-direction:row;align-items:center;gap:9px">
              <input type="checkbox" id="acceptsRfq" style="accent-color:var(--wp-gold);width:17px;height:17px" />
              <span style="color:var(--wp-ink);font-weight:600">استعلام قیمت می‌پذیرم</span>
            </label>
            <span class="wp-hint">اگر خاموش باشد، دکمه‌ی «استعلام» روی کالاهای شما نشان داده نمی‌شود.</span>
          </div>
        </div>
      </div>

      <div class="wp-card">
        <div class="wp-card-head">
          <h2>اطلاعات مالی</h2>
          <span class="sub spacer">برای واریز درآمد</span>
        </div>
        <div class="wp-grid">
          <div class="wp-field full">
            <label for="shaba">شماره‌ی شبا</label>
            <input class="wp-input" id="shaba" placeholder="IR..." dir="ltr" />
          </div>
        </div>
      </div>

      <button class="wp-btn wp-btn-gold" type="submit">''' + ico(I['save']) + ''' ذخیره‌ی تغییرات</button>
    </form>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var fa = S.fa, toEn = S.toEn;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';

  var FIELDS = ['storeName', 'companyName', 'city', 'warehouse', 'address', 'description',
                'economicCode', 'regNumber', 'nationalId', 'phone', 'shaba'];
  var NUMS = ['minOrderValue', 'leadTime'];

  function load() {
    var p = S.profile();
    if (!p) return;

    FIELDS.forEach(function (f) {
      var el = $('#' + f);
      if (el) el.value = p[f] || '';
    });
    NUMS.forEach(function (f) {
      var el = $('#' + f);
      if (el) el.value = p[f] ? fa(p[f]) : '';
    });
    $('#acceptsRfq').checked = p.acceptsRfq !== false;

    var ST = {
      approved: { cls: 'ok', i: IC.check, t: 'کسب‌وکار شما تأیید شده است.',
                  b: 'کالاهایتان در بازار عمده دیده می‌شوند و می‌توانید استعلام بگیرید.' },
      pending:  { cls: 'warn', i: IC.clock, t: 'در انتظار تأیید مدیر.',
                  b: 'می‌توانید کالا ثبت کنید، ولی تا تأیید نشوید در بازار دیده نمی‌شوند. ' +
                     'بررسی معمولاً ۲۴ تا ۴۸ ساعت کاری طول می‌کشد.' },
      rejected: { cls: 'bad', i: IC.x, t: 'درخواست شما رد شد.',
                  b: p.rejectionReason || 'برای جزئیات با پشتیبانی تماس بگیرید.' },
      suspended:{ cls: 'bad', i: IC.warn, t: 'حساب شما معلق شده است.',
                  b: 'با پشتیبانی تماس بگیرید.' },
    };
    var st = ST[p.status || 'pending'] || ST.pending;
    $('#statusNote').innerHTML = '<div class="wp-note ' + st.cls + '">' + st.i +
      '<div><b>' + st.t + '</b> ' + esc(st.b) + '</div></div>';

    paintModeration();
  }

  $('#pForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#storeName').value.trim();
    if (!name) { U.toast('نام تجاری الزامی است.', 'error'); return; }

    var id = S.me();
    if (!id) { U.toast('ابتدا وارد شوید.', 'error'); return; }

    /* همه‌ی مقدارها یک‌جا جمع می‌شوند */
    var patch = {};
    FIELDS.forEach(function (f) {
      var el = $('#' + f);
      if (el) patch[f] = el.value.trim();
    });
    NUMS.forEach(function (f) {
      var el = $('#' + f);
      if (el) patch[f] = Math.max(0, Number(toEn(el.value).replace(/[^\\d]/g, '')) || 0);
    });
    patch.acceptsRfq = $('#acceptsRfq').checked;

    /* ---------- نظارت مدیر ----------
       میدان‌های حساس (نام تجاری، کد اقتصادی، شبا و…) مستقیم
       ذخیره نمی‌شوند؛ به کارتابل مدیر می‌روند. بقیه همان
       لحظه ثبت می‌شوند. */
    if (window.DPModeration) {
      try {
        var res = DPModeration.submit(id, patch);

        if (res.queued.length) {
          U.toast(fa(res.queued.length) + ' تغییر برای بررسی مدیر فرستاده شد: ' +
                  res.queued.join('، '), 'success');
        }
        if (res.instant.length && !res.queued.length) {
          U.toast('اطلاعات ذخیره شد.', 'success');
        }
        if (!res.queued.length && !res.instant.length) {
          U.toast('تغییری برای ذخیره نبود.', 'success');
        }
        load();
        return;
      } catch (err) {
        U.toast(err.message, 'error');
        return;
      }
    }

    /* اگر موتور نظارت نبود، مستقیم ذخیره می‌شود */
    var all = S.read('dp_users', []);
    var i = all.findIndex(function (u) { return u.id === id; });
    if (i < 0) { U.toast('حساب پیدا نشد.', 'error'); return; }
    Object.keys(patch).forEach(function (k) { all[i][k] = patch[k]; });
    all[i].sellerType = 'wholesale';
    S.write('dp_users', all);
    U.toast('اطلاعات ذخیره شد.', 'success');
    load();
  });

  /* ---------- وضعیت درخواست‌های در انتظار ---------- */
  function paintModeration() {
    var box = $('#modBox');
    if (!box || !window.DPModeration) return;

    var id = S.me();
    var pend = DPModeration.pendingOf(id);
    var hist = DPModeration.mine(id).filter(function (r) {
      return r.status !== 'pending';
    }).slice(0, 4);

    var out = '';

    if (pend) {
      var keys = Object.keys(pend.fields);
      out += '<div class="wp-note warn">' + IC.clock + '<div>' +
        '<b>' + fa(keys.length) + ' تغییر در انتظار تأیید مدیر است.</b> ' +
        'تا تأیید نشوند، نسخه‌ی قبلی به خریداران نشان داده می‌شود.' +
        '<div class="mod-pend-list">' +
          keys.map(function (k) {
            var w = DPModeration.WATCHED[k] || { fa: k };
            return '<span class="mod-pill">' + esc(w.fa) + '</span>';
          }).join('') +
        '</div>' +
        '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" ' +
          'data-withdraw="' + esc(pend.id) + '" style="margin-top:10px">' +
          'پس گرفتن درخواست</button>' +
        '</div></div>';
    }

    if (hist.length) {
      out += '<div class="wp-card"><div class="wp-card-head">' +
        '<h2>تاریخچه‌ی بازبینی</h2>' +
        '<span class="sub spacer">آخرین تصمیم‌های مدیر</span></div>' +
        hist.map(function (r) {
          var okCls = r.status === 'approved' ? 'ok' : 'bad';
          var lbl = r.status === 'approved' ? 'تأیید شد' : 'رد شد';
          return '<div class="mod-hist">' +
            '<span class="wp-tag ' + okCls + '">' + lbl + '</span>' +
            '<span class="mod-hist-fields">' +
              Object.keys(r.fields).map(function (k) {
                var w = DPModeration.WATCHED[k] || { fa: k };
                return esc(w.fa);
              }).join('، ') + '</span>' +
            '<span class="mod-hist-date">' + esc(r.date) + '</span>' +
            (r.reason ? '<div class="mod-hist-why">' + esc(r.reason) + '</div>' : '') +
          '</div>';
        }).join('') + '</div>';
    }

    box.innerHTML = out;
  }

  document.addEventListener('click', function (e) {
    var wd = e.target.closest('[data-withdraw]');
    if (!wd) return;
    if (!confirm('این درخواست پس گرفته شود؟')) return;
    try {
      DPModeration.withdraw(wd.dataset.withdraw, S.me());
      U.toast('درخواست پس گرفته شد.', 'success');
      load();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  load();
});'''
    return body, script, ''


# ════════════════════════════════════════════════════════════
#  ۹. نردبان و برجسته‌سازی
# ════════════════════════════════════════════════════════════
def boost():
    body = '''    <div class="wp-note">
      ''' + ico(I['info']) + '''
      <div><b>این نردبان فقط در «بازار عمده‌فروشان» کار می‌کند.</b>
        ویترین اصلی سایت (زنانه، مردانه، بچگانه، نوجوان) جای تک‌فروشان است
        و بسته‌های اینجا هیچ اثری آنجا ندارند. خریداران شما حرفه‌ای‌اند،
        پس این بسته‌ها روی دیده شدن در جست‌وجوی بازار عمده تمرکز دارند.</div>
    </div>

    <div id="trialNote"></div>

    <div class="wp-kpis" id="kpis"></div>

    <div class="wp-card" id="liveCard" hidden>
      <div class="wp-card-head">
        <h2>بسته‌های فعال شما</h2>
        <span class="sub spacer">هم‌اکنون در بازار عمده اثر دارند</span>
      </div>
      <div id="liveBox"></div>
    </div>

    <div class="wp-card" id="perfCard" hidden>
      <div class="wp-card-head">
        <h2>کارایی بسته‌ها</h2>
        <span class="sub spacer">۱۴ روز اخیر</span>
      </div>
      <div id="perfBox"></div>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>انتخاب بسته</h2>
        <span class="sub spacer">هرچه بالاتر، دیده شدن بیشتر</span>
      </div>

      <div class="wp-plan-grid" id="planGrid"></div>

      <form id="bForm" novalidate style="margin-top:20px">
        <div class="wp-grid">
          <div class="wp-field">
            <label for="bPlan">بسته</label>
            <select class="wp-input" id="bPlan"></select>
          </div>
          <div class="wp-field">
            <label for="bDays">مدت</label>
            <select class="wp-input" id="bDays"></select>
          </div>
          <div class="wp-field full">
            <label for="bNote">یادداشت (اختیاری)</label>
            <input class="wp-input" id="bNote" placeholder="مثلاً: شماره پیگیری واریز" />
          </div>
        </div>

        <div id="planHint"></div>

        <div class="wp-calc" id="calc"></div>

        <button class="wp-btn wp-btn-gold" type="submit" id="bBtn" style="margin-top:16px">
          ''' + ico(I['bolt']) + ''' <span id="bBtnTxt">فعال‌سازی بسته</span>
        </button>
      </form>
    </div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>تاریخچه</h2>
        <span class="sub spacer" id="hCount">—</span>
      </div>
      <div id="histBox"></div>
    </div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, B = window.DPWBoost, esc = U.esc;
  if (!B) { U.toast('موتور نردبان بارگذاری نشد.', 'error'); return; }
  var fa = B.fa, money = B.money;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';

  var ART = {
    ladder:    '<path d="M7 21V5M17 21V5"/><path d="M7 8h10M7 12.5h10M7 17h10"/>',
    highlight: '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    featured:  '<path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    hero:      '<path d="m4 17 1.5-9 4 4L12 5l2.5 7 4-4L20 17z"/><path d="M4.5 20h15"/>',
  };
  var SWX = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true";'
    .replace(';', '');

  /* ---------- کارت‌های بسته ---------- */
  function paintPlans() {
    var g = $('#planGrid'), sel = $('#bPlan');
    g.innerHTML = ''; sel.innerHTML = '';
    var active = {};
    B.activeOf().forEach(function (r) { active[r.plan] = r; });

    Object.keys(B.PLANS).forEach(function (k) {
      var p = B.PLANS[k];
      var busy = p.exclusive && !B.slotFree(k);
      var owned = !!active[k];

      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'wp-plan' + (busy ? ' is-busy' : '') + (owned ? ' is-owned' : '');
      card.dataset.plan = k;
      card.style.setProperty('--pc', p.color);

      card.innerHTML =
        (owned ? '<span class="wp-plan-flag own">فعال است</span>'
               : (busy ? '<span class="wp-plan-flag busy">اشغال</span>' : '')) +
        '<span class="wp-plan-head">' +
          '<span class="wp-plan-ico"><svg viewBox="0 0 24 24" ' + SWX + '>' +
            (ART[k] || '') + '</svg></span>' +
          '<span class="wp-plan-name"><strong>' + esc(p.fa) + '</strong>' +
            '<em>' + esc(p.tone) + '</em></span>' +
        '</span>' +
        '<span class="wp-plan-power" title="قدرت دیده شدن">' +
          '<span class="wp-plan-track"><i style="width:' + p.weight + '%"></i></span>' +
          '<b>' + fa(p.weight) + '</b></span>' +
        '<ul class="wp-plan-perks">' +
          p.perks.map(function (x) {
            return '<li><svg viewBox="0 0 24 24" ' + SWX +
              '><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' + esc(x) + '</li>';
          }).join('') +
        '</ul>' +
        (busy
          ? '<span class="wp-plan-busy">در اختیار تأمین‌کننده‌ی دیگری — <b>' +
            fa(B.slotFreeIn(k)) + '</b> روز دیگر آزاد می‌شود</span>'
          : '<span class="wp-plan-price">' + (B.FREE_TRIAL
              ? '<b class="free">رایگان</b><small class="strike">' +
                money(p.price) + ' / روز</small>'
              : '<b>از ' + money(p.price) + '</b><small>تومان / روز</small>') + '</span>');

      g.appendChild(card);

      var o = document.createElement('option');
      o.value = k; o.textContent = p.fa;
      sel.appendChild(o);
    });

    g.addEventListener('click', function (e) {
      var c = e.target.closest('.wp-plan');
      if (!c) return;
      sel.value = c.dataset.plan;
      sel.dispatchEvent(new Event('change'));
    });
  }

  function markPlan() {
    var v = $('#bPlan').value;
    document.querySelectorAll('.wp-plan').forEach(function (c) {
      c.classList.toggle('on', c.dataset.plan === v);
    });
    var p = B.PLANS[v];
    var hint = $('#planHint');
    if (p && p.exclusive) {
      var free = B.slotFree(v);
      hint.innerHTML = '<div class="wp-note ' + (free ? 'ok' : 'warn') + '">' +
        (free ? IC.check : IC.clock) + '<div>' +
        (free
          ? '<b>این جایگاه آزاد است.</b> بنر شما بالای بازار عمده، پیش از همه‌ی کالاها، ' +
            'با نمایش قیمت پلکانی دیده می‌شود.'
          : '<b>این جایگاه اکنون اشغال است.</b> ' + fa(B.slotFreeIn(v)) +
            ' روز دیگر آزاد می‌شود.') + '</div></div>';
    } else {
      hint.innerHTML = '';
    }
  }

  function paintDays() {
    var p = B.PLANS[$('#bPlan').value];
    var sel = $('#bDays');
    sel.innerHTML = '';
    (p ? p.days : [7]).forEach(function (d) {
      var o = document.createElement('option');
      o.value = d; o.textContent = fa(d) + ' روز';
      sel.appendChild(o);
    });
  }

  function calc() {
    try {
      var q = B.quote($('#bPlan').value, $('#bDays').value);
      $('#calc').innerHTML = q.free
        ? '<div class="wp-calc-row"><span>ارزش این بسته</span>' +
          '<b class="strike">' + money(q.listGross) + ' تومان</b></div>' +
          '<div class="wp-calc-row total"><span>مبلغ پرداختی شما</span>' +
          '<b class="free">رایگان</b></div>'
        : '<div class="wp-calc-row"><span>هزینه‌ی پایه</span><b>' + money(q.gross) + '</b></div>' +
          (q.offPercent
            ? '<div class="wp-calc-row"><span>تخفیف بلندمدت ٪' + fa(q.offPercent) +
              '</span><b class="minus">−' + money(q.discount) + '</b></div>' : '') +
          '<div class="wp-calc-row"><span>هزینه‌ی هر روز</span><b>' + money(q.perDay) + '</b></div>' +
          '<div class="wp-calc-row total"><span>مبلغ پرداختی</span><b>' +
            money(q.total) + ' تومان</b></div>';
    } catch (e) { $('#calc').innerHTML = ''; }
  }

  /* ---------- آمار ---------- */
  function paintKpis() {
    var s = B.summary();
    var rows = [
      { c: '#c9a84c', i: IC.bolt, t: 'بسته‌های فعال', v: fa(s.active),
        s: s.active ? 'در حال نمایش' : 'بسته‌ای فعال نیست' },
      { c: '#7a96c8', i: IC.box, t: 'بازدید', v: fa(s.views), s: 'در بازار عمده' },
      { c: '#4caf50', i: IC.quote, t: 'استعلام از نردبان', v: fa(s.rfqs),
        s: 'نرخ کلیک ٪' + fa(s.ctr) },
      B.FREE_TRIAL
        ? { c: '#d4b85a', i: IC.money, t: 'صرفه‌جویی', v: money(s.saved), s: 'در دوره‌ی آزمایشی' }
        : { c: '#d4b85a', i: IC.money, t: 'هزینه', v: money(s.spent), s: fa(s.days) + ' روز' },
    ];
    $('#kpis').innerHTML = rows.map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');
  }

  function paintTrial() {
    $('#trialNote').innerHTML = B.FREE_TRIAL
      ? '<div class="wp-note ok">' + IC.check + '<div><b>دوره‌ی آزمایشی رایگان.</b> ' +
        'همه‌ی بسته‌ها بدون پرداخت فعال می‌شوند تا نتیجه‌شان را ببینید.</div></div>'
      : '';
  }

  function paintLive() {
    var list = B.activeOf();
    $('#liveCard').hidden = !list.length;
    if (!list.length) return;

    $('#liveBox').innerHTML = list.map(function (r) {
      var p = B.PLANS[r.plan] || {};
      var left = B.daysLeft(r);
      var pct = Math.max(0, Math.min(100, Math.round(left / r.days * 100)));
      return '<div class="wp-live" style="--pc:' + (p.color || '#c9a84c') + '">' +
        '<div class="wp-live-head">' +
          '<strong>' + esc(p.fa || r.plan) + '</strong>' +
          '<span class="wp-tag gold">' +
            (B.timeLeft && B.timeLeft(r) ? B.timeLeft(r).fa + ' مانده'
                                         : fa(left) + ' روز مانده') + '</span></div>' +
        (r.endDateTime || r.endDate
          ? '<div class="wp-live-until">پایان: <b>' +
            esc(r.endDateTime || r.endDate) + '</b></div>' : '') +
        '<div class="wp-live-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="wp-live-foot">' +
          '<span>' + fa(r.views || 0) + ' بازدید · ' + fa(r.clicks || 0) + ' کلیک · ' +
            fa(r.rfqs || 0) + ' استعلام</span>' +
          '<span class="wp-row-acts">' +
            '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-renew="' +
              esc(r.id) + '" data-plan="' + esc(r.plan) + '">تمدید</button>' +
            '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-stop="' +
              esc(r.id) + '">پایان</button>' +
          '</span></div>' +
        (left <= 2 ? '<div class="wp-note warn" style="margin:10px 0 0">' + IC.warn +
          '<div>کمتر از ' + fa(left + 1) + ' روز مانده — برای قطع نشدن تمدید کنید.</div></div>' : '') +
      '</div>';
    }).join('');
  }

  function paintPerf() {
    var list = B.mine().filter(function (r) { return (r.views || 0) > 0; }).slice(0, 3);
    $('#perfCard').hidden = !list.length;
    if (!list.length) return;

    $('#perfBox').innerHTML = list.map(function (r) {
      var p = B.PLANS[r.plan] || {};
      var ins = B.insight(r);
      var series = ins.series.slice(-14);
      var max = 1;
      series.forEach(function (d) { if (d.v > max) max = d.v; });

      var bars = series.length
        ? series.map(function (d) {
            var h = Math.max(4, Math.round(d.v / max * 100));
            return '<span class="wp-spark" style="--h:' + h + '%" title="' +
              esc(d.day) + ' — ' + fa(d.v) + ' بازدید"></span>';
          }).join('')
        : '<span style="font-size:12px;color:var(--wp-dim)">هنوز داده‌ای نیست</span>';

      var arrow = ins.trend > 5 ? '↑' : ins.trend < -5 ? '↓' : '→';
      var tc = ins.trend > 5 ? 'var(--wp-ok)' : ins.trend < -5 ? 'var(--wp-bad)' : 'var(--wp-gray)';

      return '<div class="wp-live" style="--pc:' + (p.color || '#c9a84c') + '">' +
        '<div class="wp-live-head"><strong>' + esc(p.fa || r.plan) + '</strong>' +
          '<span style="color:' + tc + ';font-weight:700;font-size:12.5px">' +
          arrow + ' ٪' + fa(Math.abs(ins.trend)) + '</span></div>' +
        '<div class="wp-sparkline">' + bars + '</div>' +
        '<div class="wp-live-foot" style="gap:14px;flex-wrap:wrap">' +
          '<span><b style="color:var(--wp-gold-l)">' + fa(ins.views) + '</b> بازدید</span>' +
          '<span><b style="color:var(--wp-gold-l)">' + fa(ins.clicks) + '</b> کلیک</span>' +
          '<span><b style="color:var(--wp-gold-l)">' + fa(ins.rfqs) + '</b> استعلام</span>' +
          '<span><b style="color:var(--wp-gold-l)">٪' + fa(ins.ctr) + '</b> نرخ کلیک</span>' +
          '<span><b style="color:var(--wp-gold-l)">' + fa(ins.perDay) + '</b> روزانه</span>' +
        '</div></div>';
    }).join('');
  }

  function paintHist() {
    var list = B.mine();
    $('#hCount').textContent = list.length ? fa(list.length) + ' سفارش' : '—';
    if (!list.length) {
      $('#histBox').innerHTML = U.emptyBox('هنوز بسته‌ای نخریده‌اید',
        'با نخستین بسته، کالاهایتان بالاتر دیده می‌شوند.');
      return;
    }
    var C = { awaiting: 'warn', active: 'ok', expired: 'mute', rejected: 'bad', paused: 'warn' };
    $('#histBox').innerHTML = '<div class="wp-table-wrap"><table class="wp-table"><thead><tr>' +
      '<th>بسته</th><th>مدت</th><th>مبلغ</th><th>بازدید</th><th>وضعیت</th><th>تاریخ</th><th></th>' +
      '</tr></thead><tbody>' +
      list.map(function (r) {
        var p = B.PLANS[r.plan] || {};
        var st = B.live(r) ? 'active' : r.status;
        return '<tr><td><b>' + esc(p.fa || r.plan) + '</b></td>' +
          '<td class="num">' + fa(r.days) + ' روز' +
            (r.renewals ? '<span class="wp-tiny">' + fa(r.renewals) + ' بار تمدید</span>' : '') + '</td>' +
          '<td class="num">' + (r.price ? money(r.price) + ' تومان'
            : (r.trial ? '<span class="wp-tag ok">آزمایشی</span>' : 'رایگان')) + '</td>' +
          '<td class="num">' + fa(r.views || 0) +
            '<span class="wp-tiny">' + fa(r.rfqs || 0) + ' استعلام</span></td>' +
          '<td><span class="wp-tag ' + (C[st] || 'mute') + '">' +
            (B.STATUS_FA[st] || st) + '</span></td>' +
          '<td class="muted">' + esc(r.date) + '</td>' +
          '<td>' + (r.status === 'awaiting'
            ? '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-cancel="' +
              esc(r.id) + '">لغو</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- رویدادها ---------- */
  $('#bPlan').addEventListener('change', function () { markPlan(); paintDays(); calc(); });
  $('#bDays').addEventListener('change', calc);

  $('#bForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      B.order($('#bPlan').value, $('#bDays').value, $('#bNote').value);
      $('#bNote').value = '';
      U.toast(B.FREE_TRIAL
        ? 'بسته فعال شد — از حالا در بازار عمده بالاتر دیده می‌شوید.'
        : 'سفارش ثبت شد. پس از تأیید مدیر فعال می‌شود.', 'success');
      all();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  document.addEventListener('click', function (e) {
    var rn = e.target.closest('[data-renew]');
    if (rn) {
      var pl = B.PLANS[rn.dataset.plan] || { days: [7] };
      var ans = prompt('چند روز تمدید شود؟ (' + pl.days.join(' یا ') + ')', String(pl.days[0]));
      if (ans === null) return;
      var d = Number(String(ans).replace(/[۰-۹]/g, function (x) {
        return '۰۱۲۳۴۵۶۷۸۹'.indexOf(x);
      }));
      try { B.renew(rn.dataset.renew, d); U.toast('بسته ' + fa(d) + ' روز تمدید شد.', 'success'); all(); }
      catch (err) { U.toast(err.message, 'error'); }
      return;
    }
    var sp = e.target.closest('[data-stop]');
    if (sp) {
      if (!confirm('این بسته همین حالا پایان یابد؟')) return;
      try { B.stop(sp.dataset.stop); U.toast('بسته پایان یافت.', 'success'); all(); }
      catch (err) { U.toast(err.message, 'error'); }
      return;
    }
    var cn = e.target.closest('[data-cancel]');
    if (cn) {
      if (!confirm('این سفارش لغو شود؟')) return;
      try { B.cancel(cn.dataset.cancel); U.toast('سفارش لغو شد.', 'success'); all(); }
      catch (err) { U.toast(err.message, 'error'); }
    }
  });

  function all() {
    paintTrial(); paintKpis(); paintLive(); paintPerf(); paintHist();
    paintPlans(); markPlan();
  }

  document.addEventListener('dpw:boost', all);

  paintPlans(); markPlan(); paintDays(); calc();
  paintTrial(); paintKpis(); paintLive(); paintPerf(); paintHist();
  $('#bBtnTxt').textContent = B.FREE_TRIAL ? 'فعال‌سازی رایگان بسته' : 'ثبت سفارش';
});'''
    return body, script, ''


# ════════════════════════════════════════════════════════════
#  ۱۰. نظرهای خریداران
# ════════════════════════════════════════════════════════════
def reviews():
    body = '''    <div class="wp-note">
      ''' + ico(I['info']) + '''
      <div><b>نظر خریداران عمده اعتبار شما را می‌سازد.</b>
        پاسخ دادن به نظر — به‌ویژه نظر منفی — نشان می‌دهد پاسخ‌گو هستید.
        اگر نظری توهین‌آمیز یا نادرست بود، به مدیر گزارش بدهید.</div>
    </div>

    <div class="wp-kpis" id="kpis"></div>

    <div class="wp-card">
      <div class="wp-card-head">
        <h2>نظرها</h2>
        <div class="wp-seg spacer" id="filter" role="tablist">
          <button class="on" type="button" data-f="">همه</button>
          <button type="button" data-f="noreply">بی‌پاسخ</button>
          <button type="button" data-f="low">امتیاز پایین</button>
          <button type="button" data-f="flagged">گزارش‌شده</button>
        </div>
      </div>
      <div id="box"></div>
    </div>'''

    modals = '''<div class="wp-modal" id="rModal" role="dialog" aria-modal="true" aria-label="پاسخ به نظر">
  <div class="wp-modal-card" style="width:min(540px,100%)">
    ''' + CLOSE_X + '''
    <h2 id="rTitle">پاسخ به نظر</h2>
    <div id="rQuote"></div>
    <form id="rForm" novalidate>
      <input type="hidden" id="rId" />
      <div class="wp-field">
        <label for="rText">پاسخ شما</label>
        <textarea class="wp-input" id="rText" rows="4"
          placeholder="محترمانه و کوتاه — این پاسخ برای همه دیده می‌شود."></textarea>
        <span class="wp-hint">پاسخ خوب به نظر منفی، بیشتر از ده نظر مثبت ارزش دارد.</span>
      </div>
      <div class="wp-modal-foot">
        <button class="wp-btn wp-btn-gold" type="submit">ثبت پاسخ</button>
        <button class="wp-btn wp-btn-ghost" type="button" data-wp-close>انصراف</button>
      </div>
    </form>
  </div>
</div>'''

    script = '''
requireWholesale(function () {
  var S = DPWStore, U = DPWUi, esc = U.esc;
  var V = window.DPReviews;
  var fa = S.fa;
  var $ = function (s) { return document.querySelector(s); };
  var IC = ''' + _js_icons() + ''';
  var filter = '';

  if (!V) {
    $('#box').innerHTML = U.emptyBox('سامانه‌ی نظرها بارگذاری نشد', '');
    return;
  }

  var STAR = 'm12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z';

  function stars(n) {
    var out = '<span class="wp-stars">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="wp-star' + (i <= n ? ' on' : '') + '" viewBox="0 0 24 24" ' +
        'aria-hidden="true"><path d="' + STAR + '"/></svg>';
    }
    return out + '</span>';
  }

  function all() {
    var id = S.me();
    try { return V.forSeller(id) || []; } catch (e) { return []; }
  }

  function paintKpis() {
    var list = all();
    var n = list.length;
    var sum = list.reduce(function (a, r) { return a + (Number(r.rating) || 0); }, 0);
    var avg = n ? Math.round(sum / n * 10) / 10 : 0;
    var noReply = list.filter(function (r) { return !r.reply; }).length;
    var low = list.filter(function (r) { return r.rating <= 2; }).length;

    var rows = [
      { c: '#c9a84c', i: IC.quote, t: 'همه‌ی نظرها', v: fa(n),
        s: n ? 'میانگین ' + fa(avg) + ' از ۵' : 'هنوز نظری نیست' },
      { c: '#4caf50', i: IC.check, t: 'پاسخ داده‌شده', v: fa(n - noReply),
        s: n ? '٪' + fa(Math.round((n - noReply) / n * 100)) + ' نرخ پاسخ' : '—' },
      { c: '#e8b552', i: IC.warn, t: 'بی‌پاسخ', v: fa(noReply),
        s: noReply ? 'نیازمند توجه' : 'همه پاسخ داده شده' },
      { c: '#e57373', i: IC.x, t: 'امتیاز پایین', v: fa(low),
        s: '۱ و ۲ ستاره' },
    ];
    $('#kpis').innerHTML = rows.map(function (r) {
      return '<div class="wp-kpi" style="--kc:' + r.c + '">' +
        '<div class="wp-kpi-top">' + r.i + '<span>' + r.t + '</span></div>' +
        '<b>' + r.v + '</b><small>' + r.s + '</small></div>';
    }).join('');
  }

  function paint() {
    paintKpis();
    var list = all();

    if (filter === 'noreply') list = list.filter(function (r) { return !r.reply; });
    else if (filter === 'low') list = list.filter(function (r) { return r.rating <= 2; });
    else if (filter === 'flagged') list = list.filter(function (r) { return r.flagged; });

    if (!list.length) {
      $('#box').innerHTML = U.emptyBox('نظری نیست',
        'وقتی خریداری نظر بگذارد، اینجا می‌بینید و می‌توانید پاسخ بدهید.');
      return;
    }

    $('#box').innerHTML = list.map(function (r) {
      return '<div class="wp-rev' + (r.rating <= 2 ? ' is-low' : '') + '">' +
        '<div class="wp-rev-top">' +
          '<strong>' + esc(r.userName || 'خریدار') + '</strong>' +
          stars(Math.round(r.rating)) +
          '<span class="wp-rev-about">' + esc(r.about || '') + '</span>' +
          '<time>' + esc(r.date || '') + '</time>' +
        '</div>' +

        (r.text
          ? '<p class="wp-rev-txt">' + esc(r.text) + '</p>'
          : '<p class="wp-rev-txt dim">— بدون متن —</p>') +

        (r.reply
          ? '<div class="wp-rev-reply"><b>پاسخ شما:</b> ' + esc(r.reply) + '</div>'
          : '') +

        (r.flagged
          ? '<div class="wp-note warn" style="margin:10px 0 0">' + IC.warn +
            '<div>گزارش شده: ' + esc(r.flagReason || '') +
            (r.reviewed ? ' — مدیر بررسی کرد.' : ' — در انتظار بررسی مدیر.') +
            '</div></div>'
          : '') +

        '<div class="wp-row-acts" style="margin-top:11px">' +
          '<button class="wp-btn wp-btn-ghost wp-btn-sm" type="button" data-reply="' +
            esc(r.id) + '">' + (r.reply ? 'ویرایش پاسخ' : 'پاسخ بدهید') + '</button>' +
          (r.reply
            ? '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-unreply="' +
              esc(r.id) + '">حذف پاسخ</button>' : '') +
          (!r.flagged
            ? '<button class="wp-btn wp-btn-bad wp-btn-sm" type="button" data-flag="' +
              esc(r.id) + '">گزارش به مدیر</button>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var rp = e.target.closest('[data-reply]');
    if (rp) {
      var r = all().find(function (x) { return x.id === rp.dataset.reply; });
      if (!r) return;
      $('#rId').value = r.id;
      $('#rText').value = r.reply || '';
      $('#rQuote').innerHTML = '<div class="wp-note" style="margin-bottom:14px"><div>' +
        '<b>' + esc(r.userName || 'خریدار') + '</b> — ' + fa(r.rating) + ' ستاره<br>' +
        esc(r.text || '— بدون متن —') + '</div></div>';
      U.openModal('#rModal');
      return;
    }

    var un = e.target.closest('[data-unreply]');
    if (un) {
      if (!confirm('پاسخ شما حذف شود؟')) return;
      try { V.unreply(un.dataset.unreply); U.toast('پاسخ حذف شد.', 'success'); paint(); }
      catch (err) { U.toast(err.message, 'error'); }
      return;
    }

    var fl = e.target.closest('[data-flag]');
    if (fl) {
      var why = prompt('چرا این نظر را گزارش می‌کنید؟');
      if (why === null) return;
      try { V.flag(fl.dataset.flag, why); U.toast('گزارش برای مدیر فرستاده شد.', 'success'); paint(); }
      catch (err) { U.toast(err.message, 'error'); }
    }
  });

  $('#rForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#rText').value.trim();
    if (t.length < 3) { U.toast('پاسخ را بنویسید.', 'error'); return; }
    try {
      V.reply($('#rId').value, t);
      U.closeModal($('#rModal'));
      U.toast('پاسخ شما ثبت شد.', 'success');
      paint();
    } catch (err) { U.toast(err.message, 'error'); }
  });

  $('#filter').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (!b) return;
    [].slice.call(this.children).forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    filter = b.dataset.f;
    paint();
  });

  try { V.markSeen(S.me()); } catch (e) { /* بی‌اهمیت */ }
  paint();
});'''
    return body, script, modals


# ════════════════════════════════════════════════════════════
#  آیکون‌های مشترک برای جاوااسکریپت
# ════════════════════════════════════════════════════════════
def _js_icons():
    keys = ['box', 'money', 'quote', 'truck', 'users', 'chart',
            'warn', 'check', 'x', 'info', 'clock', 'store', 'bolt']
    parts = []
    for k in keys:
        d = I[k].replace("'", "\\'")
        parts.append(f"{k}: '<svg viewBox=\"0 0 24 24\" {SW}>{d}</svg>'")
    return '{ ' + ', '.join(parts) + ' }'


# ════════════════════════════════════════════════════════════
PAGES = [
    ('wholesale-dashboard.html', 'میزکار', 'نمای کلی کسب‌وکار عمده‌ی شما', dashboard),
    ('wholesale-products.html', 'کالاهای عمده', 'قیمت پلکانی و حداقل سفارش', products),
    ('wholesale-rfq.html', 'استعلام‌ها', 'درخواست‌های قیمت خریداران', rfq),
    ('wholesale-orders.html', 'سفارش‌ها', 'از ثبت تا تحویل', orders),
    ('wholesale-inventory.html', 'انبار', 'موجودی و دفتر تغییرات', inventory),
    ('wholesale-buyers.html', 'مشتریان', 'خریداران عمده و سابقه‌شان', buyers),
    ('wholesale-reports.html', 'گزارش‌ها', 'کارنامه‌ی فروش و استعلام', reports),
    ('wholesale-boost.html', 'نردبان بازار', 'دیده شدن بیشتر در بازار عمده', boost),
    ('wholesale-reviews.html', 'نظرها', 'بازخورد خریداران عمده', reviews),
    ('wholesale-profile.html', 'پروفایل کسب‌وکار', 'هویت، قواعد و اطلاعات مالی', profile),
]


def build_all(build):
    for name, title, sub, fn in PAGES:
        body, script, modals = fn()
        build(name, title, sub, body, script, '', modals)
