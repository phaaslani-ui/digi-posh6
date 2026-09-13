/** GET /api/seller/stats — آمار فروشنده */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireApprovedSeller } from '../../../lib/auth';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const ctx = await requireApprovedSeller(req, res);
  if (!ctx) return;
  const { seller } = ctx;
  if (!seller) return fail(res, 'مخصوص فروشندگان است.', 403);

  const [{ count: totalProducts }, { count: activeProducts }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id).eq('status', 'active'),
  ]);

  const { data: items } = await supabaseAdmin
    .from('order_items').select('line_total, commission_amount, seller_payout, quantity')
    .eq('seller_id', seller.id);

  const gross = (items || []).reduce((s, i) => s + i.line_total, 0);
  const commission = (items || []).reduce((s, i) => s + i.commission_amount, 0);
  const payout = (items || []).reduce((s, i) => s + i.seller_payout, 0);
  const unitsSold = (items || []).reduce((s, i) => s + i.quantity, 0);

  const { data: pending } = await supabaseAdmin
    .from('commissions').select('seller_payout').eq('seller_id', seller.id).eq('status', 'pending');
  const pendingPayout = (pending || []).reduce((s, c) => s + c.seller_payout, 0);

  return ok(res, {
    stats: {
      shop_name: seller.shop_name,
      status: seller.status,
      commission_rate: seller.commission_rate,
      total_products: totalProducts || 0,
      active_products: activeProducts || 0,
      orders_count: (items || []).length,
      units_sold: unitsSold,
      gross_sales: gross,
      platform_commission: commission,
      net_payout: payout,
      pending_payout: pendingPayout,
      rating: seller.rating,
    },
  });
}

export default withSafety(handler);
