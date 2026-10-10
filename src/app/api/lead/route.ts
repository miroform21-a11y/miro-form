import { leadOptions } from "@/data/leads";
import { pricingByLocale } from "@/data/pricing";
import type { Locale } from "@/i18n/locale";
import { claimOnce, releaseClaim, withinRateLimit } from "@/lib/server/limits";
import { sendToTelegram, telegramConfigured } from "@/lib/server/telegram";
import { HttpError, assertSameOrigin, clientKey, isContact, isRecord, kyivTime, looksAutomated, readJson, reply, sha256, text } from "@/lib/server/http";

/**
 * Leads from the main page forms (Contacts section, service/pricing popups, FAQ question popup)
 * → validated here → Telegram. Nothing is stored except short-lived hashed rate-limit/duplicate keys.
 * The English site (/en) sends lang "en": its own option values are accepted and the message gets an "EN" mark.
 */

const MAX_BODY = 8 * 1024;

// The only values the forms of each language can send — anything else is rejected
function allowedFor(locale: Locale) {
  const { directions, projectTypes, budgets } = leadOptions[locale];
  const { plans, customPlan } = pricingByLocale[locale];
  return {
    options: new Set<string>([...projectTypes, ...directions.flatMap((d) => d.options)]),
    directions: new Set<string>([
      ...directions.map((d) => d.popupTitle),
      ...plans.map((p) => p.lead.title).filter((t): t is string => Boolean(t)),
      ...(customPlan.lead.title ? [customPlan.lead.title] : []),
    ]),
    budgets: new Set<string>(budgets),
  };
}
const allowed = { uk: allowedFor("uk"), en: allowedFor("en") };

/** Shown under the title of a lead that came from the English site */
const EN_MARK = "🇬🇧 EN-версія сайту";

type Lead = {
  kind: "lead" | "question";
  name: string;
  contact: string;
  direction: string;
  option: string;
  budget: string;
  message: string;
};

function parse(body: Record<string, unknown>, locale: Locale): Lead | null {
  const kind = body.kind;
  if (kind !== "lead" && kind !== "question") return null;

  const name = text(body.name, 80);
  const contact = text(body.contact, 40);
  const direction = text(body.direction, 60);
  const option = text(body.option, 60);
  const budget = text(body.budget, 20);
  const message = text(body.message, 3000);
  if ([name, contact, direction, option, budget, message].some((v) => v === null)) return null;

  const lead = { kind, name, contact, direction, option, budget, message } as Lead;
  if (!isContact(lead.contact)) return null;
  if (kind === "lead" && lead.name.length < 2) return null;
  if (kind === "question" && lead.message.length < 3) return null;
  if (lead.option && !allowed[locale].options.has(lead.option)) return null;
  if (lead.direction && !allowed[locale].directions.has(lead.direction)) return null;
  if (lead.budget && !allowed[locale].budgets.has(lead.budget)) return null;
  return lead;
}

function format(lead: Lead, locale: Locale) {
  const source = lead.kind === "question" ? "FAQ — питання" : lead.direction ? `Попап «${lead.direction}»` : "Форма «Контакти»";
  const fields = [
    `Джерело: ${source}`,
    lead.name && `Ім’я: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    lead.option && `${lead.direction ? "Послуга" : "Тип проєкту"}: ${lead.option}`,
    lead.budget && `Бюджет: ${lead.budget}`,
  ].filter(Boolean);
  return [
    lead.kind === "question" ? "❓ Нове питання з сайту MIROFORM" : "🟢 Нова заявка з сайту MIROFORM",
    locale === "en" && EN_MARK,
    fields.join("\n"),
    lead.message && `${lead.kind === "question" ? "Питання" : "Коментар"}:\n${lead.message}`,
    `🕒 ${kyivTime()} (Київ)`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await withinRateLimit("lead", clientKey(request), 5, 600))) return reply(429);

    const body = await readJson(request, MAX_BODY);
    if (!isRecord(body)) return reply(400);
    if (looksAutomated(body)) return reply(200); // silently dropped

    // the English forms say so; anything else is the Ukrainian site, exactly as before
    const locale: Locale = body.lang === "en" ? "en" : "uk";
    const lead = parse(body, locale);
    if (!lead) return reply(400);
    if (!telegramConfigured()) {
      console.error("[lead] Telegram is not configured — lead not delivered");
      return reply(503);
    }

    // the same lead resent within 10 minutes (double click, retry after a slow response) is delivered once
    const fingerprint = sha256(JSON.stringify(["lead", lead]));
    if (!(await claimOnce(fingerprint, 600))) return reply(200);

    if (!(await sendToTelegram(format(lead, locale)))) {
      await releaseClaim(fingerprint);
      return reply(502);
    }
    return reply(200);
  } catch (err) {
    if (err instanceof HttpError) return reply(err.status);
    console.error(`[lead] unexpected error: ${(err as Error).name}`);
    return reply(500);
  }
}
