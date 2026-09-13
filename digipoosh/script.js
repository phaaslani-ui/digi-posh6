/* ============================================================
   دیجی‌پوش — HOMEPAGE
   Vanilla JavaScript — No frameworks, no libraries
   ============================================================ */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const body = document.body;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer:fine)").matches;

const scrollProgress = $("#scrollProgress");
const siteHeader = $("#siteHeader");
const navBurger = $("#navBurger");
const mobileDrawer = $("#mobileDrawer");
const mobileBackdrop = $("#mobileBackdrop");
const mobileClose = $(".mobile-drawer__close");
const heroDust = $("#heroDust");
const cartBadge = $("#cartBadge");
const ctaForm = $("#ctaForm");
const ctaEmail = $("#ctaEmail");
const footerNewsletter = $("#footerNewsletter");
const toast = $("#toast");
const toastText = $("#toastText");

let toastTimer;
let scrollTick = false;
let cartCount = 2;
const dustParticles = [];

const storage = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Fallback in private mode */
    }
  },
};

const toFa = (value) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

/* ----------------------------------------------------------
   SCROLL PROGRESS & STICKY HEADER
---------------------------------------------------------- */
function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  siteHeader?.classList.toggle("is-scrolled", y > 20);
  scrollTick = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTick) {
    requestAnimationFrame(updateScrollUI);
    scrollTick = true;
  }
}, { passive: true });

/* ----------------------------------------------------------
   HERO DUST PARTICLES
---------------------------------------------------------- */
function buildHeroDust() {
  if (!heroDust) return;
  const count = window.innerWidth > 1100 ? 12 : 8;

  for (let index = 0; index < count; index += 1) {
    const dot = document.createElement("span");
    const size = Math.random() * 5 + 3;
    const metal = index % 2 === 0 ? "201, 168, 76" : "192, 192, 192";
    dot.className = "hero__dust-particle";
    dot.style.background = `radial-gradient(circle, rgba(${metal}, 0.9), rgba(${metal}, 0.15))`;
    dot.style.boxShadow = `0 0 16px rgba(${metal}, 0.35)`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.setProperty("--dur", `${6 + Math.random() * 4}s`);
    dot.style.animationDelay = `${Math.random() * 3}s`;
    dustParticles.push(dot);
    heroDust.appendChild(dot);
  }
}

/* ----------------------------------------------------------
   HERO SLIDER — 4 slides, 3s autoplay, smooth fade
---------------------------------------------------------- */
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

    let touchX = null;
    heroSlider.addEventListener("touchstart", (e) => {
      touchX = e.changedTouches[0].clientX;
      stopSlider();
    }, { passive: true });

    heroSlider.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const d = e.changedTouches[0].clientX - touchX;
      if (Math.abs(d) > 45) {
        goToSlide((currentSlide + (d < 0 ? 1 : -1) + slides.length) % slides.length);
      }
      touchX = null;
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

  // gentle parallax on the metallic dust
  if (!prefersReduced && finePointer && heroSlider) {
    heroSlider.addEventListener("mousemove", (ev) => {
      const rect = heroSlider.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width - 0.5;
      const py = (ev.clientY - rect.top) / rect.height - 0.5;
      dustParticles.forEach((particle, index) => {
        const depth = (index % 5) + 1;
        particle.style.transform = `translate(${px * depth * 8}px, ${py * depth * 8}px)`;
      });
    });

    heroSlider.addEventListener("mouseleave", () => {
      dustParticles.forEach((p) => { p.style.transform = ""; });
    });
  }
}

/* ----------------------------------------------------------
   COUNTERS
---------------------------------------------------------- */
function animateCounter(element) {
  const target = Number(element.dataset.counter || 0);
  const start = performance.now();
  const duration = 1400;

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    element.textContent = toFa(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = $$('[data-counter]');
  if (!counters.length) return;

  if (!("IntersectionObserver" in window) || prefersReduced) {
    counters.forEach((c) => (c.textContent = toFa(Number(c.dataset.counter || 0))));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}

/* ----------------------------------------------------------
   MOBILE DRAWER
---------------------------------------------------------- */
function openDrawer() {
  mobileDrawer?.classList.add("is-open");
  mobileBackdrop?.classList.add("is-open");
  navBurger?.classList.add("is-open");
  navBurger?.setAttribute("aria-expanded", "true");
  body.style.overflow = "hidden";
}

function closeDrawer() {
  mobileDrawer?.classList.remove("is-open");
  mobileBackdrop?.classList.remove("is-open");
  navBurger?.classList.remove("is-open");
  navBurger?.setAttribute("aria-expanded", "false");
  body.style.overflow = "";
}

navBurger?.addEventListener("click", () => {
  if (mobileDrawer?.classList.contains("is-open")) closeDrawer();
  else openDrawer();
});

mobileClose?.addEventListener("click", closeDrawer);
mobileBackdrop?.addEventListener("click", closeDrawer);
$$(".mobile-drawer__nav a").forEach((link) =>
  link.addEventListener("click", closeDrawer)
);

/* ----------------------------------------------------------
   REVEAL ON SCROLL
---------------------------------------------------------- */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window) || prefersReduced) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------------
   TOAST
---------------------------------------------------------- */
function showToast(messilver) {
  if (!toast || !toastText) return;
  toastText.textContent = messilver;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

/* ----------------------------------------------------------
   CART BADGE
---------------------------------------------------------- */
cartCount = storage.read("digipoosh-cart-count", 2);
if (cartBadge) cartBadge.textContent = toFa(cartCount);

/* ----------------------------------------------------------
   FORMS
---------------------------------------------------------- */
ctaForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = ctaEmail?.value.trim();
  if (!email) return;
  storage.write("digipoosh-registration", { email, createdAt: Date.now() });
  showToast("حساب شما با موفقیت ساخته شد");
  if (ctaEmail) ctaEmail.value = "";
});

footerNewsletter?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#footerNewsletter input");
  if (input?.value.trim()) {
    const members = storage.read("digipoosh-newsletter", []);
    const email = input.value.trim();
    storage.write("digipoosh-newsletter", [...new Set([...members, email])]);
    showToast("عضویت شما در خبرنامه ثبت شد");
    input.value = "";
  }
});

/* ----------------------------------------------------------
   SMOOTH ANCHOR SCROLL
---------------------------------------------------------- */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    closeDrawer();
    const top = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ----------------------------------------------------------
   ESCAPE KEY
---------------------------------------------------------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

/* ----------------------------------------------------------
   RESTORE PERSISTENT STATE
---------------------------------------------------------- */
function restorePersistentState() {
  const registration = storage.read("digipoosh-registration", null);
  if (registration?.email && ctaEmail) {
    ctaEmail.value = registration.email;
  }
}

/* ----------------------------------------------------------
   INIT
---------------------------------------------------------- */
buildHeroDust();
initSlider();
initReveal();
initCounters();
restorePersistentState();
updateScrollUI();
