# -*- coding: utf-8 -*-
"""دیجی‌پوش — سازنده‌ی صفحه‌ی لباس زنانه (نسخه‌ی بهینه)"""

SW = 'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"'


def svg(body, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{body}</svg>'


I = {
 'search':  '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
 'bag':     '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
 'user':    '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'shield':  '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
 'badge':   '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/>',
 'lock':    '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14v2.5"/>',
 'headset': '<path d="M5 14v-2a7 7 0 0 1 14 0v2"/><path d="M5 14h1.8a1.2 1.2 0 0 1 1.2 1.2v2.6A1.2 1.2 0 0 1 6.8 19H6a1 1 0 0 1-1-1z"/><path d="M19 14h-1.8a1.2 1.2 0 0 0-1.2 1.2v2.6a1.2 1.2 0 0 0 1.2 1.2h.8a1 1 0 0 0 1-1z"/>',
 'back':    '<path d="M4 12a8 8 0 1 1 2.6 5.9"/><path d="M4 7.5V12h4.5"/>',
 'gift':    '<rect x="4" y="10" width="16" height="9.5" rx="1.6"/><path d="M3.5 7h17v3h-17z"/><path d="M12 7v12.5"/><path d="M12 7S10.8 4 8.9 4a2 2 0 0 0 0 3zM12 7s1.2-3 3.1-3a2 2 0 0 1 0 3z"/>',
 'scissors':'<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><path d="M8.7 8.2 19 18.5M19 5.5 8.7 15.8"/>',
 'layers':  '<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/>',
 'shop':    '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'leaf':    '<path d="M5 19c0-7 4.5-11 14-11 0 8.5-4.5 12-9.5 12A4.5 4.5 0 0 1 5 19Z"/><path d="M9 15.5c2-2.6 4.4-4.3 7.5-5.5"/>',
 'clock':   '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'check':   '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'star':    '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
 'hanger':  '<path d="M12 8.5a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 8.5v2l7.2 4.6a1.8 1.8 0 0 1-1 3.4H5.8a1.8 1.8 0 0 1-1-3.4L12 10.5"/>',
 'ruler':   '<rect x="2.8" y="8.5" width="18.4" height="7" rx="1.6"/><path d="M7 8.5v3M11 8.5v4.2M15 8.5v3M19 8.5v4.2"/>',
 'globe':   '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/>',
 'quote':   '<path d="M9.5 6.5C7 7.8 5.5 10 5.5 12.8c0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/><path d="M18 6.5c-2.5 1.3-4 3.5-4 6.3 0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/>',
 'sparkle': '<path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z"/><path d="M18.5 4v3M20 5.5h-3"/>',
 'diamond': '<path d="m12 20.5-8-11L7 4h10l3 5.5z"/><path d="M4 9.5h16M9 4l-2 5.5 5 11 5-11L15 4"/>',
 'arrow':   '<path d="M14 6l-6 6 6 6"/>',
 'inst':    '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/>',
 'send':    '<path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/>',
 'chat':    '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>',
}

STAR_ON  = f'<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{I["star"]}</svg>'
STAR_OFF = f'<svg class="ico star-off" viewBox="0 0 24 24" {SW} aria-hidden="true">{I["star"]}</svg>'


def stars(n):
    return (f'<span class="stars" role="img" aria-label="امتیاز {n} از ۵">'
            + STAR_ON * n + STAR_OFF * (5 - n) + '</span>')


# ---------------------------------------------------------------- SLIDES
slides = [
    ("36168977", "مجموعه‌ی بهار و تابستان", "زیبایی در هر پوشش", "طلایی",
     "خریدی متفاوت، تجربه‌ای لوکس",
     "ابریشم، کتان و پنبه‌ی طبیعی در پالتی از کرم و طلایی"),
    ("36168986", "استایل مجلسی", "درخشش در شب‌های خاص", "رویایی",
     "لباس‌هایی که خاطره‌ساز می‌شوند",
     "مخمل، حریر و سوزن‌دوزی ظریف برای مجالس ویژه"),
    ("6311392", "استایل روزمره", "زیبایی در سادگی", "شیک",
     "استایلی شیک برای هر لحظه",
     "برش‌های راحت با پارچه‌های نفس‌گیر و سبک"),
    ("7148384", "کلاسیک مدرن", "اصالت و ظرافت", "زنانگی",
     "ترکیبی از هنر ایرانی و مد روز",
     "الهام‌گرفته از نقوش سنتی با دوخت امروزی"),
]

slide_html = "\n".join(f'''      <div class="slide{' active' if i == 0 else ''}" role="group"
           aria-roledescription="اسلاید" aria-label="اسلاید {i+1} از {len(slides)}">
        <img src="https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800"
             alt="مدل زن ایرانی با پوشش شیک"
             width="1800" height="1200"
             {'fetchpriority="high" decoding="async"' if i == 0 else 'loading="lazy" decoding="async"'} />
        <div class="slide-overlay"></div>
        <div class="slide-body">
          <span class="badge">{svg(I['sparkle'], 'ico ico-sm')} {badge}</span>
          <{"h1" if i == 0 else "h2 class=\"slide-title\""}>{t1} <span class="hl holo">{t2}</span></{"h1" if i == 0 else "h2"}>
          <p>{sub}</p>
          <span class="slide-meta">{meta}</span>
          <button class="btn-gold" type="button" data-scroll="#stores">
            مشاهده مجموعه {svg(I['arrow'], 'ico ico-sm')}
          </button>
        </div>
      </div>''' for i, (pid, badge, t1, t2, sub, meta) in enumerate(slides))

dots = "\n".join(
    f'      <button class="dot{" active" if i == 0 else ""}" type="button" aria-label="اسلاید {i+1}"></button>'
    for i in range(len(slides)))

# ---------------------------------------------------------------- WHY (6)
why = [
    ('shield', 'محصولات اصل',
     'اصالت و شفافیت معرفی کالاها، ستون اصلی تجربه‌ی خرید در بازارگاه دیجی‌پوش است.',
     'هر کالا از نظر جنس پارچه، کیفیت دوخت و مطابقت با تصاویر بررسی می‌شود.'),
    ('badge', 'فروشندگان معتبر',
     'فروشنده‌هایی که به دیجی‌پوش وارد می‌شوند، پیش از حضور از نظر کیفیت و اعتبار بررسی می‌شوند.',
     'از هر ده درخواست همکاری، تنها سه فروشگاه به مرحله‌ی نهایی می‌رسند.'),
    ('lock', 'پرداخت امن',
     'پرداخت‌ها در بستری شفاف، امن و قابل پیگیری انجام می‌شوند تا خیال شما آسوده باشد.',
     'مبلغ تا زمان تأیید سلامت کالا نزد دیجی‌پوش امانت می‌ماند.'),
    ('headset', 'همراهی و مشاوره',
     'همراهی انسانی و آرام برای پاسخ به پرسش‌ها، انتخاب سایز و پیگیری سفارش‌ها.',
     'مشاوره‌ی انتخاب سایز و هماهنگی رنگ‌ها بدون هزینه ارائه می‌شود.'),
    ('back', 'بازگشت آسان',
     'اگر انتخاب شما مطابق انتظار نبود، فرایند بازگشت روشن و قابل اتکا در اختیارتان است.',
     'هفت روز فرصت بازگشت، بدون نیاز به توضیح دلیل انتخاب.'),
    ('gift', 'بسته‌بندی آراسته',
     'کالاها با بسته‌بندی حرفه‌ای و درخور یک خرید لوکس به دست شما می‌رسند.',
     'جعبه‌ی پارچه‌ای، کاغذ محافظ و کارت دست‌نویس، بخشی از استاندارد ماست.'),
]

why_html = "\n".join(f'''        <article class="why-card gbox reveal">
          <span class="icon-badge">{svg(I[ic])}</span>
          <h3 class="holo">{t}</h3>
          <p>{d}</p>
          <span class="note">{n}</span>
        </article>''' for ic, t, d, n in why)

# ---------------------------------------------------------------- CRITERIA
criteria = [
    ('scissors', 'استاندارد دوخت و پارچه',
     'نمونه‌ی فیزیکی هر فروشگاه پیش از پذیرش بررسی می‌شود؛ از یکدستی رنگ تا دوام درز.'),
    ('ruler', 'جدول سایز واقعی',
     'اندازه‌ها با متر روی خود لباس ثبت می‌شوند تا انتخاب سایز حدس‌وگمان نباشد.'),
    ('shop', 'هویت مستقل فروشنده',
     'هر فروشگاه ویترینی با زبان بصری خودش دارد و شخصیت برندش را منتقل می‌کند.'),
    ('leaf', 'احترام به منابع',
     'استفاده از پارچه‌های طبیعی و بسته‌بندی کم‌ضایعات، امتیاز مثبتی در ارزیابی است.'),
]

criteria_html = "\n".join(f'''          <li>
            <span class="crit-icon">{svg(I[ic])}</span>
            <div><strong class="holo">{t}</strong><p>{d}</p></div>
          </li>''' for ic, t, d in criteria)

# ---------------------------------------------------------------- STATS
stats = [
    ('clock',   '۲ ساعت', 'میانگین زمان پاسخ'),
    ('check',   '۹۶٪',    'نرخ بازگشت موفق'),
    ('hanger',  '۱۸۰',    'فروشگاه فعال زنانه'),
    ('diamond', '۹.۴',    'میانگین رضایت از کیفیت'),
]

stats_html = "\n".join(f'''          <div class="stat reveal">
            <span class="stat-icon">{svg(I[ic])}</span>
            <span class="num holo">{n}</span>
            <span class="lbl">{l}</span>
          </div>''' for ic, n, l in stats)

# ---------------------------------------------------------------- STEPS
steps = [
    ('۱', 's1', 'انتخاب',  'میان ویترین فروشگاه‌های منتخب بگرد و استایلت را پیدا کن'),
    ('۲', 's2', 'سفارش',   'سایز و رنگ را انتخاب کن و سفارش را ثبت کن'),
    ('۳', 's3', 'دریافت',  'سفارش را پیگیری کن و درب منزل تحویل بگیر'),
]

steps_html = "\n".join(f'''          <div class="step reveal">
            <div class="step-circle {cc}">{num}</div>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>''' for num, cc, t, d in steps)

# ---------------------------------------------------------------- TRUST
trust = [
    ('shield', 'نماد اعتماد الکترونیک', 'دارای مجوز رسمی کسب‌وکار اینترنتی'),
    ('badge',  'تضمین کیفیت',           'بررسی نمونه‌ی فیزیکی پیش از پذیرش'),
    ('lock',   'پرداخت امن',            'نگهداری امانی وجه تا تأیید سلامت کالا'),
    ('globe',  'ارسال سراسری',          'همکاری با فروشگاه‌هایی از ده استان'),
]

trust_html = "\n".join(f'''          <div class="trust-item reveal">
            <span class="trust-icon">{svg(I[ic])}</span>
            <strong>{t}</strong>
            <span>{d}</span>
          </div>''' for ic, t, d in trust)

# ---------------------------------------------------------------- REVIEWS
# ---------------------------------------------------------------- PAGE
html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="دیجی‌پوش | لباس زنانه — ویترین فروشگاه‌های منتخب پوشاک زنانه با تجربه‌ای رویایی و لوکس." />
  <meta name="theme-color" content="#f5f0e8" />
  <title>دیجی‌پوش | لباس زنانه</title>

  <!-- اتصال زودهنگام به دامنه‌های خارجی — چند صد میلی‌ثانیه صرفه‌جویی -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://images.pexels.com" />
  <link rel="dns-prefetch" href="https://images.pexels.com" />

  <!-- فقط وزن‌هایی که واقعاً استفاده می‌شوند (نه کل خانواده) -->
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800&display=swap"
        rel="stylesheet" />

  <!-- بارگذاری زودهنگام تصویر نخستین اسلاید برای بهبود LCP -->
  <link rel="preload" as="image" fetchpriority="high"
        href="https://images.pexels.com/photos/{slides[0][0]}/pexels-photo-{slides[0][0]}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800" />

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
<link rel="canonical" href="https://digipoosh.ir/woman/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fa_IR" />
  <meta property="og:site_name" content="دیجی‌پوش" />
  <meta property="og:url" content="https://digipoosh.ir/woman/" />
  <meta property="og:title" content="دیجی‌پوش | لباس زنانه" />
  <meta property="og:description" content="ویترین فروشگاه‌های تخصصی پوشاک زنانه در دیجی‌پوش." />
  <meta property="og:image" content="https://digipoosh.ir/favicon.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="دیجی‌پوش | لباس زنانه" />
  <meta name="twitter:description" content="ویترین فروشگاه‌های تخصصی پوشاک زنانه در دیجی‌پوش." />
  <meta name="twitter:image" content="https://digipoosh.ir/favicon.svg" />
  <script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{ "@type": "Organization", "@id": "https://digipoosh.ir/#org", "name": "دیجی‌پوش", "url": "https://digipoosh.ir/", "logo": "https://digipoosh.ir/favicon.svg" }},
    {{ "@type": "WebSite", "@id": "https://digipoosh.ir/#site", "url": "https://digipoosh.ir/", "name": "دیجی‌پوش", "inLanguage": "fa-IR", "publisher": {{ "@id": "https://digipoosh.ir/#org" }} }},
    {{ "@type": "CollectionPage", "url": "https://digipoosh.ir/woman/", "name": "دیجی‌پوش | لباس زنانه", "description": "دیجی‌پوش | لباس زنانه — ویترین فروشگاه‌های تخصصی پوشاک زنانه.", "inLanguage": "fa-IR", "isPartOf": {{ "@id": "https://digipoosh.ir/#site" }} }}
  ]
}}
</script>
</head>
<body data-dp-page="woman">
<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>

