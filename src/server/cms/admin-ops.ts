import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Locale } from "@/i18n/locale";
import { AREAS, CMS_SCHEMA_VERSION, LOCALES, SECTIONS, clone, defaultSection, isArea, isLocale, isSection, looksLikeSnapshot, type Area, type CmsSnapshot } from "@/cms/model";
import { mediaRefs, sectionErrors, snapshotErrors } from "@/cms/validate";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, PUBLISHED_MEDIA } from "@/admin/fields";
import { describe, diff } from "@/admin/history";
import { getAt, same, setAt } from "@/admin/path";
import { allSections, findSection } from "@/admin/sections";
import type { AdminSession } from "./dal";
import { DRAFTS_BUCKET, PUBLIC_BUCKET, supabaseConfig } from "./env";
import { serviceClient } from "./supabase";

/**
 * Admin operations on the CMS. Every function takes the AdminSession returned by requireAdmin(): the secret-key
 * client is only reachable through it. Inputs are re-validated here — the browser is never trusted.
 */

export type DraftDoc = { data: unknown; version: number };
export type Drafts = Record<Area, Record<Locale, Record<string, DraftDoc>>>;

export type ChangeRow = {
  id: string;
  area: Area;
  locale: Locale;
  section: string;
  sectionId: string;
  sectionTitle: string;
  path: string;
  field: string;
  description: string;
  before: unknown;
  beforePresent: boolean;
  after: unknown;
  afterPresent: boolean;
  at: string;
};

export type PublicationMeta = { id: number; createdAt: string; note: string; source: "seed" | "publish" | "restore"; restoredFrom: number | null };

export type MediaInfo = { id: string; kind: "image" | "video"; url: string; publicUrl: string | null };

export type AdminState = {
  drafts: Drafts;
  published: CmsSnapshot | null;
  currentPublicationId: number | null;
  publications: PublicationMeta[];
  changes: ChangeRow[];
  media: Record<string, MediaInfo>;
  /** "area/locale/section" whose draft differs from what the site shows */
  unpublished: string[];
};

export type OpResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; conflict?: boolean };

const fail = (error: string, extra: { conflict?: boolean } = {}): { ok: false; error: string; conflict?: boolean } => ({ ok: false, error, ...extra });

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4" };
const SIGNED_TTL = 60 * 60;

function host() {
  const cfg = supabaseConfig();
  return cfg ? new URL(cfg.url).host : null;
}
const publicUrlOf = (path: string) => `${supabaseConfig()!.url}/storage/v1/object/public/${PUBLIC_BUCKET}/${path}`;

/* ---------------- reading ---------------- */

type DraftRow = { area: Area; locale: Locale; section: string; data: unknown; version: number };

async function readDrafts(session: AdminSession): Promise<Drafts> {
  const db = serviceClient(session);
  const { data, error } = await db.from("cms_drafts").select("area, locale, section, data, version");
  if (error) throw new Error("drafts: " + error.message);
  const out = {} as Drafts;
  for (const a of AREAS) {
    out[a] = {} as Record<Locale, Record<string, DraftDoc>>;
    for (const l of LOCALES) {
      out[a][l] = {};
      // sections missing in the database start from the built-in content (version 0 = row not created yet)
      for (const s of SECTIONS[a]) out[a][l][s] = { data: defaultSection(a, l, s), version: 0 };
    }
  }
  for (const r of (data ?? []) as DraftRow[]) if (isArea(r.area) && isLocale(r.locale) && isSection(r.area, r.section)) out[r.area][r.locale][r.section] = { data: r.data, version: r.version };
  return out;
}

async function readPublished(session: AdminSession): Promise<{ id: number; snapshot: CmsSnapshot } | null> {
  const db = serviceClient(session);
  const { data: st } = await db.from("cms_state").select("current_publication_id").maybeSingle();
  if (!st) return null;
  const { data, error } = await db.from("cms_publications").select("id, snapshot").eq("id", st.current_publication_id).single();
  if (error || !looksLikeSnapshot(data.snapshot)) return null;
  return { id: data.id, snapshot: data.snapshot };
}

