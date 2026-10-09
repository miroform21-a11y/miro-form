import { briefSteps, skipKey, type BriefAnswers, type BriefField, type BriefLink, type BriefSiteContacts } from "@/data/brief";

/**
 * Telegram message for a brief (parse_mode "HTML"): five sections with bold headings and field names,
 * user text escaped, empty fields and empty sections left out. Long briefs are split into several
 * messages between sections / fields (very long answers between words) — nothing is cut.
 */

/** Safe size of one message: Telegram allows 4096 characters of text; tags only add to the raw length. */
const MAX = 3800;

type Section = { title: string; keys: string[] };

const SECTIONS: Section[] = [
  { title: "Контакти", keys: ["name", "contact", "contact_method", "contact_handle", "contact_method_other", "contact_time", "contact_time_other"] },
  {
    title: "Деталі проєкту",
    keys: [
      "company",
      "site_contacts",
      "form_fields",
      "project_type",
      "project_type_other",
      "pages",
      "services",
      "business",
      "geography",
      "prices",
      "prices_details",
      "advantage",
      "process",
      "promo",
      "promo_details",
      "payment",
    ],
  },
  { title: "Цілі та функції сайту", keys: ["goals", "goals_other", "features", "languages", "features_other", "support"] },
  { title: "Стиль і матеріали", keys: ["likes", "dislikes", "design_wishes", "materials", "materials_other", "materials_wishes"] },
  { title: "Бюджет і терміни", keys: ["budget", "deadline", "deadline_date", "extra"] },
];

/** Short field names for reading on a phone (the form keeps its full questions). */
const LABELS: Record<string, string> = {
  name: "Ім’я",
  contact: "Телефон / Telegram",
  contact_method: "Спосіб зв’язку",
  contact_handle: "Username / посилання",
  contact_method_other: "Інший спосіб",
  contact_time: "Коли зв’язатися",
  contact_time_other: "Дата та час",
  company: "Компанія",
  site_contacts: "Контакти для сайту",
  form_fields: "Дані у формі на сайті",
  project_type: "Тип сайту",
  project_type_other: "Уточнення типу",
  pages: "Кількість сторінок",
  services: "Послуги / продукти",
  business: "Про бізнес",
  geography: "Географія",
  prices: "Ціни на сайті",
  prices_details: "Які ціни вказати",
  advantage: "Переваги",
  process: "Як відбувається замовлення",
  promo: "Акції",
  promo_details: "Опис акцій",
  payment: "Оплата",
  goals: "Мета сайту",
  goals_other: "Інша мета",
  features: "Функції",
  languages: "Мови",
  features_other: "Інші функції",
  support: "Підтримка після запуску",
  likes: "Сайти, які подобаються",
  dislikes: "Сайти, які не подобаються",
  design_wishes: "Побажання до дизайну",
  materials: "Матеріали",
  materials_other: "Інші матеріали",
  materials_wishes: "Побажання щодо матеріалів",
  budget: "Бюджет",
  deadline: "Термін запуску",
  deadline_date: "Дата / уточнення",
  extra: "Додатково",
};

const fieldsByKey = new Map(briefSteps.flatMap((s) => s.fields).map((f) => [f.key, f] as const));

// Any field missing from SECTIONS still reaches Telegram (in an extra section) — no answer is ever dropped
const unlisted = [...fieldsByKey.keys()].filter((k) => !SECTIONS.some((s) => s.keys.includes(k)));
const ALL_SECTIONS = unlisted.length ? [...SECTIONS, { title: "Інше", keys: unlisted }] : SECTIONS;

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const b = (s: string) => `<b>${escapeHtml(s)}</b>`;

/** Answer as escaped lines (one string per visual line), or null when the field is empty. */
function valueLines(field: BriefField, answers: BriefAnswers): string[] | null {
  if ("skip" in field && field.skip && answers[skipKey(field)] === "1") return [escapeHtml(field.skip)];
  const v = answers[field.key];
  if (v === undefined) return null;
  if (field.type === "links") {
    const links = (v as BriefLink[]).filter((l) => l.url.trim() || l.note.trim());
    return links.length ? links.map((l, i) => `${i + 1}. ${[l.url, l.note].filter(Boolean).map(escapeHtml).join(" — ")}`) : null;
  }
  if (field.type === "siteContacts") {
    const c = v as BriefSiteContacts;
    const lines = [
      c.phone && `Телефон: ${escapeHtml(c.phone)}`,
      c.email && `Email: ${escapeHtml(c.email)}`,
      ...c.socials.filter((s) => s.name || s.url).map((s) => `${escapeHtml(s.name || "Соцмережа")}: ${escapeHtml(s.url || "—")}`),
    ].filter(Boolean) as string[];
    return lines.length ? lines : null;
  }
  const text = Array.isArray(v) ? (v as string[]).join(", ") : (v as string);
  return text.trim() ? [text] : null; // plain text — escaped (and split if huge) by the caller
}

