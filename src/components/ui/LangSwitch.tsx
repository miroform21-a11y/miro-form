type LangSwitchProps = { size?: "md" | "sm"; className?: string; /** Denser background when pinned over content */ solid?: boolean };

/** UA / EN toggle. EN is a placeholder until the English version exists. */
export function LangSwitch({ size = "md", className = "", solid = false }: LangSwitchProps) {
  const md = size === "md";
  const item = `flex items-center justify-center rounded-full font-display font-medium leading-none ${
    md ? "h-11 px-4 text-[12px]" : "h-[35px] px-[13px] text-[10px]"
  }`;

  return (
    <div
      role="group"
      aria-label="Мова сайту"
      className={`flex items-center gap-0.5 rounded-full border border-white/12 transition-[background-color] duration-400 ${
        solid ? "bg-[#141414]/85 backdrop-blur-md" : "bg-white/6"
      } ${md ? "h-[52px] p-1" : "h-[42px] p-[3px]"} ${className}`}
    >
      <button type="button" aria-pressed="true" className={`${item} bg-lime text-ink-2`}>
        UA
      </button>
      <button
        type="button"
        aria-pressed="false"
        title="English version — coming soon"
        className={`${item} text-white/70 transition-colors hover:text-white`}
      >
        EN
      </button>
    </div>
  );
}
