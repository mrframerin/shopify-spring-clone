import type { ChapterContent } from "../../content/types";
import { CardRow, TextCardRow, rowProducts } from "../kit/Rows";
import { RetailPos } from "./RetailPos";

/**
 * "Retail" chapter — a bespoke skeleton: a `#ballcap` 3D-merch target and a
 * "Retail Merch" hit-area, a title panel that fades with the scene, then the
 * content region. The 3D scene is the shared WebGL background (`HeroBackground`),
 * which reacts to pointer and scroll directly from the window.
 *
 * The opening feature is the interactive `shopify-pos-v11` POS widget (`RetailPos`
 * — a real `role="tablist"` whose panel media animates with the scene). The
 * media-card and text-card rows below use the shared chapter components.
 */
export function Retail({ title, rows }: ChapterContent) {
  const [, cards, textCards] = rows; // rows[0] is the POS feature, rendered by RetailPos
  return (
    <section id="retail" tabIndex={-1} className="relative outline-none">
      <div id="ballcap" aria-hidden="true" />
      <span hidden />
      <div className="absolute inset-0 z-0 md:not-touch-device:z-10 overflow-hidden pointer-events-none">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Retail Merch"
          aria-hidden="true"
          className="absolute left-0 top-0 hidden size-px origin-top-left rounded-full opacity-0 will-change-transform pointer-events-auto"
        />
      </div>
      <div className="relative min-h-[100svh] py-100 flex items-center box-border pointer-events-none transition-opacity duration-500 ease-in-out opacity-100">
        <div className="relative w-full max-w-content-lg xl:max-w-content mx-auto px-10 sm:px-30 md:px-32">
          <h2 className="t2 lg:t1 text-w100 text-left w-fit">{title}</h2>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm">
            <div className="section-hero-subhead invisible min-h-[1lh] col-span-6 sm:col-span-5 md:col-span-9 mt-24 sm:mt-40 md:mt-56 lg:mt-64 xl:mt-64" />
          </div>
          <button
            type="button"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-10 focus-visible:top-full focus-visible:mt-16 focus-visible:rounded-full focus-visible:bg-w100 focus-visible:px-24 focus-visible:py-12 focus-visible:text-b100 focus-visible:pointer-events-auto sm:focus-visible:left-30 md:focus-visible:left-32"
          >
            Retail Merch
          </button>
        </div>
      </div>
      <div className="relative isolate z-1 text-white pointer-events-auto">
        <div className="relative z-1">
          <div className="pb-64 md:pb-96">
            <div className="last:pb-0">
              <section className="relative">
                <div className="pb-16">
                  <div className="flex flex-col gap-40">
                    <RetailPos />
                  </div>
                </div>
                <div className="">
                  <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
                    <CardRow products={rowProducts(cards)} />
                  </div>
                  <div className="content-container md:pt-32 md:pb-0 md:mt-56">
                    <TextCardRow products={rowProducts(textCards)} />
                  </div>
                </div>
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
