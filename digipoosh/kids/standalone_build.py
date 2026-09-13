# -*- coding: utf-8 -*-
"""
سازنده‌ی صفحه‌ی تک‌فایلی پوشاک کودک دیجی‌پوش
— همه‌چیز در یک فایل، بدون هیچ کتابخانه‌ای، بهینه برای ۶۰ فریم
— همه‌ی آیکون‌ها SVG خطی هستند (بدون ایموجی)
"""
import pathlib

D = pathlib.Path(__file__).parent
SW = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'


def svg(paths, cls='ico', vb='0 0 24 24', extra=''):
    return f'<svg class="{cls}" viewBox="{vb}" {SW} aria-hidden="true" {extra}>{paths}</svg>'


# ============================================================
# آیکون‌ها — همه SVG خطی، بدون ایموجی
# ============================================================
I = {
    # اسباب‌بازی‌های شناور
    'teddy':  '<circle cx="7.5" cy="6" r="2.6"/><circle cx="16.5" cy="6" r="2.6"/><circle cx="12" cy="13" r="6.4"/><circle cx="10" cy="12" r="."/><path d="M9.8 11.8h.01M14.2 11.8h.01"/><path d="M10.6 15.4a2.4 2.4 0 0 0 2.8 0"/>',
    'car':    '<path d="M4 15.5h16v3H4z"/><path d="M6 15.5 7.8 10h8.4l1.8 5.5"/><circle cx="7.5" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/>',
    'balloon':'<path d="M12 3.2c3 0 5 2.4 5 5.4S14.6 15 12 15 7 11.6 7 8.6s2-5.4 5-5.4Z"/><path d="M12 15v1.6M11 18l1-1.4 1 1.4"/><path d="M12 18v3"/>',
    'puzzle': '<path d="M4.5 5.5h5a1.7 1.7 0 1 1 3.4 0h5v5a1.7 1.7 0 1 0 0 3.4v5h-5a1.7 1.7 0 1 0-3.4 0h-5v-5a1.7 1.7 0 1 1 0-3.4z"/>',
    'horse':  '<path d="M12 3.5v3M6 20.5h12M8 20.5V13a4 4 0 0 1 8 0v7.5"/><circle cx="12" cy="9.5" r="1"/><path d="M4.5 11.5 8 9M19.5 11.5 16 9"/>',
    'ball':   '<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8M12 3.6a13 13 0 0 1 0 16.8 13 13 0 0 1 0-16.8Z"/>',
    'rabbit': '<path d="M9 9.5C8 6.5 8 3.5 9.6 3.5S11.4 6.5 11 9.5M15 9.5c1-3 1-6-.6-6S12.6 6.5 13 9.5"/><circle cx="12" cy="14.5" r="5"/><path d="M10.4 14h.01M13.6 14h.01M11 16.5a1.8 1.8 0 0 0 2 0"/>',
    'tent':   '<path d="M12 3.5 4 20.5h16z"/><path d="M12 3.5v17M7.4 14h9.2"/>',
    # گل‌ها
    'flower1':'<circle cx="12" cy="9" r="2.2"/><path d="M12 6.8c0-2 1.6-3.3 2.8-2.4S15 8 12 6.8ZM14.2 9c2 0 3.3 1.6 2.4 2.8S12.9 12 14.2 9ZM12 11.2c0 2-1.6 3.3-2.8 2.4S9 10 12 11.2ZM9.8 9c-2 0-3.3-1.6-2.4-2.8S11.1 6 9.8 9Z"/><path d="M12 11.5V21"/>',
    'flower2':'<circle cx="12" cy="8.5" r="2"/><ellipse cx="12" cy="4.8" rx="1.7" ry="2.6"/><ellipse cx="15.6" cy="8.5" rx="2.6" ry="1.7"/><ellipse cx="12" cy="12.2" rx="1.7" ry="2.6"/><ellipse cx="8.4" cy="8.5" rx="2.6" ry="1.7"/><path d="M12 14v7M12 17.5c-1.6 0-2.6-1-2.6-2.2"/>',
    'flower3':'<path d="M12 4.5c1.7 0 2.6 1.7 2.6 3.4h-5.2C9.4 6.2 10.3 4.5 12 4.5Z"/><path d="M8 9.6h8l-1 4.4H9z"/><path d="M12 14v7M12 18c1.7 0 2.8-1 2.8-2.4"/>',
    # ستاره‌ها
    'star':   '<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    'spark':  '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/>',
    'star4':  '<path d="M12 4.5v15M4.5 12h15" /><path d="m7.2 7.2 9.6 9.6M16.8 7.2l-9.6 9.6"/>',
    # ابرها
    'cloud':  '<path d="M6.6 18.5A3.6 3.6 0 0 1 7 11.4a5.2 5.2 0 0 1 10-1.2 3.9 3.9 0 0 1-.4 8.3z"/>',
    # چرا دیجی‌پوش
    'medal':  '<circle cx="12" cy="14.5" r="5"/><path d="m9 9.6-2.6-6h11.2L15 9.6"/><path d="m12 12.4.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>',
    'muscle': '<path d="M4.5 16.5c0-3.4 2.4-5.6 5.5-5.6 2 0 2.8 1 2.8 2.4"/><path d="M9.5 10.9V7.4a2.4 2.4 0 0 1 4.8 0V12c2.6.4 4.6 2.2 4.6 4.8v3.7H4.5z"/>',
    'palette':'<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-.9 2-1.8 0-1.6-1.4-1.8-1.4-3 0-1 .8-1.7 1.9-1.7h1.6a4.4 4.4 0 0 0 4.4-4.4c0-3.6-3.6-6.1-8.5-6.1Z"/><circle cx="8" cy="9.5" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16" cy="9.5" r="1.1"/>',
    'coin':   '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4v9.2M14.4 9.6c0-1-1-1.7-2.4-1.7s-2.4.7-2.4 1.7 1 1.6 2.4 1.9 2.4.9 2.4 1.9-1 1.7-2.4 1.7-2.4-.7-2.4-1.7"/>',
    'shield': '<path d="M12 3.2 4.8 6v6c0 4.4 3 8.4 7.2 9.8 4.2-1.4 7.2-5.4 7.2-9.8V6z"/><path d="m9 12 2 2 4-4"/>',
    'heart':  '<path d="M12 20.4S4.4 15.7 4.4 10.4A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.6 2.4c0 5.3-7.6 10-7.6 10Z"/>',
    # سن‌ها
    'baby':   '<circle cx="12" cy="12" r="8.4"/><path d="M9.4 10.6h.01M14.6 10.6h.01"/><path d="M9.6 14.6a3.4 3.4 0 0 0 4.8 0"/><path d="M12 3.6v-1.2"/>',
    'child':  '<circle cx="12" cy="6.4" r="2.8"/><path d="M12 9.2v6.4M8.4 12h7.2M9.6 21l2.4-5.4 2.4 5.4"/>',
    'tween':  '<circle cx="12" cy="5.8" r="2.6"/><path d="M12 8.4v7M8 11.4h8M9 21l3-5.6 3 5.6"/><path d="M6.5 18.5h11"/>',
    # فروشگاه
    'store':  '<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M6 12v7.5h12V12"/>',
    'check':  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'box':    '<path d="m12 3.5 7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4"/><path d="M12 11.5v9"/>',
    'pin':    '<path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/>',
    'hanger': '<path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5v2l8.2 5.2a1.9 1.9 0 0 1-1 3.5H4.8a1.9 1.9 0 0 1-1-3.5L12 9.5"/>',
    # مراحل
    'user':   '<circle cx="12" cy="8.4" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    'cart':   '<path d="M5.5 8h13l1 11.5a1.6 1.6 0 0 1-1.6 1.8H6.1a1.6 1.6 0 0 1-1.6-1.8z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
    'truck':  '<path d="M2.8 6.5h10.4v9.4H2.8z"/><path d="M13.2 9.6h3.6l2.6 2.8v3.5h-6.2z"/><circle cx="6.4" cy="18.4" r="1.7"/><circle cx="16.6" cy="18.4" r="1.7"/>',
    # اعتماد
    'lock':   '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    'refresh':'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.6h-4.6"/>',
    'phone':  '<path d="M6.4 3.6h3l1.6 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.6v3a1.8 1.8 0 0 1-2 1.8A15.6 15.6 0 0 1 4.6 5.6a1.8 1.8 0 0 1 1.8-2Z"/>',
    'leaf':   '<path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14"/><path d="M5 19c3-4 6-6 10-8"/>',
    # نقل قول
    'quote':  '<path d="M9.4 6.5C6.6 7.8 5 10.2 5 13.4c0 2.4 1.4 4.1 3.4 4.1 1.8 0 3.2-1.3 3.2-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.6 1.4-2.9 3-3.6zM19 6.5c-2.8 1.3-4.4 3.7-4.4 6.9 0 2.4 1.4 4.1 3.4 4.1 1.8 0 3.2-1.3 3.2-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.6 1.4-2.9 3-3.6z"/>',
    'arrow':  '<path d="M14 6.5 8 12l6 5.5"/>',
    'burger': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'search': '<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 3.9 3.9"/>',
    'mail':   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    'clock':  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    'gift':   '<rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13h14v7.5H5z"/><path d="M12 9v11.5"/><path d="M12 9S10.5 4.5 8 4.5a2 2 0 0 0 0 4.5M12 9s1.5-4.5 4-4.5a2 2 0 0 1 0 4.5"/>',
}

