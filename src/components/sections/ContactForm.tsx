"use client";

import { useState, type FormEvent } from "react";
import { budgets, projectTypes, type Budget, type ProjectType } from "@/data/pricing";
import { socialLinks } from "@/data/navigation";
import { submitLead } from "@/lib/submitLead";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

type Errors = Partial<Record<"name" | "contact", string>>;

function validate(name: string, contact: string): Errors {
  const errors: Errors = {};
  if (name.trim().length < 2) errors.name = "Вкажіть, будь ласка, ваше ім’я";
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
  variant: "type" | "budget";
}) {
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

type ContactFormProps = {
  /** "modal" — the popup opened from the pricing cards: no budget field */
  variant?: "section" | "modal";
  /** Preselected project type (still editable by the user) */
  initialType?: ProjectType;
};

export function ContactForm({ variant = "section", initialType = "Лендінг" }: ContactFormProps) {
  const modal = variant === "modal";
  const id = modal ? "modal-lead" : "lead";
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>(initialType);
  const [budget, setBudget] = useState<Budget>("$500–1500");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(name, contact);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    try {
      await submitLead({ name: name.trim(), contact: contact.trim(), projectType, budget: modal ? undefined : budget, message: message.trim() });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const box =
    "relative flex flex-col overflow-hidden rounded-[24px] border border-white/12 bg-white/5 px-5 pt-6 pb-[33px] backdrop-blur-[20px] md:rounded-[32px] md:pt-[37px] md:pr-[37px] md:pb-[35px] md:pl-[39px]";

  if (status === "sent") {
    return (
      <div className={`${box} min-h-[420px] items-start justify-center gap-5 ${modal ? "" : "md:min-h-[713px]"}`} role="status">
        <span className="grid size-14 place-items-center rounded-full bg-lime">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display text-[20px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[24px]">Дякуємо! Заявку отримано</p>
        <p className="max-w-[380px] text-[15px] leading-[1.55] text-white/70">Відповімо протягом 15 хвилин у робочий час.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={`${box} gap-3.5 md:gap-4`} aria-label="Залиште заявку">
      <h3 className="font-display text-[20px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[24px]">Залиште заявку</h3>

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
        {errors.name && (
          <p id={`${id}-name-error`} className="mt-1.5 pl-1 text-[12px] text-orange">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-contact`} className="sr-only">
          Телефон або @telegram
        </label>
        <input
          id={`${id}-contact`}
          name="contact"
          autoComplete="tel"
          placeholder="Телефон або @telegram"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          aria-invalid={!!errors.contact}
          aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
          className={`${inputBase} h-[54px] px-5 md:h-[60px] md:px-6 ${errors.contact ? "border-orange/80" : "border-white/14"}`}
        />
        {errors.contact && (
          <p id={`${id}-contact-error`} className="mt-1.5 pl-1 text-[12px] text-orange">
            {errors.contact}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3 md:gap-4">
        <legend className="mb-3 font-display text-[12px] leading-display font-medium tracking-[0.06em] text-white/50 uppercase md:mb-4">
          Тип проєкту
        </legend>
        <div role="radiogroup" aria-label="Тип проєкту" className="flex flex-wrap items-start gap-2 md:max-w-[420px]">
          {projectTypes.map((t) => (
            <Chip key={t} variant="type" selected={projectType === t} onClick={() => setProjectType(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </fieldset>

      {!modal && (
      <fieldset>
        <legend className="mb-3 font-display text-[12px] leading-display font-medium tracking-[0.06em] text-white/50 uppercase md:mb-4">
          Бюджет
        </legend>
        <div role="radiogroup" aria-label="Бюджет" className="flex flex-wrap items-start gap-2">
          {budgets.map((b) => (
            <Chip key={b} variant="budget" selected={budget === b} onClick={() => setBudget(b)}>
              {b}
            </Chip>
          ))}
        </div>
      </fieldset>
      )}

      <div>
        <label htmlFor={`${id}-message`} className="sr-only">
          Коротко про проєкт
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          placeholder="Коротко про проєкт"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputBase} block h-[100px] resize-none border-white/14 px-5 pt-[18px] md:h-[110px] md:px-6 md:pt-[21px]`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="group/submit flex h-14 w-full items-center justify-between rounded-full bg-lime pr-1.5 pl-6 font-display text-[15px] leading-none font-medium text-ink-2 transition-[translate,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] disabled:opacity-70 md:h-[60px] md:pr-2 md:pl-[29px]"
      >
        {status === "sending" ? "Надсилаємо…" : "Надіслати заявку"}
        <span className="grid h-11 w-[45px] place-items-center rounded-full bg-ink-2 md:w-[46px]">
          {status === "sending" ? (
            <span className="size-4 animate-spin rounded-full border-2 border-lime border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowIcon color="#AEEE05" className="transition-transform duration-400 ease-(--ease-smooth) group-hover/submit:rotate-45" />
          )}
        </span>
      </button>

      {status === "error" && (
        <p className="text-[13px] text-orange" role="alert">
          Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у Telegram.
        </p>
      )}

      <p className="max-w-[205px] text-[11px] leading-body text-white/40 md:max-w-none md:text-[12px]">
        Натискаючи кнопку, ви погоджуєтесь з{" "}
        <a href={socialLinks.privacy} className="underline-offset-2 transition-colors hover:text-white/70 hover:underline">
          політикою конфіденційності
        </a>
        .
      </p>
    </form>
  );
}
