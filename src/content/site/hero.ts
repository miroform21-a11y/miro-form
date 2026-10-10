import type { Locale } from "@/i18n/locale";
import type { HeroContent } from "../types";

/** Square, face-centred crops of the Figma photos — they fill the circle completely */
const avatars: HeroContent["avatars"] = ["/images/avatars/client-1.jpg", "/images/avatars/client-2.jpg", "/images/avatars/client-3.jpg", "/images/avatars/client-4.jpg"];

/** Pill widths from Figma (desktop 1440 / mobile 390) */
const stack: HeroContent["stack"] = [
  { label: "Figma", w: [83.35, 70.85] },
  { label: "Framer", w: [97.89, 83.21] },
  { label: "Next.js", w: [95.95, 81.56] },
  { label: "Webflow", w: [110, 93.5] },
];

export const heroContent: Record<Locale, HeroContent> = {
  uk: {
    eyebrow: "МИ СТВОРЮЄМО",
    title: ["Сайти, які", "продають —", "а не просто", "існують"],
    lead: ["Дизайн, розробка й AI-рішення під ключ.", "Від ідеї до першої заявки — від 7 днів."],
    cta: { label: "Обговорити проєкт", href: "#contact" },
    ratingScore: "★★★★★ 4.9",
    rating: "347+ клієнтів у 12 країнах",
    avatars,
    stack,
  },
  en: {
    eyebrow: "WE BUILD",
    title: ["Websites", "that sell —", "not just", "sit there"],
    lead: ["Turnkey design, development and AI solutions.", "From idea to first lead in as little as 7 days."],
    cta: { label: "Discuss your project", href: "#contact" },
    ratingScore: "★★★★★ 4.9",
    rating: "347+ clients in 12 countries",
    // own copies, so editing one language never changes the other
    avatars: [...avatars],
    stack: stack.map((s) => ({ ...s })),
  },
};
