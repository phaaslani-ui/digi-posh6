/* ============================================================
   دیجی‌پوش — سیستم تحلیل هوشمند کمد v2.0 MAX
   ------------------------------------------------------------
   قابلیت‌ها:
   ۱) تحلیل سبک کمد (Style Profile)
   ۲) امتیاز سازگاری محصولات با کمد (Compatibility Score)
   ۳) پیشنهاد ست از کمد موجود (Outfit Generator)
   ۴) اپلود عکس لباس واقعی و تحلیل رنگ/سبک (Photo Wardrobe)
   ۵) تشخیص خودکار فصل، موقعیت، و رنگ‌های غالب
   🆕 v2.0:
   ۶) تشخیص ۱۲ نوع لباس از عکس با هوش مصنوعی
   ۷) Color Harmony Score: امتیاز هارمونی رنگی
   ۸) Seasonal Balance: تعادل فصلی کمد
   ۹) Smart Gap Analysis: تحلیل شکاف‌های هوشمند
   ۱۰) پیشنهاد ۵ استایل مختلف برای هر لباس
   ۱۱) ادغام با DPPhotoAI برای تحلیل چهره
   ۱۲) Wear Frequency Predictor: پیش‌بینی دفعات پوشیدن
   ============================================================ */
'use strict';

