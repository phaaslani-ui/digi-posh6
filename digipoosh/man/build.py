# -*- coding: utf-8 -*-
"""Generator for DigiPoosh — Men's Fashion page (MAN) — Masculine Power."""

FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
SW = 'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"'


def svg(body, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{body}</svg>'


I = {
 'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
 'bag': '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
 'user': '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'shield': '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
 'scissors': '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><path d="M8.7 8.2 19 18.5M19 5.5 8.7 15.8"/>',
 'ruler': '<rect x="2.8" y="8.5" width="18.4" height="7"/><path d="M7 8.5v3M11 8.5v4.2M15 8.5v3M19 8.5v4.2"/>',
 'lock': '<rect x="4.5" y="10" width="15" height="10.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14v2.5"/>',
 'return': '<path d="M4 12a8 8 0 1 1 2.6 5.9"/><path d="M4 7.5V12h4.5"/>',
 'package': '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
 'diamond': '<path d="m12 20.5-8-11L7 4h10l3 5.5z"/><path d="M4 9.5h16M9 4l-2 5.5 5 11 5-11L15 4"/>',
 'clock': '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'badge': '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/>',
 'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'shop': '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'star': '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
 'arrow': '<path d="M14 6l-6 6 6 6"/>',
 'inst': '<rect x="4" y="4" width="16" height="16"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/>',
 'send': '<path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/>',
 'chat': '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>',
 'globe': '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/>',
 'quote': '<path d="M9.5 6.5C7 7.8 5.5 10 5.5 12.8c0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/><path d="M18 6.5c-2.5 1.3-4 3.5-4 6.3 0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/>',
 'hanger': '<path d="M12 8.5a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 8.5v2l7.2 4.6a1.8 1.8 0 0 1-1 3.4H5.8a1.8 1.8 0 0 1-1-3.4L12 10.5"/>',
 'headset': '<path d="M5 14v-2a7 7 0 0 1 14 0v2"/><path d="M5 14h1.8a1.2 1.2 0 0 1 1.2 1.2v2.6A1.2 1.2 0 0 1 6.8 19H6a1 1 0 0 1-1-1z"/><path d="M19 14h-1.8a1.2 1.2 0 0 0-1.2 1.2v2.6a1.2 1.2 0 0 0 1.2 1.2h.8a1 1 0 0 0 1-1z"/>',
 'layers': '<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/>',
}

STAR_FULL = f'<svg class="ico star-full" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="currentColor" aria-hidden="true">{I["star"]}</svg>'
STAR_EMPTY = f'<svg class="ico star-empty" viewBox="0 0 24 24" {SW} aria-hidden="true">{I["star"]}</svg>'


def stars(n):
    return f'<span class="stars" role="img" aria-label="امتیاز {n} از ۵">' + STAR_FULL * n + STAR_EMPTY * (5 - n) + '</span>'


# ------------------------------------------------------------------ SLIDES
slides = [
    ("1043474", "مجموعه‌ی بهار و تابستان", "قدرت", "پوشش",
     "استایلی که نشان‌دهنده‌ی شخصیت شماست",
     "پشم مرینوس، کتان و فاستونی در طیفی از زغالی و برنز"),
    ("845434", "برش کلاسیک", "خط", "شانه",
     "دوختی که ساختار را روی تن می‌نشاند",
     "زاویه‌ی شانه و افتادن آستین، امضای یک دوخت حرفه‌ای"),
    ("1300550", "چرم و بافت", "بافت", "اصیل",
     "موادی که با گذر زمان زیباتر می‌شوند",
     "چرم گاوی دباغی گیاهی و کشمیر خالص"),
    ("2955375", "استایل روزمره", "سادگی", "مقتدر",
     "کمترین جزئیات، بیشترین تأثیر",
     "پنبه‌ی مصری و لینن، برای روزهای کاری و آزاد"),
]

slide_html = "\n".join(f'''      <div class="slide{' active' if i == 0 else ''}" role="group" aria-roledescription="اسلاید" aria-label="اسلاید {i+1} از {len(slides)}">
        <img src="https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2000" alt="مدل مرد ایرانی با پوشش شیک" {'fetchpriority="high"' if i == 0 else 'loading="lazy"'} />
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <span class="slide-badge">{svg(I['diamond'], 'ico ico-mini')} {badge}</span>
          <{"h1" if i == 0 else "h2 class=\"slide-title\""}>{t1} <span class="highlight-m">{t2}</span></{"h1" if i == 0 else "h2"}>
          <p>{sub}</p>
          <span class="slide-meta">{meta}</span>
          <button class="btn-slider-m" type="button" data-scroll="#store-showcase">
            <span>مشاهده مجموعه</span>{svg(I['arrow'], 'ico ico-arrow')}
          </button>
        </div>
      </div>''' for i, (pid, badge, t1, t2, sub, meta) in enumerate(slides))

dots = "\n".join(f'      <button class="dot{" active" if i == 0 else ""}" type="button" aria-label="اسلاید {i+1}"></button>'
                 for i in range(len(slides)))

# ------------------------------------------------------------------ WHY
why = [
    ('shield', 'اصالت کالا', 'اصالت و شفافیت معرفی کالاها، ستون اصلی تجربه‌ی خرید در دیجی‌پوش است.',
     'هر قطعه از نظر ترکیب الیاف، کیفیت دوخت و مطابقت با تصویر بررسی می‌شود.'),
    ('badge', 'فروشندگان معتبر', 'فروشگاه‌ها پیش از حضور در ویترین، از نظر کیفیت و اعتبار ارزیابی می‌شوند.',
     'از هر ده درخواست همکاری، تنها سه فروشگاه به مرحله‌ی نهایی می‌رسند.'),
    ('ruler', 'اندازه‌ی دقیق', 'جدول سایز با متر روی خود لباس ثبت می‌شود، نه بر پایه‌ی سایز عمومی.',
     'دور سینه، عرض شانه و قد آستین برای هر سایز جداگانه درج می‌شود.'),
    ('lock', 'پرداخت امن', 'پرداخت‌ها در بستری شفاف و قابل پیگیری انجام می‌شود.',
     'مبلغ تا زمان تأیید سلامت کالا نزد دیجی‌پوش امانت می‌ماند.'),
    ('return', 'بازگشت روشن', 'اگر انتخاب شما مطابق انتظار نبود، مسیر بازگشت شفاف است.',
     'هفت روز فرصت بازگشت، بدون نیاز به توضیح دلیل انتخاب.'),
    ('headset', 'همراهی تخصصی', 'مشاوره‌ی انتخاب سایز و تناسب برش با فرم بدن.',
     'راهنمایی برای انتخاب میان برش کلاسیک، نیمه‌جذب و اسلیم.'),
]

why_html = "\n".join(f'''      <article class="why-card-m bronze-border">
        <span class="icon-frame">{svg(I[ic])}</span>
        <h3>{t}</h3>
        <p>{d}</p>
        <span class="note-m">{n}</span>
      </article>''' for ic, t, d, n in why)

# ------------------------------------------------------------------ CRITERIA
criteria = [
    ('scissors', 'استاندارد دوخت', 'نمونه‌ی فیزیکی هر فروشگاه پیش از پذیرش بررسی می‌شود؛ از دوام درز تا کیفیت آستر و یقه.'),
    ('layers', 'شفافیت پارچه', 'ترکیب الیاف باید دقیق اعلام شود؛ درصد پشم، پنبه و الیاف مصنوعی قابل مشاهده است.'),
    ('shop', 'هویت فروشنده', 'هر فروشگاه ویترینی با زبان بصری خودش دارد و شخصیت برندش را منتقل می‌کند.'),
    ('package', 'بسته‌بندی حرفه‌ای', 'پوشاک رسمی باید بدون چروک برسد؛ بسته‌بندی محکم بخشی از استاندارد ماست.'),
]

criteria_html = "\n".join(f'''      <li>
        <span class="crit-box">{svg(I[ic])}</span>
        <div><strong>{t}</strong><p>{d}</p></div>
      </li>''' for ic, t, d in criteria)

# ------------------------------------------------------------------ STATS
stats = [
    ('clock', '۳ ساعت', 'میانگین زمان پاسخ فروشندگان'),
    ('check', '۹۴٪', 'رضایت از دوخت و اندازه'),
    ('shop', '۱۲۰', 'فروشگاه تخصصی مردانه'),
    ('diamond', '۹.۲', 'میانگین کیفیت پارچه'),
]

stats_html = "\n".join(f'''      <div class="stat-m">
        <span class="stat-icon">{svg(I[ic])}</span>
        <span class="stat-num">{n}</span>
        <span class="stat-label">{l}</span>
      </div>''' for ic, n, l in stats)

# ------------------------------------------------------------------ STEPS
steps = [
    ('۰۱', 'ruler', 'اندازه‌ات را بدان', 'دور سینه، عرض شانه و قد آستین را با راهنمای تصویری ثبت کن.'),
    ('۰۲', 'hanger', 'انتخاب کن', 'میان ویترین فروشگاه‌های تخصصی، بر اساس پارچه و برش فیلتر کن.'),
    ('۰۳', 'package', 'دریافت کن', 'سفارش را پیگیری کن و پس از تأیید سلامت، پرداخت نهایی شود.'),
]

steps_html = "\n".join(f'''      <div class="step-m">
        <span class="step-index">{num}</span>
        <span class="step-icon">{svg(I[ic])}</span>
        <h3>{t}</h3>
        <p>{d}</p>
      </div>''' for num, ic, t, d in steps)

# ------------------------------------------------------------------ TRUST
trust = [
    ('shield', 'نماد اعتماد الکترونیک', 'دارای مجوز رسمی کسب‌وکار اینترنتی'),
    ('badge', 'تضمین کیفیت', 'بررسی نمونه‌ی فیزیکی پیش از پذیرش فروشگاه'),
    ('lock', 'پرداخت امن', 'نگهداری امانی وجه تا تأیید سلامت کالا'),
    ('globe', 'گستره‌ی سراسری', 'همکاری با فروشگاه‌هایی از ده استان کشور'),
]

trust_html = "\n".join(f'''      <div class="trust-m">
        <span class="trust-ico">{svg(I[ic])}</span>
        <span class="trust-title">{t}</span>
        <span class="trust-note">{d}</span>
      </div>''' for ic, t, d in trust)

# ------------------------------------------------------------------ REVIEWS
# ------------------------------------------------------------------ PAGE
html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="دیجی‌پوش | لباس مردانه — ویترین فروشگاه‌های تخصصی پوشاک مردانه با تجربه‌ای مقتدر و لوکس." />
  <meta name="theme-color" content="#2d2d2d" />
  <title>دیجی‌پوش | لباس مردانه</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./style.css" />
  <link rel="stylesheet" href="../assets/css/dp-stock.css" />
  <link rel="stylesheet" href="../assets/css/dp-perf.css" />
  <link rel="stylesheet" href="../assets/css/dp-cursor.css" />
  <link rel="stylesheet" href="../assets/css/dp-polish.css" />
  <link rel="stylesheet" href="../assets/css/dp-storecard.css" />
  <link rel="stylesheet" href="../assets/css/dp-boost.css" />
  <link rel="stylesheet" href="../assets/css/dp-spotlight.css" />
  <link rel="stylesheet" href="../assets/css/dp-footer.css" />
  <link rel="stylesheet" href="../assets/css/dp-submenu.css" />
  <link rel="stylesheet" href="../assets/css/dp-public.css" />
  <link rel="stylesheet" href="../assets/css/dp-account.css" />
  <link rel="stylesheet" href="../assets/css/dp-reviews.css" />
  <link rel="stylesheet" href="../assets/css/dp-colors.css" />
  <link rel="stylesheet" href="../assets/css/dp-filters.css" />
  <link rel="stylesheet" href="../assets/css/dp-showcase.css" />
  <link rel="stylesheet" href="../assets/css/dp-nav.css" />
  <link rel="stylesheet" href="../assets/css/dp-search.css" />
<link rel="stylesheet" href="../assets/css/dp-cart-drawer.css" />
<link rel="canonical" href="https://digipoosh.ir/man/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fa_IR" />
  <meta property="og:site_name" content="دیجی‌پوش" />
  <meta property="og:url" content="https://digipoosh.ir/man/" />
  <meta property="og:title" content="دیجی‌پوش | لباس مردانه" />
  <meta property="og:description" content="ویترین فروشگاه‌های تخصصی پوشاک مردانه در دیجی‌پوش." />
  <meta property="og:image" content="https://digipoosh.ir/favicon.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="دیجی‌پوش | لباس مردانه" />
  <meta name="twitter:description" content="ویترین فروشگاه‌های تخصصی پوشاک مردانه در دیجی‌پوش." />
  <meta name="twitter:image" content="https://digipoosh.ir/favicon.svg" />
  <script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{ "@type": "Organization", "@id": "https://digipoosh.ir/#org", "name": "دیجی‌پوش", "url": "https://digipoosh.ir/", "logo": "https://digipoosh.ir/favicon.svg" }},
    {{ "@type": "WebSite", "@id": "https://digipoosh.ir/#site", "url": "https://digipoosh.ir/", "name": "دیجی‌پوش", "inLanguage": "fa-IR", "publisher": {{ "@id": "https://digipoosh.ir/#org" }} }},
    {{ "@type": "CollectionPage", "url": "https://digipoosh.ir/man/", "name": "دیجی‌پوش | لباس مردانه", "description": "دیجی‌پوش | لباس مردانه — ویترین فروشگاه‌های تخصصی پوشاک مردانه.", "inLanguage": "fa-IR", "isPartOf": {{ "@id": "https://digipoosh.ir/#site" }} }}
  ]
}}
</script>
</head>
<body data-dp-page="man">
<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>

