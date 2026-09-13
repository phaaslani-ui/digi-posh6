/**
 * GET   /api/returns — مرجوعی‌های من (خریدار یا فروشنده)
 * POST  /api/returns — ثبت درخواست مرجوعی (خریدار)
 * PATCH /api/returns — تأیید/رد/بازپرداخت (فروشنده)
 *
 * ------------------------------------------------------------
 * قاعده‌ی مهلت: مرجوعی فقط تا هفت روز پس از تحویل پذیرفته
 * می‌شود. این را در سرور می‌سنجیم، نه در مرورگر — وگرنه
 * می‌شد با دستکاری تاریخ، سفارش شش‌ماهه را مرجوع کرد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit, notify } from '../../../lib/helpers';
import { dbFail, multiline, safePage } from '../../../lib/guard';
import { wholesaleSeller } from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

const RETURN_DAYS = 7;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH'])) return;
  if (req.method !== 'GET' &&
      rateLimit(req, res, { key: 'return', max: 20, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  /* پروفایل فروشنده‌ی خرده‌فروشی (اگر باشد) */
  const { data: sp } = await supabaseAdmin
    .from('seller_profiles')
    .select('id, user_id, shop_name')
    .eq('user_id', user.id)
    .maybeSingle();

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = safePage(req.query);
    const { status } = req.query;

    let q = supabaseAdmin
      .from('returns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    /* فروشنده مرجوعی‌های خودش را می‌بیند، خریدار مال خودش را */
    q = sp ? q.eq('seller_id', sp.id) : q.eq('user_id', user.id);
    if (status) q = q.eq('status', status);

    const { data, error, count } = await q;
    if (error) return dbFail(res, error);

    return ok(res, {
      returns: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ══════════════════ ثبت درخواست (خریدار) ══════════════════ */
  if (req.method === 'POST') {
    const b = req.body || {};

    const reason = multiline(b.reason, 800);
    if (reason.length < 10) return fail(res, 'دلیل مرجوعی را کامل‌تر بنویسید.');

    if (!b.orderItemId) return fail(res, 'قلم سفارش مشخص نیست.');

    /* قلم سفارش را با خود سفارش می‌خوانیم تا مالکیت و وضعیت را بسنجیم */
    const { data: item } = await supabaseAdmin
      .from('order_items')
      .select('*, order:orders!inner(id, user_id, status, created_at)')
      .eq('id', b.orderItemId)
      .maybeSingle();

    if (!item) return fail(res, 'این قلم سفارش پیدا نشد.', 404);
    if (item.order.user_id !== user.id) {
      return fail(res, 'این سفارش متعلق به شما نیست.', 403);
    }
    if (item.order.status !== 'delivered') {
      return fail(res, 'فقط سفارش تحویل‌شده مرجوع می‌شود.');
    }

    /* مهلت هفت‌روزه */
    const days = (Date.now() - new Date(item.order.created_at).getTime()) / 86400000;
    if (days > RETURN_DAYS) {
      return fail(res, `مهلت مرجوعی ${RETURN_DAYS} روز است و گذشته است.`);
    }

    /* تعداد مرجوعی نباید از تعداد خریداری‌شده بیشتر باشد */
    const qty = Math.max(1, Math.min(Number(b.qty) || item.quantity, item.quantity));

    const { data, error } = await supabaseAdmin
      .from('returns')
      .insert({
        order_id: item.order.id,
        order_item_id: item.id,
        product_id: item.product_id,
        seller_id: item.seller_id,
        user_id: user.id,
        product_name: item.product_title,
        qty,
        amount: (Number(item.unit_price) || 0) * qty,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      /* نمایه‌ی یکتا جلوی درخواست دوباره را می‌گیرد */
      if (error.code === '23505') {
        return fail(res, 'برای این کالا قبلاً درخواست مرجوعی ثبت شده است.', 409);
      }
      return dbFail(res, error);
    }

    /* آگاه کردن فروشنده */
    const { data: seller } = await supabaseAdmin
      .from('seller_profiles').select('user_id').eq('id', item.seller_id).maybeSingle();

    if (seller?.user_id) {
      await notify(supabaseAdmin, seller.user_id, 'درخواست مرجوعی',
        `برای «${item.product_title}» درخواست مرجوعی ثبت شد.`, 'order');
    }

    return ok(res, { return: data, message: 'درخواست شما ثبت شد.' }, 201);
  }

  /* ══════════════════ پاسخ فروشنده ══════════════════ */
  if (!sp) return fail(res, 'این بخش برای فروشندگان است.', 403);

  const { id, action } = req.body || {};
  if (!id) return fail(res, 'شناسه‌ی درخواست لازم است.');

  const NEXT = {
    approve: 'approved',
    reject:  'rejected',
    refund:  'refunded',
  };
  const to = NEXT[action];
  if (!to) return fail(res, 'عملیات نامعتبر است.');

  const { data: rec } = await supabaseAdmin
    .from('returns').select('*').eq('id', id).maybeSingle();

  if (!rec) return fail(res, 'درخواست پیدا نشد.', 404);
  if (rec.seller_id !== sp.id) return fail(res, 'این درخواست برای شما نیست.', 403);

  /* بازپرداخت فقط پس از تأیید معنا دارد */
  if (to === 'refunded' && rec.status !== 'approved') {
    return fail(res, 'ابتدا باید درخواست را تأیید کنید.');
  }
  if (rec.status === 'refunded') {
    return fail(res, 'این مرجوعی تسویه شده است.', 409);
  }
  if (rec.status === 'rejected') {
    return fail(res, 'این درخواست قبلاً رد شده است.', 409);
  }

  const patch = {
    status: to,
    handled_at: new Date().toISOString(),
    seller_note: multiline(req.body.note, 500) || rec.seller_note,
  };

  if (to === 'rejected' && !patch.seller_note) {
    return fail(res, 'برای رد درخواست، دلیل بنویسید.');
  }

  const { data, error } = await supabaseAdmin
    .from('returns')
    .update(patch)
    .eq('id', id)
    .eq('status', rec.status)     /* جلوگیری از پاسخ هم‌زمان */
    .select()
    .maybeSingle();

  if (error) return dbFail(res, error);
  if (!data) return fail(res, 'وضعیت درخواست هم‌زمان تغییر کرده است.', 409);

  const FA = { approved: 'تأیید شد', rejected: 'رد شد', refunded: 'بازپرداخت شد' };
  await notify(supabaseAdmin, rec.user_id, 'وضعیت مرجوعی',
    `درخواست مرجوعی «${rec.product_name}» ${FA[to]}.`, 'order');

  return ok(res, { return: data, message: `درخواست ${FA[to]}.` });
}

export default withSafety(handler);
