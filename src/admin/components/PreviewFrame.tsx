"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BriefContent, SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/locale";
import { PREVIEW_READY, PREVIEW_RENDER, type PreviewOptions, type PreviewRender } from "../preview-protocol";
import type { PreviewView } from "../sections/types";

const WIDTHS = [
  { w: 1440, label: "Десктоп 1440" },
  { w: 768, label: "Планшет 768" },
  { w: 390, label: "Телефон 390" },
] as const;

/**
 * The real public components rendered with the current draft, inside an iframe of the chosen width
 * (scaled down to fit). Forms in the preview never send anything.
 */
export function PreviewFrame({
  locale,
  view,
  site,
  brief,
  options,
}: {
  locale: Locale;
  view: PreviewView;
  site: SiteContent;
  brief: BriefContent;
  options: PreviewOptions;
}) {
  const [width, setWidth] = useState<number>(1440);
  /** On a phone the preview starts with the phone layout (the desktop one would be scaled to ~25%) */
  const pickedWidth = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    if (!pickedWidth.current && window.innerWidth < 768) setWidth(390);
    return () => ro.disconnect();
  }, []);

  const post = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    const msg: PreviewRender = { type: PREVIEW_RENDER, locale, view, site, brief, options };
    win.postMessage(msg, window.location.origin);
  }, [locale, view, site, brief, options]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_READY) {
        setReady(true);
        post();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post]);

  useEffect(() => {
    if (ready) post();
  }, [ready, post]);

  const scale = box.w ? Math.min(1, box.w / width) : 1;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold tracking-[0.08em] text-white/40 uppercase">Предпросмотр</span>
        <div role="group" aria-label="Ширина предпросмотра" className="flex gap-1 rounded-lg border border-white/10 p-0.5">
          {WIDTHS.map((x) => (
            <button
              key={x.w}
              type="button"
              aria-pressed={width === x.w}
              onClick={() => {
                pickedWidth.current = true;
                setWidth(x.w);
              }}
              className={`rounded-md px-2.5 py-1 text-[12px] transition-colors pointer-coarse:min-h-11 ${width === x.w ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setReady(false);
            setReloadKey((k) => k + 1);
          }}
          className="rounded-md px-2 py-1 text-[12px] text-white/55 hover:text-white pointer-coarse:min-h-11"
        >
          ↻ Перезапустить
        </button>
        <span className="ml-auto text-[11.5px] text-white/35">{`масштаб ${Math.round(scale * 100)}%`}</span>
      </div>
      <div ref={boxRef} className="relative h-[78svh] min-h-[420px] overflow-hidden rounded-xl border border-white/10 bg-ink xl:h-auto xl:min-h-0 xl:flex-1">
        {box.w > 0 && (
          <iframe
            key={reloadKey}
            ref={frameRef}
            src="/admin/preview"
            title="Предпросмотр страницы с несохранёнными изменениями"
            style={{ width, height: box.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            className="absolute top-0 left-0 border-0"
          />
        )}
        {!ready && <div className="absolute inset-0 grid place-items-center text-[13px] text-white/40">Загрузка предпросмотра…</div>}
      </div>
      <p className="text-[11.5px] leading-snug text-white/35">
        Показаны настоящие компоненты сайта с текущими (в том числе несохранёнными) правками. Отправка форм и переходы по ссылкам в предпросмотре отключены.
      </p>
    </div>
  );
}
