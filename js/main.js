/**
 * يارا للحفلات — Main JavaScript
 * Navigation · Scroll effects · Lightbox · Contact form · UX helpers
 */
(function () {
  "use strict";

  const PHONE_WA = "966578909864";
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const backToTop = document.getElementById("backToTop");
  const yearEl = document.getElementById("year");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  /* ---------- Year ---------- */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Header scroll state ---------- */
  function updateHeader() {
    if (!header) return;
    const scrolled = window.scrollY > 40;
    header.classList.toggle("scrolled", scrolled);
    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  function closeNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "فتح القائمة");
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "إغلاق القائمة");
    document.body.style.overflow = "hidden";
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      if (mainNav.classList.contains("open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");

  function updateActiveNav() {
    const offset = window.scrollY + 120;
    let current = "";

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Lightbox gallery ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  let currentIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !galleryItems.length) return;
    currentIndex = index;
    const item = galleryItems[currentIndex];
    const src = item.getAttribute("data-full") || "";
    const alt = item.getAttribute("data-alt") || "";
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("open");
    });
    document.body.style.overflow = "hidden";
    lightboxClose && lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () {
      if (!lightbox.classList.contains("open")) {
        lightbox.hidden = true;
        if (lightboxImg) lightboxImg.src = "";
      }
    }, 300);
  }

  function showLightbox(delta) {
    if (!galleryItems.length) return;
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    if (lightboxImg) {
      lightboxImg.src = item.getAttribute("data-full") || "";
      lightboxImg.alt = item.getAttribute("data-alt") || "";
    }
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", function () { showLightbox(-1); });
  if (lightboxNext) lightboxNext.addEventListener("click", function () { showLightbox(1); });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showLightbox(-1); /* RTL: right = previous */
    if (e.key === "ArrowLeft") showLightbox(1);
  });

  /* ---------- Contact form → WhatsApp ---------- */
  function normalizePhone(value) {
    return value.replace(/[\s\-()]/g, "");
  }

  function isValidSaudiPhone(value) {
    const cleaned = normalizePhone(value);
    return /^(05\d{8}|5\d{8}|\+?9665\d{8})$/.test(cleaned);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = (document.getElementById("name") || {}).value.trim();
      const phone = (document.getElementById("phone") || {}).value.trim();
      const message = (document.getElementById("message") || {}).value.trim();

      if (!name || !phone || !message) {
        if (formStatus) {
          formStatus.textContent = "يرجى تعبئة جميع الحقول.";
          formStatus.className = "form-status error";
        }
        return;
      }

      if (!isValidSaudiPhone(phone)) {
        if (formStatus) {
          formStatus.textContent = "يرجى إدخال رقم جوال سعودي صحيح.";
          formStatus.className = "form-status error";
        }
        return;
      }

      const text =
        "مرحباً، أنا " + name +
        "\nرقم الجوال: " + phone +
        "\n\nالرسالة:\n" + message;

      const url = "https://wa.me/" + PHONE_WA + "?text=" + encodeURIComponent(text);

      if (formStatus) {
        formStatus.textContent = "جاري فتح واتساب...";
        formStatus.className = "form-status success";
      }

      window.open(url, "_blank", "noopener,noreferrer");
      contactForm.reset();
    });
  }

  /* ---------- Smooth anchor offset for older browsers ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });
})();
