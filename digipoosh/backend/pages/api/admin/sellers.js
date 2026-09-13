/** GET /api/admin/sellers — فهرست فروشندگان | PATCH — تأیید/رد */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'adm-sel', max: 60, windowMs: 60000 })) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  if (req.method === 'GET') {
    let q = supabaseAdmin
      .from('seller_profiles')
      /* ستون‌ها صریح فهرست می‌شوند، نه `*`.
         جدول seller_profiles شماره شبا و کد ملی دارد؛ فرستادن
         آن‌ها در فهرست همه‌ی فروشندگان، نشت داده‌ی بانکی است.
         اطلاعات مالی فقط در صفحه‌ی تسویه و فقط برای همان
         فروشنده خوانده می‌شود. */
      .select(
        'id, user_id, shop_name, slug, description, logo_url, cover_url, ' +
        'city, category, status, rejection_reason, commission_rate, ' +
        'rating, rating_count, approved_at, created_at, ' +
        'user:users(id, full_name, email, phone, created_at)'
      )
      .order('created_at', { ascending: false });
    if (req.query.status) q = q.eq('status', req.query.status);

    const { data, error } = await q;
    if (error) return dbFail(res, error);

    const counts = {};
    for (const s of ['pending', 'approved', 'rejected', 'suspended']) {
      const { count } = await supabaseAdmin
        .from('seller_profiles').select('*', { count: 'exact', head: true }).eq('status', s);
      counts[s] = count || 0;
    }
    return ok(res, { sellers: data || [], counts });
  }

  // ---- PATCH: تغییر وضعیت ----
  const { seller_id, status, reason, commission_rate } = req.body || {};
  const missing = required(req.body || {}, ['seller_id', 'status']);
  if (missing) return fail(res, missing);
  if (!['pending', 'approved', 'rejected', 'suspended'].includes(status))
    return fail(res, 'وضعیت نامعتبر است.');

  const patch = { status };
  if (status === 'approved') {
    patch.approved_at = new Date().toISOString();
    patch.approved_by = admin.id;
    patch.rejection_reason = null;
  }
  if (status === 'rejected') patch.rejection_reason = reason || 'بدون توضیح';
  if (commission_rate !== undefined) patch.commission_rate = Number(commission_rate);

  const { data: seller, error } = await supabaseAdmin
    .from('seller_profiles').update(patch).eq('id', seller_id)
    .select('id, user_id, shop_name, status, rejection_reason, user:users(id)').single();
  if (error) return dbFail(res, error);

  // اگر رد یا تعلیق شد، محصولاتش از ویترین برداشته شود
  if (['rejected', 'suspended'].includes(status))
    await supabaseAdmin.from('products')
      .update({ status: 'archived' }).eq('seller_id', seller_id).eq('status', 'active');

  const messages = {
    approved: ['فروشگاه شما تأیید شد', 'حالا می‌توانید محصولات خود را اضافه کنید.'],
    rejected: ['درخواست شما رد شد', patch.rejection_reason],
    suspended: ['فروشگاه شما تعلیق شد', 'برای پیگیری با پشتیبانی تماس بگیرید.'],
    pending: ['وضعیت فروشگاه شما', 'درخواست شما دوباره در حال بررسی است.'],
  };
  const [title, body] = messages[status];
  if (seller?.user?.id)
    await notify(supabaseAdmin, seller.user.id, title, body, 'seller');

  return ok(res, { message: 'وضعیت فروشنده به‌روز شد.', seller });
}

export default withSafety(handler);
