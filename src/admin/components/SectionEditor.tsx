"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { BriefContent, SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/locale";
import { useAdmin } from "../store";
import { validate } from "../fields";
import type { SectionDef } from "../sections/types";
import type { PreviewOptions } from "../preview-protocol";
import { Fields, btnCls } from "./FieldEditor";
import { PreviewFrame } from "./PreviewFrame";
import { SeoPreview } from "./SeoPreview";
import { localeName } from "./AdminShell";
import { BriefStepsEditor } from "./BriefStepsEditor";
import { briefStepsIssues } from "../brief-rules";

const time = (iso?: string) => (iso ? new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

export function SectionEditor({ locale, section }: { locale: Locale; section: SectionDef }) {
  const admin = useAdmin();
  const { area, key } = section;
  const slot = admin.slot(area, locale);
  const draft = admin.draft(area, locale) as unknown as Record<string, unknown>;
  const value = draft[key];
  const site = admin.draft("site", locale) as SiteContent;
  const brief = admin.draft("brief", locale) as BriefContent;
  const dirty = admin.isDirty(area, locale, key);
  const differs = admin.differsFromSite(area, locale, key);
  const unpublished = admin.isUnpublished(area, locale, key);
  // the preview shows uploaded (not yet public) files through short-lived signed URLs
  const resolveMedia = admin.resolveMedia;
  const previewSite = useMemo(() => resolveMedia(site), [resolveMedia, site]);
  const previewBrief = useMemo(() => resolveMedia(brief), [resolveMedia, brief]);
  const [options, setOptions] = useState<PreviewOptions>({});
  const [saving, setSaving] = useState(false);

  const issues = useMemo(
    () => (section.custom === "brief-steps" ? briefStepsIssues(value, locale) : validate(section.fields, value, "", { locale, root: draft })),
    [section, value, locale, draft],
  );
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const canSave = dirty && !errors.length && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    await admin.saveSection(area, locale, key, section.id);
    setSaving(false);
  };

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (canSave) void save();
        else if (dirty && errors.length) admin.toast("error", `Нельзя сохранить: исправьте ошибки (${errors.length}).`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  let status: ReactNode;
  if (dirty) status = <span className="text-lime">● Есть несохранённые изменения</span>;
  else if (unpublished) status = <span className="text-amber-200/90">{`Черновик сохранён${slot.savedAt ? ` · ${time(slot.savedAt)}` : ""} · ещё не опубликован`}</span>;
  else status = <span className="text-white/45">Совпадает с опубликованной версией сайта</span>;

  const previewOptions =
    section.preview === "thank-you" ? (
      <div role="group" aria-label="Вариант страницы" className="flex gap-1 text-[12px]">
        {[
          [false, "После заявки"],
          [true, "После вопроса"],
        ].map(([q, label]) => (
          <button
            key={String(q)}
            type="button"
            aria-pressed={!!options.question === q}
            onClick={() => setOptions({ question: q as boolean })}
            className={`rounded-md border border-white/10 px-2.5 py-1 pointer-coarse:min-h-11 ${!!options.question === q ? "bg-white/15 text-white" : "text-white/55"}`}
          >
            {label as string}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex min-h-full flex-col xl:h-full xl:flex-row">
      <div className="flex min-w-0 flex-col xl:w-[min(560px,46%)] xl:shrink-0 xl:overflow-y-auto xl:border-r xl:border-white/10">
        <div className="sticky top-14 z-20 border-b border-white/10 lg:top-0 bg-[#0b0b0b]/95 px-5 pt-4 pb-3 backdrop-blur">
          <p className="text-[12px] text-white/40">{`${localeName[locale]} · ${section.group}`}</p>
          <h1 className="mt-0.5 font-display text-[20px] font-semibold">{section.title}</h1>
          <p className="mt-1 text-[12.5px]" aria-live="polite">
            {status}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              title={errors.length ? "Сначала исправьте ошибки" : !dirty ? "Нет изменений" : "Ctrl+S"}
              className="rounded-lg bg-lime px-4 py-1.5 text-[13.5px] font-semibold text-ink pointer-coarse:min-h-11 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {saving ? "Сохраняем…" : "Сохранить черновик"}
            </button>
            <button type="button" className={btnCls} disabled={!dirty} onClick={() => admin.cancelSection(area, locale, key)}>
              Отменить изменения
            </button>
            <button
              type="button"
              className={btnCls}
              disabled={!differs}
              onClick={() => {
                if (window.confirm("Подставить в форму опубликованную версию этого раздела? Ваши правки раздела будут заменены (черновик изменится только после «Сохранить»)."))
                  admin.restoreSection(area, locale, key);
              }}
            >
              Вернуть опубликованное
            </button>
          </div>
          {(errors.length > 0 || warnings.length > 0) && (
            <p className="mt-2 text-[12.5px]">
              {errors.length > 0 && <span className="text-orange">{`Ошибок: ${errors.length} — сохранение недоступно. `}</span>}
              {warnings.length > 0 && <span className="text-amber-300/90">{`Предупреждений: ${warnings.length}.`}</span>}
            </p>
          )}
        </div>
        <div className="px-5 py-5">
          {section.custom === "brief-steps" ? (
            <BriefStepsEditor
              locale={locale}
              value={value}
              onChange={(v) => admin.setSection(area, locale, key, v)}
              issues={issues}
              step={options.step ?? 0}
              onStep={(step) => setOptions({ step })}
            />
          ) : (
            <Fields fields={section.fields} value={value} onChange={(v) => admin.setSection(area, locale, key, v)} issues={issues} ctx={{ locale, root: draft }} />
          )}
        </div>
      </div>
      <div className="flex min-h-[70vh] min-w-0 flex-1 flex-col gap-2 p-4 xl:h-full xl:min-h-0">
        {section.preview === "seo" ? (
          <SeoPreview locale={locale} seo={site.seo} />
        ) : (
          <>
            {previewOptions}
            <PreviewFrame locale={locale} view={section.preview} site={previewSite} brief={previewBrief} options={options} />
          </>
        )}
      </div>
    </div>
  );
}
