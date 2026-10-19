import { projectsByLocale, projectsTotal } from "@/data/projects";
import type { Locale } from "@/i18n/locale";
import type { WorksContent } from "../types";

export const worksContent: Record<Locale, WorksContent> = {
  uk: {
    tag: "Роботи",
    title: "Наші проєкти",
    all: { label: "Усі роботи", href: "#contact" },
    total: projectsTotal,
    projects: projectsByLocale.uk,
    mobileOrder: ["nef-life", "bloomly", "brium", "we-padel", "avalon", "car-rental"],
    card: { screenshot: "скріншот сайту", video: "відео сайту", open: "відкрити сайт проєкту" },
    slider: { label: "Наші проєкти", slides: "Слайди", slide: "Слайд" },
  },
  en: {
    tag: "Portfolio",
    title: "Our Projects",
    all: { label: "All projects", href: "#contact" },
    total: projectsTotal,
    projects: projectsByLocale.en,
    mobileOrder: ["nef-life", "bloomly", "brium", "we-padel", "avalon", "car-rental"],
    card: { screenshot: "website screenshot", video: "website video", open: "open the project website" },
    slider: { label: "Our projects", slides: "Slides", slide: "Slide" },
  },
};
