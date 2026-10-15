import { notFound } from "next/navigation";
import { findSection } from "@/admin/sections";
import { SectionPage } from "@/admin/components/SectionPage";

export default async function AdminSectionPage({ params }: { params: Promise<{ locale: string; area: string; section: string }> }) {
  const { locale, area, section } = await params;
  if ((locale !== "uk" && locale !== "en") || !findSection(area, section)) notFound();
  return <SectionPage locale={locale} area={area} id={section} />;
}
