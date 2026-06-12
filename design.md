# juku.loans — design system

This document describes the visual language of juku.loans so new pages and components stay consistent with the existing site. The canonical implementation lives in `juku/css/style.css` (main site) and the inline styles of `portfolio.html` (risk model page).

## Brand

- **Wordmark:** `juku.loans`, written lowercase, italic, with the dot rendered in the accent orange (`<span class="dot">.</span>`). Orange dots are also used as full stops at the end of headlines.
- **Voice:** plain-English explanations of a financial product. Friendly but precise; British English; figures always labelled as illustrative. Every risk/number page carries a "not financial advice" note in the footer copy.
- **Audience:** UK loan brokers first, their business clients second.

## Colour palette

Defined as CSS custom properties on `:root`.

| Token | Value | Use |
|---|---|---|
| `--accent` | `#ff8800` | Brand orange: links, active states, CTAs, chart lines, headline dots |
| `--accent-light` | `rgba(255,136,0,0.1)` | Tinted backgrounds (badges, readouts, step numbers) |
| `--accent-border` | `rgba(255,136,0,0.25)` | Borders on accent-tinted surfaces |
| `--bg` | `#f7f3ee` (site) / `#fbf7f1` (portfolio page) | Page background — warm cream |
| `--bg-card` | `#efe9e0` | Card surfaces on the main site |
| `--bg-hover` | `#e8e0d4` | Hover/secondary card surfaces |
| `--text-primary` / `--ink` | `#1e1a16` | Headings and primary text — near-black with warm undertone |
| `--text-secondary` / `--sec` | `#6b5f52` | Body copy, labels |
| `--text-tertiary` / `--ter` | `#b0a090` | Section labels, footnotes, axis labels |
| `--border` | `rgba(0,0,0,0.08)` / `#e7ddcf` | Hairline dividers and card borders |
| `--border-strong` | `rgba(0,0,0,0.14)` | Input and button borders |
| green `#1f8a4c` | charts only | Positive values, buffers |
| red `#c0392b` | charts only | Losses, negative values |

Rule of thumb: the page is warm cream, almost everything is drawn in warm greys, and **orange is the only brand colour** — used sparingly so it reads as emphasis. Green/red appear only in data visualisation.

## Typography

- **Family:** `Libre Baskerville` (Google Fonts), falling back to Georgia/serif. The portfolio page uses a system sans-serif for body/controls and reserves Libre Baskerville for headings and key figures.
- **Headlines:** bold *italic* serif, tight letter-spacing (−0.5 to −1.5px), sized with `clamp()` (e.g. hero `clamp(32px, 4.5vw, 60px)`).
- **Section labels:** 10–11px, bold, UPPERCASE, letter-spaced 0.8–1.5px, tertiary colour. This is the standard way to title a section or card.
- **Body:** 13–15px, line-height 1.5–1.8, secondary colour.
- **Numbers:** always `font-variant-numeric: tabular-nums`; key figures in bold italic serif.
- **Footnotes:** 11–12px, tertiary colour, often italic.

## Texture & shape

- **Dot grid texture:** a fixed full-page `radial-gradient` dot pattern overlay (`body::before`, 24px grid, ~5% black at 50% opacity) gives the site its paper-like feel. Decorative dot blocks (`.hg-dots`) echo it in graphics.
- **Hero graphic motif:** a large orange circle flanked by two dot-grid rectangles (top-left and bottom-right), with a springy scale/translate hover animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`). Reused inverted (cream circle, white dots) on the orange CTA band.
- **Radii:** 5 / 8 / 12 / 16px (`--radius-sm/md/lg/xl`). Cards and panels are 12–16px; buttons and inputs 8px; badges are full pills (20px).
- **Borders over shadows:** surfaces are separated with 1px hairline borders, not drop shadows. Shadows appear only on hover for CTAs.

## Components

- **Nav:** sticky, blurred translucent background (`backdrop-filter: blur(10px)`), hairline bottom border. Logo left; right side is a row of `.nav-btn` pills — transparent with `--border-strong` border, the active one filled solid orange with white text. Links and buttons share the `.nav-btn` class (anchors get `text-decoration: none`).
- **Cards / panels:** `--bg-card` (site) or white (portfolio) on cream, 1px border, 1.5–2rem padding.
- **Sliders:** native `input[type=range]` with `accent-color: var(--accent)`; label left, value right in bold tabular figures. All calculators on the site follow this pattern.
- **Result/readout cards:** accent-tinted background + accent border for the headline result; neutral bordered cards for secondary stats.
- **Steps:** numbered circles (28px, accent-tinted) with hairline dividers between rows.
- **FAQ accordion:** borderless question buttons with a rotating `+` icon, `max-height` transition on the answer; only one item open at a time.
- **CTA band:** full-bleed solid orange section, white italic serif headline, white button with orange text that lifts on hover.
- **Forms:** uppercase micro-labels, cream inputs with strong borders, orange focus ring (`0 0 0 3px rgba(255,136,0,0.12)`), full-width orange submit button.
- **Charts (portfolio page):** hand-rolled inline SVG on white. Cream gridlines (`#f0e8db`), tertiary-colour axis labels at 10px, orange data line (2.5px), dashed green reference lines, dashed tan markers, near-black current-position indicator. Currency ticks abbreviated (`£500k`, `£1m`).

## Layout

- Single-column flow with full-width sections separated by hairline top borders; horizontal padding `4vw` (5vw under 480px).
- The main site is a one-page app: `.page` blocks toggled by `show()` in `juku/js/main.js`; standalone pages (e.g. `portfolio.html`) link back via the shared nav.
- Two-panel tool layouts (inputs | output) use CSS grid `300px 1fr`, collapsing to one column under ~820px.
- Content max-width ~1080px on tool pages; prose capped around `55ch`.

## Breakpoints

- **820px** — tool grids collapse to one column
- **700–800px** — hero stacks, decorative graphics shrink or hide, party cards stack
- **560px** — stat grids collapse
- **480px** — tighter padding, smaller nav buttons, single-column form rows

## Adding a new page

1. Reuse the palette and type rules above; keep the cream background and hairline borders.
2. Include the shared nav (logo linking to `index.html`, pill links, solid-orange active state) — copy the pattern from `portfolio.html` if the page doesn't load `juku/css/style.css`.
3. Use the section-label / card / slider patterns rather than inventing new controls.
4. Keep orange scarce; let figures carry the bold italic serif treatment.
5. Add a tertiary-colour footnote with assumptions and the "not financial advice" line on anything with numbers.
