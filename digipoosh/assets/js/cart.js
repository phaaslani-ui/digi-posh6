/* ============================================================
   دیجی‌پوش — صفحه‌ی سبد خرید و تسویه
   ============================================================ */
'use strict';

(function () {
  const $ = (s) => document.querySelector(s);
  const FA = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const money = (n) => FA(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(msg, type = 'success') {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
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

  const C = window.DPColors;

  /* ============================================================
     رسم سبد
     ============================================================ */
  function draw() {
    const cart = DPCart.detailed();

    $('#emptyBox').hidden = cart.rows.length > 0;
    $('#cartLayout').hidden = cart.rows.length === 0;

    if (!cart.rows.length) { $('#checkoutBox').hidden = true; return; }

    $('#cartInfo').textContent =
      `${FA(cart.count)} کالا از ${FA(cart.sellerCount)} فروشگاه`;

    $('#cartGroups').innerHTML = cart.groups.map((g) => `
      <div class="shop-group">
        <div class="shop-head">
          <span class="shop-ava">${g.sellerLogo
            ? `<img src="${esc(g.sellerLogo)}" alt="" />` : esc(g.sellerName[0] || '؟')}</span>
          <div>
            <strong>${esc(g.sellerName)}</strong>
            <small>${FA(g.items.length)} قلم — ${money(g.sum)} تومان</small>
          </div>
          <a class="shop-link" href="./store.html?id=${encodeURIComponent(g.sellerId)}">دیدن فروشگاه</a>
        </div>

        ${g.couponOff || g.couponShip || g.couponPerk ? `
        <div class="shop-cpn">
          <span class="shop-cpn-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 8.5V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v2a2 2 0 0 0 0 7v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-2a2 2 0 0 0 0-7Z"/>
              <path d="M14 9.5 10 15"/>
            </svg>
            ${esc(g.couponCode)}
          </span>
          <span class="shop-cpn-txt">${
            g.couponPerk
              ? esc(g.couponPerk) + (g.couponOff ? ` + ${money(g.couponOff)} تومان تخفیف` : '')
              : (g.couponShip
                  ? 'ارسال این سفارش رایگان شد'
                  : `${money(g.couponOff)} تومان از این فروشگاه کم شد`)}</span>
          ${g.couponOff ? `
          <span class="shop-cpn-sum">
            <s>${money(g.sum)}</s>
            <b>${money(Math.max(0, g.sum - g.couponOff))} تومان</b>
          </span>` : ''}
        </div>` : ''}

        ${g.items.map((r) => {
          const col = C?.find(r.color);
          return `
          <div class="cart-row" data-key="${esc(r.key)}">
            <span class="cart-img">${r.image
              ? `<img src="${esc(r.image)}" alt="" />`
              : `<b>${esc(r.name[0] || '؟')}</b>`}</span>

            <div class="cart-info">
              <strong>${esc(r.name)}</strong>
              <div class="cart-opts">
                ${col ? `<span class="opt">${C.bubble(col.id, 14)} ${esc(col.name)}</span>` : ''}
                ${r.size ? `<span class="opt">سایز ${esc(r.size)}</span>` : ''}
                ${r.discount ? `<span class="opt sale">${FA(r.discount)}٪ تخفیف</span>` : ''}
                ${r.category ? `<span class="opt dim">${esc(r.category)}</span>` : ''}
              </div>
              ${r.stock <= 3 ? `<span class="low">تنها ${FA(r.stock)} عدد مانده</span>` : ''}
            </div>

            <div class="qty">
              <button type="button" data-inc="${esc(r.key)}" aria-label="افزودن">+</button>
              <span>${FA(r.qty)}</span>
              <button type="button" data-dec="${esc(r.key)}" aria-label="کم کردن">−</button>
            </div>

            <div class="cart-price">
              ${r.oldPrice ? `<s>${money(r.oldPrice * r.qty)}</s>` : ''}
              <b>${money(r.total)}</b><small>تومان</small>
            </div>

            <button class="cart-x" type="button" data-del="${esc(r.key)}" aria-label="حذف">&times;</button>
          </div>`;
        }).join('')}
      </div>`).join('');

    $('#sCount').textContent = FA(cart.count);
    $('#sShops').textContent = FA(cart.sellerCount);
    $('#sSum').textContent = money(cart.sum) + ' تومان';
    $('#sPay').innerHTML = `${money(cart.payable)} <small>تومان</small>`;

    paintCoupon(cart);

    const user = window.DPUser?.me();
    $('#loginNote').hidden = !!user;
  }


  /* ============================================================
     کد تخفیف
     ------------------------------------------------------------
     کد در سبد ذخیره می‌شود، نه مبلغش. با هر تغییر سبد دوباره
     بررسی می‌شود — پس مشتری نمی‌تواند کد را با سبد بزرگ بگیرد
     و بعد کالاها را کم کند.
     ============================================================ */
  function cpnSay(text, bad) {
    const box = $('#cpnMsg');
    if (!box) return;
    box.textContent = text || '';
    box.hidden = !text;
    box.className = 'cpn-msg' + (bad ? ' is-bad' : ' is-ok');
  }

  function paintCoupon(cart) {
    const on = $('#cpnOn');
    const row = $('#cpnRow');
    const offRow = $('#sOffRow');
    if (!on || !row) return;

    const c = cart.coupon;

    /* کدی که با تغییر سبد باطل شده */
    if (c && c.invalid) {
      on.hidden = true;
      row.hidden = false;
      offRow.hidden = true;
      cpnSay(c.reason, true);
      const inp = $('#cpnInput');
      if (inp && !inp.value) inp.value = c.code;
      return;
    }

    if (c) {
      on.hidden = false;
      row.hidden = true;
      $('#cpnOnCode').textContent = c.code;
      $('#cpnOnDesc').textContent = c.perk
        ? c.perk + (c.off ? ` + ${money(c.off)} تومان` : '')
        : (c.freeShip ? 'ارسال رایگان' : money(c.off) + ' تومان کم شد');

      offRow.hidden = false;
      $('#sOffCode').textContent = c.code;
      $('#sOff').textContent = '\u200E−' + money(c.off) + ' تومان';
      cpnSay('');
    } else {
      on.hidden = true;
      row.hidden = false;
      offRow.hidden = true;
    }
  }

  function wireCoupon() {
    const inp = $('#cpnInput');
    const go = $('#cpnGo');
    const drop = $('#cpnDrop');
    if (!inp || !go) return;

    function apply() {
      const raw = inp.value.trim();
      if (!raw) { cpnSay('کد تخفیف را بنویسید.', true); inp.focus(); return; }

      go.disabled = true;
      try {
        const res = DPCart.applyCoupon(raw);
        inp.value = '';
        cpnSay(
          res.perk
            ? 'کد پذیرفته شد — ' + res.perk +
              (res.off ? ' و ' + money(res.off) + ' تومان تخفیف.' : '.')
            : (res.freeShip
                ? 'کد پذیرفته شد — ارسال این سفارش رایگان است.'
                : 'کد پذیرفته شد — ' + money(res.off) + ' تومان کم شد.'),
          false
        );
        draw();
      } catch (err) {
        cpnSay(err.message || 'این کد پذیرفته نشد.', true);
        inp.focus();
        inp.select();
      } finally {
        go.disabled = false;
      }
    }

    go.addEventListener('click', apply);

    /* Enter هم اعمال می‌کند — کاربر انتظار دارد */
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); apply(); }
    });

    /* حروف کوچک همان لحظه بزرگ می‌شوند تا کاربر ببیند چه نوشته */
    inp.addEventListener('input', () => {
      const pos = inp.selectionStart;
      inp.value = inp.value.toUpperCase();
      try { inp.setSelectionRange(pos, pos); } catch { /* بی‌اهمیت */ }
      if ($('#cpnMsg') && !$('#cpnMsg').hidden) cpnSay('');
    });

    if (drop) drop.addEventListener('click', () => {
      DPCart.removeCoupon();
      cpnSay('کد تخفیف برداشته شد.', false);
      draw();
    });
  }

  /* ============================================================
     رویدادها
     ============================================================ */
  $('#cartGroups').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const del = e.target.closest('[data-del]');

    try {
      if (inc) {
        const row = DPCart.detailed().rows.find((r) => r.key === inc.dataset.inc);
        DPCart.setQty(inc.dataset.inc, (row?.qty || 0) + 1);
      } else if (dec) {
        const row = DPCart.detailed().rows.find((r) => r.key === dec.dataset.dec);
        DPCart.setQty(dec.dataset.dec, (row?.qty || 1) - 1);
      } else if (del) {
        DPCart.remove(del.dataset.del);
        toast('کالا از سبد برداشته شد.', 'success');
      } else return;

      draw();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  /* ---------- رفتن به تسویه ---------- */
  $('#goCheckout').addEventListener('click', () => {
    const user = window.DPUser?.me();
    if (!user) {
      toast('برای ثبت سفارش ابتدا وارد شوید.', 'warning');
      setTimeout(() => (location.href = './account.html?mode=login'), 900);
      return;
    }

    $('#cartLayout').hidden = true;
    $('#checkoutBox').hidden = false;

    $('#cName').value = user.fullName || '';
    $('#cPhone').value = user.phone || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('#backToCart').addEventListener('click', () => {
    $('#checkoutBox').hidden = true;
    $('#cartLayout').hidden = false;
  });

  /* ---------- ثبت سفارش ---------- */
  const setErr = (id, msg) => {
    const f = document.getElementById(id).closest('.field');
    f.classList.toggle('bad', !!msg);
    f.querySelector('.err').textContent = msg || '';
  };

  $('#coForm').addEventListener('submit', (e) => {
    e.preventDefault();
    ['cName', 'cPhone', 'cAddr'].forEach((i) => setErr(i, ''));

    const name = $('#cName').value.trim();
    const phone = $('#cPhone').value;
    const addr = $('#cAddr').value.trim();

    let ok = true;
    if (!name) { setErr('cName', 'نام گیرنده را بنویسید.'); ok = false; }
    if (!/^0\d{10}$/.test(String(phone).replace(/[^\d]/g, '').replace(/[۰-۹]/g, ''))) {
      // اعداد فارسی را هم بپذیر
      const en = String(phone).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
      if (!/^0\d{10}$/.test(en.replace(/[^\d]/g, ''))) {
        setErr('cPhone', 'شماره موبایل ۱۱ رقمی و با ۰۹ شروع شود.'); ok = false;
      }
    }
    if (addr.length < 10) { setErr('cAddr', 'نشانی را کامل‌تر بنویسید.'); ok = false; }
    if (!ok) return;

    const btn = $('#coBtn');
    btn.disabled = true;

    try {
      const en = String(phone).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
      const res = DPCart.checkout({
        name, phone: en.replace(/[^\d]/g, ''), address: addr, note: $('#cNote').value.trim(),
      });

      $('#checkoutBox').hidden = true;
      $('#doneBox').hidden = false;
      $('#doneMsg').textContent = res.count > 1
        ? `چون از ${FA(res.count)} فروشگاه خرید کردید، ${FA(res.count)} سفارش جداگانه ثبت شد. هر فروشنده سفارش خودش را می‌بیند.`
        : 'سفارش شما برای فروشنده ارسال شد و به‌زودی با شما تماس می‌گیرد.';
      $('#doneIds').innerHTML = res.orders
        .map((id) => `<span class="oid">${esc(id)}</span>`).join('');

      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.dispatchEvent(new CustomEvent('dp:cart'));
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });

  wireCoupon();
  document.addEventListener('dp:cart', draw);
  draw();
})();
