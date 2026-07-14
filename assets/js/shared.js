/* =====================================================
   Stackly Estates - Shared JavaScript
   Sticky header, mobile menu, scroll reveal, back-to-top,
   active navigation, smooth scroll, favorites, newsletter.
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

  function initLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /* ------------------ Sticky Header ------------------ */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }
    }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------ Mobile Menu ------------------ */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    const openMenu = () => {
      toggle.classList.add('is-active');
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      toggle.classList.remove('is-active');
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('is-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* -------------------- Back to Top -------------------- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const onScroll = throttle(() => {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, 100);

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------ Active Navigation ------------------ */
  function initActiveNavigation() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-list .nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('/').pop() || 'index.html';
      const isActive =
        linkPath === currentPath ||
        (currentPath === '' && linkPath === 'index.html');

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ------------------ Smooth Scroll ------------------ */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.getElementById('site-header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ------------------ Scroll Reveal ------------------ */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (prefersReducedMotion()) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay;
            if (delay) {
              entry.target.style.transitionDelay = `${delay}ms`;
            }
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ------------------ Favorite Buttons ------------------ */
  function initFavoriteButtons() {
    const buttons = document.querySelectorAll('[data-favorite]');

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isActive = btn.classList.toggle('is-active');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

        const icon = btn.querySelector('svg, i');
        if (icon) {
          icon.style.transform = 'scale(1.3)';
          setTimeout(() => {
            icon.style.transform = '';
          }, 200);
        }
      });
    });
  }

  /* ------------------ Newsletter Form ------------------ */
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const message = document.getElementById('newsletter-message');
    if (!form || !message) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('#newsletter-email');
      const email = input.value.trim();

      if (!email) {
        message.textContent = 'Please enter your email address.';
        message.style.color = '#ffcece';
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        message.textContent = 'Please enter a valid email address.';
        message.style.color = '#ffcece';
        return;
      }

      message.textContent = 'Thank you for subscribing!';
      message.style.color = 'var(--success)';
      form.reset();
    });
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    initLucideIcons();
    initStickyHeader();
    initMobileMenu();
    initBackToTop();
    initActiveNavigation();
    initSmoothScroll();
    initScrollReveal();
    initFavoriteButtons();
    initNewsletterForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
