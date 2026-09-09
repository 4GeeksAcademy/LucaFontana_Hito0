"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { createAuthApiClient, resolveAuthApiBaseUrl } from "@shared/auth";

const api = createAuthApiClient(resolveAuthApiBaseUrl(), () => undefined);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(queryToken);
    if (!queryToken) setError("El enlace de recuperación no contiene un token válido.");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
    setError(null);
    setIsSubmitting(true);
    try { await api.resetPassword(token, password); router.push("/login?reset=success"); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "El enlace no es válido o ya expiró."); }
    finally { setIsSubmitting(false); }
  }

  return <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:px-6"><div><h1 className="font-[family-name:var(--font-poppins)] text-3xl font-black text-white">Nueva contraseña</h1><p className="mt-2 text-white/60">Elige una contraseña de al menos 8 caracteres.</p></div><form onSubmit={handleSubmit} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-medium text-white/80" htmlFor="password">Nueva contraseña<input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40" /></label><label className="flex flex-col gap-2 text-sm font-medium text-white/80" htmlFor="confirmation">Confirmar contraseña<input id="confirmation" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40" /></label>{error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}<button type="submit" disabled={isSubmitting || !token} className="rounded-full bg-[#f97316] px-6 py-3 text-base font-bold text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Guardando…" : "Crear contraseña"}</button></form><Link href="/forgot-password" className="text-sm font-semibold text-[#fb923c] hover:underline">Solicitar otro enlace</Link></div>;
}
