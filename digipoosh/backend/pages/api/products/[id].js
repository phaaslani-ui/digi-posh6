/** GET /api/products/:id — جزئیات محصول (id یا slug) */
import { supabaseAdmin } from '../../../lib/supabase';
import { getUser } from '../../../lib/auth';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';

const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const { id } = req.query;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, seller:seller_profiles(id, shop_name, slug, city, rating, logo_url, description, status)')
    .eq(isUuid(id) ? 'id' : 'slug', id)
    .maybeSingle();

  if (error || !product) return fail(res, 'محصول یافت نشد.', 404);

  /*
   * ============================================================
   * محصول باید واقعاً منتشر شده باشد
   * ------------------------------------------------------------
   * فهرست عمومی `status = 'active'` را فیلتر می‌کرد، ولی این
   * مسیر نمی‌کرد. یعنی هر کسی با داشتن نشانی مستقیم می‌توانست
   * پیش‌نویس، کالای بایگانی‌شده، یا کالای فروشگاه تعلیق‌شده را
   * ببیند — چیزی که هرگز نباید عمومی می‌شد.
   *
   * صاحب کالا و مدیر همچنان می‌بینند (برای پیش‌نمایش).
   * ============================================================
   */
  const viewer = await getUser(req).catch(() => null);

  /*
   * `getUser` سطر جدول `users` را برمی‌گرداند و `seller_id`
   * ندارد — پس مالکیت را باید از پروفایل فروشنده گرفت.
   * فقط وقتی پرس‌وجو می‌زنیم که کالا منتشر نشده باشد، تا
   * برای بازدید عادی هزینه‌ی اضافه نسازیم.
   */
  let isOwner = viewer?.role === 'admin';

  if (!isOwner && viewer && product.status !== 'active') {
    const { data: mine } = await supabaseAdmin
      .from('seller_profiles')
      .select('id')
      .eq('user_id', viewer.id)
      .maybeSingle();
    isOwner = !!mine && mine.id === product.seller_id;
  }

  if (!isOwner) {
    if (product.status !== 'active') {
      return fail(res, 'محصول یافت نشد.', 404);
    }
    if (product.seller && product.seller.status !== 'approved') {
      return fail(res, 'این محصول فعلاً در دسترس نیست.', 404);
    }
  }

  /* وضعیت فروشنده جزئیات داخلی است و به بیرون نمی‌رود */
  if (product.seller) delete product.seller.status;

  /*
   * شمارش بازدید — فقط برای بازدیدکننده‌ی واقعی.
   * اگر خود فروشنده صفحه را باز کند، آمارش را باد نمی‌کنیم.
   */
  if (!isOwner) {
    await supabaseAdmin.from('products')
      .update({ views: (product.views || 0) + 1 }).eq('id', product.id);
  }

  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, comment, created_at, user:users(full_name, avatar_url)')
    .eq('product_id', product.id).eq('is_approved', true)
    .order('created_at', { ascending: false }).limit(20);

  const { data: related } = await supabaseAdmin
    .from('products').select('id, title, slug, price, discount_price, images, rating')
    .eq('category', product.category).eq('status', 'active')
    .neq('id', product.id).limit(8);

  return ok(res, { product, reviews: reviews || [], related: related || [] });
}

export default withSafety(handler);
