/* ============================================================
   دیجی‌پوش — کرسور عادی سیستم
   ------------------------------------------------------------
   لایه‌ی حلقه و نقطه‌ی سفارشی برداشته شد.

   کاربر همان کرسور آشنای سیستم‌عامل خودش را می‌بیند —
   فلش، دست، و میله‌ی نوشتن. بدون هیچ لایه‌ی اضافه.

   این فایل عمداً نگه داشته شده تا:
     ۱. لینک‌های موجود در ۳۱ صفحه نشکنند (خطای ۴۰۴ ندهند).
     ۲. اگر نسخه‌ی کش‌شده‌ی مرورگر حلقه‌ای ساخته باشد،
        همین‌جا پاک شود.
     ۳. کلاس‌های به‌جامانده از نسخه‌ی قبلی برداشته شوند.

   سود جانبی: یک شنونده‌ی `pointermove` که در هر فریم
   اجرا می‌شد حذف شد — روی موبایل و لپ‌تاپ‌های ضعیف
   محسوس است.
   ============================================================ */
'use strict';

(function () {
  if (typeof document === 'undefined') return;

  function cleanup() {
    /* عنصرهای به‌جامانده از نسخه‌ی قبلی */
    var leftovers = document.querySelectorAll(
      '.custom-cursor, .custom-cursor-dot, .cursor-ring, .cursor-dot'
    );
    for (var i = 0; i < leftovers.length; i++) {
      leftovers[i].remove();
    }

    /* کلاس‌هایی که نسخه‌ی قبلی روی body می‌گذاشت */
    if (document.body) {
      document.body.classList.remove('cursor-ready', 'cursor-hidden');
    }

    /* اگر جایی `cursor: none` درون‌خطی مانده باشد، برداشته می‌شود */
    var el = document.documentElement;
    if (el && el.style && el.style.cursor === 'none') el.style.cursor = '';
    if (document.body && document.body.style.cursor === 'none') {
      document.body.style.cursor = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup, { once: true });
  } else {
    cleanup();
  }

  /* برای سازگاری با کدی که شاید هنوز صدایش بزند */
  window.DPCursor = {
    enabled: false,
    cleanup: cleanup,
  };
})();
