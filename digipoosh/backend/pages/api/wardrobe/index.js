/**
 * GET    /api/wardrobe        — ست‌های ذخیره‌شده‌ی من
 * POST   /api/wardrobe        — ذخیره‌ی ست تازه
 * DELETE /api/wardrobe?id=…   — حذف ست
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { requireAuth } from '../../../lib/auth';
import { isUuid, cleanIds } from '../../../lib/digiai';

const MAX_OUTFITS = 60;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['GET', 'POST', 'DELETE'])) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  /* ---------- خواندن ---------- */
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('outfits')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(MAX_OUTFITS);

    if (error) return dbFail(res, error, 'خواندن کمد انجام نشد.');
    return ok(res, { outfits: data || [], count: (data || []).length });
  }

  /* ---------- حذف ---------- */
  if (req.method === 'DELETE') {
    const id = req.query?.id;
    if (!isUuid(id)) return fail(res, 'شناسه نامعتبر است.', 400);

    const { error } = await supabaseAdmin
      .from('outfits').delete().eq('id', id).eq('user_id', user.id);

    if (error) return dbFail(res, error, 'حذف انجام نشد.');
    return ok(res, { removed: true });
  }

  /* ---------- ذخیره ---------- */
  const b = req.body || {};
  if (!isUuid(b.heroId)) return fail(res, 'کالای اصلی نامعتبر است.', 400);

  const itemIds = cleanIds(b.itemIds);
  if (!itemIds.length) return fail(res, 'ست باید دست‌کم یک قطعه داشته باشد.', 400);

  /* سقف: کمد بی‌نهایت نمی‌شود */
  const { count } = await supabaseAdmin
    .from('outfits').select('id', { count: 'exact', head: true }).eq('user_id', user.id);

  if ((count || 0) >= MAX_OUTFITS) {
    return fail(res, `کمد شما پر است (${MAX_OUTFITS} ست). یکی را حذف کنید.`, 409);
  }

  /* قیمت را از پایگاه‌داده بخوان، نه از ورودی کاربر —
     وگرنه می‌شود عدد دلخواه فرستاد */
  const { data: prods } = await supabaseAdmin
    .from('products').select('id,price').in('id', [b.heroId, ...itemIds]);

  const total = (prods || []).reduce((a, p) => a + (Number(p.price) || 0), 0);

  const slots = Array.isArray(b.slots) ? b.slots.slice(0, itemIds.length) : [];
  const items = itemIds.map((id, i) => ({
    product_id: id, slot: String(slots[i] || ''), sort: i,
  }));

  const { data, error } = await supabaseAdmin
    .from('outfits')
    .insert({
      user_id: user.id,
      name: String(b.name || '').trim().slice(0, 120) || 'ست بدون نام',
      hero_id: b.heroId,
      items,
      occasion: String(b.occasion || '').slice(0, 40) || null,
      style: String(b.style || '').slice(0, 40) || null,
      variant: String(b.variant || '').slice(0, 20) || null,
      score: Math.max(0, Math.min(100, Number(b.score) || 0)),
      total_price: total,
    })
    .select()
    .single();

  if (error) return dbFail(res, error, 'ذخیره‌ی ست انجام نشد.');
  return ok(res, { outfit: data, message: 'ست در کمد ذخیره شد.' }, 201);
}

export default withSafety(handler);
