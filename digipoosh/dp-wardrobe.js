/* ============================================================
   دیجی‌پوش — کمد دیجیتال v2.0 MAX (Wardrobe Smart)
   ------------------------------------------------------------
   وقتی خرید نهایی می‌شود، کالاها وارد کمد می‌شوند.
   🆕 v2.0:
   - Smart Outfit Builder با ۱۰ قالب آماده
   - Cost Per Wear: هزینه هر بار پوشیدن
   - Color Coverage: چه رنگ‌هایی هست/کم است
   - Missing Items: چه چیزی باید بخری
   - Wear Stats: نمودار استفاده
   - Season Auto-Detect: تشخیص خودکار فصل از رنگ
   - Occasion Coverage: پوشش موقعیت‌ها
   ============================================================ */
'use strict';

(function () {
  if (window.DPWardrobe) return;

  const KEY = 'dp_wardrobe';
  const TAGS_KEY = 'dp_wardrobe_tags';
  const OUTFITS_KEY = 'dp_outfits';

  /* ---------- خواندن / نوشتن ---------- */
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  };
  const write = (v) => {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
  };
  const readTags = () => {
    try {
      const v = JSON.parse(localStorage.getItem(TAGS_KEY) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch { return {}; }
  };
  const writeTags = (v) => {
    try { localStorage.setItem(TAGS_KEY, JSON.stringify(v)); } catch {}
  };
  const readOutfits = () => {
    try {
      const v = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  };
  const writeOutfits = (v) => {
    try { localStorage.setItem(OUTFITS_KEY, JSON.stringify(v)); } catch {}
  };

  /* ============================================================
     افزودن از سفارش تکمیل‌شده
     ------------------------------------------------------------
     هر بار DPCart.checkout فراخوانی می‌شود، رویداد dp:order
     پرتاب می‌شود و این تابع هر آیتم سفارش را به کمد اضافه می‌کند.
     ============================================================ */
  function addFromOrder(order) {
    if (!order || !Array.isArray(order.lines)) return 0;
    const wardrobe = read();
    let added = 0;

    (order.lines || []).forEach((line) => {
      const exists = wardrobe.find(
        (w) => w.productId === line.productId &&
               w.color === line.color &&
               w.size === line.size &&
               w.orderId === order.id
      );
      if (exists) return;

      wardrobe.push({
        id: 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        productId: String(line.productId || ''),
        name: line.name || 'محصول',
        price: Number(line.price) || 0,
        color: line.color || '',
        size: line.size || '',
        qty: Number(line.qty) || 1,
        orderId: order.id,
        sellerId: order.sellerId || '',
        purchasedAt: order.date || new Date().toLocaleDateString('fa-IR'),
        addedAt: new Date().toISOString(),
        // فیلدهای بعدی
        tags: [],
        lastWorn: null,
        wornCount: 0,
        favorite: false,
        status: 'active',  // active | donated | sold | archived
        notes: ''
      });
      added++;
    });

    if (added > 0) write(wardrobe);
    return added;
  }

  /* ============================================================
     مدیریت کمد
     ============================================================ */
  function all() { return read(); }

  function byId(id) {
    return read().find((w) => w.id === id) || null;
  }

  function remove(id) {
    write(read().filter((w) => w.id !== id));
    return true;
  }

  function update(id, patch) {
    const wardrobe = read();
    const i = wardrobe.findIndex((w) => w.id === id);
    if (i < 0) return false;
    wardrobe[i] = { ...wardrobe[i], ...patch };
    write(wardrobe);
    return wardrobe[i];
  }

  function markWorn(id) {
    const w = byId(id);
    if (!w) return false;
    return update(id, {
      lastWorn: new Date().toISOString(),
      wornCount: (w.wornCount || 0) + 1
    });
  }

  function toggleFavorite(id) {
    const w = byId(id);
    if (!w) return false;
    return update(id, { favorite: !w.favorite });
  }

  function addTag(id, tag) {
    const w = byId(id);
    if (!w || !tag) return false;
    const tags = (w.tags || []).slice();
    if (!tags.includes(tag)) tags.push(tag);
    return update(id, { tags });
  }

  function removeTag(id, tag) {
    const w = byId(id);
    if (!w) return false;
    return update(id, { tags: (w.tags || []).filter((t) => t !== tag) });
  }

  /* ============================================================
     فیلتر و دسته‌بندی
     ============================================================ */
  function filterBy(criteria) {
    let list = read();
    if (criteria.category) list = list.filter((w) => w.category === criteria.category);
    if (criteria.color) list = list.filter((w) => w.color === criteria.color);
    if (criteria.season) list = list.filter((w) => w.season === criteria.season);
    if (criteria.status) list = list.filter((w) => (w.status || 'active') === criteria.status);
    if (criteria.favorite) list = list.filter((w) => w.favorite);
    if (criteria.search) {
      const s = String(criteria.search).toLowerCase();
      list = list.filter((w) =>
        (w.name || '').toLowerCase().includes(s) ||
        (w.tags || []).some((t) => t.toLowerCase().includes(s))
      );
    }
    return list;
  }

  function groupBy(field) {
    const groups = {};
    read().forEach((w) => {
      const key = w[field] || 'نامشخص';
      (groups[key] = groups[key] || []).push(w);
    });
    return groups;
  }

  /* ============================================================
     آمار کمد
     ============================================================ */
  function stats() {
    const items = read();
    const total = items.length;
    const totalValue = items.reduce((a, w) => a + (Number(w.price) || 0) * (Number(w.qty) || 1), 0);
    const favorites = items.filter((w) => w.favorite).length;
    const worn = items.filter((w) => w.wornCount > 0).length;
    const neverWorn = items.filter((w) => !w.lastWorn).length;

    // دسته‌بندی بر اساس رنگ
    const colorCount = {};
    items.forEach((w) => {
      if (w.color) colorCount[w.color] = (colorCount[w.color] || 0) + 1;
    });
    const topColors = Object.entries(colorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => ({ color, count }));

    // آیتم‌های قدیمی (بیش از ۹۰ روز نپوشیده)
    const stale = items.filter((w) => {
      if (!w.lastWorn) return false;
      const days = (Date.now() - new Date(w.lastWorn).getTime()) / (1000 * 60 * 60 * 24);
      return days > 90;
    });

    // بیشترین پوشیده‌شده
    const mostWorn = items
      .filter((w) => w.wornCount > 0)
      .sort((a, b) => b.wornCount - a.wornCount)
      .slice(0, 5);

    return {
      total,
      totalValue,
      favorites,
      worn,
      neverWorn,
      topColors,
      staleCount: stale.length,
      stale,
      mostWorn,
      avgPrice: total > 0 ? Math.round(totalValue / total) : 0
    };
  }

  /* ============================================================
     پیشنهاد ست (Outfit Suggestion) با AI
     ------------------------------------------------------------
     از DPTasteEngine استفاده می‌کند تا ست‌های هماهنگ بسازد.
     ============================================================ */
  function suggestOutfits(profile) {
    const items = read().filter((w) => w.status !== 'archived');
    if (items.length < 2) return [];

    const profileColors = (profile && profile.preferredColors) || [];
    const profileStyles = (profile && profile.preferredStyles) || [];
    const outfits = [];

    // استخراج دسته‌ها
    const byCategory = {};
    items.forEach((w) => {
      const cat = (w.category || extractCategory(w.name) || 'other');
      (byCategory[cat] = byCategory[cat] || []).push(w);
    });

    // ۱) ست‌های تصادفی هوشمند
    const tryCombine = (top, bottom, acc) => {
      if (!top || !bottom) return;
      const score = outfitScore(top, bottom, profileColors, profileStyles);
      if (score < 50) return;
      outfits.push({
        id: 'o_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        items: [top, bottom, ...(acc || [])],
        score,
        reasons: outfitReasons(top, bottom, profileColors, profileStyles)
      });
    };

    // ترکیب‌های ممکن
    const tops = [...(byCategory['پیراهن'] || []), ...(byCategory['تی‌شرت'] || []),
                  ...(byCategory['بلوز'] || []), ...(byCategory['تاپ'] || []),
                  ...(byCategory['مانتو'] || []), ...(byCategory['کت'] || []),
                  ...(byCategory['ژاکت'] || [])];
    const bottoms = [...(byCategory['شلوار'] || []), ...(byCategory['دامن'] || []),
                     ...(byCategory['شورت'] || [])];
    const shoes = [...(byCategory['کفش'] || []), ...(byCategory['بوت'] || []),
                   ...(byCategory['صندل'] || [])];
    const accs = [...(byCategory['اکسسوری'] || []), ...(byCategory['کیف'] || []),
                  ...(byCategory['کمربند'] || []), ...(byCategory['شال'] || [])];

    // ساخت ترکیب‌های تصادفی
    const maxCombos = Math.min(8, tops.length * bottoms.length);
    let made = 0;
    const shuffledTops = shuffle(tops);
    const shuffledBottoms = shuffle(bottoms);

    for (let i = 0; i < shuffledTops.length && made < maxCombos; i++) {
      for (let j = 0; j < shuffledBottoms.length && made < maxCombos; j++) {
        const top = shuffledTops[i];
        const bottom = shuffledBottoms[j];
        const acc = shoes.length > 0 ? [shoes[Math.floor(Math.random() * shoes.length)]] : [];
        if (acc.length > 0 && shoes.length > 1) {
          // سعی کن ۱ آیتم اکسسوری هم اضافه کن
          if (accs.length > 0) acc.push(accs[Math.floor(Math.random() * accs.length)]);
        }
        tryCombine(top, bottom, acc);
        made++;
      }
    }

    // حذف تکراری‌ها
    const seen = new Set();
    const unique = [];
    outfits.forEach((o) => {
      const key = o.items.map((i) => i.id).sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(o);
    });

    return unique.sort((a, b) => b.score - a.score).slice(0, 6);
  }

  function outfitScore(top, bottom, profileColors, profileStyles) {
    let score = 60;
    if (profileColors.includes(top.color)) score += 12;
    if (profileColors.includes(bottom.color)) score += 12;
    if (top.color && bottom.color && isHarmonious(top.color, bottom.color)) score += 15;
    if (top.tags && top.tags.some((t) => profileStyles.includes(t))) score += 8;
    if (bottom.tags && bottom.tags.some((t) => profileStyles.includes(t))) score += 8;
    return Math.min(100, score);
  }

  function outfitReasons(top, bottom, profileColors, profileStyles) {
    const r = [];
    if (profileColors.includes(top.color)) r.push(`🎨 ${top.color} از رنگ‌های دلخواهته`);
    if (profileColors.includes(bottom.color)) r.push(`🎨 ${bottom.color} هماهنگ با سلیقه‌ات`);
    if (top.color && bottom.color && isHarmonious(top.color, bottom.color)) {
      r.push('✨ ترکیب رنگ هماهنگ');
    }
    if (r.length === 0) r.push('👌 ترکیب متعادل');
    return r;
  }

  function isHarmonious(c1, c2) {
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    // رنگ‌های مکمل ساده
    const pairs = {
      'black': ['white', 'gold', 'silver', 'red', 'cream'],
      'white': ['black', 'navy', 'red', 'blue', 'green'],
      'navy': ['white', 'cream', 'gold', 'beige'],
      'cream': ['brown', 'navy', 'burgundy', 'gold'],
      'gold': ['black', 'navy', 'burgundy', 'emerald'],
      'red': ['black', 'white', 'navy'],
      'green': ['cream', 'beige', 'brown'],
      'blue': ['white', 'cream', 'gray'],
      'burgundy': ['gold', 'cream', 'navy'],
    };
    return (pairs[c1] || []).includes(c2);
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

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================================================
     پاکسازی / همگام‌سازی با سفارش‌ها
     ------------------------------------------------------------
     هر بار صفحه لود می‌شود، سفارش‌های تکمیل‌شده بررسی می‌شوند
     و اگر محصولی از قلم افتاده، به کمد اضافه می‌شود.
     ============================================================ */
  function syncFromOrders() {
    const orders = (() => {
      try { return JSON.parse(localStorage.getItem('dp_orders') || '[]') || []; } catch { return []; }
    })();

    const user = window.DPUser?.me();
    if (!user) return 0;

    let total = 0;
    orders
      .filter((o) => o.userId === user.id && (o.status === 'paid' || o.status === 'delivered' || o.status === 'pending' || o.status === 'confirmed'))
      .forEach((o) => { total += addFromOrder(o); });

    return total;
  }

  /* ============================================================
     اتصال به DPCart.checkout
     ============================================================ */
  function hookCheckout() {
    if (!window.DPCart) {
      setTimeout(hookCheckout, 200);
      return;
    }
    const origCheckout = window.DPCart.checkout;
    if (origCheckout.__hooked) return;

    window.DPCart.checkout = function (info) {
      const result = origCheckout.call(this, info);
      // بعد از ثبت موفق، آیتم‌ها به کمد اضافه می‌شوند
      try {
        const orders = (() => {
          try { return JSON.parse(localStorage.getItem('dp_orders') || '[]') || []; } catch { return []; }
        })();
        const user = window.DPUser?.me();
        if (!user) return result;
        const justMade = result.orders || [];
        justMade.forEach((oid) => {
          const order = orders.find((o) => o.id === oid);
          if (order) addFromOrder(order);
        });
      } catch (e) {
        console.warn('[wardrobe] همگام‌سازی پس از خرید ناموفق بود', e);
      }
      return result;
    };
    window.DPCart.checkout.__hooked = true;
    console.log('👔 DPWardrobe hooked into DPCart.checkout');
  }

  /* ============================================================
     Outfit ها (ست‌های ذخیره‌شده)
     ============================================================ */
  function saveOutfit(name, itemIds) {
    const outfits = readOutfits();
    const o = {
      id: 'o_' + Date.now(),
      name: name || 'ست من',
      itemIds: itemIds || [],
      createdAt: new Date().toISOString()
    };
    outfits.push(o);
    writeOutfits(outfits);
    return o;
  }
  function listOutfits() { return readOutfits(); }
  function removeOutfit(id) {
    writeOutfits(readOutfits().filter((o) => o.id !== id));
    return true;
  }

  /* ============================================================
     هوک کردن خودکار وقتی صفحه لود شد
     ============================================================ */
  function init() {
    hookCheckout();
    // همگام‌سازی اولیه
    setTimeout(syncFromOrders, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  /* ============================================================
     🆕 v2.0: توابع هوشمند جدید
     ============================================================ */

  // محاسبه Cost Per Wear (هزینه هر بار پوشیدن)
  function costPerWear(id) {
    const w = byId(id);
    if (!w) return 0;
    const worn = w.wornCount || 0;
    if (worn === 0) return w.price || 0;
    return Math.round((w.price || 0) / worn);
  }

  // پوشش رنگی کمد
  function colorCoverage() {
    const items = read();
    const total = items.length;
    if (!total) return { coverage: 0, present: [], missing: [], distribution: {} };

    const colorCount = {};
    items.forEach(w => {
      if (w.color) {
        const c = w.color.toLowerCase();
        colorCount[c] = (colorCount[c] || 0) + 1;
      }
    });

    // رنگ‌های پایه‌ای که هر کمد باید داشته باشد
    const essentials = ['black', 'white', 'gray', 'navy', 'beige', 'cream', 'blue', 'red'];
    const present = essentials.filter(c => colorCount[c] > 0);
    const missing = essentials.filter(c => !colorCount[c]);

    return {
      coverage: Math.round((present.length / essentials.length) * 100),
      present,
      missing,
      distribution: colorCount,
      totalColors: Object.keys(colorCount).length
    };
  }

  // آیتم‌های پیشنهادی برای تکمیل کمد
  function missingItems(profile) {
    const items = read();
    const categories = {};
    items.forEach(w => {
      const cat = w.category || extractCategory(w.name);
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const essentials = {
      'پیراهن': 3, 'تی‌شرت': 5, 'شلوار': 3, 'دامن': 2,
      'کت': 1, 'پالتو': 1, 'کفش': 3, 'کیف': 2,
      'اکسسوری': 4, 'شال': 2
    };

    const missing = [];
    Object.entries(essentials).forEach(([cat, need]) => {
      const have = categories[cat] || 0;
      if (have < need) {
        missing.push({
          category: cat,
          have,
          need,
          shortage: need - have,
          priority: need - have >= 2 ? 'high' : 'medium'
        });
      }
    });

    // بر اساس پروفایل، رنگ پیشنهاد بده
    const cc = colorCoverage();
    if (cc.missing.length) {
      missing.unshift({
        category: 'رنگ‌های پایه',
        have: cc.present.length,
        need: 8,
        shortage: cc.missing.length,
        colors: cc.missing,
        priority: 'high'
      });
    }

    return missing.sort((a, b) => (b.shortage || 0) - (a.shortage || 0));
  }

  // Outfit Templates - ۱۰ قالب آماده
  const OUTFIT_TEMPLATES = [
    { name: 'اسپرت روزمره', items: ['تی‌شرت', 'شلوار جین', 'کفش کتانی'], occasion: 'casual', score: 85 },
    { name: 'رسمی اداری', items: ['پیراهن', 'شلوار پارچه‌ای', 'کت', 'کفش رسمی'], occasion: 'work', score: 90 },
    { name: 'مهمانی شب', items: ['پیراهن مجلسی', 'کفش پاشنه بلند', 'اکسسوری'], occasion: 'party', score: 88 },
    { name: 'تاریخ عاشقانه', items: ['بلوز', 'دامن', 'کفش پاشنه', 'شال'], occasion: 'date', score: 87 },
    { name: 'سفر و گردش', items: ['تی‌شرت', 'شلوار راحتی', 'کفش راحتی', 'کوله'], occasion: 'travel', score: 80 },
    { name: 'ورزش و باشگاه', items: ['تاپ ورزشی', 'شلوار ورزشی', 'کفش ورزشی'], occasion: 'sport', score: 92 },
    { name: 'ساحل و استخر', items: ['مایو', 'کلاه', 'صندل', 'عینک'], occasion: 'beach', score: 85 },
    { name: 'مجلسی عروسی', items: ['پیراهن بلند', 'کفش مجلسی', 'کیف کلاچ', 'جواهرات'], occasion: 'wedding', score: 95 },
    { name: 'پاییزه گرم', items: ['ژاکت', 'شلوار', 'بوت', 'شال گردن'], occasion: 'casual', score: 86 },
    { name: 'تابستانی خنک', items: ['بلوز نخی', 'شلوارک', 'صندل', 'کلاه لبه‌دار'], occasion: 'casual', score: 84 }
  ];

  // ساخت ست هوشمند بر اساس موقعیت
  function buildOutfitForOccasion(occasion, profile) {
    const items = read().filter(w => w.status !== 'archived');
    const template = OUTFIT_TEMPLATES.find(t => t.occasion === occasion) || OUTFIT_TEMPLATES[0];

    const built = [];
    const missing = [];

    template.items.forEach(categoryName => {
      const matches = items.filter(w => {
        const cat = w.category || extractCategory(w.name);
        return cat.includes(categoryName.split(' ')[0]) || w.name.includes(categoryName.split(' ')[0]);
      });
      if (matches.length > 0) {
        // انتخاب بهترین بر اساس رنگ پروفایل
        let best = matches[0];
        let bestScore = 0;
        matches.forEach(m => {
          let s = 50;
          if (profile && profile.preferredColors) {
            if (profile.preferredColors.includes(m.color)) s += 25;
            if (profile.preferredColors.includes(normalizeColor(m.color))) s += 15;
          }
          if (s > bestScore) { bestScore = s; best = m; }
        });
        built.push({ ...best, slot: categoryName });
      } else {
        missing.push(categoryName);
      }
    });

    return {
      template: template.name,
      occasion,
      built,
      missing,
      score: Math.round((built.length / template.items.length) * template.score),
      completeness: Math.round((built.length / template.items.length) * 100)
    };
  }

  // تشخیص خودکار فصل از رنگ
  function detectSeasonFromColor(color) {
    if (!color) return 'all';
    const c = color.toLowerCase();
    const spring = ['coral', 'peach', 'mint', 'lavender', 'light-blue', 'pink', 'yellow', 'green', 'floral'];
    const summer = ['white', 'beige', 'sky-blue', 'turquoise', 'coral', 'light-yellow', 'cream'];
    const autumn = ['burgundy', 'mustard', 'olive', 'rust', 'brown', 'terracotta', 'tan', 'camel', 'ochre'];
    const winter = ['black', 'navy', 'charcoal', 'dark-gray', 'burgundy', 'emerald', 'cobalt', 'deep-red', 'purple'];

    if (spring.some(s => c.includes(s))) return 'spring';
    if (summer.some(s => c.includes(s))) return 'summer';
    if (autumn.some(s => c.includes(s))) return 'autumn';
    if (winter.some(s => c.includes(s))) return 'winter';
    return 'all';
  }

  // نرمالایز کردن نام رنگ
  function normalizeColor(c) {
    if (!c) return '';
    const n = c.toLowerCase();
    const map = {
      'مشکی': 'black', 'سفید': 'white', 'قرمز': 'red', 'آبی': 'blue',
      'سبز': 'green', 'زرد': 'yellow', 'صورتی': 'pink', 'بنفش': 'purple',
      'نارنجی': 'orange', 'قهوه‌ای': 'brown', 'خاکستری': 'gray',
      'طلایی': 'gold', 'نقره‌ای': 'silver', 'کرم': 'cream', 'بژ': 'beige',
      'سرمه‌ای': 'navy', 'زیتونی': 'olive', 'خردلی': 'mustard',
      'مرجانی': 'coral', 'هلویی': 'peach'
    };
    return map[n] || n;
  }

  // آمار استفاده از هر لباس
  function wearStats() {
    const items = read();
    const worn = items.filter(w => w.wornCount > 0);
    const never = items.filter(w => !w.wornCount);
    const totalWearCount = worn.reduce((a, w) => a + w.wornCount, 0);

    return {
      totalItems: items.length,
      wornItems: worn.length,
      neverWorn: never.length,
      wearRate: items.length > 0 ? Math.round((worn.length / items.length) * 100) : 0,
      totalWears: totalWearCount,
      avgWears: worn.length > 0 ? Math.round(totalWearCount / worn.length) : 0,
      topWorn: worn.sort((a, b) => b.wornCount - a.wornCount).slice(0, 5),
      neglected: never.slice(0, 5).map(w => ({ ...w, daysSinceAdded: Math.round((Date.now() - new Date(w.addedAt).getTime()) / 86400000) }))
    };
  }

  // پوشش موقعیت‌ها
  function occasionCoverage() {
    const items = read();
    const occ = { casual: 0, work: 0, party: 0, sport: 0, date: 0, formal: 0, beach: 0, travel: 0 };
    items.forEach(w => {
      const cat = (w.category || extractCategory(w.name) || '').toLowerCase();
      const name = (w.name || '').toLowerCase();
      if (cat.includes('تی') || name.includes('تیشرت') || cat.includes('ژاکت')) occ.casual++;
      if (cat.includes('کت') || name.includes('پیراهن رسمی') || cat.includes('پیراهن')) occ.work++;
      if (cat.includes('مجلسی') || name.includes('شب')) occ.party++;
      if (cat.includes('ورزشی') || name.includes('ورزش')) occ.sport++;
      if (cat.includes('دامن') || name.includes('دخترانه')) occ.date++;
      if (name.includes('مجلسی') || name.includes('عروسی')) occ.formal++;
      if (name.includes('ساحل') || cat.includes('مایو')) occ.beach++;
      if (name.includes('سفر') || cat.includes('کوله')) occ.travel++;
    });
    return occ;
  }

  // اضافه کردن آیتم دستی
  function addManual(item) {
    if (!item || !item.name) return null;
    const wardrobe = read();
    const w = {
      id: 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      productId: item.productId || ('manual_' + Date.now()),
      name: item.name,
      price: Number(item.price) || 0,
      color: item.color || '',
      size: item.size || '',
      category: item.category || extractCategory(item.name),
      qty: 1,
      orderId: 'manual',
      sellerId: '',
      purchasedAt: new Date().toLocaleDateString('fa-IR'),
      addedAt: new Date().toISOString(),
      tags: item.tags || [],
      lastWorn: null,
      wornCount: 0,
      favorite: false,
      status: 'active',
      season: detectSeasonFromColor(item.color),
      notes: item.notes || ''
    };
    wardrobe.push(w);
    write(wardrobe);
    return w;
  }

  // نمایش بر اساس فصل
  function bySeason(season) {
    return read().filter(w => {
      const detected = detectSeasonFromColor(w.color);
      if (season === 'all') return true;
      return detected === season;
    });
  }

  /* ============================================================
     API عمومی
     ============================================================ */
  window.DPWardrobe = {
    version: '2.0 MAX',
    addFromOrder, addManual, all, byId, remove, update,
    markWorn, toggleFavorite, addTag, removeTag,
    filterBy, groupBy, stats,
    suggestOutfits, saveOutfit, listOutfits, removeOutfit,
    syncFromOrders,
    // 🆕 v2.0
    costPerWear, colorCoverage, missingItems,
    buildOutfitForOccasion, detectSeasonFromColor,
    wearStats, occasionCoverage, bySeason, normalizeColor,
    OUTFIT_TEMPLATES
  };

  console.log('👔 DPWardrobe v2.0 MAX loaded — Smart Outfit Builder + 10 Templates');
})();
