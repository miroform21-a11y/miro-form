import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";
import { getSiteContent } from "@/server/cms/published";

/** Regenerated in the background at most every 10 minutes (publishing refreshes it at once) — also when the build ran without the database */
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ ...(await getSiteContent("uk")).seo.privacy, path: "/privacy" });
}

export default async function PrivacyPage() {
  return <PrivacyPolicy content={(await getSiteContent("uk")).privacy} />;
}
