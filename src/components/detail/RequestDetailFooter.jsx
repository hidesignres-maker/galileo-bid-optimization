import { useState } from "react";
import { handleInternalNavClick } from "../../lib/clientNav";
import { ConfirmDialog } from "../ui/ConfirmDialog";

/**
 * RequestDetailFooter — Request Detail footer.
 *
 * Matches ReviewFooter's visual treatment (border-top, pt-4, flex row) for
 * composition parity with the Review step this page reuses so much of.
 *
 * "Edit Request" (Edit MVP) — only rendered when `isEditable` is true, per
 * the read-only protection rule: a read-only request gets exactly the same
 * footer as before (just "Back to requests" [+ Archive, see below]), no
 * active or hidden mutation control at all. When editable, this is a real
 * `btn-primary` link to `/request/{requestId}/edit` (same
 * href-plus-handleInternalNavClick pattern as "Back to requests" — real
 * navigation for keyboard/right-click/new-tab, client-side pushState for a
 * plain left-click). `requestId` is required only to build that href; this
 * component still owns no request data or mutation logic itself.
 *
 * "Archive request" (Part C) — rendered whenever `onArchive` is provided
 * and the request isn't already archived (`isArchived`). Opens the shared
 * ConfirmDialog (same copy specified for this pass); confirming calls
 * `onArchive(requestId)` — the actual status mutation lives in App.jsx, not
 * here. This button intentionally has no gating tied to `isEditable`: an
 * otherwise read-only (date-locked) request can still be archived, since
 * Archive is a distinct lifecycle action, not an edit.
 *
 * "Back to requests" stays a plain `<a href="/">` for the same reason as
 * the header's back link and the Queue's title link: a real link, whose
 * plain left-click is intercepted via handleInternalNavClick and routed
 * through the optional `onNavigate` (pushState-based, from App.jsx) when
 * provided — no reload, `requests` state stays intact.
 */
export function RequestDetailFooter({ isEditable, isArchived, onNavigate, requestId, requestTitle, onArchive }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmArchive = () => {
    onArchive?.(requestId);
    setConfirmOpen(false);
  };

  return (
    <div className="flex items-center justify-between border-t border-base-300 pt-4">
      <a href="/" onClick={(e) => handleInternalNavClick(e, "/", onNavigate)} className="btn btn-outline">
        Back to requests
      </a>
      <div className="flex items-center gap-2">
        {onArchive && !isArchived && (
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={() => setConfirmOpen(true)}
            aria-label={`Archive request: ${requestTitle || "Untitled request"}`}
          >
            Archive request
          </button>
        )}
        {isEditable && (
          <a
            href={`/request/${requestId}/edit`}
            onClick={(e) => handleInternalNavClick(e, `/request/${requestId}/edit`, onNavigate)}
            className="btn btn-primary"
            aria-label={`Edit request: ${requestTitle || "Untitled request"}`}
          >
            Edit Request
          </a>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Archive request?"
          body="This request will be moved out of the active queue. You can still view it from Archived requests."
          confirmLabel="Archive request"
          confirmVariant="error"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmArchive}
        />
      )}
    </div>
  );
}
