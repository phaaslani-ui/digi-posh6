/**
 * GET  /api/seller/payouts — موجودی و تاریخچه‌ی تسویه
 * POST /api/seller/payouts — درخواست برداشت
 *
 * ------------------------------------------------------------
 * موجودی از نمای `seller_balance` می‌آید که سه جدول را با هم
 * جمع می‌زند. سقف برداشت را تریگر پایگاه داده هم بررسی
 * می‌کند — پس حتی اگر دو درخواست هم‌زمان برسند، بیش از
 * موجودی برداشت نمی‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit, notify, notifyAll} from '../../../lib/helpers';
import { dbFail, text, safePage } from '../../../lib/guard';
import { intIn } from '../../../lib/wholesale';
import { withSafety } from '../../../lib/safety';

/** کمترین مبلغ قابل برداشت — زیر این، کارمزد بانکی صرف نمی‌کند */
const MIN_PAYOUT = 500000;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  if (req.method === 'POST' &&
      rateLimit(req, res, { key: 'payout', max: 5, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { data: sp } = await supabaseAdmin
    .from('seller_profiles')
    .select('id, shop_name, shaba_number, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!sp) return fail(res, 'این بخش برای فروشندگان است.', 403);

  /* موجودی — از نمای آماده */
  const { data: bal } = await supabaseAdmin
    .from('seller_balance')
    .select('*')
    .eq('seller_id', sp.id)
    .maybeSingle();

  const balance = {
    earned:    Number(bal?.earned) || 0,
    withdrawn: Number(bal?.withdrawn) || 0,
    pending:   Number(bal?.pending_withdraw) || 0,
    available: Number(bal?.available) || 0,
  };

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = safePage(req.query);

    const { data, error, count } = await supabaseAdmin
      .from('payouts')
      .select('*', { count: 'exact' })
      .eq('seller_id', sp.id)
      .order('requested_at', { ascending: false })
      .range(from, to);

    if (error) return dbFail(res, error);

    return ok(res, {
      balance,
      minPayout: MIN_PAYOUT,
      canRequest: balance.available >= MIN_PAYOUT && sp.status === 'approved',
      payouts: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ══════════════════ درخواست برداشت ══════════════════ */
  if (sp.status !== 'approved') {
    return fail(res, 'تا تأیید فروشگاه، برداشت ممکن نیست.', 403);
  }

  const amount = intIn(req.body?.amount, 1, 1e12);
  if (amount === null) return fail(res, 'مبلغ نامعتبر است.');

  if (amount < MIN_PAYOUT) {
    return fail(res, `کمترین مبلغ برداشت ${MIN_PAYOUT.toLocaleString('en-US')} تومان است.`);
  }
  if (amount > balance.available) {
    return fail(res,
      `موجودی قابل برداشت شما ${balance.available.toLocaleString('en-US')} تومان است.`);
  }

  /* شبا: یا از پروفایل، یا آنچه همین حالا فرستاده */
  const shaba = text(req.body?.shaba, 30) || sp.shaba_number || '';
  const digits = shaba.replace(/\D/g, '');
  if (digits.length !== 24) {
    return fail(res, 'شماره شبا باید ۲۴ رقم باشد (بدون IR).');
  }

  /* درخواست باز تکراری نباشد */
  const { count: openCount } = await supabaseAdmin
    .from('payouts')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', sp.id)
    .in('status', ['pending', 'processing']);

  if ((openCount || 0) >= 2) {
    return fail(res, 'دو درخواست برداشت در جریان دارید. تا تسویه‌ی آن‌ها صبر کنید.');
  }

  const { data, error } = await supabaseAdmin
    .from('payouts')
    .insert({
      seller_id: sp.id,
      amount,
      shaba: digits,
      status: 'pending',
    })
    .select()
    .single();

  /* تریگر پایگاه داده پیام فارسی می‌دهد اگر موجودی کم باشد */
  if (error) return dbFail(res, error, 'ثبت درخواست برداشت ممکن نشد.');

  /* آگاه کردن مدیران */
  const { data: admins } = await supabaseAdmin
    .from('users').select('id').eq('role', 'admin');

  await notifyAll(supabaseAdmin, (admins || []).map((a) => a.id),
    'درخواست برداشت',
    `${sp.shop_name} درخواست ${amount.toLocaleString('en-US')} تومان داد.`, 'admin');

  return ok(res, {
    payout: data,
    balance: { ...balance, available: balance.available - amount, pending: balance.pending + amount },
    message: 'درخواست برداشت ثبت شد. پس از بررسی واریز می‌شود.',
  }, 201);
}

export default withSafety(handler);
