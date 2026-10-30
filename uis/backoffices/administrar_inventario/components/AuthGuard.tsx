"use client";

import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) window.location.assign(new URL("/login", window.location.origin).toString());
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11110f] text-sm text-white/60" role="status">
        <span className="mr-3 size-2 animate-pulse rounded-full bg-[var(--brand)]" />
        Verificando sesión
      </div>
    );
  }

  return <>{children}</>;
}
