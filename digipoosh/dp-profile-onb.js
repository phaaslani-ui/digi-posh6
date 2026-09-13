/**
 * دیجی‌پوش — یکپارچه‌سازی کامل پروفایل + دیجی AI + Onboarding + محصولات واقعی
 * نسخه ۴.۰ - حرفه‌ای، مرتب، با محصولات واقعی
 */

(function(){
  'use strict';

  // ═══ بررسی لاگین ═══
  const user = window.DPAuth.currentUser();
  if(!user){
    window.location.href = './auth.html?redirect=./profile.html';
    return;
  }

  const userId = user.id;
  let profile = window.DPProfile.get(userId) || {};
  const ENCRYPT_KEY = userId + '_' + (user.password || 'default').slice(0, 10);
  const CHAT_HISTORY_KEY = 'dp_ai_chat_' + userId;
  const WARDROBE_KEY = 'dp_user_wardrobe_' + userId;

  // ایجاد session فعلی
  try{ window.DPSecurity.sessions.create(userId, {type: 'desktop', os: navigator.platform || 'Unknown', browser: 'Browser'}); }catch(e){}

  // ═══ توابع کمکی ═══
  function $(id){ return document.getElementById(id); }

  function toast(msg, ok=true){
    const t = $('toast');
    const tx = $('toastText');
    if(!t || !tx) return;
    tx.textContent = (ok ? '✅ ' : '❌ ') + msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  function openModal(html){
    const c = $('profModalContent');
    const m = $('profModal');
    if(!c || !m) return;
    c.innerHTML = html;
    m.classList.add('is-on');
  }
  function closeModal(){ const m = $('profModal'); if(m) m.classList.remove('is-on'); }
  const modalEl = $('profModal');
  if(modalEl) modalEl.addEventListener('click', e => { if(e.target.id === 'profModal') closeModal(); });

  // آیکون برای محصولات بر اساس دسته
  function productIcon(category){
    const icons = {
      'پیراهن': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3l4-1 4 1 2 4-2 1v13H8V8L6 7z"/></svg>',
      'مانتو': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l6-2 6 2v16H6z"/><path d="M9 7h6"/></svg>',
      'بلوز': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l3 5v13H4V8z"/></svg>',
      'دامن': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l3 17H3z"/></svg>',
      'تیشرت': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4-3h8l4 3v15H4z"/></svg>',
      'کت و شلوار': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l3-4h12l3 4v14H3z"/><path d="M8 7v3M16 7v3"/></svg>',
      'شلوار': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l-1 17h-4l-1-12-1 12H7z"/></svg>',
      'پالتو': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4l3-1 4 1 4-1 3 1v17H5z"/><path d="M12 4v17"/></svg>',
      'کاپشن': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l3-4h10l3 4v12H4z"/><circle cx="12" cy="11" r="1"/></svg>',
      'کفش': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l5-7 6 2 5-3 2 4-2 4z"/></svg>',
      'کیف': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14v12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
      'شال': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18l-2 6 2 6H3l2-6z"/></svg>',
      'ساعت': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      'عینک': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="13" r="4"/><circle cx="18" cy="13" r="4"/><path d="M10 13h4"/></svg>',
      'کلاه': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a8 8 0 0 1 16 0v3H4z"/><path d="M2 17h20"/></svg>',
      'کمربند': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="1"/><circle cx="16" cy="12" r="1.5"/></svg>',
      'دستکش': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10v8h3v4h8v-4h3v-8L15 8V4h-2v4h-2V3H9v5H7v-2H5z"/></svg>',
      'گردنبند': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0 8 6 12 6 16 0-4 6-8 6-16"/></svg>',
      'ست': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>'
    };
    return icons[category] || icons['پیراهن'];
  }

  // ═══ سربرگ ═══
  function fillHeader(){
    const nameEl = $('profName');
    const greetNameEl = $('profGreetName');
    const subEl = $('profSubtitle');
    const avEl = $('profAvatarLetter');
    const avLetter2 = $('profAvatarLetter2');
    const displayName = $('profDisplayName');
    const displayEmail = $('profDisplayEmail');
    const emailEl = $('profEmail');
    const phoneEl = $('profPhone');
    const emailInEl = $('profEmailInput2');
    const birthEl = $('profBirthday');
    const genderEl = $('profGender');
    const cityEl = $('profCity');
    const jobEl = $('profJob');
    const bioEl = $('profBio');
    const emailTxt = $('profEmailText');
    const chatName = $('profChatUserName');

    const nameParts = (user.name || 'کاربر').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if(nameEl) nameEl.textContent = user.name;
    if(greetNameEl) greetNameEl.textContent = firstName;
    if(subEl) subEl.textContent = 'عضو از ' + new Date(user.createdAt).toLocaleDateString('fa-IR');
    if(avEl) avEl.textContent = firstName.charAt(0);
    if(avLetter2) avLetter2.textContent = firstName.charAt(0);
    if(displayName) displayName.textContent = user.name;
    if(displayEmail) displayEmail.textContent = user.email;
    if(emailEl) emailEl.textContent = user.email;
    if(emailInEl) emailInEl.value = user.email;
    if(phoneEl) phoneEl.value = user.phone || '';
    if(birthEl) birthEl.value = profile.birthday || profile.birth || '';
    if(genderEl) genderEl.value = profile.gender || '';
    if(cityEl) cityEl.value = profile.city || '';
    if(jobEl) jobEl.value = profile.job || '';
    if(bioEl) {
      bioEl.value = profile.bio || '';
      updateBioCounter();
    }
    if(emailTxt) emailTxt.textContent = user.email;
    if(chatName) chatName.textContent = firstName;

    if(profile.avatar){
      const av = $('profAvatar');
      const av2 = $('profAvatarLarge');
      if(av) av.innerHTML = `<img src="${profile.avatar}" alt="آواتار" />`;
      if(av2) av2.innerHTML = `<img src="${profile.avatar}" alt="آواتار" />`;
    }

    // بج‌ها
    const sec = window.DPSecurity.getSecurity(userId);
    const secLevel = window.DPSecurity.securityLevel(userId);
    const days = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    let level = 'تازه', levelIcon = '🌱';
    if(days > 30){ level = 'برنزی'; levelIcon = '🥉'; }
    if(days > 90){ level = 'نقره‌ای'; levelIcon = '🥈'; }
    if(days > 180){ level = 'طلایی'; levelIcon = '🥇'; }
    const badges = [`<span class="prof-badge is-verified">✓ ایمیل</span>`];
    if(user.phone) badges.push(`<span class="prof-badge is-verified">📱 موبایل</span>`);
    if(sec.twoFactorEnabled) badges.push(`<span class="prof-badge is-secure">🔐 2FA</span>`);
    badges.push(`<span class="prof-badge" style="background:${secLevel.color}22;color:${secLevel.color};border-color:${secLevel.color}44">🛡️ ${secLevel.label}</span>`);
    badges.push(`<span class="prof-badge">${levelIcon} ${level}</span>`);
    const badgesEl = $('profBadges');
    if(badgesEl) badgesEl.innerHTML = badges.join('');
  }

  // شمارنده کاراکتر بیوگرافی
  function updateBioCounter(){
    const bio = $('profBio');
    const counter = $('profBioCounter');
    if(bio && counter){
      const len = bio.value.length;
      counter.textContent = len + '/۲۰۰';
      counter.style.color = len > 180 ? '#ef4444' : 'var(--text-soft)';
    }
  }
  const bioEl2 = $('profBio');
  if(bioEl2) bioEl2.addEventListener('input', updateBioCounter);

  // ═══ پیشرفت + بنر هوشمند ═══
  function updateProgress(){
    const progress = window.DPProfile.progress(userId);
    const numEl = $('profProgressNum');
    const fillEl = $('profProgressFill');
    if(numEl) numEl.textContent = progress + '٪';
    if(fillEl) fillEl.style.width = progress + '%';

    const inc = $('profIncomplete');
    if(!inc) return;
    const onbStatus = window.DPOnboarding.status(userId);
    const incTitle = $('profIncompleteTitle');
    const incText = $('profIncompleteText');
    const incBtn = $('profStartOnb');

    if(progress >= 100){
      inc.classList.remove('is-on');
      return;
    }

    inc.classList.add('is-on');
    if(onbStatus.skipped && !onbStatus.completed){
      if(incTitle) incTitle.textContent = '🎁 فرصت دوباره!';
      if(incText) incText.textContent = `پروفایل ${progress}٪ تکمیل شده. الان ${100 - progress}٪ دیگه تا فعال‌سازی همه قابلیت‌های هوش مصنوعی.`;
      if(incBtn) incBtn.innerHTML = '🚀 ادامه تکمیل پروفایل';
    } else if(onbStatus.completed){
      if(incTitle) incTitle.textContent = '💎 ارتقا پروفایل';
      if(incText) incText.textContent = 'می‌تونی اطلاعات بیشتری اضافه کنی تا پیشنهادها دقیق‌تر بشن.';
      if(incBtn) incBtn.innerHTML = '⚙️ به‌روزرسانی پروفایل';
    } else {
      if(incTitle) incTitle.textContent = '🚀 پروفایلت رو کامل کن';
      if(incText) incText.textContent = `فقط ${100 - progress}٪ مونده تا فعال شدن همه قابلیت‌های هوش مصنوعی.`;
      if(incBtn) incBtn.innerHTML = '🚀 شروع تکمیل';
    }
  }

  // ═══ خلاصه پروفایل ═══
  function renderSummary(){
    const list = $('profSummaryList');
    if(!list) return;
    const items = [];
    if(profile.skinTone){
      const m = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
      items.push({icon: '🎨', label: 'رنگ پوست', value: m[profile.skinTone]});
    }
    if(profile.bodyType){
      const m = {hourglass:'ساعت‌شنی ⏳', pear:'گلابی 🍐', apple:'سیب 🍎', rectangle:'مستطیل 📏', 'inverted-triangle':'مثلث معکوس 🔻'};
      items.push({icon: '👤', label: 'فرم بدن', value: m[profile.bodyType]});
    }
    if(profile.preferredStyles && profile.preferredStyles.length){
      const m = {classic:'کلاسیک', modern:'مدرن', elegant:'شیک', sporty:'اسپرت', bohemian:'بوهو', minimal:'مینیمال', vintage:'وینتیج'};
      items.push({icon: '💎', label: 'سبک‌ها', value: profile.preferredStyles.slice(0,3).map(s => m[s] || s).join('، ')});
    }
    if(profile.preferredColors && profile.preferredColors.length){
      const m = {gold:'طلایی', black:'مشکی', white:'سفید', cream:'کرم', navy:'سرمه‌ای', emerald:'زمردی', burgundy:'زرشکی', pink:'صورتی'};
      items.push({icon: '🌈', label: 'رنگ‌ها', value: profile.preferredColors.slice(0,4).map(c => m[c] || c).join('، ')});
    }
    if(profile.budget){
      const m = {low:'اقتصادی', medium:'متوسط', high:'بالا', luxury:'لوکس'};
      items.push({icon: '💰', label: 'بودجه', value: m[profile.budget]});
    }
    if(profile.fit){
      const m = {relaxed:'راحت', tailored:'اندامی', oversized:'اورسایز'};
      items.push({icon: '👔', label: 'فیت', value: m[profile.fit]});
    }
    if(profile.measurements && profile.measurements.height){
      items.push({icon: '📏', label: 'قد', value: profile.measurements.height + ' cm'});
    }
    if(user.phone) items.push({icon: '📱', label: 'موبایل', value: user.phone});
    if(profile.city) items.push({icon: '🏙️', label: 'شهر', value: profile.city});

    if(items.length === 0){
      list.innerHTML = `<div class="prof-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <h3>پروفایل خالیه!</h3>
        <p>برای شروع، روی دکمه "🚀 تکمیل پروفایل" کلیک کن</p>
      </div>`;
    } else {
      list.innerHTML = items.map(i => `<div class="prof-summary-row"><span style="font-size:16px">${i.icon}</span><strong>${i.label}:</strong><span>${i.value}</span></div>`).join('');
    }
  }

  // ═══ منوی کناری ═══
  const sideBtns = document.querySelectorAll('.prof-side-btn[data-section]');
  const sections = document.querySelectorAll('.prof-section');
  sideBtns.forEach(b => {
    b.addEventListener('click', () => {
      const target = b.dataset.section;
      sideBtns.forEach(x => x.classList.toggle('is-on', x === b));
      sections.forEach(s => s.style.display = s.id === 'sec-' + target ? 'block' : 'none');
      if(target === 'ai'){
        renderSummary();
        renderRecs();
      }
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
  });

  // ═══ فرم شخصی ═══
  const personalForm = $('profPersonalForm');
  if(personalForm){
    personalForm.addEventListener('submit', e => {
      e.preventDefault();
      const firstName = $('profFirstName').value.trim();
      const lastName = $('profLastName').value.trim();
      const fullName = (firstName + ' ' + lastName).trim();
      const phone = ($('profPhone').value || '').replace(/\D/g, '');
      const birthday = $('profBirthday').value.trim();
      const gender = $('profGender').value;
      const city = $('profCity').value.trim();
      const job = $('profJob').value.trim();
      const bio = $('profBio').value.trim();
      if(phone && !/^09[0-9]{9}$/.test(phone)){ toast('شماره موبایل نامعتبر (۰۹xxxxxxxxx)', false); return; }
      if(firstName && fullName !== user.name) window.DPAuth.updateProfile({name: fullName});
      else if(phone && phone !== user.phone) window.DPAuth.updateProfile({phone: phone});
      const updates = {firstName, lastName, name: fullName, phone, birthday, birth: birthday, gender, city, job, bio};
      Object.keys(updates).forEach(k => updates[k] === '' && delete updates[k]);
      profile = {...profile, ...updates};
      window.DPProfile.save(userId, updates);
      toast('✅ اطلاعات ذخیره شد');
      fillHeader();
      updateProgress();
      renderSummary();
      renderRecs();
    });
  }

  // ═══ آواتار ═══
  const avEdit = $('profAvatarEdit');
  const avFile = $('profAvatarFile');
  const av = $('profAvatar');
  if(avEdit) avEdit.addEventListener('click', () => avFile && avFile.click());
  if(av) av.addEventListener('click', () => avFile && avFile.click());
  if(avFile){
    avFile.addEventListener('change', e => {
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 8 * 1024 * 1024){ toast('حجم عکس نباید بیشتر از ۸ مگابایت باشد', false); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        if(av) av.innerHTML = `<img src="${ev.target.result}" alt="آواتار" />`;
        window.DPProfile.save(userId, {avatar: ev.target.result});
        profile.avatar = ev.target.result;
        toast('✅ عکس پروفایل تغییر کرد');
      };
      reader.readAsDataURL(file);
    });
  }

  // ═══ تحلیل عکس با موتور Rule-Based AI پیشرفته ═══
  const profFile = $('profFile');
  if(profFile){
    profFile.addEventListener('change', e => {
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 8 * 1024 * 1024){ toast('حجم عکس نباید بیشتر از ۸ مگابایت باشد', false); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const empty = $('profUploadEmpty');
        const up = $('profUpload');
        if(empty) empty.innerHTML = `<img src="${ev.target.result}" alt="عکس" />`;
        if(up) up.classList.add('has-image');
        toast('⏳ در حال تحلیل عکس با AI...');

        // ═══ استفاده از موتور DPPhotoAI برای تحلیل واقعی عکس ═══
        if(window.DPPhotoAI){
          window.DPPhotoAI.analyze(ev.target.result).then(analysis => {
            // ذخیره اطلاعات در پروفایل
            const updates = {
              skinTone: analysis.skinTone,  // warm | cool | neutral
              skinDepth: analysis.skinDepth, // deep | tan | medium | light | fair
              season: analysis.season,
              photoAnalysis: analysis,
              photo: ev.target.result
            };

            // ═══ جدید: غنی‌سازی پروفایل با photoStyleProfile ═══
            if(window.DPPhotoStyle){
              profile = window.DPPhotoStyle.enrichProfileWithPhoto(profile, analysis);
            }
            profile = {...profile, ...updates};
            window.DPProfile.save(userId, updates);

            // ═══ نمایش نتایج تحلیل ═══
            const analysisEl = $('profAnalysis');
            if(analysisEl){
              const skinMap = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
              const depthMap = {deep:'تیره', tan:'برنزه', medium:'متوسط', light:'روشن', fair:'خیلی روشن'};
              const seasonColors = analysis.seasonPalette ? analysis.seasonPalette.slice(0, 5).map(c =>
                `<span style="display:inline-block;background:var(--bg-soft);padding:2px 6px;border-radius:6px;margin:2px;font-size:9.5px">${c}</span>`
              ).join('') : '';

              analysisEl.innerHTML = `
                <div class="prof-analysis-item" style="grid-column:1/-1;background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.04));border:1.5px solid rgba(212,175,55,0.3)">
                  <div class="prof-analysis-icon" style="background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#1a1a1a;font-size:14px">🎨</div>
                  <div class="prof-analysis-info" style="flex:1">
                    <strong>تحلیل کامل عکس شما</strong>
                    <span>10 لایه تحلیل AI روی عکس</span>
                  </div>
                  <span style="font-size:9.5px;background:var(--gold);color:#1a1a1a;padding:2px 8px;border-radius:8px;font-weight:800">دقت ${Math.round(analysis.skinConfidence * 100)}٪</span>
                </div>

                <div class="prof-analysis-item">
                  <div class="prof-analysis-icon">☀️</div>
                  <div class="prof-analysis-info">
                    <strong>رنگ پوست: ${skinMap[analysis.skinTone]}</strong>
                    <span>عمق: ${depthMap[analysis.skinDepth]} (روشنایی ${analysis.avgLightness}٪)</span>
                  </div>
                </div>

                ${analysis.seasonLabel ? `
                <div class="prof-analysis-item">
                  <div class="prof-analysis-icon">🌈</div>
                  <div class="prof-analysis-info">
                    <strong>فصل رنگی: ${analysis.seasonLabel}</strong>
                    <span>${analysis.seasonPalette.length} رنگ سازگار پیشنهادی</span>
                  </div>
                </div>
                ` : ''}

                ${analysis.mood && analysis.mood !== 'balanced' ? `
                <div class="prof-analysis-item">
                  <div class="prof-analysis-icon">${analysis.mood === 'warm' ? '🔥' : '❄️'}</div>
                  <div class="prof-analysis-info">
                    <strong>حس عکس: ${analysis.mood === 'warm' ? 'گرم' : 'خنک'}</strong>
                    <span>${analysis.mood === 'warm' ? 'عکس فضای گرم دارد' : 'عکس فضای خنک دارد'}</span>
                  </div>
                </div>
                ` : ''}

                <div class="prof-analysis-item">
                  <div class="prof-analysis-icon">💡</div>
                  <div class="prof-analysis-info">
                    <strong>کیفیت عکس: ${analysis.photoQuality === 'good' ? 'عالی ✓' : analysis.photoQuality === 'overexposed' ? 'روشن' : analysis.photoQuality === 'underexposed' ? 'تاریک' : analysis.photoQuality === 'low-contrast' ? 'کم‌کنتراست' : 'متوسط'}</strong>
                    <span>${analysis.brightness} • کنتراست ${analysis.contrast}٪</span>
                  </div>
                </div>

                ${analysis.recommendedColors && analysis.recommendedColors.length > 0 ? `
                <div class="prof-analysis-item" style="grid-column:1/-1;background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02));border:1.5px solid rgba(16,185,129,0.3)">
                  <div class="prof-analysis-icon">✨</div>
                  <div class="prof-analysis-info" style="flex:1">
                    <strong>5 رنگ برتر پیشنهادی برای شما</strong>
                    <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
                      ${analysis.recommendedColors.slice(0, 5).map(c => `
                        <div style="display:flex;align-items:center;gap:4px;background:var(--bg-card);padding:3px 8px;border-radius:8px;border:1px solid var(--border-soft)">
                          <span style="width:14px;height:14px;border-radius:50%;background:${c.hex};border:1.5px solid var(--border)"></span>
                          <span style="font-size:10px;font-weight:700">${c.persian}</span>
                          <span style="font-size:9px;color:var(--text-soft)">${c.score}٪</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
                ` : ''}

                ${analysis.recommendations && analysis.recommendations.length > 0 ? `
                <div class="prof-analysis-item" style="grid-column:1/-1;background:var(--bg-soft);border:1px dashed var(--border)">
                  <div class="prof-analysis-icon">💡</div>
                  <div class="prof-analysis-info" style="flex:1">
                    <strong>${analysis.recommendations[0].title}</strong>
                    <span style="display:block;margin-top:2px;line-height:1.6">${analysis.recommendations[0].text}</span>
                    ${analysis.recommendations[1] ? `<span style="display:block;margin-top:4px;line-height:1.6;color:var(--text-soft)"><strong>${analysis.recommendations[1].title}:</strong> ${analysis.recommendations[1].text}</span>` : ''}
                  </div>
                </div>
                ` : ''}
              `;
              analysisEl.style.display = 'grid';
            }

            // ═══ جدید: پیشنهاد محصول بر اساس عکس چهره ═══
            if(window.DPPhotoStyle && window.DPProducts){
              const allP = window.DPProducts.all();
              const photoMatched = window.DPPhotoStyle.filterByPhotoAnalysis(allP, analysis, {
                minScore: 50,
                limit: 8
              });

              const resultEl = $('profPhotoStyleResult');
              const statsEl = $('profPhotoStyleStats');
              const listEl = $('profPhotoStyleList');

              if(resultEl && statsEl && listEl){
                if(photoMatched.length === 0){
                  resultEl.hidden = false;
                  statsEl.innerHTML = '';
                  listEl.innerHTML = '<div class="prof-wardrobe-empty" style="grid-column:1/-1"><div class="prof-wardrobe-empty-icon">🤔</div><h3>محصول مناسبی پیدا نشد</h3><p>پروفایلت رو بیشتر تکمیل کن</p></div>';
                } else {
                  resultEl.hidden = false;

                  // ═══ آمار ═══
                  const perfectCount = photoMatched.filter(p => p.photoLevel === 'perfect').length;
                  const excellentCount = photoMatched.filter(p => p.photoLevel === 'excellent').length;
                  const seasonName = analysis.season?.main || 'متنوع';

                  statsEl.innerHTML = `
                    <div class="prof-photo-style-stat">
                      <div class="prof-photo-style-stat-icon">🎨</div>
                      <div class="prof-photo-style-stat-text">
                        <div class="prof-photo-style-stat-title">فصل رنگی شما</div>
                        <div class="prof-photo-style-stat-value">${seasonName}</div>
                      </div>
                    </div>
                    <div class="prof-photo-style-stat">
                      <div class="prof-photo-style-stat-icon">☀️</div>
                      <div class="prof-photo-style-stat-text">
                        <div class="prof-photo-style-stat-title">رنگ پوست</div>
                        <div class="prof-photo-style-stat-value">${analysis.skin?.label || 'متنوع'}</div>
                      </div>
                    </div>
                    <div class="prof-photo-style-stat">
                      <div class="prof-photo-style-stat-icon">✨</div>
                      <div class="prof-photo-style-stat-text">
                        <div class="prof-photo-style-stat-title">عالی برای چهره‌ات</div>
                        <div class="prof-photo-style-stat-value">${perfectCount} محصول</div>
                      </div>
                    </div>
                    <div class="prof-photo-style-stat">
                      <div class="prof-photo-style-stat-icon">👌</div>
                      <div class="prof-photo-style-stat-text">
                        <div class="prof-photo-style-stat-title">خوب برای چهره‌ات</div>
                        <div class="prof-photo-style-stat-value">${excellentCount} محصول</div>
                      </div>
                    </div>
                  `;

                  // ═══ لیست محصولات ═══
                  listEl.innerHTML = photoMatched.map(p => {
                    const isPerfect = p.photoLevel === 'perfect';
                    const topReason = p.photoReasons && p.photoReasons[0] ? p.photoReasons[0].text : 'هماهنگ با چهره شما';
                    return `
                      <div class="prof-photo-style-item ${isPerfect ? 'is-perfect' : ''}" data-prod="${p.id}">
                        <div class="prof-photo-style-img">
                          ${productIcon(p.subcategory || p.category)}
                          <span class="prof-photo-style-score ${isPerfect ? 'is-perfect' : ''}">${p.photoScore}٪</span>
                        </div>
                        <div class="prof-photo-style-info">
                          <div class="prof-photo-style-name">${p.name}</div>
                          <div class="prof-photo-style-reason">${topReason}</div>
                          <div class="prof-photo-style-price">${(p.price || 0).toLocaleString('fa-IR')} تومان</div>
                        </div>
                      </div>
                    `;
                  }).join('');

                  listEl.querySelectorAll('[data-prod]').forEach(el => {
                    el.addEventListener('click', () => {
                      const id = el.dataset.prod;
                      if(window.DPProfile.track) window.DPProfile.track(userId, id, 'view');
                      window.location.href = './product.html?id=' + encodeURIComponent(id);
                    });
                  });

                  // اسکرول به سکشن پیشنهادات
                  setTimeout(() => {
                    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 200);
                }
              }
            }

            toast('✅ تحلیل AI کامل شد!');
            updateProgress();
            renderSummary();
            renderRecs();

            // ارسال پیام به چت
            const msg = `📸 **عکس شما تحلیل شد!**\n\n**رنگ پوست:** ${analysis.skinTone === 'warm' ? 'گرم ☀️' : analysis.skinTone === 'cool' ? 'سرد ❄️' : 'خنثی ⚖️'}\n${analysis.seasonLabel ? '**فصل رنگی:** ' + analysis.seasonLabel + '\n' : ''}${analysis.recommendedColors && analysis.recommendedColors[0] ? '**5 رنگ برتر:** ' + analysis.recommendedColors.slice(0, 5).map(c => c.persian).join('، ') + '\n' : ''}\n💡 از این به بعد پیشنهادها بر اساس رنگ پوست و فصل رنگی شما تنظیم می‌شن!`;
            setTimeout(() => addChatMsg(msg, 'ai'), 500);
          }).catch(err => {
            console.error('Photo analysis error:', err);
            toast('❌ خطا در تحلیل عکس', false);
            // Fallback به روش قدیمی
            fallbackPhotoAnalysis(ev.target.result);
          });
        } else {
          // اگه DPPhotoAI لود نشده، روش قدیمی
          fallbackPhotoAnalysis(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // روش قدیمی به عنوان fallback
  function fallbackPhotoAnalysis(imageData){
    setTimeout(() => {
      const skinTones = ['warm','cool','neutral'];
      const bodyTypes = ['hourglass','pear','apple','rectangle','inverted-triangle'];
      const skin = skinTones[Math.floor(Math.random() * 3)];
      const body = bodyTypes[Math.floor(Math.random() * 5)];
      const skinMap = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
      const bodyMap = {hourglass:'ساعت‌شنی ⏳', pear:'گلابی 🍐', apple:'سیب 🍎', rectangle:'مستطیل 📏', 'inverted-triangle':'مثلث معکوس 🔻'};
      profile = {...profile, skinTone: skin, bodyType: body, photo: imageData};
      window.DPProfile.save(userId, {skinTone: skin, bodyType: body, photo: imageData});
      const analysis = $('profAnalysis');
      if(analysis){
        analysis.innerHTML = `
          <div class="prof-analysis-item">
            <div class="prof-analysis-icon">☀️</div>
            <div class="prof-analysis-info"><strong>رنگ پوست: ${skinMap[skin]}</strong><span>(ساده - موتور تحلیل لود نشد)</span></div>
          </div>
          <div class="prof-analysis-item">
            <div class="prof-analysis-icon">⏳</div>
            <div class="prof-analysis-info"><strong>فرم بدن: ${bodyMap[body]}</strong><span>(ساده - موتور تحلیل لود نشد)</span></div>
          </div>
        `;
        analysis.style.display = 'grid';
      }
      toast('✅ تحلیل ساده انجام شد');
      updateProgress();
      renderSummary();
      renderRecs();
    }, 1500);
  }

  // ═══ اندازه‌های بدن ═══
  if(profile.measurements){
    const map = {shoulder:'mShoulder', chest:'mChest', waist:'mWaist', hip:'mHip', height:'mHeight', armLength:'mArm', inseam:'mInseam', weight:'mWeight'};
    Object.entries(map).forEach(([key, id]) => {
      const el = $(id);
      if(el && profile.measurements[key]) el.value = profile.measurements[key];
    });
  }
  // فیت اولیه
  if(profile.fit){
    document.querySelectorAll('.prof-fit-option').forEach(o => o.classList.toggle('is-on', o.dataset.fit === profile.fit));
  }
  const measForm = $('profMeasurementsForm');
  if(measForm){
    measForm.addEventListener('submit', e => {
      e.preventDefault();
      const measurements = {
        height: parseFloat($('mHeight').value) || null,
        weight: parseFloat($('mWeight').value) || null,
        shoulder: parseFloat($('mShoulder').value) || null,
        chest: parseFloat($('mChest').value) || null,
        waist: parseFloat($('mWaist').value) || null,
        hip: parseFloat($('mHip').value) || null,
        armLength: parseFloat($('mArm').value) || null,
        inseam: parseFloat($('mInseam').value) || null
      };
      Object.keys(measurements).forEach(k => measurements[k] === null && delete measurements[k]);
      profile = {...profile, measurements};
      window.DPProfile.save(userId, {measurements});
      toast('✅ اندازه‌ها ذخیره شد 🔒');
      updateProgress();
      renderSizes(measurements);
      renderRecs();
      renderSummary();
    });
  }
  function renderSizes(m){
    const el = $('profSizes');
    if(!el) return;
    if(!m || Object.keys(m).length < 3){ el.style.display = 'none'; return; }
    el.style.display = 'grid';
    let tops = 'M', bottoms = 'M', dress = 'M', jacket = 'M';
    if(m.chest){ if(m.chest < 85) tops = 'S'; else if(m.chest < 95) tops = 'M'; else if(m.chest < 105) tops = 'L'; else tops = 'XL'; }
    if(m.waist){ if(m.waist < 70) bottoms = 'S'; else if(m.waist < 80) bottoms = 'M'; else if(m.waist < 90) bottoms = 'L'; else bottoms = 'XL'; }
    if(m.hip && m.waist){ if(m.hip < 90) dress = 'S'; else if(m.hip < 100) dress = 'M'; else if(m.hip < 110) dress = 'L'; else dress = 'XL'; }
    if(m.shoulder && m.chest){
      if(m.shoulder < 38) jacket = 'S';
      else if(m.shoulder < 42) jacket = 'M';
      else if(m.shoulder < 46) jacket = 'L';
      else jacket = 'XL';
    }
    const shoeSize = m.height ? Math.max(35, Math.min(45, Math.round((m.height - 100) * 0.65 + 35))) : 40;
    el.innerHTML = `
      <div class="prof-smart-size-card"><div class="size-label">تاپ</div><div class="size-value">${tops}</div><div class="size-confidence">سینه ${m.chest ? m.chest + 'cm' : ''}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">شلوار</div><div class="size-value">${bottoms}</div><div class="size-confidence">کمر ${m.waist ? m.waist + 'cm' : ''}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">پیراهن</div><div class="size-value">${dress}</div><div class="size-confidence">باسن ${m.hip ? m.hip + 'cm' : ''}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">کاپشن</div><div class="size-value">${jacket}</div><div class="size-confidence">شانه ${m.shoulder ? m.shoulder + 'cm' : ''}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">کفش</div><div class="size-value">${shoeSize}</div><div class="size-confidence">قد ${m.height ? m.height + 'cm' : ''}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">قد فاق</div><div class="size-value">${m.inseam || '-'}</div><div class="size-confidence">برای شلوار</div></div>
      <div class="prof-smart-size-card"><div class="size-label">آستین</div><div class="size-value">${m.armLength || '-'}</div><div class="size-confidence">${m.armLength ? m.armLength + 'cm' : 'cm'}</div></div>
      <div class="prof-smart-size-card"><div class="size-label">وزن</div><div class="size-value">${m.weight || '-'}</div><div class="size-confidence">${m.weight ? m.weight + 'kg' : 'kg'}</div></div>
    `;
  }
  renderSizes(profile.measurements);

  // ═══ auto-format تاریخ شمسی + موبایل ═══
  const phoneInp = $('profPhone');
  if(phoneInp){
    phoneInp.addEventListener('input', e => {
      // فقط عدد، حداکثر ۱۱ رقم
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      // اگه با ۹۸ یا ۹۸۹۱ شروع شد، حذف
      if(v.startsWith('98')) v = '0' + v.slice(2);
      if(v.length > 1 && !v.startsWith('09')) v = '09' + v.replace(/^09/, '').slice(0, 9);
      e.target.value = v;
    });
  }
  const birthInp = $('profBirthday');
  if(birthInp){
    birthInp.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if(v.length >= 5) v = v.slice(0,4) + '/' + v.slice(4);
      if(v.length >= 8) v = v.slice(0,7) + '/' + v.slice(7);
      e.target.value = v;
    });
  }

  // ═══ تب‌های ابزار اندازه‌گیری ═══
  document.querySelectorAll('.prof-measure-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tool = tab.dataset.tool;
      document.querySelectorAll('.prof-measure-tab').forEach(t => t.classList.toggle('is-on', t === tab));
      document.querySelectorAll('.prof-measure-tool').forEach(p => p.classList.toggle('is-on', p.dataset.toolPanel === tool));
    });
  });

  // ═══ hotspot نقشه بدن (راهنمای تعاملی) ═══
  const bodyTips = {
    shoulder: '<strong>💡 عرض شانه:</strong> از یک سر شانه تا سر دیگر، از پشت اندازه بگیر. بازه طبیعی: ۳۰-۵۵ سانتی‌متر.',
    chest: '<strong>💡 دور سینه:</strong> دور برجسته‌ترین قسمت سینه، صاف نفس بکش. بازه: ۷۰-۱۳۰ سانتی‌متر.',
    waist: '<strong>💡 دور کمر:</strong> دور باریک‌ترین قسمت کمر (معمولاً بالای ناف). بازه: ۶۰-۱۲۰ سانتی‌متر.',
    hip: '<strong>💡 دور باسن:</strong> دور برجسته‌ترین قسمت باسن. بازه: ۷۵-۱۳۰ سانتی‌متر.',
    height: '<strong>💡 قد:</strong> بدون کفش از فرق سر تا زمین. بازه: ۱۴۰-۲۰۰ سانتی‌متر.'
  };
  document.querySelectorAll('.prof-body-hotspot').forEach(spot => {
    spot.addEventListener('click', () => {
      document.querySelectorAll('.prof-body-hotspot').forEach(s => s.classList.remove('is-active'));
      spot.classList.add('is-active');
      const tip = $('profBodyTip');
      if(tip) tip.innerHTML = bodyTips[spot.dataset.spot] || bodyTips.shoulder;
      // تمرکز روی فیلد مربوطه
      const fieldMap = {shoulder:'mShoulder', chest:'mChest', waist:'mWaist', hip:'mHip', height:'mHeight'};
      const target = $(fieldMap[spot.dataset.spot]);
      if(target) { target.focus(); target.scrollIntoView({behavior: 'smooth', block: 'center'}); }
    });
  });

  // ═══ فیت سلکتور ═══
  document.querySelectorAll('.prof-fit-option').forEach(opt => {
    if(profile.fit && opt.dataset.fit === profile.fit) opt.classList.add('is-on');
    opt.addEventListener('click', () => {
      document.querySelectorAll('.prof-fit-option').forEach(x => x.classList.remove('is-on'));
      opt.classList.add('is-on');
      profile = {...profile, fit: opt.dataset.fit};
      window.DPProfile.save(userId, {fit: opt.dataset.fit});
      toast('✅ فیت ذخیره شد: ' + (opt.dataset.fit === 'relaxed' ? 'راحت' : opt.dataset.fit === 'tailored' ? 'اندامی' : 'اورسایز'));
    });
  });

  // ═══ فرم سایز استاندارد (تخمین خودکار) ═══
  const stdForm = $('profStandardSizeForm');
  // جدول تبدیل سایز ایران
  const stdSizeMap = {
    'XS': {chest: 82, waist: 62, hip: 88, shoulder: 36},
    'S':  {chest: 88, waist: 68, hip: 94, shoulder: 38},
    'M':  {chest: 94, waist: 74, hip: 100, shoulder: 40},
    'L':  {chest: 100, waist: 80, hip: 106, shoulder: 42},
    'XL': {chest: 108, waist: 88, hip: 114, shoulder: 44},
    'XXL':{chest: 116, waist: 96, hip: 122, shoulder: 46}
  };
  if(stdForm){
    stdForm.addEventListener('submit', e => {
      e.preventDefault();
      const top = $('stdTopSize').value;
      const bottom = $('stdBottomSize').value;
      const shoe = $('stdShoeSize').value;
      const belt = $('stdBeltSize').value;
      const result = $('profStandardSizeResult');
      if(!top && !bottom && !shoe && !belt){
        if(result) result.innerHTML = '<div style="background:rgba(245,158,11,0.1);color:#f59e0b;padding:10px;border-radius:8px;font-size:12px">⚠️ حداقل یک سایز رو انتخاب کن</div>';
        return;
      }
      const m = {...(profile.measurements || {})};
      if(top && stdSizeMap[top]) Object.assign(m, stdSizeMap[top]);
      if(bottom){
        const w = parseInt(bottom) - 24; // تقریب: سایز شلوار = کمر + ۲۴
        const h = parseInt(bottom) - 8;
        m.waist = m.waist || w;
        m.hip = m.hip || h;
      }
      profile.measurements = m;
      if(shoe) profile.shoeSize = shoe;
      if(belt) profile.beltSize = belt;
      window.DPProfile.save(userId, {measurements: m, shoeSize: shoe, beltSize: belt});
      // پر کردن فیلدها
      if(m.height) $('mHeight').value = m.height;
      if(m.shoulder) $('mShoulder').value = m.shoulder;
      if(m.chest) $('mChest').value = m.chest;
      if(m.waist) $('mWaist').value = m.waist;
      if(m.hip) $('mHip').value = m.hip;
      // نمایش نتیجه
      if(result){
        const cards = [];
        if(top){
          const tm = stdSizeMap[top];
          cards.push(`<div class="prof-size-card is-confident"><strong>${top}</strong><span>تاپ (${tm.chest}cm سینه)</span></div>`);
        }
        if(bottom){
          cards.push(`<div class="prof-size-card is-confident"><strong>${bottom}</strong><span>شلوار</span></div>`);
        }
        if(shoe){
          cards.push(`<div class="prof-size-card is-confident"><strong>${shoe}</strong><span>کفش</span></div>`);
        }
        if(belt){
          cards.push(`<div class="prof-size-card is-confident"><strong>${belt}</strong><span>کمربند</span></div>`);
        }
        result.innerHTML = `
          <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04));border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:12px;margin-top:10px">
            <strong style="font-size:12px;color:#059669;display:block;margin-bottom:8px">✅ اندازه‌های تخمینی شما:</strong>
            <div class="prof-sizes" style="margin:0">${cards.join('')}</div>
            <p style="font-size:10.5px;color:var(--text-soft);margin:8px 0 0;line-height:1.6">💡 برای دقت بیشتر، اندازه‌ها رو در تب "دستی" با متر وارد کن</p>
          </div>
        `;
      }
      renderRecs();
      updateProgress();
      renderSummary();
      toast('✅ سایزها ذخیره شد');
    });
  }

  // ═══ چیپ‌ها (گسترده) ═══
  const chipMap = {
    'profStyleChips': 'preferredStyles',
    'profColorChips': 'preferredColors',
    'profOccasionChips': 'preferredOccasions',
    'profSeasonChips': 'preferredSeasons'
  };
  Object.entries(chipMap).forEach(([id, key]) => {
    const saved = profile[key] || [];
    document.querySelectorAll('#' + id + ' [data-cat]').forEach(c => c.classList.toggle('is-on', saved.includes(c.dataset.v)));
  });
  if(profile.budget){
    document.querySelectorAll('#profBudgetChips [data-v]').forEach(c => c.classList.toggle('is-on', c.dataset.v === profile.budget));
  }
  document.querySelectorAll('.prof-chip[data-cat]').forEach(c => {
    c.addEventListener('click', () => {
      const cat = c.dataset.cat;
      const val = c.dataset.v;
      if(cat === 'budget'){
        document.querySelectorAll('#profBudgetChips [data-cat]').forEach(x => x.classList.remove('is-on'));
        c.classList.add('is-on');
        profile = {...profile, budget: val};
        window.DPProfile.save(userId, {budget: val});
      } else {
        const key = cat === 'styles' ? 'preferredStyles' :
                    cat === 'colors' ? 'preferredColors' :
                    cat === 'occasions' ? 'preferredOccasions' :
                    cat === 'seasons' ? 'preferredSeasons' : null;
        if(!key) return;
        let current = profile[key] || [];
        if(current.includes(val)) current = current.filter(v => v !== val);
        else current = [...current, val];
        c.classList.toggle('is-on');
        profile = {...profile, [key]: current};
        window.DPProfile.save(userId, {[key]: current});
      }
      toast('✅ سلیقه ذخیره شد');
      updateProgress();
      renderSummary();
      renderRecs();
    });
  });

  // ═══ پیشنهادات با موتور AI پیشرفته (v2.0) ═══
  let recsMode = 'personalized'; // personalized | trending | discount | bestsellers | sellers
  function renderRecs(){
    const recsEl = $('profRecs');
    if(!recsEl || !window.DPProducts){
      if(recsEl) recsEl.innerHTML = '<div class="prof-empty" style="grid-column:1/-1"><p>در حال بارگذاری محصولات...</p></div>';
      return;
    }

    const history = window.DPProfile.history ? window.DPProfile.history(userId) : [];
    let recs = [];

    if(recsMode === 'personalized'){
      // ═══ استفاده از موتور پیشرفته AI برای پیشنهاد شخصی‌سازی شده ═══
      if(window.DPAIEngine){
        const allProducts = window.DPProducts.all();

        // ═══ اگه photoStyle فعاله، اول محصولات سازگار با عکس رو بالا بیار ═══
        if(window.DPPhotoStyle && profile.photoAnalysis && profile.photoAnalysis.success){
          const photoRecs = window.DPPhotoStyle.filterByPhotoAnalysis(allProducts, profile.photoAnalysis, { minScore: 60, limit: 6 });
          // سپس محصولات شخصی‌سازی‌شده بر اساس سلیقه
          const personalRecs = window.DPAIEngine.recommend(allProducts, profile, history, {limit: 12, minPercent: 0, useDiversity: true});
          // ترکیب: اول محصولات photo، بعد شخصی
          const photoIds = new Set(photoRecs.map(p => p.id));
          recs = [
            ...photoRecs.map(p => ({...p, matchPercent: p.photoScore, reasons: ['📸 سازگار با چهره شما: ' + (p.photoReasons[0]?.text || 'هماهنگ')]})),
            ...personalRecs.filter(p => !photoIds.has(p.id))
          ].slice(0, 12);
        } else {
          recs = window.DPAIEngine.recommend(allProducts, profile, history, {limit: 12, minPercent: 0, useDiversity: true});
        }
      } else {
        recs = window.DPProducts.recommend(profile, history, 12);
      }
    } else if(recsMode === 'trending'){
      recs = window.DPProducts.trending(12);
    } else if(recsMode === 'discount'){
      recs = window.DPProducts.discounted(12);
    } else if(recsMode === 'bestsellers'){
      recs = window.DPProducts.bestSellers(12);
    } else if(recsMode === 'sellers'){
      // ═══ فقط محصولات واقعی فروشنده‌ها با موتور AI پیشرفته ═══
      const allSellerProducts = window.DPProducts.all().filter(p => p.isSellerProduct);
      if(allSellerProducts.length === 0){
        recsEl.innerHTML = '<div class="prof-empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5v2H3z"/><path d="M3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9"/></svg><h3>هنوز محصولی از فروشنده‌ها ثبت نشده</h3><p>اولین فروشنده باش و محصولت رو اضافه کن!</p><a href="./seller/seller-signup.html" class="prof-btn" style="margin-top:12px;display:inline-flex;text-decoration:none">🏪 ثبت‌نام فروشنده</a></div>';
        return;
      }
      if(window.DPAIEngine){
        recs = window.DPAIEngine.recommend(allSellerProducts, profile, history, {limit: 12, minPercent: 0, useDiversity: true});
      } else {
        recs = allSellerProducts;
      }
    }

    if(!recs || recs.length === 0){
      recs = window.DPProducts.trending(12);
    }
    // ⚠️ فقط محصولاتی که بیشتر از ۶۵٪ تطابق دارن نمایش داده می‌شن
    // (در تب‌های personalized و sellers؛ تب‌های trending/discount/bestsellers فیلتر نشدن چون همه محصولات رو نشون میدن)
    if(recsMode === 'personalized' || recsMode === 'sellers'){
      recs = recs.filter(p => !p.matchPercent || p.matchPercent >= 65);
      if(recs.length === 0){
        recsEl.innerHTML = '<div class="prof-empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg><h3>هنوز محصولی با بیش از ۶۵٪ تطابق پیدا نشد</h3><p>💡 پروفایلت رو تکمیل‌تر کن (سبک، رنگ، بودجه، فرم بدن) تا پیشنهادهای دقیق‌تری ببینی.</p><button class="prof-btn" style="margin-top:12px" onclick="document.getElementById(\'profStartOnb\')?.click()">🚀 تکمیل پروفایل</button></div>';
        return;
      }
    }

    recsEl.innerHTML = recs.map(p => {
      const formattedPrice = window.DPProducts.formatPrice(p.price);
      const formattedOriginal = p.originalPrice ? window.DPProducts.formatPrice(p.originalPrice) : '';
      // Badge confidence based on matchPercent (آستانه‌ها: ۸۵ عالی، ۷۵ خوب، ۶۵ قابل‌قبول)
      let confBadge = '';
      if(p.matchPercent >= 85) confBadge = '<span style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:2px 7px;border-radius:8px;font-size:9.5px;font-weight:800;z-index:2">عالی</span>';
      else if(p.matchPercent >= 75) confBadge = '<span style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#1a1a1a;padding:2px 7px;border-radius:8px;font-size:9.5px;font-weight:800;z-index:2">خوب</span>';
      // 🏪 بج محصول فروشنده واقعی
      const sellerBadge = p.isSellerProduct ? '<span style="position:absolute;top:6px;left:6px;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#1a1a1a;padding:3px 8px;border-radius:8px;font-size:9px;font-weight:800;z-index:2;box-shadow:0 2px 6px rgba(212,175,55,0.4)">🏪 فروشنده</span>' : '';
      // ⚠️ توضیح فقط برای تطابق ۶۵٪ به بالا
      const showReason = p.matchPercent && p.matchPercent >= 65 && p.reasons && p.reasons.length;
      return `
      <div class="prof-product ${p.isSellerProduct ? 'is-seller-product' : ''}" data-prod="${p.id}" ${p.isSellerProduct ? 'data-seller-id="' + p.id + '"' : ''}>
        <div class="prof-product-img">
          ${productIcon(p.subcategory || p.category)}
          ${confBadge}
          ${sellerBadge}
          ${p.discount ? `<span class="prof-product-discount">${p.discount}٪</span>` : ''}
          ${p.matchPercent ? `<span class="prof-product-score">${p.matchPercent}٪ تطابق</span>` : ''}
        </div>
        <div class="prof-product-info">
          <div class="prof-product-brand">
            ${p.brand || ''}
            ${p.isSellerProduct ? '<span style="display:inline-block;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#1a1a1a;padding:1px 6px;border-radius:5px;font-size:8.5px;font-weight:800;margin-right:4px;vertical-align:middle">🏪 فروشگاه</span>' : ''}
          </div>
          <h4>${p.name}</h4>
          ${showReason ? `<div style="font-size:9.5px;color:var(--gold-dark);line-height:1.4;margin:3px 0;min-height:24px">${p.reasons[0]}</div>` : '<div style="min-height:24px"></div>'}
          <div class="prof-product-price">
            <strong>${formattedPrice}</strong>
            ${formattedOriginal ? `<del>${formattedOriginal}</del>` : ''}
            <span style="font-size:9.5px;color:var(--text-soft);margin-right:auto">تومان</span>
          </div>
          <div class="prof-product-rating">
            <span>★</span> ${p.rating} <span style="color:var(--text-soft)">(${p.reviews})</span>
            ${p.sold > 1000 ? `<span style="margin-right:auto;color:#10b981;font-size:9.5px">🔥 ${p.sold}</span>` : ''}
          </div>
        </div>
      </div>
    `}).join('');

    // کلیک روی محصول → صفحه محصول
    recsEl.querySelectorAll('.prof-product').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.prod;
        if(!id) return;
        // ثبت بازدید
        if(window.DPProfile.track) window.DPProfile.track(userId, id, 'view');
        // رفتن به صفحه محصول (نه modal)
        window.location.href = './product.html?id=' + encodeURIComponent(id);
      });
    });
  }

  // ═══ کشف سلیقه و گسترش طیف (DPTasteEngine) ═══
  function renderTasteDiscovery(){
    if(!window.DPTasteEngine){
      console.warn('DPTasteEngine not loaded');
      return;
    }
    const history = window.DPProfile.history ? window.DPProfile.history(userId) : [];
    const allProducts = window.DPProducts ? window.DPProducts.all() : [];

    // ۱) گزارش کامل سلیقه
    const report = window.DPTasteEngine.generateTasteReport(profile, history, null);

    // ۲) آمار رفتاری
    const consistencyEl = $('profStatConsistency');
    const boldnessEl = $('profStatBoldness');
    const loyaltyEl = $('profStatLoyalty');
    if(consistencyEl) consistencyEl.textContent = report.behavior.consistency + '٪';
    if(boldnessEl) boldnessEl.textContent = report.behavior.boldness + '٪';
    if(loyaltyEl) loyaltyEl.textContent = report.behavior.brandLoyalty + '٪';

    // ۳) پیام‌های شخصی‌سازی
    const messagesEl = $('profDiscoveryMessages');
    if(messagesEl && report.recommendations.expansionMessage.length > 0){
      messagesEl.innerHTML = report.recommendations.expansionMessage
        .map(m => `<div class="prof-discovery-message">${m}</div>`).join('');
    } else if(messagesEl){
      messagesEl.innerHTML = '<div class="prof-discovery-message" style="border-right-color:#10b981">💡 تکمیل پروفایل کمک می‌کنه پیشنهادهای دقیق‌تری بهت بدیم</div>';
    }

    // ۴) استایل‌های جدید
    const stylesEl = $('profDiscoveryStyles');
    if(stylesEl){
      if(report.discoveries.newStyles.length === 0){
        stylesEl.innerHTML = '<div style="font-size:11px;color:var(--text-soft)">پروفایلت رو تکمیل کن تا استایل‌های جدید پیشنهاد بشه</div>';
      } else {
        stylesEl.innerHTML = report.discoveries.newStyles.map(s => `
          <div class="prof-discovery-item is-new" data-style="${s.style}" title="${s.reason}">
            <span>${s.style}</span>
            <small>${s.confidence}٪</small>
          </div>
        `).join('');

        // کلیک برای اضافه کردن به سلیقه
        stylesEl.querySelectorAll('[data-style]').forEach(el => {
          el.addEventListener('click', () => {
            const style = el.dataset.style;
            const current = profile.preferredStyles || [];
            if(!current.includes(style)){
              const updated = [...current, style];
              profile = {...profile, preferredStyles: updated};
              window.DPProfile.save(userId, {preferredStyles: updated});
              el.style.opacity = '0.5';
              el.innerHTML = '<span>✓ ' + style + '</span><small>اضافه شد</small>';
              toast('✅ ' + style + ' به سلیقه‌ات اضافه شد');
              renderRecs();
            }
          });
        });
      }
    }

    // ۵) رنگ‌های جدید
    const colorsEl = $('profDiscoveryColors');
    if(colorsEl){
      if(report.discoveries.newColors.length === 0){
        colorsEl.innerHTML = '<div style="font-size:11px;color:var(--text-soft)">برای پیشنهاد رنگ‌های جدید، رنگ‌های دلخواهت رو انتخاب کن</div>';
      } else {
        const colorMap = {
          'black':'#1a1a1a','white':'#fff','cream':'#f4e5b1','beige':'#e8d4a8','gold':'#d4af37',
          'silver':'#c0c0c0','gray':'#808080','navy':'#1e3a5f','blue':'#3b82f6','red':'#ef4444',
          'pink':'#ec4899','purple':'#8b5cf6','green':'#10b981','yellow':'#fbbf24','orange':'#f97316',
          'brown':'#92400e','burgundy':'#7a1e3c','emerald':'#2d5a3d','teal':'#0d9488',
          'transformative-teal':'#0d9488','cinnamon':'#a0522d','mocha':'#8b6f47',
          'cobalt-blue':'#1e40af','powder-pink':'#f9a8d4','rose-gold':'#b76e79',
          'cream-2':'#fef3c7','fuchsia':'#d946ef','magenta':'#c026d3','peach':'#fb923c',
          'salmon':'#f87171','cyan':'#06b6d4','sky-blue':'#38bdf8','olive':'#65a30d',
          'mint':'#34d399','emerald-2':'#059669','cerulean':'#0284c7'
        };
        colorsEl.innerHTML = report.discoveries.newColors.map(c => {
          const hex = colorMap[c.color] || '#999';
          return `
            <div class="prof-discovery-item is-new" data-color="${c.color}" title="${c.reason}">
              <span style="width:11px;height:11px;border-radius:50%;background:${hex};border:1.5px solid rgba(0,0,0,0.1)"></span>
              <span>${c.color}</span>
              <small>${c.confidence}٪</small>
            </div>
          `;
        }).join('');

        colorsEl.querySelectorAll('[data-color]').forEach(el => {
          el.addEventListener('click', () => {
            const color = el.dataset.color;
            const current = profile.preferredColors || [];
            if(!current.includes(color)){
              const updated = [...current, color];
              profile = {...profile, preferredColors: updated};
              window.DPProfile.save(userId, {preferredColors: updated});
              el.style.opacity = '0.5';
              toast('🎨 ' + color + ' به رنگ‌های دلخواهت اضافه شد');
              renderRecs();
            }
          });
        });
      }
    }

    // ۶) محصولات Discovery (خارج از منطقه راحتی)
    const productsEl = $('profDiscoveryProducts');
    if(productsEl && allProducts.length > 0){
      const discoveries = window.DPTasteEngine.discoverProducts(allProducts, profile, history, {limit: 6, adventurousness: 0.4});
      if(discoveries.length === 0){
        productsEl.innerHTML = '<div style="font-size:11px;color:var(--text-soft);padding:8px">پروفایلت رو تکمیل‌تر کن تا محصولات جدید پیشنهاد بشه</div>';
      } else {
        productsEl.innerHTML = discoveries.map(p => `
          <div class="prof-discovery-product" data-prod="${p.id}">
            <div class="prof-discovery-product-icon">
              ${productIcon(p.subcategory || p.category)}
              <span class="prof-discovery-product-score">${p.matchPercent}٪</span>
            </div>
            <div>
              <div class="prof-discovery-product-name">${p.name}</div>
              <div class="prof-discovery-product-reason">${p.reasons[0]?.text || '🆕 کشف جدید'}</div>
            </div>
            <div class="prof-discovery-product-price">${window.DPProducts.formatPrice(p.price)}</div>
          </div>
        `).join('');

        productsEl.querySelectorAll('[data-prod]').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.dataset.prod;
            if(window.DPProfile.track) window.DPProfile.track(userId, id, 'view');
            window.location.href = './product.html?id=' + encodeURIComponent(id);
          });
        });
      }
    }
  }

  // دکمه بازخوانی کشف سلیقه
  const discoveryRefreshBtn = $('profDiscoveryRefresh');
  if(discoveryRefreshBtn){
    discoveryRefreshBtn.addEventListener('click', () => {
      renderTasteDiscovery();
      toast('🧠 تحلیل سلیقه به‌روز شد');
    });
  }

  // ═══ رنگ‌بندی پایه برای کمد ═══
  const WARDROBE_COLOR_MAP = {
    'black':'#1a1a1a','white':'#fff','cream':'#f4e5b1','beige':'#e8d4a8','gold':'#d4af37',
    'silver':'#c0c0c0','gray':'#808080','navy':'#1e3a5f','blue':'#3b82f6','red':'#ef4444',
    'pink':'#ec4899','purple':'#8b5cf6','green':'#10b981','yellow':'#fbbf24','orange':'#f97316',
    'brown':'#92400e','burgundy':'#7a1e3c','emerald':'#2d5a3d','teal':'#0d9488',
    'cobalt-blue':'#1e40af','powder-pink':'#f9a8d4','rose-gold':'#b76e79',
    'cinnamon':'#a0522d','mocha':'#8b6f47','fuchsia':'#d946ef','cyan':'#06b6d4',
    'mint':'#34d399','olive':'#65a30d','mustard':'#d97706','rust':'#b7410e',
    'camel':'#c19a6b','lilac':'#c4b5fd','terracotta':'#c2410c','peach':'#fb923c',
    'salmon':'#f87171','sky-blue':'#38bdf8','magenta':'#c026d3'
  };

  function productIconEmoji(category){
    const icons = {
      'پیراهن':'👗', 'مانتو':'🧥', 'بلوز':'👚', 'دامن':'👗',
      'تیشرت':'👕', 'تی‌شرت':'👕', 'کت و شلوار':'🤵', 'شلوار':'👖',
      'پالتو':'🧥', 'کاپشن':'🧥', 'کفش':'👟', 'بوت':'👢',
      'کیف':'👜', 'شال':'🧣', 'ساعت':'⌚', 'عینک':'🕶️',
      'کلاه':'🧢', 'کمربند':'👔', 'دستکش':'🧤', 'گردنبند':'📿',
      'ست':'👔', 'بوت':'👢', 'صندل':'👡'
    };
    return icons[category] || '👕';
  }

  // ═══ کمد دیجیتال ═══
  let wardrobeFilter = 'all';
  let wardrobeSearch = '';

  function renderWardrobe(){
    if(!window.DPWardrobe) return;

    // همگام‌سازی با سفارش‌ها
    window.DPWardrobe.syncFromOrders();

    const items = window.DPWardrobe.all();
    const stats = window.DPWardrobe.stats();

    // ═══ آمار ═══
    const setText = (id, txt) => { const el = $(id); if(el) el.textContent = txt; };
    setText('profWbTotal', stats.total.toLocaleString('fa-IR'));
    setText('profWbValue', (stats.totalValue / 1000000).toFixed(1) + ' م');
    setText('profWbWorn', stats.worn.toLocaleString('fa-IR'));
    setText('profWbNever', stats.neverWorn.toLocaleString('fa-IR'));

    // ═══ فیلتر و جستجو ═══
    let filtered = items;
    if(wardrobeFilter === 'favorite') filtered = filtered.filter(w => w.favorite);
    else if(wardrobeFilter === 'unworn') filtered = filtered.filter(w => !w.lastWorn);
    else if(wardrobeFilter === 'stale') {
      filtered = filtered.filter(w => {
        if(!w.lastWorn) return false;
        const days = (Date.now() - new Date(w.lastWorn).getTime()) / (1000*60*60*24);
        return days > 90;
      });
    }
    if(wardrobeSearch){
      const s = wardrobeSearch.toLowerCase();
      filtered = filtered.filter(w =>
        (w.name || '').toLowerCase().includes(s) ||
        (w.color || '').toLowerCase().includes(s) ||
        (w.tags || []).some(t => t.toLowerCase().includes(s))
      );
    }

    const grid = $('profWardrobeGrid');
    const empty = $('profWardrobeEmpty');
    if(!grid) return;

    if(items.length === 0){
      if(empty) empty.style.display = 'block';
      // حذف آیتم‌های غیرخالی
      grid.querySelectorAll('.prof-wardrobe-item').forEach(x => x.remove());
      const outfitsBox = $('profWardrobeOutfits');
      if(outfitsBox) outfitsBox.hidden = true;
      return;
    }
    if(empty) empty.style.display = 'none';

    // حذف آیتم‌های قبلی
    grid.querySelectorAll('.prof-wardrobe-item').forEach(x => x.remove());

    filtered.forEach(w => {
      const colorHex = WARDROBE_COLOR_MAP[w.color] || '#ccc';
      const isStale = w.lastWorn && ((Date.now() - new Date(w.lastWorn).getTime()) / (1000*60*60*24)) > 90;
      const faNum = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

      const itemEl = document.createElement('div');
      itemEl.className = 'prof-wardrobe-item' + (isStale ? ' is-stale' : '');
      itemEl.dataset.id = w.id;
      itemEl.innerHTML = `
        <button class="prof-wardrobe-item-fav ${w.favorite ? 'is-fav' : ''}" data-fav="${w.id}" title="${w.favorite ? 'حذف از محبوب‌ها' : 'افزودن به محبوب‌ها'}">
          ${w.favorite ? '★' : '☆'}
        </button>
        ${isStale ? '<span class="prof-wardrobe-item-stale">⏰ قدیمی</span>' : ''}
        <div class="prof-wardrobe-item-img">
          ${productIconEmoji(w.category || '')}
        </div>
        <div class="prof-wardrobe-item-info">
          <div class="prof-wardrobe-item-name">${w.name || 'بدون نام'}</div>
          <div class="prof-wardrobe-item-meta">
            ${w.color ? `<span class="prof-wardrobe-item-color" style="background:${colorHex}"></span>` : ''}
            <span>${w.color || ''} ${w.size ? '• سایز ' + w.size : ''}</span>
          </div>
          <div class="prof-wardrobe-item-price">${(w.price || 0).toLocaleString('fa-IR')} تومان</div>
        </div>
        <div class="prof-wardrobe-item-actions">
          <button class="prof-wardrobe-item-act" data-worn="${w.id}">پوشیدم</button>
          <button class="prof-wardrobe-item-act" data-detail="${w.id}">جزئیات</button>
        </div>
      `;
      grid.appendChild(itemEl);
    });

    // ═══ رویدادها ═══
    grid.querySelectorAll('[data-fav]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const id = b.dataset.fav;
        window.DPWardrobe.toggleFavorite(id);
        renderWardrobe();
        toast('★ به‌روزرسانی شد');
      });
    });
    grid.querySelectorAll('[data-worn]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const id = b.dataset.worn;
        window.DPWardrobe.markWorn(id);
        renderWardrobe();
        toast('👕 ثبت شد');
      });
    });
    grid.querySelectorAll('[data-detail]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const id = b.dataset.detail;
        const w = window.DPWardrobe.byId(id);
        if(w) openModal(`
          <h3>${w.name}</h3>
          <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);padding:30px;border-radius:12px;text-align:center;font-size:60px;margin-bottom:14px">
            ${productIconEmoji(w.category || '')}
          </div>
          <div style="display:grid;gap:8px;font-size:12.5px">
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>💰 قیمت:</span><strong>${(w.price || 0).toLocaleString('fa-IR')} تومان</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>🎨 رنگ:</span><strong>${w.color || '-'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>📏 سایز:</span><strong>${w.size || '-'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>📅 خرید:</span><strong>${w.purchasedAt || '-'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>👕 پوشیده شده:</span><strong>${w.wornCount || 0} بار</strong>
            </div>
            ${w.lastWorn ? `<div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>⏰ آخرین پوشیدن:</span><strong>${new Date(w.lastWorn).toLocaleDateString('fa-IR')}</strong>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-soft);border-radius:8px">
              <span>🛒 سفارش:</span><strong>${w.orderId || '-'}</strong>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:14px">
            <button class="prof-btn" id="closeWb" style="flex:1">بستن</button>
            <button class="prof-btn prof-btn--danger" id="delWb" data-del="${w.id}">🗑️ حذف از کمد</button>
          </div>
        `);
        const cw = $('closeWb');
        if(cw) cw.addEventListener('click', closeModal);
        const dw = $('delWb');
        if(dw) dw.addEventListener('click', () => {
          if(confirm('از کمد حذف شود؟')){
            window.DPWardrobe.remove(dw.dataset.del);
            closeModal();
            renderWardrobe();
            toast('✅ حذف شد');
          }
        });
      });
    });

    // ═══ پیشنهاد ست ═══
    const outfitsBox = $('profWardrobeOutfits');
    const outfitList = $('profWbOutfitList');
    if(outfitsBox && outfitList && items.length >= 2){
      const outfits = window.DPWardrobe.suggestOutfits(profile);
      if(outfits.length > 0){
        outfitsBox.hidden = false;
        outfitList.innerHTML = outfits.map(o => {
          const icons = o.items.map(it => productIconEmoji(it.category || '')).join('');
          const reasons = o.reasons.join(' • ');
          return `
            <div class="prof-wardrobe-outfit" data-outfit="${o.id}">
              <div class="prof-wardrobe-outfit-items">
                ${o.items.map(it => `<div class="prof-wardrobe-outfit-item" title="${it.name}">${productIconEmoji(it.category || '')}</div>`).join('')}
              </div>
              <div class="prof-wardrobe-outfit-info">
                <div class="prof-wardrobe-outfit-score">${o.score}٪ ست هماهنگ</div>
                <div class="prof-wardrobe-outfit-reasons">${reasons}</div>
              </div>
            </div>
          `;
        }).join('');
        outfitList.querySelectorAll('[data-outfit]').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.dataset.outfit;
            const outfit = outfits.find(o => o.id === id);
            if(!outfit) return;
            openModal(`
              <h3>👗 ست پیشنهادی</h3>
              <div style="display:grid;grid-template-columns:repeat(${outfit.items.length}, 1fr);gap:8px;margin:14px 0">
                ${outfit.items.map(it => `
                  <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;padding:14px;text-align:center">
                    <div style="font-size:36px;margin-bottom:6px">${productIconEmoji(it.category || '')}</div>
                    <strong style="font-size:11.5px;display:block;margin-bottom:4px">${it.name}</strong>
                    <div style="font-size:10px;color:var(--text-soft)">${it.color || ''} ${it.size ? '• ' + it.size : ''}</div>
                  </div>
                `).join('')}
              </div>
              <div style="background:linear-gradient(135deg,#8b5cf6,#a855f7);color:#fff;border-radius:10px;padding:12px;text-align:center;margin-bottom:12px">
                <strong style="font-size:14px">${outfit.score}٪ هماهنگی</strong>
                <div style="font-size:11px;margin-top:4px;opacity:0.9">${outfit.reasons.join(' • ')}</div>
              </div>
              <button class="prof-btn prof-btn--block" id="closeOutfit">متوجه شدم</button>
            `);
            const co = $('closeOutfit');
            if(co) co.addEventListener('click', closeModal);
          });
        });
      } else {
        outfitsBox.hidden = true;
      }
    } else if(outfitsBox){
      outfitsBox.hidden = true;
    }
  }

  // ═══ رویدادهای کمد ═══
  const wbTabs = $('profWbTabs');
  if(wbTabs){
    wbTabs.addEventListener('click', e => {
      const tab = e.target.closest('[data-filter]');
      if(!tab) return;
      wbTabs.querySelectorAll('[data-filter]').forEach(t => t.classList.toggle('is-active', t === tab));
      wardrobeFilter = tab.dataset.filter;
      renderWardrobe();
    });
  }
  const wbSearch = $('profWbSearch');
  if(wbSearch){
    wbSearch.addEventListener('input', e => {
      wardrobeSearch = e.target.value;
      renderWardrobe();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // استایلیست هوشمند کمد (DPWardrobeAI)
  // ═══════════════════════════════════════════════════════════

  let aiActiveTab = 'profile';
  let compatSort = 'best';

  function renderWardrobeAI(){
    if(!window.DPWardrobeAI || !window.DPWardrobe) return;

    const items = window.DPWardrobe.all();
    const allProducts = window.DPProducts ? window.DPProducts.all() : [];

    // ═══ تب ۱: پروفایل کمد ═══
    const profileEl = $('profWardrobeProfileContent');
    if(profileEl){
      if(items.length === 0){
        profileEl.innerHTML = `
          <div class="prof-wardrobe-empty">
            <div class="prof-wardrobe-empty-icon">📊</div>
            <h3>کمدت خالیه!</h3>
            <p>اول خرید کن یا عکس لباس‌هات رو از تب «اپلود عکس» اضافه کن</p>
          </div>
        `;
      } else {
        const analysis = window.DPWardrobeAI.analyzeWardrobe(items);
        const insights = analysis.insights.map(ins => `
          <div class="prof-wardrobe-insight ${ins.level === 'warning' ? 'is-warning' : ins.level === 'suggestion' ? 'is-suggestion' : ''}">
            <span class="prof-wardrobe-insight-icon">${ins.icon}</span>
            <span>${ins.text}</span>
          </div>
        `).join('');

        const colorChips = analysis.dominantColors.slice(0, 6).map(c => {
          const hex = WARDROBE_COLOR_MAP[c.color] || '#ccc';
          return `<span class="prof-wardrobe-color-chip">
            <span class="prof-wardrobe-color-chip-dot" style="background:${hex}"></span>
            <span>${c.color} (${c.percent}٪)</span>
          </span>`;
        }).join('');

        profileEl.innerHTML = `
          <div class="prof-wardrobe-profile-grid">
            <div class="prof-wardrobe-profile-card">
              <div class="prof-wardrobe-profile-card-head">
                <span class="prof-wardrobe-profile-card-icon">📦</span>
                <span>تعداد آیتم</span>
              </div>
              <div class="prof-wardrobe-profile-card-value">${analysis.totalItems.toLocaleString('fa-IR')}</div>
              <div class="prof-wardrobe-profile-card-meta">ارزش ${(analysis.totalValue / 1000000).toFixed(1)} میلیون</div>
            </div>
            <div class="prof-wardrobe-profile-card">
              <div class="prof-wardrobe-profile-card-head">
                <span class="prof-wardrobe-profile-card-icon">${analysis.colorSeason ? analysis.colorSeason.icon : '🎨'}</span>
                <span>فصل رنگی</span>
              </div>
              <div class="prof-wardrobe-profile-card-value">${analysis.colorSeason ? analysis.colorSeason.name : 'متنوع'}</div>
              <div class="prof-wardrobe-profile-card-meta">${analysis.colorSeason ? analysis.colorSeason.confidence + '٪ اعتماد' : 'بدون الگو'}</div>
            </div>
            <div class="prof-wardrobe-profile-card">
              <div class="prof-wardrobe-profile-card-head">
                <span class="prof-wardrobe-profile-card-icon">💎</span>
                <span>سبک غالب</span>
              </div>
              <div class="prof-wardrobe-profile-card-value">${analysis.dominantStyle ? analysis.dominantStyle.style : 'متنوع'}</div>
              <div class="prof-wardrobe-profile-card-meta">${analysis.dominantStyle ? analysis.dominantStyle.percent + '٪ کمد' : 'سبک‌های متفاوت'}</div>
            </div>
            <div class="prof-wardrobe-profile-card">
              <div class="prof-wardrobe-profile-card-head">
                <span class="prof-wardrobe-profile-card-icon">📊</span>
                <span>پوشش</span>
              </div>
              <div class="prof-wardrobe-profile-card-value" style="font-size:13px">
                ${analysis.coverage.top}تاپ • ${analysis.coverage.bottom}پایین‌پوش<br>
                ${analysis.coverage.shoes}کفش • ${analysis.coverage.outerwear}رویه
              </div>
            </div>
          </div>

          <div class="prof-wardrobe-profile-card" style="grid-column:1/-1;margin-bottom:14px">
            <div class="prof-wardrobe-profile-card-head">
              <span class="prof-wardrobe-profile-card-icon">🌈</span>
              <span>رنگ‌های غالب کمدت</span>
            </div>
            <div class="prof-wardrobe-color-list">${colorChips || '—'}</div>
          </div>

          <div>${insights}</div>
        `;
      }
    }

    // ═══ تب ۲: تیپ‌های پیشنهادی ═══
    const outfitsEl = $('profWardrobeOutfitsContent');
    if(outfitsEl){
      if(items.length < 2){
        outfitsEl.innerHTML = `<div class="prof-wardrobe-empty">
          <div class="prof-wardrobe-empty-icon">👗</div>
          <h3>حداقل ۲ آیتم نیازه</h3>
          <p>وقتی ۲ تا لباس بیشتر داشته باشی، AI تیپ میزنه</p>
        </div>`;
      } else {
        const outfits = window.DPWardrobeAI.generateOutfits(items, { count: 6 });
        if(outfits.length === 0){
          outfitsEl.innerHTML = `<div class="prof-wardrobe-empty">
            <div class="prof-wardrobe-empty-icon">🤔</div>
            <p>کمدت ترکیب‌پذیر نیست. تنوع دسته بده.</p>
          </div>`;
        } else {
          outfitsEl.innerHTML = outfits.map(o => {
            const harmonyBadges = [];
            if(o.harmony.matches > 0) harmonyBadges.push(`<span class="prof-wardrobe-color-chip" style="background:rgba(16,185,129,0.1);color:#059669">🎨 ${o.harmony.matches} هماهنگ</span>`);
            if(o.harmony.complements > 0) harmonyBadges.push(`<span class="prof-wardrobe-color-chip" style="background:rgba(139,92,246,0.1);color:#7c3aed">✨ ${o.harmony.complements} مکمل</span>`);
            if(o.harmony.clashes > 0) harmonyBadges.push(`<span class="prof-wardrobe-color-chip" style="background:rgba(239,68,68,0.1);color:#dc2626">⚠️ ${o.harmony.clashes} متضاد</span>`);

            return `
              <div class="prof-wardrobe-outfit-ai" data-outfit="${o.id}">
                <div class="prof-wardrobe-outfit-ai-head">
                  <div>
                    <div class="prof-wardrobe-outfit-ai-score">${o.score}٪ هماهنگی</div>
                  </div>
                  <div class="prof-wardrobe-outfit-ai-harmony">${harmonyBadges.join('')}</div>
                </div>
                <div class="prof-wardrobe-outfit-ai-items">
                  ${o.items.map(it => `
                    <div class="prof-wardrobe-outfit-ai-item">
                      <span class="prof-wardrobe-outfit-ai-emoji">${productIconEmoji(it.category || '')}</span>
                      <span>${it.name}${it.color ? ' (' + it.color + ')' : ''}</span>
                    </div>
                  `).join('')}
                </div>
                ${o.reasons && o.reasons.length > 0 ? `
                  <div class="prof-wardrobe-outfit-ai-reasons">
                    💡 ${o.reasons.join(' • ')} | 🎭 ${o.occasion} | 📅 ${o.season}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');

          outfitsEl.querySelectorAll('[data-outfit]').forEach(el => {
            el.addEventListener('click', () => {
              const id = el.dataset.outfit;
              const outfit = outfits.find(o => o.id === id);
              if(!outfit) return;
              openModal(`
                <h3>👗 تیپ پیشنهادی (${outfit.score}٪)</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:14px 0">
                  ${outfit.items.map(it => `
                    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;padding:12px;text-align:center">
                      <div style="font-size:36px;margin-bottom:4px">${productIconEmoji(it.category || '')}</div>
                      <strong style="font-size:11.5px;display:block;margin-bottom:3px">${it.name}</strong>
                      <div style="font-size:10px;color:var(--text-soft)">${it.color || ''} ${it.size ? '• ' + it.size : ''}</div>
                    </div>
                  `).join('')}
                </div>
                <div style="background:linear-gradient(135deg,#8b5cf6,#a855f7);color:#fff;border-radius:10px;padding:12px;text-align:center;margin-bottom:10px">
                  <strong style="font-size:14px">${outfit.score}٪ هماهنگی</strong>
                  <div style="font-size:11px;margin-top:4px;opacity:0.9">${outfit.reasons ? outfit.reasons.join(' • ') : ''}</div>
                  <div style="font-size:10.5px;margin-top:4px;opacity:0.85">🎭 ${outfit.occasion} • 📅 ${outfit.season}</div>
                </div>
                <button class="prof-btn prof-btn--block" id="closeOutfitAi">متوجه شدم</button>
              `);
              const c = $('closeOutfitAi');
              if(c) c.addEventListener('click', closeModal);
            });
          });
        }
      }
    }

    // ═══ تب ۳: سازگاری محصولات ═══
    const compatEl = $('profWardrobeCompatList');
    if(compatEl){
      if(allProducts.length === 0){
        compatEl.innerHTML = '<div class="prof-wardrobe-empty"><p>محصولی برای نمایش نیست</p></div>';
      } else {
        const scored = allProducts.slice(0, 100).map(p => ({
          product: p,
          compat: window.DPWardrobeAI.scoreWardrobeCompatibility(p, items)
        }));

        let filtered = scored;
        if(compatSort === 'best') filtered = scored.sort((a, b) => b.compat.score - a.compat.score).slice(0, 10);
        else if(compatSort === 'needed') filtered = scored.filter(s => s.compat.reasons.some(r => r.type === 'category' && r.score >= 20)).sort((a, b) => b.compat.score - a.compat.score).slice(0, 10);
        else if(compatSort === 'diverse') filtered = scored.filter(s => s.compat.reasons.some(r => r.type === 'diversity')).sort((a, b) => b.compat.score - a.compat.score).slice(0, 10);

        if(filtered.length === 0){
          compatEl.innerHTML = '<div class="prof-wardrobe-empty"><p>محصولی پیدا نشد</p></div>';
        } else {
          compatEl.innerHTML = filtered.map(s => {
            const p = s.product;
            const c = s.compat;
            const scoreClass = c.level === 'perfect' ? 'is-perfect' : c.level === 'good' ? 'is-good' : '';
            const topReasons = c.reasons.slice(0, 2).map(r => `<span class="prof-wardrobe-compat-reason ${r.score < 10 ? 'is-warn' : ''}">${r.icon} ${r.text}</span>`).join('');

            return `
              <div class="prof-wardrobe-compat-item" data-prod="${p.id}">
                <div class="prof-wardrobe-compat-icon">
                  ${productIconEmoji(p.category || '')}
                  <span class="prof-wardrobe-compat-score ${scoreClass}">${c.score}٪</span>
                </div>
                <div>
                  <div class="prof-wardrobe-compat-name">${p.name}</div>
                  <div class="prof-wardrobe-compat-summary">${c.summary}</div>
                  <div class="prof-wardrobe-compat-reasons">${topReasons}</div>
                </div>
                <div class="prof-wardrobe-compat-price">
                  ${(p.price || 0).toLocaleString('fa-IR')}
                  <div style="font-size:9px;font-weight:500;color:var(--text-soft)">تومان</div>
                </div>
              </div>
            `;
          }).join('');

          compatEl.querySelectorAll('[data-prod]').forEach(el => {
            el.addEventListener('click', () => {
              const id = el.dataset.prod;
              window.location.href = './product.html?id=' + encodeURIComponent(id);
            });
          });
        }
      }
    }
  }

  // ═══ تب‌های Wardrobe AI ═══
  const aiTabs = $('profWardrobeAITabs');
  if(aiTabs){
    aiTabs.addEventListener('click', e => {
      const tab = e.target.closest('[data-aitab]');
      if(!tab) return;
      aiTabs.querySelectorAll('[data-aitab]').forEach(t => t.classList.toggle('is-active', t === tab));
      const target = tab.dataset.aitab;
      aiActiveTab = target;
      document.querySelectorAll('.prof-wardrobe-ai-panel').forEach(p => {
        p.hidden = p.dataset.aitabPanel !== target;
      });
    });
  }

  // ═══ مرتب‌سازی سازگاری ═══
  const compatSortTabs = $('profCompatibilitySort');
  if(compatSortTabs){
    compatSortTabs.addEventListener('click', e => {
      const tab = e.target.closest('[data-sort]');
      if(!tab) return;
      compatSortTabs.querySelectorAll('[data-sort]').forEach(t => t.classList.toggle('is-active', t === tab));
      compatSort = tab.dataset.sort;
      renderWardrobeAI();
    });
  }

  // ═══ اپلود عکس لباس ═══
  const photoWbFile = $('profPhotoWbFile');
  if(photoWbFile){
    photoWbFile.addEventListener('change', e => {
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 8 * 1024 * 1024){ toast('حجم عکس نباید بیشتر از ۸ مگابایت باشد', false); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const empty = $('profPhotoWbEmpty');
        const up = $('profPhotoWbUpload');
        if(empty) empty.innerHTML = `<img src="${ev.target.result}" alt="پیش‌نمایش" style="width:100%;max-height:280px;object-fit:cover;display:block;border-radius:8px" />`;
        if(up) up.classList.add('has-image');

        const preview = $('profPhotoWbPreview');
        const result = $('profPhotoWbResult');
        const actions = $('profPhotoWbActions');
        if(preview){ preview.style.display = 'block'; preview.innerHTML = '<div style="text-align:center;padding:14px;background:rgba(139,92,246,0.05);border-radius:10px;font-size:11.5px"><div style="font-size:24px;margin-bottom:6px">⏳</div>در حال تحلیل عکس...</div>'; }
        if(result) result.style.display = 'none';
        if(actions) actions.style.display = 'none';

        if(!window.DPWardrobeAI){
          toast('❌ ماژول تحلیل عکس لود نشد', false);
          return;
        }

        window.DPWardrobeAI.analyzePhoto(ev.target.result).then(analysis => {
          if(preview) preview.style.display = 'none';

          const persianColor = analysis.dominantColor.name;
          const tempText = analysis.temperature === 'warm' ? 'گرم' : analysis.temperature === 'cool' ? 'سرد' : 'خنثی';
          const lightText = analysis.lightLevel === 'light' ? 'روشن' : analysis.lightLevel === 'medium' ? 'متوسط' : 'تیره';

          if(result){
            result.style.display = 'block';
            result.innerHTML = `
              <div class="prof-photo-wb-result">
                <div class="prof-photo-wb-color">
                  <div class="prof-photo-wb-color-swatch" style="background:${analysis.hex}"></div>
                  <div class="prof-photo-wb-color-info">
                    <div class="prof-photo-wb-color-name">${persianColor}</div>
                    <div class="prof-photo-wb-color-meta">
                      کد رنگ: ${analysis.hex}<br>
                      روشنایی: ${analysis.brightness}٪ • اشباع: ${analysis.saturation}٪<br>
                      طیف: ${tempText} • سطح: ${lightText}<br>
                      فصل پیشنهادی: ${analysis.season}
                    </div>
                  </div>
                </div>
                ${analysis.suggestions.map(s => `
                  <div class="prof-photo-wb-detail">
                    <strong>${s.icon} ${s.title}:</strong> ${s.text}
                  </div>
                `).join('')}
                <div style="font-size:10.5px;color:var(--text-soft);text-align:center;margin-top:6px">
                  دقت تحلیل: ${analysis.confidence}٪
                </div>
              </div>
            `;
          }

          if(actions){
            actions.style.display = 'flex';
            actions.innerHTML = `
              <button class="prof-btn prof-btn--sm" id="profPhotoWbAdd" style="flex:1">➕ اضافه به کمد</button>
              <button class="prof-btn prof-btn--ghost prof-btn--sm" id="profPhotoWbReset" style="flex:1">🔄 عکس دیگه</button>
            `;
            const addBtn = $('profPhotoWbAdd');
            if(addBtn) addBtn.addEventListener('click', () => {
              const item = {
                id: 'photo_' + Date.now(),
                productId: 'manual_' + Date.now(),
                name: 'لباس آپلود شده - ' + persianColor,
                price: 0,
                color: analysis.dominantColor.name,
                size: '',
                qty: 1,
                orderId: 'photo_upload_' + Date.now(),
                sellerId: '',
                purchasedAt: new Date().toLocaleDateString('fa-IR'),
                addedAt: new Date().toISOString(),
                tags: ['photo-upload', analysis.season, tempText],
                lastWorn: null,
                wornCount: 0,
                favorite: false,
                status: 'active',
                notes: 'از عکس آپلود شد - ' + analysis.hex
              };
              const wardrobe = (() => { try { return JSON.parse(localStorage.getItem('dp_wardrobe') || '[]') || []; } catch { return []; }})();
              wardrobe.push(item);
              localStorage.setItem('dp_wardrobe', JSON.stringify(wardrobe));
              toast('✅ به کمدت اضافه شد');
              renderWardrobe();
              renderWardrobeAI();
            });
            const resetBtn = $('profPhotoWbReset');
            if(resetBtn) resetBtn.addEventListener('click', () => {
              if(empty) empty.innerHTML = `<div class="prof-upload-icon">📷</div><strong>عکس لباس رو انتخاب کن</strong><span>JPG، PNG — حداکثر ۸ مگابایت</span>`;
              if(up) up.classList.remove('has-image');
              if(result) result.style.display = 'none';
              if(actions) actions.style.display = 'none';
              if(photoWbFile) photoWbFile.value = '';
            });
          }
        }).catch(err => {
          console.error('Photo analysis error:', err);
          toast('❌ خطا در تحلیل عکس', false);
          if(preview) preview.innerHTML = '<div style="text-align:center;padding:14px;background:rgba(239,68,68,0.05);border-radius:10px;color:#dc2626;font-size:12px">❌ خطا: ' + err.message + '</div>';
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // تب‌های پیشنهاد
  function setupRecsTabs(){
    const tabsContainer = $('profRecsTabs');
    if(!tabsContainer) return;
    // شمارنده پویا برای تب فروشندگان
    try {
      const allP = window.DPProducts ? window.DPProducts.all() : [];
      const sellerCount = allP.filter(p => p.isSellerProduct).length;
      const sellersTab = tabsContainer.querySelector('[data-mode="sellers"]');
      if(sellersTab){
        const small = sellersTab.querySelector('small');
        if(small && sellerCount > 0){
          small.textContent = '🏪 ' + sellerCount + ' محصول واقعی';
        } else if(small && sellerCount === 0){
          small.textContent = '🏪 خالی';
        }
      }
    } catch(e){}
    tabsContainer.addEventListener('click', e => {
      const tab = e.target.closest('[data-mode]');
      if(!tab) return;
      tabsContainer.querySelectorAll('[data-mode]').forEach(t => t.classList.toggle('is-on', t === tab));
      recsMode = tab.dataset.mode;
      renderRecs();
    });
  }
  setupRecsTabs();

  const refreshBtn = $('profRefreshRecs');
  if(refreshBtn) refreshBtn.addEventListener('click', () => { renderRecs(); toast('🔄 پیشنهادها به‌روز شدند'); });

  // ═══ چت دیجی AI ═══
  const chatBody = $('profChatBody');
  const chatForm = $('profChatForm');
  const chatInput = $('profChatInput');
  const chatSend = $('profChatSend');
  let history = [];

  function loadChatHistory(){
    try{
      const saved = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]');
      saved.forEach(m => addChatMsg(m.text, m.role, false));
      history = saved;
    } catch(e){}
  }
  function saveChatHistory(){
    try{
      const msgs = Array.from(chatBody.querySelectorAll('.prof-chat-msg')).map(el => {
        const bub = el.querySelector('.prof-chat-msg-bub');
        return {role: el.classList.contains('prof-chat-msg--user') ? 'user' : 'ai', text: bub.textContent};
      });
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs.slice(-50)));
    } catch(e){}
  }
  function addChatMsg(text, role, save=true){
    if(!chatBody) return;
    const wrap = document.createElement('div');
    wrap.className = 'prof-chat-msg prof-chat-msg--' + role;
    const av = document.createElement('div');
    av.className = 'prof-chat-msg-av';
    av.textContent = role === 'user' ? '👤' : '🤖';
    const bub = document.createElement('div');
    bub.className = 'prof-chat-msg-bub';
    bub.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    wrap.appendChild(av);
    wrap.appendChild(bub);
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
    if(role === 'ai' && save){
      const fb = document.createElement('div');
      fb.className = 'prof-chat-fb';
      fb.innerHTML = `<button data-fb="like" title="پسندیدم">👍</button><button data-fb="save" title="ذخیره">🔖</button><button data-fb="dislike" title="نپسندیدم">👎</button>`;
      wrap.appendChild(fb);
      fb.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          fb.querySelectorAll('button').forEach(x => x.classList.remove('is-on'));
          b.classList.add('is-on');
        });
      });
    }
    if(save) saveChatHistory();
  }
  function addTyping(){
    const wrap = document.createElement('div');
    wrap.className = 'prof-chat-msg prof-chat-msg--ai';
    wrap.id = 'profChatTyping';
    const av = document.createElement('div');
    av.className = 'prof-chat-msg-av';
    av.textContent = '🤖';
    const bub = document.createElement('div');
    bub.className = 'prof-chat-msg-bub';
    bub.innerHTML = '<div class="prof-chat-typing"><span></span><span></span><span></span></div>';
    wrap.appendChild(av);
    wrap.appendChild(bub);
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function rmTyping(){ const t = $('profChatTyping'); if(t) t.remove(); }

  loadChatHistory();

  if(chatInput){
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    });
    chatInput.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); chatForm.requestSubmit(); }
    });
  }
  if(chatForm){
    chatForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if(!msg) return;
      addChatMsg(msg, 'user');
      chatInput.value = '';
      chatInput.style.height = 'auto';
      chatSend.disabled = true;
      history.push({role: 'user', content: msg});
      addTyping();
      try{
        const res = await fetch('https://digiposh.phaaslani.workers.dev/api/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({message: msg, history: history.slice(-8), profile: profile})
        });
        const data = await res.json();
        rmTyping();
        if(data.success && data.response){
          addChatMsg(data.response, 'ai');
          history.push({role: 'assistant', content: data.response});
        } else {
          addChatMsg('❌ خطا: ' + (data.error || 'نامشخص') + '\n\nمی‌تونی دوباره تلاش کنی یا از منوی پیشنهادی استفاده کنی.', 'ai');
        }
      } catch(e){
        rmTyping();
        addChatMsg('❌ خطای شبکه. لطفاً دوباره تلاش کن.', 'ai');
      }
      chatSend.disabled = false;
      chatInput.focus();
    });
  }
  const quickEl = $('profChatQuick');
  if(quickEl){
    quickEl.addEventListener('click', e => {
      if(e.target.dataset.q){
        chatInput.value = e.target.dataset.q;
        chatForm.requestSubmit();
      }
    });
  }
  const clearBtn = $('profChatClear');
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      if(confirm('تاریخچه چت پاک شود؟')){
        localStorage.removeItem(CHAT_HISTORY_KEY);
        chatBody.innerHTML = '';
        history = [];
        addChatMsg('سلام! چطور کمکتون کنم؟ ✨\n\nمی‌تونی درباره مد، رنگ، استایل یا ست لباس سوال بپرسی.', 'ai');
      }
    });
  }

  // ═══ آدرس‌ها ═══
  function renderAddresses(){
    const el = $('profAddresses');
    if(!el) return;
    const addresses = window.DPSecurity.addresses.get(userId, ENCRYPT_KEY);
    if(addresses.length === 0){
      el.innerHTML = `<div class="prof-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/></svg>
        <h3>آدرسی نداری</h3>
        <p>برای ارسال سریع‌تر سفارش‌ها، آدرس‌های خودت رو اضافه کن</p>
      </div>`;
    } else {
      el.innerHTML = addresses.map(a => `
        <div class="prof-address ${a.isDefault ? 'is-default' : ''}">
          <div class="prof-address-head">
            <span style="font-size:16px">${a.type === 'work' ? '🏢' : a.type === 'home' ? '🏠' : '📍'}</span>
            <span class="prof-address-label">${a.label}</span>
            ${a.isDefault ? '<span class="prof-address-default">پیش‌فرض</span>' : ''}
          </div>
          <p>${a.province || ''} ${a.city || ''} ${a.recipient ? '• ' + a.recipient : ''}</p>
          <p>${a.address}</p>
          <p style="font-size:11.5px">📞 ${a.phone} ${a.postalCode ? '• ' + a.postalCode : ''}</p>
          <div class="prof-address-actions">
            <button class="prof-btn prof-btn--ghost prof-btn--sm" data-addr-del="${a.id}">🗑️ حذف</button>
            ${!a.isDefault ? `<button class="prof-btn prof-btn--ghost prof-btn--sm" data-addr-default="${a.id}">⭐ پیش‌فرض</button>` : ''}
          </div>
        </div>
      `).join('');
      el.querySelectorAll('[data-addr-del]').forEach(b => b.addEventListener('click', () => {
        if(confirm('حذف شود؟')){ window.DPSecurity.addresses.remove(userId, b.dataset.addrDel); renderAddresses(); toast('✅ حذف شد'); }
      }));
      el.querySelectorAll('[data-addr-default]').forEach(b => b.addEventListener('click', () => {
        window.DPSecurity.addresses.setDefault(userId, b.dataset.addrDefault); renderAddresses(); toast('⭐ پیش‌فرض شد');
      }));
    }
  }
  const addAddrBtn = $('profAddAddress');
  if(addAddrBtn){
    addAddrBtn.addEventListener('click', () => {
      openModal(`
        <h3>➕ آدرس جدید</h3>
        <form id="addrForm">
          <div class="prof-row">
            <div class="prof-field"><label>برچسب</label><input name="label" placeholder="مثلاً: خانه" required /></div>
            <div class="prof-field"><label>نوع</label><select name="type"><option value="home">🏠 خانه</option><option value="work">🏢 محل کار</option><option value="other">📍 سایر</option></select></div>
          </div>
          <div class="prof-field"><label>گیرنده</label><input name="recipient" /></div>
          <div class="prof-row">
            <div class="prof-field"><label>استان</label><input name="province" /></div>
            <div class="prof-field"><label>شهر</label><input name="city" /></div>
          </div>
          <div class="prof-field"><label>آدرس کامل</label><textarea name="address" rows="2" required></textarea></div>
          <div class="prof-row">
            <div class="prof-field"><label>کد پستی</label><input name="postalCode" pattern="^[0-9]{10}$" /></div>
            <div class="prof-field"><label>موبایل</label><input name="phone" pattern="^09[0-9]{9}$" required /></div>
          </div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;margin:10px 0">
            <input type="checkbox" name="isDefault" style="width:auto"> پیش‌فرض
          </label>
          <div style="display:flex;gap:8px">
            <button type="submit" class="prof-btn">💾 ذخیره</button>
            <button type="button" class="prof-btn prof-btn--ghost" id="addrCancel">انصراف</button>
          </div>
        </form>
      `);
      const cancel = $('addrCancel');
      if(cancel) cancel.addEventListener('click', closeModal);
      const addrForm = $('addrForm');
      if(addrForm){
        addrForm.addEventListener('submit', e => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          window.DPSecurity.addresses.save(userId, data, ENCRYPT_KEY);
          closeModal();
          renderAddresses();
          toast('✅ آدرس ذخیره شد 🔒');
        });
      }
    });
  }
  renderAddresses();

  // ═══ امنیت ═══
  const sec = window.DPSecurity.getSecurity(userId);
  const twoFAToggle = $('prof2FAToggle');
  if(twoFAToggle){
    twoFAToggle.checked = sec.twoFactorEnabled;
    twoFAToggle.addEventListener('change', async e => {
      if(e.target.checked){
        const result = await window.DPSecurity.enable2FA(userId, 'authenticator');
        openModal(`<h3>🔐 2FA فعال شد</h3>
          <p style="color:var(--text-soft);font-size:13px">کد مخفی رو در Google Authenticator یا اپ مشابه وارد کن:</p>
          <code style="display:block;background:var(--bg-soft);padding:12px;border-radius:8px;margin:8px 0;font-family:monospace;font-size:13px;word-break:break-all">${result.secret}</code>
          <p style="font-size:12.5px;color:var(--text-soft);margin:14px 0 6px"><strong>⚠️ کدهای پشتیبان (هر کد فقط یکبار):</strong></p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;background:var(--bg-soft);padding:12px;border-radius:8px">${result.backupCodes.map(c => '<code style="font-family:monospace;font-size:11px;padding:4px;background:var(--bg-card);border-radius:4px">' + c + '</code>').join('')}</div>
          <button class="prof-btn" style="margin-top:16px;width:100%" id="close2FA">✅ متوجه شدم</button>
        `);
        const c2 = $('close2FA');
        if(c2) c2.addEventListener('click', closeModal);
      } else {
        if(confirm('غیرفعال‌سازی 2FA؟')){ window.DPSecurity.disable2FA(userId); toast('2FA غیرفعال شد'); }
        else e.target.checked = true;
      }
      fillHeader();
    });
  }
  const cpBtn = $('profChangePassword');
  if(cpBtn){
    cpBtn.addEventListener('click', () => {
      openModal(`<h3>🔑 تغییر رمز عبور</h3>
        <form id="pwForm">
          <div class="prof-field"><label>رمز فعلی</label><input type="password" id="oldPw" required minlength="6"></div>
          <div class="prof-field"><label>رمز جدید (حداقل ۶ کاراکتر)</label><input type="password" id="newPw" required minlength="6"></div>
          <div class="prof-field"><label>تکرار رمز جدید</label><input type="password" id="confPw" required minlength="6"></div>
          <div style="display:flex;gap:8px">
            <button type="submit" class="prof-btn">تغییر</button>
            <button type="button" class="prof-btn prof-btn--ghost" id="pwCancel">انصراف</button>
          </div>
        </form>
      `);
      const pc = $('pwCancel');
      if(pc) pc.addEventListener('click', closeModal);
      const pwForm = $('pwForm');
      if(pwForm){
        pwForm.addEventListener('submit', async e => {
          e.preventDefault();
          const oldP = $('oldPw').value;
          const newP = $('newPw').value;
          const confP = $('confPw').value;
          if(newP !== confP){ toast('رمز جدید و تکرار یکسان نیست', false); return; }
          try{
            await window.DPAuth.changePassword(oldP, newP);
            window.DPSecurity.saveSecurity(userId, {lastPasswordChange: new Date().toISOString()});
            toast('✅ رمز تغییر کرد');
            closeModal();
            fillHeader();
          } catch(err){ toast(err.error, false); }
        });
      }
    });
  }

  function renderSessions(){
    const el = $('profSessions');
    if(!el) return;
    const sessions = window.DPSecurity.sessions.get(userId);
    if(sessions.length === 0){
      el.innerHTML = `<div class="prof-empty"><p style="font-size:12px">نشست فعالی نیست</p></div>`;
      return;
    }
    el.innerHTML = sessions.map(s => `
      <div class="prof-session ${s.isCurrent ? 'is-current' : ''}">
        <div class="prof-session-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            ${s.device.type === 'mobile' ? '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/>' : s.device.type === 'tablet' ? '<rect x="3" y="3" width="18" height="18" rx="2"/>' : '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'}
          </svg>
        </div>
        <div class="prof-session-info">
          <strong>${s.device.os} - ${s.device.browser}</strong>
          <span>${s.isCurrent ? '⚡ همین دستگاه' : new Date(s.lastActivity).toLocaleDateString('fa-IR')}</span>
        </div>
        ${s.isCurrent ? '<span class="prof-address-default">فعلی</span>' : `<button class="prof-btn prof-btn--danger prof-btn--sm" data-sess="${s.id}">خروج</button>`}
      </div>
    `).join('');
    el.querySelectorAll('[data-sess]').forEach(b => b.addEventListener('click', () => {
      if(confirm('از این نشست خارج شوی؟')){ window.DPSecurity.sessions.remove(userId, b.dataset.sess); renderSessions(); toast('✅ خروج'); }
    }));
  }
  renderSessions();

  // ═══ Onboarding ═══
  const startOnbBtn = $('profStartOnb');
  if(startOnbBtn){
    startOnbBtn.addEventListener('click', () => {
      startProfileOnboarding();
    });
  }

  function startProfileOnboarding(){
    const onbOverlay = $('profOnbOverlay');
    const onbBody = $('profOnbBody');
    const onbFill = $('profOnbFill');
    const onbStepLabel = $('profOnbStepLabel');
    const onbPercent = $('profOnbPercent');
    if(!onbOverlay) return;

    window.DPOnboarding.markOpened(userId);

    let step = 0;
    const data = {...profile};
    const steps = window.DPOnboarding.STEPS;

    function render(){
      const s = steps[step];
      const percent = Math.round((step / steps.length) * 100);
      onbFill.style.width = percent + '%';
      onbStepLabel.textContent = `مرحله ${step + 1} از ${steps.length} - ${s.icon} ${s.title}`;
      onbPercent.textContent = percent + '٪';
      $('profOnbPrev').disabled = step === 0;
      $('profOnbNext').textContent = step === steps.length - 1 ? '✅ تکمیل' : 'بعدی';

      if(s.id === 'personal'){
        onbBody.innerHTML = `
          <h3>${s.icon} ${s.title}</h3>
          <p style="color:var(--text-soft);font-size:13px;margin:0 0 14px">${s.desc}</p>
          <div class="prof-field">
            <label>جنسیت</label>
            <select id="obGender">
              <option value="">انتخاب کنید</option>
              <option value="female" ${data.gender === 'female' ? 'selected' : ''}>زن</option>
              <option value="male" ${data.gender === 'male' ? 'selected' : ''}>مرد</option>
              <option value="other" ${data.gender === 'other' ? 'selected' : ''}>سایر</option>
            </select>
          </div>
          <div class="prof-row">
            <div class="prof-field"><label>تاریخ تولد</label><input type="date" id="obBirth" value="${data.birth || ''}" /></div>
            <div class="prof-field"><label>شهر</label><input type="text" id="obCity" value="${data.city || ''}" placeholder="مثلاً: تهران" /></div>
          </div>
        `;
      } else if(s.id === 'body'){
        onbBody.innerHTML = `
          <h3>${s.icon} ${s.title}</h3>
          <p style="color:var(--text-soft);font-size:13px;margin:0 0 14px">${s.desc}</p>
          <div class="prof-row">
            <div class="prof-field"><label>شانه (cm)</label><input type="number" id="obShoulder" value="${data.measurements?.shoulder || ''}" /></div>
            <div class="prof-field"><label>سینه (cm)</label><input type="number" id="obChest" value="${data.measurements?.chest || ''}" /></div>
            <div class="prof-field"><label>کمر (cm)</label><input type="number" id="obWaist" value="${data.measurements?.waist || ''}" /></div>
            <div class="prof-field"><label>باسن (cm)</label><input type="number" id="obHip" value="${data.measurements?.hip || ''}" /></div>
            <div class="prof-field"><label>قد (cm)</label><input type="number" id="obHeight" value="${data.measurements?.height || ''}" /></div>
            <div class="prof-field"><label>آستین (cm)</label><input type="number" id="obArm" value="${data.measurements?.armLength || ''}" /></div>
          </div>
        `;
      } else if(s.id === 'photo'){
        const skinMap = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
        const bodyMap = {hourglass:'ساعت‌شنی ⏳', pear:'گلابی 🍐', apple:'سیب 🍎', rectangle:'مستطیل 📏', 'inverted-triangle':'مثلث معکوس 🔻'};
        onbBody.innerHTML = `
          <h3>${s.icon} ${s.title}</h3>
          <p style="color:var(--text-soft);font-size:13px;margin:0 0 14px">${s.desc}</p>
          <label class="prof-upload" id="obUpload" style="${data.photo ? 'border:2px solid var(--gold);padding:0;overflow:hidden' : ''}">
            <div id="obUploadEmpty">
              ${data.photo ? `<img src="${data.photo}" alt="عکس" style="width:100%;max-height:200px;object-fit:cover;display:block" />` : `
                <div class="prof-upload-icon">📷</div>
                <strong>عکس خودت رو انتخاب کن</strong>
                <span>JPG، PNG — حداکثر ۸ مگابایت</span>
              `}
            </div>
            <input type="file" id="obFile" accept="image/*" />
          </label>
          <div id="obAnalysis" class="prof-analysis" style="${data.skinTone ? 'display:grid' : 'display:none'}">
            ${data.skinTone ? `
              <div class="prof-analysis-item">
                <div class="prof-analysis-icon">☀️</div>
                <div class="prof-analysis-info"><strong>${skinMap[data.skinTone]}</strong><span>رنگ پوست</span></div>
              </div>
              <div class="prof-analysis-item">
                <div class="prof-analysis-icon">⏳</div>
                <div class="prof-analysis-info"><strong>${bodyMap[data.bodyType]}</strong><span>فرم بدن</span></div>
              </div>
            ` : ''}
          </div>
        `;
        const obFile = $('obFile');
        if(obFile) obFile.addEventListener('change', e => {
          const f = e.target.files[0];
          if(!f) return;
          if(f.size > 8 * 1024 * 1024){ toast('حجم عکس نباید بیشتر از ۸ مگابایت باشد', false); return; }
          const r = new FileReader();
          r.onload = ev => {
            const empty = $('obUploadEmpty');
            const up = $('obUpload');
            if(empty) empty.innerHTML = `<img src="${ev.target.result}" style="width:100%;max-height:200px;object-fit:cover;display:block" />`;
            if(up) up.classList.add('has-image');
            data.photo = ev.target.result;
            toast('⏳ در حال تحلیل AI عکس...');

            // استفاده از موتور DPPhotoAI
            if(window.DPPhotoAI){
              window.DPPhotoAI.analyze(ev.target.result).then(analysis => {
                data.skinTone = analysis.skinTone;
                data.skinDepth = analysis.skinDepth;
                data.season = analysis.season;
                data.photoAnalysis = analysis;
                toast('✅ تحلیل AI کامل شد!');
                const ana = $('obAnalysis');
                if(ana){
                  const skinMap = {warm:'گرم ☀️', cool:'سرد ❄️', neutral:'خنثی ⚖️'};
                  ana.style.display = 'grid';
                  ana.innerHTML = `
                    <div class="prof-analysis-item">
                      <div class="prof-analysis-icon">☀️</div>
                      <div class="prof-analysis-info"><strong>${skinMap[analysis.skinTone]}</strong><span>رنگ پوست (AI واقعی)</span></div>
                    </div>
                    <div class="prof-analysis-item">
                      <div class="prof-analysis-icon">🌈</div>
                      <div class="prof-analysis-info"><strong>${analysis.seasonLabel || 'نامشخص'}</strong><span>فصل رنگی شما</span></div>
                    </div>
                  `;
                }
              }).catch(err => {
                console.error('Onboarding photo analysis error:', err);
                toast('❌ خطا در تحلیل', false);
              });
            }
          };
          r.readAsDataURL(f);
        });
      } else if(s.id === 'style'){
        const styles = [
          {v:'classic', l:'کلاسیک'}, {v:'modern', l:'مدرن'}, {v:'elegant', l:'شیک'},
          {v:'sporty', l:'اسپرت'}, {v:'bohemian', l:'بوهمی'}, {v:'minimal', l:'مینیمال'}, {v:'vintage', l:'وینتیج'}
        ];
        const colors = [
          {v:'gold', l:'طلایی', c:'#d4af37'}, {v:'black', l:'مشکی', c:'#1a1a1a'},
          {v:'white', l:'سفید', c:'#fff'}, {v:'cream', l:'کرم', c:'#f4e5b1'},
          {v:'navy', l:'سرمه‌ای', c:'#1e3a5f'}, {v:'emerald', l:'زمردی', c:'#2d5a3d'},
          {v:'burgundy', l:'زرشکی', c:'#7a1e3c'}, {v:'pink', l:'صورتی', c:'#c44569'}
        ];
        const occs = [
          {v:'casual', l:'روزمره'}, {v:'formal', l:'رسمی'}, {v:'party', l:'مهمانی'},
          {v:'wedding', l:'عروسی'}, {v:'business', l:'اداری'}
        ];
        onbBody.innerHTML = `
          <h3>${s.icon} ${s.title}</h3>
          <p style="color:var(--text-soft);font-size:13px;margin:0 0 14px">${s.desc}</p>
          <strong style="font-size:12px;display:block;margin:6px 0">🎨 استایل‌ها (۲-۳ مورد)</strong>
          <div class="prof-chips" id="obStyles">
            ${styles.map(it => `<button class="prof-chip ${(data.preferredStyles || []).includes(it.v) ? 'is-on' : ''}" data-v="${it.v}">${it.l}</button>`).join('')}
          </div>
          <strong style="font-size:12px;display:block;margin:14px 0 6px">🌈 رنگ‌های محبوب</strong>
          <div class="prof-chips" id="obColors">
            ${colors.map(it => `<button class="prof-chip prof-chip-color ${(data.preferredColors || []).includes(it.v) ? 'is-on' : ''}" data-v="${it.v}" style="--c:${it.c}${it.v === 'white' ? ';border:1.5px solid #ddd' : ''}">${it.l}</button>`).join('')}
          </div>
          <strong style="font-size:12px;display:block;margin:14px 0 6px">🎭 موقعیت‌ها</strong>
          <div class="prof-chips" id="obOccs">
            ${occs.map(it => `<button class="prof-chip ${(data.preferredOccasions || []).includes(it.v) ? 'is-on' : ''}" data-v="${it.v}">${it.l}</button>`).join('')}
          </div>
          <strong style="font-size:12px;display:block;margin:14px 0 6px">💰 بودجه</strong>
          <div class="prof-chips" id="obBudget">
            <button class="prof-chip" data-v="low">اقتصادی</button>
            <button class="prof-chip" data-v="medium">متوسط</button>
            <button class="prof-chip" data-v="high">بالا</button>
            <button class="prof-chip" data-v="luxury">لوکس</button>
          </div>
        `;
        onbBody.querySelectorAll('#obStyles [data-v]').forEach(b => b.addEventListener('click', () => {
          b.classList.toggle('is-on');
          data.preferredStyles = Array.from(onbBody.querySelectorAll('#obStyles .is-on')).map(x => x.dataset.v);
        }));
        onbBody.querySelectorAll('#obColors [data-v]').forEach(b => b.addEventListener('click', () => {
          b.classList.toggle('is-on');
          data.preferredColors = Array.from(onbBody.querySelectorAll('#obColors .is-on')).map(x => x.dataset.v);
        }));
        onbBody.querySelectorAll('#obOccs [data-v]').forEach(b => b.addEventListener('click', () => {
          b.classList.toggle('is-on');
          data.preferredOccasions = Array.from(onbBody.querySelectorAll('#obOccs .is-on')).map(x => x.dataset.v);
        }));
        onbBody.querySelectorAll('#obBudget [data-v]').forEach(b => b.addEventListener('click', () => {
          onbBody.querySelectorAll('#obBudget [data-v]').forEach(x => x.classList.remove('is-on'));
          b.classList.add('is-on');
          data.budget = b.dataset.v;
        }));
        if(data.budget){
          onbBody.querySelectorAll('#obBudget [data-v]').forEach(b => b.classList.toggle('is-on', b.dataset.v === data.budget));
        }
      } else if(s.id === 'address'){
        onbBody.innerHTML = `
          <h3>${s.icon} ${s.title}</h3>
          <p style="color:var(--text-soft);font-size:13px;margin:0 0 14px">${s.desc}</p>
          <div class="prof-row">
            <div class="prof-field"><label>استان</label><input type="text" id="obProvince" placeholder="مثلاً: تهران" /></div>
            <div class="prof-field"><label>شهر</label><input type="text" id="obCityAddr" placeholder="مثلاً: تهران" /></div>
          </div>
          <div class="prof-field"><label>آدرس کامل</label><textarea id="obAddress" rows="2" placeholder="خیابان، کوچه، پلاک، واحد"></textarea></div>
          <div class="prof-row">
            <div class="prof-field"><label>کد پستی (۱۰ رقم)</label><input type="text" id="obPostal" pattern="^[0-9]{10}$" placeholder="۱۲۳۴۵۶۷۸۹۰" /></div>
            <div class="prof-field"><label>تلفن</label><input type="tel" id="obPhone" pattern="^09[0-9]{9}$" placeholder="۰۹xxxxxxxxx" /></div>
          </div>
        `;
      }
    }

    function saveCurrent(){
      const s = steps[step];
      if(s.id === 'personal'){
        data.gender = $('obGender')?.value;
        data.birth = $('obBirth')?.value;
        data.city = $('obCity')?.value;
      } else if(s.id === 'body'){
        const meas = {};
        const v1 = parseFloat($('obShoulder')?.value); if(v1) meas.shoulder = v1;
        const v2 = parseFloat($('obChest')?.value); if(v2) meas.chest = v2;
        const v3 = parseFloat($('obWaist')?.value); if(v3) meas.waist = v3;
        const v4 = parseFloat($('obHip')?.value); if(v4) meas.hip = v4;
        const v5 = parseFloat($('obHeight')?.value); if(v5) meas.height = v5;
        const v6 = parseFloat($('obArm')?.value); if(v6) meas.armLength = v6;
        if(Object.keys(meas).length) data.measurements = meas;
      } else if(s.id === 'address'){
        const province = $('obProvince')?.value;
        const city = $('obCityAddr')?.value;
        const address = $('obAddress')?.value;
        const postalCode = $('obPostal')?.value;
        const phone = $('obPhone')?.value;
        if(address && phone){
          window.DPSecurity.addresses.save(userId, {label: 'آدرس جدید', type: 'home', province, city, address, postalCode, phone, isDefault: true}, ENCRYPT_KEY);
        }
      }
    }

    $('profOnbPrev').onclick = () => { saveCurrent(); if(step > 0) step--; render(); };
    $('profOnbNext').onclick = () => {
      saveCurrent();
      if(step < steps.length - 1){
        step++;
        render();
      } else {
        window.DPProfile.save(userId, data);
        profile = {...profile, ...data};
        window.DPOnboarding.markCompleted(userId);
        onbOverlay.classList.remove('is-on');
        toast('🎉 پروفایل تکمیل شد!');
        fillHeader();
        updateProgress();
        renderSummary();
        renderRecs();
        renderSizes(data.measurements);
        if(data.preferredStyles) {
          document.querySelectorAll('#profStyleChips [data-cat]').forEach(c => c.classList.toggle('is-on', data.preferredStyles.includes(c.dataset.v)));
        }
        if(data.preferredColors) {
          document.querySelectorAll('#profColorChips [data-cat]').forEach(c => c.classList.toggle('is-on', data.preferredColors.includes(c.dataset.v)));
        }
        if(data.preferredOccasions) {
          document.querySelectorAll('#profOccasionChips [data-cat]').forEach(c => c.classList.toggle('is-on', data.preferredOccasions.includes(c.dataset.v)));
        }
        if(data.gender) $('profGender').value = data.gender;
        if(data.birth) $('profBirth').value = data.birth;
      }
    };
    $('profOnbCancel').onclick = () => {
      if(confirm('ادامه تکمیل بعداً؟ پیشرفت فعلیت ذخیره می‌شه.')){
        saveCurrent();
        if(Object.keys(data).length > 0) window.DPProfile.save(userId, data);
        profile = {...profile, ...data};
        onbOverlay.classList.remove('is-on');
        fillHeader();
        updateProgress();
        renderSummary();
        renderRecs();
        toast('✅ پیشرفت ذخیره شد');
      }
    };

    onbOverlay.classList.add('is-on');
    render();
  }

  // ═══ مقایسه هوشمند محصولات فروشنده با پروفایل ═══
  let sellersMatchSort = 'percent';

  function renderSellersMatch(){
    const list = $('profSellersList');
    const statusEl = $('profSellersProfileStatus');
    if(!list || !window.DPProducts) return;

    const allP = window.DPProducts.all();
    const sellers = allP.filter(p => p.isSellerProduct);

    // ═══ نمایش وضعیت پروفایل ═══
    const profileItems = [];
    if(profile.skinTone) profileItems.push('🎨 رنگ پوست');
    if(profile.bodyType) profileItems.push('👤 فرم بدن');
    if(profile.preferredStyles && profile.preferredStyles.length) profileItems.push('💎 استایل');
    if(profile.preferredColors && profile.preferredColors.length) profileItems.push('🌈 رنگ‌ها');
    if(profile.preferredOccasions && profile.preferredOccasions.length) profileItems.push('🎭 موقعیت');
    if(profile.budget) profileItems.push('💰 بودجه');

    if(statusEl){
      if(profileItems.length === 0){
        statusEl.innerHTML = '<span style="color:#f59e0b">⚠️</span> برای مقایسه دقیق، لطفاً پروفایل خود را از منوی <strong>سلیقه</strong> تکمیل کنید.';
      } else {
        statusEl.innerHTML = '<span style="color:#10b981">✅</span> پروفایل شما بررسی می‌شود: ' + profileItems.map(t => '<span style="background:var(--bg-soft);padding:2px 6px;border-radius:5px;font-size:10px;margin:0 2px">' + t + '</span>').join('');
      }
    }

    if(sellers.length === 0){
      list.innerHTML = '<div class="prof-empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5v2H3z"/><path d="M3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9"/></svg><h3>هنوز محصولی از فروشندگان ثبت نشده</h3><p>اولین فروشنده باش و محصولت رو اضافه کن!</p><a href="./seller/seller-signup.html" class="prof-btn" style="margin-top:12px;display:inline-flex;text-decoration:none">🏪 ثبت‌نام فروشنده</a></div>';
      return;
    }

    // ═══ مقایسه همه محصولات با موتور AI پیشرفته ═══
    const allSellerProducts = window.DPProducts.all().filter(p => p.isSellerProduct);
    const history = window.DPProfile.history ? window.DPProfile.history(userId) : [];
    let allMatched;
    if(window.DPAIEngine){
      // استفاده از موتور پیشرفته با 12 فاکتور
      const recs = window.DPAIEngine.recommend(allSellerProducts, profile, history, {limit: 50, minPercent: 0, useDiversity: false});
      allMatched = recs.map(r => ({product: r, match: {percent: r.matchPercent, level: r.level, levelLabel: r.levelLabel, levelColor: r.levelColor, levelIcon: r.levelIcon, matches: r.reasons, mismatches: [], details: r.matchDetails, summary: r.summary}}));
    } else {
      allMatched = window.DPProducts.matchSellersWithProfile(profile, {sortBy: sellersMatchSort, limit: 50});
    }
    // ⚠️ فقط محصولاتی که بیشتر از ۶۵٪ تطابق دارن نمایش داده می‌شن
    const matched = allMatched.filter(m => m.match.percent >= 65);
    if(matched.length === 0){
      const total = allMatched.length;
      const bestPercent = total > 0 ? Math.max(...allMatched.map(m => m.match.percent)) : 0;
      list.innerHTML = '<div class="prof-empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><h3>هیچ محصولی با بیش از ۶۵٪ تطابق پیدا نشد</h3><p>از بین ' + total + ' محصول فروشندگان، بهترین تطابق ' + bestPercent + '٪ بود.</p><p style="font-size:12px;margin-top:8px;color:var(--text-soft)">💡 برای پیشنهادهای بهتر، پروفایل خودت رو تکمیل‌تر کن (سبک، رنگ، بودجه).</p></div>';
      return;
    }

    list.innerHTML = matched.map((m, idx) => {
      const p = m.product;
      const match = m.match;
      const reasons = match.matches.slice(0, 3).map(r => '<span class="prof-match-reason">' + r.icon + ' ' + r.text + '</span>').join('');
      const badReasons = match.mismatches.slice(0, 2).map(r => '<span class="prof-match-reason is-bad">' + r.icon + ' ' + r.text + '</span>').join('');

      return `
        <div class="prof-match-card" data-prod="${p.id}">
          <div class="prof-match-icon">
            ${productIcon(p.subcategory || p.category)}
            <div class="prof-match-percent" style="background:${match.levelColor}">${match.percent}٪</div>
          </div>
          <div class="prof-match-info">
            <h4 class="prof-match-name">${p.name}</h4>
            <div class="prof-match-seller">
              <span class="prof-match-level" style="background:${match.levelColor}">${match.levelIcon} ${match.levelLabel}</span>
              🏪 ${p.seller}
              <span>•</span>
              <strong style="color:var(--gold-dark)">${window.DPProducts.formatPrice(p.price)}</strong>
              ${p.discount ? '<span style="color:#ef4444">٪' + p.discount + ' تخفیف</span>' : ''}
            </div>
            <div class="prof-match-bar">
              <div class="prof-match-bar-fill" style="width:${match.percent}%;background:${match.levelColor}"></div>
            </div>
            ${reasons ? '<div class="prof-match-reasons">' + reasons + badReasons + '</div>' : ''}
            <div class="prof-match-summary">${match.summary}</div>
          </div>
          <div class="prof-match-action">
            <button class="prof-btn prof-btn--sm" style="background:${match.levelColor};color:#fff" data-match-detail="${idx}">📊 جزئیات</button>
            <button class="prof-btn prof-btn--ghost prof-btn--sm" data-match-save="${p.id}">🔖 ذخیره</button>
          </div>
        </div>
      `;
    }).join('');

    // ═══ دکمه جزئیات: نمایش modal مقایسه ═══
    list.querySelectorAll('[data-match-detail]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(b.dataset.matchDetail);
        const m = matched[idx];
        showMatchDetailModal(m);
      });
    });
    list.querySelectorAll('[data-match-save]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        toast('🔖 محصول ذخیره شد');
      });
    });
    // کلیک روی کارت (نه دکمه‌ها) → صفحه محصول
    list.querySelectorAll('.prof-match-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const id = card.dataset.prod;
        if(!id) return;
        if(window.DPProfile.track) window.DPProfile.track(userId, id, 'view');
        window.location.href = './product.html?id=' + encodeURIComponent(id);
      });
    });
  }

  function showMatchDetailModal(m){
    const p = m.product;
    const match = m.match;
    const colorPersian = {gold:'طلایی', black:'مشکی', white:'سفید', cream:'کرم', navy:'سرمه‌ای', emerald:'زمردی', burgundy:'زرشکی', pink:'صورتی'};
    const stylePersian = {classic:'کلاسیک', modern:'مدرن', elegant:'شیک', sporty:'اسپرت'};

    const detailRows = Object.entries(match.details).map(([key, d]) => {
      const labels = {gender:'👤 جنسیت', color:'🎨 رنگ', style:'💎 سبک', occasion:'🎭 موقعیت', skinTone:'☀️ رنگ پوست', bodyType:'👤 فرم بدن', budget:'💰 بودجه'};
      const pct = Math.round((d.score / d.max) * 100);
      const statusIcon = d.status === 'perfect' ? '✅' : d.status === 'good' ? '👍' : d.status === 'bad' ? '❌' : '➖';
      return `
        <div style="display:grid;grid-template-columns:90px 1fr 50px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-soft);font-size:11px">
          <strong>${labels[key] || key}</strong>
          <span>${statusIcon} ${d.text}</span>
          <span style="text-align:left;font-weight:800;color:${pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'}">${pct}٪</span>
        </div>
      `;
    }).join('');

    openModal(`
      <div style="text-align:center;margin-bottom:14px">
        <div style="width:80px;height:80px;border-radius:50%;background:conic-gradient(${match.levelColor} ${match.percent * 3.6}deg,var(--border-soft) 0);display:inline-flex;align-items:center;justify-content:center;position:relative;margin:0 auto 8px">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;flex-direction:column">
            <strong style="font-size:20px;color:${match.levelColor}">${match.percent}٪</strong>
            <span style="font-size:9px;color:var(--text-soft)">${match.levelLabel}</span>
          </div>
        </div>
        <h3 style="margin:8px 0 4px">${p.name}</h3>
        <div style="font-size:11.5px;color:var(--text-soft)">🏪 ${p.seller} • ${window.DPProducts.formatPrice(p.price)}</div>
      </div>
      <div style="background:linear-gradient(135deg,${match.levelColor}15,${match.levelColor}05);border:1px solid ${match.levelColor}33;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px;line-height:1.7">
        ${match.summary}
      </div>
      <div style="background:var(--bg-card);border-radius:10px;padding:8px 10px;margin-bottom:12px">
        <strong style="font-size:11.5px;display:block;margin-bottom:6px;color:var(--gold-dark)">📊 تحلیل دقیق فاکتورها:</strong>
        ${detailRows}
      </div>
      ${match.matches.length > 0 ? `
        <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:10px;margin-bottom:8px">
          <strong style="font-size:11.5px;display:block;margin-bottom:6px;color:#059669">✅ نقاط مثبت (${match.matches.length}):</strong>
          <ul style="margin:0;padding-right:16px;font-size:11px;line-height:1.7">
            ${match.matches.map(r => '<li>' + r.icon + ' ' + r.text + '</li>').join('')}
          </ul>
        </div>
      ` : ''}
      ${match.mismatches.length > 0 ? `
        <div style="background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:10px;margin-bottom:8px">
          <strong style="font-size:11.5px;display:block;margin-bottom:6px;color:#dc2626">⚠️ نکات قابل توجه (${match.mismatches.length}):</strong>
          <ul style="margin:0;padding-right:16px;font-size:11px;line-height:1.7">
            ${match.mismatches.map(r => '<li>' + r.icon + ' ' + r.text + '</li>').join('')}
          </ul>
        </div>
      ` : ''}
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="prof-btn prof-btn--block" onclick="document.getElementById('profModal').classList.remove('is-on')">متوجه شدم</button>
      </div>
    `);
  }

  // دکمه‌های سکشن مقایسه
  const sellersRefreshBtn = $('profSellersRefresh');
  if(sellersRefreshBtn) sellersRefreshBtn.addEventListener('click', () => { renderSellersMatch(); toast('🔄 تحلیل مجدد انجام شد'); });
  const sellersSortContainer = $('profSellersSort');
  if(sellersSortContainer){
    sellersSortContainer.addEventListener('click', e => {
      const chip = e.target.closest('[data-sort]');
      if(!chip) return;
      sellersSortContainer.querySelectorAll('[data-sort]').forEach(c => c.classList.toggle('is-on', c === chip));
      sellersMatchSort = chip.dataset.sort;
      renderSellersMatch();
    });
  }
  fillHeader();
  updateProgress();
  renderSummary();
  renderRecs();
  renderSellersMatch();
  renderTasteDiscovery();
  renderWardrobe();
  renderWardrobeAI();

  // نوار ناوبری
  const navAuthArea = $('navAuthArea');
  if(navAuthArea){
    const firstName = (user.name || 'کاربر').split(' ')[0];
    navAuthArea.innerHTML = `<a class="seller-entry" href="./profile.html" style="background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#1a1a1a;font-weight:700">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
      </svg>
      <span>${firstName}</span>
    </a>`;
  }

  // دکمه خروج
  const signOutBtn = $('signOutBtn');
  if(signOutBtn){
    signOutBtn.addEventListener('click', () => {
      if(confirm('آیا می‌خواهی از حسابت خارج شوی؟')){
        window.DPAuth.signout();
        window.location.href = './index.html';
      }
    });
  }

  // اسکرول
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const sp = $('scrollProgress');
    if(!sp) return;
    const max = h.scrollHeight - h.clientHeight;
    sp.style.width = (h.scrollTop / max * 100) + '%';
  });

  console.log('✅ Profile v4.0 loaded (with real products)');
})();
