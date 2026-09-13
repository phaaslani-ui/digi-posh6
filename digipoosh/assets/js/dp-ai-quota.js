/**
 * ============================================================
 *  دیجی‌پوش — مدیریت سهمیه و محدودیت
 *  ------------------------------------------------------------
 *  برای جلوگیری از اتمام API رایگان
 *  ============================================================
 */
(function() {
  'use strict';
  
  const QuotaManager = {
    STORAGE_KEY: 'dp_ai_quota',
    
    // تنظیمات
    dailyLimit: 50,           // حداکثر درخواست روزانه
    userDailyLimit: 10,       // حداکثر هر کاربر در روز
    cooldownMs: 5000,         // ۵ ثانیه بین درخواست‌ها
    
    // وضعیت
    state: null,
    
    init() {
      this.load();
      this.resetIfNewDay();
    },
    
    load() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        this.state = saved ? JSON.parse(saved) : this.defaultState();
      } catch {
        this.state = this.defaultState();
      }
    },
    
    save() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      } catch(e) {
        console.warn('Quota save failed:', e);
      }
    },
    
    defaultState() {
      return {
        date: new Date().toDateString(),
        globalCount: 0,        // کل استفاده امروز
        userCount: 0,          // استفاده این کاربر
        lastRequest: 0,        // timestamp
        blocked: false,        // بلاک موقت؟
        blockUntil: 0,         // تا کی بلاک
      };
    },
    
    resetIfNewDay() {
      const today = new Date().toDateString();
      if (this.state.date !== today) {
        this.state = this.defaultState();
        this.state.date = today;
        this.save();
      }
    },
    
    canRequest() {
      this.resetIfNewDay();
      const now = Date.now();
      
      // چک بلاک موقت
      if (this.state.blocked && now < this.state.blockUntil) {
        const wait = Math.ceil((this.state.blockUntil - now) / 1000);
        return {
          allowed: false,
          reason: 'cooldown',
          message: `⏳ لطفاً ${wait} ثانیه صبر کنید`,
          waitMs: this.state.blockUntil - now,
        };
      }
      
      // رفع بلاک
      if (this.state.blocked && now >= this.state.blockUntil) {
        this.state.blocked = false;
      }
      
      // چک Cooldown
      if (now - this.state.lastRequest < this.cooldownMs) {
        const wait = Math.ceil((this.cooldownMs - (now - this.state.lastRequest)) / 1000);
        return {
          allowed: false,
          reason: 'rate_limit',
          message: `⏳ ${wait} ثانیه بین درخواست‌ها صبر کنید`,
          waitMs: this.cooldownMs - (now - this.state.lastRequest),
        };
      }
      
      // چک سهمیه روزانه کاربر
      if (this.state.userCount >= this.userDailyLimit) {
        return {
          allowed: false,
          reason: 'user_quota',
          message: `🚫 سهمیه روزانه شما تمام شد (${this.userDailyLimit} درخواست)\nفردا دوباره امتحان کنید`,
          waitMs: 0,
        };
      }
      
      // چک سهمیه جهانی
      if (this.state.globalCount >= this.dailyLimit) {
        return {
          allowed: false,
          reason: 'global_quota',
          message: `🚫 سهمیه روزانه سایت تمام شد\nفردا دوباره امتحان کنید`,
          waitMs: 0,
        };
      }
      
      return { allowed: true };
    },
    
    recordRequest() {
      this.state.globalCount++;
      this.state.userCount++;
      this.state.lastRequest = Date.now();
      this.save();
    },
    
    block(durationMs, reason = 'error') {
      this.state.blocked = true;
      this.state.blockUntil = Date.now() + durationMs;
      this.save();
    },
    
    getStatus() {
      this.resetIfNewDay();
      return {
        globalRemaining: Math.max(0, this.dailyLimit - this.state.globalCount),
        globalTotal: this.dailyLimit,
        userRemaining: Math.max(0, this.userDailyLimit - this.state.userCount),
        userTotal: this.userDailyLimit,
        cooldownActive: this.state.blocked,
        date: this.state.date,
      };
    },
    
    getStatusText() {
      const s = this.getStatus();
      return `📊 سهمیه: شما ${s.userRemaining}/${s.userTotal} | کل ${s.globalRemaining}/${s.globalTotal}`;
    }
  };
  
  QuotaManager.init();
  window.DP_Quota = QuotaManager;
  
  console.log('✅ DP_Quota آماده:', QuotaManager.getStatus());
  
})();
