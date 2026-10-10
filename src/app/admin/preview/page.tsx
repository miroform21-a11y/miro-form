import { PreviewRenderer } from "@/admin/components/PreviewRenderer";

/** Rendered inside the editor's iframe only (receives the draft content via postMessage). */
export default function AdminPreviewPage() {
  return <PreviewRenderer />;
}
