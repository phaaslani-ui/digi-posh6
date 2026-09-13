/* ============================================================
   دیجی‌پوش — شخصی‌سازی پنل با اطلاعات واقعی فروشنده
   ------------------------------------------------------------
   هر جای پنل که `data-dp="..."` داشته باشد، با داده‌ی واقعی
   حساب شما پر می‌شود. هیچ نام یا فروشگاه ثابتی در کد نمانده.
   ============================================================ */
'use strict';

/* وعده‌ی آماده‌شدن پنل — صفحات با onDPReady(...) کارشان را شروع می‌کنند */
window.DPReady = (async function () {
  if (!window.DPStore) return null;

  // اگر وارد نشده، به صفحه‌ی ورود برو
  if (!DPStore.auth.isLoggedIn()) { location.replace('seller-login.html'); return null; }

  const me = await DPStore.auth.me();
  if (!me) { DPStore.auth.logout(); location.replace('seller-login.html'); return null; }
  window.ME = me;

  // صبر می‌کنیم تا کل صفحه ساخته شود، بعد سراغ عناصر برویم
  if (document.readyState === 'loading') {
    await new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  paint(me);
  applyLock(me);
  await badges();

  document.dispatchEvent(new CustomEvent('dp:ready', { detail: me }));
  return me;
})();

/* ============================================================
   نشاندن اطلاعات واقعی در همه‌ی جای‌های نشانه‌گذاری‌شده
   ============================================================ */
function paint(me) {
  /* اگر داده‌ی فروشنده ناقص بود، پنل باید کار کند نه اینکه سفید شود */
  me = me || {};

  const q  = (s) => document.querySelector(s);
  const qq = (s) => Array.from(document.querySelectorAll(s));

  /* اگر ایمیل نبود، پنل نباید سفید شود */
  const name  = (me.fullName || '').trim() ||
                String(me.email || '').split('@')[0] || 'فروشنده';
  const store = (me.storeName || '').trim() || 'فروشگاه من';
  const letter = store.trim()[0] || name.trim()[0] || '؟';

  const CHECK = '<svg class="ico ico-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const CLOCK = '<svg class="ico ico-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/></svg>';
  const CROSS = '<svg class="ico ico-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

  /* مقدار هر نشانه */
  const VALUES = {
    fullName:  name,
    storeName: store,
    letter:    letter,
    welcome:   'خوش آمدید، ' + name,
    email:     me.email || '',
    city:      me.city || '',
    phone:     me.phone || '',
    joinDate:  me.joinDate ? 'عضویت از ' + me.joinDate : 'عضو تازه',
  };

  for (const [key, val] of Object.entries(VALUES)) {
    qq(`[data-dp="${key}"]`).forEach((el) => { el.textContent = val; });
  }

  /* نشان تأیید — صادقانه بر اساس وضعیت واقعی */
  const CHIP = {
    approved:  { cls: 'verify-chip',                    ico: CHECK, text: 'فروشنده تأییدشده' },
    pending:   { cls: 'verify-chip verify-chip--wait',  ico: CLOCK, text: 'در انتظار تأیید' },
    rejected:  { cls: 'verify-chip verify-chip--no',    ico: CROSS, text: 'درخواست رد شد' },
    suspended: { cls: 'verify-chip verify-chip--no',    ico: CROSS, text: 'فروشگاه معلق است' },
  };

  qq('[data-dp="verify"]').forEach((el) => {
    const c = CHIP[me.status] || CHIP.pending;
    el.className = c.cls;
    el.innerHTML = c.ico + ' ' + c.text;
  });

  /* اگر لوگو دارد، به‌جای حرف اول در سایدبار نشانش بده */
  qq('.sb-avatar').forEach((el) => {
    const old = el.parentElement?.querySelector('.sb-avatar-img');
    if (me.logo) {
      if (old) { old.src = me.logo; return; }
      const img = document.createElement('img');
      img.className = 'sb-avatar sb-avatar-img';
      img.src = me.logo;
      img.alt = '';
      el.after(img);
      el.hidden = true;
    } else {
      old?.remove();
      el.hidden = false;
    }
  });

  /* اگر رد یا معلق شده، دلیلش را بالای صفحه نشان بده */
  showStatusNotice(me);

  /* عنوان مرورگر — نام فروشگاه به جای «دیجی‌پوش» */
  if (document.title.includes('دیجی‌پوش')) {
    document.title = document.title.replace('دیجی‌پوش', store);
  }
}

/* ============================================================
   نوار وضعیت فروشگاه — همیشه بالای هر صفحه
   ------------------------------------------------------------
   تأییدشده → نواری نمایش داده نمی‌شود
   در انتظار → هشدار زرد: محصولاتت پیش‌نویس می‌مانند
   ردشده    → نوار قرمز + دکمه‌ی «درخواست بررسی دوباره»
   معلق     → نوار قرمز
   ============================================================ */
function showStatusNotice(me) {
  document.querySelector('.dp-status-notice')?.remove();
  if (me.status === 'approved') return;

  const content = document.querySelector('.content');
  if (!content) return;

  const box = document.createElement('div');
  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  /* ---------- در انتظار تأیید ---------- */
  if (me.status === 'pending') {
    const asked = me.reviewRequested;
    box.className = 'dp-status-notice is-warn';
    box.innerHTML = `
      <strong>فروشگاه شما در انتظار تأیید مدیر است.</strong>
      <span>می‌توانید همین حالا محصول اضافه کنید — ولی تا زمان تأیید،
      محصولات به‌صورت <b>پیش‌نویس</b> می‌مانند و در سایت دیده نمی‌شوند.</span>
      <span>به‌محض تأیید، همه‌ی پیش‌نویس‌ها <b>خودکار منتشر می‌شوند</b>.</span>
      ${asked ? '<span class="dp-note-ok">درخواست بررسی شما ثبت شده است.</span>' : ''}`;
    content.prepend(box);
    return;
  }

  /* ---------- ردشده یا معلق ---------- */
  const isRejected = me.status === 'rejected';
  box.className = 'dp-status-notice is-bad';
  box.innerHTML = `
    <strong>${isRejected
      ? 'درخواست فروشندگی شما رد شد.'
      : 'فروشگاه شما موقتاً معلق شده است.'}</strong>
    ${me.rejectionReason ? `<span>دلیل: <b>${String(me.rejectionReason)}</b></span>` : ''}
    <span>تا رفع مشکل، امکان افزودن یا ویرایش محصول ندارید و
    محصولاتتان از ویترین برداشته شده‌اند.</span>
    <div class="dp-notice-act">
      ${me.reviewRequested
        ? '<span class="dp-note-ok">درخواست بررسی دوباره ثبت شد — منتظر پاسخ مدیر باشید.</span>'
        : '<button type="button" class="dp-recheck">درخواست بررسی دوباره</button>'}
      <a class="dp-note-link" href="seller-profile.html">اصلاح اطلاعات فروشگاه</a>
    </div>`;

  content.prepend(box);

  box.querySelector('.dp-recheck')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await DPStore.auth.requestReview();
      window.toast && toast('درخواست بررسی دوباره فرستاده شد.', 'success');
      const fresh = await dpRefresh();
      if (fresh) showStatusNotice(fresh);
    } catch (err) {
      window.toast && toast(err.message || 'ارسال درخواست ناموفق بود.', 'error');
      btn.disabled = false;
    }
  });
}

