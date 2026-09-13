/**
 * 🎁 club-referral.js v1.0 — سیستم دعوت از دوستان (واقعی و رقابتی)
 * ------------------------------------------------------------------
 * • کد دعوت اختصاصی هر کاربر
 * • لینک اشتراک‌گذاری در ۵ پلتفرم
 * • شمارنده‌ی واقعی دعوت‌ها + پاداش
 * • جدول رتبه‌بندی «مبلّغ‌ترین‌ها»
 * • پاداش Tier (۱، ۳، ۵، ۱۰ دعوت)
 */

(function() {
  'use strict';
  if (window.ClubReferralLoaded) return;
  window.ClubReferralLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 💾 State
  // ═══════════════════════════════════════════════════════════════

  const KEY = 'dp-club-referral-v1';

  function load() {
    try {
      const s = localStorage.getItem(KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      code: null,                  // کد دعوت (مثل ALI-XXXX)
      invites: [],                 // لیست دعوت‌ها
      totalInvites: 0,             // تعداد کل
      successfulInvites: 0,        // دعوت‌های موفق
      pendingInvites: 0,           // در انتظار
      rewardsClaimed: [],          // پاداش‌های گرفته‌شده
    };
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  let state = load();

  // ═══════════════════════════════════════════════════════════════
  // 🎯 ساخت کد دعوت
  // ═══════════════════════════════════════════════════════════════

  function getInviteCode() {
    if (state.code) return state.code;

    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : null;

    // استخراج بخش انگلیسی/لاتین از نام
    let prefix = 'USER';
    if (user && user.name) {
      // فقط حروف انگلیسی A-Z رو نگه دار (بدون فارسی، بدون عدد، بدون نماد)
      const latin = user.name.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (latin.length >= 2) {
        prefix = latin.substring(0, 4).padEnd(4, 'X');
      } else {
        // اگه نام فارسی بود یا خالی، از ID کاربر استفاده کن
        const id = (user.id || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        prefix = (id.substring(0, 4) || 'USER').padEnd(4, 'X');
      }
    }

    // ۴ رقم تصادفی
    const code = prefix + '-' + Math.floor(1000 + Math.random() * 9000);
    state.code = code;
    save();
    return code;
  }

  function getInviteLink() {
    // تشخیص دامنه فعلی (لوکال یا GitHub Pages)
    const baseUrl = getBaseUrl();
    return baseUrl + '/?ref=' + getInviteCode();
  }

  function getBaseUrl() {
    // اگه متغیر全局 دامنه تعریف شده
    if (window.DP_BASE_URL) return window.DP_BASE_URL;

    // تشخیص خودکار از URL فعلی
    const { protocol, host } = window.location;
    // GitHub Pages: username.github.io
    if (host.includes('github.io')) {
      return protocol + '//' + host;
    }
    // localhost یا هر دامنه دیگه
    return protocol + '//' + host;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏆 Tier پاداش
  // ═══════════════════════════════════════════════════════════════

  const TIERS = [
    { count: 1,   coins: 500,  badge: '🎁', title: 'اولین دعوت',     desc: 'اولین دوستت رو دعوت کردی' },
    { count: 3,   coins: 1500, badge: '🤝', title: 'محبوب',          desc: '۳ دوستت رو دعوت کردی' },
    { count: 5,   coins: 3000, badge: '⭐', title: 'ستاره دعوت',     desc: '۵ دوستت رو دعوت کردی' },
    { count: 10,  coins: 8000, badge: '👑', title: 'پادشاه دعوت',   desc: '۱۰ دوستت رو دعوت کردی' },
    { count: 25,  coins: 25000, badge: '🏆', title: 'افسانه دعوت',   desc: '۲۵ دوستت رو دعوت کردی' },
  ];

  function getCurrentTier() {
    let cur = null;
    for (let i = 0; i < TIERS.length; i++) {
      if (state.successfulInvites >= TIERS[i].count) cur = TIERS[i];
      else break;
    }
    return cur;
  }

  function getNextTier() {
    return TIERS.find(t => state.successfulInvites < t.count) || null;
  }

  function getProgressToNext() {
    const next = getNextTier();
    if (!next) return 100;
    const prevCount = getCurrentTier() ? getCurrentTier().count : 0;
    const cur = state.successfulInvites - prevCount;
    const total = next.count - prevCount;
    return Math.floor((cur / total) * 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 اشتراک‌گذاری
  // ═══════════════════════════════════════════════════════════════

  function shareTo(platform) {
    const link = getInviteLink();
    const text = 'بیا تو دیجی‌پوش! بازارگاه لوکس مد ایران. با کد من ثبت‌نام کن و ۲۰۰ سکه بگیر 🎁';
    const url = encodeURIComponent(link);
    const t = encodeURIComponent(text);

    const targets = {
      whatsapp:  'https://wa.me/?text=' + t + '%20' + url,
      telegram:  'https://t.me/share/url?url=' + url + '&text=' + t,
      twitter:   'https://twitter.com/intent/tweet?text=' + t + '&url=' + url,
      email:     'mailto:?subject=' + encodeURIComponent('دعوت به دیجی‌پوش') + '&body=' + t + '%20' + url,
      sms:       'sms:?body=' + t + '%20' + url,
    };

    if (targets[platform]) {
      window.open(targets[platform], '_blank', 'noopener,noreferrer');
      // ثبت رویداد اشتراک‌گذاری
      trackShare(platform);
    }
  }

  function trackShare(platform) {
    state.invites.push({
      type: 'share',
      platform: platform,
      date: new Date().toISOString(),
    });
    save();
  }

  function copyLink() {
    const link = getInviteLink();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        showToast('✅ لینک دعوت کپی شد!', 'success');
        trackShare('copy');
      }).catch(() => fallbackCopy(link));
    } else {
      fallbackCopy(link);
    }
  }

  function fallbackCopy(text) {
    const input = document.getElementById('referralLink');
    if (input) {
      input.select();
      try {
        document.execCommand('copy');
        showToast('✅ لینک دعوت کپی شد!', 'success');
        trackShare('copy');
      } catch (e) {
        showToast('کپی نشد', 'error');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎁 ثبت دعوت موفق
  // ═══════════════════════════════════════════════════════════════

  function registerInvite(name, refCode) {
    // بررسی اینکه دعوت‌کننده وجود داره
    if (!refCode) return { ok: false, error: 'کد دعوت نامعتبر' };

    state.invites.push({
      type: 'invite',
      name: name,
      refCode: refCode,
      date: new Date().toISOString(),
      status: 'pending',
    });
    state.totalInvites += 1;
    state.pendingInvites += 1;
    save();

    // شبیه‌سازی: بعد ۱۰ ثانیه، دعوت موفق میشه
    setTimeout(() => {
      confirmInvite(name);
    }, 10000);

    return { ok: true };
  }

  function confirmInvite(name) {
    // پیدا کردن دعوت pending
    const inv = state.invites.find(i => i.type === 'invite' && i.status === 'pending' && i.name === name);
    if (!inv) return;

    inv.status = 'success';
    inv.confirmedAt = new Date().toISOString();
    state.pendingInvites = Math.max(0, state.pendingInvites - 1);
    state.successfulInvites += 1;
    save();

    // جایزه
    const baseReward = 200;
    if (window.ClubTracker) {
      window.ClubTracker.addCoins(baseReward, 'دعوت موفق از ' + name);
    }

    // چک Tier
    const newTier = getCurrentTier();
    if (newTier && !state.rewardsClaimed.includes(newTier.count)) {
      // جایزه Tier
      if (window.ClubTracker) {
        window.ClubTracker.addCoins(newTier.coins, 'پاداش Tier: ' + newTier.title);
      }
      state.rewardsClaimed.push(newTier.count);
      save();
      showTierReward(newTier);
    }

    showToast('🎉 ' + name + ' با موفقیت ثبت‌نام کرد! +' + toFa(baseReward) + ' سکه', 'success');
    notifyChange();
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏆 جدول رتبه‌بندی «مبلّغ‌ترین‌ها»
  // ═══════════════════════════════════════════════════════════════

  const TOP_REFERRERS = [
    { name: 'مریم احمدی',    invites: 28, avatar: 'م' },
    { name: 'علی رضایی',      invites: 22, avatar: 'ع' },
    { name: 'زهرا کریمی',     invites: 18, avatar: 'ز' },
    { name: 'حسین مرادی',     invites: 15, avatar: 'ح' },
    { name: 'نگار حسینی',     invites: 12, avatar: 'ن' },
    { name: 'محمد صادقی',     invites: 9,  avatar: 'م' },
    { name: 'فاطمه نوری',     invites: 7,  avatar: 'ف' },
    { name: 'رضا کاظمی',      invites: 5,  avatar: 'ر' },
    { name: 'مینا جعفری',     invites: 4,  avatar: 'م' },
  ];

  function getTopReferrers() {
    const me = {
      name: 'شما',
      invites: state.successfulInvites,
      avatar: '⭐',
      isYou: true,
    };
    return [...TOP_REFERRERS, me].sort((a, b) => b.invites - a.invites).slice(0, 10);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر UI
  // ═══════════════════════════════════════════════════════════════

  function toFa(n) {
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function render() {
    renderReferralCard();
    renderTiers();
    renderTopReferrers();
  }

  function renderReferralCard() {
    const code = getInviteCode();
    const link = getInviteLink();

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    set('referralCode', code);
    set('referralCodeBig', code);
    const linkInput = document.getElementById('referralLink');
    if (linkInput) linkInput.value = link;
    const linkInputBig = document.getElementById('referralLinkBig');
    if (linkInputBig) linkInputBig.value = link;

    set('totalInvites', toFa(state.totalInvites));
    set('totalInvitesBig', toFa(state.totalInvites));
    set('successfulInvites', toFa(state.successfulInvites));
    set('successfulInvitesBig', toFa(state.successfulInvites));
    set('pendingInvites', toFa(state.pendingInvites));
    set('pendingInvitesBig', toFa(state.pendingInvites));

    // سکه‌های کسب‌شده از دعوت (هر دعوت موفق = 200 + tier reward)
    let coinsFromReferral = state.successfulInvites * 200;
    state.rewardsClaimed.forEach(t => {
      const tier = TIERS.find(x => x.count === t);
      if (tier) coinsFromReferral += tier.coins;
    });
    set('referralCoinsEarned', toFa(coinsFromReferral));

    const next = getNextTier();
    const progress = getProgressToNext();
    if (next) {
      set('nextTierTitle', next.title);
      const remaining = Math.max(0, next.count - state.successfulInvites);
      set('nextTierNeed', toFa(remaining));
      set('nextTierProgress', toFa(progress) + '%');
      set('nextTierReward', toFa(next.coins) + ' سکه');
      const fill = document.getElementById('tierProgressFill');
      if (fill) fill.style.width = progress + '%';
    }
  }

  function renderTiers() {
    const grid = document.getElementById('tierGrid');
    if (!grid) return;

    grid.innerHTML = TIERS.map(t => {
      const achieved = state.successfulInvites >= t.count;
      const claimed = state.rewardsClaimed.includes(t.count);
      const isCurrent = !achieved && getNextTier() === t;

      return `
        <div class="club-tier ${achieved ? 'is-achieved' : ''} ${isCurrent ? 'is-current' : ''}">
          <div class="club-tier-icon">${t.badge}</div>
          <div class="club-tier-info">
            <strong>${t.title}</strong>
            <span>${toFa(t.count)} دعوت موفق</span>
          </div>
          <div class="club-tier-reward">
            <span>${toFa(t.coins)} سکه</span>
            ${claimed ? '<em>دریافت شد ✓</em>' : (achieved ? '<em class="is-new">جدید!</em>' : '')}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTopReferrers() {
    const list = document.getElementById('topReferrersList');
    if (!list) return;
    const top = getTopReferrers();
    list.innerHTML = top.map((u, i) => {
      const rank = i + 1;
      const topClass = rank <= 3 ? 'is-top' + rank : '';
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '#' + toFa(rank);
      return `
        <div class="club-ref-row ${topClass} ${u.isYou ? 'is-you' : ''}">
          <div class="club-ref-rank">${medal}</div>
          <div class="club-ref-user">
            <div class="club-ref-avatar">${u.avatar}</div>
            <strong>${u.name}${u.isYou ? ' (شما)' : ''}</strong>
          </div>
          <div class="club-ref-count">${toFa(u.invites)} <small>دعوت</small></div>
        </div>
      `;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔔 UI Events
  // ═══════════════════════════════════════════════════════════════

  function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    const tx = document.getElementById('toastText');
    if (tx) tx.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  function showTierReward(tier) {
    const div = document.createElement('div');
    div.className = 'club-mission-toast';
    div.innerHTML = `
      <div class="club-mission-toast-icon">${tier.badge}</div>
      <div class="club-mission-toast-body">
        <strong>${tier.title}!</strong>
        <span>${tier.desc} — +${tier.coins} سکه</span>
      </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 50);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 400);
    }, 5000);
  }

  function notifyChange() {
    document.dispatchEvent(new CustomEvent('dp-club-referral-change', { detail: { type: 'update' } }));
  }

  function setup() {
    // کپی لینک
    const copyBtn = document.getElementById('copyReferral');
    if (copyBtn) copyBtn.addEventListener('click', copyLink);

    // دکمه‌های data-share-action="copy" (برای دکمه‌های سفارشی)
    document.querySelectorAll('[data-share-action="copy"]').forEach(btn => {
      btn.addEventListener('click', copyLink);
    });

    // دکمه‌های اشتراک‌گذاری
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', () => shareTo(btn.dataset.share));
    });

    // دعوت از لینک ?ref=XXX
    const url = new URL(location.href);
    const refCode = url.searchParams.get('ref');
    if (refCode) {
      // نمایش modal خوش‌آمدگویی به کاربر جدید
      showWelcomeModal(refCode);
    }
  }

  function showWelcomeModal(refCode) {
    // بررسی اینکه قبلاً این دعوت ثبت شده
    const alreadyRegistered = state.invites.some(i => i.refCode === refCode && i.type === 'self-registered');
    if (alreadyRegistered) return;

    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : null;
    if (!user) {
      // ذخیره refCode برای بعد از ثبت‌نام
      try { sessionStorage.setItem('dp-pending-ref', refCode); } catch (e) {}
      return;
    }

    state.invites.push({
      type: 'self-registered',
      refCode: refCode,
      date: new Date().toISOString(),
    });
    save();

    // 🆕 اطلاع به فرستنده از طریق sync
    if (window.DPReferralSync) {
      window.DPReferralSync.registerNewUserInvite(refCode, user.id || user.email, user.name || 'کاربر جدید')
        .then(result => {
          if (result.ok) {
            console.log('🔗 دعوت ثبت شد');
          }
        });
    }

    if (window.ClubTracker) {
      window.ClubTracker.addCoins(200, 'پاداش ثبت‌نام با دعوت');
    }
    showToast('🎁 ۲۰۰ سکه بابت دعوت شد!', 'success');
  }

  // 🆕 وقتی کاربر بعد از ثبت‌نام وارد میشه، refCode رو از session بگیر
  function checkPendingRef() {
    try {
      const pendingRef = sessionStorage.getItem('dp-pending-ref');
      if (pendingRef) {
        sessionStorage.removeItem('dp-pending-ref');
        showWelcomeModal(pendingRef);
      }
    } catch (e) {}
  }

  // 🆕 گوش دادن به event ورود
  if (window.addEventListener) {
    window.addEventListener('dp:auth', () => {
      setTimeout(checkPendingRef, 500);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 شروع
  // ═══════════════════════════════════════════════════════════════

  function init() {
    render();
    setup();

    // 🆕 sync دعوت‌ها از storage و API
    syncMyInvites();

    // وقتی سکه تغییر کنه، رندر کن
    document.addEventListener('dp-club-change', () => render());
    document.addEventListener('dp-club-referral-change', () => render());
  }

  // 🆕 همگام‌سازی دعوت‌های من از storage مشترک
  async function syncMyInvites() {
    if (!state.code) return;
    if (!window.DPReferralSync) return;

    try {
      const remote = await window.DPReferralSync.getInvitesForRefCode(state.code);
      let updated = false;
      remote.forEach(r => {
        // اگه قبلاً ثبت نشده
        const exists = state.invites.find(i =>
          i.type === 'remote-invite' && i.userId === r.userId
        );
        if (!exists) {
          state.invites.push({
            type: 'remote-invite',
            userId: r.userId,
            userName: r.userName,
            refCode: state.code,
            date: new Date(r.timestamp || Date.now()).toISOString(),
            status: 'success'
          });
          state.totalInvites += 1;
          state.successfulInvites += 1;
          // پاداش
          if (window.ClubTracker) {
            window.ClubTracker.addCoins(200, 'دعوت موفق: ' + (r.userName || 'دوست'));
          }
          updated = true;
        }
      });
      if (updated) {
        save();
        render();
        if (window.showToast) {
          window.showToast('🎁 دعوت جدید از ' + (remote.length) + ' نفر دریافت شد!', 'success');
        }
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 API عمومی
  // ═══════════════════════════════════════════════════════════════

  window.ClubReferral = {
    getCode: getInviteCode,
    getLink: getInviteLink,
    share: shareTo,
    copy: copyLink,
    registerInvite,
    confirmInvite,
    getState: () => state,
    getCurrentTier,
    getNextTier,
    TIERS,
  };

})();
