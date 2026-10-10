import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy — MIROFORM",
  description: "How MIROFORM collects, uses and protects the personal data of website visitors.",
  path: "/en/privacy-policy",
  locale: "en",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy locale="en" />;
}
