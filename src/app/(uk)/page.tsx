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

/** Regenerated in the background at most every 10 minutes (publishing refreshes it at once) — also when the build ran without the database */
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent("uk");
  return pageMetadata({ ...c.seo.home, path: "/" });
}

/** Home page: every section renders the published content (src/content when nothing is published). */
export default async function Home() {
  const c = await getSiteContent("uk");
  return (
    <>
      <main>
        <Hero locale="uk" content={c.hero} headerContent={c.header} />
        <Services locale="uk" content={c.services} />
        <Works locale="uk" content={c.works} />
        <About locale="uk" content={c.about} />
        <Facts locale="uk" content={c.facts} />
        <Process locale="uk" content={c.process} />
        <Pricing locale="uk" content={c.pricing} />
        <Reviews locale="uk" content={c.reviews} />
        <Faq locale="uk" content={c.faq} />
        <Contact locale="uk" content={c.contact} formsContent={c.forms} />
      </main>
      <Footer locale="uk" content={c.footer} />
      <LeadModal locale="uk" content={c.forms} />
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [faqJsonLd(c.faq.items), offerCatalogJsonLd("uk", c.pricing.plans)] }} />
    </>
  );
}
