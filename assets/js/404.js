(function () {
  'use strict';

  /* Page Loader */
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    const hide = () => {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 600);
    };
    if (document.readyState === 'complete') {
      setTimeout(hide, 150);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 150));
    }
  }

  /* Go Back button */
  function initGoBack() {
    const btn = document.getElementById('btn-back');
    if (!btn) return;
    btn.addEventListener('click', () => window.history.back());
  }

  /* Button ripple + magnetic glow */
  function initButtons() {
    document.querySelectorAll('.not-found__btn').forEach((btn) => {
      btn.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        this.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        this.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          width: 60px; height: 60px;
          left: ${e.clientX - rect.left - 30}px;
          top: ${e.clientY - rect.top - 30}px;
          transform: scale(0);
          animation: rippleAnim 0.5s ease-out forwards;
          pointer-events: none;
        `;
        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
    if (!document.getElementById('ripple-style')) {
      const s = document.createElement('style');
      s.id = 'ripple-style';
      s.textContent = '@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }';
      document.head.appendChild(s);
    }
  }

  /* Mouse parallax on image */
  function initParallax() {
    const img = document.querySelector('.not-found__image');
    if (!img) return;
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      img.style.transform = `translate(${x}px, ${y}px)`;
      img.style.transition = 'transform 0.15s ease-out';
    });
  }

  function init() {
    initPageLoader();
    initGoBack();
    initButtons();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();