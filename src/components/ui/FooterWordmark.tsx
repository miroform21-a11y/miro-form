"use client";

import { usePixelMorph } from "./usePixelMorph";

/**
 * Giant footer "MIROFORM®" with the same pixel morph as the header logo:
 * hover on desktop, tap / second tap on touch screens.
 */
export function FooterWordmark({ className = "" }: { className?: string }) {
  const morph = usePixelMorph<HTMLDivElement>();
  const gradient = "bg-gradient-to-b from-white to-[#2a2a2a] bg-clip-text text-transparent";

  return (
    <div
      ref={morph.ref}
      onPointerDown={morph.onPointerDown}
      aria-hidden="true"
      className={`${morph.className} relative w-max select-none ${className}`}
    >
      <p className={`logo-img font-display leading-[0.9] font-bold tracking-[-0.04em] whitespace-nowrap ${gradient}`}>MIROFORM®</p>
      {/* Pixel version (Press Start 2P), sized to span the same width */}
      <span
        className={`logo-pixel pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-pixel text-[0.85em] leading-none whitespace-nowrap ${gradient}`}
      >
        MIROFORM®
      </span>
    </div>
  );
}
