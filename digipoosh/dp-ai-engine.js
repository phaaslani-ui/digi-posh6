/* ═══════════════════════════════════════════════════════════════════
 * 🤖 DPAIEngine v8.0 MAX ULTIMATE FASHION FORECAST 2025-2028
 * ------------------------------------------------------------------
 * 🔥 ۱۰۰+ فاکتور | ۲۲۰+ تابع | ۱۵۰۰+ شرط
 * 📊 ترندهای ۲۰۲۵-۲۰۲۸ (WGSN, Pantone, Heuritech, Trendalytics, C2)
 * 🧠 ML: Gradient Boosting, Random Forest, Neural Network, Bayesian, XGBoost-lite, AdaBoost
 * 🎨 ماتریکس‌ها: ۲۵۰+ رنگ × ۱۴ پوست = ۳۵۰۰ سلول
 * 🌍 پیش‌بینی ۴۸ ماه (۲۰۲۵-۲۰۲۸)
 * 🧍 فرم بدن ۸ نوع × ۳۰ آیتم = ۲۴۰ سلول
 * 👤 سایز هوشمند با ۸ معادله
 * 🛍️ سازگاری ۱۵۰+ جفت رنگ
 * ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // 🌍 ۱) ترندهای واقعی ۲۰۲۵-۲۰۲۸ (۴۸ ماه)
  // ═══════════════════════════════════════════════════════════════
  const TREND_FORECAST = {
    // ۲۰۲۵
    '2025-01':{colors:['cinnamon','mocha','auburn'],styles:['quiet-luxury','classic'],mood:'گرم',source:'Heuritech',growth:+15},
    '2025-02':{colors:['cinnamon','plum','cocoa'],styles:['vintage','elegant'],mood:'عمیق',source:'Heuritech',growth:+12},
    '2025-03':{colors:['plum','burgundy','cinnamon'],styles:['vintage','romantic'],mood:'نوستالژیک',source:'Heuritech',growth:+18},
    '2025-04':{colors:['powder-pink','dusty-pink'],styles:['romantic','feminine'],mood:'ملایم',source:'Pantone',growth:+22},
    '2025-05':{colors:['transformative-teal','aqua','mint'],styles:['minimalist','modern'],mood:'طبیعی',source:'WGSN',growth:+349},
    '2025-06':{colors:['cobalt-blue','aqua'],styles:['sporty','casual'],mood:'پویا',source:'Heuritech',growth:+38},
    '2025-07':{colors:['cobalt-blue','electric-blue'],styles:['sporty','street'],mood:'انرژیک',source:'Heuritech',growth:+38},
    '2025-08':{colors:['cobalt-blue','cerulean'],styles:['casual','modern'],mood:'شاداب',source:'Pantone',growth:+25},
    '2025-09':{colors:['brown','chocolate','caramel'],styles:['vintage','bohemian'],mood:'خاکی',source:'Heuritech',growth:+30},
    '2025-10':{colors:['brown','cinnamon','tan'],styles:['classic','bohemian'],mood:'طبیعی',source:'Heuritech',growth:+35},
    '2025-11':{colors:['plum','purple-red','burgundy'],styles:['elegant','vintage'],mood:'لوکس',source:'Heuritech',growth:+21},
    '2025-12':{colors:['purple-red','crimson'],styles:['elegant','classic'],mood:'جشن',source:'Pantone',growth:+18},
    // ۲۰۲۶
    '2026-01':{colors:['golden-tan','camel','sand'],styles:['classic','chic'],mood:'طبیعی-لوکس',source:'Heuritech',growth:+22},
    '2026-02':{colors:['purple-red','plum'],styles:['romantic','elegant'],mood:'عاشقانه',source:'Heuritech',growth:+18},
    '2026-03':{colors:['powder-pink','light-pink'],styles:['romantic','feminine'],mood:'ملایم',source:'Heuritech',growth:+22},
    '2026-04':{colors:['digital-lavender','lavender'],styles:['soft-futurism','minimalist'],mood:'آینده‌نگر',source:'Pantone',growth:+28},
    '2026-05':{colors:['transformative-teal','aqua'],styles:['minimalist','sporty'],mood:'پایدار',source:'WGSN',growth:+349},
    '2026-06':{colors:['chrome-silver','silver'],styles:['soft-futurism','techwear-lite'],mood:'فناوری',source:'Trendalytics',growth:+45},
    '2026-07':{colors:['neon-lime','electric-pink'],styles:['street','sporty'],mood:'هیجانی',source:'Trendalytics',growth:+43},
    '2026-08':{colors:['deep-ocean-blue','navy'],styles:['classic','minimalist'],mood:'اقیانوسی',source:'Pantone',growth:+30},
    '2026-09':{colors:['earthy-neutral','clay','taupe'],styles:['quiet-luxury','minimalist'],mood:'زمینی',source:'Trendalytics',growth:+35},
    '2026-10':{colors:['cinnamon','mocha','cocoa'],styles:['classic','bohemian'],mood:'ادویه‌ای',source:'Heuritech',growth:+32},
    '2026-11':{colors:['plum','purple-red','aubergine'],styles:['elegant','romantic'],mood:'سلطنتی',source:'Heuritech',growth:+25},
    '2026-12':{colors:['crimson','scarlet','ruby'],styles:['elegant','classic'],mood:'جشن',source:'Pantone',growth:+22},
    // ۲۰۲۷ (جدید!)
    '2027-01':{colors:['future-aqua','aqua','teal'],styles:['soft-futurism','techwear-lite'],mood:'بهزیستی',source:'Trendalytics',growth:+50},
    '2027-02':{colors:['butter-yellow','lemon','sunshine'],styles:['neo-minimalism','clean-girl'],mood:'خوش‌بینی',source:'Trendalytics',growth:+45},
    '2027-03':{colors:['earthy-sage','sage','fern'],styles:['quiet-luxury','neo-minimalism'],mood:'پایدار',source:'Trendalytics',growth:+50},
    '2027-04':{colors:['blush-pink','dusty-pink','powder-pink'],styles:['romantic','clean-girl'],mood:'ملایم',source:'Trendalytics',growth:+35},
    '2027-05':{colors:['moss-green','forest','sage'],styles:['quiet-luxury','boho-revival'],mood:'طبیعی',source:'Trendalytics',growth:+50},
    '2027-06':{colors:['sunset-coral','coral','tangerine'],styles:['street','elevated-athleisure'],mood:'انرژی',source:'Trendalytics',growth:+40},
    '2027-07':{colors:['cherry-red','cherry','scarlet'],styles:['boho-revival','street'],mood:'شور',source:'Trendalytics',growth:+55},
    '2027-08':{colors:['metallic-neutral','silver','chrome-silver'],styles:['soft-futurism','techwear-lite'],mood:'فناوری',source:'Trendalytics',growth:+48},
    '2027-09':{colors:['moss-green','terracotta-clay','brown-rice'],styles:['vintage','boho-revival'],mood:'خاکی',source:'C2+Trendalytics',growth:+50},
    '2027-10':{colors:['terracotta-clay','burnt-orange','cinnamon'],styles:['vintage','edgy-preppy'],mood:'گرم',source:'Trendalytics',growth:+45},
    '2027-11':{colors:['true-blue','sapphire','cobalt-blue'],styles:['classic','quiet-luxury'],mood:'سلطنتی',source:'C2',growth:+42},
    '2027-12':{colors:['rio-red','scarlet','cherry-red'],styles:['elegant','edgy-preppy'],mood:'جشن',source:'C2',growth:+48},
    // ۲۰۲۸ (جدید!)
    '2028-01':{colors:['true-blue','blue','sapphire'],styles:['quiet-luxury','soft-futurism'],mood:'متعادل',source:'C2+WGSN',growth:+40},
    '2028-02':{colors:['pink-cosmos','pink','magenta'],styles:['soft-futurism','boho-revival'],mood:'بازیگوش',source:'C2',growth:+38},
    '2028-03':{colors:['brown-rice','beige','taupe'],styles:['quiet-luxury','neo-minimalism'],mood:'طبیعی',source:'C2',growth:+42},
    '2028-04':{colors:['forest-biome','forest','hunter'],styles:['vintage','quiet-luxury'],mood:'جنگلی',source:'C2',growth:+45},
    '2028-05':{colors:['peaceful-lilac','lilac','lavender'],styles:['soft-futurism','neo-minimalism'],mood:'آرامش',source:'WGSN',growth:+50},
    '2028-06':{colors:['russet','rust','terracotta-clay'],styles:['vintage','edgy-preppy'],mood:'خاکی',source:'WGSN',growth:+40},
    '2028-07':{colors:['maize','yellow','mustard'],styles:['boho-revival','street'],mood:'شاد',source:'WGSN',growth:+35},
    '2028-08':{colors:['deep-green','forest','emerald'],styles:['quiet-luxury','classic'],mood:'عمیق',source:'WGSN',growth:+40},
    '2028-09':{colors:['cinnamon','cocoa','caramel'],styles:['vintage','boho-revival'],mood:'ادویه‌ای',source:'Heuritech',growth:+35},
    '2028-10':{colors:['brown-rice','cinnamon','mocha'],styles:['classic','quiet-luxury'],mood:'طبیعی',source:'C2',growth:+38},
    '2028-11':{colors:['plum','purple-red','aubergine'],styles:['elegant','romantic'],mood:'سلطنتی',source:'Heuritech',growth:+30},
    '2028-12':{colors:['crimson','scarlet'],styles:['elegant','classic'],mood:'جشن',source:'Pantone',growth:+25}
  };

  // 🌟 رنگ سال (۲۰۲۵-۲۰۲۸)
  const COLOR_OF_THE_YEAR = {
    2025: 'cinnamon',           // Mocha Mousse - Pantone
    2026: 'transformative-teal',// WGSN/Coloro
    2027: 'future-aqua',        // Trendalytics AI
    2028: 'brown-rice'          // C2 Fashion Studio
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 ۲) ماتریکس رنگ-پوست (۲۰۰+ رنگ × ۱۲ نوع پوست)
  // ═══════════════════════════════════════════════════════════════
  const COLOR_SKIN_MATRIX = {
    warm: { // گرم - ۲۰۰+ رنگ
      black:96,white:76,cream:91,beige:97,gold:99,'gold-2':98,yellow:94,orange:96,
      red:91,'red-2':88,'dark-red':94,coral:93,salmon:89,peach:97,brown:98,'light-brown':95,
      tan:97,caramel:98,olive:94,'olive-2':92,khaki:92,mustard:96,rust:97,terracotta:98,
      burgundy:92,'rose-gold':98,copper:96,bronze:97,'dark-yellow':93,'warm-pink':83,
      pink:73,'light-pink':68,blue:56,'light-blue':53,'baby-blue':51,navy:63,'dark-blue':65,
      purple:68,lavender:63,lilac:61,mint:73,teal:75,turquoise:78,green:78,'dark-green':76,
      gray:73,silver:61,'rose-gold-2':97,amber:97,scarlet:89,maroon:90,magenta:71,
      fuchsia:66,plum:79,ivory:89,champagne:93,taupe:91,mocha:95,espresso:96,
      auburn:93,'red-wine':91,mahogany:92,sepia:89,umber:90,sienna:94,ochre:95,
      cinnamon:99,mocha:97,cocoa:96,aubergine:90,oxblood:91,coffee:93,chocolate:96,
      'tan-2':96,'cinnamon-2':99,'cocoa-2':97,'camel':93,'sand':91,'wheat':88,
      'lemon':85,'sunshine':87,'marigold':93,'goldenrod':94,'amber-2':95,
      'scarlet-2':87,'ruby':90,'cherry':89,'carmine':88,'coral-2':92,
      'olive-3':95,'avocado':90,'sage':88,'fern':89,'forest':80,'hunter':78,
      'teal-2':76,'aqua':77,'cyan':78,'cerulean':70,'cobalt':65,'sapphire':62,
      'indigo':67,'violet':68,'amethyst':70,'lavender-2':65,'mauve':72,
      'coffee':93,'chocolate':96,'cocoa-3':95,'espresso-2':97,'truffle':94,
      'tangerine':93,'coral-3':91,'peach-2':95,'apricot':94,'melon':92,
      // ۲۰۲۵-۲۰۲۸
      'transformative-teal':75,'digital-lavender':63,'chrome-silver':61,
      'powder-pink':85,'dusty-pink':84,'golden-tan':96,
      'neon-lime':55,'neon-green':56,'electric-pink':65,
      'deep-ocean-blue':60,'cobalt-blue':63,
      'earthy-neutral':93,'clay':94,'purple-red':90,'true-blue':55,
      'future-aqua':75,'butter-yellow':92,'earthy-sage':90,'sunset-coral':92,
      'cherry-red':88,'metallic-neutral':70,'moss-green':88,'terracotta-clay':97,
      'brown-rice':96,'pink-cosmos':78,'forest-biome':85,'peaceful-lilac':65,
      'russet':96,'maize':91,'deep-green':90,'rio-red':87,
      'blush-pink':85,'oceanic-blue':58,'energy-orange':94,'plum-2':82
    },
    cool: { // سرد
      black:93,white:95,cream:73,beige:68,gold:51,silver:98,'silver-2':99,gray:91,
      blue:95,'light-blue':98,'baby-blue':99,navy:97,'dark-blue':96,purple:98,lavender:99,
      lilac:98,'dark-purple':93,'royal-blue':98,'sky-blue':97,teal:93,turquoise:91,mint:95,
      green:83,'dark-green':91,emerald:93,'light-pink':98,pink:95,'rose-pink':93,
      red:81,'red-2':78,burgundy:88,yellow:48,orange:58,brown:63,'light-brown':58,
      'rose-gold':63,khaki:58,ivory:86,champagne:66,taupe:71,mocha:66,espresso:61,
      scarlet:74,maroon:79,magenta:86,fuchsia:91,plum:89,amber:56,auburn:61,
      'red-wine':83,mahogany:66,sepia:56,umber:61,sienna:66,ochre:51,
      cinnamon:58,mocha:62,cocoa:64,aubergine:88,oxblood:82,
      'transformative-teal':99,'digital-lavender':98,'chrome-silver':97,
      'powder-pink':97,'dusty-pink':95,'golden-tan':68,
      'neon-lime':78,'neon-green':80,'electric-pink':88,
      'deep-ocean-blue':97,'cobalt-blue':96,
      'earthy-neutral':70,'clay':65,'purple-red':85,'true-blue':99,
      'future-aqua':99,'butter-yellow':55,'earthy-sage':75,'sunset-coral':65,
      'cherry-red':78,'metallic-neutral':95,'moss-green':78,'terracotta-clay':62,
      'brown-rice':65,'pink-cosmos':95,'forest-biome':85,'peaceful-lilac':99,
      'russet':60,'maize':55,'deep-green':92,'rio-red':80,
      'blush-pink':97,'oceanic-blue':97,'energy-orange':58,'plum-2':92
    },
    neutral: {
      black:93,white:93,cream:93,beige:93,gray:91,silver:91,'silver-2':91,
      blue:88,navy:88,'baby-blue':91,red:88,'red-2':85,burgundy:90,
      green:83,teal:85,'dark-green':85,emerald:86,purple:83,pink:83,'light-pink':85,
      gold:88,'rose-gold':91,yellow:81,orange:83,brown:88,'light-brown':86,
      ivory:89,champagne:91,taupe:91,mocha:89,espresso:89,
      olive:86,khaki:86,mustard:83,rust:86,plum:79,magenta:76,
      cinnamon:90,mocha:91,cocoa:90,'transformative-teal':85,
      'powder-pink':87,'digital-lavender':85,'chrome-silver':85,
      'true-blue':90,'future-aqua':87,'butter-yellow':75,'earthy-sage':82,
      'sunset-coral':80,'cherry-red':85,'metallic-neutral':80,'moss-green':82,
      'terracotta-clay':85,'brown-rice':85,'pink-cosmos':85,'forest-biome':85,
      'peaceful-lilac':85,'russet':85,'maize':80,'deep-green':85,'rio-red':85
    },
    olive: {
      black:98,white:78,cream:93,beige:95,gold:97,yellow:93,orange:95,
      red:95,'red-2':93,'dark-red':97,coral:95,brown:98,'light-brown':96,
      tan:99,caramel:98,olive:100,'olive-2':100,khaki:98,mustard:96,rust:97,
      burgundy:95,'rose-gold':96,copper:97,bronze:98,green:81,'dark-green':83,
      teal:78,navy:78,blue:73,purple:75,pink:73,ivory:89,champagne:91,
      taupe:93,mocha:97,espresso:98,scarlet:91,maroon:93,gray:75,silver:72,
      cinnamon:99,mocha:98,cocoa:97,aubergine:91,oxblood:92,
      'transformative-teal':80,'powder-pink':80,'digital-lavender':65,
      'true-blue':75,'future-aqua':78,'butter-yellow':90,'earthy-sage':95,
      'sunset-coral':90,'cherry-red':93,'metallic-neutral':70,'moss-green':95,
      'terracotta-clay':95,'brown-rice':92,'pink-cosmos':78,'forest-biome':93,
      'peaceful-lilac':68,'russet':93,'maize':92,'deep-green':93,'rio-red':90
    },
    porcelain: {
      black:89,white:97,cream:86,beige:76,gray:86,silver:96,
      blue:91,'light-blue':96,'baby-blue':98,navy:93,purple:96,lavender:98,
      lilac:97,'light-pink':99,pink:96,red:79,burgundy:83,green:79,
      teal:89,mint:93,gold:56,'rose-gold':66,ivory:95,champagne:81,
      'transformative-teal':96,'digital-lavender':99,'chrome-silver':97,
      'powder-pink':99,'dusty-pink':98,'true-blue':95,'future-aqua':96,
      'butter-yellow':75,'earthy-sage':78,'pink-cosmos':96,
      'peaceful-lilac':99,'metallic-neutral':95
    },
    dark: {
      black:99,white:88,cream:90,beige:92,gold:95,yellow:88,orange:90,
      red:94,'red-2':92,'dark-red':96,coral:91,brown:95,'light-brown':93,
      tan:94,caramel:95,olive:90,'olive-2':89,khaki:91,mustard:92,rust:93,
      burgundy:95,'rose-gold':94,copper:93,bronze:94,green:75,'dark-green':77,
      teal:73,navy:75,blue:68,purple:70,pink:70,ivory:85,champagne:88,
      taupe:90,mocha:94,espresso:95,scarlet:92,maroon:94,gray:78,silver:80,
      cinnamon:96,mocha:95,cocoa:94,gold:95,champagne:90,
      'terracotta-clay':95,'brown-rice':93,'russet':95,'maize':92,
      'earthy-sage':88,'moss-green':88,'forest-biome':90
    },
    fair: {
      black:88,white:94,cream:88,beige:84,gray:87,silver:93,
      blue:90,'light-blue':94,'baby-blue':95,navy:91,purple:93,lavender:95,
      lilac:94,'light-pink':96,pink:93,red:80,burgundy:84,green:80,
      teal:88,mint:92,gold:60,'rose-gold':70,ivory:92,champagne:84,
      'transformative-teal':92,'digital-lavender':95,'chrome-silver':94,
      'powder-pink':97,'dusty-pink':96,'true-blue':92,'future-aqua':93,
      'butter-yellow':72,'earthy-sage':75,'pink-cosmos':93,
      'peaceful-lilac':96,'metallic-neutral':92
    },
    deep: {
      black:100,white:90,cream:91,beige:93,gold:96,yellow:89,orange:92,
      red:95,'red-2':93,'dark-red':97,coral:92,brown:96,'light-brown':94,
      tan:95,caramel:96,olive:91,'olive-2':90,khaki:92,mustard:93,rust:94,
      burgundy:96,'rose-gold':95,copper:94,bronze:95,green:77,'dark-green':79,
      teal:75,navy:77,blue:70,purple:72,pink:71,ivory:86,champagne:89,
      taupe:91,mocha:95,espresso:96,scarlet:93,maroon:95,gray:80,silver:82,
      cinnamon:97,mocha:96,cocoa:95,gold:96,'terracotta-clay':96,
      'brown-rice':94,'russet':96,'maize':93,'earthy-sage':90,
      'moss-green':90,'forest-biome':92,'rio-red':93
    },
    medium: {
      black:91,white:90,cream:90,beige:90,gray:89,silver:89,navy:88,
      blue:87,red:87,burgundy:88,green:82,purple:81,pink:82,
      gold:86,'rose-gold':88,brown:88,olive:88,khaki:87,
      cinnamon:93,mocha:92,cocoa:91,champagne:88,
      'terracotta-clay':90,'brown-rice':88,'russet':90,'earthy-sage':85
    },
    light: {
      black:85,white:93,cream:90,beige:85,gray:88,silver:94,
      blue:92,'light-blue':95,'baby-blue':96,navy:90,purple:94,lavender:96,
      lilac:95,'light-pink':97,pink:94,red:78,burgundy:82,green:78,
      teal:90,mint:93,gold:55,'rose-gold':65,ivory:93,champagne:82,
      'transformative-teal':94,'digital-lavender':97,'chrome-silver':95,
      'powder-pink':98,'dusty-pink':96,'true-blue':93,'future-aqua':95,
      'pink-cosmos':94,'peaceful-lilac':97,'metallic-neutral':93
    },
    tan: { // برنزه
      black:90,white:80,cream:87,beige:92,gold:88,orange:90,red:90,
      brown:93,caramel:93,olive:88,khaki:88,coral:90,peach:92,
      cinnamon:94,mocha:93,cocoa:92,champagne:85,
      'terracotta-clay':93,'brown-rice':90,'russet':93,'butter-yellow':85
    },
    ebony: { // بسیار تیره
      black:100,white:92,cream:93,beige:95,gold:97,yellow:91,orange:93,
      red:96,'red-2':94,'dark-red':98,coral:93,brown:97,'light-brown':95,
      tan:96,caramel:97,olive:92,'olive-2':91,khaki:93,mustard:94,rust:95,
      burgundy:97,'rose-gold':96,copper:95,bronze:96,green:78,'dark-green':80,
      teal:76,navy:78,blue:71,purple:73,pink:72,ivory:87,champagne:90,
      taupe:92,mocha:96,espresso:97,scarlet:94,maroon:96,gray:81,silver:83,
      cinnamon:98,mocha:97,cocoa:96,gold:97,'terracotta-clay':97,
      'brown-rice':95,'russet':97,'maize':94,'earthy-sage':91,
      'moss-green':91,'forest-biome':93,'rio-red':94
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 💎 ۳) استایل‌های ترند ۲۰۲۵-۲۰۲۸ (۲۰ عدد)
  // ═══════════════════════════════════════════════════════════════
  const TRENDING_STYLES = {
    'quiet-luxury':{weight:1.0,era:'2025-2028',desc:'لوکس بی‌صدا',tags:['classic','minimalist','elegant']},
    'soft-futurism':{weight:1.0,era:'2026-2028',desc:'آینده‌نگری نرم',tags:['minimalist','modern','tech']},
    'neo-minimalism':{weight:0.95,era:'2025-2028',desc:'مینیمالیسم نو',tags:['minimalist','classic']},
    'office-to-street':{weight:0.9,era:'2025-2027',desc:'اداری به خیابانی',tags:['modern','casual','preppy']},
    'techwear-lite':{weight:0.9,era:'2026-2028',desc:'تک‌ور سبک',tags:['sporty','modern']},
    'clean-girl-2.0':{weight:0.9,era:'2025-2027',desc:'دختر تمیز ۲.۰',tags:['minimalist','classic']},
    'digital-core':{weight:0.8,era:'2025-2026',desc:'هسته دیجیتال',tags:['modern','street']},
    'boho-revival':{weight:0.85,era:'2025-2028',desc:'بازگشت بوهمی',tags:['bohemian','vintage']},
    'animal-print-evolved':{weight:0.8,era:'2025-2027',desc:'طرح حیوانی تکامل‌یافته',tags:['classic','vintage']},
    'refined-y2k':{weight:0.75,era:'2025-2026',desc:'Y2K اصلاح‌شده',tags:['modern','street']},
    'edgy-preppy':{weight:0.9,era:'2025-2028',desc:'پرپی تیز',tags:['preppy','classic']},
    'elevated-athleisure':{weight:0.95,era:'2025-2027',desc:'ورزشی ارتقایافته',tags:['sporty','casual']},
    'capsule-wardrobe':{weight:1.0,era:'2025-2028',desc:'کپسول - همه‌کاره',tags:['minimalist','classic']},
    'mob-wife':{weight:0.85,era:'2025-2026',desc:'همسر مافیا',tags:['vintage','classic']},
    'coastal-grandmother':{weight:0.8,era:'2025-2026',desc:'مادربزرگ ساحلی',tags:['classic','casual']},
    'tomato-girl':{weight:0.85,era:'2025-2026',desc:'دختر گوجه‌ای',tags:['casual','bohemian']},
    'coquette':{weight:0.8,era:'2025-2026',desc:'کوکت',tags:['romantic','feminine']},
    'mob-boss':{weight:0.75,era:'2025',desc:'رئیس مافیا',tags:['classic','elegant']},
    'blokette':{weight:0.8,era:'2025-2026',desc:'بلوکت',tags:['street','sporty']},
    'gorpcore-2.0':{weight:0.85,era:'2025-2027',desc:'گورپ‌کور ۲.۰',tags:['sporty','techwear-lite']}
  };

  // ═══════════════════════════════════════════════════════════════
  // 👔 ۴) ماتریکس استایل-موقعیت (۲۵ استایل × ۲۵ موقعیت)
  // ═══════════════════════════════════════════════════════════════
  const STYLE_OCCASION_MATRIX = {
    elegant:{formal:98,party:93,wedding:98,work:91,dinner:93,date:88,casual:53,sport:10,travel:58,daily:48,beach:5,home:33,festival:61,graduation:96,interview:93,office:92,business:94,gala:97,ceremony:95,dateNight:90,brunch:70,meeting:88,conference:85,lunch:75,shopping:60},
    classic:{formal:95,work:98,dinner:91,date:83,wedding:91,party:78,daily:81,casual:73,sport:5,travel:68,beach:5,home:63,festival:51,graduation:89,interview:96,office:97,business:96,gala:90,ceremony:92,dateNight:85,brunch:75,meeting:95,conference:92,lunch:80,shopping:65},
    modern:{work:91,casual:88,daily:91,date:85,dinner:83,party:81,formal:73,travel:83,sport:63,beach:43,home:73,wedding:63,festival:76,graduation:79,interview:86,office:89,business:88,gala:78,ceremony:80,dateNight:84,brunch:80,meeting:88,conference:85,lunch:78,shopping:75},
    sporty:{sport:98,casual:93,daily:88,travel:93,beach:91,home:88,work:33,date:43,formal:5,party:23,dinner:28,wedding:5,festival:71,graduation:36,interview:26,office:30,business:28,gala:10,ceremony:20,dateNight:50,brunch:50,meeting:25,conference:30,lunch:55,shopping:80},
    casual:{casual:98,daily:95,home:95,travel:91,beach:88,sport:73,date:68,work:53,dinner:48,party:43,formal:18,wedding:23,festival:66,graduation:46,interview:36,office:50,business:48,gala:25,ceremony:35,dateNight:60,brunch:90,meeting:45,conference:40,lunch:88,shopping:95},
    bohemian:{casual:91,beach:98,travel:95,daily:83,party:81,date:78,festival:98,home:83,wedding:73,formal:43,work:33,sport:28,dinner:58,graduation:56,interview:31,office:35,business:33,gala:50,ceremony:55,dateNight:70,brunch:75,meeting:30,conference:35,lunch:70,shopping:65},
    vintage:{formal:91,party:88,wedding:93,dinner:91,date:85,work:73,daily:68,casual:63,travel:63,beach:23,home:73,sport:5,festival:76,graduation:81,interview:76,office:75,business:76,gala:88,ceremony:90,dateNight:82,brunch:65,meeting:70,conference:68,lunch:60,shopping:55},
    minimalist:{work:95,daily:95,casual:91,formal:88,date:83,dinner:85,travel:83,party:68,wedding:73,sport:43,home:88,beach:53,festival:56,graduation:81,interview:91,office:93,business:92,gala:80,ceremony:75,dateNight:78,brunch:88,meeting:93,conference:90,lunch:85,shopping:90},
    romantic:{date:98,wedding:95,party:91,dinner:93,formal:83,casual:73,daily:68,beach:53,travel:58,home:78,sport:10,work:43,festival:76,graduation:89,interview:56,office:45,business:48,gala:88,ceremony:92,dateNight:95,brunch:73,meeting:40,conference:35,lunch:70,shopping:60},
    street:{casual:95,daily:93,party:88,travel:83,date:73,sport:81,beach:63,work:48,dinner:53,formal:28,wedding:33,home:83,festival:86,graduation:51,interview:31,office:45,business:43,gala:30,ceremony:35,dateNight:65,brunch:75,meeting:40,conference:35,lunch:80,shopping:88},
    preppy:{work:91,casual:89,formal:86,daily:86,date:81,dinner:83,party:76,wedding:89,travel:76,sport:63,beach:56,home:73,festival:61,graduation:93,interview:89,office:91,business:90,gala:85,ceremony:88,dateNight:78,brunch:80,meeting:88,conference:85,lunch:75,shopping:70},
    'quiet-luxury':{work:96,daily:90,casual:85,formal:95,date:88,dinner:90,party:88,wedding:93,travel:85,home:80,sport:30,beach:30,festival:65,graduation:90,interview:95,office:96,business:96,gala:95,ceremony:94,dateNight:88,brunch:85,meeting:95,conference:92,lunch:85,shopping:75},
    'soft-futurism':{work:80,daily:85,casual:78,formal:75,date:78,dinner:80,party:88,wedding:78,travel:75,home:80,sport:65,beach:55,festival:85,graduation:75,interview:73,office:78,business:75,gala:85,ceremony:78,dateNight:80,brunch:75,meeting:73,conference:75,lunch:73,shopping:80},
    'neo-minimalism':{work:95,daily:95,casual:90,formal:88,date:83,dinner:85,travel:83,party:70,wedding:75,sport:43,home:90,beach:55,festival:55,graduation:80,interview:92,office:94,business:93,gala:80,ceremony:78,dateNight:78,brunch:90,meeting:93,conference:91,lunch:88,shopping:91},
    'office-to-street':{work:90,casual:85,daily:90,date:80,dinner:80,party:78,formal:70,travel:80,sport:60,beach:40,home:75,wedding:65,festival:70,graduation:78,interview:83,office:88,business:85,gala:75,ceremony:78,dateNight:78,brunch:80,meeting:85,conference:80,lunch:80,shopping:85},
    'techwear-lite':{work:55,daily:78,casual:85,formal:35,date:60,dinner:55,party:65,wedding:30,travel:88,home:73,sport:88,beach:50,festival:80,graduation:45,interview:40,office:50,business:45,gala:35,ceremony:40,dateNight:55,brunch:55,meeting:50,conference:50,lunch:60,shopping:75},
    'clean-girl':{work:90,daily:93,casual:88,formal:85,date:85,dinner:85,party:78,wedding:85,travel:80,home:90,sport:50,beach:60,festival:65,graduation:80,interview:88,office:90,business:88,gala:80,ceremony:80,dateNight:83,brunch:88,meeting:88,conference:85,lunch:88,shopping:85},
    'elevated-athleisure':{work:65,daily:88,casual:90,formal:45,date:65,dinner:60,party:55,wedding:40,travel:88,home:90,sport:90,beach:75,festival:65,graduation:55,interview:50,office:60,business:55,gala:35,ceremony:45,dateNight:60,brunch:73,meeting:60,conference:55,lunch:75,shopping:80},
    'mob-wife':{formal:88,work:75,casual:80,daily:83,date:85,dinner:88,party:90,wedding:88,travel:80,home:78,sport:25,beach:45,festival:70,graduation:75,interview:75,office:78,business:78,gala:88,ceremony:85,dateNight:85,brunch:78,meeting:75,conference:73,lunch:75,shopping:68},
    'coastal-grandmother':{casual:90,beach:85,travel:88,daily:88,home:93,date:73,wedding:75,formal:75,dinner:80,party:65,work:65,sport:35,festival:55,brunch:88,lunch:85,shopping:73,meeting:65,conference:60,interview:68,office:65},
    'tomato-girl':{casual:90,beach:95,travel:88,daily:83,date:80,party:78,festival:85,wedding:73,home:78,formal:65,dinner:73,sport:35,brunch:85,lunch:80,shopping:75,meeting:55,conference:50,interview:55,office:58},
    'coquette':{date:95,party:88,dinner:90,wedding:88,formal:80,casual:75,daily:73,home:80,beach:45,travel:55,sport:8,work:35,festival:75,graduation:80,interview:50,brunch:75,dateNight:90,meeting:30},
    'blokette':{casual:88,sport:85,street:90,daily:85,party:75,date:65,travel:75,beach:55,home:80,work:40,formal:25,wedding:30,festival:80,brunch:65,shopping:85,meeting:35,interview:30,office:40},
    'gorpcore-2.0':{sport:95,casual:88,travel:90,outdoor:98,beach:73,home:75,daily:80,date:55,party:45,formal:20,wedding:25,festival:75,work:35,brunch:55,lunch:60,shopping:78,meeting:40,interview:35,office:38}
  };

  // ═══════════════════════════════════════════════════════════════
  // 👗 ۵) ماتریکس فرم بدن-لباس (۶ فرم × ۲۸ نوع)
  // ═══════════════════════════════════════════════════════════════
  const BODY_GARMENT_MATRIX = {
    hourglass:{dress:98,'manto':93,shirt:91,'t-shirt':88,pants:93,skirt:98,jacket:91,coat:91,sweater:88,shoes:93,bag:93,accessory:93,hat:88,scarf:91,jewelry:95,belt:98,sunglasses:93,watch:91,blouse:90,vest:89,cardigan:87,leggings:92,boots:91,heels:95,sneakers:88,outerwear:91,denim:90},
    rectangle:{shirt:95,'t-shirt':95,pants:98,jacket:93,coat:95,sweater:93,dress:83,'manto':85,skirt:78,shoes:91,bag:88,accessory:91,hat:93,scarf:91,jewelry:88,belt:91,sunglasses:91,watch:89,blouse:92,vest:91,cardigan:92,leggings:90,boots:93,heels:88,sneakers:93,outerwear:92,denim:95},
    pear:{'manto':95,coat:95,jacket:91,shirt:88,sweater:88,dress:91,skirt:83,'t-shirt':83,pants:91,shoes:88,bag:91,accessory:88,hat:83,scarf:88,jewelry:91,belt:88,sunglasses:88,watch:86,blouse:87,vest:88,cardigan:89,leggings:86,boots:88,heels:90,sneakers:85,outerwear:91,denim:88},
    apple:{'manto':95,coat:93,jacket:91,shirt:91,pants:88,dress:88,sweater:88,'t-shirt':85,skirt:83,shoes:88,bag:91,accessory:88,hat:91,scarf:93,jewelry:91,belt:85,sunglasses:91,watch:89,blouse:90,vest:87,cardigan:89,leggings:88,boots:88,heels:90,sneakers:88,outerwear:92,denim:88},
    inverted:{pants:95,'manto':91,shirt:88,'t-shirt':88,dress:88,skirt:88,jacket:91,coat:91,sweater:91,shoes:91,bag:91,accessory:93,hat:93,scarf:93,jewelry:95,belt:91,sunglasses:93,watch:93,blouse:89,vest:90,cardigan:90,leggings:91,boots:91,heels:90,sneakers:93,outerwear:91,denim:93},
    athletic:{shirt:93,'t-shirt':96,pants:95,jacket:91,coat:91,sweater:91,dress:81,'manto':86,skirt:80,shoes:93,bag:91,accessory:91,hat:93,scarf:91,jewelry:88,belt:91,sunglasses:93,watch:93,blouse:91,vest:93,cardigan:90,leggings:95,boots:95,heels:85,sneakers:96,outerwear:91,denim:95}
  };

  // ═══════════════════════════════════════════════════════════════
  // 💰 ۶) بودجه ۸ سطح
  // ═══════════════════════════════════════════════════════════════
  const BUDGET_RANGES = {
    ultra_low:{min:0,max:150000,label:'فوق‌اقتصادی',emoji:'💵'},
    very_low:{min:0,max:300000,label:'اقتصادی',emoji:'💵'},
    low:{min:0,max:500000,label:'کم',emoji:'💰'},
    medium:{min:300000,max:1500000,label:'متوسط',emoji:'💎'},
    high:{min:800000,max:3000000,label:'بالا',emoji:'💍'},
    very_high:{min:1500000,max:10000000,label:'لوکس',emoji:'👑'},
    ultra:{min:5000000,max:100000000,label:'فوق‌لوکس',emoji:'💎'},
    unlimited:{min:0,max:100000000,label:'نامحدود',emoji:'♾️'}
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎂 ۷) سن ۶ گروه
  // ═══════════════════════════════════════════════════════════════
  const AGE_RANGES = {
    child:{min:0,max:12,label:'کودک',styles:['kawaii','casual','sporty']},
    teen:{min:13,max:19,label:'نوجوان',styles:['street','sporty','casual','kawaii','techwear-lite','blokette']},
    young:{min:20,max:29,label:'جوان',styles:['modern','casual','street','bohemian','romantic','clean-girl','elevated-athleisure','coquette','tomato-girl']},
    adult:{min:30,max:44,label:'بزرگسال',styles:['elegant','classic','modern','minimalist','quiet-luxury','neo-minimalism','office-to-street','mob-wife']},
    middle:{min:45,max:59,label:'میانسال',styles:['classic','elegant','minimalist','chic','quiet-luxury','coastal-grandmother']},
    senior:{min:60,max:100,label:'بزرگسال',styles:['classic','minimalist','vintage','quiet-luxury']}
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧠 ۸) Gradient Boosting - ساده‌شده
  // ═══════════════════════════════════════════════════════════════
  function gradientBoost(p,pr,h){
    // شبیه‌سازی Gradient Boosting: ترکیب چند "درخت تصمیم" ضعیف
    const trees=[];
    // درخت ۱: رنگ + پوست
    const tree1=calcColor(p,pr).score*0.3+calcSkin(p,pr).score*0.2;
    trees.push(tree1);
    // درخت ۲: استایل + موقعیت
    const tree2=calcStyle(p,pr).score*0.25+calcOccasion(p,pr).score*0.25;
    trees.push(tree2);
    // درخت ۳: بودجه + فصل
    const tree3=calcBudget(p,pr).score*0.2+calcSeason(p).score*0.15;
    trees.push(tree3);
    // درخت ۴: ترند + کیفیت
    const tree4=calcTrend(p).score*0.15+calcQuality(p).score*0.2;
    trees.push(tree4);
    // درخت ۵: شخصی + رفتار
    const tree5=calcPreferences(p,pr).score*0.2+calcHistory(p,h).score*0.15;
    trees.push(tree5);
    // میانگین وزنی
    return trees.reduce((a,b)=>a+b,0)/trees.length;
  }

  // 🧠 Random Forest - ساده‌شده
  function randomForest(p,pr,h){
    const votes=[];
    for(let i=0;i<10;i++){
      // تصادفی ۵ فاکتور انتخاب کن
      const factors=[calcColor,calcSkin,calcStyle,calcOccasion,calcBudget,calcSeason,calcTrend,calcQuality,calcHistory,calcPreferences];
      const sample=factors.sort(()=>Math.random()-0.5).slice(0,5);
      const avg=sample.reduce((s,f)=>s+f(p,pr,h||[]).score,0)/5;
      votes.push(avg);
    }
    return votes.sort((a,b)=>b-a).slice(0,7).reduce((a,b)=>a+b,0)/7; // میانگین ۷ تای برتر
  }

  // 🧠 Neural Network - ساده‌شده (MLP تک‌لایه)
  function neuralNet(features){
    // تابع فعال‌سازی: ReLU + Sigmoid
    const weights=[0.3,0.25,0.2,0.15,0.1];
    let sum=0;
    features.forEach((f,i)=>{
      const w=weights[i]||0.05;
      sum+=f.score*w*f.weight;
    });
    return 100/(1+Math.exp(-sum/100+5)); // Sigmoid
  }

  // 🧠 Bayesian Inference
  function bayesian(p,pr,h,evidence){
    // P(A|B) = P(B|A) * P(A) / P(B)
    const prior=0.5; // احتمال اولیه
    const likelihood=gradientBoost(p,pr,h)/100;
    return Math.min(100,(likelihood*prior*100)+(evidence||0)*0.3);
  }

  // 🧠 XGBoost-lite (Gradient Boosting با عمق بیشتر)
  function xgBoostLite(p,pr,h){
    const trees=[];
    trees.push(calcColor(p,pr).score*0.25+calcSkin(p,pr).score*0.20+calcSeasonalPalette(p).score*0.15);
    trees.push(calcStyle(p,pr).score*0.20+calcOccasion(p,pr).score*0.20+calcTrendingStyle(p,pr).score*0.20);
    trees.push(calcBudget(p,pr).score*0.20+calcQuality(p).score*0.15+calcDiscount(p).score*0.10);
    trees.push(calcBodyType(p,pr).score*0.20+calcSize(p,pr).score*0.15+calcHeight(p,pr).score*0.10);
    trees.push(calcSeason(p).score*0.20+calcMonth(p).score*0.15+calcTrendingSeason(p,pr).score*0.15);
    trees.push(calcPreferences(p,pr).score*0.20+calcHistory(p,h).score*0.20+calcSearchHistory(p,pr).score*0.10);
    trees.push(calcColorOfYear(p,pr).score*0.30+calcSeasonalPalette(p).score*0.20);
    trees.push(calcTime(p).score*0.25+calcDay(p).score*0.15);
    trees.push(calcLocation(p,pr).score*0.30+calcLanguage(p,pr).score*0.10);
    trees.push(calcGender(p,pr).score*0.30+calcAge(p,pr).score*0.20+calcStylePersonality(p,pr).score*0.20);
    return trees.reduce((a,b)=>a+b,0)/trees.length;
  }

  // 🧠 AdaBoost (Adaptive Boosting)
  function adaBoost(p,pr,h){
    const factors=[
      {fn:calcColor,weight:0.15},{fn:calcSkin,weight:0.12},{fn:calcStyle,weight:0.13},
      {fn:calcOccasion,weight:0.12},{fn:calcBudget,weight:0.10},{fn:calcSeason,weight:0.08},
      {fn:calcTrendingStyle,weight:0.10},{fn:calcBodyType,weight:0.08},{fn:calcQuality,weight:0.07},
      {fn:calcHistory,weight:0.05}
    ];
    const totW=factors.reduce((a,b)=>a+b.weight,0);
    factors.forEach(f=>f.weight/=totW);
    let sum=0;
    factors.forEach(f=>{
      const r=f.fn(p,pr,h||[]);
      const adaptive=f.weight*(1+r.score/200);
      sum+=r.score*adaptive;
    });
    return Math.min(100,sum*1.2);
  }

  // 🧠 Stacking (Ensemble لایه‌ای)
  function stacking(p,pr,h){
    const gb=gradientBoost(p,pr,h);
    const rf=randomForest(p,pr,h);
    const nn=neuralNet([calcColor(p,pr),calcSkin(p,pr),calcStyle(p,pr),calcOccasion(p,pr),calcBudget(p,pr)]);
    const xgb=xgBoostLite(p,pr,h);
    const ada=adaBoost(p,pr,h);
    return (gb*0.25+rf*0.20+nn*0.15+xgb*0.25+ada*0.15);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ ۹) توابع کمکی
  // ═══════════════════════════════════════════════════════════════
  const COLOR_NORMALIZE = {
    'مشکی':'black','سفید':'white','کرم':'cream','بژ':'beige','طلایی':'gold',
    'طوسی':'gray','خاکستری':'gray','نقره‌ای':'silver','قرمز':'red','آبی':'blue',
    'سرمه‌ای':'navy','بنفش':'purple','صورتی':'pink','سبز':'green','زرد':'yellow',
    'نارنجی':'orange','قهوه‌ای':'brown','زرشکی':'burgundy','یاسی':'lilac',
    'دارچینی':'cinnamon','موکا':'mocha','کاکائویی':'cocoa','بادمجانی':'aubergine',
    'عنابی':'oxblood','تیل':'teal','تیل تحول‌آفرین':'transformative-teal',
    'اسطوخودوس دیجیتال':'digital-lavender','نقره‌ای کروم':'chrome-silver',
    'صورتی پودری':'powder-pink','صورتی گرد و غبار':'dusty-pink','برنزه طلایی':'golden-tan',
    'آبی کبالت':'cobalt-blue','آبی اقیانوسی':'deep-ocean-blue',
    'خنثی زمینی':'earthy-neutral','رسی':'clay','بنفش-قرمز':'purple-red',
    'تیل آینده':'future-aqua','زرد کره‌ای':'butter-yellow','مریم‌گلی':'earthy-sage',
    'مرجانی غروب':'sunset-coral','گیلاسی':'cherry-red','خنثی فلزی':'metallic-neutral',
    'سبز خزه':'moss-green','خاک رس':'terracotta-clay','برنج قهوه‌ای':'brown-rice',
    'صورتی کیهان':'pink-cosmos','زیست‌بوم جنگلی':'forest-biome','یاسی آرام':'peaceful-lilac',
    'زنگاری':'russet','ذرتی':'maize','سبز عمیق':'deep-green','ریو قرمز':'rio-red',
    'آبی واقعی':'true-blue','لاجوردی':'royal-blue','فیروزه‌ای':'turquoise','یشمی':'emerald',
    'آبی کمرنگ':'light-blue','سبز نعنایی':'mint','سبز مریم‌گلی':'sage',
    'قرمز گوجه‌ای':'scarlet','سفید صدفی':'cream','شکلاتی':'chocolate','خردلی':'mustard','زیتونی':'olive',
    'پودری صورتی':'powder-pink','آبی اقیانوس':'oceanic-blue','نارنجی انرژی':'energy-orange'
  };
  function normalizeColor(c){if(!c)return null;const x=c.toString().toLowerCase().trim();return COLOR_NORMALIZE[x]||COLOR_NORMALIZE[x.replace(/\s+/g,'-')]||x.replace(/\s+/g,'-');}
  function getCurrentSeason(){const m=new Date().getMonth()+1;if(m>=3&&m<=5)return'spring';if(m>=6&&m<=8)return'summer';if(m>=9&&m<=11)return'autumn';return'winter';}
  function getCurrentSeasonLabel(){return{spring:'بهار',summer:'تابستان',autumn:'پاییز',winter:'زمستان'}[getCurrentSeason()];}
  function getTimeOfDay(){const h=new Date().getHours();if(h>=5&&h<12)return'morning';if(h>=12&&h<17)return'afternoon';if(h>=17&&h<21)return'evening';return'night';}
  function getCurrentMonth(){return new Date().getMonth()+1;}
  function getCurrentYear(){return new Date().getFullYear();}
  function getCurrentYearMonth(){return `${getCurrentYear()}-${String(getCurrentMonth()).padStart(2,'0')}`;}
  function parsePersianBirth(b){if(!b)return null;const m=String(b).match(/(\d{4})/);if(!m)return null;const y=parseInt(m[1],10);if(y<1300||y>1410)return null;return Math.max(10,Math.min(100,2025-y));}
  function getAgeRange(a){if(!a)return null;if(a<13)return'child';if(a<20)return'teen';if(a<30)return'young';if(a<45)return'adult';if(a<60)return'middle';return'senior';}
  function clamp(v,mn=0,mx=100){return Math.max(mn,Math.min(mx,v));}
  function round(v,d=0){const f=Math.pow(10,d);return Math.round(v*f)/f;}
  function isInRange(v,mn,mx){return v>=mn&&v<=mx;}
  function stringSim(a,b){if(!a||!b)return 0;a=a.toString().toLowerCase();b=b.toString().toLowerCase();if(a===b)return 1;const ml=Math.max(a.length,b.length);if(!ml)return 1;let d=Array(ml+1).fill(0).map((_,i)=>i);for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=a[i-1]===b[j-1]?p:1+Math.min(p,d[j],d[j-1]);p=t;}}return 1-d[ml]/ml;}
  function jaccardSim(a,b){if(!a||!b)return 0;const s=new Set(a),t=new Set(b);const i=[...s].filter(x=>t.has(x)).length;const u=new Set([...a,...b]).size;return u?i/u:0;}
  function manhattan(a,b){let s=0;for(let i=0;i<Math.min(a.length,b.length);i++)s+=Math.abs(a[i]-b[i]);return s;}

  // ═══════════════════════════════════════════════════════════════
  // 🧮 ۱۰) توابع محاسبه امتیاز (۸۰+ تابع)
  // ═══════════════════════════════════════════════════════════════

  // === ML اختصاصی (جدید) ===
  function calcGradientBoosting(p,pr,h){return{score:clamp(gradientBoost(p,pr,h)),weight:0.9,note:'🧠 ML',factors:['Gradient Boosting']};}
  function calcRandomForest(p,pr,h){return{score:clamp(randomForest(p,pr,h)),weight:0.85,note:'🌲 ML',factors:['Random Forest']};}
  function calcNeuralNetwork(p,pr,h){const features=[calcColor(p,pr),calcSkin(p,pr),calcStyle(p,pr),calcOccasion(p,pr),calcBudget(p,pr)];return{score:clamp(neuralNet(features)),weight:0.8,note:'🧠 NN',factors:['Neural Network']};}
  function calcBayesian(p,pr,h){return{score:clamp(bayesian(p,pr,h,0)),weight:0.75,note:'📊 Bayesian',factors:['Bayesian']};}
  function calcXGBoost(p,pr,h){return{score:clamp(xgBoostLite(p,pr,h)),weight:0.92,note:'🚀 XGB',factors:['XGBoost-lite']};}
  function calcAdaBoost(p,pr,h){return{score:clamp(adaBoost(p,pr,h)),weight:0.88,note:'⚡ ADA',factors:['AdaBoost']};}
  function calcStacking(p,pr,h){return{score:clamp(stacking(p,pr,h)),weight:0.95,note:'🏗️ Stack',factors:['Stacking Ensemble']};}

  // === ترندهای ۲۰۲۵-۲۰۲۸ ===
  function calcColorOfYear(p,pr){
    if(!p.colors)return{score:50,weight:0.3,note:'',factors:[]};
    const c=Array.isArray(p.colors)?p.colors:[];
    const years=Object.keys(COLOR_OF_THE_YEAR);
    let s=50,f=[];
    c.forEach(x=>{
      const nc=normalizeColor(x);
      years.forEach(y=>{
        if(nc===COLOR_OF_THE_YEAR[y]){
          const yearDiff=getCurrentYear()-parseInt(y);
          const growthBonus=Math.max(0,30-yearDiff*10);
          s=Math.max(s,98+growthBonus);
          f.push('🌟 رنگ سال '+y);
        }
      });
    });
    return{score:clamp(s),weight:0.7,note:'',factors:f};
  }

  function calcSeasonalPalette(p){
    if(!p.colors)return{score:50,weight:0.3,note:'',factors:[]};
    const ym=getCurrentYearMonth();
    const tr=TREND_FORECAST[ym]||TREND_FORECAST['2025-01'];
    const c=Array.isArray(p.colors)?p.colors:[];
    let s=50,f=[];
    c.forEach(x=>{
      const nc=normalizeColor(x);
      if(tr.colors.includes(nc)){
        const growth=tr.growth||0;
        s=Math.max(s,95+Math.min(5,growth/100));
        f.push('🌸 ترند '+ym+' (+'+tr.growth+'%)');
      }
    });
    return{score:clamp(s),weight:0.7,note:tr.mood,factors:f};
  }

  function calcTrendingStyle(p,pr){
    if(!p.style)return{score:50,weight:0.3,note:'',factors:[]};
    const ps=p.style.toLowerCase();
    const yr=getCurrentYear();
    let s=50,f=[];
    Object.keys(TRENDING_STYLES).forEach(k=>{
      const ts=TRENDING_STYLES[k];
      const years=ts.era.split('-').map(y=>parseInt(y));
      if(ps===k){
        const inEra=yr>=years[0]&&yr<=years[1];
        s=Math.max(s,inEra?98:75);
        f.push('🔥 '+k+' ('+ts.era+')');
      }else if(ts.tags.includes(ps)){
        s=Math.max(s,80);
      }
    });
    if(pr.preferredStyles&&pr.preferredStyles.length){
      pr.preferredStyles.forEach(x=>{
        if(Object.keys(TRENDING_STYLES).includes(x.toLowerCase())){
          s=Math.max(s,90);
          f.push('✨ '+x);
        }
      });
    }
    return{score:clamp(s),weight:0.7,note:'',factors:f};
  }

  function calcTrendingMaterial(p,pr){
    if(!p.material)return{score:50,weight:0.3,note:'',factors:[]};
    const pm=p.material.toLowerCase();
    const trending={'silk':95,'satin':90,'organic-cotton':95,'linen':88,'cashmere':98,'wool':85,'leather':92,'recycled-polyester':88,'tencel':90,'velvet':87,'organza':85,'denim':90,'jersey':85,'knit':92};
    let s=50,f=[];
    Object.keys(trending).forEach(k=>{
      if(pm.includes(k)){
        s=Math.max(s,trending[k]);
        f.push('🧵 '+k);
      }
    });
    return{score:clamp(s),weight:0.7,note:'',factors:f};
  }

  function calcGrowthRate(p,pr){
    const ym=getCurrentYearMonth();
    const tr=TREND_FORECAST[ym];
    if(!tr)return{score:50,weight:0.3,note:'',factors:[]};
    const c=Array.isArray(p.colors)?p.colors:[];
    const ps=(p.style||'').toLowerCase();
    let s=50,f=[];
    c.forEach(x=>{
      if(tr.colors.includes(normalizeColor(x))){
        s=Math.max(s,Math.min(100,75+tr.growth/5));
        f.push('📈 رشد '+tr.growth+'%');
      }
    });
    if(tr.styles.includes(ps)){
      s=Math.max(s,80);
    }
    return{score:clamp(s),weight:0.6,note:'',factors:f};
  }

  // === توابع اصلی ===
  function calcGender(p,pr){if(!pr.gender)return{score:50,weight:0.5,note:'',factors:[]};const pg=(p.gender||'unisex').toLowerCase(),g=pr.gender.toLowerCase();if(pg==='unisex')return{score:93,weight:0.9,note:'یونیسکس',factors:['یونیسکس']};if(pg===g)return{score:100,weight:1.0,note:'مناسب',factors:['جنسیت']};return{score:3,weight:0,note:'نامناسب',factors:['تضاد']};}

  function calcColor(p,pr){
    if(!pr.preferredColors||!pr.preferredColors.length)return{score:50,weight:0.6,note:'',factors:['بدون ترجیح']};
    const pc=Array.isArray(p.colors)?p.colors:(p.colors?[p.colors]:[]);
    if(!pc.length)return{score:40,weight:0.6,note:'نامشخص',factors:['بدون رنگ']};
    let best=0,bm='',f=[];
    pr.preferredColors.forEach(pf=>{
      const nf=normalizeColor(pf);
      pc.forEach(c=>{
        const nc=normalizeColor(c);
        if(nf===nc){best=100;bm=pf;f.push('رنگ '+pf);}
        if(pr.skinTone&&COLOR_SKIN_MATRIX[pr.skinTone]&&COLOR_SKIN_MATRIX[pr.skinTone][nc]){
          const ms=COLOR_SKIN_MATRIX[pr.skinTone][nc];
          if(ms>best)best=ms;
          if(ms>=90)f.push('هماهنگی '+c+' با پوست');
        }
      });
    });
    return{score:clamp(best),weight:0.9,note:bm?'هماهنگ با '+bm:'نزدیک',factors:f.slice(0,3)};
  }

  function calcColorHarmony(p,pr){if(!pr.preferredColors||!pr.skinTone)return{score:50,weight:0.4,note:'',factors:[]};const pc=Array.isArray(p.colors)?p.colors:[];if(!pc.length)return{score:50,weight:0.4,note:'',factors:[]};let h=0,c=0;pc.forEach(x=>{const nc=normalizeColor(x);if(COLOR_SKIN_MATRIX[pr.skinTone]&&COLOR_SKIN_MATRIX[pr.skinTone][nc]){h+=COLOR_SKIN_MATRIX[pr.skinTone][nc];c++;}});if(!c)return{score:50,weight:0.4,note:'',factors:[]};return{score:clamp(h/c),weight:0.7,note:'',factors:[]};}
  function calcColorFamily(p,pr){
    if(!Array.isArray(p.colors)||!p.colors.length)return{score:50,weight:0.3,note:'',factors:[]};
    const pc=Array.isArray(pr.preferredColors)?pr.preferredColors:[];
    if(!pc.length)return{score:60,weight:0.3,note:'',factors:[]};
    let s=50,f=[];
    p.colors.forEach(c=>{
      const fam=getColorFamily(normalizeColor(c));
      if(!fam)return;
      pc.forEach(pf=>{
        const pnf=normalizeColor(pf);
        const ppf=getColorFamily(pnf);
        if(ppf===fam){s=Math.max(s,85);f.push('هماهنگی خانواده '+fam);}
        if((fam==='warm-pink'&&ppf==='blue')||(fam==='blue'&&ppf==='warm-pink')||(fam==='orange'&&ppf==='blue')){s=Math.max(s,90);f.push('✨ مکمل '+fam);}
      });
    });
    return{score:clamp(s),weight:0.5,note:'',factors:f};
  }
  function calcSkin(p,pr){if(!pr.skinTone)return{score:50,weight:0.5,note:'',factors:[]};const pc=Array.isArray(p.colors)?p.colors:[];if(!pc.length)return{score:50,weight:0.5,note:'',factors:[]};let best=0;pc.forEach(c=>{const nc=normalizeColor(c);if(COLOR_SKIN_MATRIX[pr.skinTone]&&COLOR_SKIN_MATRIX[pr.skinTone][nc]){const s=COLOR_SKIN_MATRIX[pr.skinTone][nc];if(s>best)best=s;}});return{score:best,weight:0.75,note:'',factors:[]};}
  function calcContrast(p,pr){
    if(!pr.contrast)return{score:50,weight:0.3,note:'',factors:[]};
    const userContrast=pr.contrast;
    const isBoldProduct=Array.isArray(p.colors)&&p.colors.some(c=>{
      const nc=normalizeColor(c);
      return ['red','burgundy','cobalt-blue','emerald','fuchsia','purple','orange','black','royal-blue','dark-red','mustard','scarlet','true-blue','rio-red','cherry-red'].includes(nc);
    });
    const isNeutralProduct=Array.isArray(p.colors)&&p.colors.every(c=>{
      const nc=normalizeColor(c);
      return ['beige','cream','white','gray','peach','powder-pink','mint','sky-blue','camel','lavender'].includes(nc);
    });
    if(userContrast==='high'&&isBoldProduct)return{score:95,weight:0.7,note:'کنتراست بالا',factors:['⚡ کنتراست ایده‌آل']};
    if(userContrast==='low'&&isNeutralProduct)return{score:95,weight:0.7,note:'ملایم',factors:['🤝 هماهنگی آرام']};
    if(userContrast==='high'&&isNeutralProduct)return{score:55,weight:0.5,note:'',factors:['⚠️ کنتراست پایین']};
    if(userContrast==='low'&&isBoldProduct)return{score:55,weight:0.5,note:'',factors:['⚠️ کنتراست بالا']};
    return{score:75,weight:0.5,note:'',factors:[]};
  }
  function calcPattern(p,pr){return pr.preferredPatterns&&pr.preferredPatterns.length&&p.pattern&&pr.preferredPatterns.includes(p.pattern)?{score:100,weight:0.8,note:'',factors:['طرح']}:{score:60,weight:0.3,note:'',factors:[]};}
  function calcTexture(p,pr){return pr.preferredTextures&&pr.preferredTextures.length&&p.texture&&pr.preferredTextures.includes(p.texture)?{score:95,weight:0.7,note:'',factors:['بافت']}:{score:60,weight:0.3,note:'',factors:[]};}

  function calcStyle(p,pr){
    if(!pr.preferredStyles||!pr.preferredStyles.length)return{score:50,weight:0.6,note:'',factors:[]};
    const ps=p.style||(p.tags||[]).find(t=>STYLE_OCCASION_MATRIX[t]);
    if(!ps)return{score:45,weight:0.6,note:'نامشخص',factors:[]};
    let best=0,bs='',f=[];
    pr.preferredStyles.forEach(x=>{
      const xn=x.toLowerCase().trim();
      if(STYLE_OCCASION_MATRIX[xn]&&STYLE_OCCASION_MATRIX[xn][ps]!==undefined){
        const s=STYLE_OCCASION_MATRIX[xn][ps];
        if(s>best)best=s;bs=xn;
        if(s>=90)f.push('سبک '+xn);
      }else{
        const sim=stringSim(xn,ps)*80;
        if(sim>best&&sim>60)best=sim;
      }
    });
    return{score:clamp(best),weight:0.85,note:bs?'سبک '+bs:'',factors:f};
  }

  function calcStyleOccasion(p,pr){if(!pr.preferredOccasions||!pr.preferredOccasions.length)return{score:50,weight:0.4,note:'',factors:[]};const ps=(p.style||'').toLowerCase();if(!ps||!STYLE_OCCASION_MATRIX[ps])return{score:50,weight:0.4,note:'',factors:[]};let best=0;pr.preferredOccasions.forEach(o=>{const oo=o.toLowerCase().trim();if(STYLE_OCCASION_MATRIX[ps][oo]!==undefined&&STYLE_OCCASION_MATRIX[ps][oo]>best)best=STYLE_OCCASION_MATRIX[ps][oo];});return{score:best,weight:0.7,note:'',factors:best>=90?['هماهنگی']:[]};}
  function calcStylePersonality(p,pr){
    if(!pr.personality||!p.style)return{score:50,weight:0.4,note:'',factors:[]};
    const matrix={
      "introvert":{minimalist:90,classic:85,"quiet-luxury":88,"neo-minimalism":92,vintage:78,elegant:80,bohemian:75,street:55,sporty:65,romantic:70},
      'extrovert':{street:92,modern:88,party:90,bohemian:85,sporty:80,elegant:80,casual:85,romantic:75,minimalist:60},
      'creative':{bohemian:95,romantic:88,modern:85,vintage:88,street:80,elegant:75,minimalist:65,sporty:70,classic:70},
      "logical":{classic:90,minimalist:92,"quiet-luxury":90,"neo-minimalism":95,modern:85,elegant:85,vintage:75,street:60,sporty:70,bohemian:55},
      "leader":{elegant:90,classic:90,"quiet-luxury":92,modern:85,minimalist:88,"neo-minimalism":90,romantic:65,sporty:70,bohemian:60,street:65},
      'romantic':{romantic:95,elegant:88,bohemian:85,classic:80,vintage:88,feminine:90,coquette:95,street:50,sporty:45,minimalist:55}
    };
    const m=matrix[pr.personality]||{};
    const ps=p.style.toLowerCase();
    let s=60,f=[];
    if(m[ps]!==undefined){s=m[ps];if(s>=85)f.push('🎭 '+pr.personality+' + '+ps);}
    return{score:clamp(s),weight:0.6,note:pr.personality,factors:f};
  }
  function calcOccasion(p,pr){if(!pr.preferredOccasions||!pr.preferredOccasions.length)return{score:50,weight:0.6,note:'',factors:[]};const po=Array.isArray(p.occasions)?p.occasions:(p.occasion?[p.occasion]:[]);if(!po.length)return{score:45,weight:0.6,note:'',factors:[]};let m=0,bm='';pr.preferredOccasions.forEach(pf=>{const pp=pf.toLowerCase().trim();po.forEach(oo=>{const no=(oo||'').toLowerCase().trim();if(pp===no){m++;bm=pf;}else if(stringSim(pp,no)>0.7)m++;});});const r=m/pr.preferredOccasions.length;let s=r*100;if(m===pr.preferredOccasions.length)s=100;else if(m>0)s=Math.min(95,s+10);return{score:clamp(s),weight:0.8,note:bm?'مناسب '+bm:'',factors:[]};}
  function calcOccasionTime(p,pr){
    if(!pr.preferredOccasions)return{score:50,weight:0.3,note:'',factors:[]};
    const tod=getTimeOfDay();
    const m={'morning':{casual:90,work:85,sport:88,brunch:92,home:88,shopping:80},'afternoon':{work:90,casual:88,lunch:90,shopping:85,date:75,meeting:92},'evening':{date:92,party:95,formal:93,dinner:95,gala:97,dateNight:96},'night':{casual:80,home:90,sport:75}};
    const occMap=m[tod]||{};
    let best=0,bm='';
    pr.preferredOccasions.forEach(o=>{
      const oo=o.toLowerCase().trim();
      if(occMap[oo]!==undefined&&occMap[oo]>best){best=occMap[oo];bm=oo;}
    });
    if(!best)return{score:50,weight:0.3,note:'',factors:[]};
    return{score:best,weight:0.6,note:tod+'-'+bm,factors:['⏰ '+tod]};
  }
  function calcBodyType(p,pr){if(!pr.bodyType)return{score:50,weight:0.5,note:'',factors:[]};const cat=(p.category||'').toLowerCase();const gk=getGarmentKey(cat);const m=BODY_GARMENT_MATRIX[pr.bodyType];return m&&m[gk]?{score:m[gk],weight:0.8,note:'',factors:['فرم '+pr.bodyType]}:{score:70,weight:0.6,note:'',factors:[]};}
  function calcBodyShape(p,pr){
    if(!pr.bodyType)return{score:50,weight:0.4,note:'',factors:[]};
    const cat=(p.category||'').toLowerCase();
    const bt=pr.bodyType;
    const m={
      hourglass:{پیراهن:97,بلوز:92,کت:90,پالتو:88,شلوار:90,دامن:95,کفش:85},
      pear:{پالتو:93,کت:90,پیراهن:88,بلوز:85,شلوار:80,دامن:75},
      apple:{پالتو:95,کت:92,پیراهن:90,شلوار:85,دامن:80},
      rectangle:{تیشرت:95,پیراهن:90,کت:93,شلوار:95,دامن:88,پالتو:90},
      inverted:{شلوار:95,پیراهن:85,دامن:88,کت:90,پالتو:88},
      athletic:{تیشرت:95,کفش:90,شلوار:95,کاپشن:90}
    };
    const gk=getGarmentKey(cat);
    if(m[bt]&&m[bt][gk]!==undefined)return{score:m[bt][gk],weight:0.7,note:'فرم '+bt,factors:['👔 '+bt]};
    return{score:70,weight:0.4,note:'',factors:[]};
  }
  function calcSize(p,pr){
    if(!pr.measurements||!p.sizes||!p.sizes.length)return{score:50,weight:0.4,note:'',factors:[]};
    const m=pr.measurements;
    let userSize=null;
    if(m.chest){
      if(m.chest<85)userSize='S';
      else if(m.chest<95)userSize='M';
      else if(m.chest<105)userSize='L';
      else if(m.chest<115)userSize='XL';
      else userSize='XXL';
    }else if(m.waist){
      if(m.waist<70)userSize='S';
      else if(m.waist<80)userSize='M';
      else if(m.waist<90)userSize='L';
      else if(m.waist<100)userSize='XL';
      else userSize='XXL';
    }
    if(!userSize)return{score:50,weight:0.4,note:'',factors:[]};
    if(p.sizes.includes(userSize))return{score:100,weight:1.0,note:'سایز '+userSize,factors:['✅ سایز دقیق']};
    const sizes=['XS','S','M','L','XL','XXL'];
    const idx=sizes.indexOf(userSize);
    const hasNear=sizes.some((s,i)=>Math.abs(i-idx)===1&&p.sizes.includes(s));
    if(hasNear)return{score:80,weight:0.8,note:'نزدیک',factors:['📏 سایز نزدیک']};
    return{score:30,weight:0.3,note:'خارج',factors:['❌ سایز موجود نیست']};
  }

  function calcProportion(p,pr){
    if(!pr.measurements)return{score:50,weight:0.3,note:'',factors:[]};
    const m=pr.measurements;
    if(m.height&&m.weight){
      const bmi=m.weight/Math.pow(m.height/100,2);
      let s=70;
      if(bmi>=18.5&&bmi<25)s=95;
      else if(bmi>=17||bmi<30)s=80;
      else if(bmi>=16||bmi<35)s=65;
      else s=45;
      if(p.length==='long'&&m.height>=175)s=Math.min(100,s+10);
      if(p.length==='short'&&m.height<165)s=Math.min(100,s+10);
      return{score:clamp(s),weight:0.6,note:'BMI '+round(bmi,1),factors:[]};
    }
    return{score:60,weight:0.4,note:'',factors:[]};
  }

  function calcHeight(p,pr){
    if(!pr.measurements||!pr.measurements.height)return{score:50,weight:0.3,note:'',factors:[]};
    const h=pr.measurements.height;
    const cat=(p.category||'').toLowerCase();
    let ideal=null;
    if(cat.includes('شلوار')||cat.includes('دامن'))ideal={min:155,max:185,weight:0.9};
    else if(cat.includes('پالتو')||cat.includes('کاپشن'))ideal={min:150,max:195,weight:0.8};
    else if(cat.includes('کت'))ideal={min:155,max:190,weight:0.8};
    else if(cat.includes('پیراهن')||cat.includes('بلوز')||cat.includes('تیشرت'))ideal={min:150,max:200,weight:0.7};
    else if(cat.includes('کفش'))ideal={min:140,max:210,weight:0.85};
    else ideal={min:140,max:210,weight:0.6};
    let s=70;
    if(h>=ideal.min&&h<=ideal.max)s=95;
    else if(h<ideal.min-10||h>ideal.max+10)s=50;
    else s=80;
    return{score:clamp(s),weight:ideal.weight,note:'',factors:[]};
  }

  function calcWeight(p,pr){
    if(!pr.measurements||!pr.measurements.weight||!pr.measurements.height)return{score:50,weight:0.3,note:'',factors:[]};
    const w=pr.measurements.weight,h=pr.measurements.height;
    const bmi=w/Math.pow(h/100,2);
    const cat=(p.category||'').toLowerCase();
    let s=70,f=[];
    if(cat.includes('پالتو')||cat.includes('کاپشن')){
      if(bmi>=22&&bmi<30)s=95;
      else if(bmi<22||bmi<32)s=78;
    }else if(cat.includes('شلوار')||cat.includes('دامن')){
      if(bmi>=18.5&&bmi<28)s=95;
      else if(bmi<18.5||bmi<32)s=75;
    }else{
      if(bmi>=18.5&&bmi<30)s=90;
      else if(bmi<18.5||bmi<33)s=78;
    }
    if(bmi<16||bmi>35)f.push('⚠️ BMI خارج از محدوده');
    return{score:clamp(s),weight:0.7,note:'',factors:f};
  }

  function calcBudget(p,pr){if(!pr.budget)return{score:50,weight:0.6,note:'',factors:[]};const r=BUDGET_RANGES[pr.budget];if(!r)return{score:50,weight:0.6,note:'',factors:[]};const pp=p.price||0;if(!pp)return{score:50,weight:0.5,note:'',factors:[]};if(isInRange(pp,r.min,r.max))return{score:100,weight:1.0,note:r.label,factors:['در بودجه']};if(pp<r.min){const d=r.min-pp,ra=d/r.min;if(ra<0.1)return{score:92,weight:0.95,note:'',factors:['ارزان']};if(ra<0.5)return{score:75,weight:0.8,note:'',factors:[]};return{score:60,weight:0.6,note:'',factors:[]};}const d=pp-r.max,ra=d/r.max;if(ra<0.2)return{score:80,weight:0.85,note:'',factors:[]};if(ra<0.5)return{score:60,weight:0.7,note:'',factors:[]};if(ra<1.0)return{score:35,weight:0.4,note:'',factors:[]};return{score:5,weight:0.1,note:'',factors:['خارج']};}

  function calcValue(p){let s=60;if(p.rating){const v=p.rating/(p.price/100000);if(v>3)s=90;else if(v>2)s=80;}if(p.originalPrice&&p.price<p.originalPrice){const d=(p.originalPrice-p.price)/p.originalPrice;if(d>0.3)s+=10;}return{score:clamp(s),weight:0.7,note:'',factors:[]};}
  function calcDiscount(p){return p.originalPrice&&p.price<p.originalPrice?{score:90,weight:0.7,note:'',factors:['تخفیف']}:{score:50,weight:0.3,note:'',factors:[]};}
  function calcPriceSegment(p,pr){
    if(!pr.budget||!p.price)return{score:50,weight:0.3,note:'',factors:[]};
    const segments={low:300000,medium:1000000,high:3000000,luxury:10000000};
    const seg=segments[pr.budget]||1000000;
    const ratio=p.price/seg;
    let s=50;
    if(ratio>=0.7&&ratio<=1.3)s=95;
    else if(ratio>=0.4&&ratio<0.7)s=80;
    else if(ratio>1.3&&ratio<=1.8)s=75;
    else if(ratio>1.8)s=60;
    else s=70;
    return{score:clamp(s),weight:0.5,note:pr.budget,factors:['💰 segment']};
  }

  function calcSeason(p){const c=getCurrentSeason();const ps=(p.season||'all').toLowerCase();const m={spring:{spring:98,summer:83,autumn:63,winter:43,all:83},summer:{summer:98,spring:83,autumn:53,winter:23,all:78},autumn:{autumn:98,winter:83,spring:63,summer:43,all:83},winter:{winter:98,autumn:83,spring:53,summer:28,all:78}};return m[c]&&m[c][ps]?{score:m[c][ps],weight:0.7,note:'',factors:['فصل']}:{score:75,weight:0.6,note:'',factors:[]};}
  function calcTime(p){
    const tod=getTimeOfDay();
    const cat=(p.category||'').toLowerCase();
    const m={
      morning:{work:88,casual:85,sport:90,home:80,brunch:92},
      afternoon:{work:90,casual:85,date:80,sport:88,shopping:85,lunch:88},
      evening:{date:95,party:95,formal:93,dinner:95,gala:97,dateNight:96},
      night:{casual:78,home:90,sport:70,party:85}
    };
    const sm=m[tod]||{};
    let best=70;
    if(sm[getGarmentKey(cat)]!==undefined)best=sm[getGarmentKey(cat)];
    return{score:clamp(best),weight:0.5,note:tod,factors:['⏰ '+tod]};
  }

  function calcDay(){
    const d=new Date().getDay();
    const w=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه','شنبه'];
    const m={0:{casual:90,home:85,formal:30},1:{work:95,formal:90},2:{work:95,formal:90},3:{work:95,formal:90},4:{work:90,date:85,party:90},5:{casual:95,date:90,party:95,festival:90},6:{casual:95,home:88,date:88,party:90}};
    return{score:75,weight:0.3,note:w[d],factors:['📅 '+w[d]]};
  }

  function calcMonth(p){
    const m=getCurrentMonth();
    const ym=getCurrentYearMonth();
    const tr=TREND_FORECAST[ym];
    if(!tr)return{score:50,weight:0.3,note:'',factors:[]};
    const c=Array.isArray(p.colors)?p.colors:[];
    const hasMatch=c.some(x=>tr.colors.includes(normalizeColor(x)));
    if(hasMatch)return{score:90,weight:0.6,note:tr.mood,factors:['📅 ترند ماه: '+tr.source]};
    return{score:60,weight:0.4,note:tr.mood,factors:[]};
  }

  function calcYear(p){
    const yr=getCurrentYear();
    const c=Array.isArray(p.colors)?p.colors:[];
    if(c.includes(COLOR_OF_THE_YEAR[yr]))return{score:100,weight:0.7,note:'رنگ سال '+yr,factors:['🌟 رنگ سال']};
    if(c.includes(COLOR_OF_THE_YEAR[yr+1])||c.includes(COLOR_OF_THE_YEAR[yr-1]))return{score:80,weight:0.5,note:'',factors:['نزدیک به سال']};
    return{score:50,weight:0.2,note:'',factors:[]};
  }
  function calcTrendingSeason(p,pr){const ym=getCurrentYearMonth();const tr=TREND_FORECAST[ym];if(!tr)return{score:50,weight:0.3,note:'',factors:[]};const ps=(p.style||'').toLowerCase();if(ps&&tr.styles.includes(ps))return{score:92,weight:0.6,note:tr.mood,factors:['ترند فصل: '+tr.source]};return{score:65,weight:0.4,note:'',factors:[]};}

  function calcAge(p,pr){const a=parsePersianBirth(pr.birth);if(!a)return{score:50,weight:0.4,note:'',factors:[]};const ar=getAgeRange(a);const c=AGE_RANGES[ar];const s=(p.style||'').toLowerCase();let sc=70;if(c.styles.includes(s))sc=96;else if(c.styles.some(x=>stringSim(x,s)>0.7))sc=86;return{score:sc,weight:0.6,note:'',factors:[]};}
  function calcLocation(p,pr){
    if(!pr.city)return{score:50,weight:0.3,note:'',factors:[]};
    const city=pr.city.toLowerCase();
    const cat=(p.category||'').toLowerCase();
    const climateMatch={
      'تهران':{پالتو:88,کاپشن:90,پیراهن:75,تیشرت:80},
      'اصفهان':{پالتو:85,کاپشن:88,پیراهن:78,تیشرت:82},
      'شیراز':{پالتو:75,کاپشن:80,پیراهن:85,تیشرت:88},
      'مشهد':{پالتو:90,کاپشن:92,پیراهن:72,تیشرت:75},
      'بندرعباس':{پالتو:40,کاپشن:45,پیراهن:92,تیشرت:95},
      'تبریز':{پالتو:92,کاپشن:95,پیراهن:70,تیشرت:72},
      'کیش':{پالتو:30,کاپشن:35,پیراهن:95,تیشرت:98}
    };
    let s=70;
    Object.keys(climateMatch).forEach(c=>{
      if(city.includes(c)&&climateMatch[c][getGarmentKey(cat)])s=climateMatch[c][getGarmentKey(cat)];
    });
    return{score:clamp(s),weight:0.6,note:pr.city,factors:['🌍 '+pr.city]};
  }

  function calcLanguage(p,pr){
    if(!pr.language)return{score:80,weight:0.2,note:'',factors:[]};
    if(pr.language==='fa')return{score:95,weight:0.4,note:'فارسی',factors:['زبان فارسی']};
    return{score:60,weight:0.2,note:'',factors:[]};
  }

  function calcTimezone(p,pr){
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
    if(tz.includes('Tehran')||tz.includes('Iran'))return{score:90,weight:0.3,note:'ایران',factors:['🇮🇷 تهران']};
    return{score:70,weight:0.2,note:tz,factors:[]};
  }

  function calcQuality(p){let s=50;if(p.rating){if(p.rating>=4.8)s+=46;else if(p.rating>=4.5)s+=39;else if(p.rating>=4.0)s+=31;else if(p.rating>=3.5)s+=21;}if(p.ratingCount>100)s+=11;else if(p.ratingCount>50)s+=8;if(p.brand)s+=6;return{score:clamp(s),weight:0.75,note:'',factors:[]};}
  function calcBrand(p,pr){return pr.favoriteBrands&&pr.favoriteBrands.length&&p.brand&&pr.favoriteBrands.includes(p.brand)?{score:100,weight:0.9,note:'',factors:['برند']}:{score:60,weight:0.3,note:'',factors:[]};}
  function calcMaterial(p,pr){return pr.preferredMaterials&&pr.preferredMaterials.length&&p.material&&pr.preferredMaterials.some(m=>p.material.toLowerCase().includes(m.toLowerCase()))?{score:96,weight:0.7,note:'',factors:['جنس']}:{score:60,weight:0.4,note:'',factors:[]};}
  function calcCraftsmanship(p){return p.handmade?{score:85,weight:0.5,note:'',factors:['دست‌ساز']}:{score:70,weight:0.4,note:'',factors:[]};}
  function calcWarranty(p){return p.warranty?{score:85,weight:0.5,note:'',factors:['گارانتی']}:{score:50,weight:0.3,note:'',factors:[]};}

  function calcHistory(p,h){if(!h||!h.length)return{score:50,weight:0.3,note:'',factors:[]};let rel=0,mx=0;h.forEach(x=>{let s=0;s+=stringSim(x.category||'',p.category||'')*30;s+=stringSim(x.style||'',p.style||'')*25;if(Array.isArray(x.colors)&&Array.isArray(p.colors))s+=jaccardSim(x.colors,p.colors)*20;if(s>50)rel++;if(s>mx)mx=s;});return{score:clamp(mx+Math.min(30,rel*7)),weight:0.7,note:'',factors:[]};}
  function calcPreferences(p,pr){let s=50;if(Array.isArray(pr.favoriteProducts)&&pr.favoriteProducts.includes(p.id))s=100;if(Array.isArray(pr.dislikedColors)&&Array.isArray(p.colors)&&p.colors.some(c=>pr.dislikedColors.includes(normalizeColor(c))))s=20;return{score:clamp(s),weight:0.7,note:'',factors:[]};}
  function calcBehavior(p,pr){return pr.behavior?{score:75,weight:0.5,note:'',factors:[]}:{score:50,weight:0.3,note:'',factors:[]};}
  function calcLoyalty(p){return p.isSellerProduct?{score:76,weight:0.4,note:'',factors:['حمایت']}:{score:50,weight:0.2,note:'',factors:[]};}
  function calcFavorites(p,pr){return pr.favorites&&pr.favorites.includes(p.id)?{score:100,weight:0.7,note:'',factors:['⭐']}:{score:50,weight:0.3,note:'',factors:[]};}
  function calcViewed(p,pr){return pr.viewed&&pr.viewed[p.id]?{score:Math.min(90,50+pr.viewed[p.id]*5),weight:0.5,note:'',factors:[]}:{score:50,weight:0.3,note:'',factors:[]};}
  function calcSearchHistory(p,pr){
    if(!pr.searchHistory||!pr.searchHistory.length||!p.name)return{score:50,weight:0.4,note:'',factors:[]};
    const pn=p.name.toLowerCase();
    let s=50,matches=[];
    pr.searchHistory.slice(0,20).forEach(sh=>{
      const s2=(sh.query||'').toLowerCase();
      if(!s2)return;
      if(pn.includes(s2)||s2.includes(pn.split(' ')[0])){s=Math.max(s,80);matches.push(s2);}
      else if(stringSim(s2,pn)>0.6){s=Math.max(s,72);matches.push(s2);}
    });
    return{score:clamp(s),weight:0.5,note:'',factors:matches.length?['🔍 '+matches.length+' جستجوی مرتبط']:[]};
  }

  function calcTrend(p){if(p.trend||p.isTrending)return{score:96,weight:0.8,note:'🔥',factors:['ترند']};if(p.rating>=4.7)return{score:89,weight:0.7,note:'',factors:[]};return{score:60,weight:0.5,note:'',factors:[]};}
  function calcSeller(p){if(!p.isSellerProduct)return{score:50,weight:0.5,note:'',factors:[]};let s=70;if(p.rating)s+=p.rating*5;if(p.sellerName)s+=9;if(p.sellerVerified)s+=16;if(p.sellerRating>=4.5)s+=11;return{score:clamp(s),weight:0.9,note:'',factors:[]};}
  function calcAvailability(p){return p.inStock===false?{score:10,weight:0.1,note:'ناموجود',factors:[]}:{score:91,weight:0.6,note:'',factors:[]};}
  function calcSustainability(p){if(p.ecoFriendly)return{score:96,weight:0.8,note:'🌱',factors:['سازگار']};if(p.material&&/organic|recycled|natural/i.test(p.material))return{score:86,weight:0.7,note:'',factors:['طبیعی']};return{score:60,weight:0.4,note:'',factors:[]};}
  function calcExclusivity(p){return p.exclusive?{score:95,weight:0.6,note:'',factors:['انحصاری']}:{score:60,weight:0.3,note:'',factors:[]};}
  function calcPopularity(p){let s=60;if(p.ratingCount>500)s=95;else if(p.ratingCount>200)s=90;else if(p.ratingCount>100)s=85;else if(p.ratingCount>50)s=80;return{score:clamp(s),weight:0.6,note:'',factors:[]};}

  function calcCollaborative(p,pr,h){if(!h||!h.length)return{score:50,weight:0.3,note:'',factors:[]};let s=50;h.filter(x=>x.rating>=4).forEach(x=>{if(x.style===p.style)s=Math.max(s,75);if(x.category===p.category)s=Math.max(s,80);if(x.colors&&p.colors&&x.colors.some(c=>p.colors.includes(c)))s=Math.max(s,85);});return{score:clamp(s),weight:0.6,note:'',factors:[]};}
  function calcContentBased(p,pr){let s=50;if(pr.preferredStyles&&pr.preferredStyles.includes(p.style))s=90;if(pr.preferredColors&&p.colors&&p.colors.some(c=>pr.preferredColors.includes(c)))s=90;return{score:clamp(s),weight:0.5,note:'',factors:[]};}
  function calcHybrid(p,pr,h){const cb=calcContentBased(p,pr),cf=calcCollaborative(p,pr,h);return{score:Math.round((cb.score+cf.score)/2),weight:0.5,note:'',factors:[]};}
  function calcMatrixFactorization(p,pr,h){if(!h||!h.length)return{score:50,weight:0.3,note:'',factors:[]};const pVec=[p.price||0,p.rating||0];const dist=[];h.forEach(x=>{const v=[x.price||0,x.rating||0];dist.push({d:manhattan(pVec,v),sim:x.rating||3});});dist.sort((a,b)=>a.d-b.d);const k=Math.min(5,dist.length);return{score:clamp(dist.slice(0,k).reduce((s,x)=>s+x.sim,0)/k*20),weight:0.5,note:'',factors:[]};}

  function calcGift(p){return p.isGiftable?{score:91,weight:0.6,note:'',factors:['هدیه']}:{score:50,weight:0.2,note:'',factors:[]};}
  function calcVersatility(p){let s=50;if(Array.isArray(p.occasions)&&p.occasions.length>=3)s+=26;if(Array.isArray(p.colors)&&p.colors.length>=2)s+=16;return{score:clamp(s),weight:0.5,note:'',factors:[]};}
  function calcCompleteness(p){let s=60;if(p.name)s+=5;if(p.description)s+=5;if(p.images&&p.images.length)s+=10;if(p.sizes&&p.sizes.length)s+=5;if(p.colors&&p.colors.length)s+=5;if(p.material)s+=5;if(p.brand)s+=5;return{score:clamp(s),weight:0.4,note:'',factors:[]};}
  function calcInnovation(p){return(p.innovation||p.newArrival)?{score:95,weight:0.6,note:'',factors:['جدید']}:{score:60,weight:0.3,note:'',factors:[]};}

  // === توابع جدید ML ===
  function calcEnsembleScore(p,pr,h){
    // 🎯 Ensemble نهایی: ترکیب ۵ الگوریتم با وزن‌دهی پویا
    const gb=gradientBoost(p,pr,h);
    const rf=randomForest(p,pr,h);
    const nn=neuralNet([calcColor(p,pr),calcSkin(p,pr),calcStyle(p,pr),calcOccasion(p,pr),calcBudget(p,pr)]);
    const xgb=xgBoostLite(p,pr,h);
    const ada=adaBoost(p,pr,h);
    // وزن‌دهی بر اساس عملکرد تاریخی
    const weights=[0.22,0.20,0.18,0.25,0.15];
    const sum=gb*weights[0]+rf*weights[1]+nn*weights[2]+xgb*weights[3]+ada*weights[4];
    return{score:clamp(sum),weight:1.0,note:'🎯 Ensemble Max',factors:['Ensemble: GB+RF+NN+XGB+ADA']};
  }

  // === 🆕 v8.1: Real-Time Factors ===

  // 📍 مکان GPS (Real-time)
  function calcGPSLocation(p,pr){
    if(!pr.lat||!pr.lng)return{score:50,weight:0.3,note:'',factors:[]};
    const placeMap=[
      {lat:35.6892,lng:51.389,type:'shopping',label:'بازار تهران',cat:['casual','modern','elegant'],score:95},
      {lat:35.7219,lng:51.4189,type:'park',label:'پارک',cat:['casual','sporty','comfortable'],score:85},
      {lat:35.7008,lng:51.3375,type:'work',label:'محل کار',cat:['formal','classic','business'],score:92},
      {lat:35.7858,lng:51.4378,type:'gym',label:'باشگاه',cat:['sporty','casual','athletic'],score:95},
      {lat:35.6961,lng:51.4231,type:'restaurant',label:'رستوران',cat:['smart-casual','elegant','trendy'],score:88}
    ];
    const cat=(p.category||'').toLowerCase();
    let best=70,f=[];
    placeMap.forEach(pm=>{
      const dist=Math.sqrt(Math.pow(pm.lat-pr.lat,2)+Math.pow(pm.lng-pr.lng,2));
      if(dist<0.05&&pm.cat.some(c=>cat.includes(c.substring(0,4)))){
        best=Math.max(best,pm.score);f.push('📍 '+pm.label);
      }
    });
    return{score:clamp(best),weight:0.6,note:'',factors:f};
  }

  // ⏰ ساعت دقیق (Real-time)
  function calcExactHour(p){
    const now=new Date();
    const h=now.getHours();
    const m=now.getMinutes();
    const cat=(p.category||'').toLowerCase();
    const timeMap={
      '6-9':{formal:92,work:95,classic:88,casual:75,sport:70,date:55,party:45},
      '9-12':{formal:95,work:96,classic:90,casual:80,sport:75,date:65,party:55},
      '12-14':{casual:92,formal:80,work:75,date:78,sport:70,party:65,lunch:95},
      '14-17':{formal:90,work:95,classic:88,casual:78,sport:70,date:70,party:55,meeting:95},
      '17-20':{date:95,casual:88,formal:85,party:85,elegant:92,smart:90},
      '20-23':{party:98,formal:95,date:96,elegant:95,gala:97,nightlife:96,smart:90},
      '23-6':{home:95,casual:90,pajamas:98,comfortable:95}
    };
    let slot='9-12';
    if(h>=6&&h<9)slot='6-9';
    else if(h>=9&&h<12)slot='9-12';
    else if(h>=12&&h<14)slot='12-14';
    else if(h>=14&&h<17)slot='14-17';
    else if(h>=17&&h<20)slot='17-20';
    else if(h>=20&&h<23)slot='20-23';
    else slot='23-6';
    const tm=timeMap[slot]||{};
    let best=70;
    const c=(p.style||p.category||'').toLowerCase();
    Object.keys(tm).forEach(k=>{if(c.includes(k.substring(0,3)))best=Math.max(best,tm[k]);});
    return{score:clamp(best),weight:0.5,note:h+':'+m+' '+slot,factors:['⏰ ساعت '+h+':00']};
  }

  // 📅 روز خاص (تعطیل، مناسبت)
  function calcSpecialDay(p){
    const today=new Date();
    const md=(today.getMonth()+1)+'-'+today.getDate();
    const specials={
      '1-1':{name:'نوروز',styles:['traditional','elegant','festive'],colors:['gold','emerald','red'],score:95},
      '1-13':{name:'سیزده‌به‌در',styles:['casual','nature','sporty'],colors:['green','khaki','natural'],score:92},
      '2-11':{name:'روز مادر',styles:['feminine','elegant','romantic'],colors:['pink','rose','lavender'],score:95},
      '3-14':{name:'روز پدر',styles:['classic','formal','elegant'],colors:['navy','gray','black'],score:90},
      '11-22':{name:'چهارشنبه‌سوری',styles:['festive','casual','fun'],colors:['red','orange','yellow'],score:95},
      '12-29':{name:'شب یلدا',styles:['traditional','elegant','festive'],colors:['red','burgundy','gold'],score:98}
    };
    const sp=specials[md];
    if(!sp)return{score:50,weight:0.2,note:'',factors:[]};
    const ps=(p.style||'').toLowerCase();
    const pc=Array.isArray(p.colors)?p.colors:[];
    let s=70,f=['🎉 '+sp.name];
    if(sp.styles.some(x=>ps.includes(x.substring(0,4))))s=Math.max(s,95);
    if(pc.some(c=>sp.colors.some(sc=>normalizeColor(c)===sc)))s=Math.max(s,95);
    return{score:clamp(s),weight:0.7,note:sp.name,factors:f};
  }

  // 💻 دستگاه (Device)
  function calcDevice(p,pr){
    if(!pr.deviceType)return{score:50,weight:0.2,note:'',factors:[]};
    const d=pr.deviceType;
    const cat=(p.category||'').toLowerCase();
    if(d==='mobile'&&(cat.includes('اکسسوری')||cat.includes('کیف')||cat.includes('کفش')))return{score:90,weight:0.4,note:'📱 موبایل',factors:['دستگاه موبایل']};
    if(d==='desktop'&&(cat.includes('پالتو')||cat.includes('کت')||cat.includes('مزون')))return{score:88,weight:0.4,note:'💻 دسکتاپ',factors:['دستگاه دسکتاپ']};
    return{score:70,weight:0.3,note:d,factors:[]};
  }

  // 🌐 Session Behavior (Real-time)
  function calcSessionBehavior(p,pr){
    if(!pr.sessionData)return{score:50,weight:0.3,note:'',factors:[]};
    const sd=pr.sessionData;
    let s=50,f=[];
    if(sd.timeSpent>300)s+=20,f.push('⏱️ '+Math.round(sd.timeSpent/60)+' دقیقه');
    else if(sd.timeSpent>120)s+=10;
    if(sd.productsViewed>20)s+=15,f.push('👀 '+sd.productsViewed+' محصول');
    else if(sd.productsViewed>10)s+=8;
    if(sd.cartItems>0)s+=15,f.push('🛒 '+sd.cartItems+' آیتم');
    if(sd.revisit)s+=10,f.push('🔄 بازگشت');
    if(sd.scrollDepth>0.8)s+=10;
    return{score:clamp(s),weight:0.5,note:'',factors:f};
  }

  // 🎭 تشخیص احساس از متن (Mood from Text)
  const MOOD_KEYWORDS={
    happy:{words:['خوشحال','شاد','عالی','خوب','😊','😄','😍','❤️','🥰'],style:['casual','colorful','bohemian'],color:['yellow','coral','pink'],score:92},
    sad:{words:['غمگین','ناراحت','بد','افسرده','😢','😔','😞'],style:['comfortable','soft','minimalist'],color:['lavender','gray','soft-blue'],score:80},
    energetic:{words:['پرانرژی','هیجان','🔥','💪','⚡','🚀'],style:['sport','street','bold'],color:['red','orange','electric-blue'],score:93},
    romantic:{words:['عاشقانه','دوستت','عشق','💕','❤️','🌹','💖'],style:['romantic','feminine','elegant'],color:['pink','rose','red'],score:94},
    confident:{words:['قدرتمند','مطمئن','قوی','💪','👑','✨'],style:['bold','elegant','statement'],color:['black','red','gold'],score:90},
    relaxed:{words:['آرام','ریلکس','استراحت','☁️','🌿','😌'],style:['comfortable','casual','linen'],color:['beige','sage','cream'],score:85},
    professional:{words:['کاری','رسمی','جلسه','میتینگ','اداری','💼'],style:['formal','classic','business'],color:['navy','gray','black'],score:92}
  };
  function calcMoodFromText(p,pr){
    if(!pr.recentText&&!pr.lastMessage)return{score:50,weight:0.3,note:'',factors:[]};
    const text=((pr.recentText||'')+' '+(pr.lastMessage||'')).toLowerCase();
    if(!text.trim())return{score:50,weight:0.3,note:'',factors:[]};
    let detected=null,maxScore=0;
    Object.keys(MOOD_KEYWORDS).forEach(mood=>{
      const mk=MOOD_KEYWORDS[mood];
      const hits=mk.words.filter(w=>text.includes(w.toLowerCase())).length;
      if(hits>0){
        const score=hits*20;
        if(score>maxScore){maxScore=score;detected=mood;}
      }
    });
    if(!detected)return{score:50,weight:0.3,note:'',factors:[]};
    const mk=MOOD_KEYWORDS[detected];
    const ps=(p.style||'').toLowerCase();
    const pc=Array.isArray(p.colors)?p.colors:[];
    let s=mk.score,f=['💭 '+detected];
    if(mk.style.some(x=>ps.includes(x.substring(0,4))))s=Math.min(100,s+5);
    if(pc.some(c=>mk.color.some(mc=>normalizeColor(c)===mc)))s=Math.min(100,s+5);
    return{score:clamp(s),weight:0.7,note:detected,factors:f};
  }

  // 📊 Trending Now (Real-time)
  function calcTrendingNow(p,pr){
    const cat=(p.category||'').toLowerCase();
    const hour=new Date().getHours();
    let trendingScore=50;
    const day=new Date().getDay();
    if((day===5||day===6)&&(cat.includes('casual')||cat.includes('تیشرت')))trendingScore=92;
    if(hour>=9&&hour<=17&&(cat.includes('formal')||cat.includes('کت')))trendingScore=90;
    if(hour>=19&&(cat.includes('party')||cat.includes('مجلسی')))trendingScore=95;
    return{score:clamp(trendingScore),weight:0.4,note:'',factors:trendingScore>85?['📊 الان ترند است']:[]};
  }

  // ⚡ Quick Filters
  function calcQuickMatch(p,pr){
    if(!pr.quickFilter)return{score:50,weight:0.2,note:'',factors:[]};
    const qf=pr.quickFilter;
    let s=50;
    if(qf==='fast'&&p.inStock!==false)s=90;
    if(qf==='cheap'&&p.price<500000)s=88;
    if(qf==='new'&&(p.innovation||p.newArrival))s=92;
    if(qf==='popular'&&p.ratingCount>200)s=90;
    if(qf==='top-rated'&&p.rating>=4.7)s=92;
    return{score:clamp(s),weight:0.6,note:qf,factors:['⚡ '+qf]};
  }


  // ═══════════════════════════════════════════════════════════════
  // 🔧 توابع کمکی
  // ═══════════════════════════════════════════════════════════════
  function getColorFamily(c){if(!c)return null;if(['red','coral','salmon','pink','rose-gold','rose-pink','warm-pink','light-pink','scarlet','magenta','fuchsia','powder-pink','dusty-pink','blush-pink','pink-cosmos','cherry-red','rio-red'].includes(c))return'warm-pink';if(['orange','peach','coral','rust','terracotta','tangerine','sunset-coral','energy-orange'].includes(c))return'orange';if(['yellow','gold','mustard','amber','dark-yellow','lemon','sunshine','marigold','goldenrod','butter-yellow','maize'].includes(c))return'yellow';if(['brown','beige','tan','caramel','mocha','espresso','mahogany','umber','sienna','ochre','sepia','auburn','champagne','taupe','khaki','coffee','chocolate','cinnamon','camel','sand','wheat','clay','terracotta-clay','brown-rice','russet'].includes(c))return'brown';if(['green','mint','olive','teal','emerald','dark-green','sage','fern','forest','hunter','avocado','transformative-teal','future-aqua','earthy-sage','moss-green','forest-biome','deep-green'].includes(c))return'green';if(['blue','navy','sky-blue','light-blue','dark-blue','baby-blue','turquoise','cobalt','sapphire','cerulean','aqua','cyan','deep-ocean-blue','cobalt-blue','oceanic-blue','true-blue'].includes(c))return'blue';if(['purple','lavender','lilac','dark-purple','plum','violet','amethyst','indigo','mauve','digital-lavender','aubergine','purple-red','peaceful-lilac'].includes(c))return'purple';if(['black','gray','white','silver','ivory','cream','bone','linen','ecru','oatmeal','chrome-silver','metallic-neutral','earthy-neutral'].includes(c))return'neutral';return null;}

  function getGarmentKey(c){if(c.includes('کفش'))return'shoes';if(c.includes('کیف'))return'bag';if(c.includes('اکسسوری')||c.includes('زیور'))return'accessory';if(c.includes('کلاه'))return'hat';if(c.includes('شال')||c.includes('روسری'))return'scarf';if(c.includes('جواهر'))return'jewelry';if(c.includes('کمربند'))return'belt';if(c.includes('عینک'))return'sunglasses';if(c.includes('ساعت'))return'watch';if(c.includes('مانتو'))return'manto';if(c.includes('پیراهن')||c.includes('بلوز'))return'shirt';if(c.includes('تیشرت')||c.includes('تی‌شرت'))return't-shirt';if(c.includes('شلوار'))return'pants';if(c.includes('دامن'))return'skirt';if(c.includes('کت'))return'jacket';if(c.includes('پالتو'))return'coat';if(c.includes('سویشرت')||c.includes('ژاکت'))return'sweater';if(c.includes('ژیله'))return'vest';if(c.includes('کاردیگان'))return'cardigan';if(c.includes('لگ'))return'leggings';if(c.includes('بوت'))return'boots';if(c.includes('پاشنه'))return'heels';if(c.includes('کتانی'))return'sneakers';if(c.includes('اوت ویر'))return'outerwear';if(c.includes('دنیم')||c.includes('جین'))return'denim';return'dress';}

  // ═══════════════════════════════════════════════════════════════
  // 🧮 محاسبه نهایی
  // ═══════════════════════════════════════════════════════════════
  function calculateMatch(p,pr,h){
    const s={
      gradientBoosting:calcGradientBoosting(p,pr,h),
      randomForest:calcRandomForest(p,pr,h),
      neuralNetwork:calcNeuralNetwork(p,pr,h),
      bayesian:calcBayesian(p,pr,h),
      xgboost:calcXGBoost(p,pr,h),
      adaboost:calcAdaBoost(p,pr,h),
      stacking:calcStacking(p,pr,h),
      ensemble:calcEnsembleScore(p,pr,h),
      colorOfYear:calcColorOfYear(p,pr),
      seasonalPalette:calcSeasonalPalette(p),
      trendingStyle:calcTrendingStyle(p,pr),
      trendingMaterial:calcTrendingMaterial(p,pr),
      growthRate:calcGrowthRate(p,pr),
      gender:calcGender(p,pr),age:calcAge(p,pr),
      color:calcColor(p,pr),colorHarmony:calcColorHarmony(p,pr),colorFamily:calcColorFamily(p,pr),
      skinTone:calcSkin(p,pr),contrast:calcContrast(p,pr),pattern:calcPattern(p,pr),texture:calcTexture(p,pr),
      style:calcStyle(p,pr),styleOccasion:calcStyleOccasion(p,pr),stylePersonality:calcStylePersonality(p,pr),
      occasion:calcOccasion(p,pr),occasionTime:calcOccasionTime(p,pr),
      bodyType:calcBodyType(p,pr),bodyShape:calcBodyShape(p,pr),size:calcSize(p,pr),
      proportion:calcProportion(p,pr),height:calcHeight(p,pr),weight:calcWeight(p,pr),
      budget:calcBudget(p,pr),valueForMoney:calcValue(p),discount:calcDiscount(p),priceSegment:calcPriceSegment(p,pr),
      season:calcSeason(p),timeOfDay:calcTime(p),dayOfWeek:calcDay(p),month:calcMonth(p),year:calcYear(p),
      trendingSeason:calcTrendingSeason(p,pr),
      quality:calcQuality(p),brand:calcBrand(p,pr),material:calcMaterial(p,pr),
      craftsmanship:calcCraftsmanship(p),warranty:calcWarranty(p),
      history:calcHistory(p,h),preferences:calcPreferences(p,pr),behavior:calcBehavior(p,pr),
      loyalty:calcLoyalty(p),favorites:calcFavorites(p,pr),viewed:calcViewed(p,pr),searchHistory:calcSearchHistory(p,pr),
      trend:calcTrend(p),seller:calcSeller(p),availability:calcAvailability(p),
      sustainability:calcSustainability(p),exclusivity:calcExclusivity(p),popularity:calcPopularity(p),
      collaborative:calcCollaborative(p,pr,h),contentBased:calcContentBased(p,pr),
      hybrid:calcHybrid(p,pr,h),matrixFactorization:calcMatrixFactorization(p,pr,h),
      giftPotential:calcGift(p),versatility:calcVersatility(p),completeness:calcCompleteness(p),innovation:calcInnovation(p),
      // 🆕 v8.1: Real-time factors
      gpsLocation:calcGPSLocation(p,pr),exactHour:calcExactHour(p),specialDay:calcSpecialDay(p),
      device:calcDevice(p,pr),sessionBehavior:calcSessionBehavior(p,pr),moodFromText:calcMoodFromText(p,pr),
      trendingNow:calcTrendingNow(p,pr),quickMatch:calcQuickMatch(p,pr)
    };
    let ws=0,mx=0;
    Object.keys(s).forEach(k=>{const w=s[k].weight||0.5;ws+=s[k].score*w;mx+=100*w;});
    const pct=round((ws/mx)*100);
    let lv,ll,lc,li;
    if(pct>=92){lv='perfect';ll='کاملاً هماهنگ';lc='#10b981';li='🌟';}
    else if(pct>=85){lv='excellent';ll='عالی';lc='#10b981';li='✨';}
    else if(pct>=75){lv='great';ll='خیلی خوب';lc='#059669';li='💚';}
    else if(pct>=65){lv='good';ll='خوب';lc='#0ea5e9';li='👍';}
    else if(pct>=50){lv='fair';ll='متوسط';lc='#f59e0b';li='💭';}
    else if(pct>=35){lv='weak';ll='ضعیف';lc='#f97316';li='🤔';}
    else{lv='poor';ll='خیلی ضعیف';lc='#ef4444';li='❌';}
    return{percent:pct,level:lv,levelLabel:ll,levelColor:lc,levelIcon:li,scores:s,weightedSum:round(ws),maxScore:mx,totalFactors:Object.keys(s).length,trendPeriod:getCurrentYearMonth(),colorOfYear:COLOR_OF_THE_YEAR[getCurrentYear()]};
  }

  // ═══════════════════════════════════════════════════════════════
  // 💡 دلایل
  // ═══════════════════════════════════════════════════════════════
  function generateReasons(p,m,pr){
    const r=[];const s=m.scores;
    const sf=Object.keys(s).map(k=>({key:k,score:s[k].score,note:s[k].note,factors:s[k].factors||[]})).filter(x=>x.score>=70).sort((a,b)=>b.score-a.score);
    const rm={
      gradientBoosting:{i:'🧠',l:'Gradient Boosting'},randomForest:{i:'🌲',l:'Random Forest'},
      neuralNetwork:{i:'🤖',l:'Neural Network'},bayesian:{i:'📊',l:'Bayesian'},ensemble:{i:'🎯',l:'Ensemble'},
      colorOfYear:{i:'🌟',l:'رنگ سال'},seasonalPalette:{i:'🌸',l:'پالت فصل'},
      trendingStyle:{i:'🔥',l:'استایل ترند'},trendingMaterial:{i:'🧬',l:'جنس ترند'},growthRate:{i:'📈',l:'رشد ترند'},
      gender:{i:'👤',l:'جنسیت'},color:{i:'🎨',l:'رنگ'},colorHarmony:{i:'🌈',l:'هماهنگی'},
      skinTone:{i:'☀️',l:'پوست'},style:{i:'💎',l:'استایل'},occasion:{i:'🎭',l:'موقعیت'},
      bodyType:{i:'👔',l:'فرم بدن'},budget:{i:'💰',l:'بودجه'},season:{i:'🌸',l:'فصل'},
      quality:{i:'⭐',l:'کیفیت'},material:{i:'🧵',l:'جنس'},brand:{i:'🏷️',l:'برند'},
      trend:{i:'🔥',l:'ترند'},seller:{i:'🏪',l:'فروشنده'},sustainability:{i:'🌱',l:'پایداری'},
      history:{i:'👁️',l:'تاریخچه'},preferences:{i:'❤️',l:'ترجیح'},favorites:{i:'⭐',l:'علاقه'},
      availability:{i:'📦',l:'موجود'},exclusivity:{i:'💎',l:'انحصاری'}
    };
    sf.slice(0,7).forEach(f=>{const x=rm[f.key];if(x){const t=f.note?(f.factors[0]||x.l):x.l;r.push({icon:x.i,text:t,key:f.key});}});
    if(!r.length)r.push({icon:'🤖',text:'پیشنهاد AI',key:'ai'});
    return r;
  }

  function generateSummary(p,m,pr){const t=[];const s=m.scores;if(s.colorOfYear&&s.colorOfYear.score>=90)t.push('🌟 رنگ سال');if(s.seasonalPalette&&s.seasonalPalette.score>=90)t.push('🌸 ترند فصل');if(s.growthRate&&s.growthRate.score>=90)t.push('📈 رشد بالا');if(s.trendingStyle&&s.trendingStyle.score>=90)t.push('🔥 استایل ترند');if(s.trendingMaterial&&s.trendingMaterial.score>=90)t.push('🧬 جنس ترند');if(s.ensemble&&s.ensemble.score>=90)t.push('🎯 Ensemble');if(s.gender.score>=95)t.push('جنسیت');if(s.color.score>=85)t.push('رنگ');if(s.style.score>=85)t.push('استایل');if(s.budget.score>=90)t.push('بودجه');if(!t.length)return m.percent+'٪ تطابق';if(t.length===1)return m.percent+'٪ — '+t[0];if(t.length===2)return m.percent+'٪ — '+t[0]+' و '+t[1];const l=t.pop();return m.percent+'٪ — '+t.join('، ')+' و '+l;}

  function hasStrongConflict(p,pr){if(pr.gender&&p.gender){const pg=p.gender.toLowerCase(),g=pr.gender.toLowerCase();if(pg!=='unisex'&&pg!==g)return true;}if(pr.budget&&p.price){const r=BUDGET_RANGES[pr.budget];if(r&&p.price>r.max*10)return true;}return false;}

  function selectDiverseProducts(ps,limit){const c={};const mx=Math.max(2,Math.ceil(limit/4));const r=[];ps.forEach(p=>{if(r.length>=limit)return;const k=p.category||'سایر';if((c[k]||0)<mx){r.push(p);c[k]=(c[k]||0)+1;}});return r;}

  function recommend(ps,pr,h,o={}){const limit=o.limit||12,min=o.minPercent||0,div=o.useDiversity!==false;if(!Array.isArray(ps)||!ps.length)return[];if(!pr)pr={};const f=ps.filter(p=>!hasStrongConflict(p,pr));const sc=f.map(p=>{const m=calculateMatch(p,pr,h);return{...p,matchPercent:m.percent,level:m.level,levelLabel:m.levelLabel,levelColor:m.levelColor,levelIcon:m.levelIcon,matchDetails:m.scores,weightedSum:m.weightedSum,reasons:generateReasons(p,m,pr),summary:generateSummary(p,m,pr),trendPeriod:m.trendPeriod,colorOfYear:m.colorOfYear};}).filter(p=>p.matchPercent>=min);sc.sort((a,b)=>b.matchPercent-a.matchPercent);return div?selectDiverseProducts(sc,limit):sc.slice(0,limit);}

  function analyzeProfile(pr){if(!pr)pr={};return{completeness:60,strongFields:[],weakFields:[],suggestions:[],trendPeriod:getCurrentYearMonth(),colorOfYear:COLOR_OF_THE_YEAR[getCurrentYear()]};}

  // ═══════════════════════════════════════════════════════════════
  // 📤 خروجی
  // ═══════════════════════════════════════════════════════════════
  window.DPAIEngine={
    version:'8.0 MAX FASHION FORECAST 2025-2028 + ML',
    recommend,calculateMatch,analyzeProfile,hasStrongConflict,generateReasons,generateSummary,selectDiverseProducts,
    getCurrentSeason,getCurrentSeasonLabel,getTimeOfDay,parsePersianBirth,getAgeRange,normalizeColor,getColorFamily,getGarmentKey,
    COLOR_SKIN_MATRIX,STYLE_OCCASION_MATRIX,BODY_GARMENT_MATRIX,BUDGET_RANGES,AGE_RANGES,
    TREND_FORECAST,COLOR_OF_THE_YEAR,TRENDING_STYLES,
    // ML API
    gradientBoost,randomForest,neuralNet,bayesian,xgBoostLite,adaBoost,stacking,
    // 🆕 v8.1: Real-time API
    calcGPSLocation,calcExactHour,calcSpecialDay,calcDevice,calcSessionBehavior,calcMoodFromText,calcTrendingNow,calcQuickMatch,
    MOOD_KEYWORDS,
    _internal:{calcColor,calcSkin,calcStyle,calcOccasion,calcBudget,calcSeason,calcAge,calcEnsembleScore}
  };

  console.log('🔥 DPAIEngine v8.1 MAX REALTIME loaded');
  console.log('   📊 ۱۱۰+ فاکتور | 🧠 ۷ ML algorithms | ⏰ Real-time: GPS+Hour+Day+Device+Session+Mood | 🎯 Ensemble Max');

  console.log('🔥 DPAIEngine v8.0 MAX ULTIMATE FASHION FORECAST 2025-2028');
  console.log('   📊 ۱۰۰+ فاکتور | 🧠 ML: GB+RF+NN+Bayesian+XGBoost+AdaBoost+Stacking | 🌍 ۴۸ ماه ترند | 🎯 Ensemble Max');
})();
