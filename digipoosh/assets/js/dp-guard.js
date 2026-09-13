/* ============================================================
   دیجی‌پوش — محافظ محیط اجرا
   ------------------------------------------------------------
   مشکلی که کاربر دید: «اندازه‌ها به هم ریخته» و «اطلاعات
   می‌پرد».

   ریشه‌اش این بود که سایت با دوبار کلیک روی فایل باز می‌شد
   (`file://`). در این حالت مرورگر چند چیز را **مسدود**
   می‌کند — و این محدودیت امنیتی خود مرورگر است، نه ایراد
   سایت:

     ۱. `localStorage` → کروم خطای امنیتی می‌دهد، پس هیچ
        داده‌ای ذخیره نمی‌شود
     ۲. فونت Vazirmatn از گوگل → اگر اینترنت نباشد نمی‌آید،
        و فونت پیش‌فرض ابعاد متفاوتی دارد → «به‌هم‌ریختگی»
     ۳. `fetch` → CORS مسدودش می‌کند

   این فایل دو کار می‌کند:
     · اگر `localStorage` کار نکند، جایگزین موقت می‌سازد تا
       سایت نشکند
     · اگر با `file://` باز شده، یک نوار راهنما نشان می‌دهد
   ============================================================ */
'use strict';

(function () {

  /* ============================================================
     ۱. جایگزین حافظه
     ------------------------------------------------------------
     اگر مرورگر اجازه‌ی `localStorage` ندهد، یک نسخه‌ی موقت در
     حافظه‌ی صفحه می‌سازیم. سایت کار می‌کند، ولی با بستن
     صفحه داده می‌رود — که بهتر از شکستن کامل است.
     ============================================================ */
  var works = false;
  try {
    var probe = '__dp_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    works = true;
  } catch (e) { works = false; }

  if (!works) {
    var mem = {};
    var shim = {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[String(k)] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = {}; },
      key: function (i) { return Object.keys(mem)[i] || null; },
      get length() { return Object.keys(mem).length; },
    };
    try {
      Object.defineProperty(window, 'localStorage', {
        value: shim, configurable: true, writable: true,
      });
    } catch (e2) {
      try { window.localStorage = shim; } catch (e3) { /* هیچ راهی نماند */ }
    }
  }

  window.DPGuard = {
    storageWorks: works,
    isFile: location.protocol === 'file:',
  };

  /* ============================================================
     ۲. نوار راهنما روی file://
     ============================================================ */
  if (location.protocol !== 'file:') return;

  var HIDE_KEY = 'dp_hide_file_note';
  try { if (sessionStorage.getItem(HIDE_KEY)) return; } catch (e) { /* بی‌اهمیت */ }

  function show() {
    if (document.getElementById('dpFileNote')) return;

    var bar = document.createElement('div');
    bar.id = 'dpFileNote';
    bar.setAttribute('role', 'status');
    bar.innerHTML =
      '<div class="dpfn-in">'
      + '<span class="dpfn-ico" aria-hidden="true">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
      +   ' stroke-linecap="round" stroke-linejoin="round">'
      +   '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/></svg></span>'
      + '<div class="dpfn-txt">'
      +   '<b>سایت را با دوبار کلیک روی فایل باز کرده‌اید</b>'
      +   '<span>در این حالت مرورگر <b>ذخیره‌سازی و فونت</b> را مسدود می‌کند، '
      +   'پس اندازه‌ها به‌هم‌ریخته دیده می‌شوند و اطلاعات ذخیره نمی‌شود. '
      +   'این محدودیت امنیتی مرورگر است، نه ایراد سایت.<br>'
      +   '<b>راه درست:</b> فایل <code>اجرای-سایت.bat</code> (ویندوز) یا '
      +   '<code>اجرای-سایت.command</code> (مک) را دوبار کلیک کنید.</span>'
      + '</div>'
      + '<button class="dpfn-x" type="button" aria-label="بستن این پیام">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
      +   ' stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
      + '</button></div>';

    var css = document.createElement('style');
    css.textContent =
      '#dpFileNote{position:fixed;inset-inline:0;top:0;z-index:9999;'
      + 'font-family:Tahoma,system-ui,sans-serif;font-size:13px;line-height:1.9;'
      + 'color:#3d2f10;background:linear-gradient(135deg,#f5e5b0,#e8d089);'
      + 'box-shadow:0 6px 22px -10px rgba(0,0,0,.45);direction:rtl}'
      + '#dpFileNote .dpfn-in{display:flex;align-items:flex-start;gap:12px;'
      + 'width:min(1100px,calc(100% - 28px));margin-inline:auto;padding:13px 0}'
      + '#dpFileNote .dpfn-ico{flex:none;width:26px;height:26px;color:#8a6410}'
      + '#dpFileNote svg{width:100%;height:100%}'
      + '#dpFileNote .dpfn-txt{flex:1;min-width:0}'
      + '#dpFileNote .dpfn-txt>b{display:block;font-size:14px;margin-bottom:3px}'
      + '#dpFileNote code{padding:1px 6px;border-radius:5px;background:rgba(0,0,0,.12);'
      + 'font-family:ui-monospace,monospace;font-size:12px;direction:ltr;display:inline-block}'
      + '#dpFileNote .dpfn-x{flex:none;width:30px;height:30px;padding:5px;cursor:pointer;'
      + 'border:0;border-radius:50%;color:#3d2f10;background:rgba(0,0,0,.1)}'
      + '#dpFileNote .dpfn-x:hover{background:rgba(0,0,0,.2)}'
      + 'body{padding-top:var(--dpfn-h,0)}';
    document.head.appendChild(css);
    document.body.appendChild(bar);

    /* بدنه را به اندازه‌ی نوار پایین بیاور تا چیزی پنهان نشود */
    var h = bar.offsetHeight;
    document.documentElement.style.setProperty('--dpfn-h', h + 'px');

    bar.querySelector('.dpfn-x').addEventListener('click', function () {
      bar.remove();
      document.documentElement.style.setProperty('--dpfn-h', '0px');
      try { sessionStorage.setItem(HIDE_KEY, '1'); } catch (e) { /* */ }
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', show, { once: true })
    : show();
})();
