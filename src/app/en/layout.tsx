import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Preloader } from "@/components/ui/Preloader";
import { JsonLd } from "@/components/ui/JsonLd";
import { ogImage, siteJsonLdEn, siteName, siteUrl } from "@/lib/seo";

/**
 * Defaults for the English routes (/en/...); indexable pages override title/description/canonical via
 * pageMetadata(..., "en"). Service pages (/en/brief, /en/thank-you) set noindex themselves, as on the Ukrainian site.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MIROFORM — Websites, design and AI solutions",
  description: "MIROFORM is a digital studio for design, web development and AI solutions. From idea to your first lead in as little as 7 days.",
  applicationName: siteName,
  openGraph: { type: "website", locale: "en_US", siteName, images: [{ ...ogImage, alt: "MIROFORM — websites, design and AI solutions" }] },
  twitter: { card: "summary_large_image", images: [ogImage.url] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

/** Root layout of the English version: the same shell as the Ukrainian site, with lang="en". */
export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <Preloader />
        <noscript>
          <style>{".preloader{display:none}html{animation:none!important}"}</style>
        </noscript>
        <SmoothScroll />
        {children}
        <JsonLd data={siteJsonLdEn} />
      </body>
    </html>
  );
}
