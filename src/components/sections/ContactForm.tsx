"use client";

import { useState, type FormEvent } from "react";
import { budgets, directionById, projectTypes, type Budget, type LeadPreset, type ProjectType } from "@/data/leads";
import { socialLinks } from "@/data/navigation";
import { submitLead } from "@/lib/submitLead";
import { ArrowShot } from "@/components/ui/ArrowShot";

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

function validate(name: string, contact: string, question: boolean, message: string): Errors {
  const errors: Errors = {};
  if (!question && name.trim().length < 2) errors.name = "Вкажіть, будь ласка, ваше ім’я";
  if (question && message.trim().length < 3) errors.message = "Напишіть, будь ласка, ваше питання";
  const value = contact.trim();
  const isTelegram = /^@[\w\d_]{4,}$/.test(value);
  const isPhone = value.replace(/[^\d]/g, "").length >= 9 && /^[+\d\s()-]+$/.test(value);
  if (!isTelegram && !isPhone) errors.contact = "Вкажіть номер телефону або @нікнейм у Telegram";
  return errors;
}

const inputBase =
  "w-full rounded-[16px] border bg-white/4 text-[15px] leading-body text-white placeholder:text-white/45 outline-none transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/25 focus:border-lime/70 focus:bg-white/6 focus:shadow-[0_0_0_4px_rgba(174,238,5,0.08)]";

function Chip({
  selected,
  onClick,
  children,
  variant,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
  /** "type" / "budget" — the Contacts chips from Figma; "option" — popup service choice */
  variant: "type" | "budget" | "option";
}) {
  if (variant === "option") {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onClick}
        className={`flex h-[43px] flex-[1_1_auto] items-center justify-center rounded-full border px-4 text-[14px] leading-body whitespace-nowrap transition-[background-color,border-color,color] duration-300 ${
          selected ? "border-lime bg-lime text-ink-2" : "border-white/18 bg-white/4 text-white hover:border-white/35 hover:bg-white/8"
        }`}
      >
        {children}
      </button>
    );
  }
  // Figma: idle chips are 43px tall (1px border), the selected chip has no border and is 39px tall
  const pad = variant === "type" ? "px-[18px]" : "pr-[18px] pl-5";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-center rounded-full text-[14px] leading-body whitespace-nowrap transition-[background-color,border-color,color] duration-300 ${pad} ${
        selected ? "h-[39px] bg-lime text-ink-2" : "h-[43px] border border-white/18 bg-white/4 text-white hover:border-white/35 hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-1.5 pl-1 text-[12px] text-orange">
      {text}
    </p>
  );
}

type ContactFormProps = {
  /**
   * "section"  — the form in Contacts (as in Figma: project type + budget);
   * "modal"    — popup from a Services / Pricing card: titled after the service, user picks the concrete service;
   * "question" — popup from the FAQ card: question + contact
   */
  variant?: "section" | "modal" | "question";
  /** Popup: which service opened it (and an optional preselected option) */
  preset?: LeadPreset;
};

const POPUP_NOTE = "Залиште свою заявку, і ми зв’яжемося з вами протягом 15 хвилин.";

