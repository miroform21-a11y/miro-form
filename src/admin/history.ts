import type { ContentArea } from "@/content/repository";
import type { Locale } from "@/i18n/locale";
import type { Field } from "./fields";
import { getAt, same } from "./path";
import type { SectionDef } from "./sections/types";

/**
 * History of saved content changes (one entry per changed field): diffing and human-readable descriptions.
 * The entries live in the database (cms_changes); the server computes them on every save.
 */

export type HistoryEntry = {
  id: string;
  area: ContentArea;
  locale: Locale;
  /** Top-level key of the area content */
  key: string;
  sectionId: string;
  sectionTitle: string;
  /** Path inside the section value ("" = the whole section) */
  path: string;
  /** Human name of the field: "Проекты › 1. Car Rental › Ссылка на сайт проекта" */
  field: string;
  description: string;
  before: unknown;
  after: unknown;
  at: string;
};

export type Change = { path: string; before: unknown; after: unknown };

const isPlain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Changed leaves; a list whose length changed counts as one change of the whole list */
export function diff(before: unknown, after: unknown, path = ""): Change[] {
  if (same(before, after)) return [];
  if (isPlain(before) && isPlain(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return keys.flatMap((k) => diff(before[k], after[k], path ? `${path}.${k}` : k));
  }
  if (Array.isArray(before) && Array.isArray(after) && before.length === after.length)
    return before.flatMap((x, i) => diff(x, after[i], path ? `${path}.${i}` : String(i)));
  return [{ path, before, after }];
}

/* ---------------- describing a change ---------------- */

type Found = { labels: string[]; field?: Field; listChange?: boolean };

/** Finds the field description of `path` (relative to `value`) and the chain of labels leading to it */
function locate(fields: Field[], segs: string[], value: unknown, labels: string[] = []): Found | null {
  for (const f of fields) {
    if (f.kind === "note" || f.kind === "check") continue;
    const fsegs = f.kind === "group" ? (f.path ? f.path.split(".") : []) : f.path ? f.path.split(".") : [];
    if (fsegs.some((s, i) => segs[i] !== s)) continue;
    const rest = segs.slice(fsegs.length);
    const sub = fsegs.length ? getAt(value, fsegs.join(".")) : value;
    if (f.kind === "group") {
      const r = locate(f.fields, rest, sub, f.label ? [...labels, f.label] : labels);
      if (r) return r;
      continue;
    }
    const here = [...labels, f.label];
    if (f.kind === "list") {
      if (!rest.length) return { labels: here, field: f, listChange: true };
      const i = Number(rest[0]);
      const item = Array.isArray(sub) ? sub[i] : undefined;
      const titled = [...here, f.itemTitle(item, i)];
      if (rest.length === 1) return { labels: titled, field: f };
      return locate(f.fields, rest.slice(1), item, titled) ?? { labels: titled, field: f };
    }
    if (f.kind === "optional") {
      if (!rest.length) return { labels: here, field: f };
      return locate(f.fields, rest, sub, here) ?? { labels: here, field: f };
    }
    if (f.kind === "strings") return { labels: rest.length ? [...here, `№${Number(rest[0]) + 1}`] : here, field: f, listChange: !rest.length };
    if (f.kind === "link") return { labels: rest[0] === "href" ? [...here, "ссылка"] : rest[0] === "label" ? [...here, "текст"] : here, field: f };
    if (!rest.length) return { labels: here, field: f };
  }
  return null;
}

const count = (v: unknown) => (Array.isArray(v) ? v.length : 0);
const quoted = (labels: string[]) => `«${labels[labels.length - 1]}»`;

/** Brief questionnaire paths: steps.{i}.fields.{j}.… */
function describeBrief(path: string, value: unknown): { field: string; description: string } {
  const segs = path.split(".");
  const step = segs[0] === "steps" ? (getAt(value, `steps.${segs[1]}`) as { number?: string } | undefined) : undefined;
  const parts = [step ? `Шаг ${step.number}` : "Анкета"];
  if (segs[2] === "fields" && segs[3] !== undefined) {
    const q = getAt(value, `steps.${segs[1]}.fields.${segs[3]}`) as { label?: string } | undefined;
    parts.push(q ? `вопрос «${q.label}»` : "вопросы шага");
    const tail = segs.slice(4);
    const names: Record<string, string> = { label: "текст вопроса", hint: "подсказка", placeholder: "подсказка в поле", options: "варианты ответа", showIf: "условие показа", required: "звёздочка", default: "вариант по умолчанию", skip: "кнопка-альтернатива" };
    if (tail.length) parts.push(names[tail[0]] ?? tail[0]);
  } else if (segs[2]) parts.push({ title: "название шага", hint: "подсказка шага", notice: "плашка", extraNotices: "плашка", fields: "список вопросов" }[segs[2]] ?? segs[2]);
  const field = parts.join(" › ");
  return { field, description: `Изменено в брифе: ${parts.slice(1).join(", ") || parts[0]}` };
}

export function describe(section: SectionDef, path: string, before: unknown, after: unknown, value: unknown): { field: string; description: string } {
  if (!path) return { field: "Весь раздел", description: `Изменён раздел «${section.title}»` };
  if (section.custom === "brief-steps") return describeBrief(path, value);
  const found = locate(section.fields, path.split("."), value);
  const labels = found?.labels ?? [path];
  const field = labels.join(" › ");
  const f = found?.field;
  const last = path.split(".").pop();
  let description = `Изменено поле ${quoted(labels)}`;
  if (found?.listChange) {
    const d = count(after) - count(before);
    description = d > 0 ? `Добавлено в список ${quoted(labels)}: ${d}` : d < 0 ? `Удалено из списка ${quoted(labels)}: ${-d}` : `Изменён список ${quoted(labels)}`;
  } else if (f?.kind === "media") description = /founder/i.test(path) ? "Обновлена фотография Founder" : `Обновлено изображение ${quoted(labels)}`;
  else if (section.id === "works" && last === "href") description = `Изменена ссылка проекта «${labels[labels.length - 2]?.replace(/^\d+\.\s*/, "")}»`;
  else if (section.id === "pricing" && last === "price") description = `Изменена цена тарифа «${labels[labels.length - 2]}»`;
  else if (section.id === "pricing" && /^discounts\.\d+\.value$/.test(path)) description = "Изменён размер скидки";
  else if (section.id === "pricing" && /^plans\.\d+\.title\.\d$/.test(path)) description = `Изменено название тарифа «${labels[labels.length - 2]}»`;
  else if (section.id === "pricing" && /^plans\.\d+\.description$/.test(path)) description = `Изменено описание тарифа «${labels[labels.length - 2]}»`;
  else if (section.id === "pricing" && /^plans\.\d+\.(tags|mobileTagRows)(\.|$)/.test(path)) description = `Изменён состав тарифа «${labels[1]}»`;
  else if (f?.kind === "href" || (f?.kind === "link" && last === "href")) description = `Изменена ссылка ${quoted(labels.filter((l) => l !== "ссылка"))}`;
  else if (f?.kind === "optional") description = after === undefined ? `Отключено: ${quoted(labels)}` : before === undefined ? `Включено: ${quoted(labels)}` : description;
  else if (f?.kind === "toggle") description = `${after ? "Включено" : "Выключено"}: ${quoted(labels)}`;
  return { field, description };
}

/** Short readable form of a value for the overview */
export function preview(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "string") return v.startsWith("media:") ? "загруженный файл" : v.includes("/storage/v1/object/public/") ? "опубликованный файл" : v.length > 60 ? v.slice(0, 58) + "…" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `список (${v.length})`;
  return "набор полей";
}
