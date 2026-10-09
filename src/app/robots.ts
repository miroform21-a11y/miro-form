import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * Everything stays crawlable: service pages (/brief, /thank-you, /en, 404) are excluded with
 * `noindex` in their metadata, which only works if robots are allowed to fetch them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
