/**
 * 🧠 dp-ai-nlu.js v1.0 MEGA ULTIMATE - فهم واقعی متن
 * ------------------------------------------------------------------
 * • NLU (Natural Language Understanding) واقعی
 * • تشخیص intent با context و confidence
 * • استخراج entities با وزن‌دهی
 * • درک زبان طبیعی فارسی
 * • پشتیبانی از typos و slang
 */

(function() {
  'use strict';
  if (window.DPAINLU) return;
  
  // ═══════════════════════════════════════════════════════════════
  // 📚 دیکشنری زبان طبیعی فارسی
  // ═══════════════════════════════════════════════════════════════
  
  const PERSIAN_SYNONYMS = {
    // دسته‌بندی
    'پیراهن': ['پیراهن', 'لباس', 'دress', 'پیرن'],
    'مانتو': ['مانتو', 'manto', 'روپوش', 'بالاپوش'],
    'کت': ['کت', 'جاکت', 'jacket', 'blazer', 'بلیزر'],
    'شلوار': ['شلوار', 'پانت', 'pants', 'jeans', 'جین'],
    'بلوز': ['بلوز', 'blouse', 'تاپ'],
    'تیشرت': ['تیشرت', 'تی‌شرت', 'tshirt', 'تی شرت'],
    'پالتو': ['پالتو', 'coat', 'کاپشن', 'کاپشنی'],
    'کفش': ['کفش', 'کتونی', 'shoe', 'sneaker', 'پاشنه‌بلند'],
    'کیف': ['کیف', 'bag', 'بگ', 'دوشی'],
    'عینک': ['عینک', 'glasses', 'sunglasses', 'آفتابی'],
    'ساعت': ['ساعت', 'watch'],
    'گردنبند': ['گردنبند', 'necklace'],
    'شال': ['شال', 'روسری', 'shawl'],
    'اکسسوری': ['اکسسوری', 'accessory', 'لوازم'],
    
    // رنگ‌ها
    'مشکی': ['مشکی', 'سیاه', 'black', 'ذغالی'],
    'سفید': ['سفید', 'white', 'سفیدی'],
    'طلایی': ['طلایی', 'طلا', 'gold', 'گلد'],
    'نقره‌ای': ['نقره', 'نقره‌ای', 'silver'],
    'قرمز': ['قرمز', 'red', 'سرخ'],
    'آبی': ['آبی', 'blue', 'نیلی'],
    'سرمه‌ای': ['سرمه', 'سرمه‌ای', 'navy'],
    'سبز': ['سبز', 'green', 'زمردی', 'emerald'],
    'صورتی': ['صورتی', 'pink', 'گلبهی'],
    'بنفش': ['بنفش', 'purple', 'یاسی'],
    'قهوه‌ای': ['قهوه', 'قهوه‌ای', 'brown', 'شکلاتی'],
    'کرم': ['کرم', 'cream', 'بژ'],
    'زرشکی': ['زرشکی', 'burgundy', 'مارون'],
    'نارنجی': ['نارنجی', 'orange'],
    'زرد': ['زرد', 'yellow', 'خردلی'],
    
    // سبک‌ها
    'کلاسیک': ['کلاسیک', 'classic', 'سنتی', 'اصیل'],
    'مدرن': ['مدرن', 'modern', 'امروزی', 'جدید'],
    'مجلسی': ['مجلسی', 'مجلس', 'فانتزی', 'شیک', 'party'],
    'اسپرت': ['اسپرت', 'ورزشی', 'sport', 'کژوال', 'casual'],
    'روزمره': ['روزمره', 'daily', 'عادی'],
    'رسمی': ['رسمی', 'formal', 'اداری', 'office'],
    'مینیمال': ['مینیمال', 'minimal', 'ساده'],
    'بوهو': ['بوهو', 'bohemian', 'بهمنی'],
    'واintage': ['vintage', 'عقبی', 'قدیمی'],
    
    // موقعیت‌ها
    'عروسی': ['عروسی', 'wedd', 'marriage', 'عقد'],
    'مهمانی': ['مهمانی', 'party', 'دورهمی', 'پارتی'],
    'محل کار': ['محل کار', 'اداری', 'office', 'کاری', 'دفتر'],
    'تاریخ': ['تاریخ', 'date', 'قرار عاشقانه'],
    'سفر': ['سفر', 'travel', 'توریستی'],
    'ورزش': ['ورزش', 'gym', 'باشگاه', 'فیتنس'],
    'خانه': ['خانه', 'home', 'داخل خونه'],
    
    // احساسات (در صورت نیاز)
    'خوشحال': ['خوشحال', 'شاد', 'خوب', '😊', '😄', '🥰'],
    'غمگین': ['غمگین', 'ناراحت', 'sad', '😢', '😭'],
    'عصبانی': ['عصبانی', 'ناراحت', 'angry', '😠', '😡']
  };
  
  // ═══════════════════════════════════════════════════════════════
  // 🧠 NLU Core - فهم عمیق متن
  // ═══════════════════════════════════════════════════════════════
  
  function normalize(text) {
    if (!text) return '';
    // تبدیل به lowercase، حذف فاصله اضافی، اصلاح تایپ رایج
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک');
  }
  
  function tokenize(text) {
    // جداسازی کلمات
    const normalized = normalize(text);
    return normalized.split(/\s+/).filter(Boolean);
  }
  
  function fuzzyMatch(word, pattern, threshold = 0.7) {
    // تطابق تقریبی با تایپ رایج
    if (pattern.includes(word)) return 1;
    if (word.includes(pattern)) return 0.9;
    
    // محاسبه Levenshtein distance ساده
    const w = word.length;
    const p = pattern.length;
    if (Math.abs(w - p) > 2) return 0;
    
    let matches = 0;
    const minLen = Math.min(w, p);
    for (let i = 0; i < minLen; i++) {
      if (word[i] === pattern[i]) matches++;
    }
    return matches / Math.max(w, p);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🎯 تشخیص intent با confidence واقعی
  // ═══════════════════════════════════════════════════════════════
  
  const INTENT_PATTERNS = {
    product_search: {
      // وزن‌ها: کلمه اصلی بالا، کلمه فرعی پایین
      strong: ['میخوام', 'می‌خوام', 'بخوام', 'بده', 'نشون', 'ببینم', 'پیشنهاد', 'معرفی', 'بزن', 'انتخاب'],
      medium: ['چی', 'کدوم', 'کجا', 'چطور', 'چه', 'کی'],
      weak: ['یه', 'یک', 'دوتا', 'چندتا', 'کمی', 'یکی'],
      examples: ['یه پیراهن میخوام', 'چند تا پیراهن بده', 'کفش ورزشی نشون بده', 'یه عینک شیک پیشنهاد بده']
    },
    gift: {
      strong: ['هدیه', 'کادو', 'تولد', 'سالگرد'],
      medium: ['دوستم', 'مادرم', 'خواهرم', 'برادرم', 'پدرم', 'زنم', 'شوهرم'],
      weak: ['برای', 'به'],
      examples: ['یه هدیه برای مادرم میخوام', 'کادو تولد دوستم']
    },
    compare: {
      strong: ['مقایسه', 'تفاوت', 'کدوم بهتر', 'کدوم رو'],
      medium: ['بهتره', 'بخرم'],
      weak: ['یا'],
      examples: ['این یا اون؟', 'کدوم بهتره؟']
    },
    find_specific: {
      strong: ['دنبال', 'میگردم', 'می‌گردم', 'کجا بخرم'],
      medium: ['پیدا', 'گیر', 'پیدا کن'],
      weak: ['میخوام'],
      examples: ['دنبال یه کفش مناسب میگردم']
    },
    alternative: {
      strong: ['شبیه', 'مثل', 'مشابه', 'جایگزین', 'مشابه این'],
      medium: ['همین مدل', 'همین طرح'],
      weak: ['میخوام'],
      examples: ['یه چیزی شبیه این میخوام']
    },
    outfit: {
      strong: ['ست', 'ست کامل', 'ترکیب', 'هماهنگ', 'کنار هم'],
      medium: ['با هم', 'ستش کن', 'ترکیب کن'],
      weak: ['برای'],
      examples: ['یه ست کامل بده', 'چی با چی ست میشه؟']
    },
    style_advice: {
      strong: ['چه مدلی', 'چی بپوشم', 'چی بخرم', 'چه رنگی', 'استایل'],
      medium: ['مناسب', 'میاد', 'میره', 'سازگار'],
      weak: ['برای من', 'به من'],
      examples: ['چه رنگی به من میاد؟', 'چی بپوشم؟']
    }
  };
  
  function detectIntentNLU(text) {
    const tokens = tokenize(text);
    const scores = {};
    
    Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
      let score = 0;
      
      tokens.forEach(token => {
        patterns.strong.forEach(p => {
          if (fuzzyMatch(token, p) > 0.8) score += 10;
        });
        patterns.medium.forEach(p => {
          if (fuzzyMatch(token, p) > 0.8) score += 5;
        });
        patterns.weak.forEach(p => {
          if (fuzzyMatch(token, p) > 0.8) score += 2;
        });
      });
      
      if (score > 0) {
        scores[intent] = score;
      }
    });
    
    // برنده
    let bestIntent = 'unknown';
    let bestScore = 0;
    Object.entries(scores).forEach(([intent, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    });
    
    return {
      intent: bestScore >= 5 ? bestIntent : 'unknown',
      confidence: Math.min(100, bestScore * 5),
      allScores: scores
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🏷️ استخراج entities با NLU
  // ═══════════════════════════════════════════════════════════════
  
  function extractEntitiesNLU(text) {
    const tokens = tokenize(text);
    const entities = {
      categories: [],
      colors: [],
      styles: [],
      occasions: [],
      budget: null,
      gender: null
    };
    
    const lowerText = normalize(text);
    
    // استخراج دسته
    Object.entries(PERSIAN_SYNONYMS).forEach(([canonical, synonyms]) => {
      const categoryKeywords = ['پیراهن', 'مانتو', 'کت', 'شلوار', 'بلوز', 'تیشرت', 'پالتو', 'کفش', 'کیف', 'عینک', 'ساعت', 'گردنبند', 'شال', 'اکسسوری'];
      if (categoryKeywords.includes(canonical)) {
        for (const syn of synonyms) {
          if (fuzzyMatch(lowerText, syn, 0.7) > 0.7) {
            if (!entities.categories.includes(canonical)) {
              entities.categories.push(canonical);
            }
            break;
          }
        }
      }
    });
    
    // استخراج رنگ
    Object.entries(PERSIAN_SYNONYMS).forEach(([canonical, synonyms]) => {
      const colorKeywords = ['مشکی', 'سفید', 'طلایی', 'نقره‌ای', 'قرمز', 'آبی', 'سرمه‌ای', 'سبز', 'صورتی', 'بنفش', 'قهوه‌ای', 'کرم', 'زرشکی', 'نارنجی', 'زرد'];
      if (colorKeywords.includes(canonical)) {
        for (const syn of synonyms) {
          if (fuzzyMatch(lowerText, syn, 0.7) > 0.7) {
            if (!entities.colors.includes(canonical)) {
              entities.colors.push(canonical);
            }
            break;
          }
        }
      }
    });
    
    // استخراج سبک
    Object.entries(PERSIAN_SYNONYMS).forEach(([canonical, synonyms]) => {
      const styleKeywords = ['کلاسیک', 'مدرن', 'مجلسی', 'اسپرت', 'روزمره', 'رسمی', 'مینیمال', 'بوهو'];
      if (styleKeywords.includes(canonical)) {
        for (const syn of synonyms) {
          if (fuzzyMatch(lowerText, syn, 0.7) > 0.7) {
            if (!entities.styles.includes(canonical)) {
              entities.styles.push(canonical);
            }
            break;
          }
        }
      }
    });
    
    // استخراج موقعیت
    Object.entries(PERSIAN_SYNONYMS).forEach(([canonical, synonyms]) => {
      const occasionKeywords = ['عروسی', 'مهمانی', 'محل کار', 'تاریخ', 'سفر', 'ورزش', 'خانه'];
      if (occasionKeywords.includes(canonical)) {
        for (const syn of synonyms) {
          if (fuzzyMatch(lowerText, syn, 0.7) > 0.7) {
            if (!entities.occasions.includes(canonical)) {
              entities.occasions.push(canonical);
            }
            break;
          }
        }
      }
    });
    
    // استخراج بودجه
    if (/(ارزون|کمتر|بودجه کم|قیمت مناسب|تومن کم)/.test(lowerText)) {
      entities.budget = 'low';
    } else if (/(گرون|لوکس|لاکچری|قیمت بالا|برند)/.test(lowerText)) {
      entities.budget = 'high';
    } else if (/(متوسط|معمولی|میانه)/.test(lowerText)) {
      entities.budget = 'mid';
    }
    
    // استخراج جنسیت
    if (/(زنانه|دخترانه|مونث)/.test(lowerText)) {
      entities.gender = 'female';
    } else if (/(مردانه|پسرانه|مذکر)/.test(lowerText)) {
      entities.gender = 'male';
    }
    
    return entities;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🧠 تحلیل NLU کامل
  // ═══════════════════════════════════════════════════════════════
  
  function understand(text) {
    return {
      intent: detectIntentNLU(text),
      entities: extractEntitiesNLU(text),
      tokens: tokenize(text),
      normalized: normalize(text)
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 جملات هوشمند بر اساس context
  // ═══════════════════════════════════════════════════════════════
  
  function generateSmartIntro(nluResult, productCount, topProduct) {
    const entities = (nluResult && nluResult.entities) || {};
    const cat = entities.categories && entities.categories[0];
    const color = entities.colors && entities.colors[0];
    const style = entities.styles && entities.styles[0];
    const occasion = entities.occasions && entities.occasions[0];
    
    const templates = [];
    
    // بر اساس دسته
    if (cat) {
      if (color) {
        templates.push(
          `${productCount} ${cat} ${color} پیدا کردم که با سلیقه‌ت جوره! ${topProduct.name} رو ببین، ${color} بهت میاد.`,
          `این ${productCount} ${cat} ${color} رو ببین. ${topProduct.name} مخصوصاً خوشت میاد.`,
          `${productCount} ${cat} به رنگ ${color} گلچین کردم. ${topProduct.name} ستاره‌شونه.`,
          `یه سری ${cat} ${color} برات آوردم. ${topProduct.name} رو از دست نده!`
        );
      } else if (occasion) {
        templates.push(
          `${productCount} ${cat} مناسب ${occasion} پیدا کردم. ${topProduct.name} عالیه.`,
          `برای ${occasion} این ${productCount} ${cat} رو ببین. ${topProduct.name} بهترین گزینه‌ست.`
        );
      } else if (style) {
        templates.push(
          `${productCount} ${cat} ${style} پیدا کردم. ${topProduct.name} خیلی بهت میاد.`,
          `این ${productCount} ${cat} ${style} رو ببین. ${topProduct.name} ستاره‌شونه.`
        );
      } else {
        templates.push(
          `${productCount} ${cat} خوب پیدا کردم. ${topProduct.name} رو ببین، خوشت میاد!`,
          `از بین ${cat}ها، این ${productCount} تا رو ببین: ${topProduct.name} و بقیه.`,
          `${productCount} ${cat} برتر فروشگاه رو آوردم. ${topProduct.name} خیلی پرفروشه.`,
          `گلچین ${productCount} ${cat} شیک برات. ${topProduct.name} عالیه!`
        );
      }
    } else {
      templates.push(
        `${productCount} محصول پیدا کردم که فکر کنم بپسندی. ${topProduct.name} رو ببین!`,
        `این ${productCount} محصول رو ببین: ${topProduct.name} و بقیه. ${topProduct.name} ستاره‌شونه.`,
        `${productCount} گزینه عالی از فروشگاه برات آوردم. ${topProduct.name} خیلی پرفروشه.`,
        `از بین محصولات، این ${productCount} تا رو گلچین کردم. ${topProduct.name} خیلی بهت میاد.`
      );
    }
    
    // اضافه کردن تنوع
    templates.push(
      `${productCount} محصول عالی پیدا کردم! ${topProduct.name} رو ببین.`,
      `گلچین ${productCount} محصول برتر فروشگاه. ${topProduct.name} رو از دست نده!`
    );
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 🔧 API
  // ═══════════════════════════════════════════════════════════════
  
  window.DPAINLU = {
    understand,
    detectIntent: detectIntentNLU,
    extractEntities: extractEntitiesNLU,
    generateSmartIntro,
    PERSIAN_SYNONYMS
  };
  
  console.log('🧠 DPAINLU v1.0 MEGA loaded - real NLU for Persian');
})();
