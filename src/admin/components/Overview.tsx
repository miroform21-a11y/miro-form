"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAdmin } from "../store";
import { allSections, areaTitle, sectionHref } from "../sections";
import { btnCls, inputCls } from "./FieldEditor";
import { localeName } from "./AdminShell";
import { RecentChanges } from "./RecentChanges";

// Kyiv time on the server and in the browser alike (otherwise the server, in UTC, renders a different text)
const time = (iso?: string) => (iso ? new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Kyiv", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
const sourceName = { seed: "исходный перенос", publish: "публикация", restore: "откат" } as const;

/** Section titles of "area/locale/section" keys */
function changedSections(keys: string[]) {
  return keys.map((k) => {
    const [area, locale, section] = k.split("/");
    const def = allSections.find((s) => s.area === area && s.key === section);
    return `${def?.title ?? section} (${locale === "uk" ? "UA" : "EN"})`;
  });
}

export function PublishPanel() {
  const admin = useAdmin();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const changed = changedSections(admin.unpublished);
  return (
    <section aria-labelledby="publish" className="flex flex-col gap-3 rounded-2xl border border-lime/25 bg-lime/[0.04] p-4">
      <h2 id="publish" className="text-[15px] font-semibold text-white/90">
        Публикация
      </h2>
      <p className="text-[13px] text-white/60">
        {admin.currentPublicationId ? `На сайте сейчас версия №${admin.currentPublicationId}.` : "Ещё ничего не опубликовано — сайт показывает исходный контент."}{" "}
        {changed.length ? `Неопубликованные изменения: ${changed.join(", ")}.` : "Все сохранённые черновики уже на сайте."}
      </p>
      <label htmlFor="publish-note" className="text-[12.5px] text-white/60">
        Комментарий к версии (необязательно)
      </label>
      <input id="publish-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Например: новые цены" className={inputCls} />
      <button
        type="button"
        disabled={busy || !changed.length}
        onClick={async () => {
          if (!window.confirm(`Опубликовать изменения? Разделы: ${changed.join(", ")}. Сайт обновится сразу после публикации.`)) return;
          setBusy(true);
          const r = await admin.publish(note);
          setBusy(false);
          if (r.ok) setNote("");
        }}
        className="min-h-11 self-start rounded-lg bg-lime px-5 py-2 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {busy ? "Публикуем…" : "Опубликовать"}
      </button>
    </section>
  );
}

function Versions() {
  const admin = useAdmin();
  const [busy, setBusy] = useState<number | null>(null);
  if (!admin.publications.length) return null;
  return (
    <section aria-labelledby="versions" className="flex flex-col gap-3">
      <h2 id="versions" className="text-[15px] font-semibold text-white/85">
        Версии сайта
      </h2>
      <ol className="flex flex-col gap-2">
        {admin.publications.map((p) => {
          const current = p.id === admin.currentPublicationId;
          return (
            <li key={p.id} className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${current ? "border-lime/40 bg-lime/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-white/90">
                  {`№${p.id} · ${sourceName[p.source]}${p.restoredFrom ? ` версии №${p.restoredFrom}` : ""}`}
                  {current && <span className="ml-2 rounded bg-lime/20 px-1.5 text-[11px] text-lime">на сайте</span>}
                </p>
                <p className="mt-0.5 text-[12px] break-words text-white/45">{`${time(p.createdAt)}${p.note ? ` · ${p.note}` : ""}`}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!current && (
                  <button
                    type="button"
                    className={btnCls}
                    disabled={busy !== null}
                    onClick={async () => {
                      if (!window.confirm(`Вернуть на сайт версию №${p.id}? Текущая версия останется в списке, к ней можно будет вернуться.`)) return;
                      setBusy(p.id);
                      await admin.restorePublication(p.id);
                      setBusy(null);
                    }}
                  >
                    {busy === p.id ? "…" : "Вернуть на сайт"}
                  </button>
                )}
                <button
                  type="button"
                  className={btnCls}
                  disabled={busy !== null}
                  onClick={async () => {
                    if (!window.confirm(`Загрузить версию №${p.id} в черновики? Текущие черновики будут заменены (замену можно отменить в «Последних изменениях»). Сайт не изменится.`)) return;
                    setBusy(p.id);
                    await admin.loadPublication(p.id);
                    setBusy(null);
                  }}
                >
                  В черновик
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** /admin: publishing, versions, recent changes, export / import and the list of sections */
export function Overview() {
  const admin = useAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; message: string } | null>(null);

  const download = async () => {
    const json = await admin.exportJson();
    if (!json) return;
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `miroform-cms-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-5 py-8 md:px-8">
      <div>
        <h1 className="font-display text-[26px] font-semibold">Админ-панель MIROFORM</h1>
        <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-white/60">
          Правки сохраняются как черновики в базе данных и видны со всех ваших устройств. Посетители видят только опубликованную версию: она меняется кнопкой «Опубликовать», к
          любой прошлой версии можно вернуться.
        </p>
      </div>

      <PublishPanel />
      <RecentChanges />
      <Versions />

      <section aria-labelledby="data" className="flex flex-col gap-3">
        <h2 id="data" className="text-[15px] font-semibold text-white/85">
          Данные
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btnCls} onClick={download}>
            Скачать экспорт (JSON)
          </button>
          <button type="button" className={btnCls} onClick={() => fileRef.current?.click()}>
            Загрузить файл в черновики
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (!window.confirm("Загрузить контент из файла в черновики? Текущие черновики будут заменены (замену можно отменить). Сайт не изменится до публикации.")) return;
              const res = await admin.importJson(await file.text());
              setImportMsg(res);
            }}
          />
          {importMsg && <span className={`text-[12.5px] ${importMsg.ok ? "text-lime" : "text-orange"}`}>{importMsg.message}</span>}
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {(["uk", "en"] as const).map((l) =>
            (["site", "brief"] as const).map((a) => (
              <div key={a + l} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[13px]">
                <span className="flex-1">{`${areaTitle[a]} · ${localeName[l]}`}</span>
                <button
                  type="button"
                  className={btnCls}
                  onClick={() => {
                    if (window.confirm(`Заменить черновики «${areaTitle[a]}» (${localeName[l]}) исходным контентом сайта? Замену можно отменить; сайт не изменится до публикации.`)) void admin.resetArea(a, l);
                  }}
                >
                  Исходный контент в черновик
                </button>
              </div>
            )),
          )}
        </div>
        <p className="text-[12px] leading-snug text-white/40">
          Экспорт содержит черновики, последние 20 опубликованных версий и список файлов. Полная копия базы и файлов делается скриптом резервного копирования (npm run cms:backup).
        </p>
      </section>

      <section aria-labelledby="sections" className="flex flex-col gap-3">
        <h2 id="sections" className="text-[15px] font-semibold text-white/85">
          Разделы
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allSections.map((s) => (
            <div key={s.area + s.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <span className="flex-1 text-[13.5px]">
                <span className="block text-[11px] text-white/35">{s.group}</span>
                {s.title}
              </span>
              {(["uk", "en"] as const).map((l) => (
                <Link
                  key={l}
                  href={sectionHref(l, s)}
                  className="inline-flex items-center justify-center rounded-md border border-white/12 px-2 py-1 text-[12px] text-white/70 hover:border-lime hover:text-lime pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                >
                  {l === "uk" ? "UA" : "EN"}
                  {admin.isDirty(s.area, l, s.key) ? " •" : admin.isUnpublished(s.area, l, s.key) ? " ◦" : ""}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <p className="text-[12px] text-white/40">• — есть несохранённые правки, ◦ — сохранённый черновик ещё не опубликован.</p>
      </section>
    </div>
  );
}