export function ContactForm({ variant = "section", preset = { direction: "web" } }: ContactFormProps) {
  const section = variant === "section";
  const question = variant === "question";
  const id = section ? "lead" : `modal-${variant}`;
  const service = directionById(preset.direction);

  const title = section ? "Залиште заявку" : question ? "Залишилися питання?" : (preset.title ?? service.popupTitle);
  const note = question ? "Задайте їх тут — ми відповімо протягом 15 хвилин." : POPUP_NOTE;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Лендінг");
  const [option, setOption] = useState<string | undefined>(preset.option);
  const [budget, setBudget] = useState<Budget>("$500–1500");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(name, contact, question, message);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    try {
      await submitLead(
        question
          ? { kind: "question", contact: contact.trim(), message: message.trim() }
          : section
            ? { kind: "lead", name: name.trim(), contact: contact.trim(), option: projectType, budget, message: message.trim() }
            : { kind: "lead", name: name.trim(), contact: contact.trim(), direction: title, option, message: message.trim() },
      );
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const box =
    "relative flex flex-col overflow-hidden rounded-[24px] border border-white/12 bg-white/5 px-5 pt-6 pb-[33px] backdrop-blur-[20px] md:rounded-[32px] md:pt-[37px] md:pr-[37px] md:pb-[35px] md:pl-[39px]";

  if (status === "sent") {
    return (
      <div className={`${box} min-h-[420px] items-start justify-center gap-5 ${section ? "md:min-h-[713px]" : ""}`} role="status">
        <span className="grid size-14 place-items-center rounded-full bg-lime">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display text-[20px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[24px]">
          {question ? "Дякуємо! Питання отримано" : "Дякуємо! Заявку отримано"}
        </p>
        <p className="max-w-[380px] text-[15px] leading-[1.55] text-white/70">Відповімо протягом 15 хвилин у робочий час.</p>
      </div>
    );
  }

  const nameField = (
    <div>
      <label htmlFor={`${id}-name`} className="sr-only">
        Ваше ім’я
      </label>
      <input
        id={`${id}-name`}
        name="name"
        autoComplete="name"
        placeholder="Ваше ім’я"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? `${id}-name-error` : undefined}
        className={`${inputBase} h-[54px] px-5 md:h-[60px] md:px-6 ${errors.name ? "border-orange/80" : "border-white/14"}`}
      />
      <FieldError id={`${id}-name-error`} text={errors.name} />
    </div>
  );

  const contactField = (
    <div>
      <label htmlFor={`${id}-contact`} className="sr-only">
        Телефон або @telegram
      </label>
      <input
        id={`${id}-contact`}
        name="contact"
        autoComplete="tel"
        placeholder={question ? "Ваш Telegram або телефон" : "Телефон або @telegram"}
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        aria-invalid={!!errors.contact}
        aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
        className={`${inputBase} h-[54px] px-5 md:h-[60px] md:px-6 ${errors.contact ? "border-orange/80" : "border-white/14"}`}
      />
      <FieldError id={`${id}-contact-error`} text={errors.contact} />
    </div>
  );

  const legendClass = "mb-3 font-display text-[12px] leading-display font-medium tracking-[0.06em] text-white/50 uppercase md:mb-4";

  return (
    <form noValidate onSubmit={onSubmit} className={`${box} gap-3.5 md:gap-4`} aria-label={title}>
      {section ? (
        <h3 className="font-display text-[20px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[24px]">{title}</h3>
      ) : (
        <div className="flex flex-col gap-2 pr-12">
          <h3 className="font-display text-[22px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[26px]">{title}</h3>
          <p className="text-[14px] leading-[1.5] text-balance text-white/65 md:text-[15px]">{note}</p>
        </div>
      )}

      {/* Popup: the concrete service comes first, the direction is already known from the card */}
      {variant === "modal" && (
        <fieldset className="mt-1">
          <legend className="sr-only">Що вас цікавить</legend>
          {/* two per row where both fit in full, otherwise one per row — labels never break */}
          <div role="radiogroup" aria-label="Що вас цікавить" className="flex flex-wrap gap-2 md:grid md:grid-cols-2">
            {service.options.map((o) => (
              <Chip key={o} variant="option" selected={option === o} onClick={() => setOption(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {!question && nameField}
      {contactField}

      {section && (
        <>
          <fieldset className="flex flex-col gap-3 md:gap-4">
            <legend className={legendClass}>Тип проєкту</legend>
            <div role="radiogroup" aria-label="Тип проєкту" className="flex flex-wrap items-start gap-2 md:max-w-[420px]">
              {projectTypes.map((t) => (
                <Chip key={t} variant="type" selected={projectType === t} onClick={() => setProjectType(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={legendClass}>Бюджет</legend>
            <div role="radiogroup" aria-label="Бюджет" className="flex flex-wrap items-start gap-2">
              {budgets.map((b) => (
                <Chip key={b} variant="budget" selected={budget === b} onClick={() => setBudget(b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <div>
        <label htmlFor={`${id}-message`} className="sr-only">
          {question ? "Ваше питання" : "Коротко про проєкт"}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          placeholder={question ? "Ваше питання" : "Коротко про проєкт"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={`${inputBase} block resize-none px-5 pt-[18px] md:px-6 md:pt-[21px] ${question ? "h-[140px] md:h-[150px]" : "h-[100px] md:h-[110px]"} ${
            errors.message ? "border-orange/80" : "border-white/14"
          }`}
        />
        <FieldError id={`${id}-message-error`} text={errors.message} />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="pop-trigger flex h-14 w-full items-center justify-between rounded-full bg-lime pr-1.5 pl-6 font-display text-[15px] leading-none font-medium text-ink-2 transition-[translate,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] disabled:opacity-70 md:h-[60px] md:pr-2 md:pl-[29px]"
      >
        {status === "sending" ? "Надсилаємо…" : question ? "Надіслати питання" : "Надіслати заявку"}
        <span className="relative grid h-11 w-[45px] place-items-center overflow-hidden rounded-full bg-ink-2 md:w-[46px]">
          {status === "sending" ? (
            <span className="size-4 animate-spin rounded-full border-2 border-lime border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowShot color="#AEEE05" />
          )}
        </span>
      </button>

      {status === "error" && (
        <p className="text-[13px] text-orange" role="alert">
          Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.
        </p>
      )}

      <p className="max-w-[205px] text-[11px] leading-body text-white/45 md:max-w-none md:text-[12px]">
        Натискаючи кнопку, ви погоджуєтесь з{" "}
        <a
          href={socialLinks.privacy}
          className="text-white/75 underline decoration-white/45 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
        >
          політикою конфіденційності
        </a>
        .
      </p>
    </form>
  );
}
