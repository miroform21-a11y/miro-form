import type { Locale } from "@/i18n/locale";
import type { LeadPreset } from "./leads";

export type Plan = {
  id: "landing" | "multi";
  /** Desktop tags order / mobile rows (from Figma) */
  tags: string[];
  mobileTagRows: string[][];
  title: [string, string?];
  description: string;
  /** Mobile copy has an explicit line break before the last sentence */
  mobileDescription?: [string, string];
  price: string;
  /** Preselected in the lead popup */
  lead: LeadPreset;
};

export const plans: Plan[] = [
  {
    id: "landing",
    tags: ["проєкт під ключ", "Адаптив", "SEO", "CMS"],
    mobileTagRows: [
      ["проєкт під ключ", "CMS"],
      ["Адаптив", "SEO"],
    ],
    title: ["Landing Page"],
    description:
      "Односторінковий сайт для продукту, послуги чи рекламної кампанії. До 10 продуманих блоків, індивідуальний дизайн. Запуск — від 7 днів.",
    price: "$390",
    lead: { direction: "web", option: "Лендінг пейдж", title: "Landing Page" },
  },
  {
    id: "multi",
    tags: ["До 10 сторінок", "CMS", "CRM", "проєкт під ключ", "Адаптив"],
    mobileTagRows: [["До 10 сторінок", "CMS"], ["проєкт під ключ", "CRM"], ["Адаптив"]],
    title: ["Багато", "сторінковий сайт"],
    description:
      "Багатосторінковий сайт або інтернет-магазин для компанії чи бренду. Адмінпанель, анімації та CRM. Термін — від 3 тижнів.",
    mobileDescription: [
      "Багатосторінковий сайт або інтернет-магазин для компанії чи бренду. Адмінпанель, анімації та CRM.",
      "Термін — від 3 тижнів.",
    ],
    price: "$1 290",
    lead: { direction: "web", option: "Багатосторінковий сайт", title: "Багатосторінковий сайт" },
  },
];

export const customPlan = {
  badge: "Індивідуально",
  title: "AI & Custom",
  description: "AI-асистенти, Telegram-боти, автоматизація процесів та інтеграції під ваш бізнес.",
  lead: { direction: "ai", title: "AI & Custom" } as LeadPreset,
};

export const discounts: { value: string; title: string; lines: [string, string]; wrapOnDesktop?: boolean }[] = [
  {
    value: "-10%",
    title: "Повна передоплата",
    lines: ["Оплачуєте проєкт одразу —", "фіксуємо знижку на весь обсяг робіт."],
  },
  {
    value: "-15%",
    title: "Повторне звернення",
    lines: ["Для клієнтів, які повертаються", "з новим проєктом протягом 30 днів."],
    /** Desktop copy wraps naturally at 250px in Figma */
    wrapOnDesktop: true,
  },
];

/* ---------------- English version ---------------- */

/**
 * US prices are set separately from the Ukrainian ones and are not filled in yet.
 * An empty `price` shows "Custom quote" in the price slot; enter e.g. "$1,500" to show "From $1,500".
 */
const plansEn: Plan[] = [
  {
    id: "landing",
    tags: ["turnkey project", "Responsive", "SEO", "CMS"],
    mobileTagRows: [
      ["turnkey project", "CMS"],
      ["Responsive", "SEO"],
    ],
    title: ["Landing Page"],
    description: "A one-page site for a product, service or ad campaign. Up to 10 well-crafted sections and a custom design. Launch in as little as 7 days.",
    price: "", // US price — to be provided
    lead: { direction: "web", option: "Landing page", title: "Landing Page" },
  },
  {
    id: "multi",
    tags: ["Up to 10 pages", "CMS", "CRM", "turnkey project", "Responsive"],
    mobileTagRows: [["Up to 10 pages", "CMS"], ["turnkey project", "CRM"], ["Responsive"]],
    title: ["Multi-page", " website"],
    description: "A multi-page website or online store for a company or brand. Admin panel, animations and CRM. Timeline: from 3 weeks.",
    mobileDescription: ["A multi-page website or online store for a company or brand. Admin panel, animations and CRM.", "Timeline: from 3 weeks."],
    price: "", // US price — to be provided
    lead: { direction: "web", option: "Multi-page website", title: "Multi-page website" },
  },
];

const customPlanEn: typeof customPlan = {
  badge: "Custom",
  title: "AI & Custom",
  description: "AI assistants, Telegram bots, process automation and integrations tailored to your business.",
  lead: { direction: "ai", title: "AI & Custom" },
};

const discountsEn: typeof discounts = [
  {
    value: "-10%",
    title: "Full prepayment",
    lines: ["Pay for the project upfront —", "and lock in a discount on all the work."],
  },
  {
    value: "-15%",
    title: "Returning clients",
    lines: ["For clients who come back", "with a new project within 30 days."],
    wrapOnDesktop: true,
  },
];

export const pricingByLocale: Record<Locale, { plans: Plan[]; customPlan: typeof customPlan; discounts: typeof discounts }> = {
  uk: { plans, customPlan, discounts },
  en: { plans: plansEn, customPlan: customPlanEn, discounts: discountsEn },
};
