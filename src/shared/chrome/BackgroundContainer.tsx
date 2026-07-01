import type { CSSProperties } from "react";

/**
 * The fixed, full-viewport WebGL scene layer that sits behind all content and
 * renders into its `<canvas>`.
 */
export function BackgroundContainer() {
  return (
    <div
      id="background-container"
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-lvh overflow-clip bg-b100 canvas-wrapper isolate"
    >
      <div
        style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "auto" } as CSSProperties}
        className="pointer-events-auto"
      >
        <div style={{ width: "100%", height: "100%" }}>
          <canvas style={{ display: "block" }} />
        </div>
      </div>
    </div>
  );
}
