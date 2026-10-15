"use client";

import type { Locale } from "@/i18n/locale";
import { findSection } from "../sections";
import { SectionEditor } from "./SectionEditor";

/** Client side of /admin/{locale}/{area}/{section} (section configs hold functions, so they are looked up here) */
export function SectionPage({ locale, area, id }: { locale: Locale; area: string; id: string }) {
  const section = findSection(area, id);
  if (!section) return null;
  return <SectionEditor key={`${locale}-${area}-${id}`} locale={locale} section={section} />;
}
