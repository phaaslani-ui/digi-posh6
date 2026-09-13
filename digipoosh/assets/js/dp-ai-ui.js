/**
 * ============================================================
 *  دیجی‌پوش — رابط کاربری چت AI
 *  ------------------------------------------------------------
 *  طراحی فارسی، RTL، شیشه‌ای
 *  ============================================================
 */
(function() {
  'use strict';

  if (!window.DP_AI) {
    console.error('❌ dp-ai-client.js باید قبل بارگذاری شود');
    return;
  }

  const ChatUI = {
    container: null,
    messages: [],
    isOpen: false,
    isTyping: false,
    
    // ═══ ایجاد رابط ═══
    init() {
      if (document.getElementById('dp-ai-chat')) return;
      
      this.createElements();
      this.attachEvents();
      this.addWelcome();
    },
    
    createElements() {
      // دکمه شناور
      const fab = document.createElement('button');
      fab.id = 'dp-ai-fab';
      fab.className = 'dp-ai-fab';
      fab.setAttribute('aria-label', 'چت با دیجی AI');
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.61 0-3.11-.45-4.39-1.23l-.31-.18-3.08.86.86-3.08-.18-.31C3.45 15.11 3 13.61 3 12c0-4.96 4.04-9 9-9s9 4.04 9 9-4.04 9-9 9z"/>
          <circle cx="8.5" cy="12" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="15.5" cy="12" r="1.5"/>
        </svg>
        <span class="dp-ai-fab-pulse"></span>
      `;
      document.body.appendChild(fab);
      this.fab = fab;
      
      // پنجره چت
      const chat = document.createElement('div');
      chat.id = 'dp-ai-chat';
      chat.className = 'dp-ai-chat';
      chat.innerHTML = `
        <div class="dp-ai-header">
          <div class="dp-ai-avatar">
            <div class="dp-ai-avatar-inner">دیجی</div>
            <span class="dp-ai-status"></span>
          </div>
          <div class="dp-ai-info">
            <div class="dp-ai-title">دیجی AI</div>
            <div class="dp-ai-subtitle">${window.DP_AI.isConfigured() ? 'آنلاین و آماده پاسخ' : 'آفلاین - کلید API تنظیم نشده'}</div>
          </div>
          <div class="dp-ai-actions">
            <button class="dp-ai-action" data-action="clear" title="پاک کردن گفتگو">🗑️</button>
            <button class="dp-ai-action" data-action="trends" title="ترندهای روز">📰</button>
            <button class="dp-ai-action" data-action="close" title="بستن">✕</button>
          </div>
        </div>
        
        <div class="dp-ai-messages" id="dp-ai-messages">
        </div>
        
        <div class="dp-ai-quota" id="dp-ai-quota" title="سهمیه روزانه"></div>
        
        <div class="dp-ai-quick">
          <button class="dp-ai-quick-btn" data-prompt="۳ ست لباس مجلسی برای عید نوروز پیشنهاد بده">👗 مجلسی</button>
          <button class="dp-ai-quick-btn" data-prompt="ترندهای روز مد چیست؟">🔥 ترندها</button>
          <button class="dp-ai-quick-btn" data-prompt="چه رنگی به پوست من می‌آید؟">🎨 رنگ مناسب</button>
          <button class="dp-ai-quick-btn" data-prompt="یه ست اسپرت شیک برای دانشگاه">👕 اسپرت</button>
        </div>
        
        <div class="dp-ai-input-area">
          <textarea 
            id="dp-ai-input" 
            class="dp-ai-input" 
            placeholder="سوالت رو بپرس..."
            rows="1"
          ></textarea>
          <button id="dp-ai-send" class="dp-ai-send" aria-label="ارسال">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      `;
      document.body.appendChild(chat);
      this.container = chat;
    },
    
    attachEvents() {
      // باز/بسته کردن
      this.fab.addEventListener('click', () => this.toggle());
      this.container.querySelector('[data-action="close"]').addEventListener('click', () => this.close());
      this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clearChat());
      this.container.querySelector('[data-action="trends"]').addEventListener('click', () => this.showTrends());
      
      // ارسال پیام
      const input = this.container.querySelector('#dp-ai-input');
      const sendBtn = this.container.querySelector('#dp-ai-send');
      
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
      
      // دکمه‌های سریع
      this.container.querySelectorAll('.dp-ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          input.value = btn.dataset.prompt;
          this.sendMessage();
        });
      });
    },
    
    // ═══ پیام خوش‌آمد ═══
    addWelcome() {
      const welcome = window.DP_AI.isConfigured() 
        ? `سلام! 👋 من دیجی AI هستم، دستیار هوشمند مد شما.

می‌تونم کمکتون کنم:
• 👗 پیشنهاد ست لباس
• 🎨 مشاوره رنگ
• 🔥 ترندهای روز
• 👔 استایل مناسب مناسبت

چطور میتونم کمکتون کنم؟`
        : `سلام! 👋 من دیجی AI هستم.

⚠️ در حال حاضر در حالت آفلاین هستم.

برای فعال‌سازی کامل:
1️⃣ به https://aistudio.google.com/app/apikey بروید
2️⃣ یک کلید API رایگان بسازید
3️⃣ در فایل seller/js/dp-config.js قرار دهید

ولی میتونم در حالت آفلاین هم کمکت کنم!`;
      
      this.addMessage('ai', welcome);
      this.updateQuota();
    },
    
    // ═══ به‌روزرسانی نمایش سهمیه ═══
    updateQuota() {
      const el = this.container.querySelector('#dp-ai-quota');
      if (!el || !window.DP_Quota) return;
      el.textContent = window.DP_Quota.getStatusText();
    },
    
    // ═══ ارسال پیام ═══
    async sendMessage() {
      const input = this.container.querySelector('#dp-ai-input');
      const text = input.value.trim();
      
      if (!text || this.isTyping) return;
      
      // چک سهمیه
      if (window.DP_Quota) {
        const canReq = window.DP_Quota.canRequest();
        if (!canReq.allowed) {
          this.addMessage('ai', '⚠️ ' + canReq.message);
          return;
        }
      }
      
      input.value = '';
      input.style.height = 'auto';
      
      this.addMessage('user', text);
      this.messages.push({ role: 'user', content: text });
      
      this.setTyping(true);
      
      try {
        const response = await window.DP_AI.chat(text, {
          history: this.messages.slice(0, -1)
        });
        
        this.setTyping(false);
        this.addMessage('ai', response);
        this.messages.push({ role: 'assistant', content: response });
        
        // ثبت درخواست موفق
        if (window.DP_Quota) {
          window.DP_Quota.recordRequest();
        }
      } catch(e) {
        this.setTyping(false);
        
        // بلاک موقت در صورت خطا
        if (window.DP_Quota) {
          window.DP_Quota.block(30000, 'error');
        }
        
        this.addMessage('ai', '❌ خطا: ' + e.message);
      }
    },
    
    // ═══ نمایش ترندها ═══
    async showTrends() {
      this.addMessage('user', '📰 ترندهای روز رو بگو');
      this.setTyping(true);
      
      try {
        const trends = await window.DP_AI.getTrends(true);
        this.setTyping(false);
        
        if (trends.length === 0) {
          this.addMessage('ai', '⚠️ فعلاً نتونستم ترندها رو بگیرم. لطفاً بعداً دوباره امتحان کن.');
          return;
        }
        
        let text = `🔥 **ترندهای روز دنیای مد:**\n\n`;
        trends.slice(0, 10).forEach((t, i) => {
          text += `${i+1}. **${t.title}**\n`;
          text += `   📰 ${t.source}\n`;
          text += `   🔗 [لینک خبر](${t.link})\n\n`;
        });
        
        this.addMessage('ai', text);
      } catch(e) {
        this.setTyping(false);
        this.addMessage('ai', '❌ خطا: ' + e.message);
      }
    },
    
    // ═══ نمایش پیام ═══
    addMessage(role, text) {
      const messagesEl = this.container.querySelector('#dp-ai-messages');
      const msgEl = document.createElement('div');
      msgEl.className = `dp-ai-msg dp-ai-msg-${role}`;
      
      // تبدیل Markdown ساده
      let html = this.formatText(text);
      
      msgEl.innerHTML = `
        <div class="dp-ai-msg-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
        <div class="dp-ai-msg-bubble">${html}</div>
      `;
      
      messagesEl.appendChild(msgEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    },
    
    formatText(text) {
      // Markdown ساده
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\n/g, '<br>')
        .replace(/(\d+)\.\s/g, '<span class="dp-ai-list-num">$1.</span> ');
    },
    
    // ═══ تایپینگ ═══
    setTyping(typing) {
      this.isTyping = typing;
      const messagesEl = this.container.querySelector('#dp-ai-messages');
      
      const existing = messagesEl.querySelector('.dp-ai-typing');
      if (existing) existing.remove();
      
      if (typing) {
        const typingEl = document.createElement('div');
        typingEl.className = 'dp-ai-msg dp-ai-msg-ai dp-ai-typing';
        typingEl.innerHTML = `
          <div class="dp-ai-msg-avatar">🤖</div>
          <div class="dp-ai-msg-bubble">
            <div class="dp-ai-typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        `;
        messagesEl.appendChild(typingEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    },
    
    // ═══ کنترل پنجره ═══
    toggle() {
      this.isOpen ? this.close() : this.open();
    },
    
    open() {
      this.isOpen = true;
      this.container.classList.add('dp-ai-open');
      this.fab.classList.add('dp-ai-fab-hidden');
    },
    
    close() {
      this.isOpen = false;
      this.container.classList.remove('dp-ai-open');
      this.fab.classList.remove('dp-ai-fab-hidden');
    },
    
    clearChat() {
      if (!confirm('گفتگو پاک شود؟')) return;
      this.messages = [];
      const messagesEl = this.container.querySelector('#dp-ai-messages');
      messagesEl.innerHTML = '';
      this.addWelcome();
    }
  };
  
  // ═══ بارگذاری خودکار ═══
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatUI.init());
  } else {
    ChatUI.init();
  }
  
  window.DP_AI_Chat = ChatUI;
  
})();
