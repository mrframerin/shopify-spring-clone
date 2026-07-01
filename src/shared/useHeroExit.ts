import { useEffect } from "react";

/**
 * Fades the hero out as you scroll past it.
 *
 * The hero description + in-page nav are pinned as a persistent overlay and revealed
 * on load (`data-hero-text-revealed`). Setting `data-hero-exited` once you scroll well
 * past the hero drives the CSS that: fades the hero text/nav out, drops `.hero-exit`
 * to `pointer-events:none` (so it stops covering content), and reveals the floating
 * pill nav. We toggle that flag from scroll position — the hero persists through the
 * top of the first chapter, then exits.
 */
const EXIT_AT = 3.5; // viewport-heights of scroll before the hero exits

export function useHeroExit() {
  useEffect(() => {
    const root = document.documentElement;
    let exited = false;
    const update = () => {
      const shouldExit = window.scrollY > window.innerHeight * EXIT_AT;
      if (shouldExit === exited) return;
      exited = shouldExit;
      if (exited) {
        root.dataset.heroExited = "true"; // reveals the pill nav; drops .hero-exit pointer-events
        root.dataset.heroHasExited = "true";
        root.dataset.heroSplitTextHidden = "true"; // fades the .hero-exit block out
      } else {
        delete root.dataset.heroExited;
        delete root.dataset.heroSplitTextHidden;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
}
