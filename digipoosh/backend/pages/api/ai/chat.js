/**
 * POST /api/chat — مشاوره‌ی سبک
 * ------------------------------------------------------------
 * ⚠️ صادقانه: این یک مدل زبانی نیست. یک موتور تشخیص قصد است
 * که از داده‌ی واقعی سایت جواب می‌سازد. اگر روزی مدل زبانی
 * وصل شد، فقط تابع `respond` عوض می‌شود.
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { withSafety } from '../../../lib/safety';
import { getUser } from '../../../lib/auth';
import { OCCASION_FORMAL } from '../../../lib/digiai';

/** قصد پرسش را تشخیص می‌دهد */
function detectIntent(q) {
  const s = String(q || '');
  if (/سایز|اندازه|قد |دور سینه|دور کمر/.test(s)) return 'size';
  if (/رنگ|طلایی|مشکی|سرمه|کرم|قرمز|آبی|سبز|بنفش|صورتی/.test(s)) return 'color';
  if (/عروسی|مهمانی|مجلس|اداری|کار|ورزش|روزمره|قرار/.test(s)) return 'occasion';
  if (/جنس|پارچه|نخ|کتان|ابریشم|پشم|چرم|جین|مخمل/.test(s)) return 'fabric';
  if (/چه بپوشم|چی بپوشم|ست کنم|ست چی|با چی/.test(s)) return 'outfit';
  return 'unknown';
}

const FABRIC = {
  'نخ': { season: 'بهار و تابستان', care: 'شست‌وشوی آسان، ممکن است کمی آب برود' },
  'کتان': { season: 'تابستان', care: 'خنک اما زود چروک می‌شود' },
  'ابریشم': { season: 'همه‌ی فصل‌ها', care: 'خشک‌شویی — درخشش مجلسی' },
  'پشم': { season: 'پاییز و زمستان', care: 'گرم و ماندگار، شست‌وشوی ملایم' },
  'چرم': { season: 'پاییز و زمستان', care: 'با زمان قشنگ‌تر می‌شود' },
  'جین': { season: 'همه‌ی فصل‌ها', care: 'هرچه کمتر بشویید، بهتر می‌ماند' },
  'مخمل': { season: 'پاییز و زمستان', care: 'بافت مجلسی — با ساده‌ها ست کنید' },
};

const SIZE = {
  XS: { eu: '۳۴', chest: '۸۰–۸۴', waist: '۶۲–۶۶' },
  S:  { eu: '۳۶', chest: '۸۵–۸۹', waist: '۶۷–۷۱' },
  M:  { eu: '۳۸', chest: '۹۰–۹۴', waist: '۷۲–۷۶' },
  L:  { eu: '۴۰', chest: '۹۵–۹۹', waist: '۷۷–۸۲' },
  XL: { eu: '۴۲', chest: '۱۰۰–۱۰۶', waist: '۸۳–۸۹' },
  XXL:{ eu: '۴۴', chest: '۱۰۷–۱۱۴', waist: '۹۰–۹۷' },
};

async function respond(q, intent) {
  /* ---------- سایز ---------- */
  if (intent === 'size') {
    const m = String(q).match(/\b(XS|S|M|L|XL|XXL)\b/i);
    if (m) {
      const k = m[1].toUpperCase();
      const s = SIZE[k];
      if (s) {
        return {
          answer: `سایز ${k} — معادل اروپا ${s.eu}، دور سینه ${s.chest} سانت، `
            + `دور کمر ${s.waist} سانت. هر برند کمی فرق دارد؛ جدول سایز همان فروشگاه را هم ببینید.`,
          productIds: [],
        };
      }
    }
    return {
      answer: 'کدام سایز؟ XS تا XXL را می‌شناسم. مثلاً بپرسید «سایز M یعنی چند؟»',
      productIds: [],
    };
  }

  /* ---------- جنس ---------- */
  if (intent === 'fabric') {
    for (const [name, info] of Object.entries(FABRIC)) {
      if (String(q).includes(name)) {
        return {
          answer: `${name} — فصل مناسب: ${info.season}. نکته: ${info.care}`,
          productIds: [],
        };
      }
    }
  }

  /* ---------- مناسبت ---------- */
  if (intent === 'occasion') {
    let occ = 'daily', name = 'روزمره';
    const s = String(q);
    if (/عروسی/.test(s)) { occ = 'wedding'; name = 'عروسی'; }
    else if (/مهمانی|مجلس|شب/.test(s)) { occ = 'party'; name = 'مهمانی'; }
    else if (/اداری|کار|شرکت|جلسه/.test(s)) { occ = 'business'; name = 'اداری'; }
    else if (/ورزش|باشگاه/.test(s)) { occ = 'sporty'; name = 'ورزش'; }

    const lvl = OCCASION_FORMAL[occ] ?? 2;

    const { data } = await supabaseAdmin
      .from('products')
      .select('id,name,price')
      .eq('status', 'active')
      .gt('stock', 0)
      .limit(5);

    return {
      answer: `برای ${name} سطح رسمیت حدود ${lvl} از ۵ مناسب است. `
        + `چند کالای موجود را برایتان آورده‌ام — یکی را در بخش «ساخت تیپ» `
        + `انتخاب کنید تا ست کاملش را بسازم.`,
      productIds: (data || []).map((p) => p.id),
    };
  }

  /* ---------- ست ---------- */
  if (intent === 'outfit') {
    return {
      answer: 'برای اینکه دقیق راهنمایی کنم، کالا را در بخش «ساخت تیپ» انتخاب کنید. '
        + 'آنجا سه تیپ کامل با دلیل هر انتخاب می‌سازم.',
      productIds: [],
    };
  }

  /* ---------- رنگ ---------- */
  if (intent === 'color') {
    return {
      answer: 'درباره‌ی رنگ در صفحه‌ی دیجی AI دقیق‌تر جواب می‌دهم، '
        + 'چون دانشنامه‌ی ۱۱۶ رنگی آنجا در دسترس است.',
      productIds: [],
    };
  }

  return {
    answer: 'این را نفهمیدم. درباره‌ی رنگ، سایز، مناسبت یا جنس پارچه بپرسید. '
      + 'راستش را بخواهید من یک مدل زبانی نیستم؛ یک موتور قاعده‌محورم '
      + 'که از کالاهای همین سایت جواب می‌دهد.',
    productIds: [],
  };
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['POST', 'GET'])) return;

  const user = await getUser(req).catch(() => null);

  /* ---------- تاریخچه ---------- */
  if (req.method === 'GET') {
    if (!user) return ok(res, { history: [] });
    const { data } = await supabaseAdmin
      .from('ai_chat')
      .select('question,answer,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    return ok(res, { history: (data || []).reverse() });
  }

  const q = String(req.body?.message || '').trim().slice(0, 400);
  if (q.length < 2) return fail(res, 'پرسش خیلی کوتاه است.', 400);

  const intent = detectIntent(q);
  const r = await respond(q, intent);

  if (user) {
    await supabaseAdmin.from('ai_chat').insert({
      user_id: user.id,
      session_id: String(req.body?.sessionId || '').slice(0, 100) || null,
      question: q,
      answer: r.answer,
      intent,
      product_ids: r.productIds,
    }).catch(() => { /* ثبت تاریخچه نباید پاسخ را بشکند */ });
  }

  return ok(res, { answer: r.answer, intent, productIds: r.productIds });
}

export default withSafety(handler);
