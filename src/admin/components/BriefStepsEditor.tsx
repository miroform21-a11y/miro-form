"use client";

import { useState } from "react";
import type { BriefField, BriefOption, BriefStep } from "@/data/brief";
import type { Locale } from "@/i18n/locale";
import type { Field, Issue } from "../fields";
import { join, setAt } from "../path";
import { Fields, btnCls, inputCls } from "./FieldEditor";

/**
 * Editor of the brief questionnaire (area "brief", key "schema"): texts of steps and questions, options with
 * stable ids, conditions, optional custom questions. The last step ("Your contacts") keeps its structure:
 * sending depends on it.
 */
import { hasOptions, references, textFields, triggers, typeName, type AnyField, type Choice, type Schema } from "../brief-rules";


const IssueLine = ({ issues, path }: { issues: Issue[]; path: string }) => {
  const mine = issues.filter((i) => i.path === path);
  if (!mine.length) return null;
  return (
    <ul className="flex flex-col gap-1">
      {mine.map((i, n) => (
        <li key={n} className={`text-[12.5px] ${i.level === "error" ? "text-orange" : "text-amber-300/90"}`}>
          {i.level === "error" ? "✕ " : "! "}
          {i.message}
        </li>
      ))}
    </ul>
  );
};

const nextId = (options: readonly BriefOption[]) => `o${Math.max(0, ...options.map((o) => Number(o.id.replace(/^o/, "")) || 0)) + 1}`;

