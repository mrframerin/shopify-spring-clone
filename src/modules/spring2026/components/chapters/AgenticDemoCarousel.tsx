import { useId } from "react";
import {
  DEMO_DESCRIPTION,
  DEMO_SLIDES,
  DEMO_TEXT_LINKS,
  DEMO_TITLE,
  DEMO_TITLE_HREF,
  DEMO_TITLE_TOOLTIP,
} from "./agenticDemoCarousel.data";

/**
 * The Agentic chapter's "Experiences built with Catalog API & UCP" card (third card
 * of the second group). A horizontal scroll-snap carousel of demo posters — its
 * scroll/scale is pure CSS (`view-timeline`-driven `demo-slide-scale`), no JS — over
 * a title, blurb, and a matching list of demo links. Content lives in
 * `agenticDemoCarousel.data.ts`.
 */
export function AgenticDemoCarousel() {
  const headingId = useId();
  const tooltipId = useId();
  return (
    <article
      className="scroll-reveal-trigger flex flex-col gap-16 col-span-6 sm:col-span-3 md:col-span-4 [--scroll-reveal-index:0] md:[--scroll-reveal-index:2]"
      id="experiences-built-with-catalog-api-and-universal-commerce-protocol"
      aria-labelledby={headingId}
    >
      <div>
        <div className="media-wrapper relative overflow-hidden aspect-4/3" aria-hidden="true">
          <ul className="flex flex-row items-center w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto">
            {DEMO_SLIDES.map((slide, i) => (
              <li
                key={i}
                className="flex items-center justify-center shrink-0 grow-0 snap-center snap-always scale-75 supports-[animation-timeline:view()]:[view-timeline-name:--demo-slide] supports-[animation-timeline:view()]:[view-timeline-axis:inline] supports-[animation-timeline:view()]:[animation:demo-slide-scale_linear] supports-[animation-timeline:view()]:[animation-timeline:--demo-slide] basis-3/4 aspect-[253/174]"
              >
                <a
                  href={slide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block size-full rounded-3"
                  tabIndex={-1}
                >
                  <img
                    alt=""
                    decoding="async"
                    loading="lazy"
                    sizes={slide.img.sizes}
                    src={slide.img.src}
                    srcSet={slide.img.srcSet}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="scroll-reveal flex flex-col gap-y-24">
        <div className="flex flex-col gap-y-12">
          <h3 className="text-theme-heading t5" id={headingId}>
            <a
              className="relative link-underline text-theme-link visited:text-theme-link outline-none ring-offset-1 focus-visible:ring-1 focus-visible:ring-theme-focus-ring [text-box:normal] t5 text-left"
              aria-describedby={tooltipId}
              rel="noopener noreferrer"
              href={DEMO_TITLE_HREF}
              target="_blank"
            >
              {DEMO_TITLE}
            </a>
            <span id={tooltipId} hidden>
              {DEMO_TITLE_TOOLTIP}
            </span>
          </h3>
          <div className="rich-text text-theme-body t5">
            <p>{DEMO_DESCRIPTION}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-12 gap-y-8 t5 text-[13px]">
          {DEMO_TEXT_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-x-8 whitespace-nowrap text-theme-link visited:text-theme-link outline-none ring-offset-1 focus-visible:ring-1 focus-visible:ring-theme-focus-ring"
                aria-label={link.ariaLabel}
              >
                <span className={link.iconWrapClass}>
                  <img
                    src={link.iconSrc}
                    alt=""
                    aria-hidden="true"
                    width="20"
                    height="20"
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="link-underline">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
