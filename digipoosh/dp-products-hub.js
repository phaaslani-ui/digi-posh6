/* ═══════════════════════════════════════════════════════════════════
 * 🏛️ DP Products Hub v18.0 — منبع حقیقت واحد محصولات
 * ------------------------------------------------------------------
 * معماری جدید: یک hub مرکزی برای همه محصولات
 *
 * ✅ منبع حقیقت: سرور (همیشه اولویت با سرور)
 * ✅ Real-time: EventEmitter داخلی + BroadcastChannel + Storage
 * ✅ Zero Hardcode: محصول SAMPLE/demo/test فیلتر میشه
 * ✅ Self-healing: اگه خراب بشه، خودش درست می‌کنه
 * ✅ Single API: همه صفحات فقط از hub می‌گیرن
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPProductsHub) return;

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ تنظیمات
  // ═══════════════════════════════════════════════════════════════
  const CONFIG = {
    SERVER_URL: 'http://localhost:8001',
    STORAGE_KEY: 'dp_products',
    VERSION_KEY: 'dp_hub_version',
    HUB_VERSION: 'v18.0',
    SYNC_INTERVAL: 30000, // هر ۳۰ ثانیه
    REQUEST_TIMEOUT: 5000
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎯 Event Emitter ساده
  // ═══════════════════════════════════════════════════════════════
  class EventEmitter {
    constructor() {
      this.listeners = {};
    }
    on(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }
    off(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }
    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(fn => {
        try { fn(data); } catch (e) { console.error('Listener error:', e); }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛡️ Validator — فیلتر محصول الکی
  // ═══════════════════════════════════════════════════════════════
  const VALIDATOR = {
    isValidId(id) {
      if (!id) return false;
      const s = String(id);
      // ID های SAMPLE/demo/test باید رد بشن
      if (s.match(/^(p|sample|demo|test|t|item|prod|fake)/i) && !s.startsWith('sp')) return false;
      return true;
    },
    isValidName(name) {
      if (!name || typeof name !== 'string') return false;
      // نام‌های hardcode معروف
      const fakeNames = [
        'پیراهن قرمز مجلسی', 'پیراهن آبی کلاسیک', 'تیشرت سفید ساده',
        'شلوار مشکی ساده', 'کفش ساده', 'پیراهن سبز'
      ];
      return !fakeNames.includes(name.trim());
    },
    isValidProduct(p) {
      return p && 
             this.isValidId(p.id) && 
             this.isValidName(p.name) && 
             p.price && p.price > 0;
    },
    clean(products) {
      if (!Array.isArray(products)) return [];
      // حذف نامعتبر + حذف تکراری بر اساس ID
      const seen = new Set();
      return products.filter(p => {
        if (!this.isValidProduct(p)) return false;
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📡 Server API — ارتباط با سرور
  // ═══════════════════════════════════════════════════════════════
  const API = {
    async fetch() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        const res = await fetch(CONFIG.SERVER_URL + '/api/products', {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    },
    async push(products) {
      try {
        const res = await fetch(CONFIG.SERVER_URL + '/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products })
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 💾 Storage — localStorage با cache
  // ═══════════════════════════════════════════════════════════════
  const Storage = {
    read() {
      try {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },
    write(products) {
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(products));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch (e) {}
    },
    isVersionCurrent() {
      return localStorage.getItem(CONFIG.VERSION_KEY) === CONFIG.HUB_VERSION;
    },
    setVersion() {
      try { localStorage.setItem(CONFIG.VERSION_KEY, CONFIG.HUB_VERSION); } catch (e) {}
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🏛️ Hub اصلی
  // ═══════════════════════════════════════════════════════════════
  const emitter = new EventEmitter();
  let products = [];
  let isSyncing = false;
  let lastSyncTime = 0;

  const Hub = {
    // ── API عمومی ──
    
    /** دریافت همه محصولات (از cache محلی) */
    all() {
      return [...products];
    },

    /** دریافت همه محصولات (از سرور - همیشه تازه‌ترین) */
    async fetch() {
      return await sync(true);
    },

    /** پیدا کردن محصول با ID */
    find(id) {
      return products.find(p => p.id === id);
    },

    /** فیلتر بر اساس category */
    byCategory(category) {
      return products.filter(p => p.category === category);
    },

    /** افزودن محصول جدید */
    async add(product) {
      if (!VALIDATOR.isValidProduct(product)) {
        console.error('❌ محصول نامعتبر:', product);
        return false;
      }
      
      products.push(product);
      Storage.write(products);
      
      // push به سرور
      const success = await API.push(products);
      
      // broadcast
      emitter.emit('changed', { type: 'add', product, products: [...products] });
      broadcast('add', product);
      
      return success;
    },

    /** حذف محصول */
    async remove(id) {
      const before = products.length;
      products = products.filter(p => p.id !== id);
      
      if (products.length === before) return false;
      
      Storage.write(products);
      await API.push(products);
      
      emitter.emit('changed', { type: 'remove', id, products: [...products] });
      broadcast('remove', { id });
      
      return true;
    },

    /** ویرایش محصول */
    async update(id, patch) {
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return false;
      
      products[idx] = { ...products[idx], ...patch };
      Storage.write(products);
      await API.push(products);
      
      emitter.emit('changed', { type: 'update', id, patch, products: [...products] });
      broadcast('update', { id, patch });
      
      return true;
    },

    /** sync دستی از سرور */
    async sync(force = false) {
      return await sync(force);
    },

    /** listener برای تغییرات */
    onChange(callback) {
      emitter.on('changed', callback);
    },

    /** آمار */
    stats() {
      const ids = products.map(p => p.id);
      return {
        total: products.length,
        unique: new Set(ids).size,
        duplicates: ids.length - new Set(ids).size,
        lastSync: lastSyncTime,
        isValidVersion: Storage.isVersionCurrent()
      };
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔄 Sync Engine
  // ═══════════════════════════════════════════════════════════════
  async function sync(force = false) {
    if (isSyncing) return products;
    
    const now = Date.now();
    if (!force && now - lastSyncTime < 5000) {
      // اگه کمتر از ۵ ثانیه از آخرین sync گذشته، skip
      return products;
    }
    
    isSyncing = true;
    
    try {
      // ۱) اول از سرور بگیر (منبع حقیقت)
      const serverProducts = await API.fetch();
      
      if (Array.isArray(serverProducts) && serverProducts.length > 0) {
        // تمیز کردن + فیلتر SAMPLE
        const cleaned = VALIDATOR.clean(serverProducts);
        
        if (cleaned.length > 0) {
          products = cleaned;
          Storage.write(products);
          Storage.setVersion();
          lastSyncTime = now;
          
          emitter.emit('synced', { source: 'server', count: products.length });
          return products;
        }
      }
      
      // ۲) fallback: از localStorage
      const local = Storage.read();
      const cleaned = VALIDATOR.clean(local);
      
      if (cleaned.length > 0) {
        products = cleaned;
        lastSyncTime = now;
        return products;
      }
      
      // ۳) empty state
      products = [];
      lastSyncTime = now;
      return products;
      
    } catch (e) {
      console.error('❌ Sync error:', e);
      emitter.emit('sync-error', { error: e.message });
      return products;
    } finally {
      isSyncing = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📡 Broadcast — همگام‌سازی بین tabs
  // ═══════════════════════════════════════════════════════════════
  function broadcast(type, data) {
    try {
      const ch = new BroadcastChannel('dp_hub_channel');
      ch.postMessage({ type, data, timestamp: Date.now() });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}
    
    // همچنین CustomEvent برای همین tab
    try {
      window.dispatchEvent(new CustomEvent('dp-hub:changed', { detail: { type, data } }));
    } catch (e) {}
  }

  // listener برای BroadcastChannel
  if (window.BroadcastChannel) {
    try {
      const ch = new BroadcastChannel('dp_hub_channel');
      ch.addEventListener('message', (e) => {
        if (!e.data || !e.data.type) return;
        // وقتی سایر tabs محصول تغییر دادن، sync کن
        sync(true);
      });
    } catch (e) {}
  }

  // listener برای storage event (fallback)
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG.STORAGE_KEY) {
      sync(true);
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی اولیه
  // ═══════════════════════════════════════════════════════════════
  
  // ۱) self-healing: اگه نسخه قدیمی هست، پاک کن
  if (!Storage.isVersionCurrent()) {
    console.log('🧹 Hub: نسخه قدیمی شناسایی شد - پاکسازی...');
    Storage.clear();
    Storage.setVersion();
  }

  // ۲) sync فوری در ابتدا
  (async function init() {
    // ۱) ابتدا از local بخون (برای سرعت)
    const local = Storage.read();
    products = VALIDATOR.clean(local);
    
    // ۲) سپس از سرور sync کن (blocking)
    await sync(true);
    
    console.log(`✅ DP Products Hub v18.0: ${products.length} محصول لود شد`);
    emitter.emit('ready', { products: [...products] });
  })();

  // ۳) sync دوره‌ای
  setInterval(() => sync(false), CONFIG.SYNC_INTERVAL);

  // ═══════════════════════════════════════════════════════════════
  // 📤 Export
  // ═══════════════════════════════════════════════════════════════
  window.DPProductsHub = Hub;
  
  // backward compatibility — کد قدیمی نشکنه
  window.DPProducts = Object.assign(window.DPProducts || {}, {
    all: () => Hub.all(),
    allAsync: () => Hub.fetch(),
    find: (id) => Hub.find(id),
    byCategory: (cat) => Hub.byCategory(cat),
    syncFromServer: () => Hub.sync(true)
  });

  console.log('🏛️ DP Products Hub v18.0 initialized');
})();