function OptionsEditor({ schema, field, path, onChange, issues }: { schema: Schema; field: Choice; path: string; onChange: (f: Choice) => void; issues: Issue[] }) {
  const set = (patch: Partial<Choice>) => onChange({ ...field, ...patch } as Choice);
  const options = field.options;
  const multi = field.type === "multi";
  const defaults: readonly string[] = field.type === "choice" ? (field.default ? [field.default] : []) : (field.default ?? []);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-white/80">Варианты ответа</span>
      <p className="-mt-1 text-[12px] text-white/45">У каждого варианта постоянный ID: условия и настройки ссылаются на него, поэтому текст можно менять свободно.</p>
      {options.map((o, k) => {
        const refs = references(schema, field.key, o.id);
        return (
          <div key={o.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <code className="w-9 shrink-0 text-[11px] text-white/35">{o.id}</code>
              <input
                aria-label={`Вариант ${k + 1}`}
                value={o.label}
                onChange={(e) => set({ options: options.map((x, n) => (n === k ? { ...x, label: e.target.value } : x)) })}
                className={inputCls}
              />
              <button
                type="button"
                className={btnCls}
                disabled={k === 0}
                aria-label="Выше"
                onClick={() => {
                  const next = [...options];
                  [next[k - 1], next[k]] = [next[k], next[k - 1]];
                  set({ options: next });
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className={btnCls}
                aria-label="Удалить вариант"
                disabled={refs.length > 0 || options.length <= 2}
                title={refs.length ? `Нельзя удалить: используется — ${refs.join(", ")}` : options.length <= 2 ? "Нужно хотя бы 2 варианта" : "Удалить"}
                onClick={() => set({ options: options.filter((_, n) => n !== k) })}
              >
                ✕
              </button>
            </div>
            {refs.length > 0 && <p className="pl-11 text-[11.5px] text-white/35">{`Используется: ${refs.join(", ")}`}</p>}
            <div className="pl-11">
              <IssueLine issues={issues} path={join(path, "options", k)} />
            </div>
          </div>
        );
      })}
      <button type="button" className={`${btnCls} self-start`} disabled={options.length >= 12} onClick={() => set({ options: [...options, { id: nextId(options), label: "Новый вариант" }] })}>
        + Добавить вариант
      </button>
      <IssueLine issues={issues} path={join(path, "options")} />

      <div className="mt-1 flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-white/80">{multi ? "Отмечены заранее" : "Выбран заранее"}</span>
        {multi ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {options.map((o) => (
              <label key={o.id} className="flex items-center gap-1.5 text-[13px] text-white/75 pointer-coarse:min-h-11">
                <input
                  type="checkbox"
                  className="accent-lime"
                  checked={defaults.includes(o.id)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...defaults, o.id] : defaults.filter((x) => x !== o.id);
                    set({ default: next.length ? next : undefined } as Partial<Choice>);
                  }}
                />
                {o.label}
              </label>
            ))}
          </div>
        ) : (
          <select value={defaults[0] ?? ""} onChange={(e) => set({ default: e.target.value || undefined } as Partial<Choice>)} className={`${inputCls} [&>option]:bg-[#151515]`}>
            <option value="">— ничего —</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {field.type === "multi" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-white/80">Исключающий вариант</span>
          <p className="-mt-1 text-[12px] text-white/45">Например «Поки нічого немає»: снимает остальные отметки, кроме совместимых со всеми.</p>
          <select
            value={field.exclusive ?? ""}
            onChange={(e) => set({ exclusive: e.target.value || undefined, independent: e.target.value ? field.independent : undefined } as Partial<Choice>)}
            className={`${inputCls} [&>option]:bg-[#151515]`}
          >
            <option value="">— нет —</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {field.exclusive && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="w-full text-[12px] text-white/45">Совместимы со всеми:</span>
              {options
                .filter((o) => o.id !== field.exclusive)
                .map((o) => (
                  <label key={o.id} className="flex items-center gap-1.5 text-[13px] text-white/75 pointer-coarse:min-h-11">
                    <input
                      type="checkbox"
                      className="accent-lime"
                      checked={!!field.independent?.includes(o.id)}
                      onChange={(e) => {
                        const cur = field.independent ?? [];
                        const next = e.target.checked ? [...cur, o.id] : cur.filter((x) => x !== o.id);
                        set({ independent: next.length ? next : undefined } as Partial<Choice>);
                      }}
                    />
                    {o.label}
                  </label>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShowIfEditor({ schema, field, path, onChange, issues }: { schema: Schema; field: AnyField; path: string; onChange: (f: AnyField) => void; issues: Issue[] }) {
  const options = triggers(schema, field.key);
  const cur = field.showIf;
  const trigger = options.find((t) => t.key === cur?.key);
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-dashed border-white/12 p-3">
      <span className="text-[13px] font-medium text-white/80">Условие показа</span>
      <select
        aria-label="Показывать, когда в вопросе выбран вариант"
        value={cur?.key ?? ""}
        onChange={(e) => onChange({ ...field, showIf: e.target.value ? { key: e.target.value, values: [] } : undefined } as AnyField)}
        className={`${inputCls} [&>option]:bg-[#151515]`}
      >
        <option value="">Показывать всегда</option>
        {options.map((t) => (
          <option key={t.key} value={t.key}>
            {`Когда в «${t.label}» выбрано…`}
          </option>
        ))}
      </select>
      {cur && trigger && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {trigger.options.map((o) => (
            <label key={o.id} className="flex items-center gap-1.5 text-[13px] text-white/75 pointer-coarse:min-h-11">
              <input
                type="checkbox"
                className="accent-lime"
                checked={cur.values.includes(o.id)}
                onChange={(e) =>
                  onChange({ ...field, showIf: { key: cur.key, values: e.target.checked ? [...cur.values, o.id] : cur.values.filter((v) => v !== o.id) } } as AnyField)
                }
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
      <IssueLine issues={issues} path={join(path, "showIf")} />
    </div>
  );
}

const usedAsCondition = (schema: Schema, key: string) => schema.steps.some((s) => s.fields.some((f) => f.showIf?.key === key));

function newField(schema: Schema, type: "text" | "textarea" | "choice" | "multi", locale: Locale): BriefField {
  const keys = new Set(schema.steps.flatMap((s) => s.fields.map((f) => f.key)));
  let n = 1;
  while (keys.has(`custom_${n}`)) n++;
  const key = `custom_${n}`;
  const label = locale === "en" ? "New question" : "Нове питання";
  if (type === "choice" || type === "multi")
    return { key, type, label, options: locale === "en" ? [{ id: "o1", label: "Yes" }, { id: "o2", label: "No" }] : [{ id: "o1", label: "Так" }, { id: "o2", label: "Ні" }] };
  return { key, type, label };
}

export function BriefStepsEditor({
  locale,
  value,
  onChange,
  issues,
  step,
  onStep,
}: {
  locale: Locale;
  value: unknown;
  onChange: (v: unknown) => void;
  issues: Issue[];
  step: number;
  onStep: (step: number) => void;
}) {
  const schema = value as Schema;
  const s: BriefStep | undefined = schema.steps[step];
  const [open, setOpen] = useState<string | null>(null);
  const [addType, setAddType] = useState<"text" | "textarea" | "choice" | "multi">("text");
  if (!s) return null;
  const sp = `steps.${step}`;
  const locked = !!s.blocking;
  const setStep = (next: BriefStep) => onChange(setAt(schema, sp, next));
  const setField = (j: number, f: BriefField) => setStep({ ...s, fields: s.fields.map((x, n) => (n === j ? f : x)) });
  const errorsIn = (p: string) => issues.some((i) => i.level === "error" && (i.path === p || i.path.startsWith(p + ".")));

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg border border-amber-300/30 bg-amber-300/[0.06] px-3 py-2 text-[12.5px] leading-snug text-amber-100/90">
        Опубликованный бриф и проверка ответов на сервере используют анкету из кода сайта. Изменённая здесь анкета видна в предпросмотре и
        сохраняется в браузере; на сайт она попадёт только после подключения базы данных.
      </p>
      <div role="tablist" aria-label="Шаги брифа" className="flex flex-wrap gap-1">
        {schema.steps.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            aria-selected={i === step}
            onClick={() => {
              onStep(i);
              setOpen(null);
            }}
            className={`rounded-lg border px-3 py-1.5 text-[13px] pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${i === step ? "border-lime bg-lime text-ink" : errorsIn(`steps.${i}`) ? "border-orange/60 text-orange" : "border-white/12 text-white/70 hover:bg-white/5"}`}
          >
            {x.number}
          </button>
        ))}
      </div>

      <Fields
        fields={[
          { kind: "text", path: "title", label: "Название шага", required: true },
          { kind: "text", path: "hint", label: "Подсказка шага", required: true, rows: 2 },
          ...(s.notice ? ([{ kind: "text", path: "notice.text", label: "Плашка", required: true, rows: 2 }] as Field[]) : []),
          ...(s.extraNotices ?? []).map((_, k) => ({ kind: "text", path: `extraNotices.${k}.text`, label: `Дополнительная плашка ${k + 1}`, required: true, rows: 2 }) as Field),
        ]}
        value={s}
        onChange={(v) => setStep(v as BriefStep)}
        base={sp}
        issues={issues}
        ctx={{ locale, root: schema }}
      />
      {locked && (
        <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12.5px] text-white/60">
          Последний шаг «контакты» проверяется перед отправкой (имя, телефон / Telegram, способ и время связи), поэтому его вопросы нельзя добавлять, удалять и
          делать необязательными — меняются только тексты.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-white/80">{`Вопросы шага (${s.fields.length})`}</span>
        {s.fields.map((f, j) => {
          const fp = `${sp}.fields.${j}`;
          const isOpen = open === f.key;
          const referenced = usedAsCondition(schema, f.key);
          const removable = !locked && !referenced;
          return (
            <div key={f.key} className={`rounded-xl border ${errorsIn(fp) ? "border-orange/50" : "border-white/10"} bg-white/[0.02]`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f.key)}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 py-1 text-left text-[13.5px] pointer-coarse:min-h-11"
                >
                  <span className={`text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                  <span className="min-w-0 break-words text-white/90">{f.label || f.key}</span>
                  {f.required && <span className="text-lime">*</span>}
                  {f.showIf && <span className="shrink-0 rounded bg-white/10 px-1.5 text-[11px] text-white/55">условный</span>}
                  <span className="ml-auto shrink-0 text-[11px] text-white/35">{typeName[f.type]}</span>
                </button>
                {!locked && (
                  <>
                    <button
                      type="button"
                      className={btnCls}
                      aria-label="Выше"
                      disabled={j === 0}
                      onClick={() => {
                        const next = [...s.fields];
                        [next[j - 1], next[j]] = [next[j], next[j - 1]];
                        setStep({ ...s, fields: next });
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={btnCls}
                      aria-label="Удалить вопрос"
                      disabled={!removable}
                      title={referenced ? "Нельзя удалить: от ответа на этот вопрос зависит показ других вопросов" : "Удалить вопрос"}
                      onClick={() => {
                        if (window.confirm(`Удалить вопрос «${f.label}»?`)) setStep({ ...s, fields: s.fields.filter((_, n) => n !== j) });
                      }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
              {isOpen && (
                <div className="flex flex-col gap-4 border-t border-white/10 p-4">
                  <p className="text-[11.5px] text-white/35">
                    Ключ <code className="text-white/55">{f.key}</code> — постоянный, по нему ответ попадает в нужную строку сообщения в Telegram.
                    {referenced && " От ответа на этот вопрос зависит показ других вопросов."}
                  </p>
                  <Fields fields={textFields(f, locked)} value={f} onChange={(v) => setField(j, v as BriefField)} base={fp} issues={issues} ctx={{ locale, root: schema }} />
                  {hasOptions(f) && <OptionsEditor schema={schema} field={f} path={fp} onChange={(nf) => setField(j, nf)} issues={issues} />}
                  {!locked && <ShowIfEditor schema={schema} field={f as AnyField} path={fp} onChange={(nf) => setField(j, nf)} issues={issues} />}
                  {locked && f.showIf && <p className="text-[12px] text-white/45">Условие показа этого вопроса задано в коде.</p>}
                  <IssueLine issues={issues} path={fp} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!locked && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/12 p-3">
          <span className="text-[13px] text-white/70">Новый вопрос:</span>
          <select value={addType} onChange={(e) => setAddType(e.target.value as typeof addType)} className={`${inputCls} w-auto [&>option]:bg-[#151515]`} aria-label="Тип нового вопроса">
            <option value="text">Строка</option>
            <option value="textarea">Многострочный текст</option>
            <option value="choice">Один вариант</option>
            <option value="multi">Несколько вариантов</option>
          </select>
          <button
            type="button"
            className={btnCls}
            disabled={s.fields.length >= 16}
            onClick={() => {
              const f = newField(schema, addType, locale);
              setStep({ ...s, fields: [...s.fields, f] });
              setOpen(f.key);
            }}
          >
            + Добавить
          </button>
          <p className="w-full text-[11.5px] text-white/35">Новые вопросы необязательные; в Telegram их ответы приходят в разделе «Інше».</p>
        </div>
      )}
    </div>
  );
}
