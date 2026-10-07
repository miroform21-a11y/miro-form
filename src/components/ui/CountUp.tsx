"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  /** Text after the number, e.g. "+" or "%" */
  suffix?: string;
  duration?: number;
  /** Digits after the decimal point (e.g. 1 for "4.9") */
  decimals?: number;
  className?: string;
};

/** Animates a number from 0 to `to` the first time it becomes visible. */
export function CountUp({ to, suffix = "", duration = 1600, decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setValue(0);
    let frame = 0;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(decimals ? eased * to : Math.round(eased * to));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    // Start once ~40% visible, or if the element was scrolled past in one jump
    // (fast scroll / anchor link), which IntersectionObserver alone can miss.
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) start();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4 || entry.boundingClientRect.top < 0) start();
      },
      { threshold: [0, 0.4] },
    );

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    // The user may have scrolled before hydration — check the current position once
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [to, duration, decimals]);

  return (
    <span ref={ref} className={className} aria-label={`${to}${suffix}`}>
      <span aria-hidden="true">
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
