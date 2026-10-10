import type { Locale } from "@/i18n/locale";
import type { SiteContent } from "./types";
import { headerContent } from "./site/header";
import { heroContent } from "./site/hero";
import { servicesContent } from "./site/services";
import { worksContent } from "./site/works";
import { aboutContent } from "./site/about";
import { factsContent } from "./site/facts";
import { processContent } from "./site/process";

/**
 * Editable site content, one independent object per language. This is the single source the public
 * components render by default (each takes an optional `content` prop for the same shape).
 */
const forLocale = (l: Locale): SiteContent => ({
  header: headerContent[l],
  hero: heroContent[l],
  services: servicesContent[l],
  works: worksContent[l],
  about: aboutContent[l],
  facts: factsContent[l],
  process: processContent[l],
});

export const siteContent: Record<Locale, SiteContent> = { uk: forLocale("uk"), en: forLocale("en") };

export type { SiteContent } from "./types";
