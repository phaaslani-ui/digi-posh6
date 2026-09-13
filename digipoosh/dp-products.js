/**
 * دیجی‌پوش — موتور پیشنهاد محصولات هوشمند
 * v5.0 - استفاده از محصولات واقعی فروشنده‌ها + تطابق دقیق با سلیقه
 */

(function(){
  'use strict';
  if(window.DPProducts) return;
  window.DPProducts = {};

  // ═══ محصولات دمو (پیش‌فرض - فقط در صورت نبود محصول فروشنده‌ها) ═══
  // این محصولات برای حالت دمو هستن - در حالت واقعی از فروشنده‌ها می‌خونیم
  // 🆕 v16.9: محصولات الکی حذف شدن - فقط محصولات واقعی فروشنده‌ها

  // ═══ توابع ═══
  DPProducts.count = function(){
    return DPProducts.all().length;
  };

  // ════════════════════════════════════════════════════════════════
  // ═══ موتور مقایسه هوشمند محصول فروشنده با سلیقه کاربر ═══
  // ═══ این تابع محصول فروشنده رو به تفصیل با سلیقه کاربر مقایسه می‌کنه ═══
  // ════════════════════════════════════════════════════════════════
  DPProducts.matchWithProfile = function(product, profile){
    if(!product || !profile || Object.keys(profile).length === 0){
      return {
        percent: 50,
        level: 'basic',
        levelLabel: 'بدون پروفایل',
        levelColor: '#9ca3af',
        levelIcon: '❓',
        matches: [],
        mismatches: [],
        details: {},
        summary: 'برای مقایسه دقیق، پروفایل خود را تکمیل کنید.'
      };
    }

    let totalScore = 0;
    let maxScore = 0;
    const matches = [];
    const mismatches = [];
    const details = {};

    const colorPersian = {gold:'طلایی', black:'مشکی', white:'سفید', cream:'کرم', navy:'سرمه‌ای', emerald:'زمردی', burgundy:'زرشکی', pink:'صورتی', red:'قرمز', gray:'خاکستری', beige:'بژ', blue:'آبی', green:'سبز', brown:'قهوه‌ای', yellow:'زرد', orange:'نارنجی', turquoise:'فیروزه‌ای', silver:'نقره‌ای', purple:'بنفش'};
    const stylePersian = {classic:'کلاسیک', modern:'مدرن', elegant:'شیک', sporty:'اسپرت', bohemian:'بوهمی', minimal:'مینیمال', vintage:'وینتیج', casual:'کژوال', street:'خیابانی', traditional:'سنتی'};
    const skinPersian = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
    const bodyPersian = {hourglass:'ساعت‌شنی ⏳', pear:'گلابی 🍐', apple:'سیب 🍎', rectangle:'مستطیل 📏', 'inverted-triangle':'مثلث معکوس 🔻'};
    const occPersian = {casual:'روزمره', formal:'رسمی', party:'مهمانی', wedding:'عروسی', business:'اداری', sport:'ورزشی', daily:'روزانه', travel:'سفر'};

    // ═══ ۱. جنسیت (۱۰ امتیاز) ═══
    maxScore += 10;
    if(!profile.gender){
      totalScore += 7;
    } else if(product.gender === profile.gender){
      totalScore += 10;
      details.gender = {score: 10, max: 10, status: 'perfect', text: 'جنسیت محصول کاملاً با شما مطابقت دارد'};
      matches.push({icon: '👤', text: 'جنسیت محصول مطابق شماست', score: 10});
    } else if(product.gender === 'unisex'){
      totalScore += 8;
      details.gender = {score: 8, max: 10, status: 'good', text: 'محصول یونیسکس است'};
    } else {
      totalScore += 0;
      details.gender = {score: 0, max: 10, status: 'bad', text: 'جنسیت محصول با شما متفاوت است'};
      mismatches.push({icon: '⚠️', text: 'جنسیت محصول متفاوت است'});
    }

    // ═══ ۲. رنگ (۲۵ امتیاز - اولویت اصلی) ═══
    maxScore += 25;
    if(profile.preferredColors && profile.preferredColors.length > 0 && product.colors && product.colors.length > 0){
      const matchedColors = product.colors.filter(c => profile.preferredColors.includes(c));
      if(matchedColors.length > 0){
        const score = Math.min(25, 15 + matchedColors.length * 5);
        totalScore += score;
        const colorName = colorPersian[matchedColors[0]] || matchedColors[0];
        details.color = {score: score, max: 25, status: 'perfect', text: 'رنگ محصول کاملاً مطابق سلیقه شماست', matched: matchedColors};
        matches.push({icon: '🎨', text: `رنگ ${colorName} جزو رنگ‌های مورد علاقه شماست`, score: score});
      } else {
        details.color = {score: 0, max: 25, status: 'bad', text: 'رنگ محصول جزو رنگ‌های مورد علاقه شما نیست'};
        mismatches.push({icon: '⚠️', text: 'رنگ محصول با سلیقه شما متفاوت است'});
      }
    } else if(product.colors && product.colors.length > 0){
      totalScore += 12;
      details.color = {score: 12, max: 25, status: 'neutral', text: 'رنگ‌های محصول موجود است'};
    }

    // ═══ ۳. استایل (۲۰ امتیاز) ═══
    maxScore += 20;
    if(profile.preferredStyles && profile.preferredStyles.length > 0 && product.styles && product.styles.length > 0){
      const matchedStyles = product.styles.filter(s => profile.preferredStyles.includes(s));
      if(matchedStyles.length > 0){
        const score = Math.min(20, 12 + matchedStyles.length * 4);
        totalScore += score;
        const styleName = stylePersian[matchedStyles[0]] || matchedStyles[0];
        details.style = {score: score, max: 20, status: 'perfect', text: 'سبک محصول مطابق سلیقه شماست', matched: matchedStyles};
        matches.push({icon: '💎', text: `سبک ${styleName} مورد پسند شماست`, score: score});
      } else {
        // بررسی تضاد استایلی
        const oppositeMap = {elegant:['sporty'], sporty:['elegant','vintage'], classic:['bohemian'], modern:['vintage','classic']};
        const hasOpposite = profile.preferredStyles.some(s => (oppositeMap[s] || []).some(o => product.styles.includes(o)));
        if(hasOpposite){
          details.style = {score: 0, max: 20, status: 'bad', text: 'سبک محصول با سلیقه شما در تضاد است'};
          mismatches.push({icon: '⚠️', text: 'سبک محصول با سلیقه شما متفاوت است'});
        } else {
          totalScore += 6;
          details.style = {score: 6, max: 20, status: 'neutral', text: 'سبک محصول نسبتاً متفاوت است'};
        }
      }
    } else if(product.styles && product.styles.length > 0){
      totalScore += 10;
      details.style = {score: 10, max: 20, status: 'neutral', text: 'سبک‌های محصول'};
    }

    // ═══ ۴. موقعیت (۱۵ امتیاز) ═══
    maxScore += 15;
    if(profile.preferredOccasions && profile.preferredOccasions.length > 0 && product.occasions && product.occasions.length > 0){
      const matchedOcc = product.occasions.filter(o => profile.preferredOccasions.includes(o));
      if(matchedOcc.length > 0){
        const score = Math.min(15, 10 + matchedOcc.length * 3);
        totalScore += score;
        const occName = occPersian[matchedOcc[0]] || matchedOcc[0];
        details.occasion = {score: score, max: 15, status: 'perfect', text: 'مناسب موقعیت مورد نظر شما', matched: matchedOcc};
        matches.push({icon: '🎭', text: `مناسب ${occName}`, score: score});
      } else {
        details.occasion = {score: 3, max: 15, status: 'neutral', text: 'ممکن است برای موقعیت‌های دیگر مناسب باشد'};
        totalScore += 3;
      }
    } else if(product.occasions && product.occasions.length > 0){
      totalScore += 7;
      details.occasion = {score: 7, max: 15, status: 'neutral', text: 'موقعیت‌های محصول'};
    }

    // ═══ ۵. رنگ پوست (۱۰ امتیاز) ═══
    maxScore += 10;
    if(profile.skinTone && product.colorHarmony && product.colorHarmony[profile.skinTone]){
      const harmony = product.colorHarmony[profile.skinTone];
      const score = 10 * harmony;
      totalScore += score;
      if(harmony > 0.85){
        details.skinTone = {score: score, max: 10, status: 'perfect', text: `کاملاً با رنگ پوست ${skinPersian[profile.skinTone]} شما هماهنگ است`, value: harmony};
        matches.push({icon: '☀️', text: `${Math.round(harmony * 100)}٪ هماهنگی با رنگ پوست شما`, score: score});
      } else if(harmony > 0.6){
        details.skinTone = {score: score, max: 10, status: 'good', text: `هماهنگی خوب با رنگ پوست ${skinPersian[profile.skinTone]}`, value: harmony};
        matches.push({icon: '☀️', text: `${Math.round(harmony * 100)}٪ هماهنگی با رنگ پوست`, score: score});
      } else {
        details.skinTone = {score: score, max: 10, status: 'bad', text: `هماهنگی کم با رنگ پوست ${skinPersian[profile.skinTone]}`, value: harmony};
        mismatches.push({icon: '⚠️', text: `هماهنگی کم با رنگ پوست شما (${Math.round(harmony * 100)}٪)`});
      }
    }

    // ═══ ۶. فرم بدن (۱۰ امتیاز) ═══
    maxScore += 10;
    if(profile.bodyType && product.bodyTypeFit && product.bodyTypeFit[profile.bodyType]){
      const fit = product.bodyTypeFit[profile.bodyType];
      const score = 10 * fit;
      totalScore += score;
      if(fit > 0.85){
        details.bodyType = {score: score, max: 10, status: 'perfect', text: `کاملاً مناسب فرم بدن ${bodyPersian[profile.bodyType]} شما`, value: fit};
        matches.push({icon: '👤', text: `${Math.round(fit * 100)}٪ مناسب فرم بدن شما`, score: score});
      } else if(fit > 0.6){
        details.bodyType = {score: score, max: 10, status: 'good', text: `مناسب فرم بدن ${bodyPersian[profile.bodyType]}`, value: fit};
        matches.push({icon: '👤', text: `${Math.round(fit * 100)}٪ مناسب فرم بدن`, score: score});
      } else {
        details.bodyType = {score: score, max: 10, status: 'bad', text: `تناسب کم با فرم بدن ${bodyPersian[profile.bodyType]}`, value: fit};
        mismatches.push({icon: '⚠️', text: `تناسب کم با فرم بدن شما (${Math.round(fit * 100)}٪)`});
      }
    }

    // ═══ ۷. بودجه (۱۵ امتیاز - اهمیت بالا) ═══
    maxScore += 15;
    if(profile.budget){
      // اولویت با سطح بودجه‌ای که فروشنده برای محصولش تعریف کرده
      const sellerBudget = product.budget;
      const userBudget = profile.budget;
      const budgetRanges = {low:[0, 500000], medium:[500000, 1500000], high:[1500000, 3000000], luxury:[3000000, 100000000]};
      const range = budgetRanges[userBudget];
      const inRange = range && product.price >= range[0] && product.price < range[1];

      if(sellerBudget && userBudget && sellerBudget === userBudget){
        // تطابق دقیق با بودجه فروشنده
        totalScore += 15;
        details.budget = {score: 15, max: 15, status: 'perfect', text: 'سطح بودجه این کالا با بودجه شما هماهنگ است', sellerBudget: sellerBudget, userBudget: userBudget};
        matches.push({icon: '💰', text: 'سطح بودجه کالا با بودجه شما هماهنگ است', score: 15});
      } else if(inRange){
        totalScore += 12;
        details.budget = {score: 12, max: 15, status: 'good', text: 'قیمت در محدوده بودجه شماست'};
        matches.push({icon: '💰', text: 'قیمت در محدوده بودجه شماست', score: 12});
      } else {
        totalScore += 4;
        details.budget = {score: 4, max: 15, status: 'neutral', text: 'قیمت خارج از بودجه شما — ولی شاید ارزش دیدن داشته باشه'};
        mismatches.push({icon: '💰', text: 'قیمت خارج از بودجه شماست'});
      }
    }

    // ═══ محاسبه درصد نهایی ═══
    const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;
    const finalPercent = Math.max(20, Math.min(99, percent));

    // سطح تطابق
    let level, levelLabel, levelColor, levelIcon;
    if(finalPercent >= 85){
      level = 'excellent'; levelLabel = 'عالی'; levelColor = '#10b981'; levelIcon = '🌟';
    } else if(finalPercent >= 70){
      level = 'great'; levelLabel = 'خیلی خوب'; levelColor = '#059669'; levelIcon = '✨';
    } else if(finalPercent >= 55){
      level = 'good'; levelLabel = 'خوب'; levelColor = '#0ea5e9'; levelIcon = '👍';
    } else if(finalPercent >= 40){
      level = 'fair'; levelLabel = 'متوسط'; levelColor = '#f59e0b'; levelIcon = '💭';
    } else {
      level = 'poor'; levelLabel = 'ضعیف'; levelColor = '#ef4444'; levelIcon = '🤔';
    }

    // خلاصه نهایی
    let summary;
    if(finalPercent >= 85){
      summary = `این محصول ${levelLabel} برای شماست! ${matches.length} فاکتور از سلیقه‌تان با آن مطابقت دارد.`;
    } else if(finalPercent >= 70){
      summary = `این محصول ${levelLabel} با سلیقه شما هماهنگ است.`;
    } else if(finalPercent >= 55){
      summary = `این محصول ${levelLabel} برای شما قابل قبول است.`;
    } else if(finalPercent >= 40){
      summary = `این محصول تطابق ${levelLabel}ی با سلیقه شما دارد.`;
    } else {
      summary = `این محصول ${levelLabel} با سلیقه شما مطابقت دارد. ${mismatches.length > 0 ? 'ممکن است برایتان مناسب نباشد.' : ''}`;
    }

    return {
      percent: finalPercent,
      level: level,
      levelLabel: levelLabel,
      levelColor: levelColor,
      levelIcon: levelIcon,
      matches: matches,
      mismatches: mismatches,
      details: details,
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore: maxScore,
      summary: summary
    };
  };

  // ═══ مقایسه همه محصولات فروشنده‌ها با پروفایل ═══
  DPProducts.matchSellersWithProfile = function(profile, options){
    const opts = options || {};
    const limit = opts.limit || 20;
    const sortBy = opts.sortBy || 'percent'; // percent | newest | price

    const sellerProducts = DPProducts.all().filter(p => p.isSellerProduct);
    const matched = sellerProducts.map(p => {
      const match = DPProducts.matchWithProfile(p, profile);
      return {
        product: p,
        match: match,
        percent: match.percent
      };
    });

    if(sortBy === 'percent'){
      matched.sort((a, b) => b.percent - a.percent);
    } else if(sortBy === 'newest'){
      matched.sort((a, b) => new Date(b.product.createdAt || 0) - new Date(a.product.createdAt || 0));
    } else if(sortBy === 'price'){
      matched.sort((a, b) => a.product.price - b.product.price);
    }

    return matched.slice(0, limit);
  };

  // ═══ بارگذاری محصولات واقعی فروشنده‌ها ═══
  // فروشنده‌ها محصولاتشون رو در localStorage['dp_products'] یا سرور ذخیره می‌کنن
  let serverProductsCache = null;
  let serverFetchPromise = null;
  
  async function fetchFromServer() {
    try {
      const res = await fetch('http://localhost:8001/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return null;
    }
  }
  
  function loadSellerProducts(){
    try {
      // 🆕 v17.6 — فقط محصولاتی که ID معتبر دارن (شروع با sp یا محصول واقعی فروشنده)
      const localRaw = localStorage.getItem('dp_products');
      if(!localRaw) return [];
      const local = JSON.parse(localRaw);
      const localValid = Array.isArray(local) ? local : [];
      
      // حذف محصولات SAMPLE/demo/test غیرواقعی
      const isValidProduct = (p) => {
        if (!p || !p.id || !p.name || !p.price) return false;
        const id = String(p.id);
        // محصولات SAMPLE/demo/test/seed باید حذف بشن
        if (id.match(/^(p|sample|demo|test|t|item)/i) && !id.startsWith('sp')) return false;
        // محصولاتی که نام‌شان الکی هست
        const fakeNames = ['پیراهن قرمز مجلسی', 'پیراهن آبی کلاسیک', 'تیشرت سفید ساده', 'شلوار مشکی', 'کفش ساده'];
        if (fakeNames.includes(p.name)) return false;
        return true;
      };
      
      return localValid.filter(isValidProduct);
    } catch(e){
      return [];
    }
  }
  
  // 🆕 نسخه async که از سرور هم می‌گیره
  async function loadAllProducts() {
    let localProducts = [];
    try {
      const localRaw = localStorage.getItem('dp_products');
      if (localRaw) localProducts = JSON.parse(localRaw);
    } catch (e) {}
    
    // سعی کن از سرور بگیری
    const serverProducts = await fetchFromServer();
    
    let allProducts = [];
    if (serverProducts !== null && serverProducts.length > 0) {
      // سرور محصول داره - merge با local
      const localIds = new Set(localProducts.map(p => p.id));
      const fromServer = serverProducts.filter(p => !localIds.has(p.id));
      allProducts = [...localProducts, ...fromServer];
      
      // به‌روزرسانی localStorage
      localStorage.setItem('dp_products', JSON.stringify(allProducts));
    } else if (localProducts.length > 0) {
      // سرور در دسترس نیست ولی local داریم
      allProducts = localProducts;
    } else {
      // هیچ‌جا محصول نیست
      allProducts = [];
    }
    
    return allProducts.filter(p => 
      p && 
      p.price > 0 && 
      (p.status === 'active' || p.status === undefined) && 
      (p.stock === undefined || p.stock > 0)
    );
  }

  // تبدیل محصول فروشنده به فرمت موتور پیشنهاد
  function normalizeSellerProduct(p){
    if(!p) return null;
    // تعیین جنسیت از category
    let gender = 'unisex';
    const cat = (p.category || '').toLowerCase();
    const section = (p.section || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if(cat.includes('زنان') || section.includes('زنان') || section.includes('woman') || name.includes('زنانه')) gender = 'female';
    else if(cat.includes('مرد') || section.includes('مرد') || section.includes('man') || name.includes('مردانه')) gender = 'male';
    else if(cat.includes('بچ') || section.includes('بچ') || section.includes('kids')) gender = 'kids';
    else if(cat.includes('تین') || section.includes('تین') || section.includes('teen')) gender = 'teen';

    // رنگ‌ها: از فیلد color یا colors یا استخراج از ویژگی‌ها
    let colors = p.colors || [];
    if(p.color && !colors.includes(p.color)) colors = [p.color, ...colors];

    // سایزها
    const sizes = p.sizes || [];

    // استایل: از فیلد style یا categories
    let styles = p.styles || [];
    if(p.style && !styles.includes(p.style)) styles = [p.style, ...styles];
    if(styles.length === 0) styles = ['modern']; // پیش‌فرض

    // موقعیت‌ها: از tags یا categories
    const occasions = p.occasions || ['casual', 'daily'];

    return {
      id: p.id || 'sp_' + Math.random().toString(36).slice(2,9),
      name: p.name || 'محصول',
      brand: p.brand || (p.sellerName || 'فروشنده'),
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || 0,
      discount: p.discount || 0,
      category: p.category || 'عمومی',
      subcategory: p.subcategory || p.section || p.category || 'عمومی',
      gender: gender,
      colors: colors,
      sizes: sizes,
      styles: styles,
      occasions: occasions,
      season: p.season || 'چهار فصل',
      colorHarmony: p.colorHarmony || {warm: 0.7, cool: 0.7, neutral: 0.7},
      bodyTypeFit: p.bodyTypeFit || {hourglass: 0.7, pear: 0.7, apple: 0.7, rectangle: 0.7, 'inverted-triangle': 0.7},
      trendScore: p.trendScore || 0.6,
      rating: Number(p.rating) || 4.5,
      reviews: Number(p.reviews) || 0,
      inStock: (p.stock || 0) > 0,
      image: p.images && p.images[0] ? p.images[0] : (p.image || ''),
      description: p.description || '',
      tags: p.tags || [],
      seller: p.sellerName || p.brand || 'فروشنده',
      sold: Number(p.sales || p.sold) || 0,
      isSellerProduct: true,
      budget: p.budget || 'medium' // سطح بودجه فروشنده (پیش‌فرض: متوسط)
    };
  }

  // ═══ دریافت فقط محصولات واقعی فروشنده‌ها ═══
  // اگه محصول واقعی نبود، از دمو استفاده می‌کنیم (fallback)
  function getRealProducts(){
    const all = DPProducts.all();
    const real = all.filter(p => p.isSellerProduct);
    return real.length > 0 ? real : all;
  }

  // ═══ دریافت فقط محصولات واقعی فروشنده‌ها ═══
  // ⚠️ قانون: هیچ محصول الکی/demo وجود نداره
  // 🆕 اول مطمئن می‌شیم محصولات seed شدن
  DPProducts.all = function(){
    try {
      // 🆕 اگه DPProductLoader هست، اجازه بده اول seed کنه
      if (window.DPProductLoader && window.DPProductLoader.ensureSeeded) {
        window.DPProductLoader.ensureSeeded();
      }
      
      const raw = localStorage.getItem('dp_products');
      const sellerProducts = loadSellerProducts().map(normalizeSellerProduct).filter(p => p && p.price > 0);
      return sellerProducts;
    } catch (e) {
      console.error('❌ DPProducts.all error:', e);
      return [];
    }
  };

  // 🆕 نسخه async - از سرور هم می‌گیره (ترجیحاً استفاده شود)
  DPProducts.allAsync = async function(){
    const products = await loadAllProducts();
    return products.map(normalizeSellerProduct).filter(p => p && p.price > 0);
  };

  // 🆕 دریافت + sync فوری از سرور
  DPProducts.syncFromServer = async function(){
    try {
      const res = await fetch('http://localhost:8001/api/products', { cache: 'no-store' });
      if (!res.ok) return false;
      const serverProducts = await res.json();
      if (Array.isArray(serverProducts) && serverProducts.length > 0) {
        localStorage.setItem('dp_products', JSON.stringify(serverProducts));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  DPProducts.get = function(id){
    return DPProducts.all().find(p => p.id === id);
  };

  DPProducts.byCategory = function(category){
    return DPProducts.all().filter(p => p.category === category);
  };

  DPProducts.byGender = function(gender){
    return DPProducts.all().filter(p => p.gender === gender || p.gender === 'unisex');
  };

  DPProducts.byStyle = function(style){
    return DPProducts.all().filter(p => p.styles && p.styles.includes(style));
  };

  DPProducts.search = function(query){
    const q = (query || '').toLowerCase().trim();
    if(!q) return DPProducts.all();
    return DPProducts.all().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  };

  DPProducts.formatPrice = function(price){
    return price.toLocaleString('fa-IR');
  };

  DPProducts.savings = function(product){
    if(!product.originalPrice || product.originalPrice <= product.price) return 0;
    return product.originalPrice - product.price;
  };

  DPProducts.topRated = function(limit){
    return [...getRealProducts()].sort((a, b) => b.rating - a.rating).slice(0, limit || 8);
  };

  // ═══ ترند روز (فقط محصولات واقعی فروشنده‌ها) ═══
  DPProducts.trending = function(limit){
    const products = getRealProducts();
    return [...products].sort((a, b) => {
      const scoreA = (a.trendScore || 0.5) * 0.6 + ((a.rating || 4) / 5) * 0.3 + Math.min(1, (a.sold || 0) / 3000) * 0.1;
      const scoreB = (b.trendScore || 0.5) * 0.6 + ((b.rating || 4) / 5) * 0.3 + Math.min(1, (b.sold || 0) / 3000) * 0.1;
      return scoreB - scoreA;
    }).slice(0, limit || 8);
  };

  // ═══ پرفروش‌ترین‌ها (فقط محصولات واقعی فروشنده‌ها) ═══
  DPProducts.bestSellers = function(limit){
    const products = getRealProducts();
    return [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, limit || 8);
  };

  DPProducts.newArrivals = function(limit){
    return [...getRealProducts()].reverse().slice(0, limit || 8);
  };

  // ═══ تخفیف‌دار (فقط محصولات واقعی فروشنده‌ها) ═══
  DPProducts.discounted = function(limit){
    const products = getRealProducts();
    return [...products].filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, limit || 8);
  };

  // گرفتن محصولات بر اساس پروفایل (پروفایل هوشمند)
  DPProducts.forProfile = function(profile, limit){
    if(!profile) return getRealProducts().slice(0, limit || 8);
    return getRealProducts().filter(p => {
      if(profile.gender && p.gender !== profile.gender && p.gender !== 'unisex') return false;
      if(profile.skinTone && p.colorHarmony && p.colorHarmony[profile.skinTone] < 0.5) return false;
      if(profile.bodyType && p.bodyTypeFit && p.bodyTypeFit[profile.bodyType] < 0.6) return false;
      if(profile.preferredStyles && profile.preferredStyles.length){
        if(!p.styles.some(s => profile.preferredStyles.includes(s))) return false;
      }
      if(profile.preferredOccasions && profile.preferredOccasions.length){
        if(!p.occasions.some(o => profile.preferredOccasions.includes(o))) return false;
      }
      return true;
    }).slice(0, limit || 12);
  };

  // پیشنهاد با الگوریتم پیشرفته v5.0 (محصولات واقعی فروشنده‌ها + تطابق دقیق)
  DPProducts.recommend = function(profile, history, limit){
    const lim = limit || 12;
    // ═══ فقط محصولات واقعی فروشنده‌ها ═══
    const allProducts = getRealProducts();

    // ═══ حالت ۱: پروفایل کاملاً خالی → ترند و پرفروش ═══
    if(!profile || Object.keys(profile).length === 0){
      const mix = [...DPProducts.trending(8), ...DPProducts.bestSellers(8)];
      const seen = new Set();
      const unique = [];
      const catCount = {};
      for(const p of mix){
        if(seen.has(p.id)) continue;
        const key = p.subcategory || p.category;
        if((catCount[key] || 0) >= 2) continue;
        seen.add(p.id);
        catCount[key] = (catCount[key] || 0) + 1;
        unique.push({
          ...p,
          score: (p.trendScore || 0.5) * 100,
          matchPercent: Math.min(85, Math.max(50, Math.round((p.trendScore || 0.5) * 80 + (p.rating || 4) * 5))),
          reasons: [
            p.isSellerProduct ? '🏪 محصول فروشنده معتبر' : null,
            (p.trendScore || 0) > 0.8 ? '🔥 ترند فصل' : null,
            `⭐ امتیاز ${p.rating || 4.5}`
          ].filter(Boolean)
        });
        if(unique.length >= lim) break;
      }
      return unique;
    }

    // ═══ فیلتر ۱: جنسیت ═══
    let pool = allProducts.filter(p => {
      if(!profile.gender) return true;
      return p.gender === profile.gender || p.gender === 'unisex';
    });
    if(pool.length < 3) pool = allProducts.filter(p => p.gender === 'unisex' || p.gender === profile.gender);

    // ═══ فیلتر ۲: فقط محصولات فعال (موجودی > 0) ═══
    pool = pool.filter(p => p.inStock !== false);

    // ═══ فیلتر ۳: تطابق دقیق رنگ - اگه کاربر رنگ خاصی گفته، فقط محصولاتی که اون رنگ رو دارن ═══
    if(profile.preferredColors && profile.preferredColors.length > 0){
      const colorMatched = pool.filter(p => p.colors && p.colors.some(c => profile.preferredColors.includes(c)));
      // اگه با فیلتر رنگ چیزی نموند، فیلتر رو شل کن
      if(colorMatched.length >= 3) pool = colorMatched;
    }

    // ═══ فیلتر ۴: تطابق استایل ═══
    if(profile.preferredStyles && profile.preferredStyles.length >= 1 && pool.length > 5){
      const styleMatched = pool.filter(p => p.styles && p.styles.some(s => profile.preferredStyles.includes(s)));
      if(styleMatched.length >= 3) pool = styleMatched;
    }

    // ═══ محاسبه امتیاز ═══
    const colorMap = {gold:'طلایی', black:'مشکی', white:'سفید', cream:'کرم', navy:'سرمه‌ای', emerald:'زمردی', burgundy:'زرشکی', pink:'صورتی', red:'قرمز', gray:'خاکستری', beige:'بژ', blue:'آبی', green:'سبز', brown:'قهوه‌ای', yellow:'زرد', orange:'نارنجی', turquoise:'فیروزه‌ای', maroon:'زرشکی', silver:'نقره‌ای', purple:'بنفش'};
    const styleMap = {classic:'کلاسیک', modern:'مدرن', elegant:'شیک', sporty:'اسپرت', bohemian:'بوهمی', minimal:'مینیمال', vintage:'وینتیج', casual:'کژوال', street:'خیابانی', traditional:'سنتی'};
    const skinMap = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
    const bodyMap = {hourglass:'ساعت‌شنی ⏳', pear:'گلابی 🍐', apple:'سیب 🍎', rectangle:'مستطیل 📏', 'inverted-triangle':'مثلث معکوس 🔻'};

    const scored = pool.map(p => {
      let score = 0;
      const reasons = [];

      // ۱. تطابق رنگ (۲۵ امتیاز) - اولویت اصلی
      if(profile.preferredColors && profile.preferredColors.length && p.colors){
        const matched = p.colors.filter(c => profile.preferredColors.includes(c));
        if(matched.length > 0){
          score += 25;
          reasons.push(`رنگ ${colorMap[matched[0]] || matched[0]} مطابق سلیقه شماست`);
        } else if(profile.preferredColors.length > 0){
          // محصول رنگ مورد علاقه رو نداره - جریمه
          score -= 10;
        }
      }

      // ۲. تطابق استایل (۲۰ امتیاز)
      if(profile.preferredStyles && profile.preferredStyles.length && p.styles){
        const matched = p.styles.filter(s => profile.preferredStyles.includes(s));
        if(matched.length > 0){
          score += 20;
          reasons.push(`استایل ${styleMap[matched[0]] || matched[0]} مورد پسند شماست`);
        }
      }

      // ۳. تطابق موقعیت (۱۵ امتیاز)
      if(profile.preferredOccasions && profile.preferredOccasions.length && p.occasions){
        const matched = p.occasions.filter(o => profile.preferredOccasions.includes(o));
        if(matched.length > 0){
          score += 15;
        }
      }

      // ۴. تطابق رنگ پوست (۱۲ امتیاز)
      if(profile.skinTone && p.colorHarmony && p.colorHarmony[profile.skinTone]){
        score += 12 * p.colorHarmony[profile.skinTone];
        if(p.colorHarmony[profile.skinTone] > 0.8){
          reasons.push(`به رنگ پوست ${skinMap[profile.skinTone]} شما می‌آید`);
        }
      }

      // ۵. تطابق فرم بدن (۸ امتیاز)
      if(profile.bodyType && p.bodyTypeFit && p.bodyTypeFit[profile.bodyType]){
        score += 8 * p.bodyTypeFit[profile.bodyType];
        if(p.bodyTypeFit[profile.bodyType] > 0.8){
          reasons.push(`برای فرم بدن ${bodyMap[profile.bodyType]} شما مناسب است`);
        }
      }

      // ۶. ترند (۵ امتیاز)
      if(p.trendScore){
        score += 5 * p.trendScore;
        if(p.trendScore > 0.85) reasons.push('🔥 ترند فصل');
      }

      // ۷. امتیاز (۵ امتیاز)
      if(p.rating){
        score += 5 * (p.rating / 5);
        if(p.rating >= 4.7) reasons.push(`⭐ امتیاز ${p.rating}`);
      }

      // ۸. تخفیف (۳ امتیاز)
      if(p.discount){
        score += 3 * (p.discount / 100);
        if(p.discount > 20) reasons.push(`٪${p.discount} تخفیف`);
      }

      // ۹. پرفروش (۲ امتیاز)
      if(p.sold > 1500){
        score += 2;
        if(p.sold > 2000) reasons.push(`🔥 ${p.sold} فروش`);
      }

      // ۱۰. بودجه (۵ امتیاز)
      if(profile.budget === 'low' && p.price < 500000) score += 5;
      else if(profile.budget === 'medium' && p.price >= 500000 && p.price < 1500000) score += 5;
      else if(profile.budget === 'high' && p.price >= 1500000 && p.price < 3000000) score += 5;
      else if(profile.budget === 'luxury' && p.price >= 3000000) score += 5;

      // ۱۱. اولویت با محصول واقعی فروشنده (بسیار مهم)
      if(p.isSellerProduct) score += 8;

      // ۱۲. اولویت با محصول موجود
      if(p.inStock) score += 2;

      // دلایل پیش‌فرض
      if(reasons.length === 0){
        if(p.isSellerProduct) reasons.push('🏪 محصول فروشنده معتبر');
        else reasons.push('✨ پیشنهاد ویژه');
        if(p.rating >= 4.5) reasons.push(`⭐ امتیاز ${p.rating}`);
      }

      // درصد تطابق واقعی
      const matchPercent = Math.max(45, Math.min(95, Math.round(score)));

      return {
        ...p,
        score: Math.round(score * 10) / 10,
        matchPercent: matchPercent,
        reasons: reasons.slice(0, 3)
      };
    });

    // حذف محصولات ضعیف
    let filtered = scored.filter(p => p.score >= 25);
    filtered.sort((a, b) => b.score - a.score);

    // تنوع دسته‌بندی
    const catCount = {};
    const result = [];
    for(const p of filtered){
      const key = p.subcategory || p.category;
      // اولویت: محصول واقعی فروشنده
      const isPriority = p.isSellerProduct;
      // محصول واقعی فروشنده: حداکثر ۳ از هر دسته، دمو: حداکثر ۱
      const maxPerCat = isPriority ? 3 : 1;
      if((catCount[key] || 0) >= maxPerCat) continue;
      catCount[key] = (catCount[key] || 0) + 1;
      result.push(p);
      if(result.length >= lim) break;
    }

    if(result.length < lim){
      for(const p of filtered){
        if(!result.find(r => r.id === p.id)){
          result.push(p);
          if(result.length >= lim) break;
        }
      }
    }

    return result;
  };

  // پیشنهاد بر اساس محصول (مشابه)
  DPProducts.similar = function(productId, limit){
    const product = DPProducts.all().find(p => p.id === productId);
    if(!product) return DPProducts.trending(limit || 4);

    return DPProducts.all().filter(p => p.id !== productId).map(p => {
      let score = 0;
      // هم‌دسته
      if(p.category === product.category) score += 30;
      if(p.subcategory === product.subcategory) score += 20;
      // هم‌جنسیت
      if(p.gender === product.gender) score += 15;
      // هم‌استایل
      if(p.styles && product.styles){
        const common = p.styles.filter(s => product.styles.includes(s));
        score += common.length * 10;
      }
      // هم‌رنگ
      if(p.colors && product.colors){
        const common = p.colors.filter(c => product.colors.includes(c));
        score += common.length * 5;
      }
      return {...p, _simScore: score};
    }).sort((a, b) => b._simScore - a._simScore).slice(0, limit || 4);
  };

  console.log('🛍️ DPProducts v5.0 loaded - فقط محصولات واقعی فروشنده‌ها از localStorage/سرور');
})();
