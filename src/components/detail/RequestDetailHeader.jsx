import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { handleInternalNavClick } from "../../lib/clientNav";
import { editUnavailableReason } from "../../lib/editability";
import { fmtRelativeDate } from "../../lib/format";
import { REQUEST_STATUS } from "../../lib/models";
import { STATUS_BADGE, STATUS_LABEL, STATUS_PILL_RADIUS } from "../../pages/ContentRequestQueue";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { MoreMenu } from "./MoreMenu";

// Selectable Status options for the header's quick-control. Deliberately
// excludes REQUEST_STATUS.ARCHIVED — Archive stays its own distinct,
// confirmed action (see the More menu below), matching the existing
// Archive lifecycle semantics rather than folding archival into a plain
// status pick. Order mirrors STATUS_TABS in ContentRequestQueue.jsx (minus
// "All" and "Archived").
const STATUS_OPTIONS = [
  REQUEST_STATUS.NEEDS_ACTION,
  REQUEST_STATUS.IN_PROGRESS,
  REQUEST_STATUS.COMPLETED,
  REQUEST_STATUS.ON_HOLD,
].map((key) => ({ value: key, label: STATUS_LABEL[key] }));

/**
 * latestActivityLine — "<actor> <remainder> · <relative date>", derived
 * from the last entry in `history` (App.jsx already appends events in
 * chronological order, so the last element is the most recent — see
 * RequestHistory.jsx's own doc comment). Two pre-existing, inconsistent
 * History description conventions coexist (see lib/requestHistory.js /
 * data/mockActivity.js): seed data is passive voice with no actor prefix
 * ("Status changed to In Progress"), runtime-generated events already
 * prefix the description with the actor's name ("Current user changed
 * Assignee to Kaitlyn G."). Rather than rewriting either convention (out
 * of scope, and would touch seed data / the event-generation helpers),
 * this only avoids double-printing the actor when the description already
 * starts with it — older seed entries read slightly plainer ("Sandra
 * Smith Status changed to In Progress") than newer ones, which is
 * sufficient visual parity, not a functional bug.
 */
function latestActivityLine(history) {
  if (!history || history.length === 0) return null;
  const last = history[history.length - 1];
  const remainder = last.description?.startsWith(last.actor)
    ? last.description.slice(last.actor.length).trim()
    : last.description;
  return `${last.actor} ${remainder} · ${fmtRelativeDate(last.at)}`;
}

/**
 * RequestDetailHeader — Request Detail's operational header (Corrected
 * Approved Scope, Aug 2026).
 *
 * Layout, top to bottom: breadcrumb ("Content Request" > request ID, no
 * back-arrow icon — the crumb text itself is the navigation) — title +
 * latest-activity line — a right-aligned action row (Status quick-control,
 * Edit, More). Replaces the previous simplified header (title +
 * Editable/Read-only pill only) and absorbs the primary actions that used
 * to live in the now-retired `RequestDetailFooter` (Edit, Archive), plus
 * two new ones (Copy request link, View full history) that didn't exist
 * before.
 *
 * Bulk CSV title/source (Aug 2026 correction): when
 * `request.creationMethod === "bulkCsv"`, the page heading prefers the
 * imported item's own `productTitle` (`request.itemInputs[0]`) over the
 * request's own `title`, and a subtle "Imported via Bulk CSV · <relative
 * date>" line renders under the title — this is a display-only distinction
 * (Request type, shown elsewhere in Request Overview, always stays the
 * request's real `requestType` label; "Bulk CSV" is never rendered as a
 * request type). Every non-bulk request is unaffected: `bulkItem` is null,
 * so the heading falls back to `request.title` exactly as before, and the
 * source line never renders.
 *
 * Status quick-control — a real native `<select>` wrapped in the exact
 * `STATUS_BADGE`/`STATUS_PILL_RADIUS` pill styling already used for the
 * read-only status pill elsewhere (Queue rows, the old Details card) —
 * the same "native control inside a styled container" technique already
 * established for `SelectField`. Calls `onUpdateStatus(requestId,
 * newValue)`; the caller (App.jsx) owns the actual mutation + History
 * event, this component has no mutation logic of its own. Hidden
 * (rendered as a plain read-only pill) when the request isn't editable —
 * reuses the same `isEditable`/`editUnavailableReason` this header
 * already computed before, no new gating rule invented.
 *
 * Edit — same `/request/:id/edit` link as before, gated the same way.
 *
 * More menu — Copy request link (writes the current URL to the
 * clipboard), View full history (calls `onViewFullHistory`, which the
 * parent wires to switch the combined Comments/History panel to its
 * History tab), Archive request (opens the same `ConfirmDialog` copy the
 * old footer used, then calls `onArchive(requestId)`). No "Duplicate
 * request" item — explicitly excluded per the resolved decision.
 */
