import Image from "next/image";
import type { ReactNode } from "react";
import { services, type Service } from "@/data/services";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { LeadOverlayButton } from "@/components/ui/LeadCard";
import { CursorLabel, Rotated, SelectionBox } from "@/components/ui/Decor";
import { ReadWords, ScrollRead } from "@/components/ui/ScrollRead";

const theme = {
  light: {
    card: "bg-paper text-ink-2",
    numPill: "bg-ink-2 text-lime",
    pill: "border-ink-2/35 text-ink-2",
    bullet: "bg-ink-2",
    text: "text-ink-2/85",
    arrow: { bg: "bg-ink-2", color: "#AEEE05" },
  },
  dark: {
    card: "bg-card border border-white/10 text-white",
    numPill: "bg-lime text-ink-2",
    pill: "border-white/35 text-white",
    bullet: "bg-lime",
    text: "text-white/85",
    arrow: { bg: "bg-white", color: "#0A0A0A" },
  },
  lime: {
    card: "bg-lime text-ink-2",
    numPill: "bg-ink-2 text-lime",
    pill: "border-ink-2/35 text-ink-2",
    bullet: "bg-ink-2",
    text: "text-ink-2/85",
    arrow: { bg: "bg-ink-2", color: "#AEEE05" },
  },
} as const;

/* ---------------------------------------------------------------- */
/* Shared decor pieces                                               */
/* ---------------------------------------------------------------- */

function BigNumber({ value, className, style }: { value: string; className: string; style: React.CSSProperties }) {
  return (
    <p aria-hidden="true" className={`pointer-events-none absolute font-pixel leading-pixel whitespace-nowrap select-none ${className}`} style={style}>
      {value}
    </p>
  );
}

function KeyImage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/services/key.png"
        alt=""
        width={736}
        height={1308}
        sizes="560px"
        className="absolute top-[-14.18%] left-0 h-[131.63%] w-[96.79%] max-w-none"
      />
    </div>
  );
}

function KeyLetter({ size }: { size: number }) {
  return <p className="font-pixel leading-[0.984] text-white uppercase" style={{ fontSize: size }}>М</p>;
}

function Texture() {
  return (
    <Image src="/images/services/texture.png" alt="" width={402} height={714} sizes="600px" className="absolute inset-0 size-full max-w-none object-cover" />
  );
}

function IconsCluster() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/services/icons-cluster.png"
        alt=""
        width={1254}
        height={1254}
        sizes="320px"
        className="absolute top-[-0.22%] left-0 size-[100.22%] max-w-none"
      />
    </div>
  );
}

function Liquid({ mobile = false }: { mobile?: boolean }) {
  return mobile ? (
    <div className="absolute inset-0 overflow-hidden">
      <Image src="/images/services/liquid.png" alt="" width={690} height={1000} sizes="300px" className="absolute top-[7.57%] left-[14.18%] h-[92.43%] w-[70.08%] max-w-none" />
    </div>
  ) : (
    <Image src="/images/services/liquid.png" alt="" width={690} height={1000} sizes="480px" className="absolute inset-0 size-full max-w-none object-contain" />
  );
}

/* ---------------------------------------------------------------- */
/* Desktop decor: coordinates from the 1260px-wide Figma cards,      */
/* expressed relative to x = 700 and anchored to the card's right.   */
/* ---------------------------------------------------------------- */

