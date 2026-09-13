/**
 * POST /api/ai/feedback — سوخت حلقه‌ی تقویتی
 * ------------------------------------------------------------
 * مهم‌ترین مسیر دیجی AI. بدون این، سیستم یاد نمی‌گیرد.
 *
 * بدنه:
 * {
 *   action:     'shown'|'accepted'|'saved'|'bought'|'swapped'|'ignored',
 *   heroId:     uuid,
 *   itemIds:    [uuid, …],
 *   breakdown:  { color: 88, style: 72, … },   ← نمره‌ی هر معیار
 *   swappedOut: uuid,                          ← اگر قطعه‌ای عوض شد
 *   variant:    'safe'|'harmony'|'bold',
 *   sessionId:  string
 * }
 *
 * پس از هر ۱۲ بازخورد، وزن معیارها بازتنظیم می‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { getUser } from '../../../lib/auth';
import {
  REWARD, ACTIONS, cleanBreakdown, cleanIds, isUuid,
  creditOf, normalizeWeights, DEFAULT_WEIGHTS, W_MIN, W_MAX,
} from '../../../lib/digiai';

const TUNE_EVERY = 12;
const LEARN_RATE = 0.06;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['POST'])) return;

  const b = req.body || {};
  const action = String(b.action || '');

  if (!ACTIONS.includes(action)) {
    return fail(res, 'کنش نامعتبر است.', 400);
  }

  const heroId = isUuid(b.heroId) ? b.heroId : null;
  const itemIds = cleanIds(b.itemIds);
  const swappedOut = isUuid(b.swappedOut) ? b.swappedOut : null;
  const breakdown = cleanBreakdown(b.breakdown);
  const reward = REWARD[action];

  /* کاربر اختیاری است — بازخورد مهمان هم ارزش دارد */
  const user = await getUser(req).catch(() => null);

  /* ---------- ۱. ثبت بازخورد ---------- */
  const { error: insErr } = await supabaseAdmin
    .from('ai_feedback')
    .insert({
      user_id: user?.id || null,
      session_id: String(b.sessionId || '').slice(0, 100) || null,
      hero_id: heroId,
      item_ids: itemIds,
      action,
      reward,
      breakdown,
      swapped_out: swappedOut,
      variant: String(b.variant || '').slice(0, 20) || null,
    });

  if (insErr) return dbFail(res, insErr, 'ثبت بازخورد انجام نشد.');

  /* ---------- ۲. به‌روزرسانی نمره‌ی هم‌نشینی ----------
     همه‌ی جفت‌های ممکن، شامل کالای پایه. */
  if (reward !== 0 && itemIds.length) {
    const all = heroId ? [heroId, ...itemIds] : itemIds;
    const delta = reward * 6;
    const pairs = [];

    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const [a, c] = all[i] < all[j] ? [all[i], all[j]] : [all[j], all[i]];
        pairs.push({ product_a: a, product_b: c, score: delta, observations: 1 });
      }
    }

    if (pairs.length) {
      /* upsert ساده کافی نیست چون باید score را **جمع** کنیم،
         نه جایگزین. پس تابع پایگاه‌داده را صدا می‌زنیم. */
      await supabaseAdmin.rpc('bump_compatibility', { pairs, delta })
        .catch(() => { /* اگر تابع نبود، بی‌خیال — شب اجرا می‌شود */ });
    }
  }

  /* قطعه‌ای که عوض شد، سیگنال منفی صریح است */
  if (swappedOut && heroId) {
    const [a, c] = heroId < swappedOut ? [heroId, swappedOut] : [swappedOut, heroId];
    await supabaseAdmin.rpc('bump_compatibility', {
      pairs: [{ product_a: a, product_b: c, score: -4, observations: 1 }],
      delta: -4,
    }).catch(() => {});
  }

  /* ---------- ۳. گام یادگیری ---------- */
  let tuned = null;

  const { data: wrow } = await supabaseAdmin
    .from('ai_weights').select('*').eq('scope', 'global').maybeSingle();

  if (wrow) {
    const episodes = (wrow.episodes || 0) + 1;
    const credit = { ...(wrow.credit || {}) };

    /* اعتبار این بازخورد را روی سابقه بنشان */
    const c = creditOf(breakdown, reward);
    for (const k of Object.keys(c)) {
      if (!credit[k]) credit[k] = { win: 0, loss: 0 };
      credit[k].win = (credit[k].win || 0) + c[k].win;
      credit[k].loss = (credit[k].loss || 0) + c[k].loss;
    }

    const patch = { episodes, credit, updated_at: new Date().toISOString() };

    /* هر ۱۲ بازخورد، وزن‌ها بازبینی شوند */
    const since = episodes - (wrow.last_tuned_episodes || 0);
    if (since >= TUNE_EVERY) {
      const cur = normalizeWeights(wrow.weights);
      const rates = {};
      let sumRate = 0, nRate = 0;

      for (const k of Object.keys(DEFAULT_WEIGHTS)) {
        const cc = credit[k];
        if (!cc) continue;
        const total = (cc.win || 0) + (cc.loss || 0);
        if (total < 2) continue;
        const r = cc.win / total;
        rates[k] = r;
        sumRate += r;
        nRate++;
      }

      /* مبنای نسبی — نه عدد ثابت ۰٫۵.
         اگر همه‌ی معیارها خوب کار کنند، هیچ‌کدام نباید بالا برود. */
      let mean = 0.5;
      if (nRate >= 2) mean = (sumRate / nRate) * 0.7 + 0.5 * 0.3;

      const next = {};
      let sum = 0;
      for (const k of Object.keys(DEFAULT_WEIGHTS)) {
        let v = cur[k];
        if (rates[k] !== undefined) {
          const trust = Math.min(1, ((credit[k].win + credit[k].loss)) / 20);
          v += (rates[k] - mean) * 2 * LEARN_RATE * trust;
        }
        v = Math.min(W_MAX, Math.max(W_MIN, v));
        next[k] = v;
        sum += v;
      }
      for (const k of Object.keys(next)) {
        next[k] = Math.round((next[k] / sum) * 1000) / 1000;
      }

      /* سابقه کمی پوسیده شود — ۸٪، نه بیشتر.
         تندتر از این، سیستم از اشتباه‌هایش یاد نمی‌گیرد. */
      for (const k of Object.keys(credit)) {
        credit[k].win *= 0.92;
        credit[k].loss *= 0.92;
      }

      patch.weights = next;
      patch.credit = credit;
      patch.last_tuned_at = new Date().toISOString();
      patch.last_tuned_episodes = episodes;
      tuned = next;
    }

    await supabaseAdmin.from('ai_weights').update(patch).eq('scope', 'global');
  }

  return ok(res, {
    recorded: true,
    reward,
    tuned,
    message: tuned ? 'وزن معیارها بازتنظیم شد.' : 'بازخورد ثبت شد.',
  });
}

export default withSafety(handler);
