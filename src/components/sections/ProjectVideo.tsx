"use client";

import { useEffect, useRef, useState } from "react";

type Trigger = "hover" | "visible";

/** Card must be at least this visible before the mobile countdown starts */
const VISIBLE_RATIO = 0.6;

/**
 * Screen recording layered over the project photo.
 * hover   — desktop: starts after the pointer has stayed on the card for `delay` ms, stops on leave.
 * visible — touch layouts: starts after the card has stayed ≥60% visible for `delay` ms, stops when it leaves.
 * The file is fetched only on the first start; the photo underneath shows whenever the video is not playing
 * (before start, after stop, if autoplay is refused, with reduced motion).
 */
export function ProjectVideo({ src, trigger, delay, label }: { src: string; trigger: Trigger; delay: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const card = video?.closest("article");
    if (!video || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.muted = true;

    let timer: number | undefined;
    let armed = false;

    const start = () => {
      if (armed) return;
      armed = true;
      timer = window.setTimeout(() => {
        if (!video.getAttribute("src")) video.src = src;
        video.currentTime = 0;
        video.play().catch(() => {}); // refused or interrupted: the photo stays
      }, delay);
    };
    const stop = () => {
      armed = false;
      window.clearTimeout(timer);
      video.pause();
      setPlaying(false);
    };
    const onPlaying = () => (armed ? setPlaying(true) : video.pause());
    video.addEventListener("playing", onPlaying);

    const onEnter = (e: PointerEvent) => e.pointerType !== "touch" && start();
    let observer: IntersectionObserver | undefined;
    if (trigger === "hover") {
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", stop);
    } else {
      observer = new IntersectionObserver(
        ([entry]) => (entry.intersectionRatio >= VISIBLE_RATIO ? start() : stop()),
        { threshold: [0, VISIBLE_RATIO] },
      );
      observer.observe(card);
    }

    // Background tab: stop; on return the visibility rule re-evaluates from zero
    const onPageVisibility = () => {
      if (document.hidden) stop();
      else if (observer) {
        observer.unobserve(card);
        observer.observe(card);
      }
    };
    document.addEventListener("visibilitychange", onPageVisibility);

    return () => {
      stop();
      video.removeEventListener("playing", onPlaying);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", stop);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onPageVisibility);
    };
  }, [src, trigger, delay]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={`absolute inset-0 size-full object-cover object-top transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}
