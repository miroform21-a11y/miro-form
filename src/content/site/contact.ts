import { socialLinks } from "@/data/navigation";
import type { Locale } from "@/i18n/locale";
import type { ContactContent } from "../types";

export const contactContent: Record<Locale, ContactContent> = {
  uk: {
    tag: "Контакти",
    eyebrow: "Make the right decision",
    title: ["Маєте ідею?", "Розкажіть", "нам про неї"],
    lead: "Відповімо протягом 15 хвилин та запропонуємо оптимальне рішення для вашого проєкту.",
    messengers: [
      { label: "Telegram", href: socialLinks.telegram },
      { label: "WhatsApp", href: socialLinks.whatsapp },
      { label: "Instagram", href: socialLinks.instagram },
    ],
  },
  en: {
    tag: "Contact",
    eyebrow: "Make the right decision",
    title: ["Got an idea?", "Tell us", "all about it"],
    lead: "We’ll reply within 15 minutes and suggest the best solution for your project.",
    // US audience: WhatsApp first, Telegram last
    messengers: [
      { label: "WhatsApp", href: socialLinks.whatsapp },
      { label: "Instagram", href: socialLinks.instagram },
      { label: "Telegram", href: socialLinks.telegram },
    ],
  },
};
