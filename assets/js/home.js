(function () {
  'use strict';

  /* -------------------- Utilities -------------------- */
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  /* ------------------ Page Loader ------------------ */
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        setTimeout(() => loader.remove(), 700);
      }, 200);
    });
    if (document.readyState === 'complete') {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 700);
    }
  }

  /* ------------------ Scroll Progress ------------------ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    const onScroll = throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------ Scroll Reveal ------------------ */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || '0';
            el.style.transitionDelay = delay + 'ms';
            el.classList.add('is-visible');
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ------------------ Hero Parallax ------------------ */
  function initHeroParallax() {
    const heroMedia = document.querySelector('.hero__media');
    if (!heroMedia || prefersReducedMotion()) return;

    const onScroll = throttle(() => {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.3;
      heroMedia.style.transform = `translate3d(0, ${rate}px, 0) scale(1.1)`;
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------ Counter Animation ------------------ */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 2200;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(easeOutExpo * target);
        el.textContent = formatNumber(current);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ------------------ Button Ripple Effect ------------------ */
  function initRippleEffect() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        if (prefersReducedMotion()) return;
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ------------------ Button Magnetic Hover ------------------ */
  function initMagneticHover() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll('.btn, .category-card__link, .blog-card__link').forEach((el) => {
      el.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      el.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    });
  }

  /* ------------------ Mouse Follower Glow ------------------ */
  function initMouseGlow() {
    if (prefersReducedMotion() || window.innerWidth < 768) return;
    const cards = document.querySelectorAll('.property-card, .category-card, .agent-card, .feature-card, .blog-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.setProperty('--mouse-x', x + '%');
        this.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /* ------------------ Navbar Auto-Hide on Scroll ------------------ */
  function initNavbarBehavior() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScroll = 0;

    const onScroll = throttle(() => {
      const currentScroll = window.scrollY;
      if (currentScroll > 80) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }
      lastScroll = currentScroll;
    }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------- Testimonial Slider ----------------- */
  function initTestimonialSlider() {
    const slider = document.getElementById('testimonial-slider');
    if (!slider) return;

    const track = slider.querySelector('#testimonial-track');
    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector('#testimonial-prev');
    const nextBtn = slider.querySelector('#testimonial-next');
    const dotsContainer = slider.querySelector('#testimonial-dots');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoplayInterval = null;
    const autoplayDelay = 6000;

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-dot');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const updateSlides = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index !== currentIndex ? 'true' : 'false');
        slide.style.opacity = index === currentIndex ? '1' : '0';
        slide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        slide.style.transform = index === currentIndex ? 'scale(1)' : 'scale(0.95)';
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
        dot.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
      });
    };

    const goToSlide = (index) => {
      currentIndex = index;
      if (currentIndex < 0) currentIndex = slides.length - 1;
      if (currentIndex >= slides.length) currentIndex = 0;
      updateSlides();
      resetAutoplay();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAutoplay = () => {
      if (autoplayInterval) return;
      if (!prefersReducedMotion()) {
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
      }
    };

    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('keydown', (e) => {
      if (!slider.matches(':focus-within') && !slider.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'ArrowRight') nextSlide();
    });

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const threshold = 50;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > threshold) {
        diff > 0 ? nextSlide() : prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    updateSlides();
    startAutoplay();
  }

  /* ----------------- Search Validation ----------------- */
  function initSearchValidation() {
    const form = document.getElementById('property-search-form');
    const error = document.getElementById('search-error');
    if (!form || !error) return;

    form.addEventListener('submit', (e) => {
      const location = form.querySelector('#search-location').value.trim();
      const type = form.querySelector('#search-type').value;
      const budget = form.querySelector('#search-budget').value;

      if (!location && !type && !budget) {
        e.preventDefault();
        error.textContent = 'Please enter a location, property type, or budget to search.';
        return;
      }

      error.textContent = '';
    });

    form.querySelectorAll('input, select').forEach((el) => {
      el.addEventListener('input', () => {
        if (error.textContent) error.textContent = '';
      });
    });
  }

  /* ----------------- Back to Top Button ----------------- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const onScroll = throttle(() => {
      if (window.scrollY > 500) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------- Lazy Loading Enhancements ----------------- */
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) return;
    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px' }
    );
    images.forEach((img) => observer.observe(img));
  }

  /* ----------------- Image Error Fallbacks ----------------- */
  function initImageFallbacks() {
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function () {
        this.style.opacity = '0.1';
        this.style.background = 'var(--bg-alt)';
      });
    });
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    initPageLoader();
    initScrollProgress();
    initScrollReveal();
    initHeroParallax();
    initCounters();
    initRippleEffect();
    initMagneticHover();
    initMouseGlow();
    initNavbarBehavior();
    initTestimonialSlider();
    initSearchValidation();
    initBackToTop();
    initLazyLoading();
    initImageFallbacks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
