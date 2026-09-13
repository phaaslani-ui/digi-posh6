# -*- coding: utf-8 -*-
"""سازنده‌ی صفحه‌های «سیاست فروش» و «مرجوعی» پنل فروشنده"""
import pathlib, re

D = pathlib.Path(__file__).parent
SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"'

ICO = {
    'dash':    '<rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/>',
    'box':     '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    'cart':    '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
    'wallet':  '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.5 12.5h4"/><circle cx="16.8" cy="12.5" r="1"/>',
    'user':    '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    'percent': '<path d="m6 18 12-12"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    'back':    '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.6h-4.6"/>',
    'home':    '<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20z"/><path d="M9.5 21.5v-7h5v7"/>',
    'logout':  '<path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/>',
    'burger':  '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'bell':    '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
    'plus':    '<path d="M12 5.5v13M5.5 12h13"/>',
    'x':       '<path d="M18 6 6 18M6 6l12 12"/>',
    'check':   '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'trash':   '<path d="M4.5 6.5h15M9 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 4.8v1.7"/><path d="M6.5 6.5 7.5 20a1.4 1.4 0 0 0 1.4 1.3h6.2A1.4 1.4 0 0 0 16.5 20l1-13.5"/>',
    'pause':   '<rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
    'play':    '<path d="M7.5 5.5 18 12 7.5 18.5z"/>',
    'eye':     '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    'search':  '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
    'clock':   '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    'alert':   '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    'chat':    '<path d="M20.5 12.5c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.8a6.8 6.8 0 0 1-2.3-4.7c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    'reply':   '<path d="M9 10 4.5 14 9 18"/><path d="M4.5 14h9a6 6 0 0 0 6-6V6"/>',
    'star':    '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    'flag':    '<path d="M5 21V4.5h13l-2.4 4.2L18 13H5"/>',
}


