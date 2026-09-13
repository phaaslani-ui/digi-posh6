/* ============================================================
   دیجی‌پوش — لایه‌ی داده‌ی پنل مدیریت
   ------------------------------------------------------------
   مدیر می‌تواند فروشگاه‌ها را ببیند، تأیید یا رد کند،
   نرخ کمیسیون هر فروشنده را جدا تنظیم کند و آمار کل را ببیند.
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  const K = {
    users: 'dp_users',
    products: 'dp_products',
    orders: 'dp_orders',
    reviews: 'dp_reviews',
    adminPass: 'dp_admin_pass',
    adminSession: 'dp_admin_session',
    log: 'dp_admin_log',
  };

  /* رمز پیش‌فرض مدیریت — بعد از اولین ورود حتماً عوضش کنید */
  const DEFAULT_PASS = 'digipoosh1404';

  const read = (k, d) => {
    let v;
    try { v = JSON.parse(localStorage.getItem(k)); } catch { return d; }
    if (v == null) return d;
    /* داده‌ی خراب (مثلاً عدد به‌جای فهرست) سامانه را نمی‌شکند */
    if (Array.isArray(d)) {
      if (!Array.isArray(v)) return d;
      return v.filter((x) => x && typeof x === 'object');
    }
    return v;
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const nowFa = () => new Intl.DateTimeFormat('fa-IR').format(new Date());

  /* ============================================================
     هش رمز
     ------------------------------------------------------------
     `crypto.subtle` فقط روی HTTPS (یا localhost) در دسترس است.
     روی `file://` نیست. پیش‌تر در آن حالت به یک هش ۳۲بیتی
     خیلی ضعیف برمی‌گشتیم — دو مشکل داشت:

       ۱. امنیت: ۳۲ بیت در چند ثانیه شکسته می‌شود.
       ۲. قفل شدن حساب: اگر کاربر با `file://` ثبت‌نام می‌کرد و
          بعد سایت روی HTTPS می‌رفت، الگوریتم عوض می‌شد و
          رمز درستش دیگر کار نمی‌کرد.

     حالا هر هش با پیشوند روش خودش ذخیره می‌شود
     (`s2$...` یا `f1$...`) تا هنگام ورود همان روشی که
     ساخته شده دوباره اجرا شود. پشتیبان هم به FNV-1a
     ۱۲۸بیتی با ۱۰۰۰ دور تکرار ارتقا یافت.
     ============================================================ */
  var HASH_SALT = 'dpAdmin$';

  /** پشتیبان — FNV-1a چهارتایی، ۱۲۸ بیت، با کشش کلید */
  function weakHash(text) {
    var s = HASH_SALT + text;
    var a = 0x811c9dc5, b = 0x01000193, c = 0x9e3779b9, d = 0x85ebca6b;
    for (var round = 0; round < 1000; round++) {
      for (var i = 0; i < s.length; i++) {
        var ch = s.charCodeAt(i) ^ (round & 0xff);
        a = Math.imul(a ^ ch, 16777619) >>> 0;
        b = Math.imul(b + ch + a, 2246822519) >>> 0;
        c = Math.imul(c ^ (b >>> 13), 3266489917) >>> 0;
        d = Math.imul(d + (c ^ a), 668265263) >>> 0;
      }
      s = String(a) + String(b) + String(c) + String(d);
    }
    var hex = function (n) { return (n >>> 0).toString(16).padStart(8, '0'); };
    return 'f1$' + hex(a) + hex(b) + hex(c) + hex(d);
  }

  async function sha256(text) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        var buf = await crypto.subtle.digest('SHA-256',
          new TextEncoder().encode(HASH_SALT + text));
        return 's2$' + Array.from(new Uint8Array(buf))
          .map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
      } catch (e) { /* در بعضی مرورگرها روی http شکست می‌خورد */ }
    }
    return weakHash(text);
  }

  /**
   * سنجش رمز با هشِ ذخیره‌شده.
   * روشِ ساخت را از پیشوند می‌خواند تا حساب قفل نشود.
   */
  async function verifyHash(password, stored) {
    if (!stored) return false;
    var s = String(stored);

    if (s.indexOf('f1$') === 0) return weakHash(password) === s;

    if (s.indexOf('s2$') === 0) {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        return (await sha256(password)) === s;
      }
      return false;   /* بدون crypto نمی‌توان سنجید */
    }

    /* هش‌های نسل قدیم — بدون پیشوند */
    if (s.indexOf('x') === 0) {
      var h = 0, t = HASH_SALT + password;
      for (var i = 0; i < t.length; i++) { h = (h << 5) - h + t.charCodeAt(i); h |= 0; }
      return ('x' + Math.abs(h).toString(16)) === s;
    }

    /* SHA-256 بدون پیشوند */
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        var b2 = await crypto.subtle.digest('SHA-256',
          new TextEncoder().encode(HASH_SALT + password));
        return Array.from(new Uint8Array(b2))
          .map(function (x) { return x.toString(16).padStart(2, '0'); }).join('') === s;
      } catch (e) { return false; }
    }
    return false;
  }

  /* ---------- درخواست به Supabase ---------- */
  async function rest(path, opts = {}) {
    const base = CFG.supabaseUrl.replace(/\/$/, '');
    const res = await fetch(base + '/rest/v1/' + path, {
      ...opts,
      headers: {
        apikey: CFG.supabaseAnonKey,
        Authorization: 'Bearer ' + CFG.supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(opts.headers || {}),
      },
    });
    const txt = await res.text();
    const data = txt ? JSON.parse(txt) : null;
    if (!res.ok) throw new Error(data?.message || 'خطای سرور');
    return data;
  }

  /* ============================================================
     ورود مدیر
     ============================================================ */
  const auth = {
    /** آیا رمز هنوز پیش‌فرض است؟ (برای هشدار امنیتی) */
    isDefaultPass() { return !localStorage.getItem(K.adminPass); },

    async login(password) {
      const stored = localStorage.getItem(K.adminPass);
      const ok = stored
        ? await verifyHash(password, stored)
        : password === DEFAULT_PASS;

      if (!ok) throw new Error('رمز مدیریت نادرست است.');
      write(K.adminSession, { at: Date.now() });
      return true;
    },

    async changePass(oldPass, newPass) {
      await this.login(oldPass);           // اگر رمز فعلی غلط باشد، خطا می‌دهد
      if (String(newPass).length < 6) throw new Error('رمز تازه باید حداقل ۶ نویسه باشد.');
      localStorage.setItem(K.adminPass, await sha256(newPass));
      return true;
    },

    isLoggedIn() { return !!read(K.adminSession, null); },
    logout() { localStorage.removeItem(K.adminSession); },

    require(redirect = 'admin-login.html') {
      if (!this.isLoggedIn()) { location.replace(redirect); return false; }
      return true;
    },
  };

  /* ============================================================
     فروشگاه‌ها
     ============================================================ */
  const sellers = {
    async list() {
      if (REMOTE) {
        const rows = await rest('seller_profiles?select=*&order=created_at.desc').catch(() => []);
        const prods = await rest('products?select=seller_id,status').catch(() => []);
        return (rows || []).map((p) => ({
          id: p.user_id,
          storeName: p.shop_name || p.store_name,
          fullName: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
          category: p.category,
          city: p.city,
          address: p.address,
          description: p.description,
          nationalId: p.national_id,
          shaba: p.shaba_number || p.shaba,
          logo: p.logo_url || '',
          cover: p.cover_url || '',
          reviewRequested: !!p.review_requested,
          status: p.status || 'pending',
          rejectionReason: p.rejection_reason || '',
          commissionRate: Number(p.commission_rate ?? 10),
          sellerType: p.seller_type === 'wholesale' ? 'wholesale' : 'retail',
          companyName: p.company_name || '',
          economicCode: p.economic_code || '',
          regNumber: p.reg_number || '',
          warehouse: p.warehouse || '',
          minOrderValue: Number(p.min_order_value) || 0,
          leadTime: Number(p.lead_time) || 0,
          joinDate: p.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(p.created_at)) : '',
          productCount: prods.filter((x) => x.seller_id === p.user_id).length,
          activeCount: prods.filter((x) => x.seller_id === p.user_id && x.status === 'active').length,
        }));
      }

      const users = read(K.users, []);
      const products = read(K.products, []);
      const wProducts = read('dpw_products', []);
      return users
        .filter((u) => u.storeName)
        .map((u) => ({
          id: u.id,
          storeName: u.storeName,
          fullName: u.fullName || '',
          email: u.email,
          phone: u.phone || '',
          category: u.category,
          city: u.city,
          address: u.address,
          description: u.description,
          nationalId: u.nationalId,
          shaba: u.shaba,
          logo: u.logo || '',
          cover: u.cover || '',
          reviewRequested: !!u.reviewRequested,
          status: u.status || (u.isVerified ? 'approved' : 'pending'),
          rejectionReason: u.rejectionReason || '',
          commissionRate: Number(u.commissionRate ?? 10),
          joinDate: u.joinDate || '',

          /* نوع فروشنده — حساب‌های قدیمی «تک‌فروش» شمرده می‌شوند */
          sellerType: u.sellerType === 'wholesale' ? 'wholesale' : 'retail',
          companyName: u.companyName || '',
          economicCode: u.economicCode || '',
          regNumber: u.regNumber || '',
          warehouse: u.warehouse || '',
          minOrderValue: Number(u.minOrderValue) || 0,
          leadTime: Number(u.leadTime) || 0,

          /* شمارش کالا از انبار درست: تک‌فروش از dp_products،
             عمده‌فروش از dpw_products */
          productCount: (u.sellerType === 'wholesale' ? wProducts : products)
            .filter((p) => p.sellerId === u.id).length,
          activeCount: (u.sellerType === 'wholesale' ? wProducts : products)
            .filter((p) => p.sellerId === u.id && p.status === 'active').length,
        }))
        .reverse();
    },

    async get(id) { return (await this.list()).find((s) => s.id === id) || null; },

    /** تغییر وضعیت: approved | pending | rejected | suspended */
    async setStatus(id, status, reason = '') {
      if (REMOTE) {
        await rest(`seller_profiles?user_id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            rejection_reason: reason,
            review_requested: false,
            approved_at: status === 'approved' ? new Date().toISOString() : null,
          }),
        });
      } else {
        const users = read(K.users, []);
        const i = users.findIndex((u) => u.id === id);
        if (i < 0) throw new Error('فروشگاه پیدا نشد.');
        users[i].status = status;
        users[i].isVerified = status === 'approved';
        users[i].rejectionReason = reason;
        users[i].reviewRequested = false;   // پرونده بررسی شد
        write(K.users, users);
      }

      // با تأیید فروشگاه، پیش‌نویس‌هایش خودکار منتشر می‌شوند
      let published = 0;
      if (status === 'approved') published = await publishDrafts(id);

      // با تعلیق یا رد، محصولات فعالش از ویترین برداشته می‌شوند
      if (status === 'rejected' || status === 'suspended') await hideProducts(id);

      const LABEL = {
        approved: 'تأیید شد', rejected: 'رد شد',
        pending: 'به حالت انتظار برگشت', suspended: 'معلق شد',
      };
      const s = await this.get(id);
      log(`فروشگاه «${s?.storeName || id}» ${LABEL[status] || status}`
          + (reason ? ` — دلیل: ${reason}` : '')
          + (published ? ` — ${published} محصول منتشر شد` : ''));

      return { ok: true, published };
    },

    async setCommission(id, rate) {
      const r = Number(rate);
      if (!(r >= 0 && r <= 100)) throw new Error('نرخ کمیسیون باید بین ۰ تا ۱۰۰ باشد.');
      if (REMOTE) {
        await rest(`seller_profiles?user_id=eq.${id}`, {
          method: 'PATCH', body: JSON.stringify({ commission_rate: r }),
        });
      } else {
        const users = read(K.users, []);
        const i = users.findIndex((u) => u.id === id);
        if (i < 0) throw new Error('فروشگاه پیدا نشد.');
        users[i].commissionRate = r;
        write(K.users, users);
      }
      const s = await this.get(id);
      log(`نرخ کمیسیون «${s?.storeName || id}» به ${r}٪ تغییر کرد`);
      return true;
    },
  };

  /** پیش‌نویس‌های فروشگاه را منتشر می‌کند و تعدادشان را برمی‌گرداند */
  async function publishDrafts(sellerId) {
    if (REMOTE) {
      const rows = await rest(
        `products?seller_id=eq.${sellerId}&status=eq.draft&select=id,stock,wanted`
      ).catch(() => []);
      let n = 0;
      for (const r of rows || []) {
        const want = r.wanted || 'active';
        if (want === 'draft') continue;
        const st = Number(r.stock) === 0 && want === 'active' ? 'out_of_stock' : want;
        await rest(`products?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: st }) });
        n++;
      }
      return n;
    }

    const all = read(K.products, []);
    let n = 0;
    for (const p of all) {
      if (p.sellerId !== sellerId || p.status !== 'draft') continue;
      const want = p.wanted || 'active';
      if (want === 'draft') continue;    // فروشنده خودش پیش‌نویس خواسته
      p.status = Number(p.stock) === 0 && want === 'active' ? 'out_of_stock' : want;
      n++;
    }
    if (n) write(K.products, all);

    /*
     * انبار عمده‌فروش‌ها جداست (`dpw_products`).
     * اگر اینجا صدایش نزنیم، عمده‌فروشِ تازه‌تأییدشده کالاهایش
     * برای همیشه پیش‌نویس می‌ماند و هرگز در بازار دیده نمی‌شود.
     */
    n += publishWholesaleDrafts(sellerId);
    return n;
  }

  /** همان کار، برای انبار جداگانه‌ی عمده‌فروشی */
  function publishWholesaleDrafts(sellerId) {
    const all = read('dpw_products', []);
    let n = 0;
    for (const p of all) {
      if (p.sellerId !== sellerId || p.status !== 'draft') continue;
      if ((p.wanted || 'active') === 'draft') continue;
      p.status = 'active';
      n++;
    }
    if (n) write('dpw_products', all);
    return n;
  }

  /** با رد یا تعلیق، محصولات از ویترین برداشته می‌شوند */
  async function hideProducts(sellerId) {
    if (REMOTE) {
      await rest(`products?seller_id=eq.${sellerId}&status=neq.draft`, {
        method: 'PATCH', body: JSON.stringify({ status: 'draft' }),
      }).catch(() => {});
      return;
    }
    const all = read(K.products, []);
    let ch = false;
    for (const p of all) {
      if (p.sellerId !== sellerId || p.status === 'draft') continue;
      p.wanted = p.wanted || p.status;
      p.status = 'draft';
      ch = true;
    }
    if (ch) write(K.products, all);

    /* انبار عمده هم باید پنهان شود */
    const wAll = read('dpw_products', []);
    let wCh = false;
    for (const p of wAll) {
      if (p.sellerId !== sellerId || p.status === 'draft') continue;
      p.wanted = p.wanted || p.status;
      p.status = 'draft';
      wCh = true;
    }
    if (wCh) write('dpw_products', wAll);
  }

  /* ============================================================
     آمار کلی پلتفرم
     ============================================================ */
  async function stats() {
    const list = await sellers.list();
    const products = REMOTE
      ? (await rest('products?select=id,status').catch(() => []))
      : read(K.products, []);
    const orders = REMOTE
      ? (await rest('orders?select=id,total,status').catch(() => []))
      : read(K.orders, []);

    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((a, o) => a + (Number(o.total) || 0), 0);

    /* ---------- تفکیک تک‌فروش و عمده‌فروش ----------
       دو بازار جدا هستند: کالا، سفارش و نردبانشان هم جداست.
       مدیر باید هر کدام را جداگانه ببیند. */
    const retail = list.filter((s) => s.sellerType !== 'wholesale');
    const whole = list.filter((s) => s.sellerType === 'wholesale');

    const wProducts = read('dpw_products', []);
    const wOrders = read('dpw_orders', []);
    const wRfq = read('dpw_rfq', []);

    const wRevenue = wOrders
      .filter((o) => o.status !== 'canceled')
      .reduce((a, o) => a + (Number(o.total) || 0), 0);

    const byStatus = (arr, st) => arr.filter((s) => s.status === st).length;

    return {
      totalSellers: list.length,
      pending:   byStatus(list, 'pending'),
      approved:  byStatus(list, 'approved'),
      rejected:  byStatus(list, 'rejected'),
      suspended: byStatus(list, 'suspended'),
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === 'active').length,
      totalOrders: orders.length,
      revenue,

      /* تک‌فروشی */
      retail: {
        sellers: retail.length,
        pending: byStatus(retail, 'pending'),
        approved: byStatus(retail, 'approved'),
        rejected: byStatus(retail, 'rejected'),
        suspended: byStatus(retail, 'suspended'),
        products: products.length,
        activeProducts: products.filter((p) => p.status === 'active').length,
        orders: orders.length,
        revenue,
      },

      /* عمده‌فروشی */
      wholesale: {
        sellers: whole.length,
        pending: byStatus(whole, 'pending'),
        approved: byStatus(whole, 'approved'),
        rejected: byStatus(whole, 'rejected'),
        suspended: byStatus(whole, 'suspended'),
        products: wProducts.length,
        activeProducts: wProducts.filter((p) => p.status === 'active').length,
        orders: wOrders.length,
        revenue: wRevenue,
        rfq: wRfq.length,
        rfqOpen: wRfq.filter((r) => r.status === 'open').length,
        stockValue: wProducts.reduce(
          (a, p) => a + (Number(p.price) || 0) * (Number(p.stock) || 0), 0),
      },
    };
  }

  /* ============================================================
     داده‌ی بازار عمده — برای صفحه‌های مدیر
     ------------------------------------------------------------
     مدیر باید کالاها، سفارش‌ها، استعلام‌ها و نردبان عمده را
     ببیند. این‌ها در حافظه‌ی جدا (`dpw_*`) نگه داشته می‌شوند.
     ============================================================ */
  const wholesale = {
    /** کالاهای عمده با نام فروشنده */
    async products() {
      const list = await sellers.list();
      const byId = {};
      list.forEach((s) => { byId[s.id] = s; });
      return read('dpw_products', [])
        .map((p) => ({
          ...p,
          sellerName: byId[p.sellerId] ? byId[p.sellerId].storeName : '—',
          sellerStatus: byId[p.sellerId] ? byId[p.sellerId].status : 'unknown',
          lowest: (p.tiers && p.tiers.length)
            ? Math.min(...p.tiers.map((t) => Number(t.price) || p.price))
            : p.price,
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },

    /** سفارش‌های عمده */
    async orders() {
      const list = await sellers.list();
      const byId = {};
      list.forEach((s) => { byId[s.id] = s; });
      return read('dpw_orders', [])
        .map((o) => ({
          ...o,
          sellerName: byId[o.sellerId] ? byId[o.sellerId].storeName : '—',
        }))
        .sort((a, b) => (b.at || 0) - (a.at || 0));
    },

    /** استعلام‌ها */
    async rfq() {
      const list = await sellers.list();
      const byId = {};
      list.forEach((s) => { byId[s.id] = s; });
      return read('dpw_rfq', [])
        .map((r) => ({
          ...r,
          sellerName: byId[r.sellerId] ? byId[r.sellerId].storeName : '—',
        }))
        .sort((a, b) => (b.at || 0) - (a.at || 0));
    },

    /** بسته‌های نردبان بازار عمده */
    async boosts() {
      const list = await sellers.list();
      const byId = {};
      list.forEach((s) => { byId[s.id] = s; });
      return read('dpw_boosts', [])
        .map((b) => ({
          ...b,
          sellerName: byId[b.sellerId] ? byId[b.sellerId].storeName : '—',
          isLive: b.status === 'active' && !b.paused && Date.now() < b.endsAt,
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },

    /** حذف کالای عمده — برای تخلف */
    removeProduct(pid) {
      const all = read('dpw_products', []);
      write('dpw_products', all.filter((p) => p.id !== pid));
      log('کالای عمده حذف شد');
      return true;
    },

    /** پنهان کردن همه‌ی کالاهای یک عمده‌فروش */
    hideProducts(sellerId) {
      const all = read('dpw_products', []);
      let n = 0;
      all.forEach((p) => {
        if (p.sellerId === sellerId && p.status === 'active') { p.status = 'draft'; n++; }
      });
      if (n) write('dpw_products', all);
      return n;
    },

    /** پایان دادن به بسته‌ی نردبان عمده */
    stopBoost(bid) {
      const all = read('dpw_boosts', []);
      const b = all.find((x) => x.id === bid);
      if (!b) throw new Error('بسته پیدا نشد.');
      b.status = 'expired';
      b.endsAt = Date.now();
      write('dpw_boosts', all);
      log('بسته‌ی نردبان بازار عمده پایان یافت');
      return true;
    },
  };


  /* ============================================================
     پرونده‌ی کامل یک فروشگاه — قدرت کامل مدیر
     ------------------------------------------------------------
     تا پیش از این، مدیر فقط می‌توانست فروشگاه را تأیید، رد یا
     معلق کند و نرخ کمیسیونش را عوض کند. حالا می‌تواند وارد
     پرونده‌ی هر فروشگاه شود و تک‌تک چیزهایش را ببیند و در
     صورت نیاز تغییر دهد:

       • کالاها      → قیمت، موجودی، وضعیت، حذف
       • کد تخفیف‌ها → روشن/خاموش، حذف، تاریخچه‌ی مصرف
       • تخفیف‌ها     → روشن/خاموش، حذف
       • سفارش‌ها     → دیدن و تغییر وضعیت
       • نظرها        → پنهان یا آشکار
       • نردبان       → توقف
       • مالی         → کمیسیون، درآمد، برداشت‌ها

     هر تغییری در دفترچه‌ی رویدادها ثبت می‌شود تا معلوم باشد
     چه کسی چه کاری کرده.
     ============================================================ */
  const detail = {

    /** آیا کالاهای این فروشنده در انبار عمده است یا تک‌فروشی؟ */
    _bin(seller) {
      return seller && seller.sellerType === 'wholesale' ? 'dpw_products' : K.products;
    },

    /* ---------- پرونده‌ی کامل ---------- */
    async load(id) {
      const s = await sellers.get(id);
      if (!s) return null;

      const bin      = this._bin(s);
      const products = read(bin, []).filter((p) => String(p.sellerId) === String(id));

      const isW    = s.sellerType === 'wholesale';
      const orders = read(isW ? 'dpw_orders' : K.orders, [])
        .filter((o) => String(o.sellerId) === String(id));

      const coupons = read('dp_coupons', [])
        .filter((c) => String(c.sellerId) === String(id));
      const uses    = read('dp_coupon_uses', []);
      const sales   = read('dp_sales', [])
        .filter((r) => String(r.sellerId) === String(id));

      const pIds = products.map((p) => String(p.id));
      const reviews = read(K.reviews, []).filter((r) =>
        (r.kind === 'store' && String(r.targetId) === String(id)) ||
        (r.kind === 'product' && pIds.indexOf(String(r.targetId)) > -1) ||
        String(r.sellerId) === String(id));

      const boosts = read(isW ? 'dpw_boosts' : 'dp_boosts', [])
        .filter((b) => String(b.sellerId) === String(id));

      const payouts = read('dp_payouts', [])
        .filter((w) => String(w.sellerId) === String(id));

      /* ---------- محاسبه‌ی پول ---------- */
      const DONE = ['delivered', 'shipped', 'processing', 'pending', 'paid'];
      const live = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'canceled');

      const revenue    = live.reduce((a, o) => a + (Number(o.total) || 0), 0);
      const delivered  = orders.filter((o) => o.status === 'delivered');
      const settled    = delivered.reduce((a, o) => a + (Number(o.total) || 0), 0);
      const commission = Math.round(settled * (Number(s.commissionRate) || 0) / 100);
      const withdrawn  = payouts
        .filter((w) => w.status === 'paid')
        .reduce((a, w) => a + (Number(w.amount) || 0), 0);

      const rated = reviews.filter((r) => Number(r.rating) > 0 && !r.hidden);
      const rating = rated.length
        ? Math.round((rated.reduce((a, r) => a + Number(r.rating), 0) / rated.length) * 10) / 10
        : 0;

      const now = Date.now();
      const today = new Date().toISOString().slice(0, 10);

      return {
        seller: s,
        isWholesale: isW,
        bin,
        products,
        orders: orders.slice().reverse(),
        coupons: coupons.slice().reverse().map((c) => ({
          ...c,
          usedCount: uses.filter((u) => u.couponId === c.id).length,
          usedOff: uses
            .filter((u) => u.couponId === c.id)
            .reduce((a, u) => a + (Number(u.off) || 0), 0),
          isLive: !c.off && c.from <= today && today <= c.to,
        })),
        sales: sales.slice().reverse().map((r) => ({
          ...r,
          isLive: !r.off && r.from <= today && today <= r.to,
        })),
        reviews: reviews.slice().reverse(),
        boosts: boosts.slice().reverse().map((b) => ({
          ...b,
          isLive: b.status === 'active' && !b.paused && now < b.endsAt,
        })),
        payouts: payouts.slice().reverse(),
        kpi: {
          products: products.length,
          active: products.filter((p) => p.status === 'active').length,
          draft: products.filter((p) => p.status === 'draft').length,
          outOfStock: products.filter((p) => p.status === 'out_of_stock'
            || Number(p.stock) === 0).length,
          stockValue: products.reduce(
            (a, p) => a + (Number(p.price) || 0) * (Number(p.stock) || 0), 0),
          orders: orders.length,
          openOrders: orders.filter((o) =>
            o.status === 'pending' || o.status === 'processing').length,
          cancelled: orders.length - live.length,
          revenue,
          settled,
          commission,
          withdrawn,
          balance: Math.max(0, settled - commission - withdrawn),
          couponsLive: coupons.filter((c) => !c.off && c.from <= today && today <= c.to).length,
          couponsAll: coupons.length,
          couponOff: uses
            .filter((u) => coupons.some((c) => c.id === u.couponId))
            .reduce((a, u) => a + (Number(u.off) || 0), 0),
          salesLive: sales.filter((r) => !r.off && r.from <= today && today <= r.to).length,
          boostsLive: boosts.filter((b) =>
            b.status === 'active' && !b.paused && now < b.endsAt).length,
          reviews: reviews.length,
          flagged: reviews.filter((r) => r.flagged && !r.hidden).length,
          rating,
        },
      };
    },

    /* ============================================================
       کالا — مدیر می‌تواند قیمت، موجودی و وضعیت را عوض کند
       ============================================================ */
    async saveProduct(sellerId, pid, patch) {
      const s = await sellers.get(sellerId);
      const bin = this._bin(s);
      const all = read(bin, []);
      const p = all.find((x) => String(x.id) === String(pid)
        && String(x.sellerId) === String(sellerId));
      if (!p) throw new Error('کالا پیدا نشد.');

      const before = { price: p.price, stock: p.stock, status: p.status };

      if (patch.price != null) {
        const v = Number(patch.price);
        if (!(v >= 0)) throw new Error('قیمت باید عددی مثبت باشد.');
        if (v > 900000000) throw new Error('قیمت بیش از اندازه بزرگ است.');
        p.price = Math.round(v);
      }
      if (patch.stock != null) {
        const v = Number(patch.stock);
        if (!(v >= 0)) throw new Error('موجودی نمی‌تواند منفی باشد.');
        p.stock = Math.floor(v);
      }
      if (patch.status != null) {
        const OK = ['active', 'draft', 'out_of_stock'];
        if (OK.indexOf(patch.status) < 0) throw new Error('وضعیت نامعتبر است.');
        p.status = patch.status;
      }

      /* اگر موجودی صفر شد ولی کالا فعال مانده، خودکار «ناموجود» */
      if (Number(p.stock) === 0 && p.status === 'active') p.status = 'out_of_stock';
      /* و برعکس: موجودی برگشت ولی وضعیت ناموجود مانده */
      if (Number(p.stock) > 0 && p.status === 'out_of_stock') p.status = 'active';

      write(bin, all);

      const ch = [];
      if (before.price !== p.price) ch.push(`قیمت ${before.price}→${p.price}`);
      if (before.stock !== p.stock) ch.push(`موجودی ${before.stock}→${p.stock}`);
      if (before.status !== p.status) ch.push(`وضعیت ${before.status}→${p.status}`);
      log(`مدیر کالای «${p.name}» از «${s.storeName}» را تغییر داد — ${ch.join('، ') || 'بدون تغییر'}`);
      return p;
    },

    async removeProduct(sellerId, pid) {
      const s = await sellers.get(sellerId);
      const bin = this._bin(s);
      const all = read(bin, []);
      const p = all.find((x) => String(x.id) === String(pid));
      if (!p) throw new Error('کالا پیدا نشد.');
      write(bin, all.filter((x) => String(x.id) !== String(pid)));
      log(`مدیر کالای «${p.name}» از «${s.storeName}» را حذف کرد`);
      return true;
    },

    /** همه‌ی کالاهای فروشگاه را یک‌جا فعال یا پنهان می‌کند */
    async bulkProducts(sellerId, action) {
      const s = await sellers.get(sellerId);
      const bin = this._bin(s);
      const all = read(bin, []);
      let n = 0;
      all.forEach((p) => {
        if (String(p.sellerId) !== String(sellerId)) return;
        if (action === 'hide' && p.status !== 'draft') { p.status = 'draft'; n++; }
        if (action === 'show' && p.status === 'draft') {
          p.status = Number(p.stock) > 0 ? 'active' : 'out_of_stock'; n++;
        }
      });
      if (n) write(bin, all);
      log(`مدیر ${n} کالای «${s.storeName}» را ${action === 'hide' ? 'پنهان' : 'منتشر'} کرد`);
      return n;
    },

    /* ============================================================
       کد تخفیف — مدیر می‌تواند خاموش، روشن یا حذف کند
       ============================================================ */
    toggleCoupon(id) {
      const all = read('dp_coupons', []);
      const c = all.find((x) => x.id === id);
      if (!c) throw new Error('کد پیدا نشد.');
      c.off = !c.off;
      write('dp_coupons', all);
      log(`مدیر کد تخفیف «${c.code}» را ${c.off ? 'خاموش' : 'روشن'} کرد`);
      return !c.off;
    },

    removeCoupon(id) {
      const all = read('dp_coupons', []);
      const c = all.find((x) => x.id === id);
      if (!c) throw new Error('کد پیدا نشد.');
      write('dp_coupons', all.filter((x) => x.id !== id));
      log(`مدیر کد تخفیف «${c.code}» را حذف کرد`);
      return true;
    },

    /**
     * ویرایش کد تخفیف به دست مدیر.
     * فقط چیزهایی که بی‌خطرند: درصد/مبلغ، سقف تخفیف، سقف مصرف،
     * تاریخ پایان. خودِ «کد» عوض نمی‌شود چون ممکن است مشتری‌ها
     * آن را جایی نوشته باشند.
     */
    saveCoupon(id, patch) {
      const all = read('dp_coupons', []);
      const c = all.find((x) => x.id === id);
      if (!c) throw new Error('کد پیدا نشد.');

      if (patch.value != null) {
        const v = Number(patch.value);
        if (c.kind === 'percent' && !(v > 0 && v <= 90)) {
          throw new Error('درصد تخفیف باید بین ۱ تا ۹۰ باشد.');
        }
        if (c.kind === 'amount' && !(v > 0)) throw new Error('مبلغ تخفیف را بنویسید.');
        c.value = v;
      }
      if (patch.maxOff != null) c.maxOff = Math.max(0, Number(patch.maxOff) || 0);
      if (patch.maxUses != null) c.maxUses = Math.max(0, Math.floor(Number(patch.maxUses) || 0));
      if (patch.to != null) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(patch.to)) throw new Error('تاریخ پایان نامعتبر است.');
        if (patch.to < c.from) throw new Error('تاریخ پایان نمی‌تواند پیش از شروع باشد.');
        c.to = patch.to;
      }
      write('dp_coupons', all);
      log(`مدیر کد تخفیف «${c.code}» را ویرایش کرد`);
      return c;
    },

    /* ============================================================
       تخفیف خودکار فروشنده
       ============================================================ */
    toggleSale(id) {
      const all = read('dp_sales', []);
      const r = all.find((x) => x.id === id);
      if (!r) throw new Error('تخفیف پیدا نشد.');
      r.off = !r.off;
      write('dp_sales', all);
      log(`مدیر تخفیف «${r.title || r.percent + '٪'}» را ${r.off ? 'خاموش' : 'روشن'} کرد`);
      return !r.off;
    },

    removeSale(id) {
      const all = read('dp_sales', []);
      write('dp_sales', all.filter((x) => x.id !== id));
      log('مدیر یک تخفیف فروشنده را حذف کرد');
      return true;
    },

    /* ============================================================
       سفارش — تغییر وضعیت به دست مدیر (برای حل اختلاف)
       ============================================================ */
    async setOrderStatus(sellerId, oid, status) {
      const s = await sellers.get(sellerId);
      const key = s && s.sellerType === 'wholesale' ? 'dpw_orders' : K.orders;
      const OK = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (OK.indexOf(status) < 0) throw new Error('وضعیت نامعتبر است.');

      const all = read(key, []);
      const o = all.find((x) => String(x.id) === String(oid));
      if (!o) throw new Error('سفارش پیدا نشد.');
      const before = o.status;
      o.status = status;
      write(key, all);
      log(`مدیر وضعیت سفارش ${oid} را از ${before} به ${status} تغییر داد`);
      return o;
    },

    /* ============================================================
       نظر — پنهان یا آشکار کردن
       ============================================================ */
    toggleReview(rid) {
      const all = read(K.reviews, []);
      const r = all.find((x) => String(x.id) === String(rid));
      if (!r) throw new Error('نظر پیدا نشد.');
      r.hidden = !r.hidden;
      if (!r.hidden) r.flagged = false;
      write(K.reviews, all);
      log(`مدیر یک نظر را ${r.hidden ? 'پنهان' : 'آشکار'} کرد`);
      return !r.hidden;
    },

    /* ============================================================
       نردبان — پایان دادن
       ============================================================ */
    async stopBoost(sellerId, bid) {
      const s = await sellers.get(sellerId);
      const key = s && s.sellerType === 'wholesale' ? 'dpw_boosts' : 'dp_boosts';
      const all = read(key, []);
      const b = all.find((x) => String(x.id) === String(bid));
      if (!b) throw new Error('بسته پیدا نشد.');
      b.status = 'expired';
      b.endsAt = Date.now();
      write(key, all);
      log(`مدیر بسته‌ی نردبان «${s.storeName}» را پایان داد`);
      return true;
    },

    /* ============================================================
       یادداشت خصوصی مدیر روی پرونده
       ------------------------------------------------------------
       فروشنده این را نمی‌بیند. برای ثبت نکته‌های داخلی است،
       مثلاً «تماس گرفته شد، قول داد مدارک را تا هفته‌ی آینده بفرستد».
       ============================================================ */
    note(sellerId, text) {
      const t = String(text || '').replace(/[<>]/g, '').trim().slice(0, 500);
      if (t.length < 2) throw new Error('یادداشت خیلی کوتاه است.');
      const users = read(K.users, []);
      const u = users.find((x) => String(x.id) === String(sellerId));
      if (!u) throw new Error('فروشگاه پیدا نشد.');
      u.adminNotes = Array.isArray(u.adminNotes) ? u.adminNotes : [];
      u.adminNotes.unshift({ text: t, date: nowFa(), at: Date.now() });
      u.adminNotes = u.adminNotes.slice(0, 40);
      write(K.users, users);
      log(`مدیر یادداشتی روی پرونده‌ی «${u.storeName}» گذاشت`);
      return u.adminNotes;
    },

    notes(sellerId) {
      const u = read(K.users, []).find((x) => String(x.id) === String(sellerId));
      return (u && Array.isArray(u.adminNotes)) ? u.adminNotes : [];
    },

    removeNote(sellerId, at) {
      const users = read(K.users, []);
      const u = users.find((x) => String(x.id) === String(sellerId));
      if (!u || !Array.isArray(u.adminNotes)) return [];
      u.adminNotes = u.adminNotes.filter((n) => n.at !== at);
      write(K.users, users);
      return u.adminNotes;
    },

    /* ============================================================
       سقف اختیار فروشنده
       ------------------------------------------------------------
       مدیر می‌تواند برای فروشگاهی که سابقه‌ی خوبی ندارد
       محدودیت بگذارد: بیشترین درصد تخفیفی که اجازه دارد بدهد،
       و بیشترین تعداد کالایی که می‌تواند ثبت کند.
       ============================================================ */
    limits(sellerId) {
      const u = read(K.users, []).find((x) => String(x.id) === String(sellerId));
      return {
        maxDiscount: Number(u && u.maxDiscount) || 0,   /* ۰ = بی‌محدودیت */
        maxProducts: Number(u && u.maxProducts) || 0,
        noCoupons: !!(u && u.noCoupons),
        noBoost: !!(u && u.noBoost),
      };
    },

    setLimits(sellerId, lim) {
      const users = read(K.users, []);
      const u = users.find((x) => String(x.id) === String(sellerId));
      if (!u) throw new Error('فروشگاه پیدا نشد.');

      const d = Math.max(0, Math.min(90, Math.floor(Number(lim.maxDiscount) || 0)));
      const p = Math.max(0, Math.floor(Number(lim.maxProducts) || 0));
      u.maxDiscount = d;
      u.maxProducts = p;
      u.noCoupons = !!lim.noCoupons;
      u.noBoost = !!lim.noBoost;
      write(K.users, users);

      log(`مدیر سقف اختیار «${u.storeName}» را تنظیم کرد — `
        + `تخفیف ${d || 'آزاد'}، کالا ${p || 'آزاد'}`
        + (u.noCoupons ? '، کد تخفیف ممنوع' : '')
        + (u.noBoost ? '، نردبان ممنوع' : ''));
      return this.limits(sellerId);
    },
  };

  /* ============================================================
     دفترچه‌ی رویدادها — چه کسی چه کاری کرد
     ============================================================ */
  function log(text) {
    const all = read(K.log, []);
    all.unshift({ text, date: nowFa(), time: new Date().toLocaleTimeString('fa-IR') });
    write(K.log, all.slice(0, 60));
  }

  function history() { return read(K.log, []); }

  window.DPAdmin = {
    mode: REMOTE ? 'supabase' : 'local',
    auth, sellers, stats, history, log, wholesale, detail,
    DEFAULT_PASS,
  };
})();
