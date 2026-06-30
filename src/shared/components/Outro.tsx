import type { OutroContent } from "../../modules/spring2026/content/types";

/**
 * Footer / outro region: a top rule, the copyright line, and legal links. The
 * wrapper keeps `data-section-key="outro"` / `data-nav-trigger="true"` so the scroll
 * engine treats it as the final section (Phase C).
 */
export function Outro({ copyright, links }: OutroContent) {
  return (
    <div
      className="relative isolate z-1 -mt-px bg-b100 text-white"
      data-section-key="outro"
      data-nav-trigger="true"
    >
      <div className="relative z-1">
        <footer className="content-container pb-40">
          <div className="border-t border-w20" />
          <div className="flex flex-wrap items-center gap-x-48 gap-y-24 pt-40">
            <p className="t5 text-w100">{copyright}</p>
            <div className="flex flex-wrap gap-x-24 gap-y-0">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t6 -my-16 inline-flex py-16 text-w70 whitespace-nowrap"
                >
                  <span className="link-underline">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
