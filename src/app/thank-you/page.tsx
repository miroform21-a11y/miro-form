import type { Metadata } from "next";
import { PillButton } from "@/components/ui/PillButton";
import { PixelAssemble } from "@/components/ui/PixelAssemble";
import { StatusScreen } from "@/components/ui/StatusScreen";

export const metadata: Metadata = {
  title: "Дякуємо за заявку — MIROFORM",
  description: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
  robots: { index: false, follow: false },
};

/** Shown only after a form was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const question = (await searchParams).type === "question";

  return (
    <StatusScreen>
      <p className="font-pixel text-[11px] leading-pixel text-lime md:text-[13px]">{question ? "ПИТАННЯ ОТРИМАНО" : "ЗАЯВКУ ОТРИМАНО"}</p>

      <h1 className="pixel-headline mt-7 flex flex-col items-center gap-[0.35em] font-pixel text-[min(9.2vw,88px)] leading-none text-white md:mt-9">
        <span className="sr-only">{question ? "Дякуємо за питання" : "Дякуємо за заявку"}</span>
        <PixelAssemble text="ДЯКУЄМО" />
        <span className="text-lime">
          <PixelAssemble text={question ? "ЗА ПИТАННЯ" : "ЗА ЗАЯВКУ"} start={7} />
        </span>
      </h1>

      <p className="mt-8 max-w-[440px] text-[15px] leading-[1.55] text-balance text-white/70 md:mt-10 md:text-[17px]">
        {question
          ? "Ми отримали ваше питання та відповімо найближчим часом."
          : "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом."}
      </p>

      <PillButton href="/" circleSize={44} gap={18} className="mt-9 h-[60px] pr-2 pl-[28px] md:mt-11">
        Повернутися на сайт
      </PillButton>
    </StatusScreen>
  );
}
