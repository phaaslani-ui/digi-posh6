/**
 * 🪞 dp-personality-ui.js v1.0 — نمایش تیپ شخصیتی
 * ------------------------------------------------------------------
 * • رندر UI برای بخش personality در پروفایل
 * • نمایش آرکی‌تایپ‌ها، Big Five، آمار رفتاری
 * • تولید توصیف شخصیتی واقع‌بینانه
 */

(function() {
  'use strict';
  if (window.DPPersonalityUILoaded) return;
  window.DPPersonalityUILoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 رندر اصلی
  // ═══════════════════════════════════════════════════════════════
  function renderMainCard() {
    const container = document.getElementById('personalityMainCard');
    if (!container) return;

    const taste = window.DPTasteProfile?.load?.();
    const desc = window.DPBehavior?.getPersonalityDescription?.(taste);

    if (!desc || !taste) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:56px;margin-bottom:16px;opacity:0.5">🪞</div>
          <h3 style="font-size:18px;margin-bottom:8px">ابتدا سلیقه‌ات رو ثبت کن</h3>
          <p style="color:var(--text-soft);margin-bottom:16px">تا بتونیم تیپ شخصیتیت رو تحلیل کنیم</p>
          <button class="prof-btn" onclick="document.querySelector('[data-section=taste]').click()">✨ ثبت سلیقه</button>
        </div>
      `;
      return;
    }

    const top = window.DPBehavior.getTopArchetypes(taste, 1)[0];
    if (!top) {
      container.innerHTML = `<div style="padding:30px;text-align:center">در حال تحلیل...</div>`;
      return;
    }

    container.innerHTML = `
      <div class="prof-personality-hero">
        <div class="prof-personality-emoji">${top.emoji}</div>
        <div class="prof-personality-info">
          <div class="prof-personality-archetype">${top.name}</div>
          <div class="prof-personality-archetype-en">${top.nameEn}</div>
          <p class="prof-personality-short">${desc.short}</p>
        </div>
      </div>
      <div class="prof-personality-detail">
        <p>${desc.long}</p>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎭 رندر آرکی‌تایپ‌ها
  // ═══════════════════════════════════════════════════════════════
  function renderArchetypes() {
    const container = document.getElementById('archetypesGrid');
    if (!container) return;

    const taste = window.DPTasteProfile?.load?.();
    if (!taste) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-soft)">سلیقه‌ای ثبت نشده</div>';
      return;
    }

    const tops = window.DPBehavior.getTopArchetypes(taste, 3);
    const maxScore = Math.max(...tops.map(a => a.score), 1);

    container.innerHTML = tops.map((arch, idx) => {
      const percent = Math.round((arch.score / 100) * 100);
      const colors = ['#d4af37', '#8b5cf6', '#ec4899'];
      const color = colors[idx];
      return `
        <div class="prof-archetype-card" style="--accent:${color}">
          <div class="prof-archetype-rank">${idx + 1}</div>
          <div class="prof-archetype-emoji">${arch.emoji}</div>
          <div class="prof-archetype-name">${arch.name}</div>
          <div class="prof-archetype-name-en">${arch.nameEn}</div>
          <div class="prof-archetype-bar">
            <div class="prof-archetype-bar-fill" style="width:${percent}%;background:${color}"></div>
          </div>
          <div class="prof-archetype-score">${percent}٪ تطابق</div>
          <p class="prof-archetype-traits">${arch.traits}</p>
        </div>
      `;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 رندر نمودار Big Five
  // ═══════════════════════════════════════════════════════════════
  function renderBigFive() {
    const container = document.getElementById('bigFiveChart');
    if (!container) return;

    const bf = window.DPBehavior?.getBigFive?.() || {
      openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50
    };

    const traits = [
      { key: 'openness', label: 'گشودگی', emoji: '🌈', desc: 'تجربه‌های جدید، خلاقیت، کنجکاوی', low: 'سنتی', high: 'مبتکر' },
      { key: 'conscientiousness', label: 'وظیفه‌شناسی', emoji: '📋', desc: 'نظم، دقت، مسئولیت‌پذیری', low: 'خودجوش', high: 'منظم' },
      { key: 'extraversion', label: 'برون‌گرایی', emoji: '🎉', desc: 'اجتماعی بودن، انرژی، پرحرفی', low: 'درون‌گرا', high: 'برون‌گرا' },
      { key: 'agreeableness', label: 'توافق‌پذیری', emoji: '🤝', desc: 'همدلی، مهربانی، همکاری', low: 'مستقل', high: 'مهربان' },
      { key: 'neuroticism', label: 'حساسیت', emoji: '🎭', desc: 'استرس، نگرانی، تغییر خلق', low: 'آرام', high: 'حساس' },
    ];

    container.innerHTML = traits.map(t => {
      const value = Math.round(bf[t.key] || 50);
      const pos = value; // 0-100
      return `
        <div class="prof-bigfive-row">
          <div class="prof-bigfive-head">
            <span class="prof-bigfive-emoji">${t.emoji}</span>
            <span class="prof-bigfive-label">${t.label}</span>
            <span class="prof-bigfive-value">${value}٪</span>
          </div>
          <div class="prof-bigfive-desc">${t.desc}</div>
          <div class="prof-bigfive-bar">
            <div class="prof-bigfive-bar-track">
              <div class="prof-bigfive-bar-fill" style="width:${value}%"></div>
              <div class="prof-bigfive-bar-pointer" style="left:${value}%"></div>
            </div>
            <div class="prof-bigfive-bar-labels">
              <span>${t.low}</span>
              <span>${t.high}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 رندر آمار رفتاری
  // ═══════════════════════════════════════════════════════════════
  function renderBehaviorStats() {
    const container = document.getElementById('behaviorStats');
    if (!container) return;

    const report = window.DPBehavior.getReport();

    // نوار زمانی
    const time = report.timeDistribution;
    const timeHtml = `
      <div class="prof-time-chart">
        <div class="prof-time-label">⏰ زمان‌های فعالیت</div>
        <div class="prof-time-bars">
          <div class="prof-time-bar">
            <div class="prof-time-bar-fill" style="height:${time.morning}%"></div>
            <div class="prof-time-bar-label">صبح</div>
            <div class="prof-time-bar-value">${time.morning}٪</div>
          </div>
          <div class="prof-time-bar">
            <div class="prof-time-bar-fill" style="height:${time.afternoon}%"></div>
            <div class="prof-time-bar-label">ظهر</div>
            <div class="prof-time-bar-value">${time.afternoon}٪</div>
          </div>
          <div class="prof-time-bar">
            <div class="prof-time-bar-fill" style="height:${time.evening}%"></div>
            <div class="prof-time-bar-label">عصر</div>
            <div class="prof-time-bar-value">${time.evening}٪</div>
          </div>
          <div class="prof-time-bar">
            <div class="prof-time-bar-fill" style="height:${time.night}%"></div>
            <div class="prof-time-bar-label">شب</div>
            <div class="prof-time-bar-value">${time.night}٪</div>
          </div>
        </div>
      </div>
    `;

    // Top categories
    const topCatsHtml = report.topCategories.length > 0 ? `
      <div class="prof-mini-chart">
        <div class="prof-mini-chart-label">📂 محبوب‌ترین دسته‌ها</div>
        ${report.topCategories.map(c => {
          const max = report.topCategories[0]?.count || 1;
          const pct = Math.round((c.count / max) * 100);
          return `
            <div class="prof-mini-row">
              <div class="prof-mini-name">${c.category}</div>
              <div class="prof-mini-bar"><div class="prof-mini-bar-fill" style="width:${pct}%"></div></div>
              <div class="prof-mini-count">${c.count}</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    // Top colors
    const topColorsHtml = report.topColors.length > 0 ? `
      <div class="prof-mini-chart">
        <div class="prof-mini-chart-label">🎨 رنگ‌های پرطرفدار</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${report.topColors.map(c => `
            <div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-soft);border-radius:999px;font-size:12px">
              <span style="width:14px;height:14px;border-radius:50%;background:${getColorHex(c.color)}"></span>
              <span>${c.color}</span>
              <span style="color:var(--text-soft)">(${c.count})</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // خلاصه آمار
    const summaryHtml = `
      <div class="prof-stats-mini" style="margin-bottom:16px">
        <div class="prof-stat-mini-card">
          <span class="prof-stat-mini-icon">👁️</span>
          <div class="prof-stat-mini-num">${report.totalProductsViewed}</div>
          <div class="prof-stat-mini-lbl">محصول دیده شده</div>
        </div>
        <div class="prof-stat-mini-card">
          <span class="prof-stat-mini-icon">❤️</span>
          <div class="prof-stat-mini-num">${report.totalFavorites}</div>
          <div class="prof-stat-mini-lbl">علاقه‌مندی</div>
        </div>
        <div class="prof-stat-mini-card">
          <span class="prof-stat-mini-icon">🛒</span>
          <div class="prof-stat-mini-num">${report.totalCartAdds}</div>
          <div class="prof-stat-mini-lbl">سبد خرید</div>
        </div>
        <div class="prof-stat-mini-card">
          <span class="prof-stat-mini-icon">🔍</span>
          <div class="prof-stat-mini-num">${report.totalSearches}</div>
          <div class="prof-stat-mini-lbl">جستجو</div>
        </div>
      </div>
    `;

    container.innerHTML = summaryHtml + timeHtml + topCatsHtml + topColorsHtml;
  }

  function getColorHex(colorName) {
    const map = {
      'black': '#1f2937', 'مشکی': '#1f2937',
      'white': '#f9fafb', 'سفید': '#f9fafb',
      'gold': '#d4af37', 'طلایی': '#d4af37',
      'cream': '#fef3c7', 'کرم': '#fef3c7',
      'red': '#ef4444', 'قرمز': '#ef4444',
      'pink': '#ec4899', 'صورتی': '#ec4899',
      'blue': '#3b82f6', 'آبی': '#3b82f6',
      'navy': '#1e3a8a', 'سرمه‌ای': '#1e3a8a',
      'green': '#10b981', 'سبز': '#10b981',
      'brown': '#92400e', 'قهوه‌ای': '#92400e',
      'gray': '#6b7280', 'طوسی': '#6b7280',
      'purple': '#a855f7', 'بنفش': '#a855f7',
      'coral': '#ff7f50', 'مرجانی': '#ff7f50',
      'olive': '#808000', 'زیتونی': '#808000',
      'teal': '#008080', 'فیروزه‌ای': '#008080',
    };
    return map[(colorName || '').toLowerCase()] || '#9ca3af';
  }

  // ═══════════════════════════════════════════════════════════════
  // 💡 رندر بینش‌ها
  // ═══════════════════════════════════════════════════════════════
  function renderInsights() {
    const container = document.getElementById('personalityInsights');
    if (!container) return;

    const taste = window.DPTasteProfile?.load?.();
    const report = window.DPBehavior.getReport();
    const insights = [];

    if (!taste) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-soft)">سلیقه‌ای ثبت نشده</div>';
      return;
    }

    // بینش ۱: الگوی زمانی
    if (report.timeDistribution) {
      const t = report.timeDistribution;
      const maxTime = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
      const timeMap = { morning: 'صبح', afternoon: 'ظهر', evening: 'عصر', night: 'شب' };
      insights.push({
        icon: '⏰',
        title: 'الگوی زمانی شما',
        text: `بیشترین فعالیت شما در ${timeMap[maxTime[0]]} هست (${maxTime[1]}٪). ${maxTime[0] === 'morning' || maxTime[0] === 'afternoon' ? 'شما یه فرد روزفعال هستید.' : 'شما در نیمه‌های شب فعال‌ترید.'}`
      });
    }

    // بینش ۲: محبوب‌ترین رنگ
    if (report.topColors.length > 0) {
      const top = report.topColors[0];
      const colorMeanings = {
        'black': 'مشکی = قدرت، ظرافت، اعتماد به نفس',
        'white': 'سفید = پاکی، سادگی، مینیمالیسم',
        'gold': 'طلایی = لوکس، شکوه، موفقیت',
        'red': 'قرمز = انرژی، جسارت، توجه',
        'pink': 'صورتی = رمانتیک، نرم، زنانه',
        'blue': 'آبی = آرامش، اعتماد، وفاداری',
        'navy': 'سرمه‌ای = حرفه‌ای، قابل اعتماد، کلاسیک',
        'green': 'سبز = طبیعت، تعادل، هماهنگی',
        'brown': 'قهوه‌ای = زمینی، قابل اعتماد، گرم',
        'gray': 'طوسی = خنثی، مدرن، مینیمال',
      };
      insights.push({
        icon: '🎨',
        title: 'رنگ مورد علاقه شما',
        text: `رنگ ${top.color} بیشترین بازدید رو داشته. ${colorMeanings[top.color.toLowerCase()] || 'این رنگ نشان‌دهنده سلیقه خاص شماست.'}`
      });
    }

    // بینش ۳: مقایسه
    if (report.totalFavorites > 0 && report.totalProductsViewed > 0) {
      const ratio = Math.round((report.totalFavorites / report.totalProductsViewed) * 100);
      let text = '';
      if (ratio < 5) text = 'شما اهل مقایسه و بررسی هستید. قبل از علاقه‌مندی، حسابی فکر می‌کنید.';
      else if (ratio < 15) text = 'شما متعادل عمل می‌کنید. نه زیاد سخت‌گیر، نه زیاد ساده.';
      else text = 'شما سریع تصمیم می‌گیرید و به چیزی که دوست دارید، راحت علاقه‌مند می‌شوید.';
      insights.push({
        icon: '❤️',
        title: 'سبک تصمیم‌گیری',
        text: `از هر ${Math.round(100 / Math.max(ratio, 1))} محصول، ${ratio}٪ رو ذخیره می‌کنید. ${text}`
      });
    }

    // بینش ۴: خرید در مقابل بازدید
    if (report.totalPurchases > 0) {
      insights.push({
        icon: '🛍️',
        title: 'قدرت خرید',
        text: `${report.totalPurchases} خرید موفق داشتی. این نشون‌دهنده قاطعیت تو در تصمیم‌گیریه.`
      });
    } else if (report.totalCartAdds > 0) {
      insights.push({
        icon: '💭',
        title: 'تفکر در خرید',
        text: `${report.totalCartAdds} محصول به سبدت اضافه کردی ولی هنوز خرید نکردی. شما اهل تحقیق و مقایسه‌ای.`
      });
    }

    // بینش ۵: میزان فعالیت
    if (report.totalEvents > 50) {
      insights.push({
        icon: '🚀',
        title: 'کاربر فعال',
        text: `${report.totalEvents} رویداد از شما ثبت شده. شما یه کاربر فعال و درگیر هستید.`
      });
    } else if (report.totalEvents > 10) {
      insights.push({
        icon: '🌱',
        title: 'شروع خوب',
        text: `تازه ${report.totalEvents} رویداد ثبت شده. هر چی بیشتر کاوش کنی، تحلیل بهتری ازت می‌تونیم بدیم.`
      });
    }

    // رندر
    container.innerHTML = insights.map(ins => `
      <div class="prof-insight">
        <div class="prof-insight-icon">${ins.icon}</div>
        <div class="prof-insight-content">
          <div class="prof-insight-title">${ins.title}</div>
          <div class="prof-insight-text">${ins.text}</div>
        </div>
      </div>
    `).join('') || '<div style="padding:20px;text-align:center;color:var(--text-soft)">هنوز اطلاعات کافی جمع نشده</div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function render() {
    renderMainCard();
    renderArchetypes();
    renderBigFive();
    renderBehaviorStats();
    renderInsights();
  }

  function init() {
    const refreshBtn = document.getElementById('refreshPersonalityBtn');
    if (refreshBtn) refreshBtn.onclick = render;

    // وقتی تب personality باز شد
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-section="personality"]');
      if (btn) setTimeout(render, 100);
    });

    render();
  }

  window.DPPersonalityUI = {
    render: render,
    init: init,
  };

  console.log('🪞 DPPersonalityUI loaded');
})();
