# Tootaloo theme — changelog

Live theme: **Tootaloo Build** (`#158384619675`), store `3a04r6-x5.myshopify.com`.
Base: Shopify **Dawn 16.0.0**. Working branch `phase-1-2-design-system`.
Baseline (live theme verbatim, pre-work): tag `baseline-live-20260902`, commit `497e51b`.
Every phase is committed, tagged, pushed to live, and verified byte-identical via `shopify theme pull` diff.

The design system lives in two files: `snippets/tootaloo-tokens.liquid` (the `--tt-*` custom properties) and `assets/tootaloo-system.css` (the layer that consumes them). Neither chooses final fonts, colours or imagery — those stay in Theme settings and per-section image slots.

---

## Phase 0 — Safety (2026-09-02) · tag `baseline-live-20260902`
- `git init` on the theme directory (was not version-controlled). Committed the live theme verbatim; verified byte-identical.
- Kept a separate clean backup outside the repo at `~/tootaloo-theme-backups/live-158384619675-20260902/` (+ `.zip`).
- **Why:** a multi-phase rewrite against a live theme with no VCS and no staging needed a reversible baseline first.

## Phase 1 — Design-token foundation (2026-09-02) · commit `5674199`
- **new** `snippets/tootaloo-tokens.liquid` — single source of truth: fluid type scale (`--tt-fs-*`), spacing scale `8/16/24/40/64/96/160` (`--tt-space-*`), layout/grid/gutter/sidebar/header/sticky/aspect-ratio tokens, motion tokens. All `--tt-` prefixed. Mobile spacing ramp + `prefers-reduced-motion` handled.
- **new** `assets/tootaloo-system.css` — type-role utilities, heading normalisation, layout containers, media/ratio system, product card, collection grid, PDP, header, footer, newsletter, wishlist, sold-state, multi-weight grid spans.
- `layout/theme.liquid` — render tokens before `base.css`; load `tootaloo-system.css` after so it wins.
- Two type voices aliased to the existing Theme settings font pickers (`--tt-font-display` ← Heading font, `--tt-font-grotesk` ← Body font) so the final typeface stays open.
- **Why:** every custom section carried hardcoded rem/px in its own `{% stylesheet %}`. One coherent token layer so the site stops reading as stock Dawn.

## Phase 2 — Refactor existing surfaces onto tokens (2026-09-02) · commits `0d25220`, `2a6b3e3`
- Rebuilt `sections/hero-wordmark.liquid` (token CSS, expanded but neutral schema: height, placement, scrim, eyebrow, link, mobile image; empty state → placeholder).
- `sections/collection-tile-grid.liquid`, `snippets/category-sidebar-nav.liquid`, `sections/main-collection-product-grid.liquid` (sidebar layout), `sections/header.liquid` (gutter) — onto tokens.
- `snippets/card-product.liquid` — **vendor now renders above the product title** (`tt-vendor` role).
- CSS assets refactored to tokens: `component-vintage-details.css`, `component-collection-hero.css`, `component-blog-editorial.css`, `wishlist.css` (heart chip simplified — sharp, no white pill).
- `config/settings_data.json` (deliberate): `page_width` 1200→1600; `spacing_sections` 0→24 (later →0, see Phase 6); `animations_reveal_on_scroll` true→**false** (brief §22); `card_border_opacity` 10→0; `badge_corner_radius` 40→0.
- `templates/product.json`, `templates/collection.json` — section padding onto the scale.
- **Why:** make the pages that already exist operate from the one system.

## Phase 2.5 — Verification against real product data (2026-09-02) · tag `phase-2.5-verified-20260902` · commit `2831b28`
- Verified against 2 live products (one-of-one vintage tee, multi-variant Field Studies belt).
- `templates/collection.json` — Shop All now shows vendor on cards, portrait image ratio (was `adapt`, ragged rows), secondary image on hover.
- `assets/tootaloo-system.css` — **continuous stacked PDP gallery**: Dawn dropped images 2+ to half width in a wrap layout; every frame is now full column width, evenly spaced (LTTT-style scroll).
- `assets/component-collection-hero.css` — collection title tight to the grid.

