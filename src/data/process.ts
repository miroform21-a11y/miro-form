import type { Locale } from "@/i18n/locale";

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

const stepsEn: Step[] = [
  {
    number: "01",
    title: ["Brief", "& research"],
    description: "We discuss your goals and analyze the niche, competitors and target audience of your project.",
    duration: "1–2 days",
  },
  {
    number: "02",
    title: ["Prototype", " & design"],
    description: "We map out the page structure and create a unique look, with responsive layouts and animations.",
    duration: "3–7 days",
  },
  {
    number: "03",
    title: ["Development", " & integrations"],
    description: "We build the site and connect forms, analytics, CRM and AI integrations.",
    duration: "2–5 days",
  },
  {
    number: "04",
    title: ["Launch", "& support"],
    description: "We test, go live on your domain and support you after launch.",
    descriptionLines: ["We test, go live on your domain", "and support you after launch."],
    duration: "1 day",
  },
];

export const stepsByLocale: Record<Locale, Step[]> = { uk: steps, en: stepsEn };
