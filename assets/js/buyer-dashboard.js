/* ====================================================
   Stackly Estates — Buyer Dashboard JavaScript
   ==================================================== */

(function () {
  'use strict';

  // =============================================
  // 1. TIME-BASED GREETING
  // =============================================

  function setGreeting() {
    var el = document.getElementById('greeting-text');
    if (!el) return;
    var hour = new Date().getHours();
    var greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    el.textContent = greeting;
  }

  // =============================================
  // 2. PROPERTY SLIDER
  // =============================================

  function initSlider() {
    var slider = document.getElementById('prop-slider');
    var prev = document.getElementById('slider-prev');
    var next = document.getElementById('slider-next');
    if (!slider || !prev || !next) return;

    var pos = 0;
    var card = slider.querySelector('.prop-card--slider');
    if (!card) return;

    function getGap() {
      var style = window.getComputedStyle(slider);
      return parseFloat(style.gap) || 20;
    }

    function getVisible() {
      var w = slider.offsetWidth;
      var cardW = card.offsetWidth;
      var gap = getGap();
      return Math.floor((w + gap) / (cardW + gap));
    }

    function getTotal() {
      return slider.children.length;
    }

    function getMaxPos() {
      return Math.max(0, getTotal() - getVisible());
    }

    function slide(dir) {
      var max = getMaxPos();
      pos = Math.max(0, Math.min(pos + dir, max));
      var cardW = card.offsetWidth;
      var gap = getGap();
      slider.style.transform = 'translateX(-' + (pos * (cardW + gap)) + 'px)';
    }

    next.addEventListener('click', function () { slide(1); });
    prev.addEventListener('click', function () { slide(-1); });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        pos = Math.min(pos, getMaxPos());
        var cardW = card.offsetWidth;
        var gap = getGap();
        slider.style.transform = 'translateX(-' + (pos * (cardW + gap)) + 'px)';
      }, 150);
    });
  }

  // =============================================
  // 3. MORTGAGE CALCULATOR
  // =============================================

  function initMortgageCalc() {
    var priceInput = document.getElementById('mortgage-price');
    var downInput = document.getElementById('mortgage-down');
    var rateInput = document.getElementById('mortgage-rate');
    var termInput = document.getElementById('mortgage-term');
    var resultEl = document.getElementById('mortgage-result');
    var calcBtn = document.getElementById('mortgage-calc-btn');

    if (!priceInput || !resultEl) return;

    function calculate() {
      var price = parseFloat(priceInput.value) || 0;
      var downPct = parseFloat(downInput ? downInput.value : 20) || 20;
      var annualRate = parseFloat(rateInput ? rateInput.value : 6.5) || 6.5;
      var years = parseFloat(termInput ? termInput.value : 30) || 30;

      var down = price * (downPct / 100);
      var loan = price - down;
      var monthlyRate = (annualRate / 100) / 12;
      var payments = years * 12;

      if (loan <= 0 || monthlyRate <= 0 || payments <= 0) {
        resultEl.textContent = '$0';
        return;
      }

      var monthly = loan * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
      if (!isFinite(monthly)) monthly = 0;

      resultEl.textContent = '$' + monthly.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', calculate);
    } else {
      // Auto-calculate on input change
      [priceInput, downInput, rateInput, termInput].forEach(function (inp) {
        if (inp) inp.addEventListener('input', calculate);
      });
    }

    // Initial calculation
    calculate();
  }

  // =============================================
  // 4. CHARTS
  // =============================================

  function initCharts() {
    if (typeof Chart === 'undefined') return;

    var gridColor = 'rgba(255,255,255,0.06)';
    var textColor = 'rgba(232,237,245,0.6)';
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (!isDark) {
      gridColor = 'rgba(15,23,42,0.06)';
      textColor = 'rgba(15,23,42,0.4)';
    }
    var isMobileView = window.innerWidth <= 768;

    // --- Market Trend (Area Chart) ---
    var marketCtx = document.getElementById('chart-market-trend');
    if (marketCtx) {
      new Chart(marketCtx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Avg. Price per sqft',
            data: [420, 435, 448, 460, 455, 470, 485, 492, 488, 510, 525, 538],
            borderColor: '#C8A96B',
            backgroundColor: 'rgba(200,169,107,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#C8A96B',
            pointRadius: 3,
            borderWidth: 2
          }, {
            label: 'Properties Sold',
            data: [28, 32, 35, 30, 38, 42, 40, 45, 48, 52, 50, 55],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.06)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: isMobileView ? 'bottom' : 'top', labels: { color: textColor, font: { size: isMobileView ? 10 : 12 }, boxWidth: isMobileView ? 10 : 14, padding: isMobileView ? 8 : 12 } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: isMobileView ? 9 : 11 } } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: isMobileView ? 9 : 11 }, callback: function(v) { return '$' + v; } } }
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    // --- Offers Line Chart ---
    var offersCtx = document.getElementById('chart-offers');
    if (offersCtx) {
      new Chart(offersCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Offer Amount',
            data: [2800000, 3200000, 3950000, 4200000, 5500000, 6500000],
            borderColor: '#C8A96B',
            backgroundColor: 'rgba(200,169,107,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#C8A96B',
            pointRadius: 3,
            borderWidth: 2
          }, {
            label: 'Asking Price',
            data: [2950000, 3400000, 4100000, 4500000, 5800000, 6800000],
            borderColor: 'rgba(239,68,68,0.4)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: isMobileView ? 'bottom' : 'top', labels: { color: textColor, font: { size: isMobileView ? 9 : 11 }, boxWidth: isMobileView ? 10 : 14, padding: isMobileView ? 6 : 10 } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: isMobileView ? 8 : 10 } } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: isMobileView ? 8 : 10 }, callback: function(v) { return '$' + (v/1000000) + 'M'; } } }
          }
        }
      });
    }
  }

  // =============================================
  // 5. SETTINGS DARK MODE TOGGLE
  // =============================================

  function initSettingsDarkMode() {
    var toggle = document.getElementById('settings-dark-toggle');
    if (!toggle) return;

    // Sync with document state
    toggle.checked = document.documentElement.getAttribute('data-theme') !== 'light';

    toggle.addEventListener('change', function () {
      var theme = this.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }

  // =============================================
  // 6. LOAD USER DATA INTO SETTINGS
  // =============================================

  function initSettingsData() {
    var nameInput = document.getElementById('settings-name');
    var emailInput = document.getElementById('settings-email');
    var avatarEl = document.getElementById('settings-avatar-img');

    if (nameInput) {
      var name = localStorage.getItem('userName') || localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') || '{}').name : '';
      if (name) nameInput.value = name;
    }
    if (emailInput) {
      var email = localStorage.getItem('userEmail') || '';
      if (email) emailInput.value = email;
    }
    if (avatarEl) {
      var initials = localStorage.getItem('userInitials') || 'U';
      avatarEl.textContent = initials;
    }
  }

  // =============================================
  // 7. CHART THEME UPDATER
  // =============================================

  // Re-initialize charts when theme changes
  var origTheme = document.documentElement.getAttribute('data-theme');
  var darkObserver = new MutationObserver(function () {
    var newTheme = document.documentElement.getAttribute('data-theme');
    if (newTheme !== origTheme) {
      origTheme = newTheme;
      // Destroy and recreate charts (simplified: just reload page)
      // For production, use Chart instances array and .destroy()
    }
  });
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // =============================================
  // 7. LAZY CHART INIT ON PAGE VISIBILITY
  // =============================================

  var chartPagesRendered = {};

  function initPageCharts(pageId) {
    if (chartPagesRendered[pageId]) return;
    chartPagesRendered[pageId] = true;

    if (pageId === 'dashboard' || pageId === 'offers') {
      // Charts need a small delay to let the DOM become visible
      setTimeout(initCharts, 50);
    }
  }

  // Observe section visibility changes
  var sectionObserver = new MutationObserver(function () {
    var active = document.querySelector('.page-section.active');
    if (active) {
      var id = active.id ? active.id.replace('page-', '') : '';
      if (id) initPageCharts(id);
    }
  });

  document.querySelectorAll('.page-section').forEach(function (s) {
    sectionObserver.observe(s, { attributes: true, attributeFilter: ['class'] });
  });

  // Also observe on the content area for dynamic changes
  var contentArea = document.querySelector('.content');
  if (contentArea) {
    sectionObserver.observe(contentArea, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // =============================================
  // INIT
  // =============================================

  /* ==================== Messages Module ==================== */
  function initMessaging() {
    var root = document.getElementById('messaging-root');
    var convlist = document.getElementById('msg-convlist');
    var chat = document.getElementById('msg-chat');
    var convs = document.querySelectorAll('.msg-conv');
    var backBtn = document.getElementById('msg-chat-back');
    var detailsToggle = document.getElementById('msg-details-toggle');
    var detailsClose = document.getElementById('msg-details-close');
    var searchInput = document.querySelector('.msg-convlist__search-input');
    var filterBtns = document.querySelectorAll('.msg-filter-btn');
    var sendBtn = document.getElementById('msg-chat-send');
    var chatInput = document.getElementById('msg-chat-input');
    var typingIndicator = document.getElementById('msg-typing');

    if (!root) return;

    /* Switch conversation */
    function openConversation(conv) {
      convs.forEach(function(c) { c.classList.remove('active'); });
      conv.classList.add('active');

      var name = conv.querySelector('.msg-conv__name');
      var avatar = conv.querySelector('.msg-conv__chat-avatar') || conv.querySelector('.msg-conv__avatar');
      var initials = avatar ? avatar.textContent : '';
      var bg = avatar ? avatar.style.background : '#C8A96B';
      var color = avatar ? avatar.style.color : '#0F172A';

      var chatAvatar = document.getElementById('msg-chat-avatar');
      var chatName = document.getElementById('msg-chat-name');
      var chatStatus = document.getElementById('msg-chat-status');

      if (chatAvatar) { chatAvatar.textContent = initials; chatAvatar.style.background = bg; chatAvatar.style.color = color; }
      if (chatName) chatName.textContent = name ? name.textContent : '';
      if (chatStatus) chatStatus.textContent = 'Online';

      /* On mobile: switch to chat view */
      if (window.innerWidth <= 768) {
        root.classList.add('is-chatting');
      }
    }

    convs.forEach(function(conv) {
      conv.addEventListener('click', function() { openConversation(this); });
    });

    /* Back button (mobile) */
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        root.classList.remove('is-chatting');
      });
    }

    /* Details panel toggle */
    if (detailsToggle) {
      detailsToggle.addEventListener('click', function() {
        root.classList.toggle('is-details-open');
      });
    }

    if (detailsClose) {
      detailsClose.addEventListener('click', function() {
        root.classList.remove('is-details-open');
      });
    }

    /* Search filter */
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var q = this.value.toLowerCase().trim();
        convs.forEach(function(conv) {
          var name = conv.querySelector('.msg-conv__name');
          var preview = conv.querySelector('.msg-conv__preview');
          var text = ((name ? name.textContent : '') + ' ' + (preview ? preview.textContent : '')).toLowerCase();
          conv.style.display = (text.indexOf(q) !== -1) ? '' : 'none';
        });
      });
    }

    /* Filter buttons (All, Buyers, Agents) */
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.getAttribute('data-filter');
        convs.forEach(function(conv) {
          if (filter === 'all') { conv.style.display = ''; return; }
          var type = conv.getAttribute('data-type');
          conv.style.display = type === filter ? '' : 'none';
        });
      });
    });

    /* Send message */
    function sendMessage() {
      if (!chatInput || !chatInput.value.trim()) return;

      var body = document.getElementById('msg-chat-body');
      if (!body) return;

      var div = document.createElement('div');
      div.className = 'msg-bubble msg-bubble--buyer';
      div.innerHTML = '<div class="msg-bubble__text">' + chatInput.value.trim() + '</div><div class="msg-bubble__time">Just now</div>';
      body.appendChild(div);
      chatInput.value = '';
      body.scrollTop = body.scrollHeight;

      /* Simulate typing indicator for agent response */
      if (typingIndicator) typingIndicator.classList.add('is-visible');
      setTimeout(function() {
        if (typingIndicator) typingIndicator.classList.remove('is-visible');

        var reply = document.createElement('div');
        reply.className = 'msg-bubble msg-bubble--agent';
        var responses = [
          'Thank you for your message. I\'ll look into this right away and get back to you shortly.',
          'Great! I\'ve noted your request. Let me check the details and confirm.',
          'Thanks for reaching out. I\'ll update you as soon as I have more information.',
          'I appreciate your patience. I\'m reviewing the options and will send you the best matches.'
        ];
        reply.innerHTML = '<div class="msg-bubble__text">' + responses[Math.floor(Math.random() * responses.length)] + '</div><div class="msg-bubble__time">Just now</div>';
        body.appendChild(reply);
        body.scrollTop = body.scrollHeight;
      }, 1500 + Math.random() * 1000);
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    /* Responsive resize handling */
    function handleResize() {
      if (window.innerWidth > 768) {
        root.classList.remove('is-chatting');
      }
    }
    window.addEventListener('resize', handleResize);
  }

  function init() {
    setGreeting();
    initSlider();
    initMortgageCalc();
    initCharts();
    initSettingsDarkMode();
    initSettingsData();
    initMessaging();

    // Mark initial page as rendered
    var activePage = document.querySelector('.page-section.active');
    if (activePage) {
      var id = activePage.id ? activePage.id.replace('page-', '') : '';
      if (id) chartPagesRendered[id] = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
