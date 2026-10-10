import type { Locale } from "@/i18n/locale";

export type FaqItem = {
  question: string;
  /** Mobile question lines (Figma breaks some questions explicitly) */
  mobileLines?: [string, string];
  answer: string;
  /** Desktop answer lines with Figma's explicit break */
  answerLines?: [string, string];
};

/** Answers 2–6 come from the (hidden) answer layers in the Figma file. */
export const faq: FaqItem[] = [
  {
    question: "Скільки часу займає розробка проєкту?",
    answer:
      "Лендінг — від 7 днів. Багатосторінковий сайт — від 3 тижнів. AI-автоматизація — після аналізу задачі. Точні терміни фіксуємо в договорі.",
    answerLines: [
      "Лендінг — від 7 днів. Багатосторінковий сайт — від 3 тижнів.",
      "AI-автоматизація — після аналізу задачі. Точні терміни фіксуємо в договорі.",
    ],
  },
  {
    question: "Можна почати з нуля, без ТЗ і логотипу?",
    answer: "Так. Допоможемо визначити формат, структуру, стиль і необхідний функціонал — від брифу до готового рішення.",
  },
  {
    question: "Що входить у розробку?",
    mobileLines: ["Що входить", "у розробку?"],
    answer:
      "Від аналізу і структури до індивідуального дизайну, розробки й запуску. Адмінпанель, підключення форм і домену — повністю готовий проєкт під ключ.",
  },
  {
    question: "На чому ви розробляєте?",
    answer: "Figma, Webflow, Framer та кастомна розробка на Next.js з чистим кодом — обираємо стек під задачу.",
  },
  {
    question: "Дизайн входить у вартість?",
    mobileLines: ["Дизайн входить", "у вартість?"],
    answer: "Завжди. Спершу — сильний візуал, потім — технічна реалізація. У проєкт входять 3 повноцінні сети правок.",
  },
  {
    question: "Чи можлива інтеграція AI?",
    mobileLines: ["Чи можлива", "інтеграція AI?"],
    answer: "Так. Розробляємо AI-асистентів, Telegram-ботів та автоматизації під конкретні задачі бізнесу.",
  },
];

const faqEn: FaqItem[] = [
  {
    question: "How long does a project take?",
    answer:
      "Landing page — from 7 days. Multi-page website — from 3 weeks. AI automation — once we’ve analyzed the task. Exact timelines are set in the contract.",
    answerLines: [
      "Landing page — from 7 days. Multi-page website — from 3 weeks.",
      "AI automation — once we’ve analyzed the task. Exact timelines are set in the contract.",
    ],
  },
  {
    question: "Can we start from scratch, with no spec or logo?",
    answer: "Yes. We’ll help you define the format, structure, style and features you need — from the brief to the finished product.",
  },
  {
    question: "What’s included in development?",
    mobileLines: ["What’s included", "in development?"],
    answer:
      "Everything from research and structure to custom design, development and launch. Admin panel, forms and domain setup — a fully turnkey project.",
  },
  {
    question: "What do you build with?",
    answer: "Figma, Webflow, Framer and custom development on Next.js with clean code — we choose the stack to fit the task.",
  },
  {
    question: "Is design included in the price?",
    mobileLines: ["Is design included", "in the price?"],
    answer: "Always. Strong visuals first, then the technical build. Every project includes 3 full rounds of revisions.",
  },
  {
    question: "Can you integrate AI?",
    answer: "Yes. We build AI assistants, Telegram bots and automations for specific business tasks.",
  },
];

export const faqByLocale: Record<Locale, FaqItem[]> = { uk: faq, en: faqEn };
