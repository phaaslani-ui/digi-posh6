/* ============================================================
   دیجی‌پوش — پنل فروشنده | اسکریپت مشترک
   ------------------------------------------------------------
   • همه‌ی انیمیشن‌ها CSS هستند؛ JS فقط کلاس عوض می‌کند
   • رویدادها با delegation مدیریت می‌شوند (یک شنونده به‌جای ده‌ها)
   • جست‌وجو debounce شده، شمارنده‌ها با requestAnimationFrame
   • ساخت جدول‌ها با DocumentFragment (یک reflow به‌جای N تا)
   ============================================================ */

'use strict';

/* ============================================================
   ۱. داده‌ها
   ------------------------------------------------------------
   همه‌ی داده‌های این پنل واقعی هستند و از `DPStore` می‌آیند
   (فایل dp-store.js). هیچ داده‌ی آزمایشی یا نام ثابتی اینجا نیست.
   ============================================================ */

/* برچسب‌های وضعیت */
const STATUS = {
  // سفارش
  pending:      { label: 'در انتظار',  cls: 'b-warning' },
  confirmed:    { label: 'تأیید شده',  cls: 'b-info' },
  shipped:      { label: 'ارسال شده',  cls: 'b-info' },
  delivered:    { label: 'تحویل شده',  cls: 'b-success' },
  cancelled:    { label: 'لغو شده',    cls: 'b-danger' },
  // محصول
  active:       { label: 'فعال',       cls: 'b-success' },
  out_of_stock: { label: 'ناموجود',    cls: 'b-danger' },
  draft:        { label: 'پیش‌نویس',   cls: 'b-gray' },
  archived:     { label: 'بایگانی',    cls: 'b-gray' },
  // مالی
  paid:         { label: 'تسویه شده',  cls: 'b-success' },
};

/* ============================================================
   ۲. ابزارهای پایه
   ============================================================ */
const $  = (s, sc = document) => sc.querySelector(s);
const $$ = (s, sc = document) => Array.from(sc.querySelectorAll(s));

const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

/** عدد لاتین → فارسی */
const toFa = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);

/** عدد فارسی → لاتین (برای مقایسه و مرتب‌سازی) */
/*
 * ارقام فارسی/عربی → انگلیسی، و حذف جداکننده‌ی هزارگان.
 * سایت «۵۰۰٬۰۰۰» نشان می‌دهد؛ کاربر همان را کپی می‌کند.
 */
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toEn = (s) => String(s ?? '')
  .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d))
  .replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
  .replace(/[٬,\u066C\u2009\u202F]/g, '')
  .replace(/٫/g, '.')
  .trim();

/** مبلغ با جداکننده‌ی فارسی */
const money = (n) => toFa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');

/** تأخیر در اجرا — برای جست‌وجو */
function debounce(fn, delay = 300) {
  let t;
  return function (...a) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, a), delay);
  };
}

/** ساخت نشان وضعیت */
function badge(key) {
  const s = STATUS[key] || { label: key, cls: 'b-gray' };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

/** آیکون‌های SVG */
const SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/>',
  box:       '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
  cart:      '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
  wallet:    '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.5 12.5h4"/><circle cx="16.8" cy="12.5" r="1"/>',
  user:      '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  logout:    '<path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8.5 6 12l4 3.5M6 12h9"/>',
  search:    '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
  plus:      '<path d="M12 5.5v13M5.5 12h13"/>',
  edit:      '<path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5V15.5z"/><path d="m14 6 4 4"/>',
  trash:     '<path d="M4.5 6.5h15M9 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 4.8v1.7"/><path d="M6.5 6.5 7.5 20a1.4 1.4 0 0 0 1.4 1.3h6.2A1.4 1.4 0 0 0 16.5 20l1-13.5"/>',
  eye:       '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  bell:      '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
  check:     '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x:         '<path d="M18 6 6 18M6 6l12 12"/>',
  alert:     '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  upload:    '<path d="M20 15.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-3.5"/><path d="M8 8.5 12 4.5l4 4M12 4.5V15"/>',
  trendUp:   '<path d="M3.5 16.5 9 11l4 4 7.5-7.5"/><path d="M15.5 7.5h5v5"/>',
  trendDown: '<path d="M3.5 7.5 9 13l4-4 7.5 7.5"/><path d="M15.5 16.5h5v-5"/>',
  chart:     '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  store:     '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
  download:  '<path d="M20 15.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-3.5"/><path d="M8 11 12 15l4-4M12 15V4.5"/>',
  clock:     '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
  lock:      '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
};

