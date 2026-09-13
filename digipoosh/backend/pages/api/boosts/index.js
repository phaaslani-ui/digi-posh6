/**
 * GET  /api/boosts — بسته‌های من (فروشنده) یا همه (مدیر)
 * POST /api/boosts — خرید بسته
 *
 * ------------------------------------------------------------
 * قیمت و مدت هرگز از مرورگر پذیرفته نمی‌شود. فروشنده فقط
 * «کدام بسته و چند روز» می‌فرستد؛ قیمت از جدول `boost_plans`
 * حساب می‌شود.
 *
 * انحصاری بودن را هم تریگر پایگاه داده تضمین می‌کند، نه این
 * کد — چون دو درخواست هم‌زمان می‌توانند از بررسی کد رد شوند.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit, notify } from '../../../lib/helpers';
import { dbFail, safePage, text } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { intIn } from '../../../lib/wholesale';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  if (req.method === 'POST' &&
      rateLimit(req, res, { key: 'boost-buy', max: 10, windowMs: 60000 })) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { data: sp } = await supabaseAdmin
    .from('seller_profiles')
    .select('id, user_id, shop_name, status')
    .eq('user_id', user.id)
    .maybeSingle();

  /* ══════════════════ فهرست ══════════════════ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = safePage(req.query);
    const isAdmin = user.role === 'admin';

    if (!sp && !isAdmin) return fail(res, 'این بخش برای فروشندگان است.', 403);

    let q = supabaseAdmin
      .from('boosts')
      .select('*, plan_info:boost_plans(fa, badge_kind, badge_fa, color, can_rank, can_badge, on_home, cross_page, is_spotlight)',
              { count: 'exact' })
      .order('ends_at', { ascending: false })
      .range(from, to);

    if (!isAdmin) q = q.eq('seller_id', sp.id);
    if (req.query.status) q = q.eq('status', text(req.query.status, 20));

    const { data, error, count } = await q;
    if (error) return dbFail(res, error);

    /* توانایی‌های فعال — از نمای آماده */
    let perks = null;
    if (sp) {
      const { data: pk } = await supabaseAdmin
        .from('seller_boost_perks')
        .select('*')
        .eq('seller_id', sp.id)
        .maybeSingle();
      perks = pk || null;
    }

    return ok(res, {
      boosts: (data || []).map(shape),
      perks: perks ? {
        rank:      !!perks.can_rank,
        badge:     !!perks.can_badge,
        home:      !!perks.on_home,
        crossPage: !!perks.cross_page,
        spotlight: !!perks.is_spotlight,
        rankWeight: perks.rank_weight || 0,
        badgeKind: perks.badge_kind,
        badgeFa: perks.badge_fa,
        expiresAt: perks.expires_at,
      } : {
        rank: false, badge: false, home: false,
        crossPage: false, spotlight: false, rankWeight: 0,
      },
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  }

  /* ══════════════════ خرید ══════════════════ */
  if (!sp) return fail(res, 'این بخش برای فروشندگان است.', 403);
  if (sp.status !== 'approved') {
    return fail(res, 'تا تأیید فروشگاه، خرید بسته ممکن نیست.', 403);
  }

  const planId = text(req.body?.plan, 30);
  if (!planId) return fail(res, 'بسته را انتخاب کنید.');

  const { data: plan } = await supabaseAdmin
    .from('boost_plans')
    .select('*')
    .eq('id', planId)
    .eq('is_active', true)
    .maybeSingle();

  if (!plan) return fail(res, 'این بسته در دسترس نیست.', 404);

  /* مدت باید یکی از گزینه‌های همان بسته باشد */
  const days = intIn(req.body?.days, 1, 365);
  const allowed = plan.allowed_days || [];
  if (days === null || !allowed.includes(days)) {
    return fail(res, `مدت این بسته باید یکی از ${allowed.join('، ')} روز باشد.`);
  }

  /* همین بسته از قبل فعال نباشد */
  const { data: dup } = await supabaseAdmin
    .from('boosts')
    .select('id, ends_at')
    .eq('seller_id', sp.id)
    .eq('plan', planId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .maybeSingle();

  if (dup) {
    return fail(res, 'این بسته هم‌اکنون برای شما فعال است.', 409);
  }

  const price = (Number(plan.price_per_day) || 0) * days;
  const endsAt = new Date(Date.now() + days * 86400000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('boosts')
    .insert({
      seller_id: sp.id,
      plan: planId,
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      price,
      status: 'active',
      /* وزن را تریگر از روی بسته پر می‌کند */
    })
    .select('*, plan_info:boost_plans(fa, badge_kind, badge_fa, color)')
    .single();

  /* تریگر انحصاری بودن پیام فارسی می‌دهد */
  if (error) return dbFail(res, error, 'فعال‌سازی بسته ممکن نشد.');

  await notify(
    supabaseAdmin, user.id, 'بسته فعال شد',
    `«${plan.fa}» برای ${days} روز فعال شد.`, 'seller'
  );

  return ok(res, {
    boost: shape(data),
    message: `«${plan.fa}» فعال شد و تا ${days} روز آینده اجرا می‌شود.`,
  }, 201);
}

/** شکل یکدست برای فرانت‌اند */
function shape(b) {
  if (!b) return null;
  const p = b.plan_info || {};
  return {
    id: b.id,
    sellerId: b.seller_id,
    plan: b.plan,
    planFa: p.fa || b.plan,
    perks: {
      rank:      !!p.can_rank,
      badge:     !!p.can_badge,
      home:      !!p.on_home,
      crossPage: !!p.cross_page,
      spotlight: !!p.is_spotlight,
    },
    badgeKind: p.badge_kind || null,
    badgeFa: p.badge_fa || null,
    color: p.color || null,
    weight: b.weight,
    startsAt: b.starts_at,
    endsAt: b.ends_at,
    price: Number(b.price) || 0,
    status: b.status,
    views: b.views || 0,
    clicks: b.clicks || 0,
  };
}

export default withSafety(handler);
