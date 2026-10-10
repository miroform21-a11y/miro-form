/**
 * Shapes of the editable site content (one object per language, see content/index.ts).
 * The public components render exactly these values; the future /admin edits them.
 */

/** A button / link: visible text + where it leads ("#contact", "/en", "https://…") */
export type ContentLink = { label: string; href: string };

export type HeaderContent = {
  /** aria-label of the logo link */
  home: string;
  /** aria-labels of the desktop and mobile navigation */
  nav: string;
  mobileNav: string;
  /** "Зв’язатися" button (desktop header + mobile menu) */
  cta: ContentLink;
  openMenu: string;
  closeMenu: string;
  menu: string;
  /** Menu items (labels editable, anchors are the section ids) */
  links: readonly ContentLink[];
};

export type HeroContent = {
  eyebrow: string;
  /** The H1, one string per line (Figma line breaks) */
  title: [string, string, string, string];
  lead: [string, string];
  cta: ContentLink;
  /** "★★★★★ 4.9" above the clients line */
  ratingScore: string;
  rating: string;
  /** The four client photos in the rating row */
  avatars: [string, string, string, string];
  /**
   * Technology pills. `w` = fixed widths from Figma (desktop 1440 / mobile 390); a pill without `w`
   * sizes itself to its label, so a renamed pill never breaks the row.
   */
  stack: { label: string; w?: [number, number] }[];
};

export type SiteContent = {
  header: HeaderContent;
  hero: HeroContent;
};
