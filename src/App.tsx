import type { ReactNode } from "react";
import { Fragment, useEffect } from "react";
import { useScrollReveal } from "./shared/useScrollReveal";
import { useHeroExit } from "./shared/useHeroExit";
import { Chrome } from "./shared/chrome/Chrome";
import { Outro } from "./shared/components/Outro";
import { Hero } from "./modules/spring2026/components/hero/Hero";
import { StandardChapter } from "./modules/spring2026/components/chapters/StandardChapter";
import { Online } from "./modules/spring2026/components/chapters/Online";
import { Developer } from "./modules/spring2026/components/chapters/Developer";
import { Operations } from "./modules/spring2026/components/chapters/Operations";
import { Retail } from "./modules/spring2026/components/chapters/Retail";
import { Agentic } from "./modules/spring2026/components/chapters/Agentic";
import contentJson from "./modules/spring2026/content/spring2026.json";
import type { Spring2026Content } from "./modules/spring2026/content/types";

const content = contentJson as Spring2026Content;

// Chapters laid out as feature → card row → text-card row, all driven by the same
// component and their content.
const STANDARD_CHAPTERS = ["sidekick", "finance", "marketing", "shop-app", "payments"];

// Each chapter's component, keyed by section id.
const CHAPTERS: Record<string, ReactNode> = {
  hero: <Hero {...content.hero} />,
  ...Object.fromEntries(
    STANDARD_CHAPTERS.map((id) => [id, <StandardChapter id={id} content={content.chapters[id]} />]),
  ),
  online: <Online {...content.chapters.online} />,
  developer: <Developer {...content.chapters.developer} />,
  operations: <Operations {...content.chapters.operations} />,
  retail: <Retail {...content.chapters.retail} />,
  agentic: <Agentic {...content.chapters.agentic} />,
};

// Section order down the page.
const CHAPTER_ORDER = [
  "hero", "agentic", "sidekick", "online", "retail", "marketing",
  "operations", "shop-app", "payments", "finance", "developer",
];

/**
 * The page: the surrounding chrome (loader, nav, modals, WebGL background layer),
 * the `<main>` of chapter sections, and the footer — all reading from
 * `modules/spring2026/content/spring2026.json`.
 */
export function App() {
  // On mount, dismiss the full-screen loading cover and fire the hero text-reveal
  // signal: `[data-hero-text-revealed]` plays the staggered reveal of the hero
  // description + nav.
  useEffect(() => {
    document.getElementById("page-loading-overlay")?.setAttribute("data-loaded", "");
    document.documentElement.dataset.heroTextRevealed = "true";
  }, []);

  // Reveal each section's content as it scrolls into view, and fade the hero out once
  // scrolled past it.
  useScrollReveal();
  useHeroExit();

  return (
    <>
      <Chrome />
      <main>
        {CHAPTER_ORDER.map((id) => (
          <Fragment key={id}>{CHAPTERS[id]}</Fragment>
        ))}
      </main>
      <Outro {...content.outro} />
    </>
  );
}
