/**
 * دیجی‌پوش — ویژگی‌های کالا، نام‌گذاری خودکار و فیلتر
 * ------------------------------------------------------------
 * چرا این فایل؟
 *
 * پیش از این، فروشنده نام کالا را دستی می‌نوشت. نتیجه‌اش این
 * می‌شد که یک نفر می‌نوشت «پیراهن مردونه» و دیگری «پيراهن
 * مردانه ي كلاسيك» — با «ي» و «ك» عربی. مشتری که دنبال
 * «پیراهن» می‌گشت، نصف کالاها را نمی‌دید.
 *
 * حالا فروشنده فقط از منوهای کشویی انتخاب می‌کند و نام را
 * سامانه می‌سازد. نتیجه: نام‌ها یکدست، جست‌وجو دقیق، و فیلتر
 * واقعاً کار می‌کند چون هر ویژگی ستون خودش را دارد.
 *
 * نکته‌ی مهم: منطق نام‌سازی اینجا و در تریگر پایگاه داده
 * «هر دو» پیاده شده. تکرار عمدی است — پایگاه داده حرف آخر را
 * می‌زند تا اگر کسی مستقیم در جدول بنویسد هم نام درست بسازد؛
 * و این نسخه‌ی جاوااسکریپت پیش‌نمایش زنده به فروشنده می‌دهد
 * بدون رفت‌وبرگشت به سرور.
 */

/* ============================================================
   ۱. گروه‌های ویژگی
   ------------------------------------------------------------
   هر گروه می‌گوید: اجباری است؟ در نام کالا می‌آید؟ چندم؟
   ============================================================ */
export const ATTR_GROUPS = [
  { key: 'fabric',  label: 'جنس پارچه', required: true,  inName: true,  nameOrder: 3 },
  { key: 'color',   label: 'رنگ اصلی',  required: true,  inName: true,  nameOrder: 4 },
  { key: 'style',   label: 'مدل',       required: true,  inName: true,  nameOrder: 5 },
  { key: 'sleeve',  label: 'آستین',     required: false, inName: true,  nameOrder: 6 },
  { key: 'collar',  label: 'یقه',       required: false, inName: false, nameOrder: 0 },
  { key: 'length',  label: 'قد',        required: false, inName: false, nameOrder: 0 },
  { key: 'fit',     label: 'فرم برش',   required: false, inName: false, nameOrder: 0 },
  { key: 'pattern', label: 'طرح',       required: false, inName: false, nameOrder: 0 },
  { key: 'season',  label: 'فصل',       required: false, inName: false, nameOrder: 0 },
  { key: 'size',    label: 'سایز',      required: true,  inName: false, nameOrder: 0 },
];

/** نگاشت سریع کلید گروه → توضیحاتش */
export const GROUP_BY_KEY = Object.fromEntries(ATTR_GROUPS.map((g) => [g.key, g]));

/** ستون پایگاه داده‌ی هر گروه */
export const COLUMN_OF = {
  fabric:  'fabric_key',
  color:   'color_key',
  style:   'style_key',
  sleeve:  'sleeve_key',
  collar:  'collar_key',
  length:  'length_key',
  fit:     'fit_key',
  pattern: 'pattern_key',
  season:  'season_key',
};

/* ============================================================
   ۲. صفت هر بخش — در نام کالا می‌نشیند
   ============================================================ */
export const SECTION_ADJ = {
  women: 'زنانه',
  men:   'مردانه',
  kids:  'بچگانه',
  teen:  'نوجوان',
};

export const SECTIONS = Object.keys(SECTION_ADJ);

/* ============================================================
   ۳. یکسان‌سازی نویسه‌های فارسی
   ------------------------------------------------------------
   «ي» و «ك» عربی، «ة»، نیم‌فاصله‌های ناهمگون و ارقام فارسی
   همگی به شکل استاندارد درمی‌آیند. بدون این، جست‌وجو و
   یکتایی نام بی‌معنا می‌شود.
   ============================================================ */
