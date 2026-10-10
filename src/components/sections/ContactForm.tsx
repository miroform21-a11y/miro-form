"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { directionByIdFor, leadOptions, type LeadPreset } from "@/data/leads";
import { routes, type Locale } from "@/i18n/locale";
import { submitLead } from "@/lib/submitLead";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { inputBase, legendClass } from "@/components/ui/formStyles";
import { Honeypot, readHoneypot } from "@/components/ui/Honeypot";
import { contactError } from "@/lib/contact";

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

const copy = {
  uk: {
    nameError: "Вкажіть, будь ласка, ваше ім’я",
    messageError: "Напишіть, будь ласка, ваше питання",
    popupNote: "Залиште свою заявку, і ми зв’яжемося з вами протягом 15 хвилин.",
    sectionTitle: "Залиште заявку",
    questionTitle: "Залишилися питання?",
    questionNote: "Задайте їх тут — ми відповімо протягом 15 хвилин.",
    sentQuestion: "Дякуємо! Питання отримано",
    sentLead: "Дякуємо! Заявку отримано",
    sentNote: "Відповімо протягом 15 хвилин у робочий час.",
    name: "Ваше ім’я",
    contact: "Телефон або @telegram",
    contactQuestion: "Ваш Telegram або телефон",
    option: "Оберіть, що саме вас цікавить",
    projectType: "Тип проєкту",
    budget: "Бюджет",
    question: "Ваше питання",
    message: "Коротко про проєкт",
    sending: "Надсилаємо…",
    sendQuestion: "Надіслати питання",
    sendLead: "Надіслати заявку",
    error: "Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.",
    consent: "Натискаючи кнопку, ви погоджуєтесь з",
    privacy: "політикою конфіденційності",
  },
  en: {
    nameError: "Please enter your name",
    messageError: "Please type your question",
    popupNote: "Leave a request and we’ll get back to you within 15 minutes.",
    sectionTitle: "Send us a request",
    questionTitle: "Still have questions?",
    questionNote: "Ask them here — we’ll reply within 15 minutes.",
    sentQuestion: "Thank you! Question received",
    sentLead: "Thank you! Request received",
    sentNote: "We’ll reply within 15 minutes during business hours.",
    name: "Your name",
    contact: "Phone or @telegram",
    contactQuestion: "Your Telegram or phone",
    option: "Choose what you’re interested in",
    projectType: "Project type",
    budget: "Budget",
    question: "Your question",
    message: "Tell us briefly about your project",
    sending: "Sending…",
    sendQuestion: "Send question",
    sendLead: "Send request",
    error: "Couldn’t send. Please try again or message us on Telegram.",
    consent: "By clicking the button, you agree to our",
    privacy: "privacy policy",
  },
} satisfies Record<Locale, Record<string, string>>;

function validate(name: string, contact: string, question: boolean, message: string, locale: Locale): Errors {
  const errors: Errors = {};
  if (!question && name.trim().length < 2) errors.name = copy[locale].nameError;
  if (question && message.trim().length < 3) errors.message = copy[locale].messageError;
  const contactProblem = contactError(contact, locale);
  if (contactProblem) errors.contact = contactProblem;
  return errors;
}


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
        className={`flex min-h-[42px] min-w-0 items-center justify-center rounded-[21px] border px-2.5 py-1.5 text-center text-[13px] leading-[1.2] transition-[background-color,border-color,color] duration-300 md:min-h-[43px] md:px-4 md:text-[14px] ${
          selected ? "border-lime bg-lime text-ink-2" : "border-white/18 bg-white/4 text-white hover:border-white/35 hover:bg-white/8"
        }`}
      >
        {children.replace(/-/g, "\u2011")}
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
  locale?: Locale;
};

