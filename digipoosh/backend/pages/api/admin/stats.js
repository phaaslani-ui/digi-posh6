/** GET /api/admin/stats — داشبورد کلی */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, methodGuard, cors } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  const c = async (table, col, val) => {
    let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    if (col) q = q.eq(col, val);
    const { count } = await q;
    return count || 0;
  };

  const [users, customers, sellers, pendingSellers, products, activeProducts, orders, pendingOrders] =
    await Promise.all([
      c('users'), c('users', 'role', 'customer'), c('users', 'role', 'seller'),
      c('seller_profiles', 'status', 'pending'),
      c('products'), c('products', 'status', 'active'),
      c('orders'), c('orders', 'status', 'pending'),
    ]);

  const { data: paidOrders } = await supabaseAdmin
    .from('orders').select('total, commission_total, created_at')
    .in('status', ['paid', 'processing', 'shipped', 'delivered']);

  const revenue = (paidOrders || []).reduce((s, o) => s + o.total, 0);
  const commission = (paidOrders || []).reduce((s, o) => s + o.commission_total, 0);

  const { data: settled } = await supabaseAdmin
    .from('commissions').select('amount, status');
  const settledAmount = (settled || []).filter((x) => x.status === 'settled')
    .reduce((s, x) => s + x.amount, 0);
  const pendingAmount = (settled || []).filter((x) => x.status === 'pending')
    .reduce((s, x) => s + x.amount, 0);

  const { data: recentOrders } = await supabaseAdmin
    .from('orders').select('id, order_number, total, status, created_at, user:users(full_name)')
    .order('created_at', { ascending: false }).limit(10);

  return ok(res, {
    stats: {
      users: { total: users, customers, sellers, pending_sellers: pendingSellers },
      products: { total: products, active: activeProducts },
      orders: { total: orders, pending: pendingOrders },
      finance: {
        gross_revenue: revenue,
        platform_commission: commission,
        commission_settled: settledAmount,
        commission_pending: pendingAmount,
      },
    },
    recent_orders: recentOrders || [],
  });
}

export default withSafety(handler);