export function normalizeFa(input) {
  return String(input == null ? '' : input)
    .replace(/[\u064A\u06CC]/g, 'ی')      // ي عربی → ی فارسی
    .replace(/[\u0643\u06A9]/g, 'ک')      // ك عربی → ک فارسی
    .replace(/\u0629/g, 'ه')              // ة → ه
    .replace(/[\u0623\u0625]/g, 'ا')      // أ إ → ا
    /* «آ» عمداً دست‌نخورده می‌ماند: تبدیلش به «ا» واژه‌های
       درست را خراب می‌کند — «آستین» می‌شد «استین». */
    .replace(/[\u064B-\u0652]/g, '')      // اعراب حذف
    .replace(/\u200C+/g, '\u200C')        // نیم‌فاصله‌ی تکراری
    .replace(/[ \t\u00A0]+/g, ' ')        // فاصله‌های تکراری
    .trim();
}

/** ارقام فارسی و عربی → انگلیسی، و حذف جداکننده‌ی هزارگان */
export function toEnDigits(input) {
  return String(input == null ? '' : input)
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u066C\u002C\u2009\u202F']/g, '')
    .replace(/\u066B/g, '.')
    .trim();
}

/** عدد صحیح در یک بازه — هر چیز نامعتبر، مقدار پیش‌فرض */
export function intIn(v, min, max, fallback = null) {
  const n = Number(toEnDigits(v));
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  if (i < min || i > max) return fallback;
  return i;
}

/* ============================================================
   ۴. ساخت نام خودکار کالا
   ------------------------------------------------------------
   الگو: [نوع کالا] [صفت بخش] [طرح] [جنس] [رنگ] [مدل] [آستین] [قد]
   نمونه: «پیراهن رسمی مردانه پنبه سرمه‌ای کلاسیک آستین بلند»

   ولی الگو کورکورانه اجرا نمی‌شود. با هشت ویژگی، نام به
   هشتاد نویسه می‌رسید و در کارت کالا بریده می‌شد.

   حالا هر تکه وزن دارد. وقتی نام بلند می‌شود، کم‌ارزش‌ترین
   تکه‌ها می‌روند — نه آخرین‌ها.

   ⚠ این منطق باید دقیقاً با `assets/js/dp-attributes.js`
      یکی بماند، وگرنه نام سمت سرور با نام سمت مرورگر فرق
      می‌کند و فروشنده گیج می‌شود.
   ============================================================ */

/** کالاهایی که پارچه ندارند — جنسشان صفت می‌شود */
const NON_FABRIC =
  /کفش|چکمه|صندل|کتانی|دمپایی|بوت|کیف|کوله|جوراب|کلاه|کمربند|عینک|ساعت|دستکش|شال|روسری|زیورآلات|گردنبند|دستبند|انگشتر/;

/** کالاهایی که آستین ندارند */
const NO_SLEEVE =
  /کفش|چکمه|صندل|کتانی|دمپایی|بوت|کیف|کوله|جوراب|کلاه|کمربند|عینک|ساعت|شال|روسری|دامن|شلوار|شلوارک|زیورآلات|گردنبند|دستبند|انگشتر/;

/** صفت‌سازی از نام جنس، برای کالای غیرپارچه‌ای */
const FABRIC_ADJ = {
  leather: 'چرمی', cotton: 'نخی', wool: 'پشمی', silk: 'ابریشمی',
  denim: 'جین', linen: 'کتانی', velvet: 'مخملی', satin: 'ساتنی',
  knit: 'بافتنی', nylon: 'نایلونی', polyester: 'پلی‌استری',
  chiffon: 'حریری', crepe: 'کرپی', cashmere: 'کشمیری',
  viscose: 'ویسکوزی', jersey: 'جودونی',
};

const SOFT_LEN = 46;    /* طول دلخواه */
const MAX_LEN = 62;     /* سقف قطعی */
const MAX_CHUNKS = 6;   /* بیشترین تعداد ویژگی در نام */

/** ارزش هر تکه — بزرگ‌تر یعنی دیرتر حذف می‌شود */
const WEIGHT = {
  item: 100, color: 80, section: 70, fabric: 60,
  style: 45, pattern: 35, sleeve: 25, length: 20,
};

