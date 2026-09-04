# File manifest — Tootaloo theme

Every file touched since `baseline-live-20260902` (the live theme verbatim), plus what phase-7 would touch.
`A` = new file, `M` = modified from Dawn's original. Full per-file history is in `../CHANGELOG.md`.

## Design system (the source of truth)

| Path | | Role |
|---|---|---|
| `snippets/tootaloo-tokens.liquid` | A | **The token file.** All `--tt-*` custom properties: type scale, spacing `8/16/24/40/64/96/160`, layout/grid/gutter/sidebar/header/sticky, aspect ratios, motion. Rendered once in `<head>` before `base.css`. |
| `assets/tootaloo-system.css` | A | The layer that consumes the tokens: type roles, heading normalisation, `.page-width`, `.tt-media` ratio system, product card, collection grid, PDP, header, footer, newsletter, wishlist, sold-state, `grid__item--featured/--hero` spans. Loaded after `base.css`. |
| `assets/tt-modules.css` | A | Homepage module + drop/story/brand styles. Loaded per-section by the module sections only. |
| `layout/theme.liquid` | M | 2-line change: `{% render 'tootaloo-tokens' %}` before `base.css`; `{{ 'tootaloo-system.css' ... }}` after. |
| `config/settings_data.json` | M | Merchant theme settings (below). |

## Product page (PDP)

| Path | | Role |
|---|---|---|
| `sections/main-product.liquid` | M | Vintage blocks rewritten onto the metafield model; new `vintage_sizing` block; variant picker + quantity stepper hidden for one-of-ones; final-sale note from `spec.one_of_one`; block order reworked. |
| `snippets/product-measurements.liquid` | A | `product.type` → ordered `measure.*` key map. `dimension` values render `"17 in"`. Empty-safe. |
| `assets/component-vintage-details.css` | M | Condition / measurements / details / sizing styling, on tokens. |
| `templates/product.json` | M | Added `vintage_sizing`; deep metadata moved below the buy buttons. |
| `snippets/product-variant-picker.liquid` | *(untouched)* | Dawn's — real variant system. See VARIANT WIRING below. |

## Shop All / collection

| Path | | Role |
|---|---|---|
| `sections/main-collection-product-grid.liquid` | M | Sidebar layout on tokens; `merch.display_priority` → grid span classes; skips sold pieces flagged `merch.keep_in_archive == 'false'`. |
| `snippets/card-product.liquid` | M | Vendor renders **above** the title (`.card__vendor` / `tt-vendor`). |
| `snippets/category-sidebar-nav.liquid` | M | Reads a Shopify nav menu (`shop-sidebar` handle). Visually-hidden-checkbox disclosure: "Categories" toggle on mobile, forced open ≥990. |
| `snippets/facets.liquid` | M | Price-range filter skipped in every loop (desktop / mobile / pills). Otherwise Dawn's. |
| `assets/component-collection-hero.css` | M | Collection banner, on tokens. |
| `templates/collection.json` | M | `show_vendor: true`, portrait ratio, section padding on scale. |

## Home

| Path | | Role |
|---|---|---|
| `sections/hero-wordmark.liquid` | M | Rebuilt: oversized wordmark, height/placement/scrim/eyebrow/link/mobile-image schema, empty-state placeholder. |
| `sections/collection-tile-grid.liquid` | M | Tile grid (image + name + link), on tokens, left-aligned labels. |
| `templates/index.json` | M | Homepage composition: hero → Current Drop → tile grid → Recently Sold. Real collections, no invented copy. |

## Homepage / merchandising modules (8 editor entries, 4 files)

| Path | | Role |
|---|---|---|
| `sections/tt-collection-row.liquid` | A | Presets: Current Drop · Just In · Recently Sold · Archive Teaser · Vintage Module. |
| `sections/featured-piece.liquid` | A | One product, large. |
| `sections/brand-feature.liquid` | A | Brand name + text + image + link + optional product row. |
| `sections/editorial-image.liquid` | A | Story image; below / beside / overlaid text. Hidden on live when empty. |
| `snippets/tt-module-header.liquid` | A | Shared heading / eyebrow / text / link for all modules. |
| `snippets/tt-product-grid.liquid` | A | Shared product-grid engine (collection *or* products array; sold treatment; weight spans). Used by `tt-collection-row`, `main-drop`, `main-story`. |

## Drop / story / brand pages (live, need Admin objects to render)

| Path | | Role |
|---|---|---|
| `sections/main-drop.liquid` | A | Renders a `drop` metaobject. |
| `templates/metaobject.drop.liquid` | A | `{% section 'main-drop' %}` — **must be `.liquid`**, Shopify rejects metaobject JSON templates. |
| `sections/main-story.liquid` | A | Renders a `story` metaobject. |
| `templates/metaobject.story.liquid` | A | `{% section 'main-story' %}`. |
| `sections/brand-header.liquid` | A | Reads `collection.metafields.brand.*` with fallback to collection title/description. |
| `templates/collection.brand.json` | A | `brand-header` + `main-collection-product-grid`. Assign to a smart collection per vendor. |

## Global

| Path | | Role |
|---|---|---|
| `sections/header.liquid` | M | 1-line change: header horizontal padding uses `--tt-gutter`. |
| `assets/wishlist.css` | M | Heart chip on tokens — sharp, no white pill, drop-shadow. |
| `assets/component-blog-editorial.css` | M | Blog / article ("The Mag") restyle, on tokens. |
| `sections/main-search.liquid` | M | 1-line: search `<h1>` left-aligned, `.h1` scale. |

## Not touched (still Dawn stock — relevant to the skeleton reconcile)

`sections/footer.liquid`, `sections/footer-group.json` (footer content is merchant menu blocks) ·
`sections/header-group.json` (announcement bar + header) ·
`sections/newsletter.liquid`, `sections/email-signup-banner.liquid` (styled via `tootaloo-system.css` §10, markup unchanged) ·
`sections/cart-*`, `sections/main-cart-*`, `snippets/cart-*` (checkout path — brief §24: keep normal) ·
`snippets/buy-buttons.liquid`, `snippets/price.liquid`, `snippets/quantity-input.liquid`, `snippets/product-variant-picker.liquid` (typographic tokens reach them; structure unchanged) ·
`sections/main-blog.liquid`, `sections/main-article.liquid` (restyled via CSS only) ·
`assets/base.css` (Dawn's — never edited; `tootaloo-system.css` overrides on top)

---

## Phase 7 (proposed — the wireframe-skeleton reconcile) would touch

*Not started — awaiting direction on scope + aesthetic.*

| Likely path | Change |
|---|---|
| `sections/editorial-cards.liquid` *(new)* | The "Tootaloo Mag" homepage section — N article cards (kicker / headline / dek / Read More) from a chosen blog. Currently missing. |
| `assets/tt-modules.css` | Styles for the above. |
| `templates/index.json` | Place the Mag section. |
| `snippets/tootaloo-tokens.liquid` *(only if aesthetic shifts)* | `--tt-font-display` / `--tt-font-grotesk` swap, tracking/weight for a bolder direction. |
| `config/settings_data.json` *(only if aesthetic shifts)* | `type_header_font` / `type_body_font`; border/card settings if going boxy. |
| `assets/tootaloo-system.css` *(only if aesthetic shifts)* | Border rules if the skeleton's hard-border look is adopted. |
