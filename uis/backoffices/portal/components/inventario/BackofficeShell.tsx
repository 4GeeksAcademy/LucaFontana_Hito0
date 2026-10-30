"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardList, Flame, LogOut, Package } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { href: "/inventario/backoffice/inventory/products", label: "Productos", icon: Package },
  { href: "/inventario/backoffice/inventory/orders/inbound", label: "Registrar entrada", icon: ArrowDownToLine },
  { href: "/inventario/backoffice/inventory/orders/outbound", label: "Registrar salida", icon: ArrowUpFromLine },
  { href: "/inventario/backoffice/inventory/orders", label: "Historial", icon: ClipboardList },
];

function NavigationLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  return navigation.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || (href.endsWith("/products") && pathname.startsWith(`${href}/`));
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
          active
            ? "bg-[var(--brand)]/12 text-[var(--brand-soft)]"
            : "text-white/60 hover:bg-white/[0.04] hover:text-white"
        } ${compact ? "" : "w-full"}`}
      >
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  });
}

export function BackofficeShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-[#11110f] text-[#f4f1eb] lg:flex">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#171714] px-4 py-5 lg:flex">
          <Link href="/inventario/backoffice/inventory/products" className="flex items-center gap-3 px-2 pb-8">
            <span className="flex size-9 items-center justify-center rounded-md bg-[var(--brand)] text-[#16110b]">
              <Flame size={19} fill="currentColor" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-[var(--font-display)] text-lg font-bold leading-5">Brasaland</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">Control de inventario</span>
            </span>
          </Link>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Operación</p>
          <nav className="flex flex-col gap-1" aria-label="Navegación de inventario">
            <NavigationLinks />
          </nav>
          <div className="mt-auto border-t border-white/[0.07] pt-4">
            <p className="truncate px-3 text-xs text-white/65" title={user?.email}>{user?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut size={17} aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-14 items-center justify-between border-b border-white/[0.07] px-4 sm:px-7">
            <div className="flex items-center gap-2 text-sm text-white/50 lg:hidden">
              <Flame size={18} className="text-[var(--brand-soft)]" aria-hidden="true" />
              <span className="font-[var(--font-display)] font-bold text-white">Brasaland</span>
              <span className="text-white/30">/</span>
              <span>Inventario</span>
            </div>
            <div className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-white/65 lg:block">
              Gestión de existencias
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden max-w-56 truncate text-xs text-white/50 sm:block">{user?.email}</span>
              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="flex size-9 items-center justify-center rounded-md text-white/55 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
              <span className="hidden size-2 rounded-full bg-emerald-400 sm:block" title="Sesión activa" />
            </div>
          </header>

          <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-2 lg:hidden" aria-label="Navegación de inventario">
            <NavigationLinks compact />
          </nav>

          <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9">{children}</main>
        </div>
      </div>
    </>
  );
}
