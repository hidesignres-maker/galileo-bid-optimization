import { Card } from "./ui/Card";
import { InfoBanner } from "./ui/InfoBanner";
import { Button } from "./ui/Button";

/**
 * ConfirmRequestsStep — Bulk CSV's final step. Confirms creation of N
 * requests (one per ready row) as placeholder tasks — details, assignee,
 * and assets are expected to be filled in later, closer to the work date
 * (see "Bulk purpose" in the product spec).
 */
export function ConfirmRequestsStep({ rows, onConfirm }) {
  const readyRows = rows.filter((r) => r.willCreateRequest && r.status !== "issue");

  return (
    <Card title="Confirm">
      <div className="flex flex-col gap-4">
        <InfoBanner variant="info">
          Confirming will create {readyRows.length} placeholder request
          {readyRows.length === 1 ? "" : "s"} in the queue. Rows with issues are skipped and can
          be re-uploaded later.
        </InfoBanner>

        <p className="text-sm text-base-content/70">
          These requests will appear in the Content Request Queue as placeholder tasks so
          managers can see workload by month. Assignee, assets, and other details can be added
          later, closer to the work date.
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
