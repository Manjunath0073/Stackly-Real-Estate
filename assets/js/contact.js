/* =====================================================
   Stackly Estates - Contact Page JavaScript
   Contact form validation and feedback.
   ===================================================== */

(function () {
  'use strict';

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

      if (!name) {
        showMessage('Please enter your full name.', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (!subject) {
        showMessage('Please select a subject.', 'error');
        return;
      }

      if (!messageText) {
        showMessage('Please enter your message.', 'error');
        return;
      }

      showMessage('Thank you for reaching out. We will get back to you within 24 hours.', 'success');
      form.reset();
    });

    function showMessage(text, type) {
      message.textContent = text;
      message.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function init() {
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