RAINBOW = ['#F0C97A', '#6EC8D9', '#F5A0A0', '#8BC9A8', '#C9A0B8', '#C9A84C']

# ============================================================
# داده‌ها
# ============================================================
SLIDES = [
    ('مجموعه‌ی بهار و تابستان', 'لبخند کودکان', 'رنگارنگ', 'کیفیت و شادی در هر پوشش', 'gold',
     'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('استایل کودکانه', 'شادی در هر قدم', 'بازیگوش', 'لباس‌هایی که کودک شما عاشقش می‌شود', 'pink',
     'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('کلاسیک کوچولو', 'زیبایی در سادگی', 'نازنین', 'استایلی شیک برای کوچولوهای شما', 'blue',
     'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
    ('وقت بازی', 'انرژی و حرکت', 'شاد', 'لباس‌هایی برای بازی و خندیدن', 'mint',
     'https://images.pexels.com/photos/1231215/pexels-photo-1231215.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'),
]

WHY = [
    ('medal',  'کیفیت بالا',    'لباس‌هایی که با عشق و دقت دوخته شده‌اند', 0),
    ('muscle', 'دوام عالی',     'برای بازی و فعالیت روزمره کودکان', 1),
    ('palette','طراحی شیک',     'استایل کودکانه با کیفیت لوکس', 2),
    ('coin',   'قیمت منصفانه',  'کیفیت بالا با قیمت مناسب', 3),
    ('shield', 'امنیت کودک',    'پارچه‌های استاندارد و ایمن', 4),
    ('heart',  'رضایت مادران',  'امتحان شده با هزاران مادر راضی', 5),
]

AGES = [
    ('baby',  'نوزاد',  '۰ تا ۲ سال', 'سرهمی، بادی و ست نوزادی', 1),
    ('child', 'کودک',   '۳ تا ۶ سال', 'لباس بازی، مهمانی و روزمره', 3),
    ('tween', 'نوجوان', '۷ تا ۱۲ سال', 'فرم مدرسه و استایل روز', 0),
]

STORES = [
    ('بوتیک کودک ماهان', 'لباس مدرسه',    5.0, 58, 'تهران', ['پارچه مقاوم', 'ضدچروک'], 0),
    ('فروشگاه باران',     'لباس نوزادی',   5.0, 42, 'اصفهان', ['نخ پنبه', 'ضدحساسیت'], 1),
    ('بوتیک شادی',        'لباس مهمانی',   4.8, 36, 'شیراز', ['حریر', 'دست‌دوز'], 2),
    ('فروشگاه پرنیان',    'ست دخترانه',    4.9, 51, 'مشهد', ['رنگ ثابت', 'ست کامل'], 3),
    ('بوتیک آرین',        'لباس پسرانه',   4.7, 44, 'تبریز', ['جین', 'اسپرت'], 4),
    ('فروشگاه نیلوفر',    'سرهمی نوزاد',   5.0, 29, 'کرج', ['دکمه ایمن', 'نرم'], 5),
    ('بوتیک کوچولو',      'کفش بچگانه',    4.8, 33, 'یزد', ['چرم طبیعی', 'سبک'], 0),
    ('فروشگاه ستاره',     'اکسسوری کودک',  4.6, 47, 'رشت', ['بدون نیکل', 'رنگی'], 1),
]

SETS = [
    ('ست بهاره‌ی دخترانه', 'پیراهن + جوراب + تل مو', '۴۸۰٬۰۰۰', '۳ تکه', 2,
     'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=560'),
    ('ست ورزشی پسرانه',    'سویشرت + شلوار + کلاه', '۵۲۰٬۰۰۰', '۳ تکه', 1,
     'https://images.pexels.com/photos/1231215/pexels-photo-1231215.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=560'),
    ('ست نوزادی پنبه‌ای',  'سرهمی + بادی + پیشبند', '۳۹۰٬۰۰۰', '۴ تکه', 3,
     'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=560'),
    ('ست مدرسه',           'مانتو + شلوار + کیف',   '۶۸۰٬۰۰۰', '۳ تکه', 0,
     'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=560'),
]

STEPS = [
    ('user',  '۰۱', 'ثبت‌نام',  'در چند ثانیه حساب بسازید و فروشگاه‌های محبوبتان را دنبال کنید'),
    ('cart',  '۰۲', 'انتخاب',   'از میان صدها کالای کودکانه، با خیال راحت انتخاب کنید'),
    ('truck', '۰۳', 'دریافت',   'سفارش شما با بسته‌بندی ایمن به دستتان می‌رسد'),
]

TRUST = [
    ('shield',  'پارچه‌ی استاندارد', 'همه‌ی پارچه‌ها ضدحساسیت و دارای گواهی سلامت‌اند'),
    ('refresh', 'بازگشت ۷ روزه',     'اگر اندازه نشد یا نپسندیدید، بی‌دردسر برگردانید'),
    ('lock',    'پرداخت امن',        'اطلاعات شما رمزنگاری می‌شود و نزد ما محفوظ است'),
    ('phone',   'پشتیبانی مادران',   'کارشناسان ما برای راهنمایی سایز کنار شما هستند'),
]

REVIEWS = [
    ('مریم احمدی',  'مادر دو کودک — تهران', 5,
     'جنس لباس‌ها واقعاً عالی بود. بعد از چند بار شست‌وشو هم رنگشان نرفت و اندازه‌شان تغییر نکرد. برای بچه‌ی فعال من دقیقاً همین را می‌خواستم.', 2),
    ('سارا کریمی',  'مادر یک کودک — اصفهان', 5,
     'ست مدرسه را سفارش دادم و دو روزه رسید. دخترم عاشق طرحش شد و از پوشیدنش ذوق می‌کند. بسته‌بندی هم خیلی تمیز و مرتب بود.', 1),
    ('نگار موسوی',  'مادر سه کودک — شیراز', 5,
     'راهنمای سایز خیلی دقیق بود و درست اندازه شد. پارچه‌ی نرمی دارد و پوست حساس نوزادم هیچ واکنشی نشان نداد. حتماً دوباره خرید می‌کنم.', 4),
]

FOOTER = [
    ('دسته‌بندی‌ها', ['لباس نوزادی', 'لباس کودک', 'لباس نوجوان', 'کفش بچگانه', 'اکسسوری']),
    ('خدمات مشتریان', ['راهنمای سایز', 'شرایط بازگشت', 'پیگیری سفارش', 'پرسش‌های پرتکرار']),
    ('دیجی‌پوش', ['درباره‌ی ما', 'فروشندگان', 'همکاری با ما', 'تماس با ما']),
]


# ============================================================
# ساخت بخش‌ها
# ============================================================
def stars_row(rate):
    full = int(rate)
    half = rate - full >= 0.5
    out = ''
    for i in range(5):
        cls = 'st-full' if i < full else ('st-half' if i == full and half else 'st-empty')
        out += f'<svg class="st {cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="{I["star"]}"/></svg>'.replace('<path d="<path d="', '<path d="').replace('"/>"/>', '"/>')
    return f'<span class="stars" role="img" aria-label="امتیاز {rate} از ۵">{out}</span>'


def star_svg(cls):
    return f'<svg class="st {cls}" viewBox="0 0 24 24" aria-hidden="true">{I["star"]}</svg>'


def rating(rate):
    full = int(rate)
    half = (rate - full) >= 0.5
    out = ''
    for i in range(5):
        if i < full:
            out += star_svg('st-full')
        elif i == full and half:
            out += star_svg('st-half')
        else:
            out += star_svg('st-empty')
    fa = str(rate).replace('.', '٫').translate(str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹'))
    return f'<span class="stars" role="img" aria-label="امتیاز {fa} از ۵">{out}</span><b class="rate-n">{fa}</b>'


FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
fa = lambda n: str(n).translate(FA)


# ---------- ۱. نوار ناوبری ----------
NAV = f'''
<header class="topbar">
  <nav class="navbar rainbow-border" aria-label="ناوبری اصلی">
    <a class="brand" href="#top">
      <span class="brand-mark">{svg(I['gift'], 'ico')}</span>
      <span class="brand-txt"><strong>دیجی‌پوش</strong><small>پوشاک کودک</small></span>
    </a>

    <ul class="menu">
      <li><a href="#why">چرا دیجی‌پوش</a></li>
      <li><a href="#ages">رده‌ی سنی</a></li>
      <li><a href="#stores">فروشگاه‌ها</a></li>
      <li><a href="#sets">ست‌های کامل</a></li>
      <li><a href="#reviews">نظر مادران</a></li>
    </ul>

    <div class="nav-act">
      <button class="nav-ico" type="button" aria-label="جست‌وجو">{svg(I['search'])}</button>
      <a class="nav-cta" href="#cta">عضویت</a>
      <button class="burger" type="button" aria-label="منو" aria-expanded="false">{svg(I['burger'])}</button>
    </div>
  </nav>

  <div class="drawer" id="drawer" hidden>
    <a href="#why">چرا دیجی‌پوش</a>
    <a href="#ages">رده‌ی سنی</a>
    <a href="#stores">فروشگاه‌ها</a>
    <a href="#sets">ست‌های کامل</a>
    <a href="#reviews">نظر مادران</a>
    <a href="#cta">عضویت</a>
  </div>
</header>'''

# ---------- ۲. اسلایدر ----------
slides_html = ''
dots_html = ''
for i, (badge, title, hi, sub, tone, img) in enumerate(SLIDES):
    act = ' active' if i == 0 else ''
    slides_html += f'''
      <div class="slide{act}" role="group" aria-roledescription="اسلاید" aria-label="اسلاید {fa(i+1)} از {fa(len(SLIDES))}">
        <img src="{img}" alt="" {'fetchpriority="high"' if i == 0 else 'loading="lazy"'} decoding="async" width="1800" height="1200" />
        <div class="slide-shade"></div>
        <div class="slide-body">
          <span class="slide-badge t-{tone}">{svg(I['spark'], 'ico ico-xs')} {badge}</span>
          <h1>{title} <em>{hi}</em></h1>
          <p>{sub}</p>
          <a class="btn-hero" href="#stores">مشاهده مجموعه</a>
        </div>
      </div>'''
    dots_html += f'<button class="dot{act}" type="button" role="tab" aria-label="اسلاید {fa(i+1)}"></button>'

HERO = f'''
<section class="hero rainbow-border" id="hero" aria-label="مجموعه‌های برگزیده">
  <div class="stage">{slides_html}
  </div>
  <div class="fx" id="fx" aria-hidden="true"></div>
  <div class="dots" role="tablist" aria-label="انتخاب اسلاید">{dots_html}</div>
  <div class="bar"><i id="barFill"></i></div>
</section>'''

# ---------- ۳. چرا دیجی‌پوش ----------
why_cards = ''
for icon, title, text, ci in WHY:
    why_cards += f'''
      <article class="why-card rainbow-border reveal">
        <span class="why-ico" style="--c:{RAINBOW[ci]}">{svg(I[icon], 'ico ico-lg')}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </article>'''

WHY_SEC = f'''
<section class="sec" id="why">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">چرا دیجی‌پوش کودک</span>
      <h2>خیال مادران، آسوده</h2>
      <p>هر کالایی که اینجا می‌بینید، پیش از رسیدن به دست شما بررسی شده است</p>
    </div>
    <div class="why-grid">{why_cards}
    </div>
  </div>
</section>'''

# ---------- ۴. رده‌ی سنی ----------
age_cards = ''
for icon, name, span, note, ci in AGES:
    age_cards += f'''
      <a class="age-card reveal" href="#stores" style="--c:{RAINBOW[ci]}">
        <span class="age-ico">{svg(I[icon], 'ico ico-xl')}</span>
        <h3>{name}</h3>
        <span class="age-span">{span}</span>
        <p>{note}</p>
      </a>'''

AGES_SEC = f'''
<section class="sec alt" id="ages">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">رده‌ی سنی</span>
      <h2>برای هر سنی، انتخابی هست</h2>
      <p>از نخستین روزهای نوزادی تا سال‌های پرانرژی نوجوانی</p>
    </div>
    <div class="age-grid">{age_cards}
    </div>
  </div>
</section>'''

# ---------- ۵. فروشگاه‌ها ----------
store_cards = ''
for name, cat, rate, count, city, tags, ci in STORES:
    tg = ''.join(f'<li>{t}</li>' for t in tags)
    store_cards += f'''
      <article class="store-card rainbow-border reveal" style="--c:{RAINBOW[ci]}">
        <div class="store-top">
          <span class="store-ava">{svg(I['store'], 'ico ico-lg')}
            <em class="verified" title="فروشنده تأییدشده">{svg(I['check'], 'ico ico-xs')}</em>
          </span>
          <div>
            <h3>{name}</h3>
            <span class="store-cat">{cat}</span>
          </div>
        </div>
        <div class="store-rate">{rating(rate)}</div>
        <ul class="tags">{tg}</ul>
        <div class="store-meta">
          <span>{svg(I['box'], 'ico ico-xs')} {fa(count)} محصول</span>
          <span>{svg(I['pin'], 'ico ico-xs')} {city}</span>
        </div>
        <a class="btn-ghost" href="#cta">مشاهده فروشگاه</a>
      </article>'''

STORES_SEC = f'''
<section class="sec" id="stores">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">ویترین منتخب</span>
      <h2>فروشگاه‌های برتر کودک</h2>
      <p>با فروشندگان برگزیده‌ی پوشاک کودک و تخصص هرکدام آشنا شوید</p>
    </div>
    <div class="store-grid">{store_cards}
    </div>
  </div>
</section>'''

# ---------- ۶. ست‌های کامل ----------
set_cards = ''
for name, parts, price, pieces, ci, img in SETS:
    set_cards += f'''
      <article class="set-card rainbow-border reveal" style="--c:{RAINBOW[ci]}">
        <div class="set-img">
          <img src="{img}" alt="{name}" loading="lazy" decoding="async" width="560" height="700" />
          <em class="set-tag">{pieces}</em>
        </div>
        <div class="set-body">
          <h3>{name}</h3>
          <p>{parts}</p>
          <div class="set-foot">
            <span class="price">{price}<small>تومان</small></span>
            <a class="btn-mini" href="#cta">{svg(I['cart'], 'ico ico-xs')} سفارش</a>
          </div>
        </div>
      </article>'''

SETS_SEC = f'''
<section class="sec alt" id="sets">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">ست‌های کامل</span>
      <h2>یک انتخاب، یک استایل کامل</h2>
      <p>ست‌هایی که همه‌چیز در آن‌ها با هم هماهنگ است — بدون دردسر انتخاب</p>
    </div>
    <div class="set-grid">{set_cards}
    </div>
  </div>
</section>'''

# ---------- ۷. فروشنده‌ی برگزیده ----------
FEATURED = f'''
<section class="sec" id="featured">
  <div class="wrap">
    <article class="feat rainbow-border reveal">
      <div class="feat-media">
        <img src="https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=640"
             alt="بوتیک کودک ماهان" loading="lazy" decoding="async" width="640" height="760" />
      </div>
      <div class="feat-body">
        <span class="eyebrow">فروشنده‌ی برگزیده‌ی ماه</span>
        <h2>بوتیک کودک ماهان</h2>
        <div class="feat-rate">{rating(5.0)} <small>از ۲۴۸ نظر مادران</small></div>
        <p>ماهان بیش از هشت سال است که لباس مدرسه و روزمره‌ی کودکان را با پارچه‌ی
        مقاوم و دوخت ایرانی می‌دوزد. هر سفارش پیش از ارسال بازبینی می‌شود و
        راهنمای سایز اختصاصی برای هر خانواده فرستاده می‌شود.</p>
        <ul class="feat-stats">
          <li><b>{fa(58)}</b><span>محصول فعال</span></li>
          <li><b>{fa(1240)}</b><span>سفارش موفق</span></li>
          <li><b>{fa(98)}٪</b><span>رضایت مشتری</span></li>
          <li><b>{fa(8)}</b><span>سال سابقه</span></li>
        </ul>
        <a class="btn-hero" href="#cta">دیدن همه‌ی محصولات</a>
      </div>
    </article>
  </div>
</section>'''

# ---------- ۸. چطور کار می‌کند ----------
step_cards = ''
for idx, (icon, num, title, text) in enumerate(STEPS):
    step_cards += f'''
      <article class="step reveal" style="--c:{RAINBOW[idx]}">
        <span class="step-circle">{svg(I[icon], 'ico ico-lg')}<em>{num}</em></span>
        <h3>{title}</h3>
        <p>{text}</p>
      </article>'''

HOW_SEC = f'''
<section class="sec alt" id="how">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">چطور کار می‌کند</span>
      <h2>سه قدم تا خریدی مطمئن</h2>
      <p>فرایند خرید را ساده کردیم تا وقت شما صرف انتخاب شود، نه سردرگمی</p>
    </div>
    <div class="step-grid">{step_cards}
    </div>
  </div>
</section>'''

# ---------- ۹. اعتماد ----------
trust_cards = ''
for idx, (icon, title, text) in enumerate(TRUST):
    trust_cards += f'''
      <article class="trust reveal" style="--c:{RAINBOW[idx]}">
        <span class="trust-ico">{svg(I[icon], 'ico ico-lg')}</span>
        <div><h3>{title}</h3><p>{text}</p></div>
      </article>'''

TRUST_SEC = f'''
<section class="sec" id="trust">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">اعتماد مادران</span>
      <h2>چرا می‌توانید با خیال راحت خرید کنید</h2>
    </div>
    <div class="trust-grid">{trust_cards}
    </div>
  </div>
</section>'''

# ---------- ۱۰. نظر مادران ----------
rev_cards = ''
for name, who, rate, text, ci in REVIEWS:
    rev_cards += f'''
      <article class="review reveal" style="--c:{RAINBOW[ci]}">
        <span class="q">{svg(I['quote'], 'ico ico-lg')}</span>
        <div class="rv-stars">{rating(rate)}</div>
        <p>{text}</p>
        <div class="rv-who">
          <span class="rv-ava">{name[0]}</span>
          <div><strong>{name}</strong><small>{who}</small></div>
        </div>
      </article>'''

REV_SEC = f'''
<section class="sec alt" id="reviews">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow">نظر مادران</span>
      <h2>آنچه مادران درباره‌ی ما می‌گویند</h2>
      <p>نظرهای واقعی خانواده‌هایی که از دیجی‌پوش خرید کرده‌اند</p>
    </div>
    <div class="rev-grid">{rev_cards}
    </div>
  </div>
</section>'''

# ---------- ۱۱. دعوت به عضویت ----------
CTA = f'''
<section class="sec" id="cta">
  <div class="wrap">
    <div class="cta rainbow-border reveal">
      <div class="cta-fx" aria-hidden="true"></div>
      <div class="cta-body">
        <span class="eyebrow">به خانواده‌ی دیجی‌پوش بپیوندید</span>
        <h2>دنیای رنگی کوچولوها، یک کلیک دورتر</h2>
        <p>عضو شوید تا از تخفیف‌های ویژه‌ی مادران، محصولات تازه و
        راهنمای سایز اختصاصی باخبر شوید.</p>

        <form class="cta-form" id="ctaForm" novalidate>
          <label class="sr-only" for="ctaMail">ایمیل شما</label>
          <span class="cta-field">
            {svg(I['mail'], 'ico ico-sm')}
            <input id="ctaMail" type="email" placeholder="نشانی ایمیل شما" autocomplete="email" />
          </span>
          <button class="btn-hero" type="submit">عضویت رایگان</button>
        </form>
        <p class="cta-note" id="ctaNote" role="status"></p>

        <ul class="cta-perks">
          <li>{svg(I['check'], 'ico ico-xs')} بدون هزینه</li>
          <li>{svg(I['check'], 'ico ico-xs')} لغو در هر زمان</li>
          <li>{svg(I['check'], 'ico ico-xs')} حریم خصوصی محفوظ</li>
        </ul>
      </div>
    </div>
  </div>
</section>'''

# ---------- ۱۲. پابرگ ----------
cols = ''
for title, links in FOOTER:
    ls = ''.join(f'<li><a href="#top">{l}</a></li>' for l in links)
    cols += f'<div class="fcol"><h4>{title}</h4><ul>{ls}</ul></div>'

FOOT = f'''
<footer class="footer rainbow-border" id="footer">
  <div class="wrap">
    <div class="fgrid">
      <div class="fbrand">
        <span class="brand-mark">{svg(I['gift'], 'ico')}</span>
        <strong>دیجی‌پوش</strong>
        <p>بازارگاه لوکس مد ایران — بخش پوشاک کودک.
        جایی که کیفیت، ایمنی و شادی کنار هم می‌نشینند.</p>
        <div class="fbadges">
          <span>{svg(I['shield'], 'ico ico-xs')} پارچه‌ی استاندارد</span>
          <span>{svg(I['leaf'], 'ico ico-xs')} دوست‌دار پوست</span>
          <span>{svg(I['clock'], 'ico ico-xs')} ارسال سریع</span>
        </div>
      </div>
      {cols}
    </div>
    <div class="fbottom">
      <span>© ۱۴۰۴ دیجی‌پوش — همه‌ی حقوق محفوظ است.</span>
      <span class="fmade">ساخته‌شده با دقت برای کوچولوهای شما</span>
    </div>
  </div>
</footer>'''


# ============================================================
# CSS
# ============================================================
CSS = r'''
/* ============================================================
   دیجی‌پوش — پوشاک کودک
   طلا غالب + لهجه‌های رنگین‌کمانی
   همه‌ی انیمیشن‌ها فقط transform و opacity را حرکت می‌دهند
   ============================================================ */
:root{
  --gold:#C9A84C; --gold-b:#D4B85A; --bronze:#B8943C;
  --blue:#6EC8D9; --pink:#F5A0A0; --mint:#8BC9A8;
  --yellow:#F0C97A; --purple:#C9A0B8; --peach:#E89B5E;
  --cream:#F5F0E8; --off:#FAF8F5; --beige:#EDE8E0;
  --ink:#1A1A1A; --gray:#8A7E72; --white:#FFFFFF;
  --wrap:min(1280px,calc(100% - 40px));
  --ease:cubic-bezier(.16,1,.3,1);
  --nav-h:76px;
}

*,*::before,*::after{box-sizing:border-box}

html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}

body{
  margin:0;direction:rtl;
  font-family:Vazirmatn,system-ui,-apple-system,sans-serif;
  color:var(--ink);line-height:1.85;font-size:15px;
  background:
    radial-gradient(ellipse 60% 40% at 85% 0%,rgba(110,200,217,.14),transparent 60%),
    radial-gradient(ellipse 50% 40% at 10% 20%,rgba(245,160,160,.12),transparent 60%),
    radial-gradient(ellipse 55% 45% at 90% 80%,rgba(139,201,168,.12),transparent 60%),
    var(--cream);
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}

img{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
button,input{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none}
ul{list-style:none;margin:0;padding:0}
h1,h2,h3,h4,p{margin:0}

.wrap{width:var(--wrap);margin-inline:auto}
.ico{width:22px;height:22px;flex:none}
.ico-xs{width:15px;height:15px}
.ico-sm{width:18px;height:18px}
.ico-lg{width:30px;height:30px}
.ico-xl{width:40px;height:40px}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* ============================================================
   حاشیه‌ی رنگین‌کمانی متحرک ۲.۵px
   ============================================================ */
@keyframes rainbowFlow{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

.rainbow-border{
  position:relative;
  border-radius:18px;
  background:rgba(250,248,245,.72);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  isolation:isolate;
}

.rainbow-border::before{
  content:"";position:absolute;inset:0;
  border-radius:inherit;padding:2.5px;
  background:linear-gradient(90deg,
    #E89B5E,#F0C97A,#6EC8D9,#F5A0A0,#8BC9A8,#C9A0B8,
    #8BC9A8,#F5A0A0,#6EC8D9,#F0C97A,#E89B5E);
  background-size:400% 100%;
  animation:rainbowFlow 6s linear infinite;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  pointer-events:none;z-index:1;
}

.rainbow-border:hover::before{animation-duration:3.4s}

/* ============================================================
   نوار ناوبری
   ============================================================ */
.topbar{position:sticky;top:0;z-index:80;padding:12px 0}

.navbar{
  width:var(--wrap);margin-inline:auto;
  display:flex;align-items:center;gap:18px;
  padding:11px 20px;min-height:var(--nav-h);
}

.brand{display:flex;align-items:center;gap:11px}

.brand-mark{
  width:44px;height:44px;display:grid;place-items:center;
  border-radius:14px;color:var(--off);
  background:linear-gradient(135deg,var(--gold),var(--bronze));
  box-shadow:0 8px 18px -10px rgba(201,168,76,.9);
}

.brand-txt{display:flex;flex-direction:column;line-height:1.35}
.brand-txt strong{font-size:17px;letter-spacing:.04em}
.brand-txt small{font-size:10.5px;color:var(--gray)}

.menu{display:flex;gap:clamp(10px,1.8vw,24px);margin-inline:auto}

.menu a{
  position:relative;padding:8px 3px;
  font-size:14px;font-weight:500;
  transition:color .3s var(--ease);
}

.menu a::after{
  content:"";position:absolute;inset-block-end:2px;inset-inline:50%;
  height:2.5px;border-radius:2px;
  background:linear-gradient(90deg,var(--blue),var(--pink),var(--yellow));
  transition:inset-inline .32s var(--ease);
}

.menu a:hover{color:var(--bronze)}
.menu a:hover::after{inset-inline:10%}

.nav-act{display:flex;align-items:center;gap:8px}

.nav-ico{
  width:40px;height:40px;display:grid;place-items:center;
  border-radius:12px;color:var(--gray);
  border:1px solid rgba(201,168,76,.24);
  transition:background .25s var(--ease),color .25s var(--ease);
}

.nav-ico:hover{background:rgba(201,168,76,.12);color:var(--bronze)}

.nav-cta{
  padding:10px 20px;border-radius:999px;
  font-size:13px;font-weight:700;white-space:nowrap;
  color:var(--ink);
  background:linear-gradient(135deg,var(--gold-b),var(--yellow),var(--blue));
  background-size:200% 100%;
  box-shadow:0 8px 20px -10px rgba(201,168,76,.95);
  transition:transform .3s var(--ease),background-position .5s ease;
}

.nav-cta:hover{transform:translateY(-2px);background-position:100% 0}

.burger{display:none;width:40px;height:40px;place-items:center;
  border-radius:12px;border:1px solid rgba(201,168,76,.24)}

.drawer{
  width:var(--wrap);margin:8px auto 0;padding:10px;
  display:grid;gap:2px;border-radius:16px;
  background:rgba(250,248,245,.96);
  border:1px solid rgba(201,168,76,.28);
  box-shadow:0 18px 40px -20px rgba(0,0,0,.25);
}

.drawer a{padding:11px 14px;border-radius:10px;font-size:14px;
  transition:background .22s var(--ease)}
.drawer a:hover{background:rgba(201,168,76,.12)}

/* ============================================================
   اسلایدر
   ============================================================ */
.hero{
  position:relative;width:var(--wrap);margin:6px auto 0;
  height:clamp(430px,80vh,720px);
  border-radius:22px;overflow:hidden;
  background:var(--beige);
}

.stage{position:absolute;inset:0}

.slide{
  position:absolute;inset:0;
  opacity:0;visibility:hidden;
  transition:opacity 1s var(--ease),visibility 1s;
}

.slide.active{will-change:opacity}

.slide.active{opacity:1;visibility:visible}

.slide img{
  width:100%;height:100%;object-fit:cover;
  transform:scale(1.06);
}

.slide.active img{animation:heroZoom 9s ease-out both}

@keyframes heroZoom{
  from{transform:scale(1.14)}
  to{transform:scale(1.02)}
}

.slide-shade{
  position:absolute;inset:0;
  background:
    linear-gradient(to top,rgba(20,16,12,.72) 0%,rgba(20,16,12,.28) 42%,transparent 68%),
    linear-gradient(to left,rgba(20,16,12,.42),transparent 55%);
}

.slide-body{
  position:absolute;inset-block-end:clamp(38px,8vh,72px);
  inset-inline-start:clamp(22px,6vw,74px);
  max-width:min(560px,80%);z-index:2;
}

.slide.active .slide-body>*{animation:popIn .85s var(--ease) both}
.slide.active .slide-body>*:nth-child(2){animation-delay:.09s}
.slide.active .slide-body>*:nth-child(3){animation-delay:.17s}
.slide.active .slide-body>*:nth-child(4){animation-delay:.25s}

@keyframes popIn{
  from{opacity:0;transform:translateY(26px) scale(.97)}
  to{opacity:1;transform:none}
}

.slide-badge{
  display:inline-flex;align-items:center;gap:7px;
  padding:7px 16px;margin-bottom:14px;
  border-radius:999px;font-size:12px;font-weight:700;
  color:var(--ink);
  background:rgba(250,248,245,.92);
  backdrop-filter:blur(8px);
  box-shadow:0 6px 18px -8px rgba(0,0,0,.5);
}

.t-gold{box-shadow:0 0 0 2px rgba(201,168,76,.55),0 6px 18px -8px rgba(0,0,0,.5)}
.t-pink{box-shadow:0 0 0 2px rgba(245,160,160,.6),0 6px 18px -8px rgba(0,0,0,.5)}
.t-blue{box-shadow:0 0 0 2px rgba(110,200,217,.6),0 6px 18px -8px rgba(0,0,0,.5)}
.t-mint{box-shadow:0 0 0 2px rgba(139,201,168,.6),0 6px 18px -8px rgba(0,0,0,.5)}

.slide-body h1{
  font-size:clamp(30px,5.4vw,54px);
  font-weight:800;line-height:1.28;letter-spacing:-.01em;
  color:var(--off);
  text-shadow:0 4px 26px rgba(0,0,0,.4);
}

.slide-body h1 em{
  font-style:normal;
  background-image:linear-gradient(120deg,var(--yellow),var(--blue),var(--pink),var(--gold-b));
  background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:hueSlide 7s linear infinite;
}

@keyframes hueSlide{to{background-position:200% center}}

.slide-body p{
  margin:10px 0 20px;font-size:clamp(14px,1.7vw,17.5px);
  color:rgba(250,248,245,.94);
  text-shadow:0 2px 16px rgba(0,0,0,.5);
}

.btn-hero{
  display:inline-flex;align-items:center;justify-content:center;
  padding:14px 34px;border-radius:999px;
  font-size:14.5px;font-weight:700;color:var(--ink);
  background:linear-gradient(135deg,var(--gold-b),var(--yellow),var(--blue));
  background-size:200% 100%;
  box-shadow:0 12px 30px -12px rgba(201,168,76,1);
  transition:transform .3s var(--ease),background-position .55s ease,box-shadow .3s ease;
}

.btn-hero:hover{
  transform:translateY(-3px) scale(1.02);
  background-position:100% 0;
  box-shadow:0 18px 38px -12px rgba(110,200,217,.9);
}

.dots{
  position:absolute;inset-block-end:20px;inset-inline:0;
  display:flex;justify-content:center;gap:11px;z-index:6;
}

.dots .dot{
  width:11px;height:11px;border-radius:50%;
  background:rgba(250,248,245,.42);
  transition:transform .3s var(--ease),background .3s ease,box-shadow .3s ease;
}

.dots .dot.active{
  background:linear-gradient(135deg,var(--gold),var(--yellow));
  transform:scale(1.5);
  box-shadow:0 0 0 3px rgba(201,168,76,.28);
}

.bar{position:absolute;inset-block-end:0;inset-inline:0;height:3px;
  background:rgba(250,248,245,.2);z-index:6}

.bar i{
  display:block;height:100%;width:0;
  background:linear-gradient(90deg,var(--gold),var(--yellow),var(--blue),var(--pink));
  transform-origin:right center;
}

/* ============================================================
   عناصر شناور — همه فقط transform و opacity
   ============================================================ */
.fx{position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden}

.fx span{
  position:absolute;display:block;
  will-change:transform,opacity;
  pointer-events:none;
}

.fx svg{width:100%;height:100%;display:block}

@keyframes floatToy{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);opacity:.38}
  25%{transform:translate3d(16px,-22px,0) rotate(9deg) scale(1.08);opacity:.62}
  50%{transform:translate3d(-9px,-36px,0) rotate(-5deg) scale(.94);opacity:.46}
  75%{transform:translate3d(12px,-14px,0) rotate(12deg) scale(1.04);opacity:.6}
}

@keyframes floatBalloon{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.4}
  30%{transform:translate3d(12px,-34px,0) rotate(5deg);opacity:.66}
  60%{transform:translate3d(-9px,-58px,0) rotate(-4deg);opacity:.5}
}

@keyframes sparkle{
  0%,100%{transform:scale(.2) rotate(0deg);opacity:0}
  50%{transform:scale(1.1) rotate(180deg);opacity:.85}
}

@keyframes driftCloud{
  from{transform:translate3d(-16vw,0,0)}
  to{transform:translate3d(116vw,0,0)}
}

@keyframes bounceBall{
  0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(0,-34px,0) scale(1.08)}
}

.f-toy{animation:floatToy 7s ease-in-out infinite}
.f-balloon{animation:floatBalloon 9s ease-in-out infinite}
.f-star{animation:sparkle 2.6s ease-in-out infinite}
.f-cloud{animation:driftCloud 26s linear infinite;opacity:.16}
.f-ball{animation:bounceBall 3.4s ease-in-out infinite;opacity:.34}

/* گل‌های شکوفا — با اسکرول */
.garden{position:absolute;inset-block-end:0;inset-inline:0;height:150px;
  pointer-events:none;z-index:2;overflow:hidden}

.garden span{
  position:absolute;inset-block-end:-46px;
  opacity:0;transform:translate3d(0,20px,0) scale(.35);
  transition:transform 1.1s var(--ease),opacity 1.1s var(--ease);
  will-change:transform,opacity;
}

.garden.grown span{opacity:.62;transform:translate3d(0,-58px,0) scale(1)}
.garden.grown span.bloom{transform:translate3d(0,-72px,0) scale(1.12)}

/* ============================================================
   بخش‌ها و سرتیترها
   ============================================================ */
.sec{padding:clamp(52px,7vw,88px) 0}
.sec.alt{background:linear-gradient(180deg,transparent,rgba(237,232,224,.55),transparent)}

.head{text-align:center;max-width:640px;margin:0 auto clamp(30px,4vw,46px)}

.eyebrow{
  display:inline-block;margin-bottom:9px;
  font-size:12px;font-weight:800;letter-spacing:.16em;
  background-image:linear-gradient(90deg,var(--bronze),var(--blue),var(--pink));
  -webkit-background-clip:text;background-clip:text;color:transparent;
}

.head h2{font-size:clamp(23px,3.4vw,34px);font-weight:800;line-height:1.4}
.head p{margin-top:9px;color:var(--gray);font-size:14.5px}

/* ---------- کارت‌های چرا ---------- */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}

.why-card{
  padding:28px 22px;text-align:center;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.why-card:hover{transform:translateY(-8px);box-shadow:0 22px 46px -26px rgba(0,0,0,.28)}

.why-ico{
  width:64px;height:64px;margin:0 auto 14px;
  display:grid;place-items:center;border-radius:20px;
  color:var(--c);
  background:color-mix(in srgb,var(--c) 16%,transparent);
  transition:transform .42s var(--ease);
}

.why-card:hover .why-ico{transform:scale(1.12) rotate(-6deg)}
.why-card h3{font-size:17px;font-weight:800;margin-bottom:6px}
.why-card p{color:var(--gray);font-size:13.5px;line-height:1.95}

/* ---------- رده‌ی سنی ---------- */
.age-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin-inline:auto}

.age-card{
  display:block;padding:34px 24px;text-align:center;
  border-radius:20px;
  background:rgba(250,248,245,.75);
  border:1.5px solid color-mix(in srgb,var(--c) 30%,transparent);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease),border-color .35s ease;
}

.age-card:hover{
  transform:translateY(-6px);
  border-color:var(--c);
  box-shadow:0 20px 40px -24px color-mix(in srgb,var(--c) 80%,transparent);
}

.age-ico{
  width:76px;height:76px;margin:0 auto 12px;
  display:grid;place-items:center;border-radius:50%;
  color:var(--c);
  background:color-mix(in srgb,var(--c) 15%,transparent);
  transition:transform .4s var(--ease);
}

.age-card:hover .age-ico{transform:scale(1.1)}
.age-card h3{font-size:20px;font-weight:800}
.age-span{display:block;margin:2px 0 6px;font-size:13px;font-weight:700;color:var(--c)}
.age-card p{color:var(--gray);font-size:13px}

/* ---------- فروشگاه‌ها ---------- */
.store-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}

.store-card{
  display:flex;flex-direction:column;gap:11px;padding:20px 18px;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.store-card:hover{transform:translateY(-8px);box-shadow:0 24px 48px -28px rgba(0,0,0,.3)}

.store-top{display:flex;align-items:center;gap:11px}

.store-ava{
  position:relative;width:52px;height:52px;flex:none;
  display:grid;place-items:center;border-radius:16px;
  color:var(--c);
  background:color-mix(in srgb,var(--c) 16%,transparent);
}

.verified{
  position:absolute;inset-block-end:-3px;inset-inline-start:-3px;
  width:20px;height:20px;display:grid;place-items:center;
  border-radius:50%;color:#fff;background:var(--mint);
  border:2px solid var(--off);
}

.store-top h3{font-size:15.5px;font-weight:800;line-height:1.5}
.store-cat{font-size:12px;color:var(--gray)}

.store-rate{display:flex;align-items:center;gap:7px}
.stars{display:inline-flex;gap:1.5px}
.st{width:15px;height:15px}
.st-full{fill:var(--gold);stroke:var(--gold)}
.st-half{fill:var(--gold);stroke:var(--gold);opacity:.5}
.st-empty{fill:none;stroke:rgba(138,126,114,.42)}
.rate-n{font-size:13px;font-weight:800;color:var(--bronze)}

.tags{display:flex;flex-wrap:wrap;gap:5px}

.tags li{
  padding:3px 10px;border-radius:8px;font-size:11px;color:var(--gray);
  background:color-mix(in srgb,var(--c) 12%,transparent);
}

.store-meta{
  display:flex;flex-wrap:wrap;gap:6px 14px;
  font-size:12px;color:var(--gray);
}

.store-meta span{display:inline-flex;align-items:center;gap:5px}
.store-meta svg{color:var(--c)}

.btn-ghost{
  margin-top:auto;padding:10px;border-radius:11px;text-align:center;
  font-size:13px;font-weight:700;color:var(--c);
  border:1.5px solid color-mix(in srgb,var(--c) 42%,transparent);
  transition:background .25s var(--ease),transform .25s var(--ease);
}

.btn-ghost:hover{background:color-mix(in srgb,var(--c) 14%,transparent);transform:translateY(-2px)}

/* ---------- ست‌های کامل ---------- */
.set-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}

.set-card{
  display:flex;flex-direction:column;overflow:hidden;padding:0;
  transition:transform .42s var(--ease),box-shadow .42s var(--ease);
}

.set-card:hover{transform:translateY(-9px);box-shadow:0 26px 50px -28px rgba(0,0,0,.32)}

.set-img{position:relative;aspect-ratio:4/4.6;overflow:hidden;border-radius:16px 16px 0 0}

.set-img img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .95s var(--ease);
}

.set-card:hover .set-img img{transform:scale(1.07)}

.set-tag{
  position:absolute;inset-block-start:11px;inset-inline-start:11px;
  padding:4px 12px;border-radius:999px;
  font-size:11px;font-style:normal;font-weight:800;color:var(--ink);
  background:color-mix(in srgb,var(--c) 88%,white);
}

.set-body{display:flex;flex-direction:column;gap:5px;padding:15px 16px 17px;flex:1}
.set-body h3{font-size:15.5px;font-weight:800}
.set-body p{font-size:12.5px;color:var(--gray)}

.set-foot{
  display:flex;align-items:center;justify-content:space-between;gap:9px;
  margin-top:auto;padding-top:11px;
  border-top:1px dashed rgba(201,168,76,.28);
}

.price{font-size:16px;font-weight:800}
.price small{font-size:11px;font-weight:500;color:var(--gray);margin-inline-start:3px}

.btn-mini{
  display:inline-flex;align-items:center;gap:5px;
  padding:8px 14px;border-radius:10px;
  font-size:12px;font-weight:700;color:var(--ink);
  background:color-mix(in srgb,var(--c) 30%,white);
  transition:transform .25s var(--ease);
}

.btn-mini:hover{transform:translateY(-2px) scale(1.04)}

/* ---------- فروشنده‌ی برگزیده ---------- */
.feat{display:grid;grid-template-columns:.9fr 1.1fr;gap:0;overflow:hidden;padding:0}
.feat-media{position:relative;min-height:100%;overflow:hidden;border-radius:16px 0 0 16px}

.feat-media img{
  width:100%;height:100%;object-fit:cover;
  transition:transform 1.1s var(--ease);
}

.feat:hover .feat-media img{transform:scale(1.05)}
.feat-body{padding:clamp(26px,3.5vw,42px)}
.feat-body h2{margin:6px 0 8px;font-size:clamp(21px,2.8vw,29px);font-weight:800}
.feat-rate{display:flex;align-items:center;gap:9px;margin-bottom:12px}
.feat-rate small{font-size:12.5px;color:var(--gray)}
.feat-body p{color:var(--gray);font-size:14px;line-height:2.05}

.feat-stats{
  display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
  margin:20px 0 22px;
}

.feat-stats li{
  padding:13px 8px;text-align:center;border-radius:14px;
  background:linear-gradient(160deg,rgba(201,168,76,.14),rgba(110,200,217,.08));
  border:1px solid rgba(201,168,76,.22);
}

.feat-stats b{display:block;font-size:19px;font-weight:800;color:var(--bronze)}
.feat-stats span{font-size:11px;color:var(--gray)}

/* ---------- مراحل ---------- */
.step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;max-width:1000px;margin-inline:auto}
.step{text-align:center;padding:10px}

.step-circle{
  position:relative;width:92px;height:92px;margin:0 auto 15px;
  display:grid;place-items:center;border-radius:50%;
  color:var(--c);
  background:color-mix(in srgb,var(--c) 14%,transparent);
  border:2px dashed color-mix(in srgb,var(--c) 45%,transparent);
  transition:transform .4s var(--ease);
}

.step:hover .step-circle{transform:scale(1.07) rotate(4deg)}

.step-circle em{
  position:absolute;inset-block-start:-6px;inset-inline-end:-6px;
  min-width:28px;padding:2px 7px;border-radius:999px;
  font-size:12px;font-style:normal;font-weight:800;color:var(--ink);
  background:color-mix(in srgb,var(--c) 82%,white);
}

.step h3{font-size:18px;font-weight:800;margin-bottom:5px}
.step p{color:var(--gray);font-size:13.5px;line-height:1.95}

/* ---------- اعتماد ---------- */
.trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}

.trust{
  display:flex;gap:12px;padding:20px 18px;border-radius:18px;
  background:rgba(250,248,245,.7);
  border:1px solid color-mix(in srgb,var(--c) 26%,transparent);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease);
}

.trust:hover{transform:translateY(-5px);box-shadow:0 18px 36px -22px rgba(0,0,0,.26)}

.trust-ico{
  width:48px;height:48px;flex:none;display:grid;place-items:center;
  border-radius:15px;color:var(--c);
  background:color-mix(in srgb,var(--c) 15%,transparent);
}

.trust h3{font-size:14.5px;font-weight:800;margin-bottom:3px}
.trust p{font-size:12.5px;color:var(--gray);line-height:1.9}

/* ---------- نظر مادران ---------- */
.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}

.review{
  position:relative;padding:26px 22px;border-radius:20px;
  background:rgba(250,248,245,.8);
  border:1px solid color-mix(in srgb,var(--c) 28%,transparent);
  transition:transform .38s var(--ease),box-shadow .38s var(--ease);
}

.review:hover{transform:translateY(-6px);box-shadow:0 22px 44px -26px rgba(0,0,0,.28)}

.review .q{
  position:absolute;inset-block-start:16px;inset-inline-end:18px;
  color:var(--c);opacity:.28;
}

.rv-stars{margin-bottom:11px}
.review p{font-size:13.5px;line-height:2.1;color:#4a443e}

.rv-who{display:flex;align-items:center;gap:11px;margin-top:16px;
  padding-top:14px;border-top:1px dashed rgba(201,168,76,.26)}

.rv-ava{
  width:42px;height:42px;flex:none;display:grid;place-items:center;
  border-radius:50%;font-size:17px;font-weight:800;color:var(--off);
  background:linear-gradient(135deg,var(--c),var(--bronze));
}

.rv-who strong{display:block;font-size:13.5px}
.rv-who small{font-size:11.5px;color:var(--gray)}

/* ---------- دعوت به عضویت ---------- */
.cta{position:relative;padding:clamp(34px,5vw,58px);overflow:hidden;text-align:center}

.cta-fx{
  position:absolute;inset:-40%;
  background:
    radial-gradient(circle at 20% 30%,rgba(110,200,217,.34),transparent 42%),
    radial-gradient(circle at 78% 26%,rgba(245,160,160,.32),transparent 40%),
    radial-gradient(circle at 55% 82%,rgba(139,201,168,.3),transparent 42%),
    radial-gradient(circle at 88% 74%,rgba(240,201,122,.32),transparent 40%);
  animation:ctaDrift 22s ease-in-out infinite alternate;
  will-change:transform;
}

@keyframes ctaDrift{
  from{transform:translate3d(-3%,-2%,0) scale(1)}
  to{transform:translate3d(3%,2%,0) scale(1.08)}
}

.cta-body{position:relative;z-index:2;max-width:620px;margin-inline:auto}
.cta-body h2{margin:6px 0 10px;font-size:clamp(22px,3.2vw,32px);font-weight:800;line-height:1.45}
.cta-body p{color:var(--gray);font-size:14.5px}

.cta-form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:22px 0 10px}

.cta-field{
  display:flex;align-items:center;gap:9px;flex:1;min-width:230px;
  padding:0 16px;border-radius:999px;
  background:rgba(250,248,245,.95);
  border:1.5px solid rgba(201,168,76,.34);
  transition:border-color .25s ease,box-shadow .25s ease;
}

.cta-field:focus-within{border-color:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.16)}
.cta-field svg{color:var(--bronze)}
.cta-field input{flex:1;min-width:0;padding:14px 0;border:0;background:none;outline:none;font-size:14px}

.cta-note{min-height:22px;margin-top:6px;font-size:13px;font-weight:700}
.cta-note.ok{color:#2f6b4f}
.cta-note.bad{color:#b4544f}

.cta-perks{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin-top:14px;
  font-size:12.5px;color:var(--gray)}
.cta-perks li{display:inline-flex;align-items:center;gap:5px}
.cta-perks svg{color:var(--mint)}

/* ---------- پابرگ ---------- */
.footer{
  width:var(--wrap);margin:0 auto 22px;padding:clamp(30px,4vw,44px) clamp(20px,3vw,36px);
}

.fgrid{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:28px}
.fbrand .brand-mark{margin-bottom:11px}
.fbrand strong{display:block;font-size:19px;font-weight:800;margin-bottom:7px}
.fbrand p{font-size:13px;color:var(--gray);line-height:2;max-width:38ch}

.fbadges{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}

.fbadges span{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 11px;border-radius:999px;
  font-size:11px;color:var(--gray);
  background:rgba(201,168,76,.1);
  border:1px solid rgba(201,168,76,.22);
}

.fbadges svg{color:var(--mint)}
.fcol h4{font-size:14px;font-weight:800;margin-bottom:11px}
.fcol li{margin-bottom:7px}

.fcol a{
  font-size:13px;color:var(--gray);
  transition:color .25s ease,padding-inline-start .25s var(--ease);
}

.fcol li:nth-child(1) a:hover{color:var(--blue)}
.fcol li:nth-child(2) a:hover{color:var(--pink)}
.fcol li:nth-child(3) a:hover{color:var(--mint)}
.fcol li:nth-child(4) a:hover{color:var(--yellow)}
.fcol li:nth-child(5) a:hover{color:var(--purple)}
.fcol a:hover{padding-inline-start:5px}

.fbottom{
  display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;
  margin-top:26px;padding-top:18px;
  border-top:1px solid rgba(201,168,76,.22);
  font-size:12.5px;color:var(--gray);
}

/* ============================================================
   ظهور با اسکرول
   ============================================================ */
/* will-change فقط تا پایان انیمیشن نگه داشته می‌شود، نه برای همیشه */
.reveal{opacity:0;transform:translate3d(0,26px,0);
  transition:opacity .7s var(--ease),transform .7s var(--ease);
  will-change:transform,opacity}

.reveal.in{opacity:1;transform:none}

/* پس از ظهور، لایه‌ی گرافیکی آزاد می‌شود */
.reveal.done{will-change:auto}

/* ============================================================
   واکنش‌گرا
   ============================================================ */
@media (max-width:1080px){
  .store-grid,.set-grid{grid-template-columns:repeat(2,1fr)}
  .trust-grid{grid-template-columns:repeat(2,1fr)}
  .why-grid{grid-template-columns:repeat(2,1fr)}
  .fgrid{grid-template-columns:1fr 1fr}
  .feat{grid-template-columns:1fr}
  .feat-media{min-height:300px;border-radius:16px 16px 0 0}
}

@media (max-width:900px){
  .menu{display:none}
  .burger{display:grid}
  .nav-cta{display:none}
  .rev-grid{grid-template-columns:1fr}
  .age-grid{grid-template-columns:1fr}
  .step-grid{grid-template-columns:1fr}
}

@media (max-width:620px){
  :root{--wrap:calc(100% - 24px)}
  .why-grid,.store-grid,.set-grid,.trust-grid{grid-template-columns:1fr}
  .hero{height:clamp(400px,74vh,560px)}
  .feat-stats{grid-template-columns:repeat(2,1fr)}
  .fgrid{grid-template-columns:1fr}
  .fbottom{justify-content:center;text-align:center}
  .cta-form{flex-direction:column}
  .cta-field,.cta-form .btn-hero{width:100%}
  /* روی گوشی، عناصر شناور سبک‌تر می‌شوند */
  .f-cloud,.f-ball{display:none}
}

/* احترام به کاهش حرکت */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.001ms !important;
    scroll-behavior:auto !important;
  }
  .reveal{opacity:1;transform:none}
  .garden span{opacity:.6;transform:translate3d(0,-58px,0) scale(1)}
}
'''


# ============================================================
# JavaScript
# ============================================================
JS = r'''
/* ============================================================
   دیجی‌پوش — پوشاک کودک
   همه‌ی انیمیشن‌ها CSS هستند؛ JS فقط کلاس عوض می‌کند.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, sc) { return (sc || document).querySelector(s); };
  var $$ = function (s, sc) { return Array.prototype.slice.call((sc || document).querySelectorAll(s)); };

  /* اگر کاربر کاهش حرکت خواسته، عناصر تزئینی ساخته نمی‌شوند */
  var CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMALL = window.matchMedia('(max-width: 620px)').matches;

  /* ============================================================
     ۱. اسلایدر — گذر با CSS، JS فقط کلاس active را جابه‌جا می‌کند
     ============================================================ */
  (function slider() {
    var slides = $$('.slide');
    var dots   = $$('.dots .dot');
    var fill   = $('#barFill');
    if (slides.length < 2) return;

    var i = 0, timer = null;
    var GAP = 3000;

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
      // یک فریم صبر تا مرورگر حالت صفر را ثبت کند
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

    /* وقتی تب پنهان است، اسلایدر می‌ایستد — مصرف باتری کمتر */
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });

    /* کشیدن انگشت روی گوشی */
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
     شمارش: ۸ اسباب‌بازی، ۶ بادکنک، ۱۲ ستاره، ۴ ابر، ۴ توپ، ۸ گل
     ============================================================ */
  (function decor() {
    if (CALM) return;

    var fx = $('#fx');
    if (!fx) return;

    var SW = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
    var P = window.__DP_ICONS__;
    var COL = ['#F0C97A', '#6EC8D9', '#F5A0A0', '#8BC9A8', '#C9A0B8', '#E89B5E'];

    var frag = document.createDocumentFragment();

    /** یک عنصر شناور می‌سازد */
    function make(cls, path, size, left, top, dur, delay, color) {
      var el = document.createElement('span');
      el.className = cls;
      el.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + left + '%;top:' + top + '%;' +
        'color:' + color + ';' +
        'animation-duration:' + dur + 's;' +
        'animation-delay:-' + delay + 's';
      el.innerHTML = '<svg viewBox="0 0 24 24" ' + SW + '>' + path + '</svg>';
      frag.appendChild(el);
      return el;
    }

    var rnd = function (a, b) { return a + Math.random() * (b - a); };

    /* ۸ اسباب‌بازی */
    var toys = ['teddy', 'car', 'puzzle', 'horse', 'rabbit', 'tent', 'ball', 'gift'];
    var n = SMALL ? 5 : 8;
    for (var t = 0; t < n; t++) {
      make('fx-i f-toy', P[toys[t]], rnd(26, 46), rnd(4, 90), rnd(8, 82),
           rnd(6, 10), rnd(0, 8), COL[t % COL.length]);
    }

    /* ۶ بادکنک */
    var b = SMALL ? 4 : 6;
    for (var q = 0; q < b; q++) {
      make('fx-i f-balloon', P.balloon, rnd(28, 46), rnd(4, 92), rnd(20, 86),
           rnd(8, 12), rnd(0, 9), COL[q % COL.length]);
    }

    /* ۱۲ ستاره */
    var s = SMALL ? 8 : 12;
    for (var k = 0; k < s; k++) {
      make('fx-i f-star', k % 2 ? P.spark : P.star, rnd(10, 20), rnd(2, 96), rnd(4, 92),
           rnd(2.2, 4.2), rnd(0, 5), k % 3 === 2 ? '#FFFFFF' : COL[k % COL.length]);
    }

    /* ۴ ابر */
    if (!SMALL) {
      for (var c = 0; c < 4; c++) {
        make('fx-i f-cloud', P.cloud, rnd(70, 130), -18, rnd(6, 46),
             rnd(24, 34), rnd(0, 26), '#FFFFFF');
      }
      /* ۴ توپ */
      for (var w = 0; w < 4; w++) {
        make('fx-i f-ball', P.ball, rnd(22, 34), rnd(8, 88), rnd(55, 84),
             rnd(3, 4.6), rnd(0, 3), COL[(w + 2) % COL.length]);
      }
    }

    fx.appendChild(frag);

    /* ---------- ۸ گل شکوفا ---------- */
    var garden = document.createElement('div');
    garden.className = 'garden';
    garden.setAttribute('aria-hidden', 'true');

    var flowers = ['flower1', 'flower2', 'flower3'];
    var gf = document.createDocumentFragment();

    for (var f = 0; f < 8; f++) {
      var el = document.createElement('span');
      var sz = rnd(30, 52);
      el.style.cssText =
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'left:' + (4 + f * 12 + rnd(-3, 3)) + '%;' +
        'color:' + COL[f % COL.length] + ';' +
        'transition-delay:' + (f * 0.11).toFixed(2) + 's';
      el.innerHTML = '<svg viewBox="0 0 24 24" ' + SW + '>' + P[flowers[f % 3]] + '</svg>';
      gf.appendChild(el);
    }

    garden.appendChild(gf);
    var hero = $('.hero');
    hero && hero.appendChild(garden);

    /* شکوفایی با دیده‌شدن — نه با هر اسکرول */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        garden.classList.add('grown');
        io.disconnect();
        // موج دوم: کمی بزرگ‌تر شدن
        setTimeout(function () {
          $$('.garden span', garden).forEach(function (x, idx) {
            setTimeout(function () { x.classList.add('bloom'); }, idx * 90);
          });
        }, 900);
      }, { threshold: 0.15 });
      io.observe(garden);
    } else {
      garden.classList.add('grown');
    }
  })();

  /* ============================================================
     ۳. ظهور با اسکرول — یک ناظر برای همه، بعد قطع می‌شود
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
        io.unobserve(el);              // دیگر لازم نیست دنبالش باشیم

        /* پس از پایان انیمیشن، لایه‌ی گرافیکی آزاد می‌شود
           تا حافظه‌ی کارت گرافیک بی‌جهت اشغال نماند */
        el.addEventListener('transitionend', function () {
          el.classList.add('done');
        }, { once: true });
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    /* تأخیر پلکانی داخل هر شبکه */
    ['.why-grid', '.age-grid', '.store-grid', '.set-grid', '.step-grid', '.trust-grid', '.rev-grid']
      .forEach(function (sel) {
        $$(sel + ' > *').forEach(function (el, i) {
          el.style.transitionDelay = Math.min(i, 7) * 60 + 'ms';
        });
      });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     ۴. منوی موبایل
     ============================================================ */
  (function drawer() {
    var btn = $('.burger');
    var box = $('#drawer');
    if (!btn || !box) return;

    function set(open) {
      box.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () { set(box.hidden); });
    box.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') set(false);
    });

    /* اگر پنجره بزرگ شد، کشو بسته شود */
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (window.innerWidth > 900) set(false);
      }, 140);
    }, { passive: true });
  })();

  /* ============================================================
     ۵. فرم عضویت
     ============================================================ */
  (function cta() {
    var form = $('#ctaForm');
    var note = $('#ctaNote');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#ctaMail').value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

      note.className = 'cta-note ' + (ok ? 'ok' : 'bad');
      note.textContent = ok
        ? 'خوش آمدید! از این پس تازه‌ترین‌ها را برایتان می‌فرستیم.'
        : 'لطفاً یک نشانی ایمیل درست بنویسید.';

      if (ok) form.reset();
    });
  })();

  /* ============================================================
     ۶. کج‌شدن سه‌بعدی کارت‌ها
     ------------------------------------------------------------
     اندازه‌ی کارت فقط یک بار (هنگام ورود ماوس) خوانده می‌شود،
     نه در هر حرکت — تا مرورگر مجبور به بازچینش نشود.
     ============================================================ */
  (function tilt() {
    if (CALM || window.matchMedia('(hover: none)').matches) return;

    $$('.store-card, .set-card, .why-card').forEach(function (card) {
      var box = null, frame = 0, tx = 0, ty = 0;

      card.addEventListener('mouseenter', function () {
        box = card.getBoundingClientRect();   // یک بار کش می‌شود
      });

      card.addEventListener('mousemove', function (e) {
        if (!box) return;
        tx = (e.clientX - box.left) / box.width - 0.5;
        ty = (e.clientY - box.top) / box.height - 0.5;

        if (frame) return;
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
     ۷. پیمایش نرم به بخش‌ها
     ============================================================ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id === '#top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();
'''


# ============================================================
# مونتاژ نهایی
# ============================================================
import json

ICON_JSON = json.dumps({k: v for k, v in I.items()}, ensure_ascii=False)

HTML = f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="دیجی‌پوش — پوشاک کودک: بازارگاه لوکس مد ایران برای کوچولوها. کیفیت، ایمنی و شادی کنار هم." />
<meta name="theme-color" content="#F5F0E8" />
<title>دیجی‌پوش | پوشاک کودک</title>

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
{WHY_SEC}
{AGES_SEC}
{STORES_SEC}
{SETS_SEC}
{FEATURED}
{HOW_SEC}
{TRUST_SEC}
{REV_SEC}
{CTA}
</main>

{FOOT}

<script>window.__DP_ICONS__ = {ICON_JSON};</script>
<script>
{JS}
</script>
</body>
</html>
'''

out = D / 'KIDS-standalone.html'
out.write_text(HTML, encoding='utf-8')
print(f'✔ {out.name} — {len(HTML):,} کاراکتر')
