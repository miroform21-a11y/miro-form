import type { CSSProperties } from "react";

// Same fly-in offsets as the preloader (em, so they scale with the text)
const FROM_X = [-1.2, 0.8, -0.6, 1.4, -1, 0.5, -1.4, 0.9];
const FROM_Y = [1.6, 2.2, 1.2, 1.8, 2.4, 1.4, 2, 1.6];

/**
 * Pixel text that assembles from split letter halves — the preloader effect (.pl-ch / .pl-top /
 * .pl-bot in globals.css), reusable for headings. `start` offsets the stagger index across lines.
 */
export function PixelAssemble({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <span aria-hidden="true" className="inline-flex whitespace-nowrap">
      {[...text].map((ch, k) => {
        const i = start + k;
        if (ch === " ") return <span key={k} className="inline-block w-[0.6em]" />;
        return (
          <span
            key={k}
            className="pl-ch"
            style={{ "--i": i, "--fx": `${FROM_X[i % 8]}em`, "--fy": `${FROM_Y[i % 8]}em` } as CSSProperties}
          >
            <span className="pl-top">{ch}</span>
            <span className="pl-bot">{ch}</span>
          </span>
        );
      })}
    </span>
  );
}