type MediaRow = { id: string; kind: "image" | "video"; mime: string; draft_path: string; public_path: string | null; status: string; sha256: string | null; bytes: number | null };

async function mediaRows(session: AdminSession, ids: string[]): Promise<MediaRow[]> {
  if (!ids.length) return [];
  const { data, error } = await serviceClient(session).from("cms_media").select("id, kind, mime, draft_path, public_path, status, sha256, bytes").in("id", ids);
  if (error) throw new Error("media: " + error.message);
  return (data ?? []) as MediaRow[];
}

async function signMediaRows(session: AdminSession, rows: MediaRow[]): Promise<Record<string, MediaInfo>> {
  const out: Record<string, MediaInfo> = {};
  const ready = rows.filter((r) => r.status === "ready");
  if (!ready.length) return out;
  const { data } = await serviceClient(session)
    .storage.from(DRAFTS_BUCKET)
    .createSignedUrls(
      ready.map((r) => r.draft_path),
      SIGNED_TTL,
    );
  for (const r of ready) {
    const signed = data?.find((d) => d.path === r.draft_path)?.signedUrl;
    out[r.id] = { id: r.id, kind: r.kind, url: signed ?? (r.public_path ? publicUrlOf(r.public_path) : ""), publicUrl: r.public_path ? publicUrlOf(r.public_path) : null };
  }
  return out;
}

/** Draft with uploaded-file references replaced by the URL they will get when published (for comparisons) */
function resolveForCompare(v: unknown, media: Map<string, MediaRow>): unknown {
  if (typeof v === "string" && v.startsWith("media:")) {
    const m = media.get(v.slice(6));
    return m?.public_path ? publicUrlOf(m.public_path) : v;
  }
  if (Array.isArray(v)) return v.map((x) => resolveForCompare(x, media));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveForCompare(x, media)]));
  return v;
}

function unpublishedList(drafts: Drafts, published: CmsSnapshot | null, media: Map<string, MediaRow>): string[] {
  const base = published ?? { site: {}, brief: {} };
  const out: string[] = [];
  for (const a of AREAS)
    for (const l of LOCALES)
      for (const s of SECTIONS[a]) {
        const pub = (base as Record<string, Record<string, Record<string, unknown>>>)[a]?.[l]?.[s] ?? defaultSection(a, l, s);
        if (!same(resolveForCompare(drafts[a][l][s].data, media), pub)) out.push(`${a}/${l}/${s}`);
      }
  return out;
}

const toChange = (r: Record<string, unknown>): ChangeRow => ({
  id: r.id as string,
  area: r.area as Area,
  locale: r.locale as Locale,
  section: r.section as string,
  sectionId: r.section_id as string,
  sectionTitle: r.section_title as string,
  path: r.path as string,
  field: r.field as string,
  description: r.description as string,
  before: r.before_value,
  beforePresent: r.before_present as boolean,
  after: r.after_value,
  afterPresent: r.after_present as boolean,
  at: r.created_at as string,
});

async function recentChanges(session: AdminSession): Promise<ChangeRow[]> {
  const { data, error } = await serviceClient(session).from("cms_changes").select("*").is("undone_at", null).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error("changes: " + error.message);
  return (data ?? []).map(toChange);
}

export async function loadState(session: AdminSession): Promise<AdminState> {
  const db = serviceClient(session);
  const [drafts, published, pubs, changes] = await Promise.all([
    readDrafts(session),
    readPublished(session),
    db.from("cms_publications").select("id, created_at, note, source, restored_from").order("id", { ascending: false }).limit(30),
    recentChanges(session),
  ]);
  const ids = new Set<string>();
  for (const a of AREAS) for (const l of LOCALES) for (const s of SECTIONS[a]) mediaRefs(drafts[a][l][s].data, ids);
  for (const c of changes) {
    mediaRefs(c.before, ids);
    mediaRefs(c.after, ids);
  }
  const rows = await mediaRows(session, [...ids]);
  return {
    drafts,
    published: published?.snapshot ?? null,
    currentPublicationId: published?.id ?? null,
    publications: (pubs.data ?? []).map((p) => ({ id: p.id, createdAt: p.created_at, note: p.note, source: p.source, restoredFrom: p.restored_from })),
    changes,
    media: await signMediaRows(session, rows),
    unpublished: unpublishedList(drafts, published?.snapshot ?? null, new Map(rows.map((r) => [r.id, r]))),
  };
}

