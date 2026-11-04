interface BrasaPointsCTAProps {
  ariaLabel: string;
  variant: "hero" | "section";
}

export function BrasaPointsCTA({ ariaLabel, variant }: BrasaPointsCTAProps) {
  const className =
    variant === "hero"
      ? "inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-950"
      : "inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-dark";

  return (
    <a href="/brasa-points" className={className} aria-label={ariaLabel}>
      {variant === "hero" ? (
        <>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.789l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          Únete a Brasa Points
        </>
      ) : (
        <>
          Regístrate ahora
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
    </a>
  );
}