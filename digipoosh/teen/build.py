# -*- coding: utf-8 -*-
"""Generator for DigiPoosh — Teen Fashion page (TEEN) — Gaming Arena."""

SW = 'stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none"'


def svg(body, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true">{body}</svg>'


I = {
 'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
 'bag': '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
 'user': '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
 'gamepad': '<path d="M7.6 8h8.8a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.3l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.6 8Z"/><path d="M7.2 11.6v2.2M6.1 12.7h2.2"/><circle cx="16.2" cy="12" r=".7"/><circle cx="17.9" cy="13.7" r=".7"/>',
 'joystick': '<circle cx="12" cy="6.5" r="2.6"/><path d="M12 9.1v5.4"/><path d="M6.5 20.5a5.5 5.5 0 0 1 11 0z"/>',
 'keyboard': '<rect x="2.8" y="7" width="18.4" height="10.5" rx="2"/><path d="M6.3 10.3h.01M9.3 10.3h.01M12.3 10.3h.01M15.3 10.3h.01M18 10.3h.01M6.3 13.3h.01M18 13.3h.01M9 16h6"/>',
 'mouse': '<rect x="7.5" y="3.5" width="9" height="17" rx="4.5"/><path d="M12 7.2v3"/>',
 'headset': '<path d="M5 14v-2a7 7 0 0 1 14 0v2"/><path d="M5 14h1.8a1.2 1.2 0 0 1 1.2 1.2v2.6A1.2 1.2 0 0 1 6.8 19H6a1 1 0 0 1-1-1z"/><path d="M19 14h-1.8a1.2 1.2 0 0 0-1.2 1.2v2.6a1.2 1.2 0 0 0 1.2 1.2h.8a1 1 0 0 0 1-1z"/>',
 'monitor': '<rect x="2.8" y="4" width="18.4" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
 'target': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.1"/>',
 'trophy': '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5A2.5 2.5 0 0 0 8 10M16 5.5h2.5A2.5 2.5 0 0 1 16 10"/><path d="M12 13v3.5M9 20h6l-.6-3.5H9.6z"/>',
 'bolt': '<path d="M13.5 3 6 13.5h5L10.5 21 18 10.5h-5z"/>',
 'flame': '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4.4-5.4-3.6-10.4-2.6 1-4.6 3.4-4.6 6 0 1-.6 1.8-1.4 1.8-.8 0-1.3-.7-1.4-1.7C5.6 12.5 6 13.9 6 15.4 6 18.6 8.4 21 12 21Z"/>',
 'shield': '<path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
 'ghost': '<path d="M5 20V11a7 7 0 0 1 14 0v9l-2.3-1.6L14.4 20l-2.4-1.6L9.6 20l-2.3-1.6z"/><path d="M9.6 10.5h.01M14.4 10.5h.01"/>',
 'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'badge': '<path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/>',
 'shop': '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
 'hanger': '<path d="M12 8.5a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 8.5v2l7.2 4.6a1.8 1.8 0 0 1-1 3.4H5.8a1.8 1.8 0 0 1-1-3.4L12 10.5"/>',
 'package': '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
 'cart': '<circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.2l2.3 10.2h10L20 8H7"/>',
 'clock': '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
 'quote': '<path d="M9.5 6.5C7 7.8 5.5 10 5.5 12.8c0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/><path d="M18 6.5c-2.5 1.3-4 3.5-4 6.3 0 2.6 1.5 4.2 3.4 4.2 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.7-2.8-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.4z"/>',
 'arrow': '<path d="M14 6l-6 6 6 6"/>',
 'inst': '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/>',
 'send': '<path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/>',
 'chat': '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>',
 'globe': '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/>',
 'ruler': '<rect x="2.8" y="8.5" width="18.4" height="7" rx="1.6"/><path d="M7 8.5v3M11 8.5v4.2M15 8.5v3M19 8.5v4.2"/>',
 'sparkle': '<path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z"/><path d="M18.5 4v3M20 5.5h-3"/>',
 'heart': '<path d="M12 20s-7-4.3-7-9.2A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/>',
 'share': '<path d="M4 12v7a1.6 1.6 0 0 0 1.6 1.6h12.8A1.6 1.6 0 0 0 20 19v-7"/><path d="M12 3.5v12M8 7.5l4-4 4 4"/>',
 'eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
 'comment': '<path d="M20.5 12.2c0 3.9-3.8 7-8.5 7a10 10 0 0 1-2.8-.4L4 20.5l1.4-3.4a6.7 6.7 0 0 1-2-4.9c0-3.9 3.8-7 8.6-7s8.5 3.1 8.5 7Z"/>',
 'levelup': '<path d="m12 4 6 6h-3.6v10H9.6V10H6z"/>',
 'wifi': '<path d="M3.5 9.5a13 13 0 0 1 17 0"/><path d="M6.6 13a8.5 8.5 0 0 1 10.8 0"/><path d="M9.7 16.4a4 4 0 0 1 4.6 0"/><circle cx="12" cy="19.5" r="1"/>',
}


def stars_score(v):
    return f'<span class="score" title="امتیاز {v} از ۱۰">{svg(I["trophy"], "ico ico-mini")}<b>{v}</b></span>'


# ------------------------------------------------------------------ SLIDES
slides = [
    ("2043590", "استایل سایبری", "قدرت پوشش", "دیجیتال",
     "استایلی که از آینده آمده",
     "پارچه‌های تکنیکال با بازتاب نور و برش‌های آینده‌نگر"),
    ("1043473", "انرژی نئونی", "درخشش در هر", "لحظه",
     "با استایل بدرخش",
     "جزئیات بازتابنده و رنگ‌های نئونی روی پایه‌ی تیره"),
    ("2100063", "ویب گیمینگ", "استایل", "قهرمانی",
     "هر روز یک بازی تازه",
     "راحتی کامل برای ساعت‌های طولانی بازی و بیرون"),
    ("1183266", "تکنولوژی فردا", "مد و", "تکنولوژی",
     "ترکیب هنر و آینده",
     "الیاف هوشمند، ضدآب و سبک برای نسل تازه"),
]

slide_html = "\n".join(f'''      <div class="slide{' active' if i == 0 else ''}" role="group" aria-roledescription="اسلاید" aria-label="اسلاید {i+1} از {len(slides)}">
        <img src="https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1300&w=2000" alt="استایل نوجوانانه" {'fetchpriority="high"' if i == 0 else 'loading="lazy"'} />
        <div class="slide-overlay"></div>
        <div class="slide-content glass-panel">
          <span class="slide-badge">{svg(I['bolt'], 'ico ico-mini')} {badge}</span>
          <{"h1" if i == 0 else "h2 class=\"slide-title\""} data-text="{t1} {t2}">{t1} <span class="highlight hl-{i}">{t2}</span></{"h1" if i == 0 else "h2"}>
          <p>{sub}</p>
          <span class="slide-meta">{meta}</span>
          <div class="rgb-strip"></div>
          <button class="btn-slider-tech" type="button" data-scroll="#stores">
            <span>ورود به میدان</span>{svg(I['arrow'], 'ico ico-arrow')}
          </button>
        </div>
      </div>''' for i, (pid, badge, t1, t2, sub, meta) in enumerate(slides))

dots = "\n".join(f'      <button class="dot{" active" if i == 0 else ""}" type="button" aria-label="اسلاید {i+1}"></button>'
                 for i in range(len(slides)))

# ------------------------------------------------------------------ WHY (6)
why = [
    ('shield', 'n1', 'اصالت تضمینی', 'هر قطعه پیش از انتشار بررسی می‌شود',
     'ترکیب الیاف، کیفیت چاپ و دوام رنگ پس از شست‌وشو کنترل می‌شود.'),
    ('bolt', 'n2', 'ترند روز', 'همگام با استایل جهانی نسل جدید',
     'ویترین‌ها هر فصل با سبک‌های تازه‌ی استریت‌ویر به‌روز می‌شوند.'),
    ('ruler', 'n3', 'سایز دقیق', 'جدول اندازه بر اساس قد و دور سینه',
     'برای برش‌های اورسایز، اندازه‌ی واقعی لباس هم درج می‌شود.'),
    ('ghost', 'n4', 'طرح محدود', 'بعضی طرح‌ها فقط یک بار تولید می‌شوند',
     'تیراژ محدود یعنی استایلت تکراری نمی‌شود.'),
    ('headset', 'n5', 'پشتیبانی سریع', 'پاسخ‌گویی بدون معطلی و ربات',
     'مشاوره‌ی انتخاب سایز و ست‌کردن رنگ‌ها رایگان است.'),
    ('package', 'n6', 'بازگشت آسان', 'هفت روز فرصت تعویض یا بازگشت',
     'بدون نیاز به توضیح دلیل، فقط کافی است ثبت کنی.'),
]

why_html = "\n".join(f'''      <article class="why-card gold-neon-border">
        <span class="hex-icon {cc}">{svg(I[ic])}</span>
        <h3>{t}</h3>
        <p>{d}</p>
        <span class="card-note">{n}</span>
      </article>''' for ic, cc, t, d, n in why)

FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
def social_bar(likes, views, cid):
    return f'''<div class="social-bar">
            <button class="like-btn" type="button" data-id="{cid}" aria-label="پسندیدن">
              {svg(I['heart'], 'ico ico-mini')}<span class="like-count">{likes}</span>
            </button>
            <span class="view-stat">{svg(I['eye'], 'ico ico-mini')}<span>{views}</span></span>
            <button class="share-btn" type="button" aria-label="هم‌رسانی">{svg(I['share'], 'ico ico-mini')}</button>
          </div>'''


# ------------------------------------------------------------------ CRITERIA
criteria = [
    ('badge', 'استاندارد ارائه', 'فقط فروشگاه‌هایی که استاندارد تصویر، بسته‌بندی و پاسخ‌گویی را رعایت کنند، در ویترین دیده می‌شوند.'),
    ('shield', 'کیفیت و اصالت', 'نمونه‌ی فیزیکی هر فروشگاه پیش از پذیرش بررسی می‌شود؛ از دوام چاپ تا کیفیت درز.'),
    ('shop', 'هویت مستقل', 'هر فروشگاه ویترینی با زبان بصری خودش دارد و می‌تواند سبک خاصش را منتقل کند.'),
    ('headset', 'پاسخ‌گویی واقعی', 'پیام‌ها را آدم‌ها جواب می‌دهند، نه ربات؛ و زمان پاسخ هر فروشگاه ثبت می‌شود.'),
]

criteria_html = "\n".join(f'''      <li>
        <span class="crit-hex">{svg(I[ic])}</span>
        <div><strong>{t}</strong><p>{d}</p></div>
      </li>''' for ic, t, d in criteria)

# ------------------------------------------------------------------ SPEED STATS
speed = [
    ('clock', '۴۰ دقیقه', 'میانگین زمان پاسخ'),
    ('check', '۹۴٪', 'نرخ رضایت از سایز'),
    ('shop', '۹۵', 'فروشگاه فعال نوجوان'),
    ('wifi', '۱٬۲۴۰', 'کاربر آنلاین همین حالا'),
]

speed_html = "\n".join(f'''      <div class="speed-stat">
        <span class="speed-ico">{svg(I[ic])}</span>
        <span class="speed-num">{n}</span>
        <span class="speed-label">{l}</span>
      </div>''' for ic, n, l in speed)

# ------------------------------------------------------------------ STEPS
steps = [
    ('۰۱', 'user', 'n1', 'عضویت', 'حساب بساز و سایز و سلیقه‌ات رو ثبت کن'),
    ('۰۲', 'target', 'n2', 'انتخاب', 'بین ویترین‌ها بگرد و استایلت رو پیدا کن'),
    ('۰۳', 'package', 'n3', 'دریافت', 'سفارش رو پیگیری کن و تحویل بگیر'),
]

steps_html = "\n".join(f'''      <div class="step-card">
        <span class="step-num">{num}</span>
        <span class="hex-icon small {cc}">{svg(I[ic])}</span>
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
  <meta name="description" content="دیجی‌پوش | تینیجر — ویترین استایل نوجوانانه با فروشگاه‌های منتخب و ترندهای روز." />
  <meta name="theme-color" content="#0a0a0a" />
  <title>دیجی‌پوش | تینیجر</title>
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
<link rel="canonical" href="https://digipoosh.ir/teen/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fa_IR" />
  <meta property="og:site_name" content="دیجی‌پوش" />
  <meta property="og:url" content="https://digipoosh.ir/teen/" />
  <meta property="og:title" content="دیجی‌پوش | تینیجر" />
  <meta property="og:description" content="ویترین فروشگاه‌های تخصصی پوشاک نوجوان در دیجی‌پوش." />
  <meta property="og:image" content="https://digipoosh.ir/favicon.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="دیجی‌پوش | تینیجر" />
  <meta name="twitter:description" content="ویترین فروشگاه‌های تخصصی پوشاک نوجوان در دیجی‌پوش." />
  <meta name="twitter:image" content="https://digipoosh.ir/favicon.svg" />
  <script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{ "@type": "Organization", "@id": "https://digipoosh.ir/#org", "name": "دیجی‌پوش", "url": "https://digipoosh.ir/", "logo": "https://digipoosh.ir/favicon.svg" }},
    {{ "@type": "WebSite", "@id": "https://digipoosh.ir/#site", "url": "https://digipoosh.ir/", "name": "دیجی‌پوش", "inLanguage": "fa-IR", "publisher": {{ "@id": "https://digipoosh.ir/#org" }} }},
    {{ "@type": "CollectionPage", "url": "https://digipoosh.ir/teen/", "name": "دیجی‌پوش | تینیجر", "description": "دیجی‌پوش | تینیجر — ویترین فروشگاه‌های تخصصی پوشاک نوجوان.", "inLanguage": "fa-IR", "isPartOf": {{ "@id": "https://digipoosh.ir/#site" }} }}
  ]
}}
</script>
</head>
<body data-dp-page="teen">
<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>

<!-- ===== AMBIENT ARENA ===== -->
<div class="page-ambient" aria-hidden="true">
  <div class="gaming-mesh"></div>
  <div class="neon-glow g1"></div>
  <div class="neon-glow g2"></div>
  <div class="neon-glow g3"></div>
  <div class="scanline"></div>
  <div class="gaming-icons" id="gamingIcons"></div>
  <div class="pixels" id="pixels"></div>
  <div class="neon-shapes" id="neonShapes"></div>
</div>

<!-- ===== 1. NAVBAR ===== -->
<nav class="navbar gold-neon-border" id="navbar" aria-label="ناوبری اصلی">
  <a class="nav-logo" href="../index.html">دیجی‌پوش</a>
  <ul class="nav-menu">
    <li><a href="../woman/index.html">لباس زنانه</a></li>
    <li><a href="../man/index.html">لباس مردانه</a></li>
    <li><a href="../kids/index.html">لباس بچگانه</a></li>
    <li><a class="sh-ai" href="../digiai.html">دیجی AI</a></li>
    <li class="active"><a href="./index.html">تینیجر</a></li>
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
    <span class="online-pill">{svg(I['wifi'], 'ico ico-mini')} <b id="onlineCount">۱۲۴۰</b> آنلاین</span>
  </div>
</nav>

<main id="main">

<!-- ===== 2. HERO SLIDER ===== -->
<section class="hero-slider gold-neon-border" id="heroSlider" aria-label="مجموعه‌ی برگزیده">
  <div class="slides-wrap">
{slide_html}
  </div>

  <div class="hero-hud">
    <span class="hud-item">{svg(I['gamepad'], 'ico ico-mini')} استایل نسل جدید</span>
    <span class="hud-item">{svg(I['bolt'], 'ico ico-mini')} ترند فصل</span>
  </div>

  <div class="slider-progress" aria-hidden="true"><div class="slider-progress-bar"></div></div>

  <div class="slider-dots">
{dots}
  </div>
</section>

<!-- ===== 6. STORE SHOWCASE ===== -->
<section class="stores-section" id="stores">
  <div class="head">
    <span class="eyebrow">{svg(I['trophy'], 'ico ico-mini')} جدول برترین‌ها</span>
    <h2>فروشگاه‌های برتر</h2>
    <p>فروشندگان استایل نوجوانانه‌ی دیجی‌پوش</p>
  </div>
  <div class="stores-grid">
      <p class="dp-empty-stores">
        هنوز فروشگاهی در این بخش ثبت نشده است.
        <a href="../seller/seller-signup.html">اولین فروشنده باشید</a>
      </p>
  </div>
</section>

<!-- ===== 9. HOW IT WORKS (no border) ===== -->
<section class="steps-section" id="how">
  <div class="head">
    <span class="eyebrow">{svg(I['levelup'], 'ico ico-mini')} مسیر خرید</span>
    <h2>سه مرحله تا استایل تازه</h2>
    <p>از ساخت حساب تا تحویل سفارش، بدون پیچیدگی</p>
  </div>
  <div class="steps-grid">
{steps_html}
  </div>
</section>

<!-- ===== 10. TEEN REVIEWS (no border) ===== -->
<section class="reviews-section" id="reviews">
  <div class="head">
    <span class="eyebrow">{svg(I['chat'], 'ico ico-mini')} نظر کاربرها</span>
    <h2>تجربه‌ی دیگران</h2>
    <p>آنچه نوجوان‌ها درباره‌ی کیفیت و خریدشان گفته‌اند</p>
  </div>
  <div class="reviews-grid">
      <p class="dp-empty-stores">
        هنوز نظری ثبت نشده است. پس از نخستین خریدها، نظر مشتریان اینجا دیده می‌شود.
      </p>
  </div>
</section>

<!-- ===== 3. WHY DIGIPOOSH TEEN ===== -->
<section class="why-section" id="why">
  <div class="head">
    <span class="eyebrow">{svg(I['shield'], 'ico ico-mini')} چرا دیجی‌پوش</span>
    <h2>شش دلیل برای اعتماد</h2>
    <p>چیزهایی که خرید آنلاین لباس رو برات مطمئن و بی‌دردسر می‌کنه</p>
  </div>
  <div class="why-grid">
{why_html}
  </div>
</section>

<!-- ===== 5. SELECT SELLERS ===== -->
<section class="select-sellers gold-neon-border">
  <div class="head">
    <span class="eyebrow">{svg(I['badge'], 'ico ico-mini')} معیارهای پذیرش</span>
    <h2>انتخاب دقیق فروشندگان</h2>
    <p>پیش از اینکه ویترین فروشگاهی اینجا دیده بشه، از چهار دروازه عبور می‌کنه</p>
  </div>
  <ul class="criteria-list">
{criteria_html}
  </ul>
</section>

<!-- ===== 7. RESPONSE TIME ===== -->
<section class="speed-section gold-neon-border">
  <div class="head">
    <span class="eyebrow">{svg(I['wifi'], 'ico ico-mini')} وضعیت زنده</span>
    <h2>سرعت پاسخ‌گویی</h2>
    <p>آمار لحظه‌ای بازارگاه استایل نوجوان</p>
  </div>
  <div class="speed-grid">
{speed_html}
  </div>
</section>

<!-- ===== 11. REGISTRATION CTA ===== -->
<section class="cta-section gold-neon-border">
  <div class="cta-content">
    <span class="eyebrow">{svg(I['gamepad'], 'ico ico-mini')} عضویت</span>
    <h2>به تیم دیجی‌پوش بپیوند</h2>
    <p>حساب بساز تا سایزت ذخیره بشه، ویترین‌های تازه رو دنبال کنی و طرح‌های محدود رو از دست ندی</p>
    <button class="btn-gaming large" type="button">ساخت حساب</button>
  </div>
</section>

<!-- ===== 12. FOOTER ===== -->
</main>

<footer class="footer gold-neon-border" id="site-footer">
  <div class="footer-grid">

    <div class="footer-col">
      <div class="footer-brand">
        <span class="footer-mark">د</span>
        <span class="footer-brand-txt">
          <strong>دیجی‌پوش تینیجر</strong>
          <small>بازارگاه ممتاز فروشندگان مد</small>
        </span>
      </div>
      <p>بازارگاه استایل نوجوانانه؛ جایی که فروشگاه‌های منتخب و ترندهای روز کنار هم جمع می‌شوند.</p>
      <div class="rgb-strip"></div>
      <div class="social-icons">
        <a href="#" class="social-icon" aria-label="اینستاگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.9 7.2h.01"/></svg></a>
        <a href="#" class="social-icon" aria-label="تلگرام"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20.5 4 3.8 10.6l5.9 2.2 2.2 5.9z"/><path d="m9.7 12.8 4.6-4.6"/></svg></a>
        <a href="#" class="social-icon" aria-label="گفت‌وگو"><svg class="ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.6-.35L5 20.5l1.2-3.1A6.3 6.3 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/></svg></a>
      </div>
    </div>

    <div class="footer-col">
      <h3>بخش‌های دیجی‌پوش</h3>
      <ul>
        <li><a href="../index.html">صفحه‌ی اصلی</a></li>
        <li><a href="../woman/index.html">لباس زنانه</a></li>
        <li><a href="../man/index.html">لباس مردانه</a></li>
        <li><a href="../kids/index.html">لباس بچگانه</a></li>
        <li><a href="#live-products">ویترین محصولات</a></li>
        <li><a href="#stores">فروشندگان</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h3>پشتیبانی</h3>
      <ul>
        <li><a href="#how"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M4 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m7.5 6 -3.5 3.5L7.5 13"/></svg> راهنمای خرید</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/></svg> پیگیری سفارش</a></li>
        <li><a href="../account.html#orders"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg> شرایط بازگشت کالا</a></li>
        <li><a href="#why"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/></svg> پرسش‌های متداول</a></li>
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
        <li><a href="tel:02100000000"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.8 1.8 0 0 1-2 1.8A15.5 15.5 0 0 1 4.7 6a1.8 1.8 0 0 1 1.8-2Z"/></svg> <span>۰۲۱ ـ ۰۰۰۰ ۰۰۰۰</span></a></li>
        <li><a href="mailto:hello@digipoosh.ir"><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 5.5L20 7"/></svg> <span>hello@digipoosh.ir</span></a></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/></svg> <span>تهران، خیابان ولیعصر</span></li>
        <li><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/></svg> <span>هر روز، ۹ صبح تا ۹ شب</span></li>
      </ul>
      <p class="footer-note">از طرح‌های محدود و ویترین‌های تازه باخبر شو</p>
      <form class="newsletter-form" id="newsletterForm">
        <input type="email" placeholder="ایمیل تو" class="newsletter-input" required aria-label="ایمیل" />
        <button type="submit" class="newsletter-btn">عضویت</button>
      </form>
    </div>

  </div>

  <div class="footer-bottom">
    <p>© ۱۴۰۵ دیجی‌پوش — تمامی حقوق محفوظ است.</p>
    <div class="footer-badges">
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/></svg> پرداخت امن</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3.5 14 6l3.4-.3-.3 3.4L19.5 12l-2.4 2.9.3 3.4L14 18l-2 2.5L10 18l-3.4.3.3-3.4L4.5 12l2.4-2.9-.3-3.4L10 6z"/><path d="m9.5 12 1.8 1.8 3.4-3.5"/></svg> ضمانت اصالت</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/></svg> فروشندگان معتبر</span>
      <span><svg class="ico ico-mini" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="M4 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m7.5 6 -3.5 3.5L7.5 13"/></svg> ۷ روز مهلت بازگشت</span>
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

open('/home/user/teen/index.html', 'w', encoding='utf-8').write(html)
print('built', len(html), 'chars')
