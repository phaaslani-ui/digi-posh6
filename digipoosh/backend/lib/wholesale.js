/**
 * دیجی‌پوش — منطق مشترک بازار عمده‌فروشان
 * ------------------------------------------------------------
 * هرچه اینجا باشد، در چند مسیر API استفاده می‌شود. نگه داشتن
 * آن در یک جا یعنی وقتی قاعده‌ای عوض شد، فقط یک نقطه تغییر
 * می‌کند و مسیرها با هم ناهماهنگ نمی‌شوند.
 */
import { supabaseAdmin } from './supabase';

/* ============================================================
   قیمت پلکانی
   ------------------------------------------------------------
   ستون فقرات عمده‌فروشی. هرگز نباید در سمت مرورگر حساب شود:
   خریدار می‌تواند جاوااسکریپت را دستکاری کند و قیمت پله‌ی
   ۱۰۰۰تایی را برای ۱۲ عدد بگیرد. پس همیشه اینجا.
   ============================================================ */

/** پله‌های پیش‌فرض وقتی فروشنده خودش تعریف نکرده */
export function defaultTiers(base, moq) {
  const b = Math.max(0, Number(base) || 0);
  const m = Math.max(1, Number(moq) || 1);
  return [
    { from: m,      price: b },
    { from: m * 5,  price: Math.round(b * 0.94) },
    { from: m * 10, price: Math.round(b * 0.88) },
    { from: m * 25, price: Math.round(b * 0.80) },
  ];
}

/**
 * پله‌ها را تمیز و مرتب می‌کند — ورودی کاربر هرگز قابل اعتماد نیست.
 *
 * نکته‌ی مهم که یک بار باگ ساخت:
 * پیش‌تر `Math.max(1, ...)` روی `from` اعمال می‌شد. یعنی پله‌ی
 * نامعتبرِ `{from: 0}` به‌جای اینکه رد شود، به «از ۱ عدد»
 * تبدیل می‌شد — و حداقل سفارش فروشنده را دور می‌زد. خریدار
 * می‌توانست یک عدد را با قیمت عمده بگیرد.
 *
 * حالا پله‌ی نامعتبر **حذف** می‌شود، و هیچ پله‌ای پایین‌تر از
 * حداقل سفارش پذیرفته نمی‌شود.
 */
export function cleanTiers(raw, base, moq) {
  if (!Array.isArray(raw) || !raw.length) return defaultTiers(base, moq);

  const minQty = Math.max(1, Math.floor(Number(moq) || 1));

  const out = raw
    .map((t) => ({
      from:  Math.floor(Number(t?.from)),
      price: Math.round(Number(t?.price)),
    }))
    .filter((t) =>
      Number.isFinite(t.from) && Number.isFinite(t.price) &&
      t.from >= minQty &&        /* پله زیر حداقل سفارش بی‌معناست */
      t.price > 0
    )
    .sort((a, b) => a.from - b.from);

  if (!out.length) return defaultTiers(base, moq);

  /* پله‌های تکراری حذف شوند — آخری برنده است */
  const seen = new Map();
  for (const t of out) seen.set(t.from, t.price);

  return [...seen.entries()]
    .map(([from, price]) => ({ from, price }))
    .sort((a, b) => a.from - b.from);
}

/**
 * قیمت هر عدد برای تعداد مشخص.
 * این تابع تنها مرجع قیمت است — هر جا قیمتی لازم شد،
 * از همین‌جا می‌آید.
 */
export function priceFor(product, qty) {
  const n = Math.max(1, Math.floor(Number(qty) || 1));
  const tiers = cleanTiers(product.tiers, product.price, product.moq);
  const base = Math.max(0, Number(product.price) || 0);

  /*
   * پله‌ای که تعداد به آن رسیده باشد.
   *
   * اگر به هیچ پله‌ای نرسیده (مثلاً پله‌ها از ۱۰ شروع می‌شوند
   * ولی ۳ عدد خواسته)، **قیمت پایه** حساب می‌شود — نه ارزان‌ترین
   * پله. پیش‌تر `tiers[0]` بی‌قیدوشرط انتخاب می‌شد و خریدار
   * تخفیف تعداد بالا را بدون خرید تعداد بالا می‌گرفت.
   */
  let picked = null;
  for (const t of tiers) if (n >= t.from) picked = t;

  const unit = picked
    ? Math.max(0, Number(picked.price) || base)
    : base;

  return {
    unit,
    total: unit * n,
    tier: picked,
    saved: Math.max(0, base - unit) * n,
    savedPercent: base > 0 ? Math.round(((base - unit) / base) * 100) : 0,
  };
}

/** بیشترین تخفیف ممکن — برای نشان «تا ٪X ارزان‌تر» */
export function maxDiscount(product) {
  const base = Number(product.price) || 0;
  if (!base) return 0;
  const tiers = cleanTiers(product.tiers, base, product.moq);
  const low = Math.min(...tiers.map((t) => t.price), base);
  return low >= base ? 0 : Math.round(((base - low) / base) * 100);
}

