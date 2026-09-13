/**
 * POST /api/visual/search — یافتن کالا از روی رنگ عکس
 * ------------------------------------------------------------
 * ⚠️ محدودیت صریح:
 *   این مسیر **عکس را تحلیل نمی‌کند**. استخراج رنگ در مرورگر
 *   انجام می‌شود (`assets/js/dp-vision.js`) چون:
 *     · بار پردازش روی سرور نمی‌افتد
 *     · عکس کاربر جایی آپلود نمی‌شود — حریم خصوصی
 *     · بدون اینترنت هم کار می‌کند
 *
 *   سرور فقط رنگ‌های استخراج‌شده را می‌گیرد و کالای هم‌رنگ
 *   برمی‌گرداند.
 *
 * بدنه:
 * {
 *   colors: [ { key: 'navy', share: 0.62 }, … ],
 *   limit:  12
 * }
 *
 * اگر روزی مدل بینایی وصل شد، فقط این فایل عوض می‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

const FIELDS = 'id,name,price,images,colors,sizes,stock,category,seller_id,status';

/* رنگ‌های خنثی که تقریباً با همه‌چیز تطابق دارند —
   وزنشان کم می‌شود وگرنه هر جست‌وجویی «مشکی» برمی‌گرداند */
const NEUTRAL = new Set([
  'black', 'white', 'gray', 'lightgray', 'darkgray',
  'cream', 'beige', 'offwhite', 'ivory',
]);

function cleanColors(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();

  for (const c of raw) {
    const key = typeof c === 'string' ? c : c?.key;
    if (typeof key !== 'string') continue;
    /* فقط حروف انگلیسی — کلید دانشنامه همیشه لاتین است */
    if (!/^[a-z]{2,20}$/.test(key)) continue;
    if (seen.has(key)) continue;

    let share = Number(c?.share);
    if (!Number.isFinite(share) || share <= 0) share = 0.2;
    share = Math.min(1, share);

    seen.add(key);
    out.push({ key, share });
    if (out.length >= 6) break;
  }
  return out;
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['POST'])) return;

  const colors = cleanColors(req.body?.colors);
  if (!colors.length) {
    return fail(res, 'رنگی دریافت نشد. عکس را در مرورگر پردازش کنید.', 400);
  }

  const limit = Math.max(1, Math.min(40, Number(req.body?.limit) || 12));

  /* کالای موجود را بخوان — سقف معقول تا حافظه پر نشود */
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(FIELDS)
    .eq('status', 'active')
    .gt('stock', 0)
    .limit(600);

  if (error) return dbFail(res, error, 'خواندن کالاها انجام نشد.');

  const wanted = new Map(colors.map((c) => [c.key, c.share]));

  const scored = [];
  for (const p of data || []) {
    const pc = Array.isArray(p.colors) ? p.colors : [];
    if (!pc.length) continue;

    let score = 0;
    const matched = [];

    for (const k of pc) {
      const share = wanted.get(k);
      if (share === undefined) continue;
      /* رنگ خنثی نصف امتیاز می‌گیرد */
      const w = NEUTRAL.has(k) ? 45 : 100;
      score += w * share;
      matched.push(k);
    }

    if (score < 10) continue;
    scored.push({ product: p, score: Math.round(score), matched });
  }

  scored.sort((a, b) => b.score - a.score);

  return ok(res, {
    results: scored.slice(0, limit),
    total: scored.length,
    colors,
    note: 'استخراج رنگ در مرورگر انجام می‌شود؛ عکس روی سرور ذخیره نمی‌شود.',
  });
}

export default withSafety(handler);
