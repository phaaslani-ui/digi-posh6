/**
 * 🪞 dp-personality-section.js — نمایش بخش "برای شخصیت شما"
 * ------------------------------------------------------------------
 * • رندر محصولات ترکیبی (شخصیت + سلیقه + فروش) در صفحه اصلی
 * • نمایش badge روی محصولات
 * • توضیح چرا این محصول برای شما مناسبه
 */

(function() {
  'use strict';
  if (window.DPPersonalitySectionLoaded) return;
  window.DPPersonalitySectionLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر کارت محصول (نسخه کوچک برای بخش شخصیت)
  // ═══════════════════════════════════════════════════════════════
  function renderCompactCard(product) {
    const url = product.id ? `./product.html?id=${product.id}` : './index.html';
    const match = product.hybridScore || 0;
    const personalityScore = product.personalityScore || 0;
    const tasteScore = product.tasteScore || 0;
    const salesScore = product.salesScore || 0;
    const seller = product.seller || 'فروشنده';
    const colors = (product.colors || []).slice(0, 3);

    // 🆕 اگه محصول fallback هست (زیر ۶۵٪)، کلاس اضافه کن
    const fallbackClass = product.level === 'fallback' ? 'is-fallback' : '';

    return `
      <a class="dpm-personality-card ${fallbackClass}" href="${url}" data-product-id="${product.id || ''}">
        <div class="dpm-personality-img">
          <div class="dpm-personality-badges">
            <span class="dpm-personality-badge dpm-personality-badge--main">
              ${product.levelIcon || '🎯'} ${match}٪
            </span>
            ${personalityScore >= 70 ? `
              <span class="dpm-personality-badge dpm-personality-badge--personality" title="تطابق با شخصیت شما">
                🪞 ${personalityScore}٪
              </span>
            ` : ''}
          </div>
          ${product.isSellerProduct ? '<span class="dpm-personality-seller">فروشنده معتبر</span>' : ''}
          ${product.image
            ? `<img src="${product.image}" alt="${product.name || ''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />`
            : ''
          }
          <div class="dpm-personality-fallback" ${product.image ? 'style="display:none"' : ''}>
            ${getCategoryIcon(product.category)}
          </div>
        </div>
        <div class="dpm-personality-body">
          <div class="dpm-personality-name">${product.name || 'محصول'}</div>
          <div class="dpm-personality-seller">${seller}</div>
          ${colors.length > 0 ? `
            <div class="dpm-personality-colors">
              ${colors.map(c => `<span style="background:${getColorHex(c)}" title="${c}"></span>`).join('')}
            </div>
          ` : ''}
          <div class="dpm-personality-score-row">
            <div class="dpm-personality-score-item" title="تطابق شخصیتی">
              <span class="dpm-personality-score-icon">🪞</span>
              <div class="dpm-personality-score-bar">
                <div class="dpm-personality-score-fill" style="width:${personalityScore}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></div>
              </div>
              <span class="dpm-personality-score-val">${personalityScore}</span>
            </div>
            <div class="dpm-personality-score-item" title="تطابق سلیقه">
              <span class="dpm-personality-score-icon">🎨</span>
              <div class="dpm-personality-score-bar">
                <div class="dpm-personality-score-fill" style="width:${tasteScore}%;background:linear-gradient(90deg,#d4af37,#b8941f)"></div>
              </div>
              <span class="dpm-personality-score-val">${tasteScore}</span>
            </div>
            <div class="dpm-personality-score-item" title="امتیاز فروش">
              <span class="dpm-personality-score-icon">🔥</span>
              <div class="dpm-personality-score-bar">
                <div class="dpm-personality-score-fill" style="width:${salesScore}%;background:linear-gradient(90deg,#ef4444,#dc2626)"></div>
              </div>
              <span class="dpm-personality-score-val">${salesScore}</span>
            </div>
          </div>
          <div class="dpm-personality-price">
            <strong>${(product.price || 0).toLocaleString('fa-IR')}</strong>
            ${product.discount ? `<span class="dpm-personality-discount">${product.discount}٪</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🪞 رندر بخش کامل
  // ═══════════════════════════════════════════════════════════════
  function renderSection() {
    const section = document.getElementById('personalitySection');
    const grid = document.getElementById('personalitySectionGrid');
    const titleEl = document.getElementById('personalitySectionTitle');
    const subtitleEl = document.getElementById('personalitySectionSubtitle');

    if (!section || !grid) return;

    const taste = window.DPTasteProfile?.load?.();
    if (!taste || !taste.gender) {
      section.style.display = 'none';
      return;
    }

    // دریافت محصولات
    const products = window.DPHybridScorer?.getProductsForPersonality(taste, {
      context: 'home',
      limit: 6,
      minScore: 55
    }) || [];

    if (products.length === 0) {
      section.style.display = 'none';
      return;
    }

    // آپدیت عنوان با آرکی‌تایپ کاربر
    const topArchetype = window.DPBehavior?.getTopArchetypes?.(taste, 1)?.[0];
    if (topArchetype && titleEl) {
      titleEl.textContent = `محصولات ${topArchetype.name}‌ها (${topArchetype.emoji})`;
    }

    // رندر
    grid.innerHTML = products.map(renderCompactCard).join('');
    section.style.display = 'block';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ توابع کمکی
  // ═══════════════════════════════════════════════════════════════
  function getCategoryIcon(category) {
    const map = {
      'پیراهن': '👗', 'کت': '🧥', 'شلوار': '👖', 'تی‌شرت': '👕',
      'مانتو': '🧥', 'کیف': '👜', 'ساعت': '⌚', 'اکسسوری': '💍',
      'کفش': '👟', 'عینک': '🕶️'
    };
    return map[category] || '🛍️';
  }

  function getColorHex(colorName) {
    const map = {
      'black': '#1f2937', 'مشکی': '#1f2937',
      'white': '#f9fafb', 'سفید': '#f9fafb',
      'gold': '#d4af37', 'طلایی': '#d4af37',
      'cream': '#fef3c7', 'کرم': '#fef3c7',
      'red': '#ef4444', 'قرمز': '#ef4444',
      'burgundy': '#800020', 'زرشکی': '#800020',
      'pink': '#ec4899', 'صورتی': '#ec4899',
      'blue': '#3b82f6', 'آبی': '#3b82f6',
      'navy': '#1e3a8a', 'سرمه‌ای': '#1e3a8a',
      'green': '#10b981', 'سبز': '#10b981',
      'olive': '#808000', 'زیتونی': '#808000',
      'brown': '#92400e', 'قهوه‌ای': '#92400e',
      'gray': '#6b7280', 'طوسی': '#6b7280',
      'purple': '#a855f7', 'بنفش': '#a855f7',
      'coral': '#ff7f50', 'مرجانی': '#ff7f50',
    };
    return map[(colorName || '').toLowerCase()] || '#9ca3af';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function init() {
    // صبر برای لود کامل
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(renderSection, 800));
    } else {
      setTimeout(renderSection, 800);
    }

    // وقتی storage تغییر کرد (سلیقه جدید)
    window.addEventListener('storage', e => {
      if (e.key === 'dp_user_taste_v3') renderSection();
    });

    // auto init
    init();
  }

  // auto start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

  window.DPPersonalitySection = {
    render: renderSection,
    init: init,
  };

  console.log('🪞 DPPersonalitySection loaded');
})();
