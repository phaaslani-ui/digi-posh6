#!/usr/bin/env python3
"""
🆕 data-api.py — سرور API کامل دیجی‌پوش
• محصولات، فروشندگان، کاربران، سفارشات
• سیستم باشگاه مشتریان (club/membership)
• تراکنش‌های امتیاز، دستاوردها، کمپین‌ها، معرفی‌ها، سطوح
• ماموریت‌ها و مدال‌ها
"""

import http.server
import json
import os
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

DATA_DIR = Path(__file__).parent / 'data'
PRODUCTS_FILE = DATA_DIR / 'products.json'
SELLERS_FILE = DATA_DIR / 'sellers.json'
ORDERS_FILE = DATA_DIR / 'orders.json'
USERS_FILE = DATA_DIR / 'users.json'
TRANSACTIONS_FILE = DATA_DIR / 'transactions.json'
ACHIEVEMENTS_FILE = DATA_DIR / 'achievements.json'
CAMPAIGNS_FILE = DATA_DIR / 'campaigns.json'
TIERS_FILE = DATA_DIR / 'tiers.json'
REFERRALS_FILE = DATA_DIR / 'referrals.json'
COUPONS_FILE = DATA_DIR / 'coupons.json'
MEDALS_FILE = DATA_DIR / 'medals.json'
MISSIONS_FILE = DATA_DIR / 'missions.json'
USER_MEDALS_FILE = DATA_DIR / 'user_medals.json'
USER_MISSIONS_FILE = DATA_DIR / 'user_missions.json'

# ایجاد فایل‌های اولیه
INITIAL_FILES = [
    (PRODUCTS_FILE, []),
    (SELLERS_FILE, []),
    (ORDERS_FILE, []),
    (USERS_FILE, []),
    (TRANSACTIONS_FILE, []),
    (ACHIEVEMENTS_FILE, []),
    (CAMPAIGNS_FILE, []),
    (TIERS_FILE, []),
    (REFERRALS_FILE, []),
    (COUPONS_FILE, []),
    (MEDALS_FILE, []),
    (MISSIONS_FILE, []),
    (USER_MEDALS_FILE, []),
    (USER_MISSIONS_FILE, [])
]

for f, default in INITIAL_FILES:
    if not f.exists():
        with open(f, 'w', encoding='utf-8') as file:
            json.dump(default, file, ensure_ascii=False, indent=2)

class DataHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # محصولات
        if path == '/api/products':
            self.send_json(self.load_file(PRODUCTS_FILE))
        elif path == '/api/sellers':
            self.send_json(self.load_file(SELLERS_FILE))
        elif path == '/api/orders':
            user_id = query.get('userId', [None])[0]
            orders = self.load_file(ORDERS_FILE)
            if user_id:
                orders = [o for o in orders if o.get('userId') == user_id]
            self.send_json(orders)
        elif path == '/api/users':
            self.send_json(self.load_file(USERS_FILE))

        # CLUB APIs
        elif path == '/api/club/profile':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
                else:
                    return self.send_json({'error': 'no_users'}, 404)
            self.send_json(self.get_club_profile(user_id))

        elif path == '/api/club/transactions':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            limit = int(query.get('limit', ['50'])[0])
            self.send_json(self.get_transactions(user_id, limit))

        elif path == '/api/club/achievements':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_achievements(user_id))

        elif path == '/api/club/campaigns':
            self.send_json(self.get_active_campaigns())

        elif path == '/api/club/leaderboard':
            limit = int(query.get('limit', ['10'])[0])
            user_id = query.get('userId', [None])[0]
            result = self.get_leaderboard(limit)
            if user_id:
                result['userRank'] = self.get_user_rank(user_id)
            else:
                users = self.load_file(USERS_FILE)
                if users:
                    result['userRank'] = self.get_user_rank(users[0]['id'])
            self.send_json(result)

        elif path == '/api/club/referrals':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_referrals(user_id))

        elif path == '/api/club/tiers':
            self.send_json(self.load_file(TIERS_FILE))

        elif path == '/api/club/dashboard':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_dashboard(user_id))

        elif path == '/api/club/medals':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_user_medals(user_id))

        elif path == '/api/club/missions':
            user_id = query.get('userId', [None])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_user_missions(user_id))

        elif path == '/api/club/missions/category':
            user_id = query.get('userId', [None])[0]
            category = query.get('category', ['all'])[0]
            if not user_id:
                users = self.load_file(USERS_FILE)
                if users:
                    user_id = users[0]['id']
            self.send_json(self.get_missions_by_category(user_id, category))

        elif path == '/api/club/products':
            products = self.load_file(PRODUCTS_FILE)
            self.send_json(products[:20])

        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length else '{}'

        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        if path == '/api/products':
            self.save_file(PRODUCTS_FILE, data.get('products', []))
            self.send_json({'success': True})
        elif path == '/api/sellers':
            self.save_file(SELLERS_FILE, data.get('sellers', []))
            self.send_json({'success': True})
        elif path == '/api/orders':
            self.save_file(ORDERS_FILE, data.get('orders', []))
            self.send_json({'success': True})
        elif path == '/api/users':
            self.save_file(USERS_FILE, data.get('users', []))
            self.send_json({'success': True})
        elif path == '/api/auth/login':
            self.handle_login(data)
        elif path == '/api/auth/register':
            self.handle_register(data)
        elif path == '/api/club/spend-points':
            self.handle_spend_points(data)
        else:
            self.send_json({'error': 'not_found'}, 404)

    # ════════════════════════════════════════════════════════════════
    # CLUB LOGIC
    # ════════════════════════════════════════════════════════════════

    def get_club_profile(self, user_id):
        users = self.load_file(USERS_FILE)
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            return {'error': 'user_not_found'}, 404

        orders = self.load_file(ORDERS_FILE)
        user_orders = [o for o in orders if o.get('userId') == user_id]
        total_spent = sum(o['total'] for o in user_orders)

        transactions = self.load_file(TRANSACTIONS_FILE)
        user_transactions = [t for t in transactions if t.get('userId') == user_id]
        earned = sum(t['points'] for t in user_transactions if t['type'] == 'earn')
        spent = sum(t['points'] for t in user_transactions if t['type'] == 'spend')
        total_points = earned - spent

        tier = self.calculate_tier(len(user_orders), total_spent)

        achievements = self.load_file(ACHIEVEMENTS_FILE)
        user_achievements = [a for a in achievements if a.get('userId') == user_id]
        referrals = self.load_file(REFERRALS_FILE)
        user_referrals = [r for r in referrals if r.get('referrerId') == user_id and r.get('status') == 'completed']

        all_users_sorted = sorted(users, key=lambda u: sum(t['points'] for t in user_transactions if t['type'] == 'earn'), reverse=True)
        rank = next((i+1 for i, u in enumerate(all_users_sorted) if u['id'] == user_id), None)

        tiers = self.load_file(TIERS_FILE)
        next_tier = next((t for t in tiers if t['sortOrder'] > tier.get('sortOrder', 0)), None)
        progress = None
        if next_tier:
            purchases_needed = max(0, next_tier['minPurchases'] - len(user_orders))
            spent_needed = max(0, next_tier['minSpent'] - total_spent)
            percent = min(100, int(
                ((len(user_orders) / max(1, next_tier['minPurchases'])) * 0.5 +
                 (total_spent / max(1, next_tier['minSpent'])) * 0.5) * 100
            ))
            progress = {
                'nextTier': next_tier['displayName'],
                'nextTierIcon': next_tier['icon'],
                'purchasesNeeded': purchases_needed,
                'spentNeeded': spent_needed,
                'percent': percent
            }

        return {
            'id': user['id'],
            'fullName': user['name'],
            'email': user['email'],
            'phone': user.get('phone', ''),
            'avatar': user.get('avatar', ''),
            'joinDate': user.get('joinDate'),
            'currentTier': tier['tier'],
            'tierDisplayName': tier['displayName'],
            'tierIcon': tier['icon'],
            'tierColor': tier['color'],
            'discount': tier['discount'],
            'freeShippingThreshold': tier['freeShippingThreshold'],
            'earlyAccessHours': tier['earlyAccessHours'],
            'vipSupport': tier['vipSupport'],
            'monthlyGift': tier['monthlyGift'],
            'totalPoints': total_points,
            'lifetimePoints': earned,
            'totalPurchases': len(user_orders),
            'totalSpent': total_spent,
            'achievementCount': len(user_achievements),
            'referralCount': len(user_referrals),
            'rank': rank,
            'progress': progress
        }

    def get_transactions(self, user_id, limit):
        transactions = self.load_file(TRANSACTIONS_FILE)
        user_txs = [t for t in transactions if t.get('userId') == user_id]
        return user_txs[:limit]

    def get_achievements(self, user_id):
        achievements = self.load_file(ACHIEVEMENTS_FILE)
        return [a for a in achievements if a.get('userId') == user_id]

    def get_active_campaigns(self):
        campaigns = self.load_file(CAMPAIGNS_FILE)
        now = datetime.now().isoformat()
        active = []
        for c in campaigns:
            if c.get('isActive') and c.get('startDate') <= now <= c.get('endDate'):
                end = datetime.fromisoformat(c['endDate'])
                days_remaining = max(0, (end - datetime.now()).days)
                c['daysRemaining'] = days_remaining
                active.append(c)
        return active

    def get_leaderboard(self, limit):
        users = self.load_file(USERS_FILE)
        transactions = self.load_file(TRANSACTIONS_FILE)
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
        user_points = defaultdict(int)
        for t in transactions:
            if t['type'] == 'earn' and t['createdAt'] >= month_start:
                user_points[t['userId']] += t['points']

        leaderboard = []
        for u in users:
            leaderboard.append({
                'userId': u['id'],
                'fullName': u['name'],
                'avatar': u.get('avatar', ''),
                'tier': u.get('tier', 'basic'),
                'monthlyPoints': user_points[u['id']]
            })

        leaderboard.sort(key=lambda x: x['monthlyPoints'], reverse=True)
        for i, entry in enumerate(leaderboard[:limit]):
            entry['rank'] = i + 1
        return {'leaderboard': leaderboard[:limit], 'total': len(leaderboard)}

    def get_user_rank(self, user_id):
        users = self.load_file(USERS_FILE)
        transactions = self.load_file(TRANSACTIONS_FILE)
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
        user_points = defaultdict(int)
        for t in transactions:
            if t['type'] == 'earn' and t['createdAt'] >= month_start:
                user_points[t['userId']] += t['points']
        sorted_users = sorted(user_points.items(), key=lambda x: x[1], reverse=True)
        for i, (uid, _) in enumerate(sorted_users):
            if uid == user_id:
                return i + 1
        return None

    def get_referrals(self, user_id):
        referrals = self.load_file(REFERRALS_FILE)
        users = self.load_file(USERS_FILE)
        user_map = {u['id']: u for u in users}
        user_refs = [r for r in referrals if r.get('referrerId') == user_id]
        for r in user_refs:
            if r.get('referredId') and r['referredId'] in user_map:
                r['referredName'] = user_map[r['referredId']]['name']
        user = user_map.get(user_id, {})
        code = user.get('name', '').replace(' ', '').replace('‌', '')[:6].upper() + user_id[-3:]
        return {
            'code': code,
            'referrals': user_refs,
            'totalReferrals': len(user_refs),
            'completedReferrals': len([r for r in user_refs if r['status'] == 'completed'])
        }

    def get_dashboard(self, user_id):
        profile = self.get_club_profile(user_id)
        if isinstance(profile, tuple):
            return profile
        campaigns = self.get_active_campaigns()
        recent_txs = self.get_transactions(user_id, 5)
        achievements = self.get_achievements(user_id)
        return {
            'profile': profile,
            'campaigns': campaigns,
            'recentTransactions': recent_txs,
            'achievements': achievements[:5],
            'activeCampaignsCount': len(campaigns)
        }

    def calculate_tier(self, purchases, spent):
        tiers = self.load_file(TIERS_FILE)
        sorted_tiers = sorted(tiers, key=lambda t: t['sortOrder'], reverse=True)
        for t in sorted_tiers:
            if purchases >= t['minPurchases'] or spent >= t['minSpent']:
                return t
        return tiers[0]

    # ════════════════════════════════════════════════════════════════
    # MEDALS & MISSIONS
    # ════════════════════════════════════════════════════════════════

    def get_user_medals(self, user_id):
        all_medals = self.load_file(MEDALS_FILE)
        user_medals = self.load_file(USER_MEDALS_FILE)
        earned_ids = set(um['medalId'] for um in user_medals if um['userId'] == user_id)
        earned_map = {um['medalId']: um for um in user_medals if um['userId'] == user_id}

        result = []
        for m in all_medals:
            is_earned = m['id'] in earned_ids
            earned_info = earned_map.get(m['id'], {})
            result.append({
                **m,
                'isEarned': is_earned,
                'earnedAt': earned_info.get('earnedAt') if is_earned else None
            })

        by_rarity = {
            'legendary': [m for m in result if m['rarity'] == 'legendary'],
            'epic': [m for m in result if m['rarity'] == 'epic'],
            'rare': [m for m in result if m['rarity'] == 'rare'],
            'common': [m for m in result if m['rarity'] == 'common']
        }

        earned_count = len([m for m in result if m['isEarned']])
        earned_by_rarity = {
            r: len([m for m in ms if m['isEarned']])
            for r, ms in by_rarity.items()
        }

        return {
            'medals': result,
            'total': len(result),
            'earned': earned_count,
            'byRarity': by_rarity,
            'earnedByRarity': earned_by_rarity
        }

    def get_user_missions(self, user_id):
        all_missions = self.load_file(MISSIONS_FILE)
        all_medals = self.load_file(MEDALS_FILE)
        user_missions = self.load_file(USER_MISSIONS_FILE)

        progress_map = {}
        for um in user_missions:
            if um['userId'] == user_id:
                progress_map[um['missionId']] = um

        result = []
        for m in all_missions:
            prog = progress_map.get(m['id'], {
                'currentProgress': 0,
                'targetCount': m['target_count'],
                'isCompleted': False
            })

            medal_info = None
            if m.get('reward_medal_id'):
                medal = next((md for md in all_medals if md['id'] == m['reward_medal_id']), None)
                if medal:
                    medal_info = {
                        'name': medal['name'],
                        'icon': medal['icon'],
                        'color': medal['color'],
                        'rarity': medal['rarity']
                    }

            result.append({
                **m,
                'currentProgress': prog['currentProgress'],
                'isCompleted': prog['isCompleted'],
                'completedAt': prog.get('completedAt'),
                'medal': medal_info
            })

        by_type = {}
        for m in result:
            t = m['mission_type']
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(m)

        completed_count = len([m for m in result if m['isCompleted']])

        return {
            'missions': result,
            'total': len(result),
            'completed': completed_count,
            'byType': by_type,
            'completionPercent': int(completed_count / max(1, len(result)) * 100)
        }

    def get_missions_by_category(self, user_id, category):
        data = self.get_user_missions(user_id)
        if category == 'all':
            return data
        return {
            **data,
            'missions': data['byType'].get(category, [])
        }

    # ════════════════════════════════════════════════════════════════
    # AUTH & TRANSACTIONS
    # ════════════════════════════════════════════════════════════════

    def handle_login(self, data):
        email = data.get('email', '').strip().lower()
        users = self.load_file(USERS_FILE)
        user = next((u for u in users if u['email'].lower() == email), None)
        if user:
            token = f"tk_{user['id']}_{int(datetime.now().timestamp())}"
            self.send_json({
                'success': True,
                'user': user,
                'token': token
            })
        else:
            self.send_json({'error': 'user_not_found'}, 404)

    def handle_register(self, data):
        email = data.get('email', '').strip().lower()
        if not email:
            return self.send_json({'error': 'email_required'}, 400)

        users = self.load_file(USERS_FILE)
        if any(u['email'].lower() == email for u in users):
            return self.send_json({'error': 'email_exists'}, 400)

        new_id = f'u{len(users)+1:03d}'
        new_user = {
            'id': new_id,
            'name': data.get('name', 'کاربر جدید'),
            'email': email,
            'phone': data.get('phone', ''),
            'avatar': '',
            'joinDate': datetime.now().strftime('%Y-%m-%d'),
            'tier': 'basic',
            'points': 0,
            'totalPurchases': 0,
            'totalSpent': 0
        }
        users.append(new_user)
        self.save_file(USERS_FILE, users)

        token = f"tk_{new_id}_{int(datetime.now().timestamp())}"
        self.send_json({
            'success': True,
            'user': new_user,
            'token': token
        })

    def handle_spend_points(self, data):
        user_id = data.get('userId')
        points = data.get('points', 0)
        reward_type = data.get('rewardType', 'discount')

        users = self.load_file(USERS_FILE)
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            return self.send_json({'error': 'user_not_found'}, 404)

        profile = self.get_club_profile(user_id)
        if profile['totalPoints'] < points:
            return self.send_json({'error': 'insufficient_points'}, 400)

        discount_percent = min(50, points // 50)
        coupon_code = f'DP{user_id[-3:]}{int(datetime.now().timestamp()) % 10000:04d}'

        coupon = {
            'id': f'CP-{int(datetime.now().timestamp())}',
            'userId': user_id,
            'code': coupon_code,
            'discount': discount_percent,
            'points': points,
            'rewardType': reward_type,
            'expiresAt': (datetime.now() + timedelta(days=30)).isoformat(),
            'used': False,
            'createdAt': datetime.now().isoformat()
        }

        coupons = self.load_file(COUPONS_FILE)
        coupons.append(coupon)
        self.save_file(COUPONS_FILE, coupons)

        transactions = self.load_file(TRANSACTIONS_FILE)
        transactions.append({
            'id': f'PT-{int(datetime.now().timestamp())}',
            'userId': user_id,
            'type': 'spend',
            'points': points,
            'action': 'redeem',
            'description': f'تبدیل {points} امتیاز به {reward_type} ({coupon_code})',
            'referenceId': coupon['id'],
            'createdAt': datetime.now().isoformat()
        })
        self.save_file(TRANSACTIONS_FILE, transactions)

        self.send_json({
            'success': True,
            'coupon': coupon,
            'message': f'کد تخفیف {coupon_code} با {discount_percent}٪ تخفیف برای شما صادر شد'
        })

    # ════════════════════════════════════════════════════════════════
    # HELPERS
    # ════════════════════════════════════════════════════════════════

    def load_file(self, path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []

    def save_file(self, path, data):
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f'Error saving {path}: {e}')
            return False

    def send_json(self, data, status=200):
        if isinstance(data, tuple):
            data, status = data
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    server = http.server.HTTPServer(('0.0.0.0', port), DataHandler)
    print(f'🛍️ DigiPoosh Data API server running on port {port}')
    print(f'📂 Data directory: {DATA_DIR}')
    server.serve_forever()
