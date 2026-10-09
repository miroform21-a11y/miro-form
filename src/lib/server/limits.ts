/**
 * Rate limiting and duplicate protection.
 *
 * Primary store: Upstash Redis over its REST API, configured by the Vercel integration as
 * <PREFIX>_REST_API_URL / <PREFIX>_REST_API_TOKEN (any prefix) or UPSTASH_REDIS_REST_URL / _TOKEN.
 * Without it — or if Redis is unreachable — a per-instance in-memory fallback is used, which is
 * weaker on serverless (several instances) but keeps the forms working.
 */

// whatever prefix the integration used: <PREFIX>_REST_API_URL + <PREFIX>_REST_API_TOKEN (or Upstash's own names)
const urlName = Object.keys(process.env).find((k) => /(^|_)REST_API_URL$/.test(k)) ?? "UPSTASH_REDIS_REST_URL";
const tokenName = urlName.endsWith("_REST_API_URL") ? urlName.replace(/_URL$/, "_TOKEN") : "UPSTASH_REDIS_REST_TOKEN";
const redisUrl = process.env[urlName];
const redisToken = process.env[tokenName];

type RedisResult = { result?: unknown; error?: string };

async function redis(commands: (string | number)[][]): Promise<RedisResult[] | null> {
  if (!redisUrl || !redisToken) return null;
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
