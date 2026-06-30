import { useEffect } from "react";
import { RawHtml } from "./shared/components/RawHtml";
import { Outro } from "./shared/components/Outro";
import { Hero } from "./modules/spring2026/components/hero/Hero";
import contentJson from "./modules/spring2026/content/spring2026.json";
import type { Spring2026Content } from "./modules/spring2026/content/types";

const content = contentJson as Spring2026Content;

// --- Phase-A/B scaffold dumps ---------------------------------------------------
// The captured DOM, split into its real top-level regions and the 11 chapter
// sections. Each is rendered verbatim until it is replaced by a typed component
// (Phase B). The glob set shrinks naturally as dumps are deleted.
const regionFiles = import.meta.glob("./modules/spring2026/_dump/regions/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const sectionFiles = import.meta.glob("./modules/spring2026/_dump/sections/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const region = (key: string) =>
  regionFiles[`./modules/spring2026/_dump/regions/${key}.html`];
const section = (id: string) =>
  sectionFiles[`./modules/spring2026/_dump/sections/${id}.html`];

const CHAPTERS = [
  "hero", "agentic", "sidekick", "online", "retail", "marketing",
  "operations", "shop-app", "payments", "finance", "developer",
] as const;

/**
 * The page shell: the original body's wrapper ancestry rebuilt as JSX (chrome
 * regions → `#background-container` canvas layer → `<main>` chapters → outro), with
 * each region/section still a raw dump. Phase B swaps them for components reading
 * from `modules/spring2026/content/spring2026.json`; Phase C wires the 3D engine
 * into `#background-container`.
 */
export function App() {
  // Stand-in for the engine ready signal (until Phase C): dismiss the captured
  // full-screen loading cover via its own `[data-loaded]` transition so the page reveals.
  useEffect(() => {
    document.getElementById("page-loading-overlay")?.setAttribute("data-loaded", "");
  }, []);

  return (
    <>
      <RawHtml html={region("shared-tooltip")} />
      <RawHtml html={region("page-loading-style")} />
      <RawHtml html={region("page-loading-overlay")} />
      <RawHtml html={region("top-nav-gradient")} />
      <RawHtml html={region("signup-modal")} />
      <RawHtml html={region("video-modal")} />
      <RawHtml html={region("background-container")} />
      <RawHtml html={region("pill-nav")} />

      <main>
        <Hero {...content.hero} />
        {CHAPTERS.filter((id) => id !== "hero").map((id) => (
          <RawHtml key={id} html={section(id)} />
        ))}
      </main>

      <Outro {...content.outro} />
    </>
  );
}