async function unpublishedNow(session: AdminSession): Promise<string[]> {
  const [drafts, published] = await Promise.all([readDrafts(session), readPublished(session)]);
  const ids = new Set<string>();
  for (const a of AREAS) for (const l of LOCALES) for (const s of SECTIONS[a]) mediaRefs(drafts[a][l][s].data, ids);
  const rows = await mediaRows(session, [...ids]);
  return unpublishedList(drafts, published?.snapshot ?? null, new Map(rows.map((r) => [r.id, r])));
}

/* ---------------- saving ---------------- */

async function checkMediaReady(session: AdminSession, data: unknown): Promise<string | null> {
  const ids = [...mediaRefs(data)];
  if (!ids.length) return null;
  const rows = await mediaRows(session, ids);
  const missing = ids.filter((id) => !rows.some((r) => r.id === id && r.status === "ready"));
  return missing.length ? "Один из файлов не найден или не загружен до конца — загрузите его снова." : null;
}

type ChangeInput = { sectionId: string; sectionTitle: string; path: string; field: string; description: string; before: unknown; beforePresent: boolean; after: unknown; afterPresent: boolean };

function changesFor(area: Area, section: string, sectionId: string | undefined, before: unknown, after: unknown): ChangeInput[] {
  const def = (sectionId && findSection(area, sectionId)) || allSections.find((x) => x.area === area && x.key === section);
  if (!def) return [];
  let list = diff(before, after);
  if (list.length > 12) list = [{ path: "", before, after }];
  return list.map((c) => ({
    sectionId: def.id,
    sectionTitle: def.title,
    path: c.path,
    ...describe(def, c.path, c.before, c.after, after),
    before: c.before === undefined ? null : c.before,
    beforePresent: c.before !== undefined,
    after: c.after === undefined ? null : c.after,
    afterPresent: c.after !== undefined,
  }));
}

async function writeDraft(session: AdminSession, area: Area, locale: Locale, section: string, data: unknown, expectedVersion: number, changes: ChangeInput[], undoChange?: string) {
  const { data: version, error } = await serviceClient(session).rpc("cms_save_draft", {
    p_area: area,
    p_locale: locale,
    p_section: section,
    p_data: data,
    p_expected_version: expectedVersion,
    p_changes: changes,
    p_undo_change: undoChange ?? null,
  });
  if (error) {
    if (/version conflict/.test(error.message)) return { conflict: true as const };
    if (/change already undone/.test(error.message)) return { undone: true as const };
    throw new Error("save: " + error.message);
  }
  return { version: version as number };
}

