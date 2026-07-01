// Serves the vendored hero background engine (engine/spring2026) at the root of a
// small helper HTTP server, so a plain `npm run dev` (and `npm run preview`) shows the
// full 1:1 WebGL background with no second manual step.
//
// Why a separate origin instead of mounting under /engine on the Vite server: the
// engine is a compiled Vite + React-Router SSR bundle built with base "/". Its chunks,
// route manifest, and preload helper resolve assets against "/assets/" and the document
// base in several different ways, and its hydration asserts the URL matches the baked
// route (/ca/editions/spring2026). Rebasing all of that by string-rewriting the minified
// output is fragile; serving it unchanged at its own root is exact and robust. The engine
// is embedded as a fixed, pointer-events-none <iframe> background (see EngineBackground.tsx),
// and its in-page bridge (in index.html) hides its own chrome and takes scroll/pointer
// from the host via postMessage.
//
// This is a Node port of engine/spring2026/server.py: serve /assets/* from disk, answer
// /api/* with cached-or-proxied JSON, and serve index.html for every route (SPA fallback).

import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ENGINE_ROOT = resolve(HERE, "..", "engine", "spring2026");
const CACHE_DIR = join(ENGINE_ROOT, "api-cache");
const UPSTREAM = "https://www.shopify.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MIME = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ktx2": "image/ktx2",
  ".glb": "model/gltf-binary",
  ".mp4": "video/mp4",
};

function send(res, status, headers, body) {
  res.writeHead(status, { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache", ...headers });
  res.end(body);
}

async function sendFile(res, filePath, contentType) {
  try {
    const data = await readFile(filePath);
    send(res, 200, { "Content-Type": contentType, "Content-Length": String(data.length) }, data);
  } catch {
    send(res, 404, { "Content-Type": "text/plain" }, `Not found: ${filePath}`);
  }
}

// The app's own JSON endpoints. Return real data (cached to disk from the live site,
// proxied on a miss) — never the SSR HTML, or the client crashes into its error page.
async function serveApi(res, reqUrl) {
  const key = createHash("sha1").update(reqUrl).digest("hex");
  const cacheFile = join(CACHE_DIR, key + ".json");
  if (existsSync(cacheFile)) {
    await sendFile(res, cacheFile, "application/json");
    return;
  }
  try {
    const upstream = await fetch(UPSTREAM + reqUrl, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    send(res, 200, { "Content-Type": "application/json", "Content-Length": String(body.length) }, body);
  } catch {
    send(res, 200, { "Content-Type": "application/json" }, "{}");
  }
}

function createEngineServer() {
  return http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      send(res, 204, { "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS" }, "");
      return;
    }
    let path = "/";
    try {
      path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      /* keep default */
    }

    if (req.method === "POST") {
      send(res, 200, { "Content-Type": "application/json" }, "{}");
      return;
    }
    if (path.startsWith("/assets/")) {
      const rel = path.slice("/assets/".length);
      await sendFile(res, join(ENGINE_ROOT, "assets", rel), MIME[extname(rel).toLowerCase()] || "application/octet-stream");
      return;
    }
    if (path.includes("/api/")) {
      await serveApi(res, req.url);
      return;
    }
    if (path === "/" || path === "") {
      send(res, 302, { Location: "/ca/editions/spring2026" }, "");
      return;
    }
    // SPA fallback: every route serves the (hydrated) hero document.
    await sendFile(res, join(ENGINE_ROOT, "index.html"), "text/html; charset=utf-8");
  });
}

/**
 * Vite plugin. Starts the engine helper server (once) for `vite` and `vite preview`,
 * and exposes its URL to the app as import.meta.env.VITE_ENGINE_URL. If VITE_ENGINE_URL
 * is already set in the environment (e.g. `npm run engine` on a manual port), that value
 * is respected and no helper server is started.
 */
export function heroEnginePlugin({ port = Number(process.env.HERO_ENGINE_PORT) || 5174 } = {}) {
  const override = process.env.VITE_ENGINE_URL;
  const url = override || `http://localhost:${port}/ca/editions/spring2026`;
  let server;

  const start = (viteServer) => {
    if (override || server) return;
    if (!existsSync(join(ENGINE_ROOT, "index.html"))) {
      viteServer?.config?.logger?.warn?.(`[hero-engine] engine not found at ${ENGINE_ROOT}; background disabled`);
      return;
    }
    server = createEngineServer();
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        // Something is already serving the engine on this port — reuse it.
        server = undefined;
      } else {
        console.error("[hero-engine]", err);
      }
    });
    server.listen(port, () => {
      viteServer?.config?.logger?.info?.(`  ➜  Hero engine:  http://localhost:${port}/ca/editions/spring2026`);
    });
    viteServer?.httpServer?.on?.("close", () => {
      server?.close();
      server = undefined;
    });
  };

  return {
    name: "hero-engine",
    config() {
      return { define: { "import.meta.env.VITE_ENGINE_URL": JSON.stringify(url) } };
    },
    configureServer(viteServer) {
      start(viteServer);
    },
    configurePreviewServer(viteServer) {
      start(viteServer);
    },
  };
}
