(function () {
  'use strict';

  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* Page Loader */
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    if (document.readyState === 'complete') {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 700);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.classList.add('is-hidden');
          setTimeout(() => loader.remove(), 700);
        }, 200);
      });
    }
  }

  /* Scroll Progress */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', throttle(() => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, 16), { passive: true });
  }

  /* Section reveals — each section uses staggered delays via data-delay */
  function initReveals() {
    const animated = document.querySelectorAll('.overview-card, .journey-step, .intel-stat, .intel-feature, .global-city, .award-item');
    if (!animated.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('is-visible'), delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animated.forEach((el) => observer.observe(el));
  }

  /* Counter animation */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 2000;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(ease * target).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-US');
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => observer.observe(c));
  }

  /* Testimonials carousel */
  function initReviewsCarousel() {
    const track = document.getElementById('reviews-track');
    const slides = track ? Array.from(track.children) : [];
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const dotsContainer = document.getElementById('reviews-dots');
    if (!slides.length) return;

    let current = 0;
    let interval = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'reviews-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    const update = () => {
      track.style.transform = `translateX(-${current * 100}%)`;
      slides.forEach((s, i) => {
        s.style.opacity = i === current ? '1' : '0.3';
        s.style.transform = i === current ? 'scale(1)' : 'scale(0.97)';
        s.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
      });
    };

    const goTo = (i) => {
      current = i;
      if (current < 0) current = slides.length - 1;
      if (current >= slides.length) current = 0;
      update();
      resetAutoplay();
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const startAutoplay = () => {
      if (interval) return;
      if (!prefersReducedMotion()) interval = setInterval(next, 5000);
    };
    const stopAutoplay = () => { if (interval) { clearInterval(interval); interval = null; } };
    const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    const carousel = document.querySelector('.reviews-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
    }

    update();
    startAutoplay();
  }

  /* Back to top */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', throttle(() => {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, 100), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function init() {
    initPageLoader();
    initScrollProgress();
    initReveals();
    initCounters();
    initReviewsCarousel();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();