/* ============================================================
   دیجی‌پوش — سبد خرید
   ------------------------------------------------------------
   • خرید از چند فروشنده در یک سبد
   • هر ردیف = محصول + رنگ + سایز انتخابی
   • مهمان هم می‌تواند سبد بسازد؛ موقع تسویه وارد می‌شود
   ============================================================ */
'use strict';

(function () {
  const KEY = 'dp_cart';
  const ORD = 'dp_orders';

  const read = () => { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(KEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch { return []; } };
  const write = (v) => {
    localStorage.setItem(KEY, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:cart'));
  };
  const nowFa = () => new Intl.DateTimeFormat('fa-IR').format(new Date());

  /* ---------- خواندن محصولات و فروشگاه‌ها ---------- */
  /* ============================================================
     کد تخفیف اعمال‌شده روی سبد
     ------------------------------------------------------------
     فقط «کد» ذخیره می‌شود، نه مبلغ تخفیف. مبلغ هر بار از نو
     حساب می‌شود — وگرنه مشتری می‌توانست کد را با سبد بزرگ
     بگیرد، کالاها را کم کند و تخفیف بماند.
     ============================================================ */
  const CPN = 'dp_cart_coupon';

  const readCoupon = () => {
    try { return String(localStorage.getItem(CPN) || ''); } catch { return ''; }
  };

  const writeCoupon = (code) => {
    try {
      if (code) localStorage.setItem(CPN, code);
      else localStorage.removeItem(CPN);
    } catch { /* بی‌اهمیت */ }
  };

  /** شناسه‌ی مشتری برای شمارش استفاده از کد */
  function userKey() {
    try {
      const u = JSON.parse(localStorage.getItem('dp_customer_session'));
      if (u && (u.user_id || u.email)) return String(u.user_id || u.email);
    } catch { /* بی‌اهمیت */ }
    return '';
  }

  /** آیا این مشتری قبلاً سفارشی داشته؟ — برای کد «نخستین خرید» */
  function hasOrders() {
    const k = userKey();
    if (!k) return false;
    try {
      const list = JSON.parse(localStorage.getItem(ORD)) || [];
      return list.some((o) => String(o.customerId || o.userId || '') === k);
    } catch { return false; }
  }

  const allProducts = () => { try { return (window.DPSafe ? DPSafe.products() : []); } catch { return []; } };
  const allSellers  = () => { try { return (window.DPSafe ? DPSafe.sellers() : []); } catch { return []; } };

  const productById = (id) => allProducts().find((p) => String(p.id) === String(id)) || null;
  const sellerById  = (id) => allSellers().find((u) => u.id === id) || null;

  /** شناسه‌ی یکتای هر ردیف: محصول + رنگ + سایز */
  const lineKey = (pid, color, size) => `${pid}|${color || ''}|${size || ''}`;

  /* ============================================================
     عملیات سبد
     ============================================================ */

  /** افزودن به سبد — اگر همان ردیف بود، شمارش بالا می‌رود */
  function add(productId, { color = '', size = '', qty = 1 } = {}) {
    const p = productById(productId);
    if (!p) throw new Error('این محصول دیگر در دسترس نیست.');
    if (p.status !== 'active') throw new Error('این محصول فعلاً قابل سفارش نیست.');

    const stock = Number(p.stock) || 0;
    if (stock <= 0) throw new Error('این محصول ناموجود است.');

    const cart = read();
    const key = lineKey(productId, color, size);
    const row = cart.find((r) => r.key === key);
    const have = row ? row.qty : 0;

    if (have + qty > stock) {
      /* عدد کل موجودی لو نمی‌رود. ولی اگر مشتری از قبل چیزی
         در سبد دارد، باید بفهمد چرا بیشتر نمی‌شود — وگرنه
         فکر می‌کند سایت خراب است. */
      var left = Math.max(0, stock - have);
      throw new Error(
        stock <= 0 ? 'این کالا فعلاً موجود نیست.'
        : left === 0 ? 'همه‌ی موجودی این کالا در سبد شماست.'
        : `فقط ${faNum(left)} عدد دیگر می‌توانید اضافه کنید.`);
    }

    if (row) row.qty += qty;
    else cart.push({ key, productId: String(productId), sellerId: p.sellerId, color, size, qty, date: nowFa() });

    write(cart);
    return true;
  }

  /** تغییر تعداد یک ردیف */
  function setQty(key, qty) {
    const cart = read();
    const row = cart.find((r) => r.key === key);
    if (!row) return false;

    const n = Math.max(0, Math.round(Number(qty) || 0));
    if (n === 0) return remove(key);

    const p = productById(row.productId);
    const stock = Number(p?.stock) || 0;
    /* عدد موجودی لو نمی‌رود — ولی اگر مشتری دارد همین را
       می‌خرد، باید بداند چند تا می‌تواند بردارد */
    if (n > stock) {
      throw new Error(stock <= 0
        ? 'این کالا فعلاً موجود نیست.'
        : `بیشتر از ${faNum(stock)} عدد نمی‌توانید بردارید.`);
    }

    row.qty = n;
    write(cart);
    return true;
  }

  function remove(key) {
    write(read().filter((r) => r.key !== key));
    return true;
  }

  function clear() {
    write([]);
    writeCoupon('');       /* کد تخفیف با سبد پاک می‌شود */
  }

  /** تعداد کل اقلام — برای نشان روی آیکون سبد */
  function count() {
    return read().reduce((a, r) => a + r.qty, 0);
  }

  /* ============================================================
     سبد کامل با جزئیات — گروه‌بندی‌شده بر پایه‌ی فروشنده
     ============================================================ */
  function detailed() {
    const rows = [];
    let changed = false;

    /* کالاها و فروشگاه‌ها یک بار خوانده و در نقشه ریخته می‌شوند.
       پیش‌تر `productById` برای هر ردیف کل فهرست را از حافظه
       می‌خواند و پارس می‌کرد — با ۴۰ ردیف و ۲۰۰۰ کالا یعنی
       ۸۰ بار پارس کامل. سبد ۹۰ میلی‌ثانیه طول می‌کشید. */
    const pMap = new Map();
    allProducts().forEach((x) => pMap.set(String(x.id), x));
    const sMap = new Map();
    allSellers().forEach((x) => sMap.set(String(x.id), x));

    for (const r of read()) {
      const p = pMap.get(String(r.productId)) || null;

      // محصولی که حذف یا پیش‌نویس شده، از سبد بیرون می‌رود
      if (!p || p.status !== 'active') { changed = true; continue; }

      const stock = Number(p.stock) || 0;
      const qty = Math.min(r.qty, stock);
      if (qty <= 0) { changed = true; continue; }
      if (qty !== r.qty) changed = true;

      const s = sMap.get(String(p.sellerId)) || null;

      /* قیمت با احتساب تخفیف فعال */
      const sale = window.DPPromo
        ? DPPromo.sales.priceOf(p)
        : { price: Number(p.price) || 0, old: null, percent: 0 };

      /* قیمت هرگز منفی یا نامعتبر نمی‌شود.
         اگر فروشنده اشتباهی عدد منفی وارد کند یا داده خراب
         باشد، جمع سبد منفی می‌شد — یعنی سایت به مشتری
         بدهکار می‌شد. اینجا کف صفر گذاشته می‌شود. */
      const safePrice = Math.max(0, Number(sale.price) || 0);
      const safeOld = Math.max(0, Number(sale.old) || 0);

      rows.push({
        ...r,
        qty,
        name: p.name,
        price: safePrice,
        oldPrice: sale.percent && safeOld > safePrice ? safeOld : null,
        discount: sale.percent,
        image: (p.images || [])[0] || '',
        stock,
        section: p.section || '',
        category: p.category || '',
        sellerName: s?.storeName || 'فروشگاه',
        sellerLogo: s?.logo || '',
        total: safePrice * qty,
      });
    }

    // اگر چیزی ناموجود شده بود، سبد را تمیز می‌کنیم
    if (changed) {
      write(rows.map(({ key, productId, sellerId, color, size, qty, date }) =>
        ({ key, productId, sellerId, color, size, qty, date })));
    }

    /* گروه‌بندی بر پایه‌ی فروشنده */
    const groups = {};
    for (const r of rows) {
      (groups[r.sellerId] = groups[r.sellerId] || {
        sellerId: r.sellerId, sellerName: r.sellerName, sellerLogo: r.sellerLogo, items: [], sum: 0,
      });
      groups[r.sellerId].items.push(r);
      groups[r.sellerId].sum += r.total;
    }

    const list = Object.values(groups);
    const sum = rows.reduce((a, r) => a + r.total, 0);

    /* ============================================================
       کد تخفیف
       ------------------------------------------------------------
       هر بار از نو بررسی می‌شود. اگر سبد عوض شده و کد دیگر
       شرطش را ندارد، خودکار کنار می‌رود و دلیلش گفته می‌شود.
       ============================================================ */
    let coupon = null;
    const code = readCoupon();

    if (code && window.DPPromo?.coupons) {
      const res = DPPromo.coupons.check(code, {
        rows,
        user: userKey(),
        hasOrders: hasOrders(),
      });

      if (res.ok) {
        coupon = {
          code: res.coupon.code,
          title: res.coupon.title,
          id: res.coupon.id,
          sellerId: res.sellerId,
          off: res.off,
          freeShip: res.freeShip,
          perk: res.perk || '',
          label: res.label,
          base: res.base,
        };
        /* تخفیف روی همان گروه فروشنده هم نشان داده می‌شود */
        const g = list.find((x) => String(x.sellerId) === String(res.sellerId));
        if (g) {
          g.couponOff = res.off;
          g.couponCode = res.coupon.code;
          g.couponShip = !!res.freeShip;
          g.couponPerk = res.perk || '';
        }
      } else {
        /* کد نامعتبر شد — پاکش می‌کنیم ولی دلیل را برمی‌گردانیم */
        coupon = { code, invalid: true, reason: res.error };
        writeCoupon('');
      }
    }

    const off = coupon && !coupon.invalid ? coupon.off : 0;
    const payable = Math.max(0, sum - off);

    return {
      rows, groups: list,
      count: rows.reduce((a, r) => a + r.qty, 0),
      sellerCount: list.length,
      sum,
      coupon,
      discount: off,
      shipping: 0,
      payable,
    };
  }

  /* ============================================================
     اعمال و برداشتن کد تخفیف
     ============================================================ */
  function applyCoupon(raw) {
    const P = window.DPPromo?.coupons;
    if (!P) throw new Error('سامانه‌ی کد تخفیف در دسترس نیست.');

    const code = P.normCode(raw);
    if (!code) throw new Error('کد تخفیف را بنویسید.');

    /* روی سبد بدون کد بررسی می‌شود، وگرنه کد قبلی اثر می‌گذارد */
    const saved = readCoupon();
    writeCoupon('');
    const snapshot = detailed();
    writeCoupon(saved);

    const res = P.check(code, {
      rows: snapshot.rows,
      user: userKey(),
      hasOrders: hasOrders(),
    });

    if (!res.ok) throw new Error(res.error);

    writeCoupon(res.coupon.code);
    document.dispatchEvent(new CustomEvent('dp:cart'));
    return res;
  }

  function removeCoupon() {
    writeCoupon('');
    document.dispatchEvent(new CustomEvent('dp:cart'));
  }

  /* ============================================================
     ثبت سفارش
     ------------------------------------------------------------
     برای هر فروشنده یک سفارش جداگانه ساخته می‌شود،
     چون هرکدام باید در پنل خودش آن را ببیند.
     ============================================================ */
  function checkout({ name, phone, address, note = '' }) {
    const user = window.DPUser?.me();
    if (!user) throw new Error('برای ثبت سفارش باید وارد حساب شوید.');

    if (!name || !name.trim()) throw new Error('نام گیرنده را بنویسید.');
    if (!/^0\d{10}$/.test(String(phone).replace(/[^\d]/g, ''))) {
      throw new Error('شماره موبایل معتبر نیست.');
    }
    if (!address || address.trim().length < 10) throw new Error('نشانی را کامل‌تر بنویسید.');

    const cart = detailed();
    if (!cart.rows.length) throw new Error('سبد خرید شما خالی است.');

    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    const orders = (() => { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(ORD));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch { return []; } })();
    const made = [];

    cart.groups.forEach((g, i) => {
      const id = `DP-${stamp}${i ? '-' + (i + 1) : ''}`;
      /* کد تخفیف فقط روی سفارش همان فروشنده می‌نشیند */
      const cOff = Number(g.couponOff) || 0;
      orders.push({
        id,
        sellerId: g.sellerId,
        userId: user.id,
        couponCode: g.couponCode || '',
        couponOff: cOff,
        /* مزیت قول‌داده‌شده روی سفارش ثبت می‌شود تا فروشنده
           بداند چه چیزی باید همراه بسته بفرستد */
        couponPerk: g.couponPerk || '',
        couponShip: !!g.couponShip,
        customer: name.trim(),
        phone: String(phone).replace(/[^\d]/g, ''),
        address: address.trim(),
        note,
        items: g.items.map((x) => x.name),
        lines: g.items.map((x) => ({
          productId: x.productId, name: x.name, price: x.price,
          qty: x.qty, color: x.color, size: x.size,
        })),
        count: g.items.reduce((a, x) => a + x.qty, 0),
        /* مبلغ خام و مبلغ نهایی هر دو ثبت می‌شوند تا فروشنده
           بداند چقدر تخفیف داده و حسابرسی شفاف بماند */
        subtotal: g.sum,
        total: Math.max(0, g.sum - cOff),
        status: 'pending',
        date: nowFa(),
      });
      made.push(id);
    });

    localStorage.setItem(ORD, JSON.stringify(orders));

    // ═══ track ماموریت: اولین خرید ═══
    if (window.ClubTracker) {
      window.ClubTracker.track('m10', 1, { type: 'first-order', orderIds: made });
    }

    /* ---------- آموزش مغز ----------
       خرید قوی‌ترین سیگنال ممکن است: مشتری پول داده.
       همه‌ی کالاهای یک سفارش با هم یاد گرفته می‌شوند. */
    if (window.DPBrain) {
      try {
        const _all = (function(){var _v;try{_v=JSON.parse(localStorage.getItem('dp_products'));}catch(e){}return Array.isArray(_v)?_v:[];})();
        const _by = {}; _all.forEach((x) => { if (x && x.id) _by[String(x.id)] = x; });
        cart.groups.forEach((g) => {
          const _items = g.items.map((x) => _by[String(x.productId)]).filter(Boolean);
          if (_items.length) DPBrain.track('purchase', { items: _items, userId: user.id });
        });
      } catch (e) { /* مغز هرگز نباید خرید را بشکند */ }
    }

    /* ---------- ثبت مصرف کد تخفیف ---------- */
    if (cart.coupon && !cart.coupon.invalid && window.DPPromo?.coupons) {
      try {
        const idx = cart.groups.findIndex(
          (g) => String(g.sellerId) === String(cart.coupon.sellerId));
        DPPromo.coupons.redeem(cart.coupon.id, {
          user: userKey(),
          orderId: made[idx > -1 ? idx : 0] || made[0] || '',
          off: cart.coupon.off,
        });
      } catch (e) {
        /* اگر ثبت مصرف نشد، سفارش نباید بشکند — فقط لاگ */
        console.warn('[cart] ثبت مصرف کد تخفیف ناموفق بود', e);
      }
    }

    // موجودی کالاها کم می‌شود
    const prods = allProducts();
    for (const r of cart.rows) {
      const p = prods.find((x) => String(x.id) === String(r.productId));
      if (!p) continue;
      p.stock = Math.max(0, (Number(p.stock) || 0) - r.qty);
      p.sales = (Number(p.sales) || 0) + r.qty;
      if (p.stock === 0 && p.status === 'active') p.status = 'out_of_stock';
    }
    localStorage.setItem('dp_products', JSON.stringify(prods));

    clear();
    return { orders: made, count: made.length };
  }

  /** سفارش‌های همین مشتری */
  function myOrders() {
    const user = window.DPUser?.me();
    if (!user) return [];
    try {
      return ((function(){var _v;try{_v=JSON.parse(localStorage.getItem(ORD));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})())
        .filter((o) => o.userId === user.id).reverse();
    } catch { return []; }
  }

  const faNum = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  window.DPCart = {
    add, setQty, remove, clear, count, detailed, checkout, myOrders,
    productById, sellerById, lineKey,
    applyCoupon, removeCoupon, readCoupon,
  };
})();
