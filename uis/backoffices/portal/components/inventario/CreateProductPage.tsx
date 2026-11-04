"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";

import { createProduct, type ProductCreatePayload } from "./api";

const initialForm: ProductCreatePayload = {
  name: "",
  sku: "",
  unit: "",
  category: "",
  country: "",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1b1b18] px-3 text-sm text-[#f4f1eb] outline-none transition focus:border-[#ed9b54] focus:ring-2 focus:ring-[#ed9b54]/20 disabled:cursor-not-allowed disabled:opacity-50";

export function CreateProductPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof ProductCreatePayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        unit: form.unit.trim(),
        category: form.category.trim(),
        country: form.country.trim(),
      });
      setForm(initialForm);
      setSuccess(true);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear el producto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8a56d]">
            Existencias · Catálogo
          </p>
          <h1 className="font-[var(--font-display)] text-3xl font-bold text-[#f4f1eb]">
            Crear producto
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Registra un producto para que esté disponible en el catálogo y en los movimientos de inventario.
          </p>
        </div>
        <Link
          href="/inventario/backoffice/inventory/products"
          className="inline-flex h-10 items-center gap-2 px-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Productos
        </Link>
      </header>

      <section className="max-w-3xl border border-white/[0.09] bg-[#171714] p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#ed9b54]/20 bg-[#ed9b54]/[0.08] text-[#f2b77e]">
            <PackagePlus size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-white/90">Datos del producto</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">Todos los campos son obligatorios.</p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 border border-rose-400/25 bg-rose-400/[0.08] px-3.5 py-3 text-sm text-rose-200" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-emerald-400/25 bg-emerald-400/[0.08] px-3.5 py-3 text-sm text-emerald-200" role="status">
            <span>Producto creado correctamente.</span>
            <Link href="/inventario/backoffice/inventory/products" className="font-semibold underline underline-offset-4">
              Ver catálogo
            </Link>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="product-name" className="block text-sm font-medium text-white/75">
            Nombre
            <input
              id="product-name"
              required
              maxLength={120}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClassName}
              placeholder="Ej. Harina de trigo"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="product-sku" className="block text-sm font-medium text-white/75">
              SKU
              <input
                id="product-sku"
                required
                maxLength={80}
                value={form.sku}
                onChange={(event) => updateField("sku", event.target.value)}
                className={inputClassName}
                placeholder="Ej. HAR-001"
              />
            </label>
            <label htmlFor="product-unit" className="block text-sm font-medium text-white/75">
              Unidad de medida
              <input
                id="product-unit"
                required
                maxLength={40}
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                className={inputClassName}
                placeholder="Ej. kg"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="product-category" className="block text-sm font-medium text-white/75">
              Categoría
              <input
                id="product-category"
                required
                maxLength={80}
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={inputClassName}
                placeholder="Ej. secos"
              />
            </label>
            <label htmlFor="product-country" className="block text-sm font-medium text-white/75">
              País
              <select
                id="product-country"
                required
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={inputClassName}
              >
                <option value="">Selecciona un país</option>
                <option value="CO">CO (Colombia)</option>
                <option value="US">US (Estados Unidos)</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end border-t border-white/[0.07] pt-5">
            <button type="submit" disabled={submitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#e88c45] px-4 text-sm font-bold text-[#17120c] transition hover:bg-[#f2ad70] disabled:cursor-not-allowed disabled:opacity-50">
              <PackagePlus size={16} aria-hidden="true" />
              {submitting ? "Creando…" : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
