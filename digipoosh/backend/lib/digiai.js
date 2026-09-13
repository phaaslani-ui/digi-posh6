/**
 * lib/digiai.js — منطق مشترک دیجی AI
 * ------------------------------------------------------------
 * همان قاعده‌هایی که در فرانت‌اند (`assets/js/dp-digiai.js`)
 * پیاده شده، اینجا هم هست تا خروجی سرور و مرورگر یکی بماند.
 *
 * درس گذشته: اگر دو نسخه از یک منطق واگرا شوند، باگ‌هایی
 * می‌سازند که پیدا کردنشان بسیار سخت است.
 */

/* وزن پیش‌فرض معیارها — اگر جدول `ai_weights` خالی بود */
export const DEFAULT_WEIGHTS = {
  color: 0.30, style: 0.25, occasion: 0.20, taste: 0.15, budget: 0.10,
};

export const W_MIN = 0.05;
export const W_MAX = 0.45;

/** پاداش هر کنش — سوخت حلقه‌ی تقویتی */
export const REWARD = {
  bought: 1.0, accepted: 0.7, saved: 0.5,
  shown: 0.0, swapped: -0.5, ignored: -0.3,
};

export const ACTIONS = Object.keys(REWARD);

/** نردبان رسمیت هر مناسبت */
export const OCCASION_FORMAL = {
  home: 0, sporty: 1, daily: 2, casual: 2,
  date: 3, business: 4, formal: 4, party: 5, wedding: 5,
};

/**
 * وزن‌ها را سالم و نرمال می‌کند.
 * هیچ معیاری نباید حذف یا تک‌تاز شود.
 */
export function normalizeWeights(raw) {
  const out = {};
  let sum = 0;

  for (const k of Object.keys(DEFAULT_WEIGHTS)) {
    let v = Number(raw?.[k]);
    if (!Number.isFinite(v) || v < 0) v = DEFAULT_WEIGHTS[k];
    v = Math.min(W_MAX, Math.max(W_MIN, v));
    out[k] = v;
    sum += v;
  }

  if (sum > 0) {
    for (const k of Object.keys(out)) {
      out[k] = Math.round((out[k] / sum) * 1000) / 1000;
    }
  }
  return out;
}

/** نمره‌ی نهایی از تفکیک معیارها */
export function combine(breakdown, weights) {
  const W = normalizeWeights(weights);
  let s = 0;
  for (const k of Object.keys(W)) {
    const v = Number(breakdown?.[k]);
    if (Number.isFinite(v)) s += v * W[k];
  }
  return Math.round(Math.max(0, Math.min(100, s)));
}

/**
 * اعتبار هر معیار را از یک بازخورد استخراج می‌کند.
 * خروجی: { color: {win, loss}, … }
 */
export function creditOf(breakdown, reward) {
  const out = {};
  if (!breakdown || typeof breakdown !== 'object') return out;

  for (const k of Object.keys(DEFAULT_WEIGHTS)) {
    const v = Number(breakdown[k]);
    if (!Number.isFinite(v)) continue;

    const strength = (v - 50) / 50;
    if (Math.abs(strength) < 0.15) continue;   /* بی‌طرف بود */

    const agree = strength * reward;
    out[k] = agree > 0
      ? { win: Math.abs(agree), loss: 0 }
      : { win: 0, loss: Math.abs(agree) };
  }
  return out;
}

/**
 * تفکیک معیار را اعتبارسنجی می‌کند.
 * هر مقدار باید عددی بین ۰ و ۱۰۰ باشد.
 */
export function cleanBreakdown(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;

  for (const k of Object.keys(DEFAULT_WEIGHTS)) {
    const v = Number(raw[k]);
    if (Number.isFinite(v)) out[k] = Math.round(Math.max(0, Math.min(100, v)));
  }
  return out;
}

/** شناسه‌ی UUID معتبر است؟ */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v) { return typeof v === 'string' && UUID.test(v); }

/** آرایه‌ی شناسه‌ها را پاک می‌کند */
export function cleanIds(raw, max = 12) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const v of raw) {
    if (!isUuid(v) || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}
