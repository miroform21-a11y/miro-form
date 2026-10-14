import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";
import { getSiteContent } from "@/server/cms/published";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ ...(await getSiteContent("uk")).seo.privacy, path: "/privacy" });
}

export default async function PrivacyPage() {
  return <PrivacyPolicy content={(await getSiteContent("uk")).privacy} />;
}
