/* ============================================================
   دیجی‌پوش — مرجوعی کالا
   ------------------------------------------------------------
   مشتری از «سفارش‌های من» درخواست می‌دهد؛
   فروشنده در پنل خودش تأیید یا رد می‌کند.

   با تأیید: موجودی کالا برمی‌گردد و مبلغ از درآمد کم می‌شود.
   ============================================================ */
'use strict';

(function () {
  var KEY = 'dp_returns';

  var read = function () { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(KEY));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; } };
  var write = function (v) {
    localStorage.setItem(KEY, JSON.stringify(v));
    document.dispatchEvent(new CustomEvent('dp:returns'));
  };

  var uid = function () {
    return 'rt-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  var nowFa = function () { return new Intl.DateTimeFormat('fa-IR').format(new Date()); };

  var readK = function (k) { try { return (function(){var _v;try{_v=JSON.parse(localStorage.getItem(k));}catch(e){}return Array.isArray(_v)?_v.filter(function(_x){return _x&&typeof _x==='object';}):[];})(); } catch (e) { return []; } };

  /* مهلت مرجوعی — هفت روز پس از تحویل */
  var DAYS = 7;

  /* ============================================================
     مشتری — ثبت درخواست
     ============================================================ */
  function request(orderId, line, reason) {
    var user = window.DPUser && DPUser.me ? DPUser.me() : null;
    if (!user) throw new Error('ابتدا وارد حساب شوید.');

    var txt = String(reason || '').trim();
    if (txt.length < 10) throw new Error('لطفاً دلیل مرجوعی را کامل‌تر بنویسید.');

    var orders = readK('dp_orders');
    var o = orders.find(function (x) { return x.id === orderId; });
    if (!o) throw new Error('سفارش پیدا نشد.');
    if (o.userId !== user.id) throw new Error('این سفارش متعلق به شما نیست.');

    if (o.status === 'cancelled') throw new Error('این سفارش لغو شده است.');

    /* برای هر قلم، فقط یک درخواست باز */
    var all = read();
    var dup = all.find(function (r) {
      return r.orderId === orderId && String(r.productId) === String(line.productId) &&
             r.status !== 'rejected';
    });
    if (dup) throw new Error('برای این کالا قبلاً درخواست مرجوعی ثبت شده است.');

    all.push({
      id: uid(),
      orderId: orderId,
      sellerId: o.sellerId,
      userId: user.id,
      customer: o.customer || (user.fullName || user.email),
      phone: o.phone || '',
      productId: String(line.productId),
      productName: line.name,
      qty: Number(line.qty) || 1,
      amount: (Number(line.price) || 0) * (Number(line.qty) || 1),
      reason: txt,
      sellerNote: '',
      status: 'pending',
      date: nowFa(),
    });

    write(all);
    return true;
  }

  /* ============================================================
     فروشنده — تأیید یا رد
     ============================================================ */
  function approve(id) {
    var all = read();
    var r = all.find(function (x) { return x.id === id; });
    if (!r) throw new Error('درخواست پیدا نشد.');
    if (r.status !== 'pending') throw new Error('این درخواست قبلاً بررسی شده است.');

    r.status = 'approved';
    r.doneDate = nowFa();
    write(all);

    /* موجودی کالا برمی‌گردد */
    var prods = readK('dp_products');
    var p = prods.find(function (x) { return String(x.id) === r.productId; });
    if (p) {
      p.stock = (Number(p.stock) || 0) + r.qty;
      p.sales = Math.max(0, (Number(p.sales) || 0) - r.qty);
      if (p.status === 'out_of_stock' && p.stock > 0) p.status = 'active';
      localStorage.setItem('dp_products', JSON.stringify(prods));
    }

    /* نشانه روی سفارش */
    var orders = readK('dp_orders');
    var o = orders.find(function (x) { return x.id === r.orderId; });
    if (o) {
      o.returned = (Number(o.returned) || 0) + r.amount;
      localStorage.setItem('dp_orders', JSON.stringify(orders));
    }

    return true;
  }

  function reject(id, note) {
    var all = read();
    var r = all.find(function (x) { return x.id === id; });
    if (!r) throw new Error('درخواست پیدا نشد.');

    r.status = 'rejected';
    r.sellerNote = String(note || '').trim();
    r.doneDate = nowFa();
    write(all);
    return true;
  }

  /* ============================================================
     خواندن
     ============================================================ */
  function forSeller(sellerId) {
    return read().filter(function (r) { return r.sellerId === sellerId; }).reverse();
  }

  function forUser() {
    var u = window.DPUser && DPUser.me ? DPUser.me() : null;
    if (!u) return [];
    return read().filter(function (r) { return r.userId === u.id; }).reverse();
  }

  /** وضعیت مرجوعی یک قلم از یک سفارش */
  function statusOf(orderId, productId) {
    var r = read().find(function (x) {
      return x.orderId === orderId && String(x.productId) === String(productId);
    });
    return r ? r.status : null;
  }

  /** مجموع مبلغ مرجوعی تأییدشده‌ی یک فروشنده */
  function refundedFor(sellerId) {
    return read()
      .filter(function (r) { return r.sellerId === sellerId && r.status === 'approved'; })
      .reduce(function (a, r) { return a + r.amount; }, 0);
  }

  /** آیا هنوز می‌شود درخواست داد؟ */
  function canRequest(order) {
    if (!order) return false;
    if (order.status === 'cancelled') return false;
    return true;
  }

  window.DPReturns = {
    request: request,
    approve: approve,
    reject: reject,
    forSeller: forSeller,
    forUser: forUser,
    statusOf: statusOf,
    refundedFor: refundedFor,
    canRequest: canRequest,
    all: read,
    DAYS: DAYS,
  };
})();
