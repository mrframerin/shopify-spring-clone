import { useEffect, useRef } from "react";
import { createHeroScene, type HeroSceneHandle } from "./heroScene";

/**
 * The fixed, full-viewport animated background: a photo-derived 3D point cloud that
 * drifts under a cursor-driven fluid field. Self-contained WebGL (Three.js) rendered
 * into its own canvas behind all page content.
 */
export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let handle: HeroSceneHandle | undefined;
    let cancelled = false;
    createHeroScene(container).then((h) => {
      if (cancelled) h.dispose();
      else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return (
    <div
      id="background-container"
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-lvh overflow-clip bg-b100 isolate"
    />
  );
}