<!-- ===== لایه‌ی تزئینی: ۳ حلقه + ۳ موج + ۱۵ ذره + ۸ گل ===== -->
<div class="ambient" aria-hidden="true">
  <div class="silk silk-1"></div>
  <div class="silk silk-2"></div>
  <div class="silk silk-3"></div>
  <div class="ring ring-1"></div>
  <div class="ring ring-2"></div>
  <div class="ring ring-3"></div>
  <div id="particles"></div>
  <div class="flowers" id="flowers"></div>
</div>

<!-- ===== ۱. نوار ناوبری ===== -->
<nav class="navbar gbox" id="navbar" aria-label="ناوبری اصلی">
  <a class="logo" href="../index.html">دیجی‌پوش</a>
  <ul class="menu">
    <li class="active"><a href="./index.html">لباس زنانه</a></li>
    <li><a href="../man/index.html">لباس مردانه</a></li>
    <li><a href="../kids/index.html">لباس بچگانه</a></li>
    <li><a href="../teen/index.html">تینیجر</a></li>
      <li><a class="sh-ai" href="../digiai.html">دیجی AI</a></li>
    <li class="has-sub"><a href="#stores">فروشندگان <svg class="sub-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg></a>
      <ul class="submenu">
        <li><a href="#stores">فروشندگان این بخش</a></li>
        <li><a href="../seller/seller-login.html">ورود فروشندگان</a></li>
        <li><a href="../seller/seller-signup.html">ثبت‌نام فروشنده</a></li>
      </ul>
    </li>
    <li><a href="#site-footer">ارتباط با ما</a></li>
  </ul>
  <div class="nav-icons">
    <a class="seller-entry" href="../seller/seller-login.html" title="ورود فروشندگان"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/></svg><span>ورود فروشندگان</span></a>
  </div>
