import { navLinksByLocale } from "@/data/navigation";
import type { Locale } from "@/i18n/locale";
import type { HeaderContent } from "../types";

export const headerContent: Record<Locale, HeaderContent> = {
  uk: {
    home: "MIROFORM — на головну",
    nav: "Основна навігація",
    mobileNav: "Мобільна навігація",
    cta: { label: "Зв’язатися", href: "#contact" },
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    menu: "Меню",
    links: navLinksByLocale.uk,
  },
  en: {
    home: "MIROFORM — home",
    nav: "Main navigation",
    mobileNav: "Mobile navigation",
    cta: { label: "Get in touch", href: "#contact" },
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
    links: navLinksByLocale.en,
  },
};
