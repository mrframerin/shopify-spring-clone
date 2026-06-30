# Rebuild status — Shopify Editions Spring '26 → Vite + React (1:1)

Method: `scrape-to-components` skill. Fidelity first (link original CSS verbatim,
port DOM 1:1, reuse the original 3D engine), clean code last (Phase D). Plan:
`~/.claude/plans/merry-imagining-cat.md`.

## How to run
- Rebuild (the app): `npm run dev` → http://localhost:5173
- Mirror (functional original, A/B + Phase-C engine source): `npm run mirror` →
  http://localhost:3001/ca/editions/spring2026  (serves `public/mirror/` via server.py)

## Architecture
- `index.html` — Vite entry; links original CSS (`/assets/{tailwind,fonts-latin,fonts-japanese}.css`) + `tokens.css` last; `lang=ca`, dark.
- `src/App.tsx` — Phase-A scaffold: renders `_dump/bodyDump.html` (the whole captured
  visual DOM = `body[0:592200]`) via one raw-HTML dump. Dismisses `#page-loading-overlay`
  on mount (stand-in for the engine ready signal until Phase C).
- `public/assets/` — the 3 stylesheets the rebuild links (JS chunks copied here in Phase C).
- `public/mirror/` — the untouched scrape (index.html + assets + api-cache + server.py).
- Media streams from `cdn.shopify.com` (as the original does) — not mirrored locally.

## Section checklist (Phase B), top → bottom
Chrome: preloader · signup-modal · video-modal · floating pill-nav · hero-nav · footer
Background: `#background-container.canvas-wrapper` → single `<canvas>` (engine = Phase C)
Chapters (each `<section id=X data-section-key=X>` + paired `data-component-extra-section-handle=X`):
hero · agentic · sidekick · online · retail · marketing · operations · shop-app · payments · finance · developer

## Progress
- [x] **Phase 0** capture — scrape is complete (DOM+CSS+138 JS chunks local; media on CDN).
- [x] **Phase A** scaffold — Vite app renders full styled DOM; 21 sections; real fonts
  (National2/ShopifyInter) loaded; 0 console errors; `npm run build` passes. Hero +
  canvas regions are black (engine = Phase C); content chapters render (text/fonts/layout
  correct). Verified at 1440px.
- [ ] **Phase B** componentize section by section + content JSON + per-section A/B gate. ← NEXT
- [ ] **Phase C** reuse 3D engine bundle.
- [ ] **Phase D** de-scrape.
- [ ] **Phase E** ship + verify live.

## Notes / gotchas found
- `#page-loading-overlay` (z-index max, black) covers the page until `data-loaded` is set
  — original engine sets it on ready; App.tsx sets it on mount for now.
- Reveal-coupling: ~15 elements/section are `opacity:0` scroll-reveal targets (engine-driven, Phase C).
- Hero text is engine-controlled (`data-hero-text-controlled`) → hero is intentionally blank without the engine.
- Preview panel defaults to ~291px; call preview_resize width/height (not preset) to force desktop.
