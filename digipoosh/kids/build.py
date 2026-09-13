# -*- coding: utf-8 -*-
"""Generator for DigiPoosh — Children's Fashion page (KIDS) — Joyful Premium."""

SW = 'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"'


def svg(body, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{body}</svg>'


I = {
 'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
 'bag': '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
 'user': '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'trophy': '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5A2.5 2.5 0 0 0 8 10M16 5.5h2.5A2.5 2.5 0 0 1 16 10"/><path d="M12 13v3.5M9 20h6l-.6-3.5H9.6z"/>',
 'muscle': '<path d="M5 15.5c0-3 1.6-5 4-5 1.6 0 2.4.8 3.4 1.8 1.2 1.2 2.6 1.2 3.6 1.2 2 0 3 1.2 3 3s-1.6 3.5-4.5 3.5H8a3 3 0 0 1-3-3z"/><path d="M9 10.5V6a2 2 0 0 1 4 0v2"/>',
 'palette': '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.4-1-1.8-1-2.9 0-.8.7-1.4 1.6-1.4h1.5c2.2 0 4.1-1.6 4.1-4 0-4-3.6-7-8-7Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
 'coin': '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M14.5 9.8c-.6-.7-1.5-1-2.5-1-1.4 0-2.4.7-2.4 1.8 0 2.4 5 1.3 5 3.7 0 1.1-1 1.9-2.6 1.9-1.1 0-2-.4-2.6-1.1"/>',
 'shield': '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
 'heart': '<path d="M12 20s-7-4.3-7-9.2A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/>',
 'baby': '<circle cx="12" cy="9" r="5"/><path d="M9.5 8.5h.01M14.5 8.5h.01"/><path d="M10.2 11.2a2.6 2.6 0 0 0 3.6 0"/><path d="M6.5 19.5a5.5 5.5 0 0 1 11 0"/>',
 'child': '<circle cx="12" cy="6.5" r="2.8"/><path d="M12 9.3v6M8 12h8M9.5 20.5 12 15.3l2.5 5.2"/>',
 'teen': '<circle cx="12" cy="5.8" r="2.6"/><path d="M12 8.4v6.2M7.5 11.2h9M9 20.5l3-5.9 3 5.9"/>',
 'star': '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
 'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'badge': '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/>',
 'shop': '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'hanger': '<path d="M12 8.5a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 8.5v2l7.2 4.6a1.8 1.8 0 0 1-1 3.4H5.8a1.8 1.8 0 0 1-1-3.4L12 10.5"/>',
 'package': '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
 'cart': '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
 'clock': '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'quote': '<path d="M9.5 6.5C7 7.8 5.5 10 5.5 12.8c0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/><path d="M18 6.5c-2.5 1.3-4 3.5-4 6.3 0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/>',
 'sparkle': '<path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z"/><path d="M18.5 4v3M20 5.5h-3"/>',
 'arrow': '<path d="M14 6l-6 6 6 6"/>',
 'inst': '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/>',
 'send': '<path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/>',
 'chat': '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>',
 'globe': '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/>',
 'puzzle': '<path d="M10 4.5h4a1 1 0 0 1 1 1v1.2a1.6 1.6 0 1 0 2.8 1.05 1 1 0 0 1 1.7.75v4a1 1 0 0 1-1 1h-1.2a1.6 1.6 0 1 0-1.05 2.8 1 1 0 0 1 .75 1.7h-4a1 1 0 0 1-1-1v-1.2a1.6 1.6 0 1 0-2.8-1.05 1 1 0 0 1-1.7-.75v-4a1 1 0 0 1 1-1h1.2A1.6 1.6 0 1 0 9.25 6.2 1 1 0 0 1 10 4.5Z"/>',
 'blocks': '<rect x="3.5" y="12.5" width="8" height="8"/><rect x="12.5" y="12.5" width="8" height="8"/><rect x="8" y="3.5" width="8" height="8"/>',
 'brush': '<path d="M15.5 4.5 19.5 8.5 11 17H7v-4z"/><path d="m14 6 4 4"/><path d="M6 21c-1.5 0-2.5-1-2.5-2.5S5 17 5.5 15.5"/>',
 'bear': '<circle cx="7.2" cy="6.6" r="2.4"/><circle cx="16.8" cy="6.6" r="2.4"/><path d="M12 20.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/><path d="M10 13h.01M14 13h.01"/><path d="M10.7 16a2.4 2.4 0 0 0 2.6 0"/>',
 'car': '<path d="M4 15.5h16v-3l-2-.6-1.8-3.4H7.8L6 11.9l-2 .6z"/><path d="M4 15.5v2.2h2.6v-2.2M17.4 15.5v2.2H20v-2.2"/><circle cx="8" cy="15.5" r="1.1"/><circle cx="16" cy="15.5" r="1.1"/>',
 'carousel': '<path d="m12 3 8 4H4z"/><path d="M6 7v8M18 7v8M12 7v13"/><path d="M4.5 15.5h15"/>',
 'ruler': '<rect x="2.8" y="8.5" width="18.4" height="7" rx="1.6"/><path d="M7 8.5v3M11 8.5v4.2M15 8.5v3M19 8.5v4.2"/>',
 'leaf': '<path d="M5 19c0-7 4.5-11 14-11 0 8.5-4.5 12-9.5 12A4.5 4.5 0 0 1 5 19Z"/><path d="M9 15.5c2-2.6 4.4-4.3 7.5-5.5"/>',
}

STAR_FULL = f'<svg class="ico star-full" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="currentColor" aria-hidden="true">{I["star"]}</svg>'
STAR_EMPTY = f'<svg class="ico star-empty" viewBox="0 0 24 24" {SW} aria-hidden="true">{I["star"]}</svg>'


def stars(n):
    return f'<span class="stars" role="img" aria-label="امتیاز {n} از ۵">' + STAR_FULL * n + STAR_EMPTY * (5 - n) + '</span>'


# ------------------------------------------------------------------ SLIDES
slides = [
    ("35537", "مجموعه‌ی بهار و تابستان", "دنیای", "رنگ‌ها",
     "لباس‌هایی که بازی را شیرین‌تر می‌کنند",
     "پنبه‌ی ارگانیک با رنگ‌های بی‌ضرر و استاندارد"),
    ("1912868", "استایل مدرسه", "شروع", "تازه",
     "برای روزهای پرانرژی کلاس و مدرسه",
     "پارچه‌ی مقاوم، مناسب شست‌وشوی مکرر"),
    ("1620760", "لباس مهمانی", "لحظه‌های", "خاص",
     "برای جشن‌ها و روزهای به‌یادماندنی",
     "دوخت ظریف با آستر نرم و ضدحساسیت"),
    ("3661264", "بازی و ورزش", "انرژی", "بی‌پایان",
     "راحتی کامل برای دویدن و بازی کردن",
     "کشسانی بالا و درزهای تقویت‌شده"),
]

slide_html = "\n".join(f'''      <div class="slide{' active' if i == 0 else ''}" role="group" aria-roledescription="اسلاید" aria-label="اسلاید {i+1} از {len(slides)}">
        <img src="https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1300&w=2000" alt="کودک با لباس شیک و شاد" {'fetchpriority="high"' if i == 0 else 'loading="lazy"'} />
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <span class="slide-badge">{svg(I['sparkle'], 'ico ico-mini')} {badge}</span>
          <{"h1" if i == 0 else "h2 class=\"slide-title\""}>{t1} <span class="highlight">{t2}</span></{"h1" if i == 0 else "h2"}>
          <p>{sub}</p>
          <span class="slide-meta">{meta}</span>
          <button class="btn-slider" type="button" data-scroll="#stores">
            <span>مشاهده مجموعه</span>{svg(I['arrow'], 'ico ico-arrow')}
          </button>
        </div>
      </div>''' for i, (pid, badge, t1, t2, sub, meta) in enumerate(slides))

dots = "\n".join(f'      <button class="dot{" active" if i == 0 else ""}" type="button" aria-label="اسلاید {i+1}"></button>'
                 for i in range(len(slides)))

# ------------------------------------------------------------------ WHY (6)
why = [
    ('trophy', 'c1', 'کیفیت بالا', 'لباس‌هایی که با عشق و دقت دوخته شده‌اند',
     'هر قطعه پیش از انتشار از نظر دوخت، درز و کیفیت پارچه بررسی می‌شود.'),
    ('muscle', 'c2', 'دوام عالی', 'برای بازی و فعالیت روزمره کودکان',
     'درزهای تقویت‌شده و پارچه‌ی مقاوم در برابر شست‌وشوی مکرر.'),
    ('palette', 'c3', 'طراحی شیک', 'استایل کودکانه با کیفیت لوکس',
     'رنگ‌بندی هماهنگ که کنار هم ست‌های زیبایی می‌سازد.'),
    ('coin', 'c4', 'قیمت منصفانه', 'کیفیت بالا با قیمت مناسب',
     'قیمت‌ها شفاف‌اند و هیچ هزینه‌ی پنهانی در سفارش وجود ندارد.'),
    ('shield', 'c5', 'امنیت کودک', 'پارچه‌های استاندارد و ایمن',
     'رنگ‌های بی‌ضرر، بدون دکمه‌های ریز خطرناک برای نوزادان.'),
    ('heart', 'c6', 'رضایت مادران', 'امتحان شده با هزاران مادر راضی',
     'نظرات واقعی مادران، راهنمای انتخاب شما در هر فروشگاه است.'),
]

why_html = "\n".join(f'''      <article class="why-card gold-rainbow-border">
        <span class="why-icon {cc}">{svg(I[ic])}</span>
        <h3>{t}</h3>
        <p>{d}</p>
        <span class="card-note">{n}</span>
      </article>''' for ic, cc, t, d, n in why)

# ------------------------------------------------------------------ AGES (3)
ages = [
    ('baby', 'a1', 'نوزاد', '۰ تا ۲ سال', 'پنبه‌ی نرم و بدون درز اذیت‌کننده', '۱۲۰ محصول'),
    ('child', 'a2', 'کودک', '۳ تا ۶ سال', 'رنگ‌های شاد با دوام بالا برای بازی', '۲۴۰ محصول'),
    ('teen', 'a3', 'نوجوان', '۷ تا ۱۲ سال', 'استایل مستقل با برش‌های امروزی', '۱۸۵ محصول'),
]

ages_html = "\n".join(f'''      <button class="age-category {cc}" type="button">
        <span class="age-icon">{svg(I[ic])}</span>
        <h3>{t}</h3>
        <span class="age-range">{r}</span>
        <p>{d}</p>
        <span class="age-count">{c}</span>
      </button>''' for ic, cc, t, r, d, c in ages)

# ------------------------------------------------------------------ STEPS
steps = [
    ('۱', 'hanger', 's1', 'انتخاب ست', 'ست مورد نظرت رو انتخاب کن'),
    ('۲', 'cart', 's2', 'سفارش', 'سفارش رو ثبت کن'),
    ('۳', 'package', 's3', 'تحویل', 'درب منزل تحویل بگیر'),
]

steps_html = "\n".join(f'''      <div class="how-step">
        <div class="step-circle {cc}"><span>{num}</span>{svg(I[ic], 'ico step-ico')}</div>
        <h3>{t}</h3>
        <p>{d}</p>
      </div>''' for num, ic, cc, t, d in steps)

# ------------------------------------------------------------------ REVIEWS
# ------------------------------------------------------------------ PAGE
html = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="دیجی‌پوش | لباس بچگانه — ویترین فروشگاه‌های منتخب پوشاک کودک با کیفیت و ایمنی تضمین‌شده." />
  <meta name="theme-color" content="#f5f0e8" />
  <title>دیجی‌پوش | لباس بچگانه</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
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
<link rel="canonical" href="https://digipoosh.ir/kids/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fa_IR" />
  <meta property="og:site_name" content="دیجی‌پوش" />
  <meta property="og:url" content="https://digipoosh.ir/kids/" />
  <meta property="og:title" content="دیجی‌پوش | لباس بچگانه" />
  <meta property="og:description" content="ویترین فروشگاه‌های تخصصی پوشاک کودک در دیجی‌پوش." />
  <meta property="og:image" content="https://digipoosh.ir/favicon.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="دیجی‌پوش | لباس بچگانه" />
  <meta name="twitter:description" content="ویترین فروشگاه‌های تخصصی پوشاک کودک در دیجی‌پوش." />
  <meta name="twitter:image" content="https://digipoosh.ir/favicon.svg" />
  <script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{ "@type": "Organization", "@id": "https://digipoosh.ir/#org", "name": "دیجی‌پوش", "url": "https://digipoosh.ir/", "logo": "https://digipoosh.ir/favicon.svg" }},
    {{ "@type": "WebSite", "@id": "https://digipoosh.ir/#site", "url": "https://digipoosh.ir/", "name": "دیجی‌پوش", "inLanguage": "fa-IR", "publisher": {{ "@id": "https://digipoosh.ir/#org" }} }},
    {{ "@type": "CollectionPage", "url": "https://digipoosh.ir/kids/", "name": "دیجی‌پوش | لباس بچگانه", "description": "دیجی‌پوش | لباس بچگانه — ویترین فروشگاه‌های تخصصی پوشاک کودک.", "inLanguage": "fa-IR", "isPartOf": {{ "@id": "https://digipoosh.ir/#site" }} }}
  ]
}}
</script>
</head>
<body data-dp-page="kids">
<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>