## Phase 3 — Vintage PDP blocks onto the new metafield model (2026-09-03) · tag `phase-3-metafields-20260903` · commits `7bb585b`, `d95fcd5`
- **24 V1 metafield definitions created in Admin** by the merchant. 6 namespaces: `spec` `sizing` `measure` `condition` `construction` `merch`. Booleans stored as `single_line_text` with `true`/`false` choices — the theme reads them as **strings** (`== 'true'`), never native booleans.
- `sections/main-product.liquid` — all three vintage blocks rewritten onto the new namespaces:
  - `vintage_condition` → `condition.grade` + `spec.piece_status` chip + `condition.notes` + `condition.flaws` list
  - `vintage_measurements` → renders via **new** `snippets/product-measurements.liquid` (a `product.type` → ordered measurement-key map; `dimension` values render `"17 in"`)
  - `vintage_details` → era / year / origin / original tag / material / construction, each conditional
  - **new block** `vintage_sizing` — one-of-one indicator + tagged size + fit note
  - final-sale note now derives from `spec.one_of_one == 'true'` (was `custom.final_sale`)
  - **variant picker hidden** when `product.variants.size == 1` — a one-of-one is not a size choice
  - **quantity stepper hidden** when `spec.one_of_one == 'true'` or the product is a single inventory-tracked deny-oos piece with qty ≤ 1
- `assets/component-vintage-details.css` — rewritten for the new markup, tokens.
- `templates/product.json` — added `vintage_sizing`; reordered so deep metadata sits below the buy buttons (brief §7).
- Migrated off all `custom.*` fields.
- **Data model spec artifact:** https://claude.ai/code/artifact/f1d763dc-5fb1-495c-8887-f47bb267f414

## Phase 4/5 — Homepage modules + multi-weight grid (2026-09-03) · tag `phase-4-5-modules-20260903` · commits `a72ba81`, `f0f09cb`
- **8 editor entries from 4 section files**, all empty/configurable, zero baked imagery:
  - **new** `sections/tt-collection-row.liquid` — presets *Current Drop · Just In · Recently Sold · Archive Teaser · Vintage Module*. Heading + product row/grid from a collection + link. Sold pieces dimmed + "Sold `<month>`" from `merch.archive_date`; pieces flagged `merch.keep_in_archive == 'false'` skipped.
  - **new** `sections/featured-piece.liquid` — one product, large image + vendor/name/price/link → PDP.
  - **new** `sections/brand-feature.liquid` — brand name + text + image + link + optional product row.
  - **new** `sections/editorial-image.liquid` — story image (full-bleed / wide / constrained, cropped or natural, text below / beside / overlaid). Hidden on live when empty.
  - **new** `snippets/tt-module-header.liquid` — shared heading / eyebrow / text / link.
  - **new** `assets/tt-modules.css` — token-driven, loaded per-module.
- **Multi-weight collection grid (§9):** `sections/main-collection-product-grid.liquid` reads `merch.display_priority` → `grid__item--featured` (span 2) / `grid__item--hero` (full row); CSS in `tootaloo-system.css`. Same file skips sold pieces flagged `keep_in_archive == 'false'`.
- `templates/index.json` — real homepage skeleton (hero → Current Drop → tile grid → Recently Sold), pointed at real collections, no invented copy.
- `snippets/facets.liquid` — **price-range filter removed** from Shop All + search (skipped in every filter loop, desktop + mobile + pills).

## Phase 5 — Drop / story / brand templates (2026-09-03) · tag `phase-5-templates-20260903` · commit `118017a`
- Routing (approved): drops = a `drop` metaobject + a linked collection; brands = a smart collection per vendor + a `brand.*` collection-metafield namespace (no `brand_room` metaobject).
- **new** `snippets/tt-product-grid.liquid` — the shared product-grid engine (takes a collection *or* a products array; sold treatment; `merch.display_priority` weighting). `tt-collection-row` refactored to use it.
- **new** `sections/main-drop.liquid` + `templates/metaobject.drop.liquid` — renders a `drop` metaobject as an exhibition: hero, intro, hero piece, the drop's collection grid, story images, closing note. `Archived` status → sold-friendly treatment.
- **new** `sections/main-story.liquid` + `templates/metaobject.story.liquid` — renders a `story` metaobject: cover, body at reading measure, gallery, linked-pieces row.
- **new** `sections/brand-header.liquid` + `templates/collection.brand.json` — brand page = smart collection + `brand.*` metafields (tagline, description, hero, accent, established, link) with fallback to the collection's own title/description. Reuses `main-collection-product-grid` for products.
- **Metaobject templates must be `.liquid`** on this theme — Shopify rejects JSON (`Template type 'metaobject' does not support JSON templates`).
- **Admin still required** for these pages to render: `drop` + `story` metaobject definitions (fields in the artifact) with Storefront access + URL; `brand.*` collection metafields; a smart collection per vendor on the `collection.brand` template; "Recently Sold" + "Archive" smart collections (rule `tag = sold`); a `sold` tag applied at point of sale + `merch.archive_date` set.

