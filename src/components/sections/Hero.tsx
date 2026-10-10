import Image from "next/image";
import { Header } from "./Header";
import { PillButton } from "@/components/ui/PillButton";
import { HeroParallax } from "./HeroParallax";
import type { Locale } from "@/i18n/locale";
import { siteContent } from "@/content";
import type { HeroContent } from "@/content/types";

export function AvatarStack({ avatars, size = 46, borderColor = "#050505" }: { avatars: readonly string[]; size?: number; borderColor?: string }) {
  return (
    <div className="flex shrink-0">
      {avatars.map((src, i) => (
        <span
          key={src}
          className="relative -mr-3 shrink-0 overflow-hidden rounded-full border-3"
          style={{ width: size, height: size, borderColor, zIndex: i }}
        >
          <Image src={src} alt="" width={96} height={96} className="size-full object-cover" />
        </span>
      ))}
    </div>
  );
}

function Rating({ textClass = "text-white/70", content }: { textClass?: string; content: HeroContent }) {
  return (
    <div className="flex items-center">
      <AvatarStack avatars={content.avatars} />
      <div className="flex flex-col gap-1 pl-[26px] leading-body whitespace-nowrap">
        <p className="font-pixel text-[10px] leading-pixel text-lime">{content.ratingScore}</p>
        <p className={`text-[14px] ${textClass}`}>{content.rating}</p>
      </div>
    </div>
  );
}

function StackTags({ className = "", size, stack }: { className?: string; size: "lg" | "sm"; stack: HeroContent["stack"] }) {
  return (
    <ul className={`flex items-center ${className}`}>
      {stack.map((t) => (
        <li
          key={t.label}
          // Figma width for the original pills; a renamed pill (no `w`) sizes itself to its label
          style={t.w ? { width: t.w[size === "lg" ? 0 : 1] } : undefined}
          className={`flex items-center justify-center rounded-full border border-white/30 bg-white/4 transition-[translate,border-color] duration-400 ease-(--ease-smooth) hover:-translate-y-[3px] hover:border-white/50 active:-translate-y-[3px] font-display leading-display font-medium tracking-[0.04em] whitespace-nowrap text-white uppercase${t.w ? "" : " px-[1.1em]"}`}
        >
          {t.label}
        </li>
      ))}
    </ul>
  );
}

export function Hero({ locale = "uk", content = siteContent[locale].hero }: { locale?: Locale; content?: HeroContent }) {
  const t = content;
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-ink [--stage:min(100vw,1440px)] max-lg:min-h-[192.5vw] md:max-lg:min-h-[1000px] lg:h-[max(600px,calc(var(--stage)*0.5625))]"
    >
      {/* ---------- Background layers (mobile / tablet) ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          priority
          className="absolute top-[-1.8%] left-[-101.62%] h-full w-[240.71%] max-w-none"
        />
        <img
          src="/images/hero/m-glow-object.svg"
          alt=""
          className="absolute top-[113.8vw] left-[-42.3vw] h-[164vw] w-[184.6vw] max-w-none md:top-[480px] md:left-[-15%] md:h-[900px] md:w-[130%]"
        />
        <img src="/images/hero/m-dot-grid.svg" alt="" className="absolute top-[90px] left-0 h-[321px] w-[651px] max-w-none" />
      </div>

      {/* ---------- Background layers (desktop) ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          priority
          className="absolute max-w-none object-cover opacity-55"
          style={{
            left: "calc(50% - var(--stage) * 0.5403)",
            top: "calc(var(--stage) * -0.6694)",
            width: "calc(var(--stage) * 1.4208)",
            height: "calc(var(--stage) * 1.3639)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "calc(var(--stage) * 0.6667)",
            backgroundImage:
              // right layer: beyond the 1440 frame the glow’s outer blue ring would show as a vertical band (zero width up to 1440px)
              "linear-gradient(180deg, rgba(5,5,5,0) 72%, #050505 100%), linear-gradient(270deg, #050505 calc((100% - var(--stage)) * 0.375), rgba(5,5,5,0) calc((100% - var(--stage)) / 2)), linear-gradient(90deg, #050505 calc((100% - var(--stage)) / 2 + var(--stage) * 0.3), rgba(5,5,5,0) calc((100% - var(--stage)) / 2 + var(--stage) * 0.62))",
          }}
        />
        <img
          src="/images/hero/dot-grid.svg"
          alt=""
          className="absolute top-[140px] h-[642px] w-[1302px] max-w-none"
          style={{ left: "calc(50% - 650px)" }}
        />
      </div>

      {/* 3D object + giant wordmark */}
      <HeroParallax />

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[121px] bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,0.85)_60%,#050505_100%)] lg:h-[148px] lg:bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,#050505_100%)]"
      />

      {/* ---------- Content ---------- */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col px-5 pt-[24.2px] pb-4 max-lg:min-h-[inherit] md:px-8 lg:px-[clamp(40px,6.25vw,90px)] lg:pt-7 lg:pb-0">
        <Header locale={locale} />

        <div className="mt-[24.2px] flex flex-col lg:mt-[clamp(48px,5.56vw,80px)] lg:w-[calc(100%+19px)] lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col whitespace-nowrap">
            <p className="font-pixel text-[11px] leading-pixel text-lime lg:text-[13px]">{t.eyebrow}</p>
            <h1 className="mt-[23px] font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-white md:text-[52px] lg:mt-[19px] lg:text-[clamp(34px,2.92vw,42px)]">
              {t.title[0]}
              <br />
              {t.title[1]}
              <br />
              {t.title[2]}
              <br />
              {t.title[3]}
            </h1>
          </div>

          <div className="flex flex-col items-start lg:items-end lg:pt-8">
            <p className="mt-[18px] text-[14px] leading-[1.55] font-[350] text-white md:text-[16px] lg:mt-0 lg:pr-[19px] lg:text-right lg:text-[16px]">
              {t.lead[0]}
              <br />
              {t.lead[1]}
            </p>
            <PillButton href={t.cta.href} className="mt-[22px] h-[55px] pr-1.5 pl-7 lg:mt-[38px] lg:h-[60px]">
              {t.cta.label}
            </PillButton>
          </div>
        </div>

        {/* Mobile / tablet: rating under CTA, stack at the very bottom */}
        <div className="mt-[22px] flex h-[55.34px] items-center lg:hidden">
          <Rating textClass="text-white/90" content={t} />
        </div>
        <div className="flex-1 lg:hidden" />
        <StackTags size="sm" stack={t.stack} className="gap-1.5 pl-[3px] lg:hidden [&>li]:h-[21.2px] [&>li]:border-[0.85px] [&>li]:text-[10.2px]" />
      </div>

      {/* Desktop bottom row */}
      <div className="absolute inset-x-0 bottom-[62px] z-10 hidden lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between pr-[clamp(32px,4vw,58px)] pl-[clamp(24px,4.86vw,70px)]">
          <Rating content={t} />
          <StackTags size="lg" stack={t.stack} className="gap-2.5 [&>li]:h-[33px] [&>li]:text-[12px]" />
        </div>
      </div>
    </section>
  );
}
