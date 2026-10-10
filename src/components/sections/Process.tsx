import Image from "next/image";
import { stepsByLocale, type Step } from "@/data/process";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: {
    tag: "Етапи роботи",
    title: ["Від ідеї до", "запуску"],
    lead: "Прозорий процес у 4 кроки. На кожному етапі ви бачите результат і погоджуєте його перед наступним.",
    average: "Середній термін запуску лендінгу —",
    averageValue: "10 днів",
    cta: "Почати проєкт",
  },
  en: {
    tag: "How we work",
    title: ["From idea", "to launch"],
    lead: "A transparent 4-step process. At every stage you see the result and approve it before we move on.",
    average: "Average landing page launch time —",
    averageValue: "10 days",
    cta: "Start a project",
  },
} satisfies Record<Locale, unknown>;
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

function DurationTag({ children }: { children: string }) {
  return (
    <span className="inline-flex h-[35px] items-center rounded-full border border-white/30 bg-white/4 py-[9px] pr-[15px] pl-[17px] font-display text-[12px] leading-display font-medium tracking-[0.04em] text-white uppercase">
      {children}
    </span>
  );
}

function StepText({ step }: { step: Step }) {
  return (
    <div className="flex w-full flex-col gap-2.5 md:gap-3.5">
      <h3 className="font-display text-[19px] leading-[24px] font-semibold whitespace-pre-wrap md:leading-[1.25] tracking-[-0.01em] text-white md:w-[280px] md:max-w-full md:text-[20px]">
        {step.title[0]}
        <br />
        {step.title[1]}
      </h3>
      <p className="text-[14px] leading-[1.5] text-white/60 md:w-[276px] md:max-w-full md:text-[15px]">
        {step.descriptionLines ? (
          <>
            {step.descriptionLines[0]}
            <br />
            {step.descriptionLines[1]}
          </>
        ) : (
          step.description
        )}
      </p>
    </div>
  );
}

