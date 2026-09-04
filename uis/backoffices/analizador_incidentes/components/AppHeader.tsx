"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  { href: "/", label: "Inicio" },
  { href: "/incidents", label: "Análisis de incidencias" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function AppHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090909]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <Link
          href="/"
          className="rounded-lg text-2xl font-black tracking-tight text-white transition hover:text-[#fb923c] focus:outline-none focus:ring-2 focus:ring-[#f97316]"
        >
          <span className="font-[family-name:var(--font-poppins)]">Brasa</span>
          <span className="font-[family-name:var(--font-poppins)] text-[#f97316]">land</span>
          <span className="ml-3 hidden text-sm font-semibold uppercase tracking-[0.35em] text-white/45 sm:inline">
            Backoffice
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {navigationItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#f97316] ${
                  isActive
                    ? "bg-[#f97316]/15 text-[#fb923c]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

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
              className="rounded-full bg-[#f97316]/15 px-4 py-2 text-sm font-medium text-[#fb923c] transition hover:bg-[#f97316]/25"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-lg p-2 text-white/80 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f97316] md:hidden"
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Abrir menú de navegación"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen ? (
        <div id="mobile-menu" className="border-t border-white/8 bg-[#090909]/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navigationItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#f97316]/15 text-[#fb923c]"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link
                  href="/account/profile"
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi perfil
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-2xl bg-[#f97316]/15 px-4 py-3 text-sm font-medium text-[#fb923c]"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}