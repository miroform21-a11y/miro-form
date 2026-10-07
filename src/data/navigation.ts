export const navLinks = [
  { label: "Послуги", href: "#services" },
  { label: "Роботи", href: "#works" },
  { label: "Про нас", href: "#about" },
  { label: "Процес", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакти", href: "#contact" },
] as const;

/** Placeholder links — real URLs will be provided later. */
export const socialLinks = {
  telegram: "#",
  whatsapp: "#",
  instagram: "#",
  privacy: "/privacy",
} as const;

export const contacts = {
  email: "hello@miroform.studio",
  phone: "+38 (073) 021 77 21",
  phoneHref: "tel:+380730217721",
  legalName: "ФОП Гук Герман Андрійович",
  legalId: "РНОКПП: 3548105017",
} as const;
