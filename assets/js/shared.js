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
    const closeBtn = document.getElementById('mobile-close');
    if (!toggle || !nav) return;

    const openMenu = () => {
      toggle.classList.add('is-active');
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
      toggle.classList.remove('is-active');
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    nav.querySelectorAll('.mobile-nav-items a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
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

    // Safety fallback: ensure no element stays permanently hidden
    // (e.g., if IntersectionObserver fails to fire for any reason)
    setTimeout(() => {
      elements.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.style.transitionDelay = '0ms';
          el.classList.add('is-visible');
        }
      });
    }, 2000);
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

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const showMessage = (text, type) => {
      message.textContent = text;
      message.className = 'newsletter-form__message';
      if (type) {
        message.classList.add(type);
      }
      requestAnimationFrame(() => {
        message.classList.add('is-visible');
      });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('#newsletter-email');
      const btn = form.querySelector('.newsletter-form__btn');
      const email = input.value.trim().toLowerCase();

      input.classList.remove('is-error');

      if (!email) {
        input.classList.add('is-error');
        showMessage('Please enter your email address.', 'is-error');
        input.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        input.classList.add('is-error');
        showMessage('Please enter a valid email address.', 'is-error');
        input.focus();
        return;
      }

      btn.classList.add('is-loading');

      setTimeout(() => {
        btn.classList.remove('is-loading');
        showMessage('✓ Thank you! You\'ve successfully subscribed.', 'is-success');
        input.value = '';

        setTimeout(() => {
          message.classList.remove('is-visible');
        }, 3000);
      }, 800);
    });

    form.querySelector('#newsletter-email').addEventListener('input', function () {
      this.classList.remove('is-error');
      message.classList.remove('is-visible');
    });
  }

  /* ------------------ Footer Active Navigation ------------------ */
  function initFooterActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const footerLinks = document.querySelectorAll('.footer-nav a');

    footerLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;

      const linkPath = href.split('/').pop() || 'index.html';
      const isActive =
        linkPath === currentPath ||
        (currentPath === '' && linkPath === 'index.html');

      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    initLucideIcons();
    initStickyHeader();
    initMobileMenu();
    initBackToTop();
    initActiveNavigation();
    initFooterActiveNav();
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
