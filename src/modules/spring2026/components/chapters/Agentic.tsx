import type { ChapterContent } from "../../content/types";
import { Card, FeatureArticle } from "../kit/Article";
import { ChapterShell } from "../kit/ChapterShell";
import { CardRow, TextCardRow, featureProduct, rowProducts } from "../kit/Rows";
import { AgenticDemoCarousel } from "./AgenticDemoCarousel";

/**
 * "Agentic" chapter — the one chapter with a visible subhead, and two groups each
 * led by a modal-video feature. The second group's card row ends with the
 * "experiences built with…" demo carousel (`AgenticDemoCarousel`), a CSS scroll-snap
 * card of demo previews. Everything else uses the shared chapter components.
 */
export function Agentic({ title, subhead, rows }: ChapterContent) {
  const [featureA, cards1, featureB, cards2, textCards] = rows;
  const cards2Products = rowProducts(cards2);
  return (
    <ChapterShell id="agentic" title={title} subhead={subhead}>
      <div className="pb-0 sm:pb-32 md:pb-56 mb-24 sm:mb-56">
        <div className="flex flex-col">
          <div className="flex flex-col gap-40">
            <FeatureArticle product={featureProduct(featureA)} />
          </div>
          <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
            <CardRow products={rowProducts(cards1)} />
          </div>
        </div>
      </div>
      <div className="pb-0">
        <div className="flex flex-col">
          <div className="flex flex-col gap-40">
            <FeatureArticle product={featureProduct(featureB)} />
          </div>
          <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm gap-y-44 md:gap-y-40 hover-grid">
              {cards2Products.map((product, i) => (
                <Card key={product.handle} product={product} index={i} />
              ))}
              <AgenticDemoCarousel />
            </div>
          </div>
          <div className="content-container md:pt-32 md:pb-0 md:mt-56">
            <TextCardRow products={rowProducts(textCards)} />
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
