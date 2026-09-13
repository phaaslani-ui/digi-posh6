# -*- coding: utf-8 -*-
"""دیجی‌پوش — صفحه‌ی ثبت‌نام فروشندگان (چهار مرحله)"""

import os

OUT = os.path.dirname(os.path.abspath(__file__))
SW = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"'

I = {
 'user':   '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'store':  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'doc':    '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M8.5 13h7M8.5 16.5h4"/>',
 'check':  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'dress':  '<path d="M9 3.5h6l-1.2 3.2 3.7 4.1-1.5 2.2v7.5H8v-7.5L6.5 10.8l3.7-4.1z"/>',
 'suit':   '<path d="M8 3.5 12 7l4-3.5 4 2.2v14.8H4V5.7z"/><path d="M12 7v13.5"/>',
 'kid':    '<circle cx="12" cy="6.5" r="2.8"/><path d="M12 9.3v6M8 12h8M9.5 20.5 12 15.3l2.5 5.2"/>',
 'teen':   '<path d="M7.6 8h8.8a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.3l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.6 8Z"/>',
 'bag':    '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
 'clock':  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'mail':   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
 'shield': '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
}


def svg(n, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{I[n]}</svg>'


CATS = [
    ('women', 'dress', 'پوشاک زنانه', 'مانتو، مجلسی، روزمره'),
    ('men',   'suit',  'پوشاک مردانه', 'کت و شلوار، پیراهن'),
    ('kids',  'kid',   'پوشاک کودک',   'نوزاد تا ۱۲ سال'),
    ('teen',  'teen',  'پوشاک نوجوان', 'استریت‌ویر و ترند'),
]

picks = '\n'.join(f'''            <button class="pick" type="button" data-cat="{k}">
              {svg(ic)}
              <div><strong>{t}</strong><span>{d}</span></div>
              <span class="pick-check">{svg('check', 'ico ico-sm')}</span>
            </button>''' for k, ic, t, d in CATS)

html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="ثبت‌نام فروشندگان دیجی‌پوش — فروشگاه خود را در بازارگاه لوکس مد ایران راه بیندازید." />
  <meta name="theme-color" content="#f5f0e8" />
  <title>دیجی‌پوش | ثبت‌نام فروشندگان</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/seller-style.css" />
</head>
<body class="login-page">

<main class="signup-card">
  <div class="login-brand">
    <div class="mark">د</div>
    <h1>ثبت‌نام فروشندگان</h1>
    <p>فروشگاه خود را در دیجی‌پوش راه بیندازید</p>
  </div>

  <!-- نوار مراحل -->
  <div class="steps-bar" id="stepsBar">
    <div class="step-item active" data-step="1">
      <span class="step-dot">۱</span><span class="step-name">اطلاعات شخصی</span>
    </div>
    <div class="step-item" data-step="2">
      <span class="step-dot">۲</span><span class="step-name">فروشگاه</span>
    </div>
    <div class="step-item" data-step="3">
      <span class="step-dot">۳</span><span class="step-name">اطلاعات مالی</span>
    </div>
    <div class="step-item" data-step="4">
      <span class="step-dot">۴</span><span class="step-name">تأیید</span>
    </div>
  </div>

  <form id="signupForm" novalidate>

    <!-- ============ مرحله ۱ ============ -->
    <section class="step-panel on" data-panel="1">
      <h2 class="panel-title">اطلاعات شخصی</h2>
      <p class="panel-hint">این اطلاعات برای ساخت حساب کاربری شما استفاده می‌شود.</p>

      <div class="form-grid">
        <div class="field">
          <label for="fullName">نام و نام خانوادگی <span class="req">*</span></label>
          <input class="input" id="fullName" data-rules="required" placeholder="مثلاً: رضا محمدی" autocomplete="name" />
          <span class="err-msg"></span>
        </div>

        <div class="field">
          <label for="phone">شماره موبایل <span class="req">*</span></label>
          <input class="input" id="phone" inputmode="tel" data-rules="required|phone"
                 placeholder="۰۹۱۲۳۴۵۶۷۸۹" autocomplete="tel" />
          <span class="err-msg"></span>
        </div>

        <div class="field full">
          <label for="email">ایمیل <span class="req">*</span></label>
          <input class="input" id="email" type="email" data-rules="required|email"
                 placeholder="you@example.com" autocomplete="email" />
          <span class="err-msg"></span>
        </div>

        <div class="field">
          <label for="pass">رمز عبور <span class="req">*</span></label>
          <input class="input" id="pass" type="password" data-rules="required|min6"
                 placeholder="حداقل ۶ کاراکتر" autocomplete="new-password" />
          <div class="pw-meter" id="pwMeter"><i></i><i></i><i></i><i></i></div>
          <span class="pw-label" id="pwLabel">قدرت رمز</span>
          <span class="err-msg"></span>
        </div>

        <div class="field">
          <label for="pass2">تکرار رمز عبور <span class="req">*</span></label>
          <input class="input" id="pass2" type="password" data-rules="required"
                 placeholder="رمز را دوباره وارد کنید" autocomplete="new-password" />
          <span class="err-msg"></span>
        </div>
      </div>
    </section>

    <!-- ============ مرحله ۲ ============ -->
    <section class="step-panel" data-panel="2">
      <h2 class="panel-title">اطلاعات فروشگاه</h2>
      <p class="panel-hint">نام فروشگاه شما در ویترین دیجی‌پوش نمایش داده می‌شود.</p>

      <div class="form-grid">
        <div class="field full">
          <label for="shopName">نام فروشگاه <span class="req">*</span></label>
          <input class="input" id="shopName" data-rules="required" placeholder="مثلاً: بوتیک ماه‌رخ" />
          <span class="err-msg"></span>
        </div>

        <div class="field full">
          <label>دسته‌بندی اصلی <span class="req">*</span></label>
          <div class="pick-grid" id="catGrid">
{picks}
          </div>
          <input type="hidden" id="category" data-rules="required" />
          <span class="err-msg">لطفاً یک دسته‌بندی انتخاب کنید.</span>
        </div>

        <div class="field">
          <label for="city">شهر <span class="req">*</span></label>
          <select class="select" id="city" data-rules="required">
            <option value="">انتخاب کنید</option>
            <option>تهران</option><option>اصفهان</option><option>شیراز</option>
            <option>مشهد</option><option>تبریز</option><option>کرج</option>
            <option>یزد</option><option>رشت</option><option>اهواز</option>
            <option>قم</option><option>کرمان</option><option>سایر</option>
          </select>
          <span class="err-msg"></span>
        </div>

        <div class="field">
          <label for="shopPhone">تلفن فروشگاه</label>
          <input class="input" id="shopPhone" inputmode="tel" placeholder="۰۲۱-۱۲۳۴۵۶۷۸" />
        </div>

        <div class="field full">
          <label for="address">نشانی فروشگاه</label>
          <input class="input" id="address" placeholder="خیابان، کوچه، پلاک" />
        </div>

        <div class="field full">
          <label for="shopDesc">معرفی کوتاه <span class="hint">— در صفحه‌ی فروشگاه دیده می‌شود</span></label>
          <textarea class="textarea" id="shopDesc"
                    placeholder="چه چیزی می‌فروشید و چه چیزی فروشگاه شما را متفاوت می‌کند؟"></textarea>
        </div>
      </div>
    </section>

    <!-- ============ مرحله ۳ ============ -->
    <section class="step-panel" data-panel="3">
      <h2 class="panel-title">اطلاعات مالی و هویتی</h2>
      <p class="panel-hint">برای واریز درآمد فروش و احراز هویت لازم است.</p>

      <div class="form-grid">
        <div class="field">
          <label for="nationalId">کد ملی <span class="req">*</span></label>
          <input class="input" id="nationalId" inputmode="numeric" data-rules="required|nationalId"
                 placeholder="۰۰۱۲۳۴۵۶۷۸" />
          <span class="err-msg"></span>
        </div>

        <div class="field">
          <label for="birthDate">تاریخ تولد</label>
          <input class="input" id="birthDate" placeholder="۱۳۷۰/۰۵/۱۲" />
        </div>

        <div class="field full">
          <label for="shaba">شماره شبا <span class="req">*</span></label>
          <input class="input" id="shaba" data-rules="required|shaba"
                 placeholder="IR۰۶۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰" />
          <span class="hint">۲۴ رقم پس از IR — حساب باید به نام خودتان باشد.</span>
          <span class="err-msg"></span>
        </div>

        <div class="field full">
          <label for="bankName">نام بانک</label>
          <select class="select" id="bankName">
            <option value="">انتخاب کنید</option>
            <option>ملت</option><option>ملی</option><option>صادرات</option>
            <option>تجارت</option><option>سامان</option><option>پاسارگاد</option>
            <option>پارسیان</option><option>سپه</option><option>رفاه</option>
            <option>آینده</option><option>سایر</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:11px;align-items:flex-start;padding:14px;border-radius:11px;
                  background:rgba(33,150,243,.07);border:1px solid rgba(33,150,243,.2);margin-top:16px">
        {svg('shield', 'ico')}
        <div style="font-size:12.5px;line-height:1.9;color:var(--gray)">
          <strong style="color:var(--ink)">اطلاعات شما محفوظ است.</strong><br />
          کد ملی و شماره شبا فقط برای احراز هویت و واریز درآمد استفاده می‌شوند
          و در اختیار هیچ شخص ثالثی قرار نمی‌گیرند.
        </div>
      </div>
    </section>

    <!-- ============ مرحله ۴ ============ -->
    <section class="step-panel" data-panel="4">
      <h2 class="panel-title">بازبینی و تأیید</h2>
      <p class="panel-hint">اطلاعات واردشده را بررسی کنید و قوانین را بپذیرید.</p>

      <div id="reviewBox" style="margin-bottom:18px"></div>

      <div class="terms-box">
        <strong>قوانین همکاری با دیجی‌پوش</strong>
        <ul style="margin-top:8px;display:grid;gap:4px">
          <li>کمیسیون پلتفرم <strong>۱۰٪</strong> از مبلغ هر فروش موفق است.</li>
          <li>تسویه‌ی درآمد پس از تأیید تحویل کالا و به‌صورت هفتگی انجام می‌شود.</li>
          <li>تصاویر محصولات باید واقعی و متعلق به خود فروشنده باشند.</li>
          <li>جدول سایز باید با اندازه‌گیری واقعی روی لباس ثبت شود.</li>
          <li>پاسخ‌گویی به پیام خریداران حداکثر ظرف ۲۴ ساعت الزامی است.</li>
          <li>فروش کالای تقلبی یا غیراصل، به تعلیق دائم فروشگاه می‌انجامد.</li>
          <li>خریدار تا ۷ روز حق بازگشت کالا را دارد.</li>
        </ul>
      </div>

      <div class="field">
        <label class="checkbox">
          <input type="checkbox" id="agree" />
          <span>قوانین همکاری و شرایط استفاده را خوانده‌ام و می‌پذیرم.</span>
        </label>
        <span class="err-msg" id="agreeErr">پذیرش قوانین الزامی است.</span>
      </div>
    </section>

    <!-- ============ موفقیت ============ -->
    <section class="step-panel" data-panel="5">
      <div class="success-box">
        <div class="success-mark">{svg('check', 'ico ico-lg')}</div>
        <h2>درخواست شما ثبت شد</h2>
        <p>فروشگاه <strong id="doneShop">شما</strong> در صف بررسی قرار گرفت.</p>

        <ul class="next-steps">
          <li>{svg('mail', 'ico ico-sm')}
            <span>یک ایمیل تأیید به نشانی <strong id="doneEmail"></strong> فرستادیم.</span></li>
          <li>{svg('clock', 'ico ico-sm')}
            <span>بررسی درخواست معمولاً <strong>۲۴ تا ۴۸ ساعت</strong> کاری طول می‌کشد.</span></li>
          <li>{svg('store', 'ico ico-sm')}
            <span>پس از تأیید، می‌توانید وارد پنل شوید و محصولاتتان را اضافه کنید.</span></li>
          <li>{svg('shield', 'ico ico-sm')}
            <span>کارشناس ما ممکن است برای احراز هویت با شما تماس بگیرد.</span></li>
        </ul>

        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <a class="btn btn-primary" href="seller-login.html">ورود به پنل</a>
          <a class="btn btn-secondary" href="../index.html">بازگشت به سایت</a>
        </div>
      </div>
    </section>

    <!-- دکمه‌های ناوبری -->
    <div class="signup-foot" id="navBtns">
      <button class="btn btn-secondary" type="button" id="prevBtn" style="display:none">مرحله‌ی قبل</button>
      <span class="grow"></span>
      <button class="btn btn-primary" type="button" id="nextBtn">مرحله‌ی بعد</button>
      <button class="btn btn-primary" type="submit" id="submitBtn" style="display:none">
        <span class="spinner"></span><span class="btn-label">ثبت درخواست</span>
      </button>
    </div>
  </form>

  <div class="login-foot">
    قبلاً ثبت‌نام کرده‌اید؟
    <a class="link-gold" href="seller-login.html">وارد شوید</a>
    <div style="margin-top:10px">
      <a class="link-gold" href="../index.html">&larr; بازگشت به دیجی‌پوش</a>
    </div>
  </div>
</main>

<div class="toast-wrap"></div>

<script src="js/seller-script.js"></script>
<script>
(function () {{
  const form = document.getElementById('signupForm');
  let step = 1;
  const LAST = 4;   // مرحله‌ی ۵ صفحه‌ی موفقیت است

  /* ---------- اعتبارسنجی‌های اختصاصی ---------- */
  VALIDATORS.nationalId = (v) => {{
    const d = toEn(v).replace(/\\D/g, '');
    return d.length === 10 ? null : 'کد ملی باید ۱۰ رقم باشد.';
  }};

  VALIDATORS.shaba = (v) => {{
    const s = toEn(v).replace(/[\\s-]/g, '').toUpperCase();
    return /^IR\\d{{24}}$/.test(s) ? null : 'شبا باید با IR و ۲۴ رقم باشد.';
  }};

  initValidation(form);

  /* ---------- سنجش قدرت رمز ---------- */
  const meter = document.getElementById('pwMeter');
  const pwLabel = document.getElementById('pwLabel');
  const LABELS = ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'قوی'];

  document.getElementById('pass').addEventListener('input', (e) => {{
    const v = e.target.value;
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\\d/.test(v) && /[^\\w]/.test(v)) s++;
    meter.className = 'pw-meter' + (v ? ' w' + s : '');
    pwLabel.textContent = v ? 'قدرت رمز: ' + LABELS[s] : 'قدرت رمز';
  }});

  /* ---------- انتخاب دسته‌بندی ---------- */
  document.getElementById('catGrid').addEventListener('click', (e) => {{
    const btn = e.target.closest('.pick');
    if (!btn) return;
    document.querySelectorAll('.pick').forEach((p) => p.classList.remove('on'));
    btn.classList.add('on');
    document.getElementById('category').value = btn.dataset.cat;
    document.getElementById('category').closest('.field').classList.remove('invalid');
  }});

  /* ---------- جابه‌جایی بین مراحل ---------- */
  function show(n) {{
    document.querySelectorAll('.step-panel').forEach((p) =>
      p.classList.toggle('on', +p.dataset.panel === n));

    document.querySelectorAll('.step-item').forEach((it) => {{
      const s = +it.dataset.step;
      it.classList.toggle('active', s === n);
      it.classList.toggle('done', s < n);
    }});

    document.getElementById('prevBtn').style.display   = n > 1 && n <= LAST ? '' : 'none';
    document.getElementById('nextBtn').style.display   = n < LAST ? '' : 'none';
    document.getElementById('submitBtn').style.display = n === LAST ? '' : 'none';
    document.getElementById('navBtns').style.display   = n > LAST ? 'none' : '';
    document.getElementById('stepsBar').style.display  = n > LAST ? 'none' : '';

    window.scrollTo({{ top: 0, behavior: 'smooth' }});
    step = n;
  }}

  /** فقط فیلدهای همین مرحله را بررسی کن */
  function validStep(n) {{
    const panel = document.querySelector(`.step-panel[data-panel="${{n}}"]`);
    let ok = true;
    panel.querySelectorAll('[data-rules]').forEach((i) => {{
      if (!validateField(i)) ok = false;
    }});

    // بررسی تطابق رمز در مرحله‌ی ۱
    if (n === 1) {{
      const a = document.getElementById('pass').value;
      const b = document.getElementById('pass2').value;
      if (a && b && a !== b) {{
        const f = document.getElementById('pass2').closest('.field');
        f.classList.add('invalid');
        f.querySelector('.err-msg').textContent = 'رمز و تکرار آن یکسان نیستند.';
        ok = false;
      }}
    }}
    return ok;
  }}

  document.getElementById('nextBtn').addEventListener('click', () => {{
    if (!validStep(step)) {{
      toast('لطفاً فیلدهای این مرحله را کامل کنید.', 'error');
      document.querySelector('.step-panel.on .field.invalid input, .step-panel.on .field.invalid select')?.focus();
      return;
    }}
    if (step === 3) buildReview();
    show(step + 1);
  }});

  document.getElementById('prevBtn').addEventListener('click', () => show(step - 1));

  /* ---------- خلاصه‌ی بازبینی ---------- */
  const CAT_FA = {{ women: 'پوشاک زنانه', men: 'پوشاک مردانه', kids: 'پوشاک کودک', teen: 'پوشاک نوجوان' }};

  function buildReview() {{
    const g = (id) => document.getElementById(id).value.trim() || '—';
    const rows = [
      ['نام و نام خانوادگی', g('fullName')],
      ['ایمیل', g('email')],
      ['موبایل', g('phone')],
      ['نام فروشگاه', g('shopName')],
      ['دسته‌بندی', CAT_FA[g('category')] || '—'],
      ['شهر', g('city')],
      ['کد ملی', g('nationalId')],
      ['شماره شبا', g('shaba')],
    ];
    document.getElementById('reviewBox').innerHTML =
      rows.map(([k, v]) => `<div class="info-row"><span class="k">${{k}}</span><span class="v">${{v}}</span></div>`).join('');
  }}

  /* ---------- ارسال ---------- */
  form.addEventListener('submit', (e) => {{
    e.preventDefault();

    const agree = document.getElementById('agree');
    const agreeField = agree.closest('.field');
    if (!agree.checked) {{
      agreeField.classList.add('invalid');
      toast('برای ادامه باید قوانین را بپذیرید.', 'warning');
      return;
    }}
    agreeField.classList.remove('invalid');

    const btn = document.getElementById('submitBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    // شبیه‌سازی ارسال به سرور
    setTimeout(() => {{
      btn.classList.remove('loading');
      btn.disabled = false;

      document.getElementById('doneShop').textContent  = document.getElementById('shopName').value;
      document.getElementById('doneEmail').textContent = document.getElementById('email').value;

      show(5);
      toast('درخواست فروشندگی با موفقیت ثبت شد.', 'success');
    }}, 1100);
  }});
}})();
</script>
</body>
</html>
'''

with open(os.path.join(OUT, 'seller-signup.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print('✓ seller-signup.html ساخته شد —', len(html), 'کاراکتر')
