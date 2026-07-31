import { useEffect } from "react";
import { Button } from "./Button";

// Focus target id for the confirm button — Button is a plain function
// component (no forwardRef), so a real React ref can't attach to its
// rendered <button>. Button does spread arbitrary props (including `id`)
// onto that <button>, so focusing via document.getElementById is the
// reliable path here instead.
const CONFIRM_BUTTON_ID = "confirm-dialog-confirm-btn";

/**
 * ConfirmDialog — generic, reusable confirmation modal. Reuses the exact
 * hand-rolled overlay recipe already established by CreateRequestLauncher
 * (fixed inset-0 z-50 flex items-center justify-center p-4 wrapper +
 * absolute inset-0 bg-black/40 click-to-cancel backdrop + relative
 * max-w bg-base-100 border border-base-300 rounded-box shadow-lg panel) —
 * no new modal library, per instruction. This is the first place that
 * pattern is extracted into its own component, since Archive (and any
 * future confirm-style action) needs the same shape without repeating a
 * whole CreateRequestLauncher-style multi-step form.
 *
 * Accessibility: role="dialog" + aria-modal + aria-labelledby/aria-describedby
 * wired to the title/body. Lightweight focus handling (not a full DOM focus
 * trap, since no existing dialog in this prototype implements one either):
 * on mount, focus moves to the confirm button; Escape triggers onCancel.
 * This is the closest reasonable approximation to "traps focus if the
 * existing dialog supports it" for a codebase with no proper trap yet.
 */
export function ConfirmDialog({
  title,
  body,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    document.getElementById(CONFIRM_BUTTON_ID)?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div
        className="relative w-full max-w-md bg-base-100 border border-base-300 rounded-box shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-body"
      >
        <div className="p-5">
          <h2 id="confirm-dialog-title" className="text-base font-bold text-base-content">
            {title}
          </h2>
          <p id="confirm-dialog-body" className="text-sm text-base-content/60 mt-2">
            {body}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-base-300 px-5 py-4">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button id={CONFIRM_BUTTON_ID} variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
