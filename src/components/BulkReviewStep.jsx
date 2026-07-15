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
  const willCreateCount = rows.filter((r) => r.willCreateRequest && r.status !== "issue").length;
  const issueCount = rows.filter((r) => r.status === "issue").length;
  const types = Array.from(new Set(rows.map((r) => r.requestType).filter(Boolean)));

  return (
    <Card title="Review">
      <div className="flex flex-col gap-4">
        <InfoBanner variant={issueCount > 0 ? "warning" : "success"}>
          {rows.length} rows uploaded · {willCreateCount} requests will be created
          {issueCount > 0 ? ` · ${issueCount} rows have issues (shown below)` : ""}.
          Review requests before confirming.
        </InfoBanner>

        {types.length > 1 && (
          <p className="text-xs text-base-content/50">
            This upload mixes request types: {types.map((t) => REQUEST_TYPE_LABELS[t] ?? t).join(", ")}.
          </p>
        )}

        {rows.length === 0 ? (
          <p className="text-sm text-base-content/50 text-center py-8">No rows to review.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Request Type</th>
                <th>Date</th>
                <th>Content Type</th>
                <th>Retailer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={row.status === "issue" ? "bg-error/5" : ""}>
                  <td className="text-base-content">{row.title}</td>
                  <td className="text-base-content/70">
                    {REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}
                  </td>
                  <td className="text-base-content/70">
                    {fmtDate(row.requestType === "brandRequest" ? row.dueDate : row.launchDate)}
                  </td>
                  <td className="text-base-content/70">{row.contentType ?? "—"}</td>
                  <td className="text-base-content/70">
                    {row.retailer ? retailerLabel(row.retailer) : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        row.status === "issue" ? "badge-error" : "badge-success"
                      }`}
                    >
                      {row.status === "issue" ? "Issue" : "Ready"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  );
}
