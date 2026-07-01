import type { Plugin } from "vite";

/** Auto-serves the vendored hero background engine at its own root for dev/preview. */
export function heroEnginePlugin(opts?: { port?: number }): Plugin;
