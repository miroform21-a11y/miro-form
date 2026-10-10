import type { Metadata } from "next";
import { ThankYou } from "@/components/pages/ThankYou";

export const metadata: Metadata = {
  title: "Дякуємо за заявку — MIROFORM",
  description: "Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
  robots: { index: false, follow: false },
};

/** Shown only after a form was sent successfully (see ContactForm). */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return <ThankYou question={(await searchParams).type === "question"} />;
}
