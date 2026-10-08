"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

/**
 * Shared "MIROFORM ↔ pixel MIROFORM" morph (see .logo-morph / .logo-img / .logo-pixel in globals.css).
 *
 * - hover (pointer devices) is pure CSS;
 * - a tap on touch screens plays the pixel state once;
 * - `cycle` loops by itself: `cycle` ms normal → `cycle` ms pixel → … (only while on screen,
 *   and never with prefers-reduced-motion).
 */
export function usePixelMorph<T extends HTMLElement>({ cycle }: { cycle?: number } = {}) {
  const ref = useRef<T>(null);
  const [tapped, setTapped] = useState(false);
  const [cyclePixel, setCyclePixel] = useState(false);

  useEffect(() => {
    if (!tapped) return;
    const t = setTimeout(() => setTapped(false), 1100);
    return () => clearTimeout(t);
  }, [tapped]);

  useEffect(() => {
    const el = ref.current;
    if (!cycle || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(() => setCyclePixel((p) => !p), cycle);
      else setCyclePixel(false);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [cycle]);

  return {
    ref,
    className: `logo-morph ${tapped || cyclePixel ? "is-pixel" : ""}`,
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== "mouse") setTapped(true);
    },
  };
}
