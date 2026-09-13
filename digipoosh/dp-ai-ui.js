/* ═══════════════════════════════════════════════════════════════════
 * 🎨 DPAI UI v8.1 - رابط کاربری هوشمند موتور AI
 * ------------------------------------------------------------------
 * • Live Photo Analysis با Progress
 * • Real-time Season Palette Display
 * • DNA Taste Visualization
 * • AI Dashboard با Match Ring
 * • Smart Outfit Builder UI
 * • Trend Predictor
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  if (window.DPAIUI) return;

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ ابزارهای کمکی UI
  // ═══════════════════════════════════════════════════════════════
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const el = (tag, props = {}, ...children) => {
    const e = document.createElement(tag);
    Object.keys(props).forEach(k => {
      if (k === 'class') e.className = props[k];
      else if (k === 'style') Object.assign(e.style, props[k]);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (k === 'html') e.innerHTML = props[k];
      else e.setAttribute(k, props[k]);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ═══════════════════════════════════════════════════════════════
  // 📸 Photo Analysis UI
  // ═══════════════════════════════════════════════════════════════
  function renderPhotoAnalysisSection(container) {
    const section = el('div', { class: 'ai-card ai-fade-in' });
    section.innerHTML = `
      <div class="ai-card-header">
        <h3 class="ai-card-title">
          <span class="ai-card-title-icon">📸</span>
          تحلیل هوشمند عکس چهره
        </h3>
        <span class="ai-tag">۲۰ لایه تحلیل</span>
      </div>
      <p class="ai-card-subtitle">عکس خود را بفرستید تا AI در کمتر از ۳ ثانیه رنگ پوست، فصل رنگی، فرم بدن، سن و بهترین رنگ‌ها را تشخیص دهد</p>
      <div class="ai-photo-zone" id="aiPhotoZone">
        <span class="ai-photo-zone-icon">📷</span>
        <div class="ai-photo-zone-text">عکس خود را اینجا بکشید یا کلیک کنید</div>
        <div class="ai-photo-zone-hint">JPG, PNG - حداکثر ۵MB - بهتر است چهره واضح باشد</div>
        <input type="file" accept="image/*" id="aiPhotoInput" />
      </div>
      <div id="aiPhotoResult" style="display:none;"></div>
    `;
    container.appendChild(section);
    bindPhotoUpload();
  }

  function bindPhotoUpload() {
    const zone = $('#aiPhotoZone');
    const input = $('#aiPhotoInput');
    if (!zone || !input) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragging');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragging');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handlePhotoFile(file);
    });
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handlePhotoFile(file);
    });
  }

  async function handlePhotoFile(file) {
    const resultEl = $('#aiPhotoResult');
    if (!resultEl) return;

    // Show loading
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="ai-loading-container">
        <div class="ai-loading"></div>
        <div class="ai-loading-text">در حال تحلیل ۲۰ لایه عکس...</div>
      </div>
    `;

    try {
      // ساخت تصویر
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // تحلیل با DPPhotoAI
      if (!window.DPPhotoAI) {
        resultEl.innerHTML = '<div class="ai-empty"><div class="ai-empty-icon">⚠️</div><div class="ai-empty-text">DPPhotoAI لود نشده است</div></div>';
        return;
      }

      const analysis = await window.DPPhotoAI.analyze(img);
      URL.revokeObjectURL(url);

      if (!analysis.success) {
        resultEl.innerHTML = `<div class="ai-empty"><div class="ai-empty-icon">😔</div><div class="ai-empty-text">${esc(analysis.error || 'خطا در تحلیل')}</div></div>`;
        return;
      }

      renderPhotoResult(analysis, file);
    } catch (e) {
      resultEl.innerHTML = `<div class="ai-empty"><div class="ai-empty-icon">❌</div><div class="ai-empty-text">خطا: ${esc(e.message)}</div></div>`;
    }
  }

  function renderPhotoResult(a, file) {
    const resultEl = $('#aiPhotoResult');
    if (!resultEl) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = e.target.result;

      resultEl.innerHTML = `
        <div class="ai-fade-in">
          <div class="ai-photo-preview">
            <img src="${photoData}" alt="عکس شما" />
          </div>
          <div class="ai-stats-grid">
            <div class="ai-stat-card">
              <span class="ai-stat-card-icon">☀️</span>
              <div class="ai-stat-card-value">${esc(a.skin.label)}</div>
              <div class="ai-stat-card-label">رنگ پوست</div>
            </div>
            <div class="ai-stat-card">
              <span class="ai-stat-card-icon">🌈</span>
              <div class="ai-stat-card-value">${esc(a.season.sub)}</div>
              <div class="ai-stat-card-label">فصل رنگی</div>
            </div>
            <div class="ai-stat-card">
              <span class="ai-stat-card-icon">👁️</span>
              <div class="ai-stat-card-value">${esc(a.eyes.label)}</div>
              <div class="ai-stat-card-label">رنگ چشم</div>
            </div>
            <div class="ai-stat-card">
              <span class="ai-stat-card-icon">💇</span>
              <div class="ai-stat-card-value">${esc(a.hair.label)}</div>
              <div class="ai-stat-card-label">رنگ مو</div>
            </div>
            <div class="ai-stat-card">
              <span class="ai-stat-card-icon">⚡</span>
              <div class="ai-stat-card-value">${esc(a.contrast.label)}</div>
              <div class="ai-stat-card-label">کنتراست</div>
            </div>
            ${a.bodyShape ? `<div class="ai-stat-card">
              <span class="ai-stat-card-icon">👤</span>
              <div class="ai-stat-card-value">${esc(a.bodyShape.label || a.bodyShape.shape)}</div>
              <div class="ai-stat-card-label">فرم بدن</div>
            </div>` : ''}
            ${a.ageEstimate ? `<div class="ai-stat-card">
              <span class="ai-stat-card-icon">🎂</span>
              <div class="ai-stat-card-value">${esc(a.ageEstimate.label)}</div>
              <div class="ai-stat-card-label">سن تقریبی</div>
            </div>` : ''}
            ${a.mood ? `<div class="ai-stat-card">
              <span class="ai-stat-card-icon">${a.mood.mood === 'festive' ? '🎉' : a.mood.mood === 'formal' ? '👔' : '😊'}</span>
              <div class="ai-stat-card-value">${esc(a.mood.label)}</div>
              <div class="ai-stat-card-label">حالت</div>
            </div>` : ''}
          </div>

          <h4 style="margin: 24px 0 12px; color: var(--ai-primary);">🎨 بهترین رنگ‌های شما</h4>
          <div class="ai-palette" id="aiBestPalette"></div>

          ${a.avoidColors && a.avoidColors.length ? `
            <h4 style="margin: 24px 0 12px; color: var(--ai-text-3);">🚫 رنگ‌های اجتناب</h4>
            <div class="ai-palette" id="aiAvoidPalette"></div>
          ` : ''}

          ${a.recommendations ? `
            <h4 style="margin: 24px 0 12px;">💡 پیشنهادات</h4>
            <div class="ai-stats-grid">
              ${(a.recommendations.metals || []).slice(0, 1).map(m => `<div class="ai-stat-card"><span class="ai-stat-card-icon">💍</span><div class="ai-stat-card-value">${esc(m)}</div><div class="ai-stat-card-label">فلز پیشنهادی</div></div>`).join('')}
              ${(a.recommendations.clothing || []).slice(0, 2).map(c => `<div class="ai-stat-card"><span class="ai-stat-card-icon">👗</span><div class="ai-stat-card-value" style="font-size:13px;">${esc(c)}</div><div class="ai-stat-card-label">پیشنهاد لباس</div></div>`).join('')}
            </div>
          ` : ''}

          <div style="margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="ai-btn" id="aiApplyPhotoBtn">✅ اعمال به پروفایل</button>
            <button class="ai-btn ai-btn-ghost" id="aiGetProductsBtn">🛍️ پیشنهاد محصولات</button>
          </div>
        </div>
      `;

      // رنگ‌ها
      renderPalette('aiBestPalette', a.bestColors || [], false);
      if (a.avoidColors) renderPalette('aiAvoidPalette', a.avoidColors, true);

      // دکمه‌ها
      $('#aiApplyPhotoBtn')?.addEventListener('click', () => applyPhotoToProfile(a));
      $('#aiGetProductsBtn')?.addEventListener('click', () => getPhotoBasedProducts(a));
    };
    reader.readAsDataURL(file);
  }

  function renderPalette(id, colors, avoid) {
    const palette = $('#' + id);
    if (!palette) return;
    palette.innerHTML = '';
    const colorMap = {
      'سفید': '#ffffff', 'مشکی': '#0a0a0f', 'قرمز': '#dc2626', 'آبی': '#2563eb',
      'سبز': '#16a34a', 'زرد': '#facc15', 'صورتی': '#ec4899', 'بنفش': '#9333ea',
      'نارنجی': '#f97316', 'قهوه‌ای': '#92400e', 'بژ': '#d6b48a', 'کرم': '#fef3c7',
      'طلایی': '#d4af37', 'نقره‌ای': '#c0c0c0', 'سرمه‌ای': '#1e3a8a',
      'زرشکی': '#7f1d1d', 'یاسی': '#c4b5fd', 'مرجانی': '#fb7185', 'هلویی': '#fdba74',
      'زیتونی': '#65a30d', 'فیروزه‌ای': '#06b6d4', 'سفید صدفی': '#fef3c7',
      'مسی': '#b87333', 'خردلی': '#ca8a04', 'شتری': '#c19a6b', 'آجری': '#9a3412',
      'آبی یاقوتی': '#1e40af'
    };
    colors.slice(0, 12).forEach(c => {
      const hex = colorMap[c] || guessColor(c);
      const sw = el('div', { class: 'ai-color-swatch' + (avoid ? ' avoid' : '') });
      sw.style.background = hex;
      sw.textContent = c;
      sw.title = c;
      palette.appendChild(sw);
    });
  }

  function guessColor(persian) {
    if (!persian) return '#888888';
    const map = {
      'قرمز': '#dc2626', 'آبی': '#2563eb', 'سبز': '#16a34a', 'زرد': '#facc15',
      'صورتی': '#ec4899', 'بنفش': '#9333ea', 'نارنجی': '#f97316',
      'قهوه‌ای': '#92400e', 'بژ': '#d6b48a', 'کرم': '#fef3c7',
      'سفید': '#ffffff', 'مشکی': '#0a0a0f', 'طلایی': '#d4af37',
      'نقره‌ای': '#c0c0c0', 'سرمه‌ای': '#1e3a8a'
    };
    for (const k in map) if (persian.includes(k)) return map[k];
    return '#888888';
  }

  function applyPhotoToProfile(analysis) {
    const user = window.DPUser?.me?.();
    if (!user) {
      showToast('⚠️ لطفاً اول وارد شوید', 'warning');
      return;
    }
    const profile = user.profile || {};
    const updates = {};
    if (analysis.skin) updates.skinTone = analysis.skin.tone;
    if (analysis.season) {
      updates.colorSeason = analysis.season.main;
      updates.subSeason = analysis.season.sub;
    }
    if (analysis.contrast) updates.contrast = analysis.contrast.level;
    if (analysis.profile) {
      Object.assign(updates, analysis.profile);
    }
    if (window.DPUser?.updateProfile) {
      window.DPUser.updateProfile(updates);
      showToast('✅ پروفایل شما با موفقیت به‌روزرسانی شد', 'success');
    } else {
      showToast('⚠️ خطا در به‌روزرسانی', 'error');
    }
  }

  function getPhotoBasedProducts(analysis) {
    showToast('🛍️ در حال یافتن محصولات مناسب...', 'info');
    setTimeout(() => {
      // Navigate to product page with filter
      window.location.href = 'index.html?photo=1&season=' + encodeURIComponent(analysis.season?.main || '');
    }, 600);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 AI Dashboard - DNA سلیقه
  // ═══════════════════════════════════════════════════════════════
  function renderTasteDNA(container) {
    if (!window.DPTasteEngine) return;
    const user = window.DPUser?.me?.();
    const profile = user?.profile || {};

    const dna = window.DPTasteEngine.generateTasteDNA(profile);
    const quality = window.DPTasteEngine.tasteQualityScore(profile);
    const future = window.DPTasteEngine.predictFutureTaste(profile);

    const section = el('div', { class: 'ai-card ai-fade-in' });
    section.innerHTML = `
      <div class="ai-card-header">
        <h3 class="ai-card-title">
          <span class="ai-card-title-icon">🧬</span>
          DNA سلیقه شما
        </h3>
        <span class="ai-tag">${esc(dna.hash)}</span>
      </div>
      <p class="ai-card-subtitle">${esc(dna.typeLabel)}</p>

      <div class="ai-dna">
        ${renderDNAFeature('گرمی', dna.traits.warmth, '🔥')}
        ${renderDNAFeature('کلاسیک', dna.traits.classic, '👔')}
        ${renderDNAFeature('جسور', dna.traits.bold, '⚡')}
        ${renderDNAFeature('مینیمال', dna.traits.minimal, '✨')}
        ${renderDNAFeature('رمانتیک', dna.traits.romantic, '💕')}
      </div>

      <div class="ai-progress" title="کیفیت پروفایل">
        <div class="ai-progress-fill" style="width: ${quality}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--ai-text-3); margin-top: 4px;">
        <span>💎 کیفیت پروفایل</span>
        <span style="color: var(--ai-primary); font-weight: 700;">${quality}٪</span>
      </div>

      <div style="margin-top: 20px; padding: 16px; background: var(--ai-bg-3); border-radius: 12px; border: 1px solid var(--ai-border-2);">
        <div style="font-size: 13px; color: var(--ai-text-3); margin-bottom: 6px;">🔮 پیش‌بینی ترند آینده</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--ai-primary);">${esc(future.message)}</div>
      </div>
    `;
    container.appendChild(section);
  }

  function renderDNAFeature(label, value, icon) {
    return `
      <div class="ai-dna-bar">
        <div class="ai-dna-bar-label">${icon} ${esc(label)}</div>
        <div class="ai-dna-bar-value">${value}</div>
        <div class="ai-dna-bar-bg">
          <div class="ai-dna-bar-fill" style="width: ${value}%;"></div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 Match Ring - AI Match Score
  // ═══════════════════════════════════════════════════════════════
  function renderMatchRing(percent, level, label, color) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return `
      <div class="ai-match-ring">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f0c850"/>
              <stop offset="100%" stop-color="#a8862b"/>
            </linearGradient>
          </defs>
          <circle class="ai-match-ring-bg" cx="60" cy="60" r="${radius}"></circle>
          <circle class="ai-match-ring-fill" cx="60" cy="60" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"></circle>
        </svg>
        <div class="ai-match-ring-text">
          <div class="ai-match-ring-value" style="color: ${color};">${percent}٪</div>
          <div class="ai-match-ring-label">${esc(label)}</div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌍 Cultural Match
  // ═══════════════════════════════════════════════════════════════
  function renderCulturalMatch(container) {
    if (!window.DPTasteEngine) return;
    const user = window.DPUser?.me?.();
    const cultural = window.DPTasteEngine.culturalMatch(user?.profile || {});

    if (!cultural.city) return;

    const section = el('div', { class: 'ai-card ai-fade-in' });
    section.innerHTML = `
      <div class="ai-card-header">
        <h3 class="ai-card-title">
          <span class="ai-card-title-icon">🌍</span>
          تطابق فرهنگی-منطقه‌ای
        </h3>
        <span class="ai-tag">${esc(cultural.city)}</span>
      </div>
      <p class="ai-card-subtitle">منطقه ${esc(cultural.region)} - پیشنهاد بر اساس فرهنگ منطقه شما</p>

      <h4 style="margin: 16px 0 8px; color: var(--ai-success);">✅ سبک‌های پیشنهادی</h4>
      <div>
        ${(cultural.recommended || []).map(s => `<span class="ai-tag" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: var(--ai-success);">${esc(s)}</span>`).join('')}
      </div>

      ${(cultural.avoid && cultural.avoid.length) ? `
        <h4 style="margin: 16px 0 8px; color: var(--ai-error);">⚠️ سبک‌های نامناسب منطقه</h4>
        <div>
          ${cultural.avoid.map(s => `<span class="ai-tag" style="opacity:0.6;">${esc(s)}</span>`).join('')}
        </div>
      ` : ''}
    `;
    container.appendChild(section);
  }

  // ═══════════════════════════════════════════════════════════════
  // 👥 Similar Users
  // ═══════════════════════════════════════════════════════════════
  function renderSimilarUsers(container) {
    if (!window.DPTasteEngine) return;
    const user = window.DPUser?.me?.();
    const similar = window.DPTasteEngine.findSimilarUsers(user?.profile || {});

    if (!similar.length) return;

    const section = el('div', { class: 'ai-card ai-fade-in' });
    section.innerHTML = `
      <div class="ai-card-header">
        <h3 class="ai-card-title">
          <span class="ai-card-title-icon">👥</span>
          کاربران مشابه شما
        </h3>
      </div>
      <p class="ai-card-subtitle">کاربرانی که سلیقه‌ای شبیه به شما دارند</p>
      <div class="ai-stats-grid">
        ${similar.slice(0, 4).map(u => `
          <div class="ai-stat-card">
            <span class="ai-stat-card-icon">👤</span>
            <div class="ai-stat-card-value">${esc(u.name)}</div>
            <div class="ai-stat-card-label">${u.similarity}٪ مشابهت</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(section);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔔 Toast Notifications
  // ═══════════════════════════════════════════════════════════════
  function showToast(message, type = 'info') {
    let container = $('#aiToastContainer');
    if (!container) {
      container = el('div', { id: 'aiToastContainer' });
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      });
      document.body.appendChild(container);
    }
    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      info: 'linear-gradient(135deg, #d4af37, #a8862b)'
    };
    const toast = el('div', { class: 'ai-fade-in' });
    Object.assign(toast.style, {
      background: colors[type] || colors.info,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '700',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      minWidth: '200px'
    });
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 رندر کلی
  // ═══════════════════════════════════════════════════════════════
  function renderAll(targetContainer) {
    const root = targetContainer || $('#aiRoot');
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('ai-container', 'ai-fade-in');

    // Hero
    const hero = el('div', { class: 'ai-hero' });
    hero.innerHTML = `
      <div class="ai-hero-content">
        <h1 class="ai-hero-title">✨ هوش مصنوعی دیجی‌پوش</h1>
        <p class="ai-hero-subtitle">موتور هوشمند با ۱۱۰ فاکتور، ۷ الگوریتم ML، و ۲۰ لایه تحلیل عکس - استایل شما را به دقت می‌فهمد</p>
        <div class="ai-hero-stats">
          <div class="ai-stat"><div class="ai-stat-value">۱۱۰+</div><div class="ai-stat-label">فاکتور</div></div>
          <div class="ai-stat"><div class="ai-stat-value">۷</div><div class="ai-stat-label">الگوریتم ML</div></div>
          <div class="ai-stat"><div class="ai-stat-value">۲۰</div><div class="ai-stat-label">لایه عکس</div></div>
          <div class="ai-stat"><div class="ai-stat-value">۴۸</div><div class="ai-stat-label">ماه ترند</div></div>
          <div class="ai-stat"><div class="ai-stat-value">۳۵۰۰</div><div class="ai-stat-label">سلول رنگ</div></div>
        </div>
      </div>
    `;
    root.appendChild(hero);

    // Photo Analysis
    renderPhotoAnalysisSection(root);

    // DNA
    renderTasteDNA(root);

    // Cultural Match
    renderCulturalMatch(root);

    // Similar Users
    renderSimilarUsers(root);
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 خروجی
  // ═══════════════════════════════════════════════════════════════
  window.DPAIUI = {
    version: '8.1 MAX UI',
    renderAll,
    renderPhotoAnalysisSection,
    renderTasteDNA,
    renderCulturalMatch,
    renderSimilarUsers,
    renderMatchRing,
    showToast,
    handlePhotoFile,
    applyPhotoToProfile
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const root = $('#aiRoot');
      if (root) renderAll(root);
    });
  } else {
    setTimeout(() => {
      const root = $('#aiRoot');
      if (root) renderAll(root);
    }, 100);
  }

  console.log('🎨 DPAI UI v8.1 MAX loaded — Modern AI Interface');
})();
