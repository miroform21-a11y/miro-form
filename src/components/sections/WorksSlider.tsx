"use client";

import { useEffect, useRef, useState } from "react";
import { projects as projectsUk, type Project } from "@/data/projects";
import { siteContent } from "@/content";
import type { WorksContent } from "@/content/types";
import { ProjectCard } from "./ProjectCard";

/** Card geometry from the mobile Figma frame: height, media→info gap, bottom padding, info block height */
const mobileCards = [
  { h: 331, gap: 16, pb: 22, info: 82.74 },
  { h: 340, gap: 30, pb: 29, info: 84.74 },
  { h: 307, gap: 19, pb: 24, info: 84.74 },
  { h: 321.74, gap: 16, pb: 18, info: 77.74 },
  { h: 338.74, gap: 16, pb: 18, info: 94.74 },
  { h: 328.74, gap: 18, pb: 18, info: 84.74 },
];

/** Mobile swipe slider with pagination dots. */
export function WorksSlider({
  projects = projectsUk,
  labels = siteContent.uk.works.slider,
  cardLabels = siteContent.uk.works.card,
}: {
  projects?: Project[];
  labels?: WorksContent["slider"];
  cardLabels?: WorksContent["card"];
}) {
  const t = labels;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 12;
    setActive(Math.min(projects.length - 1, Math.round(track.scrollLeft / step)));
  };

  // A horizontal finger move marks the track as swiping: the cards' press effect (lift, arrow) is for taps only
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let y = 0;
    let timer: number | undefined;
    const end = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => delete track.dataset.swiping, 350);
    };
    const onStart = (e: TouchEvent) => {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (track.dataset.swiping) return;
      const dx = Math.abs(e.touches[0].clientX - x);
      if (dx > 6 && dx > Math.abs(e.touches[0].clientY - y)) {
        window.clearTimeout(timer);
        track.dataset.swiping = "";
      }
    };
    track.addEventListener("touchstart", onStart, { passive: true });
    track.addEventListener("touchmove", onMove, { passive: true });
    track.addEventListener("touchend", end, { passive: true });
    track.addEventListener("touchcancel", end, { passive: true });
    return () => {
      window.clearTimeout(timer);
      track.removeEventListener("touchstart", onStart);
      track.removeEventListener("touchmove", onMove);
      track.removeEventListener("touchend", end);
      track.removeEventListener("touchcancel", end);
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        aria-roledescription="carousel"
        aria-label={t.label}
        data-lenis-prevent-horizontal
        className="no-scrollbar flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain"
      >
        {projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            variant="mobile"
            labels={cardLabels}
            className="w-full shrink-0 snap-start"
            style={
              {
                height: mobileCards[i].h,
                "--card-gap": `${mobileCards[i].gap}px`,
                "--card-pb": `${mobileCards[i].pb}px`,
                "--card-info": `${mobileCards[i].info}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label={t.slides}>
        {projects.map((project, i) => (
          <button
            key={project.id}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`${t.slide} ${i + 1}: ${project.title}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-400 ease-(--ease-smooth) ${
              active === i ? "w-10 bg-ink-2" : "w-3 bg-ink-2/18"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
