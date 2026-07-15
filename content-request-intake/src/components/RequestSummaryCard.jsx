import { Card } from "./ui/Card";
import { mockRetailers } from "../data/mockRetailers";
import { CONTENT_TYPE_OPTIONS_BY_FLOW, REQUEST_TYPE_LABELS } from "../data/formOptions";
import { fmtDate, fmtCount } from "../lib/format";
import { isStartShipDateRequired } from "../lib/businessRules";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

function contentTypeLabels(requestType, values) {
  const options = CONTENT_TYPE_OPTIONS_BY_FLOW[requestType] ?? [];
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
 * RequestSummaryCard — Step 4 summary, adapted per request type.
 */
export function RequestSummaryCard({
  requestType,
  formData,
  products = [],
  itemInputs = [],
  retailerGroups = [],
}) {
  const contentTypes = contentTypeLabels(requestType, formData.contentTypes);

  if (requestType === "innovation") {
    const brands = Array.from(new Set(itemInputs.map((i) => i.brand).filter(Boolean)));
    const distinctRetailerCodes = Array.from(
      new Set(itemInputs.map((i) => i.retailer).filter(Boolean))
    );
    const onSaleDates = Array.from(new Set(itemInputs.map((i) => i.onSaleDate).filter(Boolean)));
    const amzShipDates = Array.from(
      new Set(
        itemInputs
          .filter((i) => isStartShipDateRequired(i.retailer) && i.startShipDate)
          .map((i) => i.startShipDate)
      )
    );
    return (
      <Card title="Summary" subtitle={REQUEST_TYPE_LABELS.innovation}>
        <SummaryRow label="Title">{formData.title || "—"}</SummaryRow>
        <SummaryRow label="Description">{formData.description || "—"}</SummaryRow>
        <SummaryRow label="On Sale Date">
          {onSaleDates.length ? onSaleDates.map(fmtDate).join(", ") : "—"}
        </SummaryRow>
        <SummaryRow label="Start Ship Date (AMZ only)">
          {amzShipDates.length ? amzShipDates.map(fmtDate).join(", ") : "—"}
        </SummaryRow>
        <SummaryRow label="Brand(s)">{brands.join(", ") || "—"}</SummaryRow>
        <SummaryRow label="Content Type">{contentTypes.join(", ") || "—"}</SummaryRow>
        <SummaryRow label="Item Inputs">{fmtCount(itemInputs.length, "item")}</SummaryRow>
        <SummaryRow label="Retailers">
          {distinctRetailerCodes.map(retailerLabel).join(", ") || "—"}
        </SummaryRow>
        <SummaryRow label="Assignee">{formData.assignee || "Unassigned"}</SummaryRow>
      </Card>
    );
  }

  // vizId & brandRequest share the same summary shape
  const distinctRetailerCodes = Array.from(new Set(retailerGroups.map((g) => g.retailer)));
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  const dateLabel = requestType === "brandRequest" ? "Due/Launch Date" : "Launch Date";

  return (
    <Card title="Summary" subtitle={REQUEST_TYPE_LABELS[requestType]}>
      <SummaryRow label="Title">{formData.title || "—"}</SummaryRow>
      <SummaryRow label="Description">{formData.description || "—"}</SummaryRow>
      <SummaryRow label={dateLabel}>{fmtDate(formData.defaultDate)}</SummaryRow>
      <SummaryRow label="Brand">{brands.join(", ") || "—"}</SummaryRow>
      <SummaryRow label="Content Type">{contentTypes.join(", ") || "—"}</SummaryRow>
      <SummaryRow label="Products">{fmtCount(products.length, "product")}</SummaryRow>
      <SummaryRow label="Retailers">
        {distinctRetailerCodes.map(retailerLabel).join(", ") || "—"}
      </SummaryRow>
      <SummaryRow label="Assignee">{formData.assignee || "Unassigned"}</SummaryRow>
    </Card>
  );
}
