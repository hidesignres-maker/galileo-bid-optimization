import { REQUEST_STATUS, isDueThisPeriod } from "../lib/models";

/**
 * QueueMetricCards — Jira/Monday-style workload cards. Counts are derived
 * from the live `requests` array (including placeholder rows created by
 * Bulk CSV), not a separate stat store — so creating requests immediately
 * updates these.
 */
export function QueueMetricCards({ requests }) {
  const inProgress = requests.filter((r) => r.status === REQUEST_STATUS.IN_PROGRESS).length;
  const dueThisPeriod = requests.filter((r) => isDueThisPeriod(r.dueDate)).length;
  const completed = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED).length;
  const needsAction = requests.filter((r) => r.status === REQUEST_STATUS.NEEDS_ACTION).length;

  const cards = [
    { label: "In Progress", value: inProgress, tone: "text-info" },
    { label: "Due This Period", value: dueThisPeriod, tone: "text-warning" },
    { label: "Completed", value: completed, tone: "text-success" },
    { label: "Needs Action", value: needsAction, tone: "text-error" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <div className={`text-2xl font-bold ${c.tone}`}>{c.value}</div>
          <div className="text-xs text-base-content/60 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
