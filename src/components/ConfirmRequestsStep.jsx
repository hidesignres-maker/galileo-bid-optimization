import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";
import { Button } from "./ui/Button";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";

/**
 * ConfirmRequestsStep — Bulk CSV's final step. Confirms creation of N
 * requests (one per ready row) as placeholder tasks — details, assignee,
 * and assets are expected to be filled in later, closer to the work date
 * (see "Bulk purpose" in the product spec).
 *
 * The per-type breakdown below exists to make mixed-type uploads visible:
 * a single confirm can create Viz ID, Brand Request, and Innovation
 * requests together, since requestType is per row, not per batch.
 */
export function ConfirmRequestsStep({ rows, onConfirm }) {
  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");

  const countsByType = readyRows.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card title="Confirm">
      <div className="flex flex-col gap-4">
        <InfoBanner variant="info">
          Confirming will create {readyRows.length} placeholder request
          {readyRows.length === 1 ? "" : "s"} in the queue. Rows with issues are skipped and can
          be re-uploaded later.
        </InfoBanner>

        {Object.keys(countsByType).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(countsByType).map(([type, count]) => (
              <span key={type} className="badge badge-outline badge-sm">
                {count} {REQUEST_TYPE_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-base-content/70">
          These requests will appear in the Content Request Queue as placeholder tasks so
          managers can see workload by month. Assignee, assets, and other details can be added
          later, closer to the work date.
        </p>

        <p className="text-xs text-base-content/50">
          Bulk references are carried into each created request. Files can be attached later in
          the request detail view.
        </p>

        <Button
          variant="success"
          className="self-start"
          disabled={readyRows.length === 0}
          onClick={onConfirm}
        >
          Create {readyRows.length} Request{readyRows.length === 1 ? "" : "s"}
        </Button>
      </div>
    </Card>
  );
}
