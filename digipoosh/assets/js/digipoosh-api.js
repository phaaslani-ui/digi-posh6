/* ============================================================
   دیجی‌پوش — کتابخانه‌ی اتصال فرانت‌اند به بک‌اند
   ------------------------------------------------------------
   استفاده: این خط را قبل از </body> در هر صفحه اضافه کنید:
   <script src="/assets/js/digipoosh-api.js"></script>

   سپس در کد خود از window.DP استفاده کنید:
   const { products } = await DP.products.list({ category: 'women' });
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- تنظیمات ---------- */
  const CONFIG = {
    // آدرس بک‌اند. در محیط توسعه: http://localhost:3000
    // در تولید: https://api.digipoosh.ir
    baseURL:
      global.DIGIPOOSH_API_URL ||
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://api.digipoosh.ir'),
    tokenKey: 'dp_token',
    userKey: 'dp_user',
  };

  /* ---------- مدیریت توکن ---------- */
  const store = {
    get token() {
      try { return localStorage.getItem(CONFIG.tokenKey); } catch { return null; }
    },
    set token(v) {
      try { v ? localStorage.setItem(CONFIG.tokenKey, v) : localStorage.removeItem(CONFIG.tokenKey); } catch {}
    },
    get user() {
      try { return JSON.parse(localStorage.getItem(CONFIG.userKey) || 'null'); } catch { return null; }
    },
    set user(v) {
      try { v ? localStorage.setItem(CONFIG.userKey, JSON.stringify(v)) : localStorage.removeItem(CONFIG.userKey); } catch {}
    },
    clear() { this.token = null; this.user = null; },
  };

  /* ---------- درخواست پایه ---------- */
  async function request(path, { method = 'GET', body, query, auth = false } = {}) {
    let url = CONFIG.baseURL + path;

    if (query) {
      const qs = new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (auth || store.token) {
      const t = store.token;
      if (t) headers.Authorization = `Bearer ${t}`;
    }

    let res, data;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      data = await res.json().catch(() => ({}));
    } catch (err) {
      throw new DPError('ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.', 0);
    }

    if (!res.ok || data.ok === false) {
      // توکن منقضی شده
      if (res.status === 401) store.clear();
      throw new DPError(data.error || 'خطایی رخ داد.', res.status, data);
    }
    return data;
  }

  class DPError extends Error {
    constructor(message, status = 400, payload = {}) {
      super(message);
      this.name = 'DPError';
      this.status = status;
      this.payload = payload;
    }
  }

  /* ---------- API ---------- */
  const DP = {
    config: CONFIG,
    store,
    DPError,

    /** آیا کاربر وارد شده؟ */
    isLoggedIn: () => !!store.token,
    /** کاربر فعلی از حافظه‌ی محلی */
    currentUser: () => store.user,

    /* ===== احراز هویت ===== */
    auth: {
      async register(payload) {
        return request('/api/auth/register', { method: 'POST', body: payload });
      },
      async login(email, password) {
        const data = await request('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        store.token = data.access_token;
        store.user = data.user;
        DP._emit('auth:login', data.user);
        return data;
      },
      async logout() {
        try { await request('/api/auth/logout', { method: 'POST', auth: true }); } catch {}
        store.clear();
        DP._emit('auth:logout');
      },
      async me() {
        const data = await request('/api/auth/me', { auth: true });
        store.user = data.user;
        return data;
      },
      async updateProfile(patch) {
        return request('/api/auth/me', { method: 'PATCH', body: patch, auth: true });
      },
    },

    /* ===== محصولات ===== */
    products: {
      list: (query = {}) => request('/api/products', { query }),
      get: (idOrSlug) => request(`/api/products/${idOrSlug}`),
      categories: () => request('/api/products/categories'),
    },

    /* ===== سبد خرید ===== */
    cart: {
      get: () => request('/api/cart', { auth: true }),
      add: (product_id, quantity = 1, size = null, color = null) =>
        request('/api/cart', { method: 'POST', body: { product_id, quantity, size, color }, auth: true }),
      update: (id, quantity) =>
        request(`/api/cart/${id}`, { method: 'PATCH', body: { quantity }, auth: true }),
      remove: (id) => request(`/api/cart/${id}`, { method: 'DELETE', auth: true }),
      clear: () => request('/api/cart', { method: 'DELETE', auth: true }),
    },

    /* ===== سفارش‌ها ===== */
    orders: {
      list: (query = {}) => request('/api/orders', { query, auth: true }),
      get: (id) => request(`/api/orders/${id}`, { auth: true }),
      create: (shipping) => request('/api/orders', { method: 'POST', body: shipping, auth: true }),
      cancel: (id) =>
        request(`/api/orders/${id}`, { method: 'PATCH', body: { action: 'cancel' }, auth: true }),
      checkout: (order_id, payment_ref) =>
        request('/api/orders/checkout', { method: 'POST', body: { order_id, payment_ref }, auth: true }),
    },

    /* ===== علاقه‌مندی ===== */
    wishlist: {
      list: () => request('/api/wishlist', { auth: true }),
      add: (product_id) => request('/api/wishlist', { method: 'POST', body: { product_id }, auth: true }),
      remove: (product_id) => request('/api/wishlist', { method: 'DELETE', body: { product_id }, auth: true }),
    },

    /* ===== نظرات ===== */
    reviews: {
      list: (product_id) => request('/api/reviews', { query: { product_id } }),
      create: (product_id, rating, comment) =>
        request('/api/reviews', { method: 'POST', body: { product_id, rating, comment }, auth: true }),
    },

    /* ===== اعلان‌ها ===== */
    notifications: {
      list: () => request('/api/notifications', { auth: true }),
      markRead: (id) => request('/api/notifications', { method: 'PATCH', body: { id }, auth: true }),
      markAllRead: () => request('/api/notifications', { method: 'PATCH', body: {}, auth: true }),
    },

    /* ===== پنل فروشنده ===== */
    seller: {
      register: (payload) => request('/api/seller/register', { method: 'POST', body: payload, auth: true }),
      profile: () => request('/api/seller/profile', { auth: true }),
      updateProfile: (patch) => request('/api/seller/profile', { method: 'PATCH', body: patch, auth: true }),
      products: (query = {}) => request('/api/seller/products', { query, auth: true }),
      addProduct: (p) => request('/api/seller/products', { method: 'POST', body: p, auth: true }),
      updateProduct: (id, p) =>
        request(`/api/seller/products/${id}`, { method: 'PATCH', body: p, auth: true }),
      deleteProduct: (id) => request(`/api/seller/products/${id}`, { method: 'DELETE', auth: true }),
      orders: (query = {}) => request('/api/seller/orders', { query, auth: true }),
      stats: () => request('/api/seller/stats', { auth: true }),
    },

    /* ===== پنل ادمین ===== */
    admin: {
      stats: () => request('/api/admin/stats', { auth: true }),
      sellers: (query = {}) => request('/api/admin/sellers', { query, auth: true }),
      setSellerStatus: (seller_id, status, reason) =>
        request('/api/admin/sellers', { method: 'PATCH', body: { seller_id, status, reason }, auth: true }),
      users: (query = {}) => request('/api/admin/users', { query, auth: true }),
      updateUser: (user_id, patch) =>
        request('/api/admin/users', { method: 'PATCH', body: { user_id, ...patch }, auth: true }),
      orders: (query = {}) => request('/api/admin/orders', { query, auth: true }),
      setOrderStatus: (order_id, status) =>
        request('/api/admin/orders', { method: 'PATCH', body: { order_id, status }, auth: true }),
      commissions: (query = {}) => request('/api/admin/commissions', { query, auth: true }),
      settle: (payload) =>
        request('/api/admin/commissions', { method: 'PATCH', body: payload, auth: true }),
      reviews: (query = {}) => request('/api/admin/reviews', { query, auth: true }),
      approveReview: (review_id, is_approved) =>
        request('/api/admin/reviews', { method: 'PATCH', body: { review_id, is_approved }, auth: true }),
    },

    /* ===== سلامت سرویس ===== */
    health: () => request('/api/health'),

    /* ---------- رویدادها ---------- */
    _listeners: {},
    on(event, fn) {
      (this._listeners[event] = this._listeners[event] || []).push(fn);
      return this;
    },
    _emit(event, payload) {
      (this._listeners[event] || []).forEach((fn) => {
        try { fn(payload); } catch (e) { console.error(e); }
      });
      document.dispatchEvent(new CustomEvent(event, { detail: payload }));
    },

    /* ---------- ابزارهای کمکی ---------- */
    utils: {
      /** تبدیل عدد به قالب فارسی با جداکننده */
      money(rials) {
        return Number(rials || 0).toLocaleString('fa-IR');
      },
      /** تبدiل اعداد لاتین به فارسی */
      toFa(v) {
        const d = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return String(v).replace(/\d/g, (x) => d[+x]);
      },
      /** تاریخ شمسی خوانا */
      date(iso) {
        try {
          return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric', month: 'long', day: 'numeric',
          }).format(new Date(iso));
        } catch { return iso; }
      },
      /** به‌روزرسانی خودکار شمارنده‌ی سبد در نوار بالا */
      async syncCartBadge(selector = '.nav-count, .badge, .count-m') {
        if (!DP.isLoggedIn()) return;
        try {
          const { count } = await DP.cart.get();
          document.querySelectorAll(selector).forEach((el) => {
            el.textContent = DP.utils.toFa(count);
          });
        } catch {}
      },
    },
  };

  global.DP = DP;
  global.DigiPoosh = DP; // نام جایگزین

  // همگام‌سازی خودکار سبد پس از بارگذاری صفحه
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DP.utils.syncCartBadge());
  } else {
    DP.utils.syncCartBadge();
  }
})(window);
