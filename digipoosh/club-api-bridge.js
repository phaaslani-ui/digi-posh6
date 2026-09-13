/**
 * 🌉 club-api-bridge.js — اتصال club.html به API واقعی
 * این فایل همه ID های club.html رو با داده‌های واقعی از سرور پر میکنه
 */

(function() {
  'use strict';
  if (window.ClubAPIBridgeLoaded) return;
  window.ClubAPIBridgeLoaded = true;

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8001'
    : `${window.location.protocol}//${window.location.hostname}:8001`;

  // ════════════════════════════════════════════════════════════════
  // 🛠️ HELPERS
  // ════════════════════════════════════════════════════════════════

  function toFa(n) {
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function fmtNumber(n) {
    if (!n && n !== 0) return '۰';
    return toFa(n.toLocaleString('en-US'));
  }

  function fmtPrice(n) {
    if (!n) return '۰';
    return fmtNumber(n) + ' تومان';
  }

  function relativeTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'چند لحظه پیش';
    if (diff < 3600) return `${toFa(Math.floor(diff/60))} دقیقه پیش`;
    if (diff < 86400) return `${toFa(Math.floor(diff/3600))} ساعت پیش`;
    if (diff < 2592000) return `${toFa(Math.floor(diff/86400))} روز پیش`;
    if (diff < 31536000) return `${toFa(Math.floor(diff/2592000))} ماه پیش`;
    return `${toFa(Math.floor(diff/31536000))} سال پیش`;
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    return `${toFa(d.getDate())} ${months[d.getMonth()]} ${toFa(d.getFullYear())}`;
  }

  async function api(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error('API error ' + res.status);
      return await res.json();
    } catch (e) {
      console.error('API call failed:', path, e);
      return null;
    }
  }

  function getUserId() {
    // از localStorage بخوان یا از query
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('userId') || localStorage.getItem('dp_user_id') || localStorage.getItem('dp_user') && JSON.parse(localStorage.getItem('dp_user') || '{}').id;
    return userId || 'u001';
  }

  // ════════════════════════════════════════════════════════════════
  // 📊 RENDERERS
  // ════════════════════════════════════════════════════════════════

  function renderProfile(profile) {
    if (!profile || profile.error) return;

    // Hero stats
    const heroCoins = document.getElementById('heroCoins');
    if (heroCoins) heroCoins.textContent = fmtNumber(profile.totalPoints);
    const heroLevel = document.getElementById('heroLevel');
    if (heroLevel) heroLevel.textContent = profile.tierIcon;
    const heroRank = document.getElementById('heroRank');
    if (heroRank) heroRank.textContent = profile.rank ? '#' + toFa(profile.rank) : '—';

    // Level card
    const userBadge = document.getElementById('userBadge');
    if (userBadge) userBadge.textContent = profile.tierIcon;
    const userName = document.getElementById('userName');
    if (userName) userName.textContent = profile.fullName;
    const userLevelName = document.getElementById('userLevelName');
    if (userLevelName) userLevelName.textContent = profile.tierDisplayName;

    const currentLevelNum = document.getElementById('currentLevelNum');
    if (currentLevelNum) currentLevelNum.textContent = profile.tierIcon + ' ' + profile.tierDisplayName;

    // Progress
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = (profile.progress?.percent || 0) + '%';
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = toFa(profile.progress?.percent || 0) + '٪ پیشرفت';

    const coinsToNext = document.getElementById('coinsToNext');
    if (coinsToNext && profile.progress) {
      const need = profile.progress.purchasesNeeded > 0 ? profile.progress.purchasesNeeded + ' خرید' : profile.progress.spentNeeded.toLocaleString('en-US') + ' تومان';
      coinsToNext.textContent = `${need} تا ${profile.progress.nextTier}`;
    }

    const nextLevelInfo = document.getElementById('nextLevelInfo');
    if (nextLevelInfo && profile.progress) {
      nextLevelInfo.innerHTML = `${profile.progress.purchasesNeeded} خرید دیگه تا ${profile.progress.nextTier}`;
    }

    // Stats
    const statEarned = document.getElementById('statEarned');
    if (statEarned) statEarned.textContent = fmtNumber(profile.lifetimePoints);

    // Benefits
    const currentBenefits = document.getElementById('currentBenefits');
    if (currentBenefits) {
      const benefits = [];
      if (profile.discount > 0) benefits.push(`🎫 ${toFa(profile.discount)}٪ تخفیف`);
      if (profile.freeShippingThreshold > 0) benefits.push(`🚚 ارسال رایگان +${fmtNumber(profile.freeShippingThreshold)}`);
      else if (profile.discount >= 15) benefits.push(`🚚 ارسال رایگان نامحدود`);
      if (profile.earlyAccessHours > 0) benefits.push(`⚡ دسترسی زودهنگام ${toFa(profile.earlyAccessHours)} ساعت`);
      if (profile.vipSupport) benefits.push(`👑 پشتیبانی VIP`);
      if (profile.monthlyGift) benefits.push(`🎁 هدیه ماهانه`);
      benefits.push(`📊 ${toFa(profile.totalPurchases)} خرید`);
      benefits.push(`💎 ${fmtPrice(profile.totalSpent)} خرید`);

      currentBenefits.innerHTML = benefits.map(b => `<li>${b}</li>`).join('');
    }

    // Referral stats
    const referralCode = document.getElementById('referralCode');
    if (referralCode) {
      // کد از API جداگانه میاد
      api(`/api/club/referrals?userId=${profile.id}`).then(ref => {
        if (ref && ref.code) {
          referralCode.textContent = ref.code;
          const referralCodeBig = document.getElementById('referralCodeBig');
          if (referralCodeBig) referralCodeBig.textContent = ref.code;
          const referralLink = document.getElementById('referralLink');
          if (referralLink) referralLink.value = `https://digipoosh.ir/register?ref=${ref.code}`;
          const referralLinkBig = document.getElementById('referralLinkBig');
          if (referralLinkBig) referralLinkBig.value = `https://digipoosh.ir/register?ref=${ref.code}`;
        }
      });
    }
  }

  function renderTransactions(transactions) {
    const list = document.getElementById('transactionsList');
    if (!list) return;
    if (!transactions || transactions.length === 0) {
      list.innerHTML = '<div class="club-empty"><p>هنوز تراکنشی ندارید</p></div>';
      return;
    }

    const actionIcons = {
      purchase: '🛍️',
      daily_login: '📅',
      review: '✍️',
      referral: '👥',
      achievement: '🏆',
      redeem: '🎁',
      birthday: '🎂'
    };

    list.innerHTML = transactions.map(t => {
      const icon = actionIcons[t.action] || '💰';
      const sign = t.type === 'earn' ? '+' : '−';
      const color = t.type === 'earn' ? 'var(--success)' : 'var(--danger)';
      return `
        <div class="club-tx-row">
          <div class="club-tx-icon">${icon}</div>
          <div class="club-tx-info">
            <strong>${t.description}</strong>
            <small>${relativeTime(t.createdAt)}</small>
          </div>
          <div class="club-tx-points" style="color:${color}">${sign}${fmtNumber(t.points)}</div>
        </div>
      `;
    }).join('');
  }

  function renderAchievements(achievements) {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    if (!achievements || achievements.length === 0) {
      grid.innerHTML = '<div class="club-empty"><p>هنوز دستاوردی کسب نکرده‌اید</p></div>';
      return;
    }
    grid.innerHTML = achievements.map(a => `
      <div class="club-ach-card">
        <div class="club-ach-icon">${a.icon}</div>
        <div class="club-ach-info">
          <strong>${a.name}</strong>
          <small>${fmtDate(a.earnedAt)}</small>
        </div>
        <div class="club-ach-reward">+${fmtNumber(a.reward)} سکه</div>
      </div>
    `).join('');
  }

  function renderCampaigns(campaigns) {
    const list = document.getElementById('campaignsList');
    if (!list) return;
    if (!campaigns || campaigns.length === 0) {
      list.innerHTML = '<div class="club-empty"><p>کمپین فعالی نیست</p></div>';
      return;
    }
    list.innerHTML = campaigns.map(c => `
      <div class="club-campaign-card">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <div class="club-campaign-meta">
          <span>⏱️ ${c.daysRemaining} روز باقی</span>
          <span>💰 ${c.minPurchase > 0 ? 'حداقل ' + fmtPrice(c.minPurchase) : 'بدون محدودیت'}</span>
        </div>
      </div>
    `).join('');
  }

  function renderLeaderboard(data) {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    if (!data || !data.leaderboard) return;

    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = data.leaderboard.map((u, i) => `
      <div class="club-lb-row ${u.userId === getUserId() ? 'is-you' : ''}">
        <div class="club-lb-rank">${medals[i] || '#' + toFa(i+1)}</div>
        <div class="club-lb-user">
          <div class="club-lb-avatar">${u.fullName.charAt(0)}</div>
          <div>
            <strong>${u.fullName}</strong>
            <small>${u.tier || 'basic'}</small>
          </div>
        </div>
        <div class="club-lb-points">${fmtNumber(u.monthlyPoints)} سکه</div>
      </div>
    `).join('');

    // نمایش رتبه کاربر
    const userRankBadge = document.getElementById('userRankBadge');
    if (userRankBadge && data.userRank) {
      userRankBadge.textContent = '#' + toFa(data.userRank);
    }
  }

  function renderReferrals(data) {
    if (!data) return;
    const totalInvites = document.getElementById('totalInvites');
    if (totalInvites) totalInvites.textContent = fmtNumber(data.totalReferrals);
    const successfulInvites = document.getElementById('successfulInvites');
    if (successfulInvites) successfulInvites.textContent = fmtNumber(data.completedReferrals);
    const pendingInvites = document.getElementById('pendingInvites');
    if (pendingInvites) pendingInvites.textContent = fmtNumber(data.totalReferrals - data.completedReferrals);

    const totalInvitesBig = document.getElementById('totalInvitesBig');
    if (totalInvitesBig) totalInvitesBig.textContent = fmtNumber(data.totalReferrals);
    const successfulInvitesBig = document.getElementById('successfulInvitesBig');
    if (successfulInvitesBig) successfulInvitesBig.textContent = fmtNumber(data.completedReferrals);
    const pendingInvitesBig = document.getElementById('pendingInvitesBig');
    if (pendingInvitesBig) pendingInvitesBig.textContent = fmtNumber(data.totalReferrals - data.completedReferrals);
  }

  function renderTiers(tiers) {
    const grid = document.getElementById('tierGrid');
    if (!grid) return;
    if (!tiers) return;
    grid.innerHTML = tiers.map(t => `
      <div class="club-tier-card" style="border-color:${t.color}">
        <div class="club-tier-icon" style="background:${t.color}">${t.icon}</div>
        <h4>${t.displayName}</h4>
        <ul>
          <li>${toFa(t.minPurchases)}+ خرید</li>
          <li>${fmtPrice(t.minSpent)}+ خرید</li>
          <li>${toFa(t.discount)}٪ تخفیف</li>
        </ul>
      </div>
    `).join('');
  }

  // ════════════════════════════════════════════════════════════════
  // 🚀 BOOTSTRAP
  // ════════════════════════════════════════════════════════════════

  async function loadClubData() {
    const userId = getUserId();
    console.log('[Club API Bridge] Loading data for', userId);

    // بارگذاری همه داده‌ها به صورت موازی
    const [profile, transactions, achievements, campaigns, leaderboard, referrals, tiers] = await Promise.all([
      api(`/api/club/profile?userId=${userId}`),
      api(`/api/club/transactions?userId=${userId}&limit=20`),
      api(`/api/club/achievements?userId=${userId}`),
      api(`/api/club/campaigns`),
      api(`/api/club/leaderboard?limit=10&userId=${userId}`),
      api(`/api/club/referrals?userId=${userId}`),
      api(`/api/club/tiers`)
    ]);

    console.log('[Club API Bridge] Profile:', profile);

    renderProfile(profile);
    renderTransactions(transactions);
    renderAchievements(achievements);
    renderCampaigns(campaigns);
    renderLeaderboard(leaderboard);
    renderReferrals(referrals);
    renderTiers(tiers);
  }

  // بارگذاری خودکار
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(loadClubData, 100));
  } else {
    setTimeout(loadClubData, 100);
  }

  // در صورت تغییر کاربر، دوباره بارگذاری
  window.addEventListener('storage', (e) => {
    if (e.key === 'dp_user_id' || e.key === 'dp_user') {
      loadClubData();
    }
  });

  // Export برای استفاده در سایر اسکریپت‌ها
  window.ClubAPIBridge = { loadClubData, getUserId, api };

  console.log('✅ Club API Bridge loaded');
})();
