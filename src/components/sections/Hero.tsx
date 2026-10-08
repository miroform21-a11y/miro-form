import Image from "next/image";
import { Header } from "./Header";
import { PillButton } from "@/components/ui/PillButton";
import { HeroParallax } from "./HeroParallax";

/** Square, face-centred crops of the Figma photos — they fill the circle completely */
const avatars = ["/images/avatars/client-1.jpg", "/images/avatars/client-2.jpg", "/images/avatars/client-3.jpg", "/images/avatars/client-4.jpg"];

/** Tag widths from Figma (desktop 1440 / mobile 390) */
const stack = [
  { label: "Figma", w: [83.35, 70.85] },
  { label: "Framer", w: [97.89, 83.21] },
  { label: "Next.js", w: [95.95, 81.56] },
  { label: "Webflow", w: [110, 93.5] },
];

export function AvatarStack({ size = 46, borderColor = "#050505" }: { size?: number; borderColor?: string }) {
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

function Rating({ textClass = "text-white/70" }: { textClass?: string }) {
  return (
    <div className="flex items-center">
      <AvatarStack />
      <div className="flex flex-col gap-1 pl-[26px] leading-body whitespace-nowrap">
        <p className="font-pixel text-[10px] leading-pixel text-lime">★★★★★ 4.9</p>
        <p className={`text-[14px] ${textClass}`}>347+ клієнтів у 12 країнах</p>
      </div>
    </div>
  );
}

function StackTags({ className = "", size }: { className?: string; size: "lg" | "sm" }) {
  return (
    <ul className={`flex items-center ${className}`}>
      {stack.map((t) => (
        <li
          key={t.label}
          style={{ width: t.w[size === "lg" ? 0 : 1] }}
          className="flex items-center justify-center rounded-full border border-white/30 bg-white/4 transition-[translate,border-color] duration-400 ease-(--ease-smooth) hover:-translate-y-[3px] hover:border-white/50 active:-translate-y-[3px] font-display leading-display font-medium tracking-[0.04em] whitespace-nowrap text-white uppercase"
        >
          {t.label}
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  return (
    // EXPERIMENT (mobile): the first screen is capped to the visible viewport height (100svh).
    // Roll back by changing max-lg:min-h-[min(192.5vw,100svh)] to max-lg:min-h-[192.5vw].
    <section
      id="top"
      className="@container relative isolate overflow-hidden bg-ink [--stage:min(100cqw,1440px)] max-lg:min-h-[min(192.5vw,100svh)] md:max-lg:min-h-[1000px] lg:h-[max(600px,calc(var(--stage)*0.5625))]"
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
          className="absolute top-[calc(min(192.5vw,100svh)-78.7vw)] left-[-42.3vw] h-[164vw] w-[184.6vw] max-w-none md:top-[480px] md:left-[-15%] md:h-[900px] md:w-[130%]"
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
        <Header />

        <div className="mt-[24.2px] flex flex-col lg:mt-[clamp(48px,5.56vw,80px)] lg:w-[calc(100%+19px)] lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col whitespace-nowrap">
            <p className="font-pixel text-[11px] leading-pixel text-lime lg:text-[13px]">МИ СТВОРЮЄМО</p>
            <h1 className="mt-[23px] font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-white md:text-[52px] lg:mt-[19px] lg:text-[clamp(34px,2.92vw,42px)]">
              Сайти, які
              <br />
              продають —
              <br />
              а не просто
              <br />
              існують
            </h1>
          </div>

          <div className="flex flex-col items-start lg:items-end lg:pt-8">
            <p className="mt-[18px] text-[14px] leading-[1.55] font-[350] text-white md:text-[16px] lg:mt-0 lg:pr-[19px] lg:text-right lg:text-[16px]">
              Дизайн, розробка й AI-рішення під ключ.
              <br />
              Від ідеї до першої заявки — від 7 днів.
            </p>
            <PillButton href="#contact" className="mt-[22px] h-[55px] pr-1.5 pl-7 lg:mt-[38px] lg:h-[60px]">
              Обговорити проєкт
            </PillButton>
          </div>
        </div>

        {/* Mobile / tablet: rating under CTA, stack at the very bottom */}
        <div className="mt-[22px] flex h-[55.34px] items-center lg:hidden">
          <Rating textClass="text-white/90" />
        </div>
        <div className="flex-1 lg:hidden" />
        <StackTags size="sm" className="gap-1.5 pl-[3px] lg:hidden [&>li]:h-[21.2px] [&>li]:border-[0.85px] [&>li]:text-[10.2px]" />
      </div>

      {/* Desktop bottom row */}
      <div className="absolute inset-x-0 bottom-[62px] z-10 hidden lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between pr-[clamp(32px,4vw,58px)] pl-[clamp(24px,4.86vw,70px)]">
          <Rating />
          <StackTags size="lg" className="gap-2.5 [&>li]:h-[33px] [&>li]:text-[12px]" />
        </div>
      </div>
    </section>
  );
}
