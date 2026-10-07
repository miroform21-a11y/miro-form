import type { CSSProperties, ReactNode } from "react";

type Box = { left: number; top: number; width: number; height: number };

/**
 * Reproduces a Figma "rotated layer": an outer bounding box (as exported)
 * with the inner element of `inner` size rotated around its centre.
 */
export function Rotated({
  box,
  inner,
  rotate,
  children,
  className = "",
}: {
  box: Box;
  inner: { width: number; height: number };
  rotate: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute flex items-center justify-center ${className}`}
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <div className="relative shrink-0" style={{ width: inner.width, height: inner.height, transform: `rotate(${rotate}deg)` }}>
        {children}
      </div>
    </div>
  );
}

type CursorLabelProps = {
  label: string;
  tone: "dark" | "lime";
  /** Position of the cursor arrow's top-left corner */
  left: number;
  top: number;
  /** Label width as in Figma */
  labelWidth: number;
  /** Uniform scale (mobile frames use ≈0.62) */
  scale?: number;
  /** Mirror the whole cursor (Figma rotates it 179°) */
  flipped?: boolean;
  className?: string;
};

/** Figma-style multiplayer cursor with a name label ("Сайт", "Дизайн", "AI"). */
export function CursorLabel({ label, tone, left, top, labelWidth, scale = 1, flipped = false, className = "" }: CursorLabelProps) {
  const dark = tone === "dark";
  const style: CSSProperties = {
    left,
    top,
    width: 18 + labelWidth,
    height: 47,
    transform: `scale(${scale})${flipped ? " rotate(179deg)" : ""}`,
    transformOrigin: flipped ? "center" : "top left",
  };

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`} style={style}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute top-0 left-0">
        <path
          d="M2 2L19 9L11.5 11.5L9 19L2 2Z"
          fill={dark ? "#0A0A0A" : "#AEEE05"}
          stroke={dark ? "white" : "#0A0A0A"}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`absolute top-5 left-[18px] flex h-[27px] items-center justify-center rounded-[4px_100px_100px_100px] font-display text-[12px] leading-none font-medium whitespace-nowrap ${
          dark ? "bg-ink-2 text-white" : "bg-lime text-ink-2"
        }`}
        style={{ width: labelWidth, transform: flipped ? "rotate(-179deg)" : undefined }}
      >
        {label}
      </span>
    </div>
  );
}

/** Lime "selected layer" frame with four corner handles. */
export function SelectionBox({ box, handle, border }: { box: Box; handle: number; border: number }) {
  const corners = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: box.left, top: box.top, width: box.width, height: box.height }}>
      <div className="absolute inset-0 border-lime" style={{ borderWidth: border }} />
      {corners.map(([x, y]) => (
        <span
          key={`${x}${y}`}
          className="absolute border-lime bg-white"
          style={{
            width: handle,
            height: handle,
            borderWidth: border,
            left: x ? box.width - handle / 2 : -handle / 2,
            top: y ? box.height - handle / 2 : -handle / 2,
          }}
        />
      ))}
    </div>
  );
}