/* ============================================================
   قفل کردن صفحه‌ها برای فروشگاه ردشده یا معلق
   ============================================================ */
function applyLock(me) {
  const rule = DPStore.rulesFor(me.status);
  if (!rule.locked) return;

  // دکمه‌ها و لینک‌های افزودن محصول
  document.querySelectorAll('a[href*="seller-product-form"]').forEach((a) => {
    a.classList.add('is-locked');
    a.setAttribute('aria-disabled', 'true');
    a.title = 'دسترسی فروشگاه شما بسته است';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.toast && toast('تا تأیید مجدد، امکان افزودن محصول ندارید.', 'warning');
    });
  });

  // اگر داخل فرم محصول است، فرم را غیرفعال کن
  const form = document.getElementById('productForm');
  if (form) {
    form.querySelectorAll('input, select, textarea, button').forEach((el) => (el.disabled = true));
    form.classList.add('is-locked');
  }
}

/* ============================================================
   شمارنده‌های کنار منو — از داده‌ی واقعی
   ============================================================ */
async function badges() {
  const fa = (x) => String(x).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  /** فقط وقتی عدد بزرگ‌تر از صفر باشد، نشان دیده می‌شود */
  const show = (el, n) => {
    if (!el) return;
    if (n > 0) { el.textContent = fa(n); el.hidden = false; }
    else { el.remove(); }
  };

  try {
    const [ps, os] = await Promise.all([DPStore.products.list(), DPStore.orders.list()]);

    show(document.querySelector('a[href="seller-products.html"] .sb-badge'), ps.length);
    show(document.querySelector('a[href="seller-orders.html"] .sb-badge'),
         os.filter((o) => o.status === 'pending').length);

    /* مرجوعی‌های در انتظار بررسی */
    if (window.DPReturns) {
      show(document.querySelector('a[href="seller-returns.html"] .sb-badge'),
           DPReturns.forSeller(ME.id).filter((r) => r.status === 'pending').length);
    }

    /* نظرهای تازه‌ی خوانده‌نشده */
    if (window.DPReviews && DPReviews.unseenFor) {
      show(document.querySelector('a[href="seller-reviews.html"] .sb-badge'),
           DPReviews.unseenFor(ME.id));
    }
  } catch (_) {
    // اگر داده‌ای نبود، نشان‌ها بی‌صدا حذف می‌شوند
    document.querySelectorAll('.sb-badge').forEach((b) => b.remove());
  }
}

/** هر صفحه با این تابع کارش را شروع می‌کند */
window.onDPReady = function (fn) {
  window.DPReady
    .then((me) => { if (me) return fn(me); })
    .catch((err) => {
      console.error(err);
      window.toast && toast(err.message || 'خطایی رخ داد.', 'error');
    });
};

/** بعد از ذخیره‌ی پروفایل، همه‌ی نمایش‌ها را تازه کن */
window.dpRefresh = async function () {
  const fresh = await DPStore.auth.me();
  if (!fresh) return null;
  window.ME = fresh;
  paint(fresh);
  return fresh;
};
