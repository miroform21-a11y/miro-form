import type { Locale } from "@/i18n/locale";

/**
 * Where the admin keeps edited content. The admin UI talks only to this interface:
 * today it is the browser demo store (local-storage-repository.ts), later a server store (Supabase)
 * can implement the same methods without rewriting the UI.
 */

/** "site" — the public site sections, "brief" — the /brief page, wizard texts and questions */
export type ContentArea = "site" | "brief";

export type LoadProblem =
  /** stored data could not be parsed or has the wrong shape — defaults are shown instead */
  | "corrupted"
  /** stored data belongs to an older content schema — defaults are shown instead */
  | "outdated"
  /** the storage itself is not available (private mode, blocked site data) */
  | "unavailable";

export type LoadResult<T> = {
  data: T;
  /** "stored" — a saved draft was found, "defaults" — the current site content */
  source: "stored" | "defaults";
  savedAt?: string;
  problem?: LoadProblem;
};

export class SaveError extends Error {
  constructor(
    public reason: "quota" | "unavailable" | "unknown",
    message: string,
  ) {
    super(message);
  }
}

export interface ContentRepository {
  /** false = demo: data never reaches the public site and is not kept on a server */
  readonly persistent: boolean;
  load<T extends object>(area: ContentArea, locale: Locale, defaults: T): Promise<LoadResult<T>>;
  /** Throws SaveError when the data cannot be stored */
  save<T extends object>(area: ContentArea, locale: Locale, data: T): Promise<{ savedAt: string }>;
  /** Removes the stored draft (the defaults are used again) */
  clear(area: ContentArea, locale: Locale): Promise<void>;
}
