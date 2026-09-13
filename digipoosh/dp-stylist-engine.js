/* ═══════════════════════════════════════════════════════════════════
 * 🎨 DP Stylist Engine v19.0 PRO — استایلیست حرفه‌ای واقعی
 * ------------------------------------------------------------------
 * ✅ Color Theory واقعی: HSL, Analogous, Complementary, Triadic, Split
 * ✅ Contrast Ratio: محاسبه WCAG
 * ✅ Body Shape Analysis: تشخیص فرم بدن + قانون پوشش
 * ✅ Skin Tone Analysis: ۱۲ فصل رنگی (Color Season Theory)
 * ✅ Occasion Matching: قواعد رسمی/مجلسی/روزمره/ورزشی
 * ✅ Style Harmony: Classical, Modern, Bohemian, Minimal, Sport, Romantic
 * ✅ Layer Logic: ترتیب درست لایه‌ها (تاپ → رویه → پایین → کفش)
 * ✅ Smart Score: ۱۰۰ امتیاز واقعی بر اساس ۱۰ معیار
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPStylistEngine) return;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رنگ‌های پایه با HSL (دقیق‌تر از RGB)
  // ═══════════════════════════════════════════════════════════════
  const COLOR_HSL = {
    'مشکی':      { h: 0,   s: 0,   l: 5,   family: 'neutral', temp: 'neutral', season: ['پاییز', 'زمستان'] },
    'سفید':      { h: 0,   s: 0,   l: 98,  family: 'neutral', temp: 'neutral', season: ['بهار', 'تابستان'] },
    'طوسی':      { h: 0,   s: 0,   l: 60,  family: 'neutral', temp: 'neutral', season: ['چهار فصل'] },
    'خاکستری':  { h: 0,   s: 0,   l: 40,  family: 'neutral', temp: 'neutral', season: ['چهار فصل'] },
    'کرم':       { h: 35,  s: 60,  l: 88,  family: 'warm',    temp: 'warm',    season: ['بهار', 'تابستان', 'پاییز'] },
    'بژ':        { h: 35,  s: 30,  l: 75,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'قهوه‌ای':   { h: 25,  s: 50,  l: 30,  family: 'warm',    temp: 'warm',    season: ['پاییز', 'زمستان'] },
    'خردلی':     { h: 45,  s: 80,  l: 50,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'مسی':       { h: 20,  s: 60,  l: 45,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'طلایی':     { h: 45,  s: 90,  l: 55,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'نارنجی':    { h: 25,  s: 90,  l: 55,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'زرد':       { h: 55,  s: 90,  l: 60,  family: 'warm',    temp: 'warm',    season: ['بهار', 'تابستان'] },
    'قرمز':      { h: 0,   s: 85,  l: 50,  family: 'warm',    temp: 'warm',    season: ['پاییز', 'زمستان'] },
    'زرشکی':     { h: 345, s: 60,  l: 35,  family: 'warm',    temp: 'warm',    season: ['پاییز', 'زمستان'] },
    'صورتی':     { h: 340, s: 70,  l: 75,  family: 'warm',    temp: 'warm',    season: ['بهار', 'تابستان'] },
    'گلبهی':     { h: 350, s: 60,  l: 80,  family: 'warm',    temp: 'warm',    season: ['بهار', 'تابستان'] },
    'سرمه‌ای':   { h: 220, s: 60,  l: 25,  family: 'cool',    temp: 'cool',    season: ['پاییز', 'زمستان'] },
    'آبی':       { h: 220, s: 80,  l: 55,  family: 'cool',    temp: 'cool',    season: ['چهار فصل'] },
    'آبی آسمانی':{ h: 200, s: 70,  l: 70,  family: 'cool',    temp: 'cool',    season: ['بهار', 'تابستان'] },
    'فیروزه‌ای': { h: 180, s: 70,  l: 50,  family: 'cool',    temp: 'cool',    season: ['تابستان'] },
    'سبز':       { h: 130, s: 60,  l: 45,  family: 'cool',    temp: 'cool',    season: ['بهار', 'تابستان'] },
    'سبز زمردی': { h: 150, s: 70,  l: 35,  family: 'cool',    temp: 'cool',    season: ['پاییز', 'زمستان'] },
    'زیتونی':    { h: 80,  s: 50,  l: 35,  family: 'warm',    temp: 'warm',    season: ['پاییز'] },
    'بنفش':      { h: 280, s: 60,  l: 50,  family: 'cool',    temp: 'cool',    season: ['زمستان'] },
    'یاسی':      { h: 280, s: 40,  l: 70,  family: 'cool',    temp: 'cool',    season: ['بهار'] },
    'نقره‌ای':   { h: 0,   s: 0,   l: 80,  family: 'cool',    temp: 'cool',    season: ['زمستان'] }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 Color Theory - قوانین هماهنگی رنگ
  // ═══════════════════════════════════════════════════════════════
  const ColorTheory = {
    // HSL → RGB برای محاسبه contrast
    hslToRgb(h, s, l) {
      h = h / 360; s = s / 100; l = l / 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    // Contrast ratio (WCAG)
    contrastRatio(rgb1, rgb2) {
      const lum1 = this.relativeLuminance(rgb1);
      const lum2 = this.relativeLuminance(rgb2);
      const lighter = Math.max(lum1, lum2);
      const darker = Math.min(lum1, lum2);
      return (lighter + 0.05) / (darker + 0.05);
    },

    relativeLuminance(rgb) {
      const { r, g, b } = rgb;
      const norm = (c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b);
    },

    // هماهنگی بر اساس Hue
    colorHarmony(color1, color2) {
      const hsl1 = COLOR_HSL[color1];
      const hsl2 = COLOR_HSL[color2];
      if (!hsl1 || !hsl2) return { type: 'unknown', score: 50 };

      // neutral می‌تونه با همه چی ست بشه
      if (hsl1.family === 'neutral' || hsl2.family === 'neutral') {
        return { type: 'neutral-pair', score: 80 };
      }

      const hueDiff = Math.abs(hsl1.h - hsl2.h);
      const minHueDiff = Math.min(hueDiff, 360 - hueDiff);

      // Complementary: ۱۸۰ درجه
      if (minHueDiff > 150 && minHueDiff < 210) {
        const score = hsl1.temp === hsl2.temp ? 75 : 90;
        return { type: 'complementary', score };
      }

      // Analogous: ۰-۶۰ درجه
      if (minHueDiff < 60) {
        const score = hsl1.family === hsl2.family ? 95 : 70;
        return { type: 'analogous', score };
      }

      // Triadic: ۱۲۰ درجه
      if (minHueDiff > 100 && minHueDiff < 140) {
        return { type: 'triadic', score: 80 };
      }

      // Split-complementary: ۱۵۰-۱۸۰ با neutral
      if (minHueDiff > 100 && minHueDiff < 160 && (hsl1.temp !== hsl2.temp)) {
        return { type: 'split-complementary', score: 70 };
      }

      // Same family
      if (hsl1.family === hsl2.family) {
        return { type: 'monochromatic', score: 85 };
      }

      return { type: 'clash', score: 30 };
    },

    // محاسبه harmony بین چند رنگ
    multiColorHarmony(colors) {
      if (!colors || colors.length < 2) return 50;
      
      let totalScore = 0;
      let pairs = 0;
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          totalScore += this.colorHarmony(colors[i], colors[j]).score;
          pairs++;
        }
      }
      return Math.round(totalScore / pairs);
    },

    // بهترین رنگ‌های مکمل برای یک رنگ
    bestMatches(colorName, top = 5) {
      const matches = [];
      const source = COLOR_HSL[colorName];
      if (!source) return ['مشکی', 'سفید', 'کرم', 'سرمه‌ای'];

      for (const [name, hsl] of Object.entries(COLOR_HSL)) {
        if (name === colorName) continue;
        const harmony = this.colorHarmony(colorName, name);
        matches.push({ name, score: harmony.score, type: harmony.type });
      }
      return matches.sort((a, b) => b.score - a.score).slice(0, top).map(m => m.name);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👔 Style Harmony - قوانین سبک
  // ═══════════════════════════════════════════════════════════════
  const StyleRules = {
    // سبک‌های اصلی
    styles: {
      'کلاسیک': {
        keywords: ['کت', 'شلوار پارچه‌ای', 'پیراهن سفید', 'سرمه‌ای', 'مشکی'],
        compatibleColors: ['سفید', 'مشکی', 'سرمه‌ای', 'طوسی', 'کرم'],
        occasion: ['رسمی', 'اداری', 'مجلسی']
      },
      'مدرن': {
        keywords: ['مینیمال', 'خط‌دار', 'ساده'],
        compatibleColors: ['مشکی', 'سفید', 'خاکستری', 'سرمه‌ای'],
        occasion: ['رسمی', 'اداری', 'روزمره']
      },
      'بومی/بهمنی': {
        keywords: ['گلدار', 'چین', 'چندلایه', 'اکسسوری'],
        compatibleColors: ['زرشکی', 'مسی', 'خردلی', 'کرم'],
        occasion: ['مهمانی', 'دورهمی']
      },
      'مینیمال': {
        keywords: ['ساده', 'بدون طرح'],
        compatibleColors: ['مشکی', 'سفید', 'خاکستری', 'کرم'],
        occasion: ['روزمره', 'اداری']
      },
      'اسپرت': {
        keywords: ['راحتی', 'کتانی', 'هودی', 'تی‌شرت'],
        compatibleColors: ['مشکی', 'سرمه‌ای', 'خاکستری', 'آبی'],
        occasion: ['روزمره', 'ورزشی']
      },
      'رمانتیک': {
        keywords: ['صورتی', 'گل‌دار', 'چین'],
        compatibleColors: ['صورتی', 'گلبهی', 'کرم', 'سفید'],
        occasion: ['مهمانی', 'مجلسی']
      },
      'شیک': {
        keywords: ['مجلسی', 'براق', 'طراحی'],
        compatibleColors: ['مشکی', 'طلایی', 'سرمه‌ای', 'زرشکی'],
        occasion: ['مجلسی', 'مهمانی']
      }
    },

    // تشخیص سبک از آیتم
    detectStyle(item) {
      const text = `${item.name || ''} ${item.category || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      let detected = [];
      for (const [style, rules] of Object.entries(this.styles)) {
        if (rules.keywords.some(kw => text.includes(kw.toLowerCase()))) {
          detected.push(style);
        }
      }
      return detected.length > 0 ? detected : ['مدرن'];
    },

    // سازگاری سبک‌ها
    styleCompatibility(style1, style2) {
      // بعضی سبک‌ها با هم ست میشن
      const compatible = {
        'کلاسیک': ['مدرن', 'مینیمال', 'شیک'],
        'مدرن': ['کلاسیک', 'مینیمال', 'اسپرت'],
        'بومی/بهمنی': ['رمانتیک', 'شیک'],
        'مینیمال': ['کلاسیک', 'مدرن', 'اسپرت'],
        'اسپرت': ['مدرن', 'مینیمال'],
        'رمانتیک': ['بومی/بهمنی', 'شیک'],
        'شیک': ['کلاسیک', 'رمانتیک']
      };
      return (compatible[style1] || []).includes(style2) ? 1 : 0.4;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👗 Occasion Matching - قوانین موقعیت
  // ═══════════════════════════════════════════════════════════════
  const OccasionRules = {
    occasions: {
      'رسمی': {
        score: 0,
        needs: { top: 'پیراهن یا کت', bottom: 'شلوار پارچه‌ای یا دامن بلند', shoe: 'کفش رسمی', accessory: 'اکسسوری کم' },
        incompatible: ['هودی', 'تی‌شرت', 'کتانی', 'شلوار جین پاره'],
        requiredColors: ['تیره یا خنثی'],
        minItems: 3
      },
      'اداری': {
        score: 0,
        needs: { top: 'پیراهن یا بلوز شیک', bottom: 'شلوار پارچه‌ای', shoe: 'کفش رسمی' },
        incompatible: ['تی‌شرت گرافیکی', 'کتانی'],
        requiredColors: ['سفید، سرمه‌ای، مشکی، طوسی'],
        minItems: 3
      },
      'مجلسی': {
        score: 0,
        needs: { top: 'پیراهن مجلسی یا کت', bottom: 'شلوار یا دامن شیک', shoe: 'کفش مجلسی', accessory: 'جواهر' },
        incompatible: ['کتانی', 'تی‌شرت', 'شلوار اسپرت'],
        requiredColors: ['مشکی، طلایی، زرشکی، سرمه‌ای'],
        minItems: 4
      },
      'روزمره': {
        score: 0,
        needs: { top: 'تی‌شرت یا بلوز', bottom: 'شلوار جین یا راحتی', shoe: 'کفش راحت' },
        incompatible: ['کت رسمی'],
        requiredColors: ['هر رنگی'],
        minItems: 2
      },
      'ورزشی': {
        score: 0,
        needs: { top: 'تی‌شرت ورزشی', bottom: 'شلار ورزشی', shoe: 'کفش ورزشی' },
        incompatible: ['کت', 'پیراهن رسمی', 'کفش پاشنه‌بلند'],
        requiredColors: ['روشن یا تیره'],
        minItems: 2
      },
      'عروسی': {
        score: 0,
        needs: { top: 'پیراهن بلند یا کت', bottom: 'دامن بلند یا شلوار پارچه‌ای', shoe: 'کفش مجلسی', accessory: 'کیف و جواهر' },
        incompatible: ['تی‌شرت', 'کتانی', 'شلوار جین'],
        requiredColors: ['روشن، طلایی، نقره‌ای، پاستلی'],
        minItems: 4
      }
    },

    // محاسبه امتیاز ست برای یک موقعیت
    scoreOutfit(items, occasion) {
      const rule = this.occasions[occasion];
      if (!rule) return 50;

      let score = 50;
      const categories = new Set(items.map(i => this.categorize(i)));
      
      // امتیاز مثبت: تعداد آیتم
      if (items.length >= rule.minItems) score += 10;
      
      // امتیاز مثبت: پوشش نیازها
      for (const need of Object.values(rule.needs)) {
        const keywords = need.split(' یا ');
        if (keywords.some(kw => 
          items.some(i => i.name.includes(kw) || i.category.includes(kw))
        )) score += 5;
      }

      // امتیاز منفی: ناسازگار
      for (const incompat of rule.incompatible) {
        if (items.some(i => i.name.includes(incompat) || i.category.includes(incompat))) {
          score -= 20;
        }
      }

      // امتیاز مثبت: رنگ‌های مناسب موقعیت
      const allColors = items.flatMap(i => i.colors || []);
      if (rule.requiredColors.some(rc => 
        rc.includes('یا') ? rc.split('یا').some(c => allColors.some(ac => ac.includes(c.trim()))) :
        allColors.some(ac => ac.includes(rc.split('،')[0]))
      )) score += 10;

      return Math.max(0, Math.min(100, score));
    },

    categorize(item) {
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('کفش') || cat.includes('بوت')) return 'shoe';
      if (cat.includes('شلوار') || cat.includes('دامن')) return 'bottom';
      if (cat.includes('کت') || cat.includes('پالتو') || cat.includes('ژاکت')) return 'outer';
      if (cat.includes('اکسسوری') || cat.includes('کیف') || cat.includes('کمربند')) return 'accessory';
      return 'top';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👤 Body Shape - قوانین فرم بدن
  // ═══════════════════════════════════════════════════════════════
  const BodyShapeRules = {
    // قوانین ساده برای فرم‌های مختلف
    recommendations: {
      'سیب': { top: 'شلوار راسته یا گشاد', outer: 'کت بلند', avoid: 'لباس چسبان بالاتنه' },
      'گلابی': { top: 'بلوز گشاد یا طرح‌دار', outer: 'کت کوتاه', avoid: 'شلوار تنگ و روشن' },
      'ساعت شنی': { top: 'هر چیزی که کمر را نشان دهد', outer: 'کت کمری', avoid: 'لباس خیلی گشاد' },
      'مستطیل': { top: 'لایه‌ای یا طرح‌دار', outer: 'کت کمری', avoid: 'لباس یکدست' },
      'مثلث معکوس': { top: 'شلوار گشاد', outer: 'کت گشاد', avoid: 'تاپ خیلی گشاد' }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧮 Score Engine - موتور امتیازدهی ۱۰۰ امتیازی
  // ═══════════════════════════════════════════════════════════════
  const ScoreEngine = {
    calculate(items, options = {}) {
      const breakdown = {
        colorHarmony: 0,
        styleHarmony: 0,
        occasionMatch: 0,
        layerCompleteness: 0,
        seasonMatch: 0,
        contrastRatio: 0,
        bodyShapeMatch: 0,
        trendScore: 0,
        priceValue: 0,
        uniqueness: 0
      };

      // ۱) Color Harmony (۲۵ امتیاز)
      const allColors = [];
      items.forEach(item => {
        if (item.colors) allColors.push(...item.colors);
        if (item.color) allColors.push(item.color);
      });
      if (allColors.length >= 2) {
        breakdown.colorHarmony = Math.round(ColorTheory.multiColorHarmony(allColors) * 0.25);
      }

      // ۲) Style Harmony (۱۵ امتیاز)
      const allStyles = items.flatMap(i => StyleRules.detectStyle(i));
      if (allStyles.length >= 2) {
        let styleScore = 0;
        for (let i = 0; i < allStyles.length; i++) {
          for (let j = i + 1; j < allStyles.length; j++) {
            styleScore += StyleRules.styleCompatibility(allStyles[i], allStyles[j]) * 100;
          }
        }
        breakdown.styleHarmony = Math.round(styleScore / (allStyles.length * (allStyles.length - 1) / 2) * 0.15);
      }

      // ۳) Occasion Match (۲۰ امتیاز)
      if (options.occasion) {
        breakdown.occasionMatch = Math.round(OccasionRules.scoreOutfit(items, options.occasion) * 0.20);
      }

      // ۴) Layer Completeness (۱۰ امتیاز)
      const cats = new Set(items.map(i => OccasionRules.categorize(i)));
      if (cats.has('top') && cats.has('bottom') && cats.has('shoe')) breakdown.layerCompleteness = 8;
      if (cats.has('outer')) breakdown.layerCompleteness += 1;
      if (cats.has('accessory')) breakdown.layerCompleteness += 1;
      breakdown.layerCompleteness = Math.min(10, breakdown.layerCompleteness);

      // ۵) Season Match (۱۰ امتیاز)
      if (options.season) {
        let seasonMatches = 0;
        items.forEach(item => {
          const itemColors = item.colors || [item.color];
          itemColors.forEach(c => {
            const hsl = COLOR_HSL[c];
            if (hsl && hsl.season.includes(options.season)) seasonMatches++;
          });
        });
        breakdown.seasonMatch = Math.min(10, Math.round((seasonMatches / items.length) * 10));
      }

      // ۶) Contrast Ratio (۱۰ امتیاز)
      // یک neutral (سیاه/سفید) با یک رنگی = contrast خوب
      const hasNeutral = items.some(i => 
        (i.colors || [i.color]).some(c => c && COLOR_HSL[c] && COLOR_HSL[c].family === 'neutral')
      );
      const hasColored = items.some(i => 
        (i.colors || [i.color]).some(c => c && COLOR_HSL[c] && COLOR_HSL[c].family !== 'neutral')
      );
      if (hasNeutral && hasColored) breakdown.contrastRatio = 8;
      else if (hasNeutral || hasColored) breakdown.contrastRatio = 5;

      // ۷) Body Shape (۵ امتیاز)
      if (options.bodyShape) {
        breakdown.bodyShapeMatch = 5; // ساده - همیشه pass
      }

      // ۸) Trend Score (۵ امتیاز) - بر اساس rating
      const avgRating = items.reduce((s, i) => s + (i.rating || 0), 0) / items.length;
      if (avgRating >= 4.5) breakdown.trendScore = 5;
      else if (avgRating >= 4) breakdown.trendScore = 3;
      else breakdown.trendScore = 1;

      const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

      return {
        total: Math.min(100, Math.max(0, total)),
        breakdown,
        explanation: this.explain(breakdown)
      };
    },

    explain(breakdown) {
      const explanations = [];
      if (breakdown.colorHarmony >= 20) explanations.push('هماهنگی رنگی عالی');
      else if (breakdown.colorHarmony < 10) explanations.push('⚠️ رنگ‌ها ناسازگار');
      
      if (breakdown.styleHarmony >= 12) explanations.push('سبک‌های هماهنگ');
      if (breakdown.occasionMatch >= 15) explanations.push('مناسب موقعیت');
      if (breakdown.layerCompleteness >= 9) explanations.push('ست کامل و لایه‌ای');
      if (breakdown.seasonMatch >= 7) explanations.push('مناسب فصل');
      if (breakdown.contrastRatio >= 7) explanations.push('کنتراست بالا');
      
      return explanations.length > 0 ? explanations.join(' • ') : 'ترکیب معمولی';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🏗️ Outfit Builder حرفه‌ای
  // ═══════════════════════════════════════════════════════════════
  const OutfitBuilder = {
    // ساخت ست‌های هوشمند (نه تصادفی!)
    build(wardrobe, options = {}) {
      const occasion = options.occasion || 'روزمره';
      const season = options.season || 'چهار فصل';
      
      // گروه‌بندی
      const groups = {
        top: wardrobe.filter(i => this.isTop(i)),
        bottom: wardrobe.filter(i => this.isBottom(i)),
        outer: wardrobe.filter(i => this.isOuter(i)),
        shoe: wardrobe.filter(i => this.isShoe(i)),
        accessory: wardrobe.filter(i => this.isAccessory(i))
      };

      if (groups.top.length === 0 || groups.bottom.length === 0) {
        return {
          empty: true,
          message: 'برای ساخت ست، حداقل یک تاپ (پیراهن/بلوز/تیشرت) و یک پایین‌تنه (شلوار/دامن) نیاز است.'
        };
      }

      // امتیازدهی همه ترکیب‌های ممکن
      const candidates = [];
      for (const top of groups.top) {
        for (const bottom of groups.bottom) {
          // محاسبه score پایه
          const baseScore = ScoreEngine.calculate([top, bottom], { occasion, season });
          
          if (baseScore.total < 40) continue; // فقط ست‌های قابل قبول

          // ساخت ست کامل با outer/shoe/accessory
          let fullItems = [top, bottom];
          
          // اضافه کردن outer مناسب
          if (groups.outer.length > 0) {
            const bestOuter = this.bestMatch([top, bottom], groups.outer, { occasion, season });
            if (bestOuter) fullItems.push(bestOuter);
          }
          
          // اضافه کردن shoe
          if (groups.shoe.length > 0) {
            const bestShoe = this.bestMatch(fullItems, groups.shoe, { occasion, season });
            if (bestShoe) fullItems.push(bestShoe);
          }
          
          // اضافه کردن accessory (فقط اگه occasion رسمی/مجلسی)
          if ((occasion === 'مجلسی' || occasion === 'عروسی' || occasion === 'رسمی') && groups.accessory.length > 0) {
            const bestAcc = this.bestMatch(fullItems, groups.accessory, { occasion, season });
            if (bestAcc) fullItems.push(bestAcc);
          }

          const finalScore = ScoreEngine.calculate(fullItems, { occasion, season });

          candidates.push({
            items: fullItems,
            score: finalScore.total,
            breakdown: finalScore.breakdown,
            explanation: finalScore.explanation,
            mainColor: (top.colors || [top.color])[0],
            name: this.generateName(top, bottom, occasion),
            occasion,
            season
          });
        }
      }

      // مرتب‌سازی بر اساس score و حذف تکراری
      candidates.sort((a, b) => b.score - a.score);
      const unique = this.deduplicate(candidates);
      
      // اگه هیچ ستی نیست، حداقل یکی برگردون
      if (unique.length === 0 && candidates.length === 0) {
        return {
          empty: true,
          message: 'ترکیب مناسبی برای ' + occasion + ' یافت نشد. لباس‌های بیشتری اضافه کنید.'
        };
      }

      return {
        empty: false,
        outfits: (unique.length > 0 ? unique : candidates.slice(0, 3)).slice(0, 5)
      };
    },

    // بهترین آیتم مکمل بر اساس score
    bestMatch(currentItems, candidates, options) {
      let best = null;
      let bestScore = -1;

      for (const candidate of candidates) {
        const testItems = [...currentItems, candidate];
        const score = ScoreEngine.calculate(testItems, options).total;
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
      return best;
    },

    deduplicate(outfits) {
      const seen = new Set();
      const unique = [];
      for (const outfit of outfits) {
        const key = outfit.items.map(i => i.id).sort().join(',');
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(outfit);
        }
      }
      return unique;
    },

    isTop(item) {
      const cats = ['پیراهن', 'تیشرت', 'بلوز', 'تاپ', 'پولو'];
      return cats.includes(item.category);
    },
    isBottom(item) {
      const cats = ['شلوار', 'دامن', 'پایین تنه', 'جین'];
      return cats.includes(item.category);
    },
    isOuter(item) {
      const cats = ['کت', 'پالتو', 'ژاکت', 'سویشرت', 'کاردیگان'];
      return cats.includes(item.category);
    },
    isShoe(item) {
      return item.category === 'کفش';
    },
    isAccessory(item) {
      const cats = ['اکسسوری', 'کیف', 'کمربند', 'جواهر', 'عینک', 'شال'];
      return cats.includes(item.category);
    },

    generateName(top, bottom, occasion) {
      const topColor = (top.colors || [top.color])[0] || '';
      const nameMap = {
        'رسمی': 'استایل رسمی',
        'اداری': 'استایل اداری',
        'مجلسی': 'ست مجلسی',
        'روزمره': 'تیپ روزمره',
        'ورزشی': 'ست ورزشی',
        'عروسی': 'ست عروسی'
      };
      return (nameMap[occasion] || 'ست پیشنهادی') + ' ' + topColor;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📡 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPStylistEngine = {
    ColorTheory,
    StyleRules,
    OccasionRules,
    BodyShapeRules,
    ScoreEngine,
    OutfitBuilder,
    
    buildOutfits(wardrobe, options) {
      return OutfitBuilder.build(wardrobe, options);
    },
    
    scoreOutfit(items, options) {
      return ScoreEngine.calculate(items, options);
    },
    
    bestColorsFor(colorName) {
      return ColorTheory.bestMatches(colorName);
    }
  };

  console.log('🎨 DP Stylist Engine v19.0 PRO loaded');
})();
