"use client";

import type { ReactNode } from "react";
import type { LeadPreset } from "@/data/leads";

export const OPEN_LEAD_EVENT = "miroform:open-lead";

/** What the popup should show: a project request (with a preselected direction) or the FAQ question form */
export type LeadPopupRequest = { kind: "lead"; preset: LeadPreset } | { kind: "question" };

export function openLeadForm(preset: LeadPreset) {
  window.dispatchEvent(new CustomEvent<LeadPopupRequest>(OPEN_LEAD_EVENT, { detail: { kind: "lead", preset } }));
}

export function openQuestionForm() {
  window.dispatchEvent(new CustomEvent<LeadPopupRequest>(OPEN_LEAD_EVENT, { detail: { kind: "question" } }));
}

/**
 * A whole card that opens a popup form (lead with a preselected direction, or the FAQ question form).
 * The `group/pill` class lets the card's visual CTA animate on card hover.
 */
export function LeadCard({
  preset,
  question = false,
  label,
  className = "",
  children,
}: {
  preset?: LeadPreset;
  /** Open the "ask a question" form instead of a project request */
  question?: boolean;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const open = () => (question || !preset ? openQuestionForm() : openLeadForm(preset));
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`group/pill pop-trigger cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {children}
    </article>
  );
}

/** Invisible full-card button (for server-rendered cards) that opens the lead popup. */
export function LeadOverlayButton({ preset, label, className = "" }: { preset: LeadPreset; label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      onClick={() => openLeadForm(preset)}
      className={`absolute inset-0 z-[2] cursor-pointer rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    />
  );
}
