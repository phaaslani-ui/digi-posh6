/**
 * 🎨 dp-theme-builder.js v2.0 — تم‌سازی حساب کاربری (بازنویسی کامل)
 * ------------------------------------------------------------------
 * • کاربر می‌تونه رنگ متن، رنگ باکس و ... رو عوض کنه
 * • فقط برای صفحه پروفایل (نه کل سایت)
 * • پیش‌نمایش زنده
 * • ذخیره و بازیابی خودکار
 */

(function() {
  'use strict';
  if (window.DPThemeBuilderLoaded) return;
  window.DPThemeBuilderLoaded = true;

  const STORAGE_KEY = 'dp_profile_theme_v1';

  // ═══════════════════════════════════════════════════════════════
  // 🎨 تم‌های از پیش تعریف‌شده
  // ═══════════════════════════════════════════════════════════════
  const PRESET_THEMES = {
    default: {
      name: 'پیش‌فرض',
      textColor: '#1f2937',
      textSoftColor: '#6b7280',
      boxBg: '#ffffff',
      boxBorder: '#e5e7eb',
      boxShadow: 'rgba(0, 0, 0, 0.05)',
      accentColor: '#d4af37',
      heroBg: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))',
      cardBg: '#ffffff',
    },
    ocean: {
      name: 'اقیانوس',
      textColor: '#0c4a6e',
      textSoftColor: '#0369a1',
      boxBg: '#f0f9ff',
      boxBorder: '#bae6fd',
      boxShadow: 'rgba(14, 165, 233, 0.15)',
      accentColor: '#0ea5e9',
      heroBg: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(14,165,233,0.06))',
      cardBg: '#ffffff',
    },
    forest: {
      name: 'جنگل',
      textColor: '#14532d',
      textSoftColor: '#166534',
      boxBg: '#f0fdf4',
      boxBorder: '#bbf7d0',
      boxShadow: 'rgba(34, 197, 94, 0.15)',
      accentColor: '#16a34a',
      heroBg: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))',
      cardBg: '#ffffff',
    },
    sunset: {
      name: 'غروب',
      textColor: '#7c2d12',
      textSoftColor: '#9a3412',
      boxBg: '#fff7ed',
      boxBorder: '#fed7aa',
      boxShadow: 'rgba(249, 115, 22, 0.15)',
      accentColor: '#f97316',
      heroBg: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))',
      cardBg: '#ffffff',
    },
    rose: {
      name: 'گل رز',
      textColor: '#831843',
      textSoftColor: '#9d174d',
      boxBg: '#fdf2f8',
      boxBorder: '#fbcfe8',
      boxShadow: 'rgba(236, 72, 153, 0.15)',
      accentColor: '#ec4899',
      heroBg: 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(236,72,153,0.06))',
      cardBg: '#ffffff',
    },
    royal: {
      name: 'سلطنتی',
      textColor: '#1e1b4b',
      textSoftColor: '#4338ca',
      boxBg: '#eef2ff',
      boxBorder: '#c7d2fe',
      boxShadow: 'rgba(99, 102, 241, 0.15)',
      accentColor: '#6366f1',
      heroBg: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06))',
      cardBg: '#ffffff',
    },
    dark: {
      name: 'تیره',
      textColor: '#e5e7eb',
      textSoftColor: '#9ca3af',
      boxBg: '#1f2937',
      boxBorder: '#374151',
      boxShadow: 'rgba(0, 0, 0, 0.3)',
      accentColor: '#fbbf24',
      heroBg: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(0,0,0,0.4))',
      cardBg: '#111827',
    },
    minimal: {
      name: 'مینیمال',
      textColor: '#000000',
      textSoftColor: '#525252',
      boxBg: '#ffffff',
      boxBorder: '#e5e5e5',
      boxShadow: 'rgba(0, 0, 0, 0.04)',
      accentColor: '#000000',
      heroBg: 'linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02))',
      cardBg: '#fafafa',
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // 💾 ذخیره و بارگذاری
  // ═══════════════════════════════════════════════════════════════
  function loadTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.preset || parsed.custom)) return parsed;
      }
    } catch (e) {
      console.warn('loadTheme error:', e);
    }
    return { preset: 'default', custom: null };
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
      console.log('✅ تم ذخیره شد:', theme);
      return true;
    } catch (e) {
      console.error('❌ saveTheme error:', e);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 اعمال تم
  // ═══════════════════════════════════════════════════════════════
  function applyTheme(theme) {
    if (typeof theme === 'string') {
      theme = { preset: theme, custom: null };
    }
    if (!theme || typeof theme !== 'object') {
      theme = { preset: 'default', custom: null };
    }

    // گرفتن تنظیمات نهایی
    let config;
    if (theme.custom) {
      config = theme.custom;
    } else if (PRESET_THEMES[theme.preset]) {
      config = PRESET_THEMES[theme.preset];
    } else {
      config = PRESET_THEMES.default;
    }

    // فقط روی پروفایل اعمال بشه
    const profileRoot = document.querySelector('[data-profile-root]') 
                     || document.querySelector('.prof-page') 
                     || document.querySelector('.prof-main') 
                     || document.body;
    const scope = profileRoot;

    // تزریق CSS variables به root
    scope.style.setProperty('--prof-text', config.textColor);
    scope.style.setProperty('--prof-text-soft', config.textSoftColor);
    scope.style.setProperty('--prof-box-bg', config.boxBg);
    scope.style.setProperty('--prof-box-border', config.boxBorder);
    scope.style.setProperty('--prof-box-shadow', '0 2px 8px ' + config.boxShadow);
    scope.style.setProperty('--prof-accent', config.accentColor);
    scope.style.setProperty('--prof-hero-bg', config.heroBg);
    scope.style.setProperty('--prof-card-bg', config.cardBg);

    // اضافه کردن کلاس تم به body برای CSS scoping
    const themeName = theme.custom ? 'custom' : (theme.preset || 'default');
    document.body.dataset.profileTheme = themeName;

    console.log('🎨 تم اعمال شد:', themeName, config);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🖼️ رندر Theme Builder
  // ═══════════════════════════════════════════════════════════════
  function renderBuilder() {
    const container = document.getElementById('themeBuilderContainer');
    if (!container) {
      console.warn('⚠️ themeBuilderContainer پیدا نشد');
      return;
    }

    const current = loadTheme();
    const activeConfig = current.custom || PRESET_THEMES[current.preset] || PRESET_THEMES.default;

    container.innerHTML = `
      <div class="theme-builder-layout">
        <!-- پنل تنظیمات -->
        <div class="theme-builder-controls">
          <div class="theme-builder-section">
            <h3>🎨 تم‌های آماده</h3>
            <div class="theme-preset-grid">
              ${Object.entries(PRESET_THEMES).map(([key, theme]) => {
                const isActive = !current.custom && current.preset === key;
                return `
                  <button type="button" class="theme-preset-btn ${isActive ? 'is-on' : ''}" data-preset="${key}">
                    <div class="theme-preset-preview" style="background:${theme.heroBg}">
                      <div class="theme-preset-color" style="background:${theme.accentColor}"></div>
                      <div class="theme-preset-color" style="background:${theme.textColor}"></div>
                      <div class="theme-preset-color" style="background:${theme.boxBorder}"></div>
                    </div>
                    <div class="theme-preset-name">${theme.name}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="theme-builder-section">
            <h3>🖌️ سفارشی‌سازی رنگ</h3>
            <p style="font-size:12px;color:var(--prof-text-soft);margin:0 0 12px">
              تغییرات شما فوری در پیش‌نمایش اعمال می‌شود. برای دائمی شدن، دکمه «ذخیره» را بزنید.
            </p>
            <div class="theme-color-grid">
              <label class="theme-color-input">
                <span>رنگ اصلی (متن)</span>
                <input type="color" data-theme-key="textColor" value="${activeConfig.textColor}" />
              </label>
              <label class="theme-color-input">
                <span>رنگ فرعی (متن کم‌رنگ)</span>
                <input type="color" data-theme-key="textSoftColor" value="${activeConfig.textSoftColor}" />
              </label>
              <label class="theme-color-input">
                <span>رنگ باکس</span>
                <input type="color" data-theme-key="boxBg" value="${activeConfig.boxBg}" />
              </label>
              <label class="theme-color-input">
                <span>رنگ حاشیه باکس</span>
                <input type="color" data-theme-key="boxBorder" value="${activeConfig.boxBorder}" />
              </label>
              <label class="theme-color-input">
                <span>رنگ تأکیدی (طلایی)</span>
                <input type="color" data-theme-key="accentColor" value="${activeConfig.accentColor}" />
              </label>
            </div>
          </div>

          <div class="theme-builder-actions">
            <button type="button" class="prof-btn prof-btn--ghost" id="themeResetBtn">↺ بازنشانی به پیش‌فرض</button>
            <button type="button" class="prof-btn" id="themeSaveBtn">💾 ذخیره تم</button>
          </div>
        </div>

        <!-- پنل پیش‌نمایش -->
        <div class="theme-builder-preview">
          <h3>👁️ پیش‌نمایش زنده</h3>
          <div class="theme-preview-card" id="themePreview">
            <div class="theme-preview-hero">
              <div class="theme-preview-avatar">👤</div>
              <div>
                <h4 style="margin:0">نام کاربر</h4>
                <p style="margin:4px 0 0;font-size:12px;opacity:0.7">email@example.com</p>
              </div>
            </div>
            <div class="theme-preview-body">
              <div class="theme-preview-title">✨ عنوان کارت نمونه</div>
              <div class="theme-preview-text">این یک متن نمونه برای نمایش رنگ متن است. باید خوانا و شیک باشد.</div>
              <div class="theme-preview-text-soft">این متن کم‌رنگ‌تر برای توضیحات فرعی استفاده می‌شود.</div>
              <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
                <button class="prof-btn prof-btn--sm">دکمه اصلی</button>
                <button class="prof-btn prof-btn--ghost prof-btn--sm">دکمه فرعی</button>
                <span style="padding:4px 10px;background:var(--prof-accent);color:#fff;border-radius:8px;font-size:12px">تگ تأکیدی</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setupBuilderEvents();
  }

  function setupBuilderEvents() {
    // 🆕 انتخاب preset
    document.querySelectorAll('.theme-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const preset = btn.dataset.preset;
        if (!preset || !PRESET_THEMES[preset]) return;
        
        console.log('🖱️ کلیک روی تم:', preset);
        const theme = { preset, custom: null };
        saveTheme(theme);
        applyTheme(theme);
        renderBuilder();
        
        if (window.showToast) showToast('✅ تم «' + PRESET_THEMES[preset].name + '» اعمال شد');
      });
    });

    // 🆕 تغییر رنگ سفارشی (real-time preview)
    document.querySelectorAll('.theme-color-input input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.themeKey;
        const value = e.target.value;
        if (!key || !value) return;
        
        let current = loadTheme();
        if (!current.custom) {
          // 🆕 کپی از preset فعلی
          const baseConfig = PRESET_THEMES[current.preset] || PRESET_THEMES.default;
          current.custom = { ...baseConfig };
        }
        current.custom[key] = value;
        
        // 🆕 ذخیره فوری + اعمال
        saveTheme(current);
        applyTheme(current);
      });
    });

    // 🆕 دکمه بازنشانی
    const resetBtn = document.getElementById('themeResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 بازنشانی تم');
        const theme = { preset: 'default', custom: null };
        saveTheme(theme);
        applyTheme(theme);
        renderBuilder();
        if (window.showToast) showToast('↺ تم به پیش‌فرض بازنشانی شد');
      });
    }

    // 🆕 دکمه ذخیره (فقط تأیید)
    const saveBtn = document.getElementById('themeSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = loadTheme();
        saveTheme(current);
        if (window.showToast) showToast('✅ تم شما ذخیره شد');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function init() {
    console.log('🚀 DPThemeBuilder.init() called');
    
    // اعمال تم فعلی
    const theme = loadTheme();
    applyTheme(theme);

    // رندر builder اگه container موجود باشه
    if (document.getElementById('themeBuilderContainer')) {
      renderBuilder();
      console.log('✅ Theme Builder rendered');
    } else {
      console.log('ℹ️ themeBuilderContainer not found, skipping render');
    }
  }

  // 🆕 وقتی tab theme فعال شد، builder رو render کن
  document.addEventListener('DOMContentLoaded', () => {
    // بررسی بعد از load
    setTimeout(() => {
      if (document.getElementById('themeBuilderContainer') && document.getElementById('sec-theme')) {
        if (document.getElementById('sec-theme').classList.contains('is-on')) {
          renderBuilder();
        }
      }
    }, 300);
  });

  // 🆕 MutationObserver: وقتی tab theme فعال شد، render کن
  const observer = new MutationObserver(() => {
    const sec = document.getElementById('sec-theme');
    if (sec && sec.classList.contains('is-on')) {
      const container = document.getElementById('themeBuilderContainer');
      if (container && !container.querySelector('.theme-builder-layout')) {
        console.log('🎨 sec-theme فعال شد، builder رندر می‌شود');
        renderBuilder();
      }
    }
  });

  // شروع observer بعد از load
  setTimeout(() => {
    const sec = document.getElementById('sec-theme');
    if (sec) {
      observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
    }
  }, 500);

  // ═══════════════════════════════════════════════════════════════
  // 📡 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPThemeBuilder = {
    load: loadTheme,
    save: saveTheme,
    apply: applyTheme,
    render: renderBuilder,
    init: init,
    getPresets: () => PRESET_THEMES,
  };

  console.log('🎨 DPThemeBuilder v2.0 loaded');
})();
