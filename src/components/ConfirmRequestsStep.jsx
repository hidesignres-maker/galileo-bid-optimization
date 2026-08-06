import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";
import { Button } from "./ui/Button";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";

/**
 * ConfirmRequestsStep — Bulk CSV's final step (Aug 2026 ticket-centered
 * flow pass). Confirms creation of N requests (one per Ready ticket) as
 * placeholder tasks — details, assignee, and assets are expected to be
 * filled in later, closer to the work date (see "Bulk purpose" in the
 * product spec).
 *
 * Kept as its own separate step, never merged into Review — this screen's
 * only job is answering "what will happen when I create these requests?":
 * total uploaded, what will be created, what will not. Explicit
 * consequence copy ("will not be created and will not be saved") replaces
 * the prior "excluded (needs attention)" phrasing — "Skipped" was never
 * used, but the fuzzier framing that skipped work could be resumed later
 * has been replaced with the correct, current behavior: an unresolved
 * ticket is discarded when Ready tickets are confirmed, not saved for a
 * later retry (see BulkCsvWizard.handleConfirm — only `readyRows` are
 * mapped to real requests; excluded rows are never persisted anywhere).
 *
 * The per-type breakdown below exists to make mixed-type uploads visible:
 * a single confirm can create VizID, Brand Request, and Innovation
 * requests together, since requestType is per row, not per batch/bulkType.
 *
 * No full ticket table here — a compact excluded-ticket list is enough to
 * explain *why* the count differs from the upload total, without
 * duplicating Review Tickets' detailed table.
 *
 * `onBack` (Aug 2026, new) — "Back to review" secondary action. The
 * shared Back/Discard/Continue bar in BulkCsvWizard is intentionally
 * hidden for this step (its own doc comment there is unchanged), since
 * "Continue to {next}" never made sense as the last step's shared action
 * — this component now owns its own Back action instead.
 */
export function ConfirmRequestsStep({ rows, onConfirm, onBack }) {
  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");
  const excludedRows = rows.filter((r) => !r.willCreateRequest || r.status === "issue");

  const countsByType = readyRows.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card title="Confirm">
      <div className="flex flex-col gap-4">
        <InfoBanner variant={excludedRows.length > 0 ? "warning" : "success"}>
          <div>
            {rows.length} ticket{rows.length === 1 ? "" : "s"} uploaded · {readyRows.length} will be
            created
            {excludedRows.length > 0 && ` · ${excludedRows.length} will not be created`}
          </div>
          {excludedRows.length > 0 && (
            <div className="mt-1">
              Tickets with unresolved errors will not be created and will not be saved.
            </div>
          )}
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

        {excludedRows.length > 0 && (
          <div className="rounded-box bg-base-200 border border-base-300 p-3">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1.5">
              Will not be created ({excludedRows.length})
            </p>
            <ul className="flex flex-col gap-1">
              {excludedRows.map((row) => (
                <li key={row.id} className="text-xs text-base-content/70 flex items-center gap-1.5">
                  <span className="truncate max-w-[220px]">{row.title || row.description || "Untitled ticket"}</span>
                  <span className="text-base-content/40">— {row.issueReason || "Needs attention"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-base-content/50">
          Bulk references are carried into each created request. Files can be attached later in
          the request detail view.
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            disabled={readyRows.length === 0}
            onClick={onConfirm}
          >
            Create {readyRows.length} request{readyRows.length === 1 ? "" : "s"}
          </Button>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Back to review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
