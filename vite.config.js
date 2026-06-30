import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// The Vite app is served from the repo root. The captured original lives under
// `public/mirror/` and is served separately by `public/mirror/server.py` (the
// functional A/B reference + the source of the reused 3D engine bundle).
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
});