function icon(name, cls = 'ico') {
  return `<svg class="${cls}" viewBox="0 0 24 24" ${SW} aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ============================================================
   ۳. توست — پیام شناور
   ============================================================ */
function toast(message, type = 'success') {
  let wrap = $('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }

  const map = { success: 'check', error: 'x', warning: 'alert', info: 'info' };
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.innerHTML = `${icon(map[type] || 'info')}<span>${message}</span>`;
  wrap.appendChild(el);

  // یک فریم صبر می‌کنیم تا مرورگر حالت اولیه را ثبت کند، بعد انیمیشن
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));

  setTimeout(() => {
    el.classList.remove('show');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 3000);
}

/* ============================================================
   ۴. مودال
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

/* بستن با کلیک روی پس‌زمینه، دکمه‌ی ضربدر، یا Escape — همه با delegation */
document.addEventListener('click', (e) => {
  if (e.target.classList?.contains('modal-overlay')) closeModal(e.target);
  const closer = e.target.closest('[data-close]');
  if (closer) closeModal(closer.closest('.modal-overlay'));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $$('.modal-overlay.active').forEach(closeModal);
});

/* ============================================================
   ۵. سایدبار
   ============================================================ */
function initSidebar() {
  const sb = $('.sidebar');
  const bd = $('.backdrop');
  const burger = $('.burger');
  if (!sb) return;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function setOpen(open) {
    sb.classList.toggle('open', open);
    bd?.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open && isMobile());
    burger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  const close = () => setOpen(false);

  burger?.setAttribute('aria-expanded', 'false');
  burger?.addEventListener('click', () => setOpen(!sb.classList.contains('open')));
  bd?.addEventListener('click', close);

  // با کلیک روی هر لینک، در موبایل بسته شود
  sb.addEventListener('click', (e) => {
    if (e.target.closest('.sb-link') && isMobile()) close();
  });

  // با کلید Escape بسته شود
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sb.classList.contains('open')) close();
  });

  /* اگر کاربر پنجره را بزرگ کند، منو نباید نیمه‌باز وسط صفحه بماند.
     در حالت دسکتاپ منو همیشه ثابت است، پس حالت «باز» را پاک می‌کنیم. */
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { if (!isMobile()) close(); }, 120);
  });

  // لینک صفحه‌ی فعلی را طلایی کن
  const here = location.pathname.split('/').pop() || 'seller-dashboard.html';
  $$('.sb-link').forEach((a) => {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });
}

/* ============================================================
   ۶. شمارنده — با requestAnimationFrame
   ============================================================ */
function animateCounter(el, target, duration = 1100) {
  const isMoney = el.dataset.money === '1';
  const decimals = el.dataset.decimals ? +el.dataset.decimals : 0;
  const t0 = performance.now();

  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);       // easeOutCubic
    const val = target * eased;

    el.textContent = isMoney
      ? money(Math.round(val))
      : toFa(decimals ? val.toFixed(decimals) : Math.round(val));

    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/** شمارنده‌ها فقط وقتی دیده شدند اجرا شوند */
function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => animateCounter(el, +el.dataset.count));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      animateCounter(e.target, +e.target.dataset.count);
      io.unobserve(e.target);
    }
  }, { threshold: 0.3 });

  els.forEach((el) => io.observe(el));
}

/** نمودار وقتی دیده شد پر شود */
function initChart() {
  const chart = $('.chart');
  if (!chart) return;

  if (!('IntersectionObserver' in window)) { chart.classList.add('in'); return; }

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { chart.classList.add('in'); io.disconnect(); }
  }, { threshold: 0.25 });

  io.observe(chart);
}

/* ============================================================
   ۷. جدول — مرتب‌سازی، جست‌وجو، صفحه‌بندی
   ------------------------------------------------------------
   یک کلاس سبک که همه‌ی صفحات از آن استفاده می‌کنند.
   رندر با DocumentFragment انجام می‌شود تا فقط یک بار reflow شود.
   ============================================================ */
class DataTable {
  constructor({ rows, tbody, render, perPage = 8, searchFields = [], empty }) {
    this.all = rows;
    this.tbody = tbody;
    this.render = render;
    this.perPage = perPage;
    this.searchFields = searchFields;
    this.emptyHTML = empty || '<tr><td colspan="9"><div class="empty">هیچ موردی یافت نشد.</div></td></tr>';

    this.query = '';
    this.filters = {};
    this.sortKey = null;
    this.sortDir = 1;
    this.page = 1;
  }

  get filtered() {
    let out = this.all;

    // فیلترهای کشویی
    for (const [k, v] of Object.entries(this.filters)) {
      if (v) out = out.filter((r) => r[k] === v);
    }

    // جست‌وجو — روی متن لاتین‌شده تا اعداد فارسی هم پیدا شوند
    if (this.query) {
      const q = toEn(this.query).toLowerCase().trim();
      out = out.filter((r) =>
        this.searchFields.some((f) => {
          const val = Array.isArray(r[f]) ? r[f].join(' ') : r[f];
          return toEn(String(val ?? '')).toLowerCase().includes(q);
        })
      );
    }

    // مرتب‌سازی
    if (this.sortKey) {
      const k = this.sortKey, d = this.sortDir;
      out = [...out].sort((a, b) => {
        const x = a[k], y = b[k];
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * d;
        return String(toEn(x)).localeCompare(String(toEn(y)), 'fa') * d;
      });
    }

    return out;
  }

  get pages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); }

  draw() {
    const rows = this.filtered;
    if (this.page > this.pages) this.page = this.pages;

    const slice = rows.slice((this.page - 1) * this.perPage, this.page * this.perPage);

    // ساخت خارج از DOM → یک reflow
    if (!slice.length) {
      this.tbody.innerHTML = this.emptyHTML;
    } else {
      this.tbody.innerHTML = slice.map(this.render).join('');
    }

    this.drawPagination(rows.length);
  }

  drawPagination(total) {
    const box = $('#pagination');
    if (!box) return;

    if (total <= this.perPage) { box.innerHTML = ''; return; }

    const p = this.page, last = this.pages;
    let html = `<span class="page-info">نمایش ${toFa((p - 1) * this.perPage + 1)} تا ${toFa(Math.min(p * this.perPage, total))} از ${toFa(total)}</span>`;
    html += `<button class="page-btn" type="button" data-page="${p - 1}" ${p === 1 ? 'disabled' : ''}>قبلی</button>`;

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || Math.abs(i - p) <= 1) {
        html += `<button class="page-btn ${i === p ? 'active' : ''}" type="button" data-page="${i}">${toFa(i)}</button>`;
      } else if (Math.abs(i - p) === 2) {
        html += `<span class="page-btn" style="border:none;pointer-events:none">…</span>`;
      }
    }

    html += `<button class="page-btn" type="button" data-page="${p + 1}" ${p === last ? 'disabled' : ''}>بعدی</button>`;
    box.innerHTML = html;
  }

  /** اتصال کنترل‌ها — همه با delegation */
  bind() {
    // جست‌وجو
    const search = $('#search');
    search?.addEventListener('input', debounce((e) => {
      this.query = e.target.value;
      this.page = 1;
      this.draw();
    }, 280));

    // فیلترها
    $$('[data-filter]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        this.filters[sel.dataset.filter] = e.target.value;
        this.page = 1;
        this.draw();
      });
    });

    // مرتب‌سازی
    const thead = this.tbody.closest('table')?.querySelector('thead');
    thead?.addEventListener('click', (e) => {
      const th = e.target.closest('th.sortable');
      if (!th) return;

      const key = th.dataset.key;
      this.sortDir = this.sortKey === key ? -this.sortDir : 1;
      this.sortKey = key;

      $$('th', thead).forEach((h) => h.classList.remove('asc', 'desc'));
      th.classList.add(this.sortDir === 1 ? 'asc' : 'desc');
      this.draw();
    });

    // صفحه‌بندی
    $('#pagination')?.addEventListener('click', (e) => {
      const b = e.target.closest('.page-btn[data-page]');
      if (!b || b.disabled) return;
      this.page = +b.dataset.page;
      this.draw();
      // اسکرول نرم به بالای جدول
      this.tbody.closest('.card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    this.draw();
    return this;
  }
}

/* ============================================================
   ۸. اعتبارسنجی فرم
   ============================================================ */
const VALIDATORS = {
  required: (v) => (String(v).trim() ? null : 'این فیلد الزامی است.'),
  email:    (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'ایمیل معتبر نیست.'),
  phone:    (v) => (/^0\d{10}$/.test(toEn(v).replace(/[-\s]/g, '')) ? null : 'شماره موبایل معتبر نیست.'),
  min6:     (v) => (String(v).length >= 6 ? null : 'حداقل ۶ کاراکتر لازم است.'),
  positive: (v) => (Number(toEn(v)) > 0 ? null : 'عدد باید بزرگ‌تر از صفر باشد.'),
  notneg:   (v) => (Number(toEn(v)) >= 0 ? null : 'عدد نمی‌تواند منفی باشد.'),
};

function validateField(input) {
  const field = input.closest('.field');
  if (!field) return true;

  const rules = (input.dataset.rules || '').split('|').filter(Boolean);
  let error = null;

  for (const r of rules) {
    const fn = VALIDATORS[r];
    if (fn) { error = fn(input.value); if (error) break; }
  }

  field.classList.toggle('invalid', !!error);
  field.classList.toggle('valid', !error && !!input.value.trim() && rules.length > 0);

  const msg = field.querySelector('.err-msg');
  if (msg && error) msg.textContent = error;

  return !error;
}

/** اعتبارسنجی زنده — blur و سپس input */
function initValidation(form) {
  if (!form) return;

  form.addEventListener('blur', (e) => {
    if (e.target.dataset?.rules) validateField(e.target);
  }, true);

  form.addEventListener('input', (e) => {
    // فقط اگر قبلاً خطا داشته، زنده بررسی کن (تا موقع تایپ اذیت نکند)
    const field = e.target.closest?.('.field');
    if (field?.classList.contains('invalid')) validateField(e.target);
  });
}

function validateForm(form) {
  const inputs = $$('[data-rules]', form);
  let ok = true;
  for (const i of inputs) if (!validateField(i)) ok = false;
  return ok;
}

/* ============================================================
   ۹. راه‌اندازی مشترک
   ============================================================ */
function initShared() {
  initSidebar();
  initCounters();
  initChart();

  // خروج
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) {
      e.preventDefault();
      toast('در حال خروج از حساب…', 'info');
      window.DPStore?.auth.logout();
      setTimeout(() => (location.href = 'seller-login.html'), 800);
    }
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initShared, { once: true })
  : initShared();

/* ============================================================
   جداکننده‌ی هزارگان هنگام تایپ
   ------------------------------------------------------------
   «۱۲۵۰۰۰۰» را هیچ‌کس نمی‌تواند سریع بخواند. فروشنده باید
   رقم‌ها را با انگشت بشمارد تا مطمئن شود یک صفر کم یا زیاد
   نگذاشته — و همین جا بود که اشتباه‌های گران رخ می‌داد.

   حالا همان لحظه‌ی تایپ به «۱٬۲۵۰٬۰۰۰» تبدیل می‌شود.

   نکته‌ی ظریف: با هر بار قالب‌بندی، مکان‌نما به آخر می‌پرید و
   ویرایش وسط عدد ناممکن می‌شد. اینجا مکان‌نما بر پایه‌ی
   «تعداد رقم‌های سمت راستش» بازگردانده می‌شود، نه شماره‌ی
   نویسه — چون تعداد جداکننده‌ها عوض می‌شود.
   ============================================================ */
(function moneyInputs() {
  'use strict';

  const FA_D = '۰۱۲۳۴۵۶۷۸۹';

  /** فقط رقم‌های انگلیسی را نگه می‌دارد */
  function digitsOf(v) {
    return String(v == null ? '' : v)
      .replace(/[۰-۹]/g, (d) => String(FA_D.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/\D/g, '');
  }

  /** رقم‌ها → «۱٬۲۵۰٬۰۰۰» */
  function group(digits) {
    if (!digits) return '';
    /* صفرهای ابتدایی حذف می‌شوند، ولی خودِ صفر می‌ماند */
    const clean = digits.replace(/^0+(?=\d)/, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
                .replace(/\d/g, (d) => FA_D[+d]);
  }

  /** چند رقم از انتهای رشته تا مکان‌نما فاصله دارد؟ */
  function digitsAfter(text, caret) {
    return digitsOf(text.slice(caret)).length;
  }

  /** مکان‌نما را جایی بگذار که همان تعداد رقم بعدش باشد */
  function caretForDigits(text, want) {
    let seen = 0;
    for (let i = text.length; i >= 0; i--) {
      if (seen === want) return i;
      if (i > 0 && /[\d۰-۹٠-٩]/.test(text[i - 1])) seen++;
    }
    return 0;
  }

  function format(input) {
    const before = input.value;
    const caret = input.selectionStart ?? before.length;
    const tail = digitsAfter(before, caret);

    const after = group(digitsOf(before));
    if (after === before) return;

    input.value = after;

    const pos = caretForDigits(after, tail);
    try { input.setSelectionRange(pos, pos); } catch (e) { /* بی‌اهمیت */ }
  }

  /** آیا این ورودی پولی است؟ */
  function isMoneyInput(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    if (el.dataset.money === 'off') return false;
    if (el.dataset.money === '1') return true;

    /* ورودی‌های شناخته‌شده‌ی پنل فروشنده */
    return /^(pprice|pold|cVal|cMaxOff|cMinAmount|pMin|pMax)$/.test(el.id) ||
           /price|amount|mablagh|toman/i.test(el.id) ||
           el.classList.contains('money-in');
  }

  /* یک شنونده روی کل سند — پس فرم‌هایی که بعداً ساخته می‌شوند
     هم خودکار پوشش داده می‌شوند */
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (!isMoneyInput(el)) return;
    /* نوع تخفیف «درصدی» جداکننده لازم ندارد */
    if (el.id === 'cVal' && document.getElementById('cKind')?.value === 'percent') return;
    format(el);
  });

  /* هنگام بارگذاری، مقدارهای از پیش پرشده هم قالب می‌گیرند */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input').forEach((el) => {
      if (isMoneyInput(el) && el.value) format(el);
    });
  });
})();
