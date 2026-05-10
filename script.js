// ============================================================
// PMK Remodeling LLC — Scripts
// ============================================================

(function () {
  'use strict';

  // ---- Header scroll effect ----
  const header = document.getElementById('header');
  const floatingCta = document.getElementById('floatingCta');

  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    floatingCta.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // ---- Mobile nav ----
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // ---- Scroll reveal animation ----
  const revealTargets = document.querySelectorAll(
    '.coverage-item, .why-card, .why-split-card, .realtor-card, .value-card, .contact-grid'
  );

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Simulate async submission (replace with real endpoint)
      setTimeout(function () {
        form.reset();
        formSuccess.classList.add('show');
        btn.textContent = 'Send Message →';
        btn.disabled = false;

        setTimeout(function () {
          formSuccess.classList.remove('show');
        }, 5000);
      }, 1200);
    });
  }

  // ---- Before / After Slider ----
  (function () {
    var slider   = document.getElementById('baSlider');
    var before   = document.getElementById('baBeforeLayer');
    var handle   = document.getElementById('baHandle');
    if (!slider || !before || !handle) return;

    var pct = 50; // starting position %
    var dragging = false;

    function setPosition(x) {
      var rect = slider.getBoundingClientRect();
      pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      before.style.width = pct + '%';
      handle.style.left  = pct + '%';
      // keep before-img at full slider width so clip reveals correctly
      before.style.setProperty('--ba-full-w', (100 / (pct / 100 || 0.001)).toFixed(2) + '%');
    }

    // Mouse
    handle.addEventListener('mousedown', function (e) { dragging = true; e.preventDefault(); });
    window.addEventListener('mouseup',   function ()  { dragging = false; });
    window.addEventListener('mousemove', function (e) { if (dragging) setPosition(e.clientX); });

    // Touch
    handle.addEventListener('touchstart', function (e) { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchend',   function ()  { dragging = false; });
    window.addEventListener('touchmove',  function (e) {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });

    // Click anywhere on slider
    slider.addEventListener('click', function (e) { setPosition(e.clientX); });

    // Init
    setPosition(slider.getBoundingClientRect().left + slider.offsetWidth * 0.5);
  })();

  // ---- Smooth scroll with easing ----
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration) {
    var startY   = window.pageYOffset;
    var distance = targetY - startY;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function getHeaderH() {
    return document.getElementById('header').offsetHeight;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href   = this.getAttribute('href');
      var target = href === '#' ? document.body : document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderH();
      smoothScrollTo(Math.max(0, top), 900);
    });
  });

})();
