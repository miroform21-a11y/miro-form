import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/locale";
import type { BriefContent, SiteContent } from "@/content/types";
import { looksLikeSnapshot, sourceSnapshot, type CmsSnapshot } from "@/cms/model";
import { publicReadConfig } from "./env";

/**
 * What visitors see: the current publication, read with the publishable key through the one public database
 * function. The response is kept in Next's data cache under the tag below; publishing expires the tag
 * (updateTag), and a 10-minute revalidation is the safety net.
 *
 * Failures:
 *   - Supabase not configured, or no publication yet → the built-in content (src/content);
 *   - Supabase unreachable while a page regenerates → the error is thrown, so Next keeps serving the last good
 *     page instead of replacing published edits with the built-in content;
 *   - during `next build`, or for the form APIs (which must never lose a request) → the built-in content.
 */

export const CMS_PUBLISHED_TAG = "cms-published";
const REVALIDATE_SECONDS = 600;

export type Published = { snapshot: CmsSnapshot; publicationId: number | null; source: "cms" | "built-in" };

const builtIn = (): Published => ({ snapshot: sourceSnapshot(), publicationId: null, source: "built-in" });

async function fetchPublished(): Promise<Published> {
  const cfg = publicReadConfig();
  if (!cfg) return builtIn();
  const headers: Record<string, string> = { apikey: cfg.publishableKey, Accept: "application/json" };
  // legacy anon keys are JWTs and also go in Authorization; the new publishable keys only in apikey
  if (cfg.publishableKey.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.publishableKey}`;
  const res = await fetch(`${cfg.url}/rest/v1/rpc/cms_get_published`, {
    headers,
    next: { tags: [CMS_PUBLISHED_TAG], revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`cms: published content request failed (${res.status})`);
  const body = (await res.json()) as { id?: number; snapshot?: unknown } | null;
  if (!body || !body.snapshot) return builtIn(); // nothing published yet
  if (!looksLikeSnapshot(body.snapshot)) throw new Error("cms: published snapshot has an unexpected shape");
  return { snapshot: body.snapshot, publicationId: body.id ?? null, source: "cms" };
}

const duringBuild = () => process.env.NEXT_PHASE === "phase-production-build";

/** For pages: throws when the database is unreachable (keeps the last good page), except during the build */
export const getPublished = cache(async (): Promise<Published> => {
  try {
    return await fetchPublished();
  } catch (err) {
    if (duringBuild()) {
      console.warn(`[cms] ${(err as Error).message} — building with the built-in content`);
      return builtIn();
    }
    throw err;
  }
});

/** For the form APIs: never throws */
export async function getPublishedOrBuiltIn(): Promise<Published> {
  try {
    return await fetchPublished();
  } catch (err) {
    console.warn(`[cms] ${(err as Error).message} — using the built-in content`);
    return builtIn();
  }
}

export const getSiteContent = async (locale: Locale): Promise<SiteContent> => (await getPublished()).snapshot.site[locale];
export const getBriefContent = async (locale: Locale): Promise<BriefContent> => (await getPublished()).snapshot.brief[locale];
