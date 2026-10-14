import type { Metadata } from "next";
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
import { faqJsonLd, offerCatalogJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/server/cms/published";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent("en");
  return pageMetadata({ ...c.seo.home, path: "/en", locale: "en" });
}

/** The English home page: the same sections as the Ukrainian site, with English copy (published content). */
export default async function EnglishHome() {
  const c = await getSiteContent("en");
  return (
    <>
      <main>
        <Hero locale="en" content={c.hero} headerContent={c.header} />
        <Services locale="en" content={c.services} />
        <Works locale="en" content={c.works} />
        <About locale="en" content={c.about} />
        <Facts locale="en" content={c.facts} />
        <Process locale="en" content={c.process} />
        <Pricing locale="en" content={c.pricing} />
        <Reviews locale="en" content={c.reviews} />
        <Faq locale="en" content={c.faq} />
        <Contact locale="en" content={c.contact} formsContent={c.forms} />
      </main>
      <Footer locale="en" content={c.footer} />
      <LeadModal locale="en" content={c.forms} />
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [faqJsonLd(c.faq.items), offerCatalogJsonLd("en", c.pricing.plans)] }} />
    </>
  );
}
