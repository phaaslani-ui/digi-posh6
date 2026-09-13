# -*- coding: utf-8 -*-
"""دیجی‌پوش — سازنده‌ی صفحات پنل فروشنده"""

import os

OUT = os.path.dirname(os.path.abspath(__file__))

SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"'

I = {
 'dashboard': '<rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/>',
 'box':      '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
 'cart':     '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
 'wallet':   '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.5 12.5h4"/><circle cx="16.8" cy="12.5" r="1"/>',
 'user':     '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'logout':   '<path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/>',
 'search':   '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
 'plus':     '<path d="M12 5.5v13M5.5 12h13"/>',
 'edit':     '<path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5V15.5z"/><path d="m14 6 4 4"/>',
 'trash':    '<path d="M4.5 6.5h15M9 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 4.8v1.7"/><path d="M6.5 6.5 7.5 20a1.4 1.4 0 0 0 1.4 1.3h6.2A1.4 1.4 0 0 0 16.5 20l1-13.5"/>',
 'eye':      '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
 'bell':     '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
 'check':    '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'burger':   '<path d="M4 7h16M4 12h16M4 17h16"/>',
 'trendUp':  '<path d="M3.5 16.5 9 11l4 4 7.5-7.5"/><path d="M15.5 7.5h5v5"/>',
 'chart':    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 'store':    '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'download': '<path d="M20 15.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-3.5"/><path d="M8 11 12 15l4-4M12 15V4.5"/>',
 'clock':    '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'lock':     '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
 'mail':     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
 'upload':   '<path d="M20 15.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-3.5"/><path d="M8 8.5 12 4.5l4 4M12 4.5V15"/>',
 'back':     '<path d="M14 6l-6 6 6 6"/>',
 'home':     '<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20z"/><path d="M9.5 21.5v-7h5v7"/>',
 'alert':    '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
}


