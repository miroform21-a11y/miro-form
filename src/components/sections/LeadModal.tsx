"use client";

import { useEffect, useRef, useState } from "react";
import { OPEN_LEAD_EVENT, type LeadPopupRequest } from "@/components/ui/LeadCard";
import { ContactForm } from "./ContactForm";

/**
 * Popup form opened from Services / Pricing (project request with a preselected direction)
 * and from the FAQ "Не знайшли відповідь?" card (question form).
 */
export function LeadModal() {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<LeadPopupRequest>({ kind: "lead", preset: { direction: "web" } });
  // remount the form on every open so the preselected direction is applied fresh
  const [openId, setOpenId] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setRequest((e as CustomEvent<LeadPopupRequest>).detail);
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
    const t = setTimeout(
      () => panelRef.current?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true }),
      80,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const label = request.kind === "question" ? "Залишилися питання? Задайте їх тут" : "Залиште свою заявку";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
      inert={!open}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      data-lenis-prevent
      className={`fixed inset-0 z-[60] flex items-start justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-ink/80 px-4 py-6 backdrop-blur-md transition-[opacity,visibility] duration-400 ease-(--ease-smooth) md:items-center md:py-10 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        ref={panelRef}
        className={`relative my-auto w-full max-w-[588px] rounded-[24px] border border-white/10 bg-ink-2 shadow-[0_40px_120px_-40px_rgba(174,238,5,0.22)] transition-[translate,scale] duration-500 ease-(--ease-smooth) md:rounded-[32px] ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <button
          type="button"
          aria-label="Закрити форму"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-white/6 transition-[rotate,background-color] duration-300 hover:rotate-90 hover:bg-white/12 md:top-6 md:right-6"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {openId > 0 &&
          (request.kind === "question" ? (
            <ContactForm key={openId} variant="question" />
          ) : (
            <ContactForm key={openId} variant="modal" preset={request.preset} />
          ))}
      </div>
    </div>
  );
}
