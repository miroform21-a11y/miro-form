import type { Metadata } from "next";
import Image from "next/image";
import { PillButton } from "@/components/ui/PillButton";
import { PixelAssemble } from "@/components/ui/PixelAssemble";

export const metadata: Metadata = {
  title: "Дякуємо за заявку — MIROFORM",
  description: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
  robots: { index: false, follow: false },
};

/** Shown only after a form was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const question = (await searchParams).type === "question";

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink px-5 pt-6 pb-10 md:px-8 lg:px-[clamp(40px,6.25vw,90px)] lg:pt-7">
      {/* Background: the hero glow + dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          priority
          className="absolute top-[38%] left-1/2 h-[min(120vw,1100px)] w-[min(150vw,1380px)] max-w-none -translate-x-1/2 object-cover opacity-45 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%]"
        />
        <img src="/images/hero/dot-grid.svg" alt="" className="absolute top-[12%] left-1/2 h-[642px] w-[1302px] max-w-none -translate-x-1/2 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,rgba(5,5,5,0)_35%,rgba(5,5,5,0)_70%,#050505_100%)]" />
      </div>

      <a href="/" aria-label="MIROFORM — на головну" className="relative block h-[41.6px] w-[160px] shrink-0 xl:h-[72px] xl:w-[198px]">
        <Image
          src="/images/hero/logo.png"
          alt="MIROFORM"
          width={1895}
          height={830}
          priority
          className="absolute top-[-17.2px] left-[-6px] h-[78px] w-[173px] max-w-none object-contain xl:top-[-10px] xl:left-[-13px] xl:h-[95px] xl:w-[211px]"
        />
      </a>

      <section className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="font-pixel text-[11px] leading-pixel text-lime md:text-[13px]">{question ? "ПИТАННЯ ОТРИМАНО" : "ЗАЯВКУ ОТРИМАНО"}</p>

        <h1 className="thanks-title mt-7 flex flex-col items-center gap-[0.35em] font-pixel text-[min(9.2vw,88px)] leading-none text-white md:mt-9">
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
      </section>

      <p className="text-center text-[13px] leading-body text-white/40">© 2026 MIROFORM®</p>
    </main>
  );
}
