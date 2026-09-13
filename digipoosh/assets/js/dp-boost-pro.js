/* ============================================================
   دیجی‌پوش — لایه‌ی حرفه‌ای نردبان و برجسته‌سازی
   ------------------------------------------------------------
   این فایل روی «dp-boost.js» سوار می‌شود و ده قابلیت تازه
   اضافه می‌کند. هیچ چیزی از فایل اصلی را خراب نمی‌کند؛
   فقط چند تابع را «هوشمندتر» می‌کند.

     ۱. تحلیل بازگشت سرمایه (ROI)
     ۲. تمدید خودکار با ۱۰٪ تخفیف + یادآوری
     ۳. گزارش پیشرفته: پیش و پس از برجسته‌سازی
     ۴. آزمون A/B میان دو بسته
     ۵. داشبورد درآمد برای مدیر
     ۶. تخفیف دستی مدیر برای فروشنده‌ی خاص
     ۷. نوبت‌دهی هوشمند (چرخش جایگاه)
     ۸. تاریخچه‌ی کامل با فروش و سود
     ۹. امتیاز فروشنده
    ۱۰. آمار ساعتی — بهترین ساعت‌های روز

   بارگذاری: بعد از dp-boost.js
   ============================================================ */
(function () {
  'use strict';

  if (!window.DPBoost) return;
  var B = window.DPBoost;
  var DAY = 86400000;

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };
  var money = B.money;

  /* ---------- خواندن و نوشتن حافظه‌ی محلی ---------- */
  /**
   * خواندن از حافظه با بررسی نوع.
   * اگر داده خراب باشد (مثلاً یک عدد به‌جای آرایه)، مقدار
   * پیش‌فرض برمی‌گردد — وگرنه `.forEach` روی عدد، کل سامانه
   * را از کار می‌انداخت.
   */
  function rd(k, d) {
    var v;
    try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { return d; }
    if (v == null) return d;
    if (Array.isArray(d)) {
      if (!Array.isArray(v)) return d;
      /* ردیف‌های پوچ کنار گذاشته می‌شوند */
      return v.filter(function (x) { return x && typeof x === 'object'; });
    }
    if (d && typeof d === 'object' && !Array.isArray(d) &&
        (typeof v !== 'object' || Array.isArray(v))) return d;
    return v;
  }
  function wr(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  var BKEY = 'dp_boosts';
  var boosts = function () { return rd(BKEY, []); };
  var saveBoosts = function (v) {
    wr(BKEY, v);
    document.dispatchEvent(new CustomEvent('dp:boost'));
  };
  var orders = function () { return rd('dp_orders', []); };
  var products = function () { return rd('dp_products', []); };

  /* زمان سفارش — سفارش‌های قدیمی فقط تاریخ شمسی دارند */
  function orderTime(o) {
    if (o.at) return Number(o.at);
    if (o.createdAt) return Number(o.createdAt);
    return 0;
  }

  /* ============================================================
     ۱۰. آمار ساعتی — کدام ساعت‌های روز بیشترین بازدید را دارد
     ============================================================ */
  var HKEY = 'dp_boost_hours';

  function noteHour(sellerId, field) {
    var h = new Date().getHours();
    var all = rd(HKEY, {});
    var s = all[sellerId] || { v: new Array(24).fill(0), c: new Array(24).fill(0) };
    if (!Array.isArray(s.v) || s.v.length !== 24) s.v = new Array(24).fill(0);
    if (!Array.isArray(s.c) || s.c.length !== 24) s.c = new Array(24).fill(0);
    s[field][h]++;
    all[sellerId] = s;
    wr(HKEY, all);
  }

  /* countView / countClick را می‌پوشانیم تا ساعت هم ثبت شود */
  var _view = B.countView, _click = B.countClick;
  B.countView = function (id) { try { noteHour(id, 'v'); } catch (e) {} return _view(id); };
  B.countClick = function (id) { try { noteHour(id, 'c'); } catch (e) {} return _click(id); };

  /** بهترین ساعت‌های روز برای این فروشگاه */
  function bestHours(sellerId, top) {
    var s = rd(HKEY, {})[sellerId];
    if (!s || !s.v) return [];
    var rows = s.v.map(function (v, h) {
      return { hour: h, views: v, clicks: (s.c && s.c[h]) || 0 };
    });
    var total = rows.reduce(function (a, r) { return a + r.views; }, 0);
    if (!total) return [];
    return rows
      .map(function (r) { r.share = Math.round(r.views / total * 100); return r; })
      .sort(function (a, b) { return b.views - a.views; })
      .slice(0, top || 3)
      .filter(function (r) { return r.views > 0; });
  }

  /** همه‌ی ۲۴ ساعت — برای نمودار */
  function hourSeries(sellerId) {
    var s = rd(HKEY, {})[sellerId];
    var v = (s && s.v) || new Array(24).fill(0);
    return v.map(function (n, h) { return { hour: h, views: n }; });
  }

  /* ============================================================
     پایه‌ی محاسبات — داده‌ی واقعی فروشگاه
     ============================================================ */

  /** میانگین مبلغ هر سفارش این فروشگاه (تومان) */
  function avgOrder(sellerId) {
    var os = orders().filter(function (o) { return o.sellerId === sellerId; });
    if (!os.length) {
      /* اگر سابقه ندارد، از میانگین قیمت کالاهای خودش استفاده می‌کنیم */
      var ps = products().filter(function (p) { return p.sellerId === sellerId; });
      if (!ps.length) return 0;
      var s = ps.reduce(function (a, p) { return a + (Number(p.price) || 0); }, 0);
      return Math.round(s / ps.length);
    }
    var t = os.reduce(function (a, o) { return a + (Number(o.total) || 0); }, 0);
    return Math.round(t / os.length);
  }

  /** نرخ تبدیل بازدید به خرید — از داده‌ی خود فروشگاه، وگرنه از کل سایت */
  function conversion(sellerId) {
    var v = 0, ord = 0;
    boosts().forEach(function (r) {
      if (r.sellerId !== sellerId) return;
      v += Number(r.views) || 0;
    });
    ord = orders().filter(function (o) { return o.sellerId === sellerId; }).length;

    if (v >= 50 && ord > 0) {
      return { rate: Math.min(0.2, ord / v), source: 'own', sample: v };
    }

    /* میانگین کل سایت */
    var tv = 0;
    boosts().forEach(function (r) { tv += Number(r.views) || 0; });
    var to = orders().length;
    if (tv >= 100 && to > 0) {
      return { rate: Math.min(0.2, to / tv), source: 'site', sample: tv };
    }
    /* هیچ داده‌ای نیست — برآورد محتاطانه‌ی صنعت مد آنلاین */
    return { rate: 0.022, source: 'estimate', sample: 0 };
  }

  /** میانگین بازدید روزانه‌ی یک بسته در کل سایت */
  function planBenchmark(planId) {
    var v = 0, d = 0, c = 0, n = 0;
    boosts().forEach(function (r) {
      if (r.plan !== planId) return;
      if (!r.startsAt) return;
      var ran = Math.max(1, Math.ceil((Math.min(Date.now(), r.endsAt) - r.startsAt) / DAY));
      v += Number(r.views) || 0;
      c += Number(r.clicks) || 0;
      d += ran;
      n++;
    });
    if (d >= 3 && v > 0) {
      return { perDay: Math.round(v / d), ctr: v ? c / v : 0.08, source: 'real', samples: n };
    }
    /* برآورد بر پایه‌ی وزن بسته — وزن ۱۰ ≈ ۲۵ بازدید در روز */
    var P = B.PLANS[planId] || { weight: 10 };
    return {
      perDay: Math.round(18 + P.weight * 2.4),
      ctr: 0.06 + Math.min(0.06, P.weight / 1600),
      source: 'estimate',
      samples: 0,
    };
  }

  /* ============================================================
     ۱. تحلیل بازگشت سرمایه — ROI
     ------------------------------------------------------------
     به فروشنده می‌گوید: با این هزینه، تقریباً چند بازدید،
     چند کلیک و چند فروش خواهد داشت و چقدر برمی‌گردد.
     ============================================================ */
  function roi(sellerId, planId, days) {
    var P = B.PLANS[planId];
    if (!P) throw new Error('بسته‌ی نامعتبر.');
    var d = Number(days) || 0;

    var bm = planBenchmark(planId);
    var cv = conversion(sellerId);
    var aov = avgOrder(sellerId);

    var views = Math.round(bm.perDay * d);
    var clicks = Math.round(views * bm.ctr);
    var sales = clicks * cv.rate * 6;        /* کلیک‌کننده شانس خرید بیشتری دارد */
    var salesLow = Math.max(0, Math.floor(sales * 0.6));
    var salesHigh = Math.ceil(sales * 1.5);

    var revenue = Math.round(sales * aov);
    var q = B.quote(planId, d);
    var cost = discountedTotal(sellerId, q);
    var profit = revenue - cost;

    /* درجه‌ی اطمینان: هرچه داده‌ی واقعی بیشتر، اطمینان بالاتر */
    var conf = 'low';
    if (bm.source === 'real' && cv.source === 'own') conf = 'high';
    else if (bm.source === 'real' || cv.source !== 'estimate') conf = 'mid';

    return {
      plan: P, days: d,
      views: views,
      clicks: clicks,
      sales: Math.round(sales),
      salesLow: salesLow,
      salesHigh: salesHigh,
      aov: aov,
      conversion: Math.round(cv.rate * 1000) / 10,
      convSource: cv.source,
      revenue: revenue,
      cost: cost,
      profit: profit,
      ratio: cost > 0 ? Math.round(revenue / cost * 10) / 10 : null,
      costPerView: views > 0 ? Math.round(cost / views) : 0,
      costPerClick: clicks > 0 ? Math.round(cost / clicks) : 0,
      confidence: conf,
      benchSource: bm.source,
      benchSamples: bm.samples,
    };
  }

  /* ============================================================
     ۶. تخفیف دستی مدیر + ۲. تخفیف تمدید خودکار
     ============================================================ */
  var DKEY = 'dp_boost_discounts';    /* { sellerId: {percent, note, at} } */

  function setDiscount(sellerId, percent, note) {
    var p = Math.max(0, Math.min(90, Math.round(Number(percent) || 0)));
    var all = rd(DKEY, {});
    if (p === 0) delete all[sellerId];
    else all[sellerId] = { percent: p, note: String(note || '').trim(), at: Date.now() };
    wr(DKEY, all);
    if (window.DPAdmin && DPAdmin.log) {
      DPAdmin.log('تخفیف نردبان ٪' + fa(p) + ' برای یک فروشگاه ثبت شد');
    }
    document.dispatchEvent(new CustomEvent('dp:boost'));
    return p;
  }
  function discountOf(sellerId) { return rd(DKEY, {})[sellerId] || null; }
  function allDiscounts() { return rd(DKEY, {}); }

  var AUTO_OFF = 10;     /* درصد تخفیف تمدید خودکار */

  /** درصد تخفیف اضافی این فروشنده (تخفیف مدیر + تمدید خودکار) */
  function extraOff(sellerId, withAuto) {
    var d = discountOf(sellerId);
    var p = d ? d.percent : 0;
    if (withAuto) p += AUTO_OFF;
    return Math.min(90, p);
  }

  /** مبلغ نهایی پس از تخفیف‌های اضافی */
  function discountedTotal(sellerId, q, withAuto) {
    if (!q || q.free) return 0;
    var off = extraOff(sellerId, withAuto);
    if (!off) return q.total;
    return Math.round(q.total * (100 - off) / 100);
  }

  /** برآورد کامل قیمت با همه‌ی تخفیف‌ها — برای نمایش در فرم */
  function fullQuote(sellerId, planId, days, withAuto) {
    var q = B.quote(planId, days);
    var off = extraOff(sellerId, withAuto);
    var d = discountOf(sellerId);
    return {
      base: q,
      adminOff: d ? d.percent : 0,
      adminNote: d ? d.note : '',
      autoOff: withAuto ? AUTO_OFF : 0,
      extraOff: off,
      extraAmount: q.free ? 0 : Math.round(q.total * off / 100),
      total: q.free ? 0 : discountedTotal(sellerId, q, withAuto),
      free: q.free,
    };
  }

  /* هنگام ثبت سفارش، تخفیف‌های اضافی روی مبلغ اعمال شود */
  var _order = B.order;
  B.order = function (sellerId, planId, days, note) {
    var rec = _order(sellerId, planId, days, note);
    var off = extraOff(sellerId, false);
    if (off && rec.price) {
      var list = boosts();
      var r = list.find(function (x) { return x.id === rec.id; });
      if (r) {
        r.extraOff = off;
        r.price = Math.round(r.price * (100 - off) / 100);
        saveBoosts(list);
        rec = r;
      }
    }
    return rec;
  };

  /* ============================================================
     ۲. تمدید خودکار
     ------------------------------------------------------------
     فروشنده یک بار روشن می‌کند؛ یک روز پیش از پایان یادآوری
     می‌گیرد و در لحظه‌ی پایان، بسته با ۱۰٪ تخفیف تمدید می‌شود.
     ============================================================ */
  var NKEY = 'dp_boost_notify';

  function notify(sellerId, text, kind, recId) {
    var all = rd(NKEY, []);
    /* از تکرار یادآوری جلوگیری می‌شود */
    if (all.some(function (n) { return n.recId === recId && n.kind === kind; })) return false;
    all.push({
      id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sellerId: sellerId, text: text, kind: kind, recId: recId || '',
      at: Date.now(),
      date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
      seen: false,
    });
    wr(NKEY, all.slice(-200));
    return true;
  }
  function inbox(sellerId) {
    return rd(NKEY, [])
      .filter(function (n) { return n.sellerId === sellerId; })
      .sort(function (a, b) { return b.at - a.at; });
  }
  function markRead(sellerId) {
    var all = rd(NKEY, []);
    all.forEach(function (n) { if (n.sellerId === sellerId) n.seen = true; });
    wr(NKEY, all);
  }
  function unread(sellerId) {
    return inbox(sellerId).filter(function (n) { return !n.seen; }).length;
  }

  /** روشن یا خاموش کردن تمدید خودکار روی یک بسته */
  function setAuto(recId, sellerId, on, days) {
    var list = boosts();
    var r = list.find(function (x) { return x.id === recId; });
    if (!r) throw new Error('بسته پیدا نشد.');
    if (r.sellerId !== sellerId) throw new Error('این بسته برای شما نیست.');

    if (on) {
      var P = B.PLANS[r.plan] || { days: [7] };
      r.auto = { on: true, days: Number(days) || P.days[0], off: AUTO_OFF };
    } else {
      r.auto = { on: false };
    }
    saveBoosts(list);
    return r.auto;
  }

  /**
   * ضربان — هر بار که صفحه باز می‌شود اجرا می‌شود:
   *   • یادآوری یک روز مانده
   *   • تمدید خودکار بسته‌های سررسیده
   */
  function tick() {
    var list = boosts();
    var changed = false;
    var now = Date.now();

    list.forEach(function (r) {
      if (!r.endsAt) return;
      var left = r.endsAt - now;
      var P = B.PLANS[r.plan] || {};

      /* یادآوری یک روز پیش از پایان */
      if (r.status === 'active' && left > 0 && left <= DAY) {
        if (r.auto && r.auto.on) {
          notify(r.sellerId,
            'بسته‌ی «' + (P.fa || r.plan) + '» فردا به پایان می‌رسد و ' +
            'به‌صورت خودکار ' + fa(r.auto.days) + ' روز دیگر تمدید می‌شود ' +
            '(با ٪' + fa(AUTO_OFF) + ' تخفیف تمدید خودکار).', 'renew-soon', r.id);
        } else {
          notify(r.sellerId,
            'بسته‌ی «' + (P.fa || r.plan) + '» کمتر از یک روز دیگر تمام می‌شود. ' +
            'برای قطع نشدن جایگاه، همین حالا تمدید کنید — یا تمدید خودکار را روشن کنید ' +
            'تا ٪' + fa(AUTO_OFF) + ' ارزان‌تر شود.', 'expire-soon', r.id);
        }
      }

      /* تمدید خودکار در لحظه‌ی پایان */
      if (r.status === 'active' && left <= 0 && r.auto && r.auto.on) {
        /* اگر بسته انحصاری است و کسی در صف است، تمدید نمی‌شود */
        var queued = P.exclusive && B.queueOf(r.plan).length;
        if (queued) {
          notify(r.sellerId,
            'تمدید خودکار «' + (P.fa || r.plan) + '» انجام نشد؛ ' +
            'فروشگاه دیگری در صف این جایگاه بود.', 'renew-blocked', r.id + '-b');
        } else {
          var d = Number(r.auto.days) || 7;
          var q = B.quote(r.plan, d);
          var pay = discountedTotal(r.sellerId, q, true);
          r.days += d;
          r.endsAt = now + d * DAY;
          r.price = (Number(r.price) || 0) + pay;
          r.renewals = (r.renewals || 0) + 1;
          r.autoRenewals = (r.autoRenewals || 0) + 1;
          changed = true;
          notify(r.sellerId,
            'بسته‌ی «' + (P.fa || r.plan) + '» به‌صورت خودکار ' + fa(d) + ' روز تمدید شد' +
            (pay ? ' — ' + money(pay) + ' تومان با ٪' + fa(AUTO_OFF) + ' تخفیف.' : ' (رایگان).'),
            'renewed', r.id + '-' + r.renewals);
        }
      }
    });

    if (changed) saveBoosts(list);
    try { B.wake(); } catch (e) {}
    try { B.serveQueue(); } catch (e) {}
  }

  /* ============================================================
     ۳. گزارش پیشرفته — پیش و پس از برجسته‌سازی
     ============================================================ */

  /** سفارش‌ها و درآمد یک فروشگاه در یک بازه‌ی زمانی */
  function windowStats(sellerId, from, to) {
    var n = 0, sum = 0;
    orders().forEach(function (o) {
      if (o.sellerId !== sellerId) return;
      var t = orderTime(o);
      if (!t || t < from || t > to) return;
      n++;
      sum += Number(o.total) || 0;
    });
    return { orders: n, revenue: sum };
  }

  /**
   * برای یک بسته: چه چیزی پیش از آن بود و چه چیزی پس از آن.
   * بازه‌ی «پیش» دقیقاً هم‌اندازه‌ی مدت بسته، بلافاصله قبل از آن.
   */
  function beforeAfter(rec) {
    if (!rec.startsAt) return null;
    var end = Math.min(Date.now(), rec.endsAt || Date.now());
    var len = Math.max(DAY, end - rec.startsAt);
    var before = windowStats(rec.sellerId, rec.startsAt - len, rec.startsAt);
    var after = windowStats(rec.sellerId, rec.startsAt, end);

    var pct = function (a, b) {
      if (!a) return b ? 100 : 0;
      return Math.round((b - a) / a * 100);
    };

    return {
      days: Math.max(1, Math.round(len / DAY)),
      before: before,
      after: after,
      ordersLift: pct(before.orders, after.orders),
      revenueLift: pct(before.revenue, after.revenue),
      extraOrders: after.orders - before.orders,
      extraRevenue: after.revenue - before.revenue,
    };
  }

  /** گزارش کامل یک فروشگاه */
  function report(sellerId) {
    var mine = boosts().filter(function (r) { return r.sellerId === sellerId; });
    var v = 0, c = 0, cost = 0;
    var extraOrders = 0, extraRevenue = 0;

    mine.forEach(function (r) {
      v += Number(r.views) || 0;
      c += Number(r.clicks) || 0;
      if (!r.gift) cost += Number(r.price) || 0;
      var ba = beforeAfter(r);
      if (ba) { extraOrders += ba.extraOrders; extraRevenue += ba.extraRevenue; }
    });

    var cv = conversion(sellerId);
    return {
      count: mine.length,
      views: v,
      clicks: c,
      ctr: v ? Math.round(c / v * 1000) / 10 : 0,
      cost: cost,
      extraOrders: extraOrders,
      extraRevenue: extraRevenue,
      netProfit: extraRevenue - cost,
      ratio: cost > 0 ? Math.round(extraRevenue / cost * 10) / 10 : null,
      conversion: Math.round(cv.rate * 1000) / 10,
      convSource: cv.source,
      bestHours: bestHours(sellerId, 3),
      hours: hourSeries(sellerId),
    };
  }

  /* ============================================================
     ۸. تاریخچه‌ی برجسته‌سازی — با فروش و سود هر بار
     ============================================================ */
  function history(sellerId) {
    return boosts()
      .filter(function (r) { return r.sellerId === sellerId; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; })
      .map(function (r) {
        var ins = B.insight(r);
        var ba = beforeAfter(r);
        var cost = r.gift ? 0 : (Number(r.price) || 0);
        var gain = ba ? ba.extraRevenue : 0;
        return {
          rec: r,
          plan: B.PLANS[r.plan] || { fa: r.plan, color: '#c9a84c' },
          insight: ins,
          ba: ba,
          cost: cost,
          gain: gain,
          profit: gain - cost,
          ratio: cost > 0 ? Math.round(gain / cost * 10) / 10 : null,
          verdict: verdictOf(gain, cost, ins),
        };
      });
  }

  function verdictOf(gain, cost, ins) {
    if (!ins.views) return { t: 'داده‌ی کافی نیست', k: 'mute' };
    if (cost === 0) return { t: 'رایگان بود — سود خالص', k: 'ok' };
    if (gain >= cost * 2) return { t: 'بسیار موفق — دوباره بخرید', k: 'ok' };
    if (gain >= cost) return { t: 'سودده بود', k: 'ok' };
    if (ins.ctr >= 5) return { t: 'دیده شدید ولی خرید کم بود', k: 'warn' };
    return { t: 'این بار نتیجه نداد', k: 'bad' };
  }

  /** پیشنهاد بسته‌ی بعدی بر پایه‌ی تاریخچه */
  function suggest(sellerId) {
    var h = history(sellerId).filter(function (x) { return x.insight.views > 0; });
    if (!h.length) {
      return {
        plan: 'ladder',
        why: 'برای شروع، «نردبان» کم‌هزینه‌ترین راه دیده شدن است.',
      };
    }
    var best = h.slice().sort(function (a, b) {
      return (b.ratio || 0) - (a.ratio || 0) || b.insight.ctr - a.insight.ctr;
    })[0];
    return {
      plan: best.rec.plan,
      why: 'بسته‌ی «' + best.plan.fa + '» برای شما بهترین نتیجه را داشت — ' +
           fa(best.insight.views) + ' بازدید و نرخ کلیک ٪' + fa(best.insight.ctr) + '.',
    };
  }

  /* ============================================================
     ۴. آزمون A/B — کدام بسته بهتر جواب می‌دهد
     ============================================================ */
  var ABKEY = 'dp_boost_ab';

  function abList(sellerId) {
    return rd(ABKEY, [])
      .filter(function (t) { return !sellerId || t.sellerId === sellerId; })
      .sort(function (a, b) { return b.at - a.at; });
  }

  /** آغاز آزمون: نخست بسته‌ی A، پس از پایان خودکار بسته‌ی B */
  function abStart(sellerId, planA, planB, days) {
    if (planA === planB) throw new Error('دو بسته باید متفاوت باشند.');
    if (!B.PLANS[planA] || !B.PLANS[planB]) throw new Error('بسته‌ی نامعتبر.');
    var d = Math.max(1, Math.min(14, Number(days) || 3));

    if (abList(sellerId).some(function (t) { return t.status === 'running'; })) {
      throw new Error('یک آزمون در حال اجراست. اول آن را تمام کنید.');
    }

    var recA;
    try {
      recA = B.order(sellerId, planA, d, 'آزمون A/B — روش نخست');
    } catch (e) {
      throw new Error('بسته‌ی «' + B.PLANS[planA].fa + '» را نمی‌توان آغاز کرد: ' + e.message +
        ' برای آزمون، دو بسته‌ای را انتخاب کنید که هم‌اکنون فعال نیستند.');
    }
    var all = rd(ABKEY, []);
    var t = {
      id: 't' + Date.now().toString(36),
      sellerId: sellerId,
      a: { plan: planA, days: d, recId: recA.id },
      b: { plan: planB, days: d, recId: null },
      phase: 'a',
      status: 'running',
      at: Date.now(),
      date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
    };
    all.push(t);
    wr(ABKEY, all);
    document.dispatchEvent(new CustomEvent('dp:boost'));
    return t;
  }

  /** پیشبرد آزمون‌ها — وقتی مرحله‌ی A تمام شد، B آغاز می‌شود */
  function abTick() {
    var all = rd(ABKEY, []);
    var list = boosts();
    var changed = false;

    all.forEach(function (t) {
      if (t.status !== 'running') return;
      var cur = t.phase === 'a' ? t.a : t.b;
      var rec = list.find(function (x) { return x.id === cur.recId; });
      if (!rec) return;
      var done = rec.endsAt && Date.now() >= rec.endsAt;
      if (!done) return;

      if (t.phase === 'a') {
        try {
          var recB = B.order(t.sellerId, t.b.plan, t.b.days, 'آزمون A/B — روش دوم');
          t.b.recId = recB.id;
          t.phase = 'b';
          changed = true;
          notify(t.sellerId,
            'مرحله‌ی نخست آزمون تمام شد. اکنون بسته‌ی «' +
            (B.PLANS[t.b.plan] || {}).fa + '» آزمایش می‌شود.', 'ab-phase', t.id + '-b');
        } catch (e) { /* جایگاه اشغال است — بعداً دوباره تلاش می‌شود */ }
      } else {
        t.status = 'done';
        changed = true;
        var r = abResult(t);
        notify(t.sellerId,
          'آزمون A/B تمام شد. ' + (r.winner
            ? 'برنده: «' + r.winner.fa + '».'
            : 'دو روش نتیجه‌ی نزدیکی داشتند.'), 'ab-done', t.id + '-d');
      }
    });

    if (changed) { wr(ABKEY, all); document.dispatchEvent(new CustomEvent('dp:boost')); }
  }

  function abResult(t) {
    var list = boosts();
    var pick = function (id) { return list.find(function (x) { return x.id === id; }); };
    var ra = pick(t.a.recId), rb = pick(t.b.recId);
    var ia = ra ? B.insight(ra) : null;
    var ib = rb ? B.insight(rb) : null;

    var winner = null, gap = 0;
    if (ia && ib && (ia.views || ib.views)) {
      /* معیار: نرخ کلیک، و اگر برابر بود، بازدید روزانه */
      var sa = ia.ctr * 10 + ia.perDay;
      var sb = ib.ctr * 10 + ib.perDay;
      if (Math.abs(sa - sb) > Math.max(1, (sa + sb) * 0.08)) {
        winner = sa > sb ? B.PLANS[t.a.plan] : B.PLANS[t.b.plan];
        gap = Math.round(Math.abs(sa - sb) / Math.max(1, Math.min(sa, sb)) * 100);
      }
    }
    return {
      a: { plan: B.PLANS[t.a.plan], rec: ra, insight: ia },
      b: { plan: B.PLANS[t.b.plan], rec: rb, insight: ib },
      winner: winner,
      gap: gap,
      phase: t.phase,
      status: t.status,
    };
  }

  function abStop(testId, sellerId) {
    var all = rd(ABKEY, []);
    var t = all.find(function (x) { return x.id === testId; });
    if (!t) throw new Error('آزمون پیدا نشد.');
    if (t.sellerId !== sellerId) throw new Error('این آزمون برای شما نیست.');
    t.status = 'stopped';
    wr(ABKEY, all);
    document.dispatchEvent(new CustomEvent('dp:boost'));
    return true;
  }

  /* ============================================================
     ۷. نوبت‌دهی هوشمند — چرخش جایگاه نخست
     ------------------------------------------------------------
     اگر چند فروشگاه همزمان بسته‌ی یکسان داشته باشند، به‌جای
     اینکه همیشه یکی بالا بماند، جایگاه نخست بین آن‌ها
     در بازه‌های چندساعته می‌چرخد. صفحه اشباع نمی‌شود.
     ============================================================ */
  var SLICE = 6 * 3600000;      /* هر ۶ ساعت یک نوبت */

  /** فروشگاه‌هایی که هم‌اکنون بسته‌ی یکسان دارند */
  function holders(planId) {
    return B.all('active')
      .filter(function (r) { return r.plan === planId; })
      .sort(function (a, b) { return (a.startsAt || 0) - (b.startsAt || 0); })
      .map(function (r) { return r.sellerId; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  /** نوبت کدام فروشگاه است؟ */
  function turnOf(planId) {
    var h = holders(planId);
    if (h.length < 2) return h[0] || null;
    var slot = Math.floor(Date.now() / SLICE) % h.length;
    return h[slot];
  }

  /** چند دقیقه تا نوبت بعدی */
  function nextTurnIn() {
    return Math.ceil((SLICE - (Date.now() % SLICE)) / 60000);
  }

  /** جایگاه چرخشی این فروشگاه در بسته‌اش (۱ یعنی همین حالا نخست) */
  function rotationInfo(sellerId) {
    var out = null;
    Object.keys(B.PLANS).forEach(function (k) {
      var h = holders(k);
      if (h.indexOf(sellerId) < 0 || h.length < 2) return;
      var slot = Math.floor(Date.now() / SLICE) % h.length;
      var idx = h.indexOf(sellerId);
      var away = (idx - slot + h.length) % h.length;
      var info = {
        plan: B.PLANS[k],
        total: h.length,
        position: away + 1,
        isFirst: away === 0,
        nextInMinutes: away === 0 ? nextTurnIn() : nextTurnIn() + (away - 1) * (SLICE / 60000),
      };
      if (!out || B.PLANS[k].weight > out.plan.weight) out = info;
    });
    return out;
  }

  /**
   * نقشه‌ی وزن هوشمند: وزن پایه + پاداش نوبت.
   * جایگزین weightMap برای مرتب‌سازی صفحه‌ها.
   */
  function smartWeightMap() {
    var m = B.weightMap();
    Object.keys(B.PLANS).forEach(function (k) {
      var who = turnOf(k);
      if (who && m[who] != null) m[who] += 5;    /* پاداش نوبت */
    });
    /* امتیاز فروشنده هم کمی اثر می‌گذارد — کیفیت بالاتر، بالاتر */
    var sc = scoreMap();
    Object.keys(m).forEach(function (id) {
      m[id] += (sc[id] || 0) / 40;               /* حداکثر ۲.۵ واحد */
    });
    return m;
  }

  /** مرتب‌سازی هوشمند فهرست فروشگاه‌ها */
  function sortStoresSmart(list) {
    var m = smartWeightMap();
    return list.slice().sort(function (a, b) {
      return (m[b.id] || 0) - (m[a.id] || 0);
    });
  }

  /* سازگاری: هر جای سایت که sortStores را صدا می‌زند، هوشمند شود */
  B.sortStores = sortStoresSmart;

  /* ============================================================
     ۹. امتیاز فروشنده
     ------------------------------------------------------------
     ترکیبی از: رضایت مشتری، فروش، پاسخ‌گویی و کارایی نردبان.
     عدد ۰ تا ۱۰۰.
     ============================================================ */
  /* ------------------------------------------------------------
     آمار هر فروشگاه — یک بار پیمایش، نه به ازای هر فروشگاه
     ------------------------------------------------------------
     پیش‌تر `scoreOf` برای هر فروشگاه کل سفارش‌ها، کالاها و
     نظرها را از نو می‌خواند و فیلتر می‌کرد. با ۲۰۰ فروشگاه و
     ۳۰۰۰ نظر یعنی بیش از یک میلیون عملیات — `sortStores`
     روی صفحه‌ی فهرست ۱.۳ ثانیه طول می‌کشید و صفحه یخ می‌زد.

     حالا همه‌ی داده یک بار پیمایش و در یک نقشه جمع می‌شود.
     نتیجه تا وقتی داده عوض نشده، دوباره استفاده می‌شود.
     ------------------------------------------------------------ */
  var statsCache = null;
  var statsStamp = '';

  function dataStamp() {
    try {
      return (localStorage.getItem('dp_orders') || '').length + ':' +
             (localStorage.getItem('dp_products') || '').length + ':' +
             (localStorage.getItem('dp_reviews') || '').length;
    } catch (e) { return String(Date.now()); }
  }

  function sellerStats() {
    var stamp = dataStamp();
    if (statsCache && statsStamp === stamp) return statsCache;

    var m = {};
    var slot = function (id) {
      if (!m[id]) m[id] = { orders: 0, done: 0, products: 0, rateSum: 0, rateCount: 0 };
      return m[id];
    };

    orders().forEach(function (o) {
      if (!o || !o.sellerId) return;
      var x = slot(o.sellerId);
      x.orders++;
      if (o.status === 'delivered' || o.status === 'shipped') x.done++;
    });

    products().forEach(function (p) {
      if (!p || !p.sellerId) return;
      slot(p.sellerId).products++;
    });

    /* امتیاز فروشگاه از نظرهای «فروشگاه» */
    rd('dp_reviews', []).forEach(function (r) {
      if (!r || r.hidden || r.kind !== 'store') return;
      var x = slot(String(r.targetId));
      x.rateSum += Number(r.rating) || 0;
      x.rateCount++;
    });

    statsCache = m;
    statsStamp = stamp;
    return m;
  }

  /** نمره‌گذاری از روی آمار آماده */
  function scoreFromStats(x) {
    if (!x) x = { orders: 0, done: 0, products: 0, rateSum: 0, rateCount: 0 };

    var avg = x.rateCount ? x.rateSum / x.rateCount : 0;

    /* رضایت — تا ۴۰ امتیاز (بدون نظر: میانه) */
    var sat = x.rateCount ? (avg / 5) * 40 : 20;
    /* حجم نظر — اعتماد بیشتر به فروشگاهی که نظر بیشتری دارد */
    var trust = Math.min(10, x.rateCount);
    /* فروش — لگاریتمی تا فروشگاه بزرگ همه را نبلعد */
    var sale = Math.min(25, Math.round(Math.log10(x.orders + 1) * 18));
    /* تنوع کالا */
    var range = Math.min(10, Math.round(x.products / 2));
    /* پاسخ‌گویی */
    var serve = x.orders ? Math.round(x.done / x.orders * 15) : 7;

    return Math.max(0, Math.min(100, Math.round(sat + trust + sale + range + serve)));
  }

  function scoreOf(sellerId) {
    return scoreFromStats(sellerStats()[sellerId]);
  }

  function scoreMap() {
    var st = sellerStats();
    var m = {};
    Object.keys(st).forEach(function (id) { m[id] = scoreFromStats(st[id]); });

    /* فروشگاه‌هایی که فقط بسته دارند و هنوز فروش/کالا ندارند */
    boosts().forEach(function (r) {
      if (r && r.sellerId && m[r.sellerId] == null) {
        m[r.sellerId] = scoreFromStats(null);
      }
    });
    return m;
  }

  /** رتبه‌ی کیفی: طلایی / نقره‌ای / برنزی / تازه‌کار */
  function tierOf(sellerId) {
    var s = scoreOf(sellerId);
    if (s >= 80) return { key: 'gold', fa: 'فروشنده‌ی طلایی', score: s, color: '#c9a84c' };
    if (s >= 62) return { key: 'silver', fa: 'فروشنده‌ی نقره‌ای', score: s, color: '#b9bec4' };
    if (s >= 42) return { key: 'bronze', fa: 'فروشنده‌ی برنزی', score: s, color: '#b8943c' };
    return { key: 'new', fa: 'فروشنده‌ی تازه', score: s, color: '#8a7e72' };
  }

  /** جزئیات امتیاز — برای نمایش در پنل فروشنده */
  function scoreBreak(sellerId) {
    /* از همان آمار یک‌بار-محاسبه‌شده استفاده می‌کند */
    var x = sellerStats()[sellerId] ||
            { orders: 0, done: 0, products: 0, rateSum: 0, rateCount: 0 };
    var avg = x.rateCount ? Math.round(x.rateSum / x.rateCount * 10) / 10 : 0;

    return [
      { fa: 'رضایت مشتری',
        got: x.rateCount ? Math.round(avg / 5 * 40) : 20, max: 40,
        note: x.rateCount ? fa(avg) + ' از ۵' : 'هنوز نظری ثبت نشده' },
      { fa: 'تعداد نظرها',
        got: Math.min(10, x.rateCount), max: 10,
        note: x.rateCount ? fa(x.rateCount) + ' نظر' : '—' },
      { fa: 'فروش',
        got: Math.min(25, Math.round(Math.log10(x.orders + 1) * 18)), max: 25,
        note: fa(x.orders) + ' سفارش' },
      { fa: 'تنوع کالا',
        got: Math.min(10, Math.round(x.products / 2)), max: 10,
        note: fa(x.products) + ' کالا' },
      { fa: 'پاسخ‌گویی',
        got: x.orders ? Math.round(x.done / x.orders * 15) : 7, max: 15,
        note: x.orders ? fa(x.done) + ' سفارش ارسال‌شده' : 'هنوز سفارشی نبوده' },
    ];
  }

  /* ============================================================
     خلاصه‌ی رضایت — برای پنجره‌ی کوچک روی ستاره‌ها
     ============================================================ */
  function satisfaction(sellerId) {
    var revs = rd('dp_reviews', []).filter(function (r) {
      return !r.hidden && (
        (r.kind === 'store' && String(r.targetId) === String(sellerId)) ||
        (r.kind === 'product' && r.sellerId && String(r.sellerId) === String(sellerId))
      );
    });
    if (!revs.length) return null;

    var buyers = {}, prods = {}, spread = [0, 0, 0, 0, 0], sum = 0;
    revs.forEach(function (r) {
      if (r.userId) buyers[r.userId] = 1;
      if (r.kind === 'product') prods[r.targetId] = 1;
      var n = Math.min(5, Math.max(1, Math.round(r.rating)));
      spread[n - 1]++;
      sum += Number(r.rating) || 0;
    });

    var avg = Math.round(sum / revs.length * 10) / 10;
    var happy = revs.filter(function (r) { return r.rating >= 4; }).length;

    return {
      avg: avg,
      count: revs.length,
      buyers: Object.keys(buyers).length || revs.length,
      products: Object.keys(prods).length,
      spread: spread,
      happyPercent: Math.round(happy / revs.length * 100),
      tier: tierOf(sellerId),
    };
  }

  /* ============================================================
     ۵. داشبورد مدیر
     ============================================================ */
  function adminReport() {
    var list = boosts();
    var byPlan = {};
    var bySeller = {};
    var total = 0, paidCount = 0, gifts = 0, trials = 0, wouldBe = 0;
    var views = 0, clicks = 0;

    Object.keys(B.PLANS).forEach(function (k) {
      byPlan[k] = { plan: B.PLANS[k], count: 0, revenue: 0, days: 0, views: 0, clicks: 0 };
    });

    list.forEach(function (r) {
      var p = byPlan[r.plan];
      views += Number(r.views) || 0;
      clicks += Number(r.clicks) || 0;

      if (p) {
        p.count++;
        p.days += Number(r.days) || 0;
        p.views += Number(r.views) || 0;
        p.clicks += Number(r.clicks) || 0;
      }

      var s = bySeller[r.sellerId] || (bySeller[r.sellerId] = {
        sellerId: r.sellerId, count: 0, spent: 0, days: 0, views: 0, clicks: 0,
      });
      s.count++;
      s.days += Number(r.days) || 0;
      s.views += Number(r.views) || 0;
      s.clicks += Number(r.clicks) || 0;

      if (r.gift) { gifts++; return; }
      if (r.trial || B.FREE_TRIAL) {
        trials++;
        try { wouldBe += B.quoteList(r.plan, r.days); } catch (e) {}
      }
      if (r.status === 'active' || r.status === 'expired') {
        var amt = Number(r.price) || 0;
        total += amt;
        if (amt > 0) paidCount++;
        if (p) p.revenue += amt;
        s.spent += amt;
      }
    });

    var plans = Object.keys(byPlan).map(function (k) { return byPlan[k]; })
      .sort(function (a, b) { return b.count - a.count || b.revenue - a.revenue; });

    var sellers = Object.keys(bySeller).map(function (k) { return bySeller[k]; })
      .sort(function (a, b) { return b.spent - a.spent || b.count - a.count; });

    return {
      total: total,
      paidCount: paidCount,
      gifts: gifts,
      trials: trials,
      wouldBe: wouldBe,
      views: views,
      clicks: clicks,
      ctr: views ? Math.round(clicks / views * 1000) / 10 : 0,
      plans: plans,
      topPlan: plans[0] || null,
      sellers: sellers,
      discounts: allDiscounts(),
      activeCount: B.all('active').length,
      abRunning: abList().filter(function (t) { return t.status === 'running'; }).length,
    };
  }

  /* ============================================================
     ضربان خودکار
     ============================================================ */
  function pulse() {
    try { tick(); } catch (e) {}
    try { abTick(); } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', pulse, { once: true });
    } else {
      setTimeout(pulse, 60);
    }
    setInterval(pulse, 5 * 60000);      /* هر ۵ دقیقه */
  }

  /* ============================================================
     در دسترس گذاشتن
     ============================================================ */
  window.DPBoostPro = {
    AUTO_OFF: AUTO_OFF,
    /* ROI */
    roi: roi,
    avgOrder: avgOrder,
    conversion: conversion,
    planBenchmark: planBenchmark,
    /* تخفیف */
    setDiscount: setDiscount,
    discountOf: discountOf,
    allDiscounts: allDiscounts,
    fullQuote: fullQuote,
    extraOff: extraOff,
    /* تمدید خودکار */
    setAuto: setAuto,
    tick: tick,
    inbox: inbox,
    unread: unread,
    markRead: markRead,
    /* گزارش */
    report: report,
    beforeAfter: beforeAfter,
    windowStats: windowStats,
    bestHours: bestHours,
    hourSeries: hourSeries,
    /* تاریخچه */
    history: history,
    suggest: suggest,
    /* A/B */
    abStart: abStart,
    abStop: abStop,
    abList: abList,
    abResult: abResult,
    abTick: abTick,
    /* نوبت‌دهی */
    holders: holders,
    turnOf: turnOf,
    rotationInfo: rotationInfo,
    smartWeightMap: smartWeightMap,
    sortStoresSmart: sortStoresSmart,
    nextTurnIn: nextTurnIn,
    /* امتیاز */
    scoreOf: scoreOf,
    scoreMap: scoreMap,
    tierOf: tierOf,
    scoreBreak: scoreBreak,
    satisfaction: satisfaction,
    /* مدیر */
    adminReport: adminReport,
    fa: fa,
    money: money,
  };
})();
