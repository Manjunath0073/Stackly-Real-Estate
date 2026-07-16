(function () {
  'use strict';

  function initLogin() {
    var form = document.getElementById('login-form');
    if (!form) return;

    var email = document.getElementById('login-email');
    var password = document.getElementById('login-password');
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');
    var submitBtn = document.getElementById('login-submit');
    var message = document.getElementById('login-message');

    /* Password toggle */
    var toggle = document.querySelector('.password-toggle');
    if (toggle && password) {
      toggle.addEventListener('click', function () {
        var isPassword = password.type === 'password';
        password.type = isPassword ? 'text' : 'password';
        toggle.classList.toggle('is-visible', !isPassword);
      });
    }

    function setError(el, err) {
      if (!el) return;
      el.textContent = err;
      el.classList.toggle('is-visible', !!err);
    }

    function setFieldState(input, err) {
      if (!input) return;
      input.classList.toggle('is-error', !!err);
      input.setAttribute('aria-invalid', !!err ? 'true' : 'false');
    }

    function validateEmail() {
      var val = email ? email.value.trim() : '';
      var err = '';
      if (!val) err = 'Please enter a valid email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err = 'Please enter a valid email address.';
      setError(emailError, err);
      setFieldState(email, err);
      return !err;
    }

    function validatePassword() {
      var val = password ? password.value : '';
      var err = '';
      if (!val) err = 'Password is required.';
      else if (val.length < 8) err = 'Password must be at least 8 characters.';
      setError(passwordError, err);
      setFieldState(password, err);
      return !err;
    }

    /* Live validation */
    if (email) {
      email.addEventListener('input', validateEmail);
      email.addEventListener('blur', validateEmail);
    }
    if (password) {
      password.addEventListener('input', validatePassword);
      password.addEventListener('blur', validatePassword);
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('is-loading', loading);
      submitBtn.disabled = loading;
      var text = submitBtn.querySelector('.btn__text');
      if (text) text.textContent = loading ? 'Please wait...' : 'Sign In';
    }

    function getRole() {
      if (!form) return 'buyer';
      var selected = form.querySelector('input[name="role"]:checked');
      return selected ? selected.value : 'buyer';
    }

    /* Submit */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (message) {
        message.textContent = '';
        message.className = 'auth-form__message';
      }

      var emailValid = validateEmail();
      var passValid = validatePassword();

      if (!emailValid || !passValid) return;

      setLoading(true);

      var role = getRole();
      var user = {
        name: email ? email.value.trim().split('@')[0] : 'User',
        email: email ? email.value.trim() : '',
        role: role,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('stacklyCurrentUser', JSON.stringify(user));

      setTimeout(function () {
        window.location.href = role === 'buyer' ? 'buyer-dashboard.html' : 'seller-dashboard.html';
      }, 800);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }
})();
