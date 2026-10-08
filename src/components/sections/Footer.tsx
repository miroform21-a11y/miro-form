import Image from "next/image";
import { contacts, socialLinks } from "@/data/navigation";
import { PillButton } from "@/components/ui/PillButton";
import { FooterWordmark } from "@/components/ui/FooterWordmark";

const navColumn = [
  { label: "Послуги", href: "#services" },
  { label: "Роботи", href: "#works" },
  { label: "Про нас", href: "#about" },
  { label: "Тарифи", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const servicesColumn = ["Landing Page", "Інтернет-магазини", "UI/UX дизайн", "AI-асистенти", "Telegram-боти"];

const socials = [
  { label: "IG", name: "Instagram", href: socialLinks.instagram },
  { label: "TG", name: "Telegram", href: socialLinks.telegram },
  { label: "WA", name: "WhatsApp", href: socialLinks.whatsapp },
];

function ColumnTitle({ children }: { children: string }) {
  return <p className="font-display text-[12px] leading-display font-medium tracking-[0.08em] text-lime uppercase">{children}</p>;
}

const linkClass = "text-[15px] leading-body font-[350] text-white/75 transition-colors duration-300 hover:text-lime";

function Socials() {
  return (
    <ul className="flex gap-[7px]">
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            aria-label={s.name}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-[57px] w-14 place-items-center rounded-full border border-white/18 bg-white/9 font-display text-[14px] font-semibold text-white transition-[background-color,border-color,color] duration-300 hover:border-lime hover:bg-lime hover:text-ink-2"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function LimeArc({ className }: { className: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute overflow-hidden opacity-85 [mask-image:url(/images/glow-mask.svg)] [mask-size:100%_100%] ${className}`}>
      <div className="absolute isolate [height:calc(100%*1.192)] [width:calc(100%*1.348)] [top:calc(100%*-0.2115)] [left:calc(100%*-0.0652)]">
        <Image src="/images/glow.png" alt="" width={1470} height={1176} className="absolute inset-0 size-full max-w-none object-cover" />
        <div className="absolute inset-0 bg-lime mix-blend-hue" />
        <div className="absolute inset-0 bg-lime opacity-60 mix-blend-color" />
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden rounded-t-[32px] border-t border-white/8 bg-ink-2 md:rounded-t-[70px]">
      {/* ---------- Background ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* mobile */}
        <img src="/images/footer/m-glow.svg" alt="" className="absolute top-[335px] left-[-265px] h-[559px] w-[920px] max-w-none md:hidden" />
        <img
          src="/images/footer/m-stars.svg"
          alt=""
          className="absolute top-[-20px] left-[calc(50%-720px)] h-[716px] w-[1440px] max-w-none [mask-image:url(/images/footer/m-stars-mask.svg)] [mask-size:100%_100%] md:hidden"
        />
        <img src="/images/footer/m-grid.svg" alt="" className="absolute top-[14px] left-[calc(50%-724px)] h-[681px] w-[1440px] max-w-none md:hidden" />
        <div className="absolute top-[403.6px] left-0 h-[292.4px] w-full bg-gradient-to-b from-ink-2 to-ink-2/0 to-55% md:hidden" />
        <img src="/images/footer/m-side-glows.svg" alt="" className="absolute top-[161px] left-[58px] h-[418px] w-[402px] max-w-none md:hidden" />

        {/* desktop */}
        <img src="/images/footer/glow.svg" alt="" className="absolute top-[258px] left-[calc(50%-684.6px)] hidden h-[760px] w-[1400px] max-w-none md:block" />
        <img
          src="/images/footer/stars.svg"
          alt=""
          className="absolute top-[-61px] left-[calc(50%-720px)] hidden h-[750px] w-[1440px] max-w-none [mask-image:url(/images/footer/stars-mask.svg)] [mask-size:100%_100%] md:block"
        />
        <img src="/images/footer/grid.svg" alt="" className="absolute top-[-61px] left-[calc(50%-720px)] hidden h-[750px] w-[1440px] max-w-none md:block" />
        <div className="absolute top-[368px] left-0 hidden h-[322px] w-full bg-gradient-to-b from-ink-2 to-ink-2/0 to-55% md:block" />
      </div>
      <LimeArc className="top-[-171px] left-[calc(100%-300px)] h-[520px] w-[460px] md:top-[-151px] md:left-[calc(50%+24px)] md:h-[832px] md:w-[736px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8 lg:px-[clamp(40px,6.25vw,90px)]">
        {/* ---------- Top ---------- */}
        <div className="grid pt-[34px] md:grid-cols-3 md:gap-y-12 md:pt-[39px] lg:grid-cols-[33.57%_22.57%_22.56%_1fr] lg:gap-y-0">
          <div className="md:col-span-3 lg:col-span-1">
            <a href="#top" aria-label="MIROFORM — на головну" className="relative block h-[60px] w-[177px] md:h-[72px] md:w-[285px]">
              <Image
                src="/images/hero/logo.png"
                alt="MIROFORM"
                width={1895}
                height={830}
                className="absolute top-[0px] left-[-6px] h-[78.7px] w-[177px] max-w-none object-contain md:top-[-8px] md:left-[-9px] md:h-[127px] md:w-[285px]"
              />
            </a>
            <p className="mt-3 w-[300px] text-[15px] leading-[1.55] text-white/60 md:mt-[30px] md:w-[330px] md:max-w-full md:text-[16px]">
              Digital-студія, що поєднує дизайн, технології та результат.
            </p>
            <PillButton href="#contact" circleSize={44} gap={10} className="mt-[21px] h-[60px] w-[273px] pr-[8px] pl-[27px] md:mt-7">
              Обговорити проєкт
            </PillButton>
          </div>

          <nav aria-label="Навігація у футері" className="hidden md:block lg:pt-[31px]">
            <ColumnTitle>Навігація</ColumnTitle>
            <ul className="mt-4 flex flex-col gap-[13px] leading-body">
              {navColumn.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block lg:pt-[31px]">
            <ColumnTitle>Послуги</ColumnTitle>
            <ul className="mt-4 flex flex-col gap-[13px] leading-body">
              {servicesColumn.map((s) => (
                <li key={s}>
                  <a href="#services" className={linkClass}>
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-11 md:mt-0 lg:pt-[31px]">
            <ColumnTitle>Контакти</ColumnTitle>
            <ul className="mt-4 flex flex-col gap-[13px] leading-body">
              <li>
                <a href={`mailto:${contacts.email}`} className={linkClass}>
                  {contacts.email}
                </a>
              </li>
              <li>
                <a href={contacts.phoneHref} className={linkClass}>
                  {contacts.phone}
                </a>
              </li>
            </ul>
            <div className="mt-[18px] md:hidden">
              <Socials />
            </div>
            <p className="mt-[31px] text-[13px] leading-[1.5] text-white/40 md:mt-7">
              {contacts.legalName}
              <br />
              {contacts.legalId}
            </p>
          </div>
        </div>

        {/* ---------- Wordmark ---------- */}
        <FooterWordmark className="mt-[33px] pl-1 text-[min(11.54vw,45px)] md:mt-[72px] md:pl-0 md:text-[min(11.74vw,169px)]" />

        {/* ---------- Bottom ---------- */}
        <div className="mt-[27px] border-t border-white/99 pt-5 pb-8 md:mt-[72px] md:grid md:h-[73px] md:grid-cols-[45.58%_1fr_auto] md:items-center md:border-white/10 md:pt-0 md:pb-0 lg:h-[115px] lg:items-start lg:pt-[28px]">
          <p className="hidden text-[14px] leading-body text-white/50 md:block lg:pt-[13.5px]">© 2026 MIROFORM®. Усі права захищені.</p>
          <a href={socialLinks.privacy} className="block self-start justify-self-start text-[14px] leading-[17px] text-white/50 underline decoration-white/35 underline-offset-4 md:leading-body transition-colors hover:text-white hover:decoration-white md:self-center lg:self-auto lg:pt-[13.5px]">
            Політика конфіденційності
          </a>
          <div className="hidden md:block">
            <Socials />
          </div>
          <p className="mt-2.5 text-[14px] leading-[17px] text-white/50 md:hidden">© 2026 MIROFORM®. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
