"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { createAuthApiClient, resolveAuthApiBaseUrl } from "@shared/auth";

const api = createAuthApiClient(resolveAuthApiBaseUrl(), () => undefined);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:px-6">
      <div><h1 className="font-[var(--font-poppins)] text-3xl font-black text-white">Recuperar contraseña</h1><p className="mt-2 text-white/60">Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.</p></div>
      {submitted ? <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">Si esa dirección está registrada, recibirás un enlace de recuperación en breve.</p> : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-white/80" htmlFor="email">Email<input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40" /></label>
          {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-[var(--brand)] px-6 py-3 text-base font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Enviando…" : "Enviar enlace"}</button>
        </form>
      )}
      <Link href="/login" className="text-sm font-semibold text-[var(--brand-soft)] hover:underline">Volver a iniciar sesión</Link>
    </div>
  );
}
