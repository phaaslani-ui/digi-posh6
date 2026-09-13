/**
 * ============================================================
 *  دیجی‌پوش — روتر هوشمند ۴ لایه با Fallback
 *  ------------------------------------------------------------
 *  لایه‌ها:
 *   🟢 Gemma مستقیم → ساده
 *   🟡 OpenRouter Gemini → با Google Search
 *   🟣 OpenRouter MiniMax → سریع
 *   🔵 RSS → ترندها
 *  ============================================================
 */
(function() {
  'use strict';
  
  if (!window.DP_AI) {
    console.error('❌ dp-ai-client.js باید اول بارگذاری شود');
    return;
  }
  
  const AIRouter = {
    
    // ═══ لیست لایه‌ها به ترتیب اولویت ═══
    providers: [
      { 
        name: 'gemma-direct', 
        priority: 1, 
        cost: 0, 
        unlimited: true,
        model: 'gemma-4-31b-it',
        apiType: 'interactions',
        needsKey: 'geminiApiKey',
      },
      { 
        name: 'groq-fast', 
        priority: 2, 
        cost: 0,
        unlimited: true,
        model: 'qwen/qwen3.8-27b',
        apiType: 'groq',
        needsKey: 'groqKey',
        fast: true,
      },
      { 
        name: 'openrouter-gemini', 
        priority: 3, 
        cost: 1,
        model: 'minimax/minimax-m2.7:free',
        apiType: 'openrouter',
        needsKey: 'openRouterKey',
        hasGoogleSearch: false,
      },
      { 
        name: 'openrouter-nvidia', 
        priority: 4, 
        cost: 1,
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        apiType: 'openrouter',
        needsKey: 'openRouterKey',
        hasGoogleSearch: false,
      },
    ],
    
    // ═══ آمار استفاده ═══
    stats: {
      gemma: 0,
      openrouter: 0,
      total: 0,
      errors: {},
    },
    
    /**
     * آنالیز سوال و تصمیم‌گیری
     */
    analyze(question) {
      const q = question.toLowerCase();
      const scores = { gemma: 0, openrouter: 0, rss: 0, nvidia: 0 };
      
      // ═══ الگوها ═══
      const simplePatterns = ['سلام', 'درود', 'چطوری', 'خوبی', 'مرسی', 'ممنون', 'بای', 'رنگ', 'چه رنگی', 'سایز', 'اندازه', 'پیشنهاد', 'ست', 'لباس'];
      const searchPatterns = ['ترند', 'مد روز', 'جدیدترین', 'آخرین', 'امسال', '۲۰۲۶', '۲۰۲۵', 'قیمت', 'چند', 'کجا', 'برند'];
      const trendPatterns = ['مد', 'فشن', 'مجلسی', 'اسپرت', 'کژوال'];
      const complexPatterns = ['چرا', 'چطور', 'چگونه', 'توضیح', 'تحلیل', 'تاریخچه', 'فرق', 'مقایسه'];
      
      // امتیازدهی
      simplePatterns.forEach(p => { if (q.includes(p)) scores.gemma += 2; });
      searchPatterns.forEach(p => { if (q.includes(p)) scores.openrouter += 3; });
      trendPatterns.forEach(p => { if (q.includes(p)) { scores.rss += 4; scores.openrouter += 2; }});
      complexPatterns.forEach(p => { if (q.includes(p)) { scores.nvidia += 3; scores.openrouter += 2; }});
      
      // طول سوال
      if (question.length < 20) scores.gemma += 3;
      if (question.length > 100) { scores.nvidia += 3; scores.openrouter += 2; }
      
      // انتخاب
      let winner = 'gemma';
      let maxScore = scores.gemma;
      
      if (scores.rss > maxScore && scores.rss >= 4) {
        winner = 'rss';
        maxScore = scores.rss;
      }
      if (scores.nvidia > maxScore) {
        winner = 'nvidia';
        maxScore = scores.nvidia;
      }
      if (scores.openrouter > maxScore) {
        winner = 'openrouter';
        maxScore = scores.openrouter;
      }
      
      return { 
        provider: winner, 
        scores, 
        confidence: maxScore,
        reason: this.getReason(winner, scores),
      };
    },
    
    getReason(provider, scores) {
      const map = {
        'gemma': 'ساده → Gemma (رایگان)',
        'openrouter': 'نیاز به Search → OpenRouter',
        'nvidia': 'پیچیده → NVIDIA (استدلال)',
        'rss': 'ترند → RSS',
      };
      return map[provider] || 'پیش‌فرض';
    },
    
    /**
     * مسیر اصلی: تصمیم و ارسال
     */
    async route(question, options = {}) {
      const config = window.DP_CONFIG || {};
      const analysis = this.analyze(question);
      
      console.log('🤖 روتر:', analysis);
      
      // ۱. اولویت با RSS برای ترند
      if (analysis.provider === 'rss' && config.aiUseRSS !== false) {
        const rssResult = await this.tryRSS(question);
        if (rssResult) {
          this.stats.total++;
          this.stats.openrouter++; // RSS هم از openrouter نیست ولی برای آمار
          return { ...rssResult, provider: 'rss', reason: analysis.reason };
        }
      }
      
      // ۲. سعی با provider انتخابی
      try {
        const result = await this.callProvider(analysis.provider, question, options);
        this.stats.total++;
        this.stats[result.providerKey] = (this.stats[result.providerKey] || 0) + 1;
        return { ...result, reason: analysis.reason };
      } catch(e) {
        console.warn(`⚠️ ${analysis.provider} شکست خورد:`, e.message);
      }
      
      // ۳. Fallback: همه provider ها رو امتحان کن
      console.log('🔄 Fallback: امتحان همه provider ها...');
      for (const provider of this.providers) {
        if (provider.name === analysis.provider) continue; // قبلاً امتحان شد
        try {
          const result = await this.callProviderByConfig(provider, question, options);
          this.stats.total++;
          this.stats[result.providerKey] = (this.stats[result.providerKey] || 0) + 1;
          return { ...result, reason: 'fallback → ' + provider.name };
        } catch(e) {
          console.warn(`⚠️ Fallback ${provider.name} شکست:`, e.message);
        }
      }
      
      // ۴. آخرین امید: Gemma (حتی بدون کلید، با fallback داخلی)
      console.log('🆘 همه شکست خوردن → Gemma نهایی');
      try {
        const result = await this.callGemmaDirect(question, options);
        this.stats.total++;
        this.stats.gemma++;
        return { ...result, reason: 'emergency → gemma' };
      } catch(e) {
        return { 
          text: '❌ متأسفانه الان هیچ AI در دسترس نیست. لطفاً چند دقیقه بعد دوباره امتحان کنید.',
          provider: 'none', 
          cost: 0,
          error: e.message,
        };
      }
    },
    
    /**
     * فراخوانی provider بر اساس نام
     */
    async callProvider(name, question, options) {
      const config = window.DP_CONFIG || {};
      
      switch(name) {
        case 'gemma':
          return await this.callGemmaDirect(question, options);
        case 'groq':
          return await this.callGroq(question, options);
        case 'openrouter':
          return await this.callOpenRouter(config.openRouterModel || 'minimax/minimax-m2.7:free', question, options);
        case 'nvidia':
          return await this.callOpenRouter('nvidia/nemotron-3-super-120b-a12b:free', question, options);
        default:
          return await this.callGemmaDirect(question, options);
      }
    },
    
    /**
     * فراخوانی بر اساس config
     */
    async callProviderByConfig(provider, question, options) {
      const config = window.DP_CONFIG || {};
      const key = config[provider.needsKey];
      if (!key) throw new Error(`کلید ${provider.needsKey} تنظیم نشده`);
      
      if (provider.apiType === 'groq') {
        return await this.callGroq(question, options);
      } else if (provider.apiType === 'openrouter') {
        return await this.callOpenRouter(provider.model, question, options);
      }
      return await this.callGemmaDirect(question, options);
    },
    
    /**
     * Gemma مستقیم (Google)
     */
    async callGemmaDirect(question, options) {
      const config = window.DP_CONFIG || {};
      if (!config.geminiApiKey) throw new Error('کلید Gemini تنظیم نشده');
      
      const oldProvider = config.aiProvider;
      const oldModel = config.aiModel;
      const oldApiType = config.aiApiType;
      
      config.aiProvider = 'gemini-pro';
      config.aiModel = 'gemma-4-31b-it';
      config.aiApiType = 'interactions';
      
      try {
        const response = await window.DP_AI.chat(question, options);
        return { 
          text: response, 
          provider: 'gemma', 
          providerKey: 'gemma',
          cost: 0, 
          unlimited: true,
        };
      } finally {
        config.aiProvider = oldProvider;
        config.aiModel = oldModel;
        config.aiApiType = oldApiType;
      }
    },
    
    /**
     * Groq - سریع‌ترین
     */
    async callGroq(question, options) {
      const config = window.DP_CONFIG || {};
      if (!config.groqKey) throw new Error('کلید Groq تنظیم نشده');
      
      const oldProvider = config.aiProvider;
      const oldModel = config.aiModel;
      
      config.aiProvider = 'groq';
      config.aiModel = config.groqModel || 'qwen/qwen3.8-27b';
      
      try {
        const response = await window.DP_AI.chat(question, options);
        return { 
          text: response, 
          provider: 'groq', 
          providerKey: 'groq',
          cost: 0, 
          unlimited: true,
          fast: true,
        };
      } finally {
        config.aiProvider = oldProvider;
        config.aiModel = oldModel;
      }
    },
    
    /**
     * OpenRouter
     */
    async callOpenRouter(model, question, options) {
      const config = window.DP_CONFIG || {};
      if (!config.openRouterKey) throw new Error('کلید OpenRouter تنظیم نشده');
      
      const oldProvider = config.aiProvider;
      const oldModel = config.aiModel;
      
      config.aiProvider = 'openrouter';
      config.aiModel = model;
      
      try {
        const response = await window.DP_AI.chat(question, options);
        return { 
          text: response, 
          provider: 'openrouter', 
          providerKey: 'openrouter',
          cost: 1, 
          model: model,
        };
      } finally {
        config.aiProvider = oldProvider;
        config.aiModel = oldModel;
      }
    },
    
    /**
     * RSS - ترندها
     */
    async tryRSS(question) {
      try {
        const trends = await window.DP_AI.getTrends();
        if (!trends || trends.length === 0) return null;
        
        const q = question.toLowerCase();
        const keywords = q.split(' ').filter(w => w.length > 2);
        const relevant = trends.filter(t => {
          const title = (t.title || '').toLowerCase();
          return keywords.some(k => title.includes(k));
        });
        
        const toShow = relevant.length > 0 ? relevant.slice(0, 5) : trends.slice(0, 5);
        
        let text = `📰 **ترندهای روز دنیای مد:**\n\n`;
        toShow.forEach((t, i) => {
          text += `${i+1}. **${t.title}**\n`;
          text += `   📰 منبع: ${t.source}\n`;
          if (t.link) text += `   🔗 [ادامه](${t.link})\n`;
          text += '\n';
        });
        
        return { text, provider: 'rss', providerKey: 'rss', cost: 0, trends: toShow };
      } catch(e) {
        console.warn('RSS failed:', e);
        return null;
      }
    },
    
    /**
     * آمار استفاده
     */
    getStats() {
      return { ...this.stats };
    },
  };
  
  // ═══ اضافه به DP_AI ═══
  window.DP_AI.router = AIRouter;
  window.DP_AI.ask = AIRouter.route.bind(AIRouter);
  
  console.log('✅ Hybrid Router 4-Layer آماده');
  console.log('📊 Provider ها:', AIRouter.providers.map(p => p.name));
  
})();