</nav>

<main id="main">

<!-- ===== ۲. اسلایدر ===== -->
<section class="hero gbox" id="heroSlider" aria-label="مجموعه‌ی برگزیده">
  <div class="slides">
{slide_html}
  </div>
  <div class="slider-progress" aria-hidden="true"><div class="slider-progress-bar"></div></div>
  <div class="slider-dots">
{dots}
  </div>
</section>

<!-- ===== ۶. ویترین فروشگاه‌ها ===== -->
<section id="stores">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">{svg(I['shop'], 'ico ico-sm')} ویترین منتخب</span>
      <h2 class="holo">فروشگاه‌های برتر</h2>
      <p>با فروشندگان پوشاک زنانه‌ی دیجی‌پوش و امضای بصری هرکدام آشنا شوید</p>
    </div>
    <div class="grid-4">
          <p class="dp-empty-stores">
            هنوز فروشگاهی در این بخش ثبت نشده است.
            <a href="../seller/seller-signup.html">اولین فروشنده باشید</a>
          </p>
    </div>
  </div>
</section>

<!-- ===== ۸. چطور کار می‌کند ===== -->
<section id="how">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">{svg(I['check'], 'ico ico-sm')} مسیر خرید</span>
      <h2 class="holo">چطور کار می‌کند؟</h2>
      <p>در سه گام ساده، از کشف ویترین تا دریافت سفارش</p>
    </div>
    <div class="steps">
{steps_html}
    </div>
  </div>
