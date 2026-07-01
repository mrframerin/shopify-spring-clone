# Deploying to Vercel

The site is two Vercel projects from **this same repo**:

1. **App** (`shopify-spring-clone`) — the Vite/React site, served at the domain root.
2. **Engine** — the vendored 1:1 WebGL background, served at *its own* root. The app
   embeds it as a fixed `<iframe>` background (see `src/shared/webgl/EngineBackground.tsx`).

Two projects because the engine is a compiled SSR bundle that must own its root
(absolute `/assets/` paths + client routing). Served at its own origin it works
unchanged — exactly like it does in local dev.

Local dev needs none of this: `npm run dev` auto-starts a helper server for the engine.
This split only matters for the deployed site.

---

## 1. Engine project (one-time)

In Vercel → **Add New → Project** → import this GitHub repo again (a second project):

- **Root Directory:** `engine/spring2026`
- **Framework Preset:** Other
- **Build Command:** *(leave empty / none)*
- **Output Directory:** `.` (serve the root directory as-is)

Deploy. It serves the static engine at its root, with `vercel.json` providing the SPA
fallback and stubbing `/api/*` with `{}` (the hero's CDN assets are baked into
`index.html`, so the API calls aren't needed).

Note the resulting URL, e.g. `https://shopify-spring-clone-engine.vercel.app`.

Verify it directly in a browser: `https://<engine-url>/ca/editions/spring2026` should
show the full engine (background + its own hero text — that's expected when viewed
standalone; the text is hidden only when embedded).

## 2. App project (the existing `shopify-spring-clone`)

Add an environment variable, then redeploy:

- **`VITE_ENGINE_URL`** = `https://<engine-url>/ca/editions/spring2026`
  (the engine URL from step 1, including the `/ca/editions/spring2026` path)

Set it for Production (and Preview if you use preview deploys). Redeploy the app.

At build time this is baked in; `EngineBackground` embeds that URL and its bridge hides
the engine's own foreground so only the WebGL canvas shows behind our React content.

## Result

`https://shopify-spring-clone.vercel.app` (root) renders our React site with the 1:1
WebGL background. No `/ca/editions/spring2026` path is needed on the app — that's only
the engine's internal route.

If `VITE_ENGINE_URL` is **not** set, the app falls back to the in-repo Three.js
reimplementation (`HeroBackground`) instead of the embed.
