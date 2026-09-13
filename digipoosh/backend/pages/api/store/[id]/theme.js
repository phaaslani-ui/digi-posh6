/**
 * GET /api/store/:id/theme — تم ویترین یک فروشگاه (عمومی)
 * ------------------------------------------------------------
 * صفحه‌ی فروشگاه این را می‌خواند تا بداند چه حال‌وهوایی بگیرد.
 *
 * پارامتر اختیاری `?from=women|men|kids|teen` بخشی است که
 * مشتری از آن آمده. اگر فروشنده تم را قفل نکرده باشد، همین
 * تعیین‌کننده است — پس فروشگاهی که هم کالای زنانه دارد و هم
 * مردانه، برای هر مشتری متناسب با علاقه‌اش دیده می‌شود.
 */
import { supabaseAdmin } from '../../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../../lib/helpers';
import { dbFail } from '../../../../lib/guard';
import { withSafety } from '../../../../lib/safety';

const SECTIONS = ['women', 'men', 'kids', 'teen'];

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const id = String(req.query.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return fail(res, 'شناسه‌ی فروشگاه معتبر نیست.', 400);
  }

  const from = String(req.query.from || '').trim();
  const fromOk = SECTIONS.includes(from) ? from : null;

  const { data, error } = await supabaseAdmin
    .from('store_theme_resolved')
    .select('seller_id, shop_name, section, is_locked, primary_color, second_color, accent_color, radius')
    .eq('seller_id', id)
    .single();

  if (error && error.code === 'PGRST116') {
    return fail(res, 'فروشگاه پیدا نشد.', 404);
  }
  if (error) return dbFail(res, error);

  /* ترتیب تصمیم:
       ۱) قفل فروشنده  — برندش را با یک حال‌وهوا ساخته
       ۲) مسیر ورود مشتری
       ۳) حدس نما (پرکالاترین بخش) */
  let section = data.section;
  let reason = 'busiest';

  if (data.is_locked) {
    reason = 'locked';
  } else if (fromOk) {
    section = fromOk;
    reason = 'from';
  }

  /* تم عمومی است و کم عوض می‌شود — کش کوتاه */
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');

  return ok(res, {
    theme: {
      sellerId: data.seller_id,
      shopName: data.shop_name,
      section,
      reason,
      locked: data.is_locked,
      custom: {
        primary: data.primary_color || null,
        second: data.second_color || null,
        accent: data.accent_color || null,
        radius: data.radius,
      },
    },
  });
}

export default withSafety(handler);
