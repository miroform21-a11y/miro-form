import type { Locale } from "@/i18n/locale";
import type { BriefContent, SiteContent } from "./types";
import { headerContent } from "./site/header";
import { heroContent } from "./site/hero";
import { servicesContent } from "./site/services";
import { worksContent } from "./site/works";
import { aboutContent } from "./site/about";
import { factsContent } from "./site/facts";
import { processContent } from "./site/process";
import { pricingContent } from "./site/pricing";
import { reviewsContent } from "./site/reviews";
import { faqContent } from "./site/faq";
import { contactContent } from "./site/contact";
import { footerContent } from "./site/footer";
import { formsContent, thankYouContent } from "./site/forms";
import { privacyContent } from "./site/privacy";
import { seoContent } from "./site/seo";
import { briefPageContent } from "./brief/page";
import { briefUiContent } from "./brief/ui";
import { briefSchemas } from "@/data/briefEn";

/**
 * Editable content, one independent object per language. This is the single source the public
 * components render by default (each takes an optional `content` prop of the same shape).
 */
const siteFor = (l: Locale): SiteContent => ({
  header: headerContent[l],
  hero: heroContent[l],
  services: servicesContent[l],
  works: worksContent[l],
  about: aboutContent[l],
  facts: factsContent[l],
  process: processContent[l],
  pricing: pricingContent[l],
  reviews: reviewsContent[l],
  faq: faqContent[l],
  contact: contactContent[l],
  footer: footerContent[l],
  forms: formsContent[l],
  thankYou: thankYouContent[l],
  privacy: privacyContent[l],
  seo: seoContent[l],
});

export const siteContent: Record<Locale, SiteContent> = { uk: siteFor("uk"), en: siteFor("en") };

/** The brief area per language: page texts, wizard texts and the questionnaire (data/brief.ts, data/briefEn.ts) */
export const briefContent: Record<Locale, BriefContent> = {
  uk: { page: briefPageContent.uk, ui: briefUiContent.uk, schema: briefSchemas.uk },
  en: { page: briefPageContent.en, ui: briefUiContent.en, schema: briefSchemas.en },
};

export type { BriefContent, SiteContent } from "./types";