def svg(name, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{I[name]}</svg>'


NAV = [
    ('seller-dashboard.html',    'dashboard', 'داشبورد',        None),
    ('seller-products.html',     'box',       'محصولات',        '۴۲'),
    ('seller-orders.html',       'cart',      'سفارش‌ها',       '۵'),
    ('seller-earnings.html',     'wallet',    'درآمد و تسویه',  None),
    ('seller-profile.html',      'user',      'پروفایل فروشگاه', None),
]


def sidebar(active):
    links = ''
    for href, ico, label, badge in NAV:
        cls = 'sb-link active' if href == active else 'sb-link'
        b = f'<span class="sb-badge">{badge}</span>' if badge else ''
        links += f'      <a class="{cls}" href="{href}">{svg(ico)}<span>{label}</span>{b}</a>\n'

    return f'''<aside class="sidebar" id="sidebar">
  <div class="sidebar-head">
    <a href="../index.html" style="display:flex;flex-direction:column;gap:2px" title="بازگشت به سایت اصلی">
      <div class="sb-logo">دیجی‌پوش</div>
      <span class="sb-sub">پنل فروشندگان</span>
    </a>
  </div>

  <nav class="sidebar-nav" aria-label="منوی پنل">
    <div class="sb-label">مدیریت</div>
{links}  </nav>

  <div class="sidebar-foot">
    <div class="sb-user">
      <span class="sb-avatar">ر</span>
      <div>
        <div class="sb-user-name">رضا محمدی</div>
        <div class="sb-user-role">بوتیک ماه‌رخ</div>
      </div>
    </div>
    <a class="sb-link" href="../index.html">{svg('home')}<span>بازگشت به سایت</span></a>
    <a class="sb-link logout" href="seller-login.html" data-logout>{svg('logout')}<span>خروج از حساب</span></a>
  </div>
</aside>

<div class="backdrop" id="backdrop"></div>'''


def topbar(title, sub, actions=''):
    return f'''  <header class="topbar">
    <button class="burger" type="button" aria-label="منو">{svg('burger')}</button>
    <div>
      <div class="page-title">{title}</div>
      <div class="page-sub">{sub}</div>
    </div>
    <div class="topbar-actions">
      {actions}
      <button class="icon-btn" type="button" aria-label="اعلان‌ها">{svg('bell')}<span class="dot-alert"></span></button>
    </div>
  </header>'''


def page(filename, title, sub, body, active, extra_js='', topbar_actions=''):
    html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="پنل فروشندگان دیجی‌پوش — {title}" />
  <meta name="theme-color" content="#1a1a1a" />
  <title>دیجی‌پوش | {title}</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/seller-style.css" />
  <link rel="stylesheet" href="../assets/css/dp-stock.css" />
</head>
<body>

{sidebar(active)}

<div class="main">
{topbar(title, sub, topbar_actions)}

  <div class="content">
{body}
  </div>
</div>

<div class="toast-wrap"></div>

<script src="../assets/js/dp-safe.js"></script>
<script src="../assets/js/dp-stock.js"></script>
<script src="js/seller-script.js"></script>
{extra_js}
</body>
</html>
'''
    with open(os.path.join(OUT, filename), 'w', encoding='utf-8') as f:
        f.write(html)
    return filename


# ============================================================
#  ۱. ورود
# ============================================================
login = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="ورود فروشندگان دیجی‌پوش" />
  <meta name="theme-color" content="#f5f0e8" />
  <title>دیجی‌پوش | ورود فروشندگان</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/seller-style.css" />
</head>
<body class="login-page">

<main class="login-card">
  <div class="login-brand">
    <div class="mark">د</div>
    <h1>پنل فروشندگان</h1>
    <p>برای مدیریت فروشگاه خود وارد شوید</p>
  </div>

  <form class="login-form" id="loginForm" novalidate>
    <div class="field">
      <label for="email">ایمیل</label>
      <input class="input" type="email" id="email" name="email"
             placeholder="reza@mahrokh.ir" data-rules="required|email"
             autocomplete="email" value="reza@mahrokh.ir" />
      <span class="err-msg"></span>
    </div>

    <div class="field">
      <label for="password">رمز عبور</label>
      <input class="input" type="password" id="password" name="password"
             placeholder="••••••" data-rules="required|min6"
             autocomplete="current-password" value="123456" />
      <span class="err-msg"></span>
    </div>

    <div class="login-row">
      <label class="checkbox">
        <input type="checkbox" id="remember" checked />
        <span>مرا به خاطر بسپار</span>
      </label>
      <a class="link-gold" href="#" id="forgot">رمز عبور را فراموش کرده‌اید؟</a>
    </div>

    <button class="btn btn-primary btn-block" type="submit" id="submitBtn">
      <span class="spinner"></span>
      <span class="btn-label">ورود به پنل</span>
    </button>
  </form>

  <div class="login-foot">
    فروشنده نیستید؟
    <a class="link-gold" href="seller-signup.html">ثبت‌نام به عنوان فروشنده</a>
    <div style="margin-top:10px">
      <a class="link-gold" href="../index.html">&larr; بازگشت به دیجی‌پوش</a>
    </div>
  </div>
</main>

<div class="toast-wrap"></div>

<script src="../assets/js/dp-safe.js"></script>
<script src="../assets/js/dp-stock.js"></script>
<script src="js/seller-script.js"></script>
<script>
(function () {{
  const form = document.getElementById('loginForm');
  const btn  = document.getElementById('submitBtn');

  initValidation(form);

  form.addEventListener('submit', (e) => {{
    e.preventDefault();
    if (!validateForm(form)) {{
      toast('لطفاً خطاهای فرم را برطرف کنید.', 'error');
      return;
    }}

    btn.classList.add('loading');
    btn.disabled = true;

    // شبیه‌سازی درخواست به سرور
    setTimeout(() => {{
      btn.classList.remove('loading');
      btn.disabled = false;
      toast('ورود موفق. در حال انتقال…', 'success');
      setTimeout(() => (location.href = 'seller-dashboard.html'), 700);
    }}, 900);
  }});

  document.getElementById('forgot').addEventListener('click', (e) => {{
    e.preventDefault();
    toast('لینک بازیابی به ایمیل شما ارسال شد.', 'info');
  }});

}})();
</script>
</body>
</html>
'''
with open(os.path.join(OUT, 'seller-login.html'), 'w', encoding='utf-8') as f:
    f.write(login)


# ============================================================
#  ۲. داشبورد
# ============================================================
dashboard_body = f'''    <!-- خوش‌آمد -->
    <div class="card mb-18">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span class="profile-avatar">ر</span>
        <div style="flex:1;min-width:200px">
          <h2 style="font-size:19px;font-weight:800">خوش آمدید، رضا محمدی</h2>
          <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:4px">
            <span style="color:var(--gray);font-size:13px">{{}}بوتیک ماه‌رخ</span>
            <span class="verify-chip">{svg('check', 'ico ico-sm')} فروشنده تأییدشده</span>
          </div>
        </div>
        <a class="btn btn-primary" href="seller-product-form.html">{svg('plus', 'ico ico-sm')} افزودن محصول</a>
      </div>
    </div>

    <!-- آمار -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-gold">{svg('box')}</span>
          <span class="stat-label">کل محصولات</span>
        </div>
        <span class="stat-number" data-count="42">۰</span>
        <span class="stat-trend trend-up">{svg('trendUp', 'ico ico-sm')} ۴ محصول جدید</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-blue">{svg('cart')}</span>
          <span class="stat-label">کل سفارش‌ها</span>
        </div>
        <span class="stat-number" data-count="128">۰</span>
        <span class="stat-trend trend-up">{svg('trendUp', 'ico ico-sm')} ۱۲ سفارش این هفته</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-green">{svg('wallet')}</span>
          <span class="stat-label">درآمد کل</span>
        </div>
        <span class="stat-number" data-count="32500000" data-money="1">۰</span>
        <span class="stat-unit">تومان</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-silver">{svg('chart')}</span>
          <span class="stat-label">نرخ رشد</span>
        </div>
        <span class="stat-number" data-count="18.5" data-decimals="1">۰</span>
        <span class="stat-unit">درصد نسبت به ماه قبل</span>
      </div>
    </div>

    <div class="split mb-18">
      <!-- نمودار -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>روند فروش</h2>
            <span class="sub">هفت ماه گذشته</span>
          </div>
        </div>
        <div class="chart" id="chart"></div>
      </div>

      <!-- دسترسی سریع -->
      <div class="card">
        <div class="card-head"><h2>دسترسی سریع</h2></div>
        <div class="quick-actions">
          <a class="qa" href="seller-product-form.html">{svg('plus')}<span>محصول جدید</span></a>
          <a class="qa" href="seller-orders.html">{svg('cart')}<span>سفارش‌ها</span></a>
          <a class="qa" href="seller-earnings.html">{svg('wallet')}<span>درخواست تسویه</span></a>
          <a class="qa" href="seller-profile.html">{svg('store')}<span>تنظیم فروشگاه</span></a>
        </div>

        <div class="card-head mt-18" style="margin-bottom:12px">
          <h2 style="font-size:14px">وضعیت مالی</h2>
        </div>
        <div class="info-row"><span class="k">در انتظار تسویه</span><span class="v">۸٬۵۰۰٬۰۰۰ تومان</span></div>
        <div class="info-row"><span class="k">تسویه‌شده</span><span class="v">۲۴٬۰۰۰٬۰۰۰ تومان</span></div>
        <div class="info-row"><span class="k">نرخ کمیسیون</span><span class="v">۱۰٪</span></div>
      </div>
    </div>

    <!-- سفارش‌های اخیر -->
    <div class="card">
      <div class="card-head">
        <div>
          <h2>سفارش‌های اخیر</h2>
          <span class="sub">پنج سفارش آخر</span>
        </div>
        <a class="btn btn-secondary btn-sm spacer" href="seller-orders.html">مشاهده همه</a>
      </div>
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>شماره سفارش</th><th>مشتری</th><th>اقلام</th>
              <th>مبلغ</th><th>وضعیت</th><th>تاریخ</th>
            </tr>
          </thead>
          <tbody id="recentOrders"></tbody>
        </table>
      </div>
    </div>'''

dashboard_js = '''<script>
(function () {
  // نمودار — ساخت یک‌باره با رشته، سپس یک بار درج
  const chart = document.getElementById('chart');
  const max = Math.max(...DB.chart.map(d => d.v));

  chart.innerHTML = DB.chart.map(d => `
    <div class="bar-col">
      <div class="bar-wrap">
        <span class="bar-val">${money(d.v)}</span>
        <div class="bar" style="height:${Math.round(d.v / max * 100)}%"></div>
      </div>
      <span class="bar-label">${d.m}</span>
    </div>`).join('');

  initChart();   // با IntersectionObserver پر می‌شود

  // سفارش‌های اخیر
  document.getElementById('recentOrders').innerHTML = DB.orders.slice(0, 5).map(o => `
    <tr>
      <td class="num" style="font-weight:700;color:var(--gold)">${o.id}</td>
      <td>${o.customer}</td>
      <td class="cell-meta">${toFa(o.count)} قلم</td>
      <td class="num">${money(o.total)} <span style="font-size:11px;color:var(--gray)">تومان</span></td>
      <td>${badge(o.status)}</td>
      <td class="num cell-meta">${o.date}</td>
    </tr>`).join('');
})();
</script>'''

page('seller-dashboard.html', 'داشبورد', 'نمای کلی فروشگاه شما',
     dashboard_body.replace('{}', ''), 'seller-dashboard.html', dashboard_js)


# ============================================================
#  ۳. مدیریت محصولات
# ============================================================
products_body = f'''    <div class="card">
      <div class="toolbar">
        <div class="search-box">
          {svg('search', 'ico ico-sm')}
          <input class="input" type="search" id="search" placeholder="جست‌وجو در نام یا دسته‌بندی…" aria-label="جست‌وجو" />
        </div>

        <select class="select" data-filter="status" aria-label="فیلتر وضعیت">
          <option value="">همه‌ی وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="out_of_stock">ناموجود</option>
          <option value="draft">پیش‌نویس</option>
          <option value="archived">بایگانی</option>
        </select>

        <select class="select" data-filter="category" aria-label="فیلتر دسته">
          <option value="">همه‌ی دسته‌ها</option>
          <option value="لباس مجلسی">لباس مجلسی</option>
          <option value="مانتو">مانتو</option>
          <option value="اکسسوری">اکسسوری</option>
          <option value="کت و دامن">کت و دامن</option>
          <option value="پالتو">پالتو</option>
        </select>

        <a class="btn btn-primary" href="seller-product-form.html">{svg('plus', 'ico ico-sm')} محصول جدید</a>
      </div>

      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th class="sortable" data-key="name">محصول <span class="sort-ico">▾</span></th>
              <th class="sortable" data-key="price">قیمت <span class="sort-ico">▾</span></th>
              <th class="sortable" data-key="stock">موجودی <span class="sort-ico">▾</span></th>
              <th class="sortable" data-key="sales">فروش <span class="sort-ico">▾</span></th>
              <th>وضعیت</th>
              <th class="sortable" data-key="date">تاریخ <span class="sort-ico">▾</span></th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>

      <div class="pagination" id="pagination"></div>
    </div>

    <!-- مودال حذف -->
    <div class="modal-overlay" id="delModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="delTitle">
        <div class="modal-head">
          <span class="stat-icon" style="width:38px;height:38px;background:rgba(244,67,54,.12);color:var(--danger)">{svg('alert', 'ico ico-sm')}</span>
          <h3 id="delTitle">حذف محصول</h3>
          <button class="modal-close" type="button" data-close aria-label="بستن">&times;</button>
        </div>
        <div class="modal-body">
          <p>آیا از حذف <strong id="delName">این محصول</strong> مطمئن هستید؟</p>
          <p style="color:var(--gray);font-size:12.5px;margin-top:6px">
            محصول بایگانی می‌شود و از ویترین برداشته می‌شود. این عمل قابل بازگشت است.
          </p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-danger" type="button" id="delConfirm">بله، حذف کن</button>
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
        </div>
      </div>
    </div>'''

products_js = '''<script>
(function () {
  const tbody = document.getElementById('tbody');
  let pendingId = null;

  const table = new DataTable({
    rows: DB.products,
    tbody,
    perPage: 8,
    searchFields: ['name', 'category', 'brand'],
    render: (p) => `
      <tr>
        <td>
          <div class="cell-product">
            <div class="thumb" style="display:grid;place-items:center;color:var(--gold);font-weight:700">
              ${p.name.charAt(0)}
            </div>
            <div>
              <div class="cell-name">${p.name}</div>
              <div class="cell-meta">${p.category} · ${p.brand}</div>
            </div>
          </div>
        </td>
        <td class="num">${money(p.price)} <span style="font-size:11px;color:var(--gray)">تومان</span></td>
        <td class="num">
          ${p.stock === 0
            ? '<span style="color:var(--danger);font-weight:600">ناموجود</span>'
            : toFa(p.stock) + ' عدد'}
        </td>
        <td class="num">${toFa(p.sales)}</td>
        <td>${badge(p.status)}</td>
        <td class="num cell-meta">${p.date}</td>
        <td>
          <div class="row-actions">
            <a class="act" href="seller-product-form.html?id=${p.id}" title="ویرایش">${icon('edit')}</a>
            <button class="act danger" type="button" data-del="${p.id}" data-name="${p.name}" title="حذف">${icon('trash')}</button>
          </div>
        </td>
      </tr>`,
  }).bind();

  // حذف — با delegation روی tbody
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    pendingId = btn.dataset.del;
    document.getElementById('delName').textContent = btn.dataset.name;
    openModal('delModal');
  });

  document.getElementById('delConfirm').addEventListener('click', () => {
    const i = DB.products.findIndex(p => p.id === pendingId);
    if (i > -1) {
      DB.products[i].status = 'archived';
      table.all = DB.products;
      table.draw();
      toast('محصول بایگانی شد.', 'success');
    }
    closeModal('delModal');
  });
})();
</script>'''

page('seller-products.html', 'مدیریت محصولات', 'افزودن، ویرایش و مدیریت ویترین',
     products_body, 'seller-products.html', products_js)


# ============================================================
#  ۴. فرم محصول
# ============================================================
form_body = f'''    <form id="productForm" novalidate>
      <div class="split">
        <div>
          <!-- اطلاعات پایه -->
          <div class="card mb-18">
            <div class="card-head"><h2>اطلاعات محصول</h2></div>
            <div class="form-grid">
              <div class="field full">
                <label for="pname">نام محصول <span class="req">*</span></label>
                <input class="input" id="pname" data-rules="required" placeholder="مثلاً: مانتوی کتان بلند" />
                <span class="err-msg"></span>
              </div>

              <div class="field full">
                <label for="pdesc">توضیحات <span class="hint">— جنس پارچه، نحوه‌ی شست‌وشو و جزئیات دوخت</span></label>
                <textarea class="textarea" id="pdesc" placeholder="توضیح کامل محصول…"></textarea>
              </div>

              <div class="field">
                <label for="pcat">دسته‌بندی <span class="req">*</span></label>
                <select class="select" id="pcat" data-rules="required">
                  <option value="">انتخاب کنید</option>
                  <option>لباس مجلسی</option><option>مانتو</option>
                  <option>کت و دامن</option><option>پالتو</option>
                  <option>تونیک</option><option>دامن</option>
                  <option>بلوز</option><option>ست کامل</option>
                  <option>اکسسوری</option>
                </select>
                <span class="err-msg"></span>
              </div>

              <div class="field">
                <label for="pbrand">برند</label>
                <input class="input" id="pbrand" value="ماه‌رخ" />
              </div>

              <div class="field">
                <label for="pprice">قیمت (تومان) <span class="req">*</span></label>
                <input class="input" id="pprice" inputmode="numeric" data-rules="required|positive" placeholder="۱۲۵۰۰۰۰" />
                <span class="err-msg"></span>
              </div>

              <div class="field">
                <label for="pstock">موجودی <span class="req">*</span></label>
                <input class="input" id="pstock" inputmode="numeric" data-rules="required|notneg" placeholder="۱۵" />
                <span class="err-msg"></span>
              </div>
            </div>
          </div>

          <!-- تصاویر -->
          <div class="card mb-18">
            <div class="card-head"><h2>تصاویر محصول</h2></div>
            <label class="uploader" for="pimg">
              {svg('upload', 'ico ico-lg')}
              <strong style="color:var(--ink);font-size:13.5px">تصاویر را انتخاب کنید</strong>
              <span style="font-size:12px">فرمت JPG یا PNG — حداکثر ۲ مگابایت</span>
            </label>
            <input type="file" id="pimg" accept="image/*" multiple hidden />
            <div class="previews" id="previews"></div>
          </div>

          <!-- تنوع -->
          <div class="card">
            <div class="card-head"><h2>سایز و رنگ</h2></div>
            <div class="field mb-18">
              <label>سایزهای موجود</label>
              <div class="chips" data-group="size">
                <button class="chip" type="button">XS</button>
                <button class="chip on" type="button">S</button>
                <button class="chip on" type="button">M</button>
                <button class="chip on" type="button">L</button>
                <button class="chip" type="button">XL</button>
                <button class="chip" type="button">XXL</button>
              </div>
            </div>
            <div class="field">
              <label>رنگ‌های موجود</label>
              <div class="chips" data-group="color">
                <button class="chip on" type="button">مشکی</button>
                <button class="chip" type="button">سرمه‌ای</button>
                <button class="chip on" type="button">کرم</button>
                <button class="chip" type="button">زرشکی</button>
                <button class="chip" type="button">طوسی</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ستون کناری -->
        <div>
          <div class="card mb-18">
            <div class="card-head"><h2>انتشار</h2></div>
            <div class="field mb-18">
              <label for="pstatus">وضعیت</label>
              <select class="select" id="pstatus">
                <option value="draft">پیش‌نویس</option>
                <option value="active" selected>فعال (نمایش در ویترین)</option>
                <option value="archived">بایگانی</option>
              </select>
            </div>
            <button class="btn btn-primary btn-block mb-18" type="submit" id="saveBtn">
              <span class="spinner"></span>
              <span class="btn-label">ذخیره‌ی محصول</span>
            </button>
            <a class="btn btn-secondary btn-block" href="seller-products.html">انصراف</a>
          </div>

          <div class="card">
            <div class="card-head"><h2 style="font-size:14px">راهنما</h2></div>
            <ul style="display:grid;gap:10px;font-size:12.5px;color:var(--gray);line-height:1.9">
              <li>{svg('check', 'ico ico-sm')} نام محصول را دقیق و بدون اغراق بنویسید.</li>
              <li>{svg('check', 'ico ico-sm')} جنس پارچه را حتماً در توضیحات ذکر کنید.</li>
              <li>{svg('check', 'ico ico-sm')} تصویر با نور طبیعی، کیفیت فروش را بالا می‌برد.</li>
              <li>{svg('check', 'ico ico-sm')} کمیسیون پلتفرم ۱۰٪ از مبلغ فروش است.</li>
            </ul>
          </div>
        </div>
      </div>
    </form>'''

form_js = '''<script>
(function () {
  const form = document.getElementById('productForm');
  const btn  = document.getElementById('saveBtn');

  initValidation(form);

  // اگر id در آدرس بود، حالت ویرایش
  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    const p = DB.products.find(x => x.id === id);
    if (p) {
      document.querySelector('.page-title').textContent = 'ویرایش محصول';
      pname.value  = p.name;
      pprice.value = toFa(p.price);
      pstock.value = toFa(p.stock);
      pbrand.value = p.brand;
      pcat.value   = p.category;
      pstatus.value = p.status === 'out_of_stock' ? 'active' : p.status;
    }
  }

  // چیپ‌ها — یک شنونده برای همه
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.chips .chip');
    if (chip) chip.classList.toggle('on');
  });

  // پیش‌نمایش تصویر
  const previews = document.getElementById('previews');
  document.getElementById('pimg').addEventListener('change', (e) => {
    const frag = document.createDocumentFragment();
    for (const file of e.target.files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      const box = document.createElement('div');
      box.className = 'preview';
      box.innerHTML = `<img src="${url}" alt="" /><button type="button" aria-label="حذف">&times;</button>`;
      // آزادسازی حافظه پس از بارگذاری
      box.querySelector('img').onload = () => URL.revokeObjectURL(url);
      box.querySelector('button').onclick = () => box.remove();
      frag.appendChild(box);
    }
    previews.appendChild(frag);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      toast('لطفاً فیلدهای الزامی را کامل کنید.', 'error');
      form.querySelector('.field.invalid .input, .field.invalid .select')?.focus();
      return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      toast(id ? 'محصول به‌روز شد.' : 'محصول با موفقیت ثبت شد.', 'success');
      setTimeout(() => (location.href = 'seller-products.html'), 800);
    }, 900);
  });
})();
</script>'''

page('seller-product-form.html', 'افزودن محصول', 'اطلاعات محصول را کامل کنید',
     form_body, 'seller-products.html', form_js)


# ============================================================
#  ۵. سفارش‌ها
# ============================================================
orders_body = f'''    <div class="card">
      <div class="toolbar">
        <div class="search-box">
          {svg('search', 'ico ico-sm')}
          <input class="input" type="search" id="search" placeholder="جست‌وجو با شماره سفارش یا نام مشتری…" aria-label="جست‌وجو" />
        </div>

        <select class="select" data-filter="status" aria-label="فیلتر وضعیت">
          <option value="">همه‌ی وضعیت‌ها</option>
          <option value="pending">در انتظار</option>
          <option value="confirmed">تأیید شده</option>
          <option value="shipped">ارسال شده</option>
          <option value="delivered">تحویل شده</option>
          <option value="cancelled">لغو شده</option>
        </select>

        <button class="btn btn-secondary" type="button" id="exportBtn">{svg('download', 'ico ico-sm')} خروجی</button>
      </div>

      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th class="sortable" data-key="id">شماره <span class="sort-ico">▾</span></th>
              <th>مشتری</th>
              <th>اقلام</th>
              <th class="sortable" data-key="total">مبلغ <span class="sort-ico">▾</span></th>
              <th>وضعیت</th>
              <th class="sortable" data-key="date">تاریخ <span class="sort-ico">▾</span></th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>

      <div class="pagination" id="pagination"></div>
    </div>

    <!-- مودال جزئیات -->
    <div class="modal-overlay" id="orderModal">
      <div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="omTitle">
        <div class="modal-head">
          <h3 id="omTitle">جزئیات سفارش</h3>
          <button class="modal-close" type="button" data-close aria-label="بستن">&times;</button>
        </div>
        <div class="modal-body" id="omBody"></div>
        <div class="modal-foot">
          <button class="btn btn-primary" type="button" id="omSave">ذخیره‌ی وضعیت</button>
          <button class="btn btn-secondary" type="button" data-close>بستن</button>
        </div>
      </div>
    </div>'''

orders_js = '''<script>
(function () {
  const tbody = document.getElementById('tbody');
  let currentId = null;

  const table = new DataTable({
    rows: DB.orders,
    tbody,
    perPage: 8,
    searchFields: ['id', 'customer', 'items'],
    render: (o) => `
      <tr>
        <td class="num" style="font-weight:700;color:var(--gold)">${o.id}</td>
        <td>
          <div class="cell-name">${o.customer}</div>
          <div class="cell-meta num">${o.phone}</div>
        </td>
        <td class="cell-meta">${o.items[0]}${o.count > 1 ? ' + ' + toFa(o.count - 1) + ' مورد' : ''}</td>
        <td class="num">${money(o.total)} <span style="font-size:11px;color:var(--gray)">تومان</span></td>
        <td>${badge(o.status)}</td>
        <td class="num cell-meta">${o.date}</td>
        <td>
          <div class="row-actions">
            <button class="act" type="button" data-view="${o.id}" title="مشاهده">${icon('eye')}</button>
          </div>
        </td>
      </tr>`,
  }).bind();

  // باز کردن جزئیات
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;

    const o = DB.orders.find(x => x.id === btn.dataset.view);
    if (!o) return;
    currentId = o.id;

    const commission = Math.round(o.total * 0.1);

    document.getElementById('omBody').innerHTML = `
      <div class="info-row"><span class="k">شماره سفارش</span><span class="v num">${o.id}</span></div>
      <div class="info-row"><span class="k">مشتری</span><span class="v">${o.customer}</span></div>
      <div class="info-row"><span class="k">تلفن</span><span class="v num">${o.phone}</span></div>
      <div class="info-row"><span class="k">نشانی</span><span class="v">${o.address}</span></div>
      <div class="info-row"><span class="k">تاریخ ثبت</span><span class="v num">${o.date}</span></div>

      <div class="card-head mt-18" style="margin-bottom:10px"><h2 style="font-size:14px">اقلام سفارش</h2></div>
      ${o.items.map(it => `<div class="info-row"><span class="k">${it}</span><span class="v">۱ عدد</span></div>`).join('')}

      <div class="card-head mt-18" style="margin-bottom:10px"><h2 style="font-size:14px">مالی</h2></div>
      <div class="info-row"><span class="k">مبلغ کل</span><span class="v num">${money(o.total)} تومان</span></div>
      <div class="info-row"><span class="k">کمیسیون پلتفرم (۱۰٪)</span><span class="v num" style="color:var(--danger)">−${money(commission)} تومان</span></div>
      <div class="info-row"><span class="k">سهم شما</span><span class="v num" style="color:var(--success);font-weight:700">${money(o.total - commission)} تومان</span></div>

      <div class="field mt-18">
        <label for="omStatus">تغییر وضعیت سفارش</label>
        <select class="select" id="omStatus">
          <option value="pending">در انتظار</option>
          <option value="confirmed">تأیید شده</option>
          <option value="shipped">ارسال شده</option>
          <option value="delivered">تحویل شده</option>
          <option value="cancelled">لغو شده</option>
        </select>
      </div>`;

    document.getElementById('omStatus').value = o.status;
    openModal('orderModal');
  });

  // ذخیره‌ی وضعیت
  document.getElementById('omSave').addEventListener('click', () => {
    const val = document.getElementById('omStatus')?.value;
    const o = DB.orders.find(x => x.id === currentId);
    if (o && val) {
      o.status = val;
      table.draw();
      toast('وضعیت سفارش به‌روز شد.', 'success');
    }
    closeModal('orderModal');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    toast('فایل خروجی به‌زودی آماده می‌شود.', 'info');
  });
})();
</script>'''

page('seller-orders.html', 'مدیریت سفارش‌ها', 'پیگیری و به‌روزرسانی وضعیت سفارش‌ها',
     orders_body, 'seller-orders.html', orders_js)


# ============================================================
#  ۶. درآمد
# ============================================================
earnings_body = f'''    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-gold">{svg('wallet')}</span>
          <span class="stat-label">درآمد کل</span>
        </div>
        <span class="stat-number" data-count="32500000" data-money="1">۰</span>
        <span class="stat-unit">تومان</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-blue">{svg('clock')}</span>
          <span class="stat-label">در انتظار تسویه</span>
        </div>
        <span class="stat-number" data-count="8500000" data-money="1">۰</span>
        <span class="stat-unit">تومان</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-green">{svg('check')}</span>
          <span class="stat-label">تسویه‌شده</span>
        </div>
        <span class="stat-number" data-count="24000000" data-money="1">۰</span>
        <span class="stat-unit">تومان</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon si-silver">{svg('chart')}</span>
          <span class="stat-label">کمیسیون پرداختی</span>
        </div>
        <span class="stat-number" data-count="3611000" data-money="1">۰</span>
        <span class="stat-unit">تومان (۱۰٪)</span>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <h2>تاریخچه‌ی درآمد</h2>
          <span class="sub">جزئیات هر سفارش و سهم شما</span>
        </div>
        <button class="btn btn-primary spacer" type="button" id="withdrawBtn">{svg('download', 'ico ico-sm')} درخواست تسویه</button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          {svg('search', 'ico ico-sm')}
          <input class="input" type="search" id="search" placeholder="جست‌وجو با شماره سفارش…" aria-label="جست‌وجو" />
        </div>
        <select class="select" data-filter="status" aria-label="فیلتر وضعیت">
          <option value="">همه</option>
          <option value="paid">تسویه شده</option>
          <option value="pending">در انتظار</option>
        </select>
      </div>

      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th class="sortable" data-key="date">تاریخ <span class="sort-ico">▾</span></th>
              <th class="sortable" data-key="order">سفارش <span class="sort-ico">▾</span></th>
              <th class="sortable" data-key="amount">مبلغ فروش <span class="sort-ico">▾</span></th>
              <th>کمیسیون</th>
              <th class="sortable" data-key="net">سهم شما <span class="sort-ico">▾</span></th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>

      <div class="pagination" id="pagination"></div>
    </div>

    <!-- مودال تسویه -->
    <div class="modal-overlay" id="wModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="wTitle">
        <div class="modal-head">
          <h3 id="wTitle">درخواست تسویه</h3>
          <button class="modal-close" type="button" data-close aria-label="بستن">&times;</button>
        </div>
        <form class="modal-body" id="wForm" novalidate>
          <div class="info-row"><span class="k">موجودی قابل برداشت</span><span class="v num" style="color:var(--success)">۸٬۵۰۰٬۰۰۰ تومان</span></div>
          <div class="info-row"><span class="k">حداقل مبلغ</span><span class="v num">۵۰۰٬۰۰۰ تومان</span></div>

          <div class="field mt-18">
            <label for="wAmount">مبلغ درخواستی (تومان) <span class="req">*</span></label>
            <input class="input" id="wAmount" inputmode="numeric" data-rules="required|positive" placeholder="۸۵۰۰۰۰۰" />
            <span class="err-msg"></span>
          </div>

          <div class="field">
            <label for="wShaba">شماره شبا</label>
            <input class="input num" id="wShaba" value="IR۰۶۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰" readonly
                   style="background:var(--beige);color:var(--gray)" />
            <span class="hint">برای تغییر، به صفحه‌ی پروفایل مراجعه کنید.</span>
          </div>
        </form>
        <div class="modal-foot">
          <button class="btn btn-primary" type="submit" form="wForm" id="wSubmit">
            <span class="spinner"></span><span class="btn-label">ثبت درخواست</span>
          </button>
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
        </div>
      </div>
    </div>'''

earnings_js = '''<script>
(function () {
  new DataTable({
    rows: DB.earnings,
    tbody: document.getElementById('tbody'),
    perPage: 8,
    searchFields: ['order', 'date'],
    render: (r) => `
      <tr>
        <td class="num cell-meta">${r.date}</td>
        <td class="num" style="font-weight:700;color:var(--gold)">${r.order}</td>
        <td class="num">${money(r.amount)}</td>
        <td class="num" style="color:var(--danger)">−${money(r.commission)}</td>
        <td class="num" style="font-weight:700;color:var(--success)">${money(r.net)}</td>
        <td>${badge(r.status)}</td>
      </tr>`,
  }).bind();

  document.getElementById('withdrawBtn').addEventListener('click', () => openModal('wModal'));

  const wForm = document.getElementById('wForm');
  const wBtn  = document.getElementById('wSubmit');
  initValidation(wForm);

  wForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(wForm)) return;

    const amount = Number(toEn(document.getElementById('wAmount').value).replace(/[^\\d]/g, ''));
    if (amount < 500000) { toast('حداقل مبلغ تسویه ۵۰۰٬۰۰۰ تومان است.', 'warning'); return; }
    if (amount > 8500000) { toast('مبلغ درخواستی بیش از موجودی شماست.', 'error'); return; }

    wBtn.classList.add('loading');
    wBtn.disabled = true;

    setTimeout(() => {
      wBtn.classList.remove('loading');
      wBtn.disabled = false;
      closeModal('wModal');
      toast('درخواست تسویه ثبت شد و ظرف ۴۸ ساعت بررسی می‌شود.', 'success');
      wForm.reset();
    }, 900);
  });
})();
</script>'''

page('seller-earnings.html', 'درآمد و تسویه', 'گزارش مالی و درخواست برداشت',
     earnings_body, 'seller-earnings.html', earnings_js)


# ============================================================
#  ۷. پروفایل
# ============================================================
profile_body = f'''    <div class="split">
      <div>
        <!-- اطلاعات فروشگاه -->
        <div class="card mb-18">
          <div class="profile-head">
            <span class="profile-avatar">ر</span>
            <div style="flex:1">
              <h2 style="font-size:18px;font-weight:800">بوتیک ماه‌رخ</h2>
              <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:4px">
                <span style="color:var(--gray);font-size:13px">عضویت از ۱۴۰۲/۰۲/۱۵</span>
                <span class="verify-chip">{svg('check', 'ico ico-sm')} تأییدشده</span>
              </div>
            </div>
          </div>

          <form id="storeForm" novalidate>
            <div class="form-grid">
              <div class="field">
                <label for="sname">نام فروشگاه <span class="req">*</span></label>
                <input class="input" id="sname" value="بوتیک ماه‌رخ" data-rules="required" />
                <span class="err-msg"></span>
              </div>

              <div class="field">
                <label for="scity">شهر</label>
                <input class="input" id="scity" value="تهران" />
              </div>

              <div class="field full">
                <label for="sdesc">معرفی فروشگاه</label>
                <textarea class="textarea" id="sdesc">لباس‌های مجلسی با کیفیت بالا و دوخت سفارشی</textarea>
              </div>

              <div class="field full">
                <label for="saddr">نشانی</label>
                <input class="input" id="saddr" value="خیابان ولیعصر، پلاک ۱۲۴" />
              </div>

              <div class="field full">
                <label for="sshaba">شماره شبا <span class="hint">— برای تسویه‌ی درآمد</span></label>
                <input class="input num" id="sshaba" value="IR۰۶۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰" />
              </div>
            </div>

            <button class="btn btn-primary mt-18" type="submit" id="storeBtn">
              <span class="spinner"></span><span class="btn-label">ذخیره‌ی تغییرات</span>
            </button>
          </form>
        </div>

        <!-- اطلاعات شخصی -->
        <div class="card mb-18">
          <div class="card-head"><h2>اطلاعات شخصی</h2></div>
          <form id="userForm" novalidate>
            <div class="form-grid">
              <div class="field">
                <label for="uname">نام و نام خانوادگی <span class="req">*</span></label>
                <input class="input" id="uname" value="رضا محمدی" data-rules="required" />
                <span class="err-msg"></span>
              </div>

              <div class="field">
                <label for="uphone">شماره موبایل <span class="req">*</span></label>
                <input class="input num" id="uphone" value="۰۹۱۲۳۴۵۶۷۸۹" data-rules="required|phone" />
                <span class="err-msg"></span>
              </div>

              <div class="field full">
                <label for="uemail">ایمیل <span class="req">*</span></label>
                <input class="input" id="uemail" type="email" value="reza@mahrokh.ir" data-rules="required|email" />
                <span class="err-msg"></span>
              </div>
            </div>

            <button class="btn btn-primary mt-18" type="submit" id="userBtn">
              <span class="spinner"></span><span class="btn-label">ذخیره</span>
            </button>
          </form>
        </div>

        <!-- تغییر رمز -->
        <div class="card">
          <div class="card-head">
            <span class="stat-icon si-silver" style="width:38px;height:38px">{svg('lock', 'ico ico-sm')}</span>
            <h2>تغییر رمز عبور</h2>
          </div>
          <form id="passForm" novalidate>
            <div class="form-grid">
              <div class="field full">
                <label for="oldPass">رمز فعلی <span class="req">*</span></label>
                <input class="input" id="oldPass" type="password" data-rules="required" />
                <span class="err-msg"></span>
              </div>
              <div class="field">
                <label for="newPass">رمز جدید <span class="req">*</span></label>
                <input class="input" id="newPass" type="password" data-rules="required|min6" />
                <span class="err-msg"></span>
              </div>
              <div class="field">
                <label for="newPass2">تکرار رمز جدید <span class="req">*</span></label>
                <input class="input" id="newPass2" type="password" data-rules="required" />
                <span class="err-msg"></span>
              </div>
            </div>
            <button class="btn btn-primary mt-18" type="submit" id="passBtn">
              <span class="spinner"></span><span class="btn-label">تغییر رمز</span>
            </button>
          </form>
        </div>
      </div>

      <!-- ستون کناری -->
      <div>
        <div class="card mb-18">
          <div class="card-head"><h2 style="font-size:14px">وضعیت فروشگاه</h2></div>
          <div class="info-row"><span class="k">وضعیت</span><span class="v"><span class="badge b-success">تأییدشده</span></span></div>
          <div class="info-row"><span class="k">نرخ کمیسیون</span><span class="v">۱۰٪</span></div>
          <div class="info-row"><span class="k">محصولات فعال</span><span class="v num">۴۲</span></div>
          <div class="info-row"><span class="k">امتیاز فروشگاه</span><span class="v num">۴٫۸ از ۵</span></div>
          <div class="info-row"><span class="k">میانگین پاسخ</span><span class="v">۲ ساعت</span></div>
        </div>

        <div class="card">
          <div class="card-head"><h2 style="font-size:14px">نکات مهم</h2></div>
          <ul style="display:grid;gap:10px;font-size:12.5px;color:var(--gray);line-height:1.9">
            <li>{svg('check', 'ico ico-sm')} شماره شبا باید به نام صاحب فروشگاه باشد.</li>
            <li>{svg('check', 'ico ico-sm')} تغییر نام فروشگاه نیاز به تأیید مجدد ادمین دارد.</li>
            <li>{svg('check', 'ico ico-sm')} پاسخ سریع به مشتریان، امتیاز فروشگاه را بالا می‌برد.</li>
          </ul>
        </div>
      </div>
    </div>'''

profile_js = '''<script>
(function () {
  // یک تابع برای هر سه فرم — بدون تکرار کد
  function wire(formId, btnId, successMsg, beforeSubmit) {
    const form = document.getElementById(formId);
    const btn  = document.getElementById(btnId);
    initValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) { toast('لطفاً خطاها را برطرف کنید.', 'error'); return; }
      if (beforeSubmit && !beforeSubmit()) return;

      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        toast(successMsg, 'success');
      }, 800);
    });
  }

  wire('storeForm', 'storeBtn', 'اطلاعات فروشگاه ذخیره شد.');
  wire('userForm',  'userBtn',  'اطلاعات شخصی به‌روز شد.');

  wire('passForm', 'passBtn', 'رمز عبور با موفقیت تغییر کرد.', () => {
    const a = document.getElementById('newPass').value;
    const b = document.getElementById('newPass2').value;
    if (a !== b) {
      toast('رمز جدید و تکرار آن یکسان نیستند.', 'error');
      document.getElementById('newPass2').closest('.field').classList.add('invalid');
      document.querySelector('#newPass2 ~ .err-msg').textContent = 'با رمز جدید مطابقت ندارد.';
      return false;
    }
    return true;
  });
})();
</script>'''

page('seller-profile.html', 'پروفایل فروشگاه', 'اطلاعات فروشگاه و حساب کاربری',
     profile_body, 'seller-profile.html', profile_js)

print('✓ ۷ صفحه ساخته شد')