## Phase 6 — QA sweep (2026-09-03) · tags `phase-6-qa-pass1-20260903`, `phase-6-mobile-fixes-20260903` · commits `4c7bab7`, `f0a7a84`
- **Pass 1** (desktop sweep of home / collection / PDP×2 / cart / search / blog / wishlist / 404 / contact):
  - `settings_data.json`: `spacing_sections` 24→**0** (every section owns its own token padding; the +24 was double-counting); `variant_pills_radius` 40→**0**; `collection_card_border_opacity` / `blog_card_border_opacity` 10→0.
  - `templates/index.json` — dropped Editorial Image from the default homepage (grey void without a real image; still in the picker); module padding 96→72.
  - `sections/tt-collection-row.liquid` — preset padding 96→72.
  - `sections/main-search.liquid` — search `<h1>` left-aligned on the `.h1` scale (was centred `.h2`) — consistent with every other page heading.
- **Two real-device mobile bugs fixed:**
  - Product grid rendered 1-up on mobile. Cause: the Phase-2 `.product-grid.grid` `column-gap` override desynced Dawn's flex gap from its `.grid__item` width calc → overflow → wrap. Removed the override; grid gap now flows from `spacing_grid_horizontal` (8→16) / `spacing_grid_vertical` (8→40).
  - Category sidebar rendered the full open taxonomy above products on mobile. Now a visually-hidden-checkbox disclosure in `snippets/category-sidebar-nav.liquid` — a "Categories" toggle on mobile, forced-open with the toggle hidden at ≥990. (Checkbox, not `<details>` — current Chrome's `content-visibility` on a closed `<details>` can't be beaten by an author `display` rule, which broke the desktop force-open.)

## Phase 7 — Wireframe parity pass (2026-09-03) · in progress

Reconciled against the "Tootaloo — Design Breakdown & Build Spec" (checkpoint doc). Building to the 7 wireframes: all-caps, hard 1px black edges, radius 0. Section numbering follows the doc (§1 global → §6 QA).

### §1 — Global / design tokens · tag `phase-7-s1-global-20260903` · commit `017ced2`
- **0.1 resolved — fonts:** `type_header_font` → `archivo_black_n4`, `type_body_font` → `archivo_n4` (Dawn derives bold `archivo_n7`). Both voices (`--tt-font-display` / `--tt-font-grotesk`) already alias these settings, so no CSS change. "Arial" was Assistant failing to load → generic fallback; nothing was ever set to Arial.
- **0.2 resolved — width:** `page_width` 1600 → **1400** (Dawn's picker nearest the skeleton's 1440). `--tt-content-max` 150→**140rem**, `--tt-content-wide` 176→**160rem** so the token layer and Dawn agree.
- **0.3 — wordmark:** **new** `assets/tootaloo-wordmark.svg` (the real logo, single path, `fill: currentColor`, viewBox 1144×268) rendered inline by **new** `snippets/tootaloo-logo.liquid` via `inline_asset_content`. `sections/header.liquid` — both logo blocks now fall through to `{% render 'tootaloo-logo' %}` instead of `<span class="h2">{{ shop.name }}</span>`. A merchant-uploaded raster logo (`settings.logo`) still takes precedence. Footer + mobile-drawer wordmark deferred to §5 / §2.
- **new tokens:** `--tt-border-width` `--tt-border` `--tt-border-hairline` `--tt-radius`.
- `assets/tootaloo-system.css` **§14 (new):** uppercase on `.button` / `.card__heading` / `.product__title` / `.pagination__item` / accordion + footer headings / `.collection-hero__title`; 1px black edges on category tiles, search inputs, sold-out card inners, and the PLP sidebar container at ≥990 (persistent bordered box per wireframe §3); `border-radius: 0` belt-and-braces on buttons/inputs/selects/cards. `.shopify-payment-button__button` explicitly left `text-transform: none`.
- **Breakpoints:** stay on Dawn's 750 / 990. The skeleton's 900 is **not** introduced — no competing systems.
- Verified on local `theme dev` @1440: home (wordmark crisp ~34px, category tiles bordered, Archivo throughout), Shop All (sidebar now a bordered box, uppercase toolbar + cards), PDP (sharp size pills + stepper, uppercase vendor/title). No layout regressions, no horizontal overflow.
- **Still on the §1 checklist for a later pass:** footer search box border + footer link uppercase land with the §5 footer rebuild.

