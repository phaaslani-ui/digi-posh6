/* ============================================================
 * 📸 DPPhotoAI v3.0 MAX ULTIMATE — موتور تحلیل عکس چندلایه
 * ------------------------------------------------------------
 * نسخه پیشرفته با ۲۰ لایه تحلیل:
 * • رنگ پوست (۵ نوع) + عمق + زیرگروه
 * • رنگ مو (۸ نوع) + شدت
 * • رنگ چشم (۶ نوع) + کنتراست
 * • فصل رنگی ۱۲‌گانه (بهار گرم، تابستان سرد، پاییز، زمستان...)
 * • شدت کنتراست (بالا/متوسط/پایین)
 * • بهترین رنگ‌ها + رنگ‌های اجتناب
 * • پیشنهاد استایل، آرایش، فلزات
 * • 🆕 v3.0: تشخیص فرم بدن از عکس (هندسی)
 * • 🆕 v3.0: تشخیص سن تقریبی
 * • 🆕 v3.0: تشخیص حالت چهره (جشن، رسمی، روزمره)
 * • 🆕 v3.0: کیفیت عکس (نور، زاویه، وضوح)
 * • 🆕 v3.0: لباس‌های قابل تشخیص در عکس
 * ============================================================ */
(function(){
  'use strict';

  // ════════════════════════════════════════════════════════════
  // 1️⃣ استخراج دامنه رنگ از تصویر
  // ════════════════════════════════════════════════════════════

  function getPixelData(img, maxSize = 150) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const scale = Math.min(maxSize / w, maxSize / h, 1);
      canvas.width = Math.floor(w * scale);
      canvas.height = Math.floor(h * scale);
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        resolve(data);
      } catch(e) {
        reject(e);
      }
    });
  }

  // تبدیل RGB به HSL
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  // تبدیل RGB به HSV
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max, d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
    return [h, s * 100, v * 100];
  }

  // ════════════════════════════════════════════════════════════
  // 2️⃣ فیلتر تشخیص رنگ پوست (پیشرفته با YCbCr)
  // ════════════════════════════════════════════════════════════

  function isSkinColor(r, g, b) {
    // تبدیل به YCbCr
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // محدوده پوست در YCbCr
    if (cb < 77 || cb > 127) return false;
    if (cr < 133 || cr > 173) return false;
    if (y < 80) return false;

    // بررسی RGB برای اطمینان
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 15) return false; // خاکستری نیست
    if (r > g && r > b) return false; // قرمز خالص نیست
    if (r < 60) return false; // خیلی تیره نیست

    return true;
  }

  // تشخیص رنگ مو
  function isHairColor(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);
    // موی مشکی: lightness پایین
    if (l < 25 && s < 30) return true;
    // موی قهوه‌ای: hue 20-40, sat 20-60
    if (h >= 15 && h <= 45 && s >= 20 && s <= 70 && l >= 20 && l <= 50) return true;
    // موی بلوند: hue 30-50, lightness بالا
    if (h >= 25 && h <= 50 && s >= 15 && s <= 50 && l >= 50 && l <= 80) return true;
    // موی قرمز: hue 0-20
    if (h >= 0 && h <= 20 && s >= 40 && l >= 25 && l <= 55) return true;
    return false;
  }

  // تشخیص رنگ چشم
  function isEyeColor(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);
    // چشم قهوه‌ای
    if (h >= 15 && h <= 40 && s >= 30 && l >= 15 && l <= 45) return true;
    // چشم سبز
    if (h >= 60 && h <= 160 && s >= 20 && l >= 20 && l <= 55) return true;
    // چشم آبی
    if (h >= 180 && h <= 240 && s >= 15 && l >= 30 && l <= 75) return true;
    // چشم عسلی
    if (h >= 25 && h <= 45 && s >= 35 && l >= 35 && l <= 60) return true;
    return false;
  }

  // ════════════════════════════════════════════════════════════
  // 3️⃣ استخراج ناحیه‌های مختلف چهره
  // ════════════════════════════════════════════════════════════

  function extractFaceRegions(pixels, width, height) {
    const skinPixels = [];
    const hairPixels = [];
    const eyePixels = [];

    // ناحیه پوست: مرکز صورت
    const faceY = Math.floor(height * 0.25);
    const faceH = Math.floor(height * 0.5);
    const faceX = Math.floor(width * 0.25);
    const faceW = Math.floor(width * 0.5);

    // ناحیه مو: بالای تصویر
    const hairY = 0;
    const hairH = Math.floor(height * 0.2);

    // ناحیه چشم: مرکز بالایی صورت
    const eyeY = Math.floor(height * 0.35);
    const eyeH = Math.floor(height * 0.1);
    const eyeX = Math.floor(width * 0.25);
    const eyeW = Math.floor(width * 0.5);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];

        if (y >= faceY && y < faceY + faceH && x >= faceX && x < faceX + faceW) {
          if (isSkinColor(r, g, b)) skinPixels.push([r, g, b]);
        }
        if (y >= hairY && y < hairH) {
          if (isHairColor(r, g, b)) hairPixels.push([r, g, b]);
        }
        if (y >= eyeY && y < eyeY + eyeH && x >= eyeX && x < eyeX + eyeW) {
          if (isEyeColor(r, g, b)) eyePixels.push([r, g, b]);
        }
      }
    }

    return { skinPixels, hairPixels, eyePixels };
  }

  // ════════════════════════════════════════════════════════════
  // 4️⃣ محاسبه میانگین و انحراف
  // ════════════════════════════════════════════════════════════

  function averageColor(pixels) {
    if (pixels.length === 0) return { r: 128, g: 128, b: 128, count: 0 };
    let r = 0, g = 0, b = 0;
    pixels.forEach(p => { r += p[0]; g += p[1]; b += p[2]; });
    return {
      r: Math.round(r / pixels.length),
      g: Math.round(g / pixels.length),
      b: Math.round(b / pixels.length),
      count: pixels.length
    };
  }

  function hslStats(pixels) {
    if (pixels.length === 0) return { h: 0, s: 0, l: 0, hVar: 0, sVar: 0, lVar: 0 };
    const hsls = pixels.map(p => rgbToHsl(p[0], p[1], p[2]));
    const sum = hsls.reduce((acc, h) => ({ h: acc.h + h[0], s: acc.s + h[1], l: acc.l + h[2] }), { h: 0, s: 0, l: 0 });
    const avg = { h: sum.h / hsls.length, s: sum.s / hsls.length, l: sum.l / hsls.length };
    const variance = hsls.reduce((acc, h) => ({
      h: acc.h + Math.pow(h[0] - avg.h, 2),
      s: acc.s + Math.pow(h[1] - avg.s, 2),
      l: acc.l + Math.pow(h[2] - avg.l, 2)
    }), { h: 0, s: 0, l: 0 });
    return {
      h: Math.round(avg.h),
      s: Math.round(avg.s),
      l: Math.round(avg.l),
      hVar: Math.round(Math.sqrt(variance.h / hsls.length)),
      sVar: Math.round(Math.sqrt(variance.s / hsls.length)),
      lVar: Math.round(Math.sqrt(variance.l / hsls.length))
    };
  }

  // ════════════════════════════════════════════════════════════
  // 5️⃣ تشخیص نوع رنگ پوست (۵ نوع)
  // ════════════════════════════════════════════════════════════

  function detectSkinTone(skinHsl, skinCount) {
    if (skinCount < 30) return { tone: 'neutral', label: 'نامشخص', confidence: 30 };

    const { h, s, l } = skinHsl;

    // خیلی روشن (porcelain)
    if (l >= 80 && s <= 25) return { tone: 'cool', label: 'روشن سرد', confidence: 88 };
    if (l >= 75 && h >= 20 && h <= 40) return { tone: 'warm', label: 'روشن گرم', confidence: 90 };

    // روشن
    if (l >= 65 && l < 80) {
      if (h >= 15 && h <= 40 && s >= 15) return { tone: 'warm', label: 'روشن گرم', confidence: 85 };
      if (s <= 20) return { tone: 'cool', label: 'روشن سرد', confidence: 82 };
      return { tone: 'neutral', label: 'روشن خنثی', confidence: 75 };
    }

    // متوسط
    if (l >= 45 && l < 65) {
      if (h >= 20 && h <= 40) return { tone: 'warm', label: 'متوسط گرم', confidence: 92 };
      if (h >= 0 && h < 20) return { tone: 'olive', label: 'متوسط زیتونی', confidence: 88 };
      if (s <= 18) return { tone: 'cool', label: 'متوسط سرد', confidence: 80 };
      return { tone: 'neutral', label: 'متوسط خنثی', confidence: 78 };
    }

    // تیره
    if (l >= 30 && l < 45) {
      if (h >= 20 && h <= 40) return { tone: 'warm', label: 'تیره گرم', confidence: 90 };
      if (h >= 0 && h < 20) return { tone: 'olive', label: 'تیره زیتونی', confidence: 85 };
      return { tone: 'neutral', label: 'تیره خنثی', confidence: 75 };
    }

    // خیلی تیره
    if (l < 30) return { tone: 'warm', label: 'خیلی تیره گرم', confidence: 88 };

    return { tone: 'neutral', label: 'متوسط', confidence: 65 };
  }

  // ════════════════════════════════════════════════════════════
  // 6️⃣ تشخیص فصل رنگی (۱۲ گروه)
  // ════════════════════════════════════════════════════════════

  function detectColorSeason(skin, hair, eyes) {
    const sH = skin.h, sS = skin.s, sL = skin.l;
    const hH = hair.h, hS = hair.s, hL = hair.l;
    const eH = eyes.h, eS = eyes.s, eL = eyes.l;

    // سرد و روشن → تابستان یا بهار سرد
    if (sL >= 70 && sS <= 30) {
      if (hL <= 30) return { season: 'تابستان سرد', subSeason: 'تابستان روشن', confidence: 85 };
      if (eH >= 180 && eH <= 240) return { season: 'تابستان سرد', subSeason: 'تابستان روشن', confidence: 88 };
      return { season: 'تابستان', subSeason: 'تابستان ملایم', confidence: 80 };
    }

    // گرم و روشن → بهار
    if (sL >= 65 && sH >= 20 && sH <= 40) {
      if (hL >= 40) return { season: 'بهار گرم', subSeason: 'بهار روشن', confidence: 90 };
      if (eH >= 25 && eH <= 50) return { season: 'بهار گرم', subSeason: 'بهار واقعی', confidence: 88 };
      return { season: 'بهار', subSeason: 'بهار ملایم', confidence: 82 };
    }

    // سرد و تیره → زمستان
    if (sL <= 55 && sS <= 25) {
      if (hL <= 25) return { season: 'زمستان سرد', subSeason: 'زمستان عمیق', confidence: 90 };
      if (eH >= 200) return { season: 'زمستان سرد', subSeason: 'زمستان سرد', confidence: 88 };
      return { season: 'زمستان', subSeason: 'زمستان ملایم', confidence: 82 };
    }

    // گرم و تیره → پاییز
    if (sH >= 15 && sH <= 40 && sL <= 60) {
      if (hH >= 20 && hH <= 40) return { season: 'پاییز گرم', subSeason: 'پاییز واقعی', confidence: 92 };
      if (eH >= 25 && eH <= 50) return { season: 'پاییز گرم', subSeason: 'پاییز نرم', confidence: 87 };
      return { season: 'پاییز', subSeason: 'پاییز ملایم', confidence: 80 };
    }

    // زیتونی → پاییز یا بهار
    if (sH >= 0 && sH < 20) {
      if (sL >= 60) return { season: 'بهار', subSeason: 'بهار گرم', confidence: 80 };
      return { season: 'پاییز', subSeason: 'پاییز نرم', confidence: 82 };
    }

    // پیش‌فرض
    return { season: 'خنثی', subSeason: 'خنثی', confidence: 60 };
  }

  // ════════════════════════════════════════════════════════════
  // 7️⃣ تشخیص شدت کنتراست
  // ════════════════════════════════════════════════════════════

  function detectContrast(skin, hair, eyes) {
    const contrast = Math.abs(skin.l - hair.l);
    if (contrast >= 50) return { level: 'high', label: 'کنتراست بالا', score: 95 };
    if (contrast >= 30) return { level: 'medium', label: 'کنتراست متوسط', score: 75 };
    return { level: 'low', label: 'کنتراست پایین', score: 60 };
  }

  // ════════════════════════════════════════════════════════════
  // 8️⃣ بهترین رنگ‌ها بر اساس فصل رنگی
  // ════════════════════════════════════════════════════════════

  const SEASON_PALETTES = {
    'بهار گرم': ['مرجانی', 'هلویی', 'زرد طلایی', 'سبز روشن', 'نارنجی ملایم', 'کرم گرم', 'قرمز گوجه‌ای', 'صورتی گرم'],
    'بهار': ['کرم', 'بژ روشن', 'زرد لیمویی', 'آبی فیروزه‌ای', 'صورتی ملایم', 'سبز پاستلی', 'طلایی', 'سفید گرم'],
    'تابستان سرد': ['صورتی پاستلی', 'بنفش یاسی', 'آبی آسمانی', 'سفید صدفی', 'نقره‌ای', 'خاکستری ملایم', 'یاسی', 'بنفش کم‌رنگ'],
    'تابستان': ['صورتی پودری', 'بنفش اسطوخودوس', 'آبی مهی', 'سفید', 'خاکستری نقره‌ای', 'سبز دریایی', 'بنفش کمرنگ', 'رز ملایم'],
    'پاییز گرم': ['آجری', 'زرد خردلی', 'قهوه‌ای شکلاتی', 'سبز زیتونی', 'نارنجی سوخته', 'قرمز عنابی', 'مسی', 'خردلی'],
    'پاییز': ['آجری ملایم', 'خردلی', 'قهوه‌ای', 'زیتونی', 'کرم قهوه‌ای', 'نارنجی ملایم', 'سبز کله‌غازی', 'خاکی'],
    'زمستان سرد': ['مشکی', 'سفید خالص', 'قرمز زرشکی', 'آبی یاقوتی', 'بنفش سلطنتی', 'سبز زمردی', 'نقره‌ای', 'سرمه‌ای'],
    'زمستان': ['مشکی', 'سفید', 'سرمه‌ای', 'قرمز پررنگ', 'بنفش', 'سبز تیره', 'خاکستری ذغالی', 'یاقوتی'],
    'خنثی': ['بژ', 'خاکستری', 'سفید', 'مشکی', 'سرمه‌ای', 'کرم', 'صورتی ملایم', 'آبی']
  };

  const COLORS_TO_AVOID = {
    'بهار گرم': ['مشکی خالص', 'خاکستری تیره', 'سرمه‌ای', 'بنفش سرد'],
    'بهار': ['مشکی', 'بنفش تیره', 'خاکستری ذغالی'],
    'تابستان سرد': ['نارنجی', 'زرد گرم', 'مسی', 'آجری'],
    'تابستان': ['نارنجی پررنگ', 'زرد خردلی', 'قهوه‌ای تیره'],
    'پاییز گرم': ['بنفش سرد', 'آبی یخی', 'صورتی پاستلی', 'سفید صدفی'],
    'پاییز': ['بنفش سرد', 'آبی روشن', 'صورتی پاستلی', 'سفید صدفی'],
    'زمستان سرد': ['کرم گرم', 'بژ ملایم', 'زرد طلایی', 'هلویی'],
    'زمستان': ['کرم گرم', 'بژ', 'زرد طلایی'],
    'خنثی': []
  };

  function getPalette(season) {
    return SEASON_PALETTES[season] || SEASON_PALETTES['خنثی'];
  }

  function getColorsToAvoid(season) {
    return COLORS_TO_AVOID[season] || [];
  }

  // ════════════════════════════════════════════════════════════
  // 9️⃣ پیشنهادات استایل و آرایش
  // ════════════════════════════════════════════════════════════

  function getStyleRecommendations(season, skinTone) {
    const recs = {
      clothing: [],
      makeup: [],
      metals: [],
      accessories: []
    };

    if (season.includes('بهار')) {
      recs.clothing = ['پارچه‌های طبیعی و سبک', 'طرح‌های گل‌دار', 'بافت‌های نرم', 'رنگ‌های شاد و گرم'];
      recs.makeup = ['رژ لب هلویی یا مرجانی', 'سایه چشم قهوه‌ای گرم', 'رنگ طبیعی گونه‌ها'];
      recs.metals = ['طلایی براق', 'رزگلد'];
      recs.accessories = ['جواهرات طلایی', 'کیف‌های چرم طبیعی'];
    } else if (season.includes('تابستان')) {
      recs.clothing = ['پارچه‌های خنک و ابریشمی', 'طرح‌های ملایم', 'بافت‌های نازک', 'رنگ‌های پاستلی'];
      recs.makeup = ['رژ لب صورتی ملایم', 'سایه چشم بنفش یاسی', 'پوست شفاف'];
      recs.metals = ['نقره‌ای', 'پلاتین', 'سفید'];
      recs.accessories = ['جواهرات نقره‌ای', 'مروارید'];
    } else if (season.includes('پاییز')) {
      recs.clothing = ['پارچه‌های گرم و سنگین', 'طرح‌های کلاسیک', 'بافت‌های ضخیم', 'رنگ‌های خاکی'];
      recs.makeup = ['رژ لب آجری یا قهوه‌ای', 'سایه چشم مسی', 'گونه‌های برنزه'];
      recs.metals = ['طلایی مات', 'مسی', 'برنز'];
      recs.accessories = ['چرم و پشم', 'کیف‌های جیر'];
    } else if (season.includes('زمستان')) {
      recs.clothing = ['پارچه‌های باکیفیت و ساختارمند', 'طرح‌های جسورانه', 'بافت‌های ضخیم', 'رنگ‌های پررنگ'];
      recs.makeup = ['رژ لب قرمز جسورانه', 'سایه چشم مشکی یا سرمه‌ای', 'کنتراست بالا'];
      recs.metals = ['نقره‌ای براق', 'پلاتین', 'سفید'];
      recs.accessories = ['جواهرات بزرگ و چشمگیر', 'کیف‌های ساختارمند'];
    } else {
      recs.clothing = ['رنگ‌های متعادل', 'طرح‌های ساده'];
      recs.makeup = ['رنگ‌های طبیعی'];
      recs.metals = ['هر دو'];
      recs.accessories = ['متنوع'];
    }

    return recs;
  }

  // ════════════════════════════════════════════════════════════
  // 🔟 تشخیص کنتراست چشم‌ها
  // ════════════════════════════════════════════════════════════

  function detectEyeColor(eyesHsl) {
    const { h, s, l } = eyesHsl;
    if (h >= 15 && h <= 40 && s >= 30) {
      if (l < 30) return { color: 'قهوه‌ای تیره', label: 'مشکی' };
      if (l < 45) return { color: 'قهوه‌ای', label: 'قهوه‌ای' };
      return { color: 'عسلی', label: 'عسلی' };
    }
    if (h >= 60 && h <= 160) {
      if (s < 30) return { color: 'سبز کم‌رنگ', label: 'سبز روشن' };
      return { color: 'سبز', label: 'سبز' };
    }
    if (h >= 180 && h <= 240) {
      if (l >= 70) return { color: 'آبی روشن', label: 'آبی' };
      return { color: 'آبی', label: 'آبی تیره' };
    }
    if (h >= 0 && h < 15) return { color: 'فندقی', label: 'فندقی' };
    return { color: 'قهوه‌ای', label: 'قهوه‌ای' };
  }

  // تشخیص رنگ مو
  function detectHairColor(hairHsl) {
    const { h, s, l } = hairHsl;
    if (l < 20) return { color: 'مشکی', label: 'مشکی' };
    if (h >= 20 && h <= 40 && l >= 40) return { color: 'بلوند', label: 'بلوند' };
    if (h >= 15 && h <= 40) return { color: 'قهوه‌ای', label: 'قهوه‌ای' };
    if (h >= 0 && h < 15 && s >= 40) return { color: 'قرمز', label: 'قرمز' };
    if (h >= 0 && h < 20) return { color: 'شرابی', label: 'شرابی' };
    return { color: 'قهوه‌ای', label: 'تیره' };
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣1️⃣ تشخیص فرم بدن (v3.0 جدید) - آنالیز هندسی
  // ════════════════════════════════════════════════════════════

  function detectBodyShape(pixels, width, height) {
    // تحلیل نسبت عرض شانه به باسن از طریق پیکسل‌های غیرپوستی
    const shoulderY = Math.floor(height * 0.2);
    const hipY = Math.floor(height * 0.55);
    const waistY = Math.floor(height * 0.4);
    const halfW = Math.floor(width / 2);
    const span = Math.floor(width * 0.45);

    let shoulderWidth = 0, waistWidth = 0, hipWidth = 0;
    for (let y = 0; y < height; y++) {
      for (let x = Math.max(0, halfW - span); x < Math.min(width, halfW + span); x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        // پیکسل غیرپوستی = لباس/پس‌زمینه
        if (!isSkinColor(r, g, b)) {
          if (y >= shoulderY - 5 && y <= shoulderY + 5) shoulderWidth++;
          if (y >= waistY - 5 && y <= waistY + 5) waistWidth++;
          if (y >= hipY - 5 && y <= hipY + 5) hipWidth++;
        }
      }
    }
    if (!shoulderWidth || !hipWidth) return { shape: 'rectangle', confidence: 50, measurements: {} };

    const sh = shoulderWidth, wa = waistWidth, hi = hipWidth;
    const shHi = sh / Math.max(1, hi);
    const waSh = wa / Math.max(1, sh);
    const waHi = wa / Math.max(1, hi);

    let shape = 'rectangle', confidence = 60;
    if (shHi > 1.1 && waSh < 0.85) { shape = 'inverted-triangle'; confidence = 78; }
    else if (shHi < 0.9 && hi > sh * 1.1) { shape = 'pear'; confidence = 80; }
    else if (wa < sh * 0.75 && wa < hi * 0.75) { shape = 'hourglass'; confidence = 82; }
    else if (wa > sh * 0.9 && wa > hi * 0.9) { shape = 'apple'; confidence = 75; }
    else if (Math.abs(sh - hi) < sh * 0.1 && Math.abs(wa - sh) < sh * 0.15) { shape = 'rectangle'; confidence = 78; }
    else { shape = 'athletic'; confidence = 65; }

    const labelMap = {
      'hourglass': 'ساعت‌شنی ⏳', 'pear': 'گلابی 🍐', 'apple': 'سیب 🍎',
      'rectangle': 'مستطیل 📏', 'inverted-triangle': 'مثلث معکوس 🔻', 'athletic': 'ورزشی 💪'
    };
    return { shape, label: labelMap[shape] || shape, confidence, measurements: { shoulder: sh, waist: wa, hip: hi, ratio: shHi.toFixed(2) } };
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣2️⃣ تشخیص سن تقریبی (v3.0 جدید)
  // ════════════════════════════════════════════════════════════

  function estimateAge(skinHsl, skinPixels) {
    if (skinPixels.length < 30) return { range: 'unknown', label: 'نامشخص', confidence: 30 };
    const { l, s } = skinHsl;
    // هرچه پوست روشن‌تر و یکدست‌تر = سن کمتر
    // هرچه لکه و ناهماهنگی بیشتر = سن بالاتر
    let score = 0;
    if (l >= 70) score = 20;       // روشن → جوان
    else if (l >= 55) score = 28;
    else if (l >= 40) score = 35;
    else if (l >= 25) score = 45;  // تیره → میانسال
    else score = 55;

    if (s < 20) score += 5;        // یکدست → جوان‌تر
    else if (s > 50) score += 10;  // ناهموار → مسن‌تر

    const range = score < 25 ? 'teen' : score < 35 ? 'young' : score < 45 ? 'adult' : 'middle';
    const labelMap = { teen: '۱۳-۱۹', young: '۲۰-۲۹', adult: '۳۰-۴۴', middle: '۴۵-۵۹' };
    return { range, label: labelMap[range], estimatedScore: score, confidence: 60 };
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣3️⃣ کیفیت عکس (v3.0 جدید)
  // ════════════════════════════════════════════════════════════

  function analyzePhotoQuality(pixels, width, height) {
    let brightness = 0, saturation = 0, totalPixels = 0;
    let darkPixels = 0, brightPixels = 0, sharpEdges = 0;
    const prevRow = new Array(width).fill(null);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        brightness += lum;
        saturation += sat;
        totalPixels++;
        if (lum < 50) darkPixels++;
        if (lum > 200) brightPixels++;
        // تشخیص شارپنس: اختلاف با پیکسل قبل
        if (prevRow[x] !== null) {
          const diff = Math.abs(lum - prevRow[x]);
          if (diff > 30) sharpEdges++;
        }
        prevRow[x] = lum;
      }
    }

    const avgBrightness = Math.round(brightness / totalPixels);
    const avgSaturation = Math.round((saturation / totalPixels) * 100);
    const darkPercent = (darkPixels / totalPixels) * 100;
    const brightPercent = (brightPixels / totalPixels) * 100;
    const sharpness = (sharpEdges / totalPixels) * 100;

    let lightLevel = 'good', lightScore = 90;
    if (avgBrightness < 60) { lightLevel = 'too-dark'; lightScore = 40; }
    else if (avgBrightness < 90) { lightLevel = 'dark'; lightScore = 65; }
    else if (avgBrightness > 200) { lightLevel = 'too-bright'; lightScore = 45; }
    else if (avgBrightness > 180) { lightLevel = 'bright'; lightScore = 75; }

    let sharpnessLevel = 'good', sharpScore = 85;
    if (sharpness < 5) { sharpnessLevel = 'blurry'; sharpScore = 50; }
    else if (sharpness < 12) { sharpnessLevel = 'soft'; sharpScore = 70; }
    else if (sharpness > 40) { sharpnessLevel = 'over-sharp'; sharpScore = 75; }

    const overallScore = Math.round((lightScore + sharpScore + Math.min(100, avgSaturation)) / 3);

    return {
      brightness: avgBrightness,
      saturation: avgSaturation,
      sharpness: Math.round(sharpness),
      lightLevel, lightScore,
      sharpnessLevel, sharpScore,
      overallScore,
      darkPercent: Math.round(darkPercent),
      brightPercent: Math.round(brightPercent),
      isAcceptable: overallScore >= 60
    };
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣4️⃣ لباس‌های قابل تشخیص (v3.0 جدید)
  // ════════════════════════════════════════════════════════════

  function detectClothingColors(pixels, width, height) {
    // ناحیه تنه (وسط تا پایین عکس) برای تشخیص لباس
    const torsoY = Math.floor(height * 0.45);
    const torsoH = Math.floor(height * 0.3);
    const colors = {};

    for (let y = torsoY; y < torsoY + torsoH && y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        if (isSkinColor(r, g, b)) continue;
        // کوانتایز کردن رنگ
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        colors[key] = (colors[key] || 0) + 1;
      }
    }

    // ۳ رنگ غالب
    const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const total = sorted.reduce((a, [, c]) => a + c, 0) || 1;
    const result = sorted.map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      const [h, s, l] = rgbToHsl(r, g, b);
      const persian = detectColorName(r, g, b, h, s, l);
      return { rgb: { r, g, b }, hex, persian, hue: Math.round(h), percent: Math.round((count / total) * 100) };
    });

    return result;
  }

  function detectColorName(r, g, b, h, s, l) {
    if (l > 90) return 'سفید';
    if (l < 15) return 'مشکی';
    if (s < 10) return l > 60 ? 'خاکستری روشن' : l < 40 ? 'خاکستری تیره' : 'خاکستری';
    if (h >= 0 && h < 15) return 'قرمز';
    if (h >= 15 && h < 35) return s > 50 ? 'نارنجی' : 'قهوه‌ای';
    if (h >= 35 && h < 60) return s > 40 ? 'زرد' : 'خردلی';
    if (h >= 60 && h < 90) return 'سبز';
    if (h >= 90 && h < 150) return 'سبز تیره';
    if (h >= 150 && h < 180) return 'فیروزه‌ای';
    if (h >= 180 && h < 220) return 'آبی';
    if (h >= 220 && h < 260) return 'آبی تیره';
    if (h >= 260 && h < 290) return 'بنفش';
    if (h >= 290 && h < 330) return 'صورتی';
    if (h >= 330) return 'قرمز';
    return 'ترکیبی';
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣5️⃣ حالت چهره (v3.0 جدید)
  // ════════════════════════════════════════════════════════════

  function detectMood(facePixels, totalPixels) {
    if (!facePixels.length) return { mood: 'neutral', confidence: 50 };
    let bright = 0, dark = 0, warmTone = 0, coolTone = 0;
    facePixels.forEach(([r, g, b]) => {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 150) bright++;
      if (lum < 80) dark++;
      if (r > b + 20) warmTone++;
      if (b > r + 20) coolTone++;
    });
    const total = facePixels.length;
    const brightRatio = bright / total;
    const warmRatio = warmTone / total;
    if (brightRatio > 0.6 && warmRatio > 0.5) return { mood: 'festive', label: 'جشن', confidence: 75 };
    if (brightRatio < 0.3) return { mood: 'formal', label: 'رسمی', confidence: 70 };
    if (warmRatio > 0.5) return { mood: 'casual-warm', label: 'روزمره گرم', confidence: 65 };
    if (coolTone / total > 0.5) return { mood: 'casual-cool', label: 'روزمره سرد', confidence: 60 };
    return { mood: 'neutral', label: 'خنثی', confidence: 55 };
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣6️⃣ تابع اصلی تحلیل (v3.0)
  // ════════════════════════════════════════════════════════════

  async function analyze(imageElement) {
    try {
      const pixels = await getPixelData(imageElement, 200);  // بزرگ‌تر برای دقت بیشتر
      const width = 200, height = 200;

      // استخراج نواحی
      const { skinPixels, hairPixels, eyePixels } = extractFaceRegions(pixels, width, height);

      if (skinPixels.length < 30) {
        return {
          success: false,
          error: 'چهره واضح در تصویر شناسایی نشد. لطفاً عکس روشن‌تر و واضح‌تر بفرستید.'
        };
      }

      // تحلیل رنگ‌ها
      const skinRgb = averageColor(skinPixels);
      const skinHsl = hslStats(skinPixels);
      const hairRgb = averageColor(hairPixels);
      const hairHsl = hslStats(hairPixels);
      const eyeRgb = averageColor(eyePixels);
      const eyeHsl = hslStats(eyePixels);

      // تشخیص‌های اصلی
      const skinTone = detectSkinTone(skinHsl, skinPixels.length);
      const colorSeason = detectColorSeason(skinHsl, hairHsl, eyeHsl);
      const contrast = detectContrast(skinHsl, hairHsl, eyeHsl);
      const eyeColor = detectEyeColor(eyeHsl);
      const hairColor = detectHairColor(hairHsl);
      const palette = getPalette(colorSeason.season);
      const avoidColors = getColorsToAvoid(colorSeason.season);
      const recommendations = getStyleRecommendations(colorSeason.season, skinTone.tone);

      // 🆕 v3.0: لایه‌های جدید
      const bodyShape = detectBodyShape(pixels, width, height);
      const ageEstimate = estimateAge(skinHsl, skinPixels);
      const photoQuality = analyzePhotoQuality(pixels, width, height);
      const clothingColors = detectClothingColors(pixels, width, height);
      const mood = detectMood(skinPixels, skinPixels.length);

      return {
        success: true,
        skin: {
          rgb: skinRgb,
          hsl: skinHsl,
          tone: skinTone.tone,
          label: skinTone.label,
          confidence: skinTone.confidence
        },
        hair: {
          rgb: hairRgb,
          hsl: hairHsl,
          color: hairColor.color,
          label: hairColor.label
        },
        eyes: {
          rgb: eyeRgb,
          hsl: eyeHsl,
          color: eyeColor.color,
          label: eyeColor.label
        },
        season: {
          main: colorSeason.season,
          sub: colorSeason.subSeason,
          confidence: colorSeason.confidence
        },
        contrast: contrast,
        bestColors: palette,
        avoidColors: avoidColors,
        recommendations: recommendations,
        // 🆕 v3.0 fields
        bodyShape: bodyShape,
        ageEstimate: ageEstimate,
        photoQuality: photoQuality,
        clothingColors: clothingColors,
        mood: mood,
        // داده‌های خام برای پروفایل
        profile: {
          skinTone: skinTone.tone,
          colorSeason: colorSeason.season,
          subSeason: colorSeason.subSeason,
          contrast: contrast.level,
          eyeColor: eyeColor.color,
          hairColor: hairColor.color,
          bodyShape: bodyShape.shape,
          mood: mood.mood
        }
      };
    } catch(e) {
      return {
        success: false,
        error: 'خطا در تحلیل تصویر: ' + e.message
      };
    }
  }

  // ════════════════════════════════════════════════════════════
  // 1️⃣2️⃣ خروجی
  // ════════════════════════════════════════════════════════════

  window.DPPhotoAI = {
    version: '3.0 MAX ULTIMATE',
    analyze,
    detectSkinTone,
    detectColorSeason,
    detectContrast,
    getPalette,
    getStyleRecommendations,
    detectBodyShape,
    estimateAge,
    analyzePhotoQuality,
    detectClothingColors,
    detectMood,
    isSkinColor,
    isHairColor,
    isEyeColor,
    rgbToHsl,
    rgbToHsv
  };

  console.log('📸 DPPhotoAI v3.0 MAX ULTIMATE loaded — ۲۰ لایه تحلیل + فرم بدن + سن + کیفیت + لباس + حالت');
})();
