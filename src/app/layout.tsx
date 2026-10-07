import type { Metadata, Viewport } from "next";
import { Noto_Sans, Unbounded } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Preloader } from "@/components/ui/Preloader";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://miroform.studio"),
  title: "MIROFORM — сайти, які продають",
  description:
    "Digital-студія MIROFORM: дизайн, розробка сайтів і AI-рішення під ключ. Від ідеї до першої заявки — від 7 днів.",
  openGraph: {
    title: "MIROFORM — сайти, які продають",
    description: "Дизайн, розробка й AI-рішення під ключ. Від ідеї до першої заявки — від 7 днів.",
    type: "website",
    locale: "uk_UA",
    siteName: "MIROFORM",
  },
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
      </body>
    </html>
  );
}
