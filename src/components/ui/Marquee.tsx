import type { ReactNode } from "react";

type MarqueeProps = {
  items: string[];
  renderItem: (item: string) => ReactNode;
  gapClass: string;
  /** Seconds per loop */
  duration?: number;
  /** Seconds per loop below md — keeps the same px/s speed as desktop for the shorter mobile row */
  mobileDuration?: number;
  className?: string;
};

/**
 * Infinite horizontal ticker. Content is duplicated for a seamless loop.
 * Set --marquee-gap on the root (and use it in gapClass) so the loop also covers the gap between the copies.
 */
export function Marquee({ items, renderItem, gapClass, duration = 45, mobileDuration, className = "" }: MarqueeProps) {
  const group = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={`flex shrink-0 items-center ${gapClass}`}>
      {items.map((item) => (
        <li key={item} className="shrink-0">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div
        className={`marquee-track flex w-max ${gapClass}`}
        style={
          {
            "--marquee-duration": `${duration}s`,
            ...(mobileDuration ? { "--marquee-duration-sm": `${mobileDuration}s` } : {}),
          } as React.CSSProperties
        }
      >
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
