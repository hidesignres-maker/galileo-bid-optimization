import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { InfoBanner } from "./ui/InfoBanner";
import { REQUEST_TYPE_LABELS } from "../data/formOptions";

/**
 * ConfirmCreateModal — compact confirmation modal that replaces the prior
 * full-page Confirm step (`ConfirmRequestsStep`, removed). Opens over the
 * unchanged Review Tickets screen — `BulkCsvWizard` keeps `BulkReviewStep`
 * mounted underneath while this is open (see that file's own comment) —
 * rather than navigating to a fourth screen, since this step only ever
 * needed to answer "what happens when I create these requests?", a
 * modal-sized amount of information, not a page's worth.
 *
 * Built directly on the shared `Modal` primitive (ui/Modal.jsx), not
 * `ConfirmDialog` — `ConfirmDialog`'s contract is a single plain-text body
 * string, too narrow for this modal's multi-part summary (three counts, a
 * request-type breakdown, a warning banner, secondary copy). Every other
 * Modal convention is unchanged: 552px width, backdrop, Escape/focus trap,
 * footer-driven actions, no visible close icon (matches this pattern's
 * documented dismissal contract — Back to review + backdrop/Escape all
 * route through the same `onBack`).
 *
 * Row eligibility/counts are copied from the removed `ConfirmRequestsStep`
 * unchanged — same `readyRows`/`incompleteRows` filters, same per-type
 * reduce — so which rows are eligible for creation does not change.
 *
 * Request-type breakdown uses the real `REQUEST_TYPE_LABELS` values
 * ("VizID Change", "Brand Request", "Innovation"), not shortened labels —
 * per the explicit "use the actual existing request-type labels" direction.
 */
export function ConfirmCreateModal({ rows, onConfirm, onBack }) {
  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");
  const incompleteRows = rows.filter((r) => !r.willCreateRequest || r.status === "issue");

  const countsByType = readyRows.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] ?? 0) + 1;
    return acc;
  }, {});
  const breakdownText = Object.entries(countsByType)
    .map(([type, count]) => `${count} ${REQUEST_TYPE_LABELS[type] ?? type}`)
    .join(" · ");

  const uploadedCount = rows.length;
  const readyCount = readyRows.length;
  const incompleteCount = incompleteRows.length;

  return (
    <Modal
      title="Confirm request creation"
      onCancel={onBack}
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            Back to review
          </Button>
          <Button variant="success" disabled={readyCount === 0} onClick={onConfirm}>
            Create {readyCount} request{readyCount === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">These requests will be added to the Content Request Queue.</p>

        <div className="grid grid-cols-3 divide-x divide-base-300 border border-base-300 rounded-box">
          <div className="px-4 py-3 flex flex-col gap-0.5 min-w-0">
            <p className="text-xs text-base-content/50 uppercase tracking-wide">Uploaded</p>
            <p className="text-2xl font-bold text-base-content">{uploadedCount}</p>
            <p className="text-xs text-base-content/50">ticket{uploadedCount === 1 ? "" : "s"}</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5 min-w-0">
            <p className="text-xs text-base-content/50 uppercase tracking-wide">Will be created</p>
            <p className="text-2xl font-bold text-success">{readyCount}</p>
            <p className="text-xs text-base-content/50">ticket{readyCount === 1 ? "" : "s"}</p>
            {breakdownText && <p className="text-xs text-base-content/50 mt-0.5">{breakdownText}</p>}
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5 min-w-0">
            <p className="text-xs text-base-content/50 uppercase tracking-wide">Will not be created</p>
            <p className={`text-2xl font-bold ${incompleteCount > 0 ? "text-error" : "text-base-content"}`}>
              {incompleteCount}
            </p>
            <p className="text-xs text-base-content/50">ticket{incompleteCount === 1 ? "" : "s"}</p>
          </div>
        </div>

        {incompleteCount > 0 && (
          <InfoBanner variant="warning">
            <span className="font-semibold">Incomplete tickets will not be created or saved.</span>
          </InfoBanner>
        )}

        <p className="text-xs text-base-content/50">
          Request details can be updated later from the Content Request Queue.
        </p>
      </div>
    </Modal>
  );
}
