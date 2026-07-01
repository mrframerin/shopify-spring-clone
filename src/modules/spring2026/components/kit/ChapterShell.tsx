import type { ReactNode } from "react";

/**
 * The shared skeleton every product chapter is built on: a full-height title panel
 * (heading + optional subhead) followed by the content region holding the chapter's
 * rows and the focus-only "Back to navigation" affordance. The chapter's bespoke row
 * spacing lives in `children`.
 */
export function ChapterShell({
  id,
  title,
  subhead,
  children,
}: {
  id: string;
  title: string;
  subhead: string | null;
  children: ReactNode;
}) {
  return (
    <section id={id} tabIndex={-1} className="relative outline-none">
      <span hidden />
      <div className="relative min-h-[100svh] py-100 flex items-center box-border pointer-events-none">
        <div
          className="w-full max-w-content-lg xl:max-w-content mx-auto px-16 sm:px-30 md:px-32"
        >
          <h2 className="t2 lg:t1 text-w100 text-left">{title}</h2>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm">
            {subhead ? (
              <div className="rich-text section-hero-subhead text-w100 pointer-events-auto col-span-6 sm:col-span-5 md:col-span-9 mt-24 sm:mt-40 md:mt-56 lg:mt-64 xl:mt-64">
                <p>{subhead}</p>
              </div>
            ) : (
              <div className="section-hero-subhead invisible min-h-[1lh] col-span-6 sm:col-span-5 md:col-span-9 mt-24 sm:mt-40 md:mt-56 lg:mt-64 xl:mt-64" />
            )}
          </div>
        </div>
      </div>
      <div className="relative isolate z-1 text-white pointer-events-auto">
        <div className="relative z-1">
          <div className="pb-64 md:pb-96">
            <div className="last:pb-0">
              <section className="relative pt-24">
                {children}
                <div className="content-container pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-[calc(100%+16px)]">
                  <button
                    type="button"
                    className="relative z-20 block w-fit rounded-full bg-w100 px-16 py-8 t5 text-b100 opacity-0 pointer-events-none transition-opacity duration-150 outline-none focus:pointer-events-auto focus:opacity-100 focus-visible:ring-1 focus-visible:ring-theme-focus-ring focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2"
                  >
                    Back to navigation
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
