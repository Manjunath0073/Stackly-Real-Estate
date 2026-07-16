(function () {
  'use strict';

  function throttle(fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, arguments); }
    };
  }

  /* Page Loader */
  function initPageLoader() {
    var loader = document.getElementById('page-loader');
    if (!loader) return;
    if (document.readyState === 'complete') {
      loader.classList.add('is-hidden');
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 700);
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () {
          loader.classList.add('is-hidden');
          setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 700);
        }, 200);
      });
    }
  }

  /* Scroll Progress */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', throttle(function () {
      var scrolled = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, 16), { passive: true });
  }

  /* Scroll Reveal */
  function initReveals() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ==================== Form Validation ==================== */
  function initFormValidation() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = {
      name: {
        input: document.getElementById('contact-name'),
        error: document.getElementById('name-error'),
        validate: function (val) {
          if (!val || val.trim().length < 3) return 'Please enter a valid name (letters only).';
          if (!/^[A-Za-z ]+$/.test(val.trim())) return 'Please enter a valid name (letters only).';
          if (val.trim().length > 50) return 'Name cannot exceed 50 characters.';
          return '';
        }
      },
      email: {
        input: document.getElementById('contact-email'),
        error: document.getElementById('email-error'),
        validate: function (val) {
          if (!val || !val.trim()) return 'Please enter a valid email address.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email address.';
          return '';
        }
      },
      phone: {
        input: document.getElementById('contact-phone'),
        error: document.getElementById('phone-error'),
        validate: function (val) {
          if (!val || !val.trim()) return '';
          if (!/^\d{10}$/.test(val.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number.';
          return '';
        }
      },
      subject: {
        input: document.getElementById('contact-subject'),
        error: document.getElementById('subject-error'),
        validate: function (val) {
          if (!val) return 'Please select a subject.';
          if (val.length < 5) return 'Subject must be at least 5 characters.';
          if (val.length > 100) return 'Subject cannot exceed 100 characters.';
          return '';
        }
      },
      message: {
        input: document.getElementById('contact-message'),
        error: document.getElementById('message-error'),
        validate: function (val) {
          if (!val || !val.trim()) return 'Message must contain at least 10 characters.';
          if (val.trim().length < 10) return 'Message must contain at least 10 characters.';
          if (val.trim().length > 500) return 'Message cannot exceed 500 characters.';
          return '';
        }
      }
    };

    var submitBtn = document.getElementById('form-submit-btn');
    var btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    var charCounter = document.getElementById('char-counter');
    var successBox = null;

    /* Phone: block non-digit input */
    if (fields.phone.input) {
      fields.phone.input.addEventListener('keydown', function (e) {
        var allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowed.indexOf(e.key) !== -1) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) e.preventDefault();
      });
      fields.phone.input.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    /* Message character counter */
    if (fields.message.input && charCounter) {
      fields.message.input.addEventListener('input', function () {
        var len = this.value.length;
        charCounter.textContent = len + ' / 500';
        charCounter.classList.toggle('is-limit', len > 500);
      });
    }

    /* Validate a single field */
    function validateField(name) {
      var field = fields[name];
      if (!field || !field.input) return true;
      var val = field.input.value;
      var err = field.validate(val);
      var errorEl = field.error;

      if (errorEl) {
        errorEl.textContent = err;
        errorEl.classList.toggle('is-visible', !!err);
      }

      field.input.setAttribute('aria-invalid', !!err ? 'true' : 'false');
      field.input.classList.toggle('is-error', !!err);

      return !err;
    }

    /* Validate all fields */
    function validateAll() {
      var valid = true;
      for (var key in fields) {
        if (fields.hasOwnProperty(key)) {
          if (!validateField(key)) valid = false;
        }
      }
      return valid;
    }

    /* Live validation events */
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        (function (name) {
          var field = fields[name];
          if (!field.input) return;

          field.input.addEventListener('input', function () {
            validateField(name);
            /* Also validate subject separately */
            if (name === 'subject') {
              var subVal = field.input.value;
              if (subVal && subVal.length >= 5) {
                if (field.error) {
                  field.error.textContent = '';
                  field.error.classList.remove('is-visible');
                }
                field.input.setAttribute('aria-invalid', 'false');
                field.input.classList.remove('is-error');
              }
            }
          });

          field.input.addEventListener('blur', function () {
            validateField(name);
          });
        })(key);
      }
    }

    /* Create success alert */
    function createSuccessAlert() {
      var div = document.createElement('div');
      div.className = 'form-success';
      div.id = 'form-success';
      div.innerHTML =
        '<div class="form-success__icon" aria-hidden="true">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="20 6 9 17 4 12"/>' +
          '</svg>' +
        '</div>' +
        '<p class="form-success__text">Your message has been sent successfully! Our team will contact you shortly.</p>';
      return div;
    }

    /* Show success message */
    function showSuccess() {
      if (!successBox) successBox = createSuccessAlert();
      if (submitBtn) submitBtn.parentNode.insertBefore(successBox, submitBtn.nextSibling);
      requestAnimationFrame(function () {
        successBox.classList.add('is-visible');
      });

      setTimeout(function () {
        if (successBox && successBox.parentNode) {
          successBox.classList.remove('is-visible');
          setTimeout(function () {
            if (successBox && successBox.parentNode) successBox.parentNode.removeChild(successBox);
          }, 400);
        }
        form.reset();
        for (var k in fields) {
          if (fields.hasOwnProperty(k) && fields[k].input) {
            fields[k].input.setAttribute('aria-invalid', 'false');
            fields[k].input.classList.remove('is-error');
          }
          if (fields[k].error) {
            fields[k].error.textContent = '';
            fields[k].error.classList.remove('is-visible');
          }
        }
        if (charCounter) charCounter.textContent = '0 / 500';
        resetButton();
      }, 3000);
    }

    /* Button loading state */
    function setButtonLoading() {
      if (!submitBtn) return;
      if (btnText) btnText.textContent = 'Sending...';
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    function resetButton() {
      if (!submitBtn) return;
      if (btnText) btnText.textContent = 'Send Message';
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }

    /* Form submit */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var messageEl = document.getElementById('contact-form-message');
      if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = 'form-message';
      }

      var isValid = validateAll();
      if (!isValid) return;

      setButtonLoading();

      setTimeout(function () {
        resetButton();
        showSuccess();
      }, 1200);
    });
  }

  /* Back to Top */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', throttle(function () {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, 100), { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* Counter animation for stats */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.dataset.counter, 10);
      var duration = 2000;
      var start = performance.now();

      function step(now) {
        var p = Math.min((now - start) / duration, 1);
        var ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(ease * target).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-US');
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  function init() {
    initPageLoader();
    initScrollProgress();
    initReveals();
    initFormValidation();
    initBackToTop();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