/** رنگ چندواژه‌ای — «به رنگ» فقط وقتی جا هست */
function colorPhrase(lbl) {
  const t = String(lbl).trim();
  const n = t.split(/\s+/).length;
  if (n < 2) return t;
  if (n === 2) return 'به رنگ ' + t;
  return t;
}

/** آیا دو تکه واژه‌ی مشترک دارند؟ («آستین بلند» و «قد بلند») */
function clashes(a, b) {
  if (!a || !b) return false;
  const wa = String(a).split(/\s+/);
  const wb = String(b).split(/\s+/);
  return wa.some((w) => w.length > 2 && wb.includes(w));
}

/** چیدن تکه‌ها با رعایت سقف — کم‌ارزش‌ترین‌ها اول می‌روند */
function assemble(chunks) {
  const keep = chunks.slice();
  const dropped = [];

  const text = (l) => l.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();

  /* گام ۱: تکه‌های واژه‌مشترک */
  for (let i = keep.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (clashes(keep[i].text, keep[j].text)) {
        const weak = keep[i].w <= keep[j].w ? i : j;
        dropped.push(keep[weak]);
        keep.splice(weak, 1);
        i = keep.length;
        break;
      }
    }
  }

  /* گام ۲: تا رسیدن به طول دلخواه */
  let guard = 0;
  while ((text(keep).length > SOFT_LEN || keep.length > MAX_CHUNKS)
         && keep.length > 2 && guard++ < 20) {
    let min = 1, minW = Infinity;
    for (let k = 1; k < keep.length; k++) {
      if (keep[k].w < minW) { minW = keep[k].w; min = k; }
    }
    dropped.push(keep[min]);
    keep.splice(min, 1);
  }

  /* گام ۳: سقف قطعی — هرگز وسط واژه نمی‌بُرد */
  let out = text(keep);
  if (out.length > MAX_LEN) {
    const w = out.split(/\s+/);
    while (w.length > 2 && w.join(' ').length > MAX_LEN) w.pop();
    out = w.join(' ');
  }

  return { name: out, dropped };
}

/** تکه‌های نام، با وزن */
export function nameParts(sel, labels) {
  const item = normalizeFa(sel.itemType);
  if (!item) return [];

  const chunks = [{ key: 'item', src: 'نوع کالا', text: item, w: WEIGHT.item }];

  const used = {};
  item.split(/\s+/).forEach((w) => { used[w] = 1; });

  const add = (key, src, word) => {
    const w = normalizeFa(word);
    if (!w) return;
    const first = w.split(/\s+/)[0];
    if (used[w] || used[first]) return;
    used[w] = 1;
    w.split(/\s+/).forEach((x) => { used[x] = 1; });
    chunks.push({ key, src, text: w, w: WEIGHT[key] || 10 });
  };

  add('section', 'بخش', SECTION_ADJ[sel.section]);

  if (sel.pattern && sel.pattern !== 'plain' && sel.pattern !== 'none') {
    add('pattern', 'طرح', labels?.pattern?.[sel.pattern]);
  }

  if (sel.fabric && sel.fabric !== 'none') {
    const plain = NON_FABRIC.test(item);
    add('fabric', 'جنس', plain
      ? (FABRIC_ADJ[sel.fabric] || labels?.fabric?.[sel.fabric])
      : labels?.fabric?.[sel.fabric]);
  }

  if (sel.color && sel.color !== 'none') {
    let clbl = labels?.color?.[sel.color] || sel.colorLabel;
    if (clbl) {
      const cw = String(clbl).trim().split(/\s+/);
      if (cw.length > 3) clbl = cw.slice(0, 2).join(' ');
      add('color', 'رنگ', colorPhrase(clbl));
    }
  }

  if (sel.style && sel.style !== 'none') {
    add('style', 'مدل', labels?.style?.[sel.style]);
  }

  if (sel.sleeve && sel.sleeve !== 'none' && !NO_SLEEVE.test(item)) {
    add('sleeve', 'آستین', labels?.sleeve?.[sel.sleeve]);
  }

  if (sel.length && sel.length !== 'none') {
    const llbl = labels?.length?.[sel.length];
    if (llbl) {
      const sleeveShown = chunks.some((c) => c.key === 'sleeve');
      add('length', 'قد', sleeveShown ? 'قد ' + llbl : llbl);
    }
  }

  return chunks;
}

