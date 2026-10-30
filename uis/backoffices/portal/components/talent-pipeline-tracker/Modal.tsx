"use client";

import { useEffect, useId } from "react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-3xl rounded-[2rem] border border-white/8 bg-[var(--color-dark-card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 id={titleId} className="text-2xl font-semibold text-white">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition hover:border-[var(--color-brand)]/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}