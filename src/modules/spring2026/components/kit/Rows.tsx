import type { ChapterRow, Product } from "../../content/types";
import { Card } from "./Article";

/** Products of a content row (empty for heading rows). */
export const rowProducts = (row: ChapterRow): Product[] => row.products ?? [];

/** The single product of a feature row. */
export function featureProduct(row: ChapterRow): Product {
  const product = row.products?.[0];
  if (!product) throw new Error(`feature row has no product (layout=${row.layout})`);
  return product;
}

/** A row of media cards in the 12-col subgrid (`hover-grid` enables the row's
 *  hover-dim interaction). `cols` is the md-breakpoint column count (3 by default;
 *  2 for the wider cards). The outer spacing wrapper is owned by the chapter. */
export function CardRow({ products, cols = 3 }: { products: Product[]; cols?: 2 | 3 }) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm gap-y-44 md:gap-y-40 hover-grid">
      {products.map((product, i) => (
        <Card key={product.handle} product={product} index={i} cols={cols} />
      ))}
    </div>
  );
}

/** A row of text-only cards. `variant` selects the grid flavour: the default carries
 *  a top divider on mobile; `text-only` drops it. */
export function TextCardRow({
  products,
  variant = "default",
}: {
  products: Product[];
  variant?: "default" | "text-only";
}) {
  const tail =
    variant === "text-only" ? "text-only-grid" : "border-t border-w10 md:border-t-0";
  return (
    <div
      className={`text-card-grid grid grid-cols-6 md:grid-cols-12 gap-x-grid-gutter sm:gap-x-grid-gutter-sm gap-y-48 md:gap-y-64 pt-40 md:pt-0 ${tail}`}
    >
      {products.map((product, i) => (
        <Card key={product.handle} product={product} index={i} />
      ))}
    </div>
  );
}
