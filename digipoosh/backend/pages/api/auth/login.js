/** POST /api/auth/login — ورود */
import { supabasePublic, supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors, required, rateLimit, rateLimitReset } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  /* جلوگیری از حمله‌ی حدس رمز — حداکثر 8 تلاش در دقیقه */
  if (rateLimit(req, res, { key: 'login', max: 8, windowMs: 60000 })) return;

  const { email, password } = req.body || {};
  const missing = required(req.body || {}, ['email', 'password']);
  if (missing) return fail(res, missing);

  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });
  if (error) return fail(res, 'ایمیل یا رمز عبور نادرست است.', 401);

  const { data: profile } = await supabaseAdmin
    .from('users').select('*').eq('id', data.user.id).single();

  if (profile && !profile.is_active) return fail(res, 'حساب شما غیرفعال شده است.', 403);

  let seller = null;
  if (profile?.role === 'seller') {
    const { data: s } = await supabaseAdmin
      .from('seller_profiles').select('*').eq('user_id', data.user.id).single();
    seller = s || null;
  }

  /* ورود موفق بود — شمارش تلاش‌ها پاک می‌شود تا کاربر درست جریمه نشود */
  rateLimitReset(req, 'login');

  return ok(res, {
    message: 'ورود موفق.',
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: profile,
    seller,
  });
}

export default withSafety(handler);
