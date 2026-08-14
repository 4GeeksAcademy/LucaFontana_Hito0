import { IncidentAnalyzer } from "@/components/IncidentAnalyzer";

export default function IncidentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
      <section className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#fb923c]">
          Incidencias operativas
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-poppins)] text-5xl font-black leading-tight text-white sm:text-6xl">
          Analiza el CSV y obtén el resumen operativo en tiempo real.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
          La vista usa el backend FastAPI ubicado en `services/api`, con lógica compartida de validación y consolidación para mantener resultados consistentes entre interfaces.
        </p>
      </section>

      <IncidentAnalyzer />
    </div>
  );
}