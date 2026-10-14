import "server-only";
import { createHash } from "node:crypto";
import { supabaseConfig } from "./env";
import { takeLoginSlotRpc } from "./supabase";

/**
 * Login throttling shared by all server instances (a row per key and 15-minute window in Postgres, incremented
 * atomically before the password is even compared, so parallel attempts cannot slip through).
 *   - per client IP: 5 attempts / 15 min
 *   - in total:     60 attempts / 15 min (an attacker rotating IPs; the owner may then wait out the window)
 * Without Supabase: an in-memory counter in development, and no login at all in production (fail closed).
 */

export const WINDOW_SECONDS = 15 * 60;
export const PER_IP_LIMIT = 5;
export const GLOBAL_LIMIT = 60;

const memory = new Map<string, { n: number; until: number }>();
function memoryTake(key: string, limit: number) {
  const now = Date.now();
  const hit = memory.get(key);
  const entry = hit && hit.until > now ? hit : { n: 0, until: now + WINDOW_SECONDS * 1000 };
  entry.n++;
  memory.set(key, entry);
  return entry.n <= limit;
}

export type SlotResult = "ok" | "limited" | "unavailable";

export async function takeLoginSlot(ip: string): Promise<SlotResult> {
  const ipKey = "ip:" + createHash("sha256").update(ip).digest("hex");
  if (!supabaseConfig()) {
    if (process.env.NODE_ENV === "production") return "unavailable";
    return memoryTake(ipKey, PER_IP_LIMIT) && memoryTake("global", GLOBAL_LIMIT) ? "ok" : "limited";
  }
  try {
    // both counters are always incremented, so a limited IP still counts towards the global limit
    const [perIp, global] = await Promise.all([takeLoginSlotRpc(ipKey, WINDOW_SECONDS, PER_IP_LIMIT), takeLoginSlotRpc("global", WINDOW_SECONDS, GLOBAL_LIMIT)]);
    return perIp && global ? "ok" : "limited";
  } catch {
    return "unavailable";
  }
}
