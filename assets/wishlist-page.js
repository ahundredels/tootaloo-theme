(function () {
  async function fetchProduct(handle) {
    const res = await fetch(`/products/${handle}.js`);
    if (!res.ok) return null;
    return res.json();
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  async function refreshCartBubble() {
    try {
      const res = await fetch('/?section_id=cart-icon-bubble');
      if (!res.ok) return;
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const wrapper = doc.querySelector('.shopify-section');
      const target = document.getElementById('cart-icon-bubble');
      if (target) target.innerHTML = wrapper ? wrapper.innerHTML : doc.body.innerHTML;
    } catch (e) {
      /* non-critical */
    }
  }

  async function addAllToCart() {
    const btn = document.getElementById('wishlist-add-all');
    const status = document.getElementById('wishlist-add-all-status');
    if (!btn || btn.disabled) return;

    const label = btn.querySelector('.wishlist-add-all__label');
    const originalLabel = label.textContent;
    const items = window.Wishlist.getAll().filter((i) => i.handle);
    if (items.length === 0) return;

    btn.disabled = true;
    btn.classList.add('is-loading');
    label.textContent = 'Adding…';
    status.textContent = '';

    const products = await Promise.all(items.map((i) => fetchProduct(i.handle)));

    const lineItems = [];
    let skipped = 0;
    products.forEach((product, i) => {
      if (!product) {
        skipped++;
        return;
      }
      const saved = items[i];
      let variant = null;
      if (product.variants.length === 1) {
        variant = product.variants[0];
      } else if (saved.variantId) {
        variant =
          product.variants.find((v) => String(v.id) === String(saved.variantId)) || null;
      }
      if (variant && variant.available) {
        lineItems.push({ id: variant.id, quantity: 1 });
      } else {
        skipped++;
      }
    });

    const reset = () => {
      label.textContent = originalLabel;
      btn.disabled = false;
      btn.classList.remove('is-loading');
    };

    if (lineItems.length === 0) {
      reset();
      status.textContent =
        'Nothing could be added — open items to choose a size or check stock.';
      return;
    }

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: lineItems }),
      });
      if (!res.ok) throw new Error('cart add failed');

      await refreshCartBubble();

      label.textContent = 'Added ✓';
      status.textContent =
        `Added ${lineItems.length} item${lineItems.length === 1 ? '' : 's'} to cart` +
        (skipped ? ` · ${skipped} skipped (needs a size or out of stock)` : '');

      setTimeout(reset, 2500);
    } catch (e) {
      reset();
      status.textContent = 'Something went wrong adding to cart. Please try again.';
    }
  }

  async function render() {
    const grid = document.getElementById('wishlist-grid');
    const empty = document.getElementById('wishlist-empty');
    const actions = document.getElementById('wishlist-actions');
    const template = document.getElementById('wishlist-card-template');
    const items = window.Wishlist.getAll();

    grid.innerHTML = '';

    if (items.length === 0) {
      empty.hidden = false;
      if (actions) actions.hidden = true;
      return;
    }
    empty.hidden = true;
    if (actions) actions.hidden = false;

    const products = await Promise.all(
      items.filter((i) => i.handle).map((i) => fetchProduct(i.handle))
    );

    products.forEach((product, i) => {
      if (!product) return; // product may have been deleted/unpublished since saving
      const node = template.content.cloneNode(true);
      const link = node.querySelector('.wishlist-card__link');
      const img = node.querySelector('.wishlist-card__image');
      const title = node.querySelector('.wishlist-card__title');
      const price = node.querySelector('.wishlist-card__price');
      const remove = node.querySelector('.wishlist-card__remove');

      link.href = `/products/${product.handle}`;
      img.src = product.featured_image || (product.images[0] || '');
      img.alt = product.title;
      title.textContent = product.title;
      price.textContent = formatMoney(product.price);

      remove.addEventListener('click', () => {
        window.Wishlist.toggle(product.id, null, product.handle);
        render();
      });

      grid.appendChild(node);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('wishlist-add-all');
    if (btn) btn.addEventListener('click', addAllToCart);
    render();
  });
  document.addEventListener(
    window.Wishlist ? window.Wishlist.EVENT_UPDATED : 'wishlist:updated',
    render
  );
})();
