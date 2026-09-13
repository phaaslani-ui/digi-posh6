/**
 * دیجی‌پوش — لایه‌ی محافظ مشترک همه‌ی مسیرها
 * ------------------------------------------------------------
 * سه مشکل را حل می‌کند که در بازرسی پیدا شدند:
 *
 *   ۱) پیام خطای خام پایگاه داده به کاربر می‌رسید.
 *      «duplicate key value violates unique constraint
 *       users_email_key» هم برای کاربر بی‌معناست و هم به
 *      مهاجم می‌گوید ساختار جدول‌ها چیست.
 *
 *   ۲) هیچ محدودیتی روی اندازه‌ی درخواست نبود.
 *
 *   ۳) هیچ ردی از کارهای حساس نگه داشته نمی‌شد.
 */
import { supabaseAdmin } from './supabase';
import { fail, clientIp } from './helpers';

/* ============================================================
   ۱. ترجمه‌ی خطای پایگاه داده به زبان آدمیزاد
   ============================================================ */
const PG = {
  '23505': 'این مورد از قبل ثبت شده است.',
  '23503': 'این مورد به رکورد دیگری وابسته است و حذف نمی‌شود.',
  '23514': 'مقدار واردشده با قواعد سامانه سازگار نیست.',
  '23502': 'یکی از فیلدهای الزامی خالی است.',
  '22001': 'متن واردشده بیش از حد بلند است.',
  '22003': 'عدد واردشده خارج از محدوده‌ی مجاز است.',
  '42501': 'به این عملیات دسترسی ندارید.',
  'PGRST116': 'موردی پیدا نشد.',
};

/**
 * خطای Supabase را به پاسخ امن تبدیل می‌کند.
 *
 * جزئیات فنی فقط در لاگ سرور می‌ماند؛ کاربر پیام روشن فارسی
 * می‌گیرد. اگر خطا از قواعد خود ما باشد (مثل تریگر موجودی)
 * همان پیام فارسی مستقیم برگردانده می‌شود.
 */
export function dbFail(res, error, fallback = 'انجام این کار ممکن نشد.') {
  const msg = String(error?.message || '');

  /* پیام‌های فارسی خودمان (از تریگرها) امن‌اند */
  if (/[\u0600-\u06FF]/.test(msg)) {
    return fail(res, msg, 409);
  }

  const known = PG[error?.code];
  if (!known) {
    /* فقط در سرور ثبت می‌شود، نه در پاسخ */
    console.error('[db]', error?.code || '-', msg);
  }

  return fail(res, known || fallback, known ? 409 : 500);
}

/* ============================================================
   ۲. محدودیت اندازه‌ی درخواست
   ------------------------------------------------------------
   عکس‌ها به شکل data URL می‌آیند و می‌توانند بزرگ باشند.
   بدون سقف، یک درخواست می‌تواند حافظه‌ی سرور را پر کند.
   ============================================================ */
export function bodyTooBig(req, res, maxKb = 512) {
  const len = Number(req.headers['content-length'] || 0);
  if (len > maxKb * 1024) {
    fail(res, `حجم درخواست بیش از ${maxKb} کیلوبایت است.`, 413);
    return true;
  }
  return false;
}

/* ============================================================
   ۳. دفتر رویدادهای حساس
   ------------------------------------------------------------
   هر کار مهم (تأیید فروشگاه، تغییر قیمت، لغو سفارش) یک ردیف
   می‌سازد. وقتی روزی چیزی اشتباه شد، باید بشود فهمید چه کسی
   و کِی آن را عوض کرده.
   ============================================================ */
export async function audit(req, actor, action, detail = {}) {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.from('audit_log').insert({
      actor_id: actor?.id || null,
      actor_email: actor?.email || null,
      action,
      detail,
      ip: clientIp(req),
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
    });
  } catch (e) {
    /* ثبت رویداد هرگز نباید خودِ عملیات را بشکند */
    console.error('[audit]', e?.message);
  }
}

/* ============================================================
   ۴. پاک‌سازی ورودی متنی
   ------------------------------------------------------------
   هر متنی که از کاربر می‌آید از اینجا رد می‌شود: فاصله‌های
   اضافه حذف، طول محدود، و نویسه‌های کنترلی نامرئی پاک.
   ============================================================ */
export function text(v, max = 200) {
  return String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** متن چندخطی — شکست خط حفظ می‌شود */
export function multiline(v, max = 2000) {
  return String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** ایمیل — یکدست و کوچک */
export function email(v) {
  const s = text(v, 160).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null;
}

/**
 * نشانی تصویر — فقط data URL تصویری یا نشانی https.
 * بدون این، می‌شد `javascript:` یا اسکریپت درون data URL فرستاد.
 */
export function imageSrc(v, maxKb = 900) {
  const s = String(v ?? '').trim();

  if (s.startsWith('data:image/')) {
    const okType = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(s);
    if (!okType) return null;
    if (s.length > maxKb * 1024) return null;
    return s;
  }

  if (/^https:\/\/[^\s"'<>]+$/i.test(s) && s.length < 600) return s;
  return null;
}

export function imageList(arr, max = 6) {
  if (!Array.isArray(arr)) return [];
  return arr.map(imageSrc).filter(Boolean).slice(0, max);
}

/* ============================================================
   ۵. صفحه‌بندی امن با سقف
   ============================================================ */
export function safePage(query, maxLimit = 60) {
  /*
   * ورودی نامعتبر همیشه به پیش‌فرض برمی‌گردد، نه به عددی
   * تصادفی. پیش‌تر `parseInt` نتیجه‌های عجیب می‌داد:
   *   '1e9'  → ۱   (چون parseInt در «e» می‌ایستد)
   *   '12.7' → ۱۲
   *   '-5'   → ۱   ولی '0' → ۱۲
   * حالا هر چیزی که عدد صحیح مثبت نباشد، پیش‌فرض می‌گیرد.
   */
  const num = (v, def, min, max) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    const i = Math.floor(n);
    if (i < min) return def;
    return Math.min(max, i);
  };

  const page  = num(query.page,  1,  1, 5000);
  const limit = num(query.limit, 12, 1, maxLimit);

  return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}

/* ============================================================
   ۶. متن جست‌وجوی امن
   ------------------------------------------------------------
   نویسه‌های ویژه‌ی PostgREST (`,` `(` `)` `%` `*`) اگر پاک
   نشوند می‌توانند شرط پرس‌وجو را بشکنند.
   ============================================================ */
export function searchTerm(v, max = 80) {
  return String(v ?? '')
    .replace(/[%,()*\\'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/* ============================================================
   ۷. بسته‌بندی مسیر — همه‌ی محافظ‌ها یک‌جا
   ------------------------------------------------------------
   به‌جای تکرار cors/method/rateLimit در ۳۵ فایل:
   export default route({ methods:['GET'], limit:{...} }, handler)
   ============================================================ */
import { cors, methodGuard, rateLimit } from './helpers';

export function route(opts, handler) {
  return async function (req, res) {
    try {
      if (cors(req, res)) return;
      if (!methodGuard(req, res, opts.methods || ['GET'])) return;

      if (opts.maxKb && bodyTooBig(req, res, opts.maxKb)) return;

      if (opts.limit && req.method !== 'GET') {
        if (rateLimit(req, res, opts.limit)) return;
      }

      return await handler(req, res);
    } catch (e) {
      console.error('[route]', req.url, e?.message, e?.stack?.split('\n')[1]);
      if (!res.headersSent) {
        fail(res, 'خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.', 500);
      }
    }
  };
}
