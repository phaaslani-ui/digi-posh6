/**
 * GET  /api/style/quiz     — پرسش‌های آزمون سبک
 * POST /api/style/quiz     — ثبت پاسخ‌ها و ساخت پروفایل
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { ok, fail, methodGuard, cors } from '../../../lib/helpers';
import { dbFail } from '../../../lib/guard';
import { withSafety } from '../../../lib/safety';
import { requireAuth } from '../../../lib/auth';

const QUESTIONS = [
  {
    id: 'occasion',
    q: 'بیشتر برای چه موقعیتی لباس می‌خرید؟',
    options: [
      { v: 'daily', t: 'روزمره و بیرون رفتن' },
      { v: 'business', t: 'محل کار و جلسه' },
      { v: 'party', t: 'مهمانی و مراسم' },
      { v: 'casual', t: 'دورهمی با دوستان' },
    ],
  },
  {
    id: 'style',
    q: 'کدام توصیف به سبک شما نزدیک‌تر است؟',
    options: [
      { v: 'classic', t: 'ساده و کلاسیک' },
      { v: 'modern', t: 'مدرن و مینیمال' },
      { v: 'elegant', t: 'شیک و پرجزئیات' },
      { v: 'casual', t: 'راحت و بی‌تکلف' },
    ],
  },
  {
    id: 'palette',
    q: 'معمولاً به چه رنگ‌هایی کشیده می‌شوید؟',
    options: [
      { v: 'neutral', t: 'خنثی — مشکی، سفید، بژ، سرمه‌ای' },
      { v: 'warm', t: 'گرم — قهوه‌ای، شتری، زرشکی' },
      { v: 'cool', t: 'سرد — آبی، سبز، طوسی' },
      { v: 'bold', t: 'پرشدت — رنگ‌های زنده' },
    ],
  },
  {
    id: 'fabric',
    q: 'کدام جنس را بیشتر می‌پسندید؟',
    options: [
      { v: 'cotton', t: 'نخ و کتان' },
      { v: 'wool', t: 'پشم و بافت' },
      { v: 'silk', t: 'ابریشم و ساتن' },
      { v: 'denim', t: 'جین' },
    ],
  },
  {
    id: 'budget',
    q: 'معمولاً برای یک قطعه چقدر هزینه می‌کنید؟',
    options: [
      { v: 'low', t: 'تا ۱٫۵ میلیون' },
      { v: 'medium', t: 'تا ۵ میلیون' },
      { v: 'high', t: 'تا ۱۵ میلیون' },
      { v: 'luxury', t: 'محدودیتی ندارم' },
    ],
  },
];

/** فقط گزینه‌های معتبر پذیرفته می‌شوند */
function validate(answers) {
  const out = {};
  for (const q of QUESTIONS) {
    const v = answers?.[q.id];
    if (typeof v !== 'string') continue;
    if (q.options.some((o) => o.v === v)) out[q.id] = v;
  }
  return out;
}

async function handler(req, res) {
  if (cors(req, res)) return;
  if (methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    return ok(res, { questions: QUESTIONS, count: QUESTIONS.length });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const clean = validate(req.body?.answers);
  if (!Object.keys(clean).length) {
    return fail(res, 'پاسخی دریافت نشد.', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('style_profiles')
    .upsert({
      user_id: user.id,
      ...clean,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return dbFail(res, error, 'ذخیره‌ی پروفایل انجام نشد.');

  return ok(res, { profile: data, message: 'پروفایل سبک شما ساخته شد.' });
}

export default withSafety(handler);
