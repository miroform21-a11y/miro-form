"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Inertial wheel scrolling (Lenis) for the whole page.
 *
 * Lenis moves the real window scroll, so every existing scroll-driven effect (scroll listeners,
 * IntersectionObserver reveals, sticky/fixed elements) keeps working unchanged. Touch scrolling stays
 * native (syncTouch off), and nothing is created when the user prefers reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let observer: MutationObserver | null = null;

    // In-page anchors: glide to the target instead of the native jump
    const onClick = (e: MouseEvent) => {
      if (!lenis || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      if (location.hash !== hash) history.pushState(null, "", hash);
      // the mobile menu closes on the same click — wait until the page scroll is unlocked again
      let tries = 0;
      const go = () => {
        if (!lenis) return;
        if (document.documentElement.style.overflow === "hidden" && tries++ < 30) {
          requestAnimationFrame(go);
          return;
        }
        lenis.start();
        lenis.scrollTo(target, { duration: 1.2, force: true });
      };
      go();
    };

    const create = () => {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
      });
      // Menu / lead modal lock the page with overflow:hidden on <html> — pause inertia meanwhile
      observer = new MutationObserver(() => {
        if (document.documentElement.style.overflow === "hidden") lenis?.stop();
        else lenis?.start();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
      // the intro may have locked the page before Lenis was created
      if (document.documentElement.style.overflow === "hidden") lenis.stop();
      document.addEventListener("click", onClick);
    };

    const destroy = () => {
      document.removeEventListener("click", onClick);
      observer?.disconnect();
      lenis?.destroy();
      lenis = observer = null;
    };

    const sync = () => {
      if (reduced.matches) destroy();
      else if (!lenis) create();
    };

    sync();
    reduced.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      destroy();
    };
  }, []);

  return null;
}
