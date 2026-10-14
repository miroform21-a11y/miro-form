import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";
import { getBriefContent, getSiteContent } from "@/server/cms/published";

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await getSiteContent("uk")).seo.brief, robots: { index: false, follow: false } };
}

export default async function Page() {
  const b = await getBriefContent("uk");
  return <BriefPage content={b.page} uiContent={b.ui} schema={b.schema} />;
}
