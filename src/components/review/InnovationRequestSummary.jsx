import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, REQUEST_TYPE_LABELS, getAssigneeLabel, mockAssignees } from "../../data/formOptions";

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

/** `variant="detail"` label-above-value field — the same treatment
 * BrandVizRequestSummary uses for its own `"detail"` variant, reused here
 * (not `SummaryRow`'s bordered/right-aligned treatment) so both request
 * types render an identical Request Overview field style in Request
 * Detail. */
function SummaryField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <span className="text-sm text-base-content">{children}</span>
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
 *
 * `hideTitle` (default false, opt-in) — same purpose and contract as
 * BrandVizRequestSummary's own prop: omits the "Title" row for Request
 * Detail's compact Request Overview, which already shows the title once
 * in the operational header. Every existing caller (wizard Review) omits
 * this prop, so "Title" keeps rendering exactly as before.
 *
 * `onAssigneeChange` (optional, opt-in) — same contract as
 * BrandVizRequestSummary: renders Assignee as a real `<Select>` instead
 * of plain text when provided, calling back with the new raw value.
 * Omitted everywhere else, so Assignee stays plain text by default.
 *
 * Still no Launch Date row — Innovation has no request-level date field
 * (see doc comment above); the compact Request Overview for Innovation
 * requests is therefore Description / Content type / Assignee only, one
 * field short of the Brand/VizID variant, by design.
 *
 * `variant` (default `"review"`, opt-in) — same purpose as
 * BrandVizRequestSummary's own `variant` prop. `"review"` is byte-identical
 * to this component's output before the prop existed (every existing
 * caller — the wizard's Review step — omits it). `"detail"` renders the
 * approved READ-view order instead: Description, then a Request type /
 * Content type row, then Assignee alone — Launch Date is never rendered
 * for Innovation in either variant, per the confirmed product decision
 * that no request-level date exists to show (not an omission to fix
 * later). Only Request Detail passes `variant="detail"`.
 */
export function InnovationRequestSummary({ formData, hideTitle = false, onAssigneeChange, variant = "review" }) {
  const contentTypes = contentTypeLabels(formData.contentTypes);

  const assigneeSelect = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">Assignee</span>
      <Select
        size="sm"
        aria-label="Assignee"
        value={formData.assignee || ""}
        placeholder="Unassigned"
        options={mockAssignees}
        containerClassName="w-40"
        onChange={(e) => onAssigneeChange(e.target.value)}
      />
    </div>
  );

  if (variant === "detail") {
    return (
      <Card title="Summary">
        <div className="flex flex-col gap-4">
          <SummaryField label="Description">{formData.description || "Not provided"}</SummaryField>
          <div className="grid grid-cols-2 gap-6">
            <SummaryField label="Request type">{REQUEST_TYPE_LABELS.innovation}</SummaryField>
            <SummaryField label="Content type">{contentTypes.join(", ") || "—"}</SummaryField>
          </div>
          {onAssigneeChange ? (
            assigneeSelect
          ) : (
            <SummaryField label="Assignee">{getAssigneeLabel(formData.assignee) || "Unassigned"}</SummaryField>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Summary" subtitle={REQUEST_TYPE_LABELS.innovation}>
      {!hideTitle && <SummaryRow label="Title">{formData.title || "—"}</SummaryRow>}
      <SummaryRow label="Description">{formData.description || "—"}</SummaryRow>
      <SummaryRow label="Content Type">{contentTypes.join(", ") || "—"}</SummaryRow>
      {onAssigneeChange ? (
        <div className="flex items-center justify-between gap-4 py-1.5">
          <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Assignee</span>
          <Select
            size="sm"
            aria-label="Assignee"
            value={formData.assignee || ""}
            placeholder="Unassigned"
            options={mockAssignees}
            containerClassName="w-40"
            onChange={(e) => onAssigneeChange(e.target.value)}
          />
        </div>
      ) : (
        <SummaryRow label="Assignee">{getAssigneeLabel(formData.assignee) || "Unassigned"}</SummaryRow>
      )}
    </Card>
  );
}
