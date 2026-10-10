import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";
import { ogImageBriefEn, pageMetadata } from "@/lib/seo";
import { siteContent } from "@/content";

/** noindex like the Ukrainian brief, but with its own English link preview (messengers show it when the link is shared) */
export const metadata: Metadata = {
  ...pageMetadata({
    ...siteContent.en.seo.brief,
    path: "/en/brief",
    locale: "en",
    image: ogImageBriefEn,
  }),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BriefPage locale="en" />;
}
