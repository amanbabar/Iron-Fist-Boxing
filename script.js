(() => {
  function initSlider(slider) {
    const track = slider.querySelector(".slides");
    const slides = track ? Array.from(track.querySelectorAll(".slide")) : [];
    if (!track || slides.length <= 1) return;

    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    const dotsWrap = slider.querySelector(".slider-dots");
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let index = 0;
    let timerId = null;
    let pointerStartX = null;
    let isInView = false;

    const dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `slider-dot${i === 0 ? " active" : ""}`;
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => {
          setIndex(i);
          restartAutoplay();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function syncDots() {
      if (!dots.length) return;
      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle("active", isActive);
        if (isActive) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function setIndex(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      syncDots();
    }

    function stopAutoplay() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (prefersReducedMotion) return;
      if (!isInView) return;
      timerId = window.setInterval(() => setIndex(index + 1), 4500);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        setIndex(index - 1);
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        setIndex(index + 1);
        restartAutoplay();
      });
    }


    slider.tabIndex = 0;
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(index - 1);
        restartAutoplay();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex(index + 1);
        restartAutoplay();
      }
    });

    slider.addEventListener("pointerdown", (e) => {
      pointerStartX = e.clientX;
    });

    slider.addEventListener("pointerup", (e) => {
      if (pointerStartX === null) return;
      const dx = e.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(dx) < 50) return;
      if (dx > 0) setIndex(index - 1);
      else setIndex(index + 1);
      restartAutoplay();
    });

    setIndex(0);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries && entries[0];
          isInView = Boolean(entry && entry.isIntersecting);
          if (isInView) startAutoplay();
          else stopAutoplay();
        },
        { threshold: 0.35 }
      );
      observer.observe(slider);
    } else {
      isInView = true;
      startAutoplay();
    }
  }

  function initReviewsCarousel(carousel) {
    const viewport = carousel.querySelector(".reviews-viewport");
    const track = carousel.querySelector(".reviews-track");
    const cards = track ? Array.from(track.querySelectorAll(".review-card")) : [];
    if (!viewport || !track || cards.length <= 1) return;

    const prevBtn = carousel.querySelector(".reviews-btn.prev");
    const nextBtn = carousel.querySelector(".reviews-btn.next");

    let index = 0;
    let cardStep = 0;
    let maxIndex = 0;
    let pointerStartX = null;

    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

    const recalc = () => {
      const first = cards[0];
      const second = cards[1] || null;
      const fallbackWidth = first ? first.getBoundingClientRect().width : 0;
      const offsetStep =
        first && second ? Math.max(0, second.offsetLeft - first.offsetLeft) : 0;
      cardStep = offsetStep || fallbackWidth;
      const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
      maxIndex = cardStep > 0 ? Math.ceil(maxTranslate / cardStep) : 0;
      index = clamp(index, 0, maxIndex);
      apply();
    };

    const apply = () => {
      const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const x = clamp(index * cardStep, 0, maxTranslate);
      track.style.transform = `translateX(-${x}px)`;
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex;
    };

    const go = (delta) => {
      index = clamp(index + delta, 0, maxIndex);
      apply();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => go(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(1));

    viewport.addEventListener("pointerdown", (e) => {
      pointerStartX = e.clientX;
    });

    viewport.addEventListener("pointerup", (e) => {
      if (pointerStartX === null) return;
      const dx = e.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(dx) < 40) return;
      if (dx > 0) go(-1);
      else go(1);
    });

    window.addEventListener("resize", recalc);
    recalc();
  }

  window.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const navToggle = navbar ? navbar.querySelector(".nav-toggle") : null;
    const navList = document.getElementById("site-nav");

    if (navbar && navToggle && navList) {
      const closeMenu = () => {
        navbar.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      };

      const openMenu = () => {
        navbar.classList.add("nav-open");
        navToggle.setAttribute("aria-expanded", "true");
      };

      navToggle.addEventListener("click", () => {
        const isOpen = navbar.classList.contains("nav-open");
        if (isOpen) closeMenu();
        else openMenu();
      });

      navList.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", (e) => {
        if (!navbar.classList.contains("nav-open")) return;
        if (!(e.target instanceof Node)) return;
        if (navbar.contains(e.target)) return;
        closeMenu();
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeMenu();
      });
    }

    document.querySelectorAll(".slider").forEach(initSlider);
    document.querySelectorAll("[data-reviews-carousel]").forEach(initReviewsCarousel);
    const hero = document.querySelector(".hero");
    const heroImg = hero ? hero.querySelector(".bg-video") : null;
    if (hero && heroImg) {
      const showFallback = () => {
        hero.classList.add("hero-bg-fallback");
        heroImg.style.display = "none";
      };

      const showImage = () => {
        hero.classList.remove("hero-bg-fallback");
        heroImg.style.display = "";
      };

      heroImg.addEventListener("error", showFallback, { once: true });
      heroImg.addEventListener("load", showImage, { once: true });
      if (heroImg.complete && heroImg.naturalWidth === 0) showFallback();
    }
  });
})();
