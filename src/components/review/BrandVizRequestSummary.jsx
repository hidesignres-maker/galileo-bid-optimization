import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import {
  CONTENT_TYPE_OPTIONS_BY_FLOW,
  REQUEST_TYPE_LABELS,
  getAssigneeLabel,
  mockAssignees,
} from "../../data/formOptions";
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
 *
 * `formData.assignee` is always the Select's raw option value (e.g.
 * "priya.nair"), whether this renders live during the wizard (create or
 * edit) or read-only inside Request Detail — `getAssigneeLabel` turns it
 * into the friendly display name in every case; the underlying value is
 * never rewritten.
 *
 * `hideTitle` (default false, opt-in) — omits the "Request title" field
 * entirely, for Request Detail's compact Request Overview card, which
 * shows the title once already (in the operational header) and doesn't
 * repeat it here. Every existing caller (the wizard's Review step) omits
 * this prop, so "Request title" keeps rendering exactly as before. Only
 * consulted by the `"review"` variant — the `"detail"` variant never shows
 * a title row regardless (see below).
 *
 * `onAssigneeChange` (optional, opt-in) — when provided, the Assignee
 * field renders as a real `<Select>` (mockAssignees options) instead of
 * plain text, and calls `onAssigneeChange(newValue)` on change; the
 * caller owns the actual mutation (Request Detail wires this to
 * `onUpdateAssignee`). Omitted by every existing caller (including a
 * read-only Request Detail render), so Assignee keeps rendering as plain
 * text everywhere it already did.
 *
 * `variant` (default `"review"`, opt-in) — Request Detail READ-view
 * information-hierarchy correction (Aug 2026 pass). `"review"` renders
 * byte-identical output to before this prop existed (every existing
 * caller — the wizard's Review step — omits it, so nothing there changes).
 * `"detail"` renders the approved READ-view field order instead: Description
 * first (widest field), then a Request type / Content type row, then a
 * Launch Date / Assignee row — plus a new Request type field this
 * component never rendered before. This is a display-only addition:
 * `requestType` itself was already a required prop, just not shown until
 * now. Only Request Detail passes `variant="detail"`.
 */
export function BrandVizRequestSummary({
  requestType,
  formData,
  hideTitle = false,
  onAssigneeChange,
  variant = "review",
}) {
  const contentTypes = contentTypeLabels(requestType, formData.contentTypes);
  const dateLabel = requestType === "brandRequest" ? "Due/launch date" : "Launch date";

  const assigneeField = onAssigneeChange ? (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">Assignee</span>
      <Select
        size="sm"
        aria-label="Assignee"
        value={formData.assignee || ""}
        placeholder="Unassigned"
        options={mockAssignees}
        onChange={(e) => onAssigneeChange(e.target.value)}
      />
    </div>
  ) : (
    <SummaryField label="Assignee">{getAssigneeLabel(formData.assignee) || "Unassigned"}</SummaryField>
  );

  if (variant === "detail") {
    return (
      <Card title="Request Summary" bodyClassName="p-6">
        <div className="flex flex-col gap-4">
          <SummaryField label="Description">{formData.description || "Not provided"}</SummaryField>
          <div className="grid grid-cols-2 gap-6">
            <SummaryField label="Request type">{REQUEST_TYPE_LABELS[requestType] ?? requestType}</SummaryField>
            <SummaryField label="Content type">{contentTypes.join(", ") || "—"}</SummaryField>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SummaryField label="Launch Date">{fmtDate(formData.defaultDate)}</SummaryField>
            {assigneeField}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Request Summary" bodyClassName="p-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          {!hideTitle && <SummaryField label="Request title">{formData.title || "—"}</SummaryField>}
          <div className="flex items-start gap-6">
            <SummaryField label={dateLabel}>{fmtDate(formData.defaultDate)}</SummaryField>
            <SummaryField label="Content type">{contentTypes.join(", ") || "—"}</SummaryField>
            {onAssigneeChange ? (
              <div className="flex flex-col gap-1 w-40">
                <span className="text-xs font-semibold text-base-content/50">Assignee</span>
                <Select
                  size="sm"
                  aria-label="Assignee"
                  value={formData.assignee || ""}
                  placeholder="Unassigned"
                  options={mockAssignees}
                  onChange={(e) => onAssigneeChange(e.target.value)}
                />
              </div>
            ) : (
              <SummaryField label="Assignee">{getAssigneeLabel(formData.assignee) || "Unassigned"}</SummaryField>
            )}
          </div>
        </div>
        <div>
          <SummaryField label="Description">{formData.description || "—"}</SummaryField>
        </div>
      </div>
    </Card>
  );
}
