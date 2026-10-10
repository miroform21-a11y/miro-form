import type { ContentArea } from "@/content/repository";
import type { Field } from "../fields";

/** What the preview frame renders for a section */
export type PreviewView =
  | "hero"
  | "services"
  | "works"
  | "about"
  | "facts"
  | "process"
  | "pricing"
  | "reviews"
  | "faq"
  | "contact"
  | "footer"
  | "popups"
  | "thank-you"
  | "privacy"
  | "seo"
  | "brief";

export type SectionDef = {
  /** URL segment: /admin/{locale}/{area}/{id} */
  id: string;
  group: string;
  title: string;
  area: ContentArea;
  /** Top-level key of the area content this section edits */
  key: string;
  preview: PreviewView;
  /** Generic form; sections with their own editor (brief questions) leave it empty */
  fields: Field[];
  custom?: "brief-steps";
};
