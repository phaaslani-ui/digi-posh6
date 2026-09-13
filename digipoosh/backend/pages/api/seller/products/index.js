/**
 * GET  /api/seller/products — کالاهای همین فروشنده
 * POST /api/seller/products — افزودن کالا با انتخاب از منو
 * ------------------------------------------------------------
 * فروشنده دیگر نام کالا را نمی‌نویسد. فقط از منوهای کشویی
 * انتخاب می‌کند و سامانه نام را می‌سازد:
 *
 *   «پیراهن رسمی مردانه پنبه سرمه‌ای کلاسیک آستین بلند»
 *
 * چرا؟ چون وقتی هر فروشنده نام دلخواه می‌نوشت، یکی «مردونه»
 * می‌نوشت و دیگری «مردانه ي كلاسيك» با حرف عربی. مشتری که
 * دنبال «پیراهن مردانه» می‌گشت، نصف کالاها را نمی‌دید.
 */
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireApprovedSeller } from '../../../../lib/auth';
import { ok, fail, methodGuard, cors, paginate, rateLimit } from '../../../../lib/helpers';
import { dbFail, multiline, imageList, bodyTooBig, audit } from '../../../../lib/guard';
import { withSafety } from '../../../../lib/safety';
import {
  loadLabels, loadTaxonomy, validateSelections, toColumns,
  buildName, intIn,
} from '../../../../lib/attributes';

/** کمترین تعداد عکس — پرامپت سه تا خواست */
const MIN_IMAGES = 3;

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method !== 'GET' && rateLimit(req, res, { key: 'sp-add', max: 40, windowMs: 60000 })) return;
  if (req.method === 'POST' && bodyTooBig(req, res, 6000)) return;

  const ctx = await requireApprovedSeller(req, res);
  if (!ctx) return;
  const { seller } = ctx;
  if (!seller) return fail(res, 'این عملیات مخصوص فروشندگان است.', 403);

  /* ============================================================
     خواندن کالاهای فروشنده
     ============================================================ */
  if (req.method === 'GET') {
    const { page, limit, from, to } = paginate(req.query);

    let q = supabaseAdmin.from('products').select('*', { count: 'exact' })
      .eq('seller_id', seller.id);

    const st = String(req.query.status || '').trim();
    if (['draft', 'active', 'out_of_stock', 'archived'].includes(st)) {
      q = q.eq('status', st);
    }

    const { data, error, count } = await q
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) return dbFail(res, error);

    const total = count || 0;
    return ok(res, {
      products: data || [],
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  }

  /* ============================================================
     افزودن کالای تازه
     ============================================================ */
  const b = req.body || {};

  /* ---------- ۱. اعتبارسنجی انتخاب‌های منویی ---------- */
  let labels, taxonomy;
  try {
    ({ labels } = await loadLabels(supabaseAdmin));
    taxonomy = await loadTaxonomy(supabaseAdmin);
  } catch (e) {
    return dbFail(res, e, 'خواندن فهرست ویژگی‌ها ممکن نشد.');
  }

  const { errors, clean } = validateSelections(b, labels, taxonomy);

  /* ---------- ۲. قیمت و موجودی ---------- */
  const price = intIn(b.price, 0, 1e12);
  if (price == null) errors.push('قیمت را به‌درستی وارد کنید.');

  const stock = intIn(b.stock, 0, 1e6, 0);

  let discount = null;
  if (b.discount_price != null && String(b.discount_price).trim() !== '') {
    discount = intIn(b.discount_price, 0, 1e12);
    if (discount == null) {
      errors.push('قیمت با تخفیف را به‌درستی وارد کنید.');
    } else if (price != null && discount >= price) {
      /* این خطا بارها در پنل دیده شد: فروشنده «قیمت قبلی» را
         در خانه‌ی تخفیف می‌نوشت و کالا گران‌تر می‌شد */
      errors.push('قیمت با تخفیف باید کمتر از قیمت اصلی باشد.');
    }
  }

  /* ---------- ۳. توضیح ---------- */
  const description = multiline(b.description, 300);
  if (b.description && !description) {
    errors.push('توضیح واردشده معتبر نیست.');
  }

  /* ---------- ۴. عکس‌ها ---------- */
  const images = imageList(b.images, 8);
  if (images.length < MIN_IMAGES) {
    errors.push(`دست‌کم ${MIN_IMAGES} تصویر از کالا بگذارید.`);
  }

  if (errors.length) {
    return fail(res, errors[0], 400, { errors });
  }

  /* ---------- ۵. نام خودکار ---------- */
  /* تریگر پایگاه داده هم همین را می‌سازد؛ اینجا هم می‌سازیم تا
     اگر تریگر هنوز نصب نشده باشد، نام خالی نماند. */
  const autoName = buildName(clean, labels);

  /* ---------- ۶. ذخیره ---------- */
  const row = {
    seller_id: seller.id,
    ...toColumns(clean),
    /* ستون قدیمی category هم پر می‌شود تا مسیرهای موجود نشکنند */
    category: clean.section,
    subcategory: clean.groupKey || null,
    title: autoName,
    auto_name: autoName,
    slug: `${autoName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`,
    description: description || null,
    price,
    discount_price: discount,
    stock,
    images,
    /* کالای تازه به تأیید مدیر می‌رود، مستقیم عمومی نمی‌شود */
    status: 'draft',
  };

  const { data, error } = await supabaseAdmin
    .from('products').insert(row).select().single();

  if (error) return dbFail(res, error, 'ثبت کالا ممکن نشد.');

  await audit(req, seller.user_id || seller.id, 'product.create', {
    productId: data.id, name: data.auto_name || autoName,
  });

  return ok(res, {
    message: `کالا با نام «${data.auto_name || autoName}» ثبت شد و برای بررسی مدیر فرستاده شد.`,
    product: data,
  }, 201);
}

export default withSafety(handler);
