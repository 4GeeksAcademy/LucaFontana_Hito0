import type { ReactNode } from "react";

type AnalysisMetricCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  compact?: boolean;
};

export function AnalysisMetricCard({
  label,
  value,
  description,
  compact = false,
}: AnalysisMetricCardProps) {
  if (compact) {
    return (
      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</p>
        <p className="mt-3 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
          {value}
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <p className="text-sm uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-black text-white">
        {value}
      </p>
      {description ? <p className="mt-3 text-sm leading-6 text-white/60">{description}</p> : null}
    </article>
  );
}
