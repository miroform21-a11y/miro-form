import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminSecrets } from "./env";
import { SESSION_COOKIE_NAMES, isSecureRequest, sessionCookie, verifySessionToken } from "./session";

/**
 * Data access layer: the one place that decides whether the current request is the admin.
 * Every Server Action and every admin page calls requireAdmin() / requireAdminPage() first; the Supabase
 * secret-key client can only be obtained with the AdminSession it returns (see supabase.ts).
 */

declare const verified: unique symbol;
/** Proof that the session cookie of this request was verified (cannot be constructed elsewhere) */
export type AdminSession = { readonly sid: string; readonly expiresAt: number; readonly [verified]: true };

export class AdminAuthError extends Error {
  constructor() {
    super("unauthorized");
  }
}

async function readSession(): Promise<AdminSession | null> {
  const secrets = adminSecrets();
  if (!secrets) return null;
  const jar = await cookies();
  const secure = isSecureRequest(await headers());
  // over HTTPS only the __Host- cookie counts, so a cookie planted without the prefix is ignored
  const name = sessionCookie(secure).name;
  const payload = verifySessionToken(jar.get(name)?.value, secrets.secret, secrets.password);
  if (!payload) return null;
  return { sid: payload.sid, expiresAt: payload.exp * 1000 } as AdminSession;
}

/** For Server Actions / route handlers: throws AdminAuthError when the request is not the admin */
export async function requireAdmin(): Promise<AdminSession> {
  const s = await readSession();
  if (!s) throw new AdminAuthError();
  return s;
}

/** For admin pages: sends the visitor to the login page */
export async function requireAdminPage(): Promise<AdminSession> {
  const s = await readSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function isAdmin() {
  return (await readSession()) !== null;
}

/**
 * Expires both session cookies. A bare delete() omits Secure, and browsers ignore a Set-Cookie for a "__Host-"
 * name without it, so the expiry repeats the flags the cookie was set with.
 */
export async function clearSessionCookies() {
  const jar = await cookies();
  for (const name of SESSION_COOKIE_NAMES) {
    jar.set(name, "", { httpOnly: true, secure: name.startsWith("__Host-"), sameSite: "strict", path: "/", maxAge: 0 });
  }
}
