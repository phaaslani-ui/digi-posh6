/* ═══════════════════════════════════════════════════════════════════
 * 🤖 DP AI Widget v17.4 PRO — ویجت شناور حرفه‌ای AI
 * ------------------------------------------------------------------
 * • دکمه شناور (FAB) - بسته به‌صورت پیش‌فرض
 * • استفاده از DPChatAI محلی (offline)
 * • تحلیل NLU واقعی
 * • نمایش محصولات واقعی فروشنده‌ها
 * • پشتیبانی از context صفحه (woman/man/kids/teen)
 * • دکمه‌های پیشنهادی هوشمند (dynamic)
 * • حرفه‌ای، زیبا، ریسپانسیو
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPAIWidget) return;

  let isOpen = false;
  let history = [];

  // تشخیص context صفحه
  function getPageContext() {
    const body = document.body;
    const page = body.dataset.dpPage || '';
    if (page === 'woman') return { gender: 'women', label: 'زنانه', icon: '👗' };
    if (page === 'man') return { gender: 'men', label: 'مردانه', icon: '👔' };
    if (page === 'kids') return { gender: 'kids', label: 'بچگانه', icon: '🧒' };
    if (page === 'teen') return { gender: 'teen', label: 'نوجوان', icon: '🧑' };
    return { gender: 'all', label: 'همه', icon: '🛍️' };
  }

  // دکمه‌های پیشنهادی هوشمند بر اساس context
  function getQuickQuestions(ctx) {
    const baseQuestions = [
      { q: 'پیشنهاد محصول', icon: '🛍️' },
      { q: 'ست کامل', icon: '👗' },
      { q: 'رنگ مناسب', icon: '🎨' },
      { q: 'ترندهای روز', icon: '📰' }
    ];
    if (ctx.gender === 'women') {
      baseQuestions.push({ q: 'لباس مجلسی', icon: '✨' });
      baseQuestions.push({ q: 'مانتو شیک', icon: '🧥' });
    } else if (ctx.gender === 'men') {
      baseQuestions.push({ q: 'کت و شلوار', icon: '👔' });
      baseQuestions.push({ q: 'پیراهن مردانه', icon: '👕' });
    } else if (ctx.gender === 'kids') {
      baseQuestions.push({ q: 'لباس بچگانه', icon: '🧒' });
      baseQuestions.push({ q: 'ست کودک', icon: '🎈' });
    } else if (ctx.gender === 'teen') {
      baseQuestions.push({ q: 'استایل نوجوان', icon: '🌟' });
      baseQuestions.push({ q: 'مد روز', icon: '🔥' });
    }
    return baseQuestions;
  }

  // مسیر محصول بر اساس صفحه فعلی
  function getProductPath() {
    const path = window.location.pathname;
    if (path.includes('/woman/') || path.includes('/man/') || path.includes('/kids/') || path.includes('/teen/')) {
      return '../product.html';
    }
    return './product.html';
  }

  function injectCSS() {
    if (document.getElementById('dp-ai-widget-css')) return;
    const style = document.createElement('style');
    style.id = 'dp-ai-widget-css';
    style.textContent = `
      #dp-ai-widget {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 99999;
        font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .dp-ai-fab {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        border: 3px solid #fff;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(212,175,55,0.45), 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1a1a1a;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        outline: none;
      }
      .dp-ai-fab:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 12px 32px rgba(212,175,55,0.65), 0 4px 12px rgba(0,0,0,0.15);
      }
      .dp-ai-fab:active { transform: scale(0.95); }
      .dp-ai-fab svg { width: 30px; height: 30px; position: relative; z-index: 2; }
      .dp-ai-fab-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgba(212,175,55,0.5);
        animation: dpFabPulse 2.5s ease-out infinite;
        pointer-events: none;
      }
      @keyframes dpFabPulse {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(1.8); opacity: 0; }
      }

      .dp-ai-panel {
        position: fixed;
        bottom: 100px;
        left: 24px;
        width: 400px;
        max-width: calc(100vw - 48px);
        height: 580px;
        max-height: calc(100vh - 140px);
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(212,175,55,0.2);
        animation: dpAiSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .dp-ai-panel[hidden] {
        display: none !important;
      }
      @keyframes dpAiSlideUp {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }

      .dp-ai-head {
        padding: 16px 18px;
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        border-bottom: 2px solid #d4af37;
      }
      .dp-ai-head-info { display: flex; align-items: center; gap: 12px; }
      .dp-ai-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        color: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(212,175,55,0.4);
      }
      .dp-ai-head-info strong {
        display: block;
        font-size: 15px;
        font-weight: 700;
      }
      .dp-ai-head-info small {
        font-size: 11px;
        opacity: 0.7;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }
      .dp-ai-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 6px #4ade80;
      }
      .dp-ai-close {
        background: rgba(255,255,255,0.1);
        border: none;
        cursor: pointer;
        color: #fff;
        font-size: 18px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .dp-ai-close:hover { background: rgba(255,255,255,0.2); }

      .dp-ai-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #fafafa;
        scroll-behavior: smooth;
      }
      .dp-ai-messages::-webkit-scrollbar { width: 6px; }
      .dp-ai-messages::-webkit-scrollbar-thumb {
        background: rgba(212,175,55,0.3);
        border-radius: 3px;
      }

      .dp-ai-msg {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
        animation: dpMsgFade 0.3s ease;
      }
      @keyframes dpMsgFade {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dp-ai-msg--user { flex-direction: row-reverse; }
      .dp-ai-msg-av {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        flex-shrink: 0;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
      .dp-ai-msg-bub {
        max-width: 78%;
        padding: 11px 14px;
        background: #fff;
        border-radius: 16px 16px 16px 4px;
        font-size: 13px;
        line-height: 1.7;
        border: 1px solid #e8e8e8;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .dp-ai-msg--user .dp-ai-msg-bub {
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        color: #1a1a1a;
        border: none;
        border-radius: 16px 16px 4px 16px;
        font-weight: 500;
      }

      .dp-ai-q-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      .dp-ai-q {
        background: #f5f5f5;
        border: 1px solid #e8e8e8;
        border-radius: 14px;
        padding: 6px 11px;
        font-size: 11px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
        color: #1a1a1a;
        font-weight: 500;
      }
      .dp-ai-q:hover {
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        color: #1a1a1a;
        border-color: #d4af37;
        transform: translateY(-1px);
      }

      .dp-ai-prod-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
        gap: 8px;
        margin: 10px 0 6px 42px;
      }
      .dp-ai-prod {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        border: 1px solid #eee;
        transition: all 0.2s;
        display: block;
      }
      .dp-ai-prod:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        border-color: #d4af37;
      }
      .dp-ai-prod-img {
        width: 100%;
        aspect-ratio: 1;
        background: #f5f5f5;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dp-ai-prod-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .dp-ai-prod-badge {
        position: absolute;
        top: 5px;
        right: 5px;
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        color: #1a1a1a;
        padding: 2px 7px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
      .dp-ai-prod-info { padding: 8px 10px; }
      .dp-ai-prod-name {
        font-size: 11px;
        font-weight: 600;
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: #1a1a1a;
        min-height: 28px;
      }
      .dp-ai-prod-price {
        font-size: 12px;
        font-weight: 800;
        color: #d4af37;
        margin-top: 4px;
      }

      .dp-ai-form {
        padding: 14px;
        border-top: 1px solid #eee;
        background: #fff;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-shrink: 0;
      }
      .dp-ai-form textarea {
        flex: 1;
        resize: none;
        padding: 10px 14px;
        border: 1.5px solid #e8e8e8;
        border-radius: 14px;
        font-size: 13px;
        font-family: inherit;
        max-height: 90px;
        background: #fafafa;
        color: #1a1a1a;
        transition: border-color 0.2s;
        outline: none;
      }
      .dp-ai-form textarea:focus {
        border-color: #d4af37;
        background: #fff;
      }
      .dp-ai-form button[type="submit"] {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d4af37 0%, #f4d97c 100%);
        color: #1a1a1a;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .dp-ai-form button[type="submit"]:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(212,175,55,0.4);
      }
      .dp-ai-form button[type="submit"]:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .dp-ai-form button[type="submit"] svg { width: 20px; height: 20px; }

      .dp-ai-typing {
        display: inline-flex;
        gap: 4px;
        padding: 4px 0;
      }
      .dp-ai-typing span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #999;
        animation: dpBounce 1.2s infinite;
      }
      .dp-ai-typing span:nth-child(2) { animation-delay: 0.2s; }
      .dp-ai-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes dpBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30% { transform: translateY(-6px); opacity: 1; }
      }

      @media (max-width: 520px) {
        #dp-ai-widget { left: 12px; bottom: 12px; }
        .dp-ai-fab { width: 56px; height: 56px; }
        .dp-ai-fab svg { width: 26px; height: 26px; }
        .dp-ai-panel {
          left: 12px;
          right: 12px;
          width: auto;
          bottom: 80px;
          height: calc(100vh - 110px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createWidget() {
    const ctx = getPageContext();
    const questions = getQuickQuestions(ctx);

    const wrap = document.createElement('div');
    wrap.id = 'dp-ai-widget';
    wrap.innerHTML = `
      <button id="dp-ai-fab" class="dp-ai-fab" aria-label="باز کردن چت AI" title="چت با دیجی AI">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v9Z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
        </svg>
        <span class="dp-ai-fab-pulse"></span>
      </button>

      <div id="dp-ai-panel" class="dp-ai-panel" hidden>
        <div class="dp-ai-head">
          <div class="dp-ai-head-info">
            <div class="dp-ai-avatar">د</div>
            <div>
              <strong>دیجی AI</strong>
              <small><span class="dp-ai-status-dot"></span> ${ctx.icon} ${ctx.label} • فعال</small>
            </div>
          </div>
          <button id="dp-ai-close" aria-label="بستن چت" title="بستن">✕</button>
        </div>

        <div id="dp-ai-messages" class="dp-ai-messages">
          <div class="dp-ai-msg dp-ai-msg--ai">
            <div class="dp-ai-msg-av">🤖</div>
            <div class="dp-ai-msg-bub">
              سلام! 👋 من <strong>دیجی AI</strong> هستم، دستیار هوشمند شما در دیجی‌پوش.<br><br>
              الان در بخش <strong>${ctx.label}</strong> هستید. ${ctx.icon} چطور کمکتون کنم؟
              <div class="dp-ai-q-row">
                ${questions.slice(0, 6).map(q => `<button class="dp-ai-q" data-q="${q.q}">${q.icon} ${q.q}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <form id="dp-ai-form" class="dp-ai-form">
          <textarea id="dp-ai-input" rows="1" placeholder="سوالت رو بنویس..." maxlength="500"></textarea>
          <button type="submit" id="dp-ai-send" aria-label="ارسال پیام">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2 11 13"/>
              <path d="M22 2 15 22 11 13 2 9z"/>
            </svg>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);
    attachEvents();
  }

  function attachEvents() {
    const fab = document.getElementById('dp-ai-fab');
    const panel = document.getElementById('dp-ai-panel');
    const close = document.getElementById('dp-ai-close');
    const form = document.getElementById('dp-ai-form');
    const input = document.getElementById('dp-ai-input');

    if (!fab || !panel) return;

    fab.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen = !isOpen;
      if (isOpen) {
        panel.removeAttribute('hidden');
        if (input) setTimeout(() => input.focus(), 100);
      } else {
        panel.setAttribute('hidden', '');
      }
    };

    close.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen = false;
      panel.setAttribute('hidden', '');
    };

    if (input) {
      input.oninput = () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 90) + 'px';
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          form.requestSubmit();
        }
      };
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const msg = input ? input.value.trim() : '';
      if (!msg) return;
      sendMessage(msg);
    };

    // کلیک روی quick questions
    document.querySelectorAll('.dp-ai-q').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        sendMessage(btn.dataset.q);
      };
    });
  }

  function addMessage(text, role, products, quickReplies) {
    const messages = document.getElementById('dp-ai-messages');
    if (!messages) return;

    const wrap = document.createElement('div');
    wrap.className = 'dp-ai-msg dp-ai-msg--' + role;
    wrap.innerHTML = `
      <div class="dp-ai-msg-av">${role === 'user' ? '👤' : '🤖'}</div>
      <div class="dp-ai-msg-bub">${formatText(text)}</div>
    `;
    messages.appendChild(wrap);

    // اگه quick replies داره
    if (quickReplies && quickReplies.length > 0 && role === 'ai') {
      const qrow = document.createElement('div');
      qrow.className = 'dp-ai-q-row';
      qrow.style.marginLeft = '42px';
      qrow.style.marginTop = '-4px';
      quickReplies.slice(0, 4).forEach(reply => {
        const cleanReply = String(reply).replace(/^[^\s]+\s/, '');
        const btn = document.createElement('button');
        btn.className = 'dp-ai-q';
        btn.textContent = reply;
        btn.onclick = (e) => {
          e.preventDefault();
          sendMessage(cleanReply);
        };
        qrow.appendChild(btn);
      });
      messages.appendChild(qrow);
    }

    // اگه محصول داره
    if (products && products.length > 0) {
      const grid = document.createElement('div');
      grid.className = 'dp-ai-prod-grid';
      products.slice(0, 6).forEach(p => {
        const card = document.createElement('a');
        card.href = getProductPath() + '?id=' + encodeURIComponent(p.id);
        card.className = 'dp-ai-prod';
        const img = p.image || (p.images && p.images[0]) || '';
        const badge = p.matchPercent ? `<span class="dp-ai-prod-badge">${p.matchPercent}٪</span>` : '';
        card.innerHTML = `
          <div class="dp-ai-prod-img">
            ${img ? `<img src="${img}" loading="lazy" alt="${esc(p.name || '')}" onerror="this.parentElement.innerHTML='🛍️'"/>` : '🛍️'}
            ${badge}
          </div>
          <div class="dp-ai-prod-info">
            <div class="dp-ai-prod-name">${esc(p.name || 'محصول')}</div>
            <div class="dp-ai-prod-price">${Number(p.price || 0).toLocaleString('fa-IR')} <span style="font-size:10px;font-weight:400">تومان</span></div>
          </div>
        `;
        grid.appendChild(card);
      });
      messages.appendChild(grid);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  function formatText(t) {
    if (!t) return '';
    return String(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showTyping() {
    const messages = document.getElementById('dp-ai-messages');
    if (!messages) return;
    const wrap = document.createElement('div');
    wrap.id = 'dp-ai-typing';
    wrap.className = 'dp-ai-msg dp-ai-msg--ai';
    wrap.innerHTML = `
      <div class="dp-ai-msg-av">🤖</div>
      <div class="dp-ai-msg-bub">
        <div class="dp-ai-typing"><span></span><span></span><span></span></div>
      </div>
    `;
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function rmTyping() {
    const t = document.getElementById('dp-ai-typing');
    if (t) t.remove();
  }

  function sendMessage(msg) {
    const input = document.getElementById('dp-ai-input');
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }

    addMessage(msg, 'user');
    history.push({ role: 'user', content: msg });

    showTyping();

    const sendBtn = document.getElementById('dp-ai-send');
    if (sendBtn) sendBtn.disabled = true;

    setTimeout(() => {
      try {
        if (window.DPChatAI && window.DPChatAI.generateResponse) {
          const ctx = getPageContext();
          const response = window.DPChatAI.generateResponse(msg, {
            history: history,
            styles: [],
            pageContext: ctx
          });
          rmTyping();
          if (response && response.text) {
            addMessage(response.text, 'ai', response.products, response.quickReplies);
            history.push({ role: 'assistant', content: response.text });
          } else {
            addMessage('😊 بگو، گوش میدم!', 'ai');
          }
        } else {
          rmTyping();
          addMessage('🤖 AI در حال بارگذاری... لطفاً صفحه را refresh کنید.', 'ai');
        }
      } catch (err) {
        rmTyping();
        console.error('Widget error:', err);
        addMessage('😊 یه لحظه دیگه بپرس...', 'ai');
      } finally {
        if (sendBtn) sendBtn.disabled = false;
      }
    }, 500 + Math.random() * 400);
  }

  function init() {
    injectCSS();
    // بسته به‌صورت پیش‌فرض - hidden attribute در HTML
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidget);
    } else {
      createWidget();
    }
  }

  init();

  window.DPAIWidget = {
    open: () => {
      isOpen = true;
      const p = document.getElementById('dp-ai-panel');
      if (p) p.removeAttribute('hidden');
    },
    close: () => {
      isOpen = false;
      const p = document.getElementById('dp-ai-panel');
      if (p) p.setAttribute('hidden', '');
    },
    toggle: () => {
      isOpen = !isOpen;
      const p = document.getElementById('dp-ai-panel');
      if (p) {
        if (isOpen) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      }
    }
  };
})();
