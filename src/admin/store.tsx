"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { briefContent, siteContent } from "@/content";
import type { BriefContent, SiteContent } from "@/content/types";
import type { ContentArea, ContentRepository, LoadProblem } from "@/content/repository";
import { SaveError } from "@/content/repository";
import { LocalStorageContentRepository } from "@/content/local-storage-repository";
import type { Locale } from "@/i18n/locale";
import { clone, same } from "./path";

/**
 * Admin state: for every area (site / brief) and language a saved copy and an editable draft.
 * The two languages are separate objects — editing one never touches the other.
 * Saved copies live in the browser demo store only (see LocalStorageContentRepository).
 */

type AreaData = { site: SiteContent; brief: BriefContent };
type Slot<T> = { saved: T; draft: T; loaded: boolean; problem?: LoadProblem; savedAt?: string; source?: "stored" | "defaults" };
type State = { [A in ContentArea]: Record<Locale, Slot<AreaData[A]>> };

export type Toast = { id: number; kind: "success" | "error" | "info"; text: string };

const defaultsOf = <A extends ContentArea>(area: A, locale: Locale): AreaData[A] =>
  clone((area === "site" ? siteContent[locale] : briefContent[locale]) as AreaData[A]);

const initialSlot = <A extends ContentArea>(area: A, locale: Locale): Slot<AreaData[A]> => {
  const d = defaultsOf(area, locale);
  return { saved: d, draft: clone(d), loaded: false };
};

const initialState = (): State => ({
  site: { uk: initialSlot("site", "uk"), en: initialSlot("site", "en") },
  brief: { uk: initialSlot("brief", "uk"), en: initialSlot("brief", "en") },
});

