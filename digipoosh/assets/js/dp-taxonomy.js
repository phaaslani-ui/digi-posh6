/* ============================================================
   دیجی‌پوش — درخت دسته‌بندی کالاها
   ------------------------------------------------------------
   سه سطح:
     ۱. بخش   → زنانه / مردانه / بچگانه / نوجوان
     ۲. سبک   → رسمی / اسپرت / خانگی / ورزشی / …
     ۳. کالا  → پیراهن / شلوار / کفش / …

   فروشنده محدود به یک بخش نیست؛ موقع افزودن هر محصول،
   بخش و سبک و نوع کالا را جداگانه انتخاب می‌کند.
   ============================================================ */
'use strict';

(function () {

  /* آیکون‌های خطی هر بخش */
  const SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const ICON = {
    women: `<path d="M9 3.5h6l-1.2 3.2 3.7 4.1-1.5 2.2v7.5H8v-7.5L6.5 10.8l3.7-4.1z"/>`,
    men:   `<path d="M8 3.5 12 7l4-3.5 4 2.2v14.8H4V5.7z"/><path d="M12 7v13.5"/>`,
    kids:  `<circle cx="12" cy="6.5" r="2.8"/><path d="M12 9.3v6M8 12h8M9.5 20.5 12 15.3l2.5 5.2"/>`,
    teen:  `<path d="M7.6 8h8.8a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.3l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.6 8Z"/>`,
  };

  /* ============================================================
     درخت کامل
     ============================================================ */
  const TREE = {
    women: {
      label: 'پوشاک زنانه',
      note: 'مانتو، مجلسی، روزمره و اکسسوری',
      page: 'woman/index.html',
      groups: {
        formal: {
          label: 'رسمی و اداری',
          note: 'برای محیط کار و جلسه‌های رسمی',
          items: ['مانتو اداری', 'کت و دامن', 'کت و شلوار زنانه', 'پیراهن رسمی',
                  'بلوز رسمی', 'دامن مداد‌ی', 'جلیقه'],
        },
        party: {
          label: 'مجلسی و شب',
          note: 'مهمانی، عروسی و مناسبت‌های ویژه',
          items: ['لباس شب', 'پیراهن مجلسی', 'لباس عروس', 'لباس نامزدی',
                  'کت مجلسی', 'دامن مجلسی', 'شنل و پانچو'],
        },
        casual: {
          label: 'روزمره و اسپرت',
          note: 'راحت برای هر روز',
          items: ['مانتو روزمره', 'تی‌شرت', 'بلوز', 'شومیز', 'سویشرت و هودی',
                  'شلوار جین', 'شلوار پارچه‌ای', 'دامن روزمره', 'سارافون', 'تونیک'],
        },
        outer: {
          label: 'پاییزه و زمستانه',
          note: 'لایه‌های گرم بیرونی',
          items: ['پالتو', 'کاپشن', 'بارانی و ترنچ', 'جلیقه پفی', 'ژاکت و بافت', 'پانچو'],
        },
        home: {
          label: 'خانگی و راحتی',
          note: 'لباس داخل خانه و خواب',
          items: ['ست راحتی', 'لباس خواب', 'روب‌دوشامبر', 'شلوارک خانگی', 'تاپ خانگی'],
        },
        sport: {
          label: 'ورزشی',
          note: 'باشگاه، پیاده‌روی و یوگا',
          items: ['ست ورزشی', 'لگ ورزشی', 'تاپ ورزشی', 'سویشرت ورزشی', 'شلوار گرمکن'],
        },
        modest: {
          label: 'پوشش و حجاب',
          note: 'چادر، شال و روسری',
          items: ['چادر', 'مقنعه', 'شال', 'روسری', 'کلاه حجاب', 'مانتو بلند'],
        },
        under: {
          label: 'لباس زیر و جوراب',
          note: 'زیرپوش و جوراب',
          items: ['لباس زیر', 'زیرپوش حرارتی', 'جوراب', 'جوراب شلواری'],
        },
        shoes: {
          label: 'کفش',
          note: 'همه‌ی مدل‌های کفش',
          items: ['کفش پاشنه‌دار', 'کفش تخت', 'بوت و نیم‌بوت', 'کتانی', 'صندل', 'دمپایی'],
        },
        accessory: {
          label: 'کیف و اکسسوری',
          note: 'تکمیل‌کننده‌ی استایل',
          items: ['کیف دستی', 'کیف دوشی', 'کوله‌پشتی', 'کمربند', 'دستکش',
                  'کلاه', 'عینک آفتابی', 'زیورآلات'],
        },
      },
    },

    men: {
      label: 'پوشاک مردانه',
      note: 'کت و شلوار، پیراهن، اسپرت و کفش',
      page: 'man/index.html',
      groups: {
        formal: {
          label: 'رسمی و اداری',
          note: 'کت و شلوار و پیراهن اداری',
          items: ['کت و شلوار', 'کت تک', 'شلوار پارچه‌ای', 'پیراهن رسمی',
                  'جلیقه', 'کراوات و پاپیون', 'ست دامادی'],
        },
        casual: {
          label: 'روزمره و اسپرت',
          note: 'راحت و شیک برای هر روز',
          items: ['تی‌شرت', 'پولوشرت', 'پیراهن اسپرت', 'سویشرت و هودی',
                  'شلوار جین', 'شلوار کتان', 'شلوارک', 'ژاکت و بافت'],
        },
        outer: {
          label: 'پاییزه و زمستانه',
          note: 'کاپشن و پالتو',
          items: ['کاپشن', 'پالتو', 'بارانی و ترنچ', 'جلیقه پفی',
                  'کاپشن چرم', 'کاپشن جین'],
        },
        home: {
          label: 'خانگی و راحتی',
          note: 'لباس داخل خانه',
          items: ['ست راحتی', 'لباس خواب', 'شلوارک خانگی', 'رکابی خانگی'],
        },
        sport: {
          label: 'ورزشی',
          note: 'باشگاه و ورزش',
          items: ['ست ورزشی', 'تی‌شرت ورزشی', 'شلوار گرمکن', 'شورت ورزشی',
                  'سویشرت ورزشی', 'لباس فوتبال'],
        },
        traditional: {
          label: 'سنتی و مجلسی',
          note: 'لباس‌های سنتی ایرانی',
          items: ['پیراهن سنتی', 'شلوار سنتی', 'عبا و قبا', 'ست سنتی'],
        },
        under: {
          label: 'لباس زیر و جوراب',
          note: 'زیرپوش و جوراب',
          items: ['زیرپوش', 'شورت', 'زیرپوش حرارتی', 'جوراب'],
        },
        shoes: {
          label: 'کفش',
          note: 'رسمی، اسپرت و ورزشی',
          items: ['کفش رسمی چرم', 'کفش کلاسیک', 'کتانی', 'بوت و نیم‌بوت',
                  'صندل', 'دمپایی'],
        },
        accessory: {
          label: 'کیف و اکسسوری',
          note: 'تکمیل‌کننده‌ی استایل',
          items: ['کیف اداری', 'کوله‌پشتی', 'کیف پول', 'کمربند',
                  'ساعت', 'عینک آفتابی', 'کلاه', 'شال گردن'],
        },
      },
    },

    kids: {
      label: 'پوشاک کودک',
      note: 'نوزاد تا ۱۲ سال',
      page: 'kids/index.html',
      groups: {
        baby: {
          label: 'نوزادی (۰ تا ۲ سال)',
          note: 'مخصوص نوزادان',
          items: ['سرهمی', 'بادی', 'ست نوزادی', 'پیشبند', 'کلاه نوزادی',
                  'پتو قنداق', 'جوراب نوزادی'],
        },
        girl: {
          label: 'دخترانه',
          note: 'برای دختربچه‌ها',
          items: ['پیراهن دخترانه', 'سارافون', 'دامن', 'تی‌شرت دخترانه',
                  'شلوار دخترانه', 'ست دخترانه', 'مانتو دخترانه'],
        },
        boy: {
          label: 'پسرانه',
          note: 'برای پسربچه‌ها',
          items: ['تی‌شرت پسرانه', 'پیراهن پسرانه', 'شلوار پسرانه',
                  'شلوارک', 'ست پسرانه', 'کت پسرانه'],
        },
        school: {
          label: 'مدرسه',
          note: 'فرم و لوازم مدرسه',
          items: ['فرم مدرسه', 'مانتو مدرسه', 'شلوار مدرسه',
                  'کیف مدرسه', 'جوراب مدرسه'],
        },
        outer: {
          label: 'پاییزه و زمستانه',
          note: 'گرم و راحت',
          items: ['کاپشن بچگانه', 'پالتو بچگانه', 'ژاکت و بافت',
                  'سویشرت و هودی', 'شال و کلاه'],
        },
        home: {
          label: 'خانگی و خواب',
          note: 'لباس راحتی بچه‌ها',
          items: ['ست راحتی', 'لباس خواب', 'رب‌دوشامبر', 'حوله‌تنی'],
        },
        party: {
          label: 'مجلسی و جشن',
          note: 'تولد و مهمانی',
          items: ['لباس مجلسی دخترانه', 'کت و شلوار پسرانه',
                  'لباس تولد', 'لباس فانتزی'],
        },
        shoes: {
          label: 'کفش',
          note: 'کفش بچگانه',
          items: ['کتانی بچگانه', 'کفش مدرسه', 'صندل', 'بوت', 'دمپایی'],
        },
        accessory: {
          label: 'اکسسوری و اسباب‌بازی',
          note: 'وسایل جانبی',
          items: ['کوله‌پشتی', 'کلاه', 'دستکش', 'گیره و تل مو',
                  'عروسک', 'اسباب‌بازی آموزشی'],
        },
      },
    },

    teen: {
      label: 'پوشاک نوجوان',
      note: 'استریت‌ویر و ترند روز، ۱۲ تا ۱۸ سال',
      page: 'teen/index.html',
      groups: {
        street: {
          label: 'استریت‌ویر',
          note: 'استایل خیابانی و ترند',
          items: ['هودی اورسایز', 'سویشرت', 'تی‌شرت اورسایز', 'کراپ‌تاپ',
                  'شلوار بگی', 'کارگو', 'جلیقه استریت'],
        },
        casual: {
          label: 'روزمره',
          note: 'راحت برای مدرسه و بیرون',
          items: ['تی‌شرت', 'پیراهن', 'شلوار جین', 'شلوارک',
                  'دامن', 'ست روزمره'],
        },
        sport: {
          label: 'ورزشی',
          note: 'ورزش و باشگاه',
          items: ['ست ورزشی', 'لگ', 'شلوار گرمکن', 'تاپ ورزشی',
                  'تی‌شرت ورزشی', 'لباس تیمی'],
        },
        gaming: {
          label: 'گیمینگ و فن‌آرت',
          note: 'طرح بازی، انیمه و موسیقی',
          items: ['تی‌شرت طرح‌دار', 'هودی گیمینگ', 'کلاه گیمینگ',
                  'ماسک و بند', 'تی‌شرت انیمه'],
        },
        outer: {
          label: 'پاییزه و زمستانه',
          note: 'کاپشن و بافت',
          items: ['کاپشن', 'بمبر جکت', 'کاپشن جین', 'پافر',
                  'ژاکت و بافت', 'شال گردن'],
        },
        party: {
          label: 'مجلسی و مهمانی',
          note: 'جشن و مناسبت',
          items: ['پیراهن مجلسی', 'کت اسپرت', 'ست مجلسی'],
        },
        shoes: {
          label: 'کفش',
          note: 'اسنیکر و کتانی',
          items: ['اسنیکر', 'کتانی ساقدار', 'کفش اسکیت', 'صندل', 'دمپایی'],
        },
        accessory: {
          label: 'اکسسوری',
          note: 'کامل‌کننده‌ی استایل',
          items: ['کوله‌پشتی', 'کیف کمری', 'کلاه', 'جوراب طرح‌دار',
                  'دستبند', 'گردنبند', 'عینک'],
        },
      },
    },
  };

  /* ============================================================
     ابزارها
     ============================================================ */

  /** فهرست بخش‌ها برای نمایش */
  function sections() {
    return Object.entries(TREE).map(([key, v]) => ({
      key, label: v.label, note: v.note, page: v.page, icon: ICON[key],
      groupCount: Object.keys(v.groups).length,
      itemCount: Object.values(v.groups).reduce((a, g) => a + g.items.length, 0),
    }));
  }

  /** سبک‌های یک بخش */
  function groups(section) {
    const s = TREE[section];
    if (!s) return [];
    return Object.entries(s.groups).map(([key, g]) => ({
      key, label: g.label, note: g.note, items: g.items,
    }));
  }

  /** نوع کالاهای یک سبک */
  function items(section, group) {
    return TREE[section]?.groups?.[group]?.items || [];
  }

  /** نام فارسی هر سطح */
  const sectionLabel = (s) => TREE[s]?.label || s || '';
  const groupLabel = (s, g) => TREE[s]?.groups?.[g]?.label || g || '';

  /** نشانی صفحه‌ی هر بخش */
  const sectionPage = (s) => TREE[s]?.page || 'index.html';

  /** مسیر کامل برای نمایش: «پوشاک مردانه › رسمی و اداری › پیراهن رسمی» */
  function trail(section, group, item) {
    return [sectionLabel(section), groupLabel(section, group), item]
      .filter(Boolean).join(' › ');
  }

  /** پیدا کردن بخش و سبک از روی نام کالا (برای داده‌های قدیمی) */
  function findByItem(name) {
    const n = String(name || '').trim();
    for (const [sKey, s] of Object.entries(TREE)) {
      for (const [gKey, g] of Object.entries(s.groups)) {
        if (g.items.includes(n)) return { section: sKey, group: gKey, item: n };
      }
    }
    /* ---------- کالاهای دست‌ساز فروشنده ----------
       اگر کالایی در درخت رسمی نبود، فروشنده می‌تواند خودش
       اضافه‌اش کند (مثلاً «پانچو»). آنها در `dp_custom_items`
       ذخیره می‌شوند و اینجا هم پیدا می‌شوند — وگرنه مسیر
       صفحه و فیلتر مشتری برایشان کار نمی‌کرد. */
    return findCustom(n);
  }

  /** جست‌وجو در کالاهای دست‌ساز فروشندگان */
  function findCustom(n) {
    let map;
    try { map = JSON.parse(localStorage.getItem('dp_custom_items')); }
    catch (e) { return null; }
    if (!map || typeof map !== 'object' || Array.isArray(map)) return null;

    for (const key of Object.keys(map)) {
      const list = map[key];
      if (!Array.isArray(list) || list.indexOf(n) < 0) continue;
      const [section, group] = String(key).split('/');
      if (!section || !group) continue;
      /* بخش و سبک باید واقعاً وجود داشته باشند */
      if (!TREE[section] || !TREE[section].groups[group]) continue;
      return { section, group, item: n, custom: true };
    }
    return null;
  }

  /** فهرست کالاهای یک سبک، همراه با دست‌ساخته‌ها */
  function itemsAll(section, group) {
    const base = items(section, group);
    let map;
    try { map = JSON.parse(localStorage.getItem('dp_custom_items')); }
    catch (e) { return base; }
    if (!map || typeof map !== 'object' || Array.isArray(map)) return base;

    const mine = map[section + '/' + group];
    if (!Array.isArray(mine)) return base;

    return base.concat(mine.filter(
      (x) => typeof x === 'string' && x.trim() && base.indexOf(x) < 0));
  }

  /** آیکون یک بخش */
  const sectionIcon = (s, cls = 'ico') =>
    `<svg class="${cls}" viewBox="0 0 24 24" ${SW} aria-hidden="true">${ICON[s] || ''}</svg>`;

  window.DPTaxonomy = {
    TREE, sections, groups, items,
    sectionLabel, groupLabel, sectionPage, sectionIcon, trail, findByItem,
    findCustom, itemsAll,
  };
})();
