import Link from "next/link";
import type { Locale } from "@/i18n/locale";
import { routes } from "@/i18n/locale";

type LangSwitchProps = {
  size?: "md" | "sm";
  className?: string;
  /** Denser background when pinned over content */
  solid?: boolean;
  /** Language of the current page: its button is the highlighted one, the other one links to that version */
  locale?: Locale;
};

/** UA / EN toggle. */
export function LangSwitch({ size = "md", className = "", solid = false, locale = "uk" }: LangSwitchProps) {
  const md = size === "md";
  const item = `flex items-center justify-center rounded-full font-display font-medium leading-none ${
    md ? "h-11 px-4 text-[12px]" : "h-[35px] px-[13px] text-[10px]"
  }`;
  const active = `${item} bg-lime text-ink-2`;
  const inactive = `${item} text-white/70 transition-colors hover:text-white`;

  return (
    <div
      role="group"
      aria-label={locale === "en" ? "Site language" : "Мова сайту"}
      className={`flex items-center gap-0.5 rounded-full border border-white/12 transition-[background-color] duration-400 ${
        solid ? "bg-[#141414]/85 backdrop-blur-md" : "bg-white/6"
      } ${md ? "h-[52px] p-1" : "h-[42px] p-[3px]"} ${className}`}
    >
      {locale === "en" ? (
        <>
          {/* a different root layout → a plain link (full page load) */}
          <a href={routes.uk.home} hrefLang="uk" lang="uk" aria-label="Українська версія" className={inactive}>
            UA
          </a>
          <button type="button" aria-pressed="true" className={active}>
            EN
          </button>
        </>
      ) : (
        <>
          <button type="button" aria-pressed="true" className={active}>
            UA
          </button>
          <Link href="/en" hrefLang="en" lang="en" aria-label="English version" className={inactive}>
            EN
          </Link>
        </>
      )}
    </div>
  );
}
