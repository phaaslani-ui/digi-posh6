/**
 * POST /api/ai/generate — ساخت ست
 * ------------------------------------------------------------
 * بدنه:
 * {
 *   heroId: uuid,
 *   preferences: { occasion, style, palette, budget, season, count }
 * }
 *
 * خروجی: سه نسخه‌ی ست با تفکیک معیارها.
 *
 * نکته: نمره‌دهی دقیق رنگ در مرورگر انجام می‌شود چون دانشنامه
 * (۱۱۶ رنگ، ۵۲ طرح) آنجاست. سرور نامزدهای مناسب را فیلتر و
 * پیش‌امتیاز می‌دهد تا حجم داده‌ی ارسالی کم بماند.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { getUser } from '../../../lib/auth';
import {
  isUuid, normalizeWeights, OCCASION_FORMAL, DEFAULT_WEIGHTS,
} from '../../../lib/digiai';

const FIELDS = 'id,name,price,images,colors,sizes,stock,category,section,'
  + 'group_key,style_key,fabric_key,pattern_key,season_key,fit_key,seller_id,status';

/* بودجه به سقف قیمت */
const BUDGET_CAP = {
  low: 1500000, medium: 5000000, high: 15000000,
  luxury: Number.MAX_SAFE_INTEGER, any: Number.MAX_SAFE_INTEGER,
};

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['POST'])) return;

  const b = req.body || {};
  if (!isUuid(b.heroId)) return fail(res, 'شناسه‌ی کالای اصلی نامعتبر است.', 400);

  const pref = b.preferences || {};
  const count = Math.max(3, Math.min(6, Number(pref.count) || 4));
  const cap = BUDGET_CAP[pref.budget] ?? BUDGET_CAP.any;

  /* ---------- کالای پایه ---------- */
  const { data: hero, error: hErr } = await supabaseAdmin
    .from('products').select(FIELDS).eq('id', b.heroId).maybeSingle();

  if (hErr) return dbFail(res, hErr, 'خواندن کالا انجام نشد.');
  if (!hero || hero.status !== 'active') return fail(res, 'کالا پیدا نشد.', 404);

  /* ---------- نامزدها ----------
     فقط کالای موجود از فروشنده‌ی سالم. */
  let q = supabaseAdmin
    .from('products')
    .select(FIELDS)
    .eq('status', 'active')
    .gt('stock', 0)
    .neq('id', hero.id)
    .limit(400);

  if (cap < Number.MAX_SAFE_INTEGER) q = q.lte('price', cap * 1.4);
  if (pref.season && pref.season !== 'all') {
    q = q.in('season_key', [pref.season, 'all']);
  }

  const { data: pool, error: pErr } = await q;
  if (pErr) return dbFail(res, pErr, 'خواندن کالاها انجام نشد.');

  /* ---------- وزن‌های یادگرفته ---------- */
  const { data: wrow } = await supabaseAdmin
    .from('ai_weights').select('weights,episodes').eq('scope', 'global').maybeSingle();

  const weights = normalizeWeights(wrow?.weights || DEFAULT_WEIGHTS);

  /* ---------- سلیقه‌ی شخصی ---------- */
  const user = await getUser(req).catch(() => null);
  let profile = null;
  if (user) {
    const { data } = await supabaseAdmin
      .from('style_profiles').select('*').eq('user_id', user.id).maybeSingle();
    profile = data || null;
  }

  /* ---------- نمره‌ی هم‌نشینی یادگرفته ---------- */
  const ids = (pool || []).map((p) => p.id);
  const compat = {};

  if (ids.length) {
    const { data: cs } = await supabaseAdmin
      .from('compatibility_scores')
      .select('product_a,product_b,score')
      .or(`product_a.eq.${hero.id},product_b.eq.${hero.id}`)
      .gt('score', 0)
      .limit(500);

    for (const row of cs || []) {
      const other = row.product_a === hero.id ? row.product_b : row.product_a;
      compat[other] = Number(row.score) || 0;
    }
  }

  /* ---------- پیش‌امتیاز سمت سرور ----------
     نمره‌ی رنگ دقیق در مرورگر حساب می‌شود؛ اینجا فقط
     معیارهایی که به دانشنامه نیاز ندارند. */
  const wantFormal = OCCASION_FORMAL[pref.occasion];
  const heroPrice = Number(hero.price) || 0;

  const scored = (pool || []).map((p) => {
    const bd = { color: 50, style: 50, occasion: 50, taste: 50, budget: 50 };

    /* مناسبت */
    if (wantFormal !== undefined) {
      const f = OCCASION_FORMAL[p.group_key] ?? 2;
      const d = Math.abs(f - wantFormal);
      bd.occasion = d === 0 ? 100 : d === 1 ? 78 : d === 2 ? 42 : 12;
    }

    /* سبک */
    if (pref.style && p.style_key === pref.style) bd.style = 92;

    /* سلیقه */
    if (profile) {
      let hit = 45;
      const lc = profile.learned_colors || {};
      for (const c of p.colors || []) if (lc[c]) hit += 18;
      if (profile.style === p.style_key) hit += 15;
      bd.taste = Math.min(100, hit);
    }

    /* بودجه */
    const pr = Number(p.price) || 0;
    if (pr > cap) bd.budget = Math.max(0, 60 - ((pr - cap) / cap) * 100);
    else if (heroPrice > 0 && pr > 0) {
      const ratio = pr / heroPrice;
      bd.budget = (ratio > 0.25 && ratio < 4) ? 92 : 58;
    }

    return {
      product: p,
      breakdown: bd,
      learned: compat[p.id] || 0,
    };
  });

  return ok(res, {
    hero,
    candidates: scored,
    weights,
    episodes: wrow?.episodes || 0,
    profile: profile ? {
      occasion: profile.occasion, style: profile.style,
      palette: profile.palette, budget: profile.budget,
    } : null,
    count,
    note: 'نمره‌دهی نهایی رنگ و طرح در مرورگر انجام می‌شود.',
  });
}

export default withSafety(handler);
