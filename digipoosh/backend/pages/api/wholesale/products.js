/**
 * GET  /api/wholesale/products — ویترین بازار عمده (عمومی)
 * POST /api/wholesale/products — ثبت کالای تازه (فقط تأمین‌کننده)
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, paginate, rateLimit } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import {
  requireWholesaleSeller, cleanTiers, uniqueCode, productOut,
  boostWeights, intIn,
} from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  /* ══════════════════ ویترین عمومی ══════════════════ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);
    const { q, section, group, seller, minPrice, maxPrice, maxMoq, inStock, sort } = req.query;

    let query = supabaseAdmin
      .from('wholesale_products')
      .select(
        'id, seller_id, name, code, brand, section, "group", item, category,' +
        'price, moq, stock, lead_time, tiers, images, sold, created_at,' +
        'seller:seller_profiles!inner(id, shop_name, city, status, seller_type, lead_time)',
        { count: 'exact' }
      )
      .eq('status', 'active')
      .eq('seller.status', 'approved')
      .eq('seller.seller_type', 'wholesale');

    /* ---------- فیلترها ---------- */
    if (q) {
      const safe = String(q).replace(/[%,()]/g, ' ').trim().slice(0, 80);
      if (safe) query = query.or(`name.ilike.%${safe}%,brand.ilike.%${safe}%,code.eq.${safe}`);
    }
    if (section) query = query.eq('section', section);
    if (group)   query = query.eq('group', group);
    if (seller)  query = query.eq('seller_id', seller);

    const lo = intIn(minPrice, 0, 1e12);
    const hi = intIn(maxPrice, 0, 1e12);
    if (lo !== null) query = query.gte('price', lo);
    if (hi !== null) query = query.lte('price', hi);

    const mm = intIn(maxMoq, 1, 1e6);
    if (mm !== null) query = query.lte('moq', mm);

    if (inStock === '1' || inStock === 'true') query = query.gt('stock', 0);

    /* ---------- مرتب‌سازی ---------- */
    const ORDER = {
      cheap:  ['price', true],
      exp:    ['price', false],
      newest: ['created_at', false],
      moq:    ['moq', true],
      pop:    ['sold', false],
    };
    const [col, asc] = ORDER[sort] || ORDER.pop;
    query = query.order(col, { ascending: asc }).range(from, to);

    const { data, error, count } = await query;
    if (error) return dbFail(res, error);

    /*
     * وزن نردبان در پایگاه داده قابل مرتب‌سازی نیست (چون در
     * جدول دیگری است)، پس همین صفحه را دوباره مرتب می‌کنیم.
     * دارندگان نردبان بالای همین صفحه می‌آیند.
     */
    const W = await boostWeights();
    const rows = (data || [])
      .map((p) => ({
        ...productOut(p),
        seller: p.seller
          ? { id: p.seller.id, name: p.seller.shop_name, city: p.seller.city || '' }
          : null,
        boost: W[p.seller_id] || 0,
      }))
      .sort((a, b) => b.boost - a.boost);

    return ok(res, {
      products: rows,
      pagination: {
        page, limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  }

  /* ══════════════════ ثبت کالا ══════════════════ */
  if (rateLimit(req, res, { key: 'wp-add', max: 40, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const guard = await requireWholesaleSeller(req, res, user);
  if (!guard) return;
  const { seller, rule } = guard;

  const b = req.body || {};

  const name = String(b.name || '').trim();
  if (name.length < 2) return fail(res, 'نام کالا را بنویسید.');
  if (name.length > 140) return fail(res, 'نام کالا بیش از حد بلند است.');

  const price = intIn(b.price, 1, 1e11);
  if (price === null) return fail(res, 'قیمت باید عددی مثبت باشد.');

  const moq = intIn(b.moq, 1, 1e6);
  if (moq === null) return fail(res, 'حداقل سفارش باید دست‌کم ۱ باشد.');

  const stock = intIn(b.stock, 0, 1e7);
  if (stock === null) return fail(res, 'موجودی نمی‌تواند منفی باشد.');

  const images = Array.isArray(b.images) ? b.images.slice(0, 6) : [];

  const row = {
    seller_id: seller.id,
    name,
    code: await uniqueCode(seller.id, b.code),
    brand: String(b.brand || '').trim().slice(0, 80),
    description: String(b.description || '').trim().slice(0, 2000),

    section: String(b.section || '').trim(),
    group:   String(b.group   || '').trim(),
    item:    String(b.item    || '').trim(),
    category: String(b.category || b.item || '').trim(),

    price, moq, stock,
    low_at:    intIn(b.lowAt, 0, 1e7) ?? Math.floor(moq * 3),
    lead_time: intIn(b.leadTime, 0, 365) ?? 0,
    tiers: cleanTiers(b.tiers, price, moq),

    material: String(b.material || '').trim().slice(0, 120),
    colors:   String(b.colors   || '').trim().slice(0, 200),
    sizes:    String(b.sizes    || '').trim().slice(0, 200),
    packing:  String(b.packing  || '').trim().slice(0, 200),
    images,

    /*
     * تا وقتی مدیر فروشگاه را تأیید نکرده، کالا پیش‌نویس
     * می‌ماند. خواسته‌ی فروشنده در `wanted` نگه داشته می‌شود
     * تا پس از تأیید، همان اجرا شود.
     */
    status: rule.canPublish ? (b.status === 'draft' ? 'draft' : 'active') : 'draft',
    wanted: b.status === 'draft' ? 'draft' : 'active',
  };

  const { data, error } = await supabaseAdmin
    .from('wholesale_products')
    .insert(row)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return fail(res, 'کالایی با این کد از قبل هست.', 409);
    return dbFail(res, error);
  }

  return ok(res, {
    product: productOut(data),
    message: rule.canPublish
      ? 'کالا ثبت شد و در بازار عمده دیده می‌شود.'
      : 'کالا ثبت شد — پس از تأیید مدیر منتشر می‌شود.',
    published: rule.canPublish,
  }, 201);
}

export default withSafety(handler);
