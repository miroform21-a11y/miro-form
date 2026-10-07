"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectType } from "@/data/pricing";
import { OPEN_LEAD_EVENT } from "@/components/ui/LeadCard";
import { ContactForm } from "./ContactForm";

/** Popup lead form opened from the pricing cards (type preselected from the clicked card). */
export function LeadModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ProjectType>("Лендінг");
  // remount the form on every open so the preselected type is applied fresh
  const [openId, setOpenId] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setType((e as CustomEvent<ProjectType>).detail);
      setOpenId((n) => n + 1);
      setOpen(true);
    };
    window.addEventListener(OPEN_LEAD_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LEAD_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }), 80);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Залиште заявку"
      aria-hidden={!open}
      inert={!open}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      data-lenis-prevent
      className={`fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-6 backdrop-blur-md transition-[opacity,visibility] duration-400 ease-(--ease-smooth) md:items-center md:py-10 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        ref={panelRef}
        className={`relative w-full max-w-[588px] rounded-[24px] bg-ink-2 transition-[translate,scale] duration-500 ease-(--ease-smooth) md:rounded-[32px] ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <button
          type="button"
          aria-label="Закрити форму"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-white/6 transition-[rotate,background-color] duration-300 hover:rotate-90 hover:bg-white/12 md:top-6 md:right-6"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {openId > 0 && <ContactForm key={openId} variant="modal" initialType={type} />}
      </div>
    </div>
  );
}
