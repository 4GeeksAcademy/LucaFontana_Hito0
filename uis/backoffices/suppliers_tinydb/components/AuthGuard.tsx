"use client";

import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.assign(new URL("/login", window.location.origin).toString());
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/60">
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}
