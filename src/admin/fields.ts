import type { Locale } from "@/i18n/locale";
import { getAt, join } from "./path";
import { formatPrice } from "@/lib/price";

/**
 * Declarative description of an editor form. Paths are relative to the value being edited
 * (a section of the content, or one item of a list), see path.ts.
 */

type Common = {
  path: string;
  label: string;
  hint?: string;
  required?: boolean;
};

export type Pattern = { re: RegExp; message: string };

export type Field =
  | (Common & {
      kind: "text";
      /** textarea with this many rows */
      rows?: number;
      /** Longer text is allowed but flagged: the layout was designed for about this length */
      softMax?: number;
      max?: number;
      pattern?: Pattern;
      placeholder?: string;
      /** Relative path removed from the parent when this text changes (e.g. fixed pill widths) */
      clears?: string;
    })
  | (Common & { kind: "number"; min?: number; max?: number; step?: number; integer?: boolean })
  /** { label, href } */
  | (Common & { kind: "link"; softMax?: number })
  /** A bare URL / anchor */
  /** A bare URL / anchor; `external` = a full https:// address of another site */
  | (Common & { kind: "href"; external?: boolean })
  /**
   * A file of the site: a built-in path ("/images/…"), an uploaded file ("media:<id>", private until published)
   * or a published file in Storage (public URL)
   */
  | (Common & { kind: "media"; media: "image" | "video"; optional?: boolean })
  | (Common & { kind: "strings"; min?: number; max?: number; fixed?: boolean; softMax?: number; rows?: number; itemLabel?: string })
  | (Common & {
      kind: "list";
      min?: number;
      max?: number;
      /** The number of items is part of the layout */
      fixed?: boolean;
      fields: Field[];
      itemTitle: (item: unknown, index: number) => string;
      make?: (list: unknown[]) => unknown;
    })
  | { kind: "group"; label?: string; hint?: string; path?: string; fields: Field[] }
  | (Common & { kind: "select"; options: SelectOption[] | ((ctx: FieldContext) => SelectOption[]); numeric?: boolean; allowEmpty?: string })
  | (Common & { kind: "toggle" })
  /** Optional sub-object / tuple: a checkbox adds it with `make()` or removes it */
  | (Common & { kind: "optional"; make: (item: unknown) => unknown; fields: Field[] })
  | { kind: "note"; text: string; tone?: "info" | "warn" }
  /** Cross-field rule of the current level (no own input) */
  | { kind: "check"; run: (value: unknown, ctx: FieldContext) => Omit<Issue, "path"> & { path?: string } | undefined };

export type SelectOption = { value: string | number; label: string };

/** What a field may look at besides its own value */
export type FieldContext = { locale: Locale; root: unknown; parent: unknown };

export type Issue = { path: string; level: "error" | "warning"; message: string };

/* ---------------- validation ---------------- */

