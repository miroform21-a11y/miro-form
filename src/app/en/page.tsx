import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Works } from "@/components/sections/Works";
import { About } from "@/components/sections/About";
import { Facts } from "@/components/sections/Facts";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { LeadModal } from "@/components/sections/LeadModal";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqByLocale } from "@/data/faq";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Turnkey Website Development for Business — MIROFORM",
  description:
    "We build landing pages, corporate websites and online stores, turnkey. Modern design, development, AI and Telegram integrations. From idea to launch in as little as 7 days.",
  path: "/en",
  locale: "en",
});

/** The English home page: the same sections as the Ukrainian site, with English copy. */
export default function EnglishHome() {
  return (
    <>
      <main>
        <Hero locale="en" />
        <Services locale="en" />
        <Works locale="en" />
        <About locale="en" />
        <Facts locale="en" />
        <Process locale="en" />
        <Pricing locale="en" />
        <Reviews locale="en" />
        <Faq locale="en" />
        <Contact locale="en" />
      </main>
      <Footer locale="en" />
      <LeadModal locale="en" />
      <JsonLd data={{ "@context": "https://schema.org", ...faqJsonLd(faqByLocale.en) }} />
    </>
  );
}
