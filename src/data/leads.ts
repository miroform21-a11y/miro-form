/** Directions and sub-directions offered in every lead form (contacts section + popups). */
export const directions = [
  {
    id: "web",
    label: "Розробка сайтів",
    options: ["Лендінг пейдж", "Багатосторінковий сайт", "Інтернет-магазин", "Корпоративний сайт", "Розробка застосунків"],
  },
  {
    id: "design",
    label: "Цифровий дизайн",
    options: ["UX-дизайн", "Дизайн-концепції", "Редизайн проєкту", "Фірмовий стиль", "Айдентика"],
  },
  {
    id: "ai",
    label: "AI автоматизація",
    // same items as the AI service card
    options: ["AI-асистенти", "Telegram-боти", "Інтеграції та API", "CRM-автоматизація", "Індивідуальні"],
  },
] as const;

export type DirectionId = (typeof directions)[number]["id"];

/** What a card preselects in the form; the user can change both afterwards. */
export type LeadPreset = { direction: DirectionId; option?: string };

export const directionById = (id: DirectionId) => directions.find((d) => d.id === id)!;

export const budgets = ["до $500", "$500–1500", "$1500+", "Не знаю"] as const;
export type Budget = (typeof budgets)[number];
