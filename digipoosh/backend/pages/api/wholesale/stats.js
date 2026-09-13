/**
 * GET /api/wholesale/stats — آمار پنل تأمین‌کننده
 *
 * ------------------------------------------------------------
 * همه‌ی شمارش‌ها با `head: true` انجام می‌شوند؛ یعنی فقط
 * تعداد از پایگاه داده برمی‌گردد نه خود ردیف‌ها. برای
 * فروشگاهی با هزاران سفارش، تفاوت این با خواندن کامل
 * چند مگابایت است.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { requireWholesaleSeller } from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

/** شمارش سریع بدون آوردن ردیف‌ها */
async function countOf(table, build) {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  q = build(q);
  const { count } = await q;
  return count || 0;
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const guard = await requireWholesaleSeller(req, res, user);
  if (!guard) return;
  const { seller, rule } = guard;
  const sid = seller.id;

  /* همه‌ی شمارش‌ها موازی اجرا می‌شوند، نه پشت سر هم */
  const [
    products, active, drafts, openRfq, pendingOrders, deliveredOrders,
  ] = await Promise.all([
    countOf('wholesale_products', (q) => q.eq('seller_id', sid)),
    countOf('wholesale_products', (q) => q.eq('seller_id', sid).eq('status', 'active')),
    countOf('wholesale_products', (q) => q.eq('seller_id', sid).eq('status', 'draft')),
    countOf('wholesale_rfq',      (q) => q.eq('seller_id', sid).eq('status', 'open')),
    countOf('wholesale_orders',   (q) => q.eq('seller_id', sid).eq('status', 'pending')),
    countOf('wholesale_orders',   (q) => q.eq('seller_id', sid).eq('status', 'delivered')),
  ]);

  /* مبالغ — فقط ستون‌های لازم خوانده می‌شود */
  const { data: money } = await supabaseAdmin
    .from('wholesale_orders')
    .select('total, paid, status')
    .eq('seller_id', sid)
    .neq('status', 'canceled');

  let revenue = 0, received = 0;
  for (const o of money || []) {
    revenue  += Number(o.total) || 0;
    received += Number(o.paid)  || 0;
  }

  /* کالاهای رو به اتمام — برای هشدار انبار */
  const { data: lowStock } = await supabaseAdmin
    .from('wholesale_products')
    .select('id, name, stock, low_at')
    .eq('seller_id', sid)
    .eq('status', 'active')
    .order('stock', { ascending: true })
    .limit(50);

  const low = (lowStock || []).filter(
    (p) => p.stock <= (Number(p.low_at) || 0) || p.stock === 0
  );

  /* نردبان فعال */
  const { data: boost } = await supabaseAdmin
    .from('wholesale_boosts')
    .select('plan, ends_at, views, clicks, rfq_count')
    .eq('seller_id', sid)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: false })
    .limit(1);

  return ok(res, {
    seller: {
      id: sid,
      name: seller.shop_name,
      status: seller.status,
      canPublish: rule.canPublish,
      locked: rule.locked,
    },
    products: { total: products, active, drafts, lowStock: low.length },
    rfq: { open: openRfq },
    orders: {
      pending: pendingOrders,
      delivered: deliveredOrders,
      total: (money || []).length,
    },
    money: {
      revenue,
      received,
      unpaid: Math.max(0, revenue - received),
      avgOrder: money?.length ? Math.round(revenue / money.length) : 0,
    },
    lowStock: low.slice(0, 10).map((p) => ({
      id: p.id, name: p.name, stock: p.stock, lowAt: p.low_at,
    })),
    boost: boost?.[0] || null,
  });
}

export default withSafety(handler);
