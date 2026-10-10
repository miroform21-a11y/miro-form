import type { Locale } from "@/i18n/locale";
import { SaveError, type ContentArea, type ContentRepository, type LoadResult } from "./repository";

/**
 * Demo store: keeps admin drafts in this browser's localStorage only.
 * Nothing is published to the site and nothing is kept on a server.
 *
 * Every entry carries the content schema version: when the shape of the content changes in code,
 * bump CONTENT_SCHEMA_VERSION so old drafts are reported as outdated instead of being silently mixed in.
 */
export const CONTENT_SCHEMA_VERSION = 1;

const KEY_PREFIX = "miroform-admin-demo";
export const storageKey = (area: ContentArea, locale: Locale) => `${KEY_PREFIX}:v${CONTENT_SCHEMA_VERSION}:${area}:${locale}`;

type Envelope = { schema: number; savedAt: string; data: unknown };

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    // access can throw (blocked site data) or the object can exist but be unusable
    const probe = `${KEY_PREFIX}:probe`;
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** A stored draft must at least have every top-level section of the defaults, each of the same kind. */
function hasShapeOf(data: unknown, defaults: object): data is Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const d = data as Record<string, unknown>;
  return Object.entries(defaults).every(([k, v]) => k in d && typeof d[k] === typeof v && Array.isArray(d[k]) === Array.isArray(v));
}

/** Older drafts written by a previous schema version, so the UI can mention them. */
function hasOutdatedEntry(area: ContentArea, locale: Locale, s: Storage) {
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k && k.startsWith(`${KEY_PREFIX}:v`) && k.endsWith(`:${area}:${locale}`) && k !== storageKey(area, locale)) return true;
  }
  return false;
}

export class LocalStorageContentRepository implements ContentRepository {
  readonly persistent = false;

  async load<T extends object>(area: ContentArea, locale: Locale, defaults: T): Promise<LoadResult<T>> {
    const s = storage();
    if (!s) return { data: defaults, source: "defaults", problem: "unavailable" };
    let raw: string | null;
    try {
      raw = s.getItem(storageKey(area, locale));
    } catch {
      return { data: defaults, source: "defaults", problem: "unavailable" };
    }
    if (raw === null) return { data: defaults, source: "defaults", problem: hasOutdatedEntry(area, locale, s) ? "outdated" : undefined };
    try {
      const env = JSON.parse(raw) as Envelope;
      if (!env || typeof env !== "object" || env.schema !== CONTENT_SCHEMA_VERSION) return { data: defaults, source: "defaults", problem: "outdated" };
      if (!hasShapeOf(env.data, defaults)) return { data: defaults, source: "defaults", problem: "corrupted" };
      return { data: env.data as T, source: "stored", savedAt: env.savedAt };
    } catch {
      return { data: defaults, source: "defaults", problem: "corrupted" };
    }
  }

  async save<T extends object>(area: ContentArea, locale: Locale, data: T): Promise<{ savedAt: string }> {
    const s = storage();
    if (!s) throw new SaveError("unavailable", "Хранилище браузера недоступно (приватный режим или запрет сохранения данных сайтов).");
    const savedAt = new Date().toISOString();
    const env: Envelope = { schema: CONTENT_SCHEMA_VERSION, savedAt, data };
    try {
      s.setItem(storageKey(area, locale), JSON.stringify(env));
    } catch (e) {
      const quota = e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
      throw quota
        ? new SaveError("quota", "В хранилище браузера закончилось место (лимит около 5 МБ). Данные не сохранены.")
        : new SaveError("unknown", "Не удалось записать данные в хранилище браузера.");
    }
    return { savedAt };
  }

  async clear(area: ContentArea, locale: Locale): Promise<void> {
    const s = storage();
    if (!s) return;
    try {
      // also drop drafts of older schema versions for this area and language
      const doomed: string[] = [];
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.startsWith(`${KEY_PREFIX}:v`) && k.endsWith(`:${area}:${locale}`)) doomed.push(k);
      }
      doomed.forEach((k) => s.removeItem(k));
    } catch {
      /* nothing to clear */
    }
  }
}
