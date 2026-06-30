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
  loaded; 0 console errors; build passes.
- [~] **Phase B** componentize section by section + content JSON + per-section A/B gate.
  - [x] Architecture: body split into 10 real top-level regions + 11 chapter slices
    (`scripts/split-dump.mjs`); `App.tsx` rebuilds the wrapper ancestry as JSX and renders
    each region/section, swapping dumps → components one at a time. Content seam =
    `content/spring2026.json` + typed `content/types.ts`, distributed by `App`.
  - [x] **Footer (Outro)** — clean typed component, content-driven, verified 1:1.
  - [x] **Hero** — clean typed component + `SplitText` helper (per-letter reveal markup
    proven byte-for-byte, `scripts/verify-splittext.mjs`); content-driven; verified 1:1
    (rect, 48 split-chars/7 groups, exact stagger, 10 nav links, engine attrs).
  - [ ] **10 chapters** (agentic, sidekick, online, retail, marketing, operations,
    shop-app, payments, finance, developer) — currently faithful RawHtml slices rendering
    1:1; awaiting content-driven componentization. ← NEXT
  - [ ] **Chrome** (shared-tooltip, page-loading overlay, top-nav gradient, signup modal,
    video modal, pill-nav) — still RawHtml; convert + most are interactive (pill-nav/modals
    couple to Phase C).
- [ ] **Phase C** reuse 3D engine bundle (the big visual payoff — hero/canvas are blank until then).
- [ ] **Phase D** de-scrape.
- [ ] **Phase E** ship + verify live.

## Per-chapter conversion procedure (the proven loop — repeat for each remaining chapter)
1. `node scripts/outline.mjs src/modules/spring2026/_dump/sections/<id>.html 9` to read structure.
2. The repeating unit is `<article data-component-name="product">` (full-width hero
   articles + subgrid card rows + text-card grids) inside the
   `data-component-extra-section-handle="<id>"` section. Build reusable presentational
   components for these (`ProductArticle`, `Media`) once, in `modules/spring2026/components/`.
   ⚠ Chapters are bespoke: retail has extra `#ballcap` anchor + bg layers; only agentic has
   a visible subhead (others use an `invisible min-h-[1lh]` placeholder). Handle per-chapter.
3. Lift copy + media (`src`/`srcset`/`poster`/`href`/labels) into `content/spring2026.json`;
   keep class/id/data-attrs verbatim (they drive the engine).
4. ⚠ Do NOT pipe huge chapters straight through `html-to-component.mjs`: it leaves HTML
   entities in `className` (`[&amp;&gt;svg]` won't match the CSS). The RawHtml slice already
   renders those 1:1 (browser decodes), so port by hand from the outline or post-process to
   decode entities in className/style/attr values.
5. Verify: geometry A/B vs the section's prior (dump) rects + the live mirror
   (`npm run mirror`), at desktop/tablet/mobile; 0 new console errors. Then delete the dump.

## Notes / gotchas found
- `#page-loading-overlay` (z-index max, black) covers the page until `data-loaded` is set
  — original engine sets it on ready; App.tsx sets it on mount for now.
- Reveal-coupling: ~15 elements/section are `opacity:0` scroll-reveal targets (engine-driven, Phase C).
- Hero text is engine-controlled (`data-hero-text-controlled`) → hero is intentionally blank without the engine.
- Preview panel defaults to ~291px; call preview_resize width/height (not preset) to force desktop.
