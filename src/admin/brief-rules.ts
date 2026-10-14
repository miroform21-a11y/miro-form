import type { BriefField, BriefSchema } from "@/data/brief";
import type { Locale } from "@/i18n/locale";
import { validate, type Field, type Issue } from "./fields";

/**
 * Rules of the brief questionnaire editor, shared by the editor (browser) and the server, which re-checks every
 * saved questionnaire before it is stored or published.
 */

export type Schema = BriefSchema;
export type AnyField = BriefField & Record<string, unknown>;
export type Choice = Extract<BriefField, { type: "choice" | "multi" }>;

export const typeName: Record<BriefField["type"], string> = {
  text: "Строка",
  textarea: "Многострочный текст",
  choice: "Один вариант",
  multi: "Несколько вариантов",
  links: "Список ссылок",
  siteContacts: "Контакты для сайта",
  contact: "Телефон / Telegram",
};

export const hasOptions = (f: BriefField): f is Choice => f.type === "choice" || f.type === "multi";

/** Text parts of a question, edited with the generic field editor */
export function textFields(f: BriefField, locked: boolean): Field[] {
  const out: Field[] = [{ kind: "text", path: "label", label: "Вопрос", required: true, rows: 2 }, { kind: "text", path: "hint", label: "Подсказка под вопросом", rows: 2 }];
  if (f.type === "text" || f.type === "textarea" || f.type === "contact") out.push({ kind: "text", path: "placeholder", label: "Подсказка внутри поля" });
  if (f.type === "text" || f.type === "textarea")
    out.push({ kind: "optional", path: "skip", label: "Кнопка-альтернатива ответу («Поки не маю побажань…»)", make: () => "", fields: [{ kind: "text", path: "", label: "Текст кнопки", required: true }] });
  if (f.type === "links") out.push({ kind: "text", path: "notePlaceholder", label: "Подсказка в поле комментария", required: true });
  if (!locked) out.push({ kind: "toggle", path: "required", label: "Отметить звёздочкой", hint: "на шагах 1–7 звёздочка — подсказка, отправку не блокирует" });
  return out;
}

/** Every place an option id of `key` is referenced */
export function references(schema: Schema, key: string, id: string): string[] {
  const out: string[] = [];
  for (const s of schema.steps)
    for (const f of s.fields) {
      if (f.showIf?.key === key && f.showIf.values.includes(id)) out.push(`условие показа вопроса «${f.label}»`);
      if (f.key === key && hasOptions(f)) {
        if (f.type === "choice" ? f.default === id : f.default?.includes(id)) out.push("вариант по умолчанию");
        if (f.type === "multi" && f.exclusive === id) out.push("«исключающий» вариант");
        if (f.type === "multi" && f.independent?.includes(id)) out.push("«совместимый со всеми» вариант");
      }
    }
  return out;
}

export const triggers = (schema: Schema, self: string) => schema.steps.flatMap((s) => s.fields).filter((f): f is Choice => hasOptions(f) && f.key !== self);

export const locate = (schema: Schema, key: string) => {
  for (const [i, s] of schema.steps.entries()) {
    const j = s.fields.findIndex((f) => f.key === key);
    if (j >= 0) return [i, j] as const;
  }
  return null;
};

export function briefStepsIssues(value: unknown, locale: Locale): Issue[] {
  const schema = value as Schema;
  const out: Issue[] = [];
  const seen = new Set<string>();
  schema.steps.forEach((s, i) => {
    const sp = `steps.${i}`;
    const stepName = `Шаг ${s.number}`;
    for (const issue of validate(
      [
        { kind: "text", path: "title", label: "Название шага", required: true },
        { kind: "text", path: "hint", label: "Подсказка шага", required: true },
      ],
      s,
      sp,
      { locale, root: schema },
    ))
      out.push({ ...issue, message: `${stepName}: ${issue.message}` });
    [s.notice, ...(s.extraNotices ?? [])].forEach((n, k) => {
      if (n && !n.text.trim()) out.push({ path: k ? `${sp}.extraNotices.${k - 1}.text` : `${sp}.notice.text`, level: "error", message: `${stepName}: текст плашки не может быть пустым.` });
    });
    s.fields.forEach((f, j) => {
      const fp = `${sp}.fields.${j}`;
      const name = `${stepName}, «${f.label || f.key}»`;
      if (seen.has(f.key)) out.push({ path: fp, level: "error", message: `${name}: ключ «${f.key}» повторяется.` });
      seen.add(f.key);
      for (const issue of validate(textFields(f, !!s.blocking), f, fp, { locale, root: schema })) out.push({ ...issue, message: `${name}: ${issue.message}` });
      if (hasOptions(f)) {
        if (f.options.length < 2) out.push({ path: `${fp}.options`, level: "error", message: `${name}: нужно хотя бы 2 варианта.` });
        const labels = new Set<string>();
        f.options.forEach((o, k) => {
          if (!o.label.trim()) out.push({ path: `${fp}.options.${k}`, level: "error", message: `${name}: вариант ${k + 1} пустой.` });
          else if (labels.has(o.label.trim())) out.push({ path: `${fp}.options.${k}`, level: "error", message: `${name}: вариант «${o.label}» повторяется.` });
          labels.add(o.label.trim());
        });
        const ids = new Set(f.options.map((o) => o.id));
        const bad = [
          ...(f.type === "choice" ? [f.default] : (f.default ?? [])),
          ...(f.type === "multi" ? [f.exclusive, ...(f.independent ?? [])] : []),
        ].filter((x): x is string => !!x && !ids.has(x));
        if (bad.length) out.push({ path: `${fp}.options`, level: "error", message: `${name}: настройки ссылаются на удалённый вариант.` });
      }
      if (f.showIf) {
        const at = locate(schema, f.showIf.key);
        const trigger = at ? schema.steps[at[0]].fields[at[1]] : undefined;
        if (!trigger || !hasOptions(trigger)) out.push({ path: `${fp}.showIf`, level: "error", message: `${name}: вопрос для условия показа не найден.` });
        else {
          if (!f.showIf.values.length) out.push({ path: `${fp}.showIf`, level: "error", message: `${name}: выберите хотя бы один вариант в условии показа.` });
          if (f.showIf.values.some((v) => !trigger.options.some((o) => o.id === v)))
            out.push({ path: `${fp}.showIf`, level: "error", message: `${name}: условие показа ссылается на удалённый вариант.` });
          if (at![0] > i || (at![0] === i && at![1] > j)) out.push({ path: `${fp}.showIf`, level: "warning", message: `${name}: вопрос-условие стоит ниже этого вопроса — клиенту будет неудобно.` });
        }
      }
    });
  });
  return out;
}

