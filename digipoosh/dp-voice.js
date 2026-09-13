/**
 * 🎤 dp-voice.js v1.0 — Voice Input برای دیجی AI
 * ------------------------------------------------------------------
 * • ضبط صدا با Web Speech API
 * • تبدیل گفتار به متن فارسی
 * • دکمه میکروفون با انیمیشن
 * • پشتیبانی از RTL
 */

(function() {
  'use strict';
  if (window.DPVoiceLoaded) return;
  window.DPVoiceLoaded = true;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('🎤 Voice input not supported in this browser');
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎙️ Voice Input Widget
  // ═══════════════════════════════════════════════════════════════
  function createVoiceButton(inputSelector, onResult) {
    // پیدا کردن input
    const input = document.querySelector(inputSelector);
    if (!input) return;

    const wrapper = input.parentElement;

    // ایجاد دکمه
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dpv-mic-btn';
    btn.setAttribute('aria-label', 'ضبط صدا');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
      </svg>
    `;
    btn.title = 'با صدا بگو';

    // استایل
    const style = document.createElement('style');
    style.textContent = `
      .dpv-mic-btn {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: transparent;
        border: 1.5px solid var(--border-soft, #ddd);
        color: var(--text-soft, #666);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .dpv-mic-btn:hover {
        background: var(--gold, #d4af37);
        color: #1a1a1a;
        border-color: var(--gold, #d4af37);
      }
      .dpv-mic-btn svg { width: 16px; height: 16px; }
      .dpv-mic-btn.is-recording {
        background: #ef4444;
        color: #fff;
        border-color: #ef4444;
        animation: dpv-pulse 1.2s infinite;
      }
      @keyframes dpv-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      }
    `;
    document.head.appendChild(style);

    // اضافه کردن کنار input
    if (wrapper.classList.contains('dai-input-wrap') ||
        wrapper.classList.contains('prof-chat-input-wrap') ||
        wrapper.classList.contains('dpw-footer')) {
      wrapper.appendChild(btn);
    } else {
      wrapper.style.display = 'flex';
      wrapper.style.gap = '6px';
      wrapper.appendChild(btn);
    }

    // تنظیم recognition
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isRecording = false;

    btn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
        return;
      }
      try {
        recognition.start();
        isRecording = true;
        btn.classList.add('is-recording');
        showStatus('🎤 در حال گوش دادن...');
      } catch (e) {
        console.error('Voice error:', e);
        showStatus('❌ خطا در شروع ضبط', 'error');
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      if (onResult) onResult(transcript);
      // ارسال خودکار اگه Enter زده شد
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(enterEvent);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      let msg = '❌ خطا در تشخیص صدا';
      if (event.error === 'not-allowed') msg = '❌ اجازه میکروفون داده نشد';
      if (event.error === 'no-speech') msg = '🎤 صدایی شنیده نشد';
      showStatus(msg, 'error');
    };

    recognition.onend = () => {
      isRecording = false;
      btn.classList.remove('is-recording');
    };

    function showStatus(msg, type = 'info') {
      if (window.DPMagic && window.DPMagic.showToast) {
        window.DPMagic.showToast(msg, type === 'error' ? 'error' : 'success');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 Auto-attach to all chat inputs
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // دیجی AI input
      createVoiceButton('#daiInput');
      // پروفایل chat
      createVoiceButton('#profChatInput');
      // ویجت چت
      createVoiceButton('#dpwInput');
    }, 1000);
  });

  // API
  window.DPVoice = {
    attach: createVoiceButton,
    version: '1.0'
  };

  console.log('🎤 DPVoice v1.0 loaded - Voice input ready');
})();
