"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "../store";
import { preview } from "../history";
import { sectionHref } from "../sections";
import { btnCls } from "./FieldEditor";

const SHOWN = 5;
const time = (iso: string) => new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Kyiv", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The last saved changes with an undo button each (overview page) */
export function RecentChanges() {
  const { history, undo } = useAdmin();
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);
  const shown = history.slice(0, SHOWN);

  return (
    <section aria-labelledby="recent" className="flex flex-col gap-3">
      <h2 id="recent" className="text-[15px] font-semibold text-white/85">
        Последние изменения
      </h2>
      {result && (
        <p role={result.ok ? "status" : "alert"} className={`rounded-lg border px-3 py-2 text-[12.5px] ${result.ok ? "border-lime/30 text-lime" : "border-orange/40 bg-orange/10 text-orange"}`}>
          {result.message}
        </p>
      )}
      {shown.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] text-white/45">Пока нет сохранённых изменений.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {shown.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-white/90">{e.description}</p>
                <p className="mt-0.5 text-[12px] text-white/50">
                  <Link href={sectionHref(e.locale, { area: e.area, id: e.sectionId })} className="text-white/70 underline-offset-2 hover:text-lime hover:underline">
                    {`${e.sectionTitle} · ${e.locale === "uk" ? "UA" : "EN"}`}
                  </Link>
                  {` · ${e.field}`}
                </p>
                <p className="mt-0.5 text-[12px] break-words text-white/35">{`${preview(e.before)} → ${preview(e.after)} · ${time(e.at)}`}</p>
              </div>
              <button
                type="button"
                className={`${btnCls} shrink-0 self-start sm:self-center`}
                disabled={busy !== null}
                aria-label={`Отменить: ${e.description}`}
                onClick={async () => {
                  setBusy(e.id);
                  const r = await undo(e.id);
                  setResult({ id: e.id, ...r });
                  setBusy(null);
                }}
              >
                {busy === e.id ? "Отменяем…" : "Отменить"}
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="text-[12px] leading-snug text-white/40">
        Сюда попадают только сохранённые изменения данных (не посещения разделов). История хранится в базе данных и одинакова на всех ваших устройствах: показаны 5 последних. Отмена возвращает в черновик
        прежнее значение одного поля и не трогает более поздние изменения других полей.
      </p>
    </section>
  );
}
