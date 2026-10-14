"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="password" className="text-[13px] font-medium text-white/80">
        Пароль администратора
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        autoFocus
        aria-invalid={!!state.error}
        aria-describedby={state.error ? "login-error" : undefined}
        className="min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[15px] text-white outline-none focus:border-lime/70 aria-[invalid=true]:border-orange/80"
      />
      {state.error && (
        <p id="login-error" role="alert" className="text-[13px] text-orange">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-lime px-4 py-2 text-[15px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50">
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
