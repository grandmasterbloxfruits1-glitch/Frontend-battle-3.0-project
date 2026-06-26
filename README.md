[README.md](https://github.com/user-attachments/files/29379906/README.md)
# Axon — AI Data Automation Platform

A premium, responsive landing page for a fictional AI-driven data automation platform.
Built for **FrontEnd Battle 3.0** (Phase 1: Next-Gen AI Platform Speed Run).

🔗 **Live demo:** [add link]
🎥 **Demo video:** [add link]
📦 **Repo:** [add link]

---

## Tech stack

- **Vanilla HTML / CSS / JS** — zero frameworks, zero build step, zero npm dependencies
- **Fonts:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (headings, data/numerals) + [Inter](https://fonts.google.com/specimen/Inter) (body, UI)
- **Icons:** inline SVG, no icon library
- **Animation:** native CSS transitions/keyframes + WAAPI only — no animation or UI component libraries

No build tooling required. Open `index.html` directly, or serve the folder with any static file server.

```bash
# Run locally
npx serve .
# or just open index.html in a browser
```

---

## Core features

### 1. Matrix-Driven Pricing & Performance-Isolated Currency Switcher

Pricing is never hardcoded. Every price is computed at runtime from a multi-dimensional config object:

```
finalPrice = baseMonthlyRateUSD × exchangeRate × regionalTariff × (annual ? 0.8 : 1)
```

- Toggle **Monthly ⇄ Annual** and switch currency between **INR (₹) / USD ($) / EUR (€)**
- Annual billing applies a flat 20% discount multiplier
- Each currency carries its own regional tariff variable, factored into the final number

**State isolation:** price `<span>` nodes are cached once on load. Toggling currency or billing cycle updates *only* those cached text nodes directly — no re-render, no re-creation, no touching of parent or sibling elements. Verified with Chrome DevTools paint-flashing: only the price digits flash on change, nothing else on the page repaints.

### 2. Bento-to-Accordion Wrapper with State Persistence

The same five feature items render as two different layouts depending on viewport:

- **Desktop (>768px):** CSS grid Bento layout
- **Mobile (≤768px):** vertical Accordion (`<button>` trigger + collapsible panel, full ARIA support)

**Context Lock:** while hovering/focusing a bento card on desktop, the active index is tracked in JS. If the window is resized past the mobile breakpoint mid-hover, that exact card's accordion panel auto-expands — smoothly, using the same transition timing as a manual toggle. Breakpoint crossing is detected via `matchMedia(...).addEventListener('change', ...)`, not a generic resize listener.

Accordion panels collapse via CSS `grid-template-rows` transition (`0fr → 1fr`) with `overflow: hidden` — content stays in the DOM and crawlable at all times, never `display: none`.

---

## Motion timing

| Interaction | Duration | Easing |
|---|---|---|
| Hover / toggle micro-interactions | 150–200ms | ease-out |
| Structural layout reflows (accordion, bento↔accordion) | 300–400ms | ease-in-out |
| Page entry sequence | ≤500ms total | — |

Entry animation is a pure visual layer (opacity/transform) on top of content that's already present in the DOM on load — it never delays Time to Interactive or blocks semantic indexing.

---

## Compliance notes (Phase 1 rubric)

- ✅ No external UI/animation libraries (no Shadcn, Radix, HeadlessUI, Framer Motion) — confirmed via `package.json` / dependency scan
- ✅ Semantic HTML5 throughout (`<header>`, `<main>`, `<section>`, `<footer>`, `<button>`) — no non-semantic `<div>` soup
- ✅ Full SEO metadata: title, meta description, Open Graph tags, alt text on all visual elements, JSON-LD structured data
- ✅ Provided asset package (SVGs, fonts, color palette) used throughout — no external visual resources
- ✅ Breakpoint fluidity tested across mobile / tablet / desktop with no clipping or overlap

---

## Project structure

```
.
├── index.html
├── style.css
├── script.js
└── assets/
    └── icons/
```

---

Built solo for FrontEnd Battle 3.0, organized by IIT Bhubaneswar via Unstop.
