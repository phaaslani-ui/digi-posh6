/* ============================================================
   دیجی‌پوش — MEN'S FASHION PAGE — "Masculine Power"
   Pure Vanilla JavaScript — no libraries, no frameworks
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer:fine)").matches;

  const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (n) => String(n).replace(/\d/g, (d) => FA[+d]);

  /* ============================================
     1. METALLIC PARTICLES — 30 heavy dust motes
     ============================================ */
  function buildParticles() {
    const layer = $("#metalParticles");
    if (!layer || prefersReduced) return;

    const metals = ["#b8943c", "#c9a84c", "#a6843a", "#c0c0c0", "#d4d4d4"];
    const count = window.innerWidth > 1000 ? 15 : 0;

    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("span");
      const size = 2 + Math.random() * 6;
      const color = metals[Math.floor(Math.random() * metals.length)];

      p.className = "mp";
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.background = color;
      p.style.boxShadow = `0 0 ${5 + size * 2.5}px ${color}`;
      p.style.setProperty("--dur", `${16 + Math.random() * 12}s`);
      p.style.animationDelay = `${Math.random() * 10}s`;
      layer.appendChild(p);
    }
  }

  /* ============================================
     2. HERO SLIDER — 3s autoplay, cinematic fade + zoom
     ============================================ */
  const SLIDE_DURATION = 3000;
  const slides = $$(".slide");
  const dots = $$(".slider-dots-m .dot");
  const progressBar = $(".slider-progress-bar-m");
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
      setTimeout(() => outgoing.classList.remove("is-leaving"), 1400);
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
     3. AMBIENT PARALLAX — geometry + particles
     ============================================ */
  function initParallax() {
    if (prefersReduced || !finePointer) return;

    const geo = $$(".geo");
    const dust = $$(".mp");
    if (!geo.length && !dust.length) return;

    let mx = 0;
    let my = 0;
    let ticking = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;

      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        /* متغیر CSS به‌جای margin — بدون محاسبه‌ی دوباره‌ی چیدمان */
        for (let i = 0; i < geo.length; i++) {
          const d = 14 + i * 9;
          geo[i].style.setProperty('--px', (mx * d).toFixed(1) + 'px');
          geo[i].style.setProperty('--py', (my * d).toFixed(1) + 'px');
        }

        for (let i = 0; i < dust.length; i++) {
          const d = ((i % 6) + 1) * 6;
          dust[i].style.setProperty('--px', (-mx * d).toFixed(1) + 'px');
          dust[i].style.setProperty('--py', (-my * d).toFixed(1) + 'px');
        }

        ticking = false;
      });
    }, { passive: true });

    /* با requestAnimationFrame مهار می‌شود تا در هر پیکسل پیمایش اجرا نشود */
    let geoTick = false;
    window.addEventListener("scroll", () => {
      if (geoTick) return;
      geoTick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.02;
        geo.forEach((g, i) => { g.style.transform = `translate3d(0, ${-y * ((i % 3) + 1)}px, 0)`; });
        geoTick = false;
      });
    }, { passive: true });
  }

  /* ============================================
     4. 3D TILT ON STORE CARDS
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
            (cx * 22) + "px " + (cy * 22 + 16) + "px 46px rgba(0, 0, 0, 0.5)";
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
      el.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
    }
  }

  /* ============================================
     5. STICKY NAVBAR
     ============================================ */
  function initNav() {
    const nav = $("#navbar");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================
     6. SCROLL REVEAL
     ============================================ */
  function initReveal() {
    const items = $$(".why-card-m, .store-card-m, .review-m, .step-m, .trust-m, .criteria-m li, .stat-m, .featured-grid-m, .cta-inner-m");
    if (!items.length || prefersReduced || !("IntersectionObserver" in window)) return;

    items.forEach((el) => el.classList.add("reveal-m"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-in"), i * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* ============================================
     7. STAT COUNTERS
     ============================================ */
  function initCounters() {
    const nums = $$(".stat-num");
    if (!nums.length || prefersReduced || !("IntersectionObserver" in window)) return;

    const toEn = (s) => s.replace(/[۰-۹]/g, (d) => FA.indexOf(d));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.textContent.trim();
        const target = parseFloat(toEn(raw).replace(/[^\d.]/g, ""));
        if (!target) { io.unobserve(el); return; }

        const suffix = raw.replace(/[۰-۹0-9.٫]/g, "");
        const dec = raw.includes("٫") || raw.includes(".") ? 1 : 0;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / 1300, 1);
          const v = (1 - Math.pow(1 - p, 3)) * target;
          el.textContent = toFa(dec ? v.toFixed(1).replace(".", "٫") : Math.round(v)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    nums.forEach((n) => io.observe(n));
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
    $$("[data-scroll]").forEach((b) => {
      b.addEventListener("click", () => scrollToSel(b.dataset.scroll));
    });

    $$(".btn-store-m").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".store-card-m");
        const name = card ? card.querySelector(".store-name-m").textContent.trim() : "";
        showToast(name ? `به‌زودی: ${name}` : "به‌زودی در دسترس است");
      });
    });

    $$(".icon-m").forEach((btn) => {
      btn.addEventListener("click", () => {
        showToast(`${btn.getAttribute("aria-label")} به‌زودی فعال می‌شود`);
      });
    });

    $$(".btn-primary-m").forEach((btn) => {
      btn.addEventListener("click", () => {
        showToast(btn.textContent.includes("حساب")
          ? "فرم ثبت‌نام به‌زودی فعال می‌شود"
          : "به‌زودی: فروشگاه کیوان");
      });
    });

    const form = $("#newsForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("input", form);
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
  buildParticles();
  initSlider();
  initParallax();
  initTilt();
  initNav();
  initReveal();
  initCounters();
  initInteractions();
})();
