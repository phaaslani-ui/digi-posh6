/**
 * 🛍️ dp-products-feed.js v2.0 — محصولات واقعی فروشندگان
 * ------------------------------------------------------------------
 * • فقط محصولات واقعی از dp-products.js (DPProducts.all)
 * • بدون محصول نمونه/الکی
 * • hover 3D tilt + Quick view + افزودن به سبد
 * • پشتیبانی از track ماموریت
 */

(function() {
  'use strict';
  if (window.DPProductsFeedLoaded) return;
  window.DPProductsFeedLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ ابزارها
  // ═══════════════════════════════════════════════════════════════

  function toFa(n) {
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function formatPrice(n) {
    return Number(n || 0).toLocaleString('fa-IR');
  }

  // آیکن پیش‌فرض بر اساس دسته
  const CATEGORY_ICONS = {
    'پیراهن': '👗',
    'کت': '🧥',
    'شلوار': '👖',
    'کفش': '👠',
    'اکسسوری': '👜',
    'تی‌شرت': '👕',
    'مانتو': '🧥',
    'لباس': '👗',
    'پالتو': '🧥',
    'دامن': '👗',
    'ساعت': '⌚',
    'کیف': '👜',
    'شال': '🧣',
    'روسری': '🧣',
    'کمربند': '🪢',
  };

  function getCategoryIcon(cat) {
    if (!cat) return '🛍️';
    return CATEGORY_ICONS[cat] || CATEGORY_ICONS[cat.replace(/[\u200c]/g, '').trim()] || '🛍️';
  }

  // رنگ‌بندی badge
  const BADGE_COLORS = {
    'پرفروش': { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', fg: '#fff' },
    'جدید': { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fg: '#fff' },
    'تخفیف': { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', fg: '#fff' },
    'ویژه': { bg: 'linear-gradient(135deg, #d4af37, #a8862b)', fg: '#1a1a1a' },
    'محبوب': { bg: 'linear-gradient(135deg, #ec4899, #be185d)', fg: '#fff' },
    'فروشنده': { bg: 'linear-gradient(135deg, #10b981, #059669)', fg: '#fff' },
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔄 بارگذاری محصولات واقعی
  // ═══════════════════════════════════════════════════════════════

  function getRealProducts() {
    // فقط محصولات واقعی فروشندگان
    if (window.DPProducts && window.DPProducts.all) {
      return window.DPProducts.all();
    }
    return [];
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 تبدیل محصول به فرمت نمایش
  // ═══════════════════════════════════════════════════════════════

  function normalizeProduct(p) {
    // محصول واقعی از dp-products.js
    const colors = p.colors || [];
    const colorFa = colors[0] || '';
    const rating = p.rating || (p.reviews > 0 ? 4.5 : 0);
    const reviews = p.reviews || 0;
    const isSeller = p.isSellerProduct === true;

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.originalPrice || p.oldPrice,
      discount: p.discount || 0,
      color: colorFa,
      colors: colors,
      category: p.subcategory || p.category || 'عمومی',
      mainCategory: p.category,
      gender: p.gender,
      icon: getCategoryIcon(p.subcategory || p.category),
      image: p.image,
      rating: rating,
      reviews: reviews,
      seller: p.seller || p.brand || 'فروشنده',
      inStock: p.inStock !== false,
      badge: p.badge || (isSeller ? 'فروشنده' : null),
      isSellerProduct: isSeller,
      sold: p.sold || 0,
      description: p.description || '',
      tags: p.tags || [],
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 CSS
  // ═══════════════════════════════════════════════════════════════

  const style = document.createElement('style');
  style.textContent = `
    .dp-prod-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }
    .dp-prod {
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border-soft, #eee);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      transform-style: preserve-3d;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
    }
    .dp-prod:hover {
      border-color: var(--gold, #d4af37);
      transform: translateY(-6px);
      box-shadow: 0 16px 32px rgba(212, 175, 55, 0.18);
    }
    .dp-prod.is-seller-product {
      border-color: rgba(16, 185, 129, 0.2);
    }
    .dp-prod-img {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
      position: relative;
      overflow: hidden;
    }
    .dp-prod-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .dp-prod-img::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.4));
      opacity: 0;
      transition: opacity 0.3s;
    }
    .dp-prod:hover .dp-prod-img::before { opacity: 1; }
    .dp-prod-badge {
      position: absolute;
      top: 8px; right: 8px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      z-index: 2;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .dp-prod-fav {
      position: absolute;
      bottom: 8px; left: 8px;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.3s;
      z-index: 2;
    }
    .dp-prod:hover .dp-prod-fav {
      opacity: 1;
      transform: scale(1);
    }
    .dp-prod-fav.is-fav { background: #ef4444; color: #fff; opacity: 1; transform: scale(1); }
    .dp-prod-info { padding: 10px 12px 12px; }
    .dp-prod-name {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text, #1a1a1a);
      margin: 0 0 4px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 35px;
    }
    .dp-prod-seller {
      font-size: 10px;
      color: var(--text-soft, #666);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .dp-prod-price {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .dp-prod-price strong {
      font-size: 14px;
      font-weight: 800;
      color: var(--gold-dark, #a8862b);
    }
    .dp-prod-price del {
      font-size: 11px;
      color: var(--text-soft, #999);
    }
    .dp-prod-discount {
      background: #ef4444;
      color: #fff;
      padding: 1px 6px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
    }
    .dp-prod-rating {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 10.5px;
      color: var(--text-soft, #666);
      margin-top: 4px;
    }
    .dp-prod-rating .stars { color: #f59e0b; }

    /* Quick view modal */
    .dp-quick-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .dp-quick-modal.is-on { display: flex; animation: dpqm-fade 0.3s; }
    @keyframes dpqm-fade { from { opacity: 0; } to { opacity: 1; } }
    .dp-quick-content {
      background: #fff;
      border-radius: 24px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: dpqm-zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes dpqm-zoom { from { transform: scale(0.8); } to { transform: scale(1); } }
    .dp-quick-img {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 140px;
      border-radius: 24px 24px 0 0;
      position: relative;
    }
    .dp-quick-body { padding: 20px 24px 24px; }
    .dp-quick-name { font-size: 18px; font-weight: 800; margin: 0 0 8px; }
    .dp-quick-meta { display: flex; gap: 12px; font-size: 11px; color: #666; margin-bottom: 12px; flex-wrap: wrap; }
    .dp-quick-meta span { display: flex; align-items: center; gap: 4px; }
    .dp-quick-price { font-size: 24px; font-weight: 800; color: var(--gold-dark, #a8862b); margin-bottom: 12px; }
    .dp-quick-actions { display: flex; gap: 8px; margin-top: 16px; }
    .dp-quick-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }
    .dp-quick-btn-primary {
      background: linear-gradient(135deg, var(--gold, #d4af37), var(--gold-light, #f0c850));
      color: #1a1a1a;
    }
    .dp-quick-btn-ghost {
      background: transparent;
      border: 1.5px solid var(--border-soft, #eee);
      color: var(--text, #1a1a1a);
    }
    .dp-quick-close {
      position: absolute;
      top: 12px; left: 12px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    /* افکت پرواز به سبد */
    .dp-fly {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      font-size: 50px;
      transition: all 0.8s cubic-bezier(0.5, -0.5, 0.5, 1.5);
    }

    /* empty state */
    .dp-prod-empty {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(212, 175, 55, 0.01));
      border: 2px dashed rgba(212, 175, 55, 0.3);
      border-radius: 20px;
    }
    .dp-prod-empty-icon {
      font-size: 64px;
      margin-bottom: 12px;
      display: block;
      opacity: 0.4;
    }
    .dp-prod-empty h3 {
      font-size: 18px;
      font-weight: 800;
      color: var(--text, #1a1a1a);
      margin: 0 0 8px;
    }
    .dp-prod-empty p {
      font-size: 13.5px;
      color: var(--text-soft, #6b6b6b);
      max-width: 480px;
      margin: 0 auto 16px;
      line-height: 1.7;
    }
    .dp-prod-empty-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .dp-prod-empty-btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
    }
    .dp-prod-empty-btn-primary {
      background: linear-gradient(135deg, var(--gold, #d4af37), var(--gold-light, #f0c850));
      color: #1a1a1a;
    }
    .dp-prod-empty-btn-ghost {
      background: transparent;
      border: 1.5px solid var(--border-soft, #eee);
      color: var(--text, #1a1a1a);
    }

    @media (max-width: 480px) {
      .dp-prod-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 رندر محصول
  // ═══════════════════════════════════════════════════════════════

  function renderProduct(p) {
    const badge = p.badge ? BADGE_COLORS[p.badge] : null;
    const discount = p.discount || (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
    const favs = JSON.parse(localStorage.getItem('dp_favorites') || '[]');
    const isFav = favs.includes(p.id);

    // محاسبه Hybrid Score اگه کاربر سلیقه داشت
    let hybridBadge = '';
    const userTaste = window.DPTasteProfile?.load?.();
    if (userTaste && userTaste.gender && window.DPHybridScorer) {
      try {
        const score = window.DPHybridScorer.calculateHybridScore(p, userTaste, 'feed');
        // 🆕 همیشه badge نشون بده، حتی اگه زیر ۶۵٪ بود (با استایل متفاوت)
        if (score.hybrid >= 40) {
          const badgeClass = score.hybrid >= 65 ? '' : 'is-low';
          const badgeTitle = score.hybrid >= 65
            ? `تطابق ${score.hybrid}٪ - شخصیت + سلیقه + فروش`
            : `نزدیک‌ترین تطابق ${score.hybrid}٪ - محصول بالای ۶۵٪ نیست`;
          hybridBadge = `<div class="dp-prod-hybrid-badge ${badgeClass}" title="${badgeTitle}">
            <span class="dp-prod-hybrid-icon">${score.levelIcon}</span>
            <span>${score.hybrid}٪</span>
          </div>`;
        }
      } catch (e) {}
    }

    // استفاده از عکس واقعی یا آیکن
    let imgHtml;
    if (p.image) {
      imgHtml = `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentNode.textContent='${p.icon}'" />`;
    } else {
      imgHtml = p.icon;
    }

    return `
      <a class="dp-prod ${p.isSellerProduct ? 'is-seller-product' : ''}" data-product-id="${p.id}" data-product-name="${p.name}" href="./product.html?id=${p.id}">
        ${p.badge ? `<div class="dp-prod-badge" style="background:${badge.bg};color:${badge.fg}">${p.badge}</div>` : ''}
        ${hybridBadge}
        <div class="dp-prod-img">${imgHtml}</div>
        <button class="dp-prod-fav ${isFav ? 'is-fav' : ''}" aria-label="علاقه‌مندی" onclick="event.preventDefault();event.stopPropagation();window.DPProductsFeed.toggleFav('${p.id}', this);return false;">${isFav ? '❤️' : '🤍'}</button>
        <div class="dp-prod-info">
          <h4 class="dp-prod-name">${p.name}</h4>
          <div class="dp-prod-seller">🏪 ${p.seller}</div>
          <div class="dp-prod-price">
            <strong>${formatPrice(p.price)}</strong>
            ${p.oldPrice ? `<del>${formatPrice(p.oldPrice)}</del>${discount > 0 ? `<span class="dp-prod-discount">${discount}٪</span>` : ''}` : ''}
          </div>
          ${p.rating > 0 ? `<div class="dp-prod-rating">
            <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
            <span>${p.rating} (${toFa(p.reviews)})</span>
          </div>` : ''}
        </div>
      </a>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📭 حالت خالی
  // ═══════════════════════════════════════════════════════════════

  function renderEmpty(container) {
    const isLoggedIn = window.DPAuth && window.DPAuth.currentUser && window.DPAuth.currentUser();
    container.innerHTML = `
      <div class="dp-prod-empty">
        <span class="dp-prod-empty-icon">🛍️</span>
        <h3>هنوز محصولی ثبت نشده</h3>
        <p>
          برای دیدن محصولات واقعی، فروشنده‌ها باید محصولاتشون رو ثبت کنن.
          می‌تونی اولین فروشنده باشی یا منتظر محصولات فروشندگان باشی.
        </p>
        <div class="dp-prod-empty-actions">
          <a class="dp-prod-empty-btn dp-prod-empty-btn-primary" href="./seller/seller-signup.html">
            🏪 ثبت‌نام فروشنده
          </a>
          ${isLoggedIn ? '' : `<a class="dp-prod-empty-btn dp-prod-empty-btn-ghost" href="./auth.html">👤 ورود / ثبت‌نام</a>`}
          <button class="dp-prod-empty-btn dp-prod-empty-btn-ghost" id="dpRefreshEmpty">🔄 به‌روزرسانی</button>
        </div>
      </div>
    `;
    const refresh = document.getElementById('dpRefreshEmpty');
    if (refresh) {
      refresh.addEventListener('click', () => init(true));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛒 سبد خرید
  // ═══════════════════════════════════════════════════════════════

  function addToCart(product, fromEl) {
    const cart = JSON.parse(localStorage.getItem('dp_cart') || '[]');
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1, addedAt: Date.now() });
    }
    localStorage.setItem('dp_cart', JSON.stringify(cart));
    updateCartBadge();

    // track ماموریت: خرید
    if (window.ClubTracker) {
      window.ClubTracker.track('m3', 1, { productId: product.id, type: 'add-to-cart' });
    }
    // track رفتار
    if (window.DPBehavior) {
      window.DPBehavior.track('cart_add', { productId: product.id, category: product.category, color: (product.colors || [])[0], style: product.style, seller: product.seller, price: product.price });
    }

    // انیمیشن پرواز
    if (fromEl) {
      const fromRect = fromEl.getBoundingClientRect();
      const fly = document.createElement('div');
      fly.className = 'dp-fly';
      fly.textContent = product.icon || '🛍️';
      fly.style.left = (fromRect.left + fromRect.width / 2 - 25) + 'px';
      fly.style.top = (fromRect.top + fromRect.height / 2 - 25) + 'px';
      document.body.appendChild(fly);
      setTimeout(() => {
        fly.style.left = '90%';
        fly.style.top = '40px';
        fly.style.transform = 'scale(0.2) rotate(360deg)';
        fly.style.opacity = '0';
      }, 50);
      setTimeout(() => fly.remove(), 1000);
    }

    // اعلان
    if (window.DPMagic && window.DPMagic.showToast) {
      window.DPMagic.showToast(`✅ ${product.name} به سبد اضافه شد`, 'success');
    } else {
      showSimpleToast(`✅ ${product.name} به سبد اضافه شد`);
    }
  }

  function showSimpleToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    const tx = document.getElementById('toastText');
    if (tx) tx.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  function toggleFav(productId, btn) {
    const favs = JSON.parse(localStorage.getItem('dp_favorites') || '[]');
    const idx = favs.indexOf(productId);
    if (idx >= 0) {
      favs.splice(idx, 1);
      btn.classList.remove('is-fav');
      btn.textContent = '🤍';
    } else {
      favs.push(productId);
      btn.classList.add('is-fav');
      btn.textContent = '❤️';
      // track ماموریت: لایک
      if (window.ClubTracker) {
        window.ClubTracker.track('m2', 1, { productId, type: 'favorite' });
        if (window.DPBehavior) window.DPBehavior.track('favorite_add', { productId });
      }
    }
    localStorage.setItem('dp_favorites', JSON.stringify(favs));
    updateCartBadge();
  }

  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('dp_cart') || '[]');
    const total = cart.reduce((sum, c) => sum + c.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = total;
      b.style.display = total > 0 ? 'flex' : 'none';
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔍 Quick View Modal
  // ═══════════════════════════════════════════════════════════════

  function showQuickView(productId) {
    const realProducts = getRealProducts();
    const raw = realProducts.find(x => String(x.id) === String(productId));
    if (!raw) return;
    const p = normalizeProduct(raw);

    let modal = document.querySelector('.dp-quick-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'dp-quick-modal';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('is-on');
      });
    }

    const discount = p.discount || (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

    let imgHtml = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'" />`
      : p.icon;

    const sellerTag = p.isSellerProduct
      ? `<span style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:800">🏪 فروشنده معتبر</span>`
      : '';

    modal.innerHTML = `
      <div class="dp-quick-content">
        <button class="dp-quick-close" aria-label="بستن">✕</button>
        <div class="dp-quick-img">${imgHtml}</div>
        <div class="dp-quick-body">
          <h2 class="dp-quick-name">${p.name}</h2>
          <div class="dp-quick-meta">
            <span>🏪 ${p.seller}</span>
            ${p.rating > 0 ? `<span>${'★'.repeat(Math.floor(p.rating))} ${p.rating} (${toFa(p.reviews)} نظر)</span>` : ''}
            <span>${p.category || ''}</span>
            ${sellerTag}
          </div>
          <div class="dp-quick-price">
            ${formatPrice(p.price)} تومان
            ${p.oldPrice ? `<span style="font-size:14px;color:#999;text-decoration:line-through;margin-right:8px">${formatPrice(p.oldPrice)}</span><span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:800;margin-right:8px">${discount}٪ تخفیف</span>` : ''}
          </div>
          ${p.description ? `<p style="color:#666;font-size:13px;line-height:1.7;margin:0 0 12px">${p.description}</p>` : ''}
          ${p.colors && p.colors.length > 0 ? `<div style="margin-bottom:12px;font-size:12px;color:#666"><strong>رنگ‌های موجود:</strong> ${p.colors.join('، ')}</div>` : ''}
          <div class="dp-quick-actions">
            <button class="dp-quick-btn dp-quick-btn-ghost" data-quick-fav>${document.querySelector('.dp-prod-fav.is-fav') ? '❤️' : '🤍'} علاقه‌مندی</button>
            <button class="dp-quick-btn dp-quick-btn-primary" data-quick-cart>🛒 افزودن به سبد</button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('is-on');

    modal.querySelector('.dp-quick-close').addEventListener('click', () => {
      modal.classList.remove('is-on');
    });
    modal.querySelector('[data-quick-cart]').addEventListener('click', () => {
      addToCart(p);
      modal.classList.remove('is-on');
    });
    modal.querySelector('[data-quick-fav]').addEventListener('click', (e) => {
      const id = typeof p.id === 'string' ? p.id : parseInt(p.id);
      toggleFav(id, e.currentTarget);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 Setup event delegation
  // ═══════════════════════════════════════════════════════════════

  function setupEvents(container) {
    if (container._dpSetup) return;
    container._dpSetup = true;

    container.addEventListener('click', (e) => {
      // دکمه علاقه‌مندی - کلیک نکنه به صفحه محصول
      const favBtn = e.target.closest('.dp-prod-fav');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest('.dp-prod');
        if (card) {
          const id = card.dataset.productId;
          toggleFav(id, favBtn);
        }
        return false;
      }
      // بقیه کلیک‌ها = لینک طبیعی (به product.html)
    });

    // 3D tilt
    try {
      if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
        container.addEventListener('mousemove', (e) => {
          const card = e.target.closest('.dp-prod');
          if (!card) return;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        container.addEventListener('mouseleave', (e) => {
          const card = e.target.closest('.dp-prod');
          if (card) card.style.transform = '';
        });
      }
    } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 track ماموریت: دیدن محصول
  // ═══════════════════════════════════════════════════════════════

  function setupViewTracking(container) {
    if (!('IntersectionObserver' in window)) return;

    const seen = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const id = entry.target.dataset.productId;
          if (id && !seen.has(id)) {
            seen.add(id);
            if (window.ClubTracker) {
              window.ClubTracker.track('m1', 1, { productId: id, type: 'view' });
              if (window.DPBehavior) window.DPBehavior.track('product_view', { productId: id, category: p.category, color: (p.colors || [])[0], style: p.style, seller: p.seller, rating: p.rating, isSellerProduct: p.isSellerProduct });
            }
          }
        }
      });
    }, { threshold: [0.5] });

    container.querySelectorAll('.dp-prod').forEach(el => {
      observer.observe(el);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 Public API
  // ═══════════════════════════════════════════════════════════════

  window.DPProductsFeed = {
    render: async function(target, products) {
      const container = typeof target === 'string'
        ? document.querySelector(target)
        : target;
      if (!container) return;

      // 🆕 v17.6 — اگه محصول پاس داده نشده، از سرور sync کن
      let list;
      if (products) {
        list = products.map(normalizeProduct);
      } else {
        list = await getRealProductsAsync();
        // حذف تکراری بر اساس ID
        const seen = new Set();
        list = list.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      }
      
      if (list.length === 0) {
        renderEmpty(container);
        return;
      }
      container.innerHTML = '<div class="dp-prod-grid">' + list.map(renderProduct).join('') + '</div>';
      setupEvents(container);
      setupViewTracking(container);
    },
    getRealProducts,
    normalizeProduct,
    renderProduct,
    addToCart,
    showQuickView,
    updateCartBadge,
    refresh: function() { init(true); },
    version: '2.0'
  };

  // ═══════════════════════════════════════════════════════════════
  // 🚀 شروع
  // ═══════════════════════════════════════════════════════════════

  async function init(force) {
    setTimeout(updateCartBadge, 500);
    
    // 🆕 v17.6 — ابتدا sync از سرور
    try {
      const res = await fetch('http://localhost:8001/api/products', { cache: 'no-store' });
      if (res.ok) {
        const serverProducts = await res.json();
        if (Array.isArray(serverProducts) && serverProducts.length > 0) {
          localStorage.setItem('dp_products', JSON.stringify(serverProducts));
          localStorage.setItem('dp_server_version', Date.now().toString());
          console.log('✅ dp-products-feed: ' + serverProducts.length + ' محصول از سرور sync شد');
        }
      }
    } catch (e) {}
    
    // سپس render همه container ها
    const containers = document.querySelectorAll('[data-products-feed]');
    containers.forEach(el => {
      try {
        if (!el) return;
        if (force) el._dpSetup = false;
        window.DPProductsFeed.render(el);
      } catch (e) {
        console.warn('DPProductsFeed render error:', e);
        renderEmpty(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // گوش دادن به تغییرات محصولات (فروشنده محصول اضافه کرد)
  window.addEventListener('storage', (e) => {
    if (e.key === 'dp_products' || e.key === 'dp_cart' || e.key === 'dp_products_updated') {
      console.log('🔄 dp-products-feed: storage changed -', e.key);
      init(true);
    }
  });

  // 🆕 v17.7 — گوش دادن به custom event از DPProductLoader
  window.addEventListener('dp:products-changed', () => {
    console.log('🔄 dp-products-feed: محصول تغییر کرد، re-render...');
    init(true);
  });

  // 🆕 v17.7 — گوش دادن به BroadcastChannel از سایر tabs
  try {
    const channel = new BroadcastChannel('dp_products_channel');
    channel.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'products_updated') {
        console.log('🔄 dp-products-feed: BroadcastChannel محصول تغییر کرد');
        init(true);
      }
    });
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }

  console.log('🛍️ DPProductsFeed v2.1 loaded — محصولات واقعی فروشندگان (با real-time update)');
})();
