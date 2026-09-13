/**
 * 🔗 dp-referral-sync.js v1.0 — همگام‌سازی رفرال بین کاربران
 * ------------------------------------------------------------------
 * • استفاده از localStorage broadcast (broadcastChannel)
 * • استفاده از یه API endpoint ساده (اگه موجود باشه)
 * • fallback: URL fragment encoding
 * • سازگار با GitHub Pages (هم client-side)
 */

(function() {
  'use strict';
  if (window.DPReferralSyncLoaded) return;
  window.DPReferralSyncLoaded = true;

  const STORAGE_PREFIX = 'dp_ref_event_';
  const MAX_EVENTS = 100;

  // ═══════════════════════════════════════════════════════════════
  // 📡 Broadcast Channel (برای همگام‌سازی در همون مرورگر/tab)
  // ═══════════════════════════════════════════════════════════════
  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('dp-referral');
    }
  } catch (e) {}

  // ═══════════════════════════════════════════════════════════════
  // 💾 ذخیره رویداد دعوت
  // ═══════════════════════════════════════════════════════════════
  function saveEvent(event) {
    try {
      const key = STORAGE_PREFIX + event.refCode + '_' + event.userId;
      localStorage.setItem(key, JSON.stringify({
        ...event,
        syncedAt: Date.now()
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getEvents(refCode) {
    const events = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX) && key.includes('_' + refCode + '_')) {
          try {
            events.push(JSON.parse(localStorage.getItem(key)));
          } catch (e) {}
        }
      }
    } catch (e) {}
    return events;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 API endpoint (اختیاری - اگه سرور موجود باشه)
  // ═══════════════════════════════════════════════════════════════
  async function apiRegister(referrerCode, newUserId, newUserName) {
    const apiUrl = window.DP_REFERRAL_API_URL;
    if (!apiUrl) return { ok: false, reason: 'no-api' };

    try {
      const res = await fetch(apiUrl + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refCode: referrerCode,
          userId: newUserId,
          userName: newUserName,
          timestamp: Date.now()
        })
      });
      if (res.ok) {
        return { ok: true };
      }
    } catch (e) {}
    return { ok: false, reason: 'api-error' };
  }

  async function apiCheck(refCode) {
    const apiUrl = window.DP_REFERRAL_API_URL;
    if (!apiUrl) return { ok: false, reason: 'no-api' };

    try {
      const res = await fetch(apiUrl + '/invites?ref=' + encodeURIComponent(refCode));
      if (res.ok) {
        const data = await res.json();
        return { ok: true, invites: data.invites || [] };
      }
    } catch (e) {}
    return { ok: false, reason: 'api-error' };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔗 ثبت دعوت (زمانی که کاربر جدید با ?ref=CODE میاد)
  // ═══════════════════════════════════════════════════════════════
  async function registerNewUserInvite(referrerCode, newUserId, newUserName) {
    if (!referrerCode || !newUserId) return { ok: false, error: 'missing-params' };

    const event = {
      type: 'new-user',
      refCode: referrerCode,
      userId: newUserId,
      userName: newUserName,
      timestamp: Date.now()
    };

    // 1) ذخیره محلی
    saveEvent(event);

    // 2) Broadcast در همون مرورگر (برای tab های دیگه)
    if (channel) {
      try {
        channel.postMessage(event);
      } catch (e) {}
    }

    // 3) ارسال به API (اگه موجود باشه)
    const apiResult = await apiRegister(referrerCode, newUserId, newUserName);

    return { ok: true, api: apiResult };
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 دریافت دعوت‌های فرستنده
  // ═══════════════════════════════════════════════════════════════
  async function getInvitesForRefCode(refCode) {
    if (!refCode) return [];

    // 1) محلی
    const local = getEvents(refCode);

    // 2) API (اگه موجود باشه)
    const apiResult = await apiCheck(refCode);
    const apiInvites = apiResult.ok ? apiResult.invites : [];

    // ترکیب بدون duplicate
    const all = [...local];
    apiInvites.forEach(api => {
      if (!all.find(l => l.userId === api.userId)) {
        all.push(api);
      }
    });

    return all;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📥 Listener برای broadcast
  // ═══════════════════════════════════════════════════════════════
  if (channel) {
    channel.addEventListener('message', e => {
      const event = e.data;
      if (!event) return;
      // ذخیره رویداد دریافتی
      if (event.type === 'new-user') {
        saveEvent(event);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 تشخیص URL
  // ═══════════════════════════════════════════════════════════════
  function detectReferralFromURL() {
    try {
      const url = new URL(location.href);
      const ref = url.searchParams.get('ref') || url.searchParams.get('referral');
      if (ref && /^[A-Z0-9-]{3,20}$/i.test(ref)) {
        return ref.toUpperCase();
      }
    } catch (e) {}
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 راه‌اندازی
  // ═══════════════════════════════════════════════════════════════
  function init() {
    // ذخیره refCode در sessionStorage برای استفاده بعد از ثبت‌نام
    const refCode = detectReferralFromURL();
    if (refCode) {
      try {
        sessionStorage.setItem('dp-pending-ref', refCode);
      } catch (e) {}
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📡 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPReferralSync = {
    registerNewUserInvite: registerNewUserInvite,
    getInvitesForRefCode: getInvitesForRefCode,
    detectReferralFromURL: detectReferralFromURL,
    init: init,
    // تنظیمات
    setApiUrl: (url) => { window.DP_REFERRAL_API_URL = url; },
  };

  // auto init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🔗 DPReferralSync v1.0 loaded');
})();
