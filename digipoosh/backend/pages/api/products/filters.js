/**
 * GET /api/products/filters
 * ------------------------------------------------------------
 * گزینه‌های نوار فیلتر مشتری — با «تعداد کالای هر گزینه».
 *
 * چرا تعداد مهم است؟ بدون آن، مشتری روی «مخمل» می‌زند و به
 * صفحه‌ی خالی می‌رسد. با تعداد، از اول می‌بیند که مخمل صفر
 * کالا دارد و سراغش نمی‌رود.
 *
 * پارامتر `section` تعدادها را به همان بخش محدود می‌کند، چون
 * «۱۲ مانتو» در صفحه‌ی مردانه گمراه‌کننده است.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { ATTR_GROUPS, SECTIONS, loadLabels } from '../../../lib/attributes';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const section = String(req.query.section || '').trim();
  if (section && !SECTIONS.includes(section)) {
    return fail(res, 'بخش درخواستی معتبر نیست.');
  }

  /* ---------- برچسب هر گزینه ---------- */
  let options;
  try {
    ({ options } = await loadLabels(supabaseAdmin));
  } catch (e) {
    return dbFail(res, e, 'خواندن فهرست فیلترها ممکن نشد.');
  }

  /* ---------- شمارش کالاها ---------- */
  let facetQ = supabaseAdmin.from('filter_facets').select('group_key, name, section, n');
  if (section) facetQ = facetQ.eq('section', section);

  const { data: facets, error: fErr } = await facetQ;
  if (fErr) return dbFail(res, fErr, 'شمارش کالاها ممکن نشد.');

  /* چند بخش ممکن است یک گزینه را داشته باشند؛ جمعشان می‌کنیم */
  const countOf = {};
  (facets || []).forEach((f) => {
    const k = `${f.group_key}/${f.name}`;
    countOf[k] = (countOf[k] || 0) + (f.n || 0);
  });

  /* ---------- بازه‌ی قیمت ---------- */
  let priceQ = supabaseAdmin.from('price_bounds').select('section, min_price, max_price');
  if (section) priceQ = priceQ.eq('section', section);

  const { data: bounds } = await priceQ;
  let minPrice = null;
  let maxPrice = null;
  (bounds || []).forEach((b) => {
    if (minPrice == null || b.min_price < minPrice) minPrice = b.min_price;
    if (maxPrice == null || b.max_price > maxPrice) maxPrice = b.max_price;
  });

  /* ---------- سایزها: از شمارش ویژگی درنمی‌آید، جدا حساب می‌شود ---------- */
  /* سایز در آرایه است، پس نمای شمارش پوششش نمی‌دهد. برای
     پرهیز از پرس‌وجوی سنگین، فقط می‌گوییم کدام سایزها اصلاً
     در بازار هست. */
  let sizeQ = supabaseAdmin.from('products')
    .select('sizes').eq('status', 'active').limit(2000);
  if (section) sizeQ = sizeQ.eq('section', section);

  const { data: sizeRows } = await sizeQ;
  const sizeSeen = new Set();
  (sizeRows || []).forEach((r) => (r.sizes || []).forEach((s) => sizeSeen.add(s)));

  /* ---------- گروه‌های فیلتر ---------- */
  const groups = ATTR_GROUPS
    .filter((g) => g.key !== 'size')
    .map((g) => ({
      key: g.key,
      label: g.label,
      options: (options[g.key] || [])
        .map((o) => ({ ...o, count: countOf[`${g.key}/${o.name}`] || 0 }))
        /* گزینه‌ی بی‌کالا نمایش داده می‌شود ولی خاکستری — پس
           حذفش نمی‌کنیم، فقط ته فهرست می‌رود */
        .sort((a, b) => (b.count - a.count)),
    }))
    /* گروهی که هیچ کالایی ندارد اصلاً نشان داده نمی‌شود */
    .filter((g) => g.options.some((o) => o.count > 0));

  /* ---------- انواع کالا ---------- */
  let itemQ = supabaseAdmin.from('tax_items')
    .select('section_key, group_key, label').eq('is_active', true).order('sort_order');
  if (section) itemQ = itemQ.eq('section_key', section);

  const { data: items } = await itemQ;
  const itemList = (items || [])
    .map((it) => ({
      label: it.label,
      group: it.group_key,
      section: it.section_key,
      count: countOf[`item/${it.label}`] || 0,
    }))
    .filter((it) => it.count > 0)
    .sort((a, b) => b.count - a.count);

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  return ok(res, {
    section: section || null,
    groups,
    items: itemList,
    sizes: (options.size || [])
      .map((s) => ({ ...s, available: sizeSeen.has(s.name) }))
      .filter((s) => s.available),
    price: { min: minPrice ?? 0, max: maxPrice ?? 0 },
  });
}

export default withSafety(handler);
