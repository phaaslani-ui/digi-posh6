/**
 * GET    /api/fit/measurements   — اندازه‌های من
 * POST   /api/fit/measurements   — ذخیره/بروزرسانی
 * DELETE /api/fit/measurements?id=…
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { requireAuth } from '../../../lib/auth';
import { cleanBody, bodyToRow, FIT_PREF } from '../../../lib/fit';

const MAX_PROFILES = 5;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['GET', 'POST', 'DELETE'])) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  /* ---------- خواندن ---------- */
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('body_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) return dbFail(res, error, 'خواندن اندازه‌ها انجام نشد.');
    return ok(res, { profiles: data || [] });
  }

  /* ---------- حذف ---------- */
  if (req.method === 'DELETE') {
    const id = req.query?.id;
    if (!id) return fail(res, 'شناسه لازم است.', 400);

    const { error } = await supabaseAdmin
      .from('body_profiles').delete().eq('id', id).eq('user_id', user.id);

    if (error) return dbFail(res, error, 'حذف انجام نشد.');
    return ok(res, { removed: true });
  }

  /* ---------- ذخیره ---------- */
  const b = req.body || {};
  const v = cleanBody(b.body || b);

  if (!v.ok) return fail(res, v.errors.join(' · '), 400);

  const fit = FIT_PREF[b.fit] ? b.fit : 'tailored';
  const name = String(b.name || '').trim().slice(0, 50) || 'اندازه‌های من';

  /* سقف پروفایل */
  if (!b.id) {
    const { count } = await supabaseAdmin
      .from('body_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) >= MAX_PROFILES) {
      return fail(res, `بیش از ${MAX_PROFILES} پروفایل نمی‌شود ساخت.`, 409);
    }
  }

  /* پروفایل تازه فعال می‌شود — بقیه غیرفعال */
  await supabaseAdmin
    .from('body_profiles')
    .update({ is_active: false })
    .eq('user_id', user.id);

  const row = {
    user_id: user.id,
    name,
    fit_pref: fit,
    is_active: true,
    updated_at: new Date().toISOString(),
    ...bodyToRow(v.body),
  };

  const q = b.id
    ? supabaseAdmin.from('body_profiles').update(row)
        .eq('id', b.id).eq('user_id', user.id).select().single()
    : supabaseAdmin.from('body_profiles').insert(row).select().single();

  const { data, error } = await q;
  if (error) return dbFail(res, error, 'ذخیره انجام نشد.');

  return ok(res, { profile: data, message: 'اندازه‌های شما ذخیره شد.' });
}

export default withSafety(handler);
