(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Scroll progress bar ---------- */
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function updateProgress() {
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------- Active nav link ---------- */
  var links = [].slice.call(document.querySelectorAll('.navlinks a[href^="#"]'));
  var sections = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a, i) {
          a.classList.toggle('active', sections[i] === entry.target);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { if (s) navIO.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  function notInModal(el) { return !el.closest('.project-modal'); }
  var revealTargets = [].slice.call(
    document.querySelectorAll('.section-head, .card, .panel, .item')
  ).filter(notInModal);
  if (!reduce && 'IntersectionObserver' in window) {
    revealTargets.forEach(function (el) {
      var siblings = el.parentElement ? [].slice.call(el.parentElement.children) : [el];
      var idx = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--d', Math.min(idx, 6) * 90 + 'ms');
      el.classList.add('rv');
    });
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- 3D tilt with glare (mouse devices only) ---------- */
  if (finePointer && !reduce) {
    var tiltTargets = [].slice.call(
      document.querySelectorAll('.card, .edu .panel, .two .panel, .item')
    ).filter(notInModal);
    tiltTargets.forEach(function (el) {
      el.classList.add('tilt');
      var frame = 0;

      function reset() {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      }

      el.addEventListener('pointerenter', function () {
        el.classList.add('is-tilting');
      });

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var maxY = r.width > 700 ? 3.5 : 10;
        var maxX = r.width > 700 ? 2.5 : 8;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          el.style.setProperty('--ry', ((px - 0.5) * 2 * maxY).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - py) * 2 * maxX).toFixed(2) + 'deg');
          el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
      });

      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(frame);
        el.classList.remove('is-tilting');
        reset();
      });
    });
  }
})();
