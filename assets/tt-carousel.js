/* Tootaloo — carousel controls for .tt-carousel (Phase 8 §3).
   Horizontal scroll-snap row; arrows scroll by one card + gap and disable
   at the ends. Mobile relies on native swipe (arrows are display:none). */
(function () {
  function initCarousel(root) {
    if (root.dataset.ttCarouselReady) return;
    root.dataset.ttCarouselReady = 'true';

    var track = root.querySelector('.tt-collection-row__grid');
    var prev = root.querySelector('[data-tt-carousel-prev]');
    var next = root.querySelector('[data-tt-carousel-next]');
    if (!track || !prev || !next) return;

    function step() {
      var item = track.querySelector('.tt-collection-row__item');
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }

    function atStart() {
      return track.scrollLeft <= 1;
    }
    function atEnd() {
      return track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    }

    function sync() {
      prev.disabled = atStart();
      next.disabled = atEnd();
    }

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    var raf;
    track.addEventListener('scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener('resize', sync, { passive: true });
    sync();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-tt-carousel]').forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  // Re-init when a section is re-rendered in the theme editor
  document.addEventListener('shopify:section:load', function (e) {
    initAll(e.target);
  });
})();
