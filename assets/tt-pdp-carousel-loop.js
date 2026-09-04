/**
 * Makes the PDP's desktop filmstrip gallery loop: scrolling/swiping past
 * the last image wraps seamlessly back to the first, and past the first
 * wraps back to the last. Native `overflow-x: auto` has no concept of
 * looping on its own, so this clones the real slides once at each end and
 * silently jumps `scrollLeft` back into the real set whenever the user
 * scrolls deep enough into a clone — the same technique carousel libraries
 * (Swiper, Slick, etc.) use for infinite mode.
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
      this.raf = null;

      this.handleScroll = this.handleScroll.bind(this);
      this.handleBreakpointChange = this.handleBreakpointChange.bind(this);

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

      // Let layout settle (widths depend on CSS custom properties already
      // present on the cloned markup, not on images finishing loading) then
      // measure and jump to the start of the real set.
      requestAnimationFrame(() => {
        this.realWidth = this.getSetWidth(this.originals);
        this.list.scrollLeft = this.getSetWidth(this.cloneStartEls);
        this.list.addEventListener('scroll', this.handleScroll, { passive: true });
      });
    }

    disable() {
      if (!this.looping) return;
      this.looping = false;
      this.list.removeEventListener('scroll', this.handleScroll);
      if (this.raf) cancelAnimationFrame(this.raf);
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

    handleScroll() {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = null;
        if (!this.looping || !this.realWidth) return;

        const startWidth = this.getSetWidth(this.cloneStartEls);
        const endWidth = this.getSetWidth(this.cloneEndEls);
        const maxScroll = this.list.scrollWidth - this.list.clientWidth;

        if (this.list.scrollLeft < startWidth * 0.5) {
          this.list.scrollLeft += this.realWidth;
        } else if (this.list.scrollLeft > maxScroll - endWidth * 0.5) {
          this.list.scrollLeft -= this.realWidth;
        }
      });
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