export function buildName(sel, labels) {
  const chunks = nameParts(sel, labels);
  if (!chunks.length) return 'کالای بدون مشخصات';
  return assemble(chunks).name || 'کالای بدون مشخصات';
}

/** گزارش کامل — کدام تکه‌ها ماندند، کدام‌ها رفتند */
export function nameReport(sel, labels) {
  const chunks = nameParts(sel, labels);
  if (!chunks.length) {
    return { name: '', full: '', kept: [], dropped: [], len: 0 };
  }
  const res = assemble(chunks);
  const gone = new Set(res.dropped.map((c) => c.key));
  return {
    name: res.name,
    full: chunks.map((c) => c.text).join(' '),
    kept: chunks.filter((c) => !gone.has(c.key)),
    dropped: res.dropped,
    len: res.name.length,
  };
}

/* ============================================================
   ۵. خواندن برچسب‌ها از پایگاه داده
   ------------------------------------------------------------
   یک بار خوانده و در حافظه نگه داشته می‌شود. فهرست ویژگی‌ها
   تقریباً هرگز عوض نمی‌شود، پس هر درخواست نباید دوباره بخواند.
   ============================================================ */
let _cache = null;
let _cacheAt = 0;
const CACHE_MS = 5 * 60 * 1000;   // پنج دقیقه

export function clearAttrCache() {
  _cache = null;
  _cacheAt = 0;
}

/**
 * همه‌ی گزینه‌های ویژگی، دسته‌بندی‌شده بر پایه‌ی گروه.
 * خروجی: { fabric: { silk: 'ابریشم', … }, color: { … }, … }
 */
