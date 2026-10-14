"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminSecrets } from "@/server/cms/env";
import { clearSessionCookies } from "@/server/cms/dal";
import { takeLoginSlot } from "@/server/cms/login-throttle";
import { clientIp, createSessionToken, isSecureRequest, passwordMatches, sessionCookie } from "@/server/cms/session";

export type LoginState = { error?: string };

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Password login → signed session cookie. Every failure looks the same and takes about the same time. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const secrets = adminSecrets();
  if (!secrets) return { error: "Вход отключён: на сервере не заданы ADMIN_PASSWORD и ADMIN_SESSION_SECRET." };
  const h = await headers();

  const slot = await takeLoginSlot(clientIp(h));
  if (slot === "unavailable") return { error: "Вход временно недоступен: нет связи с базой данных. Попробуйте позже." };
  if (slot === "limited") {
    await pause(800);
    return { error: "Слишком много попыток входа. Подождите 15 минут и попробуйте снова." };
  }

  const input = String(formData.get("password") ?? "").slice(0, 512);
  if (!passwordMatches(input, secrets.password)) {
    await pause(600 + Math.floor(Math.random() * 400));
    return { error: "Неверный пароль." };
  }

  const c = sessionCookie(isSecureRequest(h));
  (await cookies()).set(c.name, createSessionToken(secrets.secret, secrets.password), c.options);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookies();
  redirect("/admin/login");
}
