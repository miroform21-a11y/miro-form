type ArrowIconProps = {
  className?: string;
  /** Stroke color, defaults to currentColor */
  color?: string;
  size?: number;
};

/** "Arrow up-right" icon from the Figma file (18×18 frame). */
export function ArrowIcon({ className, color = "currentColor", size = 18 }: ArrowIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 14L14 4M14 12V4H6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Chevron used in slider controls. */
export function ChevronIcon({ className, direction = "right" }: { className?: string; direction?: "left" | "right" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
