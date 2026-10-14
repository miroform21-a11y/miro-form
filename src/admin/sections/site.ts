import type { SiteContent } from "@/content/types";
import { DISCOUNT, EMAIL, PHONE_HREF, PRICE, firstLine, type Field, type FieldContext, type SelectOption } from "../fields";
import type { SectionDef } from "./types";

/** Editors of the site sections (area "site"). Layout-only values (crops, gaps, pill widths, themes) stay in code. */

const t = (path: string, label: string, extra: Partial<Extract<Field, { kind: "text" }>> = {}): Field => ({ kind: "text", path, label, required: true, ...extra });
const opt = (path: string, label: string, extra: Partial<Extract<Field, { kind: "text" }>> = {}): Field => ({ kind: "text", path, label, ...extra });
const area = (path: string, label: string, rows = 3, extra: Partial<Extract<Field, { kind: "text" }>> = {}): Field => t(path, label, { rows, ...extra });
const link = (path: string, label: string, softMax?: number, hint?: string): Field => ({ kind: "link", path, label, softMax, hint });
const group = (label: string, fields: Field[], path?: string, hint?: string): Field => ({ kind: "group", label, fields, path, hint });
const note = (text: string, tone: "info" | "warn" = "info"): Field => ({ kind: "note", text, tone });
const image = (path: string, label: string, hint?: string): Field => ({ kind: "media", media: "image", path, label, hint });
/** Optional explicit two-line version of a text */
const twoLines = (path: string, label: string, from: string, hint?: string): Field => ({
  kind: "optional",
  path,
  label,
  hint,
  make: (item) => {
    const s = String((item as Record<string, unknown>)?.[from] ?? "");
    const cut = s.lastIndexOf(" ", Math.floor(s.length / 2)) + 1 || Math.floor(s.length / 2);
    return [s.slice(0, cut).trimEnd(), s.slice(cut)];
  },
  fields: [t("0", "Строка 1"), t("1", "Строка 2")],
});
const optionalText = (path: string, label: string, from: string, hint?: string, rows?: number): Field => ({
  kind: "optional",
  path,
  label,
  hint,
  make: (item) => String((item as Record<string, unknown>)?.[from] ?? ""),
  fields: [t("", "Текст", { rows })],
});

const site = (ctx: FieldContext) => ctx.root as SiteContent;

const directionOptions: SelectOption[] = [
  { value: "web", label: "Розробка сайтів / Web Development" },
  { value: "design", label: "Дизайн / Digital Design" },
  { value: "ai", label: "AI-рішення / AI Solutions" },
];
/** Options of the popup direction chosen in the same preset */
const presetOptions = (ctx: FieldContext): SelectOption[] => {
  const dir = (ctx.parent as { direction?: string } | undefined)?.direction;
  const d = site(ctx).forms.options.directions.find((x) => x.id === dir);
  return (d?.options ?? []).map((o) => ({ value: o, label: o }));
};
const presetFields = (withOption: boolean): Field[] => [
  { kind: "select", path: "direction", label: "Направление в форме", options: directionOptions, required: true },
  ...(withOption
    ? [
        {
          kind: "select",
          path: "option",
          label: "Предвыбранный вариант",
          hint: "Список берётся из раздела «Всплывающие формы» → варианты направления.",
          options: presetOptions,
          required: true,
        } as Field,
      ]
    : []),
  opt("title", "Заголовок всплывающей формы", { hint: "Пусто — название направления." }),
];

