/** GET /api/seller/orders — سفارش‌های مربوط به این فروشنده */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireApprovedSeller } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, paginate, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'so-edit', max: 60, windowMs: 60000 })) return;

  const ctx = await requireApprovedSeller(req, res);
  if (!ctx) return;
  const { seller } = ctx;
  if (!seller) return fail(res, 'مخصوص فروشندگان است.', 403);

  const { page, limit, from, to } = paginate(req.query);
  const { data, error, count } = await supabaseAdmin
    .from('order_items')
    .select('*, order:orders(id, order_number, status, created_at, receiver_name, receiver_phone, city, address)', { count: 'exact' })
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return dbFail(res, error);

  return ok(res, {
    items: data || [],
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
  });
}

export default withSafety(handler);