<!-- ===== AMBIENT PLAYGROUND (fixed, behind everything) ===== -->
<div class="page-ambient" id="pageAmbient" aria-hidden="true">
  <div class="clouds" id="clouds"></div>
  <div class="bubbles" id="bubbles"></div>
  <div class="sparkles" id="sparkles"></div>
  <div class="balls" id="balls"></div>
  <div class="toys" id="toys"></div>
  <div class="balloons" id="balloons"></div>
  <div class="flower-container" id="flowers"></div>
</div>

<!-- ===== 1. NAVBAR ===== -->
<nav class="navbar gold-rainbow-border" id="navbar" aria-label="ناوبری اصلی">
  <a class="nav-logo" href="../index.html">دیجی‌پوش</a>
  <ul class="nav-menu">
    <li><a href="../woman/index.html">لباس زنانه</a></li>
    <li><a href="../man/index.html">لباس مردانه</a></li>
    <li class="active"><a href="./index.html">لباس بچگانه</a></li>
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

<!-- ===== 2. HERO SLIDER ===== -->
<section class="hero-slider gold-rainbow-border" id="heroSlider" aria-label="مجموعه‌ی برگزیده">
  <div class="slides-wrap">
{slide_html}
  </div>

  <div class="carousel-3d" aria-hidden="true">
    <div class="carousel-roof"></div>
    <div class="carousel-ring">
      <span class="c-horse h1"></span>
      <span class="c-horse h2"></span>
      <span class="c-horse h3"></span>
      <span class="c-horse h4"></span>
    </div>
    <div class="carousel-pole"></div>
  </div>

  <div class="slider-progress" aria-hidden="true"><div class="slider-progress-bar"></div></div>

  <div class="slider-dots">
{dots}
  </div>