export async function saveSection(
  session: AdminSession,
  input: { area: unknown; locale: unknown; section: unknown; sectionId?: unknown; data: unknown; expectedVersion: unknown },
): Promise<OpResult<{ version: number; changes: ChangeRow[]; unpublished: string[] }>> {
  const { area, locale, section } = input;
  if (!isArea(area) || !isLocale(locale) || !isSection(area, section)) return fail("Неизвестный раздел.");
  if (typeof input.expectedVersion !== "number" || !Number.isInteger(input.expectedVersion) || input.expectedVersion < 0) return fail("Некорректная версия.");
  const drafts = await readDrafts(session);
  const current = drafts[area][locale][section];
  if (current.version !== input.expectedVersion) return fail("Этот раздел уже изменили на другом устройстве или вкладке. Обновите страницу, чтобы увидеть свежую версию.", { conflict: true });
  const root = Object.fromEntries(Object.entries(drafts[area][locale]).map(([k, d]) => [k, d.data]));
  const errors = sectionErrors(area, locale, section, input.data, root, host());
  if (errors.length) return fail(`Не сохранено: ${errors[0].message}${errors.length > 1 ? ` (и ещё ${errors.length - 1})` : ""}`);
  const mediaProblem = await checkMediaReady(session, input.data);
  if (mediaProblem) return fail(mediaProblem);
  const changes = changesFor(area, section, typeof input.sectionId === "string" ? input.sectionId : undefined, current.data, input.data);
  if (!changes.length) return { ok: true, version: current.version, changes: [], unpublished: await unpublishedNow(session) };
  const res = await writeDraft(session, area, locale, section, input.data, current.version, changes);
  if ("conflict" in res) return fail("Этот раздел уже изменили на другом устройстве или вкладке. Обновите страницу.", { conflict: true });
  return { ok: true, version: res.version!, changes: (await recentChanges(session)).slice(0, changes.length), unpublished: await unpublishedNow(session) };
}

/* ---------------- undo ---------------- */

export async function undoChange(session: AdminSession, id: unknown): Promise<OpResult<{ area: Area; locale: Locale; section: string; data: unknown; version: number; unpublished: string[] }>> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) return fail("Изменение не найдено.");
  const { data: row } = await serviceClient(session).from("cms_changes").select("*").eq("id", id).maybeSingle();
  if (!row || row.undone_at) return fail("Это изменение уже отменено или удалено из истории.");
  const c = toChange(row);
  if (!isArea(c.area) || !isLocale(c.locale) || !isSection(c.area, c.section)) return fail("Изменение относится к неизвестному разделу.");
  const drafts = await readDrafts(session);
  const cur = drafts[c.area][c.locale][c.section];
  const now = c.path ? getAt(cur.data, c.path) : cur.data;
  const expectedNow = c.afterPresent ? c.after : undefined;
  if (!same(now, expectedNow)) return fail(`Нельзя отменить «${c.description}»: это поле позже изменили ещё раз. Сначала отмените более позднее изменение этого поля.`);
  const restored = c.beforePresent ? clone(c.before) : undefined;
  const next = c.path ? setAt(cur.data, c.path, restored) : restored;
  const root = Object.fromEntries(Object.entries(drafts[c.area][c.locale]).map(([k, d]) => [k, d.data]));
  const errors = sectionErrors(c.area, c.locale, c.section, next, root, host());
  if (errors.length) return fail(`Отмена невозможна: прежнее значение больше не проходит проверку (${errors[0].message}).`);
  const mediaProblem = await checkMediaReady(session, next);
  if (mediaProblem) return fail("Нельзя отменить: прежнее изображение больше недоступно. Данные не изменены.");
  const res = await writeDraft(session, c.area, c.locale, c.section, next, cur.version, [], c.id);
  if ("conflict" in res) return fail("Раздел только что изменили на другом устройстве. Обновите страницу и повторите.", { conflict: true });
  if ("undone" in res) return fail("Это изменение уже отменено.");
  return { ok: true, area: c.area, locale: c.locale, section: c.section, data: next, version: res.version!, unpublished: await unpublishedNow(session) };
}

/* ---------------- media ---------------- */

export async function createUpload(session: AdminSession, input: { mime: unknown; bytes: unknown; name: unknown }): Promise<OpResult<{ mediaId: string; uploadUrl: string }>> {
  const mime = typeof input.mime === "string" ? input.mime : "";
  const ext = EXT[mime];
  if (!ext) return fail("Неподдерживаемый формат. Изображения: JPG, PNG, WebP, AVIF; видео: MP4.");
  const kind = mime.startsWith("video/") ? "video" : "image";
  const bytes = typeof input.bytes === "number" ? input.bytes : 0;
  if (bytes <= 0 || bytes > (kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) return fail(kind === "video" ? "Видео должно быть не больше 50 МБ." : "Изображение должно быть не больше 5 МБ.");
  const id = randomUUID();
  const draftPath = `drafts/${id}.${ext}`;
  const db = serviceClient(session);
  const name = typeof input.name === "string" ? input.name.slice(0, 200) : "";
  const { error } = await db.from("cms_media").insert({ id, kind, mime, draft_path: draftPath, original_name: name, status: "pending" });
  if (error) throw new Error("media insert: " + error.message);
  const { data, error: e2 } = await db.storage.from(DRAFTS_BUCKET).createSignedUploadUrl(draftPath);
  if (e2 || !data) throw new Error("upload url: " + (e2?.message ?? "none"));
  return { ok: true, mediaId: id, uploadUrl: data.signedUrl };
}

/** Magic bytes of the allowed formats */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return "image/avif";
    return "video/mp4";
  }
  return null;
}

