import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/pages/PrivacyPolicy";

export const metadata: Metadata = pageMetadata({
  title: "Політика конфіденційності — MIROFORM",
  description: "Як MIROFORM збирає, використовує та захищає персональні дані відвідувачів сайту.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
