/* ====================================================
   Stackly Estates — Dashboard Shared JavaScript
   Premium Luxury Admin Theme
   ==================================================== */

(function () {
  'use strict';

  // =============================================
  // 1. AUTHENTICATION
  // =============================================

  function getCurrentUser() {
    var stored = localStorage.getItem('currentUser');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* fall through */ }
    }
    // Fallback: individual keys (legacy from login page)
    var role = localStorage.getItem('userRole');
    var name = localStorage.getItem('userName');
    var email = localStorage.getItem('userEmail');
    var initials = localStorage.getItem('userInitials');
    if (role || name) {
      return { name: name || 'User', email: email || '', role: role || 'buyer', initials: initials || 'U' };
    }
    return null;
  }

  var currentUser = getCurrentUser();
  var userRole = currentUser ? currentUser.role : null;
  var userName = currentUser ? currentUser.name : null;
  var userEmail = currentUser ? currentUser.email : null;
  var userInitials = currentUser && currentUser.initials ? currentUser.initials : (userName ? (
    userName.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase()
  ) : 'U');
  var profileImage = currentUser ? currentUser.profileImage : null;

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Role check: verify the HTML file matches the role
  var pageRole = document.body.getAttribute('data-role');
  if (pageRole && userRole !== pageRole && !localStorage.getItem('guestMode')) {
    window.location.href = 'login.html';
    return;
  }

  // =============================================
  // 2. UTILITY HELPERS
  // =============================================

  function getEl(id) { return document.getElementById(id); }

  function setText(id, val) {
    var el = getEl(id);
    if (el) el.textContent = val || '';
  }

  function setAttr(id, attr, val) {
    var el = getEl(id);
    if (el) el.setAttribute(attr, val);
  }

  function hasClass(el, cls) { return el.classList.contains(cls); }
  function addClass(el, cls) { el.classList.add(cls); }
  function removeClass(el, cls) { el.classList.remove(cls); }
  function toggleClass(el, cls) { el.classList.toggle(cls); }

  // =============================================
  // 3. INIT USER DISPLAY
  // =============================================

  function displayName(name) {
    return name || 'User';
  }

  function displayInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
  }

  function initUserDisplay() {
    var displayNameVal = displayName(userName);
    var initials = userInitials || displayInitials(userName);

    setText('sidebar-name', displayNameVal);
    setText('sidebar-role', userRole === 'buyer' ? 'Buyer' : userRole === 'seller' ? 'Seller' : '');
    setText('nav-name', displayNameVal);
    setText('nav-email', userEmail || '');
    setText('greeting-name', userName ? userName.split(' ')[0] : 'there');
    setText('page-title', 'Dashboard');
    setText('breadcrumb', 'Home / Dashboard');

    // Avatar with profile image or initials
    var avatarEls = document.querySelectorAll('.sidebar__user-avatar, .navbar__profile-avatar, .dropdown__avatar');
    avatarEls.forEach(function (el) {
      el.innerHTML = '';
      if (profileImage) {
        var img = document.createElement('img');
        img.src = profileImage;
        img.alt = userName || 'User';
        el.appendChild(img);
      } else {
        el.textContent = initials;
      }
    });

    // Dropdown header
    setText('dropdown-name', displayNameVal);
    setText('dropdown-email', userEmail || '');
    setText('dropdown-role', userRole === 'buyer' ? 'Buyer' : userRole === 'seller' ? 'Seller' : '');
  }

  // =============================================
  // 4. SIDEBAR
  // =============================================

  var sidebar = getEl('sidebar');
  var toggleBtn = getEl('sidebar-toggle');

  function initSidebar() {
    if (!sidebar || !toggleBtn) return;

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      } else {
        toggleClass(sidebar, 'collapsed');
      }
    });

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        // If we're on mobile (<768px) and sidebar was collapsed, reset
        if (window.innerWidth <= 768) {
          removeClass(sidebar, 'collapsed');
          removeClass(sidebar, 'mobile-open');
          if (hamburgerBtn) {
            removeClass(hamburgerBtn, 'active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';
        }
        // If we're on tablet (768-1024px) and sidebar has mobile-open, close it
        if (window.innerWidth > 768 && window.innerWidth <= 1024) {
          removeClass(sidebar, 'mobile-open');
          if (hamburgerBtn) {
            removeClass(hamburgerBtn, 'active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';
        }
      }, 150);
    });
  }

  // =============================================
  // 5. HAMBURGER MENU (Mobile Sidebar Toggle)
  // =============================================

  var hamburgerBtn = getEl('hamburger-btn');
  var sidebarOverlay = getEl('sidebar-overlay');

  function openMobileSidebar() {
    if (sidebar) addClass(sidebar, 'mobile-open');
    if (sidebarOverlay) addClass(sidebarOverlay, 'open');
    if (hamburgerBtn) {
      addClass(hamburgerBtn, 'active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (sidebar) removeClass(sidebar, 'mobile-open');
    if (sidebarOverlay) removeClass(sidebarOverlay, 'open');
    if (hamburgerBtn) {
      removeClass(hamburgerBtn, 'active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  function initHamburger() {
    if (!hamburgerBtn || !sidebar) return;

    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });

    // Close on overlay click
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
      }
    });

    // Close on nav item click (mobile)
    sidebar.querySelectorAll('.sidebar__nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeMobileSidebar();
        }
      });
    });
  }

  // =============================================
  // 6. MOBILE SEARCH TOGGLE
  // =============================================

  function initMobileSearch() {
    var searchBtn = document.getElementById('search-btn-mobile');
    var searchInput = document.querySelector('.navbar__search');
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = searchInput.classList.toggle('navbar__search--mobile-open');
      if (isOpen) {
        var input = searchInput.querySelector('input');
        if (input) setTimeout(function () { input.focus(); }, 100);
      }
    });

    // Close search on click outside
    document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) {
        searchInput.classList.remove('navbar__search--mobile-open');
      }
    });
  }

  // =============================================
  // 7. PAGE NAVIGATION
  // =============================================

  var navItems = document.querySelectorAll('.sidebar__nav-item[data-page]');
  var sections = document.querySelectorAll('.page-section');

  var pageTitles = {
    dashboard: 'Dashboard',
    search: 'Property Search',
    saved: 'Saved Properties',
    appointments: 'Appointments',
    offers: 'Offers & Negotiations',
    documents: 'Documents',
    messages: 'Messages',
    settings: 'Settings',
    properties: 'My Properties',
    performance: 'Property Performance',
    leads: 'Leads',
    payments: 'Payments'
  };

  var breadcrumbs = {
    dashboard: 'Home / Dashboard',
    search: 'Home / Property Search',
    saved: 'Home / Saved Properties',
    appointments: 'Home / Appointments',
    offers: 'Home / Offers & Negotiations',
    documents: 'Home / Documents',
    messages: 'Home / Messages',
    settings: 'Home / Settings',
    properties: 'Home / My Properties',
    performance: 'Home / Property Performance',
    leads: 'Home / Leads',
    payments: 'Home / Payments'
  };

  function showPage(pageId) {
    sections.forEach(function (s) { removeClass(s, 'active'); });
    var target = getEl('page-' + pageId);
    if (target) addClass(target, 'active');

    navItems.forEach(function (item) {
      if (hasClass(item, 'active') !== (item.dataset.page === pageId)) {
        toggleClass(item, 'active');
      }
    });

    // Update title and breadcrumb
    setText('page-title', pageTitles[pageId] || 'Dashboard');
    setText('breadcrumb', breadcrumbs[pageId] || 'Home');

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
      closeMobileSidebar();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initNavigation() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        showPage(this.dataset.page);
      });
    });
  }

  // Expose showPage globally for HTML onclick use
  window.switchPage = showPage;

  // =============================================
  // 6. PROFILE DROPDOWN
  // =============================================

  function initProfileDropdown() {
    var trigger = getEl('profile-trigger');
    var dropdown = getEl('profile-dropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleClass(dropdown, 'open');
    });

    document.addEventListener('click', function () {
      removeClass(dropdown, 'open');
    });
  }

  // =============================================
  // 7. LOGOUT
  // =============================================

  function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInitials');
    localStorage.removeItem('userData');
    localStorage.removeItem('guestMode');
    window.location.href = 'login.html';
  }

  function initLogout() {
    var logoutBtn = getEl('logout-btn');
    var dropdownLogout = getEl('dropdown-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (dropdownLogout) dropdownLogout.addEventListener('click', logout);
  }

  // =============================================
  // 8. DARK MODE
  // =============================================

  var darkToggle = getEl('dark-toggle');
  var darkModeTransitionTimer = null;

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function initDarkMode() {
    // Restore saved preference
    var saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
    } else {
      // Default to dark
      setTheme('dark');
    }

    if (darkToggle) {
      darkToggle.addEventListener('click', function () {
        // Add transition class for smooth theme switching
        addClass(document.documentElement, 'dark-mode-transition');
        clearTimeout(darkModeTransitionTimer);
        darkModeTransitionTimer = setTimeout(function () {
          removeClass(document.documentElement, 'dark-mode-transition');
        }, 500);

        toggleTheme();
      });
    }
  }

  // =============================================
  // 9. NOTIFICATION PANEL
  // =============================================

  function initNotifications() {
    var trigger = getEl('notif-trigger');
    var panel = getEl('notif-panel');
    var overlay = getEl('notif-overlay');
    var closeBtn = getEl('notif-close');

    if (!trigger || !panel) return;

    function openPanel() {
      addClass(panel, 'open');
      if (overlay) addClass(overlay, 'open');
    }

    function closePanel() {
      removeClass(panel, 'open');
      if (overlay) removeClass(overlay, 'open');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (hasClass(panel, 'open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (overlay) overlay.addEventListener('click', closePanel);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hasClass(panel, 'open')) closePanel();
    });
  }

  // =============================================
  // 10. COUNTER ANIMATION
  // =============================================

  function animateCounters() {
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      var raw = el.dataset.count;
      var isCurrency = raw.indexOf('$') !== -1;
      var target = parseFloat(raw.replace(/[$,]/g, ''));
      if (isNaN(target)) return;
      var duration = 1200;
      var start = performance.now();

      function update(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.round(eased * target);
        if (isCurrency) {
          if (val >= 1000000) el.textContent = '$' + (val / 1000000).toFixed(1) + 'M';
          else if (val >= 1000) el.textContent = '$' + (val / 1000).toFixed(0) + 'K';
          else el.textContent = '$' + val;
        } else {
          el.textContent = val;
        }
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = raw;
      }
      requestAnimationFrame(update);
    });
  }

  function initCounterObserver() {
    var kpiGrid = document.querySelector('.kpi-grid');
    if (!kpiGrid) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(kpiGrid);
  }

  // =============================================
  // 11. GLOBAL SEARCH
  // =============================================

  function initSearch() {
    var searchInput = document.querySelector('.navbar__search input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      var activeSection = document.querySelector('.page-section.active');
      if (!activeSection) return;

      // Filter property cards
      activeSection.querySelectorAll('.prop-card').forEach(function (card) {
        var title = (card.querySelector('.prop-card__title') || {}).textContent || '';
        var loc = (card.querySelector('.prop-card__loc') || {}).textContent || '';
        card.style.display = title.toLowerCase().includes(q) || loc.toLowerCase().includes(q) ? '' : 'none';
      });

      // Filter table rows
      activeSection.querySelectorAll('.table tbody tr').forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });

      // Filter message items
      activeSection.querySelectorAll('.msg-item').forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // =============================================
  // 12. TABLE SEARCH (inline filter inputs)
  // =============================================

  function initFilterInputs() {
    document.querySelectorAll('.filter-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var section = this.closest('.section-card') || this.closest('.page-section');
        if (!section) return;
        var rows = section.querySelectorAll('tbody tr');
        var q = this.value.toLowerCase().trim();
        rows.forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    });
  }

  // =============================================
  // 13. RIPPLE EFFECT
  // =============================================

  // =============================================
  // 14. TABLE DATA-LABELS (for stacked mobile view)
  // =============================================

  function initTableLabels() {
    document.querySelectorAll('.table').forEach(function (table) {
      var headers = [];
      table.querySelectorAll('thead th').forEach(function (th) {
        headers.push(th.textContent.trim());
      });
      if (headers.length === 0) return;
      table.querySelectorAll('tbody tr').forEach(function (row) {
        row.querySelectorAll('td').forEach(function (td, idx) {
          if (headers[idx] && !td.hasAttribute('data-label')) {
            td.setAttribute('data-label', headers[idx]);
          }
        });
      });
    });
  }

  function initRipples() {
    document.querySelectorAll('.ripple-btn').forEach(function (btn) {
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
    });
  }

  // =============================================
  // 14. PROFILE DROPDOWN SETTINGS / PROFILE ITEMS
  // =============================================

  function initDropdownItems() {
    // Settings click
    var settingsItems = document.querySelectorAll('.dropdown__item:not(#dropdown-logout)');
    settingsItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var text = this.textContent.trim().toLowerCase();
        if (text.indexOf('settings') !== -1) {
          showPage('settings');
        }
        // Close dropdown
        var dd = getEl('profile-dropdown');
        if (dd) removeClass(dd, 'open');
      });
    });
  }

  // =============================================
  // INIT
  // =============================================

  function init() {
    initUserDisplay();
    initSidebar();
    initHamburger();
    initNavigation();
    initProfileDropdown();
    initLogout();
    initDarkMode();
    initNotifications();
    initCounterObserver();
    initSearch();
    initFilterInputs();
    initRipples();
    initDropdownItems();
    initTableLabels();
    initMobileSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
