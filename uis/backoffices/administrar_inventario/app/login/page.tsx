"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Flame, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/backoffice/inventory/products");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#11110f] px-4 py-12 text-[#f4f1eb]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(248,129,54,0.12),transparent_34%),linear-gradient(135deg,transparent_58%,rgba(205,176,119,0.05))]" />
      <div className="relative w-full max-w-[410px]">
        <div className="mb-9 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-[var(--brand)] text-[#17120c]">
            <Flame size={22} fill="currentColor" aria-hidden="true" />
          </span>
          <div>
            <p className="font-[var(--font-display)] text-xl font-bold">Brasaland</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Inventario · Backoffice</p>
          </div>
        </div>

        <section className="border-y border-white/10 py-8 sm:border-x sm:px-8">
          <div className="mb-7 flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] text-[var(--brand-soft)]">
            <KeyRound size={18} aria-hidden="true" />
          </div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">Accede a las existencias y movimientos de tus ubicaciones.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium text-white/75" htmlFor="email">
              Correo electrónico
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                placeholder="nombre@brasaland.com"
              />
            </label>
            <label className="block text-sm font-medium text-white/75" htmlFor="password">
              Contraseña
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                placeholder="Tu contraseña"
              />
            </label>

            {error ? <p role="alert" className="border-l-2 border-rose-400 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-bold text-[#17120c] transition hover:bg-[var(--brand-soft)] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Validando acceso…" : "Entrar al inventario"}
              {!submitting ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </button>
          </form>
        </section>
        <p className="mt-5 text-xs leading-5 text-white/35">La sesión se valida con el servicio central de autenticación.</p>
      </div>
    </main>
  );
}