</section>

<!-- ===== 4. AGE CATEGORIES (no border) ===== -->
<section class="ages-section" id="ages">
  <div class="head">
    <span class="eyebrow">{svg(I['ruler'], 'ico ico-mini')} گروه سنی</span>
    <h2>برای کدام سن؟</h2>
    <p>ویترین را بر اساس سن فرزندتان انتخاب کنید</p>
  </div>
  <div class="ages-grid">
{ages_html}
  </div>
</section>

<!-- ===== 6. STORE SHOWCASE ===== -->
<section class="stores-section" id="stores">
  <div class="head">
    <span class="eyebrow">{svg(I['shop'], 'ico ico-mini')} ویترین منتخب</span>
    <h2>فروشگاه‌های برتر</h2>
    <p>با فروشندگان پوشاک کودک دیجی‌پوش و تخصص هرکدام آشنا شوید</p>
  </div>
  <div class="stores-grid">
      <p class="dp-empty-stores">
        هنوز فروشگاهی در این بخش ثبت نشده است.
        <a href="../seller/seller-signup.html">اولین فروشنده باشید</a>
      </p>
  </div>
</section>

<!-- ===== 9. HOW IT WORKS (no border) ===== -->
<section class="how-section" id="how">
  <div class="head">
    <span class="eyebrow">{svg(I['check'], 'ico ico-mini')} مسیر خرید</span>
    <h2>چطور کار می‌کند؟</h2>
    <p>در سه گام ساده، از انتخاب تا تحویل</p>
  </div>
  <div class="how-grid">
{steps_html}
  </div>
