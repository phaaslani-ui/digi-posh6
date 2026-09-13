/**
 * دیجی‌پوش — سیستم احراز هویت واقعی
 * استفاده از Supabase (اگه URL و Key داشته باشه) یا localStorage (پیش‌فرض)
 */

(function(){
  'use strict';
  if(window.DPAuth) return;
  window.DPAuth = {};

  const CONFIG = window.DP_CONFIG || {};
  const STORAGE_KEYS = {
    USERS: 'dp_users',
    CURRENT: 'dp_current_user',
    SESSION: 'dp_session'
  };

  // 🆕 v17.0 — کاربران از سرور (یا localStorage اگه سرور نبود)
  const SERVER_URL = window.DPProductLoader?.SERVER_URL || 'http://localhost:8001';

  async function fetchUsersFromServer() {
    try {
      const res = await fetch(SERVER_URL + '/api/users', { cache: 'no-store' });
      if (!res.ok) throw new Error('server error');
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function pushUsersToServer(users) {
    try {
      await fetch(SERVER_URL + '/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      });
    } catch (e) {}
  }

  function getUsers(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch(e){
      return [];
    }
  }

  function saveUsers(users){
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    // 🆕 به سرور هم push کن
    pushUsersToServer(users);
  }

  // 🆕 همگام‌سازی اولیه با سرور
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncUsersWithServer);
  } else {
    syncUsersWithServer();
  }

  async function syncUsersWithServer() {
    const serverUsers = await fetchUsersFromServer();
    if (serverUsers && Array.isArray(serverUsers) && serverUsers.length > 0) {
      const localUsers = getUsers();
      // merge server users with local users (server is priority)
      const merged = [...serverUsers];
      localUsers.forEach(lu => {
        if (!merged.find(u => u.id === lu.id || u.email === lu.email)) {
          merged.push(lu);
        }
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
      console.log('✅ کاربران از سرور همگام شدند:', merged.length);
    }
  }

  // تولید ID یکتا
  function genId(){
    return 'dp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  }

  // هش ساده (امنیت کامل نیست ولی بهتر از متن ساده)
  function hashPassword(pwd){
    let hash = 0;
    const salt = 'digipoosh_salt_2024';
    const str = pwd + salt;
    for(let i = 0; i < str.length; i++){
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  // اعتبارسنجی ایمیل
  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // اعتبارسنجی موبایل ایران
  function isValidPhone(phone){
    const cleaned = phone.replace(/\D/g, '');
    return /^09[0-9]{9}$/.test(cleaned);
  }

  // ثبت‌نام
  DPAuth.signup = function(data){
    return new Promise((resolve, reject) => {
      if(!data.email || !isValidEmail(data.email)){
        return reject({error: 'ایمیل نامعتبر است'});
      }
      if(!data.password || data.password.length < 6){
        return reject({error: 'رمز عبور باید حداقل ۶ کاراکتر باشد'});
      }
      if(!data.name || data.name.trim().length < 2){
        return reject({error: 'نام و نام خانوادگی الزامی است'});
      }

      const users = getUsers();
      if(users.find(u => u.email === data.email)){
        return reject({error: 'این ایمیل قبلاً ثبت شده است'});
      }

      const newUser = {
        id: genId(),
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        phone: (data.phone || '').replace(/\D/g, ''),
        password: hashPassword(data.password),
        createdAt: new Date().toISOString(),
        orders: [],
        favorites: [],
        addresses: []
      };

      users.push(newUser);
      saveUsers(users);

      const session = createSession(newUser);
      resolve({user: sanitizeUser(newUser), session});
    });
  };

  // ورود
  DPAuth.signin = function(email, password){
    return new Promise((resolve, reject) => {
      if(!email || !password){
        return reject({error: 'ایمیل و رمز عبور الزامی است'});
      }
      const users = getUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());
      if(!user){
        return reject({error: 'کاربری با این ایمیل یافت نشد'});
      }
      if(user.password !== hashPassword(password)){
        return reject({error: 'رمز عبور اشتباه است'});
      }
      const session = createSession(user);
      resolve({user: sanitizeUser(user), session});
    });
  };

  // خروج
  DPAuth.signout = function(){
    localStorage.removeItem(STORAGE_KEYS.CURRENT);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  };

  // کاربر فعلی
  DPAuth.currentUser = function(){
    try{
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT);
      return data ? JSON.parse(data) : null;
    } catch(e){
      return null;
    }
  };

  // آپدیت پروفایل
  DPAuth.updateProfile = function(updates){
    return new Promise((resolve, reject) => {
      const current = DPAuth.currentUser();
      if(!current) return reject({error: 'ابتدا وارد شوید'});

      const users = getUsers();
      const idx = users.findIndex(u => u.id === current.id);
      if(idx === -1) return reject({error: 'کاربر یافت نشد'});

      const allowed = ['name', 'phone', 'addresses'];
      allowed.forEach(k => {
        if(updates[k] !== undefined) users[idx][k] = updates[k];
      });

      saveUsers(users);
      const updated = sanitizeUser(users[idx]);
      localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(updated));
      resolve(updated);
    });
  };

  // تغییر رمز
  DPAuth.changePassword = function(oldPwd, newPwd){
    return new Promise((resolve, reject) => {
      const current = DPAuth.currentUser();
      if(!current) return reject({error: 'ابتدا وارد شوید'});

      const users = getUsers();
      const idx = users.findIndex(u => u.id === current.id);
      if(idx === -1) return reject({error: 'کاربر یافت نشد'});

      if(users[idx].password !== hashPassword(oldPwd)){
        return reject({error: 'رمز فعلی اشتباه است'});
      }
      if(!newPwd || newPwd.length < 6){
        return reject({error: 'رمز جدید باید حداقل ۶ کاراکتر باشد'});
      }

      users[idx].password = hashPassword(newPwd);
      saveUsers(users);
      resolve({success: true});
    });
  };

  // ساخت session
  function createSession(user){
    const session = {
      token: genId(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const cleanUser = sanitizeUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(cleanUser));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    // ارسال event برای به‌روزرسانی UI در همون session
    try {
      if (window.CustomEvent && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dp:auth', {
          detail: { type: 'login', user: cleanUser }
        }));
      }
    } catch(e) {}
    return session;
  }

  // حذف رمز از user
  function sanitizeUser(user){
    const {password, ...clean} = user;
    return clean;
  }

  console.log('✅ DPAuth loaded');
})();
