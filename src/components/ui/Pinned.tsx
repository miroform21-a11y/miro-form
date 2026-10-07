"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Keeps its children fixed on screen exactly where they are laid out in the page.
 * The children are portalled to <body> (the hero is its own stacking context, so a fixed
 * element inside it would slide under later sections); an empty placeholder of the same size
 * stays in the layout so nothing around it moves.
 */
export function Pinned({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const placeholder = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useIsoLayoutEffect(() => {
    if (!mounted) return;
    const measure = () => {
      const ph = placeholder.current;
      const el = box.current;
      if (!ph || !el) return;
      // Placeholder hidden at this breakpoint → hide the pinned element too
      if (getComputedStyle(ph).display === "none") {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      const size = el.getBoundingClientRect();
      ph.style.width = `${size.width}px`;
      ph.style.height = `${size.height}px`;
      const r = ph.getBoundingClientRect();
      el.style.top = `${r.top + window.scrollY}px`;
      el.style.left = `${r.left + window.scrollX}px`;
    };
    measure();
    // fonts can change the measured width once loaded
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mounted]);

  if (!mounted) return <div className={className}>{children}</div>;

  return (
    <>
      <div ref={placeholder} className={className} aria-hidden="true" />
      {createPortal(
        <div ref={box} className="fixed z-40">
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
