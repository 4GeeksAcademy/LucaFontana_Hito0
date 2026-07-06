import {
  STAGE_LABELS,
  STATUS_LABELS,
  type CandidateStage,
  type CandidateStatus,
} from "@/types";

export function CandidateBadge({
  kind,
  value,
}: {
  kind: "status" | "stage";
  value: CandidateStatus | CandidateStage;
}) {
  const label = kind === "status" ? STATUS_LABELS[value as CandidateStatus] : STAGE_LABELS[value as CandidateStage];
  const palette = getPalette(kind, value);

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${palette}`}>
      {label}
    </span>
  );
}

function getPalette(kind: "status" | "stage", value: CandidateStatus | CandidateStage) {
  if (kind === "status") {
    switch (value) {
      case "received":
        return "border-sky-400/20 bg-sky-400/10 text-sky-100";
      case "in_progress":
        return "border-[var(--color-brand)]/20 bg-[var(--color-brand)]/12 text-[var(--color-brand-light)]";
      case "selected":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
      case "discarded":
        return "border-red-400/20 bg-red-400/10 text-red-100";
      default:
        return "border-white/10 bg-white/5 text-zinc-200";
    }
  }

  switch (value) {
    case "pending":
      return "border-white/10 bg-white/5 text-zinc-200";
    case "review":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "personal_interview":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    case "technical_interview":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "offer_presented":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    default:
      return "border-white/10 bg-white/5 text-zinc-200";
  }
}