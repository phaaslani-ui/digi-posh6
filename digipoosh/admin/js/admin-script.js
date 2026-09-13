/* ============================================================
   دیجی‌پوش — ابزارهای مشترک پنل مدیریت
   ============================================================ */
'use strict';

const $  = (s, sc = document) => sc.querySelector(s);
const $$ = (s, sc = document) => Array.from(sc.querySelectorAll(s));

const FA_D = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const fa   = (n) => String(n).replace(/\d/g, (d) => FA_D[+d]).replace('.', '٫');
const toEn = (s) => String(s).replace(/[۰-۹]/g, (d) => FA_D.indexOf(d));
const money = (n) => fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CAT_FA = {
  women: 'پوشاک زنانه', men: 'پوشاک مردانه',
  kids: 'پوشاک کودک',  teen: 'پوشاک نوجوان',
};

const SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const ICO = {
  eye:   `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SW}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  check: `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SW}><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  x:     `<svg class="ico ico-sm" viewBox="0 0 24 24" ${SW}><path d="M18 6 6 18M6 6l12 12"/></svg>`,
};

/* ---------- نشان وضعیت فروشگاه ---------- */
const STATUS = {
  pending:   { label: 'در انتظار تأیید', cls: 'b-warning' },
  approved:  { label: 'تأییدشده',        cls: 'b-success' },
  rejected:  { label: 'ردشده',           cls: 'b-danger' },
  suspended: { label: 'معلق',            cls: 'b-gray' },
};

function statusBadge(k) {
  const s = STATUS[k] || { label: k, cls: 'b-gray' };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

/* ---------- شمارنده‌ی ساده ---------- */
function setNum(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = fa(n);
}

/* ============================================================
   توست
   ============================================================ */
function toast(message, type = 'success') {
  let wrap = $('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }

  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.textContent = message;
  wrap.appendChild(el);

  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 3200);
}

/* ============================================================
   مودال
   ============================================================ */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(el) {
  const m = typeof el === 'string' ? document.getElementById(el) : el;
  if (!m) return;
  m.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.classList?.contains('modal-overlay')) closeModal(e.target);
  const c = e.target.closest('[data-close]');
  if (c) closeModal(c.closest('.modal-overlay'));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $$('.modal-overlay.active').forEach(closeModal);
});

/* ============================================================
   سایدبار
   ============================================================ */
function initSidebar() {
  const sb = $('.sidebar');
  const bd = $('.backdrop');
  const burger = $('.burger');
  if (!sb) return;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  const setOpen = (open) => {
    sb.classList.toggle('open', open);
    bd?.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open && isMobile());
    burger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const close = () => setOpen(false);

  burger?.setAttribute('aria-expanded', 'false');
  burger?.addEventListener('click', () => setOpen(!sb.classList.contains('open')));
  bd?.addEventListener('click', close);

  sb.addEventListener('click', (e) => {
    if (e.target.closest('.sb-link') && isMobile()) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sb.classList.contains('open')) close();
  });

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { if (!isMobile()) close(); }, 120);
  });
}

/* ============================================================
   نشان‌های کنار منو
   ============================================================ */
async function paintBadges() {
  try {
    const st = await DPAdmin.stats();
    const set = (id, n) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (n > 0) { el.textContent = fa(n); el.hidden = false; }
      else el.hidden = true;
    };
    set('badgeAll', st.totalSellers);
    set('badgePending', st.pending);

    /* درخواست‌های تازه‌ی تغییر پروفایل و سفارش نردبان */
    if (window.DPModeration) set('badgeMod', DPModeration.countPending());
    if (window.DPBoost) set('badgeBoost', DPBoost.countAwaiting());

    /* بازار عمده: عمده‌فروش در انتظار + استعلام بی‌پاسخ */
    const W = st.wholesale || {};
    set('badgeWhole', (W.pending || 0) + (W.rfqOpen || 0));
  } catch (_) {}
}

/* ============================================================
   محافظ صفحه — هر صفحه با این شروع می‌شود
   ============================================================ */
function requireAdmin(fn) {
  /* اگر موتور پنل بارگذاری نشده، کاربر نباید با صفحه‌ی سفید
     و بی‌توضیح روبه‌رو شود — علت را می‌گوییم. */
  if (!window.DPAdmin) {
    console.error('DPAdmin بارگذاری نشده — ترتیب اسکریپت‌ها را بررسی کنید.');
    document.addEventListener('DOMContentLoaded', function () {
      var box = document.querySelector('.content') || document.body;
      if (box.querySelector('.dp-boot-error')) return;
      var p = document.createElement('div');
      p.className = 'notice-soft dp-boot-error';
      p.textContent = 'بارگذاری پنل ناقص بود. صفحه را با Ctrl + Shift + R تازه کنید.';
      box.insertBefore(p, box.firstChild);
    }, { once: true });
    return;
  }

  if (!DPAdmin.auth.isLoggedIn()) { location.replace('admin-login.html'); return; }

  const start = async () => {
    try { initSidebar(); } catch (e) { console.error(e); }
    try { await paintBadges(); } catch (e) { console.error(e); }
    try { await fn(); }
    catch (err) { console.error(err); toast(err.message || 'خطایی رخ داد.', 'error'); }
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start, { once: true })
    : start();
}

/* در دسترس گذاشتن روی window — بعضی محیط‌ها تابع‌های
   سطح‌بالا را به‌صورت خودکار سراسری نمی‌کنند. */
if (typeof window !== 'undefined') window.requireAdmin = requireAdmin;

/* خروج */
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-logout]')) return;
  e.preventDefault();
  DPAdmin.auth.logout();
  toast('خارج شدید.', 'success');
  setTimeout(() => (location.href = 'admin-login.html'), 500);
});
