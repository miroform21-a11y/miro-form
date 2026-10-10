import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Preloader } from "@/components/ui/Preloader";
import { JsonLd } from "@/components/ui/JsonLd";
import { ogImage, siteJsonLd, siteName, siteUrl } from "@/lib/seo";

/** Defaults for every Ukrainian route; indexable pages override title/description/canonical via pageMetadata(). */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // every page title already ends with "— MIROFORM", so no template
  title: "MIROFORM — розробка сайтів під ключ",
  description:
    "Digital-студія MIROFORM: дизайн, розробка сайтів і AI-рішення під ключ. Від ідеї до першої заявки — від 7 днів.",
  applicationName: siteName,
  openGraph: { type: "website", locale: "uk_UA", siteName, images: [ogImage] },
  twitter: { card: "summary_large_image", images: [ogImage.url] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

/** Root layout of the Ukrainian site (the route group keeps its URLs unchanged; /en has its own root layout). */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className={fontVariables}>
      <body>
        <Preloader />
        <noscript>
          <style>{".preloader{display:none}html{animation:none!important}"}</style>
        </noscript>
        <SmoothScroll />
        {children}
        <JsonLd data={siteJsonLd} />
      </body>
    </html>
  );
}
