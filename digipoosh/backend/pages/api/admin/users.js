/** GET /api/admin/users | PATCH — تغییر نقش یا فعال/غیرفعال */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, required, paginate, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'adm-usr', max: 60, windowMs: 60000 })) return;

  const admin = await requireRole(req, res, ['admin']);
  if (!admin) return;

  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);
    let q = supabaseAdmin.from('users').select('*', { count: 'exact' });
    if (req.query.role) q = q.eq('role', req.query.role);
    if (req.query.search)
      q = q.or(`full_name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);

    const { data, error, count } = await q
      .order('created_at', { ascending: false }).range(from, to);
    if (error) return dbFail(res, error);

    return ok(res, {
      users: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  const { user_id, role, is_active } = req.body || {};
  const missing = required(req.body || {}, ['user_id']);
  if (missing) return fail(res, missing);
  if (user_id === admin.id && (role || is_active === false))
    return fail(res, 'نمی‌توانید نقش یا وضعیت خودتان را تغییر دهید.');

  const patch = {};
  if (role) {
    if (!['customer', 'seller', 'admin'].includes(role)) return fail(res, 'نقش نامعتبر است.');
    patch.role = role;
  }
  if (is_active !== undefined) patch.is_active = !!is_active;
  if (!Object.keys(patch).length) return fail(res, 'داده‌ای ارسال نشده.');

  const { data, error } = await supabaseAdmin
    .from('users').update(patch).eq('id', user_id).select().single();
  if (error) return dbFail(res, error);

  return ok(res, { message: 'کاربر به‌روز شد.', user: data });
}

export default withSafety(handler);
