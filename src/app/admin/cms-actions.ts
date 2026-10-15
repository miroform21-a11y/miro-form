"use server";

import { updateTag } from "next/cache";
import { AdminAuthError, requireAdmin, type AdminSession } from "@/server/cms/dal";
import { CmsNotConfiguredError } from "@/server/cms/supabase";
import { CMS_PUBLISHED_TAG } from "@/server/cms/published";
import * as ops from "@/server/cms/admin-ops";

/**
 * Server Actions of the admin. Every exported function is a public HTTP endpoint, so each one starts with
 * requireAdmin() (signed session cookie) before touching anything; Next also checks the request Origin.
 * Errors never carry internals to the browser.
 */

type Failure = { ok: false; error: string; conflict?: boolean; unauthorized?: boolean };

async function guarded<T>(fn: (s: AdminSession) => Promise<T>): Promise<T | Failure> {
  let session: AdminSession;
  try {
    session = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) return { ok: false, unauthorized: true, error: "Сессия истекла. Войдите снова." };
    throw e;
  }
  try {
    return await fn(session);
  } catch (e) {
    if (e instanceof CmsNotConfiguredError) return { ok: false, error: "База данных не настроена на сервере (переменные Supabase)." };
    console.error(`[cms] ${(e as Error).message}`);
    return { ok: false, error: "Не удалось выполнить действие: ошибка сервера или базы данных. Данные не изменены — попробуйте ещё раз." };
  }
}

export async function cmsLoad() {
  return guarded(async (s) => ({ ok: true as const, state: await ops.loadState(s) }));
}

export async function cmsSaveSection(input: { area: string; locale: string; section: string; sectionId: string; data: unknown; expectedVersion: number }) {
  return guarded((s) => ops.saveSection(s, input));
}

export async function cmsUndo(changeId: string) {
  return guarded((s) => ops.undoChange(s, changeId));
}

export async function cmsCreateUpload(input: { mime: string; bytes: number; name: string }) {
  return guarded((s) => ops.createUpload(s, input));
}

export async function cmsFinishUpload(input: { mediaId: string; width?: number; height?: number }) {
  return guarded((s) => ops.finishUpload(s, input));
}

export async function cmsSignMedia(ids: string[]) {
  return guarded((s) => ops.signMedia(s, ids));
}

export async function cmsPublish(note: string) {
  return guarded(async (s) => {
    const res = await ops.publish(s, note);
    // expire the cached published content right away: the next visit renders the new snapshot
    if (res.ok) updateTag(CMS_PUBLISHED_TAG);
    return res;
  });
}

export async function cmsRestore(publicationId: number) {
  return guarded(async (s) => {
    const res = await ops.restorePublication(s, publicationId);
    if (res.ok) updateTag(CMS_PUBLISHED_TAG);
    return res;
  });
}

export async function cmsLoadPublication(publicationId: number) {
  return guarded((s) => ops.loadPublicationIntoDrafts(s, publicationId));
}

export async function cmsResetToBuiltIn(area: string, locale: string) {
  return guarded((s) => ops.resetToBuiltIn(s, area, locale));
}

export async function cmsExport() {
  return guarded((s) => ops.exportAll(s));
}

export async function cmsImport(json: string) {
  return guarded((s) => ops.importIntoDrafts(s, json));
}
