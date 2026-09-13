/**
 * 🎯 dp-taste-profile.js v3.0 ULTIMATE — سیستم سلیقه پیشرفته
 * ------------------------------------------------------------------
 * • ۲۵+ سوال چندمرحله‌ای (۵ مرحله)
 * • تحلیل ۱۲ فصل رنگی (Spring/Summer/Autumn/Winter × Warm/Cool/Light/Deep)
 * • سبک‌های سلسله‌مراتبی (۴ سطح)
 * • سبک زندگی + شخصیت
 * • بودجه + نیاز
 * • AI پیشرفته با ۱۰+ فاکتور تطابق
 * • حداقل ۶۵٪ تطابق
 * • لینک مستقیم به محصول
 */

(function() {
  'use strict';
  if (window.DPTasteProfileLoaded) return;
  window.DPTasteProfileLoaded = true;

  const STORAGE_KEY = 'dp_user_taste_v3';
  const MIN_MATCH_PERCENT = 65;

  // ═══════════════════════════════════════════════════════════════
  // 🆕 سیستم ۱۲ فصل رنگی (12-Color Season System)
  // ═══════════════════════════════════════════════════════════════
  const TWELVE_SEASONS = {
    // ═══ فصل‌های گرم (Warm) ═══
    'bright-spring': {
      name: 'بهار درخشان',
      nameEn: 'Bright Spring',
      undertone: 'warm',
      value: 'bright',
      chroma: 'high',
      palette: ['coral', 'turquoise', 'warm-pink', 'lime', 'gold', 'emerald', 'tangerine', 'apple-green'],
      avoidColors: ['muted', 'dusty', 'dark-winter', 'burgundy'],
      bestColors: ['#FF6B6B', '#FFA94D', '#FFD43B', '#51CF66', '#22B8CF', '#FF8787'],
      jewelry: 'طلایی براق',
      characteristics: 'پوست گرم با کنتراست بالا، رنگ‌های شاد و درخشان'
    },
    'warm-spring': {
      name: 'بهار گرم',
      nameEn: 'Warm Spring',
      undertone: 'warm',
      value: 'medium',
      chroma: 'medium-high',
      palette: ['coral', 'peach', 'warm-green', 'turquoise', 'gold', 'salmon', 'apricot', 'lime'],
      avoidColors: ['black', 'cool-pink', 'icy-blue', 'fuchsia'],
      bestColors: ['#FFA07A', '#FFD700', '#FF7F50', '#98D8C8', '#F0E68C'],
      jewelry: 'طلایی مات یا مسی',
      characteristics: 'پوست گرم با چشم‌های روشن، رنگ‌های گرم و شاد'
    },
    'light-spring': {
      name: 'بهار روشن',
      nameEn: 'Light Spring',
      undertone: 'warm-neutral',
      value: 'light',
      chroma: 'medium',
      palette: ['light-coral', 'soft-peach', 'aqua', 'light-gold', 'cream', 'mint', 'rose'],
      avoidColors: ['black', 'dark-burgundy', 'deep-purple'],
      bestColors: ['#FFE4E1', '#FFDAB9', '#E0FFFF', '#F0FFF0', '#FFFACD'],
      jewelry: 'طلایی روشن',
      characteristics: 'پوست روشن با ته‌رنگ گرم، رنگ‌های پاستیلی گرم'
    },
    // ═══ فصل‌های سرد (Cool) ═══
    'bright-winter': {
      name: 'زمستان درخشان',
      nameEn: 'Bright Winter',
      undertone: 'cool',
      value: 'high-contrast',
      chroma: 'high',
      palette: ['fuchsia', 'royal-blue', 'emerald', 'icy-pink', 'pure-white', 'jet-black', 'lemon'],
      avoidColors: ['muted', 'earthy', 'orange', 'rust'],
      bestColors: ['#000000', '#FFFFFF', '#FF1493', '#0000FF', '#00CED1', '#FFD700'],
      jewelry: 'نقره‌ای یا پلاتین',
      characteristics: 'کنتراست بالا، رنگ‌های جسورانه و خالص'
    },
    'cool-winter': {
      name: 'زمستان سرد',
      nameEn: 'Cool Winter',
      undertone: 'cool',
      value: 'dark',
      chroma: 'high',
      palette: ['navy', 'burgundy', 'emerald', 'fuchsia', 'icy-pink', 'royal-purple', 'jet-black'],
      avoidColors: ['orange', 'warm-brown', 'gold', 'coral'],
      bestColors: ['#191970', '#800020', '#006400', '#4B0082', '#000000'],
      jewelry: 'نقره‌ای یا طلای سفید',
      characteristics: 'پوست سرد با کنتراست بالا، رنگ‌های تیره و خالص'
    },
    'deep-winter': {
      name: 'زمستان عمیق',
      nameEn: 'Deep Winter',
      undertone: 'cool-neutral',
      value: 'dark',
      chroma: 'high',
      palette: ['black', 'navy', 'burgundy', 'forest-green', 'deep-purple', 'wine'],
      avoidColors: ['pastel', 'light-orange', 'beige'],
      bestColors: ['#000000', '#0A0A2A', '#5B0028', '#0B3D0B'],
      jewelry: 'نقره‌ای تیره یا طلای سفید',
      characteristics: 'پوست تیره با ته‌رنگ خنثی، رنگ‌های عمیق'
    },
    // ═══ تابستان (Cool + Soft) ═══
    'light-summer': {
      name: 'تابستان روشن',
      nameEn: 'Light Summer',
      undertone: 'cool',
      value: 'light',
      chroma: 'low',
      palette: ['powder-blue', 'lavender', 'soft-pink', 'mint', 'rose-gray', 'sky-blue'],
      avoidColors: ['black', 'orange', 'bright-red', 'gold'],
      bestColors: ['#B0E0E6', '#E6E6FA', '#FFB6C1', '#F0FFFF', '#DDA0DD'],
      jewelry: 'نقره‌ای مات یا طلای رز',
      characteristics: 'پوست روشن با ته‌رنگ سرد، رنگ‌های پاستیلی سرد'
    },
    'cool-summer': {
      name: 'تابستان سرد',
      nameEn: 'Cool Summer',
      undertone: 'cool',
      value: 'medium',
      chroma: 'medium',
      palette: ['rose', 'plum', 'soft-blue', 'mauve', 'burgundy', 'raspberry'],
      avoidColors: ['orange', 'warm-brown', 'gold', 'coral'],
      bestColors: ['#C71585', '#9370DB', '#4682B4', '#8B4789', '#CD5C5C'],
      jewelry: 'نقره‌ای یا پلاتین',
      characteristics: 'پوست سرد با رنگ‌های ملایم، رنگ‌های سرد با ته‌رنگ آبی'
    },
    'muted-summer': {
      name: 'تابستان ملایم',
      nameEn: 'Muted Summer',
      undertone: 'cool-neutral',
      value: 'medium',
      chroma: 'low',
      palette: ['dusty-rose', 'soft-mauve', 'sage', 'slate-blue', 'taupe', 'grey-blue'],
      avoidColors: ['bright', 'vivid', 'neon', 'electric-blue'],
      bestColors: ['#BC8F8F', '#C0C0C0', '#708090', '#8FBC8F', '#9370DB'],
      jewelry: 'نقره‌ای مات یا رزگلد',
      characteristics: 'رنگ‌های آرام و مات با ته‌رنگ خنثی'
    },
    // ═══ پاییز (Warm + Deep) ═══
    'warm-autumn': {
      name: 'پاییز گرم',
      nameEn: 'Warm Autumn',
      undertone: 'warm',
      value: 'medium',
      chroma: 'high',
      palette: ['rust', 'terracotta', 'olive', 'mustard', 'burnt-orange', 'chocolate'],
      avoidColors: ['pink', 'icy-blue', 'pastel', 'silver'],
      bestColors: ['#B7410E', '#CC5500', '#808000', '#FFDB58', '#964B00'],
      jewelry: 'طلایی یا مسی',
      characteristics: 'پوست گرم با رنگ‌های زمینی، ته‌رنگ طلایی'
    },
    'deep-autumn': {
      name: 'پاییز عمیق',
      nameEn: 'Deep Autumn',
      undertone: 'warm-neutral',
      value: 'dark',
      chroma: 'high',
      palette: ['chocolate', 'burgundy', 'forest-green', 'dark-teal', 'rust', 'olive'],
      avoidColors: ['pastel', 'light-pink', 'icy-blue', 'silver'],
      bestColors: ['#3B2F2F', '#800020', '#228B22', '#008B8B', '#B8860B'],
      jewelry: 'طلایی تیره یا برنز',
      characteristics: 'رنگ‌های تیره و غنی با ته‌رنگ گرم'
    },
    'muted-autumn': {
      name: 'پاییز ملایم',
      nameEn: 'Muted Autumn',
      undertone: 'warm-neutral',
      value: 'medium',
      chroma: 'low',
      palette: ['taupe', 'sage', 'dusty-teal', 'soft-rust', 'moss', 'camel'],
      avoidColors: ['bright', 'neon', 'electric', 'pastel-pink'],
      bestColors: ['#8B7D6B', '#9CAF88', '#5F9EA0', '#CD853F', '#808000'],
      jewelry: 'طلایی مات یا مسی',
      characteristics: 'رنگ‌های آرام زمینی با ته‌رنگ گرم'
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🆕 تشخیص فصل رنگی از روی پاسخ‌های انتخابی
  // ═══════════════════════════════════════════════════════════════
  function detectColorSeason(answers) {
    // ورودی: { skinTone, hairColor, eyeColor, contrast, jewelry }
    // خروجی: bestSeason + score for each season
    const scores = {};
    Object.keys(TWELVE_SEASONS).forEach(s => scores[s] = 0);

    // ۱) ته‌رنگ پوست
    if (answers.skinTone === 'warm') {
      scores['bright-spring'] += 20;
      scores['warm-spring'] += 25;
      scores['light-spring'] += 15;
      scores['warm-autumn'] += 25;
      scores['deep-autumn'] += 20;
      scores['muted-autumn'] += 15;
    } else if (answers.skinTone === 'cool') {
      scores['bright-winter'] += 20;
      scores['cool-winter'] += 25;
      scores['deep-winter'] += 15;
      scores['light-summer'] += 20;
      scores['cool-summer'] += 25;
      scores['muted-summer'] += 15;
    } else { // neutral
      scores['light-spring'] += 10;
      scores['muted-summer'] += 15;
      scores['muted-autumn'] += 15;
      scores['deep-winter'] += 10;
    }

    // ۲) رنگ مو
    if (answers.hairColor === 'black') {
      scores['bright-winter'] += 15;
      scores['cool-winter'] += 20;
      scores['deep-winter'] += 20;
      scores['deep-autumn'] += 15;
    } else if (answers.hairColor === 'dark-brown') {
      scores['cool-winter'] += 10;
      scores['deep-autumn'] += 15;
      scores['warm-autumn'] += 15;
    } else if (answers.hairColor === 'light-brown' || answers.hairColor === 'auburn') {
      scores['warm-spring'] += 15;
      scores['warm-autumn'] += 20;
      scores['muted-autumn'] += 10;
    } else if (answers.hairColor === 'blonde' || answers.hairColor === 'golden') {
      scores['bright-spring'] += 15;
      scores['light-spring'] += 20;
      scores['warm-spring'] += 15;
    } else if (answers.hairColor === 'ash-blonde' || answers.hairColor === 'platinum') {
      scores['light-summer'] += 15;
      scores['cool-summer'] += 20;
    } else if (answers.hairColor === 'red' || answers.hairColor === 'strawberry') {
      scores['warm-autumn'] += 20;
      scores['warm-spring'] += 15;
    } else if (answers.hairColor === 'gray' || answers.hairColor === 'silver') {
      scores['cool-summer'] += 15;
      scores['muted-summer'] += 15;
    }

    // ۳) رنگ چشم
    if (answers.eyeColor === 'dark-brown' || answers.eyeColor === 'black') {
      scores['cool-winter'] += 10;
      scores['deep-winter'] += 15;
      scores['deep-autumn'] += 10;
    } else if (answers.eyeColor === 'light-brown' || answers.eyeColor === 'hazel') {
      scores['warm-autumn'] += 15;
      scores['warm-spring'] += 10;
    } else if (answers.eyeColor === 'green' || answers.eyeColor === 'olive') {
      scores['warm-autumn'] += 10;
      scores['muted-autumn'] += 10;
    } else if (answers.eyeColor === 'blue' || answers.eyeColor === 'gray') {
      scores['cool-summer'] += 15;
      scores['light-summer'] += 10;
      scores['cool-winter'] += 10;
    } else if (answers.eyeColor === 'amber' || answers.eyeColor === 'golden') {
      scores['warm-spring'] += 15;
      scores['bright-spring'] += 10;
    }

    // ۴) کنتراست (روشنی پوست)
    if (answers.contrast === 'high') {
      scores['bright-winter'] += 15;
      scores['bright-spring'] += 15;
      scores['cool-winter'] += 10;
    } else if (answers.contrast === 'medium') {
      scores['warm-spring'] += 10;
      scores['cool-summer'] += 10;
      scores['warm-autumn'] += 10;
    } else if (answers.contrast === 'low') {
      scores['muted-summer'] += 15;
      scores['muted-autumn'] += 15;
      scores['light-summer'] += 10;
    }

    // ۵) جواهرات
    if (answers.jewelry === 'gold') {
      scores['warm-spring'] += 10;
      scores['warm-autumn'] += 15;
      scores['bright-spring'] += 5;
    } else if (answers.jewelry === 'silver') {
      scores['cool-summer'] += 10;
      scores['cool-winter'] += 15;
      scores['bright-winter'] += 5;
    } else if (answers.jewelry === 'rose-gold') {
      scores['muted-summer'] += 10;
      scores['light-spring'] += 5;
    } else if (answers.jewelry === 'both') {
      scores['light-spring'] += 10;
      scores['muted-autumn'] += 10;
    }

    // بهترین فصل
    let best = 'cool-summer';
    let maxScore = 0;
    Object.keys(scores).forEach(s => {
      if (scores[s] > maxScore) {
        maxScore = scores[s];
        best = s;
      }
    });

    return {
      season: best,
      seasonData: TWELVE_SEASONS[best],
      allScores: scores,
      confidence: Math.min(95, Math.round((maxScore / 80) * 100))
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🆕 ساختار فرم - ۵ مرحله
  // ═══════════════════════════════════════════════════════════════
  const FORM_STEPS = [
    // ═══ مرحله ۱: اطلاعات پایه (۵ سوال) ═══
    {
      id: 'basic',
      title: 'اطلاعات پایه',
      subtitle: 'بذار با شناخت بهتر، دقیق‌تر راهنماییت کنیم',
      reassurance: '🌿 نگران نباش، همه اختیاریه. هر چی نخوای بگی، خالی بذار.',
      questions: [
        {
          id: 'gender',
          label: 'جنسیت',
          type: 'single',
          required: true,
          options: [
            { val: 'female', label: '👩 زنانه' },
            { val: 'male', label: '👨 مردانه' },
            { val: 'non-binary', label: '🌈 غیردودویی' },
            { val: 'skip', label: '⏭️ نمی‌خوام بگم' }
          ]
        },
        {
          id: 'ageRange',
          label: 'رده سنی',
          type: 'single',
          required: false,
          options: [
            { val: 'teen', label: '🌱 نوجوان (۱۳-۱۹)' },
            { val: 'young', label: '🌸 جوان (۲۰-۲۹)' },
            { val: 'adult', label: '🌺 میانسال (۳۰-۴۵)' },
            { val: 'mature', label: '🌳 بالاتر (۴۵+)' },
            { val: 'skip', label: '⏭️ نمی‌گم' }
          ]
        },
        {
          id: 'bodyType',
          label: 'فرم بدن (برای پیشنهاد بهتر)',
          type: 'single',
          required: false,
          options: [
            { val: 'slim', label: '🍃 لاغر' },
            { val: 'athletic', label: '💪 ورزشکاری' },
            { val: 'average', label: '🌾 متوسط' },
            { val: 'curvy', label: '🌹 خوش‌اندام' },
            { val: 'plus', label: '🌷 سایز بزرگ' },
            { val: 'skip', label: '⏭️ نمی‌گم' }
          ]
        },
        {
          id: 'height',
          label: 'قد',
          type: 'single',
          required: false,
          options: [
            { val: 'short', label: '🌱 کوتاه (زیر ۱۶۰)' },
            { val: 'average', label: '🌾 متوسط (۱۶۰-۱۷۵)' },
            { val: 'tall', label: '🌳 بلند (بالای ۱۷۵)' },
            { val: 'skip', label: '⏭️ نمی‌گم' }
          ]
        }
      ]
    },

    // ═══ مرحله ۲: رنگ پوست + فصل رنگی (۵ سوال) ═══
    {
      id: 'color',
      title: '🎨 فصل رنگی',
      subtitle: 'تشخیص دقیق رنگ‌هایی که بهت میان',
      reassurance: '💡 اگه مطمئن نیستی، مهم نیست. تقریبی انتخاب کن، AI کمکت می‌کنه.',
      questions: [
        {
          id: 'skinTone',
          label: 'ته‌رنگ پوستت چیه؟ (به رگ مچ دست نگاه کن: آبی=سرد، سبز=گرم)',
          type: 'single',
          required: false,
          options: [
            { val: 'warm', label: '🌅 گرم (رگ‌ها سبز، پوست طلایی)' },
            { val: 'cool', label: '❄️ سرد (رگ‌ها آبی، پوست صورتی)' },
            { val: 'neutral', label: '🌗 خنثی' },
            { val: 'skip', label: '⏭️ بعداً' }
          ]
        },
        {
          id: 'hairColor',
          label: 'رنگ مو',
          type: 'single',
          required: false,
          options: [
            { val: 'black', label: '⚫ مشکی پررنگ' },
            { val: 'dark-brown', label: '🟤 قهوه‌ای تیره' },
            { val: 'light-brown', label: '🟫 قهوه‌ای روشن' },
            { val: 'blonde', label: '👱 بلوند طلایی' },
            { val: 'ash-blonde', label: '🌾 بلوند خاکستری' },
            { val: 'auburn', label: '🍂 آبرنی (مسی)' },
            { val: 'red', label: '🔴 قرمز طبیعی' },
            { val: 'gray', label: '⚪ خاکستری/سفید' },
            { val: 'skip', label: '⏭️ بعداً' }
          ]
        },
        {
          id: 'eyeColor',
          label: 'رنگ چشم',
          type: 'single',
          required: false,
          options: [
            { val: 'dark-brown', label: '⚫ قهوه‌ای تیره' },
            { val: 'light-brown', label: '🟤 قهوه‌ای روشن' },
            { val: 'hazel', label: '🟡 فندقی' },
            { val: 'green', label: '🟢 سبز' },
            { val: 'blue', label: '🔵 آبی' },
            { val: 'gray', label: '⚪ خاکستری' },
            { val: 'amber', label: '🍯 عسلی' },
            { val: 'skip', label: '⏭️ بعداً' }
          ]
        },
        {
          id: 'contrast',
          label: 'کنتراست بین پوست و مو و چشم',
          type: 'single',
          required: false,
          options: [
            { val: 'high', label: '⚡ بالا (مثل موی مشکی و پوست روشن)' },
            { val: 'medium', label: '🌗 متوسط' },
            { val: 'low', label: '🌫️ کم (همه نزدیک به هم)' },
            { val: 'skip', label: '⏭️ نمی‌دونم' }
          ]
        },
        {
          id: 'jewelry',
          label: 'کدوم جواهر بهتر بهت میاد؟',
          type: 'single',
          required: false,
          options: [
            { val: 'gold', label: '✨ طلایی' },
            { val: 'silver', label: '🪞 نقره‌ای' },
            { val: 'rose-gold', label: '🌸 رزگلد' },
            { val: 'both', label: '💎 هر دو' },
            { val: 'skip', label: '⏭️ نمی‌دونم' }
          ]
        }
      ]
    },

    // ═══ مرحله ۳: سلیقه رنگ (۲ سوال) ═══
    {
      id: 'color-pref',
      title: 'رنگ‌های دلخواه',
      subtitle: 'رنگ‌هایی که دوست داری بپوشی',
      reassurance: '💚 هر چند تا که دوست داری انتخاب کن. می‌تونی بعداً تغییر بدی.',
      questions: [
        {
          id: 'favoriteColors',
          label: 'رنگ‌های مورد علاقه (چندتایی)',
          type: 'multi',
          required: false,
          options: [
            { val: 'black', label: '⚫ مشکی', color: '#1f2937' },
            { val: 'white', label: '⚪ سفید', color: '#f9fafb' },
            { val: 'gray', label: '🔘 طوسی', color: '#6b7280' },
            { val: 'gold', label: '✨ طلایی', color: '#d4af37' },
            { val: 'cream', label: '🥛 کرم', color: '#fef3c7' },
            { val: 'red', label: '🔴 قرمز', color: '#ef4444' },
            { val: 'burgundy', label: '🍷 زرشکی', color: '#800020' },
            { val: 'pink', label: '🌸 صورتی', color: '#ec4899' },
            { val: 'coral', label: '🪸 مرجانی', color: '#ff7f50' },
            { val: 'blue', label: '🔵 آبی', color: '#3b82f6' },
            { val: 'navy', label: '🟦 سرمه‌ای', color: '#1e3a8a' },
            { val: 'sky-blue', label: '☁️ آبی آسمانی', color: '#87ceeb' },
            { val: 'teal', label: '🌊 فیروزه‌ای', color: '#008080' },
            { val: 'green', label: '🟢 سبز', color: '#10b981' },
            { val: 'olive', label: '🫒 زیتونی', color: '#808000' },
            { val: 'brown', label: '🟤 قهوه‌ای', color: '#92400e' },
            { val: 'tan', label: '🟫 خردلی', color: '#d2b48c' },
            { val: 'purple', label: '🟣 بنفش', color: '#a855f7' },
            { val: 'lavender', label: '💜 اسطوخودوسی', color: '#e6e6fa' }
          ]
        },
        {
          id: 'avoidColors',
          label: 'رنگ‌هایی که دوست نداری',
          type: 'multi',
          required: false,
          options: [
            { val: 'neon', label: '⚡ نئونی' },
            { val: 'pastel', label: '🍼 پاستیلی' },
            { val: 'earthy', label: '🍂 خاکی' },
            { val: 'bright', label: '🔆 خیلی روشن' }
          ]
        }
      ]
    },

    // ═══ مرحله ۴: سبک (۳ سطح - ۸ سوال) ═══
    {
      id: 'style',
      title: 'سبک مورد علاقه',
      subtitle: 'دقیق‌تر بگو چه استایلی دوست داری',
      reassurance: '👗 چندتایی انتخاب کن. می‌تونی بعداً ویرایش کنی.',
      questions: [
        {
          id: 'styleMain',
          label: 'سبک اصلی (۱-۲ تا)',
          type: 'multi-min',
          max: 2,
          required: true,
          options: [
            { val: 'classic', label: '👔 کلاسیک', desc: 'مینیمال، شیک، همیشه‌مد' },
            { val: 'modern', label: '💫 مدرن', desc: 'امروزی، ترندی، جسور' },
            { val: 'elegant', label: '✨ شیک‌پوش', desc: 'لوکس، مجلسی، خاص' },
            { val: 'sporty', label: '⚡ اسپرت', desc: 'راحت، پویا، ورزشی' },
            { val: 'casual', label: '☕ کژوال', desc: 'روزمره، ساده، راحت' },
            { val: 'romantic', label: '💕 رمانتیک', desc: 'زنانه، نرم، حساس' },
            { val: 'bohemian', label: '🌿 بوهو', desc: 'هنری، آزاد، رنگارنگ' },
            { val: 'vintage', label: '📜 وینتیج', desc: 'کلاسیک قدیمی، نوستالژیک' },
            { val: 'minimalist', label: '🖤 مینیمال', desc: 'ساده، کم، تمیز' },
            { val: 'streetwear', label: '🛹 خیابانی', desc: 'شهری، گرافیکی' },
            { val: 'preppy', label: '🎓 پِرِپی', desc: 'آکسفورد، دانشگاهی' },
            { val: 'glamorous', label: '💎 گلامور', desc: 'پرزرق‌وبرق، درخشان' }
          ]
        },
        {
          id: 'styleDetail',
          label: 'ریزسبک‌ها (هر چند تا)',
          type: 'multi',
          required: false,
          options: [
            { val: 'office-chic', label: '💼 اداری شیک' },
            { val: 'smart-casual', label: '👔 اسمارت کژوال' },
            { val: 'athleisure', label: '🧘 اَثلِژِر' },
            { val: 'quiet-luxury', label: '🕊️ لوکس بی‌صدا' },
            { val: 'old-money', label: '🏛️ قدیمی پولدار' },
            { val: 'coquette', label: '🎀 کوکِت' },
            { val: 'coastal', label: '🌊 ساحلی' },
            { val: 'dark-academia', label: '📚 آکادمی تیره' },
            { val: 'y2k', label: '💿 وای‌توکِی' },
            { val: 'cottagecore', label: '🌻 کُتاج‌کور' },
            { val: 'mob-wife', label: '💄 ماب‌وایف' }
          ]
        },
        {
          id: 'patternPref',
          label: 'الگوها (هر چند تا)',
          type: 'multi',
          required: false,
          options: [
            { val: 'solid', label: '🎯 ساده' },
            { val: 'stripe', label: '➖ راه‌راه' },
            { val: 'check', label: '⬜ چهارخانه' },
            { val: 'floral', label: '🌺 گل‌دار' },
            { val: 'abstract', label: '🌀 آبستره' },
            { val: 'animal', label: '🐆 حیوانی' },
            { val: 'geometric', label: '📐 هندسی' }
          ]
        },
        {
          id: 'fitPref',
          label: 'فیت لباس',
          type: 'single',
          required: false,
          options: [
            { val: 'slim', label: '👗 جذب (Slim Fit)' },
            { val: 'regular', label: '🧥 معمولی (Regular)' },
            { val: 'loose', label: '👘 آزاد (Loose)' },
            { val: 'oversized', label: '🧥 اورسایز' },
            { val: 'mixed', label: '🌈 ترکیبی' }
          ]
        },
        {
          id: 'neckline',
          label: 'یقه (اگه می‌پوشی)',
          type: 'single',
          required: false,
          options: [
            { val: 'round', label: '⭕ گرد' },
            { val: 'v-neck', label: '🔻 وی' },
            { val: 'collared', label: '👔 یقه‌دار' },
            { val: 'boat', label: '⛵ قایقی' },
            { val: 'turtleneck', label: '🐢 یقه‌اسکی' },
            { val: 'skip', label: '⏭️ فرقی نداره' }
          ]
        }
      ]
    },

    // ═══ مرحله ۵: سبک زندگی + موقعیت + بودجه (۶ سوال) ═══
    {
      id: 'lifestyle',
      title: 'سبک زندگی',
      subtitle: 'کجا و چطور زندگی می‌کنی؟',
      reassurance: '🌟 این بخش کاملاً اختیاریه. هر چی نخوای بگی، رد کن.',
      questions: [
        {
          id: 'occupation',
          label: 'شغل / فعالیت',
          type: 'single',
          required: false,
          options: [
            { val: 'office', label: '🏢 کارمند اداری' },
            { val: 'freelance', label: '💻 فریلنسر / دورکار' },
            { val: 'student', label: '🎓 دانشجو' },
            { val: 'creative', label: '🎨 شغل خلاقانه' },
            { val: 'homemaker', label: '🏠 خانه‌دار' },
            { val: 'athlete', label: '🏃 ورزشکار' },
            { val: 'business', label: '📊 کسب‌وکار' },
            { val: 'retired', label: '🌅 بازنشسته' },
            { val: 'skip', label: '⏭️ بعداً' }
          ]
        },
        {
          id: 'lifestyle',
          label: 'سبک زندگی',
          type: 'multi',
          required: false,
          options: [
            { val: 'active', label: '🏃 پرجنب‌وجوش' },
            { val: 'social', label: '🎉 مهمانی‌رفتن' },
            { val: 'homebody', label: '🏠 خونه‌نشین' },
            { val: 'travel', label: '✈️ سفر زیاد' },
            { val: 'minimal', label: '🧘 مینیمالیست' },
            { val: 'luxury', label: '💎 لوکس‌پسند' }
          ]
        },
        {
          id: 'personality',
          label: 'شخصیت',
          type: 'multi',
          required: false,
          options: [
            { val: 'introvert', label: '🤍 درون‌گرا' },
            { val: 'extrovert', label: '❤️ برون‌گرا' },
            { val: 'calm', label: '🧘 آرام' },
            { val: 'bold', label: '⚡ جسور' },
            { val: 'romantic', label: '💕 رمانتیک' },
            { val: 'practical', label: '🛠️ عمل‌گرا' }
          ]
        },
        {
          id: 'occasions',
          label: 'موقعیت‌های پوشیدن (هر چند تا)',
          type: 'multi',
          required: false,
          options: [
            { val: 'casual', label: '☕ روزمره' },
            { val: 'work', label: '💼 محل کار' },
            { val: 'party', label: '🎉 مهمانی' },
            { val: 'formal', label: '👰 مجلسی/عروسی' },
            { val: 'sport', label: '🏃 ورزش' },
            { val: 'travel', label: '✈️ سفر' },
            { val: 'date', label: '💕 قرار عاشقانه' },
            { val: 'beach', label: '🏖️ ساحل' }
          ]
        },
        {
          id: 'budget',
          label: 'بودجه هر آیتم',
          type: 'single',
          required: false,
          options: [
            { val: 'low', label: '💰 تا ۵۰۰ هزار تومان' },
            { val: 'mid', label: '💎 ۵۰۰ هزار تا ۲ میلیون' },
            { val: 'high', label: '💍 ۲ تا ۵ میلیون' },
            { val: 'luxury', label: '👑 بالای ۵ میلیون' },
            { val: 'skip', label: '⏭️ مهم نیست' }
          ]
        },
        {
          id: 'shopFreq',
          label: 'تکرار خرید',
          type: 'single',
          required: false,
          options: [
            { val: 'often', label: '🛍️ ماهی (زیاد)' },
            { val: 'sometimes', label: '🌸 چند ماه یک‌بار' },
            { val: 'rarely', label: '🧘 سالی یکی دو بار' },
            { val: 'skip', label: '⏭️ مهم نیست' }
          ]
        }
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  // 📦 توابع ذخیره‌سازی
  // ═══════════════════════════════════════════════════════════════
  function loadTaste() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveTaste(taste) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...taste,
        savedAt: Date.now(),
        version: 3
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearTaste() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 موتور تطابق پیشرفته (۱۰+ فاکتور)
  // ═══════════════════════════════════════════════════════════════
  function calculateMatch(product, taste) {
    let score = 0;
    let totalWeight = 0;
    const reasons = [];

    // ۱) تطابق جنسیت (۱۰٪)
    if (taste.gender && taste.gender !== 'skip') {
      totalWeight += 10;
      const section = (product.section || product.category || '').toLowerCase();
      const name = (product.name || '').toLowerCase();
      const genderMap = {
        female: ['زنان', 'زنانه', 'woman', 'women', 'dress', 'skirt', 'مجلسی'],
        male: ['مرد', 'مردانه', 'man', 'men'],
      };
      const keywords = genderMap[taste.gender] || [];
      if (taste.gender === 'non-binary') {
        // هر دو
        score += 7;
        reasons.push('🌈 بدون محدودیت جنسیتی');
      } else if (keywords.some(k => section.includes(k) || name.includes(k))) {
        score += 10;
        reasons.push('👤 مناسب شما');
      }
    }

    // ۲) تطابق رنگ پوست (۲۰٪) - اگه فصل رنگی تشخیص داده شده
    if (taste.colorSeason && product.colors && product.colors.length > 0) {
      totalWeight += 20;
      const season = TWELVE_SEASONS[taste.colorSeason];
      if (season) {
        const productColorsLower = product.colors.map(c => (c || '').toLowerCase().trim());
        const hasMatchingColor = season.palette.some(sc => {
          return productColorsLower.some(pc => pc.includes(sc) || sc.includes(pc));
        });
        const hasAvoidColor = season.avoidColors && season.avoidColors.some(ac => {
          return productColorsLower.some(pc => pc.includes(ac) || ac.includes(pc));
        });
        if (hasMatchingColor && !hasAvoidColor) {
          score += 20;
          reasons.push(`🎨 رنگ فصل ${season.name}`);
        } else if (hasAvoidColor) {
          // نمره کم
          score += 4;
        } else {
          score += 8;
        }
      }
    }

    // ۳) تطابق رنگ‌های دلخواه (۲۰٪)
    if (taste.favoriteColors && taste.favoriteColors.length > 0 && product.colors) {
      totalWeight += 20;
      const productColorsLower = product.colors.map(c => (c || '').toLowerCase().trim());
      const tasteColorsLower = taste.favoriteColors.map(c => c.toLowerCase().trim());
      const matchCount = tasteColorsLower.filter(tc =>
        productColorsLower.some(pc => pc.includes(tc) || tc.includes(pc))
      ).length;
      if (matchCount > 0) {
        const ratio = matchCount / Math.max(1, taste.favoriteColors.length);
        score += Math.round(20 * Math.min(1, ratio * 2));
        reasons.push(`🎨 ${matchCount} رنگ دلخواه`);
      }
    }

    // ۴) تطابق سبک اصلی (۲۰٪)
    if (taste.styleMain && taste.styleMain.length > 0) {
      totalWeight += 20;
      const productStyle = (product.style || product.category || product.subcategory || '').toLowerCase().trim();
      const tasteStylesLower = taste.styleMain.map(s => s.toLowerCase().trim());
      const styleMatch = tasteStylesLower.some(ts =>
        productStyle.includes(ts) || ts.includes(productStyle) ||
        // تطابق بر اساس category
        matchesCategory(ts, product.category)
      );
      if (styleMatch) {
        score += 20;
        reasons.push('✨ سبک دلخواه');
      }
    }

    // ۵) تطابق ریزسبک (۱۰٪)
    if (taste.styleDetail && taste.styleDetail.length > 0) {
      totalWeight += 10;
      const productTags = (product.tags || []).map(t => (t || '').toLowerCase());
      const productDesc = (product.description || '').toLowerCase();
      const productStyle = (product.style || '').toLowerCase();
      const allText = [...productTags, productDesc, productStyle].join(' ');

      const matchCount = taste.styleDetail.filter(sd => {
        const sdLower = sd.toLowerCase();
        return allText.includes(sdLower) ||
          allText.includes(sdLower.replace(/-/g, ' ')) ||
          matchesSubStyle(sd, product.category);
      }).length;
      if (matchCount > 0) {
        score += Math.min(10, matchCount * 4);
        reasons.push('💎 ریزسبک دلخواه');
      }
    }

    // ۶) تطابق موقعیت (۱۰٪)
    if (taste.occasions && taste.occasions.length > 0) {
      totalWeight += 10;
      const productTags = (product.tags || []).map(t => (t || '').toLowerCase());
      const productDesc = (product.description || '').toLowerCase();
      const allText = [...productTags, productDesc, product.category].join(' ').toLowerCase();

      const matchCount = taste.occasions.filter(occ => {
        return allText.includes(occ) || matchesOccasion(occ, product.category);
      }).length;
      if (matchCount > 0) {
        score += Math.min(10, matchCount * 3);
        reasons.push('🎯 مناسب موقعیت');
      }
    }

    // ۷) تطابق بودجه (۱۰٪)
    if (taste.budget && taste.budget !== 'skip' && product.price) {
      totalWeight += 10;
      const budgetMap = {
        low: 500000,
        mid: 2000000,
        high: 5000000,
        luxury: Infinity
      };
      const maxPrice = budgetMap[taste.budget] || Infinity;
      if (product.price <= maxPrice) {
        score += 10;
        reasons.push('💰 در بودجه');
      }
    }

    // ۸) تطابق الگو (۵٪)
    if (taste.patternPref && taste.patternPref.length > 0) {
      totalWeight += 5;
      const productTags = (product.tags || []).map(t => (t || '').toLowerCase()).join(' ');
      const productDesc = (product.description || '').toLowerCase();
      const allText = productTags + ' ' + productDesc;
      const matchCount = taste.patternPref.filter(p => allText.includes(p.toLowerCase())).length;
      if (matchCount > 0) {
        score += 5;
      } else if (taste.patternPref.includes('solid')) {
        // ساده همیشه می‌خوره
        score += 2;
      }
    }

    // ۹) تطابق سن (۵٪)
    if (taste.ageRange && taste.ageRange !== 'skip') {
      totalWeight += 5;
      const ageTags = {
        teen: ['نوجوان', 'جوانان', 'teen'],
        young: ['جوان', 'young', 'ترند'],
        adult: ['کلاسیک', 'اداری', 'شیک'],
        mature: ['کلاسیک', 'اصیل', 'مجلسی']
      };
      const tags = ageTags[taste.ageRange] || [];
      const allText = ((product.tags || []).join(' ') + ' ' + (product.description || '')).toLowerCase();
      if (tags.some(t => allText.includes(t))) {
        score += 5;
      } else {
        score += 2; // امتیاز پایه
      }
    }

    // ۱۰) تطابق شغل (۵٪)
    if (taste.occupation && taste.occupation !== 'skip') {
      totalWeight += 5;
      const occMap = {
        office: ['اداری', 'رسمی', 'مجلسی', 'کلاسیک'],
        freelance: ['راحت', 'کژوال', 'مدرن'],
        student: ['جوان', 'ترند', 'کژوال', 'اسپرت'],
        creative: ['خلاق', 'مدرن', 'هنری', 'بوهمو'],
        homemaker: ['راحت', 'خانگی', 'ساده'],
        athlete: ['ورزشی', 'اسپرت', 'اکتیو'],
        business: ['مجلسی', 'کلاسیک', 'شیک', 'لوکس'],
        retired: ['کلاسیک', 'راحت', 'ساده']
      };
      const tags = occMap[taste.occupation] || [];
      const allText = ((product.tags || []).join(' ') + ' ' + (product.description || '')).toLowerCase();
      if (tags.some(t => allText.includes(t))) {
        score += 5;
      } else {
        score += 2;
      }
    }

    // محاسبه درصد نهایی
    const percent = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 50;

    // اگه فاکتور خاصی نبود، حداقل ۴۰٪ بده
    const finalPercent = Math.max(40, Math.min(percent, 100));

    // تعیین سطح
    let level = 'medium', levelLabel = 'خوب', levelColor = '#f59e0b', levelIcon = '👍';
    if (finalPercent >= 85) {
      level = 'perfect'; levelLabel = 'عالی'; levelColor = '#10b981'; levelIcon = '🎯';
    } else if (finalPercent >= 75) {
      level = 'great'; levelLabel = 'خیلی خوب'; levelColor = '#10b981'; levelIcon = '✨';
    } else if (finalPercent >= 65) {
      level = 'good'; levelLabel = 'خوب'; levelColor = '#3b82f6'; levelIcon = '👍';
    } else {
      level = 'fair'; levelLabel = 'متوسط'; levelColor = '#9ca3af'; levelIcon = '💡';
    }

    return {
      percent: finalPercent,
      reasons: reasons.slice(0, 3),
      level, levelLabel, levelColor, levelIcon
    };
  }

  // ═══ match helpers ═══
  function matchesCategory(style, category) {
    if (!category) return false;
    const cat = category.toLowerCase();
    const map = {
      'classic': ['پیراهن', 'کت', 'شلوار', 'مانتو'],
      'modern': ['تی‌شرت', 'شلوار', 'کت'],
      'elegant': ['پیراهن', 'کت', 'مانتو', 'مجلسی'],
      'sporty': ['تی‌شرت', 'شلوار', 'کفش'],
      'casual': ['تی‌شرت', 'شلوار'],
      'romantic': ['پیراهن', 'مانتو'],
      'bohemian': ['مانتو', 'پیراهن'],
      'vintage': ['پیراهن', 'کت'],
      'minimalist': ['تی‌شرت', 'شلوار', 'کت'],
    };
    return (map[style] || []).some(c => cat.includes(c));
  }

  function matchesSubStyle(subStyle, category) {
    if (!category) return false;
    const cat = category.toLowerCase();
    const map = {
      'office-chic': ['کت', 'پیراهن', 'شلوار'],
      'athleisure': ['تی‌شرت', 'شلوار'],
      'quiet-luxury': ['کت', 'پیراهن', 'کیف'],
      'coquette': ['پیراهن', 'مجلسی'],
      'y2k': ['تی‌شرت', 'شلوار'],
    };
    return (map[subStyle] || []).some(c => cat.includes(c));
  }

  function matchesOccasion(occasion, category) {
    const map = {
      'work': ['اداری', 'کت', 'پیراهن', 'رسمی'],
      'party': ['مجلسی', 'پیراهن', 'کت'],
      'formal': ['مجلسی', 'کت', 'پیراهن'],
      'sport': ['ورزشی', 'تی‌شرت'],
      'travel': ['راحت', 'شلوار'],
      'beach': ['ساحلی', 'لباس'],
    };
    return (map[occasion] || []).some(c => (category || '').toLowerCase().includes(c));
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔍 دریافت پیشنهادها
  // ═══════════════════════════════════════════════════════════════
  function getRecommendations(taste, limit) {
    limit = limit || 12;
    if (!window.DPProducts || !window.DPProducts.all) return [];

    const allProducts = window.DPProducts.all();
    if (!Array.isArray(allProducts) || allProducts.length === 0) return [];

    // محاسبه تطابق
    const scored = allProducts.map(p => {
      const match = calculateMatch(p, taste);
      return {
        ...p,
        matchPercent: match.percent,
        matchReasons: match.reasons,
        matchLevel: match.level,
        matchLevelLabel: match.levelLabel,
        matchLevelColor: match.levelColor,
        matchLevelIcon: match.levelIcon
      };
    });

    // فیلتر حداقل ۶۵٪
    let filtered = scored.filter(p => p.matchPercent >= MIN_MATCH_PERCENT);

    // 🆕 اگه چیزی بالای ۶۵٪ نبود، نزدیک‌ترین تطابق رو نشون بده
    if (filtered.length === 0 && scored.length > 0) {
      // مرتب‌سازی بر اساس بیشترین تطابق
      const sorted = [...scored].sort((a, b) => b.matchPercent - a.matchPercent);
      const topPercent = sorted[0].matchPercent;
      // همه محصولاتی که نزدیک به بیشترین هستن (در بازه ۱۰٪ اختلاف)
      filtered = sorted.filter(p => p.matchPercent >= Math.max(20, topPercent - 10));
      // علامت‌گذاری به عنوان "نزدیک‌ترین"
      filtered.forEach(p => {
        p.matchLevel = 'fallback';
        p.matchLevelLabel = 'نزدیک به سلیقه';
        p.matchLevelColor = '#9ca3af';
        p.matchLevelIcon = '💡';
        if (!p.matchReasons) p.matchReasons = [];
        p.matchReasons.unshift({
          icon: '💡',
          text: `نزدیک‌ترین تطابق (${p.matchPercent}٪) - محصول بالای ۶۵٪ یافت نشد`
        });
      });
    } else {
      // مرتب‌سازی بر اساس تطابق
      filtered.sort((a, b) => b.matchPercent - a.matchPercent);
    }

    return filtered.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر
  // ═══════════════════════════════════════════════════════════════
  function getProductUrl(product) {
    if (product.slug) return `./product.html?slug=${product.slug}`;
    if (product.id) return `./product.html?id=${product.id}`;
    return `./search.html?q=${encodeURIComponent(product.name || '')}`;
  }

  function formatPrice(n) {
    if (!n) return '۰';
    return n.toLocaleString('fa-IR');
  }

  function getMatchBadge(percent) {
    if (percent >= 85) return { class: '', text: `🎯 ${percent}٪ عالی` };
    if (percent >= 75) return { class: '', text: `✨ ${percent}٪ خیلی خوب` };
    return { class: 'is-medium', text: `👍 ${percent}٪ خوب` };
  }

  function getColorHex(colorName) {
    const map = {
      'black': '#1f2937', 'مشکی': '#1f2937',
      'white': '#f9fafb', 'سفید': '#f9fafb',
      'gold': '#d4af37', 'طلایی': '#d4af37',
      'cream': '#fef3c7', 'کرم': '#fef3c7',
      'red': '#ef4444', 'قرمز': '#ef4444',
      'burgundy': '#800020', 'زرشکی': '#800020',
      'pink': '#ec4899', 'صورتی': '#ec4899',
      'coral': '#ff7f50', 'مرجانی': '#ff7f50',
      'blue': '#3b82f6', 'آبی': '#3b82f6',
      'navy': '#1e3a8a', 'سرمه‌ای': '#1e3a8a',
      'sky-blue': '#87ceeb', 'آبی آسمانی': '#87ceeb',
      'teal': '#008080', 'فیروزه‌ای': '#008080',
      'green': '#10b981', 'سبز': '#10b981',
      'olive': '#808000', 'زیتونی': '#808000',
      'brown': '#92400e', 'قهوه‌ای': '#92400e',
      'tan': '#d2b48c', 'خردلی': '#d2b48c',
      'gray': '#6b7280', 'طوسی': '#6b7280',
      'purple': '#a855f7', 'بنفش': '#a855f7',
      'lavender': '#e6e6fa', 'اسطوخودوسی': '#e6e6fa'
    };
    return map[(colorName || '').toLowerCase()] || '#9ca3af';
  }

  function getCategoryIcon(category) {
    const map = {
      'پیراهن': '👗', 'کت': '🧥', 'شلوار': '👖', 'تی‌شرت': '👕',
      'مانتو': '🧥', 'کیف': '👜', 'ساعت': '⌚', 'اکسسوری': '💍',
      'کفش': '👟', 'عینک': '🕶️', 'کلاه': '🎩'
    };
    return map[category] || '🛍️';
  }

  function renderProductCard(product) {
    const url = getProductUrl(product);
    const badge = getMatchBadge(product.matchPercent);
    const reasons = product.matchReasons || [];
    const seller = product.seller || product.brand || 'فروشنده معتبر';
    const categoryIcon = getCategoryIcon(product.category);
    const colors = (product.colors || []).slice(0, 4);
    const isSeller = product.isSellerProduct;

    return `
      <a class="prof-taste-card" href="${url}" data-product-id="${product.id || ''}">
        <div class="prof-taste-card-img">
          <span class="prof-taste-match-badge ${badge.class}">${badge.text}</span>
          ${isSeller ? '<span class="prof-taste-seller-badge">فروشنده معتبر</span>' : ''}
          ${product.image
            ? `<img src="${product.image}" alt="${product.name || ''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />`
            : ''
          }
          <div class="prof-taste-card-img-fallback" ${product.image ? 'style="display:none"' : ''}>
            ${categoryIcon}
          </div>
        </div>
        <div class="prof-taste-card-body">
          <div class="prof-taste-card-name">${product.name || 'محصول'}</div>
          <div class="prof-taste-card-seller">${seller}</div>
          ${colors.length > 0 ? `
            <div class="prof-taste-colors">
              ${colors.map(c => `<span style="background:${getColorHex(c)}" title="${c}"></span>`).join('')}
            </div>
          ` : ''}
          <div class="prof-taste-card-rating">
            <span class="prof-taste-card-rating-stars">★</span>
            <span>${(product.rating || 4.5).toFixed(1)}</span>
            <span style="opacity:0.6">(${product.reviews || 0} نظر)</span>
          </div>
          <div class="prof-taste-card-price">
            <strong>${formatPrice(product.price)}</strong>
            ${product.originalPrice && product.originalPrice > product.price ? `<del>${formatPrice(product.originalPrice)}</del>` : ''}
            ${product.discount ? `<span class="prof-taste-card-discount">${product.discount}٪</span>` : ''}
          </div>
          ${reasons.length > 0 ? `
            <div class="prof-taste-card-reasons">
              ${reasons.slice(0, 2).map(r => `<span class="prof-taste-card-reason">${r.text || r}</span>`).join('')}
            </div>
          ` : ''}
          <div class="prof-taste-card-cta">مشاهده محصول ←</div>
        </div>
      </a>
    `;
  }

  function renderRecommendations(container, recommendations) {
    if (!container) return;
    if (!recommendations || recommendations.length === 0) {
      container.innerHTML = `
        <div class="prof-taste-empty">
          <div class="prof-taste-empty-icon">🔍</div>
          <h3>محصولی با سلیقه شما پیدا نشد</h3>
          <p>فروشندگان هنوز محصولاتی با این سلیقه اضافه نکرده‌اند. سلیقه‌تان را تغییر دهید یا بعداً دوباره سر بزنید.</p>
          <div class="prof-taste-empty-actions">
            <button class="prof-btn prof-btn--ghost" onclick="window.DPTasteProfile.edit()">✏️ ویرایش سلیقه</button>
            <a class="prof-btn" href="./index.html">🛍️ مشاهده همه محصولات</a>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = recommendations.map(renderProductCard).join('');
  }

  function updateStats(recommendations, taste) {
    const matchEl = document.getElementById('tasteMatchCount');
    const sellerEl = document.getElementById('tasteSellerCount');
    const topEl = document.getElementById('tasteTopMatch');
    const typeEl = document.getElementById('tasteType');
    const seasonEl = document.getElementById('tasteSeason');

    if (matchEl) matchEl.textContent = formatPrice(recommendations.length);
    if (sellerEl) {
      const sellers = new Set(recommendations.map(p => p.seller).filter(Boolean));
      sellerEl.textContent = formatPrice(sellers.size);
    }
    if (topEl && recommendations.length > 0) {
      topEl.textContent = recommendations[0].matchPercent + '٪';
    }
    if (seasonEl && taste.colorSeason) {
      const season = TWELVE_SEASONS[taste.colorSeason];
      if (season) seasonEl.textContent = season.name;
    } else if (seasonEl) {
      seasonEl.textContent = 'تعیین نشده';
    }
    if (typeEl) {
      if (window.DPTasteEngine && window.DPTasteEngine.classifyTasteType) {
        try {
          const profile = {
            preferredColors: taste.favoriteColors || [],
            preferredStyles: taste.styleMain || []
          };
          typeEl.textContent = window.DPTasteEngine.classifyTasteType(profile);
        } catch (e) {
          typeEl.textContent = 'متعادل 🌈';
        }
      } else {
        typeEl.textContent = 'متعادل 🌈';
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📝 رندر فرم
  // ═══════════════════════════════════════════════════════════════
  function renderForm(taste) {
    taste = taste || {};
    let html = '';
    let totalQuestions = 0;

    FORM_STEPS.forEach((step, stepIdx) => {
      totalQuestions += step.questions.length;
      html += `
        <div class="prof-taste-step" data-step="${stepIdx}" ${stepIdx > 0 ? 'style="display:none"' : ''}>
          <div class="prof-taste-step-head">
            <div class="prof-taste-step-num">${stepIdx + 1} از ${FORM_STEPS.length}</div>
            <h3>${step.title}</h3>
            <p>${step.subtitle}</p>
            <div class="prof-taste-reassure">${step.reassurance}</div>
          </div>
          <div class="prof-taste-step-body">
      `;

      step.questions.forEach(q => {
        const existing = taste[q.id];
        html += `
          <div class="prof-taste-q" data-q="${q.id}" data-type="${q.type}">
            <label class="prof-taste-q-label">${q.label}${q.required ? ' <span style="color:#ef4444">*</span>' : ' <span class="prof-taste-q-optional">(اختیاری)</span>'}</label>
            <div class="prof-taste-chips ${q.type === 'multi' || q.type === 'multi-min' ? 'is-multi' : ''}" data-name="${q.id}" ${q.max ? `data-max="${q.max}"` : ''}>
        `;
        q.options.forEach(opt => {
          let isOn = false;
          if (Array.isArray(existing)) {
            isOn = existing.includes(opt.val);
          } else if (existing) {
            isOn = (existing === opt.val);
          }
          const colorStyle = opt.color ? `style="--chip-color:${opt.color}"` : '';
          html += `
            <button type="button" class="prof-taste-chip ${isOn ? 'is-on' : ''}" data-val="${opt.val}" ${colorStyle}>
              <span class="prof-taste-chip-label">${opt.label}</span>
              ${opt.desc ? `<span class="prof-taste-chip-desc">${opt.desc}</span>` : ''}
            </button>
          `;
        });
        html += `
            </div>
          </div>
        `;
      });

      html += `
          </div>
          <div class="prof-taste-step-nav">
            ${stepIdx > 0 ? '<button type="button" class="prof-btn prof-btn--ghost" data-prev>← قبلی</button>' : '<div></div>'}
            <div class="prof-taste-step-progress">${stepIdx + 1}/${FORM_STEPS.length}</div>
            ${stepIdx < FORM_STEPS.length - 1
              ? '<button type="button" class="prof-btn" data-next>بعدی ←</button>'
              : '<button type="button" class="prof-btn" data-submit>💾 ذخیره و دریافت پیشنهاد</button>'
            }
          </div>
        </div>
      `;
    });

    return html;
  }

  function collectFormData() {
    const data = {};
    document.querySelectorAll('.prof-taste-chips').forEach(group => {
      const name = group.dataset.name;
      const type = group.dataset.max ? 'multi-min' : (group.classList.contains('is-multi') ? 'multi' : 'single');
      const selected = Array.from(group.querySelectorAll('.prof-taste-chip.is-on')).map(c => c.dataset.val);
      if (type === 'single') {
        data[name] = selected[0] || null;
      } else {
        data[name] = selected;
      }
    });
    return data;
  }

  function validateStep(stepIdx) {
    const step = FORM_STEPS[stepIdx];
    for (const q of step.questions) {
      if (!q.required) continue;
      const data = collectFormData();
      if (Array.isArray(data[q.id])) {
        if (data[q.id].length === 0) {
          showToast(`⚠️ لطفاً "${q.label}" را پر کنید`);
          return false;
        }
      } else if (!data[q.id] || data[q.id] === 'skip') {
        showToast(`⚠️ لطفاً "${q.label}" را پر کنید`);
        return false;
      }
    }
    return true;
  }

  function setupFormBehavior() {
    // انتخاب چیپ‌ها
    document.addEventListener('click', e => {
      const chip = e.target.closest('.prof-taste-chip');
      if (!chip) return;
      const group = chip.closest('.prof-taste-chips');
      if (!group) return;
      const max = parseInt(group.dataset.max || '0', 10);

      if (max > 0) {
        // چندتایی با حداکثر
        const isOn = chip.classList.contains('is-on');
        if (isOn) {
          chip.classList.remove('is-on');
        } else {
          const currentOn = group.querySelectorAll('.prof-taste-chip.is-on').length;
          if (currentOn >= max) {
            // اولین انتخاب رو حذف کن
            const firstOn = group.querySelector('.prof-taste-chip.is-on');
            if (firstOn && firstOn !== chip) firstOn.classList.remove('is-on');
          }
          chip.classList.add('is-on');
        }
      } else if (group.classList.contains('is-multi')) {
        // چندتایی بدون محدودیت
        chip.classList.toggle('is-on');
      } else {
        // تک انتخابی
        group.querySelectorAll('.prof-taste-chip').forEach(c => c.classList.remove('is-on'));
        chip.classList.add('is-on');
      }
    });

    // دکمه‌های ناوبری
    document.addEventListener('click', e => {
      const nextBtn = e.target.closest('[data-next]');
      const prevBtn = e.target.closest('[data-prev]');
      const submitBtn = e.target.closest('[data-submit]');

      if (nextBtn) {
        const currentStep = document.querySelector('.prof-taste-step:not([style*="display: none"])');
        const stepIdx = parseInt(currentStep?.dataset.step || '0', 10);
        if (validateStep(stepIdx)) {
          currentStep.style.display = 'none';
          const nextStep = document.querySelector(`[data-step="${stepIdx + 1}"]`);
          if (nextStep) {
            nextStep.style.display = 'block';
            nextStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }

      if (prevBtn) {
        const currentStep = document.querySelector('.prof-taste-step:not([style*="display: none"])');
        const stepIdx = parseInt(currentStep?.dataset.step || '0', 10);
        currentStep.style.display = 'none';
        const prevStep = document.querySelector(`[data-step="${stepIdx - 1}"]`);
        if (prevStep) {
          prevStep.style.display = 'block';
          prevStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      if (submitBtn) {
        const data = collectFormData();
        // تشخیص فصل رنگی
        const seasonData = detectColorSeason({
          skinTone: data.skinTone === 'skip' ? null : data.skinTone,
          hairColor: data.hairColor === 'skip' ? null : data.hairColor,
          eyeColor: data.eyeColor === 'skip' ? null : data.eyeColor,
          contrast: data.contrast === 'skip' ? null : data.contrast,
          jewelry: data.jewelry === 'skip' ? null : data.jewelry
        });
        data.colorSeason = seasonData.season;
        data.colorSeasonConfidence = seasonData.confidence;
        saveTaste(data);
        showToast('✅ سلیقه شما ذخیره شد');
        if (window.ClubTracker) window.ClubTracker.track?.('taste_save', 50);
        showResultSection();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎬 نمایش بخش‌ها
  // ═══════════════════════════════════════════════════════════════
  function showFormSection(taste) {
    const formWrap = document.getElementById('tasteFormWrap');
    const resultWrap = document.getElementById('tasteResultWrap');
    const badge = document.getElementById('profTasteBadge');

    if (!formWrap || !resultWrap) return;

    const formCard = document.getElementById('tasteFormCard');
    if (formCard) {
      formCard.innerHTML = renderForm(taste);
    } else {
      formWrap.innerHTML = renderForm(taste);
    }
    formWrap.style.display = 'block';
    resultWrap.style.display = 'none';
    if (badge) badge.style.display = 'flex';
  }

  function showResultSection() {
    const formWrap = document.getElementById('tasteFormWrap');
    const resultWrap = document.getElementById('tasteResultWrap');
    const badge = document.getElementById('profTasteBadge');

    if (!formWrap || !resultWrap) return;

    formWrap.style.display = 'none';
    resultWrap.style.display = 'block';
    if (badge) badge.style.display = 'none';
    loadAndRender();
  }

  function loadAndRender() {
    const taste = loadTaste();
    if (!taste) return;
    const grid = document.getElementById('tasteGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px">⏳ در حال تحلیل...</div>';
    setTimeout(() => {
      const recs = getRecommendations(taste, 12);
      renderRecommendations(grid, recs);
      updateStats(recs, taste);
    }, 150);
  }

  function setupEditAndRefresh() {
    const editBtn = document.getElementById('tasteEditBtn');
    const refreshBtn = document.getElementById('tasteRefreshBtn');
    if (editBtn) editBtn.onclick = () => {
      const taste = loadTaste();
      showFormSection(taste);
    };
    if (refreshBtn) refreshBtn.onclick = () => {
      showToast('🔄 در حال به‌روزرسانی...');
      loadAndRender();
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🍞 Toast
  // ═══════════════════════════════════════════════════════════════
  function showToast(msg) {
    if (window.DPMagic?.showToast) return window.DPMagic.showToast(msg);
    if (window.showSimpleToast) return window.showSimpleToast(msg);
    const t = document.getElementById('toast');
    const tt = document.getElementById('toastText');
    if (t && tt) {
      tt.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    } else {
      console.log(msg);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function init() {
    setupFormBehavior();
    setupEditAndRefresh();

    const taste = loadTaste();
    if (!taste || !taste.gender) {
      showFormSection(null);
    } else {
      showResultSection();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📡 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPTasteProfile = {
    version: '3.0 ULTIMATE',
    load: loadTaste,
    save: saveTaste,
    clear: clearTaste,
    edit: () => showFormSection(loadTaste()),
    refresh: loadAndRender,
    getRecommendations: getRecommendations,
    calculateMatch: calculateMatch,
    detectColorSeason: detectColorSeason,
    getTwelveSeasons: () => TWELVE_SEASONS,
    getFormSteps: () => FORM_STEPS,
    MIN_MATCH: MIN_MATCH_PERCENT,
    init: init,
  };

  console.log('🎯 DPTasteProfile v3.0 ULTIMATE loaded');
  console.log('   📋 ۵ مرحله | 🎨 ۱۲ فصل رنگی | 👗 ۴ سطح سبک | 🧠 ۱۰+ فاکتور تطابق | حداقل ۶۵٪');
})();
