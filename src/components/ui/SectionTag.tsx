type SectionTagProps = {
  children: string;
  /** "dark" = on dark background (lime border), "light" = on light sheet (black border) */
  tone?: "dark" | "light";
  className?: string;
};

/** Outlined pill label above section headings ("• ПОСЛУГИ"). */
export function SectionTag({ children, tone = "dark", className = "" }: SectionTagProps) {
  const isDark = tone === "dark";
  return (
    <span
      className={`inline-flex items-center gap-[17px] rounded-full border pt-[11px] pr-[15px] pb-[10px] pl-[17px] font-pixel text-[12px] leading-none tracking-[0.04em] uppercase ${
        isDark ? "border-lime text-white" : "border-ink-2 text-ink-2"
      } ${className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${isDark ? "bg-white" : "bg-ink-2"}`} />
      {children}
    </span>
  );
}
