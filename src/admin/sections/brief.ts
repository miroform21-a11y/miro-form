import type { BriefUiContent } from "@/content/types";
import type { Field } from "../fields";
import type { SectionDef } from "./types";

const t = (path: string, label: string, rows?: number): Field => ({ kind: "text", path, label, required: true, rows });
const group = (label: string, fields: Field[]): Field => ({ kind: "group", label, fields });

/** Every wizard text with a Russian description (a missing key would fail the type check below) */
const uiLabels: Record<keyof BriefUiContent, string | [string, string]> = {
  fillTime: ["Время заполнения — текст", "Время заполнения — значение"],
  required: "Подпись обязательного поля для дикторов",
  several: "Пометка «можно несколько»",
  link: "Поле ссылки (подпись)",
  comment: "Поле комментария (подпись)",
  removeLink: "Кнопка «Убрать ссылку»",
  addLink: "Кнопка «Добавить ссылку»",
  phone: "Поле телефона",
  phonePlaceholder: "Пример телефона (подсказка в поле)",
  socials: "Заголовок соцсетей",
  socialNetwork: "Выбор соцсети",
  change: "Кнопка «Изменить»",
  remove: "Кнопка «Убрать»",
  socialName: "Поле названия соцсети (подпись)",
  socialNamePlaceholder: "Поле названия соцсети (подсказка)",
  profileLink: "Поле ссылки на профиль (подпись)",
  profilePlaceholder: "Поле ссылки на профиль (подсказка)",
  addSocial: "Кнопка «Добавить соцсеть»",
  openTelegram: "Ссылка на Telegram (для дикторов)",
  progress: "Прогресс (для дикторов)",
  step: ["«Крок»", "«із»"],
  sentTitle: "Успех — заголовок",
  sentText: "Успех — текст",
  backToSite: "Успех — кнопка возврата",
  networkError: "Код ошибки сети",
  form: "Название формы (для дикторов)",
  lastNote: "Текст перед ссылкой на политику (последний шаг)",
  privacy: "Текст ссылки на политику",
  back: "Кнопка «Назад»",
  next: "Кнопка «Далее»",
  sending: "Кнопка во время отправки",
  send: "Кнопка отправки",
  limited: "Ошибка: слишком много попыток",
  failed: "Ошибка отправки",
  writeTelegram: "Ссылка «напишите в Telegram» после ошибки",
  code: "Слово «код» в ошибке",
  steps: "Список шагов (для дикторов)",
  done: "Пометка «пройдено»",
  requiredNote: ["Пояснение о звёздочке — до значка", "Пояснение о звёздочке — после значка"],
};

const uiField = (k: keyof BriefUiContent): Field[] => {
  const l = uiLabels[k];
  return Array.isArray(l) ? [t(`${k}.0`, l[0]), t(`${k}.1`, l[1])] : [t(k, l, k === "lastNote" || k === "limited" || k === "failed" || k === "sentText" ? 2 : undefined)];
};
const ui = (...keys: (keyof BriefUiContent)[]) => keys.flatMap(uiField);

export const briefSections: SectionDef[] = [
  {
    id: "steps",
    group: "Бриф",
    title: "Вопросы брифа (8 шагов)",
    area: "brief",
    key: "schema",
    preview: "brief",
    fields: [],
    custom: "brief-steps",
  },
  {
    id: "page",
    group: "Бриф",
    title: "Страница брифа",
    area: "brief",
    key: "page",
    preview: "brief",
    fields: [t("title", "Заголовок"), t("intro", "Вступление", 3), t("help", "Подсказка", 2), t("privacy", "Конфиденциальность", 2), group("Верхняя панель", [t("back", "Ссылка «На главную»"), t("home", "Логотип (для дикторов)")])],
  },
  {
    id: "ui",
    group: "Бриф",
    title: "Кнопки и сообщения брифа",
    area: "brief",
    key: "ui",
    preview: "brief",
    fields: [
      group("Шапка и навигация", ui("fillTime", "requiredNote", "step", "back", "next", "steps", "done", "progress", "form")),
      group("Поля", ui("several", "required", "link", "comment", "addLink", "removeLink", "phone", "phonePlaceholder", "socials", "socialNetwork", "socialName", "socialNamePlaceholder", "profileLink", "profilePlaceholder", "addSocial", "change", "remove", "openTelegram")),
      group("Отправка", ui("lastNote", "privacy", "send", "sending", "failed", "limited", "writeTelegram", "code", "networkError")),
      group("После отправки", ui("sentTitle", "sentText", "backToSite")),
    ],
  },
];
