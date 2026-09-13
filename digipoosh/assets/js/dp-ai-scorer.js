/**
 * ============================================================
 *  دیجی‌پوش — سیستم امتیازدهی هوشمند AI
 *  ------------------------------------------------------------
 *  بالانس بین:
 *  • سختی سوال (کدوم AI باهوش‌تر)
 *  • روانی فارسی (کدوم AI فارسی بهتر)
 *  ============================================================
 */
(function() {
  'use strict';
  
  if (!window.DP_AI) {
    console.error('❌ dp-ai-client.js باید اول بارگذاری شود');
    return;
  }
  
  const AIScorer = {
    
    // ═══ پروفایل AI ها ═══
    profiles: {
      'gemma': {
        name: 'Gemma 4 31B',
        intelligence: 3,      // از ۵
        persian: 8,           // از ۱۰
        speed: 8,             // از ۱۰
        cost: 0,              // ۰ = رایگان
        unlimited: true,
        provider: 'gemma-direct',
        model: 'gemma-4-31b-it',
        bestFor: ['persian', 'simple', 'chat', 'color'],
      },
      
      'groq': {
        name: 'Groq (Qwen 3.8)',
        intelligence: 4,
        persian: 7,
        speed: 10,             // سریع‌ترین!
        cost: 0,
        unlimited: true,       // ۱۴K/روز ولی کافیه
        provider: 'groq',
        model: 'qwen/qwen3.8-27b',
        bestFor: ['speed', 'simple', 'chat', 'persian'],
      },
      
      'openrouter-minimax': {
        name: 'OpenRouter (MiniMax)',
        intelligence: 3,
        persian: 6,
        speed: 6,
        cost: 1,
        unlimited: false,
        provider: 'openrouter',
        model: 'minimax/minimax-m2.7:free',
        bestFor: ['search', 'news'],
      },
      
      'openrouter-nvidia': {
        name: 'OpenRouter (NVIDIA 120B)',
        intelligence: 5,
        persian: 6,
        speed: 5,
        cost: 1,
        unlimited: false,
        provider: 'openrouter',
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        bestFor: ['complex', 'reasoning', 'analysis'],
      },
      
      'deepseek': {
        name: 'DeepSeek R1',
        intelligence: 5,
        persian: 5,
        speed: 7,
        cost: 1,
        unlimited: false,
        provider: 'openrouter',
        model: 'deepseek/deepseek-r1:free',
        bestFor: ['reasoning', 'math', 'logic', 'complex'],
      },
      
      'claude': {
        name: 'Claude Haiku',
        intelligence: 5,
        persian: 7,
        speed: 7,
        cost: 1,              // خیلی ارزان از OpenRouter
        unlimited: false,
        provider: 'openrouter',
        model: 'anthropic/claude-3-haiku',
        bestFor: ['safe', 'accurate', 'complex', 'persian'],
      },
      
      'cohere': {
        name: 'Cohere Command',
        intelligence: 4,
        persian: 3,
        speed: 6,
        cost: 1,
        unlimited: false,
        provider: 'cohere',
        model: 'command-r-plus',
        bestFor: ['analysis', 'summary', 'english'],
      },
    },
    
    // ═══ تشخیص سختی سوال ═══
    detectDifficulty(question) {
      const q = question.toLowerCase();
      let score = 1;  // پیش‌فرض: ساده
      
      // کلمات کلیدی سخت
      const hardPatterns = [
        { words: ['چرا', 'چطور', 'چگونه', 'توضیح', 'تحلیل', 'مقایسه', 'فرق', 'دلیل'], weight: 2 },
        { words: ['تاریخچه', 'پشت پرده', 'علمی', 'تخصصی', 'فنی', 'استدلال'], weight: 3 },
        { words: ['ریاضی', 'محاسبه', 'درصد', 'آمار'], weight: 3 },
        { words: ['کد', 'برنامه', 'الگوریتم'], weight: 4 },
        { words: ['ترند', 'مد روز', 'جدیدترین', 'آخرین'], weight: 2 },
      ];
      
      // کلمات کلیدی ساده
      const simplePatterns = [
        { words: ['سلام', 'درود', 'خوبی', 'مرسی', 'ممنون', 'چطوری'], weight: -2 },
        { words: ['رنگ', 'سایز', 'اندازه', 'شماره'], weight: -1 },
        { words: ['پیشنهاد', 'ست', 'لباس', 'کفش'], weight: 0 },
      ];
      
      hardPatterns.forEach(p => {
        p.words.forEach(w => {
          if (q.includes(w)) score += p.weight;
        });
      });
      
      simplePatterns.forEach(p => {
        p.words.forEach(w => {
          if (q.includes(w)) score += p.weight;
        });
      });
      
      // بر اساس طول
      if (q.length < 15) score -= 2;
      else if (q.length < 30) score -= 1;
      else if (q.length > 100) score += 2;
      else if (q.length > 200) score += 3;
      
      // محدود کردن بین ۱ تا ۵
      return Math.max(1, Math.min(5, score));
    },
    
    // ═══ تشخیص نیاز به فارسی ═══
    detectPersianNeed(question) {
      const q = question.toLowerCase();
      
      // اگه انگلیسی غالبه
      const englishRatio = (q.match(/[a-z]/g) || []).length / q.length;
      if (englishRatio > 0.5) return 1;  // نیاز کم
      
      // کلمات فارسی خاص
      const persianKeywords = [
        'چه', 'کدام', 'چرا', 'چطور', 'کجا', 'چند', 'کی',
        'ایران', 'فارسی', 'تهران', 'اصفهان',
        'عید', 'نوروز', 'محرم', 'رمضان', 'یلدا',
        'تومان', 'ریال', 'سایز', 'پوشاک',
      ];
      
      let score = 5;  // پیش‌فرض: فارسی مهمه
      persianKeywords.forEach(w => {
        if (q.includes(w)) score += 2;
      });
      
      // اگه کلمات انگلیسی داره
      if (q.match(/[a-z]{3,}/g)) score -= 1;
      
      return Math.max(1, Math.min(10, score));
    },
    
    // ═══ محاسبه امتیاز هر AI ═══
    score(profile, difficulty, persianNeed) {
      // فرمول: (هوش × سختی) + (فارسی × نیاز)
      // هر دو فاکتور وزن یکسان دارن
      
      const intelligenceScore = profile.intelligence * difficulty * 4;  // ۰-۱۰۰
      const persianScore = profile.persian * persianNeed * 2;          // ۰-۱۶۰
      
      // بونوس سرعت (اگه سوال ساده باشه)
      const speedBonus = (5 - difficulty) * profile.speed * 0.5;       // ۰-۲۵
      
      // جریمه هزینه (اگه رایگان نباشه)
      const costPenalty = profile.cost > 0 ? -10 : 0;
      
      // بونوس unlimited
      const unlimitedBonus = profile.unlimited ? 15 : 0;
      
      const total = intelligenceScore + persianScore + speedBonus + costPenalty + unlimitedBonus;
      
      return {
        total: Math.round(total),
        intelligence: Math.round(intelligenceScore),
        persian: Math.round(persianScore),
        speed: Math.round(speedBonus),
        cost: costPenalty,
        unlimited: unlimitedBonus,
      };
    },
    
    // ═══ انتخاب بهترین AI ═══
    pickBest(question) {
      const difficulty = this.detectDifficulty(question);
      const persianNeed = this.detectPersianNeed(question);
      
      const results = [];
      for (const [key, profile] of Object.entries(this.profiles)) {
        const score = this.score(profile, difficulty, persianNeed);
        results.push({
          key,
          profile,
          score,
          difficulty,
          persianNeed,
        });
      }
      
      // مرتب‌سازی بر اساس امتیاز
      results.sort((a, b) => b.score.total - a.score.total);
      
      return {
        winner: results[0],
        all: results,
        analysis: {
          difficulty,
          persianNeed,
          difficultyLabel: ['', 'خیلی ساده', 'ساده', 'متوسط', 'سخت', 'خیلی سخت'][difficulty],
          persianLabel: persianNeed >= 7 ? 'فارسی خیلی مهم' : persianNeed >= 4 ? 'فارسی مهم' : 'فارسی مهم نیست',
        }
      };
    },
    
    // ═══ فراخوانی برنده ═══
    async ask(question, options = {}) {
      const pick = this.pickBest(question);
      const winner = pick.winner;
      
      console.log('🏆 بهترین AI:', winner.profile.name);
      console.log('📊 امتیاز:', winner.score);
      console.log('🧠 سختی:', pick.analysis.difficultyLabel);
      console.log('🌍 فارسی:', pick.analysis.persianLabel);
      
      // فراخوانی از طریق Router
      return await window.DP_AI.router.callProvider(winner.key, question, options);
    },
  };
  
  // ═══ اضافه به DP_AI ═══
  window.DP_AI.scorer = AIScorer;
  window.DP_AI.askSmart = AIScorer.ask.bind(AIScorer);
  
  console.log('✅ AI Scorer آماده (بالانس هوش + فارسی)');
  
})();
