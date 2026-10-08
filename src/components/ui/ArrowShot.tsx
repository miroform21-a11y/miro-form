import { ArrowIcon } from "./ArrowIcon";

/**
 * The site's arrow "shot": on hover / press of the nearest `.pop-trigger` the arrow flies out
 * up-right and a fresh one slides in from bottom-left (no rotation). Place it inside a round
 * badge with `relative overflow-hidden`. Used by PillButton and every card arrow.
 */
export function ArrowShot({ color, size }: { color: string; size?: number }) {
  return (
    <>
      <ArrowIcon color={color} size={size} className="arrow-shot-out" />
      <ArrowIcon color={color} size={size} className="arrow-shot-in absolute" />
    </>
  );
}
