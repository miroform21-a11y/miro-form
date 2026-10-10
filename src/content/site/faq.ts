import { faqByLocale } from "@/data/faq";
import type { Locale } from "@/i18n/locale";
import type { FaqContent } from "../types";

export const faqContent: Record<Locale, FaqContent> = {
  uk: {
    title: ["Питання", "та відповіді"],
    items: faqByLocale.uk,
    askCard: {
      label: "Не знайшли відповідь? Поставити питання",
      title: ["Не знайшли", "відповідь?"],
      text: "Напишіть нам у Telegram — відповімо протягом 15 хвилин у робочий час.",
      button: "Поставити питання",
    },
  },
  en: {
    title: ["Questions", "& answers"],
    items: faqByLocale.en,
    askCard: {
      label: "Didn’t find your answer? Ask a question",
      title: ["Didn’t find", "your answer?"],
      text: "Message us on Telegram and we’ll reply within 15 minutes during business hours.",
      button: "Ask a question",
    },
  },
};
