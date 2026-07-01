import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The Vite app is served from the repo root. Tailwind v4 generates the utility CSS
// from the components; the design layer + reset live in src/styles/app.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});
