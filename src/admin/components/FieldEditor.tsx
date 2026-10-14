"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { MAX_BROWSER_IMAGE, type Field, type FieldContext, type Issue, type SelectOption } from "../fields";
import { getAt, join, setAt } from "../path";

/** Renders a list of field descriptions (fields.ts) for `value` and reports every edit as a new value. */

type Props = {
  fields: Field[];
  value: unknown;
  onChange: (next: unknown) => void;
  /** Path of `value` inside the section, used to match issues */
  base?: string;
  issues: Issue[];
  ctx: Omit<FieldContext, "parent">;
};

export const inputCls =
  "w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[14px] leading-snug text-white outline-none transition-colors placeholder:text-white/30 hover:border-white/25 focus:border-lime/70 focus:bg-white/[0.06] aria-[invalid=true]:border-orange/80";
export const btnCls =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/85 transition-colors hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";
const iconBtn =
  "grid size-8 shrink-0 place-items-center rounded-md border border-white/10 text-[13px] text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;
  return (
    <ul className="mt-1.5 flex flex-col gap-1">
      {issues.map((i, n) => (
        <li key={n} className={`text-[12.5px] leading-snug ${i.level === "error" ? "text-orange" : "text-amber-300/90"}`}>
          {i.level === "error" ? "✕ " : "! "}
          {i.message}
        </li>
      ))}
    </ul>
  );
}

