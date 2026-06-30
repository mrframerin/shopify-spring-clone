import type { ElementType } from "react";

/**
 * Phase-A/B scaffold helper: renders a slice of the captured DOM verbatim in its
 * real position so the page stays whole and comparable while sections are converted
 * one at a time. The host element is `display:contents` so it adds no box of its own
 * and the ported markup behaves exactly as in the original tree.
 *
 * Every usage is temporary — each is replaced by a real component during Phase B and
 * the remaining ones are deleted in Phase D.
 */
export function RawHtml({ html, as: Tag = "div" }: { html: string; as?: ElementType }) {
  return <Tag style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
