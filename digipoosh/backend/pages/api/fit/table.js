/**
 * GET  /api/fit/table?productId=…  — جدول سایز کالا (عمومی)
 * POST /api/fit/table              — ذخیره‌ی جدول (فروشنده)
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { requireApprovedSeller } from '../../../lib/auth';
import { FIELDS } from '../../../lib/fit';

const LADDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

function cleanRow(raw, order) {
  const label = String(raw.label || '').trim().toUpperCase().slice(0, 10);
  if (!label) return null;

  const row = { label, sort_order: order, is_generated: !!raw.generated };
  let filled = 0;

  for (const f of FIELDS) {
    const v = raw[f.key];
    if (v == null || v === '') continue;
    const n = Number(v);
    /* جدول لباس بازه‌ی بازتری از بدن دارد */
    if (!Number.isFinite(n) || n < f.min * 0.7 || n > f.max * 1.3) continue;
    row[f.col] = Math.round(n * 10) / 10;
    filled++;
  }

  if (raw.length != null) {
    const n = Number(raw.length);
    if (Number.isFinite(n) && n > 10 && n < 220) row.length_cm = Math.round(n * 10) / 10;
  }

  /* قید پایگاه‌داده: دست‌کم دو اندازه */
  return filled >= 2 ? row : null;
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['GET', 'POST'])) return;

  /* ---------- خواندن — عمومی ---------- */
  if (req.method === 'GET') {
    const id = req.query?.productId;
    if (!id) return fail(res, 'شناسه‌ی کالا لازم است.', 400);

    const { data, error } = await supabaseAdmin
      .from('product_sizes').select('*')
      .eq('product_id', id).order('sort_order');

    if (error) return dbFail(res, error, 'خواندن جدول انجام نشد.');
    return ok(res, { sizes: data || [], count: (data || []).length });
  }

  /* ---------- نوشتن — فقط فروشنده ---------- */
  const seller = await requireApprovedSeller(req, res);
  if (!seller) return;

  const b = req.body || {};
  if (!b.productId) return fail(res, 'شناسه‌ی کالا لازم است.', 400);
  if (!Array.isArray(b.rows)) return fail(res, 'جدول نامعتبر است.', 400);

  /* کالا مال همین فروشنده باشد */
  const { data: prod } = await supabaseAdmin
    .from('products').select('id,seller_id').eq('id', b.productId).maybeSingle();

  if (!prod) return fail(res, 'کالا پیدا نشد.', 404);
  if (String(prod.seller_id) !== String(seller.id)) {
    return fail(res, 'این کالا مال شما نیست.', 403);
  }

  const rows = b.rows
    .slice(0, 12)
    .map((r, i) => cleanRow(r, LADDER.indexOf(String(r.label || '').toUpperCase()) + 1 || i + 1))
    .filter(Boolean)
    .map((r) => ({ ...r, product_id: b.productId }));

  if (!rows.length) {
    return fail(res, 'هیچ سایز معتبری نبود. هر سایز دست‌کم دو اندازه لازم دارد.', 400);
  }

  /* جایگزینی کامل — ساده‌تر و مطمئن‌تر از upsert جزئی */
  const { error: dErr } = await supabaseAdmin
    .from('product_sizes').delete().eq('product_id', b.productId);
  if (dErr) return dbFail(res, dErr, 'پاک کردن جدول قبلی انجام نشد.');

  const { data, error } = await supabaseAdmin
    .from('product_sizes').insert(rows).select();

  if (error) return dbFail(res, error, 'ذخیره‌ی جدول انجام نشد.');

  return ok(res, { sizes: data, count: data.length,
    message: `جدول اندازه با ${data.length} سایز ذخیره شد.` });
}

export default withSafety(handler);
