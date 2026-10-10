import Image from "next/image";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { ReadWords, ScrollRead } from "@/components/ui/ScrollRead";
import { socialLinks } from "@/data/navigation";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: {
    tag: "Про нас",
    founderAlt: "German Guk — засновник MIROFORM",
    statement: "— digital-студія, що поєднує дизайн, технології та результат.",
    // "…нова [photo] форма" — the photo sits inside the phrase
    readBefore: "Сім років досвіду — нова",
    readAfter: "форма, нове ім’я.",
    projects: "Реалізованих проєктів",
    years: "Років досвіду в digital",
    fullCycle: "Full-cycle підхід: аналітика, дизайн, розробка, запуск і підтримка — разом, від ідеї до результату.",
  },
  en: {
    tag: "About us",
    founderAlt: "German Guk — founder of MIROFORM",
    statement: "— a digital studio uniting design, technology and results.",
    readBefore: "Seven years of craft — a new",
    readAfter: "form, a new name.",
    projects: "Projects delivered",
    years: "Years of experience",
    fullCycle: "Full-cycle approach: research, design, development, launch and support — together, from idea to results.",
  },
} satisfies Record<Locale, Record<string, string>>;

function InlinePhoto({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 overflow-hidden rounded-full align-middle ${className}`}>
      <Image
        src="/images/about/inline.jpg"
        alt=""
        width={254}
        height={364}
        draggable={false}
        className="no-native-image absolute top-[-89.18%] left-[0.13%] h-[413.11%] w-full max-w-none"
      />
    </span>
  );
}

function FounderCard({ locale }: { locale: Locale }) {
  return (
    <a
      // for now the card leads to the company Instagram (@miro.form); founderInstagram (@gukgerman) is kept in navigation.ts
      href={socialLinks.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="German Guk, Founder & CEO — Instagram MIROFORM @miro.form"
      draggable={false}
      className="pop-trigger no-native-image relative flex flex-col gap-[34px] overflow-hidden rounded-[28px] border border-white/8 bg-[#111] transition-[translate,border-color,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:border-white/16 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.3)] active:border-white/16 p-2.5 max-md:h-[496px] md:gap-[30px] md:rounded-[32px] md:p-5 lg:h-full">
      <Image
        src="/images/about/orange-glow.png"
        alt=""
        width={736}
        height={816}
        aria-hidden="true"
        draggable={false}
        className="no-native-image absolute top-[199px] left-[-96px] h-[460px] w-[540px] max-w-none object-contain md:top-auto md:bottom-[-193px] md:left-[-104px] md:h-[560px] md:w-[641px]"
      />

      <div className="relative h-[372px] w-full shrink-0 overflow-hidden rounded-[20px] md:h-auto md:min-h-[320px] md:flex-1 md:rounded-[22px] lg:h-[432px] lg:flex-none">
        {/* Mobile photo */}
        <Image
          src="/images/about/m-founder.png"
          alt={copy[locale].founderAlt}
          fill
          sizes="350px"
          draggable={false}
          className="no-native-image object-fill md:hidden"
        />
        {/* Desktop photo (crop from Figma) */}
        <Image
          src="/images/about/founder.png"
          alt={copy[locale].founderAlt}
          width={839}
          height={1119}
          sizes="420px"
          draggable={false}
          className="no-native-image absolute top-[-7.41%] left-[-1.17%] h-[119.61%] w-[101.96%] max-w-none max-md:hidden"
        />
      </div>

      <div className="relative flex items-center justify-between px-3 md:px-4">
        <div className="flex flex-col gap-2.5 whitespace-nowrap">
          <p className="font-pixel text-[20px] leading-pixel tracking-[-0.01em] text-white md:text-[24px]">German Guk</p>
          <p className="text-[18px] leading-body text-white/60 md:text-[21px]">Founder &amp; CEO</p>
        </div>
        <span aria-hidden="true" className="relative grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-full bg-lime">
          <ArrowShot color="#0A0A0A" size={20} />
        </span>
      </div>
    </a>
  );
}

function StatCard({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "lime" | "dark" }) {
  const lime = tone === "lime";
  return (
    <div
      className={`@container flex h-[170px] min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[24px] px-4 pt-4 pb-5 md:h-[280px] md:rounded-[32px] md:px-8 md:pt-8 md:pb-7 transition-[translate,border-color,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 ${
        lime
          ? "bg-lime text-ink-2 hover:shadow-[0_24px_60px_-28px_rgba(174,238,5,0.55)] active:shadow-[0_24px_60px_-28px_rgba(174,238,5,0.55)]"
          : "border border-white/8 bg-[#111] text-white hover:border-white/16 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.3)] active:border-white/16"
      }`}
    >
      <p
        className={`text-[12px] leading-body tracking-[0.06em] uppercase md:max-w-[300px] md:text-[18px] ${lime ? "text-ink-2/70" : "max-w-[102px] text-white/70 md:max-w-[300px]"}`}
      >
        {label}
      </p>
      <CountUp
        to={value}
        suffix={suffix}
        className="font-pixel text-[34px] leading-pixel tracking-[-0.04em] whitespace-nowrap md:text-[min(75px,calc(25cqw-17px))]"
      />
    </div>
  );
}

function FullCycleCard({ locale }: { locale: Locale }) {
  return (
    <div className="relative flex h-[340px] flex-col gap-4 overflow-hidden rounded-[28px] border border-white/8 transition-[translate,border-color,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:border-white/16 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.3)] active:border-white/16 px-5 pt-[30px] pb-5 md:h-[280px] md:gap-[18px] md:rounded-[32px] md:p-8">
      {/* Glow + fade + glass star (mobile and desktop placements differ) */}
      <Image
        src="/images/glow.png"
        alt=""
        width={1470}
        height={1176}
        aria-hidden="true"
        className="pointer-events-none absolute right-[-200px] bottom-[-31px] h-[440px] w-[640px] max-w-none object-cover opacity-85 md:top-[-121px] md:right-[-281px] md:bottom-auto md:h-[520px] md:w-[900px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px bg-[linear-gradient(180deg,#0a0a0a_30%,rgba(10,10,10,0)_72%)] md:bg-[linear-gradient(90deg,#0a0a0a_30%,rgba(10,10,10,0)_75%)]"
      />
      <Image
        src="/images/about/glass-star.png"
        alt=""
        width={735}
        height={960}
        aria-hidden="true"
        className="float pointer-events-none absolute right-[-134px] bottom-[-136px] h-[368px] w-[388px] max-w-none object-contain md:top-[-121px] md:right-[-293px] md:bottom-auto md:h-[664px] md:w-[702px]"
      />

      <CountUp
        to={100}
        suffix="%"
        className="relative font-pixel text-[44px] leading-pixel tracking-[-0.03em] whitespace-nowrap text-white md:text-[75px]"
      />
      <p className="relative w-[272px] text-[15px] leading-[1.1] text-white/80 md:w-[462px] md:max-w-[60%] md:text-[18px] md:leading-[1.5] xl:max-[1439px]:max-w-[55%]">
        {copy[locale].fullCycle}
      </p>
      <p className="relative font-pixel text-[11px] leading-[1.4] text-lime uppercase md:text-[15px] md:leading-pixel">
        Make the right
        <br className="md:hidden" /> decision
      </p>
    </div>
  );
}

export function About({ locale = "uk" }: { locale?: Locale }) {
  const t = copy[locale];
  return (
    <section id="about" className="relative overflow-hidden bg-ink pt-6 pb-8 md:pt-[69px] md:pb-[70px]">
      {/* Faint left glow (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-[calc(50%-1093.5px)] hidden h-[728px] w-[644px] opacity-22 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] md:block"
      >
        <Image src="/images/glow.png" alt="" width={1470} height={1176} className="absolute top-[-154px] left-[-42px] size-[868px] max-w-none object-cover" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8 lg:px-[clamp(40px,6.25vw,90px)]">
        <Reveal className="flex flex-col gap-[22px] md:gap-[30px]">
          <SectionTag className="self-start pt-[10px] pr-[15px] pb-[9px] pl-4">{t.tag}</SectionTag>

          {/* Mobile statement */}
          <ScrollRead as="div" from={0.35} className="flex flex-col gap-1 md:hidden">
            <p className="font-display text-[24px] leading-[1.28] font-medium tracking-[-0.02em] text-white">
              <span className="font-pixel leading-none text-lime">MIROFORM®</span> {t.statement}{" "}
              <span className="text-white/35">
                <ReadWords text={t.readBefore} />
              </span>
            </p>
            <p className="flex items-center gap-2.5 font-display text-[24px] leading-[1.28] font-medium tracking-[-0.02em] text-white/35">
              <InlinePhoto className="h-6 w-[69px]" />
              <span>
                <ReadWords text={t.readAfter} />
              </span>
            </p>
          </ScrollRead>

          {/* Desktop statement */}
          <ScrollRead
            from={0.35}
            className="font-display text-[34px] leading-[1.28] font-medium tracking-[-0.02em] text-white max-md:hidden lg:text-[40px] xl:text-[46px]"
          >
            <span className="font-pixel leading-none text-lime">MIROFORM®</span> {t.statement}{" "}
            <span className="text-white/35">
              <ReadWords text={t.readBefore} />{" "}
              <InlinePhoto className="mx-[0.35em] h-[0.96em] w-[2.76em] -translate-y-[0.05em]" /> <ReadWords text={t.readAfter} />
            </span>
          </ScrollRead>
        </Reveal>

        <div className="mt-9 flex flex-col gap-2 md:mt-[63px] md:grid md:grid-cols-2 md:gap-5 lg:flex lg:flex-row">
          <Reveal className="lg:w-[clamp(380px,33.4%,420px)] lg:shrink-0">
            <FounderCard locale={locale} />
          </Reveal>

          <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-5">
            <Reveal delay={80} className="flex gap-2.5 md:flex-col md:gap-5 md:max-lg:flex-1 lg:flex-row">
              <StatCard label={t.projects} value={400} suffix="+" tone="lime" />
              <StatCard label={t.years} value={7} suffix="+" tone="dark" />
            </Reveal>
            <Reveal delay={160} className="md:max-lg:hidden">
              <FullCycleCard locale={locale} />
            </Reveal>
          </div>

          <Reveal className="hidden md:col-span-2 md:block lg:hidden">
            <FullCycleCard locale={locale} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
