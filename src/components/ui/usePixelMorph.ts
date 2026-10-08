"use client";

import { useRef, useState, type PointerEvent } from "react";

/**
 * Shared "MIROFORM ↔ pixel MIROFORM" morph (see .logo-morph / .logo-img / .logo-pixel in globals.css).
 *
 * - desktop: hover → pixel, mouse leave → normal (pure CSS, pointer devices only);
 * - touch: tap → pixel, next tap → normal. No automatic loop.
 */
export function usePixelMorph<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [pixel, setPixel] = useState(false);

  return {
    ref,
    className: `logo-morph ${pixel ? "is-pixel" : ""}`,
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== "mouse") setPixel((p) => !p);
    },
  };
}
