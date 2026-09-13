/**
 * ============================================================
 *  دیجی‌پوش — کلاینت هوش مصنوعی پیشرفته
 *  ------------------------------------------------------------
 *  قابلیت‌ها:
 *   • اتصال به Google Gemini (رایگان)
 *   • Google Search داخلی (ترندهای روز)
 *   • RSS خودکار از ۸ منبع معتبر
 *   • Cache هوشمند
 *   • Fallback چندلایه
 *   • پشتیبانی کامل فارسی
 *  ============================================================
 */
(function() {
  'use strict';

  // ════════════════════════════════════════════
  //  تنظیمات پیش‌فرض
  // ════════════════════════════════════════════
  const DEFAULT_CONFIG = {
    // کلید Gemini (در dp-config.js تنظیم شود)
    apiKey: '',
    
    // انتخاب مدل
    // gemini-1.5-flash: سریع، رایگان
    // gemini-1.5-pro: قوی‌تر، رایگان تا سقف
    // gemini-1.5-flash-8b: سریع‌ترین
    model: 'gemini-1.5-flash',
    
    // پارامترهای تولید
    temperature: 0.7,      // ۰ = دقیق، ۱ = خلاقانه
    maxTokens: 1024,       // حداکثر طول پاسخ
    topP: 0.9,
    topK: 40,
    
    // قابلیت‌ها
    useGoogleSearch: true,  // استفاده از سرچ گوگل
    useRSS: true,          // استفاده از RSS
    useCache: true,        // کش محلی
    cacheTTL: 3600000,     // ۱ ساعت (میلی‌ثانیه)
    
    // منابع RSS (۸ منبع معتبر)
    rssSources: [
      { name: 'Vogue',         url: 'https://www.vogue.com/feed/rss', lang: 'en', weight: 1.0 },
      { name: "Harper's Bazaar", url: 'https://www.harpersbazaar.com/feed/rss', lang: 'en', weight: 1.0 },
      { name: 'ELLE',          url: 'https://www.elle.com/feed/rss', lang: 'en', weight: 1.0 },
      { name: 'GQ',            url: 'https://www.gq.com/feed/rss', lang: 'en', weight: 0.9 },
      { name: 'Esquire',       url: 'https://www.esquire.com/feed/rss', lang: 'en', weight: 0.9 },
      { name: 'InStyle',       url: 'https://www.instyle.com/feed/rss', lang: 'en', weight: 0.9 },
      { name: 'Refinery29',    url: 'https://www.refinery29.com/feed/rss', lang: 'en', weight: 0.8 },
      { name: 'Fashionista',   url: 'https://fashionista.com/feed/', lang: 'en', weight: 0.8 },
    ],
    
    // آستانه‌ها
    maxRetries: 3,
    requestTimeout: 30000,  // ۳۰ ثانیه
    rateLimitPerMinute: 55, // ۶۰ مجاز، ۵ امن
  };

  // ════════════════════════════════════════════
  //  سیستم لاگ
  // ════════════════════════════════════════════
  const Logger = {
    enabled: true,
    prefix: '🤖 [دیجی AI]',
    
    log(...args) {
      if (this.enabled) console.log(this.prefix, ...args);
    },
    warn(...args) {
      if (this.enabled) console.warn(this.prefix, '⚠️', ...args);
    },
    error(...args) {
      if (this.enabled) console.error(this.prefix, '❌', ...args);
    },
    success(...args) {
      if (this.enabled) console.log(this.prefix, '✅', ...args);
    },
  };

  // ════════════════════════════════════════════
  //  سیستم Cache
  // ════════════════════════════════════════════
  const Cache = {
    store: new Map(),
    
    get(key) {
      const item = this.store.get(key);
      if (!item) return null;
      if (Date.now() - item.timestamp > DEFAULT_CONFIG.cacheTTL) {
        this.store.delete(key);
        return null;
      }
      return item.value;
    },
    
    set(key, value) {
      this.store.set(key, { value, timestamp: Date.now() });
      // محدود کردن به ۱۰۰ آیتم
      if (this.store.size > 100) {
        const firstKey = this.store.keys().next().value;
        this.store.delete(firstKey);
      }
    },
    
    clear() {
      this.store.clear();
    },
    
    hashKey(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return 'cache_' + Math.abs(hash);
    }
  };

  // ════════════════════════════════════════════
  //  سیستم Rate Limiting
  // ════════════════════════════════════════════
  const RateLimiter = {
    requests: [],
    
    canRequest() {
      const now = Date.now();
      // حذف درخواست‌های قدیمی‌تر از ۱ دقیقه
      this.requests = this.requests.filter(t => now - t < 60000);
      return this.requests.length < DEFAULT_CONFIG.rateLimitPerMinute;
    },
    
    addRequest() {
      this.requests.push(Date.now());
    },
    
    waitTime() {
      if (this.requests.length === 0) return 0;
      const oldest = this.requests[0];
      return Math.max(0, 60000 - (Date.now() - oldest));
    }
  };

  // ════════════════════════════════════════════
  //  سیستم RSS - دریافت ترندهای روز
  // ════════════════════════════════════════════
  const RSSFetcher = {
    cache: null,
    lastFetch: 0,
    TTL: 1800000,  // ۳۰ دقیقه
    
    async fetchAll() {
      if (this.cache && Date.now() - this.lastFetch < this.TTL) {
        Logger.log('استفاده از کش RSS');
        return this.cache;
      }
      
      Logger.log('در حال دریافت RSS از منابع...');
      
      // rss2json.com - سرویس رایگان تبدیل RSS به JSON
      const results = await Promise.allSettled(
        DEFAULT_CONFIG.rssSources.map(async (source) => {
          const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}&count=5`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          try {
            const res = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            if (data.status !== 'ok') throw new Error(data.message || 'RSS error');
            
            return {
              source: source.name,
              weight: source.weight,
              items: (data.items || []).slice(0, 5).map(item => ({
                title: item.title,
                link: item.link,
                description: item.description?.replace(/<[^>]+>/g, '').slice(0, 200),
                pubDate: item.pubDate,
                thumbnail: item.thumbnail || item.enclosure?.link,
                categories: item.categories || [],
              }))
            };
          } catch(e) {
            Logger.warn(`خطا در ${source.name}:`, e.message);
            return null;
          }
        })
      );
      
      const valid = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
      
      // ترکیب همه آیتم‌ها
      const allItems = [];
      valid.forEach(source => {
        source.items.forEach(item => {
          allItems.push({ ...item, source: source.source, weight: source.weight });
        });
      });
      
      // مرتب‌سازی بر اساس تاریخ
      allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      // فقط ۲۰ آیتم آخر
      this.cache = allItems.slice(0, 20);
      this.lastFetch = Date.now();
      
      Logger.success(`${this.cache.length} ترند از ${valid.length} منبع دریافت شد`);
      return this.cache;
    },
    
    // خلاصه‌سازی ترندها برای استفاده در prompt
    summarize(trends, maxItems = 10) {
      if (!trends || trends.length === 0) return '';
      
      return trends.slice(0, maxItems)
        .map((t, i) => `${i+1}. ${t.title} (${t.source})`)
        .join('\n');
    }
  };

  // ════════════════════════════════════════════
  //  کلاینت AI (چند سرویس)
  // ════════════════════════════════════════════
  const GeminiClient = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    openRouterUrl: 'https://openrouter.ai/api/v1',
    groqUrl: 'https://api.groq.com/openai/v1',
    
    async call(prompt, options = {}) {
      const config = { ...DEFAULT_CONFIG, ...(window.DP_CONFIG || {}), ...options };
      const apiKey = config.apiKey || config.geminiApiKey;
      
      if (!apiKey) {
        throw new Error('کلید API تنظیم نشده. در dp-config.js مقدار geminiApiKey را تنظیم کنید.');
      }
      
      if (!RateLimiter.canRequest()) {
        const wait = RateLimiter.waitTime();
        Logger.warn(`Rate limit! صبر کنید ${Math.ceil(wait/1000)} ثانیه`);
        await new Promise(r => setTimeout(r, wait));
      }
      RateLimiter.addRequest();
      
      // بررسی کش
      if (config.useCache) {
        const cacheKey = Cache.hashKey(JSON.stringify({ prompt, options }));
        const cached = Cache.get(cacheKey);
        if (cached) {
          Logger.log('پاسخ از کش');
          return cached;
        }
      }
      
      // انتخاب سرویس
      const provider = config.aiProvider || 'openrouter';
      let response;
      
      if (provider === 'groq') {
        response = await this.callGroq(prompt, config);
      } else if (provider === 'openrouter') {
        response = await this.callOpenRouter(prompt, config, config.openRouterKey);
      } else if (provider === 'gemini-pro') {
        response = await this.callGeminiPro(prompt, config, apiKey);
      } else if (config.aiApiType === 'interactions') {
        response = await this.callInteractions(prompt, config, apiKey);
      } else {
        response = await this.callGenerateContent(prompt, config, apiKey);
      }
      
      // ذخیره در کش
      if (config.useCache && response) {
        const cacheKey = Cache.hashKey(JSON.stringify({ prompt, options }));
        Cache.set(cacheKey, response);
      }
      
      return response;
    },
    
    /**
     * Groq - سریع‌ترین سرویس
     */
    async callGroq(prompt, config) {
      const apiKey = config.groqKey;
      if (!apiKey) throw new Error('کلید Groq تنظیم نشده');
      
      const url = `${this.groqUrl}/chat/completions`;
      
      const body = {
        model: config.groqModel || 'qwen/qwen3.8-27b',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: false,
      };
      
      let lastError;
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
          Logger.log(`Groq - تلاش ${attempt}/${config.maxRetries}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
          
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`HTTP ${res.status}: ${errData.error?.message || res.statusText}`);
          }
          
          const data = await res.json();
          
          if (data.choices?.[0]?.message?.content) {
            Logger.success(`Groq پاسخ داد (${data.usage?.total_time || '?'}s)`);
            return data.choices[0].message.content;
          }
          
          throw new Error('پاسخ نامعتبر از Groq');
        } catch(e) {
          lastError = e;
          Logger.warn(`خطا:`, e.message);
          
          if (attempt < config.maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
        }
      }
      
      throw lastError;
    },
    
    /**
     * OpenRouter - بهترین گزینه رایگان با Gemini
     * پشتیبانی از Google Search
     */
    async callOpenRouter(prompt, config, apiKey) {
      const url = `${this.openRouterUrl}/chat/completions`;
      
      const body = {
        model: config.model || 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };
      
      // فعال‌سازی Google Search از طریق OpenRouter
      if (config.useGoogleSearch || config.aiUseSearch) {
        body.plugins = [{
          id: 'web'  // OpenRouter web search plugin
        }];
      }
      
      // Retry logic
      let lastError;
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
          Logger.log(`OpenRouter - تلاش ${attempt}/${config.maxRetries}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
          
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin || 'https://digipoosh.ir',
              'X-Title': 'DigiPoosh AI',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || res.statusText;
            
            if (res.status === 429) {
              Logger.warn('Rate limit! صبر میکنیم...');
              await new Promise(r => setTimeout(r, 5000));
              continue;
            }
            
            throw new Error(`HTTP ${res.status}: ${errMsg}`);
          }
          
          const data = await res.json();
          
          if (data.choices?.[0]?.message?.content) {
            Logger.success('پاسخ از OpenRouter دریافت شد');
            return data.choices[0].message.content;
          }
          
          throw new Error('پاسخ نامعتبر از OpenRouter');
          
        } catch(e) {
          lastError = e;
          Logger.warn(`خطا:`, e.message);
          
          if (attempt < config.maxRetries) {
            const delay = Math.min(2000 * attempt, 5000);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      
      throw lastError;
    },
    
    /**
     * Gemini Pro (مستقیم) - اگه کلید قدیمی داشته باشی
     */
    async callGeminiPro(prompt, config, apiKey) {
      // تلاش اول: Interactions API
      try {
        return await this.callInteractions(prompt, config, apiKey);
      } catch(e) {
        Logger.warn('Interactions failed, trying generateContent...');
        // تلاش دوم: generateContent
        return await this.callGenerateContent(prompt, config, apiKey);
      }
    },
    
    /**
     * روش جدید: Interactions API (برای Gemma و Gemini Pro)
     */
    async callInteractions(prompt, config, apiKey) {
      const url = `${this.baseUrl}/interactions?key=${apiKey}`;
      
      const body = {
        input: prompt,
        model: config.model,
      };
      
      // اضافه کردن generation_config فقط اگه تنظیم شده
      if (config.temperature !== undefined || config.maxTokens) {
        body.generation_config = {
          temperature: config.temperature,
          max_output_tokens: config.maxTokens || 1024,
        };
      }
      
      // Retry logic
      let lastError;
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
          Logger.log(`Interactions API - تلاش ${attempt}/${config.maxRetries}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
          
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || res.statusText;
            throw new Error(`HTTP ${res.status}: ${errMsg}`);
          }
          
          const data = await res.json();
          
          // استخراج متن از Interactions API
          if (data.steps && data.steps.length > 0) {
            for (const step of data.steps) {
              if (step.type === 'model_output' && step.content) {
                const text = step.content
                  .filter(c => c.type === 'text')
                  .map(c => c.text)
                  .join('\n');
                if (text) {
                  Logger.success('پاسخ دریافت شد (Interactions)');
                  return text;
                }
              }
            }
          }
          
          if (data.output) {
            Logger.success('پاسخ دریافت شد (output)');
            return data.output;
          }
          
          throw new Error('پاسخ نامعتبر از سرور');
          
        } catch(e) {
          lastError = e;
          Logger.warn(`خطا در تلاش ${attempt}:`, e.message);
          
          if (attempt < config.maxRetries) {
            const delay = Math.min(2000 * attempt, 5000);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      
      throw lastError;
    },
    
    /**
     * روش قدیمی: generateContent API
     */
    async callGenerateContent(prompt, config, apiKey) {
      const url = `${this.baseUrl}/models/${config.model}:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          topP: config.topP,
          topK: config.topK,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      };
      
      // اضافه کردن Google Search
      if (config.useGoogleSearch) {
        body.tools = [{ googleSearch: {} }];
      }
      
      // Retry logic
      let lastError;
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
          Logger.log(`generateContent - تلاش ${attempt}/${config.maxRetries}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
          
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`HTTP ${res.status}: ${errData.error?.message || res.statusText}`);
          }
          
          const data = await res.json();
          
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            Logger.success('پاسخ دریافت شد');
            return text;
          }
          
          if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error('پاسخ به دلیل فیلتر امنیتی مسدود شد');
          }
          
          throw new Error('پاسخ نامعتبر از سرور');
        } catch(e) {
          lastError = e;
          Logger.warn(`خطا در تلاش ${attempt}:`, e.message);
          
          if (attempt < config.maxRetries) {
            const delay = Math.min(2000 * attempt, 5000);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      
      throw lastError;
    }
  };

  // ════════════════════════════════════════════
  //  ساخت پرامپت‌های فارسی
  // ════════════════════════════════════════════
  const Prompts = {
    system() {
      return `تو "دیجی AI" هستی، یک استایلیست ایرانی حرفه‌ای و دستیار مد هوشمند فروشگاه دیجی‌پوش.

قوانین پاسخ‌گویی:
- همیشه به فارسی پاسخ بده
- لحن دوستانه، مودبانه و حرفه‌ای
- از فرهنگ ایرانی آگاه باش
- به مناسبت‌های ایرانی (عید نوروز، محرم، یلدا، شب چله، ماه رمضان) توجه کن
- از اصطلاحات رایج فارسی استفاده کن
- اگه سوال مرتبط با مد نیست، مودبانه به موضوع اصلی برگردان
- پاسخ‌هایت کاربردی و قابل اجرا باشد
- از ایموجی به اندازه مناسب استفاده کن
- اگه مطمئن نیستی، صادقانه بگو
- قیمت‌ها را به تومان بگو (نه ریال)
- سایزها را با استاندارد ایرانی بگو (۳۶، ۳۸، ۴۰، ...)

تخصص‌های تو:
- پیشنهاد استایل و ست لباس
- مشاوره رنگ و ترکیب‌ها
- راهنمای سایز و اندازه
- معرفی سبک‌های مختلف
- پیشنهاد بر اساس مناسبت و فصل
- ترندهای روز دنیای مد`;
    },
    
    outfit(userPrefs, trends) {
      let trendContext = '';
      if (trends && trends.length > 0) {
        trendContext = `

📰 ترندهای اخیر دنیای مد (از منابع معتبر):
${RSSFetcher.summarize(trends, 8)}

اگه ترندی با این درخواست مرتبط هست، در پیشنهادت لحاظ کن.`;
      }
      
      return `${this.system()}

${trendContext}

کاربر درخواست پیشنهاد استایل داده:
${JSON.stringify(userPrefs, null, 2)}

لطفاً ۳ ست کامل پیشنهاد بده. برای هر ست:
- نام جذاب و کوتاه
- توضیح ۲-۳ جمله‌ای
- لیست لباس‌ها با رنگ و جنس
- دلیل پیشنهاد
- مناسب چه کسانی
- بودجه تقریبی به تومان

خروجی را به صورت JSON معتبر برگردان.`;
    },
    
    colorAdvice(skinTone, season, preferences) {
      return `${this.system()}

مشاوره رنگ برای کاربر:
- تناژ پوست: ${skinTone}
- فصل: ${season}
- ترجیحات: ${preferences || 'ندارد'}

لطفاً:
۱. ۵ رنگ اصلی پیشنهادی با نام فارسی
۲. ۳ ترکیب رنگ حرفه‌ای
۳. ۲ رنگ که نباید بپوشد
۴. یه جمله الهام‌بخش

پاسخ کوتاه و کاربردی باشد.`;
    },
    
    styleQuiz(question, options) {
      return `${this.system()}

سوال آزمون سبک:
${question}

گزینه‌ها:
${options.map((o, i) => `${i+1}. ${o}`).join('\n')}

کاربر گزینه ${options.length} را انتخاب کرده. تحلیل کوتاه بده.`;
    },
    
    chat(message, context = {}) {
      let contextStr = '';
      if (context.history && context.history.length > 0) {
        contextStr = '\n\nگفتگوهای قبلی:\n' + 
          context.history.slice(-5).map(h => 
            `${h.role === 'user' ? 'کاربر' : 'دیجی AI'}: ${h.content}`
          ).join('\n');
      }
      
      return `${this.system()}${contextStr}

پیام کاربر: ${message}

پاسخ:`;
    }
  };

  // ════════════════════════════════════════════
  //  API عمومی دیجی AI
  // ════════════════════════════════════════════
  const DP_AI = {
    version: '2.0.0',
    config: DEFAULT_CONFIG,
    Prompts,
    Cache,
    RateLimiter,
    Logger,
    
    // ═══ تنظیمات ═══
    setApiKey(key) {
      this.config.apiKey = key;
      if (window.DP_CONFIG) {
        window.DP_CONFIG.geminiApiKey = key;
        window.DP_CONFIG.apiKey = key;
      }
      Logger.success('کلید API ذخیره شد');
    },
    
    isConfigured() {
      return !!(this.config.apiKey || (window.DP_CONFIG && (window.DP_CONFIG.geminiApiKey || window.DP_CONFIG.apiKey)));
    },
    
    // ═══ روش‌های اصلی ═══
    
    /**
     * چت عمومی با Gemini
     */
    async chat(message, options = {}) {
      try {
        const trends = options.useTrends !== false ? 
          await RSSFetcher.fetchAll().catch(() => []) : [];
        
        const prompt = Prompts.chat(message, { history: options.history });
        const finalPrompt = trends.length > 0 ? 
          `${prompt}\n\n(ترندهای روز برای الهام: ${RSSFetcher.summarize(trends, 5)})` : 
          prompt;
        
        return await GeminiClient.call(finalPrompt, options);
      } catch(e) {
        Logger.error('خطا در چت:', e);
        return this.fallbackResponse(message, e);
      }
    },
    
    /**
     * پیشنهاد استایل (۳ ست)
     */
    async suggestOutfit(preferences) {
      try {
        const trends = await RSSFetcher.fetchAll().catch(() => []);
        const prompt = Prompts.outfit(preferences, trends);
        const response = await GeminiClient.call(prompt, { maxTokens: 1500 });
        
        // تلاش برای parse کردن JSON
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch {}
        
        return { text: response, raw: true };
      } catch(e) {
        Logger.error('خطا در پیشنهاد استایل:', e);
        return { error: true, message: e.message, fallback: true };
      }
    },
    
    /**
     * مشاوره رنگ
     */
    async colorAdvice(skinTone, season = 'تابستان', preferences = '') {
      try {
        const prompt = Prompts.colorAdvice(skinTone, season, preferences);
        return await GeminiClient.call(prompt, { maxTokens: 600 });
      } catch(e) {
        Logger.error('خطا در مشاوره رنگ:', e);
        return this.fallbackResponse('مشاوره رنگ', e);
      }
    },
    
    /**
     * دریافت ترندهای روز
     */
    async getTrends(force = false) {
      if (force) {
        RSSFetcher.cache = null;
        RSSFetcher.lastFetch = 0;
      }
      return await RSSFetcher.fetchAll();
    },
    
    /**
     * تحلیل آزمون سبک
     */
    async analyzeQuiz(answers) {
      try {
        const prompt = `${Prompts.system()}

پاسخ‌های آزمون سبست کاربر:
${JSON.stringify(answers, null, 2)}

بر اساس پاسخ‌ها، پروفایل سبک کاربر را در ۵۰ کلمه تحلیل کن:
- سبک اصلی
- رنگ‌های مناسب
- مناسبت‌های ایرانی که می‌پسندد
- یه جمله تشویقی`;
        
        return await GeminiClient.call(prompt, { maxTokens: 300, temperature: 0.8 });
      } catch(e) {
        return this.fallbackResponse('تحلیل آزمون', e);
      }
    },
    
    // ═══ Fallback ═══
    fallbackResponse(message, error) {
      Logger.warn('استفاده از پاسخ پیش‌فرض');
      
      const fallbacks = [
        '🌟 سلام! من دیجی AI هستم.\nدر حال حاضر در حالت آفلاین هستم.\n\nبرای فعال‌سازی کامل:\n۱. فایل `seller/js/dp-config.js` را باز کنید\n۲. کلید Gemini را در `geminiApiKey` قرار دهید\n۳. صفحه را refresh کنید\n\n📖 راهنما: https://aistudio.google.com/app/apikey',
        
        '👋 متأسفانه الان نتونستم به اینترنت وصل بشم.\nولی میتونم کمکت کنم:\n\n• فروشگاه ما رو مرور کن\n• از فیلترهای سمت راست استفاده کن\n• یا دوباره تلاش کن\n\n💎 ترفند: سوالت رو کوتاه‌تر بپرس!',
        
        '🤖 سلام!\nمن در حال ارتقا هستم.\nفعلاً می‌تونی:\n\n✅ محصولات رو با فیلتر جستجو کنی\n✅ از منوی دسته‌بندی استفاده کنی\n✅ بعداً دوباره سر بزنی\n\n📅 ترندهای روز به زودی اضافه می‌شود!',
      ];
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },
    
    // ═══ ابزارها ═══
    clearCache() {
      Cache.clear();
      Logger.success('کش پاک شد');
    },
    
    getStatus() {
      return {
        configured: this.isConfigured(),
        cacheSize: Cache.store.size,
        rateLimitRemaining: DEFAULT_CONFIG.rateLimitPerMinute - RateLimiter.requests.length,
        model: this.config.model,
        version: this.version,
        searchEnabled: this.config.useGoogleSearch,
        rssEnabled: this.config.useRSS,
        rssLastFetch: RSSFetcher.lastFetch ? new Date(RSSFetcher.lastFetch).toLocaleString('fa-IR') : 'هنوز',
      };
    }
  };

  // ════════════════════════════════════════════
  //  Export
  // ════════════════════════════════════════════
  window.DP_AI = DP_AI;
  
  // بارگذاری خودکار کلید از DP_CONFIG
  if (window.DP_CONFIG) {
    if (window.DP_CONFIG.geminiApiKey) {
      DP_AI.config.apiKey = window.DP_CONFIG.geminiApiKey;
    } else if (window.DP_CONFIG.apiKey) {
      DP_AI.config.apiKey = window.DP_CONFIG.apiKey;
    }
  }
  
  Logger.success(`نسخه ${DP_AI.version} بارگذاری شد`);
  Logger.log('وضعیت:', DP_AI.getStatus());
  
})();
