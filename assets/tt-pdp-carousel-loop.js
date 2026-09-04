/**
 * Makes the PDP's desktop filmstrip gallery loop: scrolling/swiping past
 * the last image wraps seamlessly back to the first, and past the first
 * wraps back to the last. Native `overflow-x: auto` has no concept of
 * looping on its own, so this clones the real slides once at each end and
 * jumps `scrollLeft` back into the real set whenever the user lands deep
 * in a clone — the same technique carousel libraries (Swiper, Slick, etc.)
 * use for infinite mode.
 *
 * The jump only ever happens once scrolling has fully stopped (via the
 * `scrollend` event, with a debounced `scroll` fallback for browsers that
 * don't support it yet) — never mid-gesture. Doing it while momentum
 * scrolling or scroll-snap settling is still in progress is what caused
 * the earlier glitchy jump/stutter; waiting for a full stop means the
 * swap only ever happens while the user is looking at a static frame,
 * where it's invisible (the clone and its real counterpart are identical).
 *
 * Slide widths are read live via ResizeObserver rather than measured once
 * on load — the filmstrip's height (and so every slide's width, which is
 * derived from height × aspect ratio) depends on --header-height, which
 * header.liquid sets slightly after page load via JS. A one-time
 * measurement could go stale the moment that changes, which was the other
 * source of glitching (wrong jump distance landing back inside a clone,
 * triggering another jump).
 *
 * Desktop only (min-width: 990px) — the mobile layout is a plain vertical
 * stack meant to scroll with the page, not a carousel, so it's left alone.
 */
(() => {
  const BREAKPOINT = '(min-width: 990px)';

  class TTPdpCarouselLoop {
    constructor(list) {
      this.list = list;
      this.originals = Array.from(list.children);
      if (this.originals.length < 2) return;

      this.looping = false;
      this.cloneStartEls = [];
      this.cloneEndEls = [];
      this.realWidth = 0;
      this.startWidth = 0;
      this.endWidth = 0;
      this.recalcRaf = null;
      this.scrollEndSupported = 'onscrollend' in window;
      this.scrollDebounceTimer = null;

      this.handleScrollEnd = this.handleScrollEnd.bind(this);
      this.handleScrollDebounced = this.handleScrollDebounced.bind(this);
      this.handleBreakpointChange = this.handleBreakpointChange.bind(this);
      this.scheduleRecalculate = this.scheduleRecalculate.bind(this);

      this.resizeObserver = window.ResizeObserver ? new ResizeObserver(this.scheduleRecalculate) : null;

      this.mediaQuery = window.matchMedia(BREAKPOINT);
      this.mediaQuery.addEventListener('change', this.handleBreakpointChange);
      this.handleBreakpointChange();
    }

    handleBreakpointChange() {
      if (this.mediaQuery.matches) {
        this.enable();
      } else {
        this.disable();
      }
    }

    enable() {
      if (this.looping) return;
      this.looping = true;

      this.cloneStartEls = this.originals.map((el) => this.cloneItem(el));
      this.cloneEndEls = this.originals.map((el) => this.cloneItem(el));

      [...this.cloneStartEls].reverse().forEach((el) => this.list.insertBefore(el, this.list.firstChild));
      this.cloneEndEls.forEach((el) => this.list.appendChild(el));

      if (this.scrollEndSupported) {
        this.list.addEventListener('scrollend', this.handleScrollEnd);
      } else {
        this.list.addEventListener('scroll', this.handleScrollDebounced, { passive: true });
      }

      if (this.resizeObserver) {
        this.originals.forEach((el) => this.resizeObserver.observe(el));
      }

      // Let layout settle (widths depend on CSS custom properties already
      // present on the cloned markup, not on images finishing loading),
      // measure, and start the view at the real first slide.
      requestAnimationFrame(() => {
        this.recalculate();
        this.list.scrollLeft = this.startWidth;
      });
    }

    disable() {
      if (!this.looping) return;
      this.looping = false;
      this.list.removeEventListener('scrollend', this.handleScrollEnd);
      this.list.removeEventListener('scroll', this.handleScrollDebounced);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.recalcRaf) cancelAnimationFrame(this.recalcRaf);
      if (this.scrollDebounceTimer) clearTimeout(this.scrollDebounceTimer);
      this.cloneStartEls.forEach((el) => el.remove());
      this.cloneEndEls.forEach((el) => el.remove());
      this.cloneStartEls = [];
      this.cloneEndEls = [];
      this.list.scrollLeft = 0;
    }

    cloneItem(el) {
      const clone = el.cloneNode(true);
      clone.classList.add('tt-carousel-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((node) => {
        node.setAttribute('tabindex', '-1');
        if (node.tagName === 'A' || node.tagName === 'BUTTON') node.setAttribute('aria-hidden', 'true');
      });
      // The real first slide loads eagerly; its clone (which sits off-screen
      // at the far end of the loop) shouldn't also load eagerly.
      clone.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));
      return clone;
    }

    getSetWidth(els) {
      return els.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    }

    scheduleRecalculate() {
      if (this.recalcRaf) return;
      this.recalcRaf = requestAnimationFrame(() => {
        this.recalcRaf = null;
        // If the user hasn't scrolled away from the start yet, keep them
        // pinned to the (possibly now-shifted) real first slide — this is
        // what actually happens in practice, since --header-height settles
        // in within the first frame or two, before anyone's had a chance
        // to scroll. If they have scrolled elsewhere, leave their position
        // alone rather than risk moving it under them.
        const wasAtStart = this.realWidth === 0 || Math.abs(this.list.scrollLeft - this.startWidth) < 2;
        this.recalculate();
        if (wasAtStart) this.list.scrollLeft = this.startWidth;
      });
    }

    recalculate() {
      this.startWidth = this.getSetWidth(this.cloneStartEls);
      this.endWidth = this.getSetWidth(this.cloneEndEls);
      this.realWidth = this.getSetWidth(this.originals);
    }

    handleScrollDebounced() {
      if (this.scrollDebounceTimer) clearTimeout(this.scrollDebounceTimer);
      this.scrollDebounceTimer = setTimeout(this.handleScrollEnd, 120);
    }

    handleScrollEnd() {
      if (!this.looping || !this.realWidth) return;

      const maxScroll = this.list.scrollWidth - this.list.clientWidth;

      if (this.list.scrollLeft < this.startWidth * 0.5) {
        this.list.scrollLeft += this.realWidth;
      } else if (this.list.scrollLeft > maxScroll - this.endWidth * 0.5) {
        this.list.scrollLeft -= this.realWidth;
      }
    }
  }

  function init() {
    document.querySelectorAll('.product__media-wrapper .product__media-list').forEach((list) => {
      if (list.dataset.ttLoopInit) return;
      list.dataset.ttLoopInit = 'true';
      new TTPdpCarouselLoop(list);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
