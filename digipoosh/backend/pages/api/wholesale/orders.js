/**
 * GET  /api/wholesale/orders — سفارش‌های عمده
 * POST /api/wholesale/orders — ثبت سفارش از سبد بازار عمده
 *
 * ------------------------------------------------------------
 * نکته‌ی مهم: قیمت هرگز از سمت خریدار پذیرفته نمی‌شود.
 * خریدار فقط «شناسه‌ی کالا و تعداد» می‌فرستد؛ قیمت پلکانی
 * اینجا از روی داده‌ی پایگاه حساب می‌شود. در غیر این صورت
 * می‌شد قیمت را در مرورگر دستکاری کرد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { getUser, requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, paginate, rateLimit, notify } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import {
  wholesaleSeller, orderOut, priceFor, normalizePhone, validPhone, intIn,
} from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { page, limit, from, to } = paginate(req.query);
    const { status } = req.query;
    const seller = await wholesaleSeller(user.id);

    let query = supabaseAdmin
      .from('wholesale_orders')
      .select('*, items:wholesale_order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    query = seller ? query.eq('seller_id', seller.id) : query.eq('buyer_id', user.id);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return dbFail(res, error);

    return ok(res, {
      orders: (data || []).map(orderOut),
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ══════════════════ ثبت سفارش ══════════════════ */
  if (rateLimit(req, res, { key: 'wo-new', max: 10, windowMs: 60000 })) return;

  const b = req.body || {};
  const user = await getUser(req);       /* خریدار مهمان هم مجاز است */

  const buyerName = String(b.buyerName || '').trim();
  if (buyerName.length < 2) return fail(res, 'نام گیرنده را بنویسید.');

  const phone = normalizePhone(b.buyerPhone);
  if (!validPhone(phone)) return fail(res, 'شماره تماس معتبر نیست.');

  const lines = Array.isArray(b.lines) ? b.lines : [];
  if (!lines.length) return fail(res, 'سفارش بدون کالا نمی‌شود.');
  if (lines.length > 60) return fail(res, 'تعداد ردیف‌ها بیش از حد است.');

  /* ---------- خواندن کالاهای واقعی ---------- */
  const ids = [...new Set(lines.map((l) => l?.productId).filter(Boolean))];
  if (!ids.length) return fail(res, 'کالاهای سفارش مشخص نیست.');

  const { data: prods, error: pErr } = await supabaseAdmin
    .from('wholesale_products')
    .select('id, seller_id, name, price, moq, stock, tiers, status')
    .in('id', ids);

  if (pErr) return dbFail(res, pErr);

  const byId = new Map((prods || []).map((p) => [p.id, p]));

  /*
   * همه‌ی کالاها باید از یک تأمین‌کننده باشند.
   * سفارش چندفروشندگی در عمده معنا ندارد: هر تأمین‌کننده
   * جدا بار می‌زند، جدا فاکتور می‌دهد و جدا تسویه می‌کند.
   */
  const sellers = new Set((prods || []).map((p) => p.seller_id));
  if (sellers.size !== 1) {
    return fail(res, 'هر سفارش باید فقط از یک تأمین‌کننده باشد.');
  }
  const sellerId = [...sellers][0];

  const { data: sp } = await supabaseAdmin
    .from('seller_profiles')
    .select('id, user_id, shop_name, status, seller_type, min_order_value')
    .eq('id', sellerId)
    .maybeSingle();

  if (!sp || sp.seller_type !== 'wholesale' || sp.status !== 'approved') {
    return fail(res, 'این تأمین‌کننده در دسترس نیست.', 404);
  }

  /* ---------- ساخت ردیف‌ها با قیمت سمت سرور ---------- */
  const rows = [];
  let total = 0, count = 0;

  for (const l of lines) {
    const p = byId.get(l?.productId);
    if (!p) return fail(res, 'یکی از کالاها دیگر در دسترس نیست.');
    if (p.status !== 'active') return fail(res, `«${p.name}» فعلاً عرضه نمی‌شود.`);

    const qty = intIn(l.qty, 1, 1e7);
    if (qty === null) return fail(res, `تعداد «${p.name}» نامعتبر است.`);
    if (qty < p.moq) return fail(res, `حداقل سفارش «${p.name}» ${p.moq} عدد است.`);
    if (qty > p.stock) return fail(res, `موجودی «${p.name}» فقط ${p.stock} عدد است.`);

    const { unit, total: lineTotal } = priceFor(p, qty);

    rows.push({
      product_id: p.id,
      name: p.name,
      qty,
      unit_price: unit,
      line_total: lineTotal,
    });
    total += lineTotal;
    count += qty;
  }

  /* حداقل ارزش سفارش تأمین‌کننده */
  const minV = Number(sp.min_order_value) || 0;
  if (minV && total < minV) {
    return fail(res, `حداقل ارزش سفارش این تأمین‌کننده ${minV.toLocaleString('en-US')} تومان است.`);
  }

  /* ---------- ثبت ---------- */
  const { data: num } = await supabaseAdmin.rpc('gen_wholesale_order_number');

  const { data: order, error: oErr } = await supabaseAdmin
    .from('wholesale_orders')
    .insert({
      order_number: num || `WO-${Date.now()}`,
      seller_id: sellerId,
      buyer_id: user?.id || null,
      buyer_name: buyerName.slice(0, 80),
      buyer_phone: phone,
      buyer_company: String(b.buyerCompany || '').trim().slice(0, 120),
      address: String(b.address || '').trim().slice(0, 500),
      item_count: count,
      total,
      status: 'pending',
      note: String(b.note || '').trim().slice(0, 1000),
    })
    .select()
    .single();

  if (oErr) return dbFail(res, oErr);

  const { error: iErr } = await supabaseAdmin
    .from('wholesale_order_items')
    .insert(rows.map((r) => ({ ...r, order_id: order.id })));

  if (iErr) {
    await supabaseAdmin.from('wholesale_orders').delete().eq('id', order.id);
    return dbFail(res, iErr);
  }

  await notify(
    supabaseAdmin, sp.user_id, 'سفارش عمده‌ی تازه',
    `${buyerName} سفارشی به ارزش ${total.toLocaleString('en-US')} تومان ثبت کرد.`,
    'order'
  );

  return ok(res, {
    order: orderOut({ ...order, items: rows }),
    message: `سفارش ${order.order_number} ثبت شد. تأمین‌کننده تماس می‌گیرد.`,
  }, 201);
}

export default withSafety(handler);
