/* =====================================================
   Stackly Estates - Signup Page JavaScript
   Signup form validation and password visibility toggle.
   ===================================================== */

(function () {
  'use strict';

  function initPasswordToggle() {
    const toggle = document.getElementById('password-toggle');
    const input = document.getElementById('signup-password');
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

  function initSignupForm() {
    const form = document.getElementById('signup-form');
    const message = document.getElementById('signup-message');
    if (!form || !message) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      message.className = 'form-message';
      message.textContent = '';

      const name = form.querySelector('#signup-name')?.value.trim();
      const email = form.querySelector('#signup-email')?.value.trim();
      const password = form.querySelector('#signup-password')?.value;
      const confirm = form.querySelector('#signup-confirm')?.value;
      const terms = form.querySelector('#signup-terms')?.checked;

      if (!name) {
        showMessage('Please enter your full name.', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (!password || password.length < 8) {
        showMessage('Password must be at least 8 characters long.', 'error');
        return;
      }

      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
      if (!passwordPattern.test(password)) {
        showMessage('Password must include both letters and numbers.', 'error');
        return;
      }

      if (password !== confirm) {
        showMessage('Passwords do not match.', 'error');
        return;
      }

      if (!terms) {
        showMessage('You must agree to the Terms of Service and Privacy Policy.', 'error');
        return;
      }

      showMessage('Account created successfully. Redirecting...', 'success');
      form.reset();
    });

    function showMessage(text, type) {
      message.textContent = text;
      message.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function init() {
    initPasswordToggle();
    initSignupForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
