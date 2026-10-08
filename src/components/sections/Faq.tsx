"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { faq, type FaqItem } from "@/data/faq";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { LeadCard } from "@/components/ui/LeadCard";

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-11 w-[42.65px] shrink-0 place-items-center rounded-full border transition-[background-color,border-color,rotate] duration-400 ease-(--ease-smooth) ${
        open ? "rotate-180 border-lime bg-lime" : "border-white/15 bg-white/6 group-hover/faq:bg-white/12"
      }`}
    >
      <svg width="15.37" height="15.8" viewBox="0 0 15.3692 15.8" fill="none">
        <path
          d="M0.9 7.9H14.4692"
          stroke={open ? "#0A0A0A" : "white"}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="transition-[stroke] duration-300"
        />
        <path
          d="M7.68461 0.9V14.9"
          stroke={open ? "#0A0A0A" : "white"}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="origin-center transition-[scale,stroke] duration-400 ease-(--ease-smooth)"
          style={{ scale: open ? "1 0" : "1 1", transformBox: "fill-box" }}
        />
      </svg>
    </span>
  );
}

function FaqRow({ item, index, open, onToggle }: { item: FaqItem; index: number; open: boolean; onToggle: () => void }) {
  const id = useId();
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`rounded-[22px] border bg-[#111] transition-[border-color,translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.3)] md:rounded-[24px] ${
        open ? "border-lime/60" : "border-white/8 hover:border-white/16"
      }`}
    >
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className={`group/faq flex w-full items-center gap-3 px-[18px] pt-[18px] text-left transition-[padding] duration-500 ease-(--ease-smooth) md:gap-[23px] md:px-8 md:pt-[27px] ${open ? "pb-3 md:pb-4" : "pb-[18px] md:pb-[27px]"}`}
        >
          <span className="flex min-w-0 flex-1 items-start gap-2.5 md:gap-[23px]">
            <span className="shrink-0 font-pixel text-[12px] leading-[19px] text-lime md:leading-[25px]">{number}</span>
            <span className="min-w-0 flex-1 font-display text-[15px] leading-[1.3] font-medium text-white md:text-[19px]">
              {item.mobileLines ? (
                <>
                  <span className="md:hidden">
                    {item.mobileLines[0]}
                    <br />
                    {item.mobileLines[1]}
                  </span>
                  <span className="max-md:hidden">{item.question}</span>
                </>
              ) : (
                item.question
              )}
            </span>
          </span>
          <ToggleIcon open={open} />
        </button>
      </h3>

      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className={`grid transition-[grid-template-rows] duration-500 ease-(--ease-smooth) ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p
            className={`max-w-[333px] px-[18px] pb-[22px] text-[14px] leading-[1.6] text-white/65 transition-opacity duration-500 md:max-w-none md:px-8 md:pb-[53px] md:text-[16px] ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.answerLines ? (
              <>
                <span className="min-[1440px]:hidden">{item.answer}</span>
                <span className="max-[1439px]:hidden">
                  {item.answerLines[0]}
                  <br />
                  {item.answerLines[1]}
                </span>
              </>
            ) : (
              item.answer
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AskCard() {
  return (
    <LeadCard
      question
      label="Не знайшли відповідь? Поставити питання"
      className="relative flex h-[398px] flex-col gap-5 overflow-hidden rounded-[32px] border border-white/8 bg-[#111] px-6 pt-7 transition-[translate,border-color,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 hover:border-lime/35 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.35)] active:-translate-y-1 md:h-[471px] md:px-[30px] md:pt-[39px]">
      <div className="relative flex flex-col gap-3.5 md:gap-5">
        <p className="font-display text-[18px] leading-display font-semibold text-white md:text-[20px]">
          Не знайшли
          <br />
          відповідь?
        </p>
        <p className="text-[14px] leading-[1.5] text-white/80 md:max-w-[319px] md:text-[15px]">
          Напишіть нам у Telegram — відповімо протягом 15 хвилин у робочий час.
        </p>
      </div>
      <PillButton as="span" circleSize={44} gap={10} className="relative h-[60px] w-[273px] pr-2 pl-[27px]">
        Поставити питання
      </PillButton>
      <div className="pointer-events-none absolute right-[-5px] bottom-[-7px] left-[-5px] h-[185px] overflow-hidden rounded-[24px] md:right-[-1px] md:bottom-[-3px] md:h-[228px]">
        <Image
          src="/images/faq/glass.png"
          alt=""
          width={735}
          height={980}
          sizes="420px"
          className="absolute top-[-6.2%] left-0 h-[199.5%] w-[100.12%] max-w-none"
        />
      </div>
    </LeadCard>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-ink pt-12 pb-14 md:pt-[73px] md:pb-[91px] xl:pb-20">
      {/* Mobile glow, top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-170px] left-[calc(100%-360px)] h-[520px] w-[460px] overflow-hidden opacity-70 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] lg:hidden"
      >
        <Image src="/images/glow.png" alt="" width={1470} height={1176} className="absolute top-[-110px] left-[-30px] size-[620px] max-w-none object-cover" />
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 px-5 md:px-8 lg:flex-row lg:gap-[21px] lg:px-[clamp(40px,6.25vw,90px)]">
        {/* Left column */}
        <div className="flex flex-col justify-between lg:w-[clamp(320px,30vw,407px)] lg:shrink-0 lg:pt-3">
          <Reveal className="flex flex-col gap-5 md:gap-6">
            <SectionTag className="gap-[13px] self-start pr-5">FAQ</SectionTag>
            <h2 className="font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] whitespace-nowrap text-white md:text-[48px] lg:text-[40px] xl:text-[48px]">
              Питання
              <br />
              та відповіді
            </h2>
          </Reveal>
          <Reveal className="hidden lg:block">
            <AskCard />
          </Reveal>
        </div>

        {/* Accordion */}
        <Reveal delay={100} className="flex min-w-0 flex-1 flex-col gap-2.5 md:gap-3">
          {faq.map((item, i) => (
            <FaqRow key={item.question} item={item} index={i} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </Reveal>

        <Reveal className="lg:hidden">
          <AskCard />
        </Reveal>
      </div>
    </section>
  );
}
