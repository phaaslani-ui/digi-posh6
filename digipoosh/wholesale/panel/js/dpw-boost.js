/* ============================================================
   دیجی‌پوش — نردبان و برجسته‌سازی عمده‌فروشان
   ------------------------------------------------------------
   جدا از نردبان تک‌فروشان است و عمداً هم جدا نگه داشته شده:

     • حافظه‌ی جدا  → `dpw_boosts` نه `dp_boosts`
     • بسته‌ی جدا   → متناسب با خریدار حرفه‌ای
     • دامنه‌ی جدا  → فقط و فقط در «بازار عمده‌فروشان»

   یعنی عمده‌فروشی که نردبان می‌خرد، در ویترین اصلی سایت
   (زنانه، مردانه، بچگانه، نوجوان) هیچ اثری نمی‌گذارد.
   دو بازار از هم مستقل‌اند.

   بارگذاری: پس از `dpw-store.js`
   ============================================================ */
'use strict';

(function () {

  if (typeof window === 'undefined') return;

  var KEY = 'dpw_boosts';
  var DAY = 86400000;

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) {
    return String(n == null ? '' : n).replace(/\d/g, function (d) { return FA[+d]; });
  };
  var money = function (n) {
    return fa(Math.round(Number(n) || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  var nowFa = function () {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date()); }
    catch (e) { return ''; }
  };

  /** تاریخ شمسی یک لحظه‌ی مشخص */
  var faDate = function (ms) {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(ms)); }
    catch (e) { return ''; }
  };

  /** تاریخ و ساعت دقیق */
  var faDateTime = function (ms) {
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(ms));
    } catch (e) { return faDate(ms); }
  };

  /** زمان دقیق باقی‌مانده */
  var timeLeft = function (r) {
    if (!r || !r.endsAt) return null;
    var ms = r.endsAt - Date.now();
    if (ms <= 0) return null;
    var d = Math.floor(ms / DAY);
    var h = Math.floor(ms / 3600000) % 24;
    var m = Math.floor(ms / 60000) % 60;
    return {
      ms: ms, d: d, h: h, m: m,
      fa: d > 0 ? fa(d) + ' روز و ' + fa(h) + ' ساعت'
        : (h > 0 ? fa(h) + ' ساعت و ' + fa(m) + ' دقیقه'
                 : fa(Math.max(1, m)) + ' دقیقه'),
    };
  };
  var uid = function () {
    return 'wb-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  function read() {
    var v;
    try { v = JSON.parse(localStorage.getItem(KEY)); } catch (e) { return []; }
    return Array.isArray(v) ? v.filter(function (x) { return x && typeof x === 'object'; }) : [];
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { return false; }
    try { document.dispatchEvent(new CustomEvent('dpw:boost')); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('dpw:change', { detail: { key: KEY } })); } catch (e) {}
    return true;
  }

  function me() {
    try {
      var s = JSON.parse(localStorage.getItem('dp_session'));
      return s && s.user_id ? s.user_id : null;
    } catch (e) { return null; }
  }

  /* ============================================================
     دوره‌ی آزمایشی
     ------------------------------------------------------------
     تا وقتی `true` است، همه‌ی بسته‌ها رایگان و بی‌درنگ فعال
     می‌شوند. برای پولی کردن، فقط این را `false` کنید.
     ============================================================ */
  var FREE_TRIAL = true;

  /* ============================================================
     بسته‌ها — همه فقط در بازار عمده
     ------------------------------------------------------------
     منطق‌شان با تک‌فروشی فرق دارد: خریدار عمده دنبال
     تأمین‌کننده‌ی مطمئن است، نه کالای زیبا. پس بسته‌ها روی
     «دیده شدن در جست‌وجو» و «اعتماد» تمرکز دارند.
     ============================================================ */
  var PLANS = {
    ladder: {
      id: 'ladder',
      fa: 'نردبان بازار',
      tone: 'ساده و مؤثر',
      desc: 'کالاهای شما بالای فهرست بازار عمده می‌آیند.',
      perks: [
        'بالاتر از کالاهای عادی در فهرست',
        'در همه‌ی فیلترها و جست‌وجوها',
        'کم‌هزینه‌ترین راه دیده شدن',
      ],
      weight: 10,
      badge: false,
      hero: false,
      days: [3, 7, 14, 30],
      price: 60000,
      color: '#6ec8d9',
    },

    highlight: {
      id: 'highlight',
      fa: 'کارت برجسته',
      tone: 'چشم‌گیر',
      desc: 'قاب طلایی و نشان «تأمین‌کننده‌ی ویژه» روی کالاها.',
      perks: [
        'قاب طلایی دور کارت کالا',
        'نشان «ویژه» کنار نام شما',
        'اعتماد بیشتر خریدار حرفه‌ای',
      ],
      weight: 25,
      badge: true,
      hero: false,
      days: [7, 14, 30],
      price: 95000,
      color: '#c9a84c',
    },

    featured: {
      id: 'featured',
      fa: 'تأمین‌کننده‌ی برگزیده',
      tone: 'پربازدید',
      desc: 'در بخش «تأمین‌کننده‌های برگزیده» بالای بازار دیده می‌شوید.',
      perks: [
        'کارت اختصاصی در بخش برگزیدگان',
        'بالاترین جایگاه فهرست کالاها',
        'قاب طلایی روی همه‌ی کالاها',
      ],
      weight: 45,
      badge: true,
      hero: false,
      featured: true,
      days: [7, 14, 30],
      price: 160000,
      color: '#c0c0c0',
    },

    hero: {
      id: 'hero',
      fa: 'بنر صدر بازار',
      tone: 'انحصاری',
      desc: 'بنر بزرگ بالای بازار عمده — در هر زمان فقط یک تأمین‌کننده.',
      perks: [
        'بنر تمام‌عرض بالای بازار عمده',
        'نمایش کالاها با قیمت پلکانی',
        'در هر لحظه فقط یک نفر',
      ],
      weight: 100,
      badge: true,
      hero: true,
      exclusive: true,
      days: [3, 7, 14],
      price: 420000,
      color: '#d4b85a',
    },
  };

  var STATUS_FA = {
    awaiting: 'در انتظار پرداخت',
    active:   'فعال',
    expired:  'پایان‌یافته',
    rejected: 'رد شد',
    paused:   'موقتاً متوقف',
  };

  /* ============================================================
     قیمت
     ============================================================ */
  function listPrice(planId, days) {
    var p = PLANS[planId];
    if (!p) return 0;
    var d = Number(days) || 0;
    var gross = p.price * d;
    var off = d >= 30 ? 20 : d >= 14 ? 12 : d >= 7 ? 6 : 0;
    return gross - Math.round(gross * off / 100);
  }

  function quote(planId, days) {
    var p = PLANS[planId];
    if (!p) throw new Error('بسته‌ی نامعتبر.');
    var d = Number(days) || 0;
    if (d < 1) throw new Error('تعداد روز را انتخاب کنید.');

    if (FREE_TRIAL) {
      return {
        plan: p, days: d, gross: 0, offPercent: 100, discount: 0,
        total: 0, perDay: 0, listGross: listPrice(planId, d), free: true,
      };
    }

    var gross = p.price * d;
    var off = d >= 30 ? 20 : d >= 14 ? 12 : d >= 7 ? 6 : 0;
    var discount = Math.round(gross * off / 100);

    return {
      plan: p, days: d, gross: gross, offPercent: off, discount: discount,
      total: gross - discount, perDay: Math.round((gross - discount) / d),
      listGross: gross, free: false,
    };
  }

  /* ============================================================
     چرخه‌ی زندگی
     ============================================================ */
  function live(r) {
    if (!r || r.status !== 'active') return false;
    if (r.paused) return false;
    return Date.now() < r.endsAt;
  }

  function daysLeft(r) {
    if (!r || !r.endsAt) return 0;
    var d = Math.ceil((r.endsAt - Date.now()) / DAY);
    return d > 0 ? d : 0;
  }

  function sweep() {
    var list = read();
    var changed = false;
    list.forEach(function (r) {
      if (r.status === 'active' && Date.now() >= r.endsAt) {
        r.status = 'expired';
        r.expiredAt = Date.now();
        r.expiredDate = nowFa();
        changed = true;
      }
    });
    if (changed) write(list);
    return list;
  }

  /** آیا جایگاه انحصاری آزاد است؟ */
  function slotFree(planId, sellerId) {
    var p = PLANS[planId];
    if (!p || !p.exclusive) return true;
    return !sweep().find(function (r) {
      return r.plan === planId && live(r) && r.sellerId !== sellerId;
    });
  }

  /** چند روز تا آزاد شدن جایگاه انحصاری */
  function slotFreeIn(planId, sellerId) {
    var busy = sweep().find(function (r) {
      return r.plan === planId && live(r) && r.sellerId !== sellerId;
    });
    return busy ? daysLeft(busy) : 0;
  }

  /* ============================================================
     خرید
     ============================================================ */
  function order(planId, days, note) {
    var id = me();
    if (!id) throw new Error('ابتدا وارد شوید.');

    var q = quote(planId, days);
    var list = sweep();

    var dup = list.find(function (r) {
      return r.sellerId === id && r.plan === planId &&
             (r.status === 'awaiting' || live(r));
    });
    if (dup) {
      throw new Error(dup.status === 'awaiting'
        ? 'سفارش این بسته در انتظار پرداخت است.'
        : 'این بسته هم‌اکنون برای شما فعال است.');
    }

    var P = PLANS[planId];
    if (P.exclusive && !slotFree(planId, id)) {
      throw new Error('این جایگاه انحصاری است و هم‌اکنون تأمین‌کننده‌ی دیگری آن را دارد — ' +
        fa(slotFreeIn(planId, id)) + ' روز دیگر آزاد می‌شود.');
    }

    var rec = {
      id: uid(),
      sellerId: id,
      plan: planId,
      days: q.days,
      price: q.total,
      offPercent: q.offPercent,
      trial: !!q.free,
      note: String(note || '').trim(),
      status: 'awaiting',
      paused: false,
      reason: '',
      createdAt: Date.now(),
      date: nowFa(),
      startsAt: null,
      endsAt: null,
      views: 0,
      clicks: 0,
      rfqs: 0,
    };

    if (FREE_TRIAL) {
      rec.status = 'active';
      rec.startsAt = Date.now();
      rec.endsAt = Date.now() + rec.days * DAY;
      rec.startDate = nowFa();
      rec.endDate = faDate(rec.endsAt);
      rec.endDateTime = faDateTime(rec.endsAt);
    }

    list.push(rec);
    write(list);
    return rec;
  }

  /** تمدید */
  function renew(recId, extraDays) {
    var list = sweep();
    var r = list.find(function (x) { return x.id === recId && x.sellerId === me(); });
    if (!r) throw new Error('بسته پیدا نشد.');
    if (r.status !== 'active') throw new Error('فقط بسته‌ی فعال تمدید می‌شود.');

    var d = Number(extraDays) || 0;
    if (d < 1) throw new Error('تعداد روز را مشخص کنید.');

    var q = quote(r.plan, d);
    r.days += d;
    r.endsAt += d * DAY;
    r.endDate = faDate(r.endsAt);
    r.endDateTime = faDateTime(r.endsAt);
    r.price = (Number(r.price) || 0) + q.total;
    r.renewals = (r.renewals || 0) + 1;
    write(list);
    return r;
  }

  /** لغو سفارش پرداخت‌نشده */
  function cancel(recId) {
    var list = read();
    var r = list.find(function (x) { return x.id === recId && x.sellerId === me(); });
    if (!r) throw new Error('سفارش پیدا نشد.');
    if (r.status !== 'awaiting') throw new Error('فقط سفارش در انتظار پرداخت لغو می‌شود.');
    write(list.filter(function (x) { return x.id !== recId; }));
    return true;
  }

  /** پایان زودهنگام */
  function stop(recId) {
    var list = read();
    var r = list.find(function (x) { return x.id === recId && x.sellerId === me(); });
    if (!r) throw new Error('بسته پیدا نشد.');
    r.status = 'expired';
    r.endsAt = Date.now();
    r.expiredDate = nowFa();
    write(list);
    return true;
  }

  /* ============================================================
     خواندن — برای پنل
     ============================================================ */
  function mine() {
    var id = me();
    return sweep()
      .filter(function (r) { return r.sellerId === id; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  function activeOf(sellerId) {
    var id = sellerId || me();
    return sweep().filter(function (r) { return r.sellerId === id && live(r); });
  }

  /* ============================================================
     خواندن — برای بازار عمده
     ------------------------------------------------------------
     این توابع در `wholesale/index.html` صدا زده می‌شوند.
     ============================================================ */

  /** وزن یک تأمین‌کننده — بالاتر یعنی بالاتر در فهرست */
  function weightOf(sellerId) {
    var w = 0;
    sweep().forEach(function (r) {
      if (r.sellerId !== sellerId || !live(r)) return;
      var p = PLANS[r.plan];
      if (p && p.weight > w) w = p.weight;
    });
    return w;
  }

  /** نقشه‌ی وزن همه — یک بار خواندن، نه به ازای هر فروشنده */
  function weightMap() {
    var m = {};
    sweep().forEach(function (r) {
      if (!live(r)) return;
      var p = PLANS[r.plan];
      if (!p) return;
      if (!m[r.sellerId] || p.weight > m[r.sellerId]) m[r.sellerId] = p.weight;
    });
    return m;
  }

  /** آیا قاب طلایی بگیرد؟ */
  function isBadged(sellerId) {
    return sweep().some(function (r) {
      if (r.sellerId !== sellerId || !live(r)) return false;
      var p = PLANS[r.plan];
      return p && p.badge;
    });
  }

  /** آیا در بخش «تأمین‌کننده‌های برگزیده» بیاید؟ */
  function isFeatured(sellerId) {
    return sweep().some(function (r) {
      if (r.sellerId !== sellerId || !live(r)) return false;
      var p = PLANS[r.plan];
      return p && (p.featured || p.hero);
    });
  }

  /** تأمین‌کننده‌ی صدر بازار (بنر بالا) */
  function heroSeller() {
    var found = null;
    sweep().forEach(function (r) {
      if (!live(r)) return;
      var p = PLANS[r.plan];
      if (p && p.hero) found = r;
    });
    return found;
  }

  /** مرتب‌سازی فهرست کالاها بر پایه‌ی نردبان فروشنده‌شان */
  function sortProducts(list) {
    var m = weightMap();
    return list.slice().sort(function (a, b) {
      return (m[b.sellerId] || 0) - (m[a.sellerId] || 0);
    });
  }

  /* ============================================================
     آمار
     ============================================================ */
  var pending = {};
  var flushTimer = null;

  function bump(sellerId, field) {
    if (!sellerId) return;
    if (!pending[sellerId]) pending[sellerId] = { v: 0, c: 0, q: 0 };
    pending[sellerId][field]++;
    if (flushTimer) return;
    flushTimer = setTimeout(flush, 2000);
  }

  function flush() {
    flushTimer = null;
    var ids = Object.keys(pending);
    if (!ids.length) return;

    var list = read();
    var touched = false;
    var key = todayKey();

    list.forEach(function (r) {
      var p = pending[r.sellerId];
      if (!p || !live(r)) return;
      r.views = (r.views || 0) + p.v;
      r.clicks = (r.clicks || 0) + p.c;
      r.rfqs = (r.rfqs || 0) + p.q;

      r.daily = r.daily || {};
      var day = r.daily[key] || { v: 0, c: 0, q: 0 };
      day.v += p.v; day.c += p.c; day.q += p.q;
      r.daily[key] = day;

      var keys = Object.keys(r.daily).sort();
      while (keys.length > 90) delete r.daily[keys.shift()];

      touched = true;
    });

    pending = {};
    if (touched) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  function countView(sellerId) { bump(sellerId, 'v'); }
  function countClick(sellerId) { bump(sellerId, 'c'); }
  function countRfq(sellerId) { bump(sellerId, 'q'); }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) flush();
    });
  }

  /** تحلیل یک بسته */
  function insight(rec) {
    var v = Number(rec.views) || 0;
    var c = Number(rec.clicks) || 0;
    var q = Number(rec.rfqs) || 0;
    var daily = rec.daily || {};
    var keys = Object.keys(daily).sort();

    var ran = rec.startsAt
      ? Math.max(1, Math.ceil((Math.min(Date.now(), rec.endsAt) - rec.startsAt) / DAY))
      : 0;

    var half = Math.floor(keys.length / 2);
    var early = 0, late = 0;
    keys.forEach(function (k, i) {
      if (i < half) early += daily[k].v; else late += daily[k].v;
    });
    var trend = early > 0 ? Math.round((late - early) / early * 100) : (late > 0 ? 100 : 0);

    return {
      views: v, clicks: c, rfqs: q,
      ctr: v > 0 ? Math.round(c / v * 1000) / 10 : 0,
      rfqRate: c > 0 ? Math.round(q / c * 1000) / 10 : 0,
      perDay: ran > 0 ? Math.round(v / ran) : 0,
      days: ran,
      trend: trend,
      series: keys.map(function (k) {
        return { day: k, v: daily[k].v, c: daily[k].c, q: daily[k].q || 0 };
      }),
      costPerRfq: (q > 0 && rec.price > 0) ? Math.round(rec.price / q) : 0,
    };
  }

  /** خلاصه‌ی همه‌ی بسته‌های من */
  function summary() {
    var list = mine();
    var v = 0, c = 0, q = 0, spent = 0, saved = 0, days = 0;

    list.forEach(function (r) {
      v += Number(r.views) || 0;
      c += Number(r.clicks) || 0;
      q += Number(r.rfqs) || 0;
      if (r.trial) { try { saved += listPrice(r.plan, r.days); } catch (e) {} }
      else if (r.status === 'active' || r.status === 'expired') {
        spent += Number(r.price) || 0;
      }
      if (r.status === 'active' || r.status === 'expired') days += Number(r.days) || 0;
    });

    return {
      count: list.length,
      active: activeOf().length,
      views: v, clicks: c, rfqs: q,
      ctr: v > 0 ? Math.round(c / v * 1000) / 10 : 0,
      spent: spent, saved: saved, days: days,
    };
  }

  /* ============================================================
     سررسید خودکار
     ============================================================ */
  var dueTimer = null;

  function nextDue() {
    var soon = 0;
    read().forEach(function (r) {
      if (r.status !== 'active' || r.paused) return;
      if (!r.endsAt || r.endsAt <= Date.now()) return;
      if (!soon || r.endsAt < soon) soon = r.endsAt;
    });
    return soon;
  }

  function runDue() {
    var before = read().map(function (r) { return r.id + ':' + r.status; }).join('|');
    sweep();
    var after = read().map(function (r) { return r.id + ':' + r.status; }).join('|');
    if (before !== after) {
      try { document.dispatchEvent(new CustomEvent('dpw:boost')); } catch (e) {}
    }
    schedNext();
  }

  function schedNext() {
    if (dueTimer) { clearTimeout(dueTimer); dueTimer = null; }
    var at = nextDue();
    if (!at) return;
    var wait = Math.min(Math.max(0, at - Date.now()), 21600000);
    dueTimer = setTimeout(runDue, wait + 60);
  }

  if (typeof window !== 'undefined') {
    document.addEventListener('dpw:boost', function () { setTimeout(schedNext, 0); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) runDue();
    });
    window.addEventListener('focus', runDue);
    window.addEventListener('storage', function (e) { if (e.key === KEY) schedNext(); });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runDue, { once: true });
    } else {
      setTimeout(runDue, 0);
    }
  }

  /* ============================================================
     در دسترس گذاشتن
     ============================================================ */
  window.DPWBoost = {
    KEY: KEY,
    PLANS: PLANS,
    STATUS_FA: STATUS_FA,
    FREE_TRIAL: FREE_TRIAL,

    fa: fa,
    money: money,
    quote: quote,
    listPrice: listPrice,
    live: live,
    daysLeft: daysLeft,
    timeLeft: timeLeft,
    faDate: faDate,
    faDateTime: faDateTime,

    /* فروشنده */
    order: order,
    renew: renew,
    cancel: cancel,
    stop: stop,
    mine: mine,
    activeOf: activeOf,

    /* بازار */
    weightOf: weightOf,
    weightMap: weightMap,
    isBadged: isBadged,
    isFeatured: isFeatured,
    heroSeller: heroSeller,
    sortProducts: sortProducts,
    slotFree: slotFree,
    slotFreeIn: slotFreeIn,

    /* آمار */
    countView: countView,
    countClick: countClick,
    countRfq: countRfq,
    insight: insight,
    summary: summary,
    flush: flush,
  };
})();
