import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/locale";

export type Review = {
  id: string;
  /** Desktop text; `lines` keeps Figma's explicit line breaks */
  text: string;
  lines?: [string, string];
  /** Mobile copy (differs for one review in Figma) */
  mobileText?: string;
  name: string;
  company: string;
  /** Client photo; reviews without a photo show a monogram in the site's style */
  avatar?: { src: string; style: CSSProperties };
  initials?: string;
};

/**
 * 8 reviews: the 4 from Figma + 4 additional ones.
 * The additional reviews (5–8) are placeholder copy — replace with real client reviews.
 */
export const reviews: Review[] = [
  {
    id: "oleksandr",
    text: "Сайт окупився за перший місяць реклами. Заявок стало вдвічі більше, а клієнти відзначають преміальний вигляд.",
    name: "Олександр К.",
    company: "Premium Car Rental",
    avatar: { src: "/images/reviews/author-1.jpg", style: { width: "100%", height: "145.37%", left: 0, top: "-3.44%" } },
  },
  {
    id: "maryna",
    text: "Хлопці відчули наш вайб із першого брифу. Бронювання кортів тепер іде через сайт — це зекономило купу часу.",
    lines: ["Хлопці відчули наш вайб із першого брифу. Бронювання кортів тепер іде", "через сайт — це зекономило купу часу."],
    name: "Марина Л.",
    company: "We Padel",
    avatar: { src: "/images/reviews/author-2.jpg", style: { width: "100%", height: "100%", objectFit: "cover" } },
  },
  {
    id: "anna",
    text: "Дуже уважні до деталей: кожна анімація, кожен екран. Запустили навіть швидше, ніж обіцяли.",
    name: "Анна Ш.",
    company: "Bloomly",
    avatar: { src: "/images/reviews/author-3.jpg", style: { width: "100%", height: "145.48%", left: 0, top: "-6.38%" } },
  },
  {
    id: "dmytro",
    text: "У результаті маємо не просто сайт, а злагоджену систему: CRM, Telegram-бот і аналітика — все працює чудово.",
    lines: ["У результаті маємо не просто сайт, а злагоджену систему: CRM, Telegram-бот", "і аналітика — все працює чудово."],
    mobileText: "Отримали не просто сайт, а систему: CRM, Telegram-бот і аналітика працюють як годинник.",
    name: "Дмитро П.",
    company: "Modern Homes",
    avatar: { src: "/images/reviews/author-4.jpg", style: { width: "100%", height: "100%", objectFit: "cover" } },
  },
  {
    id: "viktor",
    text: "Лендінг для інвестиційного проєкту зробили за два тижні. Подача серйозна й сучасна — інвестори одразу розуміють суть.",
    name: "Віктор С.",
    company: "Avalon Residence",
    initials: "ВС",
  },
  {
    id: "olena",
    text: "Запис на корти через сайт зріс у кілька разів. Зручна адмінка — розклад і ціни оновлюємо самі за хвилину.",
    name: "Олена Р.",
    company: "Padel Alicante",
    initials: "ОР",
  },
  {
    id: "iryna",
    text: "Переробили сайт онлайн-школи: швидкий, зрозумілий і нарешті продає. Конверсія в заявку виросла майже вдвічі.",
    name: "Ірина Т.",
    company: "Онлайн-школа SkillUp",
    initials: "ІТ",
  },
  {
    id: "maksym",
    text: "Telegram-бот приймає замовлення 24/7 і сам передає їх у CRM. Менеджери нарешті займаються продажами, а не рутиною.",
    name: "Максим Г.",
    company: "Coffee Point",
    initials: "МГ",
  },
];

/** Face-centred square crops of the Figma photos — they fill the circles completely */
export const ratingFaces = [
  "/images/avatars/client-1.jpg",
  "/images/avatars/client-2.jpg",
  "/images/avatars/client-3.jpg",
  "/images/avatars/client-5.jpg",
];

/** English text of the same reviews (photos and companies are shared); names are transliterated */
const reviewCopyEn: Record<string, Pick<Review, "text" | "name"> & Partial<Pick<Review, "mobileText" | "company" | "initials">>> = {
  oleksandr: {
    text: "The site paid for itself in the first month of ads. We get twice as many leads, and clients love the premium look.",
    name: "Oleksandr K.",
  },
  maryna: {
    text: "They got our vibe from the very first brief. Court bookings now go through the site — it saves us so much time.",
    name: "Maryna L.",
  },
  anna: { text: "Incredibly detail-oriented: every animation, every screen. They launched even faster than promised.", name: "Anna Sh." },
  dmytro: {
    text: "What we got is more than a website — it’s a well-oiled system: CRM, Telegram bot and analytics all work perfectly.",
    mobileText: "Not just a website but a system: CRM, Telegram bot and analytics run like clockwork.",
    name: "Dmytro P.",
  },
  viktor: {
    text: "They built the landing page for our investment project in two weeks. Serious and modern — investors get it instantly.",
    name: "Viktor S.",
    initials: "VS",
  },
  olena: {
    text: "Online court bookings grew several-fold. The admin is easy — we update schedules and prices ourselves in a minute.",
    name: "Olena R.",
    initials: "OR",
  },
  iryna: {
    text: "They rebuilt our online school’s website: fast, clear and finally selling. Lead conversion nearly doubled.",
    name: "Iryna T.",
    company: "SkillUp Online School",
    initials: "IT",
  },
  maksym: {
    text: "The Telegram bot takes orders 24/7 and passes them straight to the CRM. Our managers finally sell instead of doing busywork.",
    name: "Maksym H.",
    initials: "MH",
  },
};

export const reviewsByLocale: Record<Locale, Review[]> = {
  uk: reviews,
  // Figma's explicit line breaks belong to the Ukrainian copy — English wraps naturally
  en: reviews.map((r) => ({ ...r, lines: undefined, mobileText: undefined, ...reviewCopyEn[r.id] })),
};