### §2 — Home · tag `phase-7-s2-home-20260903` · commit `37a8df8`
- **new** `sections/editorial-cards.liquid` — the **Tootaloo Mag** module (the one confirmed net-new build item). A row of 1px-bordered article cards: kicker (first article tag, else blog title) / headline / dek (24-word excerpt) / "Read more". Merchant picks a blog; 2–6 articles; 2/3/4 columns; optional article image. **Empty-safe** — no blog or zero articles → the section renders nothing on the storefront (editor shows a placeholder). Styles appended to `tt-modules.css`.
- `templates/index.json` — Mag placed between the tile grid and Recently Sold (blog handle `news`); order updated. Tile 1 label "New Arrivals" → **"Staff Picks"**. Tile grid `columns_mobile` 2 → **1** (wireframe stacks tiles on mobile).
- `sections/header-group.json` — `logo_position` `middle-left` → **`middle-center`** (wireframe centres the wordmark).
- `snippets/header-drawer.liquid` — wordmark added at the top of the mobile off-canvas menu (`.menu-drawer__wordmark`, bordered).
- **Merchant action for the Mag section to appear:** create a blog (handle `news` or re-point the section) with published articles.
- **Not done in §2:** Recently Sold as a horizontal scroller with arrow controls (currently a static grid — functional, not the wireframe's carousel); desktop hamburger (kept the inline nav — a one-toggle editor change if wanted).

### §3 — Shop All / PLP · (covered by §1 + earlier phases)
- Persistent bordered category sidebar (§1) + horizontal facet bar ("Filter: Availability", "Sort by", product count) + 4-up grid / 2-up mobile were already built in Phases 2–6; `filter_type: horizontal`, `columns_desktop: 4`. Price filter removed in Phase 4/5.
- Pagination: current page underlined (§14). Numbered list + "Next" is Dawn's.
- Sold-out cards: 1px border + inset padding via `:has(.card__media--sold-out)` (§14) — not visually confirmed (no sold product in the catalogue yet).
- **Not done:** the mobile "Filters / Designers A-Z" two-button bar exactly as drawn — currently a "Categories" disclosure + Dawn's facet drawer. Functional, not pixel-identical.

### §4 — Product page · tag `phase-7-s4-pdp-20260903` · commit `b6aa8a9`
- `locales/en.default.json`: "Add to cart" → **"Add to bag"**; notification "Item added to your cart" → "Added to your bag"; "View cart" → "View bag".
- `tootaloo-system.css`: Add to Bag forced to solid foreground fill even with the dynamic checkout button present (Dawn otherwise makes it a page-blending secondary). Full width + uppercase + radius 0.
- `templates/product.json`: "You may also like" row shows vendor, portrait ratio.
- Variant wiring already verified real (Phase 2.5 / 3); one-of-one hides the picker + stepper (Phase 3). Verified: size S posts through to the cart, notification copy consistent.

### §5 — Footer · tag `phase-7-s5-footer-20260903` · commit `0b84177`
- `sections/footer.liquid`: new masthead row (wordmark at ~50px + product search form) above the columns; toggles `show_footer_masthead` / `show_footer_search`.
- `sections/footer-group.json`: two `link_list` columns ("Customer care" / "Information", default `footer` menu — merchant re-points one) + a `brand_information` block for social icons.
- `tootaloo-system.css`: 1px top border on `.footer`; masthead flex layout; bordered search field + solid icon button; stacks on mobile. Uppercase links/headings via §14.
- **Merchant config:** build the `footer` menu(s); add social links in Theme settings; "Powered by Shopify" is plan-gated and stays.

## Open / not done
- **Mobile QA is desk-verified only** — the browser tooling renders at a fixed 1440px viewport; the two bugs above came from the merchant's real-device testing. CSS is mobile-first with token breakpoints at 749 / 750 / 990.
- **Drop / story / brand pages** — templates are live but render nothing until the Admin objects above exist.
- **Merchant config, not theme bugs:** footer link menus; header nav is Dawn's default (not the boutique taxonomy); `customer-account-main-menu` handle missing (graceful fallback); "Powered by Shopify" in footer.
- **From the wireframe skeleton (chat `c420a7be`):** a "Tootaloo Mag" editorial-cards homepage section is not built. Aesthetic direction (skeleton is bold/boxy `Archivo Black`; the token system is quiet/SSENSE-ish per the brief's references) is an open decision.
- **`sizing.fit`** on the test tee holds `"XS / 00"` — merchant data-entry error, not a theme bug.