</section>

<!-- ===== 10. MOTHER REVIEWS (no border) ===== -->
<section class="reviews-section" id="reviews">
  <div class="head">
    <span class="eyebrow">{svg(I['heart'], 'ico ico-mini')} تجربه‌ی مادران</span>
    <h2>نظرات مادران</h2>
    <p>آنچه مادران درباره‌ی کیفیت و تجربه‌ی خرید گفته‌اند</p>
  </div>
  <div class="reviews-grid">
      <p class="dp-empty-stores">
        هنوز نظری ثبت نشده است. پس از نخستین خریدها، نظر مشتریان اینجا دیده می‌شود.
      </p>
  </div>
</section>

<!-- ===== 3. WHY DIGIPOOSH KIDS ===== -->
<section class="why-section" id="why">
  <div class="head">
    <span class="eyebrow">{svg(I['sparkle'], 'ico ico-mini')} تعهد دیجی‌پوش کودک</span>
    <h2>چرا دیجی‌پوش؟</h2>
    <p>شش دلیل روشن که خرید لباس کودک را برای مادران آسان و مطمئن می‌کند</p>
  </div>
  <div class="why-grid">
{why_html}
  </div>
</section>

<!-- ===== 5. SELECT SELLERS ===== -->
<section class="select-sellers gold-rainbow-border">
  <div class="head">
    <span class="eyebrow">{svg(I['badge'], 'ico ico-mini')} معیارهای پذیرش</span>
    <h2>انتخاب دقیق فروشندگان</h2>
    <p>پیش از آنکه ویترین فروشگاهی دیده شود، از این دروازه‌ها عبور می‌کند</p>
  </div>
  <ul class="criteria-list">
    <li>
      <span class="crit-icon c1">{svg(I['check'])}</span>
      <div><strong>استاندارد ارائه</strong><p>فقط فروشگاه‌هایی که استاندارد تصویر، بسته‌بندی و پاسخ‌گویی را رعایت کنند، دیده می‌شوند.</p></div>
    </li>
    <li>
      <span class="crit-icon c2">{svg(I['shield'])}</span>
      <div><strong>کیفیت و اصالت</strong><p>کیفیت و اصالت کالاها، اولویت اصلی دیجی‌پوش کودک است و نمونه‌ی فیزیکی بررسی می‌شود.</p></div>
    </li>
    <li>
      <span class="crit-icon c3">{svg(I['chat'])}</span>
      <div><strong>همراهی پشتیبانی</strong><p>همراهی پشتیبانی برای پاسخ‌گویی به نیازهای کودکان و مادران، در تمام مراحل خرید.</p></div>
    </li>
    <li>
      <span class="crit-icon c4">{svg(I['leaf'])}</span>
      <div><strong>ایمنی مواد</strong><p>رنگ‌های بی‌ضرر، پارچه‌ی ضدحساسیت و نبود قطعات ریز خطرناک برای خردسالان.</p></div>
    </li>
  </ul>
