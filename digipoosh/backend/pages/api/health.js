/** GET /api/health — بررسی سلامت سرویس و اتصال دیتابیس */
import { supabaseAdmin } from '../../lib/supabase';
import { ok, fail, cors } from '../../lib/helpers';
import { withSafety } from '../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;

  const env = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!supabaseAdmin)
    return fail(res, 'کلید سرویس Supabase تنظیم نشده است.', 500, { env });

  const { error } = await supabaseAdmin.from('users').select('id', { head: true, count: 'exact' });
  if (error) {
    /* جزئیات فقط در لاگ سرور — پیام خام پایگاه داده به بیرون نمی‌رود */
    console.error('[health]', error.code, error.message);
    return fail(res, 'اتصال به پایگاه داده برقرار نشد.', 503, { env });
  }

  return ok(res, {
    message: 'سرویس سالم است.',
    env,
    commission_rate: Number(process.env.COMMISSION_RATE || 10),
    time: new Date().toISOString(),
  });
}

export default withSafety(handler);
