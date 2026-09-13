/**
 * POST /api/fit/recommend — پیشنهاد سایز
 * ------------------------------------------------------------
 * بدنه:
 * {
 *   productId: uuid,
 *   body: { chest: 96, waist: 88, … },   ← یا از پروفایل ذخیره‌شده
 *   fit: 'tailored'
 * }
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { getUser } from '../../../lib/auth';
import { recommend, rowToSize, cleanBody, FIT_PREF, FIELDS } from '../../../lib/fit';

/* نگاشت گروه کالا به جدول وزن */
const GROUP = {
  women: 'any', men: 'any',
  /* از دسته‌بندی حدس می‌زنیم */
};

function groupFromCategory(cat) {
  const c = String(cat || '');
  if (/شلوار|دامن|لگ|شلوارک|جین|گرمکن/.test(c)) return 'bottom';
  if (/پالتو|کاپشن|بارانی|ژاکت|کت|بافت|هودی/.test(c)) return 'outer';
  if (/لباس شب|مانتو|سارافون|تونیک|سرهمی|کت و شلوار/.test(c)) return 'full';
  if (/پیراهن|بلوز|شومیز|تی‌شرت|تیشرت|تاپ|پولوشرت/.test(c)) return 'top';
  return 'any';
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['POST'])) return;

  const b = req.body || {};
  if (!b.productId) return fail(res, 'شناسه‌ی کالا لازم است.', 400);

  /* ---------- اندازه‌های بدن ---------- */
  let body = null;
  let fit = FIT_PREF[b.fit] ? b.fit : 'tailored';

  if (b.body) {
    const v = cleanBody(b.body);
    if (!v.ok) return fail(res, v.errors.join(' · '), 400);
    body = v.body;
  } else {
    /* از پروفایل ذخیره‌شده */
    const user = await getUser(req).catch(() => null);
    if (!user) return fail(res, 'اندازه‌ها را بفرستید یا وارد شوید.', 401);

    const { data } = await supabaseAdmin
      .from('body_profiles').select('*')
      .eq('user_id', user.id).eq('is_active', true).maybeSingle();

    if (!data) return fail(res, 'هنوز اندازه‌هایتان را ثبت نکرده‌اید.', 404);

    body = {};
    for (const f of FIELDS) {
      if (data[f.col] != null) body[f.key] = Number(data[f.col]);
    }
    fit = data.fit_pref || fit;
  }

  /* ---------- جدول سایز کالا ---------- */
  const { data: prod, error: pErr } = await supabaseAdmin
    .from('products').select('id,name,category,sizes,status').eq('id', b.productId).maybeSingle();

  if (pErr) return dbFail(res, pErr, 'خواندن کالا انجام نشد.');
  if (!prod) return fail(res, 'کالا پیدا نشد.', 404);

  const { data: rows, error: sErr } = await supabaseAdmin
    .from('product_sizes').select('*')
    .eq('product_id', b.productId).order('sort_order');

  if (sErr) return dbFail(res, sErr, 'خواندن جدول سایز انجام نشد.');
  if (!rows?.length) {
    return ok(res, { hasTable: false,
      message: 'فروشنده هنوز جدول اندازه‌ی این کالا را وارد نکرده.' });
  }

  /* فقط سایزهای موجود */
  const avail = Array.isArray(prod.sizes) ? prod.sizes : [];
  const usable = avail.length
    ? rows.filter((r) => avail.includes(r.label))
    : rows;

  if (!usable.length) {
    return ok(res, { hasTable: true, available: false,
      message: 'هیچ‌کدام از سایزهای این جدول موجود نیست.' });
  }

  const group = groupFromCategory(prod.category);
  const result = recommend(body, usable.map(rowToSize), { fit, group });

  if (!result) {
    return ok(res, { hasTable: true, matched: false,
      message: 'اندازه‌های شما با جدول این کالا هم‌پوشانی ندارد.' });
  }

  /* ---------- ثبت برای یادگیری ---------- */
  const user = await getUser(req).catch(() => null);
  await supabaseAdmin.from('size_suggestions').insert({
    user_id: user?.id || null,
    product_id: b.productId,
    suggested: result.best.label,
    score: result.best.percent,
    fit_pref: fit,
  }).catch(() => { /* ثبت نباید پاسخ را بشکند */ });

  return ok(res, {
    hasTable: true,
    available: true,
    matched: true,
    fit,
    group,
    best: result.best,
    alternatives: result.alternatives,
    all: result.all,
  });
}

export default withSafety(handler);
