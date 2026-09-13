# -*- coding: utf-8 -*-
"""
سازنده‌ی صفحه‌ی تک‌فایلی پوشاک نوجوان دیجی‌پوش — تم گیم‌نت
— همه‌چیز در یک فایل، بدون هیچ کتابخانه‌ای
— آیکون‌ها SVG خطی (بدون ایموجی)، اصطلاحات فارسی
"""
import pathlib, json

D = pathlib.Path(__file__).parent
SW = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'


def svg(p, cls='ico', extra=''):
    return f'<svg class="{cls}" viewBox="0 0 24 24" {SW} aria-hidden="true" {extra}>{p}</svg>'


# ============================================================
# آیکون‌ها — SVG خطی
# ============================================================
I = {
  'pad':    '<path d="M7.4 8h9.2a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.1l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.4 8Z"/><path d="M7.4 12v2.6M6.1 13.3h2.6"/><circle cx="15.8" cy="12.6" r=".9"/><circle cx="17.9" cy="14.5" r=".9"/>',
  'stick':  '<circle cx="12" cy="6.5" r="2.8"/><path d="M12 9.3v4.2"/><rect x="5.5" y="13.5" width="13" height="6.5" rx="2"/><path d="M8.5 16.8h2.4M15 16.8h.01M17 16.8h.01"/>',
  'key':    '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13h.01M9 13h.01M15 13h.01M18 13h.01"/><path d="M8.5 15.5h7"/>',
  'head':   '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="2.8" y="13.5" width="4" height="6.5" rx="2"/><rect x="17.2" y="13.5" width="4" height="6.5" rx="2"/>',
  'laptop': '<rect x="4" y="5" width="16" height="10.5" rx="1.6"/><path d="M2 18.5h20"/>',
  'target': '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
  'trophy': '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.6A2.6 2.6 0 0 0 8 10.6M16 6h2.4A2.6 2.6 0 0 1 16 10.6"/><path d="M12 13.5V17M9 20.5h6l-.6-3.5H9.6z"/>',
  'bolt':   '<path d="M13.5 3 5.5 13.5h5L10.5 21 18.5 10.5h-5z"/>',
  'fire':   '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4.4-5.4-3.6-10.4-2.6 1-4.6 3.4-4.6 6 0 1-.6 1.8-1.4 1.8-.8 0-1.3-.7-1.4-1.7C5.6 12.5 6 13.9 6 15.4 6 18.6 8.4 21 12 21Z"/>',
  'rocket': '<path d="M12 2.8c3.2 2.4 5 6 5 10l-2.6 3.4H9.6L7 12.8c0-4 1.8-7.6 5-10Z"/><circle cx="12" cy="9.6" r="1.8"/><path d="M9.6 16.2 7.4 20l3.4-1.4M14.4 16.2 16.6 20l-3.4-1.4"/>',
  'spark':  '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/>',
  'shield': '<path d="M12 3.2 4.8 6v6c0 4.4 3 8.4 7.2 9.8 4.2-1.4 7.2-5.4 7.2-9.8V6z"/><path d="m9 12 2 2 4-4"/>',
  'chart':  '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  'clock':  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
  'users':  '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16.4 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.4a6 6 0 0 1 3.7 5.6"/>',
  'tag':    '<path d="M3.5 12.5V5.5a2 2 0 0 1 2-2h7l8 8-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
  'truck':  '<path d="M2.8 6.5h10.4v9.4H2.8z"/><path d="M13.2 9.6h3.6l2.6 2.8v3.5h-6.2z"/><circle cx="6.4" cy="18.4" r="1.7"/><circle cx="16.6" cy="18.4" r="1.7"/>',
  'refresh':'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.6h-4.6"/>',
  'lock':   '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  'star':   '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
  'check':  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  'user':   '<circle cx="12" cy="8.4" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  'cart':   '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
  'quote':  '<path d="M9.4 6.5C6.6 7.8 5 10.2 5 13.4c0 2.4 1.4 4.1 3.4 4.1 1.8 0 3.2-1.3 3.2-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.6 1.4-2.9 3-3.6zM19 6.5c-2.8 1.3-4.4 3.7-4.4 6.9 0 2.4 1.4 4.1 3.4 4.1 1.8 0 3.2-1.3 3.2-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.6 1.4-2.9 3-3.6z"/>',
  'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
  'burger': '<path d="M4 7h16M4 12h16M4 17h16"/>',
  'mail':   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  'shirt':  '<path d="M8.5 3.5 12 6l3.5-2.5 4.5 2.4-1.8 4.6-2.2-.7v10.7H7l0-10.7-2.2.7L3 5.9z"/>',
  'wifi':   '<path d="M3.5 9.5a13 13 0 0 1 17 0"/><path d="M6.6 13a8.5 8.5 0 0 1 10.8 0"/><path d="M9.7 16.4a4 4 0 0 1 4.6 0"/><circle cx="12" cy="19.5" r="1"/>',
  'crown':  '<path d="m3.5 7.5 3.6 3.2L12 4.5l4.9 6.2 3.6-3.2-1.6 11H5.1z"/><path d="M5.5 20h13"/>',
  'medal':  '<circle cx="12" cy="14.5" r="5"/><path d="m9 9.6-2.6-6h11.2L15 9.6"/><path d="m12 12.4.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>',
  'coin':   '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4v9.2M14.4 9.6c0-1-1-1.7-2.4-1.7s-2.4.7-2.4 1.7 1 1.6 2.4 1.9 2.4.9 2.4 1.9-1 1.7-2.4 1.7-2.4-.7-2.4-1.7"/>',
  'pin':    '<path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/>',
  'box':    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
  'eye':    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  'heart':  '<path d="M12 20.4S4.4 15.7 4.4 10.4A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.6 2.4c0 5.3-7.6 10-7.6 10Z"/>',
}

NEON = ['#8B5CF6', '#00D4FF', '#FF2D95', '#06B6D4', '#C9A84C', '#D4B85A']
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
fa = lambda n: str(n).translate(FA)

