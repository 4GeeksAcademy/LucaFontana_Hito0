"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  COUNTRY_OPTIONS,
  CURRENCY_BY_COUNTRY,
  CURRENCY_OPTIONS,
  STATUS_LABELS,
  type Supplier,
  type SupplierCategory,
  type SupplierCountry,
  type SupplierCurrency,
  type SupplierStatus,
} from "@/types/suppliers";

type SuppliersDashboardProps = {
  apiBaseUrl: string;
};

type FilterState = {
  country: "" | SupplierCountry;
  category: "" | SupplierCategory;
};

type SupplierFormState = {
  name: string;
  country: SupplierCountry;
  categories: SupplierCategory[];
  rate_per_unit: string;
  currency: SupplierCurrency;
  status: SupplierStatus;
  contact_email: string;
  notes: string;
};

type FormField = keyof SupplierFormState;
type FormErrors = Partial<Record<FormField | "_form", string>>;

type ApiValidationItem = {
  loc?: Array<string | number>;
  msg?: string;
};

const EMPTY_FORM: SupplierFormState = {
  name: "",
  country: "Colombia",
  categories: [],
  rate_per_unit: "",
  currency: "COP",
  status: "active",
  contact_email: "",
  notes: "",
};

const currencyFormatterByCurrency: Record<SupplierCurrency, Intl.NumberFormat> = {
  COP: new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
  USD: new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function SuppliersDashboard({ apiBaseUrl }: SuppliersDashboardProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState<FilterState>({ country: "", category: "" });
  const [supplierIdQuery, setSupplierIdQuery] = useState("");
  const [activeSupplierIdSearch, setActiveSupplierIdSearch] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [formState, setFormState] = useState<SupplierFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rateDrafts, setRateDrafts] = useState<Record<number, string>>({});
  const [pendingRows, setPendingRows] = useState<Record<number, "status" | "rate" | "delete" | undefined>>({});
  const [rowMessages, setRowMessages] = useState<Record<number, string | undefined>>({});

  const deferredSuppliers = useDeferredValue(suppliers);

  const summary = useMemo(() => {
    const activeCount = suppliers.filter((supplier) => supplier.status === "active").length;
    return {
      total: suppliers.length,
      active: activeCount,
      suspended: suppliers.length - activeCount,
      countries: new Set(suppliers.map((supplier) => supplier.country)).size,
    };
  }, [suppliers]);

  const sortedSuppliers = useMemo(() => {
    return [...deferredSuppliers].sort((left, right) => right.updated_at.localeCompare(left.updated_at));
  }, [deferredSuppliers]);

  const applyLoadedSuppliers = (nextSuppliers: Supplier[]) => {
    startTransition(() => {
      setSuppliers(nextSuppliers);
      setRateDrafts(Object.fromEntries(nextSuppliers.map((supplier) => [supplier.id, String(supplier.rate_per_unit)])));
    });
  };

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError(null);
    setSearchError(null);

    void fetchSuppliersView(filters, activeSupplierIdSearch)
      .then((nextSuppliers) => {
        if (!isMounted) {
          return;
        }

        applyLoadedSuppliers(nextSuppliers);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "No se pudo cargar el directorio.";
        applyLoadedSuppliers([]);

        if (activeSupplierIdSearch !== null) {
          setSearchError(message);
        } else {
          setLoadError(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeSupplierIdSearch, filters]);

  const handleFilterChange = <K extends keyof FilterState>(field: K, value: FilterState[K]) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [field]: value }));
    });

    setActiveSupplierIdSearch(null);
    setSupplierIdQuery("");
    setSearchError(null);
  };

  const handleFormChange = <K extends keyof SupplierFormState>(field: K, value: SupplierFormState[K]) => {
    setFormMessage(null);
    setFormErrors((current) => ({ ...current, [field]: undefined, _form: undefined }));

    if (field === "country") {
      const nextCountry = value as SupplierCountry;
      setFormState((current) => ({
        ...current,
        country: nextCountry,
        currency: CURRENCY_BY_COUNTRY[nextCountry],
      }));
      return;
    }

    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleCategoryToggle = (category: SupplierCategory) => {
    setFormMessage(null);
    setFormErrors((current) => ({ ...current, categories: undefined, _form: undefined }));

    setFormState((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const handleCreateSupplier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateFormState(formState);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);
    setFormErrors({});

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          name: formState.name.trim(),
          rate_per_unit: Number(formState.rate_per_unit),
          contact_email: formState.contact_email.trim() || null,
          notes: formState.notes.trim() || null,
        }),
      });

      const payload = (await response.json()) as Supplier | { detail?: unknown };

      if (response.status === 422) {
        setFormErrors(mapApiValidationErrors(payload as { detail?: unknown }));
        return;
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      setFormState(EMPTY_FORM);
      setFormMessage("Proveedor registrado correctamente.");
      applyLoadedSuppliers(await fetchSuppliersView(filters, activeSupplierIdSearch));
    } catch (error) {
      setFormErrors({ _form: error instanceof Error ? error.message : "No se pudo registrar el proveedor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (supplier: Supplier) => {
    const nextStatus: SupplierStatus = supplier.status === "active" ? "suspended" : "active";
    setPendingRows((current) => ({ ...current, [supplier.id]: "status" }));
    setRowMessages((current) => ({ ...current, [supplier.id]: undefined }));

    try {
      const response = await fetch(`/api/suppliers/status?id=${supplier.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json()) as Supplier | { detail?: unknown };

      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      const updatedSupplier = payload as Supplier;
      startTransition(() => {
        setSuppliers((current) => current.map((entry) => (entry.id === updatedSupplier.id ? updatedSupplier : entry)));
      });
      setRowMessages((current) => ({ ...current, [supplier.id]: "Estado actualizado." }));
    } catch (error) {
      setRowMessages((current) => ({
        ...current,
        [supplier.id]: error instanceof Error ? error.message : "No se pudo actualizar el estado.",
      }));
    } finally {
      setPendingRows((current) => ({ ...current, [supplier.id]: undefined }));
    }
  };

  const handleRateSave = async (supplier: Supplier) => {
    const rawValue = rateDrafts[supplier.id] ?? "";
    const parsedRate = Number(rawValue);

    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      setRowMessages((current) => ({ ...current, [supplier.id]: "La tarifa debe ser mayor que 0." }));
      return;
    }

    setPendingRows((current) => ({ ...current, [supplier.id]: "rate" }));
    setRowMessages((current) => ({ ...current, [supplier.id]: undefined }));

    try {
      const response = await fetch(`/api/suppliers/rate?id=${supplier.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rate_per_unit: parsedRate }),
      });

      const payload = (await response.json()) as Supplier | { detail?: unknown };

      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      const updatedSupplier = payload as Supplier;
      startTransition(() => {
        setSuppliers((current) => current.map((entry) => (entry.id === updatedSupplier.id ? updatedSupplier : entry)));
        setRateDrafts((current) => ({ ...current, [supplier.id]: String(updatedSupplier.rate_per_unit) }));
      });
      setRowMessages((current) => ({ ...current, [supplier.id]: "Tarifa actualizada." }));
    } catch (error) {
      setRowMessages((current) => ({
        ...current,
        [supplier.id]: error instanceof Error ? error.message : "No se pudo actualizar la tarifa.",
      }));
    } finally {
      setPendingRows((current) => ({ ...current, [supplier.id]: undefined }));
    }
  };

  const handleSupplierIdSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedValue = supplierIdQuery.trim();
    if (!normalizedValue) {
      setActiveSupplierIdSearch(null);
      setSearchError(null);
      return;
    }

    const parsedId = Number(normalizedValue);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setSearchError("Ingresa un id entero positivo.");
      return;
    }

    setSearchError(null);
    setActiveSupplierIdSearch(parsedId);
  };

  const clearSupplierIdSearch = () => {
    setSupplierIdQuery("");
    setActiveSupplierIdSearch(null);
    setSearchError(null);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    const confirmation = window.confirm(`¿Eliminar al proveedor ${supplier.name}?`);
    if (!confirmation) {
      return;
    }

    setPendingRows((current) => ({ ...current, [supplier.id]: "delete" }));
    setRowMessages((current) => ({ ...current, [supplier.id]: undefined }));

    try {
      const response = await fetch(`/api/suppliers?id=${supplier.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { detail?: unknown };
        throw new Error(extractErrorMessage(payload));
      }

      if (activeSupplierIdSearch === supplier.id) {
        clearSupplierIdSearch();
        applyLoadedSuppliers(await fetchSuppliersView(filters, null));
      } else {
        startTransition(() => {
          setSuppliers((current) => current.filter((entry) => entry.id !== supplier.id));
          setRateDrafts((current) => {
            const nextDrafts = { ...current };
            delete nextDrafts[supplier.id];
            return nextDrafts;
          });
        });
      }
    } catch (error) {
      setRowMessages((current) => ({
        ...current,
        [supplier.id]: error instanceof Error ? error.message : "No se pudo eliminar el proveedor.",
      }));
    } finally {
      setPendingRows((current) => ({ ...current, [supplier.id]: undefined }));
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="fade-up overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(249,115,22,0.2),rgba(20,20,20,0.92)_35%,rgba(10,10,10,1)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-soft)]">
                Brasaland Digital
              </span>
              <div className="space-y-3">
                <h1 className="font-[var(--font-poppins)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Directorio de proveedores
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  Registra, filtra y ajusta las condiciones de compra para Colombia y USA desde una sola vista operativa.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
                <InfoPill label="API origen" value={apiBaseUrl} />
                <InfoPill label="Monedas" value="COP y USD" />
                <InfoPill label="Estados" value="Activo / Suspendido" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Proveedores" value={String(summary.total)} />
              <MetricCard label="Activos" value={String(summary.active)} />
              <MetricCard label="Suspendidos" value={String(summary.suspended)} />
              <MetricCard label="Países" value={String(summary.countries)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="fade-up rounded-[1.75rem] border border-white/8 bg-[var(--surface)]/92 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-[var(--font-poppins)] text-2xl font-semibold text-white">Registrar proveedor</h2>
                <p className="text-sm leading-6 text-zinc-400">
                  El formulario replica las reglas del backend antes del envío y expone cualquier 422 de la API.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleCreateSupplier} noValidate>
                <FieldShell label="Nombre" error={formErrors.name}>
                  <input
                    value={formState.name}
                    onChange={(event) => handleFormChange("name", event.target.value)}
                    placeholder="Ej: Carnes del Valle S.A.S."
                    className={inputClassName(Boolean(formErrors.name))}
                  />
                </FieldShell>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell label="País" error={formErrors.country}>
                    <select
                      value={formState.country}
                      onChange={(event) => handleFormChange("country", event.target.value as SupplierCountry)}
                      className={inputClassName(Boolean(formErrors.country))}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </FieldShell>

                  <FieldShell label="Moneda" error={formErrors.currency}>
                    <select
                      value={formState.currency}
                      onChange={(event) => handleFormChange("currency", event.target.value as SupplierCurrency)}
                      className={inputClassName(Boolean(formErrors.currency))}
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </div>

                <FieldShell label="Categorías" error={formErrors.categories}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CATEGORY_OPTIONS.map((category) => {
                      const isChecked = formState.categories.includes(category);

                      return (
                        <label
                          key={category}
                          className={[
                            "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                            isChecked
                              ? "border-[var(--brand)]/35 bg-[var(--brand)]/10 text-white"
                              : "border-white/8 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.05]",
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(category)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--brand)] focus:ring-[var(--ring)]"
                          />
                          <span>{CATEGORY_LABELS[category]}</span>
                        </label>
                      );
                    })}
                  </div>
                </FieldShell>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell label="Tarifa por unidad" error={formErrors.rate_per_unit}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formState.rate_per_unit}
                      onChange={(event) => handleFormChange("rate_per_unit", event.target.value)}
                      placeholder="0.00"
                      className={inputClassName(Boolean(formErrors.rate_per_unit))}
                    />
                  </FieldShell>

                  <FieldShell label="Estado" error={formErrors.status}>
                    <select
                      value={formState.status}
                      onChange={(event) => handleFormChange("status", event.target.value as SupplierStatus)}
                      className={inputClassName(Boolean(formErrors.status))}
                    >
                      <option value="active">Activo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </FieldShell>
                </div>

                <FieldShell label="Email de contacto" error={formErrors.contact_email}>
                  <input
                    type="email"
                    value={formState.contact_email}
                    onChange={(event) => handleFormChange("contact_email", event.target.value)}
                    placeholder="proveedor@correo.com"
                    className={inputClassName(Boolean(formErrors.contact_email))}
                  />
                </FieldShell>

                <FieldShell label="Notas" error={formErrors.notes}>
                  <textarea
                    value={formState.notes}
                    onChange={(event) => handleFormChange("notes", event.target.value)}
                    placeholder="Observaciones operativas, cobertura, restricciones..."
                    rows={4}
                    className={inputClassName(Boolean(formErrors.notes))}
                  />
                </FieldShell>

                {formErrors._form ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {formErrors._form}
                  </div>
                ) : null}

                {formMessage ? (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {formMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Registrando..." : "Registrar proveedor"}
                </button>
              </form>
            </div>
          </aside>

          <section className="space-y-6">
            <article className="fade-up rounded-[1.75rem] border border-white/8 bg-[var(--surface)]/92 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <h2 className="font-[var(--font-poppins)] text-2xl font-semibold text-white">Filtros dinámicos</h2>
                  <p className="text-sm leading-6 text-zinc-400">
                    Ajusta país y categoría sin recargar la página. Los cambios se consultan de inmediato contra la API.
                  </p>
                </div>

                <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]" onSubmit={handleSupplierIdSearch}>
                  <FieldShell label="Buscar supplier por id" compact error={searchError ?? undefined}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={supplierIdQuery}
                      onChange={(event) => {
                        setSupplierIdQuery(event.target.value);
                        if (searchError) {
                          setSearchError(null);
                        }
                      }}
                      placeholder="Ej: 7"
                      className={inputClassName(Boolean(searchError))}
                    />
                  </FieldShell>

                  <button
                    type="submit"
                    className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    Buscar
                  </button>

                  <button
                    type="button"
                    onClick={clearSupplierIdSearch}
                    className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    Limpiar
                  </button>
                </form>

                {activeSupplierIdSearch !== null ? (
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                    Mostrando resultado para ID #{activeSupplierIdSearch}. Los filtros por país y categoría se reactivan al limpiar la búsqueda.
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell label="País" compact>
                    <select
                      value={filters.country}
                      onChange={(event) => handleFilterChange("country", event.target.value as FilterState["country"])}
                      className={inputClassName(false)}
                    >
                      <option value="">Todos</option>
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </FieldShell>

                  <FieldShell label="Categoría" compact>
                    <select
                      value={filters.category}
                      onChange={(event) => handleFilterChange("category", event.target.value as FilterState["category"])}
                      className={inputClassName(false)}
                    >
                      <option value="">Todas</option>
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </div>
              </div>
            </article>

            <article className="fade-up rounded-[1.75rem] border border-white/8 bg-[var(--surface)]/92 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-[var(--font-poppins)] text-2xl font-semibold text-white">Tabla de directorio</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {isLoading ? "Consultando proveedores..." : `${sortedSuppliers.length} resultado(s) visibles.`}
                  </p>
                </div>
              </div>

              {loadError ? (
                <div className="border-b border-white/8 bg-rose-500/10 px-5 py-4 text-sm text-rose-200 sm:px-6">
                  {loadError}
                </div>
              ) : null}

              <div className="xl:hidden divide-y divide-white/8">
                {sortedSuppliers.map((supplier) => {
                  const pendingAction = pendingRows[supplier.id];
                  const currentRateDraft = rateDrafts[supplier.id] ?? String(supplier.rate_per_unit);

                  return (
                    <article key={supplier.id} className="space-y-4 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
                            <StatusBadge status={supplier.status} />
                          </div>
                          <p className="text-xs text-zinc-500">ID #{supplier.id}</p>
                          {supplier.contact_email ? <p className="text-sm text-zinc-400">{supplier.contact_email}</p> : null}
                        </div>

                        <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-200">
                          {supplier.country}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoBlock label="Categorías">
                          <div className="flex flex-wrap gap-2">
                            {supplier.categories.map((category) => (
                              <span
                                key={category}
                                className="inline-flex rounded-full border border-[var(--brand)]/18 bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand-soft)]"
                              >
                                {CATEGORY_LABELS[category]}
                              </span>
                            ))}
                          </div>
                        </InfoBlock>

                        <InfoBlock label="Tarifa">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{formatSupplierRate(supplier)}</p>
                            <p className="text-xs text-zinc-500">Actualizado {formatSupplierDate(supplier.updated_at)}</p>
                          </div>
                        </InfoBlock>
                      </div>

                      <SupplierQuickActions
                        supplier={supplier}
                        pendingAction={pendingAction}
                        currentRateDraft={currentRateDraft}
                        rowMessage={rowMessages[supplier.id]}
                        onRateDraftChange={(value) => {
                          setRateDrafts((current) => ({ ...current, [supplier.id]: value }));
                          setRowMessages((current) => ({ ...current, [supplier.id]: undefined }));
                        }}
                        onStatusToggle={() => void handleStatusToggle(supplier)}
                        onRateSave={() => void handleRateSave(supplier)}
                        onDelete={() => void handleDeleteSupplier(supplier)}
                      />

                      {!rowMessages[supplier.id] && supplier.notes ? (
                        <p className="text-xs text-zinc-500">{supplier.notes}</p>
                      ) : null}
                    </article>
                  );
                })}

                {!isLoading && sortedSuppliers.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-zinc-400 sm:px-6">
                    {activeSupplierIdSearch !== null
                      ? "La búsqueda por id no devolvió resultados."
                      : "No hay proveedores que coincidan con los filtros activos."}
                  </div>
                ) : null}
              </div>

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold sm:px-6">Nombre</th>
                      <th className="px-5 py-4 font-semibold">País</th>
                      <th className="px-5 py-4 font-semibold">Categorías</th>
                      <th className="px-5 py-4 font-semibold">Tarifa</th>
                      <th className="px-5 py-4 font-semibold">Estado</th>
                      <th className="px-5 py-4 font-semibold">Última actualización</th>
                      <th className="px-5 py-4 font-semibold sm:px-6">Acciones rápidas</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedSuppliers.map((supplier) => {
                      const pendingAction = pendingRows[supplier.id];
                      const currentRateDraft = rateDrafts[supplier.id] ?? String(supplier.rate_per_unit);

                      return (
                        <tr key={supplier.id} className="border-t border-white/6 align-top transition hover:bg-white/[0.02]">
                          <td className="px-5 py-5 sm:px-6">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-white">{supplier.name}</p>
                              <p className="text-xs text-zinc-500">ID #{supplier.id}</p>
                              {supplier.contact_email ? (
                                <p className="text-xs text-zinc-400">{supplier.contact_email}</p>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-200">
                              {supplier.country}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex max-w-[260px] flex-wrap gap-2">
                              {supplier.categories.map((category) => (
                                <span
                                  key={category}
                                  className="inline-flex rounded-full border border-[var(--brand)]/18 bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand-soft)]"
                                >
                                  {CATEGORY_LABELS[category]}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="space-y-1">
                              <p className="font-semibold text-white">{formatSupplierRate(supplier)}</p>
                              <p className="text-xs text-zinc-500">{supplier.currency}</p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={supplier.status} />
                          </td>

                          <td className="px-5 py-5">
                            <div className="max-w-[180px] space-y-1">
                              <p>{formatSupplierDate(supplier.updated_at)}</p>
                              <p className="text-xs text-zinc-500">UTC desde backend</p>
                            </div>
                          </td>

                          <td className="px-5 py-5 sm:px-6">
                            <SupplierQuickActions
                              supplier={supplier}
                              pendingAction={pendingAction}
                              currentRateDraft={currentRateDraft}
                              rowMessage={rowMessages[supplier.id]}
                              compact
                              onRateDraftChange={(value) => {
                                setRateDrafts((current) => ({ ...current, [supplier.id]: value }));
                                setRowMessages((current) => ({ ...current, [supplier.id]: undefined }));
                              }}
                              onStatusToggle={() => void handleStatusToggle(supplier)}
                              onRateSave={() => void handleRateSave(supplier)}
                              onDelete={() => void handleDeleteSupplier(supplier)}
                            >
                              {!rowMessages[supplier.id] && supplier.notes ? (
                                <p className="line-clamp-2 text-xs text-zinc-500">{supplier.notes}</p>
                              ) : null}
                            </SupplierQuickActions>
                          </td>
                        </tr>
                      );
                    })}

                    {!isLoading && sortedSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-400 sm:px-6">
                          {activeSupplierIdSearch !== null
                            ? "La búsqueda por id no devolvió resultados."
                            : "No hay proveedores que coincidan con los filtros activos."}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}

function validateFormState(formState: SupplierFormState): FormErrors {
  const errors: FormErrors = {};

  if (!formState.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  }

  if (formState.categories.length === 0) {
    errors.categories = "Selecciona al menos una categoría.";
  }

  const parsedRate = Number(formState.rate_per_unit);
  if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
    errors.rate_per_unit = "La tarifa debe ser mayor que 0.";
  }

  if (CURRENCY_BY_COUNTRY[formState.country] !== formState.currency) {
    errors.currency = `Si el país es ${formState.country}, la moneda debe ser ${CURRENCY_BY_COUNTRY[formState.country]}.`;
  }

  if (formState.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.contact_email.trim())) {
    errors.contact_email = "Ingresa un email válido.";
  }

  return errors;
}

async function fetchSuppliersList(filters: FilterState) {
  const searchParams = new URLSearchParams();

  if (filters.country) {
    searchParams.set("country", filters.country);
  }

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  const response = await fetch(`/api/suppliers?${searchParams.toString()}`, { cache: "no-store" });
  const payload = (await response.json()) as Supplier[] | { detail?: unknown };

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload));
  }

  return payload as Supplier[];
}

async function fetchSuppliersView(filters: FilterState, supplierId: number | null) {
  if (supplierId !== null) {
    return [await fetchSupplierById(supplierId)];
  }

  return fetchSuppliersList(filters);
}

async function fetchSupplierById(supplierId: number) {
  const response = await fetch(`/api/suppliers?id=${supplierId}`, { cache: "no-store" });
  const payload = (await response.json()) as Supplier | { detail?: unknown };

  if (!response.ok) {
    const message = extractErrorMessage(payload);
    throw new Error(response.status === 404 ? `404: ${message}` : message);
  }

  return payload as Supplier;
}

function mapApiValidationErrors(payload: { detail?: unknown }): FormErrors {
  const nextErrors: FormErrors = {};

  if (!Array.isArray(payload.detail)) {
    nextErrors._form = extractErrorMessage(payload);
    return nextErrors;
  }

  for (const item of payload.detail as ApiValidationItem[]) {
    const loc = item.loc ?? [];
    const possibleField = loc.at(-1);
    const message = item.msg ?? "Error de validación.";

    if (typeof possibleField === "string" && isFormField(possibleField)) {
      nextErrors[possibleField] = message;
      continue;
    }

    nextErrors._form = nextErrors._form ? `${nextErrors._form} ${message}` : message;
  }

  return nextErrors;
}

function isFormField(value: string): value is FormField {
  return [
    "name",
    "country",
    "categories",
    "rate_per_unit",
    "currency",
    "status",
    "contact_email",
    "notes",
  ].includes(value);
}

function extractErrorMessage(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const detail = "detail" in payload ? payload.detail : undefined;
    const error = "error" in payload ? payload.error : undefined;

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return "La operación no se pudo completar.";
}

function formatSupplierRate(supplier: Supplier) {
  const formatter = currencyFormatterByCurrency[supplier.currency];
  return `${formatter.format(supplier.rate_per_unit)} ${supplier.currency}`;
}

function formatSupplierDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border bg-[var(--surface-strong)] px-4 py-3 text-sm text-white transition placeholder:text-zinc-500",
    hasError
      ? "border-rose-400/45 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/15"
      : "border-white/10 focus:border-[var(--brand)]/40 focus:ring-2 focus:ring-[var(--ring)]",
  ].join(" ");
}

function FieldShell({
  children,
  label,
  error,
  compact = false,
}: {
  children: React.ReactNode;
  label: string;
  error?: string;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-300">
      <span className={compact ? "font-medium text-zinc-100" : "font-medium text-zinc-200"}>{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </span>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/8 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

function SupplierQuickActions({
  supplier,
  pendingAction,
  currentRateDraft,
  rowMessage,
  compact = false,
  children,
  onRateDraftChange,
  onStatusToggle,
  onRateSave,
  onDelete,
}: {
  supplier: Supplier;
  pendingAction?: "status" | "rate" | "delete";
  currentRateDraft: string;
  rowMessage?: string;
  compact?: boolean;
  children?: React.ReactNode;
  onRateDraftChange: (value: string) => void;
  onStatusToggle: () => void;
  onRateSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={["flex flex-col gap-3", compact ? "min-w-[320px]" : ""].join(" ")}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStatusToggle}
          disabled={pendingAction !== undefined}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "status" ? "Actualizando..." : supplier.status === "active" ? "Suspender" : "Reactivar"}
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 p-1.5">
          <input
            type="number"
            step="0.01"
            min="0"
            value={currentRateDraft}
            onChange={(event) => onRateDraftChange(event.target.value)}
            className="h-9 w-28 rounded-lg border border-transparent bg-transparent px-3 text-sm text-white focus:border-[var(--brand)]/30 focus:bg-white/[0.03]"
          />
          <button
            type="button"
            onClick={onRateSave}
            disabled={pendingAction !== undefined}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "rate" ? "Guardando..." : "Guardar"}
          </button>
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={pendingAction !== undefined}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 text-xs font-semibold text-rose-100 transition hover:border-rose-300/35 hover:bg-rose-500/18 focus-visible:ring-2 focus-visible:ring-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "delete" ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      {rowMessage ? <p className="text-xs text-zinc-400">{rowMessage}</p> : children}
    </div>
  );
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        status === "active"
          ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-200"
          : "border-rose-400/20 bg-rose-500/10 text-rose-200",
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}