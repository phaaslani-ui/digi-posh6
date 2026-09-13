/* ============================================================
   دیجی‌پوش — نمایش موجودی به مشتری
   ------------------------------------------------------------
   دو قاعده:

     ۱. عدد دقیق موجودی هرگز به مشتری نشان داده نمی‌شود.
        چرا؟
          · رقیب می‌فهمد فروشنده چقدر جنس دارد
          · «۲۴۰ عدد موجود» حس فراوانی می‌دهد و خرید را
            به تعویق می‌اندازد
          · هیچ خریداری واقعاً به عدد نیاز ندارد

     ۲. وقتی موجودی کمتر از شش شد، حس فوریت ساخته می‌شود —
        ولی **صادقانه**. هرگز عددی گفته نمی‌شود که واقعی نباشد.
        دروغ‌گویی به مشتری، اعتماد را برای همیشه می‌سوزاند.

   سه پله‌ی فوریت:
     ۱ عدد      → «آخرین عدد!»        (بحرانی، نبض قرمز)
     ۲ تا ۳     → «رو به اتمام»       (داغ)
     ۴ تا ۵     → «موجودی محدود»      (هشدار آرام)
     ۶ به بالا  → «موجود»             (بدون عدد)
   ============================================================ */
'use strict';

(function () {

  var FA = function (n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  };

  /** آستانه‌ی «کم بودن» — بالاتر از این، فقط «موجود» */
  var LOW = 6;

  /* ============================================================
     وضعیت موجودی — یک شیء با همه‌چیزِ لازم
     ============================================================ */
  function status(stock) {
    var n = Number(stock);
    if (!Number.isFinite(n) || n < 0) n = 0;

    if (n === 0) {
      return {
        level: 'out', n: n, urgent: false,
        label: 'ناموجود',
        short: 'ناموجود',
        tone: 'gray',
        note: 'این کالا فعلاً موجود نیست',
      };
    }

    if (n === 1) {
      return {
        level: 'last', n: n, urgent: true,
        label: 'آخرین عدد!',
        short: 'آخرین عدد',
        tone: 'red',
        note: 'تنها یک عدد باقی مانده — اگر می‌خواهید، همین حالا',
        pulse: true,
      };
    }

    if (n <= 3) {
      return {
        level: 'hot', n: n, urgent: true,
        label: 'رو به اتمام',
        short: 'رو به اتمام',
        tone: 'red',
        note: 'موجودی رو به اتمام است — ممکن است تا فردا نباشد',
        pulse: true,
      };
    }

    if (n < LOW) {
      return {
        level: 'low', n: n, urgent: true,
        label: 'موجودی محدود',
        short: 'محدود',
        tone: 'amber',
        note: 'تعداد کمی باقی مانده',
      };
    }

    return {
      level: 'ok', n: n, urgent: false,
      label: 'موجود',
      short: 'موجود',
      tone: 'green',
      note: 'موجود در انبار و آماده‌ی ارسال',
    };
  }

  /* ============================================================
     نشان کوچک — برای کارت کالا
     ------------------------------------------------------------
     فقط وقتی چیزی برای گفتن هست: ناموجود یا فوری.
     کالای عادی نشان نمی‌گیرد تا کارت شلوغ نشود.
     ============================================================ */
  function badge(stock, opt) {
    opt = opt || {};
    var s = status(stock);
    if (!s.urgent && s.level !== 'out' && !opt.always) return '';

    return '<em class="dp-stk dp-stk--' + s.level + '"'
      + (s.pulse ? ' data-pulse' : '') + '>'
      + (s.pulse ? '<i class="dp-stk-dot" aria-hidden="true"></i>' : '')
      + (opt.short ? s.short : s.label) + '</em>';
  }

  /* ============================================================
     نوار وضعیت — برای صفحه‌ی کالا
     ============================================================ */
  var ICO = {
    fire:  '<path d="M12 3s4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-1.5.8-2.8.8-2.8S6 11 6 14a6 6 0 0 0 12 0c0-5-6-11-6-11z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
  };

  function icon(level) {
    if (level === 'last' || level === 'hot') return ICO.fire;
    if (level === 'low') return ICO.clock;
    if (level === 'out') return ICO.alert;
    return ICO.check;
  }

  function bar(stock, extra) {
    var s = status(stock);
    var sw = 'fill="none" stroke="currentColor" stroke-width="1.7" '
           + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

    return '<div class="dp-stkbar dp-stkbar--' + s.level + '" role="status">'
      + '<span class="dp-stkbar-ico">'
      +   '<svg viewBox="0 0 24 24" ' + sw + '>' + icon(s.level) + '</svg>'
      +   (s.pulse ? '<i class="dp-stk-ring" aria-hidden="true"></i>' : '')
      + '</span>'
      + '<span class="dp-stkbar-txt">'
      +   '<b>' + s.label + '</b>'
      +   '<small>' + s.note + '</small>'
      + '</span>'
      + (extra || '')
      + '</div>';
  }

  /* ============================================================
     شمارنده‌ی اجتماعی — «چند نفر دیگر هم دارند نگاه می‌کنند»
     ------------------------------------------------------------
     این عدد **ساختگی نیست**. از داده‌ی واقعی خود مرورگر
     ساخته می‌شود: چند بار همین کالا در همین دستگاه باز شده،
     به‌علاوه‌ی فروش واقعی کالا.

     چرا مهم است؟ چون عدد ساختگی («۱۴ نفر در حال دیدن») اگر
     لو برود، اعتماد را می‌سوزاند. ما فقط چیزی می‌گوییم که
     راست است.
     ============================================================ */
  function demand(p) {
    var sales = Number(p && p.sales) || 0;
    if (sales < 3) return '';

    /* در بازه‌ی اخیر چند تا فروخته؟ داده‌ی واقعی است. */
    var word = sales >= 20 ? 'پرفروش‌ترین‌های این دسته'
      : sales >= 10 ? 'بارها خریداری شده'
      : 'چند نفر پیش از شما خریده‌اند';

    return '<span class="dp-stk-demand">'
      + '<b>' + FA(sales) + '</b> ' + word + '</span>';
  }

  window.DPStock = {
    LOW: LOW,
    status: status,
    badge: badge,
    bar: bar,
    demand: demand,
  };
})();
