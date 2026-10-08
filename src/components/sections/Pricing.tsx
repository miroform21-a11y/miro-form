import Image from "next/image";
import { customPlan, discounts, plans, type Plan } from "@/data/pricing";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { LeadCard } from "@/components/ui/LeadCard";
import { CountUp } from "@/components/ui/CountUp";

/* ---------------------------------------------------------------- */
/* Shared pieces                                                     */
/* ---------------------------------------------------------------- */

function PlanPill({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full border border-ink-2/30 px-4 py-2 font-display text-[10px] leading-display font-medium tracking-[0.04em] whitespace-nowrap text-ink-2 uppercase ${className}`}
    >
      {children}
    </span>
  );
}

/** "$1 490" → counter from 0 (used on the mobile / tablet cards) */
function PriceCounter({ value }: { value: string }) {
  const n = Number(value.replace(/[^\d]/g, ""));
  return <CountUp to={n} prefix="$" group={value.includes(" ")} reserve duration={1400} />;
}

function Price({ value, size, animate = false }: { value: string; size: "sm" | "lg"; animate?: boolean }) {
  return (
    <p className={`flex items-end whitespace-nowrap ${size === "lg" ? "gap-2.5" : "gap-2"}`}>
      <span className="text-[14px] leading-body text-ink-2/60">Від</span>
      <span
        className={`font-display leading-none font-normal tracking-[-0.04em] text-ink-2 ${size === "lg" ? "text-[42px]" : "text-[36px]"}`}
      >
        {animate ? <PriceCounter value={value} /> : value}
      </span>
    </p>
  );
}

function PaymentNote() {
  return (
    <div className="inline-flex items-center gap-3.5 self-start rounded-[24px] xl:self-auto border border-ink-2/8 bg-white py-2.5 pr-6 pl-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime">
        <img src="/images/pricing/card-icon.svg" alt="" className="size-[18px]" />
      </span>
      <span className="flex flex-col gap-[3px]">
        <span className="font-display text-[14px] leading-display font-medium text-ink-2">Гнучка оплата частинами</span>
        <span className="text-[13px] leading-body text-ink-2/55">До 12 місяців — деталі на консультації</span>
      </span>
    </div>
  );
}

function Grain() {
  return (
    <Image
      src="/images/pricing/grain.png"
      alt=""
      width={1240}
      height={932}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 h-[466px] w-[620px] max-w-none xl:h-full xl:w-full"
    />
  );
}

function HitEllipse({ className }: { className: string }) {
  return (
    <Image
      src="/images/pricing/hit-ellipse.png"
      alt=""
      width={398}
      height={398}
      aria-hidden="true"
      className={`float pointer-events-none absolute max-w-none ${className}`}
    />
  );
}

function Discount({ d, mobile }: { d: (typeof discounts)[number]; mobile?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${mobile ? "gap-3" : "gap-3.5 pt-6"}`}>
      <p className={`font-pixel leading-pixel whitespace-nowrap text-orange ${mobile ? "text-[24px]" : "text-[30px]"}`}>
        <CountUp to={Math.abs(parseInt(d.value, 10))} prefix="-" suffix="%" reserve duration={1200} />
      </p>
      <div className={`flex flex-col ${mobile ? "gap-1.5" : "gap-2"}`}>
        <p className="font-display text-[15px] leading-display font-semibold text-white">{d.title}</p>
        <p className={`leading-[1.5] text-white/55 ${mobile ? "text-[12px]" : "w-[250px] max-w-full text-[13px]"}`}>
          {d.lines[0]}
          {!mobile && d.wrapOnDesktop ? " " : <br />}
          {d.lines[1]}
        </p>
      </div>
    </div>
  );
}

