/* ============================================================
   دیجی‌پوش — ویترین محصولات هر بخش
   ------------------------------------------------------------
   محصولی که فروشنده در بخش «تینیجر» ثبت کرده، خودکار در
   صفحه‌ی تینیجر دیده می‌شود. همین‌طور بقیه‌ی بخش‌ها.
   صفحه‌ی اصلی هم تازه‌ترین محصولات همه‌ی بخش‌ها را نشان می‌دهد.
   ============================================================ */
'use strict';

(function () {
  const PAGE = document.body.dataset.dpPage || 'home';

  /* نگاشت نام صفحه به کلید بخش در درخت دسته‌بندی */
  const SEC = { woman: 'women', man: 'men', kids: 'kids', teen: 'teen' };
  const section = SEC[PAGE] || null;
  const UP = PAGE === 'home' ? './' : '../';

  /* بخش مبدأ روی لینک فروشگاه سوار می‌شود تا صفحه‌ی فروشگاه
     تم همین بخش را بگیرد */
  const FROM = { woman: 'women', man: 'men', kids: 'kids', teen: 'teen' }[PAGE] || '';
  const shopUrl = (sid) =>
    `${UP}store.html?id=${encodeURIComponent(sid)}` + (FROM ? `&from=${FROM}` : '');

  /* هر کالا صفحه‌ی اختصاصی خودش را دارد */
  const prodUrl = (pid) => `${UP}product.html?id=${encodeURIComponent(pid)}`;

  const FA = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const money = (n) => FA(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const TITLE = {
    home:  { eyebrow: 'تازه‌ترین‌ها', h: 'محصولات تازه‌ی فروشندگان' },
    woman: { eyebrow: 'ویترین زنانه', h: 'محصولات پوشاک زنانه' },
    man:   { eyebrow: 'ویترین مردانه', h: 'محصولات پوشاک مردانه' },
    kids:  { eyebrow: 'ویترین کودک',  h: 'محصولات پوشاک کودک' },
    teen:  { eyebrow: 'ویترین نوجوان', h: 'محصولات پوشاک نوجوان' },
  };

  /* ============================================================
     خواندن محصولات فعال
     ============================================================ */
  function products() {
    let ps = [], users = [];
    try { ps = (window.DPSafe ? DPSafe.products() : []); } catch {}
    try { users = (window.DPSafe ? DPSafe.sellers() : []); } catch {}

    /* فقط فروشگاه‌هایی که تأیید یا در انتظارند */
    const okSellers = new Set(users
      .filter((u) => {
        const st = u.status || (u.isVerified ? 'approved' : 'pending');
        return st === 'approved' || st === 'pending';
      })
      .map((u) => u.id));

    const byId = {};
    for (const u of users) byId[u.id] = u;

    const T = window.DPTaxonomy;

    return ps
      .filter((p) => p.status === 'active' && okSellers.has(p.sellerId))
      .map((p) => ({
        ...p,
        sec: p.section || T?.findByItem(p.category)?.section || '',
        sellerName: byId[p.sellerId]?.storeName || 'فروشگاه',
        sellerLogo: byId[p.sellerId]?.logo || '',
      }))
      .filter((p) => (section ? p.sec === section : true))
      .reverse();
  }

  /* ============================================================
     کارت محصول
     ============================================================ */
  function card(p) {
    const C = window.DPColors;
    const R = window.DPReviews;
    const img = (p.images || [])[0];
    const low = Number(p.stock) > 0 && Number(p.stock) <= 3;

    const cols = (p.colors || []).map((k) => C?.find(k)).filter(Boolean);
    const rate = R ? (R.storeRatingsMap()[p.sellerId] || null) : null;

    /* تخفیف فعال فروشنده */
    const sale = window.DPPromo ? DPPromo.sales.priceOf(p) : { price: p.price, old: null, percent: 0 };

    return `
      <article class="dpp-card">
        <a class="dpp-thumb" href="${prodUrl(p.id)}" aria-label="دیدن ${esc(p.name)}">
          ${img
            ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" />`
            : `<span class="dpp-letter">${esc((p.name || '؟').trim()[0])}</span>`}
          ${sale.percent ? `<em class="dpp-off">${FA(sale.percent)}٪ تخفیف</em>` : ''}
          ${low && window.DPStock
            ? `<em class="dpp-tag">${DPStock.status(p.stock).short}</em>` : ''}
        </a>

        <div class="dpp-body">
          <a class="dpp-shop" href="${shopUrl(p.sellerId)}">
            <span class="dpp-shop-ava">${p.sellerLogo
              ? `<img src="${esc(p.sellerLogo)}" alt="" loading="lazy" />`
              : esc((p.sellerName || '؟')[0])}</span>
            <span>${esc(p.sellerName)}</span>
            ${rate ? `<b class="dpp-rate">${FA(rate.avg)}</b>` : ''}
          </a>

          <h3 class="dpp-name"><a href="${prodUrl(p.id)}">${esc(p.name)}</a></h3>
          ${p.category ? `<span class="dpp-cat">${esc(p.category)}</span>` : ''}

          ${cols.length ? `<div class="pcolors">${
            cols.slice(0, 5).map((c) => C.bubble(c.id, 14)).join('')}${
            cols.length > 5 ? `<span class="more">+${FA(cols.length - 5)}</span>` : ''}</div>` : ''}

          <div class="dpp-foot">
            <span class="dpp-price">${sale.percent
              ? `<s>${money(sale.old)}</s>${money(sale.price)}`
              : money(p.price)}<small>تومان</small></span>
            <button class="dpp-add" type="button" data-add="${esc(p.id)}"
                    aria-label="افزودن ${esc(p.name)} به سبد">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13"/></svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  /* ============================================================
     ساخت بخش
     ============================================================ */
  function run() {
    const all = products();

    const T = TITLE[PAGE] || TITLE.home;
    const STEP = PAGE === 'home' ? 8 : 12;

    const sec = document.createElement('section');
    sec.className = 'dpp-section';
    sec.id = 'live-products';

    /* ---------- اگر هنوز کالایی ثبت نشده ---------- */
    if (!all.length) {
      sec.innerHTML = `
        <div class="dpp-wrap">
          <div class="dpp-head">
            <div>
              <span class="dpp-eyebrow">${esc(T.eyebrow)}</span>
              <h2>${esc(T.h)}</h2>
            </div>
          </div>
          <p class="dp-empty-stores">
            هنوز کالایی در این بخش ثبت نشده است.
            <a href="${UP}seller/seller-signup.html">اولین فروشنده باشید</a>
          </p>
        </div>`;
      place(sec);
      return;
    }

    /* ---------- سبک‌های موجود، برای فیلتر ---------- */
    const Tx = window.DPTaxonomy;
    const groupsSeen = [];
    all.forEach((p) => {
      const g = p.group || (Tx && Tx.findByItem(p.category)?.group) || '';
      p.grp = g;
      if (g && !groupsSeen.some((x) => x.key === g)) {
        groupsSeen.push({ key: g, label: (Tx && Tx.groupLabel(p.sec, g)) || g });
      }
    });

    const chips = groupsSeen.length > 1
      ? `<div class="dpp-filters" role="group" aria-label="فیلتر سبک کالا">
           <button class="dpp-fchip on" type="button" data-grp="">همه</button>
           ${groupsSeen.map((g) =>
             `<button class="dpp-fchip" type="button" data-grp="${esc(g.key)}">${esc(g.label)}</button>`
           ).join('')}
         </div>`
      : '';

    /* ---------- آمار کوتاه بالای ویترین ---------- */
    const shops = new Set(all.map((p) => p.sellerId)).size;
    const offs  = all.filter((p) => (window.DPPromo
      ? DPPromo.sales.priceOf(p).percent : 0) > 0).length;
    const cheapest = Math.min.apply(null, all.map((p) => Number(p.price) || 0));

    const facts = `
      <ul class="dpp-facts">
        <li><b>${FA(all.length)}</b><span>کالای موجود</span></li>
        <li><b>${FA(shops)}</b><span>فروشگاه فعال</span></li>
        ${offs ? `<li><b>${FA(offs)}</b><span>کالای تخفیف‌دار</span></li>` : ''}
        ${cheapest > 0 ? `<li><b>${money(cheapest)}</b><span>ارزان‌ترین قیمت (تومان)</span></li>` : ''}
      </ul>`;

    sec.innerHTML = `
      <div class="dpp-wrap">
        <div class="dpp-head">
          <div>
            <span class="dpp-eyebrow">${esc(T.eyebrow)}</span>
            <h2>${esc(T.h)}</h2>
          </div>
          <span class="dpp-count">${FA(all.length)} کالای موجود</span>
        </div>
        ${facts}
        ${chips}

        <button class="dpf-mobile" type="button" data-fmob aria-expanded="false"
                aria-controls="dpFilterBox">
          <span>فیلتر کالاها</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg>
        </button>

        <div class="dp-shop-layout">
          <div class="dpf-rail-col">
            <aside class="dp-filters is-collapsed" id="dpFilterBox"
                   aria-label="فیلتر کالاها"></aside>
          </div>
          <div class="dpf-results-col">
            <div class="dpp-grid"></div>
          </div>
        </div>

        <div class="dpp-more-row" hidden>
          <button class="dpp-more" type="button">نمایش کالاهای بیشتر</button>
        </div>
        <div class="dpf-veil" data-fveil hidden></div>
      </div>`;

    const gridEl = sec.querySelector('.dpp-grid');
    const moreRow = sec.querySelector('.dpp-more-row');
    const moreBtn = sec.querySelector('.dpp-more');
    const filterBox = sec.querySelector('#dpFilterBox');

    let list = all.slice();     // فهرست فیلترشده‌ی جاری
    let limit = STEP;
    let groupPick = '';         // سبک انتخاب‌شده با چیپ‌های بالا

    function paint() {
      gridEl.innerHTML = list.length
        ? list.slice(0, limit).map(card).join('')
        : '<p class="dp-empty-stores">در این سبک هنوز کالایی نیست.</p>';
      moreRow.hidden = list.length <= limit;
      const c = sec.querySelector('.dpp-count');
      if (c) c.textContent = FA(list.length) + ' کالای موجود';
    }
    paint();

    moreBtn.addEventListener('click', () => { limit += STEP; paint(); });

    /* ============================================================
       نوار فیلتر پیشرفته
       ------------------------------------------------------------
       فیلتر روی همان فهرستی کار می‌کند که چیپ سبک ساخته، پس
       دو سازوکار با هم نمی‌جنگند.
       ============================================================ */
    let filtered = null;      // خروجی نوار فیلتر، یا null اگر فیلتری فعال نیست

    if (window.DPFilters && filterBox) {
      DPFilters.build(filterBox, all, (out) => {
        filtered = out;
        list = groupPick ? out.filter((p) => p.grp === groupPick) : out;
        limit = STEP;

        /* محو و پیدا شدن نرم — مشتری می‌فهمد نتیجه عوض شد
           و شبکه بی‌مقدمه نمی‌پرد */
        gridEl.classList.add('dpf-busy');
        paint();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => gridEl.classList.remove('dpf-busy'));
        });
      });

      /* ============================================================
         چسبندگی هوشمند
         ------------------------------------------------------------
         نوار فیلتر تا انتهای شبکه‌ی کالا همراه می‌آید و درست
         همان‌جا می‌ایستد — نه یک پیکسل بیشتر.

         ارتفاع نوار ناوبری هم اندازه گرفته می‌شود تا فیلتر
         زیرش پنهان نشود.
         ============================================================ */
      const remeasure = DPFilters.stick(filterBox, gridEl);

      const navTop = () => {
        const nav = document.querySelector('.navbar, .navbar-m, header nav, .nav');
        const h = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty(
          '--dpf-top', (h > 0 && h < 160 ? h + 16 : 84) + 'px');
      };
      navTop();
      window.addEventListener('resize', navTop, { passive: true });

      /* ============================================================
         کشوی موبایل
         ============================================================ */
      const fmob = sec.querySelector('[data-fmob]');
      const veil = sec.querySelector('[data-fveil]');

      const setOpen = (open) => {
        filterBox.classList.toggle('is-collapsed', !open);
        if (fmob) fmob.setAttribute('aria-expanded', String(open));
        if (veil) { veil.hidden = false; veil.classList.toggle('on', open); }
        document.body.classList.toggle('dpf-lock', open && window.innerWidth < 981);
        if (open) filterBox.scrollTop = 0;
      };

      if (fmob) fmob.addEventListener('click', () => {
        setOpen(filterBox.classList.contains('is-collapsed'));
      });
      if (veil) veil.addEventListener('click', () => setOpen(false));

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !filterBox.classList.contains('is-collapsed')) {
          setOpen(false);
          return;
        }

        /* ---------- میان‌برهای صفحه‌کلید ----------
           فقط وقتی کاربر داخل کادر نوشتن نیست، وگرنه
           تایپ عادی را می‌دزدند. */
        const t = e.target;
        const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
          || t.isContentEditable);
        if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

        /* F → پریدن به فیلتر */
        if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
          e.preventDefault();
          if (window.innerWidth < 981) setOpen(true);
          const q = filterBox.querySelector('[data-q]');
          if (q) { q.focus(); q.select(); }
          else filterBox.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      });

      /* دکمه‌ی «نمایش نتیجه» ته کشو — فقط روی موبایل دیده می‌شود */
      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'dpf-done';
      done.addEventListener('click', () => setOpen(false));
      filterBox.appendChild(done);

      /* ============================================================
         به‌روزرسانی شمارنده‌ها
         ------------------------------------------------------------
         نوار فیلتر خودش رویداد `dpf:change` می‌فرستد، پس دیگر
         نیازی به حدس زدن با تایمر نیست.
         ============================================================ */
      const sync = (count, active) => {
        /* دکمه‌ی بالای صفحه */
        if (fmob) {
          let b = fmob.querySelector('b');
          if (active > 0) {
            if (!b) {
              b = document.createElement('b');
              fmob.insertBefore(b, fmob.querySelector('svg'));
            }
            b.textContent = FA(active) + ' فیلتر · ' + FA(count) + ' کالا';
          } else if (b) b.remove();
        }
        /* دکمه‌ی ته کشو */
        done.textContent = count
          ? 'نمایش ' + FA(count) + ' کالا'
          : 'نتیجه‌ای نیست — فیلتر را کم کنید';
        done.disabled = count === 0;

        /* چسبندگی دوباره اندازه‌گیری شود، چون تعداد کالا عوض شد */
        if (remeasure) remeasure();

        /* نوار فیلتر داخل کشو بازساخته می‌شود، پس دکمه‌ی
           «نمایش نتیجه» باید دوباره ته آن برود */
        if (done.parentElement !== filterBox) filterBox.appendChild(done);
        else filterBox.appendChild(done);
      };

      filterBox.addEventListener('dpf:change', (e) => {
        sync(e.detail.count, e.detail.active);
      });
      sync(all.length, 0);
    }

    sec.querySelectorAll('.dpp-fchip').forEach((b) => {
      b.addEventListener('click', () => {
        sec.querySelectorAll('.dpp-fchip').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        groupPick = b.dataset.grp || '';
        /* پایه‌ی کار، خروجی نوار فیلتر است — نه کل فهرست.
           وگرنه کلیک روی چیپ سبک، فیلترهای مشتری را می‌پراند. */
        const base = filtered || all;
        list = groupPick ? base.filter((p) => p.grp === groupPick) : base.slice();
        limit = STEP;
        paint();
      });
    });

    place(sec);

    /* ============================================================
       افزودن سریع به سبد — بدون ترک صفحه
       ============================================================ */
    sec.addEventListener('click', (e) => {
      /* --- بستن انتخابگر باز --- */
      if (e.target.closest('[data-pick-close]')) { closePick(); return; }

      /* --- تأیید انتخاب رنگ و سایز --- */
      const done = e.target.closest('[data-pick-done]');
      if (done) {
        const pick = done.closest('.dpp-pick');
        const p = all.find((x) => String(x.id) === pick.dataset.for);
        const size  = pick.querySelector('.dpp-chip.on[data-size]')?.dataset.size || '';
        const color = pick.querySelector('.dpp-dot.on')?.dataset.color
                   || (p.colors || [])[0] || '';

        if ((p.sizes || []).length && !size) {
          const w = pick.querySelector('.dpp-pick-warn');
          if (w) { w.hidden = false; }
          return;
        }
        addNow(p, { color, size }, pick.closest('.dpp-card')?.querySelector('.dpp-add'));
        closePick();
        return;
      }

      /* --- انتخاب رنگ یا سایز داخل انتخابگر --- */
      const chip = e.target.closest('.dpp-pick .dpp-chip, .dpp-pick .dpp-dot');
      if (chip) {
        const row = chip.parentElement;
        row.querySelectorAll('.dpp-chip, .dpp-dot').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        const w = chip.closest('.dpp-pick').querySelector('.dpp-pick-warn');
        if (w) w.hidden = true;
        return;
      }

      /* --- دکمه‌ی به‌اضافه --- */
      const b = e.target.closest('[data-add]');
      if (!b) return;

      const p = all.find((x) => String(x.id) === b.dataset.add);
      if (!p) return;

      const needSize  = (p.sizes  || []).length > 0;
      const needColor = (p.colors || []).length > 1;

      /* اگر انتخابی لازم نیست، همان لحظه به سبد می‌رود */
      if (!needSize && !needColor) {
        addNow(p, { color: (p.colors || [])[0] || '', size: '' }, b);
        return;
      }

      /* وگرنه انتخابگر کوچک روی همان کارت باز می‌شود */
      openPick(b.closest('.dpp-card'), p);
    });

    /* ---------- افزودن واقعی ---------- */
    function addNow(p, opt, btn) {
      try {
        DPCart.add(p.id, { color: opt.color || '', size: opt.size || '', qty: 1 });
        if (btn) flash(btn);
        window.dpToast?.(`${p.name} به سبد اضافه شد.`);
      } catch (err) {
        window.dpToast?.(err.message, 'error');
      }
    }

    /* ---------- انتخابگر رنگ و سایز روی کارت ---------- */
    function closePick() {
      sec.querySelectorAll('.dpp-pick').forEach((x) => x.remove());
      sec.querySelectorAll('.dpp-card.is-pick').forEach((x) => x.classList.remove('is-pick'));
    }

    function openPick(cardEl, p) {
      const already = cardEl.querySelector('.dpp-pick');
      closePick();
      if (already) return;                      // کلیک دوم، می‌بندد

      const C = window.DPColors;
      const cols = (p.colors || []).map((k) => C?.find(k)).filter(Boolean);

      const box = document.createElement('div');
      box.className = 'dpp-pick';
      box.dataset.for = String(p.id);
      box.innerHTML =
        `<div class="dpp-pick-head">
           <strong>انتخاب کنید</strong>
           <button class="dpp-pick-x" type="button" data-pick-close aria-label="بستن">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
         </div>` +

        (cols.length > 1
          ? `<span class="dpp-pick-lbl">رنگ</span>
             <div class="dpp-pick-row">${cols.map((c, i) =>
               `<button class="dpp-dot${i === 0 ? ' on' : ''}" type="button"
                        data-color="${esc(c.id)}" title="${esc(c.name || c.id)}"
                        aria-label="${esc(c.name || c.id)}"
                        style="--bg:${C ? C.background(c) : '#ccc'}"></button>`
             ).join('')}</div>` : '') +

        ((p.sizes || []).length
          ? `<span class="dpp-pick-lbl">سایز</span>
             <div class="dpp-pick-row">${(p.sizes || []).map((z) =>
               `<button class="dpp-chip" type="button" data-size="${esc(z)}">${esc(z)}</button>`
             ).join('')}</div>` : '') +

        `<p class="dpp-pick-warn" hidden>لطفاً سایز را انتخاب کنید.</p>
         <button class="dpp-pick-go" type="button" data-pick-done>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
             <path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/>
             <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/></svg>
           <span>افزودن به سبد</span>
         </button>`;

      cardEl.classList.add('is-pick');
      cardEl.appendChild(box);
    }

    /* بستن انتخابگر با کلیک بیرون یا کلید Escape */
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dpp-pick') && !e.target.closest('[data-add]')) closePick();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePick(); });
  }

  /** بخش را درست بالای ویترین فروشگاه‌ها می‌نشاند */
  function place(sec) {
    const anchor = document.querySelector(
      '#featured-sellers, #stores, #store-showcase, .stores-section, .stores-section-m'
    );
    if (anchor) anchor.before(sec);
    else document.querySelector('main')?.appendChild(sec);
  }

  /** بازخورد کوتاه روی دکمه */
  function flash(btn) {
    btn.classList.add('ok');
    setTimeout(() => btn.classList.remove('ok'), 1100);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', run, { once: true })
    : run();
})();
