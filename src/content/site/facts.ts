import { audiencesByLocale, factsByLocale } from "@/data/facts";
import type { Locale } from "@/i18n/locale";
import type { FactsContent } from "../types";

export const factsContent: Record<Locale, FactsContent> = {
  uk: {
    tag: "Чому ми",
    title: "Тільки факти",
    // Figma's two-line break (shown from 384px): line 1 ends with a non-breaking "в договорі"
    lead: ["Конкретні умови, які фіксуємо в договорі —", " без «індивідуального підходу» і загальних слів."],
    facts: factsByLocale.uk,
    audienceTitle: ["Для кого", "розробляємо"],
    audiences: audiencesByLocale.uk,
  },
  en: {
    tag: "Why us",
    title: "Just the facts",
    lead: ["Specific terms we lock in by contract —", " no “custom approach” talk or vague promises."],
    facts: factsByLocale.en,
    audienceTitle: ["Who we", "build for"],
    audiences: audiencesByLocale.en,
  },
};
