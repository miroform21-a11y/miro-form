import { MAX_LINKS, MAX_SOCIALS, briefSteps, isShown, skipKey, stepErrors, type BriefAnswers, type BriefField, type BriefSiteContacts, type BriefValue } from "@/data/brief";
import { claimOnce, releaseClaim, withinRateLimit } from "@/lib/server/limits";
import { sendToTelegram, telegramConfigured } from "@/lib/server/telegram";
import { HttpError, assertSameOrigin, clientKey, isRecord, kyivTime, looksAutomated, readJson, reply, sha256, text } from "@/lib/server/http";

/**
 * The /brief wizard → validated against the same schema as the form (data/brief.ts) → Telegram.
 * Only known keys and listed options are accepted; hidden conditional answers are dropped;
 * required fields and the contact format are checked with the same rules as in the form.
 * Nothing is stored except short-lived hashed rate-limit / duplicate keys.
 */

const MAX_BODY = 32 * 1024;
const fields = briefSteps.flatMap((s) => s.fields);

/** One answer, or null when it does not fit the field (→ 400). Empty answers become undefined. */
function parseValue(field: BriefField, raw: unknown): BriefValue | undefined | null {
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
    case "multi": {
      if (!Array.isArray(raw) || raw.length > field.options.length) return null;
      if (!raw.every((v) => typeof v === "string" && field.options.includes(v))) return null;
      const list = [...new Set(raw as string[])];
      if (field.exclusive && list.includes(field.exclusive) && list.length > 1) return null; // "nothing yet" + materials
      return list.length ? list : undefined;
    }
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
    case "siteContacts": {
      if (!isRecord(raw) || !Array.isArray(raw.socials) || raw.socials.length > MAX_SOCIALS) return null;
      const phone = text(raw.phone, 100);
      const email = text(raw.email, 200);
      if (phone === null || email === null) return null;
      const socials = [];
      for (const item of raw.socials) {
        if (!isRecord(item)) return null;
        const name = text(item.name, 60);
        const url = text(item.url, 300);
        if (name === null || url === null) return null;
        if (name || url) socials.push({ name, url });
      }
      return phone || email || socials.length ? { phone, email, socials } : undefined;
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
    // one-click alternative ("Поки не маю побажань…")
    if ("skip" in field && field.skip && body.answers[skipKey(field)] === "1") answers[skipKey(field)] = "1";
  }
  // conditional answers whose trigger is not selected are dropped (they are hidden in the form)
  for (const field of fields) if (!isShown(field, answers)) delete answers[field.key];

  // required fields and the contact format — exactly as the form checks them before "Далі"
  if (briefSteps.some((s) => Object.keys(stepErrors(s, answers)).length > 0)) return null;
  return answers;
}

function formatValue(field: BriefField, answers: BriefAnswers): string | null {
  if ("skip" in field && field.skip && answers[skipKey(field)] === "1") return field.skip;
  const v = answers[field.key];
  if (v === undefined) return null;
  if (field.type === "links") {
    return "\n" + (v as { url: string; note: string }[]).map((l) => `   • ${[l.url, l.note].filter(Boolean).join(" — ")}`).join("\n");
  }
  if (field.type === "siteContacts") {
    const c = v as BriefSiteContacts;
    const lines = [c.phone && `   Телефон: ${c.phone}`, c.email && `   Email: ${c.email}`, ...c.socials.map((s) => `   ${s.name || "Соцмережа"}: ${s.url || "—"}`)];
    return "\n" + lines.filter(Boolean).join("\n");
  }
  const value = Array.isArray(v) ? (v as string[]).join(", ") : (v as string);
  return value.includes("\n") ? `\n${value}` : value;
}

function format(answers: BriefAnswers) {
  const blocks = briefSteps.map((s) => {
    const lines = s.fields
      .map((f) => {
        const value = formatValue(f, answers);
        return value === null ? "" : `▪️ ${f.label.replace(/\?$/, "")}: ${value}`; // "…сайт?: …" reads badly
      })
      .filter(Boolean);
    return lines.length ? `${s.number} · ${s.title}\n${lines.join("\n")}` : "";
  });

  return [
    "📋 Новий бриф з сайту MIROFORM",
    `👤 ${answers.name}\n📞 ${answers.contact}\n💬 ${answers.contact_method} · ${answers.contact_time}`,
    ...blocks.filter(Boolean),
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
