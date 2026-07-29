import { Button } from "../ui/Button";

/**
 * ReviewFooter — the Review step's final action row: Back, then Discard,
 * then Create Request right-aligned. This replaces the generic wizard
 * footer only on the Review & Create step (ManualRequestWizard suppresses
 * its own footer there) — every other step keeps the existing shared
 * footer unchanged.
 *
 * All three handlers are passed straight through from ManualRequestWizard
 * (handleBack / onCancel / handleCreateRequest) — this component owns no
 * state and makes no decisions about what those actions do.
 *
 * Create Request uses the standard primary (blue) Button variant, not
 * the previous success/green variant — visual-only change, same
 * onClick={onCreateRequest} handler as before.
 */
export function ReviewFooter({ showBack = true, onBack, onDiscard, onCreateRequest }) {
  return (
    <div className="flex items-center justify-between border-t border-base-300 pt-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        <Button variant="text" className="text-error" onClick={onDiscard}>
          Discard
        </Button>
      </div>
      <Button variant="primary" onClick={onCreateRequest}>
        Create Request
      </Button>
    </div>
  );
}
