import type { Metadata } from "next";
import { ThankYou } from "@/components/pages/ThankYou";
import { getSiteContent } from "@/server/cms/published";

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await getSiteContent("uk")).seo.thankYou, robots: { index: false, follow: false } };
}

/** Shown only after a form was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return <ThankYou question={(await searchParams).type === "question"} content={(await getSiteContent("uk")).thankYou} />;
}
