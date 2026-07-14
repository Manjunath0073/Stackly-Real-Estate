(function () {
  'use strict';

  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
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

  /* Scroll Reveal */
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

  /* Contact Form */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const message = document.getElementById('contact-form-message');
    if (!form || !message) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      message.className = 'form-message';
      message.textContent = '';

      const name = form.querySelector('#contact-name')?.value.trim();
      const email = form.querySelector('#contact-email')?.value.trim();
      const subject = form.querySelector('#contact-subject')?.value;
      const messageText = form.querySelector('#contact-message')?.value.trim();

      if (!name) { showMessage('Please enter your full name.', 'error'); return; }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) { showMessage('Please enter a valid email address.', 'error'); return; }
      if (!subject) { showMessage('Please select a subject.', 'error'); return; }
      if (!messageText) { showMessage('Please enter your message.', 'error'); return; }

      showMessage('Thank you for reaching out. We will get back to you within 24 hours.', 'success');
      form.reset();
    });

    function showMessage(text, type) {
      message.textContent = text;
      message.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  /* Back to Top */
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
    initContactForm();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();