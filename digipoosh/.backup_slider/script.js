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
const heroLayout = $("#heroLayout");
const heroSpotlight = $("#heroSpotlight");
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
  const count = window.innerWidth > 1100 ? 22 : 16;

  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement("span");
    const size = Math.random() * 5 + 3;
    dot.className = "hero__dust-particle";
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
   HERO PARALLAX & SPOTLIGHT (Mouse-reactive)
---------------------------------------------------------- */
function initHeroInteractions() {
  if (!heroLayout || prefersReduced || !finePointer) return;

  const parallaxItems = $$('[data-parallax]', heroLayout);

  heroLayout.addEventListener("mousemove", (e) => {
    const rect = heroLayout.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (heroSpotlight) {
      const sx = ((e.clientX - rect.left) / rect.width) * 100;
      const sy = ((e.clientY - rect.top) / rect.height) * 100;
      heroSpotlight.style.background = `radial-gradient(420px circle at ${sx}% ${sy}%, rgba(212, 184, 90, 0.26), transparent 62%)`;
    }

    parallaxItems.forEach((item) => {
      const depth = parseFloat(item.dataset.parallax || "0.08");
      const tx = px * depth * -30;
      const ty = py * depth * -30;
      item.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    dustParticles.forEach((particle, index) => {
      const depth = (index % 5) + 1;
      particle.style.transform = `translate(${px * depth * 8}px, ${py * depth * 8}px)`;
    });
  });

  heroLayout.addEventListener("mouseleave", () => {
    parallaxItems.forEach((item) => {
      item.style.transform = "translate3d(0, 0, 0)";
    });
    dustParticles.forEach((particle) => {
      particle.style.transform = "";
    });
  });
}

/* ----------------------------------------------------------
   CUSTOM AMBER CURSOR
---------------------------------------------------------- */
function initCursor() {
  if (!finePointer || prefersReduced) return;

  body.classList.add("cursor-ready");

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  body.appendChild(cursor);

  const cursorDot = document.createElement("div");
  cursorDot.className = "custom-cursor-dot";
  body.appendChild(cursorDot);

  document.addEventListener("mousemove", (e) => {
    requestAnimationFrame(() => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      cursorDot.style.left = e.clientX + "px";
      cursorDot.style.top = e.clientY + "px";
    });
  });

  $$("a, button, .sage-border, .why-card, .seller-card, .benefit-column, .how-card, .trust-badge, .review-card").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
      cursorDot.classList.add("cursor-dot-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
      cursorDot.classList.remove("cursor-dot-hover");
    });
  });
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
function showToast(message) {
  if (!toast || !toastText) return;
  toastText.textContent = message;
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
initHeroInteractions();
initReveal();
initCounters();
initCursor();
restorePersistentState();
updateScrollUI();
