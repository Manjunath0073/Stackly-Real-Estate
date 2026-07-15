(function () {
  'use strict';

  // =============================================
  // 1. PARTICLES
  // =============================================
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var particles = [];
    var count = Math.min(60, Math.floor(w * h / 18000));

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.15
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 169, 107, ' + p.opacity + ')';
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', function () {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
  }

  // =============================================
  // 2. RIPPLE EFFECT
  // =============================================
  function initRipple(btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var r = document.createElement('span');
      r.className = 'ripple';
      var size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(r);
      setTimeout(function () { r.remove(); }, 600);
    });
  }

  // =============================================
  // 3. PASSWORD TOGGLE
  // =============================================
  function initPasswordToggle(toggleId, inputId) {
    var toggle = document.getElementById(toggleId);
    var input = document.getElementById(inputId);
    if (!toggle || !input) return;

    toggle.addEventListener('click', function () {
      var isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      toggle.classList.toggle('is-visible', !isVisible);
      toggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    });
  }

  // =============================================
  // 4. VALIDATION HELPERS
  // =============================================
  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('is-visible');
  }

  function hideError(el) {
    el.textContent = '';
    el.classList.remove('is-visible');
  }

  function setFieldState(input, state) {
    input.classList.remove('is-error', 'is-success');
    if (state) input.classList.add(state);
  }

  function shakeCard() {
    var card = document.querySelector('.auth-card');
    if (!card) return;
    card.classList.remove('is-shaking');
    void card.offsetWidth;
    card.classList.add('is-shaking');
    setTimeout(function () { card.classList.remove('is-shaking'); }, 500);
  }

  // =============================================
  // 5. NAME VALIDATION
  // =============================================
  function validateName(name) {
    if (!name) return 'Full name is required';
    if (name.length < 3) return 'Minimum 3 characters';
    if (name.length > 50) return 'Maximum 50 characters';
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Letters and spaces only';
    return '';
  }

  function sanitizeName(raw) {
    return raw.replace(/\s+/g, ' ').trim();
  }

  // =============================================
  // 6. EMAIL VALIDATION (RFC compliant)
  // =============================================
  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(email);
  }

  // =============================================
  // 7. PHONE VALIDATION (Indian mobile)
  // =============================================
  function validatePhone(phone) {
    var cleaned = phone.replace(/\s/g, '');
    if (!cleaned) return 'Phone number is required';
    if (!/^[6-9]/.test(cleaned)) return 'Must start with 6-9';
    if (!/^\d{10}$/.test(cleaned)) return 'Enter a valid 10-digit number';
    return '';
  }

  function cleanPhone(raw) {
    return raw.replace(/[^\d]/g, '');
  }

  // =============================================
  // 8. PASSWORD STRENGTH & VALIDATION
  // =============================================
  var pwChecks = {
    length: function (v) { return v.length >= 8 && v.length <= 32; },
    upper: function (v) { return /[A-Z]/.test(v); },
    lower: function (v) { return /[a-z]/.test(v); },
    number: function (v) { return /\d/.test(v); },
    special: function (v) { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v); }
  };

  function getPasswordStrength(pw) {
    var score = 0;
    if (pwChecks.length(pw)) score++;
    if (pwChecks.upper(pw)) score++;
    if (pwChecks.lower(pw)) score++;
    if (pwChecks.number(pw)) score++;
    if (pwChecks.special(pw)) score++;
    return score;
  }

  function updatePasswordMeter(pw) {
    var fill = document.getElementById('strength-fill');
    var label = document.getElementById('strength-label');
    if (!fill || !label) return;

    var score = getPasswordStrength(pw);
    var levels = ['', 'Weak', 'Medium', 'Strong'];
    var classes = ['', 'weak', 'medium', 'strong'];
    var level = pw.length === 0 ? 0 : (score < 3 ? 1 : score < 5 ? 2 : 3);

    fill.className = 'strength-fill' + (levels[level] ? ' ' + classes[level] : '');
    label.textContent = levels[level] || '';
    label.className = 'strength-label' + (levels[level] ? ' ' + classes[level] : '');
  }

  function updateChecklist(pw) {
    var items = document.querySelectorAll('.check-item');
    items.forEach(function (item) {
      var check = item.getAttribute('data-check');
      if (!check) return;
      var valid = pwChecks[check](pw);
      item.classList.remove('is-valid', 'is-invalid');
      if (!pw) return;
      item.classList.add(valid ? 'is-valid' : 'is-invalid');
    });
  }

  function validatePassword(pw) {
    if (!pw) return 'Password is required';
    if (pw.length < 8) return 'Minimum 8 characters';
    if (pw.length > 32) return 'Maximum 32 characters';
    if (!pwChecks.upper(pw)) return 'Need uppercase letter';
    if (!pwChecks.lower(pw)) return 'Need lowercase letter';
    if (!pwChecks.number(pw)) return 'Need at least one number';
    if (!pwChecks.special(pw)) return 'Need a special character';
    return '';
  }

  // =============================================
  // 9. SIGNUP FORM
  // =============================================
  function initSignupForm() {
    var form = document.getElementById('signup-form');
    if (!form) return;

    var nameInput = document.getElementById('signup-name');
    var emailInput = document.getElementById('signup-email');
    var phoneInput = document.getElementById('signup-phone');
    var roleSelect = document.getElementById('signup-role');
    var pwInput = document.getElementById('signup-password');
    var confirmInput = document.getElementById('signup-confirm');
    var termsInput = document.getElementById('signup-terms');
    var submitBtn = document.getElementById('signup-submit');

    var nameError = document.getElementById('name-error');
    var emailError = document.getElementById('signup-email-error');
    var phoneError = document.getElementById('phone-error');
    var roleError = document.getElementById('role-error');
    var pwError = document.getElementById('signup-password-error');
    var confirmError = document.getElementById('confirm-error');
    var termsError = document.getElementById('terms-error');

    // ------ NAME ------
    nameInput.addEventListener('blur', function () {
      var val = sanitizeName(nameInput.value);
      nameInput.value = val;
      var err = validateName(val);
      if (err) { showError(nameError, err); setFieldState(nameInput, 'is-error'); }
      else { hideError(nameError); setFieldState(nameInput, 'is-success'); }
    });

    nameInput.addEventListener('input', function () {
      var val = sanitizeName(nameInput.value);
      nameInput.value = val;
      var err = val ? validateName(val) : '';
      if (!val) { hideError(nameError); setFieldState(nameInput, null); }
      else if (err) { setFieldState(nameInput, 'is-error'); }
      else { hideError(nameError); setFieldState(nameInput, 'is-success'); }
    });

    // ------ EMAIL ------
    emailInput.addEventListener('blur', function () {
      var val = emailInput.value.trim().toLowerCase();
      emailInput.value = val;
      if (!val) { showError(emailError, 'Email is required'); setFieldState(emailInput, 'is-error'); }
      else if (!isValidEmail(val)) { showError(emailError, 'Please enter a valid email'); setFieldState(emailInput, 'is-error'); }
      else { hideError(emailError); setFieldState(emailInput, 'is-success'); }
    });

    emailInput.addEventListener('input', function () {
      var val = emailInput.value.trim().toLowerCase();
      emailInput.value = val;
      if (!val) { hideError(emailError); setFieldState(emailInput, null); }
      else if (isValidEmail(val)) { hideError(emailError); setFieldState(emailInput, 'is-success'); }
      else { setFieldState(emailInput, 'is-error'); }
    });

    // ------ PHONE ------
    phoneInput.addEventListener('blur', function () {
      var clean = cleanPhone(phoneInput.value);
      phoneInput.value = clean;
      var err = validatePhone(clean);
      if (err) { showError(phoneError, err); setFieldState(phoneInput, 'is-error'); }
      else { hideError(phoneError); setFieldState(phoneInput, 'is-success'); }
    });

    phoneInput.addEventListener('input', function () {
      var raw = phoneInput.value;
      var digits = raw.replace(/[^\d]/g, '');
      if (digits !== raw) phoneInput.value = digits;
      if (!digits) { hideError(phoneError); setFieldState(phoneInput, null); }
      else {
        var err = validatePhone(digits);
        if (err) { setFieldState(phoneInput, 'is-error'); }
        else { hideError(phoneError); setFieldState(phoneInput, 'is-success'); }
      }
    });

    // ------ ROLE ------
    roleSelect.addEventListener('change', function () {
      var val = roleSelect.value;
      if (!val) {
        showError(roleError, 'Please select your role');
        setFieldState(roleSelect, 'is-error');
      } else {
        hideError(roleError);
        setFieldState(roleSelect, 'is-success');
        localStorage.setItem('userRole', val);
      }
    });

    // ------ PASSWORD ------
    pwInput.addEventListener('input', function () {
      var val = pwInput.value;
      updatePasswordMeter(val);
      updateChecklist(val);
      var err = val ? validatePassword(val) : '';
      if (!val) { hideError(pwError); setFieldState(pwInput, null); }
      else if (err) { setFieldState(pwInput, 'is-error'); }
      else { hideError(pwError); setFieldState(pwInput, 'is-success'); }

      // Re-check confirm
      if (confirmInput.value) {
        checkConfirmMatch();
      }
    });

    pwInput.addEventListener('blur', function () {
      var val = pwInput.value;
      if (!val) { showError(pwError, 'Password is required'); setFieldState(pwInput, 'is-error'); }
      else {
        var err = validatePassword(val);
        if (err) { showError(pwError, err); setFieldState(pwInput, 'is-error'); }
        else { hideError(pwError); setFieldState(pwInput, 'is-success'); }
      }
    });

    // ------ CONFIRM PASSWORD ------
    function checkConfirmMatch() {
      var pw = pwInput.value;
      var cf = confirmInput.value;
      if (!cf) { hideError(confirmError); setFieldState(confirmInput, null); return false; }
      if (cf !== pw) { showError(confirmError, 'Passwords do not match'); setFieldState(confirmInput, 'is-error'); return false; }
      else { hideError(confirmError); setFieldState(confirmInput, 'is-success'); return true; }
    }

    confirmInput.addEventListener('input', function () {
      checkConfirmMatch();
    });

    confirmInput.addEventListener('blur', function () {
      var cf = confirmInput.value;
      if (!cf) { showError(confirmError, 'Please confirm your password'); setFieldState(confirmInput, 'is-error'); }
      else { checkConfirmMatch(); }
    });

    // ------ ROLE VALIDATION for submit ------
    function validateRole() {
      var val = roleSelect.value;
      if (!val) { showError(roleError, 'Please select your role'); setFieldState(roleSelect, 'is-error'); return false; }
      hideError(roleError); setFieldState(roleSelect, 'is-success'); return true;
    }

    // ------ TERMS ------
    termsInput.addEventListener('change', function () {
      if (termsInput.checked) { hideError(termsError); }
    });

    function validateTerms() {
      if (!termsInput.checked) { showError(termsError, 'You must accept the terms'); return false; }
      hideError(termsError); return true;
    }

    // ------ SUBMIT ------
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hasError = false;

      // Name
      var name = sanitizeName(nameInput.value);
      nameInput.value = name;
      var nameErr = validateName(name);
      if (nameErr) { showError(nameError, nameErr); setFieldState(nameInput, 'is-error'); hasError = true; }
      else { hideError(nameError); setFieldState(nameInput, 'is-success'); }

      // Email
      var email = emailInput.value.trim().toLowerCase();
      emailInput.value = email;
      if (!email) { showError(emailError, 'Email is required'); setFieldState(emailInput, 'is-error'); hasError = true; }
      else if (!isValidEmail(email)) { showError(emailError, 'Please enter a valid email'); setFieldState(emailInput, 'is-error'); hasError = true; }
      else { hideError(emailError); setFieldState(emailInput, 'is-success'); }

      // Phone
      var phone = cleanPhone(phoneInput.value);
      phoneInput.value = phone;
      var phoneErr = validatePhone(phone);
      if (phoneErr) { showError(phoneError, phoneErr); setFieldState(phoneInput, 'is-error'); hasError = true; }
      else { hideError(phoneError); setFieldState(phoneInput, 'is-success'); }

      // Role
      if (!validateRole()) hasError = true;

      // Password
      var pw = pwInput.value;
      var pwErr = validatePassword(pw);
      if (pwErr) { showError(pwError, pwErr); setFieldState(pwInput, 'is-error'); hasError = true; }
      else { hideError(pwError); setFieldState(pwInput, 'is-success'); }

      // Confirm
      var cf = confirmInput.value;
      if (!cf) { showError(confirmError, 'Please confirm your password'); setFieldState(confirmInput, 'is-error'); hasError = true; }
      else if (cf !== pw) { showError(confirmError, 'Passwords do not match'); setFieldState(confirmInput, 'is-error'); hasError = true; }
      else { hideError(confirmError); setFieldState(confirmInput, 'is-success'); }

      // Terms
      if (!validateTerms()) hasError = true;

      if (hasError) {
        shakeCard();
        var firstErr = form.querySelector('.is-error');
        if (firstErr) firstErr.focus({ preventScroll: true });
        return;
      }

      // --- Success ---
      submitBtn.classList.add('is-loading');

      var userData = {
        name: name,
        email: email,
        phone: phone,
        role: roleSelect.value || 'student',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('userInitials', name.split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase());

      setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        showSuccess();
      }, 1800);
    });
  }

  // =============================================
  // 10. SUCCESS OVERLAY
  // =============================================
  function showSuccess() {
    var overlay = document.getElementById('success-overlay');
    if (!overlay) return;
    overlay.classList.add('is-visible');
    setTimeout(function () {
      var role = localStorage.getItem('userRole');
      if (role === 'buyer') {
        window.location.href = 'buyer-dashboard.html';
      } else if (role === 'seller') {
        window.location.href = 'seller-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 2200);
  }

  // =============================================
  // INIT
  // =============================================
  function init() {
    initParticles();
    initPasswordToggle('signup-pw-toggle', 'signup-password');
    initPasswordToggle('signup-confirm-toggle', 'signup-confirm');
    initSignupForm();

    var submitBtn = document.getElementById('signup-submit');
    if (submitBtn) initRipple(submitBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
