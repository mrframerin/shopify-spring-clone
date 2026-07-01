import { useEffect } from "react";

/**
 * Reveals each section as it scrolls into view.
 *
 * The CSS fades + slides every `.scroll-reveal` element in from `opacity/translate`
 * driven by the inherited `--scroll-reveal` custom property (a registered `@property`,
 * 0 → 1), staggered per card by `--scroll-reveal-index`. An IntersectionObserver sets
 * that variable to 1 on each `.scroll-reveal-trigger` as it enters view; its
 * `.scroll-reveal` descendants inherit it and transition in. `prefers-reduced-motion`
 * jumps straight to the revealed state.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reveal = (el: Element) => (el as HTMLElement).style.setProperty("--scroll-reveal", "1");
    const triggers = document.querySelectorAll<HTMLElement>(".scroll-reveal-trigger");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      triggers.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      // reveal a touch before fully in view
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    triggers.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}
