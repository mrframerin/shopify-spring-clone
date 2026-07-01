import type { ChapterContent } from "../../content/types";
import { FeatureArticle } from "../kit/Article";
import { ChapterShell } from "../kit/ChapterShell";
import { CardRow, TextCardRow, featureProduct, rowProducts } from "../kit/Rows";

/**
 * "Online" chapter: two product groups. The first (feature → media cards → text
 * cards) sits in a wrapper that adds the trailing gap before the second group
 * (media cards → text cards); the spacing between the groups lives on those two wrappers.
 */
export function Online({ title, subhead, rows }: ChapterContent) {
  const [feature, cards1, textCards1, cards2, textCards2] = rows;
  return (
    <ChapterShell id="online" title={title} subhead={subhead}>
      <div className="pb-0 sm:pb-32 md:pb-56 mb-24 sm:mb-56">
        <div className="flex flex-col">
          <div className="flex flex-col gap-40">
            <FeatureArticle product={featureProduct(feature)} descGap="gap-20" />
          </div>
          <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
            <CardRow products={rowProducts(cards1)} />
          </div>
          <div className="content-container md:pt-32 md:pb-0 md:mt-56">
            <TextCardRow products={rowProducts(textCards1)} />
          </div>
        </div>
      </div>
      <div className="pb-0">
        <div className="flex flex-col">
          <div className="content-container md:pb-0 mt-40 md:mt-56 pb-32 sm:pb-64">
            <CardRow products={rowProducts(cards2)} />
          </div>
          <div className="content-container md:pt-32 md:pb-0 md:mt-56">
            <TextCardRow products={rowProducts(textCards2)} />
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
