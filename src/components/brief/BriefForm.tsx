"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { submitBrief } from "@/lib/submitBrief";
import { contactError } from "@/lib/contact";
import { socialLinks } from "@/data/navigation";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { PillButton } from "@/components/ui/PillButton";
import { Honeypot, readHoneypot } from "@/components/ui/Honeypot";
import { inputBase } from "@/components/ui/formStyles";
import { MAX_LINKS, briefSteps, hasAnswer, isShown, type BriefAnswers, type BriefField, type BriefLink } from "@/data/brief";

type Errors = Partial<Record<"name" | "contact", string>>;

const LAST = briefSteps.length - 1;

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

const labelClass = "font-display text-[14px] leading-[1.35] font-medium text-white md:text-[15px]";
const hintClass = "text-[13px] leading-[1.5] font-[350] text-white/50";
const fieldClass = `${inputBase} h-[54px] border-white/14 px-5 [color-scheme:dark] md:h-[56px] md:px-6`;
const areaClass = `${inputBase} block min-h-[104px] resize-y border-white/14 px-5 pt-[15px] md:px-6`;

function Label({ field, htmlFor, id, extra }: { field: BriefField; htmlFor?: string; id?: string; extra?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} id={id} className={labelClass}>
      {field.label}
      {field.required ? (
        <span className="text-lime"> *</span>
      ) : (
        <span className="ml-2 font-body text-[12px] font-[350] text-white/40">необов’язково</span>
      )}
      {extra && <span className="ml-2 font-body text-[12px] font-[350] text-white/40">· {extra}</span>}
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

/** Chips with radio / checkbox semantics — the site's form chip look. */
function Chips({ field, value, onChange }: { field: Extract<BriefField, { type: "choice" | "multi" }>; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const id = useId();
  const multi = field.type === "multi";
  const list = Array.isArray(value) ? value : [];
  const isOn = (v: string) => (multi ? list.includes(v) : value === v);
  const toggle = (v: string) => onChange(multi ? (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]) : value === v ? "" : v);

  return (
    <div role="group" aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <Label field={field} id={id} extra={multi ? "можна кілька" : undefined} />
      <Hint text={field.hint} />
      <div className="flex flex-wrap gap-2">
        {field.options.map((v) => (
          <button
            key={v}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={isOn(v)}
            onClick={() => toggle(v)}
            className={`flex min-h-11 items-center gap-2 rounded-full border px-[18px] py-2 text-left text-[14px] leading-[1.3] transition-[background-color,border-color,color] duration-300 ${
              isOn(v) ? "border-lime bg-lime text-ink-2" : "border-white/18 bg-white/4 text-white hover:border-white/35 hover:bg-white/8"
            }`}
          >
            {multi && (
              <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded-[5px] border ${isOn(v) ? "border-ink-2 bg-ink-2" : "border-white/40"}`}>
                {isOn(v) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.2l2 2L8 3" stroke="#AEEE05" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            )}
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Up to MAX_LINKS "link + what about it" rows; the next row appears on demand. */
function Links({ field, value, onChange }: { field: Extract<BriefField, { type: "links" }>; value: BriefLink[] | undefined; onChange: (v: BriefLink[]) => void }) {
  const id = useId();
  const rows = value?.length ? value : [{ url: "", note: "" }];
  const update = (i: number, patch: Partial<BriefLink>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div role="group" aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <Label field={field} id={id} />
      <ul className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <li key={i} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
            <input
              type="url"
              inputMode="url"
              aria-label={`${field.label} — посилання ${i + 1}`}
              placeholder="https://"
              value={row.url}
              onChange={(e) => update(i, { url: e.target.value })}
              className={fieldClass}
            />
            <input
              aria-label={`${field.label} — коментар ${i + 1}`}
              placeholder={field.notePlaceholder}
              value={row.note}
              onChange={(e) => update(i, { note: e.target.value })}
              className={fieldClass}
            />
            {rows.length > 1 && (
              <button
                type="button"
                aria-label={`Прибрати посилання ${i + 1}`}
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
                className="grid size-11 place-items-center justify-self-end rounded-full border border-white/14 bg-white/4 transition-colors hover:bg-white/10"
              >
                <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>
      {rows.length < MAX_LINKS && (
        <button
          type="button"
          onClick={() => onChange([...rows, { url: "", note: "" }])}
          className="self-start rounded-full px-1 text-[14px] leading-[1.3] text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime/60"
        >
          + Додати ще посилання
        </button>
      )}
    </div>
  );
}

/** Conditional field wrapper: opens smoothly, removed from the tab order while closed. */
function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-(--ease-smooth) ${show ? "grid-rows-[1fr] opacity-100" : "-mt-6 grid-rows-[0fr] opacity-0 md:-mt-7"}`}
      inert={!show}
    >
      <div className="min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

export function BriefForm() {
  const [answers, setAnswers] = useState<BriefAnswers>({});
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

  const set = (key: string, value: BriefAnswers[string]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (key === "name" || key === "contact") setErrors((e) => ({ ...e, [key]: undefined }));
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

  const goTo = (i: number) => setStep(Math.max(0, Math.min(LAST, i)));

  const validateContacts = (): Errors => {
    const found: Errors = {};
    if (str("name").trim().length < 2) found.name = "Вкажіть, будь ласка, ваше ім’я";
    const problem = contactError(str("contact"));
    if (problem) found.contact = problem;
    return found;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Enter in a field on steps 1–7 means "next", not "send"
    if (step < LAST) return goTo(step + 1);
    if (sending.current) return;

    const trap = readHoneypot(e.currentTarget);
    const found = validateContacts();
    setErrors(found);
    if (found.name || found.contact) {
      document.getElementById(found.name ? "brief-name" : "brief-contact")?.focus();
      return;
    }

    // only answers that are visible and filled in
    const payload: BriefAnswers = {};
    for (const s of briefSteps) {
      for (const f of s.fields) {
        let v = answers[f.key];
        if (f.type === "links" && Array.isArray(v)) v = (v as BriefLink[]).filter((l) => l.url.trim() || l.note.trim());
        if (isShown(f, answers) && hasAnswer(v)) payload[f.key] = v!;
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
    switch (f.type) {
      case "choice":
      case "multi":
        return <Chips field={f} value={answers[f.key] as string | string[] | undefined} onChange={(v) => set(f.key, v)} />;
      case "links":
        return <Links field={f} value={answers[f.key] as BriefLink[] | undefined} onChange={(v) => set(f.key, v)} />;
      case "textarea":
        return (
          <div className="flex min-w-0 flex-col gap-2.5">
            <Label field={f} htmlFor={inputId} />
            <Hint text={f.hint} />
            <textarea id={inputId} name={f.key} placeholder={f.placeholder} value={str(f.key)} onChange={(e) => set(f.key, e.target.value)} className={areaClass} />
          </div>
        );
      default: {
        const error = f.key === "name" || f.key === "contact" ? errors[f.key] : undefined;
        return (
          <div className="flex min-w-0 flex-col gap-2.5">
            <Label field={f} htmlFor={inputId} />
            <Hint text={f.hint} />
            <input
              id={inputId}
              name={f.key}
              type={f.type === "date" ? "date" : "text"}
              inputMode={f.type === "contact" ? "text" : undefined}
              autoComplete={f.type === "contact" ? "tel" : f.type === "text" ? (f.autoComplete ?? "off") : "off"}
              placeholder={f.type === "date" ? undefined : f.placeholder}
              value={str(f.key)}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={`${fieldClass} ${error ? "border-orange/80" : ""}`}
            />
            <ErrorText id={`${inputId}-error`} text={error} />
          </div>
        );
      }
    }
  };

  const progress = ((step + 1) / briefSteps.length) * 100;

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Бриф" className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Honeypot />

      {/* ---------- Active step ---------- */}
      <div ref={topRef} className="min-w-0 scroll-mt-6">
        <section
          aria-labelledby="brief-step-title"
          className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-[20px] min-[400px]:p-5 md:rounded-[36px] md:p-10 xl:p-12"
        >
          {/* Progress */}
          <div className="flex items-center justify-between gap-4 text-[13px] leading-none">
            <p className="font-display font-medium text-white/80" aria-live="polite">
              Крок <span className="text-lime">{step + 1}</span> із {briefSteps.length}
            </p>
            <p className="flex items-center gap-1.5 text-white/45">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 4.8V8l2.2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              ≈ 5 хвилин
            </p>
          </div>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Прогрес заповнення брифу"
            aria-valuemin={1}
            aria-valuemax={briefSteps.length}
            aria-valuenow={step + 1}
          >
            <div className="h-full rounded-full bg-lime transition-[width] duration-500 ease-(--ease-smooth)" style={{ width: `${progress}%` }} />
          </div>

          <div ref={bodyRef}>
            {/* Step title */}
            <header className="mt-8 flex items-start gap-4 md:mt-10 md:gap-5">
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

            {/* Fields */}
            <div className="mt-7 flex flex-col gap-6 md:mt-9 md:gap-7">
              {current.fields.map((f) =>
                f.showIf ? (
                  <Reveal key={f.key} show={isShown(f, answers)}>
                    {renderField(f)}
                  </Reveal>
                ) : (
                  <div key={f.key}>{renderField(f)}</div>
                ),
              )}
            </div>

            {step === LAST && (
              <p className="mt-7 text-[13px] leading-[1.55] font-[350] text-white/55">
                Перевірте відповіді — до будь-якого кроку можна повернутися. Натискаючи кнопку, ви погоджуєтесь з{" "}
                <a href={socialLinks.privacy} className="text-white/80 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white">
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
              className="pop-trigger flex h-[52px] items-center justify-between gap-3 rounded-full bg-lime pr-1.5 pl-4 font-display text-[14px] sm:h-[56px] sm:text-[15px] leading-none font-medium whitespace-nowrap text-ink-2 sm:gap-5 sm:pl-6 transition-[translate,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] disabled:opacity-70 md:h-[60px] md:pl-7"
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

      {/* ---------- Steps list (desktop) ---------- */}
      <aside aria-label="Кроки брифу" className="hidden lg:block">
        <div className="sticky top-8 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-[20px]">
          <ol className="flex flex-col gap-0.5">
            {briefSteps.map((s, i) => {
              const active = i === step;
              const filled = s.fields.some((f) => isShown(f, answers) && hasAnswer(answers[f.key]));
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[14px] leading-[1.3] transition-colors duration-300 ${
                      active ? "bg-white/8 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <span className={`font-pixel text-[10px] ${active ? "text-lime" : "text-white/35"}`}>{s.number}</span>
                    <span className="min-w-0 flex-1">{s.title}</span>
                    {filled && !active && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label="заповнено">
                        <path d="M3.5 8.3l2.8 2.8L12.5 5" stroke="#AEEE05" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-white/8 px-4 pt-3 text-[12px] leading-[1.5] text-white/40">Обов’язкові лише ім’я та контакт — решту заповнюйте за бажанням.</p>
        </div>
      </aside>
    </form>
  );
}
