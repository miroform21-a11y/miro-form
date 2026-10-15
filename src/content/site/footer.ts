import { contacts, contactsEn, socialLinks } from "@/data/navigation";
import { routes, type Locale } from "@/i18n/locale";
import type { FooterContent } from "../types";

const socials: FooterContent["socials"] = [
  { label: "IG", name: "Instagram", href: socialLinks.instagram },
  { label: "TG", name: "Telegram", href: socialLinks.telegram },
  { label: "WA", name: "WhatsApp", href: socialLinks.whatsapp },
];

export const footerContent: Record<Locale, FooterContent> = {
  uk: {
    home: "MIROFORM — на головну",
    tagline: "Digital-студія, що поєднує дизайн, технології та результат.",
    cta: { label: "Обговорити проєкт", href: "#contact" },
    navLabel: "Навігація у футері",
    navTitle: "Навігація",
    nav: [
      { label: "Послуги", href: "#services" },
      { label: "Роботи", href: "#works" },
      { label: "Про нас", href: "#about" },
      { label: "Тарифи", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    servicesTitle: "Послуги",
    services: ["Landing Page", "Інтернет-магазини", "UI/UX дизайн", "AI-асистенти", "Telegram-боти"],
    servicesHref: "#services",
    contactsTitle: "Контакти",
    contacts: { ...contacts },
    socials,
    rights: "© 2026 MIROFORM®. Усі права захищені.",
    privacy: { label: "Політика конфіденційності", href: routes.uk.privacy },
  },
  en: {
    home: "MIROFORM — home",
    tagline: "A digital studio that brings together design, technology and results.",
    cta: { label: "Discuss your project", href: "#contact" },
    navLabel: "Footer navigation",
    navTitle: "Navigation",
    nav: [
      { label: "Services", href: "#services" },
      { label: "Projects", href: "#works" },
      { label: "About", href: "#about" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    servicesTitle: "Services",
    services: ["Landing pages", "Online stores", "UI/UX design", "AI assistants", "Telegram bots"],
    servicesHref: "#services",
    contactsTitle: "Contact",
    contacts: { ...contactsEn },
    socials: socials.map((s) => ({ ...s })),
    rights: "© 2026 MIROFORM®. All rights reserved.",
    privacy: { label: "Privacy Policy", href: routes.en.privacy },
  },
};
