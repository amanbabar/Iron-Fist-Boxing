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

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".slider").forEach(initSlider);
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
