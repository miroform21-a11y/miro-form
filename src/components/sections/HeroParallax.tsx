"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Chrome 3D object and the giant "MIROFORM" wordmark of the hero,
 * with a light scroll parallax.
 */
export function HeroParallax() {
  const blobRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      if (blobRef.current) blobRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      if (wordRef.current) wordRef.current.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 will-change-transform"
      >
        {/* .hero-blob is the original Figma image box; the new render keeps its true proportions and
            is placed so the ring has the same width and top as before (see globals.css). */}
        <div className="hero-blob absolute">
          <Image
            src="/images/hero/metal.png"
            alt=""
            width={1591}
            height={989}
            priority
            sizes="(min-width: 1024px) 80vw, 150vw"
            className="absolute top-[7.732%] left-[-5.837%] h-[52.76%] w-[110.84%] max-w-none"
          />
        </div>
      </div>

      <p
        ref={wordRef}
        aria-hidden="true"
        className="text-chrome pointer-events-none absolute hidden font-display leading-[0.8] font-black tracking-[-0.06em] whitespace-nowrap select-none will-change-transform lg:block"
        style={{
          left: "calc(50% - var(--stage) * 0.4611)",
          top: "calc(var(--stage) * 0.3306)",
          fontSize: "calc(var(--stage) * 0.1319)",
        }}
      >
        MIROFORM
      </p>
    </>
  );
}
