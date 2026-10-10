import type { Locale } from "@/i18n/locale";

/** /brief and /en/brief: everything around the wizard (top bar, intro, privacy note) */
export const briefPageContent = {
  uk: {
    home: "MIROFORM — на головну",
    back: "На головну",
    title: "Бриф",
    intro: "Бриф допоможе нам зрозуміти ваш проєкт: за відповідями ми продумаємо структуру, дизайн і функціонал майбутнього сайту.",
    help: "Якщо якесь питання здається складним, пропустіть його або напишіть нам — ми підкажемо.",
    privacy: "Ми гарантуємо повну конфіденційність інформації про вас і вашу діяльність.",
  },
  en: {
    home: "MIROFORM — home",
    back: "Back to home",
    title: "Brief",
    intro: "This brief helps us understand your project: based on your answers, we’ll plan the structure, design and features of your future website.",
    help: "If a question seems difficult, skip it or message us — we’re happy to help.",
    privacy: "We guarantee full confidentiality of all information about you and your business.",
  },
} satisfies Record<Locale, Record<string, string>>;

export type BriefPageContent = (typeof briefPageContent)["uk"];
