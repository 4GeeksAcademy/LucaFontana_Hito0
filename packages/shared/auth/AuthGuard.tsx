"use client";

import { useEffect, useState } from "react";

import { createAuthApiClient, getStoredToken, resolveAuthApiBaseUrl } from "./index";

type AuthStatus = "checking" | "authorized" | "error";

export function SharedAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (!getStoredToken()) {
      window.location.assign(new URL("/login", window.location.origin).toString());
      return () => {
        active = false;
      };
    }

    const redirectToLogin = () => window.location.assign(new URL("/login", window.location.origin).toString());
    const api = createAuthApiClient(resolveAuthApiBaseUrl(), redirectToLogin);
    api.getMe()
      .then(() => {
        if (active) setStatus("authorized");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === "authorized") return <>{children}</>;

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p role="alert" className="text-sm text-red-400">No se pudo verificar la sesión.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setAttempt((current) => current + 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">
            Reintentar
          </button>
          <button type="button" onClick={() => window.location.assign(new URL("/login", window.location.origin).toString())} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-white/60" role="status">
      Verificando sesión…
    </div>
  );
}
