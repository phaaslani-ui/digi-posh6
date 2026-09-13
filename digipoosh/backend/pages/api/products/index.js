/**
 * GET /api/products — فهرست کالا با فیلتر کامل
 * ------------------------------------------------------------
 * پارامترها:
 *   section|category  women | men | kids | teen
 *   group             formal | party | casual | …
 *   item|type         «پیراهن رسمی» — نوع کالا
 *   fabric            silk یا silk,cotton (چندتایی با کاما)
 *   color             gold,black
 *   style             classic
 *   sleeve            long
 *   collar            v-neck
 *   length            midi
 *   fit               slim
 *   pattern           floral
 *   season            winter
 *   sizes|size        S,M,L
 *   minPrice          کمترین قیمت
 *   maxPrice          بیشترین قیمت
 *   rating            امتیاز از ۱ تا ۵
 *   inStock           true — فقط موجود
 *   onSale            true — فقط تخفیف‌دار
 *   seller            شناسه‌ی فروشنده
 *   search|q          جست‌وجوی متنی
 *   sort              newest | oldest | price_asc | price_desc | rating_desc | popular
 *   page، limit       صفحه‌بندی
 *
 * دو باگ امنیتی نسخه‌ی پیشین اینجا بسته شد:
 *   ۱) واژه‌ی جست‌وجو خام داخل `.or()` می‌رفت. یک کاما یا
 *      پرانتز در ورودی، ساختار پرس‌وجو را می‌شکست.
 *   ۲) کالای فروشنده‌ی تعلیق‌شده هم عمومی دیده می‌شد.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, methodGuard, cors, paginate } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { parseFilters, applyFilters, SORTS } from '../../../lib/attributes';

/* ستون‌هایی که به مشتری برمی‌گردد — نه بیشتر */
const FIELDS = [
  'id', 'slug', 'title', 'auto_name', 'description',
  'section', 'group_key', 'item_type', 'category', 'subcategory',
  'fabric_key', 'color_key', 'style_key', 'sleeve_key',
  'collar_key', 'length_key', 'fit_key', 'pattern_key', 'season_key',
  'fabric_label', 'color_label', 'color_swatch', 'style_label',
  'sleeve_label', 'collar_label', 'length_label',
  'fit_label', 'pattern_label', 'season_label',
  'section_label', 'group_label',
  'price', 'discount_price', 'stock', 'sizes', 'colors', 'images',
  'rating', 'rating_count', 'views', 'is_featured',
  'seller_id', 'store_name', 'created_at',
].join(', ');

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;

  const f = parseFilters(req.query);
  const { page, limit, from, to } = paginate(req.query);

  /* نمای products_full برچسب فارسی هر ویژگی را از پیش دارد،
     پس دیگر لازم نیست هشت JOIN در هر درخواست انجام شود. */
  const base = () => {
    let q = supabaseAdmin.from('products_full')
      .eq('status', 'active')
      /* کالای فروشگاه تعلیق‌شده یا ردشده عمومی دیده نمی‌شود */
      .eq('seller_status', 'approved');
    return applyFilters(q, f);
  };

  /* شمارش با همان فیلترها — نسخه‌ی پیشین کل جدول را می‌شمرد
     و شماره‌ی صفحه‌بندی همیشه غلط بود */
  const countQ = base().select('id', { count: 'exact', head: true });

  const s = SORTS[f.sort] || SORTS.newest;
  const dataQ = base()
    .select(FIELDS)
    .order(s.col, { ascending: s.asc, nullsFirst: false })
    /* مرتب‌سازی دوم، تا ترتیب بین کالاهای هم‌ارزش پایدار بماند */
    .order('id', { ascending: true })
    .range(from, to);

  const [{ data, error }, { count, error: cErr }] = await Promise.all([dataQ, countQ]);

  if (error) return dbFail(res, error, 'خواندن فهرست کالاها ممکن نشد.');
  if (cErr) return dbFail(res, cErr, 'شمارش کالاها ممکن نشد.');

  const total = count || 0;

  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');

  return ok(res, {
    products: data || [],
    filters: f,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      hasNext: to + 1 < total,
      hasPrev: page > 1,
    },
  });
}

export default withSafety(handler);
