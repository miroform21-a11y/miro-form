"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { briefContent, siteContent } from "@/content";
import type { BriefContent, SiteContent } from "@/content/types";
import type { ContentArea, ContentRepository, LoadProblem } from "@/content/repository";
import { SaveError } from "@/content/repository";
import { LocalStorageContentRepository, fillMissing } from "@/content/local-storage-repository";
import type { Locale } from "@/i18n/locale";
import { clone, getAt, join, same, setAt } from "./path";
import { describe, diff, imageAvailable, isImageValue, loadHistory, saveHistory, type HistoryEntry } from "./history";
import { allSections, findSection } from "./sections";

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
  /** `sectionId` names the admin section in the history (two sections can share one key) */
  saveSection: (area: ContentArea, locale: Locale, key: string, sectionId?: string) => Promise<boolean>;
  /** Saved changes, newest first (this browser only) */
  history: HistoryEntry[];
  historyProblem?: "corrupted" | "unavailable";
  /** Puts one saved change back; later changes of other fields stay */
  undo: (id: string) => Promise<{ ok: boolean; message: string }>;
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyProblem, setHistoryProblem] = useState<"corrupted" | "unavailable">();
  /** The latest saved data, for async actions that run after several state updates */
  const stateRef = useRef<State | null>(null);
  const historyRef = useRef<HistoryEntry[]>([]);

  const persistHistory = useCallback((next: HistoryEntry[]) => {
    const { kept } = saveHistory(next);
    historyRef.current = kept;
    setHistory(kept);
  }, []);

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
      if (!cancelled) {
        setState(next);
        const h = loadHistory();
        historyRef.current = h.entries;
        setHistory(h.entries);
        setHistoryProblem(h.problem);
      }
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
    async (area: ContentArea, locale: Locale, key: string, sectionId?: string) => {
      const s = state[area][locale] as Slot<Record<string, unknown>>;
      const nextSaved = { ...s.saved, [key]: clone(s.draft[key]) };
      try {
        const { savedAt } = await repo.save(area, locale, nextSaved);
        update(area, locale, (cur) => ({ ...cur, saved: nextSaved, savedAt, source: "stored", problem: undefined }));
        // one history entry per changed field; a save that changes very many fields at once is one entry
        const section = (sectionId && findSection(area, sectionId)) || allSections.find((x) => x.area === area && x.key === key);
        if (section) {
          let changes = diff(s.saved[key], nextSaved[key]);
          if (changes.length > 12) changes = [{ path: "", before: s.saved[key], after: nextSaved[key] }];
          const entries: HistoryEntry[] = changes.map((c, i) => ({
            id: `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            area,
            locale,
            key,
            sectionId: section.id,
            sectionTitle: section.title,
            path: c.path,
            ...describe(section, c.path, c.before, c.after, nextSaved[key]),
            before: clone(c.before),
            after: clone(c.after),
            at: savedAt,
          }));
          if (entries.length) persistHistory([...entries.reverse(), ...historyRef.current]);
        }
        toast("success", "Сохранено в этом браузере. На сайте ничего не изменилось — это демо-режим.");
        return true;
      } catch (e) {
        toast("error", e instanceof SaveError ? e.message : "Не удалось сохранить данные в браузере.");
        return false;
      }
    },
    [repo, state, toast, update, persistHistory],
  );

  stateRef.current = state;

  const undo = useCallback(
    async (id: string): Promise<{ ok: boolean; message: string }> => {
      const fail = (message: string) => {
        toast("error", message);
        return { ok: false, message };
      };
      const e = historyRef.current.find((x) => x.id === id);
      const st = stateRef.current;
      if (!e || !st) return fail("Это изменение уже отменено или удалено из истории.");
      const s = st[e.area][e.locale] as Slot<Record<string, unknown>>;
      if (!s.loaded) return fail("Данные ещё загружаются — попробуйте через секунду.");
      if (e.payloadDropped) return fail("Это изменение нельзя отменить: прежнее изображение не поместилось в хранилище браузера и не сохранилось.");
      const full = join(e.key, e.path);
      if (!same(getAt(s.saved, full), e.after))
        return fail(`Нельзя отменить «${e.description}»: это поле позже изменили ещё раз. Сначала отмените более позднее изменение этого поля.`);
      if (!same(s.draft[e.key], s.saved[e.key]))
        return fail(`В разделе «${e.sectionTitle}» (${e.locale === "uk" ? "UA" : "EN"}) есть несохранённые правки. Сохраните или отмените их, затем повторите отмену.`);
      if (isImageValue(e.before) && !(await imageAvailable(e.before)))
        return fail("Нельзя отменить: прежнее изображение больше недоступно. Данные не изменены.");
      const nextSaved = setAt(s.saved, full, clone(e.before));
      try {
        const { savedAt } = await repo.save(e.area, e.locale, nextSaved);
        update(e.area, e.locale, (cur) => ({ ...cur, saved: nextSaved, draft: setAt(cur.draft, full, clone(e.before)), savedAt, source: "stored", problem: undefined }));
      } catch (err) {
        return fail(err instanceof SaveError ? err.message : "Не удалось сохранить отмену в браузере. Данные не изменены.");
      }
      persistHistory(historyRef.current.filter((x) => x.id !== id));
      const message = `Отменено: ${e.description}. Сохранено в этом браузере.`;
      toast("success", message);
      return { ok: true, message };
    },
    [repo, toast, update, persistHistory],
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
      // the changes of this area and language no longer apply to the data
      persistHistory(historyRef.current.filter((x) => !(x.area === area && x.locale === locale)));
      toast("success", "Демо-данные удалены из браузера — показаны текущие данные сайта. Их история изменений очищена.");
    },
    [repo, toast, update, persistHistory],
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
            const raw = parsed[area]?.[locale] as object | undefined;
            if (!raw) continue;
            // fields added to the site after the export was made come from the current defaults
            const data = fillMissing(raw, defaultsOf(area, locale)) as object;
            const { savedAt } = await repo.save(area, locale, data);
            update(area, locale, () => ({ saved: data, draft: clone(data), loaded: true, savedAt, source: "stored" }));
            count++;
          }
      } catch (e) {
        return { ok: false, message: e instanceof SaveError ? e.message : "Не удалось записать импортированные данные." };
      }
      persistHistory([]);
      return { ok: true, message: `Импортировано наборов данных: ${count}. Они сохранены только в этом браузере. История изменений очищена.` };
    },
    [repo, update, persistHistory],
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
    history,
    historyProblem,
    undo,
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
