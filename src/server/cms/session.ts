import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Admin session: a cookie with { issued, expires, random id } signed with HMAC-SHA256.
 * The signing key is derived from ADMIN_SESSION_SECRET *and* the password, so changing either one logs every
 * device out at once. No server-side session store is needed.
 */

export const SESSION_TTL_SECONDS = 12 * 60 * 60;
const VERSION = 1;

type Payload = { v: number; iat: number; exp: number; sid: string };

const b64 = (buf: Buffer) => buf.toString("base64url");

function signingKey(secret: string, password: string) {
  return createHmac("sha256", secret).update(`miroform-admin-session:v${VERSION}:`).update(createHash("sha256").update(password).digest()).digest();
}

export function createSessionToken(secret: string, password: string, now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload: Payload = { v: VERSION, iat, exp: iat + SESSION_TTL_SECONDS, sid: b64(randomBytes(16)) };
  const body = b64(Buffer.from(JSON.stringify(payload)));
  const mac = b64(createHmac("sha256", signingKey(secret, password)).update(body).digest());
  return `${body}.${mac}`;
}

/** Returns the payload of a valid, unexpired token; null for anything else (tampered, expired, old key, garbage). */
export function verifySessionToken(token: string | undefined, secret: string, password: string, now = Date.now()): Payload | null {
  if (!token || token.length > 512) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = createHmac("sha256", signingKey(secret, password)).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  let payload: Payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const t = Math.floor(now / 1000);
  if (payload.v !== VERSION || typeof payload.exp !== "number" || typeof payload.iat !== "number") return null;
  if (payload.exp <= t || payload.iat > t + 60 || payload.exp - payload.iat > SESSION_TTL_SECONDS) return null;
  return payload;
}

/** Constant-time password check (both sides hashed first, so lengths never leak) */
export function passwordMatches(input: string, password: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(password, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Cookie name and flags. Over HTTPS (Vercel) the "__Host-" prefix makes browsers refuse the cookie unless it is
 * Secure, host-only and Path=/. Plain http only happens on a local machine (next dev / next start).
 */
export function sessionCookie(secure: boolean) {
  return {
    name: secure ? "__Host-mf_admin" : "mf_admin",
    options: { httpOnly: true, secure, sameSite: "strict" as const, path: "/", maxAge: SESSION_TTL_SECONDS },
  };
}

export const SESSION_COOKIE_NAMES = ["__Host-mf_admin", "mf_admin"] as const;

/** Whether the request came over HTTPS: Vercel sets x-forwarded-proto itself; locally there is no proxy. */
export function isSecureRequest(headers: Headers) {
  if (process.env.VERCEL === "1") return true;
  return headers.get("x-forwarded-proto") === "https";
}

/**
 * Client IP for throttling. On Vercel the platform overwrites x-forwarded-for / x-real-ip, so they can be trusted
 * there; anywhere else they could be forged by the client, so all requests share one key.
 */
export function clientIp(headers: Headers) {
  if (process.env.VERCEL !== "1") return "local";
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
