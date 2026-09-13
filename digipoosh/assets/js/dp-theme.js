/* ============================================================
   دیجی‌پوش — تم بخشی فروشگاه
   ------------------------------------------------------------
   مسئله‌ای که حل می‌کند:

   مشتری از صفحه‌ی «نوجوان» روی یک فروشگاه می‌زند و به صفحه‌ای
   می‌رسد که هیچ نشانی از حال‌وهوای نوجوان ندارد — همان قالب
   خنثای همیشگی. حس پیوستگی می‌شکند.

   راه‌حل: فروشگاه تم بخشی را می‌گیرد که مشتری از آن آمده.

   چرا «مسیر ورود» و نه «دسته‌ی فروشنده»؟
   ------------------------------------------------------------
   چون در دیجی‌پوش یک فروشگاه می‌تواند همزمان کالای زنانه و
   مردانه داشته باشد. اگر تم را به فروشنده گره بزنیم، مشتری‌ای
   که از بخش مردانه آمده، فروشگاه را صورتی می‌بیند.

   با مسیر ورود، همان فروشگاه برای مشتریِ آمده از بخش نوجوان
   نئونی است و برای مشتریِ آمده از بخش زنانه رؤیایی — و هر دو
   درست است، چون هر کدام دنبال چیز دیگری آمده‌اند.

   ترتیب تصمیم‌گیری:
     ۱) پارامتر ?from= در نشانی      (مسیر ورود مشتری)
     ۲) انتخاب دستی فروشنده          (اگر تم را قفل کرده)
     ۳) بخشی که بیشترین کالا را دارد (حدس منطقی)
     ۴) دسته‌ی ثبت‌نام فروشنده
     ۵) تم پیش‌فرض زنانه
   ============================================================ */
'use strict';

