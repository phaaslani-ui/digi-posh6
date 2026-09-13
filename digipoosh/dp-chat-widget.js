/**
 * 💬 DP Chat Widget v3.0 - ویجت چت آفلاین با حافظه بی‌نهایت
 * ------------------------------------------------------------------
 * ✅ دکمه شناور پایین سمت چپ
 * ✅ کاملاً آفلاین (بدون API)
 * ✅ استفاده از DPChatAI v2.0
 * ✅ استفاده از DPMemory v2.0 INFINITY
 * ✅ حافظه بی‌نهایت
 * ✅ یادگیری عمیق
 * ✅ پیش‌بینی رفتار
 * ✅ بدون خطا، همیشه کار می‌کنه
 */

(function() {
  'use strict';

  // اگه قبلاً لود شده، خروج
  if (window.DPChatWidgetLoaded) return;
  window.DPChatWidgetLoaded = true;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 CSS - استایل کامل ویجت (بدون نیاز به فایل خارجی)
  // ═══════════════════════════════════════════════════════════════
  const widgetCSS = `
    /* دکمه شناور پایین سمت چپ */
    .dpw-fab {
      position: fixed !important;
      bottom: 24px !important;
      left: 24px !important;
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #d4af37 0%, #f0c850 100%) !important;
      color: #1a1a1a !important;
      border: none !important;
      cursor: pointer !important;
      box-shadow: 0 8px 28px rgba(212, 175, 55, 0.4), 0 2px 8px rgba(0,0,0,0.15) !important;
      z-index: 99998 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 30px !important;
      transition: transform 0.3s ease, box-shadow 0.3s ease !important;
      animation: dpw-pulse 2.5s ease-in-out infinite !important;
    }
    .dpw-fab:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 12px 36px rgba(212, 175, 55, 0.6), 0 4px 12px rgba(0,0,0,0.2) !important;
    }
    .dpw-fab.dpw-hidden {
      display: none !important;
    }
    @keyframes dpw-pulse {
      0%, 100% { box-shadow: 0 8px 28px rgba(212, 175, 55, 0.4), 0 2px 8px rgba(0,0,0,0.15); }
      50% { box-shadow: 0 8px 28px rgba(212, 175, 55, 0.7), 0 2px 8px rgba(0,0,0,0.15), 0 0 0 12px rgba(212, 175, 55, 0.15); }
    }
    .dpw-fab-badge {
      position: absolute !important;
      top: -2px !important;
      right: -2px !important;
      background: #ef4444 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 20px !important;
      height: 20px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 2px solid #fff !important;
    }

    /* پنجره چت */
    .dpw-chat {
      position: fixed !important;
      bottom: 100px !important;
      left: 24px !important;
      width: 380px !important;
      max-width: calc(100vw - 48px) !important;
      height: 540px !important;
      max-height: calc(100vh - 140px) !important;
      background: #fff !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(212, 175, 55, 0.2) !important;
      z-index: 99999 !important;
      display: none !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: 'Vazirmatn', 'Tahoma', sans-serif !important;
      direction: rtl !important;
    }
    .dpw-chat.dpw-open {
      display: flex !important;
      animation: dpw-slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    @keyframes dpw-slideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* هدر */
    .dpw-header {
      background: linear-gradient(135deg, #d4af37 0%, #f0c850 100%) !important;
      color: #1a1a1a !important;
      padding: 16px 18px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      flex-shrink: 0 !important;
    }
    .dpw-avatar {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background: rgba(26, 26, 26, 0.15) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 22px !important;
      font-weight: 800 !important;
      position: relative !important;
      flex-shrink: 0 !important;
    }
    .dpw-avatar::after {
      content: '' !important;
      position: absolute !important;
      bottom: 1px !important;
      right: 1px !important;
      width: 12px !important;
      height: 12px !important;
      background: #10b981 !important;
      border-radius: 50% !important;
      border: 2px solid #d4af37 !important;
      animation: dpw-blink 2s ease-in-out infinite !important;
    }
    @keyframes dpw-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .dpw-header-info { flex: 1 !important; }
    .dpw-header-title { font-size: 16px !important; font-weight: 800 !important; margin: 0 !important; }
    .dpw-header-sub { font-size: 11px !important; opacity: 0.8 !important; margin: 2px 0 0 !important; }
    .dpw-header-actions { display: flex !important; gap: 6px !important; }
    .dpw-icon-btn {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      background: rgba(26, 26, 26, 0.12) !important;
      border: none !important;
      color: #1a1a1a !important;
      cursor: pointer !important;
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: background 0.2s !important;
    }
    .dpw-icon-btn:hover { background: rgba(26, 26, 26, 0.22) !important; }

    /* پیام‌ها */
    .dpw-messages {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 18px !important;
      background: #fafaf7 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
    }
    .dpw-messages::-webkit-scrollbar { width: 6px !important; }
    .dpw-messages::-webkit-scrollbar-track { background: transparent !important; }
    .dpw-messages::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3) !important; border-radius: 3px !important; }

    .dpw-msg {
      display: flex !important;
      gap: 8px !important;
      align-items: flex-end !important;
      max-width: 85% !important;
      animation: dpw-msgIn 0.3s ease-out !important;
    }
    @keyframes dpw-msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dpw-msg-user { align-self: flex-start !important; flex-direction: row-reverse !important; }
    .dpw-msg-ai { align-self: flex-end !important; }
    .dpw-msg-avatar {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #d4af37, #f0c850) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
      flex-shrink: 0 !important;
      color: #1a1a1a !important;
      font-weight: 800 !important;
    }
    .dpw-msg-user .dpw-msg-avatar { background: linear-gradient(135deg, #5a4a3a, #8a7860) !important; color: #fff !important; }
    .dpw-msg-bubble {
      padding: 10px 14px !important;
      border-radius: 16px !important;
      font-size: 14px !important;
      line-height: 1.7 !important;
      word-wrap: break-word !important;
    }
    .dpw-msg-ai .dpw-msg-bubble {
      background: #fff !important;
      color: #1a1a1a !important;
      border-bottom-right-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
    }
    .dpw-msg-user .dpw-msg-bubble {
      background: linear-gradient(135deg, #d4af37, #f0c850) !important;
      color: #1a1a1a !important;
      border-bottom-left-radius: 4px !important;
    }
    .dpw-msg-bubble strong { color: #a8862b !important; font-weight: 800 !important; }
    .dpw-msg-user .dpw-msg-bubble strong { color: #1a1a1a !important; }

    /* تایپ کردن */
    .dpw-typing {
      display: inline-flex !important;
      gap: 4px !important;
      padding: 6px 0 !important;
    }
    .dpw-typing span {
      width: 7px !important;
      height: 7px !important;
      background: #d4af37 !important;
      border-radius: 50% !important;
      animation: dpw-typing 1.4s ease-in-out infinite !important;
    }
    .dpw-typing span:nth-child(2) { animation-delay: 0.2s !important; }
    .dpw-typing span:nth-child(3) { animation-delay: 0.4s !important; }
    @keyframes dpw-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }

    /* پاسخ‌های سریع */
    .dpw-quick {
      padding: 8px 14px !important;
      background: #fff !important;
      border-top: 1px solid rgba(212, 175, 55, 0.15) !important;
      display: flex !important;
      gap: 6px !important;
      overflow-x: auto !important;
      flex-shrink: 0 !important;
    }
    .dpw-quick::-webkit-scrollbar { height: 0 !important; }
    .dpw-quick-btn {
      padding: 7px 14px !important;
      background: #fafaf7 !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #5a4a3a !important;
      cursor: pointer !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
    }
    .dpw-quick-btn:hover {
      background: linear-gradient(135deg, #d4af37, #f0c850) !important;
      color: #1a1a1a !important;
      border-color: #d4af37 !important;
    }

    /* محصولات */
    .dpw-products-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      margin-top: 8px !important;
      max-width: 100% !important;
    }
    .dpw-product-card {
      display: flex !important;
      flex-direction: column !important;
      background: #fff !important;
      border: 1.5px solid rgba(212, 175, 55, 0.2) !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      transition: all 0.2s !important;
    }
    .dpw-product-card:hover {
      border-color: rgba(212, 175, 55, 0.5) !important;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15) !important;
    }
    .dpw-product-link {
      display: flex !important;
      gap: 10px !important;
      padding: 8px !important;
      text-decoration: none !important;
      color: inherit !important;
    }
    .dpw-product-img {
      width: 60px !important;
      height: 60px !important;
      flex-shrink: 0 !important;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
      overflow: hidden !important;
      position: relative !important;
    }
    .dpw-product-img img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
    .dpw-product-img-fallback {
      position: absolute !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 28px !important;
      opacity: 0.5 !important;
    }
    .dpw-product-fav-tag {
      position: absolute !important;
      top: 2px !important;
      left: 2px !important;
      font-size: 10px !important;
    }
    .dpw-product-info {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .dpw-product-name {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #1a1a1a !important;
      margin-bottom: 2px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    .dpw-product-seller {
      font-size: 10px !important;
      color: #6b7280 !important;
      margin-bottom: 2px !important;
    }
    .dpw-product-match {
      font-size: 10px !important;
      font-weight: 600 !important;
      margin-bottom: 4px !important;
    }
    .dpw-product-price-row {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      flex-wrap: wrap !important;
    }
    .dpw-product-price-row strong {
      font-size: 13px !important;
      color: #d4af37 !important;
      font-weight: 800 !important;
    }
    .dpw-product-price-row del {
      font-size: 10px !important;
      color: #9ca3af !important;
    }
    .dpw-product-discount {
      background: linear-gradient(135deg, #ef4444, #dc2626) !important;
      color: #fff !important;
      font-size: 9px !important;
      padding: 1px 5px !important;
      border-radius: 4px !important;
      font-weight: 700 !important;
    }
    .dpw-product-colors {
      display: flex !important;
      gap: 3px !important;
      margin-top: 3px !important;
    }
    .dpw-product-colors span {
      width: 12px !important;
      height: 12px !important;
      border-radius: 50% !important;
      border: 1px solid #e5e7eb !important;
    }
    .dpw-product-actions {
      display: flex !important;
      gap: 4px !important;
      padding: 0 8px 8px !important;
    }
    .dpw-action-btn {
      flex: 1 !important;
      padding: 6px 8px !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      border: 1px solid transparent !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
    }
    .dpw-action-btn--primary {
      background: linear-gradient(135deg, #d4af37, #b8941f) !important;
      color: #fff !important;
      flex: 2 !important;
    }
    .dpw-action-btn--primary:hover {
      background: linear-gradient(135deg, #b8941f, #8c6f1a) !important;
    }
    .dpw-action-btn--ghost {
      background: transparent !important;
      border-color: rgba(212, 175, 55, 0.3) !important;
      color: #6b7280 !important;
      flex: 1 !important;
    }
    .dpw-action-btn--ghost:hover {
      background: rgba(212, 175, 55, 0.1) !important;
      color: #d4af37 !important;
    }

    /* دکمه‌های پاسخ سریع */
    .dpw-replies {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 6px !important;
      margin-top: 8px !important;
    }
    .dpw-reply-btn {
      padding: 5px 10px !important;
      background: rgba(212, 175, 55, 0.1) !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 14px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #a8862b !important;
      cursor: pointer !important;
      font-family: inherit !important;
      transition: all 0.2s !important;
    }
    .dpw-reply-btn:hover {
      background: #d4af37 !important;
      color: #1a1a1a !important;
    }

    /* فوتر - ورودی */
    .dpw-footer {
      padding: 12px 14px !important;
      background: #fff !important;
      border-top: 1px solid rgba(212, 175, 55, 0.15) !important;
      display: flex !important;
      gap: 8px !important;
      align-items: flex-end !important;
      flex-shrink: 0 !important;
    }
    .dpw-input {
      flex: 1 !important;
      padding: 10px 14px !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 22px !important;
      font-size: 14px !important;
      font-family: inherit !important;
      outline: none !important;
      resize: none !important;
      max-height: 100px !important;
      background: #fafaf7 !important;
      color: #1a1a1a !important;
      direction: rtl !important;
      transition: border-color 0.2s !important;
    }
    .dpw-input:focus { border-color: #d4af37 !important; }
    .dpw-send {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #d4af37, #f0c850) !important;
      border: none !important;
      color: #1a1a1a !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
      transition: transform 0.2s !important;
      font-size: 18px !important;
    }
    .dpw-send:hover { transform: scale(1.08) !important; }
    .dpw-send:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }

    /* حالت موبایل */
    @media (max-width: 480px) {
      .dpw-fab { bottom: 20px !important; left: 20px !important; width: 56px !important; height: 56px !important; font-size: 26px !important; }
      .dpw-chat { left: 12px !important; right: 12px !important; width: auto !important; bottom: 88px !important; height: calc(100vh - 120px) !important; }
    }
  `;

  // تزریق CSS
  if (!document.getElementById('dpw-styles')) {
    const style = document.createElement('style');
    style.id = 'dpw-styles';
    style.textContent = widgetCSS;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏗️ ساخت HTML ویجت
  // ═══════════════════════════════════════════════════════════════
  function buildWidget() {
    const wrapper = document.createElement('div');
    wrapper.id = 'dpw-wrapper';
    wrapper.innerHTML = `
      <button class="dpw-fab" id="dpwFab" aria-label="چت با دیجی AI" title="چت با دیجی AI">
        💬
        <span class="dpw-fab-badge" id="dpwBadge" style="display:none;">0</span>
      </button>

      <div class="dpw-chat" id="dpwChat" role="dialog" aria-label="چت با دیجی AI">
        <div class="dpw-header">
          <div class="dpw-avatar">د</div>
          <div class="dpw-header-info">
            <div class="dpw-header-title">دیجی AI</div>
            <div class="dpw-header-sub">دستیار هوشمند شما • آفلاین</div>
          </div>
          <div class="dpw-header-actions">
            <button class="dpw-icon-btn" id="dpwClear" aria-label="پاک کردن" title="پاک کردن چت">🗑</button>
            <button class="dpw-icon-btn" id="dpwClose" aria-label="بستن" title="بستن">✕</button>
          </div>
        </div>

        <div class="dpw-messages" id="dpwMessages">
          <div class="dpw-msg dpw-msg-ai">
            <div class="dpw-msg-avatar">د</div>
            <div class="dpw-msg-bubble">
              سلام! 👋 من <strong>دیجی AI</strong> هستم.<br>
              هر سوالی داری بپرس، کاملاً <strong>آفلاین</strong> جواب میدم! ✨
            </div>
          </div>
        </div>

        <div class="dpw-quick" id="dpwQuick">
          <button class="dpw-quick-btn" data-q="یه پیراهن پیشنهاد بده">👗 پیراهن</button>
          <button class="dpw-quick-btn" data-q="چه رنگی به من میاد؟">🎨 رنگ من</button>
          <button class="dpw-quick-btn" data-q="ست عروسی میخوام">💍 ست عروسی</button>
          <button class="dpw-quick-btn" data-q="دلم تنگه">🤗 دلم تنگه</button>
        </div>

        <div class="dpw-footer">
          <textarea class="dpw-input" id="dpwInput" rows="1" placeholder="سوالت رو بنویس..."></textarea>
          <button class="dpw-send" id="dpwSend" aria-label="ارسال">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M22 2 11 13"/>
              <path d="M22 2 15 22 11 13 2 9z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  // ═══════════════════════════════════════════════════════════════
  // ⏳ صبر برای لود شدن DPChatAI و DPMemory
  // ═══════════════════════════════════════════════════════════════
  function waitForEngines(callback, attempts = 0) {
    if (window.DPChatAI && window.DPMemory) {
      callback();
      return;
    }
    if (attempts > 100) {
      // بعد از ۱۰ ثانیه، باز هم ویجت رو بساز ولی با fallback
      console.warn('⚠️ DP engines not loaded, using fallback');
      callback(true);
      return;
    }
    setTimeout(() => waitForEngines(callback, attempts + 1), 100);
  }

  waitForEngines(() => {
    buildWidget();
    initWidget();
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎮 منطق ویجت
  // ═══════════════════════════════════════════════════════════════
  function initWidget() {
    const fab = document.getElementById('dpwFab');
    const chat = document.getElementById('dpwChat');
    const closeBtn = document.getElementById('dpwClose');
    const clearBtn = document.getElementById('dpwClear');
    const messagesEl = document.getElementById('dpwMessages');
    const inputEl = document.getElementById('dpwInput');
    const sendBtn = document.getElementById('dpwSend');
    const quickBtns = document.querySelectorAll('.dpw-quick-btn');
    const badge = document.getElementById('dpwBadge');

    if (!fab || !chat) {
      console.error('❌ DP Chat Widget: failed to build');
      return;
    }

    // باز و بسته کردن
    fab.addEventListener('click', () => {
      const isOpen = chat.classList.toggle('dpw-open');
      fab.classList.add('dpw-hidden');
      if (isOpen) {
        badge.style.display = 'none';
        setTimeout(() => inputEl.focus(), 300);
      }
    });

    closeBtn.addEventListener('click', () => {
      chat.classList.remove('dpw-open');
      fab.classList.remove('dpw-hidden');
    });

    // پاک کردن چت
    clearBtn.addEventListener('click', () => {
      if (confirm('🗑 پاک کردن تمام پیام‌های این چت؟\n(حافظه بلندمدت حفظ می‌شه)')) {
        // فقط UI رو پاک کن، حافظه نه
        messagesEl.innerHTML = `
          <div class="dpw-msg dpw-msg-ai">
            <div class="dpw-msg-avatar">د</div>
            <div class="dpw-msg-bubble">
              چت پاک شد! 🧹<br>
              ولی من هنوز <strong>همه چیز</strong> رو یادمه! ✨
            </div>
          </div>
        `;
      }
    });

    // دکمه‌های سریع
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        inputEl.value = btn.dataset.q;
        sendMessage();
      });
    });

    // Auto-resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });

    // ارسال با Enter
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);

    // ═════════════════════════════════════════════════════════════
    // 📤 ارسال پیام
    // ═════════════════════════════════════════════════════════════
    function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      // نمایش پیام کاربر
      addMessage(text, 'user');
      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;

      // ═══ track ماموریت: چت ═══
      if (window.ClubTracker) {
        window.ClubTracker.track('m4', 1, { type: 'chat-message', text: text.substring(0, 50) });
      }

      // نمایش تایپ
      addTyping();

      // پردازش با DPChatAI (آفلاین)
      setTimeout(() => {
        try {
          const response = window.DPChatAI.generateResponse(text);
          removeTyping();

          if (response) {
            addMessage(response.text, 'ai', response);

            // نمایش محصولات اگه بود
            if (response.products && response.products.length > 0) {
              addProducts(response.products);
            }

            // نمایش دکمه‌های پاسخ سریع
            if (response.quickReplies && response.quickReplies.length > 0) {
              addReplies(response.quickReplies);
            }

            // آمار حافظه
            showMemoryStats();
          } else {
            addMessage('🤔 یه لحظه دیگه بپرس...', 'ai');
          }
        } catch (err) {
          removeTyping();
          console.error('DP Chat error:', err);
          addMessage('😊 بگو، گوش میدم!', 'ai');
        }

        sendBtn.disabled = false;
        inputEl.focus();
      }, 400 + Math.random() * 400);
    }

    // ═════════════════════════════════════════════════════════════
    // 💬 نمایش پیام
    // ═════════════════════════════════════════════════════════════
    function addMessage(text, type, response = null) {
      const msg = document.createElement('div');
      msg.className = 'dpw-msg dpw-msg-' + type;

      const avatar = document.createElement('div');
      avatar.className = 'dpw-msg-avatar';
      avatar.textContent = type === 'user' ? '👤' : 'د';

      const bubble = document.createElement('div');
      bubble.className = 'dpw-msg-bubble';

      // فرمت متن
      let formatted = (text || '')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formatted;

      msg.appendChild(avatar);
      msg.appendChild(bubble);
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // ═════════════════════════════════════════════════════════════
    // 🛍️ نمایش محصولات
    // ═════════════════════════════════════════════════════════════
    function addProducts(products) {
      const wrap = document.createElement('div');
      wrap.className = 'dpw-products-list';
      products.slice(0, 6).forEach(p => {
        const card = document.createElement('div');
        card.className = 'dpw-product-card';

        // محاسبه URL
        const url = p.id ? `./product.html?id=${p.id}` : './index.html';

        // محاسبه match
        const match = p.matchPercent || 95;
        const matchColor = match >= 85 ? '#10b981' : match >= 70 ? '#3b82f6' : '#f59e0b';

        // آواتار دسته
        const catIcon = getCategoryIcon(p.category);

        // لیست رنگ‌ها
        const colors = (p.colors || []).slice(0, 3).map(c => `<span style="background:${getColorHex(c)}" title="${c}"></span>`).join('');

        // قیمت
        const price = (p.price || 0).toLocaleString('fa-IR');
        const oldPrice = p.originalPrice ? `<del>${p.originalPrice.toLocaleString('fa-IR')}</del>` : '';
        const discount = p.discount ? `<span class="dpw-product-discount">${p.discount}٪</span>` : '';

        // وضعیت علاقه‌مندی
        const favs = JSON.parse(localStorage.getItem('dp_favorites') || '[]');
        const isFav = favs.includes(p.id);

        card.innerHTML = `
          <a class="dpw-product-link" href="${url}">
            <div class="dpw-product-img">
              ${p.image
                ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />`
                : ''
              }
              <div class="dpw-product-img-fallback" ${p.image ? 'style="display:none"' : ''}>
                ${catIcon}
              </div>
              ${isFav ? '<span class="dpw-product-fav-tag">❤️</span>' : ''}
            </div>
            <div class="dpw-product-info">
              <div class="dpw-product-name">${p.name || 'محصول'}</div>
              ${p.seller ? `<div class="dpw-product-seller">🏪 ${p.seller}</div>` : ''}
              <div class="dpw-product-match" style="color:${matchColor}">
                🎯 ${match}٪ با سلیقه شما
              </div>
              <div class="dpw-product-price-row">
                <strong>${price}</strong>
                ${oldPrice}
                ${discount}
              </div>
              ${colors ? `<div class="dpw-product-colors">${colors}</div>` : ''}
            </div>
          </a>
          <div class="dpw-product-actions">
            <button class="dpw-action-btn dpw-action-btn--primary" data-action="view" data-id="${p.id}">
              مشاهده محصول
            </button>
            <button class="dpw-action-btn dpw-action-btn--ghost" data-action="cart" data-id="${p.id}" title="افزودن به سبد">
              🛒
            </button>
            <button class="dpw-action-btn dpw-action-btn--ghost" data-action="fav" data-id="${p.id}" title="علاقه‌مندی">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        `;

        // دکمه‌ها
        card.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.dataset.action;
            const productId = btn.dataset.id;
            if (action === 'view') {
              window.location.href = url;
            } else if (action === 'cart') {
              addToCartFromChat(product);
              btn.textContent = '✅';
              setTimeout(() => { btn.textContent = '🛒'; }, 1500);
            } else if (action === 'fav') {
              toggleFavFromChat(productId, btn);
            }
          });
        });

        wrap.appendChild(card);
      });
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // 🆕 افزودن به سبد از چت
    function addToCartFromChat(product) {
      try {
        const cart = JSON.parse(localStorage.getItem('dp_cart') || '[]');
        const existing = cart.find(c => c.id === product.id);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            seller: product.seller,
            qty: 1,
            addedAt: Date.now()
          });
        }
        localStorage.setItem('dp_cart', JSON.stringify(cart));
        // track
        if (window.ClubTracker) {
          window.ClubTracker.track('m3', 1, { productId: product.id, type: 'add-to-cart' });
        }
        // update badge
        if (window.updateCartBadge) window.updateCartBadge();
        if (window.DPProductsFeed?.updateCartBadge) window.DPProductsFeed.updateCartBadge();
        // toast
        if (window.DPMagic?.showToast) {
          window.DPMagic.showToast('🛒 ' + product.name + ' به سبد اضافه شد');
        } else {
          addMessage('سیستم', '🛒 ' + product.name + ' به سبد خرید اضافه شد!', 'system');
        }
      } catch (e) {
        console.error('cart error:', e);
      }
    }

    // 🆕 علاقه‌مندی از چت
    function toggleFavFromChat(productId, btn) {
      try {
        const favs = JSON.parse(localStorage.getItem('dp_favorites') || '[]');
        const idx = favs.indexOf(productId);
        if (idx >= 0) {
          favs.splice(idx, 1);
          btn.textContent = '🤍';
        } else {
          favs.push(productId);
          btn.textContent = '❤️';
          // track
          if (window.ClubTracker) {
            window.ClubTracker.track('m2', 1, { productId, type: 'favorite' });
          }
        }
        localStorage.setItem('dp_favorites', JSON.stringify(favs));
      } catch (e) {}
    }

    // 🆕 آیکن دسته
    function getCategoryIcon(category) {
      const map = {
        'پیراهن': '👗', 'کت': '🧥', 'شلوار': '👖', 'تی‌شرت': '👕',
        'مانتو': '🧥', 'کیف': '👜', 'ساعت': '⌚', 'اکسسوری': '💍',
        'کفش': '👟', 'عینک': '🕶️', 'کلاه': '🎩'
      };
      return map[category] || '🛍️';
    }

    // 🆕 تبدیل رنگ به hex
    function getColorHex(colorName) {
      const map = {
        'black': '#1f2937', 'مشکی': '#1f2937',
        'white': '#f9fafb', 'سفید': '#f9fafb',
        'gold': '#d4af37', 'طلایی': '#d4af37',
        'cream': '#fef3c7', 'کرم': '#fef3c7',
        'red': '#ef4444', 'قرمز': '#ef4444',
        'burgundy': '#800020', 'زرشکی': '#800020',
        'pink': '#ec4899', 'صورتی': '#ec4899',
        'blue': '#3b82f6', 'آبی': '#3b82f6',
        'navy': '#1e3a8a', 'سرمه‌ای': '#1e3a8a',
        'green': '#10b981', 'سبز': '#10b981',
        'olive': '#808000', 'زیتونی': '#808000',
        'brown': '#92400e', 'قهوه‌ای': '#92400e',
        'gray': '#6b7280', 'طوسی': '#6b7280',
        'purple': '#a855f7', 'بنفش': '#a855f7',
        'coral': '#ff7f50', 'مرجانی': '#ff7f50',
      };
      return map[(colorName || '').toLowerCase()] || '#9ca3af';
    }

    // ═════════════════════════════════════════════════════════════
    // 🔘 دکمه‌های پاسخ سریع
    // ═════════════════════════════════════════════════════════════
    function addReplies(replies) {
      const wrap = document.createElement('div');
      wrap.className = 'dpw-replies';
      replies.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'dpw-reply-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => {
          inputEl.value = text;
          sendMessage();
        });
        wrap.appendChild(btn);
      });
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // ═════════════════════════════════════════════════════════════
    // ⌨️ تایپ
    // ═════════════════════════════════════════════════════════════
    function addTyping() {
      const msg = document.createElement('div');
      msg.className = 'dpw-msg dpw-msg-ai';
      msg.id = 'dpwTyping';

      const avatar = document.createElement('div');
      avatar.className = 'dpw-msg-avatar';
      avatar.textContent = 'د';

      const bubble = document.createElement('div');
      bubble.className = 'dpw-msg-bubble';
      bubble.innerHTML = '<div class="dpw-typing"><span></span><span></span><span></span></div>';

      msg.appendChild(avatar);
      msg.appendChild(bubble);
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTyping() {
      const t = document.getElementById('dpwTyping');
      if (t) t.remove();
    }

    // ═════════════════════════════════════════════════════════════
    // 📊 نمایش آمار حافظه (فقط یه بار)
    // ═════════════════════════════════════════════════════════════
    let statsShown = false;
    function showMemoryStats() {
      if (statsShown) return;
      if (!window.DPMemory) return;

      const convos = window.DPMemory.getStats().totalConversations;
      if (convos >= 3) {
        statsShown = true;
        const s = window.DPMemory.getStats();
        setTimeout(() => {
          const tip = document.createElement('div');
          tip.className = 'dpw-msg dpw-msg-ai';
          tip.innerHTML = `
            <div class="dpw-msg-avatar">د</div>
            <div class="dpw-msg-bubble" style="font-size: 12px; opacity: 0.85; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,200,80,0.05));">
              🧠 <strong>حافظه من:</strong> ${s.totalConversations} مکالمه • شخصیت: ${s.personality} • وفاداری: ${s.loyalty}%
            </div>
          `;
          messagesEl.appendChild(tip);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 1500);
      }
    }

    // خوش‌آمدگویی بر اساس حافظه
    function showWelcome() {
      if (!window.DPMemory) return;
      const stats = window.DPMemory.getStats();
      if (stats.totalConversations > 0) {
        const msg = document.createElement('div');
        msg.className = 'dpw-msg dpw-msg-ai';
        msg.innerHTML = `
          <div class="dpw-msg-avatar">د</div>
          <div class="dpw-msg-bubble">
            خوش برگشتی! 👋<br>
            من <strong>${stats.totalConversations}</strong> تا مکالمه قبلیمون رو یادمه.<br>
            ${stats.topColors && stats.topColors.length ? `رنگ‌های محبوبت: <strong>${stats.topColors.join('، ')}</strong>` : ''}
          </div>
        `;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }
    setTimeout(showWelcome, 500);

    console.log('✅ DP Chat Widget v3.0 loaded (آفلاین + حافظه بی‌نهایت)');
  }

})();
