import { Card } from "../ui/Card";
import { CONTENT_TYPE_OPTIONS_BY_FLOW } from "../../data/formOptions";
import { fmtDate } from "../../lib/format";

function contentTypeLabels(requestType, values) {
  const options = CONTENT_TYPE_OPTIONS_BY_FLOW[requestType] ?? [];
  return (values ?? []).map((v) => options.find((o) => o.value === v)?.label ?? v);
}

/** Label-above-value field, no divider, sentence-case label (not
 * uppercase/tracked — that treatment read as louder than this compact
 * composition calls for). */
function SummaryField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <span className="text-sm text-base-content">{children}</span>
    </div>
  );
}

/**
 * BrandVizRequestSummary — explicit VizID Change / Brand Request summary.
 *
 * Compact two-region composition (verified Figma Brand Review frame):
 * top region is left (Request title) / right (Description); a metadata
 * row — Launch date, Content type, Assignee, side by side — sits directly
 * under Request title, inside the same left column (not spanning under
 * Description). Label-above-value throughout, no dividers between
 * individual fields. No request-type subtitle ("VizID Change") under the
 * card heading — the heading itself ("Request Summary") is enough context
 * here.
 *
 * The card has no min-height/fixed height anywhere in this component —
 * Card's own body has no height rule beyond its padding, so it already
 * shrinks to content naturally.
 *
 * Request-level fields only. No retailer-specific dates or retailer
 * controls here by design — retailer date editing lives exclusively
 * inside each expandable retailer item in BrandVizReviewBody's "Products
 * by Retailer" section (see RetailerGroupPanel), so there is exactly one
 * place retailer date state can be edited from, never two. There is no
 * visible remove action anywhere in Review (see BrandVizReviewBody).
 */
export function BrandVizRequestSummary({ requestType, formData }) {
  const contentTypes = contentTypeLabels(requestType, formData.contentTypes);
  const dateLabel = requestType === "brandRequest" ? "Due/launch date" : "Launch date";

  return (
    <Card title="Request Summary" bodyClassName="p-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <SummaryField label="Request title">{formData.title || "—"}</SummaryField>
          <div className="flex items-start gap-6">
            <SummaryField label={dateLabel}>{fmtDate(formData.defaultDate)}</SummaryField>
            <SummaryField label="Content type">{contentTypes.join(", ") || "—"}</SummaryField>
            <SummaryField label="Assignee">{formData.assignee || "Unassigned"}</SummaryField>
          </div>
        </div>
        <div>
          <SummaryField label="Description">{formData.description || "—"}</SummaryField>
        </div>
      </div>
    </Card>
  );
}
