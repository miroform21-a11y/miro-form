"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  /** Text after the number, e.g. "+" or "%" */
  suffix?: string;
  duration?: number;
  /** Digits after the decimal point (e.g. 1 for "4.9") */
  decimals?: number;
  /** Text before the number, e.g. "$" or "-" */
  prefix?: string;
  /** Group thousands with a space ("1 490"), or with the given separator ("," for US prices: "1,490") */
  group?: boolean | string;
  /** Reserve the final width so neighbours do not move while counting */
  reserve?: boolean;
  className?: string;
};

const format = (n: number, decimals: number, group: boolean | string) => {
  const s = n.toFixed(decimals);
  return group ? s.replace(/\B(?=(\d{3})+(?!\d))/g, group === true ? " " : group) : s;
};

/** Animates a number from 0 to `to` the first time it becomes visible. */
export function CountUp({ to, suffix = "", duration = 1600, decimals = 0, prefix = "", group = false, reserve = false, className }: CountUpProps) {
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
    <span ref={ref} className={`${reserve ? "inline-grid" : ""} ${className ?? ""}`} aria-label={`${prefix}${format(to, decimals, group)}${suffix}`}>
      {reserve && (
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {prefix}
          {format(to, decimals, group)}
          {suffix}
        </span>
      )}
      <span aria-hidden="true" className={reserve ? "col-start-1 row-start-1 text-right" : undefined}>
        {prefix}
        {format(value, decimals, group)}
        {suffix}
      </span>
    </span>
  );
}