export function Process({ locale = "uk" }: { locale?: Locale }) {
  const t = copy[locale];
  const steps = stepsByLocale[locale];
  return (
    <section id="process" className="relative overflow-hidden bg-ink md:[overflow:clip_visible] pt-12 pb-[50px] md:py-14">
      {/* Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Mobile lime arc: blue glow tinted lime, radial mask */}
        <div className="absolute top-[-170px] left-[calc(100%-300px)] h-[520px] w-[460px] overflow-hidden opacity-75 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] md:hidden">
          <div className="absolute top-[-110px] left-[-30px] isolate size-[620px]">
            <Image src="/images/glow.png" alt="" width={1470} height={1176} className="absolute inset-0 size-full max-w-none object-cover" />
            <div className="absolute inset-0 bg-lime mix-blend-hue" />
            <div className="absolute inset-0 bg-lime opacity-60 mix-blend-color" />
          </div>
        </div>
        <img src="/images/process/m-glow-left.svg" alt="" className="absolute top-[398px] left-[-340px] h-[600px] w-[580px] max-w-none md:hidden" />
        <img src="/images/process/m-glow-right.svg" alt="" className="absolute top-[790px] left-[156px] h-[600px] w-[580px] max-w-none md:hidden" />

        <img
          src="/images/process/glow-left.svg"
          alt=""
          className="absolute top-[-15px] left-[calc(50%-1313px)] hidden h-[960px] w-[1000px] max-w-none md:block"
        />
        <img
          src="/images/process/glow-right.svg"
          alt=""
          className="absolute top-[25px] left-[calc(50%+313px)] hidden h-[960px] w-[1000px] max-w-none md:block"
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8 lg:pr-[clamp(40px,5.6vw,81px)] lg:pl-[clamp(40px,6.9vw,99px)]">
        {/* Header */}
        <Reveal className="flex flex-col gap-[18px] md:gap-6 lg:h-[211px] lg:flex-row lg:items-end lg:justify-between lg:pb-5">
          <div className="flex flex-col gap-[22px] md:gap-6">
            <SectionTag className="self-start">{t.tag}</SectionTag>
            <h2 className="font-display text-[38px] leading-[1.05] font-bold tracking-[-0.03em] whitespace-nowrap text-white md:text-[56px] xl:text-[64px]">
              {t.title[0]}
              <br />
              {t.title[1]}
            </h2>
          </div>
          <p className="text-[16px] leading-[1.55] font-[350] text-white/65 md:max-w-[420px] md:text-[18px] lg:w-[322px] lg:pb-[9px]">
            {t.lead}
          </p>
        </Reveal>

        {/* Mobile vertical timeline */}
        <ScrollProgress as="ol" anchor={0.62} className="relative mt-[46px] flex flex-col gap-9 md:hidden">
          <span
            aria-hidden="true"
            className="absolute top-[19px] bottom-[7px] left-[6.5px] w-px bg-gradient-to-b from-white/22 to-white/5"
          />
          <span
            aria-hidden="true"
            className="absolute top-[19px] bottom-[7px] left-[6.5px] w-px origin-top bg-lime"
            style={{ scale: "1 var(--progress)" }}
          />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 60} className="relative flex items-start gap-[26px]">
              <img src={i === 0 ? "/images/process/m-dot-active.svg" : "/images/process/m-dot.svg"} alt="" className="h-[26px] w-3.5 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
                <p className={`font-pixel text-[34px] leading-pixel ${i === 0 ? "text-lime" : "text-white/18"}`}>{step.number}</p>
                <StepText step={step} />
                <DurationTag>{step.duration}</DurationTag>
              </div>
            </Reveal>
          ))}
        </ScrollProgress>

        {/* Desktop / tablet horizontal timeline */}
        <ScrollProgress
          as="ol"
          anchor={0.85}
          travel={420}
          className="mt-10 hidden grid-cols-2 gap-x-5 gap-y-12 md:grid lg:flex lg:min-h-[319px] lg:gap-5"
        >
          {steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 90} className="flex min-w-0 flex-1 flex-col items-start gap-6">
              <div className="flex w-full items-center">
                <img src={i === 0 ? "/images/process/dot-active.svg" : "/images/process/dot.svg"} alt="" className="h-3.5 w-[17.2px] shrink-0" />
                <span aria-hidden="true" className="relative h-px flex-1">
                  <span
                    className={`absolute inset-0 origin-left scale-x-0 transition-transform delay-300 duration-1000 ease-(--ease-smooth) in-[.is-visible]:scale-x-100 ${
                      i === steps.length - 1 ? "bg-gradient-to-r from-white/20 to-white/0" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`absolute inset-0 origin-left ${i === steps.length - 1 ? "bg-gradient-to-r from-lime to-lime/0" : "bg-lime"}`}
                    style={{ scale: `clamp(0, calc(var(--progress) * ${steps.length} - ${i}), 1) 1` }}
                  />
                </span>
              </div>
              <p className={`font-pixel text-[44px] leading-pixel ${i === 0 ? "text-lime" : "text-white/18"}`}>{step.number}</p>
              <StepText step={step} />
              <DurationTag>{step.duration}</DurationTag>
            </Reveal>
          ))}
        </ScrollProgress>

        {/* CTA */}
        <Reveal className="mt-[46px] flex h-[180px] flex-col items-center justify-between rounded-[24px] border border-white/10 bg-white/4 px-6 pt-[19px] pb-[26px] backdrop-blur-[15px] md:mt-10 md:h-[94px] md:flex-row md:rounded-[28px] md:py-0 md:pr-4 md:pl-10">
          <p className="w-full font-display text-[18px] leading-[1.5] font-medium text-white md:w-auto md:text-[18px] md:leading-display lg:text-[20px]">
            {t.average} <span className="text-lime">{t.averageValue}</span>
          </p>
          <PillButton href="#contact" circleSize={44} gap={11} className="h-[60px] w-full shrink-0 pr-2 pl-[27px] md:w-auto">
            {t.cta}
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
