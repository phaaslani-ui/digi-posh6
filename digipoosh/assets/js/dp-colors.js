/* ============================================================
   دیجی‌پوش — پالت رنگ کالاها
   ------------------------------------------------------------
   رنگ‌ها به شکل دایره‌ی رنگی نشان داده می‌شوند (مثل دیجی‌کالا).
   هر رنگ یک شناسه‌ی ثابت دارد تا داده‌ها بهم نریزد.
   ============================================================ */
'use strict';

(function () {

  /* hex = رنگ نمایشی، hex2 = رنگ دوم برای طرح‌های ترکیبی */
  const COLORS = [
    /* ---------- خنثی ---------- */
    { id: 'black',   name: 'مشکی',        hex: '#1A1A1A' },
    { id: 'white',   name: 'سفید',        hex: '#FFFFFF' },
    { id: 'cream',   name: 'کرم',         hex: '#F2E8D5' },
    { id: 'beige',   name: 'بژ',          hex: '#D9C4A9' },
    { id: 'gray',    name: 'طوسی',        hex: '#9A9A9A' },
    { id: 'darkgray',name: 'خاکستری تیره', hex: '#4A4A4A' },
    { id: 'brown',   name: 'قهوه‌ای',      hex: '#6B4429' },
    { id: 'camel',   name: 'شتری',        hex: '#C19A6B' },
    { id: 'charcoal',name: 'ذغالی',       hex: '#35393D' },
    { id: 'ivory',   name: 'عاجی',        hex: '#F5EFDF' },
    { id: 'offwhite',name: 'سفید شکری',   hex: '#F7F2E9' },
    { id: 'sand',    name: 'شنی',         hex: '#E3D5BC' },
    { id: 'taupe',   name: 'قهوه‌ای خاکستری', hex: '#8E8177' },
    { id: 'greige',  name: 'بژ خاکستری',  hex: '#C4B9AC' },
    { id: 'stone',   name: 'سنگی',        hex: '#B8AC9B' },
    { id: 'caramel', name: 'نسکافه‌ای',    hex: '#A9702F' },
    { id: 'chocolate',name: 'شکلاتی',     hex: '#45291A' },
    { id: 'khaki',   name: 'خاکی',        hex: '#A79768' },
    { id: 'nude',    name: 'بدنی',        hex: '#DEBFA3' },
    { id: 'mushroom',name: 'قارچی',       hex: '#AAA096' },
    { id: 'wheat',   name: 'گندمی',       hex: '#DDCBA4' },

    /* ---------- آبی ---------- */
    { id: 'navy',    name: 'سرمه‌ای',      hex: '#1B2A4A' },
    { id: 'blue',    name: 'آبی',         hex: '#2E6FD9' },
    { id: 'skyblue', name: 'آبی آسمانی',  hex: '#7EC4E8' },
    { id: 'turquoise',name: 'فیروزه‌ای',  hex: '#2BB3AE' },
    { id: 'petrol',  name: 'آبی نفتی',    hex: '#1F4A56' },
    { id: 'midnight',name: 'آبی شب',      hex: '#141B33' },
    { id: 'royalblue',name: 'آبی سلطنتی', hex: '#2542BD' },
    { id: 'cobalt',  name: 'آبی کبالت',   hex: '#1F55D4' },
    { id: 'teal',    name: 'آبی سبز',     hex: '#1F5E5E' },
    { id: 'powderblue',name: 'آبی پودری', hex: '#C4DCE8' },
    { id: 'steelblue',name: 'آبی فولادی', hex: '#6E8299' },
    { id: 'slate',   name: 'آبی خاکستری', hex: '#5E6B7A' },
    { id: 'indigo',  name: 'نیلی',        hex: '#2E2E7A' },
    { id: 'persianblue',name: 'آبی ایرانی', hex: '#1F3FA8' },

    /* ---------- سبز ---------- */
    { id: 'green',   name: 'سبز',         hex: '#3E8E5A' },
    { id: 'olive',   name: 'زیتونی',      hex: '#77813C' },
    { id: 'mint',    name: 'سبز نعنایی',  hex: '#A8DCC0' },
    { id: 'emerald', name: 'سبز زمردی',   hex: '#1F8A5F' },
    { id: 'forest',  name: 'سبز جنگلی',   hex: '#1F4A2E' },
    { id: 'bottle',  name: 'سبز یشمی',    hex: '#17442F' },
    { id: 'sage',    name: 'سبز مریم‌گلی', hex: '#A8B295' },
    { id: 'moss',    name: 'سبز خزه‌ای',   hex: '#5E6B3D' },
    { id: 'darkolive',name: 'سبز ارتشی',  hex: '#4F5426' },
    { id: 'pistachio',name: 'سبز پسته‌ای', hex: '#B5CC7E' },
    { id: 'seafoam', name: 'سبز دریایی',  hex: '#B0DCCC' },
    { id: 'persiangreen',name: 'سبز ایرانی', hex: '#218573' },

    /* ---------- قرمز و صورتی ---------- */
    { id: 'red',     name: 'قرمز',        hex: '#C43B34' },
    { id: 'maroon',  name: 'زرشکی',       hex: '#7B1F2B' },
    { id: 'pink',    name: 'صورتی',       hex: '#EE9AB5' },
    { id: 'rosegold',name: 'رز طلایی',    hex: '#D8A0A0' },
    { id: 'coral',   name: 'مرجانی',      hex: '#F08A70' },
    { id: 'burgundy',name: 'شرابی',       hex: '#5E1A2B' },
    { id: 'cherry',  name: 'آلبالویی',    hex: '#C22348' },
    { id: 'oxblood', name: 'قرمز تیره',   hex: '#4D1A1A' },
    { id: 'brick',   name: 'آجری',        hex: '#9C4A32' },
    { id: 'rust',    name: 'زنگاری',      hex: '#A85B26' },
    { id: 'terracotta',name: 'گلی',       hex: '#C1704F' },
    { id: 'salmon',  name: 'کالباسی',     hex: '#F2A38C' },
    { id: 'peach',   name: 'هلویی',       hex: '#F7C4A0' },
    { id: 'babypink',name: 'صورتی ملایم', hex: '#F7D4DA' },
    { id: 'dustyrose',name: 'صورتی خاکی', hex: '#B58A8A' },
    { id: 'fuchsia', name: 'سرخابی',      hex: '#D6249B' },
    { id: 'raspberry',name: 'تمشکی',      hex: '#B32654' },
    { id: 'pomegranate',name: 'اناری',    hex: '#9E1F35' },
    { id: 'blush',   name: 'صورتی پودری', hex: '#E8CBBF' },

    /* ---------- گرم ---------- */
    { id: 'orange',  name: 'نارنجی',      hex: '#E8842B' },
    { id: 'yellow',  name: 'زرد',         hex: '#F0C948' },
    { id: 'mustard', name: 'خردلی',       hex: '#C9A227' },
    { id: 'tangerine',name: 'نارنجی پررنگ', hex: '#F2701C' },
    { id: 'apricot', name: 'زردآلویی',    hex: '#F5B678' },
    { id: 'amber',   name: 'کهربایی',     hex: '#D99420' },
    { id: 'saffron', name: 'زعفرانی',     hex: '#E8991C' },
    { id: 'honey',   name: 'عسلی',        hex: '#D9A03D' },
    { id: 'lemon',   name: 'زرد لیمویی',  hex: '#F2E063' },
    { id: 'butter',  name: 'زرد کره‌ای',   hex: '#F7E8BC' },
    { id: 'ochre',   name: 'اخرایی',      hex: '#B57A1E' },
    { id: 'cinnamon',name: 'دارچینی',     hex: '#9E5B2E' },

    /* ---------- بنفش ---------- */
    { id: 'purple',  name: 'بنفش',        hex: '#7A4B9E' },
    { id: 'lilac',   name: 'یاسی',        hex: '#C6ADD9' },
    { id: 'violet',  name: 'بنفش روشن',   hex: '#7B4BD4' },
    { id: 'plum',    name: 'آلویی',       hex: '#5E3355' },
    { id: 'eggplant',name: 'بادمجانی',    hex: '#3D2140' },
    { id: 'lavender',name: 'اسطوخودوسی',  hex: '#CFC4E8' },
    { id: 'mauve',   name: 'ارغوانی خاکی', hex: '#A38FA0' },
    { id: 'magenta', name: 'ارغوانی روشن', hex: '#C42A7A' },
    { id: 'orchid',  name: 'ارکیده‌ای',    hex: '#B074B8' },
    { id: 'periwinkle',name: 'بنفش آبی روشن', hex: '#A8AEE8' },

    /* ---------- فلزی و ویژه ---------- */
    { id: 'gold',    name: 'طلایی',       hex: '#C9A84C' },
    { id: 'silver',  name: 'نقره‌ای',      hex: '#C0C0C0' },
    { id: 'bronze',  name: 'برنز',        hex: '#A5722F' },
    { id: 'copper',  name: 'مسی',         hex: '#B5642E' },
    { id: 'champagne',name: 'شامپاینی',   hex: '#E3D2B0' },
    { id: 'gunmetal',name: 'فلزی تیره',   hex: '#4A4F55' },

    /* ---------- طرح‌دار ---------- */
    { id: 'striped', name: 'راه‌راه',      hex: '#FFFFFF', hex2: '#1A1A1A', pattern: 'stripe' },
    { id: 'checked', name: 'چهارخانه',    hex: '#C43B34', hex2: '#1A1A1A', pattern: 'check' },
    { id: 'floral',  name: 'گل‌دار',       hex: '#EE9AB5', hex2: '#3E8E5A', pattern: 'dots' },
    { id: 'denim',   name: 'جین',         hex: '#3C5A87' },
    { id: 'leopard', name: 'پلنگی',       hex: '#C9A227', hex2: '#4A3419', pattern: 'dots' },
    { id: 'multi',   name: 'چندرنگ',      hex: '#EE9AB5', hex2: '#2E6FD9', pattern: 'rainbow' },
  ];

  const byId = {};
  for (const c of COLORS) byId[c.id] = c;

  /* ============================================================
     رنگ‌های سفارشی فروشنده
     ------------------------------------------------------------
     فهرست بالا هرچقدر هم کامل باشد، همیشه فروشنده‌ای هست که
     رنگ کالایش در آن نیست — «آبی نفتی»، «سبز خزه‌ای»،
     «صورتی کالباسی». تا حالا مجبور بود نزدیک‌ترین رنگ را
     انتخاب کند و مشتری چیز دیگری تحویل می‌گرفت.

     حالا خودش رنگ را با نام فارسی و کد رنگ اضافه می‌کند.
     رنگ‌های سفارشی در همان حافظه‌ی سایت می‌مانند و همه‌جا —
     کارت کالا، فیلتر مشتری، نام خودکار — شناخته می‌شوند.
     ============================================================ */
  const CUSTOM_KEY = 'dp_custom_colors';

  /* ============================================================
     رنگ‌های ترکیبی
     ------------------------------------------------------------
     فروشنده گفت می‌خواهد دو رنگ را با هم ترکیب کند — مثلاً
     «قهوه‌ای آبی». پارچه‌ی واقعی همیشه تک‌رنگ نیست:

       · طیف   → رنگ آرام‌آرام از یکی به دیگری می‌رود (ombre)
       · نیمه  → نیم بالا یک رنگ، نیم پایین رنگ دیگر
       · راه‌راه → نوارهای موازی
       · نقطه   → زمینه‌ی یک رنگ با خال‌های رنگ دوم
       · آمیخته → دو رنگ واقعاً با هم مخلوط می‌شوند و رنگ
                  سومی می‌سازند (مثل ترکیب رنگ نقاشی)

     «آمیخته» با بقیه فرق دارد: خروجی‌اش یک رنگ تخت است، نه
     طرح. برای وقتی که پارچه واقعاً رنگ میانی است.
     ============================================================ */
  const MIXES = ['gradient', 'half', 'stripe2', 'dots2', 'blend'];

  const MIX_FA = {
    gradient: 'طیف نرم',
    half:     'نصف‌نصف',
    stripe2:  'راه‌راه',
    dots2:    'خال‌دار',
    blend:    'آمیخته',
  };

  /** ترکیب واقعی دو رنگ — میانگین در فضای sRGB */
  function mixHex(a, b, ratio) {
    const t = typeof ratio === 'number' ? Math.min(1, Math.max(0, ratio)) : 0.5;
    const pa = hexToRgb(a), pb = hexToRgb(b);
    if (!pa || !pb) return a || b || '#cccccc';
    const ch = function (x, y) {
      return Math.round(Math.sqrt((1 - t) * x * x + t * y * y));
    };
    return rgbToHex(ch(pa[0], pb[0]), ch(pa[1], pb[1]), ch(pa[2], pb[2]));
  }

  function hexToRgb(h) {
    const m = String(h || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
    return [parseInt(m.slice(0, 2), 16),
            parseInt(m.slice(2, 4), 16),
            parseInt(m.slice(4, 6), 16)];
  }

  function rgbToHex(r, g, b) {
    const p = function (n) {
      return Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
    };
    return '#' + p(r) + p(g) + p(b);
  }

  /** خواندن رنگ‌های سفارشی از حافظه */
  function readCustom() {
    var v;
    try { v = JSON.parse(localStorage.getItem(CUSTOM_KEY)); } catch (e) { /* بی‌اهمیت */ }
    if (!Array.isArray(v)) return [];
    return v.filter(function (c) {
      if (!c || typeof c !== 'object') return false;
      if (typeof c.id !== 'string' || c.id.indexOf('c:') !== 0) return false;
      if (typeof c.name !== 'string' || !c.name.trim()) return false;
      if (!/^#[0-9a-fA-F]{6}$/.test(c.hex || '')) return false;

      /* رنگ ترکیبی: رنگ دوم هم باید معتبر باشد، وگرنه
         دایره‌ی رنگ خراب می‌شود و `background` رشته‌ی
         بی‌معنا می‌سازد */
      if (c.hex2 != null && !/^#[0-9a-fA-F]{6}$/.test(c.hex2)) return false;
      if (c.mix != null && MIXES.indexOf(c.mix) < 0) return false;

      return true;
    });
  }

  let custom = readCustom();
  custom.forEach(function (c) { byId[c.id] = c; });

  /** همه‌ی رنگ‌ها — پایه + سفارشی */
  function all() {
    return COLORS.concat(custom);
  }

  /** نام تمیزشده — برای مقایسه و پرهیز از تکرار */
  function slugName(s) {
    return String(s || '')
      .replace(/[\u064A]/g, 'ی').replace(/[\u0643]/g, 'ک')
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/\s+/g, ' ')
      .trim().toLowerCase();
  }

  /**
   * افزودن رنگ سفارشی.
   * خروجی: { ok, color } یا { ok:false, error }
   */
  function addCustom(name, hex, opt) {
    opt = opt || {};
    const nm = String(name || '').trim().slice(0, 24);
    const hx = String(hex || '').trim().toLowerCase();

    if (nm.length < 2) {
      return { ok: false, error: 'نام رنگ را بنویسید (دست‌کم دو حرف).' };
    }
    if (!/^#[0-9a-f]{6}$/.test(hx)) {
      return { ok: false, error: 'کد رنگ معتبر نیست.' };
    }
    if (custom.length >= 24) {
      return { ok: false, error: 'بیشتر از ۲۴ رنگ سفارشی نمی‌شود ساخت.' };
    }

    /* نام تکراری — چه در فهرست پایه، چه در سفارشی‌ها */
    const key = slugName(nm);
    const clash = all().find(function (c) { return slugName(c.name) === key; });
    if (clash) {
      return { ok: false, error: 'رنگی با نام «' + clash.name + '» از قبل هست.' };
    }

    const c = { id: 'c:' + key.replace(/\s+/g, '-'), name: nm, hex: hx, custom: true };

    /* ---------- رنگ ترکیبی ---------- */
    const hx2 = String(opt.hex2 || '').trim().toLowerCase();
    if (hx2) {
      if (!/^#[0-9a-f]{6}$/.test(hx2)) {
        return { ok: false, error: 'کد رنگ دوم معتبر نیست.' };
      }
      if (hx2 === hx) {
        return { ok: false, error: 'دو رنگ یکسان‌اند — رنگ دوم را عوض کنید.' };
      }

      const mix = MIXES.indexOf(opt.mix) > -1 ? opt.mix : 'gradient';

      if (mix === 'blend') {
        /* آمیخته: خروجی یک رنگ تخت است، پس رنگ دوم را
           نگه نمی‌داریم — ولی یادداشت می‌کنیم از کجا آمده،
           تا بعداً بشود ویرایشش کرد. */
        c.hex = mixHex(hx, hx2, Number(opt.ratio) || 0.5);
        c.from = [hx, hx2];
        c.mix = 'blend';
      } else {
        c.hex2 = hx2;
        c.mix = mix;
      }
    }

    custom.push(c);
    byId[c.id] = c;

    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)); } catch (e) { /* بی‌اهمیت */ }
    document.dispatchEvent(new CustomEvent('dp:colors', { detail: { added: c } }));

    return { ok: true, color: c };
  }

  /** حذف رنگ سفارشی */
  function removeCustom(id) {
    const i = custom.findIndex(function (c) { return c.id === id; });
    if (i < 0) return false;
    delete byId[id];
    custom.splice(i, 1);
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)); } catch (e) { /* بی‌اهمیت */ }
    document.dispatchEvent(new CustomEvent('dp:colors', { detail: { removed: id } }));
    return true;
  }

  /** فهرست رنگ‌های سفارشی */
  function customList() { return custom.slice(); }

  /** آیا رنگ روشن است؟ — برای انتخاب رنگ تیک روی دایره */
  function isLight(c) {
    const h = String((c && c.hex) || '').replace('#', '');
    if (h.length !== 6) return false;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 175;
  }

  /** پیدا کردن رنگ با شناسه یا نام فارسی (برای داده‌های قدیمی) */
  function find(key) {
    if (!key) return null;
    const k = String(key).trim();
    if (byId[k]) return byId[k];
    const nk = slugName(k);
    return all().find(function (c) { return slugName(c.name) === nk; }) || null;
  }

  /* اگر پنجره‌ی دیگری رنگ ساخت، اینجا هم به‌روز شود */
  window.addEventListener('storage', function (e) {
    if (e.key !== CUSTOM_KEY) return;
    custom.forEach(function (c) { delete byId[c.id]; });
    custom = readCustom();
    custom.forEach(function (c) { byId[c.id] = c; });
    document.dispatchEvent(new CustomEvent('dp:colors', { detail: { synced: true } }));
  });

  /** پس‌زمینه‌ی دایره — برای رنگ‌های ساده و طرح‌دار */
  function background(c) {
    if (!c) return '#ccc';

    /* ---------- رنگ‌های ترکیبی فروشنده ---------- */
    if (c.mix && c.hex2) {
      if (c.mix === 'gradient') {
        return 'linear-gradient(135deg, ' + c.hex + ' 0%, ' + c.hex2 + ' 100%)';
      }
      if (c.mix === 'half') {
        return 'linear-gradient(180deg, ' + c.hex + ' 0 50%, ' + c.hex2 + ' 50% 100%)';
      }
      if (c.mix === 'stripe2') {
        return 'repeating-linear-gradient(45deg, ' + c.hex + ' 0 5px, '
             + c.hex2 + ' 5px 10px)';
      }
      if (c.mix === 'dots2') {
        return 'radial-gradient(circle at 32% 30%, ' + c.hex2 + ' 20%, transparent 21%),'
             + 'radial-gradient(circle at 72% 68%, ' + c.hex2 + ' 20%, transparent 21%),'
             + 'radial-gradient(circle at 50% 88%, ' + c.hex2 + ' 14%, transparent 15%),'
             + c.hex;
      }
    }

    if (c.pattern === 'stripe') {
      return `repeating-linear-gradient(45deg, ${c.hex} 0 4px, ${c.hex2} 4px 8px)`;
    }
    if (c.pattern === 'check') {
      return `repeating-linear-gradient(0deg, ${c.hex} 0 4px, ${c.hex2} 4px 8px),
              repeating-linear-gradient(90deg, ${c.hex}80 0 4px, ${c.hex2}80 4px 8px)`;
    }
    if (c.pattern === 'dots') {
      return `radial-gradient(circle at 30% 30%, ${c.hex2} 22%, transparent 23%),
              radial-gradient(circle at 70% 70%, ${c.hex2} 22%, transparent 23%), ${c.hex}`;
    }
    if (c.pattern === 'rainbow') {
      return 'conic-gradient(#C43B34, #E8842B, #F0C948, #3E8E5A, #2E6FD9, #7A4B9E, #C43B34)';
    }
    return c.hex;
  }

  /** یک حباب رنگ فقط برای نمایش */
  function bubble(key, size = 26) {
    const c = find(key);
    if (!c) return '';
    return `<span class="dp-color" style="--bg:${background(c)};--sz:${size}px"
                  title="${c.name}" aria-label="${c.name}"></span>`;
  }

  /** ردیف حباب‌های رنگ + نام‌ها */
  function bubbles(list, size = 26) {
    const arr = (list || []).map(find).filter(Boolean);
    if (!arr.length) return '';
    return `<span class="dp-colors">${
      arr.map((c) => bubble(c.id, size)).join('')}</span>`;
  }

  /** نام‌های فارسی — برای متن‌های ساده */
  function names(list) {
    return (list || []).map((k) => find(k)?.name).filter(Boolean).join('، ');
  }

  window.DPColors = {
    COLORS, find, background, bubble, bubbles, names,
    all, addCustom, removeCustom, customList, isLight, slugName,
    MIXES, MIX_FA, mixHex, hexToRgb, rgbToHex,
  };
})();
