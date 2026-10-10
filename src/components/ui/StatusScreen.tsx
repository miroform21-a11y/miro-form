import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { routes, type Locale } from "@/i18n/locale";

/**
 * Full-screen shell for the service pages (thank-you, 404): logo → centred content → copyright,
 * on the hero glow + dot grid.
 */
export function StatusScreen({ children, locale = "uk" }: { children: ReactNode; locale?: Locale }) {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink px-5 pt-6 pb-10 md:px-8 lg:px-[clamp(40px,6.25vw,90px)] lg:pt-7">
      {/* Background: the hero glow + dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          priority
          className="absolute top-[38%] left-1/2 h-[min(120vw,1100px)] w-[min(150vw,1380px)] max-w-none -translate-x-1/2 object-cover opacity-45 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%]"
        />
        <img src="/images/hero/dot-grid.svg" alt="" className="absolute top-[12%] left-1/2 h-[642px] w-[1302px] max-w-none -translate-x-1/2 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,rgba(5,5,5,0)_35%,rgba(5,5,5,0)_70%,#050505_100%)]" />
      </div>

      <Link href={routes[locale].home} aria-label={locale === "en" ? "MIROFORM — home" : "MIROFORM — на головну"}className="relative block h-[41.6px] w-[160px] shrink-0 xl:h-[72px] xl:w-[198px]">
        <Image
          src="/images/hero/logo.png"
          alt="MIROFORM"
          width={1895}
          height={830}
          priority
          className="absolute top-[-17.2px] left-[-6px] h-[78px] w-[173px] max-w-none object-contain xl:top-[-10px] xl:left-[-13px] xl:h-[95px] xl:w-[211px]"
        />
      </Link>

      <section className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center py-16 text-center">{children}</section>

      <p className="text-center text-[13px] leading-body text-white/40">© 2026 MIROFORM®</p>
    </main>
  );
}