(function () {

  var KEY_LOCK = 'dp_store_themes';   /* تم قفل‌شده‌ی هر فروشنده */
  var SECTIONS = ['women', 'men', 'kids', 'teen'];

  /* ============================================================
     ۱. تعریف کامل چهار تم
     ------------------------------------------------------------
     هر تم یک مجموعه متغیر CSS است. هیچ گزینشگری تکرار نمی‌شود؛
     فقط همین مقادیر عوض می‌شوند و کل صفحه رنگ می‌گیرد.
     ============================================================ */
  var THEMES = {

    /* ---------- زنانه: رؤیای زنانه ---------- */
    women: {
      key: 'women',
      label: 'زنانه',
      mood: 'لطیف و طلایی',
      dark: false,
      vars: {
        '--st-primary':   '#c9a84c',   /* طلای برند */
        '--st-second':    '#93634d',   /* شرابی گرم — ۴٫۵۶:۱ روی زمینه، ۴٫۹۲:۱ روی کارت */
        '--st-accent':    '#946254',   /* رز خاکی — ۴٫۵۶:۱ روی زمینه */
        '--st-bg':        '#f7f2ea',
        '--st-surface':   '#fdfbf7',
        '--st-ink':       '#1a1a1a',
        '--st-mute':      '#75695f',
        '--st-line':      'rgba(201, 168, 76, 0.32)',
        '--st-glow':      'rgba(201, 168, 76, 0.26)',
        '--st-radius':    '20px',
        '--st-radius-sm': '14px',
        '--st-bw':        '2.5px',
        '--st-on-primary': '#1a1a1a',
        '--st-shadow':    'rgba(140, 108, 60, 0.18)',
      },
      /* گرادیان از طلا شروع و به طلا ختم می‌شود — امضای برند */
      flow: 'linear-gradient(115deg, #c9a84c, #d4b85a, #b8907a, #d4b85a, #c9a84c)',
      shapes: 'petals',
      shapeCount: 7,
    },

    /* ---------- مردانه: اقتدار ---------- */
    men: {
      key: 'men',
      label: 'مردانه',
      mood: 'مقتدر و طلایی',
      dark: true,
      vars: {
        '--st-primary':   '#c9a84c',
        '--st-second':    '#d4b85a',   /* طلای روشن — ۷٫۵۸:۱ */
        '--st-accent':    '#c0c0c0',   /* نقره */
        '--st-bg':        '#111d33',
        '--st-surface':   '#1a2842',
        '--st-ink':       '#f2eee6',
        '--st-mute':      '#a3adbf',
        '--st-line':      'rgba(201, 168, 76, 0.34)',
        '--st-glow':      'rgba(201, 168, 76, 0.3)',
        '--st-radius':    '10px',
        '--st-radius-sm': '7px',
        '--st-bw':        '2.5px',
        '--st-on-primary': '#111d33',
        '--st-shadow':    'rgba(0, 0, 0, 0.5)',
      },
      flow: 'linear-gradient(115deg, #c9a84c, #d4b85a, #c0c0c0, #d4b85a, #c9a84c)',
      shapes: 'geo',
      shapeCount: 6,
    },

    /* ---------- بچگانه: زمین بازی ---------- */
    kids: {
      key: 'kids',
      label: 'بچگانه',
      mood: 'شاد و طلایی',
      dark: false,
      vars: {
        '--st-primary':   '#c9a84c',
        '--st-second':    '#876a1e',   /* طلای نوشتاری — ۴٫۵۸:۱ روی زمینه */
        '--st-accent':    '#966240',   /* نارنجی خاکی — ۴٫۵۸:۱ روی زمینه */
        '--st-bg':        '#f7f2ea',
        '--st-surface':   '#fdfbf7',
        '--st-ink':       '#1a1a1a',
        '--st-mute':      '#75695f',
        '--st-line':      'rgba(201, 168, 76, 0.34)',
        '--st-glow':      'rgba(201, 168, 76, 0.28)',
        '--st-radius':    '24px',
        '--st-radius-sm': '16px',
        '--st-bw':        '2.5px',
        '--st-on-primary': '#1a1a1a',
        '--st-shadow':    'rgba(150, 118, 66, 0.18)',
      },
      /* طیف طلا تا کهربا — شاد ولی هم‌خانواده‌ی برند */
      flow: 'linear-gradient(115deg, #c9a84c, #e0c266, #c98f4c, #e0c266, #c9a84c)',
      shapes: 'balloons',
      shapeCount: 8,
    },

    /* ---------- نوجوان: کافه‌ی گیمینگ ---------- */
    teen: {
      key: 'teen',
      label: 'نوجوان',
      mood: 'پرانرژی و طلایی',
      dark: true,
      vars: {
        '--st-primary':   '#c9a84c',
        '--st-second':    '#e0c266',   /* طلای درخشان — ۱۰٫۴۷:۱ */
        '--st-accent':    '#d4b85a',
        '--st-bg':        '#0d0c0a',   /* مشکی با ته‌مایه‌ی گرم */
        '--st-surface':   '#181510',
        '--st-ink':       '#f2eee6',
        '--st-mute':      '#a89f90',
        '--st-line':      'rgba(224, 194, 102, 0.38)',
        '--st-glow':      'rgba(201, 168, 76, 0.34)',
        '--st-radius':    '10px',
        '--st-radius-sm': '7px',
        '--st-bw':        '2.5px',
        '--st-on-primary': '#0d0c0a',
        '--st-shadow':    'rgba(0, 0, 0, 0.6)',
      },
      /* درخشش طلایی به‌جای رنگین‌کمان نئون */
      flow: 'linear-gradient(115deg, #c9a84c, #e0c266, #fff1c4, #e0c266, #c9a84c)',
      shapes: 'neon',
      shapeCount: 7,
    },
  };


  /* ============================================================
     ظاهرهای آماده
     ------------------------------------------------------------
     چرا این فهرست؟

     انتخاب هفت رنگ که کنار هم بنشینند و خوانا هم بمانند، کار
     یک طراح است نه یک فروشنده‌ی پوشاک. در آزمون دیدیم که
     فروشنده با نوزده کنترل روبه‌رو می‌شد و اغلب رها می‌کرد.

     حالا دوازده ظاهر آماده هست که همه‌شان:
       • حول طلای برند ساخته شده‌اند
       • کنتراست‌شان از پیش سنجیده شده (همه بالای ۴٫۵:۱)
       • با یک کلیک اعمال می‌شوند

     تنظیم دستی هنوز هست — ولی پشت دکمه‌ی «تنظیم پیشرفته»
     پنهان شده تا کسی که نمی‌خواهد، نبیندش.
     ============================================================ */
  var LOOKS = [
    { key: 'کرم-کلاسیک', label: 'کرم کلاسیک', mood: 'روشن و آرام',
      dark: false,
      bg: '#f7f2ea', surface: '#fdfbf7', ink: '#1a1a1a',
      mute: '#75695f', primary: '#c9a84c', second: '#85691e', accent: '#946240' },
    { key: 'صدفی', label: 'صدفی', mood: 'سفید و لطیف',
      dark: false,
      bg: '#faf7f2', surface: '#ffffff', ink: '#1a1a1a',
      mute: '#726960', primary: '#c9a84c', second: '#93634d', accent: '#8d684e' },
    { key: 'شنی', label: 'شنی', mood: 'گرم و خاکی',
      dark: false,
      bg: '#f2ece1', surface: '#faf6ef', ink: '#1f1b16',
      mute: '#6f6558', primary: '#c9a84c', second: '#8a5f2a', accent: '#8e5e3a' },
    { key: 'یشمی-روشن', label: 'یشمی روشن', mood: 'سبز ملایم',
      dark: false,
      bg: '#f0f4ef', surface: '#fafcf9', ink: '#16201a',
      mute: '#5f6b60', primary: '#c9a84c', second: '#3f6b4c', accent: '#7a6a2c' },
    { key: 'نیلی-روشن', label: 'نیلی روشن', mood: 'آبی آرام',
      dark: false,
      bg: '#eef2f7', surface: '#f9fbfd', ink: '#151a22',
      mute: '#5d6673', primary: '#c9a84c', second: '#3a5f86', accent: '#85691e' },
    { key: 'گلبهی', label: 'گلبهی', mood: 'صورتی خاکی',
      dark: false,
      bg: '#f8f0ee', surface: '#fdf9f8', ink: '#1f1817',
      mute: '#71625f', primary: '#c9a84c', second: '#95564f', accent: '#8d6352' },
    { key: 'سرمهای', label: 'سرمه‌ای', mood: 'تیره و رسمی',
      dark: true,
      bg: '#111d33', surface: '#1a2842', ink: '#f2eee6',
      mute: '#a3adbf', primary: '#c9a84c', second: '#d4b85a', accent: '#c0c0c0' },
    { key: 'زغالی', label: 'زغالی', mood: 'خاکستری تیره',
      dark: true,
      bg: '#16161a', surface: '#1f1f25', ink: '#f2f0ec',
      mute: '#a9a6a0', primary: '#c9a84c', second: '#d4b85a', accent: '#bfb8a8' },
    { key: 'شبانه-طلایی', label: 'شبانه طلایی', mood: 'مشکی گرم',
      dark: true,
      bg: '#0d0c0a', surface: '#181510', ink: '#f2eee6',
      mute: '#a89f90', primary: '#c9a84c', second: '#e0c266', accent: '#d4b85a' },
    { key: 'جنگلی', label: 'جنگلی', mood: 'سبز عمیق',
      dark: true,
      bg: '#101c16', surface: '#17281f', ink: '#eef2ec',
      mute: '#9db0a3', primary: '#c9a84c', second: '#d4b85a', accent: '#8fc2a0' },
    { key: 'شرابی', label: 'شرابی', mood: 'قرمز عمیق',
      dark: true,
      bg: '#1c1113', surface: '#28191c', ink: '#f4eeee',
      mute: '#b8a4a6', primary: '#c9a84c', second: '#d4b85a', accent: '#d99a9a' },
    { key: 'بنفش-شب', label: 'بنفش شب', mood: 'بنفش تیره',
      dark: true,
      bg: '#15111f', surface: '#1f1a2c', ink: '#f0eef5',
      mute: '#a9a3ba', primary: '#c9a84c', second: '#d4b85a', accent: '#b9a3e0' },
  ];

  /** ظاهر آماده → شیء سفارشی‌سازی */
  function lookToCustom(key) {
    var l = null;
    LOOKS.some(function (x) { if (x.key === key) { l = x; return true; } return false; });
    if (!l) return null;
    return {
      bg: l.bg, surface: l.surface, ink: l.ink, mute: l.mute,
      primary: l.primary, second: l.second, accent: l.accent,
      look: l.key,
    };
  }

  /** آیا سفارشی‌سازی جاری دقیقاً یکی از ظاهرهای آماده است؟ */
  function matchLook(c) {
    if (!c) return '';
    var hit = '';
    LOOKS.some(function (l) {
      if (c.bg === l.bg && c.surface === l.surface && c.ink === l.ink &&
          c.second === l.second && c.accent === l.accent) { hit = l.key; return true; }
      return false;
    });
    return hit;
  }

  /* ============================================================
     ۲. لایه‌ی تزئینی — همه SVG خطی، بدون ایموجی
     ------------------------------------------------------------
     چهار خانواده‌ی شکل، هرکدام با حال‌وهوای بخش خودش.
     ============================================================ */
  var SW = 'fill="none" stroke="currentColor" stroke-width="1.4" ' +
           'stroke-linecap="round" stroke-linejoin="round"';

  var SHAPES = {
    /* ---------- گلبرگ و حلقه — لطیف ---------- */
    petals: [
      '<path d="M12 3c3 3 4.5 6 4.5 9a4.5 4.5 0 0 1-9 0c0-3 1.5-6 4.5-9Z"/><path d="M12 12v9"/>',
      '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>',
      '<path d="M12 4c2 2.5 2 5.5 0 8-2-2.5-2-5.5 0-8Z"/><path d="M12 12c2.5 2 5.5 2 8 0-2.5-2-5.5-2-8 0Z"/><path d="M12 12c-2.5 2-5.5 2-8 0 2.5-2 5.5-2 8 0Z"/><path d="M12 12c2 2.5 2 5.5 0 8-2-2.5-2-5.5 0-8Z"/>',
      '<path d="M5 12a7 7 0 0 1 14 0"/><path d="M8.5 12a3.5 3.5 0 0 1 7 0"/>',
      '<path d="M12 20c0-4.5 3-8 7-8.5-.5 4.5-3.5 8-7 8.5Z"/><path d="M12 20c0-4.5-3-8-7-8.5.5 4.5 3.5 8 7 8.5Z"/><path d="M12 20v-7"/>',
      '<path d="M8 6.5c2.5-2 5.5-2 8 0-2.5 2-5.5 2-8 0Z"/><path d="M8 17.5c2.5-2 5.5-2 8 0-2.5 2-5.5 2-8 0Z"/><path d="M12 8v8"/>',
    ],

    /* ---------- هندسی — مقتدر ---------- */
    geo: [
      '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
      '<rect x="4.5" y="4.5" width="15" height="15" transform="rotate(45 12 12)"/>',
      '<path d="m12 3.5 7.4 4.25v8.5L12 20.5l-7.4-4.25v-8.5z"/>',
      '<rect x="5" y="5" width="14" height="14"/><path d="M5 12h14M12 5v14"/>',
      '<path d="m12 3 9 16H3z"/><path d="m12 9 4.5 8h-9z"/>',
      '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/>',
    ],

    /* ---------- بادکنک و ستاره — شاد ---------- */
    balloons: [
      '<path d="M12 3a5.5 5.5 0 0 1 5.5 5.5c0 3.4-3 6.5-5.5 6.5S6.5 11.9 6.5 8.5A5.5 5.5 0 0 1 12 3Z"/><path d="M12 15v2M10.6 17h2.8l-.7 4h-1.4z"/>',
      '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
      '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V18M9.5 21h5"/>',
      '<path d="M6 15a3.5 3.5 0 0 1 .6-6.95 5 5 0 0 1 9.6-1.2A3.9 3.9 0 0 1 18 15z"/>',
      '<path d="M12 20.5S4.5 15.8 4.5 10.2a3.9 3.9 0 0 1 7.5-1.5 3.9 3.9 0 0 1 7.5 1.5c0 5.6-7.5 10.3-7.5 10.3Z"/>',
      '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="10" r="2.2"/><circle cx="11" cy="16" r="2.6"/>',
    ],

    /* ---------- نئون و بازی — پرانرژی ---------- */
    neon: [
      '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 7.5 16.5 12 12 16.5 7.5 12z"/>',
      '<path d="m12 3 7.8 4.5v9L12 21l-7.8-4.5v-9z"/>',
      '<rect x="3" y="7" width="18" height="10" rx="3"/><path d="M7.5 12h3M9 10.5v3M15.5 11.5h.01M17.5 13.5h.01"/>',
      '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/>',
      '<path d="M4 12h3l2-5 3 10 3-8 2 3h3"/>',
      '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/>',
    ],

    /* ============================================================
       خانواده‌های تازه
       ============================================================ */

    /* ---------- خط و موج — آرام و مدرن ---------- */
    waves: [
      '<path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
      '<path d="M3 9c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"/><path d="M3 15c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"/>',
      '<path d="M4 20V9M9 20V5M14 20v-8M19 20V7"/>',
      '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
      '<path d="M5 16c0-6 3-9 7-9s7 3 7 9"/>',
      '<path d="M3 12h4l2-4 3 8 3-6 2 2h4"/>',
    ],

    /* ---------- ستاره و درخشش — جادویی ---------- */
    sparks: [
      '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m6.5 6.5 3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3"/>',
      '<path d="M12 4c.8 3.4 2.8 5.4 6.2 6.2-3.4.8-5.4 2.8-6.2 6.2-.8-3.4-2.8-5.4-6.2-6.2C9.2 9.4 11.2 7.4 12 4Z"/>',
      '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>',
      '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
      '<path d="M6 6.5h.01M18 7.5h.01M7 17h.01M17.5 16.5h.01"/><path d="M12 8.5 13.2 12l3.3 1.2-3.3 1.2L12 18l-1.2-3.6L7.5 13.2 10.8 12z"/>',
      '<path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="4.5"/>',
    ],

    /* ---------- برگ و شاخه — طبیعی ---------- */
    leaves: [
      '<path d="M6 18c0-7 5-12 12-12 0 7-5 12-12 12Z"/><path d="M6 18 18 6"/>',
      '<path d="M12 21V8"/><path d="M12 12c-3.5 0-5.5-2-6-5 3.5 0 5.5 2 6 5Z"/><path d="M12 15c3.5 0 5.5-2 6-5-3.5 0-5.5 2-6 5Z"/>',
      '<path d="M12 20c-4-2-6-5.5-6-9.5C6 6 8.7 3.5 12 3.5s6 2.5 6 7c0 4-2 7.5-6 9.5Z"/><path d="M12 20V6"/>',
      '<path d="M4 20c4-1 7-4 8-9"/><path d="M12 11c1-4 4-6 8-6.5-1 4.5-4 7-8 6.5Z"/>',
      '<path d="M12 21c0-5 2-8 6-9-1 5-3 8-6 9Z"/><path d="M12 21c0-5-2-8-6-9 1 5 3 8 6 9Z"/>',
      '<path d="M7 19a6 6 0 0 1 0-12h10a5 5 0 0 1 0 10"/>',
    ],

    /* ---------- حباب — سبک و شناور ---------- */
    bubbles: [
      '<circle cx="12" cy="12" r="8"/><path d="M8.5 8.5a3 3 0 0 1 2.2-1.4"/>',
      '<circle cx="9" cy="10" r="5"/><circle cx="16.5" cy="15" r="3"/>',
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/>',
      '<circle cx="7" cy="7" r="3.5"/><circle cx="15.5" cy="12" r="4.5"/><circle cx="8" cy="17" r="2.5"/>',
      '<ellipse cx="12" cy="12" rx="8.5" ry="6"/>',
      '<circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/>',
    ],
  };


  /* ============================================================
     ۳. پیدا کردن تم درست
     ============================================================ */

  /** بخشی که مشتری از آن آمده */
  function fromParam() {
    try {
      var v = new URLSearchParams(location.search).get('from');
      return SECTIONS.indexOf(v) > -1 ? v : '';
    } catch (e) { return ''; }
  }

  /** تم قفل‌شده‌ی فروشنده */
  function lockedFor(sellerId) {
    if (!sellerId) return '';
    var all;
    try { all = JSON.parse(localStorage.getItem(KEY_LOCK)); } catch (e) { return ''; }
    if (!all || typeof all !== 'object') return '';
    var rec = all[sellerId];
    if (!rec || typeof rec !== 'object') return '';
    /* فقط اگر فروشنده صراحتاً قفل کرده باشد */
    if (!rec.locked) return '';
    return SECTIONS.indexOf(rec.section) > -1 ? rec.section : '';
  }

  /** بخشی که فروشگاه بیشترین کالا را در آن دارد */
  function busiestSection(products) {
    var T = window.DPTaxonomy;
    var count = {};
    (products || []).forEach(function (p) {
      if (p.status !== 'active') return;
      var s = p.section || (T && T.findByItem(p.category) && T.findByItem(p.category).section);
      if (s) count[s] = (count[s] || 0) + 1;
    });
    var best = '', n = 0;
    SECTIONS.forEach(function (s) {
      if ((count[s] || 0) > n) { n = count[s]; best = s; }
    });
    return best;
  }

  /**
   * تصمیم نهایی.
   * @param {object} ctx  { sellerId, products, category }
   */
  function resolve(ctx) {
    ctx = ctx || {};

    /* ۱) قفل فروشنده مقدم بر همه است — اگر برندش را با یک
          حال‌وهوا ساخته، مسیر ورود نباید خرابش کند */
    var locked = lockedFor(ctx.sellerId);
    if (locked) return { section: locked, reason: 'locked' };

    /* ۲) مسیر ورود مشتری */
    var from = fromParam();
    if (from) return { section: from, reason: 'from' };

    /* ۳) بخش پرکالاتر */
    var busy = busiestSection(ctx.products);
    if (busy) return { section: busy, reason: 'busiest' };

    /* ۴) دسته‌ی ثبت‌نام */
    if (SECTIONS.indexOf(ctx.category) > -1) {
      return { section: ctx.category, reason: 'category' };
    }

    /* ۵) پیش‌فرض */
    return { section: 'women', reason: 'default' };
  }

  /* ============================================================
     ۴. اعمال تم
     ============================================================ */
  var applied = '';

  function apply(section, opts) {
    opts = opts || {};
    var t = THEMES[section] || THEMES.women;
    var root = document.documentElement;

    /* متغیرها روی <html> می‌نشینند تا هم صفحه و هم عنصرهای
       شناور (منو، کشوی سبد) پوشش بگیرند */
    Object.keys(t.vars).forEach(function (k) {
      root.style.setProperty(k, t.vars[k]);
    });

    /* گرادیان قاب متحرک */
    root.style.setProperty('--st-flow', t.flow);

    root.setAttribute('data-store-theme', t.key);
    root.setAttribute('data-store-dark', t.dark ? '1' : '0');

    applied = t.key;

    /* سفارشی‌سازی فروشنده — از فهرست مقادیر مجاز، نه CSS خام */
    if (opts.custom) {
      var vars = {};
      Object.keys(t.vars).forEach(function (k) { vars[k] = t.vars[k]; });
      mergeCustom(vars, opts.custom, opts.guard !== false);
      Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
    }

    document.dispatchEvent(new CustomEvent('dp:theme', {
      detail: { section: t.key, theme: t },
    }));

    return t;
  }

  /* ============================================================
     سفارشی‌سازی فروشنده
     ------------------------------------------------------------
     فروشنده کنترل کامل روی ظاهر ویترینش دارد — ولی از راه
     مقادیر مشخص و اعتبارسنجی‌شده، نه CSS خام.

     چرا CSS خام نه؟ چون یعنی اجازه‌ی `background:url(...)` برای
     ردیابی بازدیدکننده و `position:fixed` برای پوشاندن دکمه‌ی
     پرداخت. با فهرست مقادیر مجاز، فروشنده همان آزادی را دارد
     بدون اینکه بتواند به مشتری آسیب بزند.
     ============================================================ */
  var HEX = /^#[0-9a-fA-F]{6}$/;

  /** همه‌ی چیزهایی که فروشنده می‌تواند دست بزند */
  var FIELDS = {
    /* ---------- رنگ ---------- */
    bg:      { css: '--st-bg',      type: 'color', label: 'زمینه‌ی صفحه' },
    surface: { css: '--st-surface', type: 'color', label: 'زمینه‌ی کارت' },
    ink:     { css: '--st-ink',     type: 'color', label: 'رنگ نوشته' },
    mute:    { css: '--st-mute',    type: 'color', label: 'نوشته‌ی کم‌رنگ' },
    primary: { css: '--st-primary', type: 'color', label: 'رنگ اصلی' },
    second:  { css: '--st-second',  type: 'color', label: 'رنگ همراه' },
    accent:  { css: '--st-accent',  type: 'color', label: 'رنگ تأکید' },

    /* ---------- شکل ---------- */
    radius:  { css: '--st-radius',  type: 'num', min: 0, max: 32, unit: 'px', label: 'گردی گوشه' },
    border:  { css: '--st-bw',      type: 'num', min: 0, max: 6,  unit: 'px', label: 'ضخامت قاب' },
  };

  /** گزینه‌های غیرعددی */
  var CHOICES = {
    shapes: ['petals', 'geo', 'balloons', 'neon',
             'waves', 'sparks', 'leaves', 'bubbles', 'none'],
    motion: ['drift', 'spin', 'bounce', 'pulse',
             'float', 'sway', 'orbit', 'breathe', 'fall', 'rise', 'none'],
    density: [0, 4, 7, 11, 16],      /* تعداد شکل‌های شناور */
  };

  /** برچسب فارسی هر گزینه — برای فهرست‌های انتخاب */
  var CHOICE_FA = {
    shapes: {
      petals: 'گلبرگ و حلقه', geo: 'مکعب و شش‌ضلعی', balloons: 'بادکنک و ستاره',
      neon: 'لوزی و دسته‌ی بازی', waves: 'موج و خط', sparks: 'درخشش و ستاره',
      leaves: 'برگ و شاخه', bubbles: 'حباب', none: 'بدون شکل',
    },
    motion: {
      drift: 'شناور آرام', spin: 'چرخش', bounce: 'جهش', pulse: 'نبض',
      float: 'بالا و پایین', sway: 'تاب خوردن', orbit: 'مدار',
      breathe: 'نفس کشیدن', fall: 'بارش', rise: 'صعود', none: 'بی‌حرکت',
    },
    density: { 0: 'هیچ', 4: 'کم', 7: 'متوسط', 11: 'زیاد', 16: 'خیلی زیاد' },
  };

  /**
   * پاک‌سازی سفارشی‌سازی — هر چیزی که در فهرست نباشد دور
   * انداخته می‌شود، بی‌سروصدا.
   */
  function cleanCustom(c) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    var out = {};

    Object.keys(FIELDS).forEach(function (k) {
      var f = FIELDS[k];
      var v = c[k];
      if (v == null || v === '') return;

      if (f.type === 'color') {
        var hex = String(v).trim().toLowerCase();
        if (HEX.test(hex)) out[k] = hex;
        return;
      }

      var n = Number(v);
      if (isFinite(n) && n >= f.min && n <= f.max) out[k] = Math.round(n);
    });

    if (CHOICES.shapes.indexOf(c.shapes) > -1) out.shapes = c.shapes;
    if (CHOICES.motion.indexOf(c.motion) > -1) out.motion = c.motion;
    if (CHOICES.density.indexOf(Number(c.density)) > -1) out.density = Number(c.density);

    /* کلید ظاهر آماده — برای اینکه بدانیم کدام کارت روشن بماند */
    /* کلید ظاهر فارسی است («شبانه-طلایی»)، پس `\w` که فقط
       حروف انگلیسی را می‌گیرد کار نمی‌کند. به‌جای الگوی
       نویسه‌ای، مستقیم در فهرست رسمی می‌گردیم — امن‌تر هم هست
       چون هیچ مقدار من‌درآوردی رد نمی‌شود. */
    if (typeof c.look === 'string') {
      var known = LOOKS.some(function (l) { return l.key === c.look; });
      if (known) out.look = c.look;
    }

    /* نام تم دلخواه فروشنده — فقط برای نمایش به خودش */
    if (typeof c.name === 'string') {
      var nm = c.name.replace(/[<>&"']/g, '').trim().slice(0, 30);
      if (nm) out.name = nm;
    }

    return Object.keys(out).length ? out : null;
  }

  /* ============================================================
     محافظ خوانایی
     ------------------------------------------------------------
     فروشنده می‌تواند نوشته‌ی زرد روی زمینه‌ی سفید بگذارد و
     ویترینش را ناخوانا کند. جلویش را نمی‌گیریم — ولی هشدار
     می‌دهیم و اگر فاجعه بود، خودکار اصلاح می‌کنیم.
     ============================================================ */
  function lum(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) return null;
    var v = [0, 2, 4].map(function (i) {
      var c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  /** نسبت کنتراست دو رنگ */
  function contrast(a, b) {
    var la = lum(a), lb = lum(b);
    if (la == null || lb == null) return null;
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /** تیره یا روشن کردن رنگ تا رسیدن به کنتراست هدف */
  function forceContrast(fg, bg, target) {
    target = target || 4.5;
    var cur = contrast(fg, bg);
    if (cur == null || cur >= target) return fg;

    var h = fg.replace('#', '');
    var rgb = [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
    /* اگر زمینه روشن است، متن را تیره می‌کنیم؛ وگرنه روشن */
    var goDark = (lum(bg) || 0) > 0.4;

    for (var step = 1; step <= 40; step++) {
      var f = goDark ? 1 - step / 42 : 1 + step / 14;
      var cand = '#' + rgb.map(function (c) {
        var n = Math.max(0, Math.min(255, Math.round(c * f)));
        return ('0' + n.toString(16)).slice(-2);
      }).join('');
      if ((contrast(cand, bg) || 0) >= target) return cand;
    }
    /* آخرین راه: مشکل یا سفید */
    return goDark ? '#1a1a1a' : '#f2f2f2';
  }

  /**
   * بررسی خوانایی یک مجموعه رنگ.
   * خروجی: فهرست هشدارها — برای نمایش به فروشنده.
   */
  function auditColors(vars) {
    var out = [];
    var bg = vars['--st-bg'];
    var sf = vars['--st-surface'];

    [['رنگ نوشته', '--st-ink', sf],
     ['نوشته‌ی کم‌رنگ', '--st-mute', sf],
     ['رنگ همراه (قیمت)', '--st-second', sf],
     ['رنگ تأکید', '--st-accent', sf]].forEach(function (row) {
      var c = contrast(vars[row[1]], row[2]);
      if (c != null && c < 4.5) {
        out.push({
          key: row[1],
          label: row[0],
          ratio: Math.round(c * 100) / 100,
          need: 4.5,
        });
      }
    });

    /* زمینه‌ی کارت باید از زمینه‌ی صفحه جدا دیده شود.
       آستانه ۱٫۰۴ است نه بیشتر — تم‌های پایه‌ی خودمان حدود
       ۱٫۰۷ هستند و اگر سخت‌گیرتر بگیریم، بدون هیچ تغییری از
       طرف فروشنده هشدار می‌دهیم. */
    var sep = contrast(sf, bg);
    if (sep != null && sep < 1.04) {
      out.push({
        key: '--st-surface',
        label: 'جدایی کارت از زمینه',
        ratio: Math.round(sep * 100) / 100,
        need: 1.04,
      });
    }

    return out;
  }

  /**
   * اعمال سفارشی‌سازی روی متغیرها.
   * @param {object} vars  متغیرهای تم پایه (تغییر می‌کند)
   * @param {object} c     سفارشی‌سازی
   * @param {boolean} guard  خوانایی را به‌زور اصلاح کن؟
   */
  function mergeCustom(vars, c, guard) {
    if (!c) return vars;

    Object.keys(FIELDS).forEach(function (k) {
      var f = FIELDS[k];
      if (c[k] == null) return;
      vars[f.css] = f.type === 'color' ? c[k] : (c[k] + (f.unit || ''));
    });

    /* گردی کوچک از گردی اصلی مشتق می‌شود */
    if (c.radius != null) {
      vars['--st-radius-sm'] = Math.max(0, c.radius - 6) + 'px';
    }

    /* رنگ نوشته‌ی روی دکمه، خودکار حساب می‌شود — فروشنده
       نباید نگرانش باشد */
    var pr = vars['--st-primary'];
    if (pr && HEX.test(pr)) {
      vars['--st-on-primary'] = (lum(pr) || 0) > 0.45 ? '#1a1a1a' : '#ffffff';
    }

    /* خط و هاله از رنگ همراه مشتق می‌شوند */
    var sc = vars['--st-second'];
    if (sc && HEX.test(sc)) {
      vars['--st-line'] = hexA(sc, 0.34);
      vars['--st-glow'] = hexA(sc, 0.28);
    }

    /* ---------- محافظ خوانایی ---------- */
    if (guard) {
      var sf = vars['--st-surface'];
      ['--st-ink', '--st-mute', '--st-second', '--st-accent'].forEach(function (k) {
        if (vars[k] && HEX.test(vars[k]) && HEX.test(sf)) {
          vars[k] = forceContrast(vars[k], sf, k === '--st-ink' ? 7 : 4.5);
        }
      });
    }

    return vars;
  }

  /** رنگ هگز → rgba با شفافیت */
  function hexA(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
  }

  function applyCustom(c, guard) {
    var root = document.documentElement;
    var base = THEMES[applied] || THEMES.women;
    var vars = {};
    Object.keys(base.vars).forEach(function (k) { vars[k] = base.vars[k]; });

    mergeCustom(vars, c, guard !== false);

    Object.keys(vars).forEach(function (k) {
      root.style.setProperty(k, vars[k]);
    });
  }

  /** برگرداندن به حالت بدون تم */
  function clear() {
    var root = document.documentElement;
    Object.keys(THEMES.women.vars).forEach(function (k) { root.style.removeProperty(k); });
    Object.keys(THEMES.kids.vars).forEach(function (k) { root.style.removeProperty(k); });
    Object.keys(THEMES.teen.vars).forEach(function (k) { root.style.removeProperty(k); });
    root.style.removeProperty('--st-flow');
    root.removeAttribute('data-store-theme');
    root.removeAttribute('data-store-dark');
    applied = '';
  }

  /* ============================================================
     ۵. لایه‌ی تزئینی متحرک
     ------------------------------------------------------------
     شکل‌ها با CSS حرکت می‌کنند نه با JS — پس روی ۶۰ فریم
     می‌مانند و پردازنده را اشغال نمی‌کنند.
     ============================================================ */
  function paintAmbient(host, section, custom) {
    if (!host) return;

    /* انتخاب فروشنده بر تم پایه مقدم است */
    var pickShapes = custom && custom.shapes;
    var pickMotion = custom && custom.motion;
    var pickDens = custom && custom.density;

    if (pickShapes === 'none' || pickDens === 0) { host.innerHTML = ''; return; }

    /* احترام به «کاهش حرکت» سیستم */
    var reduced = false;
    try {
      reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { /* بی‌اهمیت */ }

    var t = THEMES[section] || THEMES.women;
    var set = SHAPES[pickShapes] || SHAPES[t.shapes] || SHAPES.petals;
    var want = pickDens != null ? pickDens : t.shapeCount;
    var n = reduced ? Math.min(3, want) : want;

    /* حرکت دلخواه روی خود لایه می‌نشیند تا CSS بتواند بخواندش */
    host.setAttribute('data-motion', pickMotion || '');

    var out = '';
    for (var i = 0; i < n; i++) {
      var body = set[i % set.length];
      /* جای هر شکل ثابت است (نه تصادفی) تا با هر رسم نپرد */
      var x = (i * 137) % 92 + 4;
      var y = (i * 61) % 84 + 6;
      var sz = 34 + (i % 4) * 16;
      var dur = 14 + (i % 5) * 4;
      var delay = (i % 6) * 1.4;

      out += '<span class="st-shape st-s' + (i % 4) + '" aria-hidden="true" style="' +
        'inset-inline-start:' + x + '%;top:' + y + '%;' +
        '--sz:' + sz + 'px;--dur:' + dur + 's;--delay:-' + delay + 's">' +
        '<svg viewBox="0 0 24 24" ' + SW + '>' + body + '</svg></span>';
    }

    host.innerHTML = out;
    host.setAttribute('aria-hidden', 'true');
  }

  /* ============================================================
     ۶. ساخت نشانی فروشگاه با بخش مبدأ
     ------------------------------------------------------------
     هر جای سایت که به فروشگاه لینک می‌دهد، این را صدا می‌زند.
     ============================================================ */
  function storeLink(sellerId, base, section) {
    var url = (base || './') + 'store.html?id=' + encodeURIComponent(sellerId);
    var s = section || currentSection();
    if (s) url += '&from=' + encodeURIComponent(s);
    return url;
  }

  /** بخش صفحه‌ی جاری — از data-dp-page */
  function currentSection() {
    var p = document.body && document.body.dataset ? document.body.dataset.dpPage : '';
    var MAP = { woman: 'women', man: 'men', kids: 'kids', teen: 'teen' };
    return MAP[p] || '';
  }

  /* ============================================================
     ۷. قفل تم برای فروشنده
     ============================================================ */
  function saveLock(sellerId, section, locked, custom) {
    if (!sellerId) return false;
    var all = {};
    try { all = JSON.parse(localStorage.getItem(KEY_LOCK)) || {}; } catch (e) { all = {}; }
    if (typeof all !== 'object' || Array.isArray(all)) all = {};

    all[sellerId] = {
      section: SECTIONS.indexOf(section) > -1 ? section : 'women',
      locked: !!locked,
      custom: cleanCustom(custom),
      at: Date.now(),
    };

    try { localStorage.setItem(KEY_LOCK, JSON.stringify(all)); } catch (e) { return false; }
    document.dispatchEvent(new CustomEvent('dp:theme-saved', { detail: all[sellerId] }));
    return true;
  }

  /**
   * برگرداندن فروشگاه به حالت خودکار.
   * ------------------------------------------------------------
   * رکورد تم به‌کلی پاک می‌شود — نه اینکه فقط خاموش شود. پس
   * ویترین دوباره حال‌وهوای بخشی را می‌گیرد که مشتری از آن
   * می‌آید: از صفحه‌ی نوجوان نئونی، از صفحه‌ی زنانه لطیف.
   */
  function clearLock(sellerId) {
    if (!sellerId) return false;
    var all;
    try { all = JSON.parse(localStorage.getItem(KEY_LOCK)); } catch (e) { return false; }
    if (!all || typeof all !== 'object' || Array.isArray(all)) return false;
    if (!all[sellerId]) return true;      /* از قبل خودکار بود */

    delete all[sellerId];
    try { localStorage.setItem(KEY_LOCK, JSON.stringify(all)); } catch (e) { return false; }

    document.dispatchEvent(new CustomEvent('dp:theme-saved', { detail: null }));
    return true;
  }

  function readLock(sellerId) {
    if (!sellerId) return null;
    var all;
    try { all = JSON.parse(localStorage.getItem(KEY_LOCK)); } catch (e) { return null; }
    if (!all || typeof all !== 'object') return null;
    var r = all[sellerId];
    return r && typeof r === 'object' ? r : null;
  }

  window.DPTheme = {
    THEMES: THEMES,
    SECTIONS: SECTIONS,
    SHAPES: SHAPES,
    resolve: resolve,
    apply: apply,
    clear: clear,
    paintAmbient: paintAmbient,
    storeLink: storeLink,
    currentSection: currentSection,
    saveLock: saveLock,
    clearLock: clearLock,
    readLock: readLock,
    cleanCustom: cleanCustom,
    LOOKS: LOOKS,
    lookToCustom: lookToCustom,
    matchLook: matchLook,
    FIELDS: FIELDS,
    CHOICES: CHOICES,
    CHOICE_FA: CHOICE_FA,
    contrast: contrast,
    auditColors: auditColors,
    forceContrast: forceContrast,
    mergeCustom: mergeCustom,
    applyCustom: applyCustom,
    hexA: hexA,
    applied: function () { return applied; },
  };
})();
