import type { ChapterContent, ChapterRow } from "../../content/types";
import { FeatureArticle } from "../kit/Article";
import { ChapterSection } from "../kit/ChapterSection";
import { ChapterShell } from "../kit/ChapterShell";
import { CardRow, TextCardRow, featureProduct, rowProducts } from "../kit/Rows";

/** A heading section of one compact feature article above a text-only card row —
 *  the shape shared by Admin, Inventory, and Shipping. */
function FeatureTextSection({ heading, feature, text }: { heading: ChapterRow; feature: ChapterRow; text: ChapterRow }) {
  return (
    <ChapterSection spacing="pb-32 md:pb-56 mb-64 sm:mb-56" heading={heading.heading ?? ""}>
      <div className="flex flex-col gap-40">
        <FeatureArticle product={featureProduct(feature)} compact />
      </div>
      <div className="content-container md:pt-32 md:pb-0 mt-40 md:mt-56">
        <TextCardRow products={rowProducts(text)} variant="text-only" />
      </div>
    </ChapterSection>
  );
}

/**
 * "Operations" chapter — five titled sections. "Plugins" is a single media-card
 * row; "Admin", "Inventory", and "Shipping" each pair a compact feature with a
 * text-only card row; "Global" is a closing text-only card row.
 */
export function Operations({ title, subhead, rows }: ChapterContent) {
  const [plugins, pluginCards, admin, adminFeature, adminText, inventory, invFeature, invText, shipping, shipFeature, shipText, global, globalText] =
    rows;
  return (
    <ChapterShell id="operations" title={title} subhead={subhead}>
      <ChapterSection spacing="pb-32 md:pb-56 mb-64 sm:mb-56" heading={plugins.heading ?? ""}>
        <div className="content-container md:pb-0 mt-40 md:mt-56 pb-64">
          <CardRow products={rowProducts(pluginCards)} />
        </div>
      </ChapterSection>
      <FeatureTextSection heading={admin} feature={adminFeature} text={adminText} />
      <FeatureTextSection heading={inventory} feature={invFeature} text={invText} />
      <FeatureTextSection heading={shipping} feature={shipFeature} text={shipText} />
      <ChapterSection spacing="pb-0" heading={global.heading ?? ""}>
        <div className="content-container md:pt-32 md:pb-0">
          <TextCardRow products={rowProducts(globalText)} variant="text-only" />
        </div>
      </ChapterSection>
    </ChapterShell>
  );
}
