/**
 * ============================================================
 *  دیجی‌پوش — Cloudflare Worker (پروکسی AI)
 *  ------------------------------------------------------------
 *  وظیفه: دریافت درخواست از کاربر ایرانی → ارسال به AI → برگشت
 *  مزیت: کاربر بدون فیلترشکن استفاده میکنه
 *  ============================================================
 */

// ═══ تنظیمات API Keys (از Environment Variables) ═══
const CONFIG = {
  // این مقادیر رو در Cloudflare Dashboard تنظیم کن
  // یا با wrangler secret put اضافه کن
  
  geminiKey: '',          // Google Gemini API Key
  openRouterKey: '',      // OpenRouter API Key
  groqKey: '',            // Groq API Key
  
  // Allowed origins
  allowedOrigins: [
    'https://digipoosh.ir',
    'https://www.digipoosh.ir',
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
  ]
};

// ═══ CORS Headers ═══
function corsHeaders(origin) {
  const allowedOrigin = CONFIG.allowedOrigins.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// ═══ JSON Response Helper ═══
function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}

// ═══ Error Response ═══
function errorResponse(message, status = 500, origin = '*') {
  return jsonResponse({ 
    success: false, 
    error: message,
    timestamp: new Date().toISOString(),
  }, status, origin);
}

// ═══ Google Gemini API Call ═══
async function callGemini(prompt, model = 'gemma-4-31b-it') {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${CONFIG.geminiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: prompt,
      model: model,
    }),
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }
  
  const data = await response.json();
  
  // استخراج متن
  if (data.steps && data.steps.length > 0) {
    for (const step of data.steps) {
      if (step.type === 'model_output' && step.content) {
        return step.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');
      }
    }
  }
  
  return data.output || 'پاسخی دریافت نشد';
}

// ═══ OpenRouter API Call ═══
async function callOpenRouter(prompt, model = 'minimax/minimax-m2.7:free') {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openRouterKey}`,
      'HTTP-Referer': 'https://digipoosh.ir',
      'X-Title': 'DigiPoosh AI',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${err}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'پاسخی دریافت نشد';
}

// ═══ Groq API Call ═══
async function callGroq(prompt, model = 'qwen/qwen3.8-27b') {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.groqKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error: ${response.status} - ${err}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'پاسخی دریافت نشد';
}

// ═══ انتخاب بهترین AI ═══
async function callBestAI(prompt, provider = null) {
  // اگه provider مشخص شده، فقط اون رو امتحان کن
  if (provider) {
    switch(provider) {
      case 'gemini':    return await callGemini(prompt);
      case 'openrouter': return await callOpenRouter(prompt);
      case 'groq':      return await callGroq(prompt);
    }
  }
  
  // تشخیص خودکار: سعی کن همه رو
  const errors = [];
  
  // ۱. Groq (سریع‌ترین)
  if (CONFIG.groqKey) {
    try {
      const result = await callGroq(prompt);
      return { text: result, provider: 'groq' };
    } catch(e) {
      errors.push(`Groq: ${e.message}`);
    }
  }
  
  // ۲. OpenRouter
  if (CONFIG.openRouterKey) {
    try {
      const result = await callOpenRouter(prompt);
      return { text: result, provider: 'openrouter' };
    } catch(e) {
      errors.push(`OpenRouter: ${e.message}`);
    }
  }
  
  // ۳. Gemini
  if (CONFIG.geminiKey) {
    try {
      const result = await callGemini(prompt);
      return { text: result, provider: 'gemini' };
    } catch(e) {
      errors.push(`Gemini: ${e.message}`);
    }
  }
  
  throw new Error('همه AI ها شکست خوردن: ' + errors.join(' | '));
}

// ═══ Main Handler ═══
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '*';
    
    // بارگذاری کلیدها از env
    if (env.GEMINI_API_KEY) CONFIG.geminiKey = env.GEMINI_API_KEY;
    if (env.OPENROUTER_API_KEY) CONFIG.openRouterKey = env.OPENROUTER_API_KEY;
    if (env.GROQ_API_KEY) CONFIG.groqKey = env.GROQ_API_KEY;
    
    // ═══ Handle CORS Preflight ═══
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }
    
    // ═══ فقط POST و GET ═══
    if (!['GET', 'POST'].includes(request.method)) {
      return errorResponse('Method not allowed', 405, origin);
    }
    
    const url = new URL(request.url);
    
    // ═══ Route: GET / (اطلاعات) ═══
    if (request.method === 'GET' && url.pathname === '/') {
      return jsonResponse({
        service: 'DigiPoosh AI Proxy',
        version: '1.0.0',
        status: 'online',
        providers: {
          gemini: !!CONFIG.geminiKey,
          openrouter: !!CONFIG.openRouterKey,
          groq: !!CONFIG.groqKey,
        },
        endpoints: {
          chat: 'POST /api/chat',
          trends: 'GET /api/trends',
          health: 'GET /api/health',
        },
        timestamp: new Date().toISOString(),
      }, 200, origin);
    }
    
    // ═══ Route: GET /api/health ═══
    if (url.pathname === '/api/health') {
      return jsonResponse({ 
        status: 'ok', 
        uptime: 'running',
        timestamp: new Date().toISOString(),
      }, 200, origin);
    }
    
    // ═══ Route: POST /api/chat ═══
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { 
          message, 
          prompt,
          provider, 
          model,
          history = [],
          temperature = 0.7,
        } = body;
        
        const userMessage = message || prompt;
        
        if (!userMessage) {
          return errorResponse('پیام خالی است', 400, origin);
        }
        
        // ساخت prompt کامل با تاریخچه
        let fullPrompt = '';
        if (history.length > 0) {
          fullPrompt = history.map(h => 
            `${h.role === 'user' ? 'کاربر' : 'دیجی AI'}: ${h.content}`
          ).join('\n') + '\n';
        }
        fullPrompt += `کاربر: ${userMessage}\nدیجی AI:`;
        
        // فراخوانی AI
        const result = await callBestAI(fullPrompt, provider);
        
        return jsonResponse({
          success: true,
          response: result.text || result,
          provider: result.provider || provider || 'auto',
          timestamp: new Date().toISOString(),
        }, 200, origin);
        
      } catch(e) {
        return errorResponse(e.message, 500, origin);
      }
    }
    
    // ═══ Route: GET /api/trends (از RSS) ═══
    if (url.pathname === '/api/trends') {
      try {
        const rssSources = [
          'https://www.vogue.com/feed/rss',
          'https://www.harpersbazaar.com/feed/rss',
          'https://www.elle.com/feed/rss',
          'https://www.gq.com/feed/rss',
        ];
        
        const allTrends = [];
        for (const rssUrl of rssSources) {
          try {
            const res = await fetch(
              `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=3`
            );
            const data = await res.json();
            if (data.status === 'ok') {
              allTrends.push(...data.items.slice(0, 3).map(item => ({
                title: item.title,
                link: item.link,
                source: data.feed.title,
                pubDate: item.pubDate,
              })));
            }
          } catch(e) {
            // ادامه بده
          }
        }
        
        return jsonResponse({
          success: true,
          count: allTrends.length,
          trends: allTrends,
        }, 200, origin);
        
      } catch(e) {
        return errorResponse(e.message, 500, origin);
      }
    }
    
    // ═══ 404 ═══
    return errorResponse('Endpoint not found', 404, origin);
  },
};
