import type { Metadata } from "next";
import { PillButton } from "@/components/ui/PillButton";
import { PixelAssemble } from "@/components/ui/PixelAssemble";
import { StatusScreen } from "@/components/ui/StatusScreen";
import RootLayout, { metadata as siteMetadata, viewport as siteViewport } from "./(uk)/layout";

/*
 * With two root layouts (the Ukrainian site and /en) Next.js needs a global 404 for unmatched URLs.
 * It renders inside the Ukrainian root layout, so the page is the same as before the split.
 */

export const metadata: Metadata = {
  ...siteMetadata,
  title: "Сторінку не знайдено — MIROFORM",
  robots: { index: false, follow: false },
};

export const viewport = siteViewport;

/**
 * Site-wide 404: any unknown URL lands here.
 * The giant "404" uses the intro pixel assembly + glitch.
 */
export default function GlobalNotFound() {
  return (
    <RootLayout>
      <StatusScreen>
        <h1 className="pixel-headline font-pixel text-[min(26vw,300px)] leading-none text-lime">
          <span className="sr-only">404 — сторінку не знайдено</span>
          <PixelAssemble text="404" />
        </h1>

        <p className="mt-8 text-[15px] leading-[1.55] font-[350] text-white/70 md:mt-12 md:text-[18px]">Схоже, такої сторінки не існує.</p>

        <PillButton href="/" circleSize={44} gap={18} className="mt-9 h-[60px] pr-2 pl-[28px] md:mt-11">
          Повернутися на головну
        </PillButton>
      </StatusScreen>
    </RootLayout>
  );
}
