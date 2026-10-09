import { createHash } from "node:crypto";
import { siteUrl } from "@/lib/seo";
import { checkContact } from "@/lib/contact";

/** Request rejected before it reaches Telegram; `status` goes to the client, never the reason. */
export class HttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

/** Every response is the same tiny shape — no internal details leave the server. */
export const reply = (status: number) => Response.json({ ok: status < 300 }, { status, headers: { "Cache-Control": "no-store" } });

// the site itself plus this project's own Vercel addresses (deployment, branch and production aliases)
const allowedOrigins = new Set(
  [
    new URL(siteUrl).origin,
    "https://miro-form.com",
    ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map((host) => `https://${host}`),
  ],
);

/** Browsers always send Origin on POST; anything else (other sites, bare scripts without it) is refused. Not a spam filter on its own. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new HttpError(403);
  if (allowedOrigins.has(origin)) return;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return;
  throw new HttpError(403);
}

/** Reads a JSON body without ever buffering more than `limit` bytes. */
export async function readJson(request: Request, limit: number): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new HttpError(415);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit) throw new HttpError(413);

  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new HttpError(413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400);
  }
}

/** Client IP as set by Vercel's edge; only ever stored hashed. */
export function clientKey(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return sha256(ip);
}

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/* ---------------- validation ---------------- */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Trimmed string without control characters; `null` when the value is not a string or longer than `max`. */
export function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max * 2) return null;
  const clean = value.replace(CONTROL_CHARS, "").trim();
  return clean.length > max ? null : clean;
}

/** Same rule as the site forms (src/lib/contact.ts): a phone number with 10+ digits or a Telegram username. */
export const isContact = (v: string) => checkContact(v) === "ok";

/**
 * Cheap bot signals sent by the form: a hidden honeypot field and the time since the page loaded.
 * A hit is answered with a normal success (so bots learn nothing) but never forwarded.
 */
export function looksAutomated(body: Record<string, unknown>) {
  const trap = body.trap;
  const elapsed = typeof body.t === "number" ? body.t : 0;
  return (typeof trap === "string" && trap.length > 0) || elapsed < 2500;
}

export const kyivTime = () => new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv", dateStyle: "short", timeStyle: "short" });
