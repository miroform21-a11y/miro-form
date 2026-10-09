/**
 * The /brief questionnaire: 8 steps, their fields and when conditional fields appear.
 * One source of truth for the wizard UI (components/brief/BriefForm) and the server (/api/brief):
 * the server accepts only these keys/options and formats the Telegram message in this order.
 * Every field is optional — a client can skip any question; only the contact format is checked when filled in.
 */

import { contactError } from "@/lib/contact";

export type BriefLink = { url: string; note: string };
export type BriefValue = string | string[] | BriefLink[];
export type BriefAnswers = Record<string, BriefValue>;

/** Show a field only when another answer equals / includes one of `values`. */
export type ShowIf = { key: string; values: readonly string[] };

type Base = {
  key: string;
  label: string;
  hint?: string;
  showIf?: ShowIf;
};

export type BriefField =
  | (Base & { type: "text" | "textarea"; placeholder?: string; autoComplete?: string })
  | (Base & { type: "choice" | "multi"; options: readonly string[] })
  | (Base & { type: "links"; notePlaceholder: string })
  | (Base & { type: "contact"; placeholder?: string });

export type BriefStep = { id: string; number: string; title: string; hint: string; fields: BriefField[] };

const yesNo = ["Так", "Ні"] as const;

export const briefSteps: BriefStep[] = [
  {
    id: "general",
    number: "01",
    title: "Загальна інформація",
    hint: "Кілька слів про компанію та контакти для сайту.",
    fields: [
      { key: "company", type: "text", label: "Повна назва компанії", autoComplete: "organization" },
      {
        key: "site_contacts",
        type: "textarea",
        label: "Контактна інформація для майбутнього сайту",
        hint: "Телефон, email, соцмережі або інші контакти компанії, які потрібно розмістити на сайті.",
      },
      {
        key: "form_fields",
        type: "text",
        label: "Які дані має залишити клієнт у формі на сайті?",
        hint: "Наприклад, ім’я, телефон, email або додаткова інформація. Перерахуйте через кому.",
      },
    ],
  },
  {
    id: "project",
    number: "02",
    title: "Деталі проєкту",
    hint: "Оберіть формат майбутнього сайту.",
    fields: [
      {
        key: "project_type",
        type: "choice",
        label: "Який сайт вам потрібен?",
        options: ["Односторінковий сайт (лендінг)", "Багатосторінковий сайт", "Інтернет-магазин", "Поки не знаю, потрібна консультація", "Інше"],
      },
      { key: "project_type_other", type: "text", label: "Що саме потрібно?", showIf: { key: "project_type", values: ["Інше"] } },
      {
        key: "pages",
        type: "choice",
        label: "Орієнтовна кількість сторінок",
        options: ["До 5", "6–10", "11–20", "Понад 20", "Не знаю"],
        showIf: { key: "project_type", values: ["Багатосторінковий сайт", "Інше"] },
      },
    ],
  },
  {
    id: "business",
    number: "03",
    title: "Послуги та бізнес",
    hint: "Що ви пропонуєте і як працюєте з клієнтами.",
    fields: [
      { key: "services", type: "textarea", label: "Які послуги або товари ви пропонуєте?", hint: "Перерахуйте основні послуги або товари через кому." },
      {
        key: "business",
        type: "textarea",
        label: "Опишіть напрямок вашого бізнесу",
        hint: "Коротко розкажіть, чим займається ваша компанія, скільки років на ринку та в чому ваш досвід.",
      },
      { key: "geography", type: "text", label: "Географія роботи", placeholder: "Місто, область або країна" },
      { key: "prices", type: "choice", label: "Чи потрібно вказувати ціни на сайті?", options: ["Так", "Ні", "Лише для деяких послуг або товарів"] },
      { key: "advantage", type: "textarea", label: "Ваші основні переваги" },
      { key: "process", type: "text", label: "Як зазвичай відбувається замовлення або надання послуги?", placeholder: "Наприклад: заявка → консультація → оплата" },
      { key: "promo", type: "choice", label: "Чи є акції або спеціальні пропозиції?", options: yesNo },
      { key: "promo_details", type: "textarea", label: "Опишіть акції або пропозиції", showIf: { key: "promo", values: ["Так"] } },
      { key: "payment", type: "text", label: "Як клієнти можуть оплачувати товари або послуги?", hint: "Наприклад, готівкою, безготівково або онлайн." },
    ],
  },
  {
    id: "goals",
    number: "04",
    title: "Цілі та функції сайту",
    hint: "Навіщо потрібен сайт і що він має вміти.",
    fields: [
      {
        key: "goals",
        type: "multi",
        label: "Яка головна мета сайту?",
        options: ["Отримувати заявки від клієнтів", "Продавати товари або послуги", "Презентувати компанію та її послуги", "Показувати портфоліо або виконані роботи", "Інше"],
      },
      { key: "goals_other", type: "text", label: "Уточніть мету", showIf: { key: "goals", values: ["Інше"] } },
      {
        key: "features",
        type: "multi",
        label: "Які функції потрібні на сайті?",
        options: ["Форма заявки", "Каталог товарів або послуг", "Фільтри", "Кошик", "Онлайн-оплата", "Кілька мов", "Блог або новини", "Інше"],
      },
      { key: "languages", type: "text", label: "Які мови?", placeholder: "Наприклад: українська, англійська", showIf: { key: "features", values: ["Кілька мов"] } },
      { key: "features_other", type: "text", label: "Які ще функції потрібні?", showIf: { key: "features", values: ["Інше"] } },
      { key: "support", type: "choice", label: "Чи потрібна підтримка сайту після запуску?", options: ["Так", "Ні", "Потрібна консультація"] },
    ],
  },
  {
    id: "style",
    number: "05",
    title: "Стиль і приклади",
    hint: "Який вигляд вам подобається, а який — ні.",
    fields: [
      {
        key: "likes",
        type: "links",
        label: "Сайти, які вам подобаються",
        hint: "Сайти з будь-якої сфери, дизайн або окремі елементи яких вам подобаються.",
        notePlaceholder: "Що саме подобається",
      },
      {
        key: "dislikes",
        type: "links",
        label: "Сайти, які вам не подобаються",
        hint: "Сайти з будь-якої сфери, дизайн або рішення яких вам не підходять.",
        notePlaceholder: "Що саме не підходить",
      },
      { key: "design_wishes", type: "textarea", label: "Побажання щодо дизайну", placeholder: "Кольори, настрій, стиль — наприклад: мінімалізм, темна тема" },
    ],
  },
  {
    id: "materials",
    number: "06",
    title: "Матеріали та побажання",
    hint: "Що вже готово для сайту. Самі файли можна буде надіслати окремо.",
    fields: [
      {
        key: "materials",
        type: "multi",
        label: "Що у вас уже є для сайту?",
        options: ["Логотип", "Фотографії, відео або зображення", "Готові тексти", "Інші матеріали", "Поки нічого немає"],
      },
      {
        key: "materials_wishes",
        type: "textarea",
        label: "Побажання щодо матеріалів",
        hint: "Наприклад: з чим потрібна допомога — тексти, фото, логотип — або які матеріали ще будуть.",
      },
    ],
  },
  {
    id: "budget",
    number: "07",
    title: "Бюджет і терміни",
    hint: "Орієнтири, щоб запропонувати реалістичне рішення.",
    fields: [
      {
        key: "budget",
        type: "choice",
        label: "Орієнтовний бюджет",
        options: ["До $500", "$500–1 500", "$1 500–3 000", "$3 000–5 000", "Понад $5 000", "Потрібна консультація"],
      },
      { key: "deadline", type: "choice", label: "Бажаний термін запуску", options: ["До 7 днів", "До 14 днів", "Протягом місяця", "1–3 місяці", "До конкретної дати"] },
      {
        key: "deadline_date",
        type: "text",
        label: "Дата або уточнення",
        placeholder: "Наприклад: до 1 грудня або до відкриття магазину",
        showIf: { key: "deadline", values: ["До конкретної дати"] },
      },
      { key: "extra", type: "textarea", label: "Що нам ще варто знати про ваш проєкт?" },
    ],
  },
  {
    id: "contacts",
    number: "08",
    title: "Ваші контакти",
    hint: "Як з вами зв’язатися щодо брифу.",
    fields: [
      { key: "name", type: "text", label: "Ваше ім’я", autoComplete: "name", placeholder: "Як до вас звертатися" },
      { key: "contact", type: "contact", label: "Телефон або Telegram", placeholder: "+380 або @username" },
    ],
  },
];

/** Link rows shown by default and the most a client can add */
export const DEFAULT_LINKS = 2;
export const MAX_LINKS = 6;

/** Whether a conditional field is currently shown (hidden answers are neither validated nor sent). */
export function isShown(field: BriefField, answers: BriefAnswers) {
  if (!field.showIf) return true;
  const value = answers[field.showIf.key];
  const picked = Array.isArray(value) ? (value as unknown[]).filter((v): v is string => typeof v === "string") : typeof value === "string" ? [value] : [];
  return field.showIf.values.some((v) => picked.includes(v));
}

/** True when the answer has some content (step checkmarks, what is sent to Telegram). */
export function hasAnswer(value: BriefValue | undefined) {
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return value.some((v) => (typeof v === "string" ? v.trim() : v.url.trim() || v.note.trim()));
}

/**
 * Every field is optional; the only check is the contact format when it is filled in
 * (same rule as the main site forms). Shared by the wizard and /api/brief.
 */
export function contactFieldError(answers: BriefAnswers): string | undefined {
  const contact = answers.contact;
  return typeof contact === "string" && contact.trim() ? contactError(contact) : undefined;
}