type Ctx = {
  repo: ContentRepository;
  state: State;
  draft: <A extends ContentArea>(area: A, locale: Locale) => AreaData[A];
  saved: <A extends ContentArea>(area: A, locale: Locale) => AreaData[A];
  slot: (area: ContentArea, locale: Locale) => Slot<unknown>;
  /** Replace one top-level section of the draft */
  setSection: (area: ContentArea, locale: Locale, key: string, value: unknown) => void;
  isDirty: (area: ContentArea, locale: Locale, key?: string) => boolean;
  /** true when the section differs from the current site content */
  differsFromSite: (area: ContentArea, locale: Locale, key: string) => boolean;
  saveSection: (area: ContentArea, locale: Locale, key: string) => Promise<boolean>;
  cancelSection: (area: ContentArea, locale: Locale, key: string) => void;
  /** Put the site content of this section back into the draft (still needs saving) */
  restoreSection: (area: ContentArea, locale: Locale, key: string) => void;
  /** Remove the stored draft of an area + language entirely */
  resetArea: (area: ContentArea, locale: Locale) => Promise<void>;
  exportJson: () => string;
  importJson: (json: string) => Promise<{ ok: boolean; message: string }>;
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

const problemText: Record<LoadProblem, string> = {
  corrupted: "Сохранённые демо-данные повреждены и не загружены — показаны текущие данные сайта.",
  outdated: "Сохранённые демо-данные устарели (изменилась структура контента) и не загружены — показаны текущие данные сайта.",
  unavailable: "Хранилище браузера недоступно (приватный режим или запрет данных сайтов). Изменения нельзя будет сохранить.",
};
export const describeProblem = (p: LoadProblem) => problemText[p];

export function AdminProvider({ children }: { children: ReactNode }) {
  const repo = useMemo<ContentRepository>(() => new LocalStorageContentRepository(), []);
  const [state, setState] = useState<State>(initialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToast = useRef(1);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextToast.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 4500);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // load stored drafts once, on the client (localStorage does not exist on the server)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = initialState();
      for (const area of ["site", "brief"] as const)
        for (const locale of ["uk", "en"] as const) {
          const res = await repo.load(area, locale, defaultsOf(area, locale));
          (next[area] as Record<Locale, Slot<unknown>>)[locale] = {
            saved: res.data,
            draft: clone(res.data),
            loaded: true,
            problem: res.problem,
            savedAt: res.savedAt,
            source: res.source,
          };
        }
      if (!cancelled) setState(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const slot = useCallback((area: ContentArea, locale: Locale) => state[area][locale] as Slot<unknown>, [state]);

  const update = useCallback((area: ContentArea, locale: Locale, fn: (s: Slot<unknown>) => Slot<unknown>) => {
    setState((st) => ({ ...st, [area]: { ...st[area], [locale]: fn(st[area][locale] as Slot<unknown>) } }));
  }, []);

  const setSection = useCallback(
    (area: ContentArea, locale: Locale, key: string, value: unknown) =>
      update(area, locale, (s) => ({ ...s, draft: { ...(s.draft as object), [key]: value } })),
    [update],
  );

  const isDirty = useCallback(
    (area: ContentArea, locale: Locale, key?: string) => {
      const s = state[area][locale] as Slot<Record<string, unknown>>;
      return key ? !same(s.draft[key], s.saved[key]) : !same(s.draft, s.saved);
    },
    [state],
  );

  const differsFromSite = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      const s = state[area][locale] as Slot<Record<string, unknown>>;
      return !same(s.draft[key], (defaultsOf(area, locale) as Record<string, unknown>)[key]);
    },
    [state],
  );

  const saveSection = useCallback(
    async (area: ContentArea, locale: Locale, key: string) => {
      const s = state[area][locale] as Slot<Record<string, unknown>>;
      const nextSaved = { ...s.saved, [key]: clone(s.draft[key]) };
      try {
        const { savedAt } = await repo.save(area, locale, nextSaved);
        update(area, locale, (cur) => ({ ...cur, saved: nextSaved, savedAt, source: "stored", problem: undefined }));
        toast("success", "Сохранено в этом браузере. На сайте ничего не изменилось — это демо-режим.");
        return true;
      } catch (e) {
        toast("error", e instanceof SaveError ? e.message : "Не удалось сохранить данные в браузере.");
        return false;
      }
    },
    [repo, state, toast, update],
  );

  const cancelSection = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      update(area, locale, (s) => ({ ...s, draft: { ...(s.draft as object), [key]: clone((s.saved as Record<string, unknown>)[key]) } }));
      toast("info", "Несохранённые изменения раздела отменены.");
    },
    [toast, update],
  );

  const restoreSection = useCallback(
    (area: ContentArea, locale: Locale, key: string) => {
      update(area, locale, (s) => ({ ...s, draft: { ...(s.draft as object), [key]: (defaultsOf(area, locale) as Record<string, unknown>)[key] } }));
      toast("info", "В форму подставлены текущие данные сайта. Нажмите «Сохранить», чтобы заменить ими демо-данные.");
    },
    [toast, update],
  );

  const resetArea = useCallback(
    async (area: ContentArea, locale: Locale) => {
      await repo.clear(area, locale);
      const d = defaultsOf(area, locale);
      update(area, locale, () => ({ saved: d, draft: clone(d), loaded: true, source: "defaults" }));
      toast("success", "Демо-данные удалены из браузера — показаны текущие данные сайта.");
    },
    [repo, toast, update],
  );

  const exportJson = useCallback(() => {
    const out = {
      format: "miroform-admin-demo",
      exportedAt: new Date().toISOString(),
      site: { uk: state.site.uk.saved, en: state.site.en.saved },
      brief: { uk: state.brief.uk.saved, en: state.brief.en.saved },
    };
    return JSON.stringify(out, null, 2);
  }, [state]);

  const importJson = useCallback(
    async (json: string) => {
      let parsed: { format?: string; site?: Record<string, unknown>; brief?: Record<string, unknown> };
      try {
        parsed = JSON.parse(json);
      } catch {
        return { ok: false, message: "Файл не является корректным JSON." };
      }
      if (parsed?.format !== "miroform-admin-demo") return { ok: false, message: "Это не файл экспорта демо-админки MIROFORM." };
      let count = 0;
      for (const area of ["site", "brief"] as const)
        for (const locale of ["uk", "en"] as const) {
          const data = parsed[area]?.[locale];
          if (!data) continue;
          const defaults = defaultsOf(area, locale) as Record<string, unknown>;
          const ok =
            typeof data === "object" &&
            Object.entries(defaults).every(([k, v]) => k in (data as object) && typeof (data as Record<string, unknown>)[k] === typeof v);
          if (!ok) return { ok: false, message: `Раздел «${area}/${locale}» в файле имеет неверную структуру. Ничего не импортировано.` };
        }
      try {
        for (const area of ["site", "brief"] as const)
          for (const locale of ["uk", "en"] as const) {
            const data = parsed[area]?.[locale] as object | undefined;
            if (!data) continue;
            const { savedAt } = await repo.save(area, locale, data);
            update(area, locale, () => ({ saved: data, draft: clone(data), loaded: true, savedAt, source: "stored" }));
            count++;
          }
      } catch (e) {
        return { ok: false, message: e instanceof SaveError ? e.message : "Не удалось записать импортированные данные." };
      }
      return { ok: true, message: `Импортировано наборов данных: ${count}. Они сохранены только в этом браузере.` };
    },
    [repo, update],
  );

  const value: Ctx = {
    repo,
    state,
    draft: (area, locale) => state[area][locale].draft as never,
    saved: (area, locale) => state[area][locale].saved as never,
    slot,
    setSection,
    isDirty,
    differsFromSite,
    saveSection,
    cancelSection,
    restoreSection,
    resetArea,
    exportJson,
    importJson,
    toasts,
    toast,
    dismiss,
  };

  // leaving the page with unsaved changes
  const anyDirty = (["site", "brief"] as const).some((a) => (["uk", "en"] as const).some((l) => !same(state[a][l].draft, state[a][l].saved)));
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