<!-- ===== 0. AMBIENT BACKGROUND ===== -->
<div class="page-ambient-m" aria-hidden="true">
  <div class="grid-lines"></div>
  <div class="light-rays"></div>
  <div class="geo-shapes">
    <div class="geo geo-cube"></div>
    <div class="geo geo-cube geo-cube--sm"></div>
    <div class="geo geo-ring"></div>
    <div class="geo geo-pyramid"></div>
    <div class="geo geo-bar"></div>
  </div>
  <div class="metal-particles" id="metalParticles"></div>
</div>

<!-- ===== 1. NAVBAR ===== -->
<nav class="navbar-m bronze-border" id="navbar" aria-label="ناوبری اصلی">
  <a class="logo-m" href="../index.html">دیجی‌پوش</a>
  <ul class="menu-m">
    <li><a href="../woman/index.html">لباس زنانه</a></li>
    <li class="active"><a href="./index.html">لباس مردانه</a></li>
    <li><a href="../kids/index.html">لباس بچگانه</a></li>
    <li><a href="../teen/index.html">تینیجر</a></li>
      <li><a class="sh-ai" href="../digiai.html">دیجی AI</a></li>
    <li class="has-sub"><a href="#store-showcase">فروشندگان <svg class="sub-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg></a>
      <ul class="submenu">
        <li><a href="#store-showcase">فروشندگان این بخش</a></li>
        <li><a href="../seller/seller-login.html">ورود فروشندگان</a></li>
        <li><a href="../seller/seller-signup.html">ثبت‌نام فروشنده</a></li>
      </ul>
    </li>
    <li><a href="#footer-m">ارتباط با ما</a></li>
  </ul>
  <div class="icons-m">
    <a class="seller-entry" href="../seller/seller-login.html" title="ورود فروشندگان"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/></svg><span>ورود فروشندگان</span></a>
  </div>
