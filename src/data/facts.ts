import type { Locale } from "@/i18n/locale";

export type Fact = {
  prefix?: string;
  value: number;
  suffix?: string;
  unit?: string;
  accent?: boolean;
  label: string;
};

export const facts: Fact[] = [
  { prefix: "від", value: 7, unit: "днів", accent: true, label: "Запуск лендінгу під ключ" },
  { value: 100, suffix: "%", label: "Фіксована ціна в договорі" },
  { value: 90, suffix: "+", label: "PageSpeed і базове SEO" },
  { value: 3, unit: "сети", label: "Сети правок у вартості" },
  { value: 30, unit: "днів", label: "Підтримка після запуску" },
];

export const audiences = [
  "Автобізнес",
  "Спорт і фітнес",
  "Нерухомість",
  "Салони краси",
  "Медицина",
  "Ресторани",
  "Онлайн-школи",
  "E-commerce",
  "IT-стартапи",
  "Особисті бренди",
  "Виробництво",
];

const factsEn: Fact[] = [
  { prefix: "from", value: 7, unit: "days", accent: true, label: "Turnkey landing page" },
  { value: 100, suffix: "%", label: "Fixed price in the contract" },
  { value: 90, suffix: "+", label: "PageSpeed and basic SEO" },
  { value: 3, unit: "rounds", label: "Revision rounds included" },
  { value: 30, unit: "days", label: "Support after launch" },
];

const audiencesEn = [
  "Automotive",
  "Sports & fitness",
  "Real estate",
  "Beauty salons",
  "Healthcare",
  "Restaurants",
  "Online schools",
  "E-commerce",
  "IT startups",
  "Personal brands",
  "Manufacturing",
];

export const factsByLocale: Record<Locale, Fact[]> = { uk: facts, en: factsEn };
export const audiencesByLocale: Record<Locale, string[]> = { uk: audiences, en: audiencesEn };