export function ContactForm({ variant = "section", preset = { direction: "web" }, locale = "uk" }: ContactFormProps) {
  const t = copy[locale];
  const { projectTypes, budgets, defaultBudget } = leadOptions[locale];
  const section = variant === "section";
  const question = variant === "question";
  const id = section ? "lead" : `modal-${variant}`;
  const service = directionByIdFor(locale, preset.direction);

  const title = section ? t.sectionTitle : question ? t.questionTitle : (preset.title ?? service.popupTitle);
  const note = question ? t.questionNote : t.popupNote;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [projectType, setProjectType] = useState<string>(projectTypes[0]);
  const [option, setOption] = useState<string | undefined>(preset.option);
  const [budget, setBudget] = useState<string>(defaultBudget);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const router = useRouter();
  const sending = useRef(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending.current) return;
    const trap = readHoneypot(e.currentTarget as HTMLFormElement);
    const found = validate(name, contact, question, message, locale);
    setErrors(found);
    if (Object.keys(found).length) return;

    sending.current = true;
    setStatus("sending");
    try {
      await submitLead(
        question
          ? { kind: "question", contact: contact.trim(), message: message.trim() }
          : section
            ? { kind: "lead", name: name.trim(), contact: contact.trim(), option: projectType, budget, message: message.trim() }
            : { kind: "lead", name: name.trim(), contact: contact.trim(), direction: title, option, message: message.trim() },
        trap,
        locale,
      );
      setStatus("sent");
      // only after the request succeeded
      const thankYou = routes[locale].thankYou;
      router.push(question ? `${thankYou}?type=question` : thankYou);
    } catch {
      sending.current = false;
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
          {question ? t.sentQuestion : t.sentLead}
        </p>
        <p className="max-w-[380px] text-[15px] leading-[1.55] text-white/70">{t.sentNote}</p>
      </div>
    );
  }

  const nameField = (
    <div>
      <label htmlFor={`${id}-name`} className="sr-only">
        {t.name}
      </label>
      <input
        id={`${id}-name`}
        name="name"
        autoComplete="name"
        placeholder={t.name}
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
        {t.contact}
      </label>
      <input
        id={`${id}-contact`}
        name="contact"
        autoComplete="tel"
        placeholder={question ? t.contactQuestion : t.contact}
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        aria-invalid={!!errors.contact}
        aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
        className={`${inputBase} h-[54px] px-5 md:h-[60px] md:px-6 ${errors.contact ? "border-orange/80" : "border-white/14"}`}
      />
      <FieldError id={`${id}-contact-error`} text={errors.contact} />
    </div>
  );

  return (
    <form noValidate onSubmit={onSubmit} className={`${box} gap-3.5 md:gap-4`} aria-label={title}>
      <Honeypot />
      {section ? (
        <h3 className="font-display text-[20px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[24px]">{title}</h3>
      ) : (
        <div className="flex flex-col gap-2 pr-12">
          <h3 className="font-display text-[22px] leading-display font-semibold tracking-[-0.01em] text-white md:text-[26px]">{title}</h3>
          <p className="text-[14px] leading-[1.5] text-balance text-white/65 md:text-[15px]">{note}</p>
        </div>
      )}

      {/* Popup: the concrete service comes first, the direction is already known from the card */}
      {!question && nameField}
      {contactField}

      {/* Popup: the direction is known from the card, the user picks the concrete service */}
      {variant === "modal" && (
        <fieldset>
          <legend className={legendClass}>{t.option}</legend>
          <div role="radiogroup" aria-label={t.option} className="grid grid-cols-2 gap-2">
            {service.options.map((o) => (
              <Chip key={o} variant="option" selected={option === o} onClick={() => setOption(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {section && (
        <>
          <fieldset className="flex flex-col gap-3 md:gap-4">
            <legend className={legendClass}>{t.projectType}</legend>
            <div role="radiogroup" aria-label={t.projectType} className="flex flex-wrap items-start gap-2 md:max-w-[420px]">
              {projectTypes.map((t) => (
                <Chip key={t} variant="type" selected={projectType === t} onClick={() => setProjectType(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={legendClass}>{t.budget}</legend>
            <div role="radiogroup" aria-label={t.budget} className="flex flex-wrap items-start gap-2">
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
          {question ? t.question : t.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          placeholder={question ? t.question : t.message}
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
        {status === "sending" ? t.sending : question ? t.sendQuestion : t.sendLead}
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
          {t.error}
        </p>
      )}

      <p className="max-w-[205px] text-[11px] leading-body text-white/45 md:max-w-none md:text-[12px]">
        {t.consent}{" "}
        <a
          href={routes[locale].privacy}
          className="text-white/75 underline decoration-white/45 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
        >
          {t.privacy}
        </a>
        .
      </p>
    </form>
  );
}
