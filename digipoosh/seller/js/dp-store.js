/* ============================================================
   دیجی‌پوش — لایه‌ی داده‌ی واقعی (بدون هیچ کتابخانه‌ای)
   ------------------------------------------------------------
   • اگر کلیدهای Supabase در dp-config.js پر شده باشد → داده روی سرور
   • در غیر این صورت → داده روی همین مرورگر (localStorage)
   در هر دو حالت رفتار یکسان است: ثبت‌نام واقعی، ورود واقعی با
   همان ایمیل و رمزی که خودتان زدید، ساخت فروشگاه و افزودن محصول
   واقعاً ذخیره می‌شود و بعد از بستن مرورگر هم باقی می‌ماند.
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const K = {
    users: 'dp_users',
    session: 'dp_session',
    products: 'dp_products',
    orders: 'dp_orders',
    payouts: 'dp_payouts',
  };

  /* ---------- ابزار ---------- */
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  
  // 🆕 v17.7 — کمک: push محصولات به سرور + broadcast + event
  const syncToServer = () => {
    try {
      const all = read(K.products, []);
      // ۱) push به سرور
      fetch('http://localhost:8001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: all })
      }).catch(() => {});
      
      // ۲) BroadcastChannel (برای سایر tabs)
      try {
        const ch = new BroadcastChannel('dp_products_channel');
        ch.postMessage({ type: 'products_updated', timestamp: Date.now(), count: all.length });
        setTimeout(() => ch.close(), 100);
      } catch (e) {}
      
      // ۳) Custom Event (برای همین tab - re-render فوری)
      try {
        window.dispatchEvent(new CustomEvent('dp:products-changed', {
          detail: { products: all, count: all.length }
        }));
      } catch (e) {}
      
      // ۴) localStorage ping (برای fallback)
      try {
        localStorage.setItem('dp_products_updated', Date.now().toString());
      } catch (e) {}
    } catch (e) {}
  };
  const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const nowFa = () => new Intl.DateTimeFormat('fa-IR').format(new Date());
  const normEmail = (e) => String(e || '').trim().toLowerCase();

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
  var HASH_SALT = 'dp$';

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

  /* ============================================================
     حالت سرور — Supabase از طریق fetch خالص
     ============================================================ */
  const api = {
    base: (CFG.supabaseUrl || '').replace(/\/$/, ''),
    key: CFG.supabaseAnonKey || '',
    token() { return read(K.session, {})?.access_token || this.key; },
    async rest(path, opts = {}) {
      const res = await fetch(this.base + '/rest/v1/' + path, {
        ...opts,
        headers: {
          apikey: this.key,
          Authorization: 'Bearer ' + this.token(),
          'Content-Type': 'application/json',
          Prefer: opts.prefer || 'return=representation',
          ...(opts.headers || {}),
        },
      });
      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : null;
      if (!res.ok) throw new Error(data?.message || data?.error_description || 'خطای سرور');
      return data;
    },
    async auth(path, body) {
      const res = await fetch(this.base + '/auth/v1/' + path, {
        method: 'POST',
        headers: { apikey: this.key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || data?.error_description || data?.message || 'خطای ورود');
      return data;
    },
  };

  /* ============================================================
     نشست (Session)
     ============================================================ */
  function session() { return read(K.session, null); }
  function setSession(s) { s ? write(K.session, s) : localStorage.removeItem(K.session); }

  /* ============================================================
     احراز هویت
     ============================================================ */
  const auth = {
    /**
     * ثبت‌نام فروشنده — همان ایمیل و رمزی که کاربر وارد می‌کند
     * واقعاً ذخیره می‌شود و بعداً با همان می‌تواند وارد شود.
     */
    async signup(payload) {
      const email = normEmail(payload.email);
      if (!email || !payload.password) throw new Error('ایمیل و رمز عبور الزامی است.');

      if (REMOTE) {
        const out = await api.auth('signup', {
          email,
          password: payload.password,
          data: { full_name: payload.fullName, role: 'seller' },
        });
        if (out.access_token) setSession({ access_token: out.access_token, user_id: out.user?.id, email });
        const sellerId = out.user?.id;
        if (sellerId) {
          await api.rest('seller_profiles', {
            method: 'POST',
            body: JSON.stringify({
              user_id: sellerId,
              store_name: payload.shopName,
              category: payload.category,
              city: payload.city,
              address: payload.address || '',
              phone: payload.phone,
              national_id: payload.nationalId,
              shaba: payload.shaba,
              description: payload.description || '',
              seller_type: payload.sellerType === 'wholesale' ? 'wholesale' : 'retail',
              company_name: payload.companyName || '',
              economic_code: payload.economicCode || '',
              reg_number: payload.regNumber || '',
              warehouse: payload.warehouse || '',
              min_order_value: Number(payload.minOrderValue) || 0,
              lead_time: Number(payload.leadTime) || 0,
              status: 'pending',
              commission_rate: CFG.commissionRate || 10,
            }),
          }).catch(() => {});
        }
        return { email, needsConfirm: !out.access_token };
      }

      const users = read(K.users, []);
      if (users.some(u => u.email === email)) throw new Error('این ایمیل قبلاً ثبت شده است. وارد شوید.');

      const user = {
        id: uid('seller'),
        email,
        passHash: await sha256(payload.password),
        fullName: payload.fullName || '',
        phone: payload.phone || '',
        nationalId: payload.nationalId || '',
        storeName: payload.shopName || '',
        category: payload.category || '',
        city: payload.city || '',
        address: payload.address || '',
        description: payload.description || '',
        shaba: payload.shaba || '',

        /* نوع فروشنده: 'retail' (تک‌فروش) یا 'wholesale' (عمده‌فروش).
           این یک مقدار تعیین‌کننده است: مسیر ورود، پنل، و شکل
           نمایش کالاها بر پایه‌ی آن انتخاب می‌شود. */
        sellerType: payload.sellerType === 'wholesale' ? 'wholesale' : 'retail',

        /* میدان‌های ویژه‌ی عمده‌فروش — برای تک‌فروش خالی می‌مانند */
        companyName: payload.companyName || '',
        economicCode: payload.economicCode || '',
        regNumber: payload.regNumber || '',
        warehouse: payload.warehouse || '',
        minOrderValue: Number(payload.minOrderValue) || 0,
        leadTime: Number(payload.leadTime) || 0,
        acceptsRfq: payload.acceptsRfq !== false,
        logo: '',                   // لوگوی فروشگاه
        cover: '',                  // تصویر سربرگ
        status: 'pending',          // مدیر باید تأیید کند
        isVerified: false,
        rejectionReason: '',
        commissionRate: CFG.commissionRate || 10,
        joinDate: nowFa(),
      };
      users.push(user);
      write(K.users, users);
      setSession({ user_id: user.id, email });
      return { email, needsConfirm: false };
    },

    async login(email, password) {
      email = normEmail(email);
      if (REMOTE) {
        const out = await api.auth('token?grant_type=password', { email, password });
        setSession({ access_token: out.access_token, refresh_token: out.refresh_token, user_id: out.user?.id, email });
        return true;
      }
      const users = read(K.users, []);
      const u = users.find(x => x.email === email);
      if (!u) throw new Error('حسابی با این ایمیل پیدا نشد. ابتدا ثبت‌نام کنید.');
      if (!(await verifyHash(password, u.passHash))) throw new Error('رمز عبور نادرست است.');
      setSession({ user_id: u.id, email });
      return true;
    },

    logout() { setSession(null); },
    isLoggedIn() { return !!session(); },

    /** اطلاعات فروشنده‌ی وارد شده */
    async me() {
      const s = session();
      if (!s) return null;
      if (REMOTE) {
        const rows = await api.rest(`seller_profiles?user_id=eq.${s.user_id}&select=*`).catch(() => []);
        const p = rows?.[0] || {};
        return {
          id: s.user_id, email: s.email,
          fullName: p.full_name || String(s.email || '').split('@')[0] || 'فروشنده',
          storeName: p.store_name || 'فروشگاه من',
          category: p.category || '', city: p.city || '', address: p.address || '',
          description: p.description || '', phone: p.phone || '', shaba: p.shaba || '',
          logo: p.logo_url || '', cover: p.cover_url || '',
          status: p.status || 'pending',
          rejectionReason: p.rejection_reason || '',
          reviewRequested: !!p.review_requested,
          isVerified: p.status === 'approved',
          commissionRate: p.commission_rate ?? (CFG.commissionRate || 10),
          joinDate: p.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(p.created_at)) : nowFa(),
        };
      }
      const u = read(K.users, []).find(x => x.id === s.user_id);
      if (!u) return null;
      // وضعیت تأیید همیشه از روی `status` خوانده می‌شود (مدیر آن را عوض می‌کند)
      const status = u.status || (u.isVerified ? 'approved' : 'pending');
      return { ...u, status, isVerified: status === 'approved' };
    },

    async updateProfile(patch) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد شوید.');
      if (REMOTE) {
        const map = {
          storeName: 'store_name', city: 'city', address: 'address',
          description: 'description', shaba: 'shaba', phone: 'phone', fullName: 'full_name',
          logo: 'logo_url', cover: 'cover_url',
        };
        const body = {};
        for (const [k, v] of Object.entries(patch)) if (map[k]) body[map[k]] = v;
        await api.rest(`seller_profiles?user_id=eq.${s.user_id}`, { method: 'PATCH', body: JSON.stringify(body) });
        return true;
      }
      const users = read(K.users, []);
      const i = users.findIndex(u => u.id === s.user_id);
      if (i < 0) throw new Error('حساب پیدا نشد.');
      users[i] = { ...users[i], ...patch };
      write(K.users, users);
      return true;
    },

    /** درخواست بررسی دوباره پس از رد شدن */
    async requestReview(note) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد شوید.');

      if (REMOTE) {
        await api.rest(`seller_profiles?user_id=eq.${s.user_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            review_requested: true,
            review_note: note || '',
            review_requested_at: new Date().toISOString(),
          }),
        });
        return true;
      }

      const users = read(K.users, []);
      const i = users.findIndex(u => u.id === s.user_id);
      if (i < 0) throw new Error('حساب پیدا نشد.');
      users[i].reviewRequested = true;
      users[i].reviewNote = note || '';
      users[i].reviewDate = nowFa();
      write(K.users, users);
      return true;
    },

    async changePassword(oldPass, newPass) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد شوید.');
      if (REMOTE) {
        const res = await fetch(api.base + '/auth/v1/user', {
          method: 'PUT',
          headers: { apikey: api.key, Authorization: 'Bearer ' + api.token(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPass }),
        });
        if (!res.ok) throw new Error('تغییر رمز ناموفق بود.');
        return true;
      }
      const users = read(K.users, []);
      const i = users.findIndex(u => u.id === s.user_id);
      if (!(await verifyHash(oldPass, users[i].passHash))) throw new Error('رمز فعلی نادرست است.');
      users[i].passHash = await sha256(newPass);
      write(K.users, users);
      return true;
    },
  };

  /* ============================================================
     قواعد دسترسی — بسته به وضعیت تأیید فروشگاه
     ------------------------------------------------------------
     approved  → همه‌چیز آزاد، محصول مستقیم منتشر می‌شود
     pending   → می‌تواند محصول بسازد، ولی پیش‌نویس می‌ماند
     rejected  → قفل؛ فقط می‌تواند درخواست بررسی دوباره بدهد
     suspended → قفل
     ============================================================ */
  const RULES = {
    approved:  { canAdd: true,  canPublish: true,  locked: false },
    pending:   { canAdd: true,  canPublish: false, locked: false },
    rejected:  { canAdd: false, canPublish: false, locked: true },
    suspended: { canAdd: false, canPublish: false, locked: true },
  };

  function rulesFor(status) {
    return RULES[status] || RULES.pending;
  }

  /** وضعیت فروشگاه‌ی که الان وارد شده */
  function myStatus() {
    const s = session();
    if (!s) return 'pending';
    if (REMOTE) return window.ME?.status || 'pending';
    const u = read(K.users, []).find(x => x.id === s.user_id);
    return u?.status || (u?.isVerified ? 'approved' : 'pending');
  }

  const can = () => rulesFor(myStatus());

  /* ============================================================
     محصولات
     ============================================================ */
  const products = {
    async list() {
      const s = session();
      if (!s) return [];
      if (REMOTE) {
        const rows = await api.rest(`products?seller_id=eq.${s.user_id}&select=*&order=created_at.desc`).catch(() => []);
        return (rows || []).map(r => ({
          id: r.id, name: r.name, price: r.price, stock: r.stock,
          category: r.category, section: r.section || '', group: r.group || '',
          brand: r.brand || '', status: r.status,
          description: r.description || '', images: r.images || [],
          sizes: r.sizes || [], colors: r.colors || [],
          sales: r.sales || 0,
          date: r.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(r.created_at)) : nowFa(),
        }));
      }
      return read(K.products, []).filter(p => p.sellerId === s.user_id);
    },

    async get(id) { return (await this.list()).find(p => p.id === id) || null; },

    async add(data) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد شوید.');

      const rule = can();
      if (!rule.canAdd) {
        throw new Error('دسترسی فروشگاه شما بسته است و نمی‌توانید محصول اضافه کنید.');
      }
      if (!data.name) throw new Error('نام محصول الزامی است.');

      /* ---------- سقف تعداد کالا که مدیر گذاشته ----------
         مدیر در پرونده‌ی فروشگاه می‌تواند بگوید این فروشنده
         بیش از فلان تعداد کالا ثبت نکند. */
      try {
        const _users = JSON.parse(localStorage.getItem('dp_users'));
        const _me = Array.isArray(_users)
          ? _users.find((u) => u && String(u.id) === String(s.user_id)) : null;
        const _cap = Number(_me && _me.maxProducts) || 0;
        if (_cap) {
          const _have = read(K.products, [])
            .filter((x) => String(x.sellerId) === String(s.user_id)).length;
          if (_have >= _cap) {
            throw new Error('مدیر سایت سقف '
              + String(_cap).replace(/\d/g, (dg) => '۰۱۲۳۴۵۶۷۸۹'[+dg])
              + ' کالا را برای فروشگاه شما تعیین کرده است.');
          }
        }
      } catch (e) {
        if (e && /سقف/.test(e.message)) throw e;
      }

      /* قیمت و موجودی هرگز منفی نمی‌شوند.
         قیمت منفی جمع سبد خرید را منفی می‌کرد — یعنی سایت
         به مشتری بدهکار می‌شد. */
      const priceIn = Number(data.price);
      if (!Number.isFinite(priceIn) || priceIn < 0) {
        throw new Error('قیمت باید عددی مثبت باشد.');
      }
      const stockIn = Number(data.stock);
      if (!Number.isFinite(stockIn) || stockIn < 0) {
        throw new Error('موجودی نمی‌تواند منفی باشد.');
      }

      const rec = {
        name: data.name,
        price: Math.round(priceIn),
        stock: Math.floor(stockIn),
        category: data.category || '',
        section: data.section || '',
        group: data.group || '',
        brand: data.brand || '',
        // تا وقتی فروشگاه تأیید نشده، هر محصولی پیش‌نویس می‌ماند
        status: !rule.canPublish
          ? 'draft'
          : ((Number(data.stock) || 0) === 0 && data.status === 'active'
              ? 'out_of_stock' : (data.status || 'active')),
        // یادداشت می‌کنیم که کاربر می‌خواسته منتشر شود
        wanted: data.wanted || data.status || 'active',
        description: String(data.description || '').slice(0, 300),
        images: data.images || [],
        sizes: data.sizes || [],
        colors: data.colors || [],
      };

      /* ---------- ویژگی‌های کالا ----------
         پایه‌ی فیلتر مشتری و نام خودکار. هر کلیدی که فرستاده
         شده باید در فهرست رسمی باشد، وگرنه فیلتر مشتری با
         مقدار من‌درآوردی خراب می‌شود. */
      const A = window.DPAttributes;
      if (A) {
        A.GROUPS.forEach(function (g) {
          const v = data[g.key];
          if (!v) return;
          if (!A.LABELS[g.key] || !A.LABELS[g.key][v]) return;   // ناشناخته → نادیده
          rec[g.key] = v;
        });
        /* نام همیشه از روی انتخاب‌ها ساخته می‌شود، نه از ورودی */
        const built = A.buildName({
          section: rec.section, itemType: rec.category,
          fabric: rec.fabric, color: rec.color,
          style: rec.style, sleeve: rec.sleeve,
        });
        if (built) { rec.autoName = built; rec.name = built; }
      }
      if (REMOTE) {
        const out = await api.rest('products', { method: 'POST', body: JSON.stringify({ ...rec, seller_id: s.user_id }) });
        return out?.[0]?.id;
      }
      const all = read(K.products, []);
      const p = { ...rec, id: uid('p'), sellerId: s.user_id, sales: 0, date: nowFa() };
      all.push(p);
      write(K.products, all);
      
      // 🆕 v17.0 — push به سرور API ما (data/products.json)
      try {
        fetch('http://localhost:8001/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: all })
        }).catch(() => {});
      } catch (e) {}
      
      // 🆕 notify سایر tabs
      try {
        const ch = new BroadcastChannel('dp_products_channel');
        ch.postMessage({ type: 'products_updated', timestamp: Date.now() });
        setTimeout(() => ch.close(), 100);
      } catch (e) {}
      
      return p.id;
    },

    async update(id, patch) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد شوید.');

      const rule = can();
      if (rule.locked) throw new Error('دسترسی فروشگاه شما بسته است.');

      // تا تأیید نشده، انتشار ممکن نیست
      if (!rule.canPublish && patch.status && patch.status !== 'draft') {
        patch.wanted = patch.status;
        patch.status = 'draft';
      }
      /* همان محافظ هنگام ویرایش */
      if (patch.stock !== undefined) {
        const st = Number(patch.stock);
        if (!Number.isFinite(st) || st < 0) throw new Error('موجودی نمی‌تواند منفی باشد.');
        patch.stock = Math.floor(st);
      }
      if (patch.price !== undefined) {
        const pr = Number(patch.price);
        if (!Number.isFinite(pr) || pr < 0) throw new Error('قیمت باید عددی مثبت باشد.');
        patch.price = Math.round(pr);
      }
      if (patch.status === 'active' && patch.stock === 0) patch.status = 'out_of_stock';
      if (patch.description !== undefined) {
        patch.description = String(patch.description || '').slice(0, 300);
      }

      const all = read(K.products, []);
      const i = all.findIndex(p => p.id === id && p.sellerId === s.user_id);

      /* نام را دوباره می‌سازیم — فروشنده نباید بتواند با یک
         درخواست ویرایش، نام دلخواه روی کالا بگذارد */
      const A = window.DPAttributes;
      if (A && i > -1) {
        const merged = Object.assign({}, all[i], patch);
        A.GROUPS.forEach(function (g) {
          if (patch[g.key] === undefined) return;
          const v = patch[g.key];
          if (v && (!A.LABELS[g.key] || !A.LABELS[g.key][v])) delete patch[g.key];
        });
        const built = A.buildName({
          section: merged.section, itemType: merged.category,
          fabric: merged.fabric, color: merged.color,
          style: merged.style, sleeve: merged.sleeve,
        });
        if (built) { patch.autoName = built; patch.name = built; }
      }

      if (REMOTE) {
        await api.rest(`products?id=eq.${id}&seller_id=eq.${s.user_id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        // 🆕 sync محلی
        const allLocal = read(K.products, []);
        const idx = allLocal.findIndex(p => p.id === id);
        if (idx > -1) {
          allLocal[idx] = { ...allLocal[idx], ...patch };
          write(K.products, allLocal);
          syncToServer();
        }
        return true;
      }
      if (i < 0) throw new Error('محصول پیدا نشد.');
      all[i] = { ...all[i], ...patch };
      write(K.products, all);
      syncToServer();
      return true;
    },

    async remove(id) {
      const s = session();
      if (REMOTE) {
        await api.rest(`products?id=eq.${id}&seller_id=eq.${s.user_id}`, { method: 'DELETE' });
        return true;
      }
      const all = read(K.products, []).filter(p => !(p.id === id && p.sellerId === s.user_id));
      write(K.products, all);
      syncToServer();
      return true;
    },

    /** پس از تأیید فروشگاه، پیش‌نویس‌ها خودکار منتشر می‌شوند */
    async publishDrafts(sellerId) {
      const id = sellerId || session()?.user_id;
      if (!id) return 0;

      if (REMOTE) {
        const rows = await api.rest(
          `products?seller_id=eq.${id}&status=eq.draft&select=id,stock,wanted`
        ).catch(() => []);
        let n = 0;
        for (const r of rows || []) {
          const want = r.wanted || 'active';
          if (want === 'draft') continue;
          const st = Number(r.stock) === 0 && want === 'active' ? 'out_of_stock' : want;
          await api.rest(`products?id=eq.${r.id}`, {
            method: 'PATCH', body: JSON.stringify({ status: st }),
          });
          n++;
        }
        return n;
      }

      const all = read(K.products, []);
      let n = 0;
      for (const p of all) {
        if (p.sellerId !== id || p.status !== 'draft') continue;
        const want = p.wanted || 'active';
        if (want === 'draft') continue;      // فروشنده خودش خواسته پیش‌نویس بماند
        p.status = Number(p.stock) === 0 && want === 'active' ? 'out_of_stock' : want;
        n++;
      }
      if (n) write(K.products, all);
      return n;
    },
  };

  /* ============================================================
     سفارش‌ها و درآمد
     ============================================================ */
  const orders = {
    async list() {
      const s = session();
      if (!s) return [];
      if (REMOTE) {
        const rows = await api.rest(`orders?seller_id=eq.${s.user_id}&select=*&order=created_at.desc`).catch(() => []);
        return (rows || []).map(o => ({
          id: o.order_number || o.id, customer: o.customer_name || '—', phone: o.customer_phone || '',
          address: o.shipping_address || '', items: o.items_summary || [], count: o.items_count || 1,
          total: o.total || 0, status: o.status,
          date: o.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(o.created_at)) : nowFa(),
        }));
      }
      // تازه‌ترین سفارش‌ها اول
      return read(K.orders, []).filter(o => o.sellerId === s.user_id).reverse();
    },
    async setStatus(id, status) {
      const s = session();
      if (REMOTE) {
        await api.rest(`orders?order_number=eq.${id}&seller_id=eq.${s.user_id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
        return true;
      }
      const all = read(K.orders, []);
      const i = all.findIndex(o => o.id === id && o.sellerId === s.user_id);
      if (i > -1) { all[i].status = status; write(K.orders, all); }
      return true;
    },
  };

  const earnings = {
    /** درآمد از روی سفارش‌های واقعی — با احتساب سیاست کمیسیون ادمین */
    async list() {
      const me = await auth.me();
      const base = me?.commissionRate ?? (CFG.commissionRate || 10);
      const os = await orders.list();
      const P = window.DPPromo;

      return os
        .filter(o => o.status !== 'cancelled')
        .map(o => {
          let commission = 0;

          if (P && o.lines && o.lines.length) {
            /* برای هر قلم، نرخ ویژه‌ی همان محصول بررسی می‌شود */
            o.lines.forEach(l => {
              const r = P.commissions.rateFor(o.sellerId, l.productId, base);
              commission += (Number(l.price) || 0) * (Number(l.qty) || 1) * r / 100;
            });
          } else {
            const r = P ? P.commissions.rateFor(o.sellerId, '', base) : base;
            commission = (o.total || 0) * r / 100;
          }

          commission = Math.round(commission);

          /* مبلغ مرجوعی‌شده‌ی همین سفارش کم می‌شود */
          const back = Number(o.returned) || 0;
          const amount = Math.max(0, (o.total || 0) - back);
          const net = Math.max(0, amount - commission);

          return {
            date: o.date, order: o.id, amount, commission, net,
            returned: back,
            status: o.status === 'delivered' ? 'paid' : 'pending',
          };
        });
    },
    async summary() {
      const rows = await this.list();
      const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
      return {
        total: sum(r => r.net),
        paid: sum(r => (r.status === 'paid' ? r.net : 0)),
        pending: sum(r => (r.status === 'pending' ? r.net : 0)),
        commission: sum(r => r.commission),
      };
    },
    async requestPayout(amount) {
      const s = session();
      const all = read(K.payouts, []);
      all.push({ id: uid('w'), sellerId: s?.user_id, amount, date: nowFa(), status: 'pending' });
      write(K.payouts, all);
      return true;
    },
  };

  /* ============================================================
     نظرها و امتیاز فروشگاه
     ============================================================ */
  const reviews = {
    /** همه‌ی نظرهای مربوط به این فروشنده — هم درباره‌ی فروشگاه، هم محصولاتش */
    async list() {
      const s = session();
      if (!s) return [];
      if (REMOTE) {
        const rows = await api.rest(
          `reviews?seller_id=eq.${s.user_id}&select=*&order=created_at.desc`
        ).catch(() => []);
        return (rows || []).map(r => ({
          kind: r.product_id ? 'product' : 'store',
          targetId: r.product_id || r.seller_id,
          userName: r.user_name || 'کاربر دیجی‌پوش',
          rating: Number(r.rating) || 0,
          text: r.comment || '',
          date: r.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(r.created_at)) : '',
        }));
      }

      // نظرهای فروشگاه + نظرهای محصولات همین فروشنده
      const myProducts = read(K.products, [])
        .filter(p => p.sellerId === s.user_id)
        .map(p => String(p.id));

      return read('dp_reviews', []).filter(r =>
        (r.kind === 'store' && String(r.targetId) === String(s.user_id)) ||
        (r.kind === 'product' && myProducts.includes(String(r.targetId)))
      ).reverse();
    },

    /** فقط نظرهای خود فروشگاه (نه محصولات) */
    async storeOnly() {
      return (await this.list()).filter(r => r.kind === 'store');
    },

    /** میانگین امتیاز — اگر هنوز نظری نباشد، null برمی‌گردد */
    async rating() {
      const rs = await this.list();
      if (!rs.length) return { avg: null, count: 0 };
      const sum = rs.reduce((a, r) => a + (Number(r.rating) || 0), 0);
      return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
    },
  };

  /* ============================================================
     آمار داشبورد — از داده‌ی واقعی
     ============================================================ */
  async function stats() {
    const [ps, os, sum, rate] = await Promise.all([
      products.list(), orders.list(), earnings.summary(), reviews.rating(),
    ]);
    return {
      totalProducts: ps.length,
      totalOrders: os.length,
      totalEarnings: sum.total,
      pendingEarnings: sum.pending,
      paidEarnings: sum.paid,
      commissionPaid: sum.commission,
      activeProducts: ps.filter(p => p.status === 'active').length,
      draftProducts: ps.filter(p => p.status === 'draft').length,
      outOfStock: ps.filter(p => Number(p.stock) === 0).length,
      newOrders: os.filter(o => o.status === 'pending').length,
      deliveredOrders: os.filter(o => o.status === 'delivered').length,
      rating: rate.avg,
      reviewCount: rate.count,
    };
  }

  /** نمودار ۷ ماه اخیر بر پایه‌ی سفارش‌های واقعی (اگر نبود، صفر) */
  async function chart() {
    const M = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    const os = await orders.list();
    const buckets = new Map();
    for (const o of os) {
      const m = String(o.date).split('/')[1];
      const idx = Number(String(m).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) - 1;
      const name = M[idx] || '—';
      buckets.set(name, (buckets.get(name) || 0) + o.total);
    }
    if (!buckets.size) return [];
    return Array.from(buckets, ([m, v]) => ({ m, v }));
  }

  /* ---------- محافظ صفحه ---------- */
  function requireLogin(redirect = 'seller-login.html') {
    if (!auth.isLoggedIn()) { location.replace(redirect); return false; }
    return true;
  }

  /* ============================================================
     نوع فروشنده — تک‌فروش یا عمده‌فروش
     ------------------------------------------------------------
     دو مسیر کاملاً جدا در سایت هستند: پنل، شکل کالاها و
     قواعد قیمت‌گذاری فرق می‌کند. حساب‌های قدیمی که پیش از
     این ویژگی ساخته شده‌اند، «تک‌فروش» شمرده می‌شوند.
     ============================================================ */

  /** نوع فروشنده‌ی وارد‌شده */
  function myType() {
    const s = session();
    if (!s) return null;
    const u = read(K.users, []).find(x => x.id === s.user_id);
    if (!u) return null;
    return u.sellerType === 'wholesale' ? 'wholesale' : 'retail';
  }

  /** آیا عمده‌فروش است؟ */
  function isWholesale() { return myType() === 'wholesale'; }

  /** نشانی پنل درست برای این فروشنده */
  function panelHome(type) {
    const t = type || myType();
    return t === 'wholesale'
      ? '../wholesale/panel/wholesale-dashboard.html'
      : 'seller-dashboard.html';
  }

  /**
   * محافظ صفحه با بررسی نوع.
   * اگر عمده‌فروش وارد پنل تک‌فروش شود (یا برعکس)، به پنل
   * خودش فرستاده می‌شود — نه اینکه صفحه‌ی نامربوط ببیند.
   */
  function requireType(want, redirect = 'seller-login.html') {
    if (!auth.isLoggedIn()) { location.replace(redirect); return false; }
    const t = myType();
    if (!t) return true;                    /* هنوز پروفایل نیامده */
    if (t !== want) {
      location.replace(t === 'wholesale'
        ? '../wholesale/panel/wholesale-dashboard.html'
        : '../seller/seller-dashboard.html');
      return false;
    }
    return true;
  }

  window.DPStore = {
    mode: REMOTE ? 'supabase' : 'local',
    auth, products, orders, earnings, reviews, stats, chart, requireLogin,
    can, rulesFor, myStatus,
    myType, isWholesale, panelHome, requireType,
    resetAll() {
      Object.values(K).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('dp_reviews');
    },
  };
})();
