/* ============================================================
   دیجی‌پوش — نردبان و برجسته‌سازی فروشگاه
   ------------------------------------------------------------
   فروشنده می‌تواند فروشگاهش را بالاتر بیاورد، درست مثل
   «نردبان» دیوار. چهار بسته وجود دارد:

   ۱. نردبان        — فروشگاه به بالای فهرست می‌پرد
   ۲. برجسته        — قاب طلایی و نشان «ویژه»
   ۳. ویترین اصلی   — در صفحه‌ی نخست سایت هم دیده می‌شود
   ۴. فوق‌ویژه      — هر سه با هم، بالاترین اولویت

   جریان کار:
     فروشنده سفارش می‌دهد → در انتظار پرداخت
     → مدیر پرداخت را تأیید می‌کند → فعال می‌شود
     → پس از پایان روزها → خودکار منقضی

   نکته: مدیر می‌تواند بدون پرداخت هم به فروشگاهی نردبان
   هدیه بدهد (مثلاً فروشگاه تازه، یا جبران خسارت).
   ============================================================ */
'use strict';

(function () {
  var KEY = 'dp_boosts';

  /* ============================================================
     حالت آزمایشی — بسته‌ها رایگان
     ------------------------------------------------------------
     تا وقتی این مقدار true است:
       • هزینه‌ی همه‌ی بسته‌ها صفر نشان داده می‌شود
       • سفارش نیازی به تأیید پرداخت ندارد و بی‌درنگ فعال می‌شود
       • در پنل مدیر هم می‌شود متوقف یا پایان داد

     برای پولی‌کردن، فقط همین یک خط را به false تغییر دهید.
     هیچ چیز دیگری لازم نیست؛ قیمت‌ها سر جایشان محفوظ‌اند.
     ============================================================ */
  var FREE_TRIAL = true;

  var read = function () {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(KEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };

  var write = function (v) {
    localStorage.setItem(KEY, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:boost'));
  };

  var uid = function () {
    return 'bs-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };
  var money = function (n) {
    return fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  };
  /** تاریخ شمسی یک لحظه‌ی مشخص */
  var faDate = function (ms) {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(ms)); }
    catch (e) { return ''; }
  };

  /** تاریخ و ساعت — برای پایان دقیق بسته */
  var faDateTime = function (ms) {
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(ms));
    } catch (e) { return faDate(ms); }
  };

  var nowFa = function () {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date()); } catch (e) { return ''; }
  };

  var DAY = 86400000;

  /* ============================================================
     بسته‌ها
     ------------------------------------------------------------
     weight  → هرچه بیشتر، بالاتر در فهرست
     ============================================================ */
  /* ============================================================
     بسته‌های نردبان — هر کدام دقیقاً یک کار مشخص
     ------------------------------------------------------------
     پیش‌تر بسته‌ها با هم قاطی بودند: «برجسته» و «ویترین» و
     «صدرنشین» همه یک قاب یکسان می‌گرفتند و تفاوتشان دیده
     نمی‌شد. حالا هر توانایی جداگانه تعریف می‌شود:

       rank      → بالا رفتن در فهرست بخش خودش
       badge     → قاب و نشان روی کارت (کدام نشان؟ badgeKind)
       home      → دیده شدن در صفحه‌ی نخست
       crossPage → دیده شدن در بخش‌هایی که کالا ندارد
       spotlight → قاب اختصاصی در حساب کاربری مشتری‌ها

     قاعده‌ی طلایی: هر بسته فقط همان توانایی‌هایی را دارد که
     صریح `true` شده‌اند. بسته‌ی «فقط نردبان» هیچ نشانی
     نمی‌گیرد، و بسته‌ی «فقط برجسته» جایگاهش عوض نمی‌شود.
     ============================================================ */
  var PLANS = {

    /* ---------- فقط جایگاه، بدون هیچ نشان ---------- */
    ladder: {
      id: 'ladder',
      fa: 'نردبان',
      desc: 'فقط جایگاه: فروشگاه شما به بالای فهرست همان بخش می‌پرد.',
      note: 'هیچ نشان یا قابی نمی‌گیرید — فقط بالاتر دیده می‌شوید.',
      weight: 10,
      rank: true,
      badge: false,
      home: false,
      crossPage: false,
      spotlight: false,
      days: [3, 7, 14, 30],
      price: 45000,
      color: '#6EC8D9',
    },

    /* ---------- فقط ظاهر، بدون تغییر جایگاه ---------- */
    highlight: {
      id: 'highlight',
      fa: 'برجسته‌سازی',
      desc: 'فقط ظاهر: قاب طلایی و نشان «ویژه» روی کارت فروشگاه.',
      note: 'جایگاه شما در فهرست عوض نمی‌شود — فقط چشمگیرتر می‌شوید.',
      weight: 0,               /* عمداً صفر: جایگاه را جابه‌جا نمی‌کند */
      rank: false,
      badge: true,
      badgeKind: 'featured',
      badgeFa: 'ویژه',
      home: false,
      crossPage: false,
      spotlight: false,
      days: [7, 14, 30],
      price: 70000,
      color: '#C9A84C',
    },

    /* ---------- فقط صفحه‌ی نخست ---------- */
    showcase: {
      id: 'showcase',
      fa: 'ویترین صفحه‌ی اصلی',
      desc: 'فقط صفحه‌ی نخست: در ویترین صفحه‌ی اصلی سایت دیده می‌شوید.',
      note: 'در صفحه‌های دسته‌بندی تغییری نمی‌کند — فقط صفحه‌ی اصلی.',
      weight: 40,
      rank: true,
      badge: true,
      badgeKind: 'home',
      badgeFa: 'ویترین اصلی',
      home: true,
      crossPage: false,        /* در بخشی که کالا ندارد ظاهر نمی‌شود */
      spotlight: false,
      days: [7, 14, 30],
      price: 120000,
      color: '#C9A0B8',
    },

    /* ---------- همه‌ی توانایی‌ها با هم ---------- */
    premium: {
      id: 'premium',
      fa: 'فوق‌ویژه (همه‌کاره)',
      desc: 'همه با هم: بالاترین جایگاه، قاب طلایی، ویترین اصلی و حضور در همه‌ی بخش‌ها.',
      note: 'هر چهار مزیت نردبان، برجسته‌سازی، ویترین و حضور فراگیر.',
      weight: 70,
      rank: true,
      badge: true,
      badgeKind: 'premium',
      badgeFa: 'فوق‌ویژه',
      home: true,
      crossPage: true,         /* در بخش‌های دیگر هم دیده می‌شود */
      spotlight: false,
      bundle: true,            /* برای نمایش «همه‌کاره» در پنل */
      days: [7, 14, 30, 60],
      price: 190000,
      color: '#8B5CF6',
    },

    /* ---------- انحصاری: در حساب کاربری همه ---------- */
    spotlight: {
      id: 'spotlight',
      fa: 'صدرنشین دیجی‌پوش',
      desc: 'انحصاری: در حساب کاربری همه‌ی مشتری‌ها، در قاب اختصاصی.',
      note: 'در هر لحظه فقط یک فروشگاه می‌تواند صدرنشین باشد.',
      weight: 100,
      rank: true,
      badge: true,
      badgeKind: 'spotlight',
      badgeFa: 'صدرنشین',
      home: true,
      crossPage: true,
      spotlight: true,
      bundle: true,
      exclusive: true,
      days: [1, 3, 7],
      price: 480000,
      color: '#F5A0A0',
    },
  };

  var STATUS_FA = {
    awaiting: 'در انتظار پرداخت',
    scheduled: 'زمان‌بندی‌شده',
    queued: 'در صف نوبت',
    active:   'فعال',
    expired:  'پایان‌یافته',
    rejected: 'رد شد',
    paused:   'موقتاً متوقف',
  };

  /* ============================================================
     محاسبه
     ============================================================ */

  /** قیمت واقعی یک بسته، صرف‌نظر از حالت آزمایشی */
  function quoteList(planId, days) {
    var p = PLANS[planId];
    if (!p) return 0;
    var d = Number(days) || 0;
    var gross = p.price * d;
    var off = d >= 60 ? 25 : d >= 30 ? 20 : d >= 14 ? 12 : d >= 7 ? 6 : 0;
    return gross - Math.round(gross * off / 100);
  }

  /** هزینه‌ی یک بسته برای تعداد روز — با تخفیف پلکانی */
  function quote(planId, days) {
    var p = PLANS[planId];
    if (!p) throw new Error('بسته‌ی نامعتبر.');
    var d = Number(days) || 0;
    if (d < 1) throw new Error('تعداد روز را انتخاب کنید.');

    /* حالت آزمایشی: همه رایگان.
       `listGross` قیمتی است که اگر پولی بود پرداخت می‌شد —
       با تخفیف بلندمدت، تا فروشنده ارزش واقعی را ببیند. */
    if (FREE_TRIAL) {
      return {
        plan: p, days: d,
        gross: 0, offPercent: 100, discount: 0,
        total: 0, perDay: 0,
        listGross: quoteList(planId, d),
        free: true,
      };
    }

    var gross = p.price * d;

    /* هرچه بلندمدت‌تر، ارزان‌تر */
    var off = 0;
    if (d >= 60) off = 25;
    else if (d >= 30) off = 20;
    else if (d >= 14) off = 12;
    else if (d >= 7) off = 6;

    var discount = Math.round(gross * off / 100);
    return {
      plan: p,
      days: d,
      gross: gross,
      offPercent: off,
      discount: discount,
      total: gross - discount,
      perDay: Math.round((gross - discount) / d),
      listGross: gross,
      free: false,
    };
  }

  /** آیا این رکورد هنوز زنده است؟ */
  function live(r) {
    if (r.status !== 'active') return false;
    if (r.paused) return false;
    return Date.now() < r.endsAt;
  }

  /** زمان دقیق باقی‌مانده — روز، ساعت و دقیقه */
  function timeLeft(r) {
    if (!r || !r.endsAt) return null;
    var ms = r.endsAt - Date.now();
    if (ms <= 0) return null;
    return {
      ms: ms,
      d: Math.floor(ms / DAY),
      h: Math.floor(ms / 3600000) % 24,
      m: Math.floor(ms / 60000) % 60,
      /* متن آماده برای نمایش */
      fa: (function () {
        var d = Math.floor(ms / DAY);
        var h = Math.floor(ms / 3600000) % 24;
        if (d > 0) return fa(d) + ' روز و ' + fa(h) + ' ساعت';
        if (h > 0) return fa(h) + ' ساعت و ' + fa(Math.floor(ms / 60000) % 60) + ' دقیقه';
        return fa(Math.max(1, Math.floor(ms / 60000))) + ' دقیقه';
      })(),
    };
  }

  /** روزهای باقی‌مانده */
  function daysLeft(r) {
    if (!r.endsAt) return 0;
    var d = Math.ceil((r.endsAt - Date.now()) / DAY);
    return d > 0 ? d : 0;
  }

  /** رکوردهای منقضی را به‌روز می‌کند */
  function sweep() {
    var list = read();
    var touched = false;
    list.forEach(function (r) {
      /* زمان‌بندی‌شده‌ای که وقتش رسیده */
      if (r.status === 'scheduled' && Date.now() >= r.startsAt) {
        r.status = 'active';
        touched = true;
      }
      /* فعالی که تمام شده */
      if (r.status === 'active' && Date.now() >= r.endsAt) {
        r.status = 'expired';
        r.expiredAt = Date.now();
        r.expiredDate = nowFa();
        touched = true;
      }
    });
    if (touched) write(list);
    return list;
  }

  /* ============================================================
     سررسید دقیق — پایان خودکار در همان لحظه
     ------------------------------------------------------------
     `sweep()` فقط وقتی کار می‌کند که کسی داده را بخواند.
     اگر برگه باز بماند و کسی کاری نکند، بسته‌ی تمام‌شده
     همچنان روی صفحه می‌ماند.

     این بخش یک ساعت‌شمار واقعی می‌گذارد که دقیقاً سر وقتِ
     نزدیک‌ترین سررسید بیدار می‌شود، بسته را می‌بندد، صف را
     پیش می‌برد و به همه‌ی صفحه‌ها خبر می‌دهد.
     ============================================================ */
  var dueTimer = null;

  /* بیش از ۲۴ روز، setTimeout سرریز می‌کند — پس سقف می‌گذاریم */
  var MAX_WAIT = 21600000;        /* حداکثر ۶ ساعت، بعد دوباره حساب می‌شود */

  /** نزدیک‌ترین لحظه‌ای که چیزی باید تغییر کند */
  function nextDue() {
    var soon = 0;
    read().forEach(function (r) {
      var at = 0;
      if (r.status === 'active' && !r.paused) at = r.endsAt;
      else if (r.status === 'scheduled') at = r.startsAt;
      if (!at || at <= Date.now()) return;
      if (!soon || at < soon) soon = at;
    });
    return soon;
  }

  /**
   * وقتی سررسید رسید: بسته بسته می‌شود، جایگاه آزاد می‌شود،
   * نوبت بعدی از صف فعال می‌شود و صفحه‌ها تازه می‌شوند.
   */
  /* اثر انگشت سبک از وضعیت — به‌جای JSON.stringify پرهزینه */
  function stamp(list) {
    var s = '';
    for (var i = 0; i < list.length; i++) {
      s += list[i].id + ':' + list[i].status + '|';
    }
    return s;
  }

  function runDue() {
    var before = stamp(read());

    sweep();                 /* منقضی‌ها بسته می‌شوند */
    serveQueue();            /* جایگاه آزاد → نوبت اول فعال می‌شود */

    var after = stamp(read());

    /* فقط اگر واقعاً چیزی عوض شد، خبر می‌دهیم */
    if (before !== after && typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('dp:boost'));
    }

    schedNext();
  }

  /** ساعت‌شمار را روی نزدیک‌ترین سررسید می‌گذارد */
  function schedNext() {
    if (typeof window === 'undefined') return;
    if (dueTimer) { clearTimeout(dueTimer); dueTimer = null; }

    var at = nextDue();
    if (!at) return;                       /* چیزی در راه نیست */

    var wait = at - Date.now();
    if (wait < 0) wait = 0;
    if (wait > MAX_WAIT) wait = MAX_WAIT;  /* بعداً دوباره حساب می‌شود */

    dueTimer = setTimeout(runDue, wait + 60);   /* ۶۰ میلی‌ثانیه احتیاط */
  }

  if (typeof window !== 'undefined') {
    /* هر بار که داده عوض شد، ساعت‌شمار دوباره تنظیم می‌شود */
    document.addEventListener('dp:boost', function () { setTimeout(schedNext, 0); });

    /* اگر برگه مدتی خواب بود (لپ‌تاپ بسته)، موقع بیدار شدن
       ممکن است چند سررسید گذشته باشد — همان لحظه رسیدگی می‌شود */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) runDue();
    });
    window.addEventListener('focus', runDue);

    /* برگه‌ی دیگری داده را عوض کرده */
    window.addEventListener('storage', function (e) {
      if (e.key === KEY || e.key === QKEY) schedNext();
    });

    /* تور ایمنی: هر ۶۰ ثانیه یک بازبینی سبک.
       `nextDue()` یک بار خوانده می‌شود، نه دو بار — هر بار
       صدا زدنش کل فهرست را می‌پیماید. */
    setInterval(function () {
      if (document.hidden) return;
      var at = nextDue();
      if (at && at <= Date.now()) runDue();
    }, 60000);

    /* آغاز */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runDue, { once: true });
    } else {
      setTimeout(runDue, 0);
    }
  }

  /* ============================================================
     سمت فروشنده
     ============================================================ */

  /** سفارش بسته — در انتظار تأیید پرداخت می‌ماند */
  function order(sellerId, planId, days, note) {
    if (!sellerId) throw new Error('ابتدا وارد شوید.');

    /* اگر مدیر اجازه‌ی نردبان را از این فروشگاه گرفته باشد */
    try {
      var _u = JSON.parse(localStorage.getItem('dp_users'));
      var _me = Array.isArray(_u) ? _u.find(function (x) {
        return x && String(x.id) === String(sellerId);
      }) : null;
      if (_me && _me.noBoost) {
        throw new Error('مدیر سایت فعلاً امکان خرید نردبان را '
          + 'برای فروشگاه شما بسته است.');
      }
    } catch (e) {
      if (e && /مدیر سایت/.test(e.message)) throw e;
    }
    var q = quote(planId, days);

    var list = sweep();

    /* اگر همین بسته فعال یا در انتظار است، دوباره نگیرد */
    var dup = list.find(function (r) {
      return r.sellerId === sellerId && r.plan === planId &&
             (r.status === 'awaiting' || live(r));
    });
    if (dup) {
      throw new Error(dup.status === 'awaiting'
        ? 'سفارش قبلی این بسته هنوز در انتظار تأیید است.'
        : 'این بسته هم‌اکنون برای فروشگاه شما فعال است.');
    }

    /* بسته‌ی انحصاری — اگر فروشگاه دیگری آن را دارد، نوبت بگیرد */
    var P = PLANS[planId];
    if (P.exclusive) {
      var busy = list.find(function (r) {
        return r.plan === planId && r.sellerId !== sellerId && live(r);
      });
      if (busy) {
        throw new Error('این بسته هم‌اکنون در اختیار فروشگاه دیگری است. ' +
          fa(daysLeft(busy)) + ' روز دیگر آزاد می‌شود.');
      }
    }

    var rec = {
      id: uid(),
      sellerId: sellerId,
      plan: planId,
      days: q.days,
      price: q.total,
      offPercent: q.offPercent,
      note: String(note || '').trim(),
      status: 'awaiting',
      paused: false,
      gift: false,
      trial: FREE_TRIAL,
      reason: '',
      createdAt: Date.now(),
      date: nowFa(),
      startsAt: null,
      endsAt: null,
      views: 0,
      clicks: 0,
    };

    /* در دوره‌ی آزمایشی، پرداختی نیست — پس همان لحظه فعال می‌شود */
    if (FREE_TRIAL) {
      rec.status = 'active';
      rec.startsAt = Date.now();
      rec.endsAt = Date.now() + rec.days * DAY;
      rec.startDate = nowFa();
      /* تاریخ دقیق پایان — همان لحظه محاسبه و ذخیره می‌شود
         تا فروشنده و مدیر بدانند دقیقاً کی تمام می‌شود */
      rec.endDate = faDate(rec.endsAt);
      rec.endDateTime = faDateTime(rec.endsAt);
    }

    list.push(rec);
    write(list);
    return rec;
  }

  /* ============================================================
     صف نوبت — برای بسته‌ی انحصاری «صدرنشین»
     ------------------------------------------------------------
     وقتی جایگاه اشغال است، فروشنده می‌تواند نوبت بگیرد.
     به‌محض آزاد شدن، نوبت اول خودکار فعال می‌شود.
     ============================================================ */
  var QKEY = 'dp_boost_queue';

  var qRead = function () {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(QKEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };
  var qWrite = function (v) {
    localStorage.setItem(QKEY, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:boost'));
  };

  /** گرفتن نوبت */
  function enqueue(sellerId, planId, days) {
    var P = PLANS[planId];
    if (!P || !P.exclusive) throw new Error('این بسته صف ندارد.');
    if (slotFree(planId, sellerId)) throw new Error('جایگاه آزاد است — همین حالا بگیرید.');

    var q = qRead();
    if (q.some(function (x) { return x.sellerId === sellerId && x.plan === planId; })) {
      throw new Error('شما در صف این بسته هستید.');
    }

    q.push({
      id: uid(),
      sellerId: sellerId,
      plan: planId,
      days: Number(days) || P.days[0],
      at: Date.now(),
      date: nowFa(),
    });
    qWrite(q);
    return q.length;   /* جایگاه در صف */
  }

  /** خروج از صف */
  function dequeue(sellerId, planId) {
    qWrite(qRead().filter(function (x) {
      return !(x.sellerId === sellerId && x.plan === planId);
    }));
    return true;
  }

  /** جایگاه فروشنده در صف — صفر یعنی در صف نیست */
  function queuePos(sellerId, planId) {
    var q = qRead().filter(function (x) { return x.plan === planId; })
                   .sort(function (a, b) { return a.at - b.at; });
    for (var i = 0; i < q.length; i++) {
      if (q[i].sellerId === sellerId) return i + 1;
    }
    return 0;
  }

  /** کل صف یک بسته — برای پنل مدیر */
  function queueOf(planId) {
    return qRead().filter(function (x) { return x.plan === planId; })
                  .sort(function (a, b) { return a.at - b.at; });
  }

  /**
   * اگر جایگاه آزاد شد، نوبت اول را فعال کن.
   * هنگام هر بار خواندن داده صدا زده می‌شود.
   */
  function serveQueue() {
    var q = qRead();
    if (!q.length) return;

    var changed = false;
    Object.keys(PLANS).forEach(function (k) {
      if (!PLANS[k].exclusive) return;
      if (!slotFree(k, null)) return;          /* هنوز اشغال است */

      var line = q.filter(function (x) { return x.plan === k; })
                  .sort(function (a, b) { return a.at - b.at; });
      if (!line.length) return;

      var first = line[0];
      try {
        order(first.sellerId, k, first.days, 'از صف نوبت');
        q = q.filter(function (x) { return x.id !== first.id; });
        changed = true;
      } catch (e) { /* اگر نشد، در صف می‌ماند */ }
    });

    if (changed) qWrite(q);
  }

  /* ============================================================
     تمدید — بدون اینکه بسته قطع شود
     ============================================================ */
  function renew(id, sellerId, extraDays) {
    var list = sweep();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('بسته پیدا نشد.');
    if (r.sellerId !== sellerId) throw new Error('این بسته برای شما نیست.');
    if (r.status !== 'active') throw new Error('فقط بسته‌ی فعال تمدید می‌شود.');

    var d = Number(extraDays) || 0;
    if (d < 1) throw new Error('تعداد روز را مشخص کنید.');

    var P = PLANS[r.plan];
    if (P.exclusive) {
      /* اگر کسی در صف است، تمدید بی‌انصافی است */
      if (queueOf(r.plan).length) {
        throw new Error('فروشگاه دیگری در صف این جایگاه است؛ تمدید ممکن نیست.');
      }
    }

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

  /* ============================================================
     زمان‌بندی — شروع در تاریخ آینده
     ------------------------------------------------------------
     مثلاً فروشنده می‌خواهد بسته دقیقاً روز جشنواره فعال شود.
     ============================================================ */
  function schedule(sellerId, planId, days, startAt, note) {
    var when = Number(startAt) || 0;
    if (when <= Date.now()) throw new Error('تاریخ شروع باید در آینده باشد.');
    if (when > Date.now() + 90 * DAY) throw new Error('حداکثر تا ۹۰ روز آینده.');

    var rec = order(sellerId, planId, days, note);
    var list = read();
    var r = list.find(function (x) { return x.id === rec.id; });

    r.status = 'scheduled';
    r.startsAt = when;
    r.endsAt = when + r.days * DAY;
    r.startDate = faDate(when);
    r.endDate = faDate(r.endsAt);
    r.endDateTime = faDateTime(r.endsAt);
    write(list);
    return r;
  }

  /** بسته‌های زمان‌بندی‌شده که وقتشان رسیده، فعال می‌شوند */
  function wake() {
    var list = read();
    var changed = false;
    list.forEach(function (r) {
      if (r.status === 'scheduled' && Date.now() >= r.startsAt) {
        r.status = 'active';
        changed = true;
      }
    });
    if (changed) write(list);
  }

  /** سفارش‌های یک فروشنده */
  function mine(sellerId) {
    serveQueue();
    return sweep()
      .filter(function (r) { return r.sellerId === sellerId; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  /** لغو سفارشی که هنوز تأیید نشده */
  function cancel(id, sellerId) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('سفارش پیدا نشد.');
    if (r.sellerId !== sellerId) throw new Error('این سفارش برای شما نیست.');
    if (r.status !== 'awaiting') throw new Error('فقط سفارش در انتظار پرداخت لغو می‌شود.');
    write(list.filter(function (x) { return x.id !== id; }));
    return true;
  }

  /* ============================================================
     سمت مدیر
     ============================================================ */

  function all(status) {
    serveQueue();
    var list = sweep().sort(function (a, b) { return b.createdAt - a.createdAt; });
    if (status === 'active') return list.filter(live);
    return status ? list.filter(function (r) { return r.status === status; }) : list;
  }

  function countAwaiting() {
    return read().filter(function (r) { return r.status === 'awaiting'; }).length;
  }

  /** تأیید پرداخت → بسته فعال می‌شود */
  function activate(id) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('سفارش پیدا نشد.');
    if (r.status === 'active') throw new Error('این بسته فعال است.');

    r.status = 'active';
    r.paused = false;
    r.startsAt = Date.now();
    r.endsAt = Date.now() + r.days * DAY;
    r.startDate = nowFa();
    r.endDate = faDate(r.endsAt);
    r.endDateTime = faDateTime(r.endsAt);
    write(list);

    if (window.DPAdmin && DPAdmin.log) {
      DPAdmin.log('بسته‌ی «' + (PLANS[r.plan] || {}).fa + '» برای فروشگاه فعال شد — ' +
                  fa(r.days) + ' روز');
    }
    return r;
  }

  /** رد سفارش با دلیل */
  function reject(id, reason) {
    var txt = String(reason || '').trim();
    if (txt.length < 5) throw new Error('دلیل رد را بنویسید (دست‌کم ۵ نویسه).');
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('سفارش پیدا نشد.');
    r.status = 'rejected';
    r.reason = txt;
    write(list);
    return true;
  }

  /** توقف موقت یا ادامه — بدون سوختن روزها */
  function togglePause(id) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('سفارش پیدا نشد.');
    if (r.status !== 'active') throw new Error('فقط بسته‌ی فعال متوقف می‌شود.');

    if (r.paused) {
      /* روزهای از دست رفته برگردانده می‌شوند */
      var lost = Date.now() - (r.pausedAt || Date.now());
      r.endsAt += lost;
      r.paused = false;
      r.pausedAt = null;
    } else {
      r.paused = true;
      r.pausedAt = Date.now();
    }
    write(list);
    return r.paused;
  }

  /** پایان زودهنگام */
  function stop(id) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('سفارش پیدا نشد.');
    r.status = 'expired';
    r.endsAt = Date.now();
    write(list);
    serveQueue();          /* جایگاه آزاد شد — نوبت بعدی */
    return true;
  }

  /** هدیه‌ی مدیر — بدون پرداخت، بی‌درنگ فعال */
  function gift(sellerId, planId, days, note) {
    if (!PLANS[planId]) throw new Error('بسته‌ی نامعتبر.');
    var d = Number(days) || 0;
    if (d < 1) throw new Error('تعداد روز را مشخص کنید.');

    var list = sweep();

    if (PLANS[planId].exclusive) {
      var busy = list.find(function (r) {
        return r.plan === planId && r.sellerId !== sellerId && live(r);
      });
      if (busy) {
        throw new Error('این بسته انحصاری است و هم‌اکنون فروشگاه دیگری آن را دارد. ' +
          'برای واگذاری، اول آن را پایان دهید.');
      }
    }
    var rec = {
      id: uid(),
      sellerId: sellerId,
      plan: planId,
      days: d,
      price: 0,
      offPercent: 100,
      note: String(note || '').trim() || 'هدیه‌ی مدیر',
      status: 'active',
      paused: false,
      gift: true,
      reason: '',
      createdAt: Date.now(),
      date: nowFa(),
      startsAt: Date.now(),
      endsAt: Date.now() + d * DAY,
      startDate: nowFa(),
      endDate: faDate(Date.now() + d * DAY),
      endDateTime: faDateTime(Date.now() + d * DAY),
      views: 0,
      clicks: 0,
    };
    list.push(rec);
    write(list);

    if (window.DPAdmin && DPAdmin.log) {
      DPAdmin.log('بسته‌ی «' + PLANS[planId].fa + '» به‌عنوان هدیه فعال شد — ' + fa(d) + ' روز');
    }
    return rec;
  }

  /* ============================================================
     خواندن وضعیت — برای صفحه‌های عمومی
     ============================================================ */

  /**
   * وزن یک فروشگاه. بالاتر = بالاتر در فهرست.
   * صفر یعنی بسته‌ی فعالی ندارد.
   */
  function weightOf(sellerId) {
    var w = 0;
    sweep().forEach(function (r) {
      if (r.sellerId !== sellerId || !live(r)) return;
      var p = PLANS[r.plan];
      if (p && p.weight > w) w = p.weight;
    });
    return w;
  }

  /* ============================================================
     پرسش از توانایی‌ها
     ------------------------------------------------------------
     تنها راه درست پرسیدن «این فروشگاه اجازه‌ی فلان کار را
     دارد؟» همین تابع است. هر جای دیگری که مستقیم به نام بسته
     نگاه کند، دیر یا زود از قاعده جا می‌ماند.
     ============================================================ */
  function can(sellerId, capability) {
    return sweep().some(function (r) {
      if (r.sellerId !== sellerId || !live(r)) return false;
      var p = PLANS[r.plan];
      return !!(p && p[capability]);
    });
  }

  /** بسته‌های فعالِ این فروشگاه، از قوی به ضعیف */
  function plansOf(sellerId) {
    return sweep()
      .filter(function (r) { return r.sellerId === sellerId && live(r); })
      .map(function (r) { return PLANS[r.plan]; })
      .filter(Boolean)
      .sort(function (a, b) { return (b.weight || 0) - (a.weight || 0); });
  }

  /**
   * نشانی که باید روی کارت بنشیند — یا null.
   * اگر چند بسته‌ی نشان‌دار فعال باشد، قوی‌ترین برنده است.
   */
  function badgeOf(sellerId) {
    var best = null;
    plansOf(sellerId).forEach(function (p) {
      if (!p.badge) return;
      if (!best || (p.weight || 0) > (best.weight || 0)) best = p;
    });
    if (!best) return null;
    return {
      kind: best.badgeKind || 'featured',
      fa: best.badgeFa || 'ویژه',
      color: best.color,
      plan: best.id,
    };
  }

  /** آیا نشان می‌گیرد؟ (بسته‌ی «فقط نردبان» نمی‌گیرد) */
  function isFeatured(sellerId) { return can(sellerId, 'badge'); }

  /** آیا در صفحه‌ی نخست دیده شود؟ */
  function onHome(sellerId) { return can(sellerId, 'home'); }

  /**
   * آیا در بخشی که کالا ندارد هم دیده شود؟
   *
   * این جدا از `onHome` است و همان چیزی بود که خراب بود:
   * بسته‌ی «فقط ویترین اصلی» در همه‌ی صفحه‌های دسته هم
   * تزریق می‌شد، در حالی که اسمش می‌گوید فقط صفحه‌ی اصلی.
   */
  function onEveryPage(sellerId) { return can(sellerId, 'crossPage'); }

  /** آیا جایگاهش در فهرست بالا می‌رود؟ */
  function ranksUp(sellerId) { return can(sellerId, 'rank'); }

  /* ============================================================
     صدرنشین — فروشگاهی که در حساب همه‌ی مشتری‌ها دیده می‌شود
     ============================================================ */

  /** رکورد صدرنشین فعال (اگر باشد) */
  function spotlight() {
    var found = null;
    sweep().forEach(function (r) {
      if (!live(r)) return;
      var p = PLANS[r.plan];
      if (p && p.spotlight) found = r;
    });
    return found;
  }

  /** آیا این فروشگاه صدرنشین است؟ */
  function isSpotlight(sellerId) {
    var r = spotlight();
    return !!r && r.sellerId === sellerId;
  }

  /** آیا بسته‌ی انحصاری آزاد است؟ */
  function slotFree(planId, sellerId) {
    var p = PLANS[planId];
    if (!p || !p.exclusive) return true;
    var busy = sweep().find(function (r) {
      return r.plan === planId && live(r) && r.sellerId !== sellerId;
    });
    return !busy;
  }

  /** چند روز دیگر بسته‌ی انحصاری آزاد می‌شود؟ صفر یعنی آزاد است */
  function slotFreeIn(planId, sellerId) {
    var busy = sweep().find(function (r) {
      return r.plan === planId && live(r) && r.sellerId !== sellerId;
    });
    return busy ? daysLeft(busy) : 0;
  }

  /** بسته‌های فعال یک فروشگاه */
  function activeOf(sellerId) {
    return sweep().filter(function (r) {
      return r.sellerId === sellerId && live(r);
    });
  }

  /** نقشه‌ی وزن همه‌ی فروشگاه‌ها — برای مرتب‌سازی یک‌جا */
  function weightMap() {
    var m = {};
    sweep().forEach(function (r) {
      if (!live(r)) return;
      var p = PLANS[r.plan];
      /*
       * فقط بسته‌هایی که `rank` دارند جایگاه را عوض می‌کنند.
       * «برجسته‌سازی» عمداً وزن صفر دارد: ظاهر را تغییر
       * می‌دهد ولی فروشگاه را بالا نمی‌برد — چون اسمش
       * همین را می‌گوید.
       */
      if (!p || !p.rank) return;
      if (!m[r.sellerId] || p.weight > m[r.sellerId]) m[r.sellerId] = p.weight;
    });
    return m;
  }

  /** مرتب‌سازی فهرست فروشگاه‌ها: برجسته‌ها بالا */
  function sortStores(list) {
    var m = weightMap();
    return list.slice().sort(function (a, b) {
      return (m[b.id] || 0) - (m[a.id] || 0);
    });
  }

  /* ============================================================
     آمار
     ============================================================ */

  /* ============================================================
     آمار — روزانه، نه فقط جمع کل
     ------------------------------------------------------------
     `daily` نقشه‌ای است از تاریخ به شمارش:
       { '2026-01-05': { v: 120, c: 9 } }

     چرا روزانه؟ چون فروشنده باید ببیند کدام روز بهتر بوده و
     آیا بازدید در حال رشد است یا افت. جمع کل این را نمی‌گوید.
     ============================================================ */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  /* برای اینکه هر بازدید یک بار نوشتن روی حافظه نباشد،
     شمارش‌ها جمع می‌شوند و هر ۲ ثانیه یک‌بار ذخیره می‌شوند. */
  var pending = {};
  var flushTimer = null;

  function bump(sellerId, field, n) {
    if (!pending[sellerId]) pending[sellerId] = { v: 0, c: 0 };
    pending[sellerId][field] += (n || 1);
    if (flushTimer) return;
    flushTimer = setTimeout(flush, 2000);
  }

  function flush() {
    flushTimer = null;
    var ids = Object.keys(pending);
    if (!ids.length) return;

    var list = read();
    var key = todayKey();
    var touched = false;

    list.forEach(function (r) {
      var p = pending[r.sellerId];
      if (!p || !live(r)) return;

      r.views  = (r.views  || 0) + p.v;
      r.clicks = (r.clicks || 0) + p.c;

      r.daily = r.daily || {};
      var day = r.daily[key] || { v: 0, c: 0 };
      day.v += p.v;
      day.c += p.c;
      r.daily[key] = day;

      /* فقط ۹۰ روز آخر نگه داشته می‌شود تا حافظه پر نشود */
      var keys = Object.keys(r.daily).sort();
      while (keys.length > 90) delete r.daily[keys.shift()];

      touched = true;
    });

    pending = {};
    if (touched) localStorage.setItem(KEY, JSON.stringify(list));
  }

  /** شمارش بازدید کارت برجسته */
  function countView(sellerId) { bump(sellerId, 'v'); }

  /** شمارش کلیک روی کارت */
  function countClick(sellerId) { bump(sellerId, 'c'); }

  /* پیش از بستن صفحه، شمارش‌های معلق ذخیره شوند */
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) flush();
    });
  }

  /* ============================================================
     تحلیل کارایی یک بسته
     ------------------------------------------------------------
     نرخ کلیک (CTR)، میانگین روزانه، روند رشد، و بهترین روز.
     ============================================================ */
  function insight(rec) {
    var v = Number(rec.views) || 0;
    var c = Number(rec.clicks) || 0;
    var daily = rec.daily || {};
    var keys = Object.keys(daily).sort();

    /* چند روز واقعاً فعال بوده */
    var ran = rec.startsAt
      ? Math.max(1, Math.ceil((Math.min(Date.now(), rec.endsAt) - rec.startsAt) / DAY))
      : 0;

    /* روند: نیمه‌ی دوم در برابر نیمه‌ی اول */
    var half = Math.floor(keys.length / 2);
    var early = 0, late = 0;
    keys.forEach(function (k, i) {
      if (i < half) early += daily[k].v;
      else late += daily[k].v;
    });
    var trend = 0;
    if (early > 0) trend = Math.round((late - early) / early * 100);
    else if (late > 0) trend = 100;

    /* بهترین روز */
    var best = null;
    keys.forEach(function (k) {
      if (!best || daily[k].v > daily[best].v) best = k;
    });

    return {
      views: v,
      clicks: c,
      ctr: v > 0 ? Math.round(c / v * 1000) / 10 : 0,   /* درصد با یک رقم اعشار */
      perDay: ran > 0 ? Math.round(v / ran) : 0,
      days: ran,
      trend: trend,
      best: best,
      bestViews: best ? daily[best].v : 0,
      series: keys.map(function (k) { return { day: k, v: daily[k].v, c: daily[k].c }; }),
      /* ارزش هر کلیک — اگر پولی بوده */
      costPerClick: (c > 0 && rec.price > 0) ? Math.round(rec.price / c) : 0,
    };
  }

  /** خلاصه‌ی همه‌ی بسته‌های یک فروشگاه */
  function summaryOf(sellerId) {
    var mine = read().filter(function (r) { return r.sellerId === sellerId; });
    var v = 0, c = 0, spent = 0, saved = 0, days = 0;

    mine.forEach(function (r) {
      v += Number(r.views) || 0;
      c += Number(r.clicks) || 0;
      if (r.trial) { try { saved += quoteList(r.plan, r.days); } catch (e) {} }
      else if (!r.gift && (r.status === 'active' || r.status === 'expired')) {
        spent += Number(r.price) || 0;
      }
      if (r.status === 'active' || r.status === 'expired') days += Number(r.days) || 0;
    });

    return {
      count: mine.length,
      views: v,
      clicks: c,
      ctr: v > 0 ? Math.round(c / v * 1000) / 10 : 0,
      spent: spent,
      saved: saved,
      days: days,
      costPerClick: (c > 0 && spent > 0) ? Math.round(spent / c) : 0,
    };
  }

  /** درآمد کل مدیر از فروش بسته‌ها */
  function revenue() {
    var paid = 0, count = 0, gifts = 0, trials = 0, wouldBe = 0;
    read().forEach(function (r) {
      if (r.gift) { gifts++; return; }
      if (r.trial) {
        trials++;
        /* اگر رایگان نبود، چقدر می‌شد؟ برای برآورد درآمد آینده */
        try { wouldBe += quoteList(r.plan, r.days); } catch (e) {}
        return;
      }
      if (r.status === 'active' || r.status === 'expired') {
        paid += Number(r.price) || 0;
        count++;
      }
    });
    return { total: paid, count: count, gifts: gifts,
             trials: trials, wouldBe: wouldBe };
  }

  window.DPBoost = {
    PLANS: PLANS,
    STATUS_FA: STATUS_FA,
    FREE_TRIAL: FREE_TRIAL,
    quote: quote,
    quoteList: quoteList,
    money: money,
    fa: fa,
    live: live,
    daysLeft: daysLeft,
    timeLeft: timeLeft,
    faDate: faDate,
    faDateTime: faDateTime,
    /* فروشنده */
    order: order,
    mine: mine,
    cancel: cancel,
    /* مدیر */
    all: all,
    countAwaiting: countAwaiting,
    activate: activate,
    reject: reject,
    togglePause: togglePause,
    stop: stop,
    gift: gift,
    revenue: revenue,
    /* عمومی */
    weightOf: weightOf,
    weightMap: weightMap,
    isFeatured: isFeatured,
    can: can,
    plansOf: plansOf,
    badgeOf: badgeOf,
    onEveryPage: onEveryPage,
    ranksUp: ranksUp,
    onHome: onHome,
    spotlight: spotlight,
    isSpotlight: isSpotlight,
    slotFree: slotFree,
    slotFreeIn: slotFreeIn,
    activeOf: activeOf,
    sortStores: sortStores,
    countView: countView,
    countClick: countClick,
    /* آمار */
    insight: insight,
    summaryOf: summaryOf,
    flush: flush,
    /* صف نوبت */
    enqueue: enqueue,
    dequeue: dequeue,
    queuePos: queuePos,
    queueOf: queueOf,
    serveQueue: serveQueue,
    /* تمدید و زمان‌بندی */
    renew: renew,
    schedule: schedule,
    wake: wake,
  };
})();
