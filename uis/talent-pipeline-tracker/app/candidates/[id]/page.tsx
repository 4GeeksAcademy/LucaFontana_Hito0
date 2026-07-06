"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AsyncNotice } from "@/components/AsyncNotice";
import { CandidateBadge } from "@/components/Badge";
import { CandidateForm } from "@/components/CandidateForm";
import { useCandidates } from "@/context/CandidateContext";
import {
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  type CandidateFormValues,
  type CandidateStage,
  type CandidateStatus,
} from "@/types";

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const candidateId = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    getCandidateDetail,
    getDetailState,
    getUpdateState,
    getStatusPatchState,
    getStagePatchState,
    getNoteCreateState,
    getNoteDeleteState,
    fetchCandidate,
    updateCandidate,
    patchCandidateStatus,
    patchCandidateStage,
    addNote,
    deleteNote,
  } = useCandidates();
  const [noteContent, setNoteContent] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const detailState = getDetailState(candidateId);

  useEffect(() => {
    if (candidateId && detailState.status === "idle") {
      void fetchCandidate(candidateId);
    }
  }, [candidateId, detailState.status, fetchCandidate]);

  const candidate = getCandidateDetail(candidateId);
  const updateState = getUpdateState(candidateId);
  const statusState = getStatusPatchState(candidateId);
  const stageState = getStagePatchState(candidateId);
  const noteCreateState = getNoteCreateState(candidateId);

  const experienceText = useMemo(() => {
    if (!candidate) {
      return "";
    }
    return `${candidate.experience_years} año${candidate.experience_years === 1 ? "" : "s"}`;
  }, [candidate]);

  const handleUpdate = (values: CandidateFormValues) => updateCandidate(candidateId, values);

  const handleAddNote = async () => {
    const trimmed = noteContent.trim();
    if (!trimmed) {
      setNoteError("La nota no puede estar vacía.");
      return;
    }

    setNoteError(null);
    const result = await addNote(candidateId, trimmed);
    if (result.success) {
      setNoteContent("");
    }
  };

  return (
    <main className="flex-1 bg-[var(--color-dark)] text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(249,115,22,0.14),rgba(20,20,20,0.92)_34%,rgba(10,10,10,1)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-[var(--color-brand)]/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            >
              Volver al listado
            </Link>
            {candidate ? <CandidateBadge kind="status" value={candidate.status} /> : null}
            {candidate ? <CandidateBadge kind="stage" value={candidate.stage} /> : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-light)]">
              Ficha de candidatura
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {candidate?.full_name ?? "Cargando candidatura..."}
            </h1>
            {candidate ? (
              <p className="max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                {candidate.position} · {experienceText} de experiencia · Actualizado el{" "}
                {new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(candidate.updated_at))}
              </p>
            ) : null}
          </div>
        </header>

        <AsyncNotice state={detailState} />

        {candidate ? (
          <>
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
              <article className="rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoCard label="Email" value={candidate.email} href={`mailto:${candidate.email}`} />
                    <InfoCard label="Teléfono" value={candidate.phone} href={`tel:${candidate.phone}`} />
                    <InfoCard label="LinkedIn" value={candidate.linkedin_url || "No disponible"} href={candidate.linkedin_url ?? undefined} />
                    <InfoCard label="CV" value={candidate.cv_url || "No disponible"} href={candidate.cv_url ?? undefined} />
                    <InfoCard label="Aplicó el" value={new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(candidate.applied_at))} />
                    <InfoCard label="Notas" value={String(candidate.notes_count)} />
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border border-white/8 bg-[var(--color-dark-surface)] p-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Cambios rápidos</h2>
                      <p className="text-sm text-zinc-400">Actualiza estado o etapa con un solo click.</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Estado</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <QuickActionButton
                            key={option.value}
                            active={candidate.status === option.value}
                            busy={statusState.status === "loading"}
                            onClick={() => patchCandidateStatus(candidate.id, option.value as CandidateStatus)}
                          >
                            {option.label}
                          </QuickActionButton>
                        ))}
                      </div>
                      <AsyncNotice state={statusState} />
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Etapa</p>
                      <div className="flex flex-wrap gap-2">
                        {STAGE_OPTIONS.map((option) => (
                          <QuickActionButton
                            key={option.value}
                            active={candidate.stage === option.value}
                            busy={stageState.status === "loading"}
                            onClick={() => patchCandidateStage(candidate.id, option.value as CandidateStage)}
                          >
                            {option.label}
                          </QuickActionButton>
                        ))}
                      </div>
                      <AsyncNotice state={stageState} />
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Editar perfil</h2>
                    <p className="text-sm text-zinc-400">Modifica la información principal sin salir del detalle.</p>
                  </div>
                  <CandidateForm
                    key={`${candidate.id}-${candidate.updated_at}`}
                    idPrefix="candidate-edit"
                    initialValues={{
                      full_name: candidate.full_name,
                      email: candidate.email,
                      phone: candidate.phone,
                      position: candidate.position,
                      linkedin_url: candidate.linkedin_url ?? "",
                      cv_url: candidate.cv_url ?? "",
                      experience_years: candidate.experience_years,
                    }}
                    submitLabel="Guardar cambios"
                    state={updateState}
                    onSubmit={handleUpdate}
                  />
                </div>
              </article>
            </section>

            <section className="rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Agregar nota</h2>
                    <p className="text-sm text-zinc-400">Documenta feedback, decisiones o siguientes pasos.</p>
                  </div>
                  <label className="flex flex-col gap-2 text-sm text-zinc-300">
                    <span className="font-medium text-zinc-100">Contenido</span>
                    <textarea
                      value={noteContent}
                      onChange={(event) => setNoteContent(event.target.value)}
                      rows={6}
                      className="rounded-2xl border border-white/10 bg-[var(--color-dark-surface)] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/30"
                      placeholder="Escribe una observación clara y accionable..."
                      aria-describedby={noteError ? "candidate-note-error" : undefined}
                    />
                  </label>
                  {noteError ? (
                    <p id="candidate-note-error" className="text-sm text-red-300">
                      {noteError}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={noteCreateState.status === "loading"}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Añadir nota
                    </button>
                  </div>
                  <AsyncNotice state={noteCreateState} />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Historial de notas</h2>
                    <p className="text-sm text-zinc-400">{candidate.notes.length} entradas registradas.</p>
                  </div>

                  <div className="space-y-3">
                    {candidate.notes.map((note) => {
                      const deleteState = getNoteDeleteState(candidate.id, note.id);

                      return (
                        <article
                          key={note.id}
                          className="rounded-2xl border border-white/8 bg-[var(--color-dark-surface)] p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                              <p className="text-sm leading-7 text-zinc-200">{note.content}</p>
                              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                {new Intl.DateTimeFormat("es-ES", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(note.created_at))}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="Eliminar nota"
                              onClick={() => deleteNote(candidate.id, note.id)}
                              disabled={deleteState.status === "loading"}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-red-400/20 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-200 transition hover:border-red-400/40 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Eliminar
                            </button>
                          </div>
                          <AsyncNotice state={deleteState} />
                        </article>
                      );
                    })}

                    {candidate.notes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-zinc-400">
                        Aún no hay notas para esta candidatura.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function InfoCard({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-[var(--color-dark-surface)] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      {href && value !== "No disponible" ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="mt-3 block text-sm font-medium leading-6 text-[var(--color-brand-light)] underline-offset-4 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-200">{value}</p>
      )}
    </article>
  );
}

function QuickActionButton({
  active,
  busy,
  onClick,
  children,
}: {
  active: boolean;
  busy: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || active}
      className={[
        "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/16 text-[var(--color-brand-light)]"
          : "border-white/10 bg-transparent text-zinc-300 hover:border-[var(--color-brand)]/40 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}