export async function finishUpload(session: AdminSession, input: { mediaId: unknown; width?: unknown; height?: unknown }): Promise<OpResult<{ media: MediaInfo }>> {
  const id = typeof input.mediaId === "string" ? input.mediaId : "";
  const [row] = await mediaRows(session, [id]);
  if (!row) return fail("Файл не найден.");
  const db = serviceClient(session);
  const { data: blob, error } = await db.storage.from(DRAFTS_BUCKET).download(row.draft_path);
  const discard = async (msg: string) => {
    await db.storage.from(DRAFTS_BUCKET).remove([row.draft_path]);
    await db.from("cms_media").delete().eq("id", id);
    return fail(msg);
  };
  if (error || !blob) return discard("Файл не дошёл до хранилища. Попробуйте загрузить его ещё раз.");
  const buf = Buffer.from(await blob.arrayBuffer());
  const limit = row.kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (buf.length === 0 || buf.length > limit) return discard("Файл слишком большой.");
  if (sniff(buf) !== row.mime) return discard("Содержимое файла не совпадает с его форматом. Выберите другой файл.");
  const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v > 0 && v < 20000 ? v : null);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const { error: e2 } = await db.from("cms_media").update({ status: "ready", bytes: buf.length, sha256, width: int(input.width), height: int(input.height) }).eq("id", id);
  if (e2) throw new Error("media update: " + e2.message);
  const signed = await signMediaRows(session, [{ ...row, status: "ready", sha256, bytes: buf.length }]);
  return { ok: true, media: signed[id] };
}

export async function signMedia(session: AdminSession, ids: unknown): Promise<OpResult<{ media: Record<string, MediaInfo> }>> {
  const list = Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/.test(x)).slice(0, 200) : [];
  return { ok: true, media: await signMediaRows(session, await mediaRows(session, list)) };
}

/** Copies a draft file to the public bucket under its content hash (idempotent) and records the public path */
async function publishMediaFile(session: AdminSession, row: MediaRow): Promise<string> {
  if (row.public_path) return row.public_path;
  if (!row.sha256) throw new Error("media without checksum");
  const target = `media/${row.sha256}.${EXT[row.mime]}`;
  const db = serviceClient(session);
  const { error } = await db.storage.from(DRAFTS_BUCKET).copy(row.draft_path, target, { destinationBucket: PUBLIC_BUCKET });
  if (error && !/exists|Duplicate/i.test(error.message)) throw new Error("copy: " + error.message);
  const { error: e2 } = await db.from("cms_media").update({ public_path: target }).eq("id", row.id);
  // another media row with the same content already owns this path: reuse it
  if (e2 && !/duplicate key/i.test(e2.message)) throw new Error("media public path: " + e2.message);
  return target;
}

async function publicFileExists(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---------------- publishing ---------------- */

function replaceRefs(v: unknown, map: Map<string, string>): unknown {
  if (typeof v === "string" && v.startsWith("media:")) return map.get(v.slice(6)) ?? v;
  if (Array.isArray(v)) return v.map((x) => replaceRefs(x, map));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replaceRefs(x, map)]));
  return v;
}

function publishedUrls(v: unknown, out = new Set<string>()): Set<string> {
  if (typeof v === "string" && PUBLISHED_MEDIA.test(v)) out.add(v);
  else if (v && typeof v === "object") for (const x of Object.values(v)) publishedUrls(x, out);
  return out;
}

