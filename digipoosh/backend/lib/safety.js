/**
 * دیجی‌پوش — تور ایمنی مسیرهای API
 * ------------------------------------------------------------
 * چرا لازم شد؟
 *
 * هیچ‌کدام از ۳۸ مسیر `try/catch` نداشتند. یعنی اگر خطای
 * پیش‌بینی‌نشده‌ای رخ می‌داد — مثلاً پاسخ ناقص از Supabase یا
 * `undefined` جایی که شیء انتظار می‌رفت — کل درخواست با یک
 * ردیابیِ خام (stack trace) می‌شکست.
 *
 * دو مشکل داشت:
 *   ۱) کاربر صفحه‌ی خطای انگلیسی و بی‌معنا می‌دید
 *   ۲) ردیابی خام ساختار داخلی سامانه را لو می‌داد
 *
 * این پوشش دور هر مسیر می‌پیچد و:
 *   • خطا را در سرور ثبت می‌کند (با شناسه‌ی یکتا برای پیگیری)
 *   • به کاربر پیام فارسی روشن می‌دهد
 *   • جلوی پاسخ دوباره را می‌گیرد (اگر هدر رفته باشد)
 *   • درخواست‌های کند را علامت می‌زند تا بعداً بهینه شوند
 */
import { fail } from './helpers';

/** درخواست کندتر از این، در لاگ هشدار می‌گیرد (میلی‌ثانیه) */
const SLOW_MS = 1500;

/** شناسه‌ی کوتاه برای پیگیری خطا در لاگ */
function traceId() {
  return Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5);
}

export function withSafety(handler) {
  return async function safeHandler(req, res) {
    const started = Date.now();

    try {
      const out = await handler(req, res);

      /*
       * اگر مسیری فراموش کرده پاسخ بدهد، درخواست تا انقضا
       * باز می‌ماند و کاربر منتظر می‌ماند. اینجا می‌بندیمش.
       */
      if (!res.headersSent) {
        console.error('[api] بدون پاسخ:', req.method, req.url);
        fail(res, 'پاسخی از سرور نیامد. دوباره تلاش کنید.', 500);
      }

      const took = Date.now() - started;
      if (took > SLOW_MS) {
        console.warn('[api] کند:', req.method, req.url, took + 'ms');
      }

      return out;

    } catch (e) {
      const id = traceId();

      /* جزئیات کامل فقط در سرور می‌ماند */
      console.error(
        `[api:${id}]`, req.method, req.url,
        '\n  پیام:', e?.message,
        '\n  جا:', (e?.stack || '').split('\n')[1]?.trim()
      );

      if (res.headersSent) return;   /* پاسخ رفته — چیزی نمی‌شود کرد */

      /* خطای شبکه به Supabase — کاربر باید بداند مشکل موقتی است */
      if (/fetch failed|ECONNREFUSED|ETIMEDOUT|network/i.test(e?.message || '')) {
        return fail(res, 'ارتباط با سرور برقرار نشد. چند لحظه بعد دوباره تلاش کنید.',
                    503, { trace: id });
      }

      /* بدنه‌ی JSON خراب */
      if (e instanceof SyntaxError) {
        return fail(res, 'داده‌ی ارسالی خوانا نبود.', 400, { trace: id });
      }

      return fail(res, 'خطای غیرمنتظره‌ای رخ داد. اگر تکرار شد با پشتیبانی تماس بگیرید.',
                  500, { trace: id });
    }
  };
}
