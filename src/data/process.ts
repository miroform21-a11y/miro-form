export type Step = {
  number: string;
  /** Title is split into two lines exactly as in Figma (leading spaces are intentional, as in the layout) */
  title: [string, string];
  description: string;
  /** Optional explicit line break inside the description (Figma step 04) */
  descriptionLines?: [string, string];
  duration: string;
};

export const steps: Step[] = [
  {
    number: "01",
    title: ["Бриф", "і аналітика"],
    description: "Обговорюємо задачі, аналізуємо нішу, конкурентів і цільову аудиторію Вашого проекту.",
    duration: "1–2 дні",
  },
  {
    number: "02",
    title: ["Прототип", " та дизайн"],
    description: "Будуємо структуру сторінок і створюємо унікальний візуал з адаптивами та анімаціями.",
    duration: "3–7 днів",
  },
  {
    number: "03",
    title: ["Розробка", " та інтеграції"],
    description: "Верстаємо, підключаємо форми, аналітику, CRM та AI-інтеграції.",
    duration: "2–5 днів",
  },
  {
    number: "04",
    title: ["Запуск", "та підтримка"],
    description: "Тестуємо, публікуємо на домені та супроводжуємо після старту.",
    descriptionLines: ["Тестуємо, публікуємо на домені", "та супроводжуємо після старту."],
    duration: "1 день",
  },
];
