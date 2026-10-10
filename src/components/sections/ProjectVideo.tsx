"use client";

import { useEffect, useRef } from "react";

/**
 * Looping, muted screen recording for a project card.
 * The file is only fetched when the card nears the viewport, plays while visible and pauses off-screen;
 * the poster (first frame) covers the frame until playback starts. Reduced motion keeps the poster.
 */
export function ProjectVideo({ src, mobileSrc, poster, label }: { src: string; mobileSrc: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (reduced.matches) return;
        if (!video.getAttribute("src")) {
          // 16:9 recording under object-cover: rendered width is the larger of the frame width and height × 16/9.
          // The 960px version covers phones and tablets; Full HD everywhere it would be visibly upscaled.
          const rendered = Math.max(video.clientWidth, (video.clientHeight * 16) / 9) * window.devicePixelRatio;
          video.src = rendered > 1200 ? src : mobileSrc;
        }
        video.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, mobileSrc]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="absolute inset-0 size-full object-cover object-top"
    />
  );
}
