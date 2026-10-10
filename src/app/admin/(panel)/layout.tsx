import { AdminProvider } from "@/admin/store";
import { AdminShell } from "@/admin/components/AdminShell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
