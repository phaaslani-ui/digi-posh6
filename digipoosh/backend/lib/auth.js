/**
 * دیجی‌پوش — لایه‌ی احراز هویت و کنترل دسترسی
 */
import { supabaseAdmin, supabaseAsUser } from './supabase';

/** استخراج توکن از هدر Authorization */
export function getToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

/**
 * کاربر فعلی را برمی‌گرداند یا null
 * خروجی: { id, email, role, full_name, phone, ... }
 */
export async function getUser(req) {
  const token = getToken(req);
  if (!token || !supabaseAdmin) return null;

  const { data: authData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !authData?.user) return null;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (!profile) return null;
  return { ...profile, token };
}

/** کلاینتی که با هویت خود کاربر کار می‌کند (RLS فعال) */
export function userClient(req) {
  const token = getToken(req);
  return token ? supabaseAsUser(token) : null;
}

/** فقط کاربران واردشده */
export async function requireAuth(req, res) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'برای این عملیات باید وارد حساب خود شوید.' });
    return null;
  }
  if (!user.is_active) {
    res.status(403).json({ ok: false, error: 'حساب کاربری شما غیرفعال شده است.' });
    return null;
  }
  return user;
}

/** فقط نقش‌های مشخص */
export async function requireRole(req, res, roles = []) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) {
    res.status(403).json({ ok: false, error: 'شما به این بخش دسترسی ندارید.' });
    return null;
  }
  return user;
}

/** فروشنده‌ی تأییدشده */
export async function requireApprovedSeller(req, res) {
  const user = await requireRole(req, res, ['seller', 'admin']);
  if (!user) return null;

  if (user.role === 'admin') return { user, seller: null };

  const { data: seller } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!seller) {
    res.status(404).json({ ok: false, error: 'پروفایل فروشندگی یافت نشد.' });
    return null;
  }
  if (seller.status !== 'approved') {
    res.status(403).json({
      ok: false,
      error: 'فروشگاه شما هنوز تأیید نشده است.',
      status: seller.status,
    });
    return null;
  }
  return { user, seller };
}
