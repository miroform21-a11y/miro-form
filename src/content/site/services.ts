import { servicesByLocale } from "@/data/services";
import type { Locale } from "@/i18n/locale";
import type { ServicesContent } from "../types";

export const servicesContent: Record<Locale, ServicesContent> = {
  uk: {
    tag: "Послуги",
    heading: {
      mobile: { before: "Беремося за проєкти,", bold: "якими зможемо пишатися", after: ", та доводимо їх до результату" },
      desktop: { line1: "Беремося  за проєкти,", line1Bold: "якими", line2BoldBeforeLogos: "зможемо", line2BoldAfterLogos: "пишатися", line3: "та доводимо їх до результату" },
    },
    quote: "Незалежно від типу проєкту, ми вкладаємо максимум умінь і досвіду, щоб отримати результат, яким не соромно хвалитися.",
    // decor cursor labels (fixed label widths from Figma)
    cursorSite: "Сайт",
    cursorDesign: "Дизайн",
    keyLetter: "М",
    leadLabel: "залишити заявку",
    cards: servicesByLocale.uk,
  },
  en: {
    tag: "Services",
    heading: {
      mobile: { before: "We take on projects", bold: "we can be proud of", after: " and see them through to results" },
      desktop: { line1: "We take on projects", line1Bold: "that", line2BoldBeforeLogos: "we’re", line2BoldAfterLogos: "proud of", line3: "and see them through to results" },
    },
    quote: "Whatever the project, we put all our skill and experience into it to deliver a result worth showing off.",
    cursorSite: "Site",
    cursorDesign: "Design",
    keyLetter: "M",
    leadLabel: "request a quote",
    cards: servicesByLocale.en,
  },
};