export function RequestDetailHeader({
  request,
  requestId,
  isEditable,
  history = [],
  onNavigate,
  onUpdateStatus,
  onArchive,
  onViewFullHistory,
}) {
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const unavailableReason = editUnavailableReason(request);
  const activityLine = latestActivityLine(history);
  const isArchived = request.status === REQUEST_STATUS.ARCHIVED;
  const isBulkImport = request.creationMethod === "bulkCsv";
  const bulkItem = isBulkImport ? request.itemInputs?.[0] : null;
  const displayTitle = bulkItem?.productTitle || request.title;
  const sourceLine = isBulkImport ? `Imported via Bulk CSV · ${fmtRelativeDate(request.createdAt)}` : null;

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        },
        () => {}
      );
    }
  };

  const handleConfirmArchive = () => {
    onArchive?.(requestId);
    setConfirmArchiveOpen(false);
  };

  const moreItems = [
    { label: copyFeedback ? "Link copied" : "Copy request link", onSelect: handleCopyLink },
    { label: "View full history", onSelect: () => onViewFullHistory?.() },
    ...(onArchive && !isArchived
      ? [{ label: "Archive request", destructive: true, onSelect: () => setConfirmArchiveOpen(true) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center gap-1.5 text-sm text-base-content/60">
        <a
          href="/"
          onClick={(e) => handleInternalNavClick(e, "/", onNavigate)}
          className="hover:text-base-content"
        >
          Content Request
        </a>
        <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-base-content/50">{requestId}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-xl font-bold text-base-content">
            {displayTitle || <span className="italic font-normal text-base-content/40">Untitled request</span>}
          </h1>
          {activityLine && <p className="text-xs text-base-content/50">{activityLine}</p>}
          {sourceLine && <p className="text-xs text-base-content/50">{sourceLine}</p>}
          {!isEditable && unavailableReason && (
            <p className="text-xs text-base-content/50">{unavailableReason}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditable ? (
            <label className="inline-flex" aria-label="Status">
              <span
                className={`badge badge-sm whitespace-nowrap ${STATUS_BADGE[request.status] ?? "badge-soft badge-neutral"} relative`}
                style={STATUS_PILL_RADIUS}
              >
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={request.status}
                  aria-label="Status"
                  onChange={(e) => onUpdateStatus?.(requestId, e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">{STATUS_LABEL[request.status] ?? request.status}</span>
              </span>
            </label>
          ) : (
            <span
              className={`badge badge-sm whitespace-nowrap ${STATUS_BADGE[request.status] ?? "badge-soft badge-neutral"}`}
              style={STATUS_PILL_RADIUS}
            >
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
          )}

          {isEditable && (
            <a
              href={`/request/${requestId}/edit`}
              onClick={(e) => handleInternalNavClick(e, `/request/${requestId}/edit`, onNavigate)}
              className="btn btn-outline btn-sm"
              aria-label={`Edit request: ${displayTitle || "Untitled request"}`}
            >
              Edit
            </a>
          )}

          <MoreMenu items={moreItems} aria-label={`More actions for ${displayTitle || "this request"}`} />
        </div>
      </div>

      {confirmArchiveOpen && (
        <ConfirmDialog
          title="Archive request?"
          body="This request will be moved out of the active queue. You can still view it from Archived requests."
          confirmLabel="Archive request"
          confirmVariant="destructive"
          onCancel={() => setConfirmArchiveOpen(false)}
          onConfirm={handleConfirmArchive}
        />
      )}
    </div>
  );
}
