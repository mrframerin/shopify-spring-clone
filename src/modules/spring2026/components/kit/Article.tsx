import { useId } from "react";
import type { Cta, Product } from "../../content/types";
import { Media } from "./Media";
import { RichText } from "./RichText";
import { CtaTitleLink, CtaXxlButton, TitleLink } from "./links";

/** Number of columns a card row uses at the `md` breakpoint (sm is always 2). */
type Cols = 2 | 3;
const colSpanClass: Record<Cols, string> = {
  3: "col-span-6 sm:col-span-3 md:col-span-4",
  2: "col-span-6 sm:col-span-3 md:col-span-6",
};

// Per-breakpoint stagger classes, written as static literals so Tailwind's source
// scanner generates them (interpolated class fragments are invisible to it).
const SM_INDEX = ["", "sm:[--scroll-reveal-index:1]"];
const MD_INDEX = [
  "md:[--scroll-reveal-index:0]",
  "md:[--scroll-reveal-index:1]",
  "md:[--scroll-reveal-index:2]",
];

/** Per-card scroll-reveal stagger: sets `--scroll-reveal-index` to the card's column
 *  position per breakpoint (1 col mobile, 2 at sm, mdCols at md) — base 0, sm = i%2,
 *  md = i%mdCols — so cards in the same row reveal in a left-to-right cascade. */
function revealIndex(i: number, mdCols: Cols): string {
  return ["[--scroll-reveal-index:0]", SM_INDEX[i % 2], MD_INDEX[i % mdCols]]
    .filter(Boolean)
    .join(" ");
}

/** Standalone CTAs rendered below body copy. */
function Ctas({ ctas }: { ctas: Cta[] }) {
  return (
    <div className="flex flex-wrap items-center gap-16">
      {ctas.map((cta, i) => {
        if (cta.kind === "title-link") {
          return <CtaTitleLink key={i} label={cta.label} href={cta.href} target={cta.target} ariaLabel={cta.ariaLabel} />;
        }
        if (cta.kind === "xxl-button") {
          return <CtaXxlButton key={i} label={cta.label} href={cta.href} target={cta.target} ariaLabel={cta.ariaLabel} />;
        }
        return null;
      })}
    </div>
  );
}

/** The full-bleed feature article that opens most chapters: media above
 *  (`order-2`), heading + description + CTAs below in a 12-col content grid. */
export function FeatureArticle({
  product,
  descGap = "gap-16",
  compact = false,
}: {
  product: Product;
  /** Gap between description copy and its CTAs; a couple of chapters use gap-20. */
  descGap?: "gap-16" | "gap-20";
  /** Tighter top padding (pt-32/pt-16) used by features inside heading sections. */
  compact?: boolean;
}) {
  const titleId = useId();
  return (
    <article
      className="flex flex-col col-span-full"
      id={product.handle}
      aria-labelledby={titleId}
    >
      {product.media ? (
        <div className="order-2 w-full mx-auto sm:max-w-content-lg xl:max-w-content sm:px-32">
          <Media media={product.media} context="feature" />
        </div>
      ) : null}
      <div
        className={`gap-y-12 content-container grid grid-cols-1 md:grid-cols-12 gap-x-grid-gutter md:gap-x-grid-gutter-sm md:py-48 pb-32 ${
          compact ? "pt-32" : "pt-52"
        } scroll-reveal-trigger`}
      >
        <h3 className="scroll-reveal t3 md:col-span-7 xl:col-span-5 text-w100" id={titleId}>
          {product.title}
        </h3>
        <div
          className={`flex flex-col ${descGap} scroll-reveal [--scroll-reveal-index:1] md:pt-12 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9 xl:col-span-3 xl:col-start-10 ${
            compact ? "pt-16" : "pt-20"
          }`}
        >
          {product.body ? <RichText body={product.body} /> : null}
          {product.ctas?.length ? <Ctas ctas={product.ctas} /> : null}
        </div>
      </div>
    </article>
  );
}

/** A subgrid card: optional media, a (usually linked) heading, and body copy.
 *  Serves both media-card rows and text-only-card rows — text cards simply omit
 *  the media. `index` is the card's position within its row (drives the stagger). */
export function Card({ product, index, cols = 3 }: { product: Product; index: number; cols?: Cols }) {
  const titleId = useId();
  return (
    <article
      className={`grid grid-cols-subgrid content-start gap-y-16 ${colSpanClass[cols]} scroll-reveal-trigger ${revealIndex(
        index,
        cols,
      )}`}
      id={product.handle}
      aria-labelledby={titleId}
    >
      {product.media ? (
        <div className="col-span-full">
          <Media media={product.media} context="card" />
        </div>
      ) : null}
      <div className="gap-y-12 col-span-full flex flex-col scroll-reveal">
        <h3 className="text-theme-heading t5" id={titleId}>
          {product.titleLink ? (
            <TitleLink link={product.titleLink}>{product.title}</TitleLink>
          ) : (
            product.title
          )}
        </h3>
        {product.body ? (
          <div className="flex flex-col gap-12">
            <RichText body={product.body} />
          </div>
        ) : null}
        {product.ctas?.length ? <Ctas ctas={product.ctas} /> : null}
      </div>
    </article>
  );
}
