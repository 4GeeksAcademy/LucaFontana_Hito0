"use client";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090909]/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <Link href="/" className="text-lg font-black tracking-tight text-white hover:text-[var(--brand-soft)]">
          <span className="font-[var(--font-poppins)]">Brasaland</span>
          <span className="ml-2 hidden text-sm font-semibold uppercase tracking-[0.35em] text-white/45 sm:inline">
            Proveedores
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/account/profile"
                className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[var(--brand)]/15 px-4 py-2 text-sm font-medium text-[var(--brand-soft)] transition hover:bg-[var(--brand)]/25"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
