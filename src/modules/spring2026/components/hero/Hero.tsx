import type { CSSProperties } from "react";
import { SplitText } from "../../../../shared/components/SplitText";
import { HeroRing } from "./HeroRing";
import type { HeroContent } from "../../content/types";

// Animation timing custom properties, identical for every item — presentational, so
// they live with the markup rather than in the content JSON.
const HERO_EXIT_VARS = {
  "--hero-text-intro-delay-mobile": "1000ms",
  "--hero-text-intro-delay-desktop": "2700ms",
} as CSSProperties;

const BASE_DELAY_VARS = {
  "--show-base-delay-mobile": "0ms",
  "--hide-base-delay-mobile": "300ms",
  "--show-base-delay-desktop": "0ms",
  "--hide-base-delay-desktop": "225ms",
} as CSSProperties;

const NAV_ITEM_VARS = { ...BASE_DELAY_VARS, "--underline-duration": "126ms" } as CSSProperties;

/**
 * Hero: the fixed `<h1>` whose word art ("Everywhere") is the 3D `HeroRing` behind
 * it, over a `.grid-container` overlay holding the description and the in-page
 * chapter nav. Both the description and the nav labels render through `SplitText`
 * for the per-letter reveal. The ring is a CSS 3D transform cylinder driven by
 * scroll and pointer — see `HeroRing`.
 */
export function Hero({ ringLabel, description, nav }: HeroContent) {
  return (
    <section
      id="hero"
      className="relative h-hero-scroll"
    >
      <span hidden />
      <div aria-hidden="true" className="absolute left-0 top-200 h-px w-px pointer-events-none" />

      <h1
        aria-label={ringLabel}
        className="fixed inset-x-0 top-[42.2vmin] tall-phone:top-[54.5vmin] small-phone:top-[30.8vmin] mobile-landscape:top-[2.8vmin] sm:top-[16.6vmin] xs-tall-responsive:top-[22.4vmin] tall-responsive:top-[8.6vmin] md:top-[12.6vmin] lg:top-[9.2vmin] z-0 flex justify-center pointer-events-none m-0 [--hero-ring-radius:37vmin]"
        style={
          { perspective: "5400px", "--hero-ring-letter-size": "calc(var(--hero-ring-radius) * 0.35)" } as CSSProperties
        }
      >
        <div className="w-[calc(var(--hero-ring-radius)*2)] h-[calc(var(--hero-ring-radius)*2)]">
          <HeroRing />
        </div>
      </h1>

      <div className="grid-container flex relative h-svh mobile-landscape:min-h-480 items-end pointer-events-none justify-center pb-[env(safe-area-inset-bottom)]">
        <div
          className="hero-exit flex flex-col sm:flex-row w-full sm:max-w-575 items-start gap-y-40 sm:gap-y-0 sm:gap-x-24 sm:justify-between px-20 pb-34 sm:pb-20"
          style={HERO_EXIT_VARS}
        >
          <div
            className="hero-description-text t5 [text-box:normal] pointer-events-auto w-full max-w-200 sm:max-w-180 sm:shrink-1"
            style={BASE_DELAY_VARS}
          >
            <div className="rich-text text-w100">
              <p>
                <span className="sr-only">{description}</span>
                <SplitText className="split-text inline-flex flex-wrap" text={description} />
              </p>
            </div>
          </div>

          <nav aria-label="Hero section navigation" className="pointer-events-auto w-full sm:w-auto">
            <ul className="hero-nav-list grid max-sm:grid-cols-2 grid-rows-[repeat(5,auto)] sm:grid-rows-[repeat(4,auto)] gap-y-12 sm:gap-y-4 gap-x-40 justify-between max-sm:justify-start text-w100 grid-flow-col grow-1">
              {nav.map((item) => (
                <li key={item.handle} className="shrink-0" style={NAV_ITEM_VARS}>
                  <a
                    href={item.href}
                    className="[text-box:normal] t5 text-theme-link visited:text-theme-link focus-visible:ring-1 focus-visible:ring-theme-focus-ring outline-none hero-reveal-underline relative inline-block no-underline"
                  >
                    <span className="sr-only">{item.label}</span>
                    <SplitText
                      className="split-text inline-flex flex-wrap whitespace-nowrap"
                      text={item.label}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