/** "Хіт продажів" pointer — fires the same arrow shot as the other arrows on card hover / tap */
function HitPointer({ size, className }: { size: number; className: string }) {
  const icon = (cls: string) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={cls}>
      <path d="M2 2L19 9L11.5 11.5L9 19L2 2Z" fill="#0A0A0A" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
  return (
    <span aria-hidden="true" className={`absolute grid overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {icon("arrow-shot-out col-start-1 row-start-1")}
      {icon("arrow-shot-in col-start-1 row-start-1")}
    </span>
  );
}

function DiscountsTitle({ className }: { className: string }) {
  return (
    <p className={`font-pixel leading-pixel whitespace-nowrap text-white ${className}`}>
      Умови <span className="text-orange">знижки</span>
    </p>
  );
}

/* ---------------------------------------------------------------- */
/* Mobile & tablet (< 1280px): cards from the 390px Figma frame      */
/* ---------------------------------------------------------------- */

function CompactPlanCard({ plan }: { plan: Plan }) {
  const isMulti = plan.id === "multi";
  return (
    <LeadCard
      preset={plan.lead}
      label={`${plan.title.join("")} — обрати пакет`}
      className={`relative flex flex-col overflow-hidden rounded-[28px] p-6 transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(10,10,10,0.4)] ${isMulti ? "bg-lime" : "bg-white"}`}
    >
      {isMulti && <Grain />}
      {isMulti ? (
        <>
          <HitEllipse className="top-[-17px] right-[-17px] size-[106px]" />
          <HitPointer size={26} className="top-[121px] right-[136px]" />
          <span className="absolute top-[137px] right-12 flex h-5 w-[90px] items-center rounded-[1.6px_40px_40px_40px] bg-ink-2 pl-[17px] font-display text-[8px] font-medium text-white">
            Хіт продажів
          </span>
        </>
      ) : (
        <Image
          src="/images/pricing/asterisk.png"
          alt=""
          width={736}
          height={1047}
          aria-hidden="true"
          className="float pointer-events-none absolute top-[9px] right-[-114px] h-[253px] w-[246px] max-w-none object-contain"
        />
      )}

      <div className={`relative flex flex-col ${isMulti ? "gap-[26px]" : "gap-16"}`}>
        <div className={`flex flex-col ${isMulti ? "gap-[9px]" : "gap-2"}`}>
          {plan.mobileTagRows.map((row) => (
            <div key={row.join()} className="flex gap-2">
              {row.map((t) => (
                <PlanPill key={t}>{t}</PlanPill>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-[32px] leading-[1.04] font-medium tracking-[-0.04em] text-ink-2">
            {plan.title[0]}
            {plan.title[1] && (
              <>
                <br />
                {plan.title[1]}
              </>
            )}
          </h3>
          <p className="text-[14px] leading-[1.5] text-ink-2/65">
            {plan.mobileDescription ? (
              <>
                {plan.mobileDescription[0]}
                <br />
                {plan.mobileDescription[1]}
              </>
            ) : (
              plan.description
            )}
          </p>
        </div>
      </div>

      <div className="relative mt-auto pt-5">
        <Price value={plan.price} size="sm" animate />
        <PillButton as="span" variant={isMulti ? "white" : "lime"} className="mt-[18px] h-[60px] w-full pr-1.5 pl-7">
          Обрати пакет
        </PillButton>
      </div>
    </LeadCard>
  );
}

function CompactCustomCard() {
  return (
    <LeadCard
      preset={customPlan.lead}
      label={`${customPlan.title} — обговорити`}
      className="relative block overflow-hidden rounded-[28px] border border-white/8 bg-card-2 px-6 pt-[42px] pb-7 transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:border-white/16 md:col-span-2"
    >
      <Image
        src="/images/pricing/cubes.png"
        alt=""
        width={876}
        height={470}
        aria-hidden="true"
        className="pointer-events-none absolute top-[-49px] right-[-13px] h-[183px] w-[178px] max-w-none object-contain md:top-[-80px] md:h-[280px] md:w-[272px]"
      />
      <div className="relative flex flex-col gap-5 md:max-w-[420px]">
        <div className="flex flex-col gap-4">
          <span className="self-start rounded-full bg-lime py-[7px] pr-2.5 pl-3.5 font-display text-[10px] leading-display font-medium tracking-[0.04em] text-ink-2 uppercase">
            {customPlan.badge}
          </span>
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-[32px] leading-display font-medium tracking-[-0.04em] whitespace-nowrap text-white">{customPlan.title}</h3>
            <p className="text-[14px] leading-[1.5] text-white/60">
              AI-асистенти, Telegram-боти,
              <br />
              <span className="whitespace-nowrap">автоматизація процесів</span> та
              <br />
              <span className="whitespace-nowrap">інтеграції під ваш бізнес.</span>
            </p>
          </div>
        </div>
        <PillButton as="span" circleWidth={56} className="h-[60px] w-full pr-[7px] pl-[33px]">
          Обговорити
        </PillButton>
      </div>

      <div className="relative mt-6 h-px bg-white/30" />
      <DiscountsTitle className="relative mt-5 text-[20px]" />
      <div className="relative mt-7 flex flex-col md:flex-row md:gap-8">
        <Discount d={discounts[0]} mobile />
        <div className="my-5 h-px bg-white/30 md:my-0 md:h-auto md:w-px" />
        <Discount d={discounts[1]} mobile />
      </div>
    </LeadCard>
  );
}

/* ---------------------------------------------------------------- */
/* Desktop (≥ 1280px): 1440px Figma frame                            */
/* ---------------------------------------------------------------- */

function DesktopPlanCard({ plan }: { plan: Plan }) {
  const isMulti = plan.id === "multi";
  return (
    <LeadCard
      preset={plan.lead}
      label={`${plan.title.join("")} — обрати пакет`}
      className={`group/plan relative flex h-[466px] min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[36px] px-10 pt-10 pb-[42px] transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(10,10,10,0.4)] ${
        isMulti ? "bg-lime" : "bg-white"
      }`}
    >
      {isMulti ? (
        <>
          <Grain />
          <HitEllipse className="top-[-60px] right-[-61px] size-[199px]" />
          <HitPointer size={25.7} className="top-24 right-[160px] min-[1440px]:top-12 min-[1440px]:right-[209px]" />
          <span className="absolute top-[119px] right-[22px] min-[1440px]:top-[71.4px] min-[1440px]:right-[71px] flex h-[31.6px] w-[142.8px] items-center rounded-[4px_100px_100px_100px] bg-ink-2 pl-[26px] font-display text-[12px] font-medium whitespace-nowrap text-white">
            Хіт продажів
          </span>
        </>
      ) : (
        <Image
          src="/images/pricing/asterisk.png"
          alt=""
          width={736}
          height={1047}
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-[-255px] h-[603px] w-[585px] max-w-none object-contain transition-transform duration-700 ease-(--ease-smooth) group-hover/plan:rotate-6"
        />
      )}

      <div className={`relative flex flex-col ${isMulti ? "gap-[35px]" : "gap-[69px]"}`}>
        <div className={`flex flex-wrap gap-x-2 gap-y-1.5 ${isMulti ? "w-[400px]" : "w-[540px]"} max-w-full`}>
          {plan.tags.map((t) => (
            <PlanPill key={t}>{t}</PlanPill>
          ))}
        </div>
        <div className="flex flex-col gap-[26px]">
          <h3 className={`font-display text-[45px] leading-[1.04] font-medium tracking-[-0.04em] text-ink-2 ${isMulti ? "whitespace-nowrap" : "w-[240px]"}`}>
            {plan.title[0]}
            {plan.title[1] && (
              <>
                <br />
                {plan.title[1]}
              </>
            )}
          </h3>
          <p className={`text-[16px] leading-[1.5] text-ink-2/65 ${isMulti ? "w-[372px]" : "w-[455px] max-[1439px]:w-[380px]"} max-w-full`}>{plan.description}</p>
        </div>
      </div>

      <div className="relative flex items-center gap-7">
        <PillButton as="span" variant={isMulti ? "white" : "lime"} className="h-[60px] w-[250px] pr-1.5 pl-7">
          Обрати пакет
        </PillButton>
        <Price value={plan.price} size="lg" />
      </div>
    </LeadCard>
  );
}

function DesktopCustomCard() {
  return (
    <LeadCard
      preset={customPlan.lead}
      label={`${customPlan.title} — обговорити`}
      className="relative flex h-[400px] gap-[33px] overflow-hidden rounded-[36px] border border-white/8 bg-card-2 p-10 transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 active:-translate-y-1 hover:border-white/16"
    >
      <Image
        src="/images/pricing/cubes.png"
        alt=""
        width={876}
        height={470}
        aria-hidden="true"
        className="pointer-events-none absolute top-[-135px] right-[-29px] h-[473px] w-[459px] max-w-none object-contain"
      />

      <div className="relative flex h-[320px] w-[384px] shrink-0 flex-col gap-[30px] pt-4">
        <div className="flex flex-col gap-7">
          <span className="self-start rounded-full bg-lime py-[7px] pr-2.5 pl-3.5 font-display text-[10px] leading-display font-medium tracking-[0.04em] text-ink-2 uppercase">
            {customPlan.badge}
          </span>
          <div className="flex flex-col gap-[22px]">
            <h3 className="font-display text-[45px] leading-display font-medium tracking-[-0.04em] whitespace-nowrap text-white">{customPlan.title}</h3>
            <p className="text-[16px] leading-[1.5] text-white/60">{customPlan.description}</p>
          </div>
        </div>
        <PillButton as="span" circleWidth={56} className="h-[60px] w-[277px] pr-[7px] pl-[33px]">
          Обговорити
        </PillButton>
      </div>

      <div className="relative w-px shrink-0 bg-white/30" />

      <div className="relative flex min-w-0 flex-1 flex-col gap-[37px] pt-[98px]">
        <DiscountsTitle className="text-[35px]" />
        <div className="flex gap-8">
          <Discount d={discounts[0]} />
          <div className="w-px shrink-0 self-stretch bg-white/30" />
          <Discount d={discounts[1]} />
        </div>
      </div>
    </LeadCard>
  );
}

/* ---------------------------------------------------------------- */

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-ink px-2 md:bg-transparent pt-6 pb-10 md:px-[33px] md:pt-[84px] md:pb-[93px]">
      <div className="mx-auto max-w-[1375px] rounded-[32px] bg-paper px-4 pt-10 pb-6 md:rounded-[48px] md:px-10 md:pt-14 md:pb-[83px] xl:pb-[47px] xl:pr-[58px] xl:pl-[57px]">
        {/* Header */}
        <Reveal className="flex flex-col gap-[18px] xl:h-[182px] xl:flex-row xl:items-end xl:justify-between xl:pb-11">
          <div className="flex flex-col gap-4 md:gap-6">
            <SectionTag tone="light" className="w-[137px] gap-[18px] self-start pl-[13px] md:w-auto md:pl-[17px]">
              Тарифи
            </SectionTag>
            <h2 className="font-display text-[28px] leading-display font-medium tracking-[-0.04em] text-ink-2 md:text-[48px] xl:text-[64px]">
              Пакети та вартість
            </h2>
          </div>
          <PaymentNote />
        </Reveal>

        {/* Mobile / tablet */}
        <div className="mt-6 grid gap-3 md:mt-10 md:gap-5 lg:grid-cols-2 xl:hidden">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80} className="flex [&>article]:flex-1">
              <CompactPlanCard plan={plan} />
            </Reveal>
          ))}
          <Reveal className="lg:col-span-2">
            <CompactCustomCard />
          </Reveal>
        </div>

        {/* Desktop */}
        <div className="mt-5 hidden flex-col gap-5 xl:flex">
          <div className="flex h-[500px] gap-5">
            {plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 90} className="flex min-w-0 flex-1 items-start [&>article]:flex-1">
                <DesktopPlanCard plan={plan} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <DesktopCustomCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
