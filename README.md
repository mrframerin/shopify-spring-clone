# Shopify Editions — Spring '26

An interactive product-announcement page: a long-form, scroll-driven microsite that
walks through the season's launches across eleven chapters (Agentic, Sidekick, Online,
Retail, Marketing, Operations, Shop app, Payments, Finance, Developer) with per-section
reveals, a floating section nav, video and sign-up dialogs, and an optional WebGL
background.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** for dev/build
- **Tailwind CSS v4** for the utility layer, with an owned design layer on top

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

## Architecture

The page is **content-driven**: presentational components hold the markup and styling,
while every string and media URL lives in a single typed content file. Rebranding or
localizing is a matter of editing content, not components.

```
src/
├── App.tsx                     # page composition: chrome + chapters + footer
├── main.tsx                    # entry; loads fonts, Tailwind, and the design layer
├── modules/spring2026/
│   ├── components/
│   │   ├── kit/                # reusable building blocks (Article, Media, Rows, RichText…)
│   │   ├── chapters/           # the eleven section components, composed from the kit
│   │   └── hero/               # the hero section
│   └── content/
│       ├── spring2026.json     # all copy + media URLs
│       └── types.ts            # the content schema
├── shared/
│   ├── chrome/                 # page chrome: nav, modals, loader, background
│   ├── components/             # cross-cutting UI (SplitText, footer)
│   ├── useScrollReveal.ts      # reveals sections as they enter the viewport
│   └── useHeroExit.ts          # hands the hero off to the pinned nav on scroll
└── styles/
    ├── app.css                 # Tailwind entry + design tokens (@theme)
    ├── design.css              # the owned design system: components, utilities, keyframes
    └── fonts.css               # @font-face declarations
```

**Motion.** Section reveals are driven by an `IntersectionObserver` that sets a CSS
custom property (`--scroll-reveal`), which the design layer animates — no animation
library. Per-character heading reveals are rendered by `SplitText`, which emits the
stagger timing as inline custom properties the CSS reads.

**Styling.** `app.css` is the Tailwind entry and holds the design tokens (`@theme`:
palette, the 1px spacing scale, and the shifted breakpoints). `design.css` is the owned
layer for everything Tailwind doesn't generate — the typography scale, semantic color
utilities, component classes, and keyframes. It is imported separately from `app.css` so
it isn't rewritten by Tailwind's CSS pipeline.

**3D background (optional).** By default the background is an empty canvas layer. A
self-contained WebGL/Theatre.js scene can be plugged in behind the content: it runs on
its own origin and is embedded in a full-viewport iframe, with scroll and pointer
forwarded to it over `postMessage` (see `shared/chrome/EngineBackground.tsx`). Enable it
by pointing `VITE_ENGINE_URL` at the running scene:

```bash
npm run engine     # serves the scene on :3001
npm run dev:engine # runs the app with the background enabled
```
