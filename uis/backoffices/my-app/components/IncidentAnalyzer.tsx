"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

import type { IncidentAnalysisResponse } from "@/types/incidents";

const analyzeEndpoint = "/api/incidents/analyze";
const exportEndpoint = "/api/incidents/results/export";

const generalMetrics = [
  {
    key: "total_records",
    label: "Registros totales",
    description: "Filas leídas del CSV recibido.",
  },
  {
    key: "valid_records",
    label: "Registros válidos",
    description: "Filas que entran en el análisis final.",
  },
  {
    key: "invalid_records",
    label: "Registros inválidos",
    description: "Filas descartadas por reglas de validación.",
  },
  {
    key: "closed_cases",
    label: "Casos cerrados",
    description: "Incidencias con estado CLOSED.",
  },
] as const;

function readErrorMessage(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = payload.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallbackMessage;
}

function clampWidth(percentage: number) {
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

export function IncidentAnalyzer() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState<IncidentAnalysisResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function updateSelectedFile(file: File | null) {
    setSelectedFile(file);
    setSubmitError(null);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    updateSelectedFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);

    const nextFile = event.dataTransfer.files?.[0] ?? null;
    updateSelectedFile(nextFile);
  }

  async function handleAnalyze() {
    if (!selectedFile) {
      setSubmitError("Selecciona un archivo CSV antes de ejecutar el análisis.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setDownloadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(analyzeEndpoint, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          readErrorMessage(payload, "No se pudo analizar el archivo de incidencias."),
        );
      }

      setAnalysis(payload as IncidentAnalysisResponse);
    } catch (error) {
      setAnalysis(null);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al analizar el CSV.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(exportEndpoint);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          readErrorMessage(payload, "No se pudo descargar el resultado exportado."),
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "incident-analysis-results.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al descargar el CSV.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#121212]/90 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.25),transparent_45%),linear-gradient(135deg,#161616,#101010)] px-6 py-8 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#fb923c]">
              Carga de archivo
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold text-white">
              Ejecutar análisis de incidencias
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Sube el CSV operativo para recalcular métricas, detectar registros inválidos y habilitar la exportación del último resultado procesado.
            </p>
          </div>

          <div className="space-y-6 px-6 py-8 sm:px-8">
            <label
              htmlFor="incident-upload"
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center transition ${
                dragActive
                  ? "border-[#fb923c] bg-[#f97316]/10"
                  : "border-white/12 bg-white/[0.03] hover:border-[#f97316]/60 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f97316]/12 text-[#fb923c]">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16.5v1.25A2.25 2.25 0 0 0 6.25 20h11.5A2.25 2.25 0 0 0 20 17.75V16.5" />
                </svg>
              </div>

              <p className="mt-6 text-xl font-semibold text-white">
                Arrastra el CSV aquí o selecciónalo desde tu equipo
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                El archivo debe usar exactamente las columnas esperadas por el analizador y separadores por coma.
              </p>

              <div className="mt-6 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
                {selectedFile ? `Archivo listo: ${selectedFile.name}` : "Aún no hay archivo seleccionado"}
              </div>

              <input
                ref={inputRef}
                id="incident-upload"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleInputChange}
              />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-base font-bold text-white shadow-[0_16px_35px_rgba(249,115,22,0.32)] transition hover:bg-[#ea580c] disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Analizando archivo..." : "Analizar incidencias"}
              </button>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
              >
                Elegir archivo
              </button>
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {submitError}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5 rounded-[2rem] border border-white/8 bg-[#121212]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#fb923c]">
              Resultado exportable
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
              Último análisis en memoria
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/65">
              El backend conserva únicamente el último resumen procesado en la instancia actual para descargarlo como CSV.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-[#f97316]/30 bg-[#f97316]/10 px-5 py-4 text-base font-semibold text-[#ffd4ba] transition hover:bg-[#f97316]/15 disabled:cursor-wait disabled:opacity-70"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17.5v1.25A2.25 2.25 0 0 0 6.25 21h11.5A2.25 2.25 0 0 0 20 18.75V17.5" />
            </svg>
            {isDownloading ? "Preparando descarga..." : "Descargar último CSV exportado"}
          </button>

          {downloadError ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {downloadError}
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Base URL configurada</p>
            <p className="mt-2 break-all text-sm text-white/55">Rutas relativas del mismo dominio del frontend</p>
          </div>
        </aside>
      </section>

      {analysis ? (
        <section className="space-y-8">
          <div className="flex flex-col gap-3 rounded-[2rem] border border-white/8 bg-[#121212]/85 px-6 py-6 sm:px-8">
            <p className="text-sm uppercase tracking-[0.28em] text-[#fb923c]">Resumen cargado</p>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-bold text-white">
                  {analysis.source_file}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  El análisis refleja exactamente la misma lógica compartida entre el script operativo y el backend FastAPI.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
                Satisfacción promedio: {analysis.satisfaction_index.average_score.toFixed(2)} / 5.00
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {generalMetrics.map((metric) => {
              const metricValue =
                metric.key === "closed_cases"
                  ? analysis.satisfaction_index.closed_cases
                  : analysis[metric.key];

              return (
                <article
                  key={metric.key}
                  className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">{metric.label}</p>
                  <p className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
                    {metricValue}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">{metric.description}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[2rem] border border-white/8 bg-[#121212]/85 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-[#fb923c]">Registros inválidos</p>
              <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
                {analysis.invalid_records} filas descartadas
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                El detalle se agrupa por regla exacta de invalidación, no solo por el total acumulado.
              </p>

              <div className="mt-6 space-y-3">
                {analysis.invalid_breakdown.length > 0 ? (
                  analysis.invalid_breakdown.map((item) => (
                    <div
                      key={item.rule}
                      className="flex items-center justify-between rounded-[1.25rem] border border-red-500/15 bg-red-500/7 px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/40">
                          {item.rule}
                        </p>
                      </div>
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-lg font-bold text-red-100">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                    No se detectaron registros inválidos en este archivo.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/8 bg-[#121212]/85 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-[#fb923c]">Índice de satisfacción</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Promedio</p>
                  <p className="mt-3 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
                    {analysis.satisfaction_index.average_score.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Casos cerrados</p>
                  <p className="mt-3 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
                    {analysis.satisfaction_index.closed_cases}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Casos puntuados</p>
                  <p className="mt-3 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
                    {analysis.satisfaction_index.scored_closed_cases}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {analysis.satisfaction_index.breakdown.map((item) => (
                  <div key={item.score} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm text-white/70">
                      <span>
                        Score {item.score} · {item.label}
                      </span>
                      <span>
                        {item.count} casos · {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#fb923c)]"
                        style={{ width: clampWidth(item.percentage) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-white/8 bg-[#121212]/85 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#fb923c]">Desglose por categoría</p>
                  <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
                    Categorías válidas
                  </h3>
                </div>
                <span className="text-sm text-white/45">Base: registros válidos</span>
              </div>

              <div className="mt-6 space-y-4">
                {analysis.category_breakdown.map((item) => (
                  <div key={item.category} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.category}</p>
                      <p className="text-sm text-white/65">
                        {item.count} · {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#ffd6bf)]"
                        style={{ width: clampWidth(item.percentage) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/8 bg-[#121212]/85 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#fb923c]">Desglose por estado</p>
                  <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
                    Estados válidos
                  </h3>
                </div>
                <span className="text-sm text-white/45">Base: registros válidos</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {analysis.status_breakdown.map((item) => (
                  <article
                    key={item.status}
                    className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(249,115,22,0.08),rgba(255,255,255,0.03))] p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">{item.status}</p>
                    <p className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
                      {item.count}
                    </p>
                    <p className="mt-2 text-sm text-white/60">{item.percentage.toFixed(1)}% del total válido</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </div>
  );
}