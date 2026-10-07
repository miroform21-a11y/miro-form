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
    </>
  );
}
