(function () {
  'use strict';

  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
  }

  function formatNumber(num) { return num.toLocaleString('en-US'); }

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

  /* Counter Animation */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      counters.forEach((c) => { c.textContent = formatNumber(parseInt(c.dataset.counter, 10)); });
      return;
    }

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 2000;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = formatNumber(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNumber(target);
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

  /* Scroll Reveal — supports data-delay staggered animation */
  function initReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || '0';
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => observer.observe(el));
  }

  /* Journey card reveals */
  function initJourneyReveals() {
    const cards = document.querySelectorAll('.journey-card');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const isLeft = el.classList.contains('journey-card--left');
          el.style.opacity = '0';
          el.style.transform = isLeft ? 'translateX(-40px)' : 'translateX(40px)';
          el.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease';
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
          });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach((el) => observer.observe(el));
  }

  /* Achievement stat reveals */
  function initAchievementStats() {
    const stats = document.querySelectorAll('.achievement-stat');
    if (!stats.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition = `transform 0.5s ease ${delay}ms, opacity 0.5s ease ${delay}ms`;
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });
    stats.forEach((el) => observer.observe(el));
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
    initCounters();
    initReveals();
    initJourneyReveals();
    initAchievementStats();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();