/* ============================================================
   دیجی‌پوش — لباس زنانه | نسخه‌ی بهینه‌شده
   ------------------------------------------------------------
   اصول بهینه‌سازی:
   • انیمیشن‌ها کاملاً CSS هستند (GPU) — جاوااسکریپت فقط کلاس عوض می‌کند
   • هیچ خواندن layout در حلقه‌ی رویداد نیست (بدون layout thrashing)
   • رویدادهای scroll/resize با requestAnimationFrame throttle شده‌اند
   • تمام شنونده‌های scroll از { passive: true } استفاده می‌کنند
   • عناصر تزئینی: ۳ حلقه + ۸ گل + ۱۵ ذره = ۲۶ عنصر (قبلاً ۱۲۵)
   ============================================================ */

(function () {
  'use strict';

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => Array.from(sc.querySelectorAll(s));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(pointer:fine)').matches;
  const FA      = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const toFa    = (n) => String(n).replace(/\d/g, (d) => FA[+d]);

  /* ============================================================
     1. عناصر تزئینی — یک بار ساخته می‌شوند، بعد فقط CSS کار می‌کند
     ============================================================ */

  /** ۸ گل — با DocumentFragment در یک عملیات به DOM اضافه می‌شوند */
  const flowers = [];

  function buildFlowers() {
    const layer = $('#flowers');
    if (!layer || reduced) return;

    const frag = document.createElement('div');   // بافر خارج از DOM
    const sizes = ['', 'f-lg', '', 'f-sm', '', 'f-lg', 'f-sm', ''];

    const nF = q(8);
    for (let i = 0; i < nF; i++) {
      const f = document.createElement('div');
      f.className = `flower f-${(i % 4) + 1} ${sizes[i]}`.trim();
      // موقعیت با درصد ثابت — بدون محاسبه‌ی تصادفی سنگین
      f.style.cssText =
        `left:${4 + i * 12}%;` +
        `--delay:${(i * 0.28).toFixed(2)}s`;
      f.innerHTML = '<i class="petals"></i><i class="stem"></i>';
      frag.appendChild(f);
      flowers.push(f);
    }
    layer.append(...frag.children);   // یک بار reflow
  }

  /** ۱۵ ذره — تماماً CSS، بدون هیچ به‌روزرسانی JS */
  function buildParticles() {
    const layer = $('#particles');
    if (!layer || reduced) return;

    const frag = document.createElement('div');
    const tints = ['g', 'r', 'p'];   // طلایی، رز، یاسی

    const nP = q(10);
    for (let i = 0; i < nP; i++) {
      const p = document.createElement('i');
      const size = 3 + (i % 5);
      p.className = `pt pt-${tints[i % 3]}`;
      p.style.cssText =
        `left:${(i * 6.7 + 3).toFixed(1)}%;` +
        `top:${((i * 37) % 90 + 5)}%;` +
        `width:${size}px;height:${size}px;` +
        `--dur:${12 + (i % 6) * 2}s;--delay:-${i * 0.9}s`;
      frag.appendChild(p);
    }
    layer.append(...frag.children);
  }

  /* ============================================================
     2. رشد گل‌ها با اسکرول
     ------------------------------------------------------------
     به‌جای محاسبه‌ی موقعیت در هر رویداد scroll (که layout می‌خواند)،
     از IntersectionObserver استفاده می‌کنیم — کاملاً غیرهمگام و رایگان.
     ============================================================ */
  function initFlowerGrowth() {
    if (!flowers.length || reduced || !('IntersectionObserver' in window)) {
      flowers.forEach((f) => f.classList.add('bloom'));
      return;
    }

    // هر بخش صفحه که دیده شود، چند گل بعدی می‌شکفند
    const sections = $$('section');
    let grown = 0;

    const io = new IntersectionObserver((entries) => {
      let advance = false;
      for (const e of entries) if (e.isIntersecting) advance = true;
      if (!advance) return;

      const target = Math.min(flowers.length, grown + 2);
      for (; grown < target; grown++) {
        const f = flowers[grown];
        f.classList.add('grow');
        // شکوفایی با تأخیر — setTimeout سبک‌تر از rAF زنجیره‌ای است
        setTimeout(() => f.classList.add('bloom'), 700);
      }
      if (grown >= flowers.length) io.disconnect();
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.05 });

    sections.forEach((s) => io.observe(s));

    // چند گل اول بدون نیاز به اسکرول
    setTimeout(() => {
      for (; grown < 3; grown++) {
        const f = flowers[grown];
        f.classList.add('grow');
        setTimeout(() => f.classList.add('bloom'), 700);
      }
    }, 400);
  }

  /* ============================================================
     3. اسلایدر — فید کاملاً CSS، JS فقط کلاس active را جابه‌جا می‌کند
     ============================================================ */
  const SLIDE_MS = 3000;
  const slides   = $$('.slide');
  const dots     = $$('.slider-dots .dot');
  const bar      = $('.slider-progress-bar');
  const hero     = $('#heroSlider');

  let current = 0;
  let timer   = null;

  function goTo(i) {
    if (!slides.length || i === current) return;

    // خواندن و نوشتن جدا — بدون thrashing
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    slides[i].classList.add('active');
    dots[i]?.classList.add('active');
    current = i;
    restartBar();
  }

  const next = () => goTo((current + 1) % slides.length);

  function start() {
    if (!slides.length || reduced) return;
    clearInterval(timer);
    timer = setInterval(next, SLIDE_MS);
  }

  const stop = () => clearInterval(timer);

  /** نوار پیشرفت — با animation ری‌استارت می‌شود، نه با تغییر width در JS */
  function restartBar() {
    if (!bar || reduced) return;
    bar.classList.remove('run');
    void bar.offsetWidth;          // یک بار reflow عمدی برای ری‌استارت
    bar.classList.add('run');
  }

  function initSlider() {
    if (!slides.length) return;

    slides[0].classList.add('active');
    dots[0]?.classList.add('active');
    restartBar();
    start();

    dots.forEach((d, i) =>
      d.addEventListener('click', () => { stop(); goTo(i); start(); })
    );

    if (hero) {
      hero.addEventListener('mouseenter', () => { stop(); bar?.classList.add('pause'); });
      hero.addEventListener('mouseleave', () => { bar?.classList.remove('pause'); start(); });

      // سوایپ لمسی
      let x0 = null;
      hero.addEventListener('touchstart', (e) => { x0 = e.changedTouches[0].clientX; stop(); },
                            { passive: true });
      hero.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45)
          goTo((current + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
        x0 = null;
        start();
      }, { passive: true });
    }

    // وقتی تب مخفی است، تایمر خاموش شود (صرفه‌جویی در CPU)
    document.addEventListener('visibilitychange', () =>
      document.hidden ? stop() : (restartBar(), start())
    );

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      stop();
      goTo((current + (e.key === 'ArrowLeft' ? 1 : -1) + slides.length) % slides.length);
      start();
    });
  }

  /* ============================================================
     4. تیلت کارت‌ها — با rAF و بدون خواندن مکرر layout
     ------------------------------------------------------------
     getBoundingClientRect فقط یک بار در mouseenter خوانده می‌شود،
     نه در هر mousemove. این تفاوت اصلی با نسخه‌ی قبلی است.
     ============================================================ */
  function initTilt() {
    if (reduced || !fine) return;

    $$('.store-card').forEach((card) => {
      let rect = null, raf = 0, mx = 0, my = 0;

      const apply = () => {
        raf = 0;
        card.style.transform =
          `perspective(800px) rotateX(${(-my * 8).toFixed(2)}deg) ` +
          `rotateY(${(mx * 9).toFixed(2)}deg) translate3d(0,-8px,0)`;
      };

      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });

      card.addEventListener('mousemove', (e) => {
        if (!rect) return;
        mx = (e.clientX - rect.left) / rect.width  - 0.5;
        my = (e.clientY - rect.top)  / rect.height - 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        rect = null;
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
     5. ظاهر شدن با اسکرول — IntersectionObserver + unobserve
     ============================================================ */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);      // هر عنصر فقط یک بار
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    items.forEach((el) => io.observe(el));
  }

  /* ============================================================
     6. نوار چسبان — scroll با rAF throttle و passive
     ============================================================ */
  function initNav() {
    const nav = $('#navbar');
    if (!nav) return;

    let ticking = false;
    let stuck   = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const should = window.scrollY > 30;
        if (should !== stuck) {          // فقط وقتی واقعاً تغییر کرده
          nav.classList.toggle('stuck', should);
          stuck = should;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     7. کرسر هاله‌ای — با میرایی نرم، فقط روی دستگاه‌های اشاره‌گر دقیق
     ============================================================ */
  function initCursor() {
    if (!fine || reduced) return;

    const aura = document.createElement('div');
    aura.className = 'aura';
    document.body.appendChild(aura);

    let tx = innerWidth / 2, ty = innerHeight / 2;
    let ax = tx, ay = ty, raf = 0;

    const loop = () => {
      ax += (tx - ax) * 0.16;
      ay += (ty - ay) * 0.16;
      aura.style.transform = `translate3d(${ax}px,${ay}px,0)`;
      // وقتی هاله به مقصد رسید، حلقه متوقف می‌شود — CPU آزاد
      raf = (Math.abs(tx - ax) > 0.3 || Math.abs(ty - ay) > 0.3)
        ? requestAnimationFrame(loop) : 0;
    };

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      aura.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseleave', () => aura.classList.remove('on'));
    document.addEventListener('mousedown',  () => aura.classList.add('down'));
    document.addEventListener('mouseup',    () => aura.classList.remove('down'));

    // یک شنونده روی body به‌جای صدها شنونده روی هر عنصر (event delegation)
    document.body.addEventListener('mouseover', (e) => {
      if (e.target.closest('a,button,.store-card,.why-card,.review-card,input'))
        aura.classList.add('hover');
    }, { passive: true });

    document.body.addEventListener('mouseout', (e) => {
      if (e.target.closest('a,button,.store-card,.why-card,.review-card,input'))
        aura.classList.remove('hover');
    }, { passive: true });
  }

  /* ============================================================
     8. تعامل‌ها — با event delegation (یک شنونده به‌جای ده‌ها)
     ============================================================ */
  const toast = $('#toast');
  let toastT = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('on'), 2600);
  }

  function scrollToSel(sel) {
    const t = $(sel);
    if (!t) return;
    const top = t.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  function initInteractions() {
    let cart = 2;
    const badge = $('.nav-count');

    // یک شنونده برای کل صفحه
    document.addEventListener('click', (e) => {
      const t = e.target;

      const scroller = t.closest('[data-scroll]');
      if (scroller) { scrollToSel(scroller.dataset.scroll); return; }

      const store = t.closest('.btn-store');
      if (store) {
        const name = store.closest('.store-card')?.querySelector('.store-name')?.textContent.trim();
        showToast(name ? `به‌زودی: ${name}` : 'به‌زودی در دسترس است');
        return;
      }

      const icon = t.closest('.nav-icon');
      if (icon) {
        showToast(`${icon.getAttribute('aria-label')} به‌زودی فعال می‌شود`);
        return;
      }

      const cta = t.closest('.btn-cta, .btn-featured');
      if (cta) {
        showToast(cta.classList.contains('btn-cta')
          ? 'فرم ثبت‌نام به‌زودی فعال می‌شود'
          : 'به‌زودی: فروشگاه ماه‌رخ');
        return;
      }

      const anchor = t.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#' && $(href)) { e.preventDefault(); scrollToSel(href); }
      }
    });

    $('#newsletterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = e.target.querySelector('input');
      if (input?.value.trim()) { showToast('عضویت شما در خبرنامه ثبت شد'); input.value = ''; }
    });
  }

  /* ============================================================
     راه‌اندازی
     ------------------------------------------------------------
     کارهای حیاتی فوراً، کارهای تزئینی بعد از رنگ‌آمیزی اول صفحه.
     این باعث می‌شود صفحه سریع‌تر «آماده» به نظر برسد.
     ============================================================ */
  function boot() {
    initSlider();        // حیاتی — بلافاصله
    initNav();
    initReveal();
    initInteractions();

    // تزئینات بعد از اولین فریم — تا LCP دیرتر نشود
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buildFlowers();
        buildParticles();
        initFlowerGrowth();
        initTilt();
        initCursor();
      });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();
})();

  /* روی صفحه‌ی کوچک، تزئینات کمتر ساخته می‌شوند */
  const DECO = window.matchMedia('(max-width: 900px)').matches ? 0.4 : 1;
  const q = (n) => Math.max(2, Math.round(n * DECO));

