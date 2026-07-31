import { handleInternalNavClick } from "../../lib/clientNav";

/**
 * RequestDetailFooter — Request Detail footer.
 *
 * Matches ReviewFooter's visual treatment (border-top, pt-4, flex row) for
 * composition parity with the Review step this page reuses so much of.
 *
 * "Edit Request" (Edit MVP) — only rendered when `isEditable` is true, per
 * the read-only protection rule: a read-only request gets exactly the same
 * footer as before (just "Back to requests"), no active or hidden mutation
 * control at all. When editable, this is a real `btn-primary` link to
 * `/request/{requestId}/edit` (same href-plus-handleInternalNavClick
 * pattern as "Back to requests" — real navigation for keyboard/right-click/
 * new-tab, client-side pushState for a plain left-click). `requestId` is
 * required only to build that href; this component still owns no request
 * data or mutation logic itself.
 *
 * "Back to requests" stays a plain `<a href="/">` for the same reason as
 * the header's back link and the Queue's title link: a real link, whose
 * plain left-click is intercepted via handleInternalNavClick and routed
 * through the optional `onNavigate` (pushState-based, from App.jsx) when
 * provided — no reload, `requests` state stays intact.
 */
export function RequestDetailFooter({ isEditable, onNavigate, requestId }) {
  return (
    <div className="flex items-center justify-between border-t border-base-300 pt-4">
      <a href="/" onClick={(e) => handleInternalNavClick(e, "/", onNavigate)} className="btn btn-outline">
        Back to requests
      </a>
      {isEditable && (
        <a
          href={`/request/${requestId}/edit`}
          onClick={(e) => handleInternalNavClick(e, `/request/${requestId}/edit`, onNavigate)}
          className="btn btn-primary"
        >
          Edit Request
        </a>
      )}
    </div>
  );
}
