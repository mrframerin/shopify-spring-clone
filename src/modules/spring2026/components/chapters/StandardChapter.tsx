import type { ChapterContent } from "../../content/types";
import { ChapterShell } from "../kit/ChapterShell";
import { StandardChapterBody } from "../kit/StandardChapterBody";
import { featureProduct, rowProducts } from "../kit/Rows";

/**
 * A chapter whose body is exactly: a feature article, a row of media cards, then a
 * row of text-only cards. Five chapters share this shape — Sidekick, Finance,
 * Marketing, Shop app, Payments — differing only in id and content.
 */
export function StandardChapter({ id, content }: { id: string; content: ChapterContent }) {
  const [feature, cards, textCards] = content.rows;
  return (
    <ChapterShell id={id} title={content.title} subhead={content.subhead}>
      <StandardChapterBody
        feature={featureProduct(feature)}
        cards={rowProducts(cards)}
        textCards={rowProducts(textCards)}
      />
    </ChapterShell>
  );
}
