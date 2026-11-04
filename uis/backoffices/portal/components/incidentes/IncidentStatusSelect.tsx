export interface IncidentStatusOption {
  label: string;
  value: string;
}

interface IncidentStatusSelectProps {
  className: string;
  incidentId: string;
  incidentTitle: string;
  onChange: (value: string) => void;
  options: readonly IncidentStatusOption[];
  value: string;
}

export function IncidentStatusSelect({
  className,
  incidentId,
  incidentTitle,
  onChange,
  options,
  value,
}: IncidentStatusSelectProps) {
  return (
    <select
      aria-label={`Cambiar estado de ${incidentTitle} (ID: ${incidentId})`}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}