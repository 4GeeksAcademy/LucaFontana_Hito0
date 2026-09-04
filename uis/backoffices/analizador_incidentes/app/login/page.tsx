"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-black text-white">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-white/60">Accede al backoffice con tu email y contraseña.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-[#f97316] px-6 py-3 text-base font-bold text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <p className="text-sm text-white/60">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-[#fb923c] hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