function DesktopDecor({ id }: { id: Service["id"] }) {
  const layer = "pointer-events-none absolute top-0 right-0 hidden h-[360px] w-[560px] origin-top-right md:block md:max-lg:scale-[0.5] lg:max-xl:scale-[0.78] xl:max-[1439px]:scale-[0.88]";

  if (id === "web")
    return (
      <div aria-hidden="true" className={layer}>
        <BigNumber value="01" className="text-[250px] text-ink-2/6" style={{ left: 36.6, top: 55 }} />
        <Rotated box={{ left: -184, top: -270, width: 782.5, height: 886 }} inner={{ width: 564.3, height: 737.5 }} rotate={20} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-4deg] group-active/card:rotate-[-4deg]">
          <KeyImage />
        </Rotated>
        <Rotated box={{ left: 171, top: 111, width: 94.75, height: 93.65 }} inner={{ width: 77.7, height: 76.1 }} rotate={-15} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-21.5deg] group-active/card:rotate-[-21.5deg]">
          <KeyLetter size={70} />
        </Rotated>
        <CursorLabel label="Сайт" tone="dark" left={347} top={119} labelWidth={63} className="drift" />
      </div>
    );

  if (id === "design")
    return (
      <div aria-hidden="true" className={layer}>
        <BigNumber value="02" className="text-[250px] text-white/6" style={{ left: 35.6, top: 54 }} />
        <CursorLabel label="Дизайн" tone="lime" left={358} top={216} labelWidth={83} className="drift [--drift-duration:6s] [--drift-x:-12px] [--drift-y:8px]" />
        <SelectionBox box={{ left: 146.3, top: 45, width: 281, height: 280 }} handle={10} border={1.5} />
        <Rotated box={{ left: -426, top: 43, width: 1034, height: 695.4 }} inner={{ width: 537.7, height: 955.1 }} rotate={80} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-6deg] group-active/card:rotate-[-6deg]">
          <Texture />
        </Rotated>
        <Rotated box={{ left: 36, top: 34, width: 325.06, height: 325.06 }} inner={{ width: 309.3, height: 309.3 }} rotate={3} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[10deg] group-hover/card:scale-[1.05] group-active/card:rotate-[10deg]">
          <IconsCluster />
        </Rotated>
      </div>
    );

  return (
    <div aria-hidden="true" className={layer}>
      <BigNumber value="03" className="text-[250px] text-white" style={{ left: 37, top: 68 }} />
      <CursorLabel label="AI" tone="dark" left={-9.5} top={62} labelWidth={40} flipped className="drift [--drift-duration:5.5s] [--drift-x:16px] [--drift-y:10px]" />
      <Rotated box={{ left: -214, top: -108, width: 672.9, height: 671 }} inner={{ width: 469.5, height: 484.4 }} rotate={50} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[16deg] group-active/card:rotate-[16deg]">
        <Liquid />
      </Rotated>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Mobile decor: coordinates from the 352px-wide Figma cards         */
/* ---------------------------------------------------------------- */

function MobileDecor({ id }: { id: Service["id"] }) {
  const layer = "pointer-events-none absolute inset-0 md:hidden";

  if (id === "web")
    return (
      <div aria-hidden="true" className={layer}>
        <BigNumber value="01" className="text-[155px] text-ink-2/6" style={{ left: 29, top: 328 }} />
        <Rotated box={{ left: -129, top: 126, width: 547.8, height: 620.2 }} inner={{ width: 395, height: 516.2 }} rotate={20} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-4deg] group-active/card:rotate-[-4deg]">
          <KeyImage />
        </Rotated>
        <CursorLabel label="Сайт" tone="dark" left={245} top={358} labelWidth={63} scale={0.62} className="drift [--drift-x:-12px]" />
        <Rotated box={{ left: 126, top: 396, width: 58.7, height: 58 }} inner={{ width: 48.2, height: 47.2 }} rotate={-15} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-21.5deg] group-active/card:rotate-[-21.5deg]">
          <KeyLetter size={43.4} />
        </Rotated>
      </div>
    );

  if (id === "design")
    return (
      <div aria-hidden="true" className={layer}>
        <img src="/images/services/m-glow-card2.svg" alt="" className="absolute top-[193px] left-[-161px] h-[430px] w-[660px] max-w-none" />
        <BigNumber value="02" className="text-[155px] text-white/6" style={{ left: 23.2, top: 339.4 }} />
        <SelectionBox box={{ left: 73, top: 362, width: 142, height: 141 }} handle={5} border={0.93} />
        <Rotated box={{ left: -261.77, top: 279.45, width: 693.9, height: 466.7 }} inner={{ width: 360.9, height: 641 }} rotate={80} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[-6deg] group-active/card:rotate-[-6deg]">
          <Texture />
        </Rotated>
        <Rotated box={{ left: 39, top: 358, width: 175.7, height: 175.7 }} inner={{ width: 167.2, height: 167.2 }} rotate={3} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[10deg] group-hover/card:scale-[1.05] group-active/card:rotate-[10deg]">
          <IconsCluster />
        </Rotated>
        <CursorLabel label="Дизайн" tone="lime" left={236} top={383} labelWidth={83} scale={0.62} className="drift [--drift-duration:6s] [--drift-x:-10px] [--drift-y:6px]" />
      </div>
    );

  return (
    <div aria-hidden="true" className={layer}>
      <BigNumber value="03" className="text-[155px] text-white" style={{ left: 24, top: 349 }} />
      <CursorLabel label="AI" tone="dark" left={24.2} top={302.4} labelWidth={40} scale={0.62} flipped className="drift [--drift-duration:5.5s] [--drift-x:12px] [--drift-y:8px]" />
      <Rotated box={{ left: -107, top: 199, width: 443.8, height: 440.2 }} inner={{ width: 299, height: 328.5 }} rotate={50} className="transition-[rotate,scale] duration-[900ms] ease-(--ease-smooth) group-hover/card:rotate-[16deg] group-active/card:rotate-[16deg]">
        <Liquid mobile />
      </Rotated>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return (
    <li className={`rounded-full py-2 pr-3 pl-[15px] font-display text-[11px] leading-display font-medium tracking-[0.04em] uppercase ${className}`}>
      {children}
    </li>
  );
}

