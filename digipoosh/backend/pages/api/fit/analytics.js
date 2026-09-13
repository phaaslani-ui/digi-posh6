/**
 * GET /api/fit/analytics — آمار سایز برای فروشنده
 * ------------------------------------------------------------
 * می‌گوید کدام سایز بیشتر فروخته و کدام بیشتر مرجوع شده.
 * مرجوعی بالا معمولاً یعنی جدول اندازه‌ی آن سایز غلط است.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { requireApprovedSeller } from '../../../lib/auth';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['GET'])) return;

  const seller = await requireApprovedSeller(req, res);
  if (!seller) return;

  const { data, error } = await supabaseAdmin
    .rpc('size_health', { p_seller: seller.id });

  if (error) return dbFail(res, error, 'خواندن آمار انجام نشد.');

  const rows = data || [];

  /* ---------- خلاصه ---------- */
  const bySize = {};
  for (const r of rows) {
    if (!bySize[r.size_label]) bySize[r.size_label] = { orders: 0, returns: 0 };
    bySize[r.size_label].orders += Number(r.orders) || 0;
    bySize[r.size_label].returns += Math.round(
      (Number(r.orders) || 0) * (Number(r.return_rate) || 0) / 100);
  }

  const summary = Object.keys(bySize).map((k) => ({
    label: k,
    orders: bySize[k].orders,
    returns: bySize[k].returns,
    rate: bySize[k].orders
      ? Math.round(bySize[k].returns / bySize[k].orders * 1000) / 10
      : 0,
  })).sort((a, b) => b.orders - a.orders);

  const problem = rows.filter((r) =>
    Number(r.orders) >= 3 && Number(r.return_rate) >= 25);

  return ok(res, {
    rows,
    summary,
    popular: summary[0] || null,
    problems: problem,
    advice: problem.length
      ? `${problem.length} سایز مرجوعی بالا دارد — جدول اندازه‌شان را بازبینی کنید.`
      : 'وضعیت سایزها سالم است.',
  });
}

export default withSafety(handler);
