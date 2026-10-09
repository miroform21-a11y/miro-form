import { MAX_LINKS, briefSteps, contactFieldError, isShown, type BriefAnswers, type BriefField } from "@/data/brief";
import { claimOnce, releaseClaim, withinRateLimit } from "@/lib/server/limits";
import { sendToTelegram, telegramConfigured } from "@/lib/server/telegram";
import { HttpError, assertSameOrigin, clientKey, isRecord, kyivTime, looksAutomated, readJson, reply, sha256, text } from "@/lib/server/http";

/**
 * The /brief wizard → validated against the same schema as the form (data/brief.ts) → Telegram.
 * Only known keys and listed options are accepted; hidden conditional answers are dropped.
 * Every question is optional; a filled-in contact must be a valid phone / Telegram, and an empty brief is refused.
 * Nothing is stored except short-lived hashed rate-limit / duplicate keys.
 */

const MAX_BODY = 32 * 1024;
const fields = briefSteps.flatMap((s) => s.fields);

/** One answer, or null when it does not fit the field (→ 400). Empty answers become undefined. */
function parseValue(field: BriefField, raw: unknown): string | string[] | { url: string; note: string }[] | undefined | null {
  if (raw === undefined || raw === null || raw === "") return undefined;
  switch (field.type) {
    case "text":
    case "contact":
    case "textarea": {
      const v = text(raw, field.type === "textarea" ? 3000 : 300);
      return v === null ? null : v || undefined;
    }
    case "choice":
      return typeof raw === "string" && field.options.includes(raw) ? raw : null;
    case "multi":
      if (!Array.isArray(raw) || raw.length > field.options.length) return null;
      if (!raw.every((v) => typeof v === "string" && field.options.includes(v))) return null;
      return raw.length ? [...new Set(raw as string[])] : undefined;
    case "links": {
      if (!Array.isArray(raw) || raw.length > MAX_LINKS) return null;
      const links = [];
      for (const item of raw) {
        if (!isRecord(item)) return null;
        const url = text(item.url, 300);
        const note = text(item.note, 300);
        if (url === null || note === null) return null;
        if (url || note) links.push({ url, note });
      }
      return links.length ? links : undefined;
    }
  }
}

function parse(body: Record<string, unknown>): BriefAnswers | null {
  if (!isRecord(body.answers)) return null;
  const answers: BriefAnswers = {};
  for (const field of fields) {
    const value = parseValue(field, body.answers[field.key]);
    if (value === null) return null;
    if (value !== undefined) answers[field.key] = value;
  }
  // conditional answers whose trigger is not selected are dropped (they are hidden in the form)
  for (const field of fields) if (!isShown(field, answers)) delete answers[field.key];

  if (!Object.keys(answers).length) return null; // nothing answered at all
  if (contactFieldError(answers)) return null; // same rule as the form and the main site forms
  return answers;
}

function format(answers: BriefAnswers) {
  const blocks = briefSteps
    .filter((s) => s.id !== "contacts")
    .map((s) => {
      const lines = s.fields
        .filter((f) => answers[f.key] !== undefined)
        .map((f) => {
          const v = answers[f.key];
          const label = f.label.replace(/\?$/, ""); // "Тип сайту?: …" reads badly
          if (f.type === "links") {
            const items = (v as { url: string; note: string }[]).map((l) => `   • ${[l.url, l.note].filter(Boolean).join(" — ")}`);
            return `▪️ ${label}:\n${items.join("\n")}`;
          }
          const value = Array.isArray(v) ? (v as string[]).join(", ") : (v as string);
          return `▪️ ${label}: ${value.includes("\n") ? `\n${value}` : value}`;
        });
      return lines.length ? `${s.number} · ${s.title}\n${lines.join("\n")}` : "";
    })
    .filter(Boolean);

  return [
    "📋 Новий бриф з сайту MIROFORM",
    `👤 ${answers.name ?? "ім’я не вказано"}\n📞 ${answers.contact ?? "контакт не вказано"}`,
    ...blocks,
    `🕒 ${kyivTime()} (Київ)`,
  ].join("\n\n");
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await withinRateLimit("brief", clientKey(request), 3, 600))) return reply(429);

    const body = await readJson(request, MAX_BODY);
    if (!isRecord(body)) return reply(400);
    if (looksAutomated(body)) return reply(200); // silently dropped

    const answers = parse(body);
    if (!answers) return reply(400);
    if (!telegramConfigured()) {
      console.error("[brief] Telegram is not configured — brief not delivered");
      return reply(503);
    }

    // the same brief resent within 10 minutes (double click, retry after a slow response) is delivered once
    const fingerprint = sha256(JSON.stringify(["brief", answers]));
    if (!(await claimOnce(fingerprint, 600))) return reply(200);

    if (!(await sendToTelegram(format(answers)))) {
      await releaseClaim(fingerprint);
      return reply(502);
    }
    return reply(200);
  } catch (err) {
    if (err instanceof HttpError) return reply(err.status);
    console.error(`[brief] unexpected error: ${(err as Error).name}`);
    return reply(500);
  }
}
