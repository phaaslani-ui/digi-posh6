#!/usr/bin/env python3
"""
🌱 seed-club-data.py — ساخت داده‌های واقعی برای باشگاه مشتریان
• کاربران واقعی
• سفارشات واقعی
• تراکنش‌های امتیاز
• دستاوردها (achievements)
• کمپین‌های فعال
• معرفی‌ها (referrals)
• سطوح (tiers)
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta

DATA_DIR = Path(__file__).parent / 'data'

# ════════════════════════════════════════════════════════════════
# 👥 کاربران واقعی
# ════════════════════════════════════════════════════════════════

USERS = [
    {'id': 'u001', 'name': 'پرهام اصلانی‌رخ', 'email': 'phaaslani@gmail.com', 'phone': '09123456789', 'avatar': '', 'joinDate': '2024-01-15', 'tier': 'gold', 'points': 3900, 'totalPurchases': 18, 'totalSpent': 28500000},
    {'id': 'u002', 'name': 'سارا کریمی', 'email': 'sara.karimi@gmail.com', 'phone': '09121111111', 'avatar': '', 'joinDate': '2023-06-10', 'tier': 'platinum', 'points': 15240, 'totalPurchases': 42, 'totalSpent': 45800000},
    {'id': 'u003', 'name': 'رضا احمدی', 'email': 'reza.ahmadi@yahoo.com', 'phone': '09122222222', 'avatar': '', 'joinDate': '2023-08-22', 'tier': 'platinum', 'points': 14890, 'totalPurchases': 38, 'totalSpent': 38500000},
    {'id': 'u004', 'name': 'مریم رضایی', 'email': 'maryam.r@gmail.com', 'phone': '09123333333', 'avatar': '', 'joinDate': '2023-11-05', 'tier': 'gold', 'points': 13560, 'totalPurchases': 32, 'totalSpent': 32000000},
    {'id': 'u005', 'name': 'علی مرادی', 'email': 'ali.moradi@gmail.com', 'phone': '09124444444', 'avatar': '', 'joinDate': '2024-02-18', 'tier': 'silver', 'points': 7820, 'totalPurchases': 22, 'totalSpent': 18500000},
    {'id': 'u006', 'name': 'نگار حسینی', 'email': 'negar.h@gmail.com', 'phone': '09125555555', 'avatar': '', 'joinDate': '2024-03-12', 'tier': 'silver', 'points': 6540, 'totalPurchases': 16, 'totalSpent': 12300000},
    {'id': 'u007', 'name': 'حسین کاظمی', 'email': 'hossein.k@gmail.com', 'phone': '09126666666', 'avatar': '', 'joinDate': '2024-04-20', 'tier': 'gold', 'points': 11230, 'totalPurchases': 28, 'totalSpent': 25600000},
    {'id': 'u008', 'name': 'زهرا صادقی', 'email': 'zahra.s@gmail.com', 'phone': '09127777777', 'avatar': '', 'joinDate': '2024-05-08', 'tier': 'silver', 'points': 5680, 'totalPurchases': 14, 'totalSpent': 9800000},
    {'id': 'u009', 'name': 'محمد قاسمی', 'email': 'mohammad.gh@gmail.com', 'phone': '09128888888', 'avatar': '', 'joinDate': '2024-06-15', 'tier': 'gold', 'points': 9450, 'totalPurchases': 24, 'totalSpent': 19800000},
    {'id': 'u010', 'name': 'فاطمه نوری', 'email': 'fateme.n@gmail.com', 'phone': '09129999999', 'avatar': '', 'joinDate': '2024-07-01', 'tier': 'diamond', 'points': 22600, 'totalPurchases': 56, 'totalSpent': 58400000},
    {'id': 'u011', 'name': 'امیر رضاییان', 'email': 'amir.r@gmail.com', 'phone': '09130000001', 'avatar': '', 'joinDate': '2024-08-10', 'tier': 'silver', 'points': 4320, 'totalPurchases': 11, 'totalSpent': 7200000},
    {'id': 'u012', 'name': 'لیلا محمدی', 'email': 'leila.m@gmail.com', 'phone': '09130000002', 'avatar': '', 'joinDate': '2024-08-25', 'tier': 'gold', 'points': 8920, 'totalPurchases': 21, 'totalSpent': 17200000},
    {'id': 'u013', 'name': 'بهرام احمدی', 'email': 'bahram.a@gmail.com', 'phone': '09130000003', 'avatar': '', 'joinDate': '2024-09-05', 'tier': 'silver', 'points': 5120, 'totalPurchases': 13, 'totalSpent': 8600000},
    {'id': 'u014', 'name': 'شیما کریمی', 'email': 'shima.k@gmail.com', 'phone': '09130000004', 'avatar': '', 'joinDate': '2024-09-18', 'tier': 'basic', 'points': 1850, 'totalPurchases': 4, 'totalSpent': 2800000},
    {'id': 'u015', 'name': 'کاوه موسوی', 'email': 'kaveh.m@gmail.com', 'phone': '09130000005', 'avatar': '', 'joinDate': '2024-10-02', 'tier': 'gold', 'points': 10100, 'totalPurchases': 26, 'totalSpent': 22400000},
    {'id': 'u016', 'name': 'رویا رضایی', 'email': 'roya.r@gmail.com', 'phone': '09130000006', 'avatar': '', 'joinDate': '2024-10-20', 'tier': 'platinum', 'points': 16780, 'totalPurchases': 35, 'totalSpent': 36500000},
    {'id': 'u017', 'name': 'سامان مرادی', 'email': 'saman.m@gmail.com', 'phone': '09130000007', 'avatar': '', 'joinDate': '2024-11-08', 'tier': 'silver', 'points': 6450, 'totalPurchases': 17, 'totalSpent': 11500000},
    {'id': 'u018', 'name': 'پگاه احمدی', 'email': 'pegah.a@gmail.com', 'phone': '09130000008', 'avatar': '', 'joinDate': '2024-11-25', 'tier': 'basic', 'points': 2200, 'totalPurchases': 6, 'totalSpent': 3500000},
    {'id': 'u019', 'name': 'شهرام کاظمی', 'email': 'shahram.k@gmail.com', 'phone': '09130000009', 'avatar': '', 'joinDate': '2024-12-10', 'tier': 'gold', 'points': 8650, 'totalPurchases': 19, 'totalSpent': 15600000},
    {'id': 'u020', 'name': 'مینا صادقی', 'email': 'mina.s@gmail.com', 'phone': '09130000010', 'avatar': '', 'joinDate': '2025-01-05', 'tier': 'legend', 'points': 32100, 'totalPurchases': 78, 'totalSpent': 89500000},
]

# ════════════════════════════════════════════════════════════════
# 📦 سفارشات واقعی
# ════════════════════════════════════════════════════════════════

def generate_orders():
    """ساخت سفارشات واقعی برای هر کاربر"""
    orders = []
    order_id = 1000
    products = json.load(open(DATA_DIR / 'products.json'))

    for user in USERS:
        n_orders = user['totalPurchases']
        join_date = datetime.strptime(user['joinDate'], '%Y-%m-%d')
        now = datetime.now()

        for i in range(n_orders):
            # تاریخ تصادفی بین عضویت و الان
            days_ago = random.randint(0, max(1, (now - join_date).days))
            order_date = now - timedelta(days=days_ago)

            # انتخاب ۱-۳ محصول تصادفی
            n_items = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
            selected_products = random.sample(products, min(n_items, len(products)))
            items = []
            total = 0
            for p in selected_products:
                qty = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
                items.append({
                    'productId': p['id'],
                    'name': p['name'],
                    'price': p['price'],
                    'quantity': qty,
                    'image': p['image']
                })
                total += p['price'] * qty

            # وضعیت - ۹۰٪ تحویل شده
            statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'processing']
            status = random.choice(statuses)

            order = {
                'id': f'ORD-{order_id}',
                'userId': user['id'],
                'orderNumber': f'SV-{order_id}',
                'items': items,
                'total': total,
                'status': status,
                'createdAt': order_date.isoformat(),
                'deliveredAt': (order_date + timedelta(days=random.randint(2, 7))).isoformat() if status == 'delivered' else None
            }
            orders.append(order)
            order_id += 1

    return sorted(orders, key=lambda o: o['createdAt'], reverse=True)

# ════════════════════════════════════════════════════════════════
# 💰 تراکنش‌های امتیاز
# ════════════════════════════════════════════════════════════════

def generate_transactions(orders):
    """ساخت تراکنش‌های امتیاز برای سفارشات + فعالیت‌های دیگه"""
    transactions = []
    trans_id = 5000

    # تراکنش‌های خرید
    for order in orders:
        if order['status'] == 'delivered':
            points = int(order['total'] / 1000)  # ۱ امتیاز per ۱۰۰۰ تومان
            transactions.append({
                'id': f'PT-{trans_id}',
                'userId': order['userId'],
                'type': 'earn',
                'points': points,
                'action': 'purchase',
                'description': f'خرید سفارش {order["orderNumber"]}',
                'referenceId': order['id'],
                'createdAt': order['deliveredAt']
            })
            trans_id += 1

    # تراکنش‌های فعالیت روزانه
    for user in USERS:
        n_daily = random.randint(10, 60)
        join_date = datetime.strptime(user['joinDate'], '%Y-%m-%d')
        now = datetime.now()

        for i in range(n_daily):
            days_ago = random.randint(0, max(1, (now - join_date).days))
            trans_date = now - timedelta(days=days_ago)
            transactions.append({
                'id': f'PT-{trans_id}',
                'userId': user['id'],
                'type': 'earn',
                'points': random.choice([5, 10, 15]),
                'action': 'daily_login',
                'description': 'ورود روزانه',
                'referenceId': None,
                'createdAt': trans_date.isoformat()
            })
            trans_id += 1

    # تراکنش‌های نظر
    for user in USERS:
        n_reviews = random.randint(2, 12)
        join_date = datetime.strptime(user['joinDate'], '%Y-%m-%d')
        now = datetime.now()

        for i in range(n_reviews):
            days_ago = random.randint(0, max(1, (now - join_date).days))
            trans_date = now - timedelta(days=days_ago)
            transactions.append({
                'id': f'PT-{trans_id}',
                'userId': user['id'],
                'type': 'earn',
                'points': random.choice([30, 50, 70]),
                'action': 'review',
                'description': 'ثبت نظر برای محصول',
                'referenceId': None,
                'createdAt': trans_date.isoformat()
            })
            trans_id += 1

    return sorted(transactions, key=lambda t: t['createdAt'], reverse=True)

# ════════════════════════════════════════════════════════════════
# 🏆 دستاوردها
# ════════════════════════════════════════════════════════════════

def generate_achievements():
    """ساخت دستاوردهای واقعی بر اساس فعالیت‌های کاربر"""
    achievements = []
    ach_id = 8000

    for user in USERS:
        user_ach = []

        # اولین خرید - همه
        if user['totalPurchases'] >= 1:
            user_ach.append({
                'id': f'ACH-{ach_id}',
                'userId': user['id'],
                'key': 'first_purchase',
                'name': 'اولین خرید',
                'icon': '🥇',
                'reward': 100,
                'earnedAt': user['joinDate']
            })
            ach_id += 1

        # ۱۰ خرید
        if user['totalPurchases'] >= 10:
            user_ach.append({
                'id': f'ACH-{ach_id}',
                'userId': user['id'],
                'key': 'ten_purchases',
                'name': '۱۰ خرید موفق',
                'icon': '🛍️',
                'reward': 300,
                'earnedAt': (datetime.strptime(user['joinDate'], '%Y-%m-%d') + timedelta(days=random.randint(30, 120))).strftime('%Y-%m-%d')
            })
            ach_id += 1

        # ۵۰ خرید
        if user['totalPurchases'] >= 50:
            user_ach.append({
                'id': f'ACH-{ach_id}',
                'userId': user['id'],
                'key': 'fifty_purchases',
                'name': '۵۰ خرید موفق',
                'icon': '👑',
                'reward': 500,
                'earnedAt': (datetime.strptime(user['joinDate'], '%Y-%m-%d') + timedelta(days=random.randint(180, 365))).strftime('%Y-%m-%d')
            })
            ach_id += 1

        # مشتری یک‌ساله
        join_dt = datetime.strptime(user['joinDate'], '%Y-%m-%d')
        if (datetime.now() - join_dt).days > 365:
            user_ach.append({
                'id': f'ACH-{ach_id}',
                'userId': user['id'],
                'key': 'one_year_member',
                'name': 'مشتری یک‌ساله',
                'icon': '🎂',
                'reward': 500,
                'earnedAt': (join_dt + timedelta(days=365)).strftime('%Y-%m-%d')
            })
            ach_id += 1

        # سطح طلایی
        if user['tier'] in ['gold', 'platinum', 'diamond', 'legend']:
            user_ach.append({
                'id': f'ACH-{ach_id}',
                'userId': user['id'],
                'key': 'gold_tier',
                'name': 'رسیدن به سطح طلایی',
                'icon': '⭐',
                'reward': 1000,
                'earnedAt': (join_dt + timedelta(days=random.randint(60, 200))).strftime('%Y-%m-%d')
            })
            ach_id += 1

        achievements.extend(user_ach)

    return achievements

# ════════════════════════════════════════════════════════════════
# 🎯 کمپین‌های فعال
# ════════════════════════════════════════════════════════════════

CAMPAIGNS = [
    {
        'id': 'C001',
        'title': '🎯 کمپین هفتگی: ۲ برابر امتیاز',
        'description': 'در خریدهای این هفته ۲ برابر امتیاز دریافت کنید',
        'type': 'weekly',
        'rewardType': 'double_points',
        'rewardValue': 2,
        'minPurchase': 500000,
        'startDate': (datetime.now() - timedelta(days=4)).isoformat(),
        'endDate': (datetime.now() + timedelta(days=3)).isoformat(),
        'isActive': True
    },
    {
        'id': 'C002',
        'title': '🏆 کمپین ماهانه: مشتری برتر',
        'description': 'بیشترین خرید این ماه ۵۰۰۰۰۰ تومان تخفیف نقدی برنده می‌شود',
        'type': 'monthly',
        'rewardType': 'discount',
        'rewardValue': 500000,
        'minPurchase': 1000000,
        'startDate': (datetime.now() - timedelta(days=12)).isoformat(),
        'endDate': (datetime.now() + timedelta(days=18)).isoformat(),
        'isActive': True
    },
    {
        'id': 'C003',
        'title': '🎁 هدیه ویژه: ارسال رایگان',
        'description': 'برای خریدهای بالای ۲ میلیون تومان، ارسال رایگان',
        'type': 'special',
        'rewardType': 'free_shipping',
        'rewardValue': 0,
        'minPurchase': 2000000,
        'startDate': (datetime.now() - timedelta(days=30)).isoformat(),
        'endDate': (datetime.now() + timedelta(days=60)).isoformat(),
        'isActive': True
    },
    {
        'id': 'C004',
        'title': '👥 معرفی دوستان',
        'description': 'هر دوست معرفی شده = ۲۰۰ امتیاز + ۱۰٪ تخفیف اولین خرید',
        'type': 'special',
        'rewardType': 'points',
        'rewardValue': 200,
        'minPurchase': 0,
        'startDate': (datetime.now() - timedelta(days=60)).isoformat(),
        'endDate': (datetime.now() + timedelta(days=300)).isoformat(),
        'isActive': True
    }
]

# ════════════════════════════════════════════════════════════════
# 🎖️ سطوح (tiers)
# ════════════════════════════════════════════════════════════════

TIERS = [
    {'tier': 'basic', 'displayName': 'عضو عادی', 'minPurchases': 0, 'minSpent': 0, 'discount': 0, 'freeShippingThreshold': 0, 'earlyAccessHours': 0, 'vipSupport': False, 'monthlyGift': False, 'color': '#8BC9A8', 'icon': '🌱', 'sortOrder': 1},
    {'tier': 'silver', 'displayName': 'عضو نقره‌ای', 'minPurchases': 5, 'minSpent': 5000000, 'discount': 5, 'freeShippingThreshold': 2000000, 'earlyAccessHours': 0, 'vipSupport': False, 'monthlyGift': False, 'color': '#C0C0C0', 'icon': '🥈', 'sortOrder': 2},
    {'tier': 'gold', 'displayName': 'عضو طلایی', 'minPurchases': 15, 'minSpent': 15000000, 'discount': 10, 'freeShippingThreshold': 2000000, 'earlyAccessHours': 24, 'vipSupport': False, 'monthlyGift': False, 'color': '#C9A84C', 'icon': '🥇', 'sortOrder': 3},
    {'tier': 'platinum', 'displayName': 'عضو پلاتینی', 'minPurchases': 30, 'minSpent': 30000000, 'discount': 15, 'freeShippingThreshold': 0, 'earlyAccessHours': 48, 'vipSupport': True, 'monthlyGift': False, 'color': '#8B5CF6', 'icon': '💎', 'sortOrder': 4},
    {'tier': 'diamond', 'displayName': 'عضو الماس', 'minPurchases': 50, 'minSpent': 50000000, 'discount': 20, 'freeShippingThreshold': 0, 'earlyAccessHours': 72, 'vipSupport': True, 'monthlyGift': True, 'color': '#EC4899', 'icon': '💎', 'sortOrder': 5},
    {'tier': 'legend', 'displayName': 'عضو افسانه‌ای', 'minPurchases': 100, 'minSpent': 100000000, 'discount': 25, 'freeShippingThreshold': 0, 'earlyAccessHours': 168, 'vipSupport': True, 'monthlyGift': True, 'color': '#EF4444', 'icon': '👑', 'sortOrder': 6}
]

# ════════════════════════════════════════════════════════════════
# 👥 معرفی‌ها (referrals)
# ════════════════════════════════════════════════════════════════

def generate_referrals():
    """ساخت معرفی‌های واقعی"""
    referrals = []
    ref_id = 9000

    for user in USERS:
        # کد دعوت هر کاربر
        code = user['name'].replace(' ', '').replace('‌', '')[:6].upper() + user['id'][-3:]

        # ۱-۵ معرفی
        n_referrals = random.randint(1, 5)
        for i in range(n_referrals):
            # یک کاربر دیگه به عنوان معرفی شده
            referred = random.choice([u for u in USERS if u['id'] != user['id']])

            status = random.choice(['completed', 'completed', 'completed', 'pending'])

            referrals.append({
                'id': f'REF-{ref_id}',
                'referrerId': user['id'],
                'referredId': referred['id'],
                'code': code,
                'status': status,
                'referrerReward': 200,
                'referredReward': 10,
                'completedAt': (datetime.now() - timedelta(days=random.randint(10, 200))).isoformat() if status == 'completed' else None,
                'createdAt': (datetime.now() - timedelta(days=random.randint(15, 250))).isoformat()
            })
            ref_id += 1

    return referrals

# ════════════════════════════════════════════════════════════════
# 💾 ذخیره
# ════════════════════════════════════════════════════════════════

print("🌱 ساخت داده‌های واقعی باشگاه...")
random.seed(42)  # نتایج ثابت

orders = generate_orders()
print(f"  ✓ {len(orders)} سفارش")
transactions = generate_transactions(orders)
print(f"  ✓ {len(transactions)} تراکنش امتیاز")
achievements = generate_achievements()
print(f"  ✓ {len(achievements)} دستاورد")
referrals = generate_referrals()
print(f"  ✓ {len(referrals)} معرفی")

# ذخیره
with open(DATA_DIR / 'users.json', 'w', encoding='utf-8') as f:
    json.dump(USERS, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'orders.json', 'w', encoding='utf-8') as f:
    json.dump(orders, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'transactions.json', 'w', encoding='utf-8') as f:
    json.dump(transactions, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'achievements.json', 'w', encoding='utf-8') as f:
    json.dump(achievements, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'campaigns.json', 'w', encoding='utf-8') as f:
    json.dump(CAMPAIGNS, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'tiers.json', 'w', encoding='utf-8') as f:
    json.dump(TIERS, f, ensure_ascii=False, indent=2)
with open(DATA_DIR / 'referrals.json', 'w', encoding='utf-8') as f:
    json.dump(referrals, f, ensure_ascii=False, indent=2)

print("✅ همه داده‌ها ذخیره شدند")
