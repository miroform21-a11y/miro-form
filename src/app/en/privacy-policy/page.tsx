import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteContent } from "@/content";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";

export const metadata: Metadata = pageMetadata({
  ...siteContent.en.seo.privacy,
  path: "/en/privacy-policy",
  locale: "en",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy locale="en" />;
}
