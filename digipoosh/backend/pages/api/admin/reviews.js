/** GET /api/admin/reviews | PATCH — تأیید/رد نظر */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH', 'DELETE'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'adm-rev', max: 60, windowMs: 60000 })) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  if (req.method === 'GET') {
    let q = supabaseAdmin
      .from('reviews')
      .select('*, user:users(full_name, email), product:products(title, slug)')
      .order('created_at', { ascending: false });
    if (req.query.approved !== undefined)
      q = q.eq('is_approved', req.query.approved === 'true');

    const { data, error } = await q;
    if (error) return dbFail(res, error);
    return ok(res, { reviews: data || [] });
  }

  const { review_id } = req.body || {};
  const missing = required(req.body || {}, ['review_id']);
  if (missing) return fail(res, missing);

  if (req.method === 'DELETE') {
    await supabaseAdmin.from('reviews').delete().eq('id', review_id);
    return ok(res, { message: 'نظر حذف شد.' });
  }

  const { data, error } = await supabaseAdmin
    .from('reviews').update({ is_approved: !!req.body.is_approved })
    .eq('id', review_id).select().single();
  if (error) return dbFail(res, error);

  return ok(res, { message: 'وضعیت نظر به‌روز شد.', review: data });
}

export default withSafety(handler);
