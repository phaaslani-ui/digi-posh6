/**
 * 🏆 club.js v2.0 — باشگاه مشتریان (نسخه واقعی)
 * ------------------------------------------------------------------
 * • استفاده از ClubTracker برای ثبت رویدادهای واقعی
 * • پیشبرد خودکار ماموریت‌ها با رویدادهای کاربر
 * • گرفتن جایزه واقعی با کد تخفیف
 * • نمایش real-time وضعیت ماموریت‌ها
 */

(function() {
  'use strict';
  if (window.ClubPageLoaded) return;
  window.ClubPageLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 📊 داده‌های ایستا
  // ═══════════════════════════════════════════════════════════════

  const LEVELS = [
    { level: 1,  need: 0,    name: 'تازه‌وارد',     icon: '🌱', benefits: ['۵٪ تخفیف اولین خرید', 'ارسال معمولی'] },
    { level: 2,  need: 50,   name: 'کاوشگر',        icon: '🔍', benefits: ['۵٪ تخفیف همه محصولات', 'دسترسی زودهنگام'] },
    { level: 3,  need: 150,  name: 'خریدار',        icon: '🛍️', benefits: ['۱۰٪ تخفیف محصولات منتخب', 'ارسال رایگان +۳۰۰ هزار'] },
    { level: 4,  need: 300,  name: 'علاقه‌مند',      icon: '💝', benefits: ['۱۰٪ تخفیف همیشگی', 'بسته‌بندی هدیه'] },
    { level: 5,  need: 500,  name: 'مشتری وفادار',   icon: '⭐', benefits: ['۱۵٪ تخفیف', 'ارسال رایگان نامحدود', 'پشتیبانی VIP'] },
    { level: 6,  need: 800,  name: 'VIP',            icon: '💎', benefits: ['۲۰٪ تخفیف', 'کالکشن ویژه', 'کش‌بک ۳٪'] },
    { level: 7,  need: 1200, name: 'ستاره‌ای',      icon: '🌟', benefits: ['۲۵٪ تخفیف', 'کش‌بک ۵٪', 'تولد ویژه'] },
    { level: 8,  need: 1700, name: 'افسانه‌ای',     icon: '👑', benefits: ['۳۰٪ تخفیف', 'کش‌بک ۷٪'] },
    { level: 9,  need: 2500, name: 'پادشاه مد',     icon: '🏆', benefits: ['۳۵٪ تخفیف', 'کش‌بک ۱۰٪', 'استایلیست AI'] },
    { level: 10, need: 4000, name: 'دیجی‌پوش',      icon: '🎉', benefits: ['۵۰٪ تخفیف', 'همه مزایا'] },
  ];

  const MISSIONS = [
    { id: 'm1',  type: 'daily',  icon: '👀', title: '۵ محصول ببین',       desc: '۵ محصول مختلف رو ببین',       target: 5,   reward: 20  },
    { id: 'm2',  type: 'daily',  icon: '❤️', title: '۳ محصول لایک کن',   desc: '۳ محصول به علاقه‌مندی‌ها',     target: 3,   reward: 30  },
    { id: 'm3',  type: 'daily',  icon: '🛒', title: 'یه محصول بخر',       desc: 'یه محصول به سبد خرید',         target: 1,   reward: 50  },
    { id: 'm4',  type: 'daily',  icon: '💬', title: 'با AI چت کن',       desc: 'یه پیام به دیجی AI',           target: 1,   reward: 15  },
    { id: 'm5',  type: 'weekly', icon: '✍️', title: '۳ نظر بنویس',        desc: 'برای ۳ محصول',                 target: 3,   reward: 100 },
    { id: 'm6',  type: 'weekly', icon: '📸', title: '۵ استایل بساز',     desc: '۵ استایل با AI',                target: 5,   reward: 150 },
    { id: 'm7',  type: 'weekly', icon: '👥', title: '۲ دست دعوت کن',     desc: 'دعوت موفق',                     target: 2,   reward: 1000 },
    { id: 'm8',  type: 'once',   icon: '🎂', title: 'تاریخ تولدت',        desc: 'تاریخ تولدت رو وارد کن',        target: 1,   reward: 200, action: 'birthday' },
    { id: 'm9',  type: 'once',   icon: '📱', title: 'اپلیکیشن',          desc: 'اپلیکیشن رو دانلود کن',         target: 1,   reward: 300, action: 'app' },
    { id: 'm10', type: 'once',   icon: '⭐', title: 'اولین خرید',        desc: 'اولین سفارش موفق',              target: 1,   reward: 500, action: 'firstorder' },
  ];

  const REWARDS = [
    { id: 'r1',  icon: '🎫', title: 'تخفیف ۱۰٪',     desc: 'روی خرید بعدی',         cost: 100  },
    { id: 'r2',  icon: '🎫', title: 'تخفیف ۲۰٪',     desc: 'روی خرید بعدی',         cost: 200  },
    { id: 'r3',  icon: '🎫', title: 'تخفیف ۳۰٪',     desc: 'روی خرید بعدی',         cost: 350  },
    { id: 'r4',  icon: '🚚', title: 'ارسال رایگان',   desc: 'یک بار',                cost: 150  },
    { id: 'r5',  icon: '📦', title: 'بسته‌بندی هدیه', desc: 'با روبان طلایی',        cost: 80   },
    { id: 'r6',  icon: '🎨', title: 'استایل با AI',   desc: 'یک جلسه',               cost: 300  },
    { id: 'r7',  icon: '💝', title: 'کادو به دوست',   desc: 'سکه بفرست',             cost: 250  },
    { id: 'r8',  icon: '🏆', title: 'VIP یک ماه',     desc: 'همه مزایا',             cost: 1000 },
    { id: 'r9',  icon: '🎁', title: 'باکس ویژه',     desc: 'محصولات منتخب',         cost: 500  },
  ];

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ توابع کمکی
  // ═══════════════════════════════════════════════════════════════

  function toFa(n) {
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function getState() {
    return (window.ClubTracker && window.ClubTracker.getState) || { coins: 0, totalEarned: 0, missionsCompleted: 0, completedMissions: [], claimedRewards: [] };
  }

  function getProgress() {
    return (window.ClubTracker && window.ClubTracker.getProgress) || (() => ({}));
  }

  function getCurrentLevel() {
    const coins = getState().coins;
    let cur = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (coins >= LEVELS[i].need) { cur = LEVELS[i]; break; }
    }
    return cur;
  }

  function getNextLevel() {
    const cur = getCurrentLevel();
    return LEVELS.find(l => l.level === cur.level + 1) || null;
  }

  function getLevelProgress() {
    const coins = getState().coins;
    const cur = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    const range = next.need - cur.need;
    if (range <= 0) return 100;
    return Math.max(0, Math.min(100, ((coins - cur.need) / range) * 100));
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر
  // ═══════════════════════════════════════════════════════════════

  function render() {
    renderHero();
    renderLevel();
    renderOverview();
    renderMissions();
    renderRewards();
    renderLeaderboard();
    updateReferralBadge();
  }

  function updateReferralBadge() {
    const s = getState();
    const badge = document.getElementById('referralTabBadge');
    if (!badge) return;
    // badge تعداد ماموریت‌های "مهم" رو نشون میده (مثلا دعوت از دوست)
    const missions = window.ClubTracker ? window.ClubTracker.getMissions() : {};
    const m7 = missions.m7;
    const prog = window.ClubTracker ? window.ClubTracker.getProgress() : {};
    const current = prog.m7 || 0;
    if (m7 && current < m7.target) {
      badge.textContent = toFa(m7.target - current);
      badge.classList.add('is-on');
    } else {
      badge.classList.remove('is-on');
    }
  }

  function renderHero() {
    const s = getState();
    const cur = getCurrentLevel();
    const lb = getLeaderboard();
    const rank = lb.findIndex(u => u.isYou) + 1;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('heroCoins', toFa(s.coins));
    set('heroLevel', toFa(cur.level));
    set('heroRank', rank > 0 ? '#' + toFa(rank) : '—');
  }

  function renderLevel() {
    const s = getState();
    const cur = getCurrentLevel();
    const next = getNextLevel();
    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : { name: 'کاربر' };

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('userName', (user.name || 'کاربر').split(' ')[0]);
    set('userBadge', cur.icon);
    set('userLevelName', cur.name);
    set('currentLevelNum', toFa(cur.level));
    set('nextLevelName', next ? next.name : '—');
    set('nextLevelNeed', next ? toFa(Math.max(0, next.need - s.coins)) : '۰');

    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = getLevelProgress() + '%';
    set('progressText', toFa(Math.floor(getLevelProgress())) + '٪ پیشرفت');
    set('coinsToNext', next ? toFa(Math.max(0, next.need - s.coins)) + ' سکه تا سطح بعدی' : '🎉 بالاترین سطح');
  }

  function renderOverview() {
    const s = getState();
    const cur = getCurrentLevel();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = toFa(v); };
    set('statEarned', s.totalEarned);
    set('statMissions', s.missionsCompleted);

    const benefits = document.getElementById('currentBenefits');
    if (benefits) {
      benefits.innerHTML = cur.benefits.map(b => '<li>' + b + '</li>').join('');
    }

    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : { name: 'USER', id: '' };
    // فقط حروف انگلیسی (نه فارسی)
    const latinName = (user.name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
    const idPart = (user.id || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const baseStr = latinName.length >= 2 ? latinName : idPart;
    const code = (baseStr.substring(0, 4) || 'USER').padEnd(4, 'X') + '-' + s.coins.toString().padStart(4, '0');
    // URL پویا (لوکال یا GitHub Pages)
    const baseUrl = window.DP_BASE_URL || (window.location.protocol + '//' + window.location.host);
    const link = document.getElementById('referralLink');
    if (link) link.value = baseUrl + '/?ref=' + code;

    // لینک دعوت واقعی - سپرده شده به club-referral.js
    // (دکمه کپی لینک خودش در club-referral.js تنظیم میشه)
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 ماموریت‌ها - رندر با قابلیت تعامل
  // ═══════════════════════════════════════════════════════════════

  function renderMissions() {
    const grid = document.getElementById('missionsGrid');
    if (!grid) return;
    const filter = window._clubFilter || 'all';
    const list = filter === 'all' ? MISSIONS : MISSIONS.filter(m => m.type === filter);

    const s = getState();
    const prog = getProgress();

    grid.innerHTML = list.map(m => {
      const progress = Math.min(prog[m.id] || 0, m.target);
      const percent = (progress / m.target) * 100;
      const completed = s.completedMissions.includes(m.id);

      // برای ماموریت‌های once با action (دستی)، دکمه بذار
      let actionBtn = '';
      if (!completed && m.action) {
        actionBtn = `<button class="club-btn club-btn-sm club-btn-outline club-mission-action" data-action="${m.action}" data-mission="${m.id}">انجام دادم</button>`;
      } else if (!completed && m.type === 'weekly' && m.id === 'm5') {
        actionBtn = `<button class="club-btn club-btn-sm club-btn-outline club-mission-action" data-action="review" data-mission="${m.id}">نظر دادم</button>`;
      } else if (!completed && m.type === 'weekly' && m.id === 'm6') {
        actionBtn = `<a href="./digiai.html" class="club-btn club-btn-sm club-btn-outline">ساخت استایل</a>`;
      } else if (!completed && m.type === 'weekly' && m.id === 'm7') {
        actionBtn = `<button class="club-btn club-btn-sm club-btn-outline club-mission-action" data-action="invite" data-mission="${m.id}">دعوت کردم</button>`;
      } else if (!completed && m.type === 'daily' && m.id === 'm4') {
        actionBtn = `<a href="./digiai.html" class="club-btn club-btn-sm club-btn-outline">شروع چت</a>`;
      }

      return `
        <article class="club-mission ${completed ? 'is-completed' : ''}" data-mission="${m.id}">
          <div class="club-mission-icon">${m.icon}</div>
          <div class="club-mission-body">
            <h3 class="club-mission-title">${m.title}</h3>
            <p class="club-mission-desc">${m.desc}</p>
            <div class="club-mission-progress">
              <div class="club-mission-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="club-mission-meta">
              <span>${toFa(progress)} / ${toFa(m.target)}</span>
              <span class="club-mission-reward">+${toFa(m.reward)} سکه</span>
            </div>
            ${actionBtn}
          </div>
        </article>
      `;
    }).join('');

    // رویداد دکمه‌ها
    grid.querySelectorAll('.club-mission-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const missionId = btn.dataset.mission;
        handleMissionAction(action, missionId, btn);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ عمل ماموریت‌های دستی
  // ═══════════════════════════════════════════════════════════════

  function handleMissionAction(action, missionId, btn) {
    switch (action) {
      case 'birthday':
        askBirthday();
        break;
      case 'app':
        confirmAppDownload();
        break;
      case 'firstorder':
        showToast('اولین سفارش ثبت کن تا جایزه بگیری!', 'info');
        break;
      case 'review':
        promptReview();
        break;
      case 'invite':
        shareReferral();
        break;
    }
  }

  function askBirthday() {
    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : null;
    if (user && user.birthday) {
      // ثبت تاریخ تولد در پروفایل
      if (window.DPAuth.updateProfile) {
        window.DPAuth.updateProfile({ birthday: user.birthday });
      }
      if (window.ClubTracker) {
        window.ClubTracker.track('m8', 1, { type: 'birthday' });
      }
      return;
    }

    const birthday = prompt('تاریخ تولدت رو وارد کن (مثال: 1370/05/15):');
    if (!birthday) return;
    if (!/^1[34]\d{2}\/\d{2}\/\d{2}$/.test(birthday)) {
      showToast('فرمت درست نیست. مثال: 1370/05/15', 'error');
      return;
    }

    if (window.DPAuth && window.DPAuth.updateProfile) {
      window.DPAuth.updateProfile({ birthday: birthday }).then(() => {
        if (window.ClubTracker) {
          window.ClubTracker.track('m8', 1, { type: 'birthday', value: birthday });
        }
      });
    }
  }

  function confirmAppDownload() {
    if (confirm('اپلیکیشن رو دانلود کردی؟')) {
      if (window.ClubTracker) {
        window.ClubTracker.track('m9', 1, { type: 'app-download' });
      }
    }
  }

  function promptReview() {
    showToast('به بخش محصولات برو و برای ۳ محصول نظرت رو بنویس. هر نظر = یه پیشرفت', 'info');
  }

  function shareReferral() {
    const link = document.getElementById('referralLink');
    if (link) {
      link.select();
      try {
        document.execCommand('copy');
        showToast('لینک دعوت کپی شد! برای هر دوست دعوت‌شده، ۵۰۰ سکه بگیر', 'info');
      } catch (e) {}
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎁 جوایز - رندر با قابلیت تعامل
  // ═══════════════════════════════════════════════════════════════

  function renderRewards() {
    const grid = document.getElementById('rewardsGrid');
    if (!grid) return;

    const s = getState();
    const claimed = s.claimedRewards || [];

    grid.innerHTML = REWARDS.map(r => {
      const canClaim = s.coins >= r.cost;
      const isClaimed = claimed.includes(r.id);

      let btnHtml = '';
      if (isClaimed) {
        const reward = s.unlockedRewards ? s.unlockedRewards.find(u => u.id === r.id) : null;
        btnHtml = `<button class="club-btn club-reward-claimed" disabled>✓ ${reward ? reward.code : 'دریافت شد'}</button>`;
      } else {
        btnHtml = `<button class="club-btn club-btn-primary" data-reward="${r.id}" ${!canClaim ? 'disabled' : ''}>
          ${canClaim ? 'دریافت' : `سکه کافی نیست (${toFa(r.cost - s.coins)} کم)`}
        </button>`;
      }

      return `
        <article class="club-reward ${isClaimed ? 'is-claimed' : ''}">
          <div class="club-reward-icon">${r.icon}</div>
          <h3 class="club-reward-title">${r.title}</h3>
          <p class="club-reward-desc">${r.desc}</p>
          <div class="club-reward-cost">${toFa(r.cost)} <small>سکه</small></div>
          ${btnHtml}
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-reward]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.reward;
        if (!window.ClubTracker) {
          showToast('سیستم باشگاه در حال بارگذاری...', 'error');
          return;
        }
        const result = window.ClubTracker.claimReward(id);
        if (result.ok) {
          showRewardCode(result);
        } else {
          showToast(result.error, 'error');
        }
      });
    });
  }

  function showRewardCode(reward) {
    // نمایش modal با کد تخفیف
    const modal = document.createElement('div');
    modal.className = 'club-reward-modal';
    modal.innerHTML = `
      <div class="club-reward-modal-backdrop"></div>
      <div class="club-reward-modal-box">
        <div class="club-reward-modal-icon">🎁</div>
        <h3>جایزه دریافت شد!</h3>
        <p>${reward.title}</p>
        <div class="club-reward-modal-code">${reward.code}</div>
        <p class="club-reward-modal-hint">این کد رو در خرید بعدی استفاده کن</p>
        <div class="club-reward-modal-actions">
          <button class="club-btn club-btn-primary" id="copyRewardCode">کپی کد</button>
          <button class="club-btn club-btn-ghost" id="closeRewardModal">بستن</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 30);

    document.getElementById('copyRewardCode').onclick = () => {
      try {
        navigator.clipboard.writeText(reward.code);
        showToast('کد کپی شد!');
      } catch (e) {
        showToast('کپی نشد', 'error');
      }
    };
    document.getElementById('closeRewardModal').onclick = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };
    modal.querySelector('.club-reward-modal-backdrop').onclick = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏆 رتبه‌بندی
  // ═══════════════════════════════════════════════════════════════

  function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    const lb = getLeaderboard();
    list.innerHTML = lb.map((u, i) => {
      const rank = i + 1;
      const topClass = rank <= 3 ? 'is-top' + rank : '';
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '#' + toFa(rank);
      return `
        <div class="club-lb-row ${topClass} ${u.isYou ? 'is-you' : ''}">
          <div class="club-lb-rank">${medal}</div>
          <div class="club-lb-user">
            <div class="club-lb-avatar">${(u.name || '?')[0]}</div>
            <div class="club-lb-info">
              <strong>${u.name}${u.isYou ? ' (شما)' : ''}</strong>
              <span>${u.city}</span>
            </div>
          </div>
          <div class="club-lb-score">${toFa(u.coins)} سکه</div>
        </div>
      `;
    }).join('');
  }

  function getLeaderboard() {
    const s = getState();
    const user = (window.DPAuth && window.DPAuth.currentUser) ? window.DPAuth.currentUser() : { name: 'شما' };
    const me = {
      name: (user.name || 'شما').split(' ')[0],
      city: 'شهر شما',
      coins: s.coins,
      isYou: true,
    };
    const others = [
      { name: 'مریم احمدی',   city: 'تهران',    coins: 1850 },
      { name: 'علی رضایی',     city: 'اصفهان',   coins: 1620 },
      { name: 'زهرا کریمی',    city: 'مشهد',     coins: 1480 },
      { name: 'حسین مرادی',    city: 'شیراز',    coins: 1290 },
      { name: 'نگار حسینی',    city: 'تبریز',    coins: 1180 },
      { name: 'محمد صادقی',    city: 'تهران',    coins: 980 },
      { name: 'فاطمه نوری',    city: 'کرج',      coins: 920 },
      { name: 'رضا کاظمی',     city: 'اهواز',    coins: 780 },
      { name: 'مینا جعفری',    city: 'قم',       coins: 720 },
    ];
    return [...others, me].sort((a, b) => b.coins - a.coins).slice(0, 10);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔔 Toast
  // ═══════════════════════════════════════════════════════════════

  function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    const tx = document.getElementById('toastText');
    if (tx) tx.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ رویدادهای عمومی
  // ═══════════════════════════════════════════════════════════════

  function setupTabs() {
    document.querySelectorAll('.club-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.club-tab').forEach(t => t.classList.remove('is-active'));
        document.querySelectorAll('.club-panel').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        const panel = document.querySelector(`.club-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('is-active');
      });
    });

    document.querySelectorAll('[data-switch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.switch;
        document.querySelector(`.club-tab[data-tab="${target}"]`)?.click();
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll('.club-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.club-filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        window._clubFilter = btn.dataset.filter;
        renderMissions();
      });
    });
  }

  // وقتی ClubTracker تغییر کرد، رندر کن
  function setupTrackerListener() {
    document.addEventListener('dp-club-change', (e) => {
      const d = e.detail;
      if (d && (d.type === 'coins' || d.type === 'progress' || d.type === 'complete' || d.type === 'reward' || d.type === 'spend')) {
        render();
      }
    });
  }

  // ═══ پنل دیباگ (تست سریع) ═══
  function setupDebugPanel() {
    const toggle = document.getElementById('toggleDebug');
    const box = document.getElementById('clubDebugBox');
    if (!toggle || !box) return;

    toggle.addEventListener('click', () => {
      const isVisible = box.style.display !== 'none';
      box.style.display = isVisible ? 'none' : 'block';
      toggle.textContent = isVisible ? 'نمایش پنل تست' : 'پنهان کردن پنل تست';
    });

    box.querySelectorAll('[data-debug]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.debug;
        if (!window.ClubTracker) return;

        if (action === 'reset') {
          if (confirm('سکه‌ها و ماموریت‌ها ریست بشن؟')) {
            window.ClubTracker.reset();
          }
          return;
        }
        if (action === '+50') {
          window.ClubTracker.addCoins(50, 'تست دستی');
          showToast('+۵۰ سکه به‌صورت تستی اضافه شد');
          return;
        }
        // track ماموریت
        window.ClubTracker.track(action, 1, { source: 'debug-panel' });
        showToast('+۱ پیشرفت در ' + action);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 شروع
  // ═══════════════════════════════════════════════════════════════

  function init() {
    if (!document.getElementById('missionsGrid')) return;
    render();
    setupTabs();
    setupFilters();
    setupTrackerListener();
    setupDebugPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
