"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const WORD = "MIROFORM";
/** Short pause on the fully formed wordmark before fading out */
const HOLD_MS = 120;
/** Never hold the site longer than this (ms from navigation start), even on a very slow connection */
const MAX_MS = 5000;
/** Fade-out length, matches .preloader transition */
const LEAVE_MS = 550;

// Where each letter's top / bottom half flies in from (em, so it scales with the word)
const FROM_X = [-1.2, 0.8, -0.6, 1.4, -1, 0.5, -1.4, 0.9];
const FROM_Y = [1.6, 2.2, 1.2, 1.8, 2.4, 1.4, 2, 1.6];

/**
 * Intro screen: the pixel wordmark (same Press Start 2P version as the header logo morph)
 * assembles from split letter halves, then fades away once the page has really loaded.
 * Server-rendered, and the animation is pure CSS, so it plays on first paint before hydration.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"show" | "leave" | "done">("show");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // inline lock too, so Lenis (which watches <html> style) pauses as well
    html.style.overflow = "hidden";
    const since = performance.now();
    let cancelled = false;

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const wait = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms - since)));
    // the CSS intro starts at first paint, so wait for its own animations rather than a fixed time
    const intro = Promise.all(
      (root.current?.getAnimations({ subtree: true }) ?? [])
        .filter((a) => !(a instanceof CSSAnimation) || a.animationName !== "pl-failsafe")
        .map((a) => a.finished.catch(() => undefined)),
    ).then(() => new Promise((r) => setTimeout(r, HOLD_MS)));

    Promise.race([Promise.all([loaded, document.fonts?.ready, intro]), wait(MAX_MS)]).then(() => {
      if (!cancelled) setPhase("leave");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "leave") return;
    const t = setTimeout(() => {
      document.documentElement.style.overflow = "";
      setPhase("done");
    }, LEAVE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div ref={root} className={`preloader ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      <p className="preloader-word">
        {WORD.split("").map((ch, i) => (
          <span
            key={i}
            className="pl-ch"
            style={{ "--i": i, "--fx": `${FROM_X[i]}em`, "--fy": `${FROM_Y[i]}em` } as CSSProperties}
          >
            <span className="pl-top">{ch}</span>
            <span className="pl-bot">{ch}</span>
          </span>
        ))}
      </p>
    </div>
  );
}
