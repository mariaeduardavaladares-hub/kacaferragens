/**
 * KACA FERRAGENS – script.js
 * Recursos: Menu mobile, scroll spy, animações IntersectionObserver,
 *           relógio analógico/digital ao vivo, status de funcionamento,
 *           ano dinâmico no rodapé.
 */

(function () {
  'use strict';

  /* ================================================
     UTILIDADES
  ================================================ */
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  /* ================================================
     HEADER – SCROLL BEHAVIOR
  ================================================ */
  var header = qs('#site-header');

  function onHeaderScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll(); // run once on load

  /* ================================================
     MENU MOBILE – HAMBURGER
  ================================================ */
  var hamburger = qs('#hamburger');
  var navMain   = qs('#nav-main');

  function toggleMenu(open) {
    var isOpen = open !== undefined ? open : !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', isOpen);
    navMain.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      toggleMenu();
    });
  }

  // Close menu on nav link click
  qsa('.nav-link', navMain).forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMenu(false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (
      navMain.classList.contains('open') &&
      !navMain.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });

  /* ================================================
     SCROLL SPY – ACTIVE NAV LINK
  ================================================ */
  var sections = qsa('section[id]');
  var navLinks  = qsa('.nav-link');

  function updateActiveLink() {
    var scrollY = window.scrollY;
    var offset  = 100;

    sections.forEach(function (section) {
      var top    = section.offsetTop - offset;
      var bottom = top + section.offsetHeight;
      var id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ================================================
     INTERSECTION OBSERVER – ANIMAÇÕES
  ================================================ */
  var animateEls = qsa('[data-animate]');

  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.12
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el    = entry.target;
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);

      setTimeout(function () {
        el.classList.add('in-view');
      }, delay);

      observer.unobserve(el);
    });
  }, observerOptions);

  animateEls.forEach(function (el) {
    observer.observe(el);
  });

  /* ================================================
     RELÓGIO AO VIVO – ANALÓGICO + DIGITAL
  ================================================ */
  var clockHour    = qs('#clock-hour');
  var clockMin     = qs('#clock-min');
  var clockSec     = qs('#clock-sec');
  var clockDigital = qs('#clock-digital');
  var clockStatus  = qs('#clock-status');

  /**
   * Retorna true se a loja estiver aberta agora.
   * Horários:
   *   Seg–Sex: 08:00–18:00
   *   Sábado:  08:00–15:00
   *   Domingo: 09:30–12:00
   */
  function isOpen(now) {
    var day     = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
    var hours   = now.getHours();
    var minutes = now.getMinutes();
    var totalMin = hours * 60 + minutes;

    if (day >= 1 && day <= 5) {
      // Segunda a Sexta: 08h–18h
      return totalMin >= 8 * 60 && totalMin < 18 * 60;
    } else if (day === 6) {
      // Sábado: 08h–15h
      return totalMin >= 8 * 60 && totalMin < 15 * 60;
    } else if (day === 0) {
      // Domingo: 09h30–12h
      return totalMin >= 9 * 60 + 30 && totalMin < 12 * 60;
    }
    return false;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function updateClock() {
    var now  = new Date();
    var h    = now.getHours();
    var m    = now.getMinutes();
    var s    = now.getSeconds();

    // Graus para os ponteiros
    var secDeg  = s * 6;
    var minDeg  = m * 6 + s * 0.1;
    var hourDeg = (h % 12) * 30 + m * 0.5;

    if (clockHour) clockHour.style.transform = 'rotate(' + hourDeg + 'deg)';
    if (clockMin)  clockMin.style.transform  = 'rotate(' + minDeg  + 'deg)';
    if (clockSec)  clockSec.style.transform  = 'rotate(' + secDeg  + 'deg)';

    // Digital
    if (clockDigital) {
      clockDigital.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    // Status
    if (clockStatus) {
      if (isOpen(now)) {
        clockStatus.textContent = '🟢 Aberto agora';
        clockStatus.className   = 'clock-status open';
      } else {
        clockStatus.textContent = '🔴 Fechado agora';
        clockStatus.className   = 'clock-status closed';
      }
    }
  }

  if (clockHour) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ================================================
     ANO DINÂMICO NO RODAPÉ
  ================================================ */
  var yearEl = qs('#footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ================================================
     SMOOTH SCROLL POLYFILL LEVE
     (Garante compatibilidade em browsers que não suportam
      scroll-behavior: smooth no CSS)
  ================================================ */
  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = qs(targetId);
      if (!target) return;

      e.preventDefault();

      var headerOffset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
        10
      );

      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ================================================
     BOTÃO FLUTUANTE – EFEITO DE ENTRADA RETARDADO
  ================================================ */
  var waFloat = qs('#wa-float-btn');

  if (waFloat) {
    waFloat.style.opacity = '0';
    waFloat.style.transform = 'scale(0.8) translateY(16px)';
    waFloat.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

    window.addEventListener('load', function () {
      setTimeout(function () {
        waFloat.style.opacity  = '1';
        waFloat.style.transform = 'scale(1) translateY(0)';
      }, 1200);
    });
  }

  /* ================================================
     PRODUTO CARDS – HOVER TILT LEVE
  ================================================ */
  qsa('.produto-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect   = card.getBoundingClientRect();
      var centerX = rect.left + rect.width  / 2;
      var centerY = rect.top  + rect.height / 2;
      var x = (e.clientX - centerX) / (rect.width  / 2);
      var y = (e.clientY - centerY) / (rect.height / 2);

      card.style.transform = 'translateY(-6px) rotateY(' + (x * 3) + 'deg) rotateX(' + (-y * 2) + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ================================================
     DIFERENCIAL CARDS – COUNTER ANIMATION
  ================================================ */
  // Animação de contadores nas estatísticas do hero
  var statNums = qsa('.stat-num');

  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el      = entry.target;
      var rawText = el.textContent.trim();
      // Extrair número do texto (ex: "+30" → 30, "+5mil" → 5)
      var numMatch = rawText.match(/[\d.]+/);
      if (!numMatch) return;

      var target  = parseFloat(numMatch[0]);
      var prefix  = rawText.includes('+') ? '+' : '';
      var suffix  = rawText.replace(prefix, '').replace(/[\d.]+/, '');

      var start    = 0;
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        var current  = Math.floor(eased * target);

        el.textContent = prefix + current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = rawText; // Restore original text
        }
      }

      requestAnimationFrame(step);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(function (el) {
    statsObserver.observe(el);
  });

  /* ================================================
     PREFERS REDUCED MOTION
  ================================================ */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReduced.matches) {
    // Mostrar todos os elementos animados imediatamente
    qsa('[data-animate]').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

})();
