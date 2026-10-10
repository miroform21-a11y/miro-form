import type { ContentArea } from "@/content/repository";
import { siteSections } from "./site";
import { briefSections } from "./brief";
import type { SectionDef } from "./types";

export const allSections: SectionDef[] = [...siteSections, ...briefSections];

export const findSection = (area: string, id: string) => allSections.find((s) => s.area === area && s.id === id);

export const sectionHref = (locale: string, s: Pick<SectionDef, "area" | "id">) => `/admin/${locale}/${s.area}/${s.id}`;

/** Sidebar groups in display order */
export function groupedSections(): { group: string; sections: SectionDef[] }[] {
  const out: { group: string; sections: SectionDef[] }[] = [];
  for (const s of allSections) {
    const g = out.find((x) => x.group === s.group);
    if (g) g.sections.push(s);
    else out.push({ group: s.group, sections: [s] });
  }
  return out;
}

export const areaTitle: Record<ContentArea, string> = { site: "Сайт", brief: "Бриф" };

export type { SectionDef, PreviewView } from "./types";
