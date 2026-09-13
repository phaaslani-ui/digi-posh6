/** POST /api/auth/register — ثبت‌نام مشتری یا فروشنده */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors, required, slugify, notify, rateLimit, notifyAll} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  /* جلوگیری از حمله‌ی حدس رمز — حداکثر 5 تلاش در دقیقه */
  if (rateLimit(req, res, { key: 'register', max: 5, windowMs: 60000 })) return;
  if (!supabaseAdmin) return fail(res, 'سرویس در دسترس نیست.', 500);

  const { email, password, full_name, phone, role = 'customer', shop_name, category, city } = req.body || {};

  const missing = required(req.body || {}, ['email', 'password', 'full_name']);
  if (missing) return fail(res, missing);
  if (String(password).length < 6) return fail(res, 'رمز عبور باید حداقل ۶ کاراکتر باشد.');
  if (!['customer', 'seller'].includes(role)) return fail(res, 'نقش نامعتبر است.');
  if (role === 'seller' && !shop_name) return fail(res, 'نام فروشگاه الزامی است.');

  // ۱) ساخت کاربر در Auth
  const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, role },
  });

  if (authErr) {
    const msg = /already registered|exists/i.test(authErr.message)
      ? 'این ایمیل قبلاً ثبت شده است.'
      : authErr.message;
    return fail(res, msg);
  }

  const userId = created.user.id;

  // ۲) اطمینان از وجود ردیف در جدول users (تریگر معمولاً ساخته)
  await supabaseAdmin.from('users').upsert({
    id: userId, email, full_name, phone, role,
  }, { onConflict: 'id' });

  // ۳) اگر فروشنده است، پروفایل در انتظار تأیید بساز
  let seller = null;
  if (role === 'seller') {
    const { data, error } = await supabaseAdmin
      .from('seller_profiles')
      .insert({
        user_id: userId,
        shop_name,
        slug: slugify(shop_name),
        category: category || null,
        city: city || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return dbFail(res, error, 'ساخت پروفایل فروشنده ممکن نشد.');
    seller = data;

    // اطلاع به ادمین‌ها
    const { data: admins } = await supabaseAdmin.from('users').select('id').eq('role', 'admin');
    /* یک درخواست به‌جای چند درخواست پشت سر هم */
    await notifyAll(supabaseAdmin, (admins || []).map((a) => a.id),
      'درخواست فروشندگی جدید',
      `فروشگاه «${shop_name}» در انتظار بررسی است.`, 'seller', '/admin/sellers');
  }

  await notify(supabaseAdmin, userId, 'به دیجی‌پوش خوش آمدید',
    role === 'seller'
      ? 'درخواست فروشندگی شما ثبت شد و پس از بررسی ادمین فعال می‌شود.'
      : 'حساب شما با موفقیت ساخته شد.',
    'info');

  return ok(res, {
    message: role === 'seller'
      ? 'ثبت‌نام انجام شد. فروشگاه شما پس از تأیید ادمین فعال می‌شود.'
      : 'ثبت‌نام با موفقیت انجام شد.',
    user: { id: userId, email, full_name, role },
    seller,
  }, 201);
}

export default withSafety(handler);
