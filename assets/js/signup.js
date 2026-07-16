(function () {
  'use strict';

  function initSignup() {
    var form = document.getElementById('signup-form');
    if (!form) return;

    var name = document.getElementById('signup-name');
    var email = document.getElementById('signup-email');
    var phone = document.getElementById('signup-phone');
    var password = document.getElementById('signup-password');
    var confirm = document.getElementById('signup-confirm');
    var terms = document.getElementById('signup-terms');
    var submitBtn = document.getElementById('signup-submit');
    var message = document.getElementById('signup-message');

    var nameError = document.getElementById('name-error');
    var emailError = document.getElementById('email-error');
    var phoneError = document.getElementById('phone-error');
    var passwordError = document.getElementById('password-error');
    var confirmError = document.getElementById('confirm-error');
    var termsError = document.getElementById('terms-error');

    var strengthFill = document.getElementById('strength-fill');
    var ruleEls = document.querySelectorAll('#strength-rules span');

    /* Password toggle */
    var toggle = document.querySelector('.password-toggle');
    if (toggle && password) {
      toggle.addEventListener('click', function () {
        var isPassword = password.type === 'password';
        password.type = isPassword ? 'text' : 'password';
        toggle.classList.toggle('is-visible', !isPassword);
      });
    }

    /* Phone: block non-digits */
    if (phone) {
      phone.addEventListener('keydown', function (e) {
        var allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowed.indexOf(e.key) !== -1) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) e.preventDefault();
      });
      phone.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    /* Validation helpers */
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

    function validateName() {
      var val = name ? name.value.trim() : '';
      var err = '';
      if (!val) err = 'Only letters and spaces are allowed.';
      else if (!/^[A-Za-z ]+$/.test(val)) err = 'Only letters and spaces are allowed.';
      else if (val.length < 3) err = 'Name must be at least 3 characters.';
      else if (val.length > 50) err = 'Name cannot exceed 50 characters.';
      setError(nameError, err);
      setFieldState(name, err);
      return !err;
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

    function validatePhone() {
      var val = phone ? phone.value.trim() : '';
      var err = '';
      if (val && !/^\d{10}$/.test(val)) err = 'Please enter a valid 10-digit phone number.';
      setError(phoneError, err);
      setFieldState(phone, err);
      return !err;
    }

    function getPasswordRules(val) {
      return {
        length: val.length >= 8 && val.length <= 32,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        number: /\d/.test(val),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val)
      };
    }

    function validatePasswordStrength() {
      var val = password ? password.value : '';
      if (!val) {
        if (strengthFill) strengthFill.style.width = '0%';
        return;
      }
      var rules = getPasswordRules(val);
      var metCount = 0;
      for (var k in rules) { if (rules[k]) metCount++; }
      var pct = (metCount / 5) * 100;

      if (strengthFill) {
        strengthFill.style.width = pct + '%';
        if (pct <= 40) strengthFill.style.background = '#ef4444';
        else if (pct <= 80) strengthFill.style.background = '#f59e0b';
        else strengthFill.style.background = '#10B981';
      }

      if (ruleEls.length) {
        ruleEls.forEach(function (el) {
          var rule = el.getAttribute('data-rule');
          el.classList.toggle('is-met', !!rules[rule]);
        });
      }
    }

    function validatePassword() {
      var val = password ? password.value : '';
      var rules = getPasswordRules(val);
      var allMet = rules && rules.length && rules.upper && rules.lower && rules.number && rules.special;
      var err = '';
      if (!val) err = 'Password is required.';
      else if (!allMet) err = 'Password must include uppercase, lowercase, number, and special character.';
      setError(passwordError, err);
      setFieldState(password, err);
      return !err;
    }

    function validateConfirm() {
      var pVal = password ? password.value : '';
      var cVal = confirm ? confirm.value : '';
      var err = '';
      if (cVal && cVal !== pVal) err = 'Passwords do not match.';
      setError(confirmError, err);
      setFieldState(confirm, err);
      return !err;
    }

    function validateTerms() {
      var checked = terms ? terms.checked : false;
      var err = checked ? '' : 'You must accept the Terms & Conditions.';
      setError(termsError, err);
      if (terms) terms.setAttribute('aria-invalid', checked ? 'false' : 'true');
      return checked;
    }

    function checkAllValid() {
      var n = validateName();
      var e = validateEmail();
      var p = validatePhone();
      var pw = validatePassword();
      var c = validateConfirm();
      var t = validateTerms();
      return n && e && p && pw && c && t;
    }

    function updateSubmitState() {
      if (!submitBtn) return;
      /* Only enable button when all fields have valid content */
      var nameVal = name ? name.value.trim() : '';
      var emailVal = email ? email.value.trim() : '';
      var passVal = password ? password.value : '';
      var confirmVal = confirm ? confirm.value : '';
      var checked = terms ? terms.checked : false;

      var hasRequired = nameVal.length >= 3 && emailVal && passVal.length >= 8 && confirmVal && checked;
      submitBtn.disabled = !hasRequired;
    }

    /* Live validation */
    if (name) {
      name.addEventListener('input', function () { validateName(); updateSubmitState(); });
      name.addEventListener('blur', validateName);
    }
    if (email) {
      email.addEventListener('input', function () { validateEmail(); updateSubmitState(); });
      email.addEventListener('blur', validateEmail);
    }
    if (phone) {
      phone.addEventListener('input', function () { validatePhone(); updateSubmitState(); });
      phone.addEventListener('blur', validatePhone);
    }
    if (password) {
      password.addEventListener('input', function () {
        validatePasswordStrength();
        validatePassword();
        validateConfirm();
        updateSubmitState();
      });
      password.addEventListener('blur', function () {
        validatePasswordStrength();
        validatePassword();
        validateConfirm();
      });
    }
    if (confirm) {
      confirm.addEventListener('input', function () { validateConfirm(); updateSubmitState(); });
      confirm.addEventListener('blur', validateConfirm);
    }
    if (terms) {
      terms.addEventListener('change', function () { validateTerms(); updateSubmitState(); });
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('is-loading', loading);
      submitBtn.disabled = loading;
      var text = submitBtn.querySelector('.btn__text');
      if (text) text.textContent = loading ? 'Please wait...' : 'Create Account';
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

      var valid = checkAllValid();
      if (!valid) {
        updateSubmitState();
        return;
      }

      setLoading(true);

      var role = getRole();
      var user = {
        name: name ? name.value.trim() : '',
        email: email ? email.value.trim() : '',
        phone: phone ? phone.value.trim() : '',
        role: role,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('stacklyCurrentUser', JSON.stringify(user));

      setTimeout(function () {
        window.location.href = role === 'buyer' ? 'buyer-dashboard.html' : 'seller-dashboard.html';
      }, 800);
    });

    /* Initial button state */
    updateSubmitState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignup);
  } else {
    initSignup();
  }
})();
