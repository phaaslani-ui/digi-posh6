/* ============================================================
   دیجی‌پوش — ویژگی‌های کالا و نام‌گذاری خودکار
   ------------------------------------------------------------
   یک منبع واحد برای هر دو طرف:
     • فروشنده — منوهای کشویی فرم افزودن کالا
     • مشتری   — گزینه‌های نوار فیلتر

   چون هر دو از همین فایل می‌خوانند، هرگز پیش نمی‌آید که
   فروشنده گزینه‌ای ببیند که مشتری نتواند با آن فیلتر کند.

   نام کالا دیگر دستی نوشته نمی‌شود. سامانه می‌سازدش:
     «پیراهن رسمی مردانه پنبه سرمه‌ای کلاسیک آستین بلند»

   چرا؟ چون وقتی هر فروشنده نام دلخواه می‌نوشت، یکی «مردونه»
   می‌نوشت و دیگری «مردانه ي كلاسيك» با حرف عربی. مشتری که
   دنبال «پیراهن مردانه» می‌گشت، نصف کالاها را نمی‌دید.
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ۱. گروه‌های ویژگی
     ------------------------------------------------------------
     required  → در فرم فروشنده اجباری است
     inName    → در نام خودکار کالا می‌آید
     nameOrder → جایش در نام
     ============================================================ */
  var GROUPS = [
    { key: 'fabric',  label: 'جنس پارچه', required: true,  inName: true,  nameOrder: 3 },
    { key: 'color',   label: 'رنگ اصلی',  required: true,  inName: true,  nameOrder: 4 },
    { key: 'style',   label: 'مدل',       required: true,  inName: true,  nameOrder: 5 },
    { key: 'sleeve',  label: 'آستین',     required: false, inName: true,  nameOrder: 6 },
    { key: 'collar',  label: 'یقه',       required: false, inName: false, nameOrder: 0 },
    { key: 'length',  label: 'قد',        required: false, inName: false, nameOrder: 0 },
    { key: 'fit',     label: 'فرم برش',   required: false, inName: false, nameOrder: 0 },
    { key: 'pattern', label: 'طرح',       required: false, inName: false, nameOrder: 0 },
    { key: 'season',  label: 'فصل',       required: false, inName: false, nameOrder: 0 },
  ];

  /* ============================================================
     ۲. گزینه‌های هر ویژگی
     ------------------------------------------------------------
     همان فهرستی که در schema-attributes.sql کاشته می‌شود.
     ترتیب یکی است تا داده‌ی محلی و داده‌ی سرور یکی بمانند.
     ============================================================ */
  var OPTIONS = {
    fabric: [
      ['silk', 'ابریشم'], ['cotton', 'پنبه'], ['polyester', 'پلی‌استر'],
      ['wool', 'پشم'], ['linen', 'کتان'], ['denim', 'جین'],
      ['velvet', 'مخمل'], ['chiffon', 'حریر'], ['crepe', 'کرپ'],
      ['satin', 'ساتن'], ['cashmere', 'کشمیر'], ['viscose', 'ویسکوز'],
      ['leather', 'چرم'], ['knit', 'بافت'], ['nylon', 'نایلون'],
      ['jersey', 'جودون'],
    ],
    color: [
      ['black', 'مشکی', '#1a1a1a'], ['white', 'سفید', '#ffffff'],
      ['gold', 'طلایی', '#c9a84c'], ['silver', 'نقره‌ای', '#c0c0c0'],
      ['red', 'قرمز', '#c62828'], ['blue', 'آبی', '#1565c0'],
      ['navy', 'سرمه‌ای', '#14203a'], ['green', 'سبز', '#2e7d32'],
      ['pink', 'صورتی', '#e91e63'], ['purple', 'بنفش', '#7b1fa2'],
      ['cream', 'کرم', '#f5f0e8'], ['beige', 'بژ', '#d7c4a3'],
      ['gray', 'خاکستری', '#757575'], ['brown', 'قهوه‌ای', '#5d4037'],
      ['yellow', 'زرد', '#f9a825'], ['orange', 'نارنجی', '#ef6c00'],
      ['turquoise', 'فیروزه‌ای', '#00897b'], ['maroon', 'زرشکی', '#880e4f'],
    ],
    style: [
      ['classic', 'کلاسیک'], ['modern', 'مدرن'], ['sporty', 'اسپرت'],
      ['elegant', 'مجلسی'], ['casual', 'کژوال'], ['minimal', 'مینیمال'],
      ['vintage', 'وینتیج'], ['bohemian', 'بوهو'], ['traditional', 'سنتی'],
      ['street', 'خیابانی'],
    ],
    sleeve: [
      ['long', 'آستین بلند'], ['short', 'آستین کوتاه'],
      ['three-quarter', 'آستین سه‌چهارم'], ['sleeveless', 'بدون آستین'],
      ['cap', 'آستین حلقه‌ای'], ['none', 'ندارد'],
    ],
    collar: [
      ['round', 'یقه گرد'], ['v-neck', 'یقه هفت'], ['stand', 'یقه ایستاده'],
      ['shawl', 'یقه شال'], ['shirt', 'یقه پیراهنی'], ['boat', 'یقه قایقی'],
      ['turtle', 'یقه اسکی'], ['hood', 'کلاه‌دار'], ['collarless', 'بدون یقه'],
      ['none', 'ندارد'],
    ],
    length: [
      ['maxi', 'بلند'], ['midi', 'میان‌قد'], ['short', 'کوتاه'],
      ['mini', 'مینی'], ['crop', 'کوتاه (کراپ)'], ['none', 'ندارد'],
    ],
    fit: [
      ['slim', 'جذب'], ['regular', 'معمولی'], ['loose', 'گشاد'],
      ['oversize', 'اورسایز'],
    ],
    pattern: [
      ['plain', 'ساده'], ['textured', 'بافت‌دار'], ['ribbed', 'کبریتی'],
      ['melange', 'ملانژ'],
      ['pinstripe', 'راه‌راه بسیار ریز'], ['striped', 'راه‌راه'],
      ['widestripe', 'راه‌راه درشت'], ['breton', 'راه‌راه ملوانی'],
      ['gingham', 'چهارخانه ریز'], ['checked', 'چهارخانه'],
      ['tartan', 'چهارخانه اسکاتلندی'], ['houndstooth', 'دندان‌سگی'],
      ['windowpane', 'قاب‌پنجره‌ای'], ['argyle', 'لوزی'],
      ['pindot', 'خال ریز'], ['dots', 'خال‌خالی'], ['polkadot', 'خال درشت'],
      ['ditsy', 'گل ریز'], ['floral', 'گل‌دار'], ['botanical', 'برگ و شاخه'],
      ['tropical', 'برگ استوایی'], ['paisley', 'بته‌جقه'],
      ['leopard', 'پلنگی'], ['zebra', 'گورخری'], ['snake', 'پوست ماری'],
      ['geometric', 'هندسی'], ['chevron', 'زیگزاگ'], ['abstract', 'انتزاعی'],
      ['camo', 'ارتشی'], ['tiedye', 'تای‌دای'],
      ['ethnic', 'سنتی'], ['kilim', 'گلیمی'], ['termeh', 'ترمه'],
      ['embroidered', 'گلدوزی'], ['lace', 'دانتل'], ['sequin', 'پولک‌دوزی'],
      ['metallic', 'براق فلزی'], ['quilted', 'لحافی'],
      ['logo', 'لوگودار'], ['graphic', 'طرح چاپی'], ['text', 'نوشته‌دار'],
      ['colorblock', 'بلوک رنگی'], ['ombre', 'طیف رنگی'],
      ['half', 'دورنگ نصف'], ['multi', 'چندرنگ'], ['patchwork', 'تکه‌دوزی'],
    ],
    season: [
      ['spring', 'بهاره'], ['summer', 'تابستانه'], ['autumn', 'پاییزه'],
      ['winter', 'زمستانه'], ['all', 'چهارفصل'],
    ],
    size: [
      ['XS', 'XS'], ['S', 'S'], ['M', 'M'], ['L', 'L'],
      ['XL', 'XL'], ['XXL', 'XXL'], ['3XL', '3XL'], ['free', 'فری‌سایز'],
    ],
  };

  /* ---------- تبدیل به شکل شیءگونه، یک بار ---------- */
  var OPT = {};      /* { fabric: [{name,label,swatch}], … } */
  var LBL = {};      /* { fabric: { silk: 'ابریشم' }, … }     */

  Object.keys(OPTIONS).forEach(function (g) {
    OPT[g] = OPTIONS[g].map(function (row) {
      return { name: row[0], label: row[1], swatch: row[2] || null };
    });
    LBL[g] = {};
    OPT[g].forEach(function (o) { LBL[g][o.name] = o.label; });
  });

  /* ============================================================
     ۳. صفت هر بخش — در نام کالا می‌نشیند
     ============================================================ */
  var SECTION_ADJ = {
    women: 'زنانه',
    men:   'مردانه',
    kids:  'بچگانه',
    teen:  'نوجوان',
  };

  /* ============================================================
     ۴. یکسان‌سازی نویسه‌های فارسی
     ------------------------------------------------------------
     «ي» و «ك» عربی و اعراب حذف می‌شوند. نکته: «آ» عمداً
     دست‌نخورده می‌ماند — تبدیلش به «ا» واژه‌ی درست را خراب
     می‌کند و «آستین» می‌شود «استین».
     ============================================================ */
  function normalizeFa(v) {
    return String(v == null ? '' : v)
      .replace(/[\u064A]/g, 'ی')
      .replace(/[\u0643]/g, 'ک')
      .replace(/\u0629/g, 'ه')
      .replace(/[\u0623\u0625]/g, 'ا')
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/\u200C+/g, '\u200C')
      .replace(/[ \t\u00A0]+/g, ' ')
      .trim();
  }

  /* ============================================================
     ۵. ساخت نام خودکار
     ------------------------------------------------------------
     [نوع کالا] [صفت بخش] [پارچه] [رنگ] [مدل] [آستین]
     ============================================================ */
  var IN_NAME = GROUPS
    .filter(function (g) { return g.inName; })
    .sort(function (a, b) { return a.nameOrder - b.nameOrder; });

  /* ---------- کالاهایی که پارچه ندارند ---------- */
  /* «کفش رسمی مردانه چرم» درست است، ولی «کفش رسمی مردانه پنبه»
     غلط است. برای این دسته‌ها واژه‌ی جنس با حرف اضافه می‌آید. */
  var NON_FABRIC = /کفش|چکمه|صندل|کتانی|دمپایی|بوت|کیف|کوله|جوراب|کلاه|کمربند|عینک|ساعت|دستکش|شال|روسری|زیورآلات|گردنبند|دستبند|انگشتر/;

  /* ---------- کالاهایی که آستین ندارند ---------- */
  var NO_SLEEVE = /کفش|چکمه|صندل|کتانی|دمپایی|بوت|کیف|کوله|جوراب|کلاه|کمربند|عینک|ساعت|شال|روسری|دامن|شلوار|شلوارک|زیورآلات|گردنبند|دستبند|انگشتر/;

  /* ---------- واژه‌های رنگی که خودشان صفت‌اند ---------- */
  /* «مانتو زنانه ابریشم طلایی» روان است. ولی اگر رنگ سفارشی
     فروشنده «آبی نفتی روشن» باشد، بدون حرف اضافه بد می‌نشیند. */
  function colorPhrase(lbl) {
    var t = String(lbl).trim();
    var n = t.split(/\s+/).length;

    /* یک واژه: همان‌طور می‌آید — «مانتو زنانه مشکی» */
    if (n < 2) return t;

    /* دو واژه: «به رنگ» جمله را روان می‌کند و فقط دو واژه
       اضافه می‌کند — «مانتو زنانه به رنگ آبی نفتی» */
    if (n === 2) return 'به رنگ ' + t;

    /* سه واژه و بیشتر: «به رنگ» را نمی‌گذاریم، وگرنه پنج
       واژه از هفت واژه‌ی مجاز را همین رنگ می‌بلعد و جنس و
       مدل بیرون می‌افتند. رنگ خودش گویاست. */
    return t;
  }

  /* ============================================================
     ۵. ساخت نام خودکار — الگوی هوشمند
     ------------------------------------------------------------
     الگوی پایه:
       [نوع کالا] [صفت بخش] [طرح] [جنس] [رنگ] [مدل] [آستین] [قد]

     ولی الگو کورکورانه اجرا نمی‌شود. چند قاعده‌ی هوشمند:

     ۱) تکرار حذف می‌شود. «شلوار جین» + جنس «جین» می‌شد
        «شلوار جین بچگانه جین». حالا می‌شود «شلوار جین بچگانه».

     ۲) کالای بدون پارچه (کفش، کیف، جوراب) جنسش با حرف اضافه
        می‌آید: «کفش رسمی مردانه چرمی» نه «کفش رسمی مردانه چرم».

     ۳) آستین و قد فقط برای کالایی می‌آید که معنا دارد.
        «شلوار زنانه آستین بلند» بی‌معناست.

     ۴) رنگ چندواژه‌ای با «به رنگ» می‌آید تا جمله نشکند.

     ۵) نام از یک سقف بلندتر نمی‌شود — کارت کالا جا ندارد.
     ============================================================ */

  /** صفت‌سازی از نام جنس، برای کالای غیرپارچه‌ای */
  var FABRIC_ADJ = {
    leather: 'چرمی', cotton: 'نخی', wool: 'پشمی', silk: 'ابریشمی',
    denim: 'جین', linen: 'کتانی', velvet: 'مخملی', satin: 'ساتنی',
    knit: 'بافتنی', nylon: 'نایلونی', polyester: 'پلی‌استری',
    chiffon: 'حریری', crepe: 'کرپی', cashmere: 'کشمیری',
    viscose: 'ویسکوزی', jersey: 'جودونی',
  };

  /* ============================================================
     سقف طول نام — دو مرحله‌ای
     ------------------------------------------------------------
     نام کالا در سه جا دیده می‌شود:
       · کارت کالا در ویترین  → جای کم، دو خط
       · صفحه‌ی کالا           → جای زیاد
       · نتیجه‌ی جست‌وجوی گوگل → حدود ۶۰ نویسه

     پیش‌تر سقف ۷۰ نویسه بود و وقتی پر می‌شد، واژه‌ها را
     کورکورانه از آخر می‌انداخت. نتیجه: «قد بلند» می‌پرید
     ولی «نوجوان» می‌ماند — در حالی که «قد» مهم‌تر است.

     حالا هر تکه ارزش دارد. وقتی نام بلند می‌شود، کم‌ارزش‌ترین
     تکه‌ها می‌روند، نه آخری‌ها.
     ============================================================ */
  var SOFT_LEN = 46;   /* طول دلخواه — تا اینجا خوش‌خوان است */
  var MAX_LEN  = 62;   /* سقف قطعی — بیشتر از این هرگز */
  var MAX_CHUNKS = 6;  /* بیشتر از شش ویژگی در نام، خوانده نمی‌شود */

  /* ---------- ارزش هر تکه ----------
     عدد بزرگ‌تر = مهم‌تر = دیرتر حذف می‌شود.

     چرا این ترتیب؟ از دید مشتری که دنبال کالا می‌گردد:
       · نوع کالا بدون آن اصلاً نامی نیست
       · رنگ نخستین چیزی است که می‌پرسند
       · بخش (زنانه/مردانه) تصمیم خرید را عوض می‌کند
       · جنس پارچه در پوشاک لوکس مهم است
       · مدل و طرح ظاهر را می‌گویند
       · آستین و قد جزئیات‌اند — در جدول مشخصات هم هستند
  */
  var WEIGHT = {
    item:    100,
    color:    80,
    section:  70,
    fabric:   60,
    style:    45,
    pattern:  35,
    sleeve:   25,
    length:   20,
  };

  /* ---------- واژه‌های تکراری‌نما ----------
     «آستین بلند» و «قد بلند» هر دو «بلند» دارند. کنار هم
     نام را گنگ می‌کنند: «پیراهن آستین بلند قد بلند».
     در چنین حالتی فقط یکی می‌ماند. */
  function clashes(a, b) {
    if (!a || !b) return false;
    var wa = String(a).split(/\s+/);
    var wb = String(b).split(/\s+/);
    for (var i = 0; i < wa.length; i++) {
      if (wa[i].length > 2 && wb.indexOf(wa[i]) > -1) return true;
    }
    return false;
  }

  /**
   * ساخت نام از تکه‌های وزن‌دار.
   * اگر بلند شد، کم‌ارزش‌ترین‌ها را می‌اندازد و فهرستشان را
   * برمی‌گرداند تا به فروشنده بگوییم کجا رفتند.
   */
  function assemble(chunks) {
    var keep = chunks.slice();
    var dropped = [];

    var text = function (list) {
      return list.map(function (c) { return c.text; }).join(' ')
        .replace(/\s+/g, ' ').trim();
    };
    /* شمارش «تکه»، نه واژه‌ی خام.
       «به رنگ آبی نفتی» یک ویژگی است، نه چهار ویژگی. اگر
       واژه بشماریم، یک رنگ چندواژه‌ای همه‌ی ویژگی‌های دیگر
       را بیرون می‌اندازد. */
    var words = function (list) { return list.length; };

    /* ---------- گام ۱: تکه‌های واژه‌مشترک ----------
       اگر دو تکه واژه‌ی مشترک دارند، کم‌ارزش‌ترش می‌رود. */
    for (var i = keep.length - 1; i > 0; i--) {
      for (var j = 0; j < i; j++) {
        if (clashes(keep[i].text, keep[j].text)) {
          var weak = keep[i].w <= keep[j].w ? i : j;
          dropped.push(keep[weak]);
          keep.splice(weak, 1);
          i = keep.length;      /* از نو بررسی کن */
          break;
        }
      }
    }

    /* ---------- گام ۲: تا رسیدن به طول دلخواه ----------
       هر بار سبک‌ترین تکه (به‌جز نوع کالا) حذف می‌شود. */
    var guard = 0;
    while ((text(keep).length > SOFT_LEN || words(keep) > MAX_CHUNKS)
           && keep.length > 2 && guard++ < 20) {
      var min = 1, minW = Infinity;
      for (var k = 1; k < keep.length; k++) {
        if (keep[k].w < minW) { minW = keep[k].w; min = k; }
      }
      dropped.push(keep[min]);
      keep.splice(min, 1);
    }

    /* ---------- گام ۳: سقف قطعی ----------
       اگر باز هم بلند است (نوع کالای خیلی طولانی)، از آخر
       کوتاه می‌کنیم — ولی هرگز وسط واژه نمی‌بُریم. */
    var out = text(keep);
    if (out.length > MAX_LEN) {
      var w = out.split(/\s+/);
      while (w.length > 2 && w.join(' ').length > MAX_LEN) w.pop();
      out = w.join(' ');
    }

    return { name: out, dropped: dropped };
  }

  /* ============================================================
     ساخت نام کالا
     ------------------------------------------------------------
     هر ویژگی یک «تکه» با وزن مشخص می‌سازد. سپس `assemble`
     تصمیم می‌گیرد کدام‌ها بمانند.

     خروجی همیشه کوتاه، خوانا و بدون تکرار است.
     ============================================================ */
  function nameParts(sel) {
    if (!sel) return [];

    var item = normalizeFa(sel.itemType || sel.item);
    if (!item) return [];

    var chunks = [{ key: 'item', src: 'نوع کالا', text: item, w: WEIGHT.item }];

    /* واژه‌های استفاده‌شده — برای پرهیز از تکرار */
    var used = {};
    item.split(/\s+/).forEach(function (w) { used[w] = 1; });

    function add(key, src, word) {
      var w = normalizeFa(word);
      if (!w) return;
      var first = w.split(/\s+/)[0];
      if (used[w] || used[first]) return;      /* تکراری */
      used[w] = 1;
      w.split(/\s+/).forEach(function (x) { used[x] = 1; });
      chunks.push({ key: key, src: src, text: w, w: WEIGHT[key] || 10 });
    }

    /* ---------- صفت بخش ---------- */
    add('section', 'بخش', SECTION_ADJ[sel.section]);

    /* ---------- طرح، اگر ساده نباشد ---------- */
    if (sel.pattern && sel.pattern !== 'plain' && sel.pattern !== 'none') {
      add('pattern', 'طرح', LBL.pattern && LBL.pattern[sel.pattern]);
    }

    /* ---------- جنس ---------- */
    if (sel.fabric && sel.fabric !== 'none') {
      var plain = NON_FABRIC.test(item);
      add('fabric', 'جنس', plain
        ? (FABRIC_ADJ[sel.fabric] || (LBL.fabric && LBL.fabric[sel.fabric]))
        : (LBL.fabric && LBL.fabric[sel.fabric]));
    }

    /* ---------- رنگ ----------
       رنگ سفارشی فروشنده می‌تواند هر چیزی باشد: «آبی نفتی
       روشن مایل به سبز». چنین نامی به‌تنهایی کل نام کالا را
       می‌بلعد. دو واژه‌ی نخست معمولاً منظور را می‌رسانند. */
    if (sel.color && sel.color !== 'none') {
      var clbl = (LBL.color && LBL.color[sel.color]) || sel.colorLabel;
      if (clbl) {
        var cw = String(clbl).trim().split(/\s+/);
        if (cw.length > 3) clbl = cw.slice(0, 2).join(' ');
        add('color', 'رنگ', colorPhrase(clbl));
      }
    }

    /* ---------- مدل ---------- */
    if (sel.style && sel.style !== 'none') {
      add('style', 'مدل', LBL.style && LBL.style[sel.style]);
    }

    /* ---------- آستین، فقط جایی که معنا دارد ---------- */
    if (sel.sleeve && sel.sleeve !== 'none' && !NO_SLEEVE.test(item)) {
      add('sleeve', 'آستین', LBL.sleeve && LBL.sleeve[sel.sleeve]);
    }

    /* ---------- قد ----------
       اگر آستین هم آمده، «قد» را صریح می‌نویسیم تا خواننده
       نپرسد «بلند» به کدام برمی‌گردد. */
    if (sel.length && sel.length !== 'none') {
      var llbl = LBL.length && LBL.length[sel.length];
      if (llbl) {
        var sleeveShown = chunks.some(function (c) { return c.key === 'sleeve'; });
        add('length', 'قد', sleeveShown ? 'قد ' + llbl : llbl);
      }
    }

    return chunks;
  }

  function buildName(sel) {
    var chunks = nameParts(sel);
    if (!chunks.length) return '';
    return assemble(chunks).name;
  }

  /**
   * نام کامل بدون کوتاه‌سازی — برای صفحه‌ی کالا و جدول
   * مشخصات، جایی که جا هست.
   */
  function buildFullName(sel) {
    var chunks = nameParts(sel);
    if (!chunks.length) return '';
    return chunks.map(function (c) { return c.text; }).join(' ')
      .replace(/\s+/g, ' ').trim();
  }

  /**
   * گزارش کامل نام — برای اینکه فروشنده ببیند چه شد.
   * می‌گوید کدام تکه‌ها در نام آمدند، کدام‌ها جا نشدند و چرا.
   */
  function nameReport(sel) {
    var chunks = nameParts(sel);
    if (!chunks.length) {
      return { name: '', full: '', kept: [], dropped: [], len: 0, tight: false };
    }
    var res = assemble(chunks);
    var keptKeys = {};
    chunks.forEach(function (c) { keptKeys[c.key] = c; });
    res.dropped.forEach(function (c) { delete keptKeys[c.key]; });

    return {
      name: res.name,
      full: chunks.map(function (c) { return c.text; }).join(' '),
      kept: chunks.filter(function (c) { return keptKeys[c.key]; }),
      dropped: res.dropped,
      len: res.name.length,
      tight: res.name.length > SOFT_LEN - 6,
    };
  }

  /**
   * پیش‌نمایش اجزای نام — برای اینکه فروشنده ببیند هر تکه
   * از کجا آمده و چرا تکه‌ای حذف شده.
   */
  function explainName(sel) {
    if (!sel) return [];
    var item = normalizeFa(sel.itemType || sel.item);
    var out = [];

    out.push({ src: 'نوع کالا', text: item || '—', on: !!item });
    out.push({ src: 'بخش', text: SECTION_ADJ[sel.section] || '—', on: !!SECTION_ADJ[sel.section] });

    var full = buildName(sel);

    [['pattern', 'طرح'], ['fabric', 'جنس'], ['color', 'رنگ'],
     ['style', 'مدل'], ['sleeve', 'آستین'], ['length', 'قد']].forEach(function (pair) {
      var k = pair[0];
      var v = sel[k];
      if (!v || v === 'none') return;
      var lbl = (LBL[k] && LBL[k][v]) || (k === 'color' && sel.colorLabel) || '';
      if (!lbl) return;
      /* آیا واقعاً در نام نهایی آمد؟ */
      var shown = full.indexOf(String(lbl).split(/\s+/)[0]) > -1;
      out.push({ src: pair[1], text: lbl, on: shown });
    });

    return out;
  }

  /* ============================================================
     ۶. بررسی کامل بودن انتخاب‌ها
     ============================================================ */
  function missingOf(sel) {
    var out = [];
    if (!sel || !SECTION_ADJ[sel.section]) out.push('بخش کالا');
    if (!sel || !normalizeFa(sel.itemType || sel.item)) out.push('نوع کالا');

    GROUPS.forEach(function (g) {
      if (!g.required) return;
      /* رنگ سفارشی فروشنده هم رنگ حساب می‌شود، هرچند در فهرست
         پایه نیست */
      if (g.key === 'color' && sel && sel.colorLabel) return;
      if (!sel || !sel[g.key]) out.push(g.label);
    });

    var sizes = (sel && sel.sizes) || [];
    if (!sizes.length) out.push('سایز');

    return out;
  }

  /** برچسب فارسی یک گزینه */
  function labelOf(group, name) {
    return (LBL[group] && LBL[group][name]) || '';
  }

  /** رنگ نمایشی یک گزینه‌ی رنگ */
  function swatchOf(name) {
    var found = null;
    OPT.color.some(function (o) {
      if (o.name === name) { found = o.swatch; return true; }
      return false;
    });
    return found;
  }

  /* ============================================================
     ۷. خلاصه‌ی ویژگی‌های یک کالا — برای کارت و صفحه‌ی کالا
     ============================================================ */
  function summarize(product) {
    if (!product) return [];
    var out = [];
    GROUPS.forEach(function (g) {
      var v = product[g.key] || product[g.key + '_key'];
      if (!v || v === 'none') return;
      var lbl = labelOf(g.key, v);
      if (lbl) out.push({ key: g.key, group: g.label, value: lbl, raw: v });
    });
    return out;
  }

  window.DPAttributes = {
    GROUPS: GROUPS,
    OPTIONS: OPT,
    LABELS: LBL,
    SECTION_ADJ: SECTION_ADJ,
    SECTIONS: Object.keys(SECTION_ADJ),
    normalizeFa: normalizeFa,
    buildName: buildName,
    buildFullName: buildFullName,
    nameParts: nameParts,
    nameReport: nameReport,
    explainName: explainName,
    missingOf: missingOf,
    labelOf: labelOf,
    swatchOf: swatchOf,
    summarize: summarize,
  };
})();
