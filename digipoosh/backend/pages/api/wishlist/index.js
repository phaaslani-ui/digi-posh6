/** GET /api/wishlist | POST افزودن | DELETE حذف (با product_id) */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST', 'DELETE'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'wish', max: 60, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .select('*, product:products(id, title, slug, price, discount_price, images, rating, status)')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return dbFail(res, error);
    return ok(res, { items: (data || []).filter((i) => i.product) });
  }

  const { product_id } = req.body || {};
  const missing = required(req.body || {}, ['product_id']);
  if (missing) return fail(res, missing);

  if (req.method === 'POST') {
    const { error } = await supabaseAdmin
      .from('wishlist').upsert({ user_id: user.id, product_id }, { onConflict: 'user_id,product_id' });
    if (error) return dbFail(res, error);
    return ok(res, { message: 'به علاقه‌مندی‌ها افزوده شد.' }, 201);
  }

  await supabaseAdmin.from('wishlist').delete()
    .eq('user_id', user.id).eq('product_id', product_id);
  return ok(res, { message: 'از علاقه‌مندی‌ها حذف شد.' });
}

export default withSafety(handler);
