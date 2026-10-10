import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteContent } from "@/content";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";

export const metadata: Metadata = pageMetadata({
  ...siteContent.uk.seo.privacy,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
