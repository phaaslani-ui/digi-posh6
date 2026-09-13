/**
 * GET /api/wholesale/suppliers — فهرست تأمین‌کننده‌ها (عمومی)
 *
 * ------------------------------------------------------------
 * از نمای `wholesale_seller_stats` استفاده می‌کند تا آمار هر
 * تأمین‌کننده (تعداد کالا، کمترین قیمت، موجودی کل) در یک
 * درخواست بیاید. بدون آن نمای، برای هر فروشنده یک پرس‌وجوی
 * جدا لازم بود — همان اشتباهی که در نسخه‌ی مرورگری داشتیم
 * و کندی می‌ساخت.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors, paginate } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { boostWeights } from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const { page, limit, from, to } = paginate(req.query);
  const { city, q } = req.query;

  let query = supabaseAdmin
    .from('wholesale_seller_stats')
    .select('*', { count: 'exact' })
    .gt('product_count', 0)          /* فروشگاه بی‌کالا نشان داده نمی‌شود */
    .range(from, to);

  if (city) query = query.eq('city', city);
  if (q) {
    const safe = String(q).replace(/[%,()]/g, ' ').trim().slice(0, 60);
    if (safe) query = query.ilike('shop_name', `%${safe}%`);
  }

  const { data, error, count } = await query;
  if (error) return dbFail(res, error);

  const W = await boostWeights();

  const rows = (data || [])
    .map((s) => ({
      id: s.seller_id,
      name: s.shop_name,
      city: s.city || '',
      leadTime: Number(s.lead_time) || 0,
      productCount: Number(s.product_count) || 0,
      totalUnits: Number(s.total_units) || 0,
      lowestPrice: Number(s.lowest_price) || 0,
      totalSold: Number(s.total_sold) || 0,
      boost: W[s.seller_id] || 0,
      featured: (W[s.seller_id] || 0) >= 50,
    }))
    /* نردبان اول، بعد پرکالاترها */
    .sort((a, b) => b.boost - a.boost || b.productCount - a.productCount);

  return ok(res, {
    suppliers: rows,
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
  });
}

export default withSafety(handler);
