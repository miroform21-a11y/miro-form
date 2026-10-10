"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { describeProblem, useAdmin } from "../store";
import { allSections, areaTitle, sectionHref } from "../sections";
import { btnCls } from "./FieldEditor";
import { localeName } from "./AdminShell";

const time = (iso?: string) => (iso ? new Date(iso).toLocaleString("ru-RU") : "");

/** /admin: what is stored in this browser per language, reset, export / import, and the list of sections. */
export function Overview() {
  const admin = useAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; message: string } | null>(null);

  const download = () => {
    const blob = new Blob([admin.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `miroform-admin-demo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-5 py-8 md:px-8">
      <div>
        <h1 className="font-display text-[26px] font-semibold">Админ-панель MIROFORM</h1>
        <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-white/60">
          Демонстрационная версия: здесь можно редактировать тексты, списки и настройки сайта и брифа отдельно для украинской и английской версий и сразу
          видеть результат в предпросмотре. Сохранение работает только в этом браузере — на сайт изменения не попадают.
        </p>
      </div>

      <section aria-labelledby="storage" className="flex flex-col gap-3">
        <h2 id="storage" className="text-[15px] font-semibold text-white/85">
          Данные в этом браузере
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(["uk", "en"] as const).map((l) => (
            <div key={l} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-semibold">{localeName[l]}</p>
              {(["site", "brief"] as const).map((a) => {
                const s = admin.slot(a, l);
                return (
                  <div key={a} className="flex flex-col gap-1.5 border-t border-white/10 pt-3 text-[13px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white/85">{areaTitle[a]}</span>
                      <span className="text-white/50">
                        {!s.loaded ? "загрузка…" : s.source === "stored" ? `сохранённые демо-данные от ${time(s.savedAt)}` : "текущие данные сайта (ничего не сохранено)"}
                      </span>
                      {admin.isDirty(a, l) && <span className="text-lime">● есть несохранённые изменения</span>}
                    </div>
                    {s.problem && <p className="text-[12.5px] text-orange">{describeProblem(s.problem)}</p>}
                    <button
                      type="button"
                      className={`${btnCls} self-start`}
                      disabled={s.source !== "stored" && !s.problem && !admin.isDirty(a, l)}
                      onClick={() => {
                        if (window.confirm(`Удалить все демо-данные «${areaTitle[a]}» (${localeName[l]}) из этого браузера и вернуть текущие данные сайта? Другой язык не изменится.`))
                          void admin.resetArea(a, l);
                      }}
                    >
                      Сбросить к данным сайта
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btnCls} onClick={download}>
            Скачать сохранённое (JSON)
          </button>
          <button type="button" className={btnCls} onClick={() => fileRef.current?.click()}>
            Загрузить из файла JSON
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
              if (!window.confirm("Импорт заменит сохранённые в браузере демо-данные теми, что есть в файле. Продолжить?")) return;
              const res = await admin.importJson(await file.text());
              setImportMsg(res);
              admin.toast(res.ok ? "success" : "error", res.message);
            }}
          />
          {importMsg && <span className={`text-[12.5px] ${importMsg.ok ? "text-lime" : "text-orange"}`}>{importMsg.message}</span>}
        </div>
        <p className="text-[12px] leading-snug text-white/40">
          Экспорт нужен, чтобы перенести правки в другой браузер или передать их разработчику. Файлы изображений и видео в экспорт не входят — только пути к ним.
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
                <Link key={l} href={sectionHref(l, s)} className="rounded-md border border-white/12 px-2 py-1 text-[12px] text-white/70 hover:border-lime hover:text-lime">
                  {l === "uk" ? "UA" : "EN"}
                  {admin.isDirty(s.area, l, s.key) ? " •" : ""}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="limits" className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[13px] leading-relaxed text-white/60">
        <h2 id="limits" className="text-[14px] font-semibold text-white/80">
          Ограничения демо-версии
        </h2>
        <ul className="list-disc pl-5">
          <li>Нет входа по паролю: панель открывается только при локальном запуске и не выкладывается на рабочий домен.</li>
          <li>Сохранение — в localStorage этого браузера; другой браузер, устройство или очистка данных их не увидят.</li>
          <li>Файлы изображений и видео не загружаются: выбранный файл виден только в предпросмотре текущей вкладки.</li>
          <li>Сайт, проверка заявок на сервере и сообщения в Telegram по-прежнему используют данные из кода.</li>
        </ul>
      </section>
    </div>
  );
}
