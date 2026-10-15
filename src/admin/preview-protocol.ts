import type { BriefContent, SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/locale";
import type { PreviewView } from "./sections/types";

/** Messages between the editor (parent window) and /admin/preview (iframe, same origin) */

export const PREVIEW_READY = "miroform-admin:preview-ready";
export const PREVIEW_RENDER = "miroform-admin:preview-render";

export type PreviewOptions = {
  /** thank-you page variant */
  question?: boolean;
  /** brief step opened first */
  step?: number;
};

export type PreviewRender = {
  type: typeof PREVIEW_RENDER;
  locale: Locale;
  view: PreviewView;
  site: SiteContent;
  brief: BriefContent;
  options: PreviewOptions;
};