export async function publish(session: AdminSession, note: unknown): Promise<OpResult<{ publicationId: number }>> {
  const drafts = await readDrafts(session);
  const docs = { site: {}, brief: {} } as Record<Area, Record<Locale, Record<string, unknown>>>;
  for (const a of AREAS) for (const l of LOCALES) docs[a][l] = Object.fromEntries(SECTIONS[a].map((s) => [s, drafts[a][l][s].data]));
  const errors = snapshotErrors(docs, host());
  if (errors.length) return fail(`Публикация остановлена: ${errors[0].where} — ${errors[0].issue.message}${errors.length > 1 ? ` (и ещё ${errors.length - 1})` : ""}`);

  // files: every uploaded file must be ready; copy the new ones to the public bucket first (before the switch)
  const ids = [...mediaRefs(docs)];
  const rows = await mediaRows(session, ids);
  const notReady = ids.filter((id) => !rows.some((r) => r.id === id && r.status === "ready"));
  if (notReady.length) return fail("Публикация остановлена: не все файлы загружены. Откройте раздел с файлом и загрузите его снова.");
  const urlById = new Map<string, string>();
  for (const r of rows) urlById.set(r.id, publicUrlOf(await publishMediaFile(session, r)));
  const snapshot = replaceRefs(docs, urlById) as CmsSnapshot;

  // retain every file the snapshot uses (also already-public URLs kept in drafts), so rollbacks never lose images
  const urls = publishedUrls(snapshot);
  const paths = [...urls].map((u) => u.split(`/object/public/${PUBLIC_BUCKET}/`)[1]);
  const { data: owned } = await serviceClient(session).from("cms_media").select("id, public_path").in("public_path", paths.length ? paths : ["-"]);
  const mediaIds = [...new Set([...rows.map((r) => r.id), ...(owned ?? []).map((o) => o.id as string)])];
  for (const u of urls) if (!(await publicFileExists(u))) return fail("Публикация остановлена: один из опубликованных файлов недоступен в хранилище.");

  const { data: id, error } = await serviceClient(session).rpc("cms_publish", {
    p_snapshot: snapshot,
    p_media_ids: mediaIds,
    p_note: typeof note === "string" ? note.slice(0, 300) : "",
    p_schema_version: CMS_SCHEMA_VERSION,
    p_source: "publish",
  });
  if (error) throw new Error("publish: " + error.message);
  return { ok: true, publicationId: id as number };
}

export async function restorePublication(session: AdminSession, id: unknown): Promise<OpResult<{ publicationId: number }>> {
  if (typeof id !== "number" || !Number.isInteger(id)) return fail("Версия не найдена.");
  const { data: pub } = await serviceClient(session).from("cms_publications").select("id, snapshot").eq("id", id).maybeSingle();
  if (!pub || !looksLikeSnapshot(pub.snapshot)) return fail("Версия не найдена или повреждена.");
  for (const u of publishedUrls(pub.snapshot)) if (!(await publicFileExists(u))) return fail("Откат невозможен: файл этой версии отсутствует в хранилище. Сайт не изменён.");
  const { data: newId, error } = await serviceClient(session).rpc("cms_restore", { p_publication_id: id, p_note: `Откат к версии №${id}` });
  if (error) throw new Error("restore: " + error.message);
  return { ok: true, publicationId: newId as number };
}

