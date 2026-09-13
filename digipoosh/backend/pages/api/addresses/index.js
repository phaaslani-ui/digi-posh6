/**
 * GET    /api/addresses — دفترچه‌ی نشانی خریدار
 * POST   /api/addresses — افزودن نشانی
 * PATCH  /api/addresses — ویرایش  (با id در بدنه)
 * DELETE /api/addresses — حذف     (با id در بدنه)
 *
 * ------------------------------------------------------------
 * پیش از این نشانی فقط داخل خود سفارش ذخیره می‌شد، یعنی
 * خریدار هر بار باید از نو می‌نوشت. حالا دفترچه دارد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit } from '../../../lib/helpers';
import { dbFail, text, multiline } from '../../../lib/guard';
import { normalizePhone, validPhone } from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

const MAX_ADDRESSES = 15;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'DELETE'])) return;
  if (req.method !== 'GET' &&
      rateLimit(req, res, { key: 'addr', max: 30, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return dbFail(res, error);
    return ok(res, { addresses: data || [] });
  }

  /* ══════════════════ حذف ══════════════════ */
  if (req.method === 'DELETE') {
    const id = req.body?.id || req.query?.id;
    if (!id) return fail(res, 'شناسه‌ی نشانی لازم است.');

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);      /* فقط نشانی خودش */

    if (error) return dbFail(res, error);
    return ok(res, { message: 'نشانی حذف شد.' });
  }

  /* ---------- اعتبارسنجی مشترک افزودن و ویرایش ---------- */
  const b = req.body || {};

  const receiver = text(b.receiver, 80);
  if (receiver.length < 2) return fail(res, 'نام گیرنده را بنویسید.');

  const phone = normalizePhone(b.phone);
  if (!validPhone(phone)) return fail(res, 'شماره تماس معتبر نیست.');

  const address = multiline(b.address, 500);
  if (address.length < 10) return fail(res, 'نشانی را کامل‌تر بنویسید.');

  /* کد پستی ایران دقیقاً ده رقم است — اگر نوشته شده باشد */
  const postal = normalizePhone(b.postalCode);
  if (postal && postal.length !== 10) {
    return fail(res, 'کد پستی باید ده رقم باشد.');
  }

  const row = {
    receiver,
    phone,
    address,
    label:       text(b.label, 40) || null,
    province:    text(b.province, 40) || null,
    city:        text(b.city, 40) || null,
    postal_code: postal || null,
  };

  /* ══════════════════ ویرایش ══════════════════ */
  if (req.method === 'PATCH') {
    if (!b.id) return fail(res, 'شناسه‌ی نشانی لازم است.');

    if (b.isDefault === true) await clearDefault(user.id);
    row.is_default = b.isDefault === true;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update(row)
      .eq('id', b.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) return dbFail(res, error);
    if (!data) return fail(res, 'نشانی پیدا نشد.', 404);
    return ok(res, { address: data, message: 'نشانی به‌روز شد.' });
  }

  /* ══════════════════ افزودن ══════════════════ */
  const { count } = await supabaseAdmin
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= MAX_ADDRESSES) {
    return fail(res, `بیش از ${MAX_ADDRESSES} نشانی نمی‌شود ذخیره کرد.`);
  }

  /* نخستین نشانی خودکار پیش‌فرض می‌شود */
  const makeDefault = b.isDefault === true || (count || 0) === 0;
  if (makeDefault) await clearDefault(user.id);

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert({ ...row, user_id: user.id, is_default: makeDefault })
    .select()
    .single();

  if (error) return dbFail(res, error);
  return ok(res, { address: data, message: 'نشانی ذخیره شد.' }, 201);
}

/**
 * فقط یک نشانی می‌تواند پیش‌فرض باشد.
 * نمایه‌ی یکتای جزئی در پایگاه داده این را تضمین می‌کند،
 * پس پیش از تنظیم پیش‌فرض تازه، قبلی خاموش می‌شود.
 */
async function clearDefault(userId) {
  await supabaseAdmin
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);
}

export default withSafety(handler);
