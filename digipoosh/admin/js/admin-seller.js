/* ============================================================
   دیجی‌پوش — پرونده‌ی کامل یک فروشگاه (پنل مدیریت)
   ------------------------------------------------------------
   این صفحه با نشانی `admin-seller.html?id=…` باز می‌شود.
   مدیر اینجا همه‌چیزِ یک فروشنده را می‌بیند و می‌تواند
   تغییرش دهد:

     نمای کلی · کالاها · کد تخفیف · تخفیف‌ها ·
     سفارش‌ها · نظرها · نردبان · مالی · یادداشت · اختیارها

   هر تغییر در «دفترچه‌ی رویدادها» ثبت می‌شود.
   ============================================================ */
'use strict';

(function () {

  /* ---------- آیکون‌های خطی (بدون ایموجی) ---------- */
  var SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"'
          + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  function svg(path, cls) {
    return '<svg class="' + (cls || 'ico') + '" ' + SVG + '>' + path + '</svg>';
  }

  var P = {
    box:    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    ticket: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h14a1.5 1.5 0 0 1 1.5 1.5v2a2 2 0 0 0 0 3.9v2.1A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5v-2.1a2 2 0 0 0 0-3.9z"/><path d="M14 7v11" stroke-dasharray="2 2"/>',
    percent:'<path d="m6 18 12-12"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    list:   '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    chat:   '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    rocket: '<path d="M13.5 3.5c3 0 6 3 6 6 0 4.5-5 8-5 8l-4-4s3.5-5 8-5"/><path d="M9.5 14.5 6 18l-1.5-1.5L8 13"/><path d="M5 19l-1.5 1.5"/>',
    wallet: '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.5 12.5h4"/><circle cx="16.8" cy="12.5" r="1"/>',
    note:   '<path d="M6 3.5h9L19.5 8v12.5h-13z"/><path d="M14.5 3.5V8h5"/><path d="M9 12.5h6M9 16h4"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
    grid:   '<rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/>',
    back:   '<path d="M14 6l6 6-6 6"/><path d="M20 12H4"/>',
    star:   '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    trash:  '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7.5 7.5 20h9l1-12.5"/>',
    power:  '<path d="M12 4v8"/><path d="M7.5 6.6a7 7 0 1 0 9 0"/>',
    eye:    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M4 4l16 16"/><path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.4 4.2"/><path d="M6.3 8A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.5"/>',
    save:   '<path d="M5 4.5h11L19.5 8v11.5h-15z"/><path d="M8 4.5v5h7v-5"/><path d="M8 19.5v-6h8v6"/>',
    phone:  '<path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 5 6.6 1.5 1.5 0 0 1 6.5 4z"/>',
    mail:   '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 6.8 8.4 6 8.4-6"/>',
    pin:    '<path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
    clock:  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    empty:  '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" stroke-dasharray="3 3"/>',
    check:  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x:      '<path d="M18 6 6 18M6 6l12 12"/>',
  };

  /* ---------- کمکی‌ها ---------- */
  var byId = function (i) { return document.getElementById(i); };

  var KIND_FA = {
    percent: 'درصدی', amount: 'مبلغ ثابت',
    ship: 'ارسال رایگان', gift: 'مزیت ویژه',
  };

  var OSTATUS = {
    pending:    { fa: 'در انتظار',   cls: 'b-warning' },
    processing: { fa: 'در حال آماده‌سازی', cls: 'b-info' },
    shipped:    { fa: 'ارسال‌شده',   cls: 'b-info' },
    delivered:  { fa: 'تحویل‌شده',   cls: 'b-success' },
    cancelled:  { fa: 'لغوشده',      cls: 'b-danger' },
    canceled:   { fa: 'لغوشده',      cls: 'b-danger' },
    paid:       { fa: 'پرداخت‌شده',  cls: 'b-success' },
  };

  var PSTATUS = {
    active:       { fa: 'فعال',      cls: 'b-success' },
    draft:        { fa: 'پیش‌نویس',  cls: 'b-gray' },
    out_of_stock: { fa: 'ناموجود',   cls: 'b-warning' },
    pending:      { fa: 'در انتظار', cls: 'b-warning' },
  };

  function stars(n) {
    var out = '<span class="sd-stars" role="img" aria-label="' + fa(n) + ' از ۵">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="' + (i <= n ? '' : 'off') + '" ' + SVG + '>' + P.star + '</svg>';
    }
    return out + '</span>';
  }

  function emptyBox(text) {
    return '<div class="sd-empty">' + svg(P.empty, '') + '<div>' + esc(text) + '</div></div>';
  }

  /* تاریخ میلادی ISO → شمسی خوانا */
  function faDate(iso) {
    if (!iso) return '—';
    try {
      var p = String(iso).split('-');
      var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
      return new Intl.DateTimeFormat('fa-IR').format(d);
    } catch (e) { return String(iso); }
  }

  function faStamp(ms) {
    if (!ms) return '—';
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(ms)); }
    catch (e) { return '—'; }
  }

  /* ============================================================
     نقطه‌ی شروع
     ============================================================ */
  var D = null;          /* پرونده‌ی بارگذاری‌شده */
  var SID = '';          /* شناسه‌ی فروشگاه */
  var TAB = 'over';      /* تب فعال */

  window.initSellerDetail = function () {
    requireAdmin(async function () {
      var q = new URLSearchParams(location.search);
      SID = q.get('id') || '';

      if (!SID) {
        byId('sdRoot').innerHTML = emptyBox(
          'شناسه‌ی فروشگاه در نشانی نیست. از فهرست فروشگاه‌ها روی «پرونده» بزنید.');
        return;
      }

      await reload();

      /* تب‌ها */
      document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-tab]');
        if (!t) return;
        TAB = t.dataset.tab;
        paintTabs();
      });

      /* همه‌ی کارها */
      document.addEventListener('click', onAction);
      document.addEventListener('input', onInput);
      document.addEventListener('change', onInput);
    });
  };

  async function reload() {
    D = await DPAdmin.detail.load(SID);
    if (!D) {
      byId('sdRoot').innerHTML = emptyBox('چنین فروشگاهی پیدا نشد.');
      return;
    }
    document.title = 'مدیریت دیجی‌پوش | ' + D.seller.storeName;
    var t = document.querySelector('.page-title');
    if (t) t.textContent = 'پرونده‌ی ' + D.seller.storeName;
    paintHero();
    paintTabs();
  }

  /* ============================================================
     سربرگ پرونده
     ============================================================ */
  function paintHero() {
    var s = D.seller, k = D.kpi;

    var badges = [statusBadge(s.status)];
    badges.push(s.sellerType === 'wholesale'
      ? '<span class="badge b-gold">عمده‌فروش</span>'
      : '<span class="badge b-mute">تک‌فروش</span>');
    if (s.reviewRequested) badges.push('<span class="badge b-info">درخواست بررسی</span>');
    if (k.boostsLive) badges.push('<span class="badge b-gold">نردبان فعال</span>');
    if (k.flagged) badges.push('<span class="badge b-danger">'
      + fa(k.flagged) + ' نظر گزارش‌شده</span>');

    var lim = DPAdmin.detail.limits(SID);
    if (lim.noCoupons) badges.push('<span class="badge b-danger">کد تخفیف ممنوع</span>');
    if (lim.noBoost)   badges.push('<span class="badge b-danger">نردبان ممنوع</span>');
    if (lim.maxDiscount) badges.push('<span class="badge b-gray">سقف تخفیف '
      + fa(lim.maxDiscount) + '٪</span>');

    var kpi = function (icon, label, value, note, cls) {
      return '<div class="sd-kpi ' + (cls || '') + '">'
        + '<div class="k">' + svg(icon, 'ico') + esc(label) + '</div>'
        + '<div class="v">' + value + '</div>'
        + (note ? '<div class="n">' + note + '</div>' : '') + '</div>';
    };

    byId('sdHero').innerHTML =
      '<div class="sd-cover">' + (s.cover
        ? '<img src="' + esc(s.cover) + '" alt="" />' : '') + '</div>'
      + '<div class="sd-headrow">'
      +   '<span class="sd-logo">' + (s.logo
            ? '<img src="' + esc(s.logo) + '" alt="" />'
            : esc(String(s.storeName || '؟')[0])) + '</span>'
      +   '<div class="sd-id">'
      +     '<h2>' + esc(s.storeName) + '</h2>'
      +     '<div class="sd-sub">'
      +       '<span>' + svg(P.mail) + esc(s.email || '—') + '</span>'
      +       '<span>' + svg(P.phone) + '<span class="num">' + esc(s.phone || '—') + '</span></span>'
      +       '<span>' + svg(P.pin) + esc(s.city || '—') + '</span>'
      +       '<span>' + svg(P.clock) + '<span class="num">' + esc(s.joinDate || '—') + '</span></span>'
      +     '</div>'
      +     '<div class="sd-badges">' + badges.join('') + '</div>'
      +   '</div>'
      +   '<div class="sd-quick">'
      +     '<a class="btn btn-secondary" href="admin-sellers.html">' + svg(P.back, 'ico ico-sm')
      +       ' بازگشت</a>'
      +     (s.status === 'approved'
          ? '<button class="btn btn-secondary" type="button" data-act="susp">تعلیق فروشگاه</button>'
          : '<button class="btn btn-success" type="button" data-act="approve">تأیید فروشگاه</button>')
      +   '</div>'
      + '</div>'
      + '<div class="sd-kpis">'
      +   kpi(P.box, 'کالاها', fa(k.active) + ' <small>از</small> ' + fa(k.products),
            fa(k.draft) + ' پیش‌نویس · ' + fa(k.outOfStock) + ' ناموجود')
      +   kpi(P.list, 'سفارش‌ها', fa(k.orders),
            fa(k.openOrders) + ' باز · ' + fa(k.cancelled) + ' لغوشده',
            k.openOrders ? 'warn' : '')
      +   kpi(P.wallet, 'فروش خالص', money(k.revenue) + ' <small>تومان</small>',
            'تحویل‌شده: ' + money(k.settled))
      +   kpi(P.percent, 'کمیسیون سایت', fa(s.commissionRate) + '٪',
            money(k.commission) + ' تومان از این فروشگاه')
      +   kpi(P.ticket, 'کد تخفیف', fa(k.couponsLive) + ' <small>فعال از</small> ' + fa(k.couponsAll),
            money(k.couponOff) + ' تومان تخفیف داده')
      +   kpi(P.star, 'رضایت', k.rating ? fa(k.rating) + ' <small>از ۵</small>' : '—',
            fa(k.reviews) + ' نظر ثبت‌شده', k.rating >= 4 ? 'good' : '')
      +   kpi(P.wallet, 'مانده‌ی قابل برداشت', money(k.balance) + ' <small>تومان</small>',
            'برداشت‌شده: ' + money(k.withdrawn))
      +   kpi(P.box, 'ارزش انبار', money(k.stockValue) + ' <small>تومان</small>',
            'قیمت × موجودی')
      + '</div>';
  }

  /* ============================================================
     تب‌ها
     ============================================================ */
  var TABS = [
    ['over',    'نمای کلی',   P.grid,    null],
    ['prod',    'کالاها',      P.box,     function () { return D.products.length; }],
    ['coupon',  'کد تخفیف',   P.ticket,  function () { return D.coupons.length; }],
    ['sale',    'تخفیف‌ها',    P.percent, function () { return D.sales.length; }],
    ['order',   'سفارش‌ها',    P.list,    function () { return D.orders.length; }],
    ['review',  'نظرها',       P.chat,    function () { return D.reviews.length; }],
    ['boost',   'نردبان',      P.rocket,  function () { return D.boosts.length; }],
    ['money',   'مالی',        P.wallet,  null],
    ['note',    'یادداشت',     P.note,    function () { return DPAdmin.detail.notes(SID).length; }],
    ['limit',   'اختیارها',    P.shield,  null],
  ];

  function paintTabs() {
    byId('sdTabs').innerHTML = TABS.map(function (t) {
      var n = t[3] ? t[3]() : 0;
      return '<button class="sd-tab' + (TAB === t[0] ? ' on' : '') + '" type="button"'
        + ' data-tab="' + t[0] + '" aria-pressed="' + (TAB === t[0]) + '">'
        + svg(t[2]) + '<span>' + t[1] + '</span>'
        + (n ? '<span class="cnt">' + fa(n) + '</span>' : '') + '</button>';
    }).join('');

    var v = {
      over: viewOver, prod: viewProducts, coupon: viewCoupons,
      sale: viewSales, order: viewOrders, review: viewReviews,
      boost: viewBoosts, money: viewMoney, note: viewNotes, limit: viewLimits,
    }[TAB];

    byId('sdBody').innerHTML = v ? v() : '';
  }

  /* ============================================================
     تب ۱ — نمای کلی
     ============================================================ */
  function viewOver() {
    var s = D.seller, k = D.kpi;

    var row = function (a, b) {
      return '<div class="info-row"><span class="k">' + a + '</span>'
        + '<span class="v">' + b + '</span></div>';
    };

    /* هشدارهایی که مدیر باید ببیند */
    var warn = [];
    if (k.outOfStock) warn.push(fa(k.outOfStock) + ' کالا ناموجود است.');
    if (k.openOrders) warn.push(fa(k.openOrders) + ' سفارش هنوز رسیدگی نشده.');
    if (k.flagged)    warn.push(fa(k.flagged) + ' نظر گزارش‌شده منتظر بررسی است.');
    if (k.draft === k.products && k.products)
      warn.push('همه‌ی کالاها پیش‌نویس‌اند — هیچ‌کدام روی سایت دیده نمی‌شوند.');
    if (!k.products) warn.push('این فروشگاه هنوز هیچ کالایی ثبت نکرده.');
    if (s.status === 'approved' && !s.shaba)
      warn.push('شماره شبا ثبت نشده — تسویه ممکن نیست.');

    return (warn.length
      ? '<div class="notice mb-18"><b>نکته‌های این پرونده</b><ul style="margin:8px 0 0;'
        + 'padding-inline-start:18px">'
        + warn.map(function (w) { return '<li style="list-style:disc">' + esc(w) + '</li>'; }).join('')
        + '</ul></div>'
      : '')

      + '<div class="card mb-18"><div class="card-head"><h2>شناسنامه‌ی فروشگاه</h2></div>'
      + row('نام مالک', esc(s.fullName || '—'))
      + row('ایمیل', esc(s.email || '—'))
      + row('تلفن', '<span class="num">' + esc(s.phone || '—') + '</span>')
      + row('دسته‌بندی', esc(CAT_FA[s.category] || '—'))
      + row('شهر', esc(s.city || '—'))
      + row('نشانی', esc(s.address || '—'))
      + row('کد ملی', '<span class="num">' + esc(s.nationalId || '—') + '</span>')
      + row('شماره شبا', '<span class="num">' + esc(s.shaba || '—') + '</span>')
      + row('توضیح فروشگاه', esc(s.description || '—'))
      + (s.sellerType === 'wholesale'
          ? row('نام شرکت', esc(s.companyName || '—'))
            + row('کد اقتصادی', '<span class="num">' + esc(s.economicCode || '—') + '</span>')
            + row('حداقل سفارش', money(s.minOrderValue) + ' تومان')
            + row('زمان آماده‌سازی', fa(s.leadTime) + ' روز')
          : '')
      + (s.rejectionReason
          ? row('دلیل رد', '<span style="color:var(--danger)">' + esc(s.rejectionReason) + '</span>')
          : '')
      + '</div>'

      + '<div class="card"><div class="card-head"><h2>کارهای سریع</h2></div>'
      + '<p style="margin-top:0;font-size:12.5px;color:var(--gray)">'
      + 'این دکمه‌ها روی همه‌ی کالاهای فروشگاه اثر می‌گذارند. با احتیاط بزنید.</p>'
      + '<div class="sd-actions" style="border:none;padding:0;margin:0">'
      +   '<button class="btn btn-secondary" type="button" data-act="comm">'
      +     'تغییر نرخ کمیسیون (اکنون ' + fa(s.commissionRate) + '٪)</button>'
      +   '<button class="btn btn-secondary" type="button" data-act="bulk-show">'
      +     'انتشار همه‌ی پیش‌نویس‌ها</button>'
      +   '<button class="btn btn-danger" type="button" data-act="bulk-hide">'
      +     'پنهان کردن همه‌ی کالاها</button>'
      + '</div></div>';
  }

  /* ============================================================
     تب ۲ — کالاها (ویرایش درجا)
     ============================================================ */
  function viewProducts() {
    if (!D.products.length) return emptyBox('این فروشگاه هنوز کالایی ثبت نکرده است.');

    var rows = D.products.map(function (p) {
      var img = (Array.isArray(p.images) && p.images[0]) || p.image || '';
      var st  = PSTATUS[p.status] || { fa: p.status, cls: 'b-gray' };
      return '<tr data-pid="' + esc(p.id) + '">'
        + '<td><div class="sd-prow"><span class="sd-thumb">'
        +   (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" />' : 'بدون عکس')
        +   '</span><div><div class="nm">' + esc(p.name || '—') + '</div>'
        +   '<div class="mt">' + esc(p.brand || '') + (p.brand ? ' · ' : '')
        +   esc(CAT_FA[p.section] || p.category || '') + '</div></div></div></td>'
        + '<td><input class="input sd-inline num" data-f="price" inputmode="numeric"'
        +   ' value="' + money(p.price) + '" aria-label="قیمت" /></td>'
        + '<td><input class="input sd-inline w-sm num" data-f="stock" inputmode="numeric"'
        +   ' value="' + fa(p.stock || 0) + '" aria-label="موجودی" /></td>'
        + '<td><select class="select sd-inline" data-f="status" aria-label="وضعیت">'
        +   ['active', 'draft', 'out_of_stock'].map(function (v) {
              return '<option value="' + v + '"' + (p.status === v ? ' selected' : '') + '>'
                + PSTATUS[v].fa + '</option>';
            }).join('')
        +   '</select></td>'
        + '<td><span class="badge ' + st.cls + '">' + st.fa + '</span></td>'
        + '<td class="num">' + fa(p.sales || 0) + '</td>'
        + '<td><div class="row-actions">'
        +   '<button class="sd-save" type="button" data-act="psave">'
        +     svg(P.save, 'ico ico-sm') + ' ذخیره</button>'
        +   '<button class="act no" type="button" data-act="pdel" title="حذف کالا">'
        +     svg(P.trash, 'ico ico-sm') + '</button>'
        + '</div></td></tr>';
    }).join('');

    return '<div class="notice-soft mb-18">' + svg(P.save, 'ico ico-sm')
      + '<span>قیمت، موجودی یا وضعیت را همین‌جا عوض کنید؛ دکمه‌ی «ذخیره» خودش ظاهر می‌شود. '
      + 'اگر موجودی صفر شود کالا خودکار «ناموجود» می‌شود و برعکس.</span></div>'
      + '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>'
      + '<th>کالا</th><th>قیمت (تومان)</th><th>موجودی</th><th>تغییر وضعیت</th>'
      + '<th>وضعیت کنونی</th><th>فروش</th><th>کارها</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ============================================================
     تب ۳ — کدهای تخفیف
     ============================================================ */
  function viewCoupons() {
    if (!D.coupons.length) {
      return emptyBox('این فروشگاه هیچ کد تخفیفی نساخته است.');
    }

    var cards = D.coupons.map(function (c) {
      var val = c.kind === 'percent' ? fa(c.value) + ' درصد'
        : c.kind === 'amount' ? money(c.value) + ' تومان'
        : c.kind === 'ship' ? 'ارسال رایگان'
        : esc(c.perk || 'مزیت ویژه');

      var pct = c.maxUses ? Math.min(100, Math.round(c.usedCount / c.maxUses * 100)) : 0;

      var cond = [];
      if (c.minAmount) cond.push('حداقل خرید ' + money(c.minAmount) + ' تومان');
      if (c.minQty)    cond.push('حداقل ' + fa(c.minQty) + ' کالا');
      if (c.maxOff)    cond.push('سقف تخفیف ' + money(c.maxOff) + ' تومان');
      if (c.firstOnly) cond.push('فقط نخستین خرید');
      if (c.scope === 'some') cond.push('فقط ' + fa(c.products.length) + ' کالای مشخص');
      cond.push('هر مشتری ' + fa(c.perUser) + ' بار');

      return '<div class="sd-code' + (c.isLive ? '' : ' dim') + '">'
        + '<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">'
        +   '<span class="cd">' + esc(c.code) + '</span>'
        +   '<span class="badge ' + (c.isLive ? 'b-success' : 'b-gray') + '">'
        +     (c.off ? 'خاموش' : c.isLive ? 'فعال' : 'خارج از بازه') + '</span>'
        +   '<span class="badge b-mute">' + (KIND_FA[c.kind] || c.kind) + '</span>'
        + '</div>'
        + '<div class="ttl">' + esc(c.title) + ' — ' + val + '</div>'
        + '<div class="desc">' + esc(cond.join(' · ')) + '</div>'
        + (c.maxUses
            ? '<div class="sd-meter"><i style="width:' + pct + '%"></i></div>'
              + '<div class="desc">' + fa(c.usedCount) + ' بار از ' + fa(c.maxUses)
              + ' استفاده شده</div>'
            : '<div class="desc" style="margin-top:9px">' + fa(c.usedCount)
              + ' بار استفاده شده — بدون سقف</div>')
        + '<div class="sd-facts">'
        +   '<div><b class="num">' + faDate(c.from) + '</b><span>شروع</span></div>'
        +   '<div><b class="num">' + faDate(c.to) + '</b><span>پایان</span></div>'
        +   '<div><b class="num">' + money(c.usedOff) + '</b><span>مجموع تخفیف (تومان)</span></div>'
        +   '<div><b class="num">' + fa(c.usedCount) + '</b><span>دفعات مصرف</span></div>'
        + '</div>'
        + (c.note ? '<div class="desc" style="margin-top:9px">یادداشت فروشنده: '
            + esc(c.note) + '</div>' : '')
        + '<div class="sd-actions">'
        +   '<button class="btn btn-secondary" type="button" data-act="cedit" data-id="'
        +     esc(c.id) + '">' + svg(P.save, 'ico ico-sm') + ' ویرایش</button>'
        +   '<button class="btn btn-secondary" type="button" data-act="ctog" data-id="'
        +     esc(c.id) + '">' + svg(P.power, 'ico ico-sm')
        +     (c.off ? ' روشن کن' : ' خاموش کن') + '</button>'
        +   '<button class="btn btn-danger" type="button" data-act="cdel" data-id="'
        +     esc(c.id) + '">' + svg(P.trash, 'ico ico-sm') + ' حذف</button>'
        + '</div></div>';
    }).join('');

    return '<div class="notice-soft mb-18">' + svg(P.ticket, 'ico ico-sm')
      + '<span>می‌توانید هر کدی را خاموش کنید تا دیگر کار نکند، یا مقدارش را عوض کنید. '
      + 'خودِ نوشته‌ی کد عوض نمی‌شود چون ممکن است مشتری‌ها جایی ذخیره‌اش کرده باشند.</span></div>'
      + '<div class="sd-codes">' + cards + '</div>';
  }

  /* ============================================================
     تب ۴ — تخفیف‌های خودکار
     ============================================================ */
  function viewSales() {
    if (!D.sales.length) return emptyBox('این فروشگاه تخفیف خودکاری تعریف نکرده است.');

    var rows = D.sales.map(function (r) {
      return '<tr>'
        + '<td><b>' + esc(r.title || 'تخفیف') + '</b></td>'
        + '<td class="num">' + fa(r.percent) + '٪</td>'
        + '<td>' + (r.scope === 'all' ? 'همه‌ی کالاها'
            : fa((r.products || []).length) + ' کالا') + '</td>'
        + '<td class="num">' + faDate(r.from) + '</td>'
        + '<td class="num">' + faDate(r.to) + '</td>'
        + '<td><span class="badge ' + (r.isLive ? 'b-success' : 'b-gray') + '">'
        +   (r.off ? 'خاموش' : r.isLive ? 'فعال' : 'خارج از بازه') + '</span></td>'
        + '<td><div class="row-actions">'
        +   '<button class="act" type="button" data-act="stog" data-id="' + esc(r.id)
        +     '" title="' + (r.off ? 'روشن کردن' : 'خاموش کردن') + '">'
        +     svg(P.power, 'ico ico-sm') + '</button>'
        +   '<button class="act no" type="button" data-act="sdel" data-id="' + esc(r.id)
        +     '" title="حذف">' + svg(P.trash, 'ico ico-sm') + '</button>'
        + '</div></td></tr>';
    }).join('');

    return '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>'
      + '<th>عنوان</th><th>درصد</th><th>دامنه</th><th>از</th><th>تا</th>'
      + '<th>وضعیت</th><th>کارها</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ============================================================
     تب ۵ — سفارش‌ها
     ============================================================ */
  function viewOrders() {
    if (!D.orders.length) return emptyBox('هنوز سفارشی برای این فروشگاه ثبت نشده است.');

    var rows = D.orders.map(function (o) {
      var st = OSTATUS[o.status] || { fa: o.status, cls: 'b-gray' };
      return '<tr>'
        + '<td><b class="num">' + esc(o.id) + '</b>'
        +   (o.couponCode
              ? '<div class="mt" style="font-size:11px;color:var(--gray)">کد: '
                + esc(o.couponCode) + '</div>' : '')
        + '</td>'
        + '<td>' + esc(o.customer || o.buyerName || '—') + '</td>'
        + '<td class="num">' + fa(o.count || (o.lines || []).length) + '</td>'
        + '<td class="num">' + money(o.total) + '</td>'
        + '<td class="num">' + (o.couponOff ? money(o.couponOff) : '—') + '</td>'
        + '<td class="num">' + esc(o.date || faStamp(o.at)) + '</td>'
        + '<td><span class="badge ' + st.cls + '">' + st.fa + '</span></td>'
        + '<td><select class="select sd-inline" data-act="ostat" data-id="' + esc(o.id)
        +   '" aria-label="تغییر وضعیت سفارش">'
        +   ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(function (v) {
              return '<option value="' + v + '"' + (o.status === v ? ' selected' : '') + '>'
                + OSTATUS[v].fa + '</option>';
            }).join('')
        +   '</select></td></tr>';
    }).join('');

    return '<div class="notice-soft mb-18">' + svg(P.list, 'ico ico-sm')
      + '<span>اگر بین مشتری و فروشنده اختلافی پیش آمد، می‌توانید وضعیت سفارش را '
      + 'خودتان اصلاح کنید. هر تغییر در دفترچه‌ی رویدادها ثبت می‌شود.</span></div>'
      + '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>'
      + '<th>شماره</th><th>مشتری</th><th>تعداد</th><th>مبلغ</th><th>تخفیف کد</th>'
      + '<th>تاریخ</th><th>وضعیت</th><th>تغییر وضعیت</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ============================================================
     تب ۶ — نظرها
     ============================================================ */
  function viewReviews() {
    if (!D.reviews.length) return emptyBox('هنوز نظری درباره‌ی این فروشگاه ثبت نشده است.');

    var rows = D.reviews.map(function (r) {
      return '<tr' + (r.hidden ? ' style="opacity:.6"' : '') + '>'
        + '<td>' + stars(Number(r.rating) || 0) + '</td>'
        + '<td>' + esc(r.kind === 'store' ? 'فروشگاه' : (r.targetName || 'کالا')) + '</td>'
        + '<td style="max-width:340px">' + esc(r.text || '—') + '</td>'
        + '<td>' + esc(r.userName || r.user || '—') + '</td>'
        + '<td class="num">' + esc(r.date || faStamp(r.at)) + '</td>'
        + '<td>' + (r.flagged && !r.hidden
            ? '<span class="badge b-danger">گزارش‌شده</span>'
            : r.hidden ? '<span class="badge b-gray">پنهان</span>'
            : '<span class="badge b-success">نمایان</span>') + '</td>'
        + '<td><button class="act" type="button" data-act="rtog" data-id="' + esc(r.id)
        +   '" title="' + (r.hidden ? 'آشکار کردن' : 'پنهان کردن') + '">'
        +   svg(r.hidden ? P.eye : P.eyeoff, 'ico ico-sm') + '</button></td></tr>';
    }).join('');

    return '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>'
      + '<th>امتیاز</th><th>درباره‌ی</th><th>متن</th><th>نویسنده</th><th>تاریخ</th>'
      + '<th>وضعیت</th><th>کارها</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ============================================================
     تب ۷ — نردبان
     ============================================================ */
  function viewBoosts() {
    if (!D.boosts.length) return emptyBox('این فروشگاه بسته‌ی نردبانی نگرفته است.');

    var rows = D.boosts.map(function (b) {
      return '<tr>'
        + '<td><b>' + esc(b.planName || b.plan || '—') + '</b></td>'
        + '<td class="num">' + money(b.price || 0) + '</td>'
        + '<td class="num">' + faStamp(b.startsAt) + '</td>'
        + '<td class="num">' + faStamp(b.endsAt) + '</td>'
        + '<td>' + (b.isLive
            ? '<span class="badge b-success">در حال اجرا</span>'
            : b.status === 'awaiting'
              ? '<span class="badge b-warning">منتظر پرداخت</span>'
              : '<span class="badge b-gray">' + esc(b.status || '—') + '</span>') + '</td>'
        + '<td>' + (b.isLive
            ? '<button class="btn btn-danger" type="button" data-act="bstop" data-id="'
              + esc(b.id) + '">پایان دادن</button>'
            : '—') + '</td></tr>';
    }).join('');

    return '<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>'
      + '<th>بسته</th><th>مبلغ</th><th>شروع</th><th>پایان</th><th>وضعیت</th>'
      + '<th>کارها</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ============================================================
     تب ۸ — مالی
     ============================================================ */
  function viewMoney() {
    var k = D.kpi, s = D.seller;

    var line = function (label, value, note, strong) {
      return '<div class="info-row"><span class="k">' + esc(label)
        + (note ? '<br><small style="color:var(--gray)">' + esc(note) + '</small>' : '')
        + '</span><span class="v num"' + (strong ? ' style="font-weight:800"' : '') + '>'
        + value + '</span></div>';
    };

    var pay = D.payouts.length
      ? '<div class="table-wrap"><table class="tbl"><thead><tr>'
        + '<th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>'
        + D.payouts.map(function (w) {
            return '<tr><td class="num">' + esc(w.date || '—') + '</td>'
              + '<td class="num">' + money(w.amount) + '</td>'
              + '<td><span class="badge ' + (w.status === 'paid' ? 'b-success' : 'b-warning')
              + '">' + (w.status === 'paid' ? 'پرداخت‌شده' : 'در انتظار') + '</span></td></tr>';
          }).join('')
        + '</tbody></table></div>'
      : emptyBox('هنوز درخواست برداشتی ثبت نشده است.');

    return '<div class="card mb-18"><div class="card-head"><h2>صورت‌حساب فروشگاه</h2></div>'
      + line('فروش ناخالص', money(k.revenue) + ' تومان',
             'همه‌ی سفارش‌های لغونشده')
      + line('فروش قطعی', money(k.settled) + ' تومان',
             'فقط سفارش‌های تحویل‌شده — پایه‌ی محاسبه‌ی کمیسیون')
      + line('نرخ کمیسیون', fa(s.commissionRate) + '٪',
             'اختصاصی همین فروشگاه')
      + line('سهم سایت', money(k.commission) + ' تومان', '')
      + line('تخفیف داده‌شده با کد', money(k.couponOff) + ' تومان',
             'از جیب فروشنده، نه سایت')
      + line('برداشت‌شده', money(k.withdrawn) + ' تومان', '')
      + line('مانده‌ی قابل برداشت', money(k.balance) + ' تومان',
             'فروش قطعی منهای کمیسیون و برداشت‌ها', true)
      + '<div class="sd-actions">'
      +   '<button class="btn btn-secondary" type="button" data-act="comm">'
      +     'تغییر نرخ کمیسیون</button></div>'
      + '</div>'
      + '<div class="card"><div class="card-head"><h2>تاریخچه‌ی برداشت</h2></div>'
      + pay + '</div>';
  }

  /* ============================================================
     تب ۹ — یادداشت خصوصی
     ============================================================ */
  function viewNotes() {
    var list = DPAdmin.detail.notes(SID);

    return '<div class="card mb-18"><div class="card-head"><h2>یادداشت تازه</h2></div>'
      + '<p style="margin-top:0;font-size:12.5px;color:var(--gray)">'
      + 'فروشنده این یادداشت‌ها را نمی‌بیند. برای ثبت نکته‌های داخلی است — '
      + 'مثلاً «تماس گرفته شد، قول داد مدارک را بفرستد».</p>'
      + '<div class="field"><label for="ntText">متن یادداشت</label>'
      + '<textarea class="textarea" id="ntText" maxlength="500"'
      + ' placeholder="چه چیزی باید یادمان بماند؟"></textarea></div>'
      + '<button class="btn btn-primary" type="button" data-act="nadd">ثبت یادداشت</button>'
      + '</div>'
      + '<div class="card"><div class="card-head"><h2>یادداشت‌های پیشین</h2></div>'
      + (list.length
          ? list.map(function (n) {
              return '<div class="sd-note"><div class="tx">' + esc(n.text)
                + '<div class="dt num">' + esc(n.date) + '</div></div>'
                + '<button class="act no" type="button" data-act="ndel" data-at="' + n.at
                + '" title="حذف یادداشت">' + svg(P.trash, 'ico ico-sm') + '</button></div>';
            }).join('')
          : emptyBox('هنوز یادداشتی ثبت نشده است.'))
      + '</div>';
  }

  /* ============================================================
     تب ۱۰ — سقف اختیار فروشنده
     ============================================================ */
  function viewLimits() {
    var L = DPAdmin.detail.limits(SID);

    return '<div class="notice mb-18"><b>این بخش قدرت فروشنده را محدود می‌کند</b>'
      + '<p style="margin:6px 0 0;font-size:12.5px">اگر فروشگاهی سابقه‌ی خوبی ندارد، '
      + 'می‌توانید جلوی کارهایش را بگیرید. عدد صفر یعنی «بدون محدودیت».</p></div>'

      + '<div class="card"><div class="sd-lims">'

      + '<div class="sd-lim"><h4>بیشترین درصد تخفیف</h4>'
      + '<p>فروشنده نمی‌تواند تخفیفی بیشتر از این درصد بگذارد.</p>'
      + '<input class="input num" id="limDisc" inputmode="numeric" value="'
      +   fa(L.maxDiscount) + '" aria-label="بیشترین درصد تخفیف" /></div>'

      + '<div class="sd-lim"><h4>بیشترین تعداد کالا</h4>'
      + '<p>سقف تعداد کالایی که می‌تواند ثبت کند. اکنون '
      +   fa(D.kpi.products) + ' کالا دارد.</p>'
      + '<input class="input num" id="limProd" inputmode="numeric" value="'
      +   fa(L.maxProducts) + '" aria-label="بیشترین تعداد کالا" /></div>'

      + '<div class="sd-lim"><h4>اجازه‌ی ساخت کد تخفیف</h4>'
      + '<p>اگر بردارید، دیگر نمی‌تواند کد تازه بسازد. کدهای موجود دست‌نخورده می‌مانند.</p>'
      + '<label class="sd-switch"><input type="checkbox" id="limCpn"'
      +   (L.noCoupons ? '' : ' checked') + ' /><span>اجازه دارد</span></label></div>'

      + '<div class="sd-lim"><h4>اجازه‌ی خرید نردبان</h4>'
      + '<p>اگر بردارید، نمی‌تواند بسته‌ی برجسته‌سازی بگیرد.</p>'
      + '<label class="sd-switch"><input type="checkbox" id="limBst"'
      +   (L.noBoost ? '' : ' checked') + ' /><span>اجازه دارد</span></label></div>'

      + '</div>'
      + '<div class="sd-actions">'
      + '<button class="btn btn-primary" type="button" data-act="limsave">'
      +   svg(P.save, 'ico ico-sm') + ' ذخیره‌ی اختیارها</button></div>'
      + '</div>';
  }

  /* ============================================================
     ورودی‌ها — دکمه‌ی ذخیره وقتی ظاهر می‌شود که چیزی عوض شود
     ============================================================ */
  function onInput(e) {
    var f = e.target.closest('[data-f]');
    if (f) {
      /* جداکننده‌ی هزارگان زنده روی قیمت */
      if (f.dataset.f === 'price' && e.type === 'input') {
        var pos = f.selectionStart;
        var before = f.value.length;
        var raw = toEn(f.value).replace(/[^\d]/g, '');
        f.value = raw ? money(raw) : '';
        var after = f.value.length;
        try { f.setSelectionRange(pos + (after - before), pos + (after - before)); }
        catch (err) { /* بعضی فیلدها انتخاب ندارند */ }
      }
      var tr = f.closest('tr');
      if (tr) {
        f.classList.add('dirty');
        var btn = tr.querySelector('[data-act="psave"]');
        if (btn) btn.classList.add('show');
      }
      return;
    }

    /* تغییر وضعیت سفارش با فهرست بازشو */
    var os = e.target.closest('[data-act="ostat"]');
    if (os && e.type === 'change') {
      DPAdmin.detail.setOrderStatus(SID, os.dataset.id, os.value)
        .then(function () { toast('وضعیت سفارش تغییر کرد.', 'success'); return reload(); })
        .catch(function (err) { toast(err.message, 'error'); });
    }
  }

  /* ============================================================
     کارها
     ============================================================ */
  async function onAction(e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT') return;
    var a = b.dataset.act;

    try {
      /* ---------- فروشگاه ---------- */
      if (a === 'approve') {
        var r = await DPAdmin.sellers.setStatus(SID, 'approved');
        toast(r && r.published
          ? 'فروشگاه تأیید شد و ' + fa(r.published) + ' کالا منتشر شد.'
          : 'فروشگاه تأیید شد.', 'success');
        return reload();
      }

      if (a === 'susp') {
        if (!confirm('فروشگاه معلق شود؟ همه‌ی کالاهایش از سایت برداشته می‌شوند.')) return;
        await DPAdmin.sellers.setStatus(SID, 'suspended');
        toast('فروشگاه معلق شد.', 'warning');
        return reload();
      }

      if (a === 'comm') {
        byId('cRate').value = fa(D.seller.commissionRate);
        return openModal('cModal');
      }

      /* ---------- کالاها ---------- */
      if (a === 'bulk-hide') {
        if (!confirm('همه‌ی کالاهای این فروشگاه پنهان شوند؟')) return;
        var n1 = await DPAdmin.detail.bulkProducts(SID, 'hide');
        toast(fa(n1) + ' کالا پنهان شد.', 'warning');
        return reload();
      }

      if (a === 'bulk-show') {
        var n2 = await DPAdmin.detail.bulkProducts(SID, 'show');
        toast(fa(n2) + ' کالا منتشر شد.', 'success');
        return reload();
      }

      if (a === 'psave') {
        var tr = b.closest('tr');
        var pid = tr.dataset.pid;
        var g = function (f) {
          var el = tr.querySelector('[data-f="' + f + '"]');
          return el ? el.value : null;
        };
        await DPAdmin.detail.saveProduct(SID, pid, {
          price:  Number(toEn(g('price')).replace(/[^\d]/g, '')),
          stock:  Number(toEn(g('stock')).replace(/[^\d]/g, '')),
          status: g('status'),
        });
        toast('کالا به‌روزرسانی شد.', 'success');
        return reload();
      }

      if (a === 'pdel') {
        var row = b.closest('tr');
        if (!confirm('این کالا برای همیشه حذف شود؟')) return;
        await DPAdmin.detail.removeProduct(SID, row.dataset.pid);
        toast('کالا حذف شد.', 'success');
        return reload();
      }

      /* ---------- کد تخفیف ---------- */
      if (a === 'ctog') {
        var on = DPAdmin.detail.toggleCoupon(b.dataset.id);
        toast(on ? 'کد روشن شد.' : 'کد خاموش شد.', on ? 'success' : 'warning');
        return reload();
      }

      if (a === 'cdel') {
        if (!confirm('این کد تخفیف حذف شود؟ مشتری‌هایی که آن را دارند دیگر نمی‌توانند استفاده کنند.')) return;
        DPAdmin.detail.removeCoupon(b.dataset.id);
        toast('کد حذف شد.', 'success');
        return reload();
      }

      if (a === 'cedit') {
        var c = D.coupons.find(function (x) { return x.id === b.dataset.id; });
        if (!c) return;
        byId('eId').value = c.id;
        byId('eCode').textContent = c.code;
        byId('eKind').textContent = KIND_FA[c.kind] || c.kind;
        byId('eVal').value = c.kind === 'amount' ? money(c.value) : fa(c.value);
        byId('eValLbl').textContent = c.kind === 'percent'
          ? 'درصد تخفیف (۱ تا ۹۰)' : 'مبلغ تخفیف (تومان)';
        byId('eValRow').hidden = (c.kind === 'ship');
        byId('eMaxOff').value = c.maxOff ? money(c.maxOff) : '';
        byId('eMaxOffRow').hidden = (c.kind !== 'percent');
        byId('eUses').value = c.maxUses ? fa(c.maxUses) : '';
        byId('eTo').value = c.to;
        return openModal('eModal');
      }

      /* ---------- تخفیف خودکار ---------- */
      if (a === 'stog') {
        DPAdmin.detail.toggleSale(b.dataset.id);
        toast('وضعیت تخفیف عوض شد.', 'success');
        return reload();
      }

      if (a === 'sdel') {
        if (!confirm('این تخفیف حذف شود؟')) return;
        DPAdmin.detail.removeSale(b.dataset.id);
        toast('تخفیف حذف شد.', 'success');
        return reload();
      }

      /* ---------- نظر ---------- */
      if (a === 'rtog') {
        var vis = DPAdmin.detail.toggleReview(b.dataset.id);
        toast(vis ? 'نظر آشکار شد.' : 'نظر پنهان شد.', 'success');
        return reload();
      }

      /* ---------- نردبان ---------- */
      if (a === 'bstop') {
        if (!confirm('این بسته‌ی نردبان همین حالا پایان یابد؟')) return;
        await DPAdmin.detail.stopBoost(SID, b.dataset.id);
        toast('بسته پایان یافت.', 'warning');
        return reload();
      }

      /* ---------- یادداشت ---------- */
      if (a === 'nadd') {
        DPAdmin.detail.note(SID, byId('ntText').value);
        byId('ntText').value = '';
        toast('یادداشت ثبت شد.', 'success');
        return paintTabs();
      }

      if (a === 'ndel') {
        DPAdmin.detail.removeNote(SID, Number(b.dataset.at));
        toast('یادداشت حذف شد.', 'success');
        return paintTabs();
      }

      /* ---------- اختیارها ---------- */
      if (a === 'limsave') {
        DPAdmin.detail.setLimits(SID, {
          maxDiscount: toEn(byId('limDisc').value).replace(/[^\d]/g, ''),
          maxProducts: toEn(byId('limProd').value).replace(/[^\d]/g, ''),
          noCoupons: !byId('limCpn').checked,
          noBoost:   !byId('limBst').checked,
        });
        toast('اختیارهای فروشگاه ذخیره شد.', 'success');
        return reload();
      }
    } catch (err) {
      toast(err.message || 'کاری انجام نشد.', 'error');
    }
  }

  /* ============================================================
     مودال‌ها — پس از بارگذاری صفحه وصل می‌شوند
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    var cc = byId('cConfirm');
    if (cc) cc.addEventListener('click', async function () {
      try {
        var rate = Number(toEn(byId('cRate').value).replace(/[^\d.]/g, ''));
        await DPAdmin.sellers.setCommission(SID, rate);
        toast('نرخ کمیسیون ذخیره شد.', 'success');
        closeModal('cModal');
        await reload();
      } catch (err) { toast(err.message, 'error'); }
    });

    var ec = byId('eConfirm');
    if (ec) ec.addEventListener('click', function () {
      try {
        var patch = { to: byId('eTo').value };
        if (!byId('eValRow').hidden) {
          patch.value = Number(toEn(byId('eVal').value).replace(/[^\d.]/g, ''));
        }
        if (!byId('eMaxOffRow').hidden) {
          patch.maxOff = Number(toEn(byId('eMaxOff').value).replace(/[^\d]/g, ''));
        }
        var u = toEn(byId('eUses').value).replace(/[^\d]/g, '');
        patch.maxUses = u === '' ? 0 : Number(u);

        DPAdmin.detail.saveCoupon(byId('eId').value, patch);
        toast('کد تخفیف به‌روزرسانی شد.', 'success');
        closeModal('eModal');
        reload();
      } catch (err) { toast(err.message, 'error'); }
    });
  }, { once: true });

})();
