import type { CSSProperties } from "react";

/** The fixed top gradient scrim behind the floating nav (fades in with the nav). */
export function TopNavGradient() {
  return (
    <div
      data-nosnippet="true"
      data-lenis-prevent="true"
      data-video-modal-nav="true"
      className="fixed top-0 left-0 w-full z-9999 pointer-events-none print:hidden"
      style={{ viewTransitionName: "navigation" } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-0"
      />
    </div>
  );
}
