/**
 * GET|PATCH|DELETE /api/seller/products/:id
 * ------------------------------------------------------------
 * ویرایش کالا — با همان قاعده‌ی نام خودکار.
 *
 * باگی که اینجا بسته شد: فهرست `allowed` شامل `title` بود.
 * یعنی فروشنده می‌توانست کالا را با منو ثبت کند (نام خودکار
 * بگیرد) و بعد با یک درخواست ویرایش، هر نامی که خواست رویش
 * بگذارد — دقیقاً همان چیزی که نام خودکار می‌خواست جلویش را
 * بگیرد. حالا `title` و `auto_name` فقط از روی انتخاب‌ها
 * ساخته می‌شوند و مستقیم پذیرفته نمی‌شوند.
 */
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireApprovedSeller } from '../../../../lib/auth';
import { ok, fail, methodGuard, cors, rateLimit } from '../../../../lib/helpers';
import { dbFail, multiline, imageList, bodyTooBig, audit } from '../../../../lib/guard';
import { withSafety } from '../../../../lib/safety';
import {
  loadLabels, loadTaxonomy, validateSelections, toColumns,
  buildName, intIn, ATTR_GROUPS,
} from '../../../../lib/attributes';

/** وضعیت‌هایی که خود فروشنده می‌تواند بگذارد */
const SELLER_STATUS = ['draft', 'active', 'out_of_stock', 'archived'];

/** آیا درخواست، ویژگی‌های کالا را دست زده؟ */
const ATTR_FIELDS = ['section', 'itemType', 'item', 'groupKey', 'group', 'sizes',
  ...ATTR_GROUPS.map((g) => g.key)];

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PATCH', 'DELETE'])) return;

  if (req.method !== 'GET' && rateLimit(req, res, { key: 'sp-edit', max: 60, windowMs: 60000 })) return;
  if (req.method === 'PATCH' && bodyTooBig(req, res, 6000)) return;

  const ctx = await requireApprovedSeller(req, res);
  if (!ctx) return;
  const { seller, user } = ctx;

  const id = String(req.query.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(res, 'شناسه‌ی کالا معتبر نیست.', 400);

  const { data: product } = await supabaseAdmin
    .from('products').select('*').eq('id', id).single();

  if (!product) return fail(res, 'کالا پیدا نشد.', 404);
  if (seller && product.seller_id !== seller.id && user.role !== 'admin') {
    return fail(res, 'این کالا متعلق به شما نیست.', 403);
  }

  if (req.method === 'GET') return ok(res, { product });

  /* ============================================================
     بایگانی
     ============================================================ */
  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('products').update({ status: 'archived' }).eq('id', id);
    if (error) return dbFail(res, error);

    await audit(req, user.id, 'product.archive', { productId: id });
    return ok(res, { message: 'کالا بایگانی شد و دیگر در سایت دیده نمی‌شود.' });
  }

  /* ============================================================
     ویرایش
     ============================================================ */
  const b = req.body || {};
  const patch = {};
  const errors = [];

  /* ---------- ویژگی‌ها: اگر یکی عوض شود، همه دوباره بررسی می‌شوند ---------- */
  const touchedAttrs = ATTR_FIELDS.some((k) => b[k] !== undefined);

  if (touchedAttrs) {
    let labels, taxonomy;
    try {
      ({ labels } = await loadLabels(supabaseAdmin));
      taxonomy = await loadTaxonomy(supabaseAdmin);
    } catch (e) {
      return dbFail(res, e, 'خواندن فهرست ویژگی‌ها ممکن نشد.');
    }

    /* مقدارهای نفرستاده از خود کالا برداشته می‌شوند، وگرنه
       ویرایش یک منو بقیه را پاک می‌کرد */
    const merged = {
      section:  b.section  ?? product.section,
      itemType: b.itemType ?? b.item ?? product.item_type,
      groupKey: b.groupKey ?? b.group ?? product.group_key,
      sizes:    b.sizes    ?? product.sizes,
    };
    ATTR_GROUPS.forEach((g) => {
      if (g.key === 'size') return;
      merged[g.key] = b[g.key] ?? product[`${g.key}_key`];
    });

    const v = validateSelections(merged, labels, taxonomy);
    if (v.errors.length) return fail(res, v.errors[0], 400, { errors: v.errors });

    Object.assign(patch, toColumns(v.clean));
    patch.category = v.clean.section;
    patch.subcategory = v.clean.groupKey || null;

    /* نام دوباره ساخته می‌شود — تریگر هم همین کار را می‌کند */
    const nm = buildName(v.clean, labels);
    patch.auto_name = nm;
    patch.title = nm;
  }

  /* ---------- قیمت ---------- */
  if (b.price !== undefined) {
    const p = intIn(b.price, 0, 1e12);
    if (p == null) errors.push('قیمت را به‌درستی وارد کنید.');
    else patch.price = p;
  }

  if (b.discount_price !== undefined) {
    const raw = String(b.discount_price ?? '').trim();
    if (raw === '' || raw === 'null') {
      patch.discount_price = null;
    } else {
      const d = intIn(raw, 0, 1e12);
      const ref = patch.price ?? product.price;
      if (d == null) errors.push('قیمت با تخفیف را به‌درستی وارد کنید.');
      else if (d >= ref) errors.push('قیمت با تخفیف باید کمتر از قیمت اصلی باشد.');
      else patch.discount_price = d;
    }
  }

  /* ---------- موجودی ---------- */
  if (b.stock !== undefined) {
    const s = intIn(b.stock, 0, 1e6);
    if (s == null) errors.push('تعداد موجودی را به‌درستی وارد کنید.');
    else patch.stock = s;
  }

  /* ---------- توضیح ---------- */
  if (b.description !== undefined) {
    const d = multiline(b.description, 300);
    patch.description = d || null;
  }

  /* ---------- عکس‌ها ---------- */
  if (b.images !== undefined) {
    const imgs = imageList(b.images, 8);
    if (imgs.length < 3) errors.push('دست‌کم سه تصویر از کالا لازم است.');
    else patch.images = imgs;
  }

  /* ---------- وضعیت ---------- */
  if (b.status !== undefined) {
    const st = String(b.status);
    if (!SELLER_STATUS.includes(st)) {
      errors.push('وضعیت انتخاب‌شده معتبر نیست.');
    } else {
      patch.status = st;
    }
  }

  /* ---------- تلاش برای نام دستی ---------- */
  if (b.title !== undefined || b.auto_name !== undefined) {
    /* رد نمی‌کنیم که کار فروشنده نخوابد، ولی نادیده می‌گیریم
       و در پاسخ می‌گوییم چرا */
    errors.push('نام کالا خودکار ساخته می‌شود و دستی تغییر نمی‌کند.');
  }

  if (errors.length) return fail(res, errors[0], 400, { errors });
  if (!Object.keys(patch).length) return fail(res, 'داده‌ای برای تغییر فرستاده نشده.');

  const { data, error } = await supabaseAdmin
    .from('products').update(patch).eq('id', id).select().single();

  if (error) return dbFail(res, error, 'به‌روزرسانی کالا ممکن نشد.');

  await audit(req, user.id, 'product.update', {
    productId: id, fields: Object.keys(patch),
  });

  return ok(res, { message: 'کالا به‌روز شد.', product: data });
}

export default withSafety(handler);
