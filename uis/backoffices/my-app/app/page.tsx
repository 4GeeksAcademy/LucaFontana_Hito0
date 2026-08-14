import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#fb923c]">
            Operación interna Brasaland
          </p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-poppins)] text-5xl font-black leading-[1.05] text-white sm:text-6xl xl:text-7xl">
            Controla incidencias con reglas consistentes de validación y análisis.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Este backoffice toma el CSV operativo, ejecuta el análisis en memoria y expone el resultado para revisión visual y exportación sin depender de base de datos.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/incidents"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f97316] px-8 py-4 text-lg font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition hover:bg-[#ea580c]"
            >
              Abrir análisis de incidencias
            </Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 px-8 py-4 text-lg font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
            >
              Ver documentación de la API
            </a>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            ["Validación exacta", "Categorías, estados y reglas de invalidez alineadas con el análisis operativo."],
            ["Análisis en memoria", "Cada request procesa el CSV sin ORM ni persistencia relacional."],
            ["Exportación directa", "El último resumen se descarga como CSV con métricas y porcentajes."],
            ["Lectura operativa", "Métricas generales, categorías, estados y satisfacción en una sola vista."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(249,115,22,0.1),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#fb923c]">Módulo</p>
              <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2.2rem] border border-white/8 bg-[#121212]/85 p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#fb923c]">
              Flujo sugerido
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-bold text-white">
              Desde archivo crudo hasta lectura accionable.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "Cargar CSV", "Sube el extracto operativo con el formato validado."],
              ["2", "Revisar inválidos", "Detecta cuántas filas se descartan y por qué regla exacta."],
              ["3", "Exportar resumen", "Descarga el último análisis con estructura metric,value,percentage."],
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316]/12 font-[family-name:var(--font-poppins)] text-lg font-black text-[#fb923c]">
                  {step}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-poppins)] text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
