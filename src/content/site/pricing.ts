import { pricingByLocale } from "@/data/pricing";
import type { Locale } from "@/i18n/locale";
import type { PricingContent } from "../types";

export const pricingContent: Record<Locale, PricingContent> = {
  uk: {
    tag: "Тарифи",
    title: "Пакети та вартість",
    from: "Від",
    // only used when a price is not set (the Ukrainian plans always have one)
    quote: ["Ціна", "за запитом"],
    payment: { title: "Гнучка оплата частинами", note: "До 12 місяців — деталі на консультації" },
    discountsTitle: { parts: ["Умови", "знижки"], accent: 1 },
    hit: "Хіт продажів",
    choose: "Обрати пакет",
    discuss: "Обговорити",
    chooseLabel: "обрати пакет",
    discussLabel: "обговорити",
    plans: pricingByLocale.uk.plans,
    customPlan: pricingByLocale.uk.customPlan,
    customPlanMobile: { line1: "AI-асистенти, Telegram-боти,", line2Nowrap: "автоматизація процесів", line2Tail: " та", line3Nowrap: "інтеграції під ваш бізнес." },
    discounts: pricingByLocale.uk.discounts,
  },
  en: {
    tag: "Pricing",
    title: "Packages & pricing",
    from: "From",
    // shown while the US price of a plan is not set (see data/pricing.ts)
    quote: ["Custom", "quote"],
    payment: { title: "Flexible installment plans", note: "Up to 12 months — details on a call" },
    discountsTitle: { parts: ["Discount", "terms"], accent: 0 },
    hit: "Best seller",
    choose: "Choose package",
    discuss: "Let’s talk",
    chooseLabel: "choose package",
    discussLabel: "let’s talk",
    plans: pricingByLocale.en.plans,
    customPlan: pricingByLocale.en.customPlan,
    customPlanMobile: { line1: "AI assistants, Telegram bots,", line2Nowrap: "process automation", line2Tail: " and", line3Nowrap: "integrations for your business." },
    discounts: pricingByLocale.en.discounts,
  },
};
