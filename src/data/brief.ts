/**
 * The /brief questionnaire: 8 steps, their fields, defaults and when conditional fields appear.
 * One source of truth for the wizard UI (components/brief/BriefForm) and the server (/api/brief):
 * the server accepts only these keys/options, applies the same required-field rules
 * and formats the Telegram message in this order.
 */

import { contactError } from "@/lib/contact";
import { socialLinks } from "@/data/navigation";
import type { Locale } from "@/i18n/locale";

/** Networks offered in the "+ Додати соціальну мережу" menu; "Інше" asks for a name as well */
export const SOCIAL_NETWORKS = ["Instagram", "Telegram", "YouTube", "Viber", "WhatsApp", "TikTok", "Інше"] as const;
export const OTHER_NETWORK = "Інше";

export type BriefLink = { url: string; note: string };
/** `network` — one of SOCIAL_NETWORKS; `name` is used only for "Інше" */
export type BriefSocial = { network: string; name: string; url: string };
export type BriefSiteContacts = { phone: string; email: string; socials: BriefSocial[] };
export type BriefValue = string | string[] | BriefLink[] | BriefSiteContacts;
export type BriefAnswers = Record<string, BriefValue>;

/** Show a field only when another answer equals / includes one of `values`. */
export type ShowIf = { key: string; values: readonly string[] };

type Base = {
  key: string;
  label: string;
  hint?: string;
  /**
   * Marked with *. A visual hint everywhere; it blocks sending only on a step with `blocking`
   * (the final "Ваші контакти"), never moving between steps.
   */
  required?: boolean;
  showIf?: ShowIf;
};

export type BriefField =
  | (Base & {
      type: "text" | "textarea";
      placeholder?: string;
      autoComplete?: string;
      /** A one-click alternative that counts as an answer ("Поки не маю побажань…"), stored under `${key}_skip` */
      skip?: string;
    })
  | (Base & { type: "choice"; options: readonly string[]; default?: string })
  | (Base & {
      type: "multi";
      options: readonly string[];
      default?: readonly string[];
      /** Can't be combined with the other options, except those listed in `independent` */
      exclusive?: string;
      independent?: readonly string[];
    })
  | (Base & { type: "links"; notePlaceholder: string })
  | (Base & { type: "siteContacts" })
  | (Base & { type: "contact"; placeholder?: string });

/** A visual note inside a step (the paperclip "send materials to Telegram" plate); `href` makes it a link */
export type BriefNotice = {
  icon: "paperclip" | "card";
  text: string;
  href?: string;
  /** Colour on phones (below md); lime from md up */
  mobileTone?: "blue";
  /** What the link opens, for screen readers (defaults to "Telegram MIROFORM") */
  linkLabel?: string;
};

export type BriefStep = {
  id: string;
  number: string;
  title: string;
  hint: string;
  fields: BriefField[];
  notice?: BriefNotice;
  /** More plates under `notice` (the English brief: "send materials via WhatsApp") */
  extraNotices?: BriefNotice[];
  /** Its required fields must be filled in before the brief is sent */
  blocking?: boolean;
};

const yesNo = ["Так", "Ні"] as const;
export const NOTHING_YET = "Поки нічого немає";
export const TURNKEY = "Хочу проєкт під ключ";

