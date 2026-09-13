/**
 * 🧭 dp-navbar.js v1.0 — منوی استاندارد دیجی‌پوش
 * ------------------------------------------------------------------
 * • منوی هماهنگ با cart.html, woman/index.html و سایر صفحات
 * • شامل: سبد خرید (drawer) + حساب کاربری + باشگاه
 * • SVG های حرفه‌ای و مینیمال
 */

(function() {
  'use strict';
  if (window.DPNavbarLoaded) return;
  window.DPNavbarLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🔧 کمک‌کننده‌ها
  // ═══════════════════════════════════════════════════════════════

  function getUser() {
    try {
      return window.DPAuth && window.DPAuth.currentUser ? window.DPAuth.currentUser() : null;
    } catch (e) { return null; }
  }

  function getCartCount() {
    try {
      const data = JSON.parse(localStorage.getItem('dp_cart') || '{}');
      if (data.items) {
        return data.items.reduce((s, it) => s + (it.qty || 1), 0);
      }
      const rows = data.rows || data;
      if (Array.isArray(rows)) {
        return rows.reduce((s, r) => s + (r.qty || r.quantity || 1), 0);
      }
      return data.count || 0;
    } catch (e) { return 0; }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏗️ ساخت منو
  // ═══════════════════════════════════════════════════════════════

  function buildNavbar() {
    // اگه منوی استاندارد قبلاً ساخته شده
    if (document.querySelector('.dp-unified-navbar')) return;

    const header = document.createElement('header');
    header.className = 'dp-unified-navbar sh';
    header.innerHTML = `
      <nav class="sh-bar gold-border" aria-label="ناوبری اصلی">
        <a class="sh-logo" href="./index.html">
          <span class="sh-mark">د</span>
          <span class="sh-stack">
            <strong>دیجی‌پوش</strong>
            <small>بازارگاه ممتاز فروشندگان مد</small>
          </span>
        </a>

        <ul class="sh-menu">
          <li><a href="./index.html">صفحه اصلی</a></li>
          <li><a href="./woman/index.html">زنانه</a></li>
          <li><a href="./man/index.html">مردانه</a></li>
          <li><a href="./kids/index.html">بچگانه</a></li>
          <li><a href="./teen/index.html">تینیجر</a></li>
          <li>
            <a href="./club.html" class="dp-nav-club" aria-label="باشگاه مشتریان">
              <svg class="dp-nav-club-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 3h12l4 6-10 13L2 9z"/>
                <path d="M2 9h20"/>
                <path d="M12 22L6 9"/>
                <path d="M12 22l6-13"/>
              </svg>
              <span>باشگاه</span>
            </a>
          </li>
          <li><a class="sh-ai" href="./digiai.html">دیجی AI</a></li>
          <li class="has-sub">
            <a href="./index.html#featured-sellers">فروشندگان
              <svg class="sub-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg>
            </a>
            <ul class="submenu">
              <li><a href="./index.html#featured-sellers">فروشندگان برتر</a></li>
              <li><a href="./seller/seller-login.html">ورود فروشندگان</a></li>
              <li><a href="./seller/seller-signup.html">ثبت‌نام فروشنده</a></li>
              <li><a href="./wholesale/index.html">بازار عمده‌فروشان</a></li>
            </ul>
          </li>
        </ul>

        <div class="sh-actions">
          <!-- دکمه سبد خرید (با drawer) -->
          <button class="sh-icon-btn dp-cart" data-dp-cart-open aria-label="سبد خرید" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8Z"/>
              <path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8"/>
            </svg>
            <span class="sh-icon-badge" id="dpCartCount"></span>
          </button>

          <!-- دکمه حساب کاربری -->
          <a class="sh-icon-btn" id="dpUserBtn" href="./auth.html" aria-label="حساب کاربری">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
            <span class="sh-user-name" id="dpUserName"></span>
          </a>
        </div>

        <!-- دکمه منو موبایل -->
        <button class="sh-burger" type="button" aria-label="منو">
          <span></span><span></span><span></span>
        </button>
      </nav>
    `;

    // قرار دادن منو قبل از main یا اول body
    const main = document.querySelector('main');
    if (main && main.parentNode) {
      main.parentNode.insertBefore(header, main);
    } else {
      document.body.insertBefore(header, document.body.firstChild);
    }

    // فعال کردن submenu در موبایل
    const burger = header.querySelector('.sh-burger');
    if (burger) {
      burger.addEventListener('click', () => {
        header.querySelector('.sh-menu').classList.toggle('is-open');
      });
    }

    // به‌روزرسانی UI
    updateAuth();
    updateCartCount();
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 به‌روزرسانی
  // ═══════════════════════════════════════════════════════════════

  function updateAuth() {
    const u = getUser();
    const btn = document.getElementById('dpUserBtn');
    const name = document.getElementById('dpUserName');
    if (!btn) return;

    if (u) {
      const firstName = (u.name || 'کاربر').split(' ')[0];
      btn.href = './profile.html';
      if (name) name.textContent = firstName;
      btn.classList.add('is-logged-in');
    } else {
      btn.href = './auth.html';
      if (name) name.textContent = '';
      btn.classList.remove('is-logged-in');
    }
  }

  function updateCartCount() {
    const badge = document.getElementById('dpCartCount');
    if (!badge) return;
    const count = getCartCount();
    badge.textContent = count > 0 ? count : '';
    badge.classList.toggle('is-on', count > 0);
  }

  // ═══════════════════════════════════════════════════════════════
  // 👂 گوش دادن به تغییرات
  // ═══════════════════════════════════════════════════════════════

  document.addEventListener('dp:cart', updateCartCount);
  window.addEventListener('storage', e => {
    if (e.key === 'dp_cart' || e.key === 'dp_user' || e.key === 'dp_current_user') {
      updateCartCount();
      updateAuth();
    }
  });

  // گوش دادن به event سفارشی signin/signup
  window.addEventListener('dp:auth', () => {
    updateAuth();
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚀 شروع
  // ═══════════════════════════════════════════════════════════════

  function init() {
    buildNavbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
