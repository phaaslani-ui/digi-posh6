/** POST /api/seller/register — ارتقای مشتری به فروشنده */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, slugify, notify, rateLimit } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;
  /* جلوگیری از حمله‌ی حدس رمز — حداکثر 5 تلاش در دقیقه */
  if (rateLimit(req, res, { key: 'sreg', max: 5, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { shop_name, description, category, city, address, national_id, shaba_number } = req.body || {};
  const missing = required(req.body || {}, ['shop_name']);
  if (missing) return fail(res, missing);

  const { data: exists } = await supabaseAdmin
    .from('seller_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
  if (exists) return fail(res, `شما قبلاً درخواست داده‌اید. وضعیت: ${exists.status}`);

  const { data: seller, error } = await supabaseAdmin
    .from('seller_profiles')
    .insert({
      user_id: user.id, shop_name, slug: slugify(shop_name),
      description: description || null, category: category || null,
      city: city || null, address: address || null,
      national_id: national_id || null, shaba_number: shaba_number || null,
      status: 'pending',
    })
    .select().single();

  if (error) return dbFail(res, error);

  await supabaseAdmin.from('users').update({ role: 'seller' }).eq('id', user.id);

  const { data: admins } = await supabaseAdmin.from('users').select('id').eq('role', 'admin');
  for (const a of admins || [])
    await notify(supabaseAdmin, a.id, 'درخواست فروشندگی جدید',
      `فروشگاه «${shop_name}» در انتظار بررسی است.`, 'seller', '/admin/sellers');

  return ok(res, { message: 'درخواست شما ثبت شد و پس از تأیید ادمین فعال می‌شود.', seller }, 201);
}

export default withSafety(handler);
