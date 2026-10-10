/**
 * The English /en/brief questionnaire: the same 8 steps, field keys, types, required marks and
 * conditional fields as the Ukrainian brief (data/brief.ts), with English labels and options.
 * Conditions (`showIf`, `exclusive`, `independent`, defaults) point at the English option values.
 */

import { socialLinks } from "@/data/navigation";
import { briefSchemaUk, type BriefSchema, type BriefStep } from "@/data/brief";
import type { Locale } from "@/i18n/locale";

const OTHER_NETWORK_EN = "Other";
const SOCIAL_NETWORKS_EN = ["Instagram", "Telegram", "YouTube", "Viber", "WhatsApp", "TikTok", OTHER_NETWORK_EN] as const;

const yesNo = ["Yes", "No"] as const;
const NOTHING_YET = "Nothing yet";
const TURNKEY = "I want a turnkey project";

const briefStepsEn: BriefStep[] = [
  {
    id: "general",
    number: "01",
    title: "General information",
    hint: "A few words about your company and the contacts for the website.",
    fields: [
      { key: "company", type: "text", label: "Full company name", required: true, autoComplete: "organization" },
      {
        key: "site_contacts",
        type: "siteContacts",
        label: "Contact details for the future website",
        required: true,
      },
      {
        key: "form_fields",
        type: "text",
        label: "What information should clients leave in the website form?",
        required: true,
        hint: "For example: name, phone, email or other details. Separate them with commas.",
      },
    ],
  },
  {
    id: "project",
    number: "02",
    title: "Project details",
    hint: "Choose the format of your future website.",
    fields: [
      {
        key: "project_type",
        type: "choice",
        label: "What kind of website do you need?",
        required: true,
        options: ["Landing Page", "Multi-page website", "Online store", "Other", "Not sure yet, I need a consultation"],
      },
      { key: "project_type_other", type: "text", label: "What exactly do you need?", showIf: { key: "project_type", values: ["Other"] } },
      {
        key: "pages",
        type: "choice",
        label: "Approximate number of pages",
        options: ["Up to 5", "6–10", "11–20", "More than 20", "Not sure"],
        showIf: { key: "project_type", values: ["Multi-page website", "Other"] },
      },
    ],
  },
  {
    id: "business",
    number: "03",
    title: "More about the project",
    hint: "What you offer and how you work with clients.",
    fields: [
      {
        key: "services",
        type: "textarea",
        label: "Services or products you offer",
        required: true,
        hint: "List your main services or products, separated by commas",
      },
      {
        key: "business",
        type: "textarea",
        label: "Describe your business",
        hint: "What your company does, how long you’ve been on the market and what your expertise is",
      },
      {
        key: "geography",
        type: "text",
        label: "Where do you operate?",
        hint: "In which city, state or country do you provide services or sell products?",
        required: true,
        placeholder: "For example: Austin, TX or the entire US",
      },
      { key: "prices", type: "choice", label: "Should prices be shown on the website?", options: ["Yes", "No", "Only for some services or products"], default: "No" },
      {
        key: "prices_details",
        type: "textarea",
        label: "Which prices should be shown on the website?",
        hint: "List the services or products and, if you know them, their prices. For example: consultation — $100, service A — from $200.",
        showIf: { key: "prices", values: ["Yes", "Only for some services or products"] },
      },
      { key: "advantage", type: "textarea", label: "Your key advantages" },
      {
        key: "process",
        type: "text",
        label: "How does ordering or receiving your service usually work?",
        required: true,
        hint: "For example: request, consultation, agreeing on details, payment.",
      },
      { key: "promo", type: "choice", label: "Do you have any promotions or special offers?", options: yesNo, default: "No" },
      { key: "promo_details", type: "textarea", label: "Describe the promotions or offers", showIf: { key: "promo", values: ["Yes"] } },
      { key: "payment", type: "text", label: "How can clients pay for your products or services?", hint: "For example: cash, bank transfer or online payment." },
    ],
  },
  {
    id: "goals",
    number: "04",
    title: "Website goals and features",
    hint: "Why you need the website and what it should do.",
    fields: [
      {
        key: "goals",
        type: "multi",
        label: "What is the main goal of the website?",
        required: true,
        options: ["Get leads from clients", "Sell products or services", "Present the company and its services", "Show a portfolio or past work", "Other"],
        default: ["Get leads from clients"],
      },
      { key: "goals_other", type: "text", label: "Specify the goal", showIf: { key: "goals", values: ["Other"] } },
      {
        key: "features",
        type: "multi",
        label: "Which features does the website need?",
        options: ["Multiple languages", "Request form", "Blog or news", "Quiz", "Product or service catalog", "Online payment", "Photo gallery", "Other"],
      },
      { key: "languages", type: "text", label: "Which languages?", placeholder: "For example: English, Spanish", showIf: { key: "features", values: ["Multiple languages"] } },
      { key: "features_other", type: "text", label: "What other features do you need?", showIf: { key: "features", values: ["Other"] } },
      { key: "support", type: "choice", label: "Do you need website support after launch?", options: ["Yes", "No", "I need a consultation"], default: "I need a consultation" },
    ],
  },
  {
    id: "style",
    number: "05",
    title: "Style and examples",
    hint: "What look you like — and what you don’t.",
    fields: [
      {
        key: "likes",
        type: "links",
        label: "Websites you like",
        hint: "Websites from any industry whose design or individual elements you like.",
        notePlaceholder: "What exactly you like",
      },
      {
        key: "dislikes",
        type: "links",
        label: "Websites you don’t like",
        hint: "Websites from any industry whose design or solutions don’t work for you.",
        notePlaceholder: "What exactly doesn’t work",
      },
      {
        key: "design_wishes",
        type: "textarea",
        label: "Design preferences",
        required: true,
        placeholder: "Colors, mood, style — for example: minimalism, dark theme",
        skip: "No preferences yet — suggest your own concept",
      },
    ],
  },
  {
    id: "materials",
    number: "06",
    title: "Materials and preferences",
    hint: "What’s already ready for the website.",
    notice: { icon: "paperclip", text: "You can send us materials separately on Telegram after completing the brief.", href: socialLinks.telegram },
    extraNotices: [
      {
        icon: "paperclip",
        text: "You can also send your project materials via WhatsApp.",
        href: socialLinks.whatsapp,
        linkLabel: "Open MIROFORM on WhatsApp in a new tab",
      },
    ],
    fields: [
      {
        key: "materials",
        type: "multi",
        label: "What do you already have for the website?",
        required: true,
        options: ["Logo", "Photos, videos or images", "Ready-made copy", "Other materials", NOTHING_YET, TURNKEY],
        // "nothing yet" excludes real materials; "turnkey" goes with anything
        exclusive: NOTHING_YET,
        independent: [TURNKEY],
      },
      { key: "materials_other", type: "text", label: "Which materials do you have?", showIf: { key: "materials", values: ["Other materials"] } },
      {
        key: "materials_wishes",
        type: "textarea",
        label: "Preferences for materials",
        hint: "For example: which copy, photos or logos need to be prepared, and what materials are still missing.",
      },
    ],
  },
  {
    id: "budget",
    number: "07",
    title: "Budget and timeline",
    hint: "Guidelines that help us suggest a realistic solution.",
    // lime on desktop, blue (the colour of the background render) on phones
    notice: { icon: "card", text: "MIROFORM offers flexible installment plans for up to 12 months. Details during the consultation.", mobileTone: "blue" },
    fields: [
      {
        key: "budget",
        type: "choice",
        label: "Approximate project budget",
        required: true,
        // US ranges — the same as in the home page form (data/leads.ts), separate from the Ukrainian brief
        options: ["Up to $1,500", "From $1,500 to $3,000", "From $3,000 to $7,000", "Installment payments", "I need a consultation"],
        default: "Up to $1,500",
      },
      {
        key: "deadline",
        type: "choice",
        label: "Preferred launch date",
        required: true,
        options: ["Within 7 days", "Within 14 days", "Within a month", "1–3 months", "By a specific date"],
      },
      {
        key: "deadline_date",
        type: "text",
        label: "Date or details",
        placeholder: "For example: by December 1 or before the store opens",
        showIf: { key: "deadline", values: ["By a specific date"] },
      },
      {
        key: "extra",
        type: "textarea",
        label: "Anything else we should know?",
        hint: "Share anything that, in your opinion, will help us better understand the task and take important details into account while building the website.",
      },
    ],
  },
  {
    id: "contacts",
    number: "08",
    title: "Your contact details",
    hint: "How and when it’s convenient to reach you.",
    blocking: true,
    fields: [
      { key: "name", type: "text", label: "Your name", required: true, autoComplete: "name", placeholder: "How should we address you?" },
      { key: "contact", type: "contact", label: "Phone number / WhatsApp", required: true, placeholder: "+38 073 021 77 21" },
      // no "Phone call": calls to US clients can't be promised
      { key: "contact_method", type: "choice", label: "Preferred contact method", required: true, options: ["WhatsApp", "Telegram", "Other"] },
      {
        key: "contact_handle",
        type: "text",
        label: "Username or link",
        hint: "Only if it differs from the contact above.",
        showIf: { key: "contact_method", values: ["Telegram", "WhatsApp"] },
      },
      { key: "contact_method_other", type: "text", label: "Which method?", showIf: { key: "contact_method", values: ["Other"] } },
      { key: "contact_time", type: "choice", label: "When is it convenient to contact you?", required: true, options: ["As soon as possible", "Today", "Tomorrow", "Another day"] },
      {
        key: "contact_time_other",
        type: "text",
        label: "Date and preferred time",
        placeholder: "For example: October 15 after 2 PM",
        showIf: { key: "contact_time", values: ["Another day"] },
      },
    ],
  },
];

export const briefSchemaEn: BriefSchema = { locale: "en", steps: briefStepsEn, socialNetworks: SOCIAL_NETWORKS_EN, otherNetwork: OTHER_NETWORK_EN };

export const briefSchemas: Record<Locale, BriefSchema> = { uk: briefSchemaUk, en: briefSchemaEn };
