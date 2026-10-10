/**
 * Site languages. Ukrainian is the main site (unprefixed URLs); English lives under /en.
 * Components take `locale` with "uk" as the default, so the Ukrainian pages render exactly as before.
 */
export type Locale = "uk" | "en";

/** Page URLs per language */
export const routes = {
  uk: { home: "/", privacy: "/privacy", thankYou: "/thank-you", brief: "/brief" },
  en: { home: "/en", privacy: "/en/privacy-policy", thankYou: "/en/thank-you", brief: "/en/brief" },
} as const satisfies Record<Locale, Record<string, string>>;
