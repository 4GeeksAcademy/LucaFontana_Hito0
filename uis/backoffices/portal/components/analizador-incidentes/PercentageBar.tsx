type PercentageBarProps = {
  percentage: number;
  className?: string;
  fillClassName?: string;
};

export function PercentageBar({
  percentage,
  className = "",
  fillClassName = "bg-[linear-gradient(90deg,#f97316,#fb923c)]",
}: PercentageBarProps) {
  const width = `${Math.min(Math.max(percentage, 0), 100)}%`;

  return (
    <div className={`h-3 overflow-hidden rounded-full bg-white/8 ${className}`}>
      <div className={`h-full rounded-full ${fillClassName}`} style={{ width }} />
    </div>
  );
}
