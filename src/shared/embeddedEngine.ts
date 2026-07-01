/**
 * True when the vendored 1:1 engine is embedded as the background. Set via
 * import.meta.env.VITE_ENGINE_URL — the dev/preview helper server, or a deployed
 * engine URL in production.
 *
 * When the engine is embedded, its WebGL scene already renders the hero "Everywhere"
 * ring (HeroRingObject) and the full background, so our own HeroRing / WebGL
 * reimplementation must stand down to avoid drawing a second, duplicate ring.
 */
export const useEmbeddedEngine = Boolean(import.meta.env.VITE_ENGINE_URL);
