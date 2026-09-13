/**
 * ============================================================
 *  دیجی‌پوش — کلاینت Worker (پروکسی)
 *  ------------------------------------------------------------
 *  اگه Worker تنظیم شده باشه، از اون استفاده میکنه
 *  در غیر این صورت مستقیم به AI وصل میشه
 *  ============================================================
 */
(function() {
  'use strict';
  
  const WorkerClient = {
    
    config: {
      useWorker: false,
      workerUrl: 'https://digipoosh-ai.workers.dev',
    },
    
    init() {
      const cfg = window.DP_CONFIG || {};
      this.config.useWorker = cfg.useWorker || false;
      this.config.workerUrl = cfg.workerUrl || this.config.workerUrl;
    },
    
    isEnabled() {
      this.init();
      return this.config.useWorker;
    },
    
    /**
     * چت از طریق Worker
     */
    async chat(message, options = {}) {
      if (!this.isEnabled()) {
        throw new Error('Worker فعال نیست');
      }
      
      const url = this.config.workerUrl + '/api/chat';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          provider: options.provider || null,
          model: options.model || null,
          history: options.history || [],
          temperature: options.temperature || 0.7,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'خطای ناشناخته');
      }
      
      return {
        text: data.response,
        provider: data.provider,
        viaWorker: true,
      };
    },
    
    /**
     * دریافت ترندها از Worker
     */
    async getTrends() {
      if (!this.isEnabled()) {
        return [];
      }
      
      try {
        const url = this.config.workerUrl + '/api/trends';
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          return data.trends || [];
        }
      } catch(e) {
        console.warn('Worker trends failed:', e);
      }
      return [];
    },
    
    /**
     * چک سلامت Worker
     */
    async health() {
      if (!this.isEnabled()) return null;
      
      try {
        const url = this.config.workerUrl + '/api/health';
        const res = await fetch(url);
        return await res.json();
      } catch(e) {
        return { status: 'error', error: e.message };
      }
    },
  };
  
  WorkerClient.init();
  window.DP_Worker = WorkerClient;
  
  console.log('☁️ Worker Client آماده:', WorkerClient.isEnabled() ? 'فعال' : 'غیرفعال');
  
})();
