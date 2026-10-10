import type { Locale } from "@/i18n/locale";
import type { SiteContent } from "./types";
import { headerContent } from "./site/header";
import { heroContent } from "./site/hero";

/**
 * Editable site content, one independent object per language. This is the single source the public
 * components render by default (each takes an optional `content` prop for the same shape).
 */
export const siteContent: Record<Locale, SiteContent> = {
  uk: { header: headerContent.uk, hero: heroContent.uk },
  en: { header: headerContent.en, hero: heroContent.en },
};

export type { SiteContent } from "./types";