function Labeled({ label, hint, required, htmlFor, children, issues }: { label: string; hint?: string; required?: boolean; htmlFor?: string; children: ReactNode; issues: Issue[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-white/80">
        {label}
        {required && <span className="text-lime"> *</span>}
      </label>
      {hint && <p className="-mt-0.5 text-[12px] leading-snug text-white/45">{hint}</p>}
      {children}
      <IssueList issues={issues} />
    </div>
  );
}

const own = (issues: Issue[], path: string) => issues.filter((i) => i.path === path);
const under = (issues: Issue[], path: string) => issues.filter((i) => i.path === path || i.path.startsWith(path + "."));

function Counter({ value, softMax, max }: { value: string; softMax?: number; max?: number }) {
  const limit = max ?? softMax;
  if (!limit) return null;
  return <span className={`text-[11px] ${value.length > limit ? "text-amber-300" : "text-white/35"}`}>{`${value.length} / ${limit}`}</span>;
}

function TextInput({
  id,
  value,
  onChange,
  rows,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  invalid: boolean;
}) {
  return rows ? (
    <textarea id={id} rows={rows} value={value} placeholder={placeholder} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y`} />
  ) : (
    <input id={id} type="text" value={value} placeholder={placeholder} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} className={inputCls} />
  );
}

/** A reduced copy of a picked image as a data URL (WebP, longest side ≤ 1400px) for the browser demo store */
async function reduceImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("decode");
  });
  const k = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const q of [0.86, 0.72, 0.6]) {
    const url = canvas.toDataURL("image/webp", q);
    if (url.startsWith("data:image/webp") && url.length <= MAX_BROWSER_IMAGE) return url;
    if (!url.startsWith("data:image/webp")) break; // no WebP encoder → JPEG below
  }
  const jpeg = canvas.toDataURL("image/jpeg", 0.8);
  if (jpeg.length > MAX_BROWSER_IMAGE) throw new Error("too-big");
  return jpeg;
}

const pickError: Record<string, string> = {
  "not-image": "Это не изображение — выберите файл PNG, JPG или WebP.",
  decode: "Не удалось прочитать изображение. Попробуйте другой файл.",
  "too-big": "Изображение слишком большое даже после уменьшения — выберите файл поменьше.",
};

function MediaField({ f, value, onChange, issues, path }: { f: Extract<Field, { kind: "media" }>; value: unknown; onChange: (v: unknown) => void; issues: Issue[]; path: string }) {
  const id = useId();
  const s = typeof value === "string" ? value : "";
  const inBrowser = f.store === "browser";
  /** The value that a picked file replaced (to put it back) */
  const [original, setOriginal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickMsg, setPickMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isFile = s.startsWith("blob:") || s.startsWith("data:");
  const preview = s && (/^\/[^\s]+$/.test(s) || isFile);
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setPickMsg(null);
    if (!inBrowser) {
      if (original === null) setOriginal(s);
      onChange(URL.createObjectURL(file));
      return;
    }
    setBusy(true);
    try {
      const url = await reduceImage(file);
      if (original === null) setOriginal(s);
      onChange(url);
    } catch (e) {
      setPickMsg(pickError[(e as Error).message] ?? pickError.decode);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Labeled label={f.label} hint={f.hint} required={!f.optional} htmlFor={id} issues={own(issues, path)}>
      <div className="flex gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
          {preview ? (
            f.media === "video" ? (
              <video src={s} muted playsInline className="size-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary path / picked file
              <img src={s} alt={`${f.label}: текущее изображение`} className="size-full object-cover" />
            )
          ) : (
            <span className="text-[11px] text-white/30">нет</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            id={id}
            type="text"
            value={isFile ? "" : s}
            placeholder={
              s.startsWith("data:") ? "Выбранный файл (хранится только в этом браузере)" : s.startsWith("blob:") ? "Выбран локальный файл (только предпросмотр)" : f.media === "video" ? "/videos/…" : "/images/…"
            }
            aria-invalid={own(issues, path).some((i) => i.level === "error")}
            onChange={(e) => {
              setOriginal(null);
              onChange(e.target.value);
            }}
            className={inputCls}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btnCls} disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Обработка…" : inBrowser ? (isFile ? "Заменить фото" : "Загрузить новое фото") : "Выбрать файл для предпросмотра"}
            </button>
            {original !== null && (
              <button
                type="button"
                className={btnCls}
                onClick={() => {
                  onChange(original);
                  setOriginal(null);
                }}
              >
                {inBrowser ? "Отменить выбор и вернуть исходное" : "Вернуть путь"}
              </button>
            )}
            {f.optional && value !== undefined && (
              <button type="button" className={btnCls} onClick={() => onChange(undefined)}>
                Убрать
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              hidden
              accept={f.media === "video" ? "video/mp4,video/webm" : inBrowser ? "image/png,image/jpeg,image/webp" : "image/png,image/jpeg,image/webp,image/avif,image/svg+xml"}
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          {pickMsg && (
            <p role="alert" className="text-[12.5px] text-orange">
              {pickMsg}
            </p>
          )}
          <p className="text-[11.5px] leading-snug text-amber-200/80">
            {inBrowser
              ? "Демо-режим: выбранное фото уменьшается и после «Сохранить» хранится только в этом браузере вместе с остальными демо-данными. На сервер и на сайт оно не загружается."
              : "Загрузка файлов в демо-версии не работает: выбранный файл виден только в предпросмотре этой вкладки, никуда не отправляется и не сохраняется."}
          </p>
        </div>
      </div>
    </Labeled>
  );
}

function ListControls({ i, n, fixed, min, onMove, onRemove }: { i: number; n: number; fixed?: boolean; min?: number; onMove: (to: number) => void; onRemove: () => void }) {
  if (fixed) return null;
  return (
    <div className="flex gap-1">
      <button type="button" className={iconBtn} aria-label="Выше" title="Выше" disabled={i === 0} onClick={() => onMove(i - 1)}>
        ↑
      </button>
      <button type="button" className={iconBtn} aria-label="Ниже" title="Ниже" disabled={i === n - 1} onClick={() => onMove(i + 1)}>
        ↓
      </button>
      <button type="button" className={iconBtn} aria-label="Удалить" title="Удалить" disabled={min !== undefined && n <= min} onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

function FieldView({ f, value, onChange, base, issues, ctx }: { f: Field } & Omit<Props, "fields">) {
  const id = useId();
  const [openItem, setOpenItem] = useState<number | null>(null);

  if (f.kind === "check") {
    const r = f.run(value, { ...ctx, parent: value });
    return r && !r.path ? <IssueList issues={[{ ...r, path: base ?? "" }]} /> : null;
  }

  if (f.kind === "note")
    return (
      <p className={`rounded-lg border px-3 py-2 text-[12.5px] leading-snug ${f.tone === "warn" ? "border-amber-300/30 bg-amber-300/[0.06] text-amber-100/90" : "border-white/10 bg-white/[0.03] text-white/60"}`}>
        {f.text}
      </p>
    );

  if (f.kind === "group") {
    const sub = f.path ? getAt(value, f.path) : value;
    return (
      <fieldset className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        {f.label && <legend className="px-1.5 text-[13px] font-semibold tracking-wide text-lime/90">{f.label}</legend>}
        {f.hint && <p className="-mt-1 text-[12px] text-white/45">{f.hint}</p>}
        <Fields
          fields={f.fields}
          value={sub}
          onChange={(v) => onChange(f.path ? setAt(value, f.path, v) : v)}
          base={join(base ?? "", f.path ?? "")}
          issues={issues}
          ctx={ctx}
        />
      </fieldset>
    );
  }

  const path = join(base ?? "", f.path);
  const v = getAt(value, f.path);
  const set = (next: unknown) => onChange(setAt(value, f.path, next));
  const mine = own(issues, path);
  const invalid = mine.some((i) => i.level === "error");

  switch (f.kind) {
    case "text": {
      const s = typeof v === "string" ? v : "";
      return (
        <Labeled label={f.label} hint={f.hint} required={f.required} htmlFor={id} issues={mine}>
          <TextInput
            id={id}
            value={s}
            rows={f.rows}
            placeholder={f.placeholder}
            invalid={invalid}
            onChange={(t) => {
              let next = setAt(value, f.path, t);
              if (f.clears) {
                const parentPath = f.path.split(".").slice(0, -1).join(".");
                next = setAt(next, join(parentPath, f.clears), undefined);
              }
              onChange(next);
            }}
          />
          <div className="-mt-1 flex justify-end">
            <Counter value={s} softMax={f.softMax} max={f.max} />
          </div>
        </Labeled>
      );
    }
    case "number":
      return (
        <Labeled label={f.label} hint={f.hint} required htmlFor={id} issues={mine}>
          <input
            id={id}
            type="number"
            value={typeof v === "number" && !Number.isNaN(v) ? v : ""}
            min={f.min}
            max={f.max}
            step={f.step ?? 1}
            aria-invalid={invalid}
            onChange={(e) => set(e.target.value === "" ? Number.NaN : Number(e.target.value))}
            className={`${inputCls} max-w-[180px]`}
          />
        </Labeled>
      );
    case "link": {
      const l = (v ?? { label: "", href: "" }) as { label: string; href: string };
      const li = own(issues, join(path, "label"));
      const hi = own(issues, join(path, "href"));
      return (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[13px] font-medium text-white/80">
            {f.label}
            <span className="text-lime"> *</span>
          </span>
          {f.hint && <p className="-mt-0.5 text-[12px] text-white/45">{f.hint}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              aria-label={`${f.label}: текст`}
              placeholder="Текст"
              value={l.label}
              aria-invalid={li.some((i) => i.level === "error")}
              onChange={(e) => set({ ...l, label: e.target.value })}
              className={inputCls}
            />
            <input
              aria-label={`${f.label}: ссылка`}
              placeholder="#section, /page, https://…"
              value={l.href}
              aria-invalid={hi.some((i) => i.level === "error")}
              onChange={(e) => set({ ...l, href: e.target.value })}
              className={`${inputCls} font-mono text-[13px]`}
            />
          </div>
          <IssueList issues={[...li, ...hi]} />
        </div>
      );
    }
    case "href":
      return (
        <Labeled label={f.label} hint={f.hint} required htmlFor={id} issues={mine}>
          <input id={id} value={typeof v === "string" ? v : ""} aria-invalid={invalid} onChange={(e) => set(e.target.value)} className={`${inputCls} font-mono text-[13px]`} />
        </Labeled>
      );
    case "media":
      return <MediaField f={f} value={v} onChange={set} issues={issues} path={path} />;
    case "toggle":
      return (
        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-white/80">
          <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked || undefined)} className="mt-0.5 size-4 shrink-0 accent-lime" />
          <span>
            {f.label}
            {f.hint && <span className="block text-[12px] text-white/40">{f.hint}</span>}
          </span>
        </label>
      );
    case "select": {
      const opts: SelectOption[] = typeof f.options === "function" ? f.options({ ...ctx, parent: value }) : f.options;
      const known = opts.some((o) => o.value === v);
      return (
        <Labeled label={f.label} hint={f.hint} required={f.required} htmlFor={id} issues={mine}>
          <select
            id={id}
            value={v === undefined ? "" : String(v)}
            aria-invalid={invalid}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return set(undefined);
              set(f.numeric ? Number(raw) : raw);
            }}
            className={`${inputCls} [&>option]:bg-[#151515]`}
          >
            {(f.allowEmpty !== undefined || v === undefined) && <option value="">{f.allowEmpty ?? "— не выбрано —"}</option>}
            {!known && v !== undefined && v !== "" && <option value={String(v)}>{`${String(v)} (нет в списке)`}</option>}
            {opts.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
      );
    }
    case "optional": {
      const on = v !== undefined;
      return (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-dashed border-white/12 p-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-white/80">
            <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked ? f.make(value) : undefined)} className="size-4 accent-lime" />
            {f.label}
          </label>
          {f.hint && <p className="-mt-2 text-[12px] text-white/45">{f.hint}</p>}
          {on && <Fields fields={f.fields} value={v} onChange={set} base={path} issues={issues} ctx={ctx} />}
        </div>
      );
    }
    case "strings": {
      const list = Array.isArray(v) ? (v as string[]) : [];
      const canAdd = !f.fixed && (f.max === undefined || list.length < f.max);
      return (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[13px] font-medium text-white/80">
            {f.label}
            {f.min ? <span className="text-lime"> *</span> : null}
            <span className="ml-2 text-[11px] font-normal text-white/35">
              {list.length}
              {f.fixed ? " (фиксированное количество)" : f.max ? ` из ${f.max}` : ""}
            </span>
          </span>
          {f.hint && <p className="-mt-0.5 text-[12px] text-white/45">{f.hint}</p>}
          <div className="flex flex-col gap-2">
            {list.map((s, i) => {
              const ii = own(issues, join(path, i));
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 w-5 shrink-0 text-right text-[11px] text-white/35">{i + 1}</span>
                    <TextInput
                      id={`${id}-${i}`}
                      value={s}
                      rows={f.rows}
                      invalid={ii.some((x) => x.level === "error")}
                      onChange={(t) => set(list.map((x, j) => (j === i ? t : x)))}
                    />
                    <ListControls i={i} n={list.length} fixed={f.fixed} min={f.min} onMove={(to) => set(move(list, i, to))} onRemove={() => set(list.filter((_, j) => j !== i))} />
                  </div>
                  <div className="pl-7">
                    <IssueList issues={ii} />
                  </div>
                </div>
              );
            })}
          </div>
          {canAdd && (
            <button type="button" className={`${btnCls} self-start`} onClick={() => set([...list, ""])}>
              + Добавить {f.itemLabel ?? "строку"}
            </button>
          )}
          <IssueList issues={mine} />
        </div>
      );
    }
    case "list": {
      const list = Array.isArray(v) ? (v as unknown[]) : [];
      const canAdd = !f.fixed && !!f.make && (f.max === undefined || list.length < f.max);
      return (
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[13px] font-medium text-white/80">
            {f.label}
            <span className="ml-2 text-[11px] font-normal text-white/35">
              {list.length}
              {f.fixed ? " (фиксированное количество — сетка блока рассчитана на него)" : f.max ? ` (от ${f.min ?? 0} до ${f.max})` : ""}
            </span>
          </span>
          {f.hint && <p className="-mt-1 text-[12px] text-white/45">{f.hint}</p>}
          {list.map((item, i) => {
            const ip = join(path, i);
            const errs = under(issues, ip);
            const isOpen = openItem === i;
            return (
              <div key={i} className={`rounded-xl border ${errs.some((e) => e.level === "error") ? "border-orange/50" : "border-white/10"} bg-white/[0.02]`}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenItem(isOpen ? null : i)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-[13.5px] text-white/90"
                  >
                    <span className={`inline-block text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                    <span className="truncate">{f.itemTitle(item, i)}</span>
                    {errs.some((e) => e.level === "error") && <span className="shrink-0 rounded bg-orange/20 px-1.5 text-[11px] text-orange">ошибки</span>}
                  </button>
                  <ListControls
                    i={i}
                    n={list.length}
                    fixed={f.fixed}
                    min={f.min}
                    onMove={(to) => {
                      set(move(list, i, to));
                      setOpenItem(isOpen ? to : openItem);
                    }}
                    onRemove={() => {
                      if (!window.confirm(`Удалить «${f.itemTitle(item, i)}»? Изменение можно отменить кнопкой «Отменить изменения», пока раздел не сохранён.`)) return;
                      set(list.filter((_, j) => j !== i));
                      setOpenItem(null);
                    }}
                  />
                </div>
                {isOpen && (
                  <div className="flex flex-col gap-4 border-t border-white/10 p-4">
                    <Fields fields={f.fields} value={item} onChange={(nextItem) => set(list.map((x, j) => (j === i ? nextItem : x)))} base={ip} issues={issues} ctx={ctx} />
                  </div>
                )}
              </div>
            );
          })}
          {canAdd && (
            <button
              type="button"
              className={`${btnCls} self-start`}
              onClick={() => {
                set([...list, f.make!(list)]);
                setOpenItem(list.length);
              }}
            >
              + Добавить
            </button>
          )}
          <IssueList issues={mine} />
        </div>
      );
    }
  }
}

export function Fields(props: Props) {
  const { fields, ...rest } = props;
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {fields.map((f, i) => (
        <FieldView key={i} f={f} {...rest} />
      ))}
    </div>
  );
}
