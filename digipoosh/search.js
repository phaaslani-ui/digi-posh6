/**
 * 🔍 search.js v1.0 — صفحه نتایج جستجو
 */

(function() {
  'use strict';

  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').trim();
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'relevance';

  // ═══════════════════════════════════════════════════════════════
  // 📦 داده محصولات (همون dp-products-feed)
  // ═══════════════════════════════════════════════════════════════

  // 🆕 v17.0 — محصولات واقعی فقط (از DPProducts.all یا سرور)
  const PRODUCTS = window.DPProducts && window.DPProducts.all
    ? window.DPProducts.all().map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.originalPrice,
        color: (p.colors && p.colors[0]) || '',
        category: p.category,
        icon: getCategoryIcon(p.category),
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        badge: p.discount > 20 ? 'تخفیف' : (p.sold > 200 ? 'پرفروش' : null),
        seller: p.seller || p.brand || 'فروشنده',
        image: p.image
      }))
    : [];

  // کمک: آیکن دسته
  function getCategoryIcon(cat) {
    const icons = {
      'پیراهن': '👗', 'کت': '🧥', 'شلوار': '👖', 'کفش': '👠',
      'اکسسوری': '👜', 'تیشرت': '👕', 'مانتو': '🧥', 'لباس': '👗',
      'پالتو': '🧥', 'دامن': '👗', 'ساعت': '⌚', 'کیف': '👜',
      'شال': '🧣', 'کمربند': '🪢', 'بلوز': '👕', 'گردنبند': '📿',
      'عینک': '🕶️', 'گوشواره': '💎'
    };
    return icons[cat] || '🛍️';
  }

  const BADGE_CLASS = {
    'پرفروش': 'is-pink',
    'جدید': 'is-blue',
    'تخفیف': 'is-red',
    'ویژه': '',
    'محبوب': 'is-pink',
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔍 جستجو
  // ═══════════════════════════════════════════════════════════════

  function searchProducts(q, cat, sortBy) {
    let results = PRODUCTS.slice();

    // فیلتر بر اساس کلمه
    if (q) {
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter(p => {
        const text = (p.name + ' ' + p.category + ' ' + p.color + ' ' + p.seller).toLowerCase();
        return tokens.some(t => text.includes(t));
      });
    }

    // فیلتر دسته
    if (cat && cat !== 'all') {
      results = results.filter(p => p.category === cat);
    }

    // مرتب‌سازی
    if (sortBy === 'price-low') results.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') results.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'popular') results.sort((a, b) => b.reviews - a.reviews);
    // default: relevance (no extra sort)

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // 💰 فرمت قیمت
  // ═══════════════════════════════════════════════════════════════

  function formatPrice(n) {
    return n.toLocaleString('fa-IR') + ' تومان';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر
  // ═══════════════════════════════════════════════════════════════

  function toFa(n) {
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function render(query, cat, sortBy) {
    const results = searchProducts(query, cat, sortBy);

    // سربرگ
    const qEl = document.getElementById('searchQuery');
    if (qEl) qEl.textContent = query || 'همه محصولات';

    const countEl = document.getElementById('searchCount');
    if (countEl) {
      countEl.textContent = toFa(results.length) + ' محصول یافت شد';
    }

    // نتایج
    const grid = document.getElementById('searchResults');
    const sugBox = document.getElementById('searchSuggestions');
    if (!grid) return;

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="search-empty" style="grid-column: 1/-1">
          <span class="search-empty-icon">🔍</span>
          <h3>نتیجه‌ای یافت نشد</h3>
          <p>برای "${query}" محصولی پیدا نکردیم. کلمه‌ی دیگه‌ای امتحان کن.</p>
        </div>
      `;
      if (sugBox) {
        sugBox.style.display = 'block';
        renderSuggestions(query);
      }
      return;
    }

    if (sugBox) sugBox.style.display = 'none';

    grid.innerHTML = results.map(p => {
      const badgeClass = p.badge ? BADGE_CLASS[p.badge] || '' : '';
      return `
        <article class="search-result" data-id="${p.id}">
          <div class="search-result-image">
            ${p.badge ? `<span class="search-result-badge ${badgeClass}">${p.badge}</span>` : ''}
            ${p.icon}
          </div>
          <div class="search-result-body">
            <h3 class="search-result-title">${p.name}</h3>
            <p class="search-result-seller">${p.seller}</p>
            <div class="search-result-price">
              <strong>${formatPrice(p.price)}</strong>
              ${p.oldPrice ? `<del>${formatPrice(p.oldPrice)}</del>` : ''}
            </div>
            <div class="search-result-rating">
              ⭐ <strong>${p.rating}</strong> (${toFa(p.reviews)} نظر)
            </div>
            <button class="search-result-add" data-add="${p.id}">افزودن به سبد</button>
          </div>
        </article>
      `;
    }).join('');

    // event listeners
    grid.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.DPProductsFeed && window.DPProductsFeed.addToCart) {
          window.DPProductsFeed.addToCart(btn.dataset.add);
        } else {
          showToast('به سبد خرید اضافه شد');
        }
      });
    });
  }

  function renderSuggestions(query) {
    const allKeywords = ['پیراهن', 'کت بلیزر', 'شلوار جین', 'کیف', 'تی‌شرت', 'ساعت', 'کفش', 'مانتو'];
    const sugs = allKeywords.filter(k => !query.includes(k)).slice(0, 6);
    const container = document.getElementById('suggestionChips');
    if (!container) return;
    container.innerHTML = sugs.map(s => `<button class="search-suggestion-chip" data-q="${s}">${s}</button>`).join('');
    container.querySelectorAll('[data-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        location.href = './search.html?q=' + encodeURIComponent(btn.dataset.q);
      });
    });
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    const tx = document.getElementById('toastText');
    if (tx) tx.textContent = '✅ ' + msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ فیلترها
  // ═══════════════════════════════════════════════════════════════

  function setupFilters() {
    // دسته‌بندی
    document.querySelectorAll('[data-filter="category"]').forEach(btn => {
      if (btn.dataset.value === category) btn.classList.add('is-active');
      else btn.classList.remove('is-active');

      btn.addEventListener('click', () => {
        const newCat = btn.dataset.value;
        const url = new URL(location.href);
        if (newCat === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', newCat);
        location.href = url.toString();
      });
    });

    // مرتب‌سازی
    const sortEl = document.getElementById('searchSort');
    if (sortEl) {
      sortEl.value = sort;
      sortEl.addEventListener('change', () => {
        const url = new URL(location.href);
        url.searchParams.set('sort', sortEl.value);
        location.href = url.toString();
      });
    }

    // پر کردن input
    const input = document.getElementById('navSearchInput');
    if (input) input.value = query;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 شروع
  // ═══════════════════════════════════════════════════════════════

  function init() {
    render(query, category, sort);
    setupFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
