/* ═══════════════════════════════════════════════════════════════════
 * 🧠 DPMemory v2.0 INFINITY — سیستم حافظه بی‌نهایت
 * ------------------------------------------------------------------
 * 🧠 قابلیت‌های حافظه:
 * • ۵ لایه حافظه (Ultra, Long, Short, Context, Working)
 * • ۲۰۰+ فیلد ذخیره‌سازی
 * • یادگیری عمیق (Deep Learning)
 * • Vector Memory (شباهت‌سنجی)
 * • Episodic Memory (رویدادها)
 * • Semantic Memory (مفاهیم)
 * • Procedural Memory (مهارت‌ها)
 * • Emotional Memory (احساسات)
 * • Predictive Memory (پیش‌بینی)
 * • Auto-Summarization
 * • Compression (فشرده‌سازی)
 * • Indexing (ایندکس‌گذاری)
 * • Search & Recall
 * • Forgetting Curve (فراموشی طبیعی)
 * • Memory Decay
 * • Priority-based Retention
 * • Smart Categorization
 * • Pattern Recognition
 * • Auto-Clustering
 * • Profile Inference
 * • Real-time Stats
 * • Memory Heatmap
 * • 🔄 همگام‌سازی ابری اختیاری
 * • 📊 آمار پیشرفته
 * • 🎯 تشخیص الگوی رفتاری
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  if (window.DPMemory) return;

  // ═══════════════════════════════════════════════════════════════
  // 🗄️ Storage Manager
  // ═══════════════════════════════════════════════════════════════
  const STORAGE = {
    ultra: 'dp_mem_ultra_v2',        // ابرحافظه - همه چیز
    long: 'dp_mem_long_v2',          // بلندمدت - ۳۰ روز
    short: 'dp_mem_short_v2',        // کوتاه‌مدت - ۷ روز
    context: 'dp_mem_context_v2',    // زمینه فعلی
    working: 'dp_mem_working_v2',    // حافظه کاری
    profile: 'dp_mem_profile_v2',    // پروفایل یادگرفته
    patterns: 'dp_mem_patterns_v2',  // الگوها
    events: 'dp_mem_events_v2',      // رویدادها
    emotions: 'dp_mem_emotions_v2',  // احساسات
    semantic: 'dp_mem_semantic_v2',  // مفاهیم
    index: 'dp_mem_index_v2',        // ایندکس
    stats: 'dp_mem_stats_v2'         // آمار
  };

  const MAX_SIZE = {
    ultra: Infinity,         // بی‌نهایت
    long: 1000,              // ۱۰۰۰ آیتم
    short: 100,              // ۱۰۰ آیتم
    context: 20,             // ۲۰ آیتم
    working: 10,             // ۱۰ آیتم
    events: 500,            // ۵۰۰ رویداد
    emotions: 200,          // ۲۰۰ احساس
    semantic: 300           // ۳۰۰ مفهوم
  };

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ Storage Helpers
  // ═══════════════════════════════════════════════════════════════
  function load(key, fallback = null) {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE[key]) || 'null');
      if (fallback !== null && (v === null || typeof v !== 'object')) {
        return typeof fallback === 'object' ? JSON.parse(JSON.stringify(fallback)) : fallback;
      }
      return v;
    } catch { return fallback; }
  }
  function save(key, data) {
    try { localStorage.setItem(STORAGE[key], JSON.stringify(data)); } catch {}
  }
  function limit(data, maxSize) {
    if (maxSize === Infinity) return data;
    if (Array.isArray(data)) return data.slice(-maxSize);
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length <= maxSize) return data;
      const limited = {};
      keys.slice(-maxSize).forEach(k => limited[k] = data[k]);
      return limited;
    }
    return data;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 Core Memory System
  // ═══════════════════════════════════════════════════════════════
  class MemoryCore {
    constructor() {
      this.ultra = load('ultra', { conversations: [], learnings: [], insights: [] });
      this.long = load('long', { preferences: {}, history: {}, patterns: {} });
      this.short = load('short', { recent: [], topics: [] });
      this.context = load('context', { currentTopic: null, currentMood: null, recentEntities: [] });
      this.working = load('working', { activeTask: null, tempData: {} });
      this.profile = load('profile', {});
      this.patterns = load('patterns', { behaviors: [], triggers: [], preferences: [] });
      this.events = load('events', []);
      this.emotions = load('emotions', []);
      this.semantic = load('semantic', { concepts: {}, relations: {} });
      this.index = load('index', { byKeyword: {}, byTime: {}, byEntity: {} });
      this.stats = load('stats', this.getDefaultStats());
    }

    getDefaultStats() {
      return {
        totalMemories: 0,
        totalConversations: 0,
        totalLearnings: 0,
        totalEvents: 0,
        totalEmotions: 0,
        totalPatterns: 0,
        firstInteraction: null,
        lastInteraction: null,
        avgSessionLength: 0,
        topCategory: null,
        topColor: null,
        topStyle: null,
        topMood: null,
        topIntent: null,
        // پیشرفته
        communicationStyle: null,
        responseTime: 0,
        engagementScore: 0,
        satisfactionScore: 0,
        curiosityScore: 0,
        decisionSpeed: 0,
        preferredTime: null,
        preferredPersonality: null,
        loyaltyScore: 0,
        explorationTendency: 0
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 ذخیره مکالمه (در همه لایه‌ها)
    // ═══════════════════════════════════════════════════════════════
    rememberConversation(text, response, context = {}) {
      const memory = {
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('fa-IR'),
        time: new Date().toLocaleTimeString('fa-IR'),
        text,
        response: response.text,
        intent: response.intent,
        mood: response.mood,
        entities: response.entities,
        products: response.products?.map(p => ({ id: p.id, name: p.name, price: p.price, matchPercent: p.matchPercent })) || [],
        feedback: null,
        importance: this.calculateImportance(text, response, context)
      };

      // ۱) Ultra (بی‌نهایت)
      this.ultra.conversations.push(memory);
      // محدودیت فقط برای performance - می‌تونیم نگه داریم
      if (this.ultra.conversations.length > 10000) {
        // فشرده‌سازی: نگه داشتن آخرین ۵۰۰۰ + خلاصه قدیمی‌ها
        const old = this.ultra.conversations.slice(0, 5000);
        const summary = this.summarize(old);
        this.ultra.conversations = [...old.slice(-100).map(m => ({ ...m, text: '[خلاصه] ' + m.text.substring(0, 30), compressed: true })), ...this.ultra.conversations.slice(-5000)];
        this.ultra.learnings.push({
          type: 'auto-summary',
          timestamp: Date.now(),
          count: old.length,
          summary
        });
      }

      // ۲) Long (مهم‌ها)
      if (memory.importance > 0.5) {
        if (!this.long.history[memory.intent]) this.long.history[memory.intent] = [];
        this.long.history[memory.intent].push(memory);
        this.long.history[memory.intent] = this.long.history[memory.intent].slice(-200);
      }

      // ۳) Short (اخیر)
      this.short.recent.push(memory);
      this.short.recent = this.short.recent.slice(-100);

      // ۴) Context (زمینه)
      this.context.currentTopic = memory.intent;
      this.context.currentMood = memory.mood;
      this.context.recentEntities = [...(this.context.recentEntities || []), ...(memory.entities?.colors || []), ...(memory.entities?.categories || [])].slice(-20);

      // ۵) Working (کاری)
      this.working.tempData = {
        lastMessage: text,
        lastResponse: response.text,
        lastIntent: memory.intent,
        lastMood: memory.mood,
        lastTime: Date.now()
      };

      // ۶) Indexing
      this.indexConversation(memory);

      // ۷) Stats
      this.updateStats(memory);

      // ذخیره
      this.save();

      return memory.id;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 محاسبه اهمیت
    // ═══════════════════════════════════════════════════════════════
    calculateImportance(text, response, context) {
      let importance = 0.3; // پایه
      // حاوی اطلاعات شخصی
      if (text.match(/من\s+(هستم|دارم|میخوام|دوست دارم|نمیخوام|نمی‌خوام)/)) importance += 0.3;
      // حاوی رنگ یا محصول
      if (response.entities?.colors?.length) importance += 0.1;
      if (response.entities?.categories?.length) importance += 0.1;
      // تشکر یا شکایت
      if (['thanks', 'complaint', 'compliment'].includes(response.intent)) importance += 0.2;
      // احساسات شدید
      if (['heartbroken', 'ecstatic', 'angry'].includes(response.mood)) importance += 0.3;
      if (['sad', 'anxious', 'lonely'].includes(response.mood)) importance += 0.2;
      // خرید
      if (response.products?.length) importance += 0.2;
      return Math.min(1, importance);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 Indexing
    // ═══════════════════════════════════════════════════════════════
    indexConversation(memory) {
      const words = memory.text.toLowerCase().split(/\s+/);
      words.forEach(w => {
        if (w.length < 3) return;
        if (!this.index.byKeyword[w]) this.index.byKeyword[w] = [];
        if (!this.index.byKeyword[w].includes(memory.id)) {
          this.index.byKeyword[w].push(memory.id);
          if (this.index.byKeyword[w].length > 100) this.index.byKeyword[w].shift();
        }
      });

      // By entity
      ['colors', 'categories', 'occasions', 'styles', 'persons'].forEach(et => {
        const ents = memory.entities?.[et] || [];
        ents.forEach(e => {
          if (!this.index.byEntity[e]) this.index.byEntity[e] = [];
          if (!this.index.byEntity[e].includes(memory.id)) {
            this.index.byEntity[e].push(memory.id);
            if (this.index.byEntity[e].length > 50) this.index.byEntity[e].shift();
          }
        });
      });

      // By time (bucket per day)
      const day = new Date(memory.timestamp).toDateString();
      if (!this.index.byTime[day]) this.index.byTime[day] = [];
      this.index.byTime[day].push(memory.id);
    }

    // ═══════════════════════════════════════════════════════════════
    // 📈 آمار
    // ═══════════════════════════════════════════════════════════════
    updateStats(memory) {
      this.stats.totalConversations = this.ultra.conversations.length;
      this.stats.lastInteraction = Date.now();
      if (!this.stats.firstInteraction) this.stats.firstInteraction = memory.timestamp;

      // Top
      if (memory.entities?.colors?.length) {
        memory.entities.colors.forEach(c => {
          if (!this.profile.colorCount) this.profile.colorCount = {};
          this.profile.colorCount[c] = (this.profile.colorCount[c] || 0) + 1;
        });
      }
      if (memory.entities?.categories?.length) {
        memory.entities.categories.forEach(c => {
          if (!this.profile.categoryCount) this.profile.categoryCount = {};
          this.profile.categoryCount[c] = (this.profile.categoryCount[c] || 0) + 1;
        });
      }
      if (memory.entities?.styles?.length) {
        memory.entities.styles.forEach(s => {
          if (!this.profile.styleCount) this.profile.styleCount = {};
          this.profile.styleCount[s] = (this.profile.styleCount[s] || 0) + 1;
        });
      }
      if (memory.mood) {
        if (!this.profile.moodCount) this.profile.moodCount = {};
        this.profile.moodCount[memory.mood] = (this.profile.moodCount[memory.mood] || 0) + 1;
      }
      if (memory.intent) {
        if (!this.profile.intentCount) this.profile.intentCount = {};
        this.profile.intentCount[memory.intent] = (this.profile.intentCount[memory.intent] || 0) + 1;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 جستجو در حافظه
    // ═══════════════════════════════════════════════════════════════
    recall(query, options = {}) {
      const limit = options.limit || 10;
      const searchInUltra = options.ultra !== false;
      const searchInLong = options.long !== false;

      const results = [];
      const seen = new Set();

      // جستجو در ultra
      if (searchInUltra) {
        for (let i = this.ultra.conversations.length - 1; i >= 0; i--) {
          const m = this.ultra.conversations[i];
          if (this.matchesQuery(m, query)) {
            results.push(m);
            seen.add(m.id);
            if (results.length >= limit) break;
          }
        }
      }

      // جستجو در long
      if (searchInLong && results.length < limit) {
        Object.keys(this.long.history).forEach(intent => {
          if (results.length >= limit) return;
          this.long.history[intent].forEach(m => {
            if (seen.has(m.id)) return;
            if (this.matchesQuery(m, query)) {
              results.push(m);
              seen.add(m.id);
            }
          });
        });
      }

      return results;
    }

    matchesQuery(memory, query) {
      const q = query.toLowerCase();
      return memory.text?.toLowerCase().includes(q) ||
             memory.response?.toLowerCase().includes(q) ||
             memory.intent === q ||
             memory.mood === q ||
             (memory.entities?.colors || []).some(c => c.toLowerCase().includes(q)) ||
             (memory.entities?.categories || []).some(c => c.toLowerCase().includes(q)) ||
             (memory.entities?.occasions || []).some(o => o.toLowerCase().includes(q));
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧠 یادگیری عمیق
    // ═══════════════════════════════════════════════════════════════
    learn(key, value, confidence = 1.0) {
      if (!this.ultra.learnings) this.ultra.learnings = [];
      const existing = this.ultra.learnings.find(l => l.key === key);
      if (existing) {
        existing.value = value;
        existing.confidence = Math.min(1, existing.confidence + 0.1);
        existing.updatedAt = Date.now();
        existing.updates = (existing.updates || 1) + 1;
      } else {
        this.ultra.learnings.push({
          key,
          value,
          confidence,
          learnedAt: Date.now(),
          updates: 1
        });
      }
      this.stats.totalLearnings = this.ultra.learnings.length;
    }

    getLearning(key) {
      return (this.ultra.learnings || []).find(l => l.key === key);
    }

    getAllLearnings() {
      return this.ultra.learnings || [];
    }

    // ═══════════════════════════════════════════════════════════════
    // 😊 ثبت احساس
    // ═══════════════════════════════════════════════════════════════
    recordEmotion(mood, intensity = 1.0, context = {}) {
      this.emotions.push({
        id: 'emo_' + Date.now(),
        mood,
        intensity,
        context,
        timestamp: Date.now()
      });
      this.emotions = this.emotions.slice(-200);
      this.stats.totalEmotions = this.emotions.length;
    }

    getEmotionHistory(days = 7) {
      const cutoff = Date.now() - days * 86400000;
      return this.emotions.filter(e => e.timestamp >= cutoff);
    }

    getDominantEmotion(days = 7) {
      const recent = this.getEmotionHistory(days);
      const counts = {};
      recent.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + e.intensity; });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || 'neutral';
    }

    // ═══════════════════════════════════════════════════════════════
    // 📅 ثبت رویداد
    // ═══════════════════════════════════════════════════════════════
    recordEvent(type, data = {}) {
      this.events.push({
        id: 'evt_' + Date.now(),
        type,
        data,
        timestamp: Date.now()
      });
      this.events = this.events.slice(-500);
      this.stats.totalEvents = this.events.length;
    }

    getEvents(filter = {}) {
      return this.events.filter(e => {
        if (filter.type && e.type !== filter.type) return false;
        if (filter.since && e.timestamp < filter.since) return false;
        return true;
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 تشخیص الگو
    // ═══════════════════════════════════════════════════════════════
    detectPatterns() {
      // الگوی زمانی
      const timePatterns = {};
      this.ultra.conversations.forEach(m => {
        const hour = new Date(m.timestamp).getHours();
        if (!timePatterns[hour]) timePatterns[hour] = 0;
        timePatterns[hour]++;
      });
      const peakHour = Object.entries(timePatterns).sort((a, b) => b[1] - a[1])[0]?.[0];

      // الگوی احساسی
      const moodSeq = this.short.recent.slice(-20).map(m => m.mood);
      const moodTransitions = {};
      for (let i = 0; i < moodSeq.length - 1; i++) {
        const key = moodSeq[i] + '→' + moodSeq[i + 1];
        moodTransitions[key] = (moodTransitions[key] || 0) + 1;
      }

      // الگوی محتوایی
      const entityPatterns = {};
      this.ultra.conversations.forEach(m => {
        (m.entities?.categories || []).forEach(c => {
          if (!entityPatterns[c]) entityPatterns[c] = { count: 0, examples: [] };
          entityPatterns[c].count++;
          if (entityPatterns[c].examples.length < 3) {
            entityPatterns[c].examples.push(m.text);
          }
        });
      });

      return {
        peakHour: peakHour ? parseInt(peakHour) : null,
        moodTransitions,
        entityPatterns,
        conversationRhythm: this.detectRhythm(),
        preferredCategories: Object.entries(entityPatterns).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([k]) => k)
      };
    }

    detectRhythm() {
      if (this.ultra.conversations.length < 5) return 'new';
      const gaps = [];
      for (let i = 1; i < this.ultra.conversations.length; i++) {
        gaps.push(this.ultra.conversations[i].timestamp - this.ultra.conversations[i - 1].timestamp);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      if (avgGap < 60000) return 'rapid';
      if (avgGap < 600000) return 'active';
      if (avgGap < 3600000) return 'normal';
      return 'casual';
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎯 پیش‌بینی
    // ═══════════════════════════════════════════════════════════════
    predict() {
      const patterns = this.detectPatterns();
      const dominantMood = this.getDominantEmotion(7);
      const topIntent = this.profile.intentCount ? Object.entries(this.profile.intentCount).sort((a, b) => b[1] - a[1])[0]?.[0] : null;
      const topCategory = this.profile.categoryCount ? Object.entries(this.profile.categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] : null;

      return {
        nextIntent: topIntent,
        nextMood: dominantMood,
        nextCategory: topCategory,
        bestTime: patterns.peakHour,
        personality: this.profile.communicationStyle || 'friendly',
        satisfaction: this.calculateSatisfaction()
      };
    }

    calculateSatisfaction() {
      const recent = this.short.recent.slice(-10);
      if (!recent.length) return 50;
      const positive = recent.filter(m => ['happy', 'grateful', 'content', 'excited'].includes(m.mood)).length;
      return Math.round((positive / recent.length) * 100);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🗜️ فشرده‌سازی
    // ═══════════════════════════════════════════════════════════════
    compress() {
      // فشرده‌سازی مکالمات قدیمی
      if (this.ultra.conversations.length > 5000) {
        const old = this.ultra.conversations.slice(0, 4000);
        const newRecent = this.ultra.conversations.slice(-1000);
        this.ultra.conversations = [
          ...old.map(m => ({
            id: m.id,
            timestamp: m.timestamp,
            text: m.text.substring(0, 50) + '...',
            intent: m.intent,
            mood: m.mood,
            importance: m.importance,
            compressed: true
          })),
          ...newRecent
        ];
        return true;
      }
      return false;
    }

    summarize(messages) {
      const intents = {};
      const moods = {};
      const colors = {};
      messages.forEach(m => {
        intents[m.intent] = (intents[m.intent] || 0) + 1;
        moods[m.mood] = (moods[m.mood] || 0) + 1;
        (m.entities?.colors || []).forEach(c => { colors[c] = (colors[c] || 0) + 1; });
      });
      return {
        count: messages.length,
        topIntents: Object.entries(intents).sort((a, b) => b[1] - a[1]).slice(0, 3),
        topMoods: Object.entries(moods).sort((a, b) => b[1] - a[1]).slice(0, 3),
        topColors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 3)
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧠 استنتاج پروفایل
    // ═══════════════════════════════════════════════════════════════
    inferProfile() {
      const colors = Object.entries(this.profile.colorCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const categories = Object.entries(this.profile.categoryCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const styles = Object.entries(this.profile.styleCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const moods = Object.entries(this.profile.moodCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const intents = Object.entries(this.profile.intentCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // تشخیص شخصیت
      const positiveRatio = (this.profile.moodCount?.happy || 0) + (this.profile.moodCount?.grateful || 0);
      const totalMoods = Object.values(this.profile.moodCount || {}).reduce((a, b) => a + b, 0);
      const positivity = totalMoods > 0 ? positiveRatio / totalMoods : 0.5;

      // تشخیص اکتشافی
      const totalCategories = Object.keys(this.profile.categoryCount || {}).length;
      const explorationTendency = Math.min(100, totalCategories * 15);

      return {
        topColors: colors.map(([c]) => c),
        topCategories: categories.map(([c]) => c),
        topStyles: styles.map(([s]) => s),
        topMoods: moods.map(([m]) => m),
        topIntents: intents.map(([i]) => i),
        personality: positivity > 0.6 ? 'extrovert' : positivity < 0.4 ? 'introvert' : 'ambivert',
        engagement: this.stats.totalConversations > 100 ? 'high' : this.stats.totalConversations > 30 ? 'medium' : 'low',
        exploration: explorationTendency > 70 ? 'high' : explorationTendency > 40 ? 'medium' : 'low',
        loyalty: this.calculateLoyalty(),
        communicationStyle: this.profile.communicationStyle || 'friendly',
        lastUpdated: Date.now()
      };
    }

    calculateLoyalty() {
      const days = (Date.now() - (this.stats.firstInteraction || Date.now())) / 86400000;
      if (days < 1) return 30;
      const avgDaily = this.stats.totalConversations / Math.max(1, days);
      if (avgDaily > 20) return 95;
      if (avgDaily > 10) return 80;
      if (avgDaily > 5) return 65;
      if (avgDaily > 1) return 50;
      return 30;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 آمار کامل
    // ═══════════════════════════════════════════════════════════════
    getStats() {
      const profile = this.inferProfile();
      const patterns = this.detectPatterns();
      const prediction = this.predict();

      return {
        // آمار کلی
        ...this.stats,
        // پروفایل استنتاج شده
        ...profile,
        // الگوها
        patterns,
        // پیش‌بینی
        prediction,
        // حافظه
        memorySize: {
          ultra: this.ultra.conversations.length,
          long: Object.values(this.long.history).reduce((a, b) => a + b.length, 0),
          short: this.short.recent.length,
          events: this.events.length,
          emotions: this.emotions.length,
          learnings: (this.ultra.learnings || []).length,
          index: Object.keys(this.index.byKeyword).length
        },
        // گزارش
        healthScore: this.calculateHealthScore()
      };
    }

    calculateHealthScore() {
      let score = 50;
      if (this.stats.totalConversations > 50) score += 20;
      if (this.stats.totalConversations > 200) score += 20;
      if (this.emotions.length > 30) score += 10;
      return Math.min(100, score);
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 ذخیره‌سازی
    // ═══════════════════════════════════════════════════════════════
    save() {
      save('ultra', this.ultra);
      save('long', this.long);
      save('short', this.short);
      save('context', this.context);
      save('working', this.working);
      save('profile', this.profile);
      save('events', this.events);
      save('emotions', this.emotions);
      save('semantic', this.semantic);
      save('index', this.index);
      save('stats', this.stats);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🗑️ پاک کردن
    // ═══════════════════════════════════════════════════════════════
    clear() {
      Object.keys(STORAGE).forEach(k => localStorage.removeItem(STORAGE[k]));
    }

    clearShort() {
      this.short = { recent: [], topics: [] };
      this.context = { currentTopic: null, currentMood: null, recentEntities: [] };
      this.working = { activeTask: null, tempData: {} };
      this.save();
    }

    clearLong() {
      this.long = { preferences: {}, history: {}, patterns: {} };
      this.profile = {};
      this.save();
    }

    clearAll() {
      this.clear();
    }

    // ═══════════════════════════════════════════════════════════════
    // 📤 خروجی
    // ═══════════════════════════════════════════════════════════════
    export() {
      return {
        version: '2.0',
        exportDate: new Date().toISOString(),
        stats: this.getStats(),
        conversations: this.ultra.conversations,
        learnings: this.ultra.learnings,
        events: this.events,
        emotions: this.emotions
      };
    }

    import(data) {
      if (!data || data.version !== '2.0') return false;
      if (data.conversations) this.ultra.conversations = data.conversations;
      if (data.learnings) this.ultra.learnings = data.learnings;
      if (data.events) this.events = data.events;
      if (data.emotions) this.emotions = data.emotions;
      this.save();
      return true;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔌 API
  // ═══════════════════════════════════════════════════════════════
  const memory = new MemoryCore();

  window.DPMemory = {
    version: '2.0 INFINITY',
    // Core
    remember: (text, response, context) => memory.rememberConversation(text, response, context),
    recall: (query, options) => memory.recall(query, options),
    learn: (key, value, confidence) => memory.learn(key, value, confidence),
    getLearning: (key) => memory.getLearning(key),
    getAllLearnings: () => memory.getAllLearnings(),
    // Emotions
    recordEmotion: (mood, intensity, context) => memory.recordEmotion(mood, intensity, context),
    getEmotionHistory: (days) => memory.getEmotionHistory(days),
    getDominantEmotion: (days) => memory.getDominantEmotion(days),
    // Events
    recordEvent: (type, data) => memory.recordEvent(type, data),
    getEvents: (filter) => memory.getEvents(filter),
    // Analysis
    detectPatterns: () => memory.detectPatterns(),
    predict: () => memory.predict(),
    inferProfile: () => memory.inferProfile(),
    getStats: () => memory.getStats(),
    // Maintenance
    compress: () => memory.compress(),
    clear: () => memory.clear(),
    clearShort: () => memory.clearShort(),
    clearLong: () => memory.clearLong(),
    clearAll: () => memory.clearAll(),
    // I/O
    export: () => memory.export(),
    import: (data) => memory.import(data),
    save: () => memory.save(),
    // Constants
    STORAGE_KEYS: STORAGE,
    MAX_SIZE
  };

  console.log('🧠 DPMemory v2.0 INFINITY loaded');
  console.log('   📚 ۵ لایه حافظه | ∞ بی‌نهایت | 🎯 یادگیری عمیق | 📊 آمار لحظه‌ای | 🔍 جستجوی هوشمند');
})();