/** Splits raw text into escaped pieces of at most `max` characters, preferring line / word boundaries. */
function escapedChunks(raw: string, max: number): string[] {
  const chunks: string[] = [];
  let rest = raw;
  while (rest) {
    if (escapeHtml(rest).length <= max) {
      chunks.push(escapeHtml(rest));
      break;
    }
    // longest prefix whose escaped form fits
    let end = 0;
    let size = 0;
    while (end < rest.length) {
      const add = escapeHtml(rest[end]).length;
      if (size + add > max) break;
      size += add;
      end++;
    }
    const cut = Math.max(rest.lastIndexOf("\n", end), rest.lastIndexOf(" ", end));
    const at = cut > end * 0.6 ? cut : end;
    chunks.push(escapeHtml(rest.slice(0, at)));
    rest = rest.slice(at).replace(/^[ \n]/, "");
  }
  return chunks;
}

/** One field as one or more blocks (a block never exceeds the message budget). */
function fieldBlocks(field: BriefField, answers: BriefAnswers): string[] {
  const lines = valueLines(field, answers);
  if (!lines) return [];
  const label = LABELS[field.key] ?? field.label.replace(/\?$/, "");
  const isPlainText = !(field.type === "links" || field.type === "siteContacts") && !(answers[skipKey(field)] === "1");

  if (isPlainText) {
    const raw = lines[0];
    const short = raw.length <= 60 && !raw.includes("\n");
    if (short) return [`${b(label)}: ${escapeHtml(raw)}`];
    return escapedChunks(raw, MAX - 400).map((chunk, i) => `${b(i === 0 ? label : `${label} (продовження)`)}\n${chunk}`);
  }
  if (lines.length === 1 && lines[0].length <= 60 && field.type !== "links" && field.type !== "siteContacts") return [`${b(label)}: ${lines[0]}`];
  return [`${b(label)}\n${lines.join("\n")}`];
}

/** Builds the HTML message(s) for Telegram. */
export function buildBriefMessages(answers: BriefAnswers, sentAt: string): string[] {
  const PART = "\u0000PART\u0000";
  const title = `${b("Новий бриф · MIROFORM")}${PART}\n${escapeHtml(sentAt)}`;
  const who = [answers.name, answers.contact].filter((x): x is string => typeof x === "string" && !!x).map(escapeHtml).join(" · ");
  const continuation = `${b("Бриф · продовження")}${PART}${who ? `\n${who}` : ""}`;

  const messages: string[] = [];
  let current = title;
  const fits = (extra: string) => current.length + extra.length <= MAX;
  const startNew = () => {
    messages.push(current);
    current = continuation;
  };

  for (const section of ALL_SECTIONS) {
    const blocks = section.keys.flatMap((k) => {
      const f = fieldsByKey.get(k);
      return f ? fieldBlocks(f, answers) : [];
    });
    if (!blocks.length) continue; // empty sections are left out

    const heading = b(section.title.toUpperCase());
    // keep a heading together with its first field
    if (!fits(`\n\n${heading}\n${blocks[0]}`)) startNew();
    current += `\n\n${heading}`;
    for (const [i, block] of blocks.entries()) {
      // short "Field: answer" lines stay together; multi-line answers get some air around them
      const sep = i === 0 ? "\n" : block.includes("\n") || blocks[i - 1].includes("\n") ? "\n\n" : "\n";
      if (!fits(sep + block)) {
        startNew();
        current += `\n\n${b(`${section.title.toUpperCase()} (продовження)`)}`;
        current += `\n${block}`;
        continue;
      }
      current += sep + block;
    }
  }
  messages.push(current);

  const total = messages.length;
  return messages.map((m, i) => m.replace(PART, total > 1 ? escapeHtml(` · ${i + 1}/${total}`) : ""));
}