const mobileHeights: Record<Service["id"], string> = {
  web: "max-md:h-[485px]",
  design: "max-md:h-[534px]",
  ai: "max-md:h-[528px]",
};

const mobileArrowPos: Record<Service["id"], string> = {
  web: "max-md:bottom-[15px] max-md:right-[19.72px]",
  design: "max-md:bottom-[19px] max-md:right-[22.72px]",
  ai: "max-md:bottom-[15px] max-md:right-[23.72px]",
};

function ServiceCard({ service }: { service: Service }) {
  const t = theme[service.theme];
  const isAi = service.id === "ai";

  return (
    <article
      className={`group/card pop-trigger relative w-full cursor-pointer overflow-hidden rounded-[28px] px-6 pt-6 transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.35)] active:-translate-y-1 active:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.35)] md:h-[360px] md:rounded-[36px] md:px-8 md:pt-11 lg:px-[47px] ${t.card} ${mobileHeights[service.id]}`}
    >
      <MobileDecor id={service.id} />
      <DesktopDecor id={service.id} />

      <div className="relative flex flex-col">
        <ul className="flex flex-wrap items-center gap-x-[7px] gap-y-2 max-md:min-h-8">
          <li className={`rounded-full py-[7px] pr-[13px] pl-[14px] font-display text-[11px] leading-display font-medium tracking-[0.04em] ${t.numPill}`}>
            {service.number}
          </li>
          {service.mobileTags.map((tag) => (
            <Pill key={tag} className={`border ${t.pill} ${service.tags.includes(tag) ? "" : "md:hidden"}`}>
              {tag}
            </Pill>
          ))}
          {service.tags
            .filter((tag) => !service.mobileTags.includes(tag))
            .map((tag) => (
              <Pill key={tag} className={`border max-md:hidden ${t.pill}`}>
                {tag}
              </Pill>
            ))}
        </ul>

        <h3
          className={`mt-[21px] font-display leading-[1.1] ${
            service.id === "web" ? "text-[min(30px,calc((100vw-84px)/10.15))] whitespace-nowrap" : "text-[30px]"
          } tracking-[-0.04em] md:mt-5 md:text-[30px] ${service.theme === "dark" ? "md:font-[440]" : "md:font-medium"} md:whitespace-nowrap lg:text-[44px] xl:text-[50px] ${
            isAi ? "font-bold" : service.theme === "dark" ? "font-[440]" : "font-medium"
          } ${service.id === "design" ? "max-md:mt-[25px]" : ""} ${isAi ? "max-md:mt-6" : ""}`}
        >
          {service.mobileTitle ? (
            <>
              <span className="md:hidden">{service.mobileTitle}</span>
              <span className="max-md:hidden">{service.title}</span>
            </>
          ) : (
            service.title
          )}
        </h3>

        <div
          className="mt-[21px] flex flex-col gap-[7px] pt-[7px] md:mt-5 md:pt-0.5 xl:flex-row xl:gap-(--list-gap)"
          style={{ "--list-gap": `${service.listGap}px` } as React.CSSProperties}
        >
          {service.lists.map((list, i) => (
            <ul key={i} className="flex flex-col gap-[7px]">
              {list.map((item) => (
                <li
                  key={item}
                  className={`flex items-center text-[17px] leading-body whitespace-nowrap ${t.text} ${service.theme === "dark" ? "font-[360]" : ""}`}
                  style={{ gap: i === 0 ? 12 : service.bulletGap2 }}
                >
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${t.bullet}`} />
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`absolute grid h-14 w-[54.28px] place-items-center rounded-full md:top-11 md:right-8 lg:right-[47px] ${t.arrow.bg} ${mobileArrowPos[service.id]}`}
      >
        <ArrowIcon color={t.arrow.color} size={20} className="arrow-pop" />
      </span>
      <LeadOverlayButton preset={{ direction: service.id }} label={`${service.title} — залишити заявку`} />
    </article>
  );
}

function LogosPill({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-11 w-[164px] shrink-0 rounded-full border border-white bg-[linear-gradient(180deg,#1d1d1d_50.4%,#be0e0e_114.6%)] align-middle ${className}`}
    >
      <img src="/images/services/figma.svg" alt="" className="absolute top-3 left-5 h-[22px] w-[15px]" />
      <img src="/images/services/webflow.svg" alt="" className="absolute top-3 left-[46px] h-[22px] w-[35px]" />
      <Image src="/images/services/framer.png" alt="" width={44} height={44} className="absolute top-[13px] left-[88px] h-[21px] w-[22px] object-cover" />
      <Image src="/images/services/claude.png" alt="" width={58} height={60} className="absolute top-[9px] left-[118px] h-[30px] w-[29px] object-cover" />
    </span>
  );
}

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-ink pt-10 pb-[111px] md:pt-6 md:pb-[140px]">
      {/* Faint blue glow (desktop: left, mobile: top right) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-80px] left-[260px] h-[520px] w-[460px] [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] md:top-[-120px] md:left-[calc(50%-1074px)] md:h-[728px] md:w-[644px] md:opacity-35"
      >
        <Image
          src="/images/glow.png"
          alt=""
          width={1470}
          height={1176}
          className="absolute top-[-110px] left-[-30px] size-[620px] max-w-none object-cover md:top-[-154px] md:left-[-42px] md:size-[868px]"
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-[19px] md:px-8 lg:px-[clamp(40px,6.25vw,90px)]">
        {/* Header */}
        <div className="flex flex-col gap-7 xl:h-[279px] xl:flex-row xl:items-end xl:justify-between">
          <Reveal className="flex flex-col">
            <SectionTag className="self-start max-md:pr-[22px]">Послуги</SectionTag>
            <ScrollRead
              as="h2"
              from={0.45}
              className="mt-5 w-[min(370px,calc(100vw-20px))] font-display text-[26px] leading-[31px] font-normal md:leading-[1.18] tracking-[-0.03em] text-white/45 md:mt-7 md:w-auto md:text-[36px] lg:text-[40px] xl:text-[min(44px,3.05vw)]"
            >
              <span className="md:hidden">
                <ReadWords text="Беремося за проєкти," /> <span className="font-semibold text-white">якими зможемо пишатися</span>
                <ReadWords text=", та доводимо їх до результату" />
              </span>
              <span className="max-md:hidden">
                <ReadWords text={"Беремося\u00a0 за проєкти,"} /> <span className="font-semibold text-white">якими</span>
                <br />
                <span className="font-semibold text-white">зможемо</span>
                <LogosPill className="mx-[0.45em] -translate-y-[0.06em]" />
                <span className="font-semibold text-white">пишатися</span>,
                <br />
                <ReadWords text="та доводимо їх до результату" />
              </span>
            </ScrollRead>
            <LogosPill className="mt-[18px] md:hidden" />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-3 md:max-w-[420px] xl:w-[349px]">
            <p aria-hidden="true" className="font-display text-[48px] leading-[0.6] font-bold text-lime">
              “
            </p>
            <p className="max-w-[350px] text-[15px] leading-[1.55] font-[350] text-white/70 xl:max-w-none">
              Незалежно від типу проєкту, ми вкладаємо максимум умінь і досвіду, щоб отримати результат, яким не соромно
              хвалитися.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="mt-8 flex flex-col gap-5 md:mt-20">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 60}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
