/** GET /api/orders/:id — جزئیات | PATCH — لغو سفارش توسط کاربر */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'order-edit', max: 40, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(*, product:products(slug, images))')
    .eq('id', id).single();

  if (!order) return fail(res, 'سفارش یافت نشد.', 404);
  if (order.user_id !== user.id && user.role !== 'admin')
    return fail(res, 'دسترسی ندارید.', 403);

  if (req.method === 'GET') return ok(res, { order });

  // ---- لغو ----
  if (req.body?.action !== 'cancel') return fail(res, 'عملیات نامعتبر است.');
  if (!['pending', 'paid'].includes(order.status))
    return fail(res, 'این سفارش دیگر قابل لغو نیست.');

  const { data: updated, error } = await supabaseAdmin
    .from('orders').update({ status: 'cancelled' }).eq('id', id).select().single();
  if (error) return dbFail(res, error);

  /* ---------- برگرداندن موجودی، به‌صورت اتمی ----------
     پیش‌تر موجودی خوانده می‌شد، در جاوااسکریپت جمع می‌خورد و
     دوباره نوشته می‌شد. اگر مشتری دوبار سریع روی «لغو» می‌زد،
     هر دو درخواست عدد قدیمی را می‌خواندند و یکی از افزایش‌ها
     گم می‌شد. حالا جمع را خود پایگاه داده انجام می‌دهد. */
  for (const it of order.items || []) {
    if (!it.product_id) continue;
    const qty = Number(it.quantity);
    if (!Number.isInteger(qty) || qty <= 0) continue;

    const { error: rsErr } = await supabaseAdmin.rpc('restock_product', {
      p_product: it.product_id,
      p_qty: qty,
    });

    /* اگر تابع هنوز در پایگاه داده نصب نشده، به روش قدیمی
       برمی‌گردیم تا لغو سفارش نشکند */
    if (rsErr) {
      console.warn('[orders] restock_product در دسترس نیست:', rsErr.message);
      const { data: p } = await supabaseAdmin
        .from('products').select('stock').eq('id', it.product_id).single();
      if (p) {
        await supabaseAdmin.from('products')
          .update({ stock: (Number(p.stock) || 0) + qty }).eq('id', it.product_id);
      }
    }
  }

  await supabaseAdmin.from('commissions')
    .update({ status: 'cancelled' }).eq('order_id', id);

  await notify(supabaseAdmin, user.id, 'سفارش لغو شد',
    `سفارش ${order.order_number} لغو شد.`, 'order');

  return ok(res, { message: 'سفارش لغو شد.', order: updated });
}

export default withSafety(handler);
