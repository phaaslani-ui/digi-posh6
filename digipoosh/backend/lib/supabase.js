/**
 * دیجی‌پوش — Supabase clients
 * دو نوع کلاینت: عمومی (با کلید anon) و سرویس (با کلید سرویس، فقط سمت سرور)
 */
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON) {
  console.warn('[دیجی‌پوش] متغیرهای NEXT_PUBLIC_SUPABASE_URL / ANON_KEY تنظیم نشده‌اند.');
}

/** کلاینت عمومی — محدود به قوانین RLS */
export const supabasePublic = createClient(URL, ANON, {
  auth: { persistSession: false },
});

/** کلاینت ادمین — RLS را دور می‌زند. فقط داخل API استفاده شود. */
export const supabaseAdmin = SERVICE
  ? createClient(URL, SERVICE, { auth: { persistSession: false } })
  : null;

/** کلاینتی که به‌جای کاربر عمل می‌کند (توکن او را حمل می‌کند) */
export function supabaseAsUser(accessToken) {
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}
