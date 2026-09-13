/* ============================================================
   دیجی‌پوش — TEEN FASHION PAGE — "Gaming Arena"
   Pure Vanilla JavaScript — no libraries, no frameworks
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* روی صفحه‌ی کوچک، تزئینات کمتر ساخته می‌شوند */
  const DECO = window.matchMedia('(max-width: 900px)').matches ? 0.4 : 1;
  const q = (n) => Math.max(2, Math.round(n * DECO));

  const finePointer = window.matchMedia("(pointer:fine)").matches;

  const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (n) => String(n).replace(/\d/g, (d) => FA[+d]);

  const NEON = ["#c9a84c", "#d4b85a", "#8b5cf6", "#00d4ff", "#ff2d95", "#c9a84c"];

  /* ============================================
     1. FLOATING GAMING ICONS — SVG, 12 of them
     ============================================ */
  const ICON_SVG = {
    gamepad: '<path d="M7.6 8h8.8a4.2 4.2 0 0 1 4.1 3.3l.9 4.3a2.4 2.4 0 0 1-4.2 2l-1.5-1.7H8.3l-1.5 1.7a2.4 2.4 0 0 1-4.2-2l.9-4.3A4.2 4.2 0 0 1 7.6 8Z"/><path d="M7.2 11.6v2.2M6.1 12.7h2.2"/>',
    joystick: '<circle cx="12" cy="6.5" r="2.6"/><path d="M12 9.1v5.4"/><path d="M6.5 20.5a5.5 5.5 0 0 1 11 0z"/>',
    keyboard: '<rect x="2.8" y="7" width="18.4" height="10.5" rx="2"/><path d="M6.3 10.3h.01M9.3 10.3h.01M12.3 10.3h.01M15.3 10.3h.01M18 10.3h.01M9 14h6"/>',
    mouse: '<rect x="7.5" y="3.5" width="9" height="17" rx="4.5"/><path d="M12 7.2v3"/>',
    headset: '<path d="M5 14v-2a7 7 0 0 1 14 0v2"/><path d="M5 14h1.8a1.2 1.2 0 0 1 1.2 1.2v2.6A1.2 1.2 0 0 1 6.8 19H6a1 1 0 0 1-1-1z"/><path d="M19 14h-1.8a1.2 1.2 0 0 0-1.2 1.2v2.6a1.2 1.2 0 0 0 1.2 1.2h.8a1 1 0 0 0 1-1z"/>',
    monitor: '<rect x="2.8" y="4" width="18.4" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.1"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5A2.5 2.5 0 0 0 8 10M16 5.5h2.5A2.5 2.5 0 0 1 16 10"/><path d="M12 13v3.5M9 20h6l-.6-3.5H9.6z"/>',
    bolt: '<path d="M13.5 3 6 13.5h5L10.5 21 18 10.5h-5z"/>',
    flame: '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4.4-5.4-3.6-10.4-2.6 1-4.6 3.4-4.6 6 0 1-.6 1.8-1.4 1.8-.8 0-1.3-.7-1.4-1.7C5.6 12.5 6 13.9 6 15.4 6 18.6 8.4 21 12 21Z"/>',
    ghost: '<path d="M5 20V11a7 7 0 0 1 14 0v9l-2.3-1.6L14.4 20l-2.4-1.6L9.6 20l-2.3-1.6z"/><path d="M9.6 10.5h.01M14.4 10.5h.01"/>',
    levelup: '<path d="m12 4 6 6h-3.6v10H9.6V10H6z"/>',
  };

  function createGamingIcons() {
    const layer = $("#gamingIcons");
    if (!layer || prefersReduced) return;

    const names = Object.keys(ICON_SVG);

    const nI = q(8);
    for (let i = 0; i < nI; i += 1) {
      const el = document.createElement("div");
      const size = 24 + Math.random() * 34;
      const color = NEON[i % NEON.length];

      el.className = "g-icon";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${4 + Math.random() * 90}%`;
      el.style.top = `${5 + Math.random() * 86}%`;
      el.style.color = color;
      el.style.opacity = String(0.16 + Math.random() * 0.2);
      el.style.filter = `drop-shadow(0 0 10px ${color})`;
      el.style.setProperty("--dur", `${6 + Math.random() * 5}s`);
      el.style.animationDelay = `${Math.random() * 5}s`;
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[names[i % names.length]]}</svg>`;
      layer.appendChild(el);
    }
  }

  /* ============================================
     1B. NEON GEOMETRIC SHAPES — 8 floating
     ============================================ */
  function createNeonShapes() {
    const layer = $("#neonShapes");
    if (!layer || prefersReduced) return;

    const kinds = ["sq", "ring", "hex", "tri", "sq", "ring", "hex", "tri"];

    const nSh = q(5);
    for (let i = 0; i < nSh; i += 1) {
      const s = document.createElement("div");
      const size = 30 + Math.random() * 90;
      const color = NEON[i % NEON.length];
      const kind = kinds[i];

      s.className = `n-shape ${kind}`;
      s.style.setProperty("--w", `${size / 2}px`);
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${4 + Math.random() * 88}%`;
      s.style.top = `${5 + Math.random() * 84}%`;
      s.style.color = color;
      s.style.opacity = String(0.18 + Math.random() * 0.22);
      s.style.filter = `drop-shadow(0 0 14px ${color})`;
      s.style.setProperty("--dur", `${14 + Math.random() * 10}s`);
      s.style.animationDelay = `${Math.random() * 8}s`;
      layer.appendChild(s);
    }
  }

  /* ============================================
     2. PIXEL DUST
     ============================================ */
  function createPixels() {
    const layer = $("#pixels");
    if (!layer || prefersReduced) return;

    const count = window.innerWidth > 1000 ? 15 : 0;

    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("span");
      const size = 2 + Math.random() * 5;
      const color = NEON[Math.floor(Math.random() * NEON.length)];

      p.className = "pixel";
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.background = color;
      p.style.boxShadow = `0 0 ${6 + size * 2.5}px ${color}`;
      p.style.setProperty("--dur", `${13 + Math.random() * 10}s`);
      p.style.animationDelay = `${Math.random() * 9}s`;
      layer.appendChild(p);
    }
  }

  /* ============================================
     3. AMBIENT PARALLAX
     ============================================ */
  function initParallax() {
    if (prefersReduced || !finePointer) return;

    const icons = $$(".g-icon");
    const shapes = $$(".n-shape");
    const pixels = $$(".pixel");
    const glows = $$(".neon-glow");
    if (!icons.length && !pixels.length) return;

    let mx = 0;
    let my = 0;
    let ticking = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;

      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        /* متغیر CSS به‌جای margin — چیدمان دست‌نخورده می‌ماند */
        const shift = (list, k, mod, invert) => {
          const sign = invert ? -1 : 1;
          for (let i = 0; i < list.length; i++) {
            const d = ((i % mod) + 1) * k;
            list[i].style.setProperty('--px', (sign * mx * d).toFixed(1) + 'px');
            list[i].style.setProperty('--py', (sign * my * d).toFixed(1) + 'px');
          }
        };
        shift(icons, 8, 5, true);
        shift(shapes, 10, 4, false);
        shift(pixels, 6, 6, true);
        shift(glows, 11, 99, false);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ============================================
     4. HERO SLIDER — 3s, fade + zoom + glitch
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
     5. 3D TILT
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
            (cx * 10) + "deg) translate3d(0,-9px,0)";
          host.style.boxShadow =
            (cx * 22) + "px " + (cy * 22 + 16) + "px 46px rgba(139, 92, 246, 0.4)";
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
      el.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.35)";
    }
  }

  /* ============================================
     6. STICKY NAV + LIVE COUNTER
     ============================================ */
  function initNav() {
    const nav = $("#navbar");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initOnlineCounter() {
    const el = $("#onlineCount");
    if (!el || prefersReduced) return;

    let value = 1240;

    setInterval(() => {
      value += Math.floor(Math.random() * 11) - 5;
      value = Math.max(1180, Math.min(1320, value));
      el.textContent = toFa(value);
    }, 3200);
  }

  /* ============================================
     7. POWER BARS + REVEAL
     ============================================ */
  function initReveal() {
    const items = $$(".why-card, .trend-card, .store-card, .review-card, .step-card, .criteria-list li, .speed-stat, .featured-grid, .cta-content");
    if (!items.length || prefersReduced || !("IntersectionObserver" in window)) return;

    items.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-in"), i * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* Animate power bars from zero when they scroll in */
  function initPowerBars() {
    const bars = $$(".power-bar span");
    if (!bars.length || prefersReduced || !("IntersectionObserver" in window)) return;

    bars.forEach((b) => {
      b.dataset.target = b.style.width;
      b.style.width = "0%";
      b.style.transition = "width 1.3s cubic-bezier(0.16, 1, 0.3, 1)";
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const b = entry.target;
        setTimeout(() => { b.style.width = b.dataset.target; }, 180);
        io.unobserve(b);
      });
    }, { threshold: 0.4 });

    bars.forEach((b) => io.observe(b));
  }

  /* ============================================
     8. TOAST + INTERACTIONS
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

    $$(".btn-arena").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".store-card");
        const name = card ? card.querySelector(".store-name").textContent.trim() : "";
        showToast(name ? `به‌زودی: ${name}` : "به‌زودی در دسترس است");
      });
    });

    $$(".nav-icon").forEach((btn) => {
      btn.addEventListener("click", () => {
        showToast(`${btn.getAttribute("aria-label")} به‌زودی فعال می‌شود`);
      });
    });

    $$(".btn-gaming").forEach((btn) => {
      btn.addEventListener("click", () => {
        showToast(btn.textContent.includes("حساب")
          ? "فرم ثبت‌نام به‌زودی فعال می‌شود"
          : "به‌زودی: فروشگاه انرژی");
      });
    });

    const form = $("#newsletterForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $(".newsletter-input", form);
        if (input && input.value.trim()) {
          showToast("عضویت تو در خبرنامه ثبت شد");
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
     8B. SOCIAL — like / share
     ============================================ */
  function parseFa(str) {
    const map = { "۰": 0, "۱": 1, "۲": 2, "۳": 3, "۴": 4, "۵": 5, "۶": 6, "۷": 7, "۸": 8, "۹": 9 };
    return parseInt(String(str).replace(/[۰-۹]/g, (d) => map[d]).replace(/[^\d]/g, ""), 10) || 0;
  }

  function initSocial() {
    const liked = new Set();

    $$(".like-btn").forEach((btn) => {
      const countEl = btn.querySelector(".like-count");
      let count = parseFa(countEl.textContent);

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const on = btn.classList.toggle("liked");

        if (on) { count += 1; liked.add(id); }
        else { count -= 1; liked.delete(id); }

        countEl.textContent = toFa(count.toLocaleString("en-US").replace(/,/g, "٬"));
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });

    $$(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".trend-card, .store-card");
        const name = card ? (card.querySelector("h3") || {}).textContent : "";
        const text = name ? `${name.trim()} — دیجی‌پوش` : "دیجی‌پوش";

        if (navigator.share) {
          navigator.share({ title: "دیجی‌پوش", text }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(`${text} — ${location.href}`).catch(() => {});
          showToast("لینک کپی شد");
        } else {
          showToast("هم‌رسانی در این مرورگر پشتیبانی نمی‌شود");
        }
      });
    });
  }

  /* ============================================
     INIT
     ============================================ */
  createGamingIcons();
  createNeonShapes();
  createPixels();
  initParallax();
  initSlider();
  initTilt();
  initNav();
  initOnlineCounter();
  initReveal();
  initPowerBars();
  initInteractions();
  initSocial();
})();