</section>

<!-- ===== ۹. اعتماد ===== -->
<section>
  <div class="wrap">
    <div class="trust">
{trust_html}
    </div>
  </div>
</section>

<!-- ===== ۱۰. نظرات مشتریان ===== -->
<section id="reviews">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">{svg(I['quote'], 'ico ico-sm')} تجربه‌ی خریداران</span>
      <h2 class="holo">نظرات مشتریان</h2>
      <p>آنچه خریداران درباره‌ی کیفیت و همراهی فروشندگان می‌گویند</p>
    </div>
    <div class="reviews">
      <p class="dp-empty-stores">
        هنوز نظری ثبت نشده است. پس از نخستین خریدها، نظر مشتریان اینجا دیده می‌شود.
      </p>
    </div>
  </div>
</section>

<!-- ===== ۳. چرا دیجی‌پوش ===== -->
<section id="why">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">{svg(I['sparkle'], 'ico ico-sm')} تجربه‌ی دیجی‌پوش</span>
      <h2 class="holo">چرا دیجی‌پوش؟</h2>
      <p>شش تعهد روشن که خرید پوشاک را به تجربه‌ای آرام و مطمئن تبدیل می‌کند</p>
    </div>
    <div class="grid-3">
{why_html}
    </div>
  </div>
</section>

