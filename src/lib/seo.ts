import type { Metadata } from "next";
import { contacts, founderInstagram, socialLinks } from "@/data/navigation";

/** Production origin (miro-form.com and http:// both 308-redirect here on Vercel). */
export const siteUrl = "https://www.miro-form.com";
export const siteName = "MIROFORM";

/** Static social preview (public/og-image.png, 1200×630) */
export const ogImage = { url: "/og-image.png", width: 1200, height: 630, alt: "MIROFORM — розробка сайтів, дизайн та AI-рішення під ключ" };

export const absoluteUrl = (path = "/") => new URL(path, siteUrl).toString().replace(/\/$/, "");

/** Real spellings of the brand name (Latin / Cyrillic) — used as schema.org alternateName. */
const brandSpellings = ["Miroform", "Miro Form", "МіроФорм", "МироФорм"];

const orgId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

/**
 * Per-page metadata: unique title/description, canonical, Open Graph and Twitter card.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
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
