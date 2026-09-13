/**
 * GET  /api/wholesale/rfq — استعلام‌های من (فروشنده یا خریدار)
 * POST /api/wholesale/rfq — ثبت استعلام تازه (باز برای همه)
 *
 * ------------------------------------------------------------
 * استعلام قیمت ستون فقرات عمده‌فروشی است. خریدار عمده معمولاً
 * قیمت ویترین را نمی‌پذیرد؛ تعدادش را می‌گوید و انتظار قیمت
 * بهتری دارد. برای همین این مسیر برای مهمان هم باز است —
 * ولی با نرخ‌بند سخت‌گیرانه تا کسی سیل استعلام نفرستد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { getUser } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, paginate, rateLimit, notify } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import {
  wholesaleSeller, rfqOut, normalizePhone, validPhone, intIn,
  priceFor, countBoost,
} from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return fail(res, 'ابتدا وارد شوید.', 401);

    const { page, limit, from, to } = paginate(req.query);
    const { status } = req.query;

    const seller = await wholesaleSeller(user.id);

    let query = supabaseAdmin
      .from('wholesale_rfq')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    /* فروشنده استعلام‌های خودش را می‌بیند، خریدار استعلام‌های خودش را */
    query = seller
      ? query.eq('seller_id', seller.id)
      : query.eq('buyer_id', user.id);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return dbFail(res, error);

    return ok(res, {
      rfq: (data || []).map(rfqOut),
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ══════════════════ ثبت استعلام ══════════════════ */
  if (rateLimit(req, res, { key: 'rfq', max: 6, windowMs: 60000 })) return;

  const b = req.body || {};
  const user = await getUser(req);   /* مهمان هم مجاز است */

  const qty = intIn(b.qty, 1, 1e7);
  if (qty === null) return fail(res, 'تعداد مورد نیاز را بنویسید.');

  const buyerName = String(b.buyerName || '').trim();
  if (buyerName.length < 2) {
    return fail(res, 'نام خود را بنویسید تا فروشنده بتواند پاسخ دهد.');
  }

  const phone = normalizePhone(b.buyerPhone);
  if (!validPhone(phone)) {
    return fail(res, 'شماره تماس باید یازده رقم و با ۰۹ شروع شود.');
  }

  /* ---------- کالا و فروشنده ---------- */
  let product = null;
  let sellerId = b.sellerId;

  if (b.productId) {
    const { data } = await supabaseAdmin
      .from('wholesale_products')
      .select('id, seller_id, name, price, moq, tiers, status')
      .eq('id', b.productId)
      .maybeSingle();

    if (!data) return fail(res, 'این کالا دیگر در دسترس نیست.', 404);
    if (data.status !== 'active') return fail(res, 'این کالا فعلاً عرضه نمی‌شود.');

    product = data;
    sellerId = data.seller_id;
  }

  if (!sellerId) return fail(res, 'تأمین‌کننده مشخص نیست.');

  /* فروشنده باید تأییدشده و پذیرای استعلام باشد */
  const { data: sp } = await supabaseAdmin
    .from('seller_profiles')
    .select('id, user_id, shop_name, status, seller_type, accepts_rfq')
    .eq('id', sellerId)
    .maybeSingle();

  if (!sp || sp.seller_type !== 'wholesale' || sp.status !== 'approved') {
    return fail(res, 'این تأمین‌کننده در دسترس نیست.', 404);
  }
  if (sp.accepts_rfq === false) {
    return fail(res, 'این تأمین‌کننده فعلاً استعلام نمی‌پذیرد.');
  }

  /* حداقل سفارش رعایت شود */
  if (product && qty < product.moq) {
    return fail(res, `حداقل سفارش این کالا ${product.moq} عدد است.`);
  }

  /*
   * جلوگیری از استعلام تکراری: اگر همین شماره در ۱۰ دقیقه‌ی
   * گذشته برای همین کالا استعلام داده، دوباره ثبت نمی‌شود.
   * بدون این، دکمه‌ی دوبار فشرده‌شده دو استعلام می‌سازد.
   */
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: dup } = await supabaseAdmin
    .from('wholesale_rfq')
    .select('id')
    .eq('buyer_phone', phone)
    .eq('seller_id', sellerId)
    .eq('qty', qty)
    .gte('created_at', since)
    .limit(1);

  if (dup?.length) {
    return fail(res, 'همین استعلام را چند لحظه پیش فرستادید.', 409);
  }

  const row = {
    seller_id: sellerId,
    product_id: product?.id || null,
    product_name: product?.name || String(b.productName || '').slice(0, 140),

    buyer_id: user?.id || null,
    buyer_name: buyerName.slice(0, 80),
    buyer_phone: phone,
    buyer_email: String(b.buyerEmail || '').trim().slice(0, 120) || null,
    buyer_company: String(b.buyerCompany || '').trim().slice(0, 120) || null,

    qty,
    target_price: intIn(b.targetPrice, 0, 1e11) ?? 0,
    deadline: b.deadline || null,
    note: String(b.note || '').trim().slice(0, 1000),
    status: 'open',
  };

  const { data, error } = await supabaseAdmin
    .from('wholesale_rfq')
    .insert(row)
    .select()
    .single();

  if (error) return dbFail(res, error);

  /* آمار نردبان و اعلان به فروشنده */
  await countBoost(sellerId, 'rfq_count');
  await notify(
    supabaseAdmin, sp.user_id,
    'استعلام تازه',
    `${buyerName} برای ${qty} عدد «${row.product_name || 'کالا'}» استعلام فرستاد.`,
    'rfq'
  );

  /* قیمت پلکانی فعلی را هم برمی‌گردانیم تا خریدار بداند مبنا چیست */
  const hint = product ? priceFor(product, qty) : null;

  return ok(res, {
    rfq: rfqOut(data),
    currentPrice: hint ? { unit: hint.unit, total: hint.total } : null,
    message: `استعلام شما برای «${sp.shop_name}» فرستاده شد.`,
  }, 201);
}

export default withSafety(handler);
