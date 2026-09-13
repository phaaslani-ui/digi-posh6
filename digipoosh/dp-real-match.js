/**
 * 🆕 dp-real-match.js — سیستم تطابق واقعی
 * ------------------------------------------------------------------
 * • تحلیل واقعی رنگ عکس کاربر (Canvas API - real color sampling)
 * • محاسبه تطابق واقعی با محصولات (بدون امتیاز hardcode)
 * • درصدها کاملاً بر اساس داده‌های واقعی
 */

(function() {
  'use strict';
  if (window.DPRealMatch) return;
  window.DPRealMatch = {};

  // ═══════════════════════════════════════════════════════════════
  // 🎨 نقشه رنگ‌های واقعی (فارسی → هگز)
  // ═══════════════════════════════════════════════════════════════
  const COLOR_MAP = {
    'طلایی':    { hex: '#d4af37', warm: true,  cool: false, neutral: false, family: 'warm' },
    'زرشکی':    { hex: '#800020', warm: true,  cool: false, neutral: false, family: 'warm' },
    'قرمز':     { hex: '#dc2626', warm: true,  cool: false, neutral: false, family: 'warm' },
    'نارنجی':   { hex: '#ea580c', warm: true,  cool: false, neutral: false, family: 'warm' },
    'قهوه‌ای':  { hex: '#78350f', warm: true,  cool: false, neutral: false, family: 'warm' },
    'خردلی':    { hex: '#ca8a04', warm: true,  cool: false, neutral: false, family: 'warm' },
    'کرم':      { hex: '#fef3c7', warm: true,  cool: false, neutral: true,  family: 'warm' },
    'صورتی':    { hex: '#f9a8d4', warm: true,  cool: false, neutral: false, family: 'warm' },
    'بنفش':     { hex: '#7c3aed', warm: false, cool: true,  neutral: false, family: 'cool' },
    'سرمه‌ای':  { hex: '#1e3a8a', warm: false, cool: true,  neutral: false, family: 'cool' },
    'آبی':      { hex: '#2563eb', warm: false, cool: true,  neutral: false, family: 'cool' },
    'سبز':      { hex: '#16a34a', warm: false, cool: true,  neutral: false, family: 'cool' },
    'فیروزه‌ای':{ hex: '#0891b2', warm: false, cool: true,  neutral: false, family: 'cool' },
    'یاسی':     { hex: '#c4b5fd', warm: false, cool: true,  neutral: true,  family: 'cool' },
    'مشکی':     { hex: '#1f2937', warm: false, cool: false, neutral: true,  family: 'neutral' },
    'سفید':     { hex: '#ffffff', warm: false, cool: false, neutral: true,  family: 'neutral' },
    'خاکستری':  { hex: '#6b7280', warm: false, cool: false, neutral: true,  family: 'neutral' },
    'طوسی':     { hex: '#6b7280', warm: false, cool: false, neutral: true,  family: 'neutral' },
    'نقره‌ای':  { hex: '#c0c0c0', warm: false, cool: false, neutral: true,  family: 'neutral' },
    'زمردی':    { hex: '#059669', warm: true,  cool: true,  neutral: false, family: 'universal' }
  };

  const FALLBACK_HEX = '#9ca3af';

  function getColorInfo(colorName) {
    if (!colorName) return { hex: FALLBACK_HEX, warm: false, cool: false, neutral: true, family: 'neutral' };
    return COLOR_MAP[colorName] || COLOR_MAP[String(colorName).toLowerCase()] || { hex: FALLBACK_HEX, warm: false, cool: false, neutral: true, family: 'neutral' };
  }

  // ═══════════════════════════════════════════════════════════════
  // 📸 تحلیل واقعی رنگ عکس (Canvas API)
  // ═══════════════════════════════════════════════════════════════

  // تشخیص دمای رنگ پوست از روی RGB
  function rgbToColorTemperature(r, g, b) {
    // قانون: اگه قرمز > آبی باشه → گرم
    // اگه آبی > قرمز باشه → سرد
    const warmth = (r - b) / 255; // -1 to 1
    if (warmth > 0.15) return 'گرم';
    if (warmth < -0.05) return 'سرد';
    return 'خنثی';
  }

  // تشخیص رنگ مو از ناحیه بالای تصویر
  function detectHairColor(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;

    // نمونه‌برداری از ناحیه بالای تصویر (5%-20% ارتفاع)
    const startY = Math.floor(imageData.height * 0.05);
    const endY = Math.floor(imageData.height * 0.20);

    for (let y = startY; y < endY; y += 3) {
      for (let x = width * 0.3; x < width * 0.7; x += 3) {
        const i = (y * width + Math.floor(x)) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }

    r = r / count;
    g = g / count;
    b = b / count;
    const brightness = (r + g + b) / 3;

    if (brightness < 50) return 'مشکی';
    if (brightness > 200 && Math.abs(r - b) < 30) return 'بلوند';
    if (r > g && r > b && g > 100) return 'قهوه‌ای';
    if (r > 150 && g < 100) return 'قرمز';
    if (Math.abs(r - b) < 20 && g < r) return 'خاکستری';
    return 'قهوه‌ای';
  }

  // تشخیص رنگ چشم از ناحیه میانی
  function detectEyeColor(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;

    // ناحیه میانی (35%-45% ارتفاع - جایی که چشم‌ها هستن)
    const startY = Math.floor(imageData.height * 0.35);
    const endY = Math.floor(imageData.height * 0.45);

    // فقط دو ناحیه چپ و راست مرکز
    const leftStart = Math.floor(width * 0.30);
    const leftEnd = Math.floor(width * 0.45);
    const rightStart = Math.floor(width * 0.55);
    const rightEnd = Math.floor(width * 0.70);

    for (let y = startY; y < endY; y += 2) {
      for (let x = leftStart; x < leftEnd; x += 2) {
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      for (let x = rightStart; x < rightEnd; x += 2) {
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }

    r = r / count;
    g = g / count;
    b = b / count;

    if (b > r && b > g && b > 80) return 'آبی';
    if (g > r && g > b * 0.8) return 'سبز';
    if (r > 100 && g > 60 && b < 80) return 'قهوه‌ای';
    if (r > 150 && g > 100 && b < 100) return 'عسلی';
    return 'قهوه‌ای';
  }

  // تشخیص رنگ پوست از ناحیه گونه‌ها
  function detectSkinTone(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;

    // ناحیه گونه (50%-65% ارتفاع، 25%-75% عرض)
    const startY = Math.floor(imageData.height * 0.50);
    const endY = Math.floor(imageData.height * 0.65);
    const startX = Math.floor(width * 0.25);
    const endX = Math.floor(width * 0.75);

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }

    r = r / count;
    g = g / count;
    b = b / count;
    const brightness = (r + g + b) / 3;
    const temperature = rgbToColorTemperature(r, g, b);

    let tone = 'متوسط';
    if (brightness < 100) tone = 'تیره';
    else if (brightness > 180) tone = 'روشن';
    else tone = 'متوسط';

    return { tone, temperature, rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) }, brightness: Math.round(brightness) };
  }

  // تشخیص کنتراست
  function detectContrast(imageData) {
    const data = imageData.data;
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 16) {
      const v = (data[i] + data[i+1] + data[i+2]) / 3;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min;
    if (range > 150) return 'بالا';
    if (range > 80) return 'متوسط';
    return 'پایین';
  }

  // تحلیل کامل عکس
  async function analyzeImage(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 200; // کوچک برای سرعت
          const scale = Math.min(size / img.width, size / img.height);
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const skin = detectSkinTone(imageData);
          const hair = detectHairColor(imageData);
          const eyes = detectEyeColor(imageData);
          const contrast = detectContrast(imageData);

          resolve({
            skinTone: skin.tone,
            skinTemperature: skin.temperature,
            skinRgb: skin.rgb,
            skinBrightness: skin.brightness,
            hairColor: hair,
            eyeColor: eyes,
            contrast: contrast,
            // استخراج فصل رنگی از دما و روشنایی
            season: deriveSeason(skin, hair, eyes),
            // فرم چهره تخمینی (بر اساس نسبت‌ها)
            faceShape: 'بیضی' // پیش‌فرض؛ برای دقت نیاز به ML
          });
        } catch (e) {
          console.warn('Real analysis failed:', e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageDataUrl;
    });
  }

  // استخراج فصل رنگی واقعی
  function deriveSeason(skin, hair, eyes) {
    const warm = skin.temperature === 'گرم' || skin.rgb.r > skin.rgb.b;
    const bright = skin.brightness > 150;
    const lightHair = hair === 'بلوند' || (skin.rgb.r > 150 && skin.rgb.g > 120);
    const darkHair = hair === 'مشکی' || hair === 'قهوه‌ای';

    if (warm && bright && lightHair) return 'بهار گرم';
    if (warm && !bright && darkHair) return 'پاییز گرم';
    if (!warm && bright) return 'تابستان سرد';
    if (!warm && !bright) return 'زمستان سرد';
    return 'پاییز گرم'; // پیش‌فرض محتاطانه
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧮 محاسبه تطابق واقعی
  // ═══════════════════════════════════════════════════════════════

  // تطابق رنگ محصول با پوست (real color match)
  function calculateColorMatch(productColors, analysis) {
    if (!analysis || !productColors || productColors.length === 0) {
      return { score: 0, reason: 'رنگ محصول مشخص نیست' };
    }

    const skinTemp = analysis.skinTemperature;
    const skinBright = analysis.skinBrightness;

    let maxScore = 0;
    let bestColor = null;
    let reason = '';

    for (const colorName of productColors) {
      const color = getColorInfo(colorName);
      let score = 50; // پایه

      // تطابق دما
      if (skinTemp === 'گرم' && color.warm) {
        score += 30;
        reason = `${colorName} گرم با پوست گرم شما هماهنگ است`;
      } else if (skinTemp === 'سرد' && color.cool) {
        score += 30;
        reason = `${colorName} سرد با پوست سرد شما هماهنگ است`;
      } else if (color.family === 'neutral' || color.family === 'universal') {
        score += 15;
        reason = `${colorName} خنثی، برای همه پوست‌ها مناسب است`;
      } else if (skinTemp === 'خنثی') {
        score += 10;
      } else {
        score -= 10; // تضاد
      }

      // تطابق روشنایی (پوست روشن ↔ رنگ روشن‌تر)
      if (skinBright > 170 && (colorName === 'سفید' || colorName === 'کرم' || colorName === 'صورتی')) {
        score += 10;
      }
      if (skinBright < 100 && (colorName === 'مشکی' || colorName === 'قهوه‌ای' || colorName === 'زرشکی')) {
        score += 10;
      }

      if (score > maxScore) {
        maxScore = score;
        bestColor = colorName;
      }
    }

    return { score: Math.min(100, Math.max(0, maxScore)), reason, bestColor };
  }

  // محاسبه تطابق کلی محصول با عکس
  function calculatePhotoMatch(product, analysis) {
    if (!analysis) {
      return { score: 50, reasons: ['⚠️ تحلیل عکس در دسترس نیست'], confidence: 0 };
    }

    const reasons = [];
    let score = 40; // پایه
    let confidence = 0;

    // ۱. تطابق رنگ
    const productColors = product.colors || (product.color ? [product.color] : []);
    if (productColors.length > 0) {
      const colorMatch = calculateColorMatch(productColors, analysis);
      score = colorMatch.score; // شروع از تطابق رنگ
      if (colorMatch.reason) {
        reasons.push({ icon: '🎨', text: colorMatch.reason, weight: 40 });
      }
      confidence += 30;
    }

    // ۲. تطابق کنتراست
    if (analysis.contrast === 'بالا' && (product.color === 'مشکی' || product.color === 'سفید')) {
      score += 10;
      reasons.push({ icon: '⚡', text: 'کنتراست بالای عکس شما با رنگ این محصول هماهنگ است', weight: 10 });
    } else if (analysis.contrast === 'پایین' && (product.color === 'کرم' || product.color === 'طوسی')) {
      score += 5;
      reasons.push({ icon: '🌫️', text: 'رنگ ملایم برای کنتراست پایین عکس شما', weight: 5 });
    }
    confidence += 15;

    // ۳. تطابق فصل رنگی
    const productColorFamilies = (productColors || []).map(c => getColorInfo(c).family);
    if (analysis.season?.includes('گرم') && productColorFamilies.some(f => f === 'warm')) {
      score += 12;
      reasons.push({ icon: '🌞', text: `مناسب فصل رنگی ${analysis.season}`, weight: 12 });
    } else if (analysis.season?.includes('سرد') && productColorFamilies.some(f => f === 'cool')) {
      score += 12;
      reasons.push({ icon: '❄️', text: `مناسب فصل رنگی ${analysis.season}`, weight: 12 });
    }
    confidence += 20;

    // ۴. پرطرفدار بودن محصول (بر اساس فروش واقعی)
    if (product.sold > 200) {
      score += 5;
      reasons.push({ icon: '🔥', text: `پرفروش (${product.sold} عدد فروخته شده)`, weight: 5 });
    } else if (product.sold > 50) {
      score += 3;
      reasons.push({ icon: '📈', text: `محبوب (${product.sold} فروش)`, weight: 3 });
    }
    confidence += 10;

    // ۵. امتیاز واقعی محصول
    if (product.rating >= 4.5) {
      score += 5;
      reasons.push({ icon: '⭐', text: `امتیاز بالای ${product.rating}/5 از ${product.reviews || 0} کاربر`, weight: 5 });
    }
    confidence += 5;

    // ۶. تطابق با سلیقه ثبت‌شده
    const taste = window.DPTasteProfile?.load();
    if (taste?.favoriteColors?.length > 0) {
      const matchesTaste = productColors.some(pc =>
        taste.favoriteColors.some(tc =>
          pc.includes(tc) || tc.includes(pc) ||
          getColorInfo(pc).family === getColorInfo(tc).family
        )
      );
      if (matchesTaste) {
        score += 8;
        reasons.push({ icon: '❤️', text: 'مطابق سلیقه ثبت‌شده شما', weight: 8 });
        confidence += 10;
      }
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      reasons,
      confidence: Math.min(100, confidence)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔧 API
  // ═══════════════════════════════════════════════════════════════

  window.DPRealMatch = {
    analyzeImage,
    calculatePhotoMatch,
    calculateColorMatch,
    getColorInfo,
    COLOR_MAP
  };

  console.log('✅ DPRealMatch v1.0 loaded — real color analysis & real matching');
})();
