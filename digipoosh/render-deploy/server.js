/**
 * DigiPoosh AI Proxy - Render.com
 * سرور Node.js با Express
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ═══ کلیدها ═══
const KEYS = {
  gemini: process.env.GEMINI_API_KEY || '',
  openrouter: process.env.OPENROUTER_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
};

// ═══ Groq (سریع‌ترین) ═══
async function callGroq(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEYS.groq}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

// ═══ OpenRouter ═══
async function callOpenRouter(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEYS.openrouter}`,
      'HTTP-Referer': 'https://digipoosh.ir',
      'X-Title': 'DigiPoosh',
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.7:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

// ═══ Gemini (Gemma) ═══
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${KEYS.gemini}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: prompt,
      model: 'gemma-4-31b-it',
    }),
  });
  const data = await res.json();
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

// ═══ Health Check ═══
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'DigiPoosh AI',
    time: new Date().toISOString(),
  });
});

// ═══ Chat API ═══
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'پیام خالی است' });
    }
    
    // ساخت prompt کامل
    let fullPrompt = '';
    if (history.length > 0) {
      fullPrompt = history.map(h => 
        `${h.role === 'user' ? 'کاربر' : 'دیجی AI'}: ${h.content}`
      ).join('\n') + '\n';
    }
    fullPrompt += `کاربر: ${message}\nدیجی AI:`;
    
    // تلاش: Groq → OpenRouter → Gemini
    let response, provider;
    try {
      response = await callGroq(fullPrompt);
      provider = 'groq';
    } catch(e) {
      console.log('Groq failed, trying OpenRouter...');
      try {
        response = await callOpenRouter(fullPrompt);
        provider = 'openrouter';
      } catch(e2) {
        console.log('OpenRouter failed, trying Gemini...');
        response = await callGemini(fullPrompt);
        provider = 'gemini';
      }
    }
    
    return res.json({
      success: true,
      response: response,
      provider: provider,
    });
    
  } catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ═══ Trends API ═══
app.get('/api/trends', async (req, res) => {
  try {
    const RSS_SOURCES = [
      { url: 'https://www.vogue.com/feed/rss', name: 'Vogue' },
      { url: 'https://www.gq.com/feed/rss', name: 'GQ' },
      { url: 'https://www.elle.com/feed/rss', name: 'ELLE' },
    ];
    
    const allTrends = [];
    
    for (const source of RSS_SOURCES) {
      try {
        const r = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}&count=3`
        );
        const data = await r.json();
        
        if (data.status === 'ok' && data.items) {
          allTrends.push(...data.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            source: source.name,
            pubDate: item.pubDate,
          })));
        }
      } catch(e) {
        continue;
      }
    }
    
    return res.json({
      success: true,
      count: allTrends.length,
      trends: allTrends,
    });
  } catch(e) {
    return res.status(500).json({ 
      success: false, 
      error: e.message 
    });
  }
});

// ═══ Start Server ═══
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DigiPoosh AI running on port ${PORT}`);
});
