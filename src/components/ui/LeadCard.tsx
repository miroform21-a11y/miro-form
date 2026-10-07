"use client";

import type { ReactNode } from "react";
import type { ProjectType } from "@/data/pricing";

export const OPEN_LEAD_EVENT = "miroform:open-lead";

export function openLeadForm(projectType: ProjectType) {
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT, { detail: projectType }));
}

/**
 * A whole card that opens the lead form popup with the card's project type preselected.
 * The `group/pill` class lets the card's visual CTA animate on card hover.
 */
export function LeadCard({
  projectType,
  label,
  className = "",
  children,
}: {
  projectType: ProjectType;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={() => openLeadForm(projectType)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLeadForm(projectType);
        }
      }}
      className={`group/pill cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {children}
    </article>
  );
}
