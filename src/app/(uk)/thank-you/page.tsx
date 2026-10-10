import type { Metadata } from "next";
import { ThankYou } from "@/components/pages/ThankYou";
import { siteContent } from "@/content";

export const metadata: Metadata = {
  ...siteContent.uk.seo.thankYou,
  robots: { index: false, follow: false },
};

/** Shown only after a form was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return <ThankYou question={(await searchParams).type === "question"} />;
}
