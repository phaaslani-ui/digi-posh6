/**
 * GET /api/boosts/plans — فهرست بسته‌های نردبان
 *
 * ------------------------------------------------------------
 * مرجع واحد قیمت و توانایی‌ها. مرورگر هرگز نباید این‌ها را
 * از خودش بسازد؛ فقط نمایش می‌دهد.
 *
 * با `?days=7` قیمت هر بسته برای همان مدت هم برمی‌گردد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { intIn } from '../../../lib/wholesale';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const { data, error } = await supabaseAdmin
    .from('boost_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return dbFail(res, error, 'فهرست بسته‌ها در دسترس نیست.');

  /* کدام بسته‌های انحصاری هم‌اکنون گرفته شده‌اند؟ */
  const { data: busy } = await supabaseAdmin
    .from('boosts')
    .select('plan, ends_at, seller_id')
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString());

  const taken = {};
  for (const b of busy || []) {
    if (!taken[b.plan] || b.ends_at > taken[b.plan].ends_at) taken[b.plan] = b;
  }

  const days = intIn(req.query.days, 1, 365);

  const plans = (data || []).map((p) => {
    const occupied = p.is_exclusive ? taken[p.id] : null;

    return {
      id: p.id,
      fa: p.fa,
      description: p.description || '',
      note: p.note || '',

      /* توانایی‌ها — همان چیزی که بسته «می‌کند» */
      perks: {
        rank:      p.can_rank,
        badge:     p.can_badge,
        home:      p.on_home,
        crossPage: p.cross_page,
        spotlight: p.is_spotlight,
      },

      /* فهرست خوانا برای نمایش در کارت بسته */
      perkList: [
        p.can_rank     && 'بالا رفتن در فهرست بخش',
        p.can_badge    && `نشان «${p.badge_fa || 'ویژه'}» روی کارت`,
        p.on_home      && 'حضور در ویترین صفحه‌ی اصلی',
        p.cross_page   && 'دیده شدن در همه‌ی بخش‌ها',
        p.is_spotlight && 'قاب اختصاصی در حساب کاربری مشتری‌ها',
      ].filter(Boolean),

      badgeKind: p.badge_kind,
      badgeFa: p.badge_fa,
      weight: p.weight,
      color: p.color,

      pricePerDay: Number(p.price_per_day) || 0,
      allowedDays: p.allowed_days || [7, 14, 30],
      priceFor: days ? (Number(p.price_per_day) || 0) * days : null,

      isExclusive: p.is_exclusive,
      isBundle: p.is_bundle,

      /* اگر انحصاری و گرفته‌شده — کِی آزاد می‌شود */
      available: !occupied,
      freeAt: occupied ? occupied.ends_at : null,
    };
  });

  return ok(res, { plans });
}

export default withSafety(handler);
