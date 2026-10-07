"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type ScrollProgressProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /**
   * Viewport fraction where the progress "head" sits: progress = how much of the element
   * has passed that line (0 → 1). Reversible when scrolling back up.
   */
  anchor?: number;
  /** Optional fixed travel distance (px) instead of the element height — for short horizontal timelines */
  travel?: number;
};

/** Exposes scroll progress through the element as the CSS variable `--progress` (0…1). */
export function ScrollProgress({ as: Tag = "div", className = "", children, anchor = 0.6, travel }: ScrollProgressProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const distance = travel ?? r.height;
      const p = Math.min(1, Math.max(0, (window.innerHeight * anchor - r.top) / distance));
      el.style.setProperty("--progress", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [anchor, travel]);

  return (
    <Tag ref={ref} className={className} style={{ "--progress": 0 } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
