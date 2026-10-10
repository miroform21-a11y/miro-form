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
import { faq } from "@/data/faq";
import { faqJsonLd, offerCatalogJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Створення сайтів і лендінгів під ключ — від $390 | MIROFORM",
  description:
    "Розробка сайтів і лендінгів під ключ для бізнесу: дизайн, розробка, AI та Telegram-інтеграції. Лендінг від $390, запуск від 7 днів, фіксована ціна в договорі.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Services />
        <Works />
        <About />
        <Facts />
        <Process />
        <Pricing />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <LeadModal />
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [faqJsonLd(faq), offerCatalogJsonLd("uk")] }} />
    </>
  );
}