# ============================================================
# داده‌ها
# ============================================================
SLIDES = [
    ('استایل سایبری',   'قدرت پوشش دیجیتال', 'سایبر', 'استایلی که از آینده آمده', '#8B5CF6',
     'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('انرژی نئونی',     'درخشش در هر لحظه',  'نئون',  'با استایل بدرخش',           '#00D4FF',
     'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('حال‌وهوای گیمینگ','استایل قهرمانی',    'گیم',   'هر روز یک بازی تازه',       '#FF2D95',
     'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('تکنولوژی فردا',   'مد و تکنولوژی',     'تکنو',  'ترکیب هنر و آینده',         '#06B6D4',
     'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
]

WHY = [
    ('bolt',   'تحویل برق‌آسا',   'سفارشت را سریع‌تر از حریف تحویل بگیر', 0),
    ('shield', 'خرید امن',        'پرداخت رمزنگاری‌شده و ضمانت بازگشت', 1),
    ('crown',  'استایل ترند',     'همیشه یک قدم جلوتر از موج مد باش', 2),
    ('coin',   'قیمت منصفانه',    'بدون واسطه، مستقیم از فروشنده', 3),
    ('users',  'انجمن فعال',      'هزاران نوجوان، نظرهای واقعی', 4),
    ('refresh','بازگشت آسان',     'هفت روز فرصت داری نظرت را عوض کنی', 5),
]

TRENDING = [
    ('هودی اورسایز نئون',  'پوشاک نوجوان', '۸۹۰٬۰۰۰', 98, '۲.۴ هزار', 0),
    ('تی‌شرت طرح گیمینگ',  'استریت‌ویر',   '۴۲۰٬۰۰۰', 95, '۳.۱ هزار', 2),
    ('شلوار کارگو مشکی',   'روزمره',        '۱٬۲۵۰٬۰۰۰', 93, '۱.۸ هزار', 1),
    ('کاپشن بمبر سایبری',  'پاییزه',        '۲٬۱۰۰٬۰۰۰', 97, '۲.۹ هزار', 3),
    ('اسنیکر ساقدار',      'کفش',           '۱٬۶۸۰٬۰۰۰', 96, '۴.۲ هزار', 4),
    ('کوله‌پشتی تک‌بند',    'اکسسوری',       '۶۵۰٬۰۰۰', 91, '۱.۵ هزار', 5),
]

STORES = [
    ('فروشگاه استایل نوجوان', 'لباس مدرسه',        9.8, '۲.۴ هزار', 95, 'استایل مدرسه با کلاس و اعتماد به نفس', 0),
    ('بوتیک نئون',            'لباس مهمانی',       9.5, '۱.۸ هزار', 92, 'بدرخش در هر مهمانی با استایل خاص', 1),
    ('فروشگاه انرژی',         'لباس ورزشی',        9.9, '۳.۱ هزار', 98, 'انرژی و حرکت در هر قدم', 2),
    ('بوتیک دریم',            'لباس روزمره',       9.2, '۲.۰ هزار', 88, 'راحتی و شیک‌پوشی برای هر روز', 3),
    ('فروشگاه ریتم',          'استایل اینفلوئنسری',9.7, '۲.۸ هزار', 94, 'همراه با ترندهای روز دنیا', 4),
    ('بوتیک گالکسی',          'لباس مجلسی',        9.4, '۱.۵ هزار', 90, 'درخشش در شب‌های خاص', 5),
    ('فروشگاه آینده',         'اکسسوری مدرن',      9.6, '۲.۲ هزار', 93, 'جزئیات، شخصیت تو را می‌سازد', 0),
    ('بوتیک استار',           'ست کامل',           9.3, '۱.۹ هزار', 89, 'هماهنگی و زیبایی در هر ست', 2),
]

RESPONSE = [
    ('clock',  '۱۸', 'دقیقه', 'میانگین پاسخ فروشندگان', 1),
    ('truck',  '۲۴', 'ساعت',  'آماده‌سازی و ارسال سفارش', 0),
    ('chart',  '۹۶', 'درصد',  'نرخ رضایت خریداران', 2),
    ('users',  '۱۲', 'هزار',  'عضو فعال انجمن نوجوانان', 3),
]

STEPS = [
    ('user',  '۰۱', 'ساخت حساب',   'در چند ثانیه عضو شو و فروشگاه‌های محبوبت را دنبال کن'),
    ('cart',  '۰۲', 'انتخاب کالا', 'از میان صدها استایل، مال خودت را پیدا کن'),
    ('truck', '۰۳', 'تحویل سریع',  'سفارشت با بسته‌بندی مرتب به دستت می‌رسد'),
]

REVIEWS = [
    ('آرش رضایی',   'نوجوان ۱۶ ساله — تهران', 5,
     'هودی که گرفتم دقیقاً همون چیزی بود که تو عکس دیدم. جنسش ضخیم و باکیفیته و بعد از چند بار شستن هم تغییری نکرد. دوستام همه پرسیدن از کجا خریدم.', 0),
    ('نگار حسینی',  'نوجوان ۱۷ ساله — شیراز', 5,
     'راهنمای سایز خیلی دقیق بود و درست اندازه‌م شد. دو روزه رسید و بسته‌بندیش هم تمیز بود. برای مهمونی تولدم عالی شد.', 2),
    ('پارسا کریمی', 'نوجوان ۱۵ ساله — مشهد', 5,
     'قیمتش نسبت به کیفیتی که داره واقعاً منصفانه‌ست. فروشنده هم خیلی سریع جواب پیامم رو داد و راهنماییم کرد. حتماً دوباره خرید می‌کنم.', 1),
]

FOOTER = [
    ('دسته‌بندی‌ها', ['استریت‌ویر', 'لباس ورزشی', 'اکسسوری', 'کفش و اسنیکر', 'ست کامل']),
    ('پشتیبانی',    ['راهنمای سایز', 'شرایط بازگشت', 'پیگیری سفارش', 'پرسش‌های پرتکرار']),
    ('دیجی‌پوش',    ['درباره‌ی ما', 'فروشندگان برتر', 'همکاری با ما', 'تماس با ما']),
]


# ============================================================
# بخش‌های HTML
# ============================================================
def star_row(rate10):
    """امتیاز ۰ تا ۱۰ → پنج ستاره"""
    v = rate10 / 2
    full, half = int(v), (v - int(v)) >= 0.5
    out = ''
    for i in range(5):
        c = 'st-full' if i < full else ('st-half' if i == full and half else 'st-empty')
        out += f'<svg class="st {c}" viewBox="0 0 24 24" aria-hidden="true">{I["star"]}</svg>'
    return out


NAV = f'''
<header class="topbar">
  <nav class="navbar gold-neon-border" aria-label="ناوبری اصلی">
    <a class="brand" href="#top">
      <span class="brand-mark">{svg(I['pad'])}</span>
      <span class="brand-txt"><strong>دیجی‌پوش</strong><small>پوشاک نوجوان</small></span>
    </a>

    <ul class="menu">
      <li><a href="#why">چرا ما</a></li>
      <li><a href="#trend">پرطرفدارها</a></li>
      <li><a href="#stores">فروشندگان برتر</a></li>
      <li><a href="#speed">آمار زنده</a></li>
      <li><a href="#reviews">نظرها</a></li>
    </ul>

    <div class="nav-act">
      <span class="live" title="کاربران آنلاین">
        {svg(I['wifi'], 'ico ico-xs')}<b id="liveN">۱۲۴۰</b><small>آنلاین</small>
      </span>
      <button class="nav-ico" type="button" aria-label="جست‌وجو">{svg(I['search'])}</button>
      <a class="nav-cta" href="#cta">عضویت</a>
      <button class="burger" type="button" aria-label="منو" aria-expanded="false">{svg(I['burger'])}</button>
    </div>
  </nav>

  <div class="drawer" id="drawer" hidden>
    <a href="#why">چرا ما</a><a href="#trend">پرطرفدارها</a>
    <a href="#stores">فروشندگان برتر</a><a href="#speed">آمار زنده</a>
    <a href="#reviews">نظرها</a><a href="#cta">عضویت</a>
  </div>
</header>'''

# ---------- اسلایدر ----------
sl, dt = '', ''
for i, (badge, title, hi, sub, col, img) in enumerate(SLIDES):
    a = ' active' if i == 0 else ''
    sl += f'''
      <div class="slide{a}" role="group" aria-roledescription="اسلاید" aria-label="اسلاید {fa(i+1)} از {fa(len(SLIDES))}">
        <img src="{img}" alt="" {'fetchpriority="high"' if i==0 else 'loading="lazy"'} decoding="async" width="1800" height="1200" />
        <span class="scan" aria-hidden="true"></span>
        <div class="slide-shade"></div>
        <div class="slide-panel" style="--n:{col}">
          <span class="slide-badge">{svg(I['spark'],'ico ico-xs')} {badge}</span>
          <h1 data-txt="{title}">{title} <em>{hi}</em></h1>
          <p>{sub}</p>
          <a class="btn-neon" href="#stores">مشاهده مجموعه</a>
        </div>
      </div>'''
    dt += f'<button class="dot{a}" type="button" role="tab" aria-label="اسلاید {fa(i+1)}"></button>'

HERO = f'''
<section class="hero gold-neon-border" id="hero" aria-label="مجموعه‌های برگزیده">
  <div class="stage">{sl}
  </div>
  <div class="fx" id="fx" aria-hidden="true"></div>
  <div class="dots" role="tablist" aria-label="انتخاب اسلاید">{dt}</div>
  <div class="bar"><i id="barFill"></i></div>
</section>'''

# ---------- چرا ----------
why = ''.join(f'''
      <article class="why-card gold-neon-border reveal" style="--n:{NEON[c]}">
        <span class="why-ico">{svg(I[ic],'ico ico-lg')}</span>
        <h3>{t}</h3><p>{d}</p>
      </article>''' for ic, t, d, c in WHY)

WHY_S = f'''
<section class="sec" id="why">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">چرا دیجی‌پوش نوجوان</span>
      <h2>اینجا استایل، قانون بازی است</h2>
      <p>هر چیزی که یک نوجوان از یک فروشگاه آنلاین می‌خواهد، اینجا هست</p>
    </div>
    <div class="why-grid">{why}
    </div>
  </div>
</section>'''

# ---------- پرطرفدارها ----------
tr = ''
for idx, (name, cat, price, power, views, c) in enumerate(TRENDING):
    tr += f'''
      <article class="trend gold-neon-border reveal" style="--n:{NEON[c]}">
        <span class="rank">#{fa(idx+1)}</span>
        <div class="trend-top">
          <span class="trend-ico">{svg(I['shirt'],'ico ico-lg')}</span>
          <div><h3>{name}</h3><span class="trend-cat">{cat}</span></div>
        </div>
        <div class="power">
          <div class="power-row">
            <span>{svg(I['bolt'],'ico ico-xs')} محبوبیت</span><b>{fa(power)}٪</b>
          </div>
          <div class="power-bar"><i style="width:{power}%"></i></div>
        </div>
        <div class="trend-foot">
          <span class="views">{svg(I['eye'],'ico ico-xs')} {views} بازدید</span>
          <span class="price">{price}<small>تومان</small></span>
        </div>
      </article>'''

TREND_S = f'''
<section class="sec alt" id="trend">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">نبرد پرطرفدارها</span>
      <h2>داغ‌ترین‌های این هفته</h2>
      <p>بر پایه‌ی بازدید و خرید واقعی کاربران، هر هفته به‌روز می‌شود</p>
    </div>
    <div class="trend-grid">{tr}
    </div>
  </div>
</section>'''

# ---------- انتخاب فروشندگان ----------
SELECT_S = f'''
<section class="sec" id="select">
  <div class="wrap">
    <div class="select gold-neon-border reveal">
      <div class="select-body">
        <span class="eyebrow">فروشندگان منتخب</span>
        <h2>هر فروشنده‌ای اینجا راه ندارد</h2>
        <p>پیش از اینکه فروشگاهی در دیجی‌پوش باز شود، مدارک، کیفیت دوخت و
        نمونه‌کالاهایش بررسی می‌شود. تنها فروشندگانی که این مسیر را کامل کنند
        نشان «تأییدشده» می‌گیرند.</p>
        <ul class="select-list">
          <li>{svg(I['check'],'ico ico-xs')} بررسی مدارک هویتی و جواز کسب</li>
          <li>{svg(I['check'],'ico ico-xs')} آزمون کیفیت پارچه و دوخت</li>
          <li>{svg(I['check'],'ico ico-xs')} پایش پیوسته‌ی نظر خریداران</li>
          <li>{svg(I['check'],'ico ico-xs')} تعهد به پاسخ‌گویی زیر یک ساعت</li>
        </ul>
      </div>
      <div class="select-badge">
        <span class="hex">{svg(I['shield'],'ico ico-xl')}</span>
        <b>{fa(100)}٪</b><small>فروشندگان بررسی‌شده</small>
      </div>
    </div>
  </div>
</section>'''

# ---------- فروشگاه‌ها ----------
st = ''
for name, cat, rate, fans, sat, desc, c in STORES:
    st += f'''
      <article class="store gold-neon-border reveal" style="--n:{NEON[c]}">
        <div class="store-head">
          <span class="hex-sm">{svg(I['pad'],'ico')}</span>
          <span class="store-rank">{svg(I['trophy'],'ico ico-xs')} {fa(rate)}</span>
        </div>
        <h3>{name}</h3>
        <span class="store-cat">{cat}</span>
        <p class="store-desc">{desc}</p>
        <div class="stat-row">
          <div class="stat"><b>{fa(rate)}</b><small>امتیاز</small></div>
          <div class="stat"><b>{fans}</b><small>دنبال‌کننده</small></div>
          <div class="stat"><b>{fa(sat)}٪</b><small>رضایت</small></div>
        </div>
        <div class="power-bar"><i style="width:{sat}%"></i></div>
        <a class="btn-ghost" href="#cta">ورود به فروشگاه</a>
      </article>'''

STORES_S = f'''
<section class="sec alt" id="stores">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">جدول برترین‌ها</span>
      <h2>فروشندگان برتر</h2>
      <p>هشت فروشنده‌ی منتخب استایل نوجوانانه، به ترتیب امتیاز کاربران</p>
    </div>
    <div class="store-grid">{st}
    </div>
  </div>
</section>'''

# ---------- آمار زنده ----------
rp = ''.join(f'''
      <article class="resp reveal" style="--n:{NEON[c]}">
        <span class="resp-ico">{svg(I[ic],'ico ico-lg')}</span>
        <b class="resp-n">{n}<em>{u}</em></b>
        <span class="resp-t">{t}</span>
      </article>''' for ic, n, u, t, c in RESPONSE)

SPEED_S = f'''
<section class="sec" id="speed">
  <div class="wrap">
    <div class="speed gold-neon-border reveal">
      <div class="head" style="margin-bottom:26px">
        <span class="eyebrow">آمار زنده</span>
        <h2>سرعت، عدد است — نه شعار</h2>
      </div>
      <div class="resp-grid">{rp}
      </div>
    </div>
  </div>
</section>'''

# ---------- فروشنده‌ی برتر ----------
FEAT_S = f'''
<section class="sec alt" id="featured">
  <div class="wrap">
    <article class="feat gold-neon-border reveal">
      <div class="feat-media">
        <img src="https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=640"
             alt="فروشگاه انرژی" loading="lazy" decoding="async" width="640" height="760" />
        <span class="feat-crown">{svg(I['crown'],'ico ico-lg')}</span>
      </div>
      <div class="feat-body">
        <span class="eyebrow">فروشنده‌ی شماره‌ی یک ماه</span>
        <h2>فروشگاه انرژی</h2>
        <div class="feat-rate">
          <span class="stars">{star_row(9.9)}</span>
          <b>{fa(9.9)}</b><small>از {fa(3140)} نظر</small>
        </div>
        <p>فروشگاه انرژی با تمرکز روی پوشاک ورزشی و استریت‌ویر نوجوانان،
        سه ماه پیاپی صدرنشین جدول دیجی‌پوش بوده است. میانگین پاسخ‌گویی
        زیر ده دقیقه و نرخ بازگشت کالا کمتر از دو درصد.</p>
        <ul class="feat-stats">
          <li><b>{fa(9.9)}</b><span>امتیاز</span></li>
          <li><b>۳.۱ هزار</b><span>دنبال‌کننده</span></li>
          <li><b>{fa(98)}٪</b><span>رضایت</span></li>
          <li><b>{fa(4)}</b><span>سال سابقه</span></li>
        </ul>
        <a class="btn-neon" href="#cta">دیدن همه‌ی محصولات</a>
      </div>
    </article>
  </div>
</section>'''

# ---------- مراحل ----------
sp = ''.join(f'''
      <article class="step reveal" style="--n:{NEON[i]}">
        <span class="step-hex">{svg(I[ic],'ico ico-lg')}<em>{n}</em></span>
        <h3>{t}</h3><p>{d}</p>
      </article>''' for i, (ic, n, t, d) in enumerate(STEPS))

HOW_S = f'''
<section class="sec" id="how">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">چطور کار می‌کند</span>
      <h2>سه قدم تا استایل تازه</h2>
    </div>
    <div class="step-grid">{sp}
    </div>
  </div>
</section>'''

# ---------- نظرها ----------
rv = ''.join(f'''
      <article class="review reveal" style="--n:{NEON[c]}">
        <span class="q">{svg(I['quote'],'ico ico-lg')}</span>
        <div class="rv-stars"><span class="stars">{star_row(r*2)}</span></div>
        <p>{txt}</p>
        <div class="rv-who">
          <span class="rv-ava">{nm[0]}</span>
          <div><strong>{nm}</strong><small>{who}</small></div>
        </div>
      </article>''' for nm, who, r, txt, c in REVIEWS)

REV_S = f'''
<section class="sec alt" id="reviews">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">نظر کاربران</span>
      <h2>آنچه نوجوان‌ها می‌گویند</h2>
      <p>نظرهای واقعی کسانی که از دیجی‌پوش خرید کرده‌اند</p>
    </div>
    <div class="rev-grid">{rv}
    </div>
  </div>
</section>'''

# ---------- دعوت ----------
CTA_S = f'''
<section class="sec" id="cta">
  <div class="wrap">
    <div class="cta gold-neon-border reveal">
      <div class="cta-fx" aria-hidden="true"></div>
      <div class="cta-body">
        <span class="eyebrow">به جمع ما بپیوند</span>
        <h2>وقتشه استایلت رو ارتقا بدی</h2>
        <p>عضو شو تا از تخفیف‌های ویژه، محصولات تازه و ترندهای روز باخبر بشی.</p>

        <form class="cta-form" id="ctaForm" novalidate>
          <label class="sr-only" for="ctaMail">ایمیل شما</label>
          <span class="cta-field">
            {svg(I['mail'],'ico ico-sm')}
            <input id="ctaMail" type="email" placeholder="نشانی ایمیل تو" autocomplete="email" />
          </span>
          <button class="btn-neon" type="submit">عضویت رایگان</button>
        </form>
        <p class="cta-note" id="ctaNote" role="status"></p>

        <ul class="cta-perks">
          <li>{svg(I['check'],'ico ico-xs')} بدون هزینه</li>
          <li>{svg(I['check'],'ico ico-xs')} لغو در هر زمان</li>
          <li>{svg(I['check'],'ico ico-xs')} حریم خصوصی محفوظ</li>
        </ul>
      </div>
    </div>
  </div>
</section>'''

# ---------- پابرگ ----------
cols = ''.join(
    '<div class="fcol"><h4>' + t + '</h4><ul>' +
    ''.join(f'<li><a href="#top">{l}</a></li>' for l in ls) + '</ul></div>'
    for t, ls in FOOTER)

FOOT = f'''
<footer class="footer gold-neon-border" id="footer">
  <div class="wrap">
    <div class="fgrid">
      <div class="fbrand">
        <span class="brand-mark">{svg(I['pad'])}</span>
        <strong>دیجی‌پوش</strong>
        <p>بازارگاه لوکس مد ایران — بخش پوشاک نوجوان.
        جایی که استایل، سرعت و کیفیت کنار هم می‌نشینند.</p>
        <div class="fbadges">
          <span>{svg(I['shield'],'ico ico-xs')} خرید امن</span>
          <span>{svg(I['bolt'],'ico ico-xs')} ارسال سریع</span>
          <span>{svg(I['refresh'],'ico ico-xs')} بازگشت ۷ روزه</span>
        </div>
      </div>
      {cols}
    </div>
    <div class="fbottom">
      <span>© ۱۴۰۴ دیجی‌پوش — همه‌ی حقوق محفوظ است.</span>
      <span class="fmade">ساخته‌شده برای نسل تازه</span>
    </div>
  </div>
</footer>'''


# ============================================================
# CSS
# ============================================================
CSS = r'''
/* ============================================================
   دیجی‌پوش — پوشاک نوجوان | تم گیم‌نت
   طلا + نقره + نئون روی زمینه‌ی تیره
   همه‌ی انیمیشن‌ها فقط transform و opacity را حرکت می‌دهند
   ============================================================ */
:root{
  --gold:#C9A84C; --gold-b:#D4B85A; --bronze:#B8943C;
  --silver:#C0C0C0; --silver-b:#D4D4D4; --silver-d:#A8A8A8;
  --purple:#8B5CF6; --pink:#FF2D95; --blue:#00D4FF; --cyan:#06B6D4;
  --bg:#0A0A0A; --card:#141414; --sec:#1A1A1A;
  --txt:#F0F0F0; --gray:#8A7E72;
  --wrap:min(1280px,calc(100% - 40px));
  --ease:cubic-bezier(.16,1,.3,1);
}

*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}

body{
  margin:0;direction:rtl;
  font-family:Vazirmatn,system-ui,-apple-system,sans-serif;
  color:var(--txt);line-height:1.85;font-size:15px;
  background:
    radial-gradient(ellipse 55% 40% at 82% 2%,rgba(139,92,246,.16),transparent 62%),
    radial-gradient(ellipse 50% 38% at 12% 22%,rgba(0,212,255,.12),transparent 60%),
    radial-gradient(ellipse 55% 42% at 88% 78%,rgba(255,45,149,.1),transparent 60%),
    var(--bg);
  overflow-x:hidden;-webkit-font-smoothing:antialiased;
}

/* شبکه‌ی گیمینگ در پس‌زمینه */
body::before{
  content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(139,92,246,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(139,92,246,.035) 1px,transparent 1px);
  background-size:44px 44px;
}

body>*{position:relative;z-index:1}

img{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
button,input{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none}
ul{list-style:none;margin:0;padding:0}
h1,h2,h3,h4,p{margin:0}

.wrap{width:var(--wrap);margin-inline:auto}
.ico{width:22px;height:22px;flex:none}
.ico-xs{width:14px;height:14px}
.ico-sm{width:18px;height:18px}
.ico-lg{width:28px;height:28px}
.ico-xl{width:38px;height:38px}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* ============================================================
   حاشیه‌ی طلا-نئون متحرک ۲.۵px
   ============================================================ */
@keyframes goldNeonFlow{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

.gold-neon-border{
  position:relative;border-radius:14px;
  background:rgba(20,20,20,.86);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  isolation:isolate;
}

.gold-neon-border::before{
  content:"";position:absolute;inset:0;
  border-radius:inherit;padding:2.5px;
  background:linear-gradient(90deg,
    #C9A84C,#D4B85A,#8B5CF6,#00D4FF,#FF2D95,#06B6D4,
    #8B5CF6,#D4B85A,#C9A84C);
  background-size:400% 100%;
  animation:goldNeonFlow 6s linear infinite;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  pointer-events:none;z-index:1;
}

.gold-neon-border:hover::before{animation-duration:3.2s}

/* ============================================================
   نوار ناوبری
   ============================================================ */
.topbar{position:sticky;top:0;z-index:80;padding:12px 0}

.navbar{
  width:var(--wrap);margin-inline:auto;
  display:flex;align-items:center;gap:18px;padding:11px 20px;
}

.brand{display:flex;align-items:center;gap:11px}

.brand-mark{
  width:44px;height:44px;display:grid;place-items:center;
  border-radius:12px;color:var(--bg);
  background:linear-gradient(135deg,var(--gold),var(--gold-b));
  box-shadow:0 0 22px -6px rgba(201,168,76,.8);
}

.brand-txt{display:flex;flex-direction:column;line-height:1.35}
.brand-txt strong{font-size:17px;letter-spacing:.05em}
.brand-txt small{font-size:10.5px;color:var(--gray)}

.menu{display:flex;gap:clamp(10px,1.8vw,24px);margin-inline:auto}

.menu a{
  position:relative;padding:8px 3px;font-size:14px;font-weight:500;
  color:var(--silver);transition:color .3s var(--ease);
}

.menu a::after{
  content:"";position:absolute;inset-block-end:2px;inset-inline:50%;
  height:2px;border-radius:2px;
  background:linear-gradient(90deg,var(--purple),var(--blue),var(--pink));
  transition:inset-inline .32s var(--ease);
}

.menu a:hover{color:var(--txt)}
.menu a:hover::after{inset-inline:8%}

.nav-act{display:flex;align-items:center;gap:9px}

.live{
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 13px;border-radius:999px;font-size:11.5px;
  color:var(--silver);
  background:rgba(0,212,255,.08);
  border:1px solid rgba(0,212,255,.26);
}

.live svg{color:var(--blue)}
.live b{color:var(--blue);font-size:12.5px;font-weight:800}
.live small{color:var(--gray)}

.nav-ico{
  width:40px;height:40px;display:grid;place-items:center;border-radius:11px;
  color:var(--gray);border:1px solid rgba(139,92,246,.24);
  transition:background .25s var(--ease),color .25s var(--ease);
}

.nav-ico:hover{background:rgba(139,92,246,.14);color:var(--blue)}

.nav-cta{
  padding:10px 20px;border-radius:9px;
  font-size:13px;font-weight:800;letter-spacing:.04em;white-space:nowrap;
  color:var(--bg);
  background:linear-gradient(135deg,var(--gold),var(--gold-b),var(--purple));
  background-size:200% 100%;
  box-shadow:0 0 22px -8px rgba(139,92,246,.9);
  transition:transform .3s var(--ease),background-position .5s ease,box-shadow .3s ease;
}

.nav-cta:hover{transform:translateY(-2px);background-position:100% 0;
  box-shadow:0 0 30px -6px rgba(0,212,255,.9)}

.burger{display:none;width:40px;height:40px;place-items:center;
  border-radius:11px;border:1px solid rgba(139,92,246,.24)}

.drawer{
  width:var(--wrap);margin:8px auto 0;padding:10px;
  display:grid;gap:2px;border-radius:14px;
  background:rgba(18,18,18,.97);
  border:1px solid rgba(139,92,246,.3);
}

.drawer a{padding:11px 14px;border-radius:9px;font-size:14px;color:var(--silver);
  transition:background .22s var(--ease),color .22s ease}
.drawer a:hover{background:rgba(139,92,246,.14);color:var(--txt)}

/* ============================================================
   اسلایدر
   ============================================================ */
.hero{
  position:relative;width:var(--wrap);margin:6px auto 0;
  height:clamp(440px,82vh,730px);
  border-radius:16px;overflow:hidden;background:var(--bg);
}

.stage{position:absolute;inset:0}

.slide{
  position:absolute;inset:0;opacity:0;visibility:hidden;
  transition:opacity 1s var(--ease),visibility 1s;
}

.slide.active{opacity:1;visibility:visible;will-change:opacity}

.slide img{width:100%;height:100%;object-fit:cover;transform:scale(1.04);
  filter:saturate(1.1) contrast(1.05)}

.slide.active img{animation:techZoom 10s ease-out both}

@keyframes techZoom{
  from{transform:scale(1.12)}
  to{transform:scale(1.01)}
}

/* خط اسکن — حس صفحه‌ی گیمینگ */
.scan{
  position:absolute;inset:0;z-index:2;pointer-events:none;
  background:repeating-linear-gradient(0deg,
    rgba(0,212,255,.045) 0 1px,transparent 1px 3px);
}

.slide-shade{
  position:absolute;inset:0;z-index:1;
  background:
    linear-gradient(to top,rgba(6,6,8,.9) 0%,rgba(6,6,8,.42) 44%,transparent 70%),
    linear-gradient(to left,rgba(6,6,8,.6),transparent 58%);
}

.slide-panel{
  position:absolute;inset-block-end:clamp(56px,9vh,86px);
  inset-inline-start:clamp(20px,6vw,68px);
  max-width:min(560px,84%);z-index:3;
  padding:clamp(20px,2.6vw,32px) clamp(22px,3vw,38px);
  border-radius:14px;
  background:rgba(14,14,16,.62);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  border:1px solid color-mix(in srgb,var(--n) 40%,transparent);
  box-shadow:0 0 44px -18px var(--n);
}

.slide.active .slide-panel>*{animation:popIn .8s var(--ease) both}
.slide.active .slide-panel>*:nth-child(2){animation-delay:.08s}
.slide.active .slide-panel>*:nth-child(3){animation-delay:.16s}
.slide.active .slide-panel>*:nth-child(4){animation-delay:.24s}

@keyframes popIn{
  from{opacity:0;transform:translate3d(0,22px,0)}
  to{opacity:1;transform:none}
}

.slide-badge{
  display:inline-flex;align-items:center;gap:7px;
  padding:6px 15px;margin-bottom:13px;border-radius:6px;
  font-size:11.5px;font-weight:800;letter-spacing:.08em;color:var(--bg);
  background:linear-gradient(135deg,var(--gold),var(--gold-b));
}

/* ---------- افکت گلیچ ---------- */
.slide-panel h1{
  position:relative;
  font-size:clamp(28px,5vw,50px);font-weight:800;
  line-height:1.3;letter-spacing:-.01em;
}

.slide-panel h1 em{
  font-style:normal;color:var(--n);
  text-shadow:0 0 24px color-mix(in srgb,var(--n) 70%,transparent);
}

/* دو لایه‌ی رنگی که فقط هنگام گذر اسلاید می‌لرزند */
.slide-panel h1::before,
.slide-panel h1::after{
  content:attr(data-txt);
  position:absolute;inset-block-start:0;inset-inline-start:0;
  width:100%;opacity:0;pointer-events:none;
}

.slide-panel h1::before{color:var(--blue);clip-path:inset(0 0 58% 0)}
.slide-panel h1::after{color:var(--pink);clip-path:inset(56% 0 0 0)}

.slide.active .slide-panel h1::before{animation:glitchA .55s steps(2,end) 2}
.slide.active .slide-panel h1::after{animation:glitchB .55s steps(2,end) 2}

@keyframes glitchA{
  0%{opacity:.85;transform:translate3d(-3px,1px,0)}
  40%{opacity:.6;transform:translate3d(3px,-1px,0)}
  80%{opacity:.4;transform:translate3d(-2px,0,0)}
  100%{opacity:0;transform:none}
}

@keyframes glitchB{
  0%{opacity:.85;transform:translate3d(3px,-1px,0)}
  40%{opacity:.6;transform:translate3d(-3px,1px,0)}
  80%{opacity:.4;transform:translate3d(2px,0,0)}
  100%{opacity:0;transform:none}
}

.slide-panel p{margin:10px 0 20px;font-size:clamp(13.5px,1.6vw,17px);color:var(--silver)}

.btn-neon{
  display:inline-flex;align-items:center;justify-content:center;
  padding:13px 32px;border-radius:9px;
  font-size:14px;font-weight:800;letter-spacing:.05em;color:var(--bg);
  background:linear-gradient(135deg,var(--gold),var(--gold-b),var(--purple));
  background-size:200% 100%;
  box-shadow:0 0 26px -10px rgba(139,92,246,.95);
  transition:transform .3s var(--ease),background-position .55s ease,box-shadow .3s ease;
}

.btn-neon:hover{
  transform:translateY(-3px) scale(1.02);background-position:100% 0;
  box-shadow:0 0 38px -8px rgba(0,212,255,.95);
}

/* ---------- نقطه‌های لوزی ---------- */
.dots{position:absolute;inset-block-end:22px;inset-inline:0;
  display:flex;justify-content:center;gap:15px;z-index:6}

.dots .dot{
  width:13px;height:13px;border-radius:2px;
  transform:rotate(45deg);
  background:rgba(240,240,240,.14);
  border:1px solid rgba(240,240,240,.2);
  transition:transform .3s var(--ease),background .3s ease,box-shadow .3s ease;
}

.dots .dot.active{
  background:linear-gradient(135deg,var(--purple),var(--blue));
  border-color:var(--purple);
  transform:rotate(45deg) scale(1.35);
  box-shadow:0 0 18px rgba(139,92,246,.8);
}

.bar{position:absolute;inset-block-end:0;inset-inline:0;height:3px;
  background:rgba(240,240,240,.07);z-index:6}

.bar i{display:block;height:100%;width:0;
  background:linear-gradient(90deg,var(--gold),var(--purple),var(--blue),var(--pink))}

/* ============================================================
   عناصر شناور
   ============================================================ */
.fx{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
.fx span{position:absolute;display:block;will-change:transform,opacity}
.fx svg{width:100%;height:100%;display:block}

@keyframes floatShape{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);opacity:.1}
  25%{transform:translate3d(18px,-26px,0) rotate(45deg) scale(1.06);opacity:.22}
  50%{transform:translate3d(-14px,-44px,0) rotate(90deg) scale(.94);opacity:.14}
  75%{transform:translate3d(22px,-18px,0) rotate(135deg) scale(1.04);opacity:.22}
}

@keyframes particleFloat{
  0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.12}
  30%{transform:translate3d(22px,-32px,0) scale(1.3);opacity:.5}
  60%{transform:translate3d(-14px,-54px,0) scale(.8);opacity:.24}
}

@keyframes floatIcon{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.18}
  25%{transform:translate3d(17px,-26px,0) rotate(14deg);opacity:.36}
  50%{transform:translate3d(-9px,-44px,0) rotate(-9deg);opacity:.26}
  75%{transform:translate3d(13px,-17px,0) rotate(18deg);opacity:.36}
}

@keyframes bouncePop{
  0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.16}
  50%{transform:translate3d(0,-26px,0) scale(1.1);opacity:.32}
}

.f-shape{animation:floatShape 9s ease-in-out infinite}
.f-part{animation:particleFloat 12s ease-in-out infinite;border-radius:50%}
.f-icon{animation:floatIcon 7s ease-in-out infinite}
.f-pop{animation:bouncePop 3.6s ease-in-out infinite}

/* شکل‌های هندسی نئونی */
.sh-square{border:2px solid currentColor;border-radius:4px}
.sh-diamond{border:2px solid currentColor;border-radius:2px;rotate:45deg}
.sh-hex{border:2px solid currentColor;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)}

/* ============================================================
   بخش‌ها و سرتیترها
   ============================================================ */
.sec{padding:clamp(52px,7vw,86px) 0}
.sec.alt{background:linear-gradient(180deg,transparent,rgba(26,26,26,.7),transparent)}

.head{text-align:center;max-width:640px;margin:0 auto clamp(28px,4vw,44px)}

.eyebrow{
  display:inline-block;margin-bottom:9px;
  font-size:11.5px;font-weight:800;letter-spacing:.18em;
  background-image:linear-gradient(90deg,var(--gold),var(--purple),var(--blue));
  -webkit-background-clip:text;background-clip:text;color:transparent;
}

.head h2{font-size:clamp(22px,3.3vw,33px);font-weight:800;line-height:1.42}
.head p{margin-top:9px;color:var(--gray);font-size:14.5px}

/* ---------- کارت‌های چرا ---------- */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}

.why-card{
  padding:26px 22px;text-align:center;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.why-card:hover{transform:translateY(-7px);
  box-shadow:0 0 40px -18px color-mix(in srgb,var(--n) 85%,transparent)}

.why-ico{
  width:60px;height:60px;margin:0 auto 13px;
  display:grid;place-items:center;border-radius:16px;color:var(--n);
  background:color-mix(in srgb,var(--n) 12%,transparent);
  border:1px solid color-mix(in srgb,var(--n) 34%,transparent);
  transition:transform .42s var(--ease);
}

.why-card:hover .why-ico{transform:scale(1.1) rotate(-5deg)}
.why-card h3{font-size:16.5px;font-weight:800;margin-bottom:5px}
.why-card p{color:var(--gray);font-size:13px;line-height:1.95}

/* ---------- پرطرفدارها ---------- */
.trend-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}

.trend{
  position:relative;padding:22px 20px;
  display:flex;flex-direction:column;gap:12px;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.trend:hover{transform:translateY(-7px);
  box-shadow:0 0 44px -20px color-mix(in srgb,var(--n) 90%,transparent)}

.rank{
  position:absolute;inset-block-start:14px;inset-inline-end:16px;
  font-size:12px;font-weight:800;color:var(--n);opacity:.8;
}

.trend-top{display:flex;align-items:center;gap:11px}

.trend-ico{
  width:50px;height:50px;flex:none;display:grid;place-items:center;
  border-radius:14px;color:var(--n);
  background:color-mix(in srgb,var(--n) 12%,transparent);
  border:1px solid color-mix(in srgb,var(--n) 30%,transparent);
}

.trend-top h3{font-size:15px;font-weight:800;line-height:1.5}
.trend-cat{font-size:11.5px;color:var(--gray)}

.power-row{display:flex;justify-content:space-between;align-items:center;
  font-size:11.5px;color:var(--gray);margin-bottom:6px}
.power-row span{display:inline-flex;align-items:center;gap:5px}
.power-row svg{color:var(--n)}
.power-row b{color:var(--n);font-size:13px;font-weight:800}

.power-bar{height:6px;border-radius:99px;overflow:hidden;
  background:rgba(240,240,240,.08)}

.power-bar i{
  display:block;height:100%;border-radius:99px;
  background:linear-gradient(90deg,var(--n),color-mix(in srgb,var(--n) 45%,white));
  box-shadow:0 0 12px -2px var(--n);
}

.trend-foot{display:flex;align-items:center;justify-content:space-between;
  gap:9px;margin-top:auto;padding-top:11px;
  border-top:1px dashed rgba(201,168,76,.22)}

.views{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--gray)}
.views svg{color:var(--silver-d)}
.price{font-size:15px;font-weight:800;color:var(--gold-b)}
.price small{font-size:10.5px;font-weight:500;color:var(--gray);margin-inline-start:3px}

/* ---------- انتخاب فروشندگان ---------- */
.select{display:grid;grid-template-columns:1.5fr .8fr;gap:28px;
  align-items:center;padding:clamp(26px,3.6vw,42px)}

.select h2{margin:6px 0 10px;font-size:clamp(20px,2.7vw,28px);font-weight:800}
.select p{color:var(--gray);font-size:14px;line-height:2.05}

.select-list{display:grid;gap:8px;margin-top:16px}
.select-list li{display:flex;align-items:center;gap:9px;font-size:13.5px;color:var(--silver)}
.select-list svg{color:var(--blue);flex:none}

.select-badge{text-align:center}

.hex{
  width:96px;height:96px;margin:0 auto 12px;
  display:grid;place-items:center;color:var(--gold);
  background:linear-gradient(160deg,rgba(201,168,76,.2),rgba(139,92,246,.12));
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
}

.select-badge b{display:block;font-size:30px;font-weight:800;color:var(--gold-b)}
.select-badge small{font-size:12px;color:var(--gray)}

/* ---------- فروشگاه‌ها ---------- */
.store-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}

.store{
  display:flex;flex-direction:column;gap:9px;padding:20px 18px;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.store:hover{transform:translateY(-8px);
  box-shadow:0 0 46px -20px color-mix(in srgb,var(--n) 90%,transparent)}

.store-head{display:flex;align-items:center;justify-content:space-between;gap:9px}

.hex-sm{
  width:46px;height:46px;display:grid;place-items:center;color:var(--n);
  background:color-mix(in srgb,var(--n) 14%,transparent);
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
}

.store-rank{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:6px;
  font-size:11.5px;font-weight:800;color:var(--gold-b);
  background:rgba(201,168,76,.12);
  border:1px solid rgba(201,168,76,.3);
}

.store h3{font-size:15px;font-weight:800;line-height:1.5}
.store-cat{font-size:11.5px;color:var(--n)}
.store-desc{font-size:12px;color:var(--gray);line-height:1.85}

.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:2px}
.stat{text-align:center;padding:8px 4px;border-radius:9px;
  background:rgba(240,240,240,.04)}
.stat b{display:block;font-size:14px;font-weight:800;color:var(--silver-b)}
.stat small{font-size:10px;color:var(--gray)}

.btn-ghost{
  margin-top:auto;padding:9px;border-radius:8px;text-align:center;
  font-size:12px;font-weight:800;letter-spacing:.04em;color:var(--n);
  border:1px solid color-mix(in srgb,var(--n) 40%,transparent);
  transition:background .28s var(--ease),color .28s ease,transform .28s var(--ease);
}

.btn-ghost:hover{
  background:linear-gradient(135deg,var(--n),color-mix(in srgb,var(--n) 40%,var(--blue)));
  color:var(--bg);transform:translateY(-2px);
}

/* ---------- آمار زنده ---------- */
.speed{padding:clamp(28px,3.6vw,44px)}
.resp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}

.resp{
  text-align:center;padding:22px 14px;border-radius:14px;
  background:rgba(240,240,240,.03);
  border:1px solid color-mix(in srgb,var(--n) 26%,transparent);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease);
}

.resp:hover{transform:translateY(-5px);
  box-shadow:0 0 34px -16px color-mix(in srgb,var(--n) 90%,transparent)}

.resp-ico{
  width:52px;height:52px;margin:0 auto 11px;display:grid;place-items:center;
  border-radius:50%;color:var(--n);
  background:color-mix(in srgb,var(--n) 12%,transparent);
}

.resp-n{display:block;font-size:32px;font-weight:800;line-height:1.2;color:var(--n);
  text-shadow:0 0 22px color-mix(in srgb,var(--n) 55%,transparent)}
.resp-n em{font-style:normal;font-size:13px;margin-inline-start:4px;color:var(--gray)}
.resp-t{font-size:12px;color:var(--gray)}

/* ---------- فروشنده‌ی برتر ---------- */
.feat{display:grid;grid-template-columns:.85fr 1.15fr;overflow:hidden;padding:0}
.feat-media{position:relative;min-height:100%;overflow:hidden;border-radius:12px 0 0 12px}
.feat-media img{width:100%;height:100%;object-fit:cover;
  transition:transform 1.1s var(--ease);filter:saturate(1.1)}
.feat:hover .feat-media img{transform:scale(1.05)}

.feat-crown{
  position:absolute;inset-block-start:14px;inset-inline-start:14px;
  width:48px;height:48px;display:grid;place-items:center;
  color:var(--bg);border-radius:12px;
  background:linear-gradient(135deg,var(--gold),var(--gold-b));
  box-shadow:0 0 24px -6px rgba(201,168,76,.9);
}

.feat-body{padding:clamp(24px,3.4vw,40px)}
.feat-body h2{margin:6px 0 8px;font-size:clamp(20px,2.7vw,28px);font-weight:800}
.feat-rate{display:flex;align-items:center;gap:9px;margin-bottom:12px}
.feat-rate b{font-size:16px;font-weight:800;color:var(--gold-b)}
.feat-rate small{font-size:12px;color:var(--gray)}
.feat-body p{color:var(--gray);font-size:13.5px;line-height:2.05}

.stars{display:inline-flex;gap:2px}
.st{width:15px;height:15px}
.st-full{fill:var(--gold);stroke:var(--gold)}
.st-half{fill:var(--gold);stroke:var(--gold);opacity:.5}
.st-empty{fill:none;stroke:rgba(138,126,114,.5)}

.feat-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:20px 0 22px}

.feat-stats li{
  padding:12px 6px;text-align:center;border-radius:11px;
  background:linear-gradient(160deg,rgba(201,168,76,.12),rgba(139,92,246,.08));
  border:1px solid rgba(201,168,76,.22);
}

.feat-stats b{display:block;font-size:17px;font-weight:800;color:var(--gold-b)}
.feat-stats span{font-size:10.5px;color:var(--gray)}

/* ---------- مراحل ---------- */
.step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
  max-width:1000px;margin-inline:auto}
.step{text-align:center;padding:8px}

.step-hex{
  position:relative;width:88px;height:88px;margin:0 auto 14px;
  display:grid;place-items:center;color:var(--n);
  background:color-mix(in srgb,var(--n) 12%,transparent);
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  transition:transform .4s var(--ease);
}

.step:hover .step-hex{transform:scale(1.07)}

.step-hex em{
  position:absolute;inset-block-start:8px;
  font-size:11px;font-style:normal;font-weight:800;
  color:var(--n);opacity:.7;
}

.step h3{font-size:17px;font-weight:800;margin-bottom:5px}
.step p{color:var(--gray);font-size:13px;line-height:1.95}

/* ---------- نظرها ---------- */
.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}

.review{
  position:relative;padding:24px 21px;border-radius:16px;
  background:rgba(20,20,20,.7);
  border:1px solid color-mix(in srgb,var(--n) 26%,transparent);
  transition:transform .38s var(--ease),box-shadow .38s var(--ease);
}

.review:hover{transform:translateY(-6px);
  box-shadow:0 0 40px -20px color-mix(in srgb,var(--n) 90%,transparent)}

.review .q{position:absolute;inset-block-start:15px;inset-inline-end:17px;
  color:var(--n);opacity:.24}

.rv-stars{margin-bottom:10px}
.review p{font-size:13px;line-height:2.1;color:var(--silver)}

.rv-who{display:flex;align-items:center;gap:11px;margin-top:15px;
  padding-top:13px;border-top:1px dashed rgba(201,168,76,.22)}

.rv-ava{
  width:40px;height:40px;flex:none;display:grid;place-items:center;
  border-radius:50%;font-size:16px;font-weight:800;color:var(--bg);
  background:linear-gradient(135deg,var(--n),var(--gold));
}

.rv-who strong{display:block;font-size:13px}
.rv-who small{font-size:11px;color:var(--gray)}

/* ---------- دعوت ---------- */
.cta{position:relative;padding:clamp(32px,5vw,56px);overflow:hidden;text-align:center}

.cta-fx{
  position:absolute;inset:-40%;
  background:
    radial-gradient(circle at 22% 30%,rgba(139,92,246,.3),transparent 42%),
    radial-gradient(circle at 78% 26%,rgba(0,212,255,.26),transparent 40%),
    radial-gradient(circle at 54% 82%,rgba(255,45,149,.24),transparent 42%),
    radial-gradient(circle at 88% 74%,rgba(201,168,76,.24),transparent 40%);
  animation:ctaDrift 24s ease-in-out infinite alternate;
  will-change:transform;
}

@keyframes ctaDrift{
  from{transform:translate3d(-3%,-2%,0) scale(1)}
  to{transform:translate3d(3%,2%,0) scale(1.09)}
}

.cta-body{position:relative;z-index:2;max-width:620px;margin-inline:auto}
.cta-body h2{margin:6px 0 10px;font-size:clamp(21px,3.1vw,31px);font-weight:800;line-height:1.45}
.cta-body p{color:var(--gray);font-size:14px}

.cta-form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:22px 0 8px}

.cta-field{
  display:flex;align-items:center;gap:9px;flex:1;min-width:230px;
  padding:0 16px;border-radius:9px;
  background:rgba(10,10,10,.72);
  border:1px solid rgba(139,92,246,.34);
  transition:border-color .25s ease,box-shadow .25s ease;
}

.cta-field:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(0,212,255,.16)}
.cta-field svg{color:var(--blue)}
.cta-field input{flex:1;min-width:0;padding:14px 0;border:0;background:none;
  outline:none;font-size:14px;color:var(--txt)}
.cta-field input::placeholder{color:var(--gray)}

.cta-note{min-height:22px;margin-top:6px;font-size:13px;font-weight:700}
.cta-note.ok{color:#4ade80}
.cta-note.bad{color:var(--pink)}

.cta-perks{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;
  margin-top:14px;font-size:12.5px;color:var(--gray)}
.cta-perks li{display:inline-flex;align-items:center;gap:5px}
.cta-perks svg{color:var(--blue)}

/* ---------- پابرگ ---------- */
.footer{width:var(--wrap);margin:0 auto 22px;
  padding:clamp(28px,4vw,42px) clamp(20px,3vw,34px)}

.fgrid{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:26px}
.fbrand .brand-mark{margin-bottom:11px}
.fbrand strong{display:block;font-size:18px;font-weight:800;margin-bottom:7px}
.fbrand p{font-size:12.5px;color:var(--gray);line-height:2;max-width:38ch}

.fbadges{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}

.fbadges span{
  display:inline-flex;align-items:center;gap:5px;padding:5px 11px;
  border-radius:6px;font-size:11px;color:var(--gray);
  background:rgba(139,92,246,.08);
  border:1px solid rgba(139,92,246,.22);
}

.fbadges svg{color:var(--blue)}
.fcol h4{font-size:13.5px;font-weight:800;margin-bottom:11px}
.fcol li{margin-bottom:7px}

.fcol a{font-size:12.5px;color:var(--gray);
  transition:color .25s ease,padding-inline-start .25s var(--ease)}

.fcol li:nth-child(1) a:hover{color:var(--purple)}
.fcol li:nth-child(2) a:hover{color:var(--blue)}
.fcol li:nth-child(3) a:hover{color:var(--pink)}
.fcol li:nth-child(4) a:hover{color:var(--cyan)}
.fcol li:nth-child(5) a:hover{color:var(--gold-b)}
.fcol a:hover{padding-inline-start:5px}

.fbottom{
  display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;
  margin-top:24px;padding-top:17px;
  border-top:1px solid rgba(139,92,246,.2);
  font-size:12px;color:var(--gray);
}

/* ============================================================
   ظهور با اسکرول
   ============================================================ */
.reveal{opacity:0;transform:translate3d(0,24px,0);
  transition:opacity .7s var(--ease),transform .7s var(--ease);
  will-change:transform,opacity}

.reveal.in{opacity:1;transform:none}
.reveal.done{will-change:auto}

/* ============================================================
   واکنش‌گرا
   ============================================================ */
@media (max-width:1080px){
  .why-grid,.trend-grid{grid-template-columns:repeat(2,1fr)}
  .store-grid,.resp-grid{grid-template-columns:repeat(2,1fr)}
  .select,.feat{grid-template-columns:1fr}
  .feat-media{min-height:290px;border-radius:12px 12px 0 0}
  .fgrid{grid-template-columns:1fr 1fr}
}

@media (max-width:900px){
  .menu{display:none}
  .burger{display:grid}
  .nav-cta,.live small{display:none}
  .rev-grid,.step-grid{grid-template-columns:1fr}
}

@media (max-width:620px){
  :root{--wrap:calc(100% - 24px)}
  .why-grid,.trend-grid,.store-grid,.resp-grid{grid-template-columns:1fr}
  .hero{height:clamp(410px,74vh,560px)}
  .slide-panel{max-width:none;inset-inline:14px}
  .feat-stats{grid-template-columns:repeat(2,1fr)}
  .fgrid{grid-template-columns:1fr}
  .fbottom{justify-content:center;text-align:center}
  .cta-form{flex-direction:column}
  .cta-field,.cta-form .btn-neon{width:100%}
  .f-shape,.f-pop{display:none}
  body::before{background-size:32px 32px}
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.001ms !important;
    scroll-behavior:auto !important;
  }
  .reveal{opacity:1;transform:none}
}
'''


# ============================================================
# JavaScript
# ============================================================
JS = r'''
/* ============================================================
   دیجی‌پوش — پوشاک نوجوان | تم گیم‌نت
   همه‌ی انیمیشن‌ها CSS هستند؛ JS فقط کلاس عوض می‌کند.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, sc) { return (sc || document).querySelector(s); };
  var $$ = function (s, sc) { return Array.prototype.slice.call((sc || document).querySelectorAll(s)); };

  var CALM  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMALL = window.matchMedia('(max-width: 620px)').matches;

  /* ============================================================
     ۱. اسلایدر — گذر با CSS، JS فقط کلاس active را جابه‌جا می‌کند
     ============================================================ */
  (function slider() {
    var slides = $$('.slide');
    var dots   = $$('.dots .dot');
    var fill   = $('#barFill');
    if (slides.length < 2) return;

    var i = 0, timer = null, GAP = 3000;

    function paint(n) {
      slides[i].classList.remove('active');
      dots[i] && dots[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active');
      dots[i] && dots[i].classList.add('active');
      resetBar();
    }

    function resetBar() {
      if (!fill) return;
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.transition = 'width ' + (GAP / 1000) + 's linear';
          fill.style.width = '100%';
        });
      });
    }

    function play() { stop(); timer = setInterval(function () { paint(i + 1); }, GAP); resetBar(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { paint(n); play(); });
    });

    var hero = $('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', play);
    }

    /* در تب پنهان می‌ایستد — مصرف باتری کمتر */
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });

    /* کشیدن انگشت */
    var x0 = null;
    hero && hero.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX;
    }, { passive: true });

    hero && hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 48) { paint(dx > 0 ? i + 1 : i - 1); play(); }
      x0 = null;
    }, { passive: true });

    play();
  })();

  /* ============================================================
     ۲. عناصر شناور — یک بار ساخته می‌شوند، بعد فقط CSS کار می‌کند
     ------------------------------------------------------------
     ۶ شکل هندسی، ۲۰ ذره، ۸ آیکون گیمینگ، ۶ نشان جهنده
     ============================================================ */
  (function decor() {
    if (CALM) return;

    var fx = $('#fx');
    if (!fx) return;

    var P = window.__DP_ICONS__;
    var SW = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
    var NEON = ['#8B5CF6', '#00D4FF', '#FF2D95', '#06B6D4', '#C9A84C', '#D4B85A'];
    var rnd = function (a, b) { return a + Math.random() * (b - a); };

    var frag = document.createDocumentFragment();

    function put(cls, size, left, top, dur, delay, color, inner, extra) {
      var el = document.createElement('span');
      el.className = cls;
      el.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + left + '%;top:' + top + '%;color:' + color + ';' +
        'animation-duration:' + dur + 's;animation-delay:-' + delay + 's;' +
        (extra || '');
      if (inner) el.innerHTML = inner;
      frag.appendChild(el);
    }

    /* ---------- ۶ شکل هندسی نئونی ---------- */
    if (!SMALL) {
      var shapes = ['sh-square', 'sh-diamond', 'sh-hex', 'sh-square', 'sh-diamond', 'sh-hex'];
      for (var s = 0; s < 6; s++) {
        put('f-shape ' + shapes[s], rnd(44, 74), rnd(4, 88), rnd(6, 82),
            rnd(9, 14), rnd(0, 9), NEON[s % NEON.length], '');
      }
    }

    /* ---------- ۲۰ ذره‌ی دیجیتال ---------- */
    var pn = SMALL ? 12 : 20;
    for (var p = 0; p < pn; p++) {
      put('f-part', rnd(3, 7), rnd(2, 96), rnd(3, 94),
          rnd(10, 16), rnd(0, 10), NEON[p % NEON.length], '',
          'background:' + NEON[p % NEON.length] +
          ';box-shadow:0 0 8px ' + NEON[p % NEON.length] + ';');
    }

    /* ---------- ۸ آیکون گیمینگ ---------- */
    var gi = ['pad', 'stick', 'key', 'head', 'laptop', 'target', 'trophy', 'bolt'];
    var gn = SMALL ? 5 : 8;
    for (var g = 0; g < gn; g++) {
      put('f-icon', rnd(24, 44), rnd(4, 90), rnd(8, 84),
          rnd(6, 10), rnd(0, 8), NEON[g % NEON.length],
          '<svg viewBox="0 0 24 24" ' + SW + '>' + P[gi[g]] + '</svg>');
    }

    /* ---------- ۶ نشان جهنده (به‌جای ایموجی، SVG) ---------- */
    if (!SMALL) {
      var pops = ['fire', 'heart', 'bolt', 'rocket', 'spark', 'star'];
      for (var b = 0; b < 6; b++) {
        put('f-pop', rnd(20, 34), rnd(5, 90), rnd(10, 86),
            rnd(3.2, 5), rnd(0, 4), NEON[(b + 2) % NEON.length],
            '<svg viewBox="0 0 24 24" ' + SW + '>' + P[pops[b]] + '</svg>');
      }
    }

    fx.appendChild(frag);
  })();

  /* ============================================================
     ۳. ظهور با اسکرول — یک ناظر، بعد قطع می‌شود
     ============================================================ */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);

        /* پس از پایان انیمیشن، لایه‌ی گرافیکی آزاد می‌شود */
        el.addEventListener('transitionend', function () {
          el.classList.add('done');
        }, { once: true });
      });
    }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });

    ['.why-grid', '.trend-grid', '.store-grid', '.resp-grid', '.step-grid', '.rev-grid']
      .forEach(function (sel) {
        $$(sel + ' > *').forEach(function (el, i) {
          el.style.transitionDelay = Math.min(i, 7) * 55 + 'ms';
        });
      });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     ۴. شمارنده‌ی آنلاین — عدد زنده، با rAF
     ============================================================ */
  (function live() {
    var el = $('#liveN');
    if (!el || CALM) return;

    var FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    var fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[+d]; }); };

    var val = 1240;

    setInterval(function () {
      /* تغییر کوچک و طبیعی */
      val += Math.round((Math.random() - 0.45) * 14);
      val = Math.max(980, Math.min(1890, val));
      requestAnimationFrame(function () { el.textContent = fa(val); });
    }, 2600);
  })();

  /* ============================================================
     ۵. منوی موبایل
     ============================================================ */
  (function drawer() {
    var btn = $('.burger'), box = $('#drawer');
    if (!btn || !box) return;

    function set(open) {
      box.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () { set(box.hidden); });
    box.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { if (window.innerWidth > 900) set(false); }, 140);
    }, { passive: true });
  })();

  /* ============================================================
     ۶. فرم عضویت
     ============================================================ */
  (function cta() {
    var form = $('#ctaForm'), note = $('#ctaNote');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#ctaMail').value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

      note.className = 'cta-note ' + (ok ? 'ok' : 'bad');
      note.textContent = ok
        ? 'خوش آمدی! از این پس تازه‌ترین‌ها را برایت می‌فرستیم.'
        : 'لطفاً یک نشانی ایمیل درست بنویس.';

      if (ok) form.reset();
    });
  })();

  /* ============================================================
     ۷. کج‌شدن سه‌بعدی کارت‌ها
     ------------------------------------------------------------
     اندازه فقط یک بار (هنگام ورود ماوس) خوانده می‌شود،
     نه در هر حرکت — تا مرورگر مجبور به بازچینش نشود.
     ============================================================ */
  (function tilt() {
    if (CALM || window.matchMedia('(hover: none)').matches) return;

    $$('.store, .trend, .why-card').forEach(function (card) {
      var box = null, frame = 0;

      card.addEventListener('mouseenter', function () {
        box = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', function (e) {
        if (!box || frame) return;
        var tx = (e.clientX - box.left) / box.width - 0.5;
        var ty = (e.clientY - box.top) / box.height - 0.5;

        frame = requestAnimationFrame(function () {
          frame = 0;
          card.style.transform =
            'perspective(900px) rotateX(' + (-ty * 6).toFixed(2) + 'deg) rotateY(' +
            (tx * 6).toFixed(2) + 'deg) translate3d(0,-8px,0)';
        });
      });

      card.addEventListener('mouseleave', function () {
        box = null;
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        card.style.transform = '';
      });
    });
  })();

  /* ============================================================
     ۸. پیمایش نرم
     ============================================================ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id === '#top') {
      e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();
'''


# ============================================================
# مونتاژ
# ============================================================
ICON_JSON = json.dumps(I, ensure_ascii=False)

HTML = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="دیجی‌پوش — پوشاک نوجوان: استریت‌ویر، لباس ورزشی و اکسسوری با استایل نسل تازه." />
<meta name="theme-color" content="#0A0A0A" />
<title>دیجی‌پوش | پوشاک نوجوان</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://images.pexels.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="preload" as="image" href="{SLIDES[0][5]}" fetchpriority="high" />

<style>
{CSS}
</style>
</head>
<body id="top">

{NAV}

<main>
{HERO}
{WHY_S}
{TREND_S}
{SELECT_S}
{STORES_S}
{SPEED_S}
{FEAT_S}
{HOW_S}
{REV_S}
{CTA_S}
</main>

{FOOT}

<script>window.__DP_ICONS__ = {ICON_JSON};</script>
<script>
{JS}
</script>
</body>
</html>
'''

out = D / 'TEEN-standalone.html'
out.write_text(HTML, encoding='utf-8')
print(f'✔ {out.name} — {len(HTML):,} کاراکتر')
