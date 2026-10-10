import type { Metadata } from "next";
import { ThankYou } from "@/components/pages/ThankYou";

export const metadata: Metadata = {
  title: "Thank you — MIROFORM",
  description: "We’ve received your request and will get back to you shortly.",
  robots: { index: false, follow: false },
};

/** Shown only after a form on the English site was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return <ThankYou question={(await searchParams).type === "question"} locale="en" />;
}
