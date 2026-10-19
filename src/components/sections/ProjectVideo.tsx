"use client";

import { useEffect, useRef, useState } from "react";

type Trigger = "hover" | "visible";

/** Card must be at least this visible before the touch countdown starts */
const VISIBLE_RATIO = 0.6;

/** Soft lime light pulse (#AEEE05) played once as the video appears */
const FLASH_KEYFRAMES: Keyframe[] = [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }];
const FLASH_TIMING: KeyframeAnimationOptions = { duration: 320, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" };

/**
 * Screen recording layered over the project photo.
 * hover   — desktop: starts after the pointer has stayed on the card for `delay` ms, stops on leave.
 *           The file is buffered once the card nears the viewport, so the video can appear right on hover.
 * visible — touch layouts: starts after the card has stayed ≥60% visible for `delay` ms, stops when it leaves.
 *           The file starts loading when the countdown starts. The photo
 * underneath stays visible until a video frame is actually presented, and whenever the video is not playing
 * (after stop, on load error, if autoplay is refused, with reduced motion).
 */
export function ProjectVideo({ src, trigger, delay, label }: { src: string; trigger: Trigger; delay: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const card = video?.closest("article");
    if (!video || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.muted = true;

    let timer: number | undefined;
    let armed = false;
    let visible = false;

    const reveal = () => {
      if (!armed || visible) return;
      visible = true;
      setShown(true);
      flashRef.current?.animate(FLASH_KEYFRAMES, FLASH_TIMING);
    };
    const prepare = () => {
      if (video.getAttribute("src")) return;
      video.preload = "auto";
      video.src = src;
    };
    const start = () => {
      if (armed) return;
      armed = true;
      prepare();
      timer = window.setTimeout(() => {
        if (video.currentTime > 0) video.currentTime = 0; // hidden at this point, so the rewind is invisible
        video.play().catch(() => {}); // refused or interrupted: the photo stays
      }, delay);
    };
    const stop = () => {
      armed = false;
      visible = false;
      window.clearTimeout(timer);
      video.pause();
      setShown(false);
    };
    // Show only once a frame is really on screen — no black or empty frame over the photo
    const onPlaying = () => {
      if (!armed) return video.pause();
      if ("requestVideoFrameCallback" in video) video.requestVideoFrameCallback(reveal);
      else reveal();
    };
    video.addEventListener("playing", onPlaying);

    const onEnter = (e: PointerEvent) => e.pointerType !== "touch" && start();
    let observer: IntersectionObserver | undefined;
    let warmup: IntersectionObserver | undefined;
    if (trigger === "hover") {
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", stop);
      // Hidden layouts (display:none) never intersect, so only the visible bento buffers its videos
      warmup = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          prepare();
          warmup?.disconnect();
        },
        { rootMargin: "300px 0px" },
      );
      warmup.observe(card);
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
      warmup?.disconnect();
      document.removeEventListener("visibilitychange", onPageVisibility);
    };
  }, [src, trigger, delay]);

  return (
    <>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className={`absolute inset-0 size-full object-cover object-top transition-opacity duration-[400ms] ease-out ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <span
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
        style={{ background: "radial-gradient(120% 95% at 50% 42%, rgb(174 238 5 / 0.24) 0%, rgb(174 238 5 / 0.08) 45%, rgb(174 238 5 / 0) 75%)" }}
      />
    </>
  );
}
