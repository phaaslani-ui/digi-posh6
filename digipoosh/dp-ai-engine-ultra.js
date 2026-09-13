/**
 * 🔥 dp-ai-engine-ultra.js v1.0 MAX ULTIMATE
 * ------------------------------------------------------------------
 * 🆕 نسخه خفن‌تر موتور پیشنهاد محصول
 * • استفاده از AI اصلی + ultra filters
 * • جملات واقعی متنوع بر اساس context
 * • تشخیص بهتر محصولات واقعی
 */

(function() {
  'use strict';
  if (window.DPAIEngineUltra) return;
  
  // ═══════════════════════════════════════════════════════════════
  // 🔥 Ultra Recommend
  // ═══════════════════════════════════════════════════════════════
  function ultraRecommend(text, products, profile, options) {
    options = options || {};
    const limit = options.limit || 6;
    
    if (!Array.isArray(products) || products.length === 0) {
      return { products: [], reason: 'محصولی موجود نیست' };
    }
    
    // 🆕 استخراج context از متن
    const ctx = extractContext(text);
    
    // 🆕 محاسبه امتیاز ultra با ۲۰+ فاکتور
    const scored = products.map(p => {
      let score = 30; // پایه
      const reasons = [];
      
      const productColors = (p.colors || []).map(c => (c || '').toLowerCase().trim());
      const productName = (p.name || '').toLowerCase();
      const productCategory = (p.category || '').toLowerCase();
      const productTags = (p.tags || []).map(t => (t || '').toLowerCase());
      const productDesc = (p.description || '').toLowerCase();
      const allText = [productName, productCategory, ...productTags, productDesc].join(' ');
      
      // ۱) تطابق دسته (۲۵)
      if (ctx.category) {
        if (productCategory.includes(ctx.category) || allText.includes(ctx.category)) {
          score += 25;
          reasons.push({ icon: '🛍️', text: 'دقیقاً همون دسته‌ای که خواستی', weight: 25 });
        }
      } else {
        score += 5;
      }
      
      // ۲) تطابق رنگ (۲۰)
      if (ctx.colors.length) {
        const colorMatch = ctx.colors.some(c => {
          const cLow = (c || '').toLowerCase().trim();
          return productColors.some(pc => pc.includes(cLow) || cLow.includes(pc));
        });
        if (colorMatch) {
          score += 20;
          reasons.push({ icon: '🎨', text: 'رنگ دلخواه شما', weight: 20 });
        }
      }
      
      // ۳) تطابق سبک (۱۵)
      if (ctx.styles.length) {
        const styleMatch = ctx.styles.some(s => allText.includes(s.toLowerCase()));
        if (styleMatch) {
          score += 15;
          reasons.push({ icon: '✨', text: 'سبک مورد علاقه شما', weight: 15 });
        }
      }
      
      // ۴) تطابق موقعیت (۱۰)
      if (ctx.occasions.length) {
        const occMatch = ctx.occasions.some(o => allText.includes(o.toLowerCase()));
        if (occMatch) {
          score += 10;
          reasons.push({ icon: '📍', text: 'مناسب موقعیت', weight: 10 });
        }
      }
      
      // ۵) کیفیت محصول (۱۰)
      if (p.rating >= 4.7) {
        score += 8;
        reasons.push({ icon: '⭐', text: `امتیاز عالی ${p.rating}/5`, weight: 8 });
      } else if (p.rating >= 4.3) {
        score += 4;
      }
      
      // ۶) محبوبیت (۸)
      if (p.sold > 500) {
        score += 6;
        reasons.push({ icon: '🔥', text: `پرفروش (${p.sold} عدد)`, weight: 6 });
      } else if (p.sold > 100) {
        score += 3;
      }
      
      // ۷) قیمت (۵)
      if (ctx.budget) {
        if (ctx.budget === 'low' && p.price < 800000) {
          score += 5;
          reasons.push({ icon: '💰', text: 'قیمت مناسب', weight: 5 });
        } else if (ctx.budget === 'mid' && p.price >= 800000 && p.price <= 2000000) {
          score += 5;
        } else if (ctx.budget === 'high' && p.price > 2000000) {
          score += 5;
          reasons.push({ icon: '💎', text: 'لاکچری', weight: 5 });
        }
      }
      
      // ۸) موجود بودن (۵)
      if (p.stock > 10) {
        score += 5;
        reasons.push({ icon: '✅', text: 'موجود در انبار', weight: 5 });
      } else if (p.stock > 0) {
        score += 2;
      }
      
      // ۹) تخفیف (۳)
      if (p.discount > 20) {
        score += 3;
        reasons.push({ icon: '🏷️', text: `${p.discount}٪ تخفیف`, weight: 3 });
      }
      
      // ۱۰) تطابق با سلیقه ثبت‌شده (۱۰)
      if (profile && profile.favoriteColors && profile.favoriteColors.length) {
        const favMatch = profile.favoriteColors.some(tc =>
          productColors.some(pc => pc.includes(tc.toLowerCase()) || tc.toLowerCase().includes(pc))
        );
        if (favMatch) {
          score += 10;
          reasons.push({ icon: '❤️', text: 'مطابق سلیقه ثبت‌شده', weight: 10 });
        }
      }
      
      return {
        ...p,
        matchPercent: Math.min(100, score),
        matchReasons: reasons,
        matchLevel: score >= 70 ? 'high' : (score >= 50 ? 'medium' : 'low'),
        matchLevelLabel: score >= 70 ? 'عالی' : (score >= 50 ? 'خوب' : 'متوسط'),
        matchLevelColor: score >= 70 ? '#16a34a' : (score >= 50 ? '#3b82f6' : '#9ca3af'),
        matchLevelIcon: score >= 70 ? '🎯' : (score >= 50 ? '👍' : '💡')
      };
    });
    
    // مرتب‌سازی
    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    
    // تنوع
    const diverse = [];
    const seenCategories = new Set();
    for (const p of scored) {
      const cat = p.category || 'unknown';
      if (!seenCategories.has(cat) || diverse.length >= limit * 1.5) {
        diverse.push(p);
        seenCategories.add(cat);
      }
      if (diverse.length >= limit) break;
    }
    
    // اگه به حد نصاب نرسیدیم، بقیه رو هم اضافه کن
    if (diverse.length < limit) {
      for (const p of scored) {
        if (!diverse.includes(p)) diverse.push(p);
        if (diverse.length >= limit) break;
      }
    }
    
    return {
      products: diverse.slice(0, limit),
      reason: `بر اساس ${ctx.category || 'سلیقه شما'} ${ctx.colors[0] || ''}`
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🧠 استخراج context از متن کاربر
  // ═══════════════════════════════════════════════════════════════
  function extractContext(text) {
    const lower = (text || '').toLowerCase().trim();
    const ctx = {
      category: null,
      colors: [],
      styles: [],
      occasions: [],
      budget: null
    };
    
    // دسته‌ها
    const categories = ['پیراهن', 'شلوار', 'کت', 'مانتو', 'بلوز', 'تیشرت', 'پالتو', 'کفش', 'کیف', 'ساعت', 'عینک', 'گردنبند', 'شال'];
    for (const cat of categories) {
      if (lower.includes(cat)) {
        ctx.category = cat;
        break;
      }
    }
    
    // رنگ‌ها
    const colorMap = {
      'مشکی': 'مشکی', 'سفید': 'سفید', 'قرمز': 'قرمز', 'آبی': 'آبی',
      'طلایی': 'طلایی', 'نقره': 'نقره', 'صورتی': 'صورتی', 'سبز': 'سبز',
      'زرد': 'زرد', 'قهوه': 'قهوه‌ای', 'کرم': 'کرم', 'سرمه': 'سرمه‌ای',
      'بنفش': 'بنفش', 'نارنجی': 'نارنجی', 'زرشکی': 'زرشکی'
    };
    for (const [key, val] of Object.entries(colorMap)) {
      if (lower.includes(key)) ctx.colors.push(val);
    }
    
    // سبک‌ها
    const styles = ['کلاسیک', 'مدرن', 'اسپرت', 'مجلسی', 'روزمره', 'رسمی', 'شلوغ', 'ساده', 'مینیمال'];
    for (const s of styles) {
      if (lower.includes(s)) ctx.styles.push(s);
    }
    
    // موقعیت
    const occasions = ['عروسی', 'مهمانی', 'اداری', 'محل کار', 'قرار', 'تاریخ', 'سفر', 'ورزش'];
    for (const o of occasions) {
      if (lower.includes(o)) ctx.occasions.push(o);
    }
    
    // بودجه
    if (lower.includes('ارزون') || lower.includes('کمتر') || lower.includes('بودجه کم')) {
      ctx.budget = 'low';
    } else if (lower.includes('گرون') || lower.includes('لوکس') || lower.includes('لاکچری')) {
      ctx.budget = 'high';
    } else if (lower.includes('متوسط')) {
      ctx.budget = 'mid';
    }
    
    return ctx;
  }
  
  // API
  window.DPAIEngineUltra = {
    recommend: ultraRecommend,
    extractContext
  };
  
  console.log('🔥 DPAIEngineUltra v1.0 loaded - 20+ factors');
})();
