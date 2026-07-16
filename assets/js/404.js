(function () {
  'use strict';

  /* Page Loader */
  function initPageLoader() {
    var loader = document.getElementById('page-loader');
    if (!loader) return;
    function hide() {
      loader.classList.add('is-hidden');
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
    }
    if (document.readyState === 'complete') {
      setTimeout(hide, 150);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 150); });
    }
  }

  /* Go Back button */
  function initGoBack() {
    var btn = document.getElementById('btn-back');
    if (!btn) return;
    btn.addEventListener('click', function () { window.history.back(); });
  }

  /* Button ripple + magnetic glow */
  function initButtons() {
    document.querySelectorAll('.error-page__btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        this.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        this.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
      btn.addEventListener('click', function (e) {
        var rect = this.getBoundingClientRect();
        var ripple = document.createElement('span');
        var size = Math.max(rect.width, rect.height) * 0.8;
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = [
          'position:absolute',
          'border-radius:50%',
          'background:rgba(255,255,255,0.3)',
          'width:' + size + 'px',
          'height:' + size + 'px',
          'left:' + x + 'px',
          'top:' + y + 'px',
          'transform:scale(0)',
          'animation:rippleAnim 0.6s ease-out forwards',
          'pointer-events:none'
        ].join(';');
        this.appendChild(ripple);
        ripple.addEventListener('animationend', function () { ripple.remove(); });
      });
    });
    if (!document.getElementById('ripple-style')) {
      var s = document.createElement('style');
      s.id = 'ripple-style';
      s.textContent = '@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }';
      document.head.appendChild(s);
    }
  }

  /* Mouse parallax on image */
  function initParallax() {
    var wrap = document.querySelector('.error-page__image');
    if (!wrap) return;
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 6;
      var y = (e.clientY / window.innerHeight - 0.5) * 6;
      wrap.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      wrap.style.transition = 'transform 0.15s ease-out';
    });
  }

  /* Intersection Observer for popular cards */
  function initCards() {
    var cards = document.querySelectorAll('.error-page__card');
    if (!cards.length || !window.IntersectionObserver) {
      cards.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('is-visible'); }, 200 + i * 100);
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(function (c) { observer.observe(c); });
  }

  function init() {
    initPageLoader();
    initGoBack();
    initButtons();
    initParallax();
    initCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
