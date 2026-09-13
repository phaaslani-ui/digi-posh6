/** GET /api/seller/profile | PATCH ویرایش */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireRole } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit
} from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;

  /* نرخ‌بند — جلوی سیل درخواست و سوءاستفاده را می‌گیرد */
  if (req.method !== 'GET' && rateLimit(req, res, { key: 'sp-prof', max: 20, windowMs: 60000 })) return;

  const user = await requireRole(req, res, ['seller', 'admin']);
  if (!user) return;

  const { data: seller } = await supabaseAdmin
    .from('seller_profiles').select('*').eq('user_id', user.id).single();
  if (!seller) return fail(res, 'پروفایل فروشندگی یافت نشد.', 404);

  if (req.method === 'GET') return ok(res, { seller });

  const allowed = ['shop_name', 'description', 'logo_url', 'cover_url', 'city',
                   'address', 'category', 'shaba_number', 'national_id'];
  const patch = {};
  for (const k of allowed) if (req.body?.[k] !== undefined) patch[k] = req.body[k];
  if (!Object.keys(patch).length) return fail(res, 'داده‌ای ارسال نشده.');

  const { data, error } = await supabaseAdmin
    .from('seller_profiles').update(patch).eq('id', seller.id).select().single();
  if (error) return dbFail(res, error);

  return ok(res, { message: 'اطلاعات فروشگاه به‌روز شد.', seller: data });
}

export default withSafety(handler);
