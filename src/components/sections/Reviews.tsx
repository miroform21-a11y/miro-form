"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { reviewsByLocale, type Review } from "@/data/reviews";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: { prev: "Попередні відгуки", next: "Наступні відгуки", tag: "Відгуки", title: "Що кажуть клієнти", carousel: "Відгуки клієнтів" },
  en: { prev: "Previous reviews", next: "Next reviews", tag: "Reviews", title: "What clients say", carousel: "Client reviews" },
} satisfies Record<Locale, Record<string, string>>;
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { RatingCard, ReviewCard } from "./ReviewCards";

function NavButtons({ onPrev, onNext, className = "", locale }: { onPrev: () => void; onNext: () => void; className?: string; locale: Locale }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label={copy[locale].prev}
        className="grid h-16 w-[62px] place-items-center rounded-full border border-white/20 bg-white/4 transition-[background-color,translate] duration-300 hover:-translate-x-0.5 hover:bg-white/10"
      >
        <img src="/images/reviews/chev-left.svg" alt="" className="h-[12.8px] w-[7.2px]" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={copy[locale].next}
        className="grid h-16 w-[62px] place-items-center rounded-full bg-lime transition-[translate,box-shadow] duration-300 hover:translate-x-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.6)]"
      >
        <img src="/images/reviews/chev-right.svg" alt="" className="h-[12.8px] w-[7.2px]" />
      </button>
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}

/** Stacked pages that cross-fade; keeps a stable height. */
function Pages({ pages, active, render }: { pages: Review[][]; active: number; render: (page: Review[]) => React.ReactNode }) {
  return (
    <div className="grid">
      {pages.map((page, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          inert={i !== active}
          className={`[grid-area:1/1] transition-[opacity,translate,visibility] duration-600 ease-(--ease-smooth) ${
            i === active ? "visible translate-x-0 opacity-100" : `invisible opacity-0 ${i < active ? "-translate-x-6" : "translate-x-6"}`
          }`}
        >
          {render(page)}
        </div>
      ))}
    </div>
  );
}

export function Reviews({ locale = "uk" }: { locale?: Locale }) {
  const t = copy[locale];
  const reviews = reviewsByLocale[locale];
  const pages4 = chunk(reviews, 4);
  const pages2 = chunk(reviews, 2);
  const [page4, setPage4] = useState(0);
  const [page2, setPage2] = useState(0);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const cycle = (set: React.Dispatch<React.SetStateAction<number>>, total: number, dir: 1 | -1) =>
    set((p) => (p + dir + total) % total);

  const onTrackScroll = () => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    setSlide(Math.min(reviews.length - 1, Math.round(track.scrollLeft / (card.offsetWidth + 12))));
  };

  const scrollToSlide = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[(i + reviews.length) % reviews.length] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft - 20, behavior: "smooth" });
  };

  return (
    <section id="reviews" className="relative overflow-hidden bg-ink pt-12 pb-[54px] md:pt-[53px] md:pb-20 xl:pb-[55px]">
      {/* Faint left glow (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-140px] left-[calc(50%-1074px)] hidden h-[728px] w-[644px] opacity-35 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] md:block"
      >
        <Image src="/images/glow.png" alt="" width={1470} height={1176} className="absolute top-[-154px] left-[-42px] size-[868px] max-w-none object-cover" />
      </div>

      <div className="relative mx-auto max-w-[1440px] md:px-8 lg:px-[clamp(40px,6.25vw,90px)]">
        {/* Header */}
        <Reveal className="flex items-end justify-between px-5 md:h-[151px] md:px-0">
          <div className="flex flex-col gap-[22px] md:gap-6">
            <SectionTag className="self-start">{t.tag}</SectionTag>
            <h2 className="font-display text-[34px] leading-[36px] font-bold md:leading-[1.05] tracking-[-0.03em] text-white md:text-[44px] md:whitespace-nowrap lg:text-[52px] xl:text-[64px]">
              {t.title}
            </h2>
          </div>
          <NavButtons locale={locale} className="hidden xl:flex" onPrev={() => cycle(setPage4, pages4.length, -1)} onNext={() => cycle(setPage4, pages4.length, 1)} />
          <NavButtons locale={locale} className="hidden md:flex xl:hidden" onPrev={() => cycle(setPage2, pages2.length, -1)} onNext={() => cycle(setPage2, pages2.length, 1)} />
        </Reveal>

        {/* Tablet & desktop */}
        <div className="mt-[69px] hidden gap-[19px] md:flex">
          <Reveal className="w-[clamp(340px,36vw,407px)] shrink-0">
            <RatingCard locale={locale} />
          </Reveal>
          <Reveal delay={100} className="min-w-0 flex-1">
            {/* ≥1280: 2×2 */}
            <div className="hidden xl:block">
              <Pages
                pages={pages4}
                active={page4}
                render={(page) => (
                  <div className="grid grid-cols-2 gap-x-[19px] gap-y-5">
                    {page.map((r) => (
                      <ReviewCard key={r.id} review={r} variant="desktop" locale={locale} />
                    ))}
                  </div>
                )}
              />
            </div>
            {/* 768–1279: 2 stacked */}
            <div className="xl:hidden">
              <Pages
                pages={pages2}
                active={page2}
                render={(page) => (
                  <div className="flex flex-col gap-5">
                    {page.map((r) => (
                      <ReviewCard key={r.id} review={r} variant="desktop" locale={locale} />
                    ))}
                  </div>
                )}
              />
            </div>
          </Reveal>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Reveal className="mt-8 px-5">
            <RatingCard locale={locale} />
          </Reveal>
          <div
            ref={trackRef}
            onScroll={onTrackScroll}
            aria-roledescription="carousel"
            aria-label={t.carousel}
            data-lenis-prevent-horizontal
            className="no-scrollbar mt-6 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain px-5"
          >
            {reviews.map((r) => (
              <div key={r.id} className="w-[300px] max-w-[calc(100vw-60px)] shrink-0 snap-start">
                <ReviewCard review={r} variant="mobile" locale={locale} />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between px-5">
            <p className="font-pixel text-[12px] leading-pixel text-white/50" aria-live="polite">
              {String(slide + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
            </p>
            <NavButtons locale={locale} onPrev={() => scrollToSlide(slide - 1)} onNext={() => scrollToSlide(slide + 1)} />
          </div>
        </div>
      </div>
    </section>
  );
}
