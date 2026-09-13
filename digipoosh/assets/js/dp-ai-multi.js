/**
 * ============================================================
 *  دیجی‌پوش — کلاینت هوشمند چندگانه
 *  ------------------------------------------------------------
 *  چندین روش برای اتصال:
 *  1. CORS Proxy (رایگان، فوری)
 *  2. Vercel Function (بعداً)
 *  3. مستقیم (اگه کاربر فیلترشکن داره)
 *  ============================================================
 */
(function() {
  'use strict';
  
  const MultiAIClient = {
    
    // ═══ روش ۱: CORS Proxy (فوری) ═══
    corsProxies: [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
    ],
    
    /**
     * ارسال از طریق CORS Proxy
     */
    async sendViaProxy(url, options, proxyIndex = 0) {
      if (proxyIndex >= this.corsProxies.length) {
        throw new Error('همه CORS Proxy ها شکست خوردن');
      }
      
      const proxy = this.corsProxies[proxyIndex];
      const proxiedUrl = proxy + encodeURIComponent(url);
      
      try {
        const res = await fetch(proxiedUrl, options);
        return res;
      } catch(e) {
        console.warn(`Proxy ${proxy} failed:`, e.message);
        return await this.sendViaProxy(url, options, proxyIndex + 1);
      }
    },
    
    /**
     * چت از طریق CORS Proxy
     */
    async chatViaProxy(prompt, provider = 'groq') {
      let url, body, headers;
      
      if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        };
        body = JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        });
      } else if (provider === 'openrouter') {
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        };
        body = JSON.stringify({
          model: 'minimax/minimax-m2.7:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        });
      } else if (provider === 'gemini') {
        url = 'https://generativelanguage.googleapis.com/v1beta/interactions?key=AQ.Ab8RN6In7ZJZNBZpjwly3_Pr8EynQ-KRygH5qbIxH8bohCNKBw';
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify({
          input: prompt,
          model: 'gemma-4-31b-it',
        });
      }
      
      const res = await this.sendViaProxy(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      
      const data = await res.json();
      
      // استخراج متن
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
      
      return 'پاسخی دریافت نشد';
    },
    
    /**
     * چت هوشمند (خودکار)
     */
    async smartChat(prompt) {
      // ۱. اول Groq (سریع‌ترین)
      try {
        const result = await this.chatViaProxy(prompt, 'groq');
        if (result) return { text: result, provider: 'groq' };
      } catch(e) {
        console.warn('Groq failed:', e.message);
      }
      
      // ۲. بعد OpenRouter
      try {
        const result = await this.chatViaProxy(prompt, 'openrouter');
        if (result) return { text: result, provider: 'openrouter' };
      } catch(e) {
        console.warn('OpenRouter failed:', e.message);
      }
      
      // ۳. بعد Gemini
      try {
        const result = await this.chatViaProxy(prompt, 'gemini');
        if (result) return { text: result, provider: 'gemini' };
      } catch(e) {
        console.warn('Gemini failed:', e.message);
      }
      
      throw new Error('همه AI ها شکست خوردن');
    },
  };
  
  window.DP_Multi = MultiAIClient;
  console.log('✅ Multi AI Client آماده');
  
})();
