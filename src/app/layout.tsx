import type { Metadata, Viewport } from "next";
import { Noto_Sans, Unbounded } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Preloader } from "@/components/ui/Preloader";
import { JsonLd } from "@/components/ui/JsonLd";
import { ogImage, siteJsonLd, siteName, siteUrl } from "@/lib/seo";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  // Variable font: all weights 200–900 (static weights render the same; intermediate ones are available)
  variable: "--font-unbounded",
  display: "swap",
});

const noto = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto",
  display: "swap",
});

const pressStart = localFont({
  src: "../../public/fonts/PressStart2P.ttf",
  variable: "--font-press-start",
  display: "swap",
});

/** Defaults for every route; indexable pages override title/description/canonical via pageMetadata(). */
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className={`${unbounded.variable} ${noto.variable} ${pressStart.variable}`}>
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