</nav>

<main id="main">

<!-- ===== 2. EPIC HERO SLIDER ===== -->
<section class="hero-slider-m bronze-border" id="heroSlider" aria-label="مجموعه‌ی برگزیده">
  <div class="slides-wrap">
{slide_html}
  </div>

  <div class="beam beam-1"></div>
  <div class="beam beam-2"></div>
  <div class="slide-sweep"></div>

  <div class="slider-progress-m" aria-hidden="true"><div class="slider-progress-bar-m"></div></div>

  <div class="slider-dots-m">
{dots}
  </div>
</section>

<!-- ===== 6. STORE SHOWCASE ===== -->
<section class="stores-section-m" id="store-showcase">
  <div class="head-m">
    <span class="eyebrow-m">{svg(I['shop'], 'ico ico-mini')} ویترین منتخب</span>
    <h2>فروشگاه‌های برتر</h2>
    <p>با فروشندگان پوشاک مردانه‌ی دیجی‌پوش و تخصص هرکدام آشنا شوید</p>
  </div>
  <div class="stores-grid-m">
      <p class="dp-empty-stores">
        هنوز فروشگاهی در این بخش ثبت نشده است.
        <a href="../seller/seller-signup.html">اولین فروشنده باشید</a>
      </p>
  </div>
</section>

<!-- ===== 8. HOW IT WORKS (no border) ===== -->
<section class="steps-section-m" id="how">
  <div class="head-m">
    <span class="eyebrow-m">{svg(I['check'], 'ico ico-mini')} مسیر خرید</span>
    <h2>چطور کار می‌کند</h2>
    <p>در سه گام، از اندازه‌گیری تا دریافت سفارش</p>
  </div>
  <div class="steps-grid-m">
{steps_html}
  </div>
</section>

<!-- ===== 9. TRUST (no border) ===== -->
<section class="trust-section-m">
  <div class="trust-grid-m">
{trust_html}
  </div>
</section>

<!-- ===== 10. REVIEWS (no border) ===== -->
<section class="reviews-section-m">
  <div class="head-m">
    <span class="eyebrow-m">{svg(I['quote'], 'ico ico-mini')} تجربه‌ی خریداران</span>
    <h2>نظرات مشتریان</h2>
    <p>آنچه خریداران درباره‌ی دوخت و کیفیت گفته‌اند</p>
  </div>
  <div class="reviews-grid-m">
      <p class="dp-empty-stores">
        هنوز نظری ثبت نشده است. پس از نخستین خریدها، نظر مشتریان اینجا دیده می‌شود.
      </p>
  </div>
</section>

