"use client";

import { Fragment, useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Splits a gray text fragment into words that ScrollRead "reads" (gray → white) while scrolling.
 * Server-safe: renders plain spans.
 */
export function ReadWords({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^\s+$/.test(p) || p === "" ? <Fragment key={i}>{p}</Fragment> : <span key={i} data-rw="">{p}</span>,
      )}
    </>
  );
}

type ScrollReadProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Opacity of the unread words (matches the design's gray, e.g. 0.45 / 0.35) */
  from: number;
};

/**
 * Scroll-linked "reading" effect: words marked with ReadWords turn from gray to white as the
 * block moves up through the viewport, and back to gray when scrolling up.
 */
export function ScrollRead({ as: Tag = "p", className = "", children, from }: ScrollReadProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // Only words that are actually rendered (mobile/desktop variants are toggled with display)
      const words = [...root.querySelectorAll<HTMLElement>("[data-rw]")].filter((w) => w.offsetParent !== null);
      if (!words.length) return;
      const vh = window.innerHeight;
      const r = root.getBoundingClientRect();
      // 0 when the block's top is at 85% of the viewport, 1 when its bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const n = words.length;
      words.forEach((w, i) => {
        const local = Math.min(1, Math.max(0, p * (n + 2) - i));
        w.style.color = `rgba(255,255,255,${(from + (1 - from) * local).toFixed(3)})`;
      });
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
  }, [from]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
