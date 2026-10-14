import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";
import { getSiteContent } from "@/server/cms/published";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ ...(await getSiteContent("en")).seo.privacy, path: "/en/privacy-policy", locale: "en" });
}

export default async function PrivacyPolicyPage() {
  return <PrivacyPolicy locale="en" content={(await getSiteContent("en")).privacy} />;
}
