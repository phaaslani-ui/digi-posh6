/* ============================================================
   دیجی‌پوش — حساب کاربری مشتری
   ------------------------------------------------------------
   ثبت‌نام و ورود واقعی مشتری‌ها. تا وقتی کلیدهای Supabase
   وارد نشده باشد، روی همان مرورگر ذخیره می‌شود.
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  const K = {
    users: 'dp_customers',
    session: 'dp_customer_session',
    wishlist: 'dp_wishlist',
  };

  /*
   * خواندن امن از حافظه.
   *
   * پیش‌تر هر چیزی که در حافظه بود برگردانده می‌شد. اگر داده
   * خراب می‌شد (مثلاً یک رشته به‌جای فهرست ذخیره می‌شد)، بعداً
   * `read(...).filter` صدا زده می‌شد و کل صفحه می‌شکست.
   *
   * حالا اگر انتظار فهرست داریم و چیز دیگری آمد، همان مقدار
   * پیش‌فرض برمی‌گردد و سایت سالم می‌ماند.
   */
  const read = (k, d) => {
    let v;
    try { v = JSON.parse(localStorage.getItem(k)); } catch { return d; }
    if (v == null) return d;
    if (Array.isArray(d)) {
      if (!Array.isArray(v)) return d;
      return v.filter((x) => x && typeof x === 'object');
    }
    if (d && typeof d === 'object' && (typeof v !== 'object' || Array.isArray(v))) return d;
    return v;
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = () => 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const nowFa = () => new Intl.DateTimeFormat('fa-IR').format(new Date());
  const clean = (e) => String(e || '').trim().toLowerCase();

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
  var HASH_SALT = 'dpUser$';

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

  async function authApi(pathName, body) {
    const res = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/auth/v1/' + pathName, {
      method: 'POST',
      headers: { apikey: CFG.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || data?.error_description || data?.message || 'خطا در ارتباط با سرور');
    return data;
  }

  /* ============================================================
     نشست
     ============================================================ */
  const session = () => read(K.session, null);
  const setSession = (s) => (s ? write(K.session, s) : localStorage.removeItem(K.session));

  /* ============================================================
     ثبت‌نام و ورود
     ============================================================ */
  async function signup({ fullName, email, password, phone }) {
    email = clean(email);
    if (!fullName || !fullName.trim()) throw new Error('نام خود را بنویسید.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ایمیل معتبر نیست.');
    if (String(password).length < 6) throw new Error('رمز عبور باید حداقل ۶ نویسه باشد.');

    if (REMOTE) {
      const out = await authApi('signup', {
        email, password,
        data: { full_name: fullName, phone, role: 'customer' },
      });
      if (out.access_token) {
        setSession({ access_token: out.access_token, user_id: out.user?.id, email, fullName });
      }
      return { needsConfirm: !out.access_token };
    }

    const users = read(K.users, []);
    if (users.some((u) => u.email === email)) {
      throw new Error('این ایمیل قبلاً ثبت شده است. وارد شوید.');
    }

    const user = {
      id: uid(),
      fullName: fullName.trim(),
      email,
      phone: (phone || '').trim(),
      passHash: await sha256(password),
      joinDate: nowFa(),
    };
    users.push(user);
    write(K.users, users);
    setSession({ user_id: user.id, email, fullName: user.fullName });
    return { needsConfirm: false };
  }

  async function login(email, password) {
    email = clean(email);
    if (REMOTE) {
      const out = await authApi('token?grant_type=password', { email, password });
      setSession({
        access_token: out.access_token, user_id: out.user?.id, email,
        fullName: out.user?.user_metadata?.full_name || email.split('@')[0],
      });
      return true;
    }

    const u = read(K.users, []).find((x) => x.email === email);
    if (!u) throw new Error('حسابی با این ایمیل پیدا نشد.');
    if (!(await verifyHash(password, u.passHash))) throw new Error('رمز عبور نادرست است.');
    setSession({ user_id: u.id, email, fullName: u.fullName });
    return true;
  }

  function logout() { setSession(null); }
  function isLoggedIn() { return !!session(); }

  function me() {
    const s = session();
    if (!s) return null;
    if (REMOTE) return { id: s.user_id, email: s.email,
      fullName: s.fullName || String(s.email || '').split('@')[0] || 'کاربر' };
    return read(K.users, []).find((u) => u.id === s.user_id) || null;
  }

  /* ============================================================
     علاقه‌مندی‌ها
     ============================================================ */
  const wishlist = {
    all() {
      const s = session();
      if (!s) return [];
      return read(K.wishlist, []).filter((w) => w.userId === s.user_id);
    },
    has(id) { return this.all().some((w) => w.storeId === id); },
    toggle(storeId) {
      const s = session();
      if (!s) throw new Error('ابتدا وارد حساب شوید.');
      let all = read(K.wishlist, []);
      const i = all.findIndex((w) => w.userId === s.user_id && w.storeId === storeId);
      if (i > -1) { all.splice(i, 1); write(K.wishlist, all); return false; }
      all.push({ userId: s.user_id, storeId, date: nowFa() });
      write(K.wishlist, all);
      return true;
    },
  };

  window.DPUser = {
    mode: REMOTE ? 'supabase' : 'local',
    signup, login, logout, isLoggedIn, me, wishlist,
    reset() { Object.values(K).forEach((k) => localStorage.removeItem(k)); },
  };
})();
