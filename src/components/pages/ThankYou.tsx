import { PillButton } from "@/components/ui/PillButton";
import { PixelAssemble } from "@/components/ui/PixelAssemble";
import { StatusScreen } from "@/components/ui/StatusScreen";
import { routes, type Locale } from "@/i18n/locale";

/*
 * Pixel lines: the giant heading fits about 8.6 character cells on a 360px phone,
 * so the English lines keep the length of the Ukrainian ones.
 */
const copy = {
  uk: {
    eyebrow: { lead: "ЗАЯВКУ ОТРИМАНО", question: "ПИТАННЯ ОТРИМАНО" },
    srTitle: { lead: "Дякуємо за заявку", question: "Дякуємо за питання" },
    line1: "ДЯКУЄМО",
    line2: { lead: "ЗА ЗАЯВКУ", question: "ЗА ПИТАННЯ" },
    text: {
      lead: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
      question: "Ми отримали ваше питання та відповімо найближчим часом.",
    },
    back: "Повернутися на сайт",
  },
  en: {
    eyebrow: { lead: "REQUEST RECEIVED", question: "QUESTION RECEIVED" },
    srTitle: { lead: "Thank you for your request", question: "Thank you for your question" },
    line1: "THANK YOU",
    line2: { lead: "WE GOT IT", question: "WE GOT IT" },
    text: {
      lead: "We’ve received your request and will get back to you shortly.",
      question: "We’ve received your question and will reply shortly.",
    },
    back: "Back to the site",
  },
} satisfies Record<Locale, unknown>;

/** Shown only after a form was sent successfully (see ContactForm). */
export function ThankYou({ question, locale = "uk" }: { question: boolean; locale?: Locale }) {
  const t = copy[locale];
  const kind = question ? "question" : "lead";
  return (
    <StatusScreen locale={locale}>
      <p className="font-pixel text-[11px] leading-pixel text-lime md:text-[13px]">{t.eyebrow[kind]}</p>

      <h1 className="pixel-headline mt-7 flex flex-col items-center gap-[0.35em] font-pixel text-[min(9.2vw,88px)] leading-none text-white md:mt-9">
        <span className="sr-only">{t.srTitle[kind]}</span>
        <PixelAssemble text={t.line1} />
        <span className="text-lime">
          <PixelAssemble text={t.line2[kind]} start={7} />
        </span>
      </h1>

      <p className="mt-8 max-w-[440px] text-[15px] leading-[1.55] text-balance text-white/70 md:mt-10 md:text-[17px]">{t.text[kind]}</p>

      <PillButton href={routes[locale].home} circleSize={44} gap={18} className="mt-9 h-[60px] pr-2 pl-[28px] md:mt-11">
        {t.back}
      </PillButton>
    </StatusScreen>
  );
}
