"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.profile) {
      return;
    }
    const profile = user.profile;
    // syncs the form once profile data arrives asynchronously from the auth context
    Promise.resolve().then(() => {
      setForm({ name: profile.name ?? "", phone: profile.phone ?? "", address: profile.address ?? "" });
    });
  }, [user]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await updateProfile(form);
      setSuccess("Perfil actualizado correctamente");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-black text-white">
          Mi perfil
        </h1>
        <p className="mt-2 text-white/60">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-white/80">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="address" className="text-sm font-medium text-white/80">
            Dirección
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-400">{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-[#f97316] px-6 py-3 text-base font-bold text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