<!-- ===== ۴. انتخاب فروشندگان ===== -->
<section>
  <div class="wrap">
    <div class="panel gbox">
      <div class="head reveal">
        <span class="eyebrow">{svg(I['badge'], 'ico ico-sm')} معیارهای پذیرش</span>
        <h2 class="holo">انتخاب دقیق فروشندگان</h2>
        <p>پیش از آنکه ویترین فروشگاهی دیده شود، از چهار دروازه عبور می‌کند</p>
      </div>
      <ul class="crit-list">
{criteria_html}
      </ul>
    </div>
  </div>
</section>

<!-- ===== ۵. آمار و زمان پاسخ ===== -->
<section>
  <div class="wrap">
    <div class="panel gbox">
      <div class="head reveal">
        <h2 class="holo">در یک نگاه</h2>
        <p>آمار زنده‌ی بازارگاه پوشاک زنانه</p>
      </div>
      <div class="stats">
{stats_html}
      </div>
    </div>
  </div>
</section>

<!-- ===== ۱۱. ثبت‌نام ===== -->
<section>
  <div class="wrap">
    <div class="cta gbox reveal">
      <span class="eyebrow">{svg(I['sparkle'], 'ico ico-sm')} عضویت</span>
      <h2 class="holo">به خانواده بزرگ دیجی‌پوش بپیوندید</h2>
      <p>حساب کاربری بسازید تا ویترین‌های تازه و فروشگاه‌های مورد علاقه‌تان را دنبال کنید</p>
      <button class="btn-gold btn-cta" type="button">ساخت حساب {svg(I['arrow'], 'ico ico-sm')}</button>
    </div>
  </div>
