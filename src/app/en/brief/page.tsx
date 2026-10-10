import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";

export const metadata: Metadata = {
  title: "Project Brief — MIROFORM",
  description: "Project questionnaire for MIROFORM: goals, structure, features, content, timeline and budget.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BriefPage locale="en" />;
}
