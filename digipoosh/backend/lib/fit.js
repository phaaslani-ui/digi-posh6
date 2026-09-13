/**
 * lib/fit.js — منطق مشترک تطبیق سایز
 * ------------------------------------------------------------
 * همان الگوریتمی که در `assets/js/dp-fit.js` است.
 *
 * درس گذشته: اگر دو نسخه از یک منطق واگرا شوند، باگ‌هایی
 * می‌سازند که پیدا کردنشان بسیار سخت است. پس هر تغییری
 * اینجا، باید آنجا هم اعمال شود.
 */

export const FIELDS = [
  { key: 'shoulder', col: 'shoulder_cm', name: 'عرض شانه',   min: 25,  max: 70  },
  { key: 'chest',    col: 'chest_cm',    name: 'دور سینه',   min: 60,  max: 160 },
  { key: 'waist',    col: 'waist_cm',    name: 'دور کمر',    min: 50,  max: 160 },
  { key: 'hip',      col: 'hip_cm',      name: 'دور باسن',   min: 60,  max: 170 },
  { key: 'height',   col: 'height_cm',   name: 'قد',         min: 120, max: 220 },
  { key: 'arm',      col: 'arm_cm',      name: 'طول آستین',  min: 40,  max: 80  },
  { key: 'inseam',   col: 'inseam_cm',   name: 'قد داخل پا', min: 50,  max: 110 },
  { key: 'neck',     col: 'neck_cm',     name: 'دور گردن',   min: 25,  max: 55  },
  { key: 'thigh',    col: 'thigh_cm',    name: 'دور ران',    min: 35,  max: 90  },
];

export const FIT_PREF = {
  tight:     { name: 'چسبان', ease: -1, tol: 3 },
  tailored:  { name: 'اندازه', ease: 3, tol: 4 },
  relaxed:   { name: 'راحت',  ease: 7, tol: 6 },
  oversized: { name: 'گشاد',  ease: 14, tol: 9 },
};

export const WEIGHTS = {
  top:    { shoulder: 0.26, chest: 0.30, waist: 0.16, hip: 0.04, arm: 0.14, neck: 0.06, height: 0.04 },
  bottom: { waist: 0.34, hip: 0.30, thigh: 0.16, inseam: 0.16, height: 0.04 },
  full:   { shoulder: 0.18, chest: 0.22, waist: 0.20, hip: 0.20, height: 0.12, arm: 0.08 },
  outer:  { shoulder: 0.30, chest: 0.30, waist: 0.12, arm: 0.18, height: 0.06, neck: 0.04 },
  any:    { shoulder: 0.20, chest: 0.20, waist: 0.20, hip: 0.15, height: 0.15, arm: 0.10 },
};

const CIRCUM = new Set(['chest', 'waist', 'hip', 'thigh', 'neck']);

/**
 * نمره‌ی یک محور — جهت تفاوت مهم است.
 * لباس تنگ جریمه‌ی سنگین می‌گیرد، لباس گشاد جریمه‌ی سبک.
 */
export function axisScore(body, garment, ease, tol, circumference) {
  const b = Number(body), g = Number(garment);
  if (!Number.isFinite(b) || !Number.isFinite(g) || b <= 0 || g <= 0) return null;

  const ideal = circumference ? b + ease : b;
  const diff = g - ideal;

  if (Math.abs(diff) <= tol) return 1 - (Math.abs(diff) / tol) * 0.08;

  const over = Math.abs(diff) - tol;
  return diff < 0
    ? Math.max(0, 0.92 - over * 0.13)     /* تنگ */
    : Math.max(0, 0.92 - over * 0.055);   /* گشاد */
}

export function scoreSize(body, size, { fit = 'tailored', group = 'any' } = {}) {
  const pref = FIT_PREF[fit] || FIT_PREF.tailored;
  const W = WEIGHTS[group] || WEIGHTS.any;

  let total = 0, used = 0;
  const detail = {};

  for (const k of Object.keys(W)) {
    const b = body?.[k], g = size?.[k];
    if (b == null || g == null) continue;

    const circ = CIRCUM.has(k);
    const ease = circ ? pref.ease : Math.max(0, pref.ease * 0.4);
    const tol = circ ? pref.tol : pref.tol * 0.8;

    const sc = axisScore(b, g, ease, tol, circ);
    if (sc == null) continue;

    detail[k] = {
      body: b, garment: g,
      score: Math.round(sc * 100),
      diff: Math.round((g - b) * 10) / 10,
      verdict: sc >= 0.92 ? 'ok' : (g < b ? 'tight' : 'loose'),
    };
    total += sc * W[k];
    used += W[k];
  }

  if (used <= 0) return null;
  const score = Math.max(0, Math.min(1, total / used));

  return {
    label: size.label,
    score,
    percent: Math.round(score * 100),
    detail,
    axes: Object.keys(detail).length,
  };
}

export function verdictOf(percent) {
  if (percent >= 90) return { key: 'perfect', name: 'اندازه‌ی کامل', dots: 3 };
  if (percent >= 80) return { key: 'great',   name: 'تناسب خوب',    dots: 2 };
  if (percent >= 70) return { key: 'good',    name: 'قابل قبول',    dots: 1 };
  return { key: 'poor', name: 'مناسب نیست', dots: 0 };
}

export function recommend(body, sizes, opt = {}) {
  if (!body || !Array.isArray(sizes) || !sizes.length) return null;

  const scored = sizes
    .map((s) => scoreSize(body, s, opt))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;
  scored.forEach((r) => { r.verdict = verdictOf(r.percent); });

  return { best: scored[0], alternatives: scored.slice(1, 3), all: scored };
}

/** ردیف پایگاه‌داده را به شکل داخلی تبدیل می‌کند */
export function rowToSize(row) {
  const out = { label: row.label };
  for (const f of FIELDS) {
    const v = row[f.col];
    if (v != null) out[f.key] = Number(v);
  }
  /* قد کل لباس، معادل height در تطبیق */
  if (row.length_cm != null && out.height == null) out.height = Number(row.length_cm);
  return out;
}

/** ورودی کاربر را پاک و اعتبارسنجی می‌کند */
export function cleanBody(raw) {
  const out = {}, errors = [];
  if (!raw || typeof raw !== 'object') return { ok: false, body: {}, errors: ['داده نیست'] };

  for (const f of FIELDS) {
    const v = raw[f.key] ?? raw[f.col];
    if (v == null || v === '') continue;
    const n = Number(v);
    if (!Number.isFinite(n)) { errors.push(`${f.name} عدد نیست`); continue; }
    if (n < f.min || n > f.max) {
      errors.push(`${f.name} باید بین ${f.min} تا ${f.max} باشد`);
      continue;
    }
    out[f.key] = Math.round(n * 10) / 10;
  }

  return {
    ok: errors.length === 0 && Object.keys(out).length >= 2,
    body: out,
    errors: errors.length ? errors : (Object.keys(out).length < 2 ? ['دست‌کم دو اندازه لازم است'] : []),
  };
}

/** شکل داخلی را به ستون‌های پایگاه‌داده تبدیل می‌کند */
export function bodyToRow(body) {
  const row = {};
  for (const f of FIELDS) {
    if (body[f.key] != null) row[f.col] = body[f.key];
  }
  return row;
}
