import { Suspense } from "react";
import { CandidatesDashboard } from "@/components/CandidatesDashboard";

export default function Home() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <CandidatesDashboard />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <main className="flex-1 bg-[var(--color-dark)] text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[2rem] border border-white/8 bg-[var(--color-dark-card)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-72 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-white/8 bg-[var(--color-dark-card)] p-8 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          <div className="h-80 animate-pulse rounded-[1.5rem] bg-white/5" />
        </section>
      </div>
    </main>
  );
}
