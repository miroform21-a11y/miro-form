import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://miroform.studio", changeFrequency: "monthly", priority: 1 }];
}
