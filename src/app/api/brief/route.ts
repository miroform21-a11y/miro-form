import { MAX_LINKS, MAX_SOCIALS, OTHER_NETWORK, SOCIAL_NETWORKS, briefSteps, isShown, sendErrors, skipKey, type BriefAnswers, type BriefField, type BriefValue } from "@/data/brief";
import { claimOnce, releaseClaim, withinRateLimit } from "@/lib/server/limits";
import { sendTelegramHtml, telegramConfigured } from "@/lib/server/telegram";
import { buildBriefMessages } from "@/lib/server/briefMessage";
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
      // "nothing yet" + real materials is contradictory ("turnkey" is independent of both)
      const independent = field.independent ?? [];
      if (field.exclusive && list.includes(field.exclusive) && list.some((v) => v !== field.exclusive && !independent.includes(v))) return null;
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
        if (!isRecord(item) || typeof item.network !== "string" || !(SOCIAL_NETWORKS as readonly string[]).includes(item.network)) return null;
        const name = item.network === OTHER_NETWORK ? text(item.name, 60) : ""; // a custom name only for "Інше"
        const url = text(item.url, 300);
        if (name === null || url === null) return null;
        if (name || url) socials.push({ network: item.network, name, url });
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

  // the final "Ваші контакти" step must be complete (name, valid phone / Telegram, method, time) —
  // the same check the form runs before sending; stars on other steps are hints only
  if (sendErrors(answers)) return null;
  return answers;
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

    if (!(await sendTelegramHtml(buildBriefMessages(answers, `${kyivTime()} (Київ)`)))) {
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
