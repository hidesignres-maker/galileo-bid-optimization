import { PlusIcon } from "@heroicons/react/24/solid";
import { QueueMetricCards } from "../components/QueueMetricCards";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

const STATUS_BADGE = {
  needs_action: "badge-error",
  in_progress: "badge-info",
  completed: "badge-success",
  draft: "badge-neutral",
};

const STATUS_LABEL = {
  needs_action: "Needs Action",
  in_progress: "In Progress",
  completed: "Completed",
  draft: "Draft",
};

/**
 * ContentRequestQueue — Jira/Monday-style board. Shows both manually
 * created requests and bulk-created placeholder requests side by side, so
 * managers can see workload regardless of how a request originated.
 */
export function ContentRequestQueue({ requests, onNewRequest }) {
  return (
    <div className="flex flex-col gap-6">
      <QueueMetricCards requests={requests} />

      <Card
        title="Requests"
        actions={
          <Button icon={PlusIcon} iconPosition="leading" size="sm" onClick={onNewRequest}>
            New Request
          </Button>
        }
      >
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Due / Launch</th>
              <th>Retailers</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="text-base-content">
                  {req.title || <span className="italic text-base-content/40">Untitled</span>}
                </td>
                <td className="text-base-content/70">
                  {REQUEST_TYPE_LABELS[req.requestType] ?? req.requestType}
                </td>
                <td>
                  <span className={`badge badge-sm ${STATUS_BADGE[req.status] ?? "badge-neutral"}`}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </td>
                <td className="text-base-content/70">
                  {req.assignee || <span className="text-base-content/40">Unassigned</span>}
                </td>
                <td className="text-base-content/70">{fmtDate(req.dueDate)}</td>
                <td className="text-base-content/70">
                  {(req.retailers ?? []).map(retailerLabel).join(", ") || "—"}
                </td>
                <td>
                  {req.isPlaceholder ? (
                    <span className="badge badge-sm badge-ghost" title={req.sourceBatchId ?? ""}>
                      Bulk placeholder
                    </span>
                  ) : (
                    <span className="badge badge-sm badge-ghost">Manual</span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-sm text-base-content/50 py-8">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
