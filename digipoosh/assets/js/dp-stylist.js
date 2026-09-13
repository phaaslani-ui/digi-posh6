/* ============================================================
   دیجی‌پوش — موتور استایل و ست کردن
   ------------------------------------------------------------
   تا حالا «کالاهای مرتبط» یعنی کالاهایی که ویژگی‌های مشترک
   دارند: همان دسته، همان پارچه، همان رنگ. نتیجه‌اش این بود که
   کنار یک پیراهن کرم، ده پیراهن کرم دیگر نشان داده می‌شد.

   ولی مشتری که پیراهن کرم می‌خرد، پیراهن کرم دوم نمی‌خواهد —
   دنبال **شلواری است که به آن بیاید**.

   این فایل قاعده‌های واقعی مد را کد می‌کند:

     ۱. هماهنگی رنگ  — چرخه‌ی رنگ، خنثی‌ها، تک‌رنگ، مکمل
     ۲. تعادل فرم    — بالاتنه‌ی گشاد با پایین‌تنه‌ی جذب
     ۳. نردبان رسمیت — کفش ورزشی با لباس شب نمی‌رود
     ۴. فصل          — پالتوی پشمی در ست تابستانی نه
     ۵. نقش قطعه     — یک ست کامل: بالا + پایین + کفش + کیف
     ۶. تناسب قد     — کراپ با فاق‌بلند، بلوز بلند با جذب

   خروجی: «ست کامل کن» — چند کالای واقعی از بازار که با هم
   یک تیپ درست می‌سازند.
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ۱. چرخه‌ی رنگ
     ------------------------------------------------------------
     هر رنگ یک زاویه روی چرخه دارد (۰ تا ۳۶۰) و یک نشان
     «خنثی». رنگ‌های خنثی با همه‌چیز می‌روند — پایه‌ی کمد
     لباس هر آدم حرفه‌ای همین‌هاست.
     ============================================================ */
  var HUE = {
    /* ---------- خنثی‌ها ---------- */
    black:  { h: null, neutral: true,  light: 5,  name: 'مشکی' },
    white:  { h: null, neutral: true,  light: 98, name: 'سفید' },
    cream:  { h: 45,   neutral: true,  light: 93, name: 'کرم' },
    beige:  { h: 38,   neutral: true,  light: 80, name: 'بژ' },
    gray:   { h: null, neutral: true,  light: 50, name: 'خاکستری' },
    navy:   { h: 220,  neutral: true,  light: 18, name: 'سرمه‌ای' },
    brown:  { h: 25,   neutral: true,  light: 30, name: 'قهوه‌ای' },
    camel:  { h: 33,   neutral: true,  light: 62, name: 'شتری' },

    /* ---------- رنگی‌ها ---------- */
    red:       { h: 0,   neutral: false, light: 45, name: 'قرمز' },
    maroon:    { h: 340, neutral: false, light: 28, name: 'زرشکی' },
    pink:      { h: 340, neutral: false, light: 72, name: 'صورتی' },
    orange:    { h: 28,  neutral: false, light: 55, name: 'نارنجی' },
    yellow:    { h: 48,  neutral: false, light: 65, name: 'زرد' },
    mustard:   { h: 45,  neutral: false, light: 48, name: 'خردلی' },
    green:     { h: 130, neutral: false, light: 40, name: 'سبز' },
    olive:     { h: 70,  neutral: true,  light: 40, name: 'زیتونی' },
    mint:      { h: 150, neutral: false, light: 80, name: 'نعنایی' },
    turquoise: { h: 175, neutral: false, light: 45, name: 'فیروزه‌ای' },
    blue:      { h: 215, neutral: false, light: 45, name: 'آبی' },
    skyblue:   { h: 200, neutral: false, light: 72, name: 'آبی آسمانی' },
    purple:    { h: 280, neutral: false, light: 40, name: 'بنفش' },
    lilac:     { h: 275, neutral: false, light: 78, name: 'یاسی' },

    /* ---------- فلزی: مثل خنثی رفتار می‌کنند ---------- */
    gold:   { h: 45,  neutral: true, light: 60, name: 'طلایی', metal: true },
    silver: { h: null, neutral: true, light: 75, name: 'نقره‌ای', metal: true },
    rosegold: { h: 15, neutral: true, light: 70, name: 'رز طلایی', metal: true },
    denim:  { h: 215, neutral: true, light: 40, name: 'جین' },
    coral:  { h: 12,  neutral: false, light: 65, name: 'مرجانی' },
  };

  /**
   * امتیاز هماهنگی دو رنگ — عدد ۰ تا ۱۰۰.
   *
   * قاعده‌های واقعی مد:
   *   · خنثی + هر چیزی      → همیشه امن
   *   · تک‌رنگ (یک خانواده) → بسیار شیک، حرفه‌ای
   *   · همسایه روی چرخه     → آرام و هماهنگ
   *   · مکمل (روبه‌رو)      → جسورانه، جذاب
   *   · فاصله‌ی میانی       → معمولاً ناهماهنگ
   */
  function colorScore(a, b) {
    var A = HUE[a], B = HUE[b];
    if (!A || !B) return 50;                 /* ناشناخته: بی‌طرف */

    /* هر دو خنثی — مثل مشکی و سفید، همیشه درست */
    if (A.neutral && B.neutral) {
      /* ولی دو خنثی با روشنایی نزدیک، ست را تخت می‌کند */
      var gap = Math.abs(A.light - B.light);
      if (gap < 12) return 62;               /* مشکی با خاکستری تیره */
      return 92;
    }

    /* یکی خنثی — پایه‌ی هر ست حرفه‌ای */
    if (A.neutral || B.neutral) {
      var col = A.neutral ? B : A;
      var neu = A.neutral ? A : B;
      /* رنگ روشن روی خنثای تیره، یا برعکس: کنتراست خوب */
      if (Math.abs(col.light - neu.light) > 25) return 95;
      return 84;
    }

    /* هر دو رنگی */
    if (A.h == null || B.h == null) return 60;

    var d = Math.abs(A.h - B.h);
    if (d > 180) d = 360 - d;

    var dl = Math.abs(A.light - B.light);

    /* تک‌رنگ — همان خانواده با شدت متفاوت.
       «سرمه‌ای با آبی آسمانی» شیک است؛ «آبی با آبی» تخت. */
    if (d <= 15) return dl > 20 ? 88 : 66;

    /* ---------- همسایه روی چرخه ----------
       اینجا روشنایی تعیین‌کننده است. «قرمز با نارنجی» در یک
       شدت، چشم را می‌زند چون مغز نمی‌فهمد کدام غالب است.
       ولی «قرمز تیره با نارنجی روشن» یک ست گرم و درست است. */
    if (d <= 45) {
      if (dl > 28) return 86;      /* تضاد روشنایی نجاتش می‌دهد */
      if (dl > 14) return 70;
      return 44;                    /* هم‌رنگ و هم‌روشنایی — درگیری */
    }
    /* سه‌گانه‌ی نرم */
    if (d <= 75) return 58;
    /* منطقه‌ی خطر — قرمز با نارنجی، صورتی با قرمز */
    if (d <= 110) return 34;
    /* سه‌گانه */
    if (d <= 145) return 64;
    /* مکمل — روبه‌روی هم، جسورانه ولی درست */
    return 80;
  }

  /* ============================================================
     ۲. نقش هر قطعه در ست
     ------------------------------------------------------------
     یک تیپ کامل از چند «جایگاه» ساخته می‌شود. هر کالا در
     یکی از این جایگاه‌ها می‌نشیند.
     ============================================================ */
  var SLOT = {
    top:    'بالاتنه',
    bottom: 'پایین‌تنه',
    full:   'یک‌تکه',      /* پیراهن بلند، لباس شب، سارافون */
    outer:  'رویه',        /* پالتو، کاپشن، ژاکت */
    shoes:  'کفش',
    bag:    'کیف',
    accessory: 'اکسسوری',
    modest: 'پوشش',        /* شال، روسری، مقنعه */
    under:  'زیرپوش',
    home:   'خانگی',
  };

  /* تشخیص جایگاه از نام کالا — بر پایه‌ی واژه‌های واقعی فارسی */
  var SLOT_RULES = [
    [/کفش|چکمه|بوت|صندل|کتانی|دمپایی|پاشنه|اسنیکر/, 'shoes'],
    [/کیف|کوله|جاکلیدی|کیف پول/, 'bag'],
    [/کمربند|عینک|ساعت|دستکش|زیورآلات|گردنبند|دستبند|انگشتر|گوشواره|کلاه(?! حجاب)/, 'accessory'],
    [/شال|روسری|مقنعه|چادر|کلاه حجاب/, 'modest'],
    [/لباس زیر|زیرپوش|جوراب|سوتین/, 'under'],
    [/لباس خواب|روب‌دوشامبر|ست راحتی|شلوارک خانگی|تاپ خانگی/, 'home'],
    [/پالتو|کاپشن|بارانی|ترنچ|جلیقه پفی|پانچو|شنل|اورکت|بادگیر/, 'outer'],
    [/ژاکت|بافت|کاردیگان|هودی|سویشرت/, 'outer'],
    [/کت تک|کت مجلسی|کت و شلوار|کت و دامن|ست دامادی|ست ورزشی|سرهمی|اورال/, 'full'],
    [/لباس شب|لباس عروس|لباس نامزدی|پیراهن مجلسی|سارافون|تونیک|مانتو/, 'full'],
    [/شلوار|دامن|لگ|شلوارک|گرمکن|جین/, 'bottom'],
    [/پیراهن|بلوز|شومیز|تی‌شرت|تیشرت|پولوشرت|تاپ|جلیقه|بادی/, 'top'],
  ];

  function slotOf(p) {
    var name = String(p.category || p.name || '');
    for (var i = 0; i < SLOT_RULES.length; i++) {
      if (SLOT_RULES[i][0].test(name)) return SLOT_RULES[i][1];
    }
    /* از روی گروه دسته‌بندی حدس بزن */
    var g = p.grp || p.group || '';
    if (g === 'shoes') return 'shoes';
    if (g === 'accessory') return 'bag';
    if (g === 'outer') return 'outer';
    if (g === 'modest') return 'modest';
    if (g === 'under') return 'under';
    if (g === 'home') return 'home';
    return 'top';
  }

  /* ============================================================
     ۳. نردبان رسمیت
     ------------------------------------------------------------
     کفش ورزشی با لباس شب نمی‌رود. عدد بزرگ‌تر = رسمی‌تر.
     دو قطعه‌ی یک ست نباید بیش از یک پله فاصله داشته باشند.
     ============================================================ */
  var FORMAL_GROUP = {
    party: 5, formal: 4, modest: 3, casual: 2,
    outer: 3, shoes: 3, accessory: 3, sport: 1, home: 0, under: 0,
    traditional: 4, school: 2, baby: 2, toys: 0,
  };

  var FORMAL_STYLE = {
    elegant: 5, classic: 4, traditional: 4, minimal: 3, modern: 3,
    vintage: 3, bohemian: 2, casual: 2, street: 2, sporty: 1,
  };

  var FORMAL_ITEM = [
    [/لباس شب|لباس عروس|لباس نامزدی|مجلسی|ست دامادی/, 5],
    [/کت و شلوار|کت و دامن|پیراهن رسمی|کراوات|پاپیون|مداد|اداری/, 4],
    [/پاشنه‌دار|کت تک|جلیقه|بلوز رسمی/, 4],
    [/کتانی|اسنیکر|هودی|سویشرت|گرمکن|لگ|شلوارک|ورزشی/, 1],
    [/دمپایی|خواب|روب‌دوشامبر|راحتی|خانگی/, 0],
    /* زیورآلات ظریف — با همه‌چیز می‌روند، پس میانه‌ی بالا */
    [/گردنبند|دستبند|انگشتر|گوشواره|زیورآلات|نیم‌ست|ساعت/, 3],
  ];

  function formalOf(p) {
    var name = String(p.category || p.name || '');
    for (var i = 0; i < FORMAL_ITEM.length; i++) {
      if (FORMAL_ITEM[i][0].test(name)) return FORMAL_ITEM[i][1];
    }
    if (p.style && FORMAL_STYLE[p.style] != null) return FORMAL_STYLE[p.style];
    var g = p.grp || p.group || '';
    if (FORMAL_GROUP[g] != null) return FORMAL_GROUP[g];
    return 2;
  }

  /* ============================================================
     ۴. تعادل فرم — قاعده‌ی طلایی تیپ‌زنی
     ------------------------------------------------------------
     «گشاد با تنگ». اگر بالاتنه اورسایز است، پایین‌تنه باید
     جذب باشد و برعکس. دو قطعه‌ی گشاد با هم، هیکل را گم می‌کند.
     دو قطعه‌ی خیلی جذب هم زیادی تنگ می‌شود.
     ============================================================ */
  var FIT_W = { slim: 1, regular: 2, loose: 3, oversize: 4 };

  function fitScore(a, b) {
    var x = FIT_W[a && a.fit] || 2;
    var y = FIT_W[b && b.fit] || 2;
    var d = Math.abs(x - y);
    if (d === 0 && x >= 3) return 40;     /* هر دو گشاد — بی‌فرم */
    if (d === 0 && x === 1) return 62;    /* هر دو جذب — تنگ */
    if (d === 0) return 78;               /* هر دو معمولی — امن */
    if (d === 1) return 92;               /* تعادل طبیعی */
    if (d === 2) return 95;               /* تضاد زیبا: اورسایز + جذب */
    return 74;
  }

  /* ============================================================
     ۵. فصل
     ============================================================ */
  function seasonScore(a, b) {
    var x = a && a.season, y = b && b.season;
    if (!x || !y || x === 'all' || y === 'all') return 80;
    if (x === y) return 100;
    /* بهار و پاییز به هم نزدیک‌اند، تابستان و زمستان دشمن */
    var OPP = { summer: 'winter', winter: 'summer' };
    if (OPP[x] === y) return 18;
    return 62;
  }

  /* ============================================================
     ۶. جنس پارچه
     ------------------------------------------------------------
     پارچه‌ها «وزن» دارند. ابریشم با پشم ضخیم در یک ست،
     ناهماهنگ به چشم می‌آید.
     ============================================================ */
  var FABRIC_W = {
    chiffon: 1, silk: 1, satin: 1, viscose: 2, crepe: 2, jersey: 2,
    cotton: 2, linen: 2, polyester: 2, nylon: 2, lace: 1,
    knit: 3, denim: 3, velvet: 3, wool: 4, cashmere: 4, leather: 4,
  };

  function fabricScore(a, b) {
    var x = FABRIC_W[a && a.fabric], y = FABRIC_W[b && b.fabric];
    if (!x || !y) return 75;
    var d = Math.abs(x - y);
    if (d === 0) return 88;
    if (d === 1) return 92;    /* تنوع بافت — حرفه‌ای‌ها دوستش دارند */
    if (d === 2) return 68;
    return 42;
  }

  /* ============================================================
     ۷. طرح
     ------------------------------------------------------------
     قاعده‌ی محکم مد: **در یک ست فقط یک قطعه طرح‌دار**.
     دو طرح با هم، چشم را خسته می‌کند.
     ============================================================ */
  function patternScore(a, b) {
    var pa = (a && a.pattern) || 'plain';
    var pb = (b && b.pattern) || 'plain';
    var busyA = pa !== 'plain' && pa !== 'none';
    var busyB = pb !== 'plain' && pb !== 'none';

    if (busyA && busyB) return pa === pb ? 46 : 22;   /* دو طرح = شلوغ */
    if (busyA || busyB) return 96;                    /* یکی طرح، یکی ساده */
    return 80;                                        /* هر دو ساده */
  }

  /* ============================================================
     ۸. تناسب قد
     ------------------------------------------------------------
     بلوز کراپ با شلوار فاق‌بلند. بلوز بلند با پایین‌تنه‌ی
     ساده. دامن ماکسی با بالاتنه‌ی جمع‌وجور.
     ============================================================ */
  function lengthScore(top, bottom) {
    var t = top && top.length, b = bottom && bottom.length;
    if (!t || !b) return 78;
    if (t === 'crop') return b === 'maxi' || b === 'midi' ? 94 : 82;
    if (t === 'maxi') return 58;      /* بالاتنه‌ی خیلی بلند روی پایین‌تنه */
    return 80;
  }

  /* ============================================================
     ۹. کدام جایگاه‌ها با هم ست می‌شوند؟
     ------------------------------------------------------------
     عدد = چقدر این جفت «ست کردنی» است.
     ۰ یعنی اصلاً پیشنهاد نکن.
     ============================================================ */
  var PAIR = {
    top:    { bottom: 100, outer: 88, shoes: 76, bag: 62, accessory: 55, modest: 70, full: 0, top: 0 },
    bottom: { top: 100, outer: 82, shoes: 88, bag: 60, accessory: 52, modest: 58, full: 0, bottom: 0 },
    full:   { outer: 92, shoes: 90, bag: 78, accessory: 68, modest: 74, top: 0, bottom: 0, full: 0 },
    outer:  { top: 88, bottom: 82, full: 92, shoes: 74, bag: 66, accessory: 50, modest: 60, outer: 0 },
    shoes:  { top: 76, bottom: 88, full: 90, outer: 74, bag: 82, accessory: 48, shoes: 0 },
    bag:    { top: 62, bottom: 60, full: 78, outer: 66, shoes: 82, accessory: 56, bag: 0 },
    accessory: { top: 55, bottom: 52, full: 68, outer: 50, shoes: 48, bag: 56, accessory: 0 },
    modest: { top: 70, bottom: 58, full: 74, outer: 60, modest: 0 },
    /* لباس زیر و لباس خانگی «تیپ» نیستند — کسی با لباس خواب
       بیرون نمی‌رود. پیشنهاد کفش کنار لباس خواب، سایت را
       غیرحرفه‌ای نشان می‌دهد. */
    under:  {},
    home:   {},
  };


  /* ============================================================
     سازگاری بخش — زنانه با زنانه، مردانه با مردانه
     ------------------------------------------------------------
     ⚠️ ایراد گزارش‌شده: با لباس زنانه، کت چرم مردانه پیشنهاد
     می‌شد. موتور فقط رنگ و سبک و رسمیت را می‌سنجید و اصلاً
     نمی‌پرسید «این کالا برای چه کسی است؟»

     این منطق عمداً در همین فایل است، نه در dp-digiai.js —
     چون صفحه‌ی کالا فقط این را بارگذاری می‌کند و باید آنجا
     هم کار کند.
     ============================================================ */
  var SEC_OK = {
    women:  { women: 1, girls: 1, unisex: 1, '': 1 },
    men:    { men: 1, boys: 1, unisex: 1, '': 1 },
    girls:  { girls: 1, women: 1, kids: 1, teen: 1, unisex: 1, '': 1 },
    boys:   { boys: 1, men: 1, kids: 1, teen: 1, unisex: 1, '': 1 },
    kids:   { kids: 1, girls: 1, boys: 1, teen: 1, unisex: 1, '': 1 },
    teen:   { teen: 1, kids: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
    unisex: { women: 1, men: 1, kids: 1, teen: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
    '':     { women: 1, men: 1, kids: 1, teen: 1, girls: 1, boys: 1, unisex: 1, '': 1 },
  };

  /* واژه‌هایی که بخش را لو می‌دهند — حتی وقتی میدان
     `section` خالی است. فروشنده‌ای که «کت چرم مردانه»
     می‌نویسد، بخش را در نام گفته. */
  var SEC_WORDS = [
    [/زنانه|زنونه|بانوان|خانم/, 'women'],
    [/مردانه|مردونه|آقایان|مردان/, 'men'],
    [/دخترانه|دخترونه/, 'girls'],
    [/پسرانه|پسرونه/, 'boys'],
    [/بچگانه|بچه‌گانه|کودک|نوزاد/, 'kids'],
    [/نوجوان|تینیجر/, 'teen'],
  ];

  function sectionOf(p) {
    if (!p) return '';

    var direct = String(p.section || p.sec || '').toLowerCase().trim();
    if (direct && SEC_OK[direct]) return direct;

    var txt = String((p.name || '') + ' ' + (p.category || ''));
    for (var i = 0; i < SEC_WORDS.length; i++) {
      if (SEC_WORDS[i][0].test(txt)) return SEC_WORDS[i][1];
    }
    return '';
  }

  function sectionFits(a, b) {
    var row = SEC_OK[sectionOf(a)] || SEC_OK[''];
    return !!row[sectionOf(b)];
  }

  /* ============================================================
     ۱۰. امتیاز نهایی ست
     ============================================================ */
  function matchScore(base, cand) {
    /* ---------- دروازه‌ی بخش ----------
       ⚠️ ایراد گزارش‌شده: با لباس زنانه، کت چرم مردانه
       پیشنهاد می‌شد. رنگ و سبک هماهنگ بود، ولی کالا اصلاً
       برای آن مشتری نبود.

       این بررسی باید **اولین** چیز باشد، پیش از هر
       امتیازدهی. `null` یعنی «اصلاً پیشنهاد نکن». */
    /* ---------- دروازه‌ی نگهبان ----------
       همه‌ی قاعده‌های «این دو با هم نمی‌روند» در یک جا
       جمع شده‌اند: `dp-rules.js`.

       پیش‌تر هر قاعده جداگانه اینجا نوشته می‌شد و وقتی
       ایرادی پیدا می‌شد، باید چند فایل را جدا اصلاح
       می‌کردیم — و همیشه یکی جا می‌ماند.

       اگر نگهبان بارگذاری نشده باشد، به بررسی‌های
       محلی برمی‌گردیم تا سیستم بی‌دفاع نماند. */
    if (window.DPRules) {
      if (!DPRules.allows(base, cand)) return null;
    } else if (!sectionFits(base, cand)) {
      return null;
    }

    var sa = slotOf(base), sb = slotOf(cand);

    /* جایگاه‌های ناسازگار — مثل دو شلوار */
    var pair = (PAIR[sa] && PAIR[sa][sb]) || 0;
    if (!pair) return null;

    /* ---------- رسمیت ---------- */
    var fa = formalOf(base), fb = formalOf(cand);
    var fd = Math.abs(fa - fb);

    /* ---------- استثنای زیورآلات و کیف ----------
       ⚠️ در آزمون معلوم شد «گردنبند طلا» با «لباس مجلسی»
       رد می‌شد! چون گردنبند در نردبان رسمیت پیش‌فرض ۲
       می‌گرفت و لباس شب ۵ بود — اختلاف ۳ پله.

       ولی این غلط است: یک گردنبند ساده با لباس شب هم
       می‌رود و با تی‌شرت هم. زیورآلات و کیف در دنیای
       واقعی «بی‌طرف»اند مگر اینکه صریحاً ورزشی یا
       مجلسی باشند. */
    var neutralPiece = (slotOf(cand) === 'accessory' || slotOf(cand) === 'bag')
      && !/ورزشی|اسپرت|خانگی|مجلسی|عروس/.test(String(cand.category || cand.name || ''));

    if (fd >= 3 && !neutralPiece) return null;    /* کتانی با لباس شب */

    var formalPts = fd === 0 ? 100 : fd === 1 ? 82 : fd === 2 ? 46 : 40;

    /* ---------- رنگ ----------
       اگر دانشنامه‌ی گسترده در دسترس است، از آن استفاده کن:
       همه‌ی رنگ‌های هر دو کالا را می‌سنجد (پارچه‌ی راه‌راه
       یا چندرنگ چند رنگ دارد، نه یکی) و «تکرار رنگ» را هم
       تشخیص می‌دهد. وگرنه به موتور ساده‌ی خودمان برمی‌گردد. */
    var colorPts, colorEcho = false;
    if (window.DPPalette) {
      var cr = DPPalette.garmentColorScore(base, cand);
      colorPts = cr.score;
      colorEcho = cr.echo;

      /* ---------- تجربه‌ی واقعی مشتری‌ها ----------
         تا اینجا قاعده حرف زد. حالا مغز یادگیرنده می‌گوید
         در عمل چه اتفاقی افتاده. اگر مشتری‌های شما مدام دو
         رنگ را با هم خریده باشند، همان مهم‌تر از قاعده است.

         ولی محتاطانه: تا وقتی داده کم است، قاعده غالب
         می‌ماند. `blend` خودش این را مدیریت می‌کند. */
      if (window.DPBrain && cr.a && cr.b) {
        var aff = DPBrain.colorAffinity(cr.a, cr.b);
        if (aff.n) colorPts = DPBrain.blend(colorPts, aff, 0.4);
      }
    } else {
      colorPts = colorScore(baseColor(base), baseColor(cand));
    }

    /* ---------- بقیه ---------- */
    var fitPts = (sa === 'top' && sb === 'bottom') || (sa === 'bottom' && sb === 'top')
      ? fitScore(base, cand) : 80;
    var seasonPts  = seasonScore(base, cand);
    var fabricPts  = fabricScore(base, cand);
    /* طرح — دانشنامه مقیاس و خانواده‌ی طرح را هم می‌داند،
       نه فقط «ساده یا طرح‌دار» */
    var patternPts = window.DPPalette
      ? DPPalette.patternPairScore(base.pattern, cand.pattern)
      : patternScore(base, cand);
    var lenPts = sa === 'top' && sb === 'bottom' ? lengthScore(base, cand)
      : sb === 'top' && sa === 'bottom' ? lengthScore(cand, base) : 80;

    /* ---------- وزن‌دهی ----------
       رنگ و رسمیت مهم‌ترند: یک ست با رنگ ناهماهنگ، هرچقدر هم
       بقیه‌اش درست باشد، بد به نظر می‌آید. */
    var score =
        colorPts   * 0.28
      + formalPts  * 0.22
      + pair       * 0.16
      + patternPts * 0.12
      + fitPts     * 0.09
      + seasonPts  * 0.07
      + fabricPts  * 0.04
      + lenPts     * 0.02;

    /* ---------- سقف ترکیب طرح ----------
       وزن ۱۲ درصدی طرح کافی نبود: یک شلوار چهارخانه‌ی
       اسکاتلندی کنار پیراهن راه‌راه، با رنگ خوب و رسمیت
       یکسان، امتیاز ۹۶ می‌گرفت — در حالی که هیچ استایلیستی
       این دو را با هم پیشنهاد نمی‌کند.

       پس ترکیب طرحِ بد، سقف امتیاز می‌گذارد؛ نه اینکه فقط
       چند نمره کم کند. */
    if (patternPts < 35)      score = Math.min(score, 52);
    else if (patternPts < 50) score = Math.min(score, 66);
    else if (patternPts < 60) score = Math.min(score, 74);

    /* ---------- پاداش‌ها ---------- */
    /* تکرار رنگ: وقتی یکی از رنگ‌های پارچه‌ی چندرنگ دقیقاً
       رنگ کالای مقابل است. ترفند شناخته‌شده‌ی استایلینگ. */
    if (colorEcho) score += 5;

    /* ---------- هم‌خریدی واقعی ----------
       اگر این دو کالا واقعاً با هم در یک سبد خریده شده‌اند،
       هیچ قاعده‌ای قوی‌تر از این نیست. این «اثبات میدانی» است. */
    if (window.DPBrain) {
      try {
        var together = DPBrain.boughtWith(base.id, [cand], 1);
        if (together.length) {
          score += Math.min(9, 3 + together[0].w * 0.4);
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    if (Number(cand.stock) > 0) score += 3;
    if (String(base.sellerId) === String(cand.sellerId)) score += 4;   /* یک بسته */
    if (isOnSale(cand)) score += 2;

    return Math.round(Math.min(100, score));
  }

  /** رنگ پایه‌ی کالا — رنگ سفارشی هم به نزدیک‌ترین خانواده نگاشت می‌شود */
  function baseColor(p) {
    /* دانشنامه‌ی گسترده اول — نام‌های جایگزین («نفتی»،
       «کالباسی»، «خزه‌ای») و کد رنگ را هم می‌شناسد */
    if (window.DPPalette) {
      var list = DPPalette.colorsOf(p);
      if (list.length && HUE[list[0]]) return list[0];
      /* رنگی که فقط دانشنامه می‌شناسد را به نزدیک‌ترین
         رنگ موتور قدیمی نگاشت کن، تا جدول‌های اینجا کار کنند */
      if (list.length) {
        var C = DPPalette.HUE[list[0]];
        if (C && C.hex) return nearestHue(C.hex);
      }
    }

    var c = p.color || (Array.isArray(p.colors) ? p.colors[0] : '') || '';
    if (HUE[c]) return c;

    /* رنگ سفارشی فروشنده: از کد رنگش نزدیک‌ترین خانواده را پیدا کن */
    if (window.DPColors) {
      try {
        var found = DPColors.find(c);
        if (found && found.hex) return nearestHue(found.hex);
      } catch (e) { /* بی‌اهمیت */ }
    }
    return '';
  }

  /** نزدیک‌ترین رنگ پایه به یک کد رنگ */
  function nearestHue(hex) {
    var m = String(hex).replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(m)) return '';
    var r = parseInt(m.slice(0, 2), 16) / 255;
    var g = parseInt(m.slice(2, 4), 16) / 255;
    var b = parseInt(m.slice(4, 6), 16) / 255;

    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var l = (mx + mn) / 2 * 100;
    var d = mx - mn;

    /* بی‌رنگ = خنثی */
    if (d < 0.09) {
      return l < 20 ? 'black' : l > 88 ? 'white' : 'gray';
    }

    var h;
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;

    /* نزدیک‌ترین رنگ فهرست بر پایه‌ی زاویه و روشنایی */
    var best = '', bestD = Infinity;
    Object.keys(HUE).forEach(function (k) {
      var H = HUE[k];
      if (H.h == null) return;
      var dh = Math.abs(H.h - h);
      if (dh > 180) dh = 360 - dh;
      var dl = Math.abs(H.light - l) / 3;
      var total = dh + dl;
      if (total < bestD) { bestD = total; best = k; }
    });
    return best;
  }

  function isOnSale(p) {
    if (!window.DPPromo) return false;
    try { return DPPromo.sales.priceOf(p).percent > 0; } catch (e) { return false; }
  }

  /* ============================================================
     ۱۱. توضیح انسانی — چرا این ست خوب است؟
     ------------------------------------------------------------
     مشتری باید بفهمد چرا این پیشنهاد آمده. یک جمله‌ی کوتاه
     مثل حرف یک فروشنده‌ی باتجربه.
     ============================================================ */
  function reasonFor(base, cand) {

    /* ---------- دلیل‌های دقیق دانشنامه ----------
       اینها را فقط دانشنامه می‌داند: تکرار رنگ، ترکیب طرح
       بر پایه‌ی مقیاس، و ناسازگاری زیرلحن. */
    if (window.DPPalette) {
      var PA = DPPalette;

      /* تکرار رنگ — قوی‌ترین دلیل ممکن */
      var cr = PA.garmentColorScore(base, cand);
      if (cr.echo && cr.a) {
        var nm = PA.HUE[cr.a] ? PA.HUE[cr.a].name : '';
        return 'رنگ ' + nm + ' در هر دو تکرار شده — تیپ یکدست می‌شود';
      }

      /* ترکیب طرح */
      var pa = PA.patternOf(base.pattern);
      var pb = PA.patternOf(cand.pattern);

      if (pa.busy > 0 && pb.busy === 0) {
        return pb.family === 'texture'
          ? 'بافت ساده‌اش می‌گذارد طرح آن یکی دیده شود'
          : 'ساده است تا ' + pa.name + ' جلوه کند';
      }
      if (pb.busy > 0 && pa.busy === 0) {
        return pb.name + ' روی زمینه‌ی ساده — کانون توجه تیپ';
      }
      if (pa.busy > 0 && pb.busy > 0 && Math.abs(pa.scale - pb.scale) >= 2) {
        return pa.name + ' با ' + pb.name
          + ' — دو مقیاس متفاوت، ترکیب حرفه‌ای';
      }

      /* فلز هماهنگ */
      var CA = PA.HUE[cr.a], CB = PA.HUE[cr.b];
      if (CA && CB && CA.metal && CB.metal && CA.metal === CB.metal) {
        return 'هر دو ' + (CA.metal === 'warm' ? 'فلز گرم' : 'فلز سرد')
          + ' — اکسسوری‌ها یکدست می‌مانند';
      }

      /* زیرلحن یکسان */
      if (CA && CB && CA.warm != null && CA.warm === CB.warm
        && !CA.neutral && !CB.neutral) {
        return CB.name + ' با ' + CA.name + ' — هر دو زیرلحن '
          + (CA.warm ? 'گرم' : 'سرد') + ' دارند';
      }

      /* رنگ خنثی با رنگی */
      if (CA && CB && CA.neutral && !CB.neutral) {
        return CB.name + ' روی پایه‌ی ' + CA.name + ' — انتخاب مطمئن';
      }
      if (CA && CB && CB.neutral && !CA.neutral) {
        return CB.name + ' پایه‌ی آرامی برای ' + CA.name + ' است';
      }
    }

    var ca = baseColor(base), cb = baseColor(cand);
    var A = HUE[ca], B = HUE[cb];

    var sb = slotOf(cand);
    var SLOT_WHY = {
      bottom: ['پایین‌تنه‌ی هماهنگ', 'زیر این می‌نشیند'],
      top:    ['بالاتنه‌ی هماهنگ', 'روی این می‌آید'],
      shoes:  ['کفشی که تیپ را می‌بندد', 'پاپوش هماهنگ'],
      bag:    ['کیفی که تکمیلش می‌کند', 'همراه شیک'],
      outer:  ['رویه‌ی هماهنگ', 'روی این بپوشید'],
      modest: ['پوشش هم‌رنگ', 'هماهنگ با این'],
      accessory: ['جزئیات تکمیلی', 'ریزه‌کاری ست'],
      full:   ['یک‌تکه‌ی هماهنگ', 'گزینه‌ی هم‌سطح'],
    };

    /* یک واژه‌ی متفاوت برای هر کالا، تا شش جمله‌ی یکسان
       پشت هم نیاید و نوار خشک به نظر نرسد */
    function vary(list) {
      var seed = String(cand.id || '').split('').reduce(
        function (a, c) { return a + c.charCodeAt(0); }, 0);
      return list[seed % list.length];
    }

    if (A && B) {
      if (A.neutral && B.neutral) {
        var pick = SLOT_WHY[sb];
        var tail = pick ? vary(pick) : 'ترکیب خنثی';
        /* اگر روشنایی‌شان فاصله دارد، کنتراست را بگو */
        if (Math.abs(A.light - B.light) > 40) {
          return B.name + ' روی ' + A.name + ' — ' + tail;
        }
        return tail + ' — ' + B.name + ' با ' + A.name + ' همیشه شیک است';
      }
      if (B.neutral) return B.name + ' پایه‌ی امنی برای این ' + (A.name || 'رنگ') + ' است';
      if (A.neutral) return B.name + ' روی ' + A.name + ' می‌درخشد';

      if (A.h != null && B.h != null) {
        var d = Math.abs(A.h - B.h);
        if (d > 180) d = 360 - d;
        if (d <= 15) return 'هم‌خانواده با ' + A.name + ' — تیپ تک‌رنگ';
        if (d <= 45) return B.name + ' و ' + A.name + ' کنار هم آرام‌اند';
        if (d >= 150) return 'تضاد ' + B.name + ' و ' + A.name + ' — جسورانه و چشمگیر';
      }
    }

    var fa = formalOf(base), fb = formalOf(cand);
    if (fa >= 4 && fb >= 4) return 'هم‌سطح رسمی — مناسب همان مناسبت';
    if (fa <= 1 && fb <= 1) return 'راحت و روزمره، مثل خودش';

    var pa = (base.pattern || 'plain') !== 'plain';
    var pb = (cand.pattern || 'plain') !== 'plain';
    if (pa && !pb) return 'ساده است تا طرح آن یکی دیده شود';
    if (!pa && pb) return 'طرحش به سادگی این ست جان می‌دهد';

    var fitD = Math.abs((FIT_W[base.fit] || 2) - (FIT_W[cand.fit] || 2));
    if (fitD >= 2) return 'تعادل فرم — گشاد با جذب';

    return 'با این کالا خوب ست می‌شود';
  }

  /* ============================================================
     ۱۲. پیشنهاد ست
     ------------------------------------------------------------
     خروجی: فهرستی از کالاها که با کالای پایه ست می‌شوند،
     مرتب بر پایه‌ی امتیاز، و **متنوع** — یعنی از هر جایگاه
     چند تا، نه ده تا شلوار.
     ============================================================ */
  /** آیا این کالا اصلاً «تیپ» می‌سازد؟ */
  function isStylable(p) {
    var s = slotOf(p);
    return s !== 'home' && s !== 'under';
  }

  function suggest(base, pool, opt) {
    opt = opt || {};

    /* لباس خواب و لباس زیر ست نمی‌خواهند */
    if (!isStylable(base)) return [];
    var limit = opt.limit || 8;
    var minScore = opt.minScore || 62;
    var perSlot = opt.perSlot || 3;

    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var c = pool[i];
      if (String(c.id) === String(base.id)) continue;
      if (c.status && c.status !== 'active') continue;

      var s = matchScore(base, c);
      if (s == null || s < minScore) continue;

      scored.push({ p: c, score: s, slot: slotOf(c), why: reasonFor(base, c) });
    }

    scored.sort(function (a, b) { return b.score - a.score; });

    /* ---------- تنوع جایگاه ----------
       اگر فقط بر پایه‌ی امتیاز بچینیم، ممکن است هر هشت
       پیشنهاد شلوار باشند. یک ست واقعی از چند جایگاه است. */
    var out = [];
    var count = {};
    for (var j = 0; j < scored.length && out.length < limit; j++) {
      var r = scored[j];
      count[r.slot] = count[r.slot] || 0;
      if (count[r.slot] >= perSlot) continue;
      count[r.slot]++;
      out.push(r);
    }

    /* اگر هنوز جا هست، بقیه را هم اضافه کن */
    if (out.length < limit) {
      for (var k = 0; k < scored.length && out.length < limit; k++) {
        if (out.indexOf(scored[k]) < 0) out.push(scored[k]);
      }
    }

    return out;
  }

  /* ============================================================
     ۱۳. ست کامل — «این تیپ را کامل کن»
     ------------------------------------------------------------
     بهترین کالا برای هر جایگاهِ خالی. مثل وقتی فروشنده‌ی
     باتجربه می‌گوید «این شلوار و این کفش را هم بردار، ست
     می‌شود».
     ============================================================ */
  function buildOutfit(base, pool) {
    var mySlot = slotOf(base);

    /* کدام جایگاه‌ها برای کامل شدن لازم است؟ */
    var need = {
      top:    ['bottom', 'outer', 'shoes', 'bag'],
      bottom: ['top', 'outer', 'shoes', 'bag'],
      full:   ['outer', 'shoes', 'bag'],
      outer:  ['top', 'bottom', 'shoes'],
      shoes:  ['bottom', 'top', 'bag'],
      bag:    ['full', 'top', 'shoes'],
      accessory: ['full', 'top', 'bottom'],
      modest: ['full', 'top', 'bottom'],
    }[mySlot];

    if (!need) return null;

    var picks = [];
    var used = {};

    need.forEach(function (slot) {
      var best = null;
      for (var i = 0; i < pool.length; i++) {
        var c = pool[i];
        if (String(c.id) === String(base.id) || used[c.id]) continue;
        if (Number(c.stock) <= 0) continue;
        if (slotOf(c) !== slot) continue;

        var s = matchScore(base, c);
        if (s == null || s < 68) continue;
        if (!best || s > best.score) best = { p: c, score: s, slot: slot };
      }
      if (best) {
        used[best.p.id] = 1;
        best.why = reasonFor(base, best.p);
        picks.push(best);
      }
    });

    /* ست کمتر از دو قطعه، ست نیست */
    if (picks.length < 2) return null;

    var total = picks.reduce(function (a, x) {
      return a + priceOf(x.p);
    }, priceOf(base));

    var avg = Math.round(
      picks.reduce(function (a, x) { return a + x.score; }, 0) / picks.length);

    return { items: picks, total: total, score: avg, slot: mySlot };
  }

  function priceOf(p) {
    if (window.DPPromo) {
      try {
        var n = Number(DPPromo.sales.priceOf(p).price);
        if (Number.isFinite(n) && n >= 0) return n;
      } catch (e) { /* بی‌اهمیت */ }
    }
    return Number(p.price) || 0;
  }

  /* ============================================================
     ۱۴. عنوان هوشمند برای نوار پیشنهاد
     ============================================================ */
  function titleFor(base) {
    var s = slotOf(base);
    var c = baseColor(base);
    var nm = HUE[c] ? HUE[c].name : '';

    var T = {
      top:    'با این ' + (nm ? nm + ' ' : '') + 'چه بپوشیم؟',
      bottom: 'بالاتنه‌ای که به این می‌آید',
      full:   'این تیپ را کامل کنید',
      outer:  'زیر این چه بپوشیم؟',
      shoes:  'با این کفش ست کنید',
      bag:    'این کیف با این‌ها می‌آید',
      accessory: 'ست کنید با',
      modest: 'هماهنگ با این پوشش',
    };
    return T[s] || 'ست کنید با';
  }

  window.DPStylist = {
    HUE: HUE,
    SLOT: SLOT,
    PAIR: PAIR,          /* نگهبان قواعد به این نیاز دارد */
    FORMAL_ITEM: FORMAL_ITEM,
    SEC_OK: SEC_OK,
    sectionOf: sectionOf,
    sectionFits: sectionFits,
    slotOf: slotOf,
    formalOf: formalOf,
    baseColor: baseColor,
    nearestHue: nearestHue,
    colorScore: colorScore,
    matchScore: matchScore,
    reasonFor: reasonFor,
    isStylable: isStylable,
    suggest: suggest,
    buildOutfit: buildOutfit,
    titleFor: titleFor,
  };
})();
