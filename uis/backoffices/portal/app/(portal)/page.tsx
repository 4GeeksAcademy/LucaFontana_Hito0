"use client";

import Link from "next/link";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

const backoffices = [
  { href: "/inventario", title: "Inventario", description: "Productos, existencias y movimientos." },
  { href: "/incidentes", title: "Administrar incidentes", description: "Registrar y gestionar incidentes operativos." },
  { href: "/analizador-incidentes", title: "Analizador de incidentes", description: "Analizar archivos CSV de incidencias." },
  { href: "/proveedores", title: "Proveedores", description: "Consultar y mantener el directorio de proveedores." },
  { href: "/talent-pipeline-tracker", title: "Talent pipeline", description: "Gestionar candidaturas y notas de seguimiento." },
];

function BackofficeIndex() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-soft)]">Brasaland Digital</p>
          <h1 className="mt-2 font-[var(--font-poppins)] text-3xl font-black text-white sm:text-4xl">Backoffice</h1>
          <p className="mt-2 text-sm text-white/60">Elige una aplicación para continuar.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="max-w-56 truncate text-sm text-white/60">{user?.email}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Aplicaciones de backoffice">
        {backoffices.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-[var(--brand)]/60 hover:bg-white/[0.06]"
          >
            <h2 className="font-[var(--font-poppins)] text-lg font-bold text-white group-hover:text-[var(--brand-soft)]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-[var(--brand-soft)]">Abrir aplicación →</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <BackofficeIndex />
    </AuthGuard>
  );
}
