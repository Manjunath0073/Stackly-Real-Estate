/* =====================================================
   Stackly Estates - Login Page JavaScript
   Login form validation and password visibility toggle.
   ===================================================== */

(function () {
  'use strict';

  function initPasswordToggle() {
    const toggle = document.getElementById('password-toggle');
    const input = document.getElementById('login-password');
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      toggle.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    });
  }

  function initLoginForm() {
    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    if (!form || !message) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      message.className = 'form-message';
      message.textContent = '';

      const email = form.querySelector('#login-email')?.value.trim();
      const password = form.querySelector('#login-password')?.value;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (!password || password.length < 6) {
        showMessage('Password must be at least 6 characters.', 'error');
        return;
      }

      showMessage('Login successful. Redirecting...', 'success');
      form.reset();
    });

    function showMessage(text, type) {
      message.textContent = text;
      message.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function init() {
    initPasswordToggle();
    initLoginForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
