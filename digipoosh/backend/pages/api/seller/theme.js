/**
 * GET   /api/seller/theme — تم ویترین من
 * PATCH /api/seller/theme — ذخیره‌ی تم
 * ------------------------------------------------------------
 * فروشنده به‌طور پیش‌فرض تمی ندارد؛ ویترینش حال‌وهوای بخشی را
 * می‌گیرد که مشتری از آن آمده. این مسیر فقط برای وقتی است که
 * می‌خواهد تم را قفل کند.
 *
 * نکته‌ی امنیتی: پرامپت اولیه فیلد `custom_css` داشت. آن فیلد
 * ساخته نشد. CSS دلخواه یعنی اجازه‌ی `background: url(...)`
 * برای ردیابی بازدیدکننده، `position: fixed` برای پوشاندن
 * دکمه‌ی پرداخت، و در مرورگرهای قدیمی حتی اجرای کد. به‌جایش
 * فقط سه رنگ و یک عدد پذیرفته می‌شود — همه اعتبارسنجی‌شده.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { requireApprovedSeller } from '../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit } from '../../../lib/helpers';
import { dbFail, audit } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';

const SECTIONS = ['women', 'men', 'kids', 'teen'];
const HEX = /^#[0-9a-fA-F]{6}$/;

/** رنگ امن یا null — هر چیز دیگری رد می‌شود */
function color(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim().toLowerCase();
  return HEX.test(s) ? s : undefined;   // undefined یعنی نامعتبر
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH', 'DELETE'])) return;

  if (req.method !== 'GET' &&
      rateLimit(req, res, { key: 'theme', max: 30, windowMs: 60000 })) return;

  const ctx = await requireApprovedSeller(req, res);
  if (!ctx) return;
  const { seller, user } = ctx;
  if (!seller) return fail(res, 'این عملیات مخصوص فروشندگان است.', 403);

  /* ══════════════════ خواندن ══════════════════ */
  if (req.method === 'GET') {
    /* نمای resolved تم نهایی را می‌دهد — چه قفل باشد چه نه */
    const { data, error } = await supabaseAdmin
      .from('store_theme_resolved')
      .select('*')
      .eq('seller_id', seller.id)
      .single();

    if (error && error.code !== 'PGRST116') return dbFail(res, error);

    return ok(res, {
      theme: data || {
        seller_id: seller.id,
        section: 'women',
        is_locked: false,
        primary_color: null,
        second_color: null,
        accent_color: null,
        radius: null,
      },
      sections: SECTIONS,
    });
  }

  /* ══════════════════ آزادسازی ══════════════════ */
  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('store_themes').delete().eq('seller_id', seller.id);
    if (error) return dbFail(res, error);

    await audit(req, user.id, 'theme.reset', { sellerId: seller.id });
    return ok(res, {
      message: 'تم آزاد شد — ویترین با بخشی که مشتری از آن می‌آید هماهنگ می‌شود.',
    });
  }

  /* ══════════════════ ذخیره ══════════════════ */
  const b = req.body || {};
  const errors = [];

  const section = String(b.section || '').trim();
  if (!SECTIONS.includes(section)) {
    errors.push('تم انتخاب‌شده معتبر نیست.');
  }

  /* ---------- رنگ‌ها ---------- */
  const COLOR_MAP = {
    primary_color: ['primary_color', 'primary'],
    second_color:  ['second_color', 'second'],
    accent_color:  ['accent_color', 'accent'],
    bg_color:      ['bg_color', 'bg'],
    surface_color: ['surface_color', 'surface'],
    ink_color:     ['ink_color', 'ink'],
    mute_color:    ['mute_color', 'mute'],
  };

  const colors = {};
  Object.entries(COLOR_MAP).forEach(([col, keys]) => {
    const raw = keys.map((k) => b[k]).find((v) => v !== undefined);
    const v = color(raw);
    if (v === undefined) errors.push(`کد رنگ «${col}» معتبر نیست.`);
    else colors[col] = v;
  });

  /* ---------- اعداد ---------- */
  function intIn(v, min, max, name) {
    if (v == null || v === '') return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) {
      errors.push(`${name} باید عددی بین ${min} تا ${max} باشد.`);
      return null;
    }
    return n;
  }

  const radius = intIn(b.radius, 0, 32, 'گردی گوشه');
  const borderWidth = intIn(b.border_width ?? b.border, 0, 6, 'ضخامت قاب');

  /* ---------- گزینه‌ها ---------- */
  function pickOne(v, list, name) {
    if (v == null || v === '') return null;
    const s2 = String(v);
    if (!list.includes(s2)) { errors.push(`${name} انتخاب‌شده معتبر نیست.`); return null; }
    return s2;
  }

  const shapes = pickOne(b.shapes, ['petals', 'geo', 'balloons', 'neon', 'none'], 'شکل شناور');
  const motion = pickOne(b.motion, ['drift', 'spin', 'bounce', 'pulse', 'none'], 'نوع حرکت');

  let density = null;
  if (b.density != null && b.density !== '') {
    const d = Number(b.density);
    if (![0, 4, 7, 11].includes(d)) errors.push('تراکم انتخاب‌شده معتبر نیست.');
    else density = d;
  }

  /* ---------- نام تم ---------- */
  let themeName = null;
  if (b.theme_name ?? b.name) {
    themeName = String(b.theme_name ?? b.name).replace(/[<>&"']/g, '').trim().slice(0, 30) || null;
  }

  /* هر کلیدی جز اینها نادیده گرفته می‌شود — به‌ویژه custom_css */
  if (b.custom_css != null) {
    errors.push('CSS دلخواه پذیرفته نمی‌شود؛ فقط رنگ، شکل و اندازه قابل تنظیم است.');
  }

  if (errors.length) return fail(res, errors[0], 400, { errors });

  const row = Object.assign({
    seller_id: seller.id,
    section,
    is_locked: b.is_locked !== false,
    radius,
    border_width: borderWidth,
    shapes,
    motion,
    density,
    theme_name: themeName,
  }, colors);

  const { data, error } = await supabaseAdmin
    .from('store_themes')
    .upsert(row, { onConflict: 'seller_id' })
    .select()
    .single();

  if (error) return dbFail(res, error, 'ذخیره‌ی تم ممکن نشد.');

  await audit(req, user.id, 'theme.save', { sellerId: seller.id, section });

  return ok(res, {
    message: row.is_locked
      ? 'ویترین شما از این پس همیشه با همین تم دیده می‌شود.'
      : 'تم ذخیره شد.',
    theme: data,
  });
}

export default withSafety(handler);
