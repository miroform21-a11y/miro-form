import type { Metadata } from "next";
import { BriefPage } from "@/components/pages/BriefPage";

export const metadata: Metadata = {
  title: "Бриф — MIROFORM",
  description: "Анкета для нового проєкту MIROFORM: цілі, структура, функціонал, контент, терміни та бюджет.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BriefPage />;
}