</section>

<!-- ===== 11. REGISTRATION CTA ===== -->
<section class="cta-section gold-rainbow-border">
  <div class="cta-content">
    <span class="eyebrow">{svg(I['heart'], 'ico ico-mini')} عضویت</span>
    <h2>برای فرزندت بهترین رو انتخاب کن</h2>
    <p>همین حالا ثبت‌نام کن و ویترین‌های تازه و ست‌های جدید را دنبال کن</p>
    <button class="btn-cta" type="button">ثبت‌نام در دیجی‌پوش</button>
  </div>
</section>

<!-- ===== 12. LUXURY FOOTER ===== -->
</main>

<footer class="footer gold-rainbow-border" id="site-footer">
  <div class="footer-grid">

    <div class="footer-col">
      <div class="footer-brand">
        <span class="footer-mark">د</span>
        <span class="footer-brand-txt">
          <strong>دیجی‌پوش کودک</strong>
          <small>بازارگاه ممتاز فروشندگان مد</small>
        </span>
      </div>
      <p>بازارگاه پوشاک کودک؛ جایی که فروشندگان معتبر و لباس‌های باکیفیت کنار هم می‌آیند تا خرید برای مادران آسان و مطمئن باشد.</p>
      <div class="social-icons">
        <a href="#" class="social-icon s1" aria-label="اینستاگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/></svg></a>
        <a href="#" class="social-icon s2" aria-label="تلگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/></svg></a>
        <a href="#" class="social-icon s3" aria-label="گفت‌وگو"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/></svg></a>
      </div>
    </div>

    <div class="footer-col">
      <h3>بخش‌های دیجی‌پوش</h3>
      <ul>
        <li><a href="../index.html">صفحه‌ی اصلی</a></li>
        <li><a href="../woman/index.html">لباس زنانه</a></li>
        <li><a href="../man/index.html">لباس مردانه</a></li>
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
      <p class="footer-note">از ویترین‌های تازه باخبر شوید</p>
      <form class="newsletter-form" id="newsletterForm">
        <input type="email" placeholder="ایمیل خود را وارد کنید" class="newsletter-input" required aria-label="ایمیل" />
        <button type="submit" class="newsletter-btn">عضویت</button>
      </form>
    </div>

  </div>

  <div class="footer-bottom">
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

open('/home/user/kids/index.html', 'w', encoding='utf-8').write(html)
print('built', len(html), 'chars')
