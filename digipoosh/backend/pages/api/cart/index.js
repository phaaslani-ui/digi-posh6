/** GET /api/cart — مشاهده سبد | POST — افزودن | DELETE — خالی کردن */
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
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'cart', max: 90, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  // ---------- مشاهده ----------
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('cart')
      .select('*, product:products(id, title, slug, price, discount_price, images, stock, status, seller_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return dbFail(res, error);

    const items = (data || []).filter((i) => i.product);
    const subtotal = items.reduce((s, i) => {
      const p = i.product.discount_price || i.product.price;
      return s + p * i.quantity;
    }, 0);

    return ok(res, {
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
    });
  }

  // ---------- افزودن ----------
  if (req.method === 'POST') {
    const { product_id, size = null, color = null } = req.body || {};
    const missing = required(req.body || {}, ['product_id']);
    if (missing) return fail(res, missing);

    /*
     * تعداد باید عدد صحیح مثبت باشد.
     * پیش از این «۱-» هم می‌گذشت، چون شرط فقط «موجودی کمتر از
     * تعداد» را می‌سنجید و ۵- همیشه کمتر از موجودی است — یعنی
     * می‌شد سبد را با تعداد منفی پر کرد و جمع را دستکاری کرد.
     */
    const quantity = Number(req.body?.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999)
      return fail(res, 'تعداد باید عددی صحیح بین ۱ تا ۹۹۹ باشد.');

    const { data: product } = await supabaseAdmin
      .from('products').select('id, stock, status, title').eq('id', product_id).single();

    if (!product) return fail(res, 'محصول یافت نشد.', 404);
    if (product.status !== 'active') return fail(res, 'این محصول در دسترس نیست.');
    if (product.stock < quantity) return fail(res, `موجودی کافی نیست. موجودی فعلی: ${product.stock}`);

    const dupBase = supabaseAdmin
      .from('cart').select('*')
      .eq('user_id', user.id).eq('product_id', product_id);

    /*
     * `.is()` فقط برای null و true/false کار می‌کند. وقتی سایز
     * یا رنگ رشته بود، شرط هرگز برقرار نمی‌شد و به‌جای زیاد شدن
     * تعداد، ردیف تکراری در سبد ساخته می‌شد.
     */
    const dupQ = size === null ? dupBase.is('size', null) : dupBase.eq('size', size);
    const { data: existing } = await (
      color === null ? dupQ.is('color', null) : dupQ.eq('color', color)
    ).maybeSingle();

    let row;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) return fail(res, `موجودی کافی نیست. موجودی فعلی: ${product.stock}`);
      const { data, error } = await supabaseAdmin
        .from('cart').update({ quantity: newQty }).eq('id', existing.id).select().single();
      if (error) return dbFail(res, error);
      row = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('cart')
        .insert({ user_id: user.id, product_id, quantity, size, color })
        .select().single();
      if (error) return dbFail(res, error);
      row = data;
    }

    return ok(res, { message: `«${product.title}» به سبد افزوده شد.`, item: row }, 201);
  }

  // ---------- خالی کردن ----------
  const { error } = await supabaseAdmin.from('cart').delete().eq('user_id', user.id);
  if (error) return dbFail(res, error);
  return ok(res, { message: 'سبد خرید خالی شد.' });
}

export default withSafety(handler);
