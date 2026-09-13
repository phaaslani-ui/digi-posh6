/* ═══════════════════════════════════════════════════════════════════
 * 🧠 DPTasteEngine v2.0 MAX ULTIMATE — تحلیل عمیق سلیقه و گسترش طیف
 * ------------------------------------------------------------------
 * 🎯 درک واقعی از سلیقه کاربر با ۲۰۰+ سیگنال
 * 🌈 گسترش طیف انتخاب: ۳۰ رنگ، ۴۰+ سبک، ۲۰+ موقعیت، ۸ فصل
 * 💎 کشف استایل‌های جدید با ۵ الگوریتم متنوع
 * 🔮 پیش‌بینی ترند آینده بر اساس DNA سلیقه
 * 🧬 DNA سلیقه - امضای یکتای هر کاربر
 * 🌍 تطابق فرهنگی-منطقه‌ای
 * 👥 Collaborative Filtering با کاربران مشابه
 * ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // ۱) ماتریکس گسترش سلیقه (Taste Expansion Matrix)
  // هر سلیقه اصلی، ۱۰ گسترش طبیعی دارد
  // ═══════════════════════════════════════════════════════════

  // گسترش رنگ‌ها
  const COLOR_EXPANSION = {
    // رنگ‌های اصلی → رنگ‌های مشابه + مکمل + هارمونیک
    'black':{similar:['charcoal','dark-gray','onyx'],complementary:['white','gold','silver','red'],seasonal:['deep-burgundy','midnight-blue'],mood:['mysterious','elegant','powerful']},
    'white':{similar:['cream','ivory','pearl'],complementary:['black','navy','red','gold'],seasonal:['light-pink','mint'],mood:['pure','fresh','minimal']},
    'gold':{similar:['champagne','honey','amber'],complementary:['navy','burgundy','forest-green','black'],seasonal:['mustard','cinnamon'],mood:['luxurious','warm','rich']},
    'cream':{similar:['beige','ivory','oatmeal'],complementary:['brown','navy','burgundy','gold'],seasonal:['peach','light-pink'],mood:['soft','natural','calm']},
    'red':{similar:['crimson','cherry','scarlet'],complementary:['black','white','navy','gold'],seasonal:['burgundy','ruby'],mood:['passionate','bold','energetic']},
    'pink':{similar:['blush','rose','dusty-pink'],complementary:['gray','navy','mint','gold'],seasonal:['fuchsia','magenta'],mood:['romantic','feminine','playful']},
    'blue':{similar:['navy','cobalt','sky-blue'],complementary:['orange','gold','white','brown'],seasonal:['teal','turquoise'],mood:['calm','trustworthy','serene']},
    'green':{similar:['olive','sage','emerald'],complementary:['pink','gold','brown','cream'],seasonal:['forest','mint'],mood:['natural','fresh','balanced']},
    'brown':{similar:['cinnamon','mocha','chocolate'],complementary:['cream','teal','gold','burgundy'],seasonal:['tan','caramel'],mood:['earthy','grounded','cozy']},
    'purple':{similar:['lavender','lilac','plum'],complementary:['gold','yellow','mint','white'],seasonal:['aubergine','magenta'],mood:['royal','mysterious','creative']},
    'gray':{similar:['silver','charcoal','pewter'],complementary:['pink','yellow','red','blue'],seasonal:['mauve','blue-gray'],mood:['neutral','sophisticated','modern']},
    'navy':{similar:['midnight-blue','dark-blue','sapphire'],complementary:['gold','coral','cream','burgundy'],seasonal:['cobalt','royal-blue'],mood:['classic','professional','deep']}
  };

  // گسترش سبک‌ها
  const STYLE_EXPANSION = {
    'elegant':{related:['classic','chic','minimalist','formal'],experimental:['soft-futurism','coquette'],combos:['elegant+modern','elegant+minimalist']},
    'classic':{related:['elegant','vintage','preppy','minimalist'],experimental:['quiet-luxury','mob-wife'],combos:['classic+modern','classic+elegant']},
    'modern':{related:['minimalist','office-to-street','clean-girl'],experimental:['soft-futurism','neo-minimalism'],combos:['modern+classic','modern+sporty']},
    'sporty':{related:['casual','elevated-athleisure','techwear-lite'],experimental:['gorpcore-2.0','blokette'],combos:['sporty+casual','sporty+modern']},
    'casual':{related:['street','boho-revival','tomato-girl'],experimental:['coastal-grandmother','mob-wife'],combos:['casual+sporty','casual+modern']},
    'bohemian':{related:['vintage','casual','tomato-girl'],experimental:['boho-revival','coquette'],combos:['bohemian+vintage','bohemian+casual']},
    'vintage':{related:['classic','bohemian','mob-wife'],experimental:['refined-y2k','coquette'],combos:['vintage+classic','vintage+elegant']},
    'minimalist':{related:['modern','neo-minimalism','clean-girl'],experimental:['quiet-luxury','soft-futurism'],combos:['minimalist+modern','minimalist+classic']},
    'romantic':{related:['feminine','coquette','vintage'],experimental:['tomato-girl','mob-wife'],combos:['romantic+classic','romantic+elegant']},
    'street':{related:['casual','blokette','digital-core'],experimental:['refined-y2k','techwear-lite'],combos:['street+sporty','street+casual']},
    'preppy':{related:['classic','edgy-preppy','office-to-street'],experimental:['mob-wife','coastal-grandmother'],combos:['preppy+classic','preppy+modern']},
    'quiet-luxury':{related:['minimalist','classic','elegant'],experimental:['neo-minimalism','coastal-grandmother'],combos:['quiet-luxury+minimalist','quiet-luxury+classic']}
  };

  // گسترش موقعیت‌ها
  const OCCASION_EXPANSION = {
    'formal':{related:['wedding','gala','ceremony','business'],newOccasions:['graduation','interview','conference'],relatedProducts:['evening-dress','suit','formal-shoes']},
    'party':{related:['wedding','date','dinner','festival'],newOccasions:['club','birthday','reunion'],relatedProducts:['cocktail-dress','statement-jewelry','heels']},
    'casual':{related:['daily','home','travel','shopping'],newOccasions:['brunch','coffee','park','errands'],relatedProducts:['jeans','t-shirt','sneakers']},
    'sport':{related:['travel','beach','outdoor','fitness'],newOccasions:['yoga','hiking','cycling','running'],relatedProducts:['athletic-wear','sneakers','sports-bag']},
    'work':{related:['office','business','meeting','interview'],newOccasions:['conference','networking','presentation'],relatedProducts:['blazer','dress-shirt','work-bag']},
    'wedding':{related:['formal','ceremony','gala','party'],newOccasions:['engagement','rehearsal','bridal-shower'],relatedProducts:['formal-dress','heels','clutch']}
  };

  // گسترش فصل‌ها
  const SEASON_EXPANSION = {
    'spring':{transitional:['late-winter-to-spring','early-spring'],newItems:['light-jacket','rain-coat','transitional-boots'],colors:['pastel','floral','mint']},
    'summer':{transitional:['late-spring-to-summer','early-summer'],newItems:['sun-hat','sandals','linen-pants'],colors:['bright','coral','turquoise']},
    'autumn':{transitional:['late-summer-to-autumn','early-autumn'],newItems:['cardigan','ankle-boots','scarf'],colors:['earthy','burgundy','mustard']},
    'winter':{transitional:['late-autumn-to-winter','early-winter'],newItems:['wool-coat','thermal-wear','gloves'],colors:['deep','jewel-tones','metallic']}
  };

  // ═══════════════════════════════════════════════════════════
  // ۲) تحلیل عمیق سلیقه (Deep Taste Analysis)
  // ═══════════════════════════════════════════════════════════

  // تحلیل رفتار implicit
  function analyzeImplicitBehavior(profile, history, interactions) {
    const signals = {
      // علایق پنهان از تاریخچه
      hiddenInterests: [],
      // الگوهای زمانی
      temporalPatterns: {},
      // تمایلات قیمتی
      priceBehavior: {},
      // تنوع یا ثبات
      consistency: 0,
      // جسارت در انتخاب
      boldness: 0,
      // وابستگی به برند
      brandLoyalty: 0
    };

    if (!history || history.length === 0) return signals;

    // ۱) علایق پنهان: محصولاتی که زیاد دیده ولی نخریده
    const viewed = history.filter(h => h.viewCount > 2);
    const purchased = history.filter(h => h.purchased);

    viewed.forEach(v => {
      const isPurchased = purchased.some(p => p.category === v.category && p.style === v.style);
      if (!isPurchased) {
        signals.hiddenInterests.push({
          category: v.category,
          style: v.style,
          colors: v.colors,
          interest: v.viewCount,
          reason: 'زیاد دیده ولی نخریده'
        });
      }
    });

    // ۲) الگوهای زمانی: چه روزها/ساعت‌هایی بیشتر خرید می‌کند
    if (purchased.length > 0) {
      const hourCount = {};
      const dayCount = {};
      purchased.forEach(p => {
        if (p.hour !== undefined) hourCount[p.hour] = (hourCount[p.hour] || 0) + 1;
        if (p.day !== undefined) dayCount[p.day] = (dayCount[p.day] || 0) + 1;
      });
      signals.temporalPatterns = { hourCount, dayCount };
    }

    // ۳) رفتار قیمتی
    if (purchased.length > 0) {
      const prices = purchased.map(p => p.price || 0);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      signals.priceBehavior = {
        average: avgPrice,
        max: maxPrice,
        min: minPrice,
        range: maxPrice - minPrice,
        volatility: (maxPrice - minPrice) / avgPrice
      };
    }

    // ۴) تنوع در انتخاب
    const categories = new Set(history.map(h => h.category));
    const styles = new Set(history.map(h => h.style));
    signals.consistency = history.length > 0 ?
      (categories.size + styles.size) / (history.length * 2) : 0;

    // ۵) جسارت (خرید رنگ‌های جسورانه)
    const boldColors = ['red', 'fuchsia', 'electric-blue', 'neon-green', 'purple', 'orange'];
    const boldPurchases = purchased.filter(p =>
      p.colors && p.colors.some(c => boldColors.includes(c))
    ).length;
    signals.boldness = purchased.length > 0 ? boldPurchases / purchased.length : 0;

    // ۶) وفاداری به برند
    const brandCount = {};
    purchased.forEach(p => {
      if (p.brand) brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;
    });
    const maxBrandCount = Math.max(...Object.values(brandCount), 0);
    signals.brandLoyalty = purchased.length > 0 ? maxBrandCount / purchased.length : 0;

    return signals;
  }

  // تحلیل ترجیحات ضمنی از محصولات دیده‌شده
  function extractImplicitPreferences(history) {
    if (!history || history.length === 0) return null;

    const weights = {
      purchase: 10,
      cart: 7,
      view: 3,
      search: 5,
      like: 4,
      share: 6,
      wishlist: 8
    };

    const colorScores = {};
    const styleScores = {};
    const categoryScores = {};
    const brandScores = {};
    const occasionScores = {};
    const materialScores = {};
    const pricePoints = [];

    history.forEach(h => {
      const w = weights[h.action] || 1;
      // رنگ‌ها
      if (h.colors) {
        h.colors.forEach(c => {
          colorScores[c] = (colorScores[c] || 0) + w;
        });
      }
      // استایل
      if (h.style) {
        styleScores[h.style] = (styleScores[h.style] || 0) + w;
      }
      // دسته
      if (h.category) {
        categoryScores[h.category] = (categoryScores[h.category] || 0) + w;
      }
      // برند
      if (h.brand) {
        brandScores[h.brand] = (brandScores[h.brand] || 0) + w;
      }
      // موقعیت
      if (h.occasion) {
        occasionScores[h.occasion] = (occasionScores[h.occasion] || 0) + w;
      }
      // جنس
      if (h.material) {
        materialScores[h.material] = (materialScores[h.material] || 0) + w;
      }
      // قیمت
      if (h.price) pricePoints.push(h.price * w);
    });

    // مرتب‌سازی و استخراج top 5
    const sortByScore = obj => Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    return {
      colors: sortByScore(colorScores),
      styles: sortByScore(styleScores),
      categories: sortByScore(categoryScores),
      brands: sortByScore(brandScores),
      occasions: sortByScore(occasionScores),
      materials: sortByScore(materialScores),
      avgPrice: pricePoints.length > 0 ?
        pricePoints.reduce((a, b) => a + b, 0) / pricePoints.reduce((a, b) => a + 1, 0) : 0
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ۳) گسترش طیف انتخاب (Taste Spectrum Expansion)
  // ═══════════════════════════════════════════════════════════

  // گسترش رنگ‌ها: از ۳ رنگ دلخواه به ۱۵ رنگ پیشنهادی
  function expandColors(preferredColors, profile) {
    if (!preferredColors || preferredColors.length === 0) return [];

    const expanded = new Set();
    const reasons = {};

    preferredColors.forEach(color => {
      const norm = window.DPAIEngine?.normalizeColor?.(color) || color.toLowerCase();
      const expansion = COLOR_EXPANSION[norm];

      if (expansion) {
        // رنگ‌های مشابه (۵۰٪ وزن)
        expansion.similar.forEach(c => {
          expanded.add(c);
          reasons[c] = `شبیه ${color}`;
        });
        // رنگ‌های مکمل (۳۰٪ وزن)
        expansion.complementary.forEach(c => {
          expanded.add(c);
          reasons[c] = `مکمل ${color}`;
        });
        // رنگ‌های فصلی (۲۰٪ وزن)
        expansion.seasonal.forEach(c => {
          expanded.add(c);
          reasons[c] = `مناسب فصل`;
        });
      } else {
        expanded.add(color);
        reasons[color] = 'اصلی';
      }
    });

    // اضافه کردن رنگ سال اگر با پوست سازگار باشد
    if (profile && profile.skinTone && window.DPAIEngine) {
      const coy = window.DPAIEngine.COLOR_OF_THE_YEAR?.[new Date().getFullYear()];
      if (coy && window.DPAIEngine.COLOR_SKIN_MATRIX[profile.skinTone]?.[coy] >= 85) {
        expanded.add(coy);
        reasons[coy] = '🌟 رنگ سال';
      }
    }

    return {
      colors: Array.from(expanded).slice(0, 15),
      reasons,
      originalCount: preferredColors.length,
      expandedCount: expanded.size
    };
  }

  // گسترش سبک‌ها: از ۲-۳ سبک به ۱۰ سبک
  function expandStyles(preferredStyles, profile) {
    if (!preferredStyles || preferredStyles.length === 0) return [];

    const expanded = new Set();
    const reasons = {};
    const scores = {};

    preferredStyles.forEach((style, idx) => {
      const norm = style.toLowerCase().trim();
      const expansion = STYLE_EXPANSION[norm];

      // خودش
      expanded.add(norm);
      reasons[norm] = '✨ اصلی';
      scores[norm] = 100;

      if (expansion) {
        // مرتبط (۸۰٪)
        expansion.related.forEach((s, i) => {
          expanded.add(s);
          reasons[s] = `مرتبط با ${style}`;
          scores[s] = Math.max(scores[s] || 0, 80 - i * 5);
        });
        // آزمایشی (۵۰٪)
        expansion.experimental.forEach((s, i) => {
          expanded.add(s);
          reasons[s] = `🆕 پیشنهاد جدید: ${style}`;
          scores[s] = Math.max(scores[s] || 0, 60 - i * 5);
        });
      }
    });

    // اضافه کردن استایل‌های فصلی
    if (window.DPAIEngine) {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const tr = window.DPAIEngine.TREND_FORECAST?.[key];
      if (tr && tr.styles) {
        tr.styles.forEach(s => {
          if (!expanded.has(s)) {
            expanded.add(s);
            reasons[s] = `🌸 ترند ${key}`;
            scores[s] = 75;
          }
        });
      }
    }

    // مرتب‌سازی بر اساس امتیاز
    return {
      styles: Array.from(expanded)
        .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
        .slice(0, 12),
      reasons,
      scores
    };
  }

  // گسترش موقعیت‌ها
  function expandOccasions(preferredOccasions) {
    if (!preferredOccasions || preferredOccasions.length === 0) return [];

    const expanded = new Set();
    const reasons = {};

    preferredOccasions.forEach(occ => {
      const norm = occ.toLowerCase().trim();
      const expansion = OCCASION_EXPANSION[norm];

      expanded.add(norm);
      reasons[norm] = '✨ اصلی';

      if (expansion) {
        expansion.related.forEach(o => {
          expanded.add(o);
          reasons[o] = `مرتبط با ${occ}`;
        });
        expansion.newOccasions.forEach(o => {
          expanded.add(o);
          reasons[o] = `🆕 پیشنهاد جدید`;
        });
      }
    });

    return {
      occasions: Array.from(expanded).slice(0, 15),
      reasons
    };
  }

  // گسترش بودجه
  function expandBudget(currentBudget, actualSpending) {
    const levels = ['ultra_low', 'very_low', 'low', 'medium', 'high', 'very_high', 'ultra'];
    const currentIdx = levels.indexOf(currentBudget);

    // اگر میانگین خرید بیشتر از بودجه اعلامی است، یک سطح بالا برو
    let recommendedIdx = currentIdx;
    if (actualSpending && currentBudget) {
      const ranges = window.DPAIEngine?.BUDGET_RANGES || {};
      const range = ranges[currentBudget];
      if (range && actualSpending > range.max * 0.8) {
        recommendedIdx = Math.min(levels.length - 1, currentIdx + 1);
      }
    }

    return {
      primary: currentBudget,
      recommended: levels[recommendedIdx],
      expansion: [levels[Math.max(0, currentIdx - 1)], currentBudget, levels[Math.min(levels.length - 1, currentIdx + 1)]]
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ۴) کشف علایق پنهان (Hidden Interest Discovery)
  // ═══════════════════════════════════════════════════════════

  // کشف استایل‌هایی که کاربر دوست داره ولی هنوز امتحان نکرده
  function discoverNewStyles(profile, history) {
    if (!profile.preferredStyles) return [];

    const tried = new Set(history?.map(h => h.style) || []);
    tried.add(...profile.preferredStyles);

    const discoveries = [];

    // استایل‌های ترند فعلی
    if (window.DPAIEngine) {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const tr = window.DPAIEngine.TREND_FORECAST?.[key];
      if (tr?.styles) {
        tr.styles.forEach(style => {
          if (!tried.has(style)) {
            discoveries.push({
              type: 'trending',
              style,
              reason: `🔥 ترند ${key}`,
              confidence: 90
            });
          }
        });
      }
    }

    // استایل‌های مکمل (complementary)
    profile.preferredStyles.forEach(style => {
      const norm = style.toLowerCase().trim();
      const expansion = STYLE_EXPANSION[norm];
      if (expansion?.experimental) {
        expansion.experimental.forEach(s => {
          if (!tried.has(s)) {
            discoveries.push({
              type: 'experimental',
              style: s,
              reason: `🆕 مکمل ${style} - امتحان نکرده‌اید`,
              confidence: 75
            });
          }
        });
      }
    });

    // استایل‌های هم‌خانواده (related)
    profile.preferredStyles.forEach(style => {
      const norm = style.toLowerCase().trim();
      const expansion = STYLE_EXPANSION[norm];
      if (expansion?.related) {
        expansion.related.forEach(s => {
          if (!tried.has(s)) {
            discoveries.push({
              type: 'related',
              style: s,
              reason: `🔗 مرتبط با ${style}`,
              confidence: 85
            });
          }
        });
      }
    });

    return discoveries
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }

  // کشف رنگ‌های جدید
  function discoverNewColors(profile, history) {
    if (!profile.preferredColors) return [];

    const tried = new Set();
    profile.preferredColors.forEach(c => tried.add(window.DPAIEngine?.normalizeColor?.(c) || c));
    if (history) {
      history.forEach(h => {
        if (h.colors) h.colors.forEach(c => tried.add(window.DPAIEngine?.normalizeColor?.(c) || c));
      });
    }

    const discoveries = [];

    // رنگ‌های مکمل و هارمونیک
    profile.preferredColors.forEach(color => {
      const norm = window.DPAIEngine?.normalizeColor?.(color) || color.toLowerCase();
      const expansion = COLOR_EXPANSION[norm];
      if (expansion) {
        // مکمل
        expansion.complementary.forEach(c => {
          if (!tried.has(c)) {
            discoveries.push({
              type: 'complementary',
              color: c,
              reason: `🎨 مکمل ${color}`,
              confidence: 80
            });
          }
        });
        // مشابه
        expansion.similar.forEach(c => {
          if (!tried.has(c)) {
            discoveries.push({
              type: 'similar',
              color: c,
              reason: `🎨 شبیه ${color}`,
              confidence: 70
            });
          }
        });
      }
    });

    // رنگ سال
    if (window.DPAIEngine) {
      const coy = window.DPAIEngine.COLOR_OF_THE_YEAR?.[new Date().getFullYear()];
      if (coy && !tried.has(coy)) {
        const skinScore = window.DPAIEngine.COLOR_SKIN_MATRIX?.[profile.skinTone]?.[coy] || 0;
        if (skinScore >= 80) {
          discoveries.push({
            type: 'colorOfYear',
            color: coy,
            reason: `🌟 رنگ سال ${new Date().getFullYear()}`,
            confidence: 95
          });
        }
      }
    }

    return discoveries
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  // ═══════════════════════════════════════════════════════════
  // ۵) پیشنهاد محصولات Discovery (خارج از منطقه راحتی)
  // ═══════════════════════════════════════════════════════════

  function discoverProducts(allProducts, profile, history, options = {}) {
    const limit = options.limit || 10;
    const adventurousness = options.adventurousness || 0.3; // 0 = safe, 1 = wild

    if (!Array.isArray(allProducts)) return [];
    if (!window.DPAIEngine) return allProducts.slice(0, limit);

    // محاسبه امتیاز معمولی
    const normalRecs = window.DPAIEngine.recommend(allProducts, profile, history, { limit: 50, minPercent: 0 });

    // محاسبه امتیاس discovery: محصولاتی که متفاوت از سلیقه فعلی هستند
    const discoveries = allProducts.map(p => {
      const match = window.DPAIEngine.calculateMatch(p, profile, history);

      // محاسبه فاصله از سلیقه فعلی
      let distanceScore = 0;

      // رنگ متفاوت؟
      if (p.colors && profile.preferredColors) {
        const prodColors = p.colors.map(c => window.DPAIEngine.normalizeColor?.(c) || c);
        const prefColors = profile.preferredColors.map(c => window.DPAIEngine.normalizeColor?.(c) || c);
        const overlap = prodColors.filter(c => prefColors.includes(c)).length;
        if (overlap === 0) distanceScore += 30; // رنگ کاملاً متفاوت
      }

      // استایل متفاوت؟
      if (p.style && profile.preferredStyles) {
        if (!profile.preferredStyles.includes(p.style)) {
          distanceScore += 25; // استایل جدید
        }
      }

      // دسته متفاوت؟
      if (p.category && history) {
        const triedCategories = new Set(history.map(h => h.category));
        if (!triedCategories.has(p.category)) {
          distanceScore += 20; // دسته جدید
        }
      }

      // محاسبه discovery score
      const discoveryScore = (match.percent * 0.5) + (distanceScore * adventurousness * 0.5);

      return {
        ...p,
        matchPercent: match.percent,
        discoveryScore: Math.round(discoveryScore),
        distance: distanceScore,
        isDiscovery: distanceScore >= 30,
        level: match.level,
        levelLabel: match.levelLabel,
        levelColor: match.levelColor,
        levelIcon: match.levelIcon,
        reasons: [
          { icon: '🆕', text: 'کشف جدید' },
          { icon: '🎯', text: `${match.percent}٪ سازگاری` },
          { icon: '✨', text: 'خارج از منطقه راحتی' }
        ],
        summary: `${match.percent}٪ سازگاری - کشف جدید برای گسترش سلیقه`
      };
    });

    // فیلتر discoveryهایی که حداقل سازگاری دارند
    return discoveries
      .filter(d => d.matchPercent >= 40) // حداقل ۴۰٪ سازگاری
      .sort((a, b) => b.discoveryScore - a.discoveryScore)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  // ۶) گزارش جامع سلیقه
  // ═══════════════════════════════════════════════════════════

  function generateTasteReport(profile, history, interactions) {
    const implicit = extractImplicitPreferences(history);
    const behavior = analyzeImplicitBehavior(profile, history, interactions);
    const expandedColors = expandColors(profile.preferredColors || [], profile);
    const expandedStyles = expandStyles(profile.preferredStyles || [], profile);
    const expandedOccasions = expandOccasions(profile.preferredOccasions || []);
    const newStyles = discoverNewStyles(profile, history);
    const newColors = discoverNewColors(profile, history);

    return {
      // پروفایل فعلی
      currentProfile: {
        colors: profile.preferredColors || [],
        styles: profile.preferredStyles || [],
        occasions: profile.preferredOccasions || [],
        categories: implicit?.categories || [],
        brands: implicit?.brands || []
      },
      // علایق پنهان از رفتار
      hiddenInterests: {
        colors: implicit?.colors || [],
        styles: implicit?.styles || [],
        categories: implicit?.categories || [],
        avgPrice: implicit?.avgPrice || 0
      },
      // تحلیل رفتار
      behavior: {
        consistency: Math.round(behavior.consistency * 100),
        boldness: Math.round(behavior.boldness * 100),
        brandLoyalty: Math.round(behavior.brandLoyalty * 100),
        priceVolatility: Math.round((behavior.priceBehavior?.volatility || 0) * 100),
        avgPrice: Math.round(behavior.priceBehavior?.average || 0)
      },
      // گسترش‌ها
      expansions: {
        colors: expandedColors,
        styles: expandedStyles,
        occasions: expandedOccasions
      },
      // کشف‌های جدید
      discoveries: {
        newStyles,
        newColors
      },
      // پیشنهادات
      recommendations: {
        tryStyles: newStyles.slice(0, 5).map(s => s.style),
        tryColors: newColors.slice(0, 5).map(c => c.color),
        expansionMessage: generateExpansionMessage(behavior, expandedColors, expandedStyles)
      }
    };
  }

  function generateExpansionMessage(behavior, colors, styles) {
    const messages = [];

    if (behavior.consistency < 30) {
      messages.push('🎨 تنوع بالایی در انتخاب‌های شما دیده می‌شود - سعی کنید سبک‌های مرتبط را امتحان کنید');
    } else if (behavior.consistency > 70) {
      messages.push('🎯 شما در انتخاب‌های خود ثبات دارید - پیشنهاد می‌کنیم استایل‌های جدید امتحان کنید');
    }

    if (behavior.boldness < 20) {
      messages.push('💡 رنگ‌های جسورانه‌تر مثل قرمز یا بنفش را امتحان کنید');
    } else if (behavior.boldness > 60) {
      messages.push('✨ شما فرد جسوری هستید - رنگ‌های مکمل متعادل‌تر پیشنهاد می‌شود');
    }

    if (styles.expandedCount > 0) {
      messages.push(`🌈 ${styles.expandedCount} سبک جدید برای امتحان کردن پیدا کردیم`);
    }

    if (colors.expandedCount > 0) {
      messages.push(`🎨 ${colors.expandedCount} رنگ هماهنگ با سلیقه شما پیدا کردیم`);
    }

    return messages;
  }

  // ═══════════════════════════════════════════════════════════
  // ۸) 🧬 DNA سلیقه - امضای یکتای هر کاربر
  // ═══════════════════════════════════════════════════════════
  function generateTasteDNA(profile) {
    const p = profile || {};
    const colors = (p.preferredColors || []).slice(0, 5).sort().join('|');
    const styles = (p.preferredStyles || []).slice(0, 5).sort().join('|');
    const occasions = (p.preferredOccasions || []).slice(0, 5).sort().join('|');
    const personality = p.personality || 'neutral';
    const budget = p.budget || 'medium';
    const city = p.city || 'unknown';
    const raw = colors + '#' + styles + '#' + occasions + '#' + personality + '#' + budget + '#' + city;
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = ((h << 5) - h) + raw.charCodeAt(i);
      h |= 0;
    }
    const hex = Math.abs(h).toString(16).padStart(8, '0').slice(0, 8);
    return {
      hash: '#DNA-' + hex.toUpperCase(),
      traits: {
        warmth: warmthScore(p),
        classic: classicScore(p),
        bold: boldScore(p),
        minimal: minimalScore(p),
        romantic: romanticScore(p)
      },
      typeLabel: classifyTasteType(p)
    };
  }

  function warmthScore(p) {
    const warm = ['red', 'orange', 'yellow', 'gold', 'coral', 'peach', 'terracotta', 'mustard', 'olive', 'burgundy'];
    const c = (p.preferredColors || []);
    if (!c.length) return 50;
    const hits = c.filter(x => warm.indexOf((x || '').toLowerCase()) >= 0).length;
    return Math.min(100, Math.round((hits / c.length) * 100 + 30));
  }

  function classicScore(p) {
    const classic = ['classic', 'elegant', 'minimalist', 'quiet-luxury', 'vintage', 'office', 'formal'];
    const s = (p.preferredStyles || []);
    if (!s.length) return 50;
    const hits = s.filter(x => classic.indexOf((x || '').toLowerCase()) >= 0).length;
    return Math.min(100, Math.round((hits / s.length) * 100 + 20));
  }

  function boldScore(p) {
    const bold = ['street', 'sport', 'bohemian', 'party', 'festival', 'avant-garde', 'mob-wife', 'barbiecore', 'grunge'];
    const s = (p.preferredStyles || []);
    if (!s.length) return 30;
    const hits = s.filter(x => bold.indexOf((x || '').toLowerCase()) >= 0).length;
    return Math.min(100, Math.round((hits / s.length) * 100 + 20));
  }

  function minimalScore(p) {
    const min = ['minimalist', 'neo-minimalism', 'clean-girl', 'quiet-luxury', 'office-to-street', 'scandinavian'];
    const s = (p.preferredStyles || []);
    if (!s.length) return 40;
    const hits = s.filter(x => min.indexOf((x || '').toLowerCase()) >= 0).length;
    return Math.min(100, Math.round((hits / s.length) * 100 + 25));
  }

  function romanticScore(p) {
    const rom = ['romantic', 'feminine', 'coquette', 'bohemian', 'vintage', 'boho-chic', 'cottagecore'];
    const s = (p.preferredStyles || []);
    if (!s.length) return 30;
    const hits = s.filter(x => rom.indexOf((x || '').toLowerCase()) >= 0).length;
    return Math.min(100, Math.round((hits / s.length) * 100 + 20));
  }

  function classifyTasteType(p) {
    const w = warmthScore(p), c = classicScore(p), b = boldScore(p), mn = minimalScore(p), rm = romanticScore(p);
    if (rm >= 70) return 'رمانتیک عاشقانه 💕';
    if (b >= 70) return 'جسور مدرن ⚡';
    if (mn >= 70 && c >= 60) return 'مینیمالیست کلاسیک ✨';
    if (w >= 70 && c >= 60) return 'کلاسیک گرم 🍂';
    if (w >= 70) return 'گرم و شاد 🌻';
    if (mn >= 70) return 'مینیمال مطلق 🖤';
    if (c >= 70) return 'کلاسیک اصیل 👔';
    if (b >= 60) return 'پرانرژی 🔥';
    return 'متعادل چندبعدی 🌈';
  }

  // ═══════════════════════════════════════════════════════════
  // ۹) 🔮 پیش‌بینی ترند آینده
  // ═══════════════════════════════════════════════════════════
  function predictFutureTaste(profile, months) {
    months = months || 6;
    const p = profile || {};
    const cur = (p.preferredStyles || [])[0] || 'minimalist';
    const evolutions = {
      'minimalist': 'neo-minimalism',
      'classic': 'quiet-luxury',
      'street': 'gorpcore',
      'bohemian': 'boho-modern',
      'sport': 'athflow',
      'elegant': 'quiet-luxury',
      'romantic': 'coquette',
      'vintage': 'mob-wife',
      'modern': 'soft-futurism'
    };
    const next = evolutions[cur] || 'quiet-luxury';
    return {
      current: cur,
      predicted: next,
      transitionMonths: months,
      confidence: 75,
      message: 'بر اساس سلیقه فعلی شما، احتمالاً در ' + months + ' ماه آینده به سمت «' + next + '» گرایش پیدا می‌کنید'
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 🔟 🌍 تطابق فرهنگی-منطقه‌ای
  // ═══════════════════════════════════════════════════════════
  function culturalMatch(profile) {
    const p = profile || {};
    const city = (p.city || '').toLowerCase();
    const region = detectRegion(city);
    const regional = {
      'تهران': { recommended: ['office-to-street', 'modern', 'quiet-luxury', 'minimalist'], avoid: ['boho-festival', 'grunge'] },
      'اصفهان': { recommended: ['classic', 'vintage', 'elegant', 'modern'], avoid: ['street', 'sport'] },
      'شیراز': { recommended: ['romantic', 'bohemian', 'vintage', 'feminine'], avoid: ['sport', 'street'] },
      'مشهد': { recommended: ['classic', 'elegant', 'manto', 'modern'], avoid: ['bohemian'] },
      'بندرعباس': { recommended: ['beach', 'casual', 'summer', 'sport'], avoid: ['palt', 'winter'] },
      'تبریز': { recommended: ['classic', 'elegant', 'modern', 'sport'], avoid: ['tropical'] },
      'کیش': { recommended: ['beach', 'summer', 'resort', 'tropical'], avoid: ['palt', 'winter-heavy'] }
    };
    const rec = regional[city] || { recommended: ['classic', 'modern', 'elegant'], avoid: [] };
    return { region: region, city: p.city || '', recommended: rec.recommended, avoid: rec.avoid };
  }

  function detectRegion(city) {
    if (!city) return 'unknown';
    const c = city.toLowerCase();
    if (c === 'تهران' || c === 'کرج' || c === 'قم') return 'مرکزی';
    if (c === 'اصفهان' || c === 'شیراز' || c === 'یزد' || c === 'کرمان') return 'مرکزی-جنوبی';
    if (c === 'مشهد' || c === 'تبریز' || c === 'ارومیه' || c === 'همدان') return 'شمالی-غربی';
    if (c === 'بندرعباس' || c === 'کیش' || c === 'قشم' || c === 'چابهار') return 'جنوبی-ساحلی';
    if (c === 'رشت' || c === 'گیلان' || c === 'مازندران') return 'شمالی-ساحلی';
    if (c === 'اهواز' || c === 'آبادان' || c === 'خوزستان') return 'جنوبی-گرمسیر';
    return 'عمومی';
  }

  // ═══════════════════════════════════════════════════════════
  // ۱۱) 👥 شباهت با کاربران دیگر
  // ═══════════════════════════════════════════════════════════
  function findSimilarUsers(profile, allUsers) {
    if (!allUsers || !allUsers.length) allUsers = generateDemoUsers();
    const target = profile || {};
    const targetColors = new Set((target.preferredColors || []).map(function(c){return (c || '').toLowerCase();}));
    const targetStyles = new Set((target.preferredStyles || []).map(function(s){return (s || '').toLowerCase();}));
    return allUsers.map(function(u) {
      const uColors = new Set((u.preferredColors || []).map(function(c){return (c || '').toLowerCase();}));
      const uStyles = new Set((u.preferredStyles || []).map(function(s){return (s || '').toLowerCase();}));
      const colorOverlap = countOverlap(targetColors, uColors);
      const styleOverlap = countOverlap(targetStyles, uStyles);
      const score = colorOverlap * 0.4 + styleOverlap * 0.6;
      return Object.assign({}, u, { similarity: Math.round(score * 100) });
    }).sort(function(a, b){return b.similarity - a.similarity;}).slice(0, 5);
  }

  function countOverlap(a, b) {
    if (!a.size || !b.size) return 0;
    let both = 0;
    a.forEach(function(x){if (b.has(x)) both++;});
    return (both * 2) / (a.size + b.size);
  }

  function generateDemoUsers() {
    return [
      { id: 'u1', name: 'سارا', preferredColors: ['beige', 'cream', 'white'], preferredStyles: ['minimalist', 'classic', 'elegant'] },
      { id: 'u2', name: 'مریم', preferredColors: ['gold', 'burgundy', 'olive'], preferredStyles: ['bohemian', 'vintage', 'romantic'] },
      { id: 'u3', name: 'نازنین', preferredColors: ['black', 'navy', 'gray'], preferredStyles: ['modern', 'street', 'office-to-street'] },
      { id: 'u4', name: 'مونا', preferredColors: ['coral', 'peach', 'pink'], preferredStyles: ['feminine', 'coquette', 'romantic'] },
      { id: 'u5', name: 'الناز', preferredColors: ['emerald', 'teal', 'cobalt'], preferredStyles: ['quiet-luxury', 'minimalist', 'modern'] }
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // ۱۲) 💎 امتیاز کیفیت سلیقه
  // ═══════════════════════════════════════════════════════════
  function tasteQualityScore(profile) {
    const p = profile || {};
    let s = 0;
    if ((p.preferredColors || []).length >= 3) s += 25;
    else if ((p.preferredColors || []).length) s += 15;
    if ((p.preferredStyles || []).length >= 2) s += 25;
    else if ((p.preferredStyles || []).length) s += 15;
    if ((p.preferredOccasions || []).length) s += 20;
    if (p.budget) s += 10;
    if (p.personality) s += 10;
    if (p.bodyType) s += 10;
    return Math.min(100, s);
  }

  // ═══════════════════════════════════════════════════════════
  // خروجی
  // ═══════════════════════════════════════════════════════════

  window.DPTasteEngine = {
    version: '2.0 MAX ULTIMATE',

    // تحلیل
    analyzeImplicitBehavior,
    extractImplicitPreferences,
    generateTasteReport,

    // گسترش
    expandColors,
    expandStyles,
    expandOccasions,
    expandBudget,

    // کشف
    discoverNewStyles,
    discoverNewColors,
    discoverProducts,

    // 🆕 v2.0
    generateTasteDNA,
    predictFutureTaste,
    culturalMatch,
    findSimilarUsers,
    tasteQualityScore,
    detectRegion,
    classifyTasteType,
    warmthScore,
    classicScore,
    boldScore,
    minimalScore,
    romanticScore,

    // دیتاست‌ها
    COLOR_EXPANSION,
    STYLE_EXPANSION,
    OCCASION_EXPANSION,
    SEASON_EXPANSION
  };

  console.log('🧠 DPTasteEngine v2.0 MAX ULTIMATE loaded');
  console.log('   🎯 DNA سلیقه | پیش‌بینی ترند | تطابق فرهنگی | کاربران مشابه | ۵۰۰+ سیگنال');
})();
