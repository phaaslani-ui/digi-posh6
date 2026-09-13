/**
 * دیجی‌پوش — توابع کمکی مشترک
 */

/** پاسخ موفق */
export function ok(res, data = {}, status = 200) {
  return res.status(status).json({ ok: true, ...data });
}

/** پاسخ خطا */
export function fail(res, error = 'خطایی رخ داد.', status = 400, extra = {}) {
  return res.status(status).json({ ok: false, error, ...extra });
}

/** فقط متدهای مجاز */
export function methodGuard(req, res, allowed = []) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    fail(res, `متد ${req.method} مجاز نیست.`, 405);
    return false;
  }
  return true;
}

/** CORS — تا فرانت‌اند ثابت بتواند fetch بزند */
export function cors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim());
  const origin = req.headers.origin;

  if (allowed.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // درخواست preflight تمام شد
  }
  return false;
}

/** ساخت اسلاگ از متن فارسی/انگلیسی */
export function slugify(text) {
  const base = String(text)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .slice(0, 60);
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/** نرخ کمیسیون پیش‌فرض پلتفرم */
export const DEFAULT_COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 10);

/** محاسبه‌ی کمیسیون یک ردیف سفارش */
export function calcCommission(lineTotal, rate = DEFAULT_COMMISSION_RATE) {
  const amount = Math.round((lineTotal * rate) / 100);
  return { rate, amount, payout: lineTotal - amount };
}

/** اعتبارسنجی ساده */
export function required(obj, fields) {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === ''
  );
  return missing.length ? `فیلدهای الزامی: ${missing.join('، ')}` : null;
}

/** صفحه‌بندی */
export function paginate(query, maxLimit = 60) {
  /*
   * ورودی نامعتبر نباید NaN بسازد.
   *
   * پیش‌تر `?page=abc` این‌طور می‌شد:
   *   parseInt('abc')      → NaN
   *   Math.max(1, NaN)     → NaN
   *   .range(NaN, NaN)     → پرس‌وجو در پایگاه داده می‌شکست
   *
   * یعنی یک نشانی دستکاری‌شده می‌توانست ۱۱ مسیر را از کار
   * بیندازد. حالا هر ورودی نامعتبر به پیش‌فرض برمی‌گردد.
   */
  const num = (v, def, min, max) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    const i = Math.floor(n);
    if (i < min) return def;
    return Math.min(max, i);
  };

  const page  = num(query?.page,  1,  1, 5000);
  const limit = num(query?.limit, 12, 1, maxLimit);

  return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}

/** ارسال اعلان */
export async function notify(admin, userId, title, body, type = 'info', link = null) {
  if (!admin || !userId) return false;

  /*
   * اعلان هرگز نباید عملیات اصلی را بشکند.
   *
   * این تابع همیشه **پس از** ثبت سفارش یا تأیید فروشگاه صدا
   * زده می‌شود. اگر جدول اعلان‌ها لحظه‌ای مشکل داشته باشد و
   * خطا پرتاب شود، کاربر پیام شکست می‌گیرد در حالی که سفارشش
   * با موفقیت ثبت شده — بدترین حالت ممکن.
   *
   * پس خطا فقط در لاگ می‌ماند و کار اصلی ادامه پیدا می‌کند.
   */
  try {
    const { error } = await admin.from('notifications').insert({
      user_id: userId,
      title: String(title || '').slice(0, 200),
      body: String(body || '').slice(0, 1000),
      type,
      link,
    });
    if (error) {
      console.error('[notify]', error.code, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify]', e?.message);
    return false;
  }
}

/**
 * اعلان گروهی — مثلاً به همه‌ی مدیران.
 * یک درخواست به‌جای چند درخواست پشت سر هم.
 */
export async function notifyAll(admin, userIds, title, body, type = 'info', link = null) {
  if (!admin || !Array.isArray(userIds) || !userIds.length) return false;
  try {
    const rows = [...new Set(userIds)].filter(Boolean).map((id) => ({
      user_id: id,
      title: String(title || '').slice(0, 200),
      body: String(body || '').slice(0, 1000),
      type,
      link,
    }));
    if (!rows.length) return false;
    const { error } = await admin.from('notifications').insert(rows);
    if (error) { console.error('[notifyAll]', error.message); return false; }
    return true;
  } catch (e) {
    console.error('[notifyAll]', e?.message);
    return false;
  }
}

/* ============================================================
   نرخ‌بند — جلوگیری از حمله‌ی حدس رمز
   ------------------------------------------------------------
   بدون این، کسی می‌تواند میلیون‌ها رمز را روی «ورود» امتحان
   کند. اینجا شمارش در حافظه‌ی همان نمونه نگه داشته می‌شود.

   برای استقرار چندنمونه‌ای (چند سرور موازی) بهتر است این
   شمارش در Redis یا خودِ Supabase نگه داشته شود — ولی
   همین هم جلوی حمله‌ی ساده را می‌گیرد.
   ============================================================ */
const _hits = new Map();

/** آی‌پی واقعی پشت پراکسی (Vercel، Cloudflare و مانند آن) */
export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.headers['x-real-ip'] ||
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * اگر بیش از `max` درخواست در `windowMs` آمده باشد، پاسخ ۴۲۹
 * می‌دهد و `true` برمی‌گرداند (یعنی «جلوی ادامه را بگیر»).
 *
 *   if (rateLimit(req, res, { key: 'login', max: 8 })) return;
 */
export function rateLimit(req, res, opts = {}) {
  const max = opts.max || 30;
  const windowMs = opts.windowMs || 60000;
  const id = `${opts.key || 'x'}:${clientIp(req)}`;
  const now = Date.now();

  /* پاک‌سازی دوره‌ای تا حافظه پر نشود */
  if (_hits.size > 5000) {
    for (const [k, v] of _hits) if (now - v.start > windowMs * 2) _hits.delete(k);
  }

  let rec = _hits.get(id);
  if (!rec || now - rec.start > windowMs) {
    rec = { start: now, count: 0 };
    _hits.set(id, rec);
  }
  rec.count++;

  const left = Math.max(0, max - rec.count);
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(left));

  if (rec.count > max) {
    const wait = Math.ceil((windowMs - (now - rec.start)) / 1000);
    res.setHeader('Retry-After', String(wait));
    fail(res, `درخواست‌های شما بیش از حد مجاز بود. ${wait} ثانیه صبر کنید.`, 429);
    return true;
  }
  return false;
}

/** پس از ورود موفق، شمارش پاک می‌شود تا کاربر درست جریمه نشود */
export function rateLimitReset(req, key = 'x') {
  _hits.delete(`${key}:${clientIp(req)}`);
}