/** Replaces all drafts with a whole content set (a publication, the built-in content or an import), one history entry per section */
async function replaceDrafts(session: AdminSession, next: Record<Area, Record<Locale, Record<string, unknown>>>, label: string): Promise<OpResult> {
  const errors = snapshotErrors(next, host());
  if (errors.length) return fail(`Не загружено: ${errors[0].where} — ${errors[0].issue.message}`);
  const media = await checkMediaReady(session, next);
  if (media) return fail(media);
  const drafts = await readDrafts(session);
  for (const a of AREAS)
    for (const l of LOCALES)
      for (const s of SECTIONS[a]) {
        const cur = drafts[a][l][s];
        if (same(cur.data, next[a][l][s])) continue;
        const def = allSections.find((x) => x.area === a && x.key === s);
        const changes: ChangeInput[] = def
          ? [{ sectionId: def.id, sectionTitle: def.title, path: "", field: "Весь раздел", description: `${label}: «${def.title}»`, before: cur.data, beforePresent: true, after: next[a][l][s], afterPresent: true }]
          : [];
        const res = await writeDraft(session, a, l, s, next[a][l][s], cur.version, changes);
        if ("conflict" in res) return fail("Черновики изменили на другом устройстве во время загрузки. Обновите страницу и повторите.", { conflict: true });
      }
  return { ok: true };
}

export async function loadPublicationIntoDrafts(session: AdminSession, id: unknown): Promise<OpResult> {
  if (typeof id !== "number") return fail("Версия не найдена.");
  const { data: pub } = await serviceClient(session).from("cms_publications").select("snapshot").eq("id", id).maybeSingle();
  if (!pub || !looksLikeSnapshot(pub.snapshot)) return fail("Версия не найдена или повреждена.");
  return replaceDrafts(session, pub.snapshot as unknown as Record<Area, Record<Locale, Record<string, unknown>>>, `Загружено из версии №${id}`);
}

export async function resetToBuiltIn(session: AdminSession, area: unknown, locale: unknown): Promise<OpResult> {
  if (!isArea(area) || !isLocale(locale)) return fail("Неизвестная область.");
  const drafts = await readDrafts(session);
  const next = { site: {}, brief: {} } as Record<Area, Record<Locale, Record<string, unknown>>>;
  for (const a of AREAS) for (const l of LOCALES) next[a][l] = Object.fromEntries(SECTIONS[a].map((s) => [s, a === area && l === locale ? defaultSection(a, l, s) : drafts[a][l][s].data]));
  return replaceDrafts(session, next, "Исходный контент");
}

/* ---------------- export / import ---------------- */

export async function exportAll(session: AdminSession): Promise<OpResult<{ json: string }>> {
  const db = serviceClient(session);
  const drafts = await readDrafts(session);
  const [{ data: pubs }, { data: media }, { data: st }] = await Promise.all([
    db.from("cms_publications").select("*").order("id", { ascending: false }).limit(20),
    db.from("cms_media").select("*"),
    db.from("cms_state").select("current_publication_id").maybeSingle(),
  ]);
  const doc = {
    format: "miroform-cms-export",
    exportedAt: new Date().toISOString(),
    schemaVersion: CMS_SCHEMA_VERSION,
    currentPublicationId: st?.current_publication_id ?? null,
    drafts: Object.fromEntries(AREAS.map((a) => [a, Object.fromEntries(LOCALES.map((l) => [l, Object.fromEntries(SECTIONS[a].map((s) => [s, drafts[a][l][s].data]))]))])),
    publications: pubs ?? [],
    media: media ?? [],
  };
  return { ok: true, json: JSON.stringify(doc, null, 2) };
}

/** Accepts a CMS export, the stage-0 content backup or the old demo export; only drafts are replaced */
export async function importIntoDrafts(session: AdminSession, json: unknown): Promise<OpResult> {
  if (typeof json !== "string" || json.length > 20_000_000) return fail("Файл слишком большой.");
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(json);
  } catch {
    return fail("Файл не является корректным JSON.");
  }
  const pick = (): unknown =>
    doc.format === "miroform-cms-export" ? doc.drafts : doc.format === "miroform-content-backup" || doc.format === "miroform-admin-demo" ? { site: doc.site, brief: doc.brief } : null;
  const set = pick() as Record<Area, Record<Locale, Record<string, unknown>>> | null;
  if (!set || !looksLikeSnapshot(set)) return fail("Это не файл экспорта или резервной копии MIROFORM, либо его структура неполная.");
  return replaceDrafts(session, set, "Импорт из файла");
}
