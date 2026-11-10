import type { Locale } from "@/i18n/locale";

/** Service directions for the popup forms: the card decides the direction, the user picks the concrete service. */
export const directions = [
  {
    id: "web",
    popupTitle: "Розробка сайтів",
    options: ["Лендінг пейдж", "Багатосторінковий сайт", "Інтернет-магазин", "Корпоративний сайт"],
  },
  {
    id: "design",
    popupTitle: "Цифровий дизайн",
    options: ["UX-дизайн", "Дизайн-концепції", "Редизайн проєкту", "Фірмовий стиль", "Айдентика"],
  },
  {
    id: "ai",
    popupTitle: "AI рішення",
    // same items as the AI service card
    options: ["AI-асистенти", "Telegram-боти", "Інтеграції та API", "CRM-автоматизація", "Індивідуальні"],
  },
] as const;

export type DirectionId = (typeof directions)[number]["id"];

/** What a card preselects in the popup; the user can still change the service. */
export type LeadPreset = {
  direction: DirectionId;
  option?: string;
  /** Popup title, defaults to the direction title (pricing cards use the plan name) */
  title?: string;
};

export const directionById = (id: DirectionId) => directions.find((d) => d.id === id)!;

/** Contacts section form (unchanged from the Figma version): project type + budget */
export const projectTypes = ["Лендінг", "Багатосторінковий сайт", "Інтернет-магазин", "Дизайн", "AI-рішення"] as const;
export type ProjectType = (typeof projectTypes)[number];

export const budgets = ["до $800", "$800–1600", "$1600–4000", "$4000+", "Не знаю"] as const;
export type Budget = (typeof budgets)[number];

/**
 * English popup directions and Contacts chips. Same ids and structure; the server accepts these values
 * only from the English forms (lang "en").
 */
export const directionsEn = [
  { id: "web", popupTitle: "Web Development", options: ["Landing page", "Multi-page website", "Online store", "Corporate website"] },
  { id: "design", popupTitle: "Digital Design", options: ["UX design", "Design concepts", "Project redesign", "Brand style", "Brand identity"] },
  { id: "ai", popupTitle: "AI Solutions", options: ["AI assistants", "Telegram bots", "Integrations & APIs", "CRM automation", "Custom solutions"] },
] as const satisfies readonly { id: DirectionId; popupTitle: string; options: readonly string[] }[];

export const projectTypesEn = ["Landing page", "Multi-page website", "Online store", "Design", "AI solution"] as const;

/** The same budget ranges as the Ukrainian ones */
export const budgetsEn = ["Up to $800", "$800–1600", "$1600–4000", "$4000+", "Not sure"] as const;

type Direction = { id: DirectionId; popupTitle: string; options: readonly string[] };

/** Everything the lead forms need, per language */
export const leadOptions: Record<Locale, { directions: readonly Direction[]; projectTypes: readonly string[]; budgets: readonly string[]; defaultBudget: string }> = {
  uk: { directions, projectTypes, budgets, defaultBudget: "$800–1600" },
  en: { directions: directionsEn, projectTypes: projectTypesEn, budgets: budgetsEn, defaultBudget: "$800–1600" },
};

export const directionByIdFor = (locale: Locale, id: DirectionId) => leadOptions[locale].directions.find((d) => d.id === id)!;
