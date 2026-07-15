import { Card } from "./ui/Card";
import { Table } from "./ui/Table";
import { InfoBanner } from "./ui/InfoBanner";
import { mockRetailers } from "../data/mockRetailers";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * BulkReviewStep — rows are reviewed as the requests/tasks they will
 * become, not as products. Copy deliberately says "requests"/"tasks",
 * never "products imported" (stakeholder correction).
 */
export function BulkReviewStep({ rows }) {
  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");
  const issueRows = rows.filter((r) => r.status === "issue");
  const types = Array.from(new Set(rows.map((r) => r.requestType).filter(Boolean)));

  return (
    <Card title="Review">
      <div className="flex flex-col gap-4">
        <InfoBanner variant={issueRows.length > 0 ? "warning" : "success"}>
          <div>{rows.length} rows uploaded · {readyRows.length} requests will be created</div>
          {issueRows.length > 0 && (
            <div className="mt-1">
              {readyRows.length} ready · {issueRows.length} need attention
              <br />
              Ready rows will be created. Rows with issues will be skipped.
            </div>
          )}
        </InfoBanner>

        {types.length > 1 && (
          <p className="text-xs text-base-content/50">
            This upload mixes request types: {types.map((t) => REQUEST_TYPE_LABELS[t] ?? t).join(", ")}.
          </p>
        )}

        {/* Partial-success behavior is kept as-is for this pass — flagged
            here rather than silently assumed, since it hasn't been
            confirmed with product yet. */}
        <p className="text-xs text-base-content/50 italic">
          Assumption: ready rows will be created and rows with issues will be skipped. Validate
          partial import behavior with Gowri.
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-base-content/50 text-center py-8">No rows to review.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Request Type</th>
                <th>Title</th>
                <th>Retailer</th>
                <th>Date</th>
                <th>Content Type</th>
                <th>Notes / Issues</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const displayTitle = row.title || row.productTitle || "Untitled request";
                return (
                  <tr key={row.id} className={row.status === "issue" ? "bg-error/5" : ""}>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          row.status === "issue" ? "badge-error" : "badge-success"
                        }`}
                      >
                        {row.status === "issue" ? "Issue" : "Ready"}
                      </span>
                    </td>
                    <td className="text-base-content/70">
                      {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
                    </td>
                    <td className="text-base-content">{displayTitle}</td>
                    <td className="text-base-content/70">
                      {row.retailer ? retailerLabel(row.retailer) : "—"}
                    </td>
                    <td className="text-base-content/70">
                      {fmtDate(row.requestType === "brandRequest" ? row.dueDate : row.launchDate)}
                    </td>
                    <td className="text-base-content/70">{row.contentType ?? "—"}</td>
                    <td className="text-base-content/70">
                      {row.issueReason ?? (row.status === "issue" ? "Needs attention" : "—")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  );
}
