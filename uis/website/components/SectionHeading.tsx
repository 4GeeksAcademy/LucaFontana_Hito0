interface SectionHeadingProps {
  align?: "center" | "left";
  description?: string;
  eyebrow: string;
  id: string;
  title: string;
}

export function SectionHeading({
  align = "center",
  description,
  eyebrow,
  id,
  title,
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const descriptionClass = align === "center" ? "mx-auto" : "";

  return (
    <div className={alignmentClass}>
      <span className="text-brand text-sm font-semibold uppercase tracking-widest">{eyebrow}</span>
      <h2 id={id} className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl text-lg text-gray-400 ${descriptionClass}`.trim()}>
          {description}
        </p>
      ) : null}
    </div>
  );
}