import type { AsyncState } from "@/types";

export function AsyncNotice({ state }: { state: AsyncState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const tone =
    state.status === "error"
      ? "border-red-400/20 bg-red-400/10 text-red-100"
      : state.status === "success"
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
        : "border-[var(--color-brand)]/20 bg-[var(--color-brand)]/10 text-zinc-100";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${tone}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}