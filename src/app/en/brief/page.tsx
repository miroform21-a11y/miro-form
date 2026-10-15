import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";
import { ogImageBriefEn, pageMetadata } from "@/lib/seo";
import { getBriefContent, getSiteContent } from "@/server/cms/published";

/** noindex like the Ukrainian brief, but with its own English link preview (messengers show it when the link is shared) */
/** Regenerated in the background at most every 10 minutes (publishing refreshes it at once) — also when the build ran without the database */
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...pageMetadata({ ...(await getSiteContent("en")).seo.brief, path: "/en/brief", locale: "en", image: ogImageBriefEn }),
    robots: { index: false, follow: false },
  };
}

export default async function Page() {
  const b = await getBriefContent("en");
  return <BriefPage locale="en" content={b.page} uiContent={b.ui} schema={b.schema} />;
}
