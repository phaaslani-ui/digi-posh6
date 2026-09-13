/** GET /api/auth/me — اطلاعات کاربر فعلی | PATCH — ویرایش پروفایل */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    let seller = null;
    if (user.role === 'seller') {
      const { data } = await supabaseAdmin
        .from('seller_profiles').select('*').eq('user_id', user.id).single();
      seller = data || null;
    }
    const { count } = await supabaseAdmin
      .from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_read', false);

    const { token, ...safe } = user;
    return ok(res, { user: safe, seller, unread_notifications: count || 0 });
  }

  // PATCH
  const { full_name, phone, avatar_url } = req.body || {};
  const patch = {};
  if (full_name !== undefined) patch.full_name = full_name;
  if (phone !== undefined) patch.phone = phone;
  if (avatar_url !== undefined) patch.avatar_url = avatar_url;
  if (!Object.keys(patch).length) return fail(res, 'داده‌ای برای به‌روزرسانی ارسال نشده.');

  const { data, error } = await supabaseAdmin
    .from('users').update(patch).eq('id', user.id).select().single();
  if (error) return dbFail(res, error);

  return ok(res, { message: 'پروفایل به‌روز شد.', user: data });
}

export default withSafety(handler);
