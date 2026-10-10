/**
 * Shapes of the editable site content (one object per language, see content/index.ts).
 * The public components render exactly these values; the future /admin edits them.
 */

import type { Service } from "@/data/services";
import type { Project } from "@/data/projects";
import type { Fact } from "@/data/facts";
import type { Step } from "@/data/process";
import type { Plan, pricingByLocale } from "@/data/pricing";
import type { Review } from "@/data/reviews";
import type { FaqItem } from "@/data/faq";

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

export type ServicesContent = {
  tag: string;
  /** Section heading split as in Figma: on phones one sentence, on desktop three lines with the logos pill in line 2 */
  heading: {
    mobile: { before: string; bold: string; after: string };
    desktop: { line1: string; line1Bold: string; line2BoldBeforeLogos: string; line2BoldAfterLogos: string; line3: string };
  };
  quote: string;
  /** Decor cursor labels (fixed label widths — keep them short) and the letter on the 3D key */
  cursorSite: string;
  cursorDesign: string;
  keyLetter: string;
  /** Screen-reader label of a card: "<card title> — <leadLabel>" */
  leadLabel: string;
  cards: Service[];
};

export type WorksContent = {
  tag: string;
  title: string;
  all: ContentLink;
  /** Counter "( 06 / 40+ )" — the total of delivered projects */
  total: string;
  /** Exactly six slots: the desktop bento rows and the phone card geometry are tied to the slot index */
  projects: Project[];
  /** Screen-reader / alt suffixes of a project card */
  card: { screenshot: string; video: string; open: string };
  slider: { label: string; slides: string; slide: string };
};

export type AboutContent = {
  tag: string;
  /** Statement after the "MIROFORM®" wordmark */
  statement: string;
  /** The grey phrase around the inline photo: "<readBefore> [photo] <readAfter>" */
  readBefore: string;
  readAfter: string;
  founder: { name: string; role: string; alt: string; href: string; ariaLabel: string };
  /** Two counters: projects / years */
  stats: [AboutStat, AboutStat];
  fullCycle: { value: number; suffix: string; text: string; tagline: [string, string] };
};
export type AboutStat = { label: string; value: number; suffix: string };

export type FactsContent = {
  tag: string;
  title: string;
  /** Two lines (Figma break, joined on narrow phones) */
  lead: [string, string];
  facts: Fact[];
  audienceTitle: [string, string];
  /** Niches in the marquee */
  audiences: string[];
};

export type ProcessContent = {
  tag: string;
  title: [string, string];
  lead: string;
  steps: Step[];
  /** CTA plate: "<average> <averageValue>" (value in lime) */
  average: string;
  averageValue: string;
  cta: ContentLink;
};

type PricingData = (typeof pricingByLocale)["uk"];

export type PricingContent = {
  tag: string;
  title: string;
  /** Small label before a price ("Від $390") */
  from: string;
  /** Shown in the price slot when a plan has no price: small label + big word */
  quote: [string, string];
  payment: { title: string; note: string };
  /** "Умови <знижки>" — `accent` = index of the orange word */
  discountsTitle: { parts: [string, string]; accent: 0 | 1 };
  /** Floating "Хіт продажів" label (fixed width — keep it short) */
  hit: string;
  choose: string;
  discuss: string;
  /** Screen-reader labels: "<plan title> — <label>" */
  chooseLabel: string;
  discussLabel: string;
  /** The two priced packages (prices as shown, e.g. "$390"; their popup preset is checked by /api/lead) */
  plans: Plan[];
  customPlan: PricingData["customPlan"];
  /** "AI & Custom" text on phones/tablets: three lines with non-breaking parts (Figma) */
  customPlanMobile: { line1: string; line2Nowrap: string; line2Tail: string; line3Nowrap: string };
  discounts: PricingData["discounts"];
};

export type ReviewsContent = {
  tag: string;
  title: string;
  /** Screen-reader labels of the arrows and the phone carousel */
  prev: string;
  next: string;
  carousel: string;
  /** Screen-reader label of the five stars */
  starsLabel: string;
  /** Desktop shows pages of 4, tablet pages of 2, phones a slider */
  items: Review[];
  ratingCard: {
    score: number;
    caption: string;
    clients: number;
    clientsSuffix: string;
    /** "<clients>+ <line 1>" / "<line 2>" */
    clientsLines: [string, string];
    /** Four face photos (a separate set from the hero avatars) */
    faces: string[];
  };
};

export type FaqContent = {
  title: [string, string];
  /** Also rendered as FAQPage structured data on the home page */
  items: FaqItem[];
  askCard: { label: string; title: [string, string]; text: string; button: string };
};

export type SiteContent = {
  header: HeaderContent;
  hero: HeroContent;
  services: ServicesContent;
  works: WorksContent;
  about: AboutContent;
  facts: FactsContent;
  process: ProcessContent;
  pricing: PricingContent;
  reviews: ReviewsContent;
  faq: FaqContent;
};
