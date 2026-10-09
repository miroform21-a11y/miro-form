/**
 * The /brief questionnaire: 8 steps, their fields and when conditional fields appear.
 * One source of truth for the wizard UI (components/brief/BriefForm) and the server (/api/brief):
 * the server accepts only these keys/options and formats the Telegram message in this order.
 */

export type BriefLink = { url: string; note: string };
export type BriefValue = string | string[] | BriefLink[];
export type BriefAnswers = Record<string, BriefValue>;

/** Show a field only when another answer equals / includes one of `values`. */
export type ShowIf = { key: string; values: readonly string[] };

type Base = {
  key: string;
  label: string;
  hint?: string;
  /** Only name + contact are required; everything else is marked "необов’язково" */
  required?: boolean;
  showIf?: ShowIf;
};

export type BriefField =
  | (Base & { type: "text" | "textarea"; placeholder?: string; autoComplete?: string })
  | (Base & { type: "date" })
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
    hint: "Кілька слів про компанію, щоб ми розуміли контекст.",
    fields: [
      { key: "company", type: "text", label: "Назва компанії або бренду", autoComplete: "organization" },
      { key: "business", type: "text", label: "Сфера діяльності", placeholder: "Наприклад: стоматологія, онлайн-школа" },
      { key: "geography", type: "text", label: "Місто, область або країна", placeholder: "Де працюєте або на кого орієнтуєтесь" },
      {
        key: "site_contacts",
        type: "textarea",
        label: "Контакти для майбутнього сайту",
        hint: "Телефон, email, соцмережі, адреса — те, що побачать відвідувачі.",
      },
    ],
  },
  {
    id: "project",
    number: "02",
    title: "Деталі проєкту",
    hint: "Який сайт вам потрібен.",
    fields: [
      {
        key: "project_type",
        type: "choice",
        label: "Тип сайту",
        options: ["Односторінковий сайт", "Багатосторінковий сайт", "Інтернет-магазин", "Інше", "Ще не визначився — потрібна порада"],
      },
      { key: "project_type_other", type: "text", label: "Що саме потрібно?", showIf: { key: "project_type", values: ["Інше"] } },
      {
        key: "pages",
        type: "choice",
        label: "Скільки приблизно сторінок?",
        options: ["До 5", "6–10", "11–20", "Понад 20", "Не знаю"],
        showIf: { key: "project_type", values: ["Багатосторінковий сайт", "Інше"] },
      },
    ],
  },
  {
    id: "business",
    number: "03",
    title: "Бізнес і послуги",
    hint: "Що ви пропонуєте клієнтам.",
    fields: [
      { key: "services", type: "textarea", label: "Основні послуги або товари", hint: "Коротко, можна через кому." },
      { key: "advantage", type: "textarea", label: "Головні переваги вашої пропозиції", hint: "Чому клієнти обирають саме вас." },
      { key: "process", type: "text", label: "Як відбувається робота з клієнтом?", placeholder: "Наприклад: консультація → замовлення → доставка" },
      { key: "prices", type: "choice", label: "Показувати ціни на сайті?", options: yesNo },
      { key: "prices_details", type: "text", label: "Ціни або ціновий діапазон", showIf: { key: "prices", values: ["Так"] } },
      { key: "promo", type: "choice", label: "Будуть акції або спеціальні пропозиції?", options: yesNo },
      { key: "promo_details", type: "text", label: "Які саме?", showIf: { key: "promo", values: ["Так"] } },
      { key: "about", type: "textarea", label: "Коротко про компанію та досвід", hint: "Скільки років на ринку, чим пишаєтесь." },
    ],
  },
  {
    id: "goals",
    number: "04",
    title: "Цілі сайту",
    hint: "Навіщо сайт і що має зробити відвідувач.",
    fields: [
      {
        key: "goals",
        type: "multi",
        label: "Що ви хочете отримати від сайту?",
        options: ["Заявки", "Продажі", "Презентація компанії", "Демонстрація послуг або портфоліо", "Інше"],
      },
      { key: "goals_other", type: "text", label: "Що ще?", showIf: { key: "goals", values: ["Інше"] } },
      {
        key: "actions",
        type: "multi",
        label: "Яку дію має виконати відвідувач?",
        options: ["Залишити заявку", "Зателефонувати", "Оформити замовлення", "Інше"],
      },
      { key: "actions_other", type: "text", label: "Яку саме дію?", showIf: { key: "actions", values: ["Інше"] } },
    ],
  },
  {
    id: "features",
    number: "05",
    title: "Структура та функції",
    hint: "Що має вміти сайт — це визначає обсяг розробки.",
    fields: [
      {
        key: "features",
        type: "multi",
        label: "Що потрібно на сайті?",
        options: ["Форма заявки", "Каталог", "Фільтри", "Кошик", "Онлайн-оплата", "Кілька мов", "Блог", "Інше"],
      },
      { key: "languages", type: "text", label: "Які мови?", placeholder: "Наприклад: українська, англійська", showIf: { key: "features", values: ["Кілька мов"] } },
      { key: "features_other", type: "text", label: "Що ще потрібно?", showIf: { key: "features", values: ["Інше"] } },
    ],
  },
  {
    id: "style",
    number: "06",
    title: "Стиль і приклади",
    hint: "Який вигляд вам подобається. Сайти можуть бути з будь-якої сфери.",
    fields: [
      { key: "likes", type: "links", label: "Сайти, які подобаються", notePlaceholder: "Що саме подобається" },
      { key: "dislikes", type: "links", label: "Сайти, які не подобаються", notePlaceholder: "Що саме не подобається" },
      { key: "design_wishes", type: "textarea", label: "Побажання до дизайну", placeholder: "Кольори, настрій, стиль — наприклад: мінімалізм, темна тема" },
      {
        key: "materials",
        type: "multi",
        label: "Що вже є з матеріалів?",
        hint: "Самі файли можна буде передати окремо.",
        options: ["Логотип", "Фірмовий стиль", "Фотографії", "Тексти", "Відео", "Поки нічого немає"],
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
      { key: "deadline", type: "choice", label: "Бажаний термін запуску", options: ["Якнайшвидше", "Протягом місяця", "1–3 місяці", "До конкретної дати", "Не горить"] },
      { key: "deadline_date", type: "date", label: "Дата", showIf: { key: "deadline", values: ["До конкретної дати"] } },
      { key: "extra", type: "textarea", label: "Що нам ще варто знати про ваш проєкт?" },
    ],
  },
  {
    id: "contacts",
    number: "08",
    title: "Ваші контакти",
    hint: "Як з вами зв’язатися — і бриф готовий.",
    fields: [
      { key: "name", type: "text", label: "Ваше ім’я", required: true, autoComplete: "name", placeholder: "Як до вас звертатися" },
      { key: "contact", type: "contact", label: "Телефон або Telegram", required: true, placeholder: "+380 або @username" },
    ],
  },
];

export const MAX_LINKS = 3;

/** Whether a conditional field is currently shown (hidden answers are neither validated nor sent). */
export function isShown(field: BriefField, answers: BriefAnswers) {
  if (!field.showIf) return true;
  const value = answers[field.showIf.key];
  const picked = Array.isArray(value) ? (value as unknown[]).filter((v): v is string => typeof v === "string") : typeof value === "string" ? [value] : [];
  return field.showIf.values.some((v) => picked.includes(v));
}

/** True when the answer has some content (used for the step checkmarks and the Telegram message). */
export function hasAnswer(value: BriefValue | undefined) {
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return value.some((v) => (typeof v === "string" ? v.trim() : v.url.trim() || v.note.trim()));
}
