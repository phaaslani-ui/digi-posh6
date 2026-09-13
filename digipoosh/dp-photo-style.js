/* ============================================================
   📸 DPPhotoStyle v2.0 MAX — موتور پیشنهاد محصول بر اساس عکس
   ------------------------------------------------------------
   • تبدیل تحلیل عکس چهره/لباس به فیلتر محصول
   • استفاده از DPPhotoAI برای رنگ پوست، فصل رنگی، کنتراست
   • امتیازدهی محصولات بر اساس سازگاری با رنگ چهره
   • پیشنهاد آیتم‌هایی که با عکس چهره کاربر ست می‌شوند
   🆕 v2.0:
   • Body Shape Scoring: امتیاز محصول بر اساس فرم بدن تشخیص داده‌شده از عکس
   • Age-Aware Scoring: امتیازدهی متناسب با سن تقریبی
   • Mood-Based Filtering: فیلتر بر اساس حالت چهره
   • Clothing Color Match: تطابق با رنگ لباس در عکس
   • Photo Quality Check: بررسی کیفیت عکس
   • Multi-Layer Scoring: ۱۰ لایه امتیازدهی
   ============================================================ */
'use strict';

(function () {
  if (window.DPPhotoStyle) return;

  // ════════════════════════════════════════════════════════════
  // ۱) نگاشت رنگ‌های محصول به رنگ‌های فصل رنگی چهره
  // ════════════════════════════════════════════════════════════

  // رنگ‌های محصول (persian) → تطابق با فصل‌های رنگی
  const COLOR_TO_SEASON_MAP = {
    // بهار گرم
    'peach': ['spring', 'spring-warm'],
    'coral': ['spring', 'spring-warm'],
    'salmon': ['spring', 'spring-warm'],
    'cream': ['spring', 'summer', 'spring-warm'],
    'beige': ['spring', 'autumn', 'spring-warm', 'autumn-warm'],
    'gold': ['spring', 'autumn', 'spring-warm', 'autumn-warm'],
    'rose-gold': ['spring', 'spring-warm'],
    'camel': ['autumn', 'autumn-warm'],
    'turquoise': ['spring', 'spring-warm'],
    'light-yellow': ['spring'],
    'mint': ['spring', 'summer'],
    'sky-blue': ['spring', 'summer'],

    // تابستان سرد
    'powder-pink': ['summer', 'summer-cool'],
    'lilac': ['summer', 'summer-cool'],
    'lavender': ['summer', 'summer-cool'],
    'silver': ['summer', 'winter', 'summer-cool', 'winter-cool'],
    'cyan': ['summer', 'winter-cool'],
    'cobalt-blue': ['winter-cool', 'winter'],
    'fuchsia': ['summer', 'winter'],

    // پاییز گرم
    'burgundy': ['autumn', 'autumn-warm', 'winter'],
    'cinnamon': ['autumn', 'autumn-warm'],
    'mocha': ['autumn', 'autumn-warm'],
    'mustard': ['autumn', 'autumn-warm'],
    'olive': ['autumn', 'autumn-warm'],
    'rust': ['autumn', 'autumn-warm'],
    'terracotta': ['autumn', 'autumn-warm'],
    'brown': ['autumn', 'autumn-warm'],
    'dark-green': ['autumn', 'autumn-warm', 'winter'],

    // زمستان سرد
    'black': ['winter', 'winter-cool'],
    'navy': ['winter', 'winter-cool'],
    'white': ['summer', 'winter', 'winter-cool', 'summer-cool'],
    'emerald': ['winter', 'winter-cool'],
    'red': ['winter', 'winter-cool'],
    'gray': ['summer', 'winter'],
    'teal': ['winter', 'winter-cool'],
    'royal-blue': ['winter', 'winter-cool'],
    'purple': ['winter', 'summer'],
    'dark-red': ['winter', 'autumn'],

    // خنثی - همه فصل‌ها
    'cobalt-blue': ['winter', 'winter-cool'],
  };

  // ════════════════════════════════════════════════════════════
  // ۲) نگاشت نام فصل رنگی به کلید فصل
  // ════════════════════════════════════════════════════════════

  const SEASON_KEY_MAP = {
    'بهار گرم': 'spring-warm',
    'بهار': 'spring',
    'تابستان سرد': 'summer-cool',
    'تابستان': 'summer',
    'پاییز گرم': 'autumn-warm',
    'پاییز': 'autumn',
    'زمستان سرد': 'winter-cool',
    'زمستان': 'winter',
    'خنثی': 'neutral'
  };

  // ════════════════════════════════════════════════════════════
  // ۳) محاسبه سازگاری یک محصول با عکس چهره
  // ════════════════════════════════════════════════════════════

  /**
   * امتیاز سازگاری محصول با عکس چهره کاربر
   * @param {Object} product - محصول دیجی‌پوش
   * @param {Object} photoAnalysis - نتیجه DPPhotoAI.analyze()
   * @returns {Object} { score, level, reasons }
   */
  function scoreProductWithPhoto(product, photoAnalysis) {
    if (!product || !photoAnalysis || !photoAnalysis.success) {
      return { score: 0, level: 'unknown', reasons: [] };
    }

    const reasons = [];
    let totalScore = 50; // امتیاز پایه

    // ═══ ۱) بررسی تطابق رنگ محصول با فصل رنگی چهره (۳۰ امتیاز) ═══
    const productColor = (product.color || '').toLowerCase();
    const userSeason = SEASON_KEY_MAP[photoAnalysis.season?.main] || 'neutral';
    const seasonMatches = COLOR_TO_SEASON_MAP[productColor] || [];

    if (seasonMatches.length > 0) {
      if (seasonMatches.includes(userSeason)) {
        totalScore += 30;
        reasons.push({
          type: 'season-perfect',
          icon: '🎯',
          text: `رنگ ${productColor} کاملاً با فصل رنگی ${photoAnalysis.season?.main} شما هماهنگه`,
          score: 30
        });
      } else {
        // بررسی سازگاری فصل‌ها
        const compatibility = checkSeasonCompatibility(userSeason, seasonMatches);
        if (compatibility > 0) {
          totalScore += Math.round(compatibility * 20);
          reasons.push({
            type: 'season-ok',
            icon: '👍',
            text: `رنگ ${productColor} با فصل رنگی شما سازگاره (${Math.round(compatibility * 100)}٪)`,
            score: Math.round(compatibility * 20)
          });
        } else {
          totalScore -= 5;
          reasons.push({
            type: 'season-bad',
            icon: '⚠️',
            text: `رنگ ${productColor} با فصل رنگی ${photoAnalysis.season?.main} شما هماهنگ نیست`,
            score: -5
          });
        }
      }
    }

    // ═══ ۲) بررسی تطابق با رنگ پوست (۲۰ امتیاز) ═══
    if (photoAnalysis.skin?.tone) {
      const skinTone = photoAnalysis.skin.tone;
      if (isColorForSkinTone(productColor, skinTone)) {
        totalScore += 20;
        reasons.push({
          type: 'skin',
          icon: '☀️',
          text: `برای پوست ${photoAnalysis.skin.label} شما مناسبه`,
          score: 20
        });
      } else {
        reasons.push({
          type: 'skin-avoid',
          icon: '⛔',
          text: `برای پوست ${photoAnalysis.skin.label} شما توصیه نمی‌شه`,
          score: -5
        });
      }
    }

    // ═══ ۳) بررسی کنتراست (۱۵ امتیاز) ═══
    if (photoAnalysis.contrast) {
      const contrastLevel = photoAnalysis.contrast.level;
      const productIsBold = isBoldColor(productColor);
      const productIsNeutral = isNeutralColor(productColor);

      if (contrastLevel === 'high' && productIsBold) {
        totalScore += 15;
        reasons.push({
          type: 'contrast',
          icon: '⚡',
          text: 'کنتراست بالای چهره شما با رنگ جسورانه محصول هماهنگه',
          score: 15
        });
      } else if (contrastLevel === 'low' && productIsNeutral) {
        totalScore += 15;
        reasons.push({
          type: 'contrast',
          icon: '🤝',
          text: 'کنتراست پایین چهره شما با رنگ ملایم محصول سازگاره',
          score: 15
        });
      } else if (contrastLevel === 'high' && productIsNeutral) {
        totalScore -= 5;
        reasons.push({
          type: 'contrast-mismatch',
          icon: '⚠️',
          text: 'چهره شما کنتراست بالایی داره، بهتره رنگ‌های جسورانه‌تر انتخاب کنی',
          score: -5
        });
      } else if (contrastLevel === 'low' && productIsBold) {
        totalScore -= 5;
        reasons.push({
          type: 'contrast-mismatch',
          icon: '⚠️',
          text: 'چهره شما کنتراست پایینی داره، رنگ‌های ملایم‌تر بهتره',
          score: -5
        });
      }
    }

    // ═══ ۴) بررسی فصل سال (۱۰ امتیاز) ═══
    if (product.season) {
      const currentSeason = getCurrentSeason();
      if (product.season === currentSeason) {
        totalScore += 10;
        reasons.push({
          type: 'season-time',
          icon: '📅',
          text: `مناسب فصل ${getCurrentSeasonPersian()} هست`,
          score: 10
        });
      }
    }

    // ═══ ۵) تطبیق با رنگ چشم (۵ امتیاز) ═══
    if (photoAnalysis.eyes?.color && productColor) {
      const eyeColor = photoAnalysis.eyes.color.toLowerCase();
      if (isEyeColorComplement(eyeColor, productColor)) {
        totalScore += 5;
        reasons.push({
          type: 'eye',
          icon: '👁️',
          text: `رنگ ${productColor} چشم ${photoAnalysis.eyes.label} شما رو برجسته‌تر می‌کنه`,
          score: 5
        });
      }
    }

    // محدودسازی امتیاز
    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      score: totalScore,
      level: totalScore >= 80 ? 'perfect' : totalScore >= 65 ? 'excellent' : totalScore >= 50 ? 'good' : totalScore >= 35 ? 'ok' : 'low',
      reasons: reasons.sort((a, b) => b.score - a.score),
      matchedSeason: userSeason,
      productSeason: seasonMatches[0] || null,
      summary: generatePhotoStyleSummary(totalScore, reasons, photoAnalysis)
    };
  }

  function generatePhotoStyleSummary(score, reasons, analysis) {
    const seasonName = analysis.season?.main || 'متنوع';
    if (score >= 80) return `عالی! این محصول برای فصل رنگی ${seasonName} شما کاملاً مناسبه.`;
    if (score >= 65) return `خوبه! با رنگ پوست و فصل رنگی شما سازگاره.`;
    if (score >= 50) return `قابل قبوله. می‌تونه با استایل کلی شما هماهنگ بشه.`;
    if (score >= 35) return `متوسط. ممکنه با بعضی از رنگ‌های دیگه کمدت ست نشه.`;
    return `پایین. رنگش با فصل رنگی شما هماهنگی کمی داره.`;
  }

  // ════════════════════════════════════════════════════════════
  // ۴) توابع کمکی تشخیص رنگ
  // ════════════════════════════════════════════════════════════

  // سازگاری دو فصل رنگی
  function checkSeasonCompatibility(season1, seasonList) {
    // بهار و پاییز هر دو گرم هستن
    if ((season1 === 'spring' || season1 === 'spring-warm') &&
        (seasonList.includes('autumn') || seasonList.includes('autumn-warm'))) return 0.5;
    if ((season1 === 'autumn' || season1 === 'autumn-warm') &&
        (seasonList.includes('spring') || seasonList.includes('spring-warm'))) return 0.5;
    // تابستان و زمستان هر دو سرد هستن
    if ((season1 === 'summer' || season1 === 'summer-cool') &&
        (seasonList.includes('winter') || seasonList.includes('winter-cool'))) return 0.5;
    if ((season1 === 'winter' || season1 === 'winter-cool') &&
        (seasonList.includes('summer') || seasonList.includes('summer-cool'))) return 0.5;
    return 0;
  }

  // آیا رنگ محصول برای این تناژ پوستی مناسبه؟
  function isColorForSkinTone(color, skinTone) {
    if (!color) return false;
    color = color.toLowerCase();

    const warmSkinColors = ['coral', 'peach', 'salmon', 'gold', 'orange', 'yellow', 'red', 'cream', 'beige', 'camel', 'brown', 'olive', 'mustard', 'terracotta', 'rose-gold'];
    const coolSkinColors = ['pink', 'powder-pink', 'lavender', 'lilac', 'blue', 'navy', 'cobalt-blue', 'teal', 'cyan', 'silver', 'white', 'fuchsia', 'emerald', 'purple'];
    const neutralColors = ['gray', 'cream', 'beige', 'white', 'black', 'silver', 'gold'];

    if (skinTone === 'warm') {
      return warmSkinColors.includes(color) || neutralColors.includes(color);
    }
    if (skinTone === 'cool') {
      return coolSkinColors.includes(color) || neutralColors.includes(color);
    }
    if (skinTone === 'olive') {
      return warmSkinColors.includes(color) || color === 'olive' || color === 'emerald' || color === 'camel';
    }
    return true; // neutral
  }

  // آیا رنگ جسورانه‌ست؟
  function isBoldColor(color) {
    if (!color) return false;
    const boldColors = ['red', 'burgundy', 'cobalt-blue', 'emerald', 'fuchsia', 'purple', 'orange', 'black', 'royal-blue', 'dark-red', 'mustard'];
    return boldColors.includes(color.toLowerCase());
  }

  // آیا رنگ ملایم/خنثیه؟
  function isNeutralColor(color) {
    if (!color) return false;
    const neutralColors = ['beige', 'cream', 'white', 'light-gray', 'gray', 'peach', 'powder-pink', 'mint', 'sky-blue', 'camel', 'lavender'];
    return neutralColors.includes(color.toLowerCase());
  }

  // آیا رنگ محصول مکمل رنگ چشمه؟
  function isEyeColorComplement(eyeColor, productColor) {
    if (!eyeColor || !productColor) return false;
    eyeColor = eyeColor.toLowerCase();
    productColor = productColor.toLowerCase();

    // چشم آبی + نارنجی/مسی
    if (eyeColor.includes('آبی') && (productColor === 'orange' || productColor === 'coral' || productColor === 'gold' || productColor === 'mustard' || productColor === 'terracotta')) return true;
    // چشم قهوه‌ای + آبی/سبز
    if (eyeColor.includes('قهوه') && (productColor === 'blue' || productColor === 'navy' || productColor === 'teal' || productColor === 'emerald')) return true;
    // چشم سبز + قرمز/بنفش
    if (eyeColor.includes('سبز') && (productColor === 'red' || productColor === 'burgundy' || productColor === 'purple' || productColor === 'fuchsia')) return true;
    // چشم عسلی + بنفش/یاسی
    if (eyeColor.includes('عسلی') && (productColor === 'purple' || productColor === 'lilac' || productColor === 'lavender' || productColor === 'burgundy')) return true;

    return false;
  }

  function getCurrentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  function getCurrentSeasonPersian() {
    const map = { spring: 'بهار', summer: 'تابستان', autumn: 'پاییز', winter: 'زمستان' };
    return map[getCurrentSeason()];
  }

  // ════════════════════════════════════════════════════════════
  // ۵) فیلتر محصولات بر اساس تحلیل عکس
  // ════════════════════════════════════════════════════════════

  /**
   * فیلتر و رتبه‌بندی محصولات بر اساس تحلیل عکس
   * @param {Array} products - لیست محصولات
   * @param {Object} photoAnalysis - نتیجه DPPhotoAI.analyze()
   * @param {Object} options - { minScore, limit, excludeColors }
   * @returns {Array} محصولات رتبه‌بندی‌شده
   */
  function filterByPhotoAnalysis(products, photoAnalysis, options = {}) {
    if (!Array.isArray(products) || !photoAnalysis || !photoAnalysis.success) {
      return [];
    }
    const { minScore = 40, limit = 12, excludeColors = [] } = options;

    return products
      .map(p => ({
        product: p,
        photoMatch: scoreProductWithPhoto(p, photoAnalysis)
      }))
      .filter(item => {
        if (excludeColors.includes(item.product.color)) return false;
        return item.photoMatch.score >= minScore;
      })
      .sort((a, b) => b.photoMatch.score - a.photoMatch.score)
      .slice(0, limit)
      .map(item => ({
        ...item.product,
        photoScore: item.photoMatch.score,
        photoLevel: item.photoMatch.level,
        photoReasons: item.photoMatch.reasons,
        photoSummary: item.photoMatch.summary
      }));
  }

  // ════════════════════════════════════════════════════════════
  // ۶) اعمال تحلیل عکس روی پروفایل کاربر
  // ════════════════════════════════════════════════════════════

  /**
   * تبدیل photoAnalysis به photoStyleProfile برای استفاده در سایر موتورها
   */
  function buildPhotoStyleProfile(photoAnalysis) {
    if (!photoAnalysis || !photoAnalysis.success) return null;
    return {
      hasPhoto: true,
      skinTone: photoAnalysis.skin?.tone,
      skinLabel: photoAnalysis.skin?.label,
      skinDepth: photoAnalysis.skinDepth,
      season: photoAnalysis.season?.main,
      subSeason: photoAnalysis.season?.sub,
      seasonKey: SEASON_KEY_MAP[photoAnalysis.season?.main] || 'neutral',
      contrast: photoAnalysis.contrast?.level,
      eyeColor: photoAnalysis.eyes?.color,
      hairColor: photoAnalysis.hair?.color,
      bestColors: photoAnalysis.bestColors || [],
      avoidColors: photoAnalysis.avoidColors || [],
      seasonPalette: photoAnalysis.bestColors || [],
      analysis: photoAnalysis
    };
  }

  /**
   * ترکیب photoStyleProfile با preferredColors موجود در profile
   */
  function enrichProfileWithPhoto(profile, photoAnalysis) {
    if (!profile) profile = {};
    if (!photoAnalysis || !photoAnalysis.success) return profile;

    const photoProfile = buildPhotoStyleProfile(photoAnalysis);

    // اضافه کردن رنگ‌های فصل رنگی به preferredColors اگه قبلاً نبودن
    if (photoProfile.bestColors && photoProfile.bestColors.length > 0) {
      const currentColors = profile.preferredColors || [];
      const seasonColorsPersian = photoProfile.bestColors.slice(0, 3);
      const newColors = [...currentColors];
      seasonColorsPersian.forEach(c => {
        // تبدیل نام فارسی به کلید انگلیسی
        const engKey = persianToEnglishColor(c);
        if (engKey && !newColors.includes(engKey)) {
          newColors.push(engKey);
        }
      });
      profile.preferredColors = newColors.slice(0, 12);
    }

    profile.skinTone = photoProfile.skinTone;
    profile.skinDepth = photoProfile.skinDepth;
    profile.season = photoProfile.season;
    profile.subSeason = photoProfile.subSeason;
    profile.contrast = photoProfile.contrast;
    profile.eyeColor = photoProfile.eyeColor;
    profile.hairColor = photoProfile.hairColor;
    profile.photoStyle = photoProfile;
    profile.hasPhotoAnalysis = true;

    return profile;
  }

  // نگاشت نام فارسی رنگ به انگلیسی
  const PERSIAN_TO_ENGLISH = {
    'مشکی': 'black', 'سفید': 'white', 'خاکستری': 'gray',
    'قرمز': 'red', 'آبی': 'blue', 'سرمه‌ای': 'navy',
    'سبز': 'green', 'زرد': 'yellow', 'نارنجی': 'orange',
    'صورتی': 'pink', 'بنفش': 'purple', 'قهوه‌ای': 'brown',
    'کرم': 'cream', 'بژ': 'beige', 'طلایی': 'gold',
    'نقره‌ای': 'silver', 'زرشکی': 'burgundy', 'زمردی': 'emerald',
    'مرجانی': 'coral', 'هلویی': 'peach', 'یاسی': 'lilac',
    'خردلی': 'mustard', 'زیتونی': 'olive', 'فیروزه‌ای': 'teal',
    'سفید صدفی': 'white', 'بنفش یاسی': 'lavender', 'مسی': 'cinnamon',
    'شتری': 'camel', 'آجری': 'burgundy', 'آبی یاقوتی': 'cobalt-blue'
  };

  function persianToEnglishColor(persian) {
    if (!persian) return null;
    return PERSIAN_TO_ENGLISH[persian] || persian.toLowerCase();
  }

  // ════════════════════════════════════════════════════════════
  // 🆕 v2.0: توابع جدید
  // ════════════════════════════════════════════════════════════

  // Body Shape Scoring
  function bodyShapeScore(product, bodyShape) {
    if (!bodyShape || !bodyShape.shape) return { score: 70, factor: 0.3, reason: 'فرم بدن نامشخص' };
    const cat = (product.category || '').toLowerCase();
    const shape = bodyShape.shape;
    const matrix = {
      hourglass: { 'پیراهن': 95, 'بلوز': 92, 'کت': 90, 'پالتو': 88, 'شلوار': 90, 'دامن': 95 },
      pear: { 'پالتو': 93, 'کت': 90, 'پیراهن': 88, 'شلوار': 80, 'دامن': 75 },
      apple: { 'پالتو': 95, 'کت': 92, 'پیراهن': 90, 'شلوار': 85 },
      rectangle: { 'تیشرت': 95, 'پیراهن': 90, 'کت': 93, 'شلوار': 95, 'دامن': 88 },
      'inverted-triangle': { 'شلوار': 95, 'پیراهن': 85, 'دامن': 88, 'کت': 90 },
      athletic: { 'تیشرت': 95, 'کفش': 90, 'شلوار': 95, 'کاپشن': 90 }
    };
    const m = matrix[shape] || {};
    const garmentKey = (cat.includes('تی') ? 'تیشرت' : cat.includes('پیراهن') || cat.includes('بلوز') ? 'پیراهن' : cat.includes('کت') || cat.includes('پالتو') ? 'کت' : cat.includes('شلوار') ? 'شلوار' : cat.includes('دامن') ? 'دامن' : '');
    if (m[garmentKey]) {
      return { score: m[garmentKey], factor: 0.6, reason: 'مناسب فرم ' + (bodyShape.label || shape), garmentKey };
    }
    return { score: 70, factor: 0.3, reason: 'استاندارد' };
  }

  // Age-Aware Scoring
  function ageAwareScore(product, ageEstimate) {
    if (!ageEstimate || !ageEstimate.range) return { score: 70, factor: 0.2 };
    const range = ageEstimate.range;
    const cat = (product.category || '').toLowerCase();
    const style = (product.style || '').toLowerCase();
    const matrix = {
      teen: { 'تیشرت': 95, 'شلوار': 90, 'کفش': 92, 'کاپشن': 88, party: 95, street: 95, sport: 95, formal: 50 },
      young: { 'پیراهن': 92, 'بلوز': 90, 'شلوار': 90, 'کت': 85, modern: 92, classic: 80, formal: 85, street: 90, party: 92 },
      adult: { 'کت': 95, 'پیراهن': 92, 'شلوار': 92, 'پالتو': 90, classic: 95, elegant: 95, modern: 88, formal: 95, quiet: 90 },
      middle: { 'پالتو': 95, 'کت': 93, 'پیراهن': 90, 'شلوار': 90, classic: 95, elegant: 95, vintage: 90, quiet: 92 }
    };
    const m = matrix[range] || {};
    const key = (cat.includes('تی') ? 'تیشرت' : cat.includes('پیراهن') || cat.includes('بلوز') ? 'پیراهن' : cat.includes('کت') || cat.includes('پالتو') ? 'کت' : cat.includes('شلوار') ? 'شلوار' : cat.includes('کفش') ? 'کفش' : '');
    let s = m[key] || 70;
    // امتیاز استایل
    Object.keys(m).forEach(k => { if (style.includes(k)) s = Math.max(s, m[k]); });
    return { score: s, factor: 0.4, range, reason: 'مناسب سن ' + (ageEstimate.label || range) };
  }

  // Mood-Based Filtering
  function moodFilter(product, mood) {
    if (!mood || !mood.mood) return { score: 70, factor: 0.2 };
    const cat = (product.category || '').toLowerCase();
    const m = mood.mood;
    const matrix = {
      festive: { 'پیراهن': 92, 'کفش': 88, 'کیف': 85, party: 95, formal: 90 },
      formal: { 'کت': 95, 'پیراهن': 92, 'شلوار': 90, 'کفش': 90, formal: 95, classic: 92, elegant: 92 },
      'casual-warm': { 'تیشرت': 90, 'شلوار': 88, casual: 92, sport: 85 },
      'casual-cool': { 'پیراهن': 88, 'شلوار': 88, modern: 90, minimal: 90 },
      neutral: { 'پیراهن': 80, 'بلوز': 80, 'شلوار': 80, classic: 85 }
    };
    const me = matrix[m] || {};
    const key = (cat.includes('تی') ? 'تیشرت' : cat.includes('پیراهن') || cat.includes('بلوز') ? 'پیراهن' : cat.includes('کت') || cat.includes('پالتو') ? 'کت' : cat.includes('شلوار') ? 'شلوار' : cat.includes('کفش') ? 'کفش' : '');
    const s = me[key] || 70;
    return { score: s, factor: 0.3, mood: m, reason: 'حالت ' + (mood.label || m) };
  }

  // Clothing Color Match
  function clothingColorMatch(product, photoClothingColors) {
    if (!photoClothingColors || !photoClothingColors.length) return { score: 50, factor: 0.2, matched: false };
    if (!product.colors || !product.colors.length) return { score: 50, factor: 0.2, matched: false };
    const productColors = product.colors.map(c => (c || '').toLowerCase());
    const matches = photoClothingColors.filter(pc => {
      const persian = (pc.persian || '').toLowerCase();
      const hue = pc.hue;
      return productColors.some(pc2 => {
        if (!pc2) return false;
        if (persian.includes(pc2) || pc2.includes(persian)) return true;
        // تطابق بر اساس hue
        const productHue = hueMap[pc2];
        if (productHue !== undefined && hue !== undefined) {
          return Math.abs(productHue - hue) < 30;
        }
        return false;
      });
    });
    const score = matches.length > 0 ? 90 : 40;
    return { score, factor: 0.4, matched: matches.length > 0, matchCount: matches.length, reason: matches.length > 0 ? 'هماهنگ با لباس عکس' : 'متفاوت از لباس' };
  }

  const hueMap = {
    'red': 0, 'orange': 30, 'yellow': 50, 'green': 100, 'teal': 170,
    'blue': 210, 'navy': 230, 'purple': 270, 'pink': 330, 'brown': 25,
    'beige': 35, 'gray': 0, 'black': 0, 'white': 0
  };

  // Photo Quality Check
  function photoQualityCheck(photoQuality) {
    if (!photoQuality) return { usable: true, score: 70, note: 'کیفیت بررسی نشد' };
    if (!photoQuality.isAcceptable) return { usable: false, score: 40, note: 'کیفیت عکس پایین - لطفاً عکس بهتری بفرستید' };
    return { usable: true, score: photoQuality.overallScore, note: 'کیفیت قابل قبول' };
  }

  // Multi-Layer Scoring (۱۰ لایه)
  function multiLayerPhotoScore(product, photoAnalysis) {
    if (!photoAnalysis || !photoAnalysis.success) return { score: 50, layers: {}, recommendation: 'normal' };
    const layers = {};
    // ۱) رنگ پوست
    layers.skinTone = isColorForSkinTone(product) ? 95 : 50;
    // ۲) فصل رنگی
    layers.colorSeason = photoAnalysis.season ? 85 : 70;
    // ۳) کنتراست
    layers.contrast = photoAnalysis.contrast ? (photoAnalysis.contrast.score || 75) : 70;
    // ۴) رنگ چشم
    layers.eyeColor = 75;
    // ۵) فرم بدن (v3.0)
    if (photoAnalysis.bodyShape) {
      const bs = bodyShapeScore(product, photoAnalysis.bodyShape);
      layers.bodyShape = bs.score;
    } else layers.bodyShape = 70;
    // ۶) سن (v3.0)
    if (photoAnalysis.ageEstimate) {
      const aas = ageAwareScore(product, photoAnalysis.ageEstimate);
      layers.age = aas.score;
    } else layers.age = 70;
    // ۷) حالت چهره (v3.0)
    if (photoAnalysis.mood) {
      const mf = moodFilter(product, photoAnalysis.mood);
      layers.mood = mf.score;
    } else layers.mood = 70;
    // ۸) لباس عکس (v3.0)
    if (photoAnalysis.clothingColors) {
      const ccm = clothingColorMatch(product, photoAnalysis.clothingColors);
      layers.clothingMatch = ccm.score;
    } else layers.clothingMatch = 60;
    // ۹) کیفیت عکس
    if (photoAnalysis.photoQuality) {
      const pqc = photoQualityCheck(photoAnalysis.photoQuality);
      layers.photoQuality = pqc.score;
    } else layers.photoQuality = 70;
    // ۱۰) امتیاز پایه
    layers.base = 60;

    // محاسبه میانگین وزنی
    const weights = { skinTone: 0.15, colorSeason: 0.12, contrast: 0.10, eyeColor: 0.05, bodyShape: 0.15, age: 0.10, mood: 0.08, clothingMatch: 0.10, photoQuality: 0.05, base: 0.10 };
    let total = 0, totalW = 0;
    Object.keys(layers).forEach(k => {
      const w = weights[k] || 0.05;
      total += layers[k] * w;
      totalW += w;
    });
    const finalScore = Math.round(total / totalW);
    let recommendation = 'normal';
    if (finalScore >= 85) recommendation = 'perfect';
    else if (finalScore >= 70) recommendation = 'good';
    else if (finalScore >= 55) recommendation = 'ok';
    else recommendation = 'avoid';
    return { score: finalScore, layers, recommendation, totalLayers: Object.keys(layers).length };
  }

  // ════════════════════════════════════════════════════════════
  // API عمومی
  // ════════════════════════════════════════════════════════════

  window.DPPhotoStyle = {
    version: '2.0 MAX',
    scoreProductWithPhoto,
    filterByPhotoAnalysis,
    buildPhotoStyleProfile,
    enrichProfileWithPhoto,
    isColorForSkinTone,
    isBoldColor,
    isNeutralColor,
    getCurrentSeasonPersian,
    // 🆕 v2.0
    bodyShapeScore,
    ageAwareScore,
    moodFilter,
    clothingColorMatch,
    photoQualityCheck,
    multiLayerPhotoScore,
    COLOR_TO_SEASON_MAP,
    SEASON_KEY_MAP,
    hueMap
  };

  console.log('📸 DPPhotoStyle v2.0 MAX loaded — ۱۰ لایه امتیازدهی + Body Shape + Age-aware');
})();
