// ============================================================
// PMK Remodeling LLC — Scripts
// ============================================================

(function () {
  'use strict';

  // ---- Header scroll effect ----
  const header     = document.getElementById('header');
  const floatingCta = document.getElementById('floatingCta');

  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    floatingCta.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // ---- Mobile nav ----
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { nav.classList.remove('open'); });
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) nav.classList.remove('open');
  });

  // ---- Smooth anchor scroll (native — no conflicts with CSS) ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href   = this.getAttribute('href');
      var target = href === '#' ? document.body : document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerH = header.offsetHeight;
      var top     = target.getBoundingClientRect().top + window.pageYOffset - headerH;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });

  // ---- Scroll reveal ----
  const revealTargets = document.querySelectorAll(
    '.coverage-item, .why-split-card, .realtor-card, .value-card, .contact-grid, .ba-stat'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealTargets.forEach(function (el) { el.classList.add('revealed'); });
  }

  // ---- Contact form — real API ----
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled    = true;

      try {
        const res  = await fetch('/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    form.name.value,
            phone:   form.phone.value,
            email:   form.email.value,
            service: form.service.value,
            message: form.message.value,
          }),
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          formSuccess.classList.add('show');
          setTimeout(function () { formSuccess.classList.remove('show'); }, 5000);
        }
      } catch (err) {
        console.error('Form error:', err);
      } finally {
        btn.textContent = 'Send Message →';
        btn.disabled    = false;
      }
    });
  }

  // ---- Before / After Slider ----
  (function () {
    var slider = document.getElementById('baSlider');
    var before = document.getElementById('baBeforeLayer');
    var handle = document.getElementById('baHandle');
    if (!slider || !before || !handle) return;

    var dragging = false;

    function setPosition(x) {
      var rect = slider.getBoundingClientRect();
      var pct  = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      before.style.width = pct + '%';
      handle.style.left  = pct + '%';
      before.style.setProperty('--ba-full-w', (100 / (pct / 100 || 0.001)).toFixed(2) + '%');
    }

    // Mouse
    handle.addEventListener('mousedown', function (e) { dragging = true; e.preventDefault(); });
    window.addEventListener('mouseup',   function ()  { dragging = false; });
    window.addEventListener('mousemove', function (e) { if (dragging) setPosition(e.clientX); }, { passive: true });

    // Touch
    handle.addEventListener('touchstart', function (e) { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchend',   function ()  { dragging = false; });
    window.addEventListener('touchmove',  function (e) { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });

    // Click anywhere on slider
    slider.addEventListener('click', function (e) { setPosition(e.clientX); });

    // Init at 50%
    setPosition(slider.getBoundingClientRect().left + slider.offsetWidth * 0.5);
  })();

  // ---- Gallery marquee (JS-driven for cross-browser reliability) ----
  (function () {
    var tracks = document.querySelectorAll('.gallery-track');
    if (!tracks.length) return;

    var SLIDE_W   = 340;
    var SLIDE_GAP = 12;
    var SLOT      = SLIDE_W + SLIDE_GAP;   // 352px
    var SET_COUNT = 6;                      // 6 originals + 6 duplicates
    var LOOP_W    = SLOT * SET_COUNT;       // 2112px = distance to loop

    var speed  = 0.7;   // px per rAF frame  (~42px/s at 60fps)
    var paused = false;

    // Position state: left track starts at 0, right at -LOOP_W
    var positions = [];
    tracks.forEach(function (track, i) {
      var isRight = track.classList.contains('gallery-track--right');
      positions[i] = isRight ? -LOOP_W : 0;

      // Set initial transform
      track.style.transform = 'translateX(' + positions[i] + 'px)';

      // Pause on hover
      track.closest('.gallery-track-wrap').addEventListener('mouseenter', function () { paused = true; });
      track.closest('.gallery-track-wrap').addEventListener('mouseleave', function () { paused = false; });
    });

    function tick() {
      if (!paused) {
        tracks.forEach(function (track, i) {
          var isRight = track.classList.contains('gallery-track--right');
          positions[i] += isRight ? speed : -speed;

          // Loop seamlessly
          if (!isRight && positions[i] <= -LOOP_W) positions[i] += LOOP_W;
          if (isRight  && positions[i] >= 0)       positions[i] -= LOOP_W;

          track.style.transform = 'translateX(' + positions[i] + 'px)';
        });
      }
      requestAnimationFrame(tick);
    }

    // Update slide/img dimensions from CSS (responsive)
    function updateDimensions() {
      var slide = document.querySelector('.gallery-slide');
      if (!slide) return;
      var w = slide.offsetWidth;
      var g = parseInt(window.getComputedStyle(slide).marginRight) || 12;
      SLOT   = w + g;
      LOOP_W = SLOT * SET_COUNT;
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    requestAnimationFrame(tick);
  })();

})();
