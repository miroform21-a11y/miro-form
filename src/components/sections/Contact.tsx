import Image from "next/image";
import { socialLinks } from "@/data/navigation";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: {
    tag: "Контакти",
    title: ["Маєте ідею?", "Розкажіть", "нам про неї"],
    lead: "Відповімо протягом 15 хвилин та запропонуємо оптимальне рішення для вашого проєкту.",
  },
  en: {
    tag: "Contact",
    title: ["Got an idea?", "Tell us", "all about it"],
    lead: "We’ll reply within 15 minutes and suggest the best solution for your project.",
  },
} satisfies Record<Locale, unknown>;

const messengers = [
  { label: "Telegram", href: socialLinks.telegram },
  { label: "WhatsApp", href: socialLinks.whatsapp },
  { label: "Instagram", href: socialLinks.instagram },
];

/** US audience: WhatsApp first, Telegram last */
const messengersEn = [messengers[1], messengers[2], messengers[0]];

export function Contact({ locale = "uk" }: { locale?: Locale }) {
  const t = copy[locale];
  return (
    <section id="contact" className="relative bg-ink px-2.5 pt-6 pb-[72px] md:px-[38px] md:py-[55px]">
      {/* English budget chips wrap to a second row, so the English card may grow past the 806px Figma height */}
      <div
        className={`relative mx-auto flex max-w-[1364px] flex-col gap-[34px] overflow-hidden rounded-[28px] border border-white/8 bg-ink-2 pt-8 pr-[11px] pb-[216px] pl-[13px] md:rounded-[40px] md:px-12 md:pt-12 md:pb-[300px] ${locale === "en" ? "xl:min-h-[806px]" : "xl:h-[806px]"} xl:flex-row xl:items-start xl:justify-between xl:gap-10 xl:px-[67px] xl:pt-[47px] xl:pb-[46px]`}
      >
        {/* ---------- Background (mobile / tablet) ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 xl:hidden">
          <img src="/images/contact/m-glow-soft.svg" alt="" className="absolute top-[313px] left-[-241px] h-[600px] w-[660px] max-w-none" />
          <img src="/images/contact/m-glow-deep.svg" alt="" className="absolute top-[583px] left-[19px] h-[700px] w-[640px] max-w-none md:left-auto md:right-[-120px]" />
          <div className="absolute -inset-px bg-[linear-gradient(180deg,#0a0a0a_0%,rgba(10,10,10,0.95)_22.3%,rgba(10,10,10,0)_40.5%,rgba(10,10,10,0.6)_100%)]" />
          <div className="absolute -inset-px bg-[linear-gradient(90deg,#0a0a0a_0%,rgba(10,10,10,0)_22%)]" />
        </div>

        {/* ---------- Background (desktop) ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
          <Image
            src="/images/glow.png"
            alt=""
            width={1470}
            height={1176}
            // starts where it did, but now runs to the right edge of the card (it used to stop ~316px short, leaving a cut)
            className="absolute top-[-121px] left-[-315.77px] h-[1000px] w-[calc(100%+315.77px)] max-w-none object-fill opacity-90"
          />
          <div className="absolute -inset-px bg-[linear-gradient(90deg,rgba(10,10,10,0.2)_25%,rgba(10,10,10,0.9)_60%)]" />
          <div className="absolute -inset-px bg-[linear-gradient(90deg,#0a0a0a_0%,rgba(10,10,10,0)_13%),linear-gradient(0deg,rgba(10,10,10,0.7)_0%,rgba(10,10,10,0)_16%)]" />
        </div>

        {/* 3D esc key */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-199px] left-[-137px] h-[440px] w-[656px] overflow-hidden md:bottom-[-250px] md:left-[calc(50%-420px)] md:h-[560px] md:w-[835px] xl:bottom-[-298px] xl:left-[-103.82px] xl:h-[644px] xl:w-[968.44px]"
        >
          <Image
            src="/images/contact/esc-key-hq.png"
            alt=""
            width={1981}
            height={794}
            sizes="(min-width: 1280px) 820px, 560px"
            className="absolute top-[5.53%] left-[11.58%] h-[50.62%] w-[84.09%] max-w-none xl:top-[3.6%] xl:left-[11.97%]"
          />
        </div>

        {/* Left content */}
        <Reveal className="relative flex min-w-0 flex-col gap-4 pl-1.5 md:pl-0 xl:h-[424px] xl:max-w-[537px] xl:flex-1 xl:gap-7 xl:pt-[17px]">
          <div className="flex flex-col gap-4 xl:gap-6">
            <SectionTag className="self-start pr-[26px] xl:pr-[30px]">{t.tag}</SectionTag>
            <p className="font-pixel text-[11px] leading-pixel whitespace-nowrap text-white/60 xl:text-[13px]">Make the right decision</p>
          </div>
          <h2 className="font-display text-[36px] leading-[38px] font-bold md:leading-[1.05] tracking-[-0.03em] whitespace-nowrap text-white md:text-[52px] xl:text-[58px]">
            {t.title[0]}
            <br />
            {t.title[1]}
            <br />
            <span className="text-lime">{t.title[2]}</span>
          </h2>
          <div className="flex flex-col gap-[22px] xl:gap-7">
            <p className="max-w-[282px] text-[15px] leading-[1.55] text-white/90 md:max-w-[462px] xl:text-[17px]">
              {t.lead}
            </p>
            <ul className="flex flex-wrap gap-1.5 xl:gap-4">
              {(locale === "en" ? messengersEn : messengers).map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block rounded-full after:absolute after:-inset-x-0.5 after:-inset-y-2 after:content-[''] border border-white/30 bg-ink-2/40 px-[13px] pt-[9px] pb-2 font-display text-[10px] leading-display font-medium tracking-[0.04em] text-white uppercase transition-colors duration-300 hover:border-lime hover:text-lime xl:py-[9px] xl:pr-[15px] xl:pl-[18px] xl:text-[12px]"
                  >
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={120} className="relative w-full md:max-w-[620px] xl:w-[588px] xl:shrink-0">
          <ContactForm locale={locale} />
        </Reveal>
      </div>
    </section>
  );
}
