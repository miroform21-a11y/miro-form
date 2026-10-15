import "server-only";

/**
 * Server-only configuration of the CMS. Values are never logged or sent to the browser; only "configured or not"
 * leaves this module.
 */

const read = (name: string) => {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
};

/** Admin login secrets; null when missing or too weak (the admin is then not served at all). */
export function adminSecrets(): { password: string; secret: string } | null {
  const password = read("ADMIN_PASSWORD");
  const secret = read("ADMIN_SESSION_SECRET");
  if (!password || password.length < 16 || !secret || secret.length < 32) return null;
  return { password, secret };
}

export type SupabaseConfig = { url: string; publishableKey: string; secretKey: string };

/** Supabase connection; null when not configured (the site then renders the built-in content from src/content). */
export function supabaseConfig(): SupabaseConfig | null {
  const url = read("SUPABASE_URL");
  const publishableKey = read("SUPABASE_PUBLISHABLE_KEY");
  const secretKey = read("SUPABASE_SECRET_KEY");
  if (!url || !publishableKey || !secretKey) return null;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url.replace(/\/$/, ""))) return null;
  return { url: url.replace(/\/$/, ""), publishableKey, secretKey };
}

/** Public reads only need the URL and the publishable key */
export function publicReadConfig(): { url: string; publishableKey: string } | null {
  const url = read("SUPABASE_URL");
  const publishableKey = read("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !publishableKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) return null;
  return { url: url.replace(/\/$/, ""), publishableKey };
}

export const PUBLIC_BUCKET = "cms-public";
export const DRAFTS_BUCKET = "cms-drafts";
