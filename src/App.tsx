import { useEffect } from "react";
import rawBody from "./modules/spring2026/_dump/bodyDump.html?raw";

/**
 * Phase A scaffold: the entire captured visual DOM is rendered verbatim as a single
 * raw-HTML dump so the page is structurally complete and fully styled by the linked
 * original CSS. The single WebGL canvas is empty/static here; CSS-driven animation
 * (e.g. the preloader rain) runs for free.
 *
 * Phase B replaces this dump section by section with typed, presentational
 * components reading from `modules/spring2026/content/spring2026.json`. The wrapper
 * is `display:contents` so the ported tree behaves as if it were a direct child of
 * <body>, matching the original's layout exactly.
 */
export function App() {
  // The captured DOM ships a full-screen loading cover (`#page-loading-overlay`,
  // z-index max) that the original engine dismisses by adding `data-loaded` once it
  // signals ready. Until the real engine is wired up (Phase C), reproduce that ready
  // signal so the page reveals — using the original's own `[data-loaded]` transition.
  useEffect(() => {
    document.getElementById("page-loading-overlay")?.setAttribute("data-loaded", "");
  }, []);

  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: rawBody }} />;
}