</section>

<!-- ===== ۱۲. فوتر ===== -->
</main>

<footer class="footer gbox" id="site-footer">
  <div class="footer-grid">

    <div class="footer-col">
      <div class="footer-brand">
        <span class="footer-mark">د</span>
        <span class="footer-brand-txt">
          <strong>دیجی‌پوش</strong>
          <small>بازارگاه ممتاز فروشندگان مد</small>
        </span>
      </div>
      <p>بازارگاه لوکس مد ایران؛ جایی که فروشندگان معتبر و پوشاک اصیل کنار هم می‌آیند تا خرید مد به تجربه‌ای آرام و قابل اعتماد تبدیل شود.</p>
      <div class="socials">
        <a href="#" class="" aria-label="اینستاگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/></svg></a>
        <a href="#" class="" aria-label="تلگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/></svg></a>
        <a href="#" class="" aria-label="گفت‌وگو"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/></svg></a>
      </div>
    </div>

    <div class="footer-col">
      <h3>بخش‌های دیجی‌پوش</h3>
      <ul>
        <li><a href="../index.html">صفحه‌ی اصلی</a></li>
        <li><a href="../man/index.html">لباس مردانه</a></li>
        <li><a href="../kids/index.html">لباس بچگانه</a></li>
        <li><a href="../teen/index.html">تینیجر</a></li>
        <li><a href="#live-products">ویترین محصولات</a></li>
        <li><a href="#stores">فروشندگان</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h3>پشتیبانی</h3>
      <ul>
        <li><a href="#how"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M4 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m7.5 6 -3.5 3.5L7.5 13"/></svg> راهنمای خرید</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/></svg> پیگیری سفارش</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg> شرایط بازگشت کالا</a></li>
        <li><a href="#why"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/></svg> پرسش‌های متداول</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h3>فروشندگان</h3>
      <ul>
        <li><a href="../seller/seller-signup.html">ثبت‌نام فروشنده</a></li>
        <li><a href="../seller/seller-login.html">ورود به پنل</a></li>
        <li><a href="../admin/admin-login.html">ورود مدیریت</a></li>
        <li><a href="#why">شرایط پذیرش</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h3>ارتباط با ما</h3>
      <ul class="footer-contact">
        <li><a href="tel:02100000000"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.8 1.8 0 0 1-2 1.8A15.5 15.5 0 0 1 4.7 6a1.8 1.8 0 0 1 1.8-2Z"/></svg> <span>۰۲۱ ـ ۰۰۰۰ ۰۰۰۰</span></a></li>
        <li><a href="mailto:hello@digipoosh.ir"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 5.5L20 7"/></svg> <span>hello@digipoosh.ir</span></a></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/></svg> <span>تهران، خیابان ولیعصر</span></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/></svg> <span>هر روز، ۹ صبح تا ۹ شب</span></li>
      </ul>
      <p class="fnote">از مجموعه‌های تازه و ویترین‌های نو باخبر شوید</p>
      <form class="news" id="newsletterForm">
        <input type="email" placeholder="ایمیل خود را وارد کنید" required aria-label="ایمیل" />
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

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="./script.js" defer></script>
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

open('/home/user/woman/index.html', 'w', encoding='utf-8').write(html)
print('built', len(html), 'chars')