<!-- ===== 3. WHY DIGIPOOSH ===== -->
<section class="why-section-m" id="why">
  <div class="head-m">
    <span class="eyebrow-m">{svg(I['badge'], 'ico ico-mini')} تعهد دیجی‌پوش</span>
    <h2>چرا دیجی‌پوش</h2>
    <p>شش اصل روشن که خرید پوشاک مردانه را دقیق و مطمئن می‌کند</p>
  </div>
  <div class="why-grid-m">
{why_html}
  </div>
</section>

<!-- ===== 4. SELECT SELLERS ===== -->
<section class="select-sellers-m bronze-border">
  <div class="head-m">
    <span class="eyebrow-m">{svg(I['shield'], 'ico ico-mini')} معیارهای پذیرش</span>
    <h2>انتخاب دقیق فروشندگان</h2>
    <p>پیش از آنکه ویترین فروشگاهی در دیجی‌پوش دیده شود، از چهار دروازه عبور می‌کند</p>
  </div>
  <ul class="criteria-m">
{criteria_html}
  </ul>
</section>

<!-- ===== 5. RESPONSE TIME ===== -->
<section class="response-m bronze-border">
  <div class="head-m">
    <h2>در یک نگاه</h2>
    <p>آمار زنده‌ی بازارگاه پوشاک مردانه</p>
  </div>
  <div class="stats-grid-m">
{stats_html}
  </div>
</section>

<!-- ===== 11. REGISTRATION CTA ===== -->
<section class="cta-m bronze-border">
  <div class="cta-inner-m">
    <span class="eyebrow-m">{svg(I['user'], 'ico ico-mini')} عضویت</span>
    <h2>به خانواده بزرگ دیجی‌پوش بپیوندید</h2>
    <p>حساب بسازید تا اندازه‌های خود را ذخیره کنید و ویترین‌های تازه را دنبال کنید</p>
    <button class="btn-primary-m" type="button">ساخت حساب</button>
  </div>
</section>

<!-- ===== 12. LUXURY FOOTER ===== -->
</main>

