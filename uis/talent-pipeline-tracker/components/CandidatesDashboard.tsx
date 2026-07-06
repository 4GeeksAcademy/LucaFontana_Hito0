"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { AsyncNotice } from "@/components/AsyncNotice";
import { CandidateBadge } from "@/components/Badge";
import { CandidateForm } from "@/components/CandidateForm";
import { Modal } from "@/components/Modal";
import { useCandidates } from "@/context/CandidateContext";
import {
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  type CandidateFormValues,
  type CandidateStage,
  type CandidateStatus,
} from "@/types";

export function CandidatesDashboard() {
  const {
    candidates,
    listState,
    createState,
    fetchCandidates,
    createCandidate,
  } = useCandidates();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as CandidateStatus | null;
  const stageFilter = searchParams.get("stage") as CandidateStage | null;

  useEffect(() => {
    if (listState.status === "idle") {
      void fetchCandidates();
    }
  }, [fetchCandidates, listState.status]);

  const updateFilterParam = (key: "status" | "stage", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const visibleCandidates = candidates.filter((candidate) => {
    const matchesStatus = !statusFilter || candidate.status === statusFilter;
    const matchesStage = !stageFilter || candidate.stage === stageFilter;
    const needle = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      needle.length === 0 ||
      candidate.full_name.toLowerCase().includes(needle) ||
      candidate.email.toLowerCase().includes(needle);

    return matchesStatus && matchesStage && matchesSearch;
  });

  const handleCreate = async (values: CandidateFormValues) => {
    const result = await createCandidate(values);
    if (result.success) {
      setIsCreateOpen(false);
    }
    return result;
  };

  return (
    <main className="flex-1 bg-[var(--color-dark)] text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(20,20,20,0.94)_35%,rgba(10,10,10,1)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-light)]">
                People & Talent
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Talent Pipeline Tracker
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  Visualiza, filtra y actualiza el pipeline de candidaturas sin salir del flujo operativo del equipo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Candidaturas" value={String(candidates.length)} />
              <MetricCard
                label="En proceso"
                value={String(candidates.filter((candidate) => candidate.status === "in_progress").length)}
              />
              <MetricCard
                label="Ofertas"
                value={String(candidates.filter((candidate) => candidate.stage === "offer_presented").length)}
              />
              <MetricCard
                label="Notas"
                value={String(candidates.reduce((total, candidate) => total + candidate.notes_count, 0))}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)]/90 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span className="font-medium text-zinc-100">Buscar</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre o email"
                className="h-11 rounded-2xl border border-white/10 bg-[var(--color-dark-surface)] px-4 text-sm text-white outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/30"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span className="font-medium text-zinc-100">Filtrar por estado</span>
              <select
                value={statusFilter ?? ""}
                onChange={(event) => updateFilterParam("status", event.target.value)}
                className="h-11 rounded-2xl border border-white/10 bg-[var(--color-dark-surface)] px-4 text-sm text-white outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/30"
              >
                <option value="">Todos los estados</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span className="font-medium text-zinc-100">Filtrar por etapa</span>
              <select
                value={stageFilter ?? ""}
                onChange={(event) => updateFilterParam("stage", event.target.value)}
                className="h-11 rounded-2xl border border-white/10 bg-[var(--color-dark-surface)] px-4 text-sm text-white outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/30"
              >
                <option value="">Todas las etapas</option>
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
            >
              Nueva candidatura
            </button>
          </div>
        </section>

        <AsyncNotice state={listState} />
        <AsyncNotice state={createState} />

        <section className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)]/92 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Listado de candidaturas</h2>
              <p className="text-sm text-zinc-400">{visibleCandidates.length} resultados visibles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/6">
              <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Candidato</th>
                  <th scope="col" className="px-5 py-4 font-medium">Posición</th>
                  <th scope="col" className="px-5 py-4 font-medium">Estado</th>
                  <th scope="col" className="px-5 py-4 font-medium">Etapa</th>
                  <th scope="col" className="px-5 py-4 font-medium">Notas</th>
                  <th scope="col" className="px-5 py-4 font-medium text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-sm text-zinc-200">
                {visibleCandidates.map((candidate) => (
                  <tr key={candidate.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{candidate.full_name}</p>
                        <p className="text-xs text-zinc-400">{candidate.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-zinc-300">{candidate.position}</td>
                    <td className="px-5 py-4 align-top">
                      <CandidateBadge kind="status" value={candidate.status} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <CandidateBadge kind="stage" value={candidate.stage} />
                    </td>
                    <td className="px-5 py-4 align-top text-zinc-300">{candidate.notes_count}</td>
                    <td className="px-5 py-4 align-top text-right">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="inline-flex items-center rounded-full border border-[var(--color-brand)]/30 px-4 py-2 text-xs font-semibold text-[var(--color-brand-light)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
                {visibleCandidates.length === 0 && listState.status !== "loading" ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-zinc-400">
                      No hay candidaturas que coincidan con los filtros actuales.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal
        open={isCreateOpen}
        title="Nueva candidatura"
        description="Registra un nuevo perfil en el pipeline."
        onClose={() => setIsCreateOpen(false)}
      >
        <CandidateForm
          idPrefix="candidate-create"
          submitLabel="Crear candidatura"
          state={createState}
          resetOnSuccess
          onSubmit={handleCreate}
        />
      </Modal>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}