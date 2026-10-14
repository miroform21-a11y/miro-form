import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AdminSession } from "./dal";
import { supabaseConfig } from "./env";

/**
 * The secret-key (service_role) client. It bypasses RLS, so it is only handed out against a verified AdminSession:
 * a call site that skipped requireAdmin() does not compile. It never leaves the server ("server-only").
 */

let client: SupabaseClient | null = null;

export class CmsNotConfiguredError extends Error {
  constructor() {
    super("cms not configured");
  }
}

function make(): SupabaseClient {
  const cfg = supabaseConfig();
  if (!cfg) throw new CmsNotConfiguredError();
  client ??= createClient(cfg.url, cfg.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

export function serviceClient(session: AdminSession): SupabaseClient {
  if (!session || session.expiresAt <= Date.now()) throw new Error("session expired");
  return make();
}

/**
 * Before login there is no session yet: the throttle needs exactly one function, so only that is exposed
 * (not the client).
 */
export async function takeLoginSlotRpc(key: string, windowSeconds: number, limit: number): Promise<boolean> {
  const { data, error } = await make().rpc("cms_take_login_slot", { p_key: key, p_window_seconds: windowSeconds, p_limit: limit });
  if (error) throw new Error("login throttle unavailable");
  return data === true;
}
