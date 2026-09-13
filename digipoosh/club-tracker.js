/**
 * 🏆 club-tracker.js v1.0 — سیستم ردیابی ماموریت‌ها
 * ------------------------------------------------------------------
 * • ثبت رویدادهای واقعی کاربر (دیدن، لایک، خرید، چت، استایل و...)
 * • پیشبرد خودکار ماموریت‌ها
 * • دادن سکه واقعی وقتی ماموریت کامل شد
 * • Toast اعلان به کاربر
 */

(function() {
  'use strict';
  if (window.ClubTrackerLoaded) return;
  window.ClubTrackerLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 💾 State
  // ═══════════════════════════════════════════════════════════════

  const STATE_KEY = 'dp-club-v2';
  const PROGRESS_KEY = 'dp-club-progress-v1';
  const LOG_KEY = 'dp-club-log-v1';

  function loadState() {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      coins: 50,                 // سکه‌های فعلی
      totalEarned: 50,           // مجموع سکه‌های دریافت‌شده
      missionsCompleted: 0,      // تعداد ماموریت‌های تکمیل‌شده
      rewardsClaimed: 0,         // تعداد جوایز گرفته‌شده
      streakDays: 1,             // روزهای متوالی فعالیت
      lastVisit: new Date().toDateString(),
      lastReset: {               // آخرین ریست ماموریت‌های روزانه/هفتگی
        daily: new Date().toDateString(),
        weekly: getWeekKey(),
      },
      completedMissions: [],     // لیست ماموریت‌های تکمیل‌شده
      claimedRewards: [],        // لیست جوایز گرفته‌شده
      unlockedRewards: [],       // جوایزی که باز شدن (کد تخفیف و...)
    };
  }

  function loadProgress() {
    try {
      const p = localStorage.getItem(PROGRESS_KEY);
      if (p) return JSON.parse(p);
    } catch (e) {}
    return {};
  }

  function loadLog() {
    try {
      const l = localStorage.getItem(LOG_KEY);
      if (l) return JSON.parse(l);
    } catch (e) {}
    return [];
  }

  let state = loadState();
  let progress = loadProgress();
  let log = loadLog();

  // ═══════════════════════════════════════════════════════════════
  // 🗓️ توابع کمکی زمان
  // ═══════════════════════════════════════════════════════════════

  function getWeekKey() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  }

  function todayKey() {
    return new Date().toDateString();
  }

  function checkReset() {
    const today = todayKey();
    const week = getWeekKey();

    // ریست روزانه
    if (state.lastReset.daily !== today) {
      // پاک کردن ماموریت‌های daily تکمیل‌نشده
      delete progress.m1; delete progress.m2; delete progress.m3; delete progress.m4;
      state.lastReset.daily = today;
    }

    // ریست هفتگی
    if (state.lastReset.weekly !== week) {
      delete progress.m5; delete progress.m6; delete progress.m7;
      state.lastReset.weekly = week;
      saveState();
    }

    // streak (روزهای متوالی)
    if (state.lastVisit !== today) {
      const last = new Date(state.lastVisit);
      const now = new Date(today);
      const diff = Math.floor((now - last) / 86400000);
      if (diff === 1) {
        state.streakDays += 1;
        // جایزه streak
        if (state.streakDays % 7 === 0) {
          addCoins(100, '۷ روز فعالیت متوالی');
        }
      } else if (diff > 1) {
        state.streakDays = 1;
      }
      state.lastVisit = today;
      saveState();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 💾 ذخیره
  // ═══════════════════════════════════════════════════════════════

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function saveProgress() {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) {}
  }
  function saveLog() {
    try {
      // فقط ۱۰۰ رویداد آخر نگه داشته بشه
      if (log.length > 100) log = log.slice(-100);
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 ماموریت‌ها (همون club.js)
  // ═══════════════════════════════════════════════════════════════

  const MISSIONS = {
    m1:  { type: 'daily',  target: 5,   reward: 20,  title: '۵ محصول ببین',     desc: '۵ محصول مختلف رو ببین' },
    m2:  { type: 'daily',  target: 3,   reward: 30,  title: '۳ محصول لایک کن', desc: '۳ محصول به علاقه‌مندی‌ها' },
    m3:  { type: 'daily',  target: 1,   reward: 50,  title: 'یه محصول بخر',     desc: 'یه محصول به سبد خرید' },
    m4:  { type: 'daily',  target: 1,   reward: 15,  title: 'با AI چت کن',     desc: 'یه پیام به دیجی AI' },
    m5:  { type: 'weekly', target: 3,   reward: 100, title: '۳ نظر بنویس',      desc: 'برای ۳ محصول' },
    m6:  { type: 'weekly', target: 5,   reward: 150, title: '۵ استایل بساز',   desc: '۵ استایل با AI' },
    m7:  { type: 'weekly', target: 2,   reward: 1000,title: '۲ دوست دعوت کن',   desc: 'دعوت موفق' },
    m8:  { type: 'once',   target: 1,   reward: 200, title: 'تاریخ تولدت',      desc: 'کادوی تولد' },
    m9:  { type: 'once',   target: 1,   reward: 300, title: 'اپلیکیشن',        desc: 'دانلود اپ' },
    m10: { type: 'once',   target: 1,   reward: 500, title: 'اولین خرید',      desc: 'اولین سفارش' },
  };

  // ═══════════════════════════════════════════════════════════════
  // 💰 عملیات سکه
  // ═══════════════════════════════════════════════════════════════

  function addCoins(amount, reason) {
    state.coins += amount;
    state.totalEarned += amount;
    saveState();
    notifyChange({ type: 'coins', amount, reason, total: state.coins });
  }

  function spendCoins(amount, reason) {
    if (state.coins < amount) {
      return { ok: false, error: 'سکه کافی نداری' };
    }
    state.coins -= amount;
    saveState();
    notifyChange({ type: 'spend', amount, reason, total: state.coins });
    return { ok: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 ثبت رویداد ماموریت
  // ═══════════════════════════════════════════════════════════════

  /**
   * ثبت یک رویداد برای پیشبرد ماموریت
   * @param {string} missionId - شناسه ماموریت (m1, m2, ...)
   * @param {number} amount - مقدار پیشرفت (پیش‌فرض ۱)
   * @param {object} meta - اطلاعات اضافی (برای لاگ)
   */
  function track(missionId, amount, meta) {
    checkReset();
    amount = amount || 1;

    const mission = MISSIONS[missionId];
    if (!mission) return;

    // اگه قبلاً کامل شده، کاری نکن
    if (state.completedMissions.includes(missionId)) return;

    // پیشبرد
    const current = progress[missionId] || 0;
    const next = Math.min(current + amount, mission.target);
    progress[missionId] = next;
    saveProgress();

    // لاگ
    log.push({
      time: Date.now(),
      mission: missionId,
      delta: amount,
      from: current,
      to: next,
      meta: meta || null,
    });
    saveLog();

    // اعلان به UI
    notifyChange({ type: 'progress', missionId, current: next, target: mission.target });

    // اگه کامل شد، جایزه بده
    if (next >= mission.target) {
      completeMission(missionId);
    }
  }

  function completeMission(missionId) {
    const mission = MISSIONS[missionId];
    if (!mission) return;
    if (state.completedMissions.includes(missionId)) return;

    state.completedMissions.push(missionId);
    state.missionsCompleted += 1;
    addCoins(mission.reward, 'تکمیل ماموریت: ' + mission.title);
    saveState();

    // اعلان ویژه
    showMissionDone(mission);
    notifyChange({ type: 'complete', missionId, reward: mission.reward });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎁 گرفتن جایزه
  // ═══════════════════════════════════════════════════════════════

  const REWARDS = {
    r1: { cost: 100,  title: 'تخفیف ۱۰٪',     code: 'GOLD10' },
    r2: { cost: 200,  title: 'تخفیف ۲۰٪',     code: 'GOLD20' },
    r3: { cost: 350,  title: 'تخفیف ۳۰٪',     code: 'GOLD30' },
    r4: { cost: 150,  title: 'ارسال رایگان',   code: 'FREESHIP' },
    r5: { cost: 80,   title: 'بسته‌بندی هدیه', code: 'GIFTWRAP' },
    r6: { cost: 300,  title: 'استایل با AI',   code: 'STYLE-AI' },
    r7: { cost: 250,  title: 'کادو به دوست',   code: 'GIFT-FRIEND' },
    r8: { cost: 1000, title: 'VIP یک ماه',     code: 'VIP-MONTH' },
    r9: { cost: 500,  title: 'باکس ویژه',     code: 'BOX-SPECIAL' },
  };

  function claimReward(rewardId) {
    const r = REWARDS[rewardId];
    if (!r) return { ok: false, error: 'جایزه ناشناس' };

    if (state.claimedRewards.includes(rewardId)) {
      return { ok: false, error: 'این جایزه قبلاً گرفته شده' };
    }

    const result = spendCoins(r.cost, r.title);
    if (!result.ok) return result;

    state.claimedRewards.push(rewardId);
    state.rewardsClaimed += 1;
    state.unlockedRewards.push({
      id: rewardId,
      code: r.code,
      title: r.title,
      at: Date.now(),
    });
    saveState();

    notifyChange({ type: 'reward', rewardId, code: r.code, title: r.title });
    return { ok: true, code: r.code, title: r.title };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔔 UI: اعلان
  // ═══════════════════════════════════════════════════════════════

  function showMissionDone(mission) {
    const div = document.createElement('div');
    div.className = 'club-mission-toast';
    div.innerHTML = `
      <div class="club-mission-toast-icon">🎉</div>
      <div class="club-mission-toast-body">
        <strong>ماموریت تکمیل شد!</strong>
        <span>${mission.title} — +${mission.reward} سکه</span>
      </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 50);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 400);
    }, 4000);
  }

  function notifyChange(detail) {
    // رویداد عمومی برای UI
    document.dispatchEvent(new CustomEvent('dp-club-change', { detail }));
    // toast ساده
    if (detail.type === 'complete') {
      // خودش toast اختصاصی داره
    } else if (detail.type === 'reward') {
      // toast مخصوص جایزه
    } else if (detail.type === 'spend') {
      showToast('🛒 ' + detail.amount + ' سکه خرج شد', 'info');
    }
  }

  function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    const tx = document.getElementById('toastText');
    if (tx) tx.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 API عمومی
  // ═══════════════════════════════════════════════════════════════

  window.ClubTracker = {
    // ماموریت
    track,
    completeMission,

    // سکه
    addCoins,
    spendCoins,

    // جایزه
    claimReward,

    // state
    getState: () => state,
    getProgress: () => progress,
    getLog: () => log,
    getMissions: () => MISSIONS,
    getRewards: () => REWARDS,

    // ابزار
    reset: function() {
      localStorage.removeItem(STATE_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(LOG_KEY);
      location.reload();
    },
    isCompleted: (id) => state.completedMissions.includes(id),
    isClaimed: (id) => state.claimedRewards.includes(id),
  };

  // چک اولیه
  checkReset();

})();