const HREF = /^(#[\w-]*|\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/;
/** Local files only: next/image has no remote hosts configured */
const MEDIA = /^\/[^\s]+$/;

/** An uploaded file that is not published yet (private bucket, shown in the admin through signed URLs) */
export const MEDIA_REF = /^media:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** A published file in Supabase Storage (the server also checks that it belongs to this project) */
export const PUBLISHED_MEDIA = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/cms-public\/media\/[0-9a-f]{64}\.(jpg|png|webp|avif|mp4)$/;
/** Upload limits (the buckets enforce the same) */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const externalUrlError = (v: string) => {
  const s = v.trim();
  if (/\s/.test(s)) return "адрес не должен содержать пробелов.";
  if (!/^https?:\/\//i.test(s)) return "укажите полный адрес сайта, начиная с https:// (например https://example.com).";
  try {
    const u = new URL(s);
    if (!u.hostname.includes(".") || u.hostname.startsWith(".") || u.hostname.endsWith(".")) return "в адресе нет корректного домена (например example.com).";
  } catch {
    return "адрес записан некорректно — проверьте его (например https://example.com).";
  }
  return undefined;
};

export const hrefError = (v: string) =>
  HREF.test(v.trim()) ? undefined : "Ссылка должна начинаться с «#», «/», «https://», «mailto:» или «tel:» и не содержать пробелов.";

const blank = (v: unknown) => typeof v !== "string" || !v.trim();

function textIssues(f: { label: string; required?: boolean; softMax?: number; max?: number; pattern?: Pattern }, v: unknown, path: string, out: Issue[]) {
  const s = typeof v === "string" ? v : "";
  if (f.required && blank(s)) out.push({ path, level: "error", message: `Поле «${f.label}» не может быть пустым.` });
  if (f.max && s.length > f.max) out.push({ path, level: "error", message: `«${f.label}»: не больше ${f.max} символов (сейчас ${s.length}).` });
  else if (f.softMax && s.length > f.softMax)
    out.push({ path, level: "warning", message: `«${f.label}»: текст длиннее ${f.softMax} символов может нарушить вёрстку (сейчас ${s.length}). Проверьте предпросмотр.` });
  if (f.pattern && s && !f.pattern.re.test(s)) out.push({ path, level: "error", message: `«${f.label}»: ${f.pattern.message}` });
}

export function validate(fields: Field[], value: unknown, base = "", ctx: Omit<FieldContext, "parent">): Issue[] {
  const out: Issue[] = [];
  for (const f of fields) {
    if (f.kind === "note") continue;
    if (f.kind === "check") {
      const r = f.run(value, { ...ctx, parent: value });
      if (r) out.push({ ...r, path: join(base, r.path ?? "") });
      continue;
    }
    if (f.kind === "group") {
      out.push(...validate(f.fields, f.path ? getAt(value, f.path) : value, join(base, f.path ?? ""), ctx));
      continue;
    }
    const path = join(base, f.path);
    const v = getAt(value, f.path);
    switch (f.kind) {
      case "text":
        textIssues(f, v, path, out);
        break;
      case "number": {
        if (typeof v !== "number" || Number.isNaN(v)) out.push({ path, level: "error", message: `«${f.label}»: введите число.` });
        else {
          if (f.integer && !Number.isInteger(v)) out.push({ path, level: "error", message: `«${f.label}»: только целое число.` });
          if (f.min !== undefined && v < f.min) out.push({ path, level: "error", message: `«${f.label}»: не меньше ${f.min}.` });
          if (f.max !== undefined && v > f.max) out.push({ path, level: "error", message: `«${f.label}»: не больше ${f.max}.` });
        }
        break;
      }
      case "link": {
        const l = (v ?? {}) as { label?: string; href?: string };
        textIssues({ label: `${f.label} — текст`, required: true, softMax: f.softMax }, l.label, join(path, "label"), out);
        if (blank(l.href)) out.push({ path: join(path, "href"), level: "error", message: `«${f.label}»: укажите ссылку.` });
        else {
          const e = hrefError(l.href!);
          if (e) out.push({ path: join(path, "href"), level: "error", message: `«${f.label}»: ${e}` });
        }
        break;
      }
      case "href": {
        if (blank(v)) out.push({ path, level: "error", message: `«${f.label}»: укажите ссылку.` });
        else {
          const e = f.external ? externalUrlError(v as string) : hrefError(v as string);
          if (e) out.push({ path, level: "error", message: `«${f.label}»: ${e}` });
        }
        break;
      }
      case "media": {
        if (v === undefined && f.optional) break;
        const s = typeof v === "string" ? v : "";
        if (MEDIA_REF.test(s) || PUBLISHED_MEDIA.test(s)) break;
        if (s.startsWith("blob:") || s.startsWith("data:"))
          out.push({ path, level: "error", message: `«${f.label}»: файл ещё не загружен — дождитесь окончания загрузки или выберите его снова.` });
        else if (!MEDIA.test(s))
          out.push({ path, level: "error", message: `«${f.label}»: загрузите файл или укажите путь к файлу на сайте, начиная с «/» (например /images/works/project.png).` });
        break;
      }
      case "strings": {
        const list = Array.isArray(v) ? (v as unknown[]) : [];
        if (f.min !== undefined && list.length < f.min) out.push({ path, level: "error", message: `«${f.label}»: нужно не меньше ${f.min}.` });
        if (f.max !== undefined && list.length > f.max) out.push({ path, level: "error", message: `«${f.label}»: не больше ${f.max}.` });
        list.forEach((s, i) => textIssues({ label: `${f.label} №${i + 1}`, required: true, softMax: f.softMax }, s, join(path, i), out));
        break;
      }
      case "list": {
        const list = Array.isArray(v) ? (v as unknown[]) : [];
        if (f.min !== undefined && list.length < f.min) out.push({ path, level: "error", message: `«${f.label}»: нужно не меньше ${f.min}.` });
        if (f.max !== undefined && list.length > f.max) out.push({ path, level: "error", message: `«${f.label}»: не больше ${f.max}.` });
        list.forEach((item, i) => {
          for (const issue of validate(f.fields, item, join(path, i), ctx))
            out.push({ ...issue, message: `${f.itemTitle(item, i)}: ${issue.message}` });
        });
        break;
      }
      case "select": {
        const opts = typeof f.options === "function" ? f.options({ ...ctx, parent: value }) : f.options;
        if (v === undefined || v === "") {
          if (f.required) out.push({ path, level: "error", message: `«${f.label}»: выберите значение.` });
        } else if (!opts.some((o) => o.value === v)) out.push({ path, level: "error", message: `«${f.label}»: значение «${String(v)}» больше не входит в список вариантов — выберите заново.` });
        break;
      }
      case "optional":
        if (v !== undefined) out.push(...validate(f.fields, v, path, ctx));
        break;
    }
  }
  return out;
}

/* ---------------- common patterns ---------------- */

/** An amount with the $ on either side ("390$" or "$390"); the site shows it in the order set in lib/price.ts */
export const PRICE: Pattern = {
  re: /^(\$\s?[\d\s,]*\d|\d[\d\s,]*\s?\$)$/,
  message: `цена в формате «${formatPrice("390")}» или «${formatPrice("3,990")}».`,
};
export const DISCOUNT: Pattern = { re: /^-?\d{1,2}%$/, message: "скидка в формате «-10%»." };
export const EMAIL: Pattern = { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "адрес почты в формате name@domain.com." };
export const PHONE_HREF: Pattern = { re: /^tel:\+?\d{7,15}$/, message: "ссылка для звонка в формате «tel:+380730217721» (без пробелов)." };
export const ID: Pattern = { re: /^[a-z0-9-]+$/, message: "только латиница в нижнем регистре, цифры и дефис." };

export const firstLine = (s: unknown, fallback: string) => {
  const t = typeof s === "string" ? s.trim() : "";
  return t ? (t.length > 90 ? t.slice(0, 88) + "…" : t) : fallback;
};
