/**
 * DigiPoosh AI - Hugging Face Space
 * سرور Express برای پروکسی AI
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ═══ کلیدها از Environment Variables ═══
const KEYS = {
  gemini: process.env.GEMINI_API_KEY || '',
  openrouter: process.env.OPENROUTER_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
};

// ═══ توابع فراخوانی AI ═══

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

// ═══ Route: چت ═══
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'پیام خالی است' });
    }
    
    // ساخت prompt
    let fullPrompt = '';
    if (history.length > 0) {
      fullPrompt = history.map(h => 
        `${h.role === 'user' ? 'کاربر' : 'دیجی AI'}: ${h.content}`
      ).join('\n') + '\n';
    }
    fullPrompt += `کاربر: ${message}\nدیجی AI:`;
    
    // Fallback: Groq → OpenRouter → Gemini
    let response, provider;
    try {
      response = await callGroq(fullPrompt);
      provider = 'groq';
    } catch(e) {
      try {
        response = await callOpenRouter(fullPrompt);
        provider = 'openrouter';
      } catch(e2) {
        response = await callGemini(fullPrompt);
        provider = 'gemini';
      }
    }
    
    res.json({
      success: true,
      response: response,
      provider: provider,
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══ Route: ترندها ═══
app.get('/api/trends', async (req, res) => {
  try {
    const sources = [
      { url: 'https://www.vogue.com/feed/rss', name: 'Vogue' },
      { url: 'https://www.gq.com/feed/rss', name: 'GQ' },
      { url: 'https://www.elle.com/feed/rss', name: 'ELLE' },
    ];
    
    const allTrends = [];
    for (const source of sources) {
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
          })));
        }
      } catch(e) { continue; }
    }
    
    res.json({ success: true, count: allTrends.length, trends: allTrends });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══ Route: Health ═══
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DigiPoosh AI', time: new Date().toISOString() });
});

// ═══ Root ═══
app.get('/', (req, res) => {
  res.json({
    service: 'DigiPoosh AI',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      trends: 'GET /api/trends',
      health: 'GET /api/health',
    },
  });
});

// ═══ شروع سرور ═══
const PORT = process.env.PORT || 7860;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DigiPoosh AI در حال اجرا روی پورت ${PORT}`);
});
