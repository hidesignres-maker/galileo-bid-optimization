import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { handleInternalNavClick } from "../../lib/clientNav";
import { editUnavailableReason } from "../../lib/editability";

// Same radius override ContentRequestQueue/RequestDetailsCard's status
// pills use (var(--radius-box) instead of badge's own hardcoded
// --radius-selector) — kept as a small local constant rather than
// importing STATUS_PILL_RADIUS from ContentRequestQueue, since this
// header no longer needs anything else from that module.
const PILL_RADIUS = { borderRadius: "var(--radius-box)" };

/**
 * RequestDetailHeader — Request Detail page header.
 *
 * Product-feedback correction (Gowri): the header used to repeat Request
 * type, Assignee, Created date, Request ID, and a status pill — all of
 * which now live in the right-rail Details card (RequestDetailsCard). That
 * was a straight duplication of the same values, so this header no longer
 * carries any of it. Nothing about the underlying data changed — every one
 * of those fields is still read from the same `request` object, just
 * displayed once, in the Details card, instead of twice.
 *
 * What stays here, deliberately: the request title (kept prominent, it's
 * the one thing a header uniquely earns), the Editable/Read-only pill
 * (this page's one true "state", not a duplicate of the Status field —
 * Status describes workflow stage, Editable/Read-only describes whether
 * this page's own Edit action is available), a visible explanation when
 * read-only (reusing the same shared `editUnavailableReason` wording every
 * other Edit-gated surface in this app uses, so it never drifts), and
 * "Back to requests". Primary actions (Edit/Archive) remain in
 * RequestDetailFooter, unchanged — this pass only removed duplicated
 * metadata, it didn't relocate existing controls.
 */
export function RequestDetailHeader({ request, isEditable, onNavigate }) {
  const unavailableReason = editUnavailableReason(request);

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

      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-base-content">
            {request.title || <span className="italic font-normal text-base-content/40">Untitled request</span>}
          </h1>
          <span
            className={`badge badge-sm whitespace-nowrap ${
              isEditable ? "badge-soft badge-success" : "badge-soft badge-neutral"
            }`}
            style={PILL_RADIUS}
            title={
              isEditable
                ? "At least one effective launch date is today or in the future."
                : "Every known effective launch date is in the past."
            }
          >
            {isEditable ? "Editable" : "Read-only"}
          </span>
        </div>

        {!isEditable && unavailableReason && (
          <p className="text-xs text-base-content/50">{unavailableReason}</p>
        )}
      </div>
    </div>
  );
}
