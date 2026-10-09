import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Only indexable pages: /brief, /thank-you and /en are noindex and stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
