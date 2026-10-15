import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";
import { getBriefContent, getSiteContent } from "@/server/cms/published";

/** Regenerated in the background at most every 10 minutes (publishing refreshes it at once) — also when the build ran without the database */
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await getSiteContent("uk")).seo.brief, robots: { index: false, follow: false } };
}

export default async function Page() {
  const b = await getBriefContent("uk");
  return <BriefPage content={b.page} uiContent={b.ui} schema={b.schema} />;
}
