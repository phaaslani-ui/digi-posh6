/**
 * POST /api/orders/checkout — تأیید پرداخت
 * فعلاً شبیه‌سازی؛ بعداً به درگاه زرین‌پال وصل می‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'checkout', max: 10, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { order_id, payment_ref } = req.body || {};
  const missing = required(req.body || {}, ['order_id']);
  if (missing) return fail(res, missing);

  const { data: order } = await supabaseAdmin
    .from('orders').select('*').eq('id', order_id).single();

  if (!order) return fail(res, 'سفارش یافت نشد.', 404);
  if (order.user_id !== user.id) return fail(res, 'دسترسی ندارید.', 403);
  if (order.status !== 'pending') return fail(res, 'این سفارش قابل پرداخت نیست.');

  /*
   * شرط `status = pending` داخل خود به‌روزرسانی می‌آید.
   * بدون آن، اگر کاربر دو بار پشت‌سرهم دکمه را بزند، هر دو
   * درخواست شرط بالا را رد می‌کنند و سفارش دو بار «پرداخت‌شده»
   * می‌شود. با این شرط فقط یکی موفق می‌شود.
   */
  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_ref: payment_ref || `SIM-${Date.now()}`,
    })
    .eq('id', order_id)
    .eq('status', 'pending')
    .select().maybeSingle();

  if (error) return dbFail(res, error);
  if (!updated) return fail(res, 'این سفارش هم‌اکنون پرداخت شده است.', 409);

  await notify(supabaseAdmin, user.id, 'پرداخت موفق',
    `پرداخت سفارش ${order.order_number} تأیید شد.`, 'order', `/orders/${order_id}`);

  return ok(res, { message: 'پرداخت با موفقیت انجام شد.', order: updated });
}

export default withSafety(handler);
