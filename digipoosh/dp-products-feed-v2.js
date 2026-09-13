/* ═══════════════════════════════════════════════════════════════════
 * 🛍️ DP Products Feed v18.0 — رندر ساده با Hub
 * ------------------------------------------------------------------
 * • استفاده از DPProductsHub (منبع حقیقت)
 * • Real-time re-render با listener
 * • بدون hardcode - همیشه از سرور
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPProductsFeedV2) return;

  const CONFIG = {
    GRID_SELECTOR: '[data-products-feed]',
    EMPTY_MESSAGE: 'هنوز محصولی از فروشنده‌ها اضافه نشده. به‌زودی پر میشه! ✨'
  };

  function formatPrice(n) {
    if (!n) return '۰';
    return Number(n).toLocaleString('fa-IR');
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderCard(product) {
    const img = product.image || (product.images && product.images[0]) || '';
    const colors = (product.colors || []).slice(0, 3);
    const colorBadges = colors.map(c => 
      `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${getColorHex(c)};border:1px solid #ddd;margin-left:3px" title="${esc(c)}"></span>`
    ).join('');
    
    return `
      <a class="dpp-card" href="./product.html?id=${encodeURIComponent(product.id)}">
        <div class="dpp-img-wrap">
          ${img ? `<img src="${esc(img)}" loading="lazy" alt="${esc(product.name)}" onerror="this.parentElement.innerHTML='<div class=dpp-empty>🛍️</div>'"/>` : '<div class="dpp-empty">🛍️</div>'}
          ${product.discount ? `<span class="dpp-badge">${product.discount}٪</span>` : ''}
        </div>
        <div class="dpp-info">
          <div class="dpp-name">${esc(product.name || 'محصول')}</div>
          <div class="dpp-meta">${colorBadges} <span class="dpp-seller">${esc(product.seller || product.brand || '')}</span></div>
          <div class="dpp-price">${formatPrice(product.price)} <small>تومان</small></div>
        </div>
      </a>
    `;
  }

  function getColorHex(colorName) {
    const map = {
      'مشکی': '#1a1a1a', 'سفید': '#fff', 'قرمز': '#dc2626', 'آبی': '#3b82f6',
      'طلایی': '#d4af37', 'نقره‌ای': '#c0c0c0', 'صورتی': '#ec4899',
      'سبز': '#22c55e', 'زرد': '#eab308', 'قهوه‌ای': '#78350f',
      'طوسی': '#6b7280', 'کرم': '#fef3c7', 'سرمه‌ای': '#1e3a8a',
      'زرشکی': '#881337', 'بنفش': '#7c3aed', 'نارنجی': '#f97316'
    };
    return map[colorName] || '#9ca3af';
  }

  function renderEmpty(container) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:var(--bg-soft,#fafafa);border-radius:16px;margin:16px 0">
        <div style="font-size:48px;margin-bottom:12px;opacity:0.5">🛍️</div>
        <p style="margin:0;color:var(--text-soft,#666);font-size:14px">${CONFIG.EMPTY_MESSAGE}</p>
      </div>
    `;
  }

  function renderGrid(container, products) {
    if (!products || products.length === 0) {
      renderEmpty(container);
      return;
    }
    container.innerHTML = '<div class="dpp-grid">' + products.map(renderCard).join('') + '</div>';
  }

  function renderAll() {
    if (!window.DPProductsHub) return;
    
    const products = window.DPProductsHub.all();
    const containers = document.querySelectorAll(CONFIG.GRID_SELECTOR);
    
    containers.forEach(container => {
      renderGrid(container, products);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function init() {
    // منتظر Hub
    if (window.DPProductsHub) {
      // رندر فوری
      renderAll();
      
      // گوش دادن به تغییرات
      window.DPProductsHub.onChange(() => {
        console.log('🔄 Feed: محصول تغییر کرد - re-render');
        renderAll();
      });
      
      // گوش دادن به Hub ready
      const checkReady = setInterval(() => {
        if (window.DPProductsHub && window.DPProductsHub.all().length >= 0) {
          renderAll();
          clearInterval(checkReady);
        }
      }, 100);
      
      // fallback: اگه بعد از ۲ ثانیه Hub آماده نبود
      setTimeout(() => {
        renderAll();
      }, 2000);
      
      // گوش دادن به CustomEvent
      window.addEventListener('dp-hub:changed', () => {
        renderAll();
      });
    } else {
      // Hub هنوز لود نشده - صبر کن
      setTimeout(init, 100);
    }
  }

  // اضافه کردن CSS
  function injectCSS() {
    if (document.getElementById('dpp-feed-css')) return;
    const style = document.createElement('style');
    style.id = 'dpp-feed-css';
    style.textContent = `
      .dpp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
        padding: 16px 0;
      }
      .dpp-card {
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-soft, #eee);
        border-radius: 16px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
      }
      .dpp-card:hover {
        border-color: var(--gold, #d4af37);
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(212,175,55,0.15);
      }
      .dpp-img-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .dpp-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .dpp-empty { font-size: 48px; opacity: 0.3; }
      .dpp-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #dc2626;
        color: #fff;
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
      }
      .dpp-info {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .dpp-name {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        min-height: 36px;
      }
      .dpp-meta {
        font-size: 11px;
        color: var(--text-soft, #666);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dpp-seller {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      .dpp-price {
        font-size: 14px;
        font-weight: 800;
        color: var(--gold, #d4af37);
        margin-top: 4px;
      }
      .dpp-price small {
        font-size: 10px;
        font-weight: 400;
        color: var(--text-soft, #999);
      }
    `;
    document.head.appendChild(style);
  }

  // شروع
  injectCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API عمومی
  window.DPProductsFeedV2 = {
    refresh: renderAll,
    version: '2.0'
  };

  console.log('🛍️ DP Products Feed v18.0 loaded');
})();
