/* ============================================================
   dp-palette.js — دانشنامه‌ی رنگ و طرح پارچه
   ------------------------------------------------------------
   این فایل جای فهرست کوچک ۲۸ رنگی قبلی را می‌گیرد.

   چرا لازم بود؟
     رنگ «آبی» یک رنگ نیست. آبی نفتی، آبی کاربنی، آبی
     آسمانی و فیروزه‌ای چهار رفتار کاملاً متفاوت در ست کردن
     دارند. سیستم قبلی همه را یکی می‌دید.

     همچنین پارچه‌ی راه‌راه یا چهارخانه یا چندرنگ، «یک رنگ»
     ندارد — چند رنگ دارد و قاعده‌هایش هم فرق می‌کند.

   چه چیزی اینجا هست؟
     ۱. ۹۶ رنگ با زیرلحن گرم/سرد و اشباع
     ۲. ۳۲ طرح پارچه با مقیاس و شلوغی
     ۳. تحلیل رنگ فصلی (بهار/تابستان/پاییز/زمستان)
     ۴. قاعده‌ی ترکیب طرح‌ها بر پایه‌ی مقیاس
     ۵. پشتیبانی از پارچه‌ی چندرنگ

   همه‌چیز جاوااسکریپت ساده است، بدون وابستگی بیرونی.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ۱. چرخه‌ی رنگ گسترده
     ------------------------------------------------------------
     هر رنگ این ویژگی‌ها را دارد:

       h        زاویه روی چرخه‌ی رنگ (۰ تا ۳۶۰) — null یعنی بی‌رنگ
       light    روشنایی (۰ تا ۱۰۰)
       sat      اشباع (۰ تا ۱۰۰) — چقدر رنگ «تند» است
       neutral  آیا با همه‌چیز می‌رود؟
       warm     زیرلحن: true گرم، false سرد، null بی‌طرف
       name     نام فارسی
       hex      کد رنگ برای نمایش

     «زیرلحن» مفهوم کلیدی در تحلیل رنگ است: دو آبی می‌توانند
     یکی گرم (مایل به سبز) و یکی سرد (مایل به بنفش) باشند و
     کنار هم بد بیفتند، هرچند هر دو «آبی»اند.
     ============================================================ */
  var HUE = {

    /* ================= بی‌رنگ‌ها و خنثی‌ها ================= */
    black:      { h: null, light: 5,  sat: 0,  neutral: true,  warm: null,  name: 'مشکی',            hex: '#1A1A1A' },
    softblack:  { h: 30,   light: 12, sat: 8,  neutral: true,  warm: true,  name: 'مشکی مایل به قهوه', hex: '#221C18' },
    charcoal:   { h: 210,  light: 22, sat: 6,  neutral: true,  warm: false, name: 'ذغالی',           hex: '#35393D' },
    darkgray:   { h: null, light: 30, sat: 0,  neutral: true,  warm: null,  name: 'خاکستری تیره',    hex: '#4A4A4A' },
    gray:       { h: null, light: 50, sat: 0,  neutral: true,  warm: null,  name: 'طوسی',            hex: '#9A9A9A' },
    lightgray:  { h: null, light: 72, sat: 0,  neutral: true,  warm: null,  name: 'طوسی روشن',       hex: '#C4C4C4' },
    dovegray:   { h: 25,   light: 60, sat: 5,  neutral: true,  warm: true,  name: 'خاکستری گرم',     hex: '#A79C94' },
    stone:      { h: 40,   light: 68, sat: 10, neutral: true,  warm: true,  name: 'سنگی',            hex: '#B8AC9B' },
    greige:     { h: 40,   light: 74, sat: 8,  neutral: true,  warm: true,  name: 'بژ خاکستری',      hex: '#C4B9AC' },
    white:      { h: null, light: 98, sat: 0,  neutral: true,  warm: null,  name: 'سفید',            hex: '#FFFFFF' },
    offwhite:   { h: 40,   light: 95, sat: 8,  neutral: true,  warm: true,  name: 'سفید شکری',       hex: '#F7F2E9' },
    ivory:      { h: 45,   light: 94, sat: 14, neutral: true,  warm: true,  name: 'عاجی',            hex: '#F5EFDF' },
    cream:      { h: 45,   light: 92, sat: 22, neutral: true,  warm: true,  name: 'کرم',             hex: '#F2E8D5' },
    sand:       { h: 40,   light: 84, sat: 24, neutral: true,  warm: true,  name: 'شنی',             hex: '#E3D5BC' },
    beige:      { h: 38,   light: 78, sat: 26, neutral: true,  warm: true,  name: 'بژ',              hex: '#D9C4A9' },
    taupe:      { h: 32,   light: 55, sat: 14, neutral: true,  warm: true,  name: 'قهوه‌ای خاکستری',  hex: '#8E8177' },
    camel:      { h: 33,   light: 62, sat: 42, neutral: true,  warm: true,  name: 'شتری',            hex: '#C19A6B' },
    tan:        { h: 28,   light: 58, sat: 40, neutral: true,  warm: true,  name: 'برنزه',           hex: '#B08258' },
    caramel:    { h: 26,   light: 48, sat: 52, neutral: true,  warm: true,  name: 'کاراملی',         hex: '#A9702F' },
    brown:      { h: 25,   light: 30, sat: 44, neutral: true,  warm: true,  name: 'قهوه‌ای',          hex: '#6B4429' },
    chocolate:  { h: 22,   light: 20, sat: 40, neutral: true,  warm: true,  name: 'شکلاتی',          hex: '#45291A' },
    espresso:   { h: 20,   light: 14, sat: 30, neutral: true,  warm: true,  name: 'قهوه‌ای سوخته',    hex: '#2E1D14' },
    khaki:      { h: 50,   light: 58, sat: 26, neutral: true,  warm: true,  name: 'خاکی',            hex: '#A79768' },
    olive:      { h: 70,   light: 38, sat: 36, neutral: true,  warm: true,  name: 'زیتونی',          hex: '#77813C' },
    darkolive:  { h: 75,   light: 26, sat: 32, neutral: true,  warm: true,  name: 'زیتونی تیره',     hex: '#4F5426' },
    navy:       { h: 220,  light: 18, sat: 46, neutral: true,  warm: false, name: 'سرمه‌ای',          hex: '#1B2A4A' },
    midnight:   { h: 230,  light: 12, sat: 40, neutral: true,  warm: false, name: 'آبی شب',          hex: '#141B33' },

    /* ================= آبی‌ها ================= */
    denim:      { h: 215,  light: 42, sat: 40, neutral: true,  warm: false, name: 'جین',             hex: '#3C5A87' },
    lightdenim: { h: 210,  light: 62, sat: 32, neutral: true,  warm: false, name: 'جین روشن',        hex: '#8AA3C4' },
    blue:       { h: 215,  light: 48, sat: 66, neutral: false, warm: false, name: 'آبی',             hex: '#2E6FD9' },
    royalblue:  { h: 225,  light: 42, sat: 78, neutral: false, warm: false, name: 'آبی روشن سلطنتی',  hex: '#2542BD' },
    cobalt:     { h: 220,  light: 45, sat: 82, neutral: false, warm: false, name: 'آبی کبالت',       hex: '#1F55D4' },
    petrol:     { h: 195,  light: 28, sat: 48, neutral: true,  warm: false, name: 'آبی نفتی',        hex: '#1F4A56' },
    teal:       { h: 185,  light: 32, sat: 52, neutral: true,  warm: false, name: 'آبی سبز',         hex: '#1F5E5E' },
    turquoise:  { h: 175,  light: 46, sat: 70, neutral: false, warm: false, name: 'فیروزه‌ای',        hex: '#2BB3AE' },
    aqua:       { h: 180,  light: 72, sat: 58, neutral: false, warm: false, name: 'آبی دریایی روشن', hex: '#8ED8D4' },
    skyblue:    { h: 200,  light: 72, sat: 62, neutral: false, warm: false, name: 'آبی آسمانی',      hex: '#7EC4E8' },
    powderblue: { h: 205,  light: 84, sat: 34, neutral: false, warm: false, name: 'آبی پودری',       hex: '#C4DCE8' },
    steelblue:  { h: 210,  light: 52, sat: 28, neutral: true,  warm: false, name: 'آبی فولادی',      hex: '#6E8299' },
    indigo:     { h: 245,  light: 30, sat: 56, neutral: false, warm: false, name: 'نیلی',            hex: '#2E2E7A' },

    /* ================= سبزها ================= */
    green:      { h: 130,  light: 42, sat: 48, neutral: false, warm: null,  name: 'سبز',             hex: '#3E8E5A' },
    emerald:    { h: 155,  light: 38, sat: 66, neutral: false, warm: false, name: 'سبز زمردی',       hex: '#1F8A5F' },
    forest:     { h: 140,  light: 24, sat: 48, neutral: true,  warm: false, name: 'سبز جنگلی',       hex: '#1F4A2E' },
    bottle:     { h: 160,  light: 22, sat: 52, neutral: true,  warm: false, name: 'سبز یشمی تیره',   hex: '#17442F' },
    sage:       { h: 100,  light: 66, sat: 18, neutral: true,  warm: true,  name: 'سبز مریم‌گلی',     hex: '#A8B295' },
    moss:       { h: 90,   light: 40, sat: 30, neutral: true,  warm: true,  name: 'سبز خزه‌ای',       hex: '#5E6B3D' },
    mint:       { h: 150,  light: 82, sat: 40, neutral: false, warm: false, name: 'سبز نعنایی',      hex: '#A8DCC0' },
    pistachio:  { h: 85,   light: 70, sat: 42, neutral: false, warm: true,  name: 'سبز پسته‌ای',      hex: '#B5CC7E' },
    lime:       { h: 78,   light: 62, sat: 70, neutral: false, warm: true,  name: 'سبز لیمویی',      hex: '#A8CC33' },

    /* ================= قرمزها و صورتی‌ها ================= */
    red:        { h: 0,    light: 46, sat: 64, neutral: false, warm: true,  name: 'قرمز',            hex: '#C43B34' },
    scarlet:    { h: 8,    light: 48, sat: 78, neutral: false, warm: true,  name: 'قرمز آتشین',      hex: '#DE3A20' },
    cherry:     { h: 350,  light: 40, sat: 68, neutral: false, warm: false, name: 'قرمز گیلاسی',     hex: '#C22348' },
    maroon:     { h: 345,  light: 26, sat: 58, neutral: true,  warm: false, name: 'زرشکی',           hex: '#7B1F2B' },
    burgundy:   { h: 340,  light: 22, sat: 52, neutral: true,  warm: false, name: 'شرابی',           hex: '#5E1A2B' },
    wine:       { h: 335,  light: 25, sat: 44, neutral: true,  warm: false, name: 'یاقوتی تیره',     hex: '#63263C' },
    brick:      { h: 14,   light: 40, sat: 50, neutral: true,  warm: true,  name: 'آجری',            hex: '#9C4A32' },
    rust:       { h: 20,   light: 42, sat: 58, neutral: true,  warm: true,  name: 'زنگاری',          hex: '#A85B26' },
    terracotta: { h: 16,   light: 52, sat: 48, neutral: true,  warm: true,  name: 'گلی',             hex: '#C1704F' },
    coral:      { h: 12,   light: 66, sat: 70, neutral: false, warm: true,  name: 'مرجانی',          hex: '#F08A70' },
    salmon:     { h: 15,   light: 72, sat: 58, neutral: false, warm: true,  name: 'ماهی‌سالمونی',     hex: '#F2A38C' },
    peach:      { h: 25,   light: 80, sat: 56, neutral: false, warm: true,  name: 'هلویی',           hex: '#F7C4A0' },
    pink:       { h: 340,  light: 74, sat: 62, neutral: false, warm: false, name: 'صورتی',           hex: '#EE9AB5' },
    babypink:   { h: 350,  light: 88, sat: 44, neutral: false, warm: true,  name: 'صورتی ملایم',     hex: '#F7D4DA' },
    fuchsia:    { h: 320,  light: 52, sat: 82, neutral: false, warm: false, name: 'سرخابی',          hex: '#D6249B' },
    magenta:    { h: 328,  light: 48, sat: 76, neutral: false, warm: false, name: 'ارغوانی روشن',    hex: '#C42A7A' },
    dustyrose:  { h: 350,  light: 62, sat: 26, neutral: true,  warm: true,  name: 'صورتی خاکی',      hex: '#B58A8A' },
    blush:      { h: 10,   light: 84, sat: 32, neutral: true,  warm: true,  name: 'صورتی پودری',     hex: '#E8CBBF' },
    nude:       { h: 28,   light: 78, sat: 30, neutral: true,  warm: true,  name: 'بدنی',            hex: '#DEBFA3' },

    /* ================= نارنجی و زرد ================= */
    orange:     { h: 28,   light: 56, sat: 76, neutral: false, warm: true,  name: 'نارنجی',          hex: '#E8842B' },
    tangerine:  { h: 22,   light: 58, sat: 84, neutral: false, warm: true,  name: 'نارنجی پررنگ',    hex: '#F2701C' },
    apricot:    { h: 32,   light: 74, sat: 62, neutral: false, warm: true,  name: 'زردآلویی',        hex: '#F5B678' },
    amber:      { h: 40,   light: 56, sat: 74, neutral: false, warm: true,  name: 'کهربایی',         hex: '#D99420' },
    mustard:    { h: 45,   light: 50, sat: 66, neutral: true,  warm: true,  name: 'خردلی',           hex: '#C9A227' },
    yellow:     { h: 48,   light: 68, sat: 82, neutral: false, warm: true,  name: 'زرد',             hex: '#F0C948' },
    lemon:      { h: 55,   light: 80, sat: 76, neutral: false, warm: false, name: 'زرد لیمویی',      hex: '#F2E063' },
    butter:     { h: 50,   light: 88, sat: 46, neutral: false, warm: true,  name: 'زرد کره‌ای',       hex: '#F7E8BC' },

    /* ================= بنفش‌ها ================= */
    purple:     { h: 280,  light: 42, sat: 52, neutral: false, warm: false, name: 'بنفش',            hex: '#7A4B9E' },
    violet:     { h: 270,  light: 48, sat: 62, neutral: false, warm: false, name: 'بنفش روشن',       hex: '#7B4BD4' },
    plum:       { h: 300,  light: 32, sat: 40, neutral: true,  warm: false, name: 'آلویی',           hex: '#5E3355' },
    eggplant:   { h: 290,  light: 22, sat: 38, neutral: true,  warm: false, name: 'بادمجانی',        hex: '#3D2140' },
    lilac:      { h: 275,  light: 80, sat: 40, neutral: false, warm: false, name: 'یاسی',            hex: '#C6ADD9' },
    lavender:   { h: 260,  light: 84, sat: 34, neutral: false, warm: false, name: 'اسطوخودوسی',      hex: '#CFC4E8' },
    mauve:      { h: 300,  light: 62, sat: 20, neutral: true,  warm: false, name: 'ارغوانی خاکی',    hex: '#A38FA0' },

    /* ================= فلزی‌ها ================= */
    gold:       { h: 45,   light: 60, sat: 52, neutral: true,  warm: true,  name: 'طلایی',   metal: 'warm', hex: '#C9A84C' },
    silver:     { h: null, light: 76, sat: 0,  neutral: true,  warm: false, name: 'نقره‌ای', metal: 'cool', hex: '#C0C0C0' },
    rosegold:   { h: 15,   light: 70, sat: 34, neutral: true,  warm: true,  name: 'رز طلایی', metal: 'warm', hex: '#D8A0A0' },
    bronze:     { h: 30,   light: 45, sat: 46, neutral: true,  warm: true,  name: 'برنز',    metal: 'warm', hex: '#A5722F' },
    copper:     { h: 20,   light: 50, sat: 56, neutral: true,  warm: true,  name: 'مسی',     metal: 'warm', hex: '#B5642E' },
    gunmetal:   { h: 210,  light: 32, sat: 8,  neutral: true,  warm: false, name: 'فلزی تیره', metal: 'cool', hex: '#4A4F55' },
    pewter:     { h: 220,  light: 55, sat: 6,  neutral: true,  warm: false, name: 'قلعی',    metal: 'cool', hex: '#8A8F96' },
    champagne:  { h: 42,   light: 82, sat: 28, neutral: true,  warm: true,  name: 'شامپاینی', metal: 'warm', hex: '#E3D2B0' },

    /* ================= رنگ‌های پرکاربرد بازار ایران ================= */
    saffron:    { h: 38,   light: 58, sat: 80, neutral: false, warm: true,  name: 'زعفرانی',        hex: '#E8991C' },
    turmeric:   { h: 42,   light: 52, sat: 72, neutral: false, warm: true,  name: 'زردچوبه‌ای',      hex: '#CC9412' },
    pomegranate:{ h: 355,  light: 36, sat: 66, neutral: false, warm: true,  name: 'اناری',          hex: '#9E1F35' },
    persianblue:{ h: 228,  light: 38, sat: 72, neutral: false, warm: false, name: 'آبی ایرانی',     hex: '#1F3FA8' },
    persiangreen:{h: 168,  light: 34, sat: 62, neutral: false, warm: false, name: 'سبز ایرانی',     hex: '#218573' },
    tealgreen:  { h: 172,  light: 40, sat: 44, neutral: true,  warm: false, name: 'سبز آبی روشن',   hex: '#3D8F84' },
    seafoam:    { h: 160,  light: 78, sat: 32, neutral: false, warm: false, name: 'سبز دریایی',     hex: '#B0DCCC' },
    celadon:    { h: 120,  light: 76, sat: 22, neutral: true,  warm: false, name: 'سبز کم‌رنگ',      hex: '#BCCFBC' },
    hunter:     { h: 148,  light: 28, sat: 40, neutral: true,  warm: false, name: 'سبز شکاری',      hex: '#2B4F38' },
    avocado:    { h: 82,   light: 48, sat: 34, neutral: true,  warm: true,  name: 'سبز آوکادو',     hex: '#6E7A45' },
    ochre:      { h: 36,   light: 46, sat: 58, neutral: true,  warm: true,  name: 'اخرایی',         hex: '#B57A1E' },
    sienna:     { h: 18,   light: 38, sat: 52, neutral: true,  warm: true,  name: 'خرمایی',         hex: '#94502C' },
    mahogany:   { h: 10,   light: 30, sat: 46, neutral: true,  warm: true,  name: 'ماهاگونی',       hex: '#703326' },
    oxblood:    { h: 358,  light: 20, sat: 50, neutral: true,  warm: true,  name: 'قرمز تیره',      hex: '#4D1A1A' },
    raspberry:  { h: 338,  light: 44, sat: 66, neutral: false, warm: false, name: 'تمشکی',          hex: '#B32654' },
    rose:       { h: 345,  light: 58, sat: 52, neutral: false, warm: false, name: 'رز',             hex: '#C4657F' },
    orchid:     { h: 305,  light: 62, sat: 48, neutral: false, warm: false, name: 'ارکیده‌ای',       hex: '#B074B8' },
    periwinkle: { h: 250,  light: 74, sat: 46, neutral: false, warm: false, name: 'بنفش آبی روشن',  hex: '#A8AEE8' },
    slate:      { h: 215,  light: 42, sat: 14, neutral: true,  warm: false, name: 'آبی خاکستری',    hex: '#5E6B7A' },
    icegray:    { h: 200,  light: 86, sat: 6,  neutral: true,  warm: false, name: 'خاکستری یخی',    hex: '#D6DCDF' },
    linenwhite: { h: 42,   light: 90, sat: 12, neutral: true,  warm: true,  name: 'سفید کتانی',     hex: '#EDE6DA' },
    mushroom:   { h: 30,   light: 64, sat: 12, neutral: true,  warm: true,  name: 'قارچی',          hex: '#AAA096' },
    cinnamon:   { h: 24,   light: 42, sat: 48, neutral: true,  warm: true,  name: 'دارچینی',        hex: '#9E5B2E' },
    honey:      { h: 38,   light: 64, sat: 62, neutral: false, warm: true,  name: 'عسلی',           hex: '#D9A03D' },
    wheat:      { h: 42,   light: 80, sat: 34, neutral: true,  warm: true,  name: 'گندمی',          hex: '#DDCBA4' },
  };

  /* نام‌های جایگزین — فروشنده هر جور بنویسد، شناخته شود */
  var ALIAS = {
    'سرمه ای': 'navy', 'سورمه‌ای': 'navy', 'سورمه ای': 'navy',
    'آبی نفتی': 'petrol', 'ابی نفتی': 'petrol', 'نفتی': 'petrol',
    'آبی کاربنی': 'midnight', 'کاربنی': 'charcoal',
    'یشمی': 'bottle', 'زمردی': 'emerald', 'خزه‌ای': 'moss', 'خزه ای': 'moss',
    'شرابی': 'burgundy', 'جگری': 'maroon', 'آلبالویی': 'cherry',
    'کالباسی': 'salmon', 'گوشتی': 'nude', 'صورتی چرک': 'dustyrose',
    'سرخابی': 'fuchsia', 'ارغوانی': 'magenta', 'بادمجونی': 'eggplant',
    'استخوانی': 'ivory', 'شیری': 'offwhite', 'موشی': 'gray',
    'دودی': 'charcoal', 'ذغالی': 'charcoal', 'زغالی': 'charcoal',
    'نسکافه‌ای': 'caramel', 'نسکافه ای': 'caramel', 'قهوه ای': 'brown',
    'عسلی': 'amber', 'طلائی': 'gold', 'نقره ای': 'silver',
    'فیروزه ای': 'turquoise', 'آبی روشن': 'skyblue', 'ابی': 'blue',
    'سبز ارتشی': 'darkolive', 'ارتشی': 'darkolive', 'کرمی': 'cream',
  };

  /* ============================================================
     ۲. طرح پارچه — دانشنامه‌ی کامل
     ------------------------------------------------------------
     هر طرح سه ویژگی دارد که در ست کردن تعیین‌کننده است:

       scale   مقیاس ۱ تا ۵ — طرح ریز یا درشت
       busy    شلوغی ۰ تا ۳ — چقدر توجه می‌کشد
       family  خانواده — دو طرح از یک خانواده با هم نمی‌روند

     قاعده‌ی طلایی ترکیب طرح (که استایلیست‌ها واقعاً به کار
     می‌برند): **دو طرح وقتی با هم می‌روند که مقیاسشان فرق
     داشته باشد.** راه‌راه ریز با گل درشت، بله. راه‌راه ریز
     با چهارخانه‌ی ریز، نه — چشم گیج می‌شود.
     ============================================================ */
  var PATTERN = {
    plain:      { scale: 0, busy: 0, family: 'none',     name: 'ساده' },
    none:       { scale: 0, busy: 0, family: 'none',     name: 'ساده' },
    textured:   { scale: 1, busy: 0, family: 'texture',  name: 'بافت‌دار' },
    ribbed:     { scale: 1, busy: 0, family: 'texture',  name: 'کبریتی' },
    melange:    { scale: 1, busy: 0, family: 'texture',  name: 'ملانژ' },
    quilted:    { scale: 3, busy: 1, family: 'texture',  name: 'لحافی' },
    embossed:   { scale: 2, busy: 1, family: 'texture',  name: 'برجسته' },

    pinstripe:  { scale: 1, busy: 1, family: 'stripe',   name: 'راه‌راه بسیار ریز' },
    stripe:     { scale: 2, busy: 1, family: 'stripe',   name: 'راه‌راه' },
    widestripe: { scale: 4, busy: 2, family: 'stripe',   name: 'راه‌راه درشت' },
    breton:     { scale: 3, busy: 1, family: 'stripe',   name: 'راه‌راه ملوانی' },
    vstripe:    { scale: 2, busy: 1, family: 'stripe',   name: 'راه‌راه عمودی' },
    hstripe:    { scale: 2, busy: 2, family: 'stripe',   name: 'راه‌راه افقی' },

    check:      { scale: 3, busy: 2, family: 'check',    name: 'چهارخانه' },
    gingham:    { scale: 2, busy: 1, family: 'check',    name: 'چهارخانه ریز' },
    tartan:     { scale: 4, busy: 3, family: 'check',    name: 'چهارخانه اسکاتلندی' },
    houndstooth:{ scale: 2, busy: 2, family: 'check',    name: 'دندان‌سگی' },
    windowpane: { scale: 4, busy: 1, family: 'check',    name: 'قاب‌پنجره‌ای' },
    argyle:     { scale: 3, busy: 2, family: 'check',    name: 'لوزی' },

    dots:       { scale: 2, busy: 1, family: 'dot',      name: 'خال‌خالی' },
    polkadot:   { scale: 3, busy: 2, family: 'dot',      name: 'خال درشت' },
    pindot:     { scale: 1, busy: 0, family: 'dot',      name: 'خال ریز' },

    floral:     { scale: 3, busy: 2, family: 'organic',  name: 'گل‌دار' },
    ditsy:      { scale: 1, busy: 1, family: 'organic',  name: 'گل ریز' },
    tropical:   { scale: 4, busy: 3, family: 'organic',  name: 'برگ استوایی' },
    paisley:    { scale: 3, busy: 3, family: 'organic',  name: 'بته‌جقه' },
    botanical:  { scale: 3, busy: 2, family: 'organic',  name: 'برگ و شاخه' },

    leopard:    { scale: 3, busy: 3, family: 'animal',   name: 'پلنگی' },
    zebra:      { scale: 3, busy: 3, family: 'animal',   name: 'گورخری' },
    snake:      { scale: 2, busy: 3, family: 'animal',   name: 'پوست ماری' },
    cowprint:   { scale: 4, busy: 3, family: 'animal',   name: 'گاوی' },

    geometric:  { scale: 3, busy: 2, family: 'geo',      name: 'هندسی' },
    chevron:    { scale: 3, busy: 2, family: 'geo',      name: 'زیگزاگ' },
    abstract:   { scale: 4, busy: 3, family: 'geo',      name: 'انتزاعی' },
    tiedye:     { scale: 5, busy: 3, family: 'geo',      name: 'تای‌دای' },
    camo:       { scale: 3, busy: 2, family: 'geo',      name: 'ارتشی' },

    ethnic:     { scale: 3, busy: 3, family: 'craft',    name: 'سنتی' },
    kilim:      { scale: 3, busy: 3, family: 'craft',    name: 'گلیمی' },
    termeh:     { scale: 3, busy: 3, family: 'craft',    name: 'ترمه' },
    embroidered:{ scale: 2, busy: 2, family: 'craft',    name: 'گلدوزی' },
    lace:       { scale: 2, busy: 2, family: 'craft',    name: 'توری' },
    sequin:     { scale: 2, busy: 3, family: 'shine',    name: 'پولکی' },
    metallic:   { scale: 1, busy: 2, family: 'shine',    name: 'براق فلزی' },

    logo:       { scale: 3, busy: 2, family: 'print',    name: 'لوگودار' },
    graphic:    { scale: 4, busy: 3, family: 'print',    name: 'طرح چاپی' },
    text:       { scale: 3, busy: 2, family: 'print',    name: 'نوشته‌دار' },

    colorblock: { scale: 5, busy: 2, family: 'block',    name: 'بلوک رنگی' },
    ombre:      { scale: 5, busy: 1, family: 'block',    name: 'طیف رنگی' },
    gradient:   { scale: 5, busy: 1, family: 'block',    name: 'طیف نرم' },
    half:       { scale: 5, busy: 2, family: 'block',    name: 'دورنگ نصف' },
    multi:      { scale: 4, busy: 3, family: 'block',    name: 'چندرنگ' },
    patchwork:  { scale: 4, busy: 3, family: 'block',    name: 'تکه‌دوزی' },
  };

  /* کلیدهای قدیمی فرم فروشنده — تا داده‌ی موجود نشکند.
     فرم `striped` می‌فرستاد ولی دانشنامه `stripe` می‌شناسد؛
     بدون این نگاشت، هر پارچه‌ی راه‌راهی «ساده» شمرده می‌شد. */
  var PATTERN_ALIAS = {
    striped: 'stripe', checked: 'check', printed: 'graphic',
    dotted: 'dots', animal: 'leopard', 'tie-dye': 'tiedye',
    'راه‌راه': 'stripe', 'راه راه': 'stripe', 'چهارخانه': 'check',
    'گل‌دار': 'floral', 'گل دار': 'floral', 'ساده': 'plain',
    'خال‌خالی': 'dots', 'خال خالی': 'dots', 'پلنگی': 'leopard',
    'گلدوزی': 'embroidered', 'دانتل': 'lace', 'توری': 'lace',
    'پولک‌دوزی': 'sequin', 'پولکی': 'sequin', 'چندرنگ': 'multi',
    'بته‌جقه': 'paisley', 'ترمه': 'termeh', 'هندسی': 'geometric',
  };

  function patternOf(key) {
    var raw = String(key || 'plain').trim();
    var k = raw.toLowerCase();
    if (PATTERN[k]) return PATTERN[k];
    if (PATTERN_ALIAS[k]) return PATTERN[PATTERN_ALIAS[k]];
    if (PATTERN_ALIAS[raw]) return PATTERN[PATTERN_ALIAS[raw]];
    return PATTERN.plain;
  }

  /* ============================================================
     ۳. امتیاز ترکیب دو طرح
     ------------------------------------------------------------
     قاعده‌های واقعی:
       · ساده + هر طرحی            → همیشه امن
       · دو طرح هم‌خانواده هم‌مقیاس → بد، چشم گیج می‌شود
       · دو طرح با مقیاس متفاوت     → حرفه‌ای، اگر شلوغی کم باشد
       · دو طرح خیلی شلوغ           → هرگز
       · بافت (نه طرح) با هر چیزی   → امن
     ============================================================ */
  function patternPairScore(a, b) {
    var A = patternOf(a), B = patternOf(b);

    /* هر دو ساده — آرام و امن، ولی کمی تخت */
    if (A.busy === 0 && B.busy === 0) {
      /* بافت‌دار با ساده جالب‌تر از ساده با ساده است */
      if (A.family === 'texture' || B.family === 'texture') return 88;
      return 80;
    }

    /* یکی ساده، یکی طرح‌دار — بهترین حالت */
    if (A.busy === 0 || B.busy === 0) {
      var busy = A.busy === 0 ? B : A;
      /* طرح خیلی شلوغ هم با ساده خوب است، حتی بهتر */
      return busy.busy >= 3 ? 97 : 94;
    }

    /* ---------- هر دو طرح‌دار ---------- */
    var loud = A.busy + B.busy;
    var top = Math.max(A.busy, B.busy);

    /* دو طرح فریادزن — قاعده‌ی «یک کانون» می‌شکند */
    if (loud >= 6) return 14;
    if (loud >= 5) return 26;

    /* ⚠️ نکته‌ای که فقط جمع نشان نمی‌داد:
       یک طرح با شلوغی ۳ (چهارخانه‌ی اسکاتلندی، پلنگی،
       بته‌جقه) خودش به‌تنهایی کانون تیپ است. کنارش هر طرح
       دیگری، حتی ریز، تیپ را به‌هم می‌ریزد. جمع ۱+۳ برابر
       ۴ است و از فیلترهای بالا رد می‌شد. */
    if (top >= 3) return Math.abs(A.scale - B.scale) >= 3 ? 44 : 30;

    var dScale = Math.abs(A.scale - B.scale);

    /* هم‌خانواده */
    if (A.family === B.family) {
      /* راه‌راه ریز با راه‌راه درشت: یک ترفند شناخته‌شده */
      if (dScale >= 2) return 74;
      return 30;
    }

    /* ---------- خانواده‌های متفاوت ----------
       اینجا مقیاس حرف اول را می‌زند. اما یک استثنای مهم
       هست که استایلیست‌ها می‌شناسند: **راه‌راه با گل**.
       راه‌راه چون خطوطش منظم و جهت‌دار است، مثل یک زمینه‌ی
       خنثی عمل می‌کند و زیر طرح‌های ارگانیک می‌نشیند.
       همین ترکیب سال‌هاست روی باند مد دیده می‌شود. */
    var organicMix =
         (A.family === 'stripe' && B.family === 'organic')
      || (B.family === 'stripe' && A.family === 'organic');

    if (dScale >= 2) return organicMix ? 84 : 78;
    if (dScale === 1) return organicMix ? 72 : 56;
    return organicMix ? 62 : 34;   /* هم‌مقیاس، هر دو شلوغ */
  }

  /* ============================================================
     ۴. رنگ‌های یک کالا — پشتیبانی از پارچه‌ی چندرنگ
     ------------------------------------------------------------
     یک پیراهن راه‌راه سفید-سرمه‌ای، دو رنگ دارد. سیستم قبلی
     فقط اولی را می‌دید و ست‌های اشتباه می‌ساخت.

     خروجی: آرایه‌ای از کلیدهای رنگ، از مهم به کم‌اهمیت.
     ============================================================ */
  function colorsOf(p) {
    var out = [];
    var seen = {};

    function push(v) {
      var k = resolve(v);
      if (k && !seen[k]) { seen[k] = 1; out.push(k); }
    }

    if (p.color) push(p.color);
    if (Array.isArray(p.colors)) p.colors.forEach(push);
    if (p.color2) push(p.color2);

    return out;
  }

  /** یک نام یا کد رنگ را به کلید استاندارد تبدیل می‌کند */
  function resolve(v) {
    if (!v) return '';
    var s = String(v).trim();

    if (HUE[s]) return s;

    var low = s.toLowerCase();
    if (HUE[low]) return low;

    /* نام فارسی مستقیم */
    var found = '';
    Object.keys(HUE).forEach(function (k) {
      if (!found && HUE[k].name === s) found = k;
    });
    if (found) return found;

    /* نام‌های جایگزین */
    if (ALIAS[s]) return ALIAS[s];

    /* کد رنگ */
    if (/^#?[0-9a-fA-F]{6}$/.test(s)) return nearest(s);

    /* رنگ سفارشی فروشنده */
    if (window.DPColors) {
      try {
        var c = DPColors.find(s);
        if (c) {
          /* رنگ ترکیبی سفارشی: رنگ اولش را می‌گیریم */
          if (c.hex) return nearest(c.hex);
        }
      } catch (e) { /* بی‌اهمیت */ }
    }

    /* جست‌وجوی واژه‌ای — «آبی نفتی روشن» → نفتی */
    var best = '';
    Object.keys(ALIAS).forEach(function (a) {
      if (s.indexOf(a) > -1 && a.length > best.length) best = a;
    });
    if (best) return ALIAS[best];

    Object.keys(HUE).forEach(function (k) {
      if (!found && HUE[k].name && s.indexOf(HUE[k].name) > -1) found = k;
    });
    return found;
  }

  /** نزدیک‌ترین رنگ فهرست به یک کد رنگ */
  function nearest(hex) {
    var m = String(hex).replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(m)) return '';

    var r = parseInt(m.slice(0, 2), 16);
    var g = parseInt(m.slice(2, 4), 16);
    var b = parseInt(m.slice(4, 6), 16);

    var best = '', bestD = Infinity;
    Object.keys(HUE).forEach(function (k) {
      var h = HUE[k].hex;
      if (!h) return;
      var q = h.replace('#', '');
      var dr = r - parseInt(q.slice(0, 2), 16);
      var dg = g - parseInt(q.slice(2, 4), 16);
      var db = b - parseInt(q.slice(4, 6), 16);
      /* وزن‌دهی چشم انسان: سبز را بیشتر می‌بیند */
      var d = dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11;
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }

  /* ============================================================
     ۵. امتیاز هماهنگی دو رنگ — نسخه‌ی گسترده
     ------------------------------------------------------------
     نسبت به نسخه‌ی قبلی سه چیز اضافه شده:
       · زیرلحن گرم/سرد
       · اشباع (دو رنگ خیلی تند با هم نمی‌روند)
       · قاعده‌ی فلز (طلایی با نقره‌ای قاطی نشود)
     ============================================================ */
  function pairScore(a, b) {
    var A = HUE[a], B = HUE[b];
    if (!A || !B) return 50;

    /* ---------- قاعده‌ی فلز ---------- */
    if (A.metal && B.metal) {
      return A.metal === B.metal ? 90 : 38;   /* طلا با نقره: نه */
    }

    /* ---------- هر دو خنثی ---------- */
    if (A.neutral && B.neutral) {
      var gap = Math.abs(A.light - B.light);

      /* زیرلحن ناسازگار — بژ گرم با طوسی سرد کدر می‌شود */
      var clash = (A.warm === true && B.warm === false)
               || (A.warm === false && B.warm === true);

      /* هم‌روشنایی — دو تیره یا دو روشن کنار هم، تیپ تخت
         و کدر می‌شود. «مشکی با ذغالی» نمونه‌ی کلاسیکش است:
         نه کنتراست دارد نه هم‌رنگ است، فقط کثیف به نظر می‌رسد. */
      if (gap < 10) return clash ? 46 : 58;
      if (gap < 24) return clash ? 58 : 68;

      /* کنتراست قوی — اینجا اختلاف روشنایی آن‌قدر زیاد است
         که ناسازگاری زیرلحن دیگر دیده نمی‌شود. «کرم با سبز
         جنگلی» یا «سفید با سرمه‌ای» از همین دسته‌اند. */
      if (gap > 55) return clash ? 91 : 96;
      return clash ? 74 : 90;
    }

    /* ---------- یکی خنثی ---------- */
    if (A.neutral || B.neutral) {
      var col = A.neutral ? B : A;
      var neu = A.neutral ? A : B;
      var dl = Math.abs(col.light - neu.light);

      var s = dl > 25 ? 95 : 84;

      /* رنگ خیلی تند روی خنثای روشن، کمی خام است */
      if (col.sat > 74 && neu.light > 88) s -= 6;

      /* زیرلحن هماهنگ، امتیاز اضافه */
      if (neu.warm != null && col.warm != null && neu.warm === col.warm) s += 3;

      return Math.min(100, s);
    }

    /* ---------- هر دو رنگی ---------- */
    if (A.h == null || B.h == null) return 60;

    var d = Math.abs(A.h - B.h);
    if (d > 180) d = 360 - d;

    var dLight = Math.abs(A.light - B.light);
    var dSat = Math.abs(A.sat - B.sat);
    var bothLoud = A.sat > 68 && B.sat > 68;

    var score;

    /* تک‌رنگ — همان خانواده با شدت متفاوت */
    if (d <= 15) {
      score = dLight > 22 ? 90 : 66;
    }
    /* همسایه روی چرخه */
    else if (d <= 45) {
      if (dLight > 28) score = 87;
      else if (dLight > 14) score = 71;
      else score = 44;
    }
    /* سه‌گانه‌ی نرم */
    else if (d <= 75) score = 60;
    /* منطقه‌ی خطر */
    else if (d <= 110) score = 36;
    /* سه‌گانه */
    else if (d <= 145) score = 66;
    /* مکمل — روبه‌روی هم */
    else score = 82;

    /* ---------- دو رنگ هر دو پرشدت ----------
       «قرمز آتشین با آبی کبالت» در یک روشنایی، چشم را
       می‌زند چون هیچ‌کدام غالب نیست و مغز نمی‌داند کجا را
       نگاه کند. تنها راه نجاتش این است که یکی روشن‌تر باشد. */
    if (bothLoud) {
      if (dLight < 12) score -= 26;
      else if (dLight < 22) score -= 16;
      else score -= 6;
    }

    /* یکی تند یکی ملایم — نسبت درست، امتیاز اضافه */
    if (dSat > 34) score += 6;

    /* زیرلحن یکسان، هماهنگی بیشتر */
    if (A.warm != null && B.warm != null) {
      if (A.warm === B.warm) score += 4;
      else score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /* ============================================================
     ۶. امتیاز دو کالا با در نظر گرفتن همه‌ی رنگ‌هایشان
     ------------------------------------------------------------
     پارچه‌ی چندرنگ: کافی است **یکی** از رنگ‌هایش با کالای
     مقابل بخواند. این همان کاری است که استایلیست می‌کند —
     یک رنگ از داخل طرح را بیرون می‌کشد و تکرارش می‌کند.
     ============================================================ */
  function garmentColorScore(pA, pB) {
    var ca = colorsOf(pA);
    var cb = colorsOf(pB);

    if (!ca.length || !cb.length) return { score: 50, a: '', b: '', echo: false };

    var best = -1, bi = '', bj = '';
    for (var i = 0; i < ca.length; i++) {
      for (var j = 0; j < cb.length; j++) {
        var s = pairScore(ca[i], cb[j]);

        /* «تکرار رنگ» — اگر رنگ دوم یک پارچه‌ی چندرنگ دقیقاً
           رنگ کالای مقابل باشد، این بهترین حالت ممکن است.
           استایلیست‌ها به این می‌گویند color echo. */
        if (ca[i] === cb[j] && (ca.length > 1 || cb.length > 1)) s = 98;

        if (s > best) { best = s; bi = ca[i]; bj = cb[j]; }
      }
    }

    /* جریمه‌ی شلوغی: اگر هر دو کالا چندرنگ‌اند، مجموع رنگ‌ها
       زیاد می‌شود و تیپ به‌هم‌ریخته می‌شود */
    var total = ca.length + cb.length;
    if (total >= 5) best -= 14;
    else if (total === 4) best -= 6;

    return {
      score: Math.max(0, Math.min(100, best)),
      a: bi, b: bj,
      echo: bi === bj,
    };
  }

  /* ============================================================
     ۷. تحلیل رنگ فصلی
     ------------------------------------------------------------
     سیستمی که در صنعت مد و آرایش سال‌هاست به کار می‌رود:
     هر رنگ به یکی از چهار فصل تعلق دارد، بر پایه‌ی
     زیرلحن (گرم/سرد) و شدت (روشن/عمیق).
     ============================================================ */
  function seasonOf(key) {
    var C = HUE[key];
    if (!C) return null;
    if (C.h == null && C.sat === 0) return null;   /* بی‌رنگ‌ها همه‌فصل */

    var warm = C.warm === true;
    var light = C.light > 60;

    if (warm && light)  return { key: 'spring', name: 'بهاره', hint: 'گرم و روشن' };
    if (warm && !light) return { key: 'autumn', name: 'پاییزه', hint: 'گرم و عمیق' };
    if (!warm && light) return { key: 'summer', name: 'تابستانه', hint: 'سرد و ملایم' };
    return { key: 'winter', name: 'زمستانه', hint: 'سرد و پرکنتراست' };
  }

  /* ============================================================
     ۸. نام و توضیح رنگ برای نمایش
     ============================================================ */
  function describe(key) {
    var C = HUE[key];
    if (!C) return null;

    var bits = [];
    if (C.neutral) bits.push('خنثی');
    if (C.warm === true) bits.push('زیرلحن گرم');
    else if (C.warm === false) bits.push('زیرلحن سرد');
    if (C.sat > 70) bits.push('پرشدت');
    else if (C.sat > 0 && C.sat < 25) bits.push('ملایم');
    if (C.light > 82) bits.push('روشن');
    else if (C.light < 25) bits.push('عمیق');
    if (C.metal) bits.push('فلزی');

    var s = seasonOf(key);

    return {
      key: key,
      name: C.name,
      hex: C.hex,
      traits: bits,
      season: s,
      neutral: !!C.neutral,
      /* رنگ خنثی با هر چیزی می‌رود؛ رنگ تند فقط با چند تا */
      versatile: !!C.neutral || C.sat < 40,
    };
  }

  /* ============================================================
     ۹. بهترین همراهان یک رنگ
     ------------------------------------------------------------
     برای نمایش «این رنگ با چه رنگ‌هایی می‌رود؟»
     ============================================================ */
  function companions(key, n) {
    var out = [];
    Object.keys(HUE).forEach(function (k) {
      if (k === key) return;
      out.push({ key: k, name: HUE[k].name, hex: HUE[k].hex, score: pairScore(key, k) });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, n || 6);
  }

  window.DPPalette = {
    HUE: HUE,
    ALIAS: ALIAS,
    PATTERN: PATTERN,
    PATTERN_ALIAS: PATTERN_ALIAS,
    patternOf: patternOf,
    patternPairScore: patternPairScore,
    colorsOf: colorsOf,
    resolve: resolve,
    nearest: nearest,
    pairScore: pairScore,
    garmentColorScore: garmentColorScore,
    seasonOf: seasonOf,
    describe: describe,
    companions: companions,
  };
})();
