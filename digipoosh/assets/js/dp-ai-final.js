/**
 * ============================================================
 *  دیجی‌پوش — سیستم نهایی AI
 *  ------------------------------------------------------------
 *  چند لایه با Fallback خودکار:
 *  1. CORS Proxy (سریع، رایگان، بدون Deploy)
 *  2. Vercel Function (بعد از Deploy)
 *  3. RSS (ترندها)
 *  4. پاسخ پیش‌فرض (آخرین راه)
 *  ============================================================
 */
(function() {
  'use strict';
  
  const FinalAI = {
    
    /**
     * ارسال از CORS Proxy
     */
    async viaProxy(url, options, proxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
    ]) {
      for (const proxy of proxies) {
        try {
          const fullUrl = proxy + encodeURIComponent(url);
          const res = await fetch(fullUrl, options);
          if (res.ok) return res;
        } catch(e) {
          continue;
        }
      }
      throw new Error('همه Proxy ها شکست خوردن');
    },
    
    /**
     * چت هوشمند
     */
    async chat(prompt, provider = null) {
      const providers = ['groq', 'openrouter', 'gemini'];
      const chosen = provider ? [provider] : providers;
      
      for (const p of chosen) {
        try {
          const result = await this.callProvider(p, prompt);
          if (result) return { text: result, provider: p };
        } catch(e) {
          console.warn(`${p} شکست:`, e.message);
        }
      }
      
      // آخرین راه: پاسخ پیش‌فرض
      return {
        text: this.getFallbackResponse(prompt),
        provider: 'fallback',
        isOffline: true,
      };
    },
    
    /**
     * فراخوانی یک provider
     */
    async callProvider(provider, prompt) {
      let url, body, headers = { 'Content-Type': 'application/json' };
      
      if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = 'Bearer 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';
        body = JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        });
      } else if (provider === 'openrouter') {
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = 'Bearer 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';
        body = JSON.stringify({
          model: 'minimax/minimax-m2.7:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        });
      } else if (provider === 'gemini') {
        url = 'https://generativelanguage.googleapis.com/v1beta/interactions?key=AQ.Ab8RN6In7ZJZNBZpjwly3_Pr8EynQ-KRygH5qbIxH8bohCNKBw';
        body = JSON.stringify({
          input: prompt,
          model: 'gemma-4-31b-it',
        });
      }
      
      const res = await this.viaProxy(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      
      const data = await res.json();
      
      if (provider === 'groq' || provider === 'openrouter') {
        return data.choices?.[0]?.message?.content;
      } else if (provider === 'gemini') {
        if (data.steps) {
          for (const step of data.steps) {
            if (step.type === 'model_output' && step.content) {
              return step.content
                .filter(c => c.type === 'text')
                .map(c => c.text)
                .join('\n');
            }
          }
        }
        return data.output;
      }
    },
    
    /**
     * پاسخ پیش‌فرض (آفلاین)
     */
    getFallbackResponse(prompt) {
      const responses = {
        'سلام': 'سلام! 👋 من دیجی AI هستم.\n\nدر حال حاضر در حالت آفلاین هستم، ولی می‌تونم کمکت کنم:\n\n• از منوی سایت محصولات رو ببین\n• از فیلترهای سمت راست استفاده کن\n• بعداً دوباره چت کن\n\n📞 اگه مشکلی داری، با پشتیبانی تماس بگیر.',
        'رنگ': 'برای انتخاب رنگ مناسب:\n\n🎨 رنگ‌های گرم (قرمز، نارنجی):\n   - برای پوست‌های روشن\n   - ایجاد انرژی و شادی\n\n🎨 رنگ‌های سرد (آبی، سبز):\n   - برای پوست‌های تیره\n   - ایجاد آرامش\n\n🎨 رنگ‌های خنثی (مشکی، سفید، طوسی):\n   - برای هر رنگ پوستی\n   - ست کردن آسان\n\n💎 نکته طلایی: رنگی رو بپوش که حس خوبی بهت میده!',
        'default': 'سلام! 👋\n\nمن دیجی AI هستم. الان در حالت آفلاین هستم.\n\nولی می‌تونم کمکت کنم:\n\n🛍️ محصولات سایت رو ببین\n🔍 از فیلترها استفاده کن\n📞 با پشتیبانی تماس بگیر\n\nیا دوباره بعداً چت کن!',
      };
      
      // تشخیص موضوع
      if (prompt.includes('سلام') || prompt.includes('درود')) return responses['سلام'];
      if (prompt.includes('رنگ')) return responses['رنگ'];
      
      return responses['default'];
    },
  };
  
  window.DP_FinalAI = FinalAI;
  console.log('✅ Final AI System آماده (بدون نیاز به Deploy)');
  
})();
