/**
 * 🏅 medals-app.js — اپلیکیشن مدال‌ها و ماموریت‌ها
 */

(function() {
  'use strict';
  if (window.MedalsAppLoaded) return;
  window.MedalsAppLoaded = true;

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8001'
    : `${window.location.protocol}//${window.location.hostname}:8001`;

  // ════════════════════════════════════════════════════════════════
  // 🛠️ HELPERS
  // ════════════════════════════════════════════════════════════════

  function toFa(n) {
    if (n === null || n === undefined) return '۰';
    return String(n).replace(/[0-9]/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  }

  function fmtNumber(n) {
    if (!n && n !== 0) return '۰';
    return toFa(n.toLocaleString('en-US'));
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
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId') || localStorage.getItem('dp_user_id') || 'u001';
  }

  const rarityLabels = {
    legendary: 'Legendary',
    epic: 'Epic',
    rare: 'Rare',
    common: 'Common'
  };

  const rarityEmojis = {
    legendary: '🥇',
    epic: '💎',
    rare: '🥈',
    common: '🥉'
  };

  const missionTypeLabels = {
    level: '⭐ سطحی',
    seasonal: '🌸 فصلی',
    expertise: '👗 تخصصی',
    social: '👥 اجتماعی',
    special: '🎁 ویژه'
  };

  // ════════════════════════════════════════════════════════════════
  // 📊 RENDERERS
  // ════════════════════════════════════════════════════════════════

  let allMedals = [];
  let allMissions = [];

  function renderHeroStats(medalsData, missionsData) {
    document.getElementById('totalMedals').textContent = fmtNumber(medalsData.total);
    document.getElementById('earnedMedals').textContent = fmtNumber(medalsData.earned);
    document.getElementById('completedMissions').textContent = fmtNumber(missionsData.completed) + ' / ' + fmtNumber(missionsData.total);
    document.getElementById('completionPercent').textContent = toFa(missionsData.completionPercent) + '٪';
  }

  function renderMedalCard(medal) {
    const isEarned = medal.isEarned;
    const isLocked = !isEarned;
    return `
      <div class="medal-card ${isEarned ? 'is-earned' : 'is-locked'}" data-rarity="${medal.rarity}" data-status="${isEarned ? 'earned' : 'locked'}" style="--medal-color: ${medal.color}">
        ${isEarned ? '<div class="medal-earned-badge">✓</div>' : '<div class="medal-locked-icon">🔒</div>'}
        <div class="medal-icon">${medal.icon}</div>
        <h3 class="medal-name">${medal.name}</h3>
        <p class="medal-desc">${medal.description}</p>
        <span class="medal-rarity ${medal.rarity}">${rarityEmojis[medal.rarity]} ${rarityLabels[medal.rarity]}</span>
      </div>
    `;
  }

  function renderMedalsByRarity(medalsData, filter = 'all') {
    const container = document.getElementById('medalsByRarity');
    if (!container) return;

    let sections = [];

    // فیلتر بر اساس rarity
    if (filter === 'all' || ['legendary', 'epic', 'rare', 'common'].includes(filter)) {
      const order = ['legendary', 'epic', 'rare', 'common'];
      for (const rarity of order) {
        const medals = medalsData.byRarity[rarity] || [];
        if (medals.length === 0) continue;

        const earnedCount = medals.filter(m => m.isEarned).length;

        sections.push(`
          <div class="medals-section">
            <div class="medals-section-header ${rarity}">
              <h2 class="medals-section-title">${rarityEmojis[rarity]} مدال‌های ${rarityLabels[rarity]}</h2>
              <span class="medals-section-count">${toFa(earnedCount)} از ${toFa(medals.length)}</span>
            </div>
            <div class="medals-grid">
              ${medals.map(renderMedalCard).join('')}
            </div>
          </div>
        `);
      }
    } else if (filter === 'earned') {
      const earned = medalsData.medals.filter(m => m.isEarned);
      if (earned.length === 0) {
        sections.push('<div class="medals-empty"><div class="medals-empty-icon">🏅</div><p>هنوز مدالی کسب نکرده‌اید</p></div>');
      } else {
        sections.push(`
          <div class="medals-section">
            <div class="medals-section-header">
              <h2 class="medals-section-title">✅ مدال‌های کسب شده</h2>
              <span class="medals-section-count">${toFa(earned.length)} عدد</span>
            </div>
            <div class="medals-grid">
              ${earned.map(renderMedalCard).join('')}
            </div>
          </div>
        `);
      }
    } else if (filter === 'locked') {
      const locked = medalsData.medals.filter(m => !m.isEarned);
      if (locked.length === 0) {
        sections.push('<div class="medals-empty"><div class="medals-empty-icon">🎉</div><p>تبریک! همه مدال‌ها رو کسب کردید!</p></div>');
      } else {
        sections.push(`
          <div class="medals-section">
            <div class="medals-section-header">
              <h2 class="medals-section-title">🔒 مدال‌های قفل‌شده</h2>
              <span class="medals-section-count">${toFa(locked.length)} عدد</span>
            </div>
            <div class="medals-grid">
              ${locked.map(renderMedalCard).join('')}
            </div>
          </div>
        `);
      }
    }

    container.innerHTML = sections.join('') || '<div class="medals-loading">چیزی برای نمایش نیست</div>';
  }

  function renderMissionCard(mission) {
    const isCompleted = mission.isCompleted;
    const target = mission.target_count;
    const progress = Math.min(mission.currentProgress || 0, target);
    const percent = Math.min(100, Math.round((progress / max(1, target)) * 100));

    const medal = mission.medal;
    const medalReward = medal ? `
      <div class="mission-reward-medal">
        <span class="mission-reward-medal-icon">${medal.icon}</span>
        <span class="mission-reward-medal-name">${medal.name}</span>
      </div>
    ` : '<div></div>';

    return `
      <div class="mission-card ${isCompleted ? 'is-completed' : ''}" data-type="${mission.mission_type}">
        <div class="mission-head">
          <div class="mission-icon">${mission.icon}</div>
          <div class="mission-info">
            <h3 class="mission-title">${mission.title}</h3>
            <span class="mission-type">${missionTypeLabels[mission.mission_type] || mission.mission_type}</span>
          </div>
        </div>
        <p class="mission-desc">${mission.description}</p>
        <div class="mission-progress-row">
          <span>پیشرفت</span>
          <strong>${fmtNumber(progress)} / ${fmtNumber(target)}</strong>
        </div>
        <div class="mission-progress-bar">
          <div class="mission-progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="mission-reward">
          <span class="mission-reward-points">🎁 +${fmtNumber(mission.reward_points)} امتیاز</span>
          ${medalReward}
        </div>
      </div>
    `;
  }

  function renderMissions(missionsData, filter = 'all') {
    const grid = document.getElementById('missionsGrid');
    if (!grid) return;

    let missions = missionsData.missions;
    if (filter !== 'all') {
      missions = missionsData.byType[filter] || [];
    }

    if (missions.length === 0) {
      grid.innerHTML = '<div class="medals-empty"><div class="medals-empty-icon">🎯</div><p>ماموریتی در این دسته نیست</p></div>';
      return;
    }

    // اولویت: ناتمام، سپس تکمیل شده
    missions.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return a.sort_order - b.sort_order;
    });

    grid.innerHTML = missions.map(renderMissionCard).join('');
  }

  // ════════════════════════════════════════════════════════════════
  // 🎬 EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════

  function setupTabs() {
    document.querySelectorAll('.medals-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.medals-tab').forEach(t => t.classList.remove('is-on'));
        tab.classList.add('is-on');
        document.querySelectorAll('.medals-panel').forEach(p => p.classList.remove('is-active'));
        document.querySelector(`.medals-panel[data-panel="${target}"]`).classList.add('is-active');
      });
    });
  }

  function setupMedalFilters(medalsData) {
    document.querySelectorAll('.medals-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.medals-filter').forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
        const filter = btn.dataset.rarity || btn.dataset.status || 'all';
        renderMedalsByRarity(medalsData, filter);
      });
    });
  }

  function setupMissionFilters(missionsData) {
    document.querySelectorAll('.missions-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.missions-filter').forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
        const type = btn.dataset.type || 'all';
        renderMissions(missionsData, type);
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // 🚀 BOOTSTRAP
  // ════════════════════════════════════════════════════════════════

  async function init() {
    const userId = getUserId();
    console.log('[Medals App] Loading for', userId);

    const medalsData = await api(`/api/club/medals?userId=${userId}`);
    const missionsData = await api(`/api/club/missions?userId=${userId}`);

    if (!medalsData || !missionsData) {
      document.getElementById('medalsByRarity').innerHTML = '<div class="medals-empty"><div class="medals-empty-icon">⚠️</div><p>خطا در بارگذاری داده‌ها</p></div>';
      return;
    }

    allMedals = medalsData;
    allMissions = missionsData;

    renderHeroStats(medalsData, missionsData);
    renderMedalsByRarity(medalsData);
    renderMissions(missionsData);

    setupTabs();
    setupMedalFilters(medalsData);
    setupMissionFilters(missionsData);

    console.log('[Medals App] ✅ Loaded', medalsData.total, 'medals,', missionsData.total, 'missions');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
