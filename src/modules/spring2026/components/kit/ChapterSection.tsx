import type { ReactNode } from "react";

/**
 * A titled section within a chapter (Developer, Operations): a group `<h3>` heading
 * above a `flex flex-col` stack of rows. The outer `spacing` wrapper carries the gap
 * to the next section and varies per section, so the caller passes it in.
 */
export function ChapterSection({
  spacing,
  heading,
  children,
}: {
  spacing: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className={spacing}>
      <div className="scroll-reveal-trigger content-container pt-32 md:pt-0">
        <h3 className="scroll-reveal t5 text-w60 mt-0 md:mt-48 pb-24 md:pb-32 mb-24 border-b border-w10">
          {heading}
        </h3>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
