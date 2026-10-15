import type { Locale } from "@/i18n/locale";
import { validate, MEDIA_REF, PUBLISHED_MEDIA, type Issue } from "@/admin/fields";
import { briefStepsIssues } from "@/admin/brief-rules";
import { allSections } from "@/admin/sections";
import { siteContent, briefContent } from "@/content";
import { clone, SECTIONS, type Area, LOCALES, AREAS } from "./model";

/**
 * Server-side validation of a section document before it is stored or published:
 *   1. structure: inferred from the built-in content (every example of a list item is merged), so unknown keys and
 *      wrong JSON types are refused while optional fields may be present or absent;
 *   2. the same field rules as the admin editor (required texts, links, prices, numbers, brief rules);
 *   3. files: only built-in paths, uploaded-file references and published files of the configured project.
 */

type Node = { types: Set<string>; props?: Map<string, Node>; items?: Node };

const kind = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

function merge(node: Node | undefined, v: unknown): Node {
  const n = node ?? { types: new Set<string>() };
  const k = kind(v);
  n.types.add(k);
  if (k === "object") {
    n.props ??= new Map();
    for (const [key, x] of Object.entries(v as object)) if (x !== undefined) n.props.set(key, merge(n.props.get(key), x));
  } else if (k === "array") for (const x of v as unknown[]) n.items = merge(n.items, x);
  return n;
}

/** Templates per (area, section), merged across both languages */
const templates = new Map<string, Node>();
function template(area: Area, section: string): Node {
  const id = `${area}.${section}`;
  let t = templates.get(id);
  if (!t) {
    t = undefined as unknown as Node;
    for (const l of LOCALES) {
      const doc = (area === "site" ? siteContent[l] : briefContent[l]) as Record<string, unknown>;
      t = merge(t, clone(doc[section]));
    }
    templates.set(id, t!);
  }
  return t!;
}

const MAX_DEPTH = 12;
const MAX_ARRAY = 200;
const MAX_STRING = 20_000;

function shape(v: unknown, n: Node, path: string, out: Issue[], depth = 0) {
  if (out.length > 30) return;
  const k = kind(v);
  if (depth > MAX_DEPTH) return void out.push({ path, level: "error", message: `${path}: слишком глубокая вложенность.` });
  if (!n.types.has(k)) {
    // an optional object/array that is empty in the defaults may legitimately hold strings
    return void out.push({ path, level: "error", message: `${path || "раздел"}: неверный тип данных (${k}).` });
  }
  if (k === "string" && (v as string).length > MAX_STRING) out.push({ path, level: "error", message: `${path}: слишком длинный текст.` });
  if (k === "number" && !Number.isFinite(v as number)) out.push({ path, level: "error", message: `${path}: некорректное число.` });
  if (k === "object") {
    for (const [key, x] of Object.entries(v as object)) {
      const p = path ? `${path}.${key}` : key;
      const child = n.props?.get(key);
      if (!child) out.push({ path: p, level: "error", message: `${p}: неизвестное поле.` });
      else if (x !== undefined) shape(x, child, p, out, depth + 1);
    }
  } else if (k === "array") {
    const list = v as unknown[];
    if (list.length > MAX_ARRAY) out.push({ path, level: "error", message: `${path}: слишком много элементов.` });
    if (n.items) list.forEach((x, i) => shape(x, n.items!, path ? `${path}.${i}` : String(i), out, depth + 1));
    else if (list.some((x) => typeof x !== "string")) out.push({ path, level: "error", message: `${path}: неверное содержимое списка.` });
  }
}

/** Every file reference inside a document */
export function mediaRefs(v: unknown, out = new Set<string>()): Set<string> {
  if (typeof v === "string") {
    if (MEDIA_REF.test(v)) out.add(v.slice("media:".length));
  } else if (v && typeof v === "object") for (const x of Object.values(v)) mediaRefs(x, out);
  return out;
}

function fileIssues(v: unknown, path: string, supabaseHost: string | null, out: Issue[]) {
  if (typeof v === "string") {
    if (v.startsWith("data:") || v.startsWith("blob:")) out.push({ path, level: "error", message: `${path}: файл не загружен в хранилище.` });
    if (PUBLISHED_MEDIA.test(v) && (!supabaseHost || new URL(v).host !== supabaseHost))
      out.push({ path, level: "error", message: `${path}: файл из чужого хранилища.` });
  } else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) fileIssues(x, path ? `${path}.${k}` : k, supabaseHost, out);
}

/**
 * All blocking problems of a section document (warnings of the editor, like long texts, do not block).
 * `root` is the whole draft of the area (some rules look at other sections, e.g. pricing presets).
 */
export function sectionErrors(area: Area, locale: Locale, section: string, data: unknown, root: Record<string, unknown>, supabaseHost: string | null): Issue[] {
  if (!SECTIONS[area].includes(section)) return [{ path: "", level: "error", message: "Неизвестный раздел." }];
  if (JSON.stringify(data ?? null).length > 600_000) return [{ path: "", level: "error", message: "Раздел слишком большой." }];
  if (kind(data) !== "object") return [{ path: "", level: "error", message: "Раздел должен быть объектом." }];
  const out: Issue[] = [];
  shape(data, template(area, section), "", out);
  if (out.length) return out;
  fileIssues(data, "", supabaseHost, out);
  const ctxRoot = { ...root, [section]: data };
  for (const def of allSections.filter((s) => s.area === area && s.key === section)) {
    const issues = def.custom === "brief-steps" ? briefStepsIssues(data, locale) : validate(def.fields, data, "", { locale, root: ctxRoot });
    out.push(...issues.filter((i) => i.level === "error"));
  }
  return out;
}

/** Validates a complete draft set (used before publishing and on import) */
export function snapshotErrors(drafts: Record<Area, Record<Locale, Record<string, unknown>>>, supabaseHost: string | null): { where: string; issue: Issue }[] {
  const out: { where: string; issue: Issue }[] = [];
  for (const a of AREAS)
    for (const l of LOCALES)
      for (const s of SECTIONS[a]) for (const issue of sectionErrors(a, l, s, drafts[a][l][s], drafts[a][l], supabaseHost)) out.push({ where: `${a}/${l}/${s}`, issue });
  return out;
}
