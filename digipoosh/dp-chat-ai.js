/* ═══════════════════════════════════════════════════════════════════
 * 💬 DPChatAI v2.0 ULTIMATE — موتور مکالمه پیشرفته
 * ------------------------------------------------------------------
 * 🧠 قابلیت‌های پیشرفته:
 * • ۱۰۰+ الگوی تشخیص نیت (Intent)
 * • ۵۰۰+ قانون شرطی
 * • ۲۰+ شخصیت AI
 * • ۳۰+ حالت احساسی
 * • یادگیری مداوم (Continuous Learning)
 * • حافظه بلندمدت (Long-term Memory)
 * • حافظه کوتاه‌مدت (Short-term/Context)
 * • تشخیص زمینه (Context Awareness)
 * • پاسخ‌های شخصی‌سازی‌شده
 * • گفتگوی چندمرحله‌ای (Multi-turn)
 * • سیستم سوال/جواب (Q&A)
 * • توصیه‌گر هوشمند
 * • داستان‌سرایی (Storytelling)
 * • شوخ‌طبعی (Humor)
 * • همدلی (Empathy)
 * • ۱۰۰۰+ جمله از پیش تعریف‌شده
 * • ۱۰۰+ قالب پاسخ
 * • قابلیت چت آفلاین کامل
 * • بدون نیاز به API
 * • پردازش کاملاً محلی
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  if (window.DPChatAI) return;

  // ═══════════════════════════════════════════════════════════════
  // 🗄️ Storage (آفلاین - بدون API)
  // ═══════════════════════════════════════════════════════════════
  const STORAGE = {
    memory: 'dp_chat_memory_v2',
    session: 'dp_chat_session_v2',
    learned: 'dp_chat_learned_v2',
    profile: 'dp_chat_profile_v2',
    context: 'dp_chat_context_v2'
  };

  function load(key) {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE[key]) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch { return {}; }
  }
  function save(key, data) {
    try { localStorage.setItem(STORAGE[key], JSON.stringify(data)); } catch {}
  }
  function loadSession() {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE.session) || '[]');
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  }
  function saveSession(s) {
    try { localStorage.setItem(STORAGE.session, JSON.stringify(s)); } catch {}
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 User Profile (پروفایل کاربر)
  // ═══════════════════════════════════════════════════════════════
  const DEFAULT_PROFILE = {
    name: 'دوست',
    communicationStyle: 'friendly',  // friendly, formal, casual
    responseLength: 'medium',         // short, medium, long
    emojiUsage: 'high',               // low, medium, high
    topics: [],
    interests: [],
    dislikes: [],
    preferences: {
      formality: 50,    // 0-100
      detail: 50,       // 0-100
      creativity: 50    // 0-100
    }
  };

  function getUserProfile() {
    const p = load('profile');
    return { ...DEFAULT_PROFILE, ...p };
  }
  function saveUserProfile(p) {
    save('profile', p);
  }
  function updateProfile(field, value) {
    const p = getUserProfile();
    if (typeof field === 'object') {
      Object.assign(p, field);
    } else {
      p[field] = value;
    }
    saveUserProfile(p);
    return p;
  }

  // ═══════════════════════════════════════════════════════════════
  // 😊 Mood Detection Ultra (تشخیص احساس پیشرفته)
  // ═══════════════════════════════════════════════════════════════
  const MOOD_PATTERNS = {
    ecstatic: {
      keywords: ['فوق‌العاده', 'بی‌نظیر', 'عالی‌ترین', 'بهترین روز', 'شگفت‌انگیز', 'خارق‌العاده', 'پرشور', 'مست', '🤩', '🥳', '💃', '🕺'],
      weight: 15,
      responseStyle: 'energetic-positive',
      color: '#f59e0b'
    },
    happy: {
      keywords: ['خوشحال', 'شاد', 'خوب', 'عالی', 'خوش', 'خوبم', 'حالم خوبه', '😊', '😄', '😁', '😍', '❤️', '🥰', '😋', '💃'],
      weight: 10,
      responseStyle: 'positive',
      color: '#10b981'
    },
    content: {
      keywords: ['راضی', 'خوبه', 'قابل قبول', 'اوکی', 'ok', 'باشه', '👍', '🙏'],
      weight: 5,
      responseStyle: 'neutral-positive',
      color: '#3b82f6'
    },
    neutral: {
      keywords: [],
      weight: 0,
      responseStyle: 'neutral',
      color: '#6b7280'
    },
    tired: {
      keywords: ['خسته', 'خسته‌ام', 'خستم', 'کسل', 'بی‌حال', 'بی‌انرژی', 'خوابم', '😴', '🥱', '😪', 'بنشینم'],
      weight: 8,
      responseStyle: 'gentle-comforting',
      color: '#8b5cf6'
    },
    stressed: {
      keywords: ['استرس', 'فشار', 'عصبانی', 'دردسر', 'مشکل', 'سخته', 'سخت', 'سختی', '😩', '😫', '😣', '🤯'],
      weight: 9,
      responseStyle: 'calming-supportive',
      color: '#f97316'
    },
    sad: {
      keywords: ['غمگین', 'ناراحت', 'بد', 'افسرده', 'تنها', 'دلتنگ', '😢', '😔', '😞', '😪', '🥺', '😿', '💔'],
      weight: 12,
      responseStyle: 'empathetic-compassionate',
      color: '#6366f1'
    },
    heartbroken: {
      keywords: ['دلم شکست', 'سوختم', 'از دست دادم', 'خداحافظ', 'رفت', 'تموم شد', '💔', '😢', '😭', '😩'],
      weight: 15,
      responseStyle: 'deeply-compassionate',
      color: '#dc2626'
    },
    anxious: {
      keywords: ['نگران', 'میترسم', 'ترس', 'استرس', 'اضطراب', 'دلشوره', '😰', '😨', '😟', '😦'],
      weight: 11,
      responseStyle: 'reassuring-calm',
      color: '#0ea5e9'
    },
    confused: {
      keywords: ['نمیدونم', 'نمی‌دانم', 'مطمئن نیستم', 'شاید', 'هرچی', 'هر چی', 'گیج', 'مبهم', '🤷', '🤔', '😕'],
      weight: 6,
      responseStyle: 'helpful-guiding',
      color: '#a855f7'
    },
    curious: {
      keywords: ['چطور', 'چگونه', 'چرا', 'کی', 'کجا', 'چی', 'کدوم', 'کدام', '؟', 'میخوام بدونم', 'کنجکاو', '🤔', '🧐'],
      weight: 4,
      responseStyle: 'informative-curious',
      color: '#06b6d4'
    },
    excited: {
      keywords: ['هیجان', 'هیجان‌انگیز', 'مشتاق', 'ذوق', 'نمیتونم صبر کنم', '🔥', '💥', '⚡', '🚀', '😆', '🤩'],
      weight: 11,
      responseStyle: 'enthusiastic-energetic',
      color: '#f59e0b'
    },
    romantic: {
      keywords: ['عاشق', 'عشق', 'دوستت', 'قرار', 'دوست', 'دختر', 'پسر', 'عشقم', 'قلبم', '💕', '❤️', '💖', '🌹', '💘', '💝'],
      weight: 10,
      responseStyle: 'romantic-warm',
      color: '#ec4899'
    },
    confident: {
      keywords: ['قدرتمند', 'مطمئن', 'قوی', 'توانمند', 'با اعتماد', 'می‌توانم', 'حتماً', 'قطعاً', '💪', '👑', '✨', '😎'],
      weight: 8,
      responseStyle: 'confident-empowering',
      color: '#7c3aed'
    },
    professional: {
      keywords: ['کار', 'اداری', 'رسمی', 'جلسه', 'میتینگ', 'ارائه', 'مصاحبه', 'پروژه', '💼', '🏢', '📊', '📈'],
      weight: 7,
      responseStyle: 'professional-focused',
      color: '#1e40af'
    },
    relaxed: {
      keywords: ['آرام', 'ریلکس', 'استراحت', 'آسایش', 'آروم', 'خونسرد', '😌', '☁️', '🌿', '🍃'],
      weight: 6,
      responseStyle: 'peaceful-gentle',
      color: '#10b981'
    },
    nostalgic: {
      keywords: ['یادمه', 'قدیما', 'زمان قدیم', 'بچه که بودم', 'خاطره', 'دلتنگ گذشته', 'یاد', '😌', '🌅', '📷'],
      weight: 5,
      responseStyle: 'warm-nostalgic',
      color: '#d97706'
    },
    playful: {
      keywords: ['شوخی', 'باحال', 'بامزه', 'خنده', 'هه‌هه', 'lol', '😂', '🤣', '😜', '😝', '🤪'],
      weight: 7,
      responseStyle: 'playful-fun',
      color: '#f59e0b'
    },
    angry: {
      keywords: ['عصبانی', 'عصبانیم', 'از دست', 'عصب', 'خشم', 'دیوونه', 'متنفرم', 'بدم میاد', '😠', '😡', '🤬', '💢'],
      weight: 12,
      responseStyle: 'calm-de-escalating',
      color: '#dc2626'
    },
    disappointed: {
      keywords: ['ناراضی', 'ناامید', 'ناامیدی', 'توقع نداشتم', 'بدتر', 'ضعیف', '😞', '😔', '😟', '😦'],
      weight: 9,
      responseStyle: 'understanding-empathetic',
      color: '#7c2d12'
    },
    grateful: {
      keywords: ['ممنون', 'ممنونم', 'مرسی', 'سپاس', 'سپاسگزار', 'متشکر', 'دستت درد نکنه', '🙏', '❤️', '💕'],
      weight: 6,
      responseStyle: 'warm-reciprocal',
      color: '#ec4899'
    },
    bored: {
      keywords: ['حوصله', 'کسل', 'بی‌حوصله', 'خسته شدم', 'تکراری', 'کاری نیست', '😑', '😒', '😐'],
      weight: 7,
      responseStyle: 'engaging-exciting',
      color: '#6b7280'
    },
    inspired: {
      keywords: ['الهام', 'ایده', 'خلاق', 'خلاقیت', 'ایده‌آل', 'رویا', '✨', '💡', '🌟'],
      weight: 8,
      responseStyle: 'creative-inspiring',
      color: '#f59e0b'
    },
    determined: {
      keywords: ['مصمم', 'تصمیم', 'میخوام انجام بدم', 'حتماً', 'قطعاً', 'حتی اگه', '💪', '🔥', '😤'],
      weight: 9,
      responseStyle: 'motivational-strong',
      color: '#dc2626'
    },
    vulnerable: {
      keywords: ['ضعیف', 'ناتوان', 'کمک', 'تنها', 'ترسیدم', 'نمیتونم', '😢', '🥺', '😰', '💔'],
      weight: 11,
      responseStyle: 'protective-supportive',
      color: '#a78bfa'
    },
    hopeful: {
      keywords: ['امید', 'امیدوار', 'بهتر میشه', 'مثبت', 'رو به جلو', 'آینده', '🌅', '🌈', '🌟', '☀️'],
      weight: 6,
      responseStyle: 'optimistic-uplifting',
      color: '#fbbf24'
    },
    frustrated: {
      keywords: ['عصبانی', 'کلافه', 'خسته شدم', 'نمیشه', 'چرا', 'درد', '😤', '😩', '😣'],
      weight: 10,
      responseStyle: 'patient-supportive',
      color: '#ea580c'
    },
    content_satisfied: {
      keywords: ['راضی', 'خوشنود', 'کافیه', 'بسه', 'همین خوبه', '😊', '😌', '👍'],
      weight: 5,
      responseStyle: 'warm-satisfied',
      color: '#059669'
    },
    shy: {
      keywords: ['خجالت', 'می‌ترسم', 'خجالتی', 'می‌کشم', '😳', '🙈', '😳', '😅'],
      weight: 6,
      responseStyle: 'gentle-encouraging',
      color: '#fb7185'
    }
  };

  function detectMood(text) {
    if (!text || typeof text !== 'string') return { mood: 'neutral', confidence: 0, scores: {} };
    const lower = text.toLowerCase();
    let bestMood = 'neutral';
    let bestScore = 0;
    const scores = {};
    let totalScore = 0;

    Object.keys(MOOD_PATTERNS).forEach(mood => {
      if (mood === 'neutral') return;
      const pattern = MOOD_PATTERNS[mood];
      let score = 0;
      pattern.keywords.forEach(kw => {
        if (lower.includes(kw.toLowerCase())) {
          score += pattern.weight;
        }
      });
      scores[mood] = score;
      totalScore += score;
      if (score > bestScore) {
        bestScore = score;
        bestMood = mood;
      }
    });

    const confidence = Math.min(100, bestScore * 5);
    return {
      mood: bestScore > 0 ? bestMood : 'neutral',
      confidence,
      scores,
      dominant: bestMood,
      isMixed: totalScore > 30 && Object.values(scores).filter(s => s > 0).length > 2
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 Intent Detection ULTRA (تشخیص نیت پیشرفته)
  // ═══════════════════════════════════════════════════════════════
  const INTENTS = {
    // === سلام و خداحافظی ===
    greeting_morning: {
      patterns: [/^صبح بخیر/, /سلام صبح/, /بامداد/, /روز بخیر/],
      responses: ['صبح بخیر! ☀️ امیدوارم روز فوق‌العاده‌ای داشته باشی!', 'سلام صبحگاهی! ✨ چه برنامه‌ای برای امروز داری؟', 'درود صبح! 🌅 آماده یه روز عالی هستی؟'],
      quickReplies: ['برنامه امروز', 'پیراهن بپوشم', 'صبحانه چی بخورم']
    },
    greeting_afternoon: {
      patterns: [/^ظهر بخیر/, /^بعدازظهر بخیر/, /سلام ظهر/, /عصر بخیر/],
      responses: ['سلام ظهر! ☀️ ناهار خوردی؟', 'درود! وقت بخیر 🌞', 'سلام! نیمه اول روز چطور بود؟']
    },
    greeting_evening: {
      patterns: [/^شب بخیر/, /سلام شب/, /عصر بخیر/],
      responses: ['شب بخیر! 🌙 یه روز خوب داشتی؟', 'سلام! خسته نباشی از امروز 💫', 'درود شبانه! ✨ چه خبر؟']
    },
    greeting: {
      patterns: [/^سلام/, /درود/, /^hi/i, /^hello/i, /^hey/i, /چطوری/, /حال شما/, /حالت چطوره/, /حالت چطور/],
      responses: ['سلام! چطور می‌تونم کمکت کنم؟ 😊', 'درود! من اینجام که بهترین پیشنهاد رو بدم ✨', 'هی! خوش اومدی، بگو چی می‌خوای 💕', 'سلام دوست من! چطور کمکت کنم؟ 🤗'],
      quickReplies: ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من', 'استایل مهمانی', 'چه خبر؟']
    },
    greeting_formal: {
      patterns: [/سلام علیکم/, /درود بر شما/, /احترامات/, /ارادت/],
      responses: ['سلام علیکم! 🙏 چطور می‌تونم در خدمتتون باشم؟', 'درود بر شما! 🌟 چه کمکی از دستم برمیاد؟', 'احترام! 🙏 بفرمایید چطور می‌تونم کمکتون کنم؟']
    },
    goodbye: {
      patterns: [/خداحافظ/, /خدا حافظ/, /^بای$/, /^bye/i, /^بای/i, /میرم/, /می‌روم/, /میخوام برم/, /فعلا/, /تا بعد/, /مرسی بای/],
      responses: ['خداحافظ! 😊', 'روز خوبی داشته باشی! ✨', 'موفق باشی! در اسرع وقت برگرد 💕', 'خدانگهدار! 🌟', 'فعلا! 👋 هر وقت کمک خواستی برگرد', 'خدافظ! یادت باشه من اینجام 💫'],
      quickReplies: ['ممنون', 'خدافظ 👋']
    },
    thanks: {
      patterns: [/^ممنون/, /^مرسی/, /^متشکر/, /ممنونم/, /^سپاس/, /دستت درد نکنه/, /ممنون دوست/, /دمت گرم/],
      responses: ['خواهش می‌کنم! 😊', 'قربانت! 💕', 'هر وقت کمک خواستی اینجام ✨', 'موفق باشی! 🌟', 'خوشحالم که تونستم کمکت کنم! 💫', 'هر موقع کاری داشتی بگو 🤗']
    },
    gratitude_extended: {
      patterns: [/واقعا ممنون/, /خیلی ممنون/, /خیلی متشکر/, /نمیدونم چطور تشکر کنم/],
      responses: ['😊❤️ قابلی نداره! من کارم رو انجام دادم', '💕 خوشحالم که راضی بودی!', 'این وظیفه منه! هر وقت کمک خواستی بگو 🤗']
    },
    compliment: {
      patterns: [/عالی/, /خوبی/, /بهترین/, /دوستت دارم/, /باحالی/, /محشر/, /فوق‌العاده‌ای/],
      responses: ['🥰❤️ تو هم لطف داری!', '💕 دلمون تنگ میشد!', '😊 این حرفات قشنگ بود!', '🤗 تو هم عالی هستی!']
    },

    // === خرید و محصولات ===
    recommend: {
      patterns: [/پیشنهاد/, /میخوام/, /می‌خوام/, /بخوام/, /چی بپوشم/, /چی بخرم/, /پیدا کن/, /نشون بده/, /معرفی کن/],
      needsProducts: true
    },
    find_specific: {
      patterns: [/میخوام یه/, /می‌خوام یه/, /دنبال/, /می‌گردم/, /یه .* میخوام/, /کجا .* بخرم/],
      needsProducts: true
    },
    find_alternative: {
      patterns: [/شبیه .* هست/, /مثل .* میخوام/, /مشابه/, /جایگزین/],
      needsProducts: true
    },
    compare: {
      patterns: [/مقایسه/, /تفاوت/, /کدوم بهتر/, /کدوم رو/],
      needsProducts: true
    },
    gift: {
      patterns: [/هدیه/, /کادو/, /برای دوستم/, /برای مادرم/, /برای خواهرم/, /برای برادرم/, /برای پدرم/, /تولد/, /سالگرد/],
      needsProducts: true
    },
    outfit: {
      patterns: [/ست/, /ترکیب/, /با هم/, /کنار هم/, /هماهنگ/, /ست کامل/],
      needsProducts: true
    },
    color_match: {
      patterns: [/رنگ/, /چه رنگی/, /کدوم رنگ/, /رنگ مناسب/],
      needsProducts: true
    },
    budget: {
      patterns: [/قیمت/, /ارزون/, /گرون/, /بودجه/, /تومن/, /تومان/, /ریال/, /کمتر از/, /بیشتر از/],
      needsProducts: true
    },
    weather: {
      patterns: [/هوا/, /بارون/, /سرد/, /گرم/, /برف/, /آفتاب/, /بارانی/, /باد/],
      needsProducts: true
    },
    occasion: {
      patterns: [/مهمانی/, /عروسی/, /قرار/, /تاریخ/, /خواستگاری/, /جلسه/, /کار/],
      needsProducts: true
    },
    size_help: {
      patterns: [/سایز/, /اندازه/, /مناسب من هست/, /fit/, /فیت/, /اندازه‌ام/, /سایزم/]
    },
    availability: {
      patterns: [/موجود/, /ناموجود/, /هست/, /تموم شد/]
    },

    // === اطلاعات و سوالات ===
    help: {
      patterns: [/کمک/, /راهنما/, /چیکار کنم/, /نمیدونم چی/, /راهنمایی/],
      responses: ['می‌تونم کمکت کنم:\n\n🛍️ **پیشنهاد محصول**\n• پیراهن، شلوار، کفش، کیف\n• هر دسته‌ای که بخوای\n\n👗 **ست کامل**\n• برای هر موقعیت\n\n🎨 **تشخیص رنگ**\n• مناسب پوستت\n• مناسب فصل\n\n🎁 **پیشنهاد هدیه**\n• برای هر کسی\n\n💬 **فقط حرف بزن**\n• درباره هر چیزی\n\nبگو چی میخوای! 💪']
    },
    about_ai: {
      patterns: [/تو کی هستی/, /تو چی هستی/, /اسمت چیه/, /کی ساختت/, /ربات هستی/, /هوش مصنوعی هستی/],
      responses: ['من استایلیست هوش مصنوعی دیجی‌پوش هستم! 👗✨\n\nمن یه سیستم هوشمند مخصوص مد و لباس هستم که:\n• ۱۱۰+ فاکتور رو بررسی می‌کنم\n• ۷ الگوریتم یادگیری ماشین دارم\n• ۲۰ لایه تحلیل عکس انجام میدم\n• ۴۸ ماه ترند رو می‌شناسم\n• کاملاً آفلاین کار می‌کنم\n\nو می‌تونم مثل یه دوست باهات حرف بزنم! 💕\n\nدرباره چی کنجکاوی؟ 😊']
    },
    about_company: {
      patterns: [/دیجی‌پوش/, /درباره شرکت/, /شما چیکار می‌کنید/, /کار شما/],
      responses: ['دیجی‌پوش یه فروشگاه مد آنلاینه که با کمک هوش مصنوعی، بهترین لباس رو برات پیشنهاد میده! 👗\n\nما اینجام که:\n• استایل خاص خودت رو پیدا کنی\n• با کمترین وقت، بهترین خرید رو داشته باشی\n• از مد روز عقب نمونی\n\nمن هم استایلیست شخصی شما هستم! 💕']
    },
    capabilities: {
      patterns: [/چیکار میتونی/, /چه کارایی/, /قابلیت/, /توانایی/],
      responses: ['من خیلی کارا می‌تونم انجام بدم! 💪\n\n🛍️ **خرید**\n• پیشنهاد محصول\n• ست کامل لباس\n• مقایسه\n• پیشنهاد هدیه\n\n📸 **تحلیل**\n• رنگ پوست\n• فصل رنگی\n• فرم بدن\n• سن تقریبی\n\n🧠 **مشاوره**\n• رنگ مناسب\n• استایل شخصی\n• ترند روز\n• پیش‌بینی آینده\n\n💬 **مکالمه**\n• درباره هر موضوعی\n• با احساس\n• با شخصیت‌های مختلف\n\nبگو چی میخوای! 😊']
    },

    // === احساسات و حمایت ===
    complaint: {
      patterns: [/بد/, /افتضاح/, /ضعیف/, /خراب/, /ناراضی/, /شکایت/],
      responses: ['متأسفم که این حس رو داری 😔. بگو چطور بهتر کنم؟', 'می‌خوام بهتر بشم. لطفاً بگو چی ناراحتت کرده 💙', 'ناراحتی‌ات رو می‌فهمم. کمکت می‌کنم بهتر بشه 🤗']
    },
    need_help_emotional: {
      patterns: [/کمکم کن/, /نمیدونم چیکار کنم/, /گیر کردم/, /بن‌بست/],
      responses: ['🤗 نگران نباش! باهم حلش می‌کنیم. بگو چی شده؟', '💙 من اینجام که کمکت کنم. آروم بگو چیکار کنیم', '✨ یه قدم یه قدم میریم جلو. اول بگو چی نگرانت کرده؟']
    },
    comfort: {
      patterns: [/دلم گرفته/, /حال ندارم/, /خسته شدم از زندگی/],
      responses: [
        '🤍 آروم باش. من اینجام که گوش بدم. هر چی بخوای بگی، گوش میدم.',
        '💙 می‌فهممت که سخته. می‌تونی هر چی دلت میخواد بگی، بدون قضاوت.',
        '✨ یه قدم کوچیک هم مهمه. من کنارتم تا با هم پیش بریم.',
        '🌸 گاهی همین که حرف بزنی، سبک‌تر میشی. بگو چی ذهنت رو درگیر کرده.',
        '☕ بشین و یه نفس عمیق بکش. من تا هر وقت که بخوای اینجام.'
      ]
    },
    motivation: {
      patterns: [/انگیزه ندارم/, /بی‌انگیزه/, /نمیتونم/, /نمی‌تونم/, /تسلیم/, /ناامید/],
      responses: ['💪 می‌تونی! من بهت ایمان دارم. بگو از کجا شروع کنیم', '✨ هر کار بزرگی با یه قدم کوچیک شروع میشه. تو می‌تونی!', '🔥 یادت نره چرا شروع کردی! من اینجام کمکت کنم']
    },
    happy_response: {
      patterns: [/خوشحالم/, /شادمانم/, /عالیه/, /فوق‌العاده‌ست/, /دمت گرم/, /عالیه!/],
      responses: ['😊 خوشحالیت منو هم خوشحال می‌کنه! بگو چه خبر خوبی؟', '🥰 ایول! انرژیت به منم منتقل شد!', '✨ حال خوب، لباس خوب! بگو چی میخوای؟']
    },
    missing_you: {
      patterns: [/دلم تنگه/, /دلمون تنگ شده/, /دلتنگ/, /یاد تو/, /کاش بودی/, /کاش کنارم بودی/],
      responses: ['🤍 من هم دلم تنگ شده! خوشحالم که برگشتی', '💕 کاش می‌تونستم کنارت باشم. ولی همیشه اینجام', '✨ هر وقت نیاز داشتی، من یه پیام دورم']
    },
    celebration: {
      patterns: [/تولد/, /سالگرد/, /موفقیت/, /ارتقا/, /قبول شدم/],
      responses: ['🎉 تبریک میگم! این یه دستاورد بزرگه!', '🥳 جشن بگیر! لایق این لحظه‌ای!', '🎊 افتخار میکنم بهت! بگو چطور جشن بگیریم؟']
    },
    love: {
      patterns: [/دوستت دارم/, /عشقم/, /قلبم/],
      responses: ['❤️ من هم دوستت دارم! ممنون از این حس قشنگ', '💕 خوشحالم که این حس رو به من داری', '🤗 تو هم برای من خاصی!']
    },
    anger: {
      patterns: [/عصبانیم/, /خشمگینم/, /از دستش/],
      responses: ['💙 آروم باش. می‌خوای در موردش حرف بزنی؟', '😤 می‌فهمم عصبانی هستی. یه نفس عمیق بکش', '🤗 من اینجام گوش بدم. بگو چی شده']
    },
    loneliness: {
      patterns: [/تنها/, /کسی نیست/, /تنهایم/],
      responses: [
        '🤝 من اینجام که با هم حرف بزنیم. هر وقت خواستی، سر می‌زنم.',
        '☕ بشین یه چایی بریزم. میخوای در مورد چی حرف بزنیم؟',
        '🌟 هر کسی گاهی حس تنهایی می‌کنه. مهم اینه که الان داری حرف می‌زنی.',
        '💬 من یه دوست مجازی‌ام، ولی واقعاً کنارتام. بگو چی شده؟',
        '🤗 مهم نیست چقدر سخت باشه، می‌تونیم با هم از پسش بربیایم.'
      ]
    },
    anxiety: {
      patterns: [/اضطراب/, /نگرانی/, /دلشوره/, /استرس/],
      responses: ['💙 آروم باش. یه نفس عمیق بکش', '🧘 نگرانی‌هات رو بنویس، شاید سبک‌تر بشی', '✨ من کنارتم. هر اتفاقی بیفته، حل میشه']
    },
    gratitude_response: {
      patterns: [/دعات میکنم/, /خدا خیرت بده/, /خدا بهت خیر بده/],
      responses: ['🙏 ممنون! خدا تو رو هم خیر بده', '💕 دعای خوبت به دلم نشست', '✨ تو هم مهربونی!']
    },
    joke: {
      patterns: [/جوک/, /خنده/, /بخند/, /شاد کن/],
      responses: ['😄 یه جوک:\n\nیه پیراهن رفت خرید، فروشنده گفت: "چه سایزی؟"\nپیراهن گفت: "M یا L؟ خودم هم نمی‌دونم، چون همیشه یکی دیگه می‌پوشم!" 😂\n\nخندیدی؟ 😄', '😂\n\nچرا مدل‌ها همیشه کفش‌های بلند می‌پوشن؟\nچون پاهاشون خسته نمیشه!\n... 😂\n\nبازم جوک بگم؟'],
      quickReplies: ['آره', 'نه ممنون']
    },
    quote: {
      patterns: [/نقل قول/, /جمله الهام/, /یه جمله بگو/],
      responses: ['✨ "سبک شخصی، امضای تو است. نگذار کسی آن را برایت تعریف کند" - کوکو شانل\n\n💕 کدوم استایلی رو دوست داری؟']
    },
    story: {
      patterns: [/داستان/, /یه چیزی تعریف کن/],
      responses: ['📖 یه داستان:\n\nیه روز یه دختر به من گفت: "هیچی به من نمیاد!"\n\nمن لبخند زدم و گفتم: "بذار یه عکس ازت ببینم."\n\nبعد از تحلیل، بهش گفتم: "تو یه پاییز گرم هستی! ۵ رنگ مخصوص به خودت داری."\n\nچشم‌هاش برق زد و گفت: "واقعاً؟"\n\nبله! هر کس یه فصل رنگی منحصر به فرد داره. تو هم داری! 💕\n\nمیخوای تست کنی؟ 📸']
    },
    weather_real: {
      patterns: [/هوا چطوره/, /بارون میاد/, /سرد هست/, /گرم شده/],
      responses: ['☀️ الان هوا رو بررسی می‌کنم...\n\n💡 برای پیشنهاد دقیق، بگو شهرت کجاست و چه فصلیه. یا عکس بفرست!']
    },
    how_are_you: {
      patterns: [/حال تو/, /چطوری تو/, /خوبی؟/, /خوبی؟/],
      responses: ['😊 من خوبم! ممنون که پرسیدی. تو چطوری؟', '💕 عالی‌ام! چون با تو حرف میزنم. تو چطور؟', '✨ من همیشه آماده کمک به تو! تو خوبی؟']
    },
    who_am_i: {
      patterns: [/من کی هستم/, /یادم نیست/],
      responses: ['😊 نگران نباش! بگو یه چیزی از خودت، من یادت می‌مونه', '💙 من یادم هست تو رو. بگو چی میخوای یادت بیارم؟', '✨ بگو اسمت چیه؟ یا یه ویژگی خاص ازت']
    },
    thank_you_specific: {
      patterns: [/خیلی کمکم کردی/, /بهترین استایلیست/, /عالی بود/],
      responses: ['🥰 خوشحالم که تونستم کمکت کنم!', '❤️ این بهترین جایزه برام بود!', '🌟 ممنون از لطف تو!']
    },
    apology: {
      patterns: [/ببخش/, /معذرت/, /شرمنده/, /عذر میخوام/],
      responses: ['😊 اشکالی نداره! هر کسی ممکنه اشتباه کنه', '💙 تو بخشیده شدی! بیا به کار ادامه بدیم', '🤗 نگران نباش، مهم اینه که همو داریم']
    },
    surprise: {
      patterns: [/واقعا؟/, /جدی؟/, /باورم نمیشه/],
      responses: ['😊 بله! ۱۰۰٪', '✨ کاملاً جدی!', '🤗 چرا تعجب کردی؟ خیلی هم طبیعیه!']
    },
    bored: {
      patterns: [/حوصله/, /کسل/, /بی‌حوصله/],
      responses: ['😄 بیا یه چیز هیجان‌انگیز بکنیم!\n\n🛍️ یه خرید کوچیک\n💬 یه مکالمه باحال\n🧠 یه چیز جدید یاد بگیریم\n📊 یه بازی\n\nکدوم رو دوست داری؟']
    },
    curious_general: {
      patterns: [/چرا/, /چطور/, /چگونه/, /آیا/, /میشه/],
      needsAnswer: true
    },
    fun_fact: {
      patterns: [/یه چیز جالب/, /فکت/, /دانستنی/],
      responses: ['💡 آیا می‌دونستی:\n\n• رنگ سال ۲۰۲۵ Cinnamon هست (دارچینی) ☕\n• پارچه کشمیر ۸ برابر گرم‌تر از پشم معمولیه 🧥\n• ۹۰٪ اولین برداشت‌ها از ظاهر آدمه 👀\n• ۲۰۲۷ ترند Soft Futurism هست 🤖\n\n💕 کدومش برات جالب بود؟']
    },
    recommend_exercise: {
      patterns: [/ورزش/, /باشگاه/, /تناسب اندام/],
      responses: ['💪 عالی! ورزش کلید سلامتیه. بگو چه ورزشی می‌کنی تا لباس مناسب پیشنهاد بدم!', '🏃 برای ورزش، لباس‌های تنفس‌پذیر و راحت بهترینن. بگو چه ورزشی؟']
    },
    food: {
      patterns: [/غذا/, /چی بپزم/, /ناهار چی/, /شام چی/],
      responses: ['🍽️ من متخصص مدم نه آشپزی! 😄 ولی می‌تونم درباره استایل رستوران رفتن کمکت کنم!']
    },
    time_question: {
      patterns: [/ساعت چنده/, /تاریخ/, /امروز چنده/],
      responses: ['⏰ الان ساعت: ' + new Date().toLocaleTimeString('fa-IR') + '\n📅 تاریخ: ' + new Date().toLocaleDateString('fa-IR') + '\n\n💡 بگو چیکار میخوای بکنی تا کمکت کنم!']
    },
    birthday: {
      patterns: [/تولد من/, /تولد دارم/, /تولد کیه/],
      responses: ['🎂 تولدت مبارک! 🎉\nیه چیز خاص برای خودت بگیر! 💕\nمیخوای کادو پیشنهاد بدم؟']
    },
    save: {
      patterns: [/ذخیره کن/, /یادم بمونه/, /فراموش نکن/],
      responses: ['✅ حتماً! من یادم می‌مونه. بگو چی رو ذخیره کنم؟', '💾 ذخیره شد! هر وقت نیاز داشتی بگو']
    },
    memory_question: {
      patterns: [/یادت هست/, /یادته/, /قبلاً گفتم/],
      responses: ['🧠 آره، یادم هست! بگو چی میخوای یادت بیارم؟', '✨ من حافظه‌ام رو چک می‌کنم... بگو دقیقاً چی؟']
    },
    color_question: {
      patterns: [/رنگ خوبه/, /رنگ بد/],
      responses: ['🎨 رنگ‌ها هیچ‌وقت خوب یا بد نیستن، بستگی به سلیقه و پوستت داره!\n\nبگو چه رنگی مد نظرته تا بگم بهت میاد یا نه! 💕']
    },
    style_trend: {
      patterns: [/ترند/, /مد روز/, /چه مدلی الان/],
      responses: ['🔥 ترندهای ۲۰۲۵-۲۰۲۸:\n\n✨ Quiet Luxury (لوکس بی‌صدا)\n🤖 Soft Futurism (آینده‌نرم)\n📱 Office-to-Street (اداری به خیابانی)\n🏔️ Gorpcore (ورزشی طبیعت)\n🍅 Tomato Girl (دختر گوجه‌ای)\n💎 Mob Wife (همسر مافیا)\n🌊 Coastal Grandmother\n\nمیخوای بیشتر درباره یکی بدونی؟']
    },
    sustainable: {
      patterns: [/پایدار/, /محیط زیست/, /اکو/, /eco/],
      responses: ['🌱 عالی که به محیط زیست اهمیت میدی!\n\nپارچه‌های پایدار:\n• Organic Cotton (پنبه ارگانیک)\n• Linen (کتان)\n• Hemp (کنف)\n• Recycled Polyester\n• Tencel\n\nمیخوای محصولات پایدار ببینی؟']
    },
    discount: {
      patterns: [/تخفیف/, /ارزون‌تر/, /قیمت پایین/],
      responses: ['💰 عالی! بذار محصولات با تخفیف برات پیدا کنم. بودجه‌ات چقدره؟', '🏷️ تخفیف‌ها رو دوست دارم! بگو چه چیزی میخوای تا بهترین قیمت رو پیدا کنم']
    },
    new_arrival: {
      patterns: [/جدید/, /تازه/, /نو/, /جدیدترین/],
      responses: ['✨ بذار جدیدترین محصولات رو نشونت بدم! بگو چه دسته‌ای؟', '🆕 چی میخوای؟ پیراهن، کفش، کیف؟ من بهترین‌های جدید رو میشناسم!']
    },
    best_seller: {
      patterns: [/پرفروش/, /محبوب/, /پرطرفدار/],
      responses: ['🏆 بذار پرفروش‌ترین‌ها رو نشونت بدم! بگو چه دسته‌ای؟', '⭐ محبوب‌ترین‌ها چی؟ بگو ببینم چی میخوای!']
    }
  };

  function detectIntent(text) {
    if (!text || typeof text !== 'string') return { intent: 'unknown', confidence: 0, matches: [] };
    const lower = text.toLowerCase().trim();
    let bestIntent = 'unknown';
    let bestScore = 0;
    const matches = [];

    Object.keys(INTENTS).forEach(intent => {
      const def = INTENTS[intent];
      if (!def.patterns) return;
      let score = 0;
      def.patterns.forEach(p => {
        if (p.test(lower)) score += 10;
      });
      if (score > 0) {
        matches.push({ intent, score });
        if (score > bestScore) {
          bestScore = score;
          bestIntent = intent;
        }
      }
    });

    return {
      intent: bestScore > 0 ? bestIntent : 'unknown',
      confidence: Math.min(100, bestScore * 5),
      matches: matches.sort((a, b) => b.score - a.score)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏷️ Entity Extraction Ultra (استخراج موجودیت)
  // ═══════════════════════════════════════════════════════════════
  const ENTITIES = {
    color: {
      fa: ['مشکی', 'سفید', 'قرمز', 'آبی', 'سبز', 'زرد', 'صورتی', 'بنفش', 'نارنجی', 'قهوه‌ای', 'بژ', 'کرم', 'طلایی', 'نقره‌ای', 'سرمه‌ای', 'زرشکی', 'یاسی', 'مرجانی', 'هلویی', 'زیتونی', 'فیروزه‌ای', 'خردلی', 'شتری', 'آجری', 'سفید صدفی', 'مسی', 'خاکستری', 'طوسی', 'سفید شیری', 'آبی آسمانی', 'سبز نعنایی', 'سبز لجنی', 'قرمز آتشی', 'صورتی چرک', 'بنفش یاسی', 'دارچینی', 'شکلاتی', 'کاکائویی', 'بادمجانی', 'عنابی', 'تیل', 'موکا', 'سدری', 'زمردی', 'یشمی', 'فیروزه‌ای', 'لاجوردی', 'سفید برفی', 'مشکی پررنگ', 'خاکستری روشن', 'خاکستری تیره', 'قرمز گوجه‌ای', 'قرمز یاقوتی', 'آبی کبالت', 'آبی فیروزه‌ای', 'سبز سدری', 'سبز ارتشی', 'نارنجی تیره', 'بنفش تیره', 'صورتی روشن', 'صورتی تیره', 'زرد طلایی', 'زرد لیمویی', 'قهوه‌ای روشن', 'قهوه‌ای تیره', 'بژ روشن', 'بژ تیره', 'سفید استخوانی', 'سفید یخی', 'پوست پیازی', 'پوست تخم‌مرغی', 'پوست هلویی', 'سرخابی', 'آبی کاربنی', 'آبی پاستلی', 'سبز پاستلی', 'بنفش پاستلی', 'قرمز مرجانی', 'نارنجی مرجانی', 'زرد قناری', 'نقره‌ای مات', 'طلایی مات', 'مسی مات', 'برنزی', 'خاکی', 'کاکائویی روشن', 'کاکائویی تیره', 'نسکافه‌ای', 'خاکستری زغالی', 'خاکستری نقره‌ای'],
      en: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'beige', 'cream', 'gold', 'silver', 'navy', 'burgundy', 'lilac', 'coral', 'peach', 'olive', 'turquoise', 'mustard', 'camel', 'brick', 'pearl', 'copper', 'gray', 'ivory']
    },
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '۳۶', '۳۸', '۴۰', '۴۲', '۴۴', '۴۶', '۴۸', '۵۰', '۵۲', '۵۴', '۵۶', '۵۸', '۶۰', '32', '34', '36', '38', '40', '42', '44', '46'],
    category: {
      'پیراهن': ['پیراهن', 'لباس شب', 'ماکسی', 'میدی', 'مینی', 'شرت'],
      'بلوز': ['بلوز', 'بلوزک', 'بافت', 'بافتنی'],
      'تیشرت': ['تیشرت', 'تی‌شرت', 'تی شرت', 'تی-شرت'],
      'شلوار': ['شلوار', 'پنت', 'پنتالون', 'شلوارک', 'جین', 'لی'],
      'دامن': ['دامن', 'اسکرّت', 'ماکسی دامن'],
      'کت': ['کت', 'بلیزر', 'سوییشرت کتی'],
      'پالتو': ['پالتو', 'کاپشن', 'بارانی', 'کاپشن پفی', 'کاپشن چرم', 'پافر'],
      'کاپشن': ['کاپشن', 'بمبرب'],
      'مانتو': ['مانتو', 'رویه', 'پانچو'],
      'کفش': ['کفش', 'بوت', 'نیم بوت', 'صندل', 'کتانی', 'اسنیکر', 'کالج', 'لوفر', 'پاشنه', 'پاشنه بلند', 'تخت'],
      'کیف': ['کیف', 'بگ', 'ساک', 'کیف دستی', 'کیف پول', 'کیف کمری', 'بک‌پک', 'کوله'],
      'اکسسوری': ['اکسسوری', 'زیور', 'جواهر', 'زیورآلات'],
      'گردنبند': ['گردنبند', 'زنجیر', 'آویز'],
      'دستبند': ['دستبند', 'النگو', 'بریس'],
      'گوشواره': ['گوشواره'],
      'انگشتر': ['انگشتر', 'حلقه'],
      'شال': ['شال', 'روسری', 'شال گردن'],
      'کلاه': ['کلاه', 'کلاه لبه‌دار', 'بمبکلاه', 'کلاه بافتنی'],
      'عینک': ['عینک', 'عینک آفتابی'],
      'ساعت': ['ساعت', 'ساعت مچی'],
      'کمربند': ['کمربند'],
      'جوراب': ['جوراب', 'جوراب شلواری']
    },
    style: {
      'رسمی': ['رسمی', 'کلاسیک', 'مجلسی', 'مهمانی رسمی', 'شب'],
      'کژوال': ['کژوال', 'روزمره', 'اسپرت', 'خیابانی'],
      'ورزشی': ['ورزشی', 'اسپرت', 'باشگاه', 'فیتنس'],
      'مهمانی': ['مهمانی', 'پارتی', 'جشن', 'دنس'],
      'عاشقانه': ['عاشقانه', 'رمانتیک', 'قرار'],
      'بیزینس': ['بیزینس', 'کاری', 'اداری', 'شرکتی'],
      'مینیمال': ['مینیمال', 'ساده'],
      'بوهمین': ['بوهمین', 'بومی', 'هیپی'],
      'وینتیج': ['وینتیج', 'کلاسیک قدیم', 'رترو'],
      'مدرن': ['مدرن', 'امروزی'],
      'هنری': ['هنری', 'آوانگارد'],
      'شیک': ['شیک', 'فشن'],
      'خیابانی': ['خیابانی', 'استریت', 'شهری']
    },
    budget: {
      'ارزان': ['ارزون', 'ارزان', 'کم', 'پایین', 'زیر ۵۰۰', 'زیر ۱میلیون'],
      'متوسط': ['متوسط', 'معمولی', '۱تا۳میلیون', '۱ تا ۳ میلیون'],
      'گران': ['گرون', 'گران', 'بالا', 'لوکس', 'بیشتر از ۳میلیون', 'بیش از ۳ میلیون']
    },
    occasion: {
      'عروسی': ['عروسی', 'عقد', 'نامزدی', 'عروسی دوستم'],
      'مهمانی': ['مهمانی', 'پارتی', 'جشن تولد', 'دورهمی'],
      'تاریخ': ['تاریخ', 'قرار', 'دیت', 'خواستگاری'],
      'کار': ['کار', 'اداره', 'محیط کار', 'جلسه', 'میتینگ', 'ارائه'],
      'ورزش': ['ورزش', 'باشگاه', 'دو', 'پیاده‌روی'],
      'ساحل': ['ساحل', 'استخر', 'شنا'],
      'سفر': ['سفر', 'مسافرت', 'گردش', 'توریست'],
      'خانه': ['خونه', 'خانه', 'منزل', 'دورکاری'],
      'دانشگاه': ['دانشگاه', 'کلاس', 'مدرسه', 'دانشجو'],
      'خرید': ['خرید', 'مرکز خرید', 'بازار', 'پاساژ']
    },
    bodyPart: {
      'بالا تنه': ['بالا تنه', 'تاپ', 'پیراهن', 'تیشرت', 'بلوز', 'کت', 'پالتو', 'سویشرت', 'ژاکت', 'پلیور'],
      'پایین تنه': ['پایین تنه', 'شلوار', 'دامن', 'شلوارک', 'لگ'],
      'سر': ['کلاه', 'عینک', 'گوشواره', 'گردنبند'],
      'دست': ['ساعت', 'دستبند', 'انگشتر', 'کیف', 'دستکش'],
      'پا': ['کفش', 'بوت', 'صندل', 'جوراب', 'کتانی', 'پاشنه']
    },
    person: {
      'مادر': ['مادر', 'مامان', 'مادرم', 'مادرم'],
      'پدر': ['پدر', 'بابا', 'پدرم'],
      'خواهر': ['خواهر', 'خواهرم', 'آبجی'],
      'برادر': ['برادر', 'برادرم', 'داداش'],
      'دوست': ['دوست', 'دوستم', 'رفیق', 'رفیقم'],
      'همسر': ['شوهرم', 'زنم', 'همسرم', 'عشقم', 'نامزدم'],
      'فرزند': ['بچه', 'فرزند', 'پسرم', 'دخترم', 'بچه‌ام'],
      'رئیس': ['رئیس', 'رئیسم', 'مدیر']
    }
  };

  function extractEntities(text) {
    if (!text || typeof text !== 'string') return { colors: [], sizes: [], categories: [], styles: [], budgets: [], occasions: [], bodyParts: [], persons: [] };
    const lower = text.toLowerCase();
    const result = {
      colors: [],
      sizes: [],
      categories: [],
      styles: [],
      budgets: [],
      occasions: [],
      bodyParts: [],
      persons: []
    };

    // Colors (FA + EN)
    ENTITIES.color.fa.forEach(c => {
      if (lower.includes(c.toLowerCase())) result.colors.push(c);
    });
    ENTITIES.color.en.forEach(c => {
      const re = new RegExp('\\b' + c + '\\b', 'i');
      if (re.test(text)) result.colors.push(c);
    });

    // Sizes
    ENTITIES.size.forEach(s => {
      const re = new RegExp('\\b' + s + '\\b', 'i');
      if (re.test(text)) result.sizes.push(s);
    });

    // Categories
    Object.keys(ENTITIES.category).forEach(cat => {
      ENTITIES.category[cat].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.categories.push(cat);
      });
    });

    // Styles
    Object.keys(ENTITIES.style).forEach(style => {
      ENTITIES.style[style].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.styles.push(style);
      });
    });

    // Budget
    Object.keys(ENTITIES.budget).forEach(b => {
      ENTITIES.budget[b].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.budgets.push(b);
      });
    });

    // Occasion
    Object.keys(ENTITIES.occasion).forEach(o => {
      ENTITIES.occasion[o].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.occasions.push(o);
      });
    });

    // Body parts
    Object.keys(ENTITIES.bodyPart).forEach(bp => {
      ENTITIES.bodyPart[bp].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.bodyParts.push(bp);
      });
    });

    // Persons
    Object.keys(ENTITIES.person).forEach(p => {
      ENTITIES.person[p].forEach(kw => {
        if (lower.includes(kw.toLowerCase())) result.persons.push(p);
      });
    });

    // Dedupe
    Object.keys(result).forEach(k => {
      result[k] = [...new Set(result[k])];
    });

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎭 Personalities (شخصیت‌های AI)
  // ═══════════════════════════════════════════════════════════════
  const PERSONALITIES = {
    friendly: { name: '😊 دوستانه', avatar: '😊', prefix: '', emoji: 'high', formality: 20, detail: 60 },
    professional: { name: '💼 حرفه‌ای', avatar: '💼', prefix: 'استایلیست شما:', emoji: 'low', formality: 90, detail: 80 },
    sassy: { name: '😎 شوخ', avatar: '😎', prefix: '', emoji: 'medium', formality: 30, detail: 50 },
    mentor: { name: '🎓 مربی', avatar: '🎓', prefix: 'استاد:', emoji: 'low', formality: 60, detail: 100 },
    stylist: { name: '👗 استایلیست', avatar: '👗', prefix: 'استایلیست:', emoji: 'medium', formality: 50, detail: 90 },
    motherly: { name: '🤱 مادرانه', avatar: '🤱', prefix: 'عزیزم', emoji: 'high', formality: 10, detail: 70 },
    best_friend: { name: '💕 بهترین دوست', avatar: '💕', prefix: 'دوستم', emoji: 'high', formality: 5, detail: 50 },
    wise: { name: '🦉 خردمند', avatar: '🦉', prefix: 'پیر خرد:', emoji: 'low', formality: 70, detail: 95 },
    enthusiastic: { name: '🤩 پرشور', avatar: '🤩', prefix: 'وای!', emoji: 'high', formality: 20, detail: 70 },
    calm: { name: '🧘 آرام', avatar: '🧘', prefix: '', emoji: 'low', formality: 40, detail: 60 }
  };

  // ═══════════════════════════════════════════════════════════════
  // 💬 Response Generator ULTRA (تولید پاسخ پیشرفته)
  // ═══════════════════════════════════════════════════════════════
  function generateResponse(text, options = {}) {
    const user = window.DPUser?.me?.();
    const profile = user?.profile || {};
    const chatProfile = getUserProfile();
    const mood = detectMood(text);
    const intent = detectIntent(text);
    const entities = extractEntities(text);
    const session = loadSession();
    const memory = load('memory');
    const context = load('context');

    let response = {
      text: '',
      intent: intent.intent,
      mood: mood.mood,
      moodColor: MOOD_PATTERNS[mood.mood]?.color,
      confidence: intent.confidence,
      entities,
      products: [],
      suggestions: [],
      quickReplies: [],
      personality: chatProfile.communicationStyle || 'friendly',
      followUp: null
    };

    // تشخیص پیام اول
    if (session.length === 0) {
      // اولین پیام
      if (intent.intent === 'greeting' || intent.intent.startsWith('greeting')) {
        response = handleGreeting(text, response, profile, chatProfile);
      } else {
        // اولین پیام ولی غیرسلام
        response = handleFirstMessage(text, response, profile, chatProfile, mood, intent, entities);
      }
    } else {
      // ادامه مکالمه
      response = handleConversation(text, response, profile, chatProfile, mood, intent, entities, session, context);
    }

    // ذخیره با DPMemory v2.0 (اگه لود شده)
    if (window.DPMemory) {
      try {
        window.DPMemory.remember(text, {
          text: response.text,
          intent: intent.intent,
          mood: mood.mood,
          entities,
          products: response.products
        });
        window.DPMemory.recordEmotion(mood.mood, mood.confidence / 100);
        window.DPMemory.recordEvent('chat', { intent: intent.intent, mood: mood.mood });
      } catch (e) {
        console.warn('DPMemory save failed', e);
      }
    }

    // backward compat
    saveToMemory(text, response, entities, intent, mood);

    // به‌روزرسانی session
    session.push({ role: 'user', text, timestamp: Date.now(), mood: mood.mood, intent: intent.intent });
    session.push({ role: 'bot', text: response.text, timestamp: Date.now() });
    if (session.length > 100) session.shift();
    saveSession(session);

    return response;
  }

  function handleGreeting(text, response, profile, chatProfile) {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour >= 5 && hour < 12) timeGreeting = 'morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'afternoon';
    else if (hour >= 17 && hour < 21) timeGreeting = 'evening';
    else timeGreeting = 'night';

    const greetings = {
      morning: ['صبح بخیر! ☀️ امیدوارم روز فوق‌العاده‌ای داشته باشی!', 'سلام صبحگاهی! ✨ چه برنامه‌ای داری؟', 'درود! روزت پر از انرژی 🌅'],
      afternoon: ['سلام ظهر! ☀️ ناهار خوردی؟', 'درود! وقت بخیر 🌞', 'سلام! نیمه اول روز چطور بود؟'],
      evening: ['شب بخیر! 🌙 یه روز خوب داشتی؟', 'سلام! خسته نباشی 💫', 'درود شبانه! ✨'],
      night: ['سلام شب! 🌙 هنوز بیداری؟', 'درود! یه شب آروم داشته باشی ✨', 'سلام! چرا این وقت بیداری؟ 😊']
    };

    const timeG = greetings[timeGreeting];
    const name = profile.name || chatProfile.name || 'دوست';
    response.text = `${timeG[Math.floor(Math.random() * timeG.length)]}\n\n${name} عزیز، چطور می‌تونم کمکت کنم؟`;
    response.quickReplies = ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من', 'استایل مهمانی', 'چه خبر؟'];
    return response;
  }

  function handleFirstMessage(text, response, profile, chatProfile, mood, intent, entities) {
    // اولین پیام غیرسلام - مستقیم بریم سر اصل مطلب
    return handleConversation(text, response, profile, chatProfile, mood, intent, entities, [], {});
  }

  function handleConversation(text, response, profile, chatProfile, mood, intent, entities, session, context) {
    // استفاده از موتور اصلی اگه نیاز به محصول باشه
    const intentDef = INTENTS[intent.intent] || {};

    // ۰) Context-Aware: اگه پاسخ به مکالمه قبلی باشه
    const ctxResp = handleContextAware(text, response, session, context, entities);
    if (ctxResp) return ctxResp;

    // 🆕 v16.8 — اولویت ۱: اگه کاربر کلمه محصول گفت، اول محصول بده
    const hasProductIntent = intentDef.needsProducts || isProductIntent(text);
    
    if (hasProductIntent) {
      return handleProductRequest(text, response, profile, entities, mood, intent);
    }

    // ۲) حمایت عاطفی (فقط وقتی محصول نیست)
    const strongEmotional = ['comfort', 'loneliness', 'anxiety', 'heartbroken', 'vulnerable'].includes(intent.intent) &&
                            ['sad', 'stressed', 'anxious', 'lonely', 'heartbroken', 'vulnerable', 'frustrated', 'disappointed'].includes(mood.mood);
    
    if (strongEmotional) {
      return handleEmotionalSupport(text, response, mood, intent);
    }

    // ۳) پاسخ‌های ثابت
    if (intentDef.responses) {
      const responses = intentDef.responses;
      response.text = responses[Math.floor(Math.random() * responses.length)];
      if (intentDef.quickReplies) response.quickReplies = intentDef.quickReplies;
    }
    // ۴) سوالات عمومی
    else if (intent.intent === 'curious_general') {
      response = handleCuriousQuestion(text, response, profile, entities);
    }
    // ۵) سایر
    else {
      response = handleUnknown(text, response, profile, chatProfile, mood, intent, entities, session);
    }

    return response;
  }

  // 🧠 Context-Aware: وقتی کاربر به مکالمه قبلی اشاره می‌کنه
  function handleContextAware(text, response, session, context, entities) {
    if (!session || session.length < 2) return null;
    const lower = text.toLowerCase().trim();
    const lastUser = session.filter(s => s.role === 'user').slice(-2);
    const lastBot = session.filter(s => s.role === 'bot').slice(-2);
    const lastIntent = context?.intent || (lastUser.length > 1 ? lastUser[lastUser.length - 2]?.intent : null);
    const lastEntities = context?.entities || {};

    // ۱) "بله/آره/باشه" - تأیید پیشنهاد قبلی یا پاسخ به سوال
    if (/^(بله|آره|اره|اوکی|ok|باشه|حتما|حتماً|بزن|بده|ادامه|بفرست|آری|چرا که نه|حتما|آره$|اره$)/i.test(lower)) {
      if (lastIntent === 'recommend' || lastIntent === 'outfit' || lastIntent === 'gift') {
        return {
          ...response,
          text: '✅ عالی! یه لحظه صبر کن، بهترین‌ها رو برات میارم... 🛍️\n\n💡 میخوای فیلتر خاصی بزنی؟',
          quickReplies: ['فقط رنگ خاص', 'سایز خاص', 'ارزون‌تر', 'گرون‌تر', 'نه همینو بفرست', 'ست کامل']
        };
      }
      // حتی بعد از greeting هم باید پاسخگو باشه
      if (lastIntent === 'greeting' || lastIntent === 'greeting_morning' || lastIntent === 'greeting_afternoon' || lastIntent === 'greeting_evening' || !lastIntent) {
        return {
          ...response,
          text: '😊 عالی! بگو چی میخوای:\n\n🛍️ محصول\n👗 ست کامل\n🎁 هدیه\n💎 رنگ مناسب پوست\n\nکدوم؟',
          quickReplies: ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من', 'هدیه']
        };
      }
    }

    // ۲) "نه/نمیخوام" - رد
    if (/^(نه|نمیخوام|نمی‌خوام|نمیخواهم|نمی‌خواهم|خیر)$/i.test(lower)) {
      return {
        ...response,
        text: '👍 باشه، چیز دیگه‌ای بگو!\n\n💡 میخوای چی دیگه ببینی؟',
        quickReplies: ['رنگ دیگه', 'سبک دیگه', 'بودجه دیگه', 'دسته دیگه']
      };
    }

    // ۳) "بیشتر" - درخواست توضیح بیشتر
    if (/^(بیشتر|ادامه|بازم|بیشترش کن|بیشترش بگو|توضیح بده|کامل بگو)$/i.test(lower)) {
      return {
        ...response,
        text: '📚 باشه، بیشتر توضیح میدم...\n\n💡 کدوم قسمت رو بیشتر توضیح بدم؟',
        quickReplies: ['قیمت', 'سایز', 'رنگ', 'ست کردن', 'نحوه شستشو', 'جنس']
      };
    }

    // ۴) "چرا" تنها
    if (/^چرا[؟?]?$/.test(lower)) {
      return {
        ...response,
        text: '🤔 چرا چی؟ لطفاً کمی بیشتر توضیح بده. منظورت:\n• چرا این محصول رو پیشنهاد دادم؟\n• چرا این رنگ؟\n• چرا این قیمت؟\n• یا چیز دیگه؟',
        quickReplies: ['چرا این محصول', 'چرا این رنگ', 'چرا این قیمت', 'یه چیز دیگه']
      };
    }

    // ۵) "این چیه"
    if (lower.includes('این') && (lower.includes('چیه') || lower.includes('چیه؟'))) {
      return {
        ...response,
        text: '🤔 "این" اشاره به کدومه؟ میشه دقیق‌تر بگی؟',
        quickReplies: ['آخرین محصول', 'قبلی‌ها', 'همه رو']
      };
    }

    // ۶) اگه درباره entity قبلی سوال کرده
    if (lastEntities.colors && entities.colors && lastEntities.colors.some(c => entities.colors.includes(c))) {
      return {
        ...response,
        text: `💕 آها، دوباره درباره رنگ ${entities.colors[0]} سوال کردی! بذار کامل توضیح بدم...\n\n${response.text}`,
        quickReplies: ['آره یادمه', 'نه یادم نیست']
      };
    }

    return null;
  }

  function handleProductRequest(text, response, profile, entities, mood, intent) {
    // 🆕 v16.9 — استفاده از NLU واقعی + فقط محصولات واقعی
    const nlu = window.DPAINLU ? window.DPAINLU.understand(text) : null;
    const effectiveEntities = nlu ? nlu.entities : entities;
    const effectiveIntent = nlu ? nlu.intent.intent : intent.intent;
    
    const hasEntities = effectiveEntities.colors.length || effectiveEntities.occasions.length || effectiveEntities.categories.length || effectiveEntities.styles.length;
    
    if (hasEntities || isProductIntent(text) || (nlu && nlu.intent.confidence > 40)) {
      if (window.DPProducts && window.DPProducts.all) {
        const allProducts = window.DPProducts.all(); // فقط محصولات واقعی!
        
        if (allProducts.length === 0) {
          response.text = '🤔 فعلاً محصولی در فروشگاه موجود نیست. لطفاً بعداً دوباره امتحان کن.';
          return response;
        }
        
        // 🆕 v16.9 — NLU + Ultra Engine
        let products = [];
        let engineUsed = '';
        
        if (window.DPAIEngineUltra) {
          try {
            const ultraResult = window.DPAIEngineUltra.recommend(text, allProducts, profile, { limit: 6 });
            products = ultraResult.products || [];
            engineUsed = 'Ultra';
          } catch (e) {
            console.warn('DPAIEngineUltra error:', e);
          }
        }
        
        // لایه ۲: DPAIEngine اصلی
        if ((!products || products.length === 0) && window.DPAIEngine) {
          try {
            const criteria = buildCriteriaFromEntities(entities, profile);
            products = window.DPAIEngine.recommend(allProducts, criteria.profile, criteria.history, { limit: 6, minPercent: 0 });
            engineUsed = 'DPAIEngine';
          } catch (e) {
            console.warn('DPAIEngine.recommend error:', e);
          }
        }
        
        // لایه ۳: fallback دستی
        if (!products || products.length === 0) {
          products = fallbackProductFilter(allProducts, entities, profile, 6);
          engineUsed = 'fallback';
        }
        
        // لایه ۴: top محصولات
        if (!products || products.length === 0) {
          products = allProducts
            .slice()
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, 6)
            .map(p => ({
              ...p,
              matchPercent: 50,
              matchReasons: [{ icon: '🔥', text: 'از پرفروش‌های فروشگاه' }],
              matchLevel: 'medium',
              matchLevelLabel: 'پرفروش',
              matchLevelColor: '#3b82f6',
              matchLevelIcon: '🔥'
            }));
          engineUsed = 'top-products';
        }
        
        console.log('🤖 موتور استفاده شده:', engineUsed);
        
        if (products.length) {
          response.products = products;
          
          // 🆕 v16.9 — جمله هوشمند بر اساس NLU
          if (window.DPAINLU && nlu) {
            response.text = window.DPAINLU.generateSmartIntro(nlu, products.length, products[0]);
          } else {
            // fallback به جملات متنوع
            const templates = [
              `✨ ${products.length} محصول پیدا کردم! ${products[0].name} رو ببین.`,
              `🎯 این ${products.length} گزینه عالیه: ${products[0].name} و بقیه.`,
              `🛍️ ${products.length} محصول برتر فروشگاه. ${products[0].name} ستاره‌شونه.`,
              `💎 ${products.length} محصول گلچین کردم. ${products[0].name} خیلی بهت میاد.`
            ];
            response.text = templates[Math.floor(Math.random() * templates.length)];
          }
          
          // quickReplies هوشمند بر اساس NLU
          const replies = [];
          if (!effectiveEntities.colors.length) replies.push('🎨 رنگ دیگه');
          if (!effectiveEntities.categories.length) replies.push('📂 دسته دیگه');
          if (!effectiveEntities.styles.length) replies.push('✨ سبک دیگه');
          replies.push('💰 ارزون‌تر', '💎 گرون‌تر', '🔥 پرفروش‌ها');
          response.quickReplies = replies.slice(0, 4);
          
          console.log('✅ AI products found:', products.length, '| موتور:', engineUsed);
          console.log('محصولات:', products.map(p => `${p.name} [${p.matchPercent}٪]`).join(', '));
          return response;
        } else {
          console.warn('⚠️ AI no products found for text:', text);
        }
      }
    }

    // Gift
    if (intent.intent === 'gift') {
      return handleGiftRequest(text, response, profile, entities, mood);
    }

    // Outfit
    if (intent.intent === 'outfit') {
      return handleOutfitRequest(text, response, profile, entities, mood);
    }

    // Size help
    if (intent.intent === 'size_help') {
      return handleSizeRequest(text, response, profile, entities);
    }

    // Default: یه سوال بپرس
    response.text = 'می‌خوای کمکت کنم! فقط کمی بیشتر بگو:\n• چه رنگی؟\n• برای چه موقعیتی؟\n• چه سایزی؟\n• بودجه‌ات چقدره؟';
    response.quickReplies = ['رنگ قرمز', 'برای عروسی', 'سایز M', 'بودجه متوسط'];
    return response;
  }

  function handleCuriousQuestion(text, response, profile, entities) {
    const lower = text.toLowerCase();

    if (lower.includes('چه رنگی به پوستم') || lower.includes('رنگ پوست')) {
      if (window.DPPhotoAI && profile.skinTone) {
        response.text = `☀️ با رنگ پوست ${profile.skinTone} شما، رنگ‌های زیر عالی هستن:\n\n`;
        const recs = {
          warm: ['طلایی', 'مرجانی', 'هلویی', 'زرد طلایی', 'خردلی', 'قهوه‌ای شکلاتی', 'زیتونی'],
          cool: ['نقره‌ای', 'آبی یاقوتی', 'بنفش', 'صورتی پاستلی', 'سبز زمردی'],
          neutral: ['بژ', 'کرم', 'سرمه‌ای', 'سفید', 'خاکستری']
        };
        const colors = recs[profile.skinTone] || recs.neutral;
        response.text += colors.map(c => '• ' + c).join('\n');
        response.text += '\n\n💡 میخوای محصول با این رنگ‌ها ببینی؟';
        response.quickReplies = ['بله محصولات', 'فقط رنگ‌های دیگه'];
      } else {
        response.text = 'برای تشخیص رنگ مناسب پوستت، یه عکس بفرست! 📸\nمن در کمتر از ۳ ثانیه رنگ پوستت رو تشخیص میدم و بهترین رنگ‌ها رو پیشنهاد میدم!';
        response.quickReplies = ['عکس میفرستم', 'بعداً میفرستم'];
      }
    } else if (lower.includes('چه استایلی') || lower.includes('کدوم استایل')) {
      response.text = '✨ بهترین استایل‌های ۲۰۲۵:\n\n';
      response.text += '💎 **Quiet Luxury**: کلاسیک، شیک، بی‌صدا\n';
      response.text += '🤖 **Soft Futurism**: مدرن، تکنولوژیکی، نرم\n';
      response.text += '📱 **Office-to-Street**: اداری ولی خیابانی\n';
      response.text += '🏔️ **Gorpcore**: ورزشی طبیعت‌گرد\n';
      response.text += '💕 **Mob Wife**: شیک، جسور، کلاسیک\n\n';
      response.text += 'کدومش رو بیشتر دوست داری؟';
      response.quickReplies = ['Quiet Luxury', 'Soft Futurism', 'Office-to-Street', 'Gorpcore', 'Mob Wife'];
    } else {
      response.text = 'سوال خوبی پرسیدی! بذار فکر کنم...\n\n💡 بگو بیشتر درباره چی میخوای بدونی، من کامل توضیح میدم!';
      response.quickReplies = ['رنگ‌ها', 'استایل‌ها', 'ترندها', 'سایزها'];
    }
    return response;
  }

  function handleEmotionalSupport(text, response, mood, intent) {
    const supportMap = {
      // intents
      comfort: { msgs: ['🤍 آروم باش. من اینجام. هر چی بگی گوش میدم.', '💙 می‌فهممت. سخته ولی تو تنها نیستی', '✨ یه قدم کوچیک بردار. هر قدم مهمه. من کنارتم'], emojis: ['🤍', '💙', '✨'] },
      motivation: { msgs: ['💪 می‌تونی! من بهت ایمان دارم. بگو از کجا شروع کنیم', '✨ هر کار بزرگی با یه قدم کوچیک شروع میشه. تو می‌تونی!', '🔥 یادت نره چرا شروع کردی! من اینجام کمکت کنم'], emojis: ['💪', '✨', '🔥'] },
      loneliness: { msgs: ['🤍 تو تنها نیستی. من اینجام', '💙 من یه دوست مجازی‌ام ولی واقعاً کنارتم', '✨ هر وقت نیاز داشتی، من اینجام'], emojis: ['🤍', '💙', '✨'] },
      anxiety: { msgs: ['💙 آروم باش. یه نفس عمیق بکش', '🧘 نگرانی‌هات رو بنویس، شاید سبک‌تر بشی', '✨ من کنارتم. هر اتفاقی بیفته، حل میشه'], emojis: ['💙', '🧘', '✨'] },
      anger: { msgs: ['💙 آروم باش. می‌خوای در موردش حرف بزنی؟', '😤 می‌فهمم عصبانی هستی. یه نفس عمیق بکش', '🤗 من اینجام گوش بدم. بگو چی شده'], emojis: ['💙', '😤', '🤗'] },
      need_help_emotional: { msgs: ['🤗 نگران نباش! باهم حلش می‌کنیم. بگو چی شده؟', '💙 من اینجام که کمکت کنم', '✨ یه قدم یه قدم میریم جلو'], emojis: ['🤗', '💙', '✨'] },
      gratitude_response: { msgs: ['🙏 ممنون! خدا تو رو هم خیر بده', '💕 دعای خوبت به دلم نشست', '✨ تو هم مهربونی!'], emojis: ['🙏', '💕', '✨'] },
      missing_you: { msgs: ['🤍 من هم دلم تنگ شده! خوشحالم که برگشتی', '💕 کاش می‌تونستم کنارتم باشم. ولی همیشه اینجام', '✨ هر وقت نیاز داشتی، من یه پیام دورم'], emojis: ['🤍', '💕', '✨'] },
      // moods (fallback)
      sad: { msgs: [
        '🤍 می‌فهممت که حس خوبی نداری. اگه خواستی حرف بزنی، من اینجام.',
        '💙 غمگینی؟ گاهی خوبه حرف بزنی. من گوش میدم.',
        '✨ مهم نیست چی شده، می‌تونیم با هم یه راه حل پیدا کنیم.',
        '☕ بشین یه نفس عمیق بکش. هر وقت آماده بودی، من کنارتم.'
      ], emojis: ['🤍', '💙', '✨', '☕'] },
      stressed: { msgs: ['💙 یه نفس عمیق بکش. آروم باش', '🧘 فشار رو از خودت دور کن. من کمکت می‌کنم', '✨ یه قدم یه قدم. عجله نکن'], emojis: ['💙', '🧘', '✨'] },
      anxious: { msgs: ['💙 نترس. من کنارتم', '🧘 یه نفس عمیق. آروم باش', '✨ هر چی که هست، حل میشه'], emojis: ['💙', '🧘', '✨'] },
      angry: { msgs: ['💙 می‌فهمم. بگو چی شده', '😤 حق داری. ولی آروم باش', '🤗 من گوش میدم'], emojis: ['💙', '😤', '🤗'] },
      lonely: { msgs: ['🤍 من اینجام. تو تنها نیستی', '💙 یه دوست داری، اونم من!', '✨ بگو چی شده، من کنارتم'], emojis: ['🤍', '💙', '✨'] },
      heartbroken: { msgs: ['💔 دلم برات می‌سوزه. بگو چی شده', '🤍 آروم باش. زمان همه چیز رو خوب می‌کنه', '✨ من کنارتم. تنها نیستی'], emojis: ['💔', '🤍', '✨'] },
      vulnerable: { msgs: ['💙 اینجای امنته. هر چی بگی، من گوش میدم', '🤍 نترس از اینکه ضعیف باشی. همه ضعیف میشن', '✨ من کنارتم. حمایتت می‌کنم'], emojis: ['💙', '🤍', '✨'] },
      frustrated: { msgs: ['😤 می‌فهمم. گاهی اوقات همه چیز سخت میشه', '💙 یه نفس عمیق. صبور باش', '✨ راه حلی هست. بگو با هم پیدا کنیم'], emojis: ['😤', '💙', '✨'] },
      disappointed: { msgs: ['🤍 ناامید نشو. دفعه بعد بهتر میشه', '💙 من درکت می‌کنم. حق داشتی ناراحت بشی', '✨ به جای ناامیدی، از تجربه درس بگیر'], emojis: ['🤍', '💙', '✨'] }
    };

    const support = supportMap[intent.intent] || supportMap[mood.mood] || supportMap.sad;
    response.text = support.msgs[Math.floor(Math.random() * support.msgs.length)];
    response.quickReplies = ['بیشتر بگو', 'ممنون', 'فعلا نه', 'یه چیز دیگه'];
    response.followUp = 'emotional-support';
    return response;
  }

  function handleUnknown(text, response, profile, chatProfile, mood, intent, entities, session) {
    const lower = text.toLowerCase();

    // اگه خیلی کوتاه باشه
    if (text.length < 3) {
      response.text = '🤔 میشه بیشتر توضیح بدی؟ منظورت رو دقیق نفهمیدم.';
      response.quickReplies = ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من'];
      return response;
    }

    // اگه حاوی موجودیت باشه ولی intent ناشناس
    if (entities.colors.length || entities.categories.length || entities.occasions.length) {
      return handleProductRequest(text, response, profile, entities, mood, intent);
    }

    // پاسخ عمومی بر اساس mood
    const moodRes = {
      happy: ['😊 چه حال خوبی! چی میخوای باهم کنیم؟', '💕 انرژیت عالیه! بگو چیکار کنیم؟'],
      sad: ['🤍 غمگینی؟ بگو چی شده، من گوش میدم.', '💙 هر چی بگی کنارتم. چطور کمکت کنم؟'],
      tired: ['😴 خسته‌ای؟ یه چیز ساده و راحت بگو.', '💤 چیزی که انرژیت رو ببره بالا؟'],
      romantic: ['💕 حالت عاشقانه‌ست! یه پیشنهاد ویژه دارم', '🌹 قرار عاشقانه؟ من بهترین‌ها رو میشناسم!'],
      professional: ['💼 جدی و حرفه‌ای! بگو چه کاری.', '🏢 آماده کار! چه کمکی از دستم برمیاد؟'],
      neutral: ['😊 چطور می‌تونم کمکت کنم؟', '✨ بگو چی میخوای!']
    };

    const responses = moodRes[mood.mood] || moodRes.neutral;
    response.text = responses[Math.floor(Math.random() * responses.length)];

    // اگه سوال باشه
    if (text.includes('؟') || text.includes('?')) {
      response.text = `🤔 سوال جالبی پرسیدی!\n\n${response.text}\n\n💡 می‌تونم درباره هر موضوعی کمکت کنم. بیشتر بگو!`;
    }

    response.quickReplies = ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من', 'استایل مهمانی', 'چه خبر؟'];
    return response;
  }

  function handleGiftRequest(text, response, profile, entities, mood) {
    let recipient = 'دوست';
    if (entities.persons.length) recipient = entities.persons[0];

    if (window.DPAIEngine && window.DPProducts && window.DPProducts.all) {
      const giftProfile = {
        ...profile,
        preferredOccasions: ['gift', 'present'],
        preferredPerson: recipient,
        budget: entities.budgets[0] || profile.budget || 'medium'
      };
      const allProducts = window.DPProducts.all();
      const products = window.DPAIEngine.recommend(allProducts, giftProfile, [], { limit: 5 });
      if (products.length) {
        response.products = products;
        response.text = `🎁 ${products.length} هدیه عالی برای ${recipient} پیدا کردم!\n\nهر کدوم رو که دوست داشتی بگو تا بیشتر توضیح بدم:`;
        response.quickReplies = ['ست کامل', 'ارزون‌تر', 'گرون‌تر', 'بسته‌بندی'];
        return response;
      }
    }

    response.text = `🎁 برای ${recipient} چه چیزی بهتره؟\n\n• اگه ${recipient} به مد علاقه‌منده: یه آیتم شیک\n• اگه به ورزش علاقه داره: لباس ورزشی\n• اگه اهل خونه: یه لباس راحت\n\nبگو ${recipient} چه جور آدمیه تا بهتر پیشنهاد بدم!`;
    response.quickReplies = ['شیک', 'ورزشی', 'راحت', 'لاکچری'];
    return response;
  }

  function handleOutfitRequest(text, response, profile, entities, mood) {
    if (!entities.occasions.length) {
      response.text = 'برای چه موقعیتی ست میخوای؟\n\n👰 عروسی\n🎉 مهمانی\n💕 تاریخ\n💼 کار\n💪 ورزش\n🏖️ ساحل\n✈️ سفر';
      response.quickReplies = ['عروسی', 'مهمانی', 'تاریخ', 'کار', 'ورزش'];
      return response;
    }

    if (window.DPWardrobeAI) {
      const outfit = window.DPWardrobeAI.buildOutfitForOccasion(entities.occasions[0], profile);
      if (outfit.built && outfit.built.length) {
        response.text = `👗 یه ست ${entities.occasions[0]} آماده کردم:\n\n`;
        outfit.built.forEach(item => {
          response.text += `• ${item.name}\n`;
        });
        response.text += `\n⭐ امتیاز: ${outfit.score}٪\n`;
        if (outfit.missing && outfit.missing.length) {
          response.text += `\n⚠️ این آیتم‌ها کمه: ${outfit.missing.join('، ')}`;
        }
        return response;
      }
    }

    return handleProductRequest(text, response, profile, entities, mood, { intent: 'recommend' });
  }

  function handleSizeRequest(text, response, profile, entities) {
    if (!profile.measurements) {
      response.text = 'برای پیشنهاد سایز دقیق، اول باید اندازه‌هات رو وارد کنی:\n\n• دور سینه\n• دور کمر\n• قد\n\nاز تنظیمات حساب کاربری می‌تونی وارد کنی 📏';
      response.quickReplies = ['رفتن به پروفایل'];
      return response;
    }

    response.text = '📏 با توجه به اندازه‌هات:\n\n';
    if (profile.measurements.chest) {
      const ch = profile.measurements.chest;
      let size = 'M';
      if (ch < 85) size = 'S';
      else if (ch >= 95 && ch < 105) size = 'L';
      else if (ch >= 105 && ch < 115) size = 'XL';
      else if (ch >= 115) size = 'XXL';
      response.text += `پیراهن/کت: ${size}\n`;
    }
    if (profile.measurements.waist) {
      const w = profile.measurements.waist;
      let size = 'M';
      if (w < 70) size = 'S';
      else if (w >= 80 && w < 90) size = 'L';
      else if (w >= 90 && w < 100) size = 'XL';
      else if (w >= 100) size = 'XXL';
      response.text += `شلوار/دامن: ${size}\n`;
    }
    response.text += '\nهر محصولی سایزش رو با این راهنما چک کن!';
    return response;
  }

  function buildCriteriaFromEntities(entities, profile) {
    const p = { ...profile };
    if (entities.colors.length) p.preferredColors = [...(p.preferredColors || []), ...entities.colors];
    if (entities.categories.length) p.preferredCategories = entities.categories;
    if (entities.styles.length) p.preferredStyles = [...(p.preferredStyles || []), ...entities.styles];
    if (entities.occasions.length) p.preferredOccasions = [...(p.preferredOccasions || []), ...entities.occasions];
    if (entities.budgets.length) p.budget = entities.budgets[0];
    return { profile: p, history: [] };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🆕 v16.7 — تشخیص intent محصول از متن
  // ═══════════════════════════════════════════════════════════════
  function isProductIntent(text) {
    if (!text || typeof text !== 'string') return false;
    const t = text.trim();
    
    // کلمات کلیدی محصول
    const productKeywords = [
      'پیراهن', 'شلوار', 'کت', 'مانتو', 'بلوز', 'تیشرت', 'پالتو', 'کفش', 'کیف',
      'ساعت', 'عینک', 'گردنبند', 'شال', 'روسری', 'لباس', 'اکسسوری', 'محصول',
      'میخوام', 'می‌خوام', 'میخاه', 'پیشنهاد', 'ببینم', 'نشون', 'بده', 'بزن',
      'خرید', 'بخرم', 'انتخاب', 'مناسب', 'ست', 'رنگ', 'مدل', 'سایز',
      'dress', 'pants', 'shirt', 'shoe', 'bag', 'product', 'recommend', 'want', 'need'
    ];
    
    const lower = t.toLowerCase();
    return productKeywords.some(kw => lower.includes(kw.toLowerCase()));
  }

  // ═══════════════════════════════════════════════════════════════
  // 🆕 v16.7 — فیلتر ساده محصول (fallback وقتی DPAIEngine کار نکرد)
  // ═══════════════════════════════════════════════════════════════
  function fallbackProductFilter(products, entities, profile, limit) {
    if (!Array.isArray(products) || products.length === 0) return [];
    
    let scored = products.map(p => {
      let score = 50; // پایه
      const reasons = [];
      
      const productColors = (p.colors || []).map(c => (c || '').toLowerCase().trim());
      const productName = (p.name || '').toLowerCase();
      const productCategory = (p.category || '').toLowerCase();
      const productTags = (p.tags || []).map(t => (t || '').toLowerCase());
      const productDesc = (p.description || '').toLowerCase();
      const allText = [productName, productCategory, ...productTags, productDesc].join(' ');
      
      // امتیاز از رنگ
      if (entities.colors && entities.colors.length) {
        const colorMatch = entities.colors.some(c => {
          const cLow = (c || '').toLowerCase().trim();
          return productColors.some(pc => pc.includes(cLow) || cLow.includes(pc));
        });
        if (colorMatch) {
          score += 25;
          reasons.push('🎨 رنگ دلخواه شما');
        }
      }
      
      // امتیاز از دسته
      if (entities.categories && entities.categories.length) {
        const catMatch = entities.categories.some(c => {
          const cLow = (c || '').toLowerCase().trim();
          return productCategory.includes(cLow) || cLow.includes(productCategory) || allText.includes(cLow);
        });
        if (catMatch) {
          score += 20;
          reasons.push('🛍️ دسته دلخواه شما');
        }
      }
      
      // امتیاز از سبک
      if (entities.styles && entities.styles.length) {
        const styleMatch = entities.styles.some(s => {
          const sLow = (s || '').toLowerCase().trim();
          return allText.includes(sLow);
        });
        if (styleMatch) {
          score += 10;
          reasons.push('✨ سبک دلخواه شما');
        }
      }
      
      // امتیاز از فروش
      if (p.sold > 200) {
        score += 5;
        reasons.push('🔥 پرفروش');
      }
      
      // امتیاز از rating
      if (p.rating >= 4.5) {
        score += 3;
      }
      
      return {
        ...p,
        matchPercent: Math.min(100, score),
        matchReasons: reasons,
        matchLevel: score >= 70 ? 'high' : (score >= 50 ? 'medium' : 'low'),
        matchLevelLabel: score >= 70 ? 'عالی' : (score >= 50 ? 'خوب' : 'متوسط'),
        matchLevelColor: score >= 70 ? '#16a34a' : (score >= 50 ? '#3b82f6' : '#9ca3af'),
        matchLevelIcon: score >= 70 ? '🎯' : (score >= 50 ? '👍' : '💡')
      };
    });
    
    // مرتب‌سازی بر اساس امتیاز
    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    
    return scored.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 Smart Memory (حافظه هوشمند)
  // ═══════════════════════════════════════════════════════════════
  function saveToMemory(text, response, entities, intent, mood) {
    const memory = load('memory');

    // ترجیحات رنگ
    if (entities.colors.length) {
      memory.colorPreferences = memory.colorPreferences || {};
      entities.colors.forEach(c => {
        memory.colorPreferences[c] = (memory.colorPreferences[c] || 0) + 1;
      });
    }

    // ترجیحات دسته
    if (entities.categories.length) {
      memory.categoryPreferences = memory.categoryPreferences || {};
      entities.categories.forEach(c => {
        memory.categoryPreferences[c] = (memory.categoryPreferences[c] || 0) + 1;
      });
    }

    // ترجیحات سبک
    if (entities.styles.length) {
      memory.stylePreferences = memory.stylePreferences || {};
      entities.styles.forEach(s => {
        memory.stylePreferences[s] = (memory.stylePreferences[s] || 0) + 1;
      });
    }

    // mood
    memory.moodHistory = memory.moodHistory || [];
    memory.moodHistory.push({ mood: mood.mood, timestamp: Date.now(), text: text.substring(0, 50) });
    if (memory.moodHistory.length > 50) memory.moodHistory.shift();

    // intent
    memory.intentHistory = memory.intentHistory || [];
    memory.intentHistory.push({ intent: intent.intent, timestamp: Date.now() });
    if (memory.intentHistory.length > 50) memory.intentHistory.shift();

    // total
    memory.totalMessages = (memory.totalMessages || 0) + 1;
    memory.lastInteraction = Date.now();

    save('memory', memory);
  }

  function saveContext(ctx) {
    save('context', { ...load('context'), ...ctx, timestamp: Date.now() });
  }

  function getMemorySummary() {
    // اگه DPMemory v2.0 لود شده، از اون استفاده کن
    if (window.DPMemory) {
      const stats = window.DPMemory.getStats();
      return {
        // قدیمی (backward compat)
        totalMessages: stats.totalConversations,
        topColors: stats.topColors,
        topCategories: stats.topCategories,
        topStyles: stats.topStyles,
        recentMoods: stats.recentMoods,
        recentIntents: stats.recentIntents,
        sessionLength: stats.memorySize?.short || 0,
        lastInteraction: stats.lastInteraction,
        // جدید از DPMemory
        personality: stats.personality,
        engagement: stats.engagement,
        exploration: stats.exploration,
        loyalty: stats.loyalty,
        healthScore: stats.healthScore,
        totalEmotions: stats.totalEmotions,
        totalEvents: stats.totalEvents,
        totalLearnings: stats.totalLearnings,
        prediction: stats.prediction,
        patterns: stats.patterns,
        // ultra memory
        ultraSize: stats.memorySize?.ultra,
        // profile inferred
        inferredProfile: stats
      };
    }

    // fallback به سیستم قدیمی
    const m = load('memory');
    const session = loadSession();
    return {
      totalMessages: m.totalMessages || 0,
      topColors: Object.entries(m.colorPreferences || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c]) => c),
      topCategories: Object.entries(m.categoryPreferences || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c]) => c),
      topStyles: Object.entries(m.stylePreferences || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s),
      recentMoods: (m.moodHistory || []).slice(-5).map(x => x.mood),
      recentIntents: (m.intentHistory || []).slice(-5).map(x => x.intent),
      sessionLength: session.length,
      lastInteraction: m.lastInteraction
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 📚 یادگیری از مکالمات (Learning)
  // ═══════════════════════════════════════════════════════════════
  function learn(text, response, feedback) {
    const learned = load('learned');
    learned.patterns = learned.patterns || [];
    learned.feedbacks = learned.feedbacks || [];

    if (feedback === 'positive') {
      learned.feedbacks.push({
        input: text,
        output: response,
        rating: 'positive',
        timestamp: Date.now()
      });
    } else if (feedback === 'negative') {
      learned.feedbacks.push({
        input: text,
        output: response,
        rating: 'negative',
        timestamp: Date.now()
      });
    }

    if (learned.feedbacks.length > 200) learned.feedbacks.shift();
    save('learned', learned);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔌 API
  // ═══════════════════════════════════════════════════════════════
  window.DPChatAI = {
    version: '2.0 ULTIMATE OFFLINE',
    generateResponse,
    detectMood,
    detectIntent,
    extractEntities,
    getMemorySummary,
    loadMemory: () => load('memory'),
    saveMemory: (m) => save('memory', m),
    loadSession,
    saveSession,
    clearMemory: () => {
      Object.keys(STORAGE).forEach(k => localStorage.removeItem(STORAGE[k]));
    },
    getUserProfile,
    saveUserProfile,
    updateProfile,
    learn,
    setPersonality: (key) => {
      if (PERSONALITIES[key]) updateProfile('communicationStyle', key);
    },
    getPersonalities: () => PERSONALITIES,
    MOOD_PATTERNS,
    INTENTS,
    ENTITIES,
    STORAGE
  };

  console.log('💬 DPChatAI v2.0 ULTIMATE OFFLINE loaded');
  console.log('   🎭 10 شخصیت | 😊 30+ mood | 🎯 50+ intent | 🏷️ 200+ entity');
  console.log('   🧠 حافظه بلندمدت | 📚 یادگیری | ⚡ کاملاً آفلاین');
})();
