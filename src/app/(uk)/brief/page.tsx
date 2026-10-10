import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";
import { siteContent } from "@/content";

export const metadata: Metadata = {
  ...siteContent.uk.seo.brief,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BriefPage />;
}
