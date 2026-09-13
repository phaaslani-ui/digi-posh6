/**
 * POST /api/attributes/preview-name
 * ------------------------------------------------------------
 * پیش‌نمایش نام خودکار کالا، بدون ذخیره‌ی چیزی.
 *
 * فرم فروشنده با هر تغییر منو این را صدا می‌زند تا فروشنده
 * همان لحظه ببیند کالایش چه نامی می‌گیرد. اگر شبکه کند بود،
 * فرانت نسخه‌ی محلی همین منطق را دارد و پیش‌نمایش قطع نمی‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors, rateLimit } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { buildName, loadLabels, loadTaxonomy, validateSelections } from '../../../lib/attributes';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  /* این مسیر با هر کلید فشردن صدا زده می‌شود، پس سقفش بالاست
     ولی بی‌سقف نیست */
  if (rateLimit(req, res, { key: 'name-preview', max: 240, windowMs: 60000 })) return;

  const b = req.body || {};

  let labels, taxonomy;
  try {
    ({ labels } = await loadLabels(supabaseAdmin));
    taxonomy = await loadTaxonomy(supabaseAdmin);
  } catch (e) {
    return dbFail(res, e, 'خواندن فهرست ویژگی‌ها ممکن نشد.');
  }

  const { errors, clean } = validateSelections(b, labels, taxonomy);

  /* حتی اگر انتخاب‌ها ناقص باشند، نام تا همان‌جا ساخته می‌شود —
     فروشنده باید ببیند نامش دارد چطور شکل می‌گیرد */
  const name = buildName(
    {
      section:  clean.section  || b.section,
      itemType: clean.itemType || b.itemType || b.item,
      fabric:   clean.fabric   || b.fabric,
      color:    clean.color    || b.color,
      style:    clean.style    || b.style,
      sleeve:   clean.sleeve   || b.sleeve,
    },
    labels
  );

  return ok(res, {
    name,
    complete: errors.length === 0,
    missing: errors,
  });
}

export default withSafety(handler);
