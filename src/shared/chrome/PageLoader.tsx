import type { CSSProperties } from "react";
import "./pageLoader.css";
import { RAIN_DOTS } from "./rainDots";

/**
 * Full-screen loading cover: a masked "particle rain" of 140 rising dots that
 * resolves into the Shopify wordmark shape. `App` dismisses it on mount by setting
 * `[data-loaded]`, which fades the cover out (see pageLoader.css). A `<noscript>`
 * fallback dismisses it via CSS animation when JS is unavailable.
 */
export function PageLoader() {
  return (
    <div id="page-loading-overlay" role="dialog" aria-modal="true" aria-labelledby="page-loading-label">
      <noscript>
        <style>{`@keyframes page-loading-noscript-dismiss{to{opacity:0;visibility:hidden}}#page-loading-overlay{animation:page-loading-noscript-dismiss 800ms ease-out 2500ms forwards}`}</style>
      </noscript>
      <div className="page-loading-preloader" style={{ opacity: 0 }}>
        <svg
          aria-hidden="true"
          className="page-loading-particle-rain"
          focusable="false"
          viewBox="0 0 160 150"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            {RAIN_DOTS.map(([cx, cy, r, delay, duration, travel, drift, alpha], i) => (
              <circle
                key={i}
                className="page-loading-rain-dot"
                cx={cx}
                cy={cy}
                r={r}
                style={
                  {
                    "--delay": delay,
                    "--duration": duration,
                    "--travel": travel,
                    "--drift": drift,
                    "--alpha": alpha,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        </svg>
        <span id="page-loading-label" className="page-loading-label">
          Loading
        </span>
      </div>
    </div>
  );
}
