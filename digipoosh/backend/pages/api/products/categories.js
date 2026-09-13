/** GET /api/products/categories — دسته‌ها و تعداد محصولات */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';

const LABELS = { women: 'لباس زنانه', men: 'لباس مردانه', kids: 'لباس بچگانه', teen: 'تینیجر' };

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const out = [];
  for (const key of Object.keys(LABELS)) {
    const { count } = await supabaseAdmin
      .from('products').select('*', { count: 'exact', head: true })
      .eq('category', key).eq('status', 'active');
    out.push({ key, label: LABELS[key], count: count || 0 });
  }
  return ok(res, { categories: out });
}

export default withSafety(handler);
