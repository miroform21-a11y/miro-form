import { AdminProvider } from "@/admin/store";
import { AdminShell } from "@/admin/components/AdminShell";
import { requireAdminPage } from "@/server/cms/dal";
import { supabaseConfig } from "@/server/cms/env";
import { loadState } from "@/server/cms/admin-ops";
import { logout } from "../login/actions";

/** Every admin page: session check on the server, then the CMS state (drafts, versions, history) */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  if (!supabaseConfig()) return <Notice text="База данных не подключена: на сервере не заданы SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY и SUPABASE_SECRET_KEY." />;
  let initial;
  try {
    initial = await loadState(session);
  } catch (e) {
    console.error(`[cms] ${(e as Error).message}`);
    return <Notice text="Не удалось загрузить данные из базы. Проверьте, что проект Supabase активен (бесплатные проекты засыпают после недели без активности), и обновите страницу." />;
  }
  return (
    <AdminProvider initial={initial}>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0b0b] px-4 text-white">
      <div className="max-w-[460px] rounded-2xl border border-orange/40 bg-orange/10 p-6 text-[14px] leading-relaxed">
        <p className="font-semibold text-orange">Админ-панель недоступна</p>
        <p className="mt-2 text-white/75">{text}</p>
        <form action={logout} className="mt-4">
          <button type="submit" className="min-h-11 rounded-lg border border-white/15 px-4 py-2 text-[13px] text-white/80 hover:bg-white/5">
            Выйти
          </button>
        </form>
      </div>
    </main>
  );
}
