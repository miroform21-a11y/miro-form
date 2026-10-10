import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

/** The sitemap is generated at build time, so every deploy refreshes lastmod */
const buildDate = new Date();

/** Only indexable pages (Ukrainian + English, linked with hreflang): /brief, /thank-you and their /en versions are noindex and stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, changeFrequency: "monthly" | "yearly", priority: number) => {
    const languages = languageAlternates(path);
    return {
      url: absoluteUrl(path),
      lastModified: buildDate,
      changeFrequency,
      priority,
      ...(languages && { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([l, p]) => [l, absoluteUrl(p)])) } }),
    };
  };
  return [
    entry("/", "monthly", 1),
    entry("/en", "monthly", 0.9),
    entry("/privacy", "yearly", 0.2),
    entry("/en/privacy-policy", "yearly", 0.2),
  ];
}
