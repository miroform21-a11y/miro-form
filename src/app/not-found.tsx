import type { Metadata } from "next";
import { PillButton } from "@/components/ui/PillButton";
import { PixelAssemble } from "@/components/ui/PixelAssemble";
import { StatusScreen } from "@/components/ui/StatusScreen";

export const metadata: Metadata = {
  title: "Сторінку не знайдено — MIROFORM",
  robots: { index: false, follow: false },
};

/**
 * Site-wide 404: any unknown URL (and, for now, the English version /en) lands here.
 * The giant "404" uses the intro pixel assembly + glitch.
 */
export default function NotFound() {
  return (
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
  );
}