export const siteSections: SectionDef[] = [
  {
    id: "header",
    group: "Главная страница",
    title: "Шапка и меню",
    area: "site",
    key: "header",
    preview: "hero",
    fields: [
      link("cta", "Кнопка «Связаться»", 16),
      {
        kind: "list",
        path: "links",
        label: "Пункты меню",
        fixed: true,
        hint: "Ссылки ведут к блокам страницы (#services, #works…). Количество пунктов совпадает с блоками.",
        itemTitle: (x, i) => firstLine((x as { label: string }).label, `Пункт ${i + 1}`),
        fields: [t("label", "Текст", { softMax: 14 }), { kind: "href", path: "href", label: "Ссылка" }],
      },
      group("Подписи для экранных дикторов", [t("home", "Ссылка-логотип"), t("nav", "Меню (десктоп)"), t("mobileNav", "Меню (телефон)"), t("menu", "Заголовок меню"), t("openMenu", "Кнопка «Открыть меню»"), t("closeMenu", "Кнопка «Закрыть меню»")]),
    ],
  },
  {
    id: "hero",
    group: "Главная страница",
    title: "Первый экран",
    area: "site",
    key: "hero",
    preview: "hero",
    fields: [
      t("eyebrow", "Надзаголовок", { softMax: 20 }),
      group("Заголовок H1 — по строке на поле", [t("title.0", "Строка 1", { softMax: 12 }), t("title.1", "Строка 2", { softMax: 12 }), t("title.2", "Строка 3", { softMax: 12 }), t("title.3", "Строка 4", { softMax: 12 })], undefined, "Крупный пиксельный шрифт: длинные строки переносятся и ломают композицию."),
      group("Подзаголовок", [t("lead.0", "Строка 1", { softMax: 48 }), t("lead.1", "Строка 2", { softMax: 48 })]),
      link("cta", "Кнопка", 24),
      group("Рейтинг", [t("ratingScore", "Оценка", { softMax: 12 }), t("rating", "Подпись", { softMax: 32 }), image("avatars.0", "Фото 1"), image("avatars.1", "Фото 2"), image("avatars.2", "Фото 3"), image("avatars.3", "Фото 4")]),
      {
        kind: "list",
        path: "stack",
        label: "Технологии (плашки)",
        min: 1,
        max: 6,
        hint: "У исходных плашек ширина задана по макету; после переименования плашка подстраивается под текст.",
        itemTitle: (x, i) => firstLine((x as { label: string }).label, `Плашка ${i + 1}`),
        make: () => ({ label: "Новая" }),
        fields: [t("label", "Текст", { softMax: 12, clears: "w" })],
      },
    ],
  },
  {
    id: "services",
    group: "Главная страница",
    title: "Услуги",
    area: "site",
    key: "services",
    preview: "services",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      group("Заголовок на телефоне", [opt("heading.mobile.before", "Начало"), t("heading.mobile.bold", "Жирная часть"), opt("heading.mobile.after", "Окончание")], undefined, "Одно предложение; пробелы на краях фрагментов важны."),
      group(
        "Заголовок на десктопе",
        [opt("heading.desktop.line1", "Строка 1"), opt("heading.desktop.line1Bold", "Строка 1 — жирная часть"), opt("heading.desktop.line2BoldBeforeLogos", "Строка 2 — перед логотипами"), opt("heading.desktop.line2BoldAfterLogos", "Строка 2 — после логотипов"), opt("heading.desktop.line3", "Строка 3")],
        undefined,
        "Три строки, во второй между фрагментами стоит плашка с логотипами.",
      ),
      area("quote", "Цитата", 3, { softMax: 140 }),
      group("Декор", [t("cursorSite", "Курсор 1", { softMax: 10 }), t("cursorDesign", "Курсор 2", { softMax: 10 }), t("keyLetter", "Буква на клавише", { max: 2 })]),
      t("leadLabel", "Подпись кнопки карточки для экранных дикторов"),
      {
        kind: "list",
        path: "cards",
        label: "Карточки услуг",
        fixed: true,
        itemTitle: (x, i) => firstLine((x as { title: string }).title, `Карточка ${i + 1}`),
        fields: [
          note("Цвет карточки и расстояния между колонками заданы макетом и не редактируются. Клик по карточке открывает форму с этим направлением."),
          t("number", "Номер", { max: 3 }),
          t("title", "Название", { softMax: 22 }),
          optionalText("mobileTitle", "Другое название на телефоне", "title"),
          { kind: "strings", path: "tags", label: "Теги (десктоп)", min: 1, max: 4, softMax: 14, itemLabel: "тег" },
          { kind: "strings", path: "mobileTags", label: "Теги (телефон)", min: 1, max: 3, softMax: 14, itemLabel: "тег" },
          { kind: "strings", path: "lists.0", label: "Список — колонка 1", min: 1, max: 4, softMax: 26, itemLabel: "пункт" },
          { kind: "strings", path: "lists.1", label: "Список — колонка 2", min: 1, max: 4, softMax: 26, itemLabel: "пункт" },
          { kind: "href", path: "href", label: "Ссылка" },
        ],
      },
    ],
  },
  {
    id: "works",
    group: "Главная страница",
    title: "Проекты",
    area: "site",
    key: "works",
    preview: "works",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      t("title", "Заголовок", { softMax: 20 }),
      link("all", "Кнопка «Все проекты»", 20),
      t("total", "Счётчик проектов", { softMax: 6, hint: "Например «40+»." }),
      {
        kind: "list",
        path: "projects",
        label: "Проекты",
        fixed: true,
        hint: "Шесть мест: раскладка блока (большие и малые карточки) привязана к позиции. Кадрирование изображений задано макетом.",
        itemTitle: (x, i) => `${i + 1}. ${firstLine((x as { title: string }).title, "Проект")}`,
        fields: [
          t("title", "Название", { softMax: 22 }),
          {
            kind: "href",
            path: "href",
            label: "Ссылка на сайт проекта",
            external: true,
            hint: "Полный адрес, например https://example.com. Клик по карточке открывает его в новой вкладке.",
          },
          area("description", "Описание", 3, { softMax: 120 }),
          optionalText("mobileDescription", "Короче на телефоне", "description", undefined, 2),
          { kind: "strings", path: "tags", label: "Теги", min: 1, max: 4, softMax: 16, itemLabel: "тег" },
          image("image.src", "Изображение"),
          group("Размер исходного изображения, px", [
            { kind: "number", path: "image.width", label: "Ширина", min: 1, integer: true },
            { kind: "number", path: "image.height", label: "Высота", min: 1, integer: true },
          ], undefined, "Должен совпадать с файлом — по нему строятся пропорции."),
          {
            kind: "optional",
            path: "video",
            label: "Видео поверх изображения",
            make: () => ({ mobile: "/videos/" }),
            fields: [
              { kind: "media", media: "video", path: "mobile", label: "Видео для телефона и планшета" },
              { kind: "media", media: "video", path: "desktop", label: "Видео при наведении (десктоп)", optional: true },
            ],
          },
        ],
      },
      group("Подписи для экранных дикторов", [t("card.screenshot", "Скриншот"), t("card.video", "Видео"), t("card.open", "Открыть сайт"), t("slider.label", "Слайдер"), t("slider.slides", "Слайды"), t("slider.slide", "Слайд")]),
    ],
  },
  {
    id: "about",
    group: "Главная страница",
    title: "О компании",
    area: "site",
    key: "about",
    preview: "about",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      area("statement", "Текст после «MIROFORM®»", 3, { softMax: 160 }),
      group("Серая фраза вокруг фото", [t("readBefore", "До фото"), t("readAfter", "После фото")]),
      group("Founder & CEO", [
        t("founder.name", "Имя"),
        t("founder.role", "Должность"),
        {
          kind: "media",
          media: "image",
          path: "founder.photo.desktop",
          label: "Фото Founder — десктоп и планшет",
          hint: "Показывается в той же рамке и с тем же кадрированием, что и сейчас; фото другого формата заполняет рамку без искажений. Лучше вертикальное, примерно 3:4.",
        },
        {
          kind: "media",
          media: "image",
          path: "founder.photo.mobile",
          label: "Фото Founder — телефон",
          hint: "Отдельный вариант для экранов до 768 px, рамка примерно 3:4.",
        },
        t("founder.alt", "Описание фото (alt)"),
        { kind: "href", path: "founder.href", label: "Ссылка" },
        t("founder.ariaLabel", "Подпись ссылки для экранных дикторов"),
      ]),
      group("Счётчик 1", [t("stats.0.label", "Подпись"), { kind: "number", path: "stats.0.value", label: "Число", min: 0, integer: true }, opt("stats.0.suffix", "Знак после числа")]),
      group("Счётчик 2", [t("stats.1.label", "Подпись"), { kind: "number", path: "stats.1.value", label: "Число", min: 0, integer: true }, opt("stats.1.suffix", "Знак после числа")]),
      group("Полный цикл", [
        { kind: "number", path: "fullCycle.value", label: "Число", min: 0, integer: true },
        opt("fullCycle.suffix", "Знак после числа"),
        t("fullCycle.text", "Текст"),
        t("fullCycle.tagline.0", "Слоган — строка 1"),
        t("fullCycle.tagline.1", "Слоган — строка 2"),
      ]),
    ],
  },
  {
    id: "facts",
    group: "Главная страница",
    title: "Факты",
    area: "site",
    key: "facts",
    preview: "facts",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      t("title", "Заголовок", { softMax: 28 }),
      group("Подзаголовок", [t("lead.0", "Строка 1"), t("lead.1", "Строка 2")]),
      {
        kind: "list",
        path: "facts",
        label: "Факты",
        fixed: true,
        itemTitle: (x, i) => `${i + 1}. ${firstLine((x as { label: string }).label, "Факт")}`,
        fields: [
          opt("prefix", "Перед числом", { softMax: 6 }),
          { kind: "number", path: "value", label: "Число", min: 0, integer: true },
          opt("suffix", "Знак после числа", { softMax: 2 }),
          opt("unit", "Единица", { softMax: 8 }),
          t("label", "Подпись", { softMax: 32 }),
          { kind: "toggle", path: "accent", label: "Выделить цветом" },
        ],
      },
      group("Бегущая строка", [t("audienceTitle.0", "Заголовок — строка 1"), t("audienceTitle.1", "Заголовок — строка 2"), { kind: "strings", path: "audiences", label: "Ниши", min: 3, max: 24, softMax: 28, itemLabel: "нишу" }]),
    ],
  },
  {
    id: "process",
    group: "Главная страница",
    title: "Этапы работы",
    area: "site",
    key: "process",
    preview: "process",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      group("Заголовок", [t("title.0", "Строка 1"), t("title.1", "Строка 2")]),
      area("lead", "Подзаголовок", 2),
      {
        kind: "list",
        path: "steps",
        label: "Этапы",
        fixed: true,
        itemTitle: (x, i) => `${(x as { number: string }).number || i + 1}. ${firstLine((x as { title: string[] }).title?.join(" "), "Этап")}`,
        fields: [
          t("number", "Номер", { max: 3 }),
          t("title.0", "Название — строка 1"),
          opt("title.1", "Название — строка 2"),
          area("description", "Описание", 3, { softMax: 120 }),
          twoLines("descriptionLines", "Описание с явным переносом строки (десктоп)", "description"),
          t("duration", "Срок", { softMax: 14 }),
        ],
      },
      group("Плашка внизу", [t("average", "Текст"), t("averageValue", "Значение"), link("cta", "Кнопка", 24)]),
    ],
  },
  {
    id: "pricing",
    group: "Главная страница",
    title: "Цены и скидки",
    area: "site",
    key: "pricing",
    preview: "pricing",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      t("title", "Заголовок", { softMax: 28 }),
      t("from", "Слово перед ценой («Від»)", { softMax: 8 }),
      group("Если цена не указана", [t("quote.0", "Мелкая подпись"), t("quote.1", "Крупный текст")]),
      {
        kind: "list",
        path: "plans",
        label: "Пакеты",
        fixed: true,
        itemTitle: (x, i) => firstLine((x as { title: string[] }).title?.filter(Boolean).join(" "), `Пакет ${i + 1}`),
        fields: [
          t("title.0", "Название — строка 1"),
          opt("title.1", "Название — строка 2"),
          opt("price", "Цена", { pattern: PRICE, hint: "Например «$390». Пусто — показывается «Ціна за запитом»." }),
          area("description", "Описание", 3, { softMax: 120 }),
          twoLines("mobileDescription", "Описание на телефоне с переносом перед последним предложением", "description"),
          { kind: "strings", path: "tags", label: "Что входит в пакет — теги (десктоп)", min: 1, max: 6, softMax: 18, itemLabel: "тег" },
          {
            kind: "list",
            path: "mobileTagRows",
            label: "Что входит в пакет — теги на телефоне, по рядам",
            min: 1,
            max: 4,
            itemTitle: (x, i) => `Ряд ${i + 1}: ${firstLine((x as string[]).join(", "), "—")}`,
            make: () => [""],
            fields: [{ kind: "strings", path: "", label: "Теги ряда", min: 1, max: 4, softMax: 18, itemLabel: "тег" }],
          },
          group("Форма при нажатии «Обрати пакет»", presetFields(true), "lead"),
        ],
      },
      group("Индивидуальный пакет", [
        t("customPlan.badge", "Метка", { softMax: 16 }),
        t("customPlan.title", "Название", { softMax: 16 }),
        area("customPlan.description", "Описание (десктоп)", 2),
        t("customPlanMobile.line1", "Телефон — строка 1"),
        t("customPlanMobile.line2Nowrap", "Телефон — строка 2 (без переноса)"),
        opt("customPlanMobile.line2Tail", "Телефон — хвост строки 2"),
        t("customPlanMobile.line3Nowrap", "Телефон — строка 3 (без переноса)"),
        group("Форма при нажатии «Обговорити»", presetFields(false), "customPlan.lead"),
      ]),
      group("Оплата частинами", [t("payment.title", "Заголовок"), t("payment.note", "Пояснение")]),
      group("Скидки", [
        t("discountsTitle.parts.0", "Заголовок — слово 1"),
        t("discountsTitle.parts.1", "Заголовок — слово 2"),
        { kind: "select", path: "discountsTitle.accent", label: "Оранжевое слово", numeric: true, required: true, options: [{ value: 0, label: "Слово 1" }, { value: 1, label: "Слово 2" }] },
        {
          kind: "list",
          path: "discounts",
          label: "Условия скидок",
          fixed: true,
          itemTitle: (x, i) => `${(x as { value: string }).value} ${firstLine((x as { title: string }).title, `Скидка ${i + 1}`)}`,
          fields: [t("value", "Размер", { pattern: DISCOUNT }), t("title", "Название"), t("lines.0", "Описание — строка 1"), t("lines.1", "Описание — строка 2")],
        },
      ]),
      group("Кнопки и метки", [t("hit", "Метка «Хіт продажів»", { softMax: 14 }), t("choose", "Кнопка выбора пакета"), t("discuss", "Кнопка «Обговорити»"), t("chooseLabel", "Подпись «обрати пакет» для дикторов"), t("discussLabel", "Подпись «обговорити» для дикторов")]),
      note("Цены в форме заявки проверяются сервером по данным сайта. В демо-режиме заявки не отправляются, поэтому изменённая цена видна только в предпросмотре.", "warn"),
    ],
  },
  {
    id: "reviews",
    group: "Главная страница",
    title: "Отзывы",
    area: "site",
    key: "reviews",
    preview: "reviews",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      t("title", "Заголовок", { softMax: 28 }),
      {
        kind: "list",
        path: "items",
        label: "Отзывы",
        min: 2,
        max: 12,
        hint: "На десктопе показываются страницами по 4, на планшете — по 2, на телефоне — слайдер.",
        itemTitle: (x, i) => `${i + 1}. ${firstLine((x as { name: string }).name, "Отзыв")}`,
        make: (list) => {
          const ids = new Set(list.map((x) => (x as { id: string }).id));
          let n = list.length + 1;
          while (ids.has(`review-${n}`)) n++;
          return { id: `review-${n}`, text: "", name: "", company: "", initials: "" };
        },
        fields: [
          t("name", "Имя", { softMax: 22 }),
          t("company", "Компания", { softMax: 28 }),
          area("text", "Текст", 4, { softMax: 160 }),
          twoLines("lines", "Явный перенос строки (десктоп)", "text"),
          optionalText("mobileText", "Другой текст на телефоне", "text", undefined, 3),
          {
            kind: "optional",
            path: "avatar",
            label: "Фото клиента",
            hint: "Без фото показывается монограмма.",
            make: () => ({ src: "/images/reviews/", style: { width: "100%", height: "100%", objectFit: "cover" } }),
            fields: [image("src", "Фото")],
          },
          opt("initials", "Монограмма (если нет фото)", { softMax: 3 }),
        ],
      },
      group("Карточка рейтинга", [
        { kind: "number", path: "ratingCard.score", label: "Оценка", min: 0, max: 5, step: 0.1 },
        t("ratingCard.caption", "Подпись"),
        { kind: "number", path: "ratingCard.clients", label: "Клиентов", min: 0, integer: true },
        opt("ratingCard.clientsSuffix", "Знак после числа"),
        t("ratingCard.clientsLines.0", "Строка 1"),
        t("ratingCard.clientsLines.1", "Строка 2"),
        image("ratingCard.faces.0", "Фото 1"),
        image("ratingCard.faces.1", "Фото 2"),
        image("ratingCard.faces.2", "Фото 3"),
        image("ratingCard.faces.3", "Фото 4"),
      ]),
      group("Подписи для экранных дикторов", [t("prev", "Назад"), t("next", "Вперёд"), t("carousel", "Карусель"), t("starsLabel", "Пять звёзд")]),
    ],
  },
  {
    id: "faq",
    group: "Главная страница",
    title: "Вопросы и ответы",
    area: "site",
    key: "faq",
    preview: "faq",
    fields: [
      group("Заголовок", [t("title.0", "Строка 1"), t("title.1", "Строка 2")]),
      {
        kind: "list",
        path: "items",
        label: "Вопросы",
        min: 1,
        max: 12,
        itemTitle: (x, i) => `${i + 1}. ${firstLine((x as { question: string }).question, "Вопрос")}`,
        make: () => ({ question: "", answer: "" }),
        fields: [
          t("question", "Вопрос", { softMax: 70 }),
          twoLines("mobileLines", "Вопрос на телефоне с явным переносом", "question"),
          area("answer", "Ответ", 4, { softMax: 320 }),
          twoLines("answerLines", "Ответ с явным переносом (десктоп)", "answer"),
        ],
      },
      group("Карточка «Остались вопросы»", [t("askCard.label", "Метка"), t("askCard.title.0", "Заголовок — строка 1"), t("askCard.title.1", "Заголовок — строка 2"), area("askCard.text", "Текст", 2), t("askCard.button", "Кнопка")]),
      note("На опубликованном сайте вопросы также выводятся в структурированных данных (FAQPage) для поисковиков."),
    ],
  },
  {
    id: "contact",
    group: "Главная страница",
    title: "Контакты",
    area: "site",
    key: "contact",
    preview: "contact",
    fields: [
      t("tag", "Метка раздела", { softMax: 16 }),
      t("eyebrow", "Надзаголовок"),
      group("Заголовок", [t("title.0", "Строка 1"), t("title.1", "Строка 2"), t("title.2", "Строка 3 (зелёная)")]),
      area("lead", "Текст", 3),
      {
        kind: "list",
        path: "messengers",
        label: "Мессенджеры",
        min: 1,
        max: 5,
        itemTitle: (x, i) => firstLine((x as { label: string }).label, `Кнопка ${i + 1}`),
        make: () => ({ label: "", href: "https://" }),
        fields: [t("label", "Текст", { softMax: 12 }), { kind: "href", path: "href", label: "Ссылка" }],
      },
      note("Тексты формы в этом блоке — в разделе «Контактная форма»."),
    ],
  },
  {
    id: "footer",
    group: "Главная страница",
    title: "Подвал",
    area: "site",
    key: "footer",
    preview: "footer",
    fields: [
      area("tagline", "Слоган", 2),
      link("cta", "Кнопка", 24),
      group("Навигация", [
        t("navTitle", "Заголовок колонки"),
        {
          kind: "list",
          path: "nav",
          label: "Ссылки",
          min: 1,
          max: 8,
          itemTitle: (x, i) => firstLine((x as { label: string }).label, `Ссылка ${i + 1}`),
          make: () => ({ label: "", href: "#" }),
          fields: [t("label", "Текст"), { kind: "href", path: "href", label: "Ссылка" }],
        },
      ]),
      group("Услуги", [t("servicesTitle", "Заголовок колонки"), { kind: "strings", path: "services", label: "Пункты", min: 1, max: 6, itemLabel: "пункт" }, { kind: "href", path: "servicesHref", label: "Куда ведут пункты" }]),
      group("Контакты компании", [
        t("contactsTitle", "Заголовок колонки"),
        t("contacts.email", "Email", { pattern: EMAIL }),
        t("contacts.phone", "Телефон (как показывается)"),
        t("contacts.phoneHref", "Телефон для звонка", { pattern: PHONE_HREF }),
        t("contacts.legalName", "Юридическое название"),
        t("contacts.legalId", "Код / регистрационный номер"),
      ]),
      {
        kind: "list",
        path: "socials",
        label: "Круглые кнопки соцсетей",
        min: 1,
        max: 6,
        itemTitle: (x, i) => firstLine((x as { name: string }).name, `Кнопка ${i + 1}`),
        make: () => ({ label: "", name: "", href: "https://" }),
        fields: [t("label", "Короткая подпись", { softMax: 3 }), t("name", "Название для дикторов"), { kind: "href", path: "href", label: "Ссылка" }],
      },
      t("rights", "Строка о правах"),
      link("privacy", "Ссылка на политику"),
      group("Подписи для экранных дикторов", [t("home", "Ссылка-логотип"), t("navLabel", "Навигация")]),
    ],
  },
  {
    id: "contact-form",
    group: "Формы",
    title: "Контактная форма",
    area: "site",
    key: "forms",
    preview: "contact",
    fields: [
      note("Разделы «Контактная форма» и «Всплывающие формы» хранят тексты вместе: сохранение одного раздела сохраняет и несохранённые правки другого.", "warn"),
      t("sectionTitle", "Заголовок формы"),
      group("Поля", [t("name", "Имя"), t("contact", "Телефон / мессенджер"), t("projectType", "Тип проекта"), t("budget", "Бюджет"), t("message", "Сообщение")]),
      { kind: "strings", path: "options.projectTypes", label: "Варианты «Тип проекта»", min: 1, max: 8, softMax: 24, itemLabel: "вариант" },
      { kind: "strings", path: "options.budgets", label: "Варианты «Бюджет»", min: 1, max: 6, softMax: 16, itemLabel: "вариант" },
      {
        kind: "select",
        path: "options.defaultBudget",
        label: "Бюджет по умолчанию",
        required: true,
        options: (ctx) => (ctx.parent as SiteContent["forms"]).options.budgets.map((b) => ({ value: b, label: b })),
      },
      group("Кнопка и сообщения", [t("sendLead", "Кнопка отправки"), t("sending", "Кнопка во время отправки"), t("nameError", "Ошибка: нет имени"), t("error", "Ошибка отправки"), t("sentLead", "Успех — заголовок"), t("sentNote", "Успех — пояснение")]),
      group("Согласие", [t("consent", "Текст перед ссылкой"), t("privacy", "Текст ссылки"), { kind: "href", path: "privacyHref", label: "Ссылка на политику" }]),
      note("Ошибки формата телефона / Telegram и проверка на сервере остаются в коде. Варианты заявки сервер проверяет по данным сайта — в демо-режиме заявки не отправляются."),
    ],
  },
  {
    id: "popups",
    group: "Формы",
    title: "Всплывающие формы",
    area: "site",
    key: "forms",
    preview: "popups",
    fields: [
      note("Разделы «Контактная форма» и «Всплывающие формы» хранят тексты вместе: сохранение одного раздела сохраняет и несохранённые правки другого.", "warn"),
      group("Заявка по услуге / пакету", [t("popupNote", "Подзаголовок (заголовок — название услуги или пакета)", { rows: 2 }), t("option", "Подпись выбора варианта"), t("sendLead", "Кнопка отправки"), t("sentLead", "Успех — заголовок")]),
      {
        kind: "list",
        path: "options.directions",
        label: "Направления и их варианты",
        fixed: true,
        hint: "Каждая карточка услуги открывает форму со своим направлением.",
        itemTitle: (x) => firstLine((x as { popupTitle: string }).popupTitle, "Направление"),
        fields: [t("popupTitle", "Заголовок формы"), { kind: "strings", path: "options", label: "Варианты", min: 1, max: 8, softMax: 24, itemLabel: "вариант" }],
      },
      group("Вопрос из блока FAQ", [t("questionTitle", "Заголовок"), t("questionNote", "Подзаголовок", { rows: 2 }), t("contactQuestion", "Поле контакта"), t("question", "Поле вопроса"), t("sendQuestion", "Кнопка отправки"), t("messageError", "Ошибка: пустой вопрос"), t("sentQuestion", "Успех — заголовок")]),
      t("closeLabel", "Кнопка закрытия (для дикторов)"),
      {
        kind: "check",
        run: (v, ctx) => {
          const forms = v as SiteContent["forms"];
          const plans = site(ctx).pricing.plans;
          const broken = plans.filter((p) => p.lead.option && !forms.options.directions.find((d) => d.id === p.lead.direction)?.options.includes(p.lead.option));
          return broken.length
            ? { level: "warning", message: `Предвыбранный вариант пакета «${broken.map((p) => p.title.filter(Boolean).join(" ")).join("», «")}» больше не входит в варианты направления — исправьте его в разделе «Цены и скидки».` }
            : undefined;
        },
      },
    ],
  },
  {
    id: "thank-you",
    group: "Страницы",
    title: "Страница «Спасибо»",
    area: "site",
    key: "thankYou",
    preview: "thank-you",
    fields: [
      group("Надзаголовок", [t("eyebrow.lead", "После заявки"), t("eyebrow.question", "После вопроса")]),
      group("Пиксельный заголовок", [t("line1", "Строка 1", { softMax: 9 }), t("line2.lead", "Строка 2 — после заявки", { softMax: 9 }), t("line2.question", "Строка 2 — после вопроса", { softMax: 9 })], undefined, "На телефоне 360 px в строку помещается около 9 символов."),
      group("Текст", [area("text.lead", "После заявки", 2), area("text.question", "После вопроса", 2)]),
      group("Заголовок для экранных дикторов", [t("srTitle.lead", "После заявки"), t("srTitle.question", "После вопроса")]),
      link("back", "Кнопка возврата"),
    ],
  },
  {
    id: "privacy",
    group: "Страницы",
    title: "Политика конфиденциальности",
    area: "site",
    key: "privacy",
    preview: "privacy",
    fields: [
      t("back", "Ссылка «На главную»"),
      t("title", "Заголовок"),
      {
        kind: "list",
        path: "sections",
        label: "Разделы",
        min: 1,
        max: 30,
        itemTitle: (x, i) => firstLine((x as { title: string }).title, `Раздел ${i + 1}`),
        make: () => ({ title: "", body: [""] }),
        fields: [t("title", "Заголовок раздела"), { kind: "strings", path: "body", label: "Абзацы", min: 1, max: 20, rows: 3, itemLabel: "абзац" }],
      },
      note("Юридический текст: изменения стоит согласовать с юристом до публикации.", "warn"),
    ],
  },
  {
    id: "seo",
    group: "Страницы",
    title: "SEO",
    area: "site",
    key: "seo",
    preview: "seo",
    fields: [
      note("Заголовки и описания страниц для поисковиков и превью в соцсетях. Canonical, hreflang, robots и картинки превью — технические и остаются в коде."),
      ...(
        [
          ["home", "Главная"],
          ["privacy", "Политика конфиденциальности"],
          ["brief", "Бриф (закрыт от индексации)"],
          ["thankYou", "Спасибо (закрыта от индексации)"],
        ] as const
      ).map(([k, label]) => group(label, [t("title", "Title", { softMax: 60 }), area("description", "Description", 3, { softMax: 160 })], k)),
    ],
  },
];
