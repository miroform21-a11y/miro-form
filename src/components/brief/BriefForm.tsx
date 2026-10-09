"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitBrief } from "@/lib/submitBrief";
import { phoneError } from "@/lib/contact";
import { socialLinks } from "@/data/navigation";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { inputBase } from "@/components/ui/formStyles";
import { briefSections, options } from "@/data/brief";

type Answers = Record<string, string | string[]>;
type Errors = Partial<Record<"name" | "contact" | "email" | "phone", string>>;

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

const labelClass = "font-display text-[14px] leading-[1.35] font-medium text-white md:text-[15px]";
const hintClass = "text-[13px] leading-[1.5] font-[350] text-white/50";

function Field({ label, hint, htmlFor, wide, children, error }: { label: string; hint?: string; htmlFor?: string; wide?: boolean; children: ReactNode; error?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2.5 ${wide ? "md:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {hint && <p className={`-mt-1 ${hintClass}`}>{hint}</p>}
      {children}
      {error && <p className="pl-1 text-[12px] text-orange">{error}</p>}
    </div>
  );
}

/** Group of selectable chips (radio or checkbox semantics), same look as the site's form chips. */
function Choice({ label, hint, values, selected, onToggle, multi, wide = true }: { label: string; hint?: string; values: readonly string[]; selected: string | string[] | undefined; onToggle: (v: string) => void; multi?: boolean; wide?: boolean }) {
  const id = useId();
  const isOn = (v: string) => (Array.isArray(selected) ? selected.includes(v) : selected === v);
  return (
    <div role="group" aria-labelledby={id} className={`flex min-w-0 flex-col gap-3 ${wide ? "md:col-span-2" : ""}`}>
      <p id={id} className={labelClass}>
        {label}
        {multi && <span className="ml-2 font-body text-[12px] font-[350] text-white/40">можна кілька</span>}
      </p>
      {hint && <p className={`-mt-1.5 ${hintClass}`}>{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={isOn(v)}
            onClick={() => onToggle(v)}
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

/** Small reveal wrapper for fields that appear after a choice */
function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-smooth) md:col-span-2 ${show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={!show}>
      <div className="min-w-0 overflow-hidden">
        <div className="grid gap-5 pt-0.5 md:grid-cols-2">{children}</div>
      </div>
    </div>
  );
}

function Files({ label, files, onChange }: { label: string; files: File[]; onChange: (f: File[]) => void }) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
      <p className={labelClass}>{label}</p>
      <label
        htmlFor={id}
        className="group/drop flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 bg-white/3 px-5 py-7 text-center transition-colors duration-300 hover:border-lime/60 hover:bg-white/5"
      >
        <span className="grid size-11 place-items-center rounded-full bg-lime text-ink-2" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 13V4M5 8l4-4 4 4M3 14.5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-display text-[14px] font-medium text-white">Додати файли</span>
        <span className={hintClass}>Логотип, брендбук, фото, PDF — до 20 МБ кожен</span>
        <input
          id={id}
          type="file"
          multiple
          accept="image/*,.pdf,.zip,.rar,.ai,.eps,.psd,.fig,.svg,.doc,.docx,.ppt,.pptx"
          className="sr-only"
          onChange={(e) => {
            const picked = [...(e.target.files ?? [])].filter((f) => f.size <= 20 * 1024 * 1024);
            onChange([...files, ...picked]);
            e.target.value = "";
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex max-w-full items-center gap-2 rounded-full border border-white/14 bg-white/5 py-1.5 pr-1.5 pl-4 text-[13px] text-white/80">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                aria-label={`Прибрати ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-white/8 transition-colors hover:bg-white/16"
              >
                <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ index, children }: { index: number; children: ReactNode }) {
  const s = briefSections[index];
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-[20px] md:rounded-[36px] md:p-10 xl:p-12">
      <header className="mb-7 flex items-start gap-4 md:mb-10 md:gap-6">
        <span className="font-pixel text-[13px] leading-[1.9] text-lime md:text-[16px] md:leading-[2.2]">{s.number}</span>
        <h2 id={`${s.id}-title`} className="font-display text-[24px] leading-[1.15] font-semibold tracking-[-0.03em] text-white md:text-[36px]">
          {s.title}
        </h2>
      </header>
      <div className="grid gap-x-6 gap-y-7 md:grid-cols-2 md:gap-y-8">{children}</div>
    </section>
  );
}

/** Visual sub-group inside a section (e.g. "Ваші контакти" vs "Контакти компанії для сайту") */
function Group({ title, note, children, accent }: { title: string; note?: string; children: ReactNode; accent?: boolean }) {
  return (
    <div className={`grid gap-x-6 gap-y-6 rounded-[22px] border p-4 md:col-span-2 md:grid-cols-2 md:p-7 ${accent ? "border-lime/30 bg-lime/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="md:col-span-2">
        <h3 className="font-display text-[16px] leading-[1.3] font-semibold text-white md:text-[18px]">{title}</h3>
        {note && <p className={`mt-1.5 ${hintClass}`}>{note}</p>}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export function BriefForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({ mobile: "Так" });
  const [brandFiles, setBrandFiles] = useState<File[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const sending = useRef(false);
  const [active, setActive] = useState<string>(briefSections[0].id);

  const str = (k: string) => (typeof answers[k] === "string" ? (answers[k] as string) : "");
  const set = (k: string, v: string) => {
    setAnswers((a) => ({ ...a, [k]: v }));
    // an error disappears as soon as the field it points to is filled in
    setErrors((e) => {
      if (!e.name && !e.contact && !e.email && !e.phone) return e;
      const next = { ...e };
      if (k === "name") delete next.name;
      if (k === "email") delete next.email;
      if (k === "phone") delete next.phone;
      if ((k === "phone" || k === "telegram" || k === "email") && v.trim()) delete next.contact;
      return next;
    });
  };
  const pick = (k: string) => (v: string) => setAnswers((a) => ({ ...a, [k]: a[k] === v ? "" : v }));
  const toggle = (k: string) => (v: string) =>
    setAnswers((a) => {
      const list = Array.isArray(a[k]) ? (a[k] as string[]) : [];
      return { ...a, [k]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });
  const has = (k: string, v: string) => (Array.isArray(answers[k]) ? (answers[k] as string[]).includes(v) : answers[k] === v);

  // text input / textarea bound to an answer key
  const input = (k: string, props: { placeholder?: string; type?: string; autoComplete?: string; inputMode?: "tel" | "email" | "url" } = {}) => (
    <input
      id={`brief-${k}`}
      name={k}
      type={props.type ?? "text"}
      autoComplete={props.autoComplete ?? "off"}
      inputMode={props.inputMode}
      placeholder={props.placeholder}
      value={str(k)}
      onChange={(e) => set(k, e.target.value)}
      className={`${inputBase} h-[54px] border-white/14 px-5 [color-scheme:dark] md:h-[58px] md:px-6`}
    />
  );
  const area = (k: string, placeholder?: string, tall?: boolean) => (
    <textarea
      id={`brief-${k}`}
      name={k}
      placeholder={placeholder}
      value={str(k)}
      onChange={(e) => set(k, e.target.value)}
      className={`${inputBase} block resize-y border-white/14 px-5 pt-[16px] md:px-6 ${tall ? "min-h-[180px]" : "min-h-[110px]"}`}
    />
  );

  // highlight the section in view in the side navigation
  useEffect(() => {
    const els = briefSections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending.current) return;

    const found: Errors = {};
    if (str("name").trim().length < 2) found.name = "Вкажіть, будь ласка, ваше ім’я";
    if (!str("phone").trim() && !str("telegram").trim() && !str("email").trim()) found.contact = "Залиште хоча б один спосіб зв’язку: телефон, Telegram або email";
    if (str("email").trim() && !/^\S+@\S+\.\S+$/.test(str("email").trim())) found.email = "Перевірте, будь ласка, email";
    const phoneProblem = phoneError(str("phone"));
    if (phoneProblem) found.phone = phoneProblem;
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.getElementById(found.name ? "brief-name" : found.phone || found.contact ? "brief-phone" : "brief-email");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus({ preventScroll: true });
      return;
    }

    sending.current = true;
    setStatus("sending");
    try {
      // only non-empty answers
      const filled = Object.fromEntries(Object.entries(answers).filter(([, v]) => (Array.isArray(v) ? v.length : String(v).trim())));
      await submitBrief({ answers: filled, files: [...brandFiles, ...extraFiles] });
      router.push("/thank-you");
    } catch {
      sending.current = false;
      setStatus("error"); // everything typed stays in the form
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Бриф" className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,1fr)]">
      {/* Section navigation (desktop) */}
      <nav aria-label="Розділи брифу" className="hidden lg:block">
        <ol className="sticky top-8 flex flex-col gap-1">
          {briefSections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`flex items-baseline gap-3 rounded-full px-4 py-2.5 text-[14px] leading-[1.3] transition-colors duration-300 ${
                  active === s.id ? "bg-white/8 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                <span className={`font-pixel text-[10px] ${active === s.id ? "text-lime" : "text-white/35"}`}>{s.number}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex min-w-0 flex-col gap-4 md:gap-6">
        {/* 01 */}
        <Section index={0}>
          <Group title="Ваші контакти" note="Як нам з вами зв’язатися. Достатньо одного способу зв’язку." accent>
            <Field label="Ваше ім’я *" htmlFor="brief-name" error={errors.name} wide>
              {input("name", { autoComplete: "name", placeholder: "Як до вас звертатися" })}
            </Field>
            <Field label="Телефон" htmlFor="brief-phone" error={errors.phone}>
              {input("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "+380" })}
            </Field>
            <Field label="Telegram" htmlFor="brief-telegram">
              {input("telegram", { placeholder: "@username" })}
            </Field>
            <Field label="Email" htmlFor="brief-email" error={errors.email}>
              {input("email", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "name@company.com" })}
            </Field>
            {errors.contact && <p className="self-end pb-4 text-[12px] text-orange md:pl-1">{errors.contact}</p>}
          </Group>

          <Group title="Контактна інформація, яка має бути на сайті" note="Контакти компанії, які побачать відвідувачі майбутнього сайту.">
            <Field label="Телефон" htmlFor="brief-site_phone">
              {input("site_phone", { type: "tel", inputMode: "tel" })}
            </Field>
            <Field label="Email" htmlFor="brief-site_email">
              {input("site_email", { type: "email", inputMode: "email" })}
            </Field>
            <Field label="Соціальні мережі" htmlFor="brief-site_socials" wide>
              {input("site_socials", { placeholder: "Instagram, Facebook, TikTok — посилання або нікнейми" })}
            </Field>
            <Field label="Додаткова контактна інформація" htmlFor="brief-site_extra" wide>
              {area("site_extra", "Адреса, графік роботи, інші контакти")}
            </Field>
          </Group>

          <Field label="Повна назва компанії" htmlFor="brief-company" wide>
            {input("company", { autoComplete: "organization" })}
          </Field>
        </Section>

        {/* 02 */}
        <Section index={1}>
          <Choice label="Який тип проєкту вам потрібен?" values={options.projectType} selected={answers.project_type} onToggle={toggle("project_type")} multi />
          <Choice label="Скільки сторінок або розділів потрібно?" values={options.pages} selected={answers.pages} onToggle={pick("pages")} />
          <Field label="Сфера бізнесу: що ви продаєте або яку послугу надаєте?" htmlFor="brief-business" wide>
            {input("business", { placeholder: "Наприклад: приватний садочок, модульні будинки, оренда автомобілів" })}
          </Field>
          <Field label="Географія бренду / продукту" hint="Вкажіть місто, область або країну, на яку орієнтований бізнес." htmlFor="brief-geography">
            {input("geography")}
          </Field>
          <Field label="Які основні послуги або продукти ви надаєте?" hint="Перерахуйте через кому." htmlFor="brief-services">
            {input("services")}
          </Field>
          <Field label="Опишіть послугу або продукт, для якого створюється сайт" htmlFor="brief-product" wide>
            {area("product")}
          </Field>
          <Choice label="Чи потрібно вказувати ціни на сайті?" values={options.yesNo} selected={answers.prices} onToggle={pick("prices")} />
          <Reveal show={has("prices", "Так")}>
            <Field label="Вкажіть ціни або ціновий діапазон" htmlFor="brief-prices_details" wide>
              {area("prices_details")}
            </Field>
          </Reveal>
          <Field label="У чому головна перевага вашої послуги або продукту?" htmlFor="brief-advantage" wide>
            {area("advantage")}
          </Field>
          <Field label="Як відбувається надання послуги або продаж продукту?" hint="Опишіть основні етапи роботи з клієнтом." htmlFor="brief-process" wide>
            {area("process")}
          </Field>
          <Choice label="Чи будуть на сайті акції або спеціальні пропозиції?" values={options.yesNo} selected={answers.promo} onToggle={pick("promo")} />
          <Reveal show={has("promo", "Так")}>
            <Field label="Опишіть акції та пропозиції, які потрібно показати." htmlFor="brief-promo_details" wide>
              {area("promo_details")}
            </Field>
          </Reveal>
          <Field label="Розкажіть коротко про компанію" hint="Скільки років ви на ринку, чим займаєтесь, у чому ваша спеціалізація тощо." htmlFor="brief-about" wide>
            {area("about")}
          </Field>
          <Choice label="Як клієнти можуть оплачувати ваші послуги або продукти?" values={options.payment} selected={answers.payment} onToggle={toggle("payment")} multi />
          <Reveal show={has("payment", "Інше")}>
            <Field label="Який ще спосіб оплати?" htmlFor="brief-payment_other">
              {input("payment_other")}
            </Field>
          </Reveal>
        </Section>

        {/* 03 */}
        <Section index={2}>
          <Field label="Назвіть основні цілі створення сайту" htmlFor="brief-goals" wide>
            {area("goals")}
          </Field>
          <Choice label="Яку дію має виконати відвідувач сайту?" values={options.actions} selected={answers.actions} onToggle={toggle("actions")} multi />
          <Reveal show={has("actions", "Інше")}>
            <Field label="Яку саме дію?" htmlFor="brief-actions_other">
              {input("actions_other")}
            </Field>
          </Reveal>
          <Field label="Перерахуйте ваших прямих та непрямих конкурентів" hint="За бажанням" htmlFor="brief-competitors" wide>
            {area("competitors")}
          </Field>
          <Field label="Структура сайту: перерахуйте основні пункти навігаційного меню" hint="Наприклад: Головна / Про нас / Послуги / Переваги / Проєкти / Відгуки / FAQ / Контакти" htmlFor="brief-menu" wide>
            {area("menu")}
          </Field>
        </Section>

        {/* 04 */}
        <Section index={3}>
          <Choice label="Що має бути на сайті?" values={options.features} selected={answers.features} onToggle={toggle("features")} multi />
          <Reveal show={has("features", "Кілька мов")}>
            <Field label="Які мови потрібні?" htmlFor="brief-languages">
              {input("languages", { placeholder: "Наприклад: українська, англійська" })}
            </Field>
          </Reveal>
          <Reveal show={has("features", "Інше")}>
            <Field label="Що ще потрібно на сайті?" htmlFor="brief-features_other" wide>
              {input("features_other")}
            </Field>
          </Reveal>
          <Choice label="Чи потрібна адаптація сайту під мобільні пристрої?" hint="Рекомендуємо: більшість відвідувачів заходять з телефону." values={options.yesNo} selected={answers.mobile} onToggle={pick("mobile")} />
          <Choice label="Підтримка сайту: чи потрібна подальша підтримка?" values={options.support} selected={answers.support} onToggle={toggle("support")} multi />
          <Reveal show={has("support", "Інше")}>
            <Field label="Яка саме підтримка?" htmlFor="brief-support_other">
              {input("support_other")}
            </Field>
          </Reveal>
        </Section>

        {/* 05 */}
        <Section index={4}>
          <Choice label="У якому стані матеріали для сайту?" values={options.content} selected={answers.content} onToggle={pick("content")} />
          <Field label="Що саме вже підготовлено?" hint="Тексти, фото, відео, логотип тощо." htmlFor="brief-content_ready" wide>
            {area("content_ready")}
          </Field>

          <Group title="Приклади сайтів, які вам подобаються" note="Можна навести сайти з будь-якої сфери — нам важливі стиль, подача та логіка.">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid gap-3 md:col-span-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Field label={`Посилання ${i}`} htmlFor={`brief-like_${i}`}>
                  {input(`like_${i}`, { type: "url", inputMode: "url", placeholder: "https://" })}
                </Field>
                <Field label="Що саме вам подобається?" htmlFor={`brief-like_${i}_why`}>
                  {input(`like_${i}_why`)}
                </Field>
              </div>
            ))}
          </Group>

          <Group title="Приклади сайтів, які вам не подобаються" note="Можна навести сайти з будь-якої сфери — нам важливо зрозуміти, що саме вас відштовхує у стилі або логіці.">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid gap-3 md:col-span-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Field label={`Посилання ${i}`} htmlFor={`brief-dislike_${i}`}>
                  {input(`dislike_${i}`, { type: "url", inputMode: "url", placeholder: "https://" })}
                </Field>
                <Field label="Що саме вам не подобається?" htmlFor={`brief-dislike_${i}_why`}>
                  {input(`dislike_${i}_why`)}
                </Field>
              </div>
            ))}
          </Group>
        </Section>

        {/* 06 */}
        <Section index={5}>
          <Choice label="Чи є у вашої компанії фірмовий стиль, логотип та рекламні матеріали?" values={options.brand} selected={answers.brand} onToggle={toggle("brand")} multi />
          <Files label="За можливості прикладіть логотип, брендбук та інші матеріали." files={brandFiles} onChange={setBrandFiles} />
          <Choice label="Домен та хостинг" values={options.domain} selected={answers.domain} onToggle={pick("domain")} />
          <Reveal show={!!str("domain") && str("domain") !== "Нічого немає"}>
            <Field label="Домен або посилання на діючий сайт" htmlFor="brief-domain_url">
              {input("domain_url", { inputMode: "url", placeholder: "example.com" })}
            </Field>
          </Reveal>
        </Section>

        {/* 07 */}
        <Section index={6}>
          <Choice label="Коли потрібен результат?" values={options.deadline} selected={answers.deadline} onToggle={pick("deadline")} />
          <Reveal show={has("deadline", "До конкретної дати")}>
            <Field label="Оберіть дату" htmlFor="brief-deadline_date">
              {input("deadline_date", { type: "date" })}
            </Field>
          </Reveal>
          <Choice label="Орієнтовний бюджет" values={options.budget} selected={answers.budget} onToggle={pick("budget")} />
          <Reveal show={has("budget", "Інший бюджет")}>
            <Field label="Вкажіть бюджет" htmlFor="brief-budget_other">
              {input("budget_other")}
            </Field>
          </Reveal>
        </Section>

        {/* 08 */}
        <Section index={7}>
          <Field label="Що ще нам варто знати?" hint="Вкажіть усе, що, на вашу думку, може додатково допомогти нам краще зрозуміти ваш проєкт." htmlFor="brief-extra" wide>
            {area("extra", undefined, true)}
          </Field>
          <Files label="За необхідності додайте додаткові матеріали до брифу." files={extraFiles} onChange={setExtraFiles} />
        </Section>

        {/* Submit */}
        <div className="flex flex-col items-start gap-4 rounded-[28px] border border-lime/25 bg-lime/[0.04] p-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:rounded-[36px] md:p-10">
          <p className="max-w-[460px] text-[14px] leading-[1.55] font-[350] text-white/70 md:text-[15px]">
            Перевірте контакти — ми зв’яжемося з вами, щойно вивчимо бриф. Натискаючи кнопку, ви погоджуєтесь з{" "}
            <a href={socialLinks.privacy} className="text-white/85 underline decoration-white/45 underline-offset-2 transition-colors hover:text-white hover:decoration-white">
              політикою конфіденційності
            </a>
            .
          </p>
          <button
            type="submit"
            disabled={status === "sending"}
            className="pop-trigger flex h-16 w-full shrink-0 items-center justify-between gap-6 rounded-full bg-lime pr-2 pl-7 font-display text-[16px] leading-none font-medium text-ink-2 transition-[translate,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] disabled:opacity-70 md:h-[72px] md:w-auto md:min-w-[320px] md:pl-9 md:text-[18px]"
          >
            {status === "sending" ? "Надсилаємо бриф…" : "Надіслати бриф"}
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-full bg-ink-2 md:size-14">
              {status === "sending" ? (
                <span className="size-5 animate-spin rounded-full border-2 border-lime border-t-transparent" aria-hidden="true" />
              ) : (
                <ArrowShot color="#AEEE05" size={20} />
              )}
            </span>
          </button>
          {status === "error" && (
            <p className="text-[13px] text-orange md:basis-full" role="alert">
              Не вдалося надіслати бриф. Ваші відповіді збережені — спробуйте ще раз або напишіть нам у Telegram.
            </p>
          )}
          {(errors.name || errors.contact || errors.email || errors.phone) && (
            <p className="text-[13px] text-orange md:basis-full" role="alert">
              Заповніть, будь ласка, ім’я та хоча б один спосіб зв’язку в розділі «Загальна інформація».
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
