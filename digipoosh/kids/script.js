/* ============================================================
   دیجی‌پوش — KIDS FASHION PAGE — "Joyful Premium"
   Pure Vanilla JavaScript — no libraries, no frameworks
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ضریب تعداد تزئینات — روی صفحه‌ی کوچک ۶۰٪ کمتر ساخته می‌شود.
     پنهان کردن با CSS کافی نیست؛ عنصری که ساخته نشود اصلاً
     حافظه و زمان نمی‌گیرد. */
  const DECO = window.matchMedia('(max-width: 900px)').matches ? 0.4 : 1;
  const q = (n) => Math.max(2, Math.round(n * DECO));

  const finePointer = window.matchMedia("(pointer:fine)").matches;

  const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (n) => String(n).replace(/\d/g, (d) => FA[+d]);

  const PALETTE = ["#c9a84c", "#d4b85a", "#6ec8d9", "#c9a84c", "#f5a0a0", "#b8943c", "#8bc9a8", "#f0c97a"];

  /* ============================================
     1. CLOUDS — 5 soft drifting shapes
     ============================================ */
  function buildClouds() {
    const layer = $("#clouds");
    if (!layer || prefersReduced) return;

    const specs = [
      { w: 190, top: 8, dur: 30, delay: 0, op: 0.5 },
      { w: 130, top: 22, dur: 38, delay: -8, op: 0.38 },
      { w: 230, top: 46, dur: 34, delay: -16, op: 0.32 },
      { w: 150, top: 66, dur: 42, delay: -5, op: 0.42 },
      { w: 180, top: 84, dur: 36, delay: -22, op: 0.3 },
    ];

    specs.forEach((s) => {
      const c = document.createElement("div");
      c.className = "cloud";
      c.style.width = `${s.w}px`;
      c.style.height = `${s.w * 0.34}px`;
      c.style.top = `${s.top}%`;
      c.style.left = "100%";
      c.style.opacity = String(s.op);
      c.style.setProperty("--dur", `${s.dur}s`);
      c.style.animationDelay = `${s.delay}s`;
      layer.appendChild(c);
    });
  }

  /* ============================================
     2. BUBBLES — 15 glassy floating bubbles
     ============================================ */
  function buildBubbles() {
    const layer = $("#bubbles");
    if (!layer || prefersReduced) return;

    const nB = q(10);
    for (let i = 0; i < nB; i += 1) {
      const b = document.createElement("div");
      const size = 20 + Math.random() * 40;
      const color = PALETTE[i % PALETTE.length];

      b.className = "bubble";
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${Math.random() * 94}%`;
      b.style.top = `${Math.random() * 92}%`;
      b.style.background = `radial-gradient(circle at 32% 30%, ${color}55, ${color}22 60%, transparent)`;
      b.style.boxShadow = `0 4px 18px ${color}33`;
      b.style.setProperty("--dur", `${4 + Math.random() * 2.5}s`);
      b.style.animationDelay = `${Math.random() * 5}s`;
      layer.appendChild(b);
    }
  }

  /* ============================================
     3. SPARKLING STARS — 12 twinkling stars
     ============================================ */
  function buildSparkles() {
    const layer = $("#sparkles");
    if (!layer || prefersReduced) return;

    const colors = ["#c9a84c", "#d4b85a", "#c9a84c", "#f0c97a", "#b8943c", "#ffffff", "#c9a84c", "#f5a0a0"];
    const star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.6 2.3 5.4 5.8.5-4.4 3.8 1.3 5.7L12 16l-5 3 1.3-5.7L3.9 9.5l5.8-.5z"/></svg>';

    const nS = q(8);
    for (let i = 0; i < nS; i += 1) {
      const s = document.createElement("div");
      const size = 12 + Math.random() * 16;

      s.className = "sparkle";
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 95}%`;
      s.style.top = `${Math.random() * 92}%`;
      s.style.color = colors[i % colors.length];
      s.style.setProperty("--dur", `${1.5 + Math.random() * 1.5}s`);
      s.style.animationDelay = `${Math.random() * 3}s`;
      s.innerHTML = star;
      layer.appendChild(s);
    }
  }

  /* ============================================
     4. BOUNCING BALLS — 6 gentle bouncers
     ============================================ */
  function buildBalls() {
    const layer = $("#balls");
    if (!layer || prefersReduced) return;

    const nBa = q(4);
    for (let i = 0; i < nBa; i += 1) {
      const b = document.createElement("div");
      const size = 16 + Math.random() * 22;
      const color = PALETTE[i % PALETTE.length];

      b.className = "ball";
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${8 + i * 15 + Math.random() * 6}%`;
      b.style.top = `${20 + Math.random() * 62}%`;
      b.style.background = `radial-gradient(circle at 34% 30%, ${color}, ${color}bb)`;
      b.style.boxShadow = `0 6px 16px ${color}44`;
      b.style.setProperty("--dur", `${2 + Math.random() * 2}s`);
      b.style.setProperty("--h", `${10 + Math.random() * 20}px`);
      b.style.animationDelay = `${Math.random() * 2}s`;
      layer.appendChild(b);
    }
  }

  /* ============================================
     4B. FLOATING TOYS — SVG shapes
     ============================================ */
  const TOY_SVG = {
    bear: '<circle cx="7.2" cy="6.6" r="2.4"/><circle cx="16.8" cy="6.6" r="2.4"/><path d="M12 20.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/><path d="M10 13h.01M14 13h.01"/><path d="M10.7 16a2.4 2.4 0 0 0 2.6 0"/>',
    car: '<path d="M4 15.5h16v-3l-2-.6-1.8-3.4H7.8L6 11.9l-2 .6z"/><circle cx="8" cy="15.5" r="1.2"/><circle cx="16" cy="15.5" r="1.2"/>',
    puzzle: '<path d="M10 4.5h4a1 1 0 0 1 1 1v1.2a1.6 1.6 0 1 0 2.8 1.05 1 1 0 0 1 1.7.75v4a1 1 0 0 1-1 1h-1.2a1.6 1.6 0 1 0-1.05 2.8 1 1 0 0 1 .75 1.7h-4a1 1 0 0 1-1-1v-1.2a1.6 1.6 0 1 0-2.8-1.05 1 1 0 0 1-1.7-.75v-4a1 1 0 0 1 1-1h1.2A1.6 1.6 0 1 0 9.25 6.2 1 1 0 0 1 10 4.5Z"/>',
    horse: '<path d="m12 3 8 4H4z"/><path d="M6 7v8M18 7v8M12 7v13"/><path d="M4.5 15.5h15"/>',
    ball: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/>',
    bunny: '<ellipse cx="9" cy="6" rx="1.8" ry="3.6"/><ellipse cx="15" cy="6" rx="1.8" ry="3.6"/><circle cx="12" cy="15" r="5.2"/><path d="M10.4 14.2h.01M13.6 14.2h.01"/><path d="M12 16v1M10.6 18a2 2 0 0 0 2.8 0"/>',
    blocks: '<rect x="3.5" y="12.5" width="8" height="8" rx="1"/><rect x="12.5" y="12.5" width="8" height="8" rx="1"/><rect x="8" y="3.5" width="8" height="8" rx="1"/>',
    kite: '<path d="M12 3 19 10l-7 11-7-11z"/><path d="M12 3v18M5 10h14"/>',
  };

  function createToys() {
    const layer = $("#toys");
    if (!layer || prefersReduced) return;

    const names = ["bear", "car", "puzzle", "horse", "ball", "bunny", "blocks", "kite",
                   "bear", "car", "puzzle", "ball"];

    const nT = q(8);
    for (let i = 0; i < nT; i += 1) {
      const toy = document.createElement("div");
      const size = 26 + Math.random() * 32;
      const color = PALETTE[i % PALETTE.length];
      const name = names[i % names.length];

      toy.className = "toy";
      toy.style.width = `${size}px`;
      toy.style.height = `${size}px`;
      toy.style.left = `${4 + Math.random() * 90}%`;
      toy.style.top = `${6 + Math.random() * 84}%`;
      toy.style.color = color;
      toy.style.opacity = String(0.4 + Math.random() * 0.3);
      toy.style.setProperty("--dur", `${6 + Math.random() * 4}s`);
      toy.style.animationDelay = `${Math.random() * 4}s`;
      toy.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${TOY_SVG[name]}</svg>`;
      layer.appendChild(toy);
    }
  }

  /* ============================================
     4C. FLOATING BALLOONS — 8 with strings
     ============================================ */
  function createBalloons() {
    const layer = $("#balloons");
    if (!layer || prefersReduced) return;

    const colors = ["#c9a84c", "#6ec8d9", "#d4b85a", "#f5a0a0", "#c9a84c", "#8bc9a8", "#b8943c", "#f0c97a"];

    const nBl = q(6);
    for (let i = 0; i < nBl; i += 1) {
      const b = document.createElement("div");
      const w = 26 + Math.random() * 22;
      const color = colors[i];

      b.className = "balloon";
      b.style.width = `${w}px`;
      b.style.left = `${5 + i * 11.5 + Math.random() * 4}%`;
      b.style.top = `${8 + Math.random() * 70}%`;
      b.style.color = color;
      b.style.opacity = String(0.42 + Math.random() * 0.25);
      b.style.setProperty("--dur", `${8 + Math.random() * 4}s`);
      b.style.animationDelay = `${Math.random() * 4}s`;
      b.innerHTML = `<div class="bubble-body" style="background:radial-gradient(circle at 32% 26%, ${color}, ${color}cc)"></div><span class="string"></span>`;
      layer.appendChild(b);
    }
  }

  /* ============================================
     4D. GROWING FLOWERS — 12, bloom on scroll
     ============================================ */
  const flowers = [];

  function createFlowers() {
    const layer = $("#flowers");
    if (!layer || prefersReduced) return;

    const sizes = ["", "flower-large", "", "flower-small", "", "flower-large",
                   "flower-small", "", "", "flower-small", "", "flower-large"];

    const nF = q(8);
    for (let i = 0; i < nF; i += 1) {
      const f = document.createElement("div");
      const size = sizes[i % sizes.length];

      f.className = `flower flower-${(i % 6) + 1} ${size}`.trim();
      f.style.left = `${3 + i * 8 + (Math.random() * 3 - 1.5)}%`;
      f.style.bottom = `${-8 - Math.random() * 30}px`;
      f.style.zIndex = size === "flower-large" ? "2" : size === "flower-small" ? "0" : "1";
      f.innerHTML = '<div class="petals"></div><div class="stem"></div>';
      layer.appendChild(f);
      flowers.push(f);
    }
  }

  function initFlowerGrowth() {
    if (!flowers.length || prefersReduced) return;

    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

      flowers.forEach((f, i) => {
        const sproutAt = (i / flowers.length) * 0.55;
        const bloomAt = sproutAt + 0.12;
        f.classList.toggle("visible", progress >= sproutAt);
        f.classList.toggle("bloom", progress >= bloomAt);
      });

      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    setTimeout(() => {
      flowers.slice(0, 4).forEach((f, i) => {
        setTimeout(() => {
          f.classList.add("visible");
          setTimeout(() => f.classList.add("bloom"), 850);
        }, i * 200);
      });
    }, 500);

    update();
  }

  /* ============================================
     5. AMBIENT PARALLAX
     ============================================ */
  function initParallax() {
    if (prefersReduced || !finePointer) return;

    const bubbles = $$(".bubble");
    const balls = $$(".ball");
    const sparkles = $$(".sparkle");
    const toys = $$(".toy");
    const balloons = $$(".balloon");
    const petals = $$(".flower");
    if (!bubbles.length && !toys.length) return;

    let mx = 0;
    let my = 0;
    let ticking = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;

      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        /* به‌جای margin (که چیدمان را دوباره می‌سازد)، دو متغیر CSS
           می‌نویسیم و خود CSS با translate3d جابه‌جا می‌کند.
           هزینه‌ی چیدمان صفر، همه‌چیز روی کارت گرافیک. */
        const shift = (list, k, invert) => {
          const sign = invert ? -1 : 1;
          for (let i = 0; i < list.length; i++) {
            const d = ((i % 5) + 1) * k;
            list[i].style.setProperty('--px', (sign * mx * d).toFixed(1) + 'px');
            list[i].style.setProperty('--py', (sign * my * d).toFixed(1) + 'px');
          }
        };
        shift(bubbles, 7, true);
        shift(balls, 9, false);
        shift(sparkles, 5, false);
        shift(toys, 8, true);
        shift(balloons, 6, false);
        shift(petals, 2.5, false);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ============================================
     6. HERO SLIDER — 3s autoplay, fade + zoom + bounce
     ============================================ */
  const SLIDE_DURATION = 3000;
  const slides = $$(".slide");
  const dots = $$(".slider-dots .dot");
  const progressBar = $(".slider-progress-bar");
  const heroSlider = $("#heroSlider");

  let currentSlide = 0;
  let slideInterval = null;

  function goToSlide(index) {
    if (!slides.length || index === currentSlide) return;

    const outgoing = slides[currentSlide];

    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    if (outgoing && outgoing !== slides[index]) {
      outgoing.classList.add("is-leaving");
      setTimeout(() => outgoing.classList.remove("is-leaving"), 1200);
    }

    slides[index].classList.add("active");
    if (dots[index]) dots[index].classList.add("active");
    currentSlide = index;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
    resetProgress();
  }

  function startSlider() {
    if (!slides.length || prefersReduced) return;
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopSlider() { clearInterval(slideInterval); }

  function resetProgress() {
    if (!progressBar || prefersReduced) return;
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    setTimeout(() => {
      progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
      progressBar.style.width = "100%";
    }, 50);
  }

  function initSlider() {
    if (!slides.length) return;

    slides[0].classList.add("active");
    if (dots[0]) dots[0].classList.add("active");
    resetProgress();
    startSlider();

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stopSlider();
        goToSlide(i);
        resetProgress();
        startSlider();
      });
    });

    if (heroSlider) {
      heroSlider.addEventListener("mouseenter", () => {
        stopSlider();
        if (progressBar) {
          const w = getComputedStyle(progressBar).width;
          progressBar.style.transition = "none";
          progressBar.style.width = w;
        }
      });

      heroSlider.addEventListener("mouseleave", () => {
        resetProgress();
        startSlider();
      });

      let tx = null;
      heroSlider.addEventListener("touchstart", (e) => {
        tx = e.changedTouches[0].clientX;
        stopSlider();
      }, { passive: true });

      heroSlider.addEventListener("touchend", (e) => {
        if (tx === null) return;
        const d = e.changedTouches[0].clientX - tx;
        if (Math.abs(d) > 45) {
          goToSlide((currentSlide + (d < 0 ? 1 : -1) + slides.length) % slides.length);
        }
        tx = null;
        resetProgress();
        startSlider();
      }, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopSlider();
      else { resetProgress(); startSlider(); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      stopSlider();
      goToSlide((currentSlide + (e.key === "ArrowLeft" ? 1 : -1) + slides.length) % slides.length);
      resetProgress();
      startSlider();
    });
  }

  /* ============================================
     7. 3D TILT ON STORE CARDS
     ============================================ */
  function initTilt() {
    if (prefersReduced || !finePointer) return;

    /* یک شنونده برای همه‌ی کارت‌ها به‌جای دو شنونده برای هرکدام.
       اندازه‌ی کارت یک بار هنگام ورود موش خوانده می‌شود، نه در
       هر حرکت — این جلوی «محاسبه‌ی همگام اجباری» را می‌گیرد. */
    var box = null;
    var host = null;
    var tick = false;
    var cx = 0, cy = 0;

    document.addEventListener("mouseover", function (e) {
      var card = e.target.closest && e.target.closest("[data-tilt]");
      if (card === host) return;
      if (host) reset(host);
      host = card;
      box = card ? card.getBoundingClientRect() : null;
    }, { passive: true });

    document.addEventListener("mousemove", function (e) {
      if (!host || !box) return;
      cx = (e.clientX - box.left) / box.width - 0.5;
      cy = (e.clientY - box.top) / box.height - 0.5;
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        if (host) {
          host.style.transform =
            "perspective(800px) rotateX(" + (-cy * 9) + "deg) rotateY(" +
            (cx * 11) + "deg) translate3d(0,-9px,0)";
          host.style.boxShadow =
            (cx * 22) + "px " + (cy * 22 + 16) + "px 46px rgba(201, 168, 76, 0.3)";
        }
        tick = false;
      });
    }, { passive: true });

    document.addEventListener("mouseout", function (e) {
      if (!host) return;
      if (e.relatedTarget && e.relatedTarget.closest &&
          e.relatedTarget.closest("[data-tilt]") === host) return;
      reset(host);
      host = null;
      box = null;
    }, { passive: true });

    /* اندازه‌ها با پیمایش و تغییر پنجره کهنه می‌شوند */
    var refresh = function () { if (host) box = host.getBoundingClientRect(); };
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });

    function reset(el) {
      el.style.transform = "perspective(800px) rotateX(0) rotateY(0) translate3d(0,0,0)";
      el.style.boxShadow = "0 8px 30px rgba(201, 168, 76, 0.14)";
    }
  }

  /* ============================================
     8. STICKY NAVBAR
     ============================================ */
  function initNav() {
    const nav = $("#navbar");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================
     9. SCROLL REVEAL
     ============================================ */
  function initReveal() {
    const items = $$(".why-card, .age-category, .store-card, .set-card, .toy-card, .review-card, .how-step, .criteria-list li, .featured-grid, .cta-content");
    if (!items.length || prefersReduced || !("IntersectionObserver" in window)) return;

    items.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-in"), i * 90);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* ============================================
     10. TOAST + INTERACTIONS
     ============================================ */
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function scrollToSel(sel) {
    const t = $(sel);
    if (!t) return;
    const top = t.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  }

  function initInteractions() {
    let cart = 2;
    const badge = $(".nav-count");

    $$("[data-scroll]").forEach((b) => {
      b.addEventListener("click", () => scrollToSel(b.dataset.scroll));
    });

    $$(".btn-store").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".store-card");
        const name = card ? card.querySelector(".store-name").textContent.trim() : "";
        showToast(name ? `به‌زودی: ${name}` : "به‌زودی در دسترس است");
      });
    });

    $$(".btn-set").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".set-card");
        const name = card ? card.querySelector("h3").textContent.trim() : "ست";
        cart += 1;
        if (badge) badge.textContent = toFa(cart);
        showToast(`${name} به سبد افزوده شد`);
      });
    });

    $$(".btn-toy").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".toy-card");
        const name = card ? card.querySelector("h3").textContent.trim() : "اسباب‌بازی";
        cart += 1;
        if (badge) badge.textContent = toFa(cart);
        showToast(`${name} به سبد افزوده شد`);
      });
    });

    $$(".age-category").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.querySelector("h3").textContent.trim();
        showToast(`ویترین ${name} به‌زودی باز می‌شود`);
      });
    });

    $$(".nav-icon").forEach((btn) => {
      btn.addEventListener("click", () => {
        showToast(`${btn.getAttribute("aria-label")} به‌زودی فعال می‌شود`);
      });
    });

    const featured = $(".featured-body .btn-primary");
    if (featured) featured.addEventListener("click", () => showToast("به‌زودی: بوتیک کودک ماهان"));

    const cta = $(".btn-cta");
    if (cta) cta.addEventListener("click", () => showToast("فرم ثبت‌نام به‌زودی فعال می‌شود"));

    const form = $("#newsletterForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $(".newsletter-input", form);
        if (input && input.value.trim()) {
          showToast("عضویت شما در خبرنامه ثبت شد");
          input.value = "";
        }
      });
    }

    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#" || !$(href)) return;
        e.preventDefault();
        scrollToSel(href);
      });
    });
  }

  /* ============================================
     INIT
     ============================================ */
  buildClouds();
  buildBubbles();
  buildSparkles();
  buildBalls();
  createToys();
  createBalloons();
  createFlowers();
  initFlowerGrowth();
  initParallax();
  initSlider();
  initTilt();
  initNav();
  initReveal();
  initInteractions();
})();
