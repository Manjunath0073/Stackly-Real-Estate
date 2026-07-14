/* =====================================================
   Stackly Estates - Homepage JavaScript
   Hero parallax, counter animation, testimonial slider,
   and property search validation.
   ===================================================== */

(function () {
  'use strict';

  /* -------------------- Utilities -------------------- */
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  /* ------------------ Hero Parallax ------------------ */
  function initHeroParallax() {
    const heroMedia = document.querySelector('.hero__media img');
    if (!heroMedia || prefersReducedMotion()) return;

    const onScroll = throttle(() => {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.35;
      heroMedia.style.transform = `translate3d(0, ${rate}px, 0) scale(1.05)`;
    }, 20);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------ Counter Animation ------------------ */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 2000;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);

        el.textContent = formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ----------------- Testimonial Slider ----------------- */
  function initTestimonialSlider() {
    const slider = document.getElementById('testimonial-slider');
    if (!slider) return;

    const track = slider.querySelector('#testimonial-track');
    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector('#testimonial-prev');
    const nextBtn = slider.querySelector('#testimonial-next');
    const dotsContainer = slider.querySelector('#testimonial-dots');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoplayInterval = null;
    const autoplayDelay = 6000;

    // Build dots
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-dot');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const updateSlides = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index !== currentIndex ? 'true' : 'false');
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
        dot.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
      });
    };

    const goToSlide = (index) => {
      currentIndex = index;
      if (currentIndex < 0) currentIndex = slides.length - 1;
      if (currentIndex >= slides.length) currentIndex = 0;
      updateSlides();
      resetAutoplay();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAutoplay = () => {
      if (autoplayInterval) return;
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      if (!prefersReducedMotion()) {
        startAutoplay();
      }
    };

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('keydown', (e) => {
      if (!slider.matches(':focus-within') && !slider.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoplay();
    }, { passive: true });

    const handleSwipe = () => {
      const threshold = 50;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > threshold) {
        diff > 0 ? nextSlide() : prevSlide();
      }
    };

    updateSlides();
    if (!prefersReducedMotion()) {
      startAutoplay();
    }
  }

  /* ----------------- Search Validation ----------------- */
  function initSearchValidation() {
    const form = document.getElementById('property-search-form');
    const error = document.getElementById('search-error');
    if (!form || !error) return;

    form.addEventListener('submit', (e) => {
      const location = form.querySelector('#search-location').value.trim();
      const type = form.querySelector('#search-type').value;
      const budget = form.querySelector('#search-budget').value;

      if (!location && !type && !budget) {
        e.preventDefault();
        error.textContent = 'Please enter a location, property type, or budget to search.';
        return;
      }

      error.textContent = '';
    });
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    initHeroParallax();
    initCounters();
    initTestimonialSlider();
    initSearchValidation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
