"use client";

import type { SeoContent } from "@/content/types";
import { routes, type Locale } from "@/i18n/locale";

const pages = [
  ["home", "Главная", "home"],
  ["privacy", "Политика конфиденциальности", "privacy"],
  ["brief", "Бриф", "brief"],
  ["thankYou", "Спасибо", "thankYou"],
] as const;

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + " …" : s);

/** Approximate search result and social card: pages keep their technical SEO (canonical, hreflang) in code. */
export function SeoPreview({ locale, seo }: { locale: Locale; seo: SeoContent }) {
  return (
    <div className="flex flex-col gap-6 overflow-y-auto">
      <p className="text-[12px] font-semibold tracking-[0.08em] text-white/40 uppercase">Как страницы могут выглядеть в поиске</p>
      {pages.map(([key, label, route]) => {
        const p = seo[key];
        const url = `www.miro-form.com${routes[locale][route] === "/" ? "" : routes[locale][route]}`;
        const noindex = key === "brief" || key === "thankYou";
        return (
          <div key={key} className="flex flex-col gap-3">
            <p className="text-[13px] text-white/60">
              {label}
              {noindex && <span className="ml-2 text-[11.5px] text-white/35">(закрыта от индексации — в поиске не показывается)</span>}
            </p>
            <div className="rounded-xl bg-white p-4 font-[arial,sans-serif]">
              <p className="text-[12px] text-[#4d5156]">{url}</p>
              <p className="mt-1 text-[19px] leading-snug text-[#1a0dab]">{cut(p.title, 62)}</p>
              <p className="mt-1 text-[13.5px] leading-snug text-[#4d5156]">{cut(p.description, 160)}</p>
            </div>
            {!noindex && (
              <div className="max-w-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
                <div className="grid aspect-[1.91/1] place-items-center bg-ink font-display text-[22px] text-white/80">MIROFORM</div>
                <div className="p-3">
                  <p className="text-[11px] text-white/40 uppercase">miro-form.com</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-white">{cut(p.title, 70)}</p>
                  <p className="mt-0.5 text-[12.5px] text-white/55">{cut(p.description, 110)}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-[11.5px] text-white/35">Поисковики сами решают, что показать; это приблизительный вид. Картинка превью в соцсетях остаётся прежней.</p>
    </div>
  );
}
