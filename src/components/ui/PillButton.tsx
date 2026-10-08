import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { ArrowShot } from "./ArrowShot";

type Variant = "lime" | "white" | "dark";

const surface: Record<Variant, string> = {
  lime: "bg-lime text-ink-2",
  white: "bg-white text-ink-2",
  dark: "bg-ink-2 text-white",
};

const circle: Record<Variant, { bg: string; arrow: string }> = {
  lime: { bg: "bg-ink-2", arrow: "#AEEE05" },
  white: { bg: "bg-ink-2", arrow: "#AEEE05" },
  dark: { bg: "bg-lime", arrow: "#0A0A0A" },
};

type PillButtonProps = {
  children: ReactNode;
  variant?: Variant;
  /** Diameter of the arrow circle in px */
  circleSize?: number;
  /** Optional non-square arrow badge width (Figma uses 56×48 in places) */
  circleWidth?: number;
  /** Gap between label and circle in px (Figma values vary: 11–28) */
  gap?: number;
  className?: string;
  /** "span" renders a purely visual pill (e.g. inside a clickable card) */
  as?: "a" | "button" | "span";
} & Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

/**
 * Rounded CTA with a label and a round arrow badge on the right
 * ("Обговорити проєкт", "Обрати пакет", ...).
 */
export function PillButton({
  children,
  variant = "lime",
  circleSize = 48,
  gap = 28,
  circleWidth,
  className = "",
  as,
  ...rest
}: PillButtonProps) {
  const href = "href" in rest ? rest.href : undefined;
  // internal pages ("/", "/privacy") go through the Next.js router; anchors and external links stay <a>
  const Tag: ElementType = as ?? (href ? (href.startsWith("/") ? Link : "a") : "button");
  const c = circle[variant];

  return (
    <Tag
      className={`group/pill pop-trigger inline-flex items-center justify-between rounded-full font-display text-[15px] leading-none font-medium whitespace-nowrap transition-[translate,box-shadow] duration-300 ease-(--ease-smooth) hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(174,238,5,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-y-0 ${surface[variant]} ${className}`}
      style={{ gap }}
      {...(rest as Record<string, unknown>)}
    >
      <span>{children}</span>
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${c.bg}`}
        style={{ width: circleWidth ?? circleSize, height: circleSize }}
      >
        <ArrowShot color={c.arrow} />
      </span>
    </Tag>
  );
}
