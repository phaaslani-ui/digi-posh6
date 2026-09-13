/**
 * دیجی‌پوش — سیستم پروفایل هوشمند
 * شامل: اطلاعات شخصی، اندازه‌ها، رنگ پوست، فرم بدن، سلیقه، یادگیری
 */

(function(){
  'use strict';
  if(window.DPProfile) return;
  window.DPProfile = {};

  const STORAGE = {
    PROFILES: 'dp_user_profiles',
    HISTORY: 'dp_user_history',
    FAVORITES: 'dp_user_favorites',
    WARDROBE: 'dp_user_wardrobe',
    QUIZ: 'dp_user_quiz',
    REPORTS: 'dp_style_reports'
  };

  // دریافت پروفایل کاربر
  DPProfile.get = function(userId){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.PROFILES) || '{}');
      return all[userId] || null;
    } catch(e){
      return null;
    }
  };

  // ذخیره پروفایل
  DPProfile.save = function(userId, data){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.PROFILES) || '{}');
      all[userId] = {
        ...all[userId],
        ...data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE.PROFILES, JSON.stringify(all));
      return all[userId];
    } catch(e){
      console.error('Profile save error:', e);
      return null;
    }
  };

  // محاسبه درصد تکمیل پروفایل
  DPProfile.progress = function(userId){
    const p = DPProfile.get(userId);
    if(!p) return 0;
    let score = 0;
    if(p.name) score += 10;
    if(p.phone) score += 5;
    if(p.avatar) score += 5;
    if(p.measurements && Object.keys(p.measurements).length >= 3) score += 25;
    if(p.skinTone) score += 15;
    if(p.bodyType) score += 15;
    if(p.preferredStyles && p.preferredStyles.length) score += 10;
    if(p.preferredColors && p.preferredColors.length) score += 5;
    if(p.budget) score += 5;
    if(p.quizAnswers) score += 5;
    return Math.min(100, score);
  };

  // ذخیره بازدید / تعامل
  DPProfile.track = function(userId, productId, action){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || '{}');
      if(!all[userId]) all[userId] = [];
      all[userId].push({
        productId,
        action,
        ts: Date.now()
      });
      // نگه‌داشتن آخرین ۲۰۰ تعامل
      all[userId] = all[userId].slice(-200);
      localStorage.setItem(STORAGE.HISTORY, JSON.stringify(all));
    } catch(e){}
  };

  // دریافت تاریخچه
  DPProfile.history = function(userId){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || '{}');
      return all[userId] || [];
    } catch(e){
      return [];
    }
  };

  // علاقه‌مندی‌ها
  DPProfile.favorites = {
    get: function(userId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.FAVORITES) || '{}');
        return all[userId] || [];
      } catch(e){ return []; }
    },
    toggle: function(userId, productId){
      const all = JSON.parse(localStorage.getItem(STORAGE.FAVORITES) || '{}');
      if(!all[userId]) all[userId] = [];
      const idx = all[userId].indexOf(productId);
      if(idx === -1) all[userId].push(productId);
      else all[userId].splice(idx, 1);
      localStorage.setItem(STORAGE.FAVORITES, JSON.stringify(all));
      return all[userId];
    }
  };

  // کمد من
  DPProfile.wardrobe = {
    get: function(userId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.WARDROBE) || '{}');
        return all[userId] || [];
      } catch(e){ return []; }
    },
    save: function(userId, outfit){
      const all = JSON.parse(localStorage.getItem(STORAGE.WARDROBE) || '{}');
      if(!all[userId]) all[userId] = [];
      all[userId].push({
        ...outfit,
        id: 'o_' + Date.now(),
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE.WARDROBE, JSON.stringify(all));
      return all[userId];
    },
    remove: function(userId, outfitId){
      const all = JSON.parse(localStorage.getItem(STORAGE.WARDROBE) || '{}');
      if(!all[userId]) return;
      all[userId] = all[userId].filter(o => o.id !== outfitId);
      localStorage.setItem(STORAGE.WARDROBE, JSON.stringify(all));
    }
  };

  // ذخیره پاسخ کوییز
  DPProfile.saveQuiz = function(userId, answers){
    const all = JSON.parse(localStorage.getItem(STORAGE.QUIZ) || '{}');
    all[userId] = {answers, ts: Date.now()};
    localStorage.setItem(STORAGE.QUIZ, JSON.stringify(all));
  };

  // موتور پیشنهاد - بر اساس پروفایل
  // اگر DPProducts لود شده، از اون استفاده کن
  DPProfile.recommend = function(userId, products){
    if(window.DPProducts && window.DPProducts.recommend){
      const profile = DPProfile.get(userId);
      const history = DPProfile.history(userId);
      return window.DPProducts.recommend(profile, history, 8);
    }
    // Fallback به نسخه ساده
    const profile = DPProfile.get(userId);
    if(!profile) return [];

    const colors = profile.preferredColors || [];
    const styles = profile.preferredStyles || [];
    const occasions = profile.preferredOccasions || [];
    const skinTone = profile.skinTone;
    const bodyType = profile.bodyType;
    const history = DPProfile.history(userId);

    return products.map(p => {
      let score = 0;
      let reasons = [];

      // تطبیق رنگ (۲۵٪)
      if(p.colors && colors.length){
        const match = p.colors.filter(c => colors.includes(c)).length;
        if(match > 0){
          score += 25 * (match / p.colors.length);
          reasons.push(`رنگ ${p.colors.find(c => colors.includes(c))} مطابق سلیقه شماست`);
        }
      }

      // تطبیق استایل (۲۵٪)
      if(p.styles && styles.length){
        const match = p.styles.filter(s => styles.includes(s)).length;
        if(match > 0){
          score += 25 * (match / p.styles.length);
          reasons.push(`استایل ${p.styles.find(s => styles.includes(s))} مورد پسند شماست`);
        }
      }

      // تطبیق رنگ پوست (۲۰٪)
      if(skinTone && p.colorHarmony && p.colorHarmony[skinTone]){
        score += 20 * p.colorHarmony[skinTone];
        if(p.colorHarmony[skinTone] > 0.7){
          reasons.push(`به رنگ پوست ${skinTone === 'warm' ? 'گرم' : skinTone === 'cool' ? 'سرد' : 'خنثی'} شما می‌آید`);
        }
      }

      // تطبیق فرم بدن (۱۵٪)
      if(bodyType && p.bodyTypeFit && p.bodyTypeFit[bodyType]){
        score += 15 * p.bodyTypeFit[bodyType];
        if(p.bodyTypeFit[bodyType] > 0.7){
          reasons.push(`برای فرم بدن ${bodyType === 'hourglass' ? 'ساعت‌شنی' : bodyType} شما مناسب است`);
        }
      }

      // ترند (۱۰٪)
      if(p.trendScore){
        score += 10 * p.trendScore;
        if(p.trendScore > 0.7) reasons.push('ترند فصل است');
      }

      // تطبیق موقعیت (۵٪)
      if(p.occasions && occasions.length){
        const match = p.occasions.filter(o => occasions.includes(o)).length;
        if(match > 0) score += 5 * (match / p.occasions.length);
      }

      // امتیاز بر اساس بازدیدهای قبلی (Bonus)
      const viewed = history.filter(h => h.productId === p.id && h.action === 'view').length;
      const liked = history.filter(h => h.productId === p.id && (h.action === 'like' || h.action === 'favorite')).length;
      if(liked > 0) score += 5;
      // کاهش امتیاز برای محصولات skip شده
      const skipped = history.filter(h => h.productId === p.id && h.action === 'skip').length;
      score -= skipped * 2;

      return {
        ...p,
        score: Math.max(0, Math.min(100, score)),
        matchPercent: Math.round(Math.max(0, Math.min(100, score))),
        reasons
      };
    }).sort((a, b) => b.score - a.score);
  };

  // گزارش سبک ماهانه
  DPProfile.monthlyReport = function(userId){
    const history = DPProfile.history(userId);
    const profile = DPProfile.get(userId);
    if(!profile) return null;

    const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = history.filter(h => h.ts > last30Days);

    // تحلیل ساده
    const colorCount = {};
    const styleCount = {};

    (profile.preferredColors || []).forEach(c => {
      colorCount[c] = (colorCount[c] || 0) + 1;
    });
    (profile.preferredStyles || []).forEach(s => {
      styleCount[s] = (styleCount[s] || 0) + 1;
    });

    const topColors = Object.entries(colorCount).sort((a,b) => b[1]-a[1]).slice(0,3);
    const topStyles = Object.entries(styleCount).sort((a,b) => b[1]-a[1]).slice(0,3);

    return {
      month: new Date().toLocaleDateString('fa-IR', {month: 'long', year: 'numeric'}),
      totalInteractions: recent.length,
      topColors: topColors.map(([c]) => c),
      topStyles: topStyles.map(([s]) => s),
      profileCompletion: DPProfile.progress(userId),
      skinTone: profile.skinTone,
      bodyType: profile.bodyType
    };
  };

  console.log('✅ DPProfile loaded');
})();
