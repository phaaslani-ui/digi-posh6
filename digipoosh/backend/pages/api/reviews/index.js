/** GET /api/reviews?product_id=… | POST ثبت نظر */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, notify, rateLimit, notifyAll} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const { product_id } = req.query;
    if (!product_id) return fail(res, 'شناسه‌ی محصول لازم است.');
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('id, rating, comment, created_at, user:users(full_name, avatar_url)')
      .eq('product_id', product_id).eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (error) return dbFail(res, error);
    return ok(res, { reviews: data || [] });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  if (rateLimit(req, res, { key: 'review', max: 10, windowMs: 60000 })) return;

  const { product_id, comment } = req.body || {};
  const missing = required(req.body || {}, ['product_id', 'rating']);
  if (missing) return fail(res, missing);

  /* امتیاز باید عدد صحیح ۱ تا ۵ باشد — رشته یا اعشار پذیرفته نمی‌شود */
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return fail(res, 'امتیاز باید عددی صحیح بین ۱ تا ۵ باشد.');

  /* متن نظر محدود شود تا کسی مگابایت داده نفرستد */
  if (comment != null && String(comment).length > 2000)
    return fail(res, 'متن نظر نباید بیش از ۲۰۰۰ نویسه باشد.');

  // فقط خریدار واقعی
  const { data: purchased } = await supabaseAdmin
    .from('order_items')
    .select('id, order:orders!inner(user_id, status)')
    .eq('product_id', product_id)
    .eq('order.user_id', user.id)
    .in('order.status', ['paid', 'processing', 'shipped', 'delivered'])
    .limit(1);

  if (!purchased?.length)
    return fail(res, 'فقط خریداران این محصول می‌توانند نظر ثبت کنند.', 403);

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .upsert({ product_id, user_id: user.id, rating, comment: comment ? String(comment).trim() : null, is_approved: false },
            { onConflict: 'product_id,user_id' })
    .select().single();

  if (error) return dbFail(res, error);

  const { data: admins } = await supabaseAdmin.from('users').select('id').eq('role', 'admin');
  await notifyAll(supabaseAdmin, (admins || []).map((a) => a.id),
    'نظر جدید', 'یک نظر تازه در انتظار تأیید است.', 'admin');

  return ok(res, { message: 'نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.', review: data }, 201);
}

export default withSafety(handler);
