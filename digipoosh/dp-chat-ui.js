/* ═══════════════════════════════════════════════════════════════════
 * 💬 DPChatUI v1.0 MAX — رابط کاربری چت هوشمند
 * ------------------------------------------------------------------
 * ✨ ویژگی‌ها:
 * • رابط مدرن با Glassmorphism
 * • پشتیبانی از صدا (Voice Input)
 * • پشتیبانی از ایموجی
 * • نمایش محصولات در چت
 * • Quick Replies
 * • تایپ انیمیشن
 * • Memory Sidebar
 * • Personality Selector
 * • Voice Output (TTS)
 * • Drag & Drop Files
 * • Smart Suggestions
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  if (window.DPChatUI) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, props = {}, ...children) => {
    const e = document.createElement(tag);
    Object.keys(props).forEach(k => {
      if (k === 'class') e.className = props[k];
      else if (k === 'style') Object.assign(e.style, props[k]);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (k === 'html') e.innerHTML = props[k];
      else e.setAttribute(k, props[k]);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ═══════════════════════════════════════════════════════════════
  // 🎨 Main Chat Container
  // ═══════════════════════════════════════════════════════════════
  function createChatWidget() {
    const wrap = el('div', { class: 'dp-chat-widget' });
    wrap.innerHTML = `
      <div class="dp-chat-header">
        <div class="dp-chat-avatar" id="dpChatAvatar">👗</div>
        <div class="dp-chat-info">
          <div class="dp-chat-name">استایلیست AI دیجی‌پوش</div>
          <div class="dp-chat-status">
            <span class="dp-chat-dot"></span>
            <span id="dpChatStatusText">آنلاین</span>
          </div>
        </div>
        <div class="dp-chat-actions">
          <button class="dp-chat-icon-btn" id="dpChatPersonalityBtn" title="شخصیت">🎭</button>
          <button class="dp-chat-icon-btn" id="dpChatMemoryBtn" title="حافظه">🧠</button>
          <button class="dp-chat-icon-btn" id="dpChatClearBtn" title="پاک کردن">🗑️</button>
        </div>
      </div>
      <div class="dp-chat-messages" id="dpChatMessages"></div>
      <div class="dp-chat-quick-replies" id="dpChatQuickReplies"></div>
      <div class="dp-chat-typing" id="dpChatTyping" style="display:none;">
        <div class="dp-chat-typing-dot"></div>
        <div class="dp-chat-typing-dot"></div>
        <div class="dp-chat-typing-dot"></div>
      </div>
      <div class="dp-chat-input-area">
        <button class="dp-chat-attach-btn" id="dpChatEmojiBtn" title="ایموجی">😊</button>
        <button class="dp-chat-attach-btn" id="dpChatVoiceBtn" title="صدا">🎤</button>
        <input type="text" class="dp-chat-input" id="dpChatInput" placeholder="چی تو ذهنته؟ از من بپرس..." />
        <button class="dp-chat-send-btn" id="dpChatSendBtn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      <div class="dp-chat-emoji-panel" id="dpChatEmojiPanel" style="display:none;">
        ${generateEmojiPanel()}
      </div>
    `;
    document.body.appendChild(wrap);

    bindEvents();
    showWelcomeMessage();
    return wrap;
  }

  function generateEmojiPanel() {
    const emojis = {
      '😊 احساس': ['😊', '😄', '😍', '🥰', '😎', '🤔', '😴', '😢', '😠', '🤗', '😋', '🥺'],
      '❤️ عشق': ['❤️', '💕', '💖', '💘', '💝', '🌹', '💐', '💌'],
      '🎉 مناسبت': ['🎉', '🎊', '🎁', '🎂', '🎈', '🥳', '💍', '👰'],
      '👗 مد': ['👗', '👔', '👠', '👢', '👜', '🧣', '🧤', '👒', '🕶️', '💄', '💍', '⌚'],
      '🔥 انرژی': ['🔥', '💪', '⚡', '🚀', '✨', '💥', '🌟', '💫'],
      '👋 سلام': ['👋', '🤝', '🙌', '👏', '👍', '✌️', '🤞', '💯']
    };
    let html = '';
    Object.keys(emojis).forEach(cat => {
      html += `<div class="dp-emoji-category"><div class="dp-emoji-cat-label">${cat}</div><div class="dp-emoji-grid">`;
      emojis[cat].forEach(e => {
        html += `<button class="dp-emoji-btn" data-emoji="${e}">${e}</button>`;
      });
      html += '</div></div>';
    });
    return html;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📩 Message Rendering
  // ═══════════════════════════════════════════════════════════════
  function addMessage(text, sender = 'bot', options = {}) {
    const messages = $('#dpChatMessages');
    if (!messages) return null;

    const msg = el('div', { class: `dp-chat-msg dp-chat-msg-${sender}` });
    const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let html = '';
    if (sender === 'bot') {
      html += '<div class="dp-chat-msg-avatar">👗</div>';
    }
    html += '<div class="dp-chat-msg-bubble">';
    html += `<div class="dp-chat-msg-text">${formatText(text)}</div>`;
    html += `<div class="dp-chat-msg-time">${time}</div>`;
    html += '</div>';

    if (sender === 'user') {
      html += '<div class="dp-chat-msg-avatar dp-chat-msg-avatar-user">👤</div>';
    }

    msg.innerHTML = html;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    // محصولات
    if (options.products && options.products.length) {
      addProductCards(options.products);
    }

    // Quick replies
    if (options.quickReplies && options.quickReplies.length) {
      setTimeout(() => showQuickReplies(options.quickReplies), 300);
    }

    return msg;
  }

  function addProductCards(products) {
    const messages = $('#dpChatMessages');
    if (!messages || !products.length) return;

    const container = el('div', { class: 'dp-chat-products' });
    products.slice(0, 4).forEach(p => {
      const card = el('div', { class: 'dp-chat-product-card' });
      card.innerHTML = `
        <div class="dp-chat-product-image" style="background: linear-gradient(135deg, ${p.color || '#d4af37'}, ${p.color2 || '#a8862b'});">
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" />` : '<div class="dp-chat-product-emoji">' + (p.category?.includes('کفش') ? '👠' : p.category?.includes('کیف') ? '👜' : p.category?.includes('کت') ? '🧥' : p.category?.includes('شلوار') ? '👖' : '👗') + '</div>'}
        </div>
        <div class="dp-chat-product-info">
          <div class="dp-chat-product-name">${esc(p.name)}</div>
          <div class="dp-chat-product-price">${formatPrice(p.price)}</div>
          <div class="dp-chat-product-match" style="background: ${p.levelColor || '#10b981'}20; color: ${p.levelColor || '#10b981'};">
            ${p.levelIcon || '✨'} ${p.matchPercent || 0}٪
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (p.id) window.location.href = `product.html?id=${p.id}`;
        else if (p.link) window.location.href = p.link;
      });
      container.appendChild(card);
    });
    messages.appendChild(container);
    messages.scrollTop = messages.scrollHeight;
  }

  function formatText(text) {
    return esc(text)
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  // ═══════════════════════════════════════════════════════════════
  // ⚡ Quick Replies
  // ═══════════════════════════════════════════════════════════════
  function showQuickReplies(replies) {
    const container = $('#dpChatQuickReplies');
    if (!container) return;
    container.innerHTML = '';
    replies.forEach(text => {
      const btn = el('button', { class: 'dp-chat-quick-reply' });
      btn.textContent = text;
      btn.addEventListener('click', () => {
        container.innerHTML = '';
        sendMessage(text);
      });
      container.appendChild(btn);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 Send Message
  // ═══════════════════════════════════════════════════════════════
  async function sendMessage(text) {
    if (!text || !text.trim()) return;

    addMessage(text, 'user');
    $('#dpChatInput').value = '';
    hideQuickReplies();
    showTyping();

    // شبیه‌سازی تأخیر برای واقعی‌تر شدن
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    hideTyping();

    if (!window.DPChatAI) {
      addMessage('متأسفانه الان موتور چت در دسترس نیست. لطفاً صفحه رو رفرش کن! 😅', 'bot');
      return;
    }

    const response = window.DPChatAI.generateResponse(text);
    addMessage(response.text, 'bot', {
      products: response.products,
      quickReplies: response.quickReplies
    });

    // TTS (اگه فعال باشه)
    if (window.DPChatUI?.ttsEnabled) {
      speakText(response.text);
    }
  }

  function showTyping() {
    const t = $('#dpChatTyping');
    if (t) t.style.display = 'flex';
    const messages = $('#dpChatMessages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const t = $('#dpChatTyping');
    if (t) t.style.display = 'none';
  }
  function hideQuickReplies() {
    const c = $('#dpChatQuickReplies');
    if (c) c.innerHTML = '';
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎤 Voice (TTS + STT)
  // ═══════════════════════════════════════════════════════════════
  let recognition = null;
  function initVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return false;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'fa-IR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      $('#dpChatInput').value = text;
      sendMessage(text);
    };
    recognition.onerror = (e) => {
      addMessage('متأسفانه نشد صدا رو تشخیص بدم. لطفاً تایپ کن! 😅', 'bot');
    };
    return true;
  }

  function toggleVoice() {
    if (!recognition && !initVoice()) {
      addMessage('مرورگر شما از صدا پشتیبانی نمی‌کنه 😔', 'bot');
      return;
    }
    try {
      recognition.start();
      $('#dpChatVoiceBtn').classList.add('recording');
    } catch (e) {
      addMessage('صدا در دسترس نیست. لطفاً دوباره امتحان کن!', 'bot');
    }
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fa-IR';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎭 Personality Selector
  // ═══════════════════════════════════════════════════════════════
  function showPersonalitySelector() {
    const modal = el('div', { class: 'dp-chat-modal-overlay' });
    const personalities = window.DPChatAI?.getPersonalities() || {};
    let html = `
      <div class="dp-chat-modal">
        <div class="dp-chat-modal-header">
          <h3>🎭 انتخاب شخصیت AI</h3>
          <button class="dp-chat-icon-btn" data-close>✕</button>
        </div>
        <div class="dp-personality-grid">
    `;
    Object.keys(personalities).forEach(key => {
      const p = personalities[key];
      html += `
        <button class="dp-personality-card" data-personality="${key}">
          <div class="dp-personality-avatar">${p.avatar}</div>
          <div class="dp-personality-name">${esc(p.name)}</div>
          <div class="dp-personality-features">${p.features.map(f => esc(f)).join(' • ')}</div>
        </button>
      `;
    });
    html += `
        </div>
      </div>
    `;
    modal.innerHTML = html;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.hasAttribute('data-close')) modal.remove();
    });
    modal.querySelectorAll('[data-personality]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-personality');
        localStorage.setItem('dp_chat_personality', key);
        addMessage(`✅ شخصیت به «${personalities[key].name}» تغییر کرد!`, 'bot');
        modal.remove();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 Memory Sidebar
  // ═══════════════════════════════════════════════════════════════
  function showMemory() {
    if (!window.DPChatAI) return;
    const summary = window.DPChatAI.getMemorySummary();
    const session = window.DPChatAI.loadSession();

    const modal = el('div', { class: 'dp-chat-modal-overlay' });
    let html = `
      <div class="dp-chat-modal dp-chat-modal-large">
        <div class="dp-chat-modal-header">
          <h3>🧠 حافظه و یادگیری AI</h3>
          <button class="dp-chat-icon-btn" data-close>✕</button>
        </div>
        <div class="dp-memory-content">
          <div class="dp-memory-stat">
            <div class="dp-memory-stat-value">${summary.totalMessages}</div>
            <div class="dp-memory-stat-label">پیام کل</div>
          </div>
          <div class="dp-memory-stat">
            <div class="dp-memory-stat-value">${summary.sessionLength}</div>
            <div class="dp-memory-stat-label">پیام این جلسه</div>
          </div>
          <div class="dp-memory-stat">
            <div class="dp-memory-stat-value">${summary.lastInteraction ? Math.round((Date.now() - summary.lastInteraction) / 60000) + ' دقیقه پیش' : '-'}</div>
            <div class="dp-memory-stat-label">آخرین تعامل</div>
          </div>
        </div>

        ${summary.topColors.length ? `
          <h4>🎨 رنگ‌هایی که دوست داری</h4>
          <div class="dp-memory-tags">
            ${summary.topColors.map(c => `<span class="dp-memory-tag">${esc(c)}</span>`).join('')}
          </div>
        ` : ''}

        ${summary.topCategories.length ? `
          <h4>👗 دسته‌های مورد علاقه</h4>
          <div class="dp-memory-tags">
            ${summary.topCategories.map(c => `<span class="dp-memory-tag">${esc(c)}</span>`).join('')}
          </div>
        ` : ''}

        ${summary.topStyles.length ? `
          <h4>💎 سبک‌های محبوب</h4>
          <div class="dp-memory-tags">
            ${summary.topStyles.map(s => `<span class="dp-memory-tag">${esc(s)}</span>`).join('')}
          </div>
        ` : ''}

        ${summary.recentMoods.length ? `
          <h4>😊 احساس‌های اخیر</h4>
          <div class="dp-memory-tags">
            ${summary.recentMoods.map(m => `<span class="dp-memory-tag">${esc(m)}</span>`).join(' → ')}
          </div>
        ` : ''}

        ${session.length ? `
          <h4>💬 مکالمات اخیر</h4>
          <div class="dp-memory-session">
            ${session.slice(-10).map(s => `
              <div class="dp-memory-msg">
                <strong>${s.role === 'user' ? '👤 شما' : '🤖 AI'}:</strong>
                ${esc(s.text.substring(0, 80))}${s.text.length > 80 ? '...' : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="margin-top: 20px; display: flex; gap: 8px;">
          <button class="dp-chat-action-btn danger" data-action="clear">🗑️ پاک کردن حافظه</button>
          <button class="dp-chat-action-btn" data-action="export">📥 دانلود</button>
        </div>
      </div>
    `;
    modal.innerHTML = html;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.hasAttribute('data-close')) modal.remove();
      if (e.target.getAttribute('data-action') === 'clear') {
        if (confirm('از پاک کردن حافظه مطمئنی؟')) {
          window.DPChatAI.clearMemory();
          modal.remove();
          addMessage('✅ حافظه پاک شد!', 'bot');
        }
      }
      if (e.target.getAttribute('data-action') === 'export') {
        const data = JSON.stringify({ memory: window.DPChatAI.loadMemory(), session: window.DPChatAI.loadSession() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = el('a', { href: url, download: 'dp-chat-memory.json' });
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 👋 Welcome Message
  // ═══════════════════════════════════════════════════════════════
  function showWelcomeMessage() {
    const user = window.DPUser?.me?.();
    let greeting = 'سلام! 👋 من استایلیست هوشمند شما هستم';
    if (user?.profile?.name) {
      greeting = `سلام ${esc(user.profile.name)} عزیز! 👋 من استایلیست هوشمند شما هستم`;
    }
    greeting += '\n\nمی‌تونم کمکت کنم:\n• پیشنهاد لباس و ست کامل\n• تشخیص رنگ مناسب پوستت\n• مقایسه محصولات\n• پیشنهاد هدیه\n\nفقط بگو چی می‌خوای! 💕';
    addMessage(greeting, 'bot', {
      quickReplies: ['پیراهن میخوام', 'ست کامل', 'رنگ مناسب من', 'استایل مهمانی', 'هدیه']
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 Events
  // ═══════════════════════════════════════════════════════════════
  function bindEvents() {
    $('#dpChatSendBtn')?.addEventListener('click', () => {
      const input = $('#dpChatInput');
      if (input && input.value.trim()) sendMessage(input.value);
    });

    $('#dpChatInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (e.target.value.trim()) sendMessage(e.target.value);
      }
    });

    $('#dpChatVoiceBtn')?.addEventListener('click', toggleVoice);
    $('#dpChatPersonalityBtn')?.addEventListener('click', showPersonalitySelector);
    $('#dpChatMemoryBtn')?.addEventListener('click', showMemory);
    $('#dpChatClearBtn')?.addEventListener('click', () => {
      if (confirm('مکالمه پاک بشه؟')) {
        $('#dpChatMessages').innerHTML = '';
        showWelcomeMessage();
      }
    });

    // Emoji
    $('#dpChatEmojiBtn')?.addEventListener('click', () => {
      const panel = $('#dpChatEmojiPanel');
      if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', e => {
      if (e.target.classList?.contains('dp-emoji-btn')) {
        const input = $('#dpChatInput');
        if (input) {
          input.value += e.target.getAttribute('data-emoji');
          input.focus();
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 API
  // ═══════════════════════════════════════════════════════════════
  window.DPChatUI = {
    version: '2.0 MAX',
    createChatWidget,
    addMessage,
    sendMessage,
    showMemory,
    showPersonalitySelector,
    toggleVoice,
    speakText,
    ttsEnabled: false
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    setTimeout(createChatWidget, 500);
  }

  console.log('💬 DPChatUI v1.0 MAX loaded — ChatGPT-like interface for fashion');
})();
