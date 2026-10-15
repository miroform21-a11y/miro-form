"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/locale";
import { useAdmin } from "../store";
import { groupedSections, sectionHref } from "../sections";
import { logout } from "@/app/admin/login/actions";

export const localeName: Record<Locale, string> = { uk: "Украинская версия", en: "Английская версия" };
export const localeShort: Record<Locale, string> = { uk: "UA", en: "EN" };

/** /admin/{locale}/{area}/{section} → its parts (null on the overview page) */
export function useRoute() {
  const parts = usePathname().split("/").filter(Boolean); // ["admin", locale, area, section]
  const locale = parts[1] === "uk" || parts[1] === "en" ? (parts[1] as Locale) : null;
  return { locale, area: parts[2] ?? null, section: parts[3] ?? null };
}

/** What visitors see vs the drafts, always visible under the header */
export function StatusBar() {
  const { unpublished, currentPublicationId } = useAdmin();
  const n = unpublished.length;
  return (
    <div role="status" className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 text-[12.5px] leading-snug md:px-6 ${n ? "border-amber-300/25 bg-amber-300/[0.08] text-amber-100/90" : "border-white/10 bg-white/[0.02] text-white/55"}`}>
      <span>
        {n
          ? `Черновики сохранены, но ещё не на сайте: разделов с изменениями — ${n}. Посетители видят ${currentPublicationId ? `версию №${currentPublicationId}` : "исходный контент"}.`
          : `Сайт показывает ${currentPublicationId ? `версию №${currentPublicationId}` : "исходный контент"}; неопубликованных изменений нет.`}
      </span>
      {n > 0 && (
        <Link href="/admin" className="font-semibold text-lime underline-offset-2 hover:underline pointer-coarse:py-2">
          Перейти к публикации
        </Link>
      )}
    </div>
  );
}

function Toasts() {
  const { toasts, dismiss } = useAdmin();
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(420px,calc(100vw-32px))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-[13.5px] leading-snug shadow-2xl backdrop-blur-xl ${
            t.kind === "success" ? "border-lime/40 bg-[#14180a]/95 text-lime" : t.kind === "error" ? "border-orange/50 bg-[#1d0f0b]/95 text-orange" : "border-white/15 bg-[#151515]/95 text-white/85"
          }`}
        >
          <span className="flex-1">{t.text}</span>
          <button type="button" aria-label="Закрыть уведомление" onClick={() => dismiss(t.id)} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { locale, area, section } = useRoute();
  const { isDirty, isUnpublished } = useAdmin();
  const loc = locale ?? "uk";
  return (
    <nav aria-label="Разделы админ-панели" className="flex flex-col gap-5 px-3 py-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {(["uk", "en"] as const).map((l) => {
          const active = l === loc;
          const href = area && section ? `/admin/${l}/${area}/${section}` : `/admin/${l}/site/hero`;
          return (
            <Link
              key={l}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "true" : undefined}
              className={`rounded-lg px-2 py-1.5 text-center text-[13px] font-medium transition-colors pointer-coarse:py-3 ${active ? "bg-lime text-ink" : "text-white/70 hover:bg-white/10"}`}
            >
              {localeShort[l]}
              {(isDirty("site", l) || isDirty("brief", l)) && <span className={active ? "text-ink" : "text-lime"}> •</span>}
            </Link>
          );
        })}
      </div>
      <p className="-mt-3 px-1 text-[11.5px] leading-snug text-white/40">{`${localeName[loc]}: языки редактируются и сохраняются независимо.`}</p>
      <Link
        href="/admin"
        onClick={onNavigate}
        className={`rounded-lg px-3 py-2 text-[13.5px] transition-colors pointer-coarse:py-3 ${!locale ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
      >
        Обзор и данные
      </Link>
      {groupedSections().map((g) => (
        <div key={g.group} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-white/35 uppercase">{g.group}</p>
          {g.sections.map((s) => {
            const active = locale && area === s.area && section === s.id;
            const dirty = isDirty(s.area, loc, s.key);
            const unpublishedHere = isUnpublished(s.area, loc, s.key);
            return (
              <Link
                key={s.area + s.id}
                href={sectionHref(loc, s)}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] transition-colors pointer-coarse:min-h-11 ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <span className="flex-1">{s.title}</span>
                {dirty && (
                  <span className="text-lime" title="Есть несохранённые изменения" aria-label="есть несохранённые изменения">
                    •
                  </span>
                )}
                {!dirty && unpublishedHere && (
                  <span className="text-amber-200/80" title="Черновик ещё не опубликован" aria-label="черновик не опубликован">
                    ◦
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="flex min-h-dvh flex-col bg-[#0b0b0b] text-white lg:h-dvh lg:overflow-hidden">
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-[#0b0b0b] lg:static">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/12 pointer-coarse:size-11 lg:hidden"
            aria-label={menu ? "Закрыть меню разделов" : "Открыть меню разделов"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? "✕" : "☰"}
          </button>
          <Link href="/admin" className="font-display text-[15px] font-semibold tracking-wide whitespace-nowrap pointer-coarse:py-3">
            MIROFORM <span className="hidden text-white/45 sm:inline">· Админ-панель</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap text-white/65 hover:bg-white/5 hover:text-white pointer-coarse:min-h-11"
            >
              <span className="max-[380px]:hidden">Открыть&nbsp;</span>сайт ↗
            </a>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center rounded-lg border border-white/12 px-3 py-1.5 text-[13px] whitespace-nowrap text-white/70 hover:bg-white/5 hover:text-white pointer-coarse:min-h-11">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="shrink-0">
        <StatusBar />
      </div>
      <div className="relative flex flex-1 lg:min-h-0">
        <aside
          className={`${menu ? "fixed inset-x-0 top-14 bottom-0 z-30 block overscroll-contain bg-[#0b0b0b]" : "hidden"} w-full shrink-0 overflow-y-auto border-r border-white/10 lg:static lg:block lg:w-[264px]`}
        >
          <Sidebar onNavigate={() => setMenu(false)} />
        </aside>
        <main id="admin-main" className="min-w-0 flex-1 lg:overflow-y-auto">
          {children}
        </main>
      </div>
      <Toasts />
    </div>
  );
}
