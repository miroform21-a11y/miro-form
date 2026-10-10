import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "../fonts";
import { adminEnabled } from "@/admin/env";

/** Root layout of the demo admin panel (/admin), see admin/env.ts for when it is served. */
export function generateMetadata(): Metadata {
  const robots = { index: false, follow: false, nocache: true };
  // when it is not served, nothing on the 404 hints at an admin panel
  return adminEnabled() ? { title: "Админ-панель (демо) — MIROFORM", robots } : { title: "Сторінку не знайдено — MIROFORM", robots };
}

export const viewport: Viewport = { themeColor: "#050505" };

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!adminEnabled()) notFound();
  return (
    <html lang="ru" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
