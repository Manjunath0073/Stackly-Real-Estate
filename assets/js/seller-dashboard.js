/* ====================================================
   Stackly Estates — Seller Dashboard JavaScript
   Sidebar/navbar handled by dashboard-shared.js
   This file handles charts, counters, and seller logic
   ==================================================== */

(function () {
  'use strict';

  // =============================================
  // 1. COUNTER ANIMATION
  // =============================================
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      counters.forEach((c) => { c.textContent = formatNumber(parseInt(c.dataset.count, 10)); });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (!target) return;
    const duration = 1500;
    const startTime = performance.now();
    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = formatNumber(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  // =============================================
  // 2. CHARTS
  // =============================================
  var chartInstances = {};

  function getThemeColors() {
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      gold: '#C8A96B', goldFill: 'rgba(200,169,107,0.15)',
      blue: '#3B82F6', blueFill: 'rgba(59,130,246,0.15)',
      green: '#10B981', greenFill: 'rgba(16,185,129,0.15)',
      orange: '#F59E0B', orangeFill: 'rgba(245,158,11,0.15)',
      red: '#EF4444', redFill: 'rgba(239,68,68,0.15)',
      purple: '#8B5CF6', purpleFill: 'rgba(139,92,246,0.15)',
      textColor: isDark ? 'rgba(232,237,245,0.7)' : 'rgba(15,23,42,0.5)',
      gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      isDark: isDark
    };
  }

  function getCtx(id) {
    var el = document.getElementById(id);
    return el ? el.getContext('2d') : null;
  }

  function destroyChart(id) {
    if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
  }

  function commonOpts() {
    var c = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: c.textColor, font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 } }
      },
      scales: {
        x: { grid: { color: c.gridColor, drawBorder: false }, ticks: { color: c.textColor, font: { size: 10 } } },
        y: { grid: { color: c.gridColor, drawBorder: false }, ticks: { color: c.textColor, font: { size: 10 } } }
      }
    };
  }

  function initCharts() {
    if (typeof Chart === 'undefined') return;
    var c = getThemeColors();
    var isMobile = window.innerWidth <= 768;

    // Revenue Trend (Area Chart)
    var revCtx = getCtx('chart-revenue');
    if (revCtx) {
      destroyChart('chart-revenue');
      chartInstances['chart-revenue'] = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Revenue',
            data: [120, 180, 210, 195, 280, 240, 310, 260, 290, 320, 275, 340],
            borderColor: c.gold,
            backgroundColor: c.goldFill,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: c.gold,
            pointRadius: 3,
            borderWidth: 2
          }, {
            label: 'Commission',
            data: [45, 65, 78, 72, 95, 82, 105, 88, 96, 108, 92, 112],
            borderColor: c.green,
            backgroundColor: c.greenFill,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: c.green,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: isMobile ? 'bottom' : 'top', labels: { color: c.textColor, font: { size: 11 }, boxWidth: 12, padding: 12 } } },
          scales: {
            x: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: isMobile ? 9 : 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: isMobile ? 9 : 10 }, callback: function(v) { return '$' + v + 'K'; } } }
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    // Property Status (Doughnut)
    var statusCtx = getCtx('chart-property-status');
    if (statusCtx) {
      destroyChart('chart-property-status');
      chartInstances['chart-property-status'] = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Sold', 'Featured', 'Draft'],
          datasets: [{
            data: [8, 24, 4, 2],
            backgroundColor: [c.green, c.blue, c.gold, c.orange],
            borderColor: 'transparent',
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: c.textColor, font: { size: 11 }, padding: 12 } }
          }
        }
      });
    }

    // Monthly Sales (Bar Chart)
    var salesCtx = getCtx('chart-monthly-sales');
    if (salesCtx) {
      destroyChart('chart-monthly-sales');
      chartInstances['chart-monthly-sales'] = new Chart(salesCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Properties Sold',
            data: [2, 1, 3, 2, 4, 3, 2, 3, 1, 2, 1, 2],
            backgroundColor: c.gold,
            borderRadius: 4,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: c.textColor, font: { size: 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } }, beginAtZero: true }
          }
        }
      });
    }

    // Property Performance (Bar Chart with multiple datasets)
    var perfCtx = getCtx('chart-property-perf');
    if (perfCtx) {
      destroyChart('chart-property-perf');
      chartInstances['chart-property-perf'] = new Chart(perfCtx, {
        type: 'bar',
        data: {
          labels: ['Cliffside Villa', 'Beverly Hills', 'Miami Water', 'Penthouse', 'Santa Monica'],
          datasets: [
            { label: 'Views', data: [456, 328, 275, 189, 198], backgroundColor: c.gold, borderRadius: 4 },
            { label: 'Leads', data: [23, 18, 14, 9, 11], backgroundColor: c.blue, borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: isMobile ? 'bottom' : 'top', labels: { color: c.textColor, font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: c.textColor, font: { size: isMobile ? 9 : 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } }, beginAtZero: true }
          }
        }
      });
    }

    // Monthly Growth (Line Chart)
    var growthCtx = getCtx('chart-monthly-growth');
    if (growthCtx) {
      destroyChart('chart-monthly-growth');
      chartInstances['chart-monthly-growth'] = new Chart(growthCtx, {
        type: 'line',
        data: {
          labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Views',
            data: [120, 180, 240, 320, 410, 520],
            borderColor: c.gold,
            backgroundColor: c.goldFill,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: c.gold,
            pointRadius: 4,
            borderWidth: 2
          }, {
            label: 'Leads',
            data: [8, 14, 22, 28, 35, 48],
            borderColor: c.blue,
            backgroundColor: c.blueFill,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: c.blue,
            pointRadius: 4,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: isMobile ? 'bottom' : 'top', labels: { color: c.textColor, font: { size: 11 } } } },
          scales: {
            x: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } }, beginAtZero: true }
          }
        }
      });
    }

    // Lead Sources (Doughnut)
    var leadSrcCtx = getCtx('chart-lead-sources');
    if (leadSrcCtx) {
      destroyChart('chart-lead-sources');
      chartInstances['chart-lead-sources'] = new Chart(leadSrcCtx, {
        type: 'doughnut',
        data: {
          labels: ['Website', 'Zillow', 'Google', 'Referral', 'Social'],
          datasets: [{
            data: [18, 12, 8, 6, 4],
            backgroundColor: [c.gold, c.blue, c.green, c.purple, c.orange],
            borderColor: 'transparent',
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: { position: isMobile ? 'bottom' : 'right', labels: { color: c.textColor, font: { size: 11 }, padding: 10, boxWidth: 10 } }
          }
        }
      });
    }

    // Sales Funnel (Bar Chart)
    var funnelCtx = getCtx('chart-funnel');
    if (funnelCtx) {
      destroyChart('chart-funnel');
      chartInstances['chart-funnel'] = new Chart(funnelCtx, {
        type: 'bar',
        data: {
          labels: ['New', 'Contacted', 'Qualified', 'Viewing', 'Negotiation', 'Closed'],
          datasets: [{
            label: 'Leads',
            data: [48, 36, 26, 17, 11, 8],
            backgroundColor: [c.gold, c.blue, c.green, c.orange, c.purple, c.green],
            borderRadius: 4,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: c.textColor, font: { size: 11 } } }
          }
        }
      });
    }

    // Lead Source Analytics (Bar Chart)
    var leadAnaCtx = getCtx('chart-lead-analytics');
    if (leadAnaCtx) {
      destroyChart('chart-lead-analytics');
      chartInstances['chart-lead-analytics'] = new Chart(leadAnaCtx, {
        type: 'bar',
        data: {
          labels: ['Website', 'Zillow', 'Google', 'Referral', 'Social', 'Email'],
          datasets: [{
            label: 'New Leads',
            data: [18, 12, 8, 6, 3, 1],
            backgroundColor: c.gold,
            borderRadius: 4
          }, {
            label: 'Converted',
            data: [8, 5, 3, 4, 1, 0],
            backgroundColor: c.green,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: isMobile ? 'bottom' : 'top', labels: { color: c.textColor, font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: c.textColor, font: { size: isMobile ? 9 : 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } }, beginAtZero: true }
          }
        }
      });
    }

    // Earnings Trend (Area Chart)
    var earnCtx = getCtx('chart-earnings');
    if (earnCtx) {
      destroyChart('chart-earnings');
      chartInstances['chart-earnings'] = new Chart(earnCtx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Earnings',
            data: [180, 220, 195, 280, 240, 310, 260, 290, 320, 275, 295, 340],
            borderColor: c.gold,
            backgroundColor: c.goldFill,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: c.gold,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 } } },
            y: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 10 }, callback: function(v) { return '$' + v + 'K'; } } }
          }
        }
      });
    }

    // Payment Status (Doughnut)
    var payStatCtx = getCtx('chart-payment-status');
    if (payStatCtx) {
      destroyChart('chart-payment-status');
      chartInstances['chart-payment-status'] = new Chart(payStatCtx, {
        type: 'doughnut',
        data: {
          labels: ['Paid', 'Pending', 'Processing'],
          datasets: [{
            data: [18, 8, 4],
            backgroundColor: [c.green, c.orange, c.blue],
            borderColor: 'transparent',
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: c.textColor, font: { size: 11 }, padding: 12 } }
          }
        }
      });
    }
  }

  // =============================================
  // 3. THEME CHANGE LISTENER
  // =============================================
  function setupThemeListener() {
    var observer = new MutationObserver(function () {
      initCharts();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // =============================================
  // 4. INIT
  // =============================================
  function init() {
    initCounters();
    initCharts();
    setupThemeListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
