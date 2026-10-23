import {
  IncidentStatusSelect,
  type IncidentStatusOption,
} from "@/components/IncidentStatusSelect";

interface IncidentRowProps {
  branches: Record<string, string>;
  categoryLabels: Record<string, string>;
  incident: {
    branch: string;
    category: string;
    id: string;
    status: string;
    title: string;
  };
  onStatusChange: (status: string) => void;
  statusOptions: readonly IncidentStatusOption[];
}

export function IncidentRow({
  branches,
  categoryLabels,
  incident,
  onStatusChange,
  statusOptions,
}: IncidentRowProps) {
  return (
    <article className="incident-row">
      <div className="incident-main">
        <span className={`status-dot ${incident.status}`} />
        <div>
          <h3>{incident.title}</h3>
          <p className="incident-id">ID: {incident.id}</p>
          <p>
            {categoryLabels[incident.category]} ·{" "}
            {branches[incident.branch] ?? incident.branch}
          </p>
        </div>
      </div>
      <IncidentStatusSelect
        className={`status-select ${incident.status}`}
        incidentId={incident.id}
        incidentTitle={incident.title}
        onChange={onStatusChange}
        options={statusOptions}
        value={incident.status}
      />
    </article>
  );
}