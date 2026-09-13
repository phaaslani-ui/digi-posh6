/**
 * GET   /api/wholesale/orders/:id — جزئیات سفارش
 * PATCH /api/wholesale/orders/:id — تغییر وضعیت یا ثبت پرداخت
 *
 * body.action:
 *   status → { to: 'confirmed' | 'preparing' | ... }
 *   pay    → { amount }
 */
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/auth';
import { ok, fail, methodGuard, cors, notify, rateLimit
} from '../../../../lib/helpers';
import { dbFail } from '../../../../lib/guard';
import {
  requireWholesaleSeller, orderOut, canMoveTo, ORDER_FLOW, intIn,
} from '../../../../lib/wholesale';
import { withSafety } from '../../../../lib/safety';

const FA = {
  pending: 'در انتظار تأیید', confirmed: 'تأییدشده', preparing: 'در حال آماده‌سازی',
  shipped: 'ارسال‌شده', delivered: 'تحویل‌شده', canceled: 'لغو شد',
};

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'wo-edit', max: 60, windowMs: 60000 })) return;

  const { id } = req.query;
  const user = await requireAuth(req, res);
  if (!user) return;

  const guard = await requireWholesaleSeller(req, res, user);
  if (!guard) return;
  const { seller } = guard;

  const { data: order } = await supabaseAdmin
    .from('wholesale_orders')
    .select('*, items:wholesale_order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (!order) return fail(res, 'سفارش پیدا نشد.', 404);
  if (order.seller_id !== seller.id) return fail(res, 'این سفارش برای شما نیست.', 403);

  if (req.method === 'GET') return ok(res, { order: orderOut(order) });

  const action = String(req.body?.action || '').trim();

  /* ══════════════════ تغییر وضعیت ══════════════════ */
  if (action === 'status') {
    const to = String(req.body.to || '').trim();
    if (!FA[to]) return fail(res, 'وضعیت نامعتبر است.');

    if (order.status === 'delivered') {
      return fail(res, 'سفارش تحویل‌شده دیگر تغییر نمی‌کند.', 409);
    }
    if (order.status === 'canceled') {
      return fail(res, 'سفارش لغوشده دیگر تغییر نمی‌کند.', 409);
    }

    /*
     * پرش از مرحله ممنوع است. بدون این، سفارش می‌توانست از
     * «در انتظار» یک‌راست «تحویل‌شده» شود و مرحله‌ی کاهش
     * موجودی هرگز اجرا نشود — انبار اشتباه می‌ماند.
     */
    if (!canMoveTo(order.status, to)) {
      const i = ORDER_FLOW.indexOf(order.status);
      const next = i > -1 && i < ORDER_FLOW.length - 1 ? FA[ORDER_FLOW[i + 1]] : '—';
      return fail(res, `از «${FA[order.status]}» فقط می‌توان به «${next}» رفت.`);
    }

    /*
     * شرط `status` داخل خود دستور می‌آید تا اگر دو درخواست
     * هم‌زمان برسند، فقط یکی موفق شود.
     * کاهش موجودی را تریگر پایگاه داده انجام می‌دهد.
     */
    const { data, error } = await supabaseAdmin
      .from('wholesale_orders')
      .update({ status: to })
      .eq('id', id)
      .eq('status', order.status)
      .select('*, items:wholesale_order_items(*)')
      .maybeSingle();

    if (error) {
      /* پیام تریگر «موجودی کافی نیست» را روشن برگردان */
      if (/موجودی/.test(error.message)) return dbFail(res, error);
      return dbFail(res, error);
    }
    if (!data) return fail(res, 'وضعیت سفارش هم‌زمان تغییر کرده است.', 409);

    if (order.buyer_id) {
      await notify(
        supabaseAdmin, order.buyer_id, 'وضعیت سفارش',
        `سفارش ${order.order_number}: ${FA[to]}`, 'order'
      );
    }

    return ok(res, { order: orderOut(data), message: `سفارش ${FA[to]}.` });
  }

  /* ══════════════════ ثبت پرداخت ══════════════════ */
  if (action === 'pay') {
    const amount = intIn(req.body.amount, 1, 1e12);
    if (amount === null) return fail(res, 'مبلغ نامعتبر است.');

    const paid = Number(order.paid) || 0;
    const total = Number(order.total) || 0;
    const remaining = Math.max(0, total - paid);

    if (remaining <= 0) return fail(res, 'این سفارش کاملاً تسویه شده است.', 409);
    if (amount > remaining) {
      return fail(res, `مانده فقط ${remaining.toLocaleString('en-US')} تومان است.`);
    }

    const { data, error } = await supabaseAdmin
      .from('wholesale_orders')
      .update({ paid: paid + amount })
      .eq('id', id)
      .eq('paid', paid)              /* جلوگیری از ثبت دوباره‌ی هم‌زمان */
      .select('*, items:wholesale_order_items(*)')
      .maybeSingle();

    if (error) return dbFail(res, error);
    if (!data) return fail(res, 'پرداخت هم‌زمان دیگری ثبت شده است.', 409);

    return ok(res, {
      order: orderOut(data),
      message: data.paid >= total ? 'سفارش کاملاً تسویه شد.' : 'پرداخت ثبت شد.',
    });
  }

  return fail(res, 'عملیات نامعتبر است.');
}

export default withSafety(handler);
