import type { Product } from "../../content/types";
import { FeatureArticle } from "./Article";
import { CardRow, TextCardRow } from "./Rows";

/** The body shared by the chapters laid out as feature → media-card row →
 *  text-card row (Sidekick, Finance, Marketing, Shop app, Payments). */
export function StandardChapterBody({
  feature,
  cards,
  textCards,
}: {
  feature: Product;
  cards: Product[];
  textCards: Product[];
}) {
  return (
    <div className="">
      <div className="flex flex-col">
        <div className="flex flex-col gap-40">
          <FeatureArticle product={feature} />
        </div>
        <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
          <CardRow products={cards} />
        </div>
        <div className="content-container md:pt-32 md:pb-0 md:mt-56">
          <TextCardRow products={textCards} />
        </div>
      </div>
    </div>
  );
}
