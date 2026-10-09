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
      {/* Background: clean dark page with a faint brand-lime glow in the top-right corner (no blue glow, no dot pattern) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px] overflow-hidden">
        <div className="absolute top-[-420px] right-[-260px] h-[980px] w-[1180px] bg-[radial-gradient(closest-side,rgba(174,238,5,0.11),rgba(174,238,5,0.04)_48%,rgba(174,238,5,0)_100%)] max-md:top-[-300px] max-md:right-[-340px] max-md:h-[640px] max-md:w-[760px]" />
        <div className="absolute top-[120px] left-[-380px] h-[620px] w-[760px] bg-[radial-gradient(closest-side,rgba(174,238,5,0.035),rgba(174,238,5,0)_100%)] max-md:hidden" />
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

        {/* Intro: compact title + description on the left, privacy note on the right */}
        <header className="grid gap-6 pt-10 pb-8 md:pt-14 md:pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-end lg:gap-12 lg:pt-16 lg:pb-12">
          <div className="flex flex-col gap-4 md:gap-5">
            <p className="font-pixel text-[11px] leading-pixel text-white/60 xl:text-[12px]">Make the right decision</p>
            <h1 className="font-display text-[48px] leading-[0.95] font-bold tracking-[-0.05em] text-white md:text-[64px] xl:text-[72px]">
              Бриф<span className="text-lime">.</span>
            </h1>
            <div className="flex flex-col gap-2.5 text-[14px] leading-[1.6] font-[350] text-white/65 md:text-[15px]">
              <p className="max-w-[640px]">
                Бриф допоможе нам зрозуміти ваш проєкт: за відповідями ми продумаємо структуру, дизайн і функціонал майбутнього сайту.
              </p>
              {/* one line on desktop (from 1280px), wraps on smaller screens */}
              <p className="xl:whitespace-nowrap">Якщо якесь питання здається складним, пропустіть його або напишіть нам — ми підкажемо.</p>
            </div>
          </div>
          <p className="flex items-start gap-2.5 rounded-[16px] border border-lime/25 bg-lime/[0.05] px-4 py-3 text-[13px] leading-[1.5] text-white/80 md:text-[14px] lg:justify-self-end">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
              <rect x="3" y="8" width="12" height="8" rx="2" stroke="#AEEE05" strokeWidth="1.6" />
              <path d="M5.5 8V6a3.5 3.5 0 0 1 7 0v2" stroke="#AEEE05" strokeWidth="1.6" />
            </svg>
            Ми гарантуємо повну конфіденційність інформації про вас і вашу діяльність.
          </p>
        </header>

        <BriefForm />

        <p className="py-12 text-center text-[13px] leading-body text-white/40">© 2026 MIROFORM®</p>
      </div>
    </main>
  );
}
