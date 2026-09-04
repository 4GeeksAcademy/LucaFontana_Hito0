"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPath) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, isPublicPath, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/60">
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}
