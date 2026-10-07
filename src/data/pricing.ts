export const projectTypes = ["Лендінг", "Багатосторінковий сайт", "Інтернет-магазин", "Дизайн", "AI-рішення"] as const;
export type ProjectType = (typeof projectTypes)[number];

export const budgets = ["до $500", "$500–1500", "$1500+", "Не знаю"] as const;
export type Budget = (typeof budgets)[number];

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
  projectType: ProjectType;
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
    price: "$490",
    projectType: "Лендінг",
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
    price: "$1 490",
    projectType: "Багатосторінковий сайт",
  },
];

export const customPlan = {
  badge: "Індивідуально",
  title: "AI & Custom",
  description: "AI-асистенти, Telegram-боти, автоматизація процесів та інтеграції під ваш бізнес.",
  projectType: "AI-рішення" as ProjectType,
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