def ic(n, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{ICO[n]}</svg>'


NAV = [
    ('seller-dashboard.html', 'dash',    'داشبورد', None),
    ('seller-products.html',  'box',     'محصولات', 'b1'),
    ('seller-orders.html',    'cart',    'سفارش‌ها', 'b2'),
    ('seller-returns.html',   'back',    'مرجوعی‌ها', 'b3'),
    ('seller-reviews.html',   'chat',    'نظرها', 'b4'),
    ('seller-promos.html',    'percent', 'سیاست فروش', None),
    ('seller-earnings.html',  'wallet',  'درآمد و تسویه', None),
    ('seller-profile.html',   'user',    'پروفایل فروشگاه', None),
]


def sidebar(active):
    links = ''
    for href, icon, label, bid in NAV:
        cls = 'sb-link active' if href == active else 'sb-link'
        badge = '<span class="sb-badge" hidden></span>' if bid else ''
        links += f'\n      <a class="{cls}" href="{href}">{ic(icon)}<span>{label}</span>{badge}</a>'

    return f'''<aside class="sidebar" id="sidebar">
  <div class="sidebar-head">
    <a href="../index.html" style="display:flex;flex-direction:column;gap:2px" title="بازگشت به سایت اصلی">
      <div class="sb-logo">دیجی‌پوش</div>
      <span class="sb-sub">پنل فروشندگان</span>
    </a>
  </div>

  <nav class="sidebar-nav" aria-label="منوی پنل">
    <div class="sb-label">مدیریت</div>{links}
  </nav>

  <div class="sidebar-foot">
    <div class="sb-user">
      <span class="sb-avatar" data-dp="letter">&nbsp;</span>
      <div>
        <div class="sb-user-name" data-dp="fullName">&nbsp;</div>
        <div class="sb-user-role" data-dp="storeName">&nbsp;</div>
      </div>
    </div>
    <a class="sb-link" href="../index.html">{ic('home')}<span>بازگشت به سایت</span></a>
    <a class="sb-link logout" href="seller-login.html" data-logout>{ic('logout')}<span>خروج از حساب</span></a>
  </div>
</aside>

<div class="backdrop" id="backdrop"></div>'''


def page(fname, title, sub, body, script, extra_css=''):
    html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="theme-color" content="#1a1a1a" />
  <title>دیجی‌پوش | {title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/seller-style.css" />
  <link rel="stylesheet" href="../assets/css/dp-colors.css" />\n  <link rel="stylesheet" href="../assets/css/dp-cursor.css" />
  <link rel="stylesheet" href="../assets/css/dp-polish.css" />{extra_css}
</head>
<body data-dp-panel>

{sidebar(fname)}

<div class="main">
  <header class="topbar">
    <button class="burger" type="button" aria-label="منو">{ic('burger')}</button>
    <div>
      <div class="page-title">{title}</div>
      <div class="page-sub">{sub}</div>
    </div>
    <div class="topbar-actions">
      <button class="icon-btn" type="button" aria-label="اعلان‌ها">{ic('bell')}<span class="dot-alert"></span></button>
    </div>
  </header>

  <div class="content">
{body}
  </div>
</div>

<div class="toast-wrap"></div>

<script src="../assets/js/dp-reset.js"></script>
<script src="../assets/js/dp-taxonomy.js"></script>
<script src="../assets/js/dp-palette.js"></script>
<script src="../assets/js/dp-colors.js"></script>
<script src="../assets/js/dp-promo.js"></script>
<script src="js/dp-config.js"></script>
<script src="js/dp-store.js"></script>
<script src="../assets/js/dp-returns.js"></script>
<script src="../assets/js/dp-reviews.js"></script>
<script src="js/seller-script.js"></script>
<script src="js/dp-ui.js"></script>\n<script src="../assets/js/dp-cursor.js"></script>
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
# صفحه‌ی سیاست فروش
# ============================================================
promo_body = f'''    <div class="notice-soft">
      {ic('alert', 'ico ico-sm')}
      <span>می‌توانید برای همه یا بخشی از محصولاتتان، در یک بازه‌ی زمانی مشخص تخفیف بگذارید.
      تخفیف <b>خودکار</b> در تاریخ شروع فعال و در تاریخ پایان برداشته می‌شود.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ic('percent')}</span>
          <span class="stat-label">تخفیف‌های فعال</span></div>
        <span class="stat-number num" id="sLive">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-blue">{ic('clock')}</span>
          <span class="stat-label">در انتظار شروع</span></div>
        <span class="stat-number num" id="sSoon">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ic('box')}</span>
          <span class="stat-label">کالای تخفیف‌دار</span></div>
        <span class="stat-number num" id="sItems">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-silver">{ic('check')}</span>
          <span class="stat-label">کل سیاست‌ها</span></div>
        <span class="stat-number num" id="sAll">۰</span>
      </div>
    </div>

    <div class="card mb-18">
      <div class="card-head">
        <h2>تخفیف تازه</h2>
        <span class="sub spacer">بازه‌ی زمانی و درصد را مشخص کنید</span>
      </div>

      <form id="saleForm" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="pTitle">عنوان تخفیف</label>
            <input class="input" id="pTitle" placeholder="مثلاً: جشنواره‌ی بهاره" />
          </div>

          <div class="field">
            <label for="pPct">درصد تخفیف <span class="req">*</span></label>
            <input class="input num" id="pPct" inputmode="numeric" placeholder="۲۰" />
            <span class="hint">عددی بین ۱ تا ۹۰</span>
          </div>

          <div class="field">
            <label for="pFrom">تاریخ شروع <span class="req">*</span></label>
            <input class="input" id="pFrom" type="date" />
          </div>

          <div class="field">
            <label for="pTo">تاریخ پایان <span class="req">*</span></label>
            <input class="input" id="pTo" type="date" />
          </div>

          <div class="field full">
            <label>روی کدام محصولات؟</label>
            <div class="scope-pick">
              <label class="scope-opt">
                <input type="radio" name="scope" value="all" checked />
                <div><strong>همه‌ی محصولات</strong><small>روی کل ویترین اعمال شود</small></div>
              </label>
              <label class="scope-opt">
                <input type="radio" name="scope" value="some" />
                <div><strong>محصولات انتخابی</strong><small>خودتان مشخص کنید</small></div>
              </label>
            </div>
          </div>

          <div class="field full" id="pickWrap" hidden>
            <label>محصولات <span class="hint" id="pickCount"></span></label>
            <div class="prod-pick" id="prodPick"></div>
          </div>
        </div>

        <!-- ماشین حساب زنده -->
        <div class="calc" id="calc" hidden>
          <div class="calc-head">
            {ic('percent', 'ico ico-sm')}
            <span>با <b id="cPct">۰</b>٪ تخفیف چه اتفاقی می‌افتد؟</span>
            <em id="cScope"></em>
          </div>

          <div class="calc-grid" id="calcRows"></div>

          <div class="calc-sum" id="calcSum" hidden>
            <div class="cs">
              <small>جمع قیمت اصلی</small>
              <b id="cOld">۰</b>
            </div>
            <div class="cs cs-off">
              <small>مبلغ تخفیف</small>
              <b id="cOff">۰</b>
            </div>
            <div class="cs cs-new">
              <small>قیمت پس از تخفیف</small>
              <b id="cNew">۰</b>
            </div>
          </div>

          <p class="calc-note" id="cNote"></p>
        </div>

        <button class="btn btn-primary mt-18" type="submit" id="saleBtn">
          {ic('plus', 'ico ico-sm')} ثبت تخفیف
        </button>
      </form>
    </div>

    <div class="card">
      <div class="card-head"><h2>سیاست‌های ثبت‌شده</h2></div>
      <div id="saleList"></div>
    </div>'''

promo_js = r'''onDPReady(async (me) => {
  const P = window.DPPromo;
  const el = (i) => document.getElementById(i);

  // تاریخ پیش‌فرض: امروز تا یک هفته بعد
  const today = P.todayISO();
  const wk = new Date(); wk.setDate(wk.getDate() + 7);
  const weekLater = wk.toISOString().slice(0, 10);
  el('pFrom').value = today;
  el('pTo').value = weekLater;
  el('pFrom').min = today;

  const products = await DPStore.products.list();
  const picked = new Set();

  /* ============================================================
     ماشین حساب زنده — پیش از ثبت، اثر تخفیف را نشان می‌دهد
     ============================================================ */
  function calc() {
    const box = el('calc');
    const pct = Number(toEn(el('pPct').value).replace(/[^\d.]/g, ''));

    /* بدون درصد معتبر، چیزی نشان نمی‌دهیم */
    if (!(pct > 0 && pct <= 90)) { box.hidden = true; return; }

    const scope = document.querySelector('[name="scope"]:checked').value;
    const list = scope === 'all'
      ? products
      : products.filter(p => picked.has(String(p.id)));

    el('cPct').textContent = toFa(pct);
    el('cScope').textContent = scope === 'all'
      ? `روی ${toFa(products.length)} محصول`
      : `روی ${toFa(list.length)} محصول انتخابی`;

    box.hidden = false;

    if (!list.length) {
      el('calcRows').innerHTML = '';
      el('calcSum').hidden = true;
      el('cNote').textContent = scope === 'some'
        ? 'هنوز محصولی انتخاب نکرده‌اید.'
        : 'هنوز محصولی در فروشگاه ندارید.';
      return;
    }

    /* ---------- ردیف هر محصول ---------- */
    const SHOW = 6;                       // بیشتر از این، جمع‌بندی نشان می‌دهیم
    el('calcRows').innerHTML = list.slice(0, SHOW).map(p => {
      const base = Number(p.price) || 0;
      const off = Math.round(base * pct / 100);
      return `
        <div class="calc-row">
          <span class="cr-name">${esc(p.name)}</span>
          <span class="cr-old">${money(base)}</span>
          <span class="cr-arrow">←</span>
          <span class="cr-new">${money(base - off)}</span>
          <span class="cr-off">${money(off)} کمتر</span>
        </div>`;
    }).join('') + (list.length > SHOW
      ? `<div class="calc-more">و ${toFa(list.length - SHOW)} محصول دیگر…</div>` : '');

    /* ---------- جمع کل ---------- */
    const sumOld = list.reduce((a, p) => a + (Number(p.price) || 0), 0);
    const sumOff = Math.round(sumOld * pct / 100);

    el('cOld').textContent = money(sumOld);
    el('cOff').textContent = '− ' + money(sumOff);
    el('cNew').textContent = money(sumOld - sumOff);
    el('calcSum').hidden = false;

    /* ---------- یادداشت راهنما ---------- */
    const cheapest = list.reduce((a, p) =>
      (Number(p.price) || 0) < (Number(a.price) || 0) ? p : a, list[0]);
    const cOff = Math.round((Number(cheapest.price) || 0) * pct / 100);

    el('cNote').textContent = pct >= 50
      ? `توجه: ${toFa(pct)}٪ تخفیف زیاد است — از هر فروش «${cheapest.name}» ${money(cOff)} تومان کم می‌شود.`
      : `از فروش هر «${cheapest.name}» ${money(cOff)} تومان کم می‌شود.`;
  }

  /* با هر تغییری، دوباره حساب می‌شود */
  el('pPct').addEventListener('input', calc);

  /* ---------- انتخاب محصول ---------- */
  el('prodPick').innerHTML = products.length
    ? products.map(p => `
        <button class="pp" type="button" data-p="${esc(p.id)}">
          <span class="pp-name">${esc(p.name)}</span>
          <span class="pp-price">${money(p.price)}</span>
        </button>`).join('')
    : '<div class="empty">هنوز محصولی ندارید. اول محصول اضافه کنید.</div>';

  el('prodPick').addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    const id = b.dataset.p;
    picked.has(id) ? picked.delete(id) : picked.add(id);
    b.classList.toggle('on', picked.has(id));
    el('pickCount').textContent = picked.size ? `— ${toFa(picked.size)} انتخاب شد` : '';
    calc();
  });

  /* ---------- دامنه ---------- */
  document.querySelectorAll('[name="scope"]').forEach(r =>
    r.addEventListener('change', () => {
      el('pickWrap').hidden = document.querySelector('[name="scope"]:checked').value !== 'some';
      calc();
    }));

  /* ---------- ثبت ---------- */
  el('saleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const scope = document.querySelector('[name="scope"]:checked').value;
    try {
      P.sales.add(me.id, {
        title: el('pTitle').value,
        percent: el('pPct').value,
        from: el('pFrom').value,
        to: el('pTo').value,
        scope,
        products: [...picked],
      });
      toast('تخفیف ثبت شد.', 'success');
      el('saleForm').reset();
      el('pFrom').value = today; el('pTo').value = weekLater;
      picked.clear();
      document.querySelectorAll('.pp.on').forEach(x => x.classList.remove('on'));
      el('pickWrap').hidden = true;
      el('pickCount').textContent = '';
      el('calc').hidden = true;
      draw();
    } catch (err) { toast(err.message, 'error'); }
  });

  /* ---------- فهرست ---------- */
  function draw() {
    const rows = P.sales.list(me.id);

    const n = { live: 0, soon: 0, ended: 0, paused: 0 };
    let items = 0;
    rows.forEach(r => {
      const s = P.statusOf(r);
      n[s]++;
      if (s === 'live') items += r.scope === 'all' ? products.length : r.products.length;
    });

    el('sLive').textContent  = toFa(n.live);
    el('sSoon').textContent  = toFa(n.soon);
    el('sItems').textContent = toFa(items);
    el('sAll').textContent   = toFa(rows.length);

    el('saleList').innerHTML = rows.length ? rows.map(r => {
      const st = P.statusOf(r);
      const b = P.STATUS_FA[st];
      const names = r.scope === 'all'
        ? 'همه‌ی محصولات'
        : r.products.map(id => (products.find(p => String(p.id) === id) || {}).name)
            .filter(Boolean).join('، ') || '—';

      return `
        <div class="promo-row">
          <div class="promo-pct">${toFa(r.percent)}<small>٪</small></div>
          <div class="promo-info">
            <div class="promo-top">
              <strong>${esc(r.title)}</strong>
              <span class="badge ${b.cls}">${b.label}</span>
            </div>
            <span class="promo-when">${P.faDate(r.from)} تا ${P.faDate(r.to)}</span>
            <span class="promo-scope">${esc(names)}</span>
          </div>
          <div class="row-actions">
            <button class="act" type="button" data-t="${esc(r.id)}"
                    title="${r.off ? 'فعال کردن' : 'متوقف کردن'}">${r.off ? ICO_PLAY : ICO_PAUSE}</button>
            <button class="act danger" type="button" data-d="${esc(r.id)}" title="حذف">${ICO_TRASH}</button>
          </div>
        </div>`;
    }).join('') : '<div class="empty">هنوز سیاستی ثبت نکرده‌اید.</div>';
  }

  el('saleList').addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]');
    const d = e.target.closest('[data-d]');
    if (t) { P.sales.toggle(t.dataset.t); draw(); toast('وضعیت عوض شد.', 'success'); }
    if (d) { P.sales.remove(d.dataset.d); draw(); toast('سیاست حذف شد.', 'success'); }
  });

  draw();
});

const SWX = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const ICO_PAUSE = `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SWX}><rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/></svg>`;
const ICO_PLAY  = `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SWX}><path d="M7.5 5.5 18 12 7.5 18.5z"/></svg>`;
const ICO_TRASH = `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SWX}><path d="M4.5 6.5h15M9 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 4.8v1.7"/><path d="M6.5 6.5 7.5 20a1.4 1.4 0 0 0 1.4 1.3h6.2A1.4 1.4 0 0 0 16.5 20l1-13.5"/></svg>`;

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}'''

page('seller-promos.html', 'سیاست فروش', 'تخفیف‌های زمان‌دار روی محصولات', promo_body, promo_js)


# ============================================================
# صفحه‌ی مرجوعی
# ============================================================
returns_body = f'''    <div class="notice-soft">
      {ic('alert', 'ico ico-sm')}
      <span>وقتی مشتری درخواست مرجوعی می‌دهد، اینجا نمایش داده می‌شود.
      با تأیید شما، مبلغ از درآمدتان کم و موجودی کالا به انبار برمی‌گردد.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-red">{ic('clock')}</span>
          <span class="stat-label">در انتظار بررسی</span></div>
        <span class="stat-number num" id="rPend">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ic('check')}</span>
          <span class="stat-label">تأییدشده</span></div>
        <span class="stat-number num" id="rOk">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ic('x')}</span>
          <span class="stat-label">ردشده</span></div>
        <span class="stat-number num" id="rNo">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-blue">{ic('wallet')}</span>
          <span class="stat-label">مبلغ بازگشتی</span></div>
        <span class="stat-number num" id="rSum">۰</span>
        <span class="stat-unit">تومان</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        {ic('search')}
        <input class="input" type="search" id="search" placeholder="جست‌وجوی شماره سفارش یا نام مشتری…" />
      </div>
      <select class="select" id="fStatus" style="max-width:190px">
        <option value="">همه‌ی وضعیت‌ها</option>
        <option value="pending">در انتظار بررسی</option>
        <option value="approved">تأییدشده</option>
        <option value="rejected">ردشده</option>
      </select>
    </div>

    <div class="card">
      <div id="retList"></div>
    </div>

    <div class="modal-overlay" id="rjModal">
      <div class="modal">
        <div class="modal-head">
          <h3>رد درخواست مرجوعی</h3>
          <button type="button" data-close aria-label="بستن">{ic('x')}</button>
        </div>
        <div class="modal-body">
          <p style="margin-top:0;font-size:13.5px;color:var(--gray)">
            دلیل رد را بنویسید. این متن برای مشتری نمایش داده می‌شود.
          </p>
          <div class="field">
            <label for="rjWhy">دلیل رد</label>
            <textarea class="textarea" id="rjWhy" placeholder="مثلاً: کالا استفاده شده بود."></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-danger" type="button" id="rjOk">رد کردن</button>
        </div>
      </div>
    </div>'''

returns_js = r'''onDPReady(async (me) => {
  const R = window.DPReturns;
  const el = (i) => document.getElementById(i);
  let current = null;

  const ST = {
    pending:  ['در انتظار بررسی', 'b-warning'],
    approved: ['تأیید شد', 'b-success'],
    rejected: ['رد شد', 'b-danger'],
  };

  function draw() {
    const q = toEn(el('search').value).trim().toLowerCase();
    const f = el('fStatus').value;

    let rows = R.forSeller(me.id);

    const n = { pending: 0, approved: 0, rejected: 0 };
    let sum = 0;
    rows.forEach(r => {
      n[r.status] = (n[r.status] || 0) + 1;
      if (r.status === 'approved') sum += r.amount;
    });

    el('rPend').textContent = toFa(n.pending);
    el('rOk').textContent   = toFa(n.approved);
    el('rNo').textContent   = toFa(n.rejected);
    el('rSum').textContent  = money(sum);

    if (f) rows = rows.filter(r => r.status === f);
    if (q) rows = rows.filter(r =>
      toEn(`${r.orderId} ${r.customer} ${r.productName}`).toLowerCase().includes(q));

    el('retList').innerHTML = rows.length ? rows.map(r => {
      const s = ST[r.status] || ST.pending;
      return `
        <div class="ret-row">
          <div class="ret-main">
            <div class="ret-top">
              <strong>${esc(r.orderId)}</strong>
              <span class="badge ${s[1]}">${s[0]}</span>
              <time>${esc(r.date)}</time>
            </div>
            <div class="ret-item">${esc(r.productName)} × ${toFa(r.qty)}</div>
            <div class="ret-why"><b>دلیل مشتری:</b> ${esc(r.reason)}</div>
            ${r.sellerNote ? `<div class="ret-why bad"><b>پاسخ شما:</b> ${esc(r.sellerNote)}</div>` : ''}
            <div class="ret-meta">
              <span>${esc(r.customer)}</span>
              <span class="num">${money(r.amount)} تومان</span>
            </div>
          </div>
          ${r.status === 'pending' ? `
            <div class="ret-acts">
              <button class="btn btn-success btn-sm" type="button" data-ok="${esc(r.id)}">تأیید مرجوعی</button>
              <button class="btn btn-secondary btn-sm" type="button" data-no="${esc(r.id)}">رد کردن</button>
            </div>` : ''}
        </div>`;
    }).join('') : '<div class="empty">درخواست مرجوعی‌ای وجود ندارد.</div>';
  }

  el('retList').addEventListener('click', async (e) => {
    const ok = e.target.closest('[data-ok]');
    const no = e.target.closest('[data-no]');

    if (ok) {
      try {
        await R.approve(ok.dataset.ok);
        toast('مرجوعی تأیید شد و موجودی برگشت.', 'success');
        draw();
      } catch (err) { toast(err.message, 'error'); }
    }

    if (no) { current = no.dataset.no; el('rjWhy').value = ''; openModal('rjModal'); }
  });

  el('rjOk').addEventListener('click', () => {
    const why = el('rjWhy').value.trim();
    if (!why) { toast('لطفاً دلیل رد را بنویسید.', 'warning'); return; }
    R.reject(current, why);
    toast('درخواست رد شد.', 'success');
    closeModal('rjModal');
    draw();
  });

  let t;
  el('search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
  el('fStatus').addEventListener('change', draw);

  draw();
});

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}'''

page('seller-returns.html', 'مرجوعی‌ها', 'بررسی درخواست‌های بازگشت کالا', returns_body, returns_js)



# ============================================================
#  صفحه‌ی نظرها — پنل فروشنده
# ============================================================
rev_body = f'''    <div class="notice-soft">
      {ic('alert', 'ico ico-sm')}
      <span>هر نظری که مشتری‌ها می‌نویسند — چه خوب چه بد — همین‌جا می‌آید.
      می‌توانید پاسخ بدهید تا زیر نظرشان در سایت دیده شود.
      اگر نظری نادرست یا توهین‌آمیز بود، برای مدیر گزارش کنید.</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-gold">{ic('star')}</span>
          <span class="stat-label">میانگین امتیاز</span></div>
        <span class="stat-number num" id="vAvg">—</span>
        <span class="stat-unit">از ۵</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-blue">{ic('chat')}</span>
          <span class="stat-label">کل نظرها</span></div>
        <span class="stat-number num" id="vAll">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-red">{ic('alert')}</span>
          <span class="stat-label">بدون پاسخ</span></div>
        <span class="stat-number num" id="vNew">۰</span>
      </div>
      <div class="stat-card">
        <div class="stat-top"><span class="stat-icon si-green">{ic('reply')}</span>
          <span class="stat-label">پاسخ داده‌شده</span></div>
        <span class="stat-number num" id="vRep">۰</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        {ic('search')}
        <input class="input" type="search" id="search" placeholder="جست‌وجو در نام مشتری یا متن نظر…" />
      </div>
      <select class="select" id="fRate" style="max-width:170px">
        <option value="">همه‌ی امتیازها</option>
        <option value="5">۵ ستاره</option>
        <option value="4">۴ ستاره</option>
        <option value="3">۳ ستاره</option>
        <option value="2">۲ ستاره</option>
        <option value="1">۱ ستاره</option>
      </select>
      <select class="select" id="fRep" style="max-width:180px">
        <option value="">همه</option>
        <option value="no">بدون پاسخ</option>
        <option value="yes">پاسخ داده‌شده</option>
        <option value="flag">گزارش‌شده</option>
      </select>
    </div>

    <div class="card">
      <div id="revList"></div>
    </div>

    <!-- پاسخ -->
    <div class="modal-overlay" id="repModal">
      <div class="modal">
        <div class="modal-head">
          <h3>پاسخ به نظر</h3>
          <button type="button" data-close aria-label="بستن">{ic('x')}</button>
        </div>
        <div class="modal-body">
          <div class="rq" id="repQuote"></div>
          <div class="field">
            <label for="repTxt">پاسخ شما <span class="hint">(زیر نظر مشتری در سایت دیده می‌شود)</span></label>
            <textarea class="textarea" id="repTxt" maxlength="500"
              placeholder="مثلاً: از خریدتان سپاسگزاریم. بابت این تجربه متأسفیم و…"></textarea>
            <span class="hint" id="repLen">۰ / ۵۰۰</span>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-primary" type="button" id="repOk">ثبت پاسخ</button>
        </div>
      </div>
    </div>

    <!-- گزارش -->
    <div class="modal-overlay" id="flagModal">
      <div class="modal">
        <div class="modal-head">
          <h3>گزارش نظر به مدیر</h3>
          <button type="button" data-close aria-label="بستن">{ic('x')}</button>
        </div>
        <div class="modal-body">
          <p style="margin-top:0;font-size:13.5px;color:var(--gray)">
            اگر این نظر توهین‌آمیز، تبلیغاتی یا نادرست است، دلیلش را بنویسید.
            مدیر بررسی می‌کند و در صورت نیاز آن را برمی‌دارد.
          </p>
          <div class="field">
            <label for="flagWhy">دلیل گزارش</label>
            <textarea class="textarea" id="flagWhy"
              placeholder="مثلاً: این مشتری اصلاً از ما خرید نکرده است."></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-danger" type="button" id="flagOk">ارسال گزارش</button>
        </div>
      </div>
    </div>'''

rev_js = r'''onDPReady(async (me) => {
  const V = window.DPReviews;
  const el = (i) => document.getElementById(i);
  let current = null;

  /* با باز کردن صفحه، همه‌ی نظرها «دیده‌شده» می‌شوند */
  V.markSeen(me.id);

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
    const fr = el('fRate').value;
    const fp = el('fRep').value;

    let rows = V.forSeller(me.id);

    /* آمار روی کل نظرها، نه فیلترشده‌ها */
    const total = rows.length;
    const withRep = rows.filter(r => r.reply).length;
    const sum = rows.reduce((a, r) => a + r.rating, 0);

    el('vAll').textContent = toFa(total);
    el('vRep').textContent = toFa(withRep);
    el('vNew').textContent = toFa(total - withRep);
    el('vAvg').textContent = total
      ? toFa((Math.round(sum / total * 10) / 10)).replace('.', '٫') : '—';

    if (fr) rows = rows.filter(r => Math.round(r.rating) === Number(fr));
    if (fp === 'no') rows = rows.filter(r => !r.reply);
    if (fp === 'yes') rows = rows.filter(r => r.reply);
    if (fp === 'flag') rows = rows.filter(r => r.flagged);
    if (q) rows = rows.filter(r =>
      toEn(`${r.userName} ${r.text} ${r.about}`).toLowerCase().includes(q));

    el('revList').innerHTML = rows.length ? rows.map(r => `
      <div class="rev-row${r.hidden ? ' is-hidden' : ''}">
        <span class="rev-ava">${esc((r.userName || '؟').charAt(0))}</span>

        <div class="rev-main">
          <div class="rev-top">
            <strong>${esc(r.userName)}</strong>
            ${stars(Math.round(r.rating))}
            <span class="rev-about">${esc(r.about)}</span>
            <time>${esc(r.date)}</time>
          </div>

          ${r.text ? `<p class="rev-txt">${esc(r.text)}</p>` : '<p class="rev-txt dim">— بدون متن —</p>'}

          ${r.flagged ? `<div class="rev-flag">${
            r.reviewed ? 'گزارش شما بررسی شد' : 'گزارش شده — در انتظار بررسی مدیر'
          }${r.adminNote ? ' · ' + esc(r.adminNote) : ''}</div>` : ''}

          ${r.hidden ? '<div class="rev-flag bad">این نظر توسط مدیر از سایت برداشته شد</div>' : ''}

          ${r.reply ? `
            <div class="rev-rep">
              <div class="rev-rep-top"><b>پاسخ شما</b><time>${esc(r.replyDate)}</time></div>
              <p>${esc(r.reply)}</p>
            </div>` : ''}

          <div class="rev-acts">
            <button class="btn btn-secondary btn-sm" type="button"
                    data-rep="${esc(r.id)}">${r.reply ? 'ویرایش پاسخ' : 'پاسخ دادن'}</button>
            ${!r.flagged ? `<button class="btn btn-secondary btn-sm" type="button"
                    data-flag="${esc(r.id)}">گزارش به مدیر</button>` : ''}
          </div>
        </div>
      </div>`).join('')
      : '<div class="empty">نظری با این فیلتر پیدا نشد.</div>';
  }

  /* ---------- پاسخ ---------- */
  el('revList').addEventListener('click', (e) => {
    const rp = e.target.closest('[data-rep]');
    const fl = e.target.closest('[data-flag]');

    if (rp) {
      current = rp.dataset.rep;
      const r = V.forSeller(me.id).find(x => x.id === current);
      el('repQuote').innerHTML =
        `<b>${esc(r.userName)}:</b> ${esc(r.text || '— بدون متن —')}`;
      el('repTxt').value = r.reply || '';
      el('repLen').textContent = `${toFa(el('repTxt').value.length)} / ۵۰۰`;
      openModal('repModal');
    }

    if (fl) {
      current = fl.dataset.flag;
      el('flagWhy').value = '';
      openModal('flagModal');
    }
  });

  el('repTxt').addEventListener('input', () => {
    el('repLen').textContent = `${toFa(el('repTxt').value.length)} / ۵۰۰`;
  });

  el('repOk').addEventListener('click', () => {
    try {
      V.reply(current, el('repTxt').value);
      toast('پاسخ شما ثبت شد و در سایت دیده می‌شود.', 'success');
      closeModal('repModal');
      draw();
    } catch (err) { toast(err.message, 'error'); }
  });

  el('flagOk').addEventListener('click', () => {
    try {
      V.flag(current, el('flagWhy').value);
      toast('گزارش برای مدیر فرستاده شد.', 'success');
      closeModal('flagModal');
      draw();
    } catch (err) { toast(err.message, 'error'); }
  });

  let t;
  el('search').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
  el('fRate').addEventListener('change', draw);
  el('fRep').addEventListener('change', draw);

  draw();
});

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}'''

page('seller-reviews.html', 'نظرها', 'نظر مشتریان و پاسخ شما', rev_body, rev_js)

# ============================================================
# افزودن دو گزینه‌ی تازه به سایدبار همه‌ی صفحه‌های موجود
# ============================================================
NEW_LINKS = (
    f'\n      <a class="sb-link" href="seller-returns.html">{ic("back")}<span>مرجوعی‌ها</span>'
    f'<span class="sb-badge" hidden></span></a>'
    f'\n      <a class="sb-link" href="seller-reviews.html">{ic("chat")}<span>نظرها</span>'
    f'<span class="sb-badge" hidden></span></a>'
    f'\n      <a class="sb-link" href="seller-promos.html">{ic("percent")}<span>سیاست فروش</span></a>'
)

for f in sorted(D.glob('seller-*.html')):
    if f.name in ('seller-promos.html', 'seller-returns.html', 'seller-reviews.html',
                  'seller-login.html', 'seller-signup.html'):
        continue

    t = f.read_text(encoding='utf-8')
    if 'seller-reviews.html' in t:
        continue
    if 'seller-returns.html' in t:
        # فقط لینک نظرها را اضافه کن
        m2 = re.search(r'(<a class="sb-link" href="seller-returns\.html">.*?</a>)', t, re.S)
        if m2:
            add = (f'\n      <a class="sb-link" href="seller-reviews.html">{ic("chat")}'
                   f'<span>نظرها</span><span class="sb-badge" hidden></span></a>')
            t = t[:m2.end()] + add + t[m2.end():]
            f.write_text(t, encoding='utf-8')
            print('✔ لینک نظرها:', f.name)
        continue

    # پس از لینک سفارش‌ها بگذار
    m = re.search(r'(<a class="sb-link[^"]*" href="seller-orders\.html">.*?</a>)', t, re.S)
    if not m:
        print('⚠ سفارش‌ها پیدا نشد:', f.name); continue

    t = t[:m.end()] + NEW_LINKS + t[m.end():]

    # فایل سیاست فروش لازم است
    if 'dp-promo.js' not in t:
        t = t.replace('<script src="js/dp-config.js"></script>',
                      '<script src="../assets/js/dp-promo.js"></script>\n'
                      '<script src="js/dp-config.js"></script>', 1)
    if 'dp-returns.js' not in t:
        t = t.replace('<script src="js/dp-store.js"></script>',
                      '<script src="js/dp-store.js"></script>\n'
                      '<script src="../assets/js/dp-returns.js"></script>\n'
                      '<script src="../assets/js/dp-reviews.js"></script>', 1)

    f.write_text(t, encoding='utf-8')
    print('✔ سایدبار:', f.name)

print('\nصفحه‌های سیاست فروش و مرجوعی ساخته شدند.')
