import { useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

// The bespoke `shopify-pos-v11` feature: a tablist whose panel shows the
// WebGL/Theatre.js POS scene. The four tabs switch the demo step shown in the panel.
const HEADING = "Our fastest-ever POS";
const DESCRIPTION =
  "Save over a minute when creating new customers, adding products, and checking out in a cart that’s always present. The line never stops, and staff focus on customers.";
const CTA = {
  label: "Read about our latest version",
  ariaLabel: "Read about our latest version, Our fastest-ever POS",
  href: "https://www.shopify.com/blog/retail-roundup-february-2026",
};
const TABS = ["Add product", "Custom discount", "Add customer", "Split payment"];

/**
 * Interactive POS feature (`#shopify-pos-v11`). The `role="tablist"` selects which
 * POS demo step is shown; the panel media itself is painted by the 3D scene.
 * Implements the WAI-ARIA tabs pattern: roving tabindex, arrow/Home/End keys, and
 * `aria-selected`/`aria-labelledby` kept in sync with the visible selection.
 */
export function RetailPos() {
  const base = useId();
  const headingId = `${base}-h`;
  const panelId = `${base}-panel`;
  const tabId = (i: number) => `${base}-tab-${i}`;
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = TABS.length - 1;
    let next = selected;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = selected === last ? 0 : selected + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = selected === 0 ? last : selected - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <article
      className="-mt-px flex flex-col col-span-full global-lg:pb-140"
      id="shopify-pos-v11"
      aria-labelledby={headingId}
    >
      <div className="scroll-reveal-trigger content-container grid grid-cols-1 md:grid-cols-12 gap-x-grid-gutter md:gap-x-grid-gutter-sm gap-y-16 pb-32 md:pb-48 pt-96 md:pt-144">
        <h3 id={headingId} className="scroll-reveal text-w100 t3 md:col-span-7 xl:col-span-5">
          {HEADING}
        </h3>
        <div className="scroll-reveal [--scroll-reveal-index:1] flex flex-col t5 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9 xl:col-span-3 xl:col-start-10 gap-16">
          <div className="rich-text text-white/60">
            <p>{DESCRIPTION}</p>
          </div>
          <div className="flex flex-wrap items-center gap-16">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="[text-box:normal] t5 text-theme-link visited:text-theme-link link-underline focus-visible:ring-1 focus-visible:ring-theme-focus-ring outline-none self-start"
              href={CTA.href}
              aria-label={CTA.ariaLabel}
            >
              {CTA.label}
            </a>
          </div>
        </div>
      </div>
      <div className="relative content-container global-lg:grid global-lg:grid-cols-12 global-lg:gap-x-grid-gutter global-lg:items-center global-lg:mt-20">
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(selected)}
          className="media-wrapper relative aspect-733/522 global-lg:col-span-8 global-lg:col-start-3"
        />
        <div className="-mx-16 sm:-mx-32 global-lg:mx-0 relative my-20 global-lg:my-0 global-lg:col-span-2 global-lg:col-start-1 global-lg:row-start-1">
          <ul
            role="tablist"
            aria-label="POS features"
            className="scroll-reveal-trigger flex flex-row gap-32 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[50%] py-4 -my-4 global-lg:flex-col global-lg:overflow-visible global-lg:snap-none global-lg:px-0 global-lg:w-fit global-lg:mx-0 global-lg:gap-24"
          >
            {TABS.map((label, i) => (
              <li
                key={label}
                className="scroll-reveal snap-center shrink-0"
                style={{ "--scroll-reveal-index": i } as CSSProperties}
                role="presentation"
              >
                <button
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(i)}
                  aria-selected={i === selected}
                  aria-controls={panelId}
                  tabIndex={i === selected ? 0 : -1}
                  onClick={() => setSelected(i)}
                  onKeyDown={onKeyDown}
                  className="t4 inline-block w-auto text-white text-left rounded-[4px] outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent forced-colors:focus-visible:outline forced-colors:focus-visible:outline-1 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[Highlight] global-lg:block"
                >
                  <span
                    className={`transition-opacity duration-200 ${i === selected ? "opacity-100" : "opacity-50"}`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
