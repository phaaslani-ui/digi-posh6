/**
 * 🆕 dp-product-loader.js v2.0 — لودر محصولات واقعی (سرور-محور)
 * ------------------------------------------------------------------
 * • محصولات از سرور (data/products.json) لود میشن
 * • حتی با دانلود workspace یا مرورگر جدید، داده‌ها حفظ میشن
 * • اگه سرور در دسترس نبود، از فایل seed استفاده می‌کنه
 * • اگه محصول نبود، هیچی نشون نمیده
 */

(function() {
  'use strict';
  if (window.DPProductLoaderLoaded) return;
  window.DPProductLoaderLoaded = true;

  const SERVER_URL = 'http://localhost:8001';
  const STORAGE_KEY = 'dp_products';
  const VERSION_KEY = 'dp_seed_version';
  const SERVER_VERSION_KEY = 'dp_server_version';

  // 🆕 v17.1 — همگام‌سازی فوری در ابتدای لود (blocking)
  (function immediateSync() {
    try {
      // اگه قبلاً sync شده، skip
      const lastSync = parseInt(localStorage.getItem(SERVER_VERSION_KEY) || '0');
      const now = Date.now();
      // اگه بیش از 30 ثانیه از آخرین sync گذشته، دوباره sync کن
      if (now - lastSync > 30000) {
        fetch(SERVER_URL + '/api/products', { cache: 'no-store' })
          .then(res => res.ok ? res.json() : null)
          .then(serverProducts => {
            if (Array.isArray(serverProducts) && serverProducts.length > 0) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProducts));
              localStorage.setItem(SERVER_VERSION_KEY, now.toString());
            }
          })
          .catch(() => {});
      }
    } catch (e) {}
  })();


  /**
   * 🆕 دریافت محصولات از سرور
   */
  async function fetchFromServer() {
    try {
      const response = await fetch(SERVER_URL + '/api/products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Server error: ' + response.status);
      const products = await response.json();
      return Array.isArray(products) ? products : [];
    } catch (e) {
      console.warn('⚠️ سرور در دسترس نیست:', e.message);
      return null;
    }
  }

  /**
   * 🆕 ارسال محصولات به سرور (برای فروشنده‌ها)
   */
  async function pushToServer(products) {
    try {
      const response = await fetch(SERVER_URL + '/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      });
      return response.ok;
    } catch (e) {
      console.warn('⚠️ ذخیره در سرور ناموفق:', e.message);
      return false;
    }
  }

  /**
   * 🆕 دریافت فروشنده‌ها از سرور
   */
  async function fetchSellers() {
    try {
      const response = await fetch(SERVER_URL + '/api/sellers');
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  /**
   * 🆕 seed اولیه - اگه محصولی نیست، از فایل seed استفاده کن
   */
  function seedFromLocal() {
    try {
      if (window.DPSellerSeed && window.DPSellerSeed.sample) {
        const products = window.DPSellerSeed.sample;
        if (products.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
          localStorage.setItem(VERSION_KEY, 'v17.0');
          console.log('🌱 Seed محلی:', products.length, 'محصول');
          return products;
        }
      }
    } catch (e) {}
    return [];
  }

  /**
   * 🆕 همگام‌سازی با سرور - اگه سرور محصول بیشتری داشت، استفاده کن
   */
  async function syncWithServer() {
    const localProducts = getLocalProducts();
    const serverProducts = await fetchFromServer();

    // اگه سرور در دسترس نبود، از محلی استفاده کن
    if (serverProducts === null) {
      console.log('📦 استفاده از محصولات محلی:', localProducts.length);
      return localProducts;
    }

    // اگه سرور محصول داره، از اون استفاده کن
    if (serverProducts.length > 0) {
      console.log('✅ محصولات از سرور:', serverProducts.length, 'محصول');
      // ذخیره در localStorage برای دسترسی سریع
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProducts));
      localStorage.setItem(SERVER_VERSION_KEY, Date.now().toString());
      return serverProducts;
    }

    // اگه سرور خالی بود ولی محلی پر بود، آپلود کن
    if (localProducts.length > 0) {
      console.log('📤 آپلود محصولات محلی به سرور...');
      await pushToServer(localProducts);
      return localProducts;
    }

    // اگه هیچ‌جا محصول نیست، seed کن
    return seedFromLocal();
  }

  /**
   * 🆕 دریافت محصولات از localStorage
   */
  function getLocalProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const all = JSON.parse(raw);
      if (!Array.isArray(all)) return [];
      return all.filter(p =>
        p && p.id && p.name && p.price > 0 &&
        (p.status === 'active' || p.status === undefined) &&
        (p.stock === undefined || p.stock > 0)
      );
    } catch (e) {
      return [];
    }
  }

  /**
   * 🆕 listener برای تغییرات محصولات
   */
  function watchProducts(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        callback(getLocalProducts());
      }
    });
    
    try {
      const channel = new BroadcastChannel('dp_products_channel');
      channel.onmessage = (e) => {
        if (e.data.type === 'products_updated') {
          callback(getLocalProducts());
        }
      };
      return () => channel.close();
    } catch (e) {}
  }

  /**
   * 🆕 وقتی محصول اضافه شد، به سرور و محلی broadcast کن
   */
  async function notifyProductsChanged() {
    const products = getLocalProducts();
    await pushToServer(products);
    
    try {
      const channel = new BroadcastChannel('dp_products_channel');
      channel.postMessage({ type: 'products_updated', timestamp: Date.now() });
      setTimeout(() => channel.close(), 100);
    } catch (e) {}
    
    window.dispatchEvent(new CustomEvent('dp:products-changed', {
      detail: { products }
    }));
  }

  /**
   * 🆕 placeholder حرفه‌ای
   */
  function renderEmpty(container, options) {
    options = options || {};
    if (!container) return;
    
    const isLoggedIn = !!(window.DPAuth && window.DPAuth.currentUser && window.DPAuth.currentUser());
    
    container.innerHTML = `
      <div class="dp-prod-empty" style="
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02));
        border: 2px dashed #d4af37;
        border-radius: 16px;
        margin: 20px 0;
      ">
        <div style="font-size: 64px; margin-bottom: 16px;">🛍️</div>
        <h3 style="margin: 0 0 8px; color: #1f2937; font-size: 20px;">${options.title || 'هنوز محصولی ثبت نشده'}</h3>
        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
          ${options.message || 'وقتی فروشنده‌ها محصول اضافه کنن، اینجا نمایش داده میشه.'}
        </p>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          ${options.showSellerButton !== false ? `
            <a href="./seller/seller-signup.html" style="
              padding: 10px 20px;
              background: linear-gradient(135deg, #d4af37, #b8961f);
              color: #fff;
              border-radius: 10px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
            ">🏪 ثبت‌نام فروشنده</a>
          ` : ''}
          ${!isLoggedIn && options.showAuthButton !== false ? `
            <a href="./auth.html" style="
              padding: 10px 20px;
              background: transparent;
              border: 2px solid #d4af37;
              color: #d4af37;
              border-radius: 10px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
            ">👤 ورود / ثبت‌نام</a>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 Auto-init
  // ═══════════════════════════════════════════════════════════════
  
  // وقتی DOM آماده شد، sync با سرور کن
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await syncWithServer();
      window.dispatchEvent(new CustomEvent('dp:products-ready', {
        detail: { products: getLocalProducts() }
      }));
    });
  } else {
    // اگه DOM آماده است
    syncWithServer().then(() => {
      window.dispatchEvent(new CustomEvent('dp:products-ready', {
        detail: { products: getLocalProducts() }
      }));
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📡 API
  // ═══════════════════════════════════════════════════════════════
  window.DPProductLoader = {
    fetchFromServer,
    pushToServer,
    fetchSellers,
    syncWithServer,
    getLocalProducts,
    getRealProducts: getLocalProducts,
    watchProducts,
    notifyProductsChanged,
    renderEmpty,
    SERVER_URL
  };

  console.log('🛍️ DPProductLoader v2.0 loaded (server-aware)');
})();
