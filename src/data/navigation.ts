import type { Locale } from "@/i18n/locale";

export const navLinks = [
  { label: "Послуги", href: "#services" },
  { label: "Роботи", href: "#works" },
  { label: "Про нас", href: "#about" },
  { label: "Процес", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакти", href: "#contact" },
] as const;

/** Company contacts: Telegram @MirooForm, Instagram @miro.form, WhatsApp +380730217721 */
export const socialLinks = {
  telegram: "https://t.me/MirooForm",
  whatsapp: "https://wa.me/380730217721",
  instagram: "https://www.instagram.com/miro.form/",
  privacy: "/privacy",
} as const;

/** Founder’s personal Instagram (@gukgerman) — the "German Guk / Founder & CEO" card */
export const founderInstagram = "https://www.instagram.com/gukgerman/";

export const contacts = {
  email: "hello@miroform.studio",
  phone: "+38 (073) 021 77 21",
  phoneHref: "tel:+380730217721",
  legalName: "ФОП Гук Герман Андрійович",
  legalId: "РНОКПП: 3548105017",
} as const;

const navLinksEn = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#works" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const navLinksByLocale: Record<Locale, readonly { label: string; href: string }[]> = { uk: navLinks, en: navLinksEn };

/** Legal details as shown on the English pages (same entity and tax number) */
export const contactsEn = {
  ...contacts,
  legalName: "Sole Proprietor German Guk",
  legalId: "Tax ID (RNOKPP): 3548105017",
} as const;
