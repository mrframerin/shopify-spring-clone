// Content shapes for the Spring '26 page. Each section component is typed from its
// slice here; `spring2026.json` holds the values. Grows section by section (Phase B).

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

export interface Spring2026Content {
  hero: HeroContent;
  outro: OutroContent;
}
