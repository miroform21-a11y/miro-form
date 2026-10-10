import { audiencesByLocale, factsByLocale, type Fact } from "@/data/facts";
import type { Locale } from "@/i18n/locale";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Marquee } from "@/components/ui/Marquee";

function FactValue({ fact, mobile }: { fact: Fact; mobile?: boolean }) {
  const unit = `font-display font-medium text-white/50 ${mobile ? "pb-1 text-[13px] leading-[13px]" : "pb-[5px] text-[15px] leading-[15px]"}`;
  return (
    <div className={`flex items-end whitespace-nowrap ${mobile ? "w-[116px] shrink-0 gap-2" : "gap-2.5"}`}>
      {fact.prefix && <span className={unit}>{fact.prefix}</span>}
      <CountUp
        to={fact.value}
        suffix={fact.suffix}
        className={`font-pixel ${mobile ? "text-[28px] leading-[28px]" : "text-[36px] leading-[36px]"} ${fact.accent ? "text-lime" : "text-white"}`}
      />
      {fact.unit && <span className={unit}>{fact.unit}</span>}
    </div>
  );
}

export function Facts({ locale = "uk" }: { locale?: Locale }) {
  const facts = factsByLocale[locale];
  const audiences = audiencesByLocale[locale];
  const en = locale === "en";
  return (
    <section id="why" className="relative overflow-hidden bg-ink md:[overflow:clip_visible] pt-14 pb-[35px] md:py-[110px]">
      {/* Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img src="/images/facts/m-glow-violet.svg" alt="" className="absolute top-[-123px] left-[45px] h-[660px] w-[720px] max-w-none md:hidden" />
        <img src="/images/facts/m-glow-lime.svg" alt="" className="absolute top-[50px] left-[-370px] h-[620px] w-[660px] max-w-none md:hidden" />
        <img
          src="/images/facts/glow-violet.svg"
          alt=""
          className="absolute top-[-67px] left-[calc(50%+298px)] hidden h-[540px] w-[840px] max-w-none md:block"
        />
        <img
          src="/images/facts/glow-lime.svg"
          alt=""
          className="absolute top-[100px] left-[calc(50%-1120px)] hidden h-[520px] w-[740px] max-w-none md:block"
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] md:px-8 lg:px-[clamp(40px,6.25vw,90px)]">
        {/* Header */}
        <Reveal className="flex flex-col gap-4 px-5 md:px-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 md:gap-6">
            <SectionTag className="self-start">{en ? "Why us" : "Чому ми"}</SectionTag>
            <h2 className="font-display text-[38px] leading-[40px] font-bold md:leading-[1.05] tracking-[-0.03em] whitespace-nowrap text-white md:text-[56px] xl:text-[64px]">
              {en ? "Just the facts" : "Тільки факти"}
            </h2>
          </div>
          {/* Figma's two-line break fits from 384px; narrower phones get balanced lines instead of a lone last word */}
          <p className="text-[15px] leading-[1.55] text-white/60 max-[384px]:text-balance md:max-w-[380px] md:text-[16px]">
            {en ? (
              <>
                Specific terms we lock in by&nbsp;contract —<br className="max-[384px]:hidden" /> no “custom approach” talk or vague promises.
              </>
            ) : (
              <>
                Конкретні умови, які фіксуємо в&nbsp;договорі —<br className="max-[384px]:hidden" /> без «індивідуального підходу» і загальних слів.
              </>
            )}
          </p>
        </Reveal>

        {/* Facts — mobile list */}
        <Reveal delay={80} className="mt-7 px-5 md:hidden">
          <ul className="rounded-[24px] border border-white/9 bg-white/3 px-5 py-1.5 backdrop-blur-[15px]">
            {facts.map((fact, i) => (
              <li key={fact.label} className={`flex items-center gap-3 ${i ? "h-[65px] border-t border-white/10" : "h-16"}`}>
                <FactValue fact={fact} mobile />
                <p className="h-7 min-w-0 flex-1 text-[13px] leading-[1.45] text-white/65">{fact.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Facts — tablet grid (3 + 2) / desktop row */}
        <Reveal delay={80} className="mt-10 hidden md:block">
          <ul className="grid grid-cols-3 overflow-hidden rounded-[32px] border border-white/9 bg-white/3 px-2 py-4 backdrop-blur-[15px] xl:flex xl:py-10">
            {facts.map((fact, i) => (
              <li
                key={fact.label}
                className={`flex min-w-0 flex-1 flex-col gap-3.5 px-6 py-6 xl:py-0 ${i % 3 ? "border-l border-white/10" : ""} ${
                  i >= 3 ? "border-t border-white/10 xl:border-t-0" : ""
                } ${i === 3 ? "xl:border-l" : ""}`}
              >
                <FactValue fact={fact} />
                <p className="text-[14px] leading-[1.45] text-white/65">{fact.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Audience marquee */}
        <Reveal delay={140} className="mt-7 flex items-center gap-7 md:mt-10">
          <p className="hidden shrink-0 font-display text-[14px] leading-[1.3] font-semibold tracking-[0.04em] text-lime uppercase md:block">
            {en ? "Who we" : "Для кого"}
            <br />
            {en ? "build for" : "розробляємо"}
          </p>

          <div className="relative min-w-0 flex-1 max-md:pl-5">
            <Marquee
              items={audiences}
              gapClass="gap-(--marquee-gap)"
              className="[--marquee-gap:6.2px] md:[--marquee-gap:10px]"
              duration={50}
              mobileDuration={33}
              renderItem={(item) => (
                <span className="flex h-[29px] items-center rounded-full border border-lime px-[13.64px] md:block md:h-auto py-[8.06px] font-display text-[8.68px] leading-display font-medium whitespace-nowrap text-white transition-colors duration-300 hover:bg-white/10 md:border-white/16 md:bg-white/4 md:px-[22px] md:py-[13px] md:text-[14px]">
                  {item}
                </span>
              )}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-ink to-transparent md:w-[90px]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent md:w-[90px]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
