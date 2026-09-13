/* ============================================================
   دیجی‌پوش — نظارت مدیر بر تغییر پروفایل فروشگاه
   ------------------------------------------------------------
   هر تغییری که فروشنده در پروفایل فروشگاهش می‌دهد — نام،
   توضیح، لوگو، سربرگ، شهر، نشانی — بی‌درنگ روی سایت
   نمی‌نشیند. اول به کارتابل مدیر می‌رود.

   سه حالت:
     pending   → در انتظار بررسی مدیر
     approved  → مدیر پذیرفت، روی فروشگاه نشست
     rejected  → مدیر رد کرد، با دلیل

   نکته‌ی مهم: تا وقتی درخواست در انتظار است، نسخه‌ی قدیمی
   روی سایت می‌ماند. فروشگاه هرگز خالی یا نیمه‌کاره دیده نمی‌شود.

   میدان‌های حساس (شماره شبا، کد ملی) همیشه بررسی می‌شوند.
   میدان‌های بی‌خطر (ساعت کاری) بی‌درنگ ثبت می‌شوند.
   ============================================================ */
'use strict';

(function () {
  var KEY = 'dp_profile_requests';

  var read = function () {
    try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(KEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; }
  };

  var write = function (v) {
    localStorage.setItem(KEY, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:moderation'));
  };

  var users = function () {
    try { return (window.DPSafe ? DPSafe.sellers() : []); } catch (e) { return []; }
  };

  var saveUsers = function (v) { localStorage.setItem('dp_users', JSON.stringify(v)); };

  var uid = function () {
    return 'pr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  var nowFa = function () {
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date()); }
    catch (e) { return ''; }
  };

  /* ============================================================
     میدان‌هایی که نیاز به تأیید دارند
     ------------------------------------------------------------
     برچسب فارسی برای نمایش در کارتابل مدیر.
     ============================================================ */
  var WATCHED = {
    /* ---------- مشترک میان هر دو نوع فروشنده ---------- */
    storeName:   { fa: 'نام فروشگاه',     risk: 'high', why: 'نام در ویترین دیده می‌شود' },
    description: { fa: 'درباره‌ی فروشگاه', risk: 'high', why: 'متن معرفی عمومی' },
    logo:        { fa: 'لوگو',            risk: 'high', img: true },
    cover:       { fa: 'تصویر سربرگ',     risk: 'high', img: true },
    city:        { fa: 'شهر',             risk: 'mid'  },
    address:     { fa: 'نشانی',           risk: 'mid'  },
    shaba:       { fa: 'شماره شبا',       risk: 'high', why: 'مقصد واریز درآمد' },
    nationalId:  { fa: 'کد ملی',          risk: 'high', why: 'احراز هویت' },
    phone:       { fa: 'شماره تماس',      risk: 'mid'  },
    fullName:    { fa: 'نام مسئول',       risk: 'mid'  },

    /* ---------- فقط عمده‌فروشی ----------
       این میدان‌ها به خریدار حرفه‌ای می‌گویند با یک کسب‌وکار
       رسمی طرف است. جعل‌شان یعنی کلاهبرداری، پس همه
       «پرخطر» شمرده می‌شوند. */
    companyName:  { fa: 'نام شرکت',        risk: 'high', only: 'wholesale',
                    why: 'هویت حقوقی کسب‌وکار' },
    economicCode: { fa: 'کد اقتصادی',      risk: 'high', only: 'wholesale',
                    why: 'برای فاکتور رسمی — باید معتبر باشد' },
    regNumber:    { fa: 'شماره‌ی ثبت',      risk: 'high', only: 'wholesale',
                    why: 'قابل استعلام از سامانه‌ی ثبت شرکت‌ها' },
    warehouse:    { fa: 'شهر انبار',       risk: 'mid',  only: 'wholesale',
                    why: 'مبدأ ارسال بار' },
    minOrderValue:{ fa: 'حداقل مبلغ سفارش', risk: 'mid',  only: 'wholesale',
                    why: 'شرط خرید که به خریدار نشان داده می‌شود' },
    leadTime:     { fa: 'زمان آماده‌سازی',  risk: 'mid',  only: 'wholesale',
                    why: 'تعهد زمانی به خریدار' },
  };

  /* میدان‌هایی که بدون بررسی ثبت می‌شوند */
  var FREE = ['workHours', 'instagram', 'telegram', 'website', 'acceptsRfq'];

  /* ============================================================
     ابزار
     ============================================================ */

  /** آیا این مقدار با مقدار فعلی فرق دارد؟ */
  function changed(a, b) {
    return String(a == null ? '' : a).trim() !== String(b == null ? '' : b).trim();
  }

  /** خلاصه‌ی کوتاه از یک مقدار — برای نمایش در جدول */
  function brief(v, isImg) {
    if (v == null || v === '') return '—';
    if (isImg) return String(v).startsWith('data:') ? 'تصویر تازه' : 'تصویر';
    var s = String(v).trim();
    return s.length > 60 ? s.slice(0, 60) + '…' : s;
  }

  /* ============================================================
     سمت فروشنده
     ============================================================ */

  /**
   * ثبت درخواست تغییر پروفایل.
   * @param {string} sellerId
   * @param {object} patch   مقدارهای تازه
   * @returns {{queued: string[], instant: string[], requestId: string|null}}
   */
  function submit(sellerId, patch) {
    var all = users();
    var me = all.find(function (u) { return u.id === sellerId; });
    if (!me) throw new Error('فروشگاه پیدا نشد.');

    /* نوع فروشنده — میدان‌های ویژه‌ی عمده‌فروشی فقط برای
       عمده‌فروش معنی دارند */
    var type = me.sellerType === 'wholesale' ? 'wholesale' : 'retail';

    var fields = {};   // آنچه باید بررسی شود
    var instant = {};  // آنچه بی‌درنگ ثبت می‌شود
    var queued = [];
    var risky = 0;     // چند میدان پرخطر عوض شده

    Object.keys(patch).forEach(function (k) {
      if (FREE.indexOf(k) > -1) { instant[k] = patch[k]; return; }
      var W = WATCHED[k];
      if (!W) { instant[k] = patch[k]; return; }

      /* میدان مخصوص نوع دیگر — نادیده گرفته می‌شود */
      if (W.only && W.only !== type) return;

      if (!changed(patch[k], me[k])) return;   // عوض نشده، رها کن

      fields[k] = {
        from: me[k] == null ? '' : me[k],
        to: patch[k],
        fa: W.fa,
        risk: W.risk,
        why: W.why || '',
        img: !!W.img,
      };
      if (W.risk === 'high') risky++;
      queued.push(W.fa);
    });

    /* میدان‌های بی‌خطر همین حالا ثبت می‌شوند */
    if (Object.keys(instant).length) {
      Object.assign(me, instant);
      saveUsers(all);
    }

    if (!queued.length) {
      return { queued: [], instant: Object.keys(instant), requestId: null };
    }

    /* اگر درخواست بازِ قبلی هست، جایش را می‌گیرد
       (فروشنده دو بار پشت‌سرهم ویرایش کرده) */
    var list = read();
    var open = list.find(function (r) {
      return r.sellerId === sellerId && r.status === 'pending';
    });

    if (open) {
      /* میدان‌های تازه با میدان‌های قبلی ادغام می‌شوند؛
         «from» همان نسخه‌ی اصلی می‌ماند */
      Object.keys(fields).forEach(function (k) {
        if (open.fields[k]) open.fields[k].to = fields[k].to;
        else open.fields[k] = fields[k];
      });
      open.date = nowFa();
      open.at = Date.now();
      open.sellerType = type;
      open.companyName = me.companyName || '';
      open.email = me.email || '';
      open.riskCount = Object.keys(open.fields).filter(function (k) {
        return WATCHED[k] && WATCHED[k].risk === 'high';
      }).length;
      write(list);
      return { queued: queued, instant: Object.keys(instant), requestId: open.id };
    }

    var req = {
      id: uid(),
      sellerId: sellerId,
      storeName: me.storeName || '—',

      /* اطلاعات بیشتر برای مدیر — تا بدون باز کردن پروفایل
         بداند با چه کسی طرف است */
      sellerType: type,
      companyName: me.companyName || '',
      email: me.email || '',
      sellerStatus: me.status || 'pending',
      riskCount: risky,

      fields: fields,
      status: 'pending',
      reason: '',
      date: nowFa(),
      at: Date.now(),
      reviewedAt: null,
    };

    list.push(req);
    write(list);
    return { queued: queued, instant: Object.keys(instant), requestId: req.id };
  }

  /** درخواست‌های یک فروشنده — تازه‌ترین اول */
  function mine(sellerId) {
    return read()
      .filter(function (r) { return r.sellerId === sellerId; })
      .sort(function (a, b) { return b.at - a.at; });
  }

  /** درخواست بازِ فروشنده (اگر باشد) */
  function pendingOf(sellerId) {
    return read().find(function (r) {
      return r.sellerId === sellerId && r.status === 'pending';
    }) || null;
  }

  /** پس گرفتن درخواست توسط خود فروشنده */
  function withdraw(id, sellerId) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('درخواست پیدا نشد.');
    if (r.sellerId !== sellerId) throw new Error('این درخواست برای شما نیست.');
    if (r.status !== 'pending') throw new Error('این درخواست بررسی شده و پس گرفتنی نیست.');
    write(list.filter(function (x) { return x.id !== id; }));
    return true;
  }

  /* ============================================================
     سمت مدیر
     ============================================================ */

  /** همه‌ی درخواست‌ها، با صافی وضعیت */
  function all(status) {
    var list = read().sort(function (a, b) { return b.at - a.at; });
    return status ? list.filter(function (r) { return r.status === status; }) : list;
  }

  function countPending() {
    return read().filter(function (r) { return r.status === 'pending'; }).length;
  }

  /**
   * تأیید درخواست — مقدارها روی فروشگاه می‌نشینند.
   * @param {string} id
   * @param {string[]} [only]  اگر داده شود، فقط همین میدان‌ها پذیرفته می‌شوند
   */
  function approve(id, only) {
    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('درخواست پیدا نشد.');
    if (r.status !== 'pending') throw new Error('این درخواست قبلاً بررسی شده است.');

    var us = users();
    var me = us.find(function (u) { return u.id === r.sellerId; });
    if (!me) throw new Error('فروشگاه پیدا نشد.');

    var applied = [];
    Object.keys(r.fields).forEach(function (k) {
      if (only && only.indexOf(k) < 0) return;
      me[k] = r.fields[k].to;
      applied.push(WATCHED[k] ? WATCHED[k].fa : k);
    });

    saveUsers(us);

    r.status = 'approved';
    r.reviewedAt = Date.now();
    r.reviewDate = nowFa();
    r.applied = applied;
    write(list);

    if (window.DPAdmin && DPAdmin.log) {
      DPAdmin.log('تغییر پروفایل «' + r.storeName + '» تأیید شد — ' + applied.join('، '));
    }
    return applied;
  }

  /** رد درخواست با دلیل */
  function reject(id, reason) {
    var txt = String(reason || '').trim();
    if (txt.length < 5) throw new Error('دلیل رد را بنویسید (دست‌کم ۵ نویسه).');

    var list = read();
    var r = list.find(function (x) { return x.id === id; });
    if (!r) throw new Error('درخواست پیدا نشد.');
    if (r.status !== 'pending') throw new Error('این درخواست قبلاً بررسی شده است.');

    r.status = 'rejected';
    r.reason = txt;
    r.reviewedAt = Date.now();
    r.reviewDate = nowFa();
    write(list);

    if (window.DPAdmin && DPAdmin.log) {
      DPAdmin.log('تغییر پروفایل «' + r.storeName + '» رد شد — ' + txt);
    }
    return true;
  }

  /** پاک کردن درخواست‌های بررسی‌شده‌ی قدیمی */
  function clearHandled() {
    var n = read().filter(function (r) { return r.status !== 'pending'; }).length;
    write(read().filter(function (r) { return r.status === 'pending'; }));
    return n;
  }

  window.DPModeration = {
    WATCHED: WATCHED,
    FREE: FREE,
    submit: submit,
    mine: mine,
    pendingOf: pendingOf,
    withdraw: withdraw,
    all: all,
    countPending: countPending,
    approve: approve,
    reject: reject,
    clearHandled: clearHandled,
    brief: brief,
  };
})();
