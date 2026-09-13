/** PATCH /api/cart/:id — تغییر تعداد | DELETE — حذف آیتم */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['PATCH', 'DELETE'])) return;

  if (rateLimit(req, res, { key: 'cart-edit', max: 60, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const { data: item } = await supabaseAdmin
    .from('cart').select('*, product:products(stock, title)').eq('id', id).single();

  if (!item) return fail(res, 'آیتم یافت نشد.', 404);
  if (item.user_id !== user.id) return fail(res, 'دسترسی ندارید.', 403);

  if (req.method === 'DELETE') {
    await supabaseAdmin.from('cart').delete().eq('id', id);
    return ok(res, { message: 'از سبد حذف شد.' });
  }

  /*
   * `Number('2.5')` عدد معتبر است ولی نیم‌عدد کالا معنا ندارد.
   * پیش از این چنین مقداری تا پایگاه داده می‌رفت.
   */
  const qty = Number(req.body?.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
    return fail(res, 'تعداد باید عددی صحیح بین ۱ تا ۹۹۹ باشد.');
  }
  if (item.product && item.product.stock < qty)
    return fail(res, `موجودی کافی نیست. موجودی: ${item.product.stock}`);

  const { data, error } = await supabaseAdmin
    .from('cart').update({ quantity: qty }).eq('id', id).select().single();
  if (error) return dbFail(res, error, 'به‌روزرسانی سبد ممکن نشد.');

  return ok(res, { message: 'تعداد به‌روز شد.', item: data });
}

export default withSafety(handler);