/* ============================================================
   دسترسی فروشنده
   ============================================================ */

/**
 * پروفایل عمده‌فروشِ کاربر فعلی را برمی‌گرداند.
 * اگر عمده‌فروش نباشد یا تأیید نشده باشد، null.
 */
export async function wholesaleSeller(userId) {
  if (!userId || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('seller_type', 'wholesale')
    .maybeSingle();
  return data || null;
}

/**
 * قواعد دسترسی — همان قاعده‌ی سمت مرورگر، اینجا هم اجرا
 * می‌شود. مرورگر برای راهنمایی کاربر است؛ تصمیم واقعی اینجاست.
 */
export const RULES = {
  approved:  { canAdd: true,  canPublish: true,  locked: false },
  pending:   { canAdd: true,  canPublish: false, locked: false },
  rejected:  { canAdd: false, canPublish: false, locked: true  },
  suspended: { canAdd: false, canPublish: false, locked: true  },
};

export function rulesFor(status) {
  return RULES[status] || RULES.pending;
}

/**
 * محافظ مسیرهای پنل عمده.
 * اگر مشکلی بود خودش پاسخ خطا می‌دهد و null برمی‌گرداند.
 */
export async function requireWholesaleSeller(req, res, user) {
  const seller = await wholesaleSeller(user.id);

  if (!seller) {
    res.status(403).json({
      ok: false,
      error: 'این بخش فقط برای تأمین‌کنندگان عمده است.',
    });
    return null;
  }

  const rule = rulesFor(seller.status);
  if (rule.locked) {
    res.status(403).json({
      ok: false,
      error: seller.status === 'rejected'
        ? 'درخواست فروشگاه شما رد شده است.'
        : 'دسترسی فروشگاه شما موقتاً بسته است.',
      reason: seller.rejection_reason || '',
    });
    return null;
  }

  return { seller, rule };
}

/* ============================================================
   کد یکتای کالا
   ============================================================ */
export async function uniqueCode(sellerId, wanted) {
  const want = String(wanted ?? '').trim();

  const { data: rows } = await supabaseAdmin
    .from('wholesale_products')
    .select('code')
    .eq('seller_id', sellerId);

  const taken = new Set((rows || []).map((r) => String(r.code)));
  if (want && !taken.has(want)) return want;

  let n = (rows?.length || 0) + 1001;
  while (taken.has(String(n))) n++;
  return String(n);
}

/* ============================================================
   اعتبارسنجی
   ============================================================ */

/**
 * شماره‌ی موبایل ایرانی را به شکل استاندارد `09xxxxxxxxx` درمی‌آورد.
 *
 * سه شکل رایج پذیرفته می‌شود، چون کاربران هر سه را می‌نویسند:
 *   09121234567   → همان
 *   +989121234567 → 09121234567
 *   9121234567    → 09121234567
 * ارقام فارسی هم تبدیل می‌شوند.
 */
export function normalizePhone(v) {
  let s = toEnDigits(v).replace(/\D/g, '');

  if (s.startsWith('0098')) s = s.slice(4);
  else if (s.startsWith('98') && s.length === 12) s = s.slice(2);

  if (s.length === 10 && s.startsWith('9')) s = '0' + s;
  return s;
}

export function validPhone(v) {
  return /^09\d{9}$/.test(normalizePhone(v));
}

/**
 * ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند و
 * جداکننده‌های هزارگان را برمی‌دارد.
 *
 * چرا لازم است؟ سایت قیمت‌ها را به شکل «۵۰۰٬۰۰۰» نشان می‌دهد،
 * پس کاربر طبیعتاً همان را کپی می‌کند و در فرم می‌گذارد. اگر
 * نپذیریم، پیام «عدد نامعتبر» می‌گیرد در حالی که دقیقاً همان
 * چیزی را نوشته که خودمان نمایش داده‌ایم.
 *
 * صفحه‌کلیدهای ایرانی هم گاهی ارقام عربی (٠١٢٣) می‌فرستند.
 */
export function toEnDigits(v) {
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const AR = '٠١٢٣٤٥٦٧٨٩';
  return String(v ?? '')
    .replace(/[۰-۹]/g, (d) => FA.indexOf(d))
    .replace(/[٠-٩]/g, (d) => AR.indexOf(d))
    /* جداکننده‌های هزارگان: ویرگول فارسی، ویرگول لاتین،
       فاصله‌ی باریک و فاصله‌ی معمولی بین ارقام */
    .replace(/[٬,\u066C\u2009\u202F]/g, '')
    .replace(/(?<=\d)[ \u00A0](?=\d)/g, '')
    /* ممیز فارسی به نقطه */
    .replace(/٫/g, '.')
    .trim();
}

/** عدد صحیح در بازه — ارقام فارسی، عربی و جداکننده را می‌پذیرد */
export function intIn(v, min, max) {
  const s = toEnDigits(v);
  if (s === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < min || i > max) return null;
  return i;
}

/* ============================================================
   وزن نردبان
   ------------------------------------------------------------
   بازار عمده نردبان جدا دارد. عمده‌فروشی که بسته‌ی `hero`
   خریده، در ویترین خرده‌فروشی هیچ وزنی ندارد و برعکس.
   ============================================================ */
export const BOOST_WEIGHT = {
  ladder:    10,
  highlight: 25,
  featured:  50,
  hero:      100,
};

export async function boostWeights() {
  if (!supabaseAdmin) return {};
  const { data } = await supabaseAdmin
    .from('wholesale_boosts')
    .select('seller_id, plan, ends_at')
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString());

  const map = {};
  for (const b of data || []) {
    const w = BOOST_WEIGHT[b.plan] || 0;
    map[b.seller_id] = Math.max(map[b.seller_id] || 0, w);
  }
  return map;
}

