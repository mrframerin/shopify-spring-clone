import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { heroEnginePlugin } from "./scripts/vite-plugin-hero-engine.mjs";

// The Vite app is served from the repo root. Tailwind v4 generates the utility CSS
// from the components; the design layer + reset live in src/styles/app.css.
//
// heroEnginePlugin auto-starts a small helper server that serves the vendored WebGL
// background engine (engine/spring2026) at its own root, so `npm run dev` shows the
// full 1:1 hero background with no separate manual step. It exposes the engine URL as
// import.meta.env.VITE_ENGINE_URL, which EngineBackground embeds as a fixed iframe.
export default defineConfig({
  plugins: [react(), tailwindcss(), heroEnginePlugin()],
  server: {
    port: 5173,
  },
});
