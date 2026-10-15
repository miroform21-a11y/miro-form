import { leadOptions } from "@/data/leads";
import { routes, type Locale } from "@/i18n/locale";
import type { FormsContent, ThankYouContent } from "../types";

/** Option lists of one language (own copies, so editing one language never changes the other) */
const optionsFor = (l: Locale): FormsContent["options"] => ({
  projectTypes: [...leadOptions[l].projectTypes],
  budgets: [...leadOptions[l].budgets],
  defaultBudget: leadOptions[l].defaultBudget,
  directions: leadOptions[l].directions.map((d) => ({ id: d.id, popupTitle: d.popupTitle, options: [...d.options] })),
});

/**
 * Texts of the lead forms: the Contacts section form, the service / package popup and the FAQ question popup.
 * Note: /api/lead validates the chosen options against data/leads.ts (the defaults below), not against edits.
 */
export const formsContent: Record<Locale, FormsContent> = {
  uk: {
    sectionTitle: "Залиште заявку",
    popupNote: "Залиште свою заявку, і ми зв’яжемося з вами протягом 15 хвилин.",
    questionTitle: "Залишилися питання?",
    questionNote: "Задайте їх тут — ми відповімо протягом 15 хвилин.",
    name: "Ваше ім’я",
    contact: "Телефон або @telegram",
    contactQuestion: "Ваш Telegram або телефон",
    option: "Оберіть, що саме вас цікавить",
    projectType: "Тип проєкту",
    budget: "Бюджет",
    question: "Ваше питання",
    message: "Коротко про проєкт",
    sending: "Надсилаємо…",
    sendQuestion: "Надіслати питання",
    sendLead: "Надіслати заявку",
    nameError: "Вкажіть, будь ласка, ваше ім’я",
    messageError: "Напишіть, будь ласка, ваше питання",
    error: "Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.",
    sentLead: "Дякуємо! Заявку отримано",
    sentQuestion: "Дякуємо! Питання отримано",
    sentNote: "Відповімо протягом 15 хвилин у робочий час.",
    consent: "Натискаючи кнопку, ви погоджуєтесь з",
    privacy: "політикою конфіденційності",
    privacyHref: routes.uk.privacy,
    closeLabel: "Закрити форму",
    options: optionsFor("uk"),
  },
  en: {
    sectionTitle: "Send us a request",
    popupNote: "Leave a request and we’ll get back to you within 15 minutes.",
    questionTitle: "Still have questions?",
    questionNote: "Ask them here — we’ll reply within 15 minutes.",
    name: "Your name",
    contact: "Phone number / WhatsApp",
    contactQuestion: "Phone number / WhatsApp",
    option: "Choose what you’re interested in",
    projectType: "Project type",
    budget: "Budget",
    question: "Your question",
    message: "Tell us briefly about your project",
    sending: "Sending…",
    sendQuestion: "Send question",
    sendLead: "Send request",
    nameError: "Please enter your name",
    messageError: "Please type your question",
    error: "Couldn’t send. Please try again or message us on Telegram.",
    sentLead: "Thank you! Request received",
    sentQuestion: "Thank you! Question received",
    sentNote: "We’ll reply within 15 minutes during business hours.",
    consent: "By clicking the button, you agree to our",
    privacy: "privacy policy",
    privacyHref: routes.en.privacy,
    closeLabel: "Close form",
    options: optionsFor("en"),
  },
};

/** /thank-you and /en/thank-you (pixel lines: about 9 characters fit a 360px phone) */
export const thankYouContent: Record<Locale, ThankYouContent> = {
  uk: {
    eyebrow: { lead: "ЗАЯВКУ ОТРИМАНО", question: "ПИТАННЯ ОТРИМАНО" },
    srTitle: { lead: "Дякуємо за заявку", question: "Дякуємо за питання" },
    line1: "ДЯКУЄМО",
    line2: { lead: "ЗА ЗАЯВКУ", question: "ЗА ПИТАННЯ" },
    text: {
      lead: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
      question: "Ми отримали ваше питання та відповімо найближчим часом.",
    },
    back: { label: "Повернутися на сайт", href: routes.uk.home },
  },
  en: {
    eyebrow: { lead: "REQUEST RECEIVED", question: "QUESTION RECEIVED" },
    srTitle: { lead: "Thank you for your request", question: "Thank you for your question" },
    line1: "THANK YOU",
    line2: { lead: "WE GOT IT", question: "WE GOT IT" },
    text: {
      lead: "We’ve received your request and will get back to you shortly.",
      question: "We’ve received your question and will reply shortly.",
    },
    back: { label: "Back to the site", href: routes.en.home },
  },
};
