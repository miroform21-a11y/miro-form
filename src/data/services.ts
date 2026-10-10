import type { Locale } from "@/i18n/locale";

export type ServiceTheme = "light" | "dark" | "lime";

export type Service = {
  id: "web" | "design" | "ai";
  number: string;
  theme: ServiceTheme;
  tags: string[];
  /** Mobile tags differ from desktop in the Figma file */
  mobileTags: string[];
  title: string;
  /** Mobile title differs for the AI card in the Figma file */
  mobileTitle?: string;
  lists: [string[], string[]];
  /** Gap between the two desktop list columns (px, from Figma) */
  listGap: number;
  /** Gap between bullet and text in the second list column (Figma: 13–14px, first column is 12px) */
  bulletGap2: number;
  href: string;
};

export const services: Service[] = [
  {
    id: "web",
    number: "01",
    theme: "light",
    tags: ["від 7 днів", "під ключ", "SEO"],
    mobileTags: ["від 7 днів", "під ключ"],
    title: "Розробка сайтів",
    lists: [
      ["Landing Page", "Багатосторінкові сайти", "Інтернет-магазини"],
      ["Корпоративні сайти", "Розробка застосунків"],
    ],
    listGap: 106,
    bulletGap2: 13,
    href: "#pricing",
  },
  {
    id: "design",
    number: "02",
    theme: "dark",
    tags: ["UI/UX", "брендинг"],
    mobileTags: ["UI/UX", "брендинг"],
    title: "Цифровий дизайн",
    lists: [
      ["UI/UX дизайн", "Дизайн-концепції", "Редизайн проєктів"],
      ["Фірмовий стиль", "Айдентика"],
    ],
    listGap: 165,
    bulletGap2: 14,
    href: "#pricing",
  },
  {
    id: "ai",
    number: "03",
    theme: "lime",
    tags: ["AI", "інтеграції"],
    mobileTags: ["AI", "інтеграції"],
    title: "AI автоматизація",
    mobileTitle: "AI-РІШЕННЯ",
    lists: [
      ["AI-асистенти", "Telegram-боти", "Інтеграції та API"],
      ["CRM-автоматизація", "Індивідуальні"],
    ],
    listGap: 155,
    bulletGap2: 13,
    href: "#pricing",
  },
];

/** English copy on top of the same cards (themes, decor and gaps stay shared) */
const servicesEn: Service[] = [
  {
    ...services[0],
    tags: ["from 7 days", "turnkey", "SEO"],
    mobileTags: ["from 7 days", "turnkey"],
    title: "Web Development",
    lists: [
      ["Landing pages", "Multi-page websites", "Online stores"],
      ["Corporate websites", "App development"],
    ],
  },
  {
    ...services[1],
    tags: ["UI/UX", "branding"],
    mobileTags: ["UI/UX", "branding"],
    title: "Digital Design",
    lists: [
      ["UI/UX design", "Design concepts", "Project redesigns"],
      ["Brand style", "Brand identity"],
    ],
  },
  {
    ...services[2],
    tags: ["AI", "integrations"],
    mobileTags: ["AI", "integrations"],
    title: "AI Automation",
    mobileTitle: "AI SOLUTIONS",
    lists: [
      ["AI assistants", "Telegram bots", "Integrations & APIs"],
      ["CRM automation", "Custom solutions"],
    ],
  },
];

export const servicesByLocale: Record<Locale, Service[]> = { uk: services, en: servicesEn };
