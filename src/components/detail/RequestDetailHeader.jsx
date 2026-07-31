import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { REQUEST_TYPE_LABELS, getAssigneeLabel } from "../../data/formOptions";
import { STATUS_BADGE, STATUS_LABEL, STATUS_PILL_RADIUS } from "../../pages/ContentRequestQueue";
import { fmtDate } from "../../lib/format";
import { handleInternalNavClick } from "../../lib/clientNav";

/** Same label-above-value field treatment already used in
 * BrandVizRequestSummary — reused here for visual consistency between
 * Review and Detail rather than inventing a second metadata-field style. */
function MetaField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <span className="text-sm text-base-content">{children}</span>
    </div>
  );
}

/**
 * RequestDetailHeader — READ Request Detail MVP header.
 *
 * Displays only data that already exists on the persisted Request object
 * (models.js): title, request-type label (existing REQUEST_TYPE_LABELS),
 * status pill (the exact STATUS_BADGE/STATUS_LABEL/STATUS_PILL_RADIUS
 * mapping ContentRequestQueue.jsx already uses and now exports, so the
 * pill reads identically here and in the Queue table), assignee, and
 * createdAt. There is no distinct "created by" field anywhere in the data
 * model — only `assignee` exists, and it is labeled here only as
 * "Assignee," never presented as who created the request.
 *
 * Editability is purely informational in this slice: a plain-text pill
 * showing "Editable" or "Read-only" (word, not color alone — the color
 * mapping below is a secondary reinforcement, not the only signal). There
 * is no action here that reads or reacts to this value; RequestDetail
 * decides separately whether to render an Edit affordance at all (per this
 * slice's scope, it does not).
 *
 * "Back to requests" is a real link to "/" — its href always works (direct
 * navigation, right-click, new tab), but a plain left-click is intercepted
 * via handleInternalNavClick and routed through the optional `onNavigate`
 * (pushState-based client-side navigation from App.jsx) when provided, so
 * returning to the Queue doesn't reload the page. Falls back to the
 * browser's normal href navigation if `onNavigate` isn't passed.
 */
export function RequestDetailHeader({ request, isEditable, onNavigate }) {
  const typeLabel = REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType;
  const statusBadgeClass = STATUS_BADGE[request.status] ?? "badge-soft badge-neutral";
  const statusLabel = STATUS_LABEL[request.status] ?? request.status;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <a
        href="/"
        onClick={(e) => handleInternalNavClick(e, "/", onNavigate)}
        className="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content w-fit"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to requests
      </a>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-base-content">
              {request.title || <span className="italic font-normal text-base-content/40">Untitled request</span>}
            </h1>
            <span className={`badge badge-sm whitespace-nowrap ${statusBadgeClass}`} style={STATUS_PILL_RADIUS}>
              {statusLabel}
            </span>
            <span
              className={`badge badge-sm whitespace-nowrap ${
                isEditable ? "badge-soft badge-success" : "badge-soft badge-neutral"
              }`}
              style={STATUS_PILL_RADIUS}
              title={
                isEditable
                  ? "At least one effective launch date is today or in the future."
                  : "Every known effective launch date is in the past."
              }
            >
              {isEditable ? "Editable" : "Read-only"}
            </span>
          </div>

          <div className="flex items-start gap-6 flex-wrap">
            <MetaField label="Request type">{typeLabel}</MetaField>
            <MetaField label="Assignee">{getAssigneeLabel(request.assignee) || "Unassigned"}</MetaField>
            <MetaField label="Created">{fmtDate(request.createdAt)}</MetaField>
            <MetaField label="Request ID">{request.id}</MetaField>
          </div>
        </div>
      </div>
    </div>
  );
}
