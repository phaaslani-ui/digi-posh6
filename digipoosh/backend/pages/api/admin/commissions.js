/** GET /api/admin/commissions | PATCH — تسویه */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, paginate, notify, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'adm-com', max: 60, windowMs: 60000 })) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);
    let q = supabaseAdmin
      .from('commissions')
      .select('*, seller:seller_profiles(shop_name, shaba_number, user_id), order:orders(order_number)', { count: 'exact' });
    if (req.query.status) q = q.eq('status', req.query.status);
    if (req.query.seller_id) q = q.eq('seller_id', req.query.seller_id);

    const { data, error, count } = await q
      .order('created_at', { ascending: false }).range(from, to);
    if (error) return dbFail(res, error);

    const totals = (data || []).reduce((acc, r) => {
      acc.gross += r.gross_amount; acc.platform += r.amount; acc.payout += r.seller_payout;
      return acc;
    }, { gross: 0, platform: 0, payout: 0 });

    return ok(res, {
      commissions: data || [], totals,
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  const { commission_ids, seller_id, status = 'settled' } = req.body || {};
  if (!commission_ids?.length && !seller_id)
    return fail(res, 'شناسه‌ی کمیسیون یا فروشنده لازم است.');

  let q = supabaseAdmin.from('commissions')
    .update({ status, settled_at: status === 'settled' ? new Date().toISOString() : null });
  if (commission_ids?.length) q = q.in('id', commission_ids);
  else q = q.eq('seller_id', seller_id).eq('status', 'pending');

  const { data, error } = await q.select();
  if (error) return dbFail(res, error);

  if (status === 'settled' && seller_id) {
    const { data: s } = await supabaseAdmin
      .from('seller_profiles').select('user_id, shop_name').eq('id', seller_id).single();
    const sum = (data || []).reduce((t, r) => t + r.seller_payout, 0);
    if (s) await notify(supabaseAdmin, s.user_id, 'تسویه انجام شد',
      `مبلغ ${sum.toLocaleString('fa-IR')} ریال برای «${s.shop_name}» تسویه شد.`, 'seller');
  }

  return ok(res, { message: `${(data || []).length} رکورد به‌روز شد.`, commissions: data });
}

export default withSafety(handler);
