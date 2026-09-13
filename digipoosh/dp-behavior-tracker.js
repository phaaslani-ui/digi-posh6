/**
 * 📊 dp-behavior-tracker.js v1.0 ULTIMATE — ردیابی رفتار کاربر
 * ------------------------------------------------------------------
 * • ثبت ۲۰+ نوع رویداد رفتاری
 * • تحلیل الگوهای خرید، بازدید، علاقه
 * • استخراج سیگنال‌های ضمنی برای AI
 * • محاسبه امتیاز شخصیتی (Big Five + Style)
 * • پروفایل رفتاری real-time
 */

(function() {
  'use strict';
  if (window.DPBehaviorTrackerLoaded) return;
  window.DPBehaviorTrackerLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 💾 State & Storage
  // ═══════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'dp_behavior_v1';
  const MAX_EVENTS = 500; // حداکثر رویداد ذخیره شده
  const MAX_HISTORY_DAYS = 90; // ۹۰ روز

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const state = JSON.parse(raw);
      // پاک کردن رویدادهای قدیمی
      const cutoff = Date.now() - (MAX_HISTORY_DAYS * 86400000);
      state.events = (state.events || []).filter(e => e.ts > cutoff);
      return { ...getDefaultState(), ...state };
    } catch (e) {
      return getDefaultState();
    }
  }

  function saveState(state) {
    try {
      // محدود کردن تعداد رویدادها
      if (state.events.length > MAX_EVENTS) {
        state.events = state.events.slice(-MAX_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getDefaultState() {
    return {
      // رویدادها
      events: [],
      // آمار تجمعی
      stats: {
        // بازدید
        productViews: {},        // { productId: count }
        productViewTime: {},     // { productId: totalSeconds }
        categoryViews: {},       // { category: count }
        colorViews: {},          // { color: count }
        sellerViews: {},         // { seller: count }
        // تعامل
        favorites: [],           // productIds
        cartAdditions: [],       // productIds
        purchases: [],           // productIds
        searches: [],            // queries
        filterUses: {},          // { filterType: count }
        // زمان
        totalSessionTime: 0,
        sessionCount: 0,
        lastActive: null,
        // رفتار خاص
        scrollDepths: {},        // { page: maxDepth }
        hoverDurations: {},      // { productId: ms }
        quickViews: [],          // productIds
        compareList: [],         // productIds
        // زمان‌بندی
        morningActive: 0,        // ۶-۱۲
        afternoonActive: 0,      // ۱۲-۱۸
        eveningActive: 0,        // ۱۸-۲۴
        nightActive: 0,          // ۰-۶
        weekdayActive: 0,
        weekendActive: 0,
      },
      // امتیازات Big Five
      bigFive: {
        openness: 50,           // گشودگی (تجربه جدید)
        conscientiousness: 50,  // وظیفه‌شناسی
        extraversion: 50,       // برون‌گرایی
        agreeableness: 50,      // توافق‌پذیری
        neuroticism: 50,        // روان‌رنجوری
      },
      // امتیازات استایل
      styleScores: {
        classic: 0, elegant: 0, modern: 0, sporty: 0,
        casual: 0, romantic: 0, bohemian: 0, vintage: 0,
        minimalist: 0, glamorous: 0, street: 0, preppy: 0
      },
      // آرکی‌تایپ
      archetypeScores: {},
      // زمان شروع
      startedAt: Date.now(),
    };
  }

  let state = loadState();

  // ═══════════════════════════════════════════════════════════════
  // 🎯 اصلی: ثبت رویداد
  // ═══════════════════════════════════════════════════════════════
  function track(eventType, data) {
    data = data || {};
    const event = {
      type: eventType,
      ts: Date.now(),
      ...data
    };

    // ذخیره رویداد
    state.events.push(event);
    if (state.events.length > MAX_EVENTS) {
      state.events = state.events.slice(-MAX_EVENTS);
    }

    // به‌روزرسانی آمار
    updateStats(event);

    // به‌روزرسانی Big Five
    updateBigFive(event);

    // به‌روزرسانی Style Scores
    updateStyleScores(event);

    // ذخیره
    saveState(state);

    // trigger event برای listenerها
    if (window.dispatchEvent && typeof CustomEvent !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('dp-behavior', { detail: event }));
      } catch (e) {}
    }

    return event;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📈 به‌روزرسانی آمار
  // ═══════════════════════════════════════════════════════════════
  function updateStats(event) {
    const s = state.stats;
    const hour = new Date(event.ts).getHours();
    const day = new Date(event.ts).getDay();
    const isWeekend = day === 5 || day === 6; // جمعه/شنبه

    // زمان‌بندی
    if (hour >= 6 && hour < 12) s.morningActive++;
    else if (hour >= 12 && hour < 18) s.afternoonActive++;
    else if (hour >= 18 && hour < 24) s.eveningActive++;
    else s.nightActive++;

    if (isWeekend) s.weekendActive++;
    else s.weekdayActive++;

    s.lastActive = event.ts;

    // بر اساس نوع رویداد
    switch (event.type) {
      case 'product_view':
        s.productViews[event.productId] = (s.productViews[event.productId] || 0) + 1;
        s.productViewTime[event.productId] = (s.productViewTime[event.productId] || 0) + (event.duration || 0);
        if (event.category) s.categoryViews[event.category] = (s.categoryViews[event.category] || 0) + 1;
        if (event.color) s.colorViews[event.color] = (s.colorViews[event.color] || 0) + 1;
        if (event.seller) s.sellerViews[event.seller] = (s.sellerViews[event.seller] || 0) + 1;
        break;

      case 'product_quickview':
        if (!s.quickViews.includes(event.productId)) s.quickViews.push(event.productId);
        break;

      case 'favorite_add':
        if (event.productId && !s.favorites.includes(event.productId)) s.favorites.push(event.productId);
        break;

      case 'favorite_remove':
        s.favorites = s.favorites.filter(id => id !== event.productId);
        break;

      case 'cart_add':
        if (event.productId && !s.cartAdditions.includes(event.productId)) s.cartAdditions.push(event.productId);
        break;

      case 'cart_remove':
        s.cartAdditions = s.cartAdditions.filter(id => id !== event.productId);
        break;

      case 'purchase':
        if (event.productId) s.purchases.push(event.productId);
        break;

      case 'search':
        if (event.query) s.searches.push(event.query);
        break;

      case 'filter':
        s.filterUses[event.filterType] = (s.filterUses[event.filterType] || 0) + 1;
        break;

      case 'scroll':
        s.scrollDepths[event.page] = Math.max(s.scrollDepths[event.page] || 0, event.depth || 0);
        break;

      case 'hover':
        s.hoverDurations[event.productId] = (s.hoverDurations[event.productId] || 0) + (event.duration || 0);
        break;

      case 'compare':
        if (event.productId && !s.compareList.includes(event.productId)) s.compareList.push(event.productId);
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 به‌روزرسانی Big Five Personality
  // ═══════════════════════════════════════════════════════════════
  function updateBigFive(event) {
    const b = state.bigFive;
    const s = state.stats;

    // Openness (گشودگی): تنوع محصولات، جستجوی زیاد، کلیک روی محصولات جدید
    if (event.type === 'product_view') {
      const uniqueProducts = Object.keys(s.productViews).length;
      b.openness = Math.min(100, 30 + uniqueProducts * 2);
    }
    if (event.type === 'search') {
      b.openness += 1; // جستجو = کنجکاوی
    }

    // Conscientiousness (وظیفه‌شناسی): مقایسه محصولات، فیلتر استفاده، scroll عمیق
    if (event.type === 'compare') b.conscientiousness += 3;
    if (event.type === 'filter') b.conscientiousness += 2;
    if (event.type === 'product_view' && event.duration > 30) b.conscientiousness += 1;
    b.conscientiousness = Math.min(100, b.conscientiousness);

    // Extraversion (برون‌گرایی): خرید، favorite، رنگ‌های شاد
    if (event.type === 'favorite_add') b.extraversion += 2;
    if (event.type === 'purchase') b.extraversion += 5;
    if (event.type === 'product_view' && ['red', 'pink', 'coral', 'orange', 'yellow'].includes((event.color || '').toLowerCase())) {
      b.extraversion += 1;
    }
    b.extraversion = Math.min(100, b.extraversion);

    // Agreeableness (توافق‌پذیری): فروشندگان معتبر، محصولات محبوب
    if (event.type === 'product_view' && event.rating >= 4.5) b.agreeableness += 1;
    if (event.type === 'product_view' && event.isSellerProduct) b.agreeableness += 1;
    b.agreeableness = Math.min(100, b.agreeableness);

    // Neuroticism (روان‌رنجوری): بازدیدهای مکرر از یک محصول، hover طولانی بدون خرید
    if (event.type === 'product_view') {
      const views = s.productViews[event.productId] || 0;
      if (views > 3) b.neuroticism += 2; // وسواس در انتخاب
    }
    if (event.type === 'hover' && event.duration > 5000) b.neuroticism += 1;
    b.neuroticism = Math.min(100, b.neuroticism);

    // میانگین‌گیری برای پایداری
    // اگه خیلی بالا رفت، کمی کاهش بده
    Object.keys(b).forEach(k => {
      b[k] = Math.max(10, Math.min(100, b[k]));
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 👗 به‌روزرسانی Style Scores
  // ═══════════════════════════════════════════════════════════════
  function updateStyleScores(event) {
    const st = state.styleScores;

    if (event.type === 'product_view' || event.type === 'favorite_add' || event.type === 'cart_add') {
      const style = (event.style || event.subcategory || event.category || '').toLowerCase();

      // مپ کردن به ۱۲ سبک
      const styleMap = {
        'classic': 'classic', 'کلاسیک': 'classic',
        'elegant': 'elegant', 'شیک': 'elegant', 'مجلسی': 'elegant',
        'modern': 'modern', 'مدرن': 'modern',
        'sporty': 'sporty', 'اسپرت': 'sporty', 'ورزشی': 'sporty',
        'casual': 'casual', 'کژوال': 'casual', 'روزمره': 'casual',
        'romantic': 'romantic', 'رمانتیک': 'romantic',
        'bohemian': 'bohemian', 'بوهمو': 'bohemian',
        'vintage': 'vintage', 'وینتیج': 'vintage',
        'minimalist': 'minimalist', 'مینیمال': 'minimalist',
        'glamorous': 'glamorous', 'گلامور': 'glamorous',
        'street': 'street', 'streetwear': 'street', 'خیابانی': 'street',
        'preppy': 'preppy', 'پرپی': 'preppy', 'دانشگاهی': 'preppy',
      };

      const matchedStyle = styleMap[style];
      if (matchedStyle) {
        const weight = event.type === 'favorite_add' ? 3 : (event.type === 'cart_add' ? 5 : 1);
        st[matchedStyle] = (st[matchedStyle] || 0) + weight;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎭 محاسبه آرکی‌تایپ شخصیتی
  // ═══════════════════════════════════════════════════════════════
  // ۱۲ آرکی‌تایپ یونگ
  const ARCHETYPES = {
    innocent: {
      name: 'معصوم',
      nameEn: 'Innocent',
      emoji: '🕊️',
      desc: 'ساده، خوش‌بین، صادق، پاک',
      traits: 'سادگی و خلوص در انتخاب‌ها. به دنبال راحتی و آرامش هستی.',
      styles: ['minimalist', 'casual'],
      colors: ['white', 'cream', 'pastel', 'sky-blue', 'light-pink'],
    },
    sage: {
      name: 'خردمند',
      nameEn: 'Sage',
      emoji: '🦉',
      desc: 'باهوش، تحلیل‌گر، منطقی، دقیق',
      traits: 'اهل تحقیق و بررسی. قبل از خرید حسابی فکر می‌کنی.',
      styles: ['classic', 'minimalist'],
      colors: ['gray', 'navy', 'black', 'beige', 'olive'],
    },
    explorer: {
      name: 'مکاشف',
      nameEn: 'Explorer',
      emoji: '🧭',
      desc: 'ماجراجو، کنجکاو، مستقل، آزاد',
      traits: 'دوست داری چیزهای جدید کشف کنی. از تنوع لذت می‌بری.',
      styles: ['sporty', 'street', 'bohemian'],
      colors: ['olive', 'brown', 'tan', 'rust', 'forest-green'],
    },
    hero: {
      name: 'قهرمان',
      nameEn: 'Hero',
      emoji: '⚔️',
      desc: 'شجاع، مصمم، قوی، موفق',
      traits: 'به دنبال بهترین‌ها هستی. کیفیت برات مهمه.',
      styles: ['classic', 'modern', 'sporty'],
      colors: ['black', 'navy', 'red', 'white'],
    },
    outlaw: {
      name: 'یاغی',
      nameEn: 'Outlaw',
      emoji: '🔥',
      desc: 'شورشی، جسور، متفاوت، قدرتمند',
      traits: 'از قوانین پیروی نمی‌کنی. سبک خاص خودت رو داری.',
      styles: ['street', 'glamorous', 'modern'],
      colors: ['black', 'red', 'purple', 'silver'],
    },
    magician: {
      name: 'جادوگر',
      nameEn: 'Magician',
      emoji: '✨',
      desc: 'خلاق، رویاپرداز، الهام‌بخش، تحول‌آفرین',
      traits: 'به دنبال تغییر و تحول هستی. خلاقیت در انتخاب‌هات دیده میشه.',
      styles: ['glamorous', 'romantic', 'bohemian'],
      colors: ['gold', 'purple', 'emerald', 'deep-blue'],
    },
    lover: {
      name: 'عاشق',
      nameEn: 'Lover',
      emoji: '💋',
      desc: 'حسی، زیبا، صمیمی، پرشور',
      traits: 'به زیبایی و ظرافت اهمیت می‌دی. حس خوب مهمه برات.',
      styles: ['romantic', 'elegant', 'glamorous'],
      colors: ['red', 'pink', 'burgundy', 'coral', 'rose-gold'],
    },
    jester: {
      name: 'دلقک',
      nameEn: 'Jester',
      emoji: '🎭',
      desc: 'شاد، بامزه، خودجوش، خلاق',
      traits: 'زندگی برات باید شاد و رنگارنگ باشه.',
      styles: ['street', 'casual', 'glamorous'],
      colors: ['yellow', 'orange', 'pink', 'coral'],
    },
    everyman: {
      name: 'مردمی',
      nameEn: 'Everyman',
      emoji: '🤝',
      desc: 'صمیمی، قابل اعتماد، ساده، صادق',
      traits: 'اهل ارتباط با مردم. سبکت قابل دسترس و راحته.',
      styles: ['casual', 'classic', 'preppy'],
      colors: ['blue', 'brown', 'gray', 'green'],
    },
    caregiver: {
      name: 'مراقب',
      nameEn: 'Caregiver',
      emoji: '🤲',
      desc: 'مهربان، دلسوز، فداکار، حمایت‌گر',
      traits: 'به دیگران اهمیت می‌دی. کیفیت و راحتی برات مهمه.',
      styles: ['casual', 'classic', 'romantic'],
      colors: ['cream', 'soft-pink', 'light-blue', 'lavender', 'mint'],
    },
    ruler: {
      name: 'فرمانروا',
      nameEn: 'Ruler',
      emoji: '👑',
      desc: 'رهبر، قدرتمند، باکلاس، کنترل‌گر',
      traits: 'بهترین‌ها رو می‌خوای. لوکس و باکلاس برات مهمه.',
      styles: ['elegant', 'classic', 'glamorous'],
      colors: ['black', 'gold', 'burgundy', 'navy', 'purple'],
    },
    creator: {
      name: 'خلاق',
      nameEn: 'Creator',
      emoji: '🎨',
      desc: 'مبتکر، هنرمند، تخیلی، منحصربه‌فرد',
      traits: 'هنر در انتخاب‌هات هست. سبک منحصربه‌فرد داری.',
      styles: ['bohemian', 'modern', 'vintage', 'street'],
      colors: ['teal', 'mustard', 'coral', 'olive', 'terracotta'],
    },
  };

  function calculateArchetypes(taste) {
    const scores = {};
    Object.keys(ARCHETYPES).forEach(k => scores[k] = 0);

    // امتیازدهی بر اساس سلیقه
    if (taste) {
      // سبک‌ها
      const userStyles = taste.styleMain || [];
      Object.keys(ARCHETYPES).forEach(archKey => {
        const arch = ARCHETYPES[archKey];
        userStyles.forEach(us => {
          if (arch.styles.includes(us.toLowerCase())) {
            scores[archKey] += 25;
          }
        });
      });

      // رنگ‌ها
      const userColors = taste.favoriteColors || [];
      Object.keys(ARCHETYPES).forEach(archKey => {
        const arch = ARCHETYPES[archKey];
        userColors.forEach(uc => {
          if (arch.colors.includes(uc.toLowerCase())) {
            scores[archKey] += 10;
          }
        });
      });

      // شخصیت
      const personality = taste.personality || [];
      const personalityMap = {
        'introvert': ['sage', 'caregiver', 'creator'],
        'extrovert': ['jester', 'lover', 'hero'],
        'calm': ['sage', 'innocent', 'caregiver'],
        'bold': ['hero', 'outlaw', 'magician'],
        'romantic': ['lover', 'magician', 'innocent'],
        'practical': ['ruler', 'everyman', 'sage'],
      };
      personality.forEach(p => {
        (personalityMap[p] || []).forEach(a => {
          scores[a] = (scores[a] || 0) + 15;
        });
      });

      // سبک زندگی
      const lifestyle = taste.lifestyle || [];
      const lifestyleMap = {
        'active': ['hero', 'explorer', 'everyman'],
        'social': ['jester', 'lover', 'everyman'],
        'homebody': ['caregiver', 'innocent', 'sage'],
        'travel': ['explorer', 'magician', 'creator'],
        'minimal': ['sage', 'innocent', 'ruler'],
        'luxury': ['ruler', 'lover', 'magician'],
      };
      lifestyle.forEach(l => {
        (lifestyleMap[l] || []).forEach(a => {
          scores[a] = (scores[a] || 0) + 12;
        });
      });
    }

    // امتیازدهی بر اساس رفتار (اگه Big Five داشته باشیم)
    const bf = state.bigFive;
    if (bf) {
      // Openness بالا → Explorer, Creator, Magician
      if (bf.openness > 70) {
        scores.explorer += 15;
        scores.creator += 15;
        scores.magician += 10;
      }
      // Conscientiousness بالا → Ruler, Sage
      if (bf.conscientiousness > 70) {
        scores.ruler += 12;
        scores.sage += 12;
      }
      // Extraversion بالا → Jester, Lover, Hero
      if (bf.extraversion > 70) {
        scores.jester += 12;
        scores.lover += 10;
        scores.hero += 8;
      }
      // Agreeableness بالا → Caregiver, Everyman
      if (bf.agreeableness > 70) {
        scores.caregiver += 12;
        scores.everyman += 10;
      }
      // Neuroticism بالا → Innocent, Caregiver
      if (bf.neuroticism > 70) {
        scores.innocent += 8;
        scores.caregiver += 8;
      }
    }

    return scores;
  }

  function getTopArchetypes(taste, limit) {
    limit = limit || 3;
    const scores = calculateArchetypes(taste);
    return Object.keys(scores)
      .map(k => ({ key: k, ...ARCHETYPES[k], score: scores[k] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // 💬 توصیف شخصیتی واقع‌گرایانه
  // ═══════════════════════════════════════════════════════════════
  function generatePersonalityDescription(taste) {
    const top = getTopArchetypes(taste, 2);
    if (top.length === 0 || top[0].score < 10) {
      return {
        short: 'هنوز اطلاعات کافی نداریم',
        long: 'با چند کلیک بیشتر، شخصیت واقعیت رو بهت نشون می‌دیم.',
      };
    }

    const main = top[0];
    const second = top[1];

    // ویژگی‌های ظاهری (واقع‌بینانه)
    const appearanceTraits = generateAppearanceTraits(taste);

    // ویژگی‌های شخصیتی
    const personalityTraits = generatePersonalityTraits(main, second);

    // ترکیب
    const short = `${appearanceTraits.combined} ${personalityTraits.short}`;
    const long = `${appearanceTraits.detailed} ${personalityTraits.long}${second ? ` در کنار ${second.name} بودنت هم دیده میشه - ${second.traits}` : ''}`;

    return { short, long };
  }

  function generateAppearanceTraits(taste) {
    // رنگ پوست (فصل رنگی)
    let skinDesc = 'پوستت';
    if (taste.colorSeason) {
      const season = window.DPTasteProfile?.getTwelveSeasons?.()[taste.colorSeason];
      if (season) {
        if (season.undertone === 'warm') skinDesc = 'پوست گرم و طلایی';
        else if (season.undertone === 'cool') skinDesc = 'پوست سرد و روشن';
        else skinDesc = 'پوست متعادل';
      }
    }

    // رنگ مو
    let hairDesc = '';
    if (taste.hairColor && taste.hairColor !== 'skip') {
      const hairMap = {
        'black': 'موهای مشکی',
        'dark-brown': 'موهای قهوه‌ای تیره',
        'light-brown': 'موهای قهوه‌ای روشن',
        'blonde': 'موهای بلوند طلایی',
        'ash-blonde': 'موهای بلوند خاکستری',
        'auburn': 'موهای مسی',
        'red': 'موهای قرمز',
        'gray': 'موهای خاکستری',
      };
      hairDesc = hairMap[taste.hairColor] || '';
    }

    // فرم بدن
    let bodyDesc = '';
    if (taste.bodyType && taste.bodyType !== 'skip') {
      const bodyMap = {
        'slim': 'اندام لاغر',
        'athletic': 'اندام ورزشکاری',
        'average': 'اندام متوسط',
        'curvy': 'اندام خوش‌فرم',
        'plus': 'اندام پُر',
      };
      bodyDesc = bodyMap[taste.bodyType] || '';
    }

    // ترکیب توصیف ظاهری
    const parts = [skinDesc, hairDesc, bodyDesc].filter(p => p);
    const combined = parts.length > 0 ? parts.join(' با ') + ' داری' : 'هنوز ظاهرت رو کامل نمی‌شناسیم';

    const detailed = `از نظر ظاهری، ${combined}.`;

    return { combined, detailed };
  }

  function generatePersonalityTraits(main, second) {
    // توصیف کوتاه و صادقانه (هم مثبت هم واقعی)
    const shortTemplates = {
      'innocent': 'سلیقه‌ات ساده و صادقانه‌ست',
      'sage': 'اهل فکر و تحلیلی',
      'explorer': 'کنجکاو و ماجراجویی',
      'hero': 'بلندپرواز و مصمم',
      'outlaw': 'مستقل و خاص',
      'magician': 'خلاق و رویاپرداز',
      'lover': 'حسی و ظریف‌پسند',
      'jester': 'شاد و خوش‌مشرب',
      'everyman': 'صمیمی و قابل اعتماد',
      'caregiver': 'مهربان و دلسوز',
      'ruler': 'باکلاس و قدرتمند',
      'creator': 'خلاق و منحصربه‌فرد',
    };

    const longTemplates = {
      'innocent': 'به سادگی و خلوص اهمیت می‌دی. از پیچیدگی فراری هستی و به دنبال آرامش در انتخاب‌هایت می‌گردی. گاهی شاید بیش از حد محتاط باشی.',
      'sage': 'قبل از هر خریدی حسابی تحقیق می‌کنی. کیفیت و اصالت برات مهم‌تر از ظاهر سطحی‌ست. گاهی وسواس در انتخاب داری.',
      'explorer': 'دوست داری چیزهای جدید کشف کنی. از تجربه سبک‌های متفاوت لذت می‌بری. شاید گاهی بیش از حد تنوع طلب باشی.',
      'hero': 'به دنبال بهترین‌ها هستی. کیفیت و عملکرد برات مهمه. گاهی شاید بیش از حد به ظاهر و برند فکر کنی.',
      'outlaw': 'از قوانین مد پیروی نمی‌کنی. سبک خاص خودت رو داری. گاهی شاید انتخاب‌هایت برای دیگران عجیب باشه.',
      'magician': 'به دنبال تحول و زیبایی هستی. خلاقیت در انتخاب‌هات دیده میشه. گاهی شاید بیش از حد روی ظاهر تمرکز کنی.',
      'lover': 'به زیبایی و ظرافت اهمیت می‌دی. حس خوب و ظاهر شیک برات مهمه. گاهی شاید بیش از حد به نظر دیگران اهمیت بدی.',
      'jester': 'زندگی برات باید شاد و رنگارنگ باشه. از خشکی و جدیت بیزاری. گاهی شاید جدیت لازم رو نداشته باشی.',
      'everyman': 'اهل ارتباط با مردم. سبکت قابل دسترس و راحته. گاهی شاید بیش از حد معمولی باشی.',
      'caregiver': 'به دیگران اهمیت می‌دی. کیفیت و راحتی برات مهمه. گاهی شاید خواسته‌های خودت رو نادیده بگیری.',
      'ruler': 'بهترین‌ها رو می‌خوای. لوکس و باکلاس برات مهمه. گاهی شاید بیش از حد هزینه کنی.',
      'creator': 'هنر در انتخاب‌هات هست. سبک منحصربه‌فرد داری. گاهی شاید انتخاب‌هات برای موقعیت‌های رسمی مناسب نباشه.',
    };

    return {
      short: shortTemplates[main.key] || 'شخصیت جالبی داری',
      long: longTemplates[main.key] || 'سلیقه خاص خودت رو داری',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 Auto-track: رویدادهای خودکار
  // ═══════════════════════════════════════════════════════════════
  function setupAutoTracking() {
    // Track کلیک روی محصولات
    document.addEventListener('click', e => {
      const productCard = e.target.closest('[data-product-id], .dp-prod, .prof-taste-card');
      if (productCard) {
        const productId = productCard.dataset.productId;
        track('product_click', { productId, source: 'auto' });
      }
    });

    // Track اسکرول عمیق
    let scrollTimeout;
    let lastDepth = 0;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;
        if (depth > lastDepth + 20) {
          lastDepth = depth;
          track('scroll', { depth, page: location.pathname });
        }
      }, 200);
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 گزارش رفتاری
  // ═══════════════════════════════════════════════════════════════
  function getBehaviorReport() {
    const s = state.stats;

    // محبوب‌ترین دسته
    const topCategories = Object.entries(s.categoryViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => ({ category: cat, count }));

    // محبوب‌ترین رنگ
    const topColors = Object.entries(s.colorViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => ({ color, count }));

    // محبوب‌ترین فروشنده
    const topSellers = Object.entries(s.sellerViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([seller, count]) => ({ seller, count }));

    // محبوب‌ترین محصولات
    const topProducts = Object.entries(s.productViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ productId: id, views: count }));

    // زمان‌بندی
    const totalTimeTracked = s.morningActive + s.afternoonActive + s.eveningActive + s.nightActive;
    const timeDistribution = {
      morning: totalTimeTracked > 0 ? Math.round((s.morningActive / totalTimeTracked) * 100) : 25,
      afternoon: totalTimeTracked > 0 ? Math.round((s.afternoonActive / totalTimeTracked) * 100) : 25,
      evening: totalTimeTracked > 0 ? Math.round((s.eveningActive / totalTimeTracked) * 100) : 25,
      night: totalTimeTracked > 0 ? Math.round((s.nightActive / totalTimeTracked) * 100) : 25,
    };

    return {
      totalEvents: state.events.length,
      totalProductsViewed: Object.keys(s.productViews).length,
      totalFavorites: s.favorites.length,
      totalCartAdds: s.cartAdditions.length,
      totalPurchases: s.purchases.length,
      totalSearches: s.searches.length,
      topCategories,
      topColors,
      topSellers,
      topProducts,
      timeDistribution,
      bigFive: { ...state.bigFive },
      styleScores: { ...state.styleScores },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPBehavior = {
    version: '1.0 ULTIMATE',
    track: track,
    getStats: () => ({ ...state.stats }),
    getBigFive: () => ({ ...state.bigFive }),
    getStyleScores: () => ({ ...state.styleScores }),
    getTopArchetypes: (taste) => getTopArchetypes(taste, 3),
    getArchetypes: () => ARCHETYPES,
    getReport: getBehaviorReport,
    getPersonalityDescription: generatePersonalityDescription,
    calculateArchetypes: calculateArchetypes,
    getState: () => state,
    clearAll: () => {
      state = getDefaultState();
      saveState(state);
    },
    refresh: () => { state = loadState(); },
  };

  // Auto setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoTracking);
  } else {
    setupAutoTracking();
  }

  console.log('📊 DPBehaviorTracker v1.0 ULTIMATE loaded');
  console.log('   🧠 Big Five + 12 Archetypes + Style Scores + Real-time');
})();
