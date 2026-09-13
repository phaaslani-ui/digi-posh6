/** GET /api/notifications | PATCH خواندن همه */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'notif', max: 90, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('notifications').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50);
    if (error) return dbFail(res, error);
    return ok(res, {
      notifications: data || [],
      unread: (data || []).filter((n) => !n.is_read).length,
    });
  }

  const { id } = req.body || {};
  let q = supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', user.id);
  if (id) q = q.eq('id', id);
  const { error } = await q;
  if (error) return dbFail(res, error);
  return ok(res, { message: 'خوانده شد.' });
}

export default withSafety(handler);
