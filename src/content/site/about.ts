import { socialLinks } from "@/data/navigation";
import type { Locale } from "@/i18n/locale";
import type { AboutContent } from "../types";

export const aboutContent: Record<Locale, AboutContent> = {
  uk: {
    tag: "Про нас",
    statement: "— digital-студія, що поєднує дизайн, технології та результат.",
    // "…нова [photo] форма" — the photo sits inside the phrase
    readBefore: "Сім років досвіду — нова",
    readAfter: "форма, нове ім’я.",
    founder: {
      name: "German Guk",
      role: "Founder & CEO",
      alt: "German Guk — засновник MIROFORM",
      // for now the card leads to the company Instagram (@miro.form); founderInstagram (@gukgerman) is kept in navigation.ts
      href: socialLinks.instagram,
      ariaLabel: "German Guk, Founder & CEO — Instagram MIROFORM @miro.form",
    },
    stats: [
      { label: "Реалізованих проєктів", value: 400, suffix: "+" },
      { label: "Років досвіду в digital", value: 7, suffix: "+" },
    ],
    fullCycle: {
      value: 100,
      suffix: "%",
      text: "Full-cycle підхід: аналітика, дизайн, розробка, запуск і підтримка — разом, від ідеї до результату.",
      tagline: ["Make the right", "decision"],
    },
  },
  en: {
    tag: "About us",
    statement: "— a digital studio uniting design, technology and results.",
    readBefore: "Seven years of craft — a new",
    readAfter: "form, a new name.",
    founder: {
      name: "German Guk",
      role: "Founder & CEO",
      alt: "German Guk — founder of MIROFORM",
      href: socialLinks.instagram,
      ariaLabel: "German Guk, Founder & CEO — Instagram MIROFORM @miro.form",
    },
    stats: [
      { label: "Projects delivered", value: 400, suffix: "+" },
      { label: "Years of experience", value: 7, suffix: "+" },
    ],
    fullCycle: {
      value: 100,
      suffix: "%",
      text: "Full-cycle approach: research, design, development, launch and support — together, from idea to results.",
      tagline: ["Make the right", "decision"],
    },
  },
};
