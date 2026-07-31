import { Card } from "../ui/Card";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, REQUEST_TYPE_LABELS, getAssigneeLabel } from "../../data/formOptions";

function contentTypeLabels(values) {
  const options = CONTENT_TYPE_OPTIONS_BY_FLOW.innovation ?? [];
  return (values ?? []).map((v) => options.find((o) => o.value === v)?.label ?? v);
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-base-300/60 last:border-b-0">
      <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-base-content text-right">{children}</span>
    </div>
  );
}

/**
 * InnovationRequestSummary — explicit Innovation summary. Extracted from
 * the old RequestSummaryCard's innovation branch.
 *
 * Approved field list only: title, description, content type, assignee.
 * No general launch date — Innovation has no request-level date field
 * (formData.defaultDate is never collected for Innovation; dates live per
 * item in itemInputs[].onSaleDate/startShipDate, already shown on every
 * row of the Item Inputs table). No retailer-specific row — retailer is
 * also per-item, shown in the same table. Brand(s)/Item count/aggregated
 * dates that the old combined summary computed across itemInputs are
 * dropped for the same reason: already visible per row below, not
 * duplicated here.
 */
export function InnovationRequestSummary({ formData }) {
  const contentTypes = contentTypeLabels(formData.contentTypes);

  return (
    <Card title="Summary" subtitle={REQUEST_TYPE_LABELS.innovation}>
      <SummaryRow label="Title">{formData.title || "—"}</SummaryRow>
      <SummaryRow label="Description">{formData.description || "—"}</SummaryRow>
      <SummaryRow label="Content Type">{contentTypes.join(", ") || "—"}</SummaryRow>
      <SummaryRow label="Assignee">{getAssigneeLabel(formData.assignee) || "Unassigned"}</SummaryRow>
    </Card>
  );
}
