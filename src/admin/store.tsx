"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { briefContent, siteContent } from "@/content";
import type { BriefContent, SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/locale";
import type { AdminState, ChangeRow, MediaInfo, PublicationMeta } from "@/server/cms/admin-ops";
import {
  cmsCreateUpload,
  cmsExport,
  cmsFinishUpload,
  cmsImport,
  cmsLoad,
  cmsLoadPublication,
  cmsPublish,
  cmsResetToBuiltIn,
  cmsRestore,
  cmsSaveSection,
  cmsSignMedia,
  cmsUndo,
} from "@/app/admin/cms-actions";
import { clone, same } from "./path";
import type { HistoryEntry } from "./history";

/**
 * Admin state backed by the CMS in Supabase (through the Server Actions in app/admin/cms-actions.ts).
 * Per area, language and section: the saved draft (server), the local edits and the server version used for
 * conflict detection. Published content changes only on "Опубликовать".
 */

type ContentArea = "site" | "brief";
type AreaData = { site: SiteContent; brief: BriefContent };
type SectionState = { saved: unknown; draft: unknown; version: number };
type Sections = Record<ContentArea, Record<Locale, Record<string, SectionState>>>;

export type Toast = { id: number; kind: "success" | "error" | "info"; text: string };
type Result = { ok: boolean; message: string };

/** Slot info used by the editor status lines */
type Slot = { loaded: true; savedAt?: string; source: "stored" | "defaults"; problem?: undefined };

const builtIn = (area: ContentArea, locale: Locale) => (area === "site" ? siteContent[locale] : briefContent[locale]) as Record<string, unknown>;

function toSections(drafts: AdminState["drafts"]): Sections {
  const out = {} as Sections;
  for (const a of ["site", "brief"] as const) {
    out[a] = {} as Record<Locale, Record<string, SectionState>>;
    for (const l of ["uk", "en"] as const) {
      out[a][l] = {};
      for (const [k, d] of Object.entries(drafts[a][l])) out[a][l][k] = { saved: d.data, draft: clone(d.data), version: d.version };
    }
  }
  return out;
}

const toHistory = (c: ChangeRow): HistoryEntry => ({
  id: c.id,
  area: c.area,
  locale: c.locale,
  key: c.section,
  sectionId: c.sectionId,
  sectionTitle: c.sectionTitle,
  path: c.path,
  field: c.field,
  description: c.description,
  before: c.beforePresent ? c.before : undefined,
  after: c.afterPresent ? c.after : undefined,
  at: c.at,
});

type Ctx = {
  state: Sections;
  draft: <A extends ContentArea>(area: A, locale: Locale) => AreaData[A];
  saved: <A extends ContentArea>(area: A, locale: Locale) => AreaData[A];
  slot: (area: ContentArea, locale: Locale) => Slot;
  setSection: (area: ContentArea, locale: Locale, key: string, value: unknown) => void;
  isDirty: (area: ContentArea, locale: Locale, key?: string) => boolean;
  /** The saved draft differs from what the site shows */
  isUnpublished: (area: ContentArea, locale: Locale, key?: string) => boolean;
  /** The section (draft) differs from the published version */
  differsFromSite: (area: ContentArea, locale: Locale, key: string) => boolean;
  saveSection: (area: ContentArea, locale: Locale, key: string, sectionId?: string) => Promise<boolean>;
  cancelSection: (area: ContentArea, locale: Locale, key: string) => void;
  /** Puts the published version of the section into the form (still needs saving) */
  restoreSection: (area: ContentArea, locale: Locale, key: string) => void;
  /** Replaces the drafts of an area + language with the built-in content (saved, with history) */
  resetArea: (area: ContentArea, locale: Locale) => Promise<void>;
  exportJson: () => Promise<string | null>;
  importJson: (json: string) => Promise<Result>;
  history: HistoryEntry[];
  undo: (id: string) => Promise<Result>;
  publish: (note: string) => Promise<Result>;
  restorePublication: (id: number) => Promise<Result>;
  loadPublication: (id: number) => Promise<Result>;
  publications: PublicationMeta[];
  currentPublicationId: number | null;
  unpublished: string[];
  uploadMedia: (file: Blob, meta: { name: string; width?: number; height?: number }) => Promise<{ ok: true; ref: string } | { ok: false; error: string }>;
  /** A displayable URL for a media value ("media:<id>" → signed URL) */
  mediaUrl: (value: string) => string | null;
  /** Content with uploaded-file references replaced by displayable URLs (for the preview) */
  resolveMedia: <T>(content: T) => T;
  reload: () => Promise<void>;
  toasts: Toast[];
  toast: (kind: Toast["kind"], text: string) => void;
  dismiss: (id: number) => void;
};

const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const c = useContext(AdminContext);
  if (!c) throw new Error("useAdmin outside AdminProvider");
  return c;
}

