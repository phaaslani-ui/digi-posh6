/* ============================================================
   دیجی‌پوش — بخش نظرها (رابط کاربری)
   ------------------------------------------------------------
   کافی است یک عنصر با data-reviews در صفحه بگذارید:
     <div data-reviews data-kind="store" data-target="s1"></div>
   بقیه‌اش خودکار ساخته می‌شود.
   ============================================================ */
'use strict';

(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]).replace('.', '٫');

  const LABEL = ['خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'];

  /* مسیر صفحه‌ی حساب، نسبت به محل صفحه‌ی فعلی */
  function accountUrl() {
    const depth = location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean).length;
    const here = location.pathname.split('/').filter(Boolean);
    // اگر داخل پوشه‌ای مثل woman/ هستیم، یک پله بالا برویم
    const inFolder = here.length > 1;
    return (inFolder ? '../' : './') + 'account.html?mode=login';
  }

  /* ---------- توست ---------- */
  function toast(msg, type = 'success') {
    if (window.toast && window.toast !== toast) return window.toast(msg, type);
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast t-${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
      el.classList.remove('show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 3200);
  }

  /* ============================================================
     ساخت یک بخش نظر
     ============================================================ */
  async function build(box) {
    const kind = box.dataset.kind || 'store';
    const target = box.dataset.target;
    const sellerId = box.dataset.seller || '';
    const title = box.dataset.title || (kind === 'store' ? 'نظرها درباره‌ی این فروشگاه' : 'نظرها درباره‌ی این محصول');
    if (!target) return;

    const [sum, all, own] = await Promise.all([
      DPReviews.summary(kind, target),
      DPReviews.list(kind, target),
      DPReviews.mine(kind, target),
    ]);

    const user = window.DPUser?.me();
    const max = Math.max(...sum.spread, 1);

    /* ---------- خلاصه‌ی امتیاز ---------- */
    const head = sum.count ? `
      <div class="rv-summary">
        <div class="rv-score">
          <b>${fa(sum.avg)}</b>
          ${DPReviews.stars(sum.avg, 18)}
          <small>از ${fa(sum.count)} نظر</small>
        </div>
        <div class="rv-bars">
          ${[5, 4, 3, 2, 1].map((n) => `
            <div class="rv-bar">
              <span>${fa(n)} ستاره</span>
              <i><b style="width:${(sum.spread[n - 1] / max) * 100}%"></b></i>
              <em>${fa(sum.spread[n - 1])}</em>
            </div>`).join('')}
        </div>
      </div>` : '';

    /* ---------- جعبه‌ی نوشتن ---------- */
    let writer;
    if (!user) {
      writer = `
        <div class="rv-gate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>
          <div>
            <strong>برای ثبت نظر وارد حساب شوید</strong>
            <p>پس از ورود، همین‌جا می‌توانید امتیاز و نظرتان را بنویسید.</p>
          </div>
          <a class="rv-btn" href="${accountUrl()}">ورود / ثبت‌نام</a>
        </div>`;
    } else if (!DPReviews.canReview(kind, target).can && !own) {
      /*
       * وارد شده، ولی هنوز خرید تحویل‌شده‌ای ندارد.
       * به‌جای اینکه بگذاریم بنویسد و بعد خطا بگیرد، همین‌جا
       * روشن می‌گوییم چرا نمی‌تواند.
       */
      const gate = DPReviews.canReview(kind, target);
      writer = `
        <div class="rv-gate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 7.5h10v9H3z"/><path d="M13 10.5h4l3 3v3h-7z"/>
            <circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>
          </svg>
          <div>
            <strong>امتیاز فقط از خریدار واقعی</strong>
            <p>${esc(gate.why)}</p>
          </div>
        </div>`;
    } else {
      const r = own?.rating || 0;
      writer = `
        <form class="rv-form" novalidate>
          <div class="rv-form-head">
            <span class="rv-ava">${esc((user.fullName || user.email)[0])}</span>
            <div>
              <strong>${esc(user.fullName || String(user.email || '').split('@')[0] || 'کاربر')}</strong>
              <small>${own ? 'نظر شما ثبت شده — می‌توانید ویرایشش کنید' : 'امتیاز شما چند ستاره است؟'}</small>
            </div>
          </div>

          <div class="rv-pick" role="radiogroup" aria-label="امتیاز شما">
            ${[1, 2, 3, 4, 5].map((n) => `
              <button type="button" class="rv-pick-star ${r >= n ? 'on' : ''}" data-v="${n}"
                      role="radio" aria-checked="${r === n}" aria-label="${LABEL[n - 1]}" title="${LABEL[n - 1]}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/></svg>
              </button>`).join('')}
            <span class="rv-pick-label">${r ? LABEL[r - 1] : ''}</span>
          </div>

          <textarea class="rv-text" maxlength="600" rows="3"
            placeholder="تجربه‌تان را بنویسید… (اختیاری)">${esc(own?.text || '')}</textarea>

          <div class="rv-form-foot">
            <span class="rv-count">۰ / ۶۰۰</span>
            ${own ? '<button type="button" class="rv-del">حذف نظر من</button>' : ''}
            <button type="submit" class="rv-btn">${own ? 'به‌روزرسانی نظر' : 'ثبت نظر'}</button>
          </div>
        </form>`;
    }

    /* ---------- فهرست نظرها ---------- */
    const others = all.filter((r) => !user || r.userId !== user.id);
    const listHtml = all.length ? `
      <div class="rv-list">
        ${own ? row(own, true) : ''}
        ${others.map((r) => row(r, false)).join('')}
      </div>` : `
      <div class="rv-empty">هنوز نظری ثبت نشده. اولین نفر باشید!</div>`;

    box.innerHTML = `
      <div class="rv-head">
        <h2>${esc(title)}</h2>
        ${sum.count ? `<span class="rv-mini">${DPReviews.stars(sum.avg, 15)} ${fa(sum.avg)}</span>` : ''}
      </div>
      ${head}
      ${writer}
      ${listHtml}`;

    wire(box, kind, target, sellerId);
  }

  function row(r, isMine) {
    return `
      <article class="rv-item${isMine ? ' mine' : ''}">
        <span class="rv-ava">${esc((r.userName || '؟')[0])}</span>
        <div class="rv-body">
          <div class="rv-top">
            <strong>${esc(r.userName)}</strong>
            ${isMine ? '<em class="rv-tag">نظر شما</em>' : ''}
            <time>${esc(r.date)}</time>
          </div>
          ${DPReviews.stars(r.rating, 14)}
          ${r.verified !== false ? `<span class="rv-ok" title="این کاربر واقعاً خرید کرده است">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/>
              <path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg>خرید تأییدشده</span>` : ''}
          ${r.text ? `<p>${esc(r.text)}</p>` : ''}

          ${r.reply ? `
            <div class="rv-reply">
              <div class="rv-reply-top">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 10 4.5 14 9 18"/><path d="M4.5 14h9a6 6 0 0 0 6-6V6"/></svg>
                <strong>پاسخ فروشنده</strong>
                <time>${esc(r.replyDate || '')}</time>
              </div>
              <p>${esc(r.reply)}</p>
            </div>` : ''}
        </div>
      </article>`;
  }

  /* ============================================================
     رفتار
     ============================================================ */
  function wire(box, kind, target, sellerId) {
    const form = box.querySelector('.rv-form');
    if (!form) return;

    let picked = Number(box.querySelector('.rv-pick-star.on:last-of-type')?.dataset.v) || 0;
    const label = box.querySelector('.rv-pick-label');
    const starsEls = Array.from(box.querySelectorAll('.rv-pick-star'));

    const paint = (v) => starsEls.forEach((s, i) => {
      s.classList.toggle('on', i < v);
      s.setAttribute('aria-checked', String(i + 1 === picked));
    });

    starsEls.forEach((s) => {
      s.addEventListener('click', () => {
        picked = Number(s.dataset.v);
        paint(picked);
        label.textContent = LABEL[picked - 1];
      });
      // پیش‌نمایش با حرکت ماوس
      s.addEventListener('mouseenter', () => {
        paint(Number(s.dataset.v));
        label.textContent = LABEL[Number(s.dataset.v) - 1];
      });
    });

    box.querySelector('.rv-pick')?.addEventListener('mouseleave', () => {
      paint(picked);
      label.textContent = picked ? LABEL[picked - 1] : '';
    });

    /* شمارنده‌ی نویسه */
    const ta = box.querySelector('.rv-text');
    const counter = box.querySelector('.rv-count');
    const upd = () => (counter.textContent = `${fa(ta.value.length)} / ۶۰۰`);
    ta.addEventListener('input', upd);
    upd();

    /* ثبت */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!picked) { toast('لطفاً با ستاره‌ها امتیاز بدهید.', 'error'); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await DPReviews.save(kind, target, picked, ta.value, sellerId);
        toast('نظر شما ثبت شد. سپاسگزاریم!', 'success');
        await build(box);
        document.dispatchEvent(new CustomEvent('dp:review', { detail: { kind, target } }));
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false;
      }
    });

    /* حذف */
    box.querySelector('.rv-del')?.addEventListener('click', async () => {
      await DPReviews.remove(kind, target);
      toast('نظر شما حذف شد.', 'success');
      await build(box);
      document.dispatchEvent(new CustomEvent('dp:review', { detail: { kind, target } }));
    });
  }

  /* ============================================================
     راه‌اندازی
     ============================================================ */
  function init(scope = document) {
    scope.querySelectorAll('[data-reviews]').forEach(build);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => init(), { once: true })
    : init();

  window.dpReviewsInit = init;
  window.dpBuildReviews = build;
})();
