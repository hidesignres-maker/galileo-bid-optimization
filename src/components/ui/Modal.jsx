import { useRef } from "react";
import { useDialogFocusTrap } from "./useDialogFocusTrap";

/**
 * Modal — shared Galileo modal/dialog foundation. Extracted this pass
 * from two previously hand-rolled, near-identical overlay recipes
 * (CreateRequestLauncher and ConfirmDialog each built their own fixed
 * inset-0 + backdrop + centered panel markup) into one reusable
 * primitive, so future dialogs compose this instead of copying markup a
 * third time.
 *
 * Approved geometry (this pattern's own component contract, not a
 * general-purpose spacing token — deliberately not registered as a
 * global token per the instruction that introduced it):
 *   - width: 552px on desktop (`max-w-[552px]`), with `w-full` + a 16px
 *     horizontal margin (`mx-4`, matching the overlay's own `p-4`) as the
 *     responsive fallback on narrower viewports — never a hardcoded
 *     inflexible width that could overflow mobile.
 *   - height: content-driven — no fixed height anywhere in this
 *     component. `max-h-[calc(100vh-2rem)]` + `overflow-y-auto` on the
 *     body only exists as a safety net so a very tall body can still
 *     scroll within the viewport instead of overflowing it; it does not
 *     force or constrain height for the normal case.
 *   - radius: 16px, via the `--radius-modal` token (theme/corporate.css),
 *     applied inline for a guaranteed override — same reasoning already
 *     used for STATUS_PILL_RADIUS (ContentRequestQueue.jsx): DaisyUI/
 *     Tailwind utility-class ordering is not something a caller of this
 *     component should have to reason about.
 *   - white surface: `bg-base-100`, centered in the viewport via the
 *     overlay wrapper's `flex items-center justify-center`.
 *
 * No visible top-right close icon. This pattern's dismissal is explicit:
 * the caller supplies a `footer` (typically a Cancel action) and/or the
 * backdrop click / Escape key, all of which route through the same
 * `onCancel`. Removing the icon does not remove accessibility — the
 * dialog still has `role="dialog"`, `aria-modal="true"`, and
 * `aria-labelledby` pointing at the real rendered title, Escape still
 * closes it, and focus is still trapped and restored to the first
 * focusable element on open. A dialog that truly needs a silent/icon-only
 * dismissal affordance alongside explicit footer actions is a different
 * pattern from the one this component implements — don't force it here.
 *
 * Focus trap: on mount, focus moves to the first focusable element
 * inside the panel; Tab/Shift+Tab wrap within the panel's own focusable
 * elements instead of escaping to the page behind the overlay. Escape
 * calls `onCancel`. This is a real (if minimal) trap — broader than the
 * "focus the confirm button on mount" approximation the prior
 * ConfirmDialog implementation used. Implemented via the shared
 * `useDialogFocusTrap` hook (Aug 2026 Drawer pass) so this exact,
 * already-tested behavior is the one place a new overlay pattern
 * (Drawer.jsx) reuses rather than reimplementing.
 *
 * `title`/`titleId` — the dialog's accessible name. `title` renders as
 * the visible heading; `titleId` lets a caller pass their own id if they
 * need to reference it elsewhere (defaults to a stable local id
 * otherwise). A dialog with no visible title text and no external label
 * is not a supported configuration — always pass `title`.
 *
 * `footer` — optional; renders in a bordered footer row when provided.
 * Callers own their own button layout/alignment inside it (e.g. Cancel
 * left / primary action right via `justify-between`).
 *
 * `maxWidthClass` (default `"max-w-[552px]"`, opt-in) — a real conditional
 * substitution, not a class appended alongside the default (same
 * same-property cascade-order reasoning already applied to Card's
 * `bodyPadding`/`headerClassName`): a caller needing a wider panel (e.g.
 * Edit Ticket's product search) passes a different `max-w-[...]` value
 * here instead of fighting the default via `className`, which could not
 * reliably win depending on compiled stylesheet order. Every existing
 * caller omits this, so the panel renders at the exact same 552px as
 * before.
 */
export function Modal({
  title,
  titleId,
  children,
  footer,
  onCancel,
  bodyClassName = "",
  className = "",
  maxWidthClass = "max-w-[552px]",
}) {
  const panelRef = useRef(null);
  const resolvedTitleId = titleId || "modal-title";

  useDialogFocusTrap(panelRef, onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? resolvedTitleId : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClass} mx-4 bg-base-100 shadow-lg flex flex-col max-h-[calc(100vh-2rem)] outline-none ${className}`}
        style={{ borderRadius: "var(--radius-modal)" }}
      >
        {title && (
          <div className="px-6 pt-6 shrink-0">
            <h2 id={resolvedTitleId} className="text-base font-bold text-base-content">
              {title}
            </h2>
          </div>
        )}

        <div className={`px-6 py-5 overflow-y-auto ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="flex items-center justify-between border-t border-base-300 px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
