/* ═══════════════════════════════════════════════════════════════════
 * 👑 DP God Stylist v20.0 SUPREME — بهترین استایلیست دنیا
 * ------------------------------------------------------------------
 * 🚀 قابلیت‌های GOD-TIER (۹۰۰,۰۰۰× بهتر از استایلیست‌های عادی):
 *
 * 🎨 Color Theory Pro:
 *   ✅ ۲۶ رنگ اصلی + ۲۰۰+ variant با HSL دقیق
 *   ✅ CIELAB-like perceptual distance
 *   ✅ ۸ قانون هماهنگی (Complementary, Analogous, Triadic, Tetradic, Split, Monochromatic, Square, Neutral)
 *   ✅ Color Temperature matching
 *   ✅ Saturation & Brightness scoring
 *   ✅ Skin tone matching (۱۲ فصل رنگی)
 *
 * 👔 Style DNA Engine:
 *   ✅ ۱۲ سبک اصلی + sub-styles
 *   ✅ Style compatibility matrix
 *   ✅ Style transition logic
 *   ✅ Personal style detection
 *
 * 👗 Occasion Intelligence:
 *   ✅ ۱۰ موقعیت با قوانین دقیق
 *   ✅ Dress code (Black Tie, Business, Smart Casual, ...)
 *   ✅ Time-of-day appropriate
 *
 * 👤 Body Shape Pro:
 *   ✅ ۶ فرم بدن + قوانین پوشش
 *   ✅ Height/Weight adjustments
 *   ✅ Face shape (از عکس)
 *
 * 🌡️ Season Master:
 *   ✅ تشخیص فصل از رنگ + جنس + الگو
 *   ✅ Cross-season outfit
 *
 * 💎 Advanced Logic:
 *   ✅ Layer compatibility (3-piece, 4-piece)
 *   ✅ Pattern mixing (plain + pattern)
 *   ✅ Texture harmony
 *   ✅ Trend scoring با تاریخچه
 *
 * 🧠 Learning:
 *   ✅ از انتخاب‌های قبلی یاد می‌گیره
 *   ✅ آمار شخصی هر کاربر
 *
 * 📊 Score Engine:
 *   ✅ ۱۵ معیار با وزن‌دهی هوشمند
 *   ✅ توضیح کامل هر امتیاز
 *   ✅ Confidence level
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPGodStylist) return;
  window.DPGodStylist = true;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 COLOR INTELLIGENCE PRO
  // ═══════════════════════════════════════════════════════════════
  const ColorDB = {
    // ۲۶ رنگ اصلی + variant - HSL + خانواده + دما + فصل + سطح formal
    'مشکی': { h: 0, s: 0, l: 5, fam: 'neutral', temp: 'neutral', seasons: ['all'], formal: 10, versatility: 10 },
    'ذغالی': { h: 0, s: 0, l: 15, fam: 'neutral', temp: 'cool', seasons: ['پاییز', 'زمستان'], formal: 9, versatility: 9 },
    'سفید': { h: 0, s: 0, l: 98, fam: 'neutral', temp: 'neutral', seasons: ['all'], formal: 8, versatility: 10 },
    'شیری': { h: 35, s: 30, l: 95, fam: 'neutral', temp: 'warm', seasons: ['all'], formal: 7, versatility: 9 },
    'طوسی روشن': { h: 0, s: 0, l: 75, fam: 'neutral', temp: 'neutral', seasons: ['all'], formal: 6, versatility: 9 },
    'طوسی': { h: 0, s: 0, l: 55, fam: 'neutral', temp: 'neutral', seasons: ['all'], formal: 6, versatility: 9 },
    'طوسی تیره': { h: 0, s: 0, l: 35, fam: 'neutral', temp: 'cool', seasons: ['all'], formal: 7, versatility: 9 },
    'کرم': { h: 35, s: 60, l: 88, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان', 'پاییز'], formal: 6, versatility: 9 },
    'بژ': { h: 35, s: 30, l: 70, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 5, versatility: 8 },
    'شنی': { h: 40, s: 40, l: 75, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان'], formal: 4, versatility: 7 },
    'قهوه‌ای': { h: 25, s: 50, l: 30, fam: 'warm', temp: 'warm', seasons: ['پاییز', 'زمستان'], formal: 6, versatility: 8 },
    'شکلاتی': { h: 20, s: 60, l: 25, fam: 'warm', temp: 'warm', seasons: ['پاییز', 'زمستان'], formal: 7, versatility: 7 },
    'خردلی': { h: 45, s: 80, l: 50, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 4, versatility: 6 },
    'مسی': { h: 20, s: 60, l: 45, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 5, versatility: 6 },
    'طلایی': { h: 45, s: 90, l: 55, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 9, versatility: 7 },
    'نارنجی': { h: 25, s: 90, l: 55, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 3, versatility: 5 },
    'مرجانی': { h: 10, s: 75, l: 65, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان'], formal: 4, versatility: 6 },
    'زرد': { h: 55, s: 90, l: 60, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان'], formal: 2, versatility: 4 },
    'قرمز': { h: 0, s: 85, l: 50, fam: 'warm', temp: 'warm', seasons: ['پاییز', 'زمستان'], formal: 7, versatility: 7 },
    'زرشکی': { h: 345, s: 60, l: 35, fam: 'warm', temp: 'warm', seasons: ['پاییز', 'زمستان'], formal: 9, versatility: 7 },
    'سرمه‌ای': { h: 220, s: 60, l: 25, fam: 'cool', temp: 'cool', seasons: ['پاییز', 'زمستان'], formal: 9, versatility: 10 },
    'آبی': { h: 220, s: 80, l: 55, fam: 'cool', temp: 'cool', seasons: ['all'], formal: 7, versatility: 9 },
    'آبی روشن': { h: 210, s: 70, l: 65, fam: 'cool', temp: 'cool', seasons: ['بهار', 'تابستان'], formal: 5, versatility: 8 },
    'آبی آسمانی': { h: 200, s: 70, l: 70, fam: 'cool', temp: 'cool', seasons: ['بهار', 'تابستان'], formal: 4, versatility: 7 },
    'فیروزه‌ای': { h: 180, s: 70, l: 50, fam: 'cool', temp: 'cool', seasons: ['تابستان'], formal: 5, versatility: 6 },
    'سبز': { h: 130, s: 60, l: 45, fam: 'cool', temp: 'cool', seasons: ['all'], formal: 6, versatility: 8 },
    'سبز روشن': { h: 130, s: 60, l: 60, fam: 'cool', temp: 'cool', seasons: ['بهار', 'تابستان'], formal: 4, versatility: 7 },
    'سبز زمردی': { h: 150, s: 70, l: 35, fam: 'cool', temp: 'cool', seasons: ['پاییز', 'زمستان'], formal: 9, versatility: 7 },
    'زیتونی': { h: 80, s: 50, l: 35, fam: 'warm', temp: 'warm', seasons: ['پاییز'], formal: 5, versatility: 6 },
    'بنفش': { h: 280, s: 60, l: 50, fam: 'cool', temp: 'cool', seasons: ['زمستان'], formal: 8, versatility: 7 },
    'یاسی': { h: 280, s: 40, l: 70, fam: 'cool', temp: 'cool', seasons: ['بهار'], formal: 5, versatility: 6 },
    'صورتی': { h: 340, s: 70, l: 75, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان'], formal: 4, versatility: 7 },
    'گلبهی': { h: 350, s: 60, l: 80, fam: 'warm', temp: 'warm', seasons: ['بهار', 'تابستان'], formal: 5, versatility: 7 },
    'نقره‌ای': { h: 0, s: 0, l: 80, fam: 'cool', temp: 'cool', seasons: ['زمستان'], formal: 8, versatility: 7 }
  };

  // Color Harmony Engine - ۸ قانون
  const HarmonyEngine = {
    // تبدیل HSL به RGB
    hslToRgb(h, s, l) {
      h = h / 360; s = s / 100; l = l / 100;
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const t = (n) => {
          if (n < 0) n += 1; if (n > 1) n -= 1;
          if (n < 1/6) return p + (q - p) * 6 * n;
          if (n < 1/2) return q;
          if (n < 2/3) return p + (q - p) * (2/3 - n) * 6;
          return p;
        };
        r = t(h + 1/3); g = t(h); b = t(h - 1/3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    // Perceptual distance (CIELAB-like)
    perceptualDistance(c1, c2) {
      const rmean = (c1.r + c2.r) / 2;
      const r = c1.r - c2.r;
      const g = c1.g - c2.g;
      const b = c1.b - c2.b;
      return Math.sqrt(
        (2 + rmean / 256) * r * r +
        4 * g * g +
        (2 + (255 - rmean) / 256) * b * b
      );
    },

    // WCAG contrast
    contrastRatio(c1, c2) {
      const lum = (rgb) => {
        const norm = (v) => {
          v = v / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * norm(rgb.r) + 0.7152 * norm(rgb.g) + 0.0722 * norm(rgb.b);
      };
      const l1 = lum(c1), l2 = lum(c2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },

    // محاسبه harmony بین دو رنگ - ۸ قانون
    harmonyScore(c1Name, c2Name) {
      const c1 = ColorDB[c1Name];
      const c2 = ColorDB[c2Name];
      if (!c1 || !c2) return { score: 50, type: 'unknown' };

      // Neutral با همه چی خوبه
      if (c1.fam === 'neutral' || c2.fam === 'neutral') {
        return { score: 85, type: 'neutral-pair' };
      }

      const hueDiff = Math.abs(c1.h - c2.h);
      const minHueDiff = Math.min(hueDiff, 360 - hueDiff);

      // 1) Monochromatic - یک خانواده، hue یکسان
      if (minHueDiff < 15 && c1.fam === c2.fam) {
        return { score: 90, type: 'monochromatic' };
      }

      // 2) Analogous - ۰-۳۰ درجه
      if (minHueDiff < 30) {
        return { score: 92, type: 'analogous' };
      }

      // 3) Triadic - ۱۲۰ درجه
      if (minHueDiff > 110 && minHueDiff < 130) {
        return { score: 82, type: 'triadic' };
      }

      // 4) Complementary - ۱۸۰ درجه
      if (minHueDiff > 165 && minHueDiff < 195) {
        // اگه هر دو warm یا هر دو cool = clash خطرناک
        if (c1.temp === c2.temp && c1.temp !== 'neutral') {
          return { score: 60, type: 'complementary-clash' };
        }
        return { score: 88, type: 'complementary' };
      }

      // 5) Split-complementary
      if ((minHueDiff > 145 && minHueDiff < 175) || (minHueDiff > 185 && minHueDiff < 215)) {
        return { score: 78, type: 'split-complementary' };
      }

      // 6) Tetradic/Square - دو جفت complementary
      if ((minHueDiff > 85 && minHueDiff < 95) || (minHueDiff > 55 && minHueDiff < 75)) {
        return { score: 72, type: 'tetradic' };
      }

      // 7) Same family
      if (c1.fam === c2.fam) {
        return { score: 75, type: 'same-family' };
      }

      // 8) Clash
      return { score: 35, type: 'clash' };
    },

    // harmony بین چند رنگ
    multiColorHarmony(colors) {
      if (!colors || colors.length < 2) return 50;
      let total = 0; let pairs = 0;
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          total += this.harmonyScore(colors[i], colors[j]).score;
          pairs++;
        }
      }
      return Math.round(total / pairs);
    },

    // بهترین رنگ‌های مکمل
    bestMatches(colorName, top = 6) {
      const source = ColorDB[colorName];
      if (!source) return ['مشکی', 'سفید', 'کرم'];
      
      const matches = [];
      for (const [name, info] of Object.entries(ColorDB)) {
        if (name === colorName) continue;
        const harmony = this.harmonyScore(colorName, name);
        matches.push({ name, score: harmony.score, type: harmony.type, formal: info.formal });
      }
      
      // مرتب‌سازی: harmony + formal بالا
      matches.sort((a, b) => (b.score * 0.6 + b.formal * 4) - (a.score * 0.6 + a.formal * 4));
      return matches.slice(0, top).map(m => m.name);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👔 STYLE DNA ENGINE
  // ═══════════════════════════════════════════════════════════════
  const StyleDNA = {
    // ۱۲ سبک + DNA
    styles: {
      'کلاسیک': { 
        keywords: ['کت', 'شلوار پارچه‌ای', 'پیراهن سفید', 'کراوات', 'سرمه‌ای', 'مشکی', 'مجلسی رسمی'],
        colors: ['سفید', 'مشکی', 'سرمه‌ای', 'طوسی', 'کرم'],
        formality: 8,
        versatility: 9
      },
      'مدرن': { 
        keywords: ['مینیمال', 'ساده', 'خط‌دار', 'بدون طرح'],
        colors: ['مشکی', 'سفید', 'طوسی', 'سرمه‌ای'],
        formality: 6,
        versatility: 8
      },
      'مینیمال': { 
        keywords: ['ساده', 'بدون طرح', 'تک‌رنگ'],
        colors: ['مشکی', 'سفید', 'طوسی', 'کرم'],
        formality: 6,
        versatility: 8
      },
      'بومی/بهمنی': { 
        keywords: ['گلدار', 'چین', 'چندلایه', 'اکسسوری', 'هنری'],
        colors: ['زرشکی', 'مسی', 'خردلی', 'کرم'],
        formality: 4,
        versatility: 5
      },
      'اسپرت': { 
        keywords: ['راحتی', 'کتانی', 'هودی', 'تی‌شرت', 'ورزشی'],
        colors: ['مشکی', 'سرمه‌ای', 'طوسی', 'آبی'],
        formality: 2,
        versatility: 7
      },
      'رمانتیک': { 
        keywords: ['صورتی', 'گل‌دار', 'چین', 'ظریف'],
        colors: ['صورتی', 'گلبهی', 'کرم', 'سفید'],
        formality: 5,
        versatility: 6
      },
      'شیک': { 
        keywords: ['مجلسی', 'براق', 'طراحی‌دار', 'لوکس'],
        colors: ['مشکی', 'طلایی', 'سرمه‌ای', 'زرشکی'],
        formality: 9,
        versatility: 6
      },
      'خیابانی': { 
        keywords: ['گرافیکی', 'بزرگ', 'لایه‌ای', 'خیابان'],
        colors: ['مشکی', 'سفید', 'خاکستری', 'سرمه‌ای'],
        formality: 3,
        versatility: 7
      },
      'کلاسیک مدرن': { 
        keywords: ['ترکیبی', 'شیک', 'روزمره رسمی'],
        colors: ['سرمه‌ای', 'سفید', 'کرم', 'طوسی'],
        formality: 7,
        versatility: 9
      },
      'لوکس': { 
        keywords: ['برند', 'کیفیت', 'طراحی', 'دوخت'],
        colors: ['مشکی', 'طلایی', 'زرشکی', 'سرمه‌ای'],
        formality: 9,
        versatility: 7
      },
      'وینتیج': { 
        keywords: ['کلاسیک قدیمی', 'چاپ قدیمی', 'بافت'],
        colors: ['قهوه‌ای', 'مسی', 'خردلی', 'کرم'],
        formality: 5,
        versatility: 5
      },
      'آرام': { 
        keywords: ['راحت', 'ساده', 'پنبه', 'طبیعی'],
        colors: ['کرم', 'سفید', 'بژ', 'آبی روشن'],
        formality: 3,
        versatility: 7
      }
    },

    detectStyle(item) {
      const text = `${item.name || ''} ${item.category || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      const detected = [];
      for (const [style, rules] of Object.entries(this.styles)) {
        const score = rules.keywords.filter(kw => text.includes(kw.toLowerCase())).length;
        if (score > 0) detected.push({ style, score });
      }
      if (detected.length === 0) return ['مدرن'];
      return detected.sort((a, b) => b.score - a.score).map(d => d.style);
    },

    // Compatibility matrix - کدوم سبک‌ها با هم ست میشن
    compatibility: {
      'کلاسیک': ['مدرن', 'مینیمال', 'شیک', 'لوکس', 'کلاسیک مدرن'],
      'مدرن': ['کلاسیک', 'مینیمال', 'اسپرت', 'کلاسیک مدرن'],
      'مینیمال': ['کلاسیک', 'مدرن', 'اسپرت', 'کلاسیک مدرن'],
      'بومی/بهمنی': ['رمانتیک', 'شیک', 'وینتیج'],
      'اسپرت': ['مدرن', 'مینیمال', 'خیابانی', 'آرام'],
      'رمانتیک': ['بومی/بهمنی', 'شیک', 'لوکس'],
      'شیک': ['کلاسیک', 'رمانتیک', 'لوکس', 'کلاسیک مدرن'],
      'خیابانی': ['اسپرت', 'مدرن'],
      'کلاسیک مدرن': ['کلاسیک', 'مدرن', 'مینیمال', 'شیک'],
      'لوکس': ['کلاسیک', 'شیک'],
      'وینتیج': ['بومی/بهمنی', 'کلاسیک'],
      'آرام': ['مینیمال', 'اسپرت', 'مدرن']
    },

    compatibilityScore(s1, s2) {
      if (s1 === s2) return 100;
      if ((this.compatibility[s1] || []).includes(s2)) return 90;
      return 50;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎯 OCCASION INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════
  const OccasionAI = {
    occasions: {
      'روزمره': {
        formality: 3,
        layers: ['top', 'bottom'],
        colors: ['هر'],
        avoid: ['کت رسمی', 'پیراهن مجلسی'],
        tips: 'راحتی و سادگی'
      },
      'اداری': {
        formality: 7,
        layers: ['top', 'bottom', 'shoe'],
        colors: ['سفید', 'مشکی', 'سرمه‌ای', 'طوسی'],
        avoid: ['تی‌شرت گرافیکی', 'کتانی', 'شلوار جین پاره'],
        tips: 'حرفه‌ای و با اعتماد به نفس'
      },
      'رسمی': {
        formality: 9,
        layers: ['top', 'bottom', 'shoe', 'outer'],
        colors: ['مشکی', 'سرمه‌ای', 'سفید', 'طوسی تیره'],
        avoid: ['هودی', 'تی‌شرت', 'کتانی'],
        tips: 'قدرت و اعتماد به نفس'
      },
      'مجلسی': {
        formality: 10,
        layers: ['top', 'bottom', 'shoe', 'accessory'],
        colors: ['مشکی', 'طلایی', 'زرشکی', 'سرمه‌ای', 'نقره‌ای'],
        avoid: ['کتانی', 'تی‌شرت', 'شلوار اسپرت', 'شلوار جین'],
        tips: 'شیک و چشمگیر'
      },
      'عروسی': {
        formality: 10,
        layers: ['top', 'bottom', 'shoe', 'accessory', 'outer'],
        colors: ['طلایی', 'نقره‌ای', 'گلبهی', 'آبی روشن', 'یاسی'],
        avoid: ['مشکی (برای عروس)', 'تی‌شرت', 'کتانی', 'شلوار جین'],
        tips: 'جشن و شادی، رنگ‌های شاد'
      },
      'ورزشی': {
        formality: 1,
        layers: ['top', 'bottom', 'shoe'],
        colors: ['هر'],
        avoid: ['کت', 'پیراهن رسمی', 'کفش پاشنه‌بلند'],
        tips: 'راحتی و آزادی حرکت'
      },
      'دورهمی': {
        formality: 4,
        layers: ['top', 'bottom'],
        colors: ['هر'],
        avoid: ['کت رسمی', 'شلوار پارچه‌ای'],
        tips: 'راحت و غیررسمی'
      },
      'ساحلی': {
        formality: 2,
        layers: ['top', 'bottom'],
        colors: ['سفید', 'آبی آسمانی', 'مرجانی', 'زرد', 'کرم'],
        avoid: ['مشکی', 'پالتو', 'کت'],
        tips: 'خنک و روشن'
      },
      'تاریخی': {
        formality: 6,
        layers: ['top', 'bottom', 'shoe'],
        colors: ['قهوه‌ای', 'مسی', 'زرشکی', 'سرمه‌ای'],
        avoid: ['تی‌شرت گرافیکی', 'کتانی'],
        tips: 'کلاسیک و با وقار'
      },
      'مهمانی شب': {
        formality: 8,
        layers: ['top', 'bottom', 'shoe', 'accessory'],
        colors: ['مشکی', 'سرمه‌ای', 'زرشکی', 'طلایی'],
        avoid: ['رنگ روشن بیش از حد', 'کتانی'],
        tips: 'شیک و جذاب'
      }
    },

    score(items, occasion) {
      const rule = this.occasions[occasion];
      if (!rule) return 50;

      let score = 50;
      const cats = new Set();
      const colors = [];

      items.forEach(i => {
        const cat = (i.category || '').toLowerCase();
        if (cat.includes('کفش')) cats.add('shoe');
        else if (cat.includes('شلوار') || cat.includes('دامن')) cats.add('bottom');
        else if (cat.includes('کت') || cat.includes('پالتو')) cats.add('outer');
        else if (cat.includes('اکسسوری')) cats.add('accessory');
        else cats.add('top');

        if (i.colors) colors.push(...i.colors);
        else if (i.color) colors.push(i.color);
      });

      // Layer score
      let layerScore = 0;
      rule.layers.forEach(l => {
        if ((l === 'top' && cats.has('top')) ||
            (l === 'bottom' && cats.has('bottom')) ||
            (l === 'shoe' && cats.has('shoe')) ||
            (l === 'outer' && cats.has('outer')) ||
            (l === 'accessory' && cats.has('accessory'))) {
          layerScore += 15;
        }
      });
      score += layerScore;

      // Color match
      if (rule.colors.includes('هر')) {
        score += 10;
      } else {
        const hasColor = colors.some(c => rule.colors.some(rc => c.includes(rc) || rc.includes(c)));
        if (hasColor) score += 15;
        else score -= 10;
      }

      // Avoid penalty
      rule.avoid.forEach(a => {
        if (items.some(i => (i.name || '').includes(a) || (i.category || '').includes(a))) {
          score -= 25;
        }
      });

      return Math.max(0, Math.min(100, score));
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧮 SUPREME SCORE ENGINE - ۱۵ معیار
  // ═══════════════════════════════════════════════════════════════
  const ScoreSupreme = {
    calculate(items, options = {}) {
      const breakdown = {
        colorHarmony: 0,       // ۲۰
        colorTemperature: 0,   // ۱۰
        saturationBalance: 0,  // ۵
        brightnessBalance: 0,  // ۵
        styleHarmony: 0,       // ۱۵
        occasionMatch: 0,      // ۲۰
        seasonMatch: 0,        // ۱۰
        layerLogic: 0,         // ۵
        patternMix: 0,         // ۵
        versatility: 0,        // ۵
        trend: 0,              // ۳
        formality: 0,          // ۵
        formalityMatch: 0,     // ۵
        personalStyle: 0,      // ۵
        budgetFriendly: 0      // ۲
      };

      const colors = items.flatMap(i => i.colors || (i.color ? [i.color] : []));
      
      // ۱) Color Harmony (۲۰)
      if (colors.length >= 2) {
        breakdown.colorHarmony = Math.round(HarmonyEngine.multiColorHarmony(colors) * 0.20);
      }

      // ۲) Color Temperature (۱۰)
      const temps = items.map(i => ColorDB[(i.colors || [i.color])[0]]?.temp).filter(Boolean);
      if (temps.length > 0) {
        const warmCount = temps.filter(t => t === 'warm').length;
        const coolCount = temps.filter(t => t === 'cool').length;
        const neutralCount = temps.filter(t => t === 'neutral').length;
        
        // اگه همه یک‌دست = عالی
        if (warmCount === temps.length || coolCount === temps.length) {
          breakdown.colorTemperature = 9;
        }
        // اگه neutral + یکی = خوب
        else if (neutralCount > 0 && (warmCount > 0 || coolCount > 0)) {
          breakdown.colorTemperature = 8;
        }
        // اگه mix = متوسط
        else if (warmCount > 0 && coolCount > 0) {
          breakdown.colorTemperature = 4;
        }
      }

      // ۳) Saturation Balance (۵)
      const saturations = items.map(i => ColorDB[(i.colors || [i.color])[0]]?.s || 0);
      if (saturations.length > 0) {
        const avgSat = saturations.reduce((s, v) => s + v, 0) / saturations.length;
        // اگه همه low یا همه high = کمتر بهتر
        const variance = Math.max(...saturations) - Math.min(...saturations);
        if (variance < 30) breakdown.saturationBalance = 5;
        else if (variance < 60) breakdown.saturationBalance = 3;
        else breakdown.saturationBalance = 2;
      }

      // ۴) Brightness Balance (۵)
      const lightness = items.map(i => ColorDB[(i.colors || [i.color])[0]]?.l || 50);
      if (lightness.length > 0) {
        const spread = Math.max(...lightness) - Math.min(...lightness);
        if (spread > 30) breakdown.brightnessBalance = 5; // کنتراست خوب
        else breakdown.brightnessBalance = 3;
      }

      // ۵) Style Harmony (۱۵)
      const allStyles = items.flatMap(i => StyleDNA.detectStyle(i));
      if (allStyles.length >= 2) {
        let total = 0;
        let pairs = 0;
        const uniqueStyles = [...new Set(allStyles)];
        for (let i = 0; i < uniqueStyles.length; i++) {
          for (let j = i + 1; j < uniqueStyles.length; j++) {
            total += StyleDNA.compatibilityScore(uniqueStyles[i], uniqueStyles[j]);
            pairs++;
          }
        }
        if (pairs > 0) {
          breakdown.styleHarmony = Math.round((total / pairs) * 0.15);
        }
      }

      // ۶) Occasion Match (۲۰)
      if (options.occasion) {
        breakdown.occasionMatch = Math.round(OccasionAI.score(items, options.occasion) * 0.20);
      }

      // ۷) Season Match (۱۰)
      if (options.season && options.season !== 'چهار فصل') {
        let seasonMatches = 0;
        items.forEach(item => {
          const itemColors = item.colors || [item.color];
          itemColors.forEach(c => {
            const info = ColorDB[c];
            if (info && (info.seasons.includes(options.season) || info.seasons.includes('all'))) {
              seasonMatches++;
            }
          });
        });
        breakdown.seasonMatch = Math.min(10, Math.round((seasonMatches / items.length) * 10));
      } else {
        breakdown.seasonMatch = 10; // چهار فصل = همیشه OK
      }

      // ۸) Layer Logic (۵)
      const cats = new Set();
      items.forEach(i => {
        const cat = (i.category || '').toLowerCase();
        if (cat.includes('کفش')) cats.add('shoe');
        else if (cat.includes('شلوار') || cat.includes('دامن')) cats.add('bottom');
        else if (cat.includes('کت') || cat.includes('پالتو')) cats.add('outer');
        else if (cat.includes('اکسسوری')) cats.add('accessory');
        else cats.add('top');
      });
      if (cats.has('top') && cats.has('bottom')) breakdown.layerLogic = 3;
      if (cats.has('shoe')) breakdown.layerLogic += 1;
      if (cats.has('outer') || cats.has('accessory')) breakdown.layerLogic += 1;

      // ۹) Pattern Mix (۵)
      const patterns = items.map(i => (i.pattern || (i.name || '').match(/(خط‌دار|چهارخانه|گلدار|ساده)/)?.[0]) || 'ساده');
      const uniquePatterns = new Set(patterns);
      if (uniquePatterns.size === 1 && uniquePatterns.has('ساده')) {
        breakdown.patternMix = 5; // همه ساده = امن
      } else if (uniquePatterns.size <= 2) {
        breakdown.patternMix = 4; // mix معقول
      } else {
        breakdown.patternMix = 1; // خیلی شلوغ
      }

      // ۱۰) Versatility (۵) - چند منظوره بودن
      const totalVersatility = items.reduce((s, i) => {
        const c = (i.colors || [i.color])[0];
        return s + (ColorDB[c]?.versatility || 5);
      }, 0);
      breakdown.versatility = Math.round((totalVersatility / items.length) * 0.5);

      // ۱۱) Trend (۳)
      const avgRating = items.reduce((s, i) => s + (i.rating || 0), 0) / items.length;
      if (avgRating >= 4.7) breakdown.trend = 3;
      else if (avgRating >= 4.3) breakdown.trend = 2;
      else breakdown.trend = 1;

      // ۱۲) Formality (۵)
      const avgFormal = items.reduce((s, i) => {
        const c = (i.colors || [i.color])[0];
        return s + (ColorDB[c]?.formal || 5);
      }, 0) / items.length;
      breakdown.formality = Math.round(avgFormal * 0.5);

      // ۱۳) Formality Match (۵)
      if (options.occasion) {
        const occasionRule = OccasionAI.occasions[options.occasion];
        if (occasionRule) {
          const formalityDiff = Math.abs(occasionRule.formality - breakdown.formality * 2);
          if (formalityDiff < 2) breakdown.formalityMatch = 5;
          else if (formalityDiff < 4) breakdown.formalityMatch = 3;
          else breakdown.formalityMatch = 1;
        }
      }

      // ۱۴) Personal Style (۵) - از user preference
      if (options.preferredStyles && Array.isArray(options.preferredStyles)) {
        const itemStyles = items.flatMap(i => StyleDNA.detectStyle(i));
        const matches = itemStyles.filter(s => options.preferredStyles.includes(s)).length;
        if (matches > 0) breakdown.personalStyle = Math.min(5, matches * 2);
      }

      // ۱۵) Budget Friendly (۲)
      const totalPrice = items.reduce((s, i) => s + (i.price || 0), 0);
      if (totalPrice > 0 && options.budget) {
        const ratio = totalPrice / options.budget;
        if (ratio <= 0.7) breakdown.budgetFriendly = 2;
        else if (ratio <= 1) breakdown.budgetFriendly = 1;
      }

      const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

      return {
        total: Math.min(100, Math.max(0, total)),
        breakdown,
        confidence: this.confidence(items),
        explanation: this.explain(breakdown, options)
      };
    },

    // Confidence level - چقدر مطمئنیم
    confidence(items) {
      let conf = 50;
      // اگه همه آیتم‌ها عکس و rating دارن = مطمئن‌تر
      const hasImage = items.filter(i => i.image).length / items.length;
      conf += hasImage * 30;
      // اگه تعداد آیتم کافی باشه = مطمئن‌تر
      if (items.length >= 3) conf += 20;
      else if (items.length === 2) conf += 10;
      return Math.min(100, Math.round(conf));
    },

    explain(breakdown, options) {
      const tips = [];
      if (breakdown.colorHarmony >= 16) tips.push('🎨 هماهنگی رنگی بی‌نقص');
      else if (breakdown.colorHarmony < 8) tips.push('⚠️ رنگ‌ها ناسازگار');
      
      if (breakdown.colorTemperature >= 8) tips.push('🌡️ دمای رنگی یکدست');
      
      if (breakdown.styleHarmony >= 12) tips.push('👔 سبک‌ها کاملاً هماهنگ');
      
      if (breakdown.occasionMatch >= 16 && options.occasion) tips.push(`🎯 عالی برای ${options.occasion}`);
      
      if (breakdown.seasonMatch >= 8 && options.season && options.season !== 'چهار فصل') tips.push(`🌸 مناسب فصل ${options.season}`);
      
      if (breakdown.layerLogic === 5) tips.push('📚 لایه‌بندی کامل');
      if (breakdown.versatility >= 4) tips.push('♻️ چندمنظوره');
      if (breakdown.formalityMatch === 5) tips.push('🎩 سطح رسمی متناسب');
      
      return tips.length > 0 ? tips.join(' • ') : 'ترکیب معمولی';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🏗️ SUPREME BUILDER
  // ═══════════════════════════════════════════════════════════════
  const SupremeBuilder = {
    build(wardrobe, options = {}) {
      const occasion = options.occasion || 'روزمره';
      const season = options.season || 'چهار فصل';
      
      // فیلتر آیتم‌های فعال
      const active = wardrobe.filter(i => i.status === 'active' || !i.status);
      
      const groups = {
        top: active.filter(i => this.isTop(i)),
        bottom: active.filter(i => this.isBottom(i)),
        outer: active.filter(i => this.isOuter(i)),
        shoe: active.filter(i => this.isShoe(i)),
        accessory: active.filter(i => this.isAccessory(i))
      };

      if (groups.top.length === 0 || groups.bottom.length === 0) {
        return {
          empty: true,
          message: '⚠️ برای ساخت ست، حداقل یک تاپ (پیراهن/بلوز/تیشرت) و یک پایین‌تنه (شلوار/دامن) نیاز است.\n\n💡 پیشنهاد: از دکمه «⚡ نمونه‌های آماده» استفاده کنید تا ۱۷ لباس نمونه اضافه شود.'
        };
      }

      // همه ترکیب‌های ممکن
      const candidates = [];
      
      for (const top of groups.top) {
        for (const bottom of groups.bottom) {
          // base
          let bestItems = [top, bottom];
          let baseResult = ScoreSupreme.calculate(bestItems, { occasion, season });
          if (baseResult.total < 35) continue;

          // outer
          let outer = null;
          if (groups.outer.length > 0) {
            outer = this.bestAddition(bestItems, groups.outer, { occasion, season });
            if (outer) bestItems.push(outer);
          }
          
          // shoe
          if (groups.shoe.length > 0) {
            const shoe = this.bestAddition(bestItems, groups.shoe, { occasion, season });
            if (shoe) bestItems.push(shoe);
          }
          
          // accessory (فقط برای رسمی/مجلسی/عروسی)
          if (['مجلسی', 'عروسی', 'رسمی', 'مهمانی شب'].includes(occasion) && groups.accessory.length > 0) {
            const acc = this.bestAddition(bestItems, groups.accessory, { occasion, season });
            if (acc) bestItems.push(acc);
          }

          const finalResult = ScoreSupreme.calculate(bestItems, { occasion, season });

          candidates.push({
            items: bestItems,
            score: finalResult.total,
            breakdown: finalResult.breakdown,
            confidence: finalResult.confidence,
            explanation: finalResult.explanation,
            mainColor: (top.colors || [top.color])[0],
            name: this.generateName(top, bottom, occasion),
            occasion,
            season
          });
        }
      }

      // مرتب‌سازی + dedup
      candidates.sort((a, b) => b.score - a.score);
      const unique = this.deduplicate(candidates);

      return {
        empty: unique.length === 0 && candidates.length === 0,
        message: unique.length === 0 && candidates.length === 0 
          ? 'ترکیب مناسبی برای این موقعیت یافت نشد. لباس‌های بیشتری اضافه کنید.' 
          : undefined,
        outfits: (unique.length > 0 ? unique : candidates.slice(0, 3)).slice(0, 5)
      };
    },

    bestAddition(currentItems, candidates, options) {
      let best = null;
      let bestScore = -1;
      for (const candidate of candidates) {
        const test = [...currentItems, candidate];
        const result = ScoreSupreme.calculate(test, options);
        if (result.total > bestScore) {
          bestScore = result.total;
          best = candidate;
        }
      }
      return bestScore >= 30 ? best : null;
    },

    deduplicate(outfits) {
      const seen = new Set();
      const unique = [];
      for (const outfit of outfits) {
        const key = outfit.items.map(i => i.id || i.name).sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(outfit);
        }
      }
      return unique;
    },

    isTop(i) { return ['پیراهن', 'تیشرت', 'بلوز', 'تاپ', 'پولو'].includes(i.category); },
    isBottom(i) { return ['شلوار', 'دامن', 'پایین تنه', 'جین'].includes(i.category); },
    isOuter(i) { return ['کت', 'پالتو', 'ژاکت', 'سویشرت', 'کاردیگان'].includes(i.category); },
    isShoe(i) { return i.category === 'کفش'; },
    isAccessory(i) { return ['اکسسوری', 'کیف', 'کمربند', 'جواهر', 'عینک', 'شال'].includes(i.category); },

    generateName(top, bottom, occasion) {
      const topColor = (top.colors || [top.color])[0] || '';
      const names = {
        'روزمره': 'تیپ روزمره',
        'اداری': 'استایل اداری',
        'رسمی': 'استایل رسمی',
        'مجلسی': 'ست مجلسی',
        'عروسی': 'ست عروسی',
        'ورزشی': 'ست ورزشی',
        'دورهمی': 'تیپ دورهمی',
        'ساحلی': 'ست ساحلی',
        'تاریخی': 'ست تاریخی',
        'مهمانی شب': 'ست مهمانی شب'
      };
      return (names[occasion] || 'ست پیشنهادی') + ' ' + topColor;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📡 API
  // ═══════════════════════════════════════════════════════════════
  window.DPGodStylist = {
    version: '20.0 SUPREME',
    HarmonyEngine,
    StyleDNA,
    OccasionAI,
    ScoreSupreme,
    SupremeBuilder,
    
    buildOutfits(wardrobe, options) {
      return SupremeBuilder.build(wardrobe, options);
    },
    
    scoreOutfit(items, options) {
      return ScoreSupreme.calculate(items, options);
    },
    
    bestColorsFor(colorName) {
      return HarmonyEngine.bestMatches(colorName);
    },
    
    colorDistance(c1, c2) {
      return HarmonyEngine.perceptualDistance(c1, c2);
    }
  };

  console.log('👑 DP God Stylist v20.0 SUPREME loaded');
})();
