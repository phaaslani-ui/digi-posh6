/**
 * 🧬 dp-hybrid-scorer.js v1.0 — ترکیب هوشمند شخصیت + سلیقه + فروش
 * ------------------------------------------------------------------
 * • Hybrid Score = α(personality) + β(taste) + γ(sales)
 * • محاسبه تطابق شخصیتی بر اساس آرکی‌تایپ کاربر
 * • محاسبه امتیاز فروش (sold + rating + reviews)
 * • وزن‌دهی پویا بر اساس context
 * • پشتیبانی از hybrid mode در صفحات مختلف
 */

(function() {
  'use strict';
  if (window.DPHybridScorerLoaded) return;
  window.DPHybridScorerLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🎯 وزن‌ها بر اساس context
  // ═══════════════════════════════════════════════════════════════
  const CONTEXT_WEIGHTS = {
    home: { personality: 0.45, taste: 0.25, sales: 0.30 },       // صفحه اصلی
    taste: { personality: 0.20, taste: 0.65, sales: 0.15 },      // پیشنهادهای من
    product: { personality: 0.30, taste: 0.50, sales: 0.20 },    // صفحه کالا (مرتبط)
    search: { personality: 0.20, taste: 0.50, sales: 0.30 },     // نتایج جستجو
    feed: { personality: 0.30, taste: 0.30, sales: 0.40 },       // feed عمومی
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧠 محاسبه تطابق شخصیتی محصول با آرکی‌تایپ کاربر
  // ═══════════════════════════════════════════════════════════════
  function calculatePersonalityMatch(product, taste) {
    if (!taste || !window.DPBehavior) return { score: 50, reasons: [] };

    // گرفتن آرکی‌تایپ‌های برتر کاربر
    const userArchetypes = window.DPBehavior.getTopArchetypes(taste, 3);
    if (userArchetypes.length === 0) return { score: 50, reasons: [] };

    const productCategory = (product.category || '').toLowerCase().trim();
    const productStyle = (product.style || '').toLowerCase().trim();
    const productColors = (product.colors || []).map(c => (c || '').toLowerCase().trim());
    const productTags = (product.tags || []).map(t => (t || '').toLowerCase().trim());
    const productDesc = (product.description || '').toLowerCase();
    const allProductText = [productCategory, productStyle, ...productColors, ...productTags, productDesc].join(' ').toLowerCase();

    let totalScore = 0;
    const reasons = [];

    userArchetypes.forEach((arch, idx) => {
      // وزن آرکی‌تایپ: اولی بیشتر
      const weight = idx === 0 ? 0.6 : (idx === 1 ? 0.3 : 0.1);
      let archScore = 0;

      // ۱) تطابق سبک
      const styleMatch = arch.styles.some(s => allProductText.includes(s.toLowerCase()));
      if (styleMatch) {
        archScore += 40;
        if (idx === 0) reasons.push(`${arch.emoji} با شخصیت ${arch.name} شما سازگاره`);
      }

      // ۲) تطابق رنگ
      const colorMatch = arch.colors.some(c =>
        productColors.some(pc => pc.includes(c) || c.includes(pc))
      );
      if (colorMatch) {
        archScore += 30;
      }

      // ۳) تطابق کلمات کلیدی
      const keywords = {
        'innocent': ['ساده', 'سفید', 'پاستیل', 'مینیمال', 'نرم'],
        'sage': ['کلاسیک', 'اداری', 'شیک', 'اصیل', 'مینیمال'],
        'explorer': ['اسپرت', 'ماجراجو', 'طبیعت', 'راحت', 'بودو'],
        'hero': ['قدرت', 'قوی', 'مشکی', 'نظامی', 'ورزشی'],
        'outlaw': ['چرم', 'مشکی', 'خیابانی', 'متالیک', 'تیره'],
        'magician': ['خلاق', 'هنری', 'لوکس', 'طلایی', 'خاص'],
        'lover': ['مجلسی', 'رمانتیک', 'زنانه', 'ظریف', 'حریر'],
        'jester': ['شاد', 'رنگارنگ', 'جوان', 'خنده', 'بازیگوش'],
        'everyman': ['روزمره', 'ساده', 'راحت', 'شلوار', 'تی‌شرت'],
        'caregiver': ['نرم', 'کرم', 'مهربان', 'خانگی', 'راحت'],
        'ruler': ['لوکس', 'کلاسیک', 'مشکی', 'طلایی', 'شیک'],
        'creator': ['هنری', 'خلاق', 'خاص', 'بوهو', 'مدرن'],
      };

      const archKeywords = keywords[arch.key] || [];
      const keywordMatches = archKeywords.filter(k => allProductText.includes(k));
      if (keywordMatches.length > 0) {
        archScore += Math.min(20, keywordMatches.length * 5);
      }

      // محدود کردن به ۱۰۰
      archScore = Math.min(100, archScore);
      totalScore += archScore * weight;
    });

    return {
      score: Math.round(totalScore),
      reasons: reasons.slice(0, 2),
      matchedArchetypes: userArchetypes.filter((a, i) => i < 2).map(a => a.key)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 💰 محاسبه امتیاز فروش و محبوبیت
  // ═══════════════════════════════════════════════════════════════
  function calculateSalesScore(product) {
    let score = 30; // پایه

    // ۱) تعداد فروش (۴۰٪ وزن)
    const sold = product.sold || 0;
    if (sold > 0) {
      // log scale: ۱ فروش = ۱۰ امتیاز، ۱۰ فروش = ۲۰، ۱۰۰ = ۳۰، ۱۰۰۰ = ۴۰
      const soldScore = Math.min(40, Math.log10(sold + 1) * 10);
      score += soldScore;
    }

    // ۲) امتیاز محصول (۳۰٪)
    const rating = product.rating || 0;
    if (rating > 0) {
      // rating ۴ = ۲۰، ۴.۵ = ۲۵، ۵ = ۳۰
      const ratingScore = Math.min(30, (rating / 5) * 30);
      score += ratingScore;
    }

    // ۳) تعداد نظرات (۲۰٪) - نشون‌دهنده محبوبیت واقعی
    const reviews = product.reviews || 0;
    if (reviews > 0) {
      // log scale
      const reviewScore = Math.min(20, Math.log10(reviews + 1) * 6);
      score += reviewScore;
    }

    // ۴) تخفیف (۱۰٪) - جذابیت خرید
    const discount = product.discount || 0;
    if (discount > 0) {
      const discountScore = Math.min(10, discount / 5);
      score += discountScore;
    }

    // ۵) تازگی (اگه createdAt داشت)
    if (product.createdAt) {
      const ageDays = (Date.now() - product.createdAt) / 86400000;
      if (ageDays < 7) score += 5; // خیلی تازه
      else if (ageDays < 30) score += 2; // نسبتاً تازه
      // محصولات قدیمی نه مثبت نه منفی
    }

    // محدود کردن به ۱۰۰
    return Math.min(100, Math.round(score));
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 محاسبه Hybrid Score
  // ═══════════════════════════════════════════════════════════════
  function calculateHybridScore(product, taste, context) {
    context = context || 'home';
    const weights = CONTEXT_WEIGHTS[context] || CONTEXT_WEIGHTS.home;

    // ۱) امتیاز شخصیتی
    const personality = calculatePersonalityMatch(product, taste);
    const personalityScore = personality.score;

    // ۲) امتیاز سلیقه
    let tasteScore = 50; // پیش‌فرض
    if (taste && window.DPTasteProfile) {
      try {
        const match = window.DPTasteProfile.calculateMatch(product, taste);
        tasteScore = match.percent;
      } catch (e) {}
    }

    // ۳) امتیاز فروش
    const salesScore = calculateSalesScore(product);

    // ترکیب
    const hybridScore = Math.round(
      (personalityScore * weights.personality) +
      (tasteScore * weights.taste) +
      (salesScore * weights.sales)
    );

    return {
      hybrid: hybridScore,
      personality: personalityScore,
      taste: tasteScore,
      sales: salesScore,
      personalityReasons: personality.reasons,
      personalityArchetypes: personality.matchedArchetypes || [],
      weights: weights,
      // سطح‌بندی
      level: getLevel(hybridScore),
      levelLabel: getLevelLabel(hybridScore),
      levelColor: getLevelColor(hybridScore),
      levelIcon: getLevelIcon(hybridScore),
    };
  }

  function getLevel(score) {
    if (score >= 85) return 'perfect';
    if (score >= 75) return 'great';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    return 'low';
  }

  function getLevelLabel(score) {
    if (score >= 85) return 'عالی';
    if (score >= 75) return 'خیلی خوب';
    if (score >= 65) return 'خوب';
    if (score >= 50) return 'متوسط';
    return 'پایین';
  }

  function getLevelColor(score) {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#10b981';
    if (score >= 65) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#9ca3af';
  }

  function getLevelIcon(score) {
    if (score >= 85) return '🎯';
    if (score >= 75) return '✨';
    if (score >= 65) return '👍';
    if (score >= 50) return '💡';
    return '🤔';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏆 محصولات ویژه برای شخصیت
  // ═══════════════════════════════════════════════════════════════
  function getProductsForPersonality(taste, options) {
    options = options || {};
    const context = options.context || 'home';
    const limit = options.limit || 8;
    const minScore = options.minScore || 50;

    if (!window.DPProducts || !window.DPProducts.all) return [];

    const allProducts = window.DPProducts.all();
    if (!Array.isArray(allProducts) || allProducts.length === 0) return [];

    // محاسبه hybrid score برای همه
    const scored = allProducts.map(p => {
      const score = calculateHybridScore(p, taste, context);
      return {
        ...p,
        hybridScore: score.hybrid,
        personalityScore: score.personality,
        tasteScore: score.taste,
        salesScore: score.sales,
        personalityReasons: score.personalityReasons,
        personalityArchetypes: score.personalityArchetypes,
        level: score.level,
        levelLabel: score.levelLabel,
        levelColor: score.levelColor,
        levelIcon: score.levelIcon,
        weights: score.weights,
      };
    });

    // فیلتر
    let filtered = scored.filter(p => p.hybridScore >= minScore);

    // 🆕 اگه چیزی بالای minScore نبود، نزدیک‌ترین رو نشون بده
    if (filtered.length === 0 && scored.length > 0) {
      const sorted = [...scored].sort((a, b) => b.hybridScore - a.hybridScore);
      const topScore = sorted[0].hybridScore;
      filtered = sorted.filter(p => p.hybridScore >= Math.max(20, topScore - 10));
      // علامت‌گذاری
      filtered.forEach(p => {
        p.level = 'fallback';
        p.levelLabel = 'نزدیک به سلیقه';
        p.levelColor = '#9ca3af';
        p.levelIcon = '💡';
      });
    } else {
      // مرتب‌سازی بر اساس hybrid
      filtered.sort((a, b) => b.hybridScore - a.hybridScore);
    }

    return filtered.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 توضیح "چرا این محصول برای شما"
  // ═══════════════════════════════════════════════════════════════
  function explainMatch(product, taste, context) {
    context = context || 'home';
    const score = calculateHybridScore(product, taste, context);
    const reasons = [];

    // دلیل شخصیتی
    if (score.personality >= 70) {
      if (score.personalityArchetypes && score.personalityArchetypes.length > 0) {
        const archKey = score.personalityArchetypes[0];
        const arch = window.DPBehavior?.getArchetypes?.()[archKey];
        if (arch) {
          reasons.push({
            icon: arch.emoji,
            text: `مناسب شخصیت ${arch.name} شما`,
            score: score.personality,
          });
        }
      }
      if (score.personalityReasons && score.personalityReasons.length > 0) {
        score.personalityReasons.forEach(r => {
          reasons.push({ icon: '🎭', text: r, score: score.personality });
        });
      }
    }

    // دلیل سلیقه‌ای
    if (score.taste >= 70) {
      reasons.push({
        icon: '🎨',
        text: `${score.taste}٪ با سلیقه شما سازگاره`,
        score: score.taste,
      });
    }

    // دلیل فروش
    if (score.sales >= 70) {
      const sold = product.sold || 0;
      const rating = product.rating || 0;
      if (sold > 100) {
        reasons.push({
          icon: '🔥',
          text: `${sold.toLocaleString('fa-IR')} نفر این رو خریدن`,
          score: score.sales,
        });
      } else if (rating >= 4.5) {
        reasons.push({
          icon: '⭐',
          text: `امتیاز ${rating} از ۵`,
          score: score.sales,
        });
      } else {
        reasons.push({
          icon: '💎',
          text: 'از پرفروش‌های فروشنده',
          score: score.sales,
        });
      }
    }

    return {
      score: score,
      reasons: reasons.slice(0, 3),
      summary: reasons[0]?.text || 'پیشنهاد ویژه برای شما',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPHybridScorer = {
    version: '1.0',
    calculateHybridScore: calculateHybridScore,
    calculatePersonalityMatch: calculatePersonalityMatch,
    calculateSalesScore: calculateSalesScore,
    getProductsForPersonality: getProductsForPersonality,
    explainMatch: explainMatch,
    CONTEXT_WEIGHTS: CONTEXT_WEIGHTS,
  };

  console.log('🧬 DPHybridScorer v1.0 loaded — شخصیت + سلیقه + فروش');
})();
