/**
 * GET   /api/wholesale/rfq/:id — یک استعلام
 * PATCH /api/wholesale/rfq/:id — پاسخ، رد، یا تبدیل به سفارش
 *
 * body.action:
 *   answer  → { unitPrice, leadTime, validDays, note }
 *   reject  → { reason }
 *   convert → تبدیل استعلام پذیرفته‌شده به سفارش
 */
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/auth';
import { ok, fail, methodGuard, cors, notify, rateLimit
} from '../../../../lib/helpers';
import { dbFail } from '../../../../lib/guard';
import { requireWholesaleSeller, rfqOut, orderOut, intIn } from '../../../../lib/wholesale';
import { withSafety } from '../../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'rfq-ans', max: 40, windowMs: 60000 })) return;

  const { id } = req.query;
  const user = await requireAuth(req, res);
  if (!user) return;

  const guard = await requireWholesaleSeller(req, res, user);
  if (!guard) return;
  const { seller } = guard;

  const { data: rfq } = await supabaseAdmin
    .from('wholesale_rfq')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!rfq) return fail(res, 'استعلام پیدا نشد.', 404);
  if (rfq.seller_id !== seller.id) return fail(res, 'این استعلام برای شما نیست.', 403);

  if (req.method === 'GET') return ok(res, { rfq: rfqOut(rfq) });

  const action = String(req.body?.action || '').trim();

  /* ══════════════════ پاسخ فروشنده ══════════════════ */
  if (action === 'answer') {
    if (rfq.status !== 'open') {
      return fail(res, 'به این استعلام قبلاً پاسخ داده‌اید.', 409);
    }

    const unit = intIn(req.body.unitPrice, 1, 1e11);
    if (unit === null) return fail(res, 'قیمت پیشنهادی نامعتبر است.');

    const { data, error } = await supabaseAdmin
      .from('wholesale_rfq')
      .update({
        status: 'answered',
        offer_price: unit,
        offer_lead_time: intIn(req.body.leadTime, 0, 365) ?? 0,
        offer_valid_days: intIn(req.body.validDays, 1, 90) ?? 7,
        offer_note: String(req.body.note || '').trim().slice(0, 800),
        offered_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'open')          /* جلوگیری از پاسخ دوباره‌ی هم‌زمان */
      .select()
      .maybeSingle();

    if (error) return dbFail(res, error);
    if (!data) return fail(res, 'وضعیت استعلام تغییر کرده است.', 409);

    if (rfq.buyer_id) {
      await notify(
        supabaseAdmin, rfq.buyer_id, 'پاسخ استعلام',
        `${seller.shop_name} برای ${rfq.qty} عدد قیمت داد.`, 'rfq'
      );
    }

    return ok(res, { rfq: rfqOut(data), message: 'پاسخ شما ثبت شد.' });
  }

  /* ══════════════════ رد استعلام ══════════════════ */
  if (action === 'reject') {
    const reason = String(req.body.reason || '').trim();
    if (reason.length < 4) return fail(res, 'دلیل رد را بنویسید.');

    const { data, error } = await supabaseAdmin
      .from('wholesale_rfq')
      .update({ status: 'rejected', reject_reason: reason.slice(0, 500) })
      .eq('id', id)
      .in('status', ['open', 'answered'])
      .select()
      .maybeSingle();

    if (error) return dbFail(res, error);
    if (!data) return fail(res, 'این استعلام قابل رد نیست.', 409);

    return ok(res, { rfq: rfqOut(data), message: 'استعلام رد شد.' });
  }

  /* ══════════════════ تبدیل به سفارش ══════════════════ */
  if (action === 'convert') {
    if (rfq.status !== 'answered') {
      return fail(res, 'ابتدا باید به استعلام پاسخ دهید.');
    }
    if (rfq.order_id) return fail(res, 'این استعلام قبلاً به سفارش تبدیل شده.', 409);

    const unit = Number(rfq.offer_price) || 0;
    const total = unit * rfq.qty;

    const { data: num } = await supabaseAdmin.rpc('gen_wholesale_order_number');

    const { data: order, error: oErr } = await supabaseAdmin
      .from('wholesale_orders')
      .insert({
        order_number: num || `WO-${Date.now()}`,
        seller_id: seller.id,
        buyer_id: rfq.buyer_id,
        buyer_name: rfq.buyer_name,
        buyer_phone: rfq.buyer_phone,
        buyer_company: rfq.buyer_company,
        item_count: rfq.qty,
        total,
        status: 'pending',
        note: `از استعلام ${rfq.id}`,
        from_rfq: rfq.id,
      })
      .select()
      .single();

    if (oErr) return dbFail(res, oErr);

    const { error: iErr } = await supabaseAdmin
      .from('wholesale_order_items')
      .insert({
        order_id: order.id,
        product_id: rfq.product_id,
        name: rfq.product_name || 'کالا',
        qty: rfq.qty,
        unit_price: unit,
        line_total: total,
      });

    if (iErr) {
      /* اگر ردیف‌ها ثبت نشد، سفارش نیم‌بند نماند */
      await supabaseAdmin.from('wholesale_orders').delete().eq('id', order.id);
      return dbFail(res, iErr);
    }

    await supabaseAdmin
      .from('wholesale_rfq')
      .update({ status: 'accepted', order_id: order.id })
      .eq('id', id);

    return ok(res, {
      order: orderOut({ ...order, items: [] }),
      message: `سفارش ${order.order_number} ساخته شد.`,
    }, 201);
  }

  return fail(res, 'عملیات نامعتبر است.');
}

export default withSafety(handler);
