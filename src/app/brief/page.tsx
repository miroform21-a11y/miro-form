import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PillButton } from "@/components/ui/PillButton";
import { BriefForm } from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф — MIROFORM",
  description: "Анкета для нового проєкту MIROFORM: цілі, структура, функціонал, контент, терміни та бюджет.",
  robots: { index: false, follow: false },
};

const pad = "px-5 md:px-8 lg:px-[clamp(40px,6.25vw,90px)]";

export default function BriefPage() {
  return (
    <main className="relative isolate overflow-hidden bg-ink">
      {/* Background: hero glow + dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px]">
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          priority
          className="absolute top-[-420px] left-[calc(50%-120px)] h-[1100px] w-[1380px] max-w-none object-cover opacity-55 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] max-md:top-[-260px] max-md:left-[-40%] max-md:h-[760px] max-md:w-[900px]"
        />
        <img src="/images/hero/dot-grid.svg" alt="" className="absolute top-[110px] left-1/2 h-[642px] w-[1302px] max-w-none -translate-x-1/2 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0)_45%,#050505_100%)]" />
      </div>

      <div className={`mx-auto max-w-[1440px] ${pad}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between pt-6 lg:pt-7">
          <Link href="/" aria-label="MIROFORM — на головну" className="relative block h-[41.6px] w-[160px] shrink-0 xl:h-[72px] xl:w-[198px]">
            <Image
              src="/images/hero/logo.png"
              alt="MIROFORM"
              width={1895}
              height={830}
              priority
              className="absolute top-[-17.2px] left-[-6px] h-[78px] w-[173px] max-w-none object-contain xl:top-[-10px] xl:left-[-13px] xl:h-[95px] xl:w-[211px]"
            />
          </Link>
          <PillButton href="/" variant="dark" circleSize={40} gap={14} className="h-[52px] border border-white/12 pr-1.5 pl-6 max-md:hidden">
            На головну
          </PillButton>
        </div>

        {/* Intro */}
        <header className="grid gap-8 pt-14 pb-12 md:pt-20 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end lg:gap-16 lg:pt-24 lg:pb-20">
          <div className="flex flex-col gap-5 md:gap-7">
            <p className="font-pixel text-[11px] leading-pixel text-white/60 xl:text-[13px]">Make the right decision</p>
            <h1 className="font-display text-[80px] leading-[0.9] font-bold tracking-[-0.05em] text-white md:text-[140px] xl:text-[180px]">
              Бриф<span className="text-lime">.</span>
            </h1>
          </div>
          <div className="flex flex-col gap-4 text-[15px] leading-[1.6] font-[350] text-white/75 md:text-[17px]">
            <p>
              Щоб чітко визначити цілі, які стоять перед майбутнім проєктом, необхідно заповнити анкету максимально детально. Це допоможе нам
              побачити повну та точну картину проєкту.
            </p>
            <p>Якщо деякі питання анкети здадуться складними, будь ласка, зверніться до нас за роз’ясненнями.</p>
            <p className="flex items-start gap-3 rounded-[20px] border border-lime/25 bg-lime/[0.05] px-5 py-4 text-white/85">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-1 shrink-0">
                <rect x="3" y="8" width="12" height="8" rx="2" stroke="#AEEE05" strokeWidth="1.6" />
                <path d="M5.5 8V6a3.5 3.5 0 0 1 7 0v2" stroke="#AEEE05" strokeWidth="1.6" />
              </svg>
              Ми гарантуємо повну конфіденційність наданої інформації про вас та вашу діяльність.
            </p>
          </div>
        </header>

        <BriefForm />

        <p className="py-12 text-center text-[13px] leading-body text-white/40">© 2026 MIROFORM®</p>
      </div>
    </main>
  );
}
