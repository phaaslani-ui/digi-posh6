/* ============================================================
   دیجی‌پوش — تنظیمات Hybrid AI (۵ لایه)
   ------------------------------------------------------------
   لایه ۱: 🟢 Gemma مستقیم (رایگان، نامحدود)
   لایه ۲: 🟡 OpenRouter (Gemini + DeepSeek رایگان)
   لایه ۳: 🟣 Groq (سریع‌ترین، ۱۴K/روز)
   لایه ۴: 🟠 NVIDIA (استدلال قوی)
   لایه ۵: 🔵 RSS (ترندها، ۸ منبع)
   ============================================================ */

window.DP_CONFIG = {
  // ═══ Supabase (اختیاری) ═══
  supabaseUrl: '',
  supabaseAnonKey: '',
  commissionRate: 10,
  
  // ═══ لایه ۱: Gemma (مستقیم) ═══
  geminiApiKey: 'AQ.Ab8RN6In7ZJZNBZpjwly3_Pr8EynQ-KRygH5qbIxH8bohCNKBw',
  aiModel: 'gemma-4-31b-it',
  aiApiType: 'interactions',
  
  // ═══ لایه ۲: OpenRouter ═══
  openRouterKey: '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',
  openRouterModel: 'minimax/minimax-m2.7:free',
  
  // ═══ لایه ۳: Groq (سریع) ═══
  groqKey: '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',
  groqModel: 'qwen/qwen3.8-27b',  // سریع‌ترین و فارسی خوب
  
  // ═══ Cloudflare Worker (پروکسی) ═══
  // بعد از Deploy، URL Worker رو اینجا بذار
  useWorker: true,
  workerUrl: 'https://digiposh.phaaslani.workers.dev',  // ← Cloudflare Worker
  
  // ═══ تنظیمات ═══
  aiProvider: 'hybrid',      // 'gemma' | 'openrouter' | 'groq' | 'hybrid'
  aiUseRSS: true,
  aiUseSearch: true,
  aiTemperature: 0.7,
  aiMaxTokens: 1024,
};
