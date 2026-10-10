import type { Metadata } from "next";
import { contacts, founderInstagram, socialLinks } from "@/data/navigation";
import { routes, type Locale } from "@/i18n/locale";

/** Production origin (miro-form.com and http:// both 308-redirect here on Vercel). */
export const siteUrl = "https://www.miro-form.com";
export const siteName = "MIROFORM";

/** Static social preview (public/og-image.png, 1200×630) */
export const ogImage = { url: "/og-image.png", width: 1200, height: 630, alt: "MIROFORM — розробка сайтів, дизайн та AI-рішення під ключ" };
const ogImageEn = { ...ogImage, alt: "MIROFORM — websites, design and AI solutions" };

export const absoluteUrl = (path = "/") => new URL(path, siteUrl).toString().replace(/\/$/, "");

/** Real spellings of the brand name (Latin / Cyrillic) — used as schema.org alternateName. */
const brandSpellings = ["Miroform", "Miro Form", "МіроФорм", "МироФорм"];

const orgId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

/** Indexable pages that exist in both languages (they link to each other with hreflang) */
const translatedPages = ["home", "privacy"] as const;

/** hreflang alternates for a page that has a translation; Ukrainian is the default (x-default). */
export function languageAlternates(path: string): Record<string, string> | undefined {
  const key = translatedPages.find((k) => routes.uk[k] === path || routes.en[k] === path);
  return key && { uk: routes.uk[key], en: routes.en[key], "x-default": routes.uk[key] };
}

/**
 * Per-page metadata: unique title/description, canonical + hreflang, Open Graph and Twitter card.
 * English pages (locale "en") get en_US Open Graph.
 */
export function pageMetadata({ title, description, path, locale = "uk" }: { title: string; description: string; path: string; locale?: Locale }): Metadata {
  const alternates = { canonical: path, languages: languageAlternates(path) };
  if (locale === "en")
    return {
      title: { absolute: title },
      description,
      alternates,
      openGraph: { title, description, url: path, type: "website", locale: "en_US", alternateLocale: "uk_UA", siteName, images: [ogImageEn] },
      twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
    };
  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "uk_UA",
      siteName,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}

/** Organization + WebSite — rendered once in the root layout. Only facts published on the site. */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": orgId,
      name: siteName,
      alternateName: brandSpellings,
      url: siteUrl,
      logo: `${siteUrl}/images/hero/logo.png`,
      description: "Digital-студія: дизайн, розробка сайтів і AI-рішення для бізнесу під ключ.",
      areaServed: { "@type": "Country", name: "Україна" },
      founder: { "@type": "Person", name: "German Guk", sameAs: founderInstagram },
      sameAs: [socialLinks.instagram, socialLinks.telegram],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: contacts.phoneHref.replace("tel:", ""),
        contactType: "sales",
        areaServed: "UA",
        availableLanguage: "uk",
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: siteName,
      alternateName: brandSpellings,
      inLanguage: "uk",
      publisher: { "@id": orgId },
    },
  ],
};

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

/** The same Organization + WebSite graph for the English root layout, with English text. */
export const siteJsonLdEn = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...siteJsonLd["@graph"][0],
      description: "Digital studio: turnkey design, web development and AI solutions for businesses.",
      contactPoint: { ...siteJsonLd["@graph"][0].contactPoint, availableLanguage: ["uk", "en"] },
    },
    { ...siteJsonLd["@graph"][1], url: absoluteUrl("/en"), inLanguage: "en" },
  ],
};
