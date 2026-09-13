# ☁️ راهنمای Cloudflare Worker - دیجی‌پوش AI

## 🎯 هدف:
پروکسی رایگان برای اینکه کاربران ایرانی بدون فیلترشکن از AI استفاده کنن.

## 📋 مراحل Deploy:

### ۱. نصب Wrangler (CLI)
```bash
npm install -g wrangler
```

### ۲. لاگین به Cloudflare
```bash
wrangler login
```
(مرورگر باز میشه، لاگین کن)

### ۳. تنظیم کلیدها (Secrets)
```bash
wrangler secret put GEMINI_API_KEY
# کلید Gemini رو بچسبون و Enter بزن

wrangler secret put OPENROUTER_API_KEY
# کلید OpenRouter رو بچسبون

wrangler secret put GROQ_API_KEY
# کلید Groq رو بچسبون
```

### ۴. Deploy
```bash
wrangler deploy
```

بعد از چند ثانیه، URL Worker رو میده:
```
https://digipoosh-ai.workers.dev
```

---

## 🔌 استفاده از سایت:

### تغییر `dp-config.js`:
```javascript
window.DP_CONFIG = {
  // ... تنظیمات قبلی
  
  // استفاده از Worker به جای API مستقیم
  useWorker: true,
  workerUrl: 'https://digipoosh-ai.workers.dev',
};
```

### فراخوانی از Frontend:
```javascript
async function askViaWorker(question) {
  const res = await fetch('https://digipoosh-ai.workers.dev/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question })
  });
  return await res.json();
}
```

---

## 📊 Endpoints:

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/` | اطلاعات سرویس |
| `GET` | `/api/health` | چک سلامت |
| `POST` | `/api/chat` | چت با AI |
| `GET` | `/api/trends` | ترندهای روز |

---

## 💰 هزینه:

```
✅ رایگان: ۱۰۰,۰۰۰ درخواست/روز
✅ بدون محدودیت ترافیک
✅ بدون نیاز به کارت اعتباری
```

---

## 🔒 امنیت:

```
✅ کلیدها در Environment Variables (مخفی)
✅ HTTPS خودکار
✅ CORS تنظیم شده
✅ فقط origin های مجاز
```

---

## 🧪 تست محلی:

```bash
wrangler dev
```

بعد در مرورگر:
```
http://localhost:8787
```

میتونی API رو تست کنی.
