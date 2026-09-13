/**
 * 🏪 dp-seller-seed.js — محصولات نمونه واقعی فروشندگان
 * ------------------------------------------------------------------
 * • برای دمو: اگه محصول فروشنده‌ای وجود نداشت، چند محصول واقعی
 *   (با ساختار فروشنده) اضافه می‌کنه تا صفحه اصلی خالی نباشه
 * • کاربر می‌تونه این محصولات رو پاک کنه یا ویرایش کنه
 */

(function() {
  'use strict';
  if (window.DPSellerSeedLoaded) return;
  window.DPSellerSeedLoaded = true;

  // ═══ محصولات نمونه واقعی (با ساختار فروشنده) ═══
  // 🆕 v17.4 — SAMPLE محصولات حذف شد! محصولات فقط از سرور میان
  const SAMPLE_SELLER_PRODUCTS = [];
  ];

  // ═══ اضافه کردن به localStorage اگه خالی ═══
  function seedIfEmpty() {
    try {
      const existing = JSON.parse(localStorage.getItem('dp_products') || '[]');
      if (!Array.isArray(existing) || existing.length === 0) {
        localStorage.setItem('dp_products', JSON.stringify(SAMPLE_SELLER_PRODUCTS));
        console.log('🏪 ' + SAMPLE_SELLER_PRODUCTS.length + ' محصول واقعی فروشنده به دمو اضافه شد');
        return true;
      }
    } catch (e) {}
    return false;
  }

  // 🆕 v17.4 — غیرفعال شد! محصولات از سرور میان نه از SAMPLE
  // دلیل: این فایل محصولات الکی/demo اضافه می‌کرد و محصولات واقعی فروشنده‌ها رو خراب می‌کرد
  console.log('✅ dp-seller-seed.js: غیرفعال - محصولات از سرور لود میشن');

  // ═══ API ═══
  window.DPSellerSeed = {
    seed: seedIfEmpty,
    sample: SAMPLE_SELLER_PRODUCTS,
    clear: function() {
      localStorage.setItem('dp_products', '[]');
      console.log('🗑️ محصولات پاک شدند - منتظر sync از سرور');
    },
    reset: function() {
      localStorage.removeItem('dp_products_cleared');
      localStorage.setItem('dp_products', JSON.stringify(SAMPLE_SELLER_PRODUCTS));
      console.log('🔄 محصولات به حالت اولیه برگشتند');
    },
  };

})();