<footer class="footer-m bronze-border" id="footer-m">
  <div class="footer-grid-m">

    <div class="fcol">
      <div class="footer-brand">
        <span class="footer-mark">د</span>
        <span class="footer-brand-txt">
          <strong>دیجی‌پوش</strong>
          <small>بازارگاه ممتاز فروشندگان مد</small>
        </span>
      </div>
      <p>بازارگاه لوکس پوشاک ایرانی؛ اتصال خریداران به فروشندگان معتبر پوشاک مردانه با تمرکز بر دوخت دقیق و پارچه‌ی اصیل.</p>
      <div class="socials-m">
        <a href="#" class="" aria-label="اینستاگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/></svg></a>
        <a href="#" class="" aria-label="تلگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/></svg></a>
        <a href="#" class="" aria-label="گفت‌وگو"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/></svg></a>
      </div>
    </div>

    <div class="fcol">
      <h3>بخش‌های دیجی‌پوش</h3>
      <ul>
        <li><a href="../index.html">صفحه‌ی اصلی</a></li>
        <li><a href="../woman/index.html">لباس زنانه</a></li>
        <li><a href="../kids/index.html">لباس بچگانه</a></li>
        <li><a href="../teen/index.html">تینیجر</a></li>
        <li><a href="#live-products">ویترین محصولات</a></li>
        <li><a href="#store-showcase">فروشندگان</a></li>
      </ul>
    </div>

    <div class="fcol">
      <h3>پشتیبانی</h3>
      <ul>
        <li><a href="#how"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M4 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m7.5 6 -3.5 3.5L7.5 13"/></svg> راهنمای خرید</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/></svg> پیگیری سفارش</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg> شرایط بازگشت کالا</a></li>
        <li><a href="#why"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/></svg> پرسش‌های متداول</a></li>
      </ul>
    </div>

    <div class="fcol">
      <h3>فروشندگان</h3>
      <ul>
        <li><a href="../seller/seller-signup.html">ثبت‌نام فروشنده</a></li>
        <li><a href="../seller/seller-login.html">ورود به پنل</a></li>
        <li><a href="../admin/admin-login.html">ورود مدیریت</a></li>
        <li><a href="#why">شرایط پذیرش</a></li>
      </ul>
    </div>

    <div class="fcol">
      <h3>ارتباط با ما</h3>
      <ul class="footer-contact">
        <li><a href="tel:02100000000"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.8 1.8 0 0 1-2 1.8A15.5 15.5 0 0 1 4.7 6a1.8 1.8 0 0 1 1.8-2Z"/></svg> <span>۰۲۱ ـ ۰۰۰۰ ۰۰۰۰</span></a></li>
        <li><a href="mailto:hello@digipoosh.ir"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 5.5L20 7"/></svg> <span>hello@digipoosh.ir</span></a></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/></svg> <span>تهران، خیابان ولیعصر</span></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/></svg> <span>هر روز، ۹ صبح تا ۹ شب</span></li>
      </ul>
      <p class="fnote">از مجموعه‌های تازه باخبر شوید</p>
      <form class="news-m" id="newsForm">
        <input type="email" placeholder="ایمیل شما" required aria-label="ایمیل" />
        <button type="submit">عضویت</button>
      </form>
    </div>

  </div>

  <div class="fbottom">
    <p>© ۱۴۰۵ دیجی‌پوش — تمامی حقوق محفوظ است.</p>
    <div class="footer-badges">
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/></svg> پرداخت امن</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/></svg> ضمانت اصالت</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg> فروشندگان معتبر</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M4 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m7.5 6 -3.5 3.5L7.5 13"/></svg> ۷ روز مهلت بازگشت</span>
    </div>
  </div>
</footer>

<div class="toast-m" id="toast" role="status" aria-live="polite"></div>

<script src="./script.js"></script>
<script src="../seller/js/dp-config.js"></script>
<script src="../assets/js/dp-safe.js"></script>
<script src="../assets/js/dp-stock.js"></script>
<script src="../assets/js/dp-perf.js"></script>
<script src="../assets/js/dp-reset.js"></script>
<script src="../assets/js/dp-taxonomy.js"></script>
<script src="../assets/js/dp-reviews.js"></script>
<script src="../assets/js/dp-public.js"></script>
<script src="../assets/js/dp-palette.js"></script>
<script src="../assets/js/dp-colors.js"></script>
<script src="../assets/js/dp-promo.js"></script>
<script src="../assets/js/dp-boost.js"></script>
<script src="../assets/js/dp-spotlight.js"></script>
<script src="../assets/js/dp-user.js"></script>
<script src="../assets/js/dp-cart.js"></script>
<script src="../assets/js/dp-returns.js"></script>
<script src="../assets/js/dp-account.js"></script>
<script src="../assets/js/dp-cart-drawer.js"></script>
<script src="../assets/js/dp-attributes.js"></script>
<script src="../assets/js/dp-filters.js"></script>
<script src="../assets/js/dp-showcase.js"></script>
<script src="../assets/js/dp-submenu.js"></script>
<script src="../assets/js/dp-cursor.js"></script>
<script src="../assets/js/dp-polish.js"></script>
<script src="../assets/js/dp-nav.js"></script>
<script src="../assets/js/dp-brain.js"></script>
<script src="../assets/js/dp-suggest.js"></script>
<script src="../assets/js/dp-search.js"></script>
</body>
</html>
'''

open('/home/user/man/index.html', 'w', encoding='utf-8').write(html)
print('built', len(html), 'chars')
