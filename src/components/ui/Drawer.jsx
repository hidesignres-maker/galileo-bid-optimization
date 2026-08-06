import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDialogFocusTrap } from "./useDialogFocusTrap";

/**
 * Drawer — shared Galileo right-side panel foundation (Aug 2026 pass).
 * No drawer/side-panel primitive existed anywhere in this app before this
 * (confirmed by repo search) — DaisyUI's own `.drawer` class is a
 * checkbox-driven off-canvas *layout* utility (persistent nav/sidebar
 * toggle), not a dialog: no focus trap, no `aria-modal`, no Escape, no JS
 * at all. Using it directly would regress accessibility below what
 * `Modal.jsx` already guarantees. This component instead reuses `Modal`'s
 * exact, already-tested focus-trap/Escape logic via the shared
 * `useDialogFocusTrap` hook — same accessibility contract as Modal, only
 * the panel's position/size differ (right-side slide-in, wide, full
 * viewport height, versus Modal's centered card).
 *
 * Approved geometry (this pattern's own component contract, same
 * reasoning as Modal's own 552px — not a general-purpose spacing token):
 *   - width: `widthClass` (default `w-[800px]`, within the approved
 *     760-816px range) capped at `max-w-full`, so it naturally becomes
 *     "nearly full width" on viewports narrower than 800px without any
 *     extra breakpoint logic.
 *   - height: full viewport height (`h-full`), anchored to the right
 *     edge, content-driven scroll region between a sticky header and a
 *     sticky footer (`overflow-y-auto` on the body only).
 *   - no radius — flush with the viewport edge, the standard right-side
 *     drawer convention; deliberately not borrowing Modal's `16px`
 *     `--radius-modal` token, since that token's own contract is
 *     specifically for a centered, fully-bounded card.
 *   - white surface (`bg-base-100`), same backdrop treatment as Modal
 *     (`bg-black/40`, click-to-dismiss) so the table underneath stays
 *     visibly present (dimmed) the whole time — no new overlay recipe.
 *
 * Unlike Modal, this pattern DOES show a visible close icon (top-right,
 * `XMarkIcon`) alongside the footer's Cancel action — both call the same
 * `onCancel`, matching the task's explicit "closes with close icon" +
 * "closes with Cancel" requirement for this specific pattern.
 *
 * `title` — visible heading + accessible name (`aria-labelledby`).
 * `subtitle` — optional node rendered below the title inside the same
 * header block (e.g. request type/ID metadata, a validation summary
 * line) — deliberately a node, not a string, so a caller can compose more
 * than plain text there without this component knowing its shape.
 * `footer` — optional; same "caller owns layout via justify-between"
 * contract as Modal's own footer prop.
 *
 * No animation — matching Modal's own precedent (appears instantly, no
 * transition system exists anywhere in this app); not introduced here
 * either, per "don't build new overlay/animation machinery from scratch."
 */
export function Drawer({
  title,
  titleId,
  subtitle,
  children,
  footer,
  onCancel,
  widthClass = "w-[800px]",
  bodyClassName = "",
}) {
  const panelRef = useRef(null);
  const resolvedTitleId = titleId || "drawer-title";

  useDialogFocusTrap(panelRef, onCancel);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? resolvedTitleId : undefined}
        tabIndex={-1}
        className={`relative h-full ${widthClass} max-w-full bg-base-100 shadow-lg flex flex-col outline-none`}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-base-300 px-6 py-4 shrink-0">
            <div className="min-w-0">
              <h2 id={resolvedTitleId} className="text-base font-bold text-base-content">
                {title}
              </h2>
              {subtitle}
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="btn btn-ghost btn-sm btn-square shrink-0"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto px-6 py-5 ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="flex items-center justify-between border-t border-base-300 px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
