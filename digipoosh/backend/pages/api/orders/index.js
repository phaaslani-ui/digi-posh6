/**
 * GET  /api/orders — سفارش‌های کاربر
 * POST /api/orders — ثبت سفارش از روی سبد خرید + محاسبه‌ی کمیسیون ۱۰٪
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import {
  ok, fail, methodGuard, cors, required, paginate,
  calcCommission, DEFAULT_COMMISSION_RATE, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail, audit } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 0);

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'order-new', max: 12, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  /* ============ فهرست سفارش‌ها ============ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return dbFail(res, error);
    return ok(res, {
      orders: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ============ ثبت سفارش ============ */
  const { receiver_name, receiver_phone, address, province, city, postal_code, note } = req.body || {};
  const missing = required(req.body || {}, ['receiver_name', 'receiver_phone', 'address']);
  if (missing) return fail(res, missing);

  // ۱) خواندن سبد
  const { data: cartItems, error: cartErr } = await supabaseAdmin
    .from('cart')
    .select('*, product:products(id, title, price, discount_price, images, stock, status, seller_id)')
    .eq('user_id', user.id);

  if (cartErr) return dbFail(res, cartErr);
  if (!cartItems?.length) return fail(res, 'سبد خرید شما خالی است.');

  // ۲) اعتبارسنجی موجودی
  for (const item of cartItems) {
    const p = item.product;
    if (!p) return fail(res, 'یکی از محصولات سبد حذف شده است.');
    if (p.status !== 'active') return fail(res, `«${p.title}» دیگر در دسترس نیست.`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1)
      return fail(res, `تعداد «${p.title}» نامعتبر است.`);
    if (p.stock < item.quantity)
      return fail(res, `موجودی «${p.title}» کافی نیست. موجودی: ${p.stock}`);
  }

  // ۳) نرخ کمیسیون هر فروشنده
  const sellerIds = [...new Set(cartItems.map((i) => i.product.seller_id).filter(Boolean))];
  const { data: sellers } = await supabaseAdmin
    .from('seller_profiles').select('id, user_id, shop_name, commission_rate').in('id', sellerIds);
  const rateOf = Object.fromEntries(
    (sellers || []).map((s) => [s.id, Number(s.commission_rate ?? DEFAULT_COMMISSION_RATE)])
  );

  // ۴) محاسبه‌ی مبالغ
  let subtotal = 0;
  let commissionTotal = 0;
  const itemRows = [];

  for (const item of cartItems) {
    const p = item.product;
    const unit = p.discount_price || p.price;
    const lineTotal = unit * item.quantity;
    const rate = rateOf[p.seller_id] ?? DEFAULT_COMMISSION_RATE;
    const { amount, payout } = calcCommission(lineTotal, rate);

    subtotal += lineTotal;
    commissionTotal += amount;

    itemRows.push({
      product_id: p.id,
      seller_id: p.seller_id,
      product_title: p.title,
      product_image: p.images?.[0] || null,
      unit_price: unit,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      line_total: lineTotal,
      commission_rate: rate,
      commission_amount: amount,
      seller_payout: payout,
    });
  }

  const total = subtotal + SHIPPING_FEE;

  // ۵) ساخت سفارش
  const { data: orderNumber } = await supabaseAdmin.rpc('gen_order_number');
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber || `DP-${Date.now()}`,
      user_id: user.id,
      status: 'pending',
      subtotal,
      shipping_fee: SHIPPING_FEE,
      total,
      commission_total: commissionTotal,
      receiver_name, receiver_phone, address,
      province: province || null, city: city || null,
      postal_code: postal_code || null, note: note || null,
    })
    .select().single();

  if (orderErr) return dbFail(res, orderErr, 'ثبت سفارش ممکن نشد.');

  // ۶) ثبت آیتم‌ها
  const { data: savedItems, error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .insert(itemRows.map((r) => ({ ...r, order_id: order.id })))
    .select();

  if (itemsErr) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id); // rollback
    return dbFail(res, itemsErr, 'ثبت اقلام سفارش ممکن نشد.');
  }

  // ۷) ثبت کمیسیون‌ها
  const commissionRows = (savedItems || [])
    .filter((it) => it.seller_id)
    .map((it) => ({
      order_id: order.id,
      order_item_id: it.id,
      seller_id: it.seller_id,
      gross_amount: it.line_total,
      rate: it.commission_rate,
      amount: it.commission_amount,
      seller_payout: it.seller_payout,
      status: 'pending',
    }));

  if (commissionRows.length)
    await supabaseAdmin.from('commissions').insert(commissionRows);

  /*
   * ۸) کاهش موجودی — به‌صورت شرطی.
   * پیش از این، موجودی «خوانده‌شده» منهای تعداد نوشته می‌شد.
   * اگر دو خریدار هم‌زمان سفارش می‌دادند، هر دو موجودی قدیمی
   * را می‌دیدند و انبار منفی می‌شد. حالا شرط `stock >= تعداد`
   * داخل خود دستور است؛ اگر جا نبود، سفارش برگردانده می‌شود.
   */
  const failedStock = [];
  for (const item of cartItems) {
    const { data: upd } = await supabaseAdmin
      .from('products')
      .update({ stock: item.product.stock - item.quantity })
      .eq('id', item.product.id)
      .gte('stock', item.quantity)
      .eq('stock', item.product.stock)
      .select('id')
      .maybeSingle();
    if (!upd) failedStock.push(item.product.title);
  }

  if (failedStock.length) {
    /* برگرداندن همه‌چیز — سفارشی ثبت نمی‌شود */
    await supabaseAdmin.from('commissions').delete().eq('order_id', order.id);
    await supabaseAdmin.from('order_items').delete().eq('order_id', order.id);
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return fail(
      res,
      `موجودی «${failedStock.join('، ')}» همین لحظه تمام شد. سبد را دوباره بررسی کنید.`,
      409
    );
  }

  // ۹) خالی کردن سبد
  await supabaseAdmin.from('cart').delete().eq('user_id', user.id);

  // ۱۰) اعلان‌ها
  await notify(supabaseAdmin, user.id, 'سفارش ثبت شد',
    `سفارش ${order.order_number} با موفقیت ثبت شد.`, 'order', `/orders/${order.id}`);

  for (const s of sellers || []) {
    const mine = itemRows.filter((r) => r.seller_id === s.id);
    if (!mine.length) continue;
    await notify(supabaseAdmin, s.user_id, 'سفارش جدید',
      `${mine.length} قلم از فروشگاه «${s.shop_name}» سفارش داده شد.`, 'order', '/seller/orders');
  }

  return ok(res, {
    message: 'سفارش شما با موفقیت ثبت شد.',
    order: { ...order, items: savedItems },
  }, 201);
}

export default withSafety(handler);