type Failure = { ok: false; error: string; conflict?: boolean; unauthorized?: boolean };
const isFailure = <T extends { ok: boolean }>(r: T): r is Extract<T, { ok: false }> => r.ok === false;

export function AdminProvider({ initial, children }: { initial: AdminState; children: ReactNode }) {
  const [state, setState] = useState<Sections>(() => toSections(initial.drafts));
  const [published, setPublished] = useState(initial.published);
  const [publications, setPublications] = useState(initial.publications);
  const [currentPublicationId, setCurrentPublicationId] = useState(initial.currentPublicationId);
  const [changes, setChanges] = useState(initial.changes);
  const [media, setMedia] = useState<Record<string, MediaInfo>>(initial.media);
  const [unpublished, setUnpublished] = useState(initial.unpublished);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToast = useRef(1);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingSign = useRef(new Set<string>());

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextToast.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 4500);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /** Common handling of a failed action; returns its message */
  const handleFailure = useCallback(
    (r: { error: string; unauthorized?: boolean }) => {
      if (r.unauthorized) {
        window.location.assign("/admin/login");
      }
      toast("error", r.error);
      return r.error;
    },
    [toast],
  );

  const applyState = useCallback((s: AdminState) => {
    setState(toSections(s.drafts));
    setPublished(s.published);
    setPublications(s.publications);
    setCurrentPublicationId(s.currentPublicationId);
    setChanges(s.changes);
    setMedia(s.media);
    setUnpublished(s.unpublished);
  }, []);

  const reload = useCallback(async () => {
    const r = await cmsLoad();
    if (isFailure(r)) return void handleFailure(r);
    applyState(r.state);
  }, [applyState, handleFailure]);

  const update = useCallback((area: ContentArea, locale: Locale, key: string, fn: (s: SectionState) => SectionState) => {
    setState((st) => ({ ...st, [area]: { ...st[area], [locale]: { ...st[area][locale], [key]: fn(st[area][locale][key]) } } }));
  }, []);

  const areaObject = useCallback((area: ContentArea, locale: Locale, which: "draft" | "saved") => {
    const sections = state[area][locale];
    return Object.fromEntries(Object.entries(sections).map(([k, s]) => [k, s[which]]));
  }, [state]);

  const draftMemo = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const a of ["site", "brief"] as const) for (const l of ["uk", "en"] as const) out[`${a}/${l}`] = areaObject(a, l, "draft");
    return out;
  }, [areaObject]);
  const savedMemo = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const a of ["site", "brief"] as const) for (const l of ["uk", "en"] as const) out[`${a}/${l}`] = areaObject(a, l, "saved");
    return out;
  }, [areaObject]);

  const isDirty = useCallback(
    (area: ContentArea, locale: Locale, key?: string) => {
      const secs = state[area][locale];
      return key ? !same(secs[key].draft, secs[key].saved) : Object.values(secs).some((s) => !same(s.draft, s.saved));
    },
    [state],
  );

  const isUnpublished = useCallback(
    (area: ContentArea, locale: Locale, key?: string) => (key ? unpublished.includes(`${area}/${locale}/${key}`) : unpublished.some((u) => u.startsWith(`${area}/${locale}/`))),
    [unpublished],
  );

  const publishedSection = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      const p = published?.[area]?.[locale] as Record<string, unknown> | undefined;
      return clone(p?.[key] ?? builtIn(area, locale)[key]);
    },
    [published],
  );

  const differsFromSite = useCallback((area: ContentArea, locale: Locale, key: string) => !same(state[area][locale][key].draft, publishedSection(area, locale, key)), [state, publishedSection]);

  const setSection = useCallback((area: ContentArea, locale: Locale, key: string, value: unknown) => update(area, locale, key, (s) => ({ ...s, draft: value })), [update]);

  const saveSection = useCallback(
    async (area: ContentArea, locale: Locale, key: string, sectionId?: string) => {
      const s = stateRef.current[area][locale][key];
      const sent = clone(s.draft);
      const r = await cmsSaveSection({ area, locale, section: key, sectionId: sectionId ?? key, data: sent, expectedVersion: s.version });
      if (isFailure(r)) {
        handleFailure(r);
        return false;
      }
      // keep edits made while the request was running
      update(area, locale, key, (cur) => ({ saved: sent, draft: same(cur.draft, sent) ? sent : cur.draft, version: r.version }));
      setChanges((c) => [...r.changes, ...c].slice(0, 50));
      setUnpublished(r.unpublished);
      setSavedAt(new Date().toISOString());
      toast("success", r.changes.length ? "Черновик сохранён. На сайте изменения появятся после «Опубликовать»." : "Изменений нет — сохранять нечего.");
      return true;
    },
    [handleFailure, toast, update],
  );

  const cancelSection = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      update(area, locale, key, (s) => ({ ...s, draft: clone(s.saved) }));
      toast("info", "Несохранённые изменения раздела отменены.");
    },
    [toast, update],
  );

  const restoreSection = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      update(area, locale, key, (s) => ({ ...s, draft: publishedSection(area, locale, key) }));
      toast("info", "В форму подставлена опубликованная версия раздела. Нажмите «Сохранить», чтобы она стала черновиком.");
    },
    [publishedSection, toast, update],
  );

  const resetArea = useCallback(
    async (area: ContentArea, locale: Locale) => {
      const r = await cmsResetToBuiltIn(area, locale);
      if (isFailure(r)) return void handleFailure(r);
      await reload();
      toast("success", "В черновики загружен исходный контент. На сайте ничего не изменится до публикации.");
    },
    [handleFailure, reload, toast],
  );

  const exportJson = useCallback(async () => {
    const r = await cmsExport();
    if (isFailure(r)) {
      handleFailure(r);
      return null;
    }
    return r.json;
  }, [handleFailure]);

  const importJson = useCallback(
    async (json: string) => {
      const r = await cmsImport(json);
      if (isFailure(r)) return { ok: false, message: handleFailure(r) };
      await reload();
      return { ok: true, message: "Файл загружен в черновики. Проверьте разделы и опубликуйте, когда будете готовы." };
    },
    [handleFailure, reload],
  );

  const undo = useCallback(
    async (id: string) => {
      const r = await cmsUndo(id);
      if (isFailure(r)) return { ok: false, message: handleFailure(r) };
      const c = changes.find((x) => x.id === id);
      update(r.area, r.locale, r.section, (s) => ({ saved: r.data, draft: same(s.draft, s.saved) ? clone(r.data) : s.draft, version: r.version }));
      setChanges((list) => list.filter((x) => x.id !== id));
      setUnpublished(r.unpublished);
      const message = `Отменено: ${c?.description ?? "изменение"}. Черновик сохранён.`;
      toast("success", message);
      return { ok: true, message };
    },
    [changes, handleFailure, toast, update],
  );

  const publish = useCallback(
    async (note: string) => {
      if (isDirty("site", "uk") || isDirty("site", "en") || isDirty("brief", "uk") || isDirty("brief", "en")) {
        const message = "Есть несохранённые правки. Сохраните или отмените их перед публикацией.";
        toast("error", message);
        return { ok: false, message };
      }
      const r = await cmsPublish(note);
      if (isFailure(r)) return { ok: false, message: handleFailure(r) };
      await reload();
      const message = `Опубликовано (версия №${r.publicationId}). Сайт обновится при следующем открытии страницы.`;
      toast("success", message);
      return { ok: true, message };
    },
    [handleFailure, isDirty, reload, toast],
  );

  const restorePublication = useCallback(
    async (id: number) => {
      const r = await cmsRestore(id);
      if (isFailure(r)) return { ok: false, message: handleFailure(r) };
      await reload();
      const message = `Сайт возвращён к версии №${id} (новая запись №${r.publicationId}).`;
      toast("success", message);
      return { ok: true, message };
    },
    [handleFailure, reload, toast],
  );

  const loadPublication = useCallback(
    async (id: number) => {
      const r = await cmsLoadPublication(id);
      if (isFailure(r)) return { ok: false, message: handleFailure(r) };
      await reload();
      const message = `Версия №${id} загружена в черновики. Сайт не изменён.`;
      toast("success", message);
      return { ok: true, message };
    },
    [handleFailure, reload, toast],
  );

  const uploadMedia = useCallback(
    async (file: Blob, meta: { name: string; width?: number; height?: number }) => {
      const created = await cmsCreateUpload({ mime: file.type, bytes: file.size, name: meta.name });
      if (isFailure(created)) return { ok: false as const, error: handleFailure(created) };
      // the file goes straight to the private bucket with a one-time upload URL (no secret in the browser)
      const body = new FormData();
      body.append("cacheControl", "3600");
      body.append("", file);
      let put: Response;
      try {
        put = await fetch(created.uploadUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
      } catch {
        return { ok: false as const, error: "Нет связи с хранилищем. Проверьте интернет и попробуйте снова." };
      }
      if (!put.ok) return { ok: false as const, error: "Хранилище не приняло файл. Попробуйте ещё раз." };
      const done = await cmsFinishUpload({ mediaId: created.mediaId, width: meta.width, height: meta.height });
      if (isFailure(done)) return { ok: false as const, error: handleFailure(done) };
      setMedia((m) => ({ ...m, [done.media.id]: done.media }));
      return { ok: true as const, ref: `media:${done.media.id}` };
    },
    [handleFailure],
  );

  // sign URLs for references we have not seen yet (e.g. restored by undo)
  const requestSign = useCallback((id: string) => {
    if (pendingSign.current.has(id)) return;
    pendingSign.current.add(id);
    queueMicrotask(async () => {
      const ids = [...pendingSign.current];
      pendingSign.current.clear();
      const r = await cmsSignMedia(ids);
      if (!isFailure(r)) setMedia((m) => ({ ...m, ...r.media }));
    });
  }, []);

  const mediaUrl = useCallback(
    (value: string) => {
      if (!value.startsWith("media:")) return value;
      const id = value.slice(6);
      const m = media[id];
      if (!m) requestSign(id);
      return m?.url ?? null;
    },
    [media, requestSign],
  );

  const resolveMedia = useCallback(
    <T,>(content: T): T => {
      const walk = (v: unknown): unknown => {
        if (typeof v === "string") return v.startsWith("media:") ? (mediaUrl(v) ?? "") : v;
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
        return v;
      };
      return walk(content) as T;
    },
    [mediaUrl],
  );

  const history = useMemo(() => changes.map(toHistory), [changes]);

  // leaving the page with unsaved changes
  const anyDirty = isDirty("site", "uk") || isDirty("site", "en") || isDirty("brief", "uk") || isDirty("brief", "en");
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const value: Ctx = {
    state,
    draft: (area, locale) => draftMemo[`${area}/${locale}`] as never,
    saved: (area, locale) => savedMemo[`${area}/${locale}`] as never,
    slot: () => ({ loaded: true, savedAt, source: "stored" }),
    setSection,
    isDirty,
    isUnpublished,
    differsFromSite,
    saveSection,
    cancelSection,
    restoreSection,
    resetArea,
    exportJson,
    importJson,
    history,
    undo,
    publish,
    restorePublication,
    loadPublication,
    publications,
    currentPublicationId,
    unpublished,
    uploadMedia,
    mediaUrl,
    resolveMedia,
    reload,
    toasts,
    toast,
    dismiss,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