export const briefSteps: BriefStep[] = [
  {
    id: "general",
    number: "01",
    title: "Загальна інформація",
    hint: "Кілька слів про компанію та контакти для сайту.",
    fields: [
      { key: "company", type: "text", label: "Повна назва компанії", required: true, autoComplete: "organization" },
      {
        key: "site_contacts",
        type: "siteContacts",
        label: "Контактна інформація для майбутнього сайту",
        required: true,
      },
      {
        key: "form_fields",
        type: "text",
        label: "Які дані має залишити клієнт у формі на сайті?",
        required: true,
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
        required: true,
        options: ["Односторінковий сайт (лендінг)", "Багатосторінковий сайт", "Інтернет-магазин", "Інше", "Поки не знаю, потрібна консультація"],
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
    title: "Детальніше про проєкт",
    hint: "Що ви пропонуєте і як працюєте з клієнтами.",
    fields: [
      {
        key: "services",
        type: "textarea",
        label: "Види послуг або продуктів, які ви надаєте",
        required: true,
        hint: "Перерахуйте основні послуги або товари через кому",
      },
      {
        key: "business",
        type: "textarea",
        label: "Опишіть напрямок вашого бізнесу",
        hint: "Чим займається ваша компанія, скільки років на ринку та в чому ваш досвід",
      },
      {
        key: "geography",
        type: "text",
        label: "Географія вашої діяльності",
        hint: "У якому місті, області або країні ви надаєте послуги чи продаєте товари?",
        required: true,
        placeholder: "Наприклад: Київ або вся Україна",
      },
      { key: "prices", type: "choice", label: "Чи потрібно вказувати ціни на сайті?", options: ["Так", "Ні", "Лише для деяких послуг або товарів"], default: "Ні" },
      {
        key: "prices_details",
        type: "textarea",
        label: "Які саме ціни потрібно вказати на сайті?",
        hint: "Перерахуйте послуги або товари та, якщо відомо, їхні ціни. Наприклад: консультація — 1000 грн, послуга А — від 2000 грн.",
        showIf: { key: "prices", values: ["Так", "Лише для деяких послуг або товарів"] },
      },
      { key: "advantage", type: "textarea", label: "Ваші основні переваги" },
      {
        key: "process",
        type: "text",
        label: "Як зазвичай відбувається замовлення або надання послуги?",
        required: true,
        hint: "Наприклад, заявка, консультація, узгодження деталей, оплата.",
      },
      { key: "promo", type: "choice", label: "Чи є акції або спеціальні пропозиції?", options: yesNo, default: "Ні" },
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
        required: true,
        options: ["Отримувати заявки від клієнтів", "Продавати товари або послуги", "Презентувати компанію та її послуги", "Показувати портфоліо або виконані роботи", "Інше"],
        default: ["Отримувати заявки від клієнтів"],
      },
      { key: "goals_other", type: "text", label: "Уточніть мету", showIf: { key: "goals", values: ["Інше"] } },
      {
        key: "features",
        type: "multi",
        label: "Які функції потрібні на сайті?",
        options: ["Кілька мов", "Форма заявки", "Блог або новини", "Квіз", "Каталог товарів або послуг", "Онлайн-оплата", "Фотогалерея", "Інше"],
      },
      { key: "languages", type: "text", label: "Які мови?", placeholder: "Наприклад: українська, англійська", showIf: { key: "features", values: ["Кілька мов"] } },
      { key: "features_other", type: "text", label: "Які ще функції потрібні?", showIf: { key: "features", values: ["Інше"] } },
      { key: "support", type: "choice", label: "Чи потрібна підтримка сайту після запуску?", options: ["Так", "Ні", "Потрібна консультація"], default: "Потрібна консультація" },
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
      {
        key: "design_wishes",
        type: "textarea",
        label: "Побажання щодо дизайну",
        required: true,
        placeholder: "Кольори, настрій, стиль — наприклад: мінімалізм, темна тема",
        skip: "Поки не маю побажань — запропонуйте свій варіант",
      },
    ],
  },
  {
    id: "materials",
    number: "06",
    title: "Матеріали та побажання",
    hint: "Що вже готово для сайту.",
    notice: { icon: "paperclip", text: "Матеріали можна буде надіслати окремо в наш Telegram після заповнення брифу.", href: socialLinks.telegram },
    fields: [
      {
        key: "materials",
        type: "multi",
        label: "Що у вас уже є для сайту?",
        required: true,
        options: ["Логотип", "Фотографії, відео або зображення", "Готові тексти", "Інші матеріали", NOTHING_YET, TURNKEY],
        // "nothing yet" excludes real materials; "turnkey" goes with anything
        exclusive: NOTHING_YET,
        independent: [TURNKEY],
      },
      { key: "materials_other", type: "text", label: "Які саме матеріали у вас є?", showIf: { key: "materials", values: ["Інші матеріали"] } },
      {
        key: "materials_wishes",
        type: "textarea",
        label: "Побажання щодо матеріалів",
        hint: "Наприклад, які тексти, фотографії або логотипи потрібно підготувати, яких матеріалів ще бракує.",
      },
    ],
  },
  {
    id: "budget",
    number: "07",
    title: "Бюджет і терміни",
    hint: "Орієнтири, щоб запропонувати реалістичне рішення.",
    // lime on desktop, blue (the colour of the background render) on phones
    notice: { icon: "card", text: "У MIROFORM є гнучка оплата частинами до 12 місяців. Деталі на консультації.", mobileTone: "blue" },
    fields: [
      {
        key: "budget",
        type: "choice",
        label: "Орієнтовний бюджет проєкту",
        required: true,
        options: ["$500–1 500", "$1 500–3 000", "$3 000–5 000", "Оплата частинами", "Потрібна консультація"],
        default: "$500–1 500",
      },
      {
        key: "deadline",
        type: "choice",
        label: "Бажаний термін запуску",
        required: true,
        options: ["До 7 днів", "До 14 днів", "Протягом місяця", "1–3 місяці", "До конкретної дати"],
      },
      {
        key: "deadline_date",
        type: "text",
        label: "Дата або уточнення",
        placeholder: "Наприклад: до 1 грудня або до відкриття магазину",
        showIf: { key: "deadline", values: ["До конкретної дати"] },
      },
      {
        key: "extra",
        type: "textarea",
        label: "Що нам ще варто знати про ваш проєкт?",
        hint: "Укажіть усе, що, на вашу думку, допоможе нам краще зрозуміти завдання та врахувати важливі деталі під час розробки сайту.",
      },
    ],
  },
  {
    id: "contacts",
    number: "08",
    title: "Ваші контакти",
    hint: "Як і коли з вами зручно зв’язатися.",
    blocking: true,
    fields: [
      { key: "name", type: "text", label: "Ваше ім’я", required: true, autoComplete: "name", placeholder: "Як до вас звертатися" },
      { key: "contact", type: "contact", label: "Телефон або Telegram", required: true, placeholder: "+380 або @username" },
      { key: "contact_method", type: "choice", label: "Зручний спосіб зв’язку", required: true, options: ["Телефонний дзвінок", "Telegram", "WhatsApp", "Інший спосіб"] },
      {
        key: "contact_handle",
        type: "text",
        label: "Username або посилання",
        hint: "Лише якщо відрізняється від контакту, вказаного вище.",
        showIf: { key: "contact_method", values: ["Telegram", "WhatsApp"] },
      },
      { key: "contact_method_other", type: "text", label: "Який саме спосіб?", showIf: { key: "contact_method", values: ["Інший спосіб"] } },
      { key: "contact_time", type: "choice", label: "Коли з вами зручно зв’язатися?", required: true, options: ["Якнайшвидше", "Сьогодні", "Завтра", "В інший день"] },
      {
        key: "contact_time_other",
        type: "text",
        label: "Дата та бажаний час",
        placeholder: "Наприклад: 15 жовтня після 14:00",
        showIf: { key: "contact_time", values: ["В інший день"] },
      },
    ],
  },
];

/**
 * Everything that differs between the Ukrainian and the English brief: the steps (same keys, translated
 * labels and options), the social network names and which of them asks for a custom name.
 * The wizard, /api/brief and the Telegram message all work from the schema of the form that was sent.
 */
export type BriefSchema = {
  locale: Locale;
  steps: BriefStep[];
  socialNetworks: readonly string[];
  otherNetwork: string;
};

export const briefSchemaUk: BriefSchema = { locale: "uk", steps: briefSteps, socialNetworks: SOCIAL_NETWORKS, otherNetwork: OTHER_NETWORK };

/** Link rows shown by default and the most a client can add */
export const DEFAULT_LINKS = 2;
export const MAX_LINKS = 6;
export const MAX_SOCIALS = 6;

/**
 * Character limits shared by the form (maxLength) and /api/brief, so a detailed answer can never be
 * accepted by the form and refused by the server.
 */
export const BRIEF_LIMITS = { text: 1000, textarea: 5000, link: 1000, socialName: 100, phone: 100, email: 200 } as const;

/** The first social network row is ready with Instagram (an empty link isn't sent). */
export const emptySiteContacts = (): BriefSiteContacts => ({ phone: "", email: "", socials: [{ network: "Instagram", name: "", url: "" }] });

/** Initial answers: the preselected options from the schema. */
export function defaultAnswers(steps: BriefStep[] = briefSteps): BriefAnswers {
  const answers: BriefAnswers = {};
  for (const step of steps)
    for (const f of step.fields) {
      if (f.type === "choice" && f.default) answers[f.key] = f.default;
      if (f.type === "multi" && f.default) answers[f.key] = [...f.default];
    }
  return answers;
}

/** Whether a conditional field is currently shown (hidden answers are neither validated nor sent). */
export function isShown(field: BriefField, answers: BriefAnswers) {
  if (!field.showIf) return true;
  const value = answers[field.showIf.key];
  const picked = Array.isArray(value) ? (value as unknown[]).filter((v): v is string => typeof v === "string") : typeof value === "string" ? [value] : [];
  return field.showIf.values.some((v) => picked.includes(v));
}

const filled = (s: unknown) => typeof s === "string" && s.trim().length > 0;

/** True when the answer has some content (step checkmarks, what is sent to Telegram). */
export function hasAnswer(value: BriefValue | undefined) {
  if (value === undefined) return false;
  if (typeof value === "string") return filled(value);
  if (!Array.isArray(value)) return filled(value.phone) || filled(value.email) || value.socials.some((s) => filled(s.url) || filled(s.name));
  return (value as unknown[]).some((v) => (typeof v === "string" ? filled(v) : filled((v as BriefLink).url) || filled((v as BriefLink).note)));
}

/** Key that stores the one-click alternative of a text field ("Поки не маю побажань…"). */
export const skipKey = (field: BriefField) => `${field.key}_skip`;

const errorText = {
  uk: {
    choice: "Оберіть один із варіантів",
    multi: "Оберіть хоча б один варіант",
    siteContacts: "Вкажіть хоча б один контакт",
    links: "Додайте хоча б одне посилання",
    name: "Вкажіть, будь ласка, ваше ім’я",
    skip: "Опишіть побажання або оберіть «Поки не маю побажань»",
    text: "Заповніть, будь ласка, це поле",
  },
  en: {
    choice: "Please choose one of the options",
    multi: "Please choose at least one option",
    siteContacts: "Please add at least one contact",
    links: "Please add at least one link",
    name: "Please enter your name",
    skip: "Describe your preferences or choose “No preferences yet”",
    text: "Please fill in this field",
  },
} satisfies Record<Locale, Record<string, string>>;

/**
 * Why a shown field is not answered correctly (undefined = fine). Optional fields only have
 * the contact format check. Shared by the wizard ("Далі" / send) and /api/brief.
 */
export function fieldError(field: BriefField, answers: BriefAnswers, locale: Locale = "uk"): string | undefined {
  const value = answers[field.key];
  const t = errorText[locale];
  if (field.type === "contact") {
    if (!filled(value) && !field.required) return undefined;
    return contactError(typeof value === "string" ? value : "", locale);
  }
  if (!field.required) return undefined;
  switch (field.type) {
    case "choice":
      return filled(value) ? undefined : t.choice;
    case "multi":
      return Array.isArray(value) && value.length ? undefined : t.multi;
    case "siteContacts":
      return hasAnswer(value) ? undefined : t.siteContacts;
    case "links":
      return hasAnswer(value) ? undefined : t.links;
    default: {
      if (field.skip && answers[skipKey(field)] === "1") return undefined;
      if (field.key === "name") return typeof value === "string" && value.trim().length >= 2 ? undefined : t.name;
      if (filled(value)) return undefined;
      return field.skip ? t.skip : t.text;
    }
  }
}

/**
 * What stops the brief from being sent: the required fields (incl. the phone / Telegram format)
 * of the blocking step "Ваші контакти". Stars on other steps are hints only.
 */
export function sendErrors(answers: BriefAnswers, schema: BriefSchema = briefSchemaUk): { step: number; errors: Record<string, string> } | null {
  for (const [i, s] of schema.steps.entries()) {
    if (!s.blocking) continue;
    const errors = stepErrors(s, answers, schema.locale);
    if (Object.keys(errors).length) return { step: i, errors };
  }
  return null;
}

/** Errors of one step's shown fields, keyed by field key. */
export function stepErrors(step: BriefStep, answers: BriefAnswers, locale: Locale = "uk"): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of step.fields) {
    if (!isShown(f, answers)) continue;
    const error = fieldError(f, answers, locale);
    if (error) errors[f.key] = error;
  }
  return errors;
}