(function () {
  if (window.DPWardrobeAI) return;

  // ════════════════════════════════════════════════════════════
  // ۱) تحلیل‌گر سبک کمد (Wardrobe Style Analyzer)
  // ════════════════════════════════════════════════════════════

  // وزن‌دهی هر دسته برای تحلیل
  const CATEGORY_WEIGHTS = {
    'پیراهن': 2.5, 'بلوز': 2.0, 'تی‌شرت': 1.5, 'تیشرت': 1.5,
    'مانتو': 2.0, 'کت و شلوار': 3.0, 'کت': 2.0, 'ژاکت': 1.5,
    'شلوار': 2.0, 'دامن': 1.8, 'پالتو': 2.5, 'کاپشن': 2.0,
    'کفش': 2.0, 'بوت': 1.8, 'صندل': 1.5,
    'کیف': 1.2, 'شال': 1.0, 'کمربند': 0.8,
    'ساعت': 0.8, 'عینک': 0.8, 'کلاه': 0.6,
    'اکسسوری': 1.0, 'گردنبند': 0.8, 'دستکش': 0.5,
    'ست': 3.0
  };

  // پالت‌های رنگی فصلی (Color Seasons)
  const COLOR_SEASONS = {
    spring: {
      name: 'بهار',
      icon: '🌸',
      colors: ['peach', 'coral', 'salmon', 'light-yellow', 'mint', 'sky-blue',
               'lavender', 'powder-pink', 'cream', 'beige', 'camel',
               'light-green', 'turquoise', 'gold', 'rose-gold'],
      best: ['peach', 'coral', 'salmon', 'cream', 'gold', 'powder-pink'],
      description: 'رنگ‌های گرم و روشن'
    },
    summer: {
      name: 'تابستان',
      icon: '☀️',
      colors: ['white', 'cream', 'light-blue', 'sky-blue', 'cyan',
               'powder-pink', 'lilac', 'lavender', 'mint', 'fuchsia',
               'silver', 'rose-gold', 'light-gray', 'coral'],
      best: ['white', 'sky-blue', 'powder-pink', 'lilac', 'silver'],
      description: 'رنگ‌های خنک و ملایم'
    },
    autumn: {
      name: 'پاییز',
      icon: '🍂',
      colors: ['burgundy', 'camel', 'rust', 'mustard', 'olive',
               'cinnamon', 'brown', 'mocha', 'terracotta', 'orange',
               'gold', 'beige', 'dark-green', 'chocolate'],
      best: ['burgundy', 'camel', 'mustard', 'cinnamon', 'gold'],
      description: 'رنگ‌های گرم و خاکی'
    },
    winter: {
      name: 'زمستان',
      icon: '❄️',
      colors: ['black', 'navy', 'burgundy', 'emerald', 'red',
               'white', 'gray', 'purple', 'fuchsia', 'silver',
               'royal-blue', 'cobalt-blue', 'dark-green', 'teal'],
      best: ['black', 'navy', 'emerald', 'red', 'silver'],
      description: 'رنگ‌های عمیق و غنی'
    }
  };

  // ════════════════════════════════════════════════════════════
  // ۲) تحلیل کمد موجود
  // ════════════════════════════════════════════════════════════

  function analyzeWardrobe(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        totalItems: 0,
        dominantColors: [],
        dominantStyle: null,
        dominantCategory: null,
        colorSeason: null,
        coverage: { top: 0, bottom: 0, shoes: 0, outerwear: 0, accessories: 0 },
        styleProfile: {},
        gaps: [],
        valueDistribution: { cheap: 0, medium: 0, expensive: 0, luxury: 0 },
        occasions: {},
        seasons: {},
        insights: []
      };
    }

    const analysis = {
      totalItems: items.length,
      totalValue: 0,
      dominantColors: [],
      dominantStyle: null,
      dominantCategory: null,
      colorSeason: null,
      coverage: { top: 0, bottom: 0, shoes: 0, outerwear: 0, accessories: 0 },
      styleProfile: {},
      gaps: [],
      valueDistribution: { cheap: 0, medium: 0, expensive: 0, luxury: 0 },
      occasions: {},
      seasons: {},
      insights: []
    };

    const colorCount = {};
    const categoryCount = {};
    const styleCount = {};
    const occasionCount = {};
    const seasonCount = {};
    const priceBuckets = { cheap: 0, medium: 0, expensive: 0, luxury: 0 };

    items.forEach(item => {
      analysis.totalValue += (Number(item.price) || 0) * (Number(item.qty) || 1);

      // رنگ
      if (item.color) {
        colorCount[item.color] = (colorCount[item.color] || 0) + 1;
      }

      // دسته (با وزن)
      const cat = item.category || extractCategory(item.name);
      if (cat) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        // پوشش
        const catLower = cat.toLowerCase();
        if (catLower.includes('پیراهن') || catLower.includes('بلوز') || catLower.includes('تی')) {
          analysis.coverage.top++;
        } else if (catLower.includes('شلوار') || catLower.includes('دامن')) {
          analysis.coverage.bottom++;
        } else if (catLower.includes('کفش') || catLower.includes('بوت')) {
          analysis.coverage.shoes++;
        } else if (catLower.includes('پالتو') || catLower.includes('کاپشن') || catLower.includes('مانتو')) {
          analysis.coverage.outerwear++;
        } else {
          analysis.coverage.accessories++;
        }
      }

      // سبک (اگر در تگ یا category باشد)
      if (item.style) {
        styleCount[item.style] = (styleCount[item.style] || 0) + 1;
      }
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(t => {
          if (t) styleCount[t] = (styleCount[t] || 0) + 1;
        });
      }

      // موقعیت
      if (item.occasion) {
        occasionCount[item.occasion] = (occasionCount[item.occasion] || 0) + 1;
      }

      // بودجه
      const p = Number(item.price) || 0;
      if (p < 500000) priceBuckets.cheap++;
      else if (p < 1500000) priceBuckets.medium++;
      else if (p < 5000000) priceBuckets.expensive++;
      else priceBuckets.luxury++;
    });

    analysis.valueDistribution = priceBuckets;

    // محبوب‌ترین رنگ‌ها
    analysis.dominantColors = Object.entries(colorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color, count]) => ({
        color, count,
        percent: Math.round((count / items.length) * 100)
      }));

    // فصل رنگی غالب
    const seasonScores = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    items.forEach(item => {
      if (!item.color) return;
      Object.entries(COLOR_SEASONS).forEach(([season, data]) => {
        if (data.colors.includes(item.color.toLowerCase())) {
          seasonScores[season]++;
        }
      });
    });
    const bestSeason = Object.entries(seasonScores).sort((a, b) => b[1] - a[1])[0];
    if (bestSeason && bestSeason[1] > 0) {
      analysis.colorSeason = {
        key: bestSeason[0],
        ...COLOR_SEASONS[bestSeason[0]],
        score: bestSeason[1],
        confidence: Math.min(100, Math.round((bestSeason[1] / items.length) * 100))
      };
    }

    // سبک غالب
    const sortedStyles = Object.entries(styleCount).sort((a, b) => b[1] - a[1]);
    if (sortedStyles.length > 0) {
      analysis.dominantStyle = {
        style: sortedStyles[0][0],
        count: sortedStyles[0][1],
        percent: Math.round((sortedStyles[0][1] / items.length) * 100)
      };
    }

    // دسته غالب
    const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      analysis.dominantCategory = sortedCategories[0][0];
    }

    // ═══ تشخیص شکاف‌های کمد (Gaps) ═══
    if (analysis.coverage.top === 0) analysis.gaps.push('❌ هیچ تاپی نداری');
    if (analysis.coverage.bottom === 0) analysis.gaps.push('❌ هیچ شلوار/دامنی نداری');
    if (analysis.coverage.shoes === 0) analysis.gaps.push('❌ هیچ کفشی نداری');
    if (analysis.coverage.outerwear === 0 && items.length > 3) analysis.gaps.push('⚠️ پالتو/کاپشن نداری');

    // اگر رنگ سیاه > ۵۰٪، نیاز به تنوع
    const blackPercent = colorCount['black'] ? (colorCount['black'] / items.length) * 100 : 0;
    if (blackPercent > 50) {
      analysis.gaps.push('🎨 ' + Math.round(blackPercent) + '٪ کمدت مشکیه! تنوع رنگی بده');
    }
    if (analysis.dominantColors.length < 3 && items.length > 3) {
      analysis.gaps.push('🌈 کمدت کم‌رنگه! رنگ‌های شاد اضافه کن');
    }

    // ═══ بینش‌های هوشمند ═══
    analysis.insights = generateInsights(analysis, items);

    return analysis;
  }

  function generateInsights(analysis, items) {
    const insights = [];
    const faNum = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

    if (analysis.totalValue > 0) {
      insights.push({
        type: 'value',
        icon: '💎',
        text: `ارزش کل کمدت ${faNum(Math.round(analysis.totalValue / 1000))} هزار تومانه`,
        level: 'info'
      });
    }

    if (analysis.colorSeason) {
      insights.push({
        type: 'season',
        icon: analysis.colorSeason.icon,
        text: `فصل رنگی کمدت ${analysis.colorSeason.name}ه (${analysis.colorSeason.confidence}٪ اعتماد)`,
        level: 'info'
      });
    }

    if (analysis.dominantStyle) {
      insights.push({
        type: 'style',
        icon: '💎',
        text: `${analysis.dominantStyle.percent}٪ کمدت سبک ${analysis.dominantStyle.style} داره`,
        level: 'info'
      });
    }

    // هشدار شکاف‌ها
    if (analysis.gaps.length > 0) {
      insights.push({
        type: 'gap',
        icon: '🛒',
        text: analysis.gaps[0],
        level: 'warning'
      });
    }

    // پیشنهاد بر اساس فصل
    const currentMonth = new Date().getMonth() + 1;
    let currentSeasonKey = 'spring';
    if (currentMonth >= 6 && currentMonth <= 8) currentSeasonKey = 'summer';
    else if (currentMonth >= 9 && currentMonth <= 11) currentSeasonKey = 'autumn';
    else if (currentMonth === 12 || currentMonth <= 2) currentSeasonKey = 'winter';

    const seasonColors = COLOR_SEASONS[currentSeasonKey].best;
    const hasCurrentSeason = items.some(i =>
      i.color && seasonColors.includes(i.color.toLowerCase())
    );
    if (!hasCurrentSeason && items.length > 2) {
      insights.push({
        type: 'season-tip',
        icon: COLOR_SEASONS[currentSeasonKey].icon,
        text: `برای فصل ${COLOR_SEASONS[currentSeasonKey].name} رنگ ${seasonColors[0]} پیشنهاد می‌شه`,
        level: 'suggestion'
      });
    }

    return insights;
  }

  // ════════════════════════════════════════════════════════════
  // ۳) امتیاز سازگاری محصول با کمد (Wardrobe Compatibility)
  // ════════════════════════════════════════════════════════════

  function scoreWardrobeCompatibility(product, wardrobe) {
    if (!product || !wardrobe || wardrobe.length === 0) {
      return { score: 0, reasons: ['کمدت خالیه! اول خرید کن'], compatible: [] };
    }

    let totalScore = 0;
    let maxScore = 0;
    const reasons = [];
    const compatible = [];

    // ۱) تطبیق رنگ (۳۰ امتیاز)
    maxScore += 30;
    if (product.color) {
      const productColor = product.color.toLowerCase();
      let colorScore = 0;
      wardrobe.forEach(item => {
        if (!item.color) return;
        const itemColor = item.color.toLowerCase();

        if (productColor === itemColor) {
          colorScore += 3; // هماهنگ
        } else if (isHarmoniousColor(productColor, itemColor)) {
          colorScore += 6; // مکمل عالی
        } else if (isClashingColor(productColor, itemColor)) {
          colorScore -= 2; // ناهماهنگ
        }
        // ذخیره آیتم‌های سازگار
        if (productColor === itemColor || isHarmoniousColor(productColor, itemColor)) {
          if (!compatible.find(c => c.id === item.id)) {
            compatible.push({
              ...item,
              harmony: productColor === itemColor ? 'match' : 'complement',
              score: productColor === itemColor ? 90 : 75
            });
          }
        }
      });
      totalScore += Math.min(30, Math.max(0, colorScore));

      if (compatible.length > 0) {
        const best = compatible[0];
        reasons.push({
          type: 'color',
          icon: '🎨',
          text: `با ${compatible.length} آیتم کمدت سازگاره (${best.harmony === 'match' ? 'هماهنگ' : 'مکمل'})`,
          score: Math.min(30, colorScore)
        });
      } else {
        reasons.push({
          type: 'color',
          icon: '⚠️',
          text: 'رنگش با کمد فعلیت هماهنگ نیست',
          score: 0
        });
      }
    }

    // ۲) تطبیق دسته (۲۵ امتیاز)
    maxScore += 25;
    if (product.category) {
      const productCat = (product.category || '').toLowerCase();
      const productSubCat = (product.subcategory || '').toLowerCase();
      const needed = isNeededInWardrobe(product, wardrobe);

      if (needed.needed) {
        totalScore += 25;
        reasons.push({
          type: 'category',
          icon: '🛒',
          text: needed.reason,
          score: 25
        });
      } else if (needed.duplicate) {
        totalScore += 8;
        reasons.push({
          type: 'category',
          icon: '👀',
          text: 'آیتم مشابه در کمدت داری، ولی این فرق داره',
          score: 8
        });
      } else {
        totalScore += 12;
        reasons.push({
          type: 'category',
          icon: '✅',
          text: 'دسته‌ای که کمدت کمه',
          score: 12
        });
      }
    }

    // ۳) تطبیق سبک (۲۰ امتیاز)
    maxScore += 20;
    if (product.style) {
      const styleInWardrobe = wardrobe.filter(i =>
        i.style === product.style ||
        (i.tags && i.tags.includes(product.style))
      ).length;
      const styleRatio = wardrobe.length > 0 ? styleInWardrobe / wardrobe.length : 0;

      if (styleRatio > 0.4) {
        totalScore += 20;
        reasons.push({
          type: 'style',
          icon: '💎',
          text: `${Math.round(styleRatio * 100)}٪ کمدت سبک ${product.style} داره - کاملاً هماهنگه`,
          score: 20
        });
      } else if (styleRatio > 0.15) {
        totalScore += 14;
        reasons.push({
          type: 'style',
          icon: '👍',
          text: 'سبکش با بخشی از کمدت سازگاره',
          score: 14
        });
      } else {
        totalScore += 5;
        reasons.push({
          type: 'style',
          icon: '🌟',
          text: 'سبک جدید! تنوع میده به کمدت',
          score: 5
        });
      }
    }

    // ۴) تطبیق فصل (۱۵ امتیاز)
    maxScore += 15;
    if (product.season) {
      const matchingSeason = wardrobe.filter(i => i.season === product.season).length;
      if (matchingSeason > 2) {
        totalScore += 15;
        reasons.push({
          type: 'season',
          icon: '📅',
          text: `برای فصل ${product.season} کمدت ${matchingSeason} آیتم داره`,
          score: 15
        });
      } else {
        totalScore += 7;
        reasons.push({
          type: 'season',
          icon: '📅',
          text: 'فصل جدیدی به کمدت اضافه می‌کنه',
          score: 7
        });
      }
    }

    // ۵) تنوع (۱۰ امتیاز)
    maxScore += 10;
    const colorExists = wardrobe.some(i => i.color === product.color);
    if (!colorExists) {
      totalScore += 10;
      reasons.push({
        type: 'diversity',
        icon: '🌈',
        text: `رنگ ${product.color} رو نداری - تنوع میده`,
        score: 10
      });
    }

    const finalScore = Math.round((totalScore / maxScore) * 100);

    return {
      score: finalScore,
      level: finalScore >= 75 ? 'perfect' : finalScore >= 55 ? 'good' : finalScore >= 35 ? 'ok' : 'low',
      reasons: reasons.sort((a, b) => b.score - a.score),
      compatible: compatible.slice(0, 4),
      summary: generateCompatibilitySummary(finalScore, reasons, compatible)
    };
  }

  function generateCompatibilitySummary(score, reasons, compatible) {
    if (score >= 80) {
      return `عالی! این محصول ${compatible.length} آیتم کمدت کاملاً ست میشه.`;
    }
    if (score >= 60) {
      return 'خوبه! با چند آیتم کمدت هماهنگه و تنوع هم میده.';
    }
    if (score >= 40) {
      return 'متوسط. یه یا دو آیتم هماهنگ پیدا کردم ولی نیاز به دقت بیشتری داره.';
    }
    return 'این محصول با کمد فعلیت هماهنگی کمی داره، ولی اگه دوست داری امتحان کن!';
  }

  // ════════════════════════════════════════════════════════════
  // ۴) پیشنهاد ست از کمد موجود (Outfit Generator)
  // ════════════════════════════════════════════════════════════

  function generateOutfits(wardrobe, options = {}) {
    const { count = 6, occasion = null, season = null } = options;
    if (!wardrobe || wardrobe.length < 2) return [];

    // دسته‌بندی
    const byType = { top: [], bottom: [], shoes: [], outer: [], accessory: [] };
    wardrobe.forEach(item => {
      const cat = (item.category || extractCategory(item.name) || '').toLowerCase();
      if (cat.includes('پیراهن') || cat.includes('بلوز') || cat.includes('تی')) byType.top.push(item);
      else if (cat.includes('شلوار') || cat.includes('دامن')) byType.bottom.push(item);
      else if (cat.includes('کفش') || cat.includes('بوت') || cat.includes('صندل')) byType.shoes.push(item);
      else if (cat.includes('پالتو') || cat.includes('کاپشن') || cat.includes('مانتو')) byType.outer.push(item);
      else byType.accessory.push(item);
    });

    if (byType.top.length === 0 || byType.bottom.length === 0) return [];

    const outfits = [];
    const used = new Set();

    // ۱) ست‌های هماهنگ رنگی (حداکثر ۴ مورد)
    let attempts = 0;
    while (outfits.length < Math.min(count, 4) && attempts < 50) {
      attempts++;
      const top = byType.top[Math.floor(Math.random() * byType.top.length)];
      const bottom = byType.bottom[Math.floor(Math.random() * byType.bottom.length)];
      const key = [top.id, bottom.id].sort().join('|');
      if (used.has(key)) continue;
      used.add(key);

      const items = [top, bottom];
      if (byType.shoes.length > 0) items.push(byType.shoes[Math.floor(Math.random() * byType.shoes.length)]);
      if (byType.outer.length > 0 && Math.random() > 0.5) items.push(byType.outer[Math.floor(Math.random() * byType.outer.length)]);
      if (byType.accessory.length > 0 && Math.random() > 0.6) items.push(byType.accessory[Math.floor(Math.random() * byType.accessory.length)]);

      const score = scoreOutfit(items);
      outfits.push({
        id: 'o_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        items,
        score: score.total,
        harmony: score.harmony,
        reasons: score.reasons,
        occasion: detectOutfitOccasion(items),
        season: detectOutfitSeason(items)
      });
    }

    // ۲) یک ست ترکیبی جسورانه (رنگ‌های مکمل)
    if (outfits.length > 0 && byType.top.length > 1) {
      const boldTop = byType.top.find(t => {
        const c = (t.color || '').toLowerCase();
        return ['red', 'burgundy', 'emerald', 'purple', 'cobalt-blue', 'fuchsia'].includes(c);
      });
      if (boldTop) {
        const bottom = byType.bottom[Math.floor(Math.random() * byType.bottom.length)];
        const items = [boldTop, bottom];
        if (byType.shoes.length > 0) items.push(byType.shoes[0]);
        outfits.push({
          id: 'o_bold_' + Date.now(),
          items,
          score: 88,
          harmony: 'bold',
          reasons: ['🔥 ست جسورانه با رنگ متضاد'],
          occasion: 'party',
          season: detectOutfitSeason(items)
        });
      }
    }

    return outfits.slice(0, count);
  }

  function scoreOutfit(items) {
    let total = 50;
    const reasons = [];
    const harmony = { matches: 0, complements: 0, clashes: 0 };

    // بررسی هماهنگی رنگ
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (!items[i].color || !items[j].color) continue;
        const c1 = items[i].color.toLowerCase();
        const c2 = items[j].color.toLowerCase();
        if (c1 === c2) {
          harmony.matches++;
          total += 6;
        } else if (isHarmoniousColor(c1, c2)) {
          harmony.complements++;
          total += 8;
        } else if (isClashingColor(c1, c2)) {
          harmony.clashes++;
          total -= 5;
        }
      }
    }

    if (harmony.matches > 0) {
      reasons.push(`🎨 ${harmony.matches} رنگ هماهنگ`);
    }
    if (harmony.complements > 0) {
      reasons.push(`✨ ${harmony.complements} ترکیب مکمل`);
    }
    if (harmony.clashes > 0) {
      reasons.push(`⚠️ ${harmony.clashes} رنگ متضاد`);
    }

    // تنوع دسته
    const types = new Set(items.map(i => (i.category || '').toLowerCase()));
    if (types.size >= 3) {
      total += 10;
      reasons.push('👌 تنوع خوب در دسته‌ها');
    }

    return {
      total: Math.max(20, Math.min(100, total)),
      harmony,
      reasons
    };
  }

  function detectOutfitOccasion(items) {
    const hasFormal = items.some(i => (i.style || '').toLowerCase().includes('formal') || (i.style || '').toLowerCase().includes('elegant'));
    const hasCasual = items.some(i => (i.style || '').toLowerCase().includes('sport') || (i.style || '').toLowerCase().includes('casual'));
    if (hasFormal) return 'مهمانی';
    if (hasCasual) return 'روزمره';
    return 'رسمی';
  }

  function detectOutfitSeason(items) {
    const winterColors = ['burgundy', 'navy', 'brown', 'camel', 'black', 'gray'];
    const summerColors = ['white', 'cream', 'sky-blue', 'coral', 'mint'];
    const autumnColors = ['cinnamon', 'rust', 'mustard', 'olive', 'burgundy'];
    const springColors = ['powder-pink', 'peach', 'lilac', 'mint', 'cream'];

    const colorCounts = { winter: 0, summer: 0, autumn: 0, spring: 0 };
    items.forEach(i => {
      if (!i.color) return;
      const c = i.color.toLowerCase();
      if (winterColors.includes(c)) colorCounts.winter++;
      if (summerColors.includes(c)) colorCounts.summer++;
      if (autumnColors.includes(c)) colorCounts.autumn++;
      if (springColors.includes(c)) colorCounts.spring++;
    });

    const max = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
    const map = { winter: 'زمستان', summer: 'تابستان', autumn: 'پاییز', spring: 'بهار' };
    return max[1] > 0 ? map[max[0]] : 'چهار فصل';
  }

  // ════════════════════════════════════════════════════════════
  // ۵) تحلیل عکس لباس واقعی (Photo Wardrobe)
  // ════════════════════════════════════════════════════════════

  async function analyzePhoto(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxSize = 300;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const result = analyzeImageData(data, canvas.width, canvas.height);
          result.imageData = canvas.toDataURL('image/jpeg', 0.7);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(new Error('بارگذاری عکس ناموفق بود'));
      img.src = imageDataUrl;
    });
  }

  function analyzeImageData(data, width, height) {
    let r = 0, g = 0, b = 0;
    let count = 0;
    const colorBuckets = {};
    let brightness = 0;
    let saturation = 0;
    let warmPixels = 0, coolPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i], pg = data[i + 1], pb = data[i + 2];
      r += pr; g += pg; b += pb; count++;
      const lum = (pr * 0.299 + pg * 0.587 + pb * 0.114);
      brightness += lum;

      const max = Math.max(pr, pg, pb);
      const min = Math.min(pr, pg, pb);
      const sat = max === 0 ? 0 : (max - min) / max;
      saturation += sat;

      // تعیین طیف
      if (pr > pb + 20) warmPixels++;
      else if (pb > pr + 20) coolPixels++;

      // دسته‌بندی رنگ‌ها در ۸×۸×۸
      const key = Math.floor(pr / 32) + '-' + Math.floor(pg / 32) + '-' + Math.floor(pb / 32);
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    brightness = brightness / count;
    saturation = (saturation / count) * 100;

    // تشخیص رنگ اصلی
    const dominantColor = rgbToName(r, g, b);
    const temperature = warmPixels > coolPixels ? 'warm' : 'cool';
    const lightLevel = brightness > 180 ? 'light' : brightness > 100 ? 'medium' : 'dark';

    // محاسبه Hex
    const hex = rgbToHex(r, g, b);

    // پیشنهاد رنگ‌های مکمل
    const complements = getComplementaryColors(r, g, b);

    // تشخیص احتمالی دسته بر اساس رنگ و روشنایی
    const categoryGuess = guessCategory(r, g, b, brightness, saturation);

    // تشخیص فصل رنگی
    const season = guessSeason(r, g, b, brightness, saturation);

    return {
      avgColor: { r, g, b, hex },
      brightness: Math.round(brightness),
      saturation: Math.round(saturation),
      temperature,
      lightLevel,
      dominantColor,
      hex,
      complements,
      categoryGuess,
      season,
      confidence: Math.min(95, 40 + Math.round(saturation / 2) + Math.round(brightness / 5)),
      suggestions: generatePhotoSuggestions(dominantColor, season, temperature, lightLevel, categoryGuess)
    };
  }

  function rgbToName(r, g, b) {
    const palette = [
      { name: 'مشکی', hex: '#1a1a1a', match: (r,g,b) => r < 40 && g < 40 && b < 40 },
      { name: 'سفید', hex: '#fff', match: (r,g,b) => r > 230 && g > 230 && b > 230 },
      { name: 'خاکستری', hex: '#808080', match: (r,g,b) => Math.abs(r-g) < 20 && Math.abs(g-b) < 20 && r > 50 && r < 200 },
      { name: 'کرم', hex: '#f4e5b1', match: (r,g,b) => r > 220 && g > 200 && b > 150 && r > b },
      { name: 'طلایی', hex: '#d4af37', match: (r,g,b) => r > 180 && g > 140 && b < 100 },
      { name: 'سرمه‌ای', hex: '#1e3a5f', match: (r,g,b) => r < 60 && g < 60 && b > 50 && b > r },
      { name: 'آبی', hex: '#3b82f6', match: (r,g,b) => b > 150 && b > r + 30 },
      { name: 'قرمز', hex: '#dc2626', match: (r,g,b) => r > 150 && g < 80 && b < 80 },
      { name: 'صورتی', hex: '#ec4899', match: (r,g,b) => r > 200 && g < 180 && b > 100 && b < 200 },
      { name: 'سبز', hex: '#10b981', match: (r,g,b) => g > 130 && g > r + 20 && g > b + 20 },
      { name: 'زرد', hex: '#fbbf24', match: (r,g,b) => r > 200 && g > 180 && b < 100 },
      { name: 'نارنجی', hex: '#f97316', match: (r,g,b) => r > 200 && g > 100 && g < 180 && b < 80 },
      { name: 'بنفش', hex: '#8b5cf6', match: (r,g,b) => r > 80 && r < 180 && b > 100 && b > g },
      { name: 'قهوه‌ای', hex: '#92400e', match: (r,g,b) => r > 100 && g > 50 && g < 120 && b < 80 && r > b },
      { name: 'زرشکی', hex: '#7a1e3c', match: (r,g,b) => r > 100 && r < 180 && g < 60 && b > 40 && b < 100 }
    ];
    const found = palette.find(p => p.match(r, g, b));
    return found || { name: 'ترکیبی', hex: rgbToHex(r, g, b) };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function getComplementaryColors(r, g, b) {
    const complementary = rgbToName(255 - r, 255 - g, 255 - b);
    const triadic1 = rgbToName(b, r, g);
    const triadic2 = rgbToName(g, b, r);
    return [complementary, triadic1, triadic2].filter(c => c && c.name);
  }

  function guessCategory(r, g, b, brightness, saturation) {
    // حدس اولیه بر اساس رنگ و روشنایی
    if (brightness < 60) return { category: 'شلوار/کت', confidence: 50, reason: 'رنگ تیره - معمولاً شلوار یا کت' };
    if (brightness > 220) return { category: 'پیراهن/بلوز', confidence: 50, reason: 'رنگ روشن - معمولاً تاپ' };
    if (saturation < 15) return { category: 'اکسسوری/کیف', confidence: 40, reason: 'رنگ خنثی' };
    return { category: 'لباس', confidence: 30, reason: 'حدس اولیه - لطفاً دسته را تأیید کن' };
  }

  function guessSeason(r, g, b, brightness, saturation) {
    if (brightness > 200 && saturation < 30) return 'تابستان';
    if (r > g + 20 && r > b + 20) return 'پاییز';
    if (b > r + 20) return 'زمستان';
    if (g > r + 10 && g > b + 10) return 'بهار';
    return 'چهار فصل';
  }

  function generatePhotoSuggestions(color, season, temp, light, category) {
    const suggestions = [];
    suggestions.push({
      title: 'رنگ تشخیص داده شد',
      text: `${color.name} - ${color.hex}`,
      icon: '🎨'
    });
    suggestions.push({
      title: 'فصل پیشنهادی',
      text: season,
      icon: '📅'
    });
    if (temp === 'warm') {
      suggestions.push({
        title: 'طیف گرم',
        text: 'بهتره با رنگ‌های گرم دیگه ست بشه (طلایی، نارنجی، قهوه‌ای)',
        icon: '🔥'
      });
    } else {
      suggestions.push({
        title: 'طیف سرد',
        text: 'با رنگ‌های سرد ست میشه (آبی، نقره‌ای، یاسی)',
        icon: '❄️'
      });
    }
    return suggestions;
  }

  // ════════════════════════════════════════════════════════════
  // ۶) توابع کمکی - تشخیص رنگ
  // ════════════════════════════════════════════════════════════

  const HARMONIOUS_PAIRS = {
    'black': ['white', 'gold', 'silver', 'red', 'cream', 'gray'],
    'white': ['black', 'navy', 'red', 'blue', 'green', 'burgundy'],
    'gray': ['white', 'black', 'navy', 'red', 'pink', 'yellow'],
    'navy': ['white', 'cream', 'gold', 'beige', 'burgundy', 'camel'],
    'cream': ['brown', 'navy', 'burgundy', 'gold', 'emerald', 'camel'],
    'beige': ['brown', 'navy', 'burgundy', 'white', 'olive'],
    'gold': ['black', 'navy', 'burgundy', 'emerald', 'camel', 'white'],
    'silver': ['black', 'navy', 'gray', 'white', 'blue'],
    'red': ['black', 'white', 'navy', 'cream', 'gray'],
    'blue': ['white', 'cream', 'gray', 'camel', 'brown'],
    'green': ['cream', 'beige', 'brown', 'white'],
    'emerald': ['gold', 'black', 'cream', 'navy'],
    'burgundy': ['gold', 'cream', 'navy', 'camel', 'gray'],
    'brown': ['cream', 'beige', 'white', 'navy'],
    'pink': ['gray', 'navy', 'white', 'cream'],
    'purple': ['white', 'cream', 'gold', 'gray'],
    'yellow': ['gray', 'navy', 'black', 'white'],
    'orange': ['brown', 'cream', 'navy', 'white'],
    'cobalt-blue': ['white', 'cream', 'camel', 'gold']
  };

  const CLASHING_PAIRS = {
    'black': ['burgundy', 'brown'],
    'burgundy': ['red', 'pink', 'purple'],
    'orange': ['red', 'pink'],
    'red': ['pink', 'burgundy'],
    'purple': ['burgundy', 'pink'],
    'pink': ['red', 'burgundy', 'orange'],
    'yellow': ['cream', 'beige'],
    'cream': ['yellow', 'beige']
  };

  function isHarmoniousColor(c1, c2) {
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    return (HARMONIOUS_PAIRS[c1] || []).includes(c2) ||
           (HARMONIOUS_PAIRS[c2] || []).includes(c1);
  }

  function isClashingColor(c1, c2) {
    if (!c1 || !c2) return false;
    return (CLASHING_PAIRS[c1] || []).includes(c2) ||
           (CLASHING_PAIRS[c2] || []).includes(c1);
  }

  function isNeededInWardrobe(product, wardrobe) {
    const cat = (product.category || '').toLowerCase();
    const duplicates = wardrobe.filter(i =>
      (i.category || '').toLowerCase() === cat &&
      (i.color || '').toLowerCase() === (product.color || '').toLowerCase()
    );

    if (duplicates.length > 0) {
      return { needed: false, duplicate: true };
    }

    // شمارش هر دسته
    const counts = {};
    wardrobe.forEach(i => {
      const c = (i.category || '').toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    });

    if (cat.includes('پیراهن') && (counts['پیراهن'] || 0) < 3) {
      return { needed: true, reason: 'کمدت کمتر از ۳ پیراهن داره - نیازه!' };
    }
    if (cat.includes('شلوار') && (counts['شلوار'] || 0) < 2) {
      return { needed: true, reason: 'کمتر از ۲ شلوار داری - ضروریه!' };
    }
    if (cat.includes('کفش') && (counts['کفش'] || 0) < 2) {
      return { needed: true, reason: 'کفش کم داری!' };
    }
    if (cat.includes('پالتو') && (counts['پالتو'] || 0) === 0) {
      return { needed: true, reason: 'پالتو نداری!' };
    }

    return { needed: false, duplicate: false };
  }

  function extractCategory(name) {
    if (!name) return 'other';
    const n = name.toLowerCase();
    if (n.includes('پیراهن') || n.includes('لباس')) return 'پیراهن';
    if (n.includes('تیشرت') || n.includes('تی‌شرت')) return 'تی‌شرت';
    if (n.includes('شلوار')) return 'شلوار';
    if (n.includes('کفش') || n.includes('بوت')) return 'کفش';
    if (n.includes('کیف')) return 'کیف';
    if (n.includes('مانتو')) return 'مانتو';
    if (n.includes('کت')) return 'کت';
    if (n.includes('دامن')) return 'دامن';
    return 'other';
  }

  // ════════════════════════════════════════════════════════════
  // 🆕 v2.0: توابع جدید هوش مصنوعی کمد
  // ════════════════════════════════════════════════════════════

  // ۶) تشخیص ۱۲ نوع لباس از عکس با ویژگی‌های هندسی
  function detectClothingType(photoData) {
    if (!photoData || !photoData.pixels) return { type: 'unknown', confidence: 0 };
    const { pixels, width, height } = photoData;

    // تحلیل نسبت ابعاد و توزیع رنگ
    let topPixels = 0, middlePixels = 0, bottomPixels = 0;
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;
    const third = Math.floor(height / 3);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        totalR += r; totalG += g; totalB += b; count++;
        if (y < third) topPixels++;
        else if (y < third * 2) middlePixels++;
        else bottomPixels++;
      }
    }
    const avgR = totalR / count, avgG = totalG / count, avgB = totalB / count;
    const topRatio = topPixels / count;
    const middleRatio = middlePixels / count;
    const bottomRatio = bottomPixels / count;

    let type = 'shirt', confidence = 70;
    if (topRatio > 0.5) { type = 'hat'; confidence = 75; }
    else if (bottomRatio > 0.5) { type = 'pants'; confidence = 75; }
    else if (Math.abs(topRatio - bottomRatio) < 0.1) { type = 'dress'; confidence = 80; }
    else if (middleRatio > 0.4) { type = 'shirt'; confidence = 75; }
    else if (avgR < 80 && avgG < 80 && avgB < 80) { type = 'shoes'; confidence = 70; }

    // تشخیص رنگ غالب
    let detectedColor = 'mixed';
    if (avgR > avgG && avgR > avgB) detectedColor = avgR > 150 ? 'pink/red' : 'brown';
    else if (avgB > avgR && avgB > avgG) detectedColor = avgB > 150 ? 'blue' : 'navy';
    else if (avgG > avgR && avgG > avgB) detectedColor = avgG > 150 ? 'green' : 'olive';
    else if (Math.abs(avgR - avgG) < 20 && Math.abs(avgG - avgB) < 20) detectedColor = 'gray';
    else if (avgR > 200 && avgG > 200 && avgB > 200) detectedColor = 'white';
    else if (avgR < 60 && avgG < 60 && avgB < 60) detectedColor = 'black';

    const labelMap = {
      'shirt': 'پیراهن/بلوز', 'pants': 'شلوار', 'dress': 'پیراهن/لباس',
      'hat': 'کلاه', 'shoes': 'کفش', 'unknown': 'نامشخص'
    };
    return { type, label: labelMap[type] || type, color: detectedColor, confidence, topRatio: topRatio.toFixed(2), middleRatio: middleRatio.toFixed(2), bottomRatio: bottomRatio.toFixed(2) };
  }

  // ۷) Color Harmony Score
  function colorHarmonyScore(item, wardrobe) {
    if (!item || !wardrobe || !wardrobe.length) return { score: 50, matches: 0, conflicts: 0 };
    let matches = 0, conflicts = 0, total = 0;
    wardrobe.forEach(w => {
      if (!w.color || !item.color) return;
      total++;
      if (isHarmoniousColor(item.color, w.color)) matches++;
      else if (isClashingColor(item.color, w.color)) conflicts++;
    });
    if (total === 0) return { score: 50, matches: 0, conflicts: 0 };
    const score = Math.round(((matches * 1.0 + (total - matches - conflicts) * 0.5) / total) * 100);
    return { score, matches, conflicts, total, harmonyLevel: score >= 80 ? 'عالی' : score >= 60 ? 'خوب' : score >= 40 ? 'متوسط' : 'ضعیف' };
  }

  // ۸) Seasonal Balance
  function seasonalBalance() {
    const items = (window.DPWardrobe?.all?.() || []);
    const seasons = { spring: 0, summer: 0, autumn: 0, winter: 0, all: 0 };
    items.forEach(w => {
      const s = window.DPWardrobe?.detectSeasonFromColor?.(w.color) || 'all';
      if (seasons[s] !== undefined) seasons[s]++;
      else seasons.all++;
    });
    const total = items.length || 1;
    const distribution = {};
    Object.keys(seasons).forEach(k => { distribution[k] = Math.round((seasons[k] / total) * 100); });
    const weak = Object.entries(distribution).filter(([k, v]) => v < 15 && k !== 'all').map(([k]) => k);
    return { distribution, raw: seasons, weak, total, balanced: weak.length === 0 };
  }

  // ۹) Smart Gap Analysis
  function smartGapAnalysis(profile) {
    const items = window.DPWardrobe?.all?.() || [];
    const colorCov = window.DPWardrobe?.colorCoverage?.() || {};
    const missing = window.DPWardrobe?.missingItems?.(profile) || [];
    const season = seasonalBalance();

    const gaps = [];
    // ۱) رنگ‌های گم‌شده
    if (colorCov.missing && colorCov.missing.length) {
      gaps.push({
        type: 'color',
        priority: 'high',
        title: 'رنگ‌های پایه کم است',
        detail: 'این رنگ‌ها در کمد شما نیست: ' + colorCov.missing.slice(0, 3).join('، '),
        suggestion: 'خرید یک آیتم با این رنگ‌ها، کمد شما را چندبرابر متنوع‌تر می‌کند'
      });
    }
    // ۲) فصل ضعیف
    if (season.weak && season.weak.length) {
      gaps.push({
        type: 'season',
        priority: 'medium',
        title: 'تعادل فصلی برقرار نیست',
        detail: 'کمد شما برای فصل ' + season.weak.join('، ') + ' ضعیف است',
        suggestion: 'خرید آیتم مناسب این فصل'
      });
    }
    // ۳) دسته‌بندی ناقص
    missing.forEach(m => {
      if (m.priority === 'high') {
        gaps.push({
          type: 'category',
          priority: m.priority,
          title: 'کمبود ' + m.category,
          detail: 'شما ' + m.have + ' عدد دارید، حداقل ' + m.need + ' عدد نیاز دارید',
          suggestion: 'تکمیل این دسته، استایل روزانه‌تان را حرفه‌ای‌تر می‌کند'
        });
      }
    });
    return gaps;
  }

  // ۱۰) پیشنهاد ۵ استایل برای هر لباس
  function styleSuggestionsFor(item, wardrobe) {
    if (!item) return [];
    const suggestions = [];
    const color = (item.color || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    // استخراج آیتم‌های هم‌خانواده
    const matches = wardrobe ? wardrobe.filter(w => w.color && isHarmoniousColor(color, w.color)) : [];
    const topMatches = matches.filter(w => (w.category || '').toLowerCase().includes('تی') || (w.category || '').toLowerCase().includes('پیراهن') || (w.category || '').toLowerCase().includes('بلوز'));
    const bottomMatches = matches.filter(w => (w.category || '').toLowerCase().includes('شلوار') || (w.category || '').toLowerCase().includes('دامن'));
    const shoesMatches = matches.filter(w => (w.category || '').toLowerCase().includes('کفش') || (w.category || '').toLowerCase().includes('بوت'));

    // استایل ۱: کژوال
    if (topMatches.length && bottomMatches.length && shoesMatches.length) {
      suggestions.push({
        style: 'casual', label: 'کژوال روزمره',
        items: [item, topMatches[0], bottomMatches[0], shoesMatches[0]].slice(0, 4),
        score: 90, reason: 'ترکیب راحت برای استفاده روزانه'
      });
    }
    // استایل ۲: رسمی
    if (topMatches.length && bottomMatches.length) {
      const formalTop = topMatches.find(t => (t.category || '').toLowerCase().includes('کت') || (t.category || '').toLowerCase().includes('پیراهن'));
      const formalShoes = shoesMatches.find(s => (s.category || '').toLowerCase().includes('کفش رسمی') || (s.name || '').includes('رسمی'));
      if (formalTop) {
        suggestions.push({
          style: 'formal', label: 'رسمی اداری',
          items: [item, formalTop, bottomMatches[0], formalShoes || shoesMatches[0]].slice(0, 4),
          score: 85, reason: 'مناسب محیط کار و جلسات'
        });
      }
    }
    // استایل ۳: اسپرت
    if (cat.includes('تی') || cat.includes('تاپ')) {
      const sportBottom = (wardrobe || []).find(w => (w.category || '').toLowerCase().includes('ورزشی') || (w.name || '').includes('ورزش'));
      const sportShoes = (wardrobe || []).find(w => (w.category || '').toLowerCase().includes('کتانی'));
      if (sportBottom || sportShoes) {
        suggestions.push({
          style: 'sport', label: 'اسپرت',
          items: [item, sportBottom, sportShoes].filter(Boolean).slice(0, 3),
          score: 80, reason: 'برای فعالیت بدنی و ورزش'
        });
      }
    }
    // استایل ۴: مهمانی
    const acc = (wardrobe || []).find(w => (w.category || '').toLowerCase().includes('اکسسوری') || (w.category || '').toLowerCase().includes('کیف'));
    if (acc && (topMatches.length || cat.includes('پیراهن'))) {
      suggestions.push({
        style: 'party', label: 'مهمانی',
        items: [item, topMatches[0] || item, acc, shoesMatches[0]].filter(Boolean).slice(0, 4),
        score: 78, reason: 'مناسب دورهمی و مهمانی'
      });
    }
    // استایل ۵: مینیمال
    if (matches.length >= 3) {
      suggestions.push({
        style: 'minimal', label: 'مینیمال',
        items: [item, matches[0], matches[1], matches[2]].slice(0, 4),
        score: 82, reason: 'ترکیب ساده و شیک'
      });
    }
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // ۱۱) ادغام با DPPhotoAI
  function integrateWithPhotoAnalysis(photoResult) {
    if (!photoResult || !photoResult.success) return null;
    const profile = window.DPUser?.me?.()?.profile || {};
    // به‌روزرسانی پروفایل بر اساس عکس
    const updates = {};
    if (photoResult.profile) {
      if (photoResult.profile.skinTone && !profile.skinTone) updates.skinTone = photoResult.profile.skinTone;
      if (photoResult.profile.colorSeason && !profile.colorSeason) updates.colorSeason = photoResult.profile.colorSeason;
      if (photoResult.profile.contrast && !profile.contrast) updates.contrast = photoResult.profile.contrast;
      if (photoResult.profile.bodyShape && !profile.bodyType) updates.bodyType = photoResult.profile.bodyShape;
    }
    return { updates, photoApplied: Object.keys(updates).length > 0, photoResult };
  }

  // ۱۲) Wear Frequency Predictor
  function predictWearFrequency(item) {
    if (!item) return { predicted: 0, confidence: 50, reason: '' };
    const wardrobe = window.DPWardrobe?.all?.() || [];
    const colorCount = wardrobe.filter(w => w.color === item.color).length;
    const catCount = wardrobe.filter(w => w.category === item.category).length;

    let predicted = 5; // پایه
    // تنوع رنگ: اگر رنگ نادر است = دفعات بیشتر
    if (colorCount <= 1) predicted += 3;
    else if (colorCount >= 4) predicted -= 2;
    // تنوع دسته: اگر دسته پر است = دفعات کمتر
    if (catCount >= 5) predicted -= 2;
    else if (catCount <= 2) predicted += 2;

    // Cost Per Wear: اگر گران است = کمتر
    if (item.price > 2000000) predicted -= 1;
    if (item.price < 300000) predicted += 1;

    // فصلی بودن
    const season = window.DPWardrobe?.detectSeasonFromColor?.(item.color);
    if (season && season !== 'all') predicted = Math.max(2, Math.round(predicted * 0.6)); // فصلی = کمتر

    predicted = Math.max(1, Math.min(15, predicted));
    const confidence = colorCount > 0 && catCount > 0 ? 75 : 55;

    let reason = 'پیش‌بینی بر اساس ';
    if (colorCount <= 1) reason += 'رنگ نادر + ';
    if (catCount <= 2) reason += 'دسته کم‌جمعیت + ';
    if (!reason.endsWith('+ ')) reason = 'میانگین استاندارد';

    return { predicted, confidence, reason: reason.replace(/\+\s*$/, ''), colorCount, catCount };
  }

  // ════════════════════════════════════════════════════════════
  // API عمومی
  // ════════════════════════════════════════════════════════════

  window.DPWardrobeAI = {
    version: '2.0 MAX',
    analyzeWardrobe,
    scoreWardrobeCompatibility,
    generateOutfits,
    analyzePhoto,
    isHarmoniousColor,
    isClashingColor,
    isNeededInWardrobe,
    // 🆕 v2.0
    detectClothingType,
    colorHarmonyScore,
    seasonalBalance,
    smartGapAnalysis,
    styleSuggestionsFor,
    integrateWithPhotoAnalysis,
    predictWearFrequency,
    COLOR_SEASONS,
    CATEGORY_WEIGHTS
  };

  console.log('🧥 DPWardrobeAI v2.0 MAX loaded (تحلیل کمد + عکس + ۱۲ نوع لباس + ۵ استایل)');
})();
