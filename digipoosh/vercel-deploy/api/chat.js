/**
 * Vercel Serverless Function
 * Path: /api/chat
 */
const KEYS = {
  gemini: process.env.GEMINI_API_KEY || '',
  openrouter: process.env.OPENROUTER_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
};

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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
    
    // سعی با Groq (سریع‌ترین)
    let response, provider;
    try {
      response = await callGroq(fullPrompt);
      provider = 'groq';
    } catch(e) {
      // OpenRouter
      try {
        response = await callOpenRouter(fullPrompt);
        provider = 'openrouter';
      } catch(e2) {
        // Gemini
        response = await callGemini(fullPrompt);
        provider = 'gemini';
      }
    }
    
    return res.status(200).json({
      success: true,
      response: response,
      provider: provider,
    });
    
  } catch(error) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
