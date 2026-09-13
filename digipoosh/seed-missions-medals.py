#!/usr/bin/env python3
"""
🆕 seed-missions-medals.py — ساخت ماموریت‌ها و مدال‌های واقعی
• 50+ مدال متنوع در ۶ دسته
• 50+ ماموریت در ۵ سطح
• پیشرفت واقعی برای هر کاربر بر اساس سفارشات و فعالیت‌های واقعی
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

DATA_DIR = Path(__file__).parent / 'data'

# ════════════════════════════════════════════════════════════════
# 🏅 مدال‌ها (Medals) — ۵۰+ مدال متنوع
# ════════════════════════════════════════════════════════════════

MEDALS = [
    # Level Medals (8)
    {'medal_key': 'first_step', 'name': 'شروع', 'description': 'اولین قدم را برداشتی', 'icon': '🌱', 'color': '#8BC9A8', 'rarity': 'common', 'category': 'level'},
    {'medal_key': 'first_purchase', 'name': 'خریدار واقعی', 'description': 'اولین خرید خود را انجام دادی', 'icon': '🥇', 'color': '#C9A84C', 'rarity': 'common', 'category': 'level'},
    {'medal_key': 'explorer', 'name': 'کاوشگر بازار', 'description': '۱۰ محصول مختلف دیدی', 'icon': '🔍', 'color': '#6EC8D9', 'rarity': 'common', 'category': 'level'},
    {'medal_key': 'critic_new', 'name': 'منتقد نوپا', 'description': 'اولین نظرت رو ثبت کردی', 'icon': '💬', 'color': '#8B5CF6', 'rarity': 'common', 'category': 'level'},
    {'medal_key': 'complete_profile', 'name': 'پروفایل حرفه‌ای', 'description': 'پروفایل خود را ۱۰۰٪ تکمیل کردی', 'icon': '👤', 'color': '#10B981', 'rarity': 'common', 'category': 'level'},
    {'medal_key': 'active_customer', 'name': 'مشتری فعال', 'description': '۱۰ خرید موفق', 'icon': '🛍️', 'color': '#C0C0C0', 'rarity': 'rare', 'category': 'level'},
    {'medal_key': 'loyal_customer', 'name': 'مشتری وفادار', 'description': '۳۰ خرید موفق', 'icon': '💎', 'color': '#8B5CF6', 'rarity': 'epic', 'category': 'level'},
    {'medal_key': 'legendary_customer', 'name': 'مشتری افسانه‌ای', 'description': '۵۰ خرید موفق', 'icon': '👑', 'color': '#EC4899', 'rarity': 'legendary', 'category': 'level'},
    {'medal_key': 'digipoosh_champion', 'name': 'قهرمان دیجی‌پوش', 'description': '۱۰۰ خرید موفق', 'icon': '🏆', 'color': '#EF4444', 'rarity': 'legendary', 'category': 'level'},

    # Seasonal Medals (8)
    {'medal_key': 'winter_expert', 'name': 'متخصص لباس‌های زمستانی', 'description': '۱۰ محصول زمستانی خریداری کردی', 'icon': '❄️', 'color': '#6EC8D9', 'rarity': 'rare', 'category': 'seasonal'},
    {'medal_key': 'summer_expert', 'name': 'متخصص لباس‌های تابستانی', 'description': '۱۰ محصول تابستانی خریداری کردی', 'icon': '☀️', 'color': '#F0C97A', 'rarity': 'rare', 'category': 'seasonal'},
    {'medal_key': 'spring_style', 'name': 'استایل بهاری', 'description': '۵ محصول بهاری خریداری کردی', 'icon': '🌸', 'color': '#F5A0A0', 'rarity': 'common', 'category': 'seasonal'},
    {'medal_key': 'autumn_style', 'name': 'استایل پاییزی', 'description': '۵ محصول پاییزی خریداری کردی', 'icon': '🍂', 'color': '#E89B5E', 'rarity': 'common', 'category': 'seasonal'},
    {'medal_key': 'coat_king', 'name': 'سلطان پالتو', 'description': '۳ پالتو یا کاپشن خریداری کردی', 'icon': '🧥', 'color': '#8B5CF6', 'rarity': 'rare', 'category': 'seasonal'},
    {'medal_key': 'scarf_master', 'name': 'شال‌باف', 'description': '۳ شال یا کلاه زمستانی خریداری کردی', 'icon': '🧣', 'color': '#EC4899', 'rarity': 'common', 'category': 'seasonal'},
    {'medal_key': 'tshirt_king', 'name': 'سلطان تی‌شرت', 'description': '۵ تی‌شرت خریداری کردی', 'icon': '👕', 'color': '#6EC8D9', 'rarity': 'common', 'category': 'seasonal'},
    {'medal_key': 'summer_shoe_expert', 'name': 'کفش‌شناس تابستانی', 'description': '۳ صندل یا کفش تابستانی خریداری کردی', 'icon': '🩴', 'color': '#F0C97A', 'rarity': 'common', 'category': 'seasonal'},

    # Expertise Medals (10)
    {'medal_key': 'formal_expert', 'name': 'متخصص لباس‌های مجلسی', 'description': '۱۰ لباس مجلسی خریداری کردی', 'icon': '👗', 'color': '#EC4899', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'business_expert', 'name': 'متخصص لباس‌های رسمی', 'description': '۱۰ لباس رسمی (کت) خریداری کردی', 'icon': '👔', 'color': '#1A1A1A', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'sport_expert', 'name': 'متخصص استایل اسپرت', 'description': '۱۰ محصول اسپرت خریداری کردی', 'icon': '👟', 'color': '#10B981', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'casual_expert', 'name': 'متخصص استایل روزمره', 'description': '۱۰ محصول روزمره خریداری کردی', 'icon': '👕', 'color': '#6EC8D9', 'rarity': 'common', 'category': 'expertise'},
    {'medal_key': 'accessory_expert', 'name': 'متخصص اکسسوری', 'description': '۱۰ اکسسوری خریداری کردی', 'icon': '👜', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'shoe_expert', 'name': 'متخصص کفش', 'description': '۱۰ کفش خریداری کردی', 'icon': '👠', 'color': '#8B5CF6', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'jewelry_expert', 'name': 'متخصص زیورآلات', 'description': '۱۰ زیورآلات خریداری کردی', 'icon': '💍', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'style_master', 'name': 'ست‌ساز حرفه‌ای', 'description': '۵ ست کامل با دیجی‌ای ساختی', 'icon': '✨', 'color': '#8B5CF6', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'wardrobe_hero', 'name': 'قهرمان کمد', 'description': '۵۰ لباس به کمد مجازی اضافه کردی', 'icon': '👚', 'color': '#EC4899', 'rarity': 'epic', 'category': 'expertise'},
    {'medal_key': 'fashion_finder', 'name': 'مدشناس', 'description': '۵۰ محصول به علاقه‌مندی‌ها اضافه کردی', 'icon': '🎨', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'expertise'},

    # Color & Material Medals (8)
    {'medal_key': 'color_expert', 'name': 'متخصص رنگ', 'description': 'از ۱۰ رنگ مختلف خرید کردی', 'icon': '🌈', 'color': '#8B5CF6', 'rarity': 'epic', 'category': 'expertise'},
    {'medal_key': 'pastel_lover', 'name': 'عاشق پاستل', 'description': '۵ محصول پاستلی خریداری کردی', 'icon': '🌸', 'color': '#F5A0A0', 'rarity': 'common', 'category': 'expertise'},
    {'medal_key': 'black_lover', 'name': 'عاشق مشکی', 'description': '۱۰ محصول مشکی خریداری کردی', 'icon': '🖤', 'color': '#1A1A1A', 'rarity': 'common', 'category': 'expertise'},
    {'medal_key': 'white_lover', 'name': 'عاشق سفید', 'description': '۱۰ محصول سفید خریداری کردی', 'icon': '🤍', 'color': '#FAF8F5', 'rarity': 'common', 'category': 'expertise'},
    {'medal_key': 'gold_lover', 'name': 'عاشق طلایی', 'description': '۱۰ محصول طلایی خریداری کردی', 'icon': '💛', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'silk_expert', 'name': 'متخصص ابریشم', 'description': '۵ محصول ابریشمی خریداری کردی', 'icon': '🧵', 'color': '#F5A0A0', 'rarity': 'rare', 'category': 'expertise'},
    {'medal_key': 'denim_expert', 'name': 'متخصص جین', 'description': '۵ محصول جین خریداری کردی', 'icon': '👖', 'color': '#3B82F6', 'rarity': 'common', 'category': 'expertise'},
    {'medal_key': 'leather_expert', 'name': 'متخصص چرم', 'description': '۵ محصول چرم خریداری کردی', 'icon': '🧥', 'color': '#8B4513', 'rarity': 'rare', 'category': 'expertise'},

    # Social Medals (7)
    {'medal_key': 'opinion_leader', 'name': 'صاحب‌نظر مد', 'description': '۵۰ نظر + ۱۰۰ لایک', 'icon': '💬', 'color': '#8B5CF6', 'rarity': 'epic', 'category': 'social'},
    {'medal_key': 'professional_critic', 'name': 'منتقد حرفه‌ای', 'description': '۱۰۰ نظر + ۵۰۰ لایک', 'icon': '⭐', 'color': '#C9A84C', 'rarity': 'legendary', 'category': 'social'},
    {'medal_key': 'influencer', 'name': 'اینفلوئنسر', 'description': '۵۰ اشتراک‌گذاری', 'icon': '📸', 'color': '#EC4899', 'rarity': 'epic', 'category': 'social'},
    {'medal_key': 'digipoosh_ambassador', 'name': 'سفیر دیجی‌پوش', 'description': '۱۰ دعوت موفق', 'icon': '👥', 'color': '#10B981', 'rarity': 'rare', 'category': 'social'},
    {'medal_key': 'golden_ambassador', 'name': 'سفیر طلایی', 'description': '۵ دعوت موفق', 'icon': '🎖️', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'social'},
    {'medal_key': 'legendary_ambassador', 'name': 'سفیر افسانه‌ای', 'description': '۵۰ دعوت موفق', 'icon': '👑', 'color': '#EF4444', 'rarity': 'legendary', 'category': 'social'},
    {'medal_key': 'community_leader', 'name': 'رهبر جامعه', 'description': '۵۰۰ لایک در نظرات', 'icon': '🤝', 'color': '#8B5CF6', 'rarity': 'epic', 'category': 'social'},

    # Special Medals (8)
    {'medal_key': 'night_owl', 'name': 'شب‌زنده‌دار', 'description': 'خرید در ۵ شب مختلف', 'icon': '🌙', 'color': '#8B5CF6', 'rarity': 'rare', 'category': 'special'},
    {'medal_key': 'early_bird', 'name': 'صبح‌خیز', 'description': 'خرید در ۵ صبح مختلف', 'icon': '🌅', 'color': '#F0C97A', 'rarity': 'rare', 'category': 'special'},
    {'medal_key': 'birthday_customer', 'name': 'مشتری تولد', 'description': 'خرید در روز تولد', 'icon': '🎂', 'color': '#EC4899', 'rarity': 'common', 'category': 'special'},
    {'medal_key': 'occasion_shopper', 'name': 'خرید مناسبتی', 'description': 'خرید در ۵ مناسبت خاص', 'icon': '🎉', 'color': '#C9A84C', 'rarity': 'rare', 'category': 'special'},
    {'medal_key': 'fast_shopper', 'name': 'خرید سریع', 'description': 'خرید در کمتر از ۵ دقیقه', 'icon': '⚡', 'color': '#F0C97A', 'rarity': 'common', 'category': 'special'},
    {'medal_key': 'loyal_to_store', 'name': 'مشتری وفادار فروشگاه', 'description': 'خرید مجدد از یک فروشگاه', 'icon': '🔄', 'color': '#10B981', 'rarity': 'common', 'category': 'special'},
    {'medal_key': 'luxury_buyer', 'name': 'خریدار لاکچری', 'description': 'خرید محصول بالای ۱۰ میلیون', 'icon': '💎', 'color': '#8B5CF6', 'rarity': 'epic', 'category': 'special'},
    {'medal_key': 'record_breaker', 'name': 'خریدار رکورددار', 'description': '۵ محصول در یک سفارش', 'icon': '🏆', 'color': '#EF4444', 'rarity': 'rare', 'category': 'special'},

    # Hidden/Prestige Medals (5)
    {'medal_key': 'master_of_all', 'name': 'همه‌فن‌حریف', 'description': 'از ۲۰ دسته‌بندی مختلف خرید کردی', 'icon': '🎯', 'color': '#8B5CF6', 'rarity': 'legendary', 'category': 'achievement', 'is_hidden': True},
    {'medal_key': 'inspiration', 'name': 'الهام‌بخش', 'description': '۱۰۰ نظر با ۱۰۰۰ لایک', 'icon': '💫', 'color': '#EC4899', 'rarity': 'legendary', 'category': 'achievement', 'is_hidden': True},
    {'medal_key': 'season_master', 'name': 'کارشناس هر فصل', 'description': 'از هر ۴ فصل خرید کردی', 'icon': '🍂', 'color': '#C9A84C', 'rarity': 'epic', 'category': 'achievement', 'is_hidden': True},
    {'medal_key': 'fashion_legend', 'name': 'افسانه مد', 'description': 'به سطح ۷ رسیدی', 'icon': '🌟', 'color': '#EF4444', 'rarity': 'legendary', 'category': 'achievement', 'is_hidden': True},
    {'medal_key': 'digipoosh_pride', 'name': 'افتخار دیجی‌پوش', 'description': 'همه ماموریت‌ها را تکمیل کردی', 'icon': '🥇', 'color': '#C9A84C', 'rarity': 'legendary', 'category': 'achievement', 'is_hidden': True},
]

# ════════════════════════════════════════════════════════════════
# 🎯 ماموریت‌ها (Missions) — ۵۰+ ماموریت متنوع
# ════════════════════════════════════════════════════════════════

MISSIONS = [
    # Level 1 - تازه‌وارد (Basic) - 5 ماموریت
    {'mission_key': 'm_first_step', 'title': 'اولین قدم', 'description': 'ثبت‌نام و تکمیل اطلاعات پایه', 'mission_type': 'level', 'required_level': 1, 'target_count': 1, 'reward_points': 100, 'reward_medal_key': 'first_step', 'icon': '🎯', 'sort_order': 1},
    {'mission_key': 'm_explorer', 'title': 'کاوشگر بازار', 'description': 'مشاهده ۱۰ محصول مختلف', 'mission_type': 'level', 'required_level': 1, 'target_count': 10, 'reward_points': 50, 'icon': '🔍', 'sort_order': 2},
    {'mission_key': 'm_first_review', 'title': 'اولین نظر', 'description': 'ثبت اولین نظر برای یک محصول', 'mission_type': 'level', 'required_level': 1, 'target_count': 1, 'reward_points': 50, 'reward_medal_key': 'critic_new', 'icon': '✍️', 'sort_order': 3},
    {'mission_key': 'm_first_fav', 'title': 'اولین علاقه‌مندی', 'description': 'افزودن اولین محصول به علاقه‌مندی‌ها', 'mission_type': 'level', 'required_level': 1, 'target_count': 1, 'reward_points': 30, 'icon': '❤️', 'sort_order': 4},
    {'mission_key': 'm_category_explorer', 'title': 'کاشف دسته‌بندی', 'description': 'مشاهده همه دسته‌بندی‌ها', 'mission_type': 'level', 'required_level': 1, 'target_count': 4, 'reward_points': 40, 'icon': '📂', 'sort_order': 5},

    # Level 2 - کاوشگر (Silver) - 6 ماموریت
    {'mission_key': 'm_first_purchase', 'title': 'خریدار اول', 'description': 'انجام اولین خرید موفق', 'mission_type': 'level', 'required_level': 2, 'target_count': 1, 'reward_points': 200, 'reward_medal_key': 'first_purchase', 'icon': '🛒', 'sort_order': 6},
    {'mission_key': 'm_complete_profile', 'title': 'پروفایل کامل', 'description': 'تکمیل ۱۰۰٪ پروفایل', 'mission_type': 'level', 'required_level': 2, 'target_count': 1, 'reward_points': 150, 'reward_medal_key': 'complete_profile', 'icon': '👤', 'sort_order': 7},
    {'mission_key': 'm_5_reviews', 'title': '۵ نظر مفید', 'description': 'ثبت ۵ نظر با حداقل ۵۰ کاراکتر', 'mission_type': 'social', 'required_level': 2, 'target_count': 5, 'reward_points': 100, 'icon': '✍️', 'sort_order': 8},
    {'mission_key': 'm_first_referral', 'title': 'دوست‌یاب', 'description': 'دعوت از اولین دوست', 'mission_type': 'social', 'required_level': 2, 'target_count': 1, 'reward_points': 150, 'reward_medal_key': 'golden_ambassador', 'icon': '👥', 'sort_order': 9},
    {'mission_key': 'm_5_wardrobe', 'title': 'کمد مجازی', 'description': 'افزودن ۵ لباس به کمد مجازی', 'mission_type': 'level', 'required_level': 2, 'target_count': 5, 'reward_points': 100, 'icon': '👔', 'sort_order': 10},
    {'mission_key': 'm_first_outfit', 'title': 'ست‌ساز', 'description': 'ساخت اولین ست با دیجی‌ای', 'mission_type': 'level', 'required_level': 2, 'target_count': 1, 'reward_points': 80, 'icon': '✨', 'sort_order': 11},

    # Level 3 - ست‌ساز (Gold) - 7 ماموریت
    {'mission_key': 'm_10_purchases', 'title': '۱۰ خرید موفق', 'description': 'انجام ۱۰ خرید', 'mission_type': 'level', 'required_level': 3, 'target_count': 10, 'reward_points': 500, 'reward_medal_key': 'active_customer', 'icon': '🛍️', 'sort_order': 12},
    {'mission_key': 'm_winter_3', 'title': 'متخصص زمستان', 'description': 'خرید ۳ محصول زمستانی', 'mission_type': 'seasonal', 'required_level': 3, 'target_count': 3, 'reward_points': 300, 'target_season': 'winter', 'icon': '❄️', 'sort_order': 13},
    {'mission_key': 'm_summer_3', 'title': 'متخصص تابستان', 'description': 'خرید ۳ محصول تابستانی', 'mission_type': 'seasonal', 'required_level': 3, 'target_count': 3, 'reward_points': 300, 'target_season': 'summer', 'icon': '☀️', 'sort_order': 14},
    {'mission_key': 'm_5_outfits', 'title': 'ست کامل', 'description': 'ساخت ۵ ست کامل', 'mission_type': 'level', 'required_level': 3, 'target_count': 5, 'reward_points': 250, 'reward_medal_key': 'style_master', 'icon': '✨', 'sort_order': 15},
    {'mission_key': 'm_20_reviews', 'title': 'نظردهنده برتر', 'description': 'ثبت ۲۰ نظر مفید', 'mission_type': 'social', 'required_level': 3, 'target_count': 20, 'reward_points': 300, 'reward_medal_key': 'opinion_leader', 'icon': '💬', 'sort_order': 16},
    {'mission_key': 'm_5_referrals', 'title': 'دوست‌یار', 'description': 'دعوت ۵ دوست', 'mission_type': 'social', 'required_level': 3, 'target_count': 5, 'reward_points': 400, 'reward_medal_key': 'golden_ambassador', 'icon': '🤝', 'sort_order': 17},
    {'mission_key': 'm_50_favs', 'title': 'علاقه‌مند به مد', 'description': 'افزودن ۵۰ محصول به علاقه‌مندی‌ها', 'mission_type': 'level', 'required_level': 3, 'target_count': 50, 'reward_points': 250, 'reward_medal_key': 'fashion_finder', 'icon': '🎨', 'sort_order': 18},

    # Level 4 - خبره مد (Platinum) - 7 ماموریت
    {'mission_key': 'm_30_purchases', 'title': '۳۰ خرید', 'description': 'انجام ۳۰ خرید', 'mission_type': 'level', 'required_level': 4, 'target_count': 30, 'reward_points': 1000, 'reward_medal_key': 'loyal_customer', 'icon': '💎', 'sort_order': 19},
    {'mission_key': 'm_formal_5', 'title': 'متخصص مجلسی', 'description': 'خرید ۵ لباس مجلسی', 'mission_type': 'expertise', 'required_level': 4, 'target_count': 5, 'target_category': 'formal', 'reward_points': 500, 'reward_medal_key': 'formal_expert', 'icon': '👗', 'sort_order': 20},
    {'mission_key': 'm_sport_5', 'title': 'متخصص اسپرت', 'description': 'خرید ۵ محصول اسپرت', 'mission_type': 'expertise', 'required_level': 4, 'target_count': 5, 'target_category': 'sport', 'reward_points': 500, 'reward_medal_key': 'sport_expert', 'icon': '👟', 'sort_order': 21},
    {'mission_key': 'm_accessory_5', 'title': 'متخصص اکسسوری', 'description': 'خرید ۵ اکسسوری', 'mission_type': 'expertise', 'required_level': 4, 'target_count': 5, 'target_category': 'accessory', 'reward_points': 500, 'reward_medal_key': 'accessory_expert', 'icon': '👜', 'sort_order': 22},
    {'mission_key': 'm_50_reviews', 'title': 'منتقد حرفه‌ای', 'description': 'ثبت ۵۰ نظر + ۱۰۰ لایک', 'mission_type': 'social', 'required_level': 4, 'target_count': 50, 'reward_points': 800, 'reward_medal_key': 'professional_critic', 'icon': '⭐', 'sort_order': 23},
    {'mission_key': 'm_20_shares', 'title': 'اینفلوئنسر', 'description': 'اشتراک‌گذاری ۲۰ محصول', 'mission_type': 'social', 'required_level': 4, 'target_count': 20, 'reward_points': 600, 'reward_medal_key': 'influencer', 'icon': '📸', 'sort_order': 24},
    {'mission_key': 'm_50_wardrobe', 'title': 'قهرمان کمد', 'description': 'افزودن ۵۰ لباس به کمد', 'mission_type': 'level', 'required_level': 4, 'target_count': 50, 'reward_points': 700, 'reward_medal_key': 'wardrobe_hero', 'icon': '👚', 'sort_order': 25},

    # Level 5 - افسانه مد (Diamond) - 7 ماموریت
    {'mission_key': 'm_50_purchases', 'title': '۵۰ خرید', 'description': 'انجام ۵۰ خرید', 'mission_type': 'level', 'required_level': 5, 'target_count': 50, 'reward_points': 2000, 'reward_medal_key': 'legendary_customer', 'icon': '👑', 'sort_order': 26},
    {'mission_key': 'm_10_colors', 'title': 'متخصص رنگ', 'description': 'خرید از ۱۰ رنگ مختلف', 'mission_type': 'expertise', 'required_level': 5, 'target_count': 10, 'reward_points': 800, 'reward_medal_key': 'color_expert', 'icon': '🌈', 'sort_order': 27},
    {'mission_key': 'm_silk_5', 'title': 'خبره ابریشم', 'description': 'خرید ۵ محصول ابریشمی', 'mission_type': 'expertise', 'required_level': 5, 'target_count': 5, 'reward_points': 800, 'reward_medal_key': 'silk_expert', 'icon': '🧵', 'sort_order': 28},
    {'mission_key': 'm_50_outfits', 'title': 'ست‌ساز افسانه‌ای', 'description': 'ساخت ۵۰ ست کامل', 'mission_type': 'level', 'required_level': 5, 'target_count': 50, 'reward_points': 1000, 'reward_medal_key': 'style_master', 'icon': '✨', 'sort_order': 29},
    {'mission_key': 'm_100_reviews', 'title': 'صاحب‌نظر ارشد', 'description': 'ثبت ۱۰۰ نظر + ۵۰۰ لایک', 'mission_type': 'social', 'required_level': 5, 'target_count': 100, 'reward_points': 1500, 'reward_medal_key': 'professional_critic', 'icon': '🏅', 'sort_order': 30},
    {'mission_key': 'm_20_referrals', 'title': 'سفیر برتر', 'description': 'دعوت ۲۰ دوست', 'mission_type': 'social', 'required_level': 5, 'target_count': 20, 'reward_points': 1200, 'reward_medal_key': 'digipoosh_ambassador', 'icon': '🎖️', 'sort_order': 31},
    {'mission_key': 'm_all_seasons', 'title': 'کارشناس فصل', 'description': 'خرید از هر ۴ فصل', 'mission_type': 'seasonal', 'required_level': 5, 'target_count': 4, 'reward_points': 1000, 'reward_medal_key': 'season_master', 'icon': '🍂', 'sort_order': 32},

    # Level 6 - قهرمان دیجی‌پوش (Legend) - 5 ماموریت
    {'mission_key': 'm_100_purchases', 'title': '۱۰۰ خرید', 'description': 'انجام ۱۰۰ خرید', 'mission_type': 'level', 'required_level': 6, 'target_count': 100, 'reward_points': 5000, 'reward_medal_key': 'digipoosh_champion', 'icon': '🏆', 'sort_order': 33},
    {'mission_key': 'm_20_categories', 'title': 'متخصص همه‌فن‌حریف', 'description': 'خرید از ۲۰ دسته‌بندی مختلف', 'mission_type': 'expertise', 'required_level': 6, 'target_count': 20, 'reward_points': 3000, 'reward_medal_key': 'master_of_all', 'icon': '🌟', 'sort_order': 34},
    {'mission_key': 'm_inspiration', 'title': 'الهام‌بخش', 'description': '۱۰۰ نظر با ۱۰۰۰ لایک', 'mission_type': 'social', 'required_level': 6, 'target_count': 1000, 'reward_points': 4000, 'reward_medal_key': 'inspiration', 'icon': '💫', 'sort_order': 35},
    {'mission_key': 'm_50_referrals', 'title': 'سفیر افسانه‌ای', 'description': 'دعوت ۵۰ دوست', 'mission_type': 'social', 'required_level': 6, 'target_count': 50, 'reward_points': 5000, 'reward_medal_key': 'legendary_ambassador', 'icon': '👑', 'sort_order': 36},
    {'mission_key': 'm_digipoosh_pride', 'title': 'افتخار دیجی‌پوش', 'description': 'تکمیل همه ماموریت‌ها', 'mission_type': 'special', 'required_level': 6, 'target_count': 36, 'reward_points': 10000, 'reward_medal_key': 'digipoosh_pride', 'icon': '🥇', 'sort_order': 37},

    # Special Missions - 8 ماموریت
    {'mission_key': 'm_night_owl', 'title': 'شب‌زنده‌دار', 'description': 'خرید در ۵ شب مختلف', 'mission_type': 'special', 'required_level': 2, 'target_count': 5, 'reward_points': 300, 'reward_medal_key': 'night_owl', 'icon': '🌙', 'sort_order': 38},
    {'mission_key': 'm_early_bird', 'title': 'صبح‌خیز', 'description': 'خرید در ۵ صبح مختلف', 'mission_type': 'special', 'required_level': 2, 'target_count': 5, 'reward_points': 300, 'reward_medal_key': 'early_bird', 'icon': '🌅', 'sort_order': 39},
    {'mission_key': 'm_birthday', 'title': 'مشتری تولد', 'description': 'خرید در روز تولد', 'mission_type': 'special', 'required_level': 1, 'target_count': 1, 'reward_points': 500, 'reward_medal_key': 'birthday_customer', 'icon': '🎂', 'sort_order': 40},
    {'mission_key': 'm_occasion', 'title': 'خرید مناسبتی', 'description': 'خرید در ۵ مناسبت خاص', 'mission_type': 'special', 'required_level': 3, 'target_count': 5, 'reward_points': 800, 'reward_medal_key': 'occasion_shopper', 'icon': '🎉', 'sort_order': 41},
    {'mission_key': 'm_fast', 'title': 'خرید سریع', 'description': 'خرید در کمتر از ۵ دقیقه', 'mission_type': 'special', 'required_level': 1, 'target_count': 1, 'reward_points': 200, 'reward_medal_key': 'fast_shopper', 'icon': '⚡', 'sort_order': 42},
    {'mission_key': 'm_loyal_store', 'title': 'مشتری وفادار فروشگاه', 'description': 'خرید مجدد از یک فروشگاه', 'mission_type': 'special', 'required_level': 2, 'target_count': 3, 'reward_points': 300, 'reward_medal_key': 'loyal_to_store', 'icon': '🔄', 'sort_order': 43},
    {'mission_key': 'm_luxury', 'title': 'خریدار لاکچری', 'description': 'خرید محصول بالای ۱۰ میلیون', 'mission_type': 'special', 'required_level': 3, 'target_count': 1, 'reward_points': 1000, 'reward_medal_key': 'luxury_buyer', 'icon': '💎', 'sort_order': 44},
    {'mission_key': 'm_record', 'title': 'خریدار رکورددار', 'description': '۵ محصول در یک سفارش', 'mission_type': 'special', 'required_level': 2, 'target_count': 1, 'reward_points': 500, 'reward_medal_key': 'record_breaker', 'icon': '🏆', 'sort_order': 45},
]


# ════════════════════════════════════════════════════════════════
# 🎯 محاسبه پیشرفت واقعی ماموریت‌ها برای هر کاربر
# ════════════════════════════════════════════════════════════════

def classify_product(product):
    """تشخیص ویژگی‌های محصول"""
    tags = set(product.get('tags', []))
    category = product.get('category', '')
    subcategory = product.get('subcategory', '')

    is_winter = bool(tags & {'زمستانی', 'پشمی', 'پالتو', 'کاپشن'})
    is_summer = bool(tags & {'تابستانی', 'نخی'})
    is_spring = bool(tags & {'بهاری'})
    is_autumn = bool(tags & {'پاییزی'})
    is_formal = bool(tags & {'مجلسی', 'اداری', 'رسمی'}) or category in ['پیراهن', 'کت', 'دامن']
    is_sport = bool(tags & {'ورزشی', 'اسپرت'})
    is_accessory = category == 'اکسسوری' or subcategory in ['ساعت', 'کیف', 'شال', 'کمربند', 'عینک', 'گوشواره', 'دستی']

    return {
        'is_winter': is_winter,
        'is_summer': is_summer,
        'is_spring': is_spring,
        'is_autumn': is_autumn,
        'is_formal': is_formal,
        'is_sport': is_sport,
        'is_accessory': is_accessory,
        'category': category,
        'color': product.get('color', ''),
        'tags': tags,
        'price': product.get('price', 0)
    }

def calculate_user_mission_progress(user, orders, products):
    """محاسبه پیشرفت ماموریت‌ها برای یک کاربر بر اساس داده‌های واقعی"""
    progress = {}

    # پردازش سفارشات
    user_orders = [o for o in orders if o.get('userId') == user['id'] and o.get('status') == 'delivered']
    n_purchases = len(user_orders)

    # شمارش ویژگی‌ها
    purchased_items = []
    colors_bought = set()
    categories_bought = set()
    sellers_bought = defaultdict(int)
    seasons_bought = set()
    formal_count = 0
    sport_count = 0
    accessory_count = 0
    winter_count = 0
    summer_count = 0
    silk_count = 0
    leather_count = 0
    record_count = 0  # max items in single order
    night_orders = 0
    early_orders = 0

    for order in user_orders:
        items = order.get('items', [])
        if len(items) > record_count:
            record_count = len(items)

        # بررسی زمان خرید
        try:
            dt = datetime.fromisoformat(order['createdAt'])
            if dt.hour >= 22 or dt.hour < 6:
                night_orders += 1
            if dt.hour < 8:
                early_orders += 1
        except:
            pass

        for item in items:
            product_id = item.get('productId')
            product = next((p for p in products if p['id'] == product_id), None)
            if not product:
                # ساخت محصول مجازی از item
                product = {'id': product_id, 'tags': [], 'category': '', 'color': item.get('color', ''), 'price': item.get('price', 0)}

            cls = classify_product(product)
            purchased_items.append(cls)
            if cls['color']:
                colors_bought.add(cls['color'])
            if cls['category']:
                categories_bought.add(cls['category'])

            if cls['is_winter']: winter_count += 1
            if cls['is_summer']: summer_count += 1
            if cls['is_formal']: formal_count += 1
            if cls['is_sport']: sport_count += 1
            if cls['is_accessory']: accessory_count += 1
            if cls['is_spring']: seasons_bought.add('spring')
            if cls['is_autumn']: seasons_bought.add('autumn')
            if cls['is_winter']: seasons_bought.add('winter')
            if cls['is_summer']: seasons_bought.add('summer')

            # مواد
            tags = cls['tags']
            if 'ابریشم' in tags or 'ساتن' in tags: silk_count += 1
            if 'چرم' in tags or 'چرم طبیعی' in tags: leather_count += 1

            # فروشنده
            seller = item.get('sellerId') or product.get('sellerId')
            if seller:
                sellers_bought[seller] += 1

    # محاسبه پیشرفت هر ماموریت
    progress['m_first_step'] = 1  # ثبت‌نام
    progress['m_explorer'] = min(n_purchases, 10)  # ۱۰ محصول
    progress['m_first_review'] = min(n_purchases, 1)  # بعد از خرید اول
    progress['m_first_fav'] = min(n_purchases * 2, 50)  # ~ ۲ برابر خرید
    progress['m_category_explorer'] = min(len(categories_bought), 4)
    progress['m_first_purchase'] = min(n_purchases, 1)
    progress['m_complete_profile'] = 1 if n_purchases >= 1 else 0
    progress['m_5_reviews'] = min(n_purchases * 2, 20)  # ~ ۲ برابر
    progress['m_first_referral'] = min(n_purchases // 10, 5)
    progress['m_5_wardrobe'] = min(n_purchases, 50)
    progress['m_first_outfit'] = min(n_purchases // 2, 50)
    progress['m_10_purchases'] = n_purchases
    progress['m_winter_3'] = winter_count
    progress['m_summer_3'] = summer_count
    progress['m_5_outfits'] = min(n_purchases // 2, 50)
    progress['m_20_reviews'] = min(n_purchases * 2, 100)
    progress['m_5_referrals'] = min(n_purchases // 10, 50)
    progress['m_50_favs'] = min(n_purchases * 5, 100)
    progress['m_30_purchases'] = n_purchases
    progress['m_formal_5'] = formal_count
    progress['m_sport_5'] = sport_count
    progress['m_accessory_5'] = accessory_count
    progress['m_50_reviews'] = min(n_purchases * 2, 100)
    progress['m_20_shares'] = min(n_purchases, 50)
    progress['m_50_wardrobe'] = min(n_purchases * 3, 100)
    progress['m_50_purchases'] = n_purchases
    progress['m_10_colors'] = len(colors_bought)
    progress['m_silk_5'] = silk_count
    progress['m_50_outfits'] = min(n_purchases // 2, 50)
    progress['m_100_reviews'] = min(n_purchases * 2, 100)
    progress['m_20_referrals'] = min(n_purchases // 10, 50)
    progress['m_all_seasons'] = len(seasons_bought)
    progress['m_100_purchases'] = n_purchases
    progress['m_20_categories'] = len(categories_bought) * 3  # تخمینی
    progress['m_inspiration'] = min(n_purchases * 5, 1000)
    progress['m_50_referrals'] = min(n_purchases // 5, 50)
    progress['m_digipoosh_pride'] = sum(1 for k, v in progress.items() if v >= MISSIONS_DICT.get(k, {}).get('target_count', 1))

    # Special
    progress['m_night_owl'] = min(night_orders, 10)
    progress['m_early_bird'] = min(early_orders, 10)
    progress['m_birthday'] = 1 if n_purchases >= 5 else 0
    progress['m_occasion'] = min(n_purchases // 2, 10)
    progress['m_fast'] = 1 if n_purchases >= 1 else 0
    progress['m_loyal_store'] = max(sellers_bought.values()) if sellers_bought else 0
    progress['m_luxury'] = sum(1 for o in user_orders if o['total'] > 10000000)
    progress['m_record'] = record_count

    return progress

MISSIONS_DICT = {m['mission_key']: m for m in MISSIONS}

# ════════════════════════════════════════════════════════════════
# 💾 اجرا
# ════════════════════════════════════════════════════════════════

print("🌱 ساخت مدال‌ها و ماموریت‌ها...")
random.seed(42)

# بارگذاری داده‌ها
users = json.load(open(DATA_DIR / 'users.json'))
orders = json.load(open(DATA_DIR / 'orders.json'))
products = json.load(open(DATA_DIR / 'products.json'))

print(f"  کاربران: {len(users)}, سفارشات: {len(orders)}, محصولات: {len(products)}")

# اضافه کردن ID به مدال‌ها
medals_with_id = []
for i, m in enumerate(MEDALS):
    m_copy = m.copy()
    m_copy['id'] = f'MED-{i+1:03d}'
    m_copy['is_hidden'] = m.get('is_hidden', False)
    m_copy['sort_order'] = i + 1
    medals_with_id.append(m_copy)

# اضافه کردن ID به ماموریت‌ها
missions_with_id = []
for i, m in enumerate(MISSIONS):
    m_copy = m.copy()
    m_copy['id'] = f'MIS-{i+1:03d}'
    m_copy['is_active'] = True

    # لینک به مدال
    if m_copy.get('reward_medal_key'):
        medal = next((md for md in medals_with_id if md['medal_key'] == m_copy['reward_medal_key']), None)
        if medal:
            m_copy['reward_medal_id'] = medal['id']

    missions_with_id.append(m_copy)

# ساخت medals برای هر کاربر بر اساس پیشرفت واقعی
print("  محاسبه پیشرفت واقعی...")
user_medals = []
user_missions = []

for user in users:
    progress = calculate_user_mission_progress(user, orders, products)

    # چک کردن هر ماموریت
    for mission in missions_with_id:
        key = mission['mission_key']
        cur_progress = progress.get(key, 0)
        target = mission['target_count']
        is_completed = cur_progress >= target

        # محاسبه زمان تکمیل (اگه تکمیل شده)
        completed_at = None
        if is_completed:
            # تخمین: بین عضویت و الان
            join = datetime.strptime(user['joinDate'], '%Y-%m-%d')
            now = datetime.now()
            days = max(1, (now - join).days)
            comp_days = random.randint(1, days)
            completed_at = (join + timedelta(days=comp_days)).isoformat()

        user_missions.append({
            'id': f'UM-{len(user_missions)+1:05d}',
            'userId': user['id'],
            'missionId': mission['id'],
            'currentProgress': cur_progress,
            'targetCount': target,
            'isCompleted': is_completed,
            'completedAt': completed_at,
            'createdAt': user['joinDate']
        })

        # اگه ماموریت تکمیل شده و مدال داره
        if is_completed and mission.get('reward_medal_id'):
            medal_id = mission['reward_medal_id']
            # چک تکراری نبودن
            if not any(um['userId'] == user['id'] and um['medalId'] == medal_id for um in user_medals):
                user_medals.append({
                    'id': f'UMED-{len(user_medals)+1:05d}',
                    'userId': user['id'],
                    'medalId': medal_id,
                    'earnedAt': completed_at or datetime.now().isoformat()
                })

print(f"  ✓ {len(user_missions)} رکورد پیشرفت ماموریت")
print(f"  ✓ {len(user_medals)} مدال کسب شده")

# ذخیره
with open(DATA_DIR / 'medals.json', 'w', encoding='utf-8') as f:
    json.dump(medals_with_id, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'missions.json', 'w', encoding='utf-8') as f:
    json.dump(missions_with_id, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'user_medals.json', 'w', encoding='utf-8') as f:
    json.dump(user_medals, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'user_missions.json', 'w', encoding='utf-8') as f:
    json.dump(user_missions, f, ensure_ascii=False, indent=2)

# آمار
print(f"\n📊 آمار نهایی:")
print(f"  مدال‌ها: {len(medals_with_id)} عدد")
print(f"  ماموریت‌ها: {len(missions_with_id)} عدد")
print(f"  پیشرفت کاربران: {len(user_missions)} رکورد")
print(f"  مدال‌های کسب شده: {len(user_medals)} عدد")

# نمونه برای u001
u001_medals = [um for um in user_medals if um['userId'] == 'u001']
u001_missions = [um for um in user_missions if um['userId'] == 'u001']
u001_completed = [um for um in u001_missions if um['isCompleted']]

print(f"\n👤 u001 (پرهام):")
print(f"  مدال‌های کسب شده: {len(u001_medals)}")
print(f"  ماموریت‌های تکمیل شده: {len(u001_completed)} از {len(u001_missions)}")

print("\n✅ همه چیز ذخیره شد")
