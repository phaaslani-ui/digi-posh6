/* ============================================================
   دیجی‌پوش — صفحه‌ی فروشگاه (نمای مشتری)
   ------------------------------------------------------------
   نشانی صفحه: store.html?id=شناسه‌ی-فروشگاه
   محصولات واقعی همان فروشنده خوانده و نمایش داده می‌شوند.
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  /* ---------- ابزار ---------- */
  const $ = (s) => document.querySelector(s);
  const FA = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const EN = (s) => String(s).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const money = (n) => FA(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CAT_FA = {
    women: 'پوشاک زنانه', men: 'پوشاک مردانه',
    kids: 'پوشاک کودک',  teen: 'پوشاک نوجوان',
  };

  const SW = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const I = {
    check: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/></svg>`,
    pin:   `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/></svg>`,
    tag:   `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M3.5 12.5V5.5a2 2 0 0 1 2-2h7l8 8-9 9z"/><circle cx="8" cy="8" r="1.4"/></svg>`,
    cal:   `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/></svg>`,
  };

  /* ============================================================
     خواندن داده
     ============================================================ */
  async function loadStore(id) {
    if (REMOTE) {
      const base = CFG.supabaseUrl.replace(/\/$/, '');
      const h = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey };
      try {
        const [sRes, pRes] = await Promise.all([
          fetch(`${base}/rest/v1/seller_profiles?user_id=eq.${encodeURIComponent(id)}&select=*`, { headers: h }),
          fetch(`${base}/rest/v1/products?seller_id=eq.${encodeURIComponent(id)}&status=eq.active&select=*&order=created_at.desc`, { headers: h }),
        ]);
        const s = (await sRes.json())[0];
        if (!s) return null;
        const products = (await pRes.json()).map((r) => ({
          id: r.id, name: r.name, price: r.price, stock: r.stock,
          category: r.category, section: r.section || '', group: r.group || '',
          brand: r.brand || '', description: r.description || '',
          images: r.images || [], sizes: r.sizes || [], colors: r.colors || [],
          date: r.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(r.created_at)) : '',
        }));
        return {
          store: {
            id: s.user_id, storeName: s.store_name, category: s.category,
            city: s.city, address: s.address, description: s.description,
            isVerified: s.status === 'approved',
            logo: s.logo_url || '', cover: s.cover_url || '',
            joinDate: s.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(s.created_at)) : '',
          },
          products,
        };
      } catch { return null; }
    }

    // حالت محلی
    let users = [], products = [];
    try { users = (window.DPSafe ? DPSafe.sellers() : []); } catch {}
    try { products = (window.DPSafe ? DPSafe.products() : []); } catch {}

    const u = users.find((x) => x.id === id);
    if (!u) return null;

    // فروشگاه ردشده یا معلق برای مشتری باز نمی‌شود
    const st = u.status || (u.isVerified ? 'approved' : 'pending');
    if (st !== 'approved' && st !== 'pending') return null;

    return {
      store: { ...u, isVerified: st === 'approved' },
      products: products.filter((p) => p.sellerId === id && p.status === 'active'),
    };
  }

  /* ============================================================
     رسم سربرگ
     ============================================================ */
  function renderHero(s, count) {
    const letter = (s.storeName || '؟').trim()[0] || '؟';

    document.title = `${s.storeName} | دیجی‌پوش`;
    $('#crumbName').textContent = s.storeName;
    const av = $('#heroAvatar');
    if (s.logo) {
      av.innerHTML = `<img src="${esc(s.logo)}" alt="${esc(s.storeName)}" />`;
      av.classList.add('has-img');
    } else {
      av.textContent = letter;
      av.classList.remove('has-img');
    }

    // تصویر سربرگ فروشگاه
    const hero = $('#hero');
    if (s.cover) {
      hero.classList.add('has-cover');
      hero.style.setProperty('--cover', `url("${s.cover}")`);
    }
    $('#storeName').textContent = s.storeName;

    $('#storeDesc').textContent =
      s.description || 'این فروشگاه هنوز توضیحی برای خود ننوشته است.';

    const chip = $('#verifyChip');
    if (s.isVerified) {
      chip.className = 'chip chip--ok';
      chip.innerHTML = I.check + ' فروشنده تأییدشده';
    } else {
      chip.className = 'chip chip--wait';
      chip.innerHTML = I.clock + ' در انتظار تأیید';
    }

    const meta = [];
    if (s.city) meta.push(`<li>${I.pin} ${esc(s.city)}</li>`);
    if (s.category) meta.push(`<li>${I.tag} ${esc(CAT_FA[s.category] || s.category)}</li>`);
    if (s.joinDate) meta.push(`<li>${I.cal} عضو از ${esc(s.joinDate)}</li>`);
    $('#storeMeta').innerHTML = meta.join('');

    $('#statProducts').textContent = FA(count);
    $('#statCat').textContent = CAT_FA[s.category] || '—';
    $('#statSince').textContent = s.joinDate ? String(s.joinDate).split('/')[0] : '—';

    // امتیاز واقعی فروشگاه، از نظرهای مشتریان
    paintRating(s.id);

    $('#hero').hidden = false;
  }

  /** امتیاز فروشگاه را در سربرگ می‌نشاند */
  async function paintRating(storeId) {
    if (!window.DPReviews) return;
    const r = await DPReviews.summary('store', storeId);
    const box = $('#storeRating');
    if (!box) return;

    box.innerHTML = r.count
      ? `${DPReviews.stars(r.avg, 17)}<b>${FA(r.avg)}</b><small>(${FA(r.count)} نظر)</small>`
      : '<small class="no-rate">هنوز امتیازی ثبت نشده</small>';
  }

  /* ============================================================
     کارت محصول
     ============================================================ */
  function card(p, i) {
    const sale = window.DPPromo ? DPPromo.sales.priceOf(p) : { price: p.price, old: null, percent: 0 };
    const img = p.images && p.images[0];
    const out = Number(p.stock) === 0;
    const low = !out && Number(p.stock) <= 3;

    // سایزها به شکل تراشه، رنگ‌ها به شکل دایره
    const chips = (p.sizes || []).slice(0, 5)
      .map((c) => `<span class="pchip">${esc(c)}</span>`).join('');

    const C = window.DPColors;
    const cols = (p.colors || []).map((k) => C?.find(k)).filter(Boolean);
    const colorRow = cols.length
      ? `<div class="pcolors">${cols.slice(0, 6).map((c) => C.bubble(c.id, 15)).join('')}${
          cols.length > 6 ? `<span class="more">+${FA(cols.length - 6)}</span>` : ''}</div>`
      : '';

    return `
      <article class="pcard" data-p="${esc(p.id)}"
               style="animation-delay:${Math.min(i, 11) * 45}ms">
        <a class="pcard-go" href="./product.html?id=${encodeURIComponent(p.id)}"
           aria-label="دیدن صفحه‌ی ${esc(p.name)}"></a>
        <div class="pthumb">
          ${img
            ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" />`
            : `<span class="pthumb-letter">${esc((p.name || '؟').trim()[0])}</span>`}
          ${sale.percent ? `<span class="ptag ptag--off">${FA(sale.percent)}٪ تخفیف</span>` : ''}
          ${out ? '<span class="ptag ptag--out">ناموجود</span>' : ''}
          ${low && window.DPStock
            ? `<span class="ptag ptag--low">${DPStock.status(p.stock).short}</span>` : ''}
          <button class="pquick" type="button" data-quick
                  aria-label="نگاه سریع به ${esc(p.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/>
              <circle cx="12" cy="12" r="3"/></svg>
            <span>نگاه سریع</span>
          </button>
        </div>
        <div class="pbody">
          ${p.category ? `<span class="pcat">${esc(p.category)}</span>` : ''}
          <h3 class="pname"><a href="./product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
          ${p.description ? `<p class="pdesc">${esc(p.description)}</p>` : ''}
          ${chips ? `<div class="pchips">${chips}</div>` : ''}
          ${colorRow}
          <div class="prate" data-rate="${esc(p.id)}"></div>
          <div class="pfoot">
            <span class="pprice">${sale.percent
              ? `<s>${money(sale.old)}</s> ${money(sale.price)}`
              : money(p.price)}<small>تومان</small></span>
            <span class="pstock ${out ? 'pstock--out' : ''}">
              ${window.DPStock ? DPStock.status(p.stock).label
                : (out ? 'ناموجود' : 'موجود')}
            </span>
          </div>
        </div>
      </article>`;
  }

  /* ستاره‌ی کوچک روی هر کارت محصول
     ------------------------------------------------------------
     پیش‌تر برای هر کالا جداگانه `await` می‌زد و هر بار هم کل
     صفحه را با `querySelectorAll` می‌گشت. با ۵۰ کالا یعنی
     ۵۰ بار خواندن حافظه و ۵۰ بار پیمایش صفحه — کند و پرش‌دار.

     حالا:
       • جعبه‌ها یک بار در یک نقشه ریخته می‌شوند
       • امتیازها یک‌جا و موازی گرفته می‌شوند
       • نوشتن روی صفحه در یک فریم انجام می‌شود
     ------------------------------------------------------------ */
  async function paintProductRates(list) {
    if (!window.DPReviews || !list || !list.length) return;

    /* یک بار صفحه را می‌گردیم، نه به ازای هر کالا */
    const boxes = new Map();
    document.querySelectorAll('[data-rate]').forEach((el) => {
      boxes.set(String(el.dataset.rate), el);
    });
    if (!boxes.size) return;

    /* فقط کالاهایی که جعبه‌شان روی صفحه هست */
    const wanted = list.filter((p) => boxes.has(String(p.id)));
    if (!wanted.length) return;

    /* همه‌ی امتیازها با هم — نه یکی‌یکی */
    const results = await Promise.all(
      wanted.map((p) =>
        DPReviews.summary('product', p.id).catch(() => ({ count: 0, avg: null }))
      )
    );

    /* نوشتن در یک فریم تا چیدمان یک بار محاسبه شود */
    requestAnimationFrame(() => {
      wanted.forEach((p, i) => {
        const el = boxes.get(String(p.id));
        if (!el) return;
        const r = results[i];
        el.innerHTML = r && r.count
          ? `${DPReviews.stars(r.avg, 13)}<span>${FA(r.avg)}</span><small>(${FA(r.count)})</small>`
          : '<small class="no-rate">بدون امتیاز</small>';
      });
    });
  }

  /* ============================================================
     انتخاب سایز — حرفه‌ای
     ------------------------------------------------------------
     پیش‌تر فقط چند دکمه‌ی خالی بود. حالا:
       • هر سایز اندازه‌ی واقعی‌اش را نشان می‌دهد (دور سینه/کمر)
       • جدول اندازه‌ی کامل، بازشدنی
       • راهنمای «چطور اندازه بگیرم»
       • هشدار وقتی سایز انتخاب نشده
       • سایز ناموجود خط‌خورده و غیرفعال
     ============================================================ */

  /* اندازه‌های استاندارد ایرانی — سانتی‌متر */
  const SIZE_CHART = {
    XS:  { fa: 'خیلی کوچک', eu: '۳۴', chest: '۸۰–۸۴', waist: '۶۲–۶۶', hip: '۸۶–۹۰', height: '۱۵۰–۱۵۸' },
    S:   { fa: 'کوچک',      eu: '۳۶', chest: '۸۵–۸۹', waist: '۶۷–۷۱', hip: '۹۱–۹۵', height: '۱۵۵–۱۶۳' },
    M:   { fa: 'متوسط',     eu: '۳۸', chest: '۹۰–۹۴', waist: '۷۲–۷۶', hip: '۹۶–۱۰۰', height: '۱۶۰–۱۶۸' },
    L:   { fa: 'بزرگ',      eu: '۴۰', chest: '۹۵–۹۹', waist: '۷۷–۸۲', hip: '۱۰۱–۱۰۵', height: '۱۶۵–۱۷۳' },
    XL:  { fa: 'خیلی بزرگ', eu: '۴۲', chest: '۱۰۰–۱۰۶', waist: '۸۳–۸۹', hip: '۱۰۶–۱۱۲', height: '۱۷۰–۱۷۸' },
    XXL: { fa: 'دو ایکس',   eu: '۴۴', chest: '۱۰۷–۱۱۴', waist: '۹۰–۹۷', hip: '۱۱۳–۱۲۰', height: '۱۷۳–۱۸۲' },
  };

  const SZ_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  /** سایزها را به ترتیب درست مرتب می‌کند */
  function sortSizes(list) {
    return list.slice().sort((a, b) => {
      const ia = SZ_ORDER.indexOf(String(a).toUpperCase());
      const ib = SZ_ORDER.indexOf(String(b).toUpperCase());
      if (ia < 0 && ib < 0) return String(a).localeCompare(String(b), 'fa');
      if (ia < 0) return 1;
      if (ib < 0) return -1;
      return ia - ib;
    });
  }

  function sizeBlock(p) {
    const sizes = sortSizes(p.sizes || []);
    const known = sizes.filter((s) => SIZE_CHART[String(s).toUpperCase()]);

    /* دکمه‌های سایز — هر کدام با اندازه‌ی واقعی زیرش */
    const btns = sizes.map((s) => {
      const key = String(s).toUpperCase();
      const info = SIZE_CHART[key];
      return `
        <button class="sz-btn" type="button" data-size="${esc(s)}"
                aria-pressed="false"
                title="${info ? `${info.fa} — دور سینه ${info.chest} سانتی‌متر` : esc(s)}">
          <b>${esc(s)}</b>
          ${info ? `<em>${info.eu}</em>` : ''}
        </button>`;
    }).join('');

    /* جدول اندازه — فقط اگر سایزهای استاندارد باشند */
    const chart = known.length ? `
      <div class="sz-chart" id="szChart" hidden>
        <div class="sz-chart-scroll">
          <table class="sz-table">
            <thead>
              <tr>
                <th>سایز</th><th>معادل</th>
                <th>دور سینه</th><th>دور کمر</th><th>دور باسن</th><th>قد مناسب</th>
              </tr>
            </thead>
            <tbody>
              ${known.map((s) => {
                const k = String(s).toUpperCase();
                const i = SIZE_CHART[k];
                return `<tr data-row="${esc(s)}">
                  <td><b>${esc(s)}</b><small>${i.fa}</small></td>
                  <td>${i.eu}</td>
                  <td>${i.chest}</td>
                  <td>${i.waist}</td>
                  <td>${i.hip}</td>
                  <td>${i.height}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <p class="sz-unit">همه‌ی اندازه‌ها به سانتی‌متر است.</p>

        <div class="sz-how">
          <strong>چطور اندازه بگیرم؟</strong>
          <ol>
            <li><b>دور سینه:</b> متر را از پرترین قسمت سینه، موازی با زمین دور بدن بگذرانید.</li>
            <li><b>دور کمر:</b> باریک‌ترین جای کمر، معمولاً کمی بالای ناف.</li>
            <li><b>دور باسن:</b> پرترین قسمت باسن، پاها کنار هم.</li>
          </ol>
          <p>متر را نه شل بگیرید نه سفت — باید یک انگشت زیرش جا شود.
             اگر بین دو سایز بودید، سایز بزرگ‌تر را بگیرید.</p>
        </div>
      </div>` : '';

    return `
      <div class="m-sizes" id="mSizeBox">
        <div class="sz-head">
          <span class="sz-label">سایز
            <b id="mSizeName">انتخاب نشده</b>
          </span>
          ${known.length ? `
            <button class="sz-guide" type="button" id="szToggle" aria-expanded="false"
                    aria-controls="szChart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3.5 8.5h17v7h-17z"/><path d="M7 8.5v3M10.5 8.5v4.5M14 8.5v3M17.5 8.5v4.5"/>
              </svg>
              <span>جدول اندازه</span>
            </button>` : ''}
        </div>

        <div class="sz-pick" id="mSizes" role="group" aria-label="انتخاب سایز">
          ${btns}
        </div>

        <p class="sz-fit" id="szFit" hidden></p>
        ${chart}
      </div>`;
  }

  /* ============================================================
     مودال جزئیات
     ============================================================ */
  function openModal(p) {
    const imgs = p.images || [];
    const out = Number(p.stock) === 0;

    const rows = [];
    if (p.brand) rows.push(['برند', p.brand]);
    if (p.category) {
      const T2 = window.DPTaxonomy;
      const sec = p.section || T2?.findByItem(p.category)?.section;
      const grp = p.group || T2?.findByItem(p.category)?.group;
      rows.push(['دسته‌بندی', sec ? T2.trail(sec, grp, p.category) : p.category]);
    }


    /* عدد دقیق نه — فقط وضعیت */
    rows.push(['موجودی', window.DPStock
      ? DPStock.status(p.stock).label : (out ? 'ناموجود' : 'موجود')]);
    if (p.date) rows.push(['تاریخ ثبت', p.date]);

    $('#mBody').innerHTML = `
      <div class="m-grid">
        <div>
          <div class="m-img" id="mImg">
            ${imgs[0]
              ? `<img src="${esc(imgs[0])}" alt="${esc(p.name)}" />`
              : `<span class="pthumb-letter">${esc((p.name || '؟').trim()[0])}</span>`}
          </div>
          ${imgs.length > 1
            ? `<div class="m-thumbs">${imgs.map((s, i) =>
                `<img src="${esc(s)}" alt="" class="${i === 0 ? 'on' : ''}" data-src="${esc(s)}" />`).join('')}</div>`
            : ''}
        </div>

        <div>
          <h3 class="m-title">${esc(p.name)}</h3>
          ${p.category ? `<span class="m-cat">${esc(p.category)}</span>` : ''}
          ${p.description ? `<p class="m-desc">${esc(p.description)}</p>` : ''}

          ${rows.map(([k, v]) =>
            `<div class="m-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('')}

          ${(p.sizes || []).length ? sizeBlock(p) : ''}

          ${(() => {
            const C2 = window.DPColors;
            const cs = (p.colors || []).map((k) => C2?.find(k)).filter(Boolean);
            if (!cs.length) return '';
            return `<div class="m-colors">
              <span class="m-colors-t">رنگ‌های موجود
                <b id="mColorName">${esc(cs[0].name)}</b></span>
              <div class="dp-color-pick" id="mColors">
                ${cs.map((c, i) => `
                  <button class="dp-sw ${i === 0 ? 'on' : ''}" type="button"
                          data-cid="${esc(c.id)}" data-cname="${esc(c.name)}"
                          title="${esc(c.name)}" aria-label="${esc(c.name)}">
                    <i style="background:${C2.background(c)}"></i>
                  </button>`).join('')}
              </div>
            </div>`;
          })()}

          ${(() => {
            const s = window.DPPromo ? DPPromo.sales.priceOf(p) : { percent: 0 };
            if (!s.percent) return `
              <div class="m-price"><span>قیمت</span>
                <b>${money(p.price)} <small style="font-size:13px;font-weight:500">تومان</small></b>
              </div>`;
            return `
              <div class="m-price is-off">
                <span>${esc(s.title)} — ${FA(s.percent)}٪</span>
                <b><s>${money(s.old)}</s> ${money(s.price)}
                  <small style="font-size:13px;font-weight:500">تومان</small></b>
              </div>`;
          })()}

          ${out ? `
            <div class="m-note">این کالا در حال حاضر ناموجود است.</div>
          ` : `
            <div class="m-buy">
              <div class="qty" id="mQty">
                <button type="button" data-q="+" aria-label="افزودن">+</button>
                <span id="mQtyVal">۱</span>
                <button type="button" data-q="-" aria-label="کم کردن">−</button>
              </div>
              <button class="btn btn-gold m-add" type="button" id="mAdd">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:18px;height:18px"><path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/></svg>
                افزودن به سبد خرید
              </button>
            </div>
            ${(p.sizes || []).length ? `
              <p class="m-hint" id="mHint" role="alert" hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>
                </svg>
                نخست سایز خود را انتخاب کنید.
              </p>` : ''}
          `}
        </div>
      </div>

      <div class="m-reviews" data-reviews data-kind="product"
           data-target="${esc(p.id)}" data-seller="${esc(p.sellerId || '')}"
           data-title="نظرها درباره‌ی این محصول"></div>`;

    // تعویض تصویر با کلیک روی بندانگشتی‌ها
    const box = $('#mImg');
    $('#mBody').querySelectorAll('.m-thumbs img').forEach((t) => {
      t.addEventListener('click', () => {
        box.innerHTML = `<img src="${t.dataset.src}" alt="" />`;
        $('#mBody').querySelectorAll('.m-thumbs img').forEach((x) => x.classList.remove('on'));
        t.classList.add('on');
      });
    });

    // انتخاب رنگ در پنجره‌ی محصول
    const mc = $('#mColors');
    mc?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cname]');
      if (!b) return;
      mc.querySelectorAll('.dp-sw').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      $('#mColorName').textContent = b.dataset.cname;
    });

    /* ---------- سایز ---------- */
    let pickedSize = '';
    const sz = $('#mSizes');

    sz?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-size]');
      if (!b || b.disabled) return;

      sz.querySelectorAll('.sz-btn').forEach((x) => {
        x.classList.remove('on');
        x.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('on');
      b.setAttribute('aria-pressed', 'true');
      pickedSize = b.dataset.size;

      const key = String(pickedSize).toUpperCase();
      const info = SIZE_CHART[key];

      /* نام سایز به فارسی، کنار حرف انگلیسی */
      $('#mSizeName').textContent = info
        ? `${pickedSize} — ${info.fa}`
        : pickedSize;

      /* توضیح اندازه‌ی همان سایز، زیر دکمه‌ها */
      const fit = $('#szFit');
      if (fit) {
        if (info) {
          fit.hidden = false;
          /* هر اندازه یک ردیف مستقل — دیگر متن نمی‌پیچد
             و از کادر بیرون نمی‌زند */
          fit.innerHTML =
            `<div class="sz-fit-head">` +
              `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ` +
              `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
              `<path d="m5 12.5 4.5 4.5L19 7.5"/></svg>` +
              `<span>اندازه‌های سایز ${esc(pickedSize)} (${esc(info.fa)})</span>` +
            `</div>` +
            `<div class="sz-fit-grid">` +
              `<span class="sz-fit-item"><i>دور سینه</i><b>${info.chest}</b></span>` +
              `<span class="sz-fit-item"><i>دور کمر</i><b>${info.waist}</b></span>` +
              `<span class="sz-fit-item"><i>دور باسن</i><b>${info.hip}</b></span>` +
              `<span class="sz-fit-item"><i>قد مناسب</i><b>${info.height}</b></span>` +
            `</div>`;
        } else {
          fit.hidden = true;
        }
      }

      /* ردیف همان سایز در جدول پررنگ می‌شود */
      const chart = $('#szChart');
      if (chart) {
        chart.querySelectorAll('[data-row]').forEach((r) => {
          r.classList.toggle('on', r.dataset.row === pickedSize);
        });
      }

      const h = $('#mHint');
      if (h) { h.hidden = true; h.classList.remove('bad'); }
      $('#mSizeBox')?.classList.remove('is-missing');
    });

    /* باز و بسته کردن جدول اندازه */
    $('#szToggle')?.addEventListener('click', () => {
      const chart = $('#szChart');
      const btn = $('#szToggle');
      if (!chart) return;
      const open = chart.hidden;
      chart.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('on', open);
      if (open && chart.scrollIntoView) {
        chart.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    /* ---------- تعداد ---------- */
    let qty = 1;
    const maxQ = Number(p.stock) || 1;
    $('#mQty')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      qty = b.dataset.q === '+' ? Math.min(maxQ, qty + 1) : Math.max(1, qty - 1);
      $('#mQtyVal').textContent = FA(qty);
    });

    /* ---------- افزودن به سبد ---------- */
    $('#mAdd')?.addEventListener('click', () => {
      if ((p.sizes || []).length && !pickedSize) {
        const h = $('#mHint');
        if (h) { h.hidden = false; h.classList.add('bad'); }
        /* جعبه‌ی سایز می‌لرزد تا چشم برود سمتش */
        const box = $('#mSizeBox');
        if (box) {
          box.classList.remove('is-missing');
          void box.offsetWidth;              /* راه‌اندازی دوباره‌ی انیمیشن */
          box.classList.add('is-missing');
          if (box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const pickedColor = $('#mColors .dp-sw.on')?.dataset.cid || (p.colors || [])[0] || '';

      try {
        DPCart.add(p.id, { color: pickedColor, size: pickedSize, qty });
        window.dpToast
          ? dpToast(`${p.name} به سبد اضافه شد.`)
          : alert('به سبد اضافه شد');
        closeModal();
      } catch (err) {
        const h = $('#mHint');
        if (h) { h.hidden = false; h.textContent = err.message; h.classList.add('bad'); }
        else alert(err.message);
      }
    });

    // بخش نظر داخل پنجره ساخته می‌شود
    window.dpReviewsInit?.($('#mBody'));

    const m = $('#pModal');
    m.hidden = false;
    requestAnimationFrame(() => m.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const m = $('#pModal');
    m.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { m.hidden = true; }, 280);
  }

  /* ============================================================
     اجرا
     ============================================================ */
  async function run() {
    const id = new URLSearchParams(location.search).get('id');

    const data = id ? await loadStore(id) : null;
    if (!data) { $('#notFound').hidden = false; return; }

    const { store: s, products } = data;

    /* ============================================================
       تم بخشی
       ------------------------------------------------------------
       فروشگاه حال‌وهوای بخشی را می‌گیرد که مشتری از آن آمده.
       اگر مستقیم وارد شده باشد، پرکالاترین بخش فروشگاه.
       ============================================================ */
    if (window.DPTheme) {
      const pick = DPTheme.resolve({
        sellerId: s.id,
        products,
        category: s.category,
      });

      const lock = DPTheme.readLock(s.id);
      DPTheme.apply(pick.section, { custom: lock && lock.custom });

      /* لایه‌ی تزئینی */
      let amb = document.getElementById('stAmbient');
      if (!amb) {
        amb = document.createElement('div');
        amb.className = 'st-ambient';
        amb.id = 'stAmbient';
        document.body.prepend(amb);
      }
      DPTheme.paintAmbient(amb, pick.section, lock && lock.custom);

      /* نشان تم، کنار نام فروشگاه */
      const t = DPTheme.THEMES[pick.section];
      const chip = document.getElementById('stBadge');
      const myName = lock && lock.custom && lock.custom.name;
      if (chip && t) {
        chip.hidden = false;
        chip.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4' +
          'L4.5 12l2.4-2.9-.3-3.4L10 6z"/></svg>' +
          /* نام دلخواه فروشنده بدون پیشوند می‌آید — «ویترین
             ویترین پاییزی» تکرار زشتی بود */
          (myName
            ? '<b>' + esc(myName) + '</b>'
            : 'ویترین <b>' + esc(t.label) + '</b> · ' + esc(t.mood));
      }

      /* در تم نوجوان، نام فروشگاه لرزش دیجیتال می‌گیرد */
      const nameEl = document.getElementById('storeName');
      if (nameEl) nameEl.classList.toggle('st-glitch', pick.section === 'teen');

      /* سربرگ و کارت‌ها قاب متحرک می‌گیرند */
      document.getElementById('hero')?.classList.add('st-frame');
    }

    renderHero(s, products.length);
    $('#productsSection').hidden = false;

    // بخش نظرهای فروشگاه
    const rvBox = $('#storeReviews');
    if (rvBox) {
      rvBox.dataset.target = s.id;
      rvBox.dataset.seller = s.id;
      $('#reviewsSection').hidden = false;
      window.dpBuildReviews?.(rvBox);
    }

    // با هر نظر تازه، امتیازها دوباره حساب می‌شوند
    document.addEventListener('dp:review', (e) => {
      if (e.detail?.kind === 'store') paintRating(s.id);
      else draw();
    });

    /* ---------- فیلتر بخش (زنانه / مردانه / …) ---------- */
    const T = window.DPTaxonomy;
    const secOf = (p) => p.section || T?.findByItem(p.category)?.section || '';

    const secs = [...new Set(products.map(secOf).filter(Boolean))];
    const secSel = $('#secFilter');

    if (secs.length > 1) {
      secSel.insertAdjacentHTML('beforeend',
        secs.map((s) => `<option value="${esc(s)}">${esc(T.sectionLabel(s))}</option>`).join(''));
      secSel.hidden = false;
    }

    // پر کردن فیلتر دسته‌ها
    function fillCats(section) {
      const rel = section ? products.filter((p) => secOf(p) === section) : products;
      const cats = [...new Set(rel.map((p) => p.category).filter(Boolean))];
      $('#catFilter').innerHTML = '<option value="">همه‌ی دسته‌ها</option>' +
        cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    }
    fillCats('');

    const grid = $('#grid');
    const line = $('#resultLine');
    const none = $('#noProducts');

    function draw() {
      const q = EN($('#q').value).trim().toLowerCase();
      const cat = $('#catFilter').value;
      const sort = $('#sortBy').value;

      const sec = $('#secFilter').value;
      let list = products.slice();
      if (sec) list = list.filter((p) => secOf(p) === sec);
      if (cat) list = list.filter((p) => p.category === cat);
      if (q) list = list.filter((p) =>
        EN(`${p.name} ${p.category} ${p.brand} ${p.description}`).toLowerCase().includes(q));

      if (sort === 'cheap') list.sort((a, b) => a.price - b.price);
      else if (sort === 'exp') list.sort((a, b) => b.price - a.price);
      else if (sort === 'name') list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'fa'));

      grid.innerHTML = list.map(card).join('');
      paintProductRates(list);

      const empty = !list.length;
      none.hidden = !empty;
      grid.hidden = empty;
      line.textContent = empty ? '' : `${FA(list.length)} محصول`;

      if (empty && products.length) {
        $('#noProdTitle').textContent = 'محصولی با این جست‌وجو پیدا نشد';
        $('#noProdText').textContent = 'عبارت دیگری را امتحان کنید یا فیلترها را بردارید.';
      }
    }

    // جست‌وجوی با تأخیر تا موقع تایپ کند نشود
    let t;
    $('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 260); });
    $('#catFilter').addEventListener('change', draw);
    secSel.addEventListener('change', () => {
      fillCats(secSel.value);
      draw();
    });
    $('#sortBy').addEventListener('change', draw);

    /* ---------- رفتن به صفحه‌ی کالا ----------
       هر کالا حالا صفحه‌ی اختصاصی خودش را دارد، پس کارت
       یک لینک واقعی است نه یک دکمه‌ی مودال. سود این کار:

         • با کلیک وسط موشواره در تب تازه باز می‌شود
         • راست‌کلیک «کپی نشانی» کار می‌کند
         • موتور جست‌وجو کالاها را می‌بیند
         • کلید Enter بدون کد اضافه کار می‌کند

       مودال قدیمی حذف نشد؛ برای دکمه‌ی «نگاه سریع» می‌ماند. */
    grid.addEventListener('click', (e) => {
      const quick = e.target.closest('[data-quick]');
      if (!quick) return;
      e.preventDefault();
      e.stopPropagation();
      const c = quick.closest('.pcard');
      if (c) openModal(products.find((p) => String(p.id) === c.dataset.p));
    });

    $('#mClose').addEventListener('click', closeModal);
    $('#pModal').addEventListener('click', (e) => {
      if (e.target.id === 'pModal') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#pModal').hidden) closeModal();
    });

    draw();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', run, { once: true })
    : run();
})();
