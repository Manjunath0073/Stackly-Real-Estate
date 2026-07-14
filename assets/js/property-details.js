/* =====================================================
   Stackly Estates - Property Details Page JavaScript
   Gallery image switching and visit form validation.
   ===================================================== */

(function () {
  'use strict';

  /* -------------------- Image Gallery -------------------- */
  function initGallery() {
    const mainImage = document.getElementById('gallery-main');
    const thumbs = document.querySelectorAll('.property-gallery__thumb');
    if (!mainImage || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.dataset.src;
        if (!newSrc) return;

        mainImage.style.opacity = '0.7';

        const tempImg = new Image();
        tempImg.src = newSrc;
        tempImg.onload = () => {
          mainImage.src = newSrc;
          mainImage.alt = thumb.getAttribute('aria-label')?.replace('Show ', '') || '';
          mainImage.style.opacity = '1';
        };

        thumbs.forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });
  }

  /* -------------------- Visit Form -------------------- */
  function initVisitForm() {
    const form = document.getElementById('visit-form');
    const status = document.getElementById('visit-message-status');
    const dateInput = document.getElementById('visit-date');
    if (!form || !status) return;

    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.className = 'form-message';
      status.textContent = '';

      const name = form.querySelector('#visit-name')?.value.trim();
      const email = form.querySelector('#visit-email')?.value.trim();
      const date = form.querySelector('#visit-date')?.value;

      if (!name) {
        showStatus('Please enter your full name.', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      if (!date) {
        showStatus('Please select a preferred visit date.', 'error');
        return;
      }

      showStatus('Thank you! Your tour request has been submitted.', 'success');
      form.reset();
    });

    function showStatus(message, type) {
      status.textContent = message;
      status.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    initGallery();
    initVisitForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
