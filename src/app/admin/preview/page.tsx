import { PreviewRenderer } from "@/admin/components/PreviewRenderer";
import { requireAdminPage } from "@/server/cms/dal";

/** Rendered inside the editor's iframe only (receives the draft content via postMessage). */
export default async function AdminPreviewPage() {
  await requireAdminPage();
  return <PreviewRenderer />;
}
