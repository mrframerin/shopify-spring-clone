import type { ChapterContent } from "../../content/types";
import { Card, FeatureArticle } from "../kit/Article";
import { ChapterSection } from "../kit/ChapterSection";
import { ChapterShell } from "../kit/ChapterShell";
import { CardRow, TextCardRow, featureProduct, rowProducts } from "../kit/Rows";

/**
 * "Developer" chapter — two titled sections. "Platform" leads with a feature
 * article, a card row of two wide (2-up) cards followed by three normal (3-up)
 * cards in the same grid, then a text-card row; "Apps + Extensions" is a media-card
 * row and a text-card row. Features in these heading sections use compact padding.
 */
export function Developer({ title, subhead, rows }: ChapterContent) {
  const [platform, feature, platformCards, platformText, apps, appCards, appsText] = rows;
  const cards = rowProducts(platformCards);
  return (
    <ChapterShell id="developer" title={title} subhead={subhead}>
      <ChapterSection spacing="pb-32 md:pb-56 mb-64 sm:mb-56" heading={platform.heading ?? ""}>
        <div className="flex flex-col gap-40">
          <FeatureArticle product={featureProduct(feature)} compact />
        </div>
        <div className="content-container md:pb-0 mt-40 md:mt-56 pb-64">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm gap-y-44 md:gap-y-40 hover-grid">
            {cards.slice(0, 2).map((p, i) => (
              <Card key={p.handle} product={p} index={i} cols={2} />
            ))}
            {cards.slice(2).map((p, i) => (
              <Card key={p.handle} product={p} index={i} cols={3} />
            ))}
          </div>
        </div>
        <div className="content-container md:pt-32 md:pb-0 md:mt-56">
          <TextCardRow products={rowProducts(platformText)} />
        </div>
      </ChapterSection>
      <ChapterSection spacing="pb-0" heading={apps.heading ?? ""}>
        <div className="content-container md:pb-0 mt-40 md:mt-56 pb-64">
          <CardRow products={rowProducts(appCards)} />
        </div>
        <div className="content-container md:pt-32 md:pb-0 md:mt-56">
          <TextCardRow products={rowProducts(appsText)} />
        </div>
      </ChapterSection>
    </ChapterShell>
  );
}
