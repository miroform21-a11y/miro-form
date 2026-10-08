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

export const budgets = ["до $500", "$500–1500", "$1500+", "Не знаю"] as const;
export type Budget = (typeof budgets)[number];
