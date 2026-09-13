# -*- coding: utf-8 -*-
"""سازنده‌ی صفحات پنل مدیریت دیجی‌پوش"""
import pathlib

D = pathlib.Path(__file__).parent

SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"'

ICONS = {
    'dashboard': '<rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/>',
    'store': '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    'clock': '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'box': '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
    'eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    'lock': '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    'shield': '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
    'logout': '<path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/>',
    'home': '<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20z"/><path d="M9.5 21.5v-7h5v7"/>',
    'burger': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'alert': '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    'wallet': '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.5 12.5h4"/><circle cx="16.8" cy="12.5" r="1"/>',
    'percent': '<path d="m6 18 12-12"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    'list': '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    'chat': '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    'star': '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    'flag': '<path d="M5 21V4.5h13l-2.4 4.2L18 13H5"/>',
}


def ico(n, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{ICONS[n]}</svg>'


NAV = [
    ('admin-dashboard.html', 'dashboard', 'داشبورد', None),
    ('admin-sellers.html',   'store',     'فروشگاه‌ها', 'badgeAll'),
    ('admin-pending.html',   'clock',     'در انتظار تأیید', 'badgePending'),
    ('admin-catalog.html',   'box',       'همه‌ی محصولات', None),
    ('admin-orders.html',    'list',      'همه‌ی سفارش‌ها', None),
    ('admin-reviews.html',   'chat',      'نظرها', 'badgeFlag'),
    ('admin-policy.html',    'percent',   'سیاست کمیسیون', None),
    ('admin-settings.html',  'lock',      'تنظیمات', None),
]


def sidebar(active):
    links = ''
    for href, icon, label, badge in NAV:
        cls = 'sb-link active' if href == active else 'sb-link'
        b = f'<span class="sb-badge" id="{badge}" hidden></span>' if badge else ''
        links += f'\n      <a class="{cls}" href="{href}">{ico(icon)}<span>{label}</span>{b}</a>'

    return f'''<aside class="sidebar" id="sidebar">
  <div class="sidebar-head">
    <a href="../index.html" title="بازگشت به سایت">
      <div class="sb-logo">دیجی‌پوش</div>
      <span class="sb-sub">پنل مدیریت</span>
    </a>
  </div>

  <nav class="sidebar-nav" aria-label="منوی مدیریت">
    <div class="sb-label">مدیریت</div>{links}
  </nav>

  <div class="sidebar-foot">
    <a class="sb-link" href="../index.html">{ico('home')}<span>بازگشت به سایت</span></a>
    <a class="sb-link logout" href="admin-login.html" data-logout>{ico('logout')}<span>خروج</span></a>
  </div>
</aside>

<div class="backdrop" id="backdrop"></div>'''


def page(fname, title, sub, body, script, active=None):
    html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="theme-color" content="#1a1a1a" />
  <title>مدیریت دیجی‌پوش | {title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/admin.css" />
  <link rel="stylesheet" href="../assets/css/dp-stock.css" />\n  <link rel="stylesheet" href="../assets/css/dp-cursor.css" />
  <link rel="stylesheet" href="../assets/css/dp-polish.css" />
</head>
<body data-dp-panel>

{sidebar(active or fname)}

<div class="main">
  <header class="topbar">
    <button class="burger" type="button" aria-label="منو">{ico('burger')}</button>
    <div>
      <div class="page-title">{title}</div>
      <div class="page-sub">{sub}</div>
    </div>
  </header>

  <div class="content">
{body}
  </div>
</div>

<div class="toast-wrap"></div>

<script src="../assets/js/dp-safe.js"></script>
<script src="../assets/js/dp-stock.js"></script>
<script src="../assets/js/dp-reset.js"></script>
<script src="../assets/js/dp-taxonomy.js"></script>
<script src="../assets/js/dp-promo.js"></script>
<script src="../assets/js/dp-returns.js"></script>
<script src="../assets/js/dp-reviews.js"></script>
<script src="../seller/js/dp-config.js"></script>
<script src="js/admin-store.js"></script>
<script src="js/admin-script.js"></script>\n<script src="../assets/js/dp-cursor.js"></script>
<script src="../assets/js/dp-polish.js"></script>
<script>
{script}
</script>
</body>
</html>
'''
    (D / fname).write_text(html, encoding='utf-8')
    print('✔', fname)


# ============================================================
# ۱. ورود
# ============================================================
login = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="theme-color" content="#f5f0e8" />
  <title>ورود مدیریت | دیجی‌پوش</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/admin.css" />
</head>
<body data-dp-panel>

<main class="login-wrap">
  <div class="login-card">
    <div class="login-brand">
      <span class="mark">{ico('shield', 'ico')}</span>
      <h1>پنل مدیریت</h1>
      <p>ورود مخصوص مدیر دیجی‌پوش</p>
    </div>

    <div class="notice" id="firstHint" hidden>
      {ico('alert', 'ico ico-sm')}
      <span>نخستین ورود؟ رمز پیش‌فرض <strong id="defPass"></strong> است.
      بعد از ورود، حتماً از بخش تنظیمات آن را عوض کنید.</span>
    </div>

    <form id="loginForm" novalidate>
      <div class="field">
        <label for="pass">رمز مدیریت</label>
        <input class="input" type="password" id="pass" placeholder="••••••••"
               autocomplete="current-password" data-rules="required" />
        <span class="err-msg"></span>
      </div>

      <button class="btn btn-primary btn-block" type="submit" id="btn">ورود به پنل</button>
    </form>

    <p style="text-align:center;margin:18px 0 0;font-size:13px">
      <a href="../index.html" style="color:var(--bronze)">&larr; بازگشت به سایت</a>
    </p>
  </div>
</main>

<div class="toast-wrap"></div>

<script src="../assets/js/dp-reset.js"></script>
<script src="../assets/js/dp-taxonomy.js"></script>
<script src="../assets/js/dp-promo.js"></script>
<script src="../assets/js/dp-returns.js"></script>
<script src="../assets/js/dp-reviews.js"></script>
<script src="../seller/js/dp-config.js"></script>
<script src="js/admin-store.js"></script>
<script src="js/admin-script.js"></script>
<script>
(function () {{
  if (DPAdmin.auth.isLoggedIn()) location.replace('admin-dashboard.html');

  if (DPAdmin.auth.isDefaultPass()) {{
    document.getElementById('defPass').textContent = DPAdmin.DEFAULT_PASS;
    document.getElementById('firstHint').hidden = false;
  }}

  const form = document.getElementById('loginForm');
  const btn = document.getElementById('btn');

  form.addEventListener('submit', async (e) => {{
    e.preventDefault();
    const v = document.getElementById('pass').value;
    if (!v) {{ toast('رمز را وارد کنید.', 'error'); return; }}

    btn.disabled = true;
    try {{
      await DPAdmin.auth.login(v);
      toast('خوش آمدید.', 'success');
      setTimeout(() => (location.href = 'admin-dashboard.html'), 500);
    }} catch (err) {{
      toast(err.message, 'error');
      btn.disabled = false;
    }}
  }});
}})();
</script>
</body>
</html>
'''
(D / 'admin-login.html').write_text(login, encoding='utf-8')
print('✔ admin-login.html')


# ============================================================
# ۲. داشبورد
# ============================================================
def stat(icon, cls, label, sid, unit=''):
    u = f'<span class="stat-unit">{unit}</span>' if unit else ''
    return f'''      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-icon {cls}">{ico(icon)}</span>
          <span class="stat-label">{label}</span>
        </div>
        <span class="stat-number num" id="{sid}">۰</span>{u}
      </div>'''


dash_body = f'''    <div class="notice" id="passWarn" hidden>
      {ico('alert', 'ico ico-sm')}
      <span>رمز مدیریت هنوز پیش‌فرض است.
      <a href="admin-settings.html">همین حالا عوضش کنید</a> تا کسی به پنل دسترسی پیدا نکند.</span>
    </div>

    <div class="stats-grid">
{stat('store', 'si-gold', 'کل فروشگاه‌ها', 'sTotal')}
{stat('clock', 'si-red', 'در انتظار تأیید', 'sPending')}
{stat('check', 'si-green', 'تأییدشده', 'sApproved')}
{stat('box', 'si-blue', 'کل محصولات', 'sProducts')}
    </div>

    <div class="card mb-18">
      <div class="card-head">
        <h2>فروشگاه‌های در انتظار تأیید</h2>
        <a class="btn btn-secondary spacer" href="admin-pending.html">دیدن همه</a>
      </div>
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr><th>فروشگاه</th><th>دسته</th><th>شهر</th><th>تاریخ</th><th>عملیات</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>رویدادهای اخیر</h2></div>
      <div id="logBox"></div>
    </div>'''

dash_js = '''requireAdmin(async () => {
  if (DPAdmin.auth.isDefaultPass()) document.getElementById('passWarn').hidden = false;

  const st = await DPAdmin.stats();
  setNum('sTotal', st.totalSellers);
  setNum('sPending', st.pending);
  setNum('sApproved', st.approved);
  setNum('sProducts', st.totalProducts);

  const list = (await DPAdmin.sellers.list()).filter(s => s.status === 'pending').slice(0, 5);
  const tb = document.getElementById('tbody');

  tb.innerHTML = list.length ? list.map(s => `
    <tr>
      <td><div class="cell-store"><span class="avatar">${s.logo
          ? `<img src="${esc(s.logo)}" alt="" />` : esc(s.storeName[0])}</span>
        <div><div class="cell-name">${esc(s.storeName)}</div>
        <div class="cell-meta">${esc(s.email)}</div></div></div></td>
      <td>${esc(CAT_FA[s.category] || '—')}</td>
      <td>${esc(s.city || '—')}</td>
      <td class="num cell-meta">${esc(s.joinDate || '—')}</td>
      <td><div class="row-actions">
        <a class="act" href="admin-pending.html" title="بررسی">${ICO.eye}</a>
      </div></td>
    </tr>`).join('')
    : '<tr><td colspan="5"><div class="empty">هیچ درخواست تازه‌ای نیست.</div></td></tr>';

  const log = DPAdmin.history();
  document.getElementById('logBox').innerHTML = log.length
    ? log.slice(0, 12).map(l =>
        `<div class="log-item"><time>${esc(l.date)}</time><span>${esc(l.text)}</span></div>`).join('')
    : '<div class="empty">هنوز رویدادی ثبت نشده است.</div>';
});'''

page('admin-dashboard.html', 'داشبورد', 'نمای کلی پلتفرم', dash_body, dash_js)


# ============================================================
# ۳. فهرست فروشگاه‌ها  و  ۴. در انتظار تأیید
# ============================================================
table_body = f'''    <div class="toolbar">
      <div class="search-box">
        {ico('search')}
        <input class="input" type="search" id="search" placeholder="جست‌وجوی نام فروشگاه، ایمیل یا شهر…" />
      </div>
      <select class="select" id="fStatus" style="max-width:200px">
        <option value="">همه‌ی وضعیت‌ها</option>
        <option value="pending">در انتظار تأیید</option>
        <option value="approved">تأییدشده</option>
        <option value="rejected">ردشده</option>
        <option value="suspended">معلق</option>
      </select>
      <select class="select" id="fCat" style="max-width:190px">
        <option value="">همه‌ی دسته‌ها</option>
        <option value="women">پوشاک زنانه</option>
        <option value="men">پوشاک مردانه</option>
        <option value="kids">پوشاک کودک</option>
        <option value="teen">پوشاک نوجوان</option>
      </select>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>فروشگاه</th><th>دسته</th><th>شهر</th>
              <th>محصولات</th><th>کمیسیون</th><th>وضعیت</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- مودال جزئیات -->
    <div class="modal-overlay" id="dModal">
      <div class="modal">
        <div class="modal-head">
          <h3 id="dTitle">جزئیات فروشگاه</h3>
          <button type="button" data-close aria-label="بستن">{ico('x')}</button>
        </div>
        <div class="modal-body" id="dBody"></div>
        <div class="modal-foot" id="dFoot"></div>
      </div>
    </div>

    <!-- مودال رد کردن -->
    <div class="modal-overlay" id="rModal">
      <div class="modal">
        <div class="modal-head">
          <h3>رد کردن درخواست</h3>
          <button type="button" data-close aria-label="بستن">{ico('x')}</button>
        </div>
        <div class="modal-body">
          <p style="margin-top:0;font-size:13.5px;color:var(--gray)">
            دلیل رد را بنویسید. این متن برای فروشنده نمایش داده می‌شود.
          </p>
          <div class="field">
            <label for="rReason">دلیل رد</label>
            <textarea class="textarea" id="rReason"
              placeholder="مثلاً: تصویر مدارک ناخوانا بود."></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-danger" type="button" id="rConfirm">رد کردن</button>
        </div>
      </div>
    </div>

    <!-- مودال کمیسیون -->
    <div class="modal-overlay" id="cModal">
      <div class="modal">
        <div class="modal-head">
          <h3>تنظیم نرخ کمیسیون</h3>
          <button type="button" data-close aria-label="بستن">{ico('x')}</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label for="cRate">درصد کمیسیون این فروشگاه</label>
            <input class="input num" id="cRate" inputmode="decimal" />
            <span class="hint">عددی بین ۰ تا ۱۰۰. پیش‌فرض پلتفرم ۱۰ درصد است.</span>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-primary" type="button" id="cConfirm">ذخیره</button>
        </div>
      </div>
    </div>'''

table_js_tpl = '''requireAdmin(async () => {
  const onlyPending = %s;
  let all = await DPAdmin.sellers.list();
  let current = null;

  const tb = document.getElementById('tbody');
  const fStatus = document.getElementById('fStatus');

  if (onlyPending) { fStatus.value = 'pending'; fStatus.disabled = true; }

  function draw() {
    const q = toEn(document.getElementById('search').value).trim().toLowerCase();
    const st = fStatus.value;
    const cat = document.getElementById('fCat').value;

    let rows = all;
    if (onlyPending) rows = rows.filter(s => s.status === 'pending');
    if (st) rows = rows.filter(s => s.status === st);
    if (cat) rows = rows.filter(s => s.category === cat);
    if (q) rows = rows.filter(s =>
      toEn(`${s.storeName} ${s.email} ${s.city} ${s.fullName}`).toLowerCase().includes(q));

    tb.innerHTML = rows.length ? rows.map(s => `
      <tr>
        <td><div class="cell-store"><span class="avatar">${s.logo
          ? `<img src="${esc(s.logo)}" alt="" />` : esc(s.storeName[0])}</span>
          <div><div class="cell-name">${esc(s.storeName)}</div>
          <div class="cell-meta">${esc(s.fullName || s.email)}</div></div></div></td>
        <td>${esc(CAT_FA[s.category] || '—')}</td>
        <td>${esc(s.city || '—')}</td>
        <td class="num">${fa(s.activeCount)} از ${fa(s.productCount)}</td>
        <td class="num">${fa(s.commissionRate)}٪</td>
        <td>${statusBadge(s.status)}${s.reviewRequested
          ? '<span class="badge b-info" style="margin-inline-start:5px">درخواست بررسی</span>' : ''}</td>
        <td><div class="row-actions">
          <a class="act" href="admin-seller.html?id=${encodeURIComponent(s.id)}" title="جزئیات و پرونده‌ی کامل">${ICO.eye}</a>
          ${s.status !== 'approved'
            ? `<button class="act ok" type="button" data-ok="${esc(s.id)}" title="تأیید">${ICO.check}</button>` : ''}
          ${s.status !== 'rejected'
            ? `<button class="act no" type="button" data-no="${esc(s.id)}" title="رد">${ICO.x}</button>` : ''}
        </div></td>
      </tr>`).join('')
      : `<tr><td colspan="7"><div class="empty">${onlyPending
          ? 'هیچ فروشگاهی در انتظار تأیید نیست.' : 'فروشگاهی یافت نشد.'}</div></td></tr>`;
  }

  async function refresh() { all = await DPAdmin.sellers.list(); draw(); paintBadges(); }

  /* ---------- تأیید ---------- */
  async function approve(id) {
    const res = await DPAdmin.sellers.setStatus(id, 'approved');
    toast(res?.published
      ? `فروشگاه تأیید شد و ${fa(res.published)} محصول از پیش‌نویس درآمد.`
      : 'فروشگاه تأیید شد.', 'success');
    closeModal('dModal');
    await refresh();
  }

  /* ---------- جدول ---------- */
  tb.addEventListener('click', async (e) => {
    const view = e.target.closest('[data-view]');
    const ok   = e.target.closest('[data-ok]');
    const no   = e.target.closest('[data-no]');

    if (ok) { await approve(ok.dataset.ok); return; }

    if (no) {
      current = no.dataset.no;
      document.getElementById('rReason').value = '';
      openModal('rModal');
      return;
    }

    if (view) {
      const s = all.find(x => x.id === view.dataset.view);
      if (!s) return;
      current = s.id;

      document.getElementById('dTitle').textContent = s.storeName;
      document.getElementById('dBody').innerHTML = `
        <div class="info-row"><span class="k">وضعیت</span><span class="v">${statusBadge(s.status)}</span></div>
        <div class="info-row"><span class="k">نام مالک</span><span class="v">${esc(s.fullName || '—')}</span></div>
        <div class="info-row"><span class="k">ایمیل</span><span class="v">${esc(s.email || '—')}</span></div>
        <div class="info-row"><span class="k">تلفن</span><span class="v num">${esc(s.phone || '—')}</span></div>
        <div class="info-row"><span class="k">دسته‌بندی</span><span class="v">${esc(CAT_FA[s.category] || '—')}</span></div>
        <div class="info-row"><span class="k">شهر</span><span class="v">${esc(s.city || '—')}</span></div>
        <div class="info-row"><span class="k">نشانی</span><span class="v">${esc(s.address || '—')}</span></div>
        <div class="info-row"><span class="k">کد ملی</span><span class="v num">${esc(s.nationalId || '—')}</span></div>
        <div class="info-row"><span class="k">شماره شبا</span><span class="v num">${esc(s.shaba || '—')}</span></div>
        <div class="info-row"><span class="k">توضیح فروشگاه</span><span class="v">${esc(s.description || '—')}</span></div>
        <div class="info-row"><span class="k">محصولات</span><span class="v num">${fa(s.activeCount)} فعال از ${fa(s.productCount)}</span></div>
        <div class="info-row"><span class="k">نرخ کمیسیون</span><span class="v num">${fa(s.commissionRate)}٪</span></div>
        <div class="info-row"><span class="k">تاریخ ثبت‌نام</span><span class="v num">${esc(s.joinDate || '—')}</span></div>
        ${s.rejectionReason
          ? `<div class="info-row"><span class="k">دلیل رد</span><span class="v" style="color:var(--danger)">${esc(s.rejectionReason)}</span></div>` : ''}`;

      document.getElementById('dFoot').innerHTML = `
        <button class="btn btn-secondary" type="button" data-close>بستن</button>
        <button class="btn btn-secondary" type="button" id="dComm">نرخ کمیسیون</button>
        ${s.status !== 'rejected' ? '<button class="btn btn-danger" type="button" id="dNo">رد</button>' : ''}
        ${s.status !== 'approved' ? '<button class="btn btn-success" type="button" id="dOk">تأیید فروشگاه</button>' : ''}
        ${s.status === 'approved' ? '<button class="btn btn-secondary" type="button" id="dSusp">تعلیق</button>' : ''}`;

      document.getElementById('dOk')?.addEventListener('click', () => approve(s.id));
      document.getElementById('dNo')?.addEventListener('click', () => {
        closeModal('dModal');
        document.getElementById('rReason').value = '';
        openModal('rModal');
      });
      document.getElementById('dSusp')?.addEventListener('click', async () => {
        await DPAdmin.sellers.setStatus(s.id, 'suspended');
        toast('فروشگاه معلق شد.', 'warning');
        closeModal('dModal');
        await refresh();
      });
      document.getElementById('dComm')?.addEventListener('click', () => {
        closeModal('dModal');
        document.getElementById('cRate').value = fa(s.commissionRate);
        openModal('cModal');
      });

      openModal('dModal');
    }
  });

  /* ---------- رد کردن ---------- */
  document.getElementById('rConfirm').addEventListener('click', async () => {
    const reason = document.getElementById('rReason').value.trim();
    if (!reason) { toast('لطفاً دلیل رد را بنویسید.', 'warning'); return; }
    await DPAdmin.sellers.setStatus(current, 'rejected', reason);
    toast('درخواست رد شد.', 'success');
    closeModal('rModal');
    await refresh();
  });

  /* ---------- کمیسیون ---------- */
  document.getElementById('cConfirm').addEventListener('click', async () => {
    const rate = Number(toEn(document.getElementById('cRate').value).replace(/[^\\d.]/g, ''));
    try {
      await DPAdmin.sellers.setCommission(current, rate);
      toast('نرخ کمیسیون ذخیره شد.', 'success');
      closeModal('cModal');
      await refresh();
    } catch (err) { toast(err.message, 'error'); }
  });

  let t;
  document.getElementById('search').addEventListener('input', () => {
    clearTimeout(t); t = setTimeout(draw, 260);
  });
  fStatus.addEventListener('change', draw);
  document.getElementById('fCat').addEventListener('change', draw);

  draw();
});'''

page('admin-sellers.html', 'فروشگاه‌ها', 'مدیریت همه‌ی فروشندگان',
     table_body, table_js_tpl % 'false')

page('admin-pending.html', 'در انتظار تأیید', 'بررسی درخواست‌های تازه',
     table_body, table_js_tpl % 'true')


# ============================================================
# ۵. تنظیمات
# ============================================================
settings_body = f'''    <div class="card mb-18" style="max-width:560px">
      <div class="card-head"><h2>تغییر رمز مدیریت</h2></div>

      <div class="notice" id="defWarn" hidden>
        {ico('alert', 'ico ico-sm')}
        <span>رمز شما هنوز پیش‌فرض است. لطفاً همین حالا عوضش کنید.</span>
      </div>

      <form id="passForm" novalidate>
        <div class="field">
          <label for="oldPass">رمز فعلی</label>
          <input class="input" type="password" id="oldPass" autocomplete="current-password" />
          <span class="err-msg"></span>
        </div>
        <div class="field">
          <label for="newPass">رمز تازه <span class="hint">(حداقل ۶ نویسه)</span></label>
          <input class="input" type="password" id="newPass" autocomplete="new-password" />
          <span class="err-msg"></span>
        </div>
        <div class="field">
          <label for="newPass2">تکرار رمز تازه</label>
          <input class="input" type="password" id="newPass2" autocomplete="new-password" />
          <span class="err-msg"></span>
        </div>
        <button class="btn btn-primary" type="submit" id="passBtn">ذخیره‌ی رمز تازه</button>
      </form>
    </div>

    <div class="card" style="max-width:560px">
      <div class="card-head"><h2>وضعیت ذخیره‌سازی</h2></div>
      <div class="info-row"><span class="k">محل ذخیره‌ی داده‌ها</span><span class="v" id="mode">—</span></div>
      <div class="info-row"><span class="k">کل فروشگاه‌ها</span><span class="v num" id="mTotal">—</span></div>
      <div class="info-row"><span class="k">کل محصولات</span><span class="v num" id="mProducts">—</span></div>
      <p class="hint" style="margin-top:14px;line-height:1.9" id="modeHint"></p>
    </div>'''

settings_js = '''requireAdmin(async () => {
  if (DPAdmin.auth.isDefaultPass()) document.getElementById('defWarn').hidden = false;

  const form = document.getElementById('passForm');
  const btn = document.getElementById('passBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const a = document.getElementById('oldPass').value;
    const b = document.getElementById('newPass').value;
    const c = document.getElementById('newPass2').value;

    if (!a || !b) { toast('همه‌ی فیلدها را پر کنید.', 'error'); return; }
    if (b !== c) { toast('رمز تازه و تکرارش یکسان نیستند.', 'error'); return; }

    btn.disabled = true;
    try {
      await DPAdmin.auth.changePass(a, b);
      toast('رمز مدیریت عوض شد.', 'success');
      form.reset();
      document.getElementById('defWarn').hidden = true;
    } catch (err) { toast(err.message, 'error'); }
    btn.disabled = false;
  });

  const st = await DPAdmin.stats();
  document.getElementById('mTotal').textContent = fa(st.totalSellers);
  document.getElementById('mProducts').textContent = fa(st.totalProducts);

  const local = DPAdmin.mode === 'local';
  document.getElementById('mode').textContent = local ? 'همین مرورگر' : 'سرور Supabase';
  document.getElementById('modeHint').textContent = local
    ? 'داده‌ها روی همین مرورگر ذخیره می‌شوند. برای آنلاین‌کردن، آدرس و کلید Supabase را در فایل seller/js/dp-config.js بگذارید.'
    : 'داده‌ها روی سرور ذخیره می‌شوند و از هر دستگاهی در دسترس‌اند.';
});'''

page('admin-settings.html', 'تنظیمات', 'رمز مدیریت و وضعیت سامانه',
     settings_body, settings_js)

print('\nپنل مدیریت ساخته شد.')


# ============================================================
#  صفحه‌های تازه‌ی ادمین
# ============================================================

# ---------- ۱. سیاست کمیسیون ----------
policy_body = f'''    <div class="notice">
      {ico('alert', 'ico ico-sm')}
      <span>می‌توانید برای یک فروشگاه — یا حتی یک محصول خاص — در بازه‌ی زمانی مشخص
      نرخ کمیسیون را کم کنید. پس از پایان بازه، نرخ خودکار به حالت عادی برمی‌گردد.</span>
    </div>

    <div class="stats-grid">
{stat('percent', 'si-gold', 'سیاست‌های فعال', 'pLive')}
{stat('clock', 'si-blue', 'در انتظار شروع', 'pSoon')}
{stat('store', 'si-green', 'فروشگاه‌های مشمول', 'pShops')}
{stat('check', 'si-blue', 'کل سیاست‌ها', 'pAll')}
    </div>

    <div class="card mb-18">
      <div class="card-head">
        <h2>سیاست تازه</h2>
        <span class="sub spacer" style="font-size:12px;color:var(--gray)">نرخ ویژه برای بازه‌ی زمانی</span>
      </div>

      <form id="polForm" novalidate>
        <div class="field">
          <label for="cTitle">عنوان سیاست</label>
          <input class="input" id="cTitle" placeholder="مثلاً: حمایت از فروشندگان تازه" />
        </div>

        <div class="field">
          <label for="cShop">فروشگاه <span style="color:var(--danger)">*</span></label>
          <select class="select" id="cShop"><option value="">انتخاب کنید</option></select>
        </div>

        <div class="field">
          <label for="cProd">محصول <span class="hint">(اختیاری — خالی یعنی همه‌ی محصولات)</span></label>
          <select class="select" id="cProd"><option value="">همه‌ی محصولات این فروشگاه</option></select>
        </div>

        <div class="field">
          <label for="cRate">نرخ کمیسیون ویژه <span style="color:var(--danger)">*</span></label>
          <input class="input num" id="cRate" inputmode="decimal" placeholder="۵" />
          <span class="hint">درصدی بین ۰ تا ۱۰۰ — کمتر از نرخ عادی یعنی تخفیف برای فروشنده</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="field">
            <label for="cFrom">تاریخ شروع <span style="color:var(--danger)">*</span></label>
            <input class="input" id="cFrom" type="date" />
          </div>
          <div class="field">
            <label for="cTo">تاریخ پایان <span style="color:var(--danger)">*</span></label>
            <input class="input" id="cTo" type="date" />
          </div>
        </div>

        <button class="btn btn-primary" type="submit" id="polBtn">ثبت سیاست</button>
      </form>
    </div>

    <div class="card">
      <div class="card-head"><h2>سیاست‌های ثبت‌شده</h2></div>
      <div id="polList"></div>
    </div>'''

policy_js = '''requireAdmin(async () => {
  const P = window.DPPromo;
  const el = (i) => document.getElementById(i);

  const today = P.todayISO();
  const m = new Date(); m.setMonth(m.getMonth() + 1);
  el('cFrom').value = today;
  el('cTo').value = m.toISOString().slice(0, 10);

  const shops = await DPAdmin.sellers.list();
  el('cShop').innerHTML = '<option value="">انتخاب کنید</option>' +
    shops.map(s => `<option value="${esc(s.id)}">${esc(s.storeName)}</option>`).join('');

  const allProds = (() => {
    try { return JSON.parse(localStorage.getItem('dp_products')) || []; } catch { return []; }
  })();

  /* با انتخاب فروشگاه، فهرست محصولاتش پر می‌شود */
  el('cShop').addEventListener('change', () => {
    const id = el('cShop').value;
    const mine = allProds.filter(p => p.sellerId === id);
    el('cProd').innerHTML = '<option value="">همه‌ی محصولات این فروشگاه</option>' +
      mine.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  });

  el('polForm').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      P.commissions.add({
        title: el('cTitle').value,
        sellerId: el('cShop').value,
        productId: el('cProd').value,
        rate: el('cRate').value,
        from: el('cFrom').value,
        to: el('cTo').value,
      });
      toast('سیاست کمیسیون ثبت شد.', 'success');
      el('polForm').reset();
      el('cFrom').value = today;
      el('cTo').value = m.toISOString().slice(0, 10);
      draw();
    } catch (err) { toast(err.message, 'error'); }
  });

  function draw() {
    const rows = P.commissions.list();
    const n = { live: 0, soon: 0, ended: 0, paused: 0 };
    const shopSet = new Set();

    rows.forEach(r => {
      const s = P.statusOf(r);
      n[s]++;
      if (s === 'live') shopSet.add(r.sellerId);
    });

    setNum('pLive', n.live);
    setNum('pSoon', n.soon);
    setNum('pShops', shopSet.size);
    setNum('pAll', rows.length);

    el('polList').innerHTML = rows.length ? rows.map(r => {
      const st = P.statusOf(r);
      const b = P.STATUS_FA[st];
      const shop = shops.find(s => s.id === r.sellerId);
      const prod = r.productId ? allProds.find(p => String(p.id) === String(r.productId)) : null;

      return `
        <div class="pol-row">
          <div class="pol-rate">${fa(r.rate)}<small>٪</small></div>
          <div class="pol-info">
            <div class="pol-top">
              <strong>${esc(r.title)}</strong>
              <span class="badge ${b.cls}">${b.label}</span>
            </div>
            <span class="pol-sub">${esc(shop ? shop.storeName : '—')}
              ${prod ? ' › ' + esc(prod.name) : ' › همه‌ی محصولات'}</span>
            <span class="pol-sub">${P.faDate(r.from)} تا ${P.faDate(r.to)}</span>
          </div>
          <div class="row-actions">
            <button class="act" type="button" data-t="${esc(r.id)}"
                    title="${r.off ? 'فعال کردن' : 'متوقف کردن'}">${r.off ? '▸' : '❚❚'}</button>
            <button class="act no" type="button" data-d="${esc(r.id)}" title="حذف">✕</button>
          </div>
        </div>`;
    }).join('') : '<div class="empty">هنوز سیاستی ثبت نشده است.</div>';
  }

  el('polList').addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]');
    const d = e.target.closest('[data-d]');
    if (t) { P.commissions.toggle(t.dataset.t); draw(); toast('وضعیت عوض شد.', 'success'); }
    if (d) { P.commissions.remove(d.dataset.d); draw(); toast('سیاست حذف شد.', 'success'); }
  });

  draw();
});'''

page('admin-policy.html', 'سیاست کمیسیون', 'نرخ ویژه برای فروشگاه یا محصول', policy_body, policy_js)


# ---------- ۲. همه‌ی محصولات ----------
catalog_body = f'''    <div class="toolbar">
      <div class="search-box">
        {ico('search')}
        <input class="input" type="search" id="search" placeholder="جست‌وجوی نام کالا یا فروشگاه…" />
      </div>
      <select class="select" id="fShop" style="max-width:210px">
        <option value="">همه‌ی فروشگاه‌ها</option>
      </select>
      <select class="select" id="fSec" style="max-width:180px">
        <option value="">همه‌ی بخش‌ها</option>
        <option value="women">پوشاک زنانه</option>
        <option value="men">پوشاک مردانه</option>
        <option value="kids">پوشاک کودک</option>
        <option value="teen">پوشاک نوجوان</option>
      </select>
      <select class="select" id="fSt" style="max-width:170px">
        <option value="">همه‌ی وضعیت‌ها</option>
        <option value="active">فعال</option>
        <option value="draft">پیش‌نویس</option>
        <option value="out_of_stock">ناموجود</option>
        <option value="archived">بایگانی</option>
      </select>
    </div>

    <div class="stats-grid">
{stat('box', 'si-gold', 'کل محصولات', 'cAll')}
{stat('check', 'si-green', 'فعال', 'cLive')}
{stat('clock', 'si-blue', 'پیش‌نویس', 'cDraft')}
{stat('percent', 'si-red', 'تخفیف‌دار', 'cSale')}
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>محصول</th><th>فروشگاه</th><th>بخش</th>
              <th>قیمت</th><th>موجودی</th><th>فروش</th><th>وضعیت</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>'''

catalog_js = '''requireAdmin(async () => {
  const el = (i) => document.getElementById(i);
  const P = window.DPPromo;
  const T = window.DPTaxonomy;

  const shops = await DPAdmin.sellers.list();
  const byId = {};
  shops.forEach(s => byId[s.id] = s);

  el('fShop').innerHTML = '<option value="">همه‌ی فروشگاه‌ها</option>' +
    shops.map(s => `<option value="${esc(s.id)}">${esc(s.storeName)}</option>`).join('');

  const prods = (() => {
    try { return JSON.parse(localStorage.getItem('dp_products')) || []; } catch { return []; }
  })();

  const ST = {
    active: ['فعال', 'b-success'], draft: ['پیش‌نویس', 'b-warning'],
    out_of_stock: ['ناموجود', 'b-danger'], archived: ['بایگانی', 'b-gray'],
  };

  function draw() {
    const q = toEn(el('search').value).trim().toLowerCase();
    const sh = el('fShop').value, sc = el('fSec').value, st = el('fSt').value;

    let rows = prods.map(p => {
      const shop = byId[p.sellerId];
      const sec = p.section || (T && T.findByItem(p.category) ? T.findByItem(p.category).section : '');
      const sale = P.sales.forProduct(p.id, p.sellerId);
      return { ...p, shopName: shop ? shop.storeName : '—', sec, sale };
    });

    setNum('cAll', rows.length);
    setNum('cLive', rows.filter(r => r.status === 'active').length);
    setNum('cDraft', rows.filter(r => r.status === 'draft').length);
    setNum('cSale', rows.filter(r => r.sale).length);

    if (sh) rows = rows.filter(r => r.sellerId === sh);
    if (sc) rows = rows.filter(r => r.sec === sc);
    if (st) rows = rows.filter(r => r.status === st);
    if (q) rows = rows.filter(r =>
      toEn(`${r.name} ${r.category} ${r.shopName}`).toLowerCase().includes(q));

    el('tbody').innerHTML = rows.length ? rows.map(r => {
      const s = ST[r.status] || ST.draft;
      const price = r.sale
        ? `<span class="old-p">${money(r.price)}</span>
           <b>${money(Math.round(r.price * (100 - r.sale.percent) / 100))}</b>
           <em class="off">${fa(r.sale.percent)}٪</em>`
        : money(r.price);

      return `
        <tr>
          <td><div class="cell-store">
            <span class="avatar">${r.images && r.images[0]
              ? `<img src="${esc(r.images[0])}" alt="" />` : esc(r.name.charAt(0))}</span>
            <div><div class="cell-name">${esc(r.name)}</div>
            <div class="cell-meta">${esc(r.category || '—')}</div></div></div></td>
          <td>${esc(r.shopName)}</td>
          <td>${esc(r.sec ? T.sectionLabel(r.sec) : '—')}</td>
          <td class="num">${price}</td>
          <td class="num">${Number(r.stock) === 0
            ? '<span style="color:var(--danger)">۰</span>' : fa(r.stock)}</td>
          <td class="num">${fa(r.sales || 0)}</td>
          <td>${'<span class="badge ' + s[1] + '">' + s[0] + '</span>'}</td>
        </tr>`;
    }).join('') : '<tr><td colspan="7"><div class="empty">محصولی یافت نشد.</div></td></tr>';
  }

  let t;
  el('search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
  ['fShop', 'fSec', 'fSt'].forEach(i => el(i).addEventListener('change', draw));

  draw();
});'''

page('admin-catalog.html', 'همه‌ی محصولات', 'نمای کامل کالاهای همه‌ی فروشگاه‌ها',
     catalog_body, catalog_js)


# ---------- ۳. همه‌ی سفارش‌ها ----------
orders_body = f'''    <div class="toolbar">
      <div class="search-box">
        {ico('search')}
        <input class="input" type="search" id="search" placeholder="شماره سفارش، مشتری یا فروشگاه…" />
      </div>
      <select class="select" id="fShop" style="max-width:210px">
        <option value="">همه‌ی فروشگاه‌ها</option>
      </select>
      <select class="select" id="fSt" style="max-width:180px">
        <option value="">همه‌ی وضعیت‌ها</option>
        <option value="pending">در انتظار</option>
        <option value="confirmed">تأیید شده</option>
        <option value="shipped">ارسال شده</option>
        <option value="delivered">تحویل شده</option>
        <option value="cancelled">لغو شده</option>
      </select>
    </div>

    <div class="stats-grid">
{stat('list', 'si-gold', 'کل سفارش‌ها', 'oAll')}
{stat('clock', 'si-blue', 'در انتظار', 'oPend')}
{stat('check', 'si-green', 'تحویل شده', 'oDone')}
{stat('wallet', 'si-gold', 'گردش مالی', 'oSum', 'تومان')}
    </div>

    <div class="card mb-18">
      <div class="card-head"><h2>کمیسیون پلتفرم</h2></div>
      <div class="info-row"><span class="k">درآمد کمیسیون</span><span class="v num" id="oComm">—</span></div>
      <div class="info-row"><span class="k">مبلغ مرجوعی‌شده</span><span class="v num" id="oRet">—</span></div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>شماره</th><th>مشتری</th><th>فروشگاه</th>
              <th>اقلام</th><th>مبلغ</th><th>کمیسیون</th><th>وضعیت</th><th>تاریخ</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>'''

orders_js = '''requireAdmin(async () => {
  const el = (i) => document.getElementById(i);
  const P = window.DPPromo;
  const R = window.DPReturns;

  const shops = await DPAdmin.sellers.list();
  const byId = {};
  shops.forEach(s => byId[s.id] = s);

  el('fShop').innerHTML = '<option value="">همه‌ی فروشگاه‌ها</option>' +
    shops.map(s => `<option value="${esc(s.id)}">${esc(s.storeName)}</option>`).join('');

  const orders = (() => {
    try { return (JSON.parse(localStorage.getItem('dp_orders')) || []).reverse(); }
    catch { return []; }
  })();

  const ST = {
    pending: ['در انتظار', 'b-warning'], confirmed: ['تأیید شده', 'b-info'],
    shipped: ['ارسال شده', 'b-info'], delivered: ['تحویل شده', 'b-success'],
    cancelled: ['لغو شده', 'b-danger'],
  };

  /** کمیسیون واقعی یک سفارش — با احتساب سیاست‌های ادمین */
  function commOf(o) {
    const shop = byId[o.sellerId];
    const base = shop ? shop.commissionRate : 10;
    let sum = 0;
    (o.lines || []).forEach(l => {
      const rate = P.commissions.rateFor(o.sellerId, l.productId, base);
      sum += (Number(l.price) || 0) * (Number(l.qty) || 1) * rate / 100;
    });
    if (!o.lines || !o.lines.length) sum = (o.total || 0) * base / 100;
    return Math.round(sum);
  }

  function draw() {
    const q = toEn(el('search').value).trim().toLowerCase();
    const sh = el('fShop').value, st = el('fSt').value;

    let rows = orders.map(o => ({
      ...o,
      shopName: byId[o.sellerId] ? byId[o.sellerId].storeName : '—',
      comm: commOf(o),
    }));

    const live = rows.filter(r => r.status !== 'cancelled');
    setNum('oAll', rows.length);
    setNum('oPend', rows.filter(r => r.status === 'pending').length);
    setNum('oDone', rows.filter(r => r.status === 'delivered').length);
    el('oSum').textContent = money(live.reduce((a, r) => a + (r.total || 0), 0));
    el('oComm').textContent = money(live.reduce((a, r) => a + r.comm, 0)) + ' تومان';

    const refunded = R.all().filter(x => x.status === 'approved')
      .reduce((a, x) => a + x.amount, 0);
    el('oRet').textContent = money(refunded) + ' تومان';

    if (sh) rows = rows.filter(r => r.sellerId === sh);
    if (st) rows = rows.filter(r => r.status === st);
    if (q) rows = rows.filter(r =>
      toEn(`${r.id} ${r.customer} ${r.shopName}`).toLowerCase().includes(q));

    el('tbody').innerHTML = rows.length ? rows.map(r => {
      const s = ST[r.status] || ST.pending;
      const items = (r.lines || []).map(l => `${l.name} ×${fa(l.qty)}`).join('، ')
        || (r.items || []).join('، ') || '—';
      return `
        <tr>
          <td class="num" style="font-weight:700;color:var(--gold)">${esc(r.id)}</td>
          <td><div class="cell-name">${esc(r.customer || '—')}</div>
              <div class="cell-meta num">${esc(r.phone || '')}</div></td>
          <td>${esc(r.shopName)}</td>
          <td class="cell-meta" style="max-width:220px">${esc(items)}</td>
          <td class="num">${money(r.total)}</td>
          <td class="num" style="color:var(--bronze)">${money(r.comm)}</td>
          <td><span class="badge ${s[1]}">${s[0]}</span></td>
          <td class="num cell-meta">${esc(r.date || '—')}</td>
        </tr>`;
    }).join('') : '<tr><td colspan="8"><div class="empty">سفارشی یافت نشد.</div></td></tr>';
  }

  let t;
  el('search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
  ['fShop', 'fSt'].forEach(i => el(i).addEventListener('change', draw));

  draw();
});'''

page('admin-orders.html', 'همه‌ی سفارش‌ها', 'نمای کامل سفارش‌های همه‌ی فروشگاه‌ها',
     orders_body, orders_js)

print('\nسه صفحه‌ی تازه‌ی ادمین ساخته شد.')


# ============================================================
#  صفحه‌ی نظرها — پنل مدیریت
# ============================================================
rev_body = f'''    <div class="notice">
      {ico('alert', 'ico ico-sm')}
      <span>همه‌ی نظرهای سایت اینجاست. اگر فروشنده‌ای نظری را گزارش کند،
      با نشان قرمز بالای فهرست می‌آید. می‌توانید نظر را از سایت بردارید،
      یا گزارش را رد کنید تا نظر سر جایش بماند.</span>
    </div>

    <div class="stats-grid">
{stat('chat', 'si-gold', 'کل نظرها', 'rAll')}
{stat('flag', 'si-red', 'گزارش‌شده', 'rFlag')}
{stat('star', 'si-green', 'میانگین امتیاز', 'rAvg')}
{stat('x', 'si-blue', 'برداشته‌شده', 'rHide')}
    </div>

    <div class="toolbar">
      <div class="search-box">
        {ico('search')}
        <input class="input" type="search" id="search" placeholder="نام مشتری، فروشگاه یا متن نظر…" />
      </div>
      <select class="select" id="fShop" style="max-width:210px">
        <option value="">همه‌ی فروشگاه‌ها</option>
      </select>
      <select class="select" id="fType" style="max-width:190px">
        <option value="">همه‌ی نظرها</option>
        <option value="flag">گزارش‌شده</option>
        <option value="low">امتیاز پایین (۱ و ۲)</option>
        <option value="hidden">برداشته‌شده</option>
        <option value="noreply">بدون پاسخ فروشنده</option>
      </select>
    </div>

    <div class="card">
      <div id="revList"></div>
    </div>

    <div class="modal-overlay" id="actModal">
      <div class="modal">
        <div class="modal-head">
          <h3 id="actTitle">بررسی نظر</h3>
          <button type="button" data-close aria-label="بستن">{ico('x')}</button>
        </div>
        <div class="modal-body">
          <div class="rq" id="actQuote"></div>
          <div class="field">
            <label for="actNote">یادداشت شما <span class="hint">(برای فروشنده دیده می‌شود)</span></label>
            <textarea class="textarea" id="actNote" placeholder="مثلاً: نظر بررسی شد و مشکلی نداشت."></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-primary" type="button" id="actOk">تأیید</button>
        </div>
      </div>
    </div>'''

rev_js = '''requireAdmin(async () => {
  const V = window.DPReviews;
  const el = (i) => document.getElementById(i);
  let current = null, mode = '';

  const shops = await DPAdmin.sellers.list();
  const byId = {};
  shops.forEach(s => byId[s.id] = s);

  el('fShop').innerHTML = '<option value="">همه‌ی فروشگاه‌ها</option>' +
    shops.map(s => `<option value="${esc(s.id)}">${esc(s.storeName)}</option>`).join('');

  const prods = (() => {
    try { return JSON.parse(localStorage.getItem('dp_products')) || []; } catch { return []; }
  })();
  const pName = {};
  prods.forEach(p => pName[String(p.id)] = p.name);

  function stars(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += `<svg class="st ${i <= n ? 'st-full' : 'st-empty'}" viewBox="0 0 24 24"
            aria-hidden="true"><path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/></svg>`;
    }
    return `<span class="stars">${s}</span>`;
  }

  function draw() {
    const q = toEn(el('search').value).trim().toLowerCase();
    const sh = el('fShop').value;
    const ft = el('fType').value;

    let rows = V.admin.all().map(r => ({
      ...r,
      shopName: byId[r.sellerId] ? byId[r.sellerId].storeName : '—',
      about: r.kind === 'store' ? 'فروشگاه' : (pName[String(r.targetId)] || 'محصول'),
    }));

    const total = rows.length;
    const flagged = rows.filter(r => r.flagged && !r.reviewed).length;
    const hidden = rows.filter(r => r.hidden).length;
    const sum = rows.reduce((a, r) => a + r.rating, 0);

    setNum('rAll', total);
    setNum('rFlag', flagged);
    setNum('rHide', hidden);
    el('rAvg').textContent = total
      ? fa(Math.round(sum / total * 10) / 10).replace('.', '٫') : '—';

    const bf = el('badgeFlag');
    if (bf) { flagged ? (bf.textContent = fa(flagged), bf.hidden = false) : (bf.hidden = true); }

    if (sh) rows = rows.filter(r => r.sellerId === sh);
    if (ft === 'flag') rows = rows.filter(r => r.flagged);
    if (ft === 'low') rows = rows.filter(r => r.rating <= 2);
    if (ft === 'hidden') rows = rows.filter(r => r.hidden);
    if (ft === 'noreply') rows = rows.filter(r => !r.reply);
    if (q) rows = rows.filter(r =>
      toEn(`${r.userName} ${r.text} ${r.shopName}`).toLowerCase().includes(q));

    /* گزارش‌های بررسی‌نشده اول بیایند */
    rows.sort((a, b) => (b.flagged && !b.reviewed ? 1 : 0) - (a.flagged && !a.reviewed ? 1 : 0));

    el('revList').innerHTML = rows.length ? rows.map(r => `
      <div class="rev-row${r.hidden ? ' is-hidden' : ''}${
        r.flagged && !r.reviewed ? ' is-flag' : ''}">
        <span class="rev-ava">${esc((r.userName || '؟').charAt(0))}</span>

        <div class="rev-main">
          <div class="rev-top">
            <strong>${esc(r.userName)}</strong>
            ${stars(Math.round(r.rating))}
            <span class="rev-about">${esc(r.shopName)} › ${esc(r.about)}</span>
            <time>${esc(r.date)}</time>
          </div>

          ${r.text ? `<p class="rev-txt">${esc(r.text)}</p>` : '<p class="rev-txt dim">— بدون متن —</p>'}

          ${r.flagged ? `<div class="rev-flag${r.reviewed ? '' : ' bad'}">
            <b>گزارش فروشنده:</b> ${esc(r.flagReason)}
            ${r.reviewed ? ' · بررسی شد' : ' · در انتظار بررسی شما'}</div>` : ''}

          ${r.adminNote ? `<div class="rev-flag">یادداشت شما: ${esc(r.adminNote)}</div>` : ''}
          ${r.hidden ? '<div class="rev-flag bad">این نظر از سایت برداشته شده است</div>' : ''}

          ${r.reply ? `<div class="rev-rep">
            <div class="rev-rep-top"><b>پاسخ فروشنده</b><time>${esc(r.replyDate || '')}</time></div>
            <p>${esc(r.reply)}</p></div>` : ''}

          <div class="rev-acts">
            ${r.hidden
              ? `<button class="btn btn-secondary btn-sm" type="button" data-un="${esc(r.id)}">برگرداندن به سایت</button>`
              : `<button class="btn btn-secondary btn-sm" type="button" data-hd="${esc(r.id)}">برداشتن از سایت</button>`}
            ${r.flagged && !r.reviewed
              ? `<button class="btn btn-secondary btn-sm" type="button" data-ds="${esc(r.id)}">رد گزارش</button>` : ''}
            <button class="btn btn-danger btn-sm" type="button" data-rm="${esc(r.id)}">حذف کامل</button>
          </div>
        </div>
      </div>`).join('')
      : '<div class="empty">نظری با این فیلتر پیدا نشد.</div>';
  }

  el('revList').addEventListener('click', (e) => {
    const hd = e.target.closest('[data-hd]');
    const un = e.target.closest('[data-un]');
    const ds = e.target.closest('[data-ds]');
    const rm = e.target.closest('[data-rm]');

    if (un) { V.admin.unhide(un.dataset.un); toast('نظر به سایت برگشت.', 'success'); draw(); return; }

    if (rm) {
      V.admin.remove(rm.dataset.rm);
      toast('نظر برای همیشه حذف شد.', 'success');
      draw();
      return;
    }

    if (hd || ds) {
      current = (hd || ds).dataset.hd || (hd || ds).dataset.ds;
      mode = hd ? 'hide' : 'dismiss';

      const r = V.admin.all().find(x => x.id === current);
      el('actTitle').textContent = hd ? 'برداشتن نظر از سایت' : 'رد کردن گزارش';
      el('actQuote').innerHTML = `<b>${esc(r.userName)}:</b> ${esc(r.text || '— بدون متن —')}`;
      el('actNote').value = '';
      el('actOk').textContent = hd ? 'برداشتن از سایت' : 'رد گزارش';
      el('actOk').className = hd ? 'btn btn-danger' : 'btn btn-primary';
      openModal('actModal');
    }
  });

  el('actOk').addEventListener('click', () => {
    const note = el('actNote').value;
    if (mode === 'hide') { V.admin.hide(current, note); toast('نظر از سایت برداشته شد.', 'success'); }
    else { V.admin.dismiss(current, note); toast('گزارش رد شد — نظر سر جایش ماند.', 'success'); }
    closeModal('actModal');
    draw();
  });

  let t;
  el('search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
  ['fShop', 'fType'].forEach(i => el(i).addEventListener('change', draw));

  draw();
});'''

page('admin-reviews.html', 'نظرها', 'بررسی نظرهای مشتریان و گزارش‌های فروشندگان',
     rev_body, rev_js)
