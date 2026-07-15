/* =====================================================
   Stackly Estates - Properties Page JavaScript
   Filters, sorting, pagination, and URL query handling.
   ===================================================== */

(function () {
  'use strict';

  const ITEMS_PER_PAGE = 9;
  let currentPage = 1;

  const form = document.getElementById('property-filters');
  const grid = document.getElementById('properties-grid');
  const cards = Array.from(grid?.children || []);
  const countEl = document.getElementById('results-count');
  const noResults = document.getElementById('no-results');
  const pagination = document.getElementById('pagination');
  const pagesContainer = document.getElementById('pagination-pages');
  const prevBtn = pagination?.querySelector('.pagination__btn--prev');
  const nextBtn = pagination?.querySelector('.pagination__btn--next');
  const resetBtn = document.getElementById('filter-reset');
  const noResultsReset = document.getElementById('no-results-reset');

  function getFilters() {
    return {
      location: document.getElementById('filter-location')?.value.trim().toLowerCase() || '',
      type: document.getElementById('filter-type')?.value || '',
      status: document.getElementById('filter-status')?.value || '',
      beds: parseInt(document.getElementById('filter-beds')?.value || '0', 10) || 0,
      baths: parseInt(document.getElementById('filter-baths')?.value || '0', 10) || 0,
      sort: document.getElementById('filter-sort')?.value || 'featured'
    };
  }

  function parsePrice(card) {
    const priceText = card.querySelector('.property-card__price')?.textContent || '';
    const numeric = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
    return isNaN(numeric) ? 0 : numeric;
  }

  function filterCards(filters) {
    return cards.filter((card) => {
      const type = card.dataset.type || '';
      const status = card.dataset.status || '';
      const beds = parseInt(card.dataset.beds || '0', 10);
      const baths = parseInt(card.dataset.baths || '0', 10);
      const date = card.dataset.date || '';

      const locationText = (
        (card.querySelector('.property-card__title')?.textContent || '') +
        ' ' +
        (card.querySelector('.property-card__location')?.textContent || '')
      ).toLowerCase();

      if (filters.type && type !== filters.type) return false;
      if (filters.status && status !== filters.status) return false;
      if (filters.beds && beds < filters.beds) return false;
      if (filters.baths && baths < filters.baths) return false;
      if (filters.location && !locationText.includes(filters.location)) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return parsePrice(a) - parsePrice(b);
        case 'price-desc':
          return parsePrice(b) - parsePrice(a);
        case 'newest':
          return (b.dataset.date || '').localeCompare(a.dataset.date || '');
        default:
          return 0;
      }
    });
  }

  function renderPagination(totalItems) {
    if (!pagesContainer) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagesContainer.innerHTML = '';

    if (totalPages <= 1) {
      if (pagination) pagination.style.display = 'none';
      return;
    }

    if (pagination) pagination.style.display = 'flex';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pagination__page' + (i === currentPage ? ' is-active' : '');
      btn.setAttribute('aria-label', `Page ${i}`);
      if (i === currentPage) btn.setAttribute('aria-current', 'page');
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        updateListings();
      });
      pagesContainer.appendChild(btn);
    }

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  function updateListings() {
    const filters = getFilters();
    const filtered = filterCards(filters);

    cards.forEach((card) => (card.style.display = 'none'));

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      if (noResults) noResults.hidden = false;
      if (pagination) pagination.style.display = 'none';
      return;
    }

    if (noResults) noResults.hidden = true;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, end);

    pageItems.forEach((card) => (card.style.display = ''));
    renderPagination(filtered.length);
  }

  function resetFilters() {
    if (form) form.reset();
    currentPage = 1;
    updateListings();
  }

  function applyQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const locationInput = document.getElementById('filter-location');
    const typeSelect = document.getElementById('filter-type');
    const budgetSelect = document.getElementById('filter-budget'); // not present; ignore

    if (params.has('location') && locationInput) {
      locationInput.value = params.get('location');
    }

    if (params.has('type') && typeSelect) {
      const type = params.get('type');
      if (Array.from(typeSelect.options).some((opt) => opt.value === type)) {
        typeSelect.value = type;
      }
    }

    // Budget query param from homepage is not directly used in this filter UI.
    if (params.has('budget') && budgetSelect) {
      budgetSelect.value = params.get('budget');
    }
  }

  function initPaginationControls() {
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          updateListings();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalItems = filterCards(getFilters()).length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          updateListings();
        }
      });
    }
  }

  function init() {
    if (!grid || !cards.length) return;

    applyQueryParams();
    updateListings();
    initPaginationControls();

    if (form) {
      form.addEventListener('change', () => {
        currentPage = 1;
        updateListings();
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    if (resetBtn) resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });
    if (noResultsReset) noResultsReset.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });

    const searchBtn = form?.querySelector('.filter-form__btn-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }
  }

  /* ----------------- Marquee Placeholder Detection ----------------- */
  function initMarqueePlaceholders() {
    const wraps = document.querySelectorAll('.filter-form__input-wrap[data-placeholder]');
    if (!wraps.length) return;

    const measureText = (text, font) => {
      const temp = document.createElement('span');
      temp.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;left:-9999px;top:-9999px;';
      temp.style.font = font;
      temp.textContent = text;
      document.body.appendChild(temp);
      const width = temp.offsetWidth;
      document.body.removeChild(temp);
      return width;
    };

    const updateWrap = (wrap) => {
      const input = wrap.querySelector('input, select');
      if (!input) return;

      const hasValue = input.value && String(input.value).trim() !== '';
      wrap.classList.toggle('has-value', hasValue);

      if (hasValue || document.activeElement === input) {
        wrap.classList.remove('marquee-active');
        return;
      }

      const placeholder = wrap.dataset.placeholder;
      if (!placeholder) return;

      const cs = window.getComputedStyle(input);
      const font = `${cs.fontStyle} ${cs.fontVariant} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
      const textWidth = measureText(placeholder, font);
      const wrapWidth = wrap.offsetWidth;
      const available = Math.max(0, wrapWidth - 56);
      wrap.classList.toggle('marquee-active', textWidth > available);
    };

    wraps.forEach((wrap) => {
      const input = wrap.querySelector('input, select');
      if (!input) return;
      updateWrap(wrap);
      input.addEventListener('input', () => updateWrap(wrap));
      input.addEventListener('change', () => updateWrap(wrap));
      input.addEventListener('focus', () => updateWrap(wrap));
      input.addEventListener('blur', () => updateWrap(wrap));
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => wraps.forEach(updateWrap), 120);
    });
  }

  /* ----------------- Page Hero Entrance Animation ----------------- */
  function initHeroReveal() {
    const hero = document.querySelector('.page-hero');
    if (!hero) return;
    const items = hero.querySelectorAll('.breadcrumbs, .page-hero__badge, .page-hero__title, .page-hero__subtitle, .page-hero__stats');
    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`;
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
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
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
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
        el.textContent = current.toLocaleString('en-US');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-US');
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

  /* ------------------ Page Loader ------------------ */
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    if (document.readyState === 'complete') {
      loader.classList.add('is-hidden'); setTimeout(() => loader.remove(), 700);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => { loader.classList.add('is-hidden'); setTimeout(() => loader.remove(), 700); }, 200);
      });
    }
  }

  /* ------------------ Scroll Progress ------------------ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------ Full Init ------------------ */
  function fullInit() {
    initPageLoader();
    initScrollProgress();
    init();
    initScrollReveal();
    initCounters();
    initHeroReveal();
    initMarqueePlaceholders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fullInit);
  } else {
    fullInit();
  }
})();
