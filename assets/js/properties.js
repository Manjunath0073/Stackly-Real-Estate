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
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1;
        updateListings();
      });

      form.addEventListener('change', () => {
        currentPage = 1;
        updateListings();
      });
    }

    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    if (noResultsReset) noResultsReset.addEventListener('click', resetFilters);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
