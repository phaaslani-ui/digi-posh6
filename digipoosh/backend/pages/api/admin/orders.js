/** GET /api/admin/orders | PATCH — تغییر وضعیت سفارش */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, paginate, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

const FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'adm-ord', max: 60, windowMs: 60000 })) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);
    let q = supabaseAdmin
      .from('orders')
      .select('*, user:users(full_name, email, phone), items:order_items(*)', { count: 'exact' });
    if (req.query.status) q = q.eq('status', req.query.status);

    const { data, error, count } = await q
      .order('created_at', { ascending: false }).range(from, to);
    if (error) return dbFail(res, error);

    return ok(res, {
      orders: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  const { order_id, status } = req.body || {};
  const missing = required(req.body || {}, ['order_id', 'status']);
  if (missing) return fail(res, missing);
  if (!FLOW.includes(status)) return fail(res, 'وضعیت نامعتبر است.');

  const { data: order, error } = await supabaseAdmin
    .from('orders').update({ status }).eq('id', order_id).select().single();
  if (error) return dbFail(res, error);

  // تسویه‌ی کمیسیون هنگام تحویل
  if (status === 'delivered')
    await supabaseAdmin.from('commissions')
      .update({ status: 'settled', settled_at: new Date().toISOString() })
      .eq('order_id', order_id).eq('status', 'pending');

  if (status === 'cancelled' || status === 'refunded')
    await supabaseAdmin.from('commissions').update({ status: 'cancelled' }).eq('order_id', order_id);

  const labels = {
    paid: 'پرداخت تأیید شد', processing: 'سفارش در حال آماده‌سازی است',
    shipped: 'سفارش ارسال شد', delivered: 'سفارش تحویل داده شد',
    cancelled: 'سفارش لغو شد', refunded: 'مبلغ بازگردانده شد',
  };
  if (labels[status])
    await notify(supabaseAdmin, order.user_id, labels[status],
      `سفارش ${order.order_number}`, 'order', `/orders/${order_id}`);

  return ok(res, { message: 'وضعیت سفارش به‌روز شد.', order });
}

export default withSafety(handler);
