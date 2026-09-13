/* ============================================================
   دیجی‌پوش — صفحه‌ی حساب کاربری مشتری
   ============================================================ */
'use strict';

(function () {
  const $ = (s) => document.querySelector(s);
  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- پیام شناور ---------- */
  function toast(msg, type = 'success') {
    let wrap = $('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast t-${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
      el.classList.remove('show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 3200);
  }

  const setErr = (id, msg) => {
    const f = document.getElementById(id).closest('.field');
    f.classList.toggle('bad', !!msg);
    f.querySelector('.err').textContent = msg || '';
  };

  const clearErrs = (form) =>
    form.querySelectorAll('.field').forEach((f) => {
      f.classList.remove('bad');
      f.querySelector('.err').textContent = '';
    });

  /* ============================================================
     جابه‌جایی بین ورود و ثبت‌نام
     ============================================================ */
  const signupForm = $('#signupForm');
  const loginForm = $('#loginForm');

  function showTab(which) {
    const isLogin = which === 'login';
    signupForm.hidden = isLogin;
    loginForm.hidden = !isLogin;

    $('#tabSignup').classList.toggle('on', !isLogin);
    $('#tabLogin').classList.toggle('on', isLogin);

    $('#authTitle').textContent = isLogin ? 'ورود به حساب' : 'عضویت در دیجی‌پوش';
    $('#authSub').textContent = isLogin
      ? 'خوش برگشتید — با ایمیل و رمز خودتان وارد شوید'
      : 'حساب بسازید تا فروشگاه‌های دلخواهتان را دنبال کنید';

    history.replaceState(null, '', `?mode=${isLogin ? 'login' : 'signup'}`);
  }

  $('#tabSignup').addEventListener('click', () => showTab('signup'));
  $('#tabLogin').addEventListener('click', () => showTab('login'));
  $('#goLogin').addEventListener('click', () => showTab('login'));
  $('#goSignup').addEventListener('click', () => showTab('signup'));

  /* ---------- سنجه‌ی قدرت رمز ---------- */
  $('#sPass').addEventListener('input', (e) => {
    const v = e.target.value;
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) s++;
    if (/[^\w\s]/.test(v)) s++;
    $('#pwBar').className = 'pw-bar' + (v ? ' w' + s : '');
  });

  /* ============================================================
     ثبت‌نام
     ============================================================ */
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrs(signupForm);

    const name = $('#sName').value.trim();
    const email = $('#sEmail').value.trim();
    const pass = $('#sPass').value;
    let ok = true;

    if (!name) { setErr('sName', 'نام خود را بنویسید.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('sEmail', 'ایمیل معتبر نیست.'); ok = false; }
    if (pass.length < 6) { setErr('sPass', 'رمز باید حداقل ۶ نویسه باشد.'); ok = false; }
    if (!ok) return;

    const btn = $('#sBtn');
    btn.disabled = true;
    try {
      await DPUser.signup({ fullName: name, email, password: pass, phone: $('#sPhone').value });
      afterAuth('خوش آمدید! حساب شما ساخته شد.');
    } catch (err) {
      toast(err.message, 'error');
      if (err.message.includes('ایمیل')) setErr('sEmail', err.message);
      btn.disabled = false;
    }
  });

  /* ============================================================
     ورود
     ============================================================ */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrs(loginForm);

    const email = $('#lEmail').value.trim();
    const pass = $('#lPass').value;
    if (!email || !pass) { toast('ایمیل و رمز را وارد کنید.', 'error'); return; }

    const btn = $('#lBtn');
    btn.disabled = true;
    try {
      await DPUser.login(email, pass);
      afterAuth('خوش برگشتید.');
    } catch (err) {
      toast(err.message, 'error');
      setErr('lPass', err.message);
      btn.disabled = false;
    }
  });

  /* ============================================================
     صفحه‌ی حساب من
     ============================================================ */
  function storeName(id) {
    try {
      const u = ((window.DPSafe ? DPSafe.sellers() : [])).find((x) => x.id === id);
      return u || null;
    } catch { return null; }
  }

  function paintPanel(user) {
    const name = (user.fullName || String(user.email || '').split('@')[0] || 'کاربر').trim();
    $('#pAva').textContent = name[0] || '؟';
    $('#pName').textContent = name;
    $('#pMeta').textContent = user.email + (user.phone ? ' · ' + user.phone : '');
    $('#pSince').textContent = user.joinDate || 'امروز';

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('iName', name);
    set('iMail', user.email || '—');
    set('iPhone', user.phone ? fa(user.phone) : 'ثبت نشده');
    set('iSince', user.joinDate || 'امروز');

    const wish = DPUser.wishlist.all();
    $('#pWish').textContent = fa(wish.length);

    /* ---------- سفارش‌های واقعی ---------- */
    const orders = window.DPCart ? DPCart.myOrders() : [];
    $('#pOrders').textContent = fa(orders.length);

    const ST = {
      pending: ['در انتظار تأیید', 'b-warn'], confirmed: ['تأیید شده', 'b-info'],
      shipped: ['ارسال شده', 'b-info'], delivered: ['تحویل شده', 'b-ok'],
      cancelled: ['لغو شده', 'b-bad'],
    };
    const money = (n) => fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');

    const ob = document.querySelector('#orders .empty-inline')?.parentElement;
    if (ob) {
      ob.innerHTML = '<div class="card-head"><h2>سفارش‌های من</h2></div>' + (orders.length
        ? orders.map((o) => {
            const s = ST[o.status] || ['—', 'b-warn'];
            return `
            <div class="ord-row">
              <div class="ord-top">
                <strong>${esc(o.id)}</strong>
                <span class="ord-badge ${s[1]}">${s[0]}</span>
                <time>${esc(o.date)}</time>
              </div>
              <div class="ord-lines">${(o.lines || []).map((l) => {
                const rs = window.DPReturns ? DPReturns.statusOf(o.id, l.productId) : null;
                const RT = { pending: ['مرجوعی در بررسی', 'w'], approved: ['مرجوع شد', 'k'],
                             rejected: ['مرجوعی رد شد', 'b'] };
                const tag = rs ? RT[rs] : null;
                return `
                  <div class="ord-line">
                    <span class="ol-name">${esc(l.name)} × ${fa(l.qty)}</span>
                    ${tag ? `<em class="ol-tag t-${tag[1]}">${tag[0]}</em>`
                          : (window.DPReturns && DPReturns.canRequest(o)
                              ? `<button class="ol-ret" type="button"
                                   data-ord="${esc(o.id)}" data-pid="${esc(l.productId)}"
                                   data-nm="${esc(l.name)}">درخواست مرجوعی</button>` : '')}
                  </div>`;
              }).join('') || `<span class="ol-name">${esc((o.items || []).join('، '))}</span>`}</div>
              <div class="ord-sum">مبلغ: <b>${money(o.total)} تومان</b></div>
              ${o.status === 'delivered' && o.sellerId ? `
                <a class="ord-rate" href="./store.html?id=${encodeURIComponent(o.sellerId)}#reviews">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>
                  </svg>
                  به این خرید امتیاز بدهید
                </a>` : ''}
            </div>`;
          }).join('')
        : `<div class="empty-inline">هنوز سفارشی ثبت نکرده‌اید.
             <a href="./index.html#featured-sellers">شروع خرید</a></div>`);
    }

    const box = $('#wishBox');
    if (!wish.length) {
      box.innerHTML = `<div class="empty-inline">
        هنوز فروشگاهی را نشان نکرده‌اید.
        <a href="./index.html#featured-sellers">فروشگاه‌ها را ببینید</a></div>`;
      return;
    }

    box.innerHTML = wish.map((w) => {
      const s = storeName(w.storeId);
      if (!s) return '';
      const L = (s.storeName || '؟').trim()[0];
      return `
        <div class="wish-row">
          <span class="wish-ava">${s.logo
            ? `<img src="${esc(s.logo)}" alt="" />` : esc(L)}</span>
          <div class="wish-txt">
            <strong>${esc(s.storeName)}</strong>
            <small>${esc(s.city || '')}</small>
          </div>
          <a class="btn btn-ghost btn-sm" href="./store.html?id=${encodeURIComponent(s.id)}">دیدن فروشگاه</a>
          <button class="wish-x" type="button" data-un="${esc(s.id)}" aria-label="برداشتن از دلخواه">&times;</button>
        </div>`;
    }).join('') || '<div class="empty-inline">فروشگاه‌های نشان‌شده دیگر در دسترس نیستند.</div>';

    box.querySelectorAll('[data-un]').forEach((b) =>
      b.addEventListener('click', () => {
        DPUser.wishlist.toggle(b.dataset.un);
        paintPanel(user);
        toast('از فهرست دلخواه برداشته شد.', 'success');
      }));
  }

  /* ---------- درخواست مرجوعی ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.ol-ret');
    if (!b) return;

    const why = prompt(`دلیل مرجوعی «${b.dataset.nm}» را بنویسید:\n(حداقل ۱۰ نویسه)`);
    if (why === null) return;

    try {
      const o = DPCart.myOrders().find((x) => x.id === b.dataset.ord);
      const line = (o.lines || []).find((l) => String(l.productId) === b.dataset.pid);
      DPReturns.request(b.dataset.ord, line, why);
      toast('درخواست مرجوعی ثبت شد. فروشنده بررسی می‌کند.', 'success');
      paint();
    } catch (err) { toast(err.message, 'error'); }
  });

  $('#pLogout').addEventListener('click', () => {
    DPUser.logout();
    toast('خارج شدید.', 'success');
    paint();
    document.dispatchEvent(new CustomEvent('dp:user'));
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });

  /* ============================================================
     تصمیم: مهمان یا واردشده؟
     ============================================================ */
  function paint() {
    const user = DPUser.me();

    /* فرم ورود/عضویت باید کامل از صفحه برود، نه فقط پنهان شود.
       اگر بماند، کاربر گیج می‌شود که «بالاخره وارد شدم یا نه؟» */
    $('#authView').hidden = !!user;
    $('#panelView').hidden = !user;

    if (user) {
      paintPanel(user);
      document.title = 'حساب من | دیجی‌پوش';

      /* فرم‌ها پاک می‌شوند تا اگر بعداً خارج شد، رمز قبلی نماند */
      signupForm.reset();
      loginForm.reset();
      clearErrs(signupForm);
      clearErrs(loginForm);

      /* نشانی «?mode=login» دیگر بی‌معنی است — برداشته می‌شود.
         وگرنه اگر کاربر صفحه را تازه کند یا لینک را بفرستد،
         دوباره حالت ورود باز می‌شود. */
      const q = new URLSearchParams(location.search);
      if (q.has('mode')) {
        q.delete('mode');
        const rest = q.toString();
        history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      }
    } else {
      document.title = 'حساب کاربری | دیجی‌پوش';
      const mode = new URLSearchParams(location.search).get('mode');
      showTab(mode === 'login' ? 'login' : 'signup');
      ['sBtn', 'lBtn'].forEach((id) => (document.getElementById(id).disabled = false));
    }
  }

  /* ============================================================
     پس از ورود یا عضویت موفق
     ------------------------------------------------------------
     بی‌درنگ پروفایل نشان داده می‌شود و صفحه به بالا می‌رود
     تا کاربر خوشامد و اطلاعاتش را ببیند.
     ============================================================ */
  function afterAuth(msg) {
    toast(msg, 'success');

    paint();                       /* بدون تأخیر */

    /* نوار بالا و کشوی موبایل هم باید نام کاربر را نشان دهند */
    document.dispatchEvent(new CustomEvent('dp:user'));

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     تب‌های حساب — سفارش‌ها / دلخواه / اطلاعات
     ============================================================ */
  (function tabs() {
    const bar = document.getElementById('accTabs');
    if (!bar) return;

    function show(key) {
      bar.querySelectorAll('.acc-tab').forEach((b) => {
        const on = b.dataset.sec === key;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.querySelectorAll('.acc-sec').forEach((s) => {
        s.hidden = s.dataset.sec !== key;
      });
    }

    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.acc-tab');
      if (b) { show(b.dataset.sec); history.replaceState(null, '', '#' + b.dataset.sec); }
    });

    const h = (location.hash || '').replace('#', '');
    show(['orders', 'wishlist', 'profile'].includes(h) ? h : 'orders');

    window.addEventListener('hashchange', () => {
      const k = (location.hash || '').replace('#', '');
      if (['orders', 'wishlist', 'profile'].includes(k)) show(k);
    });
  })();

  paint();
})();
