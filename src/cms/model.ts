import { briefContent, siteContent } from "@/content";
import type { BriefContent, SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/locale";

/**
 * The CMS content model: the same objects as src/content (SiteContent / BriefContent per language), stored as one
 * JSON document per section. src/content stays the built-in source and the fallback of the site.
 */

export const LOCALES = ["uk", "en"] as const satisfies readonly Locale[];
export type Area = "site" | "brief";
export const AREAS = ["site", "brief"] as const;

export const SECTIONS: Record<Area, readonly string[]> = {
  site: Object.keys(siteContent.uk),
  brief: Object.keys(briefContent.uk),
};

/** Format version of documents and snapshots; bump with a migration when the shape of the content changes */
export const CMS_SCHEMA_VERSION = 1;

export type CmsSnapshot = { site: Record<Locale, SiteContent>; brief: Record<Locale, BriefContent> };

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** The built-in content as a snapshot (a deep copy, so nobody can mutate the module objects) */
export const sourceSnapshot = (): CmsSnapshot => clone({ site: siteContent, brief: briefContent });

export const defaultSection = (area: Area, locale: Locale, section: string): unknown =>
  clone((area === "site" ? (siteContent[locale] as Record<string, unknown>) : (briefContent[locale] as Record<string, unknown>))[section]);

export const isArea = (v: unknown): v is Area => v === "site" || v === "brief";
export const isLocale = (v: unknown): v is Locale => v === "uk" || v === "en";
export const isSection = (area: Area, s: unknown): s is string => typeof s === "string" && SECTIONS[area].includes(s);

/** Cheap structural check of a snapshot read back from the database */
export function looksLikeSnapshot(v: unknown): v is CmsSnapshot {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, Record<string, Record<string, unknown>>>;
  return AREAS.every((a) =>
    LOCALES.every((l) => {
      const doc = s[a]?.[l];
      return !!doc && typeof doc === "object" && SECTIONS[a].every((k) => doc[k] !== null && typeof doc[k] === "object");
    }),
  );
}
