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
  // 4. EMAIL VALIDATION (RFC-compliant-ish)
  // =============================================
  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(email);
  }

  // =============================================
  // 5. FIELD HELPERS
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
  // 6. LOGIN FORM
  // =============================================
  function initLoginForm() {
    var form = document.getElementById('login-form');
    if (!form) return;

    var emailInput = document.getElementById('login-email');
    var pwInput = document.getElementById('login-password');
    var emailError = document.getElementById('email-error');
    var pwError = document.getElementById('password-error');
    var remember = document.getElementById('login-remember');
    var submitBtn = document.getElementById('login-submit');
    var guestLink = document.getElementById('guest-link');

    // --- Live validation on blur ---
    emailInput.addEventListener('blur', function () {
      var val = emailInput.value.trim().toLowerCase();
      emailInput.value = val;
      if (!val) {
        showError(emailError, 'Email is required');
        setFieldState(emailInput, 'is-error');
      } else if (!isValidEmail(val)) {
        showError(emailError, 'Please enter a valid email');
        setFieldState(emailInput, 'is-error');
      } else {
        hideError(emailError);
        setFieldState(emailInput, 'is-success');
      }
    });

    emailInput.addEventListener('input', function () {
      var val = emailInput.value.trim().toLowerCase();
      emailInput.value = val;
      if (val && isValidEmail(val)) {
        hideError(emailError);
        setFieldState(emailInput, 'is-success');
      } else if (!val) {
        hideError(emailError);
        setFieldState(emailInput, null);
      } else {
        setFieldState(emailInput, 'is-error');
      }
    });

    pwInput.addEventListener('blur', function () {
      var val = pwInput.value;
      if (!val) {
        showError(pwError, 'Password is required');
        setFieldState(pwInput, 'is-error');
      } else {
        hideError(pwError);
        setFieldState(pwInput, 'is-success');
      }
    });

    pwInput.addEventListener('input', function () {
      var val = pwInput.value;
      if (val) {
        hideError(pwError);
        setFieldState(pwInput, 'is-success');
      } else {
        hideError(pwError);
        setFieldState(pwInput, null);
      }
    });

    // --- Submit ---
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hasError = false;

      var email = emailInput.value.trim().toLowerCase();
      emailInput.value = email;
      var password = pwInput.value;

      // Validate email
      if (!email) {
        showError(emailError, 'Email is required');
        setFieldState(emailInput, 'is-error');
        hasError = true;
      } else if (!isValidEmail(email)) {
        showError(emailError, 'Please enter a valid email');
        setFieldState(emailInput, 'is-error');
        hasError = true;
      } else {
        hideError(emailError);
        setFieldState(emailInput, 'is-success');
      }

      // Validate password
      if (!password) {
        showError(pwError, 'Password is required');
        setFieldState(pwInput, 'is-error');
        hasError = true;
      } else {
        hideError(pwError);
        setFieldState(pwInput, 'is-success');
      }

      if (hasError) {
        shakeCard();
        var firstErr = form.querySelector('.is-error');
        if (firstErr) firstErr.focus({ preventScroll: true });
        return;
      }

      // --- Success ---
      submitBtn.classList.add('is-loading');

      // Store in localStorage
      localStorage.setItem('userEmail', email);
      if (remember.checked) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        showSuccess();
      }, 1500);
    });

    // --- Guest link ---
    if (guestLink) {
      guestLink.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.setItem('guestMode', 'true');
        showSuccess();
      });
    }
  }

  // =============================================
  // 7. SUCCESS OVERLAY
  // =============================================
  function showSuccess() {
    var overlay = document.getElementById('success-overlay');
    if (!overlay) return;
    overlay.classList.add('is-visible');
    setTimeout(function () {
      var role = localStorage.getItem('userRole');
      if (role === 'trainer') {
        window.location.href = 'trainer-dashboard.html';
      } else if (role === 'student') {
        window.location.href = 'student-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 2200);
  }

  // =============================================
  // 8. REMEMBER EMAIL ON LOAD
  // =============================================
  function restoreRemembered() {
    var remembered = localStorage.getItem('rememberEmail');
    var emailInput = document.getElementById('login-email');
    var remember = document.getElementById('login-remember');
    if (remembered && emailInput && remember) {
      emailInput.value = remembered;
      remember.checked = true;
      setFieldState(emailInput, 'is-success');
    }
  }

  // =============================================
  // 9. AUTO-SCROLL TO FIRST ERROR (helper)
  // =============================================
  // Accessed via submit handler above

  // =============================================
  // INIT
  // =============================================
  function init() {
    initParticles();
    initPasswordToggle('login-pw-toggle', 'login-password');
    initLoginForm();
    restoreRemembered();

    var submitBtn = document.getElementById('login-submit');
    if (submitBtn) initRipple(submitBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
