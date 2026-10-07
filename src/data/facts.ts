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
