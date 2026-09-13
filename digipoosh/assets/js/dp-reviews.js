/* ============================================================
   دیجی‌پوش — نظر و امتیاز
   ------------------------------------------------------------
   • هر مشتری واردشده می‌تواند به فروشگاه یا محصول ستاره بدهد
   • هر کس فقط یک نظر برای هر فروشگاه/محصول — قابل ویرایش
   • میانگین امتیازها واقعاً روی کارت‌ها و پنل فروشنده اثر می‌گذارد
   ============================================================ */
'use strict';

(function () {
  const CFG = window.DP_CONFIG || {};
  const REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const KEY = 'dp_reviews';

  const read = () => { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(KEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch { return []; } };
  const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));
  const uid = () => 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nowFa = () => new Intl.DateTimeFormat('fa-IR').format(new Date());

  async function rest(pathName, opts = {}) {
    const res = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + pathName, {
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
     خواندن نظرها
     ------------------------------------------------------------
     kind = 'store' یا 'product'
     ============================================================ */
  async function list(kind, targetId) {
    if (REMOTE) {
      const col = kind === 'store' ? 'seller_id' : 'product_id';
      const rows = await rest(
        `reviews?${col}=eq.${encodeURIComponent(targetId)}&select=*&order=created_at.desc`
      ).catch(() => []);
      return (rows || []).map((r) => ({
        id: r.id,
        kind,
        targetId,
        userId: r.user_id,
        userName: r.user_name || 'کاربر دیجی‌پوش',
        rating: Number(r.rating) || 0,
        text: r.comment || '',
        date: r.created_at ? new Intl.DateTimeFormat('fa-IR').format(new Date(r.created_at)) : '',
      }));
    }

    return read()
      .filter((r) => r.kind === kind && String(r.targetId) === String(targetId))
      .filter((r) => !r.hidden)          // نظرهای پنهان‌شده‌ی مدیر دیده نمی‌شوند
      .reverse();
  }

  /** خلاصه: میانگین، تعداد و پراکندگی ستاره‌ها */
  async function summary(kind, targetId) {
    const rs = await list(kind, targetId);
    if (!rs.length) return { avg: null, count: 0, spread: [0, 0, 0, 0, 0] };

    const spread = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of rs) {
      const n = Math.min(5, Math.max(1, Math.round(r.rating)));
      spread[n - 1]++;
      sum += r.rating;
    }
    return {
      avg: Math.round((sum / rs.length) * 10) / 10,
      count: rs.length,
      spread,
    };
  }

  /** نظر خود کاربر (اگر قبلاً نوشته باشد) */
  async function mine(kind, targetId) {
    const u = window.DPUser?.me();
    if (!u) return null;
    return (await list(kind, targetId)).find((r) => r.userId === u.id) || null;
  }

  /* ============================================================
     ثبت یا ویرایش نظر
     ============================================================ */
  /* ============================================================
     خرید تأییدشده
     ------------------------------------------------------------
     امتیاز وقتی واقعی است که از خریدار واقعی بیاید. اینجا
     سفارش‌های همان کاربر خوانده می‌شود و بررسی می‌شود که
     آیا این کالا (یا کالایی از این فروشگاه) را واقعاً
     خریده و تحویل گرفته است یا نه.

     خروجی:
       { ok, delivered, count, firstDate }
     ============================================================ */
  const DONE = ['delivered', 'completed'];

  function readOrders(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : [];
    } catch (e) { return []; }
  }

  function purchaseOf(kind, targetId, userId) {
    /*
     * دو انبار سفارش داریم و هر دو باید بررسی شوند:
     *   dp_orders  → خرده‌فروشی (شناسه‌ی مشتری در `userId`)
     *   dpw_orders → عمده‌فروشی (خریدار با شماره تماس شناخته می‌شود،
     *                چون ممکن است حساب کاربری نداشته باشد)
     * بدون این، خریدار واقعی عمده از امتیاز دادن محروم می‌شد.
     */
    const me = window.DPUser?.me();
    const myPhone = String(me?.phone || '').replace(/\D/g, '');

    const retail = readOrders('dp_orders')
      .filter((o) => o.userId === userId);

    const whole = myPhone
      ? readOrders('dpw_orders').filter(
          (o) => String(o.buyerPhone || '').replace(/\D/g, '') === myPhone)
      : [];

    let count = 0, delivered = 0, firstDate = '';

    const scan = (list, lineKey) => {
      for (const o of list) {
        let hit = false;

        if (kind === 'store') {
          hit = String(o.sellerId) === String(targetId);
        } else {
          const lines = Array.isArray(o[lineKey]) ? o[lineKey] : [];
          hit = lines.some((l) => l && String(l.productId) === String(targetId));
        }

        if (!hit) continue;
        count++;
        if (DONE.includes(o.status)) {
          delivered++;
          if (!firstDate) firstDate = o.date || '';
        }
      }
    };

    scan(retail, 'lines');
    scan(whole, 'lines');

    return { ok: count > 0, delivered: delivered > 0, count, firstDate };
  }

  /** آیا این کاربر اجازه‌ی ثبت نظر دارد؟ */
  function canReview(kind, targetId) {
    const u = window.DPUser?.me();
    if (!u) return { can: false, why: 'برای ثبت نظر باید وارد حساب شوید.' };

    const p = purchaseOf(kind, targetId, u.id);

    if (!p.ok) {
      return {
        can: false,
        why: kind === 'store'
          ? 'فقط کسانی که از این فروشگاه خرید کرده‌اند می‌توانند امتیاز بدهند.'
          : 'فقط خریداران این کالا می‌توانند امتیاز بدهند.',
      };
    }

    if (!p.delivered) {
      return {
        can: false,
        why: 'سفارش شما هنوز تحویل نشده است. پس از تحویل می‌توانید نظر بدهید.',
      };
    }

    return { can: true, why: '', purchase: p };
  }

  async function save(kind, targetId, rating, text, sellerId) {
    const u = window.DPUser?.me();
    if (!u) throw new Error('برای ثبت نظر باید وارد حساب شوید.');

    /* دروازه‌ی خرید — بدون خرید تحویل‌شده، امتیاز ثبت نمی‌شود */
    const gate = canReview(kind, targetId);
    if (!gate.can) throw new Error(gate.why);

    const n = Math.min(5, Math.max(1, Math.round(Number(rating) || 0)));
    if (!n) throw new Error('لطفاً امتیاز خود را با ستاره‌ها مشخص کنید.');

    const body = String(text || '').trim();
    if (body.length > 600) throw new Error('متن نظر نباید بیشتر از ۶۰۰ نویسه باشد.');

    if (REMOTE) {
      const col = kind === 'store' ? 'seller_id' : 'product_id';
      const old = await mine(kind, targetId);
      const payload = {
        [col]: targetId,
        seller_id: sellerId || (kind === 'store' ? targetId : undefined),
        user_id: u.id,
        user_name: u.fullName || String(u.email || '').split('@')[0] || 'کاربر',
        rating: n,
        comment: body,
      };
      if (old) {
        await rest(`reviews?id=eq.${old.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await rest('reviews', { method: 'POST', body: JSON.stringify(payload) });
      }
      return true;
    }

    const all = read();
    const i = all.findIndex(
      (r) => r.kind === kind && String(r.targetId) === String(targetId) && r.userId === u.id
    );

    const old = i > -1 ? all[i] : null;

    const rec = {
      id: old ? old.id : uid(),
      kind,
      targetId: String(targetId),
      sellerId: sellerId || (kind === 'store' ? String(targetId) : ''),
      userId: u.id,
      userName: u.fullName || String(u.email || '').split('@')[0] || 'کاربر',
      rating: n,
      text: body,
      date: nowFa(),

      /* نشان «خرید تأییدشده» — از سفارش واقعی گرفته شده */
      verified: true,
      orderCount: gate.purchase ? gate.purchase.count : 0,

      /* اگر فروشنده قبلاً پاسخ داده، پاک نمی‌شود */
      reply: old ? (old.reply || '') : '',
      replyDate: old ? (old.replyDate || '') : '',

      /* گزارش به مدیر و وضعیت بررسی */
      flagged: old ? !!old.flagged : false,
      flagReason: old ? (old.flagReason || '') : '',
      hidden: old ? !!old.hidden : false,
      seen: false,          // فروشنده هنوز ندیده
    };

    if (i > -1) all[i] = rec; else all.push(rec);
    write(all);

    // ═══ track ماموریت: ثبت نظر ═══
    if (window.ClubTracker) {
      window.ClubTracker.track('m5', 1, { kind, targetId, rating: n });
    }

    return true;
  }

  async function remove(kind, targetId) {
    const u = window.DPUser?.me();
    if (!u) return false;

    if (REMOTE) {
      const old = await mine(kind, targetId);
      if (old) await rest(`reviews?id=eq.${old.id}`, { method: 'DELETE' });
      return true;
    }

    write(read().filter(
      (r) => !(r.kind === kind && String(r.targetId) === String(targetId) && r.userId === u.id)
    ));
    return true;
  }

  /* ============================================================
     پاسخ فروشنده
     ============================================================ */

  /** فروشنده به یک نظر پاسخ می‌دهد یا پاسخش را ویرایش می‌کند */
  function reply(reviewId, text) {
    const body = String(text || '').trim();
    if (body.length < 3) throw new Error('پاسخ خیلی کوتاه است.');
    if (body.length > 500) throw new Error('پاسخ نباید بیشتر از ۵۰۰ نویسه باشد.');

    const all = read();
    const r = all.find((x) => x.id === reviewId);
    if (!r) throw new Error('نظر پیدا نشد.');

    r.reply = body;
    r.replyDate = nowFa();
    r.seen = true;
    write(all);
    return true;
  }

  /** حذف پاسخ */
  function unreply(reviewId) {
    const all = read();
    const r = all.find((x) => x.id === reviewId);
    if (!r) return false;
    r.reply = '';
    r.replyDate = '';
    write(all);
    return true;
  }

  /** فروشنده نظر را برای بررسی به مدیر گزارش می‌دهد */
  function flag(reviewId, reason) {
    const why = String(reason || '').trim();
    if (why.length < 5) throw new Error('لطفاً دلیل گزارش را بنویسید.');

    const all = read();
    const r = all.find((x) => x.id === reviewId);
    if (!r) throw new Error('نظر پیدا نشد.');

    r.flagged = true;
    r.flagReason = why;
    r.flagDate = nowFa();
    write(all);
    return true;
  }

  /* ============================================================
     مدیریت — فقط برای پنل ادمین
     ============================================================ */
  const admin = {
    /** همه‌ی نظرها، تازه‌ترین اول */
    all() { return read().slice().reverse(); },

    /** نظرهای گزارش‌شده که هنوز بررسی نشده‌اند */
    flagged() {
      return read().filter((r) => r.flagged && !r.reviewed).reverse();
    },

    /** پنهان کردن نظر — از سایت برداشته می‌شود */
    hide(id, note) {
      const all = read();
      const r = all.find((x) => x.id === id);
      if (!r) return false;
      r.hidden = true;
      r.reviewed = true;
      r.adminNote = String(note || '').trim();
      write(all);
      return true;
    },

    /** برگرداندن نظر پنهان‌شده */
    unhide(id) {
      const all = read();
      const r = all.find((x) => x.id === id);
      if (!r) return false;
      r.hidden = false;
      r.reviewed = true;
      write(all);
      return true;
    },

    /** رد کردن گزارش — نظر سر جایش می‌ماند */
    dismiss(id, note) {
      const all = read();
      const r = all.find((x) => x.id === id);
      if (!r) return false;
      r.reviewed = true;
      r.flagged = false;
      r.adminNote = String(note || '').trim();
      write(all);
      return true;
    },

    /** حذف کامل نظر */
    remove(id) {
      write(read().filter((r) => r.id !== id));
      return true;
    },
  };

  /* ============================================================
     نظرهای یک فروشنده — برای پنل فروشنده
     ============================================================ */
  function forSeller(sellerId) {
    let prods = [];
    try { prods = (window.DPSafe ? DPSafe.products() : []); } catch (e) {}

    const mine = prods.filter((p) => p.sellerId === sellerId).map((p) => String(p.id));
    const names = {};
    prods.forEach((p) => { names[String(p.id)] = p.name; });

    return read()
      .filter((r) =>
        (r.kind === 'store' && String(r.targetId) === String(sellerId)) ||
        (r.kind === 'product' && mine.indexOf(String(r.targetId)) > -1))
      .map((r) => ({
        ...r,
        about: r.kind === 'store' ? 'فروشگاه' : (names[String(r.targetId)] || 'محصول'),
      }))
      .reverse();
  }

  /** شمار نظرهای دیده‌نشده */
  function unseenFor(sellerId) {
    return forSeller(sellerId).filter((r) => !r.seen && !r.hidden).length;
  }

  /** همه‌ی نظرهای یک فروشنده را «دیده‌شده» علامت بزن */
  function markSeen(sellerId) {
    const all = read();
    let ch = false;
    forSeller(sellerId).forEach((x) => {
      const r = all.find((y) => y.id === x.id);
      if (r && !r.seen) { r.seen = true; ch = true; }
    });
    if (ch) write(all);
  }

  /* ============================================================
     خلاصه‌ی امتیاز برای فهرست فروشگاه‌ها (بدون درخواست جداگانه)
     ============================================================ */
  function storeRatingsMap() {
    const map = {};
    for (const r of read()) {
      if (r.kind !== 'store' || r.hidden) continue;
      (map[r.targetId] = map[r.targetId] || []).push(r.rating);
    }
    const out = {};
    for (const [id, arr] of Object.entries(map)) {
      out[id] = {
        avg: Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10,
        count: arr.length,
      };
    }
    return out;
  }

  /* ============================================================
     ستاره‌های SVG — فقط برای نمایش
     ============================================================ */
  function stars(value, size = 16) {
    const v = Number(value) || 0;
    let out = `<span class="dp-stars" role="img" aria-label="امتیاز ${v} از ۵" style="--s:${size}px">`;
    for (let i = 1; i <= 5; i++) {
      const fill = v >= i ? 'full' : v >= i - 0.5 ? 'half' : 'empty';
      out += `<svg class="dp-star ${fill}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/></svg>`;
    }
    return out + '</span>';
  }

  const faNum = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]).replace('.', '٫');

  window.DPReviews = {
    mode: REMOTE ? 'supabase' : 'local',
    list, summary, mine, save, remove, stars, storeRatingsMap, faNum,
    reply, unreply, flag, forSeller, unseenFor, markSeen, admin,
    canReview, purchaseOf,
  };
})();
