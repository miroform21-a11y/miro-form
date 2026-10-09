/**
 * Rate limiting and duplicate protection.
 *
 * Primary store: Upstash Redis over its REST API. The Vercel integration is connected with the
 * "STORAGE" prefix (STORAGE_REST_API_URL / STORAGE_REST_API_TOKEN); the default "KV" prefix and
 * Upstash's own names are accepted too, in case the integration is reconnected.
 * Without it — or if Redis is unreachable — a per-instance in-memory fallback is used, which is
 * weaker on serverless (several instances) but keeps the forms working.
 */

const env = (...names: string[]) => names.map((n) => process.env[n]).find(Boolean);
const redisUrl = env("STORAGE_REST_API_URL", "STORAGE_KV_REST_API_URL", "KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
const redisToken = env("STORAGE_REST_API_TOKEN", "STORAGE_KV_REST_API_TOKEN", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN");

type RedisResult = { result?: unknown; error?: string };

/** TEMP diagnostics: which store answered the last check (exposed as a response header for verification). */
export let lastStore: "redis" | "memory" | "none" = "none";

async function redis(commands: (string | number)[][]): Promise<RedisResult[] | null> {
  lastStore = "memory";
  if (!redisUrl || !redisToken) {
    lastStore = "none";
    return null;
  }
  try {
    const res = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
      // every argument as a string, as the REST API documents
      body: JSON.stringify(commands.map((c) => c.map(String))),
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[limits] redis responded ${res.status}, using memory fallback`);
      return null;
    }
    const data = (await res.json()) as RedisResult[];
    if (data.some((r) => r.error)) {
      console.warn("[limits] redis command error, using memory fallback");
      return null;
    }
    lastStore = "redis";
    return data;
  } catch (err) {
    console.warn(`[limits] redis unavailable (${(err as Error).name}), using memory fallback`);
    return null;
  }
}

/* ---------- in-memory fallback ---------- */

const memory = new Map<string, { value: number; expires: number }>();

function memoryGet(key: string) {
  const hit = memory.get(key);
  if (hit && hit.expires > Date.now()) return hit;
  memory.delete(key);
  return undefined;
}

function memorySet(key: string, value: number, ttlSec: number) {
  if (memory.size > 5000) memory.clear(); // never grows unbounded
  memory.set(key, { value, expires: Date.now() + ttlSec * 1000 });
}

/* ---------- public API ---------- */

/** true while `id` has made fewer than `max` requests in the current `windowSec` window. */
export async function withinRateLimit(scope: string, id: string, max: number, windowSec: number): Promise<boolean> {
  const key = `mf:rl:${scope}:${id}`;
  const res = await redis([
    ["SET", key, 0, "EX", windowSec, "NX"],
    ["INCR", key],
  ]);
  if (res) return Number(res[1].result) <= max;

  const hit = memoryGet(key);
  const count = (hit?.value ?? 0) + 1;
  if (hit) hit.value = count;
  else memorySet(key, count, windowSec);
  return count <= max;
}

/** Claims `fingerprint` for `ttlSec`; false if the very same submission was already accepted. */
export async function claimOnce(fingerprint: string, ttlSec: number): Promise<boolean> {
  const key = `mf:dup:${fingerprint}`;
  const res = await redis([["SET", key, 1, "EX", ttlSec, "NX"]]);
  if (res) return res[0].result === "OK";

  if (memoryGet(key)) return false;
  memorySet(key, 1, ttlSec);
  return true;
}

/** Frees a claim when delivery failed, so the visitor can retry the same submission. */
export async function releaseClaim(fingerprint: string) {
  const key = `mf:dup:${fingerprint}`;
  memory.delete(key);
  await redis([["DEL", key]]);
}
