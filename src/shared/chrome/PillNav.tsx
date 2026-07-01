import { useEffect, useId, useState } from "react";
import type { CSSProperties } from "react";
import { SplitText } from "../components/SplitText";
import contentJson from "../../modules/spring2026/content/spring2026.json";
import type { Spring2026Content } from "../../modules/spring2026/content/types";

const content = contentJson as Spring2026Content;

// The floating nav lists the chapter sections in document order (everything under
// `<main>` except the hero), labelled by each chapter's title.
const SECTIONS = [
  "agentic", "sidekick", "online", "retail", "marketing",
  "operations", "shop-app", "payments", "finance", "developer",
].map((id) => ({ id, title: content.chapters[id].title }));

/**
 * The floating "pill" section nav (desktop only). Clicking the summary expands the
 * list (the expand/collapse visuals are entirely CSS, keyed off `data-pill-open`);
 * as the page scrolls, the summary swaps to the section crossing the viewport centre
 * and that item is marked current.
 */
export function PillNav() {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  // Current section = the last one whose top has passed the viewport's vertical
  // centre line (deterministic on every scroll frame — a zero-height observer root
  // is unreliable). rAF-throttled so it costs nothing between frames.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id));
    let ticking = false;
    const compute = () => {
      ticking = false;
      const mid = window.innerHeight / 2;
      let idx = 0;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      }
      setCurrent(idx);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const currentTitle = SECTIONS[current]?.title ?? SECTIONS[0].title;

  return (
    <div
      data-merch-open="false"
      data-pill-open={open ? "true" : "false"}
      className="pill-shell fixed bottom-0 left-1/2 z-50 px-8 pt-8 pb-10 hidden global-lg:block print:hidden"
    >
      <nav
        aria-label="Floating section navigation"
        className="pill relative grid w-190 content-end overflow-hidden text-b100"
      >
        <button
          type="button"
          aria-controls={listId}
          aria-expanded={open}
          aria-label={`${open ? "Close" : "Open"} floating section navigation, current section ${currentTitle}`}
          onClick={() => setOpen((o) => !o)}
          className="pill-summary relative flex h-35 w-full min-w-0 self-end appearance-none items-center justify-between gap-16 border-0 bg-transparent px-12 t5 text-b100 outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden="true"
            className="pill-summary-labels relative flex h-full min-w-0 flex-1 items-center overflow-hidden"
          >
            {SECTIONS.map((s, i) => (
              <span
                key={s.id}
                className="pill-summary-label absolute inset-0 flex h-full items-center"
                data-active={i === current ? "true" : "false"}
              >
                <SplitText
                  text={s.title}
                  className="split-text inline-flex flex-wrap whitespace-nowrap"
                  showStep={24}
                  hideStep={12}
                  hideReverse={false}
                />
              </span>
            ))}
          </span>
          <span aria-hidden="true" className="flex flex-col gap-2 w-15 shrink-0">
            <span className="block w-full h-px bg-b100" />
            <span className="block w-full h-px bg-b100" />
            <span className="block w-full h-px bg-b100" />
          </span>
        </button>
        <div
          {...(!open ? { inert: "" } : {})}
          aria-hidden={!open}
          className="pill-list-row relative self-end min-h-0 overflow-hidden pointer-events-none"
        >
          <ul id={listId} className="pill-list flex min-h-0 flex-col py-6">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="h-24">
                <a
                  href={`#${s.id}`}
                  {...(i === current ? { "aria-current": "location" as const } : {})}
                  style={{ "--idx": i, "--last": SECTIONS.length - 1 } as CSSProperties}
                  className="pill-item flex h-full w-full items-center px-12 t5 text-left no-underline text-b100 group outline-none focus-visible:ring-1 focus-visible:ring-theme-focus-ring focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2"
                >
                  <span
                    className={`pill-item-label relative inline-flex items-center text-trim-both motion-safe:transition-opacity motion-safe:duration-220 motion-safe:ease-snappy ${
                      i === current ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {s.title}
                    <span className="pill-item-underline pointer-events-none absolute inset-x-0 origin-left rounded-full bg-current" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
