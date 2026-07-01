// Content shapes for the Spring '26 page. Each section component is typed from these;
// `spring2026.json` holds the values.

export interface LinkItem {
  label: string;
  href: string;
}

export interface HeroNavItem {
  label: string;
  href: string;
  handle: string;
}

export interface HeroContent {
  ringLabel: string;
  description: string;
  nav: HeroNavItem[];
}

export interface OutroContent {
  copyright: string;
  links: LinkItem[];
}

// --- Chapter content (the 10 product chapters) ----------------------------------

/** The single <img> a media block shows (still for images, poster for rive/video). */
export interface MediaImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: string;
  height?: string;
  aspect?: string; // CSS aspect-ratio from the element's own width/height
}

/** A product's media: a still image, a Rive animation, or a modal-launched video.
 *  For rive/video the live source is loaded at runtime; the poster image rendered
 *  here stands in until then. */
export interface ProductMedia {
  kind: "image" | "rive" | "video";
  image: MediaImage;
  mediaAspect?: string; // the wrapper's --media-aspect (feature blocks)
  transitionId?: string; // video: ties the play button to the video modal
  playLabel?: string; // video: the play button's aria-label
  videoSrc?: string; // video: direct source for the modal player; loaded at runtime, so usually absent
}

/** A link interleaved in rich-text body copy. */
export interface InlineLink {
  text: string;
  href: string;
  target?: string;
  tooltip?: string;
  handle?: string;
}

/** One rich-text paragraph: a sequence of plain runs, inline links, and breaks. */
export type Segment = string | InlineLink | { br: true };

/** The link wrapping a card/feature title. */
export interface TitleLink {
  href: string;
  target?: string;
  tooltip?: string;
  ariaLabel?: string;
}

/** A standalone call-to-action below the body copy. */
export type Cta =
  | { kind: "title-link"; label: string; href: string; target?: string; tooltip?: string; ariaLabel?: string }
  | { kind: "xxl-button"; label: string; href: string; target?: string; ariaLabel?: string };

export interface Product {
  handle: string;
  title: string;
  titleLink?: TitleLink;
  media?: ProductMedia;
  body?: Segment[][];
  ctas?: Cta[];
}

export type RowLayout = "feature" | "cards" | "text-cards" | "heading";

/** A content row of products, or a group heading that subdivides a chapter into
 *  sections (operations, developer). Heading rows carry `heading`, not products. */
export interface ChapterRow {
  layout: RowLayout;
  products?: Product[];
  heading?: string;
}

export interface ChapterContent {
  title: string;
  subhead: string | null;
  rows: ChapterRow[];
}

export interface Spring2026Content {
  hero: HeroContent;
  outro: OutroContent;
  chapters: Record<string, ChapterContent>;
}
