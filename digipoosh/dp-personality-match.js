/**
 * 🪞 dp-personality-match.js — نمایش توضیح تطابق شخصیت در صفحه کالا
 * ------------------------------------------------------------------
 * • نمایش «چرا این محصول با شخصیت شما سازگاره»
 * • نمایش hybrid score breakdown
 */

(function() {
  'use strict';
  if (window.DPPersonalityMatchLoaded) return;
  window.DPPersonalityMatchLoaded = true;

  function show() {
    // پیدا کردن محصول فعلی
    const product = getCurrentProduct();
    if (!product) return;

    const taste = window.DPTasteProfile?.load?.();
    if (!taste || !taste.gender) return;

    if (!window.DPHybridScorer) return;

    const explanation = window.DPHybridScorer.explainMatch(product, taste, 'product');
    if (!explanation) return;

    // پیدا کردن جای مناسب برای نمایش
    let container = document.getElementById('personalityMatchBox');
    if (!container) {
      container = document.createElement('div');
      container.id = 'personalityMatchBox';
      container.className = 'personality-match-box';

      // اضافه کردن به صفحه
      const target = document.querySelector('.pd-buy') || document.querySelector('#pdMain') || document.body;
      if (target) {
        target.appendChild(container);
      }
    }

    const reasons = explanation.reasons;
    const score = explanation.score;

    container.innerHTML = `
      <div class="pm-header">
        <span class="pm-icon">${score.levelIcon}</span>
        <div>
          <div class="pm-title">${score.hybrid}٪ با شما سازگاره</div>
          <div class="pm-subtitle">${explanation.summary}</div>
        </div>
      </div>
      ${reasons.length > 0 ? `
        <div class="pm-reasons">
          ${reasons.map(r => `
            <div class="pm-reason">
              <span class="pm-reason-icon">${r.icon}</span>
              <span>${r.text}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="pm-breakdown">
        <div class="pm-breakdown-item">
          <span class="pm-breakdown-label">🪞 شخصیت</span>
          <div class="pm-breakdown-bar">
            <div class="pm-breakdown-fill" style="width:${score.personality}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></div>
          </div>
          <span class="pm-breakdown-val">${score.personality}٪</span>
        </div>
        <div class="pm-breakdown-item">
          <span class="pm-breakdown-label">🎨 سلیقه</span>
          <div class="pm-breakdown-bar">
            <div class="pm-breakdown-fill" style="width:${score.taste}%;background:linear-gradient(90deg,#d4af37,#b8941f)"></div>
          </div>
          <span class="pm-breakdown-val">${score.taste}٪</span>
        </div>
        <div class="pm-breakdown-item">
          <span class="pm-breakdown-label">🔥 فروش</span>
          <div class="pm-breakdown-bar">
            <div class="pm-breakdown-fill" style="width:${score.sales}%;background:linear-gradient(90deg,#ef4444,#dc2626)"></div>
          </div>
          <span class="pm-breakdown-val">${score.sales}٪</span>
        </div>
      </div>
    `;
  }

  function getCurrentProduct() {
    // تلاش برای گرفتن محصول فعلی از صفحه
    if (window.PD && window.PD.product) return window.PD.product;
    if (window.currentProduct) return window.currentProduct;

    // از URL parameter
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id && window.DPProducts && window.DPProducts.all) {
      const all = window.DPProducts.all();
      return all.find(p => p.id === id) || null;
    }
    return null;
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(show, 1500));
    } else {
      setTimeout(show, 1500);
    }
  }

  window.DPPersonalityMatch = {
    show: show,
    init: init,
  };

  // auto start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

  console.log('🪞 DPPersonalityMatch loaded');
})();
