import { Fragment } from "react";
import type { Segment } from "../../content/types";
import { BodyLink } from "./links";

/** A product's body copy: the `.rich-text` block of paragraphs, each a sequence of
 *  text runs and inline links. Text runs are rendered as string expressions so their
 *  exact spacing is preserved. */
export function RichText({ body }: { body: Segment[][] }) {
  return (
    <div className="rich-text text-theme-body t5">
      {body.map((paragraph, i) => (
        <p key={i}>
          {paragraph.map((seg, j) => {
            if (typeof seg === "string") return <Fragment key={j}>{seg}</Fragment>;
            if ("br" in seg) return <br key={j} />;
            return <BodyLink key={j} link={seg} />;
          })}
        </p>
      ))}
    </div>
  );
}
