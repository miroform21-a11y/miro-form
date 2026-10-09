"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { submitBrief } from "@/lib/submitBrief";
import { socialLinks } from "@/data/navigation";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { PillButton } from "@/components/ui/PillButton";
import { Honeypot, readHoneypot } from "@/components/ui/Honeypot";
import { inputBase } from "@/components/ui/formStyles";
import {
  DEFAULT_LINKS,
  MAX_LINKS,
  MAX_SOCIALS,
  briefSteps,
  defaultAnswers,
  emptySiteContacts,
  hasAnswer,
  isShown,
  skipKey,
  stepErrors,
  type BriefAnswers,
  type BriefField,
  type BriefLink,
  type BriefNotice,
  type BriefSiteContacts,
} from "@/data/brief";

/** field key → message */
type Errors = Record<string, string>;

const LAST = briefSteps.length - 1;
/** "10–15 хвилин" never breaks inside the range */
const FILL_TIME = (
  <>
    Орієнтовний час заповнення — <span className="whitespace-nowrap">10–15 хвилин</span>
  </>
);

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

const labelClass = "font-display text-[14px] leading-[1.35] font-medium text-white md:text-[15px]";
const subLabelClass = "text-[12px] leading-[1.3] font-[350] text-white/55";
const hintClass = "text-[12px] leading-[1.5] font-[350] text-white/50 md:text-[13px]";
const fieldClass = `${inputBase} h-[54px] px-5 [color-scheme:dark] md:h-[56px] md:px-6`;
const areaClass = `${inputBase} block min-h-[104px] resize-y px-5 pt-[15px] md:px-6`;
const border = (error?: string) => (error ? "border-orange/80" : "border-white/14");

function Label({ field, htmlFor, id, extra }: { field: BriefField; htmlFor?: string; id?: string; extra?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} id={id} className={labelClass}>
      {field.label}
      {field.required && (
        <span className="text-lime" aria-hidden="true">
          {" "}*
        </span>
      )}
      {field.required && <span className="sr-only"> (обов’язкове поле)</span>}
      {extra && <span className="ml-2 font-body text-[12px] font-[350] text-white/40">{extra}</span>}
    </Tag>
  );
}

function Hint({ text }: { text?: string }) {
  return text ? <p className={`-mt-1 ${hintClass}`}>{text}</p> : null;
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="pl-1 text-[12px] text-orange">
      {text}
    </p>
  ) : null;
}

function Chip({ on, multi, onClick, children }: { on: boolean; multi?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={on}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-2 rounded-full border px-[18px] py-2 text-left text-[14px] leading-[1.3] transition-[background-color,border-color,color] duration-300 ${
        on ? "border-lime bg-lime text-ink-2" : "border-white/18 bg-white/4 text-white hover:border-white/35 hover:bg-white/8"
      }`}
    >
      {multi && (
        <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded-[5px] border ${on ? "border-ink-2 bg-ink-2" : "border-white/40"}`}>
          {on && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.2l2 2L8 3" stroke="#AEEE05" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      {children}
    </button>
  );
}

/** Chips with radio / checkbox semantics — the site's form chip look. */
function Chips({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<BriefField, { type: "choice" | "multi" }>;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  error?: string;
}) {
  const id = useId();
  const multi = field.type === "multi";
  const exclusive = field.type === "multi" ? field.exclusive : undefined;
  const list = Array.isArray(value) ? value : [];
  const isOn = (v: string) => (multi ? list.includes(v) : value === v);
  const toggle = (v: string) => {
    if (!multi) return onChange(value === v ? "" : v);
    if (list.includes(v)) return onChange(list.filter((x) => x !== v));
    // "nothing yet" can't be combined with real materials, and vice versa
    if (exclusive) return onChange(v === exclusive ? [v] : [...list.filter((x) => x !== exclusive), v]);
    onChange([...list, v]);
  };

  return (
    <div role="group" aria-labelledby={id} aria-describedby={error ? `brief-${field.key}-error` : undefined} className="flex min-w-0 flex-col gap-3">
      <Label field={field} id={id} extra={multi ? "можна кілька" : undefined} />
      <Hint text={field.hint} />
      <div className="flex flex-wrap gap-2">
        {field.options.map((v) => (
          <Chip key={v} on={isOn(v)} multi={multi} onClick={() => toggle(v)}>
            {v}
          </Chip>
        ))}
      </div>
      <ErrorText id={`brief-${field.key}-error`} text={error} />
    </div>
  );
}

const RemoveButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="grid size-11 shrink-0 place-items-center justify-self-end rounded-full border border-white/14 bg-white/4 transition-colors hover:bg-white/10"
  >
    <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </button>
);

const AddButton = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="self-start rounded-full px-1 text-[14px] leading-[1.3] text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime/60"
  >
    {children}
  </button>
);

const emptyLink = (): BriefLink => ({ url: "", note: "" });

/** "Link + what about it" rows: DEFAULT_LINKS shown, more added on demand (up to MAX_LINKS). */
function Links({ field, value, onChange }: { field: Extract<BriefField, { type: "links" }>; value: BriefLink[] | undefined; onChange: (v: BriefLink[]) => void }) {
  const id = useId();
  const rows = value?.length ? value : Array.from({ length: DEFAULT_LINKS }, emptyLink);
  const update = (i: number, patch: Partial<BriefLink>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div role="group" aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <Label field={field} id={id} />
      <Hint text={field.hint} />
      <ul className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <li key={i} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] md:items-center">
            <input
              type="url"
              inputMode="url"
              aria-label={`${field.label} — посилання ${i + 1}`}
              placeholder="https://"
              value={row.url}
              onChange={(e) => update(i, { url: e.target.value })}
              className={`${fieldClass} border-white/14`}
            />
            <input
              aria-label={`${field.label} — коментар ${i + 1}`}
              placeholder={field.notePlaceholder}
              value={row.note}
              onChange={(e) => update(i, { note: e.target.value })}
              className={`${fieldClass} border-white/14`}
            />
            {i >= DEFAULT_LINKS ? (
              <RemoveButton label={`Прибрати посилання ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))} />
            ) : (
              <span className="max-md:hidden" />
            )}
          </li>
        ))}
      </ul>
      {rows.length < MAX_LINKS && <AddButton onClick={() => onChange([...rows, emptyLink()])}>+ Додати посилання</AddButton>}
    </div>
  );
}

/** Company contacts for the future site: phone, email and "network + link" rows. */
function SiteContacts({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<BriefField, { type: "siteContacts" }>;
  value: BriefSiteContacts | undefined;
  onChange: (v: BriefSiteContacts) => void;
  error?: string;
}) {
  const id = useId();
  const v = value ?? emptySiteContacts();
  const socials = v.socials.length ? v.socials : [{ name: "", url: "" }];
  const setSocial = (i: number, patch: Partial<BriefSiteContacts["socials"][number]>) =>
    onChange({ ...v, socials: socials.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <div role="group" aria-labelledby={id} aria-describedby={error ? `brief-${field.key}-error` : undefined} className="flex min-w-0 flex-col gap-3">
      <Label field={field} id={id} />
      <Hint text={field.hint} />
      <div className={`flex flex-col gap-4 rounded-[20px] border bg-white/[0.02] p-4 md:p-5 ${error ? "border-orange/60" : "border-white/10"}`}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={subLabelClass}>Телефон</span>
            <input
              type="text"
              inputMode="tel"
              autoComplete="off"
              placeholder="+380 або “Надамо пізніше”"
              value={v.phone}
              onChange={(e) => onChange({ ...v, phone: e.target.value })}
              className={`${fieldClass} border-white/14`}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={subLabelClass}>Email</span>
            <input
              type="text"
              inputMode="email"
              autoComplete="off"
              placeholder="info@company.com"
              value={v.email}
              onChange={(e) => onChange({ ...v, email: e.target.value })}
              className={`${fieldClass} border-white/14`}
            />
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={subLabelClass}>Соціальні мережі</span>
          <ul className="flex flex-col gap-2.5">
            {socials.map((s, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_44px] gap-2 md:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)_44px] md:items-center">
                <input
                  aria-label={`Соціальна мережа ${i + 1} — назва`}
                  placeholder="Instagram, Facebook…"
                  value={s.name}
                  onChange={(e) => setSocial(i, { name: e.target.value })}
                  className={`${fieldClass} border-white/14 max-md:col-span-2`}
                />
                <input
                  aria-label={`Соціальна мережа ${i + 1} — посилання`}
                  inputMode="url"
                  placeholder="https://"
                  value={s.url}
                  onChange={(e) => setSocial(i, { url: e.target.value })}
                  className={`${fieldClass} border-white/14 ${i === 0 ? "max-md:col-span-2" : ""}`}
                />
                {i > 0 ? (
                  <RemoveButton label={`Прибрати соціальну мережу ${i + 1}`} onClick={() => onChange({ ...v, socials: socials.filter((_, j) => j !== i) })} />
                ) : (
                  <span className="max-md:hidden" />
                )}
              </li>
            ))}
          </ul>
        </div>
        {socials.length < MAX_SOCIALS && (
          <AddButton onClick={() => onChange({ ...v, socials: [...socials, { name: "", url: "" }] })}>+ Додати соціальну мережу</AddButton>
        )}
      </div>
      <ErrorText id={`brief-${field.key}-error`} text={error} />
    </div>
  );
}

/** Conditional field wrapper: opens smoothly, removed from the tab order while closed. */
function Reveal({ show, children, flush }: { show: boolean; children: ReactNode; flush?: boolean }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-(--ease-smooth) ${
        show ? "grid-rows-[1fr] opacity-100" : `grid-rows-[0fr] opacity-0 ${flush ? "" : "-mt-6 md:-mt-7"}`
      }`}
      inert={!show}
    >
      <div className="min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Lime "paperclip" plate: compact, outlined, not a full-width fill. */
function Notice({ notice }: { notice: BriefNotice }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-lime/35 bg-lime/[0.06] py-3 pr-4 pl-3 md:gap-4 md:pr-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-ink-2" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.5 11.2l-8.1 8.1a5.2 5.2 0 01-7.4-7.4l8.1-8.1a3.5 3.5 0 015 5l-8.2 8.1a1.7 1.7 0 01-2.4-2.4l7.5-7.5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="text-[13px] leading-[1.45] text-white/85 md:text-[14px]">{notice.text}</p>
    </div>
  );
}

function ProgressBar({ step, className = "" }: { step: number; className?: string }) {
  return (
    <div
      className={`h-1 overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-label="Прогрес заповнення брифу"
      aria-valuemin={1}
      aria-valuemax={briefSteps.length}
      aria-valuenow={step + 1}
    >
      <div className="h-full rounded-full bg-lime transition-[width] duration-500 ease-(--ease-smooth)" style={{ width: `${((step + 1) / briefSteps.length) * 100}%` }} />
    </div>
  );
}

const StepCounter = ({ step }: { step: number }) => (
  <p className="font-display text-[13px] leading-none font-medium text-white/80">
    Крок <span className="text-lime">{step + 1}</span> із {briefSteps.length}
  </p>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
    <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 4.8V8l2.2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

export function BriefForm() {
  const [answers, setAnswers] = useState<BriefAnswers>(defaultAnswers);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "sent">("idle");
  const sending = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const current = briefSteps[step];
  const str = (k: string) => (typeof answers[k] === "string" ? (answers[k] as string) : "");

  /** Edits an answer; the error of that field disappears as soon as it is edited. */
  const set = (key: string, value: BriefAnswers[string], errorKey = key) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setErrors((e) => {
      if (!(errorKey in e)) return e;
      const next = { ...e };
      delete next[errorKey];
      return next;
    });
  };

  // On every step change: bring the wizard top into view, move focus to the step title, play a short entrance
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bodyRef.current?.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  }, [step, status]);

  const goTo = (i: number) => {
    setErrors({});
    setStep(Math.max(0, Math.min(LAST, i)));
  };

  /** First step that still has an unanswered required field (the side list can't jump past it). */
  const firstUnfinished = briefSteps.findIndex((s) => Object.keys(stepErrors(s, answers)).length > 0);
  const reachable = (i: number) => firstUnfinished === -1 || i <= firstUnfinished;

  /** Shows the errors and moves focus to the first field that needs an answer. */
  const showErrors = (found: Errors) => {
    setErrors(found);
    const first = Object.keys(found)[0];
    requestAnimationFrame(() => {
      const box = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      box?.scrollIntoView({ behavior: "smooth", block: "center" });
      box?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
    });
  };

  /** "Далі": only when the required fields of this step are answered. */
  const goNext = () => {
    const found = stepErrors(current, answers);
    if (Object.keys(found).length) return showErrors(found);
    goTo(step + 1);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Enter in a field on steps 1–7 means "next", not "send"
    if (step < LAST) return goNext();
    if (sending.current) return;

    const trap = readHoneypot(e.currentTarget);
    if (firstUnfinished !== -1) {
      const found = stepErrors(briefSteps[firstUnfinished], answers);
      if (firstUnfinished !== step) setStep(firstUnfinished);
      return showErrors(found);
    }

    // only answers of shown fields that are filled in
    const payload: BriefAnswers = {};
    for (const s of briefSteps) {
      for (const f of s.fields) {
        if (!isShown(f, answers)) continue;
        let v = answers[f.key];
        if (f.type === "links" && Array.isArray(v)) v = (v as BriefLink[]).filter((l) => l.url.trim() || l.note.trim());
        if (f.type === "siteContacts" && v && !Array.isArray(v) && typeof v === "object")
          v = { ...v, socials: v.socials.filter((x) => x.name.trim() || x.url.trim()) };
        if (f.type !== "siteContacts" && f.type !== "links" && "skip" in f && f.skip && answers[skipKey(f)] === "1") {
          payload[skipKey(f)] = "1";
          continue; // "no wishes yet" replaces the text
        }
        if (hasAnswer(v)) payload[f.key] = v!;
      }
    }

    sending.current = true;
    setStatus("sending");
    try {
      await submitBrief(payload, trap);
      setStatus("sent");
    } catch {
      sending.current = false;
      setStatus("error"); // every answer stays in the form
    }
  };

  if (status === "sent") {
    return (
      <div ref={topRef} className="scroll-mt-6">
        <div
          ref={bodyRef}
          role="status"
          className="mx-auto flex max-w-[640px] flex-col items-center gap-5 rounded-[28px] border border-lime/25 bg-white/[0.03] px-6 py-12 text-center backdrop-blur-[20px] md:rounded-[36px] md:px-12 md:py-16"
        >
          <span className="grid size-16 place-items-center rounded-full bg-lime">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-[26px] leading-[1.15] font-semibold tracking-[-0.03em] text-white outline-none md:text-[32px]">
            Бриф отримано
          </h2>
          <p className="max-w-[440px] text-[15px] leading-[1.6] font-[350] text-white/70">
            Дякуємо! Ми уважно вивчимо відповіді та зв’яжемося з вами найближчим часом.
          </p>
          <PillButton href="/" circleSize={44} gap={18} className="mt-3 h-[60px] pr-2 pl-[28px]">
            Повернутися на сайт
          </PillButton>
        </div>
      </div>
    );
  }

  const renderField = (f: BriefField) => {
    const inputId = `brief-${f.key}`;
    const error = errors[f.key];
    const describedBy = error ? `${inputId}-error` : undefined;
    switch (f.type) {
      case "choice":
      case "multi":
        return <Chips field={f} value={answers[f.key] as string | string[] | undefined} onChange={(v) => set(f.key, v)} error={error} />;
      case "links":
        return <Links field={f} value={answers[f.key] as BriefLink[] | undefined} onChange={(v) => set(f.key, v)} />;
      case "siteContacts":
        return <SiteContacts field={f} value={answers[f.key] as BriefSiteContacts | undefined} onChange={(v) => set(f.key, v)} error={error} />;
      case "textarea": {
        const skipped = !!f.skip && answers[skipKey(f)] === "1";
        return (
          <div className="flex min-w-0 flex-col gap-2.5">
            <Label field={f} htmlFor={inputId} />
            <Hint text={f.hint} />
            {f.skip && (
              <div className="flex flex-wrap">
                <Chip on={skipped} multi onClick={() => set(skipKey(f), skipped ? "" : "1", f.key)}>
                  {f.skip}
                </Chip>
              </div>
            )}
            <Reveal show={!skipped} flush>
              <textarea
                id={inputId}
                name={f.key}
                placeholder={f.placeholder}
                value={str(f.key)}
                onChange={(e) => set(f.key, e.target.value)}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                className={`${areaClass} ${border(error)}`}
              />
            </Reveal>
            <ErrorText id={`${inputId}-error`} text={error} />
          </div>
        );
      }
      default:
        return (
          <div className="flex min-w-0 flex-col gap-2.5">
            <Label field={f} htmlFor={inputId} />
            <Hint text={f.hint} />
            <input
              id={inputId}
              name={f.key}
              type="text"
              autoComplete={f.type === "contact" ? "tel" : (f.autoComplete ?? "off")}
              placeholder={f.placeholder}
              value={str(f.key)}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className={`${fieldClass} ${border(error)}`}
            />
            <ErrorText id={`${inputId}-error`} text={error} />
          </div>
        );
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Бриф" className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Honeypot />

      {/* ---------- Active step (left) ---------- */}
      <div ref={topRef} className="min-w-0 scroll-mt-6">
        <section
          aria-labelledby="brief-step-title"
          className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-[20px] min-[400px]:p-5 md:rounded-[36px] md:p-10 xl:p-12"
        >
          {/* Compact progress (phones / tablets); on desktop it lives in the right column */}
          <div className="mb-8 lg:hidden" aria-live="polite">
            <StepCounter step={step} />
            <ProgressBar step={step} className="mt-3" />
            <p className="mt-2.5 flex items-center gap-1.5 text-[12px] leading-[1.4] text-white/45">
              <ClockIcon />
              <span>{FILL_TIME}</span>
            </p>
          </div>

          <div ref={bodyRef}>
            <header className="flex items-start gap-4 md:gap-5">
              <span className="font-pixel text-[12px] leading-[2.1] text-lime md:text-[14px] md:leading-[2.3]">{current.number}</span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2
                  id="brief-step-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-[22px] leading-[1.2] font-semibold tracking-[-0.03em] text-white outline-none md:text-[28px]"
                >
                  {current.title}
                </h2>
                <p className={hintClass}>{current.hint}</p>
              </div>
            </header>

            <div className="mt-7 flex flex-col gap-6 md:mt-9 md:gap-7">
              {current.notice && <Notice notice={current.notice} />}
              {current.fields.map((f) =>
                f.showIf ? (
                  <Reveal key={f.key} show={isShown(f, answers)}>
                    <div data-field={f.key}>{renderField(f)}</div>
                  </Reveal>
                ) : (
                  <div key={f.key} data-field={f.key}>
                    {renderField(f)}
                  </div>
                ),
              )}
            </div>

            {step === LAST && (
              <p className={`mt-7 ${hintClass}`}>
                Перед відправленням можна повернутися до будь-якого кроку. Натискаючи кнопку, ви погоджуєтесь з{" "}
                <a href={socialLinks.privacy} className="text-white/75 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white">
                  політикою конфіденційності
                </a>
                .
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-2 border-t border-white/8 pt-6 md:mt-10 md:pt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="flex h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-full border border-white/14 bg-white/4 font-display text-[14px] font-medium text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/8 max-sm:size-12 sm:pr-6 sm:pl-5 md:h-[56px] md:text-[15px]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* phones: arrow only, the label stays for screen readers */}
                <span className="max-sm:sr-only">Назад</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="pop-trigger flex h-[52px] items-center justify-between gap-3 rounded-full bg-lime pr-1.5 pl-4 font-display text-[14px] leading-none font-medium whitespace-nowrap text-ink-2 transition-[translate,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] disabled:opacity-70 sm:h-[56px] sm:gap-5 sm:pl-6 sm:text-[15px] md:h-[60px] md:pl-7"
            >
              {step < LAST ? "Далі" : status === "sending" ? "Надсилаємо…" : "Надіслати бриф"}
              <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-2 sm:size-11 md:size-12">
                {status === "sending" ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-lime border-t-transparent" aria-hidden="true" />
                ) : (
                  <ArrowShot color="#AEEE05" size={18} />
                )}
              </span>
            </button>
          </div>

          {status === "error" && step === LAST && (
            <p className="mt-4 text-[13px] leading-[1.5] text-orange" role="alert">
              Не вдалося надіслати бриф. Ваші відповіді збережені — спробуйте ще раз або{" "}
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                напишіть нам у Telegram
              </a>
              .
            </p>
          )}
        </section>
      </div>

      {/* ---------- Progress + steps (desktop, right) ---------- */}
      <aside aria-label="Кроки брифу" className="hidden lg:block">
        <div className="sticky top-8 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-[20px]">
          <div className="px-4 pt-2 pb-4" aria-live="polite">
            <StepCounter step={step} />
            <ProgressBar step={step} className="mt-3" />
            <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-[1.45] text-white/45">
              <span className="mt-px">
                <ClockIcon />
              </span>
              <span>{FILL_TIME}</span>
            </p>
          </div>
          <ol className="flex flex-col gap-0.5 border-t border-white/8 pt-3">
            {briefSteps.map((s, i) => {
              const active = i === step;
              const locked = !reachable(i);
              const done = !active && i < step && Object.keys(stepErrors(s, answers)).length === 0;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={locked}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[14px] leading-[1.3] transition-colors duration-300 ${
                      active ? "bg-white/8 text-white" : locked ? "cursor-default text-white/30" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <span className={`font-pixel text-[10px] ${active ? "text-lime" : "text-white/35"}`}>{s.number}</span>
                    <span className="min-w-0 flex-1">{s.title}</span>
                    {done && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label="пройдено">
                        <path d="M3.5 8.3l2.8 2.8L12.5 5" stroke="#AEEE05" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-white/8 px-4 pt-3 text-[12px] leading-[1.5] text-white/45">
            Поля із зірочкою <span className="text-lime">*</span> обов’язкові. Інші запитання можна пропускати, якщо поки немає відповіді.
          </p>
        </div>
      </aside>
    </form>
  );
}
