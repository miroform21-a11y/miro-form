import type { Locale } from "@/i18n/locale";
import type { SeoContent } from "../types";

/**
 * Title + meta description of every public page (Open Graph / Twitter reuse them via lib/seo.ts).
 * canonical, hreflang, robots and the preview images are technical and stay in code.
 */
export const seoContent: Record<Locale, SeoContent> = {
  uk: {
    home: {
      title: "Створення сайтів і лендінгів під ключ — від $390 | MIROFORM",
      description:
        "Розробка сайтів і лендінгів під ключ для бізнесу: дизайн, розробка, AI та Telegram-інтеграції. Лендінг від $390, запуск від 7 днів, фіксована ціна в договорі.",
    },
    privacy: { title: "Політика конфіденційності — MIROFORM", description: "Як MIROFORM збирає, використовує та захищає персональні дані відвідувачів сайту." },
    brief: { title: "Бриф — MIROFORM", description: "Анкета для нового проєкту MIROFORM: цілі, структура, функціонал, контент, терміни та бюджет." },
    thankYou: { title: "Дякуємо за заявку — MIROFORM", description: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом." },
  },
  en: {
    home: {
      title: "Turnkey Website & Landing Page Development — MIROFORM",
      description:
        "Turnkey websites and landing pages for business: design, development, AI and Telegram integrations. Landing pages from $990, launch in as little as 7 days.",
    },
    privacy: { title: "Privacy Policy — MIROFORM", description: "How MIROFORM collects, uses and protects the personal data of website visitors." },
    brief: { title: "Project Brief — MIROFORM", description: "Project questionnaire for MIROFORM: goals, structure, features, content, timeline and budget." },
    thankYou: { title: "Thank you — MIROFORM", description: "We’ve received your request and will get back to you shortly." },
  },
};