export async function loadLabels(admin) {
  if (_cache && Date.now() - _cacheAt < CACHE_MS) return _cache;

  const { data, error } = await admin
    .from('attribute_options')
    .select('group_key, name, label, swatch, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;

  const labels = {};
  const options = {};

  (data || []).forEach((r) => {
    if (!labels[r.group_key]) { labels[r.group_key] = {}; options[r.group_key] = []; }
    labels[r.group_key][r.name] = r.label;
    options[r.group_key].push({
      name: r.name,
      label: r.label,
      swatch: r.swatch || null,
    });
  });

  _cache = { labels, options };
  _cacheAt = Date.now();
  return _cache;
}

/* ============================================================
   ۶. اعتبارسنجی انتخاب‌های فروشنده
   ------------------------------------------------------------
   هر کلیدی که فروشنده می‌فرستد باید واقعاً در فهرست باشد.
   وگرنه می‌شود با یک درخواست دستی، مقدار دلخواه در پایگاه
   داده نشاند و فیلتر مشتری را خراب کرد.
   ============================================================ */
export function validateSelections(body, labels, taxonomy) {
  const errors = [];
  const clean = {};

  /* ---------- بخش ---------- */
  const section = String(body.section || '').trim();
  if (!SECTIONS.includes(section)) {
    errors.push('بخش کالا را انتخاب کنید (زنانه، مردانه، بچگانه یا نوجوان).');
  } else {
    clean.section = section;
  }

  /* ---------- سبک و نوع کالا ---------- */
  const groupKey = String(body.groupKey || body.group || '').trim();
  const itemType = normalizeFa(body.itemType || body.item);

  if (!itemType) {
    errors.push('نوع کالا را انتخاب کنید.');
  } else if (taxonomy && clean.section) {
    const known = taxonomy[clean.section];
    if (known && !known.items.has(itemType)) {
      errors.push(`«${itemType}» در فهرست کالاهای این بخش نیست.`);
    }
    if (groupKey && known && !known.groups.has(groupKey)) {
      errors.push('سبک انتخاب‌شده با این بخش جور نیست.');
    }
  }
  if (itemType) clean.itemType = itemType;
  if (groupKey) clean.groupKey = groupKey;

  /* ---------- ویژگی‌ها ---------- */
  ATTR_GROUPS.forEach((g) => {
    if (g.key === 'size') return;              // سایز جداگانه بررسی می‌شود

    const raw = body[g.key];
    const val = raw == null ? '' : String(raw).trim();

    if (!val) {
      if (g.required) errors.push(`${g.label} را انتخاب کنید.`);
      return;
    }

    if (!labels?.[g.key]?.[val]) {
      errors.push(`گزینه‌ی «${val}» برای ${g.label} معتبر نیست.`);
      return;
    }

    clean[g.key] = val;
  });

  /* ---------- سایزها ---------- */
  const rawSizes = Array.isArray(body.sizes) ? body.sizes
    : (typeof body.sizes === 'string' ? body.sizes.split(',') : []);

  const sizes = [...new Set(
    rawSizes.map((s) => String(s).trim()).filter(Boolean)
  )].slice(0, 12);

  if (!sizes.length) {
    errors.push('دست‌کم یک سایز انتخاب کنید.');
  } else {
    const bad = sizes.filter((s) => !labels?.size?.[s]);
    if (bad.length) errors.push(`سایز «${bad[0]}» معتبر نیست.`);
    else clean.sizes = sizes;
  }

  return { errors, clean };
}

/* ============================================================
   ۷. خواندن درخت دسته‌بندی برای اعتبارسنجی
   ============================================================ */
let _taxCache = null;
let _taxAt = 0;

export function clearTaxCache() {
  _taxCache = null;
  _taxAt = 0;
}

export async function loadTaxonomy(admin) {
  if (_taxCache && Date.now() - _taxAt < CACHE_MS) return _taxCache;

  const [{ data: groups, error: e1 }, { data: items, error: e2 }] = await Promise.all([
    admin.from('tax_groups').select('section_key, key, label').eq('is_active', true).order('sort_order'),
    admin.from('tax_items').select('section_key, group_key, label').eq('is_active', true).order('sort_order'),
  ]);

  if (e1) throw e1;
  if (e2) throw e2;

  const tree = {};
  SECTIONS.forEach((s) => {
    tree[s] = { groups: new Map(), items: new Set() };
  });

  (groups || []).forEach((g) => {
    if (tree[g.section_key]) tree[g.section_key].groups.set(g.key, g.label);
  });

  (items || []).forEach((it) => {
    if (tree[it.section_key]) tree[it.section_key].items.add(normalizeFa(it.label));
  });

  _taxCache = tree;
  _taxAt = Date.now();
  return tree;
}

/* ============================================================
   ۸. تبدیل انتخاب‌ها به ستون‌های پایگاه داده
   ============================================================ */
export function toColumns(clean) {
  const row = {
    section:   clean.section,
    item_type: clean.itemType,
    group_key: clean.groupKey || null,
    sizes:     clean.sizes || [],
  };

  Object.entries(COLUMN_OF).forEach(([g, col]) => {
    row[col] = clean[g] || null;
  });

  /* رنگ اصلی در آرایه‌ی colors هم می‌نشیند تا فیلترهای قدیمی
     که روی این ستون کار می‌کردند نشکنند */
  if (clean.color) row.colors = [clean.color];

  return row;
}

/* ============================================================
   ۹. تحلیل پارامترهای فیلتر مشتری
   ------------------------------------------------------------
   هر مقداری که از نوار نشانی می‌آید بالقوه دستکاری‌شده است.
   اینجا همه‌چیز پاک و محدود می‌شود.
   ============================================================ */
export const SORTS = {
  newest:      { col: 'created_at', asc: false },
  oldest:      { col: 'created_at', asc: true  },
  price_asc:   { col: 'price',      asc: true  },
  price_desc:  { col: 'price',      asc: false },
  rating_desc: { col: 'rating',     asc: false },
  popular:     { col: 'views',      asc: false },
};

export function parseFilters(query) {
  const f = {};

  /* ---------- بخش، سبک، نوع ---------- */
  const section = String(query.section || query.category || '').trim();
  if (SECTIONS.includes(section)) f.section = section;

  const group = String(query.group || '').trim();
  if (group && /^[a-z-]{2,24}$/.test(group)) f.group = group;

  const item = normalizeFa(query.item || query.type);
  if (item && item.length <= 60) f.item = item;

  /* ---------- ویژگی‌ها ---------- */
  Object.keys(COLUMN_OF).forEach((g) => {
    const raw = query[g];
    if (!raw) return;
    /* چند گزینه با کاما: fabric=silk,cotton */
    const list = String(raw).split(',')
      .map((x) => x.trim())
      .filter((x) => /^[a-zA-Z0-9-]{1,24}$/.test(x))
      .slice(0, 12);
    if (list.length) f[g] = list;
  });

  /* ---------- سایز ---------- */
  const sizes = String(query.sizes || query.size || '').split(',')
    .map((s) => s.trim())
    .filter((s) => /^[a-zA-Z0-9]{1,6}$/.test(s))
    .slice(0, 10);
  if (sizes.length) f.sizes = sizes;

  /* ---------- قیمت ---------- */
  const min = intIn(query.minPrice, 0, 1e12);
  const max = intIn(query.maxPrice, 0, 1e12);
  if (min != null) f.minPrice = min;
  if (max != null) f.maxPrice = max;
  /* اگر کاربر بازه را وارونه داده، جایشان عوض می‌شود */
  if (f.minPrice != null && f.maxPrice != null && f.minPrice > f.maxPrice) {
    const t = f.minPrice; f.minPrice = f.maxPrice; f.maxPrice = t;
  }

  /* ---------- امتیاز ---------- */
  const rating = Number(toEnDigits(query.rating));
  if (Number.isFinite(rating) && rating >= 1 && rating <= 5) f.rating = rating;

  /* ---------- موجودی ---------- */
  if (query.inStock === 'true' || query.inStock === '1') f.inStock = true;

  /* ---------- تخفیف‌دار ---------- */
  if (query.onSale === 'true' || query.onSale === '1') f.onSale = true;

  /* ---------- فروشنده ---------- */
  const seller = String(query.seller || '').trim();
  if (/^[0-9a-f-]{36}$/i.test(seller)) f.seller = seller;

  /* ---------- جست‌وجو ---------- */
  const q = normalizeFa(query.search || query.q).slice(0, 80);
  /* نویسه‌های ویژه‌ی PostgREST باید برود، وگرنه پرس‌وجو می‌شکند */
  if (q) f.search = q.replace(/[%,()*\\]/g, ' ').trim();

  /* ---------- مرتب‌سازی ---------- */
  f.sort = SORTS[query.sort] ? query.sort : 'newest';

  return f;
}

/**
 * فیلترها را روی یک پرس‌وجوی Supabase سوار می‌کند.
 * برای هر دو پرس‌وجوی «داده» و «شمارش» یک‌بار صدا زده می‌شود.
 */
export function applyFilters(q, f) {
  if (f.section) q = q.eq('section', f.section);
  if (f.group)   q = q.eq('group_key', f.group);
  if (f.item)    q = q.eq('item_type', f.item);

  Object.entries(COLUMN_OF).forEach(([g, col]) => {
    if (f[g]) q = q.in(col, f[g]);
  });

  /* سایز: کالا باید دست‌کم یکی از سایزهای خواسته‌شده را داشته باشد */
  if (f.sizes) q = q.overlaps('sizes', f.sizes);

  if (f.minPrice != null) q = q.gte('price', f.minPrice);
  if (f.maxPrice != null) q = q.lte('price', f.maxPrice);
  if (f.rating)   q = q.gte('rating', f.rating);
  if (f.inStock)  q = q.gt('stock', 0);
  if (f.onSale)   q = q.not('discount_price', 'is', null);
  if (f.seller)   q = q.eq('seller_id', f.seller);

  if (f.search) {
    const s = `%${f.search}%`;
    q = q.or(`auto_name.ilike.${s},title.ilike.${s},description.ilike.${s},item_type.ilike.${s}`);
  }

  return q;
}