/** شمارش بازدید/کلیک/استعلام برای گزارش نردبان */
export async function countBoost(sellerId, field) {
  if (!supabaseAdmin || !sellerId) return;
  if (!['views', 'clicks', 'rfq_count'].includes(field)) return;

  const { data } = await supabaseAdmin
    .from('wholesale_boosts')
    .select('id, ' + field)
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .limit(1);

  const row = data?.[0];
  if (!row) return;

  await supabaseAdmin
    .from('wholesale_boosts')
    .update({ [field]: (Number(row[field]) || 0) + 1 })
    .eq('id', row.id);
}

/* ============================================================
   نگاشت نام ستون‌ها
   ------------------------------------------------------------
   پایگاه داده snake_case است، فرانت‌اند camelCase.
   این دو تابع مرز میان آن دو را نگه می‌دارند.
   ============================================================ */
export function productOut(p) {
  if (!p) return null;
  return {
    id: p.id,
    sellerId: p.seller_id,
    name: p.name,
    code: p.code,
    brand: p.brand || '',
    description: p.description || '',
    section: p.section || '',
    group: p.group || '',
    item: p.item || '',
    category: p.category || '',
    price: Number(p.price) || 0,
    moq: Number(p.moq) || 1,
    stock: Number(p.stock) || 0,
    lowAt: Number(p.low_at) || 0,
    leadTime: Number(p.lead_time) || 0,
    tiers: Array.isArray(p.tiers) ? p.tiers : [],
    material: p.material || '',
    colors: p.colors || '',
    sizes: p.sizes || '',
    packing: p.packing || '',
    images: p.images || [],
    status: p.status,
    wanted: p.wanted,
    views: p.views || 0,
    sold: p.sold || 0,
    maxDiscount: maxDiscount(p),
    createdAt: p.created_at,
  };
}

export function rfqOut(r) {
  if (!r) return null;
  return {
    id: r.id,
    sellerId: r.seller_id,
    productId: r.product_id,
    productName: r.product_name || '',
    buyerName: r.buyer_name,
    buyerPhone: r.buyer_phone,
    buyerEmail: r.buyer_email || '',
    buyerCompany: r.buyer_company || '',
    qty: r.qty,
    targetPrice: Number(r.target_price) || 0,
    deadline: r.deadline,
    note: r.note || '',
    status: r.status,
    offer: r.offer_price
      ? {
          unitPrice: Number(r.offer_price),
          total: Number(r.offer_price) * r.qty,
          leadTime: r.offer_lead_time || 0,
          validDays: r.offer_valid_days || 7,
          note: r.offer_note || '',
          at: r.offered_at,
        }
      : null,
    rejectReason: r.reject_reason || '',
    orderId: r.order_id,
    createdAt: r.created_at,
  };
}

export function orderOut(o) {
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.order_number,
    sellerId: o.seller_id,
    buyerName: o.buyer_name,
    buyerPhone: o.buyer_phone,
    buyerCompany: o.buyer_company || '',
    address: o.address || '',
    count: o.item_count,
    total: Number(o.total) || 0,
    paid: Number(o.paid) || 0,
    remaining: Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0)),
    status: o.status,
    note: o.note || '',
    fromRfq: o.from_rfq,
    lines: (o.items || o.wholesale_order_items || []).map((l) => ({
      productId: l.product_id,
      name: l.name,
      qty: l.qty,
      unit: Number(l.unit_price) || 0,
      total: Number(l.line_total) || 0,
    })),
    createdAt: o.created_at,
  };
}

/** گردش وضعیت سفارش — پرش از مرحله ممنوع */
export const ORDER_FLOW = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

export function canMoveTo(from, to) {
  if (to === 'canceled') return from !== 'delivered';
  const a = ORDER_FLOW.indexOf(from);
  const b = ORDER_FLOW.indexOf(to);
  if (a < 0 || b < 0) return false;
  return b === a + 1;   // فقط یک پله جلو
}
