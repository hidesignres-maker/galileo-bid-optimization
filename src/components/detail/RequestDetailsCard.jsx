import { Card } from "../ui/Card";
import { REQUEST_TYPE_LABELS, getAssigneeLabel } from "../../data/formOptions";
import { STATUS_BADGE, STATUS_LABEL, STATUS_PILL_RADIUS } from "../../pages/ContentRequestQueue";
import { fmtDate } from "../../lib/format";

/** Label-above-value row, matching the treatment already used elsewhere in
 * this app (BrandVizRequestSummary, the old RequestDetailHeader metadata
 * row) — reused here rather than a third variant of the same pattern. */
function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <span className="text-sm text-base-content">{children}</span>
    </div>
  );
}

/**
 * Best-effort "Brand" label for the Details card. There is no single
 * top-level `brand` field on a Request — brand lives per product (VizID/
 * Brand Request, `product.brand`) or per item (Innovation,
 * `itemInputs[].brand`). Rather than fabricating a request-level brand
 * field that doesn't exist, this derives the distinct brand names actually
 * present in the request's own product/item data and joins them — omitting
 * the row entirely (via the "—" fallback) only when truly none is known.
 */
function brandLabelFor(request) {
  const isInnovation = request.requestType === "innovation";
  const brands = isInnovation
    ? (request.itemInputs ?? []).map((item) => item.brand)
    : (request.products ?? []).map((p) => p.brand);
  const distinct = Array.from(new Set(brands.filter(Boolean)));
  return distinct.join(", ") || "—";
}

/**
 * RequestDetailsCard — the right-sidebar "Details" card, shared by both
 * READ Request Detail and the Edit layout's contextual sidebar.
 *
 * Product-feedback correction (Gowri): this card is the single source of
 * truth for this metadata now that RequestDetailHeader no longer repeats
 * any of it — so it also picks up Created date and Request ID here, which
 * previously lived ONLY in the header and would otherwise be lost entirely
 * once the header was simplified. Fields shown, in order: Request type,
 * Status, Assignee, Created date, Request ID, Brand (or "—"),
 * Start/effective date, Due/earliest date. No version/current marker row —
 * this Request model has no version field anywhere, and fabricating one
 * ("v3") is explicitly out of scope; the row is simply omitted rather than
 * invented.
 *
 * This card is READ-ONLY EVERYWHERE now, including in Edit — Gowri's
 * correction reversed the prior pass's "Assignee editable only in the
 * sidebar" design. Assignee is editable again in the main Add
 * Details/Create form only (see ManualDetailsForm), exactly like every
 * other editable field; this card never renders an input of its own. Every
 * caller that used to pass `editableAssignee`/`onAssigneeChange` has been
 * updated to stop doing so.
 *
 * `assignee` — optional override for the displayed assignee value. Edit
 * mode's sidebar passes the wizard's live draft `formData.assignee` here
 * (so the summary reflects an in-progress, not-yet-saved change instead of
 * going stale), while every other caller (READ Request Detail) omits it and
 * falls back to `request.assignee` directly.
 */
export function RequestDetailsCard({ request, assignee }) {
  const typeLabel = REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType;
  const statusBadgeClass = STATUS_BADGE[request.status] ?? "badge-soft badge-neutral";
  const statusLabel = STATUS_LABEL[request.status] ?? request.status;
  const brandLabel = brandLabelFor(request);
  const startDate = request.launchDate || request.dueDate;
  const dueDate = request.dueDate || request.launchDate;
  const assigneeValue = assignee !== undefined ? assignee : request.assignee;

  return (
    <Card title="Details">
      <div className="flex flex-col gap-4">
        <DetailRow label="Request type">{typeLabel}</DetailRow>
        <DetailRow label="Status">
          <span className={`badge badge-sm whitespace-nowrap ${statusBadgeClass}`} style={STATUS_PILL_RADIUS}>
            {statusLabel}
          </span>
        </DetailRow>
        <DetailRow label="Assignee">{getAssigneeLabel(assigneeValue) || "Unassigned"}</DetailRow>
        {request.createdAt && <DetailRow label="Created">{fmtDate(request.createdAt)}</DetailRow>}
        {request.id && <DetailRow label="Request ID">{request.id}</DetailRow>}
        <DetailRow label="Brand">{brandLabel}</DetailRow>
        <DetailRow label="Start/effective date">{fmtDate(startDate)}</DetailRow>
        <DetailRow label="Due/earliest date">{fmtDate(dueDate)}</DetailRow>
      </div>
    </Card>
  );
}
