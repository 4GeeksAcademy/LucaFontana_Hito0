"use client";

import { useState, useSyncExternalStore } from "react";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearStoredToken, getStoredToken } from "@shared/auth";

const applications = [
  { href: "/inventario", label: "Inventario" },
  { href: "/incidentes", label: "Administrar incidentes" },
  { href: "/analizador-incidentes", label: "Analizar incidentes" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/talent-pipeline-tracker", label: "Talent pipeline tracker" },
];

const publicAuthRoutes = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function subscribeToAuthentication(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getAuthenticationSnapshot() {
  return Boolean(getStoredToken());
}

export function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthentication,
    getAuthenticationSnapshot,
    () => false,
  );
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const isMenuOpen = openMenuPath === pathname;

  if (publicAuthRoutes.has(pathname)) {
    return null;
  }

  function logout() {
    clearStoredToken();
    router.push("/login");
  }

  const profileIsActive = pathname.startsWith("/proveedores/account/");

  return (
    <>
      <header className="relative z-40 border-b border-white/10 bg-[#0a0a0a] text-white">
        <nav
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
          aria-label="Navegación general"
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMenuPath(pathname)}
              aria-expanded={isMenuOpen}
              aria-controls="global-app-menu"
              aria-label="Abrir menú de aplicaciones"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/80 transition hover:border-[#f97316]/60 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f97316]"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <Link href="/" className="truncate font-[var(--font-poppins)] text-lg font-bold tracking-tight">
              <span>Brasa</span><span className="text-[#f97316]">land</span>
              <span className="ml-2 hidden text-xs font-semibold uppercase tracking-[0.18em] text-white/45 sm:inline">
                Backoffice
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/proveedores/account/profile"
                  aria-current={profileIsActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#f97316] sm:px-4 ${
                    profileIsActive
                      ? "bg-[#f97316]/15 text-[#fb923c]"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <UserRound size={17} aria-hidden="true" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f97316] sm:px-4"
                >
                  <LogOut size={17} aria-hidden="true" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-[#f97316]/15 px-3 py-2 text-sm font-semibold text-[#fb923c] transition hover:bg-[#f97316]/25 sm:px-4"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Cerrar menú de aplicaciones"
            onClick={() => setOpenMenuPath(null)}
            className="absolute inset-0 bg-black/70"
          />
          <aside
            id="global-app-menu"
            aria-label="Aplicaciones de Brasaland"
            className="relative flex h-full w-80 max-w-[85vw] flex-col border-r border-white/10 bg-[#141414] p-5 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-[var(--font-poppins)] text-lg font-bold text-white">Aplicaciones</h2>
              <button
                type="button"
                onClick={() => setOpenMenuPath(null)}
                aria-label="Cerrar menú"
                className="inline-flex size-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f97316]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Aplicaciones disponibles">
              {applications.map(({ href, label }) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#f97316] ${
                      active
                        ? "bg-[#f97316]/15 text-[#fb923c]"
                        : "text-white/75 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              {pathname.startsWith("/analizador-incidentes") ? (
                <>
                  <p className="mb-1 mt-5 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Analizador de incidentes
                  </p>
                  {[
                    { href: "/analizador-incidentes", label: "Inicio" },
                    { href: "/analizador-incidentes/incidents", label: "Análisis de incidencias" },
                  ].map(({ href, label }) => {
                    const active = pathname === href || (href !== "/analizador-incidentes" && pathname.startsWith(`${href}/`));
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#f97316] ${
                          active
                            ? "bg-[#f97316]/15 text-[#fb923c]"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </>
              ) : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
