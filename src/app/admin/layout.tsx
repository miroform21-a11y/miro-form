import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "../fonts";
import { adminSecrets } from "@/server/cms/env";

/** Root layout of the admin (/admin). Without ADMIN_PASSWORD and ADMIN_SESSION_SECRET on the server it is not served at all. */
export function generateMetadata(): Metadata {
  const robots = { index: false, follow: false, nocache: true };
  // when it is not served, nothing on the 404 hints at an admin panel
  return adminSecrets() ? { title: "Админ-панель — MIROFORM", robots } : { title: "Сторінку не знайдено — MIROFORM", robots };
}

/** Never prerendered: whether the admin exists depends on the server secrets of the running deployment */
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#050505" };

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!adminSecrets()) notFound();
  return (
    <html lang="ru" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
