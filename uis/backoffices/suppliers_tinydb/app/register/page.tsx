"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo completar el registro");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-[var(--font-poppins)] text-3xl font-black text-white">Crear cuenta</h1>
        <p className="mt-2 text-white/60">Registra tus credenciales y datos de contacto opcionales.</p>
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
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
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
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Nombre (opcional)
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-white/80">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="address" className="text-sm font-medium text-white/80">
            Dirección (opcional)
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-[var(--brand)] px-6 py-3 text-base font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-sm text-white/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand-soft)] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
