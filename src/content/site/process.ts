import { stepsByLocale } from "@/data/process";
import type { Locale } from "@/i18n/locale";
import type { ProcessContent } from "../types";

export const processContent: Record<Locale, ProcessContent> = {
  uk: {
    tag: "Етапи роботи",
    title: ["Від ідеї до", "запуску"],
    lead: "Прозорий процес у 4 кроки. На кожному етапі ви бачите результат і погоджуєте його перед наступним.",
    steps: stepsByLocale.uk,
    average: "Середній термін запуску лендінгу —",
    averageValue: "10 днів",
    cta: { label: "Почати проєкт", href: "#contact" },
  },
  en: {
    tag: "How we work",
    title: ["From idea", "to launch"],
    lead: "A transparent 4-step process. At every stage you see the result and approve it before we move on.",
    steps: stepsByLocale.en,
    average: "Average landing page launch time —",
    averageValue: "10 days",
    cta: { label: "Start a project", href: "#contact" },
  },
};
