import { Button } from "../ui/Button";

/**
 * ReviewFooter — the Review step's final action row: Back, then Discard,
 * then the primary action right-aligned. This replaces the generic wizard
 * footer only on the Review & Create step (ManualRequestWizard suppresses
 * its own footer there) — every other step keeps the existing shared
 * footer unchanged.
 *
 * All handlers are passed straight through from ManualRequestWizard (via
 * ManualReviewStep) — this component owns no state and makes no decisions
 * about what those actions do.
 *
 * `primaryLabel` (default "Create Request") — optional, backward
 * compatible. ManualReviewStep passes "Save changes" here in edit mode;
 * every existing create-mode call site omits it and renders exactly as
 * before. The handler prop name (`onCreateRequest`) is intentionally left
 * unchanged rather than renamed — ManualReviewStep already decides which
 * real handler (create vs. save) to pass into it, so this component itself
 * doesn't need to know or care which mode produced the label/handler pair.
 */
export function ReviewFooter({ showBack = true, onBack, onDiscard, onCreateRequest, primaryLabel = "Create Request" }) {
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
        {primaryLabel}
      </Button>
    </div>
  );
}
