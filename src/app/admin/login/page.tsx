import { redirect } from "next/navigation";
import { isAdmin } from "@/server/cms/dal";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0b0b] px-4 text-white">
      <div className="w-full max-w-[380px] rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="font-display text-[18px] font-semibold">MIROFORM · Админ-панель</p>
        <p className="mt-1 mb-6 text-[13px] text-white/50">Войдите, чтобы редактировать сайт.</p>
        <LoginForm />
      </div>
    </main>
  );
}
