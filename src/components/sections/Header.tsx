"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/data/navigation";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { PillButton } from "@/components/ui/PillButton";
import { Pinned } from "@/components/ui/Pinned";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const menuRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  // pinned menu / language switch get a denser background once the page scrolls under them
  const [scrolled, setScrolled] = useState(false);
  const [pixel, setPixel] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Touch devices have no hover: a tap plays the pixel logo morph once
  useEffect(() => {
    if (!pixel) return;
    const t = setTimeout(() => setPixel(false), 1100);
    return () => clearTimeout(t);
  }, [pixel]);

  // Sliding highlight behind the hovered desktop menu item
  useEffect(() => {
    const list = menuRef.current;
    // children[0] is the highlight itself, menu items follow it
    const item = list?.children[hovered + 1] as HTMLElement | undefined;
    if (item) setPill({ left: item.offsetLeft, width: item.offsetWidth });
  }, [hovered]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-30 flex items-center justify-between">
      <div className="flex items-center gap-[clamp(24px,4.9vw,71px)] xl:gap-[clamp(20px,calc(100vw-1369px),71px)]">
        <a
          href="#top"
          aria-label="MIROFORM — на головну"
          onPointerDown={(e) => e.pointerType !== "mouse" && setPixel(true)}
          className={`logo-morph relative block h-[41.6px] w-[160px] shrink-0 xl:h-[72px] xl:w-[198px] ${pixel ? "is-pixel" : ""}`}
        >
          <Image
            src="/images/hero/logo.png"
            alt="MIROFORM"
            width={1895}
            height={830}
            priority
            className="logo-img absolute top-[-17.2px] left-[-6px] h-[78px] w-[173px] max-w-none object-contain xl:top-[-10px] xl:left-[-13px] xl:h-[95px] xl:w-[211px]"
          />
          {/* Pixel version of the wordmark (Press Start 2P), laid over the same box */}
          <span
            aria-hidden="true"
            className="logo-pixel pointer-events-none absolute top-[23.4px] left-[-2.2px] -translate-y-1/2 font-pixel text-[20.6px] leading-none whitespace-nowrap text-white xl:top-[39.4px] xl:left-[-8.3px] xl:text-[25.1px]"
          >
            MIROFORM
          </span>
        </a>

        <Pinned className="hidden xl:block">
        <nav aria-label="Основна навігація">
          <ul
            ref={menuRef}
            onMouseLeave={() => setHovered(0)}
            className={`relative flex h-[52px] items-center gap-1.5 rounded-full border border-white/12 pr-[5px] pl-[7px] backdrop-blur-md transition-[background-color] duration-400 ${
              scrolled ? "bg-[#141414]/85" : "bg-white/6"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-[38px] -translate-y-1/2 rounded-full bg-white/10 transition-[left,width] duration-400 ease-(--ease-smooth)"
              style={{ left: pill.left, width: pill.width }}
            />
            {navLinks.map((link, i) => (
              <li key={link.href} className="relative">
                <a
                  href={link.href}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  className={`flex h-[38px] items-center rounded-full px-3 text-[15px] whitespace-nowrap min-[1440px]:px-[17px] transition-colors duration-300 ${
                    hovered === i ? "text-white" : "text-white/75"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        </Pinned>
      </div>

      <div className="flex items-center gap-2.5 md:gap-6 xl:gap-[clamp(16px,calc((100vw-1280px)*0.156+16px),41px)]">
        <Pinned className="xl:hidden">
          <LangSwitch size="sm" solid={scrolled} />
        </Pinned>
        <Pinned className="hidden xl:block">
          <LangSwitch solid={scrolled} />
        </Pinned>
        <div className="hidden md:block">
          <PillButton href="#contact" circleSize={44} className="h-[52px] w-[225px] pr-[9px] pl-[31px]">
            Зв’язатися
          </PillButton>
        </div>
        <Pinned className="xl:hidden">
          <button
            type="button"
            aria-label="Відкрити меню"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
            className="grid size-[42px] place-items-center rounded-full bg-lime transition-transform duration-300 hover:scale-105"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 6H15M3 12H15" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </Pinned>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
      aria-hidden={!open}
      inert={!open}
      data-lenis-prevent
      className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink/96 px-5 pt-6 pb-8 backdrop-blur-xl transition-[opacity,visibility] duration-400 ease-(--ease-smooth) md:px-8 xl:hidden ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* Soft glow, same palette as the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 size-[520px] rounded-full bg-[#146EF5]/30 blur-[90px]"
      />

      <div className="relative flex items-center justify-between">
        <a href="#top" onClick={onClose} aria-label="MIROFORM — на головну" className="relative block h-[41.6px] w-[160px]">
          <Image
            src="/images/hero/logo.png"
            alt="MIROFORM"
            width={1895}
            height={830}
            className="absolute top-[-17.2px] left-[-6px] h-[78px] w-[173px] max-w-none object-contain"
          />
        </a>
        <div className="flex items-center gap-2.5">
          <LangSwitch size="sm" />
          <button
            type="button"
            aria-label="Закрити меню"
            onClick={onClose}
            className="grid size-[42px] place-items-center rounded-full bg-lime transition-transform duration-300 hover:rotate-90"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <nav aria-label="Мобільна навігація" className="relative mt-14 flex-1">
        <ul className="flex flex-col">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className={`border-b border-white/10 transition-[opacity,translate] duration-500 ease-(--ease-smooth) ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              <a
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-4 font-display text-[28px] leading-tight font-medium tracking-[-0.03em] text-white transition-colors hover:text-lime md:text-[40px]"
              >
                {link.label}
                <span className="font-pixel text-[11px] text-white/35">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative mt-10">
        <PillButton href="#contact" onClick={onClose} className="h-[55px] w-full pr-[6px] pl-7">
          Зв’язатися
        </PillButton>
      </div>
    </div>
  );
}
