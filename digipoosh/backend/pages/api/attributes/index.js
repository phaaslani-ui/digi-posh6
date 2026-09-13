/**
 * GET /api/attributes
 * ------------------------------------------------------------
 * همه‌ی گزینه‌های منوهای کشویی، برای هر دو طرف:
 *   • فروشنده — تا فرم افزودن کالا را پر کند
 *   • مشتری   — تا نوار فیلتر ساخته شود
 *
 * چون هر دو طرف یک منبع می‌خوانند، هرگز پیش نمی‌آید که
 * فروشنده گزینه‌ای ببیند که مشتری نتواند با آن فیلتر کند.
 *
 * پارامتر اختیاری `section` فقط سبک‌ها و کالاهای همان بخش را
 * برمی‌گرداند — پاسخ سبک‌تر برای فرم فروشنده.
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

  /* ---------- گزینه‌های ویژگی ---------- */
  let options;
  try {
    ({ options } = await loadLabels(supabaseAdmin));
  } catch (e) {
    return dbFail(res, e, 'خواندن فهرست ویژگی‌ها ممکن نشد.');
  }

  /* ---------- درخت دسته‌بندی ---------- */
  let secQ = supabaseAdmin.from('tax_sections')
    .select('key, label, adjective, note').eq('is_active', true).order('sort_order');
  if (section) secQ = secQ.eq('key', section);

  let grpQ = supabaseAdmin.from('tax_groups')
    .select('section_key, key, label, note').eq('is_active', true).order('sort_order');
  if (section) grpQ = grpQ.eq('section_key', section);

  let itmQ = supabaseAdmin.from('tax_items')
    .select('section_key, group_key, label').eq('is_active', true).order('sort_order');
  if (section) itmQ = itmQ.eq('section_key', section);

  const [secR, grpR, itmR] = await Promise.all([secQ, grpQ, itmQ]);

  if (secR.error) return dbFail(res, secR.error);
  if (grpR.error) return dbFail(res, grpR.error);
  if (itmR.error) return dbFail(res, itmR.error);

  /* ---------- سرهم‌کردن درخت ---------- */
  const tree = {};
  (secR.data || []).forEach((s) => {
    tree[s.key] = { key: s.key, label: s.label, adjective: s.adjective, note: s.note, groups: [] };
  });

  const gIndex = {};
  (grpR.data || []).forEach((g) => {
    if (!tree[g.section_key]) return;
    const node = { key: g.key, label: g.label, note: g.note, items: [] };
    tree[g.section_key].groups.push(node);
    gIndex[`${g.section_key}/${g.key}`] = node;
  });

  (itmR.data || []).forEach((it) => {
    const node = gIndex[`${it.section_key}/${it.group_key}`];
    if (node) node.items.push(it.label);
  });

  /* ---------- توضیح گروه‌های ویژگی ---------- */
  const groups = ATTR_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    required: g.required,
    inName: g.inName,
    nameOrder: g.nameOrder,
    options: options[g.key] || [],
  }));

  /* فهرست ویژگی‌ها تقریباً هرگز عوض نمی‌شود — یک ساعت کش */
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');

  return ok(res, {
    sections: Object.values(tree),
    groups,
    /* قاعده‌ی نام‌گذاری، تا فرانت بتواند پیش‌نمایش زنده بدهد */
    nameRule: ATTR_GROUPS.filter((g) => g.inName)
      .sort((a, b) => a.nameOrder - b.nameOrder)
      .map((g) => g.key),
  });
}

export default withSafety(handler);
