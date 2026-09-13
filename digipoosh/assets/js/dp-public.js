/* ============================================================
   دیجی‌پوش — نمایش فروشگاه‌های واقعی در صفحات عمومی سایت
   ------------------------------------------------------------
   هر فروشنده‌ای که واقعاً ثبت‌نام کرده و فروشگاه ساخته باشد،
   کارتش به‌صورت خودکار بالای بخش «فروشندگان» اضافه می‌شود.
   نمونه‌های نمایشی دست‌نخورده سر جایشان می‌مانند.
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  const FA = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** نشانی صفحه‌ی فروشگاه — نسبت به محل صفحه‌ی فعلی */
  const UP = document.body.dataset.dpPage === 'home' ? './' : '../';
  /* نشانی فروشگاه، به‌همراه بخشی که مشتری از آن می‌آید.
     صفحه‌ی فروشگاه با همین پارامتر تم درست را انتخاب می‌کند —
     مشتریِ آمده از بخش نوجوان، ویترین نئونی می‌بیند. */
  const FROM = { woman: 'women', man: 'men', kids: 'kids', teen: 'teen' }[
    document.body.dataset.dpPage] || '';

  const storeUrl = (id) =>
    `${UP}store.html?id=${encodeURIComponent(id)}` + (FROM ? `&from=${FROM}` : '');

  const CAT_FA = {
    women: 'پوشاک زنانه',
    men:   'پوشاک مردانه',
    kids:  'پوشاک کودک',
    teen:  'پوشاک نوجوان',
  };

  /* ---------- خواندن فروشگاه‌های واقعی ---------- */
  async function getStores() {
    if (REMOTE) {
      try {
        const res = await fetch(
          CFG.supabaseUrl.replace(/\/$/, '') +
          '/rest/v1/seller_profiles?select=*&status=in.(approved,pending)&order=created_at.desc',
          { headers: { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey } }
        );
        if (!res.ok) return [];
        return (await res.json()).map((p) => ({
          id: p.user_id,
          storeName: p.store_name,
          category: p.category,
          city: p.city,
          description: p.description,
          isVerified: p.status === 'approved',
          logo: p.logo_url || '',
          cover: p.cover_url || '',
          sections: p.sections || (p.category ? [p.category] : []),
          perSection: {},
          productCount: p.product_count || 0,
        }));
      } catch { return []; }
    }

    // حالت محلی — از حافظه‌ی همین مرورگر
    let users = [], products = [];
    try { users = (window.DPSafe ? DPSafe.sellers() : []); } catch {}
    try { products = (window.DPSafe ? DPSafe.products() : []); } catch {}

    return users
      // فروشگاه‌های ردشده یا معلق در سایت دیده نمی‌شوند
      .filter((u) => u.storeName && u.storeName.trim())
      .filter((u) => {
        const st = u.status || (u.isVerified ? 'approved' : 'pending');
        return st === 'approved' || st === 'pending';
      })
      .map((u) => {
        const mine = products.filter((p) => p.sellerId === u.id && p.status === 'active');

        // هر بخشی که فروشگاه در آن کالای فعال دارد
        const sections = [...new Set(
          mine.map((p) => p.section || window.DPTaxonomy?.findByItem(p.category)?.section)
              .filter(Boolean)
        )];

        // شمار کالا در هر بخش
        const perSection = {};
        for (const p of mine) {
          const s = p.section || window.DPTaxonomy?.findByItem(p.category)?.section;
          if (s) perSection[s] = (perSection[s] || 0) + 1;
        }

        return {
          id: u.id,
          storeName: u.storeName,
          category: u.category,
          sections,
          perSection,
          city: u.city,
          description: u.description,
          isVerified: (u.status || (u.isVerified ? 'approved' : 'pending')) === 'approved',
          logo: u.logo || '',
          cover: u.cover || '',
          productCount: mine.length,
        };
      })
      .reverse();   // تازه‌ترین فروشگاه اول
  }

  /** امتیاز واقعی هر فروشگاه از روی نظرها */
  function ratings() {
    return window.DPReviews ? DPReviews.storeRatingsMap() : {};
  }

  /** ستاره‌ها + عدد، یا پیام «تازه» */
  function rateChip(id, R, size) {
    const r = R[id];
    if (!r) return null;
    return `${DPReviews.stars(r.avg, size)}<span class="dp-rate-num">${FA(r.avg)}</span>` +
           `<small class="dp-rate-c">(${FA(r.count)})</small>`;
  }

  /* ---------- آیکون‌ها ---------- */
  const SW = 'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const I = {
    check: `<svg class="ico ico-sm ico-mini ico-check" viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
    box:   `<svg class="ico ico-sm ico-mini" viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/></svg>`,
    pin:   `<svg class="ico ico-sm ico-mini" viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/></svg>`,
    store: `<svg class="ico ico-sm ico-mini" viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/></svg>`,
  };

  /* ============================================================
     قالب کارت برای صفحه‌ی اصلی
     ============================================================ */
  function homeCard(s) {
    return `
      <article class="seller-card seller-card--real ${
        (window.DPBoost && DPBoost.isFeatured(s.id)) ? 'store-card--boost' : ''} reveal is-visible">
        ${boostTag(s)}
        <div class="seller-card__cover ${s.cover ? '' : 'seller-card__cover--blank'}">
          ${s.cover
            ? `<img src="${esc(s.cover)}" alt="${esc(s.storeName)}" loading="lazy" />`
            : `<span class="seller-card__mono">${esc(String(s.storeName || '؟').trim()[0] || '؟')}</span>`}
          <em class="seller-card__new">فروشگاه جدید</em>
        </div>
        <div class="seller-card__body">
          <div class="seller-card__top">
            <div class="seller-avatar">${s.logo
              ? `<img src="${esc(s.logo)}" alt="" loading="lazy" />`
              : esc(String(s.storeName || '؟').trim()[0] || '؟')}</div>
            <div>
              <h3>${esc(s.storeName)}</h3>
              <span>${esc(CAT_FA[s.category] || s.category || 'فروشگاه')}</span>
            </div>
            ${s.isVerified
              ? '<em class="seller-badge">تأیید شده</em>'
              : '<em class="seller-badge seller-badge--pending">در انتظار تأیید</em>'}
          </div>
          <div class="seller-card__meta">
            <div class="seller-rate ${s.rate ? 'seller-rate--has' : 'seller-rate--new'}">${
              s.rate || (I.store + ' فروشگاه تازه')}</div>
            <span class="seller-count">${FA(s.shown ?? s.productCount)} محصول</span>
          </div>
          <a href="${storeUrl(s.id)}" class="seller-card__link">مشاهده فروشگاه</a>
        </div>
      </article>`;
  }

  /* ============================================================
     نردبان — کارت فروشگاه‌های برجسته
     ------------------------------------------------------------
     فروشگاهی که بسته‌ی «برجسته» یا بالاتر خریده، قاب طلایی
     و نشان «ویژه» می‌گیرد.
     ============================================================ */
  /*
   * هر بسته نشان و قاب مخصوص خودش را دارد.
   * پیش‌تر همه یک قاب یکسان می‌گرفتند و «برجسته» از
   * «صدرنشین» قابل تشخیص نبود.
   */
  const boostCls = (s) => {
    if (!window.DPBoost) return '';
    const b = DPBoost.badgeOf(s.id);
    if (!b) return '';
    const base = s.__m ? 'store-card-m--boost' : 'store-card--boost';
    return base + ' dp-b-' + b.kind;   /* dp-b-featured / dp-b-home / … */
  };

  /* آیکون هر نوع نشان — هرکدام شکل خودش را دارد */
  const BADGE_ICON = {
    featured:  '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    home:      '<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20z"/>',
    premium:   '<path d="M4 17.5 6 7l4.5 4.5L12 5l1.5 6.5L18 7l2 10.5z"/>',
    spotlight: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.4"/>',
  };

  const boostTag = (s) => {
    if (!window.DPBoost) return '';
    const b = DPBoost.badgeOf(s.id);
    if (!b) return '';
    const ic = BADGE_ICON[b.kind] || BADGE_ICON.featured;
    return `<span class="dp-boost-tag dp-b-${b.kind}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic}</svg>${b.fa}</span>`;
  };

  /* ============================================================
     قالب کارت برای صفحات زنانه / بچگانه (کلاس store-card)
     ============================================================ */
  function pageCard(s, opts) {
    const L = String(s.storeName || '؟').trim()[0] || '؟';
    return `
      <article class="store-card store-card--real ${opts.border} ${boostCls(s)} reveal is-visible">
        ${boostTag(s)}
        <div class="store-avatar ${s.logo ? '' : 'dp-avatar-letter'}">
          ${s.logo ? `<img src="${esc(s.logo)}" alt="" loading="lazy" />` : `<span>${esc(L)}</span>`}
          ${s.isVerified ? `<span class="verified" title="فروشنده تأییدشده">${I.check}</span>` : ''}
        </div>
        <h3 class="store-name">${esc(s.storeName)}</h3>
        <span class="store-cat">${esc(CAT_FA[s.category] || 'فروشگاه')}</span>
        <p class="store-desc">${esc(s.description || 'فروشگاه تازه‌تأسیس در دیجی‌پوش')}</p>
        ${s.rate ? `<div class="dp-rate-row">${s.rate}</div>` : ''}
        <div class="store-meta">
          <span>${I.box} ${FA(s.shown ?? s.productCount)} محصول</span>
          ${s.city ? `<span>${I.pin} ${esc(s.city)}</span>` : ''}
        </div>
        <span class="dp-new-tag">فروشگاه جدید</span>
        <a class="btn-store" href="${storeUrl(s.id)}">مشاهده فروشگاه</a>
      </article>`;
  }

  /* ============================================================
     قالب کارت برای صفحه‌ی مردانه (کلاس store-card-m)
     ============================================================ */
  function manCard(s) {
    s.__m = true;
    const L = String(s.storeName || '؟').trim()[0] || '؟';
    return `
      <article class="store-card-m store-card--real ${boostCls(s)}">
        ${boostTag(s)}
        <div class="store-avatar-m ${s.logo ? '' : 'dp-avatar-letter'}">${s.logo
          ? `<img src="${esc(s.logo)}" alt="" loading="lazy" />` : `<span>${esc(L)}</span>`}
          ${s.isVerified ? `<span class="verified-m" title="فروشنده تأییدشده">${I.check}</span>` : ''}
        </div>
        <h3 class="store-name-m">${esc(s.storeName)}</h3>
        <span class="store-cat-m">${esc(CAT_FA[s.category] || 'فروشگاه')}</span>
        <p class="store-desc-m">${esc(s.description || 'فروشگاه تازه‌تأسیس در دیجی‌پوش')}</p>
        ${s.rate ? `<div class="dp-rate-row">${s.rate}</div>` : ''}
        <div class="store-meta-m">
          <span>${I.box} ${FA(s.shown ?? s.productCount)} محصول</span>
          ${s.city ? `<span>${I.pin} ${esc(s.city)}</span>` : ''}
        </div>
        <span class="dp-new-tag">فروشگاه جدید</span>
        <a class="btn-store-m" href="${storeUrl(s.id)}">مشاهده فروشگاه</a>
      </article>`;
  }

  /* ============================================================
     قالب کارت برای صفحه‌ی تینیجر
     ============================================================ */
  function teenCard(s) {
    return `
      <article class="store-card store-card--real gold-neon-border ${boostCls(s)}">
        ${boostTag(s)}
        <div class="store-head">
          <span class="hex-icon small n1">${I.store}</span>
          <span class="store-rank">تازه‌وارد</span>
        </div>
        <h3 class="store-name">${esc(s.storeName)}</h3>
        <span class="store-cat">${esc(CAT_FA[s.category] || 'فروشگاه')}</span>
        <p class="store-desc">${esc(s.description || 'فروشگاه تازه‌تأسیس در دیجی‌پوش')}</p>
        ${s.rate ? `<div class="dp-rate-row">${s.rate}</div>` : ''}
        <span class="store-count">${I.box} ${FA(s.shown ?? s.productCount)} محصول</span>
        <span class="dp-new-tag">فروشگاه جدید</span>
        <a class="btn-arena" href="${storeUrl(s.id)}">ورود به فروشگاه</a>
      </article>`;
  }

  /* ============================================================
     اجرا
     ============================================================ */
  async function run() {
    const stores = await getStores();
    if (!stores.length) return;

    const page = document.body.dataset.dpPage || 'home';

    const MAP = {
      home:  { grid: '.sellers-grid',   card: homeCard },
      woman: { grid: '#stores .grid-4', card: (s) => pageCard(s, { border: 'gbox' }), filter: 'women' },
      man:   { grid: '.stores-grid-m',  card: manCard,  filter: 'men' },
      kids:  { grid: '.stores-grid',    card: (s) => pageCard(s, { border: 'gold-rainbow-border' }), filter: 'kids' },
      teen:  { grid: '.stores-grid',    card: teenCard, filter: 'teen' },
    };

    const cfg = MAP[page];
    if (!cfg) return;

    const grid = document.querySelector(cfg.grid);
    if (!grid) return;

    /* فروشگاه در صفحه‌ای دیده می‌شود که در آن کالای فعال داشته باشد.
       اگر هنوز کالایی نگذاشته، به دسته‌ی ثبت‌نامش (اگر بود) نگاه می‌کنیم. */
    let list = cfg.filter
      ? stores.filter((s) =>
          (s.sections && s.sections.includes(cfg.filter)) ||
          (!s.productCount && s.category === cfg.filter))
      : stores;

    /* ---------- نردبان ----------
       فقط بسته‌هایی که `crossPage` دارند (فوق‌ویژه و صدرنشین)
       در بخشی که کالا ندارند هم دیده می‌شوند.

       پیش‌تر اینجا `onHome` بررسی می‌شد؛ یعنی بسته‌ی «فقط
       ویترین صفحه‌ی اصلی» در همه‌ی صفحه‌های دسته هم ظاهر
       می‌شد — درست برخلاف چیزی که به فروشنده فروخته بودیم. */
    if (window.DPBoost && cfg.filter) {
      stores.forEach((s) => {
        if (DPBoost.onEveryPage(s.id) && list.indexOf(s) < 0) list.push(s);
      });
    }

    if (!list.length) return;

    /* برجسته‌ها بالای فهرست می‌نشینند */
    if (window.DPBoost) list = DPBoost.sortStores(list);

    // امتیاز واقعی هر فروشگاه
    const R = ratings();
    const size = page === 'home' ? 15 : 14;
    list.forEach((s) => {
      s.rate = rateChip(s.id, R, size);
      // در صفحه‌ی دسته، تعداد کالای همان بخش نشان داده می‌شود
      s.shown = cfg.filter ? (s.perSection?.[cfg.filter] ?? 0) : s.productCount;
    });

    // پیام «هنوز فروشگاهی نیست» دیگر لازم نیست
    grid.querySelector('.dp-empty-stores')?.remove();

    // کارت‌های واقعی را اول می‌گذاریم
    grid.insertAdjacentHTML('afterbegin', list.map(cfg.card).join(''));

    /* ============================================================
       ویترین صفحه‌ی اصلی
       ------------------------------------------------------------
       بسته‌ی «ویترین اصلی» تا حالا هیچ اثر دیدنی نداشت، چون
       صفحه‌ی نخست همه‌ی فروشگاه‌ها را نشان می‌داد. حالا
       دارندگانش یک ردیف جدا و بالاتر می‌گیرند — همان چیزی که
       بابتش پول داده‌اند.
       ============================================================ */
    if (page === 'home' && window.DPBoost) {
      const row = document.getElementById('dpShowcaseRow');
      const box = document.getElementById('dpShowcaseGrid');
      if (row && box) {
        const picked = list.filter((s) => DPBoost.onHome(s.id));
        if (picked.length) {
          picked.forEach((s) => { s.rate = rateChip(s.id, R, 15); s.shown = s.productCount; });
          box.innerHTML = picked.map(cfg.card).join('');
          row.hidden = false;
        } else {
          row.hidden = true;
        }
      }
    }

    // شمارنده‌ی «فروشگاه فعال» در آمار صفحه‌ی اصلی
    document.querySelectorAll('[data-dp-store-count]').forEach((el) => {
      el.textContent = FA(stores.length);
    });

    /* آمار برای فروشندگانی که نردبان خریده‌اند */
    if (window.DPBoost) {
      list.forEach((s) => { if (DPBoost.isFeatured(s.id)) DPBoost.countView(s.id); });

      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.store-card--real');
        if (!card) return;
        const href = card.querySelector('a[href*="store.html"]')?.getAttribute('href') || '';
        const m = href.match(/id=([^&]+)/);
        if (m) DPBoost.countClick(decodeURIComponent(m[1]));
      });
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', run, { once: true })
    : run();
})();
