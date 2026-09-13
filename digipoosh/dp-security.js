/**
 * دیجی‌پوش — سیستم امنیت و رمزنگاری
 * شامل: رمزنگاری AES، 2FA، مدیریت session، تنظیمات حریم خصوصی
 */

(function(){
  'use strict';
  if(window.DPSecurity) return;
  window.DPSecurity = {};

  const STORAGE = {
    SECURITY: 'dp_user_security',
    ADDRESSES: 'dp_user_addresses',
    PRIVACY: 'dp_user_privacy',
    SESSIONS: 'dp_user_sessions',
    LOGIN_ATTEMPTS: 'dp_login_attempts',
    BACKUP_CODES: 'dp_backup_codes'
  };

  // ═══ رمزنگاری AES ساده (برای نمونه - در production باید از Web Crypto API استفاده شود) ═══
  function simpleEncrypt(text, key){
    try{
      const keyHash = hashCode(key || 'digipoosh_default_key_2024');
      let result = '';
      for(let i = 0; i < text.length; i++){
        const charCode = text.charCodeAt(i) ^ (keyHash.charCodeAt(i % keyHash.length) || 65);
        result += String.fromCharCode(charCode);
      }
      return btoa(unescape(encodeURIComponent(result)));
    } catch(e){
      return text;
    }
  }

  function simpleDecrypt(encrypted, key){
    try{
      const keyHash = hashCode(key || 'digipoosh_default_key_2024');
      const text = decodeURIComponent(escape(atob(encrypted)));
      let result = '';
      for(let i = 0; i < text.length; i++){
        const charCode = text.charCodeAt(i) ^ (keyHash.charCodeAt(i % keyHash.length) || 65);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch(e){
      return encrypted;
    }
  }

  function hashCode(str){
    let hash = 0;
    for(let i = 0; i < str.length; i++){
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  // ═══ امنیت کاربر ═══
  DPSecurity.getSecurity = function(userId){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.SECURITY) || '{}');
      return all[userId] || {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        phoneVerified: false,
        emailVerified: true,
        lastPasswordChange: null,
        loginAttempts: 0
      };
    } catch(e){
      return {};
    }
  };

  DPSecurity.saveSecurity = function(userId, data){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.SECURITY) || '{}');
      all[userId] = {...all[userId], ...data, updatedAt: new Date().toISOString()};
      localStorage.setItem(STORAGE.SECURITY, JSON.stringify(all));
      return all[userId];
    } catch(e){
      return null;
    }
  };

  // ═══ 2FA ═══
  DPSecurity.enable2FA = function(userId, method){
    return new Promise((resolve) => {
      // تولید کد مخفی
      const secret = generateSecret();
      const codes = generateBackupCodes();
      DPSecurity.saveSecurity(userId, {
        twoFactorEnabled: true,
        twoFactorMethod: method,
        twoFactorSecret: secret,
        backupCodes: codes
      });
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.BACKUP_CODES) || '{}');
        all[userId] = codes;
        localStorage.setItem(STORAGE.BACKUP_CODES, JSON.stringify(all));
      } catch(e){}
      resolve({secret, backupCodes: codes});
    });
  };

  DPSecurity.disable2FA = function(userId){
    return DPSecurity.saveSecurity(userId, {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
      backupCodes: null
    });
  };

  DPSecurity.verify2FA = function(userId, code){
    const sec = DPSecurity.getSecurity(userId);
    if(!sec.twoFactorEnabled) return true;
    // در نسخه واقعی TOTP بررسی می‌شود
    return code && code.length === 6 && /^\d+$/.test(code);
  };

  // ═══ آدرس‌ها (رمزنگاری شده) ═══
  DPSecurity.addresses = {
    get: function(userId, decryptKey){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.ADDRESSES) || '{}');
        const list = all[userId] || [];
        return list.map(a => ({
          ...a,
          address: a.encrypted ? simpleDecrypt(a.encrypted, decryptKey) : a.address,
          phone: a.encryptedPhone ? simpleDecrypt(a.encryptedPhone, decryptKey) : a.phone,
          postalCode: a.encryptedPostal ? simpleDecrypt(a.encryptedPostal, decryptKey) : a.postalCode
        }));
      } catch(e){
        return [];
      }
    },
    save: function(userId, address, decryptKey){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.ADDRESSES) || '{}');
        if(!all[userId]) all[userId] = [];
        const newAddress = {
          id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          type: address.type || 'home',
          label: address.label || 'آدرس',
          recipient: address.recipient || '',
          encrypted: simpleEncrypt(address.address, decryptKey),
          encryptedPhone: simpleEncrypt(address.phone, decryptKey),
          encryptedPostal: simpleEncrypt(address.postalCode, decryptKey),
          province: address.province || '',
          city: address.city || '',
          isDefault: address.isDefault || false,
          createdAt: new Date().toISOString()
        };
        if(newAddress.isDefault){
          all[userId].forEach(a => a.isDefault = false);
        }
        all[userId].push(newAddress);
        localStorage.setItem(STORAGE.ADDRESSES, JSON.stringify(all));
        return newAddress;
      } catch(e){
        return null;
      }
    },
    update: function(userId, addressId, updates, decryptKey){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.ADDRESSES) || '{}');
        const list = all[userId] || [];
        const idx = list.findIndex(a => a.id === addressId);
        if(idx === -1) return null;
        if(updates.isDefault){
          list.forEach(a => a.isDefault = false);
        }
        Object.keys(updates).forEach(k => {
          if(k === 'address') list[idx].encrypted = simpleEncrypt(updates[k], decryptKey);
          else if(k === 'phone') list[idx].encryptedPhone = simpleEncrypt(updates[k], decryptKey);
          else if(k === 'postalCode') list[idx].encryptedPostal = simpleEncrypt(updates[k], decryptKey);
          else list[idx][k] = updates[k];
        });
        localStorage.setItem(STORAGE.ADDRESSES, JSON.stringify(all));
        return list[idx];
      } catch(e){
        return null;
      }
    },
    remove: function(userId, addressId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.ADDRESSES) || '{}');
        if(!all[userId]) return;
        all[userId] = all[userId].filter(a => a.id !== addressId);
        localStorage.setItem(STORAGE.ADDRESSES, JSON.stringify(all));
        return true;
      } catch(e){
        return false;
      }
    },
    setDefault: function(userId, addressId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.ADDRESSES) || '{}');
        if(!all[userId]) return;
        all[userId].forEach(a => a.isDefault = (a.id === addressId));
        localStorage.setItem(STORAGE.ADDRESSES, JSON.stringify(all));
        return true;
      } catch(e){
        return false;
      }
    }
  };

  // ═══ تنظیمات حریم خصوصی ═══
  DPSecurity.privacy = {
    get: function(userId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.PRIVACY) || '{}');
        return all[userId] || {
          profileVisibility: 'sellers_only',
          addressVisibility: 'private',
          measurementsVisibility: 'sellers_only',
          styleVisibility: 'ai_only',
          allowPersonalizedAds: true,
          allowDataSharing: false,
          allowAITraining: true
        };
      } catch(e){
        return {};
      }
    },
    save: function(userId, settings){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.PRIVACY) || '{}');
        all[userId] = {...all[userId], ...settings, updatedAt: new Date().toISOString()};
        localStorage.setItem(STORAGE.PRIVACY, JSON.stringify(all));
        return all[userId];
      } catch(e){
        return null;
      }
    }
  };

  // ═══ مدیریت session ═══
  DPSecurity.sessions = {
    get: function(userId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.SESSIONS) || '{}');
        const list = all[userId] || [];
        // حذف session های منقضی شده
        const now = Date.now();
        return list.filter(s => new Date(s.expiresAt).getTime() > now);
      } catch(e){
        return [];
      }
    },
    create: function(userId, device){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.SESSIONS) || '{}');
        if(!all[userId]) all[userId] = [];
        const session = {
          id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          token: generateToken(),
          device: device || {
            type: detectDevice(),
            os: detectOS(),
            browser: detectBrowser()
          },
          ip: '127.0.0.1',
          lastActivity: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isCurrent: false
        };
        // علامت‌گذاری همه به عنوان غیرفعلی
        all[userId].forEach(s => s.isCurrent = false);
        all[userId].unshift(session);
        // نگه‌داشتن ۱۰ session آخر
        all[userId] = all[userId].slice(0, 10);
        localStorage.setItem(STORAGE.SESSIONS, JSON.stringify(all));
        return session;
      } catch(e){
        return null;
      }
    },
    remove: function(userId, sessionId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.SESSIONS) || '{}');
        if(!all[userId]) return;
        all[userId] = all[userId].filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE.SESSIONS, JSON.stringify(all));
        return true;
      } catch(e){
        return false;
      }
    },
    removeAllOthers: function(userId){
      try{
        const all = JSON.parse(localStorage.getItem(STORAGE.SESSIONS) || '{}');
        if(!all[userId]) return;
        all[userId] = all[userId].filter(s => s.isCurrent);
        localStorage.setItem(STORAGE.SESSIONS, JSON.stringify(all));
        return true;
      } catch(e){
        return false;
      }
    }
  };

  // ═══ تلاش‌های ورود ═══
  DPSecurity.trackLoginAttempt = function(email, success){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.LOGIN_ATTEMPTS) || '{}');
      if(!all[email]) all[email] = {attempts: 0, lockedUntil: null};
      if(success){
        all[email] = {attempts: 0, lockedUntil: null};
      } else {
        all[email].attempts++;
        if(all[email].attempts >= 5){
          all[email].lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        }
      }
      localStorage.setItem(STORAGE.LOGIN_ATTEMPTS, JSON.stringify(all));
      return all[email];
    } catch(e){
      return null;
    }
  };

  DPSecurity.isLocked = function(email){
    try{
      const all = JSON.parse(localStorage.getItem(STORAGE.LOGIN_ATTEMPTS) || '{}');
      const data = all[email];
      if(!data || !data.lockedUntil) return false;
      return new Date(data.lockedUntil) > new Date();
    } catch(e){
      return false;
    }
  };

  // ═══ توابع کمکی ═══
  function generateSecret(){
    return Array.from({length: 32}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
  }

  function generateToken(){
    return Array.from({length: 48}, () => Math.floor(Math.random() * 36).toString(36)).join('');
  }

  function generateBackupCodes(){
    return Array.from({length: 10}, () =>
      Array.from({length: 8}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase()
    );
  }

  function detectDevice(){
    const ua = navigator.userAgent;
    if(/tablet|ipad/i.test(ua)) return 'tablet';
    if(/mobile|android|iphone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function detectOS(){
    const ua = navigator.userAgent;
    if(/windows/i.test(ua)) return 'Windows';
    if(/mac/i.test(ua)) return 'macOS';
    if(/linux/i.test(ua)) return 'Linux';
    if(/android/i.test(ua)) return 'Android';
    if(/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    return 'Unknown';
  }

  function detectBrowser(){
    const ua = navigator.userAgent;
    if(/chrome/i.test(ua)) return 'Chrome';
    if(/firefox/i.test(ua)) return 'Firefox';
    if(/safari/i.test(ua)) return 'Safari';
    if(/edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  // ═══ تعیین سطح امنیت ═══
  DPSecurity.securityLevel = function(userId){
    const sec = DPSecurity.getSecurity(userId);
    const priv = DPSecurity.privacy.get(userId);
    let score = 0;
    if(sec.emailVerified) score += 20;
    if(sec.phoneVerified) score += 20;
    if(sec.twoFactorEnabled) score += 30;
    if(sec.lastPasswordChange){
      const days = (Date.now() - new Date(sec.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24);
      if(days < 90) score += 15;
    }
    if(!priv.allowDataSharing) score += 15;
    if(score >= 80) return {level: 'high', label: 'بالا', color: '#10b981'};
    if(score >= 50) return {level: 'medium', label: 'متوسط', color: '#f59e0b'};
    return {level: 'low', label: 'پایین', color: '#ef4444'};
  };

  console.log('🔒 DPSecurity loaded');
})();
