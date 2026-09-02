/**
 * Wishlist system for Dawn (Shopify)
 * - Guest storage: localStorage (persists per-browser)
 * - Logged-in storage: syncs to a customer metafield via a small Shopify App Proxy
 *   endpoint (see /snippets/wishlist-button.liquid comments for the proxy setup).
 *   If no proxy is configured, it gracefully falls back to localStorage only.
 *
 * Public API (available on window.Wishlist):
 *   Wishlist.toggle(productId, variantId, handle)
 *   Wishlist.has(productId)
 *   Wishlist.getAll() -> array of stored entries
 *   Wishlist.count() -> number
 */

(function () {
  const STORAGE_KEY = 'dawn_wishlist_v1';
  const EVENT_UPDATED = 'wishlist:updated';

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Wishlist: failed to read localStorage', e);
      return [];
    }
  }

  function writeStore(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Wishlist: failed to write localStorage', e);
    }
    document.dispatchEvent(
      new CustomEvent(EVENT_UPDATED, { detail: { items, count: items.length } })
    );
    // Best-effort sync to customer account if logged in. This POSTs to an
    // app proxy endpoint (e.g. /apps/wishlist/save) that your backend/app
    // maps to a customer metafield. Safe no-op if the endpoint isn't set up.
    if (window.Wishlist && window.Wishlist.customerId) {
      fetch('/apps/wishlist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: window.Wishlist.customerId,
          items,
        }),
      }).catch(() => {
        /* offline or proxy not configured — localStorage remains source of truth */
      });
    }
  }

  function has(productId) {
    return readStore().some((item) => String(item.productId) === String(productId));
  }

  function toggle(productId, variantId, handle) {
    const items = readStore();
    const idx = items.findIndex((item) => String(item.productId) === String(productId));
    let added;
    if (idx > -1) {
      items.splice(idx, 1);
      added = false;
    } else {
      items.push({
        productId: String(productId),
        variantId: variantId ? String(variantId) : null,
        handle: handle || null,
        addedAt: Date.now(),
      });
      added = true;
    }
    writeStore(items);
    return added;
  }

  function getAll() {
    return readStore();
  }

  function count() {
    return readStore().length;
  }

  // On page load, if a customer is logged in and a remote copy exists,
  // merge it with local (union by productId, keep newest addedAt).
  async function hydrateFromRemote(customerId) {
    if (!customerId) return;
    try {
      const res = await fetch(`/apps/wishlist/get?customer_id=${encodeURIComponent(customerId)}`);
      if (!res.ok) return;
      const remote = await res.json();
      if (!Array.isArray(remote.items)) return;

      const local = readStore();
      const merged = new Map();
      [...remote.items, ...local].forEach((item) => {
        const key = String(item.productId);
        const existing = merged.get(key);
        if (!existing || (item.addedAt || 0) > (existing.addedAt || 0)) {
          merged.set(key, item);
        }
      });
      writeStore(Array.from(merged.values()));
    } catch (e) {
      // proxy not configured / offline — silently keep local-only wishlist
    }
  }

  window.Wishlist = {
    toggle,
    has,
    getAll,
    count,
    EVENT_UPDATED,
    customerId: window.__WISHLIST_CUSTOMER_ID__ || null,
    hydrateFromRemote,
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.Wishlist.customerId) {
      hydrateFromRemote(window.Wishlist.customerId);
    }
    // Initialize all heart buttons currently on the page
    document.querySelectorAll('[data-wishlist-toggle]').forEach(initButton);
    updateAllCounts();
  });

  document.addEventListener(EVENT_UPDATED, updateAllCounts);

  function updateAllCounts() {
    const n = count();
    document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  function initButton(btn) {
    const productId = btn.getAttribute('data-product-id');
    const variantId = btn.getAttribute('data-variant-id');
    const handle = btn.getAttribute('data-product-handle');

    setButtonState(btn, has(productId));

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const added = toggle(productId, variantId, handle);
      setButtonState(btn, added);
      // Also update any duplicate buttons for the same product elsewhere on the page
      document
        .querySelectorAll(`[data-wishlist-toggle][data-product-id="${productId}"]`)
        .forEach((el) => setButtonState(el, added));
    });
  }

  function setButtonState(btn, active) {
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      active ? 'Remove from wishlist' : 'Add to wishlist'
    );
  }
})();
