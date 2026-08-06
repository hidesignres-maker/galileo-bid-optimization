import { Modal } from "./Modal";
import { Button } from "./Button";

/**
 * ConfirmDialog — generic, reusable confirmation modal (Archive, and any
 * future confirm-style action). Renders through the shared `Modal`
 * primitive (ui/Modal.jsx) — 552px width, 16px radius, content-driven
 * height, no visible close icon, footer-driven dismissal, real focus
 * trap, Escape-to-cancel — instead of its own hand-rolled overlay markup
 * (which is what this component originally extracted that markup from,
 * before Modal existed as its own primitive).
 *
 * `confirmVariant` (default `"primary"`) passes straight through to the
 * confirm Button's `variant` — e.g. `"destructive"` for Archive (Default/
 * Destructive group, resolves through the `--color-destructive` token,
 * see Button.jsx). Cancel always renders Ghost/Neutral (`variant="ghost"`)
 * — plain neutral text, never red, regardless of how destructive the
 * confirm action is; only the confirm button carries the destructive
 * treatment.
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
  return (
    <Modal
      title={title}
      onCancel={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-base-content/60">{body}</p>
    </Modal>
  );
}
