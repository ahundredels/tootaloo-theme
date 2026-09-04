# Design tokens — the real source of truth

This is what the theme actually uses. Do not reconcile against anyone's memory — reconcile against this file and `../snippets/tootaloo-tokens.liquid`.

Nothing here chooses final fonts, colours or imagery. Colour comes from **Theme settings → Colors** (Dawn's 5 schemes). Fonts come from **Theme settings → Typography** and the two token voices alias them.

---

## Type voices

| Token | Aliased to | Current value (Theme settings) |
|---|---|---|
| `--tt-font-display` | `--font-heading-family` ← Settings > Heading font | **Assistant**, weight 400 (`assistant_n4`) |
| `--tt-font-grotesk` | `--font-body-family` ← Settings > Body font | **Assistant**, weight 400 (`assistant_n4`) |

Both voices are currently the same face (Assistant). The system is built to take a distinct display face the moment one is picked in the Heading-font setting — no code change.

## Weights
`--tt-fw-regular` = `var(--font-body-weight, 400)` · `--tt-fw-medium` = 500 · `--tt-fw-semibold` = 600 · `--tt-fw-bold` = `var(--font-body-weight-bold, 700)`

## Type scale (rem on Dawn's 62.5% root → respects the body-scale setting)
| Token | Value | ≈ px @ scale 100 |
|---|---|---|
| `--tt-fs-2xs` | `1.1rem` | 11 |
| `--tt-fs-xs` | `1.2rem` | 12 |
| `--tt-fs-sm` | `1.3rem` | 13 |
| `--tt-fs-base` | `1.5rem` | 15 |
| `--tt-fs-md` | `1.7rem` | 17 |
| `--tt-fs-lg` | `clamp(2rem, 1.5rem + 1.4vw, 2.8rem)` | 20 → 28 |
| `--tt-fs-xl` | `clamp(2.8rem, 1.9rem + 3vw, 4.6rem)` | 28 → 46 |
| `--tt-fs-display` | `clamp(3.6rem, 1.2rem + 8vw, 8.4rem)` | 36 → 84 |
| `--tt-fs-oversized` | `clamp(5.6rem, -1rem + 16vw, 17rem)` | 56 → 170 |

## Line heights
`--tt-lh-none` 1 · `--tt-lh-tight` 1.08 · `--tt-lh-snug` 1.2 · `--tt-lh-heading` 1.28 · `--tt-lh-body` 1.55 · `--tt-lh-relaxed` 1.72

## Letter spacing
`--tt-tracking-tighter` -0.03em · `-tight` -0.015em · `-normal` 0 · `-wide` 0.04em · `-wider` 0.1em · `-widest` 0.16em

## Type roles (utility classes in `tootaloo-system.css`, referenced by sections — never a raw size)
| Class | family | size | tracking | weight | case |
|---|---|---|---|---|---|
| `.tt-wordmark` | display | oversized | tighter | regular | UPPER |
| `.tt-nav` | grotesk | sm | wide | regular | UPPER |
| `.tt-utility` | grotesk | 2xs | widest | regular | UPPER |
| `.tt-section-heading` | grotesk | sm | widest | semibold | UPPER |
| `.tt-drop-title` | display | xl | tight | regular | — |
| `.tt-editorial-heading` | display | lg | tight | regular | — |
| `.tt-product-title` | grotesk | md | normal | regular | — |
| `.tt-vendor` | grotesk | 2xs | widest | regular | UPPER, `fg / 0.6` |
| `.tt-price` | grotesk | sm | wide | regular | — (tabular-nums) |
| `.tt-body` | grotesk | base | normal | — | — |
| `.tt-meta-label` | grotesk | 2xs | wider | regular | UPPER, `fg / 0.55` |
| `.tt-meta-value` | grotesk | sm | normal | — | `fg` |

Dawn's `.h0`–`.h5` / `h1`–`h6` are also re-mapped onto this scale in `tootaloo-system.css` §2 (the blanket `+0.06rem` caps tracking that read as stock Dawn was removed).

---

## Spacing scale — exactly `8 / 16 / 24 / 40 / 64 / 96 / 160` px
| Token | Desktop | Mobile (≤749) |
|---|---|---|
| `--tt-space-2xs` | 0.8rem (8) | 8 |
| `--tt-space-xs` | 1.6rem (16) | 16 |
| `--tt-space-sm` | 2.4rem (24) | 24 |
| `--tt-space-md` | 4rem (40) | **3.2rem (32)** |
| `--tt-space-lg` | 6.4rem (64) | **4.8rem (48)** |
| `--tt-space-xl` | 9.6rem (96) | **6.4rem (64)** |
| `--tt-space-2xl` | 16rem (160) | **9.6rem (96)** |

Semantic: `--tt-pad-utility` = 2xs · `--tt-pad-grid` = sm · `--tt-pad-editorial` = lg · `--tt-section-gap` = lg · `--tt-section-gap-major` = 2xl.

## Layout / grid
| Token | Value |
|---|---|
| `--tt-gutter` | `2rem` / `3.2rem` @750 / `4rem` @990 |
| `--tt-content-max` | `150rem` (1500) |
| `--tt-content-wide` | `176rem` (1760) |
| `--tt-content-narrow` | `108rem` (1080) |
| `--tt-content-text` | `68rem` (680) — editorial reading measure |
| `--tt-sidebar-width` | `22rem` (220) |
| `--tt-sidebar-gap` | `lg` / `md` on mobile |
| `--tt-grid-col-gap` | `0.8rem` / `1.2rem` @750 / `1.6rem` @990 |
| `--tt-grid-row-gap` | `md` (40) |
| `--tt-header-height` | `var(--header-height, 7rem)` — Dawn sets `--header-height` via JS |
| `--tt-sticky-offset` | `calc(header-height + sm)` — drives the PDP sticky column + sticky sidebar |

**Note:** the *product grid* on Shop All does **not** use `--tt-grid-col-gap`. It runs on Dawn's flex `.grid` whose gap comes from `spacing_grid_horizontal` / `spacing_grid_vertical` (below) — so the gap and Dawn's `.grid__item` width calc stay in sync. Overriding the gap there breaks the mobile 2-up (Phase 6 bug).

## Aspect ratios
`--tt-ratio-square` 1/1 · `-portrait` 4/5 · `-portrait-tall` 3/4 · `-landscape` 3/2 · `-featured-wide` 16/10 · `-featured-tall` 5/7. Applied via `.tt-media[data-ratio="..."]`.

## Motion (minimal — brief §22)
`--tt-ease` `cubic-bezier(0.2, 0, 0, 1)` · `--tt-dur-fast` 120ms · `--tt-dur` 240ms · `--tt-dur-slow` 480ms. All → 0 under `prefers-reduced-motion`.

---

## Relevant `config/settings_data.json` values (Dawn settings the theme relies on)

```json
"type_header_font": "assistant_n4",
"type_body_font": "assistant_n4",
"heading_scale": 100,
"body_scale": 100,
"page_width": 1600,
"spacing_sections": 0,           // sections own their own token padding — no Dawn inter-section margin
"spacing_grid_horizontal": 16,   // product grid: 8px gap mobile / 16px desktop
"spacing_grid_vertical": 40,     // product grid: 20px row gap mobile / 40px desktop
"animations_reveal_on_scroll": false,   // brief §22
"animations_hover_elements": "none",

"card_style": "standard",
"card_color_scheme": "scheme-2",  // light grey #F3F3F3 card ground
"card_border_opacity": 0,         // whitespace-separated cards, no chrome
"card_corner_radius": 0,
"card_shadow_opacity": 0,
"collection_card_border_opacity": 0,
"blog_card_border_opacity": 0,

"buttons_radius": 0,              // sharp
"inputs_radius": 0,
"variant_pills_radius": 0,        // sharp variant/size pills
"media_radius": 0,
"badge_corner_radius": 0,

"badge_position": "bottom left",
"sale_badge_color_scheme": "scheme-4",
"sold_out_badge_color_scheme": "scheme-3",
"cart_type": "notification",
"currency_code_enabled": true    // prices show "USD" — merchant can turn off
```

### Colour schemes (Dawn defaults — unchanged, brief §27 "no final palette")
| Scheme | background | text | button | button label |
|---|---|---|---|---|
| scheme-1 | `#FFFFFF` | `#121212` | `#121212` | `#FFFFFF` |
| scheme-2 | `#F3F3F3` | `#121212` | `#121212` | `#F3F3F3` |
| scheme-3 | `#242833` | `#FFFFFF` | `#FFFFFF` | `#000000` |
| scheme-4 | `#121212` | `#FFFFFF` | `#FFFFFF` | `#121212` |
| scheme-5 | `#334FB4` | `#FFFFFF` | `#FFFFFF` | `#334FB4` |

`tootaloo-system.css` never uses a colour literal — everything is `rgb(var(--color-foreground))` / `rgba(var(--color-foreground), <alpha>)` / `rgb(var(--color-background))`, so the whole system re-themes if the schemes change.